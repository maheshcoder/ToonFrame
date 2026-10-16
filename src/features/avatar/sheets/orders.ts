import type { Mood } from '../catalog/index.ts';
export const ORIGINAL_ORDER: Record<'male' | 'female', readonly Mood[]> = {
  male: ['happy', 'angry', 'cry', 'annoyed', 'thinking', 'sleepy', 'wink', 'surprised', 'love', 'awkward', 'confused', 'celebrate'],
  female: ['happy', 'angry', 'cry', 'annoyed', 'thinking', 'worried', 'love', 'neutral', 'excited', 'shy', 'surprised', 'wink'],
};
export const EXTRA_ORDER: Record<'male' | 'female', readonly Mood[]> = {
  male: ['neutral', 'sad', 'worried', 'scared', 'excited', 'proud', 'shy', 'grateful', 'curious', 'bored', 'calm', 'determined'],
  female: ['sad', 'confused', 'scared', 'sleepy', 'proud', 'awkward', 'grateful', 'curious', 'bored', 'calm', 'determined', 'celebrate'],
};
export const EXTRA_2_ORDER = [
  'joyful', 'laughing', 'gift', 'love-heart',
  'blushing', 'flirty', 'missing-you', 'kiss',
  'wave', 'cheering', 'playful', 'inviting',
  'mock-angry', 'pouting', 'frustrated', 'furious',
  'sorry', 'downcast', 'heartfelt', 'hopeful',
  'smug', 'cheeky', 'shocked', 'giggling',
] as const satisfies readonly Mood[];

