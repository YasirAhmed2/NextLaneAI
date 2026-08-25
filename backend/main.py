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
from routes.agent import router as agent_router
from services.firestore_service import firestore_service
from services.scraping_service import scraping_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan handler — replaces deprecated @app.on_event('startup')."""
    log_agent_step("startup", "NextLane AI Agent System initializing...")

    # Preload opportunities from store/seed if empty
    existing = firestore_service.get_all_opportunities()
    if not existing:
        log_agent_step("startup_scrape", "Empty catalog detected — ingesting initial opportunities")
        # Run scrapers async during startup for speed
        loop = asyncio.get_event_loop()
        scraped = await loop.run_in_executor(None, scraping_service.run_all_scrapers)
        firestore_service.save_opportunities(scraped)

    total = len(firestore_service.get_all_opportunities())
    log_agent_step("startup_complete", f"NextLane AI online — {total} indexed opportunities ready")

    yield  # Application runs here

    log_agent_step("shutdown", "NextLane AI Agent System shutting down.")


app = FastAPI(
    title="NextLane AI — Autonomous Opportunity Gap Agent",
    description=(
        "Gemini 2.5 Flash-powered autonomous agent with agentic planning, "
        "multi-source scraping (Devpost, Unstop, MLH, Scholarships), "
        "async batch matching, and Firestore persistence."
    ),
    version="2.0.0",
    lifespan=lifespan
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
        "endpoints": {
            "match_all": "POST /match-all",
            "run_agent": "POST /run-agent (accepts UserProfileRequest body)",
            "agent_plan": "POST /agent/plan",
            "agent_status": "GET /agent/status",
            "opportunities": "GET /opportunities",
            "health": "GET /health",
            "docs": "GET /docs",
        }
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
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    log_event("server", f"Starting server on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
