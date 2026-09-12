export interface ThemeOption {
  id: string;
  name: string;
  desc: string;
  primary: string;
  bg: string;
  authOnly?: boolean;
}

export const THEMES: ThemeOption[] = [
  { id: 'classic', name: '🏛 Классический стиль', desc: 'Изумрудный стол и классическая доска', primary: '#10b981', bg: '#062016' },
  { id: 'soviet', name: '★ ЦУП Байконур 1961', desc: 'Советский космос (Только для авторизованных)', primary: '#dc2626', bg: '#040711', authOnly: true },
  { id: 'noir', name: '🔍 Film Noir 1947', desc: 'Детективный нуар (Только для авторизованных)', primary: '#d4a647', bg: '#0a0806', authOnly: true },
];

export const UI_SCALES = [
  { scale: 1.0, label: '100% (Обычный)' },
  { scale: 1.18, label: '120% (2K / 1440p)' },
  { scale: 1.35, label: '135% (Крупный)' },
];

export const PROPERTY_GROUPS: Record<string, { name: string; color: string }> = {
  BROWN: { name: 'Разработка & IT', color: '#8d6e63' },
  CYAN: { name: 'Мессенджеры & Связь', color: '#00b0ff' },
  PINK: { name: 'Медиа & Музыка', color: '#ec407a' },
  ORANGE: { name: 'Видео & Стриминг', color: '#ff9800' },
  RED: { name: 'Игровые платформы', color: '#f44336' },
  YELLOW: { name: 'E-commerce & Маркетплейсы', color: '#fdd835' },
  GREEN: { name: 'Мировые бренды', color: '#4caf50' },
  BLUE: { name: 'AI & Технологии', color: '#2962ff' },
  RAILROAD: { name: 'Транспортная сеть', color: '#455a64' },
  UTILITY: { name: 'Цифровые сервисы', color: '#78909c' },
};
