import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Sliders, Trophy, LogOut, Copy, Check, LogIn } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

export const TopBar: React.FC = () => {
  const {
    gameState,
    roomId,
    currentUser,
    openModal,
    leaveRoom,
    soundEnabled,
    applySettings,
    showToast,
  } = useGame();

  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    showToast(`Код стола [${roomId}] скопирован!`, 'success', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    applySettings({ sound: next }, true);
    soundEngine.isMuted = !next;
  };

  return (
    <header className="w-full flex items-center justify-between px-3 md:px-6 py-2.5 bg-black/40 border-b border-white/10 backdrop-blur-xl z-40 relative select-none">
      {/* Left: Brand Logo & Room Code */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 select-none">
          <span className="text-xl md:text-2xl">🎲</span>
          <span className="font-black text-sm md:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400 hidden sm:inline">
            ПОЛУЧКА
          </span>
        </div>

        {roomId && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-mono font-bold flex items-center gap-1.5 bg-black/40 border-white/10"
            onClick={handleCopyCode}
            title="Скопировать код стола"
          >
            <span>[{roomId}]</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </Button>
        )}

        {gameState && gameState.status !== 'LOBBY' && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs font-black text-indigo-200 shadow-sm">
            <span>🎲 Ход #{gameState.turnNumber || 1}</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Profile Badge / Login Button (Only shown in TopBar when inside a room/game) */}
        {roomId && (
          currentUser ? (
            <button
              onClick={() => openModal('profile')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 hover:border-primary/50 transition-all cursor-pointer shadow-sm"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover border border-primary"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                  {(currentUser.firstName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-foreground leading-tight max-w-[90px] truncate">
                  {currentUser.firstName}
                </span>
                <span className="text-[9px] font-black text-amber-400 leading-none">
                  ⭐ {currentUser.rating || 1000} ELO
                </span>
              </div>
            </button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs font-bold flex items-center gap-1.5 shadow-md bg-gradient-to-r from-primary to-blue-600 hover:brightness-110 text-white rounded-xl px-3"
              onClick={() => openModal('telegramLogin')}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </Button>
          )
        )}

        {/* Sound Toggle (Always accessible) */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={toggleSound}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
        </Button>

        {/* Settings Button (Always accessible in TopBar) */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => openModal('settings')}
          title="Настройки игры"
        >
          <Sliders className="w-4 h-4" />
        </Button>

        {/* Leave Room Button (if in game or lobby) */}
        {roomId && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8 sm:h-9 text-xs font-bold flex items-center gap-1.5 px-2.5 sm:px-3"
            onClick={leaveRoom}
            title="Покинуть комнату"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        )}
      </div>
    </header>
  );
};
