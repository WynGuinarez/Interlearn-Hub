# Interlearn Hub Frontend

Frontend application for the Interlearn admin dashboard. Built with React, TypeScript, and Vite.

## Tech Stack
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Vitest + ESLint

## Project Structure
```text
src/
  app/       # app entrypoints, routes, layout
  core/      # API client, auth, state, contracts, utilities
  features/  # feature-domain pages and logic
  styles/    # global styles and theme css
docs/        # project documentation
guidelines/  # AI/developer guidance notes
```

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local env file (optional, for API integration):
   ```bash
   cp .env.example .env
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts
- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run test` - run unit tests with Vitest

## Environment Variables
- `VITE_API_BASE_URL`: backend API base URL
- `VITE_ENABLE_MOCKS`: set `true` for mock mode, `false` for real backend calls

## Additional Documentation
- Backend contract and handoff details: `docs/BACKEND_HANDOFF.md`
- Third-party attributions: `docs/ATTRIBUTIONS.md`
- Legacy exported theme reference: `docs/reference/default_shadcn_theme.css`