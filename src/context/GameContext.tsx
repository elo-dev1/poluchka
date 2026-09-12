import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, PublicRoomSummary, TelegramUser, ChatMessage } from '@/types/game';
import { soundEngine } from '@/lib/soundEngine';
import {
  canBuildHouse,
  canSellHouse,
  canMortgage,
  canUnmortgage,
} from '@/lib/propertyRules';
import { getPetCharacter } from '@/lib/petCharacters';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface GameContextType {
  socket: Socket | null;
  gameState: GameState | null;
  currentUser: TelegramUser | null;
  authToken: string | null;
  roomId: string | null;
  playerId: string;
  playerName: string;
  isHost: boolean;
  publicRooms: PublicRoomSummary[];
  toasts: ToastItem[];
  chatMessages: ChatMessage[];
  // Settings
  theme: string;
  uiScale: number;
  soundEnabled: boolean;
  snowEnabled: boolean;
  animSpeed: number;
  // Modals state
  activeModal: string | null;
  modalData: any;
  // Actions
  setPlayerName: (name: string) => void;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
  createRoom: (name: string, isPrivate?: boolean, options?: { mode?: 'standard' | 'blitz' | 'ranked'; gameMode?: 'classic' | 'reverse' | 'team'; maxRounds?: number; boardSize?: 40 | 24; startingCash?: number; maxPlayers?: number; theme?: 'panel' | 'cars' | 'random' }) => Promise<{ success: boolean; error?: string }>;
  joinRoom: (code: string, name: string) => Promise<{ success: boolean; error?: string }>;
  quickMatch: () => Promise<{ success: boolean; isNewRoom?: boolean; error?: string }>;
  leaveRoom: () => void;
  reconnectSession: () => void;
  discardSession: () => void;
  startGame: () => void;
  addBot: (difficulty?: 'careful' | 'balanced' | 'aggressive', teamId?: string) => void;
  removeBot: (botId: string) => void;
  setPlayerTeam: (teamId: string, targetPlayerId?: string) => void;
  rollDice: () => void;
  endTurn: () => void;
  buyProperty: () => void;
  passProperty: () => void;
  payBail: () => void;
  useJailCard: () => void;
  rollJailDice: () => void;
  buildHouse: (tileId: number) => void;
  sellHouse: (tileId: number) => void;
  mortgageProperty: (tileId: number) => void;
  unmortgageProperty: (tileId: number) => void;
  bidAuction: (amount: number) => void;
  passAuction: () => void;
  proposeTrade: (tradeDataOrPartnerId: any, offerProperties?: number[], offerCash?: number, requestProperties?: number[], requestCash?: number) => void;
  acceptTrade: (tradeId: string) => void;
  rejectTrade: (tradeId: string) => void;
  declareBankruptcy: () => void;
  dismissCard: () => void;
  selectedCharacterId: string;
  setCharacterId: (id: string) => void;
  updateRoomCharacter: (characterId: string) => void;
  isTokenMoving: boolean;
  setIsTokenMoving: (moving: boolean) => void;
  sendChatMessage: (text: string) => void;
  authTelegram: (authData: any) => Promise<boolean>;
  authYandex: (authData: any) => Promise<boolean>;
  logoutTelegram: () => void;
  updateNickname: (newNickname: string) => Promise<boolean>;
  applySettings: (settings: {
    theme?: string;
    uiScale?: number;
    sound?: boolean;
    snow?: boolean;
    speed?: number;
  }, silent?: boolean) => void;
}

export interface SocketResponse<T = any> {
  success: boolean;
  state?: GameState;
  roomId?: string;
  playerId?: string;
  sessionToken?: string;
  error?: string;
  isNewRoom?: boolean;
  leaderboard?: any[];
  user?: TelegramUser;
  token?: string;
  characterId?: string;
  trade?: any;
  result?: any;
  data?: T;
}

const GameContext = createContext<GameContextType | null>(null);

const STORAGE_ROOM_KEY = 'monopoly_saved_room_id';
const STORAGE_SESSION_TOKEN_KEY = 'monopoly_saved_session_token';
const STORAGE_PLAYER_KEY = 'monopoly_saved_player_id';
const STORAGE_NAME_KEY = 'monopoly_saved_player_name';
const STORAGE_CHARACTER_KEY = 'monopoly_saved_character_id';
const STORAGE_TG_USER_KEY = 'monopoly_tg_user';
const STORAGE_TG_TOKEN_KEY = 'monopoly_tg_token';
const STORAGE_THEME_KEY = 'monopoly_saved_theme';
const STORAGE_UI_SCALE_KEY = 'monopoly_saved_ui_scale';
const STORAGE_SNOW_KEY = 'monopoly_saved_snow';
const STORAGE_SOUND_KEY = 'monopoly_saved_sound';

// Safe Storage helpers for Incognito / Private Browsing / Restricted Cookies
function safeGetStorage(key: string): string | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
  } catch (err) {
    console.warn('Storage read warning:', err);
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn('Storage write warning:', err);
  }
}

function safeRemoveStorage(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('Storage remove warning:', err);
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('Игрок');
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(() => {
    const saved = safeGetStorage(STORAGE_CHARACTER_KEY);
    return getPetCharacter(saved).id;
  });
  const [isTokenMoving, setIsTokenMoving] = useState<boolean>(false);

  // Appearance & View Settings (classic default)
  const [theme, setThemeState] = useState<string>('classic');
  const [uiScale, setUiScaleState] = useState<number>(1.0);
  const [snowEnabled, setSnowEnabledState] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [animSpeed, setAnimSpeedState] = useState<number>(180);

  // Anti-Spam toast tracker
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info', duration: number = 3000) => {
    const now = Date.now();
    const lastShown = recentToastsRef.current.get(message);
    if (lastShown && now - lastShown < 1500) {
      return;
    }
    recentToastsRef.current.set(message, now);

    const id = `t_${now}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => {
      const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
      return [...trimmed, { id, message, type, duration }];
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const setCharacterId = useCallback((id: string) => {
    setSelectedCharacterId(id);
    safeSetStorage(STORAGE_CHARACTER_KEY, id);
  }, []);

  const isHost = Boolean(gameState && gameState.hostId === playerId);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openModal = useCallback((modalName: string, data?: any) => {
    setActiveModal(modalName);
    setModalData(data || null);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  // Stable references for socket handlers to prevent connection teardowns
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const openModalRef = useRef(openModal);
  openModalRef.current = openModal;

  const closeModalRef = useRef(closeModal);
  closeModalRef.current = closeModal;

  const playerIdRef = useRef(playerId);
  playerIdRef.current = playerId;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Initialize client settings and socket (once on mount)
  useEffect(() => {
    // Generate or read playerId safely
    let pId = safeGetStorage(STORAGE_PLAYER_KEY);
    if (!pId) {
      pId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      safeSetStorage(STORAGE_PLAYER_KEY, pId);
    }
    setPlayerId(pId);

    // Read stored player name safely
    const savedName = safeGetStorage(STORAGE_NAME_KEY);
    if (savedName) setPlayerName(savedName);

    // Read saved Telegram user safely
    const savedTgUser = safeGetStorage(STORAGE_TG_USER_KEY);
    if (savedTgUser) {
      try {
        const user = JSON.parse(savedTgUser);
        setCurrentUser(user);
        if (user.firstName || user.username) setPlayerName(user.firstName || user.username);
      } catch {
        safeRemoveStorage(STORAGE_TG_USER_KEY);
      }
    }

    // Read theme and view settings (classic by default; soviet/noir restricted to authorized users)
    let sTheme = safeGetStorage(STORAGE_THEME_KEY) || 'classic';
    if (sTheme !== 'classic' && sTheme !== 'soviet' && sTheme !== 'noir') {
      sTheme = 'classic';
      safeSetStorage(STORAGE_THEME_KEY, 'classic');
    }
    if ((sTheme === 'soviet' || sTheme === 'noir') && !savedTgUser) {
      sTheme = 'classic';
      safeSetStorage(STORAGE_THEME_KEY, 'classic');
    }
    const sScale = Number(safeGetStorage(STORAGE_UI_SCALE_KEY)) || 1.0;
    const sSnow = safeGetStorage(STORAGE_SNOW_KEY) === 'true';
    const sSound = safeGetStorage(STORAGE_SOUND_KEY) !== 'false';

    setThemeState(sTheme);
    setUiScaleState(sScale);
    setSnowEnabledState(sSnow);
    setSoundEnabledState(sSound);
    soundEngine.isMuted = !sSound;

    try {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', sTheme);
    } catch {}

    // Connect Socket.io with explicit transport fallback
    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    setSocket(newSocket);

    const handleRoomsUpdate = (rooms: PublicRoomSummary[]) => {
      setPublicRooms(rooms || []);
    };

    const fetchPublicRooms = () => {
      if (newSocket.connected) {
        newSocket.emit('get_rooms_list');
      }
      try {
        fetch('/api/rooms')
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch rooms');
          })
          .then((data) => {
            if (data && Array.isArray(data.rooms)) {
              setPublicRooms(data.rooms);
            }
          })
          .catch(() => {});
      } catch {}
    };

    const handleStateUpdate = (state: GameState) => {
      const savedRoom = safeGetStorage(STORAGE_ROOM_KEY);
      if (!savedRoom) {
        setGameState(null);
        setRoomId(null);
        return;
      }
      if (state && state.roomId && state.roomId !== savedRoom) {
        return;
      }

      setGameState((prevState) => {
        // If an active trade was just accepted, declined, or ended -> close modal automatically
        if (prevState?.activeTrade && !state?.activeTrade) {
          closeModalRef.current();
        }
        return state;
      });

      if (state && state.roomId) {
        setRoomId(state.roomId);
      }
    };

    const handleDiceRoll = (data: { dice?: any; player?: any; playerId?: string; newPosition?: number; isGoToJail?: boolean }) => {
      soundEngine.playDiceRoll();
      const playerName = data.player?.name;
      if (data.isGoToJail) {
        showToastRef.current(`🚨 ${playerName || 'Игрок'} отправляется в Тюрьму!`, 'warning', 3000);
      } else if (playerName) {
        const sum = data.dice ? (data.dice.sum || (data.dice.die1 + data.dice.die2) || 2) : 2;
        showToastRef.current(`🎲 ${playerName} выбросил ${sum}!`, 'info', 2500);
      }
    };

    const handleChatMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    newSocket.on('connect', () => {
      fetchPublicRooms();
      const currentSavedRoom = safeGetStorage(STORAGE_ROOM_KEY);
      const currentSavedToken = safeGetStorage(STORAGE_SESSION_TOKEN_KEY);
      const currentPId = playerIdRef.current || safeGetStorage(STORAGE_PLAYER_KEY);
      if (currentSavedRoom && currentPId) {
        newSocket.emit('reconnect_player', {
          roomId: currentSavedRoom,
          playerId: currentPId,
          sessionToken: currentSavedToken
        }, (res: SocketResponse) => {
          if (res && res.success && res.state) {
            setGameState(res.state);
            setRoomId(res.roomId || currentSavedRoom);
            if (res.sessionToken) safeSetStorage(STORAGE_SESSION_TOKEN_KEY, res.sessionToken);
            showToastRef.current(`Восстановлена сессия в комнате [${res.roomId || currentSavedRoom}]`, 'success', 2500);
          } else {
            safeRemoveStorage(STORAGE_ROOM_KEY);
            safeRemoveStorage(STORAGE_SESSION_TOKEN_KEY);
            setGameState(null);
            setRoomId(null);
            fetchPublicRooms();
          }
        });
      }
    });

    newSocket.on('rooms_list_updated', handleRoomsUpdate);
    newSocket.on('rooms_list_update', handleRoomsUpdate);

    newSocket.on('game_state_updated', handleStateUpdate);
    newSocket.on('game_state_update', handleStateUpdate);

    newSocket.on('player_rolled', handleDiceRoll);
    newSocket.on('dice_rolled', handleDiceRoll);

    newSocket.on('chat_message', handleChatMessage);

    newSocket.on('trade_proposed', (data: { trade?: any }) => {
      const trade = data?.trade;
      const currentPId = playerIdRef.current || safeGetStorage(STORAGE_PLAYER_KEY);
      if (trade && (trade.toPlayerId === currentPId || trade.targetId === currentPId)) {
        soundEngine.playCash();
        const initiator = trade.fromPlayerName || 'Соперник';
        showToastRef.current(`Вам поступило новое предложение о сделке от ${initiator}! 🤝`, 'info', 4000);
        openModalRef.current('trade');
      }
    });

    newSocket.on('error_notification', (data: { message: string }) => {
      if (data && data.message) {
        showToastRef.current(data.message, 'error', 3500);
      }
    });

    newSocket.on('player_left', (data: { playerName: string }) => {
      showToastRef.current(`🚪 Игрок ${data.playerName} покинул комнату`, 'warning', 2500);
    });

    newSocket.on('game_over', (data: { winner: any }) => {
      soundEngine.playWin();
      if (data.winner) {
        showToastRef.current(`🏆 Победитель: ${data.winner.name}! Поздравляем!`, 'success', 5000);
      }
    });

    // Initial fetch of rooms
    fetchPublicRooms();

    // Background interval to keep rooms browser always up-to-date
    const roomsInterval = setInterval(() => {
      const activeSavedRoom = safeGetStorage(STORAGE_ROOM_KEY);
      if (!activeSavedRoom) {
        fetchPublicRooms();
      }
    }, 3000);

    return () => {
      clearInterval(roomsInterval);
      newSocket.disconnect();
    };
  }, [showToast, openModal]);

  const applySettings = useCallback((settings: {
    theme?: string;
    uiScale?: number;
    sound?: boolean;
    snow?: boolean;
    speed?: number;
  }, silent: boolean = false) => {
    if (settings.theme !== undefined) {
      const isAuthed = Boolean(currentUserRef.current || currentUser || safeGetStorage(STORAGE_TG_USER_KEY));
      // Auth-only themes (soviet, noir) are exclusive to authorized users
      if ((settings.theme === 'soviet' || settings.theme === 'noir') && !isAuthed) {
        const label = settings.theme === 'soviet' ? '«ЦУП Байконур 1961»' : '«Film Noir 1947»';
        showToast(`Тема ${label} доступна только авторизованным игрокам!`, 'warning');
        openModal('telegramLogin');
        return;
      }
      const validThemes = ['classic', 'soviet', 'noir'];
      const chosenTheme = validThemes.includes(settings.theme) ? settings.theme : 'classic';
      setThemeState(chosenTheme);
      safeSetStorage(STORAGE_THEME_KEY, chosenTheme);
      try {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', chosenTheme);
      } catch {}
    }
    if (settings.uiScale !== undefined) {
      setUiScaleState(settings.uiScale);
      safeSetStorage(STORAGE_UI_SCALE_KEY, String(settings.uiScale));
      try {
        document.documentElement.style.fontSize = `calc(16px * ${settings.uiScale})`;
      } catch {}
    }
    if (settings.sound !== undefined) {
      setSoundEnabledState(settings.sound);
      soundEngine.isMuted = !settings.sound;
      safeSetStorage(STORAGE_SOUND_KEY, settings.sound ? 'true' : 'false');
    }
    if (settings.snow !== undefined) {
      setSnowEnabledState(settings.snow);
      safeSetStorage(STORAGE_SNOW_KEY, settings.snow ? 'true' : 'false');
    }
    if (settings.speed !== undefined) {
      setAnimSpeedState(settings.speed);
    }
    if (!silent) {
      showToast('Настройки успешно сохранены! ✅', 'success', 2000);
    }
  }, [currentUser, showToast, openModal]);

  const createRoom = useCallback(async (name: string, isPrivate: boolean = false, options: { mode?: 'standard' | 'blitz' | 'ranked'; gameMode?: 'classic' | 'reverse' | 'team'; maxRounds?: number; boardSize?: 40 | 24; startingCash?: number; maxPlayers?: number; theme?: 'panel' | 'cars' | 'random' } = {}) => {
    if (!socket) return { success: false, error: 'Сокет не подключен' };
    const cleanName = name.trim().substring(0, 24) || 'Игрок 1';
    setPlayerName(cleanName);
    safeSetStorage(STORAGE_NAME_KEY, cleanName);

    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('create_room', {
        playerName: cleanName,
        playerId,
        isPrivate,
        mode: options.mode || 'standard',
        gameMode: options.gameMode || 'classic',
        maxRounds: options.maxRounds !== undefined ? options.maxRounds : (options.gameMode === 'reverse' ? 20 : 0),
        boardSize: options.boardSize || (options.mode === 'blitz' ? 24 : 40),
        startingCash: options.startingCash || 1500,
        maxPlayers: options.maxPlayers || (options.mode === 'ranked' ? 2 : (options.gameMode === 'team' ? 4 : 6)),
        theme: options.theme || 'random',
        telegramId: currentUser ? currentUser.telegramId : null,
        avatarUrl: currentUser ? currentUser.avatarUrl : null,
        username: currentUser ? currentUser.username : null,
        characterId: selectedCharacterId,
      }, (res: SocketResponse) => {
        if (res && res.success) {
          setRoomId(res.roomId);
          setGameState(res.state);
          setChatMessages([]);
          safeSetStorage(STORAGE_ROOM_KEY, res.roomId);
          if (res.sessionToken) safeSetStorage(STORAGE_SESSION_TOKEN_KEY, res.sessionToken);
          showToast(`Комната [${res.roomId}] создана!`, 'success');
          resolve({ success: true });
        } else {
          showToast(res ? res.error : 'Ошибка создания комнаты', 'error');
          resolve({ success: false, error: res?.error });
        }
      });
    });
  }, [socket, playerId, currentUser, selectedCharacterId, showToast]);

  const joinRoom = useCallback(async (code: string, name: string) => {
    if (!socket) return { success: false, error: 'Сокет не подключен' };
    const cleanCode = (code || '').trim().toUpperCase();
    const cleanName = name.trim().substring(0, 24) || 'Игрок';
    setPlayerName(cleanName);
    safeSetStorage(STORAGE_NAME_KEY, cleanName);

    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('join_room', {
        roomId: cleanCode,
        playerName: cleanName,
        playerId,
        telegramId: currentUser ? currentUser.telegramId : null,
        avatarUrl: currentUser ? currentUser.avatarUrl : null,
        username: currentUser ? currentUser.username : null,
        characterId: selectedCharacterId,
      }, (res: SocketResponse) => {
        if (res && res.success) {
          setRoomId(res.roomId);
          setGameState(res.state);
          setChatMessages([]);
          safeSetStorage(STORAGE_ROOM_KEY, res.roomId);
          if (res.sessionToken) safeSetStorage(STORAGE_SESSION_TOKEN_KEY, res.sessionToken);
          showToast(`Вы присоединились к [${res.roomId}]!`, 'success');
          resolve({ success: true });
        } else {
          showToast(res ? res.error : 'Не удалось войти в комнату', 'error');
          resolve({ success: false, error: res?.error });
        }
      });
    });
  }, [socket, playerId, currentUser, selectedCharacterId, showToast]);

  const quickMatch = useCallback(async () => {
    if (!socket) return { success: false, error: 'Сокет не подключен' };
    const cleanName = (playerName || '').trim().substring(0, 24) || 'Игрок';
    setPlayerName(cleanName);
    safeSetStorage(STORAGE_NAME_KEY, cleanName);

    return new Promise<{ success: boolean; isNewRoom?: boolean; error?: string }>((resolve) => {
      socket.emit('quick_match', {
        playerName: cleanName,
        playerId,
        telegramId: currentUser ? currentUser.telegramId : null,
        avatarUrl: currentUser ? currentUser.avatarUrl : null,
        username: currentUser ? currentUser.username : null,
        characterId: selectedCharacterId,
      }, (res: SocketResponse) => {
        if (res && res.success) {
          setRoomId(res.roomId);
          setGameState(res.state);
          setChatMessages([]);
          safeSetStorage(STORAGE_ROOM_KEY, res.roomId);
          if (res.sessionToken) safeSetStorage(STORAGE_SESSION_TOKEN_KEY, res.sessionToken);
          if (res.isNewRoom) {
            showToast(`Создан открытый стол [${res.roomId}]! Ожидаем игроков...`, 'success', 3000);
          } else {
            showToast(`Вы вошли за свободный стол [${res.roomId}]!`, 'success', 3000);
          }
          resolve({ success: true, isNewRoom: res.isNewRoom });
        } else {
          showToast(res ? res.error : 'Не удалось найти игру', 'error');
          resolve({ success: false, error: res?.error });
        }
      });
    });
  }, [socket, playerId, playerName, currentUser, selectedCharacterId, showToast]);

  const updateRoomCharacter = useCallback((charId: string) => {
    setCharacterId(charId);
    if (socket && roomId && playerId) {
      socket.emit('set_character', { roomId, playerId, characterId: charId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Персонаж изменен! 🐾', 'info', 1500);
        }
      });
    }
  }, [socket, roomId, playerId, setCharacterId, showToast]);

  const leaveRoom = useCallback(() => {
    safeRemoveStorage(STORAGE_ROOM_KEY);
    safeRemoveStorage(STORAGE_SESSION_TOKEN_KEY);
    if (socket) {
      if (roomId && playerId) {
        socket.emit('leave_room', { roomId, playerId });
      }
      socket.emit('get_rooms_list');
    }
    setRoomId(null);
    setGameState(null);
    setChatMessages([]);
    closeModal();
    showToast('Вы вышли из комнаты', 'info', 2000);
  }, [socket, roomId, playerId, showToast, closeModal]);

  const reconnectSession = useCallback(() => {
    const savedRoom = safeGetStorage(STORAGE_ROOM_KEY);
    const savedToken = safeGetStorage(STORAGE_SESSION_TOKEN_KEY);
    if (socket && savedRoom && playerId) {
      socket.emit('reconnect_player', { roomId: savedRoom, playerId, sessionToken: savedToken }, (res: SocketResponse) => {
        if (res && res.success) {
          setGameState(res.state);
          setRoomId(res.roomId);
          if (res.sessionToken) safeSetStorage(STORAGE_SESSION_TOKEN_KEY, res.sessionToken);
          showToast(`Переподключено к [${res.roomId}]`, 'success');
        } else {
          showToast('Сессия устарела', 'warning');
          safeRemoveStorage(STORAGE_ROOM_KEY);
          safeRemoveStorage(STORAGE_SESSION_TOKEN_KEY);
        }
      });
    }
  }, [socket, playerId, showToast]);

  const discardSession = useCallback(() => {
    safeRemoveStorage(STORAGE_ROOM_KEY);
    safeRemoveStorage(STORAGE_SESSION_TOKEN_KEY);
    showToast('Сохраненная сессия сброшена', 'info', 1500);
  }, [showToast]);

  const startGame = useCallback(() => {
    if (socket && roomId && playerId) {
      socket.emit('start_game', { roomId, playerId }, (res: SocketResponse) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Не удалось начать игру', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const addBot = useCallback((difficulty: 'careful' | 'balanced' | 'aggressive' = 'balanced', teamId?: string) => {
    if (socket && roomId) {
      soundEngine.playClick();
      socket.emit('add_bot', { roomId, difficulty, teamId }, (res: SocketResponse) => {
        if (res && res.success) {
          const teamLabel = teamId === 'team_red' ? 'в Красную команду 🔴' : teamId === 'team_blue' ? 'в Синюю команду 🔵' : 'за стол';
          showToast(`Бот добавлен ${teamLabel}! 🤖`, 'success', 1500);
        } else {
          showToast(res ? res.error : 'Не удалось добавить бота', 'error');
        }
      });
    }
  }, [socket, roomId, showToast]);

  const removeBot = useCallback((botId: string) => {
    if (socket && roomId) {
      soundEngine.playClick();
      socket.emit('remove_bot', { roomId, botId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Бот удален из комнаты', 'info', 1500);
        } else {
          showToast(res ? res.error : 'Не удалось удалить бота', 'error');
        }
      });
    }
  }, [socket, roomId, showToast]);

  const setPlayerTeam = useCallback((teamId: string, targetPlayerId?: string) => {
    if (socket && roomId) {
      soundEngine.playClick();
      socket.emit('set_player_team', {
        roomId,
        teamId,
        targetPlayerId: targetPlayerId || playerId
      }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Команда изменена! 🚩', 'info', 1500);
        } else {
          showToast(res ? res.error : 'Не удалось сменить команду', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const rollDice = useCallback(() => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      socket.emit('roll_dice', { roomId, playerId }, (res: SocketResponse) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Ошибка броска кубиков', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const endTurn = useCallback(() => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      socket.emit('end_turn', { roomId, playerId }, (res: SocketResponse) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Не удалось завершить ход', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const buyProperty = useCallback(() => {
    if (socket && roomId && playerId) {
      soundEngine.playBuy();
      socket.emit('buy_property', { roomId, playerId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Актив успешно куплен! 🏢', 'success');
        } else {
          showToast(res ? res.error : 'Ошибка покупки', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const passProperty = useCallback(() => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      socket.emit('pass_property', { roomId, playerId }, (res: SocketResponse) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Ошибка выставления на аукцион', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const payBail = useCallback(() => {
    if (socket && roomId && playerId) {
      socket.emit('pay_bail', { roomId, playerId });
    }
  }, [socket, roomId, playerId]);

  const useJailCard = useCallback(() => {
    if (socket && roomId && playerId) {
      socket.emit('use_jail_card', { roomId, playerId });
    }
  }, [socket, roomId, playerId]);

  const rollJailDice = useCallback(() => {
    if (socket && roomId && playerId) {
      socket.emit('roll_jail_dice', { roomId, playerId });
    }
  }, [socket, roomId, playerId]);

  const buildHouse = useCallback((tileId: number) => {
    if (!gameState || !playerId) return;
    const tile = gameState.board?.find((t) => t.id === tileId) || gameState.board?.[tileId];
    const validation = canBuildHouse(tile, gameState, playerId);
    if (!validation.allowed) {
      showToast(validation.reason || 'Улучшение недоступно', 'warning');
      return;
    }
    if (socket && roomId && playerId) {
      soundEngine.playBuy();
      socket.emit('build_house', { roomId, playerId, tileId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Дом успешно построен! 🏠', 'success');
        } else {
          showToast(res ? res.error : 'Ошибка постройки', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, gameState, showToast]);

  const sellHouse = useCallback((tileId: number) => {
    if (!gameState || !playerId) return;
    const tile = gameState.board?.find((t) => t.id === tileId) || gameState.board?.[tileId];
    const validation = canSellHouse(tile, gameState, playerId);
    if (!validation.allowed) {
      showToast(validation.reason || 'Снос недоступен', 'warning');
      return;
    }
    if (socket && roomId && playerId) {
      soundEngine.playCash();
      socket.emit('sell_house', { roomId, playerId, tileId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Дом продан банку 💰', 'info');
        } else {
          showToast(res ? res.error : 'Ошибка продажи', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, gameState, showToast]);

  const mortgageProperty = useCallback((tileId: number) => {
    if (!gameState || !playerId) return;
    const tile = gameState.board?.find((t) => t.id === tileId) || gameState.board?.[tileId];
    const validation = canMortgage(tile, gameState, playerId);
    if (!validation.allowed) {
      showToast(validation.reason || 'Залог недоступен', 'warning');
      return;
    }
    if (socket && roomId && playerId) {
      soundEngine.playCash();
      socket.emit('mortgage_property', { roomId, playerId, tileId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Улица заложена в банк 💵', 'info');
        } else {
          showToast(res ? res.error : 'Ошибка залога', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, gameState, showToast]);

  const unmortgageProperty = useCallback((tileId: number) => {
    if (!gameState || !playerId) return;
    const tile = gameState.board?.find((t) => t.id === tileId) || gameState.board?.[tileId];
    const validation = canUnmortgage(tile, gameState, playerId);
    if (!validation.allowed) {
      showToast(validation.reason || 'Выкуп недоступен', 'warning');
      return;
    }
    if (socket && roomId && playerId) {
      soundEngine.playBuy();
      socket.emit('unmortgage_property', { roomId, playerId, tileId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Улица выкуплена из залога! 🏢', 'success');
        } else {
          showToast(res ? res.error : 'Ошибка выкупа', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, gameState, showToast]);

  const bidAuction = useCallback((amount: number) => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      socket.emit('place_bid', { roomId, playerId, amount: Number(amount) }, (res: SocketResponse) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Ошибка ставки', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const passAuction = useCallback(() => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      socket.emit('pass_bid', { roomId, playerId }, (res: SocketResponse) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Ошибка отказа', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const proposeTrade = useCallback((tradeData: any, offerProperties?: number[], offerCash?: number, requestProperties?: number[], requestCash?: number) => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      const isObject = typeof tradeData === 'object' && tradeData !== null;
      const toPlayerId = isObject ? (tradeData.toPlayerId || tradeData.targetId) : tradeData;
      const oProps = isObject ? (tradeData.offerProperties || tradeData.offer?.properties || []) : (offerProperties || []);
      const oCash = isObject ? (Number(tradeData.offerCash || tradeData.offer?.money) || 0) : (Number(offerCash) || 0);
      const rProps = isObject ? (tradeData.requestProperties || tradeData.request?.properties || []) : (requestProperties || []);
      const rCash = isObject ? (Number(tradeData.requestCash || tradeData.request?.money) || 0) : (Number(requestCash) || 0);

      const payload = {
        roomId,
        fromPlayerId: playerId,
        initiatorId: playerId,
        toPlayerId,
        targetId: toPlayerId,
        offer: {
          money: oCash,
          properties: oProps,
        },
        request: {
          money: rCash,
          properties: rProps,
        },
        ...(isObject ? tradeData : {}),
      };

      socket.emit('propose_trade', payload, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Предложение о сделке отправлено! 🤝', 'success');
        } else {
          showToast(res ? res.error : 'Ошибка отправки предложения', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const acceptTrade = useCallback((tradeId: string) => {
    if (socket && roomId && playerId) {
      soundEngine.playBuy();
      socket.emit('respond_trade', { roomId, playerId, tradeId, action: 'ACCEPT' }, (res: SocketResponse) => {
        if (res && !res.success) {
          showToast(res ? res.error : 'Ошибка принятия сделки', 'error');
        } else {
          showToast('Сделка успешно заключена! 🎉', 'success');
        }
      });
      closeModal();
    }
  }, [socket, roomId, playerId, showToast, closeModal]);

  const rejectTrade = useCallback((tradeId: string) => {
    if (socket && roomId && playerId) {
      soundEngine.playClick();
      socket.emit('respond_trade', { roomId, playerId, tradeId, action: 'DECLINE' }, (res: SocketResponse) => {
        if (res && !res.success) {
          showToast(res ? res.error : 'Ошибка отклонения сделки', 'error');
        } else {
          showToast('Сделка отклонена', 'info');
        }
      });
      closeModal();
    }
  }, [socket, roomId, playerId, showToast, closeModal]);

  const declareBankruptcy = useCallback(() => {
    if (socket && roomId && playerId) {
      soundEngine.playJail();
      socket.emit('declare_bankruptcy', { roomId, playerId }, (res: SocketResponse) => {
        if (res && res.success) {
          showToast('Вы объявили банкротство 💀', 'warning');
        } else {
          showToast(res ? res.error : 'Ошибка объявления банкротства', 'error');
        }
      });
    }
  }, [socket, roomId, playerId, showToast]);

  const dismissCard = useCallback(() => {
    if (socket && roomId && playerId) {
      socket.emit('dismiss_card', { roomId, playerId });
    }
  }, [socket, roomId, playerId]);

  const sendChatMessage = useCallback((text: string) => {
    if (socket && roomId && playerId && text.trim()) {
      socket.emit('send_chat_message', { roomId, playerId, message: text.trim() });
    }
  }, [socket, roomId, playerId]);

  const authTelegram = useCallback(async (authData: any) => {
    if (!socket) return false;
    return new Promise<boolean>((resolve) => {
      socket.emit('auth_telegram', { authData }, (res: SocketResponse) => {
        if (res && res.success && res.user) {
          setCurrentUser(res.user);
          setAuthToken(res.token || null);
          safeSetStorage(STORAGE_TG_USER_KEY, JSON.stringify(res.user));
          if (res.token) safeSetStorage(STORAGE_TG_TOKEN_KEY, res.token);
          if (res.user.firstName || res.user.username) {
            setPlayerName(res.user.firstName || res.user.username);
            safeSetStorage(STORAGE_NAME_KEY, res.user.firstName || res.user.username);
          }
          showToast(`Добро пожаловать, ${res.user.firstName || res.user.username}! ⭐ Рейтинг: ${res.user.rating ?? 0}`, 'success', 3500);
          closeModal();
          resolve(true);
        } else {
          showToast(res ? res.error : 'Ошибка авторизации Telegram', 'error');
          resolve(false);
        }
      });
    });
  }, [socket, showToast, closeModal]);

  const authYandex = useCallback(async (authData: any) => {
    if (!socket) return false;
    return new Promise<boolean>((resolve) => {
      socket.emit('auth_yandex', { authData }, (res: SocketResponse) => {
        if (res && res.success && res.user) {
          setCurrentUser(res.user);
          setAuthToken(res.token || null);
          safeSetStorage(STORAGE_TG_USER_KEY, JSON.stringify(res.user));
          if (res.token) safeSetStorage(STORAGE_TG_TOKEN_KEY, res.token);
          if (res.user.firstName || res.user.username) {
            setPlayerName(res.user.firstName || res.user.username);
            safeSetStorage(STORAGE_NAME_KEY, res.user.firstName || res.user.username);
          }
          showToast(`Добро пожаловать через Яндекс ID, ${res.user.firstName || res.user.username}! ⭐ Рейтинг: ${res.user.rating ?? 0}`, 'success', 3500);
          closeModal();
          resolve(true);
        } else {
          showToast(res ? res.error : 'Ошибка авторизации Яндекс ID', 'error');
          resolve(false);
        }
      });
    });
  }, [socket, showToast, closeModal]);

  // Auto-consume OAuth parameters from URL (Telegram or Yandex redirects)
  useEffect(() => {
    if (!socket) return;

    const processUrlAuth = async () => {
      try {
        let tgData: any = null;

        // 1. Check URL Hash for #tgAuthResult=...
        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          if (hash.startsWith('tgAuthResult=')) {
            const base64 = hash.replace('tgAuthResult=', '');
            const jsonStr = decodeURIComponent(escape(atob(base64)));
            tgData = JSON.parse(jsonStr);
          }
        }

        // 2. Check URL Search Query for ?id=...&hash=...
        if (!tgData && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          if (params.get('id') && params.get('hash')) {
            tgData = {
              id: params.get('id'),
              first_name: params.get('first_name') || '',
              last_name: params.get('last_name') || '',
              username: params.get('username') || '',
              photo_url: params.get('photo_url') || '',
              auth_date: params.get('auth_date') || '',
              hash: params.get('hash') || ''
            };
          }
        }

        // 3. Check localStorage pending tg data
        if (!tgData) {
          const pending = localStorage.getItem('pending_tg_auth_data');
          if (pending) {
            localStorage.removeItem('pending_tg_auth_data');
            try {
              tgData = JSON.parse(pending);
            } catch {}
          }
        }

        if (tgData && tgData.id) {
          window.history.replaceState({}, document.title, window.location.pathname);
          await authTelegram(tgData);
          return;
        }

        // 4. Check localStorage pending Yandex token
        const yaToken = localStorage.getItem('yandex_oauth_token');
        if (yaToken) {
          localStorage.removeItem('yandex_oauth_token');
          await authYandex({ token: yaToken });
        }
      } catch (err) {
        console.error('Error processing URL OAuth data:', err);
      }
    };

    processUrlAuth();
  }, [socket, authTelegram, authYandex]);

  const logoutTelegram = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    safeRemoveStorage(STORAGE_TG_USER_KEY);
    safeRemoveStorage(STORAGE_TG_TOKEN_KEY);
    if (theme === 'soviet' || theme === 'noir') {
      setThemeState('classic');
      safeSetStorage(STORAGE_THEME_KEY, 'classic');
      try {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'classic');
      } catch {}
    }
    showToast('Вы вышли из профиля (активен гостевой режим)', 'info', 2000);
    closeModal();
  }, [theme, showToast, closeModal]);

  const updateNickname = useCallback(async (newNickname: string) => {
    const clean = newNickname.trim().substring(0, 24);
    if (!clean) {
      showToast('Имя не может быть пустым', 'warning');
      return false;
    }

    if (currentUser) {
      if (socket) {
        return new Promise<boolean>((resolve) => {
          socket.emit('update_nickname', { nickname: clean, telegramId: currentUser.telegramId }, (res: SocketResponse) => {
            if (res && res.success && res.user) {
              setCurrentUser(res.user);
              safeSetStorage(STORAGE_TG_USER_KEY, JSON.stringify(res.user));
              setPlayerName(clean);
              safeSetStorage(STORAGE_NAME_KEY, clean);
              showToast('Никнейм успешно изменён!', 'success');
              resolve(true);
            } else {
              showToast(res?.error || 'Ошибка изменения никнейма', 'error');
              resolve(false);
            }
          });
        });
      } else {
        showToast('Нет подключения к серверу', 'error');
        return false;
      }
    }

    setPlayerName(clean);
    safeSetStorage(STORAGE_NAME_KEY, clean);
    showToast('Имя игрока изменено!', 'success');
    return true;
  }, [socket, currentUser, showToast]);

  return (
    <GameContext.Provider
      value={{
        socket,
        gameState,
        currentUser,
        authToken,
        roomId,
        playerId,
        playerName,
        isHost,
        publicRooms,
        toasts,
        chatMessages,
        theme,
        uiScale,
        soundEnabled,
        snowEnabled,
        animSpeed,
        activeModal,
        modalData,
        setPlayerName,
        openModal,
        closeModal,
        showToast,
        removeToast,
        createRoom,
        joinRoom,
        quickMatch,
        leaveRoom,
        reconnectSession,
        discardSession,
        startGame,
        addBot,
        removeBot,
        setPlayerTeam,
        rollDice,
        endTurn,
        buyProperty,
        passProperty,
        payBail,
        useJailCard,
        rollJailDice,
        buildHouse,
        sellHouse,
        mortgageProperty,
        unmortgageProperty,
        bidAuction,
        passAuction,
        proposeTrade,
        acceptTrade,
        rejectTrade,
        declareBankruptcy,
        dismissCard,
        selectedCharacterId,
        setCharacterId,
        updateRoomCharacter,
        isTokenMoving,
        setIsTokenMoving,
        sendChatMessage,
        authTelegram,
        authYandex,
        logoutTelegram,
        updateNickname,
        applySettings,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
