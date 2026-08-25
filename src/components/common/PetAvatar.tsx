import React from 'react';
import { getPetCharacter, getPetSpriteUrl } from '@/lib/petCharacters';
import { cn } from '@/lib/utils';

interface PetAvatarProps {
  characterId?: string | null;
  anim?: 'idle' | 'jump' | 'happy' | 'sleep';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  showPedestal?: boolean;
  pedestalColor?: string;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  characterId,
  anim = 'idle',
  size = 'sm',
  className,
  style,
  showPedestal = false,
  pedestalColor,
}) => {
  const pet = getPetCharacter(characterId);
  const spriteSize = size === 'xl' ? 64 : 32;
  const spriteUrl = getPetSpriteUrl(pet.id, anim, spriteSize);

  const sizeClassMap = {
    sm: 'pet-sprite-32',
    md: 'pet-sprite-40',
    lg: 'pet-sprite-48',
    xl: 'pet-sprite-64',
  };

  const animClassMap = {
    idle: 'pet-anim-idle',
    jump: 'pet-anim-jump',
    happy: 'pet-anim-happy',
    sleep: 'pet-anim-sleep',
  };

  const colorHex = pedestalColor || pet.themeColor;

  return (
    <div
      className={cn('relative inline-flex flex-col items-center justify-center select-none', className)}
      style={style}
    >
      {/* Animated Sprite */}
      <div
        className={cn(sizeClassMap[size], animClassMap[anim], 'drop-shadow-md transition-transform')}
        style={{
          backgroundImage: `url("${spriteUrl}")`,
        }}
        title={`${pet.name} (${pet.description})`}
      />

      {/* Optional Pedestal/Glow */}
      {showPedestal && (
        <div
          className="w-4/5 h-1.5 rounded-full mt-[-3px] blur-[1px] opacity-75"
          style={{
            backgroundColor: colorHex,
            boxShadow: `0 0 8px ${colorHex}`,
          }}
        />
      )}
    </div>
  );
};
