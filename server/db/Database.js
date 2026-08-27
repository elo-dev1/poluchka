const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.gamesFile = path.join(this.dataDir, 'games.json');
    this.users = new Map(); // telegramId -> user object
    this.games = [];

    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      // Check for legacy data in server/data and migrate if present
      const legacyDir = path.join(__dirname, '../data');
      if (fs.existsSync(legacyDir) && legacyDir !== this.dataDir) {
        const legacyUsers = path.join(legacyDir, 'users.json');
        const legacyGames = path.join(legacyDir, 'games.json');
        if (!fs.existsSync(this.usersFile) && fs.existsSync(legacyUsers)) {
          try { fs.copyFileSync(legacyUsers, this.usersFile); } catch (e) {}
        }
        if (!fs.existsSync(this.gamesFile) && fs.existsSync(legacyGames)) {
          try { fs.copyFileSync(legacyGames, this.gamesFile); } catch (e) {}
        }
      }

      if (fs.existsSync(this.usersFile)) {
        const raw = fs.readFileSync(this.usersFile, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(u => this.users.set(String(u.telegramId), u));
        }
      }

      if (fs.existsSync(this.gamesFile)) {
        const raw = fs.readFileSync(this.gamesFile, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.games = parsed;
        }
      }
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }

  saveUsers() {
    try {
      const arr = Array.from(this.users.values());
      fs.writeFileSync(this.usersFile, JSON.stringify(arr, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save users database:', err);
    }
  }

  saveGames() {
    try {
      // Keep last 500 games
      if (this.games.length > 500) {
        this.games = this.games.slice(-500);
      }
      fs.writeFileSync(this.gamesFile, JSON.stringify(this.games, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save games history:', err);
    }
  }

  /**
   * Find or create user by Telegram Profile Data
   */
  findOrCreateTelegramUser(tgData) {
    if (!tgData || !tgData.id) return null;
    const tgId = String(tgData.id);

    let user = this.users.get(tgId);
    const now = Date.now();

    if (!user) {
      user = {
        telegramId: tgId,
        username: tgData.username || '',
        firstName: tgData.first_name || 'Игрок',
        lastName: tgData.last_name || '',
        avatarUrl: tgData.photo_url || '',
        rating: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalMoneyEarned: 0,
        createdAt: now,
        lastLoginAt: now
      };
      this.users.set(tgId, user);
    } else {
      // Update details on login
      if (tgData.username !== undefined) user.username = tgData.username;
      if (tgData.first_name) user.firstName = tgData.first_name;
      if (tgData.last_name !== undefined) user.lastName = tgData.last_name;
      if (tgData.photo_url) user.avatarUrl = tgData.photo_url;
      user.lastLoginAt = now;
    }

    this.saveUsers();
    return { ...user };
  }

  /**
   * Find or create user by Yandex Profile Data
   */
  findOrCreateYandexUser(yandexData) {
    if (!yandexData || !yandexData.id) return null;
    const yId = String(yandexData.id).startsWith('ya_') ? String(yandexData.id) : `ya_${yandexData.id}`;

    let user = this.users.get(yId);
    const now = Date.now();

    if (!user) {
      user = {
        telegramId: yId, // primary unique user key in DB
        yandexId: yId,
        provider: 'yandex',
        username: yandexData.login || yandexData.username || '',
        firstName: yandexData.first_name || yandexData.display_name || yandexData.login || 'Игрок Яндекс',
        lastName: yandexData.last_name || '',
        avatarUrl: yandexData.avatar_url || yandexData.photo_url || '',
        rating: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalMoneyEarned: 0,
        createdAt: now,
        lastLoginAt: now
      };
      this.users.set(yId, user);
    } else {
      if (yandexData.login) user.username = yandexData.login;
      if (yandexData.first_name || yandexData.display_name) {
        user.firstName = yandexData.first_name || yandexData.display_name;
      }
      if (yandexData.avatar_url || yandexData.photo_url) {
        user.avatarUrl = yandexData.avatar_url || yandexData.photo_url;
      }
      user.lastLoginAt = now;
    }

    this.saveUsers();
    return { ...user };
  }

  getUser(telegramId) {
    if (!telegramId) return null;
    const user = this.users.get(String(telegramId));
    return user ? { ...user } : null;
  }

  /**
   * Update user nickname (firstName / display name)
   */
  updateUserNickname(telegramId, newNickname) {
    if (!telegramId) return null;
    const clean = String(newNickname || '').trim().substring(0, 24);
    if (!clean) return null;

    const user = this.users.get(String(telegramId));
    if (!user) return null;

    user.firstName = clean;
    this.saveUsers();
    return { ...user };
  }

  /**
   * Record game results and update ELO rating for registered players
   */
  recordGameResults(rankings, winnerId, roomId, hasBots = false) {
    if (!Array.isArray(rankings) || rankings.length === 0) return;

    const containsBots = Boolean(hasBots || rankings.some(r => r.isBot));

    const gameRecord = {
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId: roomId || '',
      winnerId: winnerId || '',
      hasBots: containsBots,
      endedAt: Date.now(),
      playersCount: rankings.length,
      rankings: rankings.map(r => ({
        id: r.id,
        name: r.name,
        telegramId: r.telegramId || null,
        isBot: Boolean(r.isBot),
        botDifficulty: r.botDifficulty || null,
        rank: r.rank,
        isWinner: r.isWinner,
        totalCapital: r.totalCapital || r.money || 0
      }))
    };
    this.games.push(gameRecord);
    this.saveGames();

    // Update player statistics
    rankings.forEach(rankedPlayer => {
      if (!rankedPlayer.telegramId || rankedPlayer.isBot) return; // Skip guest accounts and bots
      const user = this.users.get(String(rankedPlayer.telegramId));
      if (!user) return;

      if (containsBots) {
        // Practice / Bot match statistics (DO NOT contaminate official ELO leaderboard)
        user.botGamesPlayed = (user.botGamesPlayed || 0) + 1;
        if (rankedPlayer.isWinner) {
          user.botWins = (user.botWins || 0) + 1;
        }
      } else {
        // Official PVP match statistics
        user.gamesPlayed = (user.gamesPlayed || 0) + 1;
        const capital = Math.max(0, rankedPlayer.totalCapital || rankedPlayer.money || 0);
        user.totalMoneyEarned = (user.totalMoneyEarned || 0) + capital;

        if (rankedPlayer.isWinner) {
          user.wins = (user.wins || 0) + 1;
          // Rating boost on victory (+25 to +40 based on player count)
          const ratingGain = Math.min(45, 20 + rankings.length * 5);
          user.rating = Math.round(user.rating + ratingGain);
        } else {
          user.losses = (user.losses || 0) + 1;
          // Rating loss (-8 to -22, min rating 0)
          const ratingLoss = Math.max(8, 22 - (rankedPlayer.rank || 2) * 3);
          user.rating = Math.max(0, Math.round(user.rating - ratingLoss));
        }

        user.winRate = Math.round((user.wins / user.gamesPlayed) * 100);
      }
    });

    this.saveUsers();
  }

  /**
   * Get Top-N players for leaderboard
   */
  getLeaderboard(limit = 20) {
    const list = Array.from(this.users.values()).map(u => ({
      telegramId: u.telegramId,
      username: u.username,
      displayName: u.firstName + (u.lastName ? ` ${u.lastName}` : ''),
      avatarUrl: u.avatarUrl,
      rating: u.rating !== undefined ? u.rating : 0,
      wins: u.wins || 0,
      gamesPlayed: u.gamesPlayed || 0,
      winRate: u.gamesPlayed ? Math.round((u.wins / u.gamesPlayed) * 100) : 0,
      totalMoneyEarned: u.totalMoneyEarned || 0
    }));

    // Sort by rating desc, then wins desc
    list.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.wins - a.wins;
    });

    return list.slice(0, limit);
  }
}

module.exports = new Database();
