"""
routes/agent.py — NextLane AI
Agent route endpoints:
  POST /run-agent              — Trigger full agentic loop with user profile (background)
  POST /agent/plan             — Get Gemini-generated plan without executing (debug/demo)
  GET  /agent/status           — Current agent status and indexed opportunity count
  POST /agent/deadline-reminders — Evaluate + ACTUALLY SEND urgent deadline alerts
  GET  /agent/trace            — Full execution trace log for last agent run (demo proof)
  GET  /agent/scheduler-status — Autonomous scheduler health check
"""
import asyncio
import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException, Body
from typing import Dict, Any, Optional

from models.schemas import UserProfileRequest, AgentPlanResponse, AgentExecutionResponse
from services.agent_orchestrator import run_agent_sync, agent_orchestrator
from services.gemini_service import gemini_service
from services.firestore_service import firestore_service
from services.notification_service import notification_service
from utils.logger import log_event, log_error, log_agent_step

router = APIRouter(tags=["Agent Orchestration"])

# ── Shared in-memory state ────────────────────────────────────────────────────
# Thread-safe read; writes only happen from background thread (single writer pattern).
_agent_state: Dict[str, Any] = {
    "status": "idle",
    "last_run": None,
    "last_result": None,
    "runs_completed": 0,
    "last_trace": {},
    "last_steps_log": [],
    "last_timing": {},
    "scheduled_runs": 0,
    "last_scheduled_run": None,
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
    4. Run batch async Gemini matching
    5. Send proactive email alerts for urgent deadlines (if email in profile)
    6. Log each step with [AGENT] prefix
    """
    global _agent_state

    # Build user profile dict
    if profile:
        user_dict = {
            "name": profile.get_effective_name(),
            "fullName": profile.get_effective_name(),
            "email": getattr(profile, "email", "") or "",
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
        user_dict = {"name": "General", "skills": [], "interests": [], "email": ""}

    # Persist user if real profile provided
    if profile and profile.get_effective_name() != "Student":
        firestore_service.save_user(user_dict)

    # Update state to running
    _agent_state["status"] = "running"
    _agent_state["last_run"] = datetime.datetime.utcnow().isoformat() + "Z"

    def _bg_task():
        global _agent_state
        try:
            log_agent_step("background_task_start", f"user='{user_dict.get('name')}' context=manual")
            result = run_agent_sync(user_dict, force_rescrape=False, context="manual")
            _agent_state["status"] = "idle"
            _agent_state["last_result"] = {
                "opportunities_scraped": result.get("opportunities_scraped", 0),
                "matched_count": result.get("matched_count", 0),
                "sources_used": result.get("sources_used", []),
                "duration_ms": result.get("duration_ms", 0),
                "alerts_sent": result.get("alerts_sent", 0),
                "urgent_count": result.get("urgent_count", 0),
                "plan_priority": result.get("plan", {}).get("priority", "all"),
                "context": "manual",
            }
            _agent_state["last_trace"] = {
                "user": user_dict.get("name"),
                "context": "manual",
                "timestamp": result.get("timestamp"),
                "duration_ms": result.get("duration_ms", 0),
                "opportunities_scraped": result.get("opportunities_scraped", 0),
                "matched_count": result.get("matched_count", 0),
                "alerts_sent": result.get("alerts_sent", 0),
                "sources_used": result.get("sources_used", []),
                "plan": result.get("plan", {}),
            }
            _agent_state["last_steps_log"] = result.get("steps_log", [])
            _agent_state["last_timing"] = result.get("timing", {})
            _agent_state["runs_completed"] = _agent_state.get("runs_completed", 0) + 1
            log_agent_step(
                "background_task_complete",
                f"matched={result.get('matched_count', 0)}, "
                f"alerts={result.get('alerts_sent', 0)}, "
                f"duration={result.get('duration_ms', 0)}ms"
            )
        except Exception as e:
            _agent_state["status"] = "error"
            log_error("agent_background_task", e)

    background_tasks.add_task(_bg_task)

    return {
        "status": "Agent running",
        "message": "Autonomous agent pipeline started in background. Scraping 8 real sources in parallel.",
        "user": user_dict.get("name"),
        "emailAlerts": bool(user_dict.get("email")),
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
        "scheduledRuns": _agent_state.get("scheduled_runs", 0),
        "lastScheduledRun": _agent_state.get("last_scheduled_run"),
        "lastResult": _agent_state.get("last_result"),
        "emailServiceEnabled": notification_service.is_enabled,
        "checkedAt": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── GET /agent/trace ──────────────────────────────────────────────────────────

@router.get("/agent/trace")
def get_agent_trace() -> Dict[str, Any]:
    """
    Returns the full execution trace of the last agent run.
    Includes step-by-step log, timing breakdown, plan details, and alert info.
    Use this during demo to PROVE the agent actually ran with real data.
    """
    return {
        "lastTrace": _agent_state.get("last_trace", {}),
        "steps": _agent_state.get("last_steps_log", []),
        "timing": _agent_state.get("last_timing", {}),
        "runsCompleted": _agent_state.get("runs_completed", 0),
        "scheduledRuns": _agent_state.get("scheduled_runs", 0),
        "agentStatus": _agent_state.get("status", "idle"),
        "checkedAt": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── GET /agent/scheduler-status ───────────────────────────────────────────────

@router.get("/agent/scheduler-status")
def get_scheduler_status() -> Dict[str, Any]:
    """
    Returns the status of the autonomous 30-minute scheduler.
    Use this during demo to show the agent is running autonomously.
    """
    # Import here to avoid circular at module load
    try:
        from main import scheduler
        jobs = scheduler.get_jobs()
        scheduler_running = scheduler.running
        next_run = None
        if jobs:
            next_run = str(jobs[0].next_run_time) if jobs[0].next_run_time else None
    except Exception:
        scheduler_running = False
        next_run = None

    return {
        "schedulerRunning": scheduler_running,
        "autonomousMode": True,
        "scheduleIntervalMinutes": 30,
        "scheduledRuns": _agent_state.get("scheduled_runs", 0),
        "lastScheduledRun": _agent_state.get("last_scheduled_run"),
        "nextScheduledRun": next_run,
        "description": "Agent runs every 30 minutes autonomously — no user interaction needed",
        "checkedAt": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── POST /agent/deadline-reminders ───────────────────────────────────────────

@router.post("/agent/deadline-reminders")
async def evaluate_deadline_reminders(
    payload: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Evaluates opportunities with <24-48h remaining deadlines for a given user.
    ACTUALLY SENDS an email alert if email is provided in payload.

    Payload fields:
      - email (optional): Send real email alert to this address
      - username (optional): Display name for email greeting
      - appliedIds (optional): List of already-applied opportunity IDs to exclude
      - skills (optional): User skills for basic relevance filter
    """
    opps = firestore_service.get_all_opportunities()
    applied_ids = set(payload.get("appliedIds", []))
    user_email = payload.get("email", "").strip()
    username = payload.get("username") or payload.get("name") or "Student"

    urgent_flagged = []
    for opp in opps:
        if opp.get("id") in applied_ids:
            continue

        # Check multiple urgency signals
        deadline_str = opp.get("deadline", "").lower()
        deadline_date = opp.get("deadlineDate", "")
        is_urgent_flag = opp.get("urgent24h", False)
        is_urgent_text = any(kw in deadline_str for kw in ["closing", "tomorrow", "<24h", "urgent", "last day"])

        # Check deadline date proximity
        is_urgent_date = False
        if deadline_date and len(deadline_date) >= 10:
            try:
                import datetime as dt
                dl = dt.date.fromisoformat(deadline_date[:10])
                delta = (dl - dt.date.today()).days
                is_urgent_date = 0 <= delta <= 2
            except (ValueError, TypeError):
                pass

        is_urgent = is_urgent_flag or is_urgent_text or is_urgent_date

        if is_urgent:
            urgent_flagged.append({
                "id": opp.get("id"),
                "title": opp.get("title"),
                "organization": opp.get("organization"),
                "deadline": opp.get("deadline"),
                "deadlineDate": opp.get("deadlineDate"),
                "url": opp.get("url"),
                "type": opp.get("type"),
                "urgent24h": True,
            })

    # ── ACTUALLY SEND EMAIL if address provided ───────────────────────────────
    email_sent = False
    email_status = "not_requested"

    if user_email and urgent_flagged:
        log_agent_step("deadline_alert", f"Sending email to {user_email} for {len(urgent_flagged)} urgent opps")
        email_sent = notification_service.send_deadline_alert(
            to_email=user_email,
            username=username,
            urgent_opps=urgent_flagged,
        )
        email_status = "sent" if email_sent else "failed"
        log_agent_step(
            "deadline_alert_result",
            f"status={email_status} recipient={user_email}"
        )
    elif user_email and not urgent_flagged:
        email_status = "no_urgent_opportunities"
    elif not user_email:
        email_status = "no_email_provided"

    return {
        "success": True,
        "urgentOpportunitiesCount": len(urgent_flagged),
        "urgentOpportunities": urgent_flagged,
        "emailAlertSent": email_sent,
        "emailStatus": email_status,
        "recipient": user_email if user_email else None,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }
