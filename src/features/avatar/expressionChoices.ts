import { GALLERY_MOODS, moodDetails } from './catalog/index.ts';
import type { Mood } from './catalog/index.ts';
import { BUILTIN_SHEETS } from './sheets/index.ts';
import { SHEET_FORMATS } from './uploadFormats.ts';
import { avatarFrame } from './types.ts';
import type { AvatarAsset, AvatarArtwork } from './types.ts';
export type ExpressionChoice = {
  id: string; mood: Mood; label: string; emoji: string; group: 'classic' | 'personal' | 'custom' | 'occasion';
  artwork?: AvatarArtwork; occasion?: string;
};
export function expressionChoices(avatar: AvatarAsset): ExpressionChoice[] {
  const choices: ExpressionChoice[] = [], seen = new Set<string>();
  const add = (choice: ExpressionChoice) => { if (!seen.has(choice.id)) { seen.add(choice.id); choices.push(choice); } };
  const moods = avatar.kind === 'upload' ? SHEET_FORMATS[avatar.layout].order.map(moodDetails) : GALLERY_MOODS;
  for (const mood of moods) {
    const frame = avatarFrame(avatar,mood.id);
    add({ id: frame.url + '#' + frame.frame, mood: mood.id, label: mood.label, emoji: mood.emoji, group: mood.group,
      ...(avatar.kind === 'builtin' ? { artwork: { src: frame.url, frame: frame.frame } } : {}) });
  }
  if (avatar.kind === 'builtin') for (const sheet of BUILTIN_SHEETS[avatar.id]) {
    if (!sheet.occasion) continue;
    sheet.order.forEach((mood,index) => {
      const pose = sheet.poses?.[index] ?? moodDetails(mood);
      add({ id: sheet.src + '#' + index, mood, label: pose.label, emoji: pose.emoji, group: 'occasion', occasion: sheet.occasion,
        artwork: { src: sheet.src, frame: index } });
    });
  }
  return choices;
}