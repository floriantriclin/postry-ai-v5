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
    <div className={`flex flex-col items-center justify-center font-mono w-full max-w-lg mx-auto ${className}`} data-testid="loader-machine">
      {/* Terminal Window */}
      <div className="w-full bg-zinc-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-zinc-100 pb-2">
           <div className="flex gap-2">
              <div className="w-2 h-2 bg-black"></div>
              <div className="w-2 h-2 border border-black"></div>
           </div>
           <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">System.log</span>
        </div>

        {/* Text Output */}
        <div className="flex flex-col items-start space-y-1 h-32 justify-end overflow-hidden">
           {logs.map((log, i) => (
             <p key={i} className={`text-xs uppercase tracking-wider font-bold w-full text-left ${i === logs.length - 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>
               <span className="mr-3 text-zinc-300 select-none">|</span>
               {`> ${log}`}
             </p>
           ))}
           <div className="flex items-center gap-2 mt-2 w-full pl-0">
              <span className="text-signal-orange animate-pulse font-black text-sm">_</span>
              {message && (
                 <p className="text-xs uppercase tracking-wider text-signal-orange font-bold">
                   {message}
                 </p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
