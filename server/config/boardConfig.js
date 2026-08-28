/**
 * Board configuration for Monopoly:
 * 1. Standard 40-tile layout (28 property assets: 22 street properties in 8 color groups, 4 transport hubs, 2 utilities)
 * 2. Blitz 24-tile layout (14 property assets in 7 color groups)
 */

const BOARD_TILES_40 = [
  // --- BOTTOM ROW (Tiles 0 to 10) ---
  {
    id: 0,
    name: 'СТАРТ',
    type: 'start',
    description: 'Получите +$200 при прохождении',
    bonus: 200,
    icon: '🚀'
  },
  {
    id: 1,
    name: 'GitHub',
    type: 'property',
    group: 'brown',
    groupName: 'Разработка & IT',
    color: '#8D6E63',
    price: 60,
    housePrice: 50,
    mortgageValue: 30,
    rents: [10, 30, 90, 270, 400, 550],
    icon: '🐙',
    iconUrl: '/assets/tiles/github_64px.png'
  },
  {
    id: 2,
    name: 'Казна',
    type: 'chest',
    description: 'Тяните карту городской казны',
    icon: '🎁',
    iconUrl: '/assets/tiles/chest_64px.png'
  },
  {
    id: 3,
    name: 'VS Code',
    type: 'property',
    group: 'brown',
    groupName: 'Разработка & IT',
    color: '#8D6E63',
    price: 80,
    housePrice: 50,
    mortgageValue: 40,
    rents: [14, 40, 120, 360, 500, 650],
    icon: '💻',
    iconUrl: '/assets/tiles/visual_studio_code_64px.png'
  },
  {
    id: 4,
    name: 'Подоходный налог',
    type: 'tax',
    amount: 200,
    description: 'Заплатите $200 налога в казну',
    icon: '💸'
  },
  {
    id: 5,
    name: 'Uber',
    type: 'property',
    group: 'transport',
    groupName: 'Транспортная сеть',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚗',
    iconUrl: '/assets/tiles/uber_64px.png'
  },
  {
    id: 6,
    name: 'Telegram',
    type: 'property',
    group: 'lightblue',
    groupName: 'Мессенджеры & Связь',
    color: '#29B6F6',
    price: 100,
    housePrice: 50,
    mortgageValue: 50,
    rents: [18, 50, 150, 450, 625, 750],
    icon: '✈️',
    iconUrl: '/assets/tiles/telegram_64px.png'
  },
  {
    id: 7,
    name: 'Шанс',
    type: 'chance',
    description: 'Тяните карту удачи',
    icon: '❓',
    iconUrl: '/assets/tiles/chance_64px.png'
  },
  {
    id: 8,
    name: 'Zoom',
    type: 'property',
    group: 'lightblue',
    groupName: 'Мессенджеры & Связь',
    color: '#29B6F6',
    price: 100,
    housePrice: 50,
    mortgageValue: 50,
    rents: [18, 50, 150, 450, 625, 750],
    icon: '📹',
    iconUrl: '/assets/tiles/zoom_64px.png'
  },
  {
    id: 9,
    name: 'Snapchat',
    type: 'property',
    group: 'lightblue',
    groupName: 'Мессенджеры & Связь',
    color: '#29B6F6',
    price: 120,
    housePrice: 50,
    mortgageValue: 60,
    rents: [22, 60, 180, 500, 700, 900],
    icon: '👻',
    iconUrl: '/assets/tiles/snapchat_64px.png'
  },
  {
    id: 10,
    name: 'Тюрьма',
    type: 'jail',
    description: 'Просто посещение / Отбывание наказания',
    icon: '⛓️',
    iconUrl: '/assets/tiles/jail_64px.png'
  },

  // --- RIGHT ROW (Tiles 11 to 20) ---
  {
    id: 11,
    name: 'Spotify',
    type: 'property',
    group: 'pink',
    groupName: 'Медиа & Музыка',
    color: '#EC407A',
    price: 140,
    housePrice: 100,
    mortgageValue: 70,
    rents: [26, 70, 200, 550, 750, 950],
    icon: '🎵',
    iconUrl: '/assets/tiles/spotify_64px.png'
  },
  {
    id: 12,
    name: 'WinRAR',
    type: 'property',
    group: 'utility',
    groupName: 'Коммунальные сервисы',
    color: '#8D6E63',
    price: 150,
    mortgageValue: 75,
    rents: [20, 60, 120, 240],
    icon: '📚',
    iconUrl: '/assets/tiles/winrar_64px.png'
  },
  {
    id: 13,
    name: 'TikTok',
    type: 'property',
    group: 'pink',
    groupName: 'Медиа & Музыка',
    color: '#EC407A',
    price: 140,
    housePrice: 100,
    mortgageValue: 70,
    rents: [26, 70, 200, 550, 750, 950],
    icon: '📱',
    iconUrl: '/assets/tiles/tiktok_64px.png'
  },
  {
    id: 14,
    name: 'Pinterest',
    type: 'property',
    group: 'pink',
    groupName: 'Медиа & Музыка',
    color: '#EC407A',
    price: 160,
    housePrice: 100,
    mortgageValue: 80,
    rents: [30, 80, 220, 600, 800, 1000],
    icon: '📌',
    iconUrl: '/assets/tiles/pinterest_64px.png'
  },
  {
    id: 15,
    name: 'Bolt',
    type: 'property',
    group: 'transport',
    groupName: 'Транспортная сеть',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '⚡',
    iconUrl: '/assets/tiles/bolt_64px.png'
  },
  {
    id: 16,
    name: 'YouTube',
    type: 'property',
    group: 'orange',
    groupName: 'Видео & Стриминг',
    color: '#FFA726',
    price: 180,
    housePrice: 100,
    mortgageValue: 90,
    rents: [34, 90, 250, 700, 875, 1050],
    icon: '▶️',
    iconUrl: '/assets/tiles/youtube_64px.png'
  },
  {
    id: 17,
    name: 'Казна',
    type: 'chest',
    description: 'Тяните карту городской казны',
    icon: '🎁',
    iconUrl: '/assets/tiles/chest_64px.png'
  },
  {
    id: 18,
    name: 'Netflix',
    type: 'property',
    group: 'orange',
    groupName: 'Видео & Стриминг',
    color: '#FFA726',
    price: 180,
    housePrice: 100,
    mortgageValue: 90,
    rents: [34, 90, 250, 700, 875, 1050],
    icon: '🎬',
    iconUrl: '/assets/tiles/netflix_64px.png'
  },
  {
    id: 19,
    name: 'Twitch',
    type: 'property',
    group: 'orange',
    groupName: 'Видео & Стриминг',
    color: '#FFA726',
    price: 200,
    housePrice: 100,
    mortgageValue: 100,
    rents: [38, 100, 300, 750, 925, 1100],
    icon: '🟣',
    iconUrl: '/assets/tiles/twitch_64px.png'
  },
  {
    id: 20,
    name: 'Парковка',
    type: 'free_parking',
    description: 'Бесплатная стоянка и отдых',
    icon: '🅿️',
    iconUrl: '/assets/tiles/free_parking_64px.png'
  },

  // --- TOP ROW (Tiles 21 to 30) ---
  {
    id: 21,
    name: 'Steam',
    type: 'property',
    group: 'red',
    groupName: 'Игровые платформы',
    color: '#EF5350',
    price: 220,
    housePrice: 150,
    mortgageValue: 110,
    rents: [42, 110, 330, 800, 975, 1150],
    icon: '🎮',
    iconUrl: '/assets/tiles/steam_64px.png'
  },
  {
    id: 22,
    name: 'Шанс',
    type: 'chance',
    description: 'Тяните карту удачи',
    icon: '❓',
    iconUrl: '/assets/tiles/chance_64px.png'
  },
  {
    id: 23,
    name: 'PlayStation',
    type: 'property',
    group: 'red',
    groupName: 'Игровые платформы',
    color: '#EF5350',
    price: 220,
    housePrice: 150,
    mortgageValue: 110,
    rents: [42, 110, 330, 800, 975, 1150],
    icon: '🕹️',
    iconUrl: '/assets/tiles/playstation_modern_64px.png'
  },
  {
    id: 24,
    name: 'Xbox',
    type: 'property',
    group: 'red',
    groupName: 'Игровые платформы',
    color: '#EF5350',
    price: 240,
    housePrice: 150,
    mortgageValue: 120,
    rents: [46, 120, 360, 850, 1025, 1200],
    icon: '❎',
    iconUrl: '/assets/tiles/xbox_64px.png'
  },
  {
    id: 25,
    name: 'Lyft',
    type: 'property',
    group: 'transport',
    groupName: 'Транспортная сеть',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚕',
    iconUrl: '/assets/tiles/lyft_64px.png'
  },
  {
    id: 26,
    name: 'Amazon',
    type: 'property',
    group: 'yellow',
    groupName: 'E-commerce & Маркетплейсы',
    color: '#FDD835',
    price: 260,
    housePrice: 150,
    mortgageValue: 130,
    rents: [50, 130, 390, 900, 1100, 1275],
    icon: '📦',
    iconUrl: '/assets/tiles/amazon_shopping_64px.png'
  },
  {
    id: 27,
    name: 'AliExpress',
    type: 'property',
    group: 'yellow',
    groupName: 'E-commerce & Маркетплейсы',
    color: '#FDD835',
    price: 260,
    housePrice: 150,
    mortgageValue: 130,
    rents: [50, 130, 390, 900, 1100, 1275],
    icon: '🛍️',
    iconUrl: '/assets/tiles/aliexpress_64px.png'
  },
  {
    id: 28,
    name: 'Speedtest',
    type: 'property',
    group: 'utility',
    groupName: 'Коммунальные сервисы',
    color: '#8D6E63',
    price: 150,
    mortgageValue: 75,
    rents: [20, 60, 120, 240],
    icon: '⚡',
    iconUrl: '/assets/tiles/speedtest_by_ookla_64px.png'
  },
  {
    id: 29,
    name: 'Etsy',
    type: 'property',
    group: 'yellow',
    groupName: 'E-commerce & Маркетплейсы',
    color: '#FDD835',
    price: 280,
    housePrice: 150,
    mortgageValue: 140,
    rents: [55, 140, 420, 950, 1150, 1350],
    icon: '🎨',
    iconUrl: '/assets/tiles/etsy_64px.png'
  },
  {
    id: 30,
    name: 'Арест',
    type: 'go_to_jail',
    targetJailIndex: 10,
    description: 'Отправляйтесь в тюрьму!',
    icon: '👮',
    iconUrl: '/assets/tiles/police_64px.png'
  },

  // --- LEFT ROW (Tiles 31 to 39) ---
  {
    id: 31,
    name: 'Nike',
    type: 'property',
    group: 'green',
    groupName: 'Мировые бренды',
    color: '#66BB6A',
    price: 300,
    housePrice: 200,
    mortgageValue: 150,
    rents: [60, 150, 450, 1000, 1200, 1400],
    icon: '✔️',
    iconUrl: '/assets/tiles/nike_64px.png'
  },
  {
    id: 32,
    name: 'Adidas',
    type: 'property',
    group: 'green',
    groupName: 'Мировые бренды',
    color: '#66BB6A',
    price: 300,
    housePrice: 200,
    mortgageValue: 150,
    rents: [60, 150, 450, 1000, 1200, 1400],
    icon: '👟',
    iconUrl: '/assets/tiles/adidas_64px.png'
  },
  {
    id: 33,
    name: 'Казна',
    type: 'chest',
    description: 'Тяните карту городской казны',
    icon: '🎁',
    iconUrl: '/assets/tiles/chest_64px.png'
  },
  {
    id: 34,
    name: "McDonald's",
    type: 'property',
    group: 'green',
    groupName: 'Мировые бренды',
    color: '#66BB6A',
    price: 320,
    housePrice: 200,
    mortgageValue: 160,
    rents: [65, 170, 500, 1100, 1300, 1500],
    icon: '🍔',
    iconUrl: '/assets/tiles/mcdonalds_64px.png'
  },
  {
    id: 35,
    name: 'Gett',
    type: 'property',
    group: 'transport',
    groupName: 'Транспортная сеть',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚖',
    iconUrl: '/assets/tiles/gett_64px.png'
  },
  {
    id: 36,
    name: 'Шанс',
    type: 'chance',
    description: 'Тяните карту удачи',
    icon: '❓',
    iconUrl: '/assets/tiles/chance_64px.png'
  },
  {
    id: 37,
    name: 'ChatGPT',
    type: 'property',
    group: 'darkblue',
    groupName: 'AI & Технологии',
    color: '#5C6BC0',
    price: 350,
    housePrice: 200,
    mortgageValue: 175,
    rents: [70, 175, 500, 1100, 1300, 1500],
    icon: '🤖',
    iconUrl: '/assets/tiles/chatgpt_64px.png'
  },
  {
    id: 38,
    name: 'Сверхналог',
    type: 'tax',
    amount: 100,
    description: 'Заплатите $100 налога в казну',
    icon: '💸'
  },
  {
    id: 39,
    name: 'Claude',
    type: 'property',
    group: 'darkblue',
    groupName: 'AI & Технологии',
    color: '#5C6BC0',
    price: 400,
    housePrice: 200,
    mortgageValue: 200,
    rents: [85, 200, 600, 1400, 1700, 2400],
    icon: '🧠',
    iconUrl: '/assets/tiles/claude_64px.png'
  }
];

const BOARD_TILES_24 = [
  {
    id: 0,
    name: 'СТАРТ',
    type: 'start',
    description: 'Получите +$200 при прохождении',
    bonus: 200,
    icon: '🚀'
  },
  {
    id: 1,
    name: 'GitHub',
    type: 'property',
    group: 'brown',
    groupName: 'Разработка & IT',
    color: '#8D6E63',
    price: 60,
    housePrice: 50,
    mortgageValue: 30,
    rents: [10, 30, 90, 270, 400, 550],
    icon: '🐙',
    iconUrl: '/assets/tiles/github_64px.png'
  },
  {
    id: 2,
    name: 'Шанс',
    type: 'chance',
    description: 'Тяните карту удачи',
    icon: '❓',
    iconUrl: '/assets/tiles/chance_64px.png'
  },
  {
    id: 3,
    name: 'VS Code',
    type: 'property',
    group: 'brown',
    groupName: 'Разработка & IT',
    color: '#8D6E63',
    price: 80,
    housePrice: 50,
    mortgageValue: 40,
    rents: [14, 40, 120, 360, 500, 650],
    icon: '💻',
    iconUrl: '/assets/tiles/visual_studio_code_64px.png'
  },
  {
    id: 4,
    name: 'Городской налог',
    type: 'tax',
    amount: 100,
    description: 'Заплатите $100 налога в казну',
    icon: '💸'
  },
  {
    id: 5,
    name: 'Telegram',
    type: 'property',
    group: 'lightblue',
    groupName: 'Мессенджеры',
    color: '#29B6F6',
    price: 100,
    housePrice: 50,
    mortgageValue: 50,
    rents: [18, 50, 150, 450, 625, 750],
    icon: '✈️',
    iconUrl: '/assets/tiles/telegram_64px.png'
  },
  {
    id: 6,
    name: 'Тюрьма',
    type: 'jail',
    description: 'Просто посещение / Отбывание наказания',
    icon: '⛓️',
    iconUrl: '/assets/tiles/jail_64px.png'
  },
  {
    id: 7,
    name: 'Zoom',
    type: 'property',
    group: 'lightblue',
    groupName: 'Мессенджеры',
    color: '#29B6F6',
    price: 120,
    housePrice: 50,
    mortgageValue: 60,
    rents: [22, 60, 180, 500, 700, 900],
    icon: '📹',
    iconUrl: '/assets/tiles/zoom_64px.png'
  },
  {
    id: 8,
    name: 'Казна',
    type: 'chest',
    description: 'Тяните карту городской казны',
    icon: '🎁',
    iconUrl: '/assets/tiles/chest_64px.png'
  },
  {
    id: 9,
    name: 'Spotify',
    type: 'property',
    group: 'pink',
    groupName: 'Медиа & Музыка',
    color: '#EC407A',
    price: 140,
    housePrice: 100,
    mortgageValue: 70,
    rents: [26, 70, 200, 550, 750, 950],
    icon: '🎵',
    iconUrl: '/assets/tiles/spotify_64px.png'
  },
  {
    id: 10,
    name: 'TikTok',
    type: 'property',
    group: 'pink',
    groupName: 'Медиа & Музыка',
    color: '#EC407A',
    price: 160,
    housePrice: 100,
    mortgageValue: 80,
    rents: [30, 80, 220, 600, 800, 1000],
    icon: '📱',
    iconUrl: '/assets/tiles/tiktok_64px.png'
  },
  {
    id: 11,
    name: 'YouTube',
    type: 'property',
    group: 'orange',
    groupName: 'Видео & Стриминг',
    color: '#FFA726',
    price: 180,
    housePrice: 100,
    mortgageValue: 90,
    rents: [34, 90, 250, 700, 875, 1050],
    icon: '▶️',
    iconUrl: '/assets/tiles/youtube_64px.png'
  },
  {
    id: 12,
    name: 'Парковка',
    type: 'free_parking',
    description: 'Бесплатная стоянка и отдых',
    icon: '🅿️',
    iconUrl: '/assets/tiles/free_parking_64px.png'
  },
  {
    id: 13,
    name: 'Netflix',
    type: 'property',
    group: 'orange',
    groupName: 'Видео & Стриминг',
    color: '#FFA726',
    price: 200,
    housePrice: 100,
    mortgageValue: 100,
    rents: [38, 100, 300, 750, 925, 1100],
    icon: '🎬',
    iconUrl: '/assets/tiles/netflix_64px.png'
  },
  {
    id: 14,
    name: 'Шанс',
    type: 'chance',
    description: 'Тяните карту удачи',
    icon: '❓',
    iconUrl: '/assets/tiles/chance_64px.png'
  },
  {
    id: 15,
    name: 'Steam',
    type: 'property',
    group: 'red',
    groupName: 'Игровые платформы',
    color: '#EF5350',
    price: 220,
    housePrice: 150,
    mortgageValue: 110,
    rents: [42, 110, 330, 800, 975, 1150],
    icon: '🎮',
    iconUrl: '/assets/tiles/steam_64px.png'
  },
  {
    id: 16,
    name: 'PlayStation',
    type: 'property',
    group: 'red',
    groupName: 'Игровые платформы',
    color: '#EF5350',
    price: 240,
    housePrice: 150,
    mortgageValue: 120,
    rents: [46, 120, 360, 850, 1025, 1200],
    icon: '🕹️',
    iconUrl: '/assets/tiles/playstation_modern_64px.png'
  },
  {
    id: 17,
    name: 'Эко-сбор',
    type: 'tax',
    amount: 150,
    description: 'Оплатите экологический сбор $150',
    icon: '🌿'
  },
  {
    id: 18,
    name: 'Арест',
    type: 'go_to_jail',
    description: 'Отправляйтесь прямо в тюрьму!',
    icon: '👮',
    iconUrl: '/assets/tiles/police_64px.png'
  },
  {
    id: 19,
    name: 'Nike',
    type: 'property',
    group: 'green',
    groupName: 'Мировые бренды',
    color: '#66BB6A',
    price: 300,
    housePrice: 200,
    mortgageValue: 150,
    rents: [60, 150, 450, 1000, 1200, 1400],
    icon: '✔️',
    iconUrl: '/assets/tiles/nike_64px.png'
  },
  {
    id: 20,
    name: "McDonald's",
    type: 'property',
    group: 'green',
    groupName: 'Мировые бренды',
    color: '#66BB6A',
    price: 320,
    housePrice: 200,
    mortgageValue: 160,
    rents: [65, 170, 500, 1100, 1300, 1500],
    icon: '🍔',
    iconUrl: '/assets/tiles/mcdonalds_64px.png'
  },
  {
    id: 21,
    name: 'Казна',
    type: 'chest',
    description: 'Тяните карту городской казны',
    icon: '🎁',
    iconUrl: '/assets/tiles/chest_64px.png'
  },
  {
    id: 22,
    name: 'ChatGPT',
    type: 'property',
    group: 'darkblue',
    groupName: 'AI & Техногиганты',
    color: '#5C6BC0',
    price: 350,
    housePrice: 200,
    mortgageValue: 175,
    rents: [70, 175, 500, 1100, 1300, 1500],
    icon: '🤖',
    iconUrl: '/assets/tiles/chatgpt_64px.png'
  },
  {
    id: 23,
    name: 'Claude',
    type: 'property',
    group: 'darkblue',
    groupName: 'AI & Техногиганты',
    color: '#5C6BC0',
    price: 400,
    housePrice: 200,
    mortgageValue: 200,
    rents: [85, 200, 600, 1400, 1700, 2400],
    icon: '🧠',
    iconUrl: '/assets/tiles/claude_64px.png'
  }
];

// Default standard board: 40 tiles
const BOARD_TILES = BOARD_TILES_40;

function buildPropertyGroups(tiles) {
  const groups = {};
  tiles.forEach(tile => {
    if (tile.type === 'property' && tile.group) {
      if (!groups[tile.group]) {
        groups[tile.group] = [];
      }
      groups[tile.group].push(tile.id);
    }
  });
  return groups;
}

const PROPERTY_GROUPS_40 = buildPropertyGroups(BOARD_TILES_40);
const PROPERTY_GROUPS_24 = buildPropertyGroups(BOARD_TILES_24);
const PROPERTY_GROUPS = PROPERTY_GROUPS_40;

const DEFAULT_TEAMS = [
  {
    id: 'team_red',
    name: 'Красная Команда',
    color: { name: 'Красный', hex: '#FF5252', bgHex: 'rgba(255, 82, 82, 0.2)', text: '#FFFFFF', icon: '🔴' }
  },
  {
    id: 'team_blue',
    name: 'Синяя Команда',
    color: { name: 'Синий', hex: '#448AFF', bgHex: 'rgba(68, 138, 255, 0.2)', text: '#FFFFFF', icon: '🔵' }
  }
];

const GAME_SETTINGS = {
  STARTING_CASH: 1500,
  TEAM_STARTING_CASH_MULTIPLIER: 1.5, // Total pool for team of 2 ($2250)
  START_PASS_BONUS: 200,
  START_LANDING_BONUS: 100, // +100 bonus when exactly landing on START field
  JAIL_TILE_INDEX: 10,
  GO_TO_JAIL_TILE_INDEX: 30,
  JAIL_BAIL_AMOUNT: 50,
  MAX_JAIL_TURNS: 3,
  MORTGAGE_INTEREST_RATE: 0.10, // 10% redemption fee
  AUCTION_MIN_START_PERCENT: 0.10, // 10% of property price
  TURN_TIMEOUT_SECONDS: 60, // 60s auto-pass timer
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  PLAYER_COLORS: [
    { name: 'Красный', hex: '#FF5252', bgHex: 'rgba(255, 82, 82, 0.2)', text: '#FFFFFF', icon: '🚗' },
    { name: 'Синий', hex: '#448AFF', bgHex: 'rgba(68, 138, 255, 0.2)', text: '#FFFFFF', icon: '🚀' },
    { name: 'Зелёный', hex: '#69F0AE', bgHex: 'rgba(105, 240, 174, 0.2)', text: '#111827', icon: '⛵' },
    { name: 'Жёлтый', hex: '#FFD740', bgHex: 'rgba(255, 215, 64, 0.2)', text: '#111827', icon: '🚁' },
    { name: 'Фиолетовый', hex: '#E040FB', bgHex: 'rgba(224, 64, 251, 0.2)', text: '#FFFFFF', icon: '🏎️' },
    { name: 'Оранжевый', hex: '#FF6E40', bgHex: 'rgba(255, 110, 64, 0.2)', text: '#FFFFFF', icon: '🏍️' }
  ]
};

module.exports = {
  BOARD_TILES,
  BOARD_TILES_40,
  BOARD_TILES_24,
  PROPERTY_GROUPS,
  PROPERTY_GROUPS_40,
  PROPERTY_GROUPS_24,
  DEFAULT_TEAMS,
  GAME_SETTINGS
};
