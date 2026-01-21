'use client';

import themes from '@/lib/data/themes.json';

interface ThemeSelectorProps {
  onSelect: (themeId: string) => void;
}

export function ThemeSelector({ onSelect }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
      <h1 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase tracking-tighter">
        Choisissez votre <span className="text-signal-orange">Terrain</span>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full max-w-5xl">
        {themes.map((theme, index) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className="relative aspect-[4/3] border-2 border-carbon p-4 flex flex-col items-start justify-between hover:bg-carbon hover:text-white transition-all group overflow-hidden bg-white"
            data-testid={`theme-${theme.id}`}
          >
            <span className="font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <span className="font-black text-sm sm:text-base leading-none text-left uppercase break-words">
              {theme.label}
            </span>
            <div className="absolute top-0 right-0 w-8 h-8 bg-signal-orange translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        ))}
      </div>
    </div>
  );
}
