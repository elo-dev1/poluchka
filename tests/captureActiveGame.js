const puppeteer = require('puppeteer-core');
const path = require('path');
const { io } = require('socket.io-client');

async function main() {
  console.log('🚀 Creating multiplayer game via socket...');
  const socket1 = io('http://localhost:3000', { reconnection: false });
  const socket2 = io('http://localhost:3000', { reconnection: false });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    socket1.on('connect', check);
    socket2.on('connect', check);
  });

  const hostPlayerId = 'p_user_101';
  const createRes = await new Promise((resolve) => {
    socket1.emit('create_room', { playerName: 'User', playerId: hostPlayerId, boardSize: 40 }, resolve);
  });

  const roomId = createRes.roomId;
  console.log('Room created:', roomId);

  await new Promise((resolve) => {
    socket2.emit('join_room', { roomId, playerName: 'User_1', playerId: 'p_user_202' }, resolve);
  });

  await new Promise((resolve) => {
    socket1.emit('start_game', { roomId, playerId: hostPlayerId }, resolve);
  });

  console.log('Game started in backend!');

  const executablePath = process.env.CHROME_PATH ||
    (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Set localStorage
  await page.evaluate((rId, pId) => {
    localStorage.setItem('monopoly_saved_room_id', rId);
    localStorage.setItem('monopoly_saved_player_id', pId);
    localStorage.setItem('monopoly_saved_player_name', 'User');
  }, roomId, hostPlayerId);

  // Reload page
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot of Game Screen!
  const screenshotPath = path.join(__dirname, '../active_game_screen.png');
  await page.screenshot({ path: screenshotPath });
  console.log('🌟 SUCCESS: Captured active game screen screenshot to', screenshotPath);

  // Click on a tile
  await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.perspective-board [title]'));
    if (tiles.length > 3) tiles[3].click();
  });

  await new Promise(r => setTimeout(r, 800));

  const screenshotPathCard = path.join(__dirname, '../active_game_card_screen.png');
  await page.screenshot({ path: screenshotPathCard });
  console.log('🌟 SUCCESS: Captured active game card screen screenshot to', screenshotPathCard);

  await browser.close();
  socket1.disconnect();
  socket2.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
