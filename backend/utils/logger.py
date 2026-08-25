import logging
import sys
import datetime

# Configure structured logger for NextLane AI Agent
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("nextlane_ai")


def log_event(event_type: str, details: str):
    """General event logger."""
    logger.info(f"[{event_type.upper()}] {details}")


def log_error(event_type: str, error: Exception):
    """Error logger with stack trace."""
    logger.error(f"[{event_type.upper()}] Error: {str(error)}", exc_info=True)


def log_agent_step(step: str, details: str = ""):
    """
    Structured agent step logger.
    Emits: [AGENT] Step: <step> — <details>
    """
    msg = f"[AGENT] Step: {step}"
    if details:
        msg += f" — {details}"
    logger.info(msg)


def log_tool_call(tool_name: str, result_count: int = 0):
    """Logs a tool call event with results count."""
    logger.info(f"[AGENT] Tool: {tool_name} executed -> {result_count} results")


def log_plan(plan: dict):
    """Logs the agent's generated plan."""
    sources = plan.get("sources", [])
    priority = plan.get("priority", "unknown")
    reasoning = plan.get("reasoning", "")
    logger.info(f"[AGENT] Plan generated — sources={sources}, priority={priority}, reasoning='{reasoning[:80]}...' " if len(reasoning) > 80 else f"[AGENT] Plan generated — sources={sources}, priority={priority}, reasoning='{reasoning}'")
