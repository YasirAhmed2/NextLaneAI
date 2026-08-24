import datetime
from fastapi import APIRouter, BackgroundTasks
from typing import Dict, Any
from services.scraping_service import scraping_service
from services.firestore_service import firestore_service
from utils.logger import log_event, log_error

router = APIRouter(tags=["Agent Orchestration"])

def execute_agent_cycle():
    """Background task: Scrapes all sources, parses listings, and updates persistent store."""
    try:
        log_event("agent_workflow", "Agent cycle initiated: starting autonomous scraping...")
        scraped = scraping_service.run_all_scrapers()
        saved_count = firestore_service.save_opportunities(scraped)
        log_event("agent_workflow", f"Agent cycle completed successfully. Updated {saved_count} opportunities.")
    except Exception as e:
        log_error("agent_workflow_error", e)

@router.get("/run-agent")
@router.post("/run-agent")
def run_agent_workflow(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Triggers the autonomous agent workflow asynchronously.
    Scrapes Devpost, MLH, Unstop, Scholarships, and Job Shortlists and updates Firestore/Storage.
    """
    background_tasks.add_task(execute_agent_cycle)
    return {
        "status": "Agent running",
        "message": "Background opportunity discovery & indexing pipeline started.",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@router.get("/agent/status")
def get_agent_status() -> Dict[str, Any]:
    """Returns current agent status and inventory count."""
    opps = firestore_service.get_all_opportunities()
    return {
        "status": "idle",
        "indexedOpportunities": len(opps),
        "lastChecked": datetime.datetime.utcnow().isoformat() + "Z"
    }
