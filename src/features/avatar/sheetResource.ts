import { SHEET_FORMATS } from './expressions.ts';
import type { SheetLayout } from './expressions.ts';
import { validateSheetQuality } from './sheetPolicy.ts';
import { cropFrame } from './framing.ts';
import { duplicatePoses, poseFingerprint } from './imageFingerprint.ts';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export type ImageDimensions = { width: number; height: number };
export function validateImage(file: Pick<File, 'type' | 'size' | 'name'>): string | null {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || !/\.(png|jpe?g|webp)$/i.test(file.name)) return 'Choose a PNG, JPG/JPEG, or WebP expression sheet.';
  if (!file.size) return 'This file is empty. Choose another image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Choose an image up to 10 MB.';
  return null;
}
export function validateDimensions({ width, height }: ImageDimensions, layout: SheetLayout) {
  const format = SHEET_FORMATS[layout];
  return validateSheetQuality(width, height, format.columns, format.rows)[0] ?? null;
}
export function decodeImage(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      image.onload = image.onerror = null;
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      image.onload = image.onerror = null;
      reject(new Error('This image could not be opened. Try another PNG, JPG, or WebP.'));
    };
    image.src = url;
  });
}
export async function inspectExpressionSheet(url: string, layout: SheetLayout, dimensions: ImageDimensions): Promise<string[]> {
  const image = new Image(); image.src = url; await image.decode();
  const { width, height } = dimensions, format = SHEET_FORMATS[layout];
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Your browser could not check this sheet. Try another browser.');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, width, height).data;
  const signatures = format.order.map((_, index) => poseFingerprint(pixels, width, height, cropFrame(width, height, index, format.columns, format.rows)));
  canvas.width = canvas.height = 0;
  const blank = signatures.indexOf(null);
  if (blank !== -1) throw new Error('Cell ' + (blank + 1) + ' looks empty. Every cell needs one clear character expression on a plain background.');
  const duplicate = duplicatePoses(signatures)[0];
  if (duplicate) throw new Error('Cells ' + (duplicate[0] + 1) + ' and ' + (duplicate[1] + 1) + ' repeat the same pose. Use a different expression in every cell.');
  return signatures as string[];
}

/** The upload library owns URLs and fingerprints until removal or app unmount. */
export class SheetResources {
  private owned = new Map<string, readonly string[]>();
  private pending = new Set<string>();
  private generation = 0;
  private create: (file: File) => string;
  private revoke: (url: string) => void;
  private decode: (url: string) => Promise<ImageDimensions>;
  private inspect: typeof inspectExpressionSheet;
  constructor(
    create = (file: File) => URL.createObjectURL(file),
    revoke = (url: string) => URL.revokeObjectURL(url),
    decode = decodeImage,
    inspect = inspectExpressionSheet,
  ) { this.create = create; this.revoke = revoke; this.decode = decode; this.inspect = inspect; }

  async load(file: File, layout: SheetLayout) {
    this.cancelPending();
    const generation = this.generation;
    const error = validateImage(file);
    if (error) throw new Error(error);
    const url = this.create(file);
    this.pending.add(url);
    try {
      const dimensions = await this.decode(url);
      if (generation !== this.generation) return null;
      const problem = validateDimensions(dimensions, layout);
      if (problem) throw new Error(problem);
      const signatures = await this.inspect(url, layout, dimensions);
      if (generation !== this.generation) return null;
      const existing = new Set([...this.owned.values()].flat());
      if (signatures.some((signature) => existing.has(signature))) throw new Error('This sheet repeats a pose already uploaded. Choose that character from your library, or upload a sheet with new expressions.');
      this.pending.delete(url);
      this.owned.set(url, signatures);
      return url;
    } catch (error) {
      if (generation !== this.generation) return null;
      throw error;
    } finally {
      if (this.pending.delete(url)) this.revoke(url);
    }
  }
  remove(url: string) { if (this.owned.delete(url)) this.revoke(url); }
  cancelPending() {
    ++this.generation;
    for (const url of this.pending) this.revoke(url);
    this.pending.clear();
  }
  dispose() {
    this.cancelPending();
    for (const url of this.owned.keys()) this.revoke(url);
    this.owned.clear();
  }
}