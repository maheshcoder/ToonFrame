import type { AvatarSheet } from './definition.ts';
import { atlasFrames } from '../framing.ts';
import { ORIGINAL_ORDER, EXTRA_ORDER, EXTRA_2_ORDER } from './orders.ts';
import { BIRTHDAY_ORDER, BIRTHDAY_ALIASES, BIRTHDAY_POSES } from './birthday.ts';
export const MALE_SHEETS = [
  { src: '/avatars/male-expressions.png', columns: 3, rows: 4, order: ORIGINAL_ORDER.male },
  { src: '/avatars/male-extra.png', columns: 3, rows: 4, order: EXTRA_ORDER.male },
  { src: '/avatars/male-extra-2.png', columns: 4, rows: 6, order: EXTRA_2_ORDER, filter: 'brightness(1.1)',
    frames: atlasFrames(1024, 1536, [1, 257, 512, 769, 1023], [1, 259, 512, 767, 1023, 1275, 1534], .006) },
  { src: '/avatars/male/birthday/Male birthday expression-1.png', columns: 3, rows: 4, aspectRatio: 3 / 4,
    occasion: 'birthday', order: BIRTHDAY_ORDER, poses: BIRTHDAY_POSES, aliases: BIRTHDAY_ALIASES, filter: 'brightness(1.08)',
    frames: atlasFrames(1086, 1448, [2, 363, 723, 1084], [2, 362, 723, 1082, 1445], .008) },
] as const satisfies readonly AvatarSheet[];