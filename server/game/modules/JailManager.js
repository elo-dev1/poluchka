const { GAME_SETTINGS } = require('../../config/boardConfig');

class JailManager {
  /**
   * Send a player to Jail
   */
  static sendToJail(player, board = null) {
    if (board && Array.isArray(board)) {
      const jailTile = board.find(t => t.type === 'jail');
      player.position = jailTile ? jailTile.id : (board.length === 40 ? 10 : 6);
    } else {
      player.position = GAME_SETTINGS.JAIL_TILE_INDEX;
    }
    player.inJail = true;
    player.jailTurns = 0;
    player.skipNextTurn = false;
  }

  /**
   * Pay bail to leave jail ($50)
   */
  static payBail(player) {
    if (!player.inJail) {
      throw new Error('Игрок не находится в тюрьме');
    }
    const bail = GAME_SETTINGS.JAIL_BAIL_AMOUNT || 50;
    if (player.money < bail) {
      throw new Error(`Недостаточно денег для оплаты залога ($${player.money} / $${bail})`);
    }

    player.money -= bail;
    player.inJail = false;
    player.jailTurns = 0;

    return {
      success: true,
      bailAmount: bail
    };
  }

  /**
   * Use "Get Out of Jail Free" card
   */
  static useJailCard(player) {
    if (!player.inJail) {
      throw new Error('Игрок не находится в тюрьме');
    }
    if ((player.jailFreeCards || 0) <= 0) {
      throw new Error('У вас нет карты освобождения из тюрьмы');
    }

    player.jailFreeCards--;
    player.inJail = false;
    player.jailTurns = 0;

    return {
      success: true,
      remainingCards: player.jailFreeCards
    };
  }

  /**
   * Handle rolling dice while in jail
   */
  static handleJailRoll(player, die1, die2) {
    if (!player.inJail) {
      return { inJail: false };
    }

    const isDouble = die1 === die2;
    const sum = die1 + die2;

    if (isDouble) {
      // Released by doubles!
      player.inJail = false;
      player.jailTurns = 0;
      return {
        released: true,
        reason: 'double',
        sum,
        die1,
        die2
      };
    }

    // Not doubles
    player.jailTurns = (player.jailTurns || 0) + 1;
    const maxTurns = GAME_SETTINGS.MAX_JAIL_TURNS || 3;

    if (player.jailTurns >= maxTurns) {
      // Forced bail on 3rd turn
      const bail = GAME_SETTINGS.JAIL_BAIL_AMOUNT || 50;
      return {
        released: true,
        forcedBail: true,
        bailAmount: bail,
        reason: 'max_turns_bail',
        sum,
        die1,
        die2
      };
    }

    // Still in jail
    return {
      released: false,
      reason: 'no_double',
      jailTurns: player.jailTurns,
      maxTurns,
      sum,
      die1,
      die2
    };
  }
}

module.exports = JailManager;
