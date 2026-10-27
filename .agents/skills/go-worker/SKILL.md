---
name: go-worker-engineering
description: Design, implement, review, and refactor production-oriented Go workers using Clean Code, pragmatic Clean Architecture, reliable message processing, concurrency safety, and testable design.
---

# Go Worker Engineering Skill

## 1. Mission

Build Go workers that are understandable, testable, observable, and resilient to partial failure.

Optimize for:
1. Correctness and data integrity.
2. Explicit lifecycle and bounded resource use.
3. Simplicity and maintainability.
4. Operational visibility.
5. Performance supported by evidence.

Do not introduce architecture, interfaces, or patterns merely to appear enterprise-grade.

## 2. Start by understanding the task

Before changing code:

- Inspect `go.mod`, existing package layout, entry points, configuration, tests, and deployment setup.
- Identify the worker type: queue consumer, scheduled job, polling loop, stream processor, or background task.
- Identify delivery semantics and failure behavior: at-most-once, at-least-once, retries, acknowledgements, ordering, and duplicate delivery.
- Identify data boundaries: database transactions, external APIs, caches, and message broker.
- Follow existing conventions unless they create a concrete correctness or maintainability problem.
- Do not perform a broad rewrite when a small, safe change is sufficient.

If a requirement is ambiguous and affects data loss, duplicate processing, ordering, or security, ask for clarification or state the assumption explicitly.

## 3. Pragmatic architecture

Prefer package boundaries based on business capability and ownership, not only technical labels.

Example for a medium-sized worker:

```text
.
├── cmd/
│   └── event-worker/
│       └── main.go
├── internal/
│   ├── config/
│   ├── worker/
│   │   ├── runner.go
│   │   └── handler.go
│   ├── order/
│   │   ├── model.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── messaging/
│   │   └── consumer.go
│   └── storage/
│       └── postgres_order_repository.go
├── migrations/
├── go.mod
└── go.sum
```

This is an example, not a mandatory template. Keep small workers smaller.

### Dependency direction

- `cmd/.../main.go` wires configuration and concrete implementations together.
- Business/application logic should not depend directly on a broker SDK, database driver, or cloud SDK.
- Put interfaces near the code that consumes them when this makes the dependency clearer.
- Keep infrastructure adapters at the outer edge.
- Use `internal/` for implementation that should not be imported by other modules.
- Add `pkg/` only when a package is intentionally designed and supported for external reuse.
- Avoid generic packages such as `common`, `utils`, `base`, or `helpers` becoming dumping grounds.

### Composition root

Construct dependencies in `main` or a small bootstrap package. Pass dependencies explicitly.

Avoid package-level mutable state and hidden initialization side effects.

## 4. Clean Code rules

### Naming

- Use short, precise names consistent with Go conventions.
- Prefer `ctx`, `cfg`, `repo`, `consumer` only when their meaning is clear in local scope.
- Avoid redundant package names, e.g. `order.OrderService` when `order.Service` is sufficient.
- Name booleans as predicates: `isReady`, `hasPermission`, `shouldRetry`.
- Use domain language rather than vague names such as `data`, `process`, or `handle` when more specific names are available.

### Functions

- One function should have one clear reason to change.
- Keep orchestration readable from top to bottom.
- Extract a function when it names a meaningful operation, removes duplication, or isolates complexity—not merely to reduce line count.
- Avoid boolean parameters that make call sites unclear; use a named option or separate methods when appropriate.
- Validate inputs at trust boundaries.
- Do not silently swallow errors.

### Errors

- Return errors to the layer that can make a meaningful decision.
- Add context with `%w` when callers need to inspect or wrap the original error.
- Use sentinel or typed errors only when callers need stable programmatic classification.
- Do not compare error strings.
- Do not log the same error at every layer. Log it where the failure is handled or where useful context is available.
- Never expose secrets, credentials, full authorization headers, or sensitive payloads in errors or logs.

Example:

```go
if err := repo.Save(ctx, order); err != nil {
    return fmt.Errorf("save order %s: %w", order.ID, err)
}
```

### Avoid

- Giant handlers that parse messages, execute business rules, query the DB, call APIs, and acknowledge messages in one function.
- Premature generic frameworks.
- Unnecessary getters/setters for simple Go structs.
- Deep nesting when guard clauses improve clarity.
- `panic` for expected runtime failures.
- Ignoring errors with `_` unless the omission is intentional and documented.

## 5. Worker lifecycle and cancellation

- Accept a `context.Context` for operations that can block on I/O or need cancellation.
- Do not store request contexts in long-lived structs.
- Propagate deadlines and cancellation to database calls and external clients.
- Ensure every goroutine has a clear owner and termination path.
- Use `signal.NotifyContext` or the existing application lifecycle mechanism for shutdown.
- On shutdown, stop accepting new work, allow bounded in-flight completion, then close resources.
- Do not use unbounded waits during shutdown.
- Close resources according to ownership; avoid closing shared resources from multiple layers.

Illustrative shape:

```go
func Run(ctx context.Context) error {
    for {
        if err := ctx.Err(); err != nil {
            return err
        }

        msg, err := consumer.Receive(ctx)
        if err != nil {
            if ctx.Err() != nil {
                return nil
            }
            if isTemporary(err) {
                continue // Apply bounded backoff in real implementations.
            }
            return fmt.Errorf("receive message: %w", err)
        }

        if err := handler.Handle(ctx, msg); err != nil {
            // The transport-specific policy decides retry, nack, or DLQ.
            if nackErr := consumer.Nack(ctx, msg, err); nackErr != nil {
                return fmt.Errorf("handle message: %w; nack message: %v", err, nackErr)
            }
            continue
        }

        if err := consumer.Ack(ctx, msg); err != nil {
            return fmt.Errorf("ack message: %w", err)
        }
    }
}
```

This is illustrative only. Adapt receive/ack semantics to the actual broker. Do not assume the same behavior for Kafka, RabbitMQ, SQS, or a custom queue.

## 6. Message reliability

Assume a message may be delivered more than once unless the transport and end-to-end design prove otherwise.

### Idempotency

- Make repeated processing safe where possible.
- Use a stable event/message ID or business idempotency key.
- Enforce uniqueness in the database when correctness depends on uniqueness.
- Do not rely only on an in-memory map for deduplication in a multi-instance worker.
- Define what happens if the same key arrives with a different payload.

### Retry policy

- Retry only failures that may recover.
- Bound attempts and total retry duration.
- Use exponential backoff with jitter for distributed dependencies.
- Avoid tight retry loops.
- Do not retry permanent validation or business-rule failures indefinitely.
- Define dead-letter or quarantine behavior and how failed messages are inspected/replayed.
- Make retry policy observable through metrics.

### Acknowledgement and offset commits

- Understand exactly when the broker considers a message complete.
- Do not acknowledge before required durable side effects are complete unless the design intentionally accepts loss.
- For Kafka, understand partition ordering and offset commit behavior; do not commit past unfinished work in a way that can lose messages.
- If processing concurrently, preserve safe commit semantics for the selected client library.
- Document the actual delivery guarantee rather than claiming “exactly once” without end-to-end evidence.

### Poison messages

- Validate message schema and required fields at the boundary.
- Prevent one permanently invalid message from blocking a partition or queue forever unless strict ordering explicitly requires it.
- Store enough sanitized metadata to diagnose failures.
- Define replay and remediation procedures.

## 7. Concurrency and backpressure

- Bound concurrency based on database pool size, downstream rate limits, memory, and message partitioning.
- Use a worker pool or semaphore when a fixed limit is required.
- Protect shared mutable state with synchronization or redesign to avoid sharing it.
- Do not start a goroutine per message without a resource bound.
- Do not close a channel from multiple senders; define a single owner for channel closure.
- Avoid using channels when a mutex or direct function call is simpler.
- Run `go test -race ./...` where supported.
- Consider ordering guarantees before parallelizing message handling.

Review every concurrent design for:
1. Who creates the goroutine?
2. Who cancels it?
3. What stops it?
4. What bounds its resource consumption?
5. How are errors returned?
6. What happens when one task fails?

## 8. Database consistency

- Pass context to database operations.
- Use parameterized queries; never concatenate untrusted values into SQL.
- Keep transactions around the smallest set of operations that must be atomic.
- Roll back on failure and handle commit errors.
- Avoid holding a transaction open while calling a slow external service.
- Understand isolation level, unique constraints, locking, and transaction retry requirements.
- Size connection pools in relation to worker concurrency.
- Add indexes based on query patterns and query plans, not speculation.

### Outbox pattern

Use a transactional outbox when a business state change and publishing an event must not diverge:

1. Update business data and insert an outbox record in one database transaction.
2. A separate publisher reads pending outbox records.
3. Publish and mark records according to a safe retry strategy.
4. Make consumers idempotent because a publish may be repeated.
5. Monitor outbox age, backlog, and publish failures.

Do not add an outbox if no atomic database-plus-message guarantee is needed.

## 9. Design patterns: use intentionally

### Dependency injection

Use constructor injection for dependencies needed by a service. Prefer explicit constructors over global service locators.

### Strategy

Use when there are genuinely interchangeable algorithms or policies, such as retry classification or product-specific processing. Do not create a strategy hierarchy for one fixed branch.

### Adapter

Use to isolate a third-party broker, database, or API from application logic. Keep vendor-specific types at the boundary.

### Repository

Use when persistence needs a meaningful boundary or multiple operations/implementations justify it. Do not wrap every SQL call in a one-method interface automatically.

### Decorator

Use for composable cross-cutting behavior such as metrics, tracing, or retries when it improves clarity. Avoid layers that merely forward every method.

### State machine

Use when processing has explicit states and allowed transitions, such as `pending -> processing -> completed/failed`. Define invalid transitions and recovery behavior.

### Avoid by default

- Abstract factories for a small fixed set of dependencies.
- Generic CRUD abstractions that erase domain meaning.
- CQRS/event sourcing without a concrete requirement.
- Interfaces created solely to mock a single trivial function.
- Clean Architecture layers that only forward arguments without enforcing a useful boundary.

## 10. Configuration and security

- Validate required configuration at startup and fail fast with actionable errors.
- Separate configuration from business logic.
- Set explicit timeouts for outbound network clients.
- Do not hardcode secrets or commit local secret files.
- Use least-privilege credentials.
- Validate untrusted message fields and external API responses.
- Apply payload size limits where the transport allows them.
- Avoid logging PII or tokens.
- Keep dependency versions controlled and review security updates.

## 11. Observability

Use structured logs and, where appropriate, metrics and tracing.

Useful dimensions include:
- worker/service name;
- operation name;
- message ID or correlation ID;
- processing result;
- retry attempt;
- duration;
- error category.

Metrics worth considering:
- messages received/succeeded/failed;
- retries and dead-letter count;
- processing latency;
- queue lag or consumer lag;
- active workers and saturation;
- database and downstream failures;
- outbox backlog and oldest pending age.

Avoid unbounded-cardinality metric labels such as raw user IDs, message IDs, or arbitrary error strings.

Health checks should distinguish process liveness from readiness to accept work.

## 12. Testing

Use the smallest test level that proves the behavior.

- Unit tests for business rules and error classification.
- Table-driven tests for multiple inputs and edge cases.
- Fakes for deterministic tests; mocks only when interaction assertions are useful.
- Integration tests for actual database constraints, transaction behavior, and broker semantics.
- End-to-end tests for critical flows when practical.
- Test cancellation, timeout, duplicate delivery, retry exhaustion, poison messages, and shutdown.
- Test that side effects are not duplicated when idempotency is required.
- Avoid tests that merely restate implementation details.

Run relevant checks, when available:

```bash
gofmt -w .
go vet ./...
go test ./...
go test -race ./...
```

Run `staticcheck ./...` if installed and configured. Do not claim checks passed unless they were actually run.

## 13. Performance

- Establish a baseline before optimizing.
- Use benchmarks and profiles for CPU, allocation, and contention problems.
- Reuse expensive clients and connections safely.
- Avoid unbounded buffering and unnecessary payload copies.
- Do not sacrifice correctness or readability for an unmeasured micro-optimization.

## 14. Definition of done

Before marking work complete, verify:

- [ ] Business behavior and assumptions are explicit.
- [ ] Errors are handled and classified correctly.
- [ ] Cancellation, timeout, and shutdown paths are safe.
- [ ] Concurrency is bounded and race risks considered.
- [ ] Retry, ack/commit, idempotency, and DLQ behavior are correct for the actual transport.
- [ ] Database changes preserve required consistency.
- [ ] Logs and metrics support diagnosis without exposing secrets.
- [ ] Tests cover normal, failure, and boundary cases.
- [ ] Formatting, tests, and static checks were run or limitations reported.
- [ ] The solution introduces no unnecessary layers or abstractions.

## 15. Expected response when using this skill

When implementing or reviewing code, provide:
1. A concise summary of the approach.
2. Important design choices and why they fit.
3. Files changed and their responsibilities.
4. Failure cases and reliability implications.
5. Tests/checks actually run and their results.
6. Remaining risks or assumptions.

Never claim a system is exactly-once, race-free, production-ready, or fully secure without evidence.
