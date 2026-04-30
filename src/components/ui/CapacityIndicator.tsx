'use client';

import React from 'react';

interface CapacityIndicatorProps {
  label: string;
  used: number;
  limit: number | null;
  icon: string;
  variant?: 'compact' | 'full';
}

export default function CapacityIndicator({ 
  label, 
  used, 
  limit, 
  icon,
  variant = 'compact'
}: CapacityIndicatorProps) {
  const isUnlimited = limit === null || limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / (limit as number)) * 100, 100);
  const isFull = !isUnlimited && used >= (limit as number);

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-1.5 w-full group/cap">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2 text-gray-500 group-hover/cap:text-cyan-400 transition-colors">
            <span>{icon}</span>
            <span>{label}</span>
          </div>
          <span className={`${isFull ? 'text-red-400' : 'text-white'}`}>
            {used} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                isFull ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0d1524] border border-blue-500/10 p-5 rounded-2xl flex flex-col gap-3 group/full">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
          isFull ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
        }`}>
          {icon}
        </div>
        <div>
          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{label}</h4>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white">{used}</span>
            <span className="text-gray-600 font-bold text-xs">/ {isUnlimited ? 'Ilimitado' : limit}</span>
          </div>
        </div>
      </div>
      
      {!isUnlimited && (
        <div className="space-y-1">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                isFull ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : percentage > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-gray-600">
            <span>{percentage.toFixed(0)}% Utilizado</span>
            {isFull && <span className="text-red-500 animate-pulse">Límite alcanzado</span>}
          </div>
        </div>
      )}
    </div>
  );
}
