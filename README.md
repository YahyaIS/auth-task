# Auth Task

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)

Full-stack authentication application built as a test task. Users can sign up, sign in, and access a protected dashboard.

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Backend   | NestJS 11, MongoDB (Mongoose 9), Passport JWT, Swagger |
| Frontend  | React 19, Vite 8, TypeScript 6, Tailwind CSS 4 |
| Auth      | JWT access tokens (15m) + refresh tokens (7d) with rotation, bcrypt |

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **MongoDB** running locally (default: `mongodb://localhost:27017`)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YahyaIS/auth-task.git
cd auth-task

# Backend setup
cd backend
cp .env.example .env       # Edit JWT_SECRET for production
npm install
npm run start:dev          # http://localhost:3000

# Frontend setup (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Path              | Auth Required | Description                     |
|--------|-------------------|---------------|----------------------------------|
| GET    | `/health`         | No            | Health check                    |
| POST   | `/auth/signup`    | No            | Register a new user             |
| POST   | `/auth/signin`    | No            | Sign in with email and password |
| POST   | `/auth/refresh`   | No            | Exchange refresh token for new pair |
| GET    | `/auth/me`        | Yes (Bearer)  | Get current user profile        |

Swagger interactive docs: `http://localhost:3000/api`

## Project Structure

```
auth-task/
├── backend/           # NestJS API (see backend/README.md)
│   ├── src/
│   │   ├── auth/      # Auth module (controller, service, guards, strategy)
│   │   ├── users/     # User module (schema, DTOs)
│   │   ├── app.module.ts
│   │   └── main.ts    # Entry point + Swagger + ValidationPipe
│   ├── test/          # E2E tests
│   └── package.json
├── frontend/          # React app (see frontend/README.md)
│   ├── src/
│   │   ├── api/       # Axios instance with 401 interceptor
│   │   ├── context/   # AuthContext (login, signup, logout, session restore)
│   │   ├── components/# Navbar, ProtectedLayout, GuestRoute
│   │   ├── pages/     # SignInPage, SignUpPage, DashboardPage
│   │   ├── App.tsx    # Route definitions
│   │   └── main.tsx   # Entry point
│   └── package.json
├── AI.md              # AI usage report
└── README.md
```

## Auth Flow

1. **Signup** → `POST /auth/signup` → returns `{ user, access_token, refresh_token }`
2. **Signin** → `POST /auth/signin` → returns `{ user, access_token, refresh_token }`
3. **Protected requests** → `Authorization: Bearer <access_token>`
4. **Token refresh** → `POST /auth/refresh` → returns new token pair (refresh token is rotated)
5. **Auto-refresh on 401** → Frontend Axios interceptor catches 401, calls `/auth/refresh`, retries the request

## Environment Variables

### Backend (`backend/.env`)
| Variable      | Description                  | Default                                        |
|---------------|------------------------------|------------------------------------------------|
| `PORT`        | Server port                  | `3000`                                         |
| `MONGODB_URI` | MongoDB connection string    | `mongodb://localhost:27017/auth-task`          |
| `JWT_SECRET`  | JWT signing secret           | (change in production)                         |

### Frontend (`frontend/.env`)
| Variable       | Description          | Default                  |
|----------------|----------------------|--------------------------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000`  |

## Scripts

### Backend
| Command             | Description               |
|---------------------|---------------------------|
| `npm run start:dev` | Start dev server (watch)  |
| `npm run build`     | Build for production      |
| `npm run test`      | Run unit tests            |
| `npm run test:e2e`  | Run E2E tests             |
| `npm run lint`      | Lint with ESLint          |

### Frontend
| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start dev server (vite)  |
| `npm run build` | TypeScript check + build |
| `npm run lint`  | Lint with ESLint         |
