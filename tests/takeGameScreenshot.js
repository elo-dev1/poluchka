const puppeteer = require('puppeteer-core');
const path = require('path');
const io = require('socket.io-client');

async function main() {
  console.log('Launching browser...');
  const executablePath = process.env.CHROME_PATH ||
    (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Click "Создать стол (40 клеток)"
  console.log('Clicking create room...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Создать стол') || b.textContent.includes('40 клеток'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  // Connect guest socket to fill room
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Lobby page text:', text.slice(0, 300));
  const m = text.match(/\[([A-Z0-9]{4})\]/) || text.match(/([A-Z0-9]{4})/);
  const roomId = m ? m[1] : null;
  console.log('Room ID found:', roomId);

  if (roomId) {
    const guestSocket = io('http://localhost:3000');
    guestSocket.emit('join_room', { roomId, playerName: 'User_2', characterId: 'cat_cyber' });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Click "Начать игру"
  console.log('Starting game...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Начать') || b.textContent.includes('Старт'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2500));

  const screenshotPath1 = path.join(__dirname, '../game_preview.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log('SUCCESS: Saved game preview to', screenshotPath1);

  // Click a tile to show property card
  await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.perspective-board [title]'));
    if (tiles.length > 3) tiles[3].click();
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshotPath2 = path.join(__dirname, '../game_tile_card_preview.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('SUCCESS: Saved property card preview to', screenshotPath2);

  await browser.close();
  console.log('All done!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error running screenshot script:', err);
  process.exit(1);
});
