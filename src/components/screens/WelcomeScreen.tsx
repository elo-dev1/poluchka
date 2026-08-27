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
  } = useGame();

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
    boardSize?: 40 | 24;
  }) => {
    soundEngine.playClick();
    setLoadingCreate(true);
    const bSize = options?.boardSize || selectedBoardSize;
    const mode = options?.mode || (bSize === 24 ? "blitz" : "standard");
    await createRoom(inputName, isPrivate, {
      mode,
      boardSize: bSize,
      startingCash: 1500,
      maxPlayers: mode === "ranked" ? 2 : 6,
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
      color: "text-emerald-400 border-emerald-400/40 bg-emerald-500/10",
    };
  };

  return (
    <div className="w-full max-w-5xl px-3 sm:px-6 py-4 md:py-6 flex flex-col items-center justify-center animate-fade-in select-none min-h-[calc(100dvh-60px)]">
      {/* 1. Hero Player Profile Bar */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-card/90 via-black/40 to-card/90 border border-white/10 p-3 sm:p-4 shadow-xl backdrop-blur-xl mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Chosen Character & Player Name */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div
            className="relative cursor-pointer group flex items-center justify-center"
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
            <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-primary text-white px-1.5 py-0.2 rounded-full border border-black/40 shadow">
              🐾 {currentPet.name}
            </span>
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
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {!currentUser ? (
            <Button
              variant="default"
              size="sm"
              className="font-bold text-xs h-9 px-4 bg-gradient-to-r from-primary to-blue-600 hover:brightness-110 shadow-lg text-white rounded-xl flex items-center gap-1.5"
              onClick={() => openModal("telegramLogin")}
            >
              <LogIn className="w-4 h-4" />
              <span>Войти</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="font-bold text-xs h-9 px-3.5 border-white/15 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-1.5"
              onClick={() => openModal("profile")}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Мой профиль</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs (Clean Navigation Bar with Game Modes for Authorized Users) */}
      <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md mb-4 overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("play");
          }}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "play"
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>Играть</span>
        </button>

        {currentUser && (
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab("modes");
            }}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "modes"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>Режимы игры</span>
            <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              PRO
            </span>
          </button>
        )}

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("lobby");
            handleRefreshRooms();
          }}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "lobby"
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Открытые столы</span>
          {publicRooms.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-emerald-500 text-black">
              {publicRooms.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("leaderboard");
          }}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "leaderboard"
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Таблица лидеров</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab("rules");
          }}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "rules"
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Правила</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="w-full flex-1">
        {/* TAB 1: PLAY HUB */}
        {activeTab === "play" && (
          <div className="flex flex-col gap-4 w-full">
            {/* Quick Play Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-primary/20 to-indigo-500/20 border border-amber-500/30 p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-black text-lg sm:text-xl text-foreground">
                    Быстрая онлайн-игра
                  </span>
                  <Badge
                    variant="gold"
                    className="text-[10px] font-black px-2 py-0"
                  >
                    АВТОПОДБОР
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                  Мгновенно подключает вас к существующей открытой партии, где
                  идёт поиск игроков, либо создаёт новый стол в 1 клик.
                </p>
              </div>

              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto font-black text-sm sm:text-base px-8 h-12 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2"
                onClick={handleQuickPlay}
                disabled={loadingQuick}
              >
                <Zap className="w-5 h-5 text-black fill-current" />
                <span>
                  {loadingQuick ? "Поиск партии..." : "Быстрый старт ⚡"}
                </span>
              </Button>
            </div>

            {/* Split: Create Custom Table & Join by Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Card A: Create Custom Room */}
              <Card className="flex flex-col justify-between border-white/10 bg-card/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    Создать свой стол
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Настройте параметры партии и пригласите друзей по коду.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3.5">
                  {/* Board Size Toggle */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Режим и размер поля:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBoardSize(40)}
                        className={`p-2 rounded-xl border flex flex-col items-start gap-0.5 transition-all text-left ${
                          selectedBoardSize === 40
                            ? "bg-primary/20 border-primary text-foreground shadow-sm"
                            : "bg-black/30 border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>40 клеток</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-black">
                            28 ОБЪЕКТОВ
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Стандартная классика
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBoardSize(24)}
                        className={`p-2 rounded-xl border flex flex-col items-start gap-0.5 transition-all text-left ${
                          selectedBoardSize === 24
                            ? "bg-primary/20 border-primary text-foreground shadow-sm"
                            : "bg-black/30 border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>24 клетки</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-400/20 text-blue-300 font-black">
                            БЛИЦ
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Быстрая игра
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      {isPrivate ? (
                        <Lock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-emerald-400" />
                      )}
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-foreground">
                          {isPrivate ? "Приватный стол" : "Открытый стол"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {isPrivate
                            ? "Вход только по коду приглашения"
                            : "Отображается в общем списке лобби"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${
                        isPrivate
                          ? "bg-amber-500 justify-end"
                          : "bg-white/20 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  <Button
                    variant="default"
                    size="lg"
                    className="w-full font-bold shadow-lg h-11 flex items-center justify-center gap-2"
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
                </CardContent>
              </Card>

              {/* Card B: Join by Code */}
              <Card className="flex flex-col justify-between border-white/10 bg-card/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-emerald-400" />
                    Войти по коду
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Если вам прислали 4-значный код комнаты (например, ABCD).
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
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
                        className="font-mono font-black tracking-widest text-center text-base uppercase bg-black/40 border-white/15 h-11"
                      />
                      <Button
                        variant="outline"
                        className="h-11 px-3 text-xs font-bold border-white/15 hover:bg-white/10"
                        onClick={handlePasteCode}
                        title="Вставить из буфера"
                      >
                        Вставить
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full font-bold shadow-md h-11 flex items-center justify-center gap-2"
                    onClick={handleJoin}
                    disabled={loadingJoin}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {loadingJoin ? "Подключение..." : "Присоединиться"}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: GAME MODES (AUTHORIZED ONLY) */}
        {activeTab === "modes" && (
          <div className="flex flex-col gap-4 w-full animate-fade-in">
            {/* Premier Mode 1: 🌟 Классическая Монополия (40 клеток, 28 объектов недвижимости) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-primary/20 to-emerald-500/20 border-2 border-amber-400/40 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg sm:text-xl text-foreground">
                          Классическая Получка
                        </span>
                        <Badge
                          variant="gold"
                          className="text-[10px] font-black px-2 py-0.5 uppercase tracking-wide"
                        >
                          СТАНДАРТНЫЙ РЕЖИМ
                        </Badge>
                      </div>
                      <span className="text-xs text-amber-300 font-semibold">
                        40 клеток на доске • 28 объектов недвижимости • 11x11
                        периметр
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Флагманский режим
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                  Официальное полноразмерное поле мировой Монополии:{" "}
                  <strong className="text-foreground">
                    28 объектов недвижимости
                  </strong>{" "}
                  (22 корпорации в 8 цветовых районах, 4 транспортных узла и 2
                  коммунальных сервиса), 4 угловые клетки, Шанс и Казна.
                  Полноценная экономическая стратегия со строительством домов,
                  отелей и аукционами.
                </p>

                {/* Mode Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <Building2 className="w-4 h-4" />
                      <span>28 Объектов</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      22 улицы + 4 вокзала + 2 утилиты
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                      <Globe className="w-4 h-4" />
                      <span>40 Клеток</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Классический периметр 11x11
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <Coins className="w-4 h-4" />
                      <span>$1,500 Капитал</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Идеальный баланс экономики
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      <span>30-45 Минут</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Глубокая турнирная сессия
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto font-bold text-xs h-10 border-white/15 hover:bg-white/10"
                    onClick={() =>
                      handleCreate({ mode: "standard", boardSize: 40 })
                    }
                    disabled={loadingCreate}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    <span>Создать стол (40 клеток)</span>
                  </Button>

                  <Button
                    variant="gold"
                    className="w-full sm:w-auto font-black text-xs sm:text-sm h-10 px-6 shadow-xl shadow-amber-500/20"
                    onClick={handleQuickPlay}
                    disabled={loadingQuick}
                  >
                    <Zap className="w-4 h-4 mr-1.5 fill-current" />
                    <span>Играть в стандартном режиме ⚡</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Split Modes: Blitz & Ranked Duel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Mode 2: ⚡ Блиц-Монополия (24 клетки) */}
              <Card className="flex flex-col justify-between border-white/10 bg-card/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="w-5 h-5 text-blue-400" />
                      Блиц Получка (24 клетки)
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-blue-300 border-blue-400/40 bg-blue-500/10"
                    >
                      БЫСТРЫЙ РАУНД
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Компактное поле 7x7 для динамичных сессий на 10-15 минут.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 text-left">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted-foreground block">
                        Объекты:
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        14 недвижимости
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted-foreground block">
                        Время партии:
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        10-15 минут
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    По 2 улицы в каждом цветовом районе. Быстрый сбор монополий
                    и мгновенная развязка!
                  </p>

                  <Button
                    variant="default"
                    className="w-full font-bold text-xs h-10 mt-1"
                    onClick={() =>
                      handleCreate({ mode: "blitz", boardSize: 24 })
                    }
                    disabled={loadingCreate}
                  >
                    <Zap className="w-4 h-4 mr-1.5" />
                    <span>Создать блиц-стол (24 клетки)</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Mode 3: ⚔️ Рейтинговая Дуэль 1v1 */}
              <Card className="flex flex-col justify-between border-white/10 bg-card/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Swords className="w-5 h-5 text-amber-400" />
                      Рейтинговая Дуэль (1 на 1)
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-amber-300 border-amber-400/40 bg-amber-500/10"
                    >
                      ТУРНИР
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Соревновательный матч один на один за позиции в таблице
                    лидеров.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 text-left">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted-foreground block">
                        Формат:
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        Дуэль (2 игрока)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted-foreground block">
                        Таймер хода:
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        30 сек / ход
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Удвоенный прирост ELO-рейтинга за победу. Проявите
                    мастерство один на один!
                  </p>

                  <Button
                    variant="secondary"
                    className="w-full font-bold text-xs h-10 mt-1"
                    onClick={() =>
                      handleCreate({ mode: "ranked", boardSize: 40 })
                    }
                    disabled={loadingCreate}
                  >
                    <Swords className="w-4 h-4 mr-1.5" />
                    <span>Начать рейтинговую дуэль ⚔️</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: LOBBY BROWSER */}
        {activeTab === "lobby" && (
          <Card className="w-full border-white/10 bg-card/90 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
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
                  Рейтинг формируется по системе ELO на основе побед в
                  официальных онлайн-матчах.
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
              {loadingLeaderboard ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
                  Загрузка таблицы лидеров...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground gap-2">
                  <Award className="w-10 h-10 opacity-20" />
                  <span className="text-xs">
                    Сыграйте первый матч, чтобы занять верхнюю строчку рейтинга!
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
                              Побед: {user.gamesWon || 0} из{" "}
                              {user.gamesPlayed || 0} (
                              {user.gamesPlayed
                                ? Math.round(
                                    ((user.gamesWon || 0) / user.gamesPlayed) *
                                      100,
                                  )
                                : 0}
                              %)
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

        {/* TAB 4: RULES & GUIDE */}
        {activeTab === "rules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-xs">
            {/* Rule 1 */}
            <Card className="border-white/10 bg-card/80 backdrop-blur-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Dices className="w-4 h-4" />
                <span>1. Броски кубиков и дубли</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Игроки по очереди бросают два кубика и перемещаются по периметру
                24 клеток. Выпадение дубля даёт право на дополнительный ход. Три
                дубля подряд отправляют игрока в тюрьму за превышение скорости!
              </p>
            </Card>

            {/* Rule 2 */}
            <Card className="border-white/10 bg-card/80 backdrop-blur-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                <Building2 className="w-4 h-4" />
                <span>2. Монополии и застройка</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Выкупайте улицы и собирайте полные цветовые монополии (по 2
                улицы в группе). Монополия удваивает базовую ренту и открывает
                строительство до 4 домов и 1 отеля для максимального дохода.
              </p>
            </Card>

            {/* Rule 3 */}
            <Card className="border-white/10 bg-card/80 backdrop-blur-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Gavel className="w-4 h-4" />
                <span>3. Аукционы и Сделки</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                При отказе от покупки улица уходит на аукцион или предлагается
                сопернику напрямую. В любой момент вне броска можно заключить
                прямую сделку по обмену улицами и деньгами через кнопку
                «Сделка».
              </p>
            </Card>

            {/* Rule 4 */}
            <Card className="border-white/10 bg-card/80 backdrop-blur-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                <Key className="w-4 h-4" />
                <span>4. Тюрьма и Спасение от долгов</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Выйти из тюрьмы можно штрафом $50, картой свободы или дублем.
                Если у вас возникла задолженность, игра не заканчивается сразу:
                заложите улицы или продайте дома в меню «Моя недвижимость»!
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* 4. Bottom Live Stats & Legal Footer */}
      <div className="w-full mt-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
        <div className="flex items-center gap-3">
          <span>Открытых столов: {publicRooms.length}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("legal")}
            className="hover:text-foreground transition-colors underline"
          >
            Соглашение и 152-ФЗ
          </button>
        </div>
      </div>
    </div>
  );
};
