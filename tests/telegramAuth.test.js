const crypto = require('crypto');
const assert = require('assert');
const telegramAuth = require('../server/auth/telegramAuth');
const database = require('../server/db/Database');
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

async function testTelegramAuth() {
  console.log('🧪 Starting Telegram Auth, Stats & Leaderboard Tests...\n');

  // Test 1: Cryptographic Verification of Telegram Login Widget Payload
  console.log('Test 1: HMAC-SHA256 Cryptographic Verification of Telegram Payload');
  const testBotToken = '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_test_token';
  telegramAuth.setBotToken(testBotToken);

  const authDate = Math.floor(Date.now() / 1000);
  const dataToCheck = {
    auth_date: authDate,
    first_name: 'Иван',
    id: '998877665',
    last_name: 'Петров',
    photo_url: 'https://t.me/i/userpic/320/avatar.jpg',
    username: 'ivan_petrov'
  };

  // Generate valid Telegram HMAC signature
  const dataCheckString = Object.keys(dataToCheck)
    .sort()
    .map(key => `${key}=${dataToCheck[key]}`)
    .join('\n');
  const secretKey = crypto.createHash('sha256').update(testBotToken).digest();
  const validHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const validPayload = { ...dataToCheck, hash: validHash };
  const verifiedUser = telegramAuth.verifyWidgetAuth(validPayload);
  assert(verifiedUser !== null, 'Valid Telegram hash must be accepted');
  assert.strictEqual(verifiedUser.id, '998877665');
  assert.strictEqual(verifiedUser.first_name, 'Иван');
  console.log('✅ Cryptographic HMAC-SHA256 signature verified successfully');

  // Invalid hash rejection
  const invalidPayload = { ...dataToCheck, hash: 'bad_hash_signature_1234567890' };
  const rejectedUser = telegramAuth.verifyWidgetAuth(invalidPayload);
  assert.strictEqual(rejectedUser, null, 'Invalid hash signature must be rejected');
  console.log('✅ Invalid hash signature rejected as expected');

  // Test 2: Database User Creation and Persistence
  console.log('\nTest 2: Database User Creation & ELO Rating Initialization');
  const uid1 = `tg_test_alice_${Date.now()}`;
  const uid2 = `tg_test_boris_${Date.now()}`;

  const user1 = database.findOrCreateTelegramUser({
    id: uid1,
    first_name: 'Алиса',
    username: 'alice_winner',
    photo_url: 'https://example.com/alice.jpg'
  });
  assert.strictEqual(user1.telegramId, uid1);
  assert.strictEqual(user1.rating, 1000);
  assert.strictEqual(user1.wins, 0);
  assert.strictEqual(user1.gamesPlayed, 0);

  const user2 = database.findOrCreateTelegramUser({
    id: uid2,
    first_name: 'Борис',
    username: 'boris_player'
  });
  assert.strictEqual(user2.telegramId, uid2);
  assert.strictEqual(user2.rating, 1000);
  console.log('✅ Users created with initial 1000 ELO rating and clean stats');

  // Test 3: Game Results Recording and Rating Math
  console.log('\nTest 3: Game Results Recording and ELO Rating Calculation');
  const mockRankings = [
    { id: 'p1', name: 'Алиса', telegramId: uid1, rank: 1, isWinner: true, totalCapital: 3200 },
    { id: 'p2', name: 'Борис', telegramId: uid2, rank: 2, isWinner: false, totalCapital: 850 }
  ];

  database.recordGameResults(mockRankings, 'p1', 'TEST_ROOM');

  const updatedAlice = database.getUser(uid1);
  const updatedBoris = database.getUser(uid2);

  assert.strictEqual(updatedAlice.wins, 1, 'Alice must have 1 win');
  assert.strictEqual(updatedAlice.gamesPlayed, 1, 'Alice must have 1 game played');
  assert.strictEqual(updatedAlice.winRate, 100, 'Alice winrate must be 100%');
  assert(updatedAlice.rating > 1000, `Alice rating (${updatedAlice.rating}) must increase above 1000`);
  assert.strictEqual(updatedAlice.totalMoneyEarned, 3200);

  assert.strictEqual(updatedBoris.wins, 0, 'Boris must have 0 wins');
  assert.strictEqual(updatedBoris.losses, 1, 'Boris must have 1 loss');
  assert.strictEqual(updatedBoris.gamesPlayed, 1, 'Boris must have 1 game played');
  assert.strictEqual(updatedBoris.winRate, 0, 'Boris winrate must be 0%');
  assert(updatedBoris.rating < 1000, `Boris rating (${updatedBoris.rating}) must decrease below 1000`);
  console.log(`✅ Game results recorded: Winner ELO -> ${updatedAlice.rating}, Loser ELO -> ${updatedBoris.rating}`);

  // Test 4: Leaderboard Query
  console.log('\nTest 4: Leaderboard Top Query and Ranking');
  const leaderboard = database.getLeaderboard(100);
  assert(leaderboard.length >= 2, 'Leaderboard must contain recorded users');
  const topAlice = leaderboard.find(u => u.telegramId === uid1);
  assert(topAlice !== undefined, 'Alice must be in leaderboard');
  console.log(`✅ Leaderboard correctly ranked: #1 ${leaderboard[0].displayName} (⭐ ${leaderboard[0].rating})`);

  // Test 5: Socket Integration (Demo/WebApp Auth over Socket)
  console.log('\nTest 5: Socket Integration and Live Leaderboard');
  const { createTestServer } = require('./testServerHelper');
  const testEnv = await createTestServer();
  const client = io(testEnv.url, { reconnection: false });
  await new Promise(r => client.on('connect', r));

  const authSocketRes = await new Promise(resolve => {
    client.emit('auth_telegram', {
      authData: {
        id: 'tg_user_socket',
        first_name: 'Сокет Игрок',
        username: 'socket_hero',
        isDemo: true
      }
    }, resolve);
  });

  assert.strictEqual(authSocketRes.success, true);
  assert.strictEqual(authSocketRes.user.telegramId, 'tg_user_socket');
  assert.strictEqual(authSocketRes.user.firstName, 'Сокет Игрок');
  console.log('✅ Socket Telegram auth verified');

  // Test 6: Yandex ID Authentication over Socket
  console.log('\nTest 6: Yandex ID Authentication & Database Persistence');
  const yandexRes = await new Promise(resolve => {
    client.emit('auth_yandex', {
      authData: {
        id: 'ya_user_test_99',
        login: 'yandex_hero',
        display_name: 'Герой Яндекса',
        isDirect: true
      }
    }, resolve);
  });

  assert.strictEqual(yandexRes.success, true);
  assert.strictEqual(yandexRes.user.provider, 'yandex');
  assert.strictEqual(yandexRes.user.firstName, 'Герой Яндекса');
  console.log('✅ Yandex ID auth verified successfully');

  client.disconnect();
  await testEnv.close();
  console.log('\n🎉 ALL TELEGRAM & YANDEX AUTH, STATS & LEADERBOARD TESTS PASSED!\n');
  process.exit(0);
}

testTelegramAuth().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
