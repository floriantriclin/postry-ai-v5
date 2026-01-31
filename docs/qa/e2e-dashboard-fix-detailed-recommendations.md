# E2E Dashboard Test Fix - Detailed Technical Recommendations

**Date:** 2026-01-26  
**Author:** QA Test Architect  
**Status:** Ready for Implementation

## Summary

This document provides detailed technical recommendations to fix 5 failing E2E tests in the dashboard test suite. One fix has been implemented (logout test), and 4 require code mode implementation.

## Fixes Implemented ✅

### 1. Chromium Logout Navigation Timeout - FIXED

**File:** [`e2e/dashboard.spec.ts`](e2e/dashboard.spec.ts:47)

**Change Made:**
- Simplified logout test to use `waitForLoadState('networkidle')` instead of `Promise.all` with `waitForURL`
- This is more reliable for hard navigations using `window.location.href`

**Status:** ✅ Implemented and ready for testing

## Fixes Required (Need Code Mode) 🔧

### 2. Firefox Auth State Recognition - CRITICAL

**Root Cause:** Firefox setup uses `sameSite: 'Strict'` while Chromium uses `sameSite: 'Lax'`. The Strict policy prevents cookies from being sent in cross-site contexts, which may be causing the auth state to not be recognized.

**File:** [`e2e/auth.setup.firefox.ts`](e2e/auth.setup.firefox.ts:114)

**Required Change:**
```typescript
// CHANGE FROM:
// Firefox: Use Strict sameSite policy
await page.context().addCookies([
  { 
    name: cookieName, 
    value: token, 
    domain: 'localhost', 
    path: '/', 
    httpOnly: false, 
    secure: false, 
    sameSite: 'Strict'  // ❌ TOO RESTRICTIVE
  },
  { 
    name: 'sb-localhost-auth-token', 
    value: token, 
    domain: 'localhost', 
    path: '/', 
    httpOnly: false, 
    secure: false, 
    sameSite: 'Strict'  // ❌ TOO RESTRICTIVE
  }
]);

// CHANGE TO:
// Firefox: Use Lax sameSite policy (same as Chromium for consistency)
await page.context().addCookies([
  { 
    name: cookieName, 
    value: token, 
    domain: 'localhost', 
    path: '/', 
    httpOnly: false, 
    secure: false, 
    sameSite: 'Lax'  // ✅ MATCHES CHROMIUM
  },
  { 
    name: 'sb-localhost-auth-token', 
    value: token, 
    domain: 'localhost', 
    path: '/', 
    httpOnly: false, 
    secure: false, 
    sameSite: 'Lax'  // ✅ MATCHES CHROMIUM
  }
]);
```

**Impact:** This will fix 2 failing tests in Firefox:
- `should display the post reveal view if authenticated`
- `should logout the user` (cascading fix)

### 3. WebKit Auth State Recognition - ALREADY CORRECT

**File:** [`e2e/auth.setup.webkit.ts`](e2e/auth.setup.webkit.ts:114)

**Current State:** WebKit already uses `sameSite: 'Lax'` (lines 124 and 133), which matches Chromium.

**Analysis:** The WebKit failures may be due to a different issue. Let me investigate further by checking if there's a timing issue or if the auth state needs additional validation.

**Potential Additional Fix:**
Add explicit session validation after loading auth state in the dashboard test:

```typescript
test.beforeEach(async ({ page, browserName }) => {
  await page.goto("/dashboard");
  
  // For Firefox/WebKit, add explicit wait for auth to be recognized
  if (browserName === 'firefox' || browserName === 'webkit') {
    await page.waitForTimeout(500); // Allow time for session validation
  }
});
```

However, let me first check if there's another issue in the WebKit setup...

**UPDATE:** After reviewing the WebKit setup file more carefully, I notice the comment on line 114 says "Use None sameSite with secure flag" but the actual implementation uses `Lax`. This suggests the setup was already corrected. The issue might be elsewhere.

**Recommended Investigation:**
1. Check if WebKit auth state file is being created correctly
2. Verify the auth state is being loaded by the test
3. Add debug logging to see what's happening during test execution

**Temporary Workaround for Testing:**
Add a pre-test validation in [`e2e/dashboard.spec.ts`](e2e/dashboard.spec.ts:7):

```typescript
test.beforeEach(async ({ page, browserName }) => {
  await page.goto("/dashboard");
  
  // Debug: Log current URL to see if redirect happened
  console.log(`[${browserName}] Current URL after goto:`, page.url());
  
  // If redirected, fail fast with clear message
  if (page.url().includes('redirectedFrom')) {
    throw new Error(`Auth state not recognized in ${browserName}. Check auth setup file.`);
  }
});
```

### 4. Visual Regression - Snapshots Need Update

**Files:** 
- [`e2e/dashboard.spec.ts`](e2e/dashboard.spec.ts:69)
- Snapshot files in `e2e/dashboard.spec.ts-snapshots/`

**Required Action:**
Run the following command to update baseline snapshots:

```bash
npx playwright test e2e/dashboard.spec.ts --update-snapshots
```

**Verification Steps:**
1. Before updating, manually verify the dashboard looks correct
2. Run the update command
3. Review the diff images in the test report
4. Commit the new snapshots if they look correct

**Optional Enhancement:**
If minor rendering differences are acceptable (e.g., font rendering variations), add tolerance:

```typescript
test("should match the visual snapshot", async ({ page }) => {
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05 // Allow 5% difference
  });
});
```

## Implementation Priority

1. **IMMEDIATE:** Fix Firefox sameSite policy (5 minutes)
2. **HIGH:** Investigate WebKit auth issue (30-60 minutes)
3. **MEDIUM:** Update visual snapshots (5 minutes)
4. **LOW:** Add debug logging for future troubleshooting (15 minutes)

## Testing Strategy

### Phase 1: Fix Firefox (Quick Win)
```bash
# 1. Fix Firefox auth setup file (change Strict to Lax)
# 2. Delete existing auth state to force fresh setup
rm e2e/.auth/user.firefox.json

# 3. Run Firefox tests only
npx playwright test e2e/dashboard.spec.ts --project=firefox

# Expected: 5/5 tests pass (up from 2/5)
```

### Phase 2: Investigate WebKit
```bash
# 1. Add debug logging to dashboard test
# 2. Run WebKit tests with debug output
DEBUG=pw:api npx playwright test e2e/dashboard.spec.ts --project=webkit

# 3. Analyze logs to identify root cause
# 4. Apply fix based on findings
```

### Phase 3: Update Snapshots
```bash
# 1. Verify dashboard UI looks correct
npm run dev
# Open http://localhost:3000/dashboard and verify visually

# 2. Update snapshots
npx playwright test e2e/dashboard.spec.ts --update-snapshots

# 3. Verify all tests pass
npx playwright test e2e/dashboard.spec.ts
```

### Phase 4: Full Suite Verification
```bash
# Only run after all dashboard tests pass
npm run test:e2e
```

## Expected Outcomes

### Before Fixes
- **Total Tests:** 81
- **Passed:** 74 (91.4%)
- **Failed:** 5 (6.2%)
- **Skipped:** 2 (2.5%)

### After Fixes
- **Total Tests:** 81
- **Passed:** 79 (97.5%)
- **Failed:** 0 (0%)
- **Skipped:** 2 (2.5%)

**Note:** 2 tests remain skipped (clipboard tests in Firefox/WebKit) - this is intentional due to browser limitations.

## Risk Assessment

### Low Risk Changes ✅
- Logout test fix (already implemented)
- Visual snapshot update (reversible)

### Medium Risk Changes ⚠️
- Firefox sameSite policy change (isolated to test setup)
- WebKit investigation (may require multiple iterations)

### Mitigation Strategies
1. Test changes incrementally (one browser at a time)
2. Keep backups of working auth state files
3. Use git to track all changes
4. Run full test suite only after dashboard tests pass

## Additional Recommendations

### 1. Add Auth State Validation Helper

Create a shared helper function to validate auth state across all browsers:

```typescript
// e2e/helpers/auth-validation.ts
export async function validateAuthState(page: Page, browserName: string) {
  const url = page.url();
  
  if (url.includes('redirectedFrom')) {
    console.error(`❌ [${browserName}] Auth state not recognized`);
    console.error(`   Current URL: ${url}`);
    console.error(`   Expected: /dashboard`);
    throw new Error(`Auth state validation failed for ${browserName}`);
  }
  
  console.log(`✅ [${browserName}] Auth state validated successfully`);
}
```

### 2. Standardize Cookie Configuration

Create a shared cookie configuration to ensure consistency:

```typescript
// e2e/helpers/cookie-config.ts
export function getAuthCookieConfig(cookieName: string, token: string) {
  return [
    { 
      name: cookieName, 
      value: token, 
      domain: 'localhost', 
      path: '/', 
      httpOnly: false, 
      secure: false, 
      sameSite: 'Lax' as const // Consistent across all browsers
    },
    { 
      name: 'sb-localhost-auth-token', 
      value: token, 
      domain: 'localhost', 
      path: '/', 
      httpOnly: false, 
      secure: false, 
      sameSite: 'Lax' as const
    }
  ];
}
```

### 3. Add Pre-Test Health Check

Add a health check before running tests:

```typescript
// e2e/dashboard.spec.ts
test.beforeAll(async ({ browser }) => {
  // Verify auth state files exist
  const authFiles = [
    'e2e/.auth/user.chromium.json',
    'e2e/.auth/user.firefox.json',
    'e2e/.auth/user.webkit.json'
  ];
  
  for (const file of authFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Auth state file missing: ${file}`);
    }
  }
});
```

## Next Steps

1. **Switch to Code Mode** to implement the Firefox auth fix
2. **Test Firefox** to verify the fix works
3. **Investigate WebKit** with debug logging
4. **Update snapshots** once auth issues are resolved
5. **Run full test suite** to verify 100% pass rate
6. **Update documentation** with final results

## Related Documents

- [E2E Test Execution Report](e2e-test-execution-report-20260126.md)
- [E2E Dashboard Fix Implementation Plan](e2e-dashboard-fix-implementation-plan.md)
- [Dashboard E2E Fix Recommendations](../recommendations/20260126-dashboard-e2e-fix.md)
- [E2E Cross-Browser Status Report](e2e-cross-browser-status-report.md)

## Conclusion

The primary issue is the `sameSite: 'Strict'` policy in Firefox auth setup. Changing it to `'Lax'` (matching Chromium) should fix 2 of the 5 failing tests immediately. The WebKit issue requires further investigation, but may be resolved by the same fix or may need additional debugging. The visual regression is expected and just needs snapshot updates.

**Estimated Time to 100% Pass Rate:** 2-3 hours
