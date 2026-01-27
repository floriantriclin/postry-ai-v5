# Development Guide - Postry AI

**Date:** 2026-01-27
**Part:** main

## Prerequisites

### Required Software

- **Node.js:** Version 20.0.0 or higher
- **npm:** Comes with Node.js
- **Git:** For version control
- **Supabase Account:** For database and authentication
- **Google Gemini API Key:** (Optional) For quiz generation (falls back to mocks if not set)

### Recommended Tools

- **VS Code** or **Cursor** - Code editor
- **Git** - Version control
- **Supabase CLI** - (Optional) For local development

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd postry-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini (Optional - falls back to mocks if not set)
GEMINI_API_KEY=your_gemini_api_key

# Base URL (Defaults to http://localhost:3000)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_KEY=your_stripe_public_key
```

**Note:** Environment variables are validated at startup via `lib/env.ts` using Zod schemas.

---

## Local Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

**Features:**
- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- Error overlay in browser

### Development Workflow

1. **Make changes** to code
2. **Save files** - Next.js automatically recompiles
3. **View changes** in browser (auto-refresh)
4. **Check console** for errors or warnings

---

## Build Process

### Production Build

```bash
npm run build
```

**Process:**
1. TypeScript compilation
2. Next.js optimization
3. Static page generation
4. Server component compilation
5. Output to `.next/` directory

### Start Production Server

```bash
npm run start
```

Starts production server on `http://localhost:3000` (or PORT environment variable).

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

**Configuration:**
- Test environment: `jsdom`
- Coverage threshold: 80% (lines, functions, branches, statements)
- Coverage includes: `app/`, `components/`, `lib/`, `hooks/`
- Excludes: test files, e2e/, node_modules/

**Test Files:**
- `*.test.ts` - Unit tests for utilities and logic
- `*.test.tsx` - Component tests
- `*.spec.ts` - Specification/contract tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test e2e/critical-user-journeys.spec.ts

# Run on specific browser
npx playwright test --project=chromium
```

**Prerequisites:**
- Development server must be running (`npm run dev`)
- Environment variables must be configured
- Supabase database must be accessible

**Test Structure:**
- `e2e/critical-user-journeys.spec.ts` - Main user flows
- `e2e/accessibility-and-performance.spec.ts` - A11Y and performance
- `e2e/dashboard.spec.ts` - Dashboard functionality
- `e2e/story-2-7.spec.ts` - Story-specific tests

**Auth Setup:**
- Tests use browser-specific auth state files
- Auth setup runs before tests (per browser)
- Supports authenticated and unauthenticated contexts

---

## Code Quality

### Linting

```bash
npm run lint
```

Uses Next.js ESLint configuration.

### Type Checking

TypeScript is checked during:
- Development (via Next.js)
- Build process
- IDE (if configured)

**Strict Mode:** Enabled in `tsconfig.json`

---

## Common Development Tasks

### Adding a New API Route

1. Create file: `app/api/{feature}/{action}/route.ts`
2. Export handler: `export async function POST(req: NextRequest)`
3. Add validation: Use Zod schemas
4. Add error handling: Consistent error responses
5. Add tests: `route.test.ts` file

**Example:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  // ... validation schema
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = RequestSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validation.error.format() },
      { status: 400 }
    );
  }
  
  // ... handler logic
  
  return NextResponse.json({ success: true });
}
```

### Adding a New Component

1. **Determine type:**
   - Server Component (default) - No interactivity
   - Client Component - Needs hooks or event handlers

2. **Create file:**
   - Server: `components/{category}/{name}.tsx`
   - Client: `components/{category}/{name}.tsx` (with `'use client'`)

3. **Add tests:** `{name}.test.tsx`

4. **Follow patterns:**
   - Raw UI design system
   - TypeScript strict typing
   - Co-located logic files if complex

### Adding a New Utility Function

1. Create file: `lib/{name}.ts`
2. Export function with TypeScript types
3. Add tests: `{name}.test.ts`
4. Document with JSDoc comments

### Modifying Database Schema

1. Create migration: `supabase/migrations/{timestamp}_{description}.sql`
2. Test locally: `supabase db push` (if using Supabase CLI)
3. Apply to staging/production via Supabase dashboard or CLI

**Migration Naming:**
- Format: `YYYYMMDDHHMMSS_{description}.sql`
- Example: `20260123000000_update_posts_schema_and_trigger.sql`

---

## Development Standards

### TypeScript

- **Strict Mode:** Enabled
- **No `any`:** Use proper types or `unknown`
- **Type Definitions:** Centralized in `lib/types.ts`
- **Validation:** Runtime validation with Zod for external data

### React Components

- **Server Components by Default:** Only use Client Components when needed
- **Logic Separation:** Complex logic in `.logic.ts` files
- **Props Typing:** Always type component props
- **No Logic in JSX:** Extract complex conditionals

### Styling

- **Tailwind CSS:** Utility-first approach
- **Raw UI Design:** Flat design, strong borders, no shadows/gradients
- **No Arbitrary Values:** Use standard Tailwind scale (except exceptions)
- **Custom Classes:** Defined in `app/globals.css` (`@layer components`)

### Code Organization

- **Co-location:** Test files next to source files
- **Feature-based:** Group related files together
- **Clear Naming:** Follow naming conventions (see architecture docs)

---

## Debugging

### Development Server

- **Error Overlay:** Automatic in browser
- **Console Logs:** Check browser console and terminal
- **Type Errors:** Shown in terminal and IDE

### API Routes

- **Console Logs:** Server-side logs in terminal
- **Error Responses:** Check response status and body
- **Correlation IDs:** Some endpoints include correlation IDs for tracing

### Database

- **Supabase Dashboard:** View data, logs, and queries
- **RLS Policies:** Test via Supabase dashboard or scripts
- **Migrations:** Check migration status in Supabase dashboard

### E2E Tests

- **Debug Mode:** `npx playwright test --debug`
- **Traces:** `npx playwright show-trace test-results/.../trace.zip`
- **Screenshots:** Automatically captured on failure
- **Video:** Recorded for failed tests (if configured)

---

## Troubleshooting

### Common Issues

**Issue: Environment variables not loading**
- **Solution:** Ensure `.env` file exists and variables are prefixed correctly (`NEXT_PUBLIC_*` for client-side)

**Issue: Supabase connection errors**
- **Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

**Issue: TypeScript errors**
- **Solution:** Run `npm run build` to see all type errors, fix incrementally

**Issue: E2E tests failing**
- **Solution:** 
  1. Ensure dev server is running
  2. Check environment variables
  3. Verify Supabase connection
  4. Check auth setup files in `e2e/.auth/`

**Issue: Build fails**
- **Solution:** 
  1. Clear `.next/` directory: `rm -rf .next`
  2. Reinstall dependencies: `rm -rf node_modules && npm install`
  3. Check TypeScript errors: `npm run build`

---

## Git Workflow

### Branch Strategy

- **`main`** - Production branch
- **`dev`** - Development branch
- **`feat/{feature-name}`** - Feature branches

### Commit Conventions

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

**Example:**
```
feat: add quiz persistence to localStorage
fix: resolve auth modal positioning issue
docs: update API documentation
```

---

## Performance Optimization

### Development

- **Fast Refresh:** Enabled by default
- **Incremental TypeScript:** Enabled
- **Module Resolution:** Bundler mode for faster resolution

### Production

- **Next.js Optimization:** Automatic (code splitting, tree shaking)
- **Image Optimization:** Next.js Image component
- **Static Generation:** Where possible
- **Server Components:** Reduce client bundle size

---

## Resources

### Documentation

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs
- **Playwright:** https://playwright.dev/docs
- **Vitest:** https://vitest.dev/guide

### Project-Specific

- **Architecture Docs:** `_bmad-output/planning-artifacts/Architecture.md`
- **PRD:** `_bmad-output/planning-artifacts/PRD.md`
- **Testing Standards:** `docs/architecture/testing-standards.md`
- **ICE Protocol:** `docs/specs/ice_protocol.md`

---

_Generated by BMAD Method document-project workflow_
