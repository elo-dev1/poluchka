import React, { useState, useRef, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Key,
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  ArrowUpCircle,
  ArrowDownCircle,
  Banknote,
  Info,
  Sparkles,
  Lock,
} from "lucide-react";
import { formatMoney, cn } from "@/lib/utils";
import { TileData } from "@/types/game";

interface RightPanelProps {
  selectedTile: TileData | null;
  onCloseTile: () => void;
  onClosePanel?: () => void;
  className?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedTile,
  onCloseTile,
  onClosePanel,
  className,
}) => {
  const {
    gameState,
    playerId,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    sendChatMessage,
    chatMessages,
    currentUser,
    openModal,
  } = useGame();

  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const myMoney = myPlayer?.money || 0;
  const myProperties = gameState.board.filter(
    (tile) => tile.ownerId === playerId,
  );

  // Active tile: selected tile by click, or landing action tile, or fallback to first owned property or tile 1
  const activeTile =
    selectedTile ||
    (gameState.status === "AWAITING_ACTION" &&
    gameState.pendingAction?.tileId !== undefined
      ? gameState.board[gameState.pendingAction.tileId]
      : null);

  const displayTile: TileData =
    activeTile ||
    (myProperties.length > 0 ? myProperties[0] : gameState.board[1]);

  const isProperty = displayTile?.type === "property";
  const isTransport = isProperty && displayTile?.group === "transport";
  const isUtility = isProperty && displayTile?.group === "utility";
  const isStreet = isProperty && !isTransport && !isUtility;

  const isOwner = isProperty && displayTile && displayTile.ownerId === playerId;
  const ownerPlayer = displayTile?.ownerId
    ? gameState.players.find((p) => p.id === displayTile.ownerId)
    : null;
  const canAffordHouse = Boolean(
    displayTile?.housePrice && myMoney >= displayTile.housePrice,
  );
  const housesCount = displayTile?.houses || 0;
  const isMaxHouses = housesCount >= 5;

  const getSpecialInfo = (tile: TileData) => {
    switch (tile.type) {
      case "start":
        return {
          category: "Стартовая клетка",
          badgeColor:
            "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          bannerColor: "#059669",
          icon: "🚀",
          description:
            tile.description ||
            "Начальная точка игрового поля. При каждом прохождении или остановке на этой клетке игрок получает бонус +$200 от банка.",
          rules: [
            "Круг начинается с этой клетки",
            "Бонус +$200 начисляется автоматически при пересечении",
            "Не облагается арендной платой и налогами",
          ],
        };
      case "chance":
        return {
          category: "Карта Шанса",
          badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          bannerColor: "#7C3AED",
          icon: "❓",
          description:
            tile.description ||
            'Клетка удачи и риска. Остановившись здесь, вы вытягиваете случайную карту из колоды "Шанс".',
          rules: [
            "Может принести денежный приз, ремонт авто или налоги",
            "Может переместить вас на другую улицу или прямо в тюрьму",
            "Может содержать карту бесплатного освобождения из тюрьмы",
          ],
        };
      case "chest":
        return {
          category: "Общественная Казна",
          badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          bannerColor: "#2563EB",
          icon: "🎁",
          description:
            tile.description ||
            'Клетка городской казны. Остановившись здесь, вы получаете выплату или счёт из колоды "Общественная казна".',
          rules: [
            "Налоговые возвраты, страховые выплаты и подарки",
            "Оплата счетов или непредвиденных расходов",
            "Действие карты применяется немедленно",
          ],
        };
      case "jail":
        return {
          category: "Тюремный сектор",
          badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          bannerColor: "#475569",
          icon: "⛓️",
          description:
            "Сектор заключения и посещения. Если вы пришли сюда обычным ходом кубиков — вы просто посетитель и свободно продолжаете игру.",
          rules: [
            "Простое посещение: никаких штрафов и задержек",
            "В заключении: выход залог $50, карта освобождения или дубль на кубиках",
            "Максимум 3 хода в заключении, после чего залог списывается автоматически",
          ],
        };
      case "parking":
        return {
          category: "Бесплатная парковка",
          badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          bannerColor: "#0D9488",
          icon: "🅿️",
          description:
            tile.description ||
            "Безопасная зона отдыха для игроков. Здесь можно перевести дух перед следующими раундами.",
          rules: [
            "Никаких платежей, аренды или штрафов",
            "Полная безопасность для вашего капитала",
            "Следующий ход совершается в обычном порядке",
          ],
        };
      case "gotojail":
        return {
          category: "Полицейский арест",
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
          bannerColor: "#DC2626",
          icon: "👮",
          description:
            tile.description ||
            "Немедленный арест! Фишка игрока мгновенно перемещается в Тюрьму.",
          rules: [
            "Фишка телепортируется в Тюрьму",
            "Бонус за прохождение СТАРТА не выплачивается",
            "Текущий ход игрока немедленно завершается",
          ],
        };
      case "tax":
        return {
          category: "Налоговый сбор",
          badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          bannerColor: "#E11D48",
          icon: "💸",
          description:
            tile.description ||
            `Государственный налоговый сбор. Остановившись на этой клетке, игрок обязан выплатить $${tile.amount || 200} в пользу банка.`,
          rules: [
            `Сумма сбора: $${tile.amount || 200}`,
            "Деньги списываются в пользу банка",
            "При нехватке наличных заложите имущество или продайте офисы",
          ],
        };
      default:
        return {
          category: "Специальное поле",
          badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          bannerColor: "#4F46E5",
          icon: "ℹ️",
          description: tile.description || "Специальный сектор игрового поля.",
          rules: [],
        };
    }
  };

  const specialInfo = !isProperty ? getSpecialInfo(displayTile) : null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  return (
    <aside
      className={cn(
        "w-64 sm:w-72 xl:w-80 h-full flex flex-col justify-between p-2 sm:p-2.5 gap-2 bg-[#0c0f20]/95 border-l border-white/10 backdrop-blur-xl shrink-0 select-none z-20 overflow-hidden",
        className,
      )}
    >
      {/* -------------------------------------------------------------
          CARD 1 (TOP SECTION): КАРТОЧКА ПОЛЯ С КНОПКАМИ ДЕЙСТВИЙ
          ------------------------------------------------------------- */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#13162b]/95 border border-white/15 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs sm:text-sm font-black tracking-wide text-foreground">
              Карточка поля
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedTile && (
              <button
                onClick={onCloseTile}
                className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-white transition-all"
                title="Сбросить выбор"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {onClosePanel && (
              <button
                onClick={onClosePanel}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-white transition-all ml-1"
                title="Закрыть панель"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Property / Sector Card Body */}
        <div className="flex-1 flex flex-col min-h-0 p-2 overflow-y-auto no-scrollbar gap-2">
          {/* 1. Group Banner */}
          <div
            className="p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-lg shrink-0 transition-all"
            style={{
              backgroundColor: isProperty
                ? displayTile.color || "#3b82f6"
                : specialInfo?.bannerColor || "#4F46E5",
              boxShadow:
                isProperty && displayTile.color
                  ? `0 0 16px ${displayTile.color}77, 0 4px 12px ${displayTile.color}44, inset 0 1px 2px rgba(255,255,255,0.4)`
                  : "0 4px 16px rgba(79,70,229,0.35)",
              color: "#ffffff",
            }}
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-black opacity-90">
              {isProperty
                ? displayTile.groupName || "Недвижимость"
                : specialInfo?.category || "Специальное поле"}
            </span>
            <span className="text-sm sm:text-base font-black tracking-wide drop-shadow-md leading-tight">
              {displayTile.name}
            </span>
          </div>

          {/* =========================================================
              A. SPECIAL NON-PROPERTY TILES (Chance, Jail, Start, etc.)
              ========================================================= */}
          {!isProperty && specialInfo && (
            <div className="flex flex-col gap-2 py-1 text-left">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 leading-relaxed text-slate-200">
                <p className="text-xs sm:text-sm text-white/95 leading-normal font-medium">
                  {specialInfo.description}
                </p>
              </div>

              {specialInfo.rules && specialInfo.rules.length > 0 && (
                <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-xs font-black text-muted-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    Правила сектора:
                  </span>
                  <ul className="flex flex-col gap-1 text-xs sm:text-[13px] text-slate-300 pl-1">
                    {specialInfo.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold leading-tight">
                          •
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              B. TRANSPORT HUB (Citymapper, Airbnb, Booking, Expedia)
              ========================================================= */}
          {isTransport && (
            <>
              <div className="flex flex-col gap-1 text-xs sm:text-[13px] p-2 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase pb-1 border-b border-white/10 px-1">
                  <span>Рента за проезд</span>
                  <span className="flex items-center gap-1">
                    ${" "}
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 rounded">
                  <span className="text-muted-foreground">1 вокзал:</span>
                  <span className="font-mono font-bold text-foreground">
                    $25
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 rounded">
                  <span className="text-muted-foreground">2 вокзала:</span>
                  <span className="font-mono font-bold text-foreground">
                    $50
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 rounded">
                  <span className="text-muted-foreground">3 вокзала:</span>
                  <span className="font-mono font-bold text-foreground">
                    $100
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 rounded text-emerald-400 font-bold">
                  <span>4 вокзала (вся сеть):</span>
                  <span className="font-mono font-black">$200</span>
                </div>

                {/* Price Highlights */}
                <div className="pt-1.5 mt-1 border-t border-white/10 flex flex-col gap-1">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold text-xs sm:text-sm">
                    <span>Стоимость покупки</span>
                    <span className="font-mono font-black text-white text-sm sm:text-base">
                      ${displayTile.price || 200}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
                    <span>Залог в банке</span>
                    <span className="font-mono font-bold text-foreground">
                      ${displayTile.mortgageValue || 100}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Action Buttons */}
              {isOwner && (
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  {displayTile.isMortgaged ? (
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs font-black bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                      onClick={() => unmortgageProperty(displayTile.id)}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>
                        Выкупить поле ($
                        {Math.round((displayTile.mortgageValue || 100) * 1.1)})
                      </span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs font-black bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300 rounded-xl flex items-center justify-center gap-1.5"
                      onClick={() => mortgageProperty(displayTile.id)}
                    >
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>
                        Заложить в банк (+${displayTile.mortgageValue || 100})
                      </span>
                    </Button>
                  )}
                </div>
              )}

              {!isOwner && (
                <div className="mt-auto p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  {ownerPlayer ? (
                    <span>
                      Владелец:{" "}
                      <strong
                        style={{ color: ownerPlayer.color?.hex || "#fff" }}
                      >
                        {ownerPlayer.name}
                      </strong>
                      {displayTile.isMortgaged && (
                        <span className="text-red-400 ml-1 font-bold">
                          (В залоге)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      Вокзал свободен для покупки
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* =========================================================
              C. UTILITY SERVICES (WinRAR, Speedtest)
              ========================================================= */}
          {isUtility && (
            <>
              <div className="flex flex-col gap-1 text-xs sm:text-[13px] p-2 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase pb-1 border-b border-white/10 px-1">
                  <span>Рента сервиса</span>
                  <span className="flex items-center gap-1">
                    ${" "}
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 rounded">
                  <span className="text-muted-foreground">
                    1 сервис во владении:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    $20
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 rounded text-emerald-400 font-bold">
                  <span>2 сервиса (монополия):</span>
                  <span className="font-mono font-black">$60</span>
                </div>

                {/* Price Highlights */}
                <div className="pt-1.5 mt-1 border-t border-white/10 flex flex-col gap-1">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold text-xs sm:text-sm">
                    <span>Стоимость покупки</span>
                    <span className="font-mono font-black text-white text-sm sm:text-base">
                      ${displayTile.price || 150}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
                    <span>Залог в банке</span>
                    <span className="font-mono font-bold text-foreground">
                      ${displayTile.mortgageValue || 75}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Action Buttons */}
              {isOwner && (
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  {displayTile.isMortgaged ? (
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs font-black bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                      onClick={() => unmortgageProperty(displayTile.id)}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>
                        Выкупить поле ($
                        {Math.round((displayTile.mortgageValue || 75) * 1.1)})
                      </span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs font-black bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300 rounded-xl flex items-center justify-center gap-1.5"
                      onClick={() => mortgageProperty(displayTile.id)}
                    >
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>
                        Заложить в банк (+${displayTile.mortgageValue || 75})
                      </span>
                    </Button>
                  )}
                </div>
              )}

              {!isOwner && (
                <div className="mt-auto p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  {ownerPlayer ? (
                    <span>
                      Владелец:{" "}
                      <strong
                        style={{ color: ownerPlayer.color?.hex || "#fff" }}
                      >
                        {ownerPlayer.name}
                      </strong>
                      {displayTile.isMortgaged && (
                        <span className="text-red-400 ml-1 font-bold">
                          (В залоге)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      Сервис свободен для покупки
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* =========================================================
              D. REGULAR STREET REAL ESTATE (GitHub, Apple, etc.)
              ========================================================= */}
          {isStreet && (
            <>
              {/* Rents & Cost Table */}
              <div className="flex flex-col gap-0.5 text-xs sm:text-[13px] p-2 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase pb-1 border-b border-white/10 px-1">
                  <span>Рента</span>
                  <span className="flex items-center gap-1">
                    ${" "}
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  </span>
                </div>

                {displayTile.rents && displayTile.rents.length >= 6 ? (
                  <>
                    <div
                      className={cn(
                        "flex items-center justify-between py-0.5 px-1 rounded",
                        housesCount === 0 &&
                          isOwner &&
                          "bg-indigo-500/20 text-white font-bold",
                      )}
                    >
                      <span className="text-muted-foreground">Без офисов</span>
                      <span className="font-mono font-bold text-foreground">
                        ${displayTile.rents[0]}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between py-0.5 px-1 rounded",
                        housesCount === 1 &&
                          "bg-indigo-500/20 text-white font-bold",
                      )}
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        1 офис <span className="text-xs">🏢</span>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ${displayTile.rents[1]}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between py-0.5 px-1 rounded",
                        housesCount === 2 &&
                          "bg-indigo-500/20 text-white font-bold",
                      )}
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        2 офиса <span className="text-xs">🏢🏢</span>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ${displayTile.rents[2]}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between py-0.5 px-1 rounded",
                        housesCount === 3 &&
                          "bg-indigo-500/20 text-white font-bold",
                      )}
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        3 офиса <span className="text-xs">🏢🏢🏢</span>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ${displayTile.rents[3]}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between py-0.5 px-1 rounded",
                        housesCount === 4 &&
                          "bg-indigo-500/20 text-white font-bold",
                      )}
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        4 офиса <span className="text-xs">🏢🏢🏢🏢</span>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ${displayTile.rents[4]}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between py-0.5 px-1 rounded",
                        housesCount === 5 &&
                          "bg-indigo-500/20 text-white font-bold",
                      )}
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        Головной офис <span className="text-xs">🏨</span>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ${displayTile.rents[5]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 rounded text-amber-300 font-bold">
                      <span className="flex items-center gap-1">
                        Монополия (2x) <span className="text-xs">🔴</span>
                      </span>
                      <span className="font-mono font-black">
                        ${displayTile.rents[0] * 2}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-1 px-1 text-muted-foreground">
                    <span>Базовая рента</span>
                    <span className="font-mono font-bold text-foreground">
                      ${displayTile.rent || 25}
                    </span>
                  </div>
                )}

                {/* Price Highlights */}
                <div className="pt-1.5 mt-1 border-t border-white/10 flex flex-col gap-1">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold text-xs sm:text-sm">
                    <span>Стоимость поля</span>
                    <span className="font-mono font-black text-white text-sm sm:text-base">
                      ${displayTile.price || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
                    <span>Залог поля</span>
                    <span className="font-mono font-bold text-foreground">
                      $
                      {displayTile.mortgageValue ||
                        Math.round((displayTile.price || 60) / 2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
                    <span>Выкуп (+10%)</span>
                    <span className="font-mono font-bold text-foreground">
                      $
                      {Math.round(
                        (displayTile.mortgageValue ||
                          Math.round((displayTile.price || 60) / 2)) * 1.1,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Property Owner */}
              {isOwner && (
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  {/* Build / Sell Houses */}
                  {displayTile.housePrice && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {(() => {
                        const isMyTurn = Boolean(
                          gameState.players[gameState.currentTurnIndex]?.id === playerId &&
                          gameState.status !== 'GAME_OVER' &&
                          gameState.status !== 'LOBBY'
                        );
                        const isAlreadyBuiltThisTurn = Boolean(
                          gameState.builtTilesThisTurn?.includes(
                            displayTile.id,
                          ),
                        );
                        const isBuildCapped = isMaxHouses;
                        const canBuild =
                          isMyTurn &&
                          !isBuildCapped &&
                          !isAlreadyBuiltThisTurn &&
                          canAffordHouse &&
                          !displayTile.isMortgaged;
                        const sellRefund = Math.floor(
                          (displayTile.housePrice || 50) / 2,
                        );

                        let buildTitle = `Построить улучшение за $${displayTile.housePrice}`;
                        if (!isMyTurn)
                          buildTitle = "Улучшать недвижимость можно только во время своего хода";
                        else if (displayTile.isMortgaged)
                          buildTitle = "Поле в залоге";
                        else if (isAlreadyBuiltThisTurn)
                          buildTitle =
                            "Не более 1 улучшения на одной улице за ход";
                        else if (!canAffordHouse)
                          buildTitle = `Недостаточно средств ($${displayTile.housePrice})`;

                        return (
                          <>
                            <Button
                              size="sm"
                              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                              disabled={!canBuild}
                              onClick={() => buildHouse(displayTile.id)}
                              title={buildTitle}
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5" />
                              <span>+Улучшить (${displayTile.housePrice})</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-bold bg-white/5 hover:bg-white/10 border-white/10 text-muted-foreground hover:text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                              disabled={housesCount === 0}
                              onClick={() => sellHouse(displayTile.id)}
                              title={`Разрушить (${housesCount === 5 ? "отель" : "офис"}) за +$${sellRefund}`}
                            >
                              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Разрушить (+${sellRefund})</span>
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Mortgage / Unmortgage Button */}
                  {displayTile.isMortgaged ? (
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs font-black bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                      onClick={() => unmortgageProperty(displayTile.id)}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>
                        Выкупить поле ($
                        {Math.round((displayTile.mortgageValue || 30) * 1.1)})
                      </span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs font-black bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300 rounded-xl flex items-center justify-center gap-1.5"
                      disabled={housesCount > 0}
                      onClick={() => mortgageProperty(displayTile.id)}
                      title={
                        housesCount > 0
                          ? "Сначала продайте офисы"
                          : "Заложить поле в банк"
                      }
                    >
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>
                        Заложить поле (+$
                        {displayTile.mortgageValue ||
                          Math.round((displayTile.price || 60) / 2)}
                        )
                      </span>
                    </Button>
                  )}
                </div>
              )}

              {/* If property is unowned or owned by other */}
              {!isOwner && (
                <div className="mt-auto p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  {ownerPlayer ? (
                    <span>
                      Владелец:{" "}
                      <strong
                        style={{ color: ownerPlayer.color?.hex || "#fff" }}
                      >
                        {ownerPlayer.name}
                      </strong>
                      {displayTile.isMortgaged && (
                        <span className="text-red-400 ml-1 font-bold">
                          (В залоге)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      Поле свободно для покупки
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          CARD 2 (BOTTOM SECTION): ИГРОВОЙ ЧАТ С ПОЛЕМ ВВОДА
          ------------------------------------------------------------- */}
      <div className="h-56 sm:h-64 xl:h-72 flex flex-col bg-[#13162b]/95 border border-white/15 rounded-2xl shadow-xl overflow-hidden shrink-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs sm:text-sm font-black tracking-wide text-foreground">
              Чат
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] font-mono px-1.5 py-0 bg-white/5 border-white/10 text-muted-foreground"
          >
            {chatMessages.length}
          </Badge>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-2 no-scrollbar flex flex-col gap-1.5 text-xs sm:text-[13px]">
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-xs italic">
              Чат пуст. Напишите сообщение!
            </div>
          ) : (
            chatMessages.map((msg, idx) => {
              const isMyMsg = msg.playerId === playerId;
              const sender = gameState.players.find(
                (p) => p.id === msg.playerId,
              );
              const senderHex = sender?.color?.hex || "#a5b4fc";

              return (
                <div
                  key={msg.id || idx}
                  className={cn(
                    "p-2 rounded-xl leading-tight break-words shadow-xs border",
                    isMyMsg
                      ? "bg-indigo-950/50 border-indigo-500/30 self-end max-w-[90%]"
                      : "bg-white/5 border-white/10 self-start max-w-[90%]",
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="font-black text-xs"
                      style={{ color: senderHex }}
                    >
                      {msg.playerName || sender?.name || "Игрок"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 ml-auto">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-white/95 text-xs leading-relaxed">
                    {msg.text || msg.message}
                  </p>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar or Auth Notice */}
        {currentUser || myPlayer?.telegramId || myPlayer?.yandexId ? (
          <form
            onSubmit={handleSendMessage}
            className="p-2 border-t border-white/10 flex items-center gap-1.5 bg-black/20 shrink-0"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Сообщение в чат..."
              className="flex-1 h-8 px-2.5 text-xs sm:text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/60"
              maxLength={100}
            />
            <Button
              type="submit"
              size="icon"
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-sm cursor-pointer active:scale-95"
              disabled={!chatInput.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        ) : (
          <div className="p-2 border-t border-white/10 flex items-center justify-between gap-1.5 bg-black/30 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Только для авторизованных</span>
            </div>
            <Button
              size="sm"
              variant="gold"
              className="h-7 text-[10px] font-bold px-2.5 rounded-lg shrink-0 cursor-pointer active:scale-95"
              onClick={() => openModal("telegramLogin")}
            >
              Войти
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
