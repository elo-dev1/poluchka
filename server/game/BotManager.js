/**
 * BotManager.js - Server-side runner and lifecycle coordinator for bots
 * 
 * Schedules bot actions with humanized delays (1000–2200ms)
 * and executes decisions via standard GameEngine methods.
 */

const BotEngine = require('./botEngine');

class BotManager {
  constructor() {
    this.scheduledTimers = new Map(); // roomId -> Timeout ID
    this.autofillTimers = new Map();  // roomId -> Timeout ID
  }

  clearGameTimers(roomId) {
    if (this.scheduledTimers.has(roomId)) {
      clearTimeout(this.scheduledTimers.get(roomId));
      this.scheduledTimers.delete(roomId);
    }
    if (this.autofillTimers.has(roomId)) {
      clearTimeout(this.autofillTimers.get(roomId));
      this.autofillTimers.delete(roomId);
    }
  }

  /**
   * Check if any bot needs to act, and schedule action with realistic thinking delay
   */
  scheduleBotActionIfNeeded(game, broadcastCallback) {
    if (!game || game.status === 'LOBBY' || game.status === 'GAME_OVER') {
      return;
    }

    const roomId = game.roomId;
    if (this.scheduledTimers.has(roomId)) {
      return; // Action already pending
    }

    const botPlayers = game.players.filter(p => p.isBot && !p.isBankrupt);
    if (botPlayers.length === 0) return;

    // Check who needs to act:
    const currentPlayer = game.getCurrentPlayer();
    let targetBot = null;

    if (game.activeTrade) {
      // 1. Prioritize bot recipient responding to incoming trade
      const recipientId = game.activeTrade.toPlayerId || game.activeTrade.targetId;
      targetBot = botPlayers.find(b => b.id === recipientId);
    } else if (game.status === 'AUCTION' && game.activeAuction && !game.activeAuction.isCompleted) {
      // 2. Find bot bidder in active auction
      targetBot = botPlayers.find(b => {
        return (
          game.activeAuction.highestBidderId !== b.id &&
          Array.isArray(game.activeAuction.activeBidders) &&
          game.activeAuction.activeBidders.includes(b.id)
        );
      });
    } else if (currentPlayer && currentPlayer.isBot && !currentPlayer.isBankrupt) {
      // 3. Current turn player bot
      targetBot = currentPlayer;
    }

    if (!targetBot) return;

    // Humanized thinking delay: 1000ms - 2200ms (trade evaluation is slightly longer)
    const baseDelay = game.activeTrade ? 1600 : 1100;
    const delay = Math.floor(baseDelay + Math.random() * 800);

    const timer = setTimeout(() => {
      this.scheduledTimers.delete(roomId);
      this.executeBotAction(game, targetBot.id, broadcastCallback);
    }, delay);

    this.scheduledTimers.set(roomId, timer);
  }

  /**
   * Execute decision through standard GameEngine methods
   */
  executeBotAction(game, botId, broadcastCallback) {
    if (!game || game.status === 'LOBBY' || game.status === 'GAME_OVER') return;

    const bot = game.players.find(p => p.id === botId);
    if (!bot || bot.isBankrupt) return;

    const decision = BotEngine.getDecision(game, botId);
    if (!decision) return;

    try {
      switch (decision.type) {
        case 'ROLL_DICE':
          game.rollDice(botId);
          break;

        case 'PAY_BAIL':
          game.payBail(botId);
          break;

        case 'USE_JAIL_CARD':
          game.useJailCard(botId);
          break;

        case 'ROLL_JAIL_DICE':
          game.rollJailDice(botId);
          break;

        case 'BUY_PROPERTY':
          game.buyProperty(botId);
          break;

        case 'PASS_PROPERTY':
          game.passProperty(botId);
          break;

        case 'BUILD_HOUSE':
          game.buildHouse(botId, decision.tileId);
          break;

        case 'SELL_HOUSE':
          game.sellHouse(botId, decision.tileId);
          break;

        case 'MORTGAGE':
          game.mortgageProperty(botId, decision.tileId);
          break;

        case 'UNMORTGAGE':
          game.unmortgageProperty(botId, decision.tileId);
          break;

        case 'PLACE_BID':
          if (typeof game.placeBid === 'function') {
            game.placeBid(botId, decision.amount);
          } else if (typeof game.placeAuctionBid === 'function') {
            game.placeAuctionBid(botId, decision.amount);
          }
          break;

        case 'PASS_AUCTION':
          if (typeof game.passBid === 'function') {
            game.passBid(botId);
          } else if (typeof game.passAuction === 'function') {
            game.passAuction(botId);
          }
          break;

        case 'ACCEPT_TRADE':
          game.acceptTrade(botId);
          break;

        case 'REJECT_TRADE':
          game.rejectTrade(botId);
          break;

        case 'PROPOSE_TRADE':
          game.proposeTrade(
            botId,
            decision.targetId,
            { money: decision.offerMoney, properties: decision.offerProperties },
            { money: decision.requestMoney, properties: decision.requestProperties }
          );
          break;

        case 'DECLARE_BANKRUPTCY':
          game.declareBankruptcy(botId);
          break;

        case 'END_TURN':
          game.endTurn(botId);
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn(`[BotManager] Error executing ${decision.type} for bot ${bot.name}:`, err.message);
      // Fallback: If turn ended or stuck, try passing or ending turn
      if (game.getCurrentPlayer()?.id === botId) {
        if (game.status === 'TURN_END' && bot.money >= 0) {
          try { game.endTurn(botId); } catch (e) {}
        } else if (game.status === 'AWAITING_ACTION') {
          try { game.passProperty(botId); } catch (e) {}
        }
      }
    }

    if (typeof broadcastCallback === 'function') {
      broadcastCallback(game);
    }

    // Schedule next bot step if needed (e.g. after buyProperty -> TURN_END)
    this.scheduleBotActionIfNeeded(game, broadcastCallback);
  }
}

module.exports = new BotManager();
