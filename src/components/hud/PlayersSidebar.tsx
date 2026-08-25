import React from 'react';
import { useGame } from '@/context/GameContext';
import { PetAvatar } from '@/components/common/PetAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Volume2, VolumeX, Settings as SettingsIcon, Maximize2, Minimize2, HelpCircle, WifiOff, ArrowRightLeft, X, LogOut } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';
import { cn, formatMoney } from '@/lib/utils';

interface PlayersSidebarProps {
  onClose?: () => void;
  className?: string;
}

export const PlayersSidebar: React.FC<PlayersSidebarProps> = ({ onClose, className }) => {
  const {
    gameState,
    playerId,
    soundEnabled,
    applySettings,
    declareBankruptcy,
    openModal,
    leaveRoom,
  } = useGame();

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    applySettings({ sound: next }, true);
    soundEngine.isMuted = !next;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!gameState) return null;

  const players = gameState.players;
  const myPlayer = players.find((p) => p.id === playerId);

  const handlePlayerClick = (targetPlayerId: string) => {
    if (targetPlayerId === playerId) return;
    openModal('trade', { targetPlayerId });
  };

  return (
    <aside
      className={cn(
        'w-56 sm:w-60 xl:w-64 h-full flex flex-col justify-between p-2 sm:p-2.5 bg-[#0c0f20]/95 border-r border-white/10 backdrop-blur-xl shrink-0 select-none z-20 overflow-hidden',
        className
      )}
    >
      {/* Top: Logo & Branding */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🎲</span>
            <span className="font-black text-sm sm:text-base tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              ПОЛУЧКА
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[8px] font-mono font-bold bg-white/5 border-white/10 text-muted-foreground px-1.5 py-0.5">
              {gameState.mode === 'blitz' ? 'БЛИЦ' : 'КЛАССИКА'}
            </Badge>
            {onClose && (
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-white transition-all ml-1"
                title="Закрыть меню"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] pr-0.5">
          {players.map((player) => {
            const currentTurnPlayer = gameState.players?.[gameState.currentTurnIndex];
            const isCurrentTurn = currentTurnPlayer ? player.id === currentTurnPlayer.id : false;
            const isMe = player.id === playerId;
            const playerHex = player.color?.hex || '#3b82f6';

            return (
              <div
                key={player.id}
                onClick={() => !isMe && handlePlayerClick(player.id)}
                className={cn(
                  'relative flex items-center justify-between p-1.5 rounded-xl border transition-all duration-300 shadow-md group',
                  isMe ? 'cursor-default' : 'cursor-pointer hover:border-indigo-400/80 hover:bg-[#181c33]',
                  isCurrentTurn
                    ? 'bg-[#1a203a] border-indigo-500/80 ring-2 ring-indigo-500/40 shadow-indigo-500/20 shadow-lg scale-[1.01]'
                    : 'bg-[#131628]/90 border-white/10',
                  player.isBankrupt && 'opacity-35 saturate-0 pointer-events-none'
                )}
                style={{
                  borderLeftColor: playerHex,
                  borderLeftWidth: '3.5px',
                }}
                title={isMe ? 'Ваш профиль' : `Нажмите для предложения обмена с ${player.name}`}
              >
                {/* Left: Avatar with colored ring */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${playerHex} 20%, #0d1021)`,
                      boxShadow: `0 0 8px color-mix(in srgb, ${playerHex} 40%, transparent)`,
                    }}
                  >
                    <PetAvatar
                      characterId={player.characterId}
                      anim={isCurrentTurn ? 'jump' : player.inJail ? 'sleep' : 'idle'}
                      size="sm"
                      pedestalColor={playerHex}
                    />
                    {isCurrentTurn && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#0d1021] animate-pulse" />
                    )}
                  </div>

                  {/* Center: Name & Balance */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-foreground truncate max-w-[85px] sm:max-w-[105px]">
                        {player.name}
                      </span>
                      {isMe && (
                        <Badge variant="gold" className="text-[7.5px] px-1 py-0 h-3.5 font-black">
                          ВЫ
                        </Badge>
                      )}
                      {player.isBot && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[7.5px] px-1 py-0 h-3.5 font-black border flex items-center gap-0.5',
                            player.botDifficulty === 'careful' && 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                            player.botDifficulty === 'aggressive' && 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                            (!player.botDifficulty || player.botDifficulty === 'balanced') && 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          )}
                        >
                          <span>🤖</span>
                          <span>
                            {player.botDifficulty === 'careful'
                              ? 'Осторожный'
                              : player.botDifficulty === 'aggressive'
                              ? 'Агрессор'
                              : 'Баланс'}
                          </span>
                        </Badge>
                      )}
                      {!isMe && !player.isBot && (
                        <span className="text-[8.5px] text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                          <ArrowRightLeft className="w-2.5 h-2.5" />
                          Обмен
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        {formatMoney(player.money)}
                      </span>

                      {/* Status Tags */}
                      {player.inJail && (
                        <span className="text-[8px] font-black text-red-400 bg-red-950/60 px-1 py-0.2 rounded border border-red-500/30">
                          Тюрьма
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Pawn Token Icon in player color */}
                <div className="flex flex-col items-end gap-0.5 shrink-0 pl-1">
                  <div
                    className="w-4 h-5 flex items-center justify-center drop-shadow-md"
                    title={`Фишка игрока ${player.name}`}
                  >
                    <svg viewBox="0 0 24 30" className="w-3.5 h-4.5" fill="none">
                      <circle cx="12" cy="7" r="5" fill={playerHex} stroke="#ffffff" strokeWidth="1.5" />
                      <path
                        d="M6 26 C6 18, 9 14, 12 14 C15 14, 18 18, 18 26 Z"
                        fill={playerHex}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <ellipse cx="12" cy="26" rx="8" ry="3" fill={playerHex} stroke="#ffffff" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {!player.isConnected && (
                    <Badge variant="destructive" className="text-[6.5px] px-1 py-0 flex items-center gap-0.5 animate-pulse">
                      <WifiOff className="w-2 h-2" />
                      {player.disconnectBudgetSeconds || 60}с
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Utility Buttons Bar */}
      <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/10">
        {myPlayer?.isBankrupt ? (
          <Button
            variant="destructive"
            size="icon"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm"
            onClick={leaveRoom}
            title="Выйти из игры"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
            onClick={() => openModal('surrender')}
            title="Сдаться / Банкротство"
          >
            <Flag className="w-4 h-4 text-red-400" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
          onClick={toggleSound}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
          onClick={() => openModal('rules')}
          title="Правила игры"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
          onClick={() => openModal('settings')}
          title="Настройки"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
          onClick={toggleFullscreen}
          title="Полноэкранный режим"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </aside>
  );
};
