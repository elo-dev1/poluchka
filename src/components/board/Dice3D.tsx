import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { DiceObject } from '@/types/game';

interface Dice3DProps {
  dice: DiceObject | [number, number] | null;
  isRolling?: boolean;
}

// Crisp, high-end die face with embossed pips
const DieFace: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
  const safeVal = Math.max(1, Math.min(6, Number(value) || 1));
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (isRolling) {
      setAnimClass('animate-spin');
    } else {
      setAnimClass('transition-transform duration-300 scale-100');
    }
  }, [isRolling, safeVal]);

  const renderPips = () => {
    switch (safeVal) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner self-start" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner self-start" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 gap-2 p-2 place-items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-2">
            <span className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-1.5 p-2 place-items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-inner" />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white via-zinc-100 to-zinc-300 border-2 border-zinc-400 shadow-md flex items-center justify-center relative select-none transform transition-transform',
        isRolling ? 'rotate-12 scale-105' : 'hover:scale-105',
        animClass
      )}
      style={{
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      {renderPips()}
    </div>
  );
};

export const Dice3D: React.FC<Dice3DProps> = ({ dice, isRolling = false }) => {
  let d1 = 1;
  let d2 = 1;
  let isDoubles = false;
  let sum = 2;
  const hasRolled = Boolean(dice !== null && dice !== undefined);

  if (dice) {
    if (Array.isArray(dice)) {
      d1 = Number(dice[0]) || 1;
      d2 = Number(dice[1]) || 1;
      isDoubles = Boolean(d1 > 0 && d2 > 0 && d1 === d2);
      sum = d1 + d2;
    } else if (typeof dice === 'object') {
      d1 = Number(dice.die1) || 1;
      d2 = Number(dice.die2) || 1;
      if (dice.isDouble !== undefined) {
        isDoubles = Boolean(dice.isDouble);
      } else {
        isDoubles = Boolean(d1 > 0 && d2 > 0 && d1 === d2);
      }
      sum = dice.sum !== undefined ? Number(dice.sum) : d1 + d2;
    }
  }

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl transition-all">
      <DieFace value={d1} isRolling={isRolling} />
      <DieFace value={d2} isRolling={isRolling} />
      {hasRolled && (
        <div className="flex flex-col items-center justify-center pl-1 pr-1.5 min-w-[48px]">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
            Сумма
          </span>
          <span className="text-base sm:text-lg font-black text-amber-400 leading-tight">
            {sum}
          </span>
          {isDoubles && (
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tight animate-bounce leading-none">
              Дубль! ⚡
            </span>
          )}
        </div>
      )}
    </div>
  );
};
