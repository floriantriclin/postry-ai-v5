---
id: 20260125-post-visibility-fix-v3
date: 2026-01-25
status: 'new'
type: 'fix'
---

### 1. Root Cause Analysis

After two unsuccessful attempts, and based on your feedback, I've identified the likely root cause of the post's invisibility. The issue is not the gradient overlay itself, but the combination of the overlay with an overly strong `blur` effect on the text content.

Currently, the content receives a `blur-md` (`12px`) class, which is quite aggressive. When combined with any semi-transparent white gradient, it's enough to make the text completely illegible.

Your intuition that the modal is causing an "overlay" is correct: the modal's appearance triggers both the blur and the gradient. The problem is that these two effects combined are too strong.

### 2. Proposed Solution (V3)

The most direct solution is to reduce the intensity of the blur effect. This will allow the text to be visible *through* the gradient, achieving the desired "gated but visible" effect.

**File**: [`components/feature/final-reveal.tsx`](components/feature/final-reveal.tsx)

**Modification**: Change `blur-md` to `blur-sm`.

```diff
--- a/components/feature/final-reveal.tsx
+++ b/components/feature/final-reveal.tsx
@@ -176,7 +176,7 @@
                      <div className="relative">
                         {/* Content Masking Logic */}
                         <div
-                          className={`relative z-0 transition-all duration-1000 ease-out ${(showAuthModal || isAuthLoading) ? 'blur-md select-none' : 'blur-0'}`}
+                          className={`relative z-0 transition-all duration-1000 ease-out ${(showAuthModal || isAuthLoading) ? 'blur-sm select-none' : 'blur-0'}`}
                           data-testid="post-content"
                         >
                            {generatedPost.content}

```

### 3. Justification

*   **`blur-sm`** applies a `4px` blur, which is much subtler than the current `12px`. It will make the text unreadable but will not obscure it completely.
*   This change respects your feedback to keep the gradient overlay, as my attempt to remove it was denied. The problem is the interaction of the two effects, not one in isolation.

### 4. Alternative (If V3 Fails)

If reducing the blur is still not enough, it would confirm that the full-screen container for the modal needs its own background. We could add a semi-transparent background to it, which would act as the overlay and might allow us to remove the separate gradient `div` entirely.

Example:
```tsx
// In components/feature/final-reveal.tsx
<div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
  <AuthModal ... />
</div>
```

I recommend trying the `blur-sm` change first, as it is the least invasive and most likely to solve the issue.