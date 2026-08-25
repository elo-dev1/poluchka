const assert = require('assert');
const BotEngine = require('../server/game/botEngine');
const GameEngine = require('../server/game/GameEngine');
const MonopolyManager = require('../server/game/modules/MonopolyManager');

console.log('🧪 Starting BotEngine Heuristic Unit Tests (Stage 5)...');

// Helper to create basic test room with a bot
function createTestGame() {
  const game = new GameEngine('TEST_ROOM', 'host_1', 'Host', false, { mode: 'standard', boardSize: 40 });
  game.addPlayer('host_1', 'Host');
  const bot = game.addBot({ difficulty: 'balanced' });
  return { game, bot };
}

// -------------------------------------------------------------
// Test 1: Bot Property Purchase Heuristics
// -------------------------------------------------------------
console.log('\nTest 1: Bot Property Purchase Decision');
{
  const { game, bot } = createTestGame();
  game.startGame('host_1');
  
  // Land on tile 1 (GitHub, price 60)
  game.status = 'AWAITING_ACTION';
  game.pendingAction = { type: 'BUY_PROPERTY', tileId: 1, price: 60 };
  game.currentTurnIndex = game.players.findIndex(p => p.id === bot.id);
  const botPlayer = game.players[game.currentTurnIndex];

  // Case A: Balanced bot with plenty of cash ($1500) -> Buys
  botPlayer.botDifficulty = 'balanced';
  botPlayer.money = 1500;
  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'BUY_PROPERTY');
  assert.strictEqual(decision.tileId, 1);
  console.log('✅ Balanced bot with sufficient funds buys property');

  // Case B: Careful bot with low funds ($70 left after buy < $250 reserve) -> Passes
  botPlayer.botDifficulty = 'careful';
  botPlayer.money = 130; // 130 - 60 = 70 (< 250 reserve required)
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'PASS_PROPERTY');
  console.log('✅ Careful bot with low reserve passes property');

  // Case C: Careful bot completes monopoly -> buys even with lower reserve
  game.board[3].ownerId = bot.id; // Owns VS Code in same Brown group
  botPlayer.money = 200; // 200 - 60 = 140 (completes monopoly reserve threshold = 100)
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'BUY_PROPERTY');
  console.log('✅ Careful bot prioritizes completing monopoly');

  // Case D: Aggressive bot buys whenever price <= money
  botPlayer.botDifficulty = 'aggressive';
  botPlayer.money = 60;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'BUY_PROPERTY');
  console.log('✅ Aggressive bot buys with zero reserve');
}

// -------------------------------------------------------------
// Test 2: Bot Building & Improvements Decision
// -------------------------------------------------------------
console.log('\nTest 2: Bot Building Improvements');
{
  const { game, bot } = createTestGame();
  game.startGame('host_1');
  game.status = 'TURN_END';
  game.currentTurnIndex = game.players.findIndex(p => p.id === bot.id);
  const botPlayer = game.players[game.currentTurnIndex];

  // Give bot full brown monopoly (tiles 1 and 3)
  game.board[1].ownerId = bot.id;
  game.board[3].ownerId = bot.id;
  game.board[1].houses = 0;
  game.board[3].houses = 0;
  botPlayer.money = 1000;
  botPlayer.botDifficulty = 'balanced';

  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'BUILD_HOUSE');
  assert.strictEqual(decision.tileId, 1); // builds on lowest houses tile
  console.log('✅ Bot decides to build house on unbuilt monopoly');

  // If mortgaged tile in group and rich -> bot unmortgages it
  game.board[3].isMortgaged = true;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'UNMORTGAGE');
  assert.strictEqual(decision.tileId, 3);
  console.log('✅ Bot unmortgages property when funds allow');

  // If low funds -> cannot build and cannot unmortgage -> ends turn
  botPlayer.money = 50;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'END_TURN');
  console.log('✅ Bot correctly refrains from building or unmortgaging when low on funds');
  game.board[3].isMortgaged = false;
}

// -------------------------------------------------------------
// Test 3: Bot Auction Bidding & Passing
// -------------------------------------------------------------
console.log('\nTest 3: Bot Auction Participation');
{
  const { game, bot } = createTestGame();
  game.startGame('host_1');
  game.status = 'AUCTION';
  game.activeAuction = {
    tileId: 6, // Spotify, price 100
    currentBid: 50,
    highestBidderId: 'host_1',
    activeBidders: [bot.id, 'host_1'],
    minIncrement: 10,
    isCompleted: false
  };

  const botPlayer = game.players.find(p => p.id === bot.id);
  botPlayer.money = 800;
  botPlayer.botDifficulty = 'balanced'; // max bid ~ 1.10 * 100 = 110

  // Current bid 50 -> next bid 60 <= 110 -> bot bids 60
  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'PLACE_BID');
  assert.strictEqual(decision.amount, 60);
  console.log('✅ Bot bids next increment in auction within budget');

  // If current bid is 120 > max bid (110) -> bot passes
  game.activeAuction.currentBid = 120;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'PASS_AUCTION');
  console.log('✅ Bot passes auction when bid exceeds valuation');
}

// -------------------------------------------------------------
// Test 4: Bot Trade Evaluation & Acceptance
// -------------------------------------------------------------
console.log('\nTest 4: Bot Trade Evaluation');
{
  const { game, bot } = createTestGame();
  game.startGame('host_1');
  const botPlayer = game.players.find(p => p.id === bot.id);
  botPlayer.money = 500;
  botPlayer.botDifficulty = 'balanced';

  // Opponent proposes to give tile 1 (GitHub, $60) + $100 for tile 39 (Nike, $350)
  game.activeTrade = {
    initiatorId: 'host_1',
    targetId: bot.id,
    offerMoney: 100,
    offerProperties: [1],
    requestMoney: 0,
    requestProperties: [39]
  };

  // Unequal trade in opponent's favor -> bot rejects
  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'REJECT_TRADE');
  console.log('✅ Bot rejects disadvantageous trade offer');

  // Beneficial trade: Opponent gives $300 + tile 1 to complete bot's monopoly for spare tile
  game.board[3].ownerId = bot.id; // bot owns VS Code
  game.activeTrade = {
    initiatorId: 'host_1',
    targetId: bot.id,
    offerMoney: 150,
    offerProperties: [1], // GitHub completes Brown monopoly! (multiplier 2.3x)
    requestMoney: 50,
    requestProperties: []
  };

  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'ACCEPT_TRADE');
  console.log('✅ Bot accepts highly favorable trade completing its monopoly');
}

// -------------------------------------------------------------
// Test 5: Bot Jail Decisions
// -------------------------------------------------------------
console.log('\nTest 5: Bot Jail Mechanics');
{
  const { game, bot } = createTestGame();
  game.startGame('host_1');
  game.status = 'ROLLING';
  game.currentTurnIndex = game.players.findIndex(p => p.id === bot.id);
  const botPlayer = game.players[game.currentTurnIndex];
  botPlayer.inJail = true;
  botPlayer.jailTurns = 0;
  botPlayer.money = 200;
  botPlayer.jailFreeCards = 0;

  // Case A: Early jail turns -> rolls dice
  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'ROLL_JAIL_DICE');
  console.log('✅ Bot rolls for doubles on early jail turn');

  // Case B: Has jail card -> uses jail card
  botPlayer.jailFreeCards = 1;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'USE_JAIL_CARD');
  console.log('✅ Bot uses Jail Free card if possessed');
  botPlayer.jailFreeCards = 0;

  // Case C: 3rd turn reached -> must pay bail
  botPlayer.jailTurns = 3;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'PAY_BAIL');
  console.log('✅ Bot pays bail on 3rd jail turn');
}

// -------------------------------------------------------------
// Test 6: Bot Debt Emergency Resolution
// -------------------------------------------------------------
console.log('\nTest 6: Bot Debt Resolution (Sell -> Mortgage -> Bankrupt)');
{
  const { game, bot } = createTestGame();
  game.startGame('host_1');
  game.status = 'TURN_END';
  game.currentTurnIndex = game.players.findIndex(p => p.id === bot.id);
  const botPlayer = game.players[game.currentTurnIndex];

  // Set debt -$200
  botPlayer.money = -200;
  game.board[1].ownerId = bot.id;
  game.board[3].ownerId = bot.id;
  game.board[1].houses = 1;
  game.board[3].houses = 1;

  // Step 1: Has houses -> sells house
  let decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'SELL_HOUSE');
  console.log('✅ Bot sells house to resolve debt');

  // Step 2: 0 houses, has unmortgaged property -> mortgages property
  game.board[1].houses = 0;
  game.board[3].houses = 0;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'MORTGAGE');
  console.log('✅ Bot mortgages property to resolve debt');

  // Step 3: No assets left -> declares bankruptcy
  game.board[1].isMortgaged = true;
  game.board[3].isMortgaged = true;
  decision = BotEngine.getDecision(game, bot.id);
  assert.strictEqual(decision.type, 'DECLARE_BANKRUPTCY');
  console.log('✅ Bot declares bankruptcy when out of options');
}

console.log('\n🎉 ALL BOT ENGINE HEURISTIC TESTS PASSED!\n');
process.exit(0);
