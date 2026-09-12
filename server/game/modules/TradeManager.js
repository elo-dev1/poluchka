const MonopolyManager = require('./MonopolyManager');

class TradeManager {
  /**
   * Validate trade items and ownership
   */
  static validateTradeItems(player, items, board, options = {}) {
    const money = Math.max(0, Number(items.money) || 0);
    if (money > player.money) {
      return { valid: false, reason: `${player.name} не имеет достаточно денег ($${player.money} < $${money})` };
    }

    const jailFreeCards = Math.max(0, Number(items.jailFreeCards) || 0);
    if (jailFreeCards > (player.jailFreeCards || 0)) {
      return { valid: false, reason: `${player.name} не имеет столько карт освобождения из тюрьмы` };
    }

    const properties = items.properties || [];
    for (const rawTileId of properties) {
      const tileId = Number(rawTileId);
      if (isNaN(tileId) || !Number.isInteger(tileId) || tileId < 0 || !Array.isArray(board) || tileId >= board.length) {
        return { valid: false, reason: `Некорректный ID улицы: ${rawTileId}` };
      }
      const tile = board[tileId];
      const isOwner = tile && (
        tile.ownerId === player.id ||
        (typeof options.isSameTeam === 'function' && options.isSameTeam(tile.ownerId, player.id)) ||
        (player.teamId && tile.teamId === player.teamId)
      );

      if (!tile || !isOwner) {
        return { valid: false, reason: `${player.name} не владеет улицей "${tile ? tile.name : tileId}"` };
      }

      // Check if there are houses on this color group
      const groupTiles = MonopolyManager.getGroupTiles(board, tile.group);
      const hasBuildings = groupTiles.some(t => (t.houses || 0) > 0);
      if (hasBuildings) {
        return { valid: false, reason: `Нельзя обменивать улицу "${tile.name}", пока на районе построены дома. Сначала продайте постройки.` };
      }
    }

    return { valid: true };
  }

  /**
   * Anti-Dumping / Anti-Collusion validation
   * Blocks 1-sided resource dumping (e.g. giving away properties or cash for free)
   */
  static validateAntiDumping(offer, request, board, options = {}) {
    if (options.isBotGame || options.skipAntiDumping) {
      return { valid: true };
    }

    const evaluateItems = (items) => {
      let val = items.money || 0;
      val += (items.jailFreeCards || 0) * 50;
      for (const tileId of (items.properties || [])) {
        const tile = board[tileId];
        if (tile) {
          val += (tile.price || 0) + (tile.houses || 0) * (tile.housePrice || 50);
        }
      }
      return val;
    };

    const offerVal = evaluateItems(offer);
    const requestVal = evaluateItems(request);

    // If one side gives away substantial assets (>= $100 for $0, or >= $150 for < 20% value), block as collusion dumping
    const isExtremeDumpingOffer = (offerVal >= 100 && requestVal === 0) || (offerVal >= 150 && requestVal < offerVal * 0.2);
    const isExtremeDumpingRequest = (requestVal >= 100 && offerVal === 0) || (requestVal >= 150 && offerVal < requestVal * 0.2);

    if (isExtremeDumpingOffer || isExtremeDumpingRequest) {
      return {
        valid: false,
        reason: 'Несбалансированная сделка отклонена: в рейтинговой игре запрещена безвозмездная передача активов для защиты от сговора'
      };
    }

    return { valid: true };
  }

  /**
   * Create a trade proposal
   */
  static createTradeProposal(fromPlayer, toPlayer, offer, request, board, options = {}) {
    if (!fromPlayer || !toPlayer || fromPlayer.id === toPlayer.id) {
      throw new Error('Некорректные участники сделки');
    }
    if (typeof options.isSameTeam === 'function' && options.isSameTeam(fromPlayer.id, toPlayer.id)) {
      throw new Error('Нельзя совершать сделки с напарником по команде, так как у вас общая казна и имущество');
    }
    if (fromPlayer.isBankrupt || toPlayer.isBankrupt) {
      throw new Error('Обанкротившиеся игроки не могут совершать сделки');
    }

    // Validate offer items belong to fromPlayer
    const offerCheck = this.validateTradeItems(fromPlayer, offer, board, options);
    if (!offerCheck.valid) {
      throw new Error(offerCheck.reason);
    }

    // Validate request items belong to toPlayer
    const requestCheck = this.validateTradeItems(toPlayer, request, board, options);
    if (!requestCheck.valid) {
      throw new Error(requestCheck.reason);
    }

    // Clean offer and request
    const cleanOffer = {
      money: Math.max(0, Number(offer.money) || 0),
      properties: (offer.properties || []).map(Number),
      jailFreeCards: Math.max(0, Number(offer.jailFreeCards) || 0)
    };
    const cleanRequest = {
      money: Math.max(0, Number(request.money) || 0),
      properties: (request.properties || []).map(Number),
      jailFreeCards: Math.max(0, Number(request.jailFreeCards) || 0)
    };

    // Ensure not completely empty trade
    const isOfferEmpty = cleanOffer.money === 0 && cleanOffer.properties.length === 0 && cleanOffer.jailFreeCards === 0;
    const isRequestEmpty = cleanRequest.money === 0 && cleanRequest.properties.length === 0 && cleanRequest.jailFreeCards === 0;
    if (isOfferEmpty && isRequestEmpty) {
      throw new Error('Сделка не может быть пустой');
    }

    // Anti-Dumping / Anti-Collusion check in competitive games
    const dumpingCheck = this.validateAntiDumping(cleanOffer, cleanRequest, board, options);
    if (!dumpingCheck.valid) {
      throw new Error(dumpingCheck.reason);
    }

    return {
      id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromPlayerId: fromPlayer.id,
      fromPlayerName: fromPlayer.name,
      fromPlayerColor: fromPlayer.color,
      toPlayerId: toPlayer.id,
      toPlayerName: toPlayer.name,
      toPlayerColor: toPlayer.color,
      offer: cleanOffer,
      request: cleanRequest,
      status: 'PENDING',
      createdAt: Date.now()
    };
  }

  /**
   * Atomically execute accepted trade
   */
  static executeTrade(trade, players, board, options = {}) {
    const fromPlayer = players.find(p => p.id === trade.fromPlayerId);
    const toPlayer = players.find(p => p.id === trade.toPlayerId);

    if (!fromPlayer || !toPlayer) {
      throw new Error('Участники сделки не найдены');
    }

    // Re-validate both sides right before execution
    const offerCheck = this.validateTradeItems(fromPlayer, trade.offer, board, options);
    if (!offerCheck.valid) throw new Error(offerCheck.reason);

    const requestCheck = this.validateTradeItems(toPlayer, trade.request, board, options);
    if (!requestCheck.valid) throw new Error(requestCheck.reason);

    // Re-validate anti-dumping right before execution
    const dumpingCheck = this.validateAntiDumping(trade.offer, trade.request, board, options);
    if (!dumpingCheck.valid) throw new Error(dumpingCheck.reason);

    // 1. Swap Money
    fromPlayer.money = fromPlayer.money - trade.offer.money + trade.request.money;
    toPlayer.money = toPlayer.money - trade.request.money + trade.offer.money;

    // 2. Swap Jail Free Cards
    fromPlayer.jailFreeCards = (fromPlayer.jailFreeCards || 0) - trade.offer.jailFreeCards + trade.request.jailFreeCards;
    toPlayer.jailFreeCards = (toPlayer.jailFreeCards || 0) - trade.request.jailFreeCards + trade.offer.jailFreeCards;

    // 3. Swap Offered Properties (from -> to)
    for (const tileId of trade.offer.properties) {
      const tile = board[tileId];
      tile.ownerId = toPlayer.id;
      fromPlayer.properties = fromPlayer.properties.filter(id => id !== tileId);
      if (!toPlayer.properties.includes(tileId)) {
        toPlayer.properties.push(tileId);
      }
    }

    // 4. Swap Requested Properties (to -> from)
    for (const tileId of trade.request.properties) {
      const tile = board[tileId];
      tile.ownerId = fromPlayer.id;
      toPlayer.properties = toPlayer.properties.filter(id => id !== tileId);
      if (!fromPlayer.properties.includes(tileId)) {
        fromPlayer.properties.push(tileId);
      }
    }

    trade.status = 'ACCEPTED';
    return {
      success: true,
      trade
    };
  }
}

module.exports = TradeManager;
