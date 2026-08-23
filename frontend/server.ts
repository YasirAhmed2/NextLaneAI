import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// In-memory data store for users, verification codes, and password reset tokens
interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  isVerified: boolean;
  profileComplete: boolean;
  createdAt: string;
  profile?: {
    fullName: string;
    educationLevel: string;
    skills: string[];
    targetObjectives: string[];
    linkedInUrl?: string;
    githubUrl?: string;
    resumeFileName?: string;
    resumeFileSize?: number;
    resumeUploadedAt?: string;
  };
}

interface OtpRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

const users = new Map<string, StoredUser>(); // email -> user
const usernameMap = new Map<string, string>(); // username (lowercase) -> email
const emailOtpStore = new Map<string, OtpRecord>(); // email -> OTP
const resetOtpStore = new Map<string, OtpRecord>(); // email -> OTP
const activeSessions = new Map<string, string>(); // token -> email

// Helper: Password Hashing
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ----------------- AUTHENTICATION API ROUTES ----------------- //

// 1. Register new user
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    const trimmedUsername = String(username).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    if (usernameMap.has(trimmedUsername.toLowerCase())) {
      return res.status(409).json({ error: "This username is already taken. Please choose another." });
    }

    if (users.has(normalizedEmail)) {
      const existing = users.get(normalizedEmail)!;
      if (existing.isVerified) {
        return res.status(409).json({ error: "An account with this email already exists. Please log in." });
      }
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const newUser: StoredUser = {
      id: `usr_${crypto.randomBytes(8).toString("hex")}`,
      username: trimmedUsername,
      email: normalizedEmail,
      passwordHash,
      passwordSalt: salt,
      isVerified: false,
      profileComplete: false,
      createdAt: new Date().toISOString(),
    };

    users.set(normalizedEmail, newUser);
    usernameMap.set(trimmedUsername.toLowerCase(), normalizedEmail);

    // Generate 6-digit OTP
    const otp = generateOtp();
    const now = Date.now();
    emailOtpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: now + 10 * 60 * 1000, // 10 minutes
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[NextLane Auth] Generated OTP for registration: ${normalizedEmail} -> [${otp}]`);

    return res.status(201).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      username: trimmedUsername,
      // For developer preview transparency, include delivery status
      devDeliveryStatus: "sent",
      devOtpHint: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// 2. Verify Email OTP
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedCode = String(code).trim();

    const user = users.get(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: "Account not found. Please register." });
    }

    const otpRecord = emailOtpStore.get(normalizedEmail);
    if (!otpRecord) {
      return res.status(400).json({ error: "No verification code was requested for this email." });
    }

    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: "Too many failed attempts. Please request a new code." });
    }

    if (otpRecord.code !== trimmedCode) {
      otpRecord.attempts += 1;
      return res.status(400).json({ error: "Invalid verification code. Please check and try again." });
    }

    // Mark verified
    user.isVerified = true;
    emailOtpStore.delete(normalizedEmail);

    // Create session token
    const token = `sess_${crypto.randomBytes(24).toString("hex")}`;
    activeSessions.set(token, normalizedEmail);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: true,
        profileComplete: user.profileComplete,
        profile: user.profile,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// 3. Resend OTP
app.post("/api/auth/resend-otp", (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose: 'registration' | 'reset'
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.get(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }

    const targetStore = purpose === "reset" ? resetOtpStore : emailOtpStore;
    const existing = targetStore.get(normalizedEmail);
    const now = Date.now();

    if (existing && now - existing.lastSentAt < 45000) {
      const waitSeconds = Math.ceil((45000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds}s before requesting another code.`,
        cooldownRemaining: waitSeconds,
      });
    }

    const otp = generateOtp();
    targetStore.set(normalizedEmail, {
      code: otp,
      expiresAt: now + 10 * 60 * 1000,
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[NextLane Auth] Resent OTP (${purpose || "verify"}): ${normalizedEmail} -> [${otp}]`);

    return res.json({
      success: true,
      message: `A fresh verification code was sent to ${normalizedEmail}`,
      devOtpHint: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to resend code." });
  }
});

// 4. Log in with Username and Password
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const trimmedInput = String(username).trim();
    // Allow login via username or email
    let email = usernameMap.get(trimmedInput.toLowerCase());
    if (!email && users.has(trimmedInput.toLowerCase())) {
      email = trimmedInput.toLowerCase();
    }

    if (!email || !users.has(email)) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = users.get(email)!;
    const computedHash = hashPassword(password, user.passwordSalt);

    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    if (!user.isVerified) {
      // Prompt OTP verification
      const otp = generateOtp();
      const now = Date.now();
      emailOtpStore.set(user.email, {
        code: otp,
        expiresAt: now + 10 * 60 * 1000,
        lastSentAt: now,
        attempts: 0,
      });

      console.log(`[NextLane Auth] Verification pending for login: ${user.email} -> [${otp}]`);

      return res.status(403).json({
        error: "Your email is not verified yet.",
        requiresVerification: true,
        email: user.email,
        devOtpHint: process.env.NODE_ENV !== "production" ? otp : undefined,
      });
    }

    const token = `sess_${crypto.randomBytes(24).toString("hex")}`;
    activeSessions.set(token, user.email);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: true,
        profileComplete: user.profileComplete,
        profile: user.profile,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// 5. Forgot Password - Step A: Request Reset Code
app.post("/api/auth/forgot-password/request", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please provide your email address." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.get(normalizedEmail);

    // Privacy-safe response: always return success message so emails aren't leaked
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, a reset code has been sent.",
      });
    }

    const otp = generateOtp();
    const now = Date.now();
    resetOtpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: now + 10 * 60 * 1000,
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[NextLane Auth] Forgot Password OTP: ${normalizedEmail} -> [${otp}]`);

    return res.json({
      success: true,
      message: `Password reset code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      devOtpHint: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to request password reset." });
  }
});

// 6. Forgot Password - Step B: Verify Reset Code
app.post("/api/auth/forgot-password/verify", (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and reset code are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedCode = String(code).trim();

    const record = resetOtpStore.get(normalizedEmail);
    if (!record) {
      return res.status(400).json({ error: "No password reset was requested for this email." });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new code." });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ error: "Too many failed attempts. Please request a fresh reset code." });
    }

    if (record.code !== trimmedCode) {
      record.attempts += 1;
      return res.status(400).json({ error: "Invalid reset code. Please try again." });
    }

    // Return a temporary reset ticket
    const resetTicket = `rst_${crypto.randomBytes(16).toString("hex")}`;
    return res.json({
      success: true,
      message: "Code verified successfully.",
      resetTicket,
    });
  } catch (err) {
    return res.status(500).json({ error: "Verification failed." });
  }
});

// 7. Forgot Password - Step C: Set New Password
app.post("/api/auth/forgot-password/reset", (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, code, and new password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.get(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }

    const record = resetOtpStore.get(normalizedEmail);
    if (!record || record.code !== String(code).trim()) {
      return res.status(400).json({ error: "Invalid or expired reset session. Please start over." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    // Invalidate reset code
    resetOtpStore.delete(normalizedEmail);

    // Update password
    const newSalt = generateSalt();
    user.passwordSalt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);

    return res.json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

// 8. Session validation & current user
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ authenticated: false });
  }

  const token = authHeader.split(" ")[1];
  const email = activeSessions.get(token);
  if (!email || !users.has(email)) {
    return res.status(401).json({ authenticated: false });
  }

  const user = users.get(email)!;
  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      profileComplete: user.profileComplete,
      profile: user.profile,
    },
  });
});

// 9. Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true });
});

// 10. Update Profile & CV Metadata
app.post("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];
  const email = activeSessions.get(token);
  if (!email || !users.has(email)) {
    return res.status(401).json({ error: "Unauthorized session." });
  }

  const user = users.get(email)!;
  const { fullName, educationLevel, skills, targetObjectives, linkedInUrl, githubUrl, resumeFileName, resumeFileSize } = req.body;

  if (!fullName || !educationLevel || !skills || !targetObjectives) {
    return res.status(400).json({ error: "Mandatory profile fields (Name, Education, Skills, Interests) are required." });
  }

  user.profile = {
    fullName: String(fullName).trim(),
    educationLevel: String(educationLevel).trim(),
    skills: Array.isArray(skills) ? skills : [],
    targetObjectives: Array.isArray(targetObjectives) ? targetObjectives : [],
    linkedInUrl: linkedInUrl ? String(linkedInUrl).trim() : undefined,
    githubUrl: githubUrl ? String(githubUrl).trim() : undefined,
    resumeFileName: resumeFileName ? String(resumeFileName).trim() : undefined,
    resumeFileSize: typeof resumeFileSize === "number" ? resumeFileSize : undefined,
    resumeUploadedAt: resumeFileName ? new Date().toISOString() : undefined,
  };
  user.profileComplete = true;

  return res.json({
    success: true,
    profile: user.profile,
  });
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ----------------- VITE MIDDLEWARE SETUP ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NextLane AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
