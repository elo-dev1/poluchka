const assert = require('assert');
const { io } = require('socket.io-client');
const telegramAuth = require('../server/auth/telegramAuth');
const yandexAuth = require('../server/auth/yandexAuth');
const { createTestServer } = require('./testServerHelper');

async function runSecurityTests() {
  console.log('🛡️ Running Security & Anti-IDOR Tests...\n');

  // --- Test 1: Production Auth Bypass Gate ---
  console.log('Test 1: Production Auth Bypass Prevention');
  const prevEnv = process.env.NODE_ENV;
  const prevAllowDev = process.env.ALLOW_DEV_AUTH;
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_DEV_AUTH;

    // Telegram direct bypass attempt in production
    const tgSpoof = telegramAuth.verifyWidgetAuth({
      isDirect: true,
      id: 'attacker_123',
      first_name: 'Hacker'
    });
    assert.strictEqual(tgSpoof, null, 'Direct Telegram spoofing must be blocked in production');

    // Telegram missing hash attempt in production
    const tgNoHash = telegramAuth.verifyWidgetAuth({
      id: 'victim_456',
      first_name: 'Victim'
    });
    assert.strictEqual(tgNoHash, null, 'Unsigned Telegram auth must be blocked in production');

    // Yandex direct bypass attempt in production
    const yandexSpoof = await yandexAuth.authenticateUser({
      isDirect: true,
      id: 'ya_attacker',
      login: 'hacker'
    });
    assert.strictEqual(yandexSpoof.success, false, 'Direct Yandex spoofing must be blocked in production');

    console.log('✅ Production auth bypass strictly blocked');
  } finally {
    process.env.NODE_ENV = prevEnv;
    if (prevAllowDev) process.env.ALLOW_DEV_AUTH = prevAllowDev;
  }

  // --- Test 2: Socket IDOR & Player Impersonation Defense ---
  console.log('\nTest 2: Socket IDOR & Player Impersonation Defense');
  const testEnv = await createTestServer();
  const hostClient = io(testEnv.url, { reconnection: false });
  const guestClient = io(testEnv.url, { reconnection: false });

  await Promise.all([
    new Promise(r => hostClient.on('connect', r)),
    new Promise(r => guestClient.on('connect', r))
  ]);

  // Host creates room
  const createRes = await new Promise(resolve => {
    hostClient.emit('create_room', {
      playerName: 'Хост Игрок',
      playerId: 'p_host_sec_1',
      isPrivate: false
    }, resolve);
  });
  assert.strictEqual(createRes.success, true);
  const roomId = createRes.roomId;

  // Guest joins room
  const joinRes = await new Promise(resolve => {
    guestClient.emit('join_room', {
      roomId,
      playerName: 'Гость Игрок',
      playerId: 'p_guest_sec_2'
    }, resolve);
  });
  assert.strictEqual(joinRes.success, true);

  // Attack 1: Guest tries to start game (Host only)
  const guestStartRes = await new Promise(resolve => {
    guestClient.emit('start_game', { roomId, playerId: 'p_guest_sec_2' }, resolve);
  });
  assert.strictEqual(guestStartRes.success, false, 'Non-host must not be able to start game');
  assert(guestStartRes.error.includes('Только создатель') || guestStartRes.error.includes('отклонено'));
  console.log('✅ Unauthorized start_game by guest correctly rejected');

  // Attack 2: Guest tries to start game by impersonating Host playerId
  const spoofStartRes = await new Promise(resolve => {
    guestClient.emit('start_game', { roomId, playerId: 'p_host_sec_1' }, resolve);
  });
  assert.strictEqual(spoofStartRes.success, false, 'Impersonating host playerId must be rejected');
  assert(spoofStartRes.error.includes('не совпадает идентификатор игрока'));
  console.log('✅ Host impersonation via spoofed playerId strictly rejected');

  // Legitimate host starts game
  const hostStartRes = await new Promise(resolve => {
    hostClient.emit('start_game', { roomId, playerId: 'p_host_sec_1' }, resolve);
  });
  assert.strictEqual(hostStartRes.success, true);

  // Attack 3: Guest tries to roll dice during host turn
  const guestRollRes = await new Promise(resolve => {
    guestClient.emit('roll_dice', { roomId, playerId: 'p_guest_sec_2' }, resolve);
  });
  assert.strictEqual(guestRollRes.success, false, 'Rolling out of turn must be rejected');

  // Attack 4: Guest tries to bankrupt host (declare_bankruptcy with host ID)
  const attackBankruptRes = await new Promise(resolve => {
    guestClient.emit('declare_bankruptcy', { roomId, playerId: 'p_host_sec_1' }, resolve);
  });
  assert.strictEqual(attackBankruptRes.success, false, 'Declaring bankruptcy for other player must be rejected');
  assert(attackBankruptRes.error.includes('не совпадает идентификатор игрока'));
  console.log('✅ Host bankruptcy attack by rival client strictly rejected');

  // Attack 5: Rogue socket (not in room) attempts game action
  const rogueClient = io(testEnv.url, { reconnection: false });
  await new Promise(r => rogueClient.on('connect', r));
  const rogueActionRes = await new Promise(resolve => {
    rogueClient.emit('roll_dice', { roomId, playerId: 'p_host_sec_1' }, resolve);
  });
  assert.strictEqual(rogueActionRes.success, false, 'Socket not in room must be rejected');
  assert(rogueActionRes.error.includes('не находитесь в активной комнате'));
  console.log('✅ Rogue unjoined socket actions strictly rejected');

  hostClient.disconnect();
  guestClient.disconnect();
  rogueClient.disconnect();
  await testEnv.close();

  console.log('\n🎉 ALL SECURITY & ANTI-IDOR DEFENSE TESTS PASSED!\n');
  process.exit(0);
}

runSecurityTests().catch(err => {
  console.error('❌ Security test failed:', err);
  process.exit(1);
});
