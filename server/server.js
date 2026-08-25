const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Auto-load .env file if present
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.substring(0, idx).trim();
          const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      }
    });
  } catch (e) {
    console.error('Error reading .env:', e);
  }
}

const { Server } = require('socket.io');
const setupSocketHandlers = require('./socket/socketHandlers');
const roomManager = require('./game/RoomManager');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const telegramAuth = require('./auth/telegramAuth');
const yandexAuth = require('./auth/yandexAuth');
const database = require('./db/Database');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../dist');
const PUBLIC_DIR = path.join(__dirname, '../public');
const STATIC_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR;

// Serve static frontend files
app.use(express.static(STATIC_DIR));

// JSON API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    roomsCount: roomManager.rooms.size,
    usersCount: database.users.size,
    uptime: process.uptime()
  });
});

// Auth config endpoint (Telegram & Yandex)
app.get('/api/auth/config', (req, res) => {
  res.json({
    botUsername: process.env.TELEGRAM_BOT_NAME || 'MonopolyWebGameBot',
    hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
    yandexClientId: process.env.YANDEX_CLIENT_ID || ''
  });
});

// Telegram Auth endpoint
app.post('/api/auth/telegram', (req, res) => {
  try {
    const authData = req.body;
    const result = telegramAuth.authenticateUser(authData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('API Telegram Auth error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Yandex ID Auth endpoint
app.post('/api/auth/yandex', async (req, res) => {
  try {
    const authData = req.body;
    const result = await yandexAuth.authenticateUser(authData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('API Yandex Auth error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Leaderboard endpoint
app.get('/api/leaderboard', (req, res) => {
  try {
    const limit = Math.min(50, Math.max(5, Number(req.query.limit) || 20));
    const leaderboard = database.getLeaderboard(limit);
    res.json({
      success: true,
      leaderboard
    });
  } catch (err) {
    console.error('API Leaderboard error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// User profile endpoint
app.get('/api/user/:telegramId', (req, res) => {
  try {
    const user = database.getUser(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Public rooms endpoint
app.get('/api/rooms', (req, res) => {
  res.json({
    rooms: roomManager.getPublicRooms()
  });
});

// Fallback to index.html for SPA routing (only for HTML routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/assets/') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// Periodically clean up old rooms
setInterval(() => {
  roomManager.cleanInactiveRooms();
}, 60 * 60 * 1000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===========================================`);
  console.log(`🎲 Monopoly MVP Server is running!`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`📁 Static files: ${STATIC_DIR}`);
  console.log(`===========================================`);
});
