import type { Rect } from './framing.ts';
// Compare normalized character pixels, ignoring empty margins and tiny color noise.
// This detects copied poses; it does not infer emotion or verify face identity.
export function poseFingerprint(data: Uint8ClampedArray | Uint8Array, width: number, height: number, bounds: Rect): string | null {
  const x0 = Math.max(0, Math.ceil(bounds.x)), y0 = Math.max(0, Math.ceil(bounds.y));
  const x1 = Math.min(width, Math.floor(bounds.x + bounds.width)), y1 = Math.min(height, Math.floor(bounds.y + bounds.height));
  let left = x1, top = y1, right = x0, bottom = y0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] > 24 && Math.min(data[i], data[i+1], data[i+2]) < 210) {
      left = Math.min(left,x); top = Math.min(top,y); right = Math.max(right,x); bottom = Math.max(bottom,y);
    }
  }
  if (right - left < 8 || bottom - top < 8) return null;
  const signature: number[] = [];
  for (let row = 0; row < 64; row++) for (let column = 0; column < 64; column++) {
    const x = Math.round(left + column / 63 * (right - left)), y = Math.round(top + row / 63 * (bottom - top));
    const i = (y * width + x) * 4, alpha = data[i+3] / 255;
    for (let channel = 0; channel < 3; channel++) signature.push(Math.round((data[i+channel] * alpha + 255 * (1-alpha)) / 4));
  }
  return String.fromCharCode(...signature);
}
export function duplicatePoses(signatures: readonly (string | null)[]): [number,number][] {
  const seen = new Map<string,number>(), duplicates: [number,number][] = [];
  signatures.forEach((signature,index) => { if (!signature) return; const previous = seen.get(signature); if (previous !== undefined) duplicates.push([previous,index]); else seen.set(signature,index); });
  return duplicates;
}