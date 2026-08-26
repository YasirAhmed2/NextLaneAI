"""
agent_orchestrator.py — NextLane AI
======================================
The autonomous Taskmaster Agent brain — upgraded with:
  [1] Gemini PLAN       → decide which tools to call and why
  [2] TOOL SELECTION    → map plan to callable scraper functions
  [3] ASYNC EXECUTE     → asyncio.gather(*tools) concurrently with retry
  [4] STORE RESULTS     → persist to Firestore / local store
  [5] ASYNC MATCH       → batch Gemini scoring in parallel
  [6] PROACTIVE ALERT   → auto-send deadline emails (NEW — autonomous action)
  [7] RETURN            → structured AgentResult with full trace

This agent operates both on user-trigger AND on the 30-minute autonomous schedule.
"""
import asyncio
import time
import datetime
from typing import Dict, Any, List, Optional

from services.gemini_service import gemini_service
from services.scraping_service import scraping_service
from services.firestore_service import firestore_service
from services.matching_service import matching_service
from services.notification_service import notification_service
from utils.logger import log_agent_step, log_event, log_error, log_plan, log_tool_call


# ── Tool Registry ─────────────────────────────────────────────────────────────
# Maps string tool names (returned by Gemini plan) to actual callable functions.
TOOL_REGISTRY: Dict[str, Any] = {
    "scrape_linkedin_jobs": scraping_service.scrape_linkedin_jobs,
    "scrape_indeed_jobs": scraping_service.scrape_indeed_jobs,
    "scrape_rozee_pk": scraping_service.scrape_rozee_pk,
    "scrape_mustakbil": scraping_service.scrape_mustakbil,
    "scrape_glassdoor_jobs": scraping_service.scrape_glassdoor_jobs,
    "scrape_remoteok_jobs": scraping_service.scrape_remoteok_jobs,
    "scrape_internee_pk": scraping_service.scrape_internee_pk,
    "scrape_international_scholarships": scraping_service.scrape_international_scholarships,
    "scrape_iefa_scholarships": scraping_service.scrape_iefa_scholarships,
    "scrape_international_student_scholarships": scraping_service.scrape_international_student_scholarships,
    "scrape_masters_portal_scholarships": scraping_service.scrape_masters_portal_scholarships,
    "scrape_scholars4dev": scraping_service.scrape_scholars4dev,
    "scrape_opportunities_corner": scraping_service.scrape_opportunities_corner,
    "scrape_scholarships": scraping_service.scrape_scholarships,
    "scrape_devpost": scraping_service.scrape_devpost,
    "scrape_unstop": scraping_service.scrape_unstop,
    "scrape_mlh": scraping_service.scrape_mlh,
}


class AgentOrchestrator:
    """
    Central autonomous agent loop.

    Phases:
      1. Planning   — Gemini decides which tools to run
      2. Tool Sel   — Validate plan against TOOL_REGISTRY
      3. Execution  — asyncio.gather() parallel scraping
      4. Storage    — Firestore / local JSON persistence
      5. Matching   — Batch Gemini scoring against user profile
      6. Alerting   — Proactive email for deadlines < 24h (AUTONOMOUS ACTION)
      7. Return     — Structured result + full execution trace
    """

    async def execute_agent(
        self,
        user_profile: Dict[str, Any],
        force_rescrape: bool = False,
        context: str = "manual",  # "manual" | "scheduled" | "profile_update"
    ) -> Dict[str, Any]:
        """
        Full agentic execution loop.

        Args:
            user_profile:   Sanitized user dict (name, skills, education, interests, email)
            force_rescrape: If True, bypass cached store and rescrape live
            context:        Execution context — "manual" (user triggered) or "scheduled"

        Returns:
            Structured AgentResult dict with plan, matched_results, steps_log, alerts_sent
        """
        start_time = time.monotonic()
        steps_log: List[str] = []
        sources_used: List[str] = []
        timing: Dict[str, float] = {}
        alerts_sent: int = 0

        def _log(step: str, detail: str = ""):
            log_agent_step(step, detail)
            entry = f"[AGENT] Step: {step}"
            if detail:
                entry += f" — {detail}"
            steps_log.append(entry)

        def _checkpoint(label: str):
            timing[label] = round((time.monotonic() - start_time) * 1000)

        # ── INPUT VALIDATION ─────────────────────────────────────────────────
        user_profile = self._validate_profile(user_profile)
        user_name = user_profile.get("name") or user_profile.get("fullName", "Student")
        user_email = user_profile.get("email", "")
        _log("agent_start", f"user='{user_name}' context='{context}'")

        # ── STEP 1: PLANNING ─────────────────────────────────────────────────
        _log("planning", "Gemini generating execution plan...")
        plan_start = time.monotonic()
        plan = gemini_service.generate_agent_plan(user_profile)
        log_plan(plan)
        timing["planning_ms"] = round((time.monotonic() - plan_start) * 1000)
        _log("planning_complete", f"sources={plan.get('sources')}, priority={plan.get('priority')}")

        # ── STEP 2: TOOL SELECTION ───────────────────────────────────────────
        selected_sources = plan.get("sources", list(TOOL_REGISTRY.keys()))
        selected_sources = [s for s in selected_sources if s in TOOL_REGISTRY]
        if not selected_sources:
            selected_sources = list(TOOL_REGISTRY.keys())
        _log("tool_selection", f"tools={selected_sources}")

        # ── STEP 3: ASYNC TOOL EXECUTION ─────────────────────────────────────
        scraped_items: List[Dict[str, Any]] = []

        if not force_rescrape and context != "scheduled":
            # Check cache — skip rescrape if data is fresh (for manual triggers)
            existing = firestore_service.get_all_opportunities()
            if existing and len(existing) >= 5:
                _log("cache_hit", f"{len(existing)} opportunities in store — using cache")
                scraped_items = existing
                sources_used = ["cache"]

        if not scraped_items:
            _log("tool_execution_start", f"running {len(selected_sources)} scrapers in parallel")
            scrape_start = time.monotonic()
            scraped_items = await scraping_service.run_scrapers_async(selected_sources)
            sources_used = selected_sources
            timing["scraping_ms"] = round((time.monotonic() - scrape_start) * 1000)

            # Merge seed data for baseline
            scraped_items = scraping_service._merge_seed_data(scraped_items)
            scraped_items = scraping_service._deduplicate(scraped_items)
            _log("tool_execution_complete", f"{len(scraped_items)} unique opportunities collected")

            # ── STEP 4: STORE RESULTS ─────────────────────────────────────────
            _log("storing_results", f"persisting {len(scraped_items)} opportunities")
            saved = firestore_service.save_opportunities(scraped_items)
            firestore_service.save_user(user_profile)
            _log("results_stored", f"{saved} items saved to store")

        _checkpoint("after_scraping_ms")

        # ── STEP 5: ASYNC MATCH ───────────────────────────────────────────────
        _log("matching_start", f"async batch scoring against {len(scraped_items)} opportunities")
        match_start = time.monotonic()
        matched = await matching_service.match_all_async(user_profile, scraped_items)
        timing["matching_ms"] = round((time.monotonic() - match_start) * 1000)
        _log("matching_complete", f"{len(matched)} ranked results ready")

        # ── STEP 6: PROACTIVE ALERTING ────────────────────────────────────────
        # Autonomous action: detect urgent deadlines and email the user
        urgent_opps = [
            opp for opp in scraped_items
            if opp.get("urgent24h") or self._is_deadline_urgent(opp.get("deadlineDate", ""))
        ]

        if urgent_opps:
            _log("alerting_check", f"{len(urgent_opps)} urgent opportunities detected")

            if user_email and notification_service.is_enabled:
                _log("alerting_send", f"sending deadline alert to {user_email}")
                sent = notification_service.send_deadline_alert(
                    to_email=user_email,
                    username=user_name,
                    urgent_opps=urgent_opps,
                )
                if sent:
                    alerts_sent = len(urgent_opps)
                    _log("alerting_complete", f"✅ Alert email sent — {alerts_sent} urgent opps notified")
                else:
                    _log("alerting_failed", "Email send failed — check SMTP config")
            elif not user_email:
                _log("alerting_skipped", "No email in profile — alert not sent (user can add email to receive alerts)")
            else:
                _log("alerting_disabled", "Email service not configured — set EMAIL_USER/EMAIL_PASS in .env")
        else:
            _log("alerting_check", "No urgent deadlines detected — no alert needed")

        # ── STEP 7: ACTION PREPARATION ────────────────────────────────────────
        # Enrich top 5 matches with action items for the frontend
        for opp in matched[:5]:
            opp["actionItems"] = {
                "applyUrl": opp.get("url"),
                "calendarLink": self._generate_calendar_link(opp),
                "draftReady": True,
            }

        # ── STEP 8: RETURN STRUCTURED OUTPUT ─────────────────────────────────
        duration_ms = int((time.monotonic() - start_time) * 1000)
        timing["total_ms"] = duration_ms
        _log("agent_complete", f"finished in {duration_ms}ms | alerts_sent={alerts_sent}")

        result = {
            "status": "completed",
            "plan": plan,
            "steps_log": steps_log,
            "sources_used": sources_used,
            "opportunities_scraped": len(scraped_items),
            "matched_results": matched,
            "matched_count": len(matched),
            "alerts_sent": alerts_sent,
            "urgent_count": len(urgent_opps),
            "context": context,
            "timing": timing,
            "duration_ms": duration_ms,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }
        return result

    # ── Deadline Urgency Check ────────────────────────────────────────────────

    def _is_deadline_urgent(self, deadline_date: str) -> bool:
        """Returns True if deadline_date is within the next 48 hours."""
        if not deadline_date:
            return False
        try:
            dl = datetime.date.fromisoformat(deadline_date[:10])
            delta = (dl - datetime.date.today()).days
            return 0 <= delta <= 2
        except (ValueError, TypeError):
            return False

    # ── Calendar Link Generator ───────────────────────────────────────────────

    def _generate_calendar_link(self, opp: Dict[str, Any]) -> str:
        """Generates a Google Calendar 'add event' link for an opportunity deadline."""
        try:
            title = opp.get("title", "Application Deadline")
            dl = opp.get("deadlineDate", "")
            if dl and len(dl) >= 10:
                date_str = dl[:10].replace("-", "")
                text = f"{title} — Application Deadline"
                details = f"Apply: {opp.get('url', '')}"
                return (
                    f"https://calendar.google.com/calendar/render?action=TEMPLATE"
                    f"&text={requests_quote(text)}&dates={date_str}/{date_str}"
                    f"&details={requests_quote(details)}"
                )
        except Exception:
            pass
        return ""

    # ── Input Validation / Sanitization ──────────────────────────────────────

    def _validate_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitizes and caps user profile inputs to prevent:
          - Prompt injection via oversized skill arrays
          - XSS / injection via special characters
          - Denial-of-service via massive payloads
        """
        def _clean_str(val: Any, max_len: int = 200) -> str:
            if not val:
                return ""
            s = str(val).strip()
            for seq in ["```", "###", "SYSTEM:", "IGNORE PREVIOUS", "<script"]:
                s = s.replace(seq, "")
            return s[:max_len]

        def _clean_list(lst: Any, max_items: int = 15, item_max_len: int = 60) -> List[str]:
            if not isinstance(lst, list):
                return []
            return [_clean_str(item, item_max_len) for item in lst if item][:max_items]

        def _clean_email(val: Any) -> str:
            if not val:
                return ""
            s = str(val).strip().lower()
            # Basic email format check
            if "@" in s and "." in s.split("@")[-1]:
                return s[:200]
            return ""

        return {
            "name": _clean_str(profile.get("name") or profile.get("fullName"), 100),
            "fullName": _clean_str(profile.get("fullName") or profile.get("name"), 100),
            "email": _clean_email(profile.get("email")),
            "education": _clean_str(profile.get("education") or profile.get("educationLevel"), 100),
            "educationLevel": _clean_str(profile.get("educationLevel") or profile.get("education"), 100),
            "skills": _clean_list(profile.get("skills", [])),
            "interests": _clean_list(profile.get("interests") or profile.get("targetObjectives", [])),
            "targetObjectives": _clean_list(profile.get("targetObjectives") or profile.get("interests", [])),
            "linkedInUrl": _clean_str(profile.get("linkedInUrl"), 300),
            "githubUrl": _clean_str(profile.get("githubUrl"), 300),
            "resumeFileName": _clean_str(profile.get("resumeFileName"), 100),
        }


def requests_quote(text: str) -> str:
    """URL-encodes a string for use in Google Calendar links."""
    try:
        from urllib.parse import quote
        return quote(text, safe="")
    except Exception:
        return text.replace(" ", "+")


# ── Background-compatible sync wrapper ────────────────────────────────────────

def run_agent_sync(
    user_profile: Dict[str, Any],
    force_rescrape: bool = False,
    context: str = "manual",
) -> Dict[str, Any]:
    """
    Sync wrapper for use in FastAPI BackgroundTasks or non-async contexts.
    Creates its own event loop to run the async agent.
    Safe to call from threads (e.g., BackgroundTasks runs in a thread pool).
    """
    orchestrator = AgentOrchestrator()
    try:
        return asyncio.run(
            orchestrator.execute_agent(user_profile, force_rescrape=force_rescrape, context=context)
        )
    except Exception as e:
        log_error("agent_run_sync", e)
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }


# Singleton orchestrator
agent_orchestrator = AgentOrchestrator()
