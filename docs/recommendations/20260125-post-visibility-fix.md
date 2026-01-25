---
id: 20260125-post-visibility-fix
date: 2026-01-25
status: 'new'
type: 'fix'
---

### 1. Issue Description

The post content in the final reveal step is almost completely invisible, not just blurred as intended. This is caused by an aggressive `linear-gradient` that fades to white too quickly, obscuring the text entirely. The hook is readable, but the main content is not.

| Before (Current State) | After (Proposed Fix) |
| :--- | :--- |
| ![Before](https://i.imgur.com/your-before-image-url.png) | ![After](https://i.imgur.com/your-after-image-url.png) |
| *The gradient makes the text unreadable.* | *The gradient is softened, making the text visible but blurred.* |


### 2. Analysis of the problem

The issue is located in `components/feature/final-reveal.tsx`. The `linear-gradient` applied as an overlay on the post content is configured to go from transparent to fully white over a short distance, effectively hiding the content instead of just blurring it.

```tsx
// components/feature/final-reveal.tsx:189
style={{ background: 'linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.6) 15%, #ffffff 45%)' }}
```

This configuration means that by 45% of the way down the container, the overlay is completely opaque white.

### 3. Proposed solution

I recommend adjusting the `linear-gradient` to be less aggressive. By increasing the transparency stop and delaying the full white opacity, the text behind it will be visible, while still maintaining the "gated content" effect.

**File**: [`components/feature/final-reveal.tsx`](components/feature/final-reveal.tsx)

**Modification**:

```diff
--- a/components/feature/final-reveal.tsx
+++ b/components/feature/final-reveal.tsx
@@ -186,7 +186,7 @@
                        {/* The post remains blurred until authenticated. */}
                        {(showAuthModal || isAuthLoading) && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 pointer-events-none"
-                              style={{ background: 'linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.6) 15%, #ffffff 45%)' }} />
+                              style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(255,255,255,0.8) 50%, #ffffff 90%)' }} />
                        )}
                         
                        {/* Auth Modal Integration Point (Story 2.3) */}

```

This change will make the gradient start fading out later (at 20% instead of 5%) and become fully opaque much lower down (at 90% instead of 45%). This will keep the content visible yet blurred, which is the desired effect before authentication.