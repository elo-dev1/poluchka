import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Crown,
  Flame,
  Swords,
  RotateCw,
  Users,
  BookOpen,
  Dices,
  Building2,
  Gavel,
  Key,
  Coins,
  Clock,
  Globe,
  Zap,
  Train,
  DollarSign,
  AlertTriangle,
  Award,
  Check,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type RulesModeKey = 'classic' | 'blitz' | 'ranked' | 'reverse' | 'team' | 'general';

interface ModeRuleGuide {
  id: RulesModeKey;
  title: string;
  badge: string;
  badgeColor: string;
  icon: any;
  summary: string;
  chips: { icon: any; label: string; value: string }[];
  sections: {
    title: string;
    icon: any;
    color: string;
    items: string[];
  }[];
}

export const RulesTab: React.FC = () => {
  const { theme } = useGame();
  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const [activeMode, setActiveMode] = useState<RulesModeKey>('classic');

  const modesRules: ModeRuleGuide[] = [
    {
      id: 'classic',
      title: 'Классическая Получка',
      badge: 'СТАНДАРТ (40 КЛЕТОК)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Crown,
      summary:
        'Официальные правила экономической игры «Получка». Полный периметр 11x11, 28 цифровых активов (IT-компании, бренды, транспортные сети и сервисы) и турнирная партия до банкротства соперников.',
      chips: [
        { icon: Globe, label: 'Поле', value: '40 клеток (11x11)' },
        { icon: Building2, label: 'Активы', value: '22 компании в 8 отраслях' },
        { icon: Coins, label: 'Капитал', value: '$1,500 на старте' },
        { icon: Clock, label: 'Время', value: '30–45 минут' },
      ],
      sections: [
        {
          title: 'Цель игры и победа',
          icon: Award,
          color: 'text-amber-400',
          items: [
            'Цель — разорить всех оппонентов и остаться единственным состоятельным магнатом на поле.',
            'Победа присуждается последнему оставшемуся игроку после банкротства всех соперников.',
            'За каждый полный круг поля при прохождении клетки «Старт» начисляется получка +$200 (или +$400 при точной остановке на Старт).',
          ],
        },
        {
          title: 'Монополии, филиалы и дата-центры',
          icon: Building2,
          color: 'text-blue-400',
          items: [
            'Владение всеми компаниями одной индустрии/отрасли дает статус Монополии и удваивает базовую прибыль незастроенных активов.',
            'При наличии монополии разрешается строить до 4 филиалов и 1 дата-центр/головной офис на каждой компании района.',
            'Строительство ведется строго равномерно: нельзя поставить 2-й филиал на одну компанию, пока на остальных не стоит по 1-му филиалу.',
            'Полноценный дата-центр приносит максимальную арендную плату, способную разорить любого конкурента.',
          ],
        },
        {
          title: 'Транспортные сети и цифровые сервисы',
          icon: Train,
          color: 'text-emerald-400',
          items: [
            'На поле расположено 4 Транспортные сети (Uber, Bolt, Lyft, Gett). Оплата проезда растет геометрически: 1 сеть = $25, 2 сети = $50, 3 = $100, все 4 = $200.',
            'Цифровые сервисы (WinRAR и Speedtest) взимают плату в размере броска кубиков: 4x от очков кубиков (при 1 сервисе) или 10x (при владении обоими сервисами).',
          ],
        },
        {
          title: 'Залог активов и спасение от банкротства',
          icon: DollarSign,
          color: 'text-purple-400',
          items: [
            'При нехватке наличных для оплаты счетов игрок может заложить свободные компании банку за 50% номинальной стоимости.',
            'Заложенный актив не приносит прибыль, пока не будет выкуплен обратно с 10% банковской комиссией.',
            'Перед залогом компании все построенные на ней филиалы и дата-центры должны быть проданы банку за половину цены.',
            'Если долг превышает все активы игрока вместе с залогами — объявляется банкротство и игрок выбывает.',
          ],
        },
      ],
    },
    {
      id: 'blitz',
      title: 'Блиц Получка (24 клетки)',
      badge: 'ДИНАМИЧНЫЙ ТЕМП (10–15 МИН)',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      icon: Flame,
      summary:
        'Ускоренный формат на компактном поле 7x7. По 2 компании в каждой отрасли, моментальный сбор монополий и быстрая партия без затяжных ожиданий.',
      chips: [
        { icon: Globe, label: 'Поле', value: '24 клетки (7x7)' },
        { icon: Building2, label: 'Компании', value: '14 (по 2 в отрасли)' },
        { icon: Zap, label: 'Монополия', value: 'Всего 2 компании' },
        { icon: Clock, label: 'Время', value: '10–15 минут' },
      ],
      sections: [
        {
          title: 'Суть и скорость режима',
          icon: Zap,
          color: 'text-orange-400',
          items: [
            'Компактная доска из 24 клеток гарантирует плотный контакт соперников с первых же секунд.',
            'В каждой отрасли теперь всего по 2 компании: монополия собирается в два раза быстрее, чем в классике.',
            'Развитие филиалов начинается уже со второго круга стола, а рента взлетает молниеносно.',
          ],
        },
        {
          title: 'Особенности экономики Блица',
          icon: Coins,
          color: 'text-amber-400',
          items: [
            'Стартовый капитал $1,000 адаптирован под компактный масштаб цен и быстрый оборот.',
            'Получка за круг составляет $150, что заставляет игроков активнее торговать и вкладываться в развитие.',
            'Ошибки в Блице наказываются жестче: одна остановка на застроенном дата-центре мгновенно решает исход партии.',
          ],
        },
        {
          title: 'Стратегия победы в Блице',
          icon: Award,
          color: 'text-emerald-400',
          items: [
            'Стремитесь выкупить обе компании первой попавшейся отрасли и сразу развить их 2–3 филиалами.',
            'Не копите пассивные деньги — пустые наличные быстро сгорают под налогами и рентой конкурентов.',
            'Используйте аукционы: забирайте нужные компании, пока соперники экономят бюджет.',
          ],
        },
      ],
    },
    {
      id: 'ranked',
      title: 'Дуэль (1 на 1)',
      badge: 'ТУРНИР 2x ELO',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      icon: Swords,
      summary:
        'Бескомпромиссная дуэль один на один за позиции в глобальном лидерборде. Жесткий таймер 30 секунд на ход и удвоенная награда ELO.',
      chips: [
        { icon: Users, label: 'Формат', value: '1 на 1 (Дуэль)' },
        { icon: Clock, label: 'Таймер', value: '30 сек на ход' },
        { icon: Swords, label: 'Рейтинг', value: '2x ELO (+30 победа)' },
        { icon: Globe, label: 'Поле', value: '40 клеток' },
      ],
      sections: [
        {
          title: 'Правила дуэли и таймер',
          icon: Clock,
          color: 'text-red-400',
          items: [
            'В игре участвуют ровно два игрока — никаких ботов и третьих лиц.',
            'На каждый ход отводится ровно 30 секунд. Если игрок не успел сделать действие, бросок или завершение хода происходят автоматически.',
            'Быстрый таймер стимулирует молниеносное принятие тактических решений и исключает затягивание времени.',
          ],
        },
        {
          title: 'Удвоенный рейтинг ELO',
          icon: Trophy,
          color: 'text-amber-400',
          items: [
            'Все игры без ботов учитываются в рейтинге, а победа в дуэли приносит сразу +30 ELO (удвоенный турнирный прирост).',
            'Поражение снижает рейтинг, побуждая относиться к каждому ходу с максимальной концентрацией.',
            'Игроки с высоким ELO получают эксклюзивные ранги в профиле (Магистр, Гроссмейстер, Олигарх).',
          ],
        },
        {
          title: 'Психология дуэли 1 на 1',
          icon: Swords,
          color: 'text-blue-400',
          items: [
            'В дуэли любой купленный вами актив лишает оппонента шанса собрать монополию без сделки.',
            'Аукционы становятся чистой битвой бюджетов: заставляйте оппонента переплачивать за нужные активы.',
            'Залог компаний ради завершения ключевого развития — классический дуэльный прием победителей.',
          ],
        },
      ],
    },
    {
      id: 'reverse',
      title: 'Получка «Наоборот» 🔄',
      badge: 'ИНВЕРСИЯ ПРАВИЛ (ТРАТЬТЕ ДЕНЬГИ)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: RotateCw,
      summary:
        'Инверсия классической экономики: побеждает игрок с НАИМЕНЬШИМ капиталом к финалу! Но берегитесь банкротства — банкроты выбывают первыми.',
      chips: [
        { icon: Coins, label: 'Условие', value: 'Меньше денег = победа' },
        { icon: Clock, label: 'Лимит', value: '10 / 20 раундов' },
        { icon: Gavel, label: 'Аукцион', value: 'Принудительная покупка' },
        { icon: AlertTriangle, label: 'Банкрот', value: 'Немедленный вылет' },
      ],
      sections: [
        {
          title: 'Главное условие: инверсия капитала',
          icon: RotateCw,
          color: 'text-purple-400',
          items: [
            'Побеждает игрок, чей суммарный чистый капитал (Net Worth) окажется НАИМЕНЬШИМ к концу партии!',
            'Подсчет капитала включает: наличные деньги + 100% номинальной стоимости всех ваших активов + 50% стоимости построек.',
            'Каждый лишний доллар на балансе приближает вас к поражению!',
          ],
        },
        {
          title: 'Смертельная ловушка — Банкротство',
          icon: AlertTriangle,
          color: 'text-red-400',
          items: [
            'Хотя цель — избавиться от денег, банкротство означает ДИСКВАЛИФИКАЦИЮ!',
            'Если ваш баланс упадет ниже $0 и вам нечем расплатиться — вы выбываете проигравшим.',
            'Победить с $1 в кармане — вершина мастерства, но пересечь черту в -$1 — фиаско.',
          ],
        },
        {
          title: 'Куда уходит аренда и принудительный аукцион',
          icon: Gavel,
          color: 'text-amber-400',
          items: [
            'Рента за попадание на чужую компанию уходит БАНКУ, а не владельцу! Владелец не обогащается от чужих шагов.',
            'Принудительный аукцион: если игрок отказывается покупать актив и на аукционе никто не делает ставок, клетка ПРИНУДИТЕЛЬНО достается игроку по номиналу, отягощая его портфель.',
            'Игра завершается строго по истечении 10 (блиц) или 20 (стандарт) раундов.',
          ],
        },
      ],
    },
    {
      id: 'team',
      title: 'Командная Получка 2v2 👥',
      badge: 'КОМАНДЫ (КРАСНЫЕ VS СИНИЕ)',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Users,
      summary:
        'Командный союз двух дуэтов: Красные 🔴 против Синих 🔵. Общая казна $2,250, бесплатный проход напарника и совместные монополии.',
      chips: [
        { icon: Users, label: 'Состав', value: '2 на 2 Команды' },
        { icon: Coins, label: 'Казна', value: '$2,250 общий баланс' },
        { icon: Building2, label: 'Выплаты', value: '$0 своим союзникам' },
        { icon: Crown, label: 'Победа', value: 'По сумме команды' },
      ],
      sections: [
        {
          title: 'Единый командный бюджет',
          icon: Coins,
          color: 'text-blue-400',
          items: [
            'Каждая команда начинает со стартовым общим балансом $2,250.',
            'Все расходы (покупка компаний, постройка филиалов, штрафы) списываются из общей казны дуэта.',
            'Вся поступающая арендная плата от соперников мгновенно пополняет общий баланс команды.',
          ],
        },
        {
          title: 'Бесплатное посещение компаний напарника ($0)',
          icon: Check,
          color: 'text-emerald-400',
          items: [
            'Остановка на компании союзника абсолютно БЕСПЛАТНА: никакой платы между напарниками.',
            'Компании союзника служат надежным островком безопасности на враждебной доске.',
          ],
        },
        {
          title: 'Командные монополии и развитие',
          icon: Building2,
          color: 'text-amber-400',
          items: [
            'Если у одного напарника компания №1, а у второго — компания №2 той же отрасли, это признается ПОЛНОЙ МОНОПОЛИЕЙ команды!',
            'Любой из напарников в свой ход может развивать компании монополии филиалами за счет общей казны.',
            'Команда выбывает целиком, если общая казна банкротится и долги не покрываются залогами.',
          ],
        },
      ],
    },
    {
      id: 'general',
      title: 'Общие механики и события',
      badge: 'БАЗОВЫЕ ПРАВИЛА ДЛЯ ВСЕХ',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      icon: BookOpen,
      summary:
        'Базовые механики настольной игры: броски кубиков, дубли, тюрьма, карты Шанс и Казна, аукционы и прямые сделки между игроками.',
      chips: [
        { icon: Dices, label: 'Кубики', value: '2D6 (Дубли)' },
        { icon: Key, label: 'Тюрьма', value: '$50 или дубль' },
        { icon: Gavel, label: 'Торги', value: 'Открытый аукцион' },
        { icon: Sparkles, label: 'Карты', value: 'Шанс и Казна' },
      ],
      sections: [
        {
          title: 'Броски кубиков и дубли',
          icon: Dices,
          color: 'text-amber-400',
          items: [
            'Игроки ходят по очереди, бросая 2 кубика. Сумма определяет количество шагов фишки.',
            'Выпадение одинаковых чисел на обоих кубиках (дубль) дает право на повторный внеочередной бросок.',
            'Внимание: три дубля подряд за один ход отправляют фишку в Тюрьму за превышение скорости!',
          ],
        },
        {
          title: 'Тюрьма и способы освобождения',
          icon: Key,
          color: 'text-purple-400',
          items: [
            'Попав в тюрьму, игрок пропускает ходы и может находиться в заключении до 3 раундов.',
            'Освободиться можно 3 путями: выбросить дубль в свой ход, заплатить штраф $50 или сыграть карту «Освобождение из тюрьмы».',
            'Находясь в тюрьме, игрок сохраняет право собирать ренту, участвовать в аукционах и торговать.',
          ],
        },
        {
          title: 'Аукционы и прямые сделки',
          icon: Gavel,
          color: 'text-emerald-400',
          items: [
            'Если игрок отказывается покупать ничейный актив по номиналу, он немедленно выставляется на аукцион со стартом $10.',
            'Любой игрок может предложить прямую сделку сопернику через кнопку «Сделка», предложив обмен активами с денежной доплатой.',
          ],
        },
        {
          title: 'Рейтинг ELO и защита от накрутки',
          icon: Trophy,
          color: 'text-amber-400',
          items: [
            'Все партии против реальных игроков являются рейтинговыми и влияют на ELO в таблице лидеров.',
            'Честная математика Elo: награда за победу рассчитывается по международной системе Elo с нулевой суммой. В дуэлях действует 2x ELO.',
            'Защита от накрутки: игра должна длиться не менее 3 кругов (или 2 мин). Досрочный слив штрафует ливера, а победителю очков не дает.',
            'Защита от фарма: при повторных матчах с одним соперником за 24 часа прирост очков постепенно угасает (100% → 70% → 40% → 15% → 0%).',
            'Игры с ботами являются тренировочными и в официальном рейтинге не учитываются.',
          ],
        },
      ],
    },
  ];

  const currentGuide = modesRules.find((m) => m.id === activeMode) || modesRules[0];
  const CurrentIcon = currentGuide.icon;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full animate-fade-in select-none">
      {/* Universal Rating Notice Banner */}
      <div
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-none sm:rounded-xl border text-xs shadow-sm',
          isNoir
            ? 'bg-[#14100c] border-[#d4a647]/35 text-[#f5e6c8]'
            : isSoviet
            ? 'bg-[#09111c] border-[#38bdf8]/35 text-[#e0f2fe]'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        )}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="font-semibold text-[11px] sm:text-xs">
            Все игры против реальных игроков учитываются в рейтинге (игры с ботами в рейтинге не учитываются).
          </span>
        </div>
        <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-amber-400/40 text-amber-300 shrink-0">
          ⭐ ELO РЕЙТИНГ
        </span>
      </div>
      {/* 1. Mode Filter Tabs Header */}
      <div
        className={cn(
          'w-full flex items-center justify-start gap-1.5 p-1.5 rounded-none sm:rounded-2xl border backdrop-blur-md overflow-x-auto no-scrollbar shrink-0',
          isNoir
            ? 'bg-[#14100c] border-[#3d2e1a]'
            : isSoviet
            ? 'bg-[#09111c] border-[#1e293b]'
            : 'bg-[#020617] border-slate-600/30'
        )}
      >
        {modesRules.map((m) => {
          const isSelected = activeMode === m.id;
          const TabIcon = m.icon;

          return (
            <button
              key={m.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveMode(m.id);
              }}
              className={cn(
                'flex items-center gap-2 px-3.5 sm:px-5 py-2 h-9 sm:h-10 rounded-none sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer',
                isSelected
                  ? isNoir
                    ? 'bg-[#d4a647] border-[#1a1410] text-[#1a1410] shadow-md'
                    : isSoviet
                    ? 'bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe] shadow-md'
                    : 'bg-slate-600 border-slate-500 text-white shadow-md'
                  : isNoir
                  ? 'text-[#b8a890] border-transparent hover:bg-[#1a1410]'
                  : isSoviet
                  ? 'text-[#94a3b8] border-transparent hover:bg-[#0f172a]'
                  : 'text-slate-400 border-transparent hover:bg-white/5'
              )}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span>{m.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Guide Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGuide.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-4 w-full"
        >
          {/* Header Showcase Banner */}
          <div
            className={cn(
              'p-5 sm:p-6 shadow-xl border flex flex-col gap-4 relative overflow-hidden',
              isNoir
                ? 'bg-[#1a1410] border-[#d4a647] rounded-none font-noir-body text-[#f5e6c8]'
                : isSoviet
                ? 'bg-[#09111c] border-[#38bdf8] rounded-none font-soviet text-[#e2e8f0]'
                : 'bg-[#0f172a]/95 border-slate-600/50 rounded-2xl font-sans text-slate-100'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-11 h-11 sm:w-12 sm:h-12 rounded-none sm:rounded-2xl border flex items-center justify-center shrink-0 shadow-inner',
                    isNoir
                      ? 'bg-[#14100c] border-[#d4a647]'
                      : isSoviet
                      ? 'bg-[#050b14] border-[#38bdf8]'
                      : 'bg-slate-950 border-amber-400/50'
                  )}
                >
                  <CurrentIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'font-bold text-lg sm:text-xl',
                        isNoir
                          ? 'font-noir-title text-[#d4a647]'
                          : isSoviet
                          ? 'font-soviet text-[#38bdf8]'
                          : 'text-white'
                      )}
                    >
                      {currentGuide.title}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-none sm:rounded-md border',
                        currentGuide.badgeColor
                      )}
                    >
                      {currentGuide.badge}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    Полный справочник правил и регламента режима
                  </span>
                </div>
              </div>
            </div>

            {/* Pitch Summary */}
            <p className="text-xs sm:text-sm leading-relaxed text-left opacity-90">
              {currentGuide.summary}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              {currentGuide.chips.map((c, idx) => {
                const ChipIcon = c.icon;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-2.5 sm:p-3 rounded-none sm:rounded-xl border flex flex-col gap-0.5',
                      isNoir
                        ? 'bg-[#14100c] border-[#d4a647]/25'
                        : isSoviet
                        ? 'bg-[#050b14] border-[#38bdf8]/25'
                        : 'bg-slate-950/80 border-slate-700/40'
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <ChipIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-foreground truncate">
                      {c.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
            {currentGuide.sections.map((sec, idx) => {
              const SecIcon = sec.icon;

              return (
                <div
                  key={idx}
                  className={cn(
                    'p-4 sm:p-5 rounded-none sm:rounded-2xl border flex flex-col gap-3 text-left shadow-lg',
                    isNoir
                      ? 'bg-[#14100c] border-[#d4a647]/30 font-noir-body'
                      : isSoviet
                      ? 'bg-[#09111c] border-[#1e293b] font-soviet'
                      : 'bg-card/80 border-white/10 backdrop-blur-xl'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <SecIcon className={cn('w-4 h-4 shrink-0', sec.color)} />
                    <span className="text-sm font-bold text-foreground">{sec.title}</span>
                  </div>

                  <ul className="flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground list-disc list-inside">
                    {sec.items.map((item, iIdx) => (
                      <li key={iIdx} className="text-left">
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
