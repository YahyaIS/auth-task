# Auth Frontend Design

> **Goal:** Production-ready user authentication frontend (sign-up, sign-in, protected dashboard) built with React (Vite), TypeScript, Tailwind CSS v4.

## Architecture

- **AuthContext** (React Context) manages user/token state and exposes login/signup/logout methods
- **Axios instance** with a response interceptor that catches 401 errors, automatically refreshes tokens, and retries the original request
- **React Router v7** with a layout route (`ProtectedLayout`) wrapping all authenticated pages
- **Tailwind CSS v4** for styling (CSS-first config via `@import "tailwindcss"`)

## Token Strategy

- `access_token` (15 min) — stored in memory (React state)
- `refresh_token` (7 days) — stored in localStorage
- On page load: proactively call `POST /auth/refresh` with stored `refresh_token`, then `GET /auth/me` to restore user session
- On 401 during any request: Axios interceptor calls `/auth/refresh`, retries original request

## Route Structure

| Path | Component | Access |
|------|-----------|--------|
| `/signin` | SignInPage | Public (default) |
| `/signup` | SignUpPage | Public |
| `/` | ProtectedLayout > DashboardPage | Authenticated only |

## Component Tree

```
App
└── AuthProvider
    └── Router
        ├── /signin → SignInPage
        ├── /signup → SignUpPage
        └── ProtectedLayout (layout route)
            ├── Navbar (user name, logout)
            └── Outlet
                └── / → DashboardPage
```

## Files

| File | Responsibility |
|------|---------------|
| `src/api/axios.ts` | Axios instance, request interceptor (attach token), response interceptor (401 → refresh → retry) |
| `src/context/AuthContext.tsx` | Auth state, login/signup/logout/initialize methods |
| `src/components/Navbar.tsx` | User name, avatar icon, logout button |
| `src/components/ProtectedLayout.tsx` | Auth guard + Navbar + Outlet |
| `src/pages/SignInPage.tsx` | Email + password form, login |
| `src/pages/SignUpPage.tsx` | Email + name + password form with validation, signup |
| `src/pages/DashboardPage.tsx` | Welcome message |
| `src/App.tsx` | Route definitions |
| `src/main.tsx` | AuthProvider wrapper |
| `src/index.css` | Tailwind import |

## Validation Rules (Client-Side)

- **Email**: Valid email regex
- **Name**: Minimum 3 characters
- **Password**: Min 8 chars, ≥1 letter, ≥1 number, ≥1 special character

## UI Design

- Indigo accent (`indigo-600` primary)
- White card on gray-50 background for auth forms
- Centered layout (`max-w-md mx-auto`, flex centering)
- Inline validation errors (red text below each field)
- Submit button disabled while form invalid or loading
- Navbar: fixed top, white bg, shadow, user name + lucide icons (User, LogOut)
- Responsive: mobile-first via Tailwind breakpoints
