const assert = require('assert');
const { io } = require('socket.io-client');
const profanityFilter = require('../server/utils/profanityFilter');
const { createTestServer } = require('./testServerHelper');

async function runProfanityTests() {
  console.log('🤬 Running Profanity & Anti-Mat Filter Tests...\n');

  // --- Test 1: Unit Tests on Profanity Filter ---
  console.log('Test 1: Unit Tests on Russian & English Profanity Detection & Censoring');

  const matCases = [
    { input: 'ты хуй', shouldHave: true, expectedCensored: 'ты ***' },
    { input: 'ну это пиздец', shouldHave: true, expectedCensored: 'ну это ***' },
    { input: 'пошел нахуй отсюда', shouldHave: true, expectedCensored: 'пошел *** отсюда' },
    { input: 'сука ебаная', shouldHave: true, expectedCensored: '***' },
    { input: 'п.и.з.д.е.ц', shouldHave: true, expectedCensored: '***' },
    { input: 'х_у_й', shouldHave: true, expectedCensored: '***' },
    { input: 'х у й', shouldHave: true, expectedCensored: '***' },
    { input: 'x.y.u', shouldHave: true, expectedCensored: '***' },
    { input: 'хххуууййй', shouldHave: true, expectedCensored: '***' },
    { input: 'еблан тупой', shouldHave: true, expectedCensored: '*** тупой' },
    { input: 'блядь какая-то', shouldHave: true, expectedCensored: '*** какая-то' },
    { input: 'блять', shouldHave: true, expectedCensored: '***' },
    { input: 'мудак', shouldHave: true, expectedCensored: '***' },
    { input: 'пидорас', shouldHave: true, expectedCensored: '***' },
    { input: 'fuck you all', shouldHave: true, expectedCensored: '*** you all' },
    { input: 'stupid bitch', shouldHave: true, expectedCensored: 'stupid ***' }
  ];

  for (const tc of matCases) {
    assert.strictEqual(
      profanityFilter.hasProfanity(tc.input),
      tc.shouldHave,
      `Failed hasProfanity for: "${tc.input}"`
    );
    const censored = profanityFilter.censor(tc.input);
    assert(
      !profanityFilter.hasProfanity(censored),
      `Censored text should no longer contain profanity: "${censored}" (from "${tc.input}")`
    );
  }
  console.log('✅ All obscene phrases correctly detected and censored');

  // --- Test 2: False Positives Defense (Innocent words must not be censored) ---
  console.log('\nTest 2: False Positive Defense for Innocent Words');
  const safeCases = [
    'Привет всем, отличная игра!',
    'Колебания курса и цен',
    'Употреблять полезную пищу',
    'Не надо никого оскорблять',
    'Свежий хлеб и масло',
    'Баланс 1500 рублей',
    'Команда победителей',
    'Скипидарная мазь',
    'Мудрый и расчетливый ход',
    'Зеленое сукно стола',
    'Спелые мандарины на празднике',
    'Ребята, погнали играть',
    'Бляха от старого ремня',
    'Быстрый лебедь на озере',
    'Судебный процесс и правосудие'
  ];

  for (const phrase of safeCases) {
    assert.strictEqual(
      profanityFilter.hasProfanity(phrase),
      false,
      `False positive detected for safe phrase: "${phrase}"`
    );
    assert.strictEqual(
      profanityFilter.censor(phrase),
      phrase,
      `Safe phrase must remain unchanged: "${phrase}"`
    );
  }
  console.log('✅ Zero false positives on innocent Russian vocabulary');

  // --- Test 3: Real-Time Socket Integration (Chat & Nickname Sanitization) ---
  console.log('\nTest 3: Live Socket Chat Filtering & Nickname Gate');
  const testEnv = await createTestServer();
  const host = io(testEnv.url, { reconnection: false });
  const guest = io(testEnv.url, { reconnection: false });

  await Promise.all([
    new Promise(r => host.on('connect', r)),
    new Promise(r => guest.on('connect', r))
  ]);

  // Host creates room with clean profile
  const hostCreate = await new Promise(resolve => {
    host.emit('create_room', {
      playerName: 'Хороший Игрок',
      playerId: 'p_chat_host',
      telegramId: 'tg_chat_host_1',
      isPrivate: false
    }, resolve);
  });
  assert.strictEqual(hostCreate.success, true);
  const roomId = hostCreate.roomId;

  // Guest joins
  const guestJoin = await new Promise(resolve => {
    guest.emit('join_room', {
      roomId,
      playerName: 'Второй Игрок',
      playerId: 'p_chat_guest',
      telegramId: 'tg_chat_guest_2'
    }, resolve);
  });
  assert.strictEqual(guestJoin.success, true);

  // Host sends message containing profanities
  const receivedMsgPromise = new Promise(resolve => {
    guest.on('chat_message', msg => {
      resolve(msg);
    });
  });

  host.emit('send_chat', {
    roomId,
    playerId: 'p_chat_host',
    message: 'Привет всем, этот ход просто пиздец, ну нахуй!'
  });

  const receivedMsg = await receivedMsgPromise;
  assert.strictEqual(receivedMsg.playerId, 'p_chat_host');
  assert(
    !receivedMsg.message.includes('пиздец') && !receivedMsg.message.includes('нахуй'),
    `Message should be censored. Received: "${receivedMsg.message}"`
  );
  assert(
    receivedMsg.message.includes('***'),
    `Message should contain censor asterisks. Received: "${receivedMsg.message}"`
  );
  console.log(`✅ Chat message broadcast successfully censored: "${receivedMsg.message}"`);

  // Guest tries to set obscene nickname
  const obsceneNickRes = await new Promise(resolve => {
    guest.emit('update_nickname', {
      nickname: 'Хуила_2026',
      telegramId: 'tg_chat_guest_2'
    }, resolve);
  });
  assert.strictEqual(obsceneNickRes.success, false, 'Obscene nickname must be rejected');
  assert(obsceneNickRes.error.includes('недопустимые слова'));
  console.log('✅ Obscene nickname change rejected by server gate');

  host.disconnect();
  guest.disconnect();
  await testEnv.close();

  console.log('\n🎉 ALL PROFANITY FILTER & ANTI-MAT TESTS PASSED!\n');
  process.exit(0);
}

runProfanityTests().catch(err => {
  console.error('❌ Profanity test failed:', err);
  process.exit(1);
});
