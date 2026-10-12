# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

# npm install lebih toleran terhadap memory limit dibanding npm ci
# --max-old-space-size membatasi heap Node agar tidak OOM di Railway free tier
RUN node --max-old-space-size=512 $(which npm) install --legacy-peer-deps

COPY frontend/ ./
RUN node --max-old-space-size=512 $(which npm) run build

# ── Stage 2: Build Go backend ──────────────────────────────────────────────────
FROM golang:1.25-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# ── Stage 3: Minimal runtime ───────────────────────────────────────────────────
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Jakarta

WORKDIR /app

# Copy Go binary
COPY --from=backend-builder /app/backend/server .

# Copy compiled React SPA
COPY --from=frontend-builder /app/frontend/dist ./dist

# Tell Go where the static files are
ENV STATIC_DIR=/app/dist

EXPOSE 8080
ENTRYPOINT ["./server"]
