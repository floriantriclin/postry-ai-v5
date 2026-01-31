# Source Tree Analysis - Postry AI

**Date:** 2026-01-27
**Project:** Postry AI

## Overview

Postry AI follows Next.js 16 App Router structure with clear separation of concerns: API routes, pages, components, utilities, and hooks.

## Complete Directory Structure

```
postry-ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/
│   │   │   ├── callback/         # Supabase Auth callback handler
│   │   │   │   └── route.ts
│   │   │   └── persist-on-login/ # Post persistence after auth
│   │   │       └── route.ts
│   │   └── quiz/                 # Quiz API endpoints
│   │       ├── archetype/        # Archetype identification
│   │       │   ├── route.ts
│   │       │   └── route.test.ts
│   │       ├── generate/          # Question generation (Phase 1 & 2)
│   │       │   ├── route.ts
│   │       │   └── route.test.ts
│   │       ├── logic.test.ts      # Integration tests
│   │       ├── post/              # Post generation
│   │       │   ├── route.ts
│   │       │   └── route.test.ts
│   │       ├── profile/           # Augmented profile generation
│   │       │   ├── route.ts
│   │       │   └── route.test.ts
│   │       └── refine/            # Vector refinement
│   │           └── route.ts
│   ├── auth/                      # Auth pages
│   │   ├── confirm/               # Email confirmation page
│   │   │   └── page.tsx
│   │   └── error/                 # Auth error page
│   │       └── page.tsx
│   ├── dashboard/                 # Authenticated dashboard
│   │   ├── layout.tsx             # Dashboard layout with header
│   │   ├── page.tsx               # Main dashboard page (Server Component)
│   │   ├── post-reveal-view.tsx   # Post display component (Client)
│   │   └── post-reveal-view.test.tsx
│   ├── quiz/                       # Quiz page
│   │   └── page.tsx               # Quiz page wrapper
│   ├── globals.css                # Global styles (Tailwind + Raw UI)
│   ├── landing-client.tsx        # Landing page client component
│   ├── layout.tsx                 # Root layout (fonts, metadata)
│   └── page.tsx                   # Landing page (Server Component)
│
├── components/                     # React components
│   ├── feature/                   # Feature-specific components
│   │   ├── archetype-transition.tsx    # Archetype reveal screen
│   │   ├── auth-modal.tsx              # Email capture modal
│   │   ├── auth-modal.test.tsx
│   │   ├── final-reveal.tsx            # Final reveal screen
│   │   ├── header.tsx                  # Dashboard header
│   │   ├── question-card.tsx           # Quiz question display
│   │   ├── quiz-engine.tsx             # Main quiz orchestrator
│   │   ├── quiz-engine.logic.ts        # Quiz state reducer
│   │   ├── quiz-engine.logic.test.ts   # Reducer tests
│   │   ├── quiz-engine.test.tsx        # Component tests
│   │   ├── quiz-interstitial.tsx       # Instructions screen
│   │   └── theme-selector.tsx          # Theme selection grid
│   └── ui/                        # Reusable UI primitives
│       ├── loader-machine.tsx     # Terminal-style loader
│       └── progress-bar.tsx       # Progress indicator
│
├── hooks/                          # Custom React hooks
│   ├── use-copy-to-clipboard.ts   # Clipboard utility hook
│   ├── use-copy-to-clipboard.test.ts
│   └── use-quiz-persistence.ts    # LocalStorage persistence hook
│
├── lib/                            # Shared utilities and libraries
│   ├── data/                      # Static data files
│   │   ├── mock-quiz.json         # Mock quiz data for fallback
│   │   └── themes.json            # Theme definitions
│   ├── alerting.ts                # Error alerting system
│   ├── alerting.test.ts
│   ├── auth-schema.ts             # Zod schemas for auth
│   ├── auth.ts                    # Auth utilities (signInWithOtp)
│   ├── env.ts                     # Environment variable validation
│   ├── gemini.ts                  # Google Gemini API client
│   ├── gemini.test.ts
│   ├── ice-constants.ts           # ICE protocol constants (9 dimensions, archetypes)
│   ├── ice-logic.ts               # ICE protocol logic (archetype detection, vector updates)
│   ├── ice-mocks.ts               # Mock data for ICE protocol
│   ├── ice-protocol.spec.ts       # ICE protocol specification tests
│   ├── quiz-api-client.ts        # Quiz API client wrapper
│   ├── quiz-api-client.test.ts
│   ├── rate-limit.ts              # Rate limiting utility
│   ├── rate-limit.test.ts
│   ├── supabase.ts               # Supabase client (browser)
│   ├── supabase-admin.ts         # Supabase admin client (server, bypasses RLS)
│   └── types.ts                   # TypeScript type definitions
│
├── e2e/                            # End-to-end tests (Playwright)
│   ├── .auth/                     # Auth state files (per browser)
│   │   ├── user-chromium.json
│   │   ├── user-firefox.json
│   │   └── user-webkit.json
│   ├── auth.setup.chromium.ts     # Auth setup for Chromium
│   ├── auth.setup.firefox.ts      # Auth setup for Firefox
│   ├── auth.setup.ts              # Base auth setup
│   ├── auth.setup.webkit.ts       # Auth setup for WebKit
│   ├── accessibility-and-performance.spec.ts
│   ├── auth-confirm-hang.spec.ts
│   ├── auth-modal.spec.ts-snapshots/
│   ├── critical-user-journeys.spec.ts
│   ├── dashboard.spec.ts
│   ├── dashboard.spec.ts-snapshots/
│   ├── README.md                  # Comprehensive E2E testing guide
│   └── story-2-7.spec.ts
│
├── supabase/                       # Supabase configuration
│   └── migrations/                # Database migrations
│       ├── 08_init.sql            # Initial schema (users, posts, RLS, triggers)
│       └── 20260123000000_update_posts_schema_and_trigger.sql
│
├── scripts/                        # Utility scripts
│   ├── demo-full-flow.mjs         # Demo script
│   ├── demo-story-1-5.mjs
│   ├── demo-story-1-6.mjs
│   ├── demo-story-1-7.mjs
│   ├── test-db-rls.mjs            # RLS policy testing
│   ├── test-gemini-real.ts        # Gemini API testing
│   ├── test-rate-limiting.mjs     # Rate limit testing
│   ├── test-zod.js                # Zod validation testing
│   ├── validate-setup.js          # Environment validation
│   ├── verify-env.ts              # Environment verification
│   └── verify-supabase.mjs        # Supabase connection testing
│
├── docs/                           # Project documentation
│   ├── architecture/             # Architecture documentation
│   ├── epics/                     # Epic documentation (4 files)
│   ├── pm/                        # Project management docs
│   ├── prd/                       # PRD sections (9 files)
│   ├── qa/                        # QA documentation (50+ files)
│   ├── recommendations/           # Technical recommendations
│   ├── specs/                     # Technical specifications
│   ├── stories/                   # User stories (34 files)
│   ├── ux/                        # UX design docs
│   ├── brief.md                   # Project brief
│   └── structure.md               # Project structure (legacy)
│
├── _bmad-output/                  # BMAD V6 output directory
│   ├── planning-artifacts/        # Planning documents
│   │   ├── Architecture.md        # Architecture (sharded)
│   │   ├── PRD.md                 # PRD (sharded)
│   │   ├── architecture/          # Architecture sections (17 files)
│   │   └── prd/                   # PRD sections (9 files)
│   └── implementation-artifacts/  # Implementation documents
│       ├── epic-1-acquisition.md
│       ├── epic-2-conversion.md
│       ├── epic-3-dashboard.md
│       ├── epic-4-expertise.md
│       └── [34 story files]
│
├── _bmad/                          # BMAD V6 framework files
│   └── [BMAD framework structure]
│
├── plans/                          # Planning documents
│   └── [9 planning files]
│
├── .cursor/                        # Cursor IDE configuration
│   └── commands/                  # BMAD command files
│
├── middleware.ts                  # Next.js middleware (auth, redirects)
├── package.json                   # Dependencies and scripts
├── package-lock.json
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts               # Vitest unit test configuration
├── playwright.config.ts           # Playwright E2E test configuration
├── postcss.config.mjs              # PostCSS configuration (Tailwind)
├── .env                           # Environment variables (not in git)
├── .gitignore
└── README.md                      # Project overview
```

## Critical Directories

### `app/` - Next.js App Router

**Purpose:** Application routes, pages, and API endpoints  
**Contains:**
- **API Routes:** `app/api/` - Backend endpoints (quiz, auth)
- **Pages:** `app/*/page.tsx` - Route pages (landing, quiz, dashboard, auth)
- **Layouts:** `app/layout.tsx`, `app/dashboard/layout.tsx` - Page layouts
- **Global Styles:** `app/globals.css` - Tailwind + Raw UI styles

**Entry Points:**
- `app/page.tsx` - Landing page (`/`)
- `app/quiz/page.tsx` - Quiz page (`/quiz`)
- `app/dashboard/page.tsx` - Dashboard (`/dashboard`)
- `app/auth/confirm/page.tsx` - Auth callback (`/auth/confirm`)

**Integration:**
- API routes called by client components
- Server Components fetch data directly from Supabase
- Middleware handles auth and redirects

---

### `components/` - React Components

**Purpose:** Reusable UI components  
**Contains:**
- **Feature Components:** `components/feature/` - Quiz, auth, dashboard components
- **UI Primitives:** `components/ui/` - Reusable UI elements (progress bar, loader)

**Organization:**
- Feature components are self-contained with their logic
- UI components are pure, reusable primitives
- Test files co-located with components

**Patterns:**
- Server Components by default
- Client Components (`'use client'`) for interactivity
- Logic separated into `.logic.ts` files for testability

---

### `lib/` - Shared Libraries

**Purpose:** Business logic, utilities, and shared code  
**Contains:**
- **API Clients:** `gemini.ts`, `quiz-api-client.ts` - External API wrappers
- **Protocol Logic:** `ice-constants.ts`, `ice-logic.ts` - ICE protocol implementation
- **Utilities:** `auth.ts`, `rate-limit.ts`, `alerting.ts` - Helper functions
- **Data:** `lib/data/` - Static JSON data (themes, mock quiz)
- **Types:** `types.ts` - TypeScript type definitions

**Key Files:**
- `ice-constants.ts` - ICE protocol definitions (9 dimensions, archetypes)
- `ice-logic.ts` - Archetype detection, vector calculations
- `gemini.ts` - Google Gemini API integration
- `env.ts` - Environment variable validation with Zod

---

### `hooks/` - Custom React Hooks

**Purpose:** Reusable React hooks  
**Contains:**
- `use-quiz-persistence.ts` - LocalStorage sync for quiz state
- `use-copy-to-clipboard.ts` - Clipboard utility

**Pattern:**
- Custom hooks encapsulate stateful logic
- Co-located test files

---

### `e2e/` - End-to-End Tests

**Purpose:** Playwright E2E test suite  
**Contains:**
- Test files for critical user journeys
- Auth setup files per browser
- Snapshots for visual regression testing

**Coverage:**
- Critical user journeys (11 tests)
- Accessibility and performance (11 tests)
- Dashboard functionality (4 tests)
- Story-specific tests (8 tests for Story 2.7)

---

### `supabase/` - Database

**Purpose:** Supabase database migrations  
**Contains:**
- `08_init.sql` - Initial schema (users, posts, RLS, triggers)
- `20260123000000_update_posts_schema_and_trigger.sql` - Schema update for pre-auth posts

**Schema:**
- `public.users` - User profiles (mirror of auth.users)
- `public.posts` - Generated posts with quiz data
- RLS policies for data isolation
- Triggers for automatic user creation and post linking

---

## File Organization Patterns

### TypeScript Files

- **`.ts`** - TypeScript files (utilities, logic, types)
- **`.tsx`** - React components
- **`.test.ts`** - Unit tests
- **`.test.tsx`** - Component tests
- **`.spec.ts`** - Specification/contract tests

### Configuration Files

- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript compiler options
- **`vitest.config.ts`** - Unit test configuration
- **`playwright.config.ts`** - E2E test configuration
- **`postcss.config.mjs`** - PostCSS/Tailwind configuration
- **`.env`** - Environment variables (not in git)

### Data Files

- **`.json`** - Static data (themes, mock quiz)
- **`.sql`** - Database migrations
- **`.md`** - Documentation

---

## Entry Points

### Application Entry

- **`app/layout.tsx`** - Root layout (fonts, metadata, global styles)
- **`app/page.tsx`** - Landing page entry point
- **`middleware.ts`** - Request middleware (auth, redirects)

### API Entry Points

- **`app/api/quiz/*/route.ts`** - Quiz API endpoints
- **`app/api/auth/*/route.ts`** - Auth API endpoints

### Test Entry Points

- **`vitest.config.ts`** - Unit test runner configuration
- **`playwright.config.ts`** - E2E test runner configuration

---

## Integration Points

### Client-Server Communication

- **Client → Server:** API routes (`/api/*`)
- **Server → Database:** Direct Supabase queries in Server Components
- **Client → Database:** Supabase client in Client Components (read-only, RLS-protected)

### Component Communication

- **Parent → Child:** Props
- **State Management:** useReducer for complex state, useState for simple state
- **Persistence:** localStorage via custom hooks

---

## Key File Types

### API Routes

- **Pattern:** `app/api/{feature}/{action}/route.ts`
- **Methods:** POST (most common), GET (for callbacks)
- **Validation:** Zod schemas
- **Error Handling:** Consistent error responses

### Components

- **Server Components:** Default (no directive)
- **Client Components:** `'use client'` directive
- **Logic Separation:** `.logic.ts` files for complex state

### Utilities

- **API Clients:** Wrapper classes for external APIs
- **Validators:** Zod schemas
- **Helpers:** Pure functions for common operations

---

## Development Notes

### Code Organization

- **Co-location:** Test files next to source files
- **Separation of Concerns:** Logic separated from UI
- **Type Safety:** Strict TypeScript with Zod runtime validation

### Testing Strategy

- **Unit Tests:** Vitest for logic and utilities
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright for critical flows
- **Coverage:** 80% threshold (lines, functions, branches, statements)

### Build Process

- **Next.js:** Handles bundling, compilation, optimization
- **TypeScript:** Compiles to JavaScript (no emit, Next.js handles)
- **Tailwind:** PostCSS processes CSS
- **Output:** `.next/` directory (not in git)

---

_Generated by BMAD Method document-project workflow_
