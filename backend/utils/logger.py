import logging
import sys

# Configure structured colorful logger for Opportra
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Opportra-Agent] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("opportra")

def log_event(event_type: str, details: str):
    logger.info(f"[{event_type.upper()}] {details}")

def log_error(event_type: str, error: Exception):
    logger.error(f"[{event_type.upper()}] Error: {str(error)}", exc_info=True)
