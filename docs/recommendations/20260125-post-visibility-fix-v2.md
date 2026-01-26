---
id: 20260125-post-visibility-fix-v2
date: 2026-01-25
status: 'done'
type: 'fix'
---

### 1. Issue Description & Root Cause Analysis

My previous recommendation did not solve the post's visibility issue. After further analysis, the root cause is a conflict between multiple CSS rules and a redundant `opacity` setting.

Specifically:
1.  **Conflicting Styles**: The gradient overlay had both Tailwind `bg-gradient-*` classes and a separate inline `style` tag attempting to apply a `linear-gradient`. This is redundant and the browser was likely ignoring the inline style.
2.  **Opacity on Content**: The `div` containing the post text had its opacity reduced to 50% (`opacity-50`). This, combined with the gradient overlay, made the text almost completely invisible.

### 2. Proposed Solution

The solution is to simplify and consolidate the styling, relying only on Tailwind CSS utility classes for a more robust and predictable result.

**File**: [`components/feature/final-reveal.tsx`](components/feature/final-reveal.tsx)

**Modification**:

```diff
--- a/components/feature/final-reveal.tsx
+++ b/components/feature/final-reveal.tsx
@@ -176,17 +176,15 @@
                      <div className="relative">
                         {/* Content Masking Logic */}
                         <div
-                          className={`relative z-0 transition-all duration-1000 ease-out ${(showAuthModal || isAuthLoading) ? 'blur-md select-none opacity-50' : 'blur-0 opacity-100'}`}
+                          className={`relative z-0 transition-all duration-1000 ease-out ${(showAuthModal || isAuthLoading) ? 'blur-md select-none' : 'blur-0'}`}
                           data-testid="post-content"
                         >
                            {generatedPost.content}
                         </div>
                          
                         {/* Blur/Gate Logic (Story 2.3/2.4) */}
-                        {/* The post remains blurred until authenticated. */}
                         {(showAuthModal || isAuthLoading) && (
-                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 pointer-events-none"
-                               style={{ background: 'linear-gradient(to bottom, transparent 25, rgba(255,255,255,0.6) 50%, #ffffff 90%)' }} />
+                          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/80 to-white z-10 pointer-events-none" />
                         )}
                          
                         {/* Auth Modal Integration Point (Story 2.3) */}

```

### 3. Explanation of Changes

1.  **Removed `opacity-50`**: In the content `div`, I have removed the `opacity-50` class. The `blur-md` and the gradient are sufficient to gate the content without making it invisible.
2.  **Simplified Gradient**: In the overlay `div`, I have removed the inline `style` tag and the old `bg-gradient-*` classes entirely.
3.  **New Tailwind Gradient**: I've replaced them with a single, more reliable Tailwind utility class definition: `bg-gradient-to-b from-white/0 via-white/80 to-white`. This creates a vertical gradient that is:
    *   `from-white/0`: Fully transparent at the top.
    *   `via-white/80`: 80% opaque white in the middle.
    *   `to-white`: Fully opaque white at the bottom.

This approach is cleaner, avoids CSS conflicts, and should produce the desired effect of a blurred but still discernible post content.