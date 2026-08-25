import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Check,
  Play,
  LogOut,
  Users,
  Crown,
  Link as LinkIcon,
  Sparkles,
  Bot,
  Trash2,
  Plus,
  Shield,
  Scale,
  Zap,
} from 'lucide-react';
import { PetAvatar } from '@/components/common/PetAvatar';
import { getPetCharacter } from '@/lib/petCharacters';
import { cn } from '@/lib/utils';

export const LobbyScreen: React.FC = () => {
  const {
    gameState,
    playerId,
    isHost,
    roomId,
    startGame,
    leaveRoom,
    addBot,
    removeBot,
    showToast,
    openModal,
  } = useGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBotDiff, setSelectedBotDiff] = useState<'careful' | 'balanced' | 'aggressive'>('balanced');

  if (!gameState) return null;

  const players = gameState.players || [];
  const maxPlayers = 6;
  const emptySlotsCount = Math.max(0, maxPlayers - players.length);
  const canStart = isHost && players.length >= 2;

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    showToast(`Код комнаты [${roomId}] скопирован!`, 'success', 2000);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Ссылка на комнату скопирована в буфер!', 'success', 2000);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-6 px-4 select-none">
      <Card className="w-full">
        {/* Lobby Header */}
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Комната ожидания</CardTitle>
          </div>
          <CardDescription>
            Отправьте код или ссылку друзьям, либо добавьте ботов-соперников.
          </CardDescription>

          {/* Room Code Banner */}
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
              <span className="text-xs text-muted-foreground uppercase font-bold">Код стола:</span>
              <span className="font-mono text-xl font-black text-amber-400 tracking-widest">
                {roomId}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold flex items-center gap-1.5"
              onClick={handleCopyCode}
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              {copiedCode ? 'Скопировано' : 'Копировать код'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold flex items-center gap-1.5"
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4 text-muted-foreground" />}
              {copiedLink ? 'Скопировано' : 'Ссылка'}
            </Button>
          </div>
        </CardHeader>

        {/* Players List */}
        <CardContent className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Игроки за столом ({players.length} / {maxPlayers}):
            </span>

            {/* Host Quick Bot Add Toolbar */}
            {isHost && emptySlotsCount > 0 && (
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-muted-foreground ml-1">
                  Сложность:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBotDiff('careful')}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all',
                    selectedBotDiff === 'careful'
                      ? 'bg-teal-500/30 text-teal-300 border border-teal-400/50'
                      : 'text-muted-foreground hover:text-white'
                  )}
                  title="Осторожный бот: держит высокий денежный резерв"
                >
                  <Shield className="w-2.5 h-2.5" />
                  <span>Осторожный</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBotDiff('balanced')}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all',
                    selectedBotDiff === 'balanced'
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/50'
                      : 'text-muted-foreground hover:text-white'
                  )}
                  title="Сбалансированный бот: умеренные ставки и взвешенные обмены"
                >
                  <Scale className="w-2.5 h-2.5" />
                  <span>Баланс</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBotDiff('aggressive')}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all',
                    selectedBotDiff === 'aggressive'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                      : 'text-muted-foreground hover:text-white'
                  )}
                  title="Агрессивный бот: быстро строит дома и перебивает аукционы"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Агрессор</span>
                </button>

                <Button
                  variant="default"
                  size="sm"
                  className="h-6 px-2.5 text-[10px] font-black shadow-sm ml-1"
                  onClick={() => addBot(selectedBotDiff)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>+ Бот</span>
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Existing Players & Bots */}
            {players.map((p, idx) => {
              const isPlayerHost = p.id === gameState.hostId;
              const isMe = p.id === playerId;
              const isBot = Boolean(p.isBot);
              const pet = getPetCharacter(p.characterId);

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-primary/15 border-primary/50 shadow-md ring-1 ring-primary/20'
                      : isBot
                      ? 'bg-indigo-950/20 border-indigo-500/20'
                      : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Animated Pet Avatar */}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <PetAvatar
                        characterId={p.characterId}
                        anim="idle"
                        size="md"
                        showPedestal={true}
                        pedestalColor={p.color?.hex}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate max-w-[110px]">
                          {p.name}
                        </span>
                        {isMe && <Badge variant="gold" className="text-[8px] px-1 py-0">ВЫ</Badge>}
                        {isBot && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[8px] px-1.5 py-0 font-black border flex items-center gap-0.5',
                              p.botDifficulty === 'careful' && 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                              p.botDifficulty === 'aggressive' && 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                              (!p.botDifficulty || p.botDifficulty === 'balanced') && 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            )}
                          >
                            <Bot className="w-2.5 h-2.5" />
                            <span>
                              {p.botDifficulty === 'careful'
                                ? 'Осторожный'
                                : p.botDifficulty === 'aggressive'
                                ? 'Агрессор'
                                : 'Баланс'}
                            </span>
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {pet.name} {pet.emoji} (Слот #{idx + 1})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isMe && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/20 flex items-center gap-1"
                        onClick={() => openModal('characterPicker')}
                        title="Сменить персонажа"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Сменить</span>
                      </Button>
                    )}

                    {isPlayerHost && (
                      <Badge variant="secondary" className="text-[10px] font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        Хост
                      </Badge>
                    )}

                    {isHost && isBot && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg"
                        onClick={() => removeBot(p.id)}
                        title="Удалить бота"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 2. Empty Slots */}
            {Array.from({ length: emptySlotsCount }).map((_, slotIdx) => {
              const slotNumber = players.length + slotIdx + 1;
              return (
                <div
                  key={`empty-${slotIdx}`}
                  className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] hover:border-white/25 transition-all"
                >
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <div className="w-9 h-9 rounded-full border border-dashed border-white/20 flex items-center justify-center text-xs font-bold text-muted-foreground/60">
                      #{slotNumber}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Свободный слот
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        Ожидание подключения...
                      </span>
                    </div>
                  </div>

                  {isHost && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-[10px] font-bold border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1"
                      onClick={() => addBot(selectedBotDiff)}
                      title={`Добавить бота (${selectedBotDiff})`}
                    >
                      <Bot className="w-3 h-3" />
                      <span>+ Бот</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Lobby Actions */}
        <CardFooter className="flex flex-col gap-3 pt-4 border-t border-white/10">
          {isHost ? (
            <Button
              variant="default"
              size="lg"
              className="w-full font-black text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
              onClick={startGame}
              disabled={!canStart}
            >
              <Play className="w-5 h-5 fill-current" />
              {canStart ? 'Начать игру' : 'Ожидание игроков (мин. 2)...'}
            </Button>
          ) : (
            <div className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-xs font-bold text-primary animate-pulse">
                ⏳ Ожидаем, пока создатель стола запустит партию...
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5"
            onClick={leaveRoom}
          >
            <LogOut className="w-4 h-4" />
            Выйти в главное меню
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
