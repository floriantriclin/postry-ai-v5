# Postry AI - Project Overview

**Date:** 2026-01-27
**Type:** Web Application
**Architecture:** Fullstack Monolith with API Routes

## Executive Summary

Postry AI is a fullstack web application that helps users discover their unique writing style through an interactive quiz and generates personalized LinkedIn posts using AI. The platform uses Google Gemini 2.5 Flash for AI-powered content generation and Supabase for data persistence and authentication.

**Key Value Proposition:** Preserve and amplify users' unique writing fingerprint through AI-powered content generation, ensuring authentic and memorable presence on LinkedIn.

## Project Classification

- **Repository Type:** Monolith - Single cohesive codebase
- **Project Type(s):** Web Application (Next.js Fullstack)
- **Primary Language(s):** TypeScript
- **Architecture Pattern:** Fullstack Serverless with API Routes

## Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.1.4 |
| Language | TypeScript | 5.0.0 |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4.1.18 |
| Database | Supabase (PostgreSQL) | 2.91.0 |
| AI | Google Gemini | 2.5 Flash |
| Validation | Zod | latest |

See [Technology Stack](./technology-stack.md) for complete details.

## Key Features

1. **Interactive Quiz:** Two-phase quiz (11 questions total) to identify user's writing style
2. **ICE Protocol:** 9-dimension style vector system for precise style profiling
3. **Archetype Detection:** Identifies user's writing archetype from quiz answers
4. **AI Post Generation:** Generates personalized LinkedIn posts based on style vector
5. **Magic Link Auth:** Passwordless authentication via email
6. **Post Persistence:** Saves generated posts with full quiz context

## Architecture Highlights

- **Serverless:** Vercel Serverless Functions for backend
- **Server Components First:** Default to Server Components, Client Components only when needed
- **RLS Security:** Row Level Security on all database tables
- **Stateless AI:** Each LLM call is independent with full context
- **Optimistic UI:** Quiz state managed locally until conversion

## Development Overview

### Prerequisites

- Node.js 20.0.0+
- npm
- Supabase account
- Google Gemini API key (optional)

### Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables (`.env` file)
4. Run development server: `npm run dev`

### Key Commands

- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Test:** `npm run test` (unit) or `npm run test:e2e` (E2E)

## Repository Structure

```
postry-ai/
├── app/              # Next.js App Router (pages, API routes)
├── components/       # React components
├── lib/             # Shared utilities and libraries
├── hooks/           # Custom React hooks
├── e2e/             # E2E tests (Playwright)
├── supabase/        # Database migrations
└── docs/            # Project documentation
```

## Documentation Map

For detailed information, see:

- [index.md](./index.md) - Master documentation index
- [architecture-main.md](./architecture-main.md) - Detailed architecture
- [source-tree-analysis.md](./source-tree-analysis.md) - Directory structure
- [development-guide-main.md](./development-guide-main.md) - Development workflow
- [api-contracts-main.md](./api-contracts-main.md) - API documentation
- [data-models-main.md](./data-models-main.md) - Database schema
- [component-inventory-main.md](./component-inventory-main.md) - Component catalog
- [state-management-patterns-main.md](./state-management-patterns-main.md) - State management
- [deployment-guide-main.md](./deployment-guide-main.md) - Deployment process

---

_Generated using BMAD Method `document-project` workflow_
