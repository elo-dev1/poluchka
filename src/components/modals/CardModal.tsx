import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, ArrowRight, DollarSign, Key, AlertTriangle, HelpCircle, Gift } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';
import { cn, formatMoney } from '@/lib/utils';

export const CardModal: React.FC = () => {
  const { gameState, playerId, isTokenMoving, theme } = useGame();

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';
  const isPanel = gameState?.boardTheme === 'panel' || gameState?.theme === 'panel' || theme === 'panel';
  const isOffice = gameState?.boardTheme === 'office' || gameState?.theme === 'office' || theme === 'office';
  const card = gameState?.lastDrawnCard;
  const [dismissedCardKey, setDismissedCardKey] = useState<string | null>(null);

  const cardKey = card ? `${card.id}_${card.drawnAt}` : null;
  const isDismissed = cardKey ? dismissedCardKey === cardKey : false;
  const isMe = card?.playerId ? card.playerId === playerId : (gameState?.currentPlayerId === playerId);
  const isOpen = Boolean(card) && isMe && !isTokenMoving && !isDismissed;

  useEffect(() => {
    if (card && cardKey && isMe && dismissedCardKey !== cardKey) {
      if (card.amount && card.amount > 0) {
        soundEngine.playSuccess();
      } else if (card.type === 'go_to_jail' || (card.amount && card.amount < 0)) {
        soundEngine.playWarning();
      } else {
        soundEngine.playCard();
      }
    }
  }, [cardKey, isMe]);

  if (!isOpen || !card) return null;

  const isChance = card.deckType === 'chance';

  const handleDismiss = () => {
    soundEngine.playClick();
    if (cardKey) {
      setDismissedCardKey(cardKey);
    }
  };

  const getCardBadge = () => {
    if (card.amount !== undefined) {
      if (card.amount > 0) {
        return (
          <Badge variant="gold" className="text-sm font-black px-3 py-1 bg-slate-500/20 text-slate-300 border-slate-500/40">
            +{isNoir ? `$${card.amount}` : isSoviet ? `${card.amount} кР` : `$${card.amount}`}
          </Badge>
        );
      } else if (card.amount < 0) {
        return (
          <Badge variant="destructive" className="text-sm font-black px-3 py-1">
            -{isNoir ? `$${Math.abs(card.amount)}` : isSoviet ? `${Math.abs(card.amount)} кР` : `$${Math.abs(card.amount)}`}
          </Badge>
        );
      }
    }

    if (card.type === 'get_out_of_jail_free') {
      return (
        <Badge variant="gold" className="text-xs font-bold px-3 py-1 flex items-center gap-1">
          <Key className="w-3.5 h-3.5" />
          {isNoir ? 'Связи в мэрии' : isSoviet ? 'Карта Свободы' : isPanel ? 'Записка от участкового' : isOffice ? 'Пропуск от HR' : 'Освобождение из тюрьмы'}
        </Badge>
      );
    }

    if (card.type === 'go_to_jail') {
      return (
        <Badge variant="destructive" className="text-xs font-bold px-3 py-1 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          {isNoir ? 'Облава' : isSoviet ? 'Карантин' : isPanel ? 'Наряд ППС' : isOffice ? 'Вызов на ковер' : 'Арест'}
        </Badge>
      );
    }

    if (card.type === 'move_to') {
      return (
        <Badge variant="secondary" className="text-xs font-bold px-3 py-1 flex items-center gap-1">
          <ArrowRight className="w-3.5 h-3.5" />
          Перемещение
        </Badge>
      );
    }

    return (
      <Badge variant="gold" className="text-xs font-bold px-3 py-1">
        Событие
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent
        className={cn(
          'max-w-sm text-center border shadow-2xl p-5 rounded-none',
          isNoir ? 'noir-panel text-[#f5e6c8] font-noir-body' : isSoviet ? 'soviet-steel-panel text-[#e2e8f0] font-soviet' : 'classic-panel text-white font-sans',
          isChance
            ? (isNoir ? 'border-[#d4a647]' : isSoviet ? 'border-[#38bdf8]' : 'border-cyan-500/50')
            : (isNoir ? 'border-[#b8a890]' : isSoviet ? 'border-[#dc2626]' : 'border-amber-500/50')
        )}
      >
        <DialogHeader className="flex flex-col items-center">
          {/* Deck Badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <img
              src={isChance 
                ? (isOffice ? '/assets/tiles/office/chance_offer.png' : isPanel ? '/assets/tiles/panel/chance_post.png' : '/assets/tiles/chance_64px.png') 
                : (isOffice ? '/assets/tiles/office/chest_bonus.png' : isPanel ? '/assets/tiles/panel/gosuslugi.png' : '/assets/tiles/chest_64px.png')}
              alt={isChance ? 'Шанс' : 'Казна'}
              className="w-7 h-7 object-contain filter contrast-125 brightness-95"
              style={{ imageRendering: 'pixelated' }}
            />
            <span
              className={cn(
                'text-xs tracking-wider uppercase px-3 py-0.5 rounded-none border font-bold',
                isChance
                  ? (isNoir ? 'bg-[#1a1410] text-[#d4a647] border-[#d4a647]/40 font-noir-title' : isSoviet ? 'bg-[#09111c] text-[#38bdf8] border-[#38bdf8]/40 font-soviet' : 'bg-[#020617] text-cyan-300 border-cyan-500/40 font-sans')
                  : (isNoir ? 'bg-[#1a1410] text-[#b8a890] border-[#b8a890]/40 font-noir-title' : isSoviet ? 'bg-[#09111c] text-[#fca5a5] border-[#dc2626]/40 font-soviet' : 'bg-[#020617] text-amber-300 border-amber-500/40 font-sans')
              )}
            >
              {isNoir
                ? (isChance ? 'АНОНИМКА' : 'ДЕЛО №...')
                : isSoviet
                ? (isChance ? 'РАДИОГРАММА «ШАНС»' : 'ПРИКАЗ ГОСКОМИССИИ ОКБ-1')
                : isPanel
                ? (isChance ? 'ОБЪЯВЛЕНИЕ НА СТОЛБЕ' : 'ГОСУСЛУГИ / КАЗНА')
                : isOffice
                ? (isChance ? 'СЛУЖЕБНЫЙ ШАНС' : 'КОРПОРАТИВНАЯ КАЗНА')
                : (isChance ? 'КАРТОЧКА «ШАНС»' : 'ОБЩЕСТВЕННАЯ КАЗНА')}
            </span>
          </div>

          <DialogTitle className={cn("text-lg font-bold justify-center", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white font-sans")}>
            {card.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-[#94a3b8] mt-0.5">
            {isNoir
              ? (isMe ? 'Ваша улика' : `Детектив: ${card.playerName}`)
              : isSoviet
              ? (isMe ? 'Ваша директива' : `Экипаж: ${card.playerName}`)
              : isPanel
              ? (isMe ? 'Ваше извещение' : `Жилец: ${card.playerName}`)
              : isOffice
              ? (isMe ? 'Ваше уведомление' : `Сотрудник: ${card.playerName}`)
              : (isMe ? 'Ваша карта' : `Игрок: ${card.playerName}`)}
          </DialogDescription>
        </DialogHeader>

        {/* Card Body */}
        <div className="flex flex-col items-center gap-3 py-3">
          {/* Text Container */}
          <div className={cn("w-full p-4 rounded-none shadow-inner min-h-[70px] flex items-center justify-center border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#020617] border-slate-500/30 font-sans")}>
            <p className={cn("text-sm font-bold leading-snug", isNoir ? "text-[#f5e6c8]" : "text-[#e2e8f0]")}>
              {card.text}
            </p>
          </div>

          {/* Value Badge */}
          <div className="flex items-center justify-center">
            {getCardBadge()}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-1">
          <button
            className={cn("w-full text-xs py-2.5 rounded-none flex items-center justify-center gap-2 font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
            onClick={handleDismiss}
          >
            <Check className="w-4 h-4 text-white" />
            <span>{isNoir ? "ПРИОБЩИТЬ К ДЕЛУ ✓" : isSoviet ? "ПРИНЯТЬ К ИСПОЛНЕНИЮ ★" : isPanel ? "ПРИНЯТЬ К СВЕДЕНИЮ ✓" : isOffice ? "ПРИНЯТО В РАБОТУ ✓" : "ПОНЯТНО ✓"}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
