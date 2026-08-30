# Complete Production Deployment Guide — NextLane AI on Google Cloud (Free Tier)

This guide provides the complete, step-by-step procedure to deploy the entire **NextLane AI** application (FastAPI backend + Vite React frontend + Autonomous AI Agent pipeline) live on **Google Cloud Platform (GCP)** at **100% Zero Cost** using the GCP Always Free Tier.

---

## 🏗️ Architecture & Free Tier Breakdown

| Component | Platform / Service | Free Tier Limit | Cost |
| :--- | :--- | :--- | :--- |
| **Backend API & AI Agent** | **Google Cloud Run** (Fully Managed Serverless Container) | 2,000,000 requests/month<br>180,000 vCPU-seconds/month<br>360,000 GB-seconds memory/month | **$0.00 / month** |
| **Container Registry** | **GCP Artifact Registry** | 0.5 GB storage/month | **$0.00 / month** |
| **Build Automation** | **Google Cloud Build** | 120 build-minutes / day | **$0.00 / month** |
| **Database & Cache** | **Google Cloud Firestore** (Native Mode) | 1 GB storage, 50,000 reads/day, 20,000 writes/day | **$0.00 / month** |
| **Frontend UI** | **Vercel / Firebase Hosting** | Unlimited static sites, 100 GB bandwidth/month | **$0.00 / month** |
| **AI Intelligence** | **Google Gemini API** (via `google-genai` SDK) | Free Tier Rate Limits (60 RPM for Gemini Flash) | **$0.00 / month** |

---

## 📋 Prerequisites

Before starting, ensure you have:
1. A **Google Cloud Account** (Includes \$300 free trial credits + permanent Always Free Tier access).
2. The **Google Cloud SDK (`gcloud` CLI)** installed on your machine. ([Download gcloud](https://cloud.google.com/sdk/docs/install))
3. Your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Step 1: Initialize GCP Project & Enable APIs

Open your terminal or PowerShell and run:

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Create a new Google Cloud Project (replace with your unique project ID)
gcloud projects create nextlane-ai-prod --name="NextLane AI Production"

# 3. Set the active project
gcloud config set project nextlane-ai-prod

# 4. Enable required Google Cloud APIs for Cloud Run, Firestore, and Cloud Build
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com
```

---

## 🗄️ Step 2: Initialize Firestore Database (Free Mode)

Create a Firestore database instance in Native Mode:

```bash
gcloud firestore databases create --location=us-central1 --type=firestore-native
```

---

## 🐍 Step 3: Deploy FastAPI Backend to Google Cloud Run

NextLane AI's backend contains a optimized production Dockerfile (`backend/Dockerfile`).

### Navigate to backend directory:
```bash
cd backend
```

### Deploy to Cloud Run with 1 command (Source-based Build):
```bash
gcloud run deploy nextlane-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE,GEMINI_MODEL=gemini-2.5-flash,ALLOWED_ORIGINS=*"
```

> [!TIP]
> Setting `--min-instances 0` ensures your Cloud Run service scales to 0 when idle so you consume **0 billing credits** when no users are visiting!

Once deployment completes, Cloud Run will output your live HTTPS backend Service URL:
```text
Service [nextlane-backend] revision [nextlane-backend-00001] has been deployed.
Service URL: https://nextlane-backend-xyz123-uc.a.run.app
```

---

## 🌐 Step 4: Deploy React Frontend to Vercel / Firebase

### Method A: Vercel Deployment (Recommended — Easiest)

1. Open terminal in the `frontend` folder:
   ```bash
   cd ../frontend
   ```

2. Deploy using `npx vercel`:
   ```bash
   npx vercel --prod
   ```

3. When prompted for environment variables, add:
   - `VITE_OPPORTRA_BACKEND_URL` = `https://nextlane-backend-xyz123-uc.a.run.app` (your Cloud Run URL from Step 3).

### Method B: Firebase Hosting (Alternative GCP Native)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login & initialize in frontend dir
firebase login
firebase init hosting

# Select "dist" as public folder and configure as a single-page app (SPA)

# 3. Build frontend with your Cloud Run backend URL
# In frontend/.env.production:
# VITE_OPPORTRA_BACKEND_URL=https://nextlane-backend-xyz123-uc.a.run.app

npm run build
firebase deploy --only hosting
```

---

## 🔐 Step 5: Secure CORS & Environment Variables

Now that your frontend is live (e.g. `https://nextlane-ai.vercel.app`), update your Cloud Run backend CORS allowed origins to restrict API access securely to your official domain:

```bash
gcloud run services update nextlane-backend \
  --region us-central1 \
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE,GEMINI_MODEL=gemini-2.5-flash,ALLOWED_ORIGINS=https://nextlane-ai.vercel.app,http://localhost:5000,http://localhost:3000"
```

---

## 🔍 Step 6: End-to-End Verification Checklist

Verify all services are fully functional live in production:

1. **Backend Health Check**:
   Visit `https://nextlane-backend-xyz123-uc.a.run.app/health` in your browser.
   Output should be:
   ```json
   {
     "status": "healthy",
     "service": "nextlane-ai-backend",
     "version": "2.0.0",
     "autonomous": true,
     "schedulerRunning": true
   }
   ```

2. **Test 24-Hour Urgent Deadline Alert Popup**:
   Open your live frontend web app. The sentry alert popup should automatically highlight active opportunities closing in $< 24\text{ hours}$.

3. **Test Auto-Apply AI Agent**:
   Click **"⚡ Auto-Apply with AI Agent"** on any opportunity card. Watch the 4-step autonomous execution sequence complete live and issue a verified confirmation receipt code.

4. **Verify Requirement Filtering**:
   - Inspect a **Hackathon** or **Internship**: Confirm NO IELTS or CGPA requirements appear.
   - Inspect a **Scholarship**: Confirm CGPA and IELTS requirements appear correctly.

---

## 🎉 Summary

Your NextLane AI system is now live, autonomous, secure, and running on **Google Cloud Platform at $0.00 cost**!
