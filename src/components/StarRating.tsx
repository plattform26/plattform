'use client';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showNumber?: boolean;
}

export default function StarRating({ 
  value, 
  onChange, 
  readonly = false, 
  size = 'md',
  showNumber = false 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const getStarColor = (index: number) => {
    const currentRating = hoverValue !== null ? hoverValue : value;
    if (index <= currentRating) return '#FFD700'; // Gold
    return '#374151'; // Gray-700
  };

  const renderStar = (index: number) => {
    // Cálculo de relleno para modo lectura (soporta fracciones)
    let fillPercentage = 0;
    if (index <= Math.floor(value)) {
      fillPercentage = 100;
    } else if (index === Math.ceil(value) && readonly) {
      fillPercentage = (value % 1) * 100;
    }

    // Modo interactivo (hover override)
    if (!readonly && hoverValue !== null) {
      fillPercentage = index <= hoverValue ? 100 : 0;
    }

    return (
      <div
        key={index}
        className={`${starClasses[size]} transition-all duration-150 relative flex items-center justify-center ${
          readonly ? 'cursor-default pointer-events-none' : 'hover:scale-110 active:scale-95 cursor-pointer'
        }`}
        onMouseEnter={() => !readonly && setHoverValue(index)}
        onMouseLeave={() => !readonly && setHoverValue(null)}
        onClick={() => !readonly && onChange && onChange(index)}
      >
        {/* Base Star (Empty) */}
        <span className="text-gray-700">★</span>
        
        {/* Full/Partial Star Overlay */}
        <span 
          className="absolute inset-x-0 top-0 overflow-hidden text-center select-none" 
          style={{ 
            color: '#FFD700',
            width: `${fillPercentage}%`
          }}
        >
          ★
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(index => renderStar(index))}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm font-bold text-slate-200">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
