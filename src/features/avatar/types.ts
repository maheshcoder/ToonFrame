import { EXTRA_2_ORDER, EXTRA_ORDER, ORIGINAL_ORDER, SHEET_FORMATS, uploadFrame } from './expressions.ts';
import type { Mood, SheetLayout } from './expressions.ts';

export type AvatarAsset =
  | { kind: 'builtin'; id: 'male' | 'female'; name: string }
  | { kind: 'upload'; id: string; name: string; url: string; layout: SheetLayout };
export const BUILTINS: AvatarAsset[] = [
  { kind: 'builtin', id: 'male', name: 'Arjun' },
  { kind: 'builtin', id: 'female', name: 'Meera' },
];

export function avatarFrame(avatar: AvatarAsset, mood: Mood) {
  if (avatar.kind === 'upload') {
    const { columns, rows } = SHEET_FORMATS[avatar.layout];
    return { url: avatar.url, frame: uploadFrame(mood, avatar.layout), columns, rows };
  }
  const sheets: { suffix: string; order: readonly Mood[]; columns: number; rows: number }[] = [
    { suffix: 'expressions', order: ORIGINAL_ORDER[avatar.id], columns: 3, rows: 4 },
    { suffix: 'extra', order: EXTRA_ORDER[avatar.id], columns: 3, rows: 4 },
    { suffix: 'extra-2', order: EXTRA_2_ORDER, columns: 4, rows: 6 },
  ];
  for (const sheet of sheets) {
    const frame = sheet.order.indexOf(mood);
    if (frame >= 0) return { url: '/avatars/' + avatar.id + '-' + sheet.suffix + '.png', frame, columns: sheet.columns, rows: sheet.rows };
  }
  throw new Error('No built-in frame for expression: ' + mood);
}

// The user-added male sheet has a light gray backdrop. Lift it to white for
// the multiply blend, consistently in CSS and canvas, without changing the file.
export function avatarFrameFilter(url: string): string {
  return url === '/avatars/male-extra-2.png' ? 'brightness(1.1)' : 'none';
}