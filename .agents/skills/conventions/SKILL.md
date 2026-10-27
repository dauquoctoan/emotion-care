---
name: conventions
description: Spring Boot and architecture conventions for Emotion Care Platform. Enforces Lombok, MapStruct, BaseResponse wrapper, constructor injection, clean REST URLs, and JPA best practices.
metadata:
  version: "1.0.0"
  domain: backend
  triggers: Spring Boot, Java, Maven, Spring Framework, REST API, JPA, Hibernate, emotion-care
  role: guide
  scope: conventions
  output-format: code
---

# Emotion Care Platform - Spring Boot Project Conventions

These conventions apply to ALL code generated or reviewed in the Emotion Care backend. Follow them strictly.

## Mandatory Rules

- **Lombok & MapStruct** — Use Lombok (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`) for clean entity/DTO models, and MapStruct mappers for type-safe, compile-time DTO ↔ Entity transformations.
- **Constructor Injection** — Use `@RequiredArgsConstructor` with `private final` dependencies (no field `@Autowired`).
- **Standard REST Response** — All Controller endpoints MUST wrap responses in `BaseResponse<T>` (`BaseResponse.of(...)`, `BaseResponse.ofPage(...)`, or `BaseResponse.ok()`).
- **RESTful Endpoints Standard** — All routes are standardized without `/api/v1` prefix:
  - Device: `/devices/me`, `/devices/me/settings`, `/devices/me/push-token`
  - Master data: `/categories`, `/reactions/types`
  - Posts & Empathy: `/posts`, `/posts/{id}`, `/posts/{id}/reactions`
- **Anonymous Device Security** — Identity is handled via `x-device-id` header or JWT bearer token. `JwtAuthenticationFilter` resolves device identity and assigns `ROLE_DEVICE`.
- **Database & Migration** — PostgreSQL 16 managed exclusively via Liquibase change logs (`db.changelog-master.xml`). `ddl-auto: validate`.
- **Multi-module Architecture** — Group ID: `com.emotioncare`:
  - `emotion-base`: Parent POM with centralized dependency management.
  - `emotion-core`: Shared kernel (BaseResponse, AuditTrail, Security, Exceptions).
  - `emotion-api-svc`: Business domains (device, emotion, reaction, outbox).
- **Transactional Outbox Pattern** — State changes emitting domain events must atomically persist to `outbox_events` within the same database transaction.
- **Jakarta Persistence** — Use `jakarta.persistence.*` (Spring Boot 3.x / Hibernate 6.x).

## Code Quality Standards

- Spring Boot 3.3.x and Java 17/21.
- `@Transactional(readOnly = true)` at service class level, `@Transactional` on mutating methods.
- `@Valid @RequestBody` on all POST/PUT/PATCH endpoints.
- Global exception handling centralized in `@RestControllerAdvice`.
- Avoid N+1 JPA queries: Use `@EntityGraph` or `JOIN FETCH` for relations accessed in feed/batch.
- Graceful shutdown configured (`server.shutdown: graceful`).
