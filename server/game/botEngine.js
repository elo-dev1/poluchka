/**
 * botEngine.js - Pure Heuristic Decision Engine for Monopoly Bots
 * 
 * Fully independent of sockets. Takes gameState and botPlayerId,
 * returns next action object or null.
 * 
 * Supports 3 difficulties:
 * - 'careful': High financial reserve, conservative bidding, strict trade ratio.
 * - 'balanced': Moderate reserve, fair bids, balanced trades.
 * - 'aggressive': Low reserve, aggressive builds/bids, highly motivated to assemble monopolies.
 */

const MonopolyManager = require('./modules/MonopolyManager');
const MortgageManager = require('./modules/MortgageManager');

class BotEngine {
  /**
   * Main entry point: Decide what action the bot should take next
   * @param {Object} gameState - Current public or internal game state
   * @param {string} botPlayerId - ID of the bot player
   * @returns {Object|null} Action object, e.g. { type: 'BUY_PROPERTY', tileId: 5 }
   */
  static getDecision(gameState, botPlayerId) {
    if (!gameState || !gameState.players || !botPlayerId) return null;

    const bot = gameState.players.find(p => p.id === botPlayerId);
    if (!bot || bot.isBankrupt) return null;

    const difficulty = bot.botDifficulty || 'balanced';

    // 1. ACTIVE AUCTION PHASE (Bot is participant)
    if (gameState.status === 'AUCTION' && gameState.activeAuction) {
      return this.decideAuctionAction(gameState, bot, difficulty);
    }

    // 2. ACTIVE TRADE PROPOSAL PHASE (Bot is target of incoming trade)
    if (gameState.activeTrade && (gameState.activeTrade.toPlayerId === bot.id || gameState.activeTrade.targetId === bot.id)) {
      return this.decideTradeResponse(gameState, bot, difficulty);
    }

    // Check if it's the bot's turn
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== bot.id) {
      return null;
    }

    // 3. EMERGENCY DEBT RESOLUTION (money < 0)
    if (bot.money < 0) {
      return this.decideDebtResolution(gameState, bot, difficulty);
    }

    // 4. ROLLING PHASE (Start of turn / Jail)
    if (gameState.status === 'ROLLING') {
      if (bot.inJail) {
        return this.decideJailAction(gameState, bot, difficulty);
      }
      return { type: 'ROLL_DICE' };
    }

    // 5. AWAITING ACTION PHASE (Landed on unowned property)
    if (
      gameState.status === 'AWAITING_ACTION' ||
      gameState.status === 'ACTION'
    ) {
      if (gameState.pendingAction?.type === 'BUY_PROPERTY') {
        return this.decidePropertyPurchase(gameState, bot, difficulty);
      }
    }

    // 6. TURN_END PHASE (Upgrades, Mortgages, Proactive Trades, End Turn)
    if (gameState.status === 'TURN_END') {
      // 6a. Try building improvements if viable
      const buildAction = this.decideBuildingAction(gameState, bot, difficulty);
      if (buildAction) return buildAction;

      // 6b. Try unmortgaging if rich
      const unmortgageAction = this.decideUnmortgageAction(gameState, bot, difficulty);
      if (unmortgageAction) return unmortgageAction;

      // 6c. Try proposing a strategic trade (occasional)
      const tradeAction = this.decideProactiveTrade(gameState, bot, difficulty);
      if (tradeAction) return tradeAction;

      // 6d. End turn
      return { type: 'END_TURN' };
    }

    return null;
  }

  // =========================================================================
  // 1. PROPERTY PURCHASE DECISION
  // =========================================================================
  static decidePropertyPurchase(gameState, bot, difficulty) {
    const tileId = gameState.pendingAction?.tileId;
    const tile = gameState.board[tileId];
    if (!tile || !tile.price) {
      return { type: 'PASS_PROPERTY', tileId };
    }

    const price = tile.price;
    if (bot.money < price) {
      return { type: 'PASS_PROPERTY', tileId };
    }

    // Check strategic value
    const groupTiles = gameState.board.filter(t => t.group && t.group === tile.group);
    const botOwnedInGroup = groupTiles.filter(t => t.ownerId === bot.id).length;
    const completesMonopoly = (groupTiles.length > 0 && botOwnedInGroup === groupTiles.length - 1);

    // Check if opponent is about to complete monopoly
    const opponents = gameState.players.filter(p => p.id !== bot.id && !p.isBankrupt);
    const blocksOpponent = opponents.some(opp => {
      const oppOwnedInGroup = groupTiles.filter(t => t.ownerId === opp.id).length;
      return oppOwnedInGroup === groupTiles.length - 1;
    });

    let requiredReserve = 0;
    if (difficulty === 'careful') {
      requiredReserve = completesMonopoly ? 100 : Math.max(250, price * 1.2);
    } else if (difficulty === 'balanced') {
      requiredReserve = (completesMonopoly || blocksOpponent) ? 0 : Math.max(100, price * 0.4);
    } else { // aggressive
      requiredReserve = 0;
    }

    if (bot.money - price >= requiredReserve) {
      return { type: 'BUY_PROPERTY', tileId };
    }

    return { type: 'PASS_PROPERTY', tileId };
  }

  // =========================================================================
  // 2. BUILDING / IMPROVEMENTS DECISION
  // =========================================================================
  static decideBuildingAction(gameState, bot, difficulty) {
    const mode = gameState.mode || 'standard';
    const builtThisTurn = gameState.builtTilesThisTurn || [];

    // Find all full monopolies owned by bot
    const ownedGroups = new Set();
    gameState.board.forEach(t => {
      if (t.type === 'property' && t.group && MonopolyManager.hasMonopoly(gameState.board, bot.id, t.group)) {
        ownedGroups.add(t.group);
      }
    });

    if (ownedGroups.size === 0) return null;

    let minReserve = 200;
    if (difficulty === 'careful') minReserve = 450;
    else if (difficulty === 'balanced') minReserve = 200;
    else minReserve = 80;

    for (const groupId of ownedGroups) {
      const groupTiles = MonopolyManager.getGroupTiles(gameState.board, groupId);
      if (groupTiles.some(t => t.isMortgaged)) continue;

      // Find eligible tile with least houses (uniform building)
      const maxAllowedHouses = mode === 'blitz' ? 1 : 5;
      const unmaxedTiles = groupTiles.filter(t => (t.houses || 0) < maxAllowedHouses);
      if (unmaxedTiles.length === 0) continue;

      // Sort by lowest houses first
      unmaxedTiles.sort((a, b) => (a.houses || 0) - (b.houses || 0));
      const targetTile = unmaxedTiles[0];

      const housePrice = targetTile.housePrice || 50;
      if (bot.money >= housePrice + minReserve) {
        const canBuild = MonopolyManager.canBuildHouse(bot, gameState.board, targetTile.id, {
          mode,
          builtTilesThisTurn: builtThisTurn
        });

        if (canBuild.allowed) {
          return { type: 'BUILD_HOUSE', tileId: targetTile.id };
        }
      }
    }

    return null;
  }

  // =========================================================================
  // 3. AUCTION DECISION
  // =========================================================================
  static decideAuctionAction(gameState, bot, difficulty) {
    const auction = gameState.activeAuction;
    if (!auction || auction.isCompleted) return null;

    // If bot is already highest bidder, wait
    if (auction.highestBidderId === bot.id) return null;

    // If bot is not in active bidders list, wait
    if (Array.isArray(auction.activeBidders) && !auction.activeBidders.includes(bot.id)) {
      return null;
    }

    const tile = gameState.board[auction.tileId];
    if (!tile) return { type: 'PASS_AUCTION' };

    const nominalPrice = tile.price || 100;
    const currentBid = auction.currentBid || 0;
    const minStep = auction.minIncrement || 10;
    const nextBid = auction.isDirectOffer
      ? nominalPrice
      : (auction.highestBidderId === null ? currentBid : currentBid + minStep);

    // Check strategic value
    const groupTiles = gameState.board.filter(t => t.group && t.group === tile.group);
    const botOwned = groupTiles.filter(t => t.ownerId === bot.id).length;
    const completesMonopoly = (groupTiles.length > 0 && botOwned === groupTiles.length - 1);

    // Opponent block
    const opponents = gameState.players.filter(p => p.id !== bot.id && !p.isBankrupt);
    const blocksOpponent = opponents.some(opp => {
      const oppOwned = groupTiles.filter(t => t.ownerId === opp.id).length;
      return oppOwned === groupTiles.length - 1;
    });

    // Direct Purchase Offer evaluation (1-on-1 direct pass from opponent)
    if (auction.isDirectOffer) {
      if (bot.money < nominalPrice) {
        return { type: 'PASS_AUCTION' };
      }
      let directReserve = 0;
      if (difficulty === 'careful') {
        directReserve = completesMonopoly ? 50 : Math.max(80, nominalPrice * 0.4);
      } else if (difficulty === 'balanced') {
        directReserve = (completesMonopoly || blocksOpponent) ? 0 : Math.max(20, nominalPrice * 0.15);
      } else {
        directReserve = 0;
      }

      if (bot.money - nominalPrice >= directReserve) {
        return { type: 'PLACE_BID', amount: nominalPrice };
      }
      return { type: 'PASS_AUCTION' };
    }

    let maxBidMultiplier = 1.0;
    if (difficulty === 'careful') maxBidMultiplier = 0.85;
    else if (difficulty === 'balanced') maxBidMultiplier = 1.10;
    else maxBidMultiplier = 1.35;

    if (completesMonopoly) maxBidMultiplier *= 1.55;
    else if (blocksOpponent) maxBidMultiplier *= 1.25;

    const maxWillingBid = Math.floor(nominalPrice * maxBidMultiplier);

    // Reserve constraint
    const minReserve = (difficulty === 'careful') ? 150 : (difficulty === 'balanced' ? 50 : 0);

    if (nextBid <= maxWillingBid && bot.money - nextBid >= minReserve) {
      return { type: 'PLACE_BID', amount: nextBid };
    }

    return { type: 'PASS_AUCTION' };
  }

  // =========================================================================
  // 4. TRADE EVALUATION & PROPOSAL
  // =========================================================================
  static evaluateProperty(tile, board, ownerId, isGaining) {
    if (!tile) return 0;
    let val = tile.price || 100;
    if (tile.isMortgaged) val *= 0.5;

    const groupTiles = MonopolyManager.getGroupTiles(board, tile.group);
    if (groupTiles.length > 0) {
      const ownedCount = groupTiles.filter(t => t.ownerId === ownerId).length;
      
      if (isGaining) {
        // If gaining this tile completes a monopoly:
        if (ownedCount === groupTiles.length - 1) {
          val *= 2.3;
        } else if (ownedCount > 0) {
          val *= 1.4;
        }
      } else {
        // If giving away breaks a monopoly:
        if (MonopolyManager.hasMonopoly(board, ownerId, tile.group)) {
          val *= 2.8;
        } else if (ownedCount > 1) {
          val *= 1.5;
        }
      }
    }
    return val;
  }

  static decideTradeResponse(gameState, bot, difficulty) {
    const trade = gameState.activeTrade;
    if (!trade) return null;
    const recipientId = trade.toPlayerId || trade.targetId;
    if (recipientId !== bot.id) return null;

    const offerMoney = trade.offer ? (trade.offer.money || 0) : (trade.offerMoney || trade.offerCash || 0);
    const requestMoney = trade.request ? (trade.request.money || 0) : (trade.requestMoney || trade.requestCash || 0);
    const offerProps = trade.offer ? (trade.offer.properties || []) : (trade.offerProperties || []);
    const requestProps = trade.request ? (trade.request.properties || []) : (trade.requestProperties || []);

    // If request asks for more money than bot has
    if (requestMoney > bot.money) {
      return { type: 'REJECT_TRADE' };
    }

    // Valuation of what bot receives (the trade offer from the other player)
    let receivedVal = offerMoney;
    offerProps.forEach(tId => {
      const tile = gameState.board[tId];
      if (tile) {
        receivedVal += this.evaluateProperty(tile, gameState.board, bot.id, true);
      }
    });

    // Valuation of what bot gives away (the trade request to the bot)
    let givenVal = requestMoney;
    requestProps.forEach(tId => {
      const tile = gameState.board[tId];
      if (tile) {
        givenVal += this.evaluateProperty(tile, gameState.board, bot.id, false);
      }
    });

    // If bot receives nothing and is asked for something -> reject
    if (receivedVal === 0 && givenVal > 0) {
      return { type: 'REJECT_TRADE' };
    }

    const ratio = receivedVal / Math.max(1, givenVal);

    let threshold = 1.0;
    if (difficulty === 'careful') threshold = 1.15;
    else if (difficulty === 'balanced') threshold = 0.95;
    else threshold = 0.85;

    if (ratio >= threshold) {
      return { type: 'ACCEPT_TRADE' };
    }

    return { type: 'REJECT_TRADE' };
  }

  static decideProactiveTrade(gameState, bot, difficulty) {
    // 25% chance to consider proposing a trade during turn end
    if (Math.random() > 0.28) return null;

    // Find if bot is missing exactly 1 property to complete a monopoly
    const candidateGroups = [];
    const allGroups = new Set(gameState.board.filter(t => t.group).map(t => t.group));

    for (const groupId of allGroups) {
      const groupTiles = MonopolyManager.getGroupTiles(gameState.board, groupId);
      if (groupTiles.length <= 1) continue;
      const botTiles = groupTiles.filter(t => t.ownerId === bot.id);
      const unownedTiles = groupTiles.filter(t => t.ownerId !== bot.id && t.ownerId !== null);

      if (botTiles.length === groupTiles.length - 1 && unownedTiles.length === 1) {
        const targetTile = unownedTiles[0];
        const targetOwner = gameState.players.find(p => p.id === targetTile.ownerId && !p.isBankrupt);
        if (targetOwner && targetOwner.id !== bot.id) {
          candidateGroups.push({ targetTile, targetOwner });
        }
      }
    }

    if (candidateGroups.length === 0) return null;
    const { targetTile, targetOwner } = candidateGroups[0];

    // Find a spare property of bot (where bot has only 1 tile in group) to trade
    const botSpareTiles = gameState.board.filter(t => {
      if (t.ownerId !== bot.id || t.type !== 'property') return false;
      const gTiles = MonopolyManager.getGroupTiles(gameState.board, t.group);
      const botInGroup = gTiles.filter(gt => gt.ownerId === bot.id).length;
      return botInGroup === 1 && (t.houses || 0) === 0;
    });

    const offerTile = botSpareTiles[0] || null;
    const offerMoney = Math.min(bot.money - 100, Math.max(50, targetTile.price || 100));

    if (offerMoney < 0 && !offerTile) return null;

    return {
      type: 'PROPOSE_TRADE',
      targetId: targetOwner.id,
      offerMoney: Math.max(0, offerMoney),
      offerProperties: offerTile ? [offerTile.id] : [],
      requestMoney: 0,
      requestProperties: [targetTile.id]
    };
  }

  // =========================================================================
  // 5. JAIL DECISION
  // =========================================================================
  static decideJailAction(gameState, bot, difficulty) {
    if (bot.jailFreeCards > 0) {
      return { type: 'USE_JAIL_CARD' };
    }

    if ((bot.jailTurns || 0) >= 3) {
      return { type: 'PAY_BAIL' };
    }

    // In blitz mode or late game with enough money -> pay bail to keep moving
    const isLateGame = (gameState.gameDurationSeconds || 0) > 300;
    if (bot.money >= 350 && (difficulty === 'aggressive' || isLateGame)) {
      return { type: 'PAY_BAIL' };
    }

    return { type: 'ROLL_JAIL_DICE' };
  }

  // =========================================================================
  // 6. EMERGENCY DEBT RESOLUTION
  // =========================================================================
  static decideDebtResolution(gameState, bot, difficulty) {
    const debt = Math.abs(bot.money);

    // Step 1: Sell houses back to bank
    const tilesWithHouses = gameState.board.filter(t => t.ownerId === bot.id && (t.houses || 0) > 0);
    if (tilesWithHouses.length > 0) {
      // Pick tile with houses that is least critical
      tilesWithHouses.sort((a, b) => (a.housePrice || 50) - (b.housePrice || 50));
      for (const t of tilesWithHouses) {
        const canSell = MonopolyManager.canSellHouse(bot, gameState.board, t.id);
        if (canSell.allowed) {
          return { type: 'SELL_HOUSE', tileId: t.id };
        }
      }
    }

    // Step 2: Mortgage unmortgaged properties with 0 houses
    const unmortgaged = gameState.board.filter(t => {
      return t.ownerId === bot.id && !t.isMortgaged && (t.houses || 0) === 0;
    });

    if (unmortgaged.length > 0) {
      // Sort least valuable properties first
      unmortgaged.sort((a, b) => (a.price || 0) - (b.price || 0));
      return { type: 'MORTGAGE', tileId: unmortgaged[0].id };
    }

    // Step 3: If still negative and no liquid assets left
    return { type: 'DECLARE_BANKRUPTCY' };
  }

  // =========================================================================
  // 7. UNMORTGAGE DECISION
  // =========================================================================
  static decideUnmortgageAction(gameState, bot, difficulty) {
    const mortgaged = gameState.board.filter(t => t.ownerId === bot.id && t.isMortgaged);
    if (mortgaged.length === 0) return null;

    // Unmortgage highest value properties first
    mortgaged.sort((a, b) => (b.price || 0) - (a.price || 0));
    const target = mortgaged[0];
    const baseValue = target.mortgageValue || Math.floor((target.price || 100) / 2);
    const cost = Math.ceil(baseValue * 1.10);

    const minReserve = (difficulty === 'careful') ? 500 : (difficulty === 'balanced' ? 300 : 150);

    if (bot.money >= cost + minReserve) {
      return { type: 'UNMORTGAGE', tileId: target.id };
    }

    return null;
  }
}

module.exports = BotEngine;
