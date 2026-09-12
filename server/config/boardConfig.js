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
    description: 'Стартовая черта автодрома. Получите призовые +$200 от спонсоров при прохождении круга',
    bonus: 200,
    icon: '🏁',
    iconUrl: '/assets/tiles/special_start.png'
  },
  {
    id: 1,
    name: 'Ведро с Болтами',
    type: 'property',
    group: 'brown',
    groupName: 'Гаражные раритеты',
    color: '#8D6E63',
    price: 60,
    housePrice: 50,
    mortgageValue: 30,
    rents: [10, 30, 90, 270, 400, 550],
    icon: '🚗',
    iconUrl: '/assets/tiles/car_jalopy.png',
    description: 'Громыхает на каждой кочке, скрипит тормозами, но упорно обгоняет новенькие иномарки.'
  },
  {
    id: 2,
    name: 'Казна',
    type: 'chest',
    description: 'Фонд автоклуба. Тяните карту выплат, призовых кубков или клубных сборов',
    icon: '🎁',
    iconUrl: '/assets/tiles/special_chest.png'
  },
  {
    id: 3,
    name: 'Красный Жужик',
    type: 'property',
    group: 'brown',
    groupName: 'Гаражные раритеты',
    color: '#8D6E63',
    price: 80,
    housePrice: 50,
    mortgageValue: 40,
    rents: [14, 40, 120, 360, 500, 650],
    icon: '🚗',
    iconUrl: '/assets/tiles/car_beetle_red.png',
    description: 'Винтажный вишнёвый ретро-хэтчбек с круглыми фарами. Едет не спеша, зато с душой и музыкой.'
  },
  {
    id: 4,
    name: 'Транспортный налог',
    type: 'tax',
    amount: 200,
    description: 'Оплатите $200 государственного транспортного налога в дорожный фонд',
    icon: '💸',
    iconUrl: '/assets/tiles/special_tax_transport.png'
  },
  {
    id: 5,
    name: 'Маршрутка',
    type: 'property',
    group: 'transport',
    groupName: 'Автопарк & Маршруты',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚌',
    iconUrl: '/assets/tiles/car_city_bus.png',
    description: 'Вместительный городской автобус. Сколько бы пассажиров ни зашло — всегда поместится ещё один!'
  },
  {
    id: 6,
    name: 'Картошковоз 4×4',
    type: 'property',
    group: 'lightblue',
    groupName: 'Рабочий класс',
    color: '#29B6F6',
    price: 100,
    housePrice: 50,
    mortgageValue: 50,
    rents: [18, 50, 150, 450, 625, 750],
    icon: '🛻',
    iconUrl: '/assets/tiles/car_pickup_teal.png',
    description: 'Бирюзовый неубиваемый трудяга с открытым кузовом. Возит мешки, рассаду и стабильную прибыль.'
  },
  {
    id: 7,
    name: 'Шанс',
    type: 'chance',
    description: 'Случай на трассе. Тяните карту неожиданных событий и дорожных сюрпризов',
    icon: '❓',
    iconUrl: '/assets/tiles/special_chance.png'
  },
  {
    id: 8,
    name: 'Шустрый Курьер',
    type: 'property',
    group: 'lightblue',
    groupName: 'Рабочий класс',
    color: '#29B6F6',
    price: 100,
    housePrice: 50,
    mortgageValue: 50,
    rents: [18, 50, 150, 450, 625, 750],
    icon: '🚐',
    iconUrl: '/assets/tiles/car_delivery_van.png',
    description: 'Фургон экспресс-доставки. Ловко лавирует по дворам, ведь таймер горячего заказа уже тикает!'
  },
  {
    id: 9,
    name: 'Капсула Скорости',
    type: 'property',
    group: 'lightblue',
    groupName: 'Рабочий класс',
    color: '#29B6F6',
    price: 120,
    housePrice: 50,
    mortgageValue: 60,
    rents: [22, 60, 180, 500, 700, 900],
    icon: '🚙',
    iconUrl: '/assets/tiles/car_beetle_blue.png',
    description: 'Юркий небесно-голубой ситикар. Припаркуется даже на пятачке между фонарным столбом и скамейкой.'
  },
  {
    id: 10,
    name: 'Штрафстоянка',
    type: 'jail',
    description: 'Городская штрафстоянка ДПС. Обычное посещение / Задержание за нарушения ПДД',
    icon: '⛓️',
    iconUrl: '/assets/tiles/special_jail.png'
  },

  // --- RIGHT ROW (Tiles 11 to 20) ---
  {
    id: 11,
    name: 'Пузотёрка',
    type: 'property',
    group: 'pink',
    groupName: 'Городской эконом',
    color: '#EC407A',
    price: 140,
    housePrice: 100,
    mortgageValue: 70,
    rents: [26, 70, 200, 550, 750, 950],
    icon: '🚗',
    iconUrl: '/assets/tiles/car_yellow_hatch.png',
    description: 'Яркий городской хэтчбек с минимальным клиренсом. Боится «лежачих полицейских», но обожает гладкий асфальт.'
  },
  {
    id: 12,
    name: 'Эвакуатор',
    type: 'property',
    group: 'utility',
    groupName: 'Спецтехника & Сервис',
    color: '#8D6E63',
    price: 150,
    mortgageValue: 75,
    rents: [20, 60, 120, 240],
    icon: '🚜',
    iconUrl: '/assets/tiles/car_tow_truck.png',
    description: 'Мощный спецкран с манипулятором. Очищает проспекты от заторов и бережно везёт сломавшихся на ремонт.'
  },
  {
    id: 13,
    name: 'Красная Зажигалка',
    type: 'property',
    group: 'pink',
    groupName: 'Городской эконом',
    color: '#EC407A',
    price: 140,
    housePrice: 100,
    mortgageValue: 70,
    rents: [26, 70, 200, 550, 750, 950],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_speedster_red.png',
    description: 'Облегченный ретро-родстер без крыши. Ветер в лицо, солнечные очки и чистые гоночные эмоции!'
  },
  {
    id: 14,
    name: 'Дрифт корч',
    type: 'property',
    group: 'pink',
    groupName: 'Городской эконом',
    color: '#EC407A',
    price: 160,
    housePrice: 100,
    mortgageValue: 80,
    rents: [30, 80, 220, 600, 800, 1000],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_drift_coupe.png',
    description: 'Заряженное заднеприводное купе с антикрылом. Входит в повороты эффектным боковым заносом под свист покрышек.'
  },
  {
    id: 15,
    name: 'Двухэтажный Турист',
    type: 'property',
    group: 'transport',
    groupName: 'Автопарк & Маршруты',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚌',
    iconUrl: '/assets/tiles/car_doubledecker.png',
    description: 'Ярко-красный экскурсионный даблдекер. Панорамный вид со второго этажа прямо на удивлённых соперников.'
  },
  {
    id: 16,
    name: 'Шашечки',
    type: 'property',
    group: 'orange',
    groupName: 'Служебный автопарк',
    color: '#FFA726',
    price: 180,
    housePrice: 100,
    mortgageValue: 90,
    rents: [34, 90, 250, 700, 875, 1050],
    icon: '🚕',
    iconUrl: '/assets/tiles/car_taxi_cab.png',
    description: 'Классический седан с шашечками на крыше. Знает все тайные объезды и привозит круглосуточную выручку.'
  },
  {
    id: 17,
    name: 'Казна',
    type: 'chest',
    description: 'Фонд автоклуба. Тяните карту выплат, призовых кубков или клубных сборов',
    icon: '🎁',
    iconUrl: '/assets/tiles/special_chest.png'
  },
  {
    id: 18,
    name: 'Ночной Патруль',
    type: 'property',
    group: 'orange',
    groupName: 'Служебный автопарк',
    color: '#FFA726',
    price: 180,
    housePrice: 100,
    mortgageValue: 90,
    rents: [34, 90, 250, 700, 875, 1050],
    icon: '🚓',
    iconUrl: '/assets/tiles/car_police.png',
    description: 'Скоростной патрульный перехватчик с сиреной и проблесковыми маячками. На страже дорожного порядка!'
  },
  {
    id: 19,
    name: 'Карета Спасения',
    type: 'property',
    group: 'orange',
    groupName: 'Служебный автопарк',
    color: '#FFA726',
    price: 200,
    housePrice: 100,
    mortgageValue: 100,
    rents: [38, 100, 300, 750, 925, 1100],
    icon: '🚑',
    iconUrl: '/assets/tiles/car_ambulance.png',
    description: 'Специализированный медицинский микроавтобус с абсолютным приоритетом на трассе. Все уступают ряд!'
  },
  {
    id: 20,
    name: 'Пит-стоп',
    type: 'free_parking',
    description: 'Бесплатная стоянка и пит-стоп. Зона отдыха для водителей без налогов и аренды',
    icon: '🅿️',
    iconUrl: '/assets/tiles/special_parking.png'
  },

  // --- TOP ROW (Tiles 21 to 30) ---
  {
    id: 21,
    name: 'Гряземес 4×4',
    type: 'property',
    group: 'red',
    groupName: 'Экспедиции 4×4',
    color: '#EF5350',
    price: 220,
    housePrice: 150,
    mortgageValue: 110,
    rents: [42, 110, 330, 800, 975, 1150],
    icon: '🚜',
    iconUrl: '/assets/tiles/car_safari_suv.png',
    description: 'Рамный внедорожник со шноркелем и экспедиционным багажником. Там, куда он направляется, дорог нет.'
  },
  {
    id: 22,
    name: 'Шанс',
    type: 'chance',
    description: 'Случай на трассе. Тяните карту неожиданных событий и дорожных сюрпризов',
    icon: '❓',
    iconUrl: '/assets/tiles/special_chance.png'
  },
  {
    id: 23,
    name: 'Монстр-Болотоход',
    type: 'property',
    group: 'red',
    groupName: 'Экспедиции 4×4',
    color: '#EF5350',
    price: 220,
    housePrice: 150,
    mortgageValue: 110,
    rents: [42, 110, 330, 800, 975, 1150],
    icon: '🚜',
    iconUrl: '/assets/tiles/car_mud_bogger.png',
    description: 'Трофи-вездеход на шинах сверхнизкого давления. Не замечает канав и легко форсирует любые топи.'
  },
  {
    id: 24,
    name: 'Пожиратель Бензина',
    type: 'property',
    group: 'red',
    groupName: 'Экспедиции 4×4',
    color: '#EF5350',
    price: 240,
    housePrice: 150,
    mortgageValue: 120,
    rents: [46, 120, 360, 850, 1025, 1200],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_muscle_car.png',
    description: 'Ревущий оранжевый V8 с черными гоночными полосами. Мощь дикая, а расход топлива лучше не замерять!'
  },
  {
    id: 25,
    name: 'Король Трассы',
    type: 'property',
    group: 'transport',
    groupName: 'Автопарк & Маршруты',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚛',
    iconUrl: '/assets/tiles/car_semi_truck.png',
    description: 'Огромный магистральный тягач с хромированными трубами и рацией. Держит под контролем все грузоперевозки.'
  },
  {
    id: 26,
    name: 'Фиолетовая Ракета',
    type: 'property',
    group: 'yellow',
    groupName: 'Спорт & Бизнес',
    color: '#FDD835',
    price: 260,
    housePrice: 150,
    mortgageValue: 130,
    rents: [50, 130, 390, 900, 1100, 1275],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_purple_roadster.png',
    description: 'Низкий открытый спорткар с агрессивным обвесом. Собирает восхищённые взгляды на каждом перекрёстке.'
  },
  {
    id: 27,
    name: 'Директорский Седан',
    type: 'property',
    group: 'yellow',
    groupName: 'Спорт & Бизнес',
    color: '#FDD835',
    price: 260,
    housePrice: 150,
    mortgageValue: 130,
    rents: [50, 130, 390, 900, 1100, 1275],
    icon: '🚘',
    iconUrl: '/assets/tiles/car_silver_sedan.png',
    description: 'Представительский немецкий лайнер в серебристом металлике. Предельный комфорт и абсолютная тишина в салоне.'
  },
  {
    id: 28,
    name: 'Огнеборец 01',
    type: 'property',
    group: 'utility',
    groupName: 'Спецтехника & Сервис',
    color: '#8D6E63',
    price: 150,
    mortgageValue: 75,
    rents: [20, 60, 120, 240],
    icon: '🚒',
    iconUrl: '/assets/tiles/car_fire_truck.png',
    description: 'Тяжелый пожарный трак с цистерной и выдвижной лестницей. Готов мгновенно остудить пыл разбушевавшихся оппонентов!'
  },
  {
    id: 29,
    name: 'Тонированный Бумер',
    type: 'property',
    group: 'yellow',
    groupName: 'Спорт & Бизнес',
    color: '#FDD835',
    price: 280,
    housePrice: 150,
    mortgageValue: 140,
    rents: [55, 140, 420, 950, 1150, 1350],
    icon: '🚘',
    iconUrl: '/assets/tiles/car_black_sedan.png',
    description: 'Культовый строгий седан в глухой тонировке и с басовитым рыком. Имеет непререкаемый авторитет в левом ряду.'
  },
  {
    id: 30,
    name: 'Эвакуация',
    type: 'go_to_jail',
    targetJailIndex: 10,
    description: 'Эвакуация за грубое нарушение ПДД! Отправляйтесь прямо на штрафстоянку!',
    icon: '👮',
    iconUrl: '/assets/tiles/special_police.png'
  },

  // --- LEFT ROW (Tiles 31 to 39) ---
  {
    id: 31,
    name: 'Золотой Люкс',
    type: 'property',
    group: 'green',
    groupName: 'Высший класс',
    color: '#66BB6A',
    price: 300,
    housePrice: 200,
    mortgageValue: 150,
    rents: [60, 150, 450, 1000, 1200, 1400],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_gold_roadster.png',
    description: 'Сияющий золотой кабриолет ручной работы. Главный и самый яркий символ богатства на всём поле.'
  },
  {
    id: 32,
    name: 'Бургер на Колёсах',
    type: 'property',
    group: 'green',
    groupName: 'Высший класс',
    color: '#66BB6A',
    price: 300,
    housePrice: 200,
    mortgageValue: 150,
    rents: [60, 150, 450, 1000, 1200, 1400],
    icon: '🚚',
    iconUrl: '/assets/tiles/car_foodtruck.png',
    description: 'Хипстерский фудтрак с неоновой вывеской. Самые сочные бургеры, к которым выстраивается очередь на полкруга.'
  },
  {
    id: 33,
    name: 'Казна',
    type: 'chest',
    description: 'Фонд автоклуба. Тяните карту выплат, призовых кубков или клубных сборов',
    icon: '🎁',
    iconUrl: '/assets/tiles/special_chest.png'
  },
  {
    id: 34,
    name: 'Тяжёлый Люкс',
    type: 'property',
    group: 'green',
    groupName: 'Высший класс',
    color: '#66BB6A',
    price: 320,
    housePrice: 200,
    mortgageValue: 160,
    rents: [65, 170, 500, 1100, 1300, 1500],
    icon: '🚙',
    iconUrl: '/assets/tiles/car_luxury_suv.png',
    description: 'Массивный люксовый внедорожник на 22-х кованых дисках. Паркуется где удобно, потому что его все пропускают.'
  },
  {
    id: 35,
    name: 'Столичный Таксопарк',
    type: 'property',
    group: 'transport',
    groupName: 'Автопарк & Маршруты',
    color: '#78909C',
    price: 200,
    mortgageValue: 100,
    rents: [25, 50, 100, 200],
    icon: '🚕',
    iconUrl: '/assets/tiles/car_taxi_fleet.png',
    description: 'Собственная коммерческая сеть такси. Каждая минута поездок в городе приносит солидный процент в копилку владельца.'
  },
  {
    id: 36,
    name: 'Шанс',
    type: 'chance',
    description: 'Случай на трассе. Тяните карту неожиданных событий и дорожных сюрпризов',
    icon: '❓',
    iconUrl: '/assets/tiles/special_chance.png'
  },
  {
    id: 37,
    name: 'Аристократ Трассы',
    type: 'property',
    group: 'darkblue',
    groupName: 'Элитные гиперкары',
    color: '#5C6BC0',
    price: 350,
    housePrice: 200,
    mortgageValue: 175,
    rents: [70, 175, 500, 1100, 1300, 1500],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_grand_tourer.png',
    description: 'Эксклюзивный британский гранд-турер для трансконтинентальных круизов. Истинное воплощение элегантности и скорости.'
  },
  {
    id: 38,
    name: 'Утильсбор',
    type: 'tax',
    amount: 100,
    description: 'Оплатите $100 экологического утилизационного сбора за автотранспорт',
    icon: '💸',
    iconUrl: '/assets/tiles/special_tax_recycle.png'
  },
  {
    id: 39,
    name: 'Космолёт',
    type: 'property',
    group: 'darkblue',
    groupName: 'Элитные гиперкары',
    color: '#5C6BC0',
    price: 400,
    housePrice: 200,
    mortgageValue: 200,
    rents: [85, 200, 600, 1400, 1700, 2400],
    icon: '🚀',
    iconUrl: '/assets/tiles/car_cyber_hypercar.png',
    description: 'Футуристический карбоновый гиперкар с космическим ускорением. Скорость не найдена, потому что он уже на финише!'
  }
];

const BOARD_TILES_24 = [
  {
    id: 0,
    name: 'СТАРТ',
    type: 'start',
    description: 'Стартовая черта автодрома. Получите призовые +$200 от спонсоров при прохождении круга',
    bonus: 200,
    icon: '🏁',
    iconUrl: '/assets/tiles/special_start.png'
  },
  {
    id: 1,
    name: 'Ведро с Болтами',
    type: 'property',
    group: 'brown',
    groupName: 'Гаражные раритеты',
    color: '#8D6E63',
    price: 60,
    housePrice: 50,
    mortgageValue: 30,
    rents: [10, 30, 90, 270, 400, 550],
    icon: '🚗',
    iconUrl: '/assets/tiles/car_jalopy.png',
    description: 'Громыхает на каждой кочке, скрипит тормозами, но упорно обгоняет новенькие иномарки.'
  },
  {
    id: 2,
    name: 'Шанс',
    type: 'chance',
    description: 'Случай на трассе. Тяните карту неожиданных событий и дорожных сюрпризов',
    icon: '❓',
    iconUrl: '/assets/tiles/special_chance.png'
  },
  {
    id: 3,
    name: 'Красный Жужик',
    type: 'property',
    group: 'brown',
    groupName: 'Гаражные раритеты',
    color: '#8D6E63',
    price: 80,
    housePrice: 50,
    mortgageValue: 40,
    rents: [14, 40, 120, 360, 500, 650],
    icon: '🚗',
    iconUrl: '/assets/tiles/car_beetle_red.png',
    description: 'Винтажный вишнёвый ретро-хэтчбек с круглыми фарами. Едет не спеша, зато с душой и музыкой.'
  },
  {
    id: 4,
    name: 'Транспортный налог',
    type: 'tax',
    amount: 100,
    description: 'Оплатите $100 государственного дорожного налога в дорожный фонд',
    icon: '💸',
    iconUrl: '/assets/tiles/special_tax_transport.png'
  },
  {
    id: 5,
    name: 'Картошковоз 4×4',
    type: 'property',
    group: 'lightblue',
    groupName: 'Рабочий класс',
    color: '#29B6F6',
    price: 100,
    housePrice: 50,
    mortgageValue: 50,
    rents: [18, 50, 150, 450, 625, 750],
    icon: '🛻',
    iconUrl: '/assets/tiles/car_pickup_teal.png',
    description: 'Бирюзовый неубиваемый трудяга с открытым кузовом. Возит мешки, рассаду и стабильную прибыль.'
  },
  {
    id: 6,
    name: 'Штрафстоянка',
    type: 'jail',
    description: 'Городская штрафстоянка ДПС. Обычное посещение / Задержание за нарушения ПДД',
    icon: '⛓️',
    iconUrl: '/assets/tiles/special_jail.png'
  },
  {
    id: 7,
    name: 'Шустрый Курьер',
    type: 'property',
    group: 'lightblue',
    groupName: 'Рабочий класс',
    color: '#29B6F6',
    price: 120,
    housePrice: 50,
    mortgageValue: 60,
    rents: [22, 60, 180, 500, 700, 900],
    icon: '🚐',
    iconUrl: '/assets/tiles/car_delivery_van.png',
    description: 'Фургон экспресс-доставки. Ловко лавирует по дворам, ведь таймер горячего заказа уже тикает!'
  },
  {
    id: 8,
    name: 'Казна',
    type: 'chest',
    description: 'Фонд автоклуба. Тяните карту выплат, призовых кубков или клубных сборов',
    icon: '🎁',
    iconUrl: '/assets/tiles/special_chest.png'
  },
  {
    id: 9,
    name: 'Пузотёрка',
    type: 'property',
    group: 'pink',
    groupName: 'Городской эконом',
    color: '#EC407A',
    price: 140,
    housePrice: 100,
    mortgageValue: 70,
    rents: [26, 70, 200, 550, 750, 950],
    icon: '🚗',
    iconUrl: '/assets/tiles/car_yellow_hatch.png',
    description: 'Яркий городской хэтчбек с минимальным клиренсом. Боится «лежачих полицейских», но обожает гладкий асфальт.'
  },
  {
    id: 10,
    name: 'Красная Зажигалка',
    type: 'property',
    group: 'pink',
    groupName: 'Городской эконом',
    color: '#EC407A',
    price: 160,
    housePrice: 100,
    mortgageValue: 80,
    rents: [30, 80, 220, 600, 800, 1000],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_speedster_red.png',
    description: 'Облегченный ретро-родстер без крыши. Ветер в лицо, солнечные очки и чистые гоночные эмоции!'
  },
  {
    id: 11,
    name: 'Шашечки',
    type: 'property',
    group: 'orange',
    groupName: 'Служебный автопарк',
    color: '#FFA726',
    price: 180,
    housePrice: 100,
    mortgageValue: 90,
    rents: [34, 90, 250, 700, 875, 1050],
    icon: '🚕',
    iconUrl: '/assets/tiles/car_taxi_cab.png',
    description: 'Классический седан с шашечками на крыше. Знает все тайные объезды и привозит круглосуточную выручку.'
  },
  {
    id: 12,
    name: 'Пит-стоп',
    type: 'free_parking',
    description: 'Бесплатная стоянка и пит-стоп. Зона отдыха для водителей без налогов и аренды',
    icon: '🅿️',
    iconUrl: '/assets/tiles/special_parking.png'
  },
  {
    id: 13,
    name: 'Ночной Патруль',
    type: 'property',
    group: 'orange',
    groupName: 'Служебный автопарк',
    color: '#FFA726',
    price: 200,
    housePrice: 100,
    mortgageValue: 100,
    rents: [38, 100, 300, 750, 925, 1100],
    icon: '🚓',
    iconUrl: '/assets/tiles/car_police.png',
    description: 'Скоростной патрульный перехватчик с сиреной и проблесковыми маячками. На страже дорожного порядка!'
  },
  {
    id: 14,
    name: 'Шанс',
    type: 'chance',
    description: 'Случай на трассе. Тяните карту неожиданных событий и дорожных сюрпризов',
    icon: '❓',
    iconUrl: '/assets/tiles/special_chance.png'
  },
  {
    id: 15,
    name: 'Гряземес 4×4',
    type: 'property',
    group: 'red',
    groupName: 'Экспедиции 4×4',
    color: '#EF5350',
    price: 220,
    housePrice: 150,
    mortgageValue: 110,
    rents: [42, 110, 330, 800, 975, 1150],
    icon: '🚜',
    iconUrl: '/assets/tiles/car_safari_suv.png',
    description: 'Рамный внедорожник со шноркелем и экспедиционным багажником. Там, куда он направляется, дорог нет.'
  },
  {
    id: 16,
    name: 'Пожиратель Бензина',
    type: 'property',
    group: 'red',
    groupName: 'Экспедиции 4×4',
    color: '#EF5350',
    price: 240,
    housePrice: 150,
    mortgageValue: 120,
    rents: [46, 120, 360, 850, 1025, 1200],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_muscle_car.png',
    description: 'Ревущий оранжевый V8 с черными гоночными полосами. Мощь дикая, а расход топлива лучше не замерять!'
  },
  {
    id: 17,
    name: 'Эко-сбор',
    type: 'tax',
    amount: 150,
    description: 'Оплатите экологический дорожный сбор $150 в фонд защиты природы',
    icon: '🌿',
    iconUrl: '/assets/tiles/special_tax_recycle.png'
  },
  {
    id: 18,
    name: 'Эвакуация',
    type: 'go_to_jail',
    description: 'Эвакуация за грубое нарушение ПДД! Отправляйтесь прямо на штрафстоянку!',
    icon: '👮',
    iconUrl: '/assets/tiles/special_police.png'
  },
  {
    id: 19,
    name: 'Золотой Люкс',
    type: 'property',
    group: 'green',
    groupName: 'Высший класс',
    color: '#66BB6A',
    price: 300,
    housePrice: 200,
    mortgageValue: 150,
    rents: [60, 150, 450, 1000, 1200, 1400],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_gold_roadster.png',
    description: 'Сияющий золотой кабриолет ручной работы. Главный и самый яркий символ богатства на всём поле.'
  },
  {
    id: 20,
    name: 'Бургер на Колёсах',
    type: 'property',
    group: 'green',
    groupName: 'Высший класс',
    color: '#66BB6A',
    price: 320,
    housePrice: 200,
    mortgageValue: 160,
    rents: [65, 170, 500, 1100, 1300, 1500],
    icon: '🚚',
    iconUrl: '/assets/tiles/car_foodtruck.png',
    description: 'Хипстерский фудтрак с неоновой вывеской. Самые сочные бургеры, к которым выстраивается очередь на полкруга.'
  },
  {
    id: 21,
    name: 'Казна',
    type: 'chest',
    description: 'Фонд автоклуба. Тяните карту выплат, призовых кубков или клубных сборов',
    icon: '🎁',
    iconUrl: '/assets/tiles/special_chest.png'
  },
  {
    id: 22,
    name: 'Аристократ Трассы',
    type: 'property',
    group: 'darkblue',
    groupName: 'Элитные гиперкары',
    color: '#5C6BC0',
    price: 350,
    housePrice: 200,
    mortgageValue: 175,
    rents: [70, 175, 500, 1100, 1300, 1500],
    icon: '🏎️',
    iconUrl: '/assets/tiles/car_grand_tourer.png',
    description: 'Эксклюзивный британский гранд-турер для трансконтинентальных круизов. Истинное воплощение элегантности и скорости.'
  },
  {
    id: 23,
    name: 'Космолёт',
    type: 'property',
    group: 'darkblue',
    groupName: 'Элитные гиперкары',
    color: '#5C6BC0',
    price: 400,
    housePrice: 200,
    mortgageValue: 200,
    rents: [85, 200, 600, 1400, 1700, 2400],
    icon: '🚀',
    iconUrl: '/assets/tiles/car_cyber_hypercar.png',
    description: 'Футуристический карбоновый гиперкар с космическим ускорением. Скорость не найдена, потому что он уже на финише!'
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

const { BOARD_TILES_PANEL_40, BOARD_TILES_PANEL_24 } = require('./boardPanelConfig');
const { BOARD_TILES_OFFICE_40, BOARD_TILES_OFFICE_24 } = require('./boardOfficeConfig');
const PROPERTY_GROUPS_PANEL_40 = buildPropertyGroups(BOARD_TILES_PANEL_40);
const PROPERTY_GROUPS_PANEL_24 = buildPropertyGroups(BOARD_TILES_PANEL_24);
const PROPERTY_GROUPS_OFFICE_40 = buildPropertyGroups(BOARD_TILES_OFFICE_40);
const PROPERTY_GROUPS_OFFICE_24 = buildPropertyGroups(BOARD_TILES_OFFICE_24);

module.exports = {
  BOARD_TILES,
  BOARD_TILES_40,
  BOARD_TILES_24,
  BOARD_TILES_PANEL_40,
  BOARD_TILES_PANEL_24,
  BOARD_TILES_OFFICE_40,
  BOARD_TILES_OFFICE_24,
  PROPERTY_GROUPS,
  PROPERTY_GROUPS_40,
  PROPERTY_GROUPS_24,
  PROPERTY_GROUPS_PANEL_40,
  PROPERTY_GROUPS_PANEL_24,
  PROPERTY_GROUPS_OFFICE_40,
  PROPERTY_GROUPS_OFFICE_24,
  DEFAULT_TEAMS,
  GAME_SETTINGS
};


