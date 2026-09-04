import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PET_CHARACTERS, PetCharacter } from '@/lib/petCharacters';
import { PetAvatar } from '@/components/common/PetAvatar';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CharacterPickerModal: React.FC = () => {
  const { activeModal, closeModal, selectedCharacterId, setCharacterId, updateRoomCharacter, gameState } =
    useGame();

  const isOpen = activeModal === 'characterPicker';

  const handleSelect = (pet: PetCharacter) => {
    setCharacterId(pet.id);
    if (gameState && gameState.status === 'LOBBY') {
      updateRoomCharacter(pet.id);
    }
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-xl bg-card/95 border-border backdrop-blur-2xl shadow-2xl p-6 rounded-3xl">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Коллекция Tiny Pets</span>
          </div>
          <DialogTitle className="text-2xl font-black text-foreground">
            Выберите персонажа
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ваш анимированный питомец будет ходить по игровому полю и представлять вас в партии.
          </DialogDescription>
        </DialogHeader>

        {/* Character Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-3 max-h-[60vh] overflow-y-auto pr-1">
          {PET_CHARACTERS.map((pet) => {
            const isSelected = selectedCharacterId === pet.id;
            return (
              <button
                key={pet.id}
                onClick={() => handleSelect(pet)}
                className={cn(
                  'flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-200 text-center relative group cursor-pointer',
                  isSelected
                    ? 'bg-primary/15 border-primary shadow-lg ring-2 ring-primary/40'
                    : 'bg-black/20 hover:bg-white/5 border-white/10 hover:border-white/20'
                )}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}

                {/* Animated Pet Sprite Preview */}
                <div className="my-1.5 flex items-center justify-center h-12">
                  <PetAvatar
                    characterId={pet.id}
                    anim={isSelected ? 'happy' : 'idle'}
                    size="md"
                    showPedestal={true}
                    pedestalColor={pet.themeColor}
                  />
                </div>

                <div className="flex flex-col items-center gap-0.5 mt-1 w-full">
                  <div className="flex items-center justify-center gap-1 w-full">
                    <span className="text-xs shrink-0">{pet.emoji}</span>
                    <span className="font-bold text-xs text-foreground truncate max-w-[100px] whitespace-nowrap">
                      {pet.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 leading-tight text-center">
                    {pet.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={closeModal} className="font-semibold text-xs">
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
