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
  Crown,
  Flame,
  Swords,
  RotateCw,
  Users,
  Zap,
  Award,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const RulesModal: React.FC = () => {
  const { activeModal, modalData, closeModal, theme } = useGame();
  const isOpen = activeModal === 'rules';
  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';
  const [currentTab, setCurrentTab] = React.useState<string>('classic');

  React.useEffect(() => {
    if (isOpen) {
      if (modalData && typeof modalData === 'object' && modalData.tab) {
        setCurrentTab(modalData.tab);
      } else {
        setCurrentTab('classic');
      }
    }
  }, [isOpen, modalData]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className={cn(
        "max-w-xl max-h-[85vh] flex flex-col p-5 shadow-2xl select-none rounded-none border",
        isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-slate-500/50 font-sans"
      )}>
        <DialogHeader className={cn("border-b pb-2", isNoir ? "border-[#d4a647]/40" : isSoviet ? "border-[#38bdf8]/40" : "border-slate-500/30")}>
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-none flex items-center justify-center border", isNoir ? "bg-[#1a1410] border-[#d4a647]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]" : "bg-[#020617] border-slate-500/50")}>
              <span className={cn("font-bold text-base", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#dc2626]" : "text-slate-400")}>
                {isNoir ? '🕵️' : isSoviet ? '★' : '🎲'}
              </span>
            </div>
            <div>
              <DialogTitle className={cn("text-base sm:text-lg font-bold tracking-wide flex items-center gap-2", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white")}>
                ПРАВИЛА ИГРЫ «ПОЛУЧКА»
              </DialogTitle>
              <p className={cn("text-xs", isNoir ? "font-noir-body text-[#b8a890]" : isSoviet ? "font-space text-[#38bdf8]" : "text-slate-400 font-medium")}>
                {isNoir ? 'Инструкция для частного детектива • Город грехов' : isSoviet ? 'Инструкция Центра Управления Полётами • Космодром Байконур' : 'Классические правила настольной экономической стратегии'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full flex-1 flex flex-col min-h-0 mt-3">
          <TabsList className={cn(
            "grid grid-cols-6 w-full p-1 rounded-none shrink-0 border overflow-x-auto",
            isNoir ? "bg-[#1a1410] border-[#d4a647]/40 font-noir-title" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/40 font-soviet" : "bg-[#020617] border-slate-500/40 font-sans"
          )}>
            <TabsTrigger value="classic" className="text-[10px] sm:text-[11px] font-bold py-1.5 flex items-center justify-center gap-1">
              <Crown className={cn("w-3.5 h-3.5 shrink-0", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")} />
              <span className="hidden sm:inline">КЛАССИКА</span>
            </TabsTrigger>
            <TabsTrigger value="blitz" className="text-[10px] sm:text-[11px] font-bold py-1.5 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 shrink-0 text-orange-400" />
              <span className="hidden sm:inline">БЛИЦ</span>
            </TabsTrigger>
            <TabsTrigger value="ranked" className="text-[10px] sm:text-[11px] font-bold py-1.5 flex items-center justify-center gap-1">
              <Swords className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span className="hidden sm:inline">ДУЭЛЬ</span>
            </TabsTrigger>
            <TabsTrigger value="reverse" className="text-[10px] sm:text-[11px] font-bold py-1.5 flex items-center justify-center gap-1 text-[#c084fc]">
              <RotateCw className="w-3.5 h-3.5 shrink-0 text-purple-400" />
              <span className="hidden sm:inline">НАОБОРОТ</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="text-[10px] sm:text-[11px] font-bold py-1.5 flex items-center justify-center gap-1 text-[#38bdf8]">
              <Users className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span className="hidden sm:inline">2v2</span>
            </TabsTrigger>
            <TabsTrigger value="basics" className="text-[10px] sm:text-[11px] font-bold py-1.5 flex items-center justify-center gap-1">
              <Dices className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="hidden sm:inline">ОСНОВЫ</span>
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[50vh] pr-1.5 mt-3 text-xs leading-relaxed text-left flex flex-col gap-3">
            {/* 1. Классическая игра */}
            <TabsContent value="classic" className="flex flex-col gap-3 mt-0 text-sm">
              <div className={cn("p-3 rounded-none border flex flex-col gap-1.5", isNoir ? "bg-[#1a1410] border-[#d4a647]/40 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/40 font-space" : "bg-[#020617] border-amber-500/40 font-sans")}>
                <span className={cn("text-xs sm:text-sm font-bold flex items-center gap-1.5", isNoir ? "font-noir-title text-[#d4a647]" : isSoviet ? "font-soviet text-[#38bdf8]" : "text-amber-400")}>
                  👑 КЛАССИЧЕСКАЯ ПОЛУЧКА (40 КЛЕТОК)
                </span>
                <p>
                  Полномасштабный турнирный формат: периметр 11x11, 28 цифровых активов (22 IT-компании и бренда в 8 отраслях, 4 транспортные сети Uber/Bolt/Lyft/Gett и 2 цифровых сервиса WinRAR/Speedtest).
                </p>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">🎯 ЦЕЛЬ И ПОЛУЧКА</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Стартовый капитал:</strong> $1,500 каждому игроку.</li>
                  <li><strong>Получка:</strong> +$200 за каждый полный круг (или +$400 при точном попадании на клетку «Старт»).</li>
                  <li><strong>Победа:</strong> Игра продолжается до полного банкротства всех соперников.</li>
                </ul>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">🏢 МОНОПОЛИИ И РАЗВИТИЕ КОМПАНИЙ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li>Сбор всех компаний одной отрасли <strong>удваивает базовую прибыль</strong> незастроенных активов.</li>
                  <li>В собранной монополии можно возводить до 4 филиалов и 1 головной офис/дата-центр на каждой компании.</li>
                  <li>Развитие ведется строго равномерно по всей отрасли.</li>
                  <li>Головной офис приносит максимальную выплату, способную разорить конкурентов.</li>
                </ul>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">🚗 ТРАНСПОРТНЫЕ СЕТИ И ЦИФРОВЫЕ СЕРВИСЫ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>4 Транспортные сети (Uber, Bolt, Lyft, Gett):</strong> Оплата проезда растет геометрически: 1 сервис = $25, 2 = $50, 3 = $100, все 4 = $200.</li>
                  <li><strong>2 Цифровых сервиса (WinRAR и Speedtest):</strong> Оплата зависит от броска кубиков: 4x от суммы кубиков (при 1 сервисе) или 10x (при владении обоими).</li>
                </ul>
              </div>
            </TabsContent>

            {/* 2. Блиц Получка */}
            <TabsContent value="blitz" className="flex flex-col gap-3 mt-0 text-sm">
              <div className={cn("p-3 rounded-none border flex flex-col gap-1.5", isNoir ? "bg-[#1a1410] border-[#f97316]/40 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#f97316]/40 font-space" : "bg-[#1f1008] border-orange-500/40 font-sans")}>
                <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-orange-400">
                  ⚡ БЛИЦ ПОЛУЧКА (24 КЛЕТКИ • 10–15 МИН)
                </span>
                <p>
                  Быстрый и динамичный режим на компактном поле 7x7 для молниеносных партий без пауз и затяжных ожиданий.
                </p>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">⚡ ОСОБЕННОСТИ БЛИЦА</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Поле 24 клетки:</strong> Всего 14 компаний в 7 отраслях — каждый бросок приводит на ключевую позицию.</li>
                  <li><strong>Монополия из 2 компаний:</strong> В каждой отрасли только 2 актива, монополия собирается вдвое быстрее!</li>
                  <li><strong>Капитал:</strong> $1,000 на старте, получка за круг $150.</li>
                  <li><strong>Острый темп:</strong> Развитие филиалов начинается уже со 2-го круга, ошибки стоят дороже.</li>
                </ul>
              </div>
            </TabsContent>

            {/* 3. Рейтинговая Дуэль */}
            <TabsContent value="ranked" className="flex flex-col gap-3 mt-0 text-sm">
              <div className={cn("p-3 rounded-none border flex flex-col gap-1.5", isNoir ? "bg-[#1a1410] border-[#ef4444]/40 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#ef4444]/40 font-space" : "bg-[#1f090d] border-red-500/40 font-sans")}>
                <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-red-400">
                  ⚔️ РЕЙТИНГОВАЯ ДУЭЛЬ 1v1 (2x ELO)
                </span>
                <p>
                  Турнирный соревновательный поединок один на один за позиции в глобальной таблице лидеров.
                </p>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">⏱️ РЕГЛАМЕНТ ДУЭЛИ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Таймер 30 секунд:</strong> На ход дается 30 сек. При истечении времени действие выполняется автоматически.</li>
                  <li><strong>2x ELO:</strong> Победитель получает удвоенный рейтинг (+30 ELO), поражение снижает рейтинг.</li>
                  <li><strong>Чистая дуэль:</strong> Только два мастера, отсутствие случайных помех третьих сторон.</li>
                </ul>
              </div>
            </TabsContent>

            {/* 4. Режим «Наоборот» */}
            <TabsContent value="reverse" className="flex flex-col gap-3 mt-0 text-sm">
              <div className={cn("p-3 rounded-none border flex flex-col gap-1.5", isNoir ? "bg-[#1a1410] border-[#c084fc]/40 text-[#e9d5ff]" : isSoviet ? "bg-[#1e1026] border-[#a855f7]/40 text-[#e9d5ff]" : "bg-[#1e1026] border-purple-500/40 text-purple-200")}>
                <span className={cn("text-xs sm:text-sm font-bold flex items-center gap-1.5", isNoir ? "font-noir-title text-[#c084fc]" : isSoviet ? "font-soviet text-[#c084fc]" : "text-purple-300")}>
                  🔄 РЕЖИМ «НАОБОРОТ»: ТРАТЬТЕ ДЕНЬГИ!
                </span>
                <p>
                  Побеждает игрок с <strong>НАИМЕНЬШИМ чистым капиталом</strong> к финалу партии!
                </p>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">📊 ПРАВИЛА ИНВЕРСИИ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Подсчет капитала:</strong> Деньги + 100% стоимости всех активов + 50% построек.</li>
                  <li><strong>Банкротство = Выбывание:</strong> Если баланс упадет ниже $0 — вы дисквалифицируетесь!</li>
                  <li><strong>Оплата Банку:</strong> Плата за посещение чужих компаний уходит Банку, а не владельцу.</li>
                  <li><strong>Принудительный аукцион:</strong> При отсутствии ставок актив достается текущему игроку по номиналу.</li>
                  <li><strong>Лимит раундов:</strong> Игра завершается через 10 (блиц) или 20 (стандарт) кругов стола.</li>
                </ul>
              </div>
            </TabsContent>

            {/* 5. Командный режим 2v2 */}
            <TabsContent value="team" className="flex flex-col gap-3 mt-0 text-sm">
              <div className={cn("p-3 rounded-none border flex flex-col gap-1.5", isNoir ? "bg-[#1a1410] border-[#38bdf8]/40 text-[#e0f2fe]" : isSoviet ? "bg-[#05192d] border-[#0284c7]/40 text-[#e0f2fe]" : "bg-[#0c1e33] border-blue-500/40 text-blue-200")}>
                <span className={cn("text-xs sm:text-sm font-bold flex items-center gap-1.5", isNoir ? "font-noir-title text-[#38bdf8]" : isSoviet ? "font-soviet text-[#38bdf8]" : "text-blue-300")}>
                  👥 КОМАНДНАЯ ПОЛУЧКА 2v2
                </span>
                <p>
                  Битва альянсов: <strong>Красные 🔴 против Синих 🔵</strong>. Общая казна и совместные монополии.
                </p>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">🤝 КОМАНДНЫЙ РЕГЛАМЕНТ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Общая казна:</strong> Стартовый баланс $2,250 на двоих. Расходы и доходы делятся на команду.</li>
                  <li><strong>$0 плата своим:</strong> Остановка на активах напарника не требует выплат.</li>
                  <li><strong>Командная монополия:</strong> Активы союзников суммируются для создания монополии.</li>
                  <li><strong>Строительство:</strong> Можно развивать филиалы на активах напарника за счет общей казны.</li>
                  <li><strong>Банкротство:</strong> При обнулении казны и долгах выбывает вся команда целиком.</li>
                </ul>
              </div>
            </TabsContent>

            {/* 6. Общие механики */}
            <TabsContent value="basics" className="flex flex-col gap-3 mt-0 text-sm">
              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#020617] border-slate-500/30 font-sans")}>
                <span className="font-bold text-xs text-white">🎲 ЖРЕБИЙ, ДУБЛИ И ТЮРЬМА</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Бросок 2 кубиков:</strong> Сумма определяет число шагов.</li>
                  <li><strong>Дубль:</strong> Дает право на повторный бросок. Три дубля подряд отправляют в Тюрьму!</li>
                  <li><strong>Тюрьма:</strong> Пропуск ходов до 3 раундов. Выход: штраф $50, дубль или карта освобождения.</li>
                </ul>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">🏦 АУКЦИОНЫ, СДЕЛКИ И ЗАЛОГ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Аукцион:</strong> При отказе от покупки актив уходит на торги среди всех игроков со стартом $10.</li>
                  <li><strong>Сделки:</strong> В любой момент можно предложить обмен активами и доплату через кнопку «Сделка».</li>
                  <li><strong>Залог:</strong> Активы можно заложить банку за 50% номинала. Выкуп: залог + 10% комиссии.</li>
                </ul>
              </div>

              <div className={cn("p-3 rounded-none border flex flex-col gap-2", isNoir ? "bg-[#1a1410] border-[#d4a647]/30" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30" : "bg-[#020617] border-slate-500/30")}>
                <span className="font-bold text-xs text-white">⭐ РЕЙТИНГ ELO И ЗАЩИТА ОТ НАКРУТКИ</span>
                <ul className="flex flex-col gap-1 list-disc list-inside text-xs text-muted-foreground">
                  <li><strong>Честный расчет Elo:</strong> Многопользовательский алгоритм с нулевой суммой. Победа над сильным соперником дает больше очков, чем над новичком.</li>
                  <li><strong>2x ELO в дуэлях:</strong> В поединках 1 на 1 действует удвоенный турнирный коэффициент K=48.</li>
                  <li><strong>Защита от накрутки:</strong> Партия должна длиться не менее 3 кругов (или 2 мин). При досрочном сливе вышедший штрафуется, а победителю очки не начисляются.</li>
                  <li><strong>Защита от фарма:</strong> При повторных играх между одними и теми же соперниками за сутки прирост очков постепенно угасает (100% → 70% → 40% → 15% → 0%).</li>
                  <li><strong>Игры с ботами:</strong> Являются тренировочными и в официальном лидерборде не учитываются.</li>
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className={cn("mt-3 pt-2 border-t shrink-0", isNoir ? "border-[#d4a647]/40 font-noir-body" : isSoviet ? "border-[#38bdf8]/40 font-soviet" : "border-slate-500/30 font-sans")}>
          <button
            className={cn("w-full text-xs font-bold h-8 rounded-none", isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans")}
            onClick={closeModal}
          >
            {isNoir ? "ПРИНЯТЬ К СВЕДЕНИЮ ✓" : isSoviet ? "ПРИНЯТЬ К ИСПОЛНЕНИЮ ★" : "ПОНЯТНО ✓"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
