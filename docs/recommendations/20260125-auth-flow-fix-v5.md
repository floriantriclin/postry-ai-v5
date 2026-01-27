# Fix: Magic Link Authentication

**Date**: 2026-01-25

## Problem Statement

The previous fix for the authentication flow was incomplete. While the middleware was updated to handle public and private routes, it did not account for the client-side nature of Supabase's magic link authentication. The magic link contains the access token in the URL fragment (`#`), which is not accessible on the server-side. As a result, the middleware is unable to authenticate the user and redirects them to the landing page.

## Proposed Solution

To resolve this issue, we need to create a dedicated page at `/auth/confirm` that will handle the client-side authentication process. This page will be responsible for:

1.  Extracting the access token from the URL fragment.
2.  Using the Supabase client to set the user's session.
3.  Redirecting the user to the dashboard upon successful authentication.

### New File: `app/auth/confirm/page.tsx`

The following file should be created at `app/auth/confirm/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoaderMachine from '@/components/ui/loader-machine';

export default function AuthConfirm() {
  const router = useRouter();
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
        router.replace('/dashboard');
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
  }, [router, supabase]);

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
-   **`onAuthStateChange`**: This Supabase listener detects when the authentication state changes (i.e., when the user is signed in) and triggers the `handleAuth` function.
-   **API Callback**: The `/api/auth/callback` route is a new addition that allows the client to inform the server about the new session. This is crucial for ensuring that subsequent server-side rendering requests are authenticated correctly.
-   **User Experience**: While the authentication is being processed, a loading spinner is displayed to the user, providing a better user experience.

By implementing these changes, we will have a complete and robust magic link authentication flow that works seamlessly with both client-side and server-side rendering.
