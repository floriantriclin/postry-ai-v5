'use client';

import { useEffect, useState } from 'react';

interface LoaderMachineProps {
  message?: string; // Optional override
  className?: string;
}

const BOOT_SEQUENCE = [
  'BOOTING_ICE_PROTOCOL...',
  'CALIBRATING_SENSORS...',
  'ANALYZING_PATTERNS...',
  'SYNCING_NEURAL_NET...',
  'LOADING_ARCHETYPE_DATABASE...',
  'OPTIMIZING_FLUX...',
  'INITIALIZING_NEURAL_LINK...',
  'COMPUTING_VECTORS...',
];

export function LoaderMachine({ message, className = '' }: LoaderMachineProps) {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // If a specific message is provided, we use it as the "main" status, but we still run background logs
    // Or we just ignore background logs if message is meant to be the only thing.
    // Requirement: "Le composant doit faire défiler plusieurs messages de logs système"
    
    // Initial logs
    setLogs([BOOT_SEQUENCE[0], BOOT_SEQUENCE[1]]);

    const interval = setInterval(() => {
      setLogs(prev => {
        const nextIndex = (BOOT_SEQUENCE.indexOf(prev[prev.length - 1]) + 1) % BOOT_SEQUENCE.length;
        const newLogs = [...prev, BOOT_SEQUENCE[nextIndex]];
        if (newLogs.length > 3) newLogs.shift(); // Keep last 3 lines
        return newLogs;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center font-mono ${className}`} data-testid="loader-machine">
      {/* Glitching Bars */}
      <div className="flex space-x-1 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-12 bg-zinc-900 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      
      {/* Text Output */}
      <div className="flex flex-col items-center space-y-2 h-24 justify-end overflow-hidden">
         {logs.map((log, i) => (
           <p key={i} className={`text-xs md:text-sm uppercase tracking-widest font-bold ${i === logs.length - 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>
             {`> ${log}`}
           </p>
         ))}
         {message && (
            <p className="text-sm md:text-base uppercase tracking-widest text-signal-orange animate-pulse font-black mt-2">
              {`[ ${message} ]`}
            </p>
         )}
      </div>
    </div>
  );
}
