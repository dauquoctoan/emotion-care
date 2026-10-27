# Workers Go - Subproject Rules

This directory contains the background workers and message processors for Emotion Care Platform.

## 1. Services Overview
- `emotion-outbox-relay`: Polls `outbox_events` table in PostgreSQL and publishes events to Apache Kafka topics (Transactional Outbox Pattern).
- `emotion-notification-worker`: Consumes Kafka events (empathy reactions, nearby posts) and dispatches push notifications via Expo Push Notification service.

## 2. Go Standards & Concurrency Safety
- **Lifecycle & Graceful Shutdown**:
  - Always listen for `os.Interrupt` / `syscall.SIGTERM` to allow in-flight messages to drain before stopping.
  - Use `context.Context` for cancellation and timeouts across all I/O, database queries, and network calls.
- **Message Processing Semantics**:
  - Exactly-once / At-least-once: Commit message offsets only after successful processing or successful state transition in DB.
  - Implement idempotent handlers so repeated messages (e.g. duplicate Kafka deliveries) do not create duplicate notifications or inconsistent records.
- **Database & Kafka**:
  - Pool database connections cleanly using `database/sql` or `pgx`.
  - Batch queries when processing outbox rows (e.g., `LIMIT 100 FOR UPDATE SKIP LOCKED`).
- **Observability & Logging**:
  - Structured logging (JSON or standard key-value loggers).
  - Include event ID, device ID, and topic in error logs for traceability.
