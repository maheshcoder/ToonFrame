import type { ThemeDefinition } from './definition.ts';
import { themeFrame, THEME_WIDTH, THEME_HEIGHT } from './frame.ts';
import type { ThemeFrameOptions, ThemeMotif } from './frame.ts';
import { THEME_SHAPES } from './shapes.ts';
const paths = new Map<string, Path2D>();
function pathFor(d: string) {
  if (!paths.has(d)) paths.set(d, new Path2D(d));
  return paths.get(d)!;
}
function drawMotif(context: CanvasRenderingContext2D, item: ThemeMotif, background: string) {
  context.save();
  context.translate(item.x, item.y); context.rotate(item.rotation * Math.PI / 180);
  context.scale(item.size / 100, item.size / 100); context.translate(-50, -50);
  context.globalAlpha = item.opacity;
  for (const part of THEME_SHAPES[item.shape]) {
    const color = part.highlight ? background : item.color, path = pathFor(part.d);
    if (part.fill) { context.fillStyle = color; context.fill(path); }
    if (part.stroke) { context.strokeStyle = color; context.lineWidth = 3; context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke(path); }
  }
  context.restore();
}
export function drawThemeBackground(context: CanvasRenderingContext2D, theme: ThemeDefinition, width: number, height: number, image?: HTMLImageElement, options: ThemeFrameOptions = {}) {
  const frame = themeFrame(theme, options);
  context.save();
  context.scale(width / THEME_WIDTH, height / THEME_HEIGHT);
  context.fillStyle = theme.background; context.fillRect(0, 0, THEME_WIDTH, THEME_HEIGHT);
  if (image) {
    const scale = Math.max(THEME_WIDTH / image.naturalWidth, THEME_HEIGHT / image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    context.globalAlpha = theme.imageOpacity ?? .18;
    context.drawImage(image, (THEME_WIDTH - w) / 2, (THEME_HEIGHT - h) / 2, w, h);
  }
  for (const glow of frame.glows) {
    const gradient = context.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.radius);
    gradient.addColorStop(0, glow.color); gradient.addColorStop(1, glow.color + '00');
    context.globalAlpha = glow.opacity; context.fillStyle = gradient;
    context.fillRect(0, 0, THEME_WIDTH, THEME_HEIGHT);
  }
  for (const line of frame.lines) {
    context.globalAlpha = line.opacity;
    if (line.fill) { context.fillStyle = line.color; context.fill(new Path2D(line.d)); }
    if (line.width) { context.strokeStyle = line.color; context.lineWidth = line.width; context.lineCap = 'round'; context.stroke(new Path2D(line.d)); }
  }
  context.globalAlpha = .2; context.fillStyle = theme.accent;
  context.beginPath(); context.ellipse(180, 948, 648, 162, -.105, 0, Math.PI * 2); context.fill();
  context.globalAlpha = .24; context.fillStyle = theme.secondary;
  context.beginPath(); context.ellipse(690, 972, 520, 130, .14, 0, Math.PI * 2); context.fill();
  for (const item of [...frame.motifs, ...frame.particles, ...frame.reactions]) drawMotif(context, item, theme.background);
  context.restore();
}