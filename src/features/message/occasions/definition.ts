import type { Mood } from '../../avatar/catalog/index.ts';
import type { ThemeId } from '../../themes/index.ts';
export const OCCASION_GROUPS = ['Everyday', 'Milestones', 'Family days', 'Festivals'] as const;
export type OccasionDefinition = { id: string; label: string; emoji: string; heading: string; mood: Mood;
  group: typeof OCCASION_GROUPS[number]; theme: ThemeId; lead: string; reply: string; example: string };
