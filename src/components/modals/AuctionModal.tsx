import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gavel, Plus, XCircle, UserCheck, ShoppingBag, Clock } from 'lucide-react';
import { formatMoney, cn } from '@/lib/utils';
import { TileIconImage } from '@/lib/pixelIcons';
import { soundEngine } from '@/lib/soundEngine';

export const AuctionModal: React.FC = () => {
  const { gameState, playerId, bidAuction, passAuction } = useGame();
  const auction = gameState?.activeAuction;
  const isOpen = Boolean(auction && gameState?.status === 'AUCTION');

  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    if (isOpen && auction) {
      soundEngine.playCard();
    }
  }, [auction?.startedAt]);

  useEffect(() => {
    if (!isOpen || !auction) return;
    if (auction.endsAt) {
      const update = () => {
        const diff = Math.max(0, Math.ceil((auction.endsAt! - Date.now()) / 1000));
        setCountdown(diff);
      };
      update();
      const interval = setInterval(update, 200);
      return () => clearInterval(interval);
    } else if (auction.remainingSeconds !== undefined) {
      setCountdown(auction.remainingSeconds);
    }
  }, [isOpen, auction?.endsAt, auction?.remainingSeconds, auction?.currentBid]);

  if (!isOpen || !auction || !gameState) return null;

  const tile = gameState.board[auction.tileId];
  if (!tile) return null;

  const highestBidder = auction.highestBidderId
    ? gameState.players.find((p) => p.id === auction.highestBidderId)
    : null;
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const isHighestBidder = auction.highestBidderId === playerId;
  const isInitiator = Boolean(auction.initiatorId && auction.initiatorId === playerId);
  const isTargetOfDirectOffer = Boolean(
    auction.isDirectOffer && (auction.targetPlayerId === playerId || auction.targetId === playerId)
  );
  const hasPassed = (auction.passedBidders || auction.passedPlayerIds || []).includes(playerId);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        overlayClassName="bg-black/20 backdrop-blur-none"
        className="max-w-sm sm:max-w-md text-center p-4 sm:p-5 bg-[#0c1022]/95 border border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-2xl"
      >
        <DialogHeader className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
            {auction.isDirectOffer ? (
              <Badge variant="gold" className="text-xs px-3 py-1 font-black flex items-center gap-1.5 animate-pulse bg-amber-500/20 text-amber-300 border-amber-500/40">
                <ShoppingBag className="w-3.5 h-3.5" />
                ПРЕДЛОЖЕНИЕ ВЫКУПА
              </Badge>
            ) : (
              <Badge variant="gold" className="text-xs px-3 py-1 font-black flex items-center gap-1.5 animate-pulse bg-amber-500/20 text-amber-300 border-amber-500/40">
                <Gavel className="w-3.5 h-3.5" />
                ИДЁТ АУКЦИОН!
              </Badge>
            )}

            {/* 10s Countdown Timer Badge */}
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border transition-all",
              countdown <= 3
                ? "bg-red-500/25 text-red-300 border-red-500/50 animate-pulse"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
            )}>
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{countdown}с</span>
            </div>
          </div>

          <DialogTitle className="text-lg sm:text-xl justify-center font-black text-white">{tile.name}</DialogTitle>
          <span className="text-xs text-muted-foreground">{tile.groupName || 'Недвижимость'}</span>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3.5 py-2">
          {/* Tile Preview */}
          <div className="w-14 h-14 p-2 rounded-2xl bg-black/40 border border-white/10 shadow-lg flex items-center justify-center">
            <TileIconImage tile={tile} />
          </div>

          {/* Price / Current Bid Display */}
          <div className="flex flex-col items-center p-3 w-full rounded-2xl bg-black/30 border border-white/5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {auction.isDirectOffer ? 'Стоимость недвижимости' : 'Текущая ставка'}
            </span>
            <span className="text-3xl font-black text-amber-400 my-0.5">
              {formatMoney(auction.currentBid)}
            </span>
            {!auction.isDirectOffer && (
              highestBidder ? (
                <span className="text-xs text-foreground font-bold flex items-center gap-1.5 mt-1">
                  Лидер: <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: highestBidder.color.hex }} />
                  {highestBidder.name} {isHighestBidder && '(Вы)'}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground mt-1">Ставок пока нет</span>
              )
            )}
            {!auction.isDirectOffer && (
              <span className="text-[10px] text-muted-foreground/80 mt-1">
                Если за 10с никто не поднимет ставку, объект достанется лидеру
              </span>
            )}
          </div>

          {/* Direct Offer Mode (1-on-1) */}
          {auction.isDirectOffer ? (
            isTargetOfDirectOffer && !myPlayer?.isBankrupt ? (
              <div className="flex flex-col gap-2.5 w-full">
                <p className="text-xs text-foreground font-medium bg-white/5 p-2.5 rounded-xl border border-white/10">
                  Соперник отказался от покупки. Желаете приобрести{' '}
                  <strong className="text-amber-300">"{tile.name}"</strong> за{' '}
                  <strong className="text-emerald-400">{formatMoney(auction.currentBid)}</strong>?
                </p>

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full font-black shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 h-11"
                  onClick={() => bidAuction(auction.currentBid)}
                  disabled={!myPlayer || myPlayer.money < auction.currentBid}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Купить за {formatMoney(auction.currentBid)} 🏢
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-bold flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground h-11"
                  onClick={passAuction}
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  Отказаться от выкупа
                </Button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-muted-foreground w-full flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isInitiator
                    ? `Вы отказались от покупки. Предложение направлено ${auction.targetPlayerName || 'сопернику'} (${formatMoney(auction.currentBid)})...`
                    : 'Ожидание решения игрока...'}
                </span>
              </div>
            )
          ) : (
            /* Multi-opponent Competitive Auction Mode (3+ players) */
            !hasPassed && !isInitiator && !myPlayer?.isBankrupt ? (
              <div className="flex flex-col gap-2 w-full">
                {auction.highestBidderId === null ? (
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full font-black text-sm h-11 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                    onClick={() => bidAuction(auction.currentBid)}
                    disabled={!myPlayer || myPlayer.money < auction.currentBid}
                  >
                    <Gavel className="w-4 h-4" />
                    Сделать стартовую ставку {formatMoney(auction.currentBid)}
                  </Button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="gold"
                      size="sm"
                      className="font-bold text-xs h-10"
                      onClick={() => bidAuction(auction.currentBid + 10)}
                      disabled={!myPlayer || myPlayer.money < auction.currentBid + 10}
                    >
                      <Plus className="w-3 h-3 mr-0.5" /> +$10
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      className="font-bold text-xs h-10"
                      onClick={() => bidAuction(auction.currentBid + 50)}
                      disabled={!myPlayer || myPlayer.money < auction.currentBid + 50}
                    >
                      <Plus className="w-3 h-3 mr-0.5" /> +$50
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      className="font-bold text-xs h-10"
                      onClick={() => bidAuction(auction.currentBid + 100)}
                      disabled={!myPlayer || myPlayer.money < auction.currentBid + 100}
                    >
                      <Plus className="w-3 h-3 mr-0.5" /> +$100
                    </Button>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full font-bold flex items-center justify-center gap-2 mt-1 h-11"
                  onClick={passAuction}
                >
                  <XCircle className="w-4 h-4" />
                  Пас (Выйти из аукциона)
                </Button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-muted-foreground w-full flex items-center justify-center gap-2">
                {isInitiator ? (
                  <>
                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Вы выставили недвижимость на аукцион. Торгуются соперники...</span>
                  </>
                ) : hasPassed ? (
                  <>
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Вы отказались от участия. Ожидание завершения...</span>
                  </>
                ) : (
                  <span>Вы банкрот</span>
                )}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
