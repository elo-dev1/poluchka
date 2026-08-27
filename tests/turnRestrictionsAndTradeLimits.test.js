const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');

console.log('🧪 Testing Turn Restrictions, Trade Limits & Bot Bankruptcy Auto-Advance...\n');

// 1. Test Trade Proposal Limit (Max 2 trades per round)
console.log('Test 1: Trade proposal limit of 2 per round per player');
const game1 = roomManager.createRoom('p1', 'Alice');
game1.addPlayer('p2', 'Bob');
game1.addPlayer('p3', 'Charlie');
game1.startGame('p1');

// Setup properties for trading
game1.board[1].ownerId = 'p1';
game1.players[0].properties.push(1);
game1.board[3].ownerId = 'p2';
game1.players[1].properties.push(3);

// Trade 1 by Alice
const trade1 = game1.proposeTrade('p1', 'p2', { properties: [1] }, { properties: [3] });
assert.strictEqual(trade1.status, 'PENDING');
assert.strictEqual(game1.tradeOffersThisRound['p1'], 1);
game1.rejectTrade('p2', trade1.id);

// Trade 2 by Alice
const trade2 = game1.proposeTrade('p1', 'p2', { properties: [1] }, { properties: [3] });
assert.strictEqual(trade2.status, 'PENDING');
assert.strictEqual(game1.tradeOffersThisRound['p1'], 2);
game1.rejectTrade('p2', trade2.id);

// Trade 3 by Alice in the same round must be rejected!
assert.throws(() => {
  game1.proposeTrade('p1', 'p2', { properties: [1] }, { properties: [3] });
}, /Лимит исчерпан: нельзя предлагать больше 2 обменов за один раунд/);
console.log('✅ Max 2 trade proposals per round successfully enforced');

// Bob should still have 2 trades available in this round
const bobTrade = game1.proposeTrade('p2', 'p1', { properties: [3] }, { properties: [1] });
assert.strictEqual(bobTrade.status, 'PENDING');
assert.strictEqual(game1.tradeOffersThisRound['p2'], 1);
game1.rejectTrade('p1', bobTrade.id);
console.log('✅ Trade limit is tracked per individual player');

// Advance a full round (p1 -> p2 -> p3 -> p1)
assert.strictEqual(game1.roundNumber, 1);
game1.status = 'TURN_END';
game1.endTurn('p1'); // Turn to p2
game1.status = 'TURN_END';
game1.endTurn('p2'); // Turn to p3
game1.status = 'TURN_END';
game1.endTurn('p3'); // Turn back to p1 (New Round!)

assert.strictEqual(game1.roundNumber, 2);
assert.strictEqual(game1.tradeOffersThisRound['p1'], undefined);

// Alice can now propose trades again in Round 2
const tradeRound2 = game1.proposeTrade('p1', 'p2', { properties: [1] }, { properties: [3] });
assert.strictEqual(tradeRound2.status, 'PENDING');
assert.strictEqual(game1.tradeOffersThisRound['p1'], 1);
console.log('✅ Trade limit successfully resets on each new round');

// 2. Test Building Restriction Out of Turn
console.log('\nTest 2: Cannot build/upgrade properties out of turn');
const game2 = roomManager.createRoom('p1', 'Alice');
game2.addPlayer('p2', 'Bob');
game2.startGame('p1');

// Setup monopoly for Bob (p2)
game2.board[1].ownerId = 'p2';
game2.board[3].ownerId = 'p2';
game2.players[1].properties = [1, 3];

// Currently it is Alice's turn (p1)
assert.strictEqual(game2.getCurrentPlayer().id, 'p1');

// Bob (p2) tries to build out of turn -> MUST THROW!
assert.throws(() => {
  game2.buildHouse('p2', 1);
}, /Строить и улучшать недвижимость можно только во время своего хода/);
console.log('✅ Out-of-turn building strictly rejected');

// Alice ends turn, Bob's turn begins
game2.status = 'TURN_END';
game2.endTurn('p1');
assert.strictEqual(game2.getCurrentPlayer().id, 'p2');

// Now Bob can build during his own turn!
game2.buildHouse('p2', 1);
assert.strictEqual(game2.board[1].houses, 1);
console.log('✅ Current turn player can build property improvements');

// 3. Test Bot Bankruptcy Turn Auto-Advance
console.log('\nTest 3: Bot bankruptcy immediately advances turn to next active player');
const game3 = roomManager.createRoom('p1', 'Alice');
const botPlayer = game3.addBot({ difficulty: 'balanced' });
game3.addPlayer('p3', 'Charlie');
game3.startGame('p1');

// Alice ends turn -> pass turn to Bot
game3.status = 'TURN_END';
game3.endTurn('p1');
assert.strictEqual(game3.getCurrentPlayer().id, botPlayer.id);

// Simulate Bot in debt with no assets declaring bankruptcy
botPlayer.money = -500;
game3.declareBankruptcy(botPlayer.id);

assert.strictEqual(botPlayer.isBankrupt, true);
// Turn must have immediately advanced to Charlie (p3)
assert.strictEqual(game3.getCurrentPlayer().id, 'p3');
assert.strictEqual(game3.status, 'ROLLING');
console.log('✅ Bot bankruptcy immediately advances turn to next player without stalling');

console.log('\n🎉 ALL TURN RESTRICTION, TRADE LIMIT & BOT BANKRUPTCY TESTS PASSED! 🎉\n');
process.exit(0);
