# Technical Specification: Opportra (NextLane AI)

## 1. Executive Summary
Opportra is an autonomous AI agent system designed to bridge the opportunity gap for students and developers. It continuously scrapes, indexes, and normalizes high-value opportunities (Internships, Scholarships, Hackathons, Research residencies) across diverse platforms (Devpost, Unstop, MLH, Scholarships portals, Tech Job Shortlists) and uses Google Gemini to generate intelligent match scores and detailed reasoning customized to individual student profiles. The platform seamlessly integrates an existing React/Vite/TypeScript frontend (hosted via an Express gateway on port 5000) with a high-performance FastAPI backend (on port 8000) backed by Firestore / in-memory resilient storage.

## 2. System Architecture & Port Mapping
- **Frontend / Gateway (Express + Vite)**: Running on `http://localhost:5000`. Serves UI, handles local auth/session state, and reverse-proxies `/api/opportra/*` requests to the FastAPI backend.
- **FastAPI AI Agent Backend**: Running on `http://localhost:8000`. Exposes `/match-all`, `/run-agent`, `/opportunities`, `/health`, and interacts with Gemini 1.5/2.0 API, scraper pipelines, and Firestore state.
- **AI Engine**: Google Gemini API via `google-generativeai` with structured JSON prompting and robust fallback heuristics.
- **Persistence / State**: Firestore with automated fallback to in-memory / local JSON store for frictionless local execution and zero-credential demos.

## 3. Data Ingestion & Scraping Strategy
The backend scraper agent runs asynchronously (`BackgroundTasks`) collecting opportunities across multiple domains:
1. **Hackathons & Residencies**: Devpost, MLH, Unstop
2. **Scholarships & Grants**: Global scholarship directories, Foundation listings, WeMakeScholars/Scholarships feeds
3. **Internships & Tech Jobs**: Tech career listings, student internships & fellowship portals
4. **Resilient Fallback Seed Engine**: A comprehensive curated JSON corpus covering top internships, scholarships, hackathons, and research grants so that matching always succeeds even if third-party scrapers encounter anti-bot or network restrictions.

## 4. API Specification
- `POST /match-all`: Accepts `{ name, skills, education, interests, ... }` and returns an array of matched opportunities with Gemini-generated `matchScore`, `aiMatchReason`, `eligibilityBreakdown`, etc.
- `GET /run-agent`: Asynchronously executes scrapers and updates opportunity store.
- `GET /opportunities`: Retrieves all currently stored opportunities.
- `GET /health`: Health check status endpoint.

## 5. Environment Configuration
Detailed `.env.example` files provided in both `backend/` and `frontend/` with clear dummy values for `GEMINI_API_KEY`, `PORT`, `FIREBASE_CREDENTIALS`, etc.
