import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { BoardContainer } from '@/components/board/BoardContainer';
import { PlayersSidebar } from '@/components/hud/PlayersSidebar';
import { RightPanel } from '@/components/hud/RightPanel';
import { PetAvatar } from '@/components/common/PetAvatar';
import { TileData } from '@/types/game';
import { Users, Building2, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameScreen: React.FC = () => {
  const { gameState, chatMessages } = useGame();
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);

  if (!gameState) return null;

  const currentPlayer = gameState.players?.[gameState.currentTurnIndex];

  const handleTileClick = (tile: TileData) => {
    setSelectedTile(tile);
    // On mobile / tablet screens, automatically open the right drawer to view tile details
    if (window.innerWidth < 1024) {
      setIsRightDrawerOpen(true);
    }
  };

  return (
    <div className="w-full h-full max-h-full flex items-stretch justify-between relative overflow-hidden select-none bg-[#090c1a]">
      {/* -------------------------------------------------------------
          1. DESKTOP LEFT SIDEBAR (Visible on lg: >= 1024px)
          ------------------------------------------------------------- */}
      <div className="hidden lg:flex h-full shrink-0">
        <PlayersSidebar />
      </div>

      {/* -------------------------------------------------------------
          2. CENTER COLUMN: MONOGRAD BOARD & RESPONSIVE HUD
          ------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center relative overflow-hidden p-1 sm:p-2 pt-11 lg:pt-2">
        {/* Mobile / Tablet Floating Header Bar (< 1024px) */}
        <div className="lg:hidden absolute top-2 left-2 right-2 flex items-center justify-between z-30 pointer-events-none">
          {/* Left Pill: Players & Trade Button */}
          <button
            onClick={() => setIsLeftDrawerOpen(true)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#13162b]/90 border border-white/20 hover:border-indigo-400/80 text-white shadow-xl backdrop-blur-md active:scale-95 transition-all text-xs font-black"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Игроки</span>
            <span className="w-4 h-4 rounded-full bg-indigo-600/80 text-[10px] flex items-center justify-center font-bold">
              {gameState.players?.length || 0}
            </span>
          </button>

          {/* Right Pill: Property Card & Chat Button */}
          <button
            onClick={() => setIsRightDrawerOpen(true)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#13162b]/90 border border-white/20 hover:border-indigo-400/80 text-white shadow-xl backdrop-blur-md active:scale-95 transition-all text-xs font-black"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Поле / Чат</span>
            {chatMessages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] flex items-center justify-center font-black">
                {chatMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Board Container */}
        <div className="w-full h-full flex items-center justify-center">
          <BoardContainer onTileClick={handleTileClick} />
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. DESKTOP RIGHT PANEL (Visible on lg: >= 1024px)
          ------------------------------------------------------------- */}
      <div className="hidden lg:flex h-full shrink-0">
        <RightPanel
          selectedTile={selectedTile}
          onCloseTile={() => setSelectedTile(null)}
        />
      </div>

      {/* -------------------------------------------------------------
          4. MOBILE LEFT DRAWER (Players, Controls, Sound, Fullscreen)
          ------------------------------------------------------------- */}
      {isLeftDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLeftDrawerOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative z-10 w-72 sm:w-80 h-full bg-[#0c0f20] shadow-2xl border-r border-white/15 animate-in slide-in-from-left duration-200">
            <PlayersSidebar onClose={() => setIsLeftDrawerOpen(false)} className="w-full" />
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. MOBILE RIGHT DRAWER (Tile Details Card & In-Game Chat)
          ------------------------------------------------------------- */}
      {isRightDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsRightDrawerOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative z-10 w-80 sm:w-96 h-full bg-[#0c0f20] shadow-2xl border-l border-white/15 animate-in slide-in-from-right duration-200">
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
