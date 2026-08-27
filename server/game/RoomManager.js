const GameEngine = require('./GameEngine');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> GameEngine instance
    this.playerToRoom = new Map(); // socketId or playerId -> roomId
    this.socketToPlayer = new Map(); // socketId -> playerId
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0/O, 1/I
    let code = '';
    let attempts = 0;

    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (this.rooms.has(code) && attempts < 100);

    return code;
  }

  createRoom(hostPlayerId, hostPlayerName, isPrivate = false, options = {}) {
    const roomId = this.generateRoomCode();
    const game = new GameEngine(roomId, hostPlayerId, {
      isPrivate: !!isPrivate,
      mode: options.mode || 'standard',
      boardSize: options.boardSize || (options.mode === 'blitz' ? 24 : 40),
      startingCash: options.startingCash || 1500,
      maxPlayers: options.maxPlayers || 6,
      gameMode: options.gameMode || (options.mode === 'reverse' ? 'reverse' : 'classic'),
      maxRounds: options.maxRounds
    });
    game.addPlayer(hostPlayerId, hostPlayerName, options);
    this.rooms.set(roomId, game);
    return game;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.toUpperCase().trim()) || null;
  }

  deleteRoom(roomId) {
    if (!roomId) return false;
    const key = roomId.toUpperCase().trim();
    const game = this.rooms.get(key);
    if (game) {
      game.clearTurnTimer();
      game.stopActivePlayTracker();
      game.stopDisconnectWaitingTimer();
    }
    return this.rooms.delete(key);
  }

  getPublicRooms() {
    const list = [];
    for (const [roomId, game] of this.rooms.entries()) {
      const activePlayers = game.players.filter(p => p.isConnected || p.isBot);
      const connectedHumanPlayers = game.players.filter(p => p.isConnected && !p.isBot);
      
      // Auto-delete empty or abandoned lobby rooms immediately
      if (game.status === 'LOBBY' && (game.players.length === 0 || connectedHumanPlayers.length === 0)) {
        game.clearTurnTimer();
        game.stopActivePlayTracker();
        game.stopDisconnectWaitingTimer();
        this.rooms.delete(roomId);
        continue;
      }

      if (!game.isPrivate && game.status === 'LOBBY' && activePlayers.length > 0 && activePlayers.length < (game.maxPlayers || 6)) {
        const host = game.players.find(p => p.id === game.hostId && p.isConnected) || connectedHumanPlayers[0] || activePlayers[0];
        list.push({
          roomId: game.roomId,
          hostName: host ? host.name : 'Хост',
          mode: game.mode || 'standard',
          gameMode: game.gameMode || 'classic',
          maxRounds: game.maxRounds,
          boardSize: game.boardSize || (game.mode === 'blitz' ? 24 : 40),
          playersCount: activePlayers.length,
          maxPlayers: game.maxPlayers || 6,
          players: activePlayers.map(p => ({
            id: p.id,
            name: p.name,
            color: p.color
          })),
          createdAt: game.createdAt
        });
      }
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  cleanInactiveRooms() {
    const now = Date.now();
    const TTL = 4 * 60 * 60 * 1000; // 4 hours
    for (const [roomId, game] of this.rooms.entries()) {
      const connectedPlayers = game.players.filter(p => p.isConnected);
      if (connectedPlayers.length === 0 || (now - game.createdAt > TTL)) {
        game.clearTurnTimer();
        game.stopActivePlayTracker();
        game.stopDisconnectWaitingTimer();
        this.rooms.delete(roomId);
      }
    }
  }
}

module.exports = new RoomManager();
