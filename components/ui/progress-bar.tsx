import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`w-full h-4 border-2 border-zinc-900 p-[2px] ${className}`} data-testid="progress-bar">
      <div 
        className="h-full bg-zinc-900 transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
