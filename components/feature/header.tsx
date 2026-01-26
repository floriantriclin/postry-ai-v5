
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    try {
      // Race signOut with a 2s timeout to prevent hanging
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Force a hard refresh to ensure complete cleanup
      window.location.href = "/";
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/dashboard">
        <h1 className="text-2xl font-bold">Postry</h1>
      </Link>
      <button
        onClick={handleSignOut}
        className="bg-black text-white rounded-none h-12 px-4"
        data-testid="logout-button"
      >
        Déconnexion
      </button>
    </header>
  );
}
