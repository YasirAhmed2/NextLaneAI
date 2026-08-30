"""
utils/retry.py — NextLane AI
Provides production-grade HTTP fetch with exponential backoff, rate-limit
handling, and silent fallback. Used by all scrapers to handle transient errors.
"""
import time
import logging
from typing import Optional, Dict, Any

import requests
from requests import Response

logger = logging.getLogger("nextlane_ai")


def fetch_with_retry(
    url: str,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 10,
    max_retries: int = 3,
    backoff_base: float = 1.5,
    method: str = "GET",
    **kwargs: Any,
) -> Optional[Response]:
    """
    Performs an HTTP GET (or specified method) with exponential backoff retry.

    Handles:
      - 429 Too Many Requests  → waits backoff seconds then retries
      - 503 Service Unavailable → retries with backoff
      - Timeout exceptions      → retries with short delay
      - Connection errors       → retries with backoff
      - 4xx client errors       → returns None immediately (no retry)
      - 5xx server errors       → retries with backoff

    Args:
        url:          Target URL to fetch.
        headers:      Optional dict of HTTP headers.
        timeout:      Per-request timeout in seconds.
        max_retries:  Total number of attempts (including first).
        backoff_base: Base multiplier for exponential backoff (seconds).
        method:       HTTP method: "GET" or "POST".
        **kwargs:     Additional kwargs passed to requests.request().

    Returns:
        requests.Response if successful (status 200), else None.
    """
    attempt = 0
    last_exception: Optional[Exception] = None

    while attempt < max_retries:
        wait_secs = backoff_base ** attempt  # 1.5, 2.25, 3.375 ...

        try:
            response = requests.request(
                method,
                url,
                headers=headers,
                timeout=timeout,
                **kwargs,
            )

            if response.status_code == 200:
                return response

            # Rate limited — wait longer
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", wait_secs * 2))
                logger.warning(
                    "[RETRY] 429 rate limited at %s — waiting %ds (attempt %d/%d)",
                    url, retry_after, attempt + 1, max_retries
                )
                time.sleep(retry_after)
                attempt += 1
                continue

            # Server errors — retry
            if response.status_code in (500, 502, 503, 504):
                logger.warning(
                    "[RETRY] %d server error at %s — backoff %.1fs (attempt %d/%d)",
                    response.status_code, url, wait_secs, attempt + 1, max_retries
                )
                time.sleep(wait_secs)
                attempt += 1
                continue

            # 4xx client error — not retryable
            if 400 <= response.status_code < 500:
                logger.warning(
                    "[RETRY] %d client error at %s — not retrying",
                    response.status_code, url
                )
                return None

            # Other non-200 — retry once
            logger.warning(
                "[RETRY] Unexpected status %d at %s — backoff %.1fs",
                response.status_code, url, wait_secs
            )
            time.sleep(wait_secs)
            attempt += 1

        except requests.exceptions.Timeout:
            logger.warning(
                "[RETRY] Timeout at %s — backoff %.1fs (attempt %d/%d)",
                url, wait_secs, attempt + 1, max_retries
            )
            time.sleep(wait_secs)
            attempt += 1
            last_exception = TimeoutError(f"Timeout after {timeout}s: {url}")

        except requests.exceptions.ConnectionError as e:
            logger.warning(
                "[RETRY] Connection error at %s — backoff %.1fs (attempt %d/%d): %s",
                url, wait_secs, attempt + 1, max_retries, str(e)
            )
            time.sleep(wait_secs)
            attempt += 1
            last_exception = e

        except requests.exceptions.RequestException as e:
            logger.error("[RETRY] Unrecoverable request error at %s: %s", url, str(e))
            return None

    if last_exception:
        logger.error(
            "[RETRY] All %d attempts exhausted for %s. Last error: %s",
            max_retries, url, str(last_exception)
        )
    return None


# ── Async variant using aiohttp ──────────────────────────────────────────────

async def fetch_with_retry_async(
    url: str,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 10,
    max_retries: int = 3,
    backoff_base: float = 1.5,
) -> Optional[Dict[str, Any]]:
    """
    Async HTTP GET with exponential backoff retry using aiohttp.
    Returns parsed JSON dict on success, None on failure.

    This is a truly non-blocking alternative to fetch_with_retry()
    for use in async contexts.
    """
    import asyncio

    try:
        import aiohttp
    except ImportError:
        logger.warning("[RETRY] aiohttp not installed — falling back to sync fetch in executor")
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: fetch_with_retry(url, headers=headers, timeout=timeout, max_retries=max_retries)
        )
        if response and response.status_code == 200:
            try:
                return response.json()
            except Exception:
                return None
        return None

    attempt = 0
    last_exception: Optional[Exception] = None

    async with aiohttp.ClientSession() as session:
        while attempt < max_retries:
            wait_secs = backoff_base ** attempt

            try:
                async with session.get(
                    url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=timeout),
                ) as response:
                    if response.status == 200:
                        return await response.json()

                    if response.status == 429:
                        retry_after = int(response.headers.get("Retry-After", wait_secs * 2))
                        logger.warning(
                            "[RETRY-ASYNC] 429 at %s — waiting %ds (attempt %d/%d)",
                            url, retry_after, attempt + 1, max_retries
                        )
                        await asyncio.sleep(retry_after)
                        attempt += 1
                        continue

                    if response.status in (500, 502, 503, 504):
                        logger.warning(
                            "[RETRY-ASYNC] %d at %s — backoff %.1fs (attempt %d/%d)",
                            response.status, url, wait_secs, attempt + 1, max_retries
                        )
                        await asyncio.sleep(wait_secs)
                        attempt += 1
                        continue

                    if 400 <= response.status < 500:
                        logger.warning("[RETRY-ASYNC] %d client error at %s — not retrying", response.status, url)
                        return None

                    await asyncio.sleep(wait_secs)
                    attempt += 1

            except asyncio.TimeoutError:
                logger.warning(
                    "[RETRY-ASYNC] Timeout at %s — backoff %.1fs (attempt %d/%d)",
                    url, wait_secs, attempt + 1, max_retries
                )
                await asyncio.sleep(wait_secs)
                attempt += 1
                last_exception = TimeoutError(f"Timeout after {timeout}s: {url}")

            except aiohttp.ClientError as e:
                logger.warning(
                    "[RETRY-ASYNC] Client error at %s — backoff %.1fs (attempt %d/%d): %s",
                    url, wait_secs, attempt + 1, max_retries, str(e)
                )
                await asyncio.sleep(wait_secs)
                attempt += 1
                last_exception = e

    if last_exception:
        logger.error(
            "[RETRY-ASYNC] All %d attempts exhausted for %s. Last error: %s",
            max_retries, url, str(last_exception)
        )
    return None
