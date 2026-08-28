import React from 'react';
import { PlayerData } from '@/types/game';
import { PetAvatar } from '@/components/common/PetAvatar';
import { cn } from '@/lib/utils';

interface PlayerTokenProps {
  player: PlayerData;
  isCurrentTurn?: boolean;
  isMoving?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  isCurrentTurn = false,
  isMoving = false,
  size = 'md',
}) => {
  const anim = isMoving ? 'jump' : player.inJail ? 'sleep' : 'idle';
  const avatarSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg';
  const playerHex = player.teamId === 'team_red'
    ? '#FF5252'
    : player.teamId === 'team_blue'
    ? '#448AFF'
    : player.color?.hex || '#3B82F6';

  return (
    <div
      className={cn(
        'player-token-standing flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 relative group',
        isMoving && 'scale-125 -translate-y-3 drop-shadow-2xl z-30',
        isCurrentTurn && !isMoving && 'hopping'
      )}
      title={`${player.name} ($${player.money})`}
    >
      {/* Turn indicator glow */}
      {isCurrentTurn && (
        <div className="absolute -top-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping pointer-events-none" />
      )}

      {/* Tiny Pet Sprite Animation */}
      <PetAvatar
        characterId={player.characterId}
        anim={anim}
        size={avatarSize}
        showPedestal={true}
        pedestalColor={playerHex}
      />

      {/* Player Color Ring Badge */}
      <div
        className="w-3.5 h-1.5 rounded-full mt-[-2px] border border-white/80 shadow-md"
        style={{
          backgroundColor: playerHex,
          boxShadow: `0 0 8px ${playerHex}`,
        }}
      />
    </div>
  );
};
