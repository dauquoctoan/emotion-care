# Security & Device Authentication Guidelines

## 1. Anonymous Device Model
- Emotion Care is an anonymous empathy platform. Users do not register with email/passwords.
- The client device generates or retrieves a UUID stored in AsyncStorage (`device_id`).
- Every HTTP request must pass `x-device-id: <uuid>` header.
- `JwtAuthenticationFilter` resolves either JWT Bearer tokens or fallback `x-device-id` headers and populates `ROLE_DEVICE` in Spring SecurityContext.

## 2. API Authorization & Access Rules
- Public endpoints permitted without auth:
  - Documentation & Health: `/`, `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/**`
  - Master data: `/categories/**`, `/reactions/types`
  - Devices: `/devices/**` (device creation and profile retrieval)
  - Public Feed: `GET /posts/**`
- Authenticated actions (requiring resolved `x-device-id` / `ROLE_DEVICE`):
  - `POST /posts` (creating an emotion post)
  - `DELETE /posts/{id}` (only owner device can delete their post)
  - `POST /posts/{postId}/reactions` (empathy reaction toggle)

## 3. Data Privacy & Zero-PII
- Do not log device tokens, location coordinates (latitude/longitude), or post contents in plain text in production application logs.
- City and district can be stored for approximate geographic proximity, but precise GPS coordinates must not be exposed directly to other users.
