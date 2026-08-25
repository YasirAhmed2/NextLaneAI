# NextLane AI — Autonomous Opportunity Gap Agent

> **🏆 All Things Agentic Hackathon Submission**  
> An autonomous AI agent that discovers, scores, and alerts students about internships, scholarships, and hackathons they're missing — before deadlines expire.

---

## What It Does

NextLane AI is a **truly autonomous agent** — not a chatbot, not a search engine. It runs on its own every 30 minutes, scrapes 8 real opportunity platforms, uses Gemini to intelligently plan and match, and proactively emails you before deadlines close.

```
Every 30 min → Gemini Plan → 8 Real Scrapers → Firestore → Gemini Batch Scoring → Email Alert
```

**No user interaction required after profile setup.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS SCHEDULER (APScheduler)           │
│                    Fires every 30 minutes — always on           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
      ┌───────────────▼──────────────┐
      │   FRONTEND (React + Vite)    │      User Profile Input
      │   Express Auth Gateway       │────► triggers manual run
      └───────────────┬──────────────┘
                      │ HTTP
      ┌───────────────▼──────────────────────────────────────┐
      │           FASTAPI BACKEND (Python 3.11)              │
      │                                                      │
      │  ┌─────────────────────────────────────────────┐    │
      │  │         AGENT ORCHESTRATOR                  │    │
      │  │                                             │    │
      │  │  [1] PLANNING                               │    │
      │  │      Gemini generates execution plan        │    │
      │  │      Decides which tools to run & why       │    │
      │  │                                             │    │
      │  │  [2] TOOL SELECTION                         │    │
      │  │      Validates plan → TOOL_REGISTRY         │    │
      │  │                                             │    │
      │  │  [3] ASYNC EXECUTION (asyncio.gather)       │    │
      │  │      ┌──────────────────────────────┐       │    │
      │  │      │  8 Real HTTP Scrapers         │       │    │
      │  │      │  • Devpost    • Unstop         │       │    │
      │  │      │  • MLH        • RemoteOK      │       │    │
      │  │      │  • LinkedIn   • Internee.pk   │       │    │
      │  │      │  • Opp.Corner • Scholarships  │       │    │
      │  │      └──────────────────────────────┘       │    │
      │  │                                             │    │
      │  │  [4] STORAGE                                │    │
      │  │      Firestore / Local JSON persistence     │    │
      │  │                                             │    │
      │  │  [5] BATCH MATCHING                         │    │
      │  │      Gemini scores every opportunity        │    │
      │  │      Async batches of 10 concurrently       │    │
      │  │                                             │    │
      │  │  [6] PROACTIVE ALERTING ← AUTONOMOUS        │    │
      │  │      Detect deadlines < 48h                 │    │
      │  │      Send HTML email via SMTP               │    │
      │  └─────────────────────────────────────────────┘    │
      └──────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **AI Planning & Matching** | Gemini 2.5 Flash via `google-genai` SDK |
| **Backend** | FastAPI 0.110+ + asyncio + BackgroundTasks |
| **Autonomous Scheduling** | APScheduler `AsyncIOScheduler` (30-min cycles) |
| **Scraping** | 8 real sources — BeautifulSoup + real HTTP via `requests` |
| **Storage** | Google Cloud Firestore (with resilient local JSON fallback) |
| **Email Alerts** | Python `smtplib` + HTML templates (Gmail SMTP SSL) |
| **Frontend** | React 18 + TypeScript + Vite |
| **Auth Gateway** | Express.js + JWT + Nodemailer (OTP verification) |
| **Deployment** | Google Cloud Run + Cloud Build |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API key ([free at Google AI Studio](https://aistudio.google.com/app/apikey))
- Gmail account with App Password ([setup guide](https://myaccount.google.com/apppasswords))

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY, EMAIL_USER, EMAIL_PASS

# 4. Start the backend
uvicorn main:app --reload --port 8000
```

The backend starts and immediately:
- Preloads opportunity catalog from store
- Starts the autonomous 30-minute scheduler
- Opens API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET, EMAIL_USER, EMAIL_PASS

# 3. Start the dev server
npm run dev
```

Frontend available at `http://localhost:5000`

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/run-agent` | POST | Trigger full autonomous agent cycle |
| `/agent/plan` | POST | Get Gemini plan without executing |
| `/agent/status` | GET | Agent status + opportunity count |
| `/agent/trace` | GET | Full execution log (demo proof point) |
| `/agent/scheduler-status` | GET | Autonomous scheduler health |
| `/agent/deadline-reminders` | POST | Check + email urgent deadline alerts |
| `/match-all` | POST | Batch match user profile against all opportunities |
| `/opportunities` | GET | All indexed opportunities |
| `/health` | GET | Health check |
| `/docs` | GET | Interactive API docs (Swagger) |

---

## Agent Workflow

```
1. User submits profile (name, skills, education, interests, email)
   OR
   Scheduler triggers autonomously every 30 minutes

2. Gemini 2.5 Flash generates execution plan:
   - Which scrapers to run (based on user interests)
   - Priority level (hackathon-first vs scholarship-first)
   - Reasoning for tool selection

3. Selected scrapers run in parallel (asyncio.gather):
   - Devpost    → Live hackathon listings
   - MLH        → Student hackathon events
   - Unstop     → Competitions & challenges
   - RemoteOK   → Real API — live remote jobs
   - LinkedIn   → Guest API — tech internships
   - Internee.pk → Pakistani virtual internships
   - Opp.Corner → International scholarships (live scrape)
   - Scholarships360 → STEM scholarship feed

4. Results stored in Firestore (or local JSON fallback)

5. Gemini batch-scores every opportunity against user profile:
   - matchScore (0-100)
   - aiMatchReason (personalized explanation)
   - insightBullets (key eligibility points)

6. AUTONOMOUS ACTION: Urgent deadline detection
   - Any deadline within 48 hours → HTML email alert sent
   - No user interaction needed

7. Ranked results returned with AI reasoning + action items
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | No | Model name (default: `gemini-2.5-flash`) |
| `EMAIL_USER` | For alerts | Gmail address for sending alerts |
| `EMAIL_PASS` | For alerts | Gmail App Password (16 chars) |
| `DASHBOARD_URL` | No | Frontend URL for email CTA links |
| `GOOGLE_APPLICATION_CREDENTIALS` | For Firestore | Path to GCP service account JSON |
| `GOOGLE_CLOUD_PROJECT` | For Firestore | GCP project ID |
| `JWT_SECRET` | ✅ Yes | Strong random string for JWT signing |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Must match backend JWT_SECRET |
| `EMAIL_USER` | For OTP | Gmail for OTP verification emails |
| `EMAIL_PASS` | For OTP | Gmail App Password |
| `OPPORTRA_BACKEND_URL` | No | Backend URL (default: `http://127.0.0.1:8000`) |

---

## Cloud Deployment (Google Cloud Run)

### One-time setup

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  firestore.googleapis.com secretmanager.googleapis.com

# 3. Store secrets in Secret Manager (recommended)
echo -n "your-gemini-key" | gcloud secrets create nextlane-gemini-key --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create nextlane-jwt-secret --data-file=-
echo -n "your-gmail" | gcloud secrets create nextlane-email-user --data-file=-
echo -n "your-app-password" | gcloud secrets create nextlane-email-pass --data-file=-
```

### Deploy

```bash
# Option A: Direct source deploy (simplest)
gcloud run deploy nextlane-ai-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi

# Option B: Via Cloud Build (CI/CD)
gcloud builds submit --config cloudbuild.yaml .
```

### Firestore Setup

```bash
# Create Firestore database (Native mode)
gcloud firestore databases create --region=us-central1

# Create Service Account
gcloud iam service-accounts create nextlane-ai-sa \
  --display-name="NextLane AI Service Account"

# Grant Firestore access
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:nextlane-ai-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Download key
gcloud iam service-accounts keys create backend/service-account-key.json \
  --iam-account=nextlane-ai-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

---

## Demo Script (90 Seconds)

| Time | Action | Talking Point |
|---|---|---|
| 0–10s | Show architecture diagram | "Autonomous agent that runs every 30 min — no user needed" |
| 10–25s | Fill profile form | "Student submits profile → agent takes over" |
| 25–45s | Show terminal with [AGENT] logs | "Watch Gemini plan, 8 scrapers fire in parallel, results stored" |
| 45–65s | Show ranked results dashboard | "Gemini scores each match with personalized reasoning" |
| 65–80s | Show email inbox with alert | "Agent detected a closing deadline — emailed automatically" |
| 80–90s | Show Cloud Run + Firestore console | "Deployed on GCP, persisting to Firestore in real-time" |

---

## Key Agent Proof Points (for judges)

```
GET /agent/trace      → shows every step the agent took with timing
GET /agent/scheduler-status → confirms autonomous 30-min cycles are active
POST /agent/deadline-reminders + email → proves proactive alerting works
```

---

## Project Structure

```
NextLane AI/
├── backend/
│   ├── main.py                        # FastAPI app + APScheduler
│   ├── requirements.txt
│   ├── Dockerfile                     # Cloud Run image
│   ├── .env.example                   # Environment template (no secrets)
│   ├── routes/
│   │   ├── agent.py                   # Agent endpoints incl. /trace
│   │   └── match.py                   # Matching endpoints
│   ├── services/
│   │   ├── agent_orchestrator.py      # 8-phase autonomous agent loop
│   │   ├── gemini_service.py          # Gemini planning + matching
│   │   ├── scraping_service.py        # 8 real HTTP scrapers
│   │   ├── matching_service.py        # Async batch scoring
│   │   ├── firestore_service.py       # Firestore + local fallback
│   │   └── notification_service.py   # SMTP email alerts (NEW)
│   ├── models/
│   │   └── schemas.py                 # Pydantic models
│   ├── utils/
│   │   ├── logger.py                  # Structured [AGENT] logging
│   │   └── retry.py                   # HTTP retry with backoff (NEW)
│   └── data/
│       └── seed_opportunities.json    # Baseline opportunity corpus
├── frontend/
│   ├── server.ts                      # Express auth + proxy gateway
│   └── src/                           # React 18 + TypeScript + Vite
├── cloudbuild.yaml                    # Cloud Build CI/CD pipeline
├── .gcloudignore                      # Cloud Run source exclusions
└── README.MD                          # This file
```

---

## License

MIT — Built for the All Things Agentic Hackathon, 2026.
