import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { BoardContainer } from '@/components/board/BoardContainer';
import { PlayersSidebar } from '@/components/hud/PlayersSidebar';
import { RightPanel } from '@/components/hud/RightPanel';
import { TileData } from '@/types/game';
import { Users, Building2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameScreen: React.FC = () => {
  const { gameState, chatMessages, theme } = useGame();
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  if (!gameState) return null;

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const handleTileClick = (tile: TileData) => {
    setSelectedTile(prev => prev?.id === tile.id ? null : tile);
    if (window.innerWidth < 1024) {
      setIsRightDrawerOpen(true);
    }
  };

  return (
    <div className="w-full h-full flex items-stretch justify-between relative overflow-hidden select-none">

      {/* ── DESKTOP: Left sidebar (players) ── */}
      <div className="hidden lg:flex h-full shrink-0">
        <PlayersSidebar />
      </div>

      {/* ── CENTER: Board + mobile header ── */}
      <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Mobile floating buttons */}
        <div className="lg:hidden absolute top-2 left-2 right-2 flex items-center justify-between z-30 pointer-events-none">
          <button
            onClick={() => setIsLeftDrawerOpen(true)}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-lg active:scale-95 transition-all border font-bold",
              isSoviet ? "soviet-instrument-panel border-[#2A3848] text-[#38bdf8] font-space" : "bg-[#062016] border-emerald-500/50 text-emerald-300 font-sans"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isSoviet ? "ЭКИПАЖ" : "ИГРОКИ"}</span>
            <span className={cn("w-4 h-4 text-[10px] flex items-center justify-center font-bold border", isSoviet ? "bg-[#081220] text-[#38bdf8] border-[#38bdf8]" : "bg-[#04150e] text-emerald-300 border-emerald-500/50")}>
              {gameState.players?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setIsRightDrawerOpen(true)}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-lg active:scale-95 transition-all border font-bold",
              isSoviet ? "bg-[#0A4060] border-[#0284c7] text-[#BAE6FD] font-space" : "bg-[#082b1e] border-emerald-500/50 text-emerald-200 font-sans"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isSoviet ? "ОБЪЕКТ / ЧАТ" : "ИНФО / ЧАТ"}</span>
            {chatMessages.length > 0 && (
              <span className={cn("w-4 h-4 text-[10px] flex items-center justify-center font-bold border", isSoviet ? "bg-[#081220] text-[#38bdf8] border-[#38bdf8]" : "bg-[#04150e] text-emerald-300 border-emerald-500/50")}>
                {chatMessages.length}
              </span>
            )}
          </button>
        </div>

        <div className="w-full h-full flex items-center justify-center p-0.5 sm:p-1 pt-10 lg:pt-1">
          <BoardContainer
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
            onCloseSelectedTile={() => setSelectedTile(null)}
          />
        </div>
      </div>

      {/* ── DESKTOP: Right panel (tile details + chat) ── */}
      <div className="hidden lg:flex h-full shrink-0">
        <RightPanel
          selectedTile={selectedTile}
          onCloseTile={() => setSelectedTile(null)}
        />
      </div>

      {/* ── MOBILE: Left drawer ── */}
      {isLeftDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setIsLeftDrawerOpen(false)} />
          <div className="relative z-10 w-64 h-full bg-[#0D1520] shadow-2xl border-r border-[#2A3848] animate-in slide-in-from-left duration-200">
            <PlayersSidebar onClose={() => setIsLeftDrawerOpen(false)} className="w-full" />
          </div>
        </div>
      )}

      {/* ── MOBILE: Right drawer ── */}
      {isRightDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/70" onClick={() => setIsRightDrawerOpen(false)} />
          <div className="relative z-10 w-80 h-full bg-[#0D1520] shadow-2xl border-l border-[#2A3848] animate-in slide-in-from-right duration-200">
            <RightPanel
              selectedTile={selectedTile}
              onCloseTile={() => setSelectedTile(null)}
              onClosePanel={() => setIsRightDrawerOpen(false)}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

