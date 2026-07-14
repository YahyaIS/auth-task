# Auth Backend Reference

## Project Structure
```
backend/
├── src/
│   ├── app.module.ts              # Root module (ConfigModule, MongooseModule, AuthModule)
│   ├── main.ts                    # Global ValidationPipe + Swagger setup at /api
│   ├── app.controller.ts          # GET /health — health check endpoint
│   ├── users/
│   │   ├── schemas/user.schema.ts # User model (email, name, password), pre-save bcrypt hook, toJSON transform
│   │   ├── dto/signup.dto.ts      # Email, name (min 3), password (8+ chars, letter+number+special)
│   │   ├── dto/signin.dto.ts      # Email, password (not empty)
│   │   ├── dto/refresh.dto.ts     # Refresh token string
│   │   └── users.module.ts        # Registers User model for DI
│   └── auth/
│       ├── auth.module.ts         # PassportModule + JwtModule (async config from env, 15m expiry)
│       ├── auth.service.ts        # signUp, signIn, refresh, getProfile
│       ├── auth.controller.ts     # POST /auth/signup, POST /auth/signin, POST /auth/refresh, GET /auth/me
│       ├── guards/jwt-auth.guard.ts   # extends AuthGuard('jwt')
│       └── strategies/jwt.strategy.ts # Bearer token extraction, payload validation
├── .env.example                   # PORT, MONGODB_URI, JWT_SECRET
├── test/app.e2e-spec.ts           # E2E test for health endpoint
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

Swagger interactive docs available at `http://localhost:3000/api`.

## Auth Flow

### Signup
1. `POST /auth/signup` with `{ email, name, password }`
2. Validated by `SignupDto` (class-validator)
3. `AuthService.signUp()` → `UserModel.create(dto)`
4. Pre-save hook hashes password with bcrypt (salt rounds: 10)
5. On success → returns `{ user: { _id, name, email }, access_token, refresh_token }`
6. Duplicate email → `409 Conflict`

### Signin
1. `POST /auth/signin` with `{ email, password }`
2. `AuthService.signIn()` → queries user with `.select('+password')`
3. `bcrypt.compare` plaintext vs stored hash
4. Invalid email or password → `401 Unauthorized` (same error for both — no enumeration)
5. On success → returns `{ user: { _id, name, email }, access_token, refresh_token }`

### Refresh
1. `POST /auth/refresh` with `{ refreshToken }`
2. `AuthService.refresh()` → verifies the JWT refresh token
3. Invalid or expired → `401 Unauthorized`
4. On success → returns `{ access_token, refresh_token }` (new pair, refresh token rotated)

### Get Profile
1. `GET /auth/me` with `Authorization: Bearer <token>`
2. `JwtAuthGuard` validates token via `JwtStrategy`
3. `req.user` = `{ userId, email }`
4. `AuthService.getProfile()` queries DB by userId, returns `{ name, email }`
5. Missing/deleted user → `401 Unauthorized`

## Token Details

| Token          | Type | Expiry | Rotation |
|----------------|------|--------|----------|
| `access_token`  | JWT  | 15m    | Via refresh |
| `refresh_token` | JWT  | 7d     | Rotated on each use |

Both tokens contain the payload `{ sub: userId, email }` and are signed with `JWT_SECRET`.

## Security Measures
- **`select: false`** on password — never returned from DB queries by default
- **`toJSON` transform** — strips password from serialization (covers `save()` responses)
- **bcrypt pre-save hook** — auto-hashes before persistence, never stored in plaintext
- **401 ambiguity** — same error for invalid email or password (prevents user enumeration)
- **`getOrThrow('JWT_SECRET')`** — app fails fast at startup if secret is missing
- **Global ValidationPipe** — `whitelist: true` + `forbidNonWhitelisted: true` prevents mass assignment
- **`@Matches()` regex** — enforces password complexity server-side (letter + number + special char)
- **Refresh token rotation** — old refresh token is invalidated after each refresh

## Environment Variables
| Variable      | Description                  | Default                                        |
|---------------|------------------------------|------------------------------------------------|
| `PORT`        | Server port                  | `3000`                                         |
| `MONGODB_URI` | MongoDB connection string    | `mongodb://localhost:27017/auth-task`          |
| `JWT_SECRET`  | JWT signing secret           | (must be set in production)                    |

## Key Dependencies
| Package               | Purpose                          |
|-----------------------|----------------------------------|
| `@nestjs/config`      | `.env` loading & ConfigService   |
| `@nestjs/mongoose`    | Mongoose ODM integration         |
| `mongoose`            | MongoDB object modeling (v9)     |
| `@nestjs/jwt`         | JWT signing & verification       |
| `@nestjs/passport`    | Passport auth framework          |
| `passport-jwt`        | JWT Bearer token strategy        |
| `@nestjs/swagger`     | OpenAPI / Swagger documentation  |
| `bcrypt`              | Password hashing                 |
| `class-validator`     | DTO validation decorators        |
| `class-transformer`   | DTO transformation               |

## Key Conventions
- All properties in decorator-driven classes use `!` (definite assignment assertion)
- Mongoose v9 pre-save hooks return `Promise<void>` — no `next()` callback
- Relative imports omit `.js` extension (CommonJS mode via `module: nodenext` without `"type": "module"`)
- `ConfigService.getOrThrow()` used for critical env vars (fails fast at startup)
- Passport strategies extend `PassportStrategy(Strategy)` — strategy name defaults to `'jwt'`
