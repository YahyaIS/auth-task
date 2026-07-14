# AI Usage Report

## Overview
This project was built entirely through [opencode](https://opencode.ai), an AI-powered CLI coding tool, using iterative conversations and refinement.

## AI-Assisted Parts
- **Backend:** NestJS project scaffold, auth module (controller, service, JWT strategy, guards), Mongoose user schema with bcrypt pre-save hook, DTOs with class-validator, Swagger integration, CORS configuration
- **Frontend:** Vite + React scaffold, AuthContext with token management, Axios instance with 401 auto-refresh interceptor, all pages (SignInPage, SignUpPage, DashboardPage), route guards (ProtectedLayout, GuestRoute), Navbar component
- **Config:** TypeScript, ESLint, environment variables, `.gitignore`

## Decisions Made Differently Than AI Suggested
- **Password storage:** Initial output suggested storing passwords in plaintext — corrected to use bcrypt hashing with a Mongoose pre-save hook
- **Refresh token logic:** Added refresh token rotation (stateless JWTs, rotated on each use) — not present in the initial scaffold
- **CORS:** Manually enabled CORS for local development between frontend (port 5173) and backend (port 3000)
- **GuestRoute:** Added a GuestRoute component to redirect authenticated users away from `/signin` and `/signup`
- **UI polish:** Added `cursor: pointer` to interactive elements for better UX
- **Documentation:** Backend and frontend READMEs were rewritten from generic templates to project-specific documentation

## Effective Approaches
- **Superpowers skill framework:** Used brainstorming and systematic-debugging skills to structure the work, and vercel-react-best-practices for frontend optimization
- **Subagent review:** Dedicated a secondary agent to review all generated code and flag inconsistencies before committing
- **Iterative refinement:** Rather than generating everything at once, building in small cycles (generate → review → fix → commit) produced more reliable output
- **Specific prompting patterns:** Describing exact NestJS conventions (decorators, module structure, guards) and React patterns (context, hooks, controlled inputs) produced accurate scaffold code
