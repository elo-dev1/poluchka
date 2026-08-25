const MonopolyManager = require('./MonopolyManager');

class MortgageManager {
  /**
   * Validate if a property can be mortgaged
   */
  static canMortgage(player, board, tileId) {
    const tile = board[tileId];
    if (!tile || tile.type !== 'property') {
      return { allowed: false, reason: 'Клетка не является недвижимостью' };
    }
    if (tile.ownerId !== player.id) {
      return { allowed: false, reason: 'Вы не владеете этой недвижимостью' };
    }
    if (tile.isMortgaged) {
      return { allowed: false, reason: 'Эта недвижимость уже заложена' };
    }

    // Check if any property in this color group has houses
    const groupTiles = MonopolyManager.getGroupTiles(board, tile.group);
    const hasBuildings = groupTiles.some(t => (t.houses || 0) > 0);
    if (hasBuildings) {
      return { allowed: false, reason: 'Сначала необходимо продать все постройки (дома/отели) в этом районе' };
    }

    const value = tile.mortgageValue || Math.floor((tile.price || 100) / 2);
    return { allowed: true, value };
  }

  /**
   * Mortgage a property to receive cash
   */
  static mortgageProperty(player, board, tileId) {
    const validation = this.canMortgage(player, board, tileId);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const tile = board[tileId];
    const value = validation.value;

    tile.isMortgaged = true;
    player.money += value;

    return {
      tileId,
      name: tile.name,
      mortgageValue: value,
      isMortgaged: true
    };
  }

  /**
   * Validate if a mortgaged property can be redeemed
   */
  static canUnmortgage(player, board, tileId) {
    const tile = board[tileId];
    if (!tile || tile.type !== 'property') {
      return { allowed: false, reason: 'Клетка не является недвижимостью' };
    }
    if (tile.ownerId !== player.id) {
      return { allowed: false, reason: 'Вы не владеете этой недвижимостью' };
    }
    if (!tile.isMortgaged) {
      return { allowed: false, reason: 'Эта недвижимость не заложена' };
    }

    const baseValue = tile.mortgageValue || Math.floor((tile.price || 100) / 2);
    const cost = Math.ceil(baseValue * 1.10); // +10% interest

    if (player.money < cost) {
      return { allowed: false, reason: `Недостаточно средств для выкупа ($${player.money} / $${cost})` };
    }

    return { allowed: true, cost };
  }

  /**
   * Redeem a mortgaged property
   */
  static unmortgageProperty(player, board, tileId) {
    const validation = this.canUnmortgage(player, board, tileId);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const tile = board[tileId];
    const cost = validation.cost;

    player.money -= cost;
    tile.isMortgaged = false;

    return {
      tileId,
      name: tile.name,
      redemptionCost: cost,
      isMortgaged: false
    };
  }
}

module.exports = MortgageManager;
