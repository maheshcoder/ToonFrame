import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { APP_CONTENT, validateContent } from '../src/features/content/validateContent.ts';
import { validateSheetQuality } from '../src/features/avatar/sheetPolicy.ts';
import { cropFrame } from '../src/features/avatar/framing.ts';
import { poseFingerprint } from '../src/features/avatar/imageFingerprint.ts';
import { pngPixels } from './lib/pngPixels.mjs';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url)).replace(/[\\/]$/, '');
const errors = validateContent(), files = new Map(), poses = new Map();
let count = 0;
function asset(url) {
  const path = resolve(publicRoot, '.' + decodeURIComponent(url));
  if (!path.startsWith(publicRoot + sep)) { errors.push('Asset path escapes public/: ' + url); return null; }
  if (!existsSync(path)) { errors.push('Missing asset: public' + url); return null; }
  return path;
}
for (const sheets of Object.values(APP_CONTENT.sheets)) for (const sheet of sheets) {
  const path = asset(sheet.src);
  if (!path) continue;
  try {
    if (!path.toLowerCase().endsWith('.png')) throw new Error('Save built-in expression sheets as PNG.');
    const bytes = readFileSync(path), hash = createHash('sha256').update(bytes).digest('hex');
    if (files.has(hash)) errors.push(sheet.src + ': duplicates image ' + files.get(hash));
    else files.set(hash, sheet.src);
    const { width, height, data } = pngPixels(bytes);
    for (const error of validateSheetQuality(width,height,sheet.columns,sheet.rows,Boolean(sheet.occasion))) errors.push(sheet.src + ': ' + error);
    if (Math.abs(width / height - (sheet.aspectRatio ?? 2 / 3)) > .005) errors.push(sheet.src + ': aspectRatio must match the source image.');
    for (let index = 0; index < sheet.order.length; index++) {
      const frame = sheet.frames?.[index];
      const bounds = frame ? { x: frame.x*width, y: frame.y*height, width: frame.width*width, height: frame.height*height } : cropFrame(width,height,index,sheet.columns,sheet.rows);
      const signature = poseFingerprint(data,width,height,bounds), location = sheet.src + ' cell ' + (index+1);
      if (!signature) errors.push(location + ': empty character cell.');
      else {
        const key = createHash('sha256').update(signature).digest('hex');
        if (poses.has(key)) errors.push(location + ': copied pose from ' + poses.get(key));
        else poses.set(key,location);
      }
      count++;
    }
  } catch (error) { errors.push(sheet.src + ': ' + error.message); }
}
for (const theme of APP_CONTENT.themes) if (theme.image) asset(theme.image);
if (errors.length) { console.error(errors.map((error) => '- ' + error).join('\n')); process.exitCode = 1; }
else console.log('Content valid: ' + APP_CONTENT.expressions.length + ' feelings, ' + count + ' character poses, ' + APP_CONTENT.occasions.length + ' occasions, ' + APP_CONTENT.themes.length + ' themes. Sheet ratios, resolution, bounds, empty cells, and copied images checked.');