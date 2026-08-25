/**
 * Main Client Application Controller for Monopoly (Stage 2 Advanced)
 */
(() => {
  // Socket.io instance
  const socket = io();

  // Local storage keys
  const STORAGE_ROOM_KEY = 'monopoly_saved_room_id';
  const STORAGE_PLAYER_KEY = 'monopoly_saved_player_id';
  const STORAGE_NAME_KEY = 'monopoly_saved_player_name';
  const STORAGE_TG_USER_KEY = 'monopoly_tg_user';
  const STORAGE_TG_TOKEN_KEY = 'monopoly_tg_token';
  const STORAGE_THEME_KEY = 'monopoly_saved_theme';
  const STORAGE_VIEW_3D_KEY = 'monopoly_saved_3d_mode';
  const STORAGE_TILT_X_KEY = 'monopoly_saved_tilt_x';
  const STORAGE_ROT_Z_KEY = 'monopoly_saved_rot_z';
  const STORAGE_ANIM_SPEED_KEY = 'monopoly_saved_anim_speed';
  const STORAGE_UI_SCALE_KEY = 'monopoly_saved_ui_scale';
  const STORAGE_SNOW_KEY = 'monopoly_saved_snow';

  // App State
  const state = {
    roomId: null,
    playerId: null,
    playerName: '',
    currentUser: null,
    authToken: null,
    isHost: false,
    gameState: null,
    boardRenderer: null,
    snowOverlay: null,
    isRollingAnimation: false,
    turnTimerInterval: null,
    currentTimerSeconds: 60,
    is3DView: false,
    currentTheme: 'midnight',
    tiltX: 48,
    rotZ: -14,
    animSpeed: 180,
    uiScale: 1.0,
    snowEnabled: true
  };

  // DOM Elements cache
  const elements = {
    // Screens
    screenWelcome: document.getElementById('screen-welcome'),
    screenLobby: document.getElementById('screen-lobby'),
    screenGame: document.getElementById('screen-game'),
    modalGameOver: document.getElementById('modal-game-over'),

    // Welcome Screen
    inputPlayerName: document.getElementById('input-player-name'),
    inputRoomCode: document.getElementById('input-room-code'),
    btnCreateRoom: document.getElementById('btn-create-room'),
    checkboxPrivateRoom: document.getElementById('checkbox-private-room'),
    btnJoinRoom: document.getElementById('btn-join-room'),
    reconnectBanner: document.getElementById('reconnect-banner'),
    btnResumeSession: document.getElementById('btn-resume-session'),
    btnDiscardSession: document.getElementById('btn-discard-session'),
    btnRefreshRooms: document.getElementById('btn-refresh-rooms'),
    publicRoomsList: document.getElementById('public-rooms-list'),

    // Lobby Screen
    lobbyRoomCode: document.getElementById('lobby-room-code'),
    btnCopyLobbyCode: document.getElementById('btn-copy-lobby-code'),
    btnCopyLobbyLink: document.getElementById('btn-copy-lobby-link'),
    lobbyPlayersList: document.getElementById('lobby-players-list'),
    lobbyPlayerCount: document.getElementById('lobby-player-count'),
    btnStartGame: document.getElementById('btn-start-game'),
    lobbyWaitingNotice: document.getElementById('lobby-waiting-notice'),
    btnLeaveLobby: document.getElementById('btn-leave-lobby'),

    // Game Screen Top Bar
    gameRoomCode: document.getElementById('game-room-code'),
    btnCopyGameCode: document.getElementById('btn-copy-game-code'),
    btnOpenProperties: document.getElementById('btn-open-properties'),
    btnOpenTrade: document.getElementById('btn-open-trade'),
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    btnLeaveGame: document.getElementById('btn-leave-game'),
    btnHostEndGame: document.getElementById('btn-host-end-game'),

    // Game Center Dashboard & Turn Timer
    boardCenterDashboard: document.getElementById('board-center-dashboard'),
    turnTimerFill: document.getElementById('turn-timer-fill'),
    turnTimerText: document.getElementById('turn-timer-text'),
    turnBanner: document.getElementById('turn-banner'),
    turnAvatar: document.getElementById('turn-avatar'),
    turnPlayerName: document.getElementById('turn-player-name'),
    turnStatusText: document.getElementById('turn-status-text'),
    diceContainer: document.getElementById('dice-container'),
    die1Wrapper: document.getElementById('die-wrapper-1'),
    die2Wrapper: document.getElementById('die-wrapper-2'),
    die1El: document.getElementById('die-1'),
    die2El: document.getElementById('die-2'),

    // Jail Actions Panel
    jailActionsPanel: document.getElementById('jail-actions-panel'),
    btnJailRoll: document.getElementById('btn-jail-roll'),
    btnJailBail: document.getElementById('btn-jail-bail'),
    btnJailCard: document.getElementById('btn-jail-card'),

    // Action Controls
    actionControls: document.getElementById('action-controls'),
    btnRollDice: document.getElementById('btn-roll-dice'),
    btnEndTurn: document.getElementById('btn-end-turn'),
    propertyActionDialog: document.getElementById('property-action-dialog'),
    propertyCardColorBar: document.getElementById('property-card-colorbar'),
    propertyCardName: document.getElementById('property-card-name'),
    propertyCardPrice: document.getElementById('property-card-price'),
    propertyCardRent: document.getElementById('property-card-rent'),
    btnBuyProperty: document.getElementById('btn-buy-property'),
    btnPassProperty: document.getElementById('btn-pass-property'),

    // Sidebar Panels
    playersList: document.getElementById('players-list'),
    eventsLog: document.getElementById('events-log'),
    chatMessages: document.getElementById('chat-messages'),
    inputChatMessage: document.getElementById('input-chat-message'),
    btnSendChat: document.getElementById('btn-send-chat'),
    tabLogsBtn: document.getElementById('tab-logs-btn'),
    tabChatBtn: document.getElementById('tab-chat-btn'),
    panelLogs: document.getElementById('panel-logs'),
    panelChat: document.getElementById('panel-chat'),
    chatBadge: document.getElementById('chat-unread-badge'),

    // AUCTION MODAL
    modalAuction: document.getElementById('modal-auction'),
    auctionTileName: document.getElementById('auction-tile-name'),
    auctionTileGroup: document.getElementById('auction-tile-group'),
    auctionCurrentBid: document.getElementById('auction-current-bid'),
    auctionHighestBidder: document.getElementById('auction-highest-bidder'),
    inputCustomBid: document.getElementById('input-custom-bid'),
    btnPlaceBid: document.getElementById('btn-place-bid'),
    btnPassBid: document.getElementById('btn-pass-bid'),
    auctionBiddersList: document.getElementById('auction-bidders-list'),

    // TILE DETAILS & MANAGEMENT MODAL (Direct on-click)
    modalTileDetails: document.getElementById('modal-tile-details'),
    btnCloseTileDetails: document.getElementById('btn-close-tile-details'),
    tileDetailsColorBar: document.getElementById('tile-details-color-bar'),
    tileDetailsGroupTag: document.getElementById('tile-details-group-tag'),
    tileDetailsIcon: document.getElementById('tile-details-icon'),
    tileDetailsName: document.getElementById('tile-details-name'),
    tileDetailsPrice: document.getElementById('tile-details-price'),
    tileDetailsOwnerBanner: document.getElementById('tile-details-owner-banner'),
    tileDetailsRentTableBox: document.getElementById('tile-details-rent-table-box'),
    rentValBase: document.getElementById('rent-val-base'),
    rentValMonopoly: document.getElementById('rent-val-monopoly'),
    rentValH1: document.getElementById('rent-val-h1'),
    rentValH2: document.getElementById('rent-val-h2'),
    rentValH3: document.getElementById('rent-val-h3'),
    rentValH4: document.getElementById('rent-val-h4'),
    rentValHotel: document.getElementById('rent-val-hotel'),
    valHousePrice: document.getElementById('val-house-price'),
    valMortgageValue: document.getElementById('val-mortgage-value'),
    valUnmortgagePrice: document.getElementById('val-unmortgage-price'),
    tileDetailsActionsBox: document.getElementById('tile-details-actions-box'),
    btnTileBuildHouse: document.getElementById('btn-tile-build-house'),
    btnTileBuildHotel: document.getElementById('btn-tile-build-hotel'),
    btnTileSellBuilding: document.getElementById('btn-tile-sell-building'),
    btnTileMortgage: document.getElementById('btn-tile-mortgage'),
    btnTileUnmortgage: document.getElementById('btn-tile-unmortgage'),
    tileActionsHint: document.getElementById('tile-actions-hint'),

    // TRADE PROPOSAL MODAL
    modalTrade: document.getElementById('modal-trade'),
    btnCloseTradeModal: document.getElementById('btn-close-trade-modal'),
    tradePartnerSelect: document.getElementById('trade-partner-select'),
    tradeOfferMoney: document.getElementById('trade-offer-money'),
    tradeOfferJailCards: document.getElementById('trade-offer-jailcards'),
    tradeOfferPropertiesList: document.getElementById('trade-offer-properties-list'),
    tradeRequestMoney: document.getElementById('trade-request-money'),
    tradeRequestJailCards: document.getElementById('trade-request-jailcards'),
    tradeRequestPropertiesList: document.getElementById('trade-request-properties-list'),
    btnSendTrade: document.getElementById('btn-send-trade'),

    // INCOMING TRADE MODAL
    modalIncomingTrade: document.getElementById('modal-incoming-trade'),
    incomingTradeSenderInfo: document.getElementById('incoming-trade-sender-info'),
    incomingTradeOfferContent: document.getElementById('incoming-trade-offer-content'),
    incomingTradeRequestContent: document.getElementById('incoming-trade-request-content'),
    btnAcceptTrade: document.getElementById('btn-accept-trade'),
    btnDeclineTrade: document.getElementById('btn-decline-trade'),

    // DISCONNECT WAITING MODAL
    modalDisconnectWait: document.getElementById('modal-disconnect-wait'),
    disconnectPlayerNameMsg: document.getElementById('disconnect-player-name-msg'),
    disconnectCountdownTimer: document.getElementById('disconnect-countdown-timer'),

    // Top Bar 3D and Settings Buttons
    btnToggle3D: document.getElementById('btn-toggle-3d'),
    label3DToggle: document.getElementById('label-3d-toggle'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    btnWelcomeSettings: document.getElementById('btn-welcome-settings'),
    btnLobbySettings: document.getElementById('btn-lobby-settings'),

    // SETTINGS MODAL
    modalSettings: document.getElementById('modal-settings'),
    btnCloseSettingsModal: document.getElementById('btn-close-settings-modal'),
    btnMode2D: document.getElementById('btn-mode-2d'),
    btnMode3D: document.getElementById('btn-mode-3d'),
    settings3DControls: document.getElementById('settings-3d-controls'),
    sliderTiltX: document.getElementById('slider-tilt-x'),
    labelTiltX: document.getElementById('label-tilt-x'),
    sliderRotZ: document.getElementById('slider-rot-z'),
    labelRotZ: document.getElementById('label-rot-z'),
    themeCards: document.querySelectorAll('.theme-card'),
    settingSoundEnabled: document.getElementById('setting-sound-enabled'),
    settingSnowEnabled: document.getElementById('setting-snow-enabled'),
    settingAnimSpeed: document.getElementById('setting-anim-speed'),
    btnSaveSettings: document.getElementById('btn-save-settings'),

    // Board Wrapper
    boardWrapper: document.querySelector('.board-wrapper'),

    // GAME OVER MODAL
    gameDurationTag: document.getElementById('game-duration-tag'),
    winnerName: document.getElementById('winner-name'),
    winnerIcon: document.getElementById('winner-icon'),
    winnerStats: document.getElementById('winner-stats'),
    playersRankingList: document.getElementById('players-ranking-list'),
    btnRestartGame: document.getElementById('btn-restart-game'),
    btnLeaveToMain: document.getElementById('btn-leave-to-main'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),

    // Auth & Profile
    btnOpenTgAuth: document.getElementById('btn-open-tg-auth'),
    btnOpenLeaderboard: document.getElementById('btn-open-leaderboard'),
    userProfileBadge: document.getElementById('user-profile-badge'),
    userBadgeAvatar: document.getElementById('user-badge-avatar'),
    userBadgePlaceholder: document.getElementById('user-badge-placeholder'),
    userBadgeName: document.getElementById('user-badge-name'),
    userBadgeRating: document.getElementById('user-badge-rating'),

    // Profile & Leaderboard Modal
    modalProfile: document.getElementById('modal-profile'),
    btnCloseProfile: document.getElementById('btn-close-profile'),
    tabProfileStats: document.getElementById('tab-profile-stats'),
    tabProfileLeaderboard: document.getElementById('tab-profile-leaderboard'),
    panelProfileStats: document.getElementById('panel-profile-stats'),
    panelProfileLeaderboard: document.getElementById('panel-profile-leaderboard'),
    profileAvatarImg: document.getElementById('profile-avatar-img'),
    profileAvatarPlaceholder: document.getElementById('profile-avatar-placeholder'),
    profileFullName: document.getElementById('profile-full-name'),
    profileUsername: document.getElementById('profile-username'),
    profileRatingVal: document.getElementById('profile-rating-val'),
    statWins: document.getElementById('stat-wins'),
    statGames: document.getElementById('stat-games'),
    statWinrate: document.getElementById('stat-winrate'),
    statCapital: document.getElementById('stat-capital'),
    btnLogoutTelegram: document.getElementById('btn-logout-telegram'),
    btnRefreshLeaderboard: document.getElementById('btn-refresh-leaderboard'),
    leaderboardList: document.getElementById('leaderboard-list'),

    // Telegram Login Modal
    modalTelegramLogin: document.getElementById('modal-telegram-login'),
    btnCloseTgLogin: document.getElementById('btn-close-tg-login'),
    btnDemoTgLogin: document.getElementById('btn-demo-tg-login'),
    inputDemoTgName: document.getElementById('input-demo-tg-name'),
    inputCustomBotName: document.getElementById('input-custom-bot-name'),
    btnApplyBotName: document.getElementById('btn-apply-bot-name'),
    telegramWidgetWrapper: document.getElementById('telegram-widget-wrapper'),
    linkOpenTerms: document.getElementById('link-open-terms'),
    linkOpenPrivacy: document.getElementById('link-open-privacy'),

    // Legal Modal
    modalLegal: document.getElementById('modal-legal'),
    btnCloseLegal: document.getElementById('btn-close-legal'),
    btnAgreeLegal: document.getElementById('btn-agree-legal'),
    tabLegalTerms: document.getElementById('tab-legal-terms'),
    tabLegalPrivacy: document.getElementById('tab-legal-privacy'),
    panelLegalTerms: document.getElementById('panel-legal-terms'),
    panelLegalPrivacy: document.getElementById('panel-legal-privacy')
  };

  // Unread chat counter & active tab
  let unreadChatCount = 0;
  let activeTab = 'logs';

  // --- Initial Setup ---
  function init() {
    state.boardRenderer = new BoardRenderer('board-tiles-grid');
    state.boardRenderer.setOnTileClickListener((index) => openTileDetailsModal(index));
    state.snowOverlay = new SnowOverlay('snow-canvas', 48);
    loadSavedSettings();
    initTelegramAuth();
    setupEventListeners();
    checkSavedSession();
    handleUrlParams();
    socket.emit('get_rooms_list');
  }

  let activeBotUsername = '';

  function loadTelegramConfig() {
    fetch('/api/auth/config')
      .then(r => r.json())
      .then(data => {
        if (data && data.botUsername) {
          activeBotUsername = data.botUsername.replace(/^@/, '');
          if (elements.inputCustomBotName) elements.inputCustomBotName.value = `@${activeBotUsername}`;
          renderTelegramWidget(activeBotUsername);
        }
      })
      .catch(() => {});
  }

  function renderTelegramWidget(botUsername) {
    const cleanBot = (botUsername || '').trim().replace(/^@/, '');
    if (!cleanBot || !elements.telegramWidgetWrapper) return;

    activeBotUsername = cleanBot;
    elements.telegramWidgetWrapper.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted);">Загрузка виджета Telegram...</div>';

    // Telegram global callback
    window.onTelegramAuth = (user) => {
      socket.emit('auth_telegram', { authData: user }, (res) => {
        if (res && res.success) {
          handleAuthSuccess(res.user, res.token);
        } else {
          showToast(res ? res.error : 'Ошибка верификации Telegram', 'error');
        }
      });
    };

    setTimeout(() => {
      elements.telegramWidgetWrapper.innerHTML = '';
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', cleanBot);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '20');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      elements.telegramWidgetWrapper.appendChild(script);
    }, 50);
  }

  // --- Telegram Auth & User Profile Controller ---
  function initTelegramAuth() {
    loadTelegramConfig();

    // 1. Check if launched inside Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
      const initData = window.Telegram.WebApp.initData;
      socket.emit('auth_telegram', { authData: initData }, (res) => {
        if (res && res.success) {
          handleAuthSuccess(res.user, res.token, false);
        }
      });
    } else {
      // 2. Check saved session
      const savedUserStr = localStorage.getItem(STORAGE_TG_USER_KEY);
      const savedToken = localStorage.getItem(STORAGE_TG_TOKEN_KEY);
      if (savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          state.currentUser = user;
          state.authToken = savedToken;
          updateAuthUI();
          // Fetch freshest stats in background
          fetch(`/api/user/${user.telegramId}`)
            .then(r => r.json())
            .then(data => {
              if (data && data.success && data.user) {
                state.currentUser = data.user;
                localStorage.setItem(STORAGE_TG_USER_KEY, JSON.stringify(data.user));
                updateAuthUI();
              }
            })
            .catch(() => {});
        } catch (e) {
          localStorage.removeItem(STORAGE_TG_USER_KEY);
        }
      }
    }
  }

  function handleAuthSuccess(user, token, showGreeting = true) {
    state.currentUser = user;
    state.authToken = token;
    localStorage.setItem(STORAGE_TG_USER_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(STORAGE_TG_TOKEN_KEY, token);

    // Auto-fill player name
    if (elements.inputPlayerName) {
      elements.inputPlayerName.value = user.firstName || user.username || 'Игрок';
    }

    updateAuthUI();
    if (elements.modalTelegramLogin) elements.modalTelegramLogin.style.display = 'none';

    if (showGreeting) {
      showToast(`Добро пожаловать, ${user.firstName || user.username}! ⭐ Рейтинг: ${user.rating || 1000}`, 'success', 3000);
    }
  }

  function updateAuthUI() {
    const user = state.currentUser;
    if (user) {
      if (elements.btnOpenTgAuth) elements.btnOpenTgAuth.style.display = 'none';
      if (elements.userProfileBadge) {
        elements.userProfileBadge.style.display = 'flex';
        elements.userBadgeName.textContent = user.firstName || user.username || 'Игрок';
        elements.userBadgeRating.textContent = `⭐ ${user.rating || 1000}`;
        if (user.avatarUrl) {
          elements.userBadgeAvatar.src = user.avatarUrl;
          elements.userBadgeAvatar.style.display = 'block';
          elements.userBadgePlaceholder.style.display = 'none';
        } else {
          elements.userBadgeAvatar.style.display = 'none';
          elements.userBadgePlaceholder.style.display = 'flex';
          elements.userBadgePlaceholder.textContent = (user.firstName || user.username || 'U').charAt(0).toUpperCase();
        }
      }
    } else {
      if (elements.btnOpenTgAuth) elements.btnOpenTgAuth.style.display = 'inline-flex';
      if (elements.userProfileBadge) elements.userProfileBadge.style.display = 'none';
    }
  }

  function logoutTelegram() {
    state.currentUser = null;
    state.authToken = null;
    localStorage.removeItem(STORAGE_TG_USER_KEY);
    localStorage.removeItem(STORAGE_TG_TOKEN_KEY);
    updateAuthUI();
    if (elements.modalProfile) elements.modalProfile.style.display = 'none';
    showToast('Вы вышли из профиля (активен гостевой режим)', 'info', 2000);
  }

  function openProfileModal(initialTab = 'stats') {
    if (!elements.modalProfile) return;
    elements.modalProfile.style.display = 'flex';
    switchProfileTab(initialTab);
  }

  function switchProfileTab(tabName) {
    if (tabName === 'stats') {
      if (elements.tabProfileStats) elements.tabProfileStats.classList.add('active');
      if (elements.tabProfileLeaderboard) elements.tabProfileLeaderboard.classList.remove('active');
      if (elements.panelProfileStats) elements.panelProfileStats.style.display = 'flex';
      if (elements.panelProfileLeaderboard) elements.panelProfileLeaderboard.style.display = 'none';
      renderProfileStats();
    } else {
      if (elements.tabProfileLeaderboard) elements.tabProfileLeaderboard.classList.add('active');
      if (elements.tabProfileStats) elements.tabProfileStats.classList.remove('active');
      if (elements.panelProfileLeaderboard) elements.panelProfileLeaderboard.style.display = 'flex';
      if (elements.panelProfileStats) elements.panelProfileStats.style.display = 'none';
      fetchAndRenderLeaderboard();
    }
  }

  function renderProfileStats() {
    const user = state.currentUser;
    if (!user) {
      if (elements.profileFullName) elements.profileFullName.textContent = 'Гость';
      if (elements.profileUsername) elements.profileUsername.textContent = 'Авторизация не выполнена';
      if (elements.profileRatingVal) elements.profileRatingVal.textContent = '⭐ 1000';
      if (elements.statWins) elements.statWins.textContent = '0';
      if (elements.statGames) elements.statGames.textContent = '0';
      if (elements.statWinrate) elements.statWinrate.textContent = '0%';
      if (elements.statCapital) elements.statCapital.textContent = '$0';
      if (elements.btnLogoutTelegram) {
        elements.btnLogoutTelegram.textContent = '✈️ Войти через Telegram';
        elements.btnLogoutTelegram.className = 'btn-telegram-auth';
        elements.btnLogoutTelegram.onclick = () => {
          elements.modalProfile.style.display = 'none';
          elements.modalTelegramLogin.style.display = 'flex';
        };
      }
      return;
    }

    if (elements.profileFullName) elements.profileFullName.textContent = user.firstName + (user.lastName ? ` ${user.lastName}` : '');
    if (elements.profileUsername) elements.profileUsername.textContent = user.username ? `@${user.username}` : `ID: ${user.telegramId}`;
    if (elements.profileRatingVal) elements.profileRatingVal.textContent = `⭐ ${user.rating || 1000}`;
    if (elements.statWins) elements.statWins.textContent = user.wins || 0;
    if (elements.statGames) elements.statGames.textContent = user.gamesPlayed || 0;
    if (elements.statWinrate) elements.statWinrate.textContent = `${user.winRate || 0}%`;
    if (elements.statCapital) elements.statCapital.textContent = `$${(user.totalMoneyEarned || 0).toLocaleString()}`;

    if (user.avatarUrl) {
      if (elements.profileAvatarImg) {
        elements.profileAvatarImg.src = user.avatarUrl;
        elements.profileAvatarImg.style.display = 'block';
      }
      if (elements.profileAvatarPlaceholder) elements.profileAvatarPlaceholder.style.display = 'none';
    } else {
      if (elements.profileAvatarImg) elements.profileAvatarImg.style.display = 'none';
      if (elements.profileAvatarPlaceholder) {
        elements.profileAvatarPlaceholder.style.display = 'flex';
        elements.profileAvatarPlaceholder.textContent = (user.firstName || 'U').charAt(0).toUpperCase();
      }
    }

    if (elements.btnLogoutTelegram) {
      elements.btnLogoutTelegram.textContent = '🚪 Выйти из аккаунта (Перейти в гостевой режим)';
      elements.btnLogoutTelegram.className = 'btn-danger';
      elements.btnLogoutTelegram.onclick = logoutTelegram;
    }
  }

  async function fetchAndRenderLeaderboard() {
    if (!elements.leaderboardList) return;
    elements.leaderboardList.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">⏳ Загрузка таблицы лидеров...</div>';

    try {
      const res = await fetch('/api/leaderboard?limit=25');
      const data = await res.json();
      if (!data.success || !data.leaderboard || data.leaderboard.length === 0) {
        elements.leaderboardList.innerHTML = '<div style="text-align:center; padding: 24px; color: var(--text-muted);">Пока нет сыгранных рейтинговых партий.<br>Будьте первым в топе! 🎲</div>';
        return;
      }

      elements.leaderboardList.innerHTML = '';
      data.leaderboard.forEach((item, index) => {
        const row = document.createElement('div');
        const isMe = state.currentUser && String(state.currentUser.telegramId) === String(item.telegramId);
        row.className = `leaderboard-row ${isMe ? 'is-current-user' : ''}`;

        let rankBadgeClass = '';
        let rankText = `#${index + 1}`;
        if (index === 0) { rankBadgeClass = 'rank-1'; rankText = '🥇'; }
        else if (index === 1) { rankBadgeClass = 'rank-2'; rankText = '🥈'; }
        else if (index === 2) { rankBadgeClass = 'rank-3'; rankText = '🥉'; }

        const avatarHtml = item.avatarUrl
          ? `<img class="leaderboard-avatar-img" src="${item.avatarUrl}" alt="avatar">`
          : `<div class="leaderboard-avatar-placeholder">${(item.displayName || 'U').charAt(0).toUpperCase()}</div>`;

        row.innerHTML = `
          <div class="leaderboard-rank-badge ${rankBadgeClass}">${rankText}</div>
          <div class="leaderboard-player-info">
            ${avatarHtml}
            <div class="leaderboard-names">
              <span class="leaderboard-name">${escapeHtml(item.displayName)}</span>
              <span class="leaderboard-username">${item.username ? `@${escapeHtml(item.username)}` : ''}</span>
            </div>
          </div>
          <div class="leaderboard-stats-right">
            <div class="leaderboard-rating-chip">⭐ ${item.rating}</div>
            <div class="leaderboard-wins-chip">🏆 ${item.wins} / 🎮 ${item.gamesPlayed}</div>
          </div>
        `;
        elements.leaderboardList.appendChild(row);
      });
    } catch (err) {
      elements.leaderboardList.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--danger);">Ошибка загрузки данных</div>';
    }
  }

  function openLegalModal(tab = 'terms') {
    if (!elements.modalLegal) return;
    elements.modalLegal.style.display = 'flex';
    switchLegalTab(tab);
  }

  function switchLegalTab(tab) {
    if (tab === 'terms') {
      if (elements.tabLegalTerms) elements.tabLegalTerms.classList.add('active');
      if (elements.tabLegalPrivacy) elements.tabLegalPrivacy.classList.remove('active');
      if (elements.panelLegalTerms) elements.panelLegalTerms.style.display = 'block';
      if (elements.panelLegalPrivacy) elements.panelLegalPrivacy.style.display = 'none';
    } else {
      if (elements.tabLegalPrivacy) elements.tabLegalPrivacy.classList.add('active');
      if (elements.tabLegalTerms) elements.tabLegalTerms.classList.remove('active');
      if (elements.panelLegalPrivacy) elements.panelLegalPrivacy.style.display = 'block';
      if (elements.panelLegalTerms) elements.panelLegalTerms.style.display = 'none';
    }
  }

  // Draft settings state for modal (applied ONLY on Save)
  let draftSettings = {
    theme: 'midnight',
    is3D: false,
    tiltX: 48,
    rotZ: -14,
    sound: true,
    speed: 180,
    uiScale: 1.0,
    snow: true
  };

  // --- Settings & Themes Management ---
  function loadSavedSettings() {
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'midnight';
    const saved3D = localStorage.getItem(STORAGE_VIEW_3D_KEY) === 'true';
    const savedTiltX = Number(localStorage.getItem(STORAGE_TILT_X_KEY)) || 48;
    const savedRotZ = Number(localStorage.getItem(STORAGE_ROT_Z_KEY)) || -14;
    const savedSpeed = Number(localStorage.getItem(STORAGE_ANIM_SPEED_KEY)) || 180;
    const savedScale = Number(localStorage.getItem(STORAGE_UI_SCALE_KEY)) || 1.0;
    const savedSnow = localStorage.getItem(STORAGE_SNOW_KEY);

    state.currentTheme = savedTheme;
    state.is3DView = saved3D;
    state.tiltX = savedTiltX;
    state.rotZ = savedRotZ;
    state.animSpeed = savedSpeed;
    state.uiScale = savedScale;
    state.snowEnabled = (savedSnow !== 'false'); // enabled by default

    applyTheme(savedTheme);
    set3DView(saved3D);
    apply3DAngles(savedTiltX, savedRotZ);
    applyUiScale(savedScale);
    if (state.snowOverlay) {
      state.snowOverlay.toggle(state.snowEnabled);
    }
  }

  function applyTheme(themeName) {
    state.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(STORAGE_THEME_KEY, themeName);
  }

  function set3DView(is3D) {
    state.is3DView = is3D;
    localStorage.setItem(STORAGE_VIEW_3D_KEY, is3D ? 'true' : 'false');

    const wrapper = document.querySelector('.board-wrapper') || elements.boardWrapper;
    if (wrapper) {
      if (is3D) {
        wrapper.classList.add('view-3d');
      } else {
        wrapper.classList.remove('view-3d');
      }
    }

    if (elements.label3DToggle) {
      elements.label3DToggle.textContent = is3D ? '📐 2D Вид' : '🕶️ 3D Вид';
    }
    if (elements.btnToggle3D) {
      elements.btnToggle3D.classList.toggle('btn-primary', is3D);
      elements.btnToggle3D.classList.toggle('btn-secondary', !is3D);
    }
  }

  function apply3DAngles(tiltX, rotZ) {
    state.tiltX = tiltX;
    state.rotZ = rotZ;
    document.documentElement.style.setProperty('--board-tilt-x', `${tiltX}deg`);
    document.documentElement.style.setProperty('--board-rot-z', `${rotZ}deg`);
    localStorage.setItem(STORAGE_TILT_X_KEY, tiltX);
    localStorage.setItem(STORAGE_ROT_Z_KEY, rotZ);
  }

  function applyUiScale(scale) {
    state.uiScale = scale;
    document.documentElement.style.setProperty('--ui-scale', scale);
    localStorage.setItem(STORAGE_UI_SCALE_KEY, scale);
  }

  function openSettingsModal() {
    // Populate draft settings strictly from active state
    draftSettings = {
      theme: state.currentTheme || 'midnight',
      is3D: state.is3DView || false,
      tiltX: state.tiltX || 48,
      rotZ: state.rotZ || -14,
      sound: window.soundEngine ? !window.soundEngine.isMuted : true,
      speed: state.animSpeed || 180,
      uiScale: state.uiScale || 1.0,
      snow: (state.snowEnabled !== undefined) ? state.snowEnabled : true
    };

    syncSettingsModalUI();
    elements.modalSettings.style.display = 'flex';
  }

  function syncSettingsModalUI() {
    // 2D vs 3D buttons
    if (elements.btnMode2D && elements.btnMode3D) {
      elements.btnMode2D.classList.toggle('active', !draftSettings.is3D);
      elements.btnMode3D.classList.toggle('active', draftSettings.is3D);
    }
    if (elements.settings3DControls) {
      elements.settings3DControls.style.display = draftSettings.is3D ? 'flex' : 'none';
    }

    // Sliders
    if (elements.sliderTiltX) elements.sliderTiltX.value = draftSettings.tiltX;
    if (elements.labelTiltX) elements.labelTiltX.textContent = `${draftSettings.tiltX}°`;
    if (elements.sliderRotZ) elements.sliderRotZ.value = draftSettings.rotZ;
    if (elements.labelRotZ) elements.labelRotZ.textContent = `${draftSettings.rotZ}°`;

    // Theme cards
    if (elements.themeCards) {
      elements.themeCards.forEach(card => {
        card.classList.toggle('active', card.dataset.theme === draftSettings.theme);
      });
    }

    // UI Scale buttons
    document.querySelectorAll('.btn-ui-scale').forEach(btn => {
      const s = Number(btn.dataset.scale);
      btn.classList.toggle('active', Math.abs(s - draftSettings.uiScale) < 0.05);
    });

    // Sound & Speed & Snow
    if (elements.settingSoundEnabled) {
      elements.settingSoundEnabled.checked = draftSettings.sound;
    }
    if (elements.settingSnowEnabled) {
      elements.settingSnowEnabled.checked = draftSettings.snow;
    }
    if (elements.settingAnimSpeed) {
      elements.settingAnimSpeed.value = draftSettings.speed;
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error' || type === 'danger') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-text">${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- Session Management ---
  function checkSavedSession() {
    const savedRoom = localStorage.getItem(STORAGE_ROOM_KEY);
    const savedPlayer = localStorage.getItem(STORAGE_PLAYER_KEY);
    const savedName = localStorage.getItem(STORAGE_NAME_KEY);

    if (savedName) {
      elements.inputPlayerName.value = savedName;
    }

    if (savedRoom && savedPlayer) {
      elements.reconnectBanner.style.display = 'flex';
      elements.reconnectBanner.querySelector('.saved-room-code').textContent = savedRoom;
    } else {
      elements.reconnectBanner.style.display = 'none';
    }
  }

  function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      elements.inputRoomCode.value = roomParam.toUpperCase();
    }
  }

  function saveSession(roomId, playerId, playerName) {
    state.roomId = roomId;
    state.playerId = playerId;
    state.playerName = playerName;
    localStorage.setItem(STORAGE_ROOM_KEY, roomId);
    localStorage.setItem(STORAGE_PLAYER_KEY, playerId);
    localStorage.setItem(STORAGE_NAME_KEY, playerName);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_ROOM_KEY);
    localStorage.removeItem(STORAGE_PLAYER_KEY);
    state.roomId = null;
    state.playerId = null;
    elements.reconnectBanner.style.display = 'none';
  }

  // --- UI Screen Switching ---
  function showScreen(screenName) {
    elements.screenWelcome.style.display = screenName === 'welcome' ? 'flex' : 'none';
    elements.screenLobby.style.display = screenName === 'lobby' ? 'flex' : 'none';
    elements.screenGame.style.display = screenName === 'game' ? 'grid' : 'none';
    if (screenName !== 'game_over') {
      elements.modalGameOver.style.display = 'none';
    }
    if (screenName === 'welcome') {
      socket.emit('get_rooms_list');
    }
  }

  // --- Public Rooms Rendering ---
  function renderPublicRooms(rooms) {
    if (!elements.publicRoomsList) return;
    elements.publicRoomsList.innerHTML = '';

    if (!rooms || rooms.length === 0) {
      elements.publicRoomsList.innerHTML = `
        <div class="empty-rooms-placeholder">
          <div class="empty-icon">🎲</div>
          <div class="empty-title">Нет открытых столов</div>
          <div class="empty-desc">Создайте свой стол или войдите по коду от друга!</div>
        </div>
      `;
      return;
    }

    rooms.forEach(room => {
      const card = document.createElement('div');
      card.className = 'public-room-card';

      const playersDots = room.players.map(p => 
        `<span class="player-preview-dot" style="background-color: ${p.color.hex};" title="${escapeHtml(p.name)}">${p.color.icon}</span>`
      ).join('');

      card.innerHTML = `
        <div class="room-card-info">
          <div class="room-card-header">
            <span class="room-card-code">[${escapeHtml(room.roomId)}]</span>
            <span class="room-card-host">Хост: <strong>${escapeHtml(room.hostName)}</strong></span>
          </div>
          <div class="room-players-preview">
            ${playersDots}
            <span class="room-card-capacity">${room.playersCount} / ${room.maxPlayers} игр.</span>
          </div>
        </div>
        <button class="btn-primary room-join-btn" data-room-code="${escapeHtml(room.roomId)}">
          Войти 👉
        </button>
      `;

      card.querySelector('.room-join-btn').addEventListener('click', () => {
        joinRoomByCode(room.roomId);
      });

      elements.publicRoomsList.appendChild(card);
    });
  }

  function joinRoomByCode(code) {
    const name = elements.inputPlayerName.value.trim() || 'Игрок';
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      showToast('Пожалуйста, введите код комнаты', 'warning');
      return;
    }

    let existingId = localStorage.getItem(STORAGE_PLAYER_KEY);
    if (!existingId) {
      existingId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }

    const payload = {
      roomId: cleanCode,
      playerName: name,
      playerId: existingId,
      telegramId: state.currentUser ? state.currentUser.telegramId : null,
      avatarUrl: state.currentUser ? state.currentUser.avatarUrl : null,
      username: state.currentUser ? state.currentUser.username : null
    };

    socket.emit('join_room', payload, (res) => {
      if (res && res.success) {
        saveSession(res.roomId, res.playerId, name);
        state.isHost = res.state.hostId === res.playerId;
        showToast(`Вы присоединились к комнате ${res.roomId}!`, 'success');
        if (res.state.status === 'LOBBY') {
          updateLobbyView(res.state);
        } else {
          updateGameView(res.state);
        }
      } else {
        showToast(res ? res.error : 'Не удалось войти в комнату', 'error');
      }
    });
  }

  // --- Turn Timer Management ---
  function startTurnTimer(seconds = 60) {
    if (state.turnTimerInterval) {
      clearInterval(state.turnTimerInterval);
    }
    state.currentTimerSeconds = seconds;
    updateTimerVisuals();

    state.turnTimerInterval = setInterval(() => {
      state.currentTimerSeconds--;
      if (state.currentTimerSeconds < 0) {
        state.currentTimerSeconds = 0;
        clearInterval(state.turnTimerInterval);
      }
      updateTimerVisuals();
    }, 1000);
  }

  function updateTimerVisuals() {
    if (!elements.turnTimerFill || !elements.turnTimerText) return;
    const maxSec = 60;
    const percent = Math.max(0, Math.min(100, (state.currentTimerSeconds / maxSec) * 100));
    elements.turnTimerFill.style.width = `${percent}%`;
    elements.turnTimerText.textContent = `${state.currentTimerSeconds}с`;
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // 3D View Toggle
    if (elements.btnToggle3D) {
      elements.btnToggle3D.addEventListener('click', () => {
        set3DView(!state.is3DView);
        showToast(state.is3DView ? 'Включен 3D объёмный режим 🕶️' : 'Включен 2D классический вид 📐', 'info', 2000);
      });
    }

    // Settings Modal Open / Close
    if (elements.btnOpenSettings) elements.btnOpenSettings.addEventListener('click', openSettingsModal);
    if (elements.btnWelcomeSettings) elements.btnWelcomeSettings.addEventListener('click', openSettingsModal);
    if (elements.btnLobbySettings) elements.btnLobbySettings.addEventListener('click', openSettingsModal);

    if (elements.btnCloseSettingsModal) {
      elements.btnCloseSettingsModal.addEventListener('click', () => {
        elements.modalSettings.style.display = 'none';
      });
    }

    // Modal Background Click (Cancel / Close without applying)
    if (elements.modalSettings) {
      elements.modalSettings.addEventListener('click', (e) => {
        if (e.target === elements.modalSettings) {
          elements.modalSettings.style.display = 'none';
        }
      });
    }

    // 2D vs 3D Mode in Settings (Draft only)
    if (elements.btnMode2D) {
      elements.btnMode2D.addEventListener('click', () => {
        draftSettings.is3D = false;
        syncSettingsModalUI();
      });
    }
    if (elements.btnMode3D) {
      elements.btnMode3D.addEventListener('click', () => {
        draftSettings.is3D = true;
        syncSettingsModalUI();
      });
    }

    // 3D Angle Sliders in Settings (Draft only)
    if (elements.sliderTiltX) {
      elements.sliderTiltX.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        draftSettings.tiltX = val;
        if (elements.labelTiltX) elements.labelTiltX.textContent = `${val}°`;
      });
    }
    if (elements.sliderRotZ) {
      elements.sliderRotZ.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        draftSettings.rotZ = val;
        if (elements.labelRotZ) elements.labelRotZ.textContent = `${val}°`;
      });
    }

    // Themes Picker in Settings (Draft only)
    if (elements.themeCards) {
      elements.themeCards.forEach(card => {
        card.addEventListener('click', () => {
          draftSettings.theme = card.dataset.theme;
          syncSettingsModalUI();
        });
      });
    }

    // UI Scale Picker in Settings (Draft only)
    document.querySelectorAll('.btn-ui-scale').forEach(btn => {
      btn.addEventListener('click', () => {
        draftSettings.uiScale = Number(btn.dataset.scale);
        syncSettingsModalUI();
      });
    });

    // Sound & Speed & Snow in Settings (Draft only)
    if (elements.settingSoundEnabled) {
      elements.settingSoundEnabled.addEventListener('change', (e) => {
        draftSettings.sound = e.target.checked;
      });
    }
    if (elements.settingSnowEnabled) {
      elements.settingSnowEnabled.addEventListener('change', (e) => {
        draftSettings.snow = e.target.checked;
      });
    }
    if (elements.settingAnimSpeed) {
      elements.settingAnimSpeed.addEventListener('change', (e) => {
        draftSettings.speed = Number(e.target.value);
      });
    }

    // Save Settings Button (Applies all settings at once!)
    if (elements.btnSaveSettings) {
      elements.btnSaveSettings.addEventListener('click', () => {
        applyTheme(draftSettings.theme);
        set3DView(draftSettings.is3D);
        apply3DAngles(draftSettings.tiltX, draftSettings.rotZ);
        applyUiScale(draftSettings.uiScale);

        if (window.soundEngine) {
          window.soundEngine.isMuted = !draftSettings.sound;
          elements.soundIcon.textContent = draftSettings.sound ? '🔊' : '🔇';
        }

        state.snowEnabled = draftSettings.snow;
        localStorage.setItem(STORAGE_SNOW_KEY, state.snowEnabled ? 'true' : 'false');
        if (state.snowOverlay) {
          state.snowOverlay.toggle(state.snowEnabled);
        }

        state.animSpeed = draftSettings.speed;
        localStorage.setItem(STORAGE_ANIM_SPEED_KEY, draftSettings.speed);

        elements.modalSettings.style.display = 'none';
        showToast('Настройки успешно применены! ✅', 'success', 2000);
      });
    }

    // Sound Toggle
    elements.btnSoundToggle.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      elements.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      if (elements.settingSoundEnabled) elements.settingSoundEnabled.checked = !isMuted;
      showToast(isMuted ? 'Звук выключен' : 'Звук включен', 'info', 1500);
    });

    // Refresh Rooms List
    if (elements.btnRefreshRooms) {
      elements.btnRefreshRooms.addEventListener('click', () => {
        socket.emit('get_rooms_list');
        showToast('Список столов обновлен', 'info', 1200);
      });
    }

    // Auth & Profile Modal Openers
    if (elements.btnOpenTgAuth) {
      elements.btnOpenTgAuth.addEventListener('click', () => {
        if (elements.modalTelegramLogin) elements.modalTelegramLogin.style.display = 'flex';
      });
    }

    if (elements.userProfileBadge) {
      elements.userProfileBadge.addEventListener('click', () => {
        openProfileModal('stats');
      });
    }

    if (elements.btnOpenLeaderboard) {
      elements.btnOpenLeaderboard.addEventListener('click', () => {
        openProfileModal('leaderboard');
      });
    }

    if (elements.btnCloseProfile) {
      elements.btnCloseProfile.addEventListener('click', () => {
        if (elements.modalProfile) elements.modalProfile.style.display = 'none';
      });
    }

    if (elements.tabProfileStats) {
      elements.tabProfileStats.addEventListener('click', () => switchProfileTab('stats'));
    }

    if (elements.tabProfileLeaderboard) {
      elements.tabProfileLeaderboard.addEventListener('click', () => switchProfileTab('leaderboard'));
    }

    if (elements.btnRefreshLeaderboard) {
      elements.btnRefreshLeaderboard.addEventListener('click', () => fetchAndRenderLeaderboard());
    }

    if (elements.btnCloseTgLogin) {
      elements.btnCloseTgLogin.addEventListener('click', () => {
        if (elements.modalTelegramLogin) elements.modalTelegramLogin.style.display = 'none';
      });
    }

    // Demo / Fast Telegram Login
    if (elements.btnDemoTgLogin) {
      elements.btnDemoTgLogin.addEventListener('click', () => {
        const demoName = elements.inputDemoTgName ? elements.inputDemoTgName.value.trim() : 'Игрок Telegram';
        const demoId = `tg_${Math.floor(100000000 + Math.random() * 900000000)}`;
        const demoPayload = {
          id: demoId,
          first_name: demoName || 'Игрок',
          username: `player_${demoId.slice(-4)}`,
          isDemo: true
        };

        socket.emit('auth_telegram', { authData: demoPayload }, (res) => {
          if (res && res.success) {
            handleAuthSuccess(res.user, res.token);
          } else {
            showToast(res ? res.error : 'Ошибка авторизации', 'error');
          }
        });
      });
    }

    // Apply custom Telegram bot name
    if (elements.btnApplyBotName) {
      elements.btnApplyBotName.addEventListener('click', () => {
        const botName = elements.inputCustomBotName ? elements.inputCustomBotName.value.trim() : '';
        if (!botName) {
          showToast('Введите имя вашего Telegram-бота', 'warning');
          return;
        }
        renderTelegramWidget(botName);
        showToast(`Виджет для ${botName} загружен`, 'success', 2000);
      });
    }

    // Legal Modal Openers & Tabs
    if (elements.linkOpenTerms) {
      elements.linkOpenTerms.addEventListener('click', (e) => {
        e.preventDefault();
        openLegalModal('terms');
      });
    }

    if (elements.linkOpenPrivacy) {
      elements.linkOpenPrivacy.addEventListener('click', (e) => {
        e.preventDefault();
        openLegalModal('privacy');
      });
    }

    if (elements.btnCloseLegal) {
      elements.btnCloseLegal.addEventListener('click', () => {
        if (elements.modalLegal) elements.modalLegal.style.display = 'none';
      });
    }

    if (elements.btnAgreeLegal) {
      elements.btnAgreeLegal.addEventListener('click', () => {
        if (elements.modalLegal) elements.modalLegal.style.display = 'none';
      });
    }

    if (elements.tabLegalTerms) {
      elements.tabLegalTerms.addEventListener('click', () => switchLegalTab('terms'));
    }

    if (elements.tabLegalPrivacy) {
      elements.tabLegalPrivacy.addEventListener('click', () => switchLegalTab('privacy'));
    }

    // Create Room
    elements.btnCreateRoom.addEventListener('click', () => {
      const name = elements.inputPlayerName.value.trim() || 'Игрок 1';
      const isPrivate = elements.checkboxPrivateRoom ? elements.checkboxPrivateRoom.checked : false;

      let existingId = localStorage.getItem(STORAGE_PLAYER_KEY);
      if (!existingId) {
        existingId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      }

      const payload = {
        playerName: name,
        playerId: existingId,
        isPrivate,
        telegramId: state.currentUser ? state.currentUser.telegramId : null,
        avatarUrl: state.currentUser ? state.currentUser.avatarUrl : null,
        username: state.currentUser ? state.currentUser.username : null
      };

      socket.emit('create_room', payload, (res) => {
        if (res && res.success) {
          saveSession(res.roomId, res.playerId, name);
          state.isHost = true;
          showToast(`Комната ${res.roomId} успешно создана!`, 'success');
          updateLobbyView(res.state);
        } else {
          showToast(res ? res.error : 'Ошибка создания комнаты', 'error');
        }
      });
    });

    // Join Room
    elements.btnJoinRoom.addEventListener('click', () => {
      const code = elements.inputRoomCode.value.trim();
      joinRoomByCode(code);
    });

    // Resume Session
    elements.btnResumeSession.addEventListener('click', () => {
      const savedRoom = localStorage.getItem(STORAGE_ROOM_KEY);
      const savedPlayer = localStorage.getItem(STORAGE_PLAYER_KEY);
      if (savedRoom && savedPlayer) {
        socket.emit('reconnect_player', { roomId: savedRoom, playerId: savedPlayer }, (res) => {
          if (res && res.success) {
            state.roomId = res.roomId;
            state.playerId = res.playerId;
            state.isHost = res.state.hostId === res.playerId;
            showToast(`Успешное переподключение к комнате ${res.roomId}`, 'success');
            if (res.state.status === 'LOBBY') {
              updateLobbyView(res.state);
            } else {
              updateGameView(res.state);
            }
          } else {
            showToast('Сессия устарела или комната закрыта', 'warning');
            clearSession();
          }
        });
      }
    });

    elements.btnDiscardSession.addEventListener('click', () => {
      clearSession();
      showToast('Сохранённая сессия сброшена', 'info', 2000);
    });

    // Copy Code / Link
    const copyToClipboard = (text, message) => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast(message, 'success'));
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(message, 'success');
      }
    };

    elements.btnCopyLobbyCode.addEventListener('click', () => {
      copyToClipboard(state.roomId, `Код комнаты скопирован: ${state.roomId}`);
    });
    elements.btnCopyLobbyLink.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}?room=${state.roomId}`;
      copyToClipboard(url, 'Ссылка на комнату скопирована в буфер обмена!');
    });
    elements.btnCopyGameCode.addEventListener('click', () => {
      copyToClipboard(state.roomId, `Код комнаты скопирован: ${state.roomId}`);
    });

    // Start Game
    elements.btnStartGame.addEventListener('click', () => {
      socket.emit('start_game', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Не удалось начать игру', 'error');
        }
      });
    });

    const leaveCurrentRoom = () => {
      if (state.roomId && state.playerId) {
        socket.emit('leave_room', { roomId: state.roomId, playerId: state.playerId });
      }
      clearSession();
      state.roomId = null;
      state.gameState = null;
      showScreen('welcome');
      socket.emit('get_rooms_list');
    };

    elements.btnLeaveLobby.addEventListener('click', leaveCurrentRoom);
    if (elements.btnLeaveGame) {
      elements.btnLeaveGame.addEventListener('click', leaveCurrentRoom);
    }

    // Roll Dice
    elements.btnRollDice.addEventListener('click', () => {
      if (state.isRollingAnimation) return;
      socket.emit('roll_dice', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Не удалось бросить кубики', 'error');
        }
      });
    });

    // Buy Property
    elements.btnBuyProperty.addEventListener('click', () => {
      socket.emit('buy_property', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (res && res.success) {
          if (window.soundEngine) window.soundEngine.playBuy();
        } else {
          showToast(res ? res.error : 'Ошибка покупки недвижимости', 'error');
        }
      });
    });

    // Pass Property (Triggers Auction)
    elements.btnPassProperty.addEventListener('click', () => {
      socket.emit('pass_property', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Ошибка пропуска покупки', 'error');
        }
      });
    });

    // End Turn
    elements.btnEndTurn.addEventListener('click', () => {
      socket.emit('end_turn', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Не удалось завершить ход', 'error');
        }
      });
    });

    // Jail Actions
    elements.btnJailRoll.addEventListener('click', () => {
      socket.emit('roll_dice', { roomId: state.roomId, playerId: state.playerId });
    });

    elements.btnJailBail.addEventListener('click', () => {
      socket.emit('pay_jail_bail', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (res && res.success) {
          showToast('Залог оплачен! Вы вышли из тюрьмы', 'success');
        } else {
          showToast(res ? res.error : 'Ошибка оплаты залога', 'error');
        }
      });
    });

    elements.btnJailCard.addEventListener('click', () => {
      socket.emit('use_jail_card', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (res && res.success) {
          showToast('Использована карта бесплатного выхода!', 'success');
        } else {
          showToast(res ? res.error : 'Ошибка использования карты', 'error');
        }
      });
    });

    // Tile Details Modal Close
    if (elements.btnCloseTileDetails) {
      elements.btnCloseTileDetails.addEventListener('click', () => {
        elements.modalTileDetails.style.display = 'none';
        state.selectedTileIndex = null;
      });
    }

    if (elements.modalTileDetails) {
      elements.modalTileDetails.addEventListener('click', (e) => {
        if (e.target === elements.modalTileDetails) {
          elements.modalTileDetails.style.display = 'none';
          state.selectedTileIndex = null;
        }
      });
    }

    // Trade Modal Open / Close
    elements.btnOpenTrade.addEventListener('click', () => {
      openTradeModal();
    });
    elements.btnCloseTradeModal.addEventListener('click', () => {
      elements.modalTrade.style.display = 'none';
    });

    // Send Trade Proposal
    elements.btnSendTrade.addEventListener('click', () => {
      sendTradeProposal();
    });

    // Respond Trade (Accept / Decline)
    elements.btnAcceptTrade.addEventListener('click', () => {
      if (state.gameState && state.gameState.activeTrade) {
        socket.emit('respond_trade', {
          roomId: state.roomId,
          playerId: state.playerId,
          tradeId: state.gameState.activeTrade.id,
          action: 'ACCEPT'
        }, (res) => {
          elements.modalIncomingTrade.style.display = 'none';
          if (res && res.success) {
            showToast('Сделка успешно заключена!', 'success');
          } else {
            showToast(res ? res.error : 'Ошибка сделки', 'error');
          }
        });
      }
    });

    elements.btnDeclineTrade.addEventListener('click', () => {
      if (state.gameState && state.gameState.activeTrade) {
        socket.emit('respond_trade', {
          roomId: state.roomId,
          playerId: state.playerId,
          tradeId: state.gameState.activeTrade.id,
          action: 'DECLINE'
        }, () => {
          elements.modalIncomingTrade.style.display = 'none';
        });
      }
    });

    // Auction Quick Bids
    document.querySelectorAll('.btn-quick-bid').forEach(btn => {
      btn.addEventListener('click', () => {
        const inc = Number(btn.dataset.inc);
        if (state.gameState && state.gameState.activeAuction) {
          const newBid = state.gameState.activeAuction.currentBid + inc;
          socket.emit('place_bid', { roomId: state.roomId, playerId: state.playerId, amount: newBid }, (res) => {
            if (!res || !res.success) {
              showToast(res ? res.error : 'Ошибка ставки', 'error');
            }
          });
        }
      });
    });

    // Place Custom Bid
    elements.btnPlaceBid.addEventListener('click', () => {
      const val = Number(elements.inputCustomBid.value);
      if (!val || isNaN(val)) {
        showToast('Введите корректную сумму ставки', 'warning');
        return;
      }
      socket.emit('place_bid', { roomId: state.roomId, playerId: state.playerId, amount: val }, (res) => {
        if (res && res.success) {
          elements.inputCustomBid.value = '';
        } else {
          showToast(res ? res.error : 'Ошибка ставки', 'error');
        }
      });
    });

    // Pass Auction Bid
    elements.btnPassBid.addEventListener('click', () => {
      socket.emit('pass_bid', { roomId: state.roomId, playerId: state.playerId }, (res) => {
        if (!res || !res.success) {
          showToast(res ? res.error : 'Ошибка паса', 'error');
        }
      });
    });

    // Host End Game
    elements.btnHostEndGame.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите досрочно завершить игру? Победитель будет определён по капиталу.')) {
        socket.emit('end_game', { roomId: state.roomId, playerId: state.playerId });
      }
    });

    // Restart Game
    elements.btnRestartGame.addEventListener('click', () => {
      socket.emit('restart_game', { roomId: state.roomId, playerId: state.playerId });
    });

    elements.btnLeaveToMain.addEventListener('click', leaveCurrentRoom);

    // Chat Tabs
    elements.tabLogsBtn.addEventListener('click', () => {
      activeTab = 'logs';
      elements.tabLogsBtn.classList.add('tab-active');
      elements.tabChatBtn.classList.remove('tab-active');
      elements.panelLogs.style.display = 'flex';
      elements.panelChat.style.display = 'none';
    });

    elements.tabChatBtn.addEventListener('click', () => {
      activeTab = 'chat';
      unreadChatCount = 0;
      elements.chatBadge.style.display = 'none';
      elements.tabChatBtn.classList.add('tab-active');
      elements.tabLogsBtn.classList.remove('tab-active');
      elements.panelChat.style.display = 'flex';
      elements.panelLogs.style.display = 'none';
      elements.inputChatMessage.focus();
    });

    // Chat Message
    const sendChat = () => {
      const msg = elements.inputChatMessage.value.trim();
      if (!msg) return;

      socket.emit('send_chat', {
        roomId: state.roomId,
        playerId: state.playerId,
        message: msg
      });
      elements.inputChatMessage.value = '';
    };

    elements.btnSendChat.addEventListener('click', sendChat);
    elements.inputChatMessage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChat();
    });

    // --- Socket Server Events ---
    socket.on('rooms_list_updated', (rooms) => {
      renderPublicRooms(rooms);
    });

    socket.on('game_state_updated', (gameState) => {
      state.gameState = gameState;
      state.isHost = gameState.hostId === state.playerId;

      if (gameState.status === 'LOBBY') {
        updateLobbyView(gameState);
      } else if (gameState.status === 'GAME_OVER') {
        updateGameOverView(gameState);
      } else {
        updateGameView(gameState);
      }
    });

    // Trade proposed event notification
    socket.on('trade_proposed', ({ trade }) => {
      if (trade.toPlayerId === state.playerId) {
        showIncomingTradeModal(trade);
      }
    });

    // Player Rolled animation
    socket.on('player_rolled', (data) => {
      handlePlayerRolled(data);
    });

    // Chat Message
    socket.on('chat_message', (chat) => {
      appendChatMessage(chat);
    });

    // Error Notification
    socket.on('error_notification', ({ message }) => {
      showToast(message, 'error');
    });
  }

  // --- View Updates ---

  function updateLobbyView(gameState) {
    showScreen('lobby');
    elements.lobbyRoomCode.textContent = gameState.roomId;
    elements.lobbyPlayerCount.textContent = `${gameState.players.length} / 6`;

    elements.lobbyPlayersList.innerHTML = '';
    gameState.players.forEach((p) => {
      const isHost = p.id === gameState.hostId;
      const isMe = p.id === state.playerId;

      const playerCard = document.createElement('div');
      playerCard.className = `lobby-player-card ${isMe ? 'is-self' : ''}`;
      playerCard.innerHTML = `
        <div class="lobby-player-avatar" style="background-color: ${p.color.hex}; color: ${p.color.text}">
          ${p.color.icon}
        </div>
        <div class="lobby-player-info">
          <div class="lobby-player-name">
            ${escapeHtml(p.name)} ${isMe ? '<span class="self-tag">(Вы)</span>' : ''}
          </div>
          <div class="lobby-player-color">${p.color.name} цвет</div>
        </div>
        ${isHost ? '<span class="badge badge-host">👑 Хост</span>' : ''}
      `;
      elements.lobbyPlayersList.appendChild(playerCard);
    });

    const isMeHost = gameState.hostId === state.playerId;
    if (isMeHost) {
      elements.btnStartGame.style.display = 'block';
      elements.lobbyWaitingNotice.style.display = 'none';
      if (gameState.players.length >= 2) {
        elements.btnStartGame.removeAttribute('disabled');
        elements.btnStartGame.classList.add('btn-pulse');
      } else {
        elements.btnStartGame.setAttribute('disabled', 'true');
        elements.btnStartGame.classList.remove('btn-pulse');
      }
    } else {
      elements.btnStartGame.style.display = 'none';
      elements.lobbyWaitingNotice.style.display = 'block';
    }
  }

  function updateGameView(gameState) {
    showScreen('game');
    elements.gameRoomCode.textContent = gameState.roomId;

    if (state.boardRenderer && state.boardRenderer.tileElements.length === 0) {
      state.boardRenderer.init(gameState.board);
    }

    elements.btnHostEndGame.style.display = (gameState.hostId === state.playerId) ? 'inline-flex' : 'none';

    // Start / sync turn timer
    if (gameState.remainingTurnSeconds !== undefined) {
      startTurnTimer(gameState.remainingTurnSeconds);
    }

    // Update board tiles, buildings, mortgages
    state.boardRenderer.updateBoardState(gameState);

    // Update center turn banner
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (currentPlayer) {
      const isMyTurn = currentPlayer.id === state.playerId;
      elements.turnAvatar.style.backgroundColor = currentPlayer.color.hex;
      elements.turnAvatar.style.color = currentPlayer.color.text;
      elements.turnAvatar.textContent = currentPlayer.color.icon;
      elements.turnPlayerName.textContent = isMyTurn ? 'ВАШ ХОД!' : `Ход: ${currentPlayer.name}`;
      
      let statusDesc = '';
      if (gameState.status === 'ROLLING') {
        statusDesc = isMyTurn ? 'Бросьте кубики, чтобы сделать ход' : 'Ожидание броска кубиков...';
      } else if (gameState.status === 'AWAITING_ACTION') {
        statusDesc = isMyTurn ? 'Выберите действие с недвижимостью' : 'Принимает решение...';
      } else if (gameState.status === 'AUCTION') {
        statusDesc = 'Идут торги на аукционе!';
      } else if (gameState.status === 'TURN_END') {
        statusDesc = isMyTurn ? 'Завершите свой ход' : 'Завершает ход...';
      }
      elements.turnStatusText.textContent = statusDesc;

      updateActionControls(gameState, isMyTurn);
    }

    // Render dice
    renderDiceFaces(gameState.lastDice.die1, gameState.lastDice.die2);

    // Update Auction Modal
    updateAuctionModal(gameState);

    // Update Incoming Trade Modal
    if (gameState.activeTrade && gameState.activeTrade.toPlayerId === state.playerId && gameState.activeTrade.status === 'PENDING') {
      showIncomingTradeModal(gameState.activeTrade);
    } else {
      elements.modalIncomingTrade.style.display = 'none';
    }

    // Update Disconnect Waiting Modal
    updateDisconnectWaitModal(gameState);

    // Live update Tile Details modal if currently open
    if (elements.modalTileDetails && elements.modalTileDetails.style.display === 'flex' && state.selectedTileIndex !== null) {
      openTileDetailsModal(state.selectedTileIndex);
    }

    // Sidebar updates
    renderPlayersSidebar(gameState);
    renderEventsLog(gameState.logs);
  }

  function updateDisconnectWaitModal(gameState) {
    if (!elements.modalDisconnectWait) return;

    if (gameState.disconnectWaitingState && gameState.status !== 'GAME_OVER') {
      elements.modalDisconnectWait.style.display = 'flex';
      const rem = Math.max(0, gameState.disconnectWaitingState.remainingSeconds || 0);
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      elements.disconnectCountdownTimer.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      elements.disconnectPlayerNameMsg.textContent = `Игрок ${escapeHtml(gameState.disconnectWaitingState.disconnectedPlayerName)} отключился. Ожидаем возвращения...`;
    } else {
      elements.modalDisconnectWait.style.display = 'none';
    }
  }

  function updateActionControls(gameState, isMyTurn) {
    elements.btnRollDice.style.display = 'none';
    elements.btnEndTurn.style.display = 'none';
    elements.propertyActionDialog.style.display = 'none';
    elements.jailActionsPanel.style.display = 'none';

    if (!isMyTurn) return;

    const me = gameState.players.find(p => p.id === state.playerId);

    if (me && me.inJail && gameState.status === 'ROLLING') {
      elements.jailActionsPanel.style.display = 'flex';
      elements.btnJailCard.style.display = (me.jailFreeCards > 0) ? 'inline-flex' : 'none';
      return;
    }

    if (gameState.status === 'ROLLING') {
      elements.btnRollDice.style.display = 'flex';
      elements.btnRollDice.classList.add('btn-pulse');
    } else if (gameState.status === 'AWAITING_ACTION' && gameState.pendingAction) {
      if (gameState.pendingAction.type === 'BUY_PROPERTY') {
        elements.propertyActionDialog.style.display = 'flex';
        elements.propertyCardColorBar.style.backgroundColor = gameState.pendingAction.color;
        elements.propertyCardName.textContent = gameState.pendingAction.name;
        elements.propertyCardPrice.textContent = `$${gameState.pendingAction.price}`;
        elements.propertyCardRent.textContent = `Рента: $${gameState.pendingAction.rent}`;

        if (me && me.money >= gameState.pendingAction.price) {
          elements.btnBuyProperty.removeAttribute('disabled');
        } else {
          elements.btnBuyProperty.setAttribute('disabled', 'true');
        }
      }
    } else if (gameState.status === 'TURN_END') {
      elements.btnEndTurn.style.display = 'flex';
      elements.btnEndTurn.classList.add('btn-pulse');
    }
  }

  // --- Auction Modal UI ---
  function updateAuctionModal(gameState) {
    if (gameState.status === 'AUCTION' && gameState.activeAuction && !gameState.activeAuction.isCompleted) {
      const auction = gameState.activeAuction;
      elements.modalAuction.style.display = 'flex';
      elements.auctionTileName.textContent = auction.tileName;
      elements.auctionTileGroup.textContent = auction.groupName || 'Недвижимость';
      elements.auctionCurrentBid.textContent = `$${auction.currentBid}`;
      elements.auctionHighestBidder.textContent = auction.highestBidderName
        ? `Лидер: ${auction.highestBidderName}`
        : 'Лидер: нет ставок';

      const isPassed = auction.passedBidders.includes(state.playerId);
      elements.btnPlaceBid.style.display = isPassed ? 'none' : 'inline-flex';
      elements.btnPassBid.style.display = isPassed ? 'none' : 'inline-flex';

      // Render bidders status
      elements.auctionBiddersList.innerHTML = '';
      gameState.players.forEach(p => {
        if (p.isBankrupt) return;
        const pill = document.createElement('div');
        const isHighest = p.id === auction.highestBidderId;
        const hasPassed = auction.passedBidders.includes(p.id);
        pill.className = `bidder-pill ${isHighest ? 'is-highest' : ''} ${hasPassed ? 'is-passed' : ''}`;
        pill.innerHTML = `
          <span style="color: ${p.color.hex}">${p.color.icon}</span>
          <span>${escapeHtml(p.name)}</span>
          ${isHighest ? '👑' : (hasPassed ? '❌' : '')}
        `;
        elements.auctionBiddersList.appendChild(pill);
      });
    } else {
      elements.modalAuction.style.display = 'none';
    }
  }

  // --- Interactive Tile Details & Direct Property Management UI ---
  function openTileDetailsModal(tileIndex) {
    if (!state.gameState || !state.gameState.board || !state.gameState.board[tileIndex]) return;
    state.selectedTileIndex = tileIndex;
    const tile = state.gameState.board[tileIndex];

    if (!elements.modalTileDetails) return;
    elements.modalTileDetails.style.display = 'flex';

    // Header color & group
    if (tile.color) {
      elements.tileDetailsColorBar.style.backgroundColor = tile.color;
      elements.tileDetailsGroupTag.textContent = `${tile.groupName || 'Район'}`;
    } else {
      elements.tileDetailsColorBar.style.backgroundColor = '#475569';
      elements.tileDetailsGroupTag.textContent = tile.type ? tile.type.toUpperCase() : 'КЛЕТКА';
    }

    const iconSvg = (window.PixelIcons && typeof window.PixelIcons.getTileIcon === 'function')
      ? window.PixelIcons.getTileIcon(tileIndex, tile)
      : (tile.icon || '📍');
    elements.tileDetailsIcon.innerHTML = iconSvg;
    elements.tileDetailsName.textContent = tile.name;

    if (tile.type === 'property') {
      elements.tileDetailsPrice.textContent = `Стоимость покупки: $${tile.price}`;
      elements.tileDetailsRentTableBox.style.display = 'flex';

      // Owner info
      if (tile.ownerId) {
        const owner = state.gameState.players.find(p => p.id === tile.ownerId);
        const isMe = (tile.ownerId === state.playerId);
        let statusBadge = '';
        if (tile.isMortgaged) {
          statusBadge = '<span class="badge badge-danger">🔒 ЗАЛОЖЕНО В БАНК</span>';
        } else if (tile.houses === 5) {
          statusBadge = '<span class="badge badge-success">🏨 ОТЕЛЬ</span>';
        } else if (tile.houses > 0) {
          statusBadge = `<span class="badge badge-turn">🏠 ${tile.houses} ДОМА</span>`;
        } else if (tile.isMonopoly) {
          statusBadge = '<span class="badge badge-host">👑 МОНОПОЛИЯ (x2)</span>';
        }

        elements.tileDetailsOwnerBanner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">${owner ? owner.color.icon : '👤'}</span>
            <div>
              <div style="font-weight: 700; color: ${owner ? owner.color.hex : '#fff'};">
                ${owner ? escapeHtml(owner.name) : 'Игрок'} ${isMe ? '<span class="self-tag">(Вы)</span>' : ''}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Текущая рента: $${tile.isMortgaged ? 0 : tile.currentRent}</div>
            </div>
          </div>
          <div>${statusBadge}</div>
        `;
      } else {
        elements.tileDetailsOwnerBanner.innerHTML = `
          <span style="color: var(--text-secondary);">🛒 Свободная улица — доступна для покупки при остановке</span>
        `;
      }

      // Rent breakdown table
      const rents = tile.rents || [tile.rent || 10, (tile.rent || 10) * 5, (tile.rent || 10) * 15, (tile.rent || 10) * 40, (tile.rent || 10) * 70, (tile.rent || 10) * 100];
      elements.rentValBase.textContent = `$${rents[0]}`;
      elements.rentValMonopoly.textContent = `$${rents[0] * 2}`;
      elements.rentValH1.textContent = `$${rents[1]}`;
      elements.rentValH2.textContent = `$${rents[2]}`;
      elements.rentValH3.textContent = `$${rents[3]}`;
      elements.rentValH4.textContent = `$${rents[4]}`;
      elements.rentValHotel.textContent = `$${rents[5]}`;

      elements.valHousePrice.textContent = `$${tile.housePrice || 50}`;
      elements.valMortgageValue.textContent = `+$${tile.mortgageValue || Math.floor(tile.price / 2)}`;
      elements.valUnmortgagePrice.textContent = `-$${Math.ceil((tile.mortgageValue || Math.floor(tile.price / 2)) * 1.1)}`;

      // Highlight active tier
      document.querySelectorAll('.rent-row').forEach(r => r.classList.remove('rent-current-tier'));
      if (!tile.isMortgaged && tile.ownerId) {
        if (tile.houses === 5) document.getElementById('rent-row-hotel')?.classList.add('rent-current-tier');
        else if (tile.houses === 4) document.getElementById('rent-row-h4')?.classList.add('rent-current-tier');
        else if (tile.houses === 3) document.getElementById('rent-row-h3')?.classList.add('rent-current-tier');
        else if (tile.houses === 2) document.getElementById('rent-row-h2')?.classList.add('rent-current-tier');
        else if (tile.houses === 1) document.getElementById('rent-row-h1')?.classList.add('rent-current-tier');
        else if (tile.isMonopoly) document.getElementById('rent-row-monopoly')?.classList.add('rent-current-tier');
        else document.getElementById('rent-row-base')?.classList.add('rent-current-tier');
      }

      // Actions section (only for owner)
      const isMyProperty = (tile.ownerId === state.playerId);
      const me = state.gameState.players.find(p => p.id === state.playerId);

      if (isMyProperty && me && !me.isBankrupt && state.gameState.status !== 'GAME_OVER') {
        elements.tileDetailsActionsBox.style.display = 'flex';
        elements.tileActionsHint.textContent = '';

        // Check group tiles for uniform building rules
        const groupTiles = state.gameState.board.filter(t => t.group === tile.group);
        const allGroupOwned = groupTiles.every(t => t.ownerId === state.playerId);
        const minHousesInGroup = Math.min(...groupTiles.map(t => t.houses || 0));
        const maxHousesInGroup = Math.max(...groupTiles.map(t => t.houses || 0));
        const totalBuildingsInGroup = groupTiles.reduce((acc, t) => acc + (t.houses || 0), 0);

        // 1. Build House (4 houses max)
        const canBuildHouse = allGroupOwned && !tile.isMortgaged && tile.houses < 4 && (tile.houses === minHousesInGroup) && (me.money >= (tile.housePrice || 50));
        elements.btnTileBuildHouse.style.display = (allGroupOwned && !tile.isMortgaged && tile.houses < 4) ? 'inline-flex' : 'none';
        elements.btnTileBuildHouse.disabled = !canBuildHouse;
        elements.btnTileBuildHouse.textContent = `🏠 Построить дом ($${tile.housePrice || 50})`;
        elements.btnTileBuildHouse.onclick = () => {
          socket.emit('build_house', { roomId: state.roomId, playerId: state.playerId, tileId: tile.id }, (res) => {
            if (res && res.success) {
              if (window.soundEngine) window.soundEngine.playBuy();
            } else {
              showToast(res ? res.error : 'Ошибка постройки', 'error');
            }
          });
        };

        // 2. Build Hotel (requires 4 houses)
        const canBuildHotel = allGroupOwned && !tile.isMortgaged && tile.houses === 4 && (tile.houses === minHousesInGroup) && (me.money >= (tile.housePrice || 50));
        elements.btnTileBuildHotel.style.display = (allGroupOwned && !tile.isMortgaged && tile.houses === 4) ? 'inline-flex' : 'none';
        elements.btnTileBuildHotel.disabled = !canBuildHotel;
        elements.btnTileBuildHotel.textContent = `🏨 Построить отель ($${tile.housePrice || 50})`;
        elements.btnTileBuildHotel.onclick = () => {
          socket.emit('build_house', { roomId: state.roomId, playerId: state.playerId, tileId: tile.id }, (res) => {
            if (res && res.success) {
              if (window.soundEngine) window.soundEngine.playBuy();
            } else {
              showToast(res ? res.error : 'Ошибка постройки отеля', 'error');
            }
          });
        };

        // 3. Sell Building
        const canSellBuilding = tile.houses > 0 && (tile.houses === maxHousesInGroup);
        elements.btnTileSellBuilding.style.display = (tile.houses > 0) ? 'inline-flex' : 'none';
        elements.btnTileSellBuilding.disabled = !canSellBuilding;
        const refund = Math.floor((tile.housePrice || 50) / 2);
        elements.btnTileSellBuilding.textContent = `🏚️ Продать ${tile.houses === 5 ? 'отель' : 'дом'} (+$${refund})`;
        elements.btnTileSellBuilding.onclick = () => {
          socket.emit('sell_house', { roomId: state.roomId, playerId: state.playerId, tileId: tile.id }, (res) => {
            if (res && res.success) {
              if (window.soundEngine) window.soundEngine.playCash();
            } else {
              showToast(res ? res.error : 'Ошибка продажи', 'error');
            }
          });
        };

        // 4. Mortgage Property
        const canMortgage = !tile.isMortgaged && totalBuildingsInGroup === 0;
        elements.btnTileMortgage.style.display = (!tile.isMortgaged) ? 'inline-flex' : 'none';
        elements.btnTileMortgage.disabled = !canMortgage;
        elements.btnTileMortgage.textContent = `🔒 Заложить в банк (+$${tile.mortgageValue || Math.floor(tile.price / 2)})`;
        elements.btnTileMortgage.onclick = () => {
          socket.emit('mortgage_property', { roomId: state.roomId, playerId: state.playerId, tileId: tile.id }, (res) => {
            if (res && res.success) {
              showToast(`Улица "${tile.name}" заложена в банк`, 'info');
            } else {
              showToast(res ? res.error : 'Ошибка залога', 'error');
            }
          });
        };

        // 5. Unmortgage Property
        const unmortgageCost = Math.ceil((tile.mortgageValue || Math.floor(tile.price / 2)) * 1.1);
        const canUnmortgage = tile.isMortgaged && (me.money >= unmortgageCost);
        elements.btnTileUnmortgage.style.display = tile.isMortgaged ? 'inline-flex' : 'none';
        elements.btnTileUnmortgage.disabled = !canUnmortgage;
        elements.btnTileUnmortgage.textContent = `🔓 Выкупить из банка (-$${unmortgageCost})`;
        elements.btnTileUnmortgage.onclick = () => {
          socket.emit('unmortgage_property', { roomId: state.roomId, playerId: state.playerId, tileId: tile.id }, (res) => {
            if (res && res.success) {
              showToast(`Улица "${tile.name}" выкуплена из банка!`, 'success');
            } else {
              showToast(res ? res.error : 'Ошибка выкупа', 'error');
            }
          });
        };

        // Hints
        if (!allGroupOwned) {
          elements.tileActionsHint.textContent = '💡 Соберите все улицы района (монополию), чтобы строить дома и отели.';
        } else if (totalBuildingsInGroup > 0 && !tile.isMortgaged && canMortgage === false) {
          elements.tileActionsHint.textContent = '💡 Для заклада улицы необходимо сначала продать все постройки на улицах этого района.';
        }
      } else {
        elements.tileDetailsActionsBox.style.display = 'none';
      }
    } else {
      // Special Tiles (Tax, Chance, Chest, Jail, Start)
      elements.tileDetailsPrice.textContent = '';
      elements.tileDetailsRentTableBox.style.display = 'none';
      elements.tileDetailsActionsBox.style.display = 'none';

      let desc = '';
      if (tile.type === 'tax') desc = `💸 Налоговая клетка: списывает $${tile.amount} при попадании.`;
      else if (tile.type === 'start') desc = '🏁 Клетка СТАРТ: даёт бонус +$200 за каждый пройденный круг.';
      else if (tile.type === 'chance') desc = '❓ Шанс: возьмите случайную карту удачи или испытания.';
      else if (tile.type === 'chest') desc = '📦 Общественная казна: возьмите карту бонуса или сбора.';
      else if (tile.type === 'jail') desc = '⛓️ Тюрьма: зона временного содержания или обычное посещение.';
      else if (tile.type === 'gotojail') desc = '🚨 Отправляйтесь в тюрьму: немедленный арест и телепортация.';
      else desc = 'Специальное поле на игровой доске.';

      elements.tileDetailsOwnerBanner.innerHTML = `<span style="color: var(--text-secondary); line-height: 1.4;">${desc}</span>`;
    }
  }

  // --- Trade Modal UI ---
  function openTradeModal() {
    if (!state.gameState) return;
    elements.modalTrade.style.display = 'flex';

    // Populate partners dropdown
    elements.tradePartnerSelect.innerHTML = '';
    const otherPlayers = state.gameState.players.filter(p => p.id !== state.playerId && !p.isBankrupt);
    otherPlayers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} ($${p.money})`;
      elements.tradePartnerSelect.appendChild(opt);
    });

    const updateTradePropertiesPickers = () => {
      const me = state.gameState.players.find(p => p.id === state.playerId);
      const partnerId = elements.tradePartnerSelect.value;
      const partner = state.gameState.players.find(p => p.id === partnerId);

      // Render My Properties
      elements.tradeOfferPropertiesList.innerHTML = '';
      if (me && me.properties && me.properties.length > 0) {
        me.properties.forEach(tId => {
          const t = state.gameState.board[tId];
          if (!t) return;
          const label = document.createElement('label');
          label.className = 'trade-property-checkbox';
          label.innerHTML = `
            <input type="checkbox" name="offer_prop" value="${t.id}">
            <span class="color-bar-indicator" style="background-color: ${t.color};"></span>
            <span>${escapeHtml(t.name)} ($${t.price})</span>
          `;
          elements.tradeOfferPropertiesList.appendChild(label);
        });
      } else {
        elements.tradeOfferPropertiesList.innerHTML = '<span class="no-properties">Нет доступных улиц</span>';
      }

      // Render Partner Properties
      elements.tradeRequestPropertiesList.innerHTML = '';
      if (partner && partner.properties && partner.properties.length > 0) {
        partner.properties.forEach(tId => {
          const t = state.gameState.board[tId];
          if (!t) return;
          const label = document.createElement('label');
          label.className = 'trade-property-checkbox';
          label.innerHTML = `
            <input type="checkbox" name="request_prop" value="${t.id}">
            <span class="color-bar-indicator" style="background-color: ${t.color};"></span>
            <span>${escapeHtml(t.name)} ($${t.price})</span>
          `;
          elements.tradeRequestPropertiesList.appendChild(label);
        });
      } else {
        elements.tradeRequestPropertiesList.innerHTML = '<span class="no-properties">Нет доступных улиц</span>';
      }
    };

    elements.tradePartnerSelect.onchange = updateTradePropertiesPickers;
    updateTradePropertiesPickers();
  }

  function sendTradeProposal() {
    const partnerId = elements.tradePartnerSelect.value;
    if (!partnerId) {
      showToast('Выберите партнёра по сделке', 'warning');
      return;
    }

    const offerMoney = Number(elements.tradeOfferMoney.value) || 0;
    const offerJailCards = Number(elements.tradeOfferJailCards.value) || 0;
    const offerProps = Array.from(document.querySelectorAll('input[name="offer_prop"]:checked')).map(el => Number(el.value));

    const requestMoney = Number(elements.tradeRequestMoney.value) || 0;
    const requestJailCards = Number(elements.tradeRequestJailCards.value) || 0;
    const requestProps = Array.from(document.querySelectorAll('input[name="request_prop"]:checked')).map(el => Number(el.value));

    socket.emit('propose_trade', {
      roomId: state.roomId,
      fromPlayerId: state.playerId,
      toPlayerId: partnerId,
      offer: { money: offerMoney, properties: offerProps, jailFreeCards: offerJailCards },
      request: { money: requestMoney, properties: requestProps, jailFreeCards: requestJailCards }
    }, (res) => {
      elements.modalTrade.style.display = 'none';
      if (res && res.success) {
        showToast('Предложение сделки отправлено игроку!', 'success');
      } else {
        showToast(res ? res.error : 'Ошибка отправки сделки', 'error');
      }
    });
  }

  function showIncomingTradeModal(trade) {
    if (!trade || trade.status !== 'PENDING') return;
    elements.modalIncomingTrade.style.display = 'flex';
    elements.incomingTradeSenderInfo.textContent = `${trade.fromPlayerName} предлагает обмен:`;

    // Render what sender offers
    let offerHtml = [];
    if (trade.offer.money > 0) offerHtml.push(`💰 Деньги: <strong>+$${trade.offer.money}</strong>`);
    if (trade.offer.jailFreeCards > 0) offerHtml.push(`🗝️ Карта выхода из тюрьмы: <strong>${trade.offer.jailFreeCards} шт.</strong>`);
    if (trade.offer.properties.length > 0) {
      const propNames = trade.offer.properties.map(id => {
        const t = state.gameState ? state.gameState.board[id] : null;
        return t ? t.name : `Улица #${id}`;
      }).join(', ');
      offerHtml.push(`🏠 Улицы: <strong>${propNames}</strong>`);
    }
    if (offerHtml.length === 0) offerHtml.push('Ничего');
    elements.incomingTradeOfferContent.innerHTML = offerHtml.join('<br>');

    // Render what sender requests
    let reqHtml = [];
    if (trade.request.money > 0) reqHtml.push(`💰 Деньги: <strong>-$${trade.request.money}</strong>`);
    if (trade.request.jailFreeCards > 0) reqHtml.push(`🗝️ Карта выхода из тюрьмы: <strong>${trade.request.jailFreeCards} шт.</strong>`);
    if (trade.request.properties.length > 0) {
      const propNames = trade.request.properties.map(id => {
        const t = state.gameState ? state.gameState.board[id] : null;
        return t ? t.name : `Улица #${id}`;
      }).join(', ');
      reqHtml.push(`🏠 Улицы: <strong>${propNames}</strong>`);
    }
    if (reqHtml.length === 0) reqHtml.push('Ничего');
    elements.incomingTradeRequestContent.innerHTML = reqHtml.join('<br>');
  }

  function renderDiceFaces(val1, val2) {
    const v1 = Math.max(1, Math.min(6, Number(val1) || 1));
    const v2 = Math.max(1, Math.min(6, Number(val2) || 1));
    if (elements.die1El) elements.die1El.dataset.face = v1;
    if (elements.die2El) elements.die2El.dataset.face = v2;
  }

  async function handlePlayerRolled(data) {
    state.isRollingAnimation = true;
    if (window.soundEngine) window.soundEngine.playDiceRoll();

    const w1 = elements.die1Wrapper || elements.die1El;
    const w2 = elements.die2Wrapper || elements.die2El;

    // Reset previous roll effects & trigger reflow
    if (w1) {
      w1.classList.remove('is-rolling', 'die-landed', 'die-double-glow');
      void w1.offsetWidth;
    }
    if (w2) {
      w2.classList.remove('is-rolling', 'die-landed', 'die-double-glow');
      void w2.offsetWidth;
    }

    // Launch true 3D polyhedral tumbling animation
    if (w1) w1.classList.add('is-rolling');
    if (w2) w2.classList.add('is-rolling');

    const rollDuration = 800;
    const intervalSpeed = 75;
    const startTime = Date.now();

    // Random face snaps during 3D air tumble
    await new Promise(resolve => {
      const rollInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= rollDuration - 50) {
          clearInterval(rollInterval);
          resolve();
        } else {
          const rand1 = Math.floor(Math.random() * 6) + 1;
          const rand2 = Math.floor(Math.random() * 6) + 1;
          renderDiceFaces(rand1, rand2);
        }
      }, intervalSpeed);
    });

    // Stop roll and snap to final rolled values
    if (w1) w1.classList.remove('is-rolling');
    if (w2) w2.classList.remove('is-rolling');
    renderDiceFaces(data.dice.die1, data.dice.die2);

    // Impact landing bounce
    if (w1) w1.classList.add('die-landed');
    if (w2) w2.classList.add('die-landed');

    // Double glow celebration
    if (data.dice.die1 === data.dice.die2) {
      if (w1) w1.classList.add('die-double-glow');
      if (w2) w2.classList.add('die-double-glow');
    }

    // Brief pause to admire the result before pawn starts hopping
    await new Promise(res => setTimeout(res, 280));

    if (data.skipped) {
      state.isRollingAnimation = false;
      return;
    }

    if (state.gameState && state.gameState.players) {
      const p = state.gameState.players.find(x => x.id === data.playerId);
      if (p) p.position = data.newPosition;
    }

    if (state.gameState) {
      await state.boardRenderer.animatePlayerMovement(
        data.playerId,
        data.oldPosition,
        data.newPosition,
        state.gameState.players,
        null,
        () => {
          state.isRollingAnimation = false;
          if (data.tile) {
            if (data.tile.type === 'property' && data.tile.ownerId && data.tile.ownerId !== data.playerId) {
              if (window.soundEngine) window.soundEngine.playCash();
            } else if (data.tile.type === 'tax') {
              if (window.soundEngine) window.soundEngine.playTax();
            } else if (data.tile.type === 'chance' || data.tile.type === 'chest') {
              if (window.soundEngine) window.soundEngine.playCard();
            } else if (data.tile.type === 'go_to_jail') {
              if (window.soundEngine) window.soundEngine.playJail();
            }
          }
        }
      );
    } else {
      state.isRollingAnimation = false;
    }
  }

  function renderPlayersSidebar(gameState) {
    elements.playersList.innerHTML = '';

    gameState.players.forEach(p => {
      const isCurrentTurn = gameState.players[gameState.currentTurnIndex]?.id === p.id;
      const isMe = p.id === state.playerId;

      const playerCard = document.createElement('div');
      playerCard.className = `player-card ${isCurrentTurn ? 'active-turn' : ''} ${p.isBankrupt ? 'is-bankrupt' : ''} ${!p.isConnected ? 'is-offline' : ''}`;
      
      let propertiesPillsHtml = '';
      if (p.properties && p.properties.length > 0) {
        propertiesPillsHtml = `
          <div class="player-properties-preview">
            ${p.properties.map(tileId => {
              const tile = gameState.board[tileId];
              const isHotel = tile && tile.houses === 5;
              const hasHouses = tile && tile.houses > 0 && tile.houses < 5;
              const mark = isHotel ? '🏨' : (hasHouses ? `🏠${tile.houses}` : '');
              return `<span class="property-color-dot" style="background-color: ${tile ? tile.color : '#fff'};" title="${tile ? tile.name : ''}">${mark}</span>`;
            }).join('')}
            <span class="properties-count-tag">${p.properties.length} ул.</span>
          </div>
        `;
      } else {
        propertiesPillsHtml = `<div class="player-properties-preview"><span class="no-properties">Нет улиц</span></div>`;
      }

      let jailPill = '';
      if (p.inJail) {
        jailPill = `<span class="badge badge-warning">⛓️ Тюрьма (${p.jailTurns || 0}/3)</span>`;
      }
      if (p.jailFreeCards > 0) {
        jailPill += `<span class="badge badge-host" title="Карты освобождения">🗝️ ${p.jailFreeCards}</span>`;
      }

      playerCard.innerHTML = `
        <div class="player-card-header">
          <div class="player-card-avatar" style="background-color: ${p.color.hex}; color: ${p.color.text}">
            ${p.color.icon}
          </div>
          <div class="player-card-main-info">
            <div class="player-card-name">
              ${escapeHtml(p.name)} ${isMe ? '<span class="self-badge">Вы</span>' : ''}
            </div>
            <div class="player-card-balance">$${p.money}</div>
          </div>
          ${p.isBankrupt ? '<span class="badge badge-danger">БАНКРОТ</span>' : ''}
          ${!p.isConnected && !p.isBankrupt ? '<span class="badge badge-warning">OFFLINE</span>' : ''}
          ${p.missedTurns === 1 && !p.isBankrupt ? '<span class="badge badge-danger" style="font-size: 0.65rem;" title="1 пропуск хода. При 2-м пропуске — поражение!">⚠️ 1/2 пропуск</span>' : ''}
          ${isCurrentTurn && !p.isBankrupt ? '<span class="badge badge-turn">ХОД</span>' : ''}
          ${jailPill}
        </div>
        ${propertiesPillsHtml}
      `;
      elements.playersList.appendChild(playerCard);
    });
  }

  function renderEventsLog(logs) {
    if (!logs) return;
    elements.eventsLog.innerHTML = '';
    logs.forEach(log => {
      const logEl = document.createElement('div');
      logEl.className = `log-entry log-${log.type || 'info'}`;
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      logEl.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-icon">${log.icon || 'ℹ️'}</span>
        <span class="log-text">${escapeHtml(log.text)}</span>
      `;
      elements.eventsLog.appendChild(logEl);
    });
    elements.eventsLog.scrollTop = elements.eventsLog.scrollHeight;
  }

  function appendChatMessage(chat) {
    const isMe = chat.playerId === state.playerId;
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${isMe ? 'chat-msg-self' : ''}`;
    const timeStr = new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    msgEl.innerHTML = `
      <div class="chat-sender" style="color: ${chat.senderColor}">
        ${chat.senderIcon} ${escapeHtml(chat.senderName)} <span class="chat-time">${timeStr}</span>
      </div>
      <div class="chat-bubble">
        ${escapeHtml(chat.message)}
      </div>
    `;

    elements.chatMessages.appendChild(msgEl);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    if (activeTab !== 'chat') {
      unreadChatCount++;
      elements.chatBadge.style.display = 'inline-flex';
      elements.chatBadge.textContent = unreadChatCount > 9 ? '9+' : unreadChatCount;
    }
  }

  function updateGameOverView(gameState) {
    elements.modalGameOver.style.display = 'flex';
    if (window.soundEngine) window.soundEngine.playVictory();

    const winner = gameState.winner;
    if (winner) {
      elements.winnerName.textContent = winner.name;
      elements.winnerIcon.textContent = winner.color.icon;
      elements.winnerIcon.style.backgroundColor = winner.color.hex;
      elements.winnerStats.textContent = `Итоговый баланс: $${winner.money} | Недвижимость: ${winner.propertiesCount} улиц`;
    } else {
      elements.winnerName.textContent = 'Ничья';
      elements.winnerIcon.textContent = '🤝';
      elements.winnerStats.textContent = 'Все игроки завершили партию';
    }

    const durationSec = gameState.gameDurationSeconds || 0;
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    elements.gameDurationTag.textContent = `⏱️ Длительность партии: ${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const rankings = gameState.rankings || [];
    elements.playersRankingList.innerHTML = '';
    rankings.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = `ranking-row ${idx === 0 ? 'winner-row' : ''}`;
      row.innerHTML = `
        <span class="ranking-pos">#${idx + 1}</span>
        <span class="ranking-avatar" style="background-color: ${p.color.hex}; color: ${p.color.text}">${p.color.icon}</span>
        <span class="ranking-name">${escapeHtml(p.name)}</span>
        <span class="ranking-money" title="Капитал (деньги + недвижимость)">$${p.netWorth}</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${p.housesCount || 0}🏠 ${p.hotelsCount || 0}🏨 ${p.monopoliesCount || 0}👑</span>
        <span class="ranking-status">${p.isBankrupt ? '❌ Банкрот' : '🏆 В игре'}</span>
      `;
      elements.playersRankingList.appendChild(row);
    });

    const isMeHost = gameState.hostId === state.playerId;
    elements.btnRestartGame.style.display = isMeHost ? 'block' : 'none';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  window.addEventListener('DOMContentLoaded', init);
})();
