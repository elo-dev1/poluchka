import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Layers, Key, ArrowRightLeft } from 'lucide-react';
import { formatMoney, cn } from '@/lib/utils';
import { TileData } from '@/types/game';

export const InventorySidebar: React.FC = () => {
  const { gameState, playerId, openModal } = useGame();

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const isTeamMode = gameState.gameMode === 'team';
  const myProperties = gameState.board.filter(
    (tile) => tile.ownerId === playerId || (isTeamMode && myPlayer?.teamId && tile.teamId === myPlayer.teamId)
  );
  const jailCardsCount = myPlayer?.jailFreeCards || 0;
  const totalPropertyValue = myProperties.reduce((acc, tile) => acc + (tile.price || 0), 0);

  const handleTileClick = (tile: TileData) => {
    openModal('tileDetails', { tile });
  };

  return (
    <aside className="w-52 sm:w-56 xl:w-60 h-full flex flex-col justify-between p-2 sm:p-2.5 bg-[#0c0f20]/95 border-l border-white/10 backdrop-blur-xl shrink-0 select-none z-20 overflow-hidden">
      <div className="flex flex-col gap-2.5 min-h-0 flex-1">
        {/* Header: Title */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-black text-xs sm:text-sm tracking-wide text-foreground">
              Инвентарь
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg flex items-center gap-1"
            onClick={() => openModal('propertyManager')}
          >
            <Building2 className="w-2.5 h-2.5" />
            <span>Управление</span>
          </Button>
        </div>

        {/* Section 1: Real Estate (Недвижимость) */}
        <div className="flex flex-col gap-1 min-h-0 flex-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Недвижимость ({myProperties.length})
            </span>
            {totalPropertyValue > 0 && (
              <span className="text-[9px] font-bold text-amber-400">
                ${totalPropertyValue}
              </span>
            )}
          </div>

          {myProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-muted-foreground text-xs gap-1">
              <Building2 className="w-6 h-6 text-muted-foreground/40 mb-0.5" />
              <span className="font-semibold text-white/70 text-[10px]">Нет недвижимости</span>
              <span className="text-[9px] text-muted-foreground/60 leading-tight">
                Покупайте свободные компании
              </span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar pr-0.5 max-h-[calc(100vh-220px)]">
              {myProperties.map((tile) => (
                <div
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#131628]/90 border border-white/10 hover:border-indigo-500/60 hover:bg-[#181c33] cursor-pointer transition-all duration-200 group shadow-sm"
                  style={{
                    borderLeftColor: tile.color || '#3b82f6',
                    borderLeftWidth: '3.5px',
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-foreground truncate group-hover:text-indigo-300 transition-colors">
                        {tile.name}
                      </span>
                      <div className="flex items-center gap-1 mt-0.2">
                        {tile.isMortgaged ? (
                          <span className="text-[7.5px] font-bold text-red-400 bg-red-950/60 px-1 py-0.2 rounded border border-red-500/30">
                            ЗАЛОГ
                          </span>
                        ) : tile.houses && tile.houses > 0 ? (
                          <span className="text-[8.5px] font-bold text-emerald-400">
                            {tile.houses === 5 ? '🏨 Отель' : `🏠 ${tile.houses} ${tile.houses === 1 ? 'дом' : 'дома'}`}
                          </span>
                        ) : (
                          <span className="text-[8.5px] text-muted-foreground truncate">
                            {tile.groupName || 'Улица'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price / Rent Pill */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className="text-[10px] font-mono font-black text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                      ${tile.price || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Cards & Special Inventory (Карточки) */}
        <div className="flex flex-col gap-1 pt-1.5 border-t border-white/10 shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
            Карточки
          </span>

          <div className="grid grid-cols-1 gap-1">
            {jailCardsCount > 0 ? (
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Key className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">
                      Выход из тюрьмы
                    </span>
                  </div>
                </div>
                <Badge variant="gold" className="text-[8.5px] font-bold px-1 py-0">
                  x{jailCardsCount}
                </Badge>
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-center text-muted-foreground/60 text-[9px]">
                Нет активных карточек удачи
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade Button Footer */}
      <div className="pt-1.5 border-t border-white/10">
        <Button
          variant="outline"
          className="w-full h-8 font-bold text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300 rounded-xl flex items-center justify-center gap-1.5"
          onClick={() => openModal('trade')}
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Предложить обмен</span>
        </Button>
      </div>
    </aside>
  );
};
