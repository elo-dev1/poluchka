/**
 * Expanded Chance and Treasury decks (12+ cards each) with varied mechanics
 */

const CHANCE_CARDS = [
  {
    id: 'ch_1',
    title: 'Выигрыш в лотерею',
    text: 'Вам улыбнулась удача! Получите $150.',
    type: 'cash',
    amount: 150,
    icon: '🎰'
  },
  {
    id: 'ch_2',
    title: 'Штраф за превышение скорости',
    text: 'Оплатите штраф ГИБДД в размере $50.',
    type: 'cash',
    amount: -50,
    icon: '🚓'
  },
  {
    id: 'ch_3',
    title: 'Дивиденды по акциям',
    text: 'Ваш инвестиционный портфель вырос. Получите $100.',
    type: 'cash',
    amount: 100,
    icon: '📈'
  },
  {
    id: 'ch_4',
    title: 'Капитальный ремонт улиц',
    text: 'Оплатите ремонт недвижимости: $25 за каждый дом, $100 за каждый отель.',
    type: 'repairs',
    houseCost: 25,
    hotelCost: 100,
    icon: '🔨'
  },
  {
    id: 'ch_5',
    title: 'Прямиком на СТАРТ!',
    text: 'Переместитесь на клетку СТАРТ и получите $200.',
    type: 'move_to',
    targetTileIndex: 0,
    collectStartBonus: true,
    icon: '🏃'
  },
  {
    id: 'ch_6',
    title: 'Бесплатное освобождение из тюрьмы',
    text: 'Эта карта сохраняется до востребования или может быть продана/обменяна.',
    type: 'get_out_of_jail_free',
    icon: '🗝️'
  },
  {
    id: 'ch_7',
    title: 'Арест! В Тюрьму!',
    text: 'Отправляйтесь прямо в тюрьму. Не проходите через Старт, не получайте $200.',
    type: 'go_to_jail',
    icon: '👮'
  },
  {
    id: 'ch_8',
    title: 'Визит в VS Code',
    text: 'Отправляйтесь на клетку "VS Code". Если проходите через Старт — получите $200.',
    type: 'move_to',
    targetTileName: 'VS Code',
    targetTileIndex: 3,
    collectStartBonus: true,
    icon: '💻'
  },
  {
    id: 'ch_9',
    title: 'Визит в Claude',
    text: 'Переместитесь на клетку "Claude". Если проходите через Старт — получите $200.',
    type: 'move_to',
    targetTileName: 'Claude',
    targetTileIndex: 39,
    collectStartBonus: true,
    icon: '🧠'
  },
  {
    id: 'ch_10',
    title: 'Благотворительный взнос',
    text: 'Вы избраны председателем совета. Выплатите каждому игроку по $50.',
    type: 'player_payment',
    amountPerPlayer: -50,
    icon: '🤝'
  },
  {
    id: 'ch_11',
    title: 'Возврат переплаты по кредиту',
    text: 'Банк сделал перерасчет процентов. Получите $80.',
    type: 'cash',
    amount: 80,
    icon: '💳'
  },
  {
    id: 'ch_12',
    title: 'Непредвиденный ремонт авто',
    text: 'Срочная замена тормозных колодок. Заплатите $60.',
    type: 'cash',
    amount: -60,
    icon: '🚗'
  }
];

const CHEST_CARDS = [
  {
    id: 'ch_chest_1',
    title: 'Возврат налогов',
    text: 'Государство вернуло переплату по налогам. Получите $120.',
    type: 'cash',
    amount: 120,
    icon: '📑'
  },
  {
    id: 'ch_chest_2',
    title: 'Медицинская страховка',
    text: 'Оплата визита к частному доктору. Заплатите $60.',
    type: 'cash',
    amount: -60,
    icon: '🏥'
  },
  {
    id: 'ch_chest_3',
    title: 'Премия за хорошую работу',
    text: 'Годовой корпоративный бонус! Получите $100.',
    type: 'cash',
    amount: 100,
    icon: '💰'
  },
  {
    id: 'ch_chest_4',
    title: 'День рождения!',
    text: 'У вас день рождения! Соберите по $20 подарка с каждого игрока.',
    type: 'player_payment',
    amountPerPlayer: 20,
    icon: '🎂'
  },
  {
    id: 'ch_chest_5',
    title: 'Проценты по депозиту',
    text: 'Банк выплатил проценты по сбережениям. Получите $70.',
    type: 'cash',
    amount: 70,
    icon: '🏦'
  },
  {
    id: 'ch_chest_6',
    title: 'Бесплатное освобождение из тюрьмы',
    text: 'Эта карта сохраняется до востребования или может быть продана/обменяна.',
    type: 'get_out_of_jail_free',
    icon: '🗝️'
  },
  {
    id: 'ch_chest_7',
    title: 'Техобслуживание недвижимости',
    text: 'Оплата планового техобслуживания: $20 за каждый дом, $80 за каждый отель.',
    type: 'repairs',
    houseCost: 20,
    hotelCost: 80,
    icon: '🧰'
  },
  {
    id: 'ch_chest_8',
    title: 'Праздничный банкет',
    text: 'Организация вечеринки для друзей. Заплатите $80.',
    type: 'cash',
    amount: -80,
    icon: '🎉'
  },
  {
    id: 'ch_chest_9',
    title: 'Страховая выплата',
    text: 'Получение страхового возмещения за поврежденное имущество. Получите $90.',
    type: 'cash',
    amount: 90,
    icon: '🛡️'
  },
  {
    id: 'ch_chest_10',
    title: 'Оплата коммунальных услуг',
    text: 'Счёт за воду и электричество. Заплатите $50.',
    type: 'cash',
    amount: -50,
    icon: '💡'
  },
  {
    id: 'ch_chest_11',
    title: 'Визит в Telegram',
    text: 'Отправляйтесь на клетку "Telegram". Если проходите через Старт — получите $200.',
    type: 'move_to',
    targetTileName: 'Telegram',
    targetTileIndex: 6,
    collectStartBonus: true,
    icon: '✈️'
  },
  {
    id: 'ch_chest_12',
    title: 'Продажа старинной картины',
    text: 'Удачная сделка на антикварном аукционе. Получите $130.',
    type: 'cash',
    amount: 130,
    icon: '🎨'
  }
];

module.exports = {
  CHANCE_CARDS,
  CHEST_CARDS
};
