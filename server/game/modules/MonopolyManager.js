class MonopolyManager {
  /**
   * Check if a player owns all properties in a color group
   */
  static hasMonopoly(board, playerId, groupId) {
    if (!groupId || !board) return false;
    const groupTiles = this.getGroupTiles(board, groupId);
    if (groupTiles.length === 0) return false;
    return groupTiles.every(tile => tile.ownerId === playerId);
  }

  /**
   * Get all tiles belonging to a color group
   */
  static getGroupTiles(board, groupId) {
    if (!groupId || !Array.isArray(board)) return [];
    return board.filter(t => t && t.type === 'property' && t.group === groupId);
  }

  /**
   * Calculate progressive cost for upgrading a property based on existing improvements
   * Cost increases by +25% per each existing house
   */
  static getUpgradeCost(tile, currentHouses = 0) {
    const base = tile.housePrice || 50;
    const multiplier = 1 + (Math.max(0, currentHouses) * 0.25);
    return Math.round(base * multiplier);
  }

  /**
   * Validate if a player can build a house on the property
   */
  static canBuildHouse(player, board, tileId, options = {}) {
    const tile = board[tileId];
    if (!tile || tile.type !== 'property') {
      return { allowed: false, reason: 'Клетка не является недвижимостью' };
    }
    if (tile.ownerId !== player.id) {
      return { allowed: false, reason: 'Вы не владеете этой недвижимостью' };
    }
    if (!tile.housePrice) {
      return { allowed: false, reason: 'На этом типе недвижимости нельзя строить здания' };
    }

    const mode = options.mode || 'standard';
    const builtTilesThisTurn = options.builtTilesThisTurn || [];
    const currentHouses = tile.houses || 0;

    // Rule: Max 1 improvement on the same street per turn
    if (builtTilesThisTurn.includes(Number(tileId))) {
      return { allowed: false, reason: 'Нельзя делать больше одного улучшения на одной и той же улице за один ход' };
    }

    if (!this.hasMonopoly(board, player.id, tile.group)) {
      return { allowed: false, reason: 'Для постройки необходимо собрать монополию всего цветного района' };
    }

    const groupTiles = this.getGroupTiles(board, tile.group);

    // Cannot build if any property in group is mortgaged
    const hasMortgage = groupTiles.some(t => t.isMortgaged);
    if (hasMortgage) {
      return { allowed: false, reason: 'Нельзя строить, пока в районе есть заложенная недвижимость' };
    }

    if (currentHouses >= 5) {
      return { allowed: false, reason: 'Достигнут максимум построек (Отель)' };
    }

    // Uniform building rule: tile.houses cannot exceed minHouses in group
    const minHouses = Math.min(...groupTiles.map(t => t.houses || 0));
    if (currentHouses > minHouses) {
      return { allowed: false, reason: 'Правило равномерной застройки: сначала постройте дома на остальных улицах района' };
    }

    // Progressive upgrade cost: increases with each house
    const houseCost = this.getUpgradeCost(tile, currentHouses);
    if (player.money < houseCost) {
      return { allowed: false, reason: `Недостаточно средств ($${player.money} / $${houseCost})` };
    }

    return { allowed: true, cost: houseCost };
  }

  /**
   * Build a house or hotel on the tile
   */
  static buildHouse(player, board, tileId, options = {}) {
    const validation = this.canBuildHouse(player, board, tileId, options);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const tile = board[tileId];
    const cost = validation.cost;

    player.money -= cost;
    tile.houses = (tile.houses || 0) + 1;

    return {
      tileId,
      name: tile.name,
      houses: tile.houses,
      isHotel: tile.houses === 5,
      cost,
      newRent: this.calculateRent(tile, board, player)
    };
  }

  /**
   * Validate if a player can sell a house from the property
   */
  static canSellHouse(player, board, tileId) {
    const tile = board[tileId];
    if (!tile || tile.type !== 'property') {
      return { allowed: false, reason: 'Клетка не является недвижимостью' };
    }
    if (tile.ownerId !== player.id) {
      return { allowed: false, reason: 'Вы не владеете этой недвижимостью' };
    }

    const currentHouses = tile.houses || 0;
    if (currentHouses <= 0) {
      return { allowed: false, reason: 'На этой улице нет построек для продажи' };
    }

    const groupTiles = this.getGroupTiles(board, tile.group);
    const maxHouses = Math.max(...groupTiles.map(t => t.houses || 0));

    // Uniform selling rule: must sell from highest improved tile first
    if (currentHouses < maxHouses) {
      return { allowed: false, reason: 'Правило равномерной продажи: сначала продайте постройки с других улиц района' };
    }

    // Refund is 50% of the cost for that specific level
    const lastUpgradeCost = this.getUpgradeCost(tile, currentHouses - 1);
    const refund = Math.floor(lastUpgradeCost / 2);
    return { allowed: true, refund };
  }

  /**
   * Sell a house back to the bank for 50% value
   */
  static sellHouse(player, board, tileId) {
    const validation = this.canSellHouse(player, board, tileId);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const tile = board[tileId];
    const refund = validation.refund;

    tile.houses = Math.max(0, (tile.houses || 0) - 1);
    player.money += refund;

    return {
      tileId,
      name: tile.name,
      houses: tile.houses,
      refund,
      newRent: this.calculateRent(tile, board, player)
    };
  }

  /**
   * Calculate rent for a property tile based on houses, monopoly, and mortgage
   */
  static calculateRent(tile, board, owner) {
    if (!tile || tile.type !== 'property') return 0;
    if (tile.isMortgaged) return 0; // No rent from mortgaged property

    const houses = tile.houses || 0;
    const rents = tile.rents || [tile.rent || 10];

    // Transport & Utilities: non-upgradable properties with tiered rents based on number of properties owned in group
    if ((tile.group === 'transport' || tile.group === 'utility' || !tile.housePrice) && Array.isArray(rents) && rents.length > 1) {
      if (!owner || !board) return rents[0] || tile.rent || 10;
      const groupTiles = this.getGroupTiles(board, tile.group);
      const ownedCount = groupTiles.filter(t => t.ownerId === owner.id && !t.isMortgaged).length;
      if (ownedCount <= 0) return rents[0] || tile.rent || 10;
      const rentIndex = Math.min(ownedCount - 1, rents.length - 1);
      return rents[rentIndex] || rents[0];
    }

    if (houses > 0) {
      return rents[houses] || rents[rents.length - 1];
    }

    // Base rent or Monopoly 2x bonus
    const baseRent = rents[0] || tile.rent || 10;
    if (owner && this.hasMonopoly(board, owner.id, tile.group)) {
      return baseRent * 2;
    }

    return baseRent;
  }
}

module.exports = MonopolyManager;
