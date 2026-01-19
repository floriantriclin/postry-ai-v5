'use client';

import themes from '@/lib/data/themes.json';

interface ThemeSelectorProps {
  onSelect: (themeId: string) => void;
}

export function ThemeSelector({ onSelect }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
      <h1 className="text-4xl md:text-5xl font-black mb-8 text-center uppercase tracking-tighter">
        Choisissez votre <span className="text-signal-orange">Terrain</span>
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-4xl">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className="raw-card hover:bg-zinc-100 transition-colors flex flex-col items-center justify-center gap-4 aspect-square group"
            data-testid={`theme-${theme.id}`}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
              {theme.emoji}
            </span>
            <span className="font-bold text-center text-sm md:text-base leading-tight">
              {theme.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
