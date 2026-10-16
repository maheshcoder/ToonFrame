import { useId } from 'react';
import { avatarFrame, avatarFrameFilter, avatarSheetAspectRatio, avatarSourceRect, avatarExpressionDetails } from '../features/avatar/types';
import type { AvatarAsset, AvatarArtwork } from '../features/avatar/types';
import type { Mood } from '../features/avatar/expressions';

export function CharacterSprite({ avatar, mood = 'neutral', className = '', decorative = false, occasion, artwork }: {
  avatar: AvatarAsset; mood?: Mood; className?: string; decorative?: boolean; occasion?: string; artwork?: AvatarArtwork;
}) {
  const frameInfo = avatarFrame(avatar, mood, occasion, artwork);
  const { url, frame, columns, rows } = frameInfo;
  const sourceAspect = avatarSheetAspectRatio(url);
  const crop = avatarSourceRect(frameInfo, sourceAspect, 1);
  const clipId = useId();
  return <span className={'character-sprite ' + className} role={decorative ? undefined : 'img'}
    aria-hidden={decorative || undefined} aria-label={decorative ? undefined : avatar.name + ': ' + avatarExpressionDetails(avatar,mood,occasion,artwork).label}
    data-avatar={avatar.id} data-expression={mood} data-frame={frame} data-columns={columns} data-rows={rows}>
    <svg className="sprite-frame" viewBox={[crop.x, crop.y, crop.width, crop.height].join(' ')}
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" style={{ filter: avatarFrameFilter(url) }}>
      <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height} /></clipPath></defs>
      <image href={url} width={sourceAspect} height="1" preserveAspectRatio="none" clipPath={'url(#' + clipId + ')'} />
    </svg>
  </span>;
}
