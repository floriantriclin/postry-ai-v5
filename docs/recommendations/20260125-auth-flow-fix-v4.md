# Fix: Correct Authentication Flow and Post Visibility

**Date**: 2026-01-25

## Problem Statement

Users are experiencing two primary issues related to authentication and post visibility:

1.  **Magic Link Failure**: When a user clicks on a magic link in an email to view their post, they are redirected to the main landing page instead of the post itself. This breaks the user journey for returning users.
2.  **Incorrect Post-Quiz Redirect**: After completing the quiz and clicking "Déterminer mon style", users are shown their post on a non-dashboard page. They are not transitioned into the authenticated dashboard experience, which limits their ability to interact with their results further.

These issues stem from improper handling of authentication state and redirects within the application's middleware.

## Proposed Solution

To resolve these issues, we need to implement a more robust authentication flow in `middleware.ts`. The proposed changes will ensure that:
- Public paths are explicitly defined to allow unauthenticated access where necessary.
- Authenticated users are correctly redirected to the dashboard.
- Unauthenticated users attempting to access protected routes are redirected to the login page.

### `middleware.ts` Modifications

The following changes should be applied to `middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("Request URL:", request.url);
  console.log("Request Cookies:", request.cookies.getAll());
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const publicPaths = ["/", "/auth/confirm"];

  if (!session && !publicPaths.includes(request.nextUrl.pathname) && !request.nextUrl.pathname.startsWith('/quiz')) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }


  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Rationale for Changes

- **Public Paths**: The `publicPaths` array explicitly defines which routes are accessible without authentication. This prevents the middleware from incorrectly blocking access to the landing page and the authentication confirmation page.
- **Redirect to Login**: If a user is not authenticated and tries to access a protected route (any route not in `publicPaths`), they will be redirected to the landing page. A `redirectedFrom` query parameter is added to the URL, which can be used to redirect the user back to their intended page after they log in.
- **Redirect to Dashboard**: If a user is already authenticated and navigates to the landing page (`/`), they will be automatically redirected to their dashboard. This provides a seamless experience for logged-in users.
- **Quiz Flow**: The quiz flow is exempted from the authentication check to allow new users to take the quiz.

By implementing these changes, we will create a more intuitive and robust user journey, ensuring that users can seamlessly access their content and navigate the application.
