const assert = require('assert');
const ratingEngine = require('../server/game/RatingEngine');
const database = require('../server/db/Database');
const TradeManager = require('../server/game/modules/TradeManager');

console.log('🧪 Starting Rating Algorithm & Anti-Abuse Test Suite...\n');

// --- Test 1: Mathematical Correctness of Pairwise Elo ---
console.log('Test 1: Mathematical Correctness of Pairwise Elo (Zero-Sum)');
ratingEngine.clearHistory();

const testUsersMap = new Map([
  ['p1', { rating: 100, gamesPlayed: 20 }],
  ['p2', { rating: 100, gamesPlayed: 20 }],
  ['booster', { rating: 100, gamesPlayed: 20 }],
  ['leaver', { rating: 100, gamesPlayed: 20 }]
]);

const mockDuel = [
  { id: 'p1', name: 'Игрок 1', rank: 1, isWinner: true },
  { id: 'p2', name: 'Игрок 2', rank: 2, isWinner: false }
];

const contextQualified = {
  roundsPlayed: 5,
  turnsPlayed: 20,
  durationSeconds: 300,
  hasBots: false,
  endReason: 'NORMAL_WIN'
};

const duelResults = ratingEngine.calculateMatchRatings(mockDuel, contextQualified, testUsersMap);
const r1 = duelResults.find(r => r.id === 'p1');
const r2 = duelResults.find(r => r.id === 'p2');

assert.strictEqual(duelResults.length, 2);
assert.strictEqual(r1.ratingDelta, 24, `Winner of equal duel should gain +24 ELO (K=48/2), got ${r1.ratingDelta}`);
assert.strictEqual(r2.ratingDelta, -24, `Loser of equal duel should lose -24 ELO, got ${r2.ratingDelta}`);
assert.strictEqual(r1.ratingDelta + r2.ratingDelta, 0, 'Zero-sum property must hold exactly for equal players');
console.log('✅ Equal duel results in balanced zero-sum rating exchange (+24 / -24)');

// Test 1b: 4-Player Multi-User Elo distribution
const users4 = new Map([
  ['a', { rating: 100, gamesPlayed: 20 }],
  ['b', { rating: 100, gamesPlayed: 20 }],
  ['c', { rating: 100, gamesPlayed: 20 }],
  ['d', { rating: 100, gamesPlayed: 20 }]
]);

const mock4 = [
  { id: 'a', name: '1st', rank: 1, isWinner: true },
  { id: 'b', name: '2nd', rank: 2, isWinner: false },
  { id: 'c', name: '3rd', rank: 3, isWinner: false },
  { id: 'd', name: '4th', rank: 4, isWinner: false }
];

ratingEngine.clearHistory();
const res4 = ratingEngine.calculateMatchRatings(mock4, contextQualified, users4);
const deltaA = res4.find(r => r.id === 'a').ratingDelta;
const deltaB = res4.find(r => r.id === 'b').ratingDelta;
const deltaC = res4.find(r => r.id === 'c').ratingDelta;
const deltaD = res4.find(r => r.id === 'd').ratingDelta;

assert(deltaA > 0, '1st place must gain rating');
assert(deltaB >= 0, '2nd place among 4 equal players must be non-negative (beat 2, lost to 1)');
assert(deltaC <= 0, '3rd place among 4 equal players must lose rating');
assert(deltaD < deltaC, '4th place must lose more than 3rd place');
assert.strictEqual(deltaA + deltaB + deltaC + deltaD, 0, 'Zero-sum property across 4 players must hold');
console.log(`✅ 4-Player distribution: 1st=+${deltaA}, 2nd=+${deltaB}, 3rd=${deltaC}, 4th=${deltaD} (Sum = ${deltaA + deltaB + deltaC + deltaD})`);

// --- Test 2: Floor Protection (Cannot Drop Below 0) ---
console.log('\nTest 2: Non-negative Rating Floor');
const usersZero = new Map([
  ['novice1', { rating: 5, gamesPlayed: 20 }],
  ['novice2', { rating: 100, gamesPlayed: 20 }]
]);

const mockZeroDrop = [
  { id: 'novice2', name: 'Winner', rank: 1, isWinner: true },
  { id: 'novice1', name: 'Loser', rank: 2, isWinner: false }
];

ratingEngine.clearHistory();
const resZero = ratingEngine.calculateMatchRatings(mockZeroDrop, contextQualified, usersZero);
const loser = resZero.find(r => r.id === 'novice1');
assert.strictEqual(loser.newRating, 0, 'Loser rating must not drop below 0');
assert.strictEqual(loser.ratingDelta, -5, 'Rating delta cannot exceed existing rating');
console.log('✅ Rating floor at 0 strictly enforced');

// --- Test 3: Anti-Fast-Surrender Gate (Win-Trading Protection) ---
console.log('\nTest 3: Anti-Fast-Surrender Gate');
ratingEngine.clearHistory();

const fastSurrenderContext = {
  roundsPlayed: 1,
  turnsPlayed: 2,
  durationSeconds: 15,
  hasBots: false,
  endReason: 'SURRENDER'
};

const mockFastSurrender = [
  { id: 'booster', name: 'Booster', rank: 1, isWinner: true, isBankrupt: false },
  { id: 'leaver', name: 'Leaver', rank: 2, isWinner: false, isBankrupt: true }
];

const resFast = ratingEngine.calculateMatchRatings(mockFastSurrender, fastSurrenderContext, testUsersMap);
const booster = resFast.find(r => r.id === 'booster');
const leaver = resFast.find(r => r.id === 'leaver');

assert.strictEqual(booster.ratingDelta, 0, 'Winner in fast surrender MUST get 0 ELO (boost blocked)');
assert(booster.note.includes('защиты от накрутки'), 'Winner note must inform about anti-abuse block');
assert.strictEqual(leaver.ratingDelta, -15, 'Leaver must receive -15 penalty');
assert(leaver.note.includes('Штраф'), 'Leaver note must indicate penalty');
console.log('✅ Fast surrender win-trading blocked: Winner gets 0 ELO, Leaver gets -15 ELO');

// --- Test 4: Pairing Fatigue / Diminishing Returns ---
console.log('\nTest 4: Pairing Fatigue / Diminishing Returns');
ratingEngine.clearHistory();

const usersPair = new Map([
  ['playerX', { rating: 200, gamesPlayed: 20 }],
  ['playerY', { rating: 200, gamesPlayed: 20 }]
]);

const matchPair = [
  { id: 'playerX', name: 'X', rank: 1, isWinner: true },
  { id: 'playerY', name: 'Y', rank: 2, isWinner: false }
];

// Match 1: 100%
const m1 = ratingEngine.calculateMatchRatings(matchPair, contextQualified, usersPair);
const d1 = m1.find(r => r.id === 'playerX').ratingDelta;
assert.strictEqual(d1, 24, `Match 1 should be full delta (24), got ${d1}`);

// Match 2: 70%
const m2 = ratingEngine.calculateMatchRatings(matchPair, contextQualified, usersPair);
const d2 = m2.find(r => r.id === 'playerX').ratingDelta;
assert.strictEqual(d2, Math.round(24 * 0.7), `Match 2 should be ~70% (17), got ${d2}`);

// Match 3: 40%
const m3 = ratingEngine.calculateMatchRatings(matchPair, contextQualified, usersPair);
const d3 = m3.find(r => r.id === 'playerX').ratingDelta;
assert.strictEqual(d3, Math.round(24 * 0.4), `Match 3 should be ~40% (10), got ${d3}`);

// Match 4: 15%
const m4 = ratingEngine.calculateMatchRatings(matchPair, contextQualified, usersPair);
const d4 = m4.find(r => r.id === 'playerX').ratingDelta;
assert.strictEqual(d4, Math.round(24 * 0.15), `Match 4 should be ~15% (4), got ${d4}`);

// Match 5+: 0% (Farming limit reached)
const m5 = ratingEngine.calculateMatchRatings(matchPair, contextQualified, usersPair);
const d5 = m5.find(r => r.id === 'playerX').ratingDelta;
assert.strictEqual(d5, 0, `Match 5+ must yield 0 ELO (farming blocked), got ${d5}`);
assert(m5.find(r => r.id === 'playerX').note.includes('0%'), 'Note must indicate 0% coefficient');
console.log(`✅ Pairing fatigue decay verified: 1st=+${d1}, 2nd=+${d2}, 3rd=+${d3}, 4th=+${d4}, 5th=+${d5}`);

// --- Test 5: Host Abort Protection ---
console.log('\nTest 5: Host Abort Protection');
ratingEngine.clearHistory();

const hostAbortContext = {
  roundsPlayed: 6,
  turnsPlayed: 25,
  durationSeconds: 400,
  hasBots: false,
  endReason: 'HOST_ABORT'
};

const resHostAbort = ratingEngine.calculateMatchRatings(mockDuel, hostAbortContext, testUsersMap);
resHostAbort.forEach(r => {
  assert.strictEqual(r.ratingDelta, 0, 'No rating delta on HOST_ABORT');
  assert.strictEqual(r.status, 'UNRATED');
});
console.log('✅ Premature host abort correctly yields 0 ELO for all players');

// --- Test 6: Anti-Dumping Trade Guard ---
console.log('\nTest 6: Anti-Dumping Trade Guard');
const mockBoard = [
  { id: 0, name: 'Старт', type: 'special' },
  { id: 1, name: 'Улица 1', type: 'property', price: 200, housePrice: 50, houses: 0, ownerId: 'p1' }
];

const richPlayer = { id: 'p1', name: 'Олигарх', money: 1500, properties: [1], jailFreeCards: 0 };
const poorPlayer = { id: 'p2', name: 'Новичок', money: 200, properties: [], jailFreeCards: 0 };

// Collusion attempt: giving $1000 + $200 property ($1200 total) for $10
assert.throws(() => {
  TradeManager.createTradeProposal(
    richPlayer,
    poorPlayer,
    { money: 1000, properties: [1], jailFreeCards: 0 },
    { money: 10, properties: [], jailFreeCards: 0 },
    mockBoard
  );
}, /Несбалансированная сделка отклонена/, 'Extreme 1-sided trade must be blocked by anti-dumping guard');
console.log('✅ Collusive dumping trade successfully blocked');

// Fair trade: $100 for Street (worth $200) -> 50% ratio, allowed
const fairTrade = TradeManager.createTradeProposal(
  richPlayer,
  poorPlayer,
  { money: 0, properties: [1], jailFreeCards: 0 },
  { money: 100, properties: [], jailFreeCards: 0 },
  mockBoard
);
assert(fairTrade.id.startsWith('trade_'), 'Fair trade must be accepted');
console.log('✅ Fair trade passed successfully');

// --- Test 7: Database recordGameResults Integration ---
console.log('\nTest 7: Database recordGameResults Integration');
ratingEngine.clearHistory();

const dbUserA = database.findOrCreateTelegramUser({ id: `tg_rate_a_${Date.now()}`, first_name: 'Анна' });
const dbUserB = database.findOrCreateTelegramUser({ id: `tg_rate_b_${Date.now()}`, first_name: 'Борис' });

const dbRankings = [
  { id: 'pa', name: 'Анна', telegramId: dbUserA.telegramId, rank: 1, isWinner: true, totalCapital: 2500 },
  { id: 'pb', name: 'Борис', telegramId: dbUserB.telegramId, rank: 2, isWinner: false, totalCapital: 1000 }
];

const fullMatchContext = {
  roundsPlayed: 4,
  turnsPlayed: 16,
  durationSeconds: 220,
  hasBots: false,
  endReason: 'NORMAL_WIN'
};

const results = database.recordGameResults(dbRankings, 'pa', 'ROOM_TEST', false, fullMatchContext);
const freshA = database.getUser(dbUserA.telegramId);
const freshB = database.getUser(dbUserB.telegramId);

assert(freshA.rating > 0, `Winner Anna rating should increase, got ${freshA.rating}`);
assert.strictEqual(freshB.rating, 0, 'Loser Boris starting at 0 must remain at 0');
assert.strictEqual(results[0].ratingDelta, freshA.rating);

// Verify game record contains detailed anti-abuse metadata
const lastGame = database.games[database.games.length - 1];
assert.strictEqual(lastGame.roundsPlayed, 4);
assert.strictEqual(lastGame.durationSeconds, 220);
assert.strictEqual(lastGame.endReason, 'NORMAL_WIN');
assert.strictEqual(lastGame.rankings[0].ratingDelta, freshA.rating);
console.log(`✅ Database integration verified: Game saved with metadata, Anna rating -> ⭐ ${freshA.rating}`);

console.log('\n🎉 ALL RATING ALGORITHM & ANTI-ABUSE TESTS PASSED! 🎉');
