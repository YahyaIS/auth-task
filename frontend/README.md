# Auth Frontend

React 19 application with Vite 8, TypeScript 6, and Tailwind CSS 4 — consuming the NestJS auth API.

## Tech Stack

| Package           | Purpose                     |
|-------------------|-----------------------------|
| React 19          | UI framework                |
| Vite 8            | Build tool & dev server     |
| TypeScript 6      | Type safety                 |
| Tailwind CSS 4    | Utility-first styling       |
| Axios             | HTTP client with 401 interceptor |
| React Router v7   | Client-side routing         |
| Lucide React      | Icons                       |

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.ts           # Axios instance, setAccessToken(), 401 auto-refresh interceptor
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state, login/signup/logout/initialize
│   ├── components/
│   │   ├── Navbar.tsx          # Fixed top bar with user name + logout
│   │   ├── ProtectedLayout.tsx # Auth guard + Navbar + Outlet
│   │   └── GuestRoute.tsx      # Redirects authenticated users away from auth pages
│   ├── pages/
│   │   ├── SignInPage.tsx      # Email + password form
│   │   ├── SignUpPage.tsx      # Email + name + password with inline validation
│   │   └── DashboardPage.tsx   # "Welcome to the application."
│   ├── App.tsx                 # Route definitions
│   ├── main.tsx                # Entry point
│   └── index.css               # @import "tailwindcss"
├── .env.example
├── index.html
├── vite.config.ts
└── package.json
```

## Routes

| Path      | Component         | Wrapper           | Access                   |
|-----------|-------------------|-------------------|--------------------------|
| `/signin` | SignInPage        | GuestRoute        | Redirects to `/` if auth |
| `/signup` | SignUpPage        | GuestRoute        | Redirects to `/` if auth |
| `/`       | DashboardPage     | ProtectedLayout   | Redirects to `/signin`   |

## Auth Flow

### Token Strategy
- **Access token** (15 min) — stored in memory via `setAccessToken()`
- **Refresh token** (7 days) — stored in `localStorage`
- On page load: calls `POST /auth/refresh` then `GET /auth/me` to restore session
- On 401 from protected calls: Axios interceptor catches it, calls `/auth/refresh`, retries the request
- On refresh failure: clears tokens and redirects to `/signin`

### Key Components

**AuthContext** — Provides `{ user, isAuthenticated, isLoading, login, signup, logout }` via React Context. Uses plain `axios.post` for signin/signup (bypasses 401 interceptor — 401 = bad credentials here, not token expiry).

**ProtectedLayout** — Shows spinner while loading, redirects to `/signin` if unauthenticated, renders Navbar + page content otherwise.

**GuestRoute** — Shows spinner while loading, redirects to `/` if already authenticated, renders children otherwise.

**Navbar** — Fixed top bar with app name, user avatar, and logout button.

### Pages

**SignInPage** (`/signin`) — Email + password inputs with show/hide toggle. Displays "Invalid email or password" on 401. Link to signup.

**SignUpPage** (`/signup`) — Email + name + password inputs with show/hide toggle. Real-time inline validation (email format, name 3+ chars, password 8+ chars with letter+number+special). Submit disabled until valid. Displays "An account with this email already exists" on 409. Link to signin.

**DashboardPage** (`/`) — Displays "Welcome to the application."

## Environment Variables

| Variable       | Description          | Default                  |
|----------------|----------------------|--------------------------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000`  |

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start dev server (port 5173) |
| `npm run build` | TypeScript check + build |
| `npm run lint`  | ESLint                   |
| `npm run preview` | Preview production build |
