export interface PetCharacter {
  id: string;
  name: string;
  folder: string;
  slug: string;
  emoji: string;
  themeColor: string;
  description: string;
}

export const PET_CHARACTERS: PetCharacter[] = [
  { id: 'cat', name: 'Котёнок', folder: 'Cat', slug: 'cat', emoji: '🐱', themeColor: '#F59E0B', description: 'Ловкий и удачливый' },
  { id: 'dog', name: 'Щенок', folder: 'Dog', slug: 'dog', emoji: '🐶', themeColor: '#3B82F6', description: 'Верный и надежный' },
  { id: 'dragon', name: 'Дракон', folder: 'Dragon', slug: 'dragon', emoji: '🐲', themeColor: '#10B981', description: 'Хранитель богатств' },
  { id: 'fox', name: 'Лисичка', folder: 'Fox', slug: 'fox', emoji: '🦊', themeColor: '#F97316', description: 'Хитрый финансист' },
  { id: 'panda', name: 'Панда', folder: 'Panda', slug: 'panda', emoji: '🐼', themeColor: '#64748B', description: 'Спокойный магнат' },
  { id: 'penguin', name: 'Пингвин', folder: 'Penguin', slug: 'penguin', emoji: '🐧', themeColor: '#06B6D4', description: 'Хладнокровный стратег' },
  { id: 'bear', name: 'Медведь', folder: 'Bear', slug: 'bear', emoji: '🐻', themeColor: '#8B5CF6', description: 'Крупный инвестор' },
  { id: 'bunny', name: 'Зайчик', folder: 'Bunny', slug: 'bunny', emoji: '🐰', themeColor: '#EC4899', description: 'Быстрый девелопер' },
  { id: 'chick', name: 'Цыплёнок', folder: 'Chick', slug: 'chick', emoji: '🐥', themeColor: '#EAB308', description: 'Золотая курочка' },
  { id: 'frog', name: 'Лягушонок', folder: 'Frog', slug: 'frog', emoji: '🐸', themeColor: '#22C55E', description: 'Мастер длинных прыжков' },
  { id: 'ghost', name: 'Привидение', folder: 'Ghost', slug: 'ghost', emoji: '👻', themeColor: '#A855F7', description: 'Теневой олигарх' },
  { id: 'slime', name: 'Слайм', folder: 'Slime', slug: 'slime', emoji: '🟢', themeColor: '#14B8A6', description: 'Гибкий партнер' }
];

export const DEFAULT_PET_ID = 'cat';

export function getPetCharacter(id?: string | null): PetCharacter {
  if (!id) return PET_CHARACTERS[0];
  const found = PET_CHARACTERS.find((p) => p.id === id);
  return found || PET_CHARACTERS[0];
}

export function getPetSpriteUrl(
  characterId?: string | null,
  anim: 'idle' | 'jump' | 'happy' | 'sleep' = 'idle',
  size: 32 | 64 = 32
): string {
  const pet = getPetCharacter(characterId);
  return `/assets/pets/${pet.folder}/${pet.slug}_${anim}_${size}.png`;
}
