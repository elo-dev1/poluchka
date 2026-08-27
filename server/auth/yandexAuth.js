const https = require('https');
const crypto = require('crypto');
const database = require('../db/Database');

class YandexAuth {
  constructor() {
    this.clientId = process.env.YANDEX_CLIENT_ID || process.env.VITE_YANDEX_CLIENT_ID || '';
    this.clientSecret = process.env.YANDEX_CLIENT_SECRET || '';
  }

  /**
   * Authenticate via Yandex OAuth Token or direct payload
   */
  async authenticateUser(authData) {
    if (!authData) {
      return { success: false, error: 'Данные Яндекс ID отсутствуют' };
    }

    // 1. Direct or dev payload
    if (authData.isDirect || authData.isDemo || !authData.token) {
      const cleanLogin = authData.login ? authData.login.trim() : (authData.username || 'yandex_user');
      const cleanName = authData.display_name || authData.first_name || cleanLogin;
      const yandexId = authData.id || `ya_${cleanLogin.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

      const verified = {
        id: yandexId,
        login: cleanLogin,
        first_name: cleanName,
        avatar_url: authData.avatar_url || ''
      };

      const user = database.findOrCreateYandexUser(verified);
      return {
        success: true,
        user,
        token: this.generateSessionToken(user.telegramId)
      };
    }

    // 2. Official Yandex OAuth Token verification via login.yandex.ru/info
    try {
      const userInfo = await this.fetchYandexUserInfo(authData.token);
      if (!userInfo || !userInfo.id) {
        return { success: false, error: 'Не удалось подтвердить токен Яндекс ID' };
      }

      const avatarUrl = userInfo.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
        : '';

      const verified = {
        id: `ya_${userInfo.id}`,
        login: userInfo.login || '',
        first_name: userInfo.display_name || userInfo.first_name || userInfo.login || 'Игрок',
        last_name: userInfo.last_name || '',
        avatar_url: avatarUrl
      };

      const user = database.findOrCreateYandexUser(verified);
      return {
        success: true,
        user,
        token: this.generateSessionToken(user.telegramId)
      };
    } catch (err) {
      console.error('Yandex Auth error:', err);
      return { success: false, error: 'Ошибка верификации Яндекс ID: ' + err.message };
    }
  }

  fetchYandexUserInfo(token) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'login.yandex.ru',
        path: '/info?format=json',
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`
        }
      };

      const req = https.request(options, res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(new Error('Некорректный ответ от Яндекс API'));
          }
        });
      });

      req.on('error', err => reject(err));
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Таймаут запроса к Яндекс ID'));
      });
      req.end();
    });
  }

  generateSessionToken(userId) {
    const secret = process.env.SESSION_SECRET || 'monopoly-session-secret-2026';
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(8).toString('hex');
    const payload = `${userId}:${timestamp}:${nonce}`;
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

module.exports = new YandexAuth();
