import type { Atmosphere, DecorationKind } from './definition.ts';
type AtmosphereProfile = {
  description: string; action: string; shape: DecorationKind; count: number;
  cycle: number; direction: 'up' | 'down'; sway: number;
};
// Shared by the interactive card, the message player, and the video renderer.
export const ATMOSPHERE_PROFILES: Record<Atmosphere, AtmosphereProfile> = {
  confetti: { description: 'A warm glow and falling confetti for every big little moment.', action: 'Toss confetti', shape: 'confetti', count: 28, cycle: 9, direction: 'down', sway: 12 },
  hearts: { description: 'Little hearts drift up through a soft, rosy glow.', action: 'Send some love', shape: 'heart', count: 20, cycle: 11, direction: 'up', sway: 14 },
  disco: { description: 'A mirror ball, swaying party lights, and dancing sparkle.', action: 'Light up the party', shape: 'sparkle', count: 28, cycle: 8, direction: 'down', sway: 18 },
  petals: { description: 'A garden of floating petals and gentle, sunlit color.', action: 'Scatter petals', shape: 'flower', count: 18, cycle: 14, direction: 'down', sway: 18 },
  sunshine: { description: 'Warm rays, drifting leaves, and a pocketful of sunshine.', action: 'Spread sunshine', shape: 'sparkle', count: 18, cycle: 15, direction: 'up', sway: 10 },
  starlight: { description: 'Dreamy moonlight, slow-floating stars, and a soft twinkle.', action: 'Make a wish', shape: 'star', count: 22, cycle: 18, direction: 'up', sway: 7 },
  lanterns: { description: 'Glowing lanterns and a sky of golden sparkle.', action: 'Release a little light', shape: 'sparkle', count: 22, cycle: 14, direction: 'up', sway: 9 },
  snow: { description: 'Tiny snowflakes drift past festive gifts and evergreen trees.', action: 'Let it snow', shape: 'sparkle', count: 30, cycle: 14, direction: 'down', sway: 13 },
  breeze: { description: 'Paper planes and little leaves catch a gentle breeze.', action: 'Catch the breeze', shape: 'leaf', count: 16, cycle: 15, direction: 'up', sway: 22 },
  playful: { description: 'Drifting little stars bring just the right amount of drama.', action: 'Add a little drama', shape: 'star', count: 24, cycle: 10, direction: 'up', sway: 15 },
  colors: { description: 'A joyful splash of pink, gold, green, and floating color.', action: 'Throw some color', shape: 'splash', count: 22, cycle: 12, direction: 'up', sway: 20 },
};