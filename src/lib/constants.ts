export const THEMES = [
  { id: 'midnight', name: '🌙 Midnight Neon', desc: 'Тёмный неон', primary: '#3b82f6', bg: '#0b0f19' },
  { id: 'classic', name: '🏛 Classic Emerald', desc: 'Изумруд и золото', primary: '#10b981', bg: '#062016' },
  { id: 'sunset', name: '🌅 Sunset Gold', desc: 'Золотой люкс', primary: '#f59e0b', bg: '#1c1004' },
  { id: 'light', name: '🏙 Minimal Light', desc: 'Светлая чистая', primary: '#2563eb', bg: '#f8fafc' },
];

export const UI_SCALES = [
  { scale: 1.0, label: '100% (Обычный)' },
  { scale: 1.18, label: '120% (2K / 1440p)' },
  { scale: 1.35, label: '135% (Крупный)' },
];

export const PROPERTY_GROUPS: Record<string, { name: string; color: string }> = {
  BROWN: { name: 'Коричневая', color: '#8d6e63' },
  CYAN: { name: 'Голубая', color: '#00b0ff' },
  PINK: { name: 'Розовая', color: '#ec407a' },
  ORANGE: { name: 'Оранжевая', color: '#ff9800' },
  RED: { name: 'Красная', color: '#f44336' },
  YELLOW: { name: 'Жёлтая', color: '#fdd835' },
  GREEN: { name: 'Зелёная', color: '#4caf50' },
  BLUE: { name: 'Тёмно-синяя', color: '#2962ff' },
  RAILROAD: { name: 'Вокзалы', color: '#455a64' },
  UTILITY: { name: 'Коммунальные', color: '#78909c' },
};
