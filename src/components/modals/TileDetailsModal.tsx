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
import { formatMoney } from '@/lib/utils';
import { TileData } from '@/types/game';
import { Info, ShieldAlert, Sparkles, Building2, Train, Zap, Landmark } from 'lucide-react';

export const TileDetailsModal: React.FC = () => {
  const { activeModal, modalData, closeModal, gameState, playerId } = useGame();
  const isOpen = activeModal === 'tileDetails';
  const tile: TileData | null = modalData?.tile || null;

  if (!tile) return null;

  const isProperty = tile.type === 'property';
  const isTransport = isProperty && tile.group === 'transport';
  const isUtility = isProperty && tile.group === 'utility';
  const isStreet = isProperty && !isTransport && !isUtility;

  const owner = tile.ownerId && gameState ? gameState.players.find((p) => p.id === tile.ownerId) : null;
  const isMine = tile.ownerId === playerId;

  // Special Non-Property Information (Chance, Chest, Jail, Start, Tax, Parking, GoToJail)
  const getSpecialInfo = () => {
    switch (tile.type) {
      case 'start':
        return {
          category: 'Стартовая клетка',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '🚀',
          description:
            tile.description ||
            'Начальная точка игрового поля. При каждом прохождении или остановке на этой клетке игрок получает выплату +$200 из банка.',
          rules: [
            'Круг начинается с этой клетки',
            'Бонус +$200 начисляется автоматически при пересечении',
            'Не облагается арендной платой и налогами'
          ]
        };
      case 'chance':
        return {
          category: 'Карта Шанса',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: '❓',
          description:
            tile.description ||
            'Клетка удачи и риска. Остановившись здесь, вы вытягиваете случайную карту из колоды "Шанс".',
          rules: [
            'Может принести денежный приз, ремонт авто или налоги',
            'Может переместить вас на другую улицу или прямо в тюрьму',
            'Может содержать карту бесплатного освобождения из тюрьмы'
          ]
        };
      case 'chest':
        return {
          category: 'Общественная Казна',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: '🎁',
          description:
            tile.description ||
            'Клетка городской казны. Остановившись здесь, вы получаете выплату или счёт из колоды "Общественная казна".',
          rules: [
            'Налоговые возвраты, страховые выплаты и подарки',
            'Оплата коммунальных услуг или непредвиденных расходов',
            'Действие карты применяется немедленно'
          ]
        };
      case 'jail':
        return {
          category: 'Тюремный сектор',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: '⛓️',
          description:
            'Сектор заключения и посещения. Если вы пришли сюда обычным ходом кубиков — вы просто посетитель и свободно продолжаете игру.',
          rules: [
            'Простое посещение: никаких штрафов и задержек',
            'В заключении: выход залог $50, карта освобождения или дубль на кубиках',
            'Максимум 3 хода в заключении, после чего залог списывается автоматически'
          ]
        };
      case 'parking':
        return {
          category: 'Бесплатная парковка',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: '🅿️',
          description:
            tile.description ||
            'Безопасная зона отдыха для игроков. Здесь можно перевести дух перед следующими раундами.',
          rules: [
            'Никаких платежей, аренды или штрафов',
            'Полная безопасность для вашего капитала',
            'Следующий ход совершается в обычном порядке'
          ]
        };
      case 'gotojail':
        return {
          category: 'Полицейский арест',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '👮',
          description:
            tile.description ||
            'Немедленный арест! Фишка игрока мгновенно перемещается в Тюрьму.',
          rules: [
            'Фишка телепортируется в Тюрьму',
            'Бонус за прохождение СТАРТА не выплачивается',
            'Текущий ход игрока немедленно завершается'
          ]
        };
      case 'tax':
        return {
          category: 'Налоговый сбор',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: '💸',
          description:
            tile.description ||
            `Государственный налоговый сбор. Остановившись на этой клетке, игрок обязан выплатить $${tile.amount || 200} в пользу банка.`,
          rules: [
            `Сумма сбора: $${tile.amount || 200}`,
            'Деньги списываются в пользу банка',
            'При нехватке наличных заложите имущество или продайте дома'
          ]
        };
      default:
        return {
          category: 'Специальное поле',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: 'ℹ️',
          description: tile.description || 'Специальный сектор игрового поля.',
          rules: []
        };
    }
  };

  const specialInfo = !isProperty ? getSpecialInfo() : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-sm text-center p-5">
        {/* Color / Group Header */}
        {isProperty && tile.color ? (
          <div className="flex items-center justify-center gap-2 mb-1">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/30"
              style={{
                backgroundColor: tile.color,
                boxShadow: `0 0 10px ${tile.color}, 0 0 18px ${tile.color}88`,
              }}
            />
            <span className="text-xs font-black text-white/90 uppercase tracking-wider">
              {tile.groupName || tile.group}
            </span>
          </div>
        ) : specialInfo ? (
          <div className="flex items-center justify-center mb-1">
            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${specialInfo.badgeColor}`}>
              {specialInfo.category}
            </Badge>
          </div>
        ) : null}

        <DialogHeader className="flex flex-col items-center">
          <div className="w-14 h-14 mb-1 flex items-center justify-center">
            <TileIconImage tile={tile} />
          </div>
          <DialogTitle className="text-xl font-black justify-center">{tile.name}</DialogTitle>
          <span className="text-sm font-semibold text-muted-foreground">
            {isProperty ? (tile.groupName || 'Недвижимость') : 'Специальный сектор'}
          </span>
        </DialogHeader>

        {/* 1. SPECIAL NON-PROPERTY TILES (Chance, Chest, Jail, Start, Parking, GoToJail, Tax) */}
        {!isProperty && specialInfo && (
          <div className="flex flex-col gap-3 py-2 text-left">
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 leading-relaxed text-slate-200">
              <p className="text-sm sm:text-[15px] font-medium leading-normal text-white/95">
                {specialInfo.description}
              </p>
            </div>

            {specialInfo.rules && specialInfo.rules.length > 0 && (
              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1.5">
                <span className="text-xs font-black text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-400" />
                  Правила сектора:
                </span>
                <ul className="flex flex-col gap-1 text-xs sm:text-[13px] text-slate-300 pl-1">
                  {specialInfo.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold leading-tight">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 2. TRANSPORT HUB (Citymapper, Airbnb, Booking, Expedia) */}
        {isTransport && (
          <div className="flex flex-col gap-2.5 py-2 text-xs sm:text-sm">
            {/* Owner Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
              <span className="text-muted-foreground font-semibold">Владелец:</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: owner.color.hex }} />
                  <span>{owner.name}</span>
                  {isMine && <Badge variant="gold" className="text-[10px] px-1.5 py-0 font-bold">Вы</Badge>}
                </div>
              ) : (
                <Badge variant="outline" className="text-muted-foreground font-semibold">Свободно</Badge>
              )}
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/20 border border-white/5 text-left">
              <div className="flex justify-between font-bold text-foreground text-sm">
                <span>Стоимость покупки:</span>
                <span className="text-amber-400 font-black">{formatMoney(tile.price || 200)}</span>
              </div>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5 text-xs sm:text-[13px]">
                <div className="flex justify-between"><span>1 транспортная компания:</span><span className="font-bold">{formatMoney(25)}</span></div>
                <div className="flex justify-between"><span>2 транспортные компании:</span><span className="font-bold">{formatMoney(50)}</span></div>
                <div className="flex justify-between"><span>3 транспортные компании:</span><span className="font-bold">{formatMoney(100)}</span></div>
                <div className="flex justify-between font-black text-emerald-400"><span>4 компании (вся сеть):</span><span>{formatMoney(200)}</span></div>
              </div>
              {tile.mortgageValue && (
                <div className="flex justify-between text-xs text-muted-foreground pt-1.5 border-t border-white/5">
                  <span>Залог в банке:</span>
                  <span className="font-bold text-foreground">{formatMoney(tile.mortgageValue)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground/80 italic text-center">
              ℹ️ Не улучшается домами. Рента со всех вокзалов владельца возрастает с каждой новой покупкой.
            </p>
          </div>
        )}

        {/* 3. UTILITY SERVICES (WinRAR, Speedtest) */}
        {isUtility && (
          <div className="flex flex-col gap-2.5 py-2 text-xs sm:text-sm">
            {/* Owner Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
              <span className="text-muted-foreground font-semibold">Владелец:</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: owner.color.hex }} />
                  <span>{owner.name}</span>
                  {isMine && <Badge variant="gold" className="text-[10px] px-1.5 py-0 font-bold">Вы</Badge>}
                </div>
              ) : (
                <Badge variant="outline" className="text-muted-foreground font-semibold">Свободно</Badge>
              )}
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/20 border border-white/5 text-left">
              <div className="flex justify-between font-bold text-foreground text-sm">
                <span>Стоимость покупки:</span>
                <span className="text-amber-400 font-black">{formatMoney(tile.price || 150)}</span>
              </div>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5 text-xs sm:text-[13px]">
                <div className="flex justify-between"><span>1 сервис во владении:</span><span className="font-bold">{formatMoney(20)}</span></div>
                <div className="flex justify-between font-black text-emerald-400"><span>2 сервиса (монополия):</span><span>{formatMoney(60)}</span></div>
              </div>
              {tile.mortgageValue && (
                <div className="flex justify-between text-xs text-muted-foreground pt-1.5 border-t border-white/5">
                  <span>Залог в банке:</span>
                  <span className="font-bold text-foreground">{formatMoney(tile.mortgageValue)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground/80 italic text-center">
              ℹ️ Не улучшается домами. Рента утраивается при владении обоими сервисами группы.
            </p>
          </div>
        )}

        {/* 4. REGULAR STREET REAL ESTATE */}
        {isStreet && (
          <div className="flex flex-col gap-3 py-2 text-xs sm:text-sm">
            {/* Owner Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
              <span className="text-muted-foreground font-semibold">Владелец:</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: owner.color.hex }} />
                  <span>{owner.name}</span>
                  {isMine && <Badge variant="gold" className="text-[10px] px-1.5 py-0 font-bold">Вы</Badge>}
                </div>
              ) : (
                <Badge variant="outline" className="text-muted-foreground font-semibold">Свободно</Badge>
              )}
            </div>

            {/* Price & Rent Details */}
            {tile.price && (
              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5 text-left">
                <div className="flex justify-between font-bold text-foreground text-sm">
                  <span>Стоимость покупки:</span>
                  <span className="text-amber-400 font-black">{formatMoney(tile.price)}</span>
                </div>
                {tile.rent !== undefined && (
                  <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
                    <span>Базовая аренда:</span>
                    <span className="text-foreground font-bold">{formatMoney(tile.rent)}</span>
                  </div>
                )}
                {tile.rents && tile.rents.length >= 5 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5 text-xs sm:text-[13px]">
                    <div className="flex justify-between"><span>С 1 домом:</span><span className="font-bold">{formatMoney(tile.rents[1])}</span></div>
                    <div className="flex justify-between"><span>С 2 домами:</span><span className="font-bold">{formatMoney(tile.rents[2])}</span></div>
                    <div className="flex justify-between"><span>С 3 домами:</span><span className="font-bold">{formatMoney(tile.rents[3])}</span></div>
                    <div className="flex justify-between"><span>С 4 домами:</span><span className="font-bold">{formatMoney(tile.rents[4])}</span></div>
                    <div className="flex justify-between font-black text-emerald-400 text-sm"><span>С отелем:</span><span>{formatMoney(tile.rents[5])}</span></div>
                  </div>
                )}
                {tile.housePrice && (
                  <div className="flex justify-between text-xs text-muted-foreground pt-1.5 border-t border-white/5">
                    <span>Цена постройки дома:</span>
                    <span className="font-bold text-foreground">{formatMoney(tile.housePrice)}</span>
                  </div>
                )}
                {tile.mortgageValue && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Залог в банке:</span>
                    <span className="font-bold text-foreground">{formatMoney(tile.mortgageValue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Status info */}
            {tile.isMortgaged && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-center font-bold text-xs">
                ⚠️ Недвижимость находится в залоге у банка
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-white/10">
          <Button variant="default" className="w-full text-sm font-bold h-9" onClick={closeModal}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
