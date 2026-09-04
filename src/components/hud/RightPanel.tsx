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
import { TileIconImage } from "@/lib/pixelIcons";
import { PetAvatar } from "@/components/common/PetAvatar";
import {
  canBuildHouse,
  canSellHouse,
  canMortgage,
  canUnmortgage,
  getUpgradeCost,
  getSellRefund,
} from "@/lib/propertyRules";

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
    theme,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    sendChatMessage,
    chatMessages,
    currentUser,
    openModal,
  } = useGame();

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const myMoney = myPlayer?.money || 0;
  const isTeamMode = gameState.gameMode === 'team';
  const myProperties = gameState.board.filter(
    (tile) => tile.ownerId === playerId || (isTeamMode && myPlayer?.teamId && tile.teamId === myPlayer.teamId),
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

  const isOwner = isProperty && displayTile && (
    displayTile.ownerId === playerId ||
    (isTeamMode && myPlayer?.teamId && displayTile.teamId === myPlayer.teamId)
  );
  const ownerPlayer = displayTile?.ownerId
    ? gameState.players.find((p) => p.id === displayTile.ownerId)
    : null;
  const isMyTurn = Boolean(
    gameState.players[gameState.currentTurnIndex]?.id === playerId &&
    gameState.status !== "GAME_OVER" &&
    gameState.status !== "LOBBY"
  );
  const housesCount = displayTile?.houses || 0;
  const isMaxHouses = housesCount >= 5;
  const currentUpgradeCost = displayTile
    ? displayTile.upgradeCost ||
      Math.round((displayTile.housePrice || 50) * (1 + housesCount * 0.25))
    : 50;
  const currentSellRefund = displayTile
    ? displayTile.sellRefund !== undefined
      ? displayTile.sellRefund
      : Math.floor(
          Math.round(
            (displayTile.housePrice || 50) *
              (1 + Math.max(0, housesCount - 1) * 0.25),
          ) / 2,
        )
    : 25;
  const canAffordHouse = Boolean(
    displayTile?.housePrice && myMoney >= currentUpgradeCost,
  );

  const getSpecialInfo = (tile: TileData) => {
    switch (tile.type) {
      case "start":
        return {
          category: "Автодром «Старт»",
          badgeColor:
            "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          bannerColor: "#059669",
          icon: "🏁",
          description:
            tile.description ||
            "Стартовая прямая автодрома. При каждом прохождении или остановке на этой клетке игрок получает призовые +$200 от спонсоров.",
          rules: [
            "Каждый круг заезда начинается с этой клетки",
            "Бонус +$200 начисляется автоматически при пересечении черты",
            "Не облагается дорожными сборами и налогами",
          ],
        };
      case "chance":
        return {
          category: "Дорожный инцидент",
          badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          bannerColor: "#7C3AED",
          icon: "❓",
          description:
            tile.description ||
            'Неожиданные дорожные ситуации и форс-мажоры. Остановившись здесь, вы вытягиваете случайную карту из колоды "Шанс".',
          rules: [
            "Может принести контракт со спонсором, штраф за превышение или тюнинг",
            "Может переместить вас на другую клетку трассы или прямо на штрафстоянку",
            "Может содержать талон бесплатного выезда со штрафстоянки",
          ],
        };
      case "chest":
        return {
          category: "Гаражный фонд",
          badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          bannerColor: "#2563EB",
          icon: "🧰",
          description:
            tile.description ||
            'Касса автоклуба и фонд взаимопомощи гонщиков. Остановившись здесь, вы получаете выплату или счёт из фонда автоклуба.',
          rules: [
            "Призовые кубков, страховые выплаты и бонусы автоклуба",
            "Оплата планового ТО, детейлинга или непредвиденных расходов",
            "Действие карты применяется немедленно",
          ],
        };
      case "jail":
        return {
          category: "Пост ДПС / Штрафстоянка",
          badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          bannerColor: "#475569",
          icon: "🚔",
          description:
            "Сектор ДПС и штрафстоянки. Если вы прибыли сюда обычным ходом кубиков — это плановая проверка документов, вы свободны.",
          rules: [
            "Простая проверка: никаких штрафов и задержек",
            "На штрафстоянке: оплата штрафа $50, талон или дубль на кубиках",
            "Максимум 3 хода, после чего штраф $50 списывается автоматически",
          ],
        };
      case "parking":
        return {
          category: "Пит-стоп / Автокемпинг",
          badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          bannerColor: "#0D9488",
          icon: "🅿️",
          description:
            tile.description ||
            "Безопасная стоянка и зона отдыха автоклуба. Здесь можно перевести дух перед следующими кругами заезда.",
          rules: [
            "Никаких платежей за парковку, аренды или штрафов",
            "Полная безопасность для вашего автопарка",
            "Следующий ход совершается в обычном порядке",
          ],
        };
      case "gotojail":
        return {
          category: "Эвакуация на штрафстоянку",
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
          bannerColor: "#DC2626",
          icon: "🚨",
          description:
            tile.description ||
            "Грубое нарушение ПДД! Автомобиль немедленно эвакуируют на Штрафстоянку.",
          rules: [
            "Автомобиль эвакуируется на Штрафстоянку",
            "Бонус за прохождение СТАРТА не выплачивается",
            "Текущий заезд немедленно завершается",
          ],
        };
      case "tax":
        return {
          category: "Транспортный налог / Утильсбор",
          badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          bannerColor: "#E11D48",
          icon: "🧾",
          description:
            tile.description ||
            `Государственный дорожный сбор. Остановившись на этой клетке, игрок обязан выплатить $${tile.amount || 200} в дорожный фонд.`,
          rules: [
            `Сумма сбора: $${tile.amount || 200}`,
            "Деньги направляются в дорожный фонд",
            "При нехватке наличных заложите автомобили из автопарка",
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
        "w-64 sm:w-72 xl:w-76 h-full flex flex-col justify-between p-2 sm:p-2.5 gap-2 shrink-0 select-none z-20 overflow-hidden shadow-2xl border-l-2",
        isNoir ? "noir-panel" : isSoviet ? "bg-[#111820] border-[#2A3848] font-soviet" : "bg-[#081d14] border-slate-500/40 font-sans",
        className,
      )}
    >
      {/* -------------------------------------------------------------
          CARD 1 (TOP SECTION): PROPERTY DEED / ПАСПОРТ ОБЪЕКТА
          ------------------------------------------------------------- */}
      <div className={cn(
        "flex-1 min-h-0 flex flex-col rounded-none shadow-xl overflow-hidden relative border",
        isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-slate-500/40 font-sans"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-3 py-1.5 border-b shrink-0",
          isNoir ? "border-[#d4a647]/40 bg-[#1a1410]" : isSoviet ? "border-[#38bdf8]/40 bg-[#0f1a28]" : "border-slate-500/30 bg-[#0f172a]"
        )}>
          <div className="flex items-center gap-1.5">
            <Building2 className={cn("w-3.5 h-3.5", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
            <span className={cn("text-xs sm:text-sm font-bold tracking-wide", isNoir ? "font-noir-title text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "font-sans text-white")}>
              {isNoir ? "ДОСЬЕ НА ТЕРРИТОРИЮ" : isSoviet ? "ПАСПОРТ ОБЪЕКТА ОКБ-1" : (isProperty ? "ТЕХПАСПОРТ АВТОМОБИЛЯ" : "СПЕЦИАЛЬНОЕ ПОЛЕ")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedTile && (
              <button
                onClick={onCloseTile}
                className="w-5 h-5 rounded-none hover:bg-black/20 flex items-center justify-center text-[#94a3b8] hover:text-[#e2e8f0] transition-all"
                title="Сбросить выбор"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {onClosePanel && (
              <button
                onClick={onClosePanel}
                className="w-5 h-5 rounded-none hover:bg-black/20 flex items-center justify-center text-[#94a3b8] hover:text-[#e2e8f0] transition-all ml-1"
                title="Закрыть панель"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Property / Sector Card Body */}
        <div className={cn("flex-1 flex flex-col min-h-0 p-2 overflow-y-auto no-scrollbar gap-2", isNoir ? "bg-[#14100c]" : isSoviet ? "bg-[#0c1420]" : "bg-[#05170f]")}>
          {/* 1. Group Banner */}
          <div
            className={cn(
              "p-2 rounded-none flex flex-col items-center justify-center text-center shadow-sm shrink-0 transition-all border",
              isNoir ? "border-[#d4a647]/50" : isSoviet ? "border-[#38bdf8]/50" : "border-slate-500/40"
            )}
            style={{
              backgroundColor: isProperty
                ? displayTile.color || (isNoir ? "#8b0000" : isSoviet ? "#0369a1" : "#059669")
                : specialInfo?.bannerColor || (isNoir ? "#8b0000" : isSoviet ? "#0369a1" : "#059669"),
              color: "#ffffff",
            }}
          >
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold opacity-90">
              {isProperty
                ? displayTile.groupName || (isNoir ? "СЕКТОР" : isSoviet ? "СЕКТОР ОРБИТЫ" : "ГРУППА")
                : specialInfo?.category || (isNoir ? "ДЕТАЛИ ДЕЛА" : isSoviet ? "ОБЪЕКТ ЦУП" : "СПЕЦИАЛЬНОЕ ПОЛЕ")}
            </span>
            <div className="w-14 h-10 my-1 flex items-center justify-center">
              <TileIconImage tile={displayTile} className="w-full h-full object-contain filter contrast-125 brightness-95" />
            </div>
            <span className={cn("text-xs sm:text-sm font-bold tracking-wide drop-shadow-sm leading-tight", isNoir ? "font-noir-title" : isSoviet ? "font-soviet" : "font-sans")}>
              {displayTile.name}
            </span>
          </div>

          {/* Owner Status Bar */}
          {isProperty && (
            <div
              className={cn(
                "p-2 rounded-none border flex items-center justify-between text-xs shadow-inner",
                isNoir
                  ? "bg-[#1a1410] border-[#d4a647]/40 font-noir-body"
                  : isSoviet
                  ? "bg-[#09111c] border-[#38bdf8]/40 font-space"
                  : "bg-[#020617] border-slate-500/40 font-sans"
              )}
            >
              {ownerPlayer ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <PetAvatar
                        characterId={ownerPlayer.characterId}
                        anim="idle"
                        size="sm"
                        showPedestal
                        pedestalColor={ownerPlayer.color?.hex}
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">
                        {isNoir ? "ВЛАДЕЛЕЦ ОБЪЕКТА" : isSoviet ? "КОМАНДИР СЕКТОРА" : "ВЛАДЕЛЕЦ"}
                      </span>
                      <span
                        className="font-bold text-xs"
                        style={{ color: ownerPlayer.color?.hex || (isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#10b981") }}
                      >
                        {isOwner ? "★ ВЫ" : isTeamMode && ownerPlayer.teamId === myPlayer?.teamId ? `★ СОЮЗНИК: ${ownerPlayer.name}` : ownerPlayer.name}
                      </span>
                    </div>
                  </div>
                  {displayTile.isMortgaged ? (
                    <span className="text-red-400 text-[10px] font-bold px-1.5 py-0.5 bg-red-950/80 border border-red-500">
                      ЗАЛОЖЕНО
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-bold px-1.5 py-0.5 bg-slate-950/80 border border-slate-500">
                      КУПЛЕНО
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-sm">✦</span>
                    <span className="font-bold text-slate-300 text-xs">
                      {isNoir ? "СВОБОДНАЯ НЕДВИЖИМОСТЬ" : isSoviet ? "СВОБОДНЫЙ ОБЪЕКТ" : "СВОБОДНЫЙ АВТОМОБИЛЬ"}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-amber-300">
                    ${displayTile.price}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Car / Property Description Quote */}
          {isProperty && displayTile.description && (
            <div className={cn(
              "p-2 rounded-none border text-left text-xs leading-relaxed italic shrink-0",
              isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#020617] border-slate-500/30 text-slate-200"
            )}>
              <p className="leading-snug">{displayTile.description}</p>
            </div>
          )}

          {/* =========================================================
              A. SPECIAL NON-PROPERTY TILES (Chance, Jail, Start, etc.)
              ========================================================= */}
          {!isProperty && specialInfo && (
            <div className="flex flex-col gap-2 py-1 text-left">
              <div className={cn("p-2.5 rounded-none border leading-relaxed", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#082216] border-slate-500/30 text-slate-100")}>
                <p className="text-xs sm:text-[13px] leading-normal">
                  {specialInfo.description}
                </p>
              </div>

              {specialInfo.rules && specialInfo.rules.length > 0 && (
                <div className={cn("p-2 rounded-none border flex flex-col gap-1", isNoir ? "bg-[#14100c] border-[#d4a647]/20" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/20" : "bg-[#020617] border-slate-500/20")}>
                  <span className={cn("text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>
                    <Info className="w-3 h-3" />
                    {isNoir ? "УЛИКИ:" : isSoviet ? "ПРИКАЗ ГОСКОМИССИИ:" : "ПРАВИЛА ПОЛЯ:"}
                  </span>
                  <ul className="flex flex-col gap-0.5 text-xs text-slate-200 pl-1">
                    {specialInfo.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className={cn("font-bold leading-tight", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>✦</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              B. TRANSPORT HUB / RAILROADS / SPACEPORTS
              ========================================================= */}
          {isTransport && (
            <>
              <div className={cn("flex flex-col gap-1 text-xs p-2 rounded-none border", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#0f172a] border-slate-500/30 font-sans")}>
                <div className={cn("flex items-center justify-between text-[9px] font-bold uppercase pb-1 border-b px-1 tracking-wider", isNoir ? "text-[#b8a890] border-[#d4a647]/20" : isSoviet ? "text-[#94a3b8] border-[#38bdf8]/20" : "text-slate-400 border-slate-500/20")}>
                  <span>{isNoir ? "ТАРИФ" : isSoviet ? "ТАРИФ КОСМОДРОМА" : "ТАРИФ АВТОПАРКА"}</span>
                  <span className="font-bold">{isNoir ? "$" : isSoviet ? "кР" : "$"}</span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1">
                  <span>{isSoviet ? "1 космодром:" : "1 авто:"}</span>
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-slate-300")}>{isNoir ? "$25" : isSoviet ? "25 кР" : "$25"}</span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1">
                  <span>{isSoviet ? "2 космодрома:" : "2 авто:"}</span>
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-slate-300")}>{isNoir ? "$50" : isSoviet ? "50 кР" : "$50"}</span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1">
                  <span>{isSoviet ? "3 космодрома:" : "3 авто:"}</span>
                  <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-slate-300")}>{isNoir ? "$100" : isSoviet ? "100 кР" : "$100"}</span>
                </div>
                <div className={cn("flex items-center justify-between py-0.5 px-1 font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")}>
                  <span>{isSoviet ? "4 космодрома (Сеть СССР):" : "4 авто (Весь автопарк):"}</span>
                  <span className="font-bold text-base">{isNoir ? "$200" : isSoviet ? "200 кР" : "$200"}</span>
                </div>

                {/* Price Highlights */}
                <div className={cn("pt-1 mt-1 border-t flex flex-col gap-1", isNoir ? "border-[#d4a647]/30 font-noir-body" : isSoviet ? "border-[#38bdf8]/30 font-space" : "border-slate-500/30 font-sans")}>
                  <div className={cn("flex items-center justify-between px-2 py-1 rounded-none border text-xs font-bold", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#0f1f33] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#1e293b] border-slate-500/40 text-slate-100")}>
                    <span>{isNoir ? "СТОИМОСТЬ" : isSoviet ? "БАЛАНСОВАЯ СТОИМОСТЬ" : "СТОИМОСТЬ АВТОМОБИЛЯ"}</span>
                    <span className="font-bold text-sm">
                      {isNoir ? `$${displayTile.price || 200}` : isSoviet ? `${displayTile.price || 200} кР` : `$${displayTile.price || 200}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 text-[#94a3b8] text-xs">
                    <span>{isNoir ? "ЗАЛОГ У РОСТОВЩИКА" : isSoviet ? "АВАРИЙНЫЙ РЕЗЕРВ" : "ЗАЛОГОВАЯ СТОИМОСТЬ"}</span>
                    <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-slate-400")}>
                      {isNoir ? `$${displayTile.mortgageValue || 100}` : isSoviet ? `${displayTile.mortgageValue || 100} кР` : `$${displayTile.mortgageValue || 100}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Action Buttons */}
              {isOwner && (
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  {(() => {
                    const mortgageVal = canMortgage(displayTile, gameState, playerId);
                    const unmortgageVal = canUnmortgage(displayTile, gameState, playerId);

                    return displayTile.isMortgaged ? (
                      <button
                        className={cn(
                          "w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5 font-bold transition-all",
                          unmortgageVal.allowed
                            ? (isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")
                            : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                        )}
                        disabled={!unmortgageVal.allowed}
                        title={unmortgageVal.reason}
                        onClick={() => unmortgageProperty(displayTile.id)}
                      >
                        <Banknote className="w-3.5 h-3.5 text-white" />
                        <span>
                          {isNoir ? `ВЫКУПИТЬ У РОСТОВЩИКА (-$${unmortgageVal.cost})` : isSoviet
                            ? `РАСКОНСЕРВАЦИЯ (${unmortgageVal.cost} кР)`
                            : `ВЫКУПИТЬ ИЗ ЗАЛОГА (-$${unmortgageVal.cost})`}
                        </span>
                      </button>
                    ) : (
                      <button
                        className={cn(
                          "w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5 font-bold transition-all",
                          mortgageVal.allowed
                            ? (isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626]" : "classic-btn-danger")
                            : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                        )}
                        disabled={!mortgageVal.allowed}
                        title={mortgageVal.reason}
                        onClick={() => mortgageProperty(displayTile.id)}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>
                          {isNoir ? `ЗАЛОЖИТЬ У РОСТОВЩИКА (+$${mortgageVal.value})` : isSoviet
                            ? `КОНСЕРВАЦИЯ (+${mortgageVal.value} кР)`
                            : `ЗАЛОЖИТЬ В БАНК (+$${mortgageVal.value})`}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              )}

              {!isOwner && (
                <div className={cn("mt-auto p-1.5 rounded-none border text-center text-xs flex items-center justify-center", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#b8a890]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#94a3b8]" : "bg-[#020617] border-slate-500/30 text-slate-300")}>
                  {ownerPlayer ? (
                    <span>
                      {isNoir ? "ВЛАДЕЛЕЦ: " : isSoviet ? "КОМАНДИР: " : "ВЛАДЕЛЕЦ: "}
                      <strong style={{ color: ownerPlayer.color?.hex || (isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#10b981") }}>
                        {ownerPlayer.name}
                      </strong>
                      {displayTile.isMortgaged && (
                        <span className="text-[#ef4444] ml-1 font-bold">
                          {isNoir ? "[В ЗАЛОГЕ]" : isSoviet ? "[В РЕЗЕРВЕ]" : "[ЗАЛОЖЕНО]"}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-bold">
                      {isNoir ? "СВОБОДНО" : isSoviet ? "СВОБОДНЫЙ КОСМОДРОМ" : "СВОБОДНЫЙ АВТОМОБИЛЬ"}
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* =========================================================
              C. UTILITY / ENERGY / WATER
              ========================================================= */}
          {isUtility && (
            <>
              <div className={cn("flex flex-col gap-1 text-[11px] p-2 rounded-none border leading-relaxed", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#0f172a] border-slate-500/30 font-sans")}>
                <div className={cn("text-[9px] font-bold uppercase pb-1 border-b mb-1 tracking-wider text-center", isNoir ? "text-[#b8a890] border-[#d4a647]/20" : isSoviet ? "text-[#94a3b8] border-[#38bdf8]/20" : "text-slate-400 border-slate-500/20")}>
                  {isNoir ? "ТАРИФ" : isSoviet ? "ТАРИФ ЭНЕРГОСЕТИ СССР" : "ТАРИФ АВТОСЕРВИСА И ЗАПРАВКИ"}
                </div>
                <div className="flex items-start gap-1.5">
                  <span className={cn("font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>✦</span>
                  <span>{isSoviet ? "Если есть 1 узел: множитель х4 к броску кубиков." : "Если есть 1 сервис (АЗС или СТО): множитель х4 к кубикам."}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className={cn("font-bold", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")}>✦</span>
                  <span>{isSoviet ? "Если есть 2 узла: множитель х10 к броску кубиков." : "Если есть оба сервиса (АЗС и СТО): множитель х10 к кубикам."}</span>
                </div>

                {/* Price Highlights */}
                <div className={cn("pt-1 mt-1 border-t flex flex-col gap-1", isNoir ? "border-[#d4a647]/30 font-noir-body" : isSoviet ? "border-[#38bdf8]/30 font-space" : "border-slate-500/30 font-sans")}>
                  <div className={cn("flex items-center justify-between px-2 py-1 rounded-none border text-xs font-bold", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#0f1f33] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#1e293b] border-slate-500/40 text-slate-100")}>
                    <span>{isNoir ? "СТОИМОСТЬ" : isSoviet ? "БАЛАНСОВАЯ СТОИМОСТЬ" : "СТОИМОСТЬ ПОКУПКИ"}</span>
                    <span className="font-bold text-sm">
                      {isNoir ? `$${displayTile.price || 150}` : isSoviet ? `${displayTile.price || 150} кР` : `$${displayTile.price || 150}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 text-[#94a3b8] text-xs">
                    <span>{isNoir ? "ЗАЛОГ У РОСТОВЩИКА" : isSoviet ? "АВАРИЙНЫЙ РЕЗЕРВ" : "ЗАЛОГОВАЯ СТОИМОСТЬ"}</span>
                    <span className={cn("font-bold text-sm", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-slate-400")}>
                      {isNoir ? `$${displayTile.mortgageValue || 75}` : isSoviet ? `${displayTile.mortgageValue || 75} кР` : `$${displayTile.mortgageValue || 75}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Action Buttons */}
              {isOwner && (
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  {(() => {
                    const mortgageVal = canMortgage(displayTile, gameState, playerId);
                    const unmortgageVal = canUnmortgage(displayTile, gameState, playerId);

                    return displayTile.isMortgaged ? (
                      <button
                        className={cn(
                          "w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5 font-bold transition-all",
                          unmortgageVal.allowed
                            ? (isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")
                            : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                        )}
                        disabled={!unmortgageVal.allowed}
                        title={unmortgageVal.reason}
                        onClick={() => unmortgageProperty(displayTile.id)}
                      >
                        <Banknote className="w-3.5 h-3.5 text-white" />
                        <span>
                          {isNoir ? `ВЫКУПИТЬ У РОСТОВЩИКА (-$${unmortgageVal.cost})` : isSoviet
                            ? `РАСКОНСЕРВАЦИЯ (${unmortgageVal.cost} кР)`
                            : `ВЫКУПИТЬ ИЗ ЗАЛОГА (-$${unmortgageVal.cost})`}
                        </span>
                      </button>
                    ) : (
                      <button
                        className={cn(
                          "w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5 font-bold transition-all",
                          mortgageVal.allowed
                            ? (isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626]" : "classic-btn-danger")
                            : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                        )}
                        disabled={!mortgageVal.allowed}
                        title={mortgageVal.reason}
                        onClick={() => mortgageProperty(displayTile.id)}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>
                          {isNoir ? `ЗАЛОЖИТЬ У РОСТОВЩИКА (+$${mortgageVal.value})` : isSoviet
                            ? `КОНСЕРВАЦИЯ (+${mortgageVal.value} кР)`
                            : `ЗАЛОЖИТЬ В БАНК (+$${mortgageVal.value})`}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              )}

              {!isOwner && (
                <div className={cn("mt-auto p-1.5 rounded-none border text-center text-xs flex items-center justify-center", isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#94a3b8]" : "bg-[#020617] border-slate-500/30 text-slate-300")}>
                  {ownerPlayer ? (
                    <span>
                      {isSoviet ? "ОПЕРАТОР: " : "ВЛАДЕЛЕЦ: "}
                      <strong style={{ color: ownerPlayer.color?.hex || (isSoviet ? "#38bdf8" : "#10b981") }}>
                        {ownerPlayer.name}
                      </strong>
                      {displayTile.isMortgaged && (
                        <span className="text-[#ef4444] ml-1 font-bold">
                          {isSoviet ? "[В РЕЗЕРВЕ]" : "[ЗАЛОЖЕНО]"}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-bold">
                      {isSoviet ? "СВОБОДНЫЙ ЭНЕРГОСЕКТОР" : "СВОБОДНЫЙ СЕРВИС"}
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* =========================================================
              D. STREETS / ORBITAL SECTORS
              ========================================================= */}
          {isStreet && (
            <>
              {/* Rents & Cost Table */}
              <div className={cn("flex flex-col gap-0.5 text-xs p-2 rounded-none border", isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#0f172a] border-slate-500/30 font-sans")}>
                <div className={cn("flex items-center justify-between text-[9px] font-bold uppercase pb-1 border-b px-1 tracking-wider", isSoviet ? "text-[#94a3b8] border-[#38bdf8]/20" : "text-slate-400 border-slate-500/20")}>
                  <span>{isSoviet ? "ТЕЛЕМЕТРИЯ СБОРА (ТАРИФ)" : "ТАРИФ ЗАЕЗДА (АРЕНДА)"}</span>
                  <span className="font-bold">{isSoviet ? "кР" : "$"}</span>
                </div>

                {displayTile.rents && displayTile.rents.length >= 6 ? (
                  <>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none", housesCount === 0 && isOwner && (isSoviet ? "bg-[#0f1f33] font-bold text-[#38bdf8]" : "bg-slate-900/60 font-bold text-slate-300"))}>
                      <span>{isSoviet ? "Базовая орбита:" : "Базовый заезд:"}</span>
                      <span className="font-bold text-sm">{isSoviet ? `${displayTile.rents[0]} кР` : `$${displayTile.rents[0]}`}</span>
                    </div>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none", housesCount === 1 && (isSoviet ? "bg-[#0f1f33] font-bold text-[#38bdf8]" : "bg-slate-900/60 font-bold text-slate-300"))}>
                      <span>{isSoviet ? "1 модуль связи 🛰️" : "Стейдж 1 (1 дом) 🏠"}</span>
                      <span className="font-bold text-sm">{isSoviet ? `${displayTile.rents[1]} кР` : `$${displayTile.rents[1]}`}</span>
                    </div>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none", housesCount === 2 && (isSoviet ? "bg-[#0f1f33] font-bold text-[#38bdf8]" : "bg-slate-900/60 font-bold text-slate-300"))}>
                      <span>{isSoviet ? "2 модуля 🛰️🛰️" : "Стейдж 2 (2 дома) 🏠🏠"}</span>
                      <span className="font-bold text-sm">{isSoviet ? `${displayTile.rents[2]} кР` : `$${displayTile.rents[2]}`}</span>
                    </div>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none", housesCount === 3 && (isSoviet ? "bg-[#0f1f33] font-bold text-[#38bdf8]" : "bg-slate-900/60 font-bold text-slate-300"))}>
                      <span>{isSoviet ? "3 модуля 🛰️🛰️🛰️" : "Стейдж 3 (3 дома) 🏠🏠🏠"}</span>
                      <span className="font-bold text-sm">{isSoviet ? `${displayTile.rents[3]} кР` : `$${displayTile.rents[3]}`}</span>
                    </div>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none", housesCount === 4 && (isSoviet ? "bg-[#0f1f33] font-bold text-[#38bdf8]" : "bg-slate-900/60 font-bold text-slate-300"))}>
                      <span>{isSoviet ? "4 модуля 🛰️🛰️🛰️🛰️" : "Стейдж 4 (4 дома) 🏠🏠🏠🏠"}</span>
                      <span className="font-bold text-sm">{isSoviet ? `${displayTile.rents[4]} кР` : `$${displayTile.rents[4]}`}</span>
                    </div>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none", housesCount === 5 && (isSoviet ? "bg-[#260a0e] font-bold text-[#fca5a5]" : "bg-red-950/70 font-bold text-red-300"))}>
                      <span>{isSoviet ? "КОМПЛЕКС «МИР» ★" : "АВТОСАЛОН (ОТЕЛЬ) 🏨"}</span>
                      <span className="font-bold text-base text-red-400">{isSoviet ? `${displayTile.rents[5]} кР` : `$${displayTile.rents[5]}`}</span>
                    </div>
                    <div className={cn("flex items-center justify-between py-0.5 px-1 rounded-none font-bold border-t", isSoviet ? "text-[#38bdf8] border-[#38bdf8]/20" : "text-amber-400 border-slate-500/20")}>
                      <span>{isSoviet ? "МОНОПОЛИЯ СЕКТОРА (2x)" : "С МОНОПОЛИЕЙ (2x)"}</span>
                      <span className="font-bold text-sm">{isSoviet ? `${displayTile.rents[0] * 2} кР` : `$${displayTile.rents[0] * 2}`}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-1 px-1">
                    <span>{isSoviet ? "Базовый сбор" : "Базовый заезд"}</span>
                    <span className="font-bold text-sm">{isSoviet ? `${displayTile.rent || 25} кР` : `$${displayTile.rent || 25}`}</span>
                  </div>
                )}

                {/* Price Highlights */}
                <div className={cn("pt-1 mt-1 border-t flex flex-col gap-1", isSoviet ? "border-[#38bdf8]/30 font-space" : "border-slate-500/30 font-sans")}>
                  <div className={cn("flex items-center justify-between px-2 py-1 rounded-none border text-xs font-bold", isSoviet ? "bg-[#0f1f33] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#1e293b] border-slate-500/40 text-slate-100")}>
                    <span>{isSoviet ? "БАЛАНС СЕКТОРА" : "СТОИМОСТЬ АВТОМОБИЛЯ"}</span>
                    <span className="font-bold text-sm">
                      {isSoviet ? `${displayTile.price || 0} кР` : `$${displayTile.price || 0}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-1 text-[#94a3b8] text-xs">
                    <span>{isSoviet ? "АВАРИЙНЫЙ РЕЗЕРВ" : "ЗАЛОГОВАЯ СТОИМОСТЬ"}</span>
                    <span className={cn("font-bold text-sm", isSoviet ? "text-[#00e676]" : "text-slate-400")}>
                      {isSoviet ? `${displayTile.mortgageValue || Math.round((displayTile.price || 60) / 2)} кР` : `$${displayTile.mortgageValue || Math.round((displayTile.price || 60) / 2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Property Owner */}
              {isOwner && (
                <div className="flex flex-col gap-1.5 mt-auto pt-1">
                  {displayTile.housePrice && (
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const buildVal = canBuildHouse(displayTile, gameState, playerId);
                        const sellVal = canSellHouse(displayTile, gameState, playerId);
                        const isHotelUpgrade = displayTile.houses === 4;
                        const isHotelSell = displayTile.houses === 5;

                        const buildLabel = isNoir
                          ? (isHotelUpgrade ? `+ШТАБ ($${buildVal.cost})` : `+ЯВКА ($${buildVal.cost})`)
                          : isSoviet
                          ? (isHotelUpgrade ? `+МИР (${buildVal.cost} кР)` : `+МОДУЛЬ (${buildVal.cost} кР)`)
                          : (isHotelUpgrade ? `+ОТЕЛЬ ($${buildVal.cost})` : `+ТЮНИНГ ($${buildVal.cost})`);

                        const sellLabel = isNoir
                          ? (isHotelSell ? `-ШТАБ (+$${sellVal.refund})` : `-ЯВКА (+$${sellVal.refund})`)
                          : isSoviet
                          ? (isHotelSell ? `СНОС МИР (+${sellVal.refund} кР)` : `ДЕМОНТАЖ (+${sellVal.refund} кР)`)
                          : (isHotelSell ? `-ОТЕЛЬ (+$${sellVal.refund})` : `-ТЮНИНГ (+$${sellVal.refund})`);

                        return (
                          <>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                className={cn(
                                  "h-8 text-xs rounded-none flex items-center justify-center gap-1 font-bold transition-all",
                                  buildVal.allowed
                                    ? (isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")
                                    : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                                )}
                                disabled={!buildVal.allowed}
                                title={buildVal.reason || undefined}
                                onClick={() => buildHouse(displayTile.id)}
                              >
                                <ArrowUpCircle className="w-3.5 h-3.5" />
                                <span>{buildLabel}</span>
                              </button>

                              <button
                                className={cn(
                                  "h-8 text-xs rounded-none flex items-center justify-center gap-1 font-bold transition-all",
                                  sellVal.allowed
                                    ? (isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626]" : "classic-btn-danger")
                                    : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                                )}
                                disabled={!sellVal.allowed}
                                title={sellVal.reason || undefined}
                                onClick={() => sellHouse(displayTile.id)}
                              >
                                <ArrowDownCircle className="w-3.5 h-3.5" />
                                <span>{sellLabel}</span>
                              </button>
                            </div>

                            {!buildVal.allowed && buildVal.reason && (
                              <span className="text-[10px] text-amber-400/90 text-center font-medium leading-tight py-0.5">
                                ⚠️ {buildVal.reason}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Mortgage / Unmortgage Button */}
                  {(() => {
                    const mortgageVal = canMortgage(displayTile, gameState, playerId);
                    const unmortgageVal = canUnmortgage(displayTile, gameState, playerId);

                    return displayTile.isMortgaged ? (
                      <button
                        className={cn(
                          "w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5 font-bold transition-all",
                          unmortgageVal.allowed
                            ? (isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")
                            : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                        )}
                        disabled={!unmortgageVal.allowed}
                        title={unmortgageVal.reason}
                        onClick={() => unmortgageProperty(displayTile.id)}
                      >
                        <Banknote className="w-3.5 h-3.5 text-white" />
                        <span>
                          {isNoir ? `ВЫКУПИТЬ У РОСТОВЩИКА (-$${unmortgageVal.cost})` : isSoviet
                            ? `РАСКОНСЕРВАЦИЯ (${unmortgageVal.cost} кР)`
                            : `ВЫКУПИТЬ ИЗ ЗАЛОГА (-$${unmortgageVal.cost})`}
                        </span>
                      </button>
                    ) : (
                      <button
                        className={cn(
                          "w-full h-8 text-xs rounded-none flex items-center justify-center gap-1.5 font-bold transition-all",
                          mortgageVal.allowed
                            ? (isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626]" : "classic-btn-danger")
                            : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                        )}
                        disabled={!mortgageVal.allowed}
                        title={mortgageVal.reason}
                        onClick={() => mortgageProperty(displayTile.id)}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>
                          {isNoir ? `ЗАЛОЖИТЬ У РОСТОВЩИКА (+$${mortgageVal.value})` : isSoviet
                            ? `КОНСЕРВАЦИЯ (+${mortgageVal.value} кР)`
                            : `ЗАЛОЖИТЬ В БАНК (+$${mortgageVal.value})`}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              )}

              {!isOwner && (
                <div className={cn("mt-auto p-1.5 rounded-none border text-center text-xs flex items-center justify-center", isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#b8a890]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#94a3b8]" : "bg-[#020617] border-slate-500/30 text-slate-300")}>
                  {ownerPlayer ? (
                    <span>
                      {isNoir ? "ВЛАДЕЛЕЦ: " : isSoviet ? "КОМАНДИР: " : "ВЛАДЕЛЕЦ: "}
                      <strong style={{ color: ownerPlayer.color?.hex || (isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#10b981") }}>
                        {ownerPlayer.name}
                      </strong>
                      {displayTile.isMortgaged && (
                        <span className="text-[#ef4444] ml-1 font-bold">
                          {isNoir ? "[В ЗАЛОГЕ]" : isSoviet ? "[В РЕЗЕРВЕ]" : "[ЗАЛОЖЕНО]"}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-bold">
                      {isNoir ? "СВОБОДНО" : isSoviet ? "СВОБОДНЫЙ ОРБИТАЛЬНЫЙ СЕКТОР" : "СВОБОДНАЯ УЛИЦА"}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          CARD 2 (BOTTOM SECTION): CHAT / РАДИОЭФИР
          ------------------------------------------------------------- */}
      <div className={cn(
        "h-56 sm:h-64 xl:h-72 flex flex-col rounded-none shadow-xl overflow-hidden shrink-0 border",
        isNoir ? "bg-[#1a1410] border-[#d4a647] font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8] font-space" : "bg-[#0f172a] border-slate-500/40 font-sans"
      )}>
        {/* Chat Header */}
        <div className={cn(
          "flex items-center justify-between px-3 py-1.5 border-b shrink-0",
          isNoir ? "border-[#d4a647]/40 bg-[#14100c]" : isSoviet ? "border-[#38bdf8]/40 bg-[#0c1624]" : "border-slate-500/30 bg-[#020617]"
        )}>
          <div className="flex items-center gap-1.5">
            <MessageSquare className={cn("w-3.5 h-3.5", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
            <span className={cn("text-xs sm:text-sm font-bold tracking-wide", isNoir ? "font-noir-title text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white")}>
              {isNoir ? "ТЕЛЕТАЙП (СЛУЖЕБНАЯ СВЯЗЬ)" : isSoviet ? "СВЯЗЬ ЦУП (142.1 МГц)" : "ОБЩИЙ ЧАТ СТОЛА"}
            </span>
          </div>
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-none border font-bold", isNoir ? "bg-[#14100c] border-[#d4a647]/50 text-[#d4a647]" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/50 text-[#38bdf8]" : "bg-[#0f172a] border-slate-500/50 text-slate-300")}>
            {chatMessages.length}
          </span>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-2 no-scrollbar flex flex-col gap-1.5 text-xs">
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#94a3b8] text-xs italic">
              {isNoir ? "[ ТЕЛЕТАЙП МОЛЧИТ ]" : isSoviet ? "[ В ЭФИРЕ ТИШИНА. КАНАЛ СВЯЗИ ОТКРЫТ ]" : "[ В ЧАТЕ ПОКА НЕТ СООБЩЕНИЙ ]"}
            </div>
          ) : (
            chatMessages.map((msg, index) => {
              const isMine = msg.senderId === playerId;
              const senderPlayer = gameState.players?.find((p) => p.id === msg.senderId);
              const senderColor = senderPlayer?.color?.hex || (isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#10b981");

              if (msg.type === "system") {
                return (
                  <div key={index} className="flex justify-center my-1.5">
                    <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-none text-center", isNoir ? "bg-[#1a1410] border border-[#d4a647]/30 text-[#b8a890]" : isSoviet ? "bg-[#111820] border border-[#38bdf8]/20 text-[#38bdf8]" : "bg-[#020617] border border-slate-500/20 text-slate-400")}>
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || index}
                  className={cn(
                    "p-1.5 rounded-none leading-tight break-words border",
                    isMine
                      ? (isNoir ? "bg-[#2a2018] border-[#d4a647] self-end max-w-[90%]" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] self-end max-w-[90%]" : "bg-slate-900/80 border-slate-500 self-end max-w-[90%]")
                      : (isNoir ? "bg-[#1a1410] border-[#3d2e1a] self-start max-w-[90%]" : isSoviet ? "bg-[#0f172a] border-[#1e293b] self-start max-w-[90%]" : "bg-slate-900/80 border-slate-700 self-start max-w-[90%]"),
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="font-bold text-xs"
                      style={{ color: senderColor }}
                    >
                      {msg.playerName || senderPlayer?.name || "Игрок"}
                    </span>
                    <span className={cn("text-[8px] ml-auto", isNoir ? "text-[#b8a890]" : isSoviet ? "text-[#94a3b8]" : "text-[#94a3b8]")}>
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className={cn("text-xs leading-relaxed", isNoir ? "text-[#f5e6c8]" : isSoviet ? "text-[#e2e8f0]" : "text-[#e2e8f0]")}>
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
            className={cn("p-1.5 border-t flex items-center gap-1.5 shrink-0", isNoir ? "border-[#d4a647]/40 bg-[#14100c]" : isSoviet ? "border-[#38bdf8]/40 bg-[#050b14]" : "border-slate-500/30 bg-[#020617]")}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isNoir ? "Печатайте донесение..." : isSoviet ? "Радиограмма в Центр Управления..." : "Сообщение в чат..."}
              className={cn(
                "flex-1 h-7 px-2 text-xs rounded-none border text-[#e2e8f0] placeholder:text-[#64748b] focus:outline-none",
                isNoir ? "bg-[#1a1410] border-[#d4a647]/40 focus:border-[#d4a647] text-[#f5e6c8]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/40 focus:border-[#38bdf8]" : "bg-[#0f172a] border-slate-500/40 focus:border-slate-400"
              )}
              maxLength={100}
            />
            <button
              type="submit"
              className={cn("h-7 px-2.5 rounded-none flex items-center justify-center shrink-0", isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")}
              disabled={!chatInput.trim()}
            >
              <Send className="w-3 h-3 text-white" />
            </button>
          </form>
        ) : (
          <div className={cn("p-1.5 border-t flex items-center justify-between gap-1.5 shrink-0", isNoir ? "border-[#d4a647]/40 bg-[#14100c]" : isSoviet ? "border-[#38bdf8]/40 bg-[#050b14]" : "border-slate-500/30 bg-[#020617]")}>
            <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8] min-w-0">
              <Lock className={cn("w-3 h-3 shrink-0", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400")} />
              <span className={cn("truncate", isNoir ? "font-noir-body text-[#b8a890]" : "")}>{isNoir ? "Нужен допуск (войдите)" : "Только для авторизованных игроков"}</span>
            </div>
            <button
              className={cn("h-6 text-[10px] px-2 rounded-none font-bold", isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary")}
              onClick={() => openModal("telegramLogin")}
            >
              ВОЙТИ
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

