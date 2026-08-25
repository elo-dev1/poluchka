const assert = require('assert');
const roomManager = require('../server/game/RoomManager');

console.log('🧪 Starting Disconnect Waiting & Anti-Abuse Reconnect Tests...\n');

async function runTests() {
  // Test 1: Disconnect when < 2 players connected starts countdown
  console.log('Test 1: Disconnect with 1 remaining player triggers countdown');
  const game = roomManager.createRoom('p1', 'Alice');
  const p2 = game.addPlayer('p2', 'Bob');
  game.startGame('p1');

  assert.strictEqual(game.status, 'ROLLING');
  assert.strictEqual(p2.disconnectBudgetSeconds, 60);

  // Bob disconnects
  game.removePlayer('p2');
  assert.strictEqual(p2.isConnected, false);
  assert.notStrictEqual(game.disconnectWaitingState, null);
  assert.strictEqual(game.disconnectWaitingState.disconnectedPlayerId, 'p2');
  assert.strictEqual(game.disconnectWaitingState.remainingSeconds, 60);
  console.log('✅ Countdown triggered with 60s budget');

  // Test 2: Reconnecting stops countdown and preserves remaining budget
  console.log('Test 2: Reconnection preserves remaining budget');
  // Simulate 10 seconds passed
  p2.disconnectBudgetSeconds = 50;
  game.disconnectWaitingState.remainingSeconds = 50;

  game.reconnectPlayer('p2');
  assert.strictEqual(p2.isConnected, true);
  assert.strictEqual(game.disconnectWaitingState, null);
  assert.strictEqual(p2.disconnectBudgetSeconds, 50);
  console.log('✅ Reconnection successfully stopped timer and preserved 50s budget');

  // Test 3: Anti-abuse — re-disconnect does NOT reset to 60s
  console.log('Test 3: Anti-abuse re-disconnect starts from 50s (not 60s)');
  game.removePlayer('p2');
  assert.strictEqual(game.disconnectWaitingState.remainingSeconds, 50);
  console.log('✅ Anti-abuse verified: second disconnect started from 50s');

  // Test 4: Time budget exhaustion triggers GAME_OVER in favor of remaining player
  console.log('Test 4: Budget timeout awards victory to remaining player');
  p2.disconnectBudgetSeconds = 1;
  // Trigger end game
  game.endGameOnDisconnectTimeout(p2);
  assert.strictEqual(game.status, 'GAME_OVER');
  assert.strictEqual(game.winner.id, 'p1');
  assert.strictEqual(game.winner.name, 'Alice');
  console.log('✅ Victory automatically awarded to Alice on timeout');

  // Test 5: Active play replenishment (every 5 min -> +60s)
  console.log('Test 5: Active play replenishment (+60s per 5 min active play)');
  const game2 = roomManager.createRoom('p_a', 'Anna');
  const pb = game2.addPlayer('p_b', 'Boris');
  game2.startGame('p_a');

  pb.disconnectBudgetSeconds = 20;
  pb.activePlaySeconds = 299;

  // Next second of active play hits 300s (5 min) via engine
  game2.tickActivePlay();

  assert.strictEqual(pb.disconnectBudgetSeconds, 60);
  assert.strictEqual(pb.activePlaySeconds, 0);
  console.log('✅ Active play time successfully replenished budget to 60s');

  game.clearTurnTimer();
  game.stopActivePlayTracker();
  game.stopDisconnectWaitingTimer();
  game2.clearTurnTimer();
  game2.stopActivePlayTracker();
  game2.stopDisconnectWaitingTimer();

  console.log('\n🎉 ALL DISCONNECT & ANTI-ABUSE TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
