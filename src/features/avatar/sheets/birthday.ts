import type { Mood } from '../catalog/index.ts';
// Both user-supplied birthday sheets use this visual order, left to right.
// Hopeful is the candle/wish pose; the other kiss pose blows a little heart.
export const BIRTHDAY_ORDER = [
  'wave', 'excited', 'laughing',
  'surprised', 'gift', 'hopeful',
  'grateful', 'heartfelt', 'blushing',
  'playful', 'cheering', 'kiss',
] as const satisfies readonly Mood[];
// Closely related feelings use the matching birthday pose. Sad/angry feelings
// keep their regular artwork because these sheets contain no such drawings.
export const BIRTHDAY_ALIASES = {
  neutral: 'heartfelt', happy: 'laughing', joyful: 'excited', celebrate: 'cheering',
  love: 'heartfelt', 'love-heart': 'heartfelt', shy: 'blushing', wink: 'playful',
  giggling: 'laughing', shocked: 'surprised', proud: 'cheering', inviting: 'wave',
  calm: 'heartfelt', flirty: 'playful',
} as const satisfies Readonly<Partial<Record<Mood, Mood>>>;
export const BIRTHDAY_POSES = [
  { label: 'Birthday hello', emoji: '👋' }, { label: 'Birthday excitement', emoji: '🥳' }, { label: 'Birthday laughter', emoji: '😄' },
  { label: 'Birthday surprise', emoji: '😲' }, { label: 'Birthday gift', emoji: '🎁' }, { label: 'Make a wish', emoji: '🎂' },
  { label: 'Birthday gratitude', emoji: '🥹' }, { label: 'Birthday love', emoji: '💛' }, { label: 'Birthday blush', emoji: '😊' },
  { label: 'Birthday wink', emoji: '😉' }, { label: 'Birthday cheer', emoji: '🎉' }, { label: 'Birthday kiss', emoji: '😘' },
] as const;
