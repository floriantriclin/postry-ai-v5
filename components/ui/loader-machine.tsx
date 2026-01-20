'use client';

import { useEffect, useState } from 'react';

interface LoaderMachineProps {
  message?: string; // Optional override
  className?: string;
}

const BOOT_SEQUENCE = [
  'BOOTING_ICE_PROTOCOL...',
  'CALIBRATING_VECTORS...',
  'ANALYZING_PATTERNS...',
  'SYNCING_NEURAL_NET...',
  'OPTIMIZING_FLUX...',
];

export function LoaderMachine({ message, className = '' }: LoaderMachineProps) {
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    // Only cycle if no specific message is provided, or we can just cycle anyway for visual effect if we want multiple lines.
    // But the requirement implies replacing static messages or cycling them.
    // If a message is provided, we might want to just show that.
    // Let's stick to the requirement: "affichant des séquences monospace clignotantes et messages système"
    
    if (message) return; // If a static message is provided, don't cycle (or maybe cycle dots?)

    const interval = setInterval(() => {
      setSequenceIndex((prev) => (prev + 1) % BOOT_SEQUENCE.length);
    }, 800);
    return () => clearInterval(interval);
  }, [message]);

  const displayText = message || BOOT_SEQUENCE[sequenceIndex];

  return (
    <div className={`flex flex-col items-center justify-center font-mono ${className}`} data-testid="loader-machine">
      {/* Glitching Bars */}
      <div className="flex space-x-1 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-12 bg-zinc-900 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      
      {/* Text Output */}
      <p className="text-sm md:text-base uppercase tracking-widest text-zinc-600 animate-pulse font-bold">
        {`[ ${displayText} ]`}
      </p>
    </div>
  );
}
