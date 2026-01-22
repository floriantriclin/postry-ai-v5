'use client';

import Link from 'next/link';

export default function LandingClient() {
  return (
    <section className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          Trouvez votre Voix.<br />
          <span className="text-zinc-500">Pas celle d'un Robot.</span>
        </h1>
        <p className="text-lg md:text-xl font-medium max-w-lg mx-auto">
          Découvrez quel genre d’auteur vous êtes en 2 minutes.
        </p>
      </div>

      <Link
        href="/quiz"
        className="raw-button raw-button-primary text-xl md:text-2xl px-12 h-16"
      >
        DÉTERMINER MON STYLE
      </Link>
    </section>
  );
}
