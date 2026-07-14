# Auth Frontend Reference

## Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── axios.ts              # Axios instance, 401 interceptor with auto-refresh
│   ├── context/
│   │   └── AuthContext.tsx        # Auth state, login/signup/logout/initialize
│   ├── components/
│   │   ├── Navbar.tsx             # Fixed top navbar with user name + logout
│   │   ├── ProtectedLayout.tsx    # Auth guard + Navbar + Outlet
│   │   └── GuestRoute.tsx         # Redirects authenticated users away from /signin & /signup
│   ├── pages/
│   │   ├── SignInPage.tsx         # Email + password form
│   │   ├── SignUpPage.tsx         # Email + name + password with validation
│   │   └── DashboardPage.tsx      # Welcome message
│   ├── App.tsx                    # Route definitions
│   ├── main.tsx                   # Entry point
│   └── index.css                  # @import "tailwindcss"
├── .env                           # VITE_API_URL=http://localhost:3000
├── AGENTS.md
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Tech Stack
| Package           | Purpose                     |
|-------------------|-----------------------------|
| React 19          | UI framework                |
| Vite 8            | Build tool & dev server     |
| TypeScript ~6.0   | Type safety                 |
| Tailwind CSS 4    | Utility-first styling       |
| Axios             | HTTP client                 |
| React Router v7   | Client-side routing         |
| Lucide React      | Icons                       |

## Routes
| Path      | Component         | Wrapper           | Access                   |
|-----------|-------------------|-------------------|--------------------------|
| `/signin` | SignInPage        | GuestRoute        | Redirects to `/` if auth |
| `/signup` | SignUpPage        | GuestRoute        | Redirects to `/` if auth |
| `/`       | DashboardPage     | ProtectedLayout   | Redirects to `/signin`   |

## Auth Flow

### Token Strategy
- `access_token` (15 min) — stored in memory via `setAccessToken()`
- `refresh_token` (7 days) — stored in `localStorage`
- On page load: proactively call `POST /auth/refresh` with stored refresh token, then `GET /auth/me` to restore session
- The 401 interceptor only applies to protected API calls made with `api` (the intercepted Axios instance). Auth endpoints (`/auth/signin`, `/auth/signup`) use plain `axios.post` directly — a 401 on those means invalid credentials, not token expiry
- On 401 from a protected call: Axios interceptor catches it, calls `/auth/refresh`, retries the original request
- On refresh failure: clears tokens and redirects to `/signin`

### Key Files

**`src/api/axios.ts`**
- Creates Axios instance with `baseURL` from `VITE_API_URL` env var
- Exports `setAccessToken(token)` for AuthContext to update the in-memory token
- Request interceptor attaches `Authorization: Bearer <token>` header
- Response interceptor catches 401s, queues concurrent requests during refresh, retries after new token is obtained

**`src/context/AuthContext.tsx`**
- Provides `{ user, isAuthenticated, isLoading, login, signup, logout }` via React Context
- Uses plain `axios.post` for `/auth/signin` and `/auth/signup` (bypasses the 401 interceptor — 401 = invalid credentials, not token expiry)
- Uses intercepted `api` for `/auth/me` after page load (so expired token triggers auto-refresh)
- `login(email, password)` — `POST /auth/signin`, stores tokens, sets user
- `signup(name, email, password)` — `POST /auth/signup`, stores tokens, sets user
- `logout()` — clears tokens and state, redirects to `/signin`
- On mount: checks `localStorage` for refresh token, calls `/auth/refresh` then `/auth/me` to restore session

**`src/components/ProtectedLayout.tsx`**
- Shows spinner while `isLoading` is true
- Redirects to `/signin` if not authenticated
- Renders `Navbar` + `<Outlet/>` for authenticated users

**`src/components/GuestRoute.tsx`**
- Layout route (same pattern as ProtectedLayout)
- Shows a spinner while `isLoading` is true
- Redirects authenticated users to `/`
- Renders `<Outlet/>` for guests

**`src/components/Navbar.tsx`**
- Fixed top bar with app name on the left
- User name with avatar icon on the right
- Logout button

### Pages

**SignInPage** (`/signin`)
- Email + password inputs with show/hide toggle
- Calls `login()` from AuthContext
- Displays "Invalid email or password" on 401
- Link to `/signup`

**SignUpPage** (`/signup`)
- Email + name + password inputs with show/hide toggle
- Real-time inline validation:
  - Email: valid email regex
  - Name: minimum 3 characters
  - Password: minimum 8 characters, at least 1 letter, 1 number, 1 special character
- Submit disabled until form is valid
- Calls `signup()` from AuthContext
- Displays "An account with this email already exists" on 409
- Link to `/signin`

**DashboardPage** (`/`)
- Displays "Welcome to the application."

## Environment Variables
| Variable      | Description            | Default                  |
|---------------|------------------------|--------------------------|
| `VITE_API_URL`| Backend API base URL   | `http://localhost:3000`  |

Vite exposes env vars with the `VITE_` prefix via `import.meta.env`.

## Scripts
| Command             | Description               |
|---------------------|---------------------------|
| `npm run dev`       | Start dev server (port 5173) |
| `npm run build`     | TypeScript check + Vite build |
| `npm run lint`      | ESLint                    |
| `npm run preview`   | Preview production build  |

## Conventions
- React function components with named exports
- Icons from `lucide-react`
- Tailwind utility classes only (no custom CSS)
- Forms use controlled inputs with `useState`
- Auth API calls throw on error — pages handle the error display
