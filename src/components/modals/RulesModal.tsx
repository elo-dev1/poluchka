import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Dices,
  Building2,
  Train,
  DollarSign,
} from 'lucide-react';

export const RulesModal: React.FC = () => {
  const { activeModal, closeModal } = useGame();
  const isOpen = activeModal === 'rules';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-5 bg-[#0f1326] border-white/15 text-foreground select-none">
        <DialogHeader className="border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                Правила игры «Получка»
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Краткое руководство по игровым механикам и экономике
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full flex-1 flex flex-col min-h-0 mt-3">
          <TabsList className="grid grid-cols-4 w-full bg-black/40 border border-white/10 p-1 rounded-xl shrink-0">
            <TabsTrigger value="basics" className="text-xs font-bold py-1.5 flex items-center gap-1">
              <Dices className="w-3.5 h-3.5" />
              <span>Основы</span>
            </TabsTrigger>
            <TabsTrigger value="property" className="text-xs font-bold py-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Улицы</span>
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs font-bold py-1.5 flex items-center gap-1">
              <Train className="w-3.5 h-3.5 text-blue-400" />
              <span>Транспорт</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-xs font-bold py-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Финансы</span>
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[50vh] pr-1.5 mt-3 text-xs leading-relaxed text-slate-300 text-left flex flex-col gap-3">
            {/* 1. Основы */}
            <TabsContent value="basics" className="flex flex-col gap-3 mt-0">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  🏆 Цель игры
                </span>
                <p>
                  Станьте самым богатым магнатом, доведя всех соперников до банкротства через продуманную скупку монополий и застройку улиц.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  🎲 Ход игрока и кубики
                </span>
                <ul className="flex flex-col gap-1.5 list-disc list-inside">
                  <li>
                    <strong>Бросок кубиков:</strong> Игрок бросает 2 кубика и перемещается по часовой стрелке.
                  </li>
                  <li>
                    <strong>Дубль:</strong> Выпадение одинаковых чисел дает право на повторный ход.
                  </li>
                  <li>
                    <strong>3 дубля подряд:</strong> Игрок немедленно отправляется в Тюрьму за превышение скорости!
                  </li>
                  <li>
                    <strong>Клетка СТАРТ:</strong> Прохождение круга приносит <strong>+$200</strong>. Точная остановка на клетке СТАРТ дает дополнительно +$100 (итого <strong>+$300</strong>)!
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  🔒 Тюрьма и арест
                </span>
                <p>Попадая на угол «В Тюрьму» или по карте Шанса, игрок изолируется на 3 хода.</p>
                <div className="grid grid-cols-3 gap-1.5 text-center mt-1">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="font-bold text-amber-300 block text-[11px]">Выкуп</span>
                    <span className="text-[10px] text-muted-foreground">Заплатить $50</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="font-bold text-indigo-300 block text-[11px]">Дубль</span>
                    <span className="text-[10px] text-muted-foreground">3 попытки броска</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="font-bold text-emerald-300 block text-[11px]">Карта 🔑</span>
                    <span className="text-[10px] text-muted-foreground">Бесплатный выход</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 2. Улицы и монополии */}
            <TabsContent value="property" className="flex flex-col gap-3 mt-0">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  🏢 Покупка и Аукцион
                </span>
                <ul className="flex flex-col gap-1.5 list-disc list-inside">
                  <li>
                    Остановившись на свободной улице, вы можете приобрести её в собственность.
                  </li>
                  <li>
                    Если вы отказываетесь от покупки, поле выставляется на открытый <strong>Аукцион</strong> среди всех игроков со ставкой от $10.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  🔴 Монополия, застройка и продажа
                </span>
                <ul className="flex flex-col gap-1.5 list-disc list-inside">
                  <li>
                    <strong>Монополия:</strong> Сбор всех полей группы <strong>удваивает (2x)</strong> базовую аренду даже без домов!
                  </li>
                  <li>
                    <strong>Лимиты застройки:</strong> Разрешено строить <em>не более 1 улучшения на одной и той же улице за ход</em> (т.е. за один ход можно улучшить по одному разу несколько разных улиц монополии).
                  </li>
                  <li>
                    <strong>Равномерность:</strong> Офисы строятся равномерно по всей группе (до 4 офисов, затем отель).
                  </li>
                  <li>
                    <strong>Продажа улучшений:</strong> В любой момент вы можете продать офисы или отель банку за <strong>50% их стоимости</strong> (по правилу равномерного снижения).
                  </li>
                </ul>
              </div>
            </TabsContent>

            {/* 3. Транспорт и сервисы */}
            <TabsContent value="special" className="flex flex-col gap-3 mt-0">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-blue-300 flex items-center gap-1.5">
                  🚆 Транспортная сеть (Вокзалы)
                </span>
                <p>
                  Вокзалы нельзя улучшать домами, но владение несколькими вокзалами многократно умножает доход со всей сети:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center mt-1">
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5"><span className="text-muted-foreground block text-[10px]">1 вокзал</span><strong className="text-white">$25</strong></div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5"><span className="text-muted-foreground block text-[10px]">2 вокзала</span><strong className="text-white">$50</strong></div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5"><span className="text-muted-foreground block text-[10px]">3 вокзала</span><strong className="text-white">$100</strong></div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-emerald-500/30"><span className="text-emerald-400 block text-[10px]">4 вокзала</span><strong className="text-emerald-300">$200</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-indigo-300 flex items-center gap-1.5">
                  ⚡ Коммунальные сервисы
                </span>
                <p>
                  Владение 1 сервисом приносит <strong>$20</strong> ренты. Монополия из 2 сервисов утраивает доход до <strong>$60</strong>.
                </p>
              </div>
            </TabsContent>

            {/* 4. Финансы и залог */}
            <TabsContent value="finance" className="flex flex-col gap-3 mt-0">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                  🤝 Обмен и торговля между игроками
                </span>
                <p>
                  В любой момент своего хода вы можете нажать на любого соперника в левой панели, чтобы предложить обмен полями и денежной доплатой.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  🏦 Залог и выкуп недвижимости
                </span>
                <ul className="flex flex-col gap-1.5 list-disc list-inside">
                  <li>
                    При нехватке средств для оплаты аренды или налогов заложите улицу в банк и получите <strong>50% её стоимости</strong>.
                  </li>
                  <li>
                    С заложенных полей аренда не собирается.
                  </li>
                  <li>
                    Выкуп из залога стоит: <em>сумма залога + 10% банковской комиссии</em>.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex flex-col gap-1.5">
                <span className="text-xs sm:text-sm font-black text-red-300 flex items-center gap-1.5">
                  💀 Банкротство
                </span>
                <p className="text-red-200/90">
                  Если баланс игрока отрицателен, и залога имущества недостаточно для погашения долга, игрок объявляет банкротство и выбывает из партии.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-3 pt-2 border-t border-white/10 shrink-0">
          <Button variant="default" className="w-full text-xs sm:text-sm font-black h-9 rounded-xl" onClick={closeModal}>
            Понятно / Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
