import React from 'react';
import { PlayerData } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { PetAvatar } from '@/components/common/PetAvatar';
import { getPetCharacter } from '@/lib/petCharacters';
import { formatMoney } from '@/lib/utils';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerHUDCardProps {
  player: PlayerData;
  isCurrentTurn: boolean;
  isMe: boolean;
}

export const PlayerHUDCard: React.FC<PlayerHUDCardProps> = ({
  player,
  isCurrentTurn,
  isMe,
}) => {
  const pet = getPetCharacter(player.characterId);

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1.5 sm:p-2.5 rounded-2xl border transition-all select-none shadow-md backdrop-blur-md min-w-[130px] sm:min-w-[150px] md:min-w-[170px]',
        isCurrentTurn
          ? 'bg-primary/20 border-primary/60 ring-2 ring-primary/40 shadow-lg scale-[1.02]'
          : 'bg-card/85 border-white/10 hover:bg-white/5',
        player.isBankrupt && 'opacity-40 saturate-0',
        !player.isConnected && 'border-red-500/50 bg-red-950/20'
      )}
    >
      {/* Animated Pet Avatar */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
        <PetAvatar
          characterId={player.characterId}
          anim={isCurrentTurn ? 'idle' : player.inJail ? 'sleep' : 'idle'}
          size="sm"
          showPedestal={true}
          pedestalColor={player.color?.hex}
        />
      </div>

      {/* Info: Name & Cash */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[11px] sm:text-xs font-bold text-foreground truncate max-w-[80px] sm:max-w-[100px]">
            {player.name}
          </span>
          {isMe && (
            <Badge variant="gold" className="text-[7px] sm:text-[8px] font-bold px-1 py-0 h-3.5">
              ВЫ
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] sm:text-xs font-black text-amber-400">
            {formatMoney(player.money)}
          </span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold">
            {player.propertiesCount || player.properties?.length || 0}н
          </span>
        </div>
      </div>

      {/* Status Badges: Jail, Disconnect, Bankrupt */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {player.inJail && (
          <Badge variant="destructive" className="text-[7px] sm:text-[8px] px-1 py-0">
            🔒 Тюрьма
          </Badge>
        )}
        {!player.isConnected && (
          <Badge variant="destructive" className="text-[7px] sm:text-[8px] px-1 py-0 flex items-center gap-0.5 animate-pulse">
            <WifiOff className="w-2.5 h-2.5" />
            {player.disconnectBudgetSeconds || 60}с
          </Badge>
        )}
        {player.isBankrupt && (
          <Badge variant="destructive" className="text-[7px] sm:text-[8px] px-1 py-0">
            Банкрот
          </Badge>
        )}
      </div>
    </div>
  );
};
