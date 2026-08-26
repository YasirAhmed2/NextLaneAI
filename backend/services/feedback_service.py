"""
services/feedback_service.py — NextLane AI
Non-intrusive User Feedback & Behavior Memory Service.

Persists user interaction feedback (saves, dismissals, applications, feedback ratings)
to Firestore collection `user_feedback` (or local JSON store fallback).

Provides preferences weighting helpers without interfering with baseline matching algorithms.
"""
import os
import json
import datetime
import logging
from typing import Dict, Any, List, Optional
from utils.logger import log_event, log_error

logger = logging.getLogger("nextlane_ai")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
FEEDBACK_FILE = os.path.join(DATA_DIR, "user_feedback_store.json")


class FeedbackService:
    """
    Feedback Agent service.
    Records user interactions and calculates optional preference weights.
    """

    def __init__(self):
        self.feedback_memory: List[Dict[str, Any]] = []
        self._load_local_feedback()

    def _load_local_feedback(self):
        try:
            if os.path.exists(FEEDBACK_FILE):
                with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                    self.feedback_memory = json.load(f)
                logger.info(f"[Feedback Agent] Loaded {len(self.feedback_memory)} feedback records from cache.")
        except Exception as e:
            log_error("feedback_load", e)

    def _persist_local_feedback(self):
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
                json.dump(self.feedback_memory[-500:], f, indent=2)
        except Exception as e:
            log_error("feedback_persist", e)

    def record_feedback(
        self,
        user_id: str,
        opportunity_id: str,
        action: str,  # 'save' | 'dismiss' | 'apply' | 'thumbs_up' | 'thumbs_down'
        opportunity_type: Optional[str] = None,
        feedback_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Stores user feedback in Firestore collection `user_feedback` or local store.

        Returns confirmation dict.
        """
        record = {
            "id": f"fb-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{abs(hash(user_id + opportunity_id)) % 10000}",
            "userId": user_id,
            "opportunityId": opportunity_id,
            "action": action,
            "opportunityType": opportunity_type or "General",
            "feedbackText": feedback_text or "",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }

        # Try Firestore first
        try:
            from services.firestore_service import firestore_service
            if firestore_service.use_firestore and firestore_service.db:
                firestore_service.db.collection("user_feedback").document(record["id"]).set(record)
                logger.info(f"[Feedback Agent] Saved feedback to Firestore `user_feedback` ({action} on {opportunity_id})")
        except Exception as e:
            log_error("firestore_feedback_save", e)

        # Always record in memory/local store for continuity
        self.feedback_memory.append(record)
        self._persist_local_feedback()
        logger.info(f"[Feedback Agent] Recorded action='{action}' user='{user_id}' opp='{opportunity_id}'")

        return {
            "success": True,
            "feedbackId": record["id"],
            "action": action,
            "recordedAt": record["timestamp"],
        }

    def get_user_feedback(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves feedback records for a specific user."""
        return [f for f in self.feedback_memory if f.get("userId") == user_id]

    def apply_feedback_weights(
        self,
        scored_opportunities: List[Dict[str, Any]],
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Applies optional preference weighting based on past user interaction history.
        Does NOT break existing scoring schema — only adjusts ordering/annotations if feedback exists.
        """
        user_feedbacks = self.get_user_feedback(user_id)
        if not user_feedbacks:
            return scored_opportunities

        saved_ids = {f["opportunityId"] for f in user_feedbacks if f["action"] == "save"}
        dismissed_ids = {f["opportunityId"] for f in user_feedbacks if f["action"] == "dismiss"}

        results = []
        for opp in scored_opportunities:
            item = dict(opp)
            opp_id = item.get("id")
            if opp_id in saved_ids:
                item["matchScore"] = min(99, (item.get("matchScore") or 80) + 3)
                item["aiMatchReason"] = item.get("aiMatchReason", "") + " (Boosted: saved in your portfolio)"
            elif opp_id in dismissed_ids:
                item["matchScore"] = max(50, (item.get("matchScore") or 80) - 15)
            results.append(item)

        results.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
        logger.info(f"[Feedback Agent] Applied history weights for user '{user_id}' across {len(results)} items.")
        return results


feedback_service = FeedbackService()
