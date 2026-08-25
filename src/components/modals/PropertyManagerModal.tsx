import React from 'react';
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
import { Building2, Plus, Minus, Landmark, Unlock } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { TileIconImage, PixelIcons } from '@/lib/pixelIcons';

export const PropertyManagerModal: React.FC = () => {
  const { activeModal, closeModal, gameState, playerId, buildHouse, sellHouse, mortgageProperty, unmortgageProperty } = useGame();
  const isOpen = activeModal === 'propertyManager';

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const myTiles = gameState.board.filter((t) => t.ownerId === playerId);
  const isMyTurn = Boolean(gameState.players[gameState.currentTurnIndex]?.id === playerId && gameState.status !== 'GAME_OVER' && gameState.status !== 'LOBBY');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Моя недвижимость ({myTiles.length})
            </DialogTitle>
            {!isMyTurn && (
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                ⏳ Улучшения только в свой ход
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 my-2">
          {myTiles.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              У вас пока нет купленной недвижимости.<br />
              Бросайте кубики и выкупайте улицы! 🎲
            </div>
          ) : (
            myTiles.map((tile) => {
              const isMonopoly = tile.isMonopoly;
              const canBuild = isMonopoly && (tile.houses || 0) < 5 && !tile.isMortgaged;
              const canSell = (tile.houses || 0) > 0;
              const canMortgage = (tile.houses || 0) === 0 && !tile.isMortgaged;
              const canUnmortgage = tile.isMortgaged;

              return (
                <div
                  key={tile.id}
                  className="flex flex-col gap-2 p-3 rounded-xl bg-black/30 border border-white/5"
                >
                  {/* Title Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        <TileIconImage tile={tile} />
                      </div>
                      {tile.color && (
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tile.color }} />
                      )}
                      <span className="text-xs font-bold text-foreground">{tile.name}</span>
                      {isMonopoly && <Badge variant="gold" className="text-[9px] px-1.5 py-0">Монополия</Badge>}
                      {tile.isMortgaged && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">В залоге</Badge>}
                    </div>
                    <span className="text-xs font-black text-amber-400">
                      Аренда: {formatMoney(tile.currentRent || tile.rent || 0)}
                    </span>
                  </div>

                  {/* Houses Row & Action Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    {/* Houses indicator */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-muted-foreground mr-1">Дома:</span>
                      {tile.houses && tile.houses > 0 ? (
                        tile.houses === 5 ? (
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                            <div className="w-3.5 h-3.5"><PixelIcons.HOTEL /></div> Отель
                          </span>
                        ) : (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: tile.houses }).map((_, i) => (
                              <div key={i} className="w-3 h-3"><PixelIcons.HOUSE /></div>
                            ))}
                            <span className="text-xs font-bold ml-1">({tile.houses}/4)</span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {canBuild && tile.housePrice && (
                        <Button
                          variant="success"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => buildHouse(tile.id)}
                          disabled={!isMyTurn || !myPlayer || myPlayer.money < tile.housePrice}
                          title={!isMyTurn ? 'Строить улучшения можно только во время своего хода' : undefined}
                        >
                          <Plus className="w-3 h-3 mr-0.5" />
                          +Дом ({formatMoney(tile.housePrice)})
                        </Button>
                      )}

                      {canSell && tile.housePrice && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10 cursor-pointer active:scale-98"
                          onClick={() => sellHouse(tile.id)}
                        >
                          <Minus className="w-3 h-3 mr-0.5" />
                          Разрушить (+{formatMoney(Math.floor(tile.housePrice / 2))})
                        </Button>
                      )}

                      {canMortgage && tile.mortgageValue && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => mortgageProperty(tile.id)}
                        >
                          <Landmark className="w-3 h-3 mr-0.5" />
                          Залог (+{formatMoney(tile.mortgageValue)})
                        </Button>
                      )}

                      {canUnmortgage && tile.mortgageValue && (
                        <Button
                          variant="gold"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => unmortgageProperty(tile.id)}
                          disabled={!myPlayer || myPlayer.money < Math.round(tile.mortgageValue * 1.1)}
                        >
                          <Unlock className="w-3 h-3 mr-0.5" />
                          Выкуп ({formatMoney(Math.round(tile.mortgageValue * 1.1))})
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-white/10">
          <Button variant="default" className="w-full" onClick={closeModal}>
            Готово / Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
