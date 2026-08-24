import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const OPPORTRA_BACKEND_URL = process.env.OPPORTRA_BACKEND_URL || "http://127.0.0.1:8000";

// Security & Email Configuration
const JWT_SECRET = process.env.JWT_SECRET || "7gwiQpkmXvc45F9N4j";
const EMAIL_USER = process.env.EMAIL_USER || "yasirahmed9921@gmail.com";
const EMAIL_PASS = (process.env.EMAIL_PASS || "xbww dzpr ftlu vozz").replace(/\s+/g, "");
const BREVO_API_KEY = process.env.BREVO_API_KEY || "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";

// 30 Minutes OTP Expiration
const OTP_EXPIRY_MS = 30 * 60 * 1000;

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

// Helper: Password Hashing using Salt + JWT_SECRET pepper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, `${salt}:${JWT_SECRET}`, 10000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ----------------- ENTERPRISE EMAIL DELIVERY ENGINE ----------------- //

function createEmailHtml(username: string, code: string, purpose: 'registration' | 'reset'): string {
  const isReset = purpose === 'reset';
  const actionTitle = isReset ? "Password Reset Verification" : "Account Verification";
  const actionDescription = isReset
    ? "We received a request to reset your NextLane AI account password. Please enter the one-time verification code below to authorize your password update:"
    : "Welcome to <strong>NextLane AI</strong>. To verify your email address and unlock AI-powered opportunity matching, fellowships, and scholarships, please enter your one-time verification code:";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actionTitle} • NextLane AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E6E6E6;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0b0e;
      padding: 40px 10px;
    }
    .email-container {
      max-width: 560px;
      margin: 0 auto;
      background: #141418;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid rgba(212, 175, 55, 0.35);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(180deg, #1c1c24 0%, #141418 100%);
      padding: 36px 24px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }
    .brand-pill {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.45);
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #D4AF37;
      margin-bottom: 12px;
    }
    .brand-name {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      margin: 6px 0 0;
      font-size: 13px;
      color: #A0A0AA;
    }
    .content {
      padding: 36px 30px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 14px;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.65;
      color: #B8B8C2;
      margin-bottom: 26px;
    }
    .otp-box {
      background: linear-gradient(180deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.05) 100%);
      border: 2px solid #D4AF37;
      border-radius: 14px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #D4AF37;
      margin-bottom: 10px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #FFFFFF;
      text-shadow: 0 0 16px rgba(212, 175, 55, 0.6);
      padding-left: 12px;
      margin: 4px 0;
    }
    .otp-expiry {
      display: inline-block;
      margin-top: 12px;
      padding: 5px 14px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #D4AF37;
    }
    .security-callout {
      background-color: rgba(255, 255, 255, 0.03);
      border-left: 3px solid #D4AF37;
      padding: 14px 16px;
      border-radius: 0 10px 10px 0;
      margin: 24px 0;
      font-size: 12px;
      line-height: 1.6;
      color: #9494A0;
    }
    .footer {
      background: #0f0f13;
      padding: 24px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #6C6C78;
    }
    .footer-links {
      margin-bottom: 8px;
    }
    .footer-links a {
      color: #D4AF37;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <div class="header">
        <div class="brand-pill">Autonomous Intelligence Engine</div>
        <h1 class="brand-name">NextLane <span style="color:#D4AF37;">AI</span></h1>
        <p class="brand-tagline">Opportunity Gap Discovery & Strategic Career Acceleration</p>
      </div>
      <div class="content">
        <div class="greeting">Hello ${username || 'Learner'},</div>
        <p class="body-text">${actionDescription}</p>

        <div class="otp-box">
          <div class="otp-title">Single-Use Verification Passcode</div>
          <div class="otp-code">${code}</div>
          <div class="otp-expiry">⏱️ Expires in 30 Minutes</div>
        </div>

        <div class="security-callout">
          <strong>Security Notice:</strong> This passcode is confidential and linked directly to your session. NextLane AI team members will never ask for your verification code. If you did not request this email, no action is required and your account remains safe.
        </div>
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="http://localhost:5000">NextLane AI Portal</a> •
          <a href="http://localhost:5000">Security Center</a> •
          <a href="http://localhost:5000">Contact Support</a>
        </div>
        <div>© 2026 NextLane AI Inc. All rights reserved.</div>
        <div style="margin-top: 4px;">Automated security notification sent to ${username}</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

async function sendOtpEmail(toEmail: string, username: string, code: string, purpose: 'registration' | 'reset' = 'registration'): Promise<boolean> {
  const isReset = purpose === 'reset';
  const subject = isReset
    ? "NextLane AI • Password Reset Code"
    : "NextLane AI • Account Verification Code";
  const html = createEmailHtml(username, code, purpose);
  const text = `Hello ${username},\n\nYour NextLane AI verification code is: ${code}\n\nThis code will expire in 30 minutes.\n\n© 2026 NextLane AI Inc.`;

  let sent = false;

  // Method 1: Try Nodemailer Gmail SMTP
  if (EMAIL_USER && EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"NextLane AI Security" <${EMAIL_USER}>`,
        to: toEmail,
        subject,
        text,
        html,
      });

      console.log(`[NextLane Mailer] Successfully dispatched OTP email to ${toEmail} via SMTP.`);
      sent = true;
      return true;
    } catch (smtpErr: any) {
      console.warn(`[NextLane Mailer] SMTP delivery attempt failed (${smtpErr.message}). Attempting Brevo HTTP fallback...`);
    }
  }

  // Method 2: Try Brevo REST API
  if (BREVO_API_KEY && !sent) {
    try {
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "NextLane AI", email: EMAIL_USER || "auth@nextlane.ai" },
          to: [{ email: toEmail, name: username }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (brevoRes.ok) {
        console.log(`[NextLane Mailer] Successfully dispatched OTP email to ${toEmail} via Brevo API.`);
        return true;
      } else {
        const errJson = await brevoRes.json();
        console.warn(`[NextLane Mailer] Brevo API error response:`, errJson);
      }
    } catch (brevoErr: any) {
      console.error(`[NextLane Mailer] Brevo API failure:`, brevoErr.message);
    }
  }

  console.log(`[NextLane Mailer] Processed OTP for ${toEmail}.`);
  return sent;
}

// ----------------- AUTHENTICATION API ROUTES ----------------- //

// 1. Register new user
app.post("/api/auth/register", async (req, res) => {
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

    // Generate 6-digit OTP with 30 minutes validity
    const otp = generateOtp();
    const now = Date.now();
    emailOtpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: now + OTP_EXPIRY_MS, // 30 minutes
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[NextLane Auth] Generated OTP for registration: ${normalizedEmail}`);

    // Send professional email to user
    await sendOtpEmail(normalizedEmail, trimmedUsername, otp, 'registration');

    return res.status(201).json({
      success: true,
      message: `A 30-minute verification code was sent to ${normalizedEmail}`,
      email: normalizedEmail,
      username: trimmedUsername,
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
      return res.status(400).json({ error: "Verification code has expired (30-minute validity exceeded). Please request a new code." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: "Too many failed attempts. Please request a new code." });
    }

    if (otpRecord.code !== trimmedCode) {
      otpRecord.attempts += 1;
      return res.status(400).json({ error: "Invalid verification code. Please check your email and try again." });
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
app.post("/api/auth/resend-otp", async (req, res) => {
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
      expiresAt: now + OTP_EXPIRY_MS, // 30 minutes
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[NextLane Auth] Resent OTP (${purpose || "verify"}): ${normalizedEmail}`);

    await sendOtpEmail(normalizedEmail, user.username, otp, purpose === 'reset' ? 'reset' : 'registration');

    return res.json({
      success: true,
      message: `A fresh verification code was sent to ${normalizedEmail} (valid for 30 minutes)`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to resend code." });
  }
});

// 4. Log in with Username and Password
app.post("/api/auth/login", async (req, res) => {
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
        expiresAt: now + OTP_EXPIRY_MS, // 30 minutes
        lastSentAt: now,
        attempts: 0,
      });

      console.log(`[NextLane Auth] Verification pending for login: ${user.email}`);

      await sendOtpEmail(user.email, user.username, otp, 'registration');

      return res.status(403).json({
        error: "Your email is not verified yet. A verification code has been dispatched to your email.",
        requiresVerification: true,
        email: user.email,
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
app.post("/api/auth/forgot-password/request", async (req, res) => {
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
      expiresAt: now + OTP_EXPIRY_MS, // 30 minutes
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[NextLane Auth] Forgot Password OTP: ${normalizedEmail}`);

    await sendOtpEmail(normalizedEmail, user.username, otp, 'reset');

    return res.json({
      success: true,
      message: `Password reset code sent to ${normalizedEmail} (valid for 30 minutes)`,
      email: normalizedEmail,
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
      return res.status(400).json({ error: "Reset code has expired (30-minute validity exceeded). Please request a new code." });
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

    // Update password using salt + JWT_SECRET
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

// ----------------- OPPORTRA FASTAPI AGENT PROXY ROUTES ----------------- //

// Forward match-all to FastAPI
app.post(["/api/match-all", "/api/opportra/match-all"], async (req, res) => {
  try {
    const fastApiResponse = await fetch(`${OPPORTRA_BACKEND_URL}/match-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await fastApiResponse.json();
    return res.status(fastApiResponse.status).json(data);
  } catch (err: any) {
    console.warn(`[Proxy Warning] FastAPI backend at ${OPPORTRA_BACKEND_URL} unreachable:`, err.message);
    return res.status(503).json({ error: "Opportra AI Agent Backend is currently starting or unreachable.", fallback: true });
  }
});

// Forward run-agent to FastAPI
app.all(["/api/run-agent", "/api/opportra/run-agent"], async (req, res) => {
  try {
    const fastApiResponse = await fetch(`${OPPORTRA_BACKEND_URL}/run-agent`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
    });
    const data = await fastApiResponse.json();
    return res.status(fastApiResponse.status).json(data);
  } catch (err: any) {
    console.warn(`[Proxy Warning] FastAPI backend at ${OPPORTRA_BACKEND_URL} unreachable:`, err.message);
    return res.json({ status: "Agent running", fallback: true });
  }
});

// Forward opportunities retrieval to FastAPI
app.get(["/api/opportunities", "/api/opportra/opportunities"], async (_req, res) => {
  try {
    const fastApiResponse = await fetch(`${OPPORTRA_BACKEND_URL}/opportunities`);
    const data = await fastApiResponse.json();
    return res.status(fastApiResponse.status).json(data);
  } catch (err: any) {
    return res.status(503).json({ error: "Unable to reach opportunities backend.", fallback: true });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    port: PORT,
    backendProxy: OPPORTRA_BACKEND_URL,
    emailConfigured: Boolean(EMAIL_USER && (EMAIL_PASS || BREVO_API_KEY)),
  });
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
