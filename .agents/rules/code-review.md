# Code Review Guidelines for Emotion Care

Use this checklist when reviewing or writing code in the `emotion-care` codebase.

## 1. Correctness & Error Handling
- Never catch raw `Exception` or `Throwable` without proper logging or re-throwing. Use project exceptions (`BadRequestException`, `ResourceNotFoundException`, `UnauthorizedException`).
- Check null safety: Never call `Optional.get()` without checking `isPresent()`; prefer `.orElseThrow(...)` or `.orElse(...)`.
- Transaction boundaries: Any state mutations must be marked with `@Transactional`. Read-only service methods must be `@Transactional(readOnly = true)`.
- Self-invocation: Calling `@Transactional` or `@Async` methods via `this` within the same class bypasses Spring proxying and will not start a transaction.

## 2. API Contract & Security
- All controllers must return `BaseResponse<T>`.
- Use `@Valid @RequestBody` on all mutating endpoints to trigger Bean Validation.
- Endpoints must follow clean RESTful conventions without `/api/v1` prefix.
- Never return raw JPA entities directly from controllers; always map to DTOs using MapStruct.
- Never concatenate parameters in SQL queries; use named JPQL parameters to prevent SQL injection.

## 3. Spring Boot & Performance
- Constructor injection only via `@RequiredArgsConstructor` (no field `@Autowired`).
- Lombok + MapStruct are standard; ensure mappers define `componentModel = "spring"`.
- Prevent N+1 queries: Check queries with `JOIN FETCH` or `@EntityGraph` when navigating lazy relations.
- Ensure all large queries use `Pageable` and return paginated results (`BaseResponse.ofPage(...)`).
