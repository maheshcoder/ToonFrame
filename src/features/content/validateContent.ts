import { ALLOWED_BUILTIN_RATIOS, MAX_OCCASION_POSES, MAX_SHEET_POSES, SHEET_RATIO_TOLERANCE } from '../avatar/sheetPolicy.ts';
import { MOODS } from '../avatar/catalog/index.ts';
import type { ExpressionDefinition } from '../avatar/catalog/types.ts';
import { BUILTIN_SHEETS } from '../avatar/sheets/index.ts';
import { SHEET_FORMATS } from '../avatar/uploadFormats.ts';
import { OCCASIONS } from '../message/occasions/index.ts';
import { THEMES } from '../themes/index.ts';
import type { ThemeDefinition } from '../themes/definition.ts';
import { ATMOSPHERES } from '../themes/definition.ts';
import { THEME_SHAPES } from '../themes/shapes.ts';
type Content = {
  expressions: readonly ExpressionDefinition[];
  sheets: Record<string, readonly { src: string; columns: number; rows: number; order: readonly string[]; aspectRatio?: number; occasion?: string; poses?: readonly { label: string; emoji: string }[]; aliases?: Readonly<Record<string, string | undefined>>; frames?: readonly { x: number; y: number; width: number; height: number }[] }[]>;
  uploads: Record<string, { columns: number; rows: number; order: readonly string[] }>;
  themes: readonly ThemeDefinition[];
  occasions: readonly { id: string; theme: string; mood: string; lead: string; reply: string; example: string }[];
};
export const APP_CONTENT: Content = { expressions: MOODS, sheets: BUILTIN_SHEETS, uploads: SHEET_FORMATS, themes: THEMES, occasions: OCCASIONS };
export function validateContent(content: Content = APP_CONTENT): string[] {
  const errors: string[] = [];
  const uniqueIds = (items: readonly { id: string }[], label: string) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (!/^[a-z]+(?:-[a-z]+)*$/.test(item.id)) errors.push(label + ': use lowercase words/hyphens for ID ' + item.id);
      if (seen.has(item.id)) errors.push(label + ': duplicate ID ' + item.id);
      seen.add(item.id);
    }
    return seen;
  };
  const expressionIds = uniqueIds(content.expressions, 'Expressions');
  const themeIds = uniqueIds(content.themes, 'Themes');
  const occasionIds = uniqueIds(content.occasions, 'Occasions');
  if (!expressionIds.has('neutral')) errors.push('Expressions: neutral is required as the final fallback.');
  for (const item of content.expressions) {
    if (!expressionIds.has(item.fallback)) errors.push(item.id + ': unknown fallback ' + item.fallback);
    for (const word of [...(item.match?.words ?? []), ...(item.match?.emojis ?? [])]) {
      if (!word.trim()) errors.push(item.id + ': recognition phrases/emoji cannot be empty.');
    }
    const visited = new Set<string>();
    let next = item.id;
    while (next !== 'neutral' && expressionIds.has(next)) {
      if (visited.has(next)) { errors.push(item.id + ': fallback cycle at ' + next); break; }
      visited.add(next);
      next = content.expressions.find((entry) => entry.id === next)!.fallback;
    }
  }
  const checkGrid = (label: string, grid: { columns: number; rows: number; order: readonly string[] }) => {
    if (!Number.isInteger(grid.columns) || !Number.isInteger(grid.rows) || grid.columns < 1 || grid.rows < 1) errors.push(label + ': columns and rows must be positive integers.');
    if (!grid.order.length) errors.push(label + ': a sheet must contain at least one expression.');
    if (grid.order.length > grid.columns * grid.rows) errors.push(label + ': more poses than grid cells.');
    if (new Set(grid.order).size !== grid.order.length) errors.push(label + ': duplicate expression in the same sheet.');
    for (const id of grid.order) if (!expressionIds.has(id)) errors.push(label + ': unknown expression ' + id);
  };
  const sources = new Set<string>();
  for (const [avatar, sheets] of Object.entries(content.sheets)) for (const sheet of sheets) {
    if (sources.has(sheet.src)) errors.push(sheet.src + ': duplicate sheet registration. Register each image once.');
    sources.add(sheet.src);
    if (sheet.columns * sheet.rows > (sheet.occasion ? MAX_OCCASION_POSES : MAX_SHEET_POSES)) errors.push(sheet.src + ': too many poses; split this pack into another sheet.');
    if (sheet.occasion && (sheet.columns !== 3 || sheet.rows !== 4)) errors.push(sheet.src + ': occasion sheets require a 3 × 4 grid, maximum 12 poses.');
    const aspect = sheet.aspectRatio ?? 2 / 3;
    const allowedRatios = sheet.occasion ? ALLOWED_BUILTIN_RATIOS : sheet.columns === 1 && sheet.rows === 1 ? [1, 2 / 3] : [2 / 3];
    if (!allowedRatios.some((ratio) => Math.abs(aspect - ratio) <= SHEET_RATIO_TOLERANCE)) errors.push(sheet.src + ': use an approved fixed sheet ratio.');
    if (sheet.poses && (sheet.poses.length !== sheet.order.length || sheet.poses.some((pose) => !pose.label.trim() || !pose.emoji.trim()))) errors.push(sheet.src + ': provide one nonempty label and emoji per pose.');
    if (sheet.occasion && !occasionIds.has(sheet.occasion)) errors.push(sheet.src + ': unknown occasion ' + sheet.occasion);
    for (const [alias, target] of Object.entries(sheet.aliases ?? {})) {
      if (!expressionIds.has(alias)) errors.push(sheet.src + ': unknown expression alias ' + alias);
      if (!target || !sheet.order.includes(target)) errors.push(sheet.src + ': alias target is not in this sheet: ' + target);
    }
    if (sheet.frames) {
      if (sheet.frames.length !== sheet.columns * sheet.rows) errors.push(sheet.src + ': frame rectangles must cover every grid cell.');
      for (let i = 0; i < sheet.frames.length; i++) for (let j = 0; j < i; j++) {
        const a = sheet.frames[i], b = sheet.frames[j];
        if (Math.min(a.x+a.width,b.x+b.width) > Math.max(a.x,b.x) + .0001 && Math.min(a.y+a.height,b.y+b.height) > Math.max(a.y,b.y) + .0001) errors.push(sheet.src + ': frame rectangles overlap or repeat.');
      }
      for (const frame of sheet.frames) {
        if (![frame.x, frame.y, frame.width, frame.height].every(Number.isFinite) || frame.x < 0 || frame.y < 0 || frame.width <= 0 || frame.height <= 0 || frame.x + frame.width > 1 || frame.y + frame.height > 1) errors.push(sheet.src + ': frame rectangle must stay within the source image.');
      }
    }
    checkGrid(avatar + ' ' + sheet.src, sheet);
    if (!sheet.src.startsWith('/avatars/')) errors.push(avatar + ': sheet assets must be under public/avatars/.');
    if (sheet.aspectRatio !== undefined && (!Number.isFinite(sheet.aspectRatio) || sheet.aspectRatio <= 0)) errors.push(sheet.src + ': invalid aspectRatio.');
  }
  for (const [id, format] of Object.entries(content.uploads)) {
    checkGrid('Upload ' + id, format);
    if (Number(id) !== format.order.length) errors.push('Upload ' + id + ': pose count must match its permanent layout ID.');
  }
  const color = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
  for (const theme of content.themes) {
    if (!ATMOSPHERES.includes(theme.atmosphere)) errors.push(theme.id + ': unknown atmosphere ' + theme.atmosphere);
    if (![theme.background, theme.accent, theme.secondary].every(color)) errors.push(theme.id + ': use six-digit hex theme colors.');
    if (theme.image && !theme.image.startsWith('/themes/')) errors.push(theme.id + ': background images must be under public/themes/.');
    if (theme.imageOpacity !== undefined && (!Number.isFinite(theme.imageOpacity) || theme.imageOpacity < 0 || theme.imageOpacity > 1)) errors.push(theme.id + ': imageOpacity must be between 0 and 1.');
    for (const item of theme.decorations) {
      if (!(item.shape in THEME_SHAPES)) errors.push(theme.id + ': unknown decoration ' + item.shape);
      if (![item.x, item.y].every((n) => Number.isFinite(n) && n >= 0 && n <= 1) || !Number.isFinite(item.size) || item.size <= 0 || item.size > .5 || !Number.isFinite(item.rotation)) errors.push(theme.id + ': invalid decoration position, size, or rotation.');
      if (!color(item.color)) errors.push(theme.id + ': invalid decoration color.');
    }
  }
  for (const occasion of content.occasions) {
    if (!themeIds.has(occasion.theme)) errors.push(occasion.id + ': unknown theme ' + occasion.theme);
    if (!expressionIds.has(occasion.mood)) errors.push(occasion.id + ': unknown default expression ' + occasion.mood);
    if (![occasion.lead, occasion.reply, occasion.example].every((value) => value.trim())) errors.push(occasion.id + ': examples and replies must not be empty.');
  }
  return errors;
}
