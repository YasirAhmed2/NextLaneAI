"""
config.py — NextLane AI
========================
Centralized configuration using Pydantic Settings (with fallback).

All environment variables are loaded here and accessed via the `settings` singleton.
In production (Cloud Run), values come from environment variables and Secret Manager.
In development, values are loaded from .env via python-dotenv.
"""
import os
from typing import List, Optional

try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
    _HAS_PYDANTIC_SETTINGS = True
except ImportError:
    try:
        from pydantic import BaseSettings, Field  # type: ignore
        _HAS_PYDANTIC_SETTINGS = True
    except ImportError:
        _HAS_PYDANTIC_SETTINGS = False


if _HAS_PYDANTIC_SETTINGS:
    class Settings(BaseSettings):  # type: ignore
        """Application settings loaded from environment variables."""

        # ── Google Gemini AI ─────────────────────────────────────────────────
        GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
        GEMINI_MODEL: str = Field(default="gemini-2.5-flash", description="Gemini model name")

        # ── FastAPI Server ───────────────────────────────────────────────────
        PORT: int = Field(default=8080, description="Server port (Cloud Run injects this)")
        HOST: str = Field(default="0.0.0.0", description="Server bind host")

        # ── Authentication ───────────────────────────────────────────────────
        JWT_SECRET: str = Field(default="", description="JWT signing secret")

        # ── Email / Notifications ────────────────────────────────────────────
        EMAIL_USER: str = Field(default="", description="SMTP sender email")
        EMAIL_PASS: str = Field(default="", description="SMTP app password")
        BREVO_API_KEY: str = Field(default="", description="Brevo/SendinBlue API key")
        DASHBOARD_URL: str = Field(default="http://localhost:5000", description="Frontend URL for email CTAs")

        # ── Google Cloud / Firestore ─────────────────────────────────────────
        GOOGLE_APPLICATION_CREDENTIALS: str = Field(default="", description="Path to GCP service account JSON")
        GOOGLE_CLOUD_PROJECT: str = Field(default="", description="GCP project ID")

        # ── Environment & CORS ───────────────────────────────────────────────
        ENVIRONMENT: str = Field(default="development", description="'development' or 'production'")
        ALLOWED_ORIGINS: str = Field(
            default="http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000,http://127.0.0.1:3000",
            description="Comma-separated CORS origins",
        )

        # ── Logging ──────────────────────────────────────────────────────────
        LOG_FORMAT: str = Field(default="auto", description="'json' for Cloud Run, 'text' for local dev, 'auto' to detect")
        LOG_LEVEL: str = Field(default="INFO", description="Python log level")

        # ── Derived helpers ──────────────────────────────────────────────────

        @property
        def is_production(self) -> bool:
            return self.ENVIRONMENT.lower() == "production"

        @property
        def cors_origins(self) -> List[str]:
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

        @property
        def use_json_logging(self) -> bool:
            if self.LOG_FORMAT == "json":
                return True
            if self.LOG_FORMAT == "text":
                return False
            return self.is_production or bool(os.getenv("K_SERVICE"))

        @property
        def data_dir(self) -> str:
            """Writable data directory. Cloud Run only allows /tmp for writes."""
            if self.is_production or os.getenv("K_SERVICE"):
                return "/tmp/data"
            return os.path.join(os.path.dirname(__file__), "data")

        model_config = {
            "env_file": ".env",
            "env_file_encoding": "utf-8",
            "case_sensitive": True,
            "extra": "ignore",
        }

    settings = Settings()

else:
    # Resilient fallback if pydantic-settings is not installed locally
    class ManualSettings:
        def __init__(self):
            self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
            self.GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            self.PORT = int(os.getenv("PORT", 8080))
            self.HOST = os.getenv("HOST", "0.0.0.0")
            self.JWT_SECRET = os.getenv("JWT_SECRET", "")
            self.EMAIL_USER = os.getenv("EMAIL_USER", "")
            self.EMAIL_PASS = os.getenv("EMAIL_PASS", "")
            self.BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
            self.DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://localhost:5000")
            self.GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
            self.GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
            self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
            self.ALLOWED_ORIGINS = os.getenv(
                "ALLOWED_ORIGINS",
                "http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000,http://127.0.0.1:3000"
            )
            self.LOG_FORMAT = os.getenv("LOG_FORMAT", "auto")
            self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

        @property
        def is_production(self) -> bool:
            return self.ENVIRONMENT.lower() == "production"

        @property
        def cors_origins(self) -> List[str]:
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

        @property
        def use_json_logging(self) -> bool:
            if self.LOG_FORMAT == "json":
                return True
            if self.LOG_FORMAT == "text":
                return False
            return self.is_production or bool(os.getenv("K_SERVICE"))

        @property
        def data_dir(self) -> str:
            if self.is_production or os.getenv("K_SERVICE"):
                return "/tmp/data"
            return os.path.join(os.path.dirname(__file__), "data")

    settings = ManualSettings()
