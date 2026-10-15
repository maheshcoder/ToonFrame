import { containFrame, cropFrame } from '../avatar/framing.ts';
import { avatarFrame, avatarFrameFilter } from '../avatar/types.ts';
import type { AvatarAsset } from '../avatar/types.ts';
import { MOODS, moodDetails } from '../avatar/expressions.ts';
import type { Scene, Story } from '../story/compileStory.ts';
import { occasionDetails } from '../message/occasions.ts';

export const VIDEO_WIDTH = 720;
export const VIDEO_HEIGHT = 900;
export type Images = Map<string, HTMLImageElement>;

export async function loadCastImages(cast: AvatarAsset[], signal: AbortSignal): Promise<Images> {
  const urls = [...new Set(cast.flatMap((avatar) => MOODS.map((mood) => avatarFrame(avatar, mood.id).url)))];
  const images: Images = new Map();
  await Promise.all(urls.map((url) => new Promise<void>((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => finish(new Error('A character image took too long to open. Try again.')), 15000);
    const abort = () => { finish(new DOMException('Cancelled', 'AbortError')); image.src = ''; };
    function finish(error?: Error) {
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      signal.removeEventListener('abort', abort);
      if (error) reject(error); else { images.set(url, image); resolve(); }
    }
    image.onload = () => finish();
    image.onerror = () => finish(new Error('A character image could not be opened. Re-upload it and try again.'));
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort(); else image.src = url;
  })));
  return images;
}

export function wrapText(context: Pick<CanvasRenderingContext2D, 'measureText'>, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const word of text.split(/\s+/)) {
    const candidate = line ? line + ' ' + word : word;
    if (context.measureText(candidate).width <= width) { line = candidate; continue; }
    if (line) { lines.push(line); line = ''; }
    for (const { segment } of graphemes.segment(word)) {
      if (line && context.measureText(line + segment).width > width) { lines.push(line); line = ''; }
      line += segment;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function sceneAtTime(story: Story, elapsed: number): { scene: Scene; elapsed: number } {
  let remaining = Math.max(0, elapsed);
  for (const scene of story.scenes) {
    if (remaining < scene.durationMs) return { scene, elapsed: remaining };
    remaining -= scene.durationMs;
  }
  const scene = story.scenes[story.scenes.length - 1];
  return { scene, elapsed: scene.durationMs };
}
function rounded(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, color: string) {
  context.fillStyle = color;
  context.beginPath(); context.roundRect(x, y, width, height, radius); context.fill();
}
function label(context: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color = '#304b3a', weight = 500) {
  context.font = weight + ' ' + size + 'px "Segoe UI", Arial, sans-serif';
  context.fillStyle = color; context.fillText(text, x, y);
}
export function drawMessageFrame(context: CanvasRenderingContext2D, story: Story, cast: AvatarAsset[], images: Images, time: number, reducedMotion: boolean) {
  const { scene, elapsed } = sceneAtTime(story, time);
  const occasion = occasionDetails(story.occasion);
  const mood = moodDetails(scene.mood);
  const seconds = elapsed / 1000;
  context.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  context.fillStyle = occasion.background; context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  context.fillStyle = occasion.accent;
  context.beginPath(); context.ellipse(120, 860, 650, 240, -.15, 0, Math.PI * 2); context.fill();
  context.globalAlpha = .45;
  context.beginPath(); context.arc(654, 88, 145, 0, Math.PI * 2); context.fill();
  context.globalAlpha = 1;
  context.textAlign = 'center';
  label(context, occasion.emoji + '  ' + occasion.heading, 360, 88, 29, '#304b3a', 600);

  let size = 32;
  let lines: string[] = [];
  do {
    context.font = '600 ' + size + 'px "Segoe UI", Arial, sans-serif';
    lines = wrapText(context, scene.text, 542);
    if (lines.length <= 6 || size <= 20) break;
    size -= 2;
  } while (true);
  const lineHeight = size * 1.35;
  const bubbleHeight = 90 + lines.length * lineHeight;
  rounded(context, 54, 137, 612, bubbleHeight, 28, '#fffefa');
  const tailX = cast.length === 1 ? 350 : scene.speakerIndex === 0 ? 208 : 502;
  context.fillStyle = '#fffefa'; context.beginPath();
  context.moveTo(tailX - 14, 134 + bubbleHeight); context.lineTo(tailX + 14, 134 + bubbleHeight); context.lineTo(tailX, 164 + bubbleHeight); context.fill();
  label(context, scene.speaker, 360, 178, 16, '#68755c', 600);
  lines.forEach((line, index) => label(context, line, 360, 222 + index * lineHeight, size, '#304b3a', 600));
  const emojiY = Math.max(420, 180 + bubbleHeight);
  const bounce = reducedMotion ? 0 : Math.sin(seconds * 3) * 8;
  label(context, scene.emoji, 586, Math.min(emojiY, 487) + bounce, 62);

  cast.forEach((avatar, index) => {
    const active = scene.speakerIndex === index;
    const frame = avatarFrame(avatar, active ? scene.mood : 'neutral');
    const image = images.get(frame.url)!;
    const source = cropFrame(image.naturalWidth, image.naturalHeight, frame.frame, frame.columns, frame.rows);
    const width = cast.length === 1 ? 306 : 259, height = width;
    const fit = containFrame(source, { x: -width / 2, y: -height / 2, width, height });
    const x = cast.length === 1 ? 360 : index === 0 ? 206 : 514;
    const bottom = 817;
    let dx = 0, dy = 0, rotation = 0;
    if (active && !reducedMotion) {
      if (mood.motion === 'bounce' || mood.motion === 'jump') dy = -Math.abs(Math.sin(seconds * 4)) * (mood.motion === 'jump' ? 17 : 10);
      else if (mood.motion === 'shake') { dx = Math.sin(seconds * 13) * 5; rotation = Math.sin(seconds * 9) * .025; }
      else if (mood.motion === 'sway' || mood.motion === 'tilt') rotation = Math.sin(seconds * 2.5) * .045;
      else dy = Math.sin(seconds * 2.5) * 3;
    }
    context.save();
    context.globalAlpha = active ? 1 : .65;
    context.translate(x + dx, bottom - height / 2 + dy); context.rotate(rotation);
    context.globalCompositeOperation = 'multiply';
    context.filter = avatarFrameFilter(frame.url);
    // Fit the full pose into its safe square, using the same crop as the SVG preview.
    context.drawImage(image, source.x, source.y, source.width, source.height, fit.x, fit.y, fit.width, fit.height);
    context.restore();
    label(context, story.speakers[index], x, 837, 17, '#52654b', 600);
  });
  label(context, mood.emoji + '  ' + mood.label, 360, 879, 19, '#52654b');
}
