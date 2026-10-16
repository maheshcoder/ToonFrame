import { fallbackMood, MOODS, moodDetails } from './catalog/index.ts';
import type { Mood } from './catalog/index.ts';
import { SHEET_FORMATS, uploadFrame } from './uploadFormats.ts';
import type { SheetLayout } from './uploadFormats.ts';
import { BUILTIN_SHEETS } from './sheets/index.ts';
import { cropFrame } from './framing.ts';
export type AvatarArtwork = { src: string; frame: number };
export type AvatarAsset =
  | { kind: 'builtin'; id: 'male' | 'female'; name: string }
  | { kind: 'upload'; id: string; name: string; url: string; layout: SheetLayout };
export const BUILTINS: AvatarAsset[] = [
  { kind: 'builtin', id: 'male', name: 'Arjun' },
  { kind: 'builtin', id: 'female', name: 'Meera' },
];
export function avatarFrame(avatar: AvatarAsset, mood: Mood, occasion?: string, artwork?: AvatarArtwork) {
  if (avatar.kind === 'upload') {
    const { columns, rows } = SHEET_FORMATS[avatar.layout];
    return { url: avatar.url, frame: uploadFrame(mood, avatar.layout), columns, rows };
  }
  if (artwork) {
    const sheet = BUILTIN_SHEETS[avatar.id].find((item) => item.src === artwork.src);
    if (sheet && Number.isInteger(artwork.frame) && artwork.frame >= 0 && artwork.frame < sheet.order.length) {
      return { url: sheet.src, frame: artwork.frame, columns: sheet.columns, rows: sheet.rows };
    }
  }
  let current = mood;
  for (let tries = 0; tries <= MOODS.length; tries++) {
    for (const sheet of [...BUILTIN_SHEETS[avatar.id]].reverse()) {
      if (sheet.occasion && sheet.occasion !== occasion) continue;
      const frame = sheet.order.indexOf(sheet.aliases?.[current] ?? current);
      if (frame >= 0) return { url: sheet.src, frame, columns: sheet.columns, rows: sheet.rows };
    }
    current = fallbackMood(current);
  }
  throw new Error('No frame or fallback for ' + avatar.id + ': ' + mood);
}
export function avatarSheetAspectRatio(url: string): number {
  return Object.values(BUILTIN_SHEETS).flat().find((sheet) => sheet.src === url)?.aspectRatio ?? 2 / 3;
}
export function avatarFrameFilter(url: string): string {
  return Object.values(BUILTIN_SHEETS).flat().find((sheet) => sheet.src === url)?.filter ?? 'none';
}

export function avatarSourceRect(frame: { url: string; frame: number; columns: number; rows: number }, width: number, height: number) {
  const bounds = Object.values(BUILTIN_SHEETS).flat().find((sheet) => sheet.src === frame.url)?.frames?.[frame.frame];
  return bounds ? { x: bounds.x * width, y: bounds.y * height, width: bounds.width * width, height: bounds.height * height }
    : cropFrame(width, height, frame.frame, frame.columns, frame.rows);
}

export function avatarExpressionDetails(avatar: AvatarAsset, mood: Mood, occasion?: string, artwork?: AvatarArtwork) {
  const frame = avatarFrame(avatar,mood,occasion,artwork);
  const pose = Object.values(BUILTIN_SHEETS).flat().find((sheet) => sheet.src === frame.url)?.poses?.[frame.frame];
  return { ...moodDetails(mood), ...(pose ?? {}) };
}
