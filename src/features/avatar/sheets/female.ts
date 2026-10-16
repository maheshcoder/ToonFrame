import type { AvatarSheet } from './definition.ts';
import { atlasFrames } from '../framing.ts';
import { ORIGINAL_ORDER, EXTRA_ORDER, EXTRA_2_ORDER } from './orders.ts';
import { BIRTHDAY_ORDER, BIRTHDAY_ALIASES, BIRTHDAY_POSES } from './birthday.ts';
// Measured image boundaries preserve complete hair, flowers, hands and outfits.
export const FEMALE_SHEETS = [
  { src: '/avatars/female-expressions.png', columns: 3, rows: 4, order: ORIGINAL_ORDER.female,
    frames: atlasFrames(1024, 1536, [0, 347, 682, 1024], [0, 380, 755, 1127, 1536]) },
  { src: '/avatars/female-extra.png', columns: 3, rows: 4, order: EXTRA_ORDER.female,
    frames: atlasFrames(1024, 1536, [0, 343, 678, 1024], [0, 392, 774, 1150, 1536]) },
  { src: '/avatars/female-extra-2.png', columns: 4, rows: 6, order: EXTRA_2_ORDER,
    frames: atlasFrames(1024, 1536, [1, 276, 519, 773, 1023], [1, 254, 496, 745, 998, 1251, 1533], .006) },
  { src: '/avatars/female/birthday/Female Birthday-1.png', columns: 3, rows: 4, aspectRatio: 2 / 3,
    occasion: 'birthday', order: BIRTHDAY_ORDER, poses: BIRTHDAY_POSES, aliases: BIRTHDAY_ALIASES,
    frames: atlasFrames(1024, 1536, [1, 342, 682, 1023], [1, 369, 748, 1110, 1534], .008) },
] as const satisfies readonly AvatarSheet[];