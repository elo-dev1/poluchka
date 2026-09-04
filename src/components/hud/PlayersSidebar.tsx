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
    theme,
    soundEnabled,
    applySettings,
    declareBankruptcy,
    openModal,
    leaveRoom,
  } = useGame();

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

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
        'w-52 sm:w-56 xl:w-60 h-full flex flex-col justify-between p-2 sm:p-2.5 shrink-0 select-none z-20 overflow-hidden shadow-2xl border-r-2',
        isNoir ? 'bg-[#1a1410] border-[#3d2e1a] font-noir-body' : isSoviet ? 'bg-[#111820] border-[#2A3848] font-soviet' : 'bg-[#0f172a] border-slate-500/40 font-sans',
        className
      )}
    >
      {/* Top: Logo & Branding */}
      <div className="flex flex-col gap-2">
        <div className={cn("flex items-center justify-between px-1 border-b pb-1.5", isNoir ? "border-[#d4a647]/40" : isSoviet ? "border-[#38bdf8]/40" : "border-slate-500/30")}>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-base", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#dc2626]" : "text-slate-400")}>{isNoir ? "🔍" : isSoviet ? "★" : "👥"}</span>
            <span className={cn("font-bold text-xs sm:text-sm tracking-wider", isNoir ? "text-[#f5e6c8]" : isSoviet ? "text-[#e2e8f0]" : "text-white")}>
              {isNoir ? 'ДОСЬЕ ПОДОЗРЕВАЕМЫХ' : isSoviet ? 'РЕЕСТР ЭКИПАЖЕЙ' : 'СПИСОК ИГРОКОВ'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn("text-[8px] font-bold px-1.5 py-0.2 rounded-none border", isNoir ? "font-noir-body bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "font-space bg-[#09111c] border-[#38bdf8] text-[#38bdf8]" : "bg-[#0f172a] border-slate-500/50 text-slate-300 font-sans")}>
              {gameState.mode === 'blitz' ? 'БЛИЦ' : 'КЛАССИКА'}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-5 h-5 rounded-none hover:bg-black/20 flex items-center justify-center text-[#94a3b8] hover:text-[#e2e8f0] transition-all ml-1"
                title="Закрыть меню"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] pr-0.5 font-space">
          {gameState.gameMode === 'team' && gameState.teams ? (
            gameState.teams.map((team) => {
              const teamPlayers = players.filter((p) => p.teamId === team.id);
              const isRed = team.id === 'team_red';

              return (
                <div key={team.id} className="flex flex-col gap-1 mb-1">
                  {/* Team Header */}
                  <div
                    className={cn(
                      'flex items-center justify-between px-2 py-1 rounded-none border text-[10px] font-bold',
                      isRed
                        ? 'bg-[#260a0e] border-[#dc2626] text-[#fca5a5]'
                        : 'bg-[#0c2238] border-[#0284c7] text-[#bae6fd]'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span>{isRed ? '🔴' : '🔵'}</span>
                      <span>{team.name}</span>
                    </div>
                    <span className={cn("font-bold text-xs", isNoir ? "font-noir-body text-[#d4a647]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-sans")}>
                      {isNoir ? `$${team.money.toLocaleString()}` : isSoviet ? `${team.money} кР` : `$${team.money.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Team Players */}
                  {teamPlayers.map((player) => {
                    const currentTurnPlayer = gameState.players?.[gameState.currentTurnIndex];
                    const isCurrentTurn = currentTurnPlayer ? player.id === currentTurnPlayer.id : false;
                    const isMe = player.id === playerId;
                    const isTeammate = myPlayer && myPlayer.teamId === player.teamId;
                    const playerHex = isRed ? '#dc2626' : '#0284c7';

                    return (
                      <div
                        key={player.id}
                        onClick={() => !isTeammate && handlePlayerClick(player.id)}
                        className={cn(
                          'relative flex items-center justify-between p-1.5 rounded-none border transition-all duration-300 shadow-sm group',
                          isMe || isTeammate ? 'cursor-default' : 'cursor-pointer hover:border-slate-400 hover:bg-[#152336]',
                          isCurrentTurn
                            ? (isNoir ? 'bg-[#2a2018] border-[#d4a647] shadow-md scale-[1.01] noir-desk-glow' : isSoviet ? 'bg-[#0369a1] border-[#38bdf8] shadow-md scale-[1.01]' : 'bg-slate-800/80 border-slate-400 shadow-md scale-[1.01]')
                            : (isNoir ? 'noir-suspect-card' : isSoviet ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#061c14] border-slate-700/60'),
                          player.isBankrupt && 'opacity-35 saturate-0 pointer-events-none'
                        )}
                        style={{
                          borderLeftColor: playerHex,
                          borderLeftWidth: '3.5px',
                        }}
                        title={isMe ? 'Ваш профиль' : isTeammate ? 'Ваш союзник' : `Сделка с ${player.name}`}
                      >
                        {/* Left: Avatar with colored ring */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={cn("relative w-8 h-8 rounded-none flex items-center justify-center shrink-0 shadow-inner border", isNoir ? "bg-[#1a1410] border-[#d4a647]/50" : isSoviet ? "bg-[#050b14] border-[#38bdf8]" : "bg-[#020617] border-slate-500/50")}
                          >
                            <PetAvatar
                              characterId={player.characterId}
                              anim={isCurrentTurn ? 'jump' : player.inJail ? 'sleep' : 'idle'}
                              size="sm"
                              pedestalColor={playerHex}
                            />
                            {isCurrentTurn && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-none bg-[#00e676] ring-1 ring-[#09111c] animate-pulse" />
                            )}
                          </div>

                          {/* Center: Name & Balance */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={cn("text-xs font-bold truncate max-w-[85px] sm:max-w-[105px]", isNoir ? "font-noir-body text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white font-sans")}>
                                {player.name}
                              </span>
                              {isMe && (
                                <span className="text-[7px] px-1 py-0 rounded-none font-bold bg-[#dc2626] text-white">
                                  ВЫ
                                </span>
                              )}
                              {player.isBot && (
                                <span className="text-[7px] px-1 py-0 rounded-none border bg-[#0369a1] border-[#38bdf8]/40 text-[#e0f2fe]">
                                  ИИ
                                </span>
                              )}
                              {!isTeammate && !player.isBot && (
                                <span className={cn("text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                                  <ArrowRightLeft className="w-2 h-2" />
                                  {isNoir ? 'СДЕЛКА' : isSoviet ? 'ОБМЕН' : 'СДЕЛКА'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn("font-bold text-xs flex items-center gap-0.5", isNoir ? "font-noir-body text-[#d4a647]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-sans")}>
                                {isNoir ? `$${player.money.toLocaleString()}` : isSoviet ? `${player.money} кР` : `$${player.money.toLocaleString()}`}
                              </span>

                              {/* Status Tags */}
                              {player.inJail && (
                                <span className="text-[8px] font-bold text-[#fca5a5] bg-[#3b1216] px-1 py-0.2 rounded-none border border-[#dc2626]">
                                  {isNoir ? 'В КАТАЛАЖКЕ' : isSoviet ? 'КАРАНТИН' : 'В ТЮРЬМЕ'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Pawn Token */}
                        <div className="flex flex-col items-end gap-0.5 shrink-0 pl-1">
                          <div
                            className="w-4 h-5 flex items-center justify-center drop-shadow-sm"
                            title={`Фишка ${player.name}`}
                          >
                            <svg viewBox="0 0 24 30" className="w-3.5 h-4.5" fill="none">
                              <circle cx="12" cy="7" r="5" fill={playerHex} stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"} strokeWidth="1.5" />
                              <path
                                d="M6 26 C6 18, 9 14, 12 14 C15 14, 18 18, 18 26 Z"
                                fill={playerHex}
                                stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"}
                                strokeWidth="1.5"
                              />
                              <ellipse cx="12" cy="26" rx="8" ry="3" fill={playerHex} stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"} strokeWidth="1.5" />
                            </svg>
                          </div>

                          {!player.isConnected && (
                            <span className="text-[6.5px] px-1 py-0 rounded-none bg-[#450a0a] text-[#fca5a5] flex items-center gap-0.5 animate-pulse">
                              <WifiOff className="w-2 h-2" />
                              {player.disconnectBudgetSeconds || 60}с
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            players.map((player) => {
              const currentTurnPlayer = gameState.players?.[gameState.currentTurnIndex];
              const isCurrentTurn = currentTurnPlayer ? player.id === currentTurnPlayer.id : false;
              const isMe = player.id === playerId;
              const playerHex = player.color?.hex || (isNoir ? '#d4a647' : isSoviet ? '#38bdf8' : '#10b981');

              return (
                <div
                  key={player.id}
                  onClick={() => !isMe && handlePlayerClick(player.id)}
                  className={cn(
                    'relative flex items-center justify-between p-1.5 rounded-none border transition-all duration-300 shadow-sm group',
                    isMe ? 'cursor-default' : 'cursor-pointer hover:border-slate-400 hover:bg-[#152336]',
                    isCurrentTurn
                      ? (isNoir ? 'bg-[#2a2018] border-[#d4a647] shadow-md scale-[1.01] noir-desk-glow' : isSoviet ? 'bg-[#0369a1] border-[#38bdf8] shadow-md scale-[1.01]' : 'bg-slate-800/80 border-slate-400 shadow-md scale-[1.01]')
                      : (isNoir ? 'noir-suspect-card' : isSoviet ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#061c14] border-slate-700/60'),
                    player.isBankrupt && 'opacity-35 saturate-0 pointer-events-none'
                  )}
                  style={{
                    borderLeftColor: playerHex,
                    borderLeftWidth: '3.5px',
                  }}
                  title={isMe ? 'Ваш профиль' : `Сделка с ${player.name}`}
                >
                  {/* Left: Avatar with colored ring */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={cn("relative w-8 h-8 rounded-none flex items-center justify-center shrink-0 shadow-inner border", isNoir ? "bg-[#1a1410] border-[#d4a647]/50" : isSoviet ? "bg-[#050b14] border-[#38bdf8]" : "bg-[#020617] border-slate-500/50")}
                    >
                      <PetAvatar
                        characterId={player.characterId}
                        anim={isCurrentTurn ? 'jump' : player.inJail ? 'sleep' : 'idle'}
                        size="sm"
                        pedestalColor={playerHex}
                      />
                      {isCurrentTurn && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-none bg-[#00e676] ring-1 ring-[#09111c] animate-pulse" />
                      )}
                    </div>

                    {/* Center: Name & Balance */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={cn("text-xs font-bold truncate max-w-[85px] sm:max-w-[105px]", isNoir ? "font-noir-body text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white font-sans")}>
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="text-[7px] px-1 py-0 rounded-none font-bold bg-[#dc2626] text-white">
                            ВЫ
                          </span>
                        )}
                        {player.isBot && (
                          <span className="text-[7px] px-1 py-0 rounded-none border bg-[#0369a1] border-[#38bdf8]/40 text-[#e0f2fe]">
                            ИИ
                          </span>
                        )}
                        {!isMe && !player.isBot && (
                          <span className={cn("text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                            <ArrowRightLeft className="w-2 h-2" />
                            {isNoir ? 'СДЕЛКА' : isSoviet ? 'ОБМЕН' : 'СДЕЛКА'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("font-bold text-xs flex items-center gap-0.5", isNoir ? "font-noir-body text-[#d4a647]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-sans")}>
                          {isNoir ? `$${player.money.toLocaleString()}` : isSoviet ? `${player.money} кР` : `$${player.money.toLocaleString()}`}
                        </span>

                        {/* Status Tags */}
                        {player.inJail && (
                          <span className="text-[8px] font-bold text-[#fca5a5] bg-[#3b1216] px-1 py-0.2 rounded-none border border-[#dc2626]">
                            {isNoir ? 'В КАТАЛАЖКЕ' : isSoviet ? 'КАРАНТИН' : 'В ТЮРЬМЕ'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pawn Token */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0 pl-1">
                    <div
                      className="w-4 h-5 flex items-center justify-center drop-shadow-sm"
                      title={`Фишка ${player.name}`}
                    >
                      <svg viewBox="0 0 24 30" className="w-3.5 h-4.5" fill="none">
                        <circle cx="12" cy="7" r="5" fill={playerHex} stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"} strokeWidth="1.5" />
                        <path
                          d="M6 26 C6 18, 9 14, 12 14 C15 14, 18 18, 18 26 Z"
                          fill={playerHex}
                          stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"}
                          strokeWidth="1.5"
                        />
                        <ellipse cx="12" cy="26" rx="8" ry="3" fill={playerHex} stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"} strokeWidth="1.5" />
                      </svg>
                    </div>

                    {!player.isConnected && (
                      <span className="text-[6.5px] px-1 py-0 rounded-none bg-[#450a0a] text-[#fca5a5] flex items-center gap-0.5 animate-pulse">
                        <WifiOff className="w-2 h-2" />
                        {player.disconnectBudgetSeconds || 60}с
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom: Utility Buttons Bar */}
      <div className={cn("flex items-center justify-between gap-1 pt-2 border-t", isNoir ? "border-[#d4a647]/40" : isSoviet ? "border-[#38bdf8]/40" : "border-slate-500/30")}>
        {myPlayer?.isBankrupt ? (
          <button
            className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-none flex items-center justify-center", isNoir ? "noir-btn-blood" : isSoviet ? "soviet-btn-red" : "classic-btn-danger")}
            onClick={leaveRoom}
            title={isNoir ? "Закрыть дело" : isSoviet ? "Покинуть ЦУП" : "Выйти из игры"}
          >
            <LogOut className="w-3.5 h-3.5 text-white" />
          </button>
        ) : (
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-[#260a0e] border border-[#dc2626] hover:bg-[#3f1016] text-[#ef4444] flex items-center justify-center"
            onClick={() => openModal('surrender')}
            title={isNoir ? "Закрыть дело" : isSoviet ? "Прервать миссию" : "Сдаться"}
          >
            <Flag className="w-3.5 h-3.5 text-[#ef4444]" />
          </button>
        )}

        <button
          className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-none flex items-center justify-center transition-colors border", isNoir ? "bg-[#1a1410] border-[#d4a647]/50 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#0f172a] border-slate-500/40 hover:border-slate-400 text-slate-300")}
          onClick={toggleSound}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[#ef4444]" />}
        </button>

        <button
          className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-none flex items-center justify-center transition-colors border", isNoir ? "bg-[#1a1410] border-[#d4a647]/50 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#0f172a] border-slate-500/40 hover:border-slate-400 text-slate-300")}
          onClick={() => openModal('rules')}
          title="Правила игры «Получка»"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-none flex items-center justify-center transition-colors border", isNoir ? "bg-[#1a1410] border-[#d4a647]/50 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#0f172a] border-slate-500/40 hover:border-slate-400 text-slate-300")}
          onClick={() => openModal('settings')}
          title="Настройки"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>

        <button
          className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-none flex items-center justify-center transition-colors border", isNoir ? "bg-[#1a1410] border-[#d4a647]/50 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#0f172a] border-slate-500/40 hover:border-slate-400 text-slate-300")}
          onClick={toggleFullscreen}
          title="Полноэкранный режим"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
