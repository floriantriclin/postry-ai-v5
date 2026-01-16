export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="raw-card max-w-2xl w-full text-center space-y-8">
        <h1 className="text-6xl font-black uppercase tracking-tighter">
          Postry AI
        </h1>
        <p className="text-xl">
          Initialisation Socle Technique & Déploiement
        </p>
        <div className="flex justify-center gap-4">
          <button className="raw-button">
            Get Started
          </button>
          <button className="raw-button bg-black text-white">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
