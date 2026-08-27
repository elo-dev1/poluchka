const assert = require('assert');
const { io } = require('socket.io-client');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');
const BotEngine = require('../server/game/botEngine');
const MonopolyManager = require('../server/game/modules/MonopolyManager');
const { createTestServer } = require('./testServerHelper');

async function runTests() {
  console.log('🧪 Running Reverse ("Наоборот") Mode Tests...\n');

  // Test 1: Initializes reverse mode with maxRounds = 20
  console.log('Test 1: Initializes reverse mode with maxRounds = 20');
  const game = new GameEngine('TEST_ROOM', 'player_1', {
    gameMode: 'reverse',
    maxRounds: 20,
    startingCash: 1500
  });
  game.addPlayer('player_1', 'Alice', { characterId: 'cat' });
  game.addPlayer('player_2', 'Bob', { characterId: 'dog' });
  game.addPlayer('player_3', 'Charlie', { characterId: 'fox' });
  game.status = 'ROLLING';

  assert.strictEqual(game.gameMode, 'reverse');
  assert.strictEqual(game.maxRounds, 20);
  const state = game.getPublicState();
  assert.strictEqual(state.gameMode, 'reverse');
  assert.strictEqual(state.maxRounds, 20);
  console.log('✅ Test 1 passed');

  // Test 2: Net worth calculation (Cash + Nominal Property Price + 50% building price)
  console.log('Test 2: Net worth calculation with full nominal price (even mortgaged) and 50% buildings');
  const p1 = game.players[0];
  p1.money = 500;
  const tile1 = game.board[1];
  const tile2 = game.board[3];
  tile1.ownerId = p1.id;
  tile2.ownerId = p1.id;
  tile1.houses = 2;
  tile1.housePrice = 50;
  tile2.isMortgaged = true;
  p1.properties = [tile1.id, tile2.id];

  const rankings = game.calculateRankings();
  const rankedP1 = rankings.find(r => r.id === p1.id);
  const expectedNetWorth = 500 + tile1.price + (2 * Math.floor(50 / 2)) + tile2.price;
  assert.strictEqual(rankedP1.netWorth, expectedNetWorth);
  assert.strictEqual(rankedP1.propertyNominalValue, tile1.price + tile2.price);
  assert.strictEqual(rankedP1.buildingsValue, 50);
  console.log('✅ Test 2 passed');

  // Test 3: Ranking order in reverse mode: Lowest Net Worth is Rank 1, Bankrupt is disqualified
  console.log('Test 3: Ranking order in reverse mode');
  const p2 = game.players[1];
  const p3 = game.players[2];
  p1.money = 300;
  p1.properties = [];
  p2.money = 1200;
  p2.properties = [];
  p3.money = 0;
  p3.isBankrupt = true;

  const rankings3 = game.calculateRankings();
  assert.strictEqual(rankings3[0].id, p1.id);
  assert.strictEqual(rankings3[0].rank, 1);
  assert.strictEqual(rankings3[1].id, p2.id);
  assert.strictEqual(rankings3[1].rank, 2);
  assert.strictEqual(rankings3[2].id, p3.id);
  assert.strictEqual(rankings3[2].rank, 3);
  console.log('✅ Test 3 passed');

  // Test 4: Win condition by survival
  console.log('Test 4: Win condition by survival');
  game.players[0].isBankrupt = true;
  game.players[1].isBankrupt = true;
  game.players[2].isBankrupt = false;
  const hasEnded = game.checkWinCondition();
  assert.strictEqual(hasEnded, true);
  assert.strictEqual(game.status, 'GAME_OVER');
  assert.strictEqual(game.winner.id, 'player_3');
  console.log('✅ Test 4 passed');

  // Test 5: Game ends at round limit and crowns lowest net worth
  console.log('Test 5: Round limit victory');
  game.status = 'ROLLING';
  game.players[0].isBankrupt = false;
  game.players[1].isBankrupt = false;
  game.players[2].isBankrupt = false;
  game.players[0].money = 400;
  game.players[1].money = 800;
  game.players[2].money = 1200;
  game.roundNumber = 21;
  const hasEndedLimit = game.checkRoundLimit();
  assert.strictEqual(hasEndedLimit, true);
  assert.strictEqual(game.status, 'GAME_OVER');
  assert.strictEqual(game.winner.id, game.players[0].id);
  console.log('✅ Test 5 passed');

  // Test 6: Mandatory property acquisition on unbought auction
  console.log('Test 6: Mandatory property acquisition on unbought auction');
  const initiator = game.players[0];
  initiator.money = 1000;
  const testTile = game.board[1];
  const startingBid = Math.max(10, Math.ceil((testTile.price || 100) * 0.10));
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: testTile.id, price: testTile.price };

  game.passProperty(initiator.id);
  assert.strictEqual(game.status, 'AUCTION');
  assert.strictEqual(game.activeAuction.initiatorId, initiator.id);

  game.passBid(game.players[1].id);
  game.passBid(game.players[2].id);
  assert.strictEqual(game.status, 'TURN_END');
  assert.strictEqual(testTile.ownerId, initiator.id);
  assert.strictEqual(initiator.properties.includes(testTile.id), true);
  assert.strictEqual(initiator.money, 1000 - startingBid);
  console.log('✅ Test 6 passed');

  // Test 7: random_free_property card
  console.log('Test 7: random_free_property card');
  const card = { id: 'test_card', title: 'Наследство', text: 'Тест', type: 'random_free_property' };
  game.chanceDeck = [card];
  game.status = 'ACTION';
  const initialPropsCount = initiator.properties.length;
  game.drawCard(initiator, 'chance');
  assert.strictEqual(initiator.properties.length, initialPropsCount + 1);
  console.log('✅ Test 7 passed');

  // Test 8: BotEngine reverse heuristics
  console.log('Test 8: BotEngine reverse heuristics (avoids buying, avoids building, passes auction)');
  const bot = { id: 'bot_1', money: 2000, properties: [] };
  const botGameState = {
    gameMode: 'reverse',
    board: game.board,
    players: [bot],
    pendingAction: { tileId: 1 }
  };
  const buyDec = BotEngine.decidePropertyPurchase(botGameState, bot, 'aggressive');
  assert.strictEqual(buyDec.type, 'PASS_PROPERTY');
  const buildDec = BotEngine.decideBuildingAction(botGameState, bot, 'aggressive');
  assert.strictEqual(buildDec, null);
  botGameState.activeAuction = { tileId: 1, currentBid: 10, highestBidderId: null, isCompleted: false, activeBidders: ['bot_1'] };
  const auctionDec = BotEngine.decideAuctionAction(botGameState, bot, 'aggressive');
  assert.strictEqual(auctionDec.type, 'PASS_AUCTION');
  console.log('✅ Test 8 passed');

  // Test 9: BotEngine reverse trade acceptance
  console.log('Test 9: BotEngine reverse trade acceptance');
  const botTradeState = {
    gameMode: 'reverse',
    board: game.board,
    players: [bot, { id: 'player_1', money: 1000, properties: [] }],
    activeTrade: {
      targetId: 'bot_1',
      offer: { money: 0, properties: [] },
      request: { money: 0, properties: [1] }
    }
  };
  const tradeDec = BotEngine.decideTradeResponse(botTradeState, bot, 'balanced');
  assert.strictEqual(tradeDec.type, 'ACCEPT_TRADE');
  console.log('✅ Test 9 passed');

  // Test 10: RoomManager creation
  console.log('Test 10: RoomManager creation');
  const created = roomManager.createRoom('p1', 'Alice', false, { gameMode: 'reverse', maxRounds: 20 });
  assert.strictEqual(created.gameMode, 'reverse');
  assert.strictEqual(created.maxRounds, 20);
  const pRooms = roomManager.getPublicRooms();
  const summary = pRooms.find(r => r.roomId === created.roomId);
  assert.strictEqual(summary.gameMode, 'reverse');
  assert.strictEqual(summary.maxRounds, 20);
  roomManager.deleteRoom(created.roomId);
  console.log('✅ Test 10 passed');

  game.clearTurnTimer();
  game.stopDisconnectWaitingTimer();
  game.stopActivePlayTracker();
  game.stopAuctionTimer();

  // Test 11: Rent in Reverse mode goes to the Bank (not to owner)
  console.log('Test 11: Rent in Reverse mode goes to the Bank');
  const rentGame = new GameEngine('ROOM_RENT_REV', 'p1', { gameMode: 'reverse' });
  const revP1 = rentGame.addPlayer('p1', 'Player 1');
  const revP2 = rentGame.addPlayer('p2', 'Player 2');
  rentGame.startGame('p1');

  // Assign property 1 to p2
  rentGame.board[1].ownerId = 'p2';
  revP2.properties = [1];
  revP1.money = 1500;
  revP2.money = 1500;

  const rentVal = MonopolyManager.calculateRent(rentGame.board[1], rentGame.board, revP2);
  rentGame.payRent(revP1, revP2, rentGame.board[1]);

  assert.strictEqual(revP1.money, 1500 - rentVal, 'Player 1 pays rent');
  assert.strictEqual(revP2.money, 1500, 'Owner (Player 2) does NOT receive rent in Reverse mode (burns in bank)');
  console.log('✅ Rent goes to Bank and is not credited to owner in Reverse mode');

  rentGame.clearTurnTimer();
  rentGame.stopDisconnectWaitingTimer();
  rentGame.stopActivePlayTracker();

  // Test 12: Authorization requirement for Reverse Mode creation over Socket
  console.log('Test 12: Authorization requirement for Reverse Mode over Socket');
  const testEnv = await createTestServer();
  const client = io(testEnv.url, { reconnection: false });
  await new Promise(r => client.on('connect', r));

  // A: Unauthorized guest tries to create Reverse mode room -> REJECTED
  const unauthRes = await new Promise(resolve => {
    client.emit('create_room', {
      playerName: 'Гость',
      gameMode: 'reverse'
    }, resolve);
  });
  assert.strictEqual(unauthRes.success, false);
  assert.match(unauthRes.error, /авторизованным игрокам/);
  console.log('✅ Unauthorized client rejected when creating Reverse mode room');

  // B: Authorized client logs in -> CREATION SUCCEEDS
  await new Promise(resolve => {
    client.emit('auth_telegram', {
      authData: {
        id: 'tg_rev_user_1',
        first_name: 'Реверс Мастер',
        username: 'rev_master',
        isDemo: true
      }
    }, resolve);
  });

  const authRes = await new Promise(resolve => {
    client.emit('create_room', {
      playerName: 'Реверс Мастер',
      gameMode: 'reverse'
    }, resolve);
  });
  assert.strictEqual(authRes.success, true);
  assert.strictEqual(authRes.state.gameMode, 'reverse');
  console.log('✅ Authorized client successfully created Reverse mode room');

  client.disconnect();
  await testEnv.close();

  console.log('\n🎉 ALL REVERSE MODE TESTS PASSED SUCCESSFULLY! 🎉\n');
}

if (typeof describe === 'function') {
  describe('Reverse ("Наоборот") Mode Game Engine Tests', () => {
    test('Run all reverse mode assertions', async () => {
      await runTests();
    });
  });
} else {
  runTests().catch(err => {
    console.error('❌ Reverse mode tests failed:', err);
    process.exit(1);
  });
}
