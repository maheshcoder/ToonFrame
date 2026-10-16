import type { Mood } from '../avatar/expressions.ts';
import type { OccasionId } from './occasions/index.ts';
export const EMOTIONS = [
  { id: 'happy', label: 'Happy', emoji: '😄', mood: 'joyful' },
  { id: 'love', label: 'Loving', emoji: '🥰', mood: 'love-heart' },
  { id: 'shy', label: 'Shy', emoji: '🙈', mood: 'blushing' },
  { id: 'surprised', label: 'Surprised', emoji: '😮', mood: 'shocked' },
  { id: 'angry', label: 'Mock angry', emoji: '😤', mood: 'mock-angry' },
  { id: 'sad', label: 'Sad', emoji: '😔', mood: 'downcast' },
  { id: 'excited', label: 'Excited', emoji: '🤩', mood: 'cheering' },
  { id: 'playful', label: 'Playful', emoji: '😉', mood: 'playful' },
] as const satisfies readonly { id: string; label: string; emoji: string; mood: Mood }[];
export type EmotionId = 'auto' | typeof EMOTIONS[number]['id'];
export type MessageOptions = { occasion: OccasionId; emotion: EmotionId };
export const DEFAULT_MESSAGE_OPTIONS: MessageOptions = { occasion: 'just-because', emotion: 'auto' };
export function emotionMood(emotion: EmotionId): Mood | undefined {
  return EMOTIONS.find((item) => item.id === emotion)?.mood;
}

