# Opportra Backend Development Guide (Agentic Architecture)

## Overview
This document defines the backend architecture, implementation plan, and agentic workflow for **Opportra (Opportunity Gap Agent)**. The system is designed to meet hackathon requirements by implementing a **next-generation autonomous AI agent** using Gemini, asynchronous workflows, and Google Cloud infrastructure.

The backend will:
- Process user profiles
- Collect opportunities from multiple sources
- Perform AI-based matching and reasoning
- Operate asynchronously as an agent
- Maintain persistent state

---

## Architecture Summary

### System Flow

Frontend → FastAPI Backend → Agent Orchestrator
↓
------------------------------------------------
| Gemini API (Reasoning Engine) |
| Scraping Agents (Data Collection) |
| Firestore (Memory / Persistence) |
| Background Tasks (Async Execution) |
------------------------------------------------


---

## Core Requirements Mapping

| Hackathon Requirement | Implementation |
|----------------------|---------------|
| Gemini 3.5+ | Matching + reasoning engine |
| Agent behavior | Background scraping + processing |
| Async workflows | BackgroundTasks / scheduler |
| Cloud usage | Cloud Run + Firestore |
| Memory | Firestore collections |
| Real workflow | Scrape → Process → Match → Serve |

---

## Tech Stack

- Backend Framework: FastAPI
- AI Model: Gemini 1.5 Flash (or 3.5 if available)
- Database: Firestore
- Cloud: Google Cloud Run
- Scraping: Requests + BeautifulSoup
- Agent Layer: Custom orchestration (lightweight)

---

## Project Structure


backend/
│
├── main.py
├── routes/
│ ├── match.py
│ ├── agent.py
│
├── services/
│ ├── gemini_service.py
│ ├── scraping_service.py
│ ├── matching_service.py
│ ├── firestore_service.py
│
├── models/
│ └── schemas.py
│
├── data/
│ └── opportunities.json
│
├── utils/
│ └── logger.py


---

## Environment Setup

```bash
python -m venv venv
source venv/bin/activate

pip install fastapi uvicorn requests beautifulsoup4 \
google-cloud-firestore google-generativeai
Core Modules
1. Gemini Service

Handles scoring and reasoning.

import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_match(user, opportunity):
    prompt = f"""
    User:
    Skills: {user['skills']}
    Education: {user['education']}

    Opportunity:
    Title: {opportunity['title']}
    Description: {opportunity['description']}

    Task:
    Return JSON:
    {{
        "score": int,
        "reason": "short explanation"
    }}
    """

    response = model.generate_content(prompt)
    return response.text
2. Scraping Service

Collects opportunities from:

Devpost
Unstop
MLH
def scrape_devpost():
    # basic scraping logic
    return []

def scrape_unstop():
    return []

def scrape_mlh():
    return []

def run_all_scrapers():
    return scrape_devpost() + scrape_unstop() + scrape_mlh()
3. Matching Service
from services.gemini_service import generate_match

def match_all(user, opportunities):
    results = []
    for opp in opportunities:
        match = generate_match(user, opp)
        results.append({**opp, "match": match})
    return results
4. Firestore Service (Memory)
from google.cloud import firestore

db = firestore.Client()

def save_user(user):
    db.collection("users").add(user)

def save_opportunities(data):
    for opp in data:
        db.collection("opportunities").add(opp)
API Endpoints
POST /match-all

Matches user profile with opportunities.

Request

{
  "name": "Yasir",
  "skills": ["Python", "AI"],
  "education": "BSCS"
}

Response

[
  {
    "title": "AI Hackathon",
    "score": 85,
    "reason": "You match because..."
  }
]
GET /run-agent

Triggers agent workflow asynchronously.

from fastapi import BackgroundTasks

@router.get("/run-agent")
def run_agent(background_tasks: BackgroundTasks):
    background_tasks.add_task(execute_agent)
    return {"status": "Agent running"}
Agent Workflow (Core Logic)
def execute_agent():
    # Step 1: Scrape
    opportunities = run_all_scrapers()

    # Step 2: Store
    save_opportunities(opportunities)

    # Step 3: Log
    print("Agent completed cycle")
Async Execution Strategy
Use FastAPI BackgroundTasks for MVP
Optionally extend with:
Google Cloud Scheduler
Pub/Sub
Security (Basic Guardrails)
Limit input size
Sanitize user inputs
Avoid raw prompt injection
if len(user["skills"]) > 10:
    user["skills"] = user["skills"][:10]
Logging & Observability
def log_event(message):
    print(f"[LOG]: {message}")

Track:

agent runs
matching requests
errors
Deployment (Google Cloud Run)
gcloud init
gcloud run deploy opportra-backend --source .

Ensure:

Service runs successfully
Logs visible in console
Demo Requirements Coverage

During demo, show:

Backend running on Cloud Run
Trigger /run-agent
Data updated
/match-all returning AI results
Logs in console
Constraints & Scope Notes
Do NOT build complex multi-agent infra
Keep scraping limited (10–20 items)
Focus on working pipeline
Prioritize demo clarity over scale
Final Outcome

By completing this backend:

You demonstrate a real agentic workflow
You satisfy Gemini + Cloud requirements
You show async execution
You deliver a working AI system, not a chatbot
Next Steps (Optional Enhancements)
Add caching layer
Improve scoring normalization
Add user history tracking
Add retry logic for agent


