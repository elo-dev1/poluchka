import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ShieldCheck, Loader2, KeyRound, Sparkles, ExternalLink } from 'lucide-react';

export const TelegramLoginModal: React.FC = () => {
  const { activeModal, modalData, closeModal, authTelegram, authYandex, openModal, showToast } = useGame();
  const isOpen = activeModal === 'telegramLogin' || (activeModal as string) === 'auth';

  const [activeTab, setActiveTab] = useState<string>('telegram');
  const [yandexClientId, setYandexClientId] = useState<string>(
    (import.meta as any).env?.VITE_YANDEX_CLIENT_ID || ''
  );
  const [botUsername, setBotUsername] = useState<string>('monopoly_poluchka_bot');
  const [botId, setBotId] = useState<string>('8950689907');
  const [manualUsername, setManualUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch OAuth Config from server
  useEffect(() => {
    if (isOpen) {
      if (modalData && modalData.tab) {
        setActiveTab(modalData.tab);
      }
      fetch('/api/auth/config')
        .then((r) => r.json())
        .then((data) => {
          if (data) {
            if (data.yandexClientId) setYandexClientId(data.yandexClientId);
            if (data.botUsername) setBotUsername(data.botUsername.replace(/^@/, ''));
            if (data.botId) setBotId(data.botId);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, modalData]);

  // 2. Listen for Yandex and Telegram OAuth Popup Callbacks
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin && !event.origin.includes('telegram.org')) return;
      
      // Yandex OAuth
      if (event.data?.type === 'YANDEX_AUTH_SUCCESS' && event.data?.token) {
        setIsLoading(true);
        try {
          await authYandex({ token: event.data.token });
        } finally {
          setIsLoading(false);
        }
      } else if (event.data?.type === 'YANDEX_AUTH_ERROR') {
        showToast('Вход через Яндекс ID отменён', 'warning');
      }

      // Telegram OAuth window message
      if (event.data && (event.data.event === 'auth_result' || event.data.result)) {
        const tgData = event.data.result || event.data.data || event.data;
        if (tgData && tgData.id) {
          setIsLoading(true);
          try {
            await authTelegram(tgData);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authYandex, authTelegram, showToast]);

  // 3. Mount Telegram Widget on Telegram Tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'telegram' || !widgetContainerRef.current) return;
    const container = widgetContainerRef.current;
    container.innerHTML = '';

    (window as any).onTelegramAuth = (user: any) => {
      setIsLoading(true);
      authTelegram(user).finally(() => setIsLoading(false));
    };

    const targetBot = botUsername || 'monopoly_poluchka_bot';
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', targetBot);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    container.appendChild(script);
  }, [isOpen, activeTab, botUsername, authTelegram]);

  // 4. Auto-detect Telegram WebApp environment
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        setIsLoading(true);
        authTelegram(tg.initData).finally(() => setIsLoading(false));
      }
    }
  }, [isOpen, authTelegram]);

  // Handle Telegram OAuth Click
  const handleOpenTelegramOAuth = () => {
    const targetBot = botUsername || 'monopoly_poluchka_bot';
    const targetBotId = botId || '8950689907';
    const originUrl = encodeURIComponent(window.location.origin);
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${targetBotId}&origin=${originUrl}&embed=0&request_access=write`;

    const width = 540;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'telegram_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = authUrl;
    }
  };

  // Handle Direct / Dev Telegram Login
  const handleDirectLogin = async () => {
    const clean = manualUsername.trim().replace(/^@/, '');
    if (!clean) {
      showToast('Введите ваш никнейм в Telegram', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const mockTgUser = {
        id: `tg_${clean.toLowerCase()}`,
        first_name: clean,
        username: clean,
        isDirect: true,
        auth_date: Math.floor(Date.now() / 1000)
      };
      await authTelegram(mockTgUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Official Yandex ID Popup Open
  const handleOpenYandexOAuth = () => {
    const clientId = yandexClientId;
    if (!clientId) {
      showToast('Укажите YANDEX_CLIENT_ID в файле .env и перезапустите сервер', 'error', 5000);
      return;
    }
    const redirectUri = window.location.origin + '/yandex-callback.html';
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    const width = 560;
    const height = 660;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'yandex_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = authUrl;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-primary/20 to-blue-500/20 border border-white/15 flex items-center justify-center text-primary shadow-xl mb-1.5">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black justify-center">
            Вход в профиль игрока
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Официальная авторизация для сохранения ELO-рейтинга, статистики побед и лидерборда.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          {/* Provider Tabs: Telegram vs Yandex ID */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full p-1 bg-black/40 border border-white/10 rounded-2xl">
              <TabsTrigger
                value="telegram"
                className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2AABEE] data-[state=active]:to-[#229ED9] data-[state=active]:text-white rounded-xl py-2 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Telegram
              </TabsTrigger>

              <TabsTrigger
                value="yandex"
                className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#fc3f1d] data-[state=active]:to-[#e62e05] data-[state=active]:text-white rounded-xl py-2 transition-all shadow-sm"
              >
                <span className="w-4 h-4 rounded-full bg-white text-[#fc3f1d] flex items-center justify-center text-[10px] font-black leading-none">
                  Я
                </span>
                Яндекс ID
              </TabsTrigger>
            </TabsList>

            {/* --- TELEGRAM OFFICIAL OAUTH TAB --- */}
            <TabsContent value="telegram" className="flex flex-col gap-3 mt-3">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2AABEE] to-[#229ED9] text-white flex items-center justify-center shadow-lg shadow-[#229ED9]/30">
                  <Send className="w-6 h-6 ml-[-2px] mt-[-1px]" />
                </div>

                <div className="text-center">
                  <span className="text-sm font-bold text-foreground block">
                    Авторизация через Telegram
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Бот: <strong className="text-[#2AABEE]">@{botUsername}</strong>
                  </span>
                </div>

                {/* Primary Telegram Login Button */}
                <Button
                  size="lg"
                  className="w-full font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:brightness-110 text-white shadow-xl shadow-[#229ED9]/30 h-12 text-sm rounded-xl active:scale-[0.98]"
                  onClick={handleOpenTelegramOAuth}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Send className="w-4 h-4 mr-0.5" />
                  )}
                  Войти через Telegram
                </Button>

                {/* Telegram Official Iframe Widget Container */}
                <div
                  ref={widgetContainerRef}
                  className="flex items-center justify-center w-full min-h-[0px]"
                />

                {/* Fallback Direct Login for Local / Instant Testing */}
                <div className="w-full pt-2 border-t border-white/10 flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground text-left">
                    Или быстрый вход по вашему @username:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={manualUsername}
                      onChange={(e) => setManualUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDirectLogin()}
                      placeholder="@username или имя"
                      className="h-8 text-xs font-bold bg-black/50 border-white/15 focus:border-[#2AABEE]"
                      maxLength={24}
                    />
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs font-bold bg-white/10 hover:bg-white/20 text-foreground shrink-0 border border-white/10"
                      onClick={handleDirectLogin}
                      disabled={isLoading || !manualUsername.trim()}
                    >
                      Войти
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- YANDEX ID OFFICIAL OAUTH TAB --- */}
            <TabsContent value="yandex" className="flex flex-col gap-3 mt-3">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#fc3f1d]/30">
                  Я
                </div>

                <div className="text-center">
                  <span className="text-sm font-bold text-foreground block">
                    Официальный вход с Яндекс ID
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Вход в 1 клик с использованием вашего аккаунта Яндекс
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#fc3f1d] to-[#e62e05] hover:brightness-110 text-white shadow-xl shadow-[#fc3f1d]/30 h-12 text-sm rounded-xl"
                  onClick={handleOpenYandexOAuth}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white text-[#fc3f1d] flex items-center justify-center text-xs font-black">
                      Я
                    </span>
                  )}
                  Войти с Яндекс ID
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Legal Compliance Notice (152-ФЗ и 406-ФЗ) */}
          <div className="pt-1.5 border-t border-white/10 text-[11px] text-muted-foreground leading-relaxed flex items-center justify-center gap-1 w-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Авторизуясь, вы принимаете{' '}
              <button
                type="button"
                onClick={() => openModal('legal', { tab: 'terms', returnTo: 'telegramLogin' })}
                className="underline hover:text-foreground text-primary font-medium"
              >
                условия сервиса
              </button>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
