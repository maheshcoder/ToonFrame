import type { AvatarArtwork } from '../avatar/types.ts';
import { matchEmoji, matchWords } from '../avatar/catalog/recognition.ts';
import { isMood, moodDetails, MOODS } from '../avatar/expressions.ts';
import type { Mood } from '../avatar/expressions.ts';
import { messageExample } from '../message/examples.ts';
import { DEFAULT_MESSAGE_OPTIONS, emotionMood, occasionDetails } from '../message/occasions.ts';
import type { MessageOptions, OccasionId } from '../message/occasions.ts';
export type StoryMode = 'auto' | 'solo' | 'dialogue';
export type Scene = { id: string; speakerIndex: number; speaker: string; text: string; mood: Mood; emoji: string; durationMs: number; artwork?: AvatarArtwork };
export type Story = { id: string; scenes: Scene[]; speakers: string[]; dialogue: boolean; durationMs: number; occasion: OccasionId };
export const MAX_SCRIPT_LENGTH = 5000;
export const SOLO_EXAMPLE = occasionDetails('birthday').example;
export const DIALOGUE_EXAMPLE = messageExample({ occasion: 'teasing', emotion: 'auto' }, true);
export function validateScript(text: string) {
  if (!text.trim()) return 'Write or paste a message first.';
  if (text.length > MAX_SCRIPT_LENGTH) return 'Keep your message to 5,000 characters or fewer.';
  if (!/[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(text)) return 'Add some words or emoji to your message.';
  return null;
}
const TAG_ALIASES: Record<string, Mood> = { loving: 'love' };
function tagMood(tag: string): Mood | undefined { return isMood(tag) ? tag : TAG_ALIASES[tag]; }
export function detectMood(text: string, options?: MessageOptions): Mood {
  const explicit = [...text.matchAll(/\[([a-z-]+)\]/gi)].map((match) => tagMood(match[1].toLowerCase())).find(Boolean);
  if (explicit) return explicit;
  const emoji = matchEmoji(text);
  if (emoji) return emoji;
  const selected = options && emotionMood(options.emotion);
  if (selected) return selected;
  const inferred = matchWords(text);
  if (inferred) return inferred;
  if (options && options.occasion !== 'just-because') return occasionDetails(options.occasion).mood;
  return /\?/.test(text) ? 'curious' : 'neutral';
}
function splitReadable(text: string): string[] {
  // A playful reversal deserves its own pose. Keep the word "but" in the message.
  const beats = text.split(/\s+(?=but\b)/i);
  const merged: string[] = [];
  for (const beat of beats) {
    const sentences = beat.match(/[^.!?]+[.!?]*/gu) ?? [beat];
    const local: string[] = [];
    for (const sentence of sentences) {
      let trimmed = sentence.trim();
      if (!trimmed) continue;
      // Emoji after punctuation belong to the preceding sentence, not the next one.
      const prefix = /^(?:[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u200D]\s*)+/u.exec(trimmed)?.[0];
      if (local.length && prefix) {
        local[local.length - 1] += ' ' + prefix.trim();
        trimmed = trimmed.slice(prefix.length).trim();
      }
      if (!trimmed) continue;
      if (local.length && !/[\p{L}\p{N}]/u.test(trimmed)) local[local.length - 1] += ' ' + trimmed;
      else local.push(trimmed);
    }
    merged.push(...local);
  }
  return merged.flatMap((sentence) => {
    if (sentence.length <= 180) return [sentence];
    const chunks: string[] = [];
    let remainder = sentence;
    while (remainder.length > 180) {
      let boundary = remainder.lastIndexOf(' ', 180);
      if (boundary < 30) boundary = 180;
      if (/[\uD800-\uDBFF]/.test(remainder[boundary - 1])) boundary--;
      chunks.push(remainder.slice(0, boundary).trim());
      remainder = remainder.slice(boundary).trim();
    }
    if (remainder) chunks.push(remainder);
    return chunks;
  });
}
export function sceneDuration(text: string) {
  return Math.min(12000, Math.max(2400, 1200 + text.trim().split(/\s+/).length * 370));
}
export function compileStory(text: string, mode: StoryMode = 'auto', options: MessageOptions = DEFAULT_MESSAGE_OPTIONS): Story {
  const problem = validateScript(text);
  if (problem) throw new Error(problem);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const labelled = lines.map((line) => {
    const match = /^([\p{L}\p{N}][\p{L}\p{N} _'-]{0,29}):\s+(.+)$/u.exec(line);
    return match ? { name: match[1].trim(), text: match[2] } : { name: null, text: line };
  });
  const names = [...new Map(labelled.filter((line) => line.name).map((line) => [line.name!.toLowerCase(), line.name!])).values()];
  const dialogue = mode === 'dialogue' || (mode === 'auto' && names.length >= 2);
  if (dialogue && names.length > 2) throw new Error('This studio supports two speakers. Use two names, or choose One character for your message.');
  if (dialogue && names.length < 2) throw new Error('For a conversation, start each line with a name, for example “Me: Hello!” and “Friend: Hi!”. Use two different names.');
  if (dialogue && labelled.some((line) => !line.name)) throw new Error('Add a speaker name to every conversation line, for example “Me: Hello!”.');
  const speakers = dialogue ? names : [names.length === 1 ? names[0] : 'You'];
  const scenes: Scene[] = [];
  for (const [lineIndex, line] of labelled.entries()) {
    const index = dialogue ? names.findIndex((name) => name.toLowerCase() === line.name?.toLowerCase()) : 0;
    const content = dialogue || names.length === 1 ? line.text : lines[lineIndex];
    for (const part of splitReadable(content)) {
      const mood = detectMood(part, options);
      const clean = part.replace(/\[([a-z-]+)\]/gi, (tag, word: string) => tagMood(word.toLowerCase()) ? '' : tag).trim();
      if (!clean) continue;
      scenes.push({ id: 'scene-' + scenes.length, speakerIndex: index, speaker: speakers[index], text: clean, mood, emoji: moodDetails(mood).emoji, durationMs: sceneDuration(clean) });
    }
  }
  if (!scenes.length) throw new Error('Add message text or emoji after an expression tag.');
  if (scenes.length > 60) throw new Error('That creates more than 60 scenes. Try a shorter message or combine a few sentences.');
  return { id: text + ':' + mode + ':' + options.occasion + ':' + options.emotion, occasion: options.occasion, scenes, speakers, dialogue, durationMs: scenes.reduce((sum, scene) => sum + scene.durationMs, 0) };
}
export function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}
export const MOOD_TAG_HELP = MOODS.map((mood) => '[' + mood.id + ']').join(', ');
