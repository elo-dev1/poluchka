/**
 * Comprehensive Russian & English Profanity Filter
 * Designed specifically for multiplayer game chat with homoglyph & evasion normalization,
 * false-positive protection (e.g., "колебания", "употреблять", "оскорблять", "рубли", "команда"),
 * and leetspeak de-obfuscation.
 */

const HOMOGLYPHS = {
  'a': 'а', '@': 'а',
  'b': 'в', '6': 'б',
  'c': 'с', 's': 'с', '$': 'с',
  'd': 'д',
  'e': 'е', 'ё': 'е', '3': 'з',
  'g': 'г',
  'h': 'н',
  'i': 'и', '1': 'и', '!': 'и', '|': 'и', 'j': 'й',
  'k': 'к',
  'l': 'л',
  'm': 'м',
  'n': 'п',
  'o': 'о', '0': 'о',
  'p': 'р',
  'r': 'р',
  't': 'т', '7': 'т',
  'u': 'у', 'y': 'у',
  'v': 'в',
  'w': 'ш',
  'x': 'х',
  'z': 'з',
  '4': 'ч'
};

// Words that contain letter combinations that look like profanity roots but are legitimate Russian words
const SAFE_WORDS = [
  'колеб', 'стеб', 'потреб', 'оскорб', 'тереб', 'греб', 'судеб', 'хлеб', 'лебед',
  'ребя', 'ребе', 'серебр', 'люб', 'скреб', 'хреб', 'щеб', 'дебет', 'дебют', 'зебр',
  'требу', 'учеб', 'ущерб', 'лечеб', 'рубеж', 'сугроб', 'грабе', 'пробе', 'перебе',
  'бляха', 'бляшк', 'сабл', 'оглобл', 'рубл', 'влюбл',
  'мудр',
  'барсук', 'сукн', 'сучок', 'сучь', 'посуд',
  'скипидар',
  'мандарин', 'мандат', 'команд', 'рекоменд', 'эмансип',
  'хулиган', 'хула',
  'дрозд', 'дрожж'
];

// English and common transliterated roots
const ENGLISH_AND_TRANSLIT_PATTERN = /(?:^|[^a-z0-9])(?:(?:fuck|fucking|fucker|fck|bitch|cunt|dick|dickhead|asshole|pussy|bastard|nigger|nigga|whore|slut)|(?:hu[ijy]|xy[iju]|xui|xyu|xuy|pizd|eb[alou]|eble|blya[td]?|mudak|suka|pidor|gandon|shlyuh)[a-z0-9]*)(?=[^a-z0-9]|$)/i;

// Regex patterns for Cyrillic profanity roots
const CYRILLIC_PROFANITY_PATTERNS = [
  // ХУЙ (хуй, хуя, хуе, хуё, хую, хуем, хуи, хуев, нахуй, похуй, охуеть, хуйня, etc.)
  /(?:^|[^а-яa-z0-9])(?:(?:по|на|от|до|за|не|вы|с|при|пере|о|об|под|ни)?ху[еёийяю][а-я0-9]*|ху[йиеёяю][а-я0-9]*)(?=[^а-яa-z0-9]|$)/i,

  // ПИЗДА (пизда, пиздец, пизди, пиздюк, спиздить, распиздяй, пиздатый, etc.)
  /(?:^|[^а-яa-z0-9])[а-я0-9]*п[иеё]зд[а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // ЕБ / ЁБ (ебать, ебу, ебет, ебан, еблан, ебло, ебучий, заебать, выебать, наебать, etc.)
  /(?:^|[^а-яa-z0-9])[а-я0-9]*(?:[её]б[аеёиоуыэюя]|[её]бн|ебл|ёбл|еб[уу])[а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // БЛЯДЬ / БЛЯ (блядь, блядина, блядский, бля, блять)
  /(?:^|[^а-яa-z0-9])(?:[а-я0-9]*бл[яеё]д[а-я0-9]*|бл[я]+[тд]*ь?)(?=[^а-яa-z0-9]|$)/i,

  // МУДАК (мудак, мудила, мудозвон, мудень)
  /(?:^|[^а-яa-z0-9])[а-я0-9]*муд[аиео][кчлз][а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // СУКА (сука, сучка, сучара, ссука)
  /(?:^|[^а-яa-z0-9])с[у]+к[аеиоу][чк]*[а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // ПИДОР (пидор, пидорас, пидарас, педик, пидрила)
  /(?:^|[^а-яa-z0-9])(?:п[иеё]д[аое]р[а-я0-9]*|п[иеё]д[ие]к[а-я0-9]*|п[иеё]др[а-я0-9]*)(?=[^а-яa-z0-9]|$)/i,

  // ГОНДОН (гондон, гандон)
  /(?:^|[^а-яa-z0-9])г[ао]нд[оа]н[а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // ШЛЮХА (шлюха, шлюхи, шлюховатый)
  /(?:^|[^а-яa-z0-9])шл[ю]х[а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // ЗАЛУПА (залупа, залупился)
  /(?:^|[^а-яa-z0-9])[а-я0-9]*з[ао]луп[а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // МАНДА (манда, манде, манду, мандавошка)
  /(?:^|[^а-яa-z0-9])м[ао]нд[аеиуой][а-я0-9]*(?=[^а-яa-z0-9]|$)/i,

  // ДРОЧ (дрочить, дрочила, подрочить)
  /(?:^|[^а-яa-z0-9])[а-я0-9]*др[оа]ч[а-я0-9]*(?=[^а-яa-z0-9]|$)/i
];

class ProfanityFilter {
  /**
   * Check if a token/word matches any profanity pattern
   */
  isProfaneToken(rawToken) {
    if (!rawToken || rawToken.trim().length < 2) return false;

    // Remove internal dots, dashes, underscores, spaces, or asterisks (e.g. "п.и.з.д.е.ц", "х_у_й", "с*у*к*а")
    const stripped = rawToken.replace(/[\.\-_\* \t\+]/g, '').toLowerCase();

    // 1. Check English and Latin translit on raw stripped token
    if (ENGLISH_AND_TRANSLIT_PATTERN.test(' ' + stripped + ' ')) {
      return true;
    }

    // 2. Homoglyph mapping to Cyrillic
    let mapped = '';
    for (let i = 0; i < stripped.length; i++) {
      const ch = stripped[i];
      mapped += HOMOGLYPHS[ch] || ch;
    }

    // Collapse runs of repeating characters (e.g. "хххуууййй" -> "хуй", "ееебббааать" -> "ебать")
    const collapsed = mapped.replace(/(.)\1+/g, '$1');

    // Check safe words whitelist
    for (const safe of SAFE_WORDS) {
      if (collapsed.includes(safe)) {
        return false;
      }
    }

    // Check Cyrillic patterns
    const padded = ` ${collapsed} `;
    for (const pattern of CYRILLIC_PROFANITY_PATTERNS) {
      if (pattern.test(padded)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether the given text contains any profanity
   * @param {string} text 
   * @returns {boolean}
   */
  hasProfanity(text) {
    if (!text || typeof text !== 'string') return false;

    // Check individual space/punctuation-separated words
    const words = text.split(/[\s,!?.;:()"«»'<>\[\]{}|\/\\]+/);
    for (const word of words) {
      if (this.isProfaneToken(word)) {
        return true;
      }
    }

    // Check collapsed multi-word sequences (e.g. "п о ш е л   н а х у й")
    const collapsed = text.replace(/[^a-zA-Zа-яА-Я0-9]/g, '');
    if (collapsed.length >= 3 && this.isProfaneToken(collapsed)) {
      return true;
    }

    return false;
  }

  /**
   * Replaces profane words with asterisks while preserving surrounding punctuation
   * @param {string} text 
   * @param {string} replacement Default: '***'
   * @returns {string}
   */
  censor(text, replacement = '***') {
    if (!text || typeof text !== 'string') return '';

    // Split into tokens preserving delimiters
    const tokens = text.split(/([\s,!?.;:()"«»'<>\[\]{}|\/\\]+)/);

    const censoredTokens = tokens.map(token => {
      // Delimiters remain as is
      if (!token || /^[\s,!?.;:()"«»'<>\[\]{}|\/\\]+$/.test(token)) {
        return token;
      }

      if (this.isProfaneToken(token)) {
        return replacement;
      }

      return token;
    });

    let result = censoredTokens.join('');

    // Handle stealth spacing evasion across multiple tokens (e.g. "х у й", "п и з д а")
    const collapsedLettersOnly = text.replace(/[^a-zA-Zа-яА-Я0-9]/g, '');
    if (this.isProfaneToken(collapsedLettersOnly)) {
      // If the collapsed string is profane and short, censor the whole text
      if (collapsedLettersOnly.length <= 12) {
        return replacement;
      }
    }

    return result;
  }
}

module.exports = new ProfanityFilter();
