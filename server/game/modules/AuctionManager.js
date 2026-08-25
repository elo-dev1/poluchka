class AuctionManager {
  /**
   * Initialize a direct purchase offer for a single opponent
   */
  static initDirectOffer(tile, targetPlayer, initiator) {
    return {
      tileId: tile.id,
      tileName: tile.name,
      tileColor: tile.color || '#38bdf8',
      tilePrice: tile.price,
      groupName: tile.groupName || '',
      currentBid: tile.price,
      isDirectOffer: true,
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name,
      initiatorId: initiator ? initiator.id : null,
      initiatorName: initiator ? initiator.name : null,
      highestBidderId: null,
      highestBidderName: null,
      highestBidderColor: null,
      activeBidders: [targetPlayer.id],
      passedBidders: initiator ? [initiator.id] : [],
      minIncrement: 0,
      isCompleted: false,
      startedAt: Date.now(),
      timerSeconds: 10,
      remainingSeconds: 10,
      endsAt: Date.now() + 10000
    };
  }

  /**
   * Initialize a new competitive auction for an unowned property
   */
  static initAuction(tile, activePlayers, initiatorId = null) {
    const startingBid = Math.max(10, Math.ceil((tile.price || 100) * 0.10));
    const eligiblePlayers = activePlayers.filter(p => !p.isBankrupt && (!initiatorId || p.id !== initiatorId));
    const passedBidders = initiatorId ? [initiatorId] : [];

    return {
      tileId: tile.id,
      tileName: tile.name,
      tileColor: tile.color || '#38bdf8',
      tilePrice: tile.price,
      groupName: tile.groupName || '',
      currentBid: startingBid,
      isDirectOffer: false,
      initiatorId: initiatorId || null,
      highestBidderId: null,
      highestBidderName: null,
      highestBidderColor: null,
      activeBidders: eligiblePlayers.map(p => p.id),
      passedBidders,
      minIncrement: 10,
      isCompleted: false,
      startedAt: Date.now(),
      timerSeconds: 10,
      remainingSeconds: 10,
      endsAt: Date.now() + 10000
    };
  }

  /**
   * Process a player placing a higher bid or accepting a direct offer
   */
  static placeBid(auction, player, bidAmount) {
    if (auction.isCompleted) {
      throw new Error('Аукцион уже завершён');
    }
    if (player.isBankrupt) {
      throw new Error('Обанкротившиеся игроки не могут участвовать в аукционе');
    }
    if (auction.passedBidders.includes(player.id)) {
      throw new Error('Вы уже спасовали в этом аукционе');
    }

    const numericBid = Number(bidAmount);
    if (isNaN(numericBid)) {
      throw new Error('Некорректная сумма ставки');
    }

    if (!auction.isDirectOffer) {
      if (numericBid <= auction.currentBid && auction.highestBidderId !== null) {
        throw new Error(`Ставка должна быть больше текущей ($${auction.currentBid})`);
      }
      if (numericBid < auction.currentBid && auction.highestBidderId === null) {
        throw new Error(`Минимальная стартовая ставка: $${auction.currentBid}`);
      }
    }

    if (player.money < numericBid) {
      throw new Error(`У вас недостаточно денег для этой покупки ($${player.money} / $${numericBid})`);
    }

    auction.currentBid = numericBid;
    auction.highestBidderId = player.id;
    auction.highestBidderName = player.name;
    auction.highestBidderColor = player.color ? player.color.hex : '#38bdf8';

    // If direct offer or only 1 active bidder who bid, mark completed
    this.checkEnd(auction);

    return {
      currentBid: auction.currentBid,
      highestBidderId: auction.highestBidderId,
      highestBidderName: auction.highestBidderName,
      isCompleted: auction.isCompleted
    };
  }

  /**
   * Process a player passing on the auction
   */
  static passBid(auction, playerId) {
    if (auction.isCompleted) {
      return { isCompleted: true };
    }

    if (!auction.passedBidders.includes(playerId)) {
      auction.passedBidders.push(playerId);
    }
    auction.activeBidders = auction.activeBidders.filter(id => id !== playerId);

    this.checkEnd(auction);

    return {
      activeBiddersCount: auction.activeBidders.length,
      passedBidders: auction.passedBidders,
      isCompleted: auction.isCompleted
    };
  }

  /**
   * Check if auction conditions are met to end
   */
  static checkEnd(auction) {
    // If direct offer and target made a bid
    if (auction.isDirectOffer && auction.highestBidderId) {
      auction.isCompleted = true;
      return true;
    }

    // If no active bidders left
    if (auction.activeBidders.length === 0) {
      auction.isCompleted = true;
      return true;
    }

    // If exactly 1 active bidder left and they hold the highest bid
    if (auction.activeBidders.length === 1 && auction.highestBidderId === auction.activeBidders[0]) {
      auction.isCompleted = true;
      return true;
    }

    return false;
  }

  /**
   * Resolve auction results, transfer property and deduct money
   */
  static resolveAuction(auction, board, players) {
    const tile = board[auction.tileId];
    if (!tile) return null;

    if (!auction.highestBidderId) {
      // Nobody bid
      return {
        winner: null,
        tileId: auction.tileId,
        tileName: auction.tileName,
        winningBid: 0
      };
    }

    const winner = players.find(p => p.id === auction.highestBidderId);
    if (!winner) return null;

    winner.money -= auction.currentBid;
    tile.ownerId = winner.id;
    if (!winner.properties.includes(tile.id)) {
      winner.properties.push(tile.id);
    }

    return {
      winner,
      tileId: tile.id,
      tileName: tile.name,
      winningBid: auction.currentBid
    };
  }
}

module.exports = AuctionManager;
