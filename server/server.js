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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const setupSocketHandlers = require('./socket/socketHandlers');
const roomManager = require('./game/RoomManager');

const app = express();
app.use(express.json());

// Security headers (Helmet) - configured to allow Telegram WebApp iframe embedding & dynamic assets
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false // Required for embedding in Telegram WebApp
}));

// Rate limiting: general API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много запросов. Пожалуйста, подождите.' }
});

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много попыток входа. Попробуйте через минуту.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Ensure secure SESSION_SECRET in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ [SECURITY] SESSION_SECRET is not set in production. Generated a random secret key.');
  process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
}

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
const profanityFilter = require('./utils/profanityFilter');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const isDev = process.env.NODE_ENV !== 'production' && !process.env.SERVE_DIST;

// Global process error handlers
process.on('uncaughtException', (err) => {
  console.error('🔥 [CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown handling
let isShuttingDown = false;
const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log('✅ HTTP and WebSocket server closed.');
    try {
      database.close();
      console.log('✅ SQLite database connection safely closed.');
    } catch (e) {
      console.error('Error closing database:', e);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Graceful shutdown timed out (10s). Forcing termination.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function bootstrap() {
  let vite = null;

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
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    const botId = botToken.split(':')[0] || '';
    res.json({
      botUsername: process.env.TELEGRAM_BOT_NAME || 'monopoly_poluchka_bot',
      botId: botId,
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      yandexClientId: process.env.YANDEX_CLIENT_ID || process.env.VITE_YANDEX_CLIENT_ID || ''
    });
  });

  // Telegram Auth endpoint
  app.post('/api/auth/telegram', (req, res) => {
    try {
      const authData = req.body;
      const result = telegramAuth.authenticateUser(authData);
      if (!result.success) {
        return res.status(401).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Yandex Auth endpoint
  app.post('/api/auth/yandex', async (req, res) => {
    try {
      const authData = req.body;
      const result = await yandexAuth.authenticateUser(authData);
      if (!result.success) {
        return res.status(401).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Nickname endpoint
  app.post('/api/user/nickname', (req, res) => {
    try {
      const { telegramId, nickname } = req.body;
      if (!telegramId || !nickname) {
        return res.status(400).json({ success: false, error: 'telegramId и nickname обязательны' });
      }
      if (profanityFilter.hasProfanity(nickname)) {
        return res.status(400).json({ success: false, error: 'Имя содержит недопустимые слова' });
      }
      const updated = database.updateUserNickname(telegramId, nickname);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }
      res.json({ success: true, user: updated });
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

  // Attach Vite HMR middleware in development or express.static in production
  if (isDev) {
    try {
      const { createServer: createViteServer } = await import('vite');
      vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: ROOT_DIR,
      });
      app.use(vite.middlewares);
      console.log('⚡ Vite HMR Live Development mode active on port ' + PORT);
    } catch (err) {
      console.warn('Vite dev middleware failed, serving static dist:', err);
      app.use(express.static(DIST_DIR));
    }
  } else {
    app.use(express.static(DIST_DIR));
    // Fallback to index.html for SPA routing (only in production)
    app.get('*', (req, res) => {
      if (req.path.startsWith('/assets/') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return res.status(404).send('Not found');
      }
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }

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
    console.log(`Mode: ${isDev ? '🔥 DEV (Hot-Reload / HMR Active)' : '🚀 PRODUCTION'}`);
    console.log(`===========================================`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
});
