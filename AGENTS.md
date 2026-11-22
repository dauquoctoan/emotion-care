# Emotion Care Platform - Developer & Agent Guidelines

This project is a privacy-first, anonymous emotional care platform consisting of:
- `backend-java`: Enterprise Spring Boot 3.3.x backend (PostgreSQL 16, Redis 7, Kafka KRaft, Docker Compose).
- `mobile`: React Native Expo mobile application.
- `workers-go`: High-performance background workers (outbox relay, notification, feed fan-out).

## 1. Backend Standards (`backend-java`)

- **Multi-module Architecture**:
  - `emotion-base`: Parent POM with dependency management.
  - `emotion-core`: Shared kernel (`BaseResponse<T>`, `AuditTrail`, exceptions, security filter).
  - `emotion-api-svc`: Core business domain (`device`, `emotion`, `reaction`, `outbox`).
- **REST Endpoints Standard**: Clean RESTful routes matching the mobile client without `/api/v1` prefix:
  - Device: `POST /devices/me`, `GET /devices/me`, `PATCH /devices/me/settings`, `POST /devices/me/push-token`
  - Master data: `GET /categories`, `GET /reactions/types`
  - Posts & Feed: `POST /posts`, `GET /posts`, `GET /posts/trending`, `GET /posts/me`, `GET /posts/{id}`, `DELETE /posts/{id}`, `POST /posts/{id}/copy`, `POST /posts/{id}/reactions`
- **Response Format**: All REST endpoints return `BaseResponse<T>` (`BaseResponse.of(...)`, `BaseResponse.ofPage(...)`, `BaseResponse.ok()`).
- **Lombok & MapStruct**: Use Lombok (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`) and MapStruct mappers for zero-overhead, type-safe conversions. Constructor injection only (`@RequiredArgsConstructor` with `private final` fields).
- **Database & Migration**: PostgreSQL 16 schema managed exclusively via Liquibase (`db.changelog-master.xml`). `ddl-auto: validate`.
- **Transactional Outbox**: Empathy and post events must atomically write to `outbox_events` table within the same database transaction.
- **JPA Performance**: Prevent N+1 queries by using `JOIN FETCH` or `@EntityGraph`. Use `@Transactional(readOnly = true)` for read methods.

## 2. Mobile Standards (`mobile`)

- **Service Layer**: All API communication is organized under `services/api/` (`api.ts` for Axios interceptor, `index.ts` for typed service functions).
- **Device Identity**: Every request automatically injects header `x-device-id: <uuid>` via Axios request interceptor.
- **Navigation & Routing**: Expo Router file-based navigation (`app/(tabs)`).
- **State Management**: Zustand stores (`stores/user.store.ts`, `stores/caption.store.ts`, `stores/location.store.ts`).

## 3. Documentation & Specification Versioning Standards

- **Single Source of Truth**: All architectural designs, data models, APIs, and product strategies are maintained in `docs/MASTER-SPECIFICATION.md`.
- **Immutable Full-Document Version Snapshots**: Whenever ANY change or enhancement is made to `docs/MASTER-SPECIFICATION.md`, you MUST:
  1. Bump the semantic version in the document header (e.g. `v4.1.0`, `v4.2.0`, `v5.0.0`).
  2. Create an immutable, 100% standalone and complete snapshot copy saved to `docs/versions/MASTER-SPECIFICATION-vX.Y.Z.md` (each snapshot MUST be a full, self-contained document, never a diff or delta).
  3. Record the update in the **Changelog & Version History** table inside `MASTER-SPECIFICATION.md`.
