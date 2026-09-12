import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dices,
  PlusCircle,
  LogIn,
  RotateCw,
  Globe,
  Trophy,
  Sparkles,
  HelpCircle,
  Sliders,
  Flame,
  Lock,
  Building2,
  Gavel,
  Key,
  Award,
  Zap,
  Gamepad2,
  Check,
  Crown,
  Swords,
  Clock,
  Coins,
  Users,
} from "lucide-react";
import { PetAvatar } from "@/components/common/PetAvatar";
import { getPetCharacter } from "@/lib/petCharacters";
import { soundEngine } from "@/lib/soundEngine";
import { cn } from "@/lib/utils";
import { GameModesTab } from "./GameModesTab";
import { RulesTab } from "./RulesTab";

type MenuTab = "play" | "modes" | "lobby" | "leaderboard" | "rules";

export const WelcomeScreen: React.FC = () => {
  const {
    playerName,
    setPlayerName,
    createRoom,
    joinRoom,
    quickMatch,
    publicRooms,
    socket,
    showToast,
    selectedCharacterId,
    currentUser,
    openModal,
    theme,
  } = useGame();

  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const [activeTab, setActiveTab] = useState<MenuTab>("play");
  const [inputName, setInputName] = useState<string>(playerName);
  const [roomCode, setRoomCode] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [selectedBoardSize, setSelectedBoardSize] = useState<40 | 24>(40);
  const [loadingCreate, setLoadingCreate] = useState<boolean>(false);
  const [loadingJoin, setLoadingJoin] = useState<boolean>(false);
  const [loadingQuick, setLoadingQuick] = useState<boolean>(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);

  const currentPet = getPetCharacter(selectedCharacterId);

  // Sync input name when loaded
  useEffect(() => {
    setInputName(playerName);
  }, [playerName]);

  // Fetch leaderboard when tab opens
  const fetchLeaderboard = () => {
    if (!socket) return;
    setLoadingLeaderboard(true);
    socket.emit("get_leaderboard", { limit: 20 }, (res: any) => {
      setLoadingLeaderboard(false);
      if (res && res.success && Array.isArray(res.leaderboard)) {
        setLeaderboard(res.leaderboard);
      }
    });
  };

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    } else if (activeTab === "lobby") {
      if (socket) {
        socket.emit("get_rooms_list");
      }
      fetch("/api/rooms").catch(() => {});
    }
  }, [activeTab, socket]);

  const handleNameChange = (newName: string) => {
    setInputName(newName);
    setPlayerName(newName);
  };

  const handleCreate = async (options?: {
    mode?: "standard" | "blitz" | "ranked";
    gameMode?: "classic" | "reverse" | "team";
    maxRounds?: number;
    boardSize?: 40 | 24;
    maxPlayers?: number;
  }) => {
    soundEngine.playClick();
    const gameMode = options?.gameMode || "classic";
    if (gameMode === "reverse" && !currentUser) {
      showToast("Режим «Наоборот» доступен только авторизованным игрокам!", "warning");
      openModal("telegramLogin");
      return;
    }

    setLoadingCreate(true);
    const bSize = options?.boardSize || selectedBoardSize;
    const mode = options?.mode || (bSize === 24 ? "blitz" : "standard");
    const maxRounds = options?.maxRounds !== undefined ? options.maxRounds : (gameMode === 'reverse' ? (bSize === 24 ? 10 : 20) : 0);
    const maxPlayers = options?.maxPlayers !== undefined
      ? options.maxPlayers
      : (mode === "ranked" ? 2 : (gameMode === "team" ? 4 : 6));

    await createRoom(inputName, isPrivate, {
      mode,
      gameMode,
      maxRounds,
      boardSize: bSize,
      startingCash: 1500,
      maxPlayers,
      theme: 'random',
    });
    setLoadingCreate(false);
  };

  const handleJoin = async () => {
    soundEngine.playClick();
    if (!roomCode.trim()) {
      showToast("Введите 4-значный код комнаты", "warning");
      return;
    }
    setLoadingJoin(true);
    await joinRoom(roomCode, inputName);
    setLoadingJoin(false);
  };

  // Quick Play: Matches into existing non-private waiting room or creates a new public room
  const handleQuickPlay = async () => {
    soundEngine.playClick();
    setLoadingQuick(true);
    await quickMatch();
    setLoadingQuick(false);
  };

  const handleRefreshRooms = () => {
    soundEngine.playClick();
    if (socket) {
      socket.emit("get_rooms_list");
      showToast("Список столов обновлен 🔄", "info", 1200);
    }
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRoomCode(text.trim().substring(0, 6).toUpperCase());
        showToast("Код вставлен!", "info", 1200);
      }
    } catch {}
  };

  const getRankTitle = (rating: number) => {
    if (rating >= 300)
      return {
        title: "👑 Гроссмейстер",
        color: "text-amber-400 border-amber-400/40 bg-amber-500/10",
      };
    if (rating >= 150)
      return {
        title: "🥇 Магистр",
        color: "text-purple-400 border-purple-400/40 bg-purple-500/10",
      };
    if (rating >= 50)
      return {
        title: "🥈 Опытный",
        color: "text-blue-400 border-blue-400/40 bg-blue-500/10",
      };
    return {
      title: "🥉 Новичок",
      color: "text-slate-500 border-slate-500/40 bg-slate-600/10",
    };
  };

  return (
    <div className="w-full max-w-5xl px-3 sm:px-6 py-4 md:py-6 flex flex-col items-center justify-start animate-fade-in select-none min-h-full pb-10">
      {/* 1. Hero Player Profile Bar */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-card/90 via-black/40 to-card/90 border border-white/10 p-3 sm:p-4 shadow-xl backdrop-blur-xl mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        {/* Left: Chosen Character & Player Name */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div
            className="relative cursor-pointer group flex items-center justify-center shrink-0"
            onClick={() => openModal("characterPicker")}
            title="Нажмите, чтобы сменить питомца"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-black/40 border border-white/15 group-hover:border-primary/60 transition-all shadow-inner">
              <PetAvatar
                characterId={selectedCharacterId}
                anim="idle"
                size="md"
                showPedestal={true}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full border border-black/40 shadow-md flex items-center gap-1 z-10 pointer-events-none">
              <span className="text-[10px] leading-none">{currentPet.emoji}</span>
              <span className="leading-none">{currentPet.name}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <Input
                value={inputName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ваше имя"
                className="h-8 font-black text-sm md:text-base max-w-[160px] sm:max-w-[200px] bg-black/30 border-white/15 focus:border-primary"
                maxLength={18}
              />
              {currentUser ? (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2 py-0.5 ${getRankTitle(currentUser.rating ?? 0).color}`}
                >
                  {getRankTitle(currentUser.rating ?? 0).title}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold px-2 py-0.5 border-white/20 text-muted-foreground bg-white/5"
                >
                  Гостевой режим
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {currentUser ? (
                <>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    ⭐ {currentUser.rating ?? 0} ELO
                  </span>
                  <span>•</span>
                  <span className="text-[11px]">
                    Побед: {currentUser.wins ?? currentUser.gamesWon ?? 0} из{" "}
                    {currentUser.gamesPlayed || 0}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  💡 Войдите для сохранения ELO и побед
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Auth / Profile Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0">

          {!currentUser ? (
            <Button
              variant="default"
              size="sm"
              className={cn(
                "font-bold text-xs h-9 px-4 shadow-lg text-white rounded-none sm:rounded-xl flex items-center gap-1.5",
                isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans"
              )}
              onClick={() => openModal("telegramLogin")}
            >
              <LogIn className="w-4 h-4" />
              <span>Войти</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "font-bold text-xs h-9 px-3.5 rounded-none sm:rounded-xl flex items-center gap-1.5 border",
                isNoir ? "bg-[#1a1410] border-[#d4a647]/50 text-[#d4a647]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/50 text-[#38bdf8]" : "bg-[#0f172a] border-slate-600/40 text-slate-400"
              )}
              onClick={() => openModal("profile")}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Мой профиль</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs (Clean Navigation Bar with Game Modes for Authorized Users) */}
      <div className={cn(
        "w-full flex items-center justify-start sm:justify-center gap-1.5 p-1.5 rounded-none sm:rounded-2xl border backdrop-blur-md mb-4 overflow-x-auto select-none no-scrollbar shrink-0 min-h-[52px] sm:min-h-[56px]",
        isNoir ? "bg-[#14100c] border-[#3d2e1a] font-noir-body" : isSoviet ? "bg-[#09111c] border-[#1e293b] font-soviet" : "bg-[#020617] border-slate-600/30 font-sans"
      )}>
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("play");
          }}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-2.5 h-10 sm:h-11 rounded-none sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border",
            activeTab === "play"
              ? (isNoir ? "bg-[#d4a647] border-[#1a1410] text-[#1a1410] shadow-md" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe] shadow-md" : "bg-slate-600 border-slate-500 text-white shadow-md")
              : (isNoir ? "text-[#b8a890] border-transparent hover:bg-[#1a1410]" : isSoviet ? "text-[#94a3b8] border-transparent hover:bg-[#0f172a]" : "text-slate-400 border-transparent hover:bg-white/5")
          )}
        >
          <Dices className="w-4 h-4 shrink-0" />
          <span>Играть</span>
        </button>

        {currentUser && (
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab("modes");
            }}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 h-10 sm:h-11 rounded-none sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border",
              activeTab === "modes"
                ? (isNoir ? "bg-[#d4a647] border-[#1a1410] text-[#1a1410] shadow-md" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe] shadow-md" : "bg-slate-600 border-slate-500 text-white shadow-md")
                : (isNoir ? "text-[#b8a890] border-transparent hover:bg-[#1a1410]" : isSoviet ? "text-[#94a3b8] border-transparent hover:bg-[#0f172a]" : "text-slate-400 border-transparent hover:bg-white/5")
            )}
          >
            <Gamepad2 className={cn("w-4 h-4 shrink-0", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-500")} />
            <span>Режимы игры</span>
          </button>
        )}

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("lobby");
            handleRefreshRooms();
          }}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-2.5 h-10 sm:h-11 rounded-none sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border",
            activeTab === "lobby"
              ? (isNoir ? "bg-[#d4a647] border-[#1a1410] text-[#1a1410] shadow-md" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe] shadow-md" : "bg-slate-600 border-slate-500 text-white shadow-md")
              : (isNoir ? "text-[#b8a890] border-transparent hover:bg-[#1a1410]" : isSoviet ? "text-[#94a3b8] border-transparent hover:bg-[#0f172a]" : "text-slate-400 border-transparent hover:bg-white/5")
          )}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Открытые столы</span>
          {publicRooms.length > 0 && (
            <span className={cn(
              "px-1.5 py-0.2 text-[10px] font-bold rounded-none border",
              isNoir ? "bg-[#d4a647] text-[#1a1410] border-[#1a1410]" : isSoviet ? "bg-[#38bdf8] text-[#09111c] border-[#38bdf8]" : "bg-slate-600 text-black border-slate-500"
            )}>
              {publicRooms.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("leaderboard");
          }}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-2.5 h-10 sm:h-11 rounded-none sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border",
            activeTab === "leaderboard"
              ? (isNoir ? "bg-[#d4a647] border-[#1a1410] text-[#1a1410] shadow-md" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe] shadow-md" : "bg-slate-600 border-slate-500 text-white shadow-md")
              : (isNoir ? "text-[#b8a890] border-transparent hover:bg-[#1a1410]" : isSoviet ? "text-[#94a3b8] border-transparent hover:bg-[#0f172a]" : "text-slate-400 border-transparent hover:bg-white/5")
          )}
        >
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Таблица лидеров</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("rules");
          }}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-2.5 h-10 sm:h-11 rounded-none sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border",
            activeTab === "rules"
              ? (isNoir ? "bg-[#d4a647] border-[#1a1410] text-[#1a1410] shadow-md" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] text-[#e0f2fe] shadow-md" : "bg-slate-600 border-slate-500 text-white shadow-md")
              : (isNoir ? "text-[#b8a890] border-transparent hover:bg-[#1a1410]" : isSoviet ? "text-[#94a3b8] border-transparent hover:bg-[#0f172a]" : "text-slate-400 border-transparent hover:bg-white/5")
          )}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Правила</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="w-full flex-1">
        {/* TAB 1: PLAY HUB */}
        {activeTab === "play" && (
          <div className="flex flex-col gap-4 w-full">
            {/* Quick Play Banner */}
            <div className={cn(
              "relative overflow-hidden p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border",
              isNoir
                ? "bg-[#1a1410] border-2 border-[#d4a647] rounded-none font-noir-body"
                : isSoviet
                ? "bg-[#09111c] border-2 border-[#38bdf8] rounded-none font-soviet"
                : "bg-[#020617] border-2 border-slate-600/40 rounded-2xl font-sans"
            )}>
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Flame className={cn("w-5 h-5 animate-pulse", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")} />
                  <span className={cn("font-bold text-lg sm:text-xl", isNoir ? "text-[#f5e6c8]" : isSoviet ? "text-[#e2e8f0]" : "text-white")}>
                    {isNoir ? "СРОЧНОЕ ДЕЛО: БЫСТРАЯ ИГРА" : isSoviet ? "ОПЕРАТИВНЫЙ СТАРТ: АВТОПОДБОР" : "Быстрая онлайн-игра"}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 border",
                    isNoir ? "bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8] text-[#38bdf8]" : "bg-slate-950 border-slate-600 text-slate-400"
                  )}>
                    АВТОПОДБОР
                  </span>
                </div>
                <p className={cn("text-xs sm:text-sm max-w-md", isNoir ? "text-[#b8a890]" : isSoviet ? "text-[#94a3b8]" : "text-slate-300")}>
                  Мгновенно подключает вас к существующей открытой партии, где
                  идёт поиск игроков, либо создаёт новый стол в 1 клик.
                </p>
              </div>

              <Button
                size="lg"
                className={cn(
                  "w-full sm:w-auto font-bold text-sm sm:text-base px-8 h-12 shadow-xl flex items-center justify-center gap-2 border",
                  isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-gold font-sans"
                )}
                onClick={handleQuickPlay}
                disabled={loadingQuick}
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>
                  {loadingQuick ? "Поиск партии..." : "Быстрый старт ⚡"}
                </span>
              </Button>
            </div>

            {/* Split: Create Custom Table & Join by Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Card A: Create Custom Room */}
              <div className={cn(
                "flex flex-col justify-between p-5 border rounded-none sm:rounded-2xl shadow-xl",
                isNoir ? "bg-[#14100c] border-[#3d2e1a] font-noir-body text-[#f5e6c8]" : isSoviet ? "bg-[#09111c] border-[#1e293b] font-soviet text-[#e2e8f0]" : "bg-[#0f172a] border-slate-600/30 font-sans text-slate-100"
              )}>
                <div className="flex flex-col gap-1 pb-3 text-left">
                  <div className="text-base font-bold flex items-center gap-2">
                    <PlusCircle className={cn("w-5 h-5", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-500")} />
                    <span>{isNoir ? "ОТКРЫТЬ СВОЁ ДЕЛО (СТОЛ)" : isSoviet ? "РАЗВЕРНУТЬ СВОЙ ЦУП" : "Создать свой стол"}</span>
                  </div>
                  <span className={cn("text-xs", isNoir ? "text-[#b8a890]" : isSoviet ? "text-[#94a3b8]" : "text-slate-400")}>
                    Настройте параметры партии и пригласите друзей по коду.
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {/* Board Size Toggle */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className={cn("text-[11px] font-bold", isNoir ? "text-[#b8a890]" : isSoviet ? "text-[#94a3b8]" : "text-slate-400")}>
                      Режим и размер поля:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBoardSize(40)}
                        className={cn(
                          "p-2 rounded-none sm:rounded-xl border flex flex-col items-start gap-0.5 transition-all text-left",
                          selectedBoardSize === 40
                            ? (isNoir ? "bg-[#d4a647]/20 border-[#d4a647] text-[#f5e6c8]" : isSoviet ? "bg-[#0369a1]/30 border-[#38bdf8] text-[#e0f2fe]" : "bg-slate-600/20 border-slate-600 text-white")
                            : (isNoir ? "bg-[#1a1410] border-[#3d2e1a] text-[#b8a890]" : isSoviet ? "bg-[#050b14] border-[#1e293b] text-[#94a3b8]" : "bg-black/30 border-white/10 text-slate-400")
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>40 клеток</span>
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded-none font-bold border",
                            isNoir ? "bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#09111c] border-[#38bdf8] text-[#38bdf8]" : "bg-slate-950 border-slate-600 text-slate-400"
                          )}>
                            28 АКТИВОВ
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80">
                          40 клеток • 8 отраслей
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBoardSize(24)}
                        className={cn(
                          "p-2 rounded-none sm:rounded-xl border flex flex-col items-start gap-0.5 transition-all text-left",
                          selectedBoardSize === 24
                            ? (isNoir ? "bg-[#d4a647]/20 border-[#d4a647] text-[#f5e6c8]" : isSoviet ? "bg-[#0369a1]/30 border-[#38bdf8] text-[#e0f2fe]" : "bg-slate-600/20 border-slate-600 text-white")
                            : (isNoir ? "bg-[#1a1410] border-[#3d2e1a] text-[#b8a890]" : isSoviet ? "bg-[#050b14] border-[#1e293b] text-[#94a3b8]" : "bg-black/30 border-white/10 text-slate-400")
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>24 клетки</span>
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded-none font-bold border",
                            isNoir ? "bg-[#1a1410] border-[#8b0000] text-[#fca5a5]" : isSoviet ? "bg-[#09111c] border-[#dc2626] text-[#fca5a5]" : "bg-amber-950 border-amber-500 text-amber-300"
                          )}>
                            БЛИЦ
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80">
                          Быстрая игра
                        </span>
                      </button>
                    </div>
                  </div>


                  {/* Privacy Toggle */}
                  <div className={cn(
                    "flex items-center justify-between p-2.5 rounded-none sm:rounded-xl border",
                    isNoir ? "bg-[#1a1410] border-[#3d2e1a]" : isSoviet ? "bg-[#050b14] border-[#1e293b]" : "bg-black/30 border-white/5"
                  )}>
                    <div className="flex items-center gap-2.5">
                      {isPrivate ? (
                        <Lock className={cn("w-4 h-4", isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400")} />
                      ) : (
                        <Globe className="w-4 h-4 text-slate-500" />
                      )}
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-foreground">
                          {isPrivate ? "Приватный стол" : "Открытый стол"}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {isPrivate
                            ? "Вход только по коду приглашения"
                            : "Отображается в общем списке лобби"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={cn(
                        "w-11 h-6 flex items-center rounded-full p-1 transition-all",
                        isPrivate
                          ? (isNoir ? "bg-[#d4a647] justify-end" : isSoviet ? "bg-[#38bdf8] justify-end" : "bg-slate-600 justify-end")
                          : "bg-white/20 justify-start"
                      )}
                    >
                      <div className="w-4 h-4 rounded-full bg-black shadow-md" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className={cn(
                      "w-full font-bold shadow-lg h-11 flex items-center justify-center gap-2 border",
                      isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans"
                    )}
                    onClick={() => handleCreate()}
                    disabled={loadingCreate}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>
                      {loadingCreate
                        ? "Создание стола..."
                        : `Создать стол (${selectedBoardSize} клеток) 🎲`}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Card B: Join by Code */}
              <div className={cn(
                "flex flex-col justify-between p-5 border rounded-none sm:rounded-2xl shadow-xl",
                isNoir ? "bg-[#14100c] border-[#3d2e1a] font-noir-body text-[#f5e6c8]" : isSoviet ? "bg-[#09111c] border-[#1e293b] font-soviet text-[#e2e8f0]" : "bg-[#0f172a] border-slate-600/30 font-sans text-slate-100"
              )}>
                <div className="flex flex-col gap-1 pb-3 text-left">
                  <div className="text-base font-bold flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-slate-500" />
                    <span>Войти по коду</span>
                  </div>
                  <span className={cn("text-xs", isNoir ? "text-[#b8a890]" : isSoviet ? "text-[#94a3b8]" : "text-slate-400")}>
                    Если вам прислали 4-значный код комнаты (например, ABCD).
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className={cn("text-xs font-bold", isNoir ? "text-[#b8a890]" : isSoviet ? "text-[#94a3b8]" : "text-slate-400")}>
                      Код комнаты:
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={roomCode}
                        onChange={(e) =>
                          setRoomCode(e.target.value.toUpperCase())
                        }
                        placeholder="ABCD"
                        maxLength={6}
                        className={cn(
                          "font-mono font-black tracking-widest text-center text-base uppercase h-11 border",
                          isNoir ? "bg-[#1a1410] border-[#d4a647]/50 text-[#f5e6c8]" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/50 text-[#e2e8f0]" : "bg-black/40 border-slate-600/40 text-slate-400"
                        )}
                      />
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 px-3 text-xs font-bold border",
                          isNoir ? "border-[#d4a647]/40 text-[#d4a647] hover:bg-[#1a1410]" : isSoviet ? "border-[#38bdf8]/40 text-[#38bdf8] hover:bg-[#0f172a]" : "border-slate-600/40 text-slate-400 hover:bg-slate-950"
                        )}
                        onClick={handlePasteCode}
                        title="Вставить из буфера"
                      >
                        Вставить
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className={cn(
                      "w-full font-bold shadow-md h-11 flex items-center justify-center gap-2 border",
                      isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans"
                    )}
                    onClick={handleJoin}
                    disabled={loadingJoin}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {loadingJoin ? "Подключение..." : "Присоединиться"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GAME MODES (AUTHORIZED ONLY) */}
        {activeTab === "modes" && (
          <GameModesTab
            handleCreate={handleCreate}
            handleQuickPlay={handleQuickPlay}
            loadingCreate={loadingCreate}
            loadingQuick={loadingQuick}
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
          />
        )}

        {/* TAB 3: LOBBY BROWSER */}
        {activeTab === "lobby" && (
          <Card className="w-full border-white/10 bg-card/90 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-slate-500" />
                  Открытые столы в сети
                </CardTitle>
                <CardDescription className="text-xs">
                  Выберите свободный стол и нажмите «Войти», чтобы начать игру.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-bold flex items-center gap-1.5 border-white/15 hover:bg-white/10"
                onClick={handleRefreshRooms}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Обновить</span>
              </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-[300px] p-4">
              {publicRooms.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground gap-3">
                  <Dices className="w-12 h-12 opacity-20" />
                  <span className="text-sm font-bold text-foreground">
                    Сейчас нет открытых столов
                  </span>
                  <span className="text-xs max-w-sm">
                    Будьте первым! Создайте новый открытый стол во вкладке
                    «Играть», и к вам подключатся другие игроки.
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-2 font-bold"
                    onClick={() => setActiveTab("play")}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" /> Создать стол
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {publicRooms.map((room) => {
                    const isBlitz =
                      room.mode === "blitz" || room.boardSize === 24;
                    const isReverse = room.gameMode === "reverse";
                    const isTeam = room.gameMode === "team";
                    return (
                      <div
                        key={room.roomId}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all shadow-sm"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/30">
                              [{room.roomId}]
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {room.hostName}
                            </span>
                            {isTeam && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                <span>👥</span>
                                <span>Команды 2v2</span>
                              </Badge>
                            )}
                            {isReverse && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                <span>🔄</span>
                                <span>Наоборот</span>
                              </Badge>
                            )}
                            {isBlitz ? (
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                <span>⚡</span>
                                <span>Блиц (24)</span>
                              </Badge>
                            ) : (
                              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                <span>🎲</span>
                                <span>Классика (40)</span>
                              </Badge>
                            )}
                          </div>

                          {/* Players dots preview */}
                          <div className="flex items-center gap-1.5">
                            {room.players.map((p) => (
                              <span
                                key={p.id}
                                className="w-3 h-3 rounded-full ring-1 ring-white/30"
                                style={{ backgroundColor: p.color.hex }}
                                title={p.name}
                              />
                            ))}
                            <span className="text-[11px] text-muted-foreground font-semibold ml-1">
                              {room.playersCount} / {room.maxPlayers} игроков
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="default"
                          size="sm"
                          className="font-bold text-xs px-4 h-9 shadow-md shrink-0"
                          onClick={() => joinRoom(room.roomId, inputName)}
                        >
                          Войти 🚪
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <Card className="w-full border-white/10 bg-card/90 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Рейтинг лучших игроков (ТОП-10)
                </CardTitle>
                <CardDescription className="text-xs">
                  Официальный рейтинг ELO среди авторизованных игроков (Telegram и Яндекс ID).
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-bold flex items-center gap-1.5 border-white/15"
                onClick={fetchLeaderboard}
                disabled={loadingLeaderboard}
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${loadingLeaderboard ? "animate-spin" : ""}`}
                />
                <span>Обновить</span>
              </Button>
            </CardHeader>

            <CardContent className="p-4">
              {!currentUser && (
                <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Вы играете как гость. Войдите через Telegram или Яндекс ID, чтобы сохранять ELO и попасть в таблицу лидеров!</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3 font-bold bg-amber-500 text-black hover:bg-amber-400 shrink-0"
                    onClick={() => openModal('telegramLogin')}
                  >
                    Войти
                  </Button>
                </div>
              )}

              {loadingLeaderboard ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
                  Загрузка таблицы лидеров...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground gap-2">
                  <Award className="w-10 h-10 opacity-20" />
                  <span className="text-xs">
                    Авторизуйтесь и сыграйте первый матч, чтобы занять верхнюю строчку рейтинга!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {leaderboard.map((user, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <div
                        key={user.id || idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isTop1
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                            : isTop2
                              ? "bg-slate-400/10 border-slate-400/30"
                              : isTop3
                                ? "bg-amber-800/15 border-amber-800/30"
                                : "bg-black/20 border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 text-center font-black text-sm">
                            {isTop1
                              ? "🥇"
                              : isTop2
                                ? "🥈"
                                : isTop3
                                  ? "🥉"
                                  : `#${idx + 1}`}
                          </div>

                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-foreground">
                                {user.firstName || user.username || "Игрок"}
                              </span>
                              {user.username && (
                                <span className="text-[10px] text-muted-foreground">
                                  @{user.username}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Побед: {user.wins ?? user.gamesWon ?? 0} из{" "}
                              {user.gamesPlayed || 0} ({user.winRate ?? (user.gamesPlayed ? Math.round(((user.wins || 0) / user.gamesPlayed) * 100) : 0)}%)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="gold"
                            className="text-xs font-black px-2.5 py-0.5"
                          >
                            ⭐ {user.rating ?? 0} ELO
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 4: RULES & GUIDE BY MODE */}
        {activeTab === "rules" && <RulesTab />}
      </div>

      {/* 4. Bottom Live Stats & Legal Footer */}
      <footer className="w-full mt-8 sm:mt-12 pt-6 pb-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-muted-foreground gap-4 shrink-0">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border border-white/15 bg-white/5 text-foreground">
            16+
          </span>
          <span>Открытых столов: {publicRooms.length}</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="text-[10px] text-muted-foreground/80 text-center sm:text-left">
            Развлекательная онлайн-игра. Игровая валюта не имеет реальной ценности (244-ФЗ РФ).
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={() => openModal("legal", { tab: "terms" })}
            className="hover:text-foreground transition-colors underline underline-offset-4 cursor-pointer"
          >
            Пользовательское соглашение
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={() => openModal("legal", { tab: "privacy" })}
            className="hover:text-foreground transition-colors underline underline-offset-4 cursor-pointer"
          >
            Конфиденциальность (152-ФЗ)
          </button>
        </div>
      </footer>
    </div>
  );
};
