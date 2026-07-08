# Auth Module

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Routes     │────▶│  Controller   │────▶│   Service    │
│ auth.routes.ts│    │auth.controller│    │ auth.service │
└──────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                                ┌────────┴────────┐
       │                                │                 │
       │                          ┌─────▼────┐    ┌──────▼─────┐
       │                          │  Token   │    │  Session   │
       │                          │ Service  │    │  Service   │
       │                          └──────────┘    └────────────┘
       │
  ┌────┴────┐
  │  Auth   │
  │ Limiter │  (rate-limiter.middleware.ts)
  └─────────┘
```

## API Endpoints

All mounted at `/api/v1/auth`:

| Method | Path            | Rate Limited | Description                          |
| ------ | --------------- | ------------ | ------------------------------------ |
| `POST` | `/signup`       | Yes          | Register — always generic message    |
| `POST` | `/verify-email` | Yes          | Verify by token (body)               |
| `GET`  | `/verify-email` | Yes          | Verify by token (query — link click) |
| `POST` | `/login`        | Yes          | Email + password                     |
| `GET`  | `/me`           | No           | Current user (optional auth)         |
| `GET`  | `/admin`        | No           | Admin-only test                      |

## Database Schema

### User

| Field    | Type        | Notes                          |
| -------- | ----------- | ------------------------------ |
| id       | `String`    | cuid, PK                       |
| email    | `String`    | unique                         |
| password | `String`    | hashed via `Bun.password.hash` |
| name     | `String?`   | optional                       |
| role     | `Role` enum | `user` / `moderator` / `admin` |
| verified | `Boolean`   | default `false`                |
| emailNew | `String?`   | pending email change           |

### VerificationToken

| Field     | Type             | Notes                                         |
| --------- | ---------------- | --------------------------------------------- |
| id        | `String`         | cuid, PK                                      |
| token     | `String`         | SHA-256 hash, unique                          |
| type      | `TokenType` enum | `magic_link` / `reset_password` / `new_email` |
| userId    | `String`         | FK → User                                     |
| expiresAt | `DateTime`       | 15-minute expiry                              |
| usedAt    | `DateTime?`      | set on consumption                            |
| createdAt | `DateTime`       | auto                                          |

### Session

| Field        | Type       | Notes                  |
| ------------ | ---------- | ---------------------- |
| id           | `String`   | cuid, PK               |
| userId       | `String`   | FK → User              |
| token        | `String`   | SHA-256 hash, unique   |
| refreshToken | `String?`  | SHA-256 hash           |
| userAgent    | `String?`  | client user-agent      |
| ipAddress    | `String?`  | client IP              |
| expiresAt    | `DateTime` | 30-day expiry          |
| lastUsedAt   | `DateTime` | updated on each access |

## Flows

### Sign Up

```
POST /api/v1/auth/signup
Body: { email, password, name? }

1. Rate limiter check (keyed by email, 10 req / 15min)
2. Zod validation
3. Lookup user by email:
   a. EXISTS + verified → log only, return generic success (no email sent)
   b. EXISTS + unverified → invalidate old tokens, create new, send email
   c. NOT FOUND → hash password, create user, create token, send email
4. Always return: { message: "If an account exists, a link has been sent." }
```

### Verify Email

```
GET /verify-email?token=<raw>&email=<user@example.com>
POST /api/v1/auth/verify-email  Body: { token, email }

1. Rate limiter check
2. Zod validation
3. Find user by email:
   a. Not found → generic error
   b. Already verified → generic error (no leak)
4. Hash provided token with SHA-256
5. Find VerificationToken matching hash + userId + type + not expired + unused
   a. Not found → generic error
   b. Found → set usedAt = now, verify user
6. Create Session (returns raw tokens, SHA-256 stored)
7. Sign JWT { userId, email, role, sessionId }
8. Queue welcome email (fire-and-forget)
9. Return { token, session, user }
```

## Security Design

| Principle                  | Implementation                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------- |
| **No email enumeration**   | Same generic message for all signup outcomes                                        |
| **Token entropy**          | `crypto.randomBytes(32)` — 256 bits                                                 |
| **Token storage**          | SHA-256 hash only; raw token never persisted                                        |
| **Single-use**             | `usedAt` timestamp on consumption, not boolean                                      |
| **Short-lived**            | 15-minute `expiresAt` (configurable via `TOKEN_EXPIRY_MINUTES`)                     |
| **Old token invalidation** | `updateMany` sets `usedAt = now` on all unexpired unused tokens before creating new |
| **Rate limiting**          | 10 requests / 15 min window per email address                                       |
| **Password hashing**       | `Bun.password.hash` (bcrypt-style default)                                          |
| **Session hashing**        | Raw session token returned only at creation; SHA-256 stored                         |
| **JWT expiry**             | Configurable via `JWT_EXPIRES_IN` (default 7d)                                      |

## Key Files

| File                            | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `auth.routes.ts`                | Route definitions + middleware wiring       |
| `auth.controller.ts`            | Request/response handling                   |
| `auth.service.ts`               | Business logic (signup, verifyEmail, login) |
| `auth.schema.ts`                | Zod validation schemas                      |
| `verification-token.service.ts` | Token generation, hashing, validation       |
| `session.service.ts`            | Session CRUD                                |
