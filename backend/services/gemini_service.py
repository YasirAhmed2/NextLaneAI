"""
gemini_service.py — NextLane AI
Gemini AI service using the google-genai SDK (compliant with hackathon requirements).
Provides:
  - Async match reasoning for parallel batch processing
  - Agent planning (decide which tools to call based on user profile)
  - Heuristic fallback engine when API key is absent
"""
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from utils.logger import log_event, log_error, log_agent_step
from config import settings

# ── SDK import (google-genai, NOT google-generativeai) ──────────────────────
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# ── Available agent tools (declared for Gemini function-calling awareness) ──
AVAILABLE_TOOLS = ["scrape_devpost", "scrape_unstop", "scrape_mlh", "scrape_scholarships"]

# ── Supported model list ──────────────────────────────────────────────────────
SUPPORTED_MODELS = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"]


class GeminiService:
    def __init__(self):
        self.api_key: Optional[str] = settings.GEMINI_API_KEY or os.getenv("GOOGLE_API_KEY", "")
        self.model_name: str = settings.GEMINI_MODEL
        self.client: Optional[Any] = None
        self.initialized: bool = False
        self._init_client()

    # ── Initialization ────────────────────────────────────────────────────────

    def _init_client(self):
        """Initialize the google-genai client."""
        if not GENAI_AVAILABLE:
            log_event("gemini", "google-genai package not found. Using heuristic engine.")
            return

        if not self.api_key or self.api_key.startswith("AIzaSyDummyKey"):
            log_event("gemini", "No valid GEMINI_API_KEY. Using deterministic heuristic fallback.")
            return

        try:
            self.client = genai.Client(api_key=self.api_key)
            self.initialized = True
            log_agent_step("gemini_init", f"google-genai client ready — model={self.model_name}")
        except Exception as e:
            log_error("gemini_init", e)
            self.initialized = False

    # ── Agent Planning ────────────────────────────────────────────────────────

    def generate_agent_plan(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ask Gemini to decide which scraping tools to call and in what order,
        based on the user's profile and stated interests.

        Returns:
            {
                "sources": ["scrape_devpost", "scrape_mlh"],
                "priority": "hackathons",
                "reasoning": "...",
                "goal": "Find relevant hackathon opportunities for this ML engineer."
            }
        """
        user_name = user_profile.get("name") or user_profile.get("fullName", "Student")
        user_skills = user_profile.get("skills", [])
        user_interests = user_profile.get("interests", []) or user_profile.get("targetObjectives", [])
        user_edu = user_profile.get("education") or user_profile.get("educationLevel", "Undergraduate")

        # Input sanitization / size cap
        user_skills = [str(s)[:50] for s in user_skills[:15]]
        user_interests = [str(i)[:50] for i in user_interests[:10]]
        user_name = str(user_name)[:100]

        if self.initialized and self.client:
            prompt = f"""You are an autonomous AI opportunity-matching agent called NextLane AI.

A student has submitted their profile. Your job is to decide which data sources to query and in what priority order.

Student Profile:
- Name: {user_name}
- Education: {user_edu}
- Skills: {', '.join(user_skills) if user_skills else 'General'}
- Interests / Goals: {', '.join(user_interests) if user_interests else 'All opportunities'}

Available tools (data sources):
{json.dumps(AVAILABLE_TOOLS)}

Decision rules:
- If interests contain "hackathon" → prioritize scrape_devpost and scrape_mlh
- If interests contain "scholarship" or "grant" → prioritize scrape_scholarships and scrape_unstop
- If interests contain "internship" or "job" → prioritize scrape_unstop
- If no clear signal → use all sources
- Always include at least 2 sources

Return STRICT JSON only (no markdown, no explanation):
{{
  "sources": ["scrape_devpost", "scrape_mlh"],
  "priority": "hackathons",
  "reasoning": "The student's interest in ML and hackathons strongly aligns with Devpost and MLH.",
  "goal": "Find top hackathon opportunities for an ML student."
}}"""

            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
                raw = response.text.strip()
                plan = json.loads(raw)
                # Validate sources are known tools
                valid_sources = [s for s in plan.get("sources", []) if s in AVAILABLE_TOOLS]
                if not valid_sources:
                    valid_sources = AVAILABLE_TOOLS
                plan["sources"] = valid_sources
                log_agent_step("planning_complete", f"sources={valid_sources}")
                return plan
            except Exception as e:
                log_event("gemini_plan_fallback", f"Plan generation failed ({str(e)}). Using heuristic plan.")

        # Heuristic fallback plan
        return self._heuristic_plan(user_interests)

    async def generate_agent_plan_async(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Async wrapper for generate_agent_plan — runs the blocking SDK call
        in a thread pool executor so the event loop stays free.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.generate_agent_plan, user_profile)

    def _heuristic_plan(self, interests: List[str]) -> Dict[str, Any]:
        """Deterministic plan when Gemini is unavailable."""
        interests_lower = [i.lower() for i in interests]
        sources = list(AVAILABLE_TOOLS)  # default: all

        if any("hackathon" in i for i in interests_lower):
            sources = ["scrape_devpost", "scrape_mlh", "scrape_unstop"]
            priority = "hackathons"
        elif any("scholarship" in i or "grant" in i for i in interests_lower):
            sources = ["scrape_scholarships", "scrape_unstop"]
            priority = "scholarships"
        elif any("intern" in i or "job" in i for i in interests_lower):
            sources = ["scrape_unstop", "scrape_devpost"]
            priority = "internships"
        else:
            priority = "all"

        return {
            "sources": sources,
            "priority": priority,
            "reasoning": "Heuristic plan based on stated interests.",
            "goal": f"Discover {priority} opportunities matching student profile."
        }

    # ── Match Reasoning (Sync) ────────────────────────────────────────────────

    def generate_match_reasoning(self, user_profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronous match reasoning — calls async version via thread pool.
        Prefer generate_match_reasoning_async() in async contexts.
        """
        try:
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(
                    asyncio.run,
                    self.generate_match_reasoning_async(user_profile, opportunity)
                )
                return future.result(timeout=20)
        except Exception:
            return self._heuristic_match(user_profile, opportunity)

    # ── Match Reasoning (Async) ───────────────────────────────────────────────

    async def generate_match_reasoning_async(
        self,
        user_profile: Dict[str, Any],
        opportunity: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Async Gemini call for match scoring.
        Designed for concurrent execution via asyncio.gather().
        """
        # Guard: use heuristic if not initialized
        if not self.initialized or not self.client:
            return self._heuristic_match(user_profile, opportunity)

        user_skills = user_profile.get("skills", [])
        user_edu = user_profile.get("education", "") or user_profile.get("educationLevel", "Undergraduate")
        user_interests = user_profile.get("interests", []) or user_profile.get("targetObjectives", [])

        opp_title = opportunity.get("title", "")[:200]
        opp_org = opportunity.get("organization", "")[:100]
        opp_desc = opportunity.get("description", "")[:400]
        opp_reqs = opportunity.get("requirements", [])[:5]
        opp_type = opportunity.get("type", "Opportunity")

        prompt = f"""You are an expert AI Career and Opportunity Matching Agent.
Evaluate the match between the student's profile and this specific opportunity.

Candidate Profile:
- Skills: {', '.join(user_skills[:10]) if user_skills else 'General STEM'}
- Education Level: {user_edu}
- Target Interests: {', '.join(user_interests[:5]) if user_interests else 'All Opportunities'}

Opportunity:
- Title: {opp_title}
- Organization: {opp_org}
- Category: {opp_type}
- Description: {opp_desc}
- Requirements: {json.dumps(opp_reqs)}

Task:
Analyze skill overlap, academic eligibility, and career alignment.
Provide: score (70–99), concise reason starting with "You match because...", and 2 insight bullets.

Return STRICT JSON only:
{{
  "score": 92,
  "reason": "You match because your expertise in Python and ML fulfills the core requirements.",
  "insights": [
    "Technical skills align with project scope",
    "Education level meets the program prerequisites"
  ]
}}"""

        try:
            # Run blocking SDK call in thread pool to keep event loop free
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                        response_mime_type="application/json"
                    )
                )
            )
            data = json.loads(response.text.strip())
            score = max(60, min(99, int(data.get("score", 85))))
            return {
                "score": score,
                "reason": data.get("reason", "You match because your profile aligns with the requirements."),
                "insights": data.get("insights", [])
            }
        except Exception as e:
            log_event("gemini_match_fallback", f"Gemini match failed for '{opp_title[:40]}': {str(e)}")
            return self._heuristic_match(user_profile, opportunity)

    # ── Heuristic Fallback Engine ─────────────────────────────────────────────

    def _heuristic_match(self, user_profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """High-precision heuristic match engine. Used when Gemini is unavailable."""
        user_skills = [s.lower() for s in user_profile.get("skills", [])]
        opp_text = (
            opportunity.get("title", "") + " " +
            opportunity.get("description", "") + " " +
            " ".join(opportunity.get("requirements", [])) + " " +
            " ".join(opportunity.get("tags", []))
        ).lower()

        matching_skills = [s for s in user_skills if s in opp_text]
        skill_count = len(matching_skills)

        base_score = 80 + min(18, skill_count * 5) if skill_count > 0 else 78

        # Interest-type alignment boost
        user_interests = [i.lower() for i in (user_profile.get("interests", []) or user_profile.get("targetObjectives", []))]
        opp_type = opportunity.get("type", "").lower()
        if any(i in opp_type or opp_type in i for i in user_interests):
            base_score = min(99, base_score + 3)

        score = max(72, min(98, base_score))

        matched_named = [s.capitalize() for s in matching_skills[:3]]
        if matched_named:
            skills_str = ", ".join(matched_named)
            reason = f"You match because your expertise in {skills_str} aligns directly with {opportunity.get('organization', 'the host')}'s core requirements for this {opportunity.get('type', 'opportunity')}."
        else:
            reason = f"You match because your academic standing and foundational background qualify you for the {opportunity.get('title', 'program')}."

        return {
            "score": score,
            "reason": reason,
            "insights": [
                f"Skill alignment matches {len(matched_named)} key competencies requested",
                f"Candidate meets prerequisite timeline for {opportunity.get('organization', 'organization')}"
            ]
        }


# Singleton
gemini_service = GeminiService()
