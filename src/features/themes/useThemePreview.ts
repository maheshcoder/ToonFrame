import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../lib/useReducedMotion';
import type { ThemePoint } from './frame';
const PREVIEW_MS = 6000, BURST_MS = 1300;
export function useThemePreview() {
  const reducedMotion = useReducedMotion();
  const [timeMs, setTime] = useState(0), [playing, setPlaying] = useState(false);
  const [burst, setBurst] = useState<{ origin: ThemePoint; startedAt: number } | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setPlaying(!reducedMotion);
    if (reducedMotion) { setTime(0); setBurst(null); }
  }, [reducedMotion]);
  useEffect(() => {
    if (reducedMotion || (!playing && !burst)) return;
    let frame = 0, previous = performance.now();
    const tick = (timestamp: number) => {
      const delta = Math.min(timestamp - previous, 100); previous = timestamp;
      if (playing) setTime((time) => Math.min(time + delta, PREVIEW_MS));
      setNow(timestamp);
      if (burst && timestamp - burst.startedAt >= BURST_MS) setBurst(null);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, burst, reducedMotion]);
  useEffect(() => { if (timeMs >= PREVIEW_MS) setPlaying(false); }, [timeMs]);
  useEffect(() => {
    const pause = () => { if (document.hidden) { setPlaying(false); setBurst(null); } };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  function react(origin: ThemePoint = { x: 360, y: 390 }) {
    if (reducedMotion) return;
    const timestamp = performance.now(); setNow(timestamp);
    setBurst({ origin, startedAt: timestamp });
    if (timeMs >= PREVIEW_MS) setTime(0);
    setPlaying(true);
  }
  function toggle() {
    if (timeMs >= PREVIEW_MS) setTime(0);
    setPlaying((value) => !value);
    setBurst(null);
  }
  return { timeMs, playing, reducedMotion, toggle, react,
    burst: burst ? { origin: burst.origin, progress: Math.max(0, (now - burst.startedAt) / BURST_MS) } : null };
}