const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');
const MonopolyManager = require('../server/game/modules/MonopolyManager');
const MortgageManager = require('../server/game/modules/MortgageManager');

async function runTests() {
  console.log('🧪 Running Team Mode (2v2) Tests...\n');

  // Test 1: Team initialization and shared starting treasury ($2250)
  console.log('Test 1: Team initialization and shared treasury');
  const game = new GameEngine('TEAM_TEST_ROOM', 'p1', {
    gameMode: 'team',
    boardSize: 40,
    startingCash: 1500
  });
  game.addPlayer('p1', 'Player 1');
  assert.strictEqual(game.gameMode, 'team');
  assert.strictEqual(game.teams.length, 2);
  assert.strictEqual(game.teams[0].id, 'team_red');
  assert.strictEqual(game.teams[1].id, 'team_blue');
  assert.strictEqual(game.teams[0].money, 2250);
  assert.strictEqual(game.teams[1].money, 2250);
  console.log('✅ Test 1 passed');

  // Test 2: Adding bots to specific teams and capacity limits
  console.log('Test 2: Adding bots to specific teams');
  const botBlue1 = game.addBot({ difficulty: 'balanced', teamId: 'team_blue' });
  const botBlue2 = game.addBot({ difficulty: 'balanced', teamId: 'team_blue' });
  assert.strictEqual(botBlue1.teamId, 'team_blue');
  assert.strictEqual(botBlue2.teamId, 'team_blue');

  // Blue team is full (2 players), adding 3rd to Blue must fail
  assert.throws(() => {
    game.addBot({ difficulty: 'balanced', teamId: 'team_blue' });
  }, /уже заполнена/);

  // Adding bot to Red team succeeds
  const botRed = game.addBot({ difficulty: 'balanced', teamId: 'team_red' });
  assert.strictEqual(botRed.teamId, 'team_red');
  assert.strictEqual(game.players.length, 4);

  const redPlayers = game.players.filter(p => p.teamId === 'team_red');
  const bluePlayers = game.players.filter(p => p.teamId === 'team_blue');
  assert.strictEqual(redPlayers.length, 2);
  assert.strictEqual(bluePlayers.length, 2);

  // Switching to full team should fail
  assert.throws(() => {
    game.setPlayerTeam(bluePlayers[0].id, 'team_red');
  }, /Команда уже заполнена/);
  console.log('✅ Test 2 passed');

  // Test 3: Alternating turns sequence
  console.log('Test 3: Alternating turns sequence across teams');
  game.startGame('p1');
  assert.strictEqual(game.status, 'ROLLING');
  const seq = game.players.map(p => p.teamId);
  assert.notStrictEqual(seq[0], seq[1]);
  assert.notStrictEqual(seq[1], seq[2]);
  assert.notStrictEqual(seq[2], seq[3]);
  console.log('✅ Test 3 passed');

  // Test 4: Shared treasury transactions
  console.log('Test 4: Shared treasury transactions and synchronization');
  const pRed1 = game.players.find(p => p.teamId === 'team_red');
  const pRed2 = game.players.filter(p => p.teamId === 'team_red')[1];
  const redTeam = game.teams.find(t => t.id === 'team_red');

  const treasury = game.getTreasury(pRed1);
  treasury.money -= 350;
  game.syncPlayerTreasuries();

  assert.strictEqual(pRed1.money, 1900);
  assert.strictEqual(pRed2.money, 1900);
  assert.strictEqual(redTeam.money, 1900);
  console.log('✅ Test 4 passed');

  // Test 5: $0 Rent when landing on teammate's property
  console.log('Test 5: $0 Rent for teammates');
  const tile1 = game.board[1];
  tile1.ownerId = pRed1.id;
  tile1.teamId = 'team_red';

  const rent = MonopolyManager.calculateRent(tile1, game.board, pRed1, {
    isSameTeam: game.isSameTeam.bind(game),
    teamId: 'team_red',
    visitor: pRed2
  });
  assert.strictEqual(rent, 0);

  // Landing on teammate street produces $0 rent and TURN_END state
  const prevRedMoney = redTeam.money;
  game.handleTileLanding(pRed2, tile1);
  assert.strictEqual(redTeam.money, prevRedMoney);
  assert.strictEqual(game.status, 'TURN_END');
  console.log('✅ Test 5 passed');

  // Test 6: Team monopoly formation and building on teammate street
  console.log('Test 6: Team monopoly formation and building on teammate street');
  const tile3 = game.board[3];
  tile3.ownerId = pRed2.id;
  tile3.teamId = 'team_red';

  const hasMono1 = MonopolyManager.hasMonopoly(game.board, pRed1.id, tile1.group, {
    isSameTeam: game.isSameTeam.bind(game),
    teamId: 'team_red'
  });
  const hasMono2 = MonopolyManager.hasMonopoly(game.board, pRed2.id, tile3.group, {
    isSameTeam: game.isSameTeam.bind(game),
    teamId: 'team_red'
  });
  assert.strictEqual(hasMono1, true);
  assert.strictEqual(hasMono2, true);

  // Make pRed1 the active turn player
  game.currentTurnIndex = game.players.findIndex(p => p.id === pRed1.id);
  game.status = 'AWAITING_ACTION';

  // pRed1 builds house on tile3 (which is owned by pRed2, but same team)
  const buildRes = game.buildHouse(pRed1.id, tile3.id);
  assert.strictEqual(tile3.houses, 1);
  assert.strictEqual(redTeam.money, 1900 - 50);
  assert.strictEqual(pRed1.money, 1900 - 50);
  assert.strictEqual(pRed2.money, 1900 - 50);

  // pRed1 sells house on tile3
  game.builtTilesThisTurn = [];
  game.sellHouse(pRed1.id, tile3.id);
  assert.strictEqual(tile3.houses, 0);
  assert.strictEqual(redTeam.money, 1850 + 25);
  console.log('✅ Test 6 passed');

  // Test 7: Mortgaging and Unmortgaging teammate street
  console.log('Test 7: Mortgaging and Unmortgaging teammate street');
  const mortgageRes = game.mortgageProperty(pRed1.id, tile3.id);
  assert.strictEqual(tile3.isMortgaged, true);
  const unmortgageRes = game.unmortgageProperty(pRed1.id, tile3.id);
  assert.strictEqual(tile3.isMortgaged, false);
  console.log('✅ Test 7 passed');

  // Test 8: Team bankruptcy eliminates both teammates
  console.log('Test 8: Team bankruptcy eliminates whole team');
  game.handleBankruptcy(pRed1, null);
  assert.strictEqual(redTeam.isBankrupt, true);
  assert.strictEqual(pRed1.isBankrupt, true);
  assert.strictEqual(pRed2.isBankrupt, true);
  assert.strictEqual(tile1.ownerId, null);
  assert.strictEqual(tile1.teamId, null);
  console.log('✅ Test 8 passed');

  console.log('\n🎉 ALL TEAM MODE TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch(err => {
  console.error('❌ Team mode test failed:', err);
  process.exit(1);
});
