import React from 'react';
import { TileData, PlayerData } from '@/types/game';
import { TileIconImage } from '@/lib/pixelIcons';
import { PetAvatar } from '@/components/common/PetAvatar';
import { cn, formatMoney } from '@/lib/utils';

interface BoardTileProps {
  tile: TileData;
  players: PlayerData[];
  currentPlayerId: string | null;
  totalTiles?: number;
  animatedPositions?: Record<string, number>;
  movingPlayers?: Record<string, boolean>;
  onClick: (tile: TileData) => void;
}

export type TileSide = 'bottom' | 'left' | 'top' | 'right' | 'corner-br' | 'corner-bl' | 'corner-tl' | 'corner-tr';

/**
 * Clockwise Board Layout starting from Bottom-Left (Tile 0):
 * - Tile 0: Bottom-Left (START) -> corner-bl
 * - Tiles 1..9: Left column going UP -> left
 * - Tile 10: Top-Left (JAIL) -> corner-tl
 * - Tiles 11..19: Top row going RIGHT -> top
 * - Tile 20: Top-Right (FREE PARKING) -> corner-tr
 * - Tiles 21..29: Right column going DOWN -> right
 * - Tile 30: Bottom-Right (GO TO JAIL) -> corner-br
 * - Tiles 31..39: Bottom row going LEFT -> bottom
 */
export function getTileSide(index: number, totalTiles: number = 40): TileSide {
  if (totalTiles === 40) {
    if (index === 0) return 'corner-bl';
    if (index > 0 && index < 10) return 'left';
    if (index === 10) return 'corner-tl';
    if (index > 10 && index < 20) return 'top';
    if (index === 20) return 'corner-tr';
    if (index > 20 && index < 30) return 'right';
    if (index === 30) return 'corner-br';
    return 'bottom';
  } else {
    // 24 tiles (Blitz)
    if (index === 0) return 'corner-bl';
    if (index > 0 && index < 6) return 'left';
    if (index === 6) return 'corner-tl';
    if (index > 6 && index < 12) return 'top';
    if (index === 12) return 'corner-tr';
    if (index > 12 && index < 18) return 'right';
    if (index === 18) return 'corner-br';
    return 'bottom';
  }
}

export function getTileGridArea(index: number, totalTiles: number = 40): { gridRow: string; gridColumn: string } {
  if (totalTiles === 40) {
    // 1. Bottom-Left Corner: START (Tile 0)
    if (index === 0) {
      return { gridRow: '11 / 12', gridColumn: '1 / 2' };
    }
    // 2. Left Column going UP: Tiles 1 to 9 (Rows 10 down to 2)
    else if (index >= 1 && index <= 9) {
      const row = 11 - index;
      return { gridRow: `${row} / ${row + 1}`, gridColumn: '1 / 2' };
    }
    // 3. Top-Left Corner: JAIL (Tile 10)
    else if (index === 10) {
      return { gridRow: '1 / 2', gridColumn: '1 / 2' };
    }
    // 4. Top Row going RIGHT: Tiles 11 to 19 (Cols 2 to 10)
    else if (index >= 11 && index <= 19) {
      const col = index - 10 + 1;
      return { gridRow: '1 / 2', gridColumn: `${col} / ${col + 1}` };
    }
    // 5. Top-Right Corner: FREE PARKING (Tile 20)
    else if (index === 20) {
      return { gridRow: '1 / 2', gridColumn: '11 / 12' };
    }
    // 6. Right Column going DOWN: Tiles 21 to 29 (Rows 2 to 10)
    else if (index >= 21 && index <= 29) {
      const row = index - 20 + 1;
      return { gridRow: `${row} / ${row + 1}`, gridColumn: '11 / 12' };
    }
    // 7. Bottom-Right Corner: GO TO JAIL (Tile 30)
    else if (index === 30) {
      return { gridRow: '11 / 12', gridColumn: '11 / 12' };
    }
    // 8. Bottom Row going LEFT: Tiles 31 to 39 (Cols 10 down to 2)
    else if (index >= 31 && index <= 39) {
      const col = 11 - (index - 30);
      return { gridRow: '11 / 12', gridColumn: `${col} / ${col + 1}` };
    }
    return { gridRow: '11 / 12', gridColumn: '1 / 2' };
  }

  // 7x7 Grid Layout for blitz 24 tiles (0..23) Clockwise from Bottom-Left
  if (index === 0) {
    return { gridRow: '7 / 8', gridColumn: '1 / 2' };
  } else if (index >= 1 && index <= 5) {
    const row = 7 - index;
    return { gridRow: `${row} / ${row + 1}`, gridColumn: '1 / 2' };
  } else if (index === 6) {
    return { gridRow: '1 / 2', gridColumn: '1 / 2' };
  } else if (index >= 7 && index <= 11) {
    const col = index - 6 + 1;
    return { gridRow: '1 / 2', gridColumn: `${col} / ${col + 1}` };
  } else if (index === 12) {
    return { gridRow: '1 / 2', gridColumn: '7 / 8' };
  } else if (index >= 13 && index <= 17) {
    const row = index - 12 + 1;
    return { gridRow: `${row} / ${row + 1}`, gridColumn: '7 / 8' };
  } else if (index === 18) {
    return { gridRow: '7 / 8', gridColumn: '7 / 8' };
  } else if (index >= 19 && index <= 23) {
    const col = 7 - (index - 18);
    return { gridRow: '7 / 8', gridColumn: `${col} / ${col + 1}` };
  }

  return { gridRow: '7 / 8', gridColumn: '1 / 2' };
}

export const BoardTile: React.FC<BoardTileProps> = ({
  tile,
  players,
  currentPlayerId,
  totalTiles = 40,
  animatedPositions,
  movingPlayers,
  onClick,
}) => {
  const gridPos = getTileGridArea(tile.id, totalTiles);
  const side = getTileSide(tile.id, totalTiles);

  const playersOnTile = players.filter((p) => {
    if (p.isBankrupt) return false;
    const currentPos =
      animatedPositions && animatedPositions[p.id] !== undefined
        ? animatedPositions[p.id]
        : p.position;
    return currentPos === tile.id;
  });

  const owner = tile.ownerId ? players.find((p) => p.id === tile.ownerId) : null;
  const ownerHex = owner?.color?.hex;

  // Custom Corner Tiles Rendering
  if (side.startsWith('corner')) {
    return (
      <div
        onClick={() => onClick(tile)}
        className="relative flex flex-col items-center justify-between p-1.5 rounded-xl bg-[#12162a] border border-white/15 hover:border-indigo-400/70 select-none cursor-pointer transition-all duration-200 shadow-md hover:z-30 hover:scale-[1.03] overflow-hidden"
        style={{
          gridRow: gridPos.gridRow,
          gridColumn: gridPos.gridColumn,
        }}
      >
        {/* START Corner (Bottom-Left: tile 0) */}
        {side === 'corner-bl' && (
          <div className="w-full h-full flex flex-col items-center justify-between p-1 bg-gradient-to-br from-indigo-950/60 to-[#12162a]">
            <span className="text-xs sm:text-sm font-black tracking-wider text-indigo-300 uppercase">
              Старт
            </span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center my-auto">
              <span className="text-3xl sm:text-4xl drop-shadow-md">🏁</span>
            </div>
            <span className="text-sm sm:text-base font-black text-emerald-400">
              +$200
            </span>
          </div>
        )}

        {/* JAIL Corner (Top-Left: tile 10 or 6) */}
        {side === 'corner-tl' && (
          <div className="w-full h-full flex flex-col items-center justify-between p-1 bg-[#12162a]">
            <span className="text-[10px] sm:text-xs font-black text-muted-foreground tracking-tight self-start px-0.5">
              ПРОСТО
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center my-auto shadow-inner">
              <span className="text-2xl sm:text-3xl">⛓️</span>
            </div>
            <div className="w-full flex items-center justify-between px-0.5">
              <span className="text-xs sm:text-sm font-black text-amber-400">
                Тюрьма
              </span>
              <span className="text-[9px] sm:text-[10.5px] text-muted-foreground font-bold">
                ВИЗИТ
              </span>
            </div>
          </div>
        )}

        {/* FREE PARKING Corner (Top-Right: tile 20 or 12) */}
        {side === 'corner-tr' && (
          <div className="w-full h-full flex flex-col items-center justify-between p-1 bg-gradient-to-br from-blue-950/40 to-[#12162a]">
            <span className="text-[11px] sm:text-xs font-black text-blue-300 uppercase text-center leading-tight">
              Парковка
            </span>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-600 border border-white/40 flex items-center justify-center shadow-lg my-auto text-white font-black text-base sm:text-lg">
              P
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-bold">
              Отдых
            </span>
          </div>
        )}

        {/* GO TO JAIL Corner (Bottom-Right: tile 30 or 18) */}
        {side === 'corner-br' && (
          <div className="w-full h-full flex flex-col items-center justify-between p-1 bg-gradient-to-br from-red-950/40 to-[#12162a]">
            <span className="text-[11px] sm:text-xs font-black text-red-300 uppercase text-center leading-tight">
              В тюрьму
            </span>
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center my-auto">
              <span className="text-2xl sm:text-3xl">👮‍♂️</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-red-400">
              Арест
            </span>
          </div>
        )}

        {/* Player Tokens on corner */}
        {playersOnTile.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 z-30 pointer-events-none p-1 flex-wrap content-center">
            {playersOnTile.map((player) => {
              const isMoving = Boolean(movingPlayers?.[player.id]);
              const anim = isMoving ? 'jump' : player.inJail ? 'sleep' : (currentPlayerId === player.id ? 'happy' : 'idle');
              const playerHex = player.color?.hex || '#3b82f6';
              const isBlitz = totalTiles === 24;
              return (
                <div
                  key={player.id}
                  className="relative flex flex-col items-center justify-center filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] transition-transform animate-in fade-in zoom-in-75 duration-200"
                  title={`${player.name}`}
                >
                  <PetAvatar
                    characterId={player.characterId}
                    anim={anim}
                    size="lg"
                    showPedestal={true}
                    pedestalColor={playerHex}
                    className={cn(
                      'transition-transform',
                      isBlitz ? 'scale-120 sm:scale-135' : 'scale-100 sm:scale-115'
                    )}
                  />
                  <div
                    className={cn(
                      'mt-[-4px] px-2 py-0.5 rounded-full font-black text-white leading-none truncate shadow-md border border-white/60',
                      isBlitz
                        ? 'text-[10px] sm:text-[12px] max-w-[65px] sm:max-w-[80px]'
                        : 'text-[9px] sm:text-[11px] max-w-[56px] sm:max-w-[70px]'
                    )}
                    style={{ backgroundColor: playerHex, boxShadow: `0 0 10px ${playerHex}aa` }}
                  >
                    {player.name || 'Игрок'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Special Non-Property Tiles (Шанс / Казна / Налог)
  const isSpecial = tile.type !== 'property';

  const isBottom = side === 'bottom';
  const isTop = side === 'top';
  const isLeft = side === 'left';
  const isRight = side === 'right';

  return (
    <div
      onClick={() => onClick(tile)}
      className={cn(
        'relative flex select-none cursor-pointer transition-all duration-200 shadow-sm hover:z-30 hover:scale-[1.06] hover:shadow-xl overflow-hidden rounded-xl',
        isBottom && 'flex-col justify-between p-1',
        isTop && 'flex-col justify-between p-1',
        isLeft && 'flex-row items-stretch justify-between p-0.5',
        isRight && 'flex-row items-stretch justify-between p-0.5',
        ownerHex ? 'border-2' : 'border border-white/10 hover:border-indigo-400/50',
        tile.isMortgaged && 'opacity-55 saturate-0'
      )}
      style={{
        gridRow: gridPos.gridRow,
        gridColumn: gridPos.gridColumn,
        backgroundColor: ownerHex
          ? `color-mix(in srgb, ${ownerHex} 22%, #121528)`
          : isSpecial && tile.type === 'chance'
          ? '#21153b'
          : isSpecial && tile.type === 'chest'
          ? '#15213b'
          : '#121528',
        borderColor: ownerHex ? ownerHex : tile.color && !isSpecial ? `${tile.color}44` : undefined,
        boxShadow: ownerHex
          ? `0 0 12px ${ownerHex}55, inset 0 0 10px ${ownerHex}22`
          : tile.color && !isSpecial
          ? `inset 0 0 14px ${tile.color}1c`
          : undefined,
      }}
      title={`${tile.name} ${tile.price ? `($${tile.price})` : ''}`}
    >
      {/* 1. LEFT COL TILES (1 to 9): Vertical content + Color Stripe Right (facing center) */}
      {isLeft && (
        <>
          <div className="flex-1 flex flex-col items-center justify-between min-w-0 h-full p-0.5">
            <span className="font-black leading-tight tracking-tight text-white text-center w-full truncate text-[11px] sm:text-[13px]">
              {tile.name}
            </span>
            <div className="flex-1 flex items-center justify-center min-h-0 w-full my-auto p-0.5">
              {tile.type === 'chance' ? (
                <span className="text-2xl sm:text-3xl font-black text-purple-400 drop-shadow-[0_0_8px_#c084fc]">?</span>
              ) : tile.type === 'chest' ? (
                <span className="text-xl sm:text-2xl">🎁</span>
              ) : (
                <TileIconImage tile={tile} className="w-full h-full max-w-[36px] max-h-[36px] sm:max-w-[42px] sm:max-h-[42px] object-contain drop-shadow-md" />
              )}
            </div>
            {(tile.price || tile.amount || tile.bonus) && (
              <div className="flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] shrink-0" />
                <span className="font-black text-xs sm:text-[13.5px] text-amber-300 leading-none">
                  {tile.price || tile.amount || tile.bonus}
                </span>
              </div>
            )}
          </div>

          {tile.color && !isSpecial && (
            <div
              className="h-full w-2.5 sm:w-3.5 rounded-r-md shrink-0 relative transition-all duration-300"
              style={{
                backgroundColor: tile.color,
                boxShadow: `0 0 10px ${tile.color}dd, 0 0 20px ${tile.color}77, inset 0 1px 2px rgba(255,255,255,0.5)`,
              }}
            >
              {Boolean(tile.houses && tile.houses > 0) ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                  {tile.houses === 5 ? (
                    <div className="w-1.5 h-1.5 rounded-xs bg-red-500 ring-1 ring-white shadow-[0_0_6px_#ef4444]" />
                  ) : (
                    Array.from({ length: tile.houses || 0 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-xs bg-emerald-400 ring-1 ring-white shadow-[0_0_4px_#34d399]" />
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* 2. TOP ROW TILES (11 to 19): Name Top -> Icon -> Price -> Color Stripe Bottom (facing center) */}
      {isTop && (
        <>
          <span className="font-black leading-tight tracking-tight text-white text-center w-full text-[11px] sm:text-[13px] truncate pt-0.5 px-0.5">
            {tile.name}
          </span>
          <div className="flex-1 flex items-center justify-center my-auto min-h-0 w-full p-0.5">
            {tile.type === 'chance' ? (
              <span className="text-2xl sm:text-3xl font-black text-purple-400 drop-shadow-[0_0_8px_#c084fc]">?</span>
            ) : tile.type === 'chest' ? (
              <span className="text-xl sm:text-2xl">🎁</span>
            ) : (
              <TileIconImage tile={tile} className="w-full h-full max-w-[36px] max-h-[36px] sm:max-w-[44px] sm:max-h-[44px] object-contain drop-shadow-md" />
            )}
          </div>
          {(tile.price || tile.amount || tile.bonus) && (
            <div className="flex items-center justify-center gap-1 pb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] shrink-0" />
              <span className="font-black text-xs sm:text-[13.5px] text-amber-300 leading-none">
                {tile.price || tile.amount || tile.bonus}
              </span>
            </div>
          )}
          {tile.color && !isSpecial && (
            <div
              className="w-full h-2.5 sm:h-3.5 rounded-b-md shrink-0 relative transition-all duration-300"
              style={{
                backgroundColor: tile.color,
                boxShadow: `0 0 10px ${tile.color}dd, 0 0 20px ${tile.color}77, inset 0 1px 2px rgba(255,255,255,0.5)`,
              }}
            >
              {Boolean(tile.houses && tile.houses > 0) ? (
                <div className="w-full h-full flex items-center justify-center gap-0.5">
                  {tile.houses === 5 ? (
                    <div className="w-1.5 h-1.5 rounded-xs bg-red-500 ring-1 ring-white shadow-[0_0_6px_#ef4444]" />
                  ) : (
                    Array.from({ length: tile.houses || 0 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-xs bg-emerald-400 ring-1 ring-white shadow-[0_0_4px_#34d399]" />
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* 3. RIGHT COL TILES (21 to 29): Color Stripe Left (facing center) + Vertical content */}
      {isRight && (
        <>
          {tile.color && !isSpecial && (
            <div
              className="h-full w-2.5 sm:w-3.5 rounded-l-md shrink-0 relative transition-all duration-300"
              style={{
                backgroundColor: tile.color,
                boxShadow: `0 0 10px ${tile.color}dd, 0 0 20px ${tile.color}77, inset 0 1px 2px rgba(255,255,255,0.5)`,
              }}
            >
              {Boolean(tile.houses && tile.houses > 0) ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                  {tile.houses === 5 ? (
                    <div className="w-1.5 h-1.5 rounded-xs bg-red-500 ring-1 ring-white shadow-[0_0_6px_#ef4444]" />
                  ) : (
                    Array.from({ length: tile.houses || 0 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-xs bg-emerald-400 ring-1 ring-white shadow-[0_0_4px_#34d399]" />
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-between min-w-0 h-full p-0.5">
            <span className="font-black leading-tight tracking-tight text-white text-center w-full truncate text-[11px] sm:text-[13px]">
              {tile.name}
            </span>
            <div className="flex-1 flex items-center justify-center min-h-0 w-full my-auto p-0.5">
              {tile.type === 'chance' ? (
                <span className="text-2xl sm:text-3xl font-black text-purple-400 drop-shadow-[0_0_8px_#c084fc]">?</span>
              ) : tile.type === 'chest' ? (
                <span className="text-xl sm:text-2xl">🎁</span>
              ) : (
                <TileIconImage tile={tile} className="w-full h-full max-w-[36px] max-h-[36px] sm:max-w-[42px] sm:max-h-[42px] object-contain drop-shadow-md" />
              )}
            </div>
            {(tile.price || tile.amount || tile.bonus) && (
              <div className="flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] shrink-0" />
                <span className="font-black text-xs sm:text-[13.5px] text-amber-300 leading-none">
                  {tile.price || tile.amount || tile.bonus}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. BOTTOM ROW TILES (31 to 39): Color Stripe Top (facing center) -> Price -> Icon -> Name Bottom */}
      {isBottom && (
        <>
          {tile.color && !isSpecial && (
            <div
              className="w-full h-2.5 sm:h-3.5 rounded-t-md shrink-0 relative transition-all duration-300"
              style={{
                backgroundColor: tile.color,
                boxShadow: `0 0 10px ${tile.color}dd, 0 0 20px ${tile.color}77, inset 0 1px 2px rgba(255,255,255,0.5)`,
              }}
            >
              {Boolean(tile.houses && tile.houses > 0) ? (
                <div className="w-full h-full flex items-center justify-center gap-0.5">
                  {tile.houses === 5 ? (
                    <div className="w-1.5 h-1.5 rounded-xs bg-red-500 ring-1 ring-white shadow-[0_0_6px_#ef4444]" />
                  ) : (
                    Array.from({ length: tile.houses || 0 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-xs bg-emerald-400 ring-1 ring-white shadow-[0_0_4px_#34d399]" />
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )}
          {(tile.price || tile.amount || tile.bonus) && (
            <div className="flex items-center justify-center gap-1 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] shrink-0" />
              <span className="font-black text-xs sm:text-[13.5px] text-amber-300 leading-none">
                {tile.price || tile.amount || tile.bonus}
              </span>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center my-auto min-h-0 w-full p-0.5">
            {tile.type === 'chance' ? (
              <span className="text-2xl sm:text-3xl font-black text-purple-400 drop-shadow-[0_0_8px_#c084fc]">?</span>
            ) : tile.type === 'chest' ? (
              <span className="text-xl sm:text-2xl">🎁</span>
            ) : (
              <TileIconImage tile={tile} className="w-full h-full max-w-[36px] max-h-[36px] sm:max-w-[44px] sm:max-h-[44px] object-contain drop-shadow-md" />
            )}
          </div>
          <span className="font-black leading-tight tracking-tight text-white text-center w-full text-[11px] sm:text-[13px] truncate pb-0.5 px-0.5">
            {tile.name}
          </span>
        </>
      )}

      {/* Mortgage Stamp Overlay */}
      {tile.isMortgaged && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-[1px] rounded-md z-10">
          <span className="bg-red-950/90 text-red-300 border border-red-500 font-black text-[10px] px-1.5 py-0.5 rounded tracking-tighter shadow-md select-none transform -rotate-12">
            ЗАЛОГ
          </span>
        </div>
      )}

      {/* Standing Player Tokens on Tile */}
      {playersOnTile.length > 0 && (
        <div
          className={cn(
            'absolute z-30 pointer-events-none flex items-center justify-center gap-1 flex-wrap',
            isBottom && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            isTop && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            isLeft && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col',
            isRight && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col'
          )}
        >
          {playersOnTile.map((player) => {
            const isMoving = Boolean(movingPlayers?.[player.id]);
            const anim = isMoving ? 'jump' : player.inJail ? 'sleep' : (currentPlayerId === player.id ? 'happy' : 'idle');
            const playerHex = player.color?.hex || '#3b82f6';
            const isBlitz = totalTiles === 24;
            return (
              <div
                key={player.id}
                className="relative flex flex-col items-center justify-center filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.9)] transition-transform animate-in fade-in zoom-in-75 duration-200"
                title={`${player.name}`}
              >
                <PetAvatar
                  characterId={player.characterId}
                  anim={anim}
                  size={isBlitz ? 'lg' : 'md'}
                  showPedestal={true}
                  pedestalColor={playerHex}
                  className={cn(
                    'origin-center transition-transform',
                    isBlitz ? 'scale-110 sm:scale-125' : 'scale-100 sm:scale-115'
                  )}
                />
                <div
                  className={cn(
                    'mt-[-4px] px-1.5 py-0.5 rounded-full font-black text-white leading-none truncate shadow-md border border-white/60',
                    isBlitz
                      ? 'text-[9px] sm:text-[10.5px] max-w-[52px] sm:max-w-[66px]'
                      : 'text-[8px] sm:text-[9.5px] max-w-[42px] sm:max-w-[54px]'
                  )}
                  style={{ backgroundColor: playerHex, boxShadow: `0 0 8px ${playerHex}aa` }}
                >
                  {player.name || 'Игрок'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
