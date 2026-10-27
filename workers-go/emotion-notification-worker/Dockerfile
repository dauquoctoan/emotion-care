# Stage 1: Build binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/notification-worker .

# Stage 2: Minimal runtime image (~15MB RAM footprint)
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

COPY --from=builder /app/notification-worker /app/notification-worker

USER 10001:10001

ENTRYPOINT ["/app/notification-worker"]
