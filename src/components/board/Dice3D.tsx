import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { DiceObject } from '@/types/game';
import { useGame } from '@/context/GameContext';

interface Dice3DProps {
  dice: DiceObject | [number, number] | null;
  isRolling?: boolean;
}

const DieFace: React.FC<{ value: number; isRolling: boolean; isSoviet: boolean; isNoir: boolean }> = ({ value, isRolling, isSoviet, isNoir }) => {
  const safeVal = Math.max(1, Math.min(6, Number(value) || 1));
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (isRolling) {
      setAnimClass('animate-spin');
    } else {
      setAnimClass('transition-transform duration-300 scale-100');
    }
  }, [isRolling, safeVal]);

  const dotClass = isNoir
    ? 'bg-[#1a1410] shadow-xs'
    : isSoviet
    ? 'bg-[#00e676] shadow-[0_0_6px_#00e676]'
    : 'bg-[#1e293b] shadow-xs';

  const renderPips = () => {
    switch (safeVal) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            {isNoir ? (
              <span className="w-3.5 h-3.5 rounded-full bg-[#8b0000] shadow-sm" />
            ) : isSoviet ? (
              <span className="text-base text-[#dc2626] font-bold drop-shadow-[0_0_6px_rgba(220,38,38,0.9)]">★</span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm" />
            )}
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1.5 sm:p-2">
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-start", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-end", dotClass)} />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5 sm:p-2">
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-start", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-center", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full self-end", dotClass)} />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 gap-1.5 sm:gap-2 p-1.5 sm:p-2 place-items-center">
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5 sm:p-2">
            <span className={cn("absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", isNoir ? dotClass : isSoviet ? "bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" : dotClass)} />
            <span className={cn("absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-1 sm:gap-1.5 p-1.5 sm:p-2 place-items-center">
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
            <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", dotClass)} />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center relative select-none transform transition-transform',
        isNoir
          ? 'rounded-lg bg-[#f5e6c8] border-2 border-[#1a1410] shadow-md'
          : isSoviet
          ? 'rounded-none bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] border border-[#38bdf8] shadow-md'
          : 'rounded-lg bg-gradient-to-b from-[#ffffff] to-[#f1f5f9] border-2 border-slate-300 shadow-md',
        isRolling ? 'rotate-12 scale-105' : 'hover:scale-105',
        animClass
      )}
      style={{
        boxShadow: isNoir
          ? '0 3px 8px rgba(0, 0, 0, 0.6), inset 0 1px 1px #ffffff'
          : isSoviet
          ? '0 3px 10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(56, 189, 248, 0.4)'
          : '0 3px 8px rgba(0, 0, 0, 0.4), inset 0 1px 1px #ffffff',
      }}
    >
      {renderPips()}
    </div>
  );
};

export const Dice3D: React.FC<Dice3DProps> = ({ dice, isRolling = false }) => {
  const { theme } = useGame();
  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

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
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1.5 shadow-xl transition-all",
      isNoir ? "rounded-none bg-[#1a1410] border border-[#d4a647] font-noir-body" : isSoviet ? "rounded-none bg-[#09111c] border border-[#38bdf8] font-space" : "rounded-lg bg-slate-900/90 border border-slate-500/50 font-sans"
    )}>
      <DieFace value={d1} isRolling={isRolling} isSoviet={isSoviet} isNoir={isNoir} />
      <DieFace value={d2} isRolling={isRolling} isSoviet={isSoviet} isNoir={isNoir} />
      {hasRolled && (
        <div className="flex flex-col items-center justify-center pl-1 pr-1 min-w-[48px]">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wider leading-none",
            isNoir ? "text-[#d4a647] font-noir-body" : isSoviet ? "text-[#38bdf8] font-space" : "text-slate-400 font-sans"
          )}>
            {isNoir ? 'ЖРЕБИЙ' : isSoviet ? 'ИМПУЛЬС' : 'СУММА'}
          </span>
          <span className={cn(
            "text-base sm:text-lg font-bold leading-tight",
            isNoir ? "text-[#f5e6c8] font-noir-body" : isSoviet ? "text-[#00e676] font-space" : "text-slate-300 font-sans"
          )}>
            {sum}
          </span>
          {isDoubles && (
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-tight leading-none px-1 py-0.5 rounded-none",
              isNoir ? "text-[#1a1410] bg-[#d4a647] border border-[#1a1410] font-noir-body" : isSoviet ? "font-soviet text-[#ffffff] bg-[#dc2626] border border-[#f59e0b]" : "text-white bg-amber-600 border border-amber-400 font-sans rounded"
            )}>
              {isNoir ? '🎲 ФАРТ!' : isSoviet ? '★ ДУБЛЬ! ★' : 'ДУБЛЬ! 🎲'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

