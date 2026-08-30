# ── NextLane AI Backend — Cloud Run Production Dockerfile ─────────────────────
# Multi-stage build for minimal image size, fast cold starts, and maximum security.
# Compatible with Google Cloud Run (listens on PORT env var, default 8080).

# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libxml2-dev \
        libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    ENVIRONMENT=production \
    PORT=8080

# Runtime libraries for lxml & curl for debugging
RUN apt-get update && apt-get install -y --no-install-recommends \
        libxml2 \
        libxslt1.1 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Ensure permissions for non-root user and /tmp
RUN chown -R appuser:appgroup /app && \
    mkdir -p /tmp/data && \
    chown -R appuser:appgroup /tmp/data

USER appuser

# Cloud Run injects PORT at container startup
EXPOSE ${PORT}

# Exec form for clean SIGTERM/SIGINT propagation on scale-down
CMD exec uvicorn main:app \
    --host 0.0.0.0 \
    --port ${PORT} \
    --workers 1 \
    --log-level info \
    --access-log \
    --timeout-keep-alive 65
