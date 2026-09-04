import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Check, X, Building2, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { formatMoney, cn } from '@/lib/utils';
import { TileIconImage } from '@/lib/pixelIcons';

export const TradeModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    gameState,
    playerId,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    showToast,
    theme,
  } = useGame();

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    modalData?.targetPlayerId || ''
  );
  const [offerProperties, setOfferProperties] = useState<number[]>([]);
  const [offerCash, setOfferCash] = useState<number>(0);
  const [requestProperties, setRequestProperties] = useState<number[]>([]);
  const [requestCash, setRequestCash] = useState<number>(0);

  const activeTrade = gameState?.activeTrade;
  const isIncomingTrade = Boolean(
    activeTrade &&
    (activeTrade.targetId === playerId || activeTrade.toPlayerId === playerId) &&
    activeTrade.status === 'PENDING'
  );
  const isOutgoingTrade = Boolean(
    activeTrade &&
    (activeTrade.initiatorId === playerId || activeTrade.fromPlayerId === playerId) &&
    activeTrade.status === 'PENDING'
  );

  const isOpen = Boolean(
    gameState &&
    ((activeModal === 'trade' && (!activeTrade || activeTrade.status !== 'PENDING' || isIncomingTrade || isOutgoingTrade)) || isIncomingTrade)
  );

  const players = gameState?.players || [];
  const otherPlayers = players.filter((p) => !p.isBankrupt && p.id !== playerId);
  const myPlayer = players.find((p) => p.id === playerId);

  const myOffersCount = (gameState?.tradeOffersThisRound || {})[playerId] || 0;
  const remainingTrades = myPlayer?.tradeOffersRemaining !== undefined
    ? myPlayer.tradeOffersRemaining
    : Math.max(0, 2 - myOffersCount);
  const isTradeLimitReached = remainingTrades <= 0;

  useEffect(() => {
    if (activeModal === 'trade' && gameState) {
      if (modalData?.targetPlayerId && otherPlayers.some((p) => p.id === modalData.targetPlayerId)) {
        setSelectedPartnerId(modalData.targetPlayerId);
      } else if (!selectedPartnerId || !otherPlayers.some((p) => p.id === selectedPartnerId)) {
        setSelectedPartnerId(otherPlayers[0]?.id || '');
      }
      setOfferProperties([]);
      setOfferCash(0);
      setRequestProperties([]);
      setRequestCash(0);
    }
  }, [activeModal, modalData?.targetPlayerId, gameState?.roomId]);

  if (!gameState || !isOpen) return null;

  const partnerPlayer = gameState.players.find((p) => p.id === selectedPartnerId);

  const myTiles = gameState.board.filter((t) => t.ownerId === playerId && (t.houses || 0) === 0);
  const partnerTiles = partnerPlayer
    ? gameState.board.filter((t) => t.ownerId === partnerPlayer.id && (t.houses || 0) === 0)
    : [];

  const handleToggleOfferTile = (id: number) => {
    setOfferProperties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleRequestTile = (id: number) => {
    setRequestProperties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSendTrade = () => {
    if (isTradeLimitReached) {
      showToast('Лимит предложений обмена на этот круг исчерпан (макс 2)', 'error');
      return;
    }
    if (!selectedPartnerId) {
      showToast('Выберите игрока для сделки', 'error');
      return;
    }
    if (offerProperties.length === 0 && offerCash <= 0 && requestProperties.length === 0 && requestCash <= 0) {
      showToast('Сделка не может быть пустой', 'error');
      return;
    }

    proposeTrade(selectedPartnerId, offerProperties, offerCash, requestProperties, requestCash);
    closeModal();
  };

  const tradeId = activeTrade?.id || '';
  const tradeOfferMoney = activeTrade?.offer?.money ?? activeTrade?.offerCash ?? 0;
  const tradeOfferProps: number[] = activeTrade?.offer?.properties ?? activeTrade?.offerProperties ?? [];
  const tradeRequestMoney = activeTrade?.request?.money ?? activeTrade?.requestCash ?? 0;
  const tradeRequestProps: number[] = activeTrade?.request?.properties ?? activeTrade?.requestProperties ?? [];

  const initiatorName =
    activeTrade?.fromPlayerName ||
    gameState.players.find((p) => p.id === (activeTrade?.initiatorId || activeTrade?.fromPlayerId))?.name ||
    'Соперник';

  const targetName =
    activeTrade?.toPlayerName ||
    gameState.players.find((p) => p.id === (activeTrade?.targetId || activeTrade?.toPlayerId))?.name ||
    'Соперник';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[85vh] flex flex-col p-4 sm:p-5 shadow-2xl select-none rounded-none border",
        isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-slate-500/50 font-sans"
      )}>
        <DialogHeader className={cn("border-b pb-2", isNoir ? "border-[#d4a647]/40" : isSoviet ? "border-[#38bdf8]/40" : "border-slate-500/30")}>
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-none flex items-center justify-center border", isNoir ? "bg-[#1a1410] border-[#d4a647]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]" : "bg-[#020617] border-slate-500/50")}>
              <ArrowRightLeft className={cn("w-4 h-4", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
            </div>
            <div>
              <DialogTitle className={cn("text-base sm:text-lg font-bold tracking-wide flex items-center gap-2", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white")}>
                {isNoir ? "СДЕЛКА В ТЕНИ" : isSoviet ? "СЕАНС ОБМЕНА ТЕЛЕМЕТРИЕЙ (ЦУП • ОКБ-1)" : "ОБМЕН ИМУЩЕСТВОМ (СДЕЛКА)"}
              </DialogTitle>
              <p className={cn("text-xs", isNoir ? "font-noir-body text-[#b8a890]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-medium")}>
                {isNoir ? "Взаимная купля-продажа и обмен территориями" : isSoviet ? "Взаимный обмен орбитальными объектами и энергоресурсами кР" : "Взаимная купля-продажа и обмен собственностью"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* 1. Incoming Trade Offer Screen */}
        {isIncomingTrade && activeTrade ? (
          <div className="flex flex-col gap-3 my-2 text-xs">
            <div className={cn("flex items-center justify-between p-2 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/40" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/40" : "bg-[#020617] border-slate-500/40")}>
              <span className={cn("text-xs font-bold", isNoir ? "font-noir-title text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white")}>
                {isNoir ? "СВЯЗНОЙ ОТ: " : isSoviet ? "РАДИОГРАММА ОТ ЭКИПАЖА: " : "ПРЕДЛОЖЕНИЕ ОТ ИГРОКА: "}
                <strong className={isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400"}>{initiatorName}</strong>
              </span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-none border font-bold", isNoir ? "font-noir-body bg-[#1a1410] text-[#d4a647] border-[#d4a647]" : isSoviet ? "font-space bg-[#0f172a] text-[#38bdf8] border-[#38bdf8]" : "bg-[#020617] text-slate-300 border-slate-500/50")}>
                {isNoir ? `ГЛАВА #${gameState.roundNumber || 1}` : isSoviet ? `ВИТОК #${gameState.roundNumber || 1}` : `РАУНД #${gameState.roundNumber || 1}`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* You Get */}
              <div className={cn("p-3.5 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#00e676]/40" : isSoviet ? "bg-[#09111c]/80 border-[#00e676]/40" : "bg-[#020617]/90 border-slate-500/50")}>
                <span className="font-bold text-[#00e676] flex items-center gap-1">
                  📥 Вы получаете:
                </span>
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {tradeOfferMoney > 0 && (
                    <span className="font-bold text-[#00e676] text-base">
                      {isNoir ? `$${tradeOfferMoney}` : isSoviet ? `${tradeOfferMoney} кР` : `$${tradeOfferMoney}`}
                    </span>
                  )}
                  {tradeOfferProps.map((id) => {
                    const tile = gameState.board[id];
                    if (!tile) return null;
                    return (
                      <div key={id} className={cn("flex items-center gap-1.5 p-1 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          <TileIconImage tile={tile} className="w-full h-full object-contain filter contrast-125 brightness-95" />
                        </div>
                        <span className="text-[11px] font-bold text-white truncate">{tile.name}</span>
                      </div>
                    );
                  })}
                  {tradeOfferMoney <= 0 && tradeOfferProps.length === 0 && (
                    <span className="text-slate-400 italic my-auto text-center">— Пусто —</span>
                  )}
                </div>
              </div>

              {/* You Give */}
              <div className={cn("p-3.5 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#ff4444]/40" : isSoviet ? "bg-[#09111c]/80 border-[#dc2626]/40" : "bg-[#260a0e]/80 border-red-500/40")}>
                <span className="font-bold text-[#fca5a5] flex items-center gap-1">
                  📤 Вы передаете:
                </span>
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {tradeRequestMoney > 0 && (
                    <span className="font-bold text-[#ef4444] text-base">
                      {isNoir ? `$${tradeRequestMoney}` : isSoviet ? `${tradeRequestMoney} кР` : `$${tradeRequestMoney}`}
                    </span>
                  )}
                  {tradeRequestProps.map((id) => {
                    const tile = gameState.board[id];
                    if (!tile) return null;
                    return (
                      <div key={id} className={cn("flex items-center gap-1.5 p-1 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          <TileIconImage tile={tile} className="w-full h-full object-contain filter contrast-125 brightness-95" />
                        </div>
                        <span className="text-[11px] font-bold text-white truncate">{tile.name}</span>
                      </div>
                    );
                  })}
                  {tradeRequestMoney <= 0 && tradeRequestProps.length === 0 && (
                    <span className="text-slate-400 italic my-auto text-center">— Пусто —</span>
                  )}
                </div>
              </div>
            </div>

            {/* Accept / Decline Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                className={cn("flex-1 font-bold text-xs py-2.5 rounded-none flex items-center justify-center gap-1.5", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                onClick={() => {
                  acceptTrade(tradeId);
                  closeModal();
                }}
              >
                <Check className="w-4 h-4 text-white" /> <span>{isNoir ? "УДАРИТЬ ПО РУКАМ ✓" : isSoviet ? "УТВЕРДИТЬ ГОСКОМИССИЕЙ ★" : "ПРИНЯТЬ СДЕЛКУ ✓"}</span>
              </button>
              <button
                className={cn("flex-1 font-bold text-xs py-2.5 rounded-none flex items-center justify-center gap-1.5", isNoir ? "noir-btn-blood font-noir-title" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626] font-soviet" : "classic-btn-danger font-sans")}
                onClick={() => {
                  rejectTrade(tradeId);
                  closeModal();
                }}
              >
                <X className="w-4 h-4" /> <span>ОТКЛОНИТЬ</span>
              </button>
            </div>
          </div>
        ) : isOutgoingTrade && activeTrade ? (
          /* 2. Outgoing waiting screen */
          <div className="flex flex-col items-center gap-4 py-6 text-center text-xs">
            <div className={cn("w-12 h-12 rounded-none flex items-center justify-center animate-pulse border", isNoir ? "bg-[#1a1410] border-[#d4a647]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]" : "bg-[#020617] border-slate-500/50")}>
              <Clock className={cn("w-6 h-6", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-white">
                {isNoir ? "Связной отправлен к детективу " : isSoviet ? "Радиограмма направлена экипажу " : "Предложение отправлено игроку "}
                <strong className={isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400"}>{targetName}</strong>
              </span>
              <span className="text-[#94a3b8]">
                {isNoir ? "Ожидание ответа от синдиката..." : isSoviet ? "Ожидание подтверждения позывного..." : "Ожидание ответа..."}
              </span>
            </div>
            <button
              className={cn("mt-2 text-xs px-3 py-1.5 rounded-none flex items-center gap-1 font-bold", isNoir ? "noir-btn-blood font-noir-title" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626] font-soviet" : "classic-btn-danger font-sans")}
              onClick={() => {
                rejectTrade(tradeId);
                closeModal();
              }}
            >
              <X className="w-3.5 h-3.5" /> <span>{isNoir ? "Отозвать связного" : isSoviet ? "Отозвать радиограмму" : "Отменить предложение"}</span>
            </button>
          </div>
        ) : (
          /* 3. Create Trade Interface */
          <div className="flex flex-col gap-3 my-2 text-xs overflow-y-auto pr-1">
            {/* Select Partner */}
            {!modalData?.targetPlayerId && otherPlayers.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#94a3b8]">
                  {isNoir ? "ВЫБЕРИТЕ ДЕТЕКТИВА ДЛЯ СДЕЛКИ:" : isSoviet ? "ВЫБЕРИТЕ ЭКИПАЖ ДЛЯ СВЯЗИ:" : "ВЫБЕРИТЕ ИГРОКА ДЛЯ СДЕЛКИ:"}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {otherPlayers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPartnerId(p.id);
                        setRequestProperties([]);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-none border transition-all",
                        selectedPartnerId === p.id
                          ? (isNoir ? 'bg-[#d4a647] text-[#1a1410] font-bold shadow-sm border-[#d4a647]' : isSoviet ? 'bg-[#0369a1] text-white font-bold shadow-sm border-[#38bdf8]' : 'bg-slate-800 text-white font-bold shadow-sm border-slate-400')
                          : (isNoir ? 'bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8] hover:border-[#d4a647]' : isSoviet ? 'bg-[#09111c] border-[#38bdf8]/30 text-[#e2e8f0] hover:border-[#38bdf8]' : 'bg-[#020617] border-slate-500/30 text-white hover:border-slate-400')
                      )}
                    >
                      <span className="w-2 h-2 rounded-none" style={{ backgroundColor: p.color.hex }} />
                      <span>{p.name}</span>
                      <span className="text-[10px] font-bold">({isNoir ? `$${p.money}` : isSoviet ? `${p.money} кР` : `$${p.money}`})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Split Offer & Request Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left Column: My Offer */}
              <div className={cn("flex flex-col gap-2 p-3 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c]/80 border-[#38bdf8]/30" : "bg-[#020617]/90 border-slate-500/30")}>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#00e676]">{isNoir ? "📤 ВЫ ОТДАЕТЕ:" : isSoviet ? "📤 ВЫ ПРЕДЛАГАЕТЕ:" : "📤 ВЫ ОТДАЕТЕ:"}</span>
                  <span className="text-[10px] text-[#94a3b8]">Баланс: {isNoir ? `$${myPlayer?.money || 0}` : isSoviet ? `${myPlayer?.money || 0} кР` : `$${myPlayer?.money || 0}`}</span>
                </div>

                {/* Offer Cash Input */}
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>{isNoir ? "$" : isSoviet ? "кР" : "$"}</span>
                  <input
                    type="number"
                    min="0"
                    max={myPlayer?.money || 0}
                    step="10"
                    placeholder={isNoir ? "$" : isSoviet ? "кР" : "$"}
                    value={offerCash || ''}
                    onChange={(e) => setOfferCash(Math.max(0, Math.min(myPlayer?.money || 0, Number(e.target.value))))}
                    className={cn(
                      "h-7 w-full px-2 text-xs font-bold rounded-none text-white focus:outline-none border",
                      isNoir ? "bg-[#1a1410] border-[#d4a647]/40 focus:border-[#d4a647]" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/40 focus:border-[#38bdf8]" : "bg-[#020617] border-slate-500/40 focus:border-slate-400"
                    )}
                  />
                </div>

                {/* My Properties */}
                <span className="text-[10px] font-bold text-[#94a3b8] mt-0.5">
                  {isNoir ? "ВАШИ ТЕРРИТОРИИ:" : isSoviet ? "ВАШИ ОБЪЕКТЫ:" : "ВАША СОБСТВЕННОСТЬ:"}
                </span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                  {myTiles.length === 0 ? (
                    <span className="text-slate-400 italic py-2 text-center text-[11px]">{isNoir ? "Нет свободных территорий" : "Нет свободных объектов"}</span>
                  ) : (
                    myTiles.map((tile) => {
                      const isSelected = offerProperties.includes(tile.id);
                      return (
                        <button
                          key={tile.id}
                          onClick={() => handleToggleOfferTile(tile.id)}
                          className={cn(
                            "flex items-center justify-between p-1.5 rounded-none border text-left transition-all",
                            isSelected
                              ? (isNoir ? 'bg-[#d4a647] text-[#1a1410] border-[#d4a647] font-bold' : isSoviet ? 'bg-[#0369a1] text-white border-[#38bdf8] font-bold' : 'bg-slate-800 text-white border-slate-400 font-bold')
                              : (isNoir ? 'bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8] hover:border-[#d4a647]' : isSoviet ? 'bg-[#050b14] border-[#38bdf8]/30 text-[#e2e8f0] hover:border-[#38bdf8]' : 'bg-[#020617] border-slate-500/30 text-white hover:border-slate-400')
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                              <TileIconImage tile={tile} className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-[11px] truncate">{tile.name}</span>
                          </div>
                          <span className="text-[10px] font-bold">{isNoir ? `$${tile.price}` : isSoviet ? `${tile.price} кР` : `$${tile.price}`}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Requested from Partner */}
              <div className={cn("flex flex-col gap-2 p-3 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c]/80 border-[#38bdf8]/30" : "bg-[#020617]/90 border-slate-500/30")}>
                <div className="flex items-center justify-between font-bold">
                  <span className={cn(isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>{isNoir ? "📥 ВЫ ПОЛУЧАЕТЕ:" : isSoviet ? "📥 ВЫ ТРЕБУЕТЕ:" : "📥 ВЫ ПОЛУЧАЕТЕ:"}</span>
                  <span className="text-[10px] text-[#94a3b8]">Баланс: {isNoir ? `$${partnerPlayer?.money || 0}` : isSoviet ? `${partnerPlayer?.money || 0} кР` : `$${partnerPlayer?.money || 0}`}</span>
                </div>

                {/* Request Cash Input */}
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>{isNoir ? "$" : isSoviet ? "кР" : "$"}</span>
                  <input
                    type="number"
                    min="0"
                    max={partnerPlayer?.money || 0}
                    step="10"
                    placeholder={isNoir ? "$" : isSoviet ? "кР" : "$"}
                    value={requestCash || ''}
                    onChange={(e) => setRequestCash(Math.max(0, Math.min(partnerPlayer?.money || 0, Number(e.target.value))))}
                    className={cn(
                      "h-7 w-full px-2 text-xs font-bold rounded-none text-white focus:outline-none border",
                      isNoir ? "bg-[#1a1410] border-[#d4a647]/40 focus:border-[#d4a647]" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/40 focus:border-[#38bdf8]" : "bg-[#020617] border-slate-500/40 focus:border-slate-400"
                    )}
                  />
                </div>

                {/* Partner Properties */}
                <span className="text-[10px] font-bold text-[#94a3b8] mt-0.5">
                  {isNoir ? `ТЕРРИТОРИИ ДЕТЕКТИВА ${partnerPlayer?.name || ''}:` : isSoviet ? `ОБЪЕКТЫ ЭКИПАЖА ${partnerPlayer?.name || ''}:` : `СОБСТВЕННОСТЬ ИГРОКА ${partnerPlayer?.name || ''}:`}
                </span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                  {partnerTiles.length === 0 ? (
                    <span className="text-slate-400 italic py-2 text-center text-[11px]">{isNoir ? "У детектива нет свободных территорий" : "У игрока нет свободных объектов"}</span>
                  ) : (
                    partnerTiles.map((tile) => {
                      const isSelected = requestProperties.includes(tile.id);
                      return (
                        <button
                          key={tile.id}
                          onClick={() => handleToggleRequestTile(tile.id)}
                          className={cn(
                            "flex items-center justify-between p-1.5 rounded-none border text-left transition-all",
                            isSelected
                              ? (isNoir ? 'bg-[#d4a647] text-[#1a1410] border-[#d4a647] font-bold' : isSoviet ? 'bg-[#0369a1] text-white border-[#38bdf8] font-bold' : 'bg-slate-800 text-white border-slate-400 font-bold')
                              : (isNoir ? 'bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8] hover:border-[#d4a647]' : isSoviet ? 'bg-[#050b14] border-[#38bdf8]/30 text-[#e2e8f0] hover:border-[#38bdf8]' : 'bg-[#020617] border-slate-500/30 text-white hover:border-slate-400')
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                              <TileIconImage tile={tile} className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-[11px] truncate">{tile.name}</span>
                          </div>
                          <span className="text-[10px] font-bold">{isNoir ? `$${tile.price}` : isSoviet ? `${tile.price} кР` : `$${tile.price}`}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Trade Limit Status */}
            <div className={cn("flex items-center justify-between p-2 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
              <span className="text-[11px] text-[#94a3b8] font-semibold">
                {isNoir ? `Лимит сделок в главе ${gameState.roundNumber || 1}:` : isSoviet ? `Квота сеансов связи в витке ${gameState.roundNumber || 1}:` : `Лимит предложений в раунде ${gameState.roundNumber || 1}:`}
              </span>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-none border", isNoir ? "font-noir-body bg-[#1a1410] text-[#d4a647] border-[#d4a647]/40" : isSoviet ? "font-space bg-[#050b14] text-[#38bdf8] border-[#38bdf8]/40" : "bg-[#020617] text-slate-300 border-slate-500/40")}>
                {remainingTrades}/2 ДОСТУПНО
              </span>
            </div>

            {/* Propose Button */}
            <div className="flex justify-end gap-2 mt-1">
              <button className={cn("px-3 py-1.5 text-xs rounded-none font-bold", isNoir ? "noir-btn-smoke font-noir-title" : isSoviet ? "soviet-btn-steel font-soviet" : "classic-btn-secondary font-sans")} onClick={closeModal}>
                ОТМЕНА
              </button>
              <button
                className={cn("px-5 py-1.5 text-xs rounded-none font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                onClick={handleSendTrade}
                disabled={!selectedPartnerId || isTradeLimitReached}
              >
                {isTradeLimitReached ? 'ЛИМИТ ИСЧЕРПАН' : (isNoir ? 'ОТПРАВИТЬ СВЯЗНОГО 🕵️' : isSoviet ? 'ОТПРАВИТЬ РАДИОГРАММУ 🛰️' : 'ОТПРАВИТЬ ПРЕДЛОЖЕНИЕ 🤝')}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
