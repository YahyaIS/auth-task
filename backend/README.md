# Auth Backend

NestJS 11 API with MongoDB, JWT authentication, and Swagger documentation.

## Tech Stack

| Package               | Purpose                          |
|-----------------------|----------------------------------|
| `@nestjs/core`        | NestJS framework                 |
| `@nestjs/mongoose`    | MongoDB ODM integration          |
| `@nestjs/jwt`         | JWT signing & verification       |
| `@nestjs/passport`    | Passport auth framework          |
| `passport-jwt`        | JWT Bearer token strategy        |
| `@nestjs/swagger`     | OpenAPI / Swagger documentation  |
| `bcrypt`              | Password hashing                 |
| `class-validator`     | DTO validation decorators        |
| `mongoose`            | MongoDB object modeling          |

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts              # Root module (ConfigModule, MongooseModule, AuthModule)
│   ├── main.ts                    # Global ValidationPipe + Swagger at /api
│   ├── app.controller.ts          # GET /health
│   ├── users/
│   │   ├── schemas/user.schema.ts # User model (email, name, password), pre-save bcrypt hook, toJSON transform
│   │   ├── dto/signup.dto.ts      # Email, name (min 3), password (8+ chars, letter+number+special)
│   │   ├── dto/signin.dto.ts      # Email, password
│   │   ├── dto/refresh.dto.ts     # Refresh token
│   │   └── users.module.ts        # Registers User model
│   └── auth/
│       ├── auth.module.ts         # PassportModule + JwtModule (15m access, 7d refresh)
│       ├── auth.service.ts        # signUp, signIn, refresh, getProfile
│       ├── auth.controller.ts     # POST /auth/signup, /auth/signin, /auth/refresh, GET /auth/me
│       ├── guards/jwt-auth.guard.ts
│       └── strategies/jwt.strategy.ts # Bearer token extraction, payload validation
├── test/
│   ├── app.e2e-spec.ts            # E2E test for health endpoint
│   └── jest-e2e.json
├── .env.example
└── package.json
```

## Endpoints

| Method | Path              | Auth Required | Description                              |
|--------|-------------------|---------------|------------------------------------------|
| GET    | `/health`         | No            | Health check — returns `{ status: "ok" }`|
| POST   | `/auth/signup`    | No            | Register a new user                      |
| POST   | `/auth/signin`    | No            | Sign in with email and password          |
| POST   | `/auth/refresh`   | No            | Exchange refresh token for a new pair    |
| GET    | `/auth/me`        | Yes (Bearer)  | Get current user profile                 |

Swagger docs available at `http://localhost:3000/api`.

## Auth Flow

### Signup
1. `POST /auth/signup` with `{ email, name, password }`
2. Validated by `SignupDto` (class-validator)
3. `AuthService.signUp()` creates user
4. Pre-save hook hashes password with bcrypt (salt rounds: 10)
5. Returns `{ user, access_token, refresh_token }`
6. Duplicate email → `409 Conflict`

### Signin
1. `POST /auth/signin` with `{ email, password }`
2. Queries user with `.select('+password')`
3. `bcrypt.compare` plaintext vs stored hash
4. Invalid email or password → `401 Unauthorized` (same error for both — no user enumeration)
5. Returns `{ user, access_token, refresh_token }`

### Refresh
1. `POST /auth/refresh` with `{ refreshToken }`
2. Verifies the JWT refresh token
3. Invalid or expired → `401 Unauthorized`
4. Returns new `{ access_token, refresh_token }` (rotated)

### Get Profile
1. `GET /auth/me` with `Authorization: Bearer <token>`
2. `JwtAuthGuard` validates token
3. Returns `{ name, email }`
4. Missing user → `401 Unauthorized`

## Token Details

| Token          | Type | Expiry | Rotation |
|----------------|------|--------|----------|
| `access_token` | JWT  | 15m    | Via refresh |
| `refresh_token`| JWT  | 7d     | Rotated on each use |

Both contain payload `{ sub: userId, email }`, signed with `JWT_SECRET`.

## Security Measures
- **Password field:** `select: false` — never returned from DB queries by default
- **toJSON transform:** Strips password from serialization
- **bcrypt pre-save hook:** Auto-hashes before persistence
- **401 ambiguity:** Same error for invalid email or password (prevents user enumeration)
- **Fails fast:** `getOrThrow('JWT_SECRET')` — startup fails if secret missing
- **Global ValidationPipe:** `whitelist: true` + `forbidNonWhitelisted: true`
- **Password regex:** Enforces complexity server-side (letter + number + special char)

## Environment Variables

| Variable      | Description                  | Default                                        |
|---------------|------------------------------|------------------------------------------------|
| `PORT`        | Server port                  | `3000`                                         |
| `MONGODB_URI` | MongoDB connection string    | `mongodb://localhost:27017/auth-task`          |
| `JWT_SECRET`  | JWT signing secret           | (must be set in production)                    |

## Scripts

| Command             | Description               |
|---------------------|---------------------------|
| `npm run start:dev` | Start dev server (watch)  |
| `npm run build`     | Build for production      |
| `npm run start:prod`| Run production build      |
| `npm run test`      | Unit tests                |
| `npm run test:e2e`  | E2E tests                 |
| `npm run lint`      | ESLint                    |
