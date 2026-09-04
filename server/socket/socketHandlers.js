const roomManager = require('../game/RoomManager');
const telegramAuth = require('../auth/telegramAuth');
const yandexAuth = require('../auth/yandexAuth');
const database = require('../db/Database');
const botManager = require('../game/BotManager');
const profanityFilter = require('../utils/profanityFilter');

function setupSocketHandlers(io) {
  // Helper to broadcast public rooms list to all clients in welcome/menu
  const broadcastRoomsList = () => {
    const list = roomManager.getPublicRooms();
    io.emit('rooms_list_updated', list);
    io.emit('rooms_list_update', list);
  };

  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentPlayerId = null;
    let currentTelegramUser = null;
    const socketClientIp = (socket.handshake.headers['x-forwarded-for']
      ? socket.handshake.headers['x-forwarded-for'].split(',')[0].trim()
      : socket.handshake.address) || '';

    // Send initial list of open rooms to newly connected socket
    const initialRooms = roomManager.getPublicRooms();
    socket.emit('rooms_list_updated', initialRooms);
    socket.emit('rooms_list_update', initialRooms);

    // Helper to broadcast room state to all in room and trigger bot actions if needed
    const broadcastGameState = (game) => {
      const state = game.getPublicState();
      io.to(game.roomId).emit('game_state_updated', state);
      broadcastRoomsList();
      botManager.scheduleBotActionIfNeeded(game, broadcastGameState);
    };

    // Helper to send error to client
    const sendError = (cb, message) => {
      if (typeof cb === 'function') {
        cb({ success: false, error: message });
      } else {
        socket.emit('error_notification', { message });
      }
    };

    // Socket-level rate limiter (sliding window)
    let lastChatTimestamp = 0;
    const actionTimestamps = [];
    const checkActionRateLimit = (maxActions = 40, windowMs = 5000) => {
      const now = Date.now();
      while (actionTimestamps.length > 0 && now - actionTimestamps[0] > windowMs) {
        actionTimestamps.shift();
      }
      if (actionTimestamps.length >= maxActions) {
        return false;
      }
      actionTimestamps.push(now);
      return true;
    };

    // Helper to strictly validate that the socket is currently inside the room and acting as its assigned player
    const validatePlayerAction = (payloadRoomId, payloadPlayerId, callback) => {
      if (!checkActionRateLimit()) {
        sendError(callback, 'Слишком много запросов. Пожалуйста, подождите.');
        return null;
      }
      if (!currentRoomId || !currentPlayerId) {
        sendError(callback, 'Вы не находитесь в активной комнате');
        return null;
      }
      const targetRoomId = (payloadRoomId || currentRoomId).toUpperCase().trim();
      if (targetRoomId !== currentRoomId) {
        sendError(callback, 'Действие отклонено: несовпадение комнаты');
        return null;
      }
      const game = roomManager.getRoom(targetRoomId);
      if (!game) {
        sendError(callback, 'Комната не найдена');
        return null;
      }
      if (payloadPlayerId && payloadPlayerId !== currentPlayerId) {
        sendError(callback, 'Действие отклонено: не совпадает идентификатор игрока');
        return null;
      }
      return { game, playerId: currentPlayerId };
    };

    // --- 0. Telegram & Yandex Auth & Leaderboard ---
    socket.on('auth_telegram', ({ authData }, callback) => {
      try {
        const result = telegramAuth.authenticateUser(authData);
        if (result.success) {
          currentTelegramUser = result.user;
        }
        if (typeof callback === 'function') {
          callback(result);
        }
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    socket.on('auth_yandex', async ({ authData }, callback) => {
      try {
        const result = await yandexAuth.authenticateUser(authData);
        if (result.success) {
          currentTelegramUser = result.user;
        }
        if (typeof callback === 'function') {
          callback(result);
        }
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    socket.on('update_nickname', ({ nickname, telegramId }, callback) => {
      try {
        const targetId = (currentTelegramUser && currentTelegramUser.telegramId) || telegramId;
        if (!targetId) {
          return sendError(callback, 'Вы не авторизованы');
        }
        const cleanName = (nickname || '').trim().substring(0, 24);
        if (!cleanName) {
          return sendError(callback, 'Имя не может быть пустым');
        }
        if (profanityFilter.hasProfanity(cleanName)) {
          return sendError(callback, 'Имя содержит недопустимые слова');
        }
        const updated = database.updateUserNickname(targetId, cleanName);
        if (updated) {
          currentTelegramUser = updated;
          if (typeof callback === 'function') {
            callback({ success: true, user: updated });
          }
        } else {
          sendError(callback, 'Не удалось обновить профиль');
        }
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    socket.on('get_leaderboard', ({ limit }, callback) => {
      try {
        const lLimit = Math.min(50, Math.max(5, Number(limit) || 20));
        const list = database.getLeaderboard(lLimit);
        if (typeof callback === 'function') {
          callback({ success: true, leaderboard: list });
        } else {
          socket.emit('leaderboard_updated', list);
        }
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 0. Get Rooms List
    socket.on('get_rooms_list', (callback) => {
      const list = roomManager.getPublicRooms();
      if (typeof callback === 'function') {
        callback({ success: true, rooms: list });
      } else {
        socket.emit('rooms_list_updated', list);
      }
    });

    // 1. Create Room
    socket.on('create_room', ({ playerName, playerId, isPrivate, telegramId, avatarUrl, username, characterId, mode, gameMode, maxRounds, boardSize, startingCash, maxPlayers }, callback) => {
      try {
        const id = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const rawName = (playerName || '').trim() || 'Игрок 1';
        const name = profanityFilter.censor(rawName);
        const options = {
          telegramId: telegramId || (currentTelegramUser ? currentTelegramUser.telegramId : null),
          avatarUrl: avatarUrl || (currentTelegramUser ? currentTelegramUser.avatarUrl : null),
          username: username || (currentTelegramUser ? currentTelegramUser.username : null),
          characterId: characterId || 'cat',
          clientIp: socketClientIp,
          mode: mode || 'standard',
          gameMode: gameMode || (mode === 'reverse' ? 'reverse' : 'classic'),
          boardSize: boardSize || (mode === 'blitz' ? 24 : 40),
          maxRounds: maxRounds !== undefined ? Number(maxRounds) : (gameMode === 'reverse' || mode === 'reverse' ? ((boardSize === 24 || mode === 'blitz') ? 10 : 20) : 0),
          startingCash: Number(startingCash) || 1500,
          maxPlayers: Number(maxPlayers) || ((mode === 'ranked' || gameMode === 'ranked') ? 2 : ((gameMode === 'team' || mode === 'team') ? 4 : 6))
        };

        if (options.gameMode === 'reverse' && !options.telegramId) {
          return callback?.({
            success: false,
            error: 'Режим «Наоборот» доступен только авторизованным игрокам. Пожалуйста, выполните вход.'
          });
        }
        
        const game = roomManager.createRoom(id, name, !!isPrivate, options);
        currentRoomId = game.roomId;
        currentPlayerId = id;

        // Bind state change callback for timer auto-events
        game.setStateChangeCallback((g) => {
          broadcastGameState(g);
        });

        socket.join(game.roomId);

        if (typeof callback === 'function') {
          callback({
            success: true,
            roomId: game.roomId,
            playerId: id,
            state: game.getPublicState()
          });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 1.1 Quick Match: Match into existing non-private waiting room or create new open room
    socket.on('quick_match', ({ playerName, playerId, telegramId, avatarUrl, username, characterId }, callback) => {
      try {
        const id = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const rawName = (playerName || '').trim() || 'Игрок';
        const name = profanityFilter.censor(rawName);
        const options = {
          telegramId: telegramId || (currentTelegramUser ? currentTelegramUser.telegramId : null),
          avatarUrl: avatarUrl || (currentTelegramUser ? currentTelegramUser.avatarUrl : null),
          username: username || (currentTelegramUser ? currentTelegramUser.username : null),
          characterId: characterId || 'cat',
          clientIp: socketClientIp
        };

        // Find candidate open rooms that are NOT private, in LOBBY state, and not full
        const candidateRooms = [];
        for (const [, game] of roomManager.rooms.entries()) {
          const connectedPlayers = game.players.filter(p => p.isConnected);
          if (!game.isPrivate && game.status === 'LOBBY' && connectedPlayers.length > 0 && connectedPlayers.length < (game.maxPlayers || 6)) {
            candidateRooms.push({ game, playersCount: connectedPlayers.length });
          }
        }

        // Sort descending by player count so we fill up rooms closest to starting
        candidateRooms.sort((a, b) => b.playersCount - a.playersCount);

        if (candidateRooms.length > 0) {
          // Join the best candidate existing room
          const targetGame = candidateRooms[0].game;
          let player = targetGame.players.find(p => p.id === id);
          if (!player) {
            if (targetGame.status !== 'LOBBY') {
              const botToReplace = targetGame.players.find(p => p.isBot && !p.isBankrupt);
              if (botToReplace) {
                player = targetGame.replaceBotWithHuman(botToReplace.id, id, name, options);
              } else {
                throw new Error('Игра уже началась и свободных мест нет');
              }
            } else {
              player = targetGame.addPlayer(id, name, options);
            }
          } else {
            player.isConnected = true;
            if (options.telegramId) player.telegramId = options.telegramId;
            if (options.avatarUrl) player.avatarUrl = options.avatarUrl;
            if (options.username) player.username = options.username;
            if (options.characterId) player.characterId = options.characterId;
          }

          currentRoomId = targetGame.roomId;
          currentPlayerId = id;
          socket.join(targetGame.roomId);

          if (typeof callback === 'function') {
            callback({
              success: true,
              roomId: targetGame.roomId,
              playerId: id,
              state: targetGame.getPublicState(),
              isNewRoom: false
            });
          }
          broadcastGameState(targetGame);
        } else {
          // No suitable public rooms -> Create new open public room
          const newGame = roomManager.createRoom(id, name, false, options);
          currentRoomId = newGame.roomId;
          currentPlayerId = id;

          newGame.setStateChangeCallback((g) => {
            broadcastGameState(g);
          });

          socket.join(newGame.roomId);

          if (typeof callback === 'function') {
            callback({
              success: true,
              roomId: newGame.roomId,
              playerId: id,
              state: newGame.getPublicState(),
              isNewRoom: true
            });
          }
          broadcastGameState(newGame);
        }
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 2. Join Room
    socket.on('join_room', ({ roomId, playerName, playerId, telegramId, avatarUrl, username, characterId }, callback) => {
      try {
        if (!roomId) {
          return sendError(callback, 'Введите код комнаты');
        }
        const game = roomManager.getRoom(roomId);
        if (!game) {
          return sendError(callback, `Комната "${roomId.toUpperCase()}" не найдена`);
        }

        const id = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const rawName = (playerName || '').trim() || `Игрок ${game.players.length + 1}`;
        const name = profanityFilter.censor(rawName);
        const options = {
          telegramId: telegramId || (currentTelegramUser ? currentTelegramUser.telegramId : null),
          avatarUrl: avatarUrl || (currentTelegramUser ? currentTelegramUser.avatarUrl : null),
          username: username || (currentTelegramUser ? currentTelegramUser.username : null),
          characterId: characterId || undefined,
          clientIp: socketClientIp
        };

        let player = game.players.find(p => p.id === id);
        if (!player) {
          if (game.status !== 'LOBBY') {
            // Check if there is an active bot to replace (Requirement 10)
            const botToReplace = game.players.find(p => p.isBot && !p.isBankrupt);
            if (botToReplace) {
              player = game.replaceBotWithHuman(botToReplace.id, id, name, options);
            } else {
              throw new Error('Игра уже началась и свободных мест нет');
            }
          } else {
            player = game.addPlayer(id, name, options);
          }
        } else {
          player.isConnected = true;
          if (options.telegramId) player.telegramId = options.telegramId;
          if (options.avatarUrl) player.avatarUrl = options.avatarUrl;
          if (options.username) player.username = options.username;
          if (options.characterId) player.characterId = options.characterId;
        }

        currentRoomId = game.roomId;
        currentPlayerId = id;

        game.setStateChangeCallback((g) => {
          broadcastGameState(g);
        });

        socket.join(game.roomId);

        if (typeof callback === 'function') {
          callback({
            success: true,
            roomId: game.roomId,
            playerId: id,
            state: game.getPublicState()
          });
        }

        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 2.1 Add Bot to Lobby (Host only)
    socket.on('add_bot', ({ roomId, difficulty, teamId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, null, callback);
        if (!ctx) return;
        if (ctx.game.hostId !== ctx.playerId) {
          return sendError(callback, 'Только создатель стола может добавлять ботов');
        }

        const bot = ctx.game.addBot({ difficulty, teamId });
        if (typeof callback === 'function') {
          callback({ success: true, bot, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 2.2 Remove Bot from Lobby (Host only)
    socket.on('remove_bot', ({ roomId, botId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, null, callback);
        if (!ctx) return;
        if (ctx.game.hostId !== ctx.playerId) {
          return sendError(callback, 'Только создатель стола может удалять ботов');
        }

        const removedBot = ctx.game.removeBot(botId);
        if (typeof callback === 'function') {
          callback({ success: true, bot: removedBot, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 2.3 Set Player Team in Lobby (Team Mode)
    socket.on('set_player_team', ({ roomId, targetPlayerId, teamId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, null, callback);
        if (!ctx) return;
        if (ctx.game.status !== 'LOBBY') {
          return sendError(callback, 'Команды можно менять только в лобби перед началом игры');
        }

        const targetId = targetPlayerId || ctx.playerId;
        if (targetId !== ctx.playerId && ctx.game.hostId !== ctx.playerId) {
          return sendError(callback, 'Только хост может менять команду другим игрокам');
        }

        const targetTeam = ctx.game.setPlayerTeam(targetId, teamId);
        if (typeof callback === 'function') {
          callback({ success: true, team: targetTeam, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 3. Set Player Character (Tiny Pets)
    socket.on('set_character', ({ roomId, playerId, characterId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.setCharacter(ctx.playerId, characterId);
        broadcastGameState(ctx.game);
        if (typeof callback === 'function') callback({ success: true, characterId });
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 4. Reconnect to Room
    socket.on('reconnect_player', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) {
          return sendError(callback, 'Комната не существует');
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player) {
          return sendError(callback, 'Игрок не найден в этой комнате');
        }

        game.reconnectPlayer(playerId);
        currentRoomId = game.roomId;
        currentPlayerId = playerId;

        game.setStateChangeCallback((g) => {
          broadcastGameState(g);
        });

        socket.join(game.roomId);

        if (typeof callback === 'function') {
          callback({
            success: true,
            roomId: game.roomId,
            playerId: player.id,
            state: game.getPublicState()
          });
        }

        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 4. Start Game (Host only)
    socket.on('start_game', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        if (ctx.game.hostId !== ctx.playerId) {
          return sendError(callback, 'Только создатель стола может начать игру');
        }

        ctx.game.startGame(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 5. Roll Dice (supports roll_dice and roll_jail_dice)
    const handleRollDice = ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const result = ctx.game.rollDice(ctx.playerId);
        const playerObj = ctx.game.players.find(p => p.id === ctx.playerId);
        const playerName = playerObj ? playerObj.name : 'Игрок';

        io.to(ctx.game.roomId).emit('player_rolled', {
          playerId: ctx.playerId,
          player: { id: ctx.playerId, name: playerName },
          dice: result.dice,
          skipped: result.skipped,
          passedStart: result.passedStart,
          oldPosition: result.oldPosition,
          newPosition: result.newPosition,
          finalPosition: result.state.players.find(p => p.id === ctx.playerId)?.position,
          tile: result.tile,
          isGoToJail: result.tile?.type === 'go_to_jail'
        });

        if (typeof callback === 'function') {
          callback({ success: true, result });
        }

        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('roll_dice', handleRollDice);
    socket.on('roll_jail_dice', handleRollDice);

    // 6. Buy Property
    socket.on('buy_property', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.buyProperty(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 7. Pass Property (Triggers auction)
    socket.on('pass_property', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.passProperty(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 8. End Turn
    socket.on('end_turn', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.endTurn(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 9. Build House / Hotel
    socket.on('build_house', ({ roomId, playerId, tileId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= ctx.game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        ctx.game.buildHouse(ctx.playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 10. Sell House / Hotel
    socket.on('sell_house', ({ roomId, playerId, tileId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= ctx.game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        ctx.game.sellHouse(ctx.playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 11. Mortgage Property
    socket.on('mortgage_property', ({ roomId, playerId, tileId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= ctx.game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        ctx.game.mortgageProperty(ctx.playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 12. Unmortgage Property
    socket.on('unmortgage_property', ({ roomId, playerId, tileId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= ctx.game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        ctx.game.unmortgageProperty(ctx.playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 13. Place Auction Bid (supports place_bid and bid_auction)
    const handlePlaceBid = ({ roomId, playerId, amount }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.placeBid(ctx.playerId, Number(amount));

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('place_bid', handlePlaceBid);
    socket.on('bid_auction', handlePlaceBid);

    // 14. Pass Auction Bid (supports pass_bid and pass_auction)
    const handlePassBid = ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.passBid(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('pass_bid', handlePassBid);
    socket.on('pass_auction', handlePassBid);

    // 15. Pay Jail Bail (supports pay_jail_bail and pay_bail)
    const handlePayBail = ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.payJailBail(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('pay_jail_bail', handlePayBail);
    socket.on('pay_bail', handlePayBail);

    // 16. Use Jail Free Card
    socket.on('use_jail_card', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.useJailCard(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 17. Propose Trade
    socket.on('propose_trade', (data, callback) => {
      try {
        if (!data || typeof data !== 'object') return sendError(callback, 'Некорректные данные сделки');
        const fromPlayerId = data.fromPlayerId || data.initiatorId || data.playerId || currentPlayerId;
        const ctx = validatePlayerAction(data.roomId, fromPlayerId, callback);
        if (!ctx) return;

        const toPlayerId = data.toPlayerId || data.targetId || data.targetPlayerId;

        const offer = data.offer || {
          money: Number(data.offerCash || data.offerMoney) || 0,
          properties: data.offerProperties || [],
          jailFreeCards: Number(data.offerJailCards) || 0
        };

        const request = data.request || {
          money: Number(data.requestCash || data.requestMoney) || 0,
          properties: data.requestProperties || [],
          jailFreeCards: Number(data.requestJailCards) || 0
        };

        const trade = ctx.game.proposeTrade(ctx.playerId, toPlayerId, offer, request);

        // Notify recipient specifically
        io.to(ctx.game.roomId).emit('trade_proposed', { trade });

        if (typeof callback === 'function') {
          callback({ success: true, trade, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 18. Respond Trade (Accept / Decline)
    const handleRespondTrade = ({ roomId, playerId, tradeId, action }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const targetTradeId = tradeId || (ctx.game.activeTrade ? ctx.game.activeTrade.id : null);
        if (!targetTradeId) return sendError(callback, 'Активная сделка не найдена');

        ctx.game.respondTrade(ctx.playerId, targetTradeId, action);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('respond_trade', handleRespondTrade);
    socket.on('accept_trade', (data, cb) => handleRespondTrade({ ...data, action: 'ACCEPT' }, cb));
    socket.on('reject_trade', (data, cb) => handleRespondTrade({ ...data, action: 'DECLINE' }, cb));
    socket.on('decline_trade', (data, cb) => handleRespondTrade({ ...data, action: 'DECLINE' }, cb));

    // 19. End Game (Host only)
    socket.on('end_game', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        if (ctx.game.hostId !== ctx.playerId) {
          return sendError(callback, 'Только создатель стола может завершить игру');
        }

        ctx.game.endGameByHost(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 20. Restart Game to Lobby (Host only)
    socket.on('restart_game', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        if (ctx.game.hostId !== ctx.playerId) {
          return sendError(callback, 'Только создатель стола может перезапустить игру');
        }

        ctx.game.restartGame(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 21. Declare Bankruptcy / Surrender
    socket.on('declare_bankruptcy', ({ roomId, playerId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        ctx.game.declareBankruptcy(ctx.playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 22. Dismiss Drawn Card
    socket.on('dismiss_card', ({ roomId }, callback) => {
      try {
        const ctx = validatePlayerAction(roomId, null, callback);
        if (!ctx) return;

        ctx.game.dismissDrawnCard();

        if (typeof callback === 'function') {
          callback({ success: true, state: ctx.game.getPublicState() });
        }
        broadcastGameState(ctx.game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    const handleChatMsg = ({ roomId, playerId, message }, callback) => {
      try {
        const now = Date.now();
        if (now - lastChatTimestamp < 800) {
          return sendError(callback, 'Слишком частые сообщения в чат');
        }
        lastChatTimestamp = now;

        const ctx = validatePlayerAction(roomId, playerId, callback);
        if (!ctx) return;

        const player = ctx.game.players.find(p => p.id === ctx.playerId);
        if (!player) return sendError(callback, 'Игрок не найден');

        // Block unauthorized players
        if (!currentTelegramUser && !player.telegramId && !player.yandexId) {
          return sendError(callback, 'Чат доступен только для авторизованных пользователей');
        }

        const cleanMsg = (message || '').trim();
        if (!cleanMsg) return;

        // Automatically censor obscenities / profanity in chat
        const filteredMsg = profanityFilter.censor(cleanMsg);

        const senderName = player ? player.name : (currentTelegramUser ? currentTelegramUser.firstName : 'Игрок');
        const senderColor = player ? player.color.hex : '#9CA3AF';
        const senderIcon = player ? player.color.icon : '💬';

        const chatPayload = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          playerId: ctx.playerId,
          senderName,
          senderColor,
          senderIcon,
          message: filteredMsg.substring(0, 300),
          timestamp: Date.now()
        };

        io.to(ctx.game.roomId).emit('chat_message', chatPayload);
        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        console.error('Chat error:', err);
        sendError(callback, err.message);
      }
    };
    socket.on('send_chat', handleChatMsg);
    socket.on('send_chat_message', handleChatMsg);

    // 24. Leave Room
    socket.on('leave_room', ({ roomId, playerId }, callback) => {
      try {
        const rId = (roomId || currentRoomId)?.toUpperCase()?.trim();
        const pId = playerId || currentPlayerId;
        if (!rId) {
          if (typeof callback === 'function') callback({ success: true });
          return;
        }

        // Prevent leaving or disconnecting on behalf of someone else
        if (currentPlayerId && pId && pId !== currentPlayerId) {
          return sendError(callback, 'Нельзя покинуть комнату за другого игрока');
        }

        // Leave socket room FIRST so this client never receives trailing broadcasts for this room
        socket.leave(rId);
        if (currentRoomId === rId) currentRoomId = null;
        if (currentPlayerId === pId) currentPlayerId = null;

        const game = roomManager.getRoom(rId);
        if (game) {
          game.removePlayer(pId, true);
          const remainingConnected = game.players.filter(p => p.isConnected);

          if (game.status === 'LOBBY') {
            if (game.players.length === 0 || remainingConnected.length === 0) {
              roomManager.deleteRoom(rId);
            } else {
              broadcastGameState(game);
            }
          } else if (game.status === 'GAME_OVER') {
            if (remainingConnected.length === 0) {
              roomManager.deleteRoom(rId);
            } else {
              broadcastGameState(game);
            }
          } else {
            // In active game: player left
            if (remainingConnected.length === 0) {
              roomManager.deleteRoom(rId);
            } else {
              broadcastGameState(game);
            }
          }
        }

        broadcastRoomsList();

        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (err) {
        console.error('Error in leave_room:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 25. Disconnect
    socket.on('disconnect', () => {
      if (currentRoomId && currentPlayerId) {
        const game = roomManager.getRoom(currentRoomId);
        if (game) {
          game.removePlayer(currentPlayerId);
          const remainingConnected = game.players.filter(p => p.isConnected);
          if (game.status === 'LOBBY' && (game.players.length === 0 || remainingConnected.length === 0)) {
            roomManager.deleteRoom(currentRoomId);
          } else {
            broadcastGameState(game);
          }
        }
      }
      broadcastRoomsList();
    });
  });
}

module.exports = setupSocketHandlers;
