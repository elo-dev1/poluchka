const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');
const MonopolyManager = require('../server/game/modules/MonopolyManager');

console.log('🧪 Starting extended GameEngine unit tests...\n');

// Test 1: Room creation and player joining
console.log('Test 1: Room creation and player joining');
const room = roomManager.createRoom('p1', 'Alice');
assert.strictEqual(room.players.length, 1);
assert.strictEqual(room.hostId, 'p1');
assert.strictEqual(room.status, 'LOBBY');

const p2 = room.addPlayer('p2', 'Bob');
assert.strictEqual(room.players.length, 2);
assert.strictEqual(p2.name, 'Bob');
assert.strictEqual(p2.money, 1500);
console.log('✅ Room creation & player join passed');

// Test 2: Game start
console.log('Test 2: Starting game');
assert.throws(() => room.startGame('p2'), /Только создатель комнаты/);
room.startGame('p1');
assert.strictEqual(room.status, 'ROLLING');
assert.strictEqual(room.getCurrentPlayer().id, 'p1');
console.log('✅ Start game passed');

// Test 3: Player movement & buy property
console.log('Test 3: Dice roll & property buying');
const p1 = room.getCurrentPlayer();
p1.position = 0;
p1.money = 1500;

// Land on tile 1 (Улица Ремесленников, price $60, base rent $10)
p1.position = 1;
const tile1 = room.board[1];
room.handleTileLanding(p1, tile1);
assert.strictEqual(room.status, 'AWAITING_ACTION');
assert.strictEqual(room.pendingAction.tileId, 1);

// Buy property
room.buyProperty('p1');
assert.strictEqual(tile1.ownerId, 'p1');
assert.strictEqual(p1.money, 1500 - 60);
assert.strictEqual(p1.properties.length, 1);
assert.strictEqual(room.status, 'TURN_END');
console.log('✅ Property buying passed');

// Test 4: Turn progression
console.log('Test 4: Turn progression');
room.endTurn('p1');
assert.strictEqual(room.getCurrentPlayer().id, 'p2');
assert.strictEqual(room.status, 'ROLLING');
console.log('✅ Turn transition passed');

// Test 5: Rent payment
console.log('Test 5: Rent payment');
p2.position = 1; // lands on tile 1 owned by p1
const rent = MonopolyManager.calculateRent(tile1, room.board, p1);
const p1MoneyBefore = p1.money;
const p2MoneyBefore = p2.money;
room.handleTileLanding(p2, tile1);
assert.strictEqual(p2.money, p2MoneyBefore - rent);
assert.strictEqual(p1.money, p1MoneyBefore + rent);
console.log('✅ Rent payment passed');

// Test 6: Go to Jail mechanics
console.log('Test 6: Go To Jail tile teleportation');
const goToJailTile = room.board.find(t => t.type === 'go_to_jail');
const jailTile = room.board.find(t => t.type === 'jail');
p2.position = goToJailTile.id;
room.handleTileLanding(p2, goToJailTile);
assert.strictEqual(p2.position, jailTile.id); // Teleported to Jail
assert.strictEqual(p2.inJail, true);
room.endTurn('p2');

// Now p1's turn
assert.strictEqual(room.getCurrentPlayer().id, 'p1');
room.status = 'TURN_END';
room.endTurn('p1'); // p1 ends turn

// Now p2's turn in jail, pay bail $50
assert.strictEqual(room.getCurrentPlayer().id, 'p2');
assert.strictEqual(p2.inJail, true);
room.payJailBail('p2');
assert.strictEqual(p2.inJail, false);
console.log('✅ Go to Jail & bail release passed');

// Test 7: Doubles mechanic
console.log('Test 7: Doubles allow extra roll');
room.rolledDoubleInCurrentTurn = true;
room.status = 'TURN_END';
room.endTurn('p2');
// Player should still be p2 and status ROLLING
assert.strictEqual(room.getCurrentPlayer().id, 'p2');
assert.strictEqual(room.status, 'ROLLING');
console.log('✅ Doubles extra roll passed');

// Test 8: Restart Game by host
console.log('Test 8: Restart game back to lobby');
room.restartGame('p1');
assert.strictEqual(room.status, 'LOBBY');
assert.strictEqual(room.players[0].money, 1500);
assert.strictEqual(room.board[1].ownerId, null);
console.log('✅ Restart game passed');

// Test 9: Out-of-turn surrender
console.log('Test 9: Surrendering out of turn');
room.startGame('p1');
assert.strictEqual(room.getCurrentPlayer().id, 'p1');
// p2 is NOT current player, but calls declareBankruptcy
room.declareBankruptcy('p2');
assert.strictEqual(room.players.find(p => p.id === 'p2').isBankrupt, true);
assert.strictEqual(room.status, 'GAME_OVER');
assert.strictEqual(room.winner.id, 'p1');
console.log('✅ Out-of-turn surrender and win condition passed');

console.log('\n🎉 ALL EXTENDED GAME ENGINE TESTS PASSED!\n');
room.clearTurnTimer();
room.stopActivePlayTracker();
room.stopDisconnectWaitingTimer();
process.exit(0);
