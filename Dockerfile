# ── Build Go backend ───────────────────────────────────────────────────────────
# Semua deps di vendor/ — tidak ada go mod download, tidak ada network call.
# frontend/dist/ sudah pre-built ada di repo.
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -ldflags="-s -w" -o server ./cmd/server

# ── Minimal runtime ────────────────────────────────────────────────────────────
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Jakarta

WORKDIR /app

COPY --from=backend-builder /app/backend/server .
COPY frontend/dist ./dist

ENV STATIC_DIR=/app/dist

EXPOSE 8080
ENTRYPOINT ["./server"]
