# Architecture - Postry AI

**Date:** 2026-01-27
**Part:** main
**Version:** 2.0

## Executive Summary

Postry AI is a **fullstack serverless application** built with Next.js 16, deployed on Vercel Edge Network, using Supabase for data persistence and authentication, and Google Gemini 2.5 Flash for AI-powered content generation.

**Architecture Pattern:** Fullstack Monolith with API Routes  
**Deployment:** Vercel (Serverless Functions + Edge Network)  
**Database:** Supabase (PostgreSQL with RLS)  
**AI Service:** Google Gemini 2.5 Flash

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Server       │  │ Client       │  │ LocalStorage │  │
│  │ Components   │  │ Components   │  │ (Quiz State) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel (Application Layer)                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Next.js App Router                                │ │
│  │  - Pages (Server Components)                      │ │
│  │  - API Routes (Serverless Functions)              │ │
│  │  - Middleware (Auth, Redirects)                   │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Supabase   │    │   Gemini     │    │   Stripe     │
│  - Auth      │    │   API        │    │   (Future)   │
│  - Database  │    │              │    │              │
│  - Storage   │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Key Architectural Decisions

1. **Serverless Architecture:** All backend logic in Vercel Serverless Functions
2. **BFF Pattern:** Next.js API routes act as secure proxy to external services
3. **Stateless Intelligence:** Each LLM call is independent with full context
4. **Optimistic UI:** Quiz state managed locally until conversion
5. **Server Components First:** Default to Server Components, Client Components only when needed

---

## Technology Stack

See [Technology Stack](./technology-stack.md) for complete details.

**Core Technologies:**
- **Framework:** Next.js 16.1.4 (App Router)
- **Language:** TypeScript 5.0.0
- **UI:** React 19.2.3
- **Styling:** Tailwind CSS 4.1.18
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini 2.5 Flash
- **Auth:** Supabase Auth (Magic Link)
- **Validation:** Zod

---

## Data Architecture

See [Data Models](./data-models-main.md) for complete schema.

### Database Schema

**Tables:**
- `public.users` - User profiles (mirror of auth.users)
- `public.posts` - Generated posts with quiz data

**Security:**
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Triggers for automatic user creation and post linking

**Storage:**
- `private-cvs` bucket for user-uploaded CV files
- Private access only (RLS policies)

---

## API Architecture

See [API Contracts](./api-contracts-main.md) for complete API documentation.

### API Routes

**Quiz API:**
- `POST /api/quiz/generate` - Generate quiz questions (Phase 1 & 2)
- `POST /api/quiz/archetype` - Identify user archetype
- `POST /api/quiz/refine` - Refine style vector
- `POST /api/quiz/profile` - Generate augmented profile
- `POST /api/quiz/post` - Generate LinkedIn post

**Auth API:**
- `POST /api/auth/persist-on-login` - Persist quiz data after auth
- `GET /api/auth/callback` - Handle Supabase Auth callback

### External APIs

- **Google Gemini:** Quiz generation, profile generation, post generation
- **Supabase:** Database queries, authentication, file storage
- **Stripe:** (Future) Payment processing

---

## Component Architecture

See [Component Inventory](./component-inventory-main.md) for complete component list.

### Component Organization

**Feature Components:**
- `QuizEngine` - Main quiz orchestrator
- `AuthModal` - Email capture for magic link
- `ThemeSelector` - Theme selection grid
- `QuestionCard` - Quiz question display
- `FinalReveal` - Final reveal screen with post generation
- `ArchetypeTransition` - Archetype reveal between phases
- `Header` - Dashboard header with logout

**UI Primitives:**
- `ProgressBar` - Progress indicator
- `LoaderMachine` - Terminal-style loader

### State Management

See [State Management Patterns](./state-management-patterns-main.md) for details.

**Patterns:**
- Server Components (default) - No client-side state
- useReducer - Complex state (quiz engine)
- useState - Simple state (modals, forms)
- LocalStorage - Persistence via custom hooks

---

## Application Flow

### Critical User Journey

1. **Landing Page** (`/`) - Public, no auth required
2. **Theme Selection** - User selects topic
3. **Quiz Phase 1** - 6 questions (ICE dimensions)
4. **Archetype Detection** - System identifies archetype
5. **Quiz Phase 2** - 5 refinement questions
6. **Profile Generation** - Augmented profile with label
7. **Post Generation** - LinkedIn post based on style
8. **Auth Modal** - Email capture for magic link
9. **Email Confirmation** - User clicks magic link
10. **Dashboard** (`/dashboard`) - Authenticated, post revealed

### Data Flow

**Pre-Authentication:**
- Quiz state stored in localStorage
- Post generated and stored with `status='pending'`, `user_id=NULL`, `email=user_email`

**Post-Authentication:**
- Trigger links pending posts to user account
- Post status updated to `'revealed'`
- User can access dashboard

---

## Security Architecture

### Authentication

- **Method:** Supabase Auth with Magic Link (passwordless)
- **Session Management:** JWT tokens via cookies (SSR-compatible)
- **Middleware:** Auth checks on every request (except public paths)

### Data Security

- **RLS Policies:** All tables have Row Level Security
- **API Security:** Rate limiting on critical endpoints
- **Input Validation:** Zod schemas for all API inputs
- **Error Handling:** No sensitive data in error messages

### Secrets Management

- **Environment Variables:** Stored securely in Vercel
- **Client Variables:** Only `NEXT_PUBLIC_*` exposed to client
- **Server Variables:** `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` server-only

---

## Error Handling

See existing architecture docs for error handling strategy.

**Patterns:**
- Consistent error response format
- User-friendly error messages
- Structured logging (`lib/alerting.ts`)
- Error boundaries for React components
- Graceful degradation (fallback to mocks)

---

## Testing Strategy

### Unit Tests (Vitest)

- **Coverage:** 80% threshold
- **Focus:** Utilities, logic, reducers
- **Location:** Co-located with source files

### E2E Tests (Playwright)

- **Coverage:** Critical user journeys
- **Browsers:** Chromium, Firefox, WebKit
- **Auth:** Browser-specific auth state files

### Test Files

- `*.test.ts` - Unit tests
- `*.test.tsx` - Component tests
- `*.spec.ts` - Specification tests
- `e2e/*.spec.ts` - E2E tests

---

## Deployment Architecture

See [Deployment Guide](./deployment-guide-main.md) for complete details.

### Infrastructure

- **Hosting:** Vercel Edge Network
- **Database:** Supabase (PostgreSQL)
- **CDN:** Vercel Edge Network (automatic)
- **Functions:** Vercel Serverless Functions

### Deployment Process

1. **Git Push** to `main` branch
2. **Vercel Build** - Runs `npm run build`
3. **Automatic Deploy** - To production
4. **Preview Deploys** - For PRs

### Rollback

- **Instant Rollback** via Vercel dashboard
- **Deployment History** maintained by Vercel

---

## Performance Considerations

### Optimization Strategies

- **Server Components:** Reduce client bundle size
- **Code Splitting:** Automatic via Next.js
- **Static Generation:** Where possible
- **Edge Caching:** Automatic via Vercel
- **Image Optimization:** Next.js Image component

### Monitoring

- **Vercel Analytics:** Performance metrics
- **Function Logs:** API route execution logs
- **Error Tracking:** Structured logging via `lib/alerting.ts`

---

## Development Workflow

See [Development Guide](./development-guide-main.md) for complete details.

**Key Commands:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run test` - Unit tests
- `npm run test:e2e` - E2E tests

---

## Code Standards

### TypeScript

- **Strict Mode:** Enabled
- **No `any`:** Use proper types
- **Validation:** Zod for runtime validation

### React

- **Server Components First:** Default to Server Components
- **Logic Separation:** Complex logic in `.logic.ts` files
- **No Logic in JSX:** Extract conditionals

### Styling

- **Raw UI Design:** Flat design, strong borders, no shadows
- **Tailwind CSS:** Utility-first approach
- **No Arbitrary Values:** Use standard scale

---

## Future Considerations

### Planned Enhancements

- **Sentry Integration:** Error monitoring (see `lib/alerting.ts`)
- **Redis:** For rate limiting in multi-instance deployments
- **Vector Search:** Supabase Vector for semantic search
- **Stripe Integration:** Payment processing

### Scalability

- **Automatic Scaling:** Vercel handles scaling
- **Database Scaling:** Supabase handles database scaling
- **Edge Network:** Global CDN for static assets

---

## Related Documentation

- [Technology Stack](./technology-stack.md)
- [Data Models](./data-models-main.md)
- [API Contracts](./api-contracts-main.md)
- [Component Inventory](./component-inventory-main.md)
- [State Management Patterns](./state-management-patterns-main.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide-main.md)
- [Deployment Guide](./deployment-guide-main.md)

For detailed architecture sections, see:
- `_bmad-output/planning-artifacts/architecture/` - Complete architecture documentation (17 files)

---

_Generated by BMAD Method document-project workflow_
