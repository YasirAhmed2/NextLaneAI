"""
services/agent_planner.py — NextLane AI
Goal-driven Agent Planning Engine powered by Gemini.

Extends the baseline agent planning capability by accepting an explicit user goal
(e.g., "Find fully funded master's scholarships in Europe for AI research" or
 "Find remote machine learning internships closing in 30 days").

Generates a strategic execution plan including:
  - Selected tools / scrapers to execute
  - Priority category
  - Goal breakdown & milestone recommendations
  - Focus keywords & constraints
"""
import logging
from typing import Dict, Any, List, Optional
from services.gemini_service import gemini_service
from utils.logger import log_event, log_error

logger = logging.getLogger("nextlane_ai")


class AgentPlanner:
    """
    Goal-driven Planner Agent.
    Translates user profile + high-level strategic goal into an actionable tool execution plan.
    """

    def generate_goal_driven_plan(
        self,
        user_profile: Dict[str, Any],
        goal: str,
        available_tools: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Generates a strategic tool execution plan tailored to a specific user goal.

        Args:
            user_profile: User dict (name, skills, education, location, interests)
            goal: Explicit strategic goal string provided by user
            available_tools: Optional list of supported tool names

        Returns:
            {
                "goal": str,
                "sources": List[str],
                "priority": str,
                "reasoning": str,
                "focusKeywords": List[str],
                "milestones": List[str],
                "isGoalDriven": True
            }
        """
        if not available_tools:
            available_tools = [
                "scrape_linkedin_jobs",
                "scrape_indeed_jobs",
                "scrape_rozee_pk",
                "scrape_mustakbil",
                "scrape_glassdoor_jobs",
                "scrape_remoteok_jobs",
                "scrape_internee_pk",
                "scrape_international_scholarships",
                "scrape_iefa_scholarships",
                "scrape_international_student_scholarships",
                "scrape_masters_portal_scholarships",
                "scrape_scholars4dev",
                "scrape_opportunities_corner",
                "scrape_scholarships",
                "scrape_devpost",
                "scrape_unstop",
                "scrape_mlh",
            ]

        user_name = user_profile.get("name") or user_profile.get("fullName") or "Student"
        skills = user_profile.get("skills", [])
        education = user_profile.get("education") or user_profile.get("educationLevel") or "Undergraduate"
        location = user_profile.get("location") or "Global"

        prompt = f"""
You are the [Planner Agent] for NextLane AI — an autonomous opportunity gap discovery system.

Candidate Profile:
- Name: {user_name}
- Education: {education}
- Current Location: {location}
- Skills: {', '.join(skills[:10]) if skills else 'Computer Science / Engineering'}

Explicit Strategic Goal:
"{goal}"

Available Scraper Tools:
{', '.join(available_tools)}

Formulate a strategic execution plan. Produce a JSON object with:
- "sources": Array of 3-6 tool names selected from the Available Scraper Tools list that BEST serve this goal.
- "priority": One of "scholarships", "internships", "jobs", "hackathons", "research", or "all".
- "reasoning": 2-3 sentences explaining why these tools and priority were chosen for this specific goal.
- "focusKeywords": Array of 4-6 key terms to prioritize during matching.
- "milestones": Array of 3 strategic steps the applicant should take to achieve this goal.
"""
        try:
            response = gemini_service.client.models.generate_content(
                model=gemini_service.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.2,
                }
            )
            import json
            plan_data = json.loads(response.text)

            # Validate sources
            valid_sources = [s for s in plan_data.get("sources", []) if s in available_tools]
            if not valid_sources:
                valid_sources = available_tools[:5]

            result = {
                "goal": goal,
                "sources": valid_sources,
                "priority": plan_data.get("priority", "all"),
                "reasoning": plan_data.get("reasoning", f"Selected targeted scrapers to fulfill goal: '{goal}'."),
                "focusKeywords": plan_data.get("focusKeywords", skills[:4]),
                "milestones": plan_data.get("milestones", [
                    "Review high-match opportunities",
                    "Tailor CV & Statement of Interest for target positions",
                    "Submit applications before deadlines"
                ]),
                "isGoalDriven": True,
            }
            logger.info(f"[Planner Agent] Strategic plan generated for goal: '{goal[:60]}...' -> {valid_sources}")
            return result

        except Exception as e:
            log_error("agent_planner_gemini", e)
            # Safe fallback
            return {
                "goal": goal,
                "sources": available_tools[:6],
                "priority": "all",
                "reasoning": f"Fallback plan generated for goal: '{goal}'. Querying primary sources.",
                "focusKeywords": skills[:4] if skills else ["Software", "AI"],
                "milestones": ["Explore available opportunities", "Apply to matched roles"],
                "isGoalDriven": True,
            }


agent_planner = AgentPlanner()
