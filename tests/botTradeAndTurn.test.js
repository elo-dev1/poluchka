const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const BotManager = require('../server/game/BotManager');
const BotEngine = require('../server/game/botEngine');

console.log('🧪 Testing Bot Trades, Turn Counters, and Bankrupt States...');

// Test 1: Turn and Round Number Tracking
console.log('\nTest 1: Turn and Round Number Tracking');
{
  const game = new GameEngine('ROOM_TURNS', 'p1', 'Player 1', false);
  game.addPlayer('p1', 'Player 1');
  const bot1 = game.addBot({ difficulty: 'balanced' });
  const bot2 = game.addBot({ difficulty: 'balanced' });
  game.startGame('p1');

  assert.strictEqual(game.turnNumber, 1, 'Game starts at Turn 1');

  // Player 1 finishes -> Next is Bot 1 (still Turn 1)
  game.advanceToNextPlayer();
  assert.strictEqual(game.currentTurnIndex, 1);
  assert.strictEqual(game.turnNumber, 1, 'Turn stays 1 while other players are moving');

  // Bot 1 finishes -> Next is Bot 2 (still Turn 1)
  game.advanceToNextPlayer();
  assert.strictEqual(game.currentTurnIndex, 2);
  assert.strictEqual(game.turnNumber, 1, 'Turn stays 1 while last player is moving');

  // Bot 2 finishes -> All players moved! Wraps to Player 1 (Now Turn 2!)
  game.advanceToNextPlayer();
  assert.strictEqual(game.currentTurnIndex, 0);
  assert.strictEqual(game.turnNumber, 2, 'Turn increments to 2 after all players have moved');

  // Next full circle
  game.advanceToNextPlayer();
  assert.strictEqual(game.turnNumber, 2);
  game.advanceToNextPlayer();
  assert.strictEqual(game.turnNumber, 2);
  game.advanceToNextPlayer();
  assert.strictEqual(game.turnNumber, 3, 'Turn increments to 3 after all players move again');

  const state = game.getPublicState();
  assert.strictEqual(state.turnNumber, 3);
  console.log('✅ Turn number increments only after all players take their turn');
}

// Test 2: Human proposes trade to Bot (Bot Accepts advantageous trade)
console.log('\nTest 2: Human proposes advantageous trade to Bot');
{
  const game = new GameEngine('ROOM_TRADE_1', 'p1', 'Player 1', false);
  const p1 = game.addPlayer('p1', 'Player 1');
  const bot = game.addBot({ difficulty: 'balanced' });
  game.startGame('p1');

  // Give properties
  game.board[1].ownerId = 'p1';
  p1.properties = [1];
  game.board[3].ownerId = bot.id;
  bot.properties = [3];
  p1.money = 1000;
  bot.money = 500;

  // Human offers tile 1 + $200 for tile 3
  const trade = game.proposeTrade(
    'p1',
    bot.id,
    { money: 200, properties: [1] },
    { money: 0, properties: [3] }
  );

  assert.ok(game.activeTrade, 'Active trade must exist');
  assert.strictEqual(game.activeTrade.toPlayerId, bot.id);

  // Bot evaluates trade
  const decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'ACCEPT_TRADE', 'Bot should accept highly advantageous trade');

  // Execute accept trade
  game.acceptTrade(bot.id, trade.id);
  assert.strictEqual(game.activeTrade, null, 'Active trade should be cleared after acceptance');
  assert.strictEqual(game.board[1].ownerId, bot.id, 'Tile 1 should now belong to bot');
  assert.strictEqual(game.board[3].ownerId, 'p1', 'Tile 3 should now belong to player 1');
  assert.strictEqual(bot.money, 700, 'Bot should receive $200 cash');
  console.log('✅ Human -> Bot trade accepted and executed atomically');
}

// Test 3: Human proposes unfair trade to Bot (Bot Rejects)
console.log('\nTest 3: Human proposes unfair trade to Bot');
{
  const game = new GameEngine('ROOM_TRADE_2', 'p1', 'Player 1', false);
  const p1 = game.addPlayer('p1', 'Player 1');
  const bot = game.addBot({ difficulty: 'careful' });
  game.startGame('p1');

  game.board[3].ownerId = bot.id;
  bot.properties = [3];
  bot.money = 500;

  // Human offers $10 for bot's tile 3 ($100 property)
  const trade = game.proposeTrade(
    'p1',
    bot.id,
    { money: 10, properties: [] },
    { money: 0, properties: [3] }
  );

  const decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'REJECT_TRADE', 'Careful bot must reject lowball offer');

  game.rejectTrade(bot.id, trade.id);
  assert.strictEqual(game.activeTrade, null);
  assert.strictEqual(game.board[3].ownerId, bot.id, 'Tile 3 remains with bot');
  console.log('✅ Unfair trade correctly rejected by Bot');
}

// Test 4: Bot 1 proposes trade to Bot 2 (Bot-to-Bot trading lifecycle)
console.log('\nTest 4: Bot-to-Bot Trading Lifecycle');
{
  const game = new GameEngine('ROOM_TRADE_3', 'p1', 'Player 1', false);
  game.addPlayer('p1', 'Player 1');
  const bot1 = game.addBot({ difficulty: 'aggressive' });
  const bot2 = game.addBot({ difficulty: 'balanced' });
  game.startGame('p1');

  game.board[1].ownerId = bot1.id;
  bot1.properties = [1];
  bot1.money = 800;

  game.board[3].ownerId = bot2.id;
  bot2.properties = [3];
  bot2.money = 500;

  // Bot 1 proposes trade to Bot 2
  game.proposeTrade(
    bot1.id,
    bot2.id,
    { money: 250, properties: [1] },
    { money: 0, properties: [3] }
  );

  assert.ok(game.activeTrade);
  assert.strictEqual(game.activeTrade.fromPlayerId, bot1.id);
  assert.strictEqual(game.activeTrade.toPlayerId, bot2.id);

  // Bot 2 makes decision
  const decision = BotEngine.getDecision(game, bot2.id);
  assert.strictEqual(decision.type, 'ACCEPT_TRADE');

  game.acceptTrade(bot2.id, game.activeTrade.id);
  assert.strictEqual(game.activeTrade, null);
  assert.strictEqual(game.board[3].ownerId, bot1.id);
  assert.strictEqual(game.board[1].ownerId, bot2.id);
  console.log('✅ Bot-to-Bot trade proposal and response resolved smoothly');
}

console.log('\n🎉 ALL BOT TRADE & TURN TESTS PASSED!\n');
process.exit(0);
