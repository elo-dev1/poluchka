const PET_CHARACTERS = [
  { id: 'cat', name: 'Котёнок', folder: 'Cat', slug: 'cat', emoji: '🐱', themeColor: '#F59E0B' },
  { id: 'dog', name: 'Щенок', folder: 'Dog', slug: 'dog', emoji: '🐶', themeColor: '#3B82F6' },
  { id: 'dragon', name: 'Дракон', folder: 'Dragon', slug: 'dragon', emoji: '🐲', themeColor: '#10B981' },
  { id: 'fox', name: 'Лисичка', folder: 'Fox', slug: 'fox', emoji: '🦊', themeColor: '#F97316' },
  { id: 'panda', name: 'Панда', folder: 'Panda', slug: 'panda', emoji: '🐼', themeColor: '#64748B' },
  { id: 'penguin', name: 'Пингвин', folder: 'Penguin', slug: 'penguin', emoji: '🐧', themeColor: '#06B6D4' },
  { id: 'bear', name: 'Медведь', folder: 'Bear', slug: 'bear', emoji: '🐻', themeColor: '#8B5CF6' },
  { id: 'bunny', name: 'Зайчик', folder: 'Bunny', slug: 'bunny', emoji: '🐰', themeColor: '#EC4899' },
  { id: 'chick', name: 'Цыплёнок', folder: 'Chick', slug: 'chick', emoji: '🐥', themeColor: '#EAB308' },
  { id: 'frog', name: 'Лягушонок', folder: 'Frog', slug: 'frog', emoji: '🐸', themeColor: '#22C55E' },
  { id: 'ghost', name: 'Привидение', folder: 'Ghost', slug: 'ghost', emoji: '👻', themeColor: '#A855F7' },
  { id: 'slime', name: 'Слайм', folder: 'Slime', slug: 'slime', emoji: '🟢', themeColor: '#14B8A6' },
  { id: 'detective', name: 'Детектив', folder: 'Detective', slug: 'detective', emoji: '🕵️', themeColor: '#D4A647' }
];

function getPetCharacter(id) {
  if (!id) return PET_CHARACTERS[0];
  return PET_CHARACTERS.find(p => p.id === id) || PET_CHARACTERS[0];
}

module.exports = {
  PET_CHARACTERS,
  getPetCharacter
};
