import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Dice3D } from './Dice3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PetAvatar } from '@/components/common/PetAvatar';
import { Dices, CheckCircle2, ShoppingBag, Building2, ArrowRightLeft, Gavel, ArrowRight, AlertTriangle, Key, Skull, LogOut } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';

export const BoardCenterDashboard: React.FC = () => {
  const {
    gameState,
    playerId,
    rollDice,
    endTurn,
    buyProperty,
    passProperty,
    payBail,
    useJailCard,
    rollJailDice,
    declareBankruptcy,
    openModal,
    leaveRoom,
    isTokenMoving,
  } = useGame();

  const [localSeconds, setLocalSeconds] = useState<number>(60);
  const logsContainerRef = React.useRef<HTMLDivElement>(null);
  const logsEndRef = React.useRef<HTMLDivElement>(null);
  const userScrolledUpRef = React.useRef(false);

  // Check scroll position: if scrolled up more than 7 logs (>250px from bottom), disable auto-scroll
  const handleLogsScroll = () => {
    if (!logsContainerRef.current) return;
    const el = logsContainerRef.current;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // ~7 logs height threshold (each log row is ~36px including gap)
    const sevenLogsHeight = 250;
    userScrolledUpRef.current = distanceFromBottom > sevenLogsHeight;
  };

  // Auto-scroll logs to bottom whenever new logs arrive (only if within 7 logs from bottom)
  React.useEffect(() => {
    if (userScrolledUpRef.current) return;

    const scrollToBottom = () => {
      if (userScrolledUpRef.current) return;
      if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
      }
      if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 50);
    const t2 = setTimeout(scrollToBottom, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [gameState?.logs, gameState?.logs?.length]);

  // Sync and tick turn timer locally every 1000ms
  useEffect(() => {
    if (!gameState) return;
    setLocalSeconds(gameState.remainingTurnSeconds !== undefined ? gameState.remainingTurnSeconds : 60);

    if (gameState.status === 'GAME_OVER' || gameState.status === 'LOBBY') return;

    const interval = setInterval(() => {
      setLocalSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.remainingTurnSeconds, gameState?.currentTurnIndex, gameState?.status]);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);
  const isMyTurn = gameState.currentPlayerId === playerId;
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const currentTile = currentPlayer ? gameState.board[currentPlayer.position] : null;

  const inJail = Boolean(myPlayer && myPlayer.inJail);
  const hasDebt = Boolean(myPlayer && myPlayer.money < 0);

  const isAwaitingPropertyAction =
    isMyTurn &&
    (gameState.status === 'AWAITING_ACTION' || (gameState.status as string) === 'ACTION') &&
    gameState.pendingAction?.type === 'BUY_PROPERTY';

  const pendingTile =
    isAwaitingPropertyAction && gameState.pendingAction?.tileId !== undefined
      ? gameState.board[gameState.pendingAction.tileId]
      : currentTile;

  const canAffordBuy = Boolean(
    myPlayer && pendingTile?.price && myPlayer.money >= pendingTile.price
  );

  const isEndTurnPhase = isMyTurn && gameState.status === 'TURN_END';
  const is40 = (gameState.board?.length || 24) === 40;

  // Format timer into mm:ss
  const minutes = Math.floor(localSeconds / 60);
  const seconds = localSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Show recent logs for the center feed
  const recentLogs = (gameState.logs || []).slice(-35);

  return (
    <div
      className="rounded-2xl p-2 sm:p-3 md:p-4 flex flex-col items-center justify-between z-10 shadow-inner relative overflow-hidden bg-gradient-to-b from-[#101428]/95 via-[#0e1224]/90 to-[#12162d]/95 border border-white/10 backdrop-blur-xl w-full h-full"
      style={{
        gridRow: is40 ? '2 / 11' : '2 / 7',
        gridColumn: is40 ? '2 / 11' : '2 / 7',
      }}
    >
      {/* 1. Top Bar: Turn Status Badge & Timer & Turn Number */}
      <div className="flex flex-col items-center gap-1 w-full z-10">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Turn counter badge */}
          {gameState.status !== 'GAME_OVER' && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-[11px] sm:text-xs font-black shadow-sm">
              <span>🎲 Ход {gameState.turnNumber || 1}</span>
            </div>
          )}

          <div
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full border shadow-md transition-all',
              isMyTurn
                ? 'bg-indigo-600/30 border-indigo-400 text-white animate-pulse'
                : 'bg-white/5 border-white/10 text-muted-foreground'
            )}
          >
            {currentPlayer && (
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <PetAvatar
                  characterId={currentPlayer.characterId}
                  anim="idle"
                  size="sm"
                  pedestalColor={currentPlayer.color?.hex}
                />
              </div>
            )}
            <span className="text-xs sm:text-sm font-black tracking-wide">
              {isMyTurn ? 'Ваш ход' : `Очередь: ${currentPlayer?.name || ''}`}
            </span>
          </div>

          {gameState.status !== 'GAME_OVER' && (
            <span className={cn(
              'font-mono font-black text-sm sm:text-base px-2.5 py-0.5 rounded-lg border',
              localSeconds <= 15
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                : 'bg-white/5 border-white/10 text-indigo-300'
            )}>
              {formattedTime}
            </span>
          )}
        </div>
      </div>

      {/* 2. Center: 3D Dice Display Box */}
      <div className="flex flex-col items-center justify-center my-auto z-10 py-1">
        <div className="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-2xl bg-[#161a32]/80 border border-white/10 shadow-2xl backdrop-blur-md">
          <Dice3D dice={gameState.lastDice} isRolling={isTokenMoving} />
        </div>
      </div>

      {/* 3. Action Controls Button */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-xs z-10">
        {isTokenMoving ? (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse w-full shadow-md">
            <Dices className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-xs sm:text-sm font-black">Фишка перемещается...</span>
          </div>
        ) : (
          <>
            {/* Debt Alert */}
            {isMyTurn && hasDebt && (
              <div className="w-full p-2 rounded-xl bg-red-950/80 border border-red-500/50 text-center flex flex-col items-center gap-0.5 animate-pulse mb-1">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Задолженность: -${Math.abs(myPlayer!.money)}</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-red-200/90 leading-tight">
                  Заложите улицы в правом меню «Карточка поля»!
                </span>
              </div>
            )}

            {/* Jail Controls */}
            {isMyTurn && inJail && gameState.status === 'ROLLING' && !hasDebt && (
              <div className="flex flex-col gap-1.5 w-full mb-1">
                <div className="text-xs font-bold text-amber-300 bg-amber-950/60 py-1 px-2.5 rounded-lg border border-amber-500/30 text-center">
                  🔒 Тюрьма (ход {(myPlayer?.jailTurns || 0) + 1}/3)
                </div>
                <div className="flex items-center gap-1.5 w-full">
                  <Button
                    variant="gold"
                    size="sm"
                    className="flex-1 text-xs font-black h-8 rounded-xl"
                    disabled={!myPlayer || myPlayer.money < 50}
                    onClick={payBail}
                  >
                    Выкуп $50
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs font-black h-8 rounded-xl bg-indigo-600"
                    onClick={rollJailDice}
                  >
                    Дубль 🎲
                  </Button>
                  {(myPlayer?.jailFreeCards || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-black h-8 rounded-xl border-amber-500/40 text-amber-300"
                      onClick={useJailCard}
                    >
                      Карта 🔑
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 1. Roll Dice Button */}
            {isMyTurn && !inJail && gameState.status === 'ROLLING' && !hasDebt && (
              <button
                onClick={rollDice}
                className="w-full py-3 px-6 rounded-full font-black text-sm sm:text-base text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-500/25 border border-white/20 flex items-center justify-center gap-2 select-none"
              >
                <Dices className="w-5 h-5" />
                <span>Бросить кубики</span>
              </button>
            )}

            {/* 2. Buy Property / Auction Phase */}
            {isAwaitingPropertyAction && pendingTile && !hasDebt && (
              <div className="flex flex-col gap-1.5 w-full">
                <button
                  onClick={buyProperty}
                  disabled={!canAffordBuy}
                  className="w-full py-3 px-4 rounded-full font-black text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 border border-white/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Купить за ${pendingTile.price}</span>
                </button>
                <button
                  onClick={passProperty}
                  className="w-full py-1 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                >
                  Отказаться (Аукцион)
                </button>
              </div>
            )}

            {/* 3. End Turn Phase */}
            {isEndTurnPhase && !hasDebt && (
              <button
                onClick={endTurn}
                className="w-full py-3 px-6 rounded-full font-black text-sm sm:text-base text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-500/25 border border-white/20 flex items-center justify-center gap-2 select-none"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Завершить ход</span>
              </button>
            )}

            {/* 4. If Bankrupt: Exit Game Button */}
            {myPlayer?.isBankrupt && (
              <div className="w-full p-2.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-center flex flex-col items-center gap-1.5 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-black text-red-300">
                  <span>💀 Вы выбыли из игры</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full h-8 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  onClick={leaveRoom}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти из игры</span>
                </Button>
              </div>
            )}

            {/* Waiting indicator when not my turn and not bankrupt */}
            {!isMyTurn && !myPlayer?.isBankrupt && (
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground/80 py-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Ожидание хода соперника...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Bottom: In-Game Live Event Log Messages Feed */}
      <div
        ref={logsContainerRef}
        onScroll={handleLogsScroll}
        className="w-full mt-2 pt-2 border-t border-white/15 flex flex-col gap-1.5 z-10 h-32 sm:h-40 md:h-48 max-h-56 overflow-y-auto pr-1 scroll-smooth"
      >
        {recentLogs.length === 0 ? (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center my-auto">
            <span className="text-xs sm:text-sm text-indigo-300/80 font-bold italic">
              🎲 Игра началась. Бросайте кубики!
            </span>
          </div>
        ) : (
          recentLogs.map((log, idx) => {
            const isLatest = idx === recentLogs.length - 1;
            const text = log.text || log.message || '';
            const isRent = text.includes('рент') || text.includes('заплатил');
            const isBuy = text.includes('купил') || text.includes('приобрел');
            const isStart = text.includes('СТАРТ') || text.includes('бонус') || text.includes('+200') || text.includes('+400');
            const isJail = text.includes('Тюрьм') || text.includes('арест');
            const isDice = text.includes('выбросил') || text.includes('кубик') || text.includes('Дубль');

            return (
              <div
                key={log.id || idx}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-center leading-snug transition-all shrink-0',
                  isLatest
                    ? 'bg-[#181d3d] border border-indigo-500/50 text-white font-black text-xs sm:text-sm md:text-[14px] shadow-md ring-1 ring-indigo-400/30 animate-in fade-in zoom-in-95 duration-200'
                    : 'bg-black/25 text-slate-300 font-semibold text-[11px] sm:text-xs opacity-85'
                )}
              >
                <span className="mr-1.5 inline-block">
                  {isDice ? '🎲' : isBuy ? '🏢' : isStart ? '🏁' : isRent ? '💸' : isJail ? '👮' : '•'}
                </span>
                <span>{text}</span>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
