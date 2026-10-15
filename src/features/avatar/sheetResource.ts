import { SHEET_FORMATS } from './expressions.ts';
import type { SheetLayout } from './expressions.ts';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export type ImageDimensions = { width: number; height: number };
export function validateImage(file: Pick<File, 'type' | 'size' | 'name'>): string | null {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || !/\.(png|jpe?g|webp)$/i.test(file.name)) return 'Choose a PNG, JPG/JPEG, or WebP expression sheet.';
  if (!file.size) return 'This file is empty. Choose another image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Choose an image up to 10 MB.';
  return null;
}
export function validateDimensions({ width, height }: ImageDimensions, layout: SheetLayout) {
  if (Math.abs(width / height - 2 / 3) > 0.04) return 'Use a 2:3 portrait sheet, such as 1024 × 1536 px. A single portrait or square image will not line up with the expression grid.';
  const minimum = SHEET_FORMATS[layout].minWidth;
  if (width < minimum || height < minimum * 1.5) return 'This sheet is too small. Use ' + SHEET_FORMATS[layout].width + ' × ' + SHEET_FORMATS[layout].height + ' px for clear expressions.';
  return null;
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

/** The upload library owns URLs until removal, replacement, or app unmount. */
export class SheetResources {
  private owned = new Set<string>();
  private pending = new Set<string>();
  private generation = 0;
  private create: (file: File) => string;
  private revoke: (url: string) => void;
  private decode: (url: string) => Promise<ImageDimensions>;
  constructor(
    create = (file: File) => URL.createObjectURL(file),
    revoke = (url: string) => URL.revokeObjectURL(url),
    decode = decodeImage,
  ) { this.create = create; this.revoke = revoke; this.decode = decode; }

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
      this.pending.delete(url);
      this.owned.add(url);
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
    for (const url of this.owned) this.revoke(url);
    this.owned.clear();
  }
}
