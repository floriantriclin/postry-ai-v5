# Story 2.8 - Phase 3: E2E Test Fixes - Progress Report

**Date:** 2026-01-26  
**Status:** 🟡 PARTIAL COMPLETION  
**Tests Passing:** 9/24 (37.5%)  
**Target:** 24/24 (100%)

## Executive Summary

Phase 3 E2E test fixes have been partially completed. The authenticated redirect tests are now passing across all browsers (Chromium, Firefox, WebKit), but the unauthenticated quiz flow tests are failing due to API/loading state issues.

## Current Test Status

### ✅ Passing Tests (9/24)

All browsers (Chromium, Firefox, WebKit):
- **E2E-2.7-01**: `/quiz/reveal` redirects to `/dashboard` (authenticated context)
- **E2E-2.7-03**: Direct redirect to dashboard (no `/quiz/reveal` in navigation)

### ❌ Failing Tests (15/24)

All browsers (Chromium, Firefox, WebKit):
- **E2E-2.7-02**: localStorage cleaned after successful auth flow
- **E2E-2.7-04**: Auth modal appears without pre-persist call
- **E2E-2.7-05**: Quiz state structure includes all required fields
- **E2E-2.7-REG-01**: Complete quiz flow still works end-to-end
- **E2E-2.7-REG-02**: Post generation API still works

## Root Cause Analysis

### Primary Issue: Quiz Questions Not Loading in Tests

**Symptoms:**
- Tests timeout waiting for `[data-testid="question-card"]` after clicking "Lancer la calibration"
- Timeout occurs after 30-45 seconds
- Issue affects all unauthenticated quiz flow tests

**Root Causes Identified:**

1. **Missing Gemini API Key**
   - `.env` file does not contain `GEMINI_API_KEY`
   - API calls to generate questions fail
   - App should fall back to mock data, but timing is problematic

2. **Loading State Handling**
   - Quiz engine loads P1 questions via API when `step === 'INSTRUCTIONS'`
   - If API fails, fallback to mock data occurs
   - Tests click "Lancer la calibration" button before questions finish loading
   - After clicking, app moves to `PHASE1` step, but questions array is empty
   - App shows loader indefinitely waiting for questions that never arrive

3. **Test Context Issues**
   - Tests correctly use unauthenticated context via `browser.newContext({ storageState: undefined })`
   - Authenticated vs unauthenticated context is working as expected
   - The issue is purely with the quiz question loading mechanism

## Changes Made

### 1. Test File Refactoring ([`e2e/story-2-7.spec.ts`](../../e2e/story-2-7.spec.ts))

**Key Changes:**
- ✅ Fixed E2E-2.7-01 to handle redirect variations (direct to dashboard or via landing page)
- ✅ Converted tests to use `browser.newContext()` for proper unauthenticated context
- ✅ Updated selectors to match actual UI (`[data-testid="theme-*"]`, `[data-testid="start-quiz-btn"]`)
- ✅ Changed navigation from `/` to `/quiz` for unauthenticated tests
- ✅ Added waiting logic for loader to disappear before clicking start button
- ✅ Increased timeouts to 30-45 seconds to account for API fallback
- ❌ Quiz questions still not loading after button click

**Before:**
```typescript
test('E2E-2.7-02: ...', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Commencer")'); // Wrong button text
  // ... used authenticated context by default
});
```

**After:**
```typescript
test('E2E-2.7-02: ...', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  
  await page.goto('/quiz');
  await page.waitForFunction(() => {
    const btn = document.querySelector('[data-testid="start-quiz-btn"]');
    const loader = document.querySelector('[class*="loader"]');
    return btn && !loader && btn.textContent?.includes('Lancer');
  }, { timeout: 45000 });
  
  await page.click('[data-testid="start-quiz-btn"]');
  // ... proper unauthenticated context
});
```

### 2. Understanding Gained

**Authenticated vs Unauthenticated Context:**
- ✅ **Authenticated tests** (E2E-2.7-01, E2E-2.7-03): Use `storageState` from auth.setup files
- ✅ **Unauthenticated tests** (all others): Use `browser.newContext({ storageState: undefined })`
- ✅ Authenticated users are correctly redirected to `/dashboard` when visiting `/` or `/quiz`
- ✅ Unauthenticated users can access `/quiz` and see the theme selector

**Quiz Flow:**
1. User visits `/quiz` → Theme Selector appears
2. User selects theme → Interstitial screen with "Lancer la calibration" button
3. Background: API call to load P1 questions (triggered by `step === 'INSTRUCTIONS'`)
4. User clicks button → Moves to `PHASE1` step
5. **Problem**: If questions aren't loaded yet, app shows loader indefinitely

## Recommendations

### Option 1: Add Gemini API Key (Quick Fix)
**Effort:** Low  
**Impact:** High  

Add `GEMINI_API_KEY` to `.env` file to enable real API calls:
```bash
GEMINI_API_KEY="your-api-key-here"
```

**Pros:**
- Tests will use real API
- Validates actual production behavior
- May resolve timing issues

**Cons:**
- Requires API key
- Tests depend on external service
- May be slower
- API rate limits could affect tests

### Option 2: Fix Mock Data Fallback Timing (Recommended)
**Effort:** Medium  
**Impact:** High  

Investigate why mock data fallback isn't working properly in tests:

1. Check [`components/feature/quiz-engine.tsx`](../../components/feature/quiz-engine.tsx) lines 36-58
2. Verify error handling in API load effects
3. Ensure mock data is properly dispatched on API failure
4. Add better loading state management

**Pros:**
- Tests don't depend on external API
- Faster test execution
- More reliable
- Tests actual fallback behavior

**Cons:**
- Requires code changes to quiz engine
- Need to understand React state management timing

### Option 3: Improve Test Waiting Logic
**Effort:** Medium  
**Impact:** Medium  

Add better detection of when questions are actually loaded:

```typescript
// Wait for questions to be loaded in localStorage or state
await page.waitForFunction(() => {
  const state = localStorage.getItem('ice_quiz_state_v1');
  if (!state) return false;
  const parsed = JSON.parse(state);
  return parsed.questionsP1 && parsed.questionsP1.length > 0;
}, { timeout: 60000 });
```

**Pros:**
- No code changes to app
- More robust waiting
- Tests actual state

**Cons:**
- May not solve root cause
- Longer timeouts
- Still depends on questions loading

### Option 4: Mock API at Network Level
**Effort:** High  
**Impact:** High  

Use Playwright's route mocking to intercept API calls:

```typescript
await page.route('**/api/quiz/generate**', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockQuestions)
  });
});
```

**Pros:**
- Full control over API responses
- Fast and reliable
- No external dependencies
- Tests API integration

**Cons:**
- Requires maintaining mock data
- More test code
- Doesn't test real API

## Next Steps

### Immediate Actions (Recommended)

1. **Investigate Mock Fallback** (2-3 hours)
   - Debug why mock data isn't loading in tests
   - Check console logs during test execution
   - Verify error handling in quiz engine

2. **Add Network Mocking** (2-3 hours)
   - Implement Playwright route mocking for quiz APIs
   - Create comprehensive mock data
   - Update all failing tests to use mocks

3. **Validate Cross-Browser** (30 min)
   - Once fixed, run full test suite
   - Verify all 24 tests pass on Chromium, Firefox, WebKit

### Alternative: Accept Current State

If time is constrained, document that:
- 9/24 tests passing (37.5%)
- Authenticated redirect behavior is validated
- Unauthenticated quiz flow requires API configuration or mocking
- Tests can be completed in future sprint

## Files Modified

- [`e2e/story-2-7.spec.ts`](../../e2e/story-2-7.spec.ts) - Complete refactoring for auth context
- [`docs/qa/story-2-8-phase-3-e2e-fix-report.md`](./story-2-8-phase-3-e2e-fix-report.md) - This report

## Files to Update (Pending)

- [`e2e/README.md`](../../e2e/README.md) - Documentation of auth context usage
- Quiz engine or test mocking - To fix question loading

## Conclusion

Significant progress has been made in understanding and fixing the E2E test issues. The authenticated redirect tests are now passing, and the test structure has been properly refactored to use correct authentication contexts. 

The remaining issue is a technical problem with quiz question loading that requires either:
1. API configuration (quick but external dependency)
2. Code fix to mock fallback (recommended, more robust)
3. Test-level API mocking (comprehensive but more work)

**Recommendation:** Proceed with Option 2 (Fix Mock Data Fallback) or Option 4 (Mock API at Network Level) for a production-ready solution.
