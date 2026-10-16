import { EVERYDAY_THEMES } from './packs/everyday.ts';
import { MILESTONES_THEMES } from './packs/milestones.ts';
import { FAMILY_THEMES } from './packs/family.ts';
import { FESTIVALS_THEMES } from './packs/festivals.ts';
import { CUSTOM_THEMES } from './packs/custom.ts';
export const THEMES = [...EVERYDAY_THEMES, ...MILESTONES_THEMES, ...FAMILY_THEMES, ...FESTIVALS_THEMES, ...CUSTOM_THEMES] as const;
export type ThemeId = typeof THEMES[number]['id'];
export const themeDetails = (id: ThemeId) => THEMES.find((item) => item.id === id)!;
