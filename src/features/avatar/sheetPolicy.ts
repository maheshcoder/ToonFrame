export const MIN_POSE_PIXELS = 256;
export const MAX_OCCASION_POSES = 12;
export const MAX_SHEET_POSES = 48;
export const MAX_SHEET_PIXELS = 24_000_000;
export const SHEET_RATIO_TOLERANCE = .005;
export const ALLOWED_BUILTIN_RATIOS = [2 / 3, 3 / 4] as const;
export function validateSheetQuality(width: number, height: number, columns: number, rows: number, occasion = false): string[] {
  const errors: string[] = [];
  if (![width,height,columns,rows].every((value) => Number.isFinite(value) && value > 0)) return ['Image dimensions and grid must be positive.'];
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) errors.push('Grid columns and rows must be whole numbers.');
  const ratios = occasion ? ALLOWED_BUILTIN_RATIOS : columns === 1 && rows === 1 ? [1, 2 / 3] : [2 / 3];
  if (!ratios.some((ratio) => Math.abs(width / height - ratio) <= SHEET_RATIO_TOLERANCE)) errors.push(occasion ? 'Use a 2:3 or 3:4 portrait sheet.' : 'Use a 2:3 portrait sheet.');
  if (columns * rows > (occasion ? MAX_OCCASION_POSES : MAX_SHEET_POSES)) errors.push('Too many poses in one image. Add another sheet instead of shrinking the characters.');
  if (occasion && (columns !== 3 || rows !== 4)) errors.push('Occasion sheets must use a 3 × 4 grid, up to 12 poses. Add another sheet for more.');
  if (width / columns < MIN_POSE_PIXELS || height / rows < MIN_POSE_PIXELS) errors.push('Keep every pose at least 256 × 256 pixels. Use a larger source image or a smaller approved grid.');
  if (width * height > MAX_SHEET_PIXELS) errors.push('Keep each sheet under 24 megapixels. Split a larger pack into another sheet.');
  return errors;
}