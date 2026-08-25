# ── NextLane AI Backend — Cloud Run Dockerfile ────────────────────────────────
# Multi-stage build for minimal image size and fast cold starts.
# Compatible with Google Cloud Run (listens on PORT env var, default 8080).

FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PORT=8080

# Install system deps for BeautifulSoup lxml parser
RUN apt-get update && apt-get install -y --no-install-recommends \
        libxml2 \
        libxslt1.1 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install Python dependencies ───────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy application code ─────────────────────────────────────────────────────
COPY . .

# Create data directory for local JSON store fallback
RUN mkdir -p /app/data

# ── Health check ──────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# ── Cloud Run: listen on $PORT (injected at runtime) ─────────────────────────
EXPOSE ${PORT}

# Use exec form for proper signal handling
CMD exec uvicorn main:app \
        --host 0.0.0.0 \
        --port ${PORT} \
        --workers 1 \
        --log-level info \
        --access-log
