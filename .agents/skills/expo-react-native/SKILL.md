---
name: expo-react-native-engineering
description: Build and review maintainable Expo React Native applications with TypeScript, Expo Router, feature-oriented architecture, Clean Code, pragmatic design patterns, and testable UI/data flows.
---

# Expo React Native Engineering Skill

## 1. Mission

Build mobile applications that are easy to understand, change, test, and operate.

Priorities:
1. Correct user-visible behavior.
2. Clear separation of UI, business rules, and infrastructure.
3. Type-safe data flow.
4. Reliable loading, error, offline, and navigation behavior.
5. Accessibility and platform correctness.
6. Performance measured on realistic devices.

Do not treat a folder structure or design pattern as a goal by itself.

## 2. Understand the existing app first

Before changing code:

- Inspect `package.json`, Expo SDK version, TypeScript config, Expo Router setup, state/data libraries, tests, and native configuration.
- Confirm whether the task targets iOS, Android, web, or all platforms.
- Check whether the repository already has established naming and module conventions.
- Preserve compatible dependencies and patterns unless there is a concrete reason to change them.
- Avoid large-scale restructuring during a feature fix.
- Do not assume every Expo project uses the same navigation or state library.

Use the installed Expo SDK's compatible APIs and dependencies. Prefer `npx expo install <package>` for Expo-managed native dependencies when appropriate.

## 3. Recommended architecture

For a medium-sized application, prefer feature-oriented organization with thin route files.

Example:

```text
src/
├── app/                         # Expo Router routes and layouts only
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── profile.tsx
│   └── mood/
│       └── [id].tsx
├── features/
│   ├── mood/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   └── __tests__/
│   └── profile/
├── components/
│   ├── ui/                      # Truly reusable UI primitives
│   └── layout/
├── lib/
│   ├── api-client.ts
│   ├── query-client.ts
│   └── logger.ts
├── hooks/                       # Cross-feature hooks only
├── constants/
├── theme/
├── types/
└── utils/                       # Small, domain-independent helpers
```

Adapt the structure to project size. A small app can start with fewer folders.

### Expo Router rules

- Treat `src/app/` as the route and layout layer.
- Keep route files thin: parse route parameters, compose feature screens, and configure navigation.
- Put substantial screen UI and business logic in feature modules, not in route files.
- Use route groups and dynamic segments according to actual navigation needs.
- Do not put arbitrary helper components in the route directory if the router may interpret them as routes.
- Validate and type route parameters at the boundary.
- Handle missing or invalid IDs and unavailable records explicitly.

### Dependency direction

- UI components depend on feature hooks and presentation types.
- Feature application logic may depend on domain rules and declared ports.
- API clients, storage, notifications, and native modules belong at infrastructure boundaries.
- Shared UI must not import feature-specific business logic.
- Avoid circular imports between features.
- Cross-feature dependencies should be explicit; extract a shared module only when the abstraction is genuinely reusable.

## 4. Clean Code and TypeScript

### Naming and readability

- Use names that describe intent and domain meaning.
- Prefer early returns to deeply nested conditions.
- Keep components focused on one coherent UI responsibility.
- Extract logic when it has a meaningful name, can be tested independently, or is reused.
- Do not split every JSX block into a component automatically.
- Avoid vague names such as `data`, `item`, `handle`, or `utils` when more precise names improve understanding.
- Keep side effects visible rather than hiding them in unexpected utility functions.

### Types

- Enable TypeScript strict mode where compatible with the existing codebase.
- Prefer `unknown` over `any` for untrusted data, then validate or narrow it.
- Use discriminated unions for finite state variants.
- Avoid broad type assertions that suppress real errors.
- Keep API DTO types separate from domain/UI types when their shapes or lifecycles differ.
- Validate external JSON at runtime when correctness or security requires it; TypeScript types do not validate network responses.
- Avoid duplicate hand-written types if a reliable schema or generated API type already exists.

Example:

```ts
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

Use a state union when it makes invalid combinations impossible. Do not introduce a custom state machine for a simple boolean.

## 5. Component design

- Prefer function components and hooks.
- Keep props explicit and minimal.
- Use composition instead of adding many boolean props to one giant component.
- Keep visual components presentational when business behavior is not their responsibility.
- Use controlled inputs when the parent must own their state; otherwise local state is often sufficient.
- Keep styles close to the component or feature unless a shared design system is justified.
- Reuse design tokens for color, spacing, typography, radius, and elevation.
- Do not create a universal component with dozens of props for unrelated use cases.
- Consider accessibility labels, roles, touch target size, dynamic text, and screen-reader behavior.

### Example: presentational component

```tsx
import { Pressable, Text } from 'react-native';

type MoodOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function MoodOption({
  label,
  selected,
  onPress,
}: MoodOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}
```

The component owns presentation and accessibility semantics; the parent or feature hook owns the selection rule.

## 6. Hooks and side effects

- Hooks must follow React's Rules of Hooks.
- Use effects to synchronize with external systems, not to derive values that can be computed during render.
- Specify effect dependencies correctly; do not silence lint warnings without understanding them.
- Clean up subscriptions, listeners, timers, and native event handlers.
- Prevent stale asynchronous updates and handle cancellation where supported.
- Avoid putting every function into `useCallback` or every value into `useMemo`; profile or identify a concrete referential-stability requirement first.
- Custom hooks should encapsulate a coherent reusable behavior, not merely rename a few lines of code.
- Do not use effects to mirror props into state unless there is a clear synchronization requirement.

## 7. State and server data

Classify state before selecting a library:

- **Local UI state:** open modal, selected tab, temporary form input. Prefer `useState` or `useReducer`.
- **Server state:** fetched data, cache, retries, invalidation. Prefer TanStack Query or the project's existing equivalent when suitable.
- **Cross-screen client state:** session, preferences, small shared workflow state. Use Context or a store only when sharing requirements justify it.
- **URL/navigation state:** route IDs, filters, shareable screen state. Keep it in navigation parameters when appropriate.
- **Persistent device state:** use an appropriate storage abstraction and define expiration, migration, and failure behavior.

Rules:
- Do not copy all server responses into a global store without a specific reason.
- Define query keys centrally or consistently by feature.
- Invalidate or update cache after mutations according to the data relationship.
- Model loading, empty, error, stale, and success states explicitly.
- Avoid duplicate requests caused by unclear ownership or effects.
- Treat network responses as untrusted.
- Handle offline, timeout, unauthorized, and retry behavior intentionally.
- Do not automatically retry non-idempotent mutations unless the server supports a safe idempotency mechanism.

## 8. API and infrastructure boundaries

Keep HTTP and native integration details out of visual components.

A feature can expose a small API module:

```ts
export type MoodEntry = {
  id: string;
  emotion: string;
  createdAt: string;
};

export async function getMoodEntry(id: string): Promise<MoodEntry> {
  const response = await fetch(`/api/moods/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error(`Unable to load mood entry (${response.status})`);
  }

  return (await response.json()) as MoodEntry;
}
```

This example still needs runtime validation if the API response cannot be trusted. In a real project, use the configured API client, base URL, authentication, timeout, and error normalization rather than assuming relative `fetch` URLs work in React Native.

Rules:
- Centralize API base configuration and common request behavior.
- Never embed server secrets in a mobile bundle or `EXPO_PUBLIC_` variables.
- Keep tokens out of logs and URLs.
- Use SecureStore or another platform-appropriate secure storage for sensitive credentials when suitable; do not treat ordinary AsyncStorage as secure token storage.
- Define what happens on token expiry, logout, and concurrent unauthorized requests.
- Keep native permissions and platform APIs behind focused modules when multiple features use them.
- Use platform-specific files only when platform behavior genuinely differs.

## 9. Design patterns: pragmatic usage

### Custom Hook

Use to reuse stateful behavior or isolate a complex interaction with React lifecycle.

Good candidates: `useMoodFeed`, `useSession`, `useNetworkStatus`.

Avoid creating a hook that only forwards one function without improving naming, reuse, or testability.

### Container / Presentational separation

Use when a screen has substantial data orchestration and UI that benefits from independent testing or reuse. Do not enforce separate container files for every simple screen.

### Adapter

Wrap external SDKs, storage, notifications, analytics, or API formats behind a small application-facing interface when this reduces coupling.

Avoid wrapping every library call without a reason.

### Strategy

Use for genuinely interchangeable behavior, such as multiple sorting or validation policies. A plain conditional is often clearer for two small fixed branches.

### Factory

Use when object creation has meaningful configuration or variant-specific rules. Do not add a factory for a single straightforward constructor.

### Reducer

Use `useReducer` when a group of related state transitions is easier to reason about together. Do not replace simple `useState` calls with reducers by default.

### Repository

Use a repository abstraction when it provides a meaningful boundary between domain/application code and data sources, or when local/remote data coordination is complex. For a straightforward API query, a small API module may be enough.

### State machine

Use when a workflow has explicit phases and invalid transitions must be prevented, such as upload/sign/submit or multi-step onboarding. Do not build a state machine for a simple loading flag.

### Avoid by default

- Redux or another global store for every piece of state.
- Service classes for stateless functions that are clearer as functions.
- Dependency injection containers for a small app.
- Abstract factories and generic repositories without multiple real use cases.
- A `utils` folder containing business rules.
- Premature micro-frontends or plugin architectures in a single mobile app.

## 10. Performance and mobile-specific behavior

- Measure before optimizing.
- Avoid expensive transformations on every render when the dataset or computation justifies memoization.
- Use `FlatList` or an appropriate virtualized list for long collections; tune only with realistic data.
- Give list items stable keys.
- Avoid unnecessary state updates and large objects passed through broad Context providers.
- Clean up AppState, keyboard, navigation, and native subscriptions.
- Test behavior when the app backgrounds, resumes, loses network, or is killed and reopened.
- Handle platform differences explicitly and test on real devices for native-sensitive behavior.
- Do not assume browser APIs are available in React Native.
- Optimize images, payload sizes, and list rendering based on observed bottlenecks.

## 11. Security and privacy

- Request only permissions needed for a clear user-facing feature.
- Explain permission use where appropriate and handle denial gracefully.
- Do not log tokens, private check-ins, precise locations, or sensitive user content.
- Validate deep links and route parameters before using them in privileged actions.
- Treat local device storage as potentially inspectable.
- Do not rely on hiding UI as authorization; the server must enforce access.
- For anonymous or private features, minimize collection and retention of personal data.
- Do not place secrets in source code, app config exposed to the client, or public environment variables.

## 12. Testing

Choose test layers based on risk:

- Unit tests for pure business rules and transformations.
- Component tests for user-visible behavior and accessibility semantics.
- Hook tests when lifecycle/state behavior is complex enough to justify isolation.
- Integration tests for API/cache/auth workflows.
- End-to-end tests for critical journeys such as sign-in, submission, and recovery.

Rules:
- Prefer assertions on observable behavior over internal implementation.
- Test loading, success, empty, error, unauthorized, and retry states as relevant.
- Test rapid taps, duplicate submissions, stale responses, and unmount cleanup where they can cause bugs.
- Mock at the boundary; do not mock every internal function.
- Avoid snapshot-only coverage for important business behavior.
- Use the test tools already adopted by the project; do not install another framework without need.

## 13. Accessibility and UX states

For each meaningful screen or component, consider:

- Loading and refresh feedback.
- Empty state with a useful next action.
- Recoverable error and retry.
- Offline or connectivity limitations.
- Disabled and submitting states to prevent accidental duplicate actions.
- Keyboard behavior and safe areas.
- Accessibility labels and roles.
- Text scaling, contrast, and touch target size.

Do not present a successful state before the operation has actually succeeded.

## 14. Definition of done

- [ ] Route files remain focused on navigation and screen composition.
- [ ] Business rules are not buried inside large JSX components.
- [ ] State is stored in the correct place and has a clear owner.
- [ ] Types are meaningful and external data is validated where needed.
- [ ] Effects and subscriptions have correct cleanup.
- [ ] API/auth/storage/native boundaries are explicit.
- [ ] Loading, empty, error, offline, and duplicate-action states are considered.
- [ ] Accessibility and iOS/Android differences are addressed where relevant.
- [ ] Tests cover important behavior and failure cases.
- [ ] Typecheck, lint, tests, and Expo checks were run when available, or limitations are stated.
- [ ] No unnecessary pattern, global store, abstraction, or broad refactor was introduced.

## 15. Expected response when using this skill

When implementing or reviewing code, provide:
1. A concise summary of the approach.
2. Files changed and their responsibilities.
3. The design pattern used and why it is justified.
4. Important edge cases and platform implications.
5. Tests/checks actually run and their results.
6. Assumptions, trade-offs, or remaining risks.

Do not claim tests passed unless they were actually executed. Do not introduce new dependencies without explaining why they are needed.
