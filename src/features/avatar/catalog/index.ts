import { CLASSIC_EXPRESSIONS } from './classic.ts';
import { PERSONAL_EXPRESSIONS } from './personal.ts';
import { CUSTOM_EXPRESSIONS } from './custom.ts';
import type { ExpressionDefinition } from './types.ts';
export const MOODS = [...CLASSIC_EXPRESSIONS, ...PERSONAL_EXPRESSIONS, ...CUSTOM_EXPRESSIONS] as const;
export type Mood = typeof MOODS[number]['id'];
export const isMood = (value: string): value is Mood => MOODS.some((item) => item.id === value);
export const moodDetails = (id: Mood) => MOODS.find((item) => item.id === id)!;
export function fallbackMood(id: Mood): Mood {
  const definition: ExpressionDefinition = moodDetails(id);
  return isMood(definition.fallback) ? definition.fallback : 'neutral';
}
export const GALLERY_MOODS = [...MOODS.filter((item) => item.group !== 'classic'), ...MOODS.filter((item) => item.group === 'classic')];
