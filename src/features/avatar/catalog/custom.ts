import type { ExpressionDefinition } from './types.ts';
// Add future expression definitions here. IDs must be unique and permanent.
// Example (add artwork in sheets/male.ts and sheets/female.ts):
// { id: 'relieved', label: 'Relieved', emoji: '😮‍💨', motion: 'breathe',
//   group: 'custom', fallback: 'calm',
//   match: { words: ['relieved', 'what a relief'], emojis: ['😮‍💨'] } },
export const CUSTOM_EXPRESSIONS = [] as const satisfies readonly ExpressionDefinition[];
