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
import { formatMoney } from '@/lib/utils';
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
  } = useGame();

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
      showToast('Вы уже предложили 2 обмена в этом раунде. Дождитесь следующего раунда!', 'warning');
      return;
    }
    if (!selectedPartnerId) {
      showToast('Выберите партнера для обмена', 'warning');
      return;
    }
    if (offerProperties.length === 0 && offerCash <= 0 && requestProperties.length === 0 && requestCash <= 0) {
      showToast('Добавьте хотя бы одно условие в обмен', 'warning');
      return;
    }
    if (myPlayer && offerCash > myPlayer.money) {
      showToast('Недостаточно денег для предложения', 'warning');
      return;
    }

    proposeTrade({
      targetId: selectedPartnerId,
      toPlayerId: selectedPartnerId,
      offerProperties,
      offerCash: Number(offerCash) || 0,
      requestProperties,
      requestCash: Number(requestCash) || 0,
    });
  };

  const tradeId = activeTrade?.id || activeTrade?.tradeId || '';
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
      <DialogContent
        overlayClassName="bg-black/30 backdrop-blur-none"
        className="max-w-xl md:max-w-2xl max-h-[88vh] flex flex-col p-4 sm:p-5 bg-[#0c1022]/98 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-3xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            {isIncomingTrade
              ? 'Входящее предложение о сделке'
              : isOutgoingTrade
              ? 'Ожидание ответа по сделке'
              : partnerPlayer && modalData?.targetPlayerId
              ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Сделка с игроком</span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-sm font-bold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${partnerPlayer.color?.hex || '#3b82f6'} 20%, #0d1021)`,
                      borderColor: partnerPlayer.color?.hex || '#3b82f6',
                      color: partnerPlayer.color?.hex || '#60a5fa',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: partnerPlayer.color?.hex || '#3b82f6' }}
                    />
                    {partnerPlayer.name}
                  </span>
                </div>
              )
              : 'Торговля и обмен имуществом'}
          </DialogTitle>
        </DialogHeader>

        {/* 1. If incoming trade */}
        {isIncomingTrade && activeTrade ? (
          <div className="flex flex-col gap-3 my-2 text-xs">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2">
              <span className="font-bold text-amber-200">
                Игрок <strong>{initiatorName}</strong> предлагает вам заключить сделку:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* You Receive */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 flex flex-col gap-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  🎁 Вы получите:
                </span>
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {tradeOfferMoney > 0 && (
                    <span className="font-black text-emerald-300 text-sm">
                      💵 {formatMoney(tradeOfferMoney)}
                    </span>
                  )}
                  {tradeOfferProps.map((id) => {
                    const tile = gameState.board[id];
                    if (!tile) return null;
                    return (
                      <div key={id} className="flex items-center gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          <TileIconImage tile={tile} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground truncate">{tile.name}</span>
                      </div>
                    );
                  })}
                  {tradeOfferMoney <= 0 && tradeOfferProps.length === 0 && (
                    <span className="text-muted-foreground italic my-auto text-center">— Ничего —</span>
                  )}
                </div>
              </div>

              {/* You Give */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 flex flex-col gap-2">
                <span className="font-bold text-red-400 flex items-center gap-1">
                  📤 Вы отдадите:
                </span>
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {tradeRequestMoney > 0 && (
                    <span className="font-black text-red-300 text-sm">
                      💵 {formatMoney(tradeRequestMoney)}
                    </span>
                  )}
                  {tradeRequestProps.map((id) => {
                    const tile = gameState.board[id];
                    if (!tile) return null;
                    return (
                      <div key={id} className="flex items-center gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          <TileIconImage tile={tile} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground truncate">{tile.name}</span>
                      </div>
                    );
                  })}
                  {tradeRequestMoney <= 0 && tradeRequestProps.length === 0 && (
                    <span className="text-muted-foreground italic my-auto text-center">— Ничего —</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reverse Mode Incoming Asset Balance Indicator */}
            {gameState.gameMode === 'reverse' && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1 text-left">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-300 flex items-center gap-1">
                    <span>🔄</span> Изменение вашего капитала при принятии:
                  </span>
                  {(() => {
                    const receivedNominal = tradeOfferProps.reduce((sum, id) => sum + (gameState.board[id]?.price || 0), 0) + (tradeOfferMoney || 0);
                    const givenNominal = tradeRequestProps.reduce((sum, id) => sum + (gameState.board[id]?.price || 0), 0) + (tradeRequestMoney || 0);
                    const netChange = receivedNominal - givenNominal;
                    return (
                      <span className={netChange < 0 ? 'text-emerald-400 font-mono' : netChange > 0 ? 'text-rose-400 font-mono' : 'text-muted-foreground font-mono'}>
                        {netChange > 0 ? `+${formatMoney(netChange)} (невыгодно)` : netChange < 0 ? `${formatMoney(netChange)} (выгодно! 📉)` : '$0'}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  В режиме «Наоборот» побеждает наименьший капитал.
                </span>
              </div>
            )}

            {/* Accept / Decline Buttons */}
            <div className="flex gap-2.5 mt-2">
              <Button
                variant="success"
                size="lg"
                className="flex-1 font-black shadow-lg flex items-center justify-center gap-2 h-11"
                onClick={() => {
                  acceptTrade(tradeId);
                  closeModal();
                }}
              >
                <Check className="w-5 h-5" /> Принять сделку
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="flex-1 font-black shadow-lg flex items-center justify-center gap-2 h-11"
                onClick={() => {
                  rejectTrade(tradeId);
                  closeModal();
                }}
              >
                <X className="w-5 h-5" /> Отклонить
              </Button>
            </div>
          </div>
        ) : isOutgoingTrade && activeTrade ? (
          /* 2. Outgoing waiting screen */
          <div className="flex flex-col items-center gap-4 py-6 text-center text-xs">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-foreground">
                Предложение отправлено игроку <strong className="text-amber-300">{targetName}</strong>
              </span>
              <span className="text-muted-foreground">
                Ожидание решения соперника...
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-red-400 border-red-500/30 hover:bg-red-950/40"
              onClick={() => {
                rejectTrade(tradeId);
                closeModal();
              }}
            >
              <X className="w-4 h-4 mr-1" /> Отозвать сделку
            </Button>
          </div>
        ) : (
          /* 3. Create Trade Interface */
          <div className="flex flex-col gap-3.5 my-2 text-xs overflow-y-auto pr-1">
            {/* Select Partner - Only show if not opened for a specific player and multiple partners exist */}
            {!modalData?.targetPlayerId && otherPlayers.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Выберите игрока для сделки:</label>
                <div className="flex gap-2 flex-wrap">
                  {otherPlayers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPartnerId(p.id);
                        setRequestProperties([]);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                        selectedPartnerId === p.id
                          ? 'bg-primary/20 border-primary text-primary font-bold shadow-md'
                          : 'bg-black/20 border-white/10 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color.hex }} />
                      <span>{p.name}</span>
                      <span className="text-[10px] opacity-75">(${p.money})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Split Offer & Request Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left Column: My Offer */}
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">📤 Вы отдаёте:</span>
                  <span className="text-[11px] text-muted-foreground">Баланс: ${myPlayer?.money || 0}</span>
                </div>

                {/* Offer Cash Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-bold">$</span>
                  <Input
                    type="number"
                    min="0"
                    max={myPlayer?.money || 0}
                    step="10"
                    placeholder="Сумма денег"
                    value={offerCash || ''}
                    onChange={(e) => setOfferCash(Math.max(0, Math.min(myPlayer?.money || 0, Number(e.target.value))))}
                    className="h-8 text-xs bg-black/40"
                  />
                </div>

                {/* My Properties */}
                <span className="text-[11px] font-semibold text-muted-foreground mt-1">Ваши улицы:</span>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                  {myTiles.length === 0 ? (
                    <span className="text-muted-foreground italic py-2 text-center text-[11px]">Нет доступных улиц</span>
                  ) : (
                    myTiles.map((tile) => {
                      const isSelected = offerProperties.includes(tile.id);
                      return (
                        <button
                          key={tile.id}
                          onClick={() => handleToggleOfferTile(tile.id)}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                              <TileIconImage tile={tile} />
                            </div>
                            <span className="font-semibold text-[11px] truncate">{tile.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">${tile.price}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Requested from Partner */}
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">📥 Вы запрашиваете:</span>
                  <span className="text-[11px] text-muted-foreground">Баланс: ${partnerPlayer?.money || 0}</span>
                </div>

                {/* Request Cash Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-bold">$</span>
                  <Input
                    type="number"
                    min="0"
                    max={partnerPlayer?.money || 0}
                    step="10"
                    placeholder="Сумма денег"
                    value={requestCash || ''}
                    onChange={(e) => setRequestCash(Math.max(0, Math.min(partnerPlayer?.money || 0, Number(e.target.value))))}
                    className="h-8 text-xs bg-black/40"
                  />
                </div>

                {/* Partner Properties */}
                <span className="text-[11px] font-semibold text-muted-foreground mt-1">
                  Улицы {partnerPlayer?.name || 'соперника'}:
                </span>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                  {partnerTiles.length === 0 ? (
                    <span className="text-muted-foreground italic py-2 text-center text-[11px]">У игрока нет улиц</span>
                  ) : (
                    partnerTiles.map((tile) => {
                      const isSelected = requestProperties.includes(tile.id);
                      return (
                        <button
                          key={tile.id}
                          onClick={() => handleToggleRequestTile(tile.id)}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                              <TileIconImage tile={tile} />
                            </div>
                            <span className="font-semibold text-[11px] truncate">{tile.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">${tile.price}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Reverse Mode Asset Balance Indicator */}
            {gameState.gameMode === 'reverse' && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1 text-left">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-300 flex items-center gap-1">
                    <span>🔄</span> Изменение вашего капитала:
                  </span>
                  {(() => {
                    const givenNominal = offerProperties.reduce((sum, id) => sum + (gameState.board[id]?.price || 0), 0) + (offerCash || 0);
                    const receivedNominal = requestProperties.reduce((sum, id) => sum + (gameState.board[id]?.price || 0), 0) + (requestCash || 0);
                    const netChange = receivedNominal - givenNominal;
                    return (
                      <span className={netChange < 0 ? 'text-emerald-400 font-mono' : netChange > 0 ? 'text-rose-400 font-mono' : 'text-muted-foreground font-mono'}>
                        {netChange > 0 ? `+${formatMoney(netChange)} (невыгодно)` : netChange < 0 ? `${formatMoney(netChange)} (выгодно! 📉)` : '$0'}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  В режиме «Наоборот» побеждает наименьший капитал. Сбрасывайте активы и заставляйте соперников богатеть!
                </span>
              </div>
            )}

            {/* Trade Limit Status & Warnings */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] text-muted-foreground font-semibold">
                Лимит обменов в раунде {gameState.roundNumber || 1}:
              </span>
              <Badge variant={isTradeLimitReached ? "destructive" : "secondary"} className="text-[10px] font-bold">
                {remainingTrades}/2 доступно
              </Badge>
            </div>

            {isTradeLimitReached && (
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-[11px] font-medium text-center">
                ⚠️ Вы исчерпали лимит (максимум 2 обмена за раунд). Сделки снова станут доступны в следующем раунде.
              </div>
            )}

            {/* Propose Button */}
            <div className="flex justify-end gap-2 mt-1">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Отмена
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="font-bold px-6 shadow-md"
                onClick={handleSendTrade}
                disabled={!selectedPartnerId || isTradeLimitReached}
              >
                {isTradeLimitReached ? 'Лимит исчерпан (2/2)' : 'Отправить предложение 🤝'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
