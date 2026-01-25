---
id: 20260125-auth-flow-fix
date: 2026-01-25
status: 'new'
type: 'fix'
---

### 1. Issue Description: Broken Magic Link Authentication Flow

The primary issue is that the user authentication flow via magic link is broken. Users are incorrectly redirected to the landing page (`/`) instead of their intended destination (`/quiz/reveal` and then `/dashboard`).

This is caused by a misconfiguration in `middleware.ts`. The `matcher` config only instructs the middleware to run on `/dashboard` routes. This means the server-side code that exchanges the auth token for a session cookie never runs when the user returns from the magic link to the `/auth/confirm` page.

### 2. Analysis of the problem

The current `matcher` in `middleware.ts` is:
```typescript
export const config = {
  matcher: ["/dashboard/:path*"],
};
```
This is insufficient. It needs to run on all paths where authentication state is relevant, which is most of the application. The middleware is responsible for refreshing the user's session cookie, which is essential for both client-side and server-side authentication checks.

### 3. Proposed solution

I recommend updating the `matcher` to the configuration recommended by the official Supabase documentation for Next.js. This will ensure the middleware runs on all necessary paths, excluding static files and assets.

**File**: [`middleware.ts`](middleware.ts)

**Modification**:

```diff
--- a/middleware.ts
+++ b/middleware.ts
@@ -69,5 +69,7 @@
 }
 
 export const config = {
-  matcher: ["/dashboard/:path*"],
+  matcher: [
+    /*
+     * Match all request paths except for the ones starting with:
+     * - _next/static (static files)
+     * - _next/image (image optimization files)
+     * - favicon.ico (favicon file)
+     * Feel free to modify this pattern to include more paths.
+     */
+    "/((?!_next/static|_next/image|favicon.ico).*)",
+  ],
 };
```

### 4. Expected Outcome

With this change:
1.  The middleware will correctly intercept the `/auth/confirm` callback from the magic link.
2.  The user's session will be properly established on the server and the auth cookie will be set.
3.  The user will be correctly redirected to `/quiz/reveal`.
4.  The logic in `/quiz/reveal/page.tsx` will execute, fetching the user's post and redirecting them to the `/dashboard`.
5.  The user will land on the dashboard with their post, as intended.