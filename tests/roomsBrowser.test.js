const { io } = require('socket.io-client');
const assert = require('assert');
const { createTestServer } = require('./testServerHelper');

async function testRoomsBrowser() {
  console.log('🧪 Testing Public Rooms Browser & Lobby List...');

  const testEnv = await createTestServer();
  const SERVER_URL = testEnv.url;

  const client1 = io(SERVER_URL, { reconnection: false });
  const client2 = io(SERVER_URL, { reconnection: false });
  const client3 = io(SERVER_URL, { reconnection: false });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 3) resolve();
    };
    client1.on('connect', check);
    client2.on('connect', check);
    client3.on('connect', check);
  });
  console.log('✅ 3 test clients connected');

  // Step 1: Client 1 creates a public room
  let publicRoomCode = null;
  const createPublicRes = await new Promise((resolve) => {
    client1.emit('create_room', { playerName: 'Хост Публичный', isPrivate: false }, resolve);
  });
  assert.strictEqual(createPublicRes.success, true);
  publicRoomCode = createPublicRes.roomId;
  console.log(`✅ Public room created: [${publicRoomCode}]`);

  // Step 2: Client 2 creates a private room
  let privateRoomCode = null;
  const createPrivateRes = await new Promise((resolve) => {
    client2.emit('create_room', { playerName: 'Хост Приватный', isPrivate: true }, resolve);
  });
  assert.strictEqual(createPrivateRes.success, true);
  privateRoomCode = createPrivateRes.roomId;
  console.log(`✅ Private room created: [${privateRoomCode}]`);

  // Step 3: Client 3 requests public rooms list
  const roomsListRes = await new Promise((resolve) => {
    client3.emit('get_rooms_list', resolve);
  });
  assert.strictEqual(roomsListRes.success, true);
  const rooms = roomsListRes.rooms;
  
  // Verify public room is listed, private room is NOT
  const hasPublic = rooms.some(r => r.roomId === publicRoomCode);
  const hasPrivate = rooms.some(r => r.roomId === privateRoomCode);
  assert.strictEqual(hasPublic, true, 'Public room must be visible in lobby browser');
  assert.strictEqual(hasPrivate, false, 'Private room must NOT be visible in lobby browser');
  console.log('✅ Public room is listed, private room is hidden');

  // Step 4: Client 3 joins the public room by 1-click
  const joinRes = await new Promise((resolve) => {
    client3.emit('join_room', { roomId: publicRoomCode, playerName: 'Игрок 3' }, resolve);
  });
  assert.strictEqual(joinRes.success, true);
  console.log('✅ Client 3 joined public room via list');

  // Step 5: Start game in public room -> verify room leaves public listing
  await new Promise((resolve) => {
    client1.emit('start_game', { roomId: publicRoomCode, playerId: createPublicRes.playerId }, resolve);
  });

  const roomsAfterStart = await new Promise((resolve) => {
    client2.emit('get_rooms_list', resolve);
  });
  const hasStartedRoom = roomsAfterStart.rooms.some(r => r.roomId === publicRoomCode);
  assert.strictEqual(hasStartedRoom, false, 'Started games must not appear in open tables');
  console.log('✅ Started room successfully removed from open tables browser');

  // Step 6: Create another table and leave it -> verify table is immediately destroyed
  const tempRoomRes = await new Promise((resolve) => {
    client2.emit('create_room', { playerName: 'Временный Хост', isPrivate: false }, resolve);
  });
  assert.strictEqual(tempRoomRes.success, true);
  const tempRoomCode = tempRoomRes.roomId;

  // Verify it exists in list
  const listBeforeLeave = await new Promise((resolve) => {
    client3.emit('get_rooms_list', resolve);
  });
  assert.strictEqual(listBeforeLeave.rooms.some(r => r.roomId === tempRoomCode), true);

  // Leave room
  await new Promise((resolve) => {
    client2.emit('leave_room', { roomId: tempRoomCode, playerId: tempRoomRes.playerId }, resolve);
  });

  // Verify it is immediately removed from browser
  const listAfterLeave = await new Promise((resolve) => {
    client3.emit('get_rooms_list', resolve);
  });
  assert.strictEqual(listAfterLeave.rooms.some(r => r.roomId === tempRoomCode), false, 'Empty room after leave must be removed');
  console.log('✅ Left room immediately removed from open tables browser');

  // Cleanup
  client1.disconnect();
  client2.disconnect();
  client3.disconnect();
  await testEnv.close();

  console.log('\n🎉 ALL PUBLIC ROOMS BROWSER TESTS PASSED!\n');
  process.exit(0);
}

testRoomsBrowser().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
