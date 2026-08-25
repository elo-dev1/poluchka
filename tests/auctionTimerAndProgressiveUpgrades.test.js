const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const roomManager = require('../server/game/RoomManager');
const MonopolyManager = require('../server/game/modules/MonopolyManager');

console.log('🧪 Testing Auction 10s Timer & Progressive Upgrade Pricing...\n');

// 1. Test Progressive Upgrade Pricing
console.log('Test 1: Progressive Upgrade Pricing (+25% per house level)');
const game1 = roomManager.createRoom('p1', 'Alice');
game1.addPlayer('p2', 'Bob');
game1.startGame('p1');

const p1 = game1.players[0];
const tile1 = game1.board[1]; // Base housePrice: 50
const tile3 = game1.board[3]; // Base housePrice: 50
tile1.ownerId = 'p1';
tile3.ownerId = 'p1';
p1.properties = [1, 3];
p1.money = 2000;

// Cost calculation check
assert.strictEqual(MonopolyManager.getUpgradeCost(tile1, 0), 50);  // House 1: $50
assert.strictEqual(MonopolyManager.getUpgradeCost(tile1, 1), 63);  // House 2: 50 * 1.25 = $62.5 -> $63
assert.strictEqual(MonopolyManager.getUpgradeCost(tile1, 2), 75);  // House 3: 50 * 1.50 = $75
assert.strictEqual(MonopolyManager.getUpgradeCost(tile1, 3), 88);  // House 4: 50 * 1.75 = $87.5 -> $88
assert.strictEqual(MonopolyManager.getUpgradeCost(tile1, 4), 100); // Hotel (5): 50 * 2.00 = $100
console.log('✅ Progressive upgrade costs calculated accurately');

// Build House 1 on Tile 1 (cost: $50)
const mBefore1 = p1.money;
game1.buildHouse('p1', 1);
assert.strictEqual(tile1.houses, 1);
assert.strictEqual(p1.money, mBefore1 - 50);

// Build House 1 on Tile 3 (cost: $50)
game1.builtTilesThisTurn = [];
game1.buildHouse('p1', 3);
assert.strictEqual(tile3.houses, 1);

// Build House 2 on Tile 1 (cost: $63)
game1.builtTilesThisTurn = [];
const mBefore2 = p1.money;
game1.buildHouse('p1', 1);
assert.strictEqual(tile1.houses, 2);
assert.strictEqual(p1.money, mBefore2 - 63);
console.log('✅ House 2 upgrade successfully charged progressive price of $63');

// Sell House from Tile 1 (refund: 50% of $63 = $31)
const mBeforeSell = p1.money;
game1.sellHouse('p1', 1);
assert.strictEqual(tile1.houses, 1);
assert.strictEqual(p1.money, mBeforeSell + 31);
console.log('✅ Selling upgraded house refunded half of the progressive tier cost ($31)');

// 2. Test Auction 10s Timer & Pause of General Turn Timer
console.log('\nTest 2: Auction 10-second timer and turn timer pause');
const game2 = roomManager.createRoom('p1', 'Alice');
game2.addPlayer('p2', 'Bob');
game2.addPlayer('p3', 'Charlie');
game2.startGame('p1');

// Current turn player Alice passes on property #1
game2.status = 'AWAITING_ACTION';
game2.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: 60 };

game2.passProperty('p1');
assert.strictEqual(game2.status, 'AUCTION');
assert.ok(game2.activeAuction, 'Auction must be active');
assert.strictEqual(game2.activeAuction.timerSeconds, 10);
assert.strictEqual(game2.activeAuction.remainingSeconds, 10);
assert.strictEqual(game2.turnTimer, null, 'General turn timer must be paused during auction');
console.log('✅ Auction initialized with 10s timer and paused general turn timer');

// Bob bids on auction
game2.placeBid('p2', 20);
assert.strictEqual(game2.activeAuction.currentBid, 20);
assert.strictEqual(game2.activeAuction.highestBidderId, 'p2');
assert.strictEqual(game2.activeAuction.remainingSeconds, 10, 'Bid must reset 10s timer');
console.log('✅ Placing bid successfully resets 10s auction countdown');

// Charlie bids higher
game2.placeBid('p3', 30);
assert.strictEqual(game2.activeAuction.currentBid, 30);
assert.strictEqual(game2.activeAuction.highestBidderId, 'p3');

// Bob passes
game2.passBid('p2');
// Charlie is last remaining active bidder with highest bid -> Auction auto-finishes!
assert.strictEqual(game2.status, 'TURN_END');
assert.strictEqual(game2.board[1].ownerId, 'p3', 'Charlie won tile #1');
assert.strictEqual(game2.activeAuction, null);
assert.ok(game2.turnTimer, 'General turn timer resumed after auction finish');
console.log('✅ Auction completes and awards property to highest bidder, resuming turn timer');

// Clean up
game1.clearTurnTimer();
game2.clearTurnTimer();
game2.stopAuctionTimer();

console.log('\n🎉 ALL AUCTION 10S TIMER & PROGRESSIVE UPGRADE TESTS PASSED! 🎉\n');
