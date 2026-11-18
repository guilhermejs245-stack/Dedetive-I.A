# Security Specification — Detetive de Problemas IA

## 1. Data Invariants
1. A `UserProfile` at `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. Listing `/users` is strictly forbidden to prevent PII (`email`) enumeration.
3. A `DiagnosisCase` at `/cases/{caseId}` must always belong to an authenticated user (`userId == request.auth.uid`) and cannot be read, listed, updated, or deleted by any other user.
4. Immutable identity and temporal fields (`uid`, `id`, `userId`, `createdAt`) cannot be altered after creation.
5. `createdAt` and `updatedAt` must always match `request.time` (server timestamps).
6. All bounded arrays (`actionPlan`, `completedStepIds`) must contain at most 8 items, and all string fields must satisfy explicit `.size()` boundaries.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated read/write to `/users/u1` or `/cases/c1` -> `PERMISSION_DENIED`.
2. Unverified email (`email_verified: false`) creating `/users/u1` or `/cases/c1` -> `PERMISSION_DENIED`.
3. Cross-user PII read: User `u2` reading `/users/u1` -> `PERMISSION_DENIED`.
4. User list scraping: `list /users` by any signed-in user -> `PERMISSION_DENIED`.
5. Identity spoofing on create: User `u1` creating `/cases/c1` with `userId: "u2"` -> `PERMISSION_DENIED`.
6. Shadow field injection: Creating `/cases/c1` with an extra `isAdmin: true` or `role: "admin"` field -> `PERMISSION_DENIED`.
7. Resource poisoning: Creating `/cases/invalid.id.with.dots` or a 10KB `problem` string -> `PERMISSION_DENIED`.
8. Unbounded array attack: Creating `/cases/c1` with 25 items in `actionPlan` -> `PERMISSION_DENIED`.
9. Cross-user case read/list: User `u2` reading `/cases/c1` (owned by `u1`) or listing `/cases` without filtering to `u2` -> `PERMISSION_DENIED`.
10. Timestamp forgery: Creating `/cases/c1` with a client-supplied `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
11. Immutable field mutation: User `u1` updating `/cases/c1` to change `userId` or `createdAt` -> `PERMISSION_DENIED`.
12. Unauthorized field update: User `u1` updating `/cases/c1` changing `problem` or `engineMode` (not in allowed action `affectedKeys()`) -> `PERMISSION_DENIED`.
