import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/types/game';
import { formatMoney } from '@/lib/utils';
import { User, Trophy, Gamepad2, TrendingUp, DollarSign, LogOut, RotateCw } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { activeModal, modalData, closeModal, currentUser, logoutTelegram, openModal } = useGame();
  const isOpen = activeModal === 'profile' || activeModal === 'leaderboard';
  const defaultTab = activeModal === 'leaderboard' ? 'leaderboard' : 'profile';

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard?limit=25');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="profile" className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Профиль
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Таблица лидеров
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="flex flex-col gap-4 mt-4">
              {currentUser ? (
                <>
                  {/* User Header */}
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-black/30 border border-white/5">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md border-2 border-white/20">
                        {(currentUser.firstName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h4 className="text-lg font-bold text-foreground leading-tight">
                        {currentUser.firstName} {currentUser.lastName || ''}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {currentUser.username ? `@${currentUser.username}` : `ID: ${currentUser.telegramId}`}
                      </span>
                      <div className="mt-1.5">
                        <Badge variant="gold" className="text-xs font-bold">
                          ⭐ ELO Рейтинг: {currentUser.rating || 1000}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <Trophy className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-xl font-black text-foreground">{currentUser.wins || 0}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Побед</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <Gamepad2 className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="text-xl font-black text-foreground">{currentUser.gamesPlayed || 0}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Всего игр</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
                      <span className="text-xl font-black text-foreground">{currentUser.winRate || 0}%</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Винрейт</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <DollarSign className="w-5 h-5 text-yellow-400 mb-1" />
                      <span className="text-xl font-black text-foreground">{formatMoney(currentUser.totalMoneyEarned || 0)}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Заработано</span>
                    </div>
                  </div>

                  {/* Logout Action */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 mt-2"
                    onClick={logoutTelegram}
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти из аккаунта (Перейти в гостевой режим)
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-black/30 border border-white/5 gap-3">
                  <div className="text-4xl">👑</div>
                  <h4 className="text-base font-bold text-foreground">Гостевой режим</h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Войдите через Яндекс ID или Telegram, чтобы сохранять победы, ELO-рейтинг и подниматься в таблице лидеров!
                  </p>
                  <Button
                    variant="gold"
                    className="w-full max-w-xs mt-2 font-bold"
                    onClick={() => openModal('telegramLogin')}
                  >
                    Войти
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Топ игроков Монополии
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={fetchLeaderboard}
                  disabled={loading}
                >
                  <RotateCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Обновить
                </Button>
              </div>

              <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Пока нет сыгранных рейтинговых партий.<br />Будьте первым в топе! 🎲
                  </div>
                ) : (
                  leaderboard.map((item, index) => {
                    const isMe = currentUser && String(currentUser.telegramId) === String(item.telegramId);
                    return (
                      <div
                        key={item.telegramId}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isMe ? 'bg-primary/15 border-primary/40' : 'bg-black/30 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                          {index === 0 && <span className="text-base">🥇</span>}
                          {index === 1 && <span className="text-base">🥈</span>}
                          {index === 2 && <span className="text-base">🥉</span>}
                          {index > 2 && <span className="text-muted-foreground font-bold">#{index + 1}</span>}
                        </div>

                        {/* Avatar */}
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/30">
                            {(item.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Player Names */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="text-xs font-bold text-foreground truncate">
                            {item.displayName}
                          </span>
                          {item.username && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              @{item.username}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-black text-amber-400">
                            ⭐ {item.rating}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            🏆 {item.wins} / 🎮 {item.gamesPlayed}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
