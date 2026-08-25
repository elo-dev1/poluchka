const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');
const MonopolyManager = require('../server/game/modules/MonopolyManager');
const MortgageManager = require('../server/game/modules/MortgageManager');
const AuctionManager = require('../server/game/modules/AuctionManager');
const TradeManager = require('../server/game/modules/TradeManager');
const JailManager = require('../server/game/modules/JailManager');

console.log('🧪 Starting Advanced Monopoly (Stage 2) unit tests...\n');

// 1. Monopoly and 2x Rent
console.log('Test 1: Monopoly and 2x Rent calculation');
const game = roomManager.createRoom('p1', 'Alice');
const p2 = game.addPlayer('p2', 'Bob');
game.startGame('p1');

const p1 = game.players[0];
// Brown group tiles are #1 (Улица Ремесленников, price $60, base rent $10) and #3 (Набережная Мастеров, price $80, base rent $14)
const tile1 = game.board[1];
const tile3 = game.board[3];

tile1.ownerId = 'p1';
p1.properties.push(1);

// Single property: base rent
assert.strictEqual(MonopolyManager.hasMonopoly(game.board, 'p1', 'brown'), false);
assert.strictEqual(MonopolyManager.calculateRent(tile1, game.board, p1), 10);

// Buy full group -> Monopoly!
tile3.ownerId = 'p1';
p1.properties.push(3);
assert.strictEqual(MonopolyManager.hasMonopoly(game.board, 'p1', 'brown'), true);
// Unimproved monopoly gives 2x base rent
assert.strictEqual(MonopolyManager.calculateRent(tile1, game.board, p1), 20);
assert.strictEqual(MonopolyManager.calculateRent(tile3, game.board, p1), 28);
console.log('✅ Monopoly 2x rent passed');

// 2. Uniform Building and Hotels
console.log('Test 2: Uniform building rules and hotel upgrade');
// Build 1st house on tile 1 ($50)
const p1MoneyBefore = p1.money;
game.buildHouse('p1', 1);
assert.strictEqual(tile1.houses, 1);
assert.strictEqual(p1.money, p1MoneyBefore - 50);
assert.strictEqual(MonopolyManager.calculateRent(tile1, game.board, p1), 30); // 1 house rent = 30

// Cannot build 2nd house on tile 1 in same turn (turn limit + uniform building)
assert.throws(() => game.buildHouse('p1', 1), /больше одного улучшения|равномерной застройки/);

// Build house on tile 3 in the same turn
game.buildHouse('p1', 3);
assert.strictEqual(tile3.houses, 1);

// Reset turn to simulate next turn for building
game.builtTilesThisTurn = [];
game.buildHouse('p1', 1);
assert.strictEqual(tile1.houses, 2);
assert.strictEqual(MonopolyManager.calculateRent(tile1, game.board, p1), 90); // 2 houses rent = 90

// Build up to Hotel (5) on both across turns
game.builtTilesThisTurn = [];
game.buildHouse('p1', 3); // 2
game.builtTilesThisTurn = [];
game.buildHouse('p1', 1); // 3
game.builtTilesThisTurn = [];
game.buildHouse('p1', 3); // 3
game.builtTilesThisTurn = [];
game.buildHouse('p1', 1); // 4
game.builtTilesThisTurn = [];
game.buildHouse('p1', 3); // 4
game.builtTilesThisTurn = [];
game.buildHouse('p1', 1); // 5 (Hotel)
assert.strictEqual(tile1.houses, 5);
assert.strictEqual(MonopolyManager.calculateRent(tile1, game.board, p1), 550); // Hotel rent = 550

// Test Blitz Mode building rules (1 improvement per street per turn)
const blitzGame = new GameEngine('blitz_room', 'p1', { mode: 'blitz' });
blitzGame.addPlayer('p1', 'Alice');
blitzGame.addPlayer('p2', 'Bob');
blitzGame.startGame('p1');
const bTile1 = blitzGame.board[1];
const bGroupTiles = MonopolyManager.getGroupTiles(blitzGame.board, bTile1.group);
bGroupTiles.forEach(t => { t.ownerId = 'p1'; if (!blitzGame.players[0].properties.includes(t.id)) blitzGame.players[0].properties.push(t.id); });
blitzGame.buildHouse('p1', bTile1.id);
assert.strictEqual(bTile1.houses, 1);
assert.throws(() => blitzGame.buildHouse('p1', bTile1.id), /больше одного улучшения на одной и той же улице за один ход/);
console.log('✅ Uniform building, turn limit per street passed');

// 3. Selling Houses
console.log('Test 3: Selling houses uniform rule');
// Cannot sell from tile 3 (houses = 4) because tile 1 has hotel (5)
assert.throws(() => game.sellHouse('p1', 3), /равномерной продажи/);
// Sell from tile 1 (5 -> 4) for 50% refund of hotel level cost ($100 / 2 = $50)
const moneyBeforeSell = p1.money;
game.sellHouse('p1', 1);
assert.strictEqual(tile1.houses, 4);
assert.strictEqual(p1.money, moneyBeforeSell + 50);
console.log('✅ Selling houses passed');

// 4. Mortgages
console.log('Test 4: Mortgage and Unmortgage rules');
// Cannot mortgage while houses exist in group
assert.throws(() => game.mortgageProperty('p1', 1), /продать все постройки/);

// Sell all houses from group uniformly
while (tile1.houses > 0 || tile3.houses > 0) {
  if (tile1.houses >= tile3.houses && tile1.houses > 0) {
    game.sellHouse('p1', 1);
  } else if (tile3.houses > 0) {
    game.sellHouse('p1', 3);
  }
}

// Mortgage tile 1 (price 60 -> receives $30)
const moneyBeforeMortgage = p1.money;
game.mortgageProperty('p1', 1);
assert.strictEqual(tile1.isMortgaged, true);
assert.strictEqual(p1.money, moneyBeforeMortgage + 30);
// No rent on mortgaged tile
assert.strictEqual(MonopolyManager.calculateRent(tile1, game.board, p1), 0);

// Unmortgage tile 1 (costs $30 + 10% = $33)
const moneyBeforeUnmortgage = p1.money;
game.unmortgageProperty('p1', 1);
assert.strictEqual(tile1.isMortgaged, false);
assert.strictEqual(p1.money, moneyBeforeUnmortgage - 33);
console.log('✅ Mortgage and unmortgage passed');

// 5. Auctions
console.log('Test 5: Auction bidding and auto-resolution');
const tile5 = game.board.find(t => t.type === 'property' && t.price === 100) || game.board[1];
const auction = AuctionManager.initAuction(tile5, [p1, p2]);
assert.strictEqual(auction.currentBid, Math.max(10, Math.ceil((tile5.price || 100) * 0.10)));

// p1 bids $40
AuctionManager.placeBid(auction, p1, 40);
assert.strictEqual(auction.currentBid, 40);
assert.strictEqual(auction.highestBidderId, 'p1');

// p2 passes -> auction ends, p1 wins
AuctionManager.passBid(auction, 'p2');
assert.strictEqual(auction.isCompleted, true);

const auctionRes = AuctionManager.resolveAuction(auction, game.board, [p1, p2]);
assert.strictEqual(auctionRes.winner.id, 'p1');
assert.strictEqual(tile5.ownerId, 'p1');
assert.strictEqual(auctionRes.winningBid, 40);
console.log('✅ Auction bidding and resolution passed');

// 6. True Jail Mechanics
console.log('Test 6: Jail mechanics (Bail, Doubles, Jail Card, Max turns)');
const jailTile = game.board.find(t => t.type === 'jail');
JailManager.sendToJail(p2, game.board);
assert.strictEqual(p2.inJail, true);
assert.strictEqual(p2.position, jailTile.id);

// Way 1: Use Jail Free card
p2.jailFreeCards = 1;
JailManager.useJailCard(p2);
assert.strictEqual(p2.inJail, false);
assert.strictEqual(p2.jailFreeCards, 0);

// Way 2: Pay Bail $50
JailManager.sendToJail(p2, game.board);
const p2MoneyBeforeBail = p2.money;
JailManager.payBail(p2);
assert.strictEqual(p2.inJail, false);
assert.strictEqual(p2.money, p2MoneyBeforeBail - 50);

// Way 3: Roll Doubles
JailManager.sendToJail(p2);
const rollDoubleRes = JailManager.handleJailRoll(p2, 4, 4);
assert.strictEqual(rollDoubleRes.released, true);
assert.strictEqual(rollDoubleRes.reason, 'double');
assert.strictEqual(p2.inJail, false);

// Way 4: Max 3 turns forced bail
JailManager.sendToJail(p2);
const r1 = JailManager.handleJailRoll(p2, 1, 2);
assert.strictEqual(r1.released, false);
assert.strictEqual(p2.jailTurns, 1);

const r2 = JailManager.handleJailRoll(p2, 2, 3);
assert.strictEqual(r2.released, false);
assert.strictEqual(p2.jailTurns, 2);

const r3 = JailManager.handleJailRoll(p2, 3, 4);
assert.strictEqual(r3.released, true);
assert.strictEqual(r3.forcedBail, true);
assert.strictEqual(r3.bailAmount, 50);
console.log('✅ True Jail mechanics passed');

// 7. Atomic Player-to-Player Trade
console.log('Test 7: Atomic Player Trading');
// Alice offers tile 1 + $50, requests tile5 from Bob
tile5.ownerId = 'p2';
p2.properties.push(tile5.id);
p1.properties = p1.properties.filter(id => id !== tile5.id);

const tradeProposal = TradeManager.createTradeProposal(
  p1,
  p2,
  { money: 50, properties: [1], jailFreeCards: 0 },
  { money: 0, properties: [tile5.id], jailFreeCards: 0 },
  game.board
);
assert.strictEqual(tradeProposal.status, 'PENDING');

const p1MoneyBeforeTrade = p1.money;
const p2MoneyBeforeTrade = p2.money;

TradeManager.executeTrade(tradeProposal, game.players, game.board);
assert.strictEqual(tile1.ownerId, 'p2');
assert.strictEqual(tile5.ownerId, 'p1');
assert.strictEqual(p1.money, p1MoneyBeforeTrade - 50);
assert.strictEqual(p2.money, p2MoneyBeforeTrade + 50);
assert.strictEqual(p1.properties.includes(tile5.id), true);
assert.strictEqual(p2.properties.includes(1), true);

// 8. Transport and Utility Rent Scaling
console.log('Test 8: Transport & Utility Rent Scaling by ownership count');
const transportTiles = game.board.filter(t => t.group === 'transport');
if (transportTiles.length >= 4) {
  const [t1, t2, t3, t4] = transportTiles;
  t1.ownerId = 'p1';
  assert.strictEqual(MonopolyManager.calculateRent(t1, game.board, p1), 25);

  t2.ownerId = 'p1';
  assert.strictEqual(MonopolyManager.calculateRent(t1, game.board, p1), 50);
  assert.strictEqual(MonopolyManager.calculateRent(t2, game.board, p1), 50);

  t3.ownerId = 'p1';
  assert.strictEqual(MonopolyManager.calculateRent(t1, game.board, p1), 100);

  t4.ownerId = 'p1';
  assert.strictEqual(MonopolyManager.calculateRent(t1, game.board, p1), 200);
  assert.strictEqual(MonopolyManager.calculateRent(t4, game.board, p1), 200);
}

const utilityTiles = game.board.filter(t => t.group === 'utility');
if (utilityTiles.length >= 2) {
  const [u1, u2] = utilityTiles;
  u1.ownerId = 'p2';
  assert.strictEqual(MonopolyManager.calculateRent(u1, game.board, p2), 20);

  u2.ownerId = 'p2';
  assert.strictEqual(MonopolyManager.calculateRent(u1, game.board, p2), 60);
  assert.strictEqual(MonopolyManager.calculateRent(u2, game.board, p2), 60);
}
console.log('✅ Transport & Utility rent scaling passed');

console.log('\n🎉 ALL ADVANCED STAGE 2 TESTS PASSED!\n');
game.stopActivePlayTracker();
game.clearTurnTimer();
game.stopDisconnectWaitingTimer();
process.exit(0);
