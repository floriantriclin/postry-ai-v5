# Contribution Guide - Postry AI

**Date:** 2026-01-27
**Part:** main

## Code Style and Conventions

### TypeScript

- **Strict Mode:** Enabled (`strict: true` in tsconfig.json)
- **No `any`:** Use proper types or `unknown`
- **Type Definitions:** Centralized in `lib/types.ts`
- **Validation:** Runtime validation with Zod for external data

### React Components

- **Server Components by Default:** Only use Client Components when needed (`'use client'`)
- **Logic Separation:** Complex logic in `.logic.ts` files
- **Props Typing:** Always type component props
- **No Logic in JSX:** Extract complex conditionals

### Styling

- **Tailwind CSS:** Utility-first approach
- **Raw UI Design:** Flat design, strong borders, no shadows/gradients
- **No Arbitrary Values:** Use standard Tailwind scale (except exceptions)
- **Custom Classes:** Defined in `app/globals.css` (`@layer components`)

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component Files | kebab-case | `quiz-engine.tsx` |
| Component Names | PascalCase | `QuizEngine` |
| Functions/Variables | camelCase | `generateQuiz`, `isLoading` |
| Types/Interfaces | PascalCase | `UserProfile`, `QuizResponse` |
| Route Folders | kebab-case | `app/blog-posts/page.tsx` |
| Constants | SCREAMING_SNAKE | `MAX_CREDITS_DEFAULT` |

---

## Pull Request Process

### Before Submitting

1. **Run Tests:**
   ```bash
   npm run test
   npm run test:e2e
   ```

2. **Check Build:**
   ```bash
   npm run build
   ```

3. **Lint Code:**
   ```bash
   npm run lint
   ```

4. **Verify Environment:**
   ```bash
   node scripts/validate-setup.js
   ```

### PR Requirements

- [ ] All tests pass
- [ ] Build succeeds
- [ ] Code follows style conventions
- [ ] TypeScript compiles without errors
- [ ] No console errors or warnings
- [ ] Documentation updated if needed

### PR Description

Include:
- **What:** Description of changes
- **Why:** Reason for changes
- **How:** Implementation approach
- **Testing:** How changes were tested

---

## Testing Requirements

### Unit Tests

- **Coverage Threshold:** 80% (lines, functions, branches, statements)
- **Location:** Co-located with source files (`*.test.ts`, `*.test.tsx`)
- **Focus:** Utilities, logic, reducers

### Component Tests

- **Tool:** React Testing Library
- **Focus:** User interactions, not implementation details
- **Pattern:** Test from user's perspective

### E2E Tests

- **Tool:** Playwright
- **Focus:** Critical user journeys
- **Browsers:** Chromium, Firefox, WebKit

### Test Standards

See [Testing Standards](./_bmad-output/planning-artifacts/architecture/testing-standards.md) for complete guidelines.

**Key Principles:**
- Test user behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Mock external dependencies
- Keep tests independent

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance
- `style:` - Code style (formatting)

**Examples:**
```
feat: add quiz persistence to localStorage
fix: resolve auth modal positioning issue
docs: update API documentation
refactor: extract quiz logic to separate file
test: add unit tests for ice-logic
```

---

## Branch Strategy

- **`main`** - Production branch (protected)
- **`dev`** - Development branch
- **`feat/{feature-name}`** - Feature branches

### Workflow

1. Create feature branch from `dev`
2. Make changes
3. Run tests and build
4. Create PR to `dev`
5. After review, merge to `dev`
6. Deploy `dev` to staging
7. Merge `dev` to `main` for production

---

## Code Review Guidelines

### For Reviewers

- **Focus on:** Logic, architecture, security, performance
- **Avoid:** Nitpicking style (use linter/formatter)
- **Check:** Tests, error handling, edge cases
- **Verify:** TypeScript types, Zod validation

### For Authors

- **Keep PRs small:** Easier to review
- **Explain why:** Not just what
- **Respond to feedback:** Address all comments
- **Update tests:** If functionality changes

---

## Documentation Standards

### Code Documentation

- **JSDoc Comments:** For public functions and complex logic
- **Type Definitions:** Clear TypeScript types
- **README Updates:** Update if setup changes

### Documentation Files

- **Architecture Changes:** Update `architecture-main.md`
- **API Changes:** Update `api-contracts-main.md`
- **Component Changes:** Update `component-inventory-main.md`
- **New Features:** Update relevant docs

---

## Development Workflow

### Local Development

1. **Clone and Setup:**
   ```bash
   git clone <repo>
   cd postry-ai
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Fill in required variables

3. **Start Development:**
   ```bash
   npm run dev
   ```

4. **Run Tests:**
   ```bash
   npm run test        # Unit tests
   npm run test:e2e   # E2E tests (requires dev server)
   ```

### Making Changes

1. **Create Branch:**
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make Changes:**
   - Follow code conventions
   - Write tests
   - Update documentation

3. **Test Locally:**
   ```bash
   npm run test
   npm run build
   ```

4. **Commit:**
   ```bash
   git commit -m "feat: add my feature"
   ```

5. **Push and PR:**
   ```bash
   git push origin feat/my-feature
   # Create PR via GitHub
   ```

---

## Environment Variables

### Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional

- `GEMINI_API_KEY` (falls back to mocks)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_KEY`
- `NEXT_PUBLIC_BASE_URL` (defaults to http://localhost:3000)

**Note:** Never commit `.env` files. Use `.env.example` as template.

---

## Common Tasks

### Adding a New API Route

1. Create `app/api/{feature}/{action}/route.ts`
2. Add Zod validation
3. Add error handling
4. Add tests (`route.test.ts`)
5. Update `api-contracts-main.md`

### Adding a New Component

1. Determine Server vs Client Component
2. Create file in `components/{category}/`
3. Follow Raw UI design system
4. Add tests (`component.test.tsx`)
5. Update `component-inventory-main.md`

### Modifying Database Schema

1. Create migration: `supabase/migrations/{timestamp}_{description}.sql`
2. Test locally
3. Document changes
4. Update `data-models-main.md`

---

## Troubleshooting

### Common Issues

**Issue: TypeScript errors**
- Solution: Run `npm run build` to see all errors
- Check: `tsconfig.json` settings

**Issue: Tests failing**
- Solution: Check test output for details
- Verify: Mock data and test setup

**Issue: Build fails**
- Solution: Clear `.next/` and rebuild
- Check: Environment variables

**Issue: E2E tests timeout**
- Solution: Ensure dev server is running
- Check: Environment variables and Supabase connection

---

## Resources

### Documentation

- [Development Guide](./development-guide-main.md)
- [Architecture](./architecture-main.md)
- [Testing Standards](./_bmad-output/planning-artifacts/architecture/testing-standards.md)
- [API Contracts](./api-contracts-main.md)

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev/guide)
- [Playwright Docs](https://playwright.dev/docs)

---

_Generated by BMAD Method document-project workflow_
