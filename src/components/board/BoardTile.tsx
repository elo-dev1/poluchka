import React from "react";
import { useGame } from "@/context/GameContext";
import { TileData, PlayerData } from "@/types/game";
import { TileIconImage } from "@/lib/pixelIcons";
import { PetAvatar } from "@/components/common/PetAvatar";
import { cn } from "@/lib/utils";

interface BoardTileProps {
  tile: TileData;
  players: PlayerData[];
  currentPlayerId: string | null;
  totalTiles?: number;
  animatedPositions?: Record<string, number>;
  movingPlayers?: Record<string, boolean>;
  onClick: (tile: TileData) => void;
  isSelected?: boolean;
}

type TileSide =
  | "bottom"
  | "left"
  | "top"
  | "right"
  | "corner-br"
  | "corner-bl"
  | "corner-tl"
  | "corner-tr";

function getTileSide(index: number, totalTiles: number = 40): TileSide {
  if (totalTiles === 40) {
    if (index === 0) return "corner-bl";
    if (index > 0 && index < 10) return "left";
    if (index === 10) return "corner-tl";
    if (index > 10 && index < 20) return "top";
    if (index === 20) return "corner-tr";
    if (index > 20 && index < 30) return "right";
    if (index === 30) return "corner-br";
    return "bottom";
  } else {
    if (index === 0) return "corner-bl";
    if (index > 0 && index < 6) return "left";
    if (index === 6) return "corner-tl";
    if (index > 6 && index < 12) return "top";
    if (index === 12) return "corner-tr";
    if (index > 12 && index < 18) return "right";
    if (index === 18) return "corner-br";
    return "bottom";
  }
}

function getTileGridArea(
  index: number,
  totalTiles: number = 40,
): { gridRow: string; gridColumn: string } {
  if (totalTiles === 40) {
    if (index === 0) {
      return { gridRow: "11 / 12", gridColumn: "1 / 2" };
    } else if (index >= 1 && index <= 9) {
      const row = 11 - index;
      return { gridRow: `${row} / ${row + 1}`, gridColumn: "1 / 2" };
    } else if (index === 10) {
      return { gridRow: "1 / 2", gridColumn: "1 / 2" };
    } else if (index >= 11 && index <= 19) {
      const col = index - 10 + 1;
      return { gridRow: "1 / 2", gridColumn: `${col} / ${col + 1}` };
    } else if (index === 20) {
      return { gridRow: "1 / 2", gridColumn: "11 / 12" };
    } else if (index >= 21 && index <= 29) {
      const row = index - 20 + 1;
      return { gridRow: `${row} / ${row + 1}`, gridColumn: "11 / 12" };
    } else if (index === 30) {
      return { gridRow: "11 / 12", gridColumn: "11 / 12" };
    } else if (index >= 31 && index <= 39) {
      const col = 11 - (index - 30);
      return { gridRow: "11 / 12", gridColumn: `${col} / ${col + 1}` };
    }
    return { gridRow: "11 / 12", gridColumn: "1 / 2" };
  }

  if (index === 0) {
    return { gridRow: "7 / 8", gridColumn: "1 / 2" };
  } else if (index >= 1 && index <= 5) {
    const row = 7 - index;
    return { gridRow: `${row} / ${row + 1}`, gridColumn: "1 / 2" };
  } else if (index === 6) {
    return { gridRow: "1 / 2", gridColumn: "1 / 2" };
  } else if (index >= 7 && index <= 11) {
    const col = index - 6 + 1;
    return { gridRow: "1 / 2", gridColumn: `${col} / ${col + 1}` };
  } else if (index === 12) {
    return { gridRow: "1 / 2", gridColumn: "7 / 8" };
  } else if (index >= 13 && index <= 17) {
    const row = index - 12 + 1;
    return { gridRow: `${row} / ${row + 1}`, gridColumn: "7 / 8" };
  } else if (index === 18) {
    return { gridRow: "7 / 8", gridColumn: "7 / 8" };
  } else if (index >= 19 && index <= 23) {
    const col = 7 - (index - 18);
    return { gridRow: "7 / 8", gridColumn: `${col} / ${col + 1}` };
  }

  return { gridRow: "7 / 8", gridColumn: "1 / 2" };
}

interface SpecialTileVisualConfig {
  podClass: string;
  textColor: string;
  priceColor: string;
}

function getSpecialTileVisualConfig(
  tile: TileData,
  isNoir?: boolean,
  isSoviet?: boolean,
): SpecialTileVisualConfig | null {
  const type = tile.type;
  const name = (tile.name || "").toLowerCase();
  const isSpecial =
    type === "chance" ||
    type === "chest" ||
    type === "tax" ||
    type === "parking" ||
    type === "free_parking" ||
    name.includes("шанс") ||
    name.includes("казна") ||
    name.includes("налог") ||
    name.includes("сбор");

  if (!isSpecial) return null;

  const podClass = isNoir
    ? "bg-[#e8d5b5] border border-[#c4b18f] shadow-xs"
    : isSoviet
      ? "bg-[#FAF3E3] border border-[#D4C4A8] shadow-xs"
      : "bg-white border border-slate-200/90 shadow-[0_2px_5px_rgba(0,0,0,0.06)]";

  const isTax =
    type === "tax" || name.includes("налог") || name.includes("сбор");

  return {
    podClass,
    textColor: isNoir
      ? "font-noir-body text-[#0a0806]"
      : isSoviet
        ? "tile-name"
        : "text-slate-900 font-black tracking-wide",
    priceColor: isTax
      ? "text-red-700 font-black"
      : isNoir
        ? "font-noir-body text-[#0a0806]"
        : isSoviet
          ? "tile-price"
          : "text-slate-700 font-bold",
  };
}

export const BoardTile: React.FC<BoardTileProps> = ({
  tile,
  players,
  currentPlayerId,
  totalTiles = 40,
  animatedPositions,
  movingPlayers,
  onClick,
  isSelected,
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

  const { theme, playerId, gameState } = useGame();
  const isSoviet = theme === "soviet";
  const isNoir = theme === "noir";
  const isBlitz =
    totalTiles === 24 ||
    gameState?.mode === "blitz" ||
    gameState?.boardSize === 24;

  const ownerPlayer = tile.ownerId
    ? players.find((p) => p.id === tile.ownerId)
    : null;
  const isOwned = Boolean(ownerPlayer);
  const isOwnedByMe = Boolean(tile.ownerId && tile.ownerId === playerId);
  const myPlayer = players.find((p) => p.id === playerId);
  const isTeammate = Boolean(
    !isOwnedByMe &&
    ownerPlayer &&
    ownerPlayer.teamId &&
    myPlayer &&
    ownerPlayer.teamId === myPlayer.teamId,
  );

  const getPlayerHex = (player: PlayerData) => {
    if (player.teamId === "team_red") return "#FF5252";
    if (player.teamId === "team_blue") return "#448AFF";
    return (
      player.color?.hex ||
      (isNoir ? "#b8a890" : isSoviet ? "#38bdf8" : "#10b981")
    );
  };

  const ownerHex = ownerPlayer ? getPlayerHex(ownerPlayer) : null;

  // Custom Corner Tiles Rendering
  if (side.startsWith("corner")) {
    const getCornerStyle = () => {
      if (isNoir) return { backgroundColor: "#f5e6c8", borderColor: "#1a1410" };
      if (isSoviet)
        return { backgroundColor: "#EDE0C4", borderColor: "#B8A88A" };
      return { backgroundColor: "#FAF7EE", borderColor: "#CBD5E1" };
    };

    return (
      <div
        onClick={() => onClick(tile)}
        className={cn(
          "flex flex-col items-center justify-between p-1 sm:p-2 select-none cursor-pointer overflow-hidden relative",
          isNoir
            ? "noir-corner-tile"
            : isSoviet
              ? "soviet-corner-tile"
              : "classic-tile",
          isSelected &&
            (isNoir
              ? "ring-2 ring-inset ring-[#d4a647] bg-[#1a1410]"
              : isSoviet
                ? "ring-2 ring-inset ring-[#38bdf8] bg-[#F5ECDA]"
                : "ring-2 ring-inset ring-slate-500 bg-slate-50"),
        )}
        style={{
          gridRow: gridPos.gridRow,
          gridColumn: gridPos.gridColumn,
          ...getCornerStyle(),
        }}
      >
        {/* START Corner */}
        {side === "corner-bl" && (
          <div className="w-full h-full flex flex-col items-center justify-between relative py-0.5">
            <span
              className={cn(
                "font-bold uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wide text-center",
                isNoir
                  ? "font-noir-title text-[#0a0806]"
                  : isSoviet
                    ? "font-soviet text-[#1A0E00]"
                    : "font-sans text-slate-900 font-black",
              )}
            >
              {isNoir
                ? "БЮРО ДЕТЕКТИВА"
                : isSoviet
                  ? "БАЙКОНУР"
                  : tile.name || "СТАРТ"}
            </span>
            {isNoir ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "rotate-45 transform -translate-x-1 translate-y-1 my-auto drop-shadow-sm")}>
                🕵️‍♂️
              </div>
            ) : isSoviet ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "rotate-45 transform -translate-x-1 translate-y-1 my-auto drop-shadow-sm")}>
                🚀
              </div>
            ) : (
              <div className={cn(
                isBlitz
                  ? "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  : "w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-16 lg:h-16",
                "flex items-center justify-center my-auto transition-transform hover:scale-105"
              )}>
                <TileIconImage
                  tile={tile}
                  className="w-full h-full object-contain filter contrast-125 drop-shadow-md"
                />
              </div>
            )}
            <div className="flex flex-col items-center leading-none">
              <span
                className={cn(
                  "font-bold text-[8.5px] sm:text-[9.5px] md:text-[11px]",
                  isNoir
                    ? "font-noir-body text-[#8b0000]"
                    : isSoviet
                      ? "font-space text-[#CC1111]"
                      : "font-sans bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded shadow-xs",
                )}
              >
                {isNoir ? "+$200" : isSoviet ? "+200 кР" : "+$200"}
              </span>
            </div>
          </div>
        )}

        {/* JAIL Corner */}
        {side === "corner-tl" && (
          <div className="w-full h-full flex flex-col items-center justify-between relative py-0.5">
            <span
              className={cn(
                "font-bold uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wide text-center pt-0.5",
                isNoir
                  ? "font-noir-title text-[#0a0806]"
                  : isSoviet
                    ? "font-soviet text-[#1A0E00]"
                    : "font-sans text-slate-900 font-black",
              )}
            >
              {isNoir
                ? "КАТАЛАЖКА"
                : isSoviet
                  ? "ВАН АЛЛЕН"
                  : tile.name || "ШТРАФСТОЯНКА"}
            </span>
            {isNoir ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "my-auto drop-shadow-sm")}>
                ⚖️
              </div>
            ) : isSoviet ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "my-auto drop-shadow-sm")}>
                ⚠
              </div>
            ) : (
              <div className={cn(
                isBlitz
                  ? "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  : "w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-16 lg:h-16",
                "flex items-center justify-center my-auto transition-transform hover:scale-105"
              )}>
                <TileIconImage
                  tile={tile}
                  className="w-full h-full object-contain filter contrast-125 drop-shadow-md"
                />
              </div>
            )}
            <span
              className={cn(
                "font-bold text-[8px] sm:text-[9px] md:text-[10px] tracking-widest pb-0.5",
                isNoir
                  ? "font-noir-body text-[#1a1410]"
                  : isSoviet
                    ? "font-space text-[#1A0E00]"
                    : "font-sans bg-slate-700 text-white font-bold text-[7.5px] sm:text-[8.5px] px-1.5 py-0.5 rounded shadow-xs",
              )}
            >
              {isNoir ? "ВИЗИТ" : isSoviet ? "ИЗОЛЯЦИЯ" : "ПОСЕЩЕНИЕ"}
            </span>
          </div>
        )}

        {/* FREE PARKING Corner */}
        {side === "corner-tr" && (
          <div className="w-full h-full flex flex-col items-center justify-between relative py-0.5">
            <span
              className={cn(
                "font-bold uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wide text-center leading-none pt-0.5",
                isNoir
                  ? "font-noir-title text-[#0a0806]"
                  : isSoviet
                    ? "font-soviet text-[#1A0E00]"
                    : "font-sans text-slate-900 font-black",
              )}
            >
              {isNoir
                ? "ТЁМНЫЙ ПЕРЕУЛОК"
                : isSoviet
                  ? "ГЕОСТАЦИОНАР"
                  : tile.name || "ПИТ-СТОП"}
            </span>
            {isNoir ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "my-auto drop-shadow-sm")}>
                🧥
              </div>
            ) : isSoviet ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "my-auto drop-shadow-sm")}>
                🛸
              </div>
            ) : (
              <div className={cn(
                isBlitz
                  ? "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  : "w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-16 lg:h-16",
                "flex items-center justify-center my-auto transition-transform hover:scale-105"
              )}>
                <TileIconImage
                  tile={tile}
                  className="w-full h-full object-contain filter contrast-125 drop-shadow-md"
                />
              </div>
            )}
            <span
              className={cn(
                "font-bold text-[8px] sm:text-[9px] md:text-[10px] tracking-widest pb-0.5",
                isNoir
                  ? "font-noir-body text-[#0a0806]"
                  : isSoviet
                    ? "font-space text-[#004890]"
                    : "font-sans bg-slate-700 text-white font-bold text-[7.5px] sm:text-[8.5px] px-1.5 py-0.5 rounded shadow-xs",
              )}
            >
              {isNoir ? "ЗАСАДА" : isSoviet ? "ДРЕЙФ" : "ОТДЫХ"}
            </span>
          </div>
        )}

        {/* GO TO JAIL Corner */}
        {side === "corner-br" && (
          <div className="w-full h-full flex flex-col items-center justify-between relative py-0.5">
            <span
              className={cn(
                "font-bold uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wide text-center leading-tight pt-0.5",
                isNoir
                  ? "font-noir-title text-[#8b0000]"
                  : isSoviet
                    ? "font-soviet text-[#CC1111]"
                    : "font-sans text-slate-900 font-black",
              )}
            >
              {isNoir ? (
                <>
                  ОБЛАВА
                  <br />
                  АРЕСТ
                </>
              ) : isSoviet ? (
                <>
                  АВАРИЙНЫЙ
                  <br />
                  СХОД
                </>
              ) : tile.name ? (
                tile.name.toUpperCase()
              ) : (
                "ЭВАКУАЦИЯ"
              )}
            </span>
            {isNoir ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "my-auto drop-shadow-sm")}>
                🚓
              </div>
            ) : isSoviet ? (
              <div className={cn(isBlitz ? "text-5xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl", "my-auto drop-shadow-sm")}>
                🔻
              </div>
            ) : (
              <div className={cn(
                isBlitz
                  ? "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  : "w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-16 lg:h-16",
                "flex items-center justify-center my-auto transition-transform hover:scale-105"
              )}>
                <TileIconImage
                  tile={tile}
                  className="w-full h-full object-contain filter contrast-125 drop-shadow-md"
                />
              </div>
            )}
            <span
              className={cn(
                "font-bold text-[8px] sm:text-[9px] md:text-[10px] tracking-widest pb-0.5",
                isNoir
                  ? "font-noir-body text-[#8b0000]"
                  : isSoviet
                    ? "font-space text-[#CC1111]"
                    : "font-sans bg-red-600 text-white font-bold text-[7.5px] sm:text-[8.5px] px-1.5 py-0.5 rounded shadow-xs",
              )}
            >
              ШТРАФ
            </span>
          </div>
        )}

        {/* Player Tokens on corner */}
        {playersOnTile.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 z-30 pointer-events-none p-1 flex-wrap content-center">
            {playersOnTile.map((player) => {
              const isMoving = Boolean(movingPlayers?.[player.id]);
              const anim = isMoving
                ? "jump"
                : player.inJail
                  ? "sleep"
                  : currentPlayerId === player.id
                    ? "happy"
                    : "idle";
              const playerHex = getPlayerHex(player);
              const tokenSize = playersOnTile.length <= 2 ? "lg" : "md";
              return (
                <div
                  key={player.id}
                  className="relative flex flex-col items-center justify-center drop-shadow-md"
                >
                  <PetAvatar
                    characterId={player.characterId}
                    anim={anim}
                    size={tokenSize}
                    showPedestal={true}
                    pedestalColor={playerHex}
                    className={cn(
                      "transition-transform",
                      isMoving && "scale-125 z-40 -translate-y-2",
                    )}
                  />
                  <div
                    className="mt-[-2px] player-tag"
                    style={{ borderColor: playerHex, color: playerHex }}
                  >
                    {player.name || "Игрок"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Regular Tiles
  const isSpecial =
    tile.type === "chance" ||
    tile.type === "chest" ||
    tile.type === "tax" ||
    tile.type === "parking" ||
    tile.type === "free_parking" ||
    tile.type === "start" ||
    tile.type === "jail" ||
    tile.type === "go_to_jail";

  const specialVisual = getSpecialTileVisualConfig(tile, isNoir, isSoviet);
  const isBottom = side === "bottom";
  const isTop = side === "top";
  const isLeft = side === "left";
  const isRight = side === "right";

  return (
    <div
      onClick={() => onClick(tile)}
      className={cn(
        "relative flex cursor-pointer transition-colors overflow-hidden",
        isNoir ? "noir-tile" : isSoviet ? "soviet-tile" : "classic-tile",
        isSelected &&
          (isNoir
            ? "ring-2 ring-inset ring-[#d4a647] bg-[#1a1410]"
            : isSoviet
              ? "ring-2 ring-inset ring-[#38bdf8] bg-[#F5ECDA]"
              : "ring-2 ring-inset ring-slate-500 bg-slate-50"),
        isBottom && "flex-col justify-between",
        isTop && "flex-col-reverse justify-between",
        isLeft && "flex-row-reverse justify-between",
        isRight && "flex-row justify-between",
        tile.isMortgaged &&
          (isNoir
            ? "opacity-60 saturate-50 sepia"
            : isSoviet
              ? "tile-mortgaged"
              : "opacity-60 saturate-50"),
      )}
      style={{
        gridRow: gridPos.gridRow,
        gridColumn: gridPos.gridColumn,
        borderColor:
          isOwned && !isSpecial && ownerHex
            ? ownerHex
            : isNoir
              ? "#1a1410"
              : isSoviet
                ? "#B8A88A"
                : "#CBD5E1",
        borderWidth: isOwned && !isSpecial && ownerHex ? "2px" : undefined,
        backgroundColor:
          isOwned && !isSpecial && ownerHex
            ? isNoir
              ? `${ownerHex}22`
              : isSoviet
                ? `${ownerHex}22`
                : `${ownerHex}15`
            : isNoir
              ? "#f5e6c8"
              : isSoviet
                ? "#EDE0C4"
                : "#FAF7EE",
        backgroundImage:
          isOwned && !isSpecial && ownerHex
            ? `linear-gradient(135deg, ${ownerHex}25 0%, ${ownerHex}08 100%)`
            : undefined,
        boxShadow:
          isOwned && !isSpecial && ownerHex
            ? `inset 0 0 0 1px ${ownerHex}44, 0 1px 3px rgba(0,0,0,0.08)`
            : undefined,
      }}
    >
      {/* 1. Property Color Band (Center facing) */}
      {tile.color && !isSpecial ? (
        <div
          className={cn(
            "shrink-0 border-black/10",
            isBottom &&
              (isNoir
                ? "noir-tile-band-top w-full"
                : "soviet-tile-band-top w-full"),
            isTop &&
              (isNoir
                ? "noir-tile-band-bottom w-full"
                : "soviet-tile-band-bottom w-full"),
            isLeft &&
              (isNoir
                ? "noir-tile-band-right h-full"
                : "soviet-tile-band-right h-full"),
            isRight &&
              (isNoir
                ? "noir-tile-band-left h-full"
                : "soviet-tile-band-left h-full"),
          )}
          style={{ borderColor: tile.color }}
        >
          {Boolean(tile.houses && tile.houses > 0) && (
            <div
              className={cn(
                "flex items-center justify-center gap-[1.5px]",
                isBottom || isTop
                  ? "flex-row h-full -mt-1.5"
                  : "flex-col w-full -ml-1.5",
              )}
            >
              {tile.houses === 5 ? (
                isNoir ? (
                  <div className="text-[10px] leading-none" title="Штаб 🏛">
                    🏛
                  </div>
                ) : isSoviet ? (
                  <div
                    className="tile-hotel scale-110"
                    title="Орбитальный Комплекс МИР"
                  />
                ) : (
                  <div
                    className="w-3 h-2.5 bg-red-600 rounded-[1px] border border-red-800 shadow-xs"
                    title="Отель 🏨"
                  />
                )
              ) : (
                Array.from({ length: tile.houses || 0 }).map((_, i) =>
                  isNoir ? (
                    <div
                      key={i}
                      className="text-[8px] leading-none"
                      title="Явка 🏚"
                    >
                      🏚
                    </div>
                  ) : isSoviet ? (
                    <div
                      key={i}
                      className="tile-house scale-110"
                      title="Модуль связи"
                    />
                  ) : (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-600 rounded-[1px] border border-slate-800 shadow-xs"
                      title="Дом 🏠"
                    />
                  ),
                )
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "shrink-0",
            isBottom || isTop ? "h-1.5 w-full" : "w-1.5 h-full",
          )}
        />
      )}

      {/* 2. Content Container */}
      <div
        className={cn(
          "flex-1 flex min-w-0 min-h-0 overflow-hidden relative z-10",
          isBottom &&
            "flex-col items-center justify-between py-0.5 px-0.5 gap-px",
          !isBottom &&
            "flex-col-reverse items-center justify-between py-0.5 px-0.5 gap-px",
        )}
      >
        <span
          className={cn(
            "w-full leading-none text-center font-bold",
            isBlitz
              ? "text-[9.5px] sm:text-[11px] md:text-xs lg:text-[13px] xl:text-[14px]"
              : "text-[8px] sm:text-[9px] md:text-[10.5px] lg:text-[11.5px] xl:text-xs",
            isNoir
              ? "font-noir-body text-[#0a0806]"
              : isSoviet
                ? "tile-name"
                : specialVisual
                  ? specialVisual.textColor
                  : "text-slate-900 font-sans",
          )}
          style={{
            lineHeight: "1.15",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        >
          {tile.name}
        </span>

        <div className="flex items-center justify-center shrink-0 my-auto flex-1 py-0.5 w-full">
          <TileIconImage
            tile={tile}
            className={cn(
              "max-w-full object-contain filter contrast-125 transition-transform hover:scale-105",
              isBlitz
                ? "w-16 h-13 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 xl:w-32 xl:h-28 max-h-full drop-shadow-sm"
                : "w-10 h-8 sm:w-12 sm:h-9 md:w-14 md:h-11 lg:w-16 lg:h-12 xl:w-20 xl:h-14 max-h-[85%]"
            )}
          />
        </div>

        {(tile.price || tile.amount || tile.bonus) && (
          <span
            className={cn(
              "text-center leading-none font-bold",
              isBlitz
                ? "text-[9.5px] sm:text-[10.5px] md:text-[11.5px] lg:text-[12.5px] xl:text-[13px]"
                : "text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs",
              isNoir
                ? "font-noir-body text-[#0a0806]"
                : isSoviet
                  ? "tile-price"
                  : specialVisual
                    ? specialVisual.priceColor
                    : "text-slate-700 font-sans",
            )}
          >
            {isNoir
              ? `$${tile.price || tile.amount || tile.bonus}`
              : isSoviet
                ? `${tile.price || tile.amount || tile.bonus} кР`
                : `$${tile.price || tile.amount || tile.bonus}`}
          </span>
        )}
      </div>

      {/* Mortgage stamp overlay */}
      {tile.isMortgaged && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          {isNoir ? (
            <span className="noir-stamp-red px-1 py-0.5 -rotate-12 rounded text-[7px] font-bold">
              ЗАЛОЖЕНО
            </span>
          ) : isSoviet ? (
            <span className="text-[6px] text-red-500 font-bold border border-red-500 bg-black/80 px-1 py-0.5 -rotate-12 rounded">
              РЕЗЕРВ АН СССР
            </span>
          ) : (
            <span className="text-[7px] text-red-300 font-bold border border-red-500 bg-red-950/90 px-1 py-0.5 -rotate-12 rounded">
              ЗАЛОЖЕНО В БАНК
            </span>
          )}
        </div>
      )}

      {/* Standing Player Tokens on Tile */}
      {playersOnTile.length > 0 && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap content-center">
          {playersOnTile.map((player) => {
            const isMoving = Boolean(movingPlayers?.[player.id]);
            const anim = isMoving
              ? "jump"
              : player.inJail
                ? "sleep"
                : currentPlayerId === player.id
                  ? "happy"
                  : "idle";
            const playerHex = getPlayerHex(player);
            const tokenSize = playersOnTile.length === 1 ? "md" : "sm";
            const scaleClass =
              playersOnTile.length === 1
                ? isMoving
                  ? "scale-125 z-40 -translate-y-2"
                  : "scale-110"
                : isMoving
                  ? "scale-115 z-40 -translate-y-1"
                  : "scale-100";
            return (
              <div
                key={player.id}
                className="relative flex flex-col items-center justify-center drop-shadow-md"
              >
                <PetAvatar
                  characterId={player.characterId}
                  anim={anim}
                  size={tokenSize}
                  showPedestal={true}
                  pedestalColor={playerHex}
                  className={cn("transition-transform", scaleClass)}
                />
                <div
                  className="mt-[-2px] player-tag"
                  style={{ borderColor: playerHex, color: playerHex }}
                >
                  {player.name || "Игрок"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
