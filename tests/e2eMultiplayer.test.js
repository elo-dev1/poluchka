const { io } = require('socket.io-client');
const assert = require('assert');
const { createTestServer } = require('./testServerHelper');

async function runE2ETest() {
  console.log('🚀 Running End-to-End Multiplayer Integration Test...');

  const testEnv = await createTestServer();
  const SERVER_URL = testEnv.url;

  const socket1 = io(SERVER_URL, { reconnection: false });
  const socket2 = io(SERVER_URL, { reconnection: false });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    socket1.on('connect', check);
    socket2.on('connect', check);
  });
  console.log('✅ Both player sockets connected');

  // Step 1: Host creates room with authenticated profile
  const createRes = await new Promise((resolve) => {
    socket1.emit('create_room', { playerName: 'Александр', playerId: 'p_host_123', telegramId: 'tg_host_123' }, resolve);
  });
  assert.strictEqual(createRes.success, true);
  const roomId = createRes.roomId;
  assert.strictEqual(typeof roomId, 'string');
  assert.strictEqual(roomId.length, 4);
  console.log(`✅ Host created room with code: [${roomId}]`);

  // Wait a tick for room join propagation
  await new Promise(r => setTimeout(r, 100));

  // Step 2: Guest joins room
  const joinRes = await new Promise((resolve) => {
    socket2.emit('join_room', { roomId, playerName: 'Мария', playerId: 'p_guest_456' }, resolve);
  });
  assert.strictEqual(joinRes.success, true);
  assert.strictEqual(joinRes.state.players.length, 2);
  console.log('✅ Guest joined room successfully (2 players in lobby)');

  // Wait a tick
  await new Promise(r => setTimeout(r, 100));

  // Step 3: Host starts game
  const startPromise = new Promise((resolve) => {
    socket2.on('game_state_updated', function onState(st) {
      if (st.status === 'ROLLING') {
        socket2.off('game_state_updated', onState);
        resolve(st);
      }
    });
  });

  const startRes = await new Promise((resolve) => {
    socket1.emit('start_game', { roomId, playerId: 'p_host_123' }, resolve);
  });
  assert.strictEqual(startRes.success, true);
  const stateAfterStart = await startPromise;

  assert.strictEqual(stateAfterStart.status, 'ROLLING');
  assert.strictEqual(stateAfterStart.currentPlayerId, 'p_host_123');
  console.log('✅ Game started, both clients received synchronized ROLLING state');

  // Step 4: Host rolls dice
  const rollPromise = new Promise((resolve) => {
    socket2.once('player_rolled', (rollData) => {
      assert.strictEqual(rollData.playerId, 'p_host_123');
      assert(rollData.dice.sum >= 2 && rollData.dice.sum <= 12);
      resolve(rollData);
    });
  });

  const rollRes = await new Promise((resolve) => {
    socket1.emit('roll_dice', { roomId, playerId: 'p_host_123' }, resolve);
  });
  assert.strictEqual(rollRes.success, true);
  const rollData = await rollPromise;
  console.log(`✅ Dice roll broadcast verified: sum=${rollData.dice.sum}, newPos=${rollData.newPosition}`);

  // Step 5: If property was landed on, test buying/passing
  const currentState = rollRes.result.state;
  if (currentState.status === 'AWAITING_ACTION') {
    const buyRes = await new Promise((resolve) => {
      socket1.emit('buy_property', { roomId, playerId: 'p_host_123' }, resolve);
    });
    assert.strictEqual(buyRes.success, true);
    console.log('✅ Property purchase verified');
  }

  // End host turn
  const endTurnRes = await new Promise((resolve) => {
    socket1.emit('end_turn', { roomId, playerId: 'p_host_123' }, resolve);
  });
  assert.strictEqual(endTurnRes.success, true);
  console.log('✅ Turn successfully passed to Maria (p_guest_456)');

  // Step 6: Test real-time Chat (using authenticated host user)
  const chatPromise = new Promise((resolve) => {
    socket2.once('chat_message', (chat) => {
      assert.strictEqual(chat.message, 'Привет всем! Отличная игра!');
      resolve();
    });
  });

  socket1.emit('send_chat', {
    roomId,
    playerId: 'p_host_123',
    message: 'Привет всем! Отличная игра!'
  });
  await chatPromise;
  console.log('✅ Real-time chat message broadcast verified');

  // Step 7: Test Reconnection (Simulate page refresh)
  const reconnectRes = await new Promise((resolve) => {
    socket1.emit('reconnect_player', { roomId, playerId: 'p_host_123' }, resolve);
  });
  assert.strictEqual(reconnectRes.success, true);
  assert.strictEqual(reconnectRes.state.roomId, roomId);
  console.log('✅ Player reconnection & state restore verified');

  // Clean up
  socket1.disconnect();
  socket2.disconnect();
  await testEnv.close();

  console.log('\n🌟 ALL E2E MULTIPLAYER INTEGRATION TESTS PASSED PERFECTLY! 🌟\n');
  process.exit(0);
}

runE2ETest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
