# Fix: Magic Link Authentication (v6)

**Date**: 2026-01-25

## Problem Statement

The previous fix for the authentication flow was incomplete. While the middleware was updated to handle public and private routes, it did not account for the client-side nature of Supabase's magic link authentication. The magic link contains the access token in the URL fragment (`#`), which is not accessible on the server-side. As a result, the middleware is unable to authenticate the user and redirects them to the landing page.

Furthermore, the proposed client-side handler did not correctly handle the redirect URL, always redirecting to `/dashboard` instead of the intended destination.

## Proposed Solution

To resolve these issues, we need to create a dedicated page at `/auth/confirm` that will handle the client-side authentication process. This page will be responsible for:

1.  Extracting the access token from the URL fragment.
2.  Using the Supabase client to set the user's session.
3.  Reading the `next` query parameter from the URL to determine the correct redirect destination.
4.  Redirecting the user to their intended destination upon successful authentication.

### New File: `app/auth/confirm/page.tsx`

The following file should be created at `app/auth/confirm/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoaderMachine from '@/components/ui/loader-machine';

export default function AuthConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Wait for the server to acknowledge the session before redirecting
        await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session }),
        });
        const next = searchParams.get('next') || '/dashboard';
        router.replace(next);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        handleAuth();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoaderMachine />
    </div>
  );
}
```

### New File: `app/api/auth/callback/route.ts`

To ensure the server-side is aware of the session, we need a new API route. Create the file `app/api/auth/callback/route.ts` with the following content:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { session } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.setSession(session);
  return NextResponse.json({ success: true });
}
```

### Rationale for Changes

-   **Client-Side Handling**: The `AuthConfirm` component runs on the client (`'use client'`), which allows it to access the full URL, including the hash fragment.
-   **Dynamic Redirect**: The `useSearchParams` hook is used to read the `next` query parameter from the URL. This allows the component to redirect the user to the page they were originally trying to access, providing a seamless user experience. If the `next` parameter is not present, it defaults to `/dashboard`.
-   **`onAuthStateChange`**: This Supabase listener detects when the authentication state changes (i.e., when the user is signed in) and triggers the `handleAuth` function.
-   **API Callback**: The `/api/auth/callback` route is a new addition that allows the client to inform the server about the new session. This is crucial for ensuring that subsequent server-side rendering requests are authenticated correctly.
-   **User Experience**: While the authentication is being processed, a loading spinner is displayed to the user, providing a better user experience.

By implementing these changes, we will have a complete and robust magic link authentication flow that works seamlessly with both client-side and server-side rendering, and correctly redirects users to their intended destination.
