"""
routes/agent.py — NextLane AI
Agent route endpoints:
  POST /run-agent         — Trigger full agentic loop with user profile (background)
  POST /agent/plan        — Get Gemini-generated plan without executing (debug/demo)
  GET  /agent/status      — Current agent status and indexed opportunity count
"""
import asyncio
import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException, Body
from typing import Dict, Any, Optional

from models.schemas import UserProfileRequest, AgentPlanResponse, AgentExecutionResponse
from services.agent_orchestrator import run_agent_sync, agent_orchestrator
from services.gemini_service import gemini_service
from services.firestore_service import firestore_service
from utils.logger import log_event, log_error, log_agent_step

router = APIRouter(tags=["Agent Orchestration"])

# Shared in-memory state for agent status tracking
_agent_state: Dict[str, Any] = {
    "status": "idle",
    "last_run": None,
    "last_result": None,
    "runs_completed": 0,
}


# ── POST /run-agent ───────────────────────────────────────────────────────────

@router.post("/run-agent")
@router.get("/run-agent")
async def run_agent_endpoint(
    background_tasks: BackgroundTasks,
    profile: Optional[UserProfileRequest] = Body(default=None),
) -> Dict[str, Any]:
    """
    Triggers the full autonomous agent workflow.

    - Accepts an optional UserProfileRequest body for personalized planning.
    - If no body provided, runs a general discovery pass.
    - Executes asynchronously in a background task.
    - Returns immediately with a job-accepted response.

    The agent will:
    1. Use Gemini to plan which sources to query
    2. Execute scrapers in parallel via asyncio.gather()
    3. Store results to Firestore / local store
    4. Run batch async matching
    5. Log each step with [AGENT] prefix
    """
    global _agent_state

    # Build user profile dict
    if profile:
        user_dict = {
            "name": profile.get_effective_name(),
            "fullName": profile.get_effective_name(),
            "skills": profile.get_effective_skills(),
            "education": profile.get_effective_education(),
            "educationLevel": profile.get_effective_education(),
            "interests": profile.get_effective_interests(),
            "targetObjectives": profile.get_effective_interests(),
            "linkedInUrl": profile.linkedInUrl,
            "githubUrl": profile.githubUrl,
            "resumeFileName": profile.resumeFileName,
        }
    else:
        user_dict = {"name": "General", "skills": [], "interests": []}

    # Persist user if real profile provided
    if profile and profile.get_effective_name() != "Student":
        firestore_service.save_user(user_dict)

    # Update state to running
    _agent_state["status"] = "running"
    _agent_state["last_run"] = datetime.datetime.utcnow().isoformat() + "Z"

    def _bg_task():
        global _agent_state
        try:
            log_agent_step("background_task_start", f"user='{user_dict.get('name')}'")
            result = run_agent_sync(user_dict, force_rescrape=False)
            _agent_state["status"] = "idle"
            _agent_state["last_result"] = {
                "opportunities_scraped": result.get("opportunities_scraped", 0),
                "matched_count": result.get("matched_count", 0),
                "sources_used": result.get("sources_used", []),
                "duration_ms": result.get("duration_ms", 0),
                "plan_priority": result.get("plan", {}).get("priority", "all"),
            }
            _agent_state["runs_completed"] = _agent_state.get("runs_completed", 0) + 1
            log_agent_step("background_task_complete",
                           f"matched={result.get('matched_count', 0)}, "
                           f"duration={result.get('duration_ms', 0)}ms")
        except Exception as e:
            _agent_state["status"] = "error"
            log_error("agent_background_task", e)

    background_tasks.add_task(_bg_task)

    return {
        "status": "Agent running",
        "message": "Autonomous agent pipeline started in background.",
        "user": user_dict.get("name"),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── POST /agent/plan ─────────────────────────────────────────────────────────

@router.post("/agent/plan")
async def get_agent_plan(profile: UserProfileRequest) -> Dict[str, Any]:
    """
    Returns the Gemini-generated execution plan for a given user profile.
    Useful for debugging/demo — shows exactly what the agent would decide.

    Does NOT execute any scraping or matching.
    """
    try:
        user_dict = {
            "name": profile.get_effective_name(),
            "skills": profile.get_effective_skills(),
            "education": profile.get_effective_education(),
            "interests": profile.get_effective_interests(),
        }
        log_agent_step("plan_request", f"user='{user_dict['name']}'")
        plan = gemini_service.generate_agent_plan(user_dict)
        return {
            "status": "plan_generated",
            "user": user_dict["name"],
            "plan": plan,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }
    except Exception as e:
        log_error("route_agent_plan", e)
        raise HTTPException(status_code=500, detail=f"Plan generation failed: {str(e)}")


# ── GET /agent/status ─────────────────────────────────────────────────────────

@router.get("/agent/status")
def get_agent_status() -> Dict[str, Any]:
    """Returns current agent status, last run metadata, and indexed opportunity count."""
    opps = firestore_service.get_all_opportunities()
    return {
        "status": _agent_state.get("status", "idle"),
        "indexedOpportunities": len(opps),
        "lastRun": _agent_state.get("last_run"),
        "runsCompleted": _agent_state.get("runs_completed", 0),
        "lastResult": _agent_state.get("last_result"),
        "checkedAt": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── POST /agent/deadline-reminders ───────────────────────────────────────────

@router.post("/agent/deadline-reminders")
async def evaluate_deadline_reminders(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Evaluates opportunities with <24h remaining deadlines for a given user.
    Returns flagged opportunities ready for automated reminder notification.
    """
    opps = firestore_service.get_all_opportunities()
    applied_ids = set(payload.get("appliedIds", []))
    user_skills = [s.lower() for s in payload.get("skills", [])]

    urgent_flagged = []
    for opp in opps:
        if opp.get("id") in applied_ids:
            continue
        deadline_str = opp.get("deadline", "").lower()
        is_urgent = opp.get("urgent24h", False) or "closing" in deadline_str or "tomorrow" in deadline_str or "<24h" in deadline_str

        if is_urgent:
            urgent_flagged.append({
                "id": opp.get("id"),
                "title": opp.get("title"),
                "organization": opp.get("organization"),
                "deadline": opp.get("deadline"),
                "url": opp.get("url"),
                "type": opp.get("type"),
                "urgent24h": True
            })

    return {
        "success": True,
        "urgentOpportunitiesCount": len(urgent_flagged),
        "urgentOpportunities": urgent_flagged,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

