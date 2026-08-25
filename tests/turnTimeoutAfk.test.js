const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');

console.log('🧪 Starting Turn Timeout & 2-Strike AFK Defeat Unit Tests...\n');

// Test 1: 1st timeout gives 1 strike and skips turn
console.log('Test 1: 1st timeout gives 1 strike (1/2) and advances turn');
const game = new GameEngine('TEST', 'p1', false);
game.addPlayer('p1', 'Alice');
game.addPlayer('p2', 'Bob');
game.startGame('p1');

assert.strictEqual(game.getCurrentPlayer().id, 'p1', 'Alice should start');
assert.strictEqual(game.players[0].missedTurns, 0, 'Initial missed turns is 0');

// Trigger 1st timeout
game.handleTurnTimeout();

assert.strictEqual(game.players[0].missedTurns, 1, 'Alice should have 1 missed turn strike');
assert.strictEqual(game.players[0].isBankrupt, false, 'Alice should NOT be bankrupt yet');
assert.strictEqual(game.getCurrentPlayer().id, 'p2', 'Turn should advance to Bob');
assert.strictEqual(game.status, 'ROLLING', 'Game status should be ROLLING');
console.log('✅ 1st timeout strike & turn skip passed');

function completeTurn(g, playerId) {
  let loops = 0;
  while (g.getCurrentPlayer() && g.getCurrentPlayer().id === playerId && g.status !== 'GAME_OVER' && loops < 10) {
    loops++;
    if (g.status === 'ROLLING') {
      g.rollDice(playerId);
    }
    if (g.status === 'AWAITING_ACTION') {
      try {
        g.buyProperty(playerId);
      } catch (e) {
        g.passProperty(playerId);
      }
    }
    if (g.status === 'AUCTION') {
      g.passBid('p1');
      g.passBid('p2');
    }
    if (g.status === 'TURN_END') {
      g.endTurn(playerId);
    }
  }
}

// Test 2: Active move resets strike counter to 0
console.log('Test 2: Active action resets strike back to 0');
completeTurn(game, 'p2');

assert.strictEqual(game.getCurrentPlayer().id, 'p1', 'Turn is back to Alice');
assert.strictEqual(game.players[0].missedTurns, 1, 'Alice still had 1 strike');

// Alice actively rolls dice
game.rollDice('p1');
assert.strictEqual(game.players[0].missedTurns, 0, 'Alice strike should be reset to 0 upon active roll');
console.log('✅ Active action strike reset passed');

// Test 3: 2 consecutive missed turns result in AFK defeat
console.log('Test 3: 2 missed turns result in automatic defeat and victory for remaining player');
const game2 = new GameEngine('TEST2', 'p1', false);
game2.addPlayer('p1', 'Alice');
game2.addPlayer('p2', 'Bob');
game2.startGame('p1');

// 1st timeout for Alice
game2.handleTurnTimeout();
assert.strictEqual(game2.players[0].missedTurns, 1);
assert.strictEqual(game2.getCurrentPlayer().id, 'p2');

// Bob takes his turn and passes back to Alice
completeTurn(game2, 'p2');

assert.strictEqual(game2.getCurrentPlayer().id, 'p1');

// 2nd timeout for Alice
game2.handleTurnTimeout();
assert.strictEqual(game2.players[0].missedTurns, 2);
assert.strictEqual(game2.players[0].isBankrupt, true, 'Alice should be bankrupt / disqualified');
assert.strictEqual(game2.players[0].disqualifiedReason, 'AFK_TIMEOUT');
assert.strictEqual(game2.status, 'GAME_OVER', 'Game should be GAME_OVER since only 1 player remains');
assert.strictEqual(game2.winner.id, 'p2', 'Bob should be crowned winner');
console.log('✅ 2-strike AFK defeat and auto-victory passed');

game.clearTurnTimer();
game.stopActivePlayTracker();
game.stopDisconnectWaitingTimer();
game2.clearTurnTimer();
game2.stopActivePlayTracker();
game2.stopDisconnectWaitingTimer();

console.log('\n🎉 ALL TURN TIMEOUT & 2-STRIKE AFK TESTS PASSED!\n');
