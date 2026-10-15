import { useId } from 'react';
import { avatarFrame, avatarFrameFilter } from '../features/avatar/types';
import type { AvatarAsset } from '../features/avatar/types';
import { cropFrame } from '../features/avatar/framing';
import { moodDetails } from '../features/avatar/expressions';
import type { Mood } from '../features/avatar/expressions';

export function CharacterSprite({ avatar, mood = 'neutral', className = '', decorative = false }: {
  avatar: AvatarAsset; mood?: Mood; className?: string; decorative?: boolean;
}) {
  const { url, frame, columns, rows } = avatarFrame(avatar, mood);
  const crop = cropFrame(2, 3, frame, columns, rows);
  const clipId = useId();
  return <span className={'character-sprite ' + className} role={decorative ? undefined : 'img'}
    aria-hidden={decorative || undefined} aria-label={decorative ? undefined : avatar.name + ': ' + moodDetails(mood).label}
    data-avatar={avatar.id} data-expression={mood} data-frame={frame} data-columns={columns} data-rows={rows}>
    <svg className="sprite-frame" viewBox={[crop.x, crop.y, crop.width, crop.height].join(' ')}
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" style={{ filter: avatarFrameFilter(url) }}>
      <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height} /></clipPath></defs>
      <image href={url} width="2" height="3" preserveAspectRatio="none" clipPath={'url(#' + clipId + ')'} />
    </svg>
  </span>;
}
