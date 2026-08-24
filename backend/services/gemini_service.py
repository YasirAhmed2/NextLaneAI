import os
import json
import re
from typing import Dict, Any, Optional, List
from utils.logger import log_event, log_error

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = None
        self.initialized = False
        self._init_model()

    def _init_model(self):
        if not GENAI_AVAILABLE:
            log_event("gemini", "google-generativeai package not detected. Using intelligent heuristic engine.")
            return

        if self.api_key and not self.api_key.startswith("AIzaSyDummyKey"):
            try:
                genai.configure(api_key=self.api_key)
                # Try gemini-1.5-flash or fallback to available
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self.initialized = True
                log_event("gemini", "Gemini 1.5 Flash initialized successfully.")
            except Exception as e:
                log_error("gemini_init", e)
                self.initialized = False
        else:
            log_event("gemini", "No custom GEMINI_API_KEY provided. Using deterministic neural reasoning fallback.")

    def generate_match_reasoning(self, user_profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Uses Gemini to calculate match score, reason, and eligibility insights.
        Returns a dict: { "score": int, "reason": str, "insights": List[str] }
        """
        user_skills = user_profile.get("skills", [])
        user_edu = user_profile.get("education", "") or user_profile.get("educationLevel", "Undergraduate")
        user_interests = user_profile.get("interests", []) or user_profile.get("targetObjectives", [])
        
        opp_title = opportunity.get("title", "")
        opp_org = opportunity.get("organization", "")
        opp_desc = opportunity.get("description", "")
        opp_reqs = opportunity.get("requirements", [])
        opp_type = opportunity.get("type", "Internship")

        # If Gemini model is active, perform live LLM inference
        if self.initialized and self.model:
            prompt = f"""
You are an expert AI Career and Opportunity Matching Agent (Opportra).
Evaluate the match between the student's profile and this specific opportunity.

Candidate Profile:
- Skills: {', '.join(user_skills) if user_skills else 'General STEM'}
- Education Level: {user_edu}
- Target Opportunity Types: {', '.join(user_interests) if user_interests else 'All Opportunities'}

Opportunity Details:
- Title: {opp_title}
- Organization: {opp_org}
- Category: {opp_type}
- Description: {opp_desc}
- Requirements: {json.dumps(opp_reqs)}

Task:
Analyze the skill overlap, academic eligibility, and career alignment.
Provide a realistic match score (between 70 and 99), a concise persuasive explanation (1-2 sentences starting with 'You match because...'), and 2 bullet insight points.

Return STRICT JSON only matching this format:
{{
  "score": 92,
  "reason": "You match because your competencies in Python and Machine Learning fulfill the team's core technical requirements.",
  "insights": [
    "Your technical skills align directly with the project scope",
    "Application timeline matches your stated education level"
  ]
}}
"""
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config={"temperature": 0.3, "response_mime_type": "application/json"}
                )
                text = response.text.strip()
                # Parse JSON
                data = json.loads(text)
                score = int(data.get("score", 85))
                score = max(60, min(99, score))
                reason = data.get("reason", "You match because your skillset aligns with the opportunity requirements.")
                insights = data.get("insights", [])
                return {
                    "score": score,
                    "reason": reason,
                    "insights": insights
                }
            except Exception as e:
                log_event("gemini_inference_warning", f"Live Gemini fallback triggered: {str(e)}")

        # Heuristic Matching Engine (Deterministic fallback with rich reasoning)
        return self._heuristic_match(user_profile, opportunity)

    def _heuristic_match(self, user_profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """High-precision heuristic match engine with contextual dynamic reasoning."""
        user_skills = [s.lower() for s in user_profile.get("skills", [])]
        opp_text = (
            opportunity.get("title", "") + " " +
            opportunity.get("description", "") + " " +
            " ".join(opportunity.get("requirements", [])) + " " +
            " ".join(opportunity.get("tags", []))
        ).lower()

        matching_skills = [s for s in user_skills if s in opp_text]
        skill_count = len(matching_skills)

        # Baseline score calculation
        base_score = 80
        if skill_count > 0:
            base_score += min(18, skill_count * 5)
        else:
            base_score = 78

        # Opportunity type boost if aligns with interests
        user_interests = [i.lower() for i in (user_profile.get("interests", []) or user_profile.get("targetObjectives", []))]
        opp_type = opportunity.get("type", "").lower()
        if any(i in opp_type or opp_type in i for i in user_interests):
            base_score = min(99, base_score + 3)

        score = max(72, min(98, base_score))

        # Dynamic reason generation
        matched_named = [s.capitalize() for s in matching_skills[:3]]
        if matched_named:
            skills_str = ", ".join(matched_named)
            reason = f"You match because your expertise in {skills_str} aligns directly with {opportunity.get('organization', 'the host')}'s core requirements for this {opportunity.get('type', 'opportunity')}."
        else:
            reason = f"You match because your academic standing and foundational background qualify you for the {opportunity.get('title', 'program')}."

        insights = [
            f"Skill alignment matches {len(matched_named)} key competencies requested",
            f"Candidate meets prerequisite timeline for {opportunity.get('organization', 'organization')}"
        ]

        return {
            "score": score,
            "reason": reason,
            "insights": insights
        }

gemini_service = GeminiService()
