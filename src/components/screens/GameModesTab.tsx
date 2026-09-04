import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Flame,
  Swords,
  RotateCw,
  Users,
  Zap,
  PlusCircle,
  Lock,
  BookOpen,
  Clock,
  Coins,
  Building2,
  Globe,
  ChevronRight,
  LucideIcon,
  Trophy,
} from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type ModeId = "classic" | "blitz" | "ranked" | "reverse" | "team";

interface GameModesTabProps {
  handleCreate: (options?: {
    mode?: "standard" | "blitz" | "ranked";
    gameMode?: "classic" | "reverse" | "team";
    maxRounds?: number;
    boardSize?: 40 | 24;
    maxPlayers?: number;
  }) => Promise<void>;
  handleQuickPlay: () => Promise<void>;
  loadingCreate: boolean;
  loadingQuick: boolean;
  isPrivate: boolean;
  setIsPrivate: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GameModesTab: React.FC<GameModesTabProps> = ({
  handleCreate,
  handleQuickPlay,
  loadingCreate,
  loadingQuick,
  isPrivate,
  setIsPrivate,
}) => {
  const { theme, currentUser, openModal } = useGame();
  const [selectedMode, setSelectedMode] = useState<ModeId>("classic");

  const isSoviet = theme === "soviet";
  const isNoir = theme === "noir";

  const modesData = [
    {
      id: "classic" as ModeId,
      name: "Классическая Получка",
      shortName: "Получка",
      badge: "РЕЙТИНГ ELO",
      chipBadge: "40 кл • ELO",
      icon: Crown,
      iconColor: isNoir
        ? "text-[#d4a647]"
        : isSoviet
          ? "text-[#38bdf8]"
          : "text-amber-400",
      subtitle:
        "40 клеток на доске • 28 цифровых активов • Периметр 11x11",
      tagline:
        "Официальные правила экономической игры «Получка»: покупка IT-компаний и брендов, сбор монополий, запуск филиалов и дата-центров. Все игры без ботов учитываются в рейтинге ELO!",
      rulesTab: "classic",
      chips: [
        { icon: Globe, label: "40 Клеток", sub: "Периметр 11x11" },
        {
          icon: Building2,
          label: "28 Активов",
          sub: "22 компании + 4 такси + 2 сервиса",
        },
        { icon: Coins, label: "$1,500 Баланс", sub: "Стартовый капитал" },
        { icon: Trophy, label: "Рейтинг ELO", sub: "Учитывается без ботов" },
      ],
      actions: [
        {
          label: "Создать стол",
          icon: PlusCircle,
          variant: "gold" as const,
          disabled: loadingCreate,
          onClick: () => handleCreate({ mode: "standard", boardSize: 40 }),
        },
      ],
    },
    {
      id: "blitz" as ModeId,
      name: "Блиц Получка (24 клетки)",
      shortName: "Блиц",
      badge: "РЕЙТИНГ ELO",
      chipBadge: "24 кл • ELO",
      icon: Flame,
      iconColor: isNoir
        ? "text-[#d4a647]"
        : isSoviet
          ? "text-[#38bdf8]"
          : "text-amber-400",
      subtitle: "Компактное поле 7x7 • Динамичные сессии на 10–15 минут",
      tagline:
        "Ускоренная игра на компактном поле: по 2 компании в каждой отрасли. Быстрый сбор монополий и рейтинговые очки ELO в глобальной таблице лидеров!",
      rulesTab: "blitz",
      chips: [
        { icon: Globe, label: "24 Клетки", sub: "Компактное поле 7x7" },
        { icon: Building2, label: "14 Компаний", sub: "По 2 в каждой отрасли" },
        { icon: Clock, label: "10–15 Минут", sub: "Быстрая партия" },
        { icon: Trophy, label: "Рейтинг ELO", sub: "Учитывается без ботов" },
      ],
      actions: [
        {
          label: "Создать стол",
          icon: PlusCircle,
          variant: "gold" as const,
          disabled: loadingCreate,
          onClick: () => handleCreate({ mode: "blitz", boardSize: 24 }),
        },
      ],
    },
    {
      id: "ranked" as ModeId,
      name: "Дуэль (1 на 1)",
      shortName: "Дуэль 1v1",
      badge: "ТУРНИР 2x ELO",
      chipBadge: "Дуэль • 2x ELO",
      icon: Swords,
      iconColor: isNoir
        ? "text-[#d4a647]"
        : isSoviet
          ? "text-[#38bdf8]"
          : "text-amber-400",
      subtitle: "Поединок один на один",
      tagline:
        "Бескомпромиссная дуэль с жестким таймером 30 секунд на ход. Проявите чистое мастерство и получите удвоенный прирост ELO-рейтинга (+30 очков)!",
      rulesTab: "ranked",
      chips: [
        { icon: Users, label: "1 на 1", sub: "Только 2 соперника" },
        { icon: Clock, label: "30 сек / ход", sub: "Турнирный таймер" },
        { icon: Swords, label: "2x ELO", sub: "Удвоенный рейтинг" },
        { icon: Globe, label: "40 Клеток", sub: "Полноразмерное поле" },
      ],
      actions: [
        {
          label: "Создать стол",
          icon: PlusCircle,
          variant: "gold" as const,
          disabled: loadingCreate,
          onClick: () => handleCreate({ mode: "ranked", boardSize: 40, maxPlayers: 2 }),
        },
      ],
    },
    {
      id: "reverse" as ModeId,
      name: "Получка «Наоборот» 🔄",
      shortName: "Наоборот 🔄",
      badge: "РЕЙТИНГ ELO",
      chipBadge: "Инверсия • ELO",
      icon: RotateCw,
      iconColor: isNoir
        ? "text-[#fca5a5]"
        : isSoviet
          ? "text-[#fcd34d]"
          : "text-amber-300",
      subtitle: "10–20 кругов стола • Побеждает игрок с НАИМЕНЬШИМ капиталом",
      tagline:
        "Инверсия классических правил: побеждает игрок с наименьшим суммарным капиталом к финалу партии! Победы учитываются в рейтинге.",
      rulesTab: "reverse",
      chips: [
        { icon: Coins, label: "Мин. Капитал", sub: "Меньше денег = победа" },
        { icon: Clock, label: "10 / 20 Раундов", sub: "Кругов до финала" },
        {
          icon: Building2,
          label: "Принуд. аукцион",
          sub: "Без ставок актив у вас",
        },
        { icon: Trophy, label: "Рейтинг ELO", sub: "Учитывается без ботов" },
      ],
      actions: [
        {
          label: "Создать стол",
          icon: PlusCircle,
          variant: "gold" as const,
          disabled: loadingCreate,
          onClick: () =>
            handleCreate({
              mode: "standard",
              gameMode: "reverse",
              maxRounds: 20,
              boardSize: 40,
            }),
        },
      ],
    },
    {
      id: "team" as ModeId,
      name: "Командная Получка 2v2 👥",
      shortName: "Команды 2v2",
      badge: "РЕЙТИНГ ELO",
      chipBadge: "2v2 • ELO",
      icon: Users,
      iconColor: isNoir
        ? "text-[#d4a647]"
        : isSoviet
          ? "text-[#38bdf8]"
          : "text-blue-400",
      subtitle:
        "Красные 🔴 vs Синие 🔵 • Общая казна $2250 • Командные монополии",
      tagline:
        "Сражайтесь в тандеме: общий кошелек на команду, бесплатный проход по улицам напарника ($0) и совместная застройка. Победы идут в рейтинг ELO!",
      rulesTab: "team",
      chips: [
        { icon: Users, label: "2 на 2 Команды", sub: "Красные против Синих" },
        { icon: Coins, label: "Казна $2,250", sub: "Единый баланс команды" },
        {
          icon: Building2,
          label: "$0 Рента своим",
          sub: "Бесплатный отдых напарника",
        },
        { icon: Trophy, label: "Рейтинг ELO", sub: "Учитывается без ботов" },
      ],
      actions: [
        {
          label: "Создать стол",
          icon: PlusCircle,
          variant: "gold" as const,
          disabled: loadingCreate,
          onClick: () =>
            handleCreate({ mode: "standard", gameMode: "team", boardSize: 40, maxPlayers: 4 }),
        },
      ],
    },
  ];

  const currentMode =
    modesData.find((m) => m.id === selectedMode) || modesData[0];
  const CurrentIcon = currentMode.icon;

  const handleSelectMode = (id: ModeId) => {
    soundEngine.playClick();
    setSelectedMode(id);
  };

  const handleOpenRules = (tabName: string) => {
    soundEngine.playClick();
    openModal("rules", { tab: tabName });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full animate-fade-in select-none">
      {/* Universal Rating Notice Banner */}
      <div
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-none sm:rounded-xl border text-xs shadow-sm",
          isNoir
            ? "bg-[#14100c] border-[#d4a647]/35 text-[#f5e6c8]"
            : isSoviet
              ? "bg-[#09111c] border-[#38bdf8]/35 text-[#e0f2fe]"
              : "bg-amber-500/10 border-amber-500/30 text-amber-200",
        )}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="font-semibold text-[11px] sm:text-xs">
            Все игры против реальных игроков учитываются в рейтинге (игры с
            ботами в рейтинге не учитываются).
          </span>
        </div>
        <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-amber-400/40 text-amber-300 shrink-0">
          ⭐ ELO РЕЙТИНГ
        </span>
      </div>

      {/* Interactive Master-Detail Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* Left Column: Compact Mode Selector Tabs */}
        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0 shrink-0">
          {modesData.map((mode) => {
            const isSelected = selectedMode === mode.id;
            const ModeIcon = mode.icon;

            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={cn(
                  "flex items-center justify-between gap-2.5 p-2.5 sm:p-3 transition-all text-left border shrink-0",
                  "rounded-none sm:rounded-xl cursor-pointer min-w-[170px] sm:min-w-[200px] lg:min-w-0 lg:w-full",
                  isSelected
                    ? isNoir
                      ? "bg-[#1a1410] border-[#d4a647] text-[#f5e6c8] shadow-lg shadow-[#d4a647]/10"
                      : isSoviet
                        ? "bg-[#09111c] border-[#38bdf8] text-[#e2e8f0] shadow-lg shadow-[#38bdf8]/10"
                        : "bg-slate-900 border-amber-500/70 text-white shadow-lg shadow-amber-500/10"
                    : isNoir
                      ? "bg-[#14100c]/80 border-[#3d2e1a] text-[#b8a890] hover:bg-[#1a1410] hover:border-[#d4a647]/40"
                      : isSoviet
                        ? "bg-[#060c14]/80 border-[#1e293b] text-[#94a3b8] hover:bg-[#09111c] hover:border-[#38bdf8]/40"
                        : "bg-slate-950/60 border-slate-700/40 text-slate-400 hover:bg-slate-900 hover:border-slate-600",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-none sm:rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? isNoir
                          ? "bg-[#14100c] border-[#d4a647]"
                          : isSoviet
                            ? "bg-[#050b14] border-[#38bdf8]"
                            : "bg-slate-950 border-amber-400/80"
                        : isNoir
                          ? "bg-[#14100c] border-[#3d2e1a]"
                          : isSoviet
                            ? "bg-[#050b14] border-[#1e293b]"
                            : "bg-slate-950 border-slate-700/40",
                    )}
                  >
                    <ModeIcon
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isSelected ? mode.iconColor : "text-slate-500",
                      )}
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-bold truncate leading-tight",
                        isSelected
                          ? isNoir
                            ? "text-[#f5e6c8] font-noir-title"
                            : isSoviet
                              ? "text-[#e2e8f0] font-soviet"
                              : "text-white"
                          : "opacity-85",
                      )}
                    >
                      {mode.shortName}
                    </span>
                    <span className="text-[10px] opacity-60 truncate mt-0.5">
                      {mode.chipBadge}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex items-center">
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isSelected
                        ? isNoir
                          ? "text-[#d4a647] translate-x-0.5"
                          : isSoviet
                            ? "text-[#38bdf8] translate-x-0.5"
                            : "text-amber-400 translate-x-0.5"
                        : "opacity-0 -translate-x-1",
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Interactive Hero Showcase Panel */}
        <div className="lg:col-span-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "relative overflow-hidden p-5 sm:p-6 shadow-2xl border flex flex-col gap-4",
                isNoir
                  ? "bg-[#1a1410] border-[#d4a647] rounded-none font-noir-body text-[#f5e6c8]"
                  : isSoviet
                    ? "bg-[#09111c] border-[#38bdf8] rounded-none font-soviet text-[#e2e8f0]"
                    : "bg-[#0f172a]/95 border-slate-600/50 rounded-2xl font-sans text-slate-100",
              )}
            >
              {/* Header: Mode Name, Icon and Badges */}
              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5",
                  isNoir
                    ? "border-[#d4a647]/30"
                    : isSoviet
                      ? "border-[#38bdf8]/30"
                      : "border-slate-700/50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-11 h-11 sm:w-12 sm:h-12 rounded-none sm:rounded-2xl border flex items-center justify-center shrink-0 shadow-inner",
                      isNoir
                        ? "bg-[#14100c] border-[#d4a647]"
                        : isSoviet
                          ? "bg-[#050b14] border-[#38bdf8]"
                          : "bg-slate-950 border-amber-400/50",
                    )}
                  >
                    <CurrentIcon
                      className={cn("w-6 h-6", currentMode.iconColor)}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "font-bold text-lg sm:text-xl",
                          isNoir
                            ? "font-noir-title text-[#d4a647]"
                            : isSoviet
                              ? "font-soviet text-[#38bdf8]"
                              : "text-white",
                        )}
                      >
                        {currentMode.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 border",
                          isNoir
                            ? "bg-[#14100c] border-[#d4a647] text-[#d4a647]"
                            : isSoviet
                              ? "bg-[#050b14] border-[#38bdf8] text-[#38bdf8]"
                              : "bg-slate-950 border-slate-600 text-slate-300",
                        )}
                      >
                        {currentMode.badge}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold mt-0.5",
                        isNoir
                          ? "text-[#b8a890]"
                          : isSoviet
                            ? "text-[#94a3b8]"
                            : "text-amber-300/90",
                      )}
                    >
                      {currentMode.subtitle}
                    </span>
                  </div>
                </div>

                {currentMode.id === "reverse" && !currentUser && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-none sm:rounded-lg border flex items-center gap-1",
                        isNoir
                          ? "bg-[#14100c] border-[#d4a647]/50 text-[#d4a647]"
                          : isSoviet
                            ? "bg-[#050b14] border-[#38bdf8]/50 text-[#38bdf8]"
                            : "bg-black/40 border-amber-500/40 text-amber-300",
                      )}
                    >
                      <Lock className="w-3.5 h-3.5" /> Вход в Telegram
                    </span>
                  </div>
                )}
              </div>

              {/* Core Pitch (1-2 sentences) */}
              <p
                className={cn(
                  "text-xs sm:text-sm leading-relaxed text-left",
                  isNoir
                    ? "text-[#b8a890]"
                    : isSoviet
                      ? "text-[#94a3b8]"
                      : "text-slate-300",
                )}
              >
                {currentMode.tagline}
              </p>

              {/* Mode Attributes (Compact 4-column Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                {currentMode.chips.map((chip, idx) => {
                  const ChipIcon = chip.icon;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2.5 sm:p-3 rounded-none sm:rounded-xl border flex flex-col gap-0.5",
                        isNoir
                          ? "bg-[#14100c] border-[#d4a647]/25"
                          : isSoviet
                            ? "bg-[#050b14] border-[#38bdf8]/25"
                            : "bg-slate-950/80 border-slate-700/40",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-bold",
                          isNoir
                            ? "text-[#d4a647]"
                            : isSoviet
                              ? "text-[#38bdf8]"
                              : "text-amber-400",
                        )}
                      >
                        <ChipIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{chip.label}</span>
                      </div>
                      <span className="text-[10px] opacity-75 truncate">
                        {chip.sub}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Table Privacy Selector (Open in Lobby / Private) */}
              <div
                className={cn(
                  "flex items-center justify-between p-2.5 sm:p-3 rounded-none sm:rounded-xl border mt-0.5",
                  isNoir
                    ? "bg-[#14100c] border-[#3d2e1a]"
                    : isSoviet
                      ? "bg-[#050b14] border-[#1e293b]"
                      : "bg-slate-950/80 border-slate-700/40",
                )}
              >
                <div className="flex items-center gap-2.5 text-left">
                  {isPrivate ? (
                    <Lock
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isNoir
                          ? "text-[#d4a647]"
                          : isSoviet
                            ? "text-[#38bdf8]"
                            : "text-amber-400",
                      )}
                    />
                  ) : (
                    <Globe className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">
                      {isPrivate ? "Приватный стол" : "Открытый стол в лобби"}
                    </span>
                    <span className="text-[10px] opacity-65">
                      {isPrivate
                        ? "Вход только по 4-значному коду приглашения"
                        : "Отображается в общем списке открытых столов"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsPrivate((prev) => !prev);
                  }}
                  className={cn(
                    "w-11 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer shrink-0",
                    isPrivate
                      ? isNoir
                        ? "bg-[#d4a647] justify-end"
                        : isSoviet
                          ? "bg-[#38bdf8] justify-end"
                          : "bg-slate-600 justify-end"
                      : "bg-white/20 justify-start",
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-black shadow-md" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                {currentMode.actions.map((act, idx) => {
                  const ActIcon = act.icon;
                  const isOutline = (act.variant as string) === "outline";

                  return (
                    <Button
                      key={idx}
                      variant={isOutline ? "outline" : "default"}
                      disabled={act.disabled}
                      onClick={act.onClick}
                      className={cn(
                        "w-full sm:w-auto font-bold text-xs sm:text-sm h-10 px-5 shadow-lg border transition-transform active:scale-95",
                        isOutline
                          ? isNoir
                            ? "border-[#d4a647]/40 text-[#d4a647] hover:bg-[#14100c]"
                            : isSoviet
                              ? "border-[#38bdf8]/40 text-[#38bdf8] hover:bg-[#050b14]"
                              : "border-slate-600/50 text-slate-300 hover:bg-slate-900"
                          : isNoir
                            ? "noir-btn-amber font-noir-title text-black"
                            : isSoviet
                              ? "soviet-btn-cyan font-soviet text-black"
                              : "classic-btn-gold font-sans text-black",
                      )}
                    >
                      {ActIcon && (
                        <ActIcon className="w-4 h-4 mr-1.5 shrink-0" />
                      )}
                      <span>{act.label}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
