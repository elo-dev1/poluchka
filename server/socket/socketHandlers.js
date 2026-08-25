const roomManager = require('../game/RoomManager');
const telegramAuth = require('../auth/telegramAuth');
const yandexAuth = require('../auth/yandexAuth');
const database = require('../db/Database');
const botManager = require('../game/BotManager');

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
    socket.on('create_room', ({ playerName, playerId, isPrivate, telegramId, avatarUrl, username, characterId, mode, boardSize, startingCash, maxPlayers }, callback) => {
      try {
        const id = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const name = (playerName || '').trim() || 'Игрок 1';
        const options = {
          telegramId: telegramId || (currentTelegramUser ? currentTelegramUser.telegramId : null),
          avatarUrl: avatarUrl || (currentTelegramUser ? currentTelegramUser.avatarUrl : null),
          username: username || (currentTelegramUser ? currentTelegramUser.username : null),
          characterId: characterId || 'cat',
          mode: mode || 'standard',
          boardSize: boardSize || (mode === 'blitz' ? 24 : 40),
          startingCash: Number(startingCash) || 1500,
          maxPlayers: Number(maxPlayers) || 6
        };
        
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
        const name = (playerName || '').trim() || 'Игрок';
        const options = {
          telegramId: telegramId || (currentTelegramUser ? currentTelegramUser.telegramId : null),
          avatarUrl: avatarUrl || (currentTelegramUser ? currentTelegramUser.avatarUrl : null),
          username: username || (currentTelegramUser ? currentTelegramUser.username : null),
          characterId: characterId || 'cat'
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
        const name = (playerName || '').trim() || `Игрок ${game.players.length + 1}`;
        const options = {
          telegramId: telegramId || (currentTelegramUser ? currentTelegramUser.telegramId : null),
          avatarUrl: avatarUrl || (currentTelegramUser ? currentTelegramUser.avatarUrl : null),
          username: username || (currentTelegramUser ? currentTelegramUser.username : null),
          characterId: characterId || undefined
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
    socket.on('add_bot', ({ roomId, difficulty }, callback) => {
      try {
        const rId = roomId || currentRoomId;
        const game = roomManager.getRoom(rId);
        if (!game) return sendError(callback, 'Комната не найдена');
        if (game.hostId !== (currentPlayerId || game.hostId)) {
          return sendError(callback, 'Только создатель стола может добавлять ботов');
        }

        const bot = game.addBot({ difficulty });
        if (typeof callback === 'function') {
          callback({ success: true, bot, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 2.2 Remove Bot from Lobby (Host only)
    socket.on('remove_bot', ({ roomId, botId }, callback) => {
      try {
        const rId = roomId || currentRoomId;
        const game = roomManager.getRoom(rId);
        if (!game) return sendError(callback, 'Комната не найдена');
        if (game.hostId !== (currentPlayerId || game.hostId)) {
          return sendError(callback, 'Только создатель стола может удалять ботов');
        }

        const removedBot = game.removeBot(botId);
        if (typeof callback === 'function') {
          callback({ success: true, bot: removedBot, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 3. Set Player Character (Tiny Pets)
    socket.on('set_character', ({ roomId, playerId, characterId }, callback) => {
      try {
        const rId = roomId || currentRoomId;
        const pId = playerId || currentPlayerId;
        const game = roomManager.getRoom(rId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.setCharacter(pId, characterId);
        broadcastGameState(game);
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
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.startGame(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 5. Roll Dice (supports roll_dice and roll_jail_dice)
    const handleRollDice = ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const result = game.rollDice(playerId);

        io.to(game.roomId).emit('player_rolled', {
          playerId,
          dice: result.dice,
          skipped: result.skipped,
          passedStart: result.passedStart,
          oldPosition: result.oldPosition,
          newPosition: result.newPosition,
          tile: result.tile
        });

        if (typeof callback === 'function') {
          callback({ success: true, result });
        }

        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('roll_dice', handleRollDice);
    socket.on('roll_jail_dice', handleRollDice);

    // 6. Buy Property
    socket.on('buy_property', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.buyProperty(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 7. Pass Property (Triggers auction)
    socket.on('pass_property', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.passProperty(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 8. End Turn
    socket.on('end_turn', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.endTurn(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 9. Build House / Hotel
    socket.on('build_house', ({ roomId, playerId, tileId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        game.buildHouse(playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 10. Sell House / Hotel
    socket.on('sell_house', ({ roomId, playerId, tileId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        game.sellHouse(playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 11. Mortgage Property
    socket.on('mortgage_property', ({ roomId, playerId, tileId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        game.mortgageProperty(playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 12. Unmortgage Property
    socket.on('unmortgage_property', ({ roomId, playerId, tileId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const numericTileId = Number(tileId);
        if (isNaN(numericTileId) || numericTileId < 0 || numericTileId >= game.board.length) {
          return sendError(callback, 'Некорректный ID клетки');
        }

        game.unmortgageProperty(playerId, numericTileId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 13. Place Auction Bid (supports place_bid and bid_auction)
    const handlePlaceBid = ({ roomId, playerId, amount }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.placeBid(playerId, Number(amount));

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('place_bid', handlePlaceBid);
    socket.on('bid_auction', handlePlaceBid);

    // 14. Pass Auction Bid (supports pass_bid and pass_auction)
    const handlePassBid = ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.passBid(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('pass_bid', handlePassBid);
    socket.on('pass_auction', handlePassBid);

    // 15. Pay Jail Bail (supports pay_jail_bail and pay_bail)
    const handlePayBail = ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.payJailBail(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    };
    socket.on('pay_jail_bail', handlePayBail);
    socket.on('pay_bail', handlePayBail);

    // 16. Use Jail Free Card
    socket.on('use_jail_card', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.useJailCard(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 17. Propose Trade
    socket.on('propose_trade', (data, callback) => {
      try {
        const { roomId } = data;
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const fromPlayerId = data.fromPlayerId || data.initiatorId || data.playerId;
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

        const trade = game.proposeTrade(fromPlayerId, toPlayerId, offer, request);

        // Notify recipient specifically
        io.to(game.roomId).emit('trade_proposed', { trade });

        if (typeof callback === 'function') {
          callback({ success: true, trade, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 18. Respond Trade (Accept / Decline)
    const handleRespondTrade = ({ roomId, playerId, tradeId, action }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const targetTradeId = tradeId || (game.activeTrade ? game.activeTrade.id : null);
        if (!targetTradeId) return sendError(callback, 'Активная сделка не найдена');

        game.respondTrade(playerId, targetTradeId, action);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
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
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.endGameByHost(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 20. Restart Game to Lobby (Host only)
    socket.on('restart_game', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.restartGame(playerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 21. Declare Bankruptcy / Surrender
    socket.on('declare_bankruptcy', ({ roomId, playerId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId || currentRoomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.declareBankruptcy(playerId || currentPlayerId);

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    // 22. Dismiss Drawn Card
    socket.on('dismiss_card', ({ roomId }, callback) => {
      try {
        const game = roomManager.getRoom(roomId || currentRoomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        game.dismissDrawnCard();

        if (typeof callback === 'function') {
          callback({ success: true, state: game.getPublicState() });
        }
        broadcastGameState(game);
      } catch (err) {
        sendError(callback, err.message);
      }
    });

    const handleChatMsg = ({ roomId, playerId, message }, callback) => {
      try {
        const game = roomManager.getRoom(roomId);
        if (!game) return sendError(callback, 'Комната не найдена');

        const player = game.players.find(p => p.id === playerId);
        if (!player) return sendError(callback, 'Игрок не найден');

        // Block unauthorized players
        if (!currentTelegramUser && !player.telegramId && !player.yandexId) {
          return sendError(callback, 'Чат доступен только для авторизованных пользователей');
        }

        const cleanMsg = (message || '').trim();
        if (!cleanMsg) return;

        const senderName = player ? player.name : (currentTelegramUser ? currentTelegramUser.firstName : 'Игрок');
        const senderColor = player ? player.color.hex : '#9CA3AF';
        const senderIcon = player ? player.color.icon : '💬';

        const chatPayload = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          playerId,
          senderName,
          senderColor,
          senderIcon,
          message: cleanMsg.substring(0, 300),
          timestamp: Date.now()
        };

        io.to(game.roomId).emit('chat_message', chatPayload);
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
        const rId = roomId || currentRoomId;
        const pId = playerId || currentPlayerId;
        if (!rId) {
          if (typeof callback === 'function') callback({ success: true });
          return;
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
