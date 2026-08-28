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
  RotateCw,
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
    setPlayerTeam,
    showToast,
    openModal,
  } = useGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBotDiff, setSelectedBotDiff] = useState<'careful' | 'balanced' | 'aggressive'>('balanced');

  if (!gameState) return null;

  const isTeamMode = gameState.gameMode === 'team';
  const players = gameState.players || [];
  const maxPlayers = isTeamMode ? 4 : 6;
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

  // Team mode collections
  const teams = gameState.teams || [
    { id: 'team_red', name: 'Красная Команда', color: { name: 'Красный', hex: '#FF5252', bgHex: 'rgba(255, 82, 82, 0.2)', text: '#FFFFFF', icon: '🔴' }, money: 2250, properties: [], playerIds: [], isBankrupt: false },
    { id: 'team_blue', name: 'Синяя Команда', color: { name: 'Синий', hex: '#448AFF', bgHex: 'rgba(68, 138, 255, 0.2)', text: '#FFFFFF', icon: '🔵' }, money: 2250, properties: [], playerIds: [], isBankrupt: false }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 py-6 px-4 select-none">
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

          {/* Room Mode Badge & Code Banner */}
          <div className="flex flex-col items-center gap-2 mt-3">
            {gameState.gameMode === 'reverse' && (
              <div className="w-full p-2.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center shrink-0">
                    <RotateCw className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-purple-200">
                      Режим «Наоборот» (Reverse) 🔄
                    </span>
                    <span className="text-[10px] text-purple-300">
                      Побеждает игрок с МЕНЬШИМ капиталом • Лимит: {gameState.maxRounds || 20} раундов
                    </span>
                  </div>
                </div>
                <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/50 text-[10px] font-black px-2 py-0.5 shrink-0">
                  {gameState.maxRounds || 20} РАУНДОВ
                </Badge>
              </div>
            )}

            {isTeamMode && (
              <div className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-red-500/20 border border-blue-400/40 flex items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-400/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-blue-200">
                      Командный режим 2v2 👥
                    </span>
                    <span className="text-[10px] text-blue-300">
                      🔴 Красные vs 🔵 Синие • Общая казна $2250 • Командные монополии и $0 рента своим
                    </span>
                  </div>
                </div>
                <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-[10px] font-black px-2 py-0.5 shrink-0">
                  2v2 КОМАНДЫ
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 flex-wrap">
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
          </div>
        </CardHeader>

        {/* Players Content */}
        <CardContent className="flex flex-col gap-3 py-2">
          {/* Difficulty Toolbar for host */}
          {isHost && emptySlotsCount > 0 && (
            <div className="flex items-center justify-between px-1 bg-black/30 p-2 rounded-2xl border border-white/5 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground ml-1">
                  Сложность ботов:
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
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Агрессор</span>
                </button>
              </div>

              {!isTeamMode && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 px-2.5 text-[10px] font-black shadow-sm"
                  onClick={() => addBot(selectedBotDiff)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>+ Добавить бота</span>
                </Button>
              )}
            </div>
          )}

          {/* TEAM MODE 2v2 LAYOUT */}
          {isTeamMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => {
                const teamPlayers = players.filter((p) => p.teamId === team.id);
                const isRed = team.id === 'team_red';
                const teamMax = 2;
                const teamEmptyCount = Math.max(0, teamMax - teamPlayers.length);
                const myPlayer = players.find((p) => p.id === playerId);
                const isMyTeam = myPlayer && myPlayer.teamId === team.id;

                return (
                  <div
                    key={team.id}
                    className={cn(
                      'flex flex-col gap-2.5 p-3.5 rounded-2xl border transition-all',
                      isRed
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    )}
                  >
                    {/* Team Column Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{isRed ? '🔴' : '🔵'}</span>
                        <span className="font-black text-sm text-foreground">
                          {team.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] font-black px-1.5 py-0 border',
                            isRed ? 'border-red-500/40 text-red-300' : 'border-blue-500/40 text-blue-300'
                          )}
                        >
                          {teamPlayers.length} / {teamMax}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isMyTeam && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={teamPlayers.length >= teamMax}
                            className={cn(
                              'h-6 px-2 text-[10px] font-black border transition-all',
                              teamPlayers.length >= teamMax
                                ? 'opacity-40 cursor-not-allowed border-white/10 text-muted-foreground'
                                : isRed
                                ? 'border-red-500/40 text-red-300 hover:bg-red-500/20'
                                : 'border-blue-500/40 text-blue-300 hover:bg-blue-500/20'
                            )}
                            onClick={() => setPlayerTeam(team.id)}
                            title={teamPlayers.length >= teamMax ? 'Команда уже заполнена (максимум 2 игрока)' : undefined}
                          >
                            <span>{teamPlayers.length >= teamMax ? 'Заполнено' : 'Перейти'}</span>
                          </Button>
                        )}
                        {isHost && teamEmptyCount > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            className={cn(
                              'h-6 px-2 text-[10px] font-black shadow-sm flex items-center gap-1',
                              isRed ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                            )}
                            onClick={() => addBot(selectedBotDiff, team.id)}
                            title={`Добавить бота в ${team.name}`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>+ Бот ({isRed ? '🔴' : '🔵'})</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Team Players List */}
                    <div className="flex flex-col gap-2">
                      {teamPlayers.map((p) => {
                        const isPlayerHost = p.id === gameState.hostId;
                        const isMe = p.id === playerId;
                        const isBot = Boolean(p.isBot);
                        const pet = getPetCharacter(p.characterId);
                        const otherTeamId = isRed ? 'team_blue' : 'team_red';
                        const otherTeamMembers = players.filter((pl) => pl.teamId === otherTeamId);
                        const canMoveToOtherTeam = isHost && otherTeamMembers.length < teamMax;

                        return (
                          <div
                            key={p.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              isMe
                                ? 'bg-primary/20 border-primary/50 shadow-md ring-1 ring-primary/30'
                                : isBot
                                ? 'bg-black/40 border-white/10'
                                : 'bg-black/30 border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <PetAvatar
                                  characterId={p.characterId}
                                  anim="idle"
                                  size="sm"
                                  showPedestal={true}
                                  pedestalColor={isRed ? '#FF5252' : '#448AFF'}
                                />
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-foreground truncate max-w-[95px]">
                                    {p.name}
                                  </span>
                                  {isMe && <Badge variant="gold" className="text-[8px] px-1 py-0">ВЫ</Badge>}
                                  {isBot && (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'text-[8px] px-1 py-0 font-black border flex items-center gap-0.5',
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
                                  {pet.name} {pet.emoji}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isMe && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-1.5 text-[10px] font-bold text-primary hover:bg-primary/20 flex items-center gap-0.5"
                                  onClick={() => openModal('characterPicker')}
                                  title="Сменить персонажа"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Скин</span>
                                </Button>
                              )}

                              {isPlayerHost && (
                                <Badge variant="secondary" className="text-[9px] font-bold flex items-center gap-0.5 px-1 py-0">
                                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                                  Хост
                                </Badge>
                              )}

                              {/* Host can transfer bot or other player to the other team */}
                              {canMoveToOtherTeam && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-1.5 text-[9px] font-bold border-white/20 hover:bg-white/10 text-muted-foreground hover:text-white"
                                  onClick={() => setPlayerTeam(otherTeamId, p.id)}
                                  title={isRed ? 'Переместить в Синюю команду' : 'Переместить в Красную команду'}
                                >
                                  <span>{isRed ? 'В 🔵' : 'В 🔴'}</span>
                                </Button>
                              )}

                              {isHost && isBot && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg"
                                  onClick={() => removeBot(p.id)}
                                  title="Удалить бота"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Empty Team Slots */}
                      {Array.from({ length: teamEmptyCount }).map((_, slotIdx) => (
                        <div
                          key={`empty-team-${team.id}-${slotIdx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-7 h-7 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground/60">
                              #{teamPlayers.length + slotIdx + 1}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Свободно в {isRed ? 'Красных' : 'Синих'}
                            </span>
                          </div>

                          {isHost && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'h-6 px-2 text-[10px] font-bold border transition-all',
                                isRed
                                  ? 'border-red-500/30 text-red-300 hover:bg-red-500/20'
                                  : 'border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                              )}
                              onClick={() => addBot(selectedBotDiff, team.id)}
                              title={`Добавить бота в ${team.name}`}
                            >
                              <Bot className="w-3 h-3 mr-1" />
                              <span>+ Бот ({isRed ? '🔴' : '🔵'})</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* STANDARD / REVERSE MODE LAYOUT */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Empty Slots */}
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
          )}
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
