import type { DecorationKind, ThemeDefinition } from './definition.ts';
import { ATMOSPHERE_PROFILES } from './atmospheres.ts';
export const THEME_WIDTH = 720, THEME_HEIGHT = 900;
export type ThemePoint = { x: number; y: number };
export type ThemeBurst = { progress: number; origin: ThemePoint };
export type ThemeFrameOptions = { timeMs?: number; reducedMotion?: boolean; pointer?: ThemePoint; burst?: ThemeBurst | null };
export type ThemeMotif = { shape: DecorationKind; x: number; y: number; size: number; rotation: number; color: string; opacity: number };
export type ThemeLine = { d: string; color: string; opacity: number; width: number; fill?: boolean };
export type ThemeGlow = { x: number; y: number; radius: number; color: string; opacity: number };
export type ThemeFrame = { motifs: ThemeMotif[]; particles: ThemeMotif[]; reactions: ThemeMotif[]; lines: ThemeLine[]; glows: ThemeGlow[] };
const TAU = Math.PI * 2;
const fraction = (value: number) => value - Math.floor(value);
const seed = (index: number) => fraction(Math.sin(index * 127.1 + 311.7) * 43758.5453);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Pure, deterministic coordinates in a 720 x 900 artboard. Pausing or seeking the
// message timeline freezes/seeks the background too; video uses the same clock.
export function themeFrame(theme: ThemeDefinition, options: ThemeFrameOptions = {}): ThemeFrame {
  const reduced = options.reducedMotion ?? false;
  const time = reduced ? 0 : Math.max(0, Number.isFinite(options.timeMs) ? options.timeMs! : 0) / 1000;
  const pointer = reduced ? { x: 0, y: 0 } : options.pointer ?? { x: 0, y: 0 };
  const px = clamp(pointer.x, -1, 1), py = clamp(pointer.y, -1, 1);
  const profile = ATMOSPHERE_PROFILES[theme.atmosphere];
  const colors = [theme.accent, theme.secondary, '#fffefa'];
  const motifs = theme.decorations.map((item, index): ThemeMotif => {
    const phase = index * 1.7, swing = Math.sin(time * .75 + phase) - Math.sin(phase);
    return { ...item, x: item.x * 720 + swing * (reduced ? 0 : 5) + px * 6,
      y: item.y * 900 + (Math.cos(time * .65 + phase) - Math.cos(phase)) * (reduced ? 0 : 7) + py * 5,
      size: item.size * 720, rotation: item.rotation + swing * (reduced ? 0 : 4), opacity: .82 };
  });
  const particles = Array.from({ length: profile.count }, (_, index): ThemeMotif => {
    const phase = seed(index + 1), progress = fraction(phase + time / (profile.cycle + seed(index + 12) * 5));
    const side = index % 2 ? 1 : -1;
    // The busy parts stay at the edges; captions keep a clear center.
    const x = side < 0 ? 12 + seed(index + 32) * 100 : 608 + seed(index + 32) * 100;
    const twinkle = reduced ? .65 : .65 + Math.sin(time * 1.1 + phase * TAU) * .18;
    return { shape: profile.shape, x: x + Math.sin(progress * TAU + phase) * profile.sway + px * (9 + phase * 8),
      y: (profile.direction === 'up' ? 1 - progress : progress) * 1000 - 50 + py * 8,
      size: 10 + seed(index + 5) * (theme.atmosphere === 'colors' ? 33 : 18),
      rotation: phase * 90 + (reduced ? 0 : time * (index % 2 ? 5 : -5)),
      color: colors[index % 3], opacity: twinkle * (reduced ? .65 : 1) };
  });
  const lines: ThemeLine[] = [];
  const line = (d: string, color: string, opacity: number, width = 2, fill = false) => lines.push({ d, color, opacity, width, fill });
  if (['confetti', 'disco', 'lanterns'].includes(theme.atmosphere)) {
    line('M-30 0Q150 130 360 18Q570 130 750 0', theme.accent, .45);
    for (let index = 0; index < 11; index++) {
      const x = index * 72, y = 21 + Math.sin(index / 5 * Math.PI) ** 2 * 35;
      line(`M${x} ${y}l-10 0 10 24 10-24Z`, colors[index % 2], .68, 1, true);
    }
  }
  if (theme.atmosphere === 'disco') {
    const shift = reduced ? 0 : Math.sin(time * .4) * 38;
    line(`M360 -40L${-140 + shift} 900L${80 + shift} 900Z`, theme.accent, .12, 0, true);
    line(`M360 -40L${640 - shift} 900L${860 - shift} 900Z`, theme.secondary, .14, 0, true);
    line('M0 840Q360 760 720 840M0 895Q360 800 720 895M100 900L260 780M620 900L460 780', theme.accent, .2);
  } else if (theme.atmosphere === 'sunshine') {
    for (let index = 0; index < 5; index++) {
      const x = -300 + index * 270;
      line(`M-70 -100L${x} 900L${x + 120} 900Z`, theme.secondary, .1, 0, true);
    }
  } else if (['hearts', 'petals', 'breeze'].includes(theme.atmosphere)) {
    line('M-40 960L-40 330C-40-15 760-15 760 330L760 960', theme.accent, .24, 2);
    line('M-60 960L-60 310C-60-60 780-60 780 310L780 960', theme.secondary, .2, 8);
  } else if (theme.atmosphere === 'colors') {
    line('M-30 310C150 240 170 130 90-30L-30-30Z', theme.secondary, .18, 0, true);
    line('M750 660C570 590 560 830 660 930L750 930Z', theme.accent, .21, 0, true);
  } else {
    line('M-100 830Q170 620 330 900M820 810Q600 660 450 930', theme.accent, .16, 2);
  }
  const drift = reduced ? 0 : Math.sin(time * .35) * 20;
  const glows: ThemeGlow[] = [
    { x: 0 + px * 10, y: 50 + drift, radius: 380, color: theme.accent, opacity: .34 },
    { x: 720 - px * 10, y: 350 - drift, radius: 350, color: theme.secondary, opacity: .3 },
    { x: 380, y: 680, radius: 400, color: '#fffefa', opacity: .55 },
  ];
  const reactions: ThemeMotif[] = [];
  const burst = options.burst;
  if (!reduced && burst && burst.progress >= 0 && burst.progress < 1) {
    const p = burst.progress, distance = 180 * (1 - (1 - p) ** 3);
    for (let index = 0; index < 16; index++) {
      const angle = index / 16 * TAU;
      reactions.push({ shape: profile.shape, x: burst.origin.x + Math.cos(angle) * distance,
        y: burst.origin.y + Math.sin(angle) * distance - p * 80, size: 16 + seed(index) * 16,
        rotation: index * 30 + p * 80, color: colors[index % 3], opacity: (1 - p) * .9 });
    }
  }
  return { motifs, particles, reactions, lines, glows };
}