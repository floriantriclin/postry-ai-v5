"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthConfirm() {
  const router = useRouter();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    setStatus('useEffect triggered. Subscribing to onAuthStateChange...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setStatus(`onAuthStateChange event: ${event}`);
      if (session && event === 'SIGNED_IN') {
        setStatus('SIGNED_IN event received. Redirecting...');
        const searchParams = new URLSearchParams(window.location.search);
        const next = searchParams.get('next') ?? '/dashboard';
        router.push(next);
      }
    });

    // Also check the session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('Session found on initial check. Redirecting...');
        const searchParams = new URLSearchParams(window.location.search);
        const next = searchParams.get('next') ?? '/dashboard';
        router.push(next);
      } else {
        setStatus('No session found on initial check. Waiting for event...');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div>
      <h1>Authenticating...</h1>
      <p>Please wait while we log you in.</p>
      <pre>{status}</pre>
    </div>
  );
}
