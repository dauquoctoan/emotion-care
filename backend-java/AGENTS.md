# Backend Java (Spring Boot 3.3.x) - Subproject Rules

This directory contains the core REST API backend for Emotion Care Platform.

## 1. Architecture & Multi-Module Layout
- `emotion-base`: Parent POM with centralized dependency and plugin versions.
- `emotion-core`: Shared kernel (`BaseResponse<T>`, `AuditTrail`, exceptions, security filters).
- `emotion-api-svc`: Core business application (`device`, `emotion`, `reaction`, `outbox`).

## 2. API Contract & Response Wrapper
- **Clean REST Routes (No `/api/v1` prefix)**:
  - Device: `POST /devices/me`, `GET /devices/me`, `PATCH /devices/me/settings`, `POST /devices/me/push-token`
  - Master data: `GET /categories`, `GET /reactions/types`
  - Posts & Empathy: `POST /posts`, `GET /posts`, `GET /posts/{id}`, `POST /posts/{id}/reactions`
- **Response Format**: Every REST controller method MUST return `BaseResponse<T>` (`BaseResponse.of(...)`, `BaseResponse.ofPage(...)`, `BaseResponse.ok()`).

## 3. Coding & Data Access Standards
- **Lombok & MapStruct**:
  - Use Lombok (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`).
  - Constructor injection only via `@RequiredArgsConstructor` with `private final` fields.
  - MapStruct mappers (`componentModel = "spring"`) for all Entity ↔ DTO conversions.
- **Database & Migration**:
  - PostgreSQL 16 schema managed exclusively via Liquibase (`db.changelog-master.xml`).
  - JPA Hibernate setting: `ddl-auto: validate`. Never use `update` or `create-drop`.
- **Performance & Transactions**:
  - `@Transactional(readOnly = true)` at class level on read services.
  - Prevent N+1 queries using `JOIN FETCH` or `@EntityGraph`.
- **Transactional Outbox**:
  - Empathy reaction and post creation events must be persisted atomically to `outbox_events` in the same DB transaction.
