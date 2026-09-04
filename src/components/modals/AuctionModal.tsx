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
  const { gameState, playerId, bidAuction, passAuction, theme } = useGame();
  const auction = gameState?.activeAuction;
  const isOpen = Boolean(auction && gameState?.status === 'AUCTION');

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';
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
        overlayClassName="bg-black/80 backdrop-blur-none"
        className={cn(
          "max-w-sm sm:max-w-md text-center p-4 sm:p-5 shadow-2xl rounded-none border",
          isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-slate-500/50 font-sans"
        )}
      >
        <DialogHeader className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
            {auction.isDirectOffer ? (
              <span className={cn("text-xs px-3 py-0.5 flex items-center gap-1.5 rounded-none border font-bold", isNoir ? "font-noir-title bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "font-soviet bg-[#09111c] border-[#38bdf8] text-[#38bdf8]" : "bg-[#020617] border-slate-500/50 text-slate-300 font-sans")}>
                <ShoppingBag className="w-3.5 h-3.5" />
                {isNoir ? "ПРЕДЛОЖЕНИЕ ОТ СИНДИКАТА" : isSoviet ? "ПРЕДЛОЖЕНИЕ ЦУП" : "ПРЯМАЯ ПРОДАЖА"}
              </span>
            ) : (
              <span className={cn("text-xs px-3 py-0.5 flex items-center gap-1.5 rounded-none border font-bold", isNoir ? "font-noir-title bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "font-soviet bg-[#09111c] border-[#38bdf8] text-[#38bdf8]" : "bg-[#020617] border-slate-500/50 text-slate-300 font-sans")}>
                <Gavel className={cn("w-3.5 h-3.5", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
                {isNoir ? "ТОРГИ НА ЧЁРНОМ РЫНКЕ" : isSoviet ? "ТОРГИ ГОСКОМИССИИ ОКБ-1" : "АУКЦИОН"}
              </span>
            )}

            {/* Countdown Timer Badge */}
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-0.5 rounded-none text-xs font-bold border transition-all",
              countdown <= 3
                ? (isNoir ? "bg-[#2a0800] text-[#ff4444] border-[#8b0000] animate-pulse" : "bg-[#450a0a] text-[#fca5a5] border-[#dc2626] animate-pulse")
                : (isNoir ? "bg-[#1a1410] text-[#d4a647] border-[#d4a647]/40 font-noir-body" : isSoviet ? "bg-[#09111c] text-[#38bdf8] border-[#38bdf8]/40 font-space" : "bg-[#020617] text-slate-300 border-slate-500/40 font-sans")
            )}>
              <Clock className="w-3 h-3" />
              <span>{countdown}с</span>
            </div>
          </div>

          <DialogTitle className={cn("text-lg sm:text-xl justify-center font-bold", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white font-sans")}>{tile.name}</DialogTitle>
          <span className={cn("text-xs", isNoir ? "font-noir-body text-[#b8a890]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-medium")}>
            {tile.groupName || (isNoir ? 'ДОСЬЕ НА ТЕРРИТОРИЮ' : isSoviet ? 'ТЕХНИЧЕСКИЙ ПАСПОРТ ОКБ-1' : 'ДОКУМЕНТ НА СОБСТВЕННОСТЬ')}
          </span>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          {/* Tile Preview */}
          <div className={cn("w-12 h-12 p-1.5 rounded-none shadow-inner flex items-center justify-center border", isNoir ? "bg-[#1a1410] border-[#d4a647]/40" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/40" : "bg-[#020617] border-slate-500/40")}>
            <TileIconImage tile={tile} className="w-full h-full object-contain filter contrast-125 brightness-95" />
          </div>

          {/* Price / Current Bid Display */}
          <div className={cn("flex flex-col items-center p-3 w-full rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c]/80 border-[#38bdf8]/30 font-space" : "bg-[#020617]/90 border-slate-500/30 font-sans")}>
            <span className={cn("text-[10px] uppercase tracking-wider font-bold", isNoir ? "text-[#b8a890] font-noir-title" : isSoviet ? "text-[#94a3b8] font-soviet" : "text-slate-300")}>
              {auction.isDirectOffer ? (isNoir ? 'Стоимость территории' : isSoviet ? 'Стоимость объекта' : 'Цена покупки') : (isNoir ? 'Текущая ставка' : isSoviet ? 'Текущая ставка' : 'Текущая ставка')}
            </span>
            <span className={cn("text-3xl font-bold my-0.5", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-space text-[#00e676]" : "text-slate-400")}>
              {isNoir ? `$${auction.currentBid}` : isSoviet ? `${auction.currentBid} кР` : `$${auction.currentBid}`}
            </span>
            {!auction.isDirectOffer && (
              highestBidder ? (
                <span className="text-xs text-[#e2e8f0] font-bold flex items-center gap-1.5 mt-1">
                  Лидер торгов: <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: highestBidder.color.hex }} />
                  {highestBidder.name} {isHighestBidder && '(Вы)'}
                </span>
              ) : (
                <span className="text-xs text-[#94a3b8] mt-1">Ставок пока не поступило</span>
              )
            )}
            {!auction.isDirectOffer && (
              <span className="text-[10px] text-[#94a3b8] mt-1">
                При отсутствии встречных ставок объект передается лидеру
              </span>
            )}
          </div>

          {/* Direct Offer Mode */}
          {auction.isDirectOffer ? (
            isTargetOfDirectOffer && !myPlayer?.isBankrupt ? (
              <div className="flex flex-col gap-2 w-full">
                <p className={cn("text-xs p-2.5 rounded-none border", isNoir ? "text-[#f5e6c8] bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "text-[#cbd5e1] bg-[#09111c] border-[#38bdf8]/30 font-space" : "text-slate-200 bg-[#020617] border-slate-500/30 font-sans")}>
                  {isNoir ? (
                    <>
                      Детектив отказался от объекта. Желаете присвоить{' '}
                      <strong className="font-noir-title text-[#d4a647]">«{tile.name}»</strong> за{' '}
                      <strong className="font-bold text-sm text-[#d4a647]">${auction.currentBid}</strong>?
                    </>
                  ) : isSoviet ? (
                    <>
                      Экипаж отказался от объекта. Желаете закрепить{' '}
                      <strong className="font-soviet text-[#e2e8f0]">«{tile.name}»</strong> за{' '}
                      <strong className="font-space font-bold text-sm text-[#00e676]">{auction.currentBid} кР</strong>?
                    </>
                  ) : (
                    <>
                      Игрок отказался от покупки. Желаете приобрести{' '}
                      <strong className="text-white">«{tile.name}»</strong> за{' '}
                      <strong className="font-bold text-sm text-slate-300">${auction.currentBid}</strong>?
                    </>
                  )}
                </p>

                <button
                  className={cn("w-full text-xs py-2.5 rounded-none flex items-center justify-center gap-2 font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                  onClick={() => bidAuction(auction.currentBid)}
                  disabled={!myPlayer || myPlayer.money < auction.currentBid}
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>{isNoir ? `ПРИСВОИТЬ ЗА $${auction.currentBid}` : isSoviet ? `ВЗЯТЬ НА БАЛАНС ЗА ${auction.currentBid} кР` : `КУПИТЬ ЗА $${auction.currentBid}`}</span>
                </button>

                <button
                  className={cn("w-full text-xs py-2 rounded-none flex items-center justify-center gap-1 font-bold", isNoir ? "noir-btn-blood font-noir-title" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626] font-soviet" : "classic-btn-danger font-sans")}
                  onClick={passAuction}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ОТКАЗАТЬСЯ</span>
                </button>
              </div>
            ) : (
              <div className={cn("p-3 rounded-none border text-xs text-[#94a3b8] w-full flex items-center justify-center gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#020617] border-slate-500/30 font-sans")}>
                <UserCheck className={cn("w-4 h-4 shrink-0", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
                <span>
                  {isInitiator
                    ? `Лот предложен игроку ${auction.targetPlayerName || ''} (${isNoir ? `$${auction.currentBid}` : isSoviet ? `${auction.currentBid} кР` : `$${auction.currentBid}`})...`
                    : 'Ожидание решения участника...'}
                </span>
              </div>
            )
          ) : (
            /* Multi-opponent Competitive Auction Mode */
            !hasPassed && !isInitiator && !myPlayer?.isBankrupt ? (
              <div className="flex flex-col gap-2 w-full">
                {auction.highestBidderId === null ? (
                  <button
                    className={cn("w-full text-xs py-2.5 rounded-none flex items-center justify-center gap-2 font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                    onClick={() => bidAuction(auction.currentBid)}
                    disabled={!myPlayer || myPlayer.money < auction.currentBid}
                  >
                    <Gavel className="w-4 h-4 text-white" />
                    <span>{isNoir ? `СТАРТОВАЯ СТАВКА $${auction.currentBid}` : isSoviet ? `СТАРТОВАЯ СТАВКА ${auction.currentBid} кР` : `СТАРТОВАЯ СТАВКА $${auction.currentBid}`}</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={cn("text-xs py-2 rounded-none font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                      onClick={() => bidAuction(auction.currentBid + 10)}
                      disabled={!myPlayer || myPlayer.money < auction.currentBid + 10}
                    >
                      {isNoir ? "+$10" : isSoviet ? "+10 кР" : "+$10"}
                    </button>
                    <button
                      className={cn("text-xs py-2 rounded-none font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                      onClick={() => bidAuction(auction.currentBid + 50)}
                      disabled={!myPlayer || myPlayer.money < auction.currentBid + 50}
                    >
                      {isNoir ? "+$50" : isSoviet ? "+50 кР" : "+$50"}
                    </button>
                    <button
                      className={cn("text-xs py-2 rounded-none font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                      onClick={() => bidAuction(auction.currentBid + 100)}
                      disabled={!myPlayer || myPlayer.money < auction.currentBid + 100}
                    >
                      {isNoir ? "+$100" : isSoviet ? "+100 кР" : "+$100"}
                    </button>
                  </div>
                )}

                <button
                  className={cn("w-full text-xs py-2 rounded-none flex items-center justify-center gap-1 font-bold mt-1", isNoir ? "noir-btn-blood font-noir-title" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626] font-soviet" : "classic-btn-danger font-sans")}
                  onClick={passAuction}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ПАС (ВЫЙТИ ИЗ ТОРГОВ)</span>
                </button>
              </div>
            ) : (
              <div className={cn("p-3 rounded-none border text-xs text-[#94a3b8] w-full flex items-center justify-center gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#020617] border-slate-500/30 font-sans")}>
                {isInitiator ? (
                  <>
                    <UserCheck className={cn("w-4 h-4 shrink-0", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
                    <span>Объект выставлен на торги. Ожидание завершения...</span>
                  </>
                ) : hasPassed ? (
                  <>
                    <XCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                    <span>Вы вышли из торгов. Ожидание завершения...</span>
                  </>
                ) : (
                  <span>Выбыли из игры</span>
                )}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
