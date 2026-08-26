"""
services/missed_analysis.py — NextLane AI
Isolated Missed Opportunity Analysis Engine.

Analyzes missed deadlines, dismissed opportunities, and expired intake cycles to diagnose:
  - Root cause of missed window (late discovery, qualification gap, missing alert, etc.)
  - Recommended recovery actions (next intake cycle, similar open opportunities)
  - Preventive strategies for future intake cycles

DO NOT mix with matching logic — completely isolated module.
"""
import logging
from typing import Dict, Any, List, Optional
from services.gemini_service import gemini_service
from utils.logger import log_event, log_error

logger = logging.getLogger("nextlane_ai")


class MissedAnalysisEngine:
    """
    Advisor Agent for Missed Opportunities.
    Provides diagnostic root-cause analysis and recovery recommendations for missed items.
    """

    def analyze_missed_opportunities(
        self,
        user_profile: Dict[str, Any],
        missed_opportunities: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Analyzes a list of missed opportunities for a given user.

        Args:
            user_profile: User dict
            missed_opportunities: List of missed opportunity dicts

        Returns:
            {
                "success": bool,
                "missedCount": int,
                "overallDiagnosis": str,
                "rootCauses": List[Dict[str, Any]],
                "recoveryActions": List[str],
                "preventiveTips": List[str],
            }
        """
        if not missed_opportunities:
            return {
                "success": True,
                "missedCount": 0,
                "overallDiagnosis": "No missed opportunities detected in your timeline. Great job staying on track!",
                "rootCauses": [],
                "recoveryActions": ["Keep monitoring upcoming deadlines in your feeds."],
                "preventiveTips": ["Enable email alerts for instant deadline notifications."],
            }

        user_name = user_profile.get("name") or user_profile.get("fullName") or "Student"
        skills = user_profile.get("skills", [])
        education = user_profile.get("education") or user_profile.get("educationLevel") or "Undergraduate"

        opp_summaries = []
        for opp in missed_opportunities[:8]:
            opp_summaries.append(
                f"- {opp.get('title')} by {opp.get('organization')} (Type: {opp.get('type')}, Deadline: {opp.get('deadline')})"
            )

        prompt = f"""
You are the [Advisor Agent] for NextLane AI.
Analyze the following missed opportunities for candidate {user_name} ({education}, Skills: {', '.join(skills[:6])}):

Missed Opportunities List:
{chr(10).join(opp_summaries)}

Produce a JSON response with:
- "overallDiagnosis": 2-3 sentences summarizing why these opportunities were missed and the impact on the candidate's career trajectory.
- "rootCauses": Array of objects, each containing "opportunityTitle", "perceivedCause" (e.g., "Late System Ingestion", "Short Application Window", "Credential Preparation Delay"), and "mitigation".
- "recoveryActions": Array of 3-4 specific, actionable steps to recover or find alternative active intakes.
- "preventiveTips": Array of 3 strategic habits to prevent missing future deadlines.
"""
        try:
            response = gemini_service.client.models.generate_content(
                model=gemini_service.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.3,
                }
            )
            import json
            data = json.loads(response.text)

            result = {
                "success": True,
                "missedCount": len(missed_opportunities),
                "overallDiagnosis": data.get("overallDiagnosis", "Analysis complete for missed intake windows."),
                "rootCauses": data.get("rootCauses", []),
                "recoveryActions": data.get("recoveryActions", []),
                "preventiveTips": data.get("preventiveTips", []),
            }
            logger.info(f"[Advisor Agent] Missed analysis complete for {len(missed_opportunities)} items.")
            return result

        except Exception as e:
            log_error("missed_analysis_gemini", e)
            return {
                "success": False,
                "error": str(e),
                "missedCount": len(missed_opportunities),
                "overallDiagnosis": f"Diagnosed {len(missed_opportunities)} missed opportunities. Most items closed due to expired intake cycles.",
                "rootCauses": [
                    {
                        "opportunityTitle": opp.get("title", "Missed Opportunity"),
                        "perceivedCause": "Expired Application Intake Window",
                        "mitigation": "Target next upcoming intake cycle or similar global programs."
                    }
                    for opp in missed_opportunities[:5]
                ],
                "recoveryActions": [
                    "Search for similar recurring annual scholarships or rolling internship intakes.",
                    "Prepare recommendation letters and transcripts in advance for immediate submission."
                ],
                "preventiveTips": [
                    "Set proactive 7-day and 24-hour deadline reminders.",
                    "Bookmark upcoming opportunities early during discovery phases."
                ],
            }


missed_analysis_engine = MissedAnalysisEngine()
