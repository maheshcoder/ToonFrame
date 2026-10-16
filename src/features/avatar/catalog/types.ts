export type Motion = 'breathe' | 'bounce' | 'shake' | 'sway' | 'jump' | 'tilt';
export type ExpressionDefinition = {
  id: string; label: string; emoji: string; motion: Motion;
  group: 'classic' | 'personal' | 'custom';
  fallback: string;
  match?: { words?: readonly string[]; emojis?: readonly string[] };
};
