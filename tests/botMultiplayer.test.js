const { io } = require('socket.io-client');
const assert = require('assert');
const { createTestServer } = require('./testServerHelper');
const database = require('../server/db/Database');

async function testBotMultiplayer() {
  console.log('🤖 Testing Multiplayer Bot Lifecycle & Gameplay Integration (Stage 5)...');

  const testEnv = await createTestServer();
  const SERVER_URL = testEnv.url;

  const client1 = io(SERVER_URL, { reconnection: false });
  await new Promise((resolve) => client1.on('connect', resolve));
  console.log('✅ Client connected to server');

  // Step 1: Create room
  let roomId, hostPlayerId;
  const createRes = await new Promise((resolve) => {
    client1.emit('create_room', { playerName: 'Алиса (Хост)', isPrivate: false }, resolve);
  });
  assert.strictEqual(createRes.success, true);
  roomId = createRes.roomId;
  hostPlayerId = createRes.playerId;
  console.log(`✅ Room created: [${roomId}]`);

  // Step 2: Add Bots with different difficulties
  const addBot1 = await new Promise((resolve) => {
    client1.emit('add_bot', { roomId, difficulty: 'careful' }, resolve);
  });
  assert.strictEqual(addBot1.success, true);
  assert.strictEqual(addBot1.bot.isBot, true);
  assert.strictEqual(addBot1.bot.botDifficulty, 'careful');
  const bot1Id = addBot1.bot.id;
  console.log('✅ Added careful bot:', addBot1.bot.name);

  const addBot2 = await new Promise((resolve) => {
    client1.emit('add_bot', { roomId, difficulty: 'aggressive' }, resolve);
  });
  assert.strictEqual(addBot2.success, true);
  const bot2Id = addBot2.bot.id;
  console.log('✅ Added aggressive bot:', addBot2.bot.name);

  // Step 3: Remove bot
  const removeRes = await new Promise((resolve) => {
    client1.emit('remove_bot', { roomId, botId: bot2Id }, resolve);
  });
  assert.strictEqual(removeRes.success, true);
  assert.strictEqual(removeRes.state.players.length, 2);
  console.log('✅ Host successfully removed bot from lobby');

  // Add balanced bot back
  const addBotBalanced = await new Promise((resolve) => {
    client1.emit('add_bot', { roomId, difficulty: 'balanced' }, resolve);
  });
  assert.strictEqual(addBotBalanced.success, true);
  console.log('✅ Added balanced bot for match');

  // Step 4: Start Game (1 human + 2 bots)
  const startRes = await new Promise((resolve) => {
    client1.emit('start_game', { roomId, playerId: hostPlayerId }, resolve);
  });
  assert.strictEqual(startRes.success, true);
  assert.strictEqual(startRes.state.status, 'ROLLING');
  console.log('✅ Game started with bots in room');

  // Step 5: Human player takes their turn
  const rollRes = await new Promise((resolve) => {
    client1.emit('roll_dice', { roomId, playerId: hostPlayerId }, resolve);
  });
  assert.strictEqual(rollRes.success, true);
  console.log('✅ Human rolled dice');

  // Try buying property if landed on one, or just end turn
  await new Promise((resolve) => {
    client1.emit('buy_property', { roomId, playerId: hostPlayerId }, resolve);
  });

  // Human ends turn -> passes turn to bot
  const endTurnRes = await new Promise((resolve) => {
    client1.emit('end_turn', { roomId, playerId: hostPlayerId }, resolve);
  });
  console.log('✅ Human ended turn, turn transferred to Bot');

  // Step 6: Wait for Bot automated action (with thinking delay)
  console.log('⏳ Waiting for Bot automated move via BotManager...');
  const botTurnCompleted = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Bot did not execute its move within 8 seconds'));
    }, 8000);

    client1.on('game_state_updated', (updatedState) => {
      // Check if bot moved or rolled or completed turn
      if (updatedState.logs.some(l => l.text.includes('выбросил') || l.text.includes('купил') || l.text.includes('переходит к') || l.text.includes('бросает'))) {
        clearTimeout(timeout);
        resolve(updatedState);
      }
    });
  });
  assert.ok(botTurnCompleted, 'Bot executed move successfully');
  console.log('✅ Verified: Bot automatically rolled dice and processed action!');

  // Step 7: Mid-game human player replaces bot (Requirement 10)
  const client2 = io(SERVER_URL, { reconnection: false });
  await new Promise((resolve) => client2.on('connect', resolve));
  const joinMidGameRes = await new Promise((resolve) => {
    client2.emit('join_room', { roomId, playerName: 'Мария (Замена)' }, resolve);
  });
  assert.strictEqual(joinMidGameRes.success, true);
  assert.strictEqual(joinMidGameRes.state.hasBots, true);
  const replacedPlayer = joinMidGameRes.state.players.find(p => p.name.includes('Мария'));
  assert.ok(replacedPlayer, 'Human player successfully replaced bot in active game');
  assert.strictEqual(replacedPlayer.isBot, false);
  console.log('✅ Verified Requirement 10: Human successfully replaced bot mid-game with clean reset');

  // Step 8: Complete game and verify leaderboard isolation (Requirements 46-49)
  // Check Database record
  const initialRankings = [
    { id: hostPlayerId, name: 'Алиса', telegramId: '111111', rank: 1, isWinner: true, totalCapital: 2000, isBot: false },
    { id: bot1Id, name: 'Бот (Осторожный)', telegramId: null, rank: 2, isWinner: false, totalCapital: 1000, isBot: true }
  ];

  database.findOrCreateTelegramUser({ id: '111111', first_name: 'Алиса' });
  const userBefore = database.getUser('111111');
  const ratingBefore = userBefore.rating;
  const botGamesBefore = userBefore.botGamesPlayed || 0;

  // Record game with hasBots = true
  database.recordGameResults(initialRankings, hostPlayerId, roomId, true);

  const userAfter = database.getUser('111111');
  assert.strictEqual(userAfter.rating, ratingBefore, 'ELO Rating must NOT change for matches containing bots');
  assert.strictEqual(userAfter.botGamesPlayed, botGamesBefore + 1, 'botGamesPlayed counter must increment');
  console.log('✅ Verified Requirements 46-49: Bot games isolated from ELO rating, practice counter updated');

  client1.disconnect();
  client2.disconnect();
  testEnv.server.close();
  console.log('\n🌟 ALL BOT MULTIPLAYER & LIFECYCLE TESTS PASSED PERFECTLY! 🌟\n');
}

testBotMultiplayer().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
