import { createTheme } from '../definition.ts';
export const FESTIVALS_THEMES = [
  createTheme("diwali", "Diwali lantern lights", '#f7eefb', '#c1a5d7', '#e8c17e', ['lantern', 'sparkle', 'lantern', 'star', 'lantern', 'sparkle', 'bunting'], { atmosphere: 'lanterns' }),
  createTheme("holi", "Holi colour splashes", '#fff1f5', '#dca7c4', '#b8cf8b', ['splash', 'splash', 'splash', 'splash', 'flower', 'splash'], { atmosphere: 'colors' }),
  createTheme("new-year", "New Year sparkle", '#faf3df', '#d6bd82', '#b6c8c7', ['star', 'confetti', 'sparkle', 'confetti', 'ribbon', 'star', 'bunting'], { atmosphere: 'confetti' }),
  createTheme("christmas", "Christmas gifts", '#ecf5ef', '#b1c8af', '#d8a4a4', ['tree', 'gift', 'star', 'sparkle', 'tree', 'gift'], { atmosphere: 'snow' }),
  createTheme("eid", "Eid crescent lanterns", '#eaf7f6', '#a8caca', '#d7c38b', ['moon', 'lantern', 'star', 'sparkle', 'lantern', 'moon'], { atmosphere: 'lanterns' }),
] as const;
