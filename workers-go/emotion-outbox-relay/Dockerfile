# Stage 1: Build binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/outbox-relay .

# Stage 2: Minimal runtime image (~15MB RAM footprint)
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

COPY --from=builder /app/outbox-relay /app/outbox-relay

USER 10001:10001

ENTRYPOINT ["/app/outbox-relay"]
