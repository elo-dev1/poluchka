const assert = require('assert');
const GameEngine = require('../server/game/GameEngine');
const botManager = require('../server/game/BotManager');
const BotEngine = require('../server/game/botEngine');

console.log('🧪 Testing Bot Response to Direct Purchase Offer & Auction...');

// Test 1: Bot accepts direct offer at nominal price
console.log('\nTest 1: Bot accepts direct offer at nominal price');
{
  const game = new GameEngine('ROOM_BOT_AUC_1', 'human1', 'Human Player', false);
  const human = game.addPlayer('human1', 'Human Player');
  const bot = game.addPlayer('bot1', 'Робот Боб', true, { personality: 'balanced' });
  game.startGame('human1');

  // Human lands on tile 1 ($60) and refuses
  human.position = 1;
  const tile1 = game.board[1];
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: tile1.price };

  game.passProperty('human1');

  assert.strictEqual(game.status, 'AUCTION');
  assert.ok(game.activeAuction);
  assert.strictEqual(game.activeAuction.isDirectOffer, true);

  // Bot makes decision
  const decision = BotEngine.decideAuctionAction(game.getPublicState(), bot, 'balanced');
  assert.deepStrictEqual(decision, { type: 'PLACE_BID', amount: tile1.price });

  // BotManager executes action
  const botInitialCash = bot.money;
  botManager.executeBotAction(game, bot.id);

  assert.strictEqual(game.activeAuction, null, 'Auction must be completed');
  assert.strictEqual(game.board[1].ownerId, 'bot1', 'Bot must own tile 1');
  assert.strictEqual(bot.money, botInitialCash - tile1.price, 'Bot paid exact nominal price');
  assert.strictEqual(game.status, 'TURN_END', 'Status moved to TURN_END');
  console.log('✅ Bot successfully evaluates and executes direct purchase without hanging');
}

// Test 2: Bot with zero money passes direct offer
console.log('\nTest 2: Bot with low money passes direct offer');
{
  const game = new GameEngine('ROOM_BOT_AUC_2', 'human1', 'Human Player', false);
  const human = game.addPlayer('human1', 'Human Player');
  const bot = game.addPlayer('bot1', 'Робот Боб', true, { personality: 'careful' });
  game.startGame('human1');

  human.position = 1;
  const tile1 = game.board[1];
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: tile1.price };

  // Set bot money low
  bot.money = 10;

  game.passProperty('human1');
  assert.strictEqual(game.status, 'AUCTION');

  const decision = BotEngine.decideAuctionAction(game.getPublicState(), bot, 'careful');
  assert.deepStrictEqual(decision, { type: 'PASS_AUCTION' });

  botManager.executeBotAction(game, bot.id);

  assert.strictEqual(game.activeAuction, null, 'Auction must finish');
  assert.strictEqual(game.board[1].ownerId, null, 'Tile remains unowned');
  assert.strictEqual(game.status, 'TURN_END');
  console.log('✅ Bot successfully declines when funds are insufficient without hanging');
}

console.log('\n🎉 ALL BOT DIRECT OFFER & AUCTION TESTS PASSED!\n');
