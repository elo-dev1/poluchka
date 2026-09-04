import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Sliders, Trophy, LogOut, Copy, Check, LogIn, Maximize, Minimize } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { cn } from '@/lib/utils';

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
    theme,
  } = useGame();

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const [copied, setCopied] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(() => {
    return typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false;
  });

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    soundEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

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
    <header className={cn(
      "w-full flex items-center justify-between px-3 md:px-6 py-2 z-40 relative select-none shadow-md border-b",
      isNoir ? "bg-[#1a1410] border-[#d4a647] font-noir-title" : isSoviet ? "bg-[#0c1420] border-[#38bdf8] font-soviet" : "bg-[#0f172a] border-slate-500/40 font-sans"
    )}>
      {/* Left: Brand Logo & Room Code */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 select-none">
          <span className={cn("text-lg md:text-xl", isNoir ? "text-[#d4a647] drop-shadow-sm" : isSoviet ? "text-[#dc2626] drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "text-amber-400 drop-shadow-sm")}>
            {isNoir ? '🔍' : isSoviet ? '★' : '🎲'}
          </span>
          <div className="flex flex-col">
            <span className={cn("font-bold text-sm md:text-base tracking-wider hidden sm:inline leading-tight uppercase", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#e2e8f0]" : "text-white")}>
              ПОЛУЧКА
            </span>
            <span className={cn("text-[8px] tracking-widest uppercase hidden sm:inline -mt-0.5", isNoir ? "font-noir-body text-[#b8a890]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-medium")}>
              {isNoir ? 'УГОЛОВНОЕ ДЕЛО №1947 • ЛОС-АНДЖЕЛЕС' : isSoviet ? 'КОСМИЧЕСКАЯ ПРОГРАММА СССР • ОКБ-1' : 'КЛАССИЧЕСКАЯ НАСТОЛЬНАЯ ИГРА'}
            </span>
          </div>
        </div>

        {roomId && (
          <button
            className={cn(
              "h-7 text-xs font-bold flex items-center gap-1.5 px-2.5 rounded-none transition-colors border",
              isNoir ? "font-noir-body bg-[#1a1410] border-[#d4a647] text-[#d4a647] hover:bg-[#2a2420]" : isSoviet ? "font-space bg-[#0f172a] border-[#38bdf8] text-[#38bdf8] hover:bg-[#1e293b]" : "font-sans bg-[#020617] border-slate-500/60 text-slate-300 hover:bg-[#1e293b]"
            )}
            onClick={handleCopyCode}
            title="Скопировать код стола"
          >
            <span>{isNoir ? `[ ДЕЛО № ${roomId} ]` : isSoviet ? `[ СЕКТОР ЦУП № ${roomId} ]` : `[ СТОЛ № ${roomId} ]`}</span>
            {copied ? <Check className="w-3 h-3 text-[#00e676]" /> : <Copy className="w-3 h-3 text-[#94a3b8]" />}
          </button>
        )}

        {gameState && gameState.status !== 'LOBBY' && (
          <div className="flex items-center gap-1.5 font-space">
            {gameState.gameMode === 'reverse' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-[#1e1026] border border-[#a855f7] text-xs text-[#e9d5ff] shadow-xs" title="Круг стола">
                <span>🔄 РЕЖИМ «НАОБОРОТ»</span>
                <span className="text-[10px] text-[#c084fc]">
                  • РАУНД {Math.min(gameState.roundNumber || 1, gameState.maxRounds || (gameState.boardSize === 24 ? 10 : 20))}/{gameState.maxRounds || (gameState.boardSize === 24 ? 10 : 20)}
                </span>
              </div>
            ) : (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold shadow-xs border",
                isNoir ? "bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8] text-[#38bdf8]" : "bg-[#020617] border-slate-500/50 text-slate-300"
              )}>
                <span>{isNoir ? `ГЛАВА #${gameState.roundNumber || gameState.turnNumber || 1}` : isSoviet ? `ВИТОК #${gameState.roundNumber || gameState.turnNumber || 1}` : `РАУНД #${gameState.roundNumber || gameState.turnNumber || 1}`}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Profile Badge / Login Button */}
        {roomId && (
          currentUser ? (
            <button
              onClick={() => openModal('profile')}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1 rounded-none border transition-all cursor-pointer shadow-xs",
                isNoir ? "bg-[#1a1410] border-[#d4a647] hover:bg-[#2a2420]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8] hover:bg-[#1e293b]" : "bg-[#020617] border-slate-500/50 hover:bg-[#1e293b]"
              )}
            >
              <UserAvatar
                avatarUrl={currentUser.avatarUrl}
                name={currentUser.firstName || currentUser.username}
                size="xs"
              />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-[#e2e8f0] leading-tight max-w-[90px] truncate">
                  {currentUser.firstName}
                </span>
                <span className={cn("text-[9px] font-bold leading-none", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                  {currentUser.rating ?? 0} ELO
                </span>
              </div>
            </button>
          ) : (
            <button
              className={cn(
                "h-7 text-xs px-3 rounded-none flex items-center gap-1.5 font-bold",
                isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans"
              )}
              onClick={() => openModal('telegramLogin')}
            >
              <LogIn className="w-3.5 h-3.5 text-white" />
              <span>ВОЙТИ</span>
            </button>
          )
        )}

        {/* Settings Button */}
        <button
          className={cn(
            "w-8 h-8 rounded-none flex items-center justify-center transition-colors border",
            isNoir ? "bg-[#1a1410] border-[#d4a647]/60 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/60 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#020617] border-slate-500/40 hover:border-slate-400 text-slate-300"
          )}
          onClick={() => openModal('settings')}
          title="Настройки графики и темы"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Global Sound Toggle */}
        <button
          className={cn(
            "w-8 h-8 rounded-none flex items-center justify-center transition-colors border",
            isNoir ? "bg-[#1a1410] border-[#d4a647]/60 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/60 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#020617] border-slate-500/40 hover:border-slate-400 text-slate-300"
          )}
          onClick={toggleSound}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#ef4444]" />}
        </button>

        {/* Fullscreen Button */}
        <button
          className={cn(
            "w-8 h-8 rounded-none flex items-center justify-center transition-colors border",
            isNoir ? "bg-[#1a1410] border-[#d4a647]/60 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/60 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#020617] border-slate-500/40 hover:border-slate-400 text-slate-300"
          )}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* In-Game Surrender / Leave Button */}
        {gameState && gameState.status !== 'LOBBY' && (
          <button
            className="w-8 h-8 rounded-none bg-[#260a0e] border border-[#dc2626] hover:bg-[#3f1016] flex items-center justify-center text-[#ef4444] transition-colors"
            onClick={() => openModal('surrender')}
            title={isNoir ? "Закрыть дело (Сдаться)" : isSoviet ? "Прервать миссию (Аварийное закрытие)" : "Сдаться / Покинуть стол"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

