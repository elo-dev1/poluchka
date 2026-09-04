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
    theme,
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

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  return (
    <div
      className={cn(
        "p-2 sm:p-3 md:p-3.5 flex flex-col items-center justify-between z-10 relative overflow-hidden w-full h-full shadow-2xl",
        isNoir
          ? "noir-panel rounded-sm border-2 border-[#1a1410] font-noir-body text-[#1a1410]"
          : isSoviet
          ? "soviet-steel-panel rounded-none border border-[#38bdf8] font-soviet"
          : "classic-panel rounded-none border border-slate-500/40 font-sans text-slate-100"
      )}
      style={{
        gridRow: is40 ? '2 / 11' : '2 / 7',
        gridColumn: is40 ? '2 / 11' : '2 / 7',
        backgroundColor: isNoir ? 'transparent' : isSoviet ? '#0c1420' : '#081d14',
        backgroundImage: isNoir 
          ? 'radial-gradient(circle at 50% 50%, rgba(212,166,71,0.1) 0%, transparent 80%)'
          : isSoviet
          ? 'radial-gradient(circle at 50% 50%, rgba(14,38,64,0.5) 0%, transparent 85%), linear-gradient(to right, rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.04) 1px, transparent 1px)'
          : 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 80%), linear-gradient(to right, rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 16px 16px, 16px 16px',
      }}
    >
      {/* 1. Top Bar: Turn Badge, Status Badge & Telemetry Timer */}
      <div className={cn("flex flex-col items-center gap-1 w-full z-10", isNoir ? "font-noir-body" : "font-space")}>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Orbit count badge */}
          {gameState.status !== 'GAME_OVER' && (
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-0.5 rounded-none font-bold shadow-xs text-[9px] sm:text-xs",
              isNoir ? "bg-[#f5e6c8] border border-[#1a1410] text-[#1a1410]" : isSoviet ? "bg-[#09111c] border border-[#38bdf8] text-[#e2e8f0]" : "bg-[#0f172a] border border-slate-500/50 text-slate-300"
            )}>
              <span className={isNoir ? "text-[#8b0000]" : isSoviet ? "text-[#dc2626]" : "text-amber-400"}>{isNoir ? "📄" : isSoviet ? "★" : "🎲"}</span>
              <span>{isNoir ? `ГЛАВА ${gameState.turnNumber || 1}` : isSoviet ? `ОРБИТА ВИТОК №${gameState.turnNumber || 1}` : `РАУНД #${gameState.turnNumber || 1}`}</span>
            </div>
          )}

          <div
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-1 rounded-none border shadow-sm transition-all',
              isNoir ? 'font-noir-body' : isSoviet ? 'font-soviet' : 'font-sans',
              isMyTurn
                ? (isNoir ? 'bg-[#d4a647] border-[#1a1410] text-[#1a1410] font-bold' : isSoviet ? 'bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe]' : 'bg-slate-600 border-slate-400 text-white font-bold')
                : (isNoir ? 'bg-[#1a1410] border-[#d4a647] text-[#b8a890]' : isSoviet ? 'bg-[#0f172a] border-[#334155] text-[#94a3b8]' : 'bg-slate-900/80 border-slate-700 text-slate-300')
            )}
          >
            {currentPlayer && (
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <PetAvatar
                  characterId={currentPlayer.characterId}
                  anim="idle"
                  size="sm"
                  pedestalColor={
                    currentPlayer.teamId === 'team_red'
                      ? '#dc2626'
                      : currentPlayer.teamId === 'team_blue'
                      ? '#0284c7'
                      : currentPlayer.color?.hex
                  }
                />
              </div>
            )}
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              {isNoir
                ? (isMyTurn ? 'ВАШ ХОД, ДЕТЕКТИВ 🔍' : `ДЕЛО: ${currentPlayer?.name || ''}`)
                : isSoviet
                ? (isMyTurn ? 'ВАШ СЕАНС СВЯЗИ ★' : `НА СВЯЗИ: ${currentPlayer?.name || ''}`)
                : (isMyTurn ? 'ВАШ ХОД 🎲' : `ХОДИТ: ${currentPlayer?.name || ''}`)}
            </span>
          </div>

          {gameState.status !== 'GAME_OVER' && (
            <span className={cn(
              'font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-none border',
              isNoir ? 'font-noir-body' : 'font-space',
              localSeconds <= 15
                ? 'bg-[#8b0000] border-[#1a1410] text-[#f5e6c8] animate-pulse'
                : (isNoir ? 'bg-[#1a1410] border-[#b8a890] text-[#f5e6c8]' : isSoviet ? 'bg-[#071912] border-[#00e676] text-[#00e676]' : 'bg-slate-950 border-slate-500 text-slate-300')
            )}>
              ⏱ {formattedTime}
            </span>
          )}
        </div>
      </div>

      {/* 2. Center: Gyroscopes / Telemetry Dice Arena */}
      <div className="flex flex-col items-center justify-center my-auto z-10 py-1">
        <div className={cn(
          "px-3 py-1.5 sm:px-5 sm:py-2 rounded-none shadow-inner relative",
          isNoir ? "bg-[#1a1410] border border-[#d4a647]" : isSoviet ? "bg-[#050b14] border border-[#38bdf8]/70" : "bg-[#020617] border border-slate-500/40"
        )}>
          <div className={cn(
            "absolute -top-2 left-2 text-[8px] font-bold px-1 border",
            isNoir ? "font-noir-body text-[#d4a647] bg-[#1a1410] border-[#d4a647]" : isSoviet ? "font-space text-[#38bdf8] bg-[#050b14] border-[#38bdf8]/40" : "font-sans text-slate-400 bg-[#020617] border-slate-500/40"
          )}>
            {isNoir ? 'ЖРЕБИЙ' : isSoviet ? '★ БЛОК ГИРОСКОПОВ ОКБ-1' : '🎲 КУБИКИ'}
          </div>
          <Dice3D dice={gameState.lastDice} isRolling={isTokenMoving} />
        </div>
      </div>

      {/* 3. Action Controls Button */}
      <div className={cn("flex flex-col items-center gap-1.5 w-full max-w-xs z-10", isNoir ? "font-noir-body" : isSoviet ? "font-soviet" : "font-sans")}>
        {myPlayer?.isBankrupt ? (
          /* Spectator Mode Panel */
          <div className="w-full flex flex-col gap-2">
            {isTokenMoving && (
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-none bg-blue-900/60 border border-blue-400 text-blue-100 text-xs animate-pulse w-full shadow-sm">
                <Dices className="w-3.5 h-3.5 animate-spin text-blue-300" />
                <span>{isNoir ? 'ДВИЖЕНИЕ...' : isSoviet ? 'КОРАБЛЬ НА ТРАЕКТОРИИ...' : 'ХОД ФИШКИ ПО ПОЛЮ...'}</span>
              </div>
            )}
            <div className="w-full p-2.5 rounded-none bg-[#260a0e] border border-[#dc2626] text-center flex flex-col items-center gap-1.5 shadow-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#fca5a5]">
                <span>{isNoir ? 'КОНЕЦ ИСТОРИИ (НАБЛЮДАТЕЛЬ)' : isSoviet ? 'МИССИЯ ПРЕРВАНА (НАБЛЮДАТЕЛЬ)' : 'ВЫ БАНКРОТ (РЕЖИМ НАБЛЮДЕНИЯ)'}</span>
              </div>
              <button
                className={cn("w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5", isNoir ? "noir-btn-blood" : isSoviet ? "soviet-btn-red" : "classic-btn-danger")}
                onClick={leaveRoom}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isNoir ? 'ЗАКРЫТЬ ДЕЛО' : isSoviet ? 'ПОКИНУТЬ ЦУП' : 'ВЫЙТИ ИЗ ИГРЫ'}</span>
              </button>
            </div>
          </div>
        ) : isTokenMoving ? (
          <div className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-none animate-pulse w-full shadow-md text-xs sm:text-sm font-bold",
            isNoir ? "bg-[#1a1410] border border-[#d4a647] text-[#f5e6c8]" : isSoviet ? "bg-[#0369a1] border border-[#38bdf8] text-[#e0f2fe]" : "bg-slate-700 border border-slate-400 text-white"
          )}>
            <Dices className="w-4 h-4 animate-spin" />
            <span>{isNoir ? 'СЛЕДСТВИЕ ИДЁТ...' : isSoviet ? '«ВОСТОК» НА ТРАЕКТОРИИ ПОЛЁТА...' : 'ФИШКА ДВИЖЕТСЯ ПО ПОЛЮ...'}</span>
          </div>
        ) : (
          <>
            {/* Debt Alert */}
            {isMyTurn && hasDebt && (
              <div className="w-full p-2 rounded-none bg-[#450a0a] border border-[#dc2626] text-center flex flex-col items-center gap-0.5 animate-pulse mb-1 font-space">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#fca5a5]">
                  <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                  <span>{isNoir ? `ДОЛГ: $${Math.abs(myPlayer!.money)}` : isSoviet ? `ДЕФИЦИТ ЭНЕРГИИ: -${Math.abs(myPlayer!.money)} кР` : `ДОЛГ ПЕРЕД БАНКОМ: -$${Math.abs(myPlayer!.money)}`}</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-[#e2e8f0]/90 leading-tight">
                  {isNoir ? 'Заложите имущество или продайте явки в правой панели!' : isSoviet ? 'Переведите модули в аварийный резерв в правом реестре!' : 'Заложите имущество или продайте дома в правой панели!'}
                </span>
              </div>
            )}

            {/* Jail / Checkpoint Controls */}
            {isMyTurn && inJail && gameState.status === 'ROLLING' && !hasDebt && (
              <div className="flex flex-col gap-1.5 w-full mb-1">
                <div className={cn("text-xs font-bold py-1 px-2.5 rounded-none border text-center", isNoir ? "font-noir-body bg-[#1a1410] border-[#8b0000] text-[#d4a647]" : "font-space text-[#fbbf24] bg-[#09111c] border-[#dc2626]/60")}>
                  {isNoir ? `В КАТАЛАЖКЕ (ХОД ${(myPlayer?.jailTurns || 0) + 1}/3)` : isSoviet ? `ПОЯС ВАН АЛЛЕНА (ВИТОК ${(myPlayer?.jailTurns || 0) + 1}/3)` : `ТЮРЬМА (ХОД ${(myPlayer?.jailTurns || 0) + 1}/3)`}
                </div>
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    className={cn("flex-1 text-xs h-8 rounded-none", isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-amber" : "bg-amber-600 hover:bg-amber-500 text-white font-bold")}
                    disabled={!myPlayer || myPlayer.money < 50}
                    onClick={payBail}
                  >
                    {isNoir ? 'ВЗЯТКА $50' : isSoviet ? 'ПРОДУВКА 50 кР' : 'ВЫКУП $50'}
                  </button>
                  <button
                    className={cn("flex-1 text-xs h-8 rounded-none", isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-cyan" : "bg-slate-600 hover:bg-slate-500 text-white font-bold")}
                    onClick={rollJailDice}
                  >
                    {isNoir ? 'ФАРТ 🎲' : isSoviet ? 'МАНЕВР 🎲' : 'ДУБЛЬ 🎲'}
                  </button>
                  {(myPlayer?.jailFreeCards || 0) > 0 && (
                    <button
                      className={cn("text-xs h-8 rounded-none px-2", isNoir ? "noir-btn-blood" : isSoviet ? "soviet-btn-steel" : "bg-slate-700 hover:bg-slate-600 text-white")}
                      onClick={useJailCard}
                    >
                      {isNoir ? 'СВЯЗИ 🔑' : isSoviet ? 'КОД 🔑' : 'КАРТА 🔑'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 1. Roll Dice Button */}
            {isMyTurn && !inJail && gameState.status === 'ROLLING' && !hasDebt && (
              <button
                onClick={rollDice}
                className={cn(
                  "w-full py-2.5 px-6 rounded-none text-xs sm:text-sm flex items-center justify-center gap-2 select-none font-bold",
                  isNoir ? "noir-btn-amber text-white" : isSoviet ? "soviet-btn-red" : "classic-btn-primary"
                )}
              >
                <Dices className="w-4 h-4 text-white" />
                <span className="tracking-wider">{isNoir ? 'БРОСИТЬ КОСТИ' : isSoviet ? 'ПУСК РАКЕТЫ // ТАКТ ПОЛЁТА 🚀' : 'БРОСИТЬ КУБИКИ 🎲'}</span>
              </button>
            )}

            {/* 2. Buy Property / Auction Phase */}
            {isAwaitingPropertyAction && pendingTile && !hasDebt && (
              <div className="flex flex-col gap-1.5 w-full">
                <button
                  onClick={buyProperty}
                  disabled={!canAffordBuy}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-none text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 font-bold",
                    isNoir ? "noir-btn-amber text-white" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary"
                  )}
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>{isNoir ? `ПРИСВОИТЬ ($${pendingTile.price})` : isSoviet ? `ВЗЯТЬ ОБЪЕКТ НА БАЛАНС ЗА ${pendingTile.price} кР` : `КУПИТЬ ОБЪЕКТ ЗА $${pendingTile.price}`}</span>
                </button>
                <button
                  onClick={passProperty}
                  className={cn(
                    "w-full py-1 text-xs rounded-none transition-colors",
                    isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel" : "classic-btn-secondary"
                  )}
                >
                  {isNoir ? 'ПРОПУСТИТЬ' : isSoviet ? 'ПЕРЕДАТЬ В АКАДЕМИЮ НАУК СССР' : 'ОТКАЗАТЬСЯ (НА АУКЦИОН)'}
                </button>
              </div>
            )}

            {/* 3. End Turn Phase */}
            {isEndTurnPhase && !hasDebt && (
              <button
                onClick={endTurn}
                className={cn(
                  "w-full py-2.5 px-6 rounded-none text-xs sm:text-sm flex items-center justify-center gap-2 select-none font-bold",
                  isNoir ? "noir-btn-smoke text-white" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary"
                )}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="tracking-wider">{isNoir ? 'КОНЕЦ ХОДА' : isSoviet ? 'ЗАВЕРШИТЬ СЕАНС СВЯЗИ ★' : 'ЗАВЕРШИТЬ ХОД ✓'}</span>
              </button>
            )}

            {/* Waiting indicator when not my turn */}
            {!isMyTurn && (
              <div className={cn("text-xs sm:text-sm py-1 flex items-center gap-1.5", isNoir ? "font-noir-body text-[#b8a890]" : "font-space text-[#94a3b8]")}>
                <span className={cn("w-1.5 h-1.5 rounded-none animate-ping", isNoir ? "bg-[#d4a647]" : isSoviet ? "bg-[#38bdf8]" : "bg-slate-400")} />
                <span>{isNoir ? 'Ожидание действий...' : isSoviet ? 'Ожидание сеанса связи экипажа...' : 'Ожидание хода соперника...'}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Bottom: Telemetry Feed & Mission Control Logs */}
      <div
        ref={logsContainerRef}
        onScroll={handleLogsScroll}
        className={cn(
          "w-full mt-2 pt-2 flex flex-col gap-1 z-10 h-32 sm:h-36 md:h-44 max-h-52 overflow-y-auto pr-1 scroll-smooth border-t",
          isNoir ? "font-noir-body border-[#1a1410]" : isSoviet ? "font-space border-[#38bdf8]/40" : "font-space border-slate-500/30"
        )}
      >
        {recentLogs.length === 0 ? (
          <div className={cn(
            "p-2 rounded-none text-center my-auto border",
            isNoir ? "bg-[#1a1410] border-[#b8a890] text-[#f5e6c8] text-xs font-bold" : isSoviet ? "bg-[#050f1a] border-[#38bdf8]/40 text-[#38bdf8]" : "bg-[#020617] border-slate-500/30 text-slate-400 text-xs"
          )}>
            <span>
              {isNoir ? '📋 ПРОТОКОЛ' : isSoviet ? '[ ТЕЛЕМЕТРИЯ ЦУП БАЙКОНУР АКТИВНА. СВЯЗЬ УСТАНОВЛЕНА. ПОЕХАЛИ! ]' : '[ ИГРОВОЙ ЖУРНАЛ СТОЛА АКТИВЕН • УДАЧНОЙ ИГРЫ! ]'}
            </span>
          </div>
        ) : (
          recentLogs.map((log, idx) => {
            const isLatest = idx === recentLogs.length - 1;
            const text = log.text || log.message || '';
            const isRent = text.includes('рент') || text.includes('заплатил') || text.includes('сбор');
            const isBuy = text.includes('купил') || text.includes('приобрел') || text.includes('купила') || text.includes('приобрела');
            const isStart = text.includes('СТАРТ') || text.includes('бонус') || text.includes('+200') || text.includes('+400');
            const isJail = text.includes('Тюрьм') || text.includes('арест') || text.includes('Пояс');
            const isDice = text.includes('выбросил') || text.includes('кубик') || text.includes('Дубль');

            return (
              <div
                key={log.id || idx}
                className={cn(
                  'px-2 py-0.5 rounded-none text-left leading-snug transition-all shrink-0 text-[11px] sm:text-xs',
                  isNoir ? 'font-noir-body' : 'font-space',
                  isLatest
                    ? (isNoir ? 'bg-[#1a1410] border-l-2 border-[#d4a647] text-[#f5e6c8] font-bold animate-in fade-in zoom-in-95 duration-200' : isSoviet ? 'bg-[#0369a1] border-l-2 border-[#00e676] text-[#e0f2fe] font-bold animate-in fade-in zoom-in-95 duration-200' : 'bg-slate-900/70 border-l-2 border-slate-400 text-slate-100 font-bold')
                    : isBuy
                    ? (isNoir ? 'bg-[#261c14] border-l-2 border-[#d4a647] text-[#f5e6c8]' : isSoviet ? 'bg-[#0c2438] border-l-2 border-[#38bdf8] text-[#e0f2fe]' : 'bg-slate-950/70 border-l-2 border-slate-400 text-slate-200')
                    : (isNoir ? 'bg-[#1a1410]/50 text-[#b8a890] opacity-85' : isSoviet ? 'bg-[#0f172a]/80 text-[#94a3b8] opacity-85' : 'bg-slate-900/60 text-slate-300 opacity-85')
                )}
              >
                <span className={cn("mr-1.5", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                  {isDice ? '🎲' : isBuy ? (isNoir ? '🏢' : '★') : isStart ? '🏁' : isRent ? '⚡' : isJail ? '⚠️' : (isNoir ? '🔍' : '★')}
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

