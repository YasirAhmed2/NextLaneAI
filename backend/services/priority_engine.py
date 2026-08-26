"""
services/priority_engine.py — NextLane AI
Safe Priority Scoring Engine.

Calculates an additive `priority_score` (0-100) for opportunities without altering
the original `matchScore` or `score` fields.

Priority scoring combines:
  1. Base match score (matchScore)
  2. Deadline urgency boost (<24h / <48h deadline)
  3. Strategic goal alignment boost (if user goal provided)
  4. Verified company reputation boost
  5. Location / remote preference alignment
"""
import datetime
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("nextlane_ai")


class PriorityEngine:
    """
    Priority Scoring Engine.
    Enriches opportunities with a `priority_score` and `priority_level` ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD').
    Does NOT modify existing matchScore values.
    """

    def calculate_priority_score(
        self,
        opportunity: Dict[str, Any],
        user_profile: Dict[str, Any],
        goal: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Computes `priority_score` and returns an enriched copy of opportunity dict.

        Args:
            opportunity: Single opportunity dict
            user_profile: User profile dict
            goal: Optional explicit goal string

        Returns:
            Opportunity dict copy enriched with 'priority_score' and 'priority_level'.
        """
        opp = dict(opportunity)  # copy to keep original untouched
        base_match = int(opp.get("matchScore") or opp.get("score") or 75)

        priority = float(base_match)

        # 1. Deadline Urgency Boost
        deadline_str = opp.get("deadline", "").lower()
        deadline_date = opp.get("deadlineDate", "")
        urgent_flag = opp.get("urgent24h", False)

        if urgent_flag or "closing" in deadline_str or "<24h" in deadline_str:
            priority += 12.0
        elif deadline_date and len(deadline_date) >= 10:
            try:
                dl = datetime.date.fromisoformat(deadline_date[:10])
                days_left = (dl - datetime.date.today()).days
                if 0 <= days_left <= 2:
                    priority += 15.0
                elif 3 <= days_left <= 7:
                    priority += 8.0
            except Exception:
                pass

        # 2. Company Reputation Boost
        rep_score = opp.get("companyReputationScore", "")
        if "5.0" in rep_score or "4.9" in rep_score or "4.8" in rep_score:
            priority += 5.0
        if opp.get("isVerifiedCompany"):
            priority += 3.0

        # 3. Location Fit Boost
        user_loc = (user_profile.get("location") or "Pakistan").lower()
        opp_loc = opp.get("location", "").lower()
        if "remote" in opp_loc or "worldwide" in opp_loc or "global" in opp_loc:
            priority += 5.0
        elif user_loc and user_loc in opp_loc:
            priority += 8.0

        # 4. Strategic Goal Alignment Boost (if goal provided)
        if goal:
            goal_lower = goal.lower()
            opp_type = opp.get("type", "").lower()
            opp_title = opp.get("title", "").lower()
            opp_desc = opp.get("description", "").lower()

            if ("scholarship" in goal_lower or "grant" in goal_lower or "fellowship" in goal_lower) and opp_type == "scholarship":
                priority += 10.0
            elif ("internship" in goal_lower or "intern" in goal_lower) and opp_type == "internship":
                priority += 10.0
            elif ("hackathon" in goal_lower or "competition" in goal_lower) and opp_type == "hackathon":
                priority += 10.0
            elif ("job" in goal_lower or "career" in goal_lower) and opp_type == "job":
                priority += 10.0

            # Keyword match boost
            keywords = [w.strip() for w in goal_lower.split() if len(w) > 3]
            kw_hits = sum(1 for kw in keywords if kw in opp_title or kw in opp_desc)
            priority += min(10.0, kw_hits * 2.5)

        # Cap between 1 and 99
        final_priority = int(min(99, max(1, round(priority))))
        opp["priority_score"] = final_priority

        if final_priority >= 90:
            opp["priority_level"] = "CRITICAL"
        elif final_priority >= 80:
            opp["priority_level"] = "HIGH"
        elif final_priority >= 70:
            opp["priority_level"] = "MEDIUM"
        else:
            opp["priority_level"] = "STANDARD"

        return opp

    def prioritize_all(
        self,
        opportunities: List[Dict[str, Any]],
        user_profile: Dict[str, Any],
        goal: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Computes `priority_score` for a list of opportunities and returns them sorted by `priority_score` descending.
        Does NOT alter existing `matchScore` field.
        """
        scored = [self.calculate_priority_score(o, user_profile, goal) for o in opportunities]
        scored.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        logger.info(f"[Priority Agent] Calculated priority scores for {len(scored)} opportunities (goal='{goal or 'none'}').")
        return scored


priority_engine = PriorityEngine()
