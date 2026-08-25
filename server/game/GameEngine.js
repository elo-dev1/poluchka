const { BOARD_TILES, BOARD_TILES_40, BOARD_TILES_24, GAME_SETTINGS } = require('../config/boardConfig');
const { PET_CHARACTERS } = require('../config/petCharacters');
const { CHANCE_CARDS, CHEST_CARDS } = require('../config/cardsConfig');
const MonopolyManager = require('./modules/MonopolyManager');
const MortgageManager = require('./modules/MortgageManager');
const AuctionManager = require('./modules/AuctionManager');
const TradeManager = require('./modules/TradeManager');
const JailManager = require('./modules/JailManager');
const database = require('../db/Database');

class GameEngine {
  constructor(roomId, hostId, options = {}) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.status = 'LOBBY'; // LOBBY, ROLLING, AWAITING_ACTION, TURN_END, AUCTION, GAME_OVER
    this.isPrivate = !!options.isPrivate;
    this.maxPlayers = options.maxPlayers || GAME_SETTINGS.MAX_PLAYERS || 6;
    this.mode = options.mode || 'standard'; // 'standard' (40 tiles) | 'blitz' (24 tiles)
    this.boardSize = options.boardSize || (this.mode === 'blitz' ? 24 : 40);
    this.startingCash = options.startingCash || GAME_SETTINGS.STARTING_CASH || 1500;

    this.players = [];
    this.currentTurnIndex = 0;
    this.turnNumber = 1;
    this.roundNumber = 1;
    
    const sourceTiles = this.boardSize === 24 ? BOARD_TILES_24 : BOARD_TILES_40;
    this.board = sourceTiles.map(tile => ({
      ...tile,
      ownerId: null,
      houses: 0,
      isMortgaged: false
    }));
    this.lastDice = null;
    this.pendingAction = null; // { type: 'BUY_PROPERTY', tileId, price }
    this.rolledDoubleInCurrentTurn = false;
    this.activeAuction = null;
    this.activeTrade = null;
    this.lastDrawnCard = null;
    this.builtTilesThisTurn = [];
    this.logs = [];
    this.winner = null;
    this.everHadBot = false;

    // Card Decks with non-repeating shuffle
    this.chanceDeck = [...CHANCE_CARDS].sort(() => Math.random() - 0.5);
    this.chestDeck = [...CHEST_CARDS].sort(() => Math.random() - 0.5);

    // Timestamps and game stats
    this.createdAt = Date.now();
    this.startedAt = null;
    this.endedAt = null;
    this.stats = {
      totalRentPaid: 0,
      totalHousesBuilt: 0,
      totalCardDraws: 0,
      totalTradesCompleted: 0,
      totalAuctionsCompleted: 0
    };

    // Turn timer placeholders
    this.turnTimer = null;
    this.turnStartedAt = null;
    this.turnTimeoutSeconds = GAME_SETTINGS.TURN_TIMEOUT_SECONDS || 60;
    this.onStateChangeCallback = null;

    // Disconnect Waiting & Anti-Abuse State
    this.disconnectWaitingState = null; // { disconnectedPlayerId, disconnectedPlayerName, remainingSeconds }
    this.disconnectInterval = null;
    this.activePlayTrackerInterval = null;
  }

  setStateChangeCallback(cb) {
    this.onStateChangeCallback = cb;
  }

  notifyStateChange() {
    if (typeof this.onStateChangeCallback === 'function') {
      this.onStateChangeCallback(this);
    }
  }

  addLog(text, type = 'info', icon = 'ℹ️') {
    const logEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text,
      type, // 'info', 'success', 'warning', 'danger', 'dice', 'money', 'property', 'trade', 'build'
      icon,
      timestamp: Date.now()
    };
    this.logs.push(logEntry);
    if (this.logs.length > 120) {
      this.logs.shift();
    }
    return logEntry;
  }

  addPlayer(id, name, options = {}) {
    if (this.status !== 'LOBBY') {
      throw new Error('Игра уже началась');
    }
    if (this.players.length >= GAME_SETTINGS.MAX_PLAYERS) {
      throw new Error(`В комнате уже максимум игроков (${GAME_SETTINGS.MAX_PLAYERS})`);
    }

    const availableColors = GAME_SETTINGS.PLAYER_COLORS.filter(
      c => !this.players.some(p => p.color.hex === c.hex)
    );
    const color = availableColors[0] || GAME_SETTINGS.PLAYER_COLORS[this.players.length % GAME_SETTINGS.PLAYER_COLORS.length];

    const defaultChar = PET_CHARACTERS[this.players.length % PET_CHARACTERS.length]?.id || 'cat';
    const characterId = options.characterId || defaultChar;

    const player = {
      id,
      name: (name || '').trim() || `Игрок ${this.players.length + 1}`,
      color,
      characterId,
      money: GAME_SETTINGS.STARTING_CASH,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailFreeCards: 0,
      skipNextTurn: false,
      isBankrupt: false,
      isConnected: true,
      telegramId: options.telegramId || null,
      username: options.username || null,
      avatarUrl: options.avatarUrl || null,
      disconnectBudgetSeconds: 60, // 1 min initial disconnect pool
      activePlaySeconds: 0, // Accumulator for 5 min replenishment
      missedTurns: 0, // AFK strike counter (2 strikes = defeat)
      properties: []
    };

    this.players.push(player);
    this.addLog(`${player.name} присоединился к игре`, 'info', player.color.icon);
    return player;
  }

  addBot(options = {}) {
    if (this.status !== 'LOBBY') {
      throw new Error('Ботов можно добавлять только в лобби перед началом игры');
    }
    if (this.players.length >= GAME_SETTINGS.MAX_PLAYERS) {
      throw new Error(`В комнате уже максимум игроков (${GAME_SETTINGS.MAX_PLAYERS})`);
    }

    const difficulty = options.difficulty || 'balanced'; // 'careful' | 'balanced' | 'aggressive'
    const availableColors = GAME_SETTINGS.PLAYER_COLORS.filter(
      c => !this.players.some(p => p.color.hex === c.hex)
    );
    const color = availableColors[0] || GAME_SETTINGS.PLAYER_COLORS[this.players.length % GAME_SETTINGS.PLAYER_COLORS.length];

    // Pick unique character if available
    const usedChars = new Set(this.players.map(p => p.characterId));
    const availableChar = PET_CHARACTERS.find(ch => !usedChars.has(ch.id)) || PET_CHARACTERS[this.players.length % PET_CHARACTERS.length];
    const characterId = availableChar ? availableChar.id : 'cat';

    const diffLabels = {
      careful: 'Осторожный',
      balanced: 'Баланс',
      aggressive: 'Агрессор'
    };
    const diffLabel = diffLabels[difficulty] || 'Баланс';
    const petName = availableChar ? availableChar.name : 'Бот';

    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const botPlayer = {
      id: botId,
      name: `${petName} (${diffLabel})`,
      color,
      characterId,
      money: GAME_SETTINGS.STARTING_CASH,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailFreeCards: 0,
      skipNextTurn: false,
      isBankrupt: false,
      isConnected: true,
      isBot: true,
      botDifficulty: difficulty,
      telegramId: null,
      username: null,
      avatarUrl: null,
      disconnectBudgetSeconds: 60,
      activePlaySeconds: 0,
      missedTurns: 0,
      properties: []
    };

    this.players.push(botPlayer);
    this.everHadBot = true;
    this.addLog(`🤖 Бот ${botPlayer.name} добавлен в комнату`, 'info', '🤖');
    this.notifyStateChange();
    return botPlayer;
  }

  removeBot(botId) {
    if (this.status !== 'LOBBY') {
      throw new Error('Бота можно удалить только в лобби');
    }
    const index = this.players.findIndex(p => p.id === botId && p.isBot);
    if (index === -1) {
      throw new Error('Бот не найден');
    }
    const removedBot = this.players.splice(index, 1)[0];
    this.addLog(`🤖 Бот ${removedBot.name} удален из комнаты`, 'info', '🚪');
    this.notifyStateChange();
    return removedBot;
  }

  /**
   * Replace an active bot slot with a newly connected human player (Requirement 10)
   * The bot's properties/balance/position are reset from scratch for the human.
   */
  replaceBotWithHuman(botId, humanId, humanName, options = {}) {
    const index = this.players.findIndex(p => p.id === botId && p.isBot);
    if (index === -1) {
      throw new Error('Бот для замены не найден');
    }

    const oldBot = this.players[index];

    // Release any properties previously owned by the bot back to the bank
    this.board.forEach(tile => {
      if (tile.ownerId === oldBot.id) {
        tile.ownerId = null;
        tile.houses = 0;
        tile.isMortgaged = false;
      }
    });

    // Create fresh human player in the same slot
    const newPlayer = {
      id: humanId,
      name: (humanName || '').trim() || `Игрок ${index + 1}`,
      color: oldBot.color,
      characterId: options.characterId || oldBot.characterId || 'cat',
      money: GAME_SETTINGS.STARTING_CASH,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailFreeCards: 0,
      skipNextTurn: false,
      isBankrupt: false,
      isConnected: true,
      isBot: false,
      telegramId: options.telegramId || null,
      username: options.username || null,
      avatarUrl: options.avatarUrl || null,
      disconnectBudgetSeconds: 60,
      activePlaySeconds: 0,
      missedTurns: 0,
      properties: []
    };

    this.players[index] = newPlayer;
    this.everHadBot = true;
    this.addLog(`👤 ${newPlayer.name} заменил бота ${oldBot.name} и вступил в игру!`, 'success', '⚡');
    this.notifyStateChange();
    return newPlayer;
  }

  setCharacter(playerId, characterId) {
    if (this.status !== 'LOBBY') {
      throw new Error('Персонажа можно менять только в лобби перед началом игры');
    }
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Игрок не найден');
    }
    player.characterId = characterId;
    this.notifyStateChange();
    return player;
  }

  removePlayer(playerId, isExplicitLeave = false) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) return null;

    const player = this.players[index];

    if (this.status === 'LOBBY') {
      this.players.splice(index, 1);
      if (this.hostId === playerId && this.players.length > 0) {
        this.hostId = this.players[0].id;
        this.addLog(`${this.players[0].name} стал новым хостом комнаты`, 'warning', '👑');
      }
      this.addLog(`${player.name} покинул комнату`, 'warning', '🚪');
    } else if (this.status === 'GAME_OVER') {
      player.isConnected = false;
      this.addLog(`${player.name} покинул комнату`, 'info', '🚪');
    } else {
      // In active game:
      if (isExplicitLeave) {
        player.isConnected = false;
        player.isBankrupt = true;
        player.disqualifiedReason = 'LEFT_GAME';

        // Release properties back to bank
        this.board.forEach(tile => {
          if (tile.ownerId === player.id) {
            tile.ownerId = null;
            tile.houses = 0;
            tile.isMortgaged = false;
          }
        });
        player.properties = [];

        this.addLog(`🚪 ${player.name} покинул игру`, 'warning', '🚪');

        // Check if only 1 active player remains
        const remainingActive = this.players.filter(p => !p.isBankrupt);
        if (remainingActive.length <= 1) {
          this.winner = remainingActive[0] || null;
          this.status = 'GAME_OVER';
          this.endedAt = Date.now();
          this.clearTurnTimer();
          this.stopDisconnectWaitingTimer();
          this.stopActivePlayTracker();
          this.recordFinalGameResults();
          this.addLog(`🏆 ${this.winner ? this.winner.name : 'Оставшийся игрок'} побеждает автоматически! Все соперники покинули игру.`, 'success', '👑');
          this.notifyStateChange();
          return player;
        }

        // If active auction in progress and leaving player was involved, pass bid
        if (this.activeAuction && this.status === 'AUCTION') {
          try {
            AuctionManager.passBid(this.activeAuction, player.id);
            if (this.activeAuction.isCompleted) {
              this.finishAuction();
            }
          } catch (e) {}
        }

        // Advance turn if it was their turn
        if (this.getCurrentPlayer() && this.getCurrentPlayer().id === playerId) {
          this.advanceToNextPlayer();
        }
        this.notifyStateChange();
      } else {
        player.isConnected = false;
        this.addLog(`${player.name} отключился`, 'warning', '⚠️');
        this.checkConnectedPlayersThreshold(player);
      }
    }

    return player;
  }

  reconnectPlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.isConnected = true;
      this.addLog(`${player.name} вернулся в игру!`, 'success', '⚡');

      // Check if we were waiting for disconnected players
      const connectedActive = this.getConnectedActivePlayers();
      if (connectedActive.length >= 2 && this.disconnectWaitingState) {
        this.stopDisconnectWaitingTimer();
        this.addLog(`🎮 Игрок вернулся. Игра возобновлена! (Остаток банка времени: ${player.disconnectBudgetSeconds}с)`, 'success', '▶️');
        const resumeSeconds = this.pausedTurnRemainingSeconds !== undefined ? this.pausedTurnRemainingSeconds : 60;
        this.resetTurnTimer(resumeSeconds);
        this.pausedTurnRemainingSeconds = undefined;
      }
    }
    return player;
  }

  getCurrentPlayer() {
    if (this.players.length === 0) return null;
    return this.players[this.currentTurnIndex];
  }

  getActivePlayers() {
    return this.players.filter(p => !p.isBankrupt);
  }

  getConnectedActivePlayers() {
    return this.players.filter(p => !p.isBankrupt && p.isConnected);
  }

  // --- Disconnect Waiting & Anti-Abuse Budget Manager ---
  checkConnectedPlayersThreshold(disconnectedPlayer) {
    if (this.status === 'LOBBY' || this.status === 'GAME_OVER') return;

    const connectedActive = this.getConnectedActivePlayers();
    if (connectedActive.length < 2) {
      // Less than 2 players connected -> start 1 min disconnect countdown
      this.startDisconnectWaitingTimer(disconnectedPlayer);
    }
  }

  startDisconnectWaitingTimer(targetPlayer) {
    this.stopDisconnectWaitingTimer();
    
    // Save remaining turn time before pausing
    const currentRemaining = this.turnStartedAt
      ? Math.max(1, this.turnTimeoutSeconds - Math.floor((Date.now() - this.turnStartedAt) / 1000))
      : 60;
    this.pausedTurnRemainingSeconds = currentRemaining;

    this.clearTurnTimer(); // Pause turn timer during disconnect wait

    const remainingBudget = Math.max(0, targetPlayer.disconnectBudgetSeconds || 0);

    if (remainingBudget <= 0) {
      // Out of disconnect time budget immediately
      this.endGameOnDisconnectTimeout(targetPlayer);
      return;
    }

    this.disconnectWaitingState = {
      disconnectedPlayerId: targetPlayer.id,
      disconnectedPlayerName: targetPlayer.name,
      remainingSeconds: remainingBudget
    };

    this.addLog(
      `⏳ В комнате остался 1 игрок. Ожидание переподключения ${targetPlayer.name} (${remainingBudget}с из банка времени)...`,
      'warning',
      '⏳'
    );

    this.disconnectInterval = setInterval(() => {
      if (!this.disconnectWaitingState) return;

      targetPlayer.disconnectBudgetSeconds = Math.max(0, targetPlayer.disconnectBudgetSeconds - 1);
      this.disconnectWaitingState.remainingSeconds = targetPlayer.disconnectBudgetSeconds;

      if (targetPlayer.disconnectBudgetSeconds <= 0) {
        this.stopDisconnectWaitingTimer();
        this.endGameOnDisconnectTimeout(targetPlayer);
      } else {
        this.notifyStateChange();
      }
    }, 1000);

    this.notifyStateChange();
  }

  stopDisconnectWaitingTimer() {
    if (this.disconnectInterval) {
      clearInterval(this.disconnectInterval);
      this.disconnectInterval = null;
    }
    this.disconnectWaitingState = null;
  }

  endGameOnDisconnectTimeout(disconnectedPlayer) {
    this.stopDisconnectWaitingTimer();
    this.clearTurnTimer();

    this.status = 'GAME_OVER';
    this.endedAt = Date.now();

    const connected = this.getConnectedActivePlayers();
    this.winner = connected[0] || null;
    this.recordFinalGameResults();

    this.addLog(
      `⏱️ Время на переподключение игрока ${disconnectedPlayer.name} истекло. Победа присуждена ${this.winner ? this.winner.name : 'оставшемуся игроку'}!`,
      'danger',
      '🏆'
    );

    this.notifyStateChange();
  }

  // --- Active Play Tracker (Restores +60s disconnect budget per 5 min active play) ---
  tickActivePlay() {
    if (this.status === 'GAME_OVER' || this.status === 'LOBBY' || this.disconnectWaitingState) {
      return;
    }

    this.players.forEach(p => {
      if (!p.isBankrupt && p.isConnected) {
        p.activePlaySeconds = (p.activePlaySeconds || 0) + 1;

        // Every 300 seconds (5 minutes) of active gameplay -> replenish 60s
        if (p.activePlaySeconds >= 300) {
          p.activePlaySeconds = 0;
          const prevBudget = p.disconnectBudgetSeconds || 0;
          p.disconnectBudgetSeconds = Math.min(60, prevBudget + 60);
          if (p.disconnectBudgetSeconds > prevBudget) {
            this.addLog(
              `🛡️ ${p.name} активно играет 5 минут! Восстановлена +1 мин в банк времени на отключение (всего: ${p.disconnectBudgetSeconds}с).`,
              'info',
              '⏳'
            );
            this.notifyStateChange();
          }
        }
      }
    });
  }

  startActivePlayTracker() {
    if (this.activePlayTrackerInterval) {
      clearInterval(this.activePlayTrackerInterval);
    }

    this.activePlayTrackerInterval = setInterval(() => {
      this.tickActivePlay();
    }, 1000);
  }

  stopActivePlayTracker() {
    if (this.activePlayTrackerInterval) {
      clearInterval(this.activePlayTrackerInterval);
      this.activePlayTrackerInterval = null;
    }
  }

  // --- Turn Timer (AFK protection) ---
  resetTurnTimer(seconds = GAME_SETTINGS.TURN_TIMEOUT_SECONDS || 60) {
    this.clearTurnTimer();
    if (this.disconnectWaitingState) return; // Don't run turn timer while waiting for reconnect

    this.turnStartedAt = Date.now();
    this.turnTimeoutSeconds = seconds;

    this.turnTimer = setTimeout(() => {
      this.handleTurnTimeout();
    }, seconds * 1000);
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    this.turnStartedAt = null;
  }

  handleTurnTimeout() {
    if (this.status === 'GAME_OVER' || this.status === 'LOBBY' || this.disconnectWaitingState) return;
    const player = this.getCurrentPlayer();
    if (!player) return;

    player.missedTurns = (player.missedTurns || 0) + 1;

    // 2 Missed Turns -> Automatic AFK Defeat
    if (player.missedTurns >= 2) {
      this.addLog(`❌ Игрок ${player.name} дважды не сделал ход за 60с (2 пропуска) и выбывает из игры!`, 'danger', '💀');
      player.isBankrupt = true;
      player.disqualifiedReason = 'AFK_TIMEOUT';

      // Release all owned properties back to the bank
      this.board.forEach(tile => {
        if (tile.ownerId === player.id) {
          tile.ownerId = null;
          tile.houses = 0;
          tile.isMortgaged = false;
        }
      });
      player.properties = [];

      // Check remaining active players
      const activePlayers = this.players.filter(p => !p.isBankrupt);
      if (activePlayers.length <= 1) {
        this.winner = activePlayers[0] || null;
        this.status = 'GAME_OVER';
        this.endedAt = Date.now();
        this.clearTurnTimer();
        this.stopDisconnectWaitingTimer();
        this.stopActivePlayTracker();
        this.recordFinalGameResults();
        this.addLog(`🏆 Победитель партии: ${this.winner ? this.winner.name : 'Ничья'}!`, 'success', '👑');
        this.notifyStateChange();
        return;
      }

      this.advanceToNextPlayer();
      this.notifyStateChange();
      return;
    }

    // If player has negative balance and timed out without resolving debt -> Bankruptcy
    if (player.money < 0) {
      this.addLog(`❌ ${player.name} не погасил задолженность -$${Math.abs(player.money)} за 60с и объявляется банкротом!`, 'danger', '☠️');
      this.handleBankruptcy(player, null);
      if (!this.checkWinCondition()) {
        this.advanceToNextPlayer();
      }
      this.notifyStateChange();
      return;
    }

    // 1st Missed Turn -> Warning and auto-pass
    this.addLog(`⚠️ Игрок ${player.name} не сделал ход за 60с (Пропуск хода: 1/2). Следующий пропуск приведёт к поражению!`, 'warning', '⏳');

    if (this.status === 'AWAITING_ACTION') {
      try {
        this.passProperty(player.id);
      } catch (e) {
        this.advanceToNextPlayer();
      }
    } else {
      this.advanceToNextPlayer();
    }

    this.notifyStateChange();
  }

  startGame(requestingPlayerId) {
    if (requestingPlayerId !== this.hostId) {
      throw new Error('Только создатель комнаты может начать игру');
    }
    if (this.players.length < GAME_SETTINGS.MIN_PLAYERS) {
      throw new Error(`Для игры нужно минимум ${GAME_SETTINGS.MIN_PLAYERS} игрока`);
    }
    if (this.status !== 'LOBBY') {
      throw new Error('Игра уже запущена');
    }

    this.status = 'ROLLING';
    this.startedAt = Date.now();
    this.currentTurnIndex = 0;
    this.turnNumber = 1;
    this.roundNumber = 1;
    this.lastDice = null;
    const firstPlayer = this.getCurrentPlayer();
    this.addLog(`🎲 Игра началась! Первым ходит ${firstPlayer.name}`, 'success', '🏁');
    this.resetTurnTimer();
    this.startActivePlayTracker();
    return this.getPublicState();
  }

  // --- Jail Actions ---
  payJailBail(requestingPlayerId) {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== requestingPlayerId) {
      throw new Error('Сейчас не ваш ход');
    }
    if (this.status !== 'ROLLING') {
      throw new Error('Оплатить залог можно только в начале своего хода');
    }
    if (!player.inJail) {
      throw new Error('Вы не находитесь в тюрьме');
    }

    player.missedTurns = 0;
    const res = JailManager.payBail(player);
    this.addLog(`🔓 ${player.name} оплатил залог $${res.bailAmount} и вышел из тюрьмы!`, 'money', '💸');
    this.status = 'ROLLING';
    return this.getPublicState();
  }

  payBail(requestingPlayerId) {
    return this.payJailBail(requestingPlayerId);
  }

  rollJailDice(requestingPlayerId) {
    return this.rollDice(requestingPlayerId);
  }

  useJailCard(requestingPlayerId) {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== requestingPlayerId) {
      throw new Error('Сейчас не ваш ход');
    }
    if (this.status !== 'ROLLING') {
      throw new Error('Использовать карту свободы можно только в начале своего хода');
    }
    if (!player.inJail) {
      throw new Error('Вы не находитесь в тюрьме');
    }

    player.missedTurns = 0;
    JailManager.useJailCard(player);
    this.addLog(`🗝️ ${player.name} использовал карту бесплатного освобождения из тюрьмы!`, 'success', '🗝️');
    this.status = 'ROLLING';
    return this.getPublicState();
  }

  // --- Rolling Dice ---
  rollDice(requestingPlayerId) {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== requestingPlayerId) {
      throw new Error('Сейчас не ваш ход');
    }
    if (this.status !== 'ROLLING') {
      throw new Error('В данный момент нельзя бросить кубики');
    }

    player.missedTurns = 0;
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const sum = die1 + die2;
    const isDouble = die1 === die2;

    this.lastDice = { die1, die2, sum, isDouble };
    const wasInJailAtTurnStart = Boolean(player.inJail);

    // 1. Handle Turn in Jail
    if (player.inJail) {
      const jailRes = JailManager.handleJailRoll(player, die1, die2);

      if (jailRes.released) {
        if (jailRes.reason === 'double') {
          this.addLog(`🎉 ${player.name} выбросил ДУБЛЬ (${die1}:${die2}) и выходит из Тюрьмы!`, 'success', '🗝️');
        } else if (jailRes.forcedBail) {
          if (player.money >= jailRes.bailAmount) {
            player.money -= jailRes.bailAmount;
            player.inJail = false;
            player.jailTurns = 0;
            this.addLog(`⛓️ ${player.name} провёл 3 хода в Тюрьме и обязан оплатить залог $${jailRes.bailAmount}.`, 'warning', '💸');
          } else {
            this.handleBankruptcy(player, null);
            return {
              dice: this.lastDice,
              skipped: true,
              passedStart: false,
              oldPosition: player.position,
              newPosition: player.position,
              state: this.getPublicState()
            };
          }
        }
        // Proceed to move by rolled sum
      } else {
        // Did not roll doubles in jail
        this.addLog(`${player.name} выбросил ${die1}:${die2} (не дубль). Остаётся в Тюрьме (${jailRes.jailTurns}/${jailRes.maxTurns} ход).`, 'info', '⛓️');
        this.status = 'TURN_END';
        this.resetTurnTimer();
        return {
          dice: this.lastDice,
          skipped: true,
          passedStart: false,
          oldPosition: player.position,
          newPosition: player.position,
          state: this.getPublicState()
        };
      }
    }

    this.rolledDoubleInCurrentTurn = isDouble && !wasInJailAtTurnStart && !player.inJail;

    const oldPosition = player.position;
    const totalTiles = this.board.length;
    const newPosition = (oldPosition + sum) % totalTiles;
    const passedStart = oldPosition + sum >= totalTiles;

    this.addLog(
      `${player.name} выбросил ${die1} и ${die2} (сумма: ${sum})${isDouble ? ' — ДУБЛЬ! 🎉' : ''}`,
      'dice',
      '🎲'
    );

    // Apply start pass bonus
    if (passedStart && newPosition !== 0) {
      player.money += GAME_SETTINGS.START_PASS_BONUS;
      this.addLog(
        `${player.name} прошёл через СТАРТ и получил +$${GAME_SETTINGS.START_PASS_BONUS}`,
        'money',
        '💵'
      );
    }

    player.position = newPosition;
    const tile = this.board[newPosition];

    // Handle tile landing logic
    this.handleTileLanding(player, tile);
    this.resetTurnTimer();

    return {
      dice: this.lastDice,
      skipped: false,
      passedStart,
      oldPosition,
      newPosition,
      tile,
      state: this.getPublicState()
    };
  }

  handleTileLanding(player, tile) {
    switch (tile.type) {
      case 'start': {
        const passBonus = GAME_SETTINGS.START_PASS_BONUS || 200;
        const landingBonus = GAME_SETTINGS.START_LANDING_BONUS || 100;
        const totalBonus = passBonus + landingBonus;
        player.money += totalBonus;
        this.addLog(
          `${player.name} встал на поле СТАРТ и получил +$${totalBonus} (бонус круга $${passBonus} + $${landingBonus} за остановку)!`,
          'money',
          '🏁'
        );
        this.status = 'TURN_END';
        break;
      }

      case 'property':
        if (!tile.ownerId) {
          // Unowned property
          if (player.money >= tile.price) {
            this.status = 'AWAITING_ACTION';
            this.pendingAction = {
              type: 'BUY_PROPERTY',
              tileId: tile.id,
              name: tile.name,
              price: tile.price,
              rent: tile.rents ? tile.rents[0] : (tile.rent || 10),
              color: tile.color,
              groupName: tile.groupName
            };
            this.addLog(
              `${player.name} остановился на "${tile.name}" ($${tile.price}). Доступна покупка или аукцион.`,
              'property',
              '🏷️'
            );
          } else {
            this.addLog(
              `${player.name} остановился на "${tile.name}", но у него недостаточно средств ($${player.money} / $${tile.price}). Запуск аукциона!`,
              'info',
              '🏷️'
            );
            this.startAuctionForTile(tile);
          }
        } else if (tile.ownerId === player.id) {
          this.addLog(`${player.name} отдыхает на своей территории "${tile.name}"`, 'info', '🏡');
          this.status = 'TURN_END';
        } else {
          // Owned by another player
          const owner = this.players.find(p => p.id === tile.ownerId);
          if (owner && !owner.isBankrupt) {
            this.payRent(player, owner, tile);
          } else {
            this.status = 'TURN_END';
          }
        }
        break;

      case 'tax':
        this.payTax(player, tile.amount, tile.name);
        break;

      case 'chance':
        this.drawCard(player, 'chance');
        break;

      case 'chest':
        this.drawCard(player, 'chest');
        break;

      case 'go_to_jail':
        this.addLog(
          `🚨 ${player.name} арестован и отправляется в Тюрьму!`,
          'danger',
          '👮'
        );
        JailManager.sendToJail(player, this.board);
        this.rolledDoubleInCurrentTurn = false;
        this.status = 'TURN_END';
        break;

      case 'jail':
        this.addLog(`${player.name} находится в гостях в Тюрьме`, 'info', '⛓️');
        this.status = 'TURN_END';
        break;

      case 'free_parking':
        this.addLog(`${player.name} отдыхает на Бесплатной парковке`, 'info', '🅿️');
        this.status = 'TURN_END';
        break;

      default:
        this.status = 'TURN_END';
        break;
    }
  }

  buyProperty(requestingPlayerId) {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== requestingPlayerId) {
      throw new Error('Сейчас не ваш ход');
    }
    if (this.status !== 'AWAITING_ACTION' || !this.pendingAction || this.pendingAction.type !== 'BUY_PROPERTY') {
      throw new Error('Покупка недвижимости сейчас недоступна');
    }

    const tile = this.board[this.pendingAction.tileId];
    if (tile.ownerId) {
      throw new Error('Эта недвижимость уже куплена');
    }
    if (player.money < tile.price) {
      throw new Error('Недостаточно средств для покупки');
    }

    player.missedTurns = 0;
    player.money -= tile.price;
    tile.ownerId = player.id;
    player.properties.push(tile.id);

    const isMonopoly = MonopolyManager.hasMonopoly(this.board, player.id, tile.group);
    const monopolyMsg = isMonopoly ? ' 🌟 СОБРАНА МОНОПОЛИЯ РАЙОНА! Рента удвоена!' : '';

    this.addLog(
      `🎉 ${player.name} купил "${tile.name}" за $${tile.price}!${monopolyMsg}`,
      'success',
      '🏠'
    );

    this.pendingAction = null;
    this.status = 'TURN_END';
    this.resetTurnTimer();
    return this.getPublicState();
  }

  passProperty(requestingPlayerId) {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== requestingPlayerId) {
      throw new Error('Сейчас не ваш ход');
    }
    if (this.status !== 'AWAITING_ACTION') {
      throw new Error('Нет активного действия для пропуска');
    }

    player.missedTurns = 0;
    const tile = this.board[this.pendingAction.tileId];
    this.pendingAction = null;

    const opponents = this.getActivePlayers().filter(p => p.id !== requestingPlayerId);

    if (opponents.length === 1) {
      const singleOpponent = opponents[0];
      // Offer single remaining opponent to buy the property directly at base initial price
      this.activeAuction = AuctionManager.initDirectOffer(tile, singleOpponent, player);
      this.status = 'AUCTION';
      this.addLog(
        `📢 ${player.name} отказался от покупки "${tile.name}". Предложение выкупа за изначальную стоимость ($${tile.price}) направлено игроку ${singleOpponent.name}!`,
        'info',
        '🏷️'
      );
      this.resetTurnTimer(45);
    } else if (opponents.length >= 2) {
      this.activeAuction = AuctionManager.initAuction(tile, this.players, requestingPlayerId);
      this.status = 'AUCTION';
      this.addLog(
        `🔨 ${player.name} отказался от покупки "${tile.name}". Объявлен аукцион между ${opponents.length} соперниками! Стартовая цена: $${this.activeAuction.currentBid}`,
        'warning',
        '🏷️'
      );
      this.resetTurnTimer(45);
    } else {
      this.status = 'TURN_END';
      this.resetTurnTimer();
    }

    return this.getPublicState();
  }

  // --- Auctions ---
  startAuctionForTile(tile, initiatorId = null) {
    this.activeAuction = AuctionManager.initAuction(tile, this.players, initiatorId);
    this.status = 'AUCTION';
    this.addLog(`🔨 Объявлен аукцион на "${tile.name}"! Стартовая цена: $${this.activeAuction.currentBid}`, 'warning', '🏷️');
    this.resetTurnTimer(45); // 45s auction timer
  }

  placeBid(requestingPlayerId, amount) {
    if (this.status !== 'AUCTION' || !this.activeAuction) {
      throw new Error('Сейчас нет активного аукциона');
    }

    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');

    AuctionManager.placeBid(this.activeAuction, player, amount);

    if (this.activeAuction.isDirectOffer) {
      this.addLog(`🤝 ${player.name} согласился выкупить "${this.activeAuction.tileName}" за $${this.activeAuction.currentBid}!`, 'success', '🏢');
    } else {
      this.addLog(`💰 ${player.name} повысил ставку на аукционе до $${this.activeAuction.currentBid}!`, 'success', '🔨');
    }

    if (this.activeAuction.isCompleted) {
      this.finishAuction();
    } else {
      this.resetTurnTimer(30);
    }

    return this.getPublicState();
  }

  passBid(requestingPlayerId) {
    if (this.status !== 'AUCTION' || !this.activeAuction) {
      throw new Error('Сейчас нет активного аукциона');
    }

    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');

    AuctionManager.passBid(this.activeAuction, player.id);

    if (this.activeAuction.isDirectOffer) {
      this.addLog(`${player.name} отказался от выкупа недвижимости`, 'info', '⏩');
    } else {
      this.addLog(`${player.name} спасовал на аукционе`, 'info', '⏩');
    }

    if (this.activeAuction.isCompleted) {
      this.finishAuction();
    }

    return this.getPublicState();
  }

  placeAuctionBid(requestingPlayerId, amount) {
    return this.placeBid(requestingPlayerId, amount);
  }

  bidAuction(requestingPlayerId, amount) {
    return this.placeBid(requestingPlayerId, amount);
  }

  passAuction(requestingPlayerId) {
    return this.passBid(requestingPlayerId);
  }

  finishAuction() {
    if (!this.activeAuction) return;

    this.stats.totalAuctionsCompleted++;
    const isDirect = this.activeAuction.isDirectOffer;
    const tileName = this.activeAuction.tileName;
    const result = AuctionManager.resolveAuction(this.activeAuction, this.board, this.players);

    if (result && result.winner) {
      if (isDirect) {
        this.addLog(
          `🎉 ${result.winner.name} выкупил "${result.tileName}" за $${result.winningBid}!`,
          'success',
          '🏢'
        );
      } else {
        this.addLog(
          `🏆 ${result.winner.name} выиграл аукцион на "${result.tileName}" за $${result.winningBid}!`,
          'success',
          '🎉'
        );
      }
    } else {
      if (isDirect) {
        this.addLog(`Недвижимость "${tileName}" осталась в банке`, 'info', '🏷️');
      } else {
        this.addLog(`Аукцион на "${tileName}" завершён без победителя`, 'info', '🏷️');
      }
    }

    this.activeAuction = null;
    this.status = 'TURN_END';
    this.resetTurnTimer();
  }

  // --- Houses & Hotels ---
  buildHouse(requestingPlayerId, tileId) {
    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');
    if (player.isBankrupt) throw new Error('Банкрот не может строить');

    const result = MonopolyManager.buildHouse(player, this.board, tileId, {
      mode: this.mode,
      builtTilesThisTurn: this.builtTilesThisTurn || []
    });
    this.stats.totalHousesBuilt++;
    if (!this.builtTilesThisTurn) this.builtTilesThisTurn = [];
    this.builtTilesThisTurn.push(Number(tileId));

    const buildingType = result.isHotel ? 'ОТЕЛЬ 🏨' : `дом №${result.houses} 🏠`;
    this.addLog(
      `🔨 ${player.name} построил ${buildingType} на "${result.name}" за $${result.cost}! Новая рента: $${result.newRent}`,
      'success',
      result.isHotel ? '🏨' : '🏠'
    );

    return this.getPublicState();
  }

  sellHouse(requestingPlayerId, tileId) {
    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');

    const result = MonopolyManager.sellHouse(player, this.board, tileId);
    this.addLog(
      `💸 ${player.name} продал постройку с "${result.name}" за $${result.refund}. Осталось построек: ${result.houses}`,
      'warning',
      '🏚️'
    );

    return this.getPublicState();
  }

  // --- Mortgages ---
  mortgageProperty(requestingPlayerId, tileId) {
    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');

    const result = MortgageManager.mortgageProperty(player, this.board, tileId);
    this.addLog(
      `🏦 ${player.name} заложил "${result.name}" в банк и получил +$${result.mortgageValue}`,
      'warning',
      '📜'
    );

    return this.getPublicState();
  }

  unmortgageProperty(requestingPlayerId, tileId) {
    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');

    const result = MortgageManager.unmortgageProperty(player, this.board, tileId);
    this.addLog(
      `✨ ${player.name} выкупил из залога "${result.name}" за $${result.redemptionCost}`,
      'success',
      '🔓'
    );

    return this.getPublicState();
  }

  // --- Player Trading ---
  proposeTrade(fromPlayerId, toPlayerId, offer, request) {
    const fromPlayer = this.players.find(p => p.id === fromPlayerId);
    const toPlayer = this.players.find(p => p.id === toPlayerId);

    if (!fromPlayer || !toPlayer) {
      throw new Error('Игроки для торговли не найдены');
    }

    const trade = TradeManager.createTradeProposal(fromPlayer, toPlayer, offer, request, this.board);
    this.activeTrade = trade;

    this.addLog(`🤝 ${fromPlayer.name} предложил сделку игроку ${toPlayer.name}`, 'trade', '📜');
    return trade;
  }

  respondTrade(toPlayerId, tradeId, action) {
    if (!this.activeTrade || this.activeTrade.id !== tradeId) {
      throw new Error('Сделка не найдена или уже завершена');
    }
    const tradeRecipient = this.activeTrade.toPlayerId || this.activeTrade.targetId;
    if (tradeRecipient !== toPlayerId) {
      throw new Error('Только получатель предложения может принять или отклонить его');
    }

    if (action === 'ACCEPT') {
      const res = TradeManager.executeTrade(this.activeTrade, this.players, this.board);
      this.stats.totalTradesCompleted++;
      this.addLog(`🤝 Сделка между ${this.activeTrade.fromPlayerName} и ${this.activeTrade.toPlayerName} успешно заключена!`, 'success', '🎉');
      this.activeTrade = null;
      return this.getPublicState();
    } else if (action === 'DECLINE') {
      this.addLog(`${this.activeTrade.toPlayerName} отклонил сделку от ${this.activeTrade.fromPlayerName}`, 'info', '❌');
      this.activeTrade = null;
      return this.getPublicState();
    }

    throw new Error('Неизвестное действие по сделке');
  }

  acceptTrade(toPlayerId, tradeId) {
    const tId = tradeId || (this.activeTrade ? this.activeTrade.id : null);
    return this.respondTrade(toPlayerId, tId, 'ACCEPT');
  }

  rejectTrade(toPlayerId, tradeId) {
    const tId = tradeId || (this.activeTrade ? this.activeTrade.id : null);
    return this.respondTrade(toPlayerId, tId, 'DECLINE');
  }

  // --- Rent & Taxes ---
  payRent(player, owner, tile) {
    const rent = MonopolyManager.calculateRent(tile, this.board, owner);
    if (rent === 0) {
      this.addLog(`Улица "${tile.name}" заложена в банке. Рента не взимается.`, 'info', '📜');
      this.status = 'TURN_END';
      return;
    }

    this.stats.totalRentPaid += rent;
    const buildingInfo = (tile.houses || 0) === 5 ? ' (Отель 🏨)' : (tile.houses > 0 ? ` (${tile.houses} дома 🏠)` : '');
    this.addLog(
      `${player.name} наступил на "${tile.name}"${buildingInfo} игрока ${owner.name}. Рента: $${rent}`,
      'warning',
      '💳'
    );

    player.money -= rent;
    owner.money += rent;

    if (player.money >= 0) {
      this.addLog(`${player.name} заплатил $${rent} ренты игроку ${owner.name}`, 'money', '💸');
      this.status = 'TURN_END';
    } else {
      const debt = Math.abs(player.money);
      this.addLog(
        `⚠️ У ${player.name} задолженность: -$${debt}! Заложите имущество или продайте дома в меню "Моя недвижимость" для погашения долга.`,
        'danger',
        '⚠️'
      );
      this.status = 'TURN_END';
    }
  }

  payTax(player, amount, taxName) {
    this.addLog(`${player.name} оплачивает ${taxName}: -$${amount}`, 'warning', '🏛️');
    player.money -= amount;
    if (player.money < 0) {
      const debt = Math.abs(player.money);
      this.addLog(
        `⚠️ У ${player.name} задолженность по налогу: -$${debt}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
        'danger',
        '⚠️'
      );
    }
    this.status = 'TURN_END';
  }

  // --- Card Drawing ---
  drawCard(player, deckType) {
    this.stats.totalCardDraws++;
    let deck = deckType === 'chance' ? this.chanceDeck : this.chestDeck;
    if (deck.length === 0) {
      const source = deckType === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
      deck = [...source].sort(() => Math.random() - 0.5);
      if (deckType === 'chance') this.chanceDeck = deck;
      else this.chestDeck = deck;
    }

    const card = deck.shift();
    const deckName = deckType === 'chance' ? 'Шанс' : 'Казна';

    this.lastDrawnCard = {
      id: card.id,
      title: card.title,
      text: card.text,
      type: card.type,
      amount: card.amount,
      amountPerPlayer: card.amountPerPlayer,
      houseCost: card.houseCost,
      hotelCost: card.hotelCost,
      icon: card.icon || (deckType === 'chance' ? '❓' : '🎁'),
      deckType,
      playerName: player.name,
      playerId: player.id,
      drawnAt: Date.now()
    };

    this.addLog(
      `🎴 ${player.name} тянет карту [${deckName}]: "${card.title}" — ${card.text}`,
      'info',
      card.icon || '🎴'
    );

    switch (card.type) {
      case 'cash':
        player.money += card.amount;
        if (card.amount < 0 && player.money < 0) {
          this.addLog(
            `⚠️ У ${player.name} задолженность: -$${Math.abs(player.money)}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
            'danger',
            '⚠️'
          );
        }
        break;

      case 'get_out_of_jail_free':
        player.jailFreeCards = (player.jailFreeCards || 0) + 1;
        this.addLog(`🗝️ ${player.name} сохранил карту бесплатного выхода из тюрьмы (всего: ${player.jailFreeCards})`, 'success', '🗝️');
        break;

      case 'go_to_jail':
        this.addLog(`🚨 ${player.name} арестован по карте [${deckName}] и отправляется в Тюрьму!`, 'danger', '👮');
        JailManager.sendToJail(player, this.board);
        this.rolledDoubleInCurrentTurn = false;
        break;

      case 'move_to':
        const oldPos = player.position;
        let targetPos = card.targetTileIndex !== undefined ? card.targetTileIndex : 0;
        if (card.targetTileName) {
          const foundTile = this.board.find(t => t.name.toLowerCase() === card.targetTileName.toLowerCase());
          if (foundTile) {
            targetPos = foundTile.id;
          }
        }
        if (targetPos >= this.board.length) {
          targetPos = targetPos % this.board.length;
        }
        player.position = targetPos;
        if (card.collectStartBonus && (targetPos === 0 || targetPos < oldPos)) {
          player.money += GAME_SETTINGS.START_PASS_BONUS;
          this.addLog(`${player.name} получил бонус за СТАРТ +$${GAME_SETTINGS.START_PASS_BONUS}`, 'money', '🚀');
        }
        this.handleTileLanding(player, this.board[targetPos]);
        return;

      case 'repairs':
        let totalRepairs = 0;
        player.properties.forEach(tId => {
          const t = this.board[tId];
          if (t && t.houses > 0) {
            if (t.houses === 5) {
              totalRepairs += card.hotelCost || 100;
            } else {
              totalRepairs += t.houses * (card.houseCost || 25);
            }
          }
        });
        this.addLog(`🔨 ${player.name} оплачивает ремонт недвижимости: -$${totalRepairs}`, 'warning', '🔧');
        player.money -= totalRepairs;
        if (player.money < 0) {
          this.addLog(
            `⚠️ У ${player.name} задолженность за ремонт: -$${Math.abs(player.money)}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
            'danger',
            '⚠️'
          );
        }
        break;

      case 'player_payment':
        const otherPlayers = this.getActivePlayers().filter(p => p.id !== player.id);
        const amountPerPlayer = card.amountPerPlayer || 20;

        if (amountPerPlayer > 0) {
          otherPlayers.forEach(op => {
            const transfer = Math.min(op.money, amountPerPlayer);
            op.money -= transfer;
            player.money += transfer;
          });
          this.addLog(`🎁 ${player.name} собрал по $${amountPerPlayer} с каждого игрока!`, 'success', '💰');
        } else {
          const cost = Math.abs(amountPerPlayer);
          otherPlayers.forEach(op => {
            player.money -= cost;
            op.money += cost;
          });
          this.addLog(`🤝 ${player.name} выплатил по $${cost} каждому игроку`, 'warning', '💸');
          if (player.money < 0) {
            this.addLog(
              `⚠️ У ${player.name} задолженность по выплатам: -$${Math.abs(player.money)}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
              'danger',
              '⚠️'
            );
          }
        }
        break;
    }

    this.status = 'TURN_END';
  }

  handleBankruptcy(player, creditor) {
    player.isBankrupt = true;
    player.money = 0;

    // Free all properties owned by bankrupt player
    this.board.forEach(tile => {
      if (tile.ownerId === player.id) {
        tile.ownerId = null;
        tile.houses = 0;
        tile.isMortgaged = false;
      }
    });
    player.properties = [];

    const creditorText = creditor ? ` перед ${creditor.name}` : '';
    this.addLog(
      `💥 Игрок ${player.name} обанкротился${creditorText} и выбывает из игры! Все его улицы освобождены.`,
      'danger',
      '☠️'
    );

    const isGameOver = this.checkWinCondition();
    if (!isGameOver) {
      this.status = 'TURN_END';
    }
  }

  declareBankruptcy(requestingPlayerId) {
    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) {
      throw new Error('Игрок не найден');
    }
    if (player.isBankrupt) {
      throw new Error('Игрок уже выбыл из партии');
    }

    const currentPlayer = this.getCurrentPlayer();
    const isCurrentTurnPlayer = Boolean(currentPlayer && currentPlayer.id === player.id);

    // Cancel active trade involving this player
    if (this.activeTrade && (this.activeTrade.initiatorId === player.id || this.activeTrade.targetId === player.id)) {
      this.activeTrade = null;
    }

    // Cancel active auction if this player was leading
    if (this.activeAuction && this.activeAuction.highestBidderId === player.id) {
      this.activeAuction.highestBidderId = null;
    }

    // Clear disconnect timer if this player was waiting
    if (this.disconnectWaitingState && this.disconnectWaitingState.disconnectedPlayerId === player.id) {
      this.stopDisconnectWaitingTimer();
    }

    this.handleBankruptcy(player, null);

    if (!this.checkWinCondition()) {
      if (isCurrentTurnPlayer) {
        this.advanceToNextPlayer();
      }
    }

    return this.getPublicState();
  }

  dismissDrawnCard() {
    this.lastDrawnCard = null;
    return this.getPublicState();
  }

  checkWinCondition() {
    const active = this.getActivePlayers();
    if (active.length <= 1) {
      this.status = 'GAME_OVER';
      this.endedAt = Date.now();
      this.clearTurnTimer();
      this.stopDisconnectWaitingTimer();
      this.stopActivePlayTracker();
      this.winner = active[0] || null;
      this.recordFinalGameResults();
      if (this.winner) {
        this.addLog(`🏆 Победитель игры — ${this.winner.name}! Поздравляем! 🎉`, 'success', '👑');
      }
      return true;
    }
    return false;
  }

  endTurn(requestingPlayerId) {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== requestingPlayerId) {
      throw new Error('Сейчас не ваш ход');
    }
    if (this.status !== 'TURN_END') {
      throw new Error('Ход ещё не завершён (требуется действие)');
    }
    if (player.money < 0) {
      throw new Error(`У вас задолженность -$${Math.abs(player.money)}! Продайте дома или заложите улицы в меню "Моя недвижимость", либо объявите банкротство.`);
    }

    if (this.checkWinCondition()) {
      return this.getPublicState();
    }

    player.missedTurns = 0;

    // If player rolled double (and not bankrupt and not in jail)
    if (this.rolledDoubleInCurrentTurn && !player.isBankrupt && !player.inJail) {
      this.rolledDoubleInCurrentTurn = false;
      this.status = 'ROLLING';
      this.addLog(`🎲 ${player.name} бросает кубики снова благодаря дублю!`, 'dice', '🔄');
      this.resetTurnTimer();
      return this.getPublicState();
    }

    this.rolledDoubleInCurrentTurn = false;
    this.advanceToNextPlayer();
    return this.getPublicState();
  }

  advanceToNextPlayer() {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length <= 1) {
      this.checkWinCondition();
      return;
    }

    const totalPlayers = this.players.length;
    let nextIndex = (this.currentTurnIndex + 1) % totalPlayers;
    let attempts = 0;

    while (this.players[nextIndex].isBankrupt && attempts < totalPlayers) {
      nextIndex = (nextIndex + 1) % totalPlayers;
      attempts++;
    }

    if (this.players[nextIndex].isBankrupt) {
      this.checkWinCondition();
      return;
    }

    // Increment turnNumber only after a full cycle of all active players completed
    if (nextIndex <= this.currentTurnIndex) {
      this.turnNumber = (this.turnNumber || 1) + 1;
    }

    this.currentTurnIndex = nextIndex;
    this.status = 'ROLLING';
    this.builtTilesThisTurn = [];
    const nextPlayer = this.getCurrentPlayer();
    this.addLog(`➡️ Ход ${this.turnNumber || 1}: очередь переходит к ${nextPlayer.name}`, 'info', nextPlayer.color.icon);
    this.resetTurnTimer();
  }

  endGameByHost(requestingPlayerId) {
    if (requestingPlayerId !== this.hostId) {
      throw new Error('Только создатель комнаты может досрочно завершить игру');
    }

    this.status = 'GAME_OVER';
    this.endedAt = Date.now();
    this.clearTurnTimer();
    this.stopDisconnectWaitingTimer();
    this.stopActivePlayTracker();

    const ranked = this.calculateRankings();
    this.winner = ranked[0] || null;
    this.recordFinalGameResults();
    this.addLog(`🛑 Хост завершил игру. Победитель по капиталу: ${this.winner ? this.winner.name : 'Ничья'}!`, 'success', '🏆');
    return this.getPublicState();
  }

  restartGame(requestingPlayerId) {
    if (requestingPlayerId !== this.hostId) {
      throw new Error('Только хост может перезапустить игру');
    }

    this.status = 'LOBBY';
    this.winner = null;
    this.startedAt = null;
    this.endedAt = null;
    this.currentTurnIndex = 0;
    this.pendingAction = null;
    this.activeAuction = null;
    this.activeTrade = null;
    this.rolledDoubleInCurrentTurn = false;
    this.lastDice = null;
    this.clearTurnTimer();
    this.stopDisconnectWaitingTimer();
    this.stopActivePlayTracker();

    const sourceTiles = this.boardSize === 24 ? BOARD_TILES_24 : BOARD_TILES_40;
    this.board = sourceTiles.map(tile => ({
      ...tile,
      ownerId: null,
      houses: 0,
      isMortgaged: false
    }));
    this.players.forEach(p => {
      p.money = this.startingCash || GAME_SETTINGS.STARTING_CASH;
      p.position = 0;
      p.inJail = false;
      p.jailTurns = 0;
      p.jailFreeCards = 0;
      p.skipNextTurn = false;
      p.isBankrupt = false;
      p.missedTurns = 0;
      p.disconnectBudgetSeconds = 60;
      p.activePlaySeconds = 0;
      p.properties = [];
    });
    this.addLog(`🔄 Игра сброшена в лобби. Готовы к новому раунду!`, 'info', '🔄');
    return this.getPublicState();
  }

  calculateRankings() {
    const sorted = [...this.players].map(p => {
      const propertyValue = p.properties.reduce((sum, tileId) => {
        const t = this.board[tileId];
        if (!t) return sum;
        const housesValue = (t.houses || 0) * (t.housePrice || 50);
        return sum + t.price + housesValue;
      }, 0);

      const allGroups = [...new Set(this.board.filter(t => t.group).map(t => t.group))];
      const monopoliesCount = allGroups.filter(g =>
        MonopolyManager.hasMonopoly(this.board, p.id, g)
      ).length;

      const housesCount = p.properties.reduce((sum, tId) => {
        const t = this.board[tId];
        return sum + (t && t.houses < 5 ? t.houses : 0);
      }, 0);

      const hotelsCount = p.properties.reduce((sum, tId) => {
        const t = this.board[tId];
        return sum + (t && t.houses === 5 ? 1 : 0);
      }, 0);

      return {
        ...p,
        totalCapital: p.money + propertyValue,
        netWorth: p.money + propertyValue,
        propertyValue,
        monopoliesCount,
        housesCount,
        hotelsCount
      };
    }).sort((a, b) => {
      if (a.isBankrupt && !b.isBankrupt) return 1;
      if (!a.isBankrupt && b.isBankrupt) return -1;
      return b.netWorth - a.netWorth;
    });
    return sorted.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      isWinner: this.winner ? this.winner.id === p.id : (idx === 0)
    }));
  }

  recordFinalGameResults() {
    try {
      const rankings = this.calculateRankings();
      const winnerId = this.winner ? this.winner.id : (rankings[0] ? rankings[0].id : null);
      const hasBots = Boolean(this.everHadBot || this.players.some(p => p.isBot));
      database.recordGameResults(rankings, winnerId, this.roomId, hasBots);
    } catch (err) {
      console.error('Error recording game results to database:', err);
    }
  }

  getPublicState() {
    const elapsedSeconds = this.startedAt ? Math.floor(((this.endedAt || Date.now()) - this.startedAt) / 1000) : 0;
    const remainingTurnSeconds = this.turnStartedAt
      ? Math.max(0, this.turnTimeoutSeconds - Math.floor((Date.now() - this.turnStartedAt) / 1000))
      : (this.pausedTurnRemainingSeconds !== undefined ? this.pausedTurnRemainingSeconds : (this.turnTimeoutSeconds || 60));

    return {
      roomId: this.roomId,
      hostId: this.hostId,
      status: this.status,
      mode: this.mode,
      isPrivate: this.isPrivate,
      hasBots: Boolean(this.everHadBot || this.players.some(p => p.isBot)),
      currentTurnIndex: this.currentTurnIndex,
      turnNumber: this.turnNumber || 1,
      roundNumber: this.roundNumber || 1,
      currentPlayerId: this.getCurrentPlayer() ? this.getCurrentPlayer().id : null,
      lastDice: this.lastDice,
      lastDrawnCard: this.lastDrawnCard,
      pendingAction: this.pendingAction,
      activeAuction: this.activeAuction,
      activeTrade: this.activeTrade,
      builtTilesThisTurn: this.builtTilesThisTurn || [],
      disconnectWaitingState: this.disconnectWaitingState,
      winner: this.winner,
      gameDurationSeconds: elapsedSeconds,
      remainingTurnSeconds,
      stats: this.stats,
      rankings: this.status === 'GAME_OVER' ? this.calculateRankings() : [],
      board: this.board.map(tile => ({
        id: tile.id,
        name: tile.name,
        type: tile.type,
        group: tile.group,
        groupName: tile.groupName,
        color: tile.color,
        price: tile.price,
        housePrice: tile.housePrice,
        mortgageValue: tile.mortgageValue,
        rent: tile.rents ? tile.rents[0] : tile.rent,
        rents: tile.rents,
        amount: tile.amount,
        icon: tile.icon,
        iconUrl: tile.iconUrl || null,
        description: tile.description,
        ownerId: tile.ownerId,
        houses: tile.houses || 0,
        isMortgaged: !!tile.isMortgaged,
        isMonopoly: tile.ownerId ? MonopolyManager.hasMonopoly(this.board, tile.ownerId, tile.group) : false,
        currentRent: tile.ownerId ? MonopolyManager.calculateRent(tile, this.board, this.players.find(p => p.id === tile.ownerId)) : 0
      })),
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        money: p.money,
        position: p.position,
        inJail: p.inJail,
        jailTurns: p.jailTurns,
        jailFreeCards: p.jailFreeCards,
        isBankrupt: p.isBankrupt,
        isConnected: p.isConnected,
        isBot: Boolean(p.isBot),
        botDifficulty: p.botDifficulty || null,
        telegramId: p.telegramId || null,
        username: p.username || null,
        avatarUrl: p.avatarUrl || null,
        characterId: p.characterId || 'cat',
        disconnectBudgetSeconds: p.disconnectBudgetSeconds || 60,
        propertiesCount: p.properties.length,
        properties: p.properties
      })),
      logs: this.logs.slice(-35)
    };
  }
}

module.exports = GameEngine;
