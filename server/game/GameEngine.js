const { BOARD_TILES, BOARD_TILES_40, BOARD_TILES_24, BOARD_TILES_PANEL_40, BOARD_TILES_PANEL_24, BOARD_TILES_OFFICE_40, BOARD_TILES_OFFICE_24, DEFAULT_TEAMS, GAME_SETTINGS } = require('../config/boardConfig');
const { PET_CHARACTERS } = require('../config/petCharacters');
const {
  CHANCE_CARDS,
  CHEST_CARDS,
  CHANCE_CARDS_OFFICE,
  CHEST_CARDS_OFFICE,
  CHANCE_CARDS_PANEL,
  CHEST_CARDS_PANEL
} = require('../config/cardsConfig');
const MonopolyManager = require('./modules/MonopolyManager');
const MortgageManager = require('./modules/MortgageManager');
const AuctionManager = require('./modules/AuctionManager');
const TradeManager = require('./modules/TradeManager');
const JailManager = require('./modules/JailManager');
const database = require('../db/Database');

/**
 * Select random board theme:
 * All themes ('office', 'panel', 'cars') have equal drop probability (1/3 each).
 */
function pickRandomBoardTheme() {
  const themes = ['office', 'panel', 'cars'];
  return themes[Math.floor(Math.random() * themes.length)];
}

/**
 * Fisher-Yates array shuffle for uniform, unbiased deck randomization
 */
function shuffleDeck(array) {
  const deck = [...array];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

class GameEngine {
  constructor(roomId, hostId, options = {}) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.status = 'LOBBY'; // LOBBY, ROLLING, AWAITING_ACTION, TURN_END, AUCTION, GAME_OVER
    this.isPrivate = !!options.isPrivate;
    this.maxPlayers = options.maxPlayers || ((options.mode === 'ranked' || options.gameMode === 'ranked') ? 2 : ((options.gameMode === 'team' || options.mode === 'team') ? 4 : (GAME_SETTINGS.MAX_PLAYERS || 6)));
    this.mode = options.mode || 'standard'; // 'standard' (40 tiles) | 'blitz' (24 tiles) | 'ranked'
    this.boardSize = options.boardSize || (this.mode === 'blitz' ? 24 : 40);
    this.startingCash = options.startingCash || GAME_SETTINGS.STARTING_CASH || 1500;
    this.gameMode = options.gameMode || (options.mode === 'reverse' ? 'reverse' : options.mode === 'team' ? 'team' : 'classic'); // 'classic' | 'reverse' | 'team'
    
    // Board theme: randomized for each match by default (equal chance: 1/3 each)
    this.initialThemeOption = options.theme || 'random';
    if (this.initialThemeOption === 'cars' || this.initialThemeOption === 'classic') {
      this.theme = 'cars';
    } else if (this.initialThemeOption === 'panel') {
      this.theme = 'panel';
    } else if (this.initialThemeOption === 'office') {
      this.theme = 'office';
    } else {
      this.theme = pickRandomBoardTheme();
    }

    this.teamStartingCash = options.teamStartingCash || Math.round(this.startingCash * (GAME_SETTINGS.TEAM_STARTING_CASH_MULTIPLIER || 1.5));
    this.maxRounds = options.maxRounds !== undefined ? Number(options.maxRounds) : (this.gameMode === 'reverse' ? (this.boardSize === 24 || this.mode === 'blitz' ? 10 : 20) : 0);

    this.teams = this.gameMode === 'team' ? (DEFAULT_TEAMS || []).map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
      money: this.teamStartingCash,
      properties: [],
      playerIds: [],
      isBankrupt: false
    })) : [];

    this.players = [];
    this.currentTurnIndex = 0;
    this.turnNumber = 1;
    this.roundNumber = 1;
    this.tradeOffersThisRound = {}; // { [playerId]: count }
    this.pairTradeOffersThisRound = {}; // { [pairKey]: count }
    
    const sourceTiles = this.boardSize === 24
      ? (this.theme === 'panel' ? BOARD_TILES_PANEL_24 : this.theme === 'office' ? BOARD_TILES_OFFICE_24 : BOARD_TILES_24)
      : (this.theme === 'panel' ? BOARD_TILES_PANEL_40 : this.theme === 'office' ? BOARD_TILES_OFFICE_40 : BOARD_TILES_40);

    this.board = sourceTiles.map(tile => ({
      ...tile,
      ownerId: null,
      houses: 0,
      isMortgaged: false
    }));
    this.lastDice = null;
    this.lastRoll = null;
    this.pendingAction = null; // { type: 'BUY_PROPERTY', tileId, price }
    this.rolledDoubleInCurrentTurn = false;
    this.activeAuction = null;
    this.activeTrade = null;
    this.lastDrawnCard = null;
    this.builtTilesThisTurn = [];
    this.logs = [];
    const themeName = this.theme === 'panel' ? '«Панельная романтика» 🏢' : this.theme === 'office' ? '«Офисный планктон» 💼' : '«Автопарк и Гонки» 🚗';
    this.addLog(`🎲 Тема полей на эту партию: ${themeName}`, 'info', '🗺️');
    this.winner = null;
    this.everHadBot = false;

    // Card Decks with Fisher-Yates unbiased shuffle
    const initialChanceSource = this.getDeckSource('chance');
    const initialChestSource = this.getDeckSource('chest');
    this.chanceDeck = shuffleDeck(initialChanceSource);
    this.chestDeck = shuffleDeck(initialChestSource);

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
    this.endedReason = null;
    this.finalRatings = null;
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

  /**
   * Get the treasury entity for financial/property operations.
   * In standard/reverse mode: returns player.
   * In team mode: returns player's team.
   */
  getTreasury(playerOrId) {
    const player = typeof playerOrId === 'object' && playerOrId ? playerOrId : this.players.find(p => p.id === playerOrId);
    if (!player) return null;
    if (this.gameMode === 'team' && player.teamId) {
      const team = this.teams.find(t => t.id === player.teamId);
      if (team) return team;
    }
    return player;
  }

  isSameTeam(player1OrId, player2OrId) {
    if (!player1OrId || !player2OrId) return false;
    const id1 = typeof player1OrId === 'object' ? player1OrId.id : player1OrId;
    const id2 = typeof player2OrId === 'object' ? player2OrId.id : player2OrId;
    if (id1 === id2) return true;
    if (this.gameMode !== 'team') return false;

    // Check if either is a teamId or player on the team
    const t1 = this.teams.find(t => t.id === id1);
    const t2 = this.teams.find(t => t.id === id2);
    const p1 = this.players.find(p => p.id === id1);
    const p2 = this.players.find(p => p.id === id2);

    const teamId1 = t1 ? t1.id : p1?.teamId;
    const teamId2 = t2 ? t2.id : p2?.teamId;

    return Boolean(teamId1 && teamId2 && teamId1 === teamId2);
  }

  /**
   * Get the team object for a player.
   */
  getTeam(playerOrId) {
    const player = typeof playerOrId === 'object' && playerOrId ? playerOrId : this.players.find(p => p.id === playerOrId);
    if (!player || !player.teamId) return null;
    return this.teams.find(t => t.id === player.teamId) || null;
  }

  /**
   * Sync money and properties from teams to their member players so all client components
   * have consistent state without requiring separate team logic everywhere.
   */
  syncPlayerTreasuries() {
    if (this.gameMode !== 'team') return;
    for (const team of this.teams) {
      for (const pid of team.playerIds) {
        const p = this.players.find(pl => pl.id === pid);
        if (p) {
          p.money = team.money;
          p.properties = [...team.properties];
          p.propertiesCount = team.properties.length;
          p.isBankrupt = team.isBankrupt;
        }
      }
    }
  }

  /**
   * Assign or switch a player's team in LOBBY
   */
  setPlayerTeam(playerId, teamId) {
    if (this.status !== 'LOBBY') {
      throw new Error('Команды можно менять только в лобби перед стартом игры');
    }
    if (this.gameMode !== 'team') {
      throw new Error('Команды доступны только в командном режиме');
    }
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Игрок не найден');
    }
    const targetTeam = this.teams.find(t => t.id === teamId);
    if (!targetTeam) {
      throw new Error('Команда не найдена');
    }

    if (player.teamId === teamId) {
      return targetTeam;
    }

    const maxPerTeam = 2;
    const currentMembers = this.players.filter(p => p.teamId === teamId && p.id !== playerId);
    if (currentMembers.length >= maxPerTeam) {
      throw new Error('Команда уже заполнена (максимум 2 игрока)');
    }

    // Remove from old team
    for (const team of this.teams) {
      team.playerIds = team.playerIds.filter(id => id !== playerId);
    }

    // Add to new team
    targetTeam.playerIds.push(playerId);
    player.teamId = targetTeam.id;
    this.syncPlayerTreasuries();
    this.notifyStateChange();
    return targetTeam;
  }

  addPlayer(id, name, options = {}) {
    if (this.status !== 'LOBBY') {
      throw new Error('Игра уже началась');
    }
    if (this.players.length >= this.maxPlayers) {
      throw new Error(`В комнате уже максимум игроков (${this.maxPlayers})`);
    }

    const availableColors = GAME_SETTINGS.PLAYER_COLORS.filter(
      c => !this.players.some(p => p.color.hex === c.hex)
    );
    const color = availableColors[0] || GAME_SETTINGS.PLAYER_COLORS[this.players.length % GAME_SETTINGS.PLAYER_COLORS.length];

    const defaultChar = PET_CHARACTERS[this.players.length % PET_CHARACTERS.length]?.id || 'cat';
    const characterId = options.characterId || defaultChar;

    const initialMoney = this.gameMode === 'team' ? this.teamStartingCash : GAME_SETTINGS.STARTING_CASH;

    const player = {
      id,
      name: (name || '').trim().substring(0, 24) || `Игрок ${this.players.length + 1}`,
      color,
      characterId,
      money: initialMoney,
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
      clientIp: options.clientIp || null,
      socketId: options.socketId || null,
      sessionToken: options.sessionToken || null,
      disconnectBudgetSeconds: 60, // 1 min initial disconnect pool
      activePlaySeconds: 0, // Accumulator for 5 min replenishment
      missedTurns: 0, // AFK strike counter (2 strikes = defeat)
      properties: []
    };

    if (this.gameMode === 'team') {
      const requestedTeamId = typeof options === 'string' ? options : (options && options.teamId);
      const availableTeams = [...this.teams].filter(t => t.playerIds.length < 2).sort((a, b) => a.playerIds.length - b.playerIds.length);
      let chosenTeam = requestedTeamId ? this.teams.find(t => t.id === requestedTeamId) : null;
      if (!chosenTeam || chosenTeam.playerIds.length >= 2) {
        chosenTeam = availableTeams[0] || this.teams[0];
      }
      player.teamId = chosenTeam.id;
      if (!chosenTeam.playerIds.includes(player.id)) {
        chosenTeam.playerIds.push(player.id);
      }
      player.money = chosenTeam.money;
      player.properties = [...chosenTeam.properties];
    }

    this.players.push(player);
    this.addLog(`${player.name} присоединился к игре`, 'info', player.color.icon);
    return player;
  }

  addBot(difficultyOrOptions = {}, maybeTeamId) {
    if (this.status !== 'LOBBY') {
      throw new Error('Ботов можно добавлять только в лобби перед началом игры');
    }
    if (this.players.length >= this.maxPlayers) {
      throw new Error(`В комнате уже максимум игроков (${this.maxPlayers})`);
    }

    let difficulty = 'balanced';
    let teamId = undefined;
    if (typeof difficultyOrOptions === 'string') {
      difficulty = difficultyOrOptions;
      teamId = maybeTeamId;
    } else if (difficultyOrOptions && typeof difficultyOrOptions === 'object') {
      difficulty = difficultyOrOptions.difficulty || 'balanced';
      teamId = difficultyOrOptions.teamId || maybeTeamId;
    }
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

    const initialMoney = this.gameMode === 'team' ? this.teamStartingCash : GAME_SETTINGS.STARTING_CASH;

    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const botPlayer = {
      id: botId,
      name: `${petName} (${diffLabel})`,
      color,
      characterId,
      money: initialMoney,
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

    if (this.gameMode === 'team') {
      let chosenTeam = teamId ? this.teams.find(t => t.id === teamId) : null;
      if (teamId) {
        if (!chosenTeam) {
          throw new Error('Указанная команда не найдена');
        }
        if (chosenTeam.playerIds.length >= 2) {
          throw new Error(`Команда "${chosenTeam.name}" уже заполнена (максимум 2 игрока)`);
        }
      } else {
        const availableTeams = [...this.teams].filter(t => t.playerIds.length < 2).sort((a, b) => a.playerIds.length - b.playerIds.length);
        if (availableTeams.length === 0) {
          throw new Error('Все команды уже заполнены (максимум 4 игрока)');
        }
        chosenTeam = availableTeams[0];
      }

      botPlayer.teamId = chosenTeam.id;
      if (!chosenTeam.playerIds.includes(botPlayer.id)) {
        chosenTeam.playerIds.push(botPlayer.id);
      }
      botPlayer.money = chosenTeam.money;
      botPlayer.properties = [...chosenTeam.properties];
    }

    this.players.push(botPlayer);
    this.everHadBot = true;
    this.addLog(`🤖 Бот ${botPlayer.name} добавлен в комнату${this.gameMode === 'team' ? ` (${this.getTeam(botPlayer)?.name})` : ''}`, 'info', '🤖');
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
    if (this.gameMode === 'team' && removedBot.teamId) {
      const team = this.teams.find(t => t.id === removedBot.teamId);
      if (team) {
        team.playerIds = team.playerIds.filter(id => id !== botId);
      }
    }
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
      name: (humanName || '').trim().substring(0, 24) || `Игрок ${index + 1}`,
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
      clientIp: options.clientIp || null,
      socketId: options.socketId || null,
      sessionToken: options.sessionToken || null,
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
      if (this.gameMode === 'team' && player.teamId) {
        const team = this.teams.find(t => t.id === player.teamId);
        if (team) {
          team.playerIds = team.playerIds.filter(id => id !== playerId);
        }
      }
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
        this.endedReason = this.endedReason || 'SURRENDER';

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
          this.cleanupAllTimers();
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

  cleanupAllTimers() {
    this.clearTurnTimer();
    this.stopDisconnectWaitingTimer();
    this.stopActivePlayTracker();
    this.stopAuctionTimer();
  }

  destroy() {
    this.cleanupAllTimers();
    this.onStateChangeCallback = null;
  }

  endGameOnDisconnectTimeout(disconnectedPlayer) {
    this.endedReason = 'DISCONNECT_TIMEOUT';
    this.cleanupAllTimers();

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
        this.cleanupAllTimers();
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

  setBoardTheme(theme) {
    if (this.status !== 'LOBBY') {
      return { success: false, error: 'Сменить тему полей можно только в лобби' };
    }
    const validThemes = ['panel', 'cars', 'office', 'random'];
    if (!validThemes.includes(theme)) {
      return { success: false, error: 'Неверная тема полей' };
    }
    this.initialThemeOption = theme;
    if (theme === 'panel') {
      this.theme = 'panel';
    } else if (theme === 'cars') {
      this.theme = 'cars';
    } else if (theme === 'office') {
      this.theme = 'office';
    } else {
      this.theme = pickRandomBoardTheme();
    }
    const sourceTiles = this.boardSize === 24
      ? (this.theme === 'panel' ? BOARD_TILES_PANEL_24 : this.theme === 'office' ? BOARD_TILES_OFFICE_24 : BOARD_TILES_24)
      : (this.theme === 'panel' ? BOARD_TILES_PANEL_40 : this.theme === 'office' ? BOARD_TILES_OFFICE_40 : BOARD_TILES_40);
    this.board = sourceTiles.map(tile => ({
      ...tile,
      ownerId: null,
      houses: 0,
      isMortgaged: false
    }));
    const themeName = this.theme === 'panel' ? '«Панельная романтика» 🏢' : this.theme === 'office' ? '«Офисный планктон» 💼' : '«Автопарк и Гонки» 🚗';
    this.addLog(`🎨 Тема полей изменена на: ${themeName}`, 'info', '🗺️');
    this.notifyStateChange();
    return { success: true, theme: this.theme, initialThemeOption: this.initialThemeOption };
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

    if (this.gameMode === 'team') {
      // Ensure both teams have at least 1 player
      for (const team of this.teams) {
        if (team.playerIds.length === 0) {
          this.addBot({ difficulty: 'balanced', teamId: team.id });
        }
      }

      // Balance player counts if needed (e.g. 2v1 -> add bot to make 2v2)
      const maxTeamCount = Math.max(...this.teams.map(t => t.playerIds.length));
      for (const team of this.teams) {
        while (team.playerIds.length < maxTeamCount && this.players.length < this.maxPlayers) {
          this.addBot({ difficulty: 'balanced', teamId: team.id });
        }
      }

      // Re-order players so turns alternate between teams: Team 1 [0], Team 2 [0], Team 1 [1], Team 2 [1], ...
      const alternatingPlayers = [];
      const teamLists = this.teams.map(t => this.players.filter(p => p.teamId === t.id));
      const maxLen = Math.max(...teamLists.map(l => l.length));
      for (let i = 0; i < maxLen; i++) {
        for (const tList of teamLists) {
          if (tList[i]) alternatingPlayers.push(tList[i]);
        }
      }
      this.players = alternatingPlayers;

      // Initialize team treasury money
      for (const team of this.teams) {
        team.money = this.teamStartingCash;
        team.properties = [];
        team.isBankrupt = false;
      }
      this.syncPlayerTreasuries();
    }

    this.status = 'ROLLING';
    this.startedAt = Date.now();
    this.currentTurnIndex = 0;
    this.turnNumber = 1;
    this.roundNumber = 1;
    this.lastDice = null;
    const firstPlayer = this.getCurrentPlayer();
    const themeLabel = this.theme === 'panel' ? '«Панельная романтика» 🏢' : this.theme === 'office' ? '«Офисный планктон» 💼' : '«Автопарк» 🚗';
    this.addLog(`🎲 Игра началась! Тема полей: ${themeLabel}. Первым ходит ${firstPlayer.name}`, 'success', '🏁');
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
    const treasury = this.getTreasury(player);
    const res = JailManager.payBail(treasury);
    player.inJail = false;
    player.jailTurns = 0;
    this.syncPlayerTreasuries();
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
          const treasury = this.getTreasury(player);
          if (treasury.money >= jailRes.bailAmount) {
            treasury.money -= jailRes.bailAmount;
            player.inJail = false;
            player.jailTurns = 0;
            this.syncPlayerTreasuries();
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
      const treasury = this.getTreasury(player);
      treasury.money += GAME_SETTINGS.START_PASS_BONUS;
      this.syncPlayerTreasuries();
      this.addLog(
        `${player.name} прошёл через СТАРТ и получил +$${GAME_SETTINGS.START_PASS_BONUS}`,
        'money',
        '💵'
      );
    }

    player.position = newPosition;
    const tile = this.board[newPosition];

    // Record last roll metadata before landing resolution
    this.lastRoll = {
      playerId: player.id,
      dice: this.lastDice,
      skipped: false,
      passedStart,
      oldPosition,
      rolledPosition: newPosition,
      finalPosition: newPosition,
      tileId: tile.id,
      tileType: tile.type,
      isGoToJail: tile.type === 'go_to_jail',
      timestamp: Date.now()
    };

    // Handle tile landing logic
    this.handleTileLanding(player, tile);
    this.resetTurnTimer();

    // Update final position after landing resolution (e.g. if jailed, finalPosition becomes jail tile)
    this.lastRoll.finalPosition = player.position;

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
        const treasury = this.getTreasury(player);
        treasury.money += totalBonus;
        this.syncPlayerTreasuries();
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
          const treasury = this.getTreasury(player);
          if (treasury.money >= tile.price) {
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
              `${player.name} остановился на "${tile.name}", но у команды недостаточно средств ($${treasury.money} / $${tile.price}). Запуск аукциона!`,
              'info',
              '🏷️'
            );
            this.passProperty(player.id);
          }
        } else if (tile.ownerId === player.id || this.isSameTeam(tile.ownerId, player.id)) {
          this.addLog(
            `${player.name} отдыхает на территории "${tile.name}" ${this.gameMode === 'team' ? 'своей команды' : 'своей собственности'}`,
            'info',
            '🏡'
          );
          this.status = 'TURN_END';
        } else {
          // Owned by another player/team
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
    const treasury = this.getTreasury(player);
    if (treasury.money < tile.price) {
      throw new Error('Недостаточно средств для покупки');
    }

    player.missedTurns = 0;
    treasury.money -= tile.price;
    tile.ownerId = player.id;
    if (this.gameMode === 'team' && player.teamId) {
      tile.teamId = player.teamId;
    }
    if (!treasury.properties.includes(tile.id)) {
      treasury.properties.push(tile.id);
    }
    this.syncPlayerTreasuries();

    const isMonopoly = MonopolyManager.hasMonopoly(this.board, player.id, tile.group, {
      isSameTeam: this.isSameTeam.bind(this),
      teamId: player.teamId
    });
    const monopolyMsg = isMonopoly ? (this.gameMode === 'team' ? ' 🌟 КОМАНДА СОБРАЛА МОНОПОЛИЮ! Рента удвоена!' : ' 🌟 СОБРАНА МОНОПОЛИЯ РАЙОНА! Рента удвоена!') : '';

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

    const opponents = this.getActivePlayers().filter(p => !this.isSameTeam(p.id, requestingPlayerId));

    // Save remaining turn time before pausing during auction
    const currentRemaining = this.turnStartedAt
      ? Math.max(1, this.turnTimeoutSeconds - Math.floor((Date.now() - this.turnStartedAt) / 1000))
      : (this.turnTimeoutSeconds || 60);
    if (this.pausedTurnRemainingSeconds === undefined) {
      this.pausedTurnRemainingSeconds = currentRemaining;
    }
    this.clearTurnTimer();

    if (opponents.length === 1) {
      const singleOpponent = opponents[0];
      // Offer single remaining opponent to buy the property directly at base initial price
      this.activeAuction = AuctionManager.initDirectOffer(tile, singleOpponent, player);
      this.activeAuction.gameMode = this.gameMode;
      this.status = 'AUCTION';
      this.addLog(
        `📢 ${player.name} отказался от покупки "${tile.name}". Предложение выкупа за изначальную стоимость ($${tile.price}) направлено игроку ${singleOpponent.name}!`,
        'info',
        '🏷️'
      );
      this.startAuctionTimer();
    } else if (opponents.length >= 2) {
      this.activeAuction = AuctionManager.initAuction(tile, this.players, requestingPlayerId, {
        gameMode: this.gameMode,
        turnNumber: this.turnNumber
      });
      this.status = 'AUCTION';
      this.addLog(
        `🔨 ${player.name} отказался от покупки "${tile.name}". Объявлен аукцион (таймер: 10с на ставку)! Стартовая цена: $${this.activeAuction.currentBid}`,
        'warning',
        '🏷️'
      );
      this.startAuctionTimer();
    } else {
      if (this.gameMode === 'reverse') {
        const startingBid = Math.max(10, Math.ceil((tile.price || 100) * 0.10));
        const cost = Math.min(player.money > 0 ? player.money : startingBid, startingBid);
        player.money -= cost;
        tile.ownerId = player.id;
        if (!player.properties.includes(tile.id)) {
          player.properties.push(tile.id);
        }
        this.addLog(
          `📦 В режиме "Наоборот" нет соперников: "${tile.name}" принудительно достаётся ${player.name} за $${cost}!`,
          'warning',
          '📦'
        );
      }
      this.status = 'TURN_END';
      const resumeSeconds = this.pausedTurnRemainingSeconds !== undefined ? this.pausedTurnRemainingSeconds : 60;
      this.pausedTurnRemainingSeconds = undefined;
      this.resetTurnTimer(resumeSeconds);
    }

    return this.getPublicState();
  }

  // --- Auctions ---
  startAuctionTimer() {
    this.stopAuctionTimer();
    if (!this.activeAuction) return;

    this.activeAuction.timerSeconds = 10;
    this.activeAuction.remainingSeconds = 10;
    this.activeAuction.endsAt = Date.now() + 10000;

    this.auctionInterval = setInterval(() => {
      if (!this.activeAuction || this.status !== 'AUCTION') {
        this.stopAuctionTimer();
        return;
      }

      this.activeAuction.remainingSeconds = Math.max(
        0,
        Math.ceil((this.activeAuction.endsAt - Date.now()) / 1000)
      );

      if (this.activeAuction.remainingSeconds <= 0) {
        this.stopAuctionTimer();
        this.finishAuction();
        this.notifyStateChange();
      } else {
        this.notifyStateChange();
      }
    }, 1000);
  }

  stopAuctionTimer() {
    if (this.auctionInterval) {
      clearInterval(this.auctionInterval);
    }
    this.auctionInterval = null;
  }

  startAuctionForTile(tile, initiatorId = null) {
    // Pause general turn timer
    const currentRemaining = this.turnStartedAt
      ? Math.max(1, this.turnTimeoutSeconds - Math.floor((Date.now() - this.turnStartedAt) / 1000))
      : (this.turnTimeoutSeconds || 60);
    if (this.pausedTurnRemainingSeconds === undefined) {
      this.pausedTurnRemainingSeconds = currentRemaining;
    }
    this.clearTurnTimer();

    this.activeAuction = AuctionManager.initAuction(tile, this.players, initiatorId, {
      gameMode: this.gameMode,
      turnNumber: this.turnNumber
    });
    this.status = 'AUCTION';
    this.addLog(`🔨 Объявлен аукцион на "${tile.name}" (10с на ставку)! Стартовая цена: $${this.activeAuction.currentBid}`, 'warning', '🏷️');
    this.startAuctionTimer();
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
      this.addLog(`💰 ${player.name} повысил ставку на аукционе до $${this.activeAuction.currentBid}! (Таймер сброшен на 10с)`, 'success', '🔨');
    }

    if (this.activeAuction.isCompleted) {
      this.finishAuction();
    } else {
      // Reset the 10-second timer whenever someone raises the bid
      this.startAuctionTimer();
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

    this.stopAuctionTimer();
    this.stats.totalAuctionsCompleted++;
    const isDirect = this.activeAuction.isDirectOffer;
    const tileName = this.activeAuction.tileName;
    const initiatorId = this.activeAuction.initiatorId;
    const tileId = this.activeAuction.tileId;
    const result = AuctionManager.resolveAuction(this.activeAuction, this.board, this.players);

    if (result && result.winner) {
      const winnerTreasury = this.getTreasury(result.winner);
      if (this.gameMode === 'team' && result.winner.teamId) {
        const tile = this.board[tileId];
        if (tile) tile.teamId = result.winner.teamId;
        if (!winnerTreasury.properties.includes(tileId)) {
          winnerTreasury.properties.push(tileId);
        }
      }
      this.syncPlayerTreasuries();

      if (this.gameMode === 'reverse') {
        result.winner.auctionCooldownUntilTurn = (this.turnNumber || 1) + 1;
      }
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
      if (this.gameMode === 'reverse' && initiatorId) {
        // Reverse mode rule: If nobody bids on the auction, the property is forcibly given to the player who landed on it for starting bid
        const initiator = this.players.find(p => p.id === initiatorId && !p.isBankrupt);
        const tile = this.board[tileId];
        if (initiator && tile) {
          const startingBid = Math.max(10, Math.ceil((tile.price || 100) * 0.10));
          const cost = Math.min(initiator.money > 0 ? initiator.money : startingBid, startingBid);
          initiator.money -= cost;
          tile.ownerId = initiator.id;
          if (!initiator.properties.includes(tile.id)) {
            initiator.properties.push(tile.id);
          }
          this.addLog(
            `📦 В режиме "Наоборот" никто не сделал ставку: "${tileName}" принудительно достаётся ${initiator.name} за $${cost}!`,
            'warning',
            '📦'
          );
        } else {
          this.addLog(`Аукцион на "${tileName}" завершён без победителя`, 'info', '🏷️');
        }
      } else {
        if (isDirect) {
          this.addLog(`Недвижимость "${tileName}" осталась в банке`, 'info', '🏷️');
        } else {
          this.addLog(`Аукцион на "${tileName}" завершён без победителя`, 'info', '🏷️');
        }
      }
    }

    this.activeAuction = null;
    this.status = 'TURN_END';

    // Resume general turn timer after auction ends
    const resumeSeconds = this.pausedTurnRemainingSeconds !== undefined ? this.pausedTurnRemainingSeconds : 60;
    this.pausedTurnRemainingSeconds = undefined;
    this.resetTurnTimer(resumeSeconds);
  }

  // --- Houses & Hotels ---
  buildHouse(requestingPlayerId, tileId) {
    const player = this.players.find(p => p.id === requestingPlayerId);
    if (!player) throw new Error('Игрок не найден');
    if (player.isBankrupt) throw new Error('Банкрот не может строить');

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== requestingPlayerId) {
      throw new Error('Строить и улучшать недвижимость можно только во время своего хода');
    }
    if (this.status === 'GAME_OVER' || this.status === 'LOBBY') {
      throw new Error('Сейчас нельзя строить здания');
    }

    const treasury = this.getTreasury(player);
    const result = MonopolyManager.buildHouse(treasury, this.board, tileId, {
      mode: this.mode,
      builtTilesThisTurn: this.builtTilesThisTurn || [],
      isSameTeam: this.isSameTeam.bind(this),
      teamId: player.teamId
    });
    this.syncPlayerTreasuries();
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
    if (player.isBankrupt) throw new Error('Банкрот не может совершать операции');

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== requestingPlayerId) {
      throw new Error('Продавать постройки можно только во время своего хода');
    }
    if (this.status === 'GAME_OVER' || this.status === 'LOBBY') {
      throw new Error('Сейчас нельзя продавать постройки');
    }

    const treasury = this.getTreasury(player);
    const result = MonopolyManager.sellHouse(treasury, this.board, tileId, {
      isSameTeam: this.isSameTeam.bind(this),
      teamId: player.teamId
    });
    this.syncPlayerTreasuries();
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
    if (player.isBankrupt) throw new Error('Банкрот не может совершать операции с недвижимостью');

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== requestingPlayerId) {
      throw new Error('Закладывать недвижимость можно только во время своего хода');
    }
    if (this.status === 'GAME_OVER' || this.status === 'LOBBY') {
      throw new Error('Сейчас нельзя закладывать недвижимость');
    }

    const treasury = this.getTreasury(player);
    const result = MortgageManager.mortgageProperty(treasury, this.board, tileId, {
      isSameTeam: this.isSameTeam.bind(this),
      teamId: player.teamId
    });
    this.syncPlayerTreasuries();
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
    if (player.isBankrupt) throw new Error('Банкрот не может совершать операции с недвижимостью');

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== requestingPlayerId) {
      throw new Error('Выкупать недвижимость из залога можно только во время своего хода');
    }
    if (this.status === 'GAME_OVER' || this.status === 'LOBBY') {
      throw new Error('Сейчас нельзя выкупать недвижимость');
    }

    const treasury = this.getTreasury(player);
    const result = MortgageManager.unmortgageProperty(treasury, this.board, tileId, {
      isSameTeam: this.isSameTeam.bind(this),
      teamId: player.teamId
    });
    this.syncPlayerTreasuries();
    this.addLog(
      `✨ ${player.name} выкупил из залога "${result.name}" за $${result.redemptionCost}`,
      'success',
      '🔓'
    );

    return this.getPublicState();
  }

  // --- Player Trading ---
  proposeTrade(fromPlayerId, toPlayerId, offer, request) {
    if (this.status === 'LOBBY' || this.status === 'GAME_OVER') {
      throw new Error('Торговля доступна только во время активной игры');
    }
    if (this.status === 'AUCTION') {
      throw new Error('Нельзя предлагать сделки во время аукциона');
    }

    const fromPlayer = this.players.find(p => p.id === fromPlayerId);
    const toPlayer = this.players.find(p => p.id === toPlayerId);

    if (!fromPlayer || !toPlayer) {
      throw new Error('Игроки для торговли не найдены');
    }

    if (this.isSameTeam(fromPlayerId, toPlayerId)) {
      throw new Error('Нельзя совершать сделки с напарником по команде, так как у вас общая казна и имущество');
    }

    if (!this.tradeOffersThisRound) {
      this.tradeOffersThisRound = {};
    }
    const currentOffers = this.tradeOffersThisRound[fromPlayerId] || 0;
    if (currentOffers >= 2) {
      throw new Error('Лимит исчерпан: нельзя предлагать больше 2 обменов за один раунд');
    }

    const pairKey = fromPlayerId < toPlayerId ? `${fromPlayerId}_${toPlayerId}` : `${toPlayerId}_${fromPlayerId}`;
    if (!this.pairTradeOffersThisRound) {
      this.pairTradeOffersThisRound = {};
    }
    const currentPairOffers = this.pairTradeOffersThisRound[pairKey] || 0;
    if (currentPairOffers >= 3) {
      throw new Error('Лимит исчерпан: нельзя предлагать больше 3 обменов между одной парой игроков за раунд');
    }

    const isBotGame = Boolean(fromPlayer.isBot || toPlayer.isBot || this.players.some(p => p.isBot));
    const trade = TradeManager.createTradeProposal(fromPlayer, toPlayer, offer, request, this.board, {
      isSameTeam: this.isSameTeam.bind(this),
      isBotGame
    });
    this.activeTrade = trade;
    this.tradeOffersThisRound[fromPlayerId] = currentOffers + 1;
    this.pairTradeOffersThisRound[pairKey] = currentPairOffers + 1;

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
      const isBotGame = Boolean(this.players.some(p => p.isBot));
      const res = TradeManager.executeTrade(this.activeTrade, this.players, this.board, {
        isSameTeam: this.isSameTeam.bind(this),
        isBotGame
      });
      this.syncPlayerTreasuries();
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
    if (this.isSameTeam(player.id, owner.id)) {
      this.addLog(
        `🤝 ${player.name} наступил на "${tile.name}" своей команды (${this.getTeam(player)?.name || 'Команда'}). Рента: $0 (бесплатно)!`,
        'info',
        '🤝'
      );
      this.status = 'TURN_END';
      return;
    }

    const rent = MonopolyManager.calculateRent(tile, this.board, owner, {
      isSameTeam: this.isSameTeam.bind(this),
      teamId: owner.teamId
    });
    if (rent === 0) {
      this.addLog(`Улица "${tile.name}" заложена в банке. Рента не взимается.`, 'info', '📜');
      this.status = 'TURN_END';
      return;
    }

    this.stats.totalRentPaid += rent;
    const buildingInfo = (tile.houses || 0) === 5 ? ' (Отель 🏨)' : (tile.houses > 0 ? ` (${tile.houses} дома 🏠)` : '');
    const ownerDisplayName = this.gameMode === 'team' ? `${this.getTeam(owner)?.name || owner.name} (${owner.name})` : owner.name;
    this.addLog(
      `${player.name} наступил на "${tile.name}"${buildingInfo} соперников ${ownerDisplayName}. Рента: $${rent}`,
      'warning',
      '💳'
    );

    const playerTreasury = this.getTreasury(player);
    const ownerTreasury = this.getTreasury(owner);

    playerTreasury.money -= rent;
    if (this.gameMode !== 'reverse') {
      ownerTreasury.money += rent;
    }
    this.syncPlayerTreasuries();

    if (playerTreasury.money >= 0) {
      if (this.gameMode === 'reverse') {
        this.addLog(`${player.name} оплатил $${rent} ренты в Банк (в режиме «Наоборот» рента уходит банку)`, 'money', '🏛️');
      } else {
        this.addLog(`${player.name} заплатил $${rent} ренты соперникам ${ownerDisplayName}`, 'money', '💸');
      }
      this.status = 'TURN_END';
    } else {
      const debt = Math.abs(playerTreasury.money);
      this.addLog(
        `⚠️ У ${this.gameMode === 'team' ? this.getTeam(player)?.name || player.name : player.name} задолженность: -$${debt}! Заложите имущество или продайте дома в меню "Моя недвижимость" для погашения долга.`,
        'danger',
        '⚠️'
      );
      this.status = 'TURN_END';
    }
  }

  payTax(player, amount, taxName) {
    this.addLog(`${player.name} оплачивает ${taxName}: -$${amount}`, 'warning', '🏛️');
    const treasury = this.getTreasury(player);
    treasury.money -= amount;
    this.syncPlayerTreasuries();
    if (treasury.money < 0) {
      const debt = Math.abs(treasury.money);
      this.addLog(
        `⚠️ У ${this.gameMode === 'team' ? this.getTeam(player)?.name || player.name : player.name} задолженность по налогу: -$${debt}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
        'danger',
        '⚠️'
      );
    }
    this.status = 'TURN_END';
  }

  // --- Card Drawing ---
  getDeckSource(deckType) {
    if (this.theme === 'office') {
      return deckType === 'chance' ? CHANCE_CARDS_OFFICE : CHEST_CARDS_OFFICE;
    }
    if (this.theme === 'panel') {
      return deckType === 'chance' ? CHANCE_CARDS_PANEL : CHEST_CARDS_PANEL;
    }
    return deckType === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
  }

  drawCard(player, deckType) {
    this.stats.totalCardDraws++;
    let deck = deckType === 'chance' ? this.chanceDeck : this.chestDeck;
    if (deck.length === 0) {
      const source = this.getDeckSource(deckType);
      deck = shuffleDeck(source);
      if (deckType === 'chance') this.chanceDeck = deck;
      else this.chestDeck = deck;
    }

    const card = deck.shift();
    const deckName = deckType === 'chance' ? 'Шанс' : 'Казна';
    const treasury = this.getTreasury(player);

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
        treasury.money += card.amount;
        this.syncPlayerTreasuries();
        if (card.amount < 0 && treasury.money < 0) {
          this.addLog(
            `⚠️ У ${this.gameMode === 'team' ? this.getTeam(player)?.name || player.name : player.name} задолженность: -$${Math.abs(treasury.money)}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
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
        const isForwardPass = targetPos > 0 && targetPos < oldPos && (!card.steps || card.steps > 0);
        if (card.collectStartBonus && isForwardPass) {
          treasury.money += GAME_SETTINGS.START_PASS_BONUS;
          this.syncPlayerTreasuries();
          this.addLog(`${player.name} прошёл через СТАРТ и получил +$${GAME_SETTINGS.START_PASS_BONUS}`, 'money', '🚀');
        }
        this.handleTileLanding(player, this.board[targetPos]);
        return;

      case 'repairs':
        let totalRepairs = 0;
        const propList = this.gameMode === 'team' ? treasury.properties : player.properties;
        propList.forEach(tId => {
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
        treasury.money -= totalRepairs;
        this.syncPlayerTreasuries();
        if (treasury.money < 0) {
          this.addLog(
            `⚠️ У ${this.gameMode === 'team' ? this.getTeam(player)?.name || player.name : player.name} задолженность за ремонт: -$${Math.abs(treasury.money)}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
            'danger',
            '⚠️'
          );
        }
        break;

      case 'player_payment':
        const otherPlayers = this.getActivePlayers().filter(p => !this.isSameTeam(p.id, player.id));
        const amountPerPlayer = card.amountPerPlayer || 20;

        if (amountPerPlayer > 0) {
          otherPlayers.forEach(op => {
            const opTreasury = this.getTreasury(op);
            const transfer = Math.min(opTreasury.money, amountPerPlayer);
            opTreasury.money -= transfer;
            treasury.money += transfer;
          });
          this.syncPlayerTreasuries();
          this.addLog(`🎁 ${player.name} собрал по $${amountPerPlayer} с соперников!`, 'success', '💰');
        } else {
          const cost = Math.abs(amountPerPlayer);
          otherPlayers.forEach(op => {
            const opTreasury = this.getTreasury(op);
            treasury.money -= cost;
            opTreasury.money += cost;
          });
          this.syncPlayerTreasuries();
          this.addLog(`🤝 ${player.name} выплатил по $${cost} соперникам`, 'warning', '💸');
          if (treasury.money < 0) {
            this.addLog(
              `⚠️ У ${this.gameMode === 'team' ? this.getTeam(player)?.name || player.name : player.name} задолженность по выплатам: -$${Math.abs(treasury.money)}! Заложите имущество или продайте дома в меню "Моя недвижимость".`,
              'danger',
              '⚠️'
            );
          }
        }
        break;

      case 'random_free_property':
        const unownedProperties = this.board.filter(t => t.type === 'property' && t.ownerId === null);
        if (unownedProperties.length > 0) {
          const giftTile = unownedProperties[Math.floor(Math.random() * unownedProperties.length)];
          giftTile.ownerId = player.id;
          if (this.gameMode === 'team' && player.teamId) {
            giftTile.teamId = player.teamId;
          }
          if (!treasury.properties.includes(giftTile.id)) {
            treasury.properties.push(giftTile.id);
          }
          this.syncPlayerTreasuries();
          this.addLog(
            `🎁 ${player.name} бесплатно получил недвижимость "${giftTile.name}" по карте [${deckName}]!`,
            'warning',
            '🎁'
          );
        } else {
          treasury.money += 100;
          this.syncPlayerTreasuries();
          this.addLog(
            `🎁 Все улицы уже заняты: ${player.name} получает компенсацию +$100 по карте [${deckName}]`,
            'info',
            '💰'
          );
        }
        break;
    }

    this.status = 'TURN_END';
  }

  handleBankruptcy(player, creditor) {
    const wasCurrentTurn = Boolean(this.getCurrentPlayer() && this.getCurrentPlayer().id === player.id);

    if (this.gameMode === 'team' && player.teamId) {
      const team = this.teams.find(t => t.id === player.teamId);
      if (team) {
        team.isBankrupt = true;
        team.money = 0;
        team.properties = [];
        for (const pid of team.playerIds) {
          const p = this.players.find(pl => pl.id === pid);
          if (p) {
            p.isBankrupt = true;
            p.money = 0;
            p.properties = [];
          }
        }
        this.board.forEach(tile => {
          if (tile.teamId === team.id || team.playerIds.includes(tile.ownerId)) {
            tile.ownerId = null;
            tile.teamId = null;
            tile.houses = 0;
            tile.isMortgaged = false;
          }
        });
        this.addLog(
          `💥 Команда "${team.name}" обанкротилась и выбывает из игры в полном составе! Все улицы команды освобождены.`,
          'danger',
          '☠️'
        );
      }
    } else {
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
    }

    if (!this.checkWinCondition()) {
      if (wasCurrentTurn) {
        this.advanceToNextPlayer();
      } else {
        this.status = 'TURN_END';
      }
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

    // In team mode, prevent unilateral bankruptcy griefing when team has money and teammate is connected
    if (this.gameMode === 'team' && player.teamId) {
      const treasury = this.getTreasury(player);
      const activeTeammates = this.players.filter(p => p.teamId === player.teamId && p.id !== player.id && !p.isBankrupt && p.isConnected);
      if (treasury && treasury.money >= 0 && activeTeammates.length > 0) {
        throw new Error('В командном режиме нельзя объявить банкротство при положительном балансе, пока напарник в игре. Используйте «Покинуть игру».');
      }
    }

    // Cancel active trade involving this player or teammates
    if (this.activeTrade && (
      this.activeTrade.initiatorId === player.id ||
      this.activeTrade.targetId === player.id ||
      this.activeTrade.fromPlayerId === player.id ||
      this.activeTrade.toPlayerId === player.id ||
      this.isSameTeam(this.activeTrade.fromPlayerId, player.id) ||
      this.isSameTeam(this.activeTrade.toPlayerId, player.id)
    )) {
      this.activeTrade = null;
    }

    // Cancel active auction if this player was leading
    if (this.activeAuction && (this.activeAuction.highestBidderId === player.id || this.isSameTeam(this.activeAuction.highestBidderId, player.id))) {
      this.activeAuction.highestBidderId = null;
    }

    // Clear disconnect timer if this player was waiting
    if (this.disconnectWaitingState && this.disconnectWaitingState.disconnectedPlayerId === player.id) {
      this.stopDisconnectWaitingTimer();
    }

    this.endedReason = this.endedReason || 'SURRENDER';
    this.handleBankruptcy(player, null);
    return this.getPublicState();
  }

  dismissDrawnCard(requestingPlayerId = null) {
    if (requestingPlayerId && this.lastDrawnCard && this.lastDrawnCard.playerId && this.lastDrawnCard.playerId !== requestingPlayerId && this.hostId !== requestingPlayerId) {
      throw new Error('Вы не можете закрыть чужую карту');
    }
    this.lastDrawnCard = null;
    return this.getPublicState();
  }

  checkWinCondition() {
    if (this.gameMode === 'team') {
      const activeTeams = this.teams.filter(t => !t.isBankrupt && t.playerIds.some(pid => {
        const p = this.players.find(pl => pl.id === pid);
        return p && !p.isBankrupt;
      }));

      if (activeTeams.length <= 1) {
        this.status = 'GAME_OVER';
        this.endedAt = Date.now();
        this.cleanupAllTimers();
        const winningTeam = activeTeams[0] || this.teams[0];
        const winningPlayer = this.players.find(p => p.teamId === winningTeam.id && !p.isBankrupt) || this.players.find(p => p.teamId === winningTeam.id);
        this.winner = {
          ...winningPlayer,
          isTeamWinner: true,
          teamId: winningTeam.id,
          teamName: winningTeam.name,
          name: winningTeam.name,
          color: winningTeam.color
        };
        this.recordFinalGameResults();
        this.addLog(`🏆 Победитель игры — ${winningTeam.name}! Поздравляем команду с победой! 🎉`, 'success', '👑');
        return true;
      }
      return false;
    }

    const active = this.getActivePlayers();
    if (active.length <= 1) {
      this.status = 'GAME_OVER';
      this.endedAt = Date.now();
      this.cleanupAllTimers();
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
    const treasury = this.getTreasury(player);
    if (treasury.money < 0) {
      throw new Error(`У вас задолженность -$${Math.abs(treasury.money)}! Продайте дома или заложите улицы в меню "Моя недвижимость", либо объявите банкротство.`);
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

    // Increment turnNumber and roundNumber after a full cycle of all active players completed
    if (nextIndex <= this.currentTurnIndex) {
      this.turnNumber = (this.turnNumber || 1) + 1;
      this.roundNumber = (this.roundNumber || 1) + 1;
      this.tradeOffersThisRound = {}; // Reset 2 trades/round limit on new round
      this.pairTradeOffersThisRound = {};

      if (this.checkRoundLimit()) {
        return;
      }
    }

    this.currentTurnIndex = nextIndex;
    this.status = 'ROLLING';
    this.builtTilesThisTurn = [];
    const nextPlayer = this.getCurrentPlayer();
    this.addLog(`➡️ Ход ${this.turnNumber || 1}: очередь переходит к ${nextPlayer.name}`, 'info', nextPlayer.color.icon);
    this.resetTurnTimer();
  }

  checkRoundLimit() {
    if (this.maxRounds && this.roundNumber > this.maxRounds) {
      this.roundNumber = this.maxRounds;
      this.status = 'GAME_OVER';
      this.endedAt = Date.now();
      this.cleanupAllTimers();

      const ranked = this.calculateRankings();
      const activeRanked = ranked.filter(p => !p.isBankrupt);
      this.winner = activeRanked[0] || ranked[0] || null;
      this.recordFinalGameResults();
      if (this.gameMode === 'reverse') {
        this.addLog(
          `🏁 Партия завершена по лимиту в ${this.maxRounds} раундов! Победитель режима "Наоборот" с наименьшим капиталом ($${this.winner ? this.winner.netWorth : 0}): ${this.winner ? this.winner.name : 'Ничья'}! 🏆`,
          'success',
          '👑'
        );
      } else if (this.gameMode === 'team') {
        this.addLog(
          `🏁 Партия завершена по лимиту в ${this.maxRounds} раундов! Команда-победитель по капиталу ($${this.winner ? this.winner.netWorth : 0}): ${this.winner ? this.winner.name : 'Ничья'}! 🏆`,
          'success',
          '👑'
        );
      } else {
        this.addLog(
          `🏁 Партия завершена по лимиту в ${this.maxRounds} раундов! Победитель по капиталу ($${this.winner ? this.winner.netWorth : 0}): ${this.winner ? this.winner.name : 'Ничья'}! 🏆`,
          'success',
          '👑'
        );
      }
      return true;
    }
    return false;
  }

  endGameByHost(requestingPlayerId) {
    if (requestingPlayerId !== this.hostId) {
      throw new Error('Только создатель комнаты может досрочно завершить игру');
    }

    this.endedReason = 'HOST_ABORT';
    this.status = 'GAME_OVER';
    this.endedAt = Date.now();
    this.cleanupAllTimers();

    const ranked = this.calculateRankings();
    const activeRanked = ranked.filter(p => !p.isBankrupt);
    this.winner = activeRanked[0] || ranked[0] || null;
    this.recordFinalGameResults();
    if (this.gameMode === 'reverse') {
      this.addLog(`🛑 Хост завершил игру. Победитель режима "Наоборот" с наименьшим капиталом: ${this.winner ? this.winner.name : 'Ничья'}!`, 'success', '🏆');
    } else if (this.gameMode === 'team') {
      this.addLog(`🛑 Хост завершил игру. Команда-победитель: ${this.winner ? this.winner.name : 'Ничья'}!`, 'success', '🏆');
    } else {
      this.addLog(`🛑 Хост завершил игру. Победитель по капиталу: ${this.winner ? this.winner.name : 'Ничья'}!`, 'success', '🏆');
    }
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
    this.turnNumber = 1;
    this.roundNumber = 1;
    this.tradeOffersThisRound = {};
    this.pairTradeOffersThisRound = {};
    this.pendingAction = null;
    this.activeAuction = null;
    this.activeTrade = null;
    this.rolledDoubleInCurrentTurn = false;
    this.lastDice = null;
    this.cleanupAllTimers();

    if (!this.initialThemeOption || this.initialThemeOption === 'random') {
      this.theme = pickRandomBoardTheme();
    }

    const sourceTiles = this.boardSize === 24
      ? (this.theme === 'panel' ? BOARD_TILES_PANEL_24 : this.theme === 'office' ? BOARD_TILES_OFFICE_24 : BOARD_TILES_24)
      : (this.theme === 'panel' ? BOARD_TILES_PANEL_40 : this.theme === 'office' ? BOARD_TILES_OFFICE_40 : BOARD_TILES_40);
    this.board = sourceTiles.map(tile => ({
      ...tile,
      ownerId: null,
      teamId: null,
      houses: 0,
      isMortgaged: false
    }));

    const restartThemeName = this.theme === 'panel' ? '«Панельная романтика» 🏢' : this.theme === 'office' ? '«Офисный планктон» 💼' : '«Автопарк и Гонки» 🚗';
    this.addLog(`🔄 Игра перезапущена. Тема полей на новую партию: ${restartThemeName}`, 'info', '🎲');

    if (this.gameMode === 'team') {
      this.teams.forEach(t => {
        t.money = this.teamStartingCash;
        t.properties = [];
        t.isBankrupt = false;
      });
    }

    this.players.forEach(p => {
      p.money = this.gameMode === 'team' ? this.teamStartingCash : (this.startingCash || GAME_SETTINGS.STARTING_CASH);
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
    if (this.gameMode === 'team') {
      // Calculate rankings on team basis
      const rankedTeams = this.teams.map(team => {
        let propertyNominalValue = 0;
        let buildingsValue = 0;

        team.properties.forEach(tileId => {
          const t = this.board[tileId];
          if (!t) return;
          propertyNominalValue += (t.price || 0);
          if (t.houses && t.houses > 0) {
            buildingsValue += t.houses * Math.floor((t.housePrice || 50) / 2);
          }
        });

        const propertyValue = propertyNominalValue + buildingsValue;
        const allGroups = [...new Set(this.board.filter(t => t.group).map(t => t.group))];
        const monopoliesCount = allGroups.filter(g =>
          MonopolyManager.hasMonopoly(this.board, null, g, { isSameTeam: this.isSameTeam.bind(this), teamId: team.id })
        ).length;

        const housesCount = team.properties.reduce((sum, tId) => {
          const t = this.board[tId];
          return sum + (t && t.houses < 5 ? t.houses : 0);
        }, 0);

        const hotelsCount = team.properties.reduce((sum, tId) => {
          const t = this.board[tId];
          return sum + (t && t.houses === 5 ? 1 : 0);
        }, 0);

        const netWorth = team.money + propertyNominalValue + buildingsValue;

        return {
          ...team,
          totalCapital: netWorth,
          netWorth,
          propertyNominalValue,
          buildingsValue,
          propertyValue,
          monopoliesCount,
          housesCount,
          hotelsCount
        };
      }).sort((a, b) => {
        if (a.isBankrupt && !b.isBankrupt) return 1;
        if (!a.isBankrupt && b.isBankrupt) return -1;
        if (a.isBankrupt && b.isBankrupt) return 0;
        return b.netWorth - a.netWorth;
      });

      // Map rankings back onto each player decorated with team rank
      const decoratedPlayers = this.players.map(p => {
        const { clientIp, socketId, sessionToken, ...safeP } = p;
        const teamData = rankedTeams.find(t => t.id === p.teamId) || {
          netWorth: p.money,
          totalCapital: p.money,
          propertyNominalValue: 0,
          buildingsValue: 0,
          propertyValue: 0,
          monopoliesCount: 0,
          housesCount: 0,
          hotelsCount: 0,
          isBankrupt: p.isBankrupt
        };
        const teamRank = rankedTeams.findIndex(t => t.id === p.teamId) + 1;
        const isWinner = this.winner ? (this.winner.teamId === p.teamId || this.winner.id === p.id) : (teamRank === 1);

        return {
          ...safeP,
          rank: teamRank,
          isWinner,
          totalCapital: teamData.totalCapital,
          netWorth: teamData.netWorth,
          propertyNominalValue: teamData.propertyNominalValue,
          buildingsValue: teamData.buildingsValue,
          propertyValue: teamData.propertyValue,
          monopoliesCount: teamData.monopoliesCount,
          housesCount: teamData.housesCount,
          hotelsCount: teamData.hotelsCount
        };
      }).sort((a, b) => a.rank - b.rank);

      return decoratedPlayers;
    }

    const sorted = [...this.players].map(p => {
      const { clientIp, socketId, sessionToken, ...safeP } = p;
      let propertyNominalValue = 0;
      let buildingsValue = 0;

      p.properties.forEach(tileId => {
        const t = this.board[tileId];
        if (!t) return;
        // Full nominal price of each property regardless of mortgage
        propertyNominalValue += (t.price || 0);
        // Half price of house/hotel buyback value
        if (t.houses && t.houses > 0) {
          buildingsValue += t.houses * Math.floor((t.housePrice || 50) / 2);
        }
      });

      const propertyValue = propertyNominalValue + buildingsValue;

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

      const netWorth = p.money + propertyNominalValue + buildingsValue;

      return {
        ...safeP,
        totalCapital: netWorth,
        netWorth,
        propertyNominalValue,
        buildingsValue,
        propertyValue,
        monopoliesCount,
        housesCount,
        hotelsCount
      };
    }).sort((a, b) => {
      if (a.isBankrupt && !b.isBankrupt) return 1;
      if (!a.isBankrupt && b.isBankrupt) return -1;
      if (a.isBankrupt && b.isBankrupt) return 0;
      if (this.gameMode === 'reverse') {
        return a.netWorth - b.netWorth;
      }
      return b.netWorth - a.netWorth;
    });
    const ratingMap = new Map((this.finalRatings || []).map(r => [r.id, r]));
    return sorted.map((p, idx) => {
      const ratingInfo = ratingMap.get(p.id);
      return {
        ...p,
        rank: idx + 1,
        isWinner: this.winner ? this.winner.id === p.id : (idx === 0),
        ratingDelta: ratingInfo ? ratingInfo.ratingDelta : undefined,
        ratingNote: ratingInfo ? ratingInfo.note : undefined,
        newRating: ratingInfo ? ratingInfo.newRating : undefined,
        oldRating: ratingInfo ? ratingInfo.oldRating : undefined
      };
    });
  }

  recordFinalGameResults() {
    try {
      const rankings = this.calculateRankings();
      const winnerId = this.winner ? this.winner.id : (rankings[0] ? rankings[0].id : null);
      const hasBots = Boolean(this.everHadBot || this.players.some(p => p.isBot));
      const durationSeconds = this.startedAt ? Math.floor(((this.endedAt || Date.now()) - this.startedAt) / 1000) : 0;

      const matchContext = {
        roomId: this.roomId,
        mode: this.mode,
        gameMode: this.gameMode,
        isPrivate: Boolean(this.isPrivate),
        startedAt: this.startedAt,
        endedAt: this.endedAt || Date.now(),
        durationSeconds,
        roundsPlayed: this.roundNumber || 1,
        turnsPlayed: this.turnNumber || 1,
        endReason: this.endedReason || 'NORMAL_WIN',
        hasBots,
        playerIps: this.players.reduce((acc, p) => {
          if (p.clientIp) acc[p.id] = p.clientIp;
          return acc;
        }, {})
      };

      const calculatedRatings = database.recordGameResults(rankings, winnerId, this.roomId, hasBots, matchContext);
      this.finalRatings = calculatedRatings;
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
      gameMode: this.gameMode || 'classic',
      theme: this.theme || 'panel',
      boardTheme: this.theme || 'panel',
      initialThemeOption: this.initialThemeOption || 'panel',
      maxRounds: this.maxRounds,
      maxPlayers: this.maxPlayers,
      isPrivate: this.isPrivate,
      hasBots: Boolean(this.everHadBot || this.players.some(p => p.isBot)),
      currentTurnIndex: this.currentTurnIndex,
      turnNumber: this.turnNumber || 1,
      roundNumber: this.maxRounds ? Math.min(this.roundNumber || 1, this.maxRounds) : (this.roundNumber || 1),
      currentPlayerId: this.getCurrentPlayer() ? this.getCurrentPlayer().id : null,
      lastDice: this.lastDice,
      lastRoll: this.lastRoll || null,
      lastDrawnCard: this.lastDrawnCard,
      pendingAction: this.pendingAction,
      activeAuction: this.activeAuction,
      activeTrade: this.activeTrade,
      tradeOffersThisRound: this.tradeOffersThisRound || {},
      builtTilesThisTurn: this.builtTilesThisTurn || [],
      disconnectWaitingState: this.disconnectWaitingState,
      winner: this.winner,
      teams: (this.teams || []).map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        money: t.money,
        properties: t.properties,
        playerIds: t.playerIds,
        isBankrupt: t.isBankrupt
      })),
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
        teamId: tile.teamId || null,
        houses: tile.houses || 0,
        isMortgaged: !!tile.isMortgaged,
        upgradeCost: tile.type === 'property' && tile.housePrice ? MonopolyManager.getUpgradeCost(tile, tile.houses || 0) : null,
        sellRefund: tile.type === 'property' && tile.housePrice ? Math.floor(MonopolyManager.getUpgradeCost(tile, Math.max(0, (tile.houses || 1) - 1)) / 2) : null,
        isMonopoly: tile.ownerId ? MonopolyManager.hasMonopoly(this.board, tile.ownerId, tile.group, { isSameTeam: this.isSameTeam.bind(this), teamId: tile.teamId }) : false,
        currentRent: tile.ownerId ? MonopolyManager.calculateRent(tile, this.board, this.players.find(p => p.id === tile.ownerId), { isSameTeam: this.isSameTeam.bind(this), teamId: tile.teamId }) : 0
      })),
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        teamId: p.teamId || null,
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
        tradeOffersRemaining: Math.max(0, 2 - ((this.tradeOffersThisRound || {})[p.id] || 0)),
        propertiesCount: p.properties.length,
        properties: p.properties
      })),
      logs: this.logs.slice(-35)
    };
  }
}

module.exports = GameEngine;

