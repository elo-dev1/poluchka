const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const AuctionManager = require('../server/game/modules/AuctionManager');

console.log('🧪 Testing Property Pass & Auction Logic (1 Opponent vs Multiple Opponents)...');

// Test 1: 1 Opponent Remaining -> Direct Purchase Offer at Initial Cost
console.log('\nTest 1: 1 Opponent Remaining -> Direct Purchase Offer at Initial Cost');
{
  const game = new GameEngine('ROOM_AUC_1', 'p1', 'Player 1', false);
  const p1 = game.addPlayer('p1', 'Player 1');
  const p2 = game.addPlayer('p2', 'Player 2');
  game.startGame('p1');

  // p1 lands on tile 1 (price $60)
  p1.position = 1;
  const tile1 = game.board[1];
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: tile1.price };

  // p1 refuses to buy
  game.passProperty('p1');

  assert.strictEqual(game.status, 'AUCTION');
  assert.ok(game.activeAuction, 'Active auction object must exist');
  assert.strictEqual(game.activeAuction.isDirectOffer, true, 'Must be direct offer for 1 opponent');
  assert.strictEqual(game.activeAuction.currentBid, tile1.price, `Current bid must match initial property cost ($${tile1.price})`);
  assert.strictEqual(game.activeAuction.targetPlayerId, 'p2', 'Target must be single remaining opponent (p2)');

  // p2 accepts direct purchase offer at initial cost
  const initialCash = p2.money;
  game.placeBid('p2', tile1.price);

  assert.strictEqual(game.activeAuction, null, 'Auction must complete after direct purchase');
  assert.strictEqual(game.board[1].ownerId, 'p2', 'Property 1 must now belong to p2');
  assert.strictEqual(p2.money, initialCash - tile1.price, 'p2 must pay initial cost');
  assert.strictEqual(game.status, 'TURN_END');
  console.log('✅ Direct purchase offer for 1 opponent at base cost works perfectly');
}

// Test 2: 1 Opponent Declines Direct Purchase Offer
console.log('\nTest 2: 1 Opponent Declines Direct Purchase Offer');
{
  const game = new GameEngine('ROOM_AUC_2', 'p1', 'Player 1', false);
  const p1 = game.addPlayer('p1', 'Player 1');
  const p2 = game.addPlayer('p2', 'Player 2');
  game.startGame('p1');

  p1.position = 1;
  const tile1 = game.board[1];
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: tile1.price };

  // p1 declines
  game.passProperty('p1');
  assert.strictEqual(game.activeAuction.isDirectOffer, true);

  // p2 declines direct offer
  game.passBid('p2');

  assert.strictEqual(game.activeAuction, null);
  assert.strictEqual(game.board[1].ownerId, null, 'Property remains unowned');
  assert.strictEqual(game.status, 'TURN_END');
  console.log('✅ Declining direct purchase ends auction with unowned property cleanly');
}

// Test 3: Multiple Opponents (3+ Players) -> Competitive Auction
console.log('\nTest 3: Multiple Opponents -> Competitive Auction');
{
  const game = new GameEngine('ROOM_AUC_3', 'p1', 'Player 1', false);
  const p1 = game.addPlayer('p1', 'Player 1');
  const p2 = game.addPlayer('p2', 'Player 2');
  const p3 = game.addPlayer('p3', 'Player 3');
  game.startGame('p1');

  p1.position = 1;
  const tile1 = game.board[1];
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: tile1.price };

  // p1 declines -> 2 opponents remain (p2, p3)
  game.passProperty('p1');

  assert.strictEqual(game.status, 'AUCTION');
  assert.ok(game.activeAuction);
  assert.strictEqual(game.activeAuction.isDirectOffer, false, 'Must be competitive auction');
  const startingBid = Math.max(10, Math.ceil(tile1.price * 0.10));
  assert.strictEqual(game.activeAuction.currentBid, startingBid, `Starting bid is 10% ($${startingBid})`);

  // p2 places initial bid of starting price
  game.placeBid('p2', startingBid);
  assert.strictEqual(game.activeAuction.highestBidderId, 'p2');
  assert.strictEqual(game.activeAuction.currentBid, startingBid);

  // p3 raises to $30
  game.placeBid('p3', 30);
  assert.strictEqual(game.activeAuction.highestBidderId, 'p3');
  assert.strictEqual(game.activeAuction.currentBid, 30);

  // p2 passes
  const initialCashP3 = p3.money;
  game.passBid('p2');

  // Auction resolves to p3 at $30
  assert.strictEqual(game.activeAuction, null);
  assert.strictEqual(game.board[1].ownerId, 'p3', 'Winner p3 receives property');
  assert.strictEqual(p3.money, initialCashP3 - 30, 'p3 pays winning bid $30');
  assert.strictEqual(game.status, 'TURN_END');
  console.log('✅ Competitive auction between multiple opponents works properly');
}

console.log('\n🎉 ALL PROPERTY PASS & AUCTION TESTS PASSED!\n');
process.exit(0);
