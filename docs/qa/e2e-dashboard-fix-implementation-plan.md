# E2E Dashboard Test Fix Implementation Plan

**Date:** 2026-01-26  
**Status:** In Progress  
**Priority:** High

## Executive Summary

This document outlines the implementation plan to fix 5 failing E2E tests in the dashboard test suite, bringing the pass rate from 91.4% to 100%.

## Root Cause Analysis

### Issue 1: Firefox/WebKit Auth State Recognition (4 tests failing)

**Problem:** Auth state stored during setup is not being properly recognized when tests run in Firefox and WebKit, causing redirects to landing page with `?redirectedFrom=/dashboard`.

**Root Cause:** The auth setup files for Firefox and WebKit are creating and saving auth state correctly, but there's a mismatch in how the session is being validated by the middleware when tests run.

**Evidence:**
- Setup completes successfully and saves auth files
- Dashboard loads during setup verification
- Tests fail when trying to access dashboard with stored auth state
- Chromium works correctly, suggesting browser-specific cookie/storage handling

**Affected Tests:**
- Firefox: `should display the post reveal view if authenticated`
- Firefox: `should logout the user` (cascading failure)
- WebKit: `should display the post reveal view if authenticated`
- WebKit: `should logout the user` (cascading failure)

### Issue 2: Chromium Logout Navigation Timeout (1 test failing)

**Problem:** After clicking logout button, navigation to "/" times out after 15 seconds.

**Root Cause:** The logout implementation in [`header.tsx`](components/feature/header.tsx:15) uses `window.location.href = "/"` which may not trigger Playwright's navigation detection properly. The test uses `Promise.all` with `page.waitForURL` and `click()`, but the hard navigation might complete before Playwright can properly track it.

**Current Implementation:**
```typescript
// header.tsx
const handleSignOut = async () => {
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    window.location.href = "/";
  }
};
```

**Test Implementation:**
```typescript
// dashboard.spec.ts
await Promise.all([
  page.waitForURL('/', { timeout: 15000 }),
  logoutBtn.click()
]);
```

### Issue 3: Visual Regression (2 tests failing)

**Problem:** Dashboard screenshots differ by ~9-10% from baseline snapshots.

**Root Cause:** Recent UI changes to the dashboard (likely the new header layout or post reveal view styling) have not been captured in the baseline snapshots.

**Affected Tests:**
- Chromium: `should match the visual snapshot`
- WebKit: `should match the visual snapshot`

## Implementation Plan

### Priority 1: Fix Firefox/WebKit Auth State Recognition

**Strategy:** Ensure auth state is properly loaded and recognized across all browsers.

**Actions:**

1. **Add explicit session validation in setup files**
   - After saving auth state, verify it can be loaded back
   - Add debug logging to track session state

2. **Enhance middleware session handling**
   - Add debug logging to understand why Firefox/WebKit sessions aren't recognized
   - Ensure cookie names match across setup and runtime

3. **Update test configuration**
   - Verify `storageState` is properly configured in `playwright.config.ts`
   - Ensure browser contexts are using the correct auth files

**Files to Modify:**
- [`e2e/auth.setup.firefox.ts`](e2e/auth.setup.firefox.ts:1)
- [`e2e/auth.setup.webkit.ts`](e2e/auth.setup.webkit.ts:1)
- [`middleware.ts`](middleware.ts:1) (add debug logging)
- [`e2e/dashboard.spec.ts`](e2e/dashboard.spec.ts:1) (add pre-test validation)

### Priority 2: Fix Chromium Logout Navigation Timeout

**Strategy:** Improve test robustness by waiting for actual page elements instead of just URL changes.

**Actions:**

1. **Update logout test to wait for landing page elements**
   - Instead of just waiting for URL, wait for landing page to fully load
   - Add explicit waits for landing page elements

2. **Consider alternative: Use page.goto() after logout**
   - If navigation detection is unreliable, manually navigate after logout completes

**Files to Modify:**
- [`e2e/dashboard.spec.ts`](e2e/dashboard.spec.ts:47)

**Proposed Fix:**
```typescript
test("should logout the user", async ({ page }) => {
  const logoutBtn = page.getByTestId("logout-button");
  await expect(logoutBtn).toBeVisible();
  
  // Click and wait for navigation to complete
  await logoutBtn.click();
  
  // Wait for landing page to load (more reliable than URL)
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL("/");
  
  // Verify we're on landing page by checking for landing page elements
  await expect(page.locator('text=Postry')).toBeVisible();
});
```

### Priority 3: Address Visual Regression

**Strategy:** Update baseline snapshots to reflect current UI state.

**Actions:**

1. **Verify dashboard UI is correct**
   - Manually inspect dashboard to ensure it looks correct
   - Compare with design specifications

2. **Update snapshots**
   - Run: `npx playwright test e2e/dashboard.spec.ts --update-snapshots`
   - Review diff images to ensure changes are intentional

3. **Consider adding tolerance**
   - If minor rendering differences are acceptable, add `maxDiffPixelRatio` threshold

**Files to Modify:**
- [`e2e/dashboard.spec.ts`](e2e/dashboard.spec.ts:69)
- Snapshot files in `e2e/dashboard.spec.ts-snapshots/`

**Optional Enhancement:**
```typescript
test("should match the visual snapshot", async ({ page }) => {
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05 // Allow 5% difference for font rendering
  });
});
```

### Priority 4: Investigate Test Count Discrepancy

**Strategy:** Understand why there are 81 tests instead of expected 79.

**Actions:**

1. **Count tests by category**
   - Review test files and count actual test cases
   - Compare with documentation

2. **Update documentation**
   - Correct expected test count in reports
   - Document any new tests added

## Implementation Order

1. **Phase 1: Quick Wins (30 minutes)**
   - Fix logout test (Priority 2)
   - Update visual snapshots (Priority 3)

2. **Phase 2: Auth State Fix (2-3 hours)**
   - Debug and fix Firefox/WebKit auth state (Priority 1)
   - Add validation and logging

3. **Phase 3: Verification (30 minutes)**
   - Run full test suite
   - Verify 100% pass rate
   - Update documentation

## Testing Strategy

**Iterative Testing:**
```bash
# Test only dashboard tests during development
npx playwright test e2e/dashboard.spec.ts

# Test specific browser
npx playwright test e2e/dashboard.spec.ts --project=firefox

# Full suite verification (only after dashboard tests pass)
npm run test:e2e
```

## Success Criteria

- [ ] All 5 failing tests pass
- [ ] Test pass rate: 100% (81/81 or corrected count)
- [ ] No new test failures introduced
- [ ] Tests are stable across all 3 browsers (Chromium, Firefox, WebKit)
- [ ] Documentation updated to reflect fixes

## Risk Assessment

**Low Risk:**
- Logout test fix (isolated change)
- Visual snapshot update (reversible)

**Medium Risk:**
- Auth state fix (affects multiple tests, but isolated to test setup)

**Mitigation:**
- Test incrementally
- Keep backup of working auth setup files
- Use git to track changes

## Timeline Estimate

- **Logout Fix:** 30 minutes
- **Visual Regression:** 30 minutes
- **Auth State Fix:** 2-3 hours
- **Verification:** 30 minutes
- **Total:** 4-5 hours

## Related Documents

- [E2E Test Execution Report](e2e-test-execution-report-20260126.md)
- [Dashboard E2E Fix Recommendations](../recommendations/20260126-dashboard-e2e-fix.md)
- [E2E Cross-Browser Status Report](e2e-cross-browser-status-report.md)
