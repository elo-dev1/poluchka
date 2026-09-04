import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PetAvatar } from '@/components/common/PetAvatar';
import { getPetCharacter } from '@/lib/petCharacters';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Clock, Eye } from 'lucide-react';
import { formatMoney, formatTime, cn } from '@/lib/utils';

export const GameOverModal: React.FC = () => {
  const { gameState, isHost, socket, roomId, playerId, leaveRoom, theme } = useGame();
  const [closedByUser, setClosedByUser] = useState<boolean>(false);

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';
  const isGameOver = gameState?.status === 'GAME_OVER';

  // Reset closed state if game restarts
  useEffect(() => {
    if (!isGameOver) {
      setClosedByUser(false);
    }
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver && !closedByUser) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isGameOver, closedByUser]);

  if (!isGameOver || !gameState) return null;

  const winner = gameState.winner || gameState.rankings[0];
  const winnerPet = winner ? getPetCharacter(winner.characterId) : null;

  const handleRestart = () => {
    if (socket && roomId && playerId) {
      socket.emit('restart_game', { roomId, playerId });
    }
  };

  const handleClose = () => {
    setClosedByUser(true);
  };

  return (
    <>
      <Dialog open={!closedByUser} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className={cn(
          "max-w-md max-h-[90vh] overflow-y-auto text-center shadow-2xl p-5 sm:p-6 rounded-none border",
          isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-slate-500/50 font-sans"
        )}>
          <DialogHeader className="flex flex-col items-center">
            <div className="text-3xl mb-1">{isNoir ? '🕵️‍♂️ 📰' : isSoviet ? '🚀 ★' : '🏆 🎲'}</div>
            <DialogTitle className={cn("text-xl sm:text-2xl justify-center font-bold", isNoir ? "text-[#d4a647] font-noir-title" : isSoviet ? "text-[#38bdf8] font-soviet" : "text-slate-300")}>
              {gameState.gameMode === 'team'
                ? (isNoir ? 'ИТОГИ РАССЛЕДОВАНИЯ СИНДИКАТА' : isSoviet ? 'ИТОГОВЫЙ ОТЧЕТ ЭКСПЕДИЦИЙ' : 'ИТОГИ КОМАНДНОЙ ИГРЫ')
                : gameState.gameMode === 'reverse'
                ? (isNoir ? 'ДЕЛО ЗАКРЫТО: НАОБОРОТ' : isSoviet ? 'ОТЧЕТ МИССИИ: НАОБОРОТ' : 'ИТОГИ ИГРЫ: РЕЖИМ НАОБОРОТ')
                : (isNoir ? 'ДЕЛО ЗАКРЫТО' : isSoviet ? 'ИТОГОВЫЙ ОТЧЕТ ГОСКОМИССИИ ОКБ-1' : 'ИГРА ОКОНЧЕНА • ПОБЕДИТЕЛЬ')}
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs text-[#94a3b8] mt-1 flex-wrap justify-center">
              <span className="flex items-center gap-1">
                <Clock className={cn("w-3.5 h-3.5", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
                {isNoir ? `Время расследования: ${formatTime(gameState.gameDurationSeconds || 0)}` : isSoviet ? `Длительность полёта: ${formatTime(gameState.gameDurationSeconds || 0)}` : `Время игры: ${formatTime(gameState.gameDurationSeconds || 0)}`}
              </span>
              {gameState.gameMode === 'reverse' && (
                <span className={isNoir ? "text-[#d4a647] font-semibold" : isSoviet ? "text-[#38bdf8] font-semibold" : "text-slate-400 font-semibold"}>
                  • 🔄 Глава: {Math.min(gameState.roundNumber || 1, gameState.maxRounds || 20)}/{gameState.maxRounds || 20}
                </span>
              )}
              {gameState.gameMode === 'team' && (
                <span className={isNoir ? "text-[#d4a647] font-semibold" : isSoviet ? "text-[#38bdf8] font-semibold" : "text-slate-400 font-semibold"}>
                  • 👥 Режим: Командный 2v2
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Winner Banner */}
            {winner && (
              <div className={cn("flex flex-col items-center p-4 rounded-none shadow-inner border", isNoir ? "bg-[#1a1410] border-[#d4a647]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]" : "bg-[#020617] border-slate-500/50")}>
                <div className="h-16 flex items-center justify-center mb-1">
                  <PetAvatar
                    characterId={winner.characterId}
                    anim="happy"
                    size="xl"
                    showPedestal={true}
                    pedestalColor={winner.color?.hex || (isNoir ? '#d4a647' : isSoviet ? '#38bdf8' : '#10b981')}
                  />
                </div>
                <span className={cn("text-lg font-bold", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white")}>
                  {gameState.gameMode === 'team' && winner.teamName ? winner.teamName : winner.name}
                </span>
                <span className="text-xs text-[#94a3b8]">
                  {winnerPet?.name}
                </span>
                <span className={cn("mt-2 text-xs px-3 py-1 rounded-none font-bold", isNoir ? "font-noir-title bg-[#d4a647] text-[#1a1410]" : isSoviet ? "font-soviet bg-[#0284c7] text-white" : "bg-slate-600 text-white")}>
                  {gameState.gameMode === 'team'
                    ? (isNoir ? `Синдикат-победитель ($${winner.netWorth || winner.money || 0})! 🏆` : isSoviet ? `Экипаж-победитель (${winner.netWorth || winner.money || 0} кР)! 🏆` : `Команда-победитель ($${winner.netWorth || winner.money || 0})! 🏆`)
                    : gameState.gameMode === 'reverse'
                    ? (isNoir ? `Победитель «Наоборот» ($${winner.netWorth || winner.money || 0})! 👑` : isSoviet ? `Победитель «Наоборот» (${winner.netWorth || winner.money || 0} кР)! 👑` : `Победитель ($${winner.netWorth || winner.money || 0})! 👑`)
                    : (isNoir ? `ГЛАВНЫЙ ДЕТЕКТИВ ($${winner.netWorth || winner.money || 0})! 🕵️` : isSoviet ? `ГЕРОЙ КОСМИЧЕСКОЙ ПРОГРАММЫ (${winner.netWorth || winner.money || 0} кР)! ★` : `ПОБЕДИТЕЛЬ ИГРЫ ($${winner.netWorth || winner.money || 0})! 🏆`)}
                </span>
              </div>
            )}

            {/* Player Rankings List */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
                  {gameState.gameMode === 'team' ? 'ТАБЛИЦА СИНДИКАТОВ:' : (isNoir ? 'ДОСЬЕ ПОДОЗРЕВАЕМЫХ:' : isSoviet ? 'ИТОГОВЫЙ ТАБЕЛЬ ЭКИПАЖЕЙ:' : 'ИТОГОВАЯ ТАБЛИЦА:')}
                </span>
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                {gameState.rankings.map((p, idx) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-none border text-xs",
                      idx === 0
                        ? (isNoir ? 'bg-[#1a1410] border-[#d4a647] text-[#d4a647]' : isSoviet ? 'bg-[#09111c] border-[#38bdf8] text-[#e2e8f0]' : 'bg-[#020617] border-slate-400 text-white')
                        : (isNoir ? 'bg-[#1a1410] border-[#d4a647]/20 text-[#b8a890]' : isSoviet ? 'bg-[#050b14] border-[#38bdf8]/20 text-[#cbd5e1]' : 'bg-[#020617] border-slate-500/20 text-slate-200')
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm w-5 font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <PetAvatar
                          characterId={p.characterId}
                          anim={idx === 0 ? 'happy' : 'idle'}
                          size="sm"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white max-w-[110px] truncate">
                            {p.name}
                          </span>
                          {gameState.gameMode === 'team' && (
                            <span className={cn("text-[9px] font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                              ({p.teamId === 'team_red' ? '🔴 Красные' : '🔵 Синие'})
                            </span>
                          )}
                        </div>
                        {p.ratingNote && (
                          <span className="text-[9px] text-slate-400 max-w-[140px] truncate" title={p.ratingNote}>
                            {p.ratingNote}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-bold">
                      {p.ratingDelta !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0",
                            p.ratingDelta > 0
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                              : p.ratingDelta < 0
                              ? "bg-rose-950/80 text-rose-400 border border-rose-500/40"
                              : "bg-slate-800/80 text-slate-400 border border-slate-600/40"
                          )}
                          title={p.ratingNote || `${p.ratingDelta > 0 ? '+' : ''}${p.ratingDelta} ELO`}
                        >
                          {p.ratingDelta > 0 ? `+${p.ratingDelta}` : p.ratingDelta} ELO
                        </span>
                      )}
                      <span className={cn("text-sm", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-space text-[#00e676]" : "text-slate-300 font-sans")}>
                        {isNoir ? `$${p.netWorth || p.money || 0}` : isSoviet ? `${p.netWorth || p.money || 0} кР` : `$${p.netWorth || p.money || 0}`}
                      </span>
                      {p.isBankrupt && (
                        <span className="text-[8px] px-1 py-0 rounded-none bg-[#450a0a] text-[#fca5a5] font-bold">
                          {isNoir ? 'КОНЕЦ ИСТОРИИ' : isSoviet ? 'СХОД С ОРБИТЫ' : 'БАНКРОТ'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            {isHost ? (
              <button
                className={cn("flex-1 text-xs py-2.5 rounded-none flex items-center justify-center gap-1.5 font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
                onClick={handleRestart}
              >
                <RotateCcw className="w-3.5 h-3.5 text-white" />
                <span>{isNoir ? "НОВОЕ ДЕЛО 🕵️" : isSoviet ? "НОВЫЙ ЗАПУСК ★" : "СЫГРАТЬ ЕЩЕ РАЗ"}</span>
              </button>
            ) : null}
            <button
              className={cn("flex-1 text-xs py-2.5 rounded-none flex items-center justify-center gap-1.5 font-bold", isNoir ? "noir-btn-smoke font-noir-title" : isSoviet ? "soviet-btn-steel font-soviet" : "classic-btn-secondary font-sans")}
              onClick={leaveRoom}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isNoir ? "В БЮРО ДЕТЕКТИВА" : isSoviet ? "ГЛАВНЫЙ ЦУП" : "В ГЛАВНОЕ МЕНЮ"}</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bottom Bar if user closed the modal to inspect board */}
      {closedByUser && (
        <div className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 rounded-none shadow-2xl select-none border",
          isNoir ? "bg-[#1a1410] border-[#d4a647] font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8] font-soviet" : "bg-[#0f172a] border-slate-500/50 font-sans"
        )}>
          <div className={cn("flex items-center gap-1.5 text-xs font-bold px-2", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-300")}>
            <Trophy className="w-4 h-4" />
            <span>{isNoir ? "ДЕЛО ЗАКРЫТО" : isSoviet ? "МИССИЯ ЗАВЕРШЕНА" : "ИГРА ЗАВЕРШЕНА"}</span>
          </div>
          <button
            className={cn("h-7 text-xs px-2.5 rounded-none font-bold", isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")}
            onClick={() => setClosedByUser(false)}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            ИТОГИ
          </button>
          {isHost && (
            <button
              className={cn("h-7 text-xs px-2.5 rounded-none font-bold", isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")}
              onClick={handleRestart}
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              В ЛОББИ
            </button>
          )}
          <button
            className={cn("h-7 text-xs px-2.5 rounded-none font-bold", isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel" : "classic-btn-secondary")}
            onClick={leaveRoom}
          >
            <Home className="w-3 h-3 inline mr-1" />
            В МЕНЮ
          </button>
        </div>
      )}
    </>
  );
};
