const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const BotManager = require('../server/game/BotManager');
const BotEngine = require('../server/game/botEngine');

console.log('🧪 Testing Jail Turn Progression & Bot Execution Fixes...');

// Test 1: Bot in jail rolls non-doubles -> ends turn cleanly
console.log('\nTest 1: Bot in Jail rolls non-doubles');
{
  const game = new GameEngine('ROOM_1', 'p1', 'Player 1', false);
  game.addPlayer('p1', 'Player 1');
  const bot = game.addBot({ difficulty: 'balanced' });
  game.startGame('p1');

  // Advance turn to bot
  game.currentTurnIndex = 1;
  const botPlayer = game.players[1];
  botPlayer.inJail = true;
  botPlayer.jailTurns = 0;
  botPlayer.money = 200;
  game.status = 'ROLLING';

  // Force non-doubles roll
  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'ROLL_JAIL_DICE');

  // Execute bot jail action via BotManager method
  game.rollJailDice(bot.id);
  assert.strictEqual(game.status, 'TURN_END', 'Status must be TURN_END after failing jail doubles roll');

  // Next decision in TURN_END must be END_TURN
  let nextDecision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(nextDecision.type, 'END_TURN', 'Bot must end turn in TURN_END phase');

  // End turn advances to player 1
  game.endTurn(bot.id);
  assert.strictEqual(game.currentTurnIndex, 0, 'Turn must return to Player 1');
  assert.strictEqual(game.status, 'ROLLING', 'Game must be in ROLLING state for Player 1');
  console.log('✅ Bot in jail rolls non-doubles and ends turn cleanly');
}

// Test 2: Bot in jail pays bail -> ROLLING -> rolls dice -> moves
console.log('\nTest 2: Bot in Jail pays bail');
{
  const game = new GameEngine('ROOM_2', 'p1', 'Player 1', false);
  game.addPlayer('p1', 'Player 1');
  const bot = game.addBot({ difficulty: 'aggressive' });
  game.startGame('p1');

  game.currentTurnIndex = 1;
  const botPlayer = game.players[1];
  botPlayer.inJail = true;
  botPlayer.jailTurns = 0;
  botPlayer.money = 500;
  game.status = 'ROLLING';

  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'PAY_BAIL');

  // Execute payBail alias
  game.payBail(bot.id);
  assert.strictEqual(botPlayer.inJail, false, 'Bot must no longer be in jail');
  assert.strictEqual(game.status, 'ROLLING', 'Game status must be ROLLING');

  // Next decision must be ROLL_DICE
  let rollDecision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(rollDecision.type, 'ROLL_DICE');
  game.rollDice(bot.id);
  assert.ok(botPlayer.position > 0, 'Bot must have moved from jail/position 0');
  console.log('✅ Bot pays bail, rolls dice, and moves forward on board');
}

// Test 3: Method aliases on GameEngine
console.log('\nTest 3: GameEngine Aliases Validation');
{
  const game = new GameEngine('ROOM_3', 'p1', 'Player 1', false);
  assert.strictEqual(typeof game.rollJailDice, 'function');
  assert.strictEqual(typeof game.payBail, 'function');
  assert.strictEqual(typeof game.acceptTrade, 'function');
  assert.strictEqual(typeof game.rejectTrade, 'function');
  console.log('✅ All GameEngine method aliases present and verified');
}

console.log('\n🎉 ALL JAIL TURN FIX TESTS PASSED!\n');
process.exit(0);
