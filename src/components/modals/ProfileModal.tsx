import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/utils';
import { User, Trophy, Gamepad2, TrendingUp, DollarSign, LogOut, Pencil, Check, X, Loader2 } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { activeModal, closeModal, currentUser, playerName, logoutTelegram, updateNickname, openModal } = useGame();
  const isOpen = activeModal === 'profile';

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentDisplayName = currentUser?.firstName || playerName || 'Игрок';

  useEffect(() => {
    if (isOpen) {
      setNicknameInput(currentDisplayName);
      setIsEditing(false);
    }
  }, [isOpen, currentDisplayName]);

  const handleSaveNickname = async () => {
    const clean = nicknameInput.trim();
    if (!clean) return;
    if (clean === currentDisplayName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateNickname(clean);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNicknameInput(currentDisplayName);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center text-center pb-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-blue-500/20 to-indigo-500/20 border border-white/15 flex items-center justify-center text-primary shadow-lg mb-2">
            <User className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black justify-center">
            Профиль игрока
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Статистика, ELO-рейтинг и персональные данные
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {currentUser ? (
            <>
              {/* User Header & Nickname Editor */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-3.5">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt="Avatar"
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-md border-2 border-white/20 shrink-0">
                      {(currentDisplayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    {/* Nickname Row / Inline Edit */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Input
                          value={nicknameInput}
                          onChange={(e) => setNicknameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNickname();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Ваш никнейм"
                          className="h-8 text-sm font-bold bg-black/60 border-white/20 focus:border-primary px-2.5"
                          maxLength={24}
                          autoFocus
                          disabled={isSaving}
                        />
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                          onClick={handleSaveNickname}
                          disabled={isSaving || !nicknameInput.trim()}
                          title="Сохранить"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white shrink-0"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          title="Отмена"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-foreground truncate max-w-[180px]">
                          {currentDisplayName}
                        </h4>
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                          onClick={() => setIsEditing(true)}
                          title="Изменить никнейм"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <span className="text-[11px] text-muted-foreground truncate">
                      {currentUser.username ? `@${currentUser.username}` : `ID: ${currentUser.telegramId || currentUser.yandexId}`}
                    </span>

                    <div className="mt-1">
                      <Badge variant="gold" className="text-[11px] font-black px-2 py-0.5">
                        ⭐ ELO Рейтинг: {currentUser.rating ?? 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
                  <Trophy className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xl font-black text-foreground">{currentUser.wins || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Побед</span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
                  <Gamepad2 className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="text-xl font-black text-foreground">{currentUser.gamesPlayed || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Всего игр</span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="text-xl font-black text-foreground">{currentUser.winRate || 0}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Винрейт</span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
                  <DollarSign className="w-5 h-5 text-yellow-400 mb-1" />
                  <span className="text-xl font-black text-foreground">{formatMoney(currentUser.totalMoneyEarned || 0)}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Заработано</span>
                </div>
              </div>

              {/* Logout Action */}
              <Button
                variant="destructive"
                size="default"
                className="w-full flex items-center justify-center gap-2 font-bold rounded-xl h-11 shadow-md mt-1"
                onClick={logoutTelegram}
              >
                <LogOut className="w-4 h-4" />
                Выйти из аккаунта
              </Button>
            </>
          ) : (
            /* Guest Mode */
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-black/30 border border-white/5 gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">
                👑
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-bold text-foreground">Гостевой режим</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Войдите через Яндекс ID или Telegram, чтобы сохранять победы, ELO-рейтинг и подниматься в таблице лидеров!
                </p>
              </div>

              {/* Guest name editor */}
              <div className="w-full flex items-center gap-1.5 my-1">
                <Input
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="Ваше имя"
                  className="h-9 text-sm font-bold bg-black/40 border-white/15 focus:border-primary"
                  maxLength={24}
                />
                <Button
                  size="sm"
                  className="h-9 px-3 font-bold shrink-0"
                  onClick={() => updateNickname(nicknameInput)}
                  disabled={!nicknameInput.trim()}
                >
                  Сохранить
                </Button>
              </div>

              <Button
                variant="gold"
                className="w-full font-bold h-11 rounded-xl shadow-lg shadow-amber-500/20"
                onClick={() => openModal('telegramLogin')}
              >
                Войти в профиль
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
