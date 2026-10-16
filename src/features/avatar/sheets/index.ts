import { MALE_SHEETS } from './male.ts';
import { FEMALE_SHEETS } from './female.ts';
import type { AvatarSheet } from './definition.ts';
export const BUILTIN_SHEETS: Record<'male' | 'female', readonly AvatarSheet[]> = { male: MALE_SHEETS, female: FEMALE_SHEETS };
