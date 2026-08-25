const crypto = require('crypto');
const database = require('../db/Database');

class TelegramAuth {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  setBotToken(token) {
    this.botToken = token;
  }

  /**
   * Verify Telegram Login Widget authentication data
   * @param {Object} authData { id, first_name, last_name, username, photo_url, auth_date, hash }
   * @returns {Object|null} Verified user data or null
   */
  verifyWidgetAuth(authData) {
    if (!authData || !authData.id) return null;

    // 1. Direct login & dev support (when hash is not provided or bot token is empty)
    if (authData.isDirect || authData.isDemo || !this.botToken || this.botToken === 'demo' || !authData.hash) {
      const cleanUsername = authData.username ? authData.username.trim().replace(/^@/, '') : '';
      const cleanName = authData.first_name ? authData.first_name.trim() : (cleanUsername || 'Игрок');
      const tgId = authData.id
        ? String(authData.id)
        : `tg_${(cleanUsername || cleanName || 'player').toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

      return {
        id: tgId,
        first_name: cleanName,
        last_name: authData.last_name || '',
        username: cleanUsername,
        photo_url: authData.photo_url || '',
        auth_date: Math.floor(Date.now() / 1000)
      };
    }

    // 2. Production Cryptographic HMAC-SHA256 Verification
    try {
      const { hash, ...dataToCheck } = authData;
      if (!hash) return null;

      // Check auth date freshness (within 24 hours)
      const authTimestamp = Number(dataToCheck.auth_date);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (!authTimestamp || (currentTimestamp - authTimestamp) > 86400) {
        console.warn('Telegram auth expired');
        return null;
      }

      // Prepare data-check-string (sorted alphabetically)
      const dataCheckArr = Object.keys(dataToCheck)
        .filter(key => dataToCheck[key] !== undefined && dataToCheck[key] !== null)
        .sort()
        .map(key => `${key}=${dataToCheck[key]}`);
      const dataCheckString = dataCheckArr.join('\n');

      // secret_key = SHA256(bot_token)
      const secretKey = crypto.createHash('sha256').update(this.botToken).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (calculatedHash.toLowerCase() !== String(hash).toLowerCase()) {
        console.warn('Invalid Telegram hash signature');
        return null;
      }

      return {
        id: String(dataToCheck.id),
        first_name: dataToCheck.first_name || '',
        last_name: dataToCheck.last_name || '',
        username: dataToCheck.username || '',
        photo_url: dataToCheck.photo_url || '',
        auth_date: authTimestamp
      };
    } catch (err) {
      console.error('Error verifying Telegram auth data:', err);
      return null;
    }
  }

  /**
   * Verify Telegram Web App initData string
   * @param {string} initData Raw initData query string
   */
  verifyWebAppAuth(initData) {
    if (!initData) return null;
    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      if (!hash) return null;

      params.delete('hash');
      const dataCheckArr = [];
      params.sort();
      for (const [key, value] of params.entries()) {
        dataCheckArr.push(`${key}=${value}`);
      }
      const dataCheckString = dataCheckArr.join('\n');

      if (!this.botToken || this.botToken === 'demo') {
        const userStr = params.get('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          return {
            id: String(userObj.id),
            first_name: userObj.first_name || '',
            last_name: userObj.last_name || '',
            username: userObj.username || '',
            photo_url: userObj.photo_url || ''
          };
        }
        return null;
      }

      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(this.botToken).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
        return null;
      }

      const userStr = params.get('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return {
          id: String(userObj.id),
          first_name: userObj.first_name || '',
          last_name: userObj.last_name || '',
          username: userObj.username || '',
          photo_url: userObj.photo_url || ''
        };
      }
      return null;
    } catch (err) {
      console.error('Error verifying Telegram WebApp auth:', err);
      return null;
    }
  }

  /**
   * Process and authenticate a Telegram login request
   */
  authenticateUser(authData) {
    let verified = null;

    if (typeof authData === 'string') {
      verified = this.verifyWebAppAuth(authData);
    } else {
      verified = this.verifyWidgetAuth(authData);
    }

    if (!verified || !verified.id) {
      return { success: false, error: 'Не удалось подтвердить данные Telegram' };
    }

    const user = database.findOrCreateTelegramUser(verified);
    return {
      success: true,
      user,
      token: this.generateSessionToken(user.telegramId)
    };
  }

  generateSessionToken(telegramId) {
    const secret = process.env.SESSION_SECRET || 'monopoly-session-secret-2026';
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(8).toString('hex');
    const payload = `${telegramId}:${timestamp}:${nonce}`;
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return Buffer.from(`${payload}:${sig}`).toString('base64');
  }

  verifySessionToken(token) {
    if (!token) return null;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 4) return null;
      const [userId, timestamp, nonce, sig] = parts;
      const secret = process.env.SESSION_SECRET || 'monopoly-session-secret-2026';
      const expectedSig = crypto.createHmac('sha256', secret).update(`${userId}:${timestamp}:${nonce}`).digest('hex');
      if (expectedSig !== sig) return null;
      if (Date.now() - Number(timestamp) > 7 * 24 * 60 * 60 * 1000) return null;
      return userId;
    } catch {
      return null;
    }
  }
}

module.exports = new TelegramAuth();
