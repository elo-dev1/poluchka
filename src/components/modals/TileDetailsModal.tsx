import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TileIconImage } from '@/lib/pixelIcons';
import { formatMoney, cn } from '@/lib/utils';
import { TileData } from '@/types/game';
import { Info, ShieldAlert, Sparkles, Building2, Train, Zap, Landmark } from 'lucide-react';

export const TileDetailsModal: React.FC = () => {
  const { activeModal, modalData, closeModal, gameState, playerId, theme } = useGame();
  const isOpen = activeModal === 'tileDetails';
  const tile: TileData | null = modalData?.tile || null;

  if (!tile) return null;

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';
  const isPanel = gameState?.boardTheme === 'panel' || gameState?.theme === 'panel' || theme === 'panel' || Boolean(tile?.iconUrl?.includes('/panel/'));
  const isOffice = gameState?.boardTheme === 'office' || gameState?.theme === 'office' || theme === 'office' || Boolean(tile?.iconUrl?.includes('/office/'));
  const isProperty = tile.type === 'property';
  const isTransport = isProperty && tile.group === 'transport';
  const isUtility = isProperty && tile.group === 'utility';
  const isStreet = isProperty && !isTransport && !isUtility;

  const myPlayer = gameState?.players.find((p) => p.id === playerId);
  const isMine = tile.ownerId === playerId || (gameState?.gameMode === 'team' && myPlayer?.teamId && tile.teamId === myPlayer.teamId);

  // Special Non-Property Information (Chance, Chest, Jail, Start, Tax, Parking, GoToJail)
  const getSpecialInfo = () => {
    switch (tile.type) {
      case 'start':
        return isNoir ? {
          category: 'Бюро Детектива',
          badgeColor: 'bg-slate-900/20 text-[#00e676] border-[#00e676]/40',
          icon: '🕵️',
          description: tile.description || 'Ваш офис. Каждый раз, когда вы проходите или останавливаетесь здесь, вы получаете гонорар $200.',
          rules: [
            'Каждая глава начинается с этой точки',
            'Гонорар $200 зачисляется автоматически при прохождении',
            'Точная остановка на клетке дает дополнительный бонус'
          ]
        } : isSoviet ? {
          category: 'Космодром Байконур',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: '🚀',
          description:
            tile.description ||
            'Гагаринский старт площадки №1. При каждом прохождении или выходе на нулевой меридиан экипаж получает пополнение энергобаланса +200 кР из резерва Госкомиссии.',
          rules: [
            'Орбитальный виток начинается с этой точки',
            'Энергия +200 кР зачисляется автоматически при пересечении меридиана',
            'Точная посадка на клетку дает +300 кР'
          ]
        } : isPanel ? {
          category: 'День получки',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '💰',
          description:
            tile.description ||
            'Официальный аванс и получка. Каждый раз при прохождении или остановке на клетке вы получаете +$200 в бюджет.',
          rules: [
            'Каждый круг по спальному району начинается с этой клетки',
            'Получите законные $200 получки при пересечении черты',
            'Точная остановка приносит дополнительный бонус'
          ]
        } : isOffice ? {
          category: 'День зарплаты',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: '💳',
          description:
            tile.description ||
            'Зарплата упала на карту! Каждый раз при прохождении или остановке на клетке вы получаете +$200 оклада.',
          rules: [
            'Каждый рабочий цикл начинается с этой клетки',
            'Оклад $200 зачисляется автоматически при пересечении черты',
            'Точная остановка приносит дополнительный бонус'
          ]
        } : {
          category: 'Автодром «Старт»',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '🏁',
          description:
            tile.description ||
            'Стартовая черта автодрома. Каждый круг заезда приносит вам призовые +$200 на обслуживание автопарка.',
          rules: [
            'Каждый круг заезда начинается с этой клетки',
            'Получите $200 спонсорских призовых при пересечении черты',
            'Точная остановка на пит-лейне приносит дополнительный бонус'
          ]
        };
      case 'chance':
        return isNoir ? {
          category: 'Анонимка',
          badgeColor: 'bg-amber-900/20 text-[#d4a647] border-[#d4a647]/40',
          icon: '✉️',
          description: tile.description || 'Письмо без обратного адреса. Тяните верхнюю анонимку из стопки и следуйте указаниям.',
          rules: [
            'Может принести зацепку, деньги или проблемы',
            'Может направить вас по ложному следу на другое поле',
            'Может содержать компромат на мэра'
          ]
        } : isSoviet ? {
          category: 'Радиограмма «Шанс»',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: '📡',
          description:
            tile.description ||
            'Канал оперативной космической связи. При выходе в данный сектор экипаж принимает радиограмму из пакета «Шанс».',
          rules: [
            'Может принести премию АН СССР, коррекцию траектории или перерасход',
            'Может направить корабль к другому орбитальному комплексу',
            'Может содержать аварийный код выхода из карантина'
          ]
        } : isPanel ? {
          category: 'Объявления на столбе',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: '📋',
          description:
            tile.description ||
            'Случайные объявления и события спального района. Тяните карточку «Шанс» и испытайте судьбу.',
          rules: [
            'Может принести неожиданную шабашку, находку или штраф',
            'Может отправить на другую улицу района',
            'Может содержать записку для участкового'
          ]
        } : isOffice ? {
          category: 'Служебный шанс',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '💼',
          description:
            tile.description ||
            'Оффер от конкурентов, внезапная проверка или карьерный взлёт. Тяните карту «Шанс»!',
          rules: [
            'Тяните карту из стопки корпоративных шансов',
            'Действие карты применяется моментально',
            'Может кардинально изменить баланс сил в офисе'
          ]
        } : {
          category: 'Дорожный инцидент',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: '❓',
          description:
            tile.description ||
            'Неожиданные дорожные ситуации и форс-мажоры. Тяните карту «Шанс» и испытайте удачу на трассе.',
          rules: [
            'Может принести контракт со спонсором, штраф за превышение или бесплатный тюнинг',
            'Может эвакуировать автомобиль на другую клетку трассы',
            'Может содержать талон отмены штрафстоянки'
          ]
        };
      case 'chest':
        return isNoir ? {
          category: 'Дело №...',
          badgeColor: 'bg-red-900/20 text-[#8b0000] border-[#8b0000]/40',
          icon: '📁',
          description: tile.description || 'Материалы нераскрытых дел. Возьмите верхнюю папку из архива и следуйте инструкциям.',
          rules: [
            'Гонорары от клиентов, взятки, премии или штрафы',
            'Расходы на осведомителей и ремонт оборудования',
            'Дело расследуется немедленно'
          ]
        } : isSoviet ? {
          category: 'Госкомиссия ОКБ-1',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '★',
          description:
            tile.description ||
            'Директива Государственной комиссии. Прибыв сюда, экипаж исполняет приказ из реестра ЦУП.',
          rules: [
            'Государственные гранты, научные открытия и материально-техническое снабжение',
            'Расходы на регламентное обслуживание бортовых систем',
            'Директива исполняется незамедлительно'
          ]
        } : isPanel ? {
          category: 'Госуслуги / ЖЭК',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '🏛️',
          description:
            tile.description ||
            'Общественная касса и уведомления от Госуслуг и ЖЭКа. Возьмите карту и получите выплату или квитанцию.',
          rules: [
            'Социальные выплаты, перерасчет квартплаты или премии',
            'Расходы на ремонт подъезда, поверку счетчиков и домофон',
            'Карта разыгрывается немедленно'
          ]
        } : isOffice ? {
          category: 'Корпоративная Казна',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: '🎁',
          description:
            tile.description ||
            'Премиальный фонд, 13-я зарплата и дивиденды холдинга. Возьмите карту из казны!',
          rules: [
            'Тяните карту из корпоративной казны',
            'Премии, квартальные бонусы или офисные расходы',
            'Карта разыгрывается немедленно'
          ]
        } : {
          category: 'Гаражный фонд',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '🧰',
          description:
            tile.description ||
            'Касса автоклуба и фонд взаимопомощи гонщиков. Возьмите карту и получите выплату или счет за ТО.',
          rules: [
            'Призовые кубков, страховые выплаты, бонусы автоклуба или сборы на ремонт',
            'Расходы на замену масла, шиномонтаж и обслуживание автопарка',
            'Карта разыгрывается немедленно'
          ]
        };
      case 'jail':
        return isNoir ? {
          category: 'Каталажка',
          badgeColor: 'bg-slate-800/20 text-[#b8a890] border-[#b8a890]/40',
          icon: '⛓️',
          description: 'Если вы просто остановились на этом поле ходом — вы просто зашли навестить информатора в камере.',
          rules: [
            'Обычный ход: статус «Навещает» (вы свободно продолжаете игру)',
            'Если вас задержали в облаве: заплатите $50 залога, используйте связи в мэрии или выбросьте фарт',
            'После 3 неудачных попыток бросить фарт — залог $50 обязателен'
          ]
        } : isSoviet ? {
          category: 'Пояс Ван Аллена (Карантин)',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: '⚠️',
          description:
            'Сектор радиационной опасности и карантина. Обычный пролёт через этот сектор считается инспекционным визитом без ограничений.',
          rules: [
            'Штатный пролёт: никаких задержек и ограничений по связи',
            'При аварийной изоляции: продувка 50 кР, спецкод ЦУП или резонанс гироскопов (дубль)',
            'Максимум 3 витка в карантине, после чего продувка выполняется принудительно'
          ]
        } : isPanel ? {
          category: 'КПЗ РОВД',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: '👮',
          description:
            tile.description ||
            'Районное отделение милиции / полиции. Если вы просто остановились здесь ходом — это обычный визит к участковому или визит к соседу.',
          rules: [
            'Обычный ход: статус «Просто заглянул» (вы свободно продолжаете игру)',
            'При задержании: заплатите штраф $50, покажите справку или выбросьте дубль',
            'После 3 неудачных попыток бросить дубль — штраф $50 обязателен'
          ]
        } : isOffice ? {
          category: 'Штрафной кубикл',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: '📑',
          description:
            tile.description ||
            'Изоляция за срыв дедлайна или объяснительная в HR. Если вы остановились здесь ходом — вы просто зашли за чаем.',
          rules: [
            'Обычный ход: статус «Просто за чаем» (вы свободно продолжаете игру)',
            'При штрафе: оплатите неустойку $50, покажите пропуск или выбросьте дубль',
            'После 3 неудачных попыток бросить дубль — неустойка $50 обязательна'
          ]
        } : {
          category: 'Пост ДПС / Штрафстоянка',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: '🚔',
          description:
            tile.description ||
            'Если вы просто остановились на этом поле ходом — это плановая проверка документов без задержания.',
          rules: [
            'Обычный ход: статус «Проверка документов» (вы свободно продолжаете заезд)',
            'При задержании: заплатите штраф $50, используйте талон или выбросьте дубль',
            'После 3 неудачных попыток бросить дубль — оплата эвакуатора $50 обязательна'
          ]
        };
      case 'parking':
        return isNoir ? {
          category: 'Тёмный переулок',
          badgeColor: 'bg-teal-900/20 text-teal-500 border-teal-500/40',
          icon: '👤',
          description: tile.description || 'Безопасное место, чтобы залечь на дно. Никто не задает вопросов, никто не требует денег.',
          rules: [
            'Никаких платежей мафии или полиции',
            'Полная безопасность до следующего хода',
            'Можно спокойно выкурить сигарету'
          ]
        } : isSoviet ? {
          category: 'Геостационарный дрейф',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: '🛰️',
          description:
            tile.description ||
            'Орбитальный причал и зона свободного дрейфа. Здесь экипаж проводит профилактику без затрат энергии.',
          rules: [
            'Никаких пошлин, сборов телеметрии или штрафов',
            'Полная сохранность энергобаланса корабля',
            'Следующий импульс выдаётся в штатном порядке'
          ]
        } : isPanel ? {
          category: 'Лавочка у подъезда',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: '🐱',
          description:
            tile.description ||
            'Уютная лавочка у подъезда с дворовыми котами. Безопасное место для отдыха, где никто не требует платы за аренду.',
          rules: [
            'Никаких платежей и сборов ЖКХ',
            'Полный покой и безопасность до следующего хода',
            'Можно спокойно посидеть и покормить кота'
          ]
        } : isOffice ? {
          category: 'Кофе-брейк / Лаунж',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: '☕',
          description:
            tile.description ||
            'Зона отдыха, пуфы и безлимитный кофе. Безопасная передышка от совещаний и дедлайнов.',
          rules: [
            'Никаких корпоративных сборов и арендных выплат',
            'Полный релакс и безопасность до следующего хода',
            'Можно спокойно выпить кофе и перевести дух'
          ]
        } : {
          category: 'Пит-стоп / Автокемпинг',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: '🅿️',
          description:
            tile.description ||
            'Бесплатная стоянка и зона отдыха автоклуба. Остановка здесь безопасна и не требует расходов.',
          rules: [
            'Никаких арендных плат или дорожных сборов',
            'Гонщик отдыхает и готовит автомобиль к следующему кругу',
            'Банк не взимает дорожных сборов'
          ]
        };
      case 'gotojail':
        return isNoir ? {
          category: 'Облава',
          badgeColor: 'bg-red-900/20 text-[#ff4444] border-[#8b0000]/40',
          icon: '🚨',
          description: tile.description || 'За вами хвост! Немедленно отправляйтесь в каталажку. Не проходите через Бюро Детектива и не получайте $200.',
          rules: [
            'Немедленное перемещение в каталажку',
            'Гонорар $200 за прохождение Бюро не начисляется',
            'Текущее расследование прерывается'
          ]
        } : isSoviet ? {
          category: 'Аварийный сход с орбиты',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '🚨',
          description:
            tile.description ||
            'Приказ ЦУП: экстренный маневр! Корабль немедленно перемещается в сектор радиационного пояса Ван Аллена.',
          rules: [
            'Корабль телепортируется в зону карантина',
            'Энергетический бонус за Байконур не начисляется',
            'Текущий сеанс движения немедленно прекращается'
          ]
        } : isPanel ? {
          category: 'Наряд ППС',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '🚨',
          description:
            tile.description ||
            'Вас заметил наряд ППС! Немедленно проследуйте в КПЗ РОВД. Не проходите через Старт и не получайте получку $200.',
          rules: [
            'Немедленная доставка в КПЗ РОВД',
            'Получка $200 за прохождение Старта не выплачивается',
            'Текущий ход немедленно завершается'
          ]
        } : isOffice ? {
          category: 'Вызов на ковер',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '🚨',
          description:
            tile.description ||
            'Генеральный директор вызывает на срочный ковер! Немедленно проследуйте в штрафной кубикл. Не проходите через Старт и не получайте оклад $200.',
          rules: [
            'Немедленный перевод в штрафной кубикл',
            'Оклад $200 за прохождение Старта не выплачивается',
            'Текущий ход немедленно завершается'
          ]
        } : {
          category: 'Эвакуация на штрафстоянку',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '🚨',
          description:
            tile.description ||
            'Грубое нарушение ПДД! Ваш автомобиль немедленно эвакуируют на Штрафстоянку. Не пересекайте Старт и не получайте $200.',
          rules: [
            'Немедленная эвакуация автомобиля на штрафстоянку',
            'Призовой бонус $200 за круг Старт не начисляется',
            'Текущий заезд немедленно завершается'
          ]
        };
      case 'tax':
        return isNoir ? {
          category: 'Крыша',
          badgeColor: 'bg-amber-900/20 text-[#d4a647] border-[#d4a647]/40',
          icon: '💰',
          description: tile.description || `Пришло время платить за спокойствие. Отдайте синдикату $${tile.amount || 200}.`,
          rules: [
            `Сумма выплаты: $${tile.amount || 200}`,
            'Деньги уходят в общак',
            'При нехватке средств придется идти к ростовщику'
          ]
        } : isSoviet ? {
          category: 'Энергетический сбор',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '⚡',
          description:
            tile.description ||
            `Сбор на развитие орбитальной инфраструктуры. При остановке экипаж перечисляет ${tile.amount || 200} кР в фонд Академии Наук СССР.`,
          rules: [
            `Сумма сбора: ${tile.amount || 200} кР`,
            'Энергия списывается в центральный фонд программы',
            'При нехватке энергии законсервируйте объекты в резерв'
          ]
        } : isPanel ? {
          category: 'Квитанция ЖКХ / Капремонт',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '🧾',
          description:
            tile.description ||
            `Обязательный платеж по квитанции ЖКХ и капремонту. Оплатите в кассу $${tile.amount || 200}.`,
          rules: [
            `Сумма сбора: $${tile.amount || 200}`,
            'Деньги перечисляются в коммунальный фонд',
            'При нехватке средств заложите недвижимость в банк'
          ]
        } : isOffice ? {
          category: 'НДФЛ / Корпоративный сбор',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '🧾',
          description:
            tile.description ||
            `Обязательный налоговый вычет и сбор на корпоратив. Оплатите в кассу $${tile.amount || 200}.`,
          rules: [
            `Сумма сбора: $${tile.amount || 200}`,
            'Деньги перечисляются в корпоративную бухгалтерию',
            'При нехватке средств заложите отдел в казну'
          ]
        } : {
          category: 'Транспортный налог / Утильсбор',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '🧾',
          description:
            tile.description ||
            `Обязательный дорожный сбор. Оплатите в кассу $${tile.amount || 200}.`,
          rules: [
            `Сумма сбора: $${tile.amount || 200}`,
            'Деньги перечисляются в дорожный фонд',
            'При нехватке средств заложите автомобили из автопарка'
          ]
        };
      default:
        return {
          category: isNoir ? 'Неизвестная локация' : isSoviet ? 'Специальный сектор' : isPanel ? 'Специальный сектор' : isOffice ? 'Служебный сектор' : 'Специальное поле',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: 'ℹ️',
          description: tile.description || (isNoir ? 'Тайное место в городе.' : isSoviet ? 'Специальный сектор космической программы.' : isPanel ? 'Специальный сектор района.' : isOffice ? 'Корпоративный сектор холдинга.' : 'Специальное игровое поле.'),
          rules: []
        };
    }
  };

  const specialInfo = !isProperty ? getSpecialInfo() : null;
  const owner = tile.ownerId ? gameState?.players.find((p) => p.id === tile.ownerId) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className={cn(
        "max-w-sm text-center p-5 shadow-2xl rounded-none border",
        isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-slate-500/50 font-sans"
      )}>
        {/* Color / Group Header */}
        {isProperty && tile.color ? (
          <div className="flex items-center justify-center gap-2 mb-1">
            <span
              className="w-3.5 h-3.5 rounded-none border border-black/40"
              style={{
                backgroundColor: tile.color,
                boxShadow: `0 0 6px ${tile.color}88`,
              }}
            />
            <span className={cn("text-xs font-bold uppercase tracking-wider", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white")}>
              {tile.groupName || tile.group}
            </span>
          </div>
        ) : specialInfo ? (
          <div className="flex items-center justify-center mb-1">
            <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none border font-bold", isNoir ? "font-noir-title bg-[#1a1410] border-[#d4a647]/40 text-[#d4a647]" : isSoviet ? "font-soviet bg-[#09111c] border-[#38bdf8]/40 text-[#38bdf8]" : "bg-[#020617] border-slate-500/50 text-slate-300")}>
              {specialInfo.category}
            </span>
          </div>
        ) : null}

        <DialogHeader className="flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-1 flex items-center justify-center">
            <TileIconImage tile={tile} className="w-full h-full object-contain filter contrast-125 brightness-95 drop-shadow-md" />
          </div>
          <DialogTitle className={cn("text-lg sm:text-xl font-bold justify-center", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white font-sans")}>{tile.name}</DialogTitle>
          <span className={cn("text-xs", isNoir ? "font-noir-body text-[#b8a890]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-medium")}>
            {isProperty ? (tile.groupName || (isNoir ? 'ДОСЬЕ НА ТЕРРИТОРИЮ' : isSoviet ? 'ТЕХНИЧЕСКИЙ ПАСПОРТ ОКБ-1' : isPanel ? 'КАРТОЧКА НЕДВИЖИМОСТИ' : isOffice ? 'КАРТОЧКА ОТДЕЛА' : 'ТЕХПАСПОРТ АВТОМОБИЛЯ')) : (isNoir ? 'ОСОБОЕ МЕСТО' : isSoviet ? 'СПЕЦИАЛЬНЫЙ СЕКТОР' : 'СПЕЦИАЛЬНЫЙ СЕКТОР')}
          </span>
        </DialogHeader>

        {/* 0. PROPERTY VEHICLE / ASSET DESCRIPTION */}
        {isProperty && tile.description && (
          <div className={cn(
            "p-2.5 rounded-none border text-left text-xs sm:text-sm leading-relaxed italic my-1",
            isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#020617] border-slate-500/30 text-slate-200"
          )}>
            <p className="leading-snug">{tile.description}</p>
          </div>
        )}

        {/* 1. SPECIAL NON-PROPERTY TILES */}
        {!isProperty && specialInfo && (
          <div className="flex flex-col gap-2.5 py-2 text-left">
            <div className={cn("p-3 rounded-none border leading-relaxed", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#020617] border-slate-500/30 text-slate-100")}>
              <p className="text-xs sm:text-sm leading-normal">
                {specialInfo.description}
              </p>
            </div>

            {specialInfo.rules && specialInfo.rules.length > 0 && (
              <div className={cn("p-2.5 rounded-none border flex flex-col gap-1", isNoir ? "bg-[#1a1410] border-[#d4a647]/20" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/20" : "bg-[#020617] border-slate-500/20")}>
                <span className={cn("text-[10px] flex items-center gap-1.5 uppercase tracking-wider font-bold", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#38bdf8]" : "text-slate-400")}>
                  <Info className="w-3.5 h-3.5" />
                  {isNoir ? 'СВОДКА:' : isSoviet ? 'РЕГЛАМЕНТ СЕКТОРА:' : 'ПРАВИЛА ИГРЫ:'}
                </span>
                <ul className="flex flex-col gap-0.5 text-xs text-slate-200 pl-1">
                  {specialInfo.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className={cn("font-bold leading-tight", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>•</span>
                      <span className={cn(isNoir ? "text-[#b8a890]" : "")}>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 2. TRANSPORT HUB */}
        {isTransport && (
          <div className="flex flex-col gap-2 py-2 text-xs">
            {/* Owner Info */}
            <div className={cn("flex items-center justify-between p-2 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
              <span className={cn("font-semibold", isNoir ? "text-[#b8a890] font-noir-title" : isSoviet ? "text-[#94a3b8] font-soviet" : "text-slate-300")}>{isNoir ? "Детектив:" : isSoviet ? "Экипаж:" : "Владелец:"}</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: owner.color.hex }} />
                  <span>{owner.name}</span>
                  {isMine && <span className={cn("text-[8px] px-1 py-0 rounded-none text-white", isNoir ? "bg-[#8b0000]" : "bg-[#0284c7]")}>ВЫ</span>}
                </div>
              ) : (
                <span className={cn("font-bold", isNoir ? "text-[#00e676]" : "text-[#00e676]")}>{isNoir ? "Ничья территория" : isSoviet ? "Свободно" : "Свободно для покупки"}</span>
              )}
            </div>

            <div className={cn("flex flex-col gap-1 p-2.5 rounded-none border text-left", isNoir ? "bg-[#1a1410]/80 border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c]/80 border-[#38bdf8]/30 font-space" : "bg-[#020617]/80 border-slate-500/30 font-sans")}>
              <div className="flex justify-between text-white text-xs font-bold">
                <span className={isNoir ? "text-[#f5e6c8]" : ""}>{isNoir ? "СТОИМОСТЬ:" : isSoviet ? "СТОИМОСТЬ:" : isPanel ? "СТОИМОСТЬ МАРШРУТА:" : isOffice ? "СТОИМОСТЬ ЛИНИИ:" : "СТОИМОСТЬ ПОКУПКИ:"}</span>
                <span className="font-bold text-sm text-[#00e676]">{isNoir ? `$${tile.price || 200}` : isSoviet ? `${tile.price || 200} кР` : `$${tile.price || 200}`}</span>
              </div>
              <div className={cn("flex flex-col gap-1 pt-1.5 border-t text-xs", isNoir ? "border-[#d4a647]/20 text-[#f5e6c8]" : isSoviet ? "border-[#38bdf8]/20" : "border-slate-500/20")}>
                <div className="flex justify-between"><span>{isNoir ? "1 станция:" : isSoviet ? "1 космодром:" : isPanel ? "1 маршрут:" : isOffice ? "1 линия:" : "1 авто:"}</span><span className="font-bold text-sm">{isNoir ? "$25" : isSoviet ? "25 кР" : "$25"}</span></div>
                <div className="flex justify-between"><span>{isNoir ? "2 станции:" : isSoviet ? "2 космодрома:" : isPanel ? "2 маршрута:" : isOffice ? "2 линии:" : "2 авто:"}</span><span className="font-bold text-sm">{isNoir ? "$50" : isSoviet ? "50 кР" : "$50"}</span></div>
                <div className="flex justify-between"><span>{isNoir ? "3 станции:" : isSoviet ? "3 космодрома:" : isPanel ? "3 маршрута:" : isOffice ? "3 линии:" : "3 авто:"}</span><span className="font-bold text-sm">{isNoir ? "$100" : isSoviet ? "100 кР" : "$100"}</span></div>
                <div className={cn("flex justify-between font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")}><span>{isNoir ? "4 станции (вся сеть):" : isSoviet ? "4 космодрома (вся сеть):" : isPanel ? "4 маршрута (вся городская сеть):" : isOffice ? "4 линии (вся логистика):" : "4 авто (весь коммерческий парк):"}</span><span className="font-bold text-sm">{isNoir ? "$200" : isSoviet ? "200 кР" : "$200"}</span></div>
              </div>
              {tile.mortgageValue && (
                <div className={cn("flex justify-between text-xs pt-1 border-t", isNoir ? "border-[#d4a647]/20 text-[#b8a890]" : isSoviet ? "border-[#38bdf8]/20 text-[#94a3b8]" : "border-slate-500/20 text-[#94a3b8]")}>
                  <span>{isNoir ? "Залог у ростовщика:" : isSoviet ? "Резерв АН СССР:" : isPanel ? "Залог в банке:" : isOffice ? "Залог в казне:" : "Залоговая стоимость:"}</span>
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#f5e6c8]" : "text-white")}>{isNoir ? `$${tile.mortgageValue}` : isSoviet ? `${tile.mortgageValue} кР` : `$${tile.mortgageValue}`}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. UTILITY SERVICES */}
        {isUtility && (
          <div className="flex flex-col gap-2 py-2 text-xs">
            {/* Owner Info */}
            <div className={cn("flex items-center justify-between p-2 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
              <span className={cn("font-semibold", isNoir ? "text-[#b8a890] font-noir-title" : isSoviet ? "text-[#94a3b8] font-soviet" : "text-slate-300")}>{isNoir ? "Детектив:" : isSoviet ? "Экипаж:" : "Владелец:"}</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: owner.color.hex }} />
                  <span>{owner.name}</span>
                  {isMine && <span className={cn("text-[8px] px-1 py-0 rounded-none text-white", isNoir ? "bg-[#8b0000]" : "bg-[#0284c7]")}>ВЫ</span>}
                </div>
              ) : (
                <span className={cn("font-bold", isNoir ? "text-[#00e676]" : "text-[#00e676]")}>{isNoir ? "Ничья территория" : isSoviet ? "Свободно" : "Свободно для покупки"}</span>
              )}
            </div>

            <div className={cn("flex flex-col gap-1 p-2.5 rounded-none border text-left", isNoir ? "bg-[#1a1410]/80 border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c]/80 border-[#38bdf8]/30 font-space" : "bg-[#020617]/80 border-slate-500/30 font-sans")}>
              <div className="flex justify-between text-white text-xs font-bold">
                <span className={isNoir ? "text-[#f5e6c8]" : ""}>{isNoir ? "СТОИМОСТЬ:" : isSoviet ? "СТОИМОСТЬ:" : isPanel ? "СТОИМОСТЬ СЛУЖБЫ:" : isOffice ? "СТОИМОСТЬ СЛУЖБЫ:" : "СТОИМОСТЬ ПОКУПКИ:"}</span>
                <span className="font-bold text-sm text-[#00e676]">{isNoir ? `$${tile.price || 150}` : isSoviet ? `${tile.price || 150} кР` : `$${tile.price || 150}`}</span>
              </div>
              <div className={cn("flex flex-col gap-1 pt-1.5 border-t text-xs", isNoir ? "border-[#d4a647]/20 text-[#f5e6c8]" : isSoviet ? "border-[#38bdf8]/20" : "border-slate-500/20")}>
                <div className="flex justify-between"><span>{isNoir ? "1 служба:" : isSoviet ? "1 энергоузел:" : isPanel ? "1 служба (Водоканал / Электросети):" : isOffice ? "1 служба (Helpdesk / Завхоз):" : "1 сервис (АЗС или СТО):"}</span><span className="font-bold text-sm">{isNoir ? "$20" : isSoviet ? "20 кР" : "$20"}</span></div>
                <div className={cn("flex justify-between font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")}><span>{isNoir ? "2 службы:" : isSoviet ? "2 узла (ЕЭС СССР):" : isPanel ? "2 службы (обе городские сети):" : isOffice ? "2 службы (обе техслужбы):" : "2 сервиса (АЗС и СТО):"}</span><span className="font-bold text-sm">{isNoir ? "$60" : isSoviet ? "60 кР" : "$60"}</span></div>
              </div>
              {tile.mortgageValue && (
                <div className={cn("flex justify-between text-xs pt-1 border-t", isNoir ? "border-[#d4a647]/20 text-[#b8a890]" : isSoviet ? "border-[#38bdf8]/20 text-[#94a3b8]" : "border-slate-500/20 text-[#94a3b8]")}>
                  <span>{isNoir ? "Залог у ростовщика:" : isSoviet ? "Резерв АН СССР:" : isOffice ? "Залог в казне:" : "Залоговая стоимость:"}</span>
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#f5e6c8]" : "text-white")}>{isNoir ? `$${tile.mortgageValue}` : isSoviet ? `${tile.mortgageValue} кР` : `$${tile.mortgageValue}`}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. REGULAR STREET REAL ESTATE */}
        {isStreet && (
          <div className="flex flex-col gap-2 py-2 text-xs">
            {/* Owner Info */}
            <div className={cn("flex items-center justify-between p-2 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
              <span className={cn("font-semibold", isNoir ? "text-[#b8a890] font-noir-title" : isSoviet ? "text-[#94a3b8] font-soviet" : "text-slate-300")}>{isNoir ? "Детектив:" : isSoviet ? "Экипаж:" : "Владелец:"}</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: owner.color.hex }} />
                  <span>{owner.name}</span>
                  {isMine && <span className={cn("text-[8px] px-1 py-0 rounded-none text-white", isNoir ? "bg-[#8b0000]" : "bg-[#0284c7]")}>ВЫ</span>}
                </div>
              ) : (
                <span className={cn("font-bold", isNoir ? "text-[#00e676]" : "text-[#00e676]")}>{isNoir ? "Ничья территория" : isSoviet ? "Свободно" : "Свободно для покупки"}</span>
              )}
            </div>

            {/* Price & Rent Details */}
            {tile.price && (
              <div className={cn("flex flex-col gap-1 p-2.5 rounded-none border text-left", isNoir ? "bg-[#1a1410]/80 border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c]/80 border-[#38bdf8]/30 font-space" : "bg-[#020617]/80 border-slate-500/30 font-sans")}>
                <div className="flex justify-between text-white text-xs font-bold">
                  <span className={isNoir ? "text-[#f5e6c8]" : ""}>{isNoir ? "СТОИМОСТЬ:" : isSoviet ? "СТОИМОСТЬ СЕКТОРА:" : isPanel ? "СТОИМОСТЬ ОБЪЕКТА:" : isOffice ? "СТОИМОСТЬ ОТДЕЛА:" : "СТОИМОСТЬ АВТОМОБИЛЯ:"}</span>
                  <span className="font-bold text-sm text-[#00e676]">{isNoir ? `$${tile.price}` : isSoviet ? `${tile.price} кР` : `$${tile.price}`}</span>
                </div>
                {tile.rent !== undefined && (
                  <div className={cn("flex justify-between text-xs", isNoir ? "text-[#f5e6c8]" : "")}>
                    <span>{isNoir ? "Базовая дань:" : isSoviet ? "Базовый сбор телеметрии:" : isPanel ? "Базовая аренда:" : isOffice ? "Базовая ставка:" : "Базовый заезд (аренда):"}</span>
                    <span className={cn("font-bold text-sm", isNoir ? "text-[#f5e6c8]" : "text-white")}>{isNoir ? `$${tile.rent}` : isSoviet ? `${tile.rent} кР` : `$${tile.rent}`}</span>
                  </div>
                )}
                {tile.rents && tile.rents.length >= 5 && (
                  <div className={cn("flex flex-col gap-0.5 pt-1.5 border-t text-xs", isNoir ? "border-[#d4a647]/20 text-[#f5e6c8]" : isSoviet ? "border-[#38bdf8]/20" : "border-slate-500/20")}>
                    <div className="flex justify-between"><span>{isNoir ? "С 1 явкой:" : isSoviet ? "С 1 модулем связи:" : isPanel ? "С 1 домом:" : isOffice ? "С 1 отделом 📁:" : "С 1 тюнингом (1 дом):"}</span><span className="font-bold text-sm">{isNoir ? `$${tile.rents[1]}` : isSoviet ? `${tile.rents[1]} кР` : `$${tile.rents[1]}`}</span></div>
                    <div className="flex justify-between"><span>{isNoir ? "С 2 явками:" : isSoviet ? "С 2 модулями связи:" : isPanel ? "С 2 домами:" : isOffice ? "С 2 отделами 📁📁:" : "С 2 тюнингами (2 дома):"}</span><span className="font-bold text-sm">{isNoir ? `$${tile.rents[2]}` : isSoviet ? `${tile.rents[2]} кР` : `$${tile.rents[2]}`}</span></div>
                    <div className="flex justify-between"><span>{isNoir ? "С 3 явками:" : isSoviet ? "С 3 модулями связи:" : isPanel ? "С 3 домами:" : isOffice ? "С 3 отделами 📁📁📁:" : "С 3 тюнингами (3 дома):"}</span><span className="font-bold text-sm">{isNoir ? `$${tile.rents[3]}` : isSoviet ? `${tile.rents[3]} кР` : `$${tile.rents[3]}`}</span></div>
                    <div className="flex justify-between"><span>{isNoir ? "С 4 явками:" : isSoviet ? "С 4 модулями связи:" : isPanel ? "С 4 домами:" : isOffice ? "С 4 отделами 📁📁📁📁:" : "С 4 тюнингами (4 дома):"}</span><span className="font-bold text-sm">{isNoir ? `$${tile.rents[4]}` : isSoviet ? `${tile.rents[4]} кР` : `$${tile.rents[4]}`}</span></div>
                    <div className={cn("flex justify-between font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")}><span>{isNoir ? "Со штабом:" : isSoviet ? "С комплексом «МИР»:" : isPanel ? "С отелем 🏨:" : isOffice ? "Холдинг 🏢:" : "Автосалон (Отель):"}</span><span className="font-bold text-base text-[#00e676]">{isNoir ? `$${tile.rents[5]}` : isSoviet ? `${tile.rents[5]} кР` : `$${tile.rents[5]}`}</span></div>
                  </div>
                )}
                {tile.housePrice && (
                  <div className={cn("flex justify-between text-xs pt-1 border-t", isNoir ? "border-[#d4a647]/20 text-[#b8a890]" : isSoviet ? "border-[#38bdf8]/20 text-[#94a3b8]" : "border-slate-500/20 text-[#94a3b8]")}>
                    <span>{isNoir ? "Цена явки:" : isSoviet ? "Монтаж модуля:" : isPanel ? "Стоимость дома:" : isOffice ? "Стоимость отдела:" : "Стоимость тюнинга (дома):"}</span>
                    <span className={cn("font-bold text-sm", isNoir ? "text-[#f5e6c8]" : "text-white")}>{isNoir ? `$${tile.housePrice}` : isSoviet ? `${tile.housePrice} кР (+25%/ур.)` : `$${tile.housePrice}`}</span>
                  </div>
                )}
                {tile.mortgageValue && (
                  <div className={cn("flex justify-between text-xs", isNoir ? "text-[#b8a890]" : "text-[#94a3b8]")}>
                    <span>{isNoir ? "Залог у ростовщика:" : isSoviet ? "Резерв АН СССР:" : isOffice ? "Залог в казне:" : "Залоговая стоимость:"}</span>
                    <span className={cn("font-bold text-sm", isNoir ? "text-[#f5e6c8]" : "text-white")}>{isNoir ? `$${tile.mortgageValue}` : isSoviet ? `${tile.mortgageValue} кР` : `$${tile.mortgageValue}`}</span>
                  </div>
                )}
              </div>
            )}

            {/* Status info */}
            {tile.isMortgaged && (
              <div className={cn("p-2 rounded-none text-center text-xs font-bold border", isNoir ? "bg-[#1a1410] border-[#8b0000] text-[#ff4444] font-noir-title" : isSoviet ? "bg-[#260a0e] border-[#dc2626] text-[#fca5a5] font-soviet" : "bg-red-950/80 border-red-500/50 text-red-200")}>
                {isNoir ? "[ ТЕРРИТОРИЯ В ЗАЛОГЕ ]" : isSoviet ? "[ ОБЪЕКТ ЗАКОНСЕРВИРОВАН В РЕЗЕРВ АН СССР ]" : isPanel ? "[ ОБЪЕКТ В ЗАЛОГЕ У БАНКА ]" : isOffice ? "[ ОТДЕЛ ЗАЛОЖЕН В КАЗНУ ]" : "[ АВТОМОБИЛЬ В ЗАЛОГЕ У БАНКА ]"}
              </div>
            )}
          </div>
        )}

        <DialogFooter className={cn("pt-2 border-t", isNoir ? "border-[#d4a647]/30 font-noir-title" : isSoviet ? "border-[#38bdf8]/30 font-soviet" : "border-slate-500/30")}>
          <button className={cn("w-full h-8 text-xs rounded-none font-bold", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")} onClick={closeModal}>
            {isNoir ? "ЗАКРЫТЬ ДОСЬЕ" : isSoviet ? "ЗАКРЫТЬ ПАСПОРТ ★" : "ЗАКРЫТЬ КАРТОЧКУ"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
