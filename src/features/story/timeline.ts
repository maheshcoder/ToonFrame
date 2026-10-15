export type TimelineState = { index: number; elapsed: number; status: 'idle' | 'playing' | 'paused' | 'ended' };
export const INITIAL_TIMELINE: TimelineState = { index: 0, elapsed: 0, status: 'idle' };
export function advanceTimeline(state: TimelineState, delta: number, durations: number[]): TimelineState {
  if (state.status !== 'playing' || !durations.length) return state;
  let { index, elapsed } = state;
  elapsed += Math.max(0, delta);
  while (elapsed >= durations[index]) {
    if (index === durations.length - 1) return { index, elapsed: durations[index], status: 'ended' };
    elapsed -= durations[index];
    index++;
  }
  return { index, elapsed, status: 'playing' };
}
export function seekTimeline(time: number, durations: number[], status: TimelineState['status']): TimelineState {
  if (!durations.length) return { ...INITIAL_TIMELINE };
  let index = 0;
  let elapsed = Math.max(0, time);
  while (index < durations.length - 1 && elapsed >= durations[index]) elapsed -= durations[index++];
  elapsed = Math.min(elapsed, durations[index]);
  return { index, elapsed, status: status === 'playing' ? 'playing' : 'paused' };
}
