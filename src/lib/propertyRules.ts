import { GameState, TileData } from "@/types/game";

/**
 * Get all tiles in a group
 */
export function getGroupTiles(board: TileData[] | undefined, group?: string): TileData[] {
  if (!board || !group) return [];
  return board.filter((t) => t && t.type === "property" && t.group === group);
}

/**
 * Check if player or team owns all properties in the color group
 */
export function hasMonopoly(
  board: TileData[] | undefined,
  playerId: string,
  group?: string,
  isTeamMode?: boolean,
  teamId?: string | null,
  players?: Array<{ id: string; teamId?: string | null }>
): boolean {
  if (!board || !group) return false;
  const groupTiles = getGroupTiles(board, group);
  if (groupTiles.length === 0) return false;
  return groupTiles.every((t) => {
    if (!t.ownerId) return false;
    if (t.ownerId === playerId) return true;
    if (isTeamMode && teamId) {
      if (t.teamId === teamId) return true;
      const owner = players?.find((p) => p.id === t.ownerId);
      if (owner && owner.teamId === teamId) return true;
    }
    return false;
  });
}

/**
 * Progressive upgrade cost: increases with each house (+25% per house)
 */
export function getUpgradeCost(tile: TileData, currentHouses: number = 0): number {
  if (tile.upgradeCost !== undefined) return tile.upgradeCost;
  const base = tile.housePrice || 50;
  const multiplier = 1 + Math.max(0, currentHouses) * 0.25;
  return Math.round(base * multiplier);
}

/**
 * Sell refund is 50% of the cost for that specific level
 */
export function getSellRefund(tile: TileData, currentHouses: number = 0): number {
  if (tile.sellRefund !== undefined) return tile.sellRefund;
  const lastUpgradeCost = getUpgradeCost(tile, Math.max(0, currentHouses - 1));
  return Math.floor(lastUpgradeCost / 2);
}

export interface BuildValidation {
  allowed: boolean;
  reason?: string;
  cost: number;
}

export interface SellValidation {
  allowed: boolean;
  reason?: string;
  refund: number;
}

export interface MortgageValidation {
  allowed: boolean;
  reason?: string;
  value: number;
}

export interface UnmortgageValidation {
  allowed: boolean;
  reason?: string;
  cost: number;
}

/**
 * Validate building an improvement on a property
 */
export function canBuildHouse(
  tile: TileData | null | undefined,
  gameState: GameState | null | undefined,
  playerId: string
): BuildValidation {
  if (!tile || tile.type !== "property") {
    return { allowed: false, reason: "Клетка не является собственностью", cost: 0 };
  }
  const currentHouses = tile.houses || 0;
  const cost = getUpgradeCost(tile, currentHouses);

  if (!tile.housePrice || tile.housePrice <= 0 || tile.group === "transport" || tile.group === "utility") {
    return { allowed: false, reason: "На этом типе объекта нельзя возводить постройки", cost: 0 };
  }

  if (!gameState || gameState.status === "GAME_OVER" || gameState.status === "LOBBY") {
    return { allowed: false, reason: "Игра не активна", cost };
  }

  const isTeamMode = gameState.gameMode === "team";
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  if (!myPlayer) {
    return { allowed: false, reason: "Игрок не найден", cost };
  }

  if (myPlayer.isBankrupt) {
    return { allowed: false, reason: "Банкрот не может строить здания", cost };
  }

  if (gameState.pendingDebt && gameState.pendingDebt.debtorId === playerId) {
    return { allowed: false, reason: "Сначала погасите задолженность", cost };
  }

  const isOwner =
    tile.ownerId === playerId ||
    (isTeamMode &&
      myPlayer.teamId &&
      (tile.teamId === myPlayer.teamId ||
        gameState.players.find((p) => p.id === tile.ownerId)?.teamId === myPlayer.teamId));

  if (!isOwner) {
    return { allowed: false, reason: "Вы не владеете этим объектом", cost };
  }

  if (tile.isMortgaged) {
    return { allowed: false, reason: "Объект заложен в банке", cost };
  }

  const isMyTurn = Boolean(
    gameState.players[gameState.currentTurnIndex]?.id === playerId
  );

  if (!isMyTurn) {
    return { allowed: false, reason: "Улучшение возможно только во время своего хода", cost };
  }

  if (
    gameState.builtTilesThisTurn?.includes(tile.id) ||
    gameState.builtTilesThisTurn?.includes(Number(tile.id))
  ) {
    return { allowed: false, reason: "Максимум 1 улучшение на одном объекте за ход", cost };
  }

  // Monopoly check
  const groupTiles = getGroupTiles(gameState.board, tile.group);
  if (groupTiles.length === 0) {
    return { allowed: false, reason: "Отрасль не найдена", cost };
  }

  const isMonopoly = hasMonopoly(
    gameState.board,
    playerId,
    tile.group,
    isTeamMode,
    myPlayer.teamId,
    gameState.players
  );

  if (!isMonopoly) {
    return { allowed: false, reason: "Для постройки необходима монополия на всю отрасль", cost };
  }

  // Cannot build if any tile in group is mortgaged
  const hasMortgagedInGroup = groupTiles.some((t) => t.isMortgaged);
  if (hasMortgagedInGroup) {
    return { allowed: false, reason: "В отрасли есть заложенные активы", cost };
  }

  // Max houses
  if (currentHouses >= 5) {
    return { allowed: false, reason: "Достигнут максимум построек (Отель / Штаб)", cost };
  }

  // Uniform building rule: tile houses cannot exceed min houses in group
  const minHousesInGroup = Math.min(...groupTiles.map((t) => t.houses || 0));
  if (currentHouses > minHousesInGroup) {
    return {
      allowed: false,
      reason: "Правило равномерной застройки: сначала улучшите другие улицы района",
      cost,
    };
  }

  const myMoney = myPlayer.money || 0;
  if (myMoney < cost) {
    return { allowed: false, reason: `Недостаточно средств ($${myMoney} / $${cost})`, cost };
  }

  return { allowed: true, cost };
}

/**
 * Validate selling an improvement from a property
 */
export function canSellHouse(
  tile: TileData | null | undefined,
  gameState: GameState | null | undefined,
  playerId: string
): SellValidation {
  if (!tile || tile.type !== "property") {
    return { allowed: false, reason: "Клетка не является собственностью", refund: 0 };
  }
  const currentHouses = tile.houses || 0;
  const refund = getSellRefund(tile, currentHouses);

  if (!tile.housePrice || tile.housePrice <= 0 || tile.group === "transport" || tile.group === "utility") {
    return { allowed: false, reason: "На этом типе объекта нет построек", refund };
  }

  if (!gameState || gameState.status === "GAME_OVER" || gameState.status === "LOBBY") {
    return { allowed: false, reason: "Игра не активна", refund };
  }

  const isTeamMode = gameState.gameMode === "team";
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  if (!myPlayer) {
    return { allowed: false, reason: "Игрок не найден", refund };
  }

  const isOwner =
    tile.ownerId === playerId ||
    (isTeamMode &&
      myPlayer.teamId &&
      (tile.teamId === myPlayer.teamId ||
        gameState.players.find((p) => p.id === tile.ownerId)?.teamId === myPlayer.teamId));

  if (!isOwner) {
    return { allowed: false, reason: "Вы не владеете этим объектом", refund };
  }

  if (currentHouses <= 0) {
    return { allowed: false, reason: "На этой улице нет построек для сноса", refund };
  }

  const isMyTurn = Boolean(
    gameState.players[gameState.currentTurnIndex]?.id === playerId
  );

  if (!isMyTurn) {
    return { allowed: false, reason: "Снос возможен только во время своего хода", refund };
  }

  // Uniform selling rule: must sell from highest improved tile in group first
  const groupTiles = getGroupTiles(gameState.board, tile.group);
  const maxHousesInGroup = Math.max(...groupTiles.map((t) => t.houses || 0));
  if (currentHouses < maxHousesInGroup) {
    return {
      allowed: false,
      reason: "Правило равномерного сноса: сначала продайте постройки с более развитых улиц района",
      refund,
    };
  }

  return { allowed: true, refund };
}

/**
 * Validate mortgaging a property
 */
export function canMortgage(
  tile: TileData | null | undefined,
  gameState: GameState | null | undefined,
  playerId: string
): MortgageValidation {
  if (!tile || tile.type !== "property") {
    return { allowed: false, reason: "Клетка не является собственностью", value: 0 };
  }
  const value = tile.mortgageValue || Math.round((tile.price || 60) / 2);

  if (!gameState || gameState.status === "GAME_OVER" || gameState.status === "LOBBY") {
    return { allowed: false, reason: "Игра не активна", value };
  }

  const isTeamMode = gameState.gameMode === "team";
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  if (!myPlayer) {
    return { allowed: false, reason: "Игрок не найден", value };
  }

  const isOwner =
    tile.ownerId === playerId ||
    (isTeamMode &&
      myPlayer.teamId &&
      (tile.teamId === myPlayer.teamId ||
        gameState.players.find((p) => p.id === tile.ownerId)?.teamId === myPlayer.teamId));

  if (!isOwner) {
    return { allowed: false, reason: "Вы не владеете этим объектом", value };
  }

  if (tile.isMortgaged) {
    return { allowed: false, reason: "Актив уже заложен", value };
  }

  const isMyTurn = Boolean(
    gameState.players[gameState.currentTurnIndex]?.id === playerId
  );

  if (!isMyTurn) {
    return { allowed: false, reason: "Залог возможен только во время своего хода", value };
  }

  // Cannot mortgage if any tile in the group has houses
  const groupTiles = getGroupTiles(gameState.board, tile.group);
  const hasHousesInGroup = groupTiles.some((t) => (t.houses || 0) > 0);
  if (hasHousesInGroup) {
    return { allowed: false, reason: "Сначала продайте все филиалы в этой отрасли", value };
  }

  return { allowed: true, value };
}

/**
 * Validate unmortgaging a property
 */
export function canUnmortgage(
  tile: TileData | null | undefined,
  gameState: GameState | null | undefined,
  playerId: string
): UnmortgageValidation {
  if (!tile || tile.type !== "property") {
    return { allowed: false, reason: "Клетка не является собственностью", cost: 0 };
  }
  const baseValue = tile.mortgageValue || Math.round((tile.price || 60) / 2);
  const cost = Math.round(baseValue * 1.1);

  if (!gameState || gameState.status === "GAME_OVER" || gameState.status === "LOBBY") {
    return { allowed: false, reason: "Игра не активна", cost };
  }

  const isTeamMode = gameState.gameMode === "team";
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  if (!myPlayer) {
    return { allowed: false, reason: "Игрок не найден", cost };
  }

  const myMoney = myPlayer.money || 0;

  const isOwner =
    tile.ownerId === playerId ||
    (isTeamMode &&
      myPlayer.teamId &&
      (tile.teamId === myPlayer.teamId ||
        gameState.players.find((p) => p.id === tile.ownerId)?.teamId === myPlayer.teamId));

  if (!isOwner) {
    return { allowed: false, reason: "Вы не владеете этим объектом", cost };
  }

  if (!tile.isMortgaged) {
    return { allowed: false, reason: "Актив не заложен", cost };
  }

  const isMyTurn = Boolean(
    gameState.players[gameState.currentTurnIndex]?.id === playerId
  );

  if (!isMyTurn) {
    return { allowed: false, reason: "Выкуп возможен только во время своего хода", cost };
  }

  if (myMoney < cost) {
    return { allowed: false, reason: `Недостаточно средств ($${myMoney} / $${cost})`, cost };
  }

  return { allowed: true, cost };
}
