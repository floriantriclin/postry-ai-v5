'use client';

import { useRouter } from 'next/navigation';
import LandingClient from './landing-client';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/quiz');
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-white overflow-x-hidden">
      {/* Header Minimaliste */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-center md:justify-start bg-white z-10">
        <span className="font-heading font-black text-2xl tracking-tighter uppercase">
          Postry.AI
        </span>
      </header>

      <div className="w-full max-w-4xl mx-auto py-20">
        <LandingClient onStart={handleStart} />
      </div>

      {/* Footer / Meta discrets */}
      <footer className="absolute bottom-0 left-0 w-full p-6 flex justify-center space-x-4 opacity-30 font-mono text-[10px] uppercase tracking-widest pointer-events-none bg-white">
        <span>v5.0-BRUT</span>
        <span>•</span>
        <span>No-Robot Policy</span>
      </footer>
    </main>
  );
}
