import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from utils.logger import log_event
from routes.match import router as match_router
from routes.agent import router as agent_router
from services.firestore_service import firestore_service
from services.scraping_service import scraping_service

app = FastAPI(
    title="Opportra Autonomous Opportunity Agent Backend",
    description="Gemini-powered Opportunity Gap Agent with multi-source background scraping and Firestore persistence.",
    version="1.0.0"
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000,http://127.0.0.1:3000")
allowed_origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes under root and /api prefixes for maximum client compatibility
app.include_router(match_router)
app.include_router(agent_router)
app.include_router(match_router, prefix="/api")
app.include_router(agent_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    log_event("startup", "Opportra Agent System initializing...")
    # Preload opportunities from seed/scrapers if store is empty
    existing = firestore_service.get_all_opportunities()
    if not existing:
        log_event("startup", "Empty catalog detected. Ingesting initial opportunities...")
        scraped = scraping_service.run_all_scrapers()
        firestore_service.save_opportunities(scraped)
    log_event("startup", f"Opportra Agent online with {len(firestore_service.get_all_opportunities())} indexed opportunities.")

@app.get("/")
def root():
    return {
        "service": "Opportra Autonomous AI Agent",
        "status": "online",
        "endpoints": {
            "match_all": "POST /match-all",
            "run_agent": "GET /run-agent",
            "opportunities": "GET /opportunities",
            "health": "GET /health"
        }
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "opportra-backend"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    log_event("server", f"Starting server on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
