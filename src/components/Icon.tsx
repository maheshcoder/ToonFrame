import type { ReactNode } from 'react';
type IconName = 'play' | 'pause' | 'stop' | 'upload' | 'check' | 'shield' | 'spark' | 'arrow' | 'image' | 'copy' | 'download' | 'close' | 'back' | 'previous' | 'next' | 'replay' | 'silent';
const paths: Record<IconName, ReactNode> = {
  play: <path d="m9 5 11 7-11 7Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="1" />,
  upload: <path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" />,
  check: <path d="m5 12 4 4L19 6" />,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
  spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 6-6 4 4 3-3 5 5" /></>,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V3H3v13h5" /></>,
  download: <path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  previous: <><path d="M6 5v14m12-14L8 12l10 7Z" /></>,
  next: <><path d="M18 5v14M6 5l10 7-10 7Z" /></>,
  replay: <><path d="M3 10a9 9 0 1 1 2 9M3 3v7h7" /></>,
  silent: <><path d="m11 4-6 5H2v6h3l6 5ZM16 9l6 6m0-6-6 6" /></>,
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
