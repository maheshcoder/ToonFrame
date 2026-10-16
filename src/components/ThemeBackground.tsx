import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { ThemeDefinition } from '../features/themes/definition';
import { themeFrame } from '../features/themes/frame';
import type { ThemeFrameOptions, ThemeMotif } from '../features/themes/frame';
import { THEME_SHAPES } from '../features/themes/shapes';
import { useReducedMotion } from '../lib/useReducedMotion';

function Motif({ item, background, kind, stretch }: { stretch: number; item: ThemeMotif; background: string; kind: 'motif' | 'particle' | 'reaction' }) {
  return <g transform={`translate(${item.x} ${item.y}) scale(1 ${stretch}) rotate(${item.rotation}) scale(${item.size / 100}) translate(-50 -50)`}
    opacity={item.opacity} {...{ ['data-' + kind]: item.shape }}>
    {THEME_SHAPES[item.shape].map((part, index) => {
      const color = part.highlight ? background : item.color;
      return <path key={index} d={part.d} fill={part.fill ? color : 'none'} stroke={part.stroke ? color : 'none'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </g>;
}

export function ThemeBackground({ theme, timeMs = 0, pointer, burst }: { theme: ThemeDefinition } & Pick<ThemeFrameOptions, 'timeMs' | 'pointer' | 'burst'>) {
  const reducedMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const [stretch, setStretch] = useState(1);
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width && height) setStretch(width * 900 / (height * 720));
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const frame = themeFrame(theme, { timeMs, reducedMotion, pointer, burst });
  return <svg ref={svgRef} className="theme-background" viewBox="0 0 720 900" preserveAspectRatio="none" aria-hidden="true" focusable="false"
    data-theme={theme.id} data-atmosphere={theme.atmosphere} data-motion={reducedMotion ? 'reduced' : 'full'}>
    <defs>{frame.glows.map((glow, index) => <radialGradient id={id + '-glow-' + index} key={index}>
      <stop stopColor={glow.color} /><stop offset="1" stopColor={glow.color} stopOpacity="0" />
    </radialGradient>)}</defs>
    <rect width="720" height="900" fill={theme.background} />
    {theme.image && <image href={theme.image} width="720" height="900" preserveAspectRatio="xMidYMid slice" opacity={theme.imageOpacity ?? .18} />}
    {frame.glows.map((glow, index) => <circle key={index} cx={glow.x} cy={glow.y} r={glow.radius} fill={`url(#${id}-glow-${index})`} opacity={glow.opacity} />)}
    {frame.lines.map((line, index) => <path key={index} d={line.d} fill={line.fill ? line.color : 'none'} stroke={line.width ? line.color : 'none'} strokeWidth={line.width} opacity={line.opacity} strokeLinecap="round" />)}
    <ellipse cx="180" cy="948" rx="648" ry="162" transform="rotate(-6 180 948)" fill={theme.accent} opacity=".2" />
    <ellipse cx="690" cy="972" rx="520" ry="130" transform="rotate(8 690 972)" fill={theme.secondary} opacity=".24" />
    {frame.motifs.map((item, index) => <Motif key={'m' + index} item={item} stretch={stretch} background={theme.background} kind="motif" />)}
    {frame.particles.map((item, index) => <Motif key={'p' + index} item={item} stretch={stretch} background={theme.background} kind="particle" />)}
    {frame.reactions.map((item, index) => <Motif key={'r' + index} item={item} stretch={stretch} background={theme.background} kind="reaction" />)}
  </svg>;
}