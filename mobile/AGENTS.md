# Mobile (React Native Expo) - Subproject Rules

This directory contains the mobile application for Emotion Care Platform.

## 1. Tech Stack & Architecture
- **Framework**: Expo SDK (React Native with TypeScript).
- **Navigation**: Expo Router (file-based routing under `app/`).
- **State Management**: Zustand stores (`stores/user.store.ts`, `stores/caption.store.ts`, `stores/location.store.ts`).
- **Data Fetching & API**:
  - Centralized API layer under `services/api/` (`api.ts` for Axios client, `index.ts` for typed service calls).
  - Custom `useFetch<T>` hook for reactive data fetching with pull-to-refresh (`refetch`).

## 2. API Contract & Communication Standards
- **Clean REST Routes (No `/api/v1` prefix)**:
  - Device: `POST /devices/me`, `GET /devices/me`, `PATCH /devices/me/settings`, `POST /devices/me/push-token`
  - Master Data: `GET /categories`, `GET /reactions/types`
  - Posts & Feed: `POST /posts`, `GET /posts?page=0&size=20`, `POST /posts/{id}/reactions`
- **Device Identity**: Every request MUST include `x-device-id: <uuid>` injected automatically by Axios interceptor (`services/api/api.ts`).
- **Response Shape**: Every response is wrapped in `ApiResponse<T>`:
  ```typescript
  export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
  }
  ```

## 3. Component & UI Guidelines
- Keep route files in `app/` clean and focused on layout and navigation.
- Use safe area handling (`react-native-safe-area-context`).
- Reusable UI icons use `@/components/ui/icon-symbol` or `@expo/vector-icons`.
- Handle loading and empty states gracefully (`ActivityIndicator`, placeholder messages).
