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
import { formatMoney, formatTime } from '@/lib/utils';

export const GameOverModal: React.FC = () => {
  const { gameState, isHost, socket, roomId, playerId, leaveRoom } = useGame();
  const [closedByUser, setClosedByUser] = useState<boolean>(false);

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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto text-center bg-card/95 border-border backdrop-blur-2xl p-5 sm:p-6">
          <DialogHeader className="flex flex-col items-center">
            <div className="text-5xl mb-2 animate-bounce">🏆</div>
            <DialogTitle className="text-2xl justify-center text-amber-400 font-black">
              {gameState.gameMode === 'team'
                ? 'КОМАНДНАЯ ПОБЕДА! 👥'
                : gameState.gameMode === 'reverse'
                ? 'РЕЖИМ «НАОБОРОТ» ЗАВЕРШЁН!'
                : 'ИГРА ЗАВЕРШЕНА!'}
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap justify-center">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Длительность: {formatTime(gameState.gameDurationSeconds || 0)}
              </span>
              {gameState.gameMode === 'reverse' && (
                <span className="text-purple-300 font-semibold">
                  • 🔄 Раунды: {Math.min(gameState.roundNumber || 1, gameState.maxRounds || 20)}/{gameState.maxRounds || 20}
                </span>
              )}
              {gameState.gameMode === 'team' && (
                <span className="text-blue-300 font-semibold">
                  • 👥 Режим: Командный 2v2
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Winner Banner */}
            {winner && (
              <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-500/30">
                <div className="h-16 flex items-center justify-center mb-1">
                  <PetAvatar
                    characterId={winner.characterId}
                    anim="happy"
                    size="xl"
                    showPedestal={true}
                    pedestalColor={winner.color?.hex || '#3b82f6'}
                  />
                </div>
                <span className="text-lg font-black text-foreground">
                  {gameState.gameMode === 'team' && winner.teamName ? winner.teamName : winner.name}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {winnerPet?.name} {winnerPet?.emoji}
                </span>
                <Badge variant="gold" className="mt-2 font-bold text-xs">
                  {gameState.gameMode === 'team'
                    ? `Команда-чемпион ($${winner.netWorth || winner.money || 0})! 🏆`
                    : gameState.gameMode === 'reverse'
                    ? `Победитель «Наоборот» ($${winner.netWorth || winner.money || 0})! 👑`
                    : 'Победитель Монополии! 👑'}
                </Badge>
              </div>
            )}

            {/* Player Rankings List */}
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {gameState.gameMode === 'team' ? 'Итоговый рейтинг команд:' : 'Итоговый рейтинг игроков:'}
                </span>
                {gameState.gameMode === 'reverse' && (
                  <span className="text-[10px] text-purple-300 font-bold">
                    Меньше активов = выше место
                  </span>
                )}
                {gameState.gameMode === 'team' && (
                  <span className="text-[10px] text-blue-300 font-bold">
                    Суммарный капитал команды
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {gameState.rankings.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      idx === 0
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm w-5">
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
                          <span className="font-bold text-foreground max-w-[110px] truncate">
                            {p.name}
                          </span>
                          {gameState.gameMode === 'team' && (
                            <span className="text-[9px] font-bold text-blue-300">
                              ({p.teamId === 'team_red' ? '🔴 Красные' : '🔵 Синие'})
                            </span>
                          )}
                        </div>
                        {gameState.gameMode === 'reverse' && !p.isBankrupt && (
                          <span className="text-[9px] text-muted-foreground">
                            нал: ${p.money} | недвиж: ${p.propertyNominalValue || p.propertyValue || 0}
                          </span>
                        )}
                        {gameState.gameMode === 'team' && !p.isBankrupt && (
                          <span className="text-[9px] text-muted-foreground">
                            казна команды: ${p.money}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono font-bold">
                      <span className="text-foreground">
                        {formatMoney(p.netWorth || p.money || 0)}
                      </span>
                      {p.isBankrupt && (
                        <Badge variant="destructive" className="text-[9px] px-1 py-0">
                          ВЫБЫЛ
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            {isHost ? (
              <Button
                variant="default"
                className="flex-1 font-bold flex items-center justify-center gap-1.5 h-10"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4" />
                Вернуться в лобби
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="flex-1 font-bold flex items-center justify-center gap-1.5 h-10"
              onClick={leaveRoom}
            >
              <Home className="w-4 h-4" />
              Главное меню
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bottom Bar if user closed the modal to inspect board */}
      {closedByUser && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-black/90 border border-amber-500/50 backdrop-blur-xl shadow-2xl animate-fade-in select-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 px-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Игра завершена</span>
          </div>
          <Button
            variant="gold"
            size="sm"
            className="h-8 text-xs font-bold px-3"
            onClick={() => setClosedByUser(false)}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Показать итоги
          </Button>
          {isHost && (
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs font-bold px-3"
              onClick={handleRestart}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              В лобби
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold px-3"
            onClick={leaveRoom}
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            В меню
          </Button>
        </div>
      )}
    </>
  );
};
