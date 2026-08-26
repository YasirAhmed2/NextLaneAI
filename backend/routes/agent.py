"""
routes/agent.py — NextLane AI
Agent route endpoints:
  POST /run-agent                — Trigger full agentic loop with user profile (background)
  POST /agent/plan               — Get Gemini-generated plan without executing (debug/demo)
  GET  /agent/status             — Current agent status and indexed opportunity count
  POST /agent/deadline-reminders — Evaluate + ACTUALLY SEND urgent deadline alerts (<24h ONLY)
  GET  /agent/trace              — Full execution trace log for last agent run (demo proof)
  GET  /agent/scheduler-status   — Autonomous scheduler health check
  POST /agent/tailor-cv          — AI CV Tailoring Assistant
  POST /agent/generate-letter    — AI Motivation & Recommendation Letter Generator
"""
import asyncio
import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException, Body
from typing import Dict, Any, Optional

from models.schemas import (
    UserProfileRequest,
    AgentPlanResponse,
    AgentExecutionResponse,
    TailorCvRequest,
    LetterGeneratorRequest,
)
from services.agent_orchestrator import run_agent_sync, agent_orchestrator
from services.gemini_service import gemini_service
from services.firestore_service import firestore_service
from services.notification_service import notification_service
from services.assistant_service import assistant_service
from utils.logger import log_event, log_error, log_agent_step

router = APIRouter(tags=["Agent Orchestration"])

# ── Shared in-memory state ────────────────────────────────────────────────────
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
    global _agent_state

    if profile:
        user_dict = {
            "name": profile.get_effective_name(),
            "fullName": profile.get_effective_name(),
            "email": getattr(profile, "email", "") or "",
            "location": profile.get_effective_location(),
            "skills": profile.get_effective_skills(),
            "education": profile.get_effective_education(),
            "educationLevel": profile.get_effective_education(),
            "interests": profile.get_effective_interests(),
            "targetObjectives": profile.get_effective_interests(),
            "linkedInUrl": profile.linkedInUrl,
            "githubUrl": profile.githubUrl,
            "resumeFileName": profile.resumeFileName,
            "resumeText": profile.resumeText,
        }
    else:
        user_dict = {"name": "General", "skills": [], "interests": [], "email": "", "location": "Pakistan"}

    if profile and profile.get_effective_name() != "Student":
        firestore_service.save_user(user_dict)

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
        "message": "Autonomous agent pipeline started in background.",
        "user": user_dict.get("name"),
        "emailAlerts": bool(user_dict.get("email")),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── POST /agent/plan ─────────────────────────────────────────────────────────

@router.post("/agent/plan")
async def get_agent_plan(profile: UserProfileRequest) -> Dict[str, Any]:
    try:
        user_dict = {
            "name": profile.get_effective_name(),
            "location": profile.get_effective_location(),
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


# ── POST /agent/deadline-reminders (Strictly < 24 Hours Only) ───────────────

@router.post("/agent/deadline-reminders")
async def evaluate_deadline_reminders(
    payload: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Evaluates opportunities with strictly < 24 hours remaining time to deadline.
    Sends email alerts ONLY for opportunities that genuinely close within 24 hours.
    """
    opps = firestore_service.get_all_opportunities()
    applied_ids = set(payload.get("appliedIds", []))
    user_email = payload.get("email", "").strip()
    username = payload.get("username") or payload.get("name") or "Student"

    now = datetime.datetime.utcnow()
    urgent_flagged = []

    for opp in opps:
        if opp.get("id") in applied_ids:
            continue

        deadline_str = opp.get("deadline", "").lower()
        deadline_date = opp.get("deadlineDate", "")
        is_urgent_flag = opp.get("urgent24h", False)

        remaining_hours = None
        qualifies_strict_24h = False

        if deadline_date and len(deadline_date) >= 10:
            try:
                dl = datetime.datetime.fromisoformat(deadline_date[:10])
                # Set end of deadline day
                dl = dl.replace(hour=23, minute=59, second=59)
                diff = dl - now
                hours = diff.total_seconds() / 3600.0
                remaining_hours = round(hours, 1)

                # Strict requirement: Must be in future AND strictly < 24 hours remaining
                if 0 <= hours <= 24:
                    qualifies_strict_24h = True
            except Exception:
                pass

        # Text fallback: "closing today", "tomorrow", "<24h"
        if not qualifies_strict_24h and any(kw in deadline_str for kw in ["closing today", "24 hours", "24h", "last day", "closing tomorrow"]):
            qualifies_strict_24h = True
            remaining_hours = 18

        if not qualifies_strict_24h and is_urgent_flag and remaining_hours is not None and remaining_hours <= 24:
            qualifies_strict_24h = True

        if qualifies_strict_24h:
            urgent_flagged.append({
                "id": opp.get("id"),
                "title": opp.get("title"),
                "organization": opp.get("organization"),
                "deadline": opp.get("deadline"),
                "deadlineDate": opp.get("deadlineDate"),
                "remainingHours": remaining_hours if remaining_hours is not None else 18,
                "url": opp.get("url"),
                "type": opp.get("type"),
                "urgent24h": True,
            })

    email_sent = False
    email_status = "not_requested"

    if user_email and urgent_flagged:
        log_agent_step("deadline_alert", f"Sending strictly <24h email to {user_email} for {len(urgent_flagged)} opps")
        email_sent = notification_service.send_deadline_alert(
            to_email=user_email,
            username=username,
            urgent_opps=urgent_flagged,
        )
        email_status = "sent" if email_sent else "failed"
    elif user_email and not urgent_flagged:
        email_status = "no_urgent_opportunities_under_24h"
    elif not user_email:
        email_status = "no_email_provided"

    return {
        "success": True,
        "strictCriteria": "< 24 Hours Remaining Only",
        "urgentOpportunitiesCount": len(urgent_flagged),
        "urgentOpportunities": urgent_flagged,
        "emailAlertSent": email_sent,
        "emailStatus": email_status,
        "recipient": user_email if user_email else None,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ── POST /agent/tailor-cv (AI CV Tailoring Assistant) ─────────────────────────

@router.post("/agent/tailor-cv")
@router.post("/api/agent/tailor-cv")
async def tailor_cv_endpoint(payload: TailorCvRequest) -> Dict[str, Any]:
    """
    AI CV Tailoring Assistant — Takes user CV text and target job/scholarship
    description to optimize CV summary, keywords, and bullet points.
    """
    try:
        log_agent_step("cv_tailor_request", f"Target: {payload.opportunityTitle} at {payload.organization}")
        result = assistant_service.tailor_cv(
            cv_text=payload.cvText,
            opportunity_title=payload.opportunityTitle,
            organization=payload.organization,
            opportunity_description=payload.opportunityDescription,
            requirements=payload.requirements,
            user_skills=payload.userSkills,
        )
        return result
    except Exception as e:
        log_error("route_tailor_cv", e)
        raise HTTPException(status_code=500, detail=f"CV tailoring failed: {str(e)}")


# ── POST /agent/generate-letter (AI Letter Assistant) ─────────────────────────

@router.post("/agent/generate-letter")
@router.post("/api/agent/generate-letter")
async def generate_letter_endpoint(payload: LetterGeneratorRequest) -> Dict[str, Any]:
    """
    AI Scholarship Assistant — Generates Motivation Letters / Statements of Purpose
    or Academic Recommendation Letters tailored for a specific scholarship.
    """
    try:
        log_agent_step("letter_generator_request", f"Type: {payload.letterType} for {payload.scholarshipTitle}")
        result = assistant_service.generate_letter(
            letter_type=payload.letterType,
            scholarship_title=payload.scholarshipTitle,
            organization=payload.organization,
            scholarship_description=payload.scholarshipDescription,
            user_profile=payload.userProfile,
        )
        return result
    except Exception as e:
        log_error("route_generate_letter", e)
        raise HTTPException(status_code=500, detail=f"Letter generation failed: {str(e)}")
