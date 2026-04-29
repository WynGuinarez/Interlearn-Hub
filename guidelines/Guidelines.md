# Interlearn Hub Frontend Guidelines

## Scope
These guidelines apply to all changes in this frontend project.

## Code Organization
- Keep feature-specific code under `src/features/<feature-name>`.
- Keep app shell concerns under `src/app` (routes, layouts, app-level wiring).
- Keep shared platform concerns under `src/core` (API client, auth, state, shared contracts, utilities).
- Place global styling and tokens under `src/styles`.

## Coding Standards
- Use TypeScript strict typing; avoid `any` unless unavoidable and documented.
- Prefer small, focused components and utility functions.
- Keep imports consistent and avoid deep relative paths when aliases are available.
- Avoid introducing duplicate UI abstractions when an existing one already works.

## API and State
- Route all HTTP requests through `src/core/api`.
- Keep backend contract types centralized in `src/core/contracts`.
- Do not hardcode API base URLs; use environment variables.

## UI and UX
- Prioritize responsive layouts using flex/grid over absolute positioning.
- Keep form validation and error messages user-friendly and specific.
- Reuse existing spacing, typography, and color tokens before introducing new ones.

## Quality Gate
- Ensure `npm run lint`, `npm run typecheck`, and tests pass before merge.
- Update `README.md` and relevant docs when behavior or setup changes.
