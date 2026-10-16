import { fallbackMood } from './catalog/index.ts';
import type { Mood } from './catalog/index.ts';
// This order is versioned: never append future expressions to an existing layout.
const ORIGINAL_UPLOAD_ORDER = ["neutral","happy","angry","sad","surprised","thinking","love","cry","wink","confused","sleepy","excited","worried","scared","proud","shy","awkward","annoyed","grateful","curious","bored","calm","determined","celebrate","joyful","laughing","gift","love-heart","blushing","flirty","missing-you","kiss","wave","cheering","playful","inviting","mock-angry","pouting","frustrated","furious","sorry","downcast","heartfelt","hopeful","smug","cheeky","shocked","giggling"] as const satisfies readonly Mood[];
export const SHEET_FORMATS = {
  '12': { columns: 3, rows: 4, width: 1024, height: 1536, minWidth: 768, order: ORIGINAL_UPLOAD_ORDER.slice(0,12) },
  '24': { columns: 4, rows: 6, width: 1024, height: 1536, minWidth: 1024, order: ORIGINAL_UPLOAD_ORDER.slice(0,24) },
  '48': { columns: 6, rows: 8, width: 1536, height: 2304, minWidth: 1536, order: ORIGINAL_UPLOAD_ORDER },
} as const;
export type SheetLayout = keyof typeof SHEET_FORMATS;
export const DEFAULT_SHEET_LAYOUT: SheetLayout = '48';
export const UPLOAD_ORDER = Object.fromEntries(Object.entries(SHEET_FORMATS).map(([id, format]) => [id, format.order])) as unknown as Record<SheetLayout, readonly Mood[]>;
export function uploadFrame(mood: Mood, layout: SheetLayout): number {
  const order = UPLOAD_ORDER[layout];
  const visited = new Set<Mood>();
  let current = mood;
  while (!order.includes(current) && !visited.has(current)) { visited.add(current); current = fallbackMood(current); }
  return Math.max(0, order.indexOf(current));
}
