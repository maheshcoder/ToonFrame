import type { Mood } from './catalog/index.ts';
import { avatarFrame } from './types.ts';
import type { AvatarAsset } from './types.ts';
import { expressionChoices } from './expressionChoices.ts';
import type { ExpressionChoice } from './expressionChoices.ts';
import { OCCASIONS } from '../message/occasions/index.ts';
import type { OccasionId } from '../message/occasions/index.ts';
// Related poses are filters of existing artwork, never copied images or invented drawings.
// Dedicated occasion sheets take priority. New occasions get a useful default below.
export const RELATED_OCCASION_MOODS: Partial<Record<OccasionId, readonly Mood[]>> = {
  'just-because': ['wave','happy','curious','thinking','surprised','playful','wink','calm'],
  birthday: ['wave','excited','laughing','surprised','gift','hopeful','grateful','heartfelt','blushing','playful','cheering','kiss'],
  love: ['love','love-heart','missing-you','shy','blushing','flirty','kiss','heartfelt','hopeful','playful'],
  celebration: ['celebrate','joyful','excited','cheering','proud','laughing','giggling','shocked'],
  invitation: ['inviting','wave','excited','cheeky','wink','playful','gift','laughing'],
  'funny-anger': ['mock-angry','pouting','annoyed','frustrated','angry','furious','smug','playful','laughing'],
  apology: ['sorry','sad','downcast','worried','awkward','cry','heartfelt','hopeful','love'],
  teasing: ['playful','cheeky','wink','smug','giggling','mock-angry','pouting','confused','bored'],
  friendship: ['wave','happy','grateful','laughing','playful','heartfelt','cheering','joyful'],
  'thank-you': ['grateful','heartfelt','love-heart','happy','blushing','hopeful'],
  encouragement: ['determined','proud','cheering','hopeful','heartfelt','excited','calm'],
  'get-well': ['worried','sad','heartfelt','hopeful','calm','love','wave'],
  'good-morning': ['wave','happy','joyful','sleepy','calm','love','excited'],
  'good-night': ['sleepy','calm','love','missing-you','kiss','wave','heartfelt'],
  'date-invite': ['inviting','shy','blushing','flirty','awkward','love','kiss','excited'],
  anniversary: ['love','love-heart','heartfelt','kiss','grateful','joyful','gift','cheering'],
  graduation: ['proud','celebrate','cheering','joyful','excited','heartfelt','grateful'],
  'exam-wishes': ['determined','worried','scared','thinking','calm','hopeful','proud','cheering'],
  farewell: ['wave','sad','cry','downcast','missing-you','grateful','heartfelt','hopeful'],
  welcome: ['wave','joyful','excited','surprised','inviting','love','heartfelt'],
  reunion: ['excited','wave','joyful','missing-you','surprised','laughing','heartfelt'],
  engagement: ['love','love-heart','surprised','shocked','joyful','blushing','cheering','heartfelt'],
  wedding: ['heartfelt','love','joyful','grateful','blushing','cheering','kiss'],
  'new-baby': ['joyful','surprised','love','heartfelt','grateful','sleepy','cheering'],
  'mothers-day': ['love','heartfelt','grateful','gift','kiss','joyful'],
  'fathers-day': ['grateful','proud','heartfelt','love','laughing','gift','cheering'],
  rakhi: ['playful','mock-angry','pouting','love','gift','grateful','laughing','cheeky'],
  diwali: ['joyful','celebrate','gift','love','grateful','cheering','wave'],
  holi: ['playful','excited','laughing','giggling','cheeky','joyful','celebrate'],
  'new-year': ['excited','celebrate','cheering','hopeful','grateful','joyful','wave'],
  christmas: ['joyful','gift','surprised','love','grateful','cheering','inviting'],
  eid: ['grateful','heartfelt','joyful','love','inviting','wave','celebrate'],
};
export function expressionsForOccasion(avatar: AvatarAsset, occasion: string, catalog = expressionChoices(avatar)): ExpressionChoice[] {
  const dedicated = catalog.filter((choice) => choice.occasion === occasion);
  if (dedicated.length) return dedicated;
  const definition = OCCASIONS.find((item) => item.id === occasion);
  if (!definition) return [];
  const moods = RELATED_OCCASION_MOODS[definition.id] ?? [definition.mood,'happy','heartfelt','hopeful','wave'];
  const ids = new Set(moods.map((mood) => { const frame = avatarFrame(avatar,mood); return frame.url + '#' + frame.frame; }));
  return catalog.filter((choice) => ids.has(choice.id));
}