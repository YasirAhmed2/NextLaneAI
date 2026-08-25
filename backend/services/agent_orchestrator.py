"""
agent_orchestrator.py — NextLane AI
======================================
The autonomous Taskmaster Agent brain.

Architecture:
    User Profile + Goal
         │
         ▼
    [1] Gemini PLAN  ← decide which tools to call and why
         │
         ▼
    [2] TOOL SELECTION ← map plan to callable scraper functions
         │
         ▼
    [3] ASYNC EXECUTE ← asyncio.gather(*tools) concurrently
         │
         ▼
    [4] STORE RESULTS ← persist to Firestore / local store
         │
         ▼
    [5] ASYNC MATCH  ← batch Gemini scoring in parallel
         │
         ▼
    [6] RETURN structured AgentResult
"""
import asyncio
import time
import datetime
from typing import Dict, Any, List, Optional

from services.gemini_service import gemini_service
from services.scraping_service import scraping_service
from services.firestore_service import firestore_service
from services.matching_service import matching_service
from utils.logger import log_agent_step, log_event, log_error, log_plan, log_tool_call


# ── Tool Registry ─────────────────────────────────────────────────────────────
# Maps string tool names (returned by Gemini plan) to actual callable functions.
TOOL_REGISTRY: Dict[str, Any] = {
    "scrape_internee_pk": scraping_service.scrape_internee_pk,
    "scrape_linkedin_jobs": scraping_service.scrape_linkedin_jobs,
    "scrape_remoteok_jobs": scraping_service.scrape_remoteok_jobs,
    "scrape_opportunities_corner": scraping_service.scrape_opportunities_corner,
    "scrape_devpost": scraping_service.scrape_devpost,
    "scrape_unstop": scraping_service.scrape_unstop,
    "scrape_mlh": scraping_service.scrape_mlh,
    "scrape_scholarships": scraping_service.scrape_scholarships,
}


class AgentOrchestrator:
    """
    Central agent loop that:
      1. Takes a goal (user profile + stated interests)
      2. Uses Gemini to generate an execution plan
      3. Selects and executes tools based on that plan
      4. Stores results
      5. Runs async batch matching
      6. Returns a structured result
    """

    async def execute_agent(
        self,
        user_profile: Dict[str, Any],
        force_rescrape: bool = False
    ) -> Dict[str, Any]:
        """
        Full agentic execution loop.

        Args:
            user_profile: Sanitized user dict (name, skills, education, interests)
            force_rescrape: If True, bypass cached store and rescrape

        Returns:
            {
                "status": "completed",
                "plan": {...},
                "steps_log": [...],
                "sources_used": [...],
                "opportunities_scraped": int,
                "matched_results": [...],
                "matched_count": int,
                "duration_ms": int,
                "timestamp": str
            }
        """
        start_time = time.monotonic()
        steps_log: List[str] = []
        sources_used: List[str] = []

        def _log(step: str, detail: str = ""):
            log_agent_step(step, detail)
            entry = f"[AGENT] Step: {step}"
            if detail:
                entry += f" — {detail}"
            steps_log.append(entry)

        # ── INPUT VALIDATION ─────────────────────────────────────────────────
        user_profile = self._validate_profile(user_profile)
        user_name = user_profile.get("name") or user_profile.get("fullName", "Student")
        _log("agent_start", f"user='{user_name}'")

        # ── STEP 1: PLANNING ─────────────────────────────────────────────────
        _log("planning", "Gemini generating execution plan...")
        plan = gemini_service.generate_agent_plan(user_profile)
        log_plan(plan)
        _log("planning_complete", f"sources={plan.get('sources')}, priority={plan.get('priority')}")

        # ── STEP 2: TOOL SELECTION ───────────────────────────────────────────
        selected_sources = plan.get("sources", list(TOOL_REGISTRY.keys()))
        # Validate: only use known tools
        selected_sources = [s for s in selected_sources if s in TOOL_REGISTRY]
        if not selected_sources:
            selected_sources = list(TOOL_REGISTRY.keys())
        _log("tool_selection", f"tools={selected_sources}")

        # ── STEP 3: ASYNC TOOL EXECUTION ─────────────────────────────────────
        scraped_items: List[Dict[str, Any]] = []

        if not force_rescrape:
            # Check if we have recent data in store
            existing = firestore_service.get_all_opportunities()
            if existing and len(existing) >= 5:
                _log("cache_hit", f"{len(existing)} opportunities found in store, skipping rescrape")
                scraped_items = existing
                sources_used = ["cache"]

        if not scraped_items:
            _log("tool_execution_start", f"running {len(selected_sources)} scrapers in parallel")
            scraped_items = await scraping_service.run_scrapers_async(selected_sources)
            sources_used = selected_sources

            # Merge seed data for baseline
            scraped_items = scraping_service._merge_seed_data(scraped_items)
            scraped_items = scraping_service._deduplicate(scraped_items)
            _log("tool_execution_complete", f"{len(scraped_items)} unique opportunities collected")

            # ── STEP 4: STORE RESULTS ─────────────────────────────────────────
            _log("storing_results", f"persisting {len(scraped_items)} opportunities")
            saved = firestore_service.save_opportunities(scraped_items)
            firestore_service.save_user(user_profile)
            _log("results_stored", f"{saved} items saved")

        # ── STEP 5: ASYNC MATCH ───────────────────────────────────────────────
        _log("matching_start", f"async batch scoring against {len(scraped_items)} opportunities")
        matched = await matching_service.match_all_async(user_profile, scraped_items)
        _log("matching_complete", f"{len(matched)} ranked results ready")

        # ── STEP 6: RETURN STRUCTURED OUTPUT ─────────────────────────────────
        duration_ms = int((time.monotonic() - start_time) * 1000)
        _log("agent_complete", f"finished in {duration_ms}ms")

        return {
            "status": "completed",
            "plan": plan,
            "steps_log": steps_log,
            "sources_used": sources_used,
            "opportunities_scraped": len(scraped_items),
            "matched_results": matched,
            "matched_count": len(matched),
            "duration_ms": duration_ms,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }

    # ── Input Validation / Sanitization ──────────────────────────────────────

    def _validate_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitizes and caps user profile inputs to prevent:
          - Prompt injection via oversized skill arrays
          - XSS / injection via special characters in text fields
          - Denial-of-service via massive payloads
        """
        def _clean_str(val: Any, max_len: int = 200) -> str:
            if not val:
                return ""
            s = str(val).strip()
            # Remove common prompt injection sequences
            for seq in ["```", "###", "SYSTEM:", "IGNORE PREVIOUS", "<script"]:
                s = s.replace(seq, "")
            return s[:max_len]

        def _clean_list(lst: Any, max_items: int = 15, item_max_len: int = 60) -> List[str]:
            if not isinstance(lst, list):
                return []
            return [_clean_str(item, item_max_len) for item in lst if item][:max_items]

        return {
            "name": _clean_str(profile.get("name") or profile.get("fullName"), 100),
            "fullName": _clean_str(profile.get("fullName") or profile.get("name"), 100),
            "education": _clean_str(profile.get("education") or profile.get("educationLevel"), 100),
            "educationLevel": _clean_str(profile.get("educationLevel") or profile.get("education"), 100),
            "skills": _clean_list(profile.get("skills", [])),
            "interests": _clean_list(profile.get("interests") or profile.get("targetObjectives", [])),
            "targetObjectives": _clean_list(profile.get("targetObjectives") or profile.get("interests", [])),
            "linkedInUrl": _clean_str(profile.get("linkedInUrl"), 300),
            "githubUrl": _clean_str(profile.get("githubUrl"), 300),
            "resumeFileName": _clean_str(profile.get("resumeFileName"), 100),
        }


# ── Background-compatible sync wrapper ────────────────────────────────────────

def run_agent_sync(user_profile: Dict[str, Any], force_rescrape: bool = False) -> Dict[str, Any]:
    """
    Sync wrapper for use in FastAPI BackgroundTasks or non-async contexts.
    Creates its own event loop to run the async agent.
    """
    orchestrator = AgentOrchestrator()
    try:
        return asyncio.run(orchestrator.execute_agent(user_profile, force_rescrape=force_rescrape))
    except Exception as e:
        log_error("agent_run_sync", e)
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }


# Singleton orchestrator
agent_orchestrator = AgentOrchestrator()
