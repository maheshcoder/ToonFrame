import type { Mood } from '../catalog/index.ts';

// Both user-supplied Diwali sheets use this visual order, left to right,
// top to bottom. Labels describe the individual drawings in the keyboard.
export const DIWALI_ORDER = [
  'wave', 'excited', 'grateful',
  'surprised', 'gift', 'kiss',
  'heartfelt', 'celebrate', 'blushing',
  'wink', 'cheering', 'love',
] as const satisfies readonly Mood[];

// Diwali's default is joyful. These related feelings use the provided festival
// art automatically; unrelated feelings keep their normal artwork.
export const DIWALI_ALIASES = {
  joyful: 'excited', happy: 'excited', 'love-heart': 'love',
  proud: 'cheering', inviting: 'wave', playful: 'wink',
  giggling: 'excited', shocked: 'surprised', calm: 'heartfelt',
} as const satisfies Readonly<Partial<Record<Mood, Mood>>>;

export const DIWALI_POSES = [
  { label: 'Diya greeting', emoji: '🪔' },
  { label: 'Sparkler excitement', emoji: '✨' },
  { label: 'Diwali namaste', emoji: '🙏' },
  { label: 'Firework surprise', emoji: '🎆' },
  { label: 'Festival gift', emoji: '🎁' },
  { label: 'Diya kiss', emoji: '😘' },
  { label: 'Grateful glow', emoji: '🥹' },
  { label: 'Sweets celebration', emoji: '🍬' },
  { label: 'Festive blush', emoji: '😊' },
  { label: 'Lights wink', emoji: '😉' },
  { label: 'Firework cheer', emoji: '🎉' },
  { label: 'Lantern kiss', emoji: '💖' },
] as const;
