# Emotion Care Platform - Developer & Agent Guidelines

This project is a privacy-first, anonymous emotional care platform consisting of:
- `backend-java`: Enterprise Spring Boot 3.3.x backend (PostgreSQL 16, Redis 7, Kafka KRaft, Docker Compose).
- `mobile`: React Native Expo mobile application.

## 1. Backend Standards (`backend-java`)

- **Multi-module Architecture**:
  - `emotion-base`: Parent POM with dependency management.
  - `emotion-core`: Shared kernel (`BaseResponse<T>`, `AuditTrail`, exceptions, security filter).
  - `emotion-api-svc`: Core business domain (`device`, `emotion`, `reaction`, `outbox`).
- **REST Endpoints Standard**: Clean RESTful routes matching the mobile client without `/api/v1` prefix:
  - Device: `POST /devices/me`, `GET /devices/me`, `PATCH /devices/me/settings`, `POST /devices/me/push-token`
  - Master data: `GET /categories`, `GET /reactions/types`
  - Posts & Feed: `POST /posts`, `GET /posts`, `GET /posts/{id}`, `POST /posts/{id}/reactions`
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
