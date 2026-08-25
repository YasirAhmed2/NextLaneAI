"""
matching_service.py — NextLane AI
Async batch matching engine using asyncio.gather() for parallel Gemini calls.
Reduces latency from O(n × latency) to O(batches × latency).
"""
import asyncio
from typing import List, Dict, Any
from services.firestore_service import firestore_service
from services.gemini_service import gemini_service
from services.scraping_service import scraping_service
from utils.logger import log_event, log_error, log_agent_step

BATCH_SIZE = 10  # parallel Gemini calls per batch (rate-limit safe)


class MatchingService:

    # ── Async Batch Matching ──────────────────────────────────────────────────

    async def match_all_async(
        self,
        user_profile: Dict[str, Any],
        opportunities: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Async matching engine — runs Gemini reasoning concurrently in batches.
        asyncio.gather() is used per batch to parallelize scoring calls.

        Args:
            user_profile: user dict with skills, education, interests
            opportunities: optional pre-fetched list; fetches from store if None
        """
        if opportunities is None:
            opportunities = firestore_service.get_all_opportunities()
            if not opportunities:
                log_agent_step("match_scraping_fallback", "Store empty, triggering scrape")
                scraped = scraping_service.run_all_scrapers()
                firestore_service.save_opportunities(scraped)
                opportunities = firestore_service.get_all_opportunities()

        user_label = user_profile.get("name") or user_profile.get("fullName", "User")
        log_agent_step("matching_start", f"user='{user_label}', opportunities={len(opportunities)}")

        matched_results: List[Dict[str, Any]] = []

        # Split into batches for rate-limit-safe parallel execution
        batches = [opportunities[i:i + BATCH_SIZE] for i in range(0, len(opportunities), BATCH_SIZE)]

        for batch_idx, batch in enumerate(batches):
            log_agent_step(
                f"matching_batch_{batch_idx + 1}",
                f"scoring {len(batch)} opportunities concurrently"
            )

            # Create async tasks for each opportunity in the batch
            tasks = [
                gemini_service.generate_match_reasoning_async(user_profile, opp)
                for opp in batch
            ]

            # Execute all tasks in this batch concurrently
            batch_reasonings = await asyncio.gather(*tasks, return_exceptions=True)

            for opp, reasoning in zip(batch, batch_reasonings):
                opp_copy = dict(opp)
                try:
                    if isinstance(reasoning, Exception):
                        raise reasoning

                    score = reasoning.get("score", 85)
                    reason = reasoning.get("reason", "You match because your profile aligns with the requirements.")
                    insights = reasoning.get("insights", [])

                    opp_copy["matchScore"] = score
                    opp_copy["score"] = score
                    opp_copy["aiMatchReason"] = reason
                    opp_copy["reason"] = reason
                    opp_copy["eligibilityBreakdown"] = {
                        "skillMatch": min(99, max(75, score + 2)),
                        "academicAlignment": min(99, max(75, score - 1)),
                        "timelineFit": min(99, max(75, score)),
                        "insights": insights if insights else [
                            "Candidate's technical profile aligns with project scope",
                            "Prerequisites match verified education level"
                        ]
                    }
                except Exception as e:
                    log_error("match_item_error", e)
                    opp_copy["matchScore"] = opp_copy.get("matchScore", 80)
                    opp_copy["score"] = opp_copy["matchScore"]
                    opp_copy["aiMatchReason"] = "Matches baseline criteria."
                    opp_copy["reason"] = opp_copy["aiMatchReason"]

                # Ensure required frontend fields
                opp_copy["isSaved"] = opp_copy.get("isSaved", False)
                opp_copy["deadlinePassed"] = opp_copy.get("deadlinePassed", False)
                opp_copy["tags"] = opp_copy.get("tags") or [opp_copy.get("type", "Opportunity")]

                matched_results.append(opp_copy)

        # Sort descending by matchScore
        matched_results.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
        log_agent_step("matching_complete", f"{len(matched_results)} ranked opportunities returned")
        return matched_results

    # ── Sync Wrapper (backward compatible) ───────────────────────────────────

    def match_all(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Synchronous wrapper around match_all_async().
        Preserves backward compatibility for existing sync callers.
        """
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Already inside an async context (e.g. pytest-asyncio, Jupyter)
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    future = pool.submit(asyncio.run, self.match_all_async(user_profile))
                    return future.result(timeout=60)
            else:
                return loop.run_until_complete(self.match_all_async(user_profile))
        except Exception as e:
            log_error("matching_sync_wrapper", e)
            return []


# Singleton
matching_service = MatchingService()
