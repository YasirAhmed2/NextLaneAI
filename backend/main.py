import os
import asyncio
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from utils.logger import log_event, log_agent_step
from routes.match import router as match_router
from routes.agent import router as agent_router, _agent_state
from services.firestore_service import firestore_service
from services.scraping_service import scraping_service

# ── APScheduler — Autonomous 30-minute agent cycles ──────────────────────────
try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    _scheduler_available = True
except ImportError:
    _scheduler_available = False
    log_event("scheduler", "APScheduler not installed — autonomous cycles disabled. Run: pip install apscheduler")

scheduler = AsyncIOScheduler() if _scheduler_available else None


async def periodic_agent_cycle():
    """
    Autonomous background scraping cycle — runs every 30 minutes without any user interaction.
    This is what makes NextLane AI a TRUE autonomous agent, not just a user-triggered tool.

    Scrapes all 8 sources, deduplicates, stores to Firestore/local, and updates state.
    Does NOT run Gemini matching (that's user-specific) — only updates the opportunity pool.
    """
    from services.agent_orchestrator import AgentOrchestrator

    log_agent_step("scheduled_cycle_triggered", "Autonomous 30-min cycle starting...")
    _agent_state["status"] = "running (scheduled)"

    try:
        orchestrator = AgentOrchestrator()
        # Use a discovery profile — triggers full scrape of all sources
        discovery_profile = {
            "name": "AutoDiscovery",
            "fullName": "Autonomous Discovery Agent",
            "email": "",
            "skills": ["Python", "JavaScript", "AI", "Machine Learning", "Web Development"],
            "interests": ["Hackathon", "Internship", "Scholarship", "Fellowship"],
            "education": "University Student",
            "educationLevel": "Undergraduate",
        }
        result = await orchestrator.execute_agent(
            discovery_profile,
            force_rescrape=True,   # Always rescrape on scheduled runs for freshness
            context="scheduled",
        )

        # Update shared state
        _agent_state["status"] = "idle"
        _agent_state["scheduled_runs"] = _agent_state.get("scheduled_runs", 0) + 1
        _agent_state["last_scheduled_run"] = result.get("timestamp")
        _agent_state["last_steps_log"] = result.get("steps_log", [])
        _agent_state["last_timing"] = result.get("timing", {})
        _agent_state["last_trace"] = {
            "user": "AutoDiscovery (Scheduled)",
            "context": "scheduled",
            "timestamp": result.get("timestamp"),
            "duration_ms": result.get("duration_ms", 0),
            "opportunities_scraped": result.get("opportunities_scraped", 0),
            "sources_used": result.get("sources_used", []),
        }

        log_agent_step(
            "scheduled_cycle_complete",
            f"Found {result.get('opportunities_scraped', 0)} opportunities in {result.get('duration_ms', 0)}ms | "
            f"total_scheduled_runs={_agent_state['scheduled_runs']}"
        )

    except Exception as e:
        _agent_state["status"] = "idle"
        from utils.logger import log_error
        log_error("scheduled_cycle_error", e)
        log_agent_step("scheduled_cycle_error", f"Autonomous cycle failed: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan handler — starts scheduler and preloads opportunities."""
    log_agent_step("startup", "NextLane AI Agent System initializing...")

    # ── Preload opportunities from store/seed if empty ────────────────────────
    existing = firestore_service.get_all_opportunities()
    if not existing:
        log_agent_step("startup_scrape", "Empty catalog detected — ingesting initial opportunities")
        loop = asyncio.get_event_loop()
        scraped = await loop.run_in_executor(None, scraping_service.run_all_scrapers)
        firestore_service.save_opportunities(scraped)

    total = len(firestore_service.get_all_opportunities())
    log_agent_step("startup_complete", f"NextLane AI online — {total} indexed opportunities ready")

    # ── Start Autonomous Scheduler ────────────────────────────────────────────
    if scheduler and _scheduler_available:
        scheduler.add_job(
            periodic_agent_cycle,
            trigger=IntervalTrigger(minutes=30),
            id="autonomous_scrape_cycle",
            name="NextLane AI — Autonomous 30-min Scraping Cycle",
            replace_existing=True,
            max_instances=1,  # Prevent overlap
            misfire_grace_time=120,  # Allow up to 2min late start
        )
        scheduler.start()
        log_agent_step(
            "scheduler_started",
            "Autonomous agent scheduler active — scraping every 30 minutes"
        )
    else:
        log_agent_step(
            "scheduler_unavailable",
            "APScheduler not available — install with: pip install apscheduler"
        )

    yield  # Application runs here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        log_agent_step("scheduler_stopped", "Autonomous scheduler stopped")

    log_agent_step("shutdown", "NextLane AI Agent System shutting down.")


app = FastAPI(
    title="NextLane AI — Autonomous Opportunity Gap Agent",
    description=(
        "Gemini-powered autonomous agent with agentic planning, "
        "multi-source real-time scraping (Devpost, Unstop, MLH, LinkedIn, RemoteOK, Scholarships360), "
        "async batch matching, proactive email alerts, and Firestore persistence. "
        "Runs autonomously every 30 minutes via APScheduler."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000,http://127.0.0.1:3000"
)
allowed_origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
# Mount under both root and /api prefix for full client compatibility
app.include_router(match_router)
app.include_router(agent_router)
app.include_router(match_router, prefix="/api")
app.include_router(agent_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "NextLane AI — Autonomous Opportunity Gap Agent",
        "version": "2.0.0",
        "sdk": "google-genai",
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "status": "online",
        "autonomous": True,
        "schedulerActive": scheduler.running if scheduler else False,
        "endpoints": {
            "match_all": "POST /match-all",
            "run_agent": "POST /run-agent",
            "run_with_goal": "POST /agent/run-with-goal",
            "analyze_missed": "POST /agent/analyze-missed",
            "feedback": "POST /agent/feedback",
            "agent_plan": "POST /agent/plan",
            "agent_status": "GET /agent/status",
            "agent_trace": "GET /agent/trace",
            "scheduler_status": "GET /agent/scheduler-status",
            "deadline_reminders": "POST /agent/deadline-reminders",
            "tailor_cv": "POST /agent/tailor-cv",
            "generate_letter": "POST /agent/generate-letter",
            "opportunities": "GET /opportunities",
            "health": "GET /health",
            "docs": "GET /docs",
        },
    }


@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "nextlane-ai-backend",
        "version": "2.0.0",
        "sdk": "google-genai",
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "autonomous": True,
        "schedulerRunning": scheduler.running if scheduler else False,
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    log_event("server", f"Starting server on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
