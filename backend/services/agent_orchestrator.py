"""
agent_orchestrator.py — NextLane AI
======================================
The autonomous Taskmaster Agent brain — upgraded with:
  [1] Goal-driven & baseline Gemini Planning (agent_planner fallback)
  [2] Tool Selection (TOOL_REGISTRY verification)
  [3] Async Parallel Execution (asyncio.gather)
  [4] Persistence (Firestore / Local JSON store)
  [5] Batch Gemini Scoring & Match Engine
  [6] Priority Engine Scoring & Feedback Loop Weighting
  [7] Proactive Deadline Alerting (SMTP)
  [8] Structured Result & Multi-Agent Execution Trace

Fully backward-compatible:
  - If `goal` is omitted → executes baseline pipeline.
  - If `goal` is provided → executes goal-driven extended pipeline.
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
from services.agent_planner import agent_planner
from services.priority_engine import priority_engine
from services.feedback_service import feedback_service
from utils.logger import log_agent_step, log_event, log_error, log_plan, log_tool_call


# ── Tool Registry ─────────────────────────────────────────────────────────────
TOOL_REGISTRY: Dict[str, Any] = {
    "scrape_devpost": scraping_service.scrape_devpost,
    "scrape_remotive": scraping_service.scrape_remotive,
    "scrape_unstop": scraping_service.scrape_unstop,
    "scrape_remoteok_jobs": scraping_service.scrape_remoteok_jobs,
    "scrape_arbeitnow": scraping_service.scrape_arbeitnow,
    "scrape_jobicy": scraping_service.scrape_jobicy,
    "scrape_linkedin_jobs": scraping_service.scrape_linkedin_jobs,
    "scrape_mlh": scraping_service.scrape_mlh,
    "scrape_opportunities_corner": scraping_service.scrape_opportunities_corner,
    "scrape_scholarships": scraping_service.scrape_scholarships,
}


class AgentOrchestrator:
    """
    Central Orchestration Agent.

    Supports both baseline execution (goal=None) and goal-driven execution (goal="...").
    """

    async def execute_agent(
        self,
        user_profile: Dict[str, Any],
        force_rescrape: bool = False,
        context: str = "manual",  # "manual" | "scheduled" | "profile_update" | "goal_driven"
        goal: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Full agentic execution loop.

        Args:
            user_profile:   Sanitized user dict
            force_rescrape: Bypass store cache if True
            context:        Execution context string
            goal:           Optional strategic goal string

        Returns:
            Structured AgentResult dict
        """
        start_time = time.monotonic()
        steps_log: List[str] = []
        sources_used: List[str] = []
        timing: Dict[str, float] = {}
        alerts_sent: int = 0

        def _log(role: str, step: str, detail: str = ""):
            entry = f"[{role}] Step: {step}"
            if detail:
                entry += f" — {detail}"
            log_agent_step(f"{role}:{step}", detail)
            steps_log.append(entry)

        def _checkpoint(label: str):
            timing[label] = round((time.monotonic() - start_time) * 1000)

        # ── INPUT VALIDATION ─────────────────────────────────────────────────
        user_profile = self._validate_profile(user_profile)
        user_name = user_profile.get("name") or user_profile.get("fullName", "Student")
        user_email = user_profile.get("email", "")
        _log("Planner Agent", "agent_start", f"user='{user_name}' context='{context}' goal='{goal or 'None'}'")

        # ── STEP 1: PLANNING (Goal-driven or Baseline) ───────────────────────
        plan_start = time.monotonic()
        if goal:
            _log("Planner Agent", "planning_goal_driven", f"Generating strategic plan for goal: '{goal}'")
            plan = await agent_planner.generate_goal_driven_plan_async(user_profile, goal, list(TOOL_REGISTRY.keys()))
        else:
            _log("Planner Agent", "planning_baseline", "Gemini generating execution plan...")
            plan = await gemini_service.generate_agent_plan_async(user_profile)

        log_plan(plan)
        timing["planning_ms"] = round((time.monotonic() - plan_start) * 1000)
        _log("Planner Agent", "planning_complete", f"sources={plan.get('sources')}, priority={plan.get('priority')}")

        # ── STEP 2: TOOL SELECTION ───────────────────────────────────────────
        selected_sources = plan.get("sources", list(TOOL_REGISTRY.keys()))
        selected_sources = [s for s in selected_sources if s in TOOL_REGISTRY]
        if not selected_sources:
            selected_sources = list(TOOL_REGISTRY.keys())
        _log("Scraper Agent", "tool_selection", f"tools={selected_sources}")

        # ── STEP 3: ASYNC TOOL EXECUTION ─────────────────────────────────────
        scraped_items: List[Dict[str, Any]] = []

        if not force_rescrape and context != "scheduled":
            existing = firestore_service.get_all_opportunities()
            if existing and len(existing) >= 5:
                _log("Scraper Agent", "cache_hit", f"{len(existing)} opportunities in store — using cache")
                scraped_items = existing
                sources_used = ["cache"]

        if not scraped_items:
            _log("Scraper Agent", "tool_execution_start", f"running {len(selected_sources)} scrapers in parallel")
            scrape_start = time.monotonic()
            scraped_items = await scraping_service.run_scrapers_async(selected_sources)
            sources_used = selected_sources
            timing["scraping_ms"] = round((time.monotonic() - scrape_start) * 1000)

            # Deduplicate items
            scraped_items = scraping_service._deduplicate(scraped_items)
            _log("Scraper Agent", "tool_execution_complete", f"{len(scraped_items)} unique opportunities collected")

            # ── STEP 4: STORE RESULTS ─────────────────────────────────────────
            _log("Scraper Agent", "storing_results", f"persisting {len(scraped_items)} opportunities")
            saved = firestore_service.save_opportunities(scraped_items)
            firestore_service.save_user(user_profile)
            _log("Scraper Agent", "results_stored", f"{saved} items saved to store")

        _checkpoint("after_scraping_ms")

        # ── STEP 5: ASYNC MATCH & PRIORITY ENGINE ────────────────────────────
        _log("Matching Agent", "matching_start", f"async batch scoring against {len(scraped_items)} opportunities")
        match_start = time.monotonic()
        matched = await matching_service.match_all_async(user_profile, scraped_items)
        timing["matching_ms"] = round((time.monotonic() - match_start) * 1000)
        _log("Matching Agent", "matching_complete", f"{len(matched)} scored results ready")

        # Additive Priority Engine & Feedback Weighting Layer
        _log("Priority Agent", "priority_scoring_start", f"computing priority_score (goal='{goal or 'none'}')")
        prioritized = priority_engine.prioritize_all(matched, user_profile, goal=goal)

        user_id = user_email or user_name
        if user_id:
            prioritized = feedback_service.apply_feedback_weights(prioritized, user_id)
            _log("Feedback Agent", "feedback_weights_applied", f"history weights applied for '{user_id}'")

        # ── STEP 6: PROACTIVE ALERTING ────────────────────────────────────────
        urgent_opps = [
            opp for opp in scraped_items
            if opp.get("urgent24h") or self._is_deadline_urgent(opp.get("deadlineDate", ""))
        ]

        if urgent_opps:
            _log("Advisor Agent", "alerting_check", f"{len(urgent_opps)} urgent opportunities detected")
            if user_email and notification_service.is_enabled:
                _log("Advisor Agent", "alerting_send", f"sending deadline alert to {user_email}")
                sent = notification_service.send_deadline_alert(
                    to_email=user_email,
                    username=user_name,
                    urgent_opps=urgent_opps,
                )
                if sent:
                    alerts_sent = len(urgent_opps)
                    _log("Advisor Agent", "alerting_complete", f"✅ Alert email sent — {alerts_sent} urgent opps notified")
                else:
                    _log("Advisor Agent", "alerting_failed", "Email send failed — check SMTP config")
            elif not user_email:
                _log("Advisor Agent", "alerting_skipped", "No email in profile — alert skipped")
            else:
                _log("Advisor Agent", "alerting_disabled", "Email service disabled")
        else:
            _log("Advisor Agent", "alerting_check", "No urgent deadlines detected")

        # ── STEP 7: ACTION PREPARATION ────────────────────────────────────────
        for opp in prioritized[:5]:
            opp["actionItems"] = {
                "applyUrl": opp.get("url"),
                "calendarLink": self._generate_calendar_link(opp),
                "draftReady": True,
            }

        # ── STEP 8: RETURN STRUCTURED OUTPUT ─────────────────────────────────
        duration_ms = int((time.monotonic() - start_time) * 1000)
        timing["total_ms"] = duration_ms
        _log("Planner Agent", "agent_complete", f"finished in {duration_ms}ms | alerts_sent={alerts_sent}")

        result = {
            "status": "completed",
            "goal": goal,
            "isGoalDriven": bool(goal),
            "plan": plan,
            "steps_log": steps_log,
            "sources_used": sources_used,
            "opportunities_scraped": len(scraped_items),
            "matched_results": prioritized,
            "matched_count": len(prioritized),
            "alerts_sent": alerts_sent,
            "urgent_count": len(urgent_opps),
            "context": context,
            "timing": timing,
            "duration_ms": duration_ms,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }
        return result

    def _is_deadline_urgent(self, deadline_date: str) -> bool:
        if not deadline_date:
            return False
        try:
            dl = datetime.date.fromisoformat(deadline_date[:10])
            delta = (dl - datetime.date.today()).days
            return 0 <= delta <= 2
        except (ValueError, TypeError):
            return False

    def _generate_calendar_link(self, opp: Dict[str, Any]) -> str:
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

    def _validate_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
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
            if "@" in s and "." in s.split("@")[-1]:
                return s[:200]
            return ""

        return {
            "name": _clean_str(profile.get("name") or profile.get("fullName"), 100),
            "fullName": _clean_str(profile.get("fullName") or profile.get("name"), 100),
            "email": _clean_email(profile.get("email")),
            "location": _clean_str(profile.get("location"), 100) or "Pakistan",
            "education": _clean_str(profile.get("education") or profile.get("educationLevel"), 100),
            "educationLevel": _clean_str(profile.get("educationLevel") or profile.get("education"), 100),
            "skills": _clean_list(profile.get("skills", [])),
            "interests": _clean_list(profile.get("interests") or profile.get("targetObjectives", [])),
            "targetObjectives": _clean_list(profile.get("targetObjectives") or profile.get("interests", [])),
            "linkedInUrl": _clean_str(profile.get("linkedInUrl"), 300),
            "githubUrl": _clean_str(profile.get("githubUrl"), 300),
            "resumeFileName": _clean_str(profile.get("resumeFileName"), 100),
            "resumeText": _clean_str(profile.get("resumeText"), 4000),
        }


def requests_quote(text: str) -> str:
    try:
        from urllib.parse import quote
        return quote(text, safe="")
    except Exception:
        return text.replace(" ", "+")


async def run_agent_async(
    user_profile: Dict[str, Any],
    force_rescrape: bool = False,
    context: str = "manual",
    goal: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Safe async agent runner — use this from async contexts (FastAPI endpoints,
    background tasks). Does NOT call asyncio.run() which is illegal inside
    a running event loop.
    """
    orchestrator = AgentOrchestrator()
    try:
        return await orchestrator.execute_agent(
            user_profile,
            force_rescrape=force_rescrape,
            context=context,
            goal=goal,
        )
    except Exception as e:
        log_error("agent_run_async", e)
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }


def run_agent_sync(
    user_profile: Dict[str, Any],
    force_rescrape: bool = False,
    context: str = "manual",
    goal: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Sync wrapper — only safe to call from threads that do NOT have a running
    event loop (e.g. plain scripts, tests). For FastAPI/uvicorn contexts,
    use run_agent_async() instead.
    """
    import concurrent.futures
    orchestrator = AgentOrchestrator()
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Inside a running loop (uvicorn) — run in a separate thread
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(
                    asyncio.run,
                    orchestrator.execute_agent(
                        user_profile,
                        force_rescrape=force_rescrape,
                        context=context,
                        goal=goal,
                    )
                )
                return future.result(timeout=300)
        else:
            return loop.run_until_complete(
                orchestrator.execute_agent(
                    user_profile,
                    force_rescrape=force_rescrape,
                    context=context,
                    goal=goal,
                )
            )
    except Exception as e:
        log_error("agent_run_sync", e)
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }


agent_orchestrator = AgentOrchestrator()
