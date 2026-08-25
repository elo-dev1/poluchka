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
  const { gameState, playerId, isTokenMoving } = useGame();

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
          <Badge variant="gold" className="text-sm font-black px-3 py-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            +{formatMoney(card.amount)}
          </Badge>
        );
      } else if (card.amount < 0) {
        return (
          <Badge variant="destructive" className="text-sm font-black px-3 py-1">
            -{formatMoney(Math.abs(card.amount))}
          </Badge>
        );
      }
    }

    if (card.type === 'get_out_of_jail_free') {
      return (
        <Badge variant="gold" className="text-xs font-bold px-3 py-1 flex items-center gap-1">
          <Key className="w-3.5 h-3.5" />
          Карта Свободы
        </Badge>
      );
    }

    if (card.type === 'go_to_jail') {
      return (
        <Badge variant="destructive" className="text-xs font-bold px-3 py-1 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Арест
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
          'max-w-sm text-center border-2 shadow-2xl p-5',
          isChance
            ? 'bg-gradient-to-b from-amber-950/90 via-card/95 to-card/95 border-amber-500/40 shadow-amber-500/10'
            : 'bg-gradient-to-b from-blue-950/90 via-card/95 to-card/95 border-blue-500/40 shadow-blue-500/10'
        )}
      >
        <DialogHeader className="flex flex-col items-center">
          {/* Deck Badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-2xl">{card.icon || (isChance ? '❓' : '🎁')}</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-black tracking-wider uppercase px-3 py-0.5',
                isChance
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              )}
            >
              {isChance ? 'Карта «Шанс»' : 'Карта «Казна»'}
            </Badge>
          </div>

          <DialogTitle className="text-lg font-black text-foreground justify-center">
            {card.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {isMe ? 'Ваша карта' : `Игрок: ${card.playerName}`}
          </DialogDescription>
        </DialogHeader>

        {/* Card Body */}
        <div className="flex flex-col items-center gap-3 py-3">
          {/* Text Container */}
          <div className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 shadow-inner min-h-[70px] flex items-center justify-center">
            <p className="text-sm font-semibold text-foreground leading-snug">
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
          <Button
            variant={isChance ? 'gold' : 'default'}
            size="lg"
            className="w-full font-black shadow-lg flex items-center justify-center gap-2 h-11"
            onClick={handleDismiss}
          >
            <Check className="w-4 h-4" />
            Понятно
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
