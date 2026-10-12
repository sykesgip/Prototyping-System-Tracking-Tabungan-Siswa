# ── Build Go backend ───────────────────────────────────────────────────────────
# frontend/dist/ sudah pre-built dan ada di repo — tidak perlu Node di sini.
FROM golang:1.22-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# ── Minimal runtime ────────────────────────────────────────────────────────────
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Jakarta

WORKDIR /app

COPY --from=backend-builder /app/backend/server .

# dist/ sudah ada di repo (pre-built), Railway tinggal copy langsung
COPY frontend/dist ./dist

ENV STATIC_DIR=/app/dist

EXPOSE 8080
ENTRYPOINT ["./server"]
