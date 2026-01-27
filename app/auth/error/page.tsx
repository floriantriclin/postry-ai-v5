"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard');
      }
    });

    const handleError = () => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description');
        if (errorDescription) {
            setError(decodeURIComponent(errorDescription));
        }
    };

    handleError();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div>
      <h1>Authentication Error</h1>
      {error ? <p>{error}</p> : <p>An unknown error occurred.</p>}
    </div>
  );
}
