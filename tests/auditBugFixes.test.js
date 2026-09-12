const assert = require('assert');
const { io } = require('socket.io-client');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');
const TradeManager = require('../server/game/modules/TradeManager');
const AuctionManager = require('../server/game/modules/AuctionManager');
const { createTestServer } = require('./testServerHelper');

async function runAuditFixesTests() {
  console.log('🧪 Running Comprehensive Audit Bug Fixes Test Suite...\n');

  // Test 1: Item 20 - Player name length limitation (max 24 chars)
  console.log('Test 1: Name length truncation to 24 chars');
  const longName = 'VeryLongPlayerNameExceedingTwentyFourCharactersTotally';
  const game1 = roomManager.createRoom('p_name_1', longName);
  assert.strictEqual(game1.players[0].name.length, 24);
  assert.strictEqual(game1.players[0].name, longName.substring(0, 24));

  const game1b = game1.addPlayer('p_name_2', '   ' + longName + '   ');
  assert.strictEqual(game1b.name.length, 24);
  console.log('✅ Player name length safely capped at 24 chars');

  // Test 2: Item 21 - clientIp, socketId, sessionToken stripped from rankings
  console.log('\nTest 2: clientIp & sessionToken stripped from public rankings');
  game1.players[0].clientIp = '198.51.100.42';
  game1.players[0].socketId = 'sock_secret_123';
  game1.players[0].sessionToken = 'token_secret_456';
  game1.status = 'GAME_OVER';

  const rankings = game1.calculateRankings();
  assert.strictEqual(rankings[0].clientIp, undefined, 'clientIp must not be in rankings');
  assert.strictEqual(rankings[0].socketId, undefined, 'socketId must not be in rankings');
  assert.strictEqual(rankings[0].sessionToken, undefined, 'sessionToken must not be in rankings');
  console.log('✅ Private client metadata strictly omitted from public state rankings');

  // Test 3: Item 2 - move_to card Start bonus resolution
  console.log('\nTest 3: move_to card start pass bonus resolution');
  const gameMove = roomManager.createRoom('p_move_1', 'Runner');
  gameMove.addPlayer('p_move_2', 'Runner2');
  gameMove.startGame('p_move_1');
  const runner = gameMove.players[0];
  runner.money = 1500;
  runner.position = 38;

  // Forward movement wrapping past 0 to tile 1 -> awards start pass bonus ($200)
  const cardForward = {
    id: 'c_fwd',
    title: 'Вперед',
    text: 'Идите на клетку 1',
    type: 'move_to',
    targetTileIndex: 1,
    collectStartBonus: true
  };
  gameMove.chanceDeck = [cardForward];
  gameMove.drawCard(runner, 'chance');
  assert.strictEqual(runner.position, 1);
  assert.strictEqual(runner.money, 1700, 'Forward pass must grant +$200 pass bonus');

  // Direct move to START tile (targetTileIndex: 0) -> only landing bonus ($300 total, not $500)
  runner.money = 1500;
  runner.position = 35;
  const cardStart = {
    id: 'c_start',
    title: 'На старт',
    text: 'Идите на СТАРТ',
    type: 'move_to',
    targetTileIndex: 0,
    collectStartBonus: true
  };
  gameMove.chanceDeck = [cardStart];
  gameMove.drawCard(runner, 'chance');
  assert.strictEqual(runner.position, 0);
  assert.strictEqual(runner.money, 1800, 'Direct move to start should grant $300 landing bonus, not $500 double bonus');
  console.log('✅ move_to card handles start passing accurately without duplicate payouts');

  // Test 4: Items 5, 6, 7 - TradeManager Anti-Dumping & tileId validation
  console.log('\nTest 4: TradeManager Anti-Dumping & Tile bounds validation');
  const mockBoard = [
    { id: 0, name: 'Старт', type: 'special' },
    { id: 1, name: 'Улица 1', type: 'property', price: 100, houses: 0, ownerId: 'p1' },
    { id: 2, name: 'Улица 2', type: 'property', price: 100, houses: 0, ownerId: 'p2' }
  ];
  const pA = { id: 'p1', name: 'Игрок 1', money: 500, properties: [1] };
  const pB = { id: 'p2', name: 'Игрок 2', money: 500, properties: [2] };

  // Negative or invalid tileId
  assert.strictEqual(
    TradeManager.validateTradeItems(pA, { properties: [-1] }, mockBoard).valid,
    false,
    'Negative tileId must be invalid'
  );
  assert.strictEqual(
    TradeManager.validateTradeItems(pA, { properties: [999] }, mockBoard).valid,
    false,
    'Out-of-bounds tileId must be invalid'
  );

  // Anti-Dumping: Gifting $100 for $0
  assert.throws(() => {
    TradeManager.createTradeProposal(
      pA,
      pB,
      { money: 100, properties: [] },
      { money: 0, properties: [] },
      mockBoard
    );
  }, /Несбалансированная сделка отклонена/);

  // Anti-Dumping: Gifting $100 property for $0
  assert.throws(() => {
    TradeManager.createTradeProposal(
      pA,
      pB,
      { money: 0, properties: [1] },
      { money: 0, properties: [] },
      mockBoard
    );
  }, /Несбалансированная сделка отклонена/);

  // executeTrade re-validation of anti-dumping
  const validTrade = {
    fromPlayerId: 'p1',
    toPlayerId: 'p2',
    offer: { money: 100, properties: [], jailFreeCards: 0 },
    request: { money: 0, properties: [], jailFreeCards: 0 }
  };
  assert.throws(() => {
    TradeManager.executeTrade(validTrade, [pA, pB], mockBoard);
  }, /Несбалансированная сделка отклонена/);
  console.log('✅ Trade anti-dumping and tile validation strictly verified');

  // Test 5: Item 8 - AuctionManager minIncrement and non-positive bids
  console.log('\nTest 5: AuctionManager minimum increment validation');
  const auctionTile = { id: 1, name: 'Улица', price: 100, color: '#38bdf8' };
  const bidder1 = { id: 'b1', name: 'Bidder 1', money: 1000, properties: [] };
  const bidder2 = { id: 'b2', name: 'Bidder 2', money: 1000, properties: [] };
  const auction = AuctionManager.initAuction(auctionTile, [bidder1, bidder2]);

  // Initial bid must be at least starting bid (10)
  assert.throws(() => {
    AuctionManager.placeBid(auction, bidder1, 5);
  }, /Минимальная стартовая ставка/);

  // Invalid amounts
  assert.throws(() => AuctionManager.placeBid(auction, bidder1, -10), /Некорректная сумма/);
  assert.throws(() => AuctionManager.placeBid(auction, bidder1, NaN), /Некорректная сумма/);
  assert.throws(() => AuctionManager.placeBid(auction, bidder1, Infinity), /Некорректная сумма/);

  // Valid first bid
  AuctionManager.placeBid(auction, bidder1, 20);
  assert.strictEqual(auction.currentBid, 20);

  // Subsequent bid must be >= currentBid + minIncrement (minIncrement = 10)
  assert.throws(() => {
    AuctionManager.placeBid(auction, bidder2, 21);
  }, /как минимум на \$10 больше текущей/);

  AuctionManager.placeBid(auction, bidder2, 30);
  assert.strictEqual(auction.currentBid, 30);
  console.log('✅ Auction minimum increments and numeric bounds enforced');

  // Test 6: Items 12 & 16 - proposeTrade restrictions (phase & pair limits)
  console.log('\nTest 6: proposeTrade restrictions (phase & pair limits)');
  const gameTrade = roomManager.createRoom('p_t_1', 'Trader1');
  gameTrade.addPlayer('p_t_2', 'Trader2');

  // In LOBBY
  assert.throws(() => {
    gameTrade.proposeTrade('p_t_1', 'p_t_2', { money: 50 }, { money: 50 });
  }, /Торговля доступна только во время активной игры/);

  gameTrade.startGame('p_t_1');

  // In AUCTION
  gameTrade.status = 'AUCTION';
  assert.throws(() => {
    gameTrade.proposeTrade('p_t_1', 'p_t_2', { money: 50 }, { money: 50 });
  }, /Нельзя предлагать сделки во время аукциона/);

  gameTrade.status = 'TURN_END';
  // Pair trade limits
  gameTrade.proposeTrade('p_t_1', 'p_t_2', { money: 50 }, { money: 50 });
  gameTrade.rejectTrade('p_t_2', gameTrade.activeTrade.id);
  gameTrade.proposeTrade('p_t_1', 'p_t_2', { money: 50 }, { money: 50 });
  gameTrade.rejectTrade('p_t_2', gameTrade.activeTrade.id);
  gameTrade.proposeTrade('p_t_2', 'p_t_1', { money: 50 }, { money: 50 });
  gameTrade.rejectTrade('p_t_1', gameTrade.activeTrade.id);

  // 4th trade proposal between same pair in same round must be rejected
  assert.throws(() => {
    gameTrade.proposeTrade('p_t_2', 'p_t_1', { money: 50 }, { money: 50 });
  }, /Лимит исчерпан: нельзя предлагать больше 3 обменов между одной парой игроков за раунд/);
  console.log('✅ Trading restricted during lobby/auction and pair limits enforced');

  // Test 7: Item 10 - Team mode unilateral bankruptcy griefing prevention
  console.log('\nTest 7: Team mode bankruptcy griefing prevention');
  const gameTeam = roomManager.createRoom('p_tm_1', 'Red1', false, { gameMode: 'team' });
  gameTeam.addPlayer('p_tm_2', 'Red2');
  gameTeam.setPlayerTeam('p_tm_1', 'team_red');
  gameTeam.setPlayerTeam('p_tm_2', 'team_red');
  gameTeam.addPlayer('p_tm_3', 'Blue1');
  gameTeam.addPlayer('p_tm_4', 'Blue2');
  gameTeam.setPlayerTeam('p_tm_3', 'team_blue');
  gameTeam.setPlayerTeam('p_tm_4', 'team_blue');
  gameTeam.startGame('p_tm_1');

  // Red1 tries to declare bankruptcy while team has positive money and teammate is connected
  assert.throws(() => {
    gameTeam.declareBankruptcy('p_tm_1');
  }, /В командном режиме нельзя объявить банкротство при положительном балансе/);
  console.log('✅ Team mode unilateral bankruptcy strictly prevented when solvent');

  // Test 8: Item 9 - dismiss_card authorization
  console.log('\nTest 8: dismiss_card authorization');
  gameTrade.lastDrawnCard = {
    id: 'card_x',
    playerId: 'p_t_1',
    playerName: 'Trader1'
  };

  // Another player attempts to dismiss
  assert.throws(() => {
    gameTrade.dismissDrawnCard('p_t_2');
  }, /Вы не можете закрыть чужую карту/);

  // Card owner dismisses
  gameTrade.dismissDrawnCard('p_t_1');
  assert.strictEqual(gameTrade.lastDrawnCard, null);
  console.log('✅ dismiss_card strictly verifies card ownership');

  // Test 9: Item 22 - cleanupAllTimers & destroy
  console.log('\nTest 9: Timers cleanupAllTimers and destroy');
  const gameCleanup = roomManager.createRoom('p_cl_1', 'Cleaner');
  gameCleanup.addPlayer('p_cl_2', 'Cleaner2');
  gameCleanup.startGame('p_cl_1');
  assert.ok(gameCleanup.turnTimer);

  gameCleanup.destroy();
  assert.strictEqual(gameCleanup.turnTimer, null);
  assert.strictEqual(gameCleanup.disconnectInterval, null);
  assert.strictEqual(gameCleanup.auctionInterval, null);
  assert.strictEqual(gameCleanup.onStateChangeCallback, null);
  console.log('✅ Timer cleanup and room destruction verified');

  // Test 10: Item 3 - Socket reconnect_player security defense
  console.log('\nTest 10: Socket reconnect_player identity verification');
  const testEnv = await createTestServer();
  const legitimateClient = io(testEnv.url, { reconnection: false });
  const attackerClient = io(testEnv.url, { reconnection: false });

  await Promise.all([
    new Promise(r => legitimateClient.on('connect', r)),
    new Promise(r => attackerClient.on('connect', r))
  ]);

  const createRoomRes = await new Promise(resolve => {
    legitimateClient.emit('create_room', {
      playerName: 'Alice',
      playerId: 'p_alice_auth',
      isPrivate: false
    }, resolve);
  });
  assert.strictEqual(createRoomRes.success, true);
  const roomId = createRoomRes.roomId;
  const aliceToken = createRoomRes.sessionToken;
  assert.ok(aliceToken, 'create_room must issue sessionToken');

  const bobClient = io(testEnv.url, { reconnection: false });
  await new Promise(r => bobClient.on('connect', r));
  const bobJoinRes = await new Promise(resolve => {
    bobClient.emit('join_room', {
      roomId,
      playerName: 'Bob',
      playerId: 'p_bob_auth'
    }, resolve);
  });
  assert.strictEqual(bobJoinRes.success, true);

  const startRes = await new Promise(resolve => {
    legitimateClient.emit('start_game', {}, resolve);
  });
  assert.strictEqual(startRes.success, true);

  // Attack 1: Attacker tries to hijack Alice without token or auth
  const hijackRes = await new Promise(resolve => {
    attackerClient.emit('reconnect_player', {
      roomId,
      playerId: 'p_alice_auth'
    }, resolve);
  });
  assert.strictEqual(hijackRes.success, false, 'Unauthenticated stranger must be rejected from hijacking player');
  assert(hijackRes.error.includes('отклонено') || hijackRes.error.includes('активен'));

  // Attack 2: Attacker tries with invalid token
  const fakeTokenHijack = await new Promise(resolve => {
    attackerClient.emit('reconnect_player', {
      roomId,
      playerId: 'p_alice_auth',
      sessionToken: 'fake_forged_token'
    }, resolve);
  });
  assert.strictEqual(fakeTokenHijack.success, false, 'Forged token must be rejected');
  console.log('✅ Unauthorized socket hijacking strictly blocked');

  // Legitimate client reconnects with valid sessionToken
  const freshClient = io(testEnv.url, { reconnection: false });
  await new Promise(r => freshClient.on('connect', r));

  legitimateClient.disconnect();
  await new Promise(r => setTimeout(r, 100));

  const validReconnect = await new Promise(resolve => {
    freshClient.emit('reconnect_player', {
      roomId,
      playerId: 'p_alice_auth',
      sessionToken: aliceToken
    }, resolve);
  });
  assert.strictEqual(validReconnect.success, true, 'Legitimate reconnection with sessionToken must succeed');
  assert.strictEqual(validReconnect.playerId, 'p_alice_auth');
  console.log('✅ Legitimate reconnection with sessionToken verified');

  freshClient.disconnect();
  bobClient.disconnect();
  attackerClient.disconnect();
  await testEnv.close();

  // Cleanup roomManager rooms
  roomManager.deleteRoom(game1.roomId);
  roomManager.deleteRoom(gameMove.roomId);
  roomManager.deleteRoom(gameTrade.roomId);
  roomManager.deleteRoom(gameTeam.roomId);
  roomManager.deleteRoom(gameCleanup.roomId);

  console.log('\n🎉 ALL AUDIT BUG FIXES UNIT & SECURITY TESTS PASSED! 🎉\n');
  process.exit(0);
}

runAuditFixesTests().catch(err => {
  console.error('❌ Audit fixes test failed:', err);
  process.exit(1);
});
