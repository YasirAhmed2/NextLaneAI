"""
utils/logger.py — NextLane AI
==============================
Structured logging for Cloud Run compatibility.

- Production (Cloud Run): JSON format compatible with Google Cloud Logging.
- Development: Human-readable text format.
- Auto-detects via K_SERVICE env var or ENVIRONMENT setting.

All log functions are backward-compatible drop-in replacements.
"""
import json
import logging
import sys
import time
import uuid
from contextvars import ContextVar
from typing import Optional

# ── Request context (set per-request by middleware) ──────────────────────────
_request_id: ContextVar[str] = ContextVar("request_id", default="")


def set_request_id(rid: str) -> None:
    """Set request ID for the current async context."""
    _request_id.set(rid)


def get_request_id() -> str:
    """Get current request ID."""
    return _request_id.get("")


def generate_request_id() -> str:
    """Generate a short request ID."""
    return uuid.uuid4().hex[:12]


# ── JSON Formatter for Cloud Logging ─────────────────────────────────────────

class CloudLoggingFormatter(logging.Formatter):
    """
    Emits logs as single-line JSON objects compatible with Google Cloud Logging.
    Maps Python log levels to Cloud Logging severity levels.
    """

    LEVEL_MAP = {
        "DEBUG": "DEBUG",
        "INFO": "INFO",
        "WARNING": "WARNING",
        "ERROR": "ERROR",
        "CRITICAL": "CRITICAL",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "severity": self.LEVEL_MAP.get(record.levelname, "DEFAULT"),
            "message": record.getMessage(),
            "component": record.name,
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S.000Z"),
        }

        # Add request context if available
        rid = get_request_id()
        if rid:
            log_entry["requestId"] = rid

        # Add extra fields if present
        if hasattr(record, "extra_fields") and record.extra_fields:
            log_entry.update(record.extra_fields)

        # Add exception info
        if record.exc_info and record.exc_info[1]:
            log_entry["error"] = {
                "type": type(record.exc_info[1]).__name__,
                "message": str(record.exc_info[1]),
            }
            log_entry["stack_trace"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str, ensure_ascii=False)


class TextFormatter(logging.Formatter):
    """Human-readable formatter for local development."""

    def format(self, record: logging.LogRecord) -> str:
        rid = get_request_id()
        prefix = f"[{rid}] " if rid else ""
        timestamp = self.formatTime(record, "%H:%M:%S")
        return f"{timestamp} [{record.levelname}] {prefix}{record.getMessage()}"


# ── Configure logging ────────────────────────────────────────────────────────

def _setup_logging() -> logging.Logger:
    """Configure the root nextlane_ai logger with appropriate formatter."""
    import os

    # Detect environment
    environment = os.getenv("ENVIRONMENT", "development")
    log_format = os.getenv("LOG_FORMAT", "auto")
    log_level = os.getenv("LOG_LEVEL", "INFO")

    use_json = False
    if log_format == "json":
        use_json = True
    elif log_format == "text":
        use_json = False
    else:  # auto
        use_json = environment.lower() == "production" or bool(os.getenv("K_SERVICE"))

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(CloudLoggingFormatter() if use_json else TextFormatter())
    root_logger.addHandler(handler)

    # Suppress noisy third-party loggers
    for noisy in ["urllib3", "httpcore", "httpx", "google.auth", "google.api_core"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)

    app_logger = logging.getLogger("nextlane_ai")
    app_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    return app_logger


logger = _setup_logging()


# ── Public API (backward-compatible) ─────────────────────────────────────────

def log_event(event_type: str, details: str) -> None:
    """General event logger."""
    logger.info(f"[{event_type.upper()}] {details}")


def log_error(event_type: str, error: Exception) -> None:
    """Error logger with stack trace."""
    logger.error(f"[{event_type.upper()}] Error: {str(error)}", exc_info=True)


def log_agent_step(step: str, details: str = "") -> None:
    """
    Structured agent step logger.
    Emits: [AGENT] Step: <step> — <details>
    """
    msg = f"[AGENT] Step: {step}"
    if details:
        msg += f" — {details}"
    logger.info(msg)


def log_tool_call(tool_name: str, result_count: int = 0) -> None:
    """Logs a tool call event with results count."""
    logger.info(f"[AGENT] Tool: {tool_name} executed -> {result_count} results")


def log_plan(plan: dict) -> None:
    """Logs the agent's generated plan."""
    sources = plan.get("sources", [])
    priority = plan.get("priority", "unknown")
    reasoning = plan.get("reasoning", "")
    if len(reasoning) > 80:
        logger.info(f"[AGENT] Plan generated — sources={sources}, priority={priority}, reasoning='{reasoning[:80]}...'")
    else:
        logger.info(f"[AGENT] Plan generated — sources={sources}, priority={priority}, reasoning='{reasoning}'")
