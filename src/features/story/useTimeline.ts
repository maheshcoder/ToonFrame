import { useEffect, useMemo, useState } from 'react';
import type { Scene } from './compileStory';
import { advanceTimeline, INITIAL_TIMELINE, seekTimeline } from './timeline';

export function useTimeline(scenes: Scene[]) {
  const [state, setState] = useState({ ...INITIAL_TIMELINE });
  const [speed, setSpeed] = useState(1);
  const durations = useMemo(() => scenes.map((scene) => scene.durationMs), [scenes]);
  useEffect(() => {
    if (state.status !== 'playing') return;
    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const delta = (now - previous) * speed;
      previous = now;
      setState((current) => advanceTimeline(current, delta, durations));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.status, speed, durations]);
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setState((current) => current.status === 'playing' ? { ...current, status: 'paused' } : current);
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);
  const currentTime = durations.slice(0, state.index).reduce((sum, value) => sum + value, 0) + state.elapsed;
  return {
    ...state, speed, setSpeed, currentTime,
    play: () => setState((current) => current.status === 'ended' ? { ...INITIAL_TIMELINE, status: 'playing' } : { ...current, status: 'playing' }),
    pause: () => setState((current) => ({ ...current, status: 'paused' })),
    stop: () => setState({ ...INITIAL_TIMELINE }),
    seek: (time: number) => setState((current) => seekTimeline(time, durations, current.status)),
    goTo: (index: number) => setState((current) => ({ index: Math.max(0, Math.min(index, scenes.length - 1)), elapsed: 0, status: current.status === 'playing' ? 'playing' : 'paused' })),
  };
}
