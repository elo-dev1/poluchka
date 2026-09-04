const fs = require('fs');
const path = require('path');
const SQLiteDatabase = require('better-sqlite3');
const ratingEngine = require('../game/RatingEngine');

class Database {
  constructor(dbPath = null) {
    this.dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
    this.dbFile = dbPath || process.env.DB_FILE || path.join(this.dataDir, 'monopoly.db');
    this.users = new Map(); // telegramId -> user object (in-memory cache for O(1) reads & RatingEngine)
    this.games = [];

    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      // Initialize SQLite database
      this.db = new SQLiteDatabase(this.dbFile);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');

      // Create Tables & Indexes
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          telegramId TEXT PRIMARY KEY,
          yandexId TEXT,
          provider TEXT,
          username TEXT,
          firstName TEXT,
          lastName TEXT,
          avatarUrl TEXT,
          rating INTEGER DEFAULT 0,
          gamesPlayed INTEGER DEFAULT 0,
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          winRate INTEGER DEFAULT 0,
          totalMoneyEarned INTEGER DEFAULT 0,
          botGamesPlayed INTEGER DEFAULT 0,
          botWins INTEGER DEFAULT 0,
          isGuest INTEGER DEFAULT 0,
          createdAt INTEGER,
          lastLoginAt INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_users_rating ON users (rating DESC, wins DESC);
        CREATE INDEX IF NOT EXISTS idx_users_isGuest ON users (isGuest);

        CREATE TABLE IF NOT EXISTS games (
          id TEXT PRIMARY KEY,
          roomId TEXT,
          winnerId TEXT,
          hasBots INTEGER DEFAULT 0,
          isPrivate INTEGER DEFAULT 0,
          endedAt INTEGER,
          playersCount INTEGER,
          roundsPlayed INTEGER,
          durationSeconds INTEGER,
          endReason TEXT,
          rankingsJson TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_games_endedAt ON games (endedAt DESC);
      `);

      // Prepare statements
      this.stmtUpsertUser = this.db.prepare(`
        INSERT INTO users (
          telegramId, yandexId, provider, username, firstName, lastName, avatarUrl,
          rating, gamesPlayed, wins, losses, winRate, totalMoneyEarned,
          botGamesPlayed, botWins, isGuest, createdAt, lastLoginAt
        ) VALUES (
          @telegramId, @yandexId, @provider, @username, @firstName, @lastName, @avatarUrl,
          @rating, @gamesPlayed, @wins, @losses, @winRate, @totalMoneyEarned,
          @botGamesPlayed, @botWins, @isGuest, @createdAt, @lastLoginAt
        )
        ON CONFLICT(telegramId) DO UPDATE SET
          yandexId = COALESCE(excluded.yandexId, users.yandexId),
          provider = COALESCE(excluded.provider, users.provider),
          username = excluded.username,
          firstName = excluded.firstName,
          lastName = excluded.lastName,
          avatarUrl = CASE WHEN excluded.avatarUrl != '' THEN excluded.avatarUrl ELSE users.avatarUrl END,
          rating = excluded.rating,
          gamesPlayed = excluded.gamesPlayed,
          wins = excluded.wins,
          losses = excluded.losses,
          winRate = excluded.winRate,
          totalMoneyEarned = excluded.totalMoneyEarned,
          botGamesPlayed = excluded.botGamesPlayed,
          botWins = excluded.botWins,
          isGuest = excluded.isGuest,
          lastLoginAt = excluded.lastLoginAt
      `);

      this.stmtInsertGame = this.db.prepare(`
        INSERT OR REPLACE INTO games (
          id, roomId, winnerId, hasBots, isPrivate, endedAt,
          playersCount, roundsPlayed, durationSeconds, endReason, rankingsJson
        ) VALUES (
          @id, @roomId, @winnerId, @hasBots, @isPrivate, @endedAt,
          @playersCount, @roundsPlayed, @durationSeconds, @endReason, @rankingsJson
        )
      `);

      this.stmtDeleteUser = this.db.prepare(`DELETE FROM users WHERE telegramId = ?`);

      // Hook users Map delete to also delete from SQLite
      const origDelete = this.users.delete.bind(this.users);
      this.users.delete = (key) => {
        const id = String(key);
        if (this.stmtDeleteUser) {
          try { this.stmtDeleteUser.run(id); } catch (e) {}
        }
        return origDelete(id);
      };

      // 1. Populate in-memory users cache from SQLite
      const allUsers = this.db.prepare('SELECT * FROM users').all();
      allUsers.forEach(row => {
        this.users.set(String(row.telegramId), this.mapUserRowToObject(row));
      });

      // 4. Populate in-memory recent games
      const recentGames = this.db.prepare('SELECT * FROM games ORDER BY endedAt ASC LIMIT 500').all();
      this.games = recentGames.map(row => ({
        id: row.id,
        roomId: row.roomId,
        winnerId: row.winnerId,
        hasBots: Boolean(row.hasBots),
        isPrivate: Boolean(row.isPrivate),
        endedAt: row.endedAt,
        playersCount: row.playersCount,
        roundsPlayed: row.roundsPlayed,
        durationSeconds: row.durationSeconds,
        endReason: row.endReason,
        rankings: row.rankingsJson ? JSON.parse(row.rankingsJson) : []
      }));

    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }

  mapUserRowToObject(row) {
    if (!row) return null;
    const user = {
      telegramId: String(row.telegramId),
      username: row.username || '',
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      avatarUrl: row.avatarUrl || '',
      rating: row.rating !== undefined ? row.rating : 0,
      gamesPlayed: row.gamesPlayed || 0,
      wins: row.wins || 0,
      losses: row.losses || 0,
      winRate: row.winRate || 0,
      totalMoneyEarned: row.totalMoneyEarned || 0,
      botGamesPlayed: row.botGamesPlayed || 0,
      botWins: row.botWins || 0,
      createdAt: row.createdAt || Date.now(),
      lastLoginAt: row.lastLoginAt || Date.now()
    };
    if (row.yandexId) user.yandexId = row.yandexId;
    if (row.provider) user.provider = row.provider;
    if (row.isGuest) user.isGuest = true;
    return user;
  }

  persistUserToDb(user) {
    if (!user || !user.telegramId) return;
    this.stmtUpsertUser.run({
      telegramId: String(user.telegramId),
      yandexId: user.yandexId || null,
      provider: user.provider || null,
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatarUrl: user.avatarUrl || '',
      rating: user.rating !== undefined ? user.rating : 0,
      gamesPlayed: user.gamesPlayed || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
      winRate: user.winRate !== undefined ? user.winRate : (user.gamesPlayed ? Math.round((user.wins / user.gamesPlayed) * 100) : 0),
      totalMoneyEarned: user.totalMoneyEarned || 0,
      botGamesPlayed: user.botGamesPlayed || 0,
      botWins: user.botWins || 0,
      isGuest: user.isGuest ? 1 : 0,
      createdAt: user.createdAt || Date.now(),
      lastLoginAt: user.lastLoginAt || Date.now()
    });
  }

  saveUsers() {
    // SQLite persists atomically on every operation
  }

  saveGames() {
    // SQLite persists atomically on every operation
  }

  clearAllData() {
    if (this.db) {
      this.db.exec(`
        DELETE FROM users;
        DELETE FROM games;
      `);
    }
    this.users.clear();
    this.games = [];
  }

  deleteUser(telegramId) {
    const id = String(telegramId);
    this.users.delete(id);
    if (this.stmtDeleteUser) {
      this.stmtDeleteUser.run(id);
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
      if (tgData.username !== undefined) user.username = tgData.username;
      if (tgData.first_name) user.firstName = tgData.first_name;
      if (tgData.last_name !== undefined) user.lastName = tgData.last_name;
      if (tgData.photo_url) user.avatarUrl = tgData.photo_url;
      user.lastLoginAt = now;
    }

    this.persistUserToDb(user);
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

    this.persistUserToDb(user);
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
    this.persistUserToDb(user);
    this.saveUsers();
    return { ...user };
  }

  /**
   * Find or create guest user by local / web player ID
   */
  findOrCreateGuestUser(id, name) {
    if (!id) return null;
    const uid = String(id);
    let user = this.users.get(uid);
    const now = Date.now();

    if (!user) {
      user = {
        telegramId: uid,
        username: '',
        firstName: name || 'Игрок',
        lastName: '',
        avatarUrl: '',
        rating: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalMoneyEarned: 0,
        createdAt: now,
        lastLoginAt: now,
        isGuest: true
      };
      this.users.set(uid, user);
    } else {
      if (name && (!user.firstName || user.firstName === 'Игрок')) {
        user.firstName = name;
      }
      user.lastLoginAt = now;
    }

    this.persistUserToDb(user);
    this.saveUsers();
    return user;
  }

  /**
   * Record game results and update ELO rating for registered players
   * Requirements: All PVP games without bots count towards ELO rating with anti-abuse protection!
   */
  recordGameResults(rankings, winnerId, roomId, hasBots = false, matchContext = {}) {
    if (!Array.isArray(rankings) || rankings.length === 0) return [];

    const containsBots = Boolean(hasBots || rankings.some(r => r.isBot));

    // Ensure all human players exist in database first so their current ratings can be read
    rankings.forEach(rankedPlayer => {
      if (rankedPlayer.isBot) return;
      const userKey = String(rankedPlayer.telegramId || rankedPlayer.id);
      if (!userKey) return;
      if (!this.users.get(userKey)) {
        this.findOrCreateGuestUser(userKey, rankedPlayer.name);
      }
    });

    // Synthesize default context if not provided (for backward compatibility)
    const effectiveContext = {
      hasBots: containsBots,
      roundsPlayed: matchContext.roundsPlayed !== undefined ? matchContext.roundsPlayed : 5,
      turnsPlayed: matchContext.turnsPlayed !== undefined ? matchContext.turnsPlayed : 20,
      durationSeconds: matchContext.durationSeconds !== undefined ? matchContext.durationSeconds : 300,
      endReason: matchContext.endReason || 'NORMAL_WIN',
      isPrivate: Boolean(matchContext.isPrivate),
      playerIps: matchContext.playerIps || {},
      ...matchContext
    };

    // Calculate rating deltas using RatingEngine (Pairwise Elo + Anti-Abuse)
    const calculatedRatings = ratingEngine.calculateMatchRatings(rankings, effectiveContext, this.users);
    const ratingMap = new Map(calculatedRatings.map(cr => [cr.id, cr]));

    const gameRecord = {
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId: roomId || '',
      winnerId: winnerId || '',
      hasBots: containsBots,
      isPrivate: Boolean(effectiveContext.isPrivate),
      endedAt: Date.now(),
      playersCount: rankings.length,
      roundsPlayed: effectiveContext.roundsPlayed,
      durationSeconds: effectiveContext.durationSeconds,
      endReason: effectiveContext.endReason,
      rankings: rankings.map(r => {
        const ratingInfo = ratingMap.get(r.id);
        return {
          id: r.id,
          name: r.name,
          telegramId: r.telegramId || null,
          isBot: Boolean(r.isBot),
          botDifficulty: r.botDifficulty || null,
          rank: r.rank,
          isWinner: r.isWinner,
          totalCapital: r.totalCapital || r.money || 0,
          ratingDelta: ratingInfo ? ratingInfo.ratingDelta : 0,
          ratingNote: ratingInfo ? ratingInfo.note : '',
          oldRating: ratingInfo ? ratingInfo.oldRating : 0,
          newRating: ratingInfo ? ratingInfo.newRating : 0
        };
      })
    };

    // Transactionally persist game and update users in SQLite
    const recordTransaction = this.db.transaction(() => {
      // 1. Insert game record
      this.stmtInsertGame.run({
        id: gameRecord.id,
        roomId: gameRecord.roomId,
        winnerId: gameRecord.winnerId,
        hasBots: gameRecord.hasBots ? 1 : 0,
        isPrivate: gameRecord.isPrivate ? 1 : 0,
        endedAt: gameRecord.endedAt,
        playersCount: gameRecord.playersCount,
        roundsPlayed: gameRecord.roundsPlayed,
        durationSeconds: gameRecord.durationSeconds,
        endReason: gameRecord.endReason,
        rankingsJson: JSON.stringify(gameRecord.rankings)
      });

      // 2. Update player statistics
      rankings.forEach(rankedPlayer => {
        if (rankedPlayer.isBot) return; // Strictly skip bots from rating

        const userKey = String(rankedPlayer.telegramId || rankedPlayer.id);
        if (!userKey) return;

        let user = this.users.get(userKey);
        if (!user) {
          user = this.findOrCreateGuestUser(userKey, rankedPlayer.name);
        }
        if (!user) return;

        if (containsBots) {
          user.botGamesPlayed = (user.botGamesPlayed || 0) + 1;
          if (rankedPlayer.isWinner) {
            user.botWins = (user.botWins || 0) + 1;
          }
        } else {
          user.gamesPlayed = (user.gamesPlayed || 0) + 1;
          const capital = Math.max(0, rankedPlayer.totalCapital || rankedPlayer.money || 0);
          user.totalMoneyEarned = (user.totalMoneyEarned || 0) + capital;

          if (rankedPlayer.isWinner) {
            user.wins = (user.wins || 0) + 1;
          } else {
            user.losses = (user.losses || 0) + 1;
          }

          user.winRate = Math.round((user.wins / user.gamesPlayed) * 100);

          const ratingInfo = ratingMap.get(rankedPlayer.id);
          if (ratingInfo) {
            user.rating = ratingInfo.newRating;
          }
        }

        this.persistUserToDb(user);
      });
    });

    recordTransaction();

    this.games.push(gameRecord);
    this.saveGames();
    this.saveUsers();

    return calculatedRatings;
  }

  /**
   * Check if user is an authorized account (Telegram or Yandex)
   */
  isAuthorizedUser(u) {
    if (!u) return false;
    if (u.isGuest) return false;
    const key = String(u.telegramId || u.yandexId || '');
    if (!key) return false;
    if (key.startsWith('p_') || key.startsWith('player_') || key.startsWith('guest_')) {
      return false;
    }
    return Boolean(u.provider === 'yandex' || u.yandexId || u.telegramId);
  }

  /**
   * Get Top-N players for leaderboard (strictly authorized players only)
   */
  getLeaderboard(limit = 20) {
    try {
      const rows = this.db.prepare(`
        SELECT * FROM users
        WHERE isGuest = 0
          AND (provider = 'yandex' OR yandexId IS NOT NULL OR (telegramId NOT LIKE 'p_%' AND telegramId NOT LIKE 'player_%' AND telegramId NOT LIKE 'guest_%'))
        ORDER BY rating DESC, wins DESC
        LIMIT ?
      `).all(limit);

      return rows.map(u => ({
        telegramId: u.telegramId,
        username: u.username || null,
        displayName: (u.firstName || '') + (u.lastName ? ` ${u.lastName}` : ''),
        avatarUrl: u.avatarUrl || null,
        rating: u.rating !== undefined ? u.rating : 0,
        wins: u.wins || 0,
        gamesPlayed: u.gamesPlayed || 0,
        winRate: u.winRate || (u.gamesPlayed ? Math.round((u.wins / u.gamesPlayed) * 100) : 0),
        totalMoneyEarned: u.totalMoneyEarned || 0,
        provider: u.provider || (u.yandexId ? 'yandex' : 'telegram')
      }));
    } catch (err) {
      console.error('[Database] getLeaderboard query error:', err);
      return Array.from(this.users.values())
        .filter(u => this.isAuthorizedUser(u))
        .sort((a, b) => (b.rating !== a.rating ? b.rating - a.rating : (b.wins || 0) - (a.wins || 0)))
        .slice(0, limit)
        .map(u => ({
          telegramId: u.telegramId,
          username: u.username || null,
          displayName: (u.firstName || '') + (u.lastName ? ` ${u.lastName}` : ''),
          avatarUrl: u.avatarUrl || null,
          rating: u.rating !== undefined ? u.rating : 0,
          wins: u.wins || 0,
          gamesPlayed: u.gamesPlayed || 0,
          winRate: u.winRate || (u.gamesPlayed ? Math.round((u.wins / u.gamesPlayed) * 100) : 0),
          totalMoneyEarned: u.totalMoneyEarned || 0,
          provider: u.provider || (u.yandexId ? 'yandex' : 'telegram')
        }));
    }
  }

  /**
   * Close SQLite connection (for graceful shutdown or tests)
   */
  close() {
    if (this.db) {
      try {
        this.db.close();
      } catch (err) {}
    }
  }
}

module.exports = new Database();
