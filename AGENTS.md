# AGENTS.md - Agent Coding Guidelines for Polling App

## Project Overview

This is a Next.js 15 (App Router) polling application with Supabase backend, featuring QR code sharing. TypeScript is required for all code.

---

## Build, Lint, and Test Commands

### Main Application (in root directory)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Next.js ESLint |
| `npm run tsc` | Run TypeScript type checking |

### API Tests (in api-tests directory)

| Command | Description |
|---------|-------------|
| `cd api-tests && npm run test` | Run all API tests |
| `cd api-tests && npm run register-user` | Test user registration |
| `cd api-tests && npm run login-get-polls` | Test login and poll retrieval |
| `cd api-tests && npm run create-poll` | Test poll creation |
| `cd api-tests && npm run vote-poll` | Test voting |

### Running a Single Test

For the API tests, edit `api-tests/test-suite.js` to run only specific tests, or run individual test scripts directly.

---

## Code Style Guidelines

### General Principles

- **Server-First**: Use Server Components for data fetching. Only use `"use client"` when interactivity (hooks, event listeners) is required.
- **Server Actions**: Use Next.js Server Actions for all data mutations (forms). Do NOT create separate API routes for form submissions.
- **No Client-Side Fetching**: Do NOT use `useEffect` + `useState` to fetch data in page components. Fetch directly in Server Components.

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PollCreateForm.tsx` |
| Server Actions | camelCase | `poll-actions.ts` |
| Utilities | camelCase | `utils.ts`, `error-handler.ts` |
| Types/Interfaces | PascalCase | `types/index.ts` |

### Directory Structure

```
/app                    # Next.js App Router pages
  /(auth)/             # Auth pages (login, register)
  /(dashboard)/        # Protected dashboard pages
  /api/                # API route handlers
  /lib/
    /actions/          # Server Actions
    /context/          # React Context providers
    /types/            # TypeScript types
/components/
  /ui/                 # shadcn/ui components
  /layout/             # Layout components (header, footer)
/lib/
  /supabase/           # Supabase client setup
  /utils/              # Utility functions
```

### TypeScript Guidelines

- **Strict Mode**: Enabled in `tsconfig.json` - all types must be explicit
- **Return Types**: Always define return types for Server Actions and utility functions
- **Zod Validation**: Use Zod schemas for input validation in Server Actions
- **Avoid `any`**: Use proper types or `unknown` with type guards

### Imports

- Use path aliases (`@/*`) configured in `tsconfig.json`
- Order imports: external libs → internal components → local utilities
- Example:
```typescript
import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### Error Handling

- Use try/catch blocks in Server Actions and Route Handlers
- Return structured results with `{ success: boolean; error?: string }` pattern
- Log errors to console with context: `console.error("Create poll error:", error)`
- Use Next.js `error.tsx` files for route-level error boundaries

### Environment Variables

- Never hardcode secrets in source code
- Use `.env.local` for local development
- Access via `process.env.NEXT_PUBLIC_SUPABASE_URL` and similar
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Tailwind CSS

- Uses Tailwind CSS v4 with `@import "tailwindcss"` in `globals.css`
- shadcn/ui "new-york" style with `slate` base color
- Use `cn()` utility from `@/lib/utils` for conditional classes
- CSS variables defined in `globals.css` for theming

### Database (Supabase)

- Use Supabase client for all database interactions
- Create separate clients for server (`lib/supabase/server.ts`) and client (`lib/supabase/client.ts`)
- Use RLS policies for row-level security
- Always check ownership before mutations on user data

### Existing Cursor Rules

This project has `.cursor/rules/project-spec.mdc` with additional guidelines:
- Prefer Server Components for fetching/displaying
- Use Server Actions for form submissions
- Use shadcn/ui components for UI
- Load Supabase keys from environment variables

---

## Verification Checklist

Before submitting any code changes, verify:

- [ ] Code uses Next.js App Router and Server Components for data fetching
- [ ] Server Actions used for data mutations (forms)
- [ ] Supabase client used for all database interactions
- [ ] shadcn/ui components used where appropriate
- [ ] Supabase keys and secrets loaded from environment variables
- [ ] TypeScript compiles without errors (`npm run tsc`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Follows naming conventions (PascalCase components, camelCase utilities)
