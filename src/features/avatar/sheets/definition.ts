import type { Mood } from '../catalog/index.ts';
import type { Rect } from '../framing.ts';
export type AvatarSheet = {
  src: string; columns: number; rows: number; order: readonly Mood[];
  filter?: string; aspectRatio?: number;
  poses?: readonly { label: string; emoji: string }[];
  // Normalized source rectangles for artwork with uneven cell spacing.
  frames?: readonly Rect[];
  // An occasion pack overrides matching poses only for this occasion.
  occasion?: string;
  aliases?: Readonly<Partial<Record<Mood, Mood>>>;
};