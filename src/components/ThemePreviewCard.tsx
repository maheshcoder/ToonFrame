import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import type { Mood } from '../features/avatar/expressions';
import type { ThemeDefinition } from '../features/themes/definition';
import { ATMOSPHERE_PROFILES } from '../features/themes/atmospheres';
import { useThemePreview } from '../features/themes/useThemePreview';
import { ThemeBackground } from './ThemeBackground';
import { CharacterSprite } from './CharacterSprite';
import { Icon } from './Icon';
export function ThemePreviewCard({ theme, avatar, mood, greeting, emoji, occasion }: {
  theme: ThemeDefinition; avatar: AvatarAsset; mood: Mood; greeting: string; emoji: string; occasion?: string;
}) {
  const preview = useThemePreview();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const profile = ATMOSPHERE_PROFILES[theme.atmosphere];
  function react(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    preview.react(event.detail ? { x: (event.clientX - box.left) / box.width * 720, y: (event.clientY - box.top) / box.height * 900 } : undefined);
  }
  return <div className="theme-preview" data-playing={preview.playing}>
    <button type="button" className="theme-swatch" aria-label={'Try the ' + theme.label + ' background'} onClick={react}
      disabled={preview.reducedMotion} onPointerMove={(event) => {
        if (event.pointerType === 'touch' || preview.reducedMotion) return;
        const box = event.currentTarget.getBoundingClientRect();
        setPointer({ x: (event.clientX - box.left) / box.width * 2 - 1, y: (event.clientY - box.top) / box.height * 2 - 1 });
      }} onPointerLeave={() => setPointer({ x: 0, y: 0 })}>
      <ThemeBackground theme={theme} timeMs={preview.timeMs} pointer={pointer} burst={preview.burst} />
      <span className="theme-mini-bubble" aria-hidden="true">{greeting}</span>
      <span className="theme-mini-character" aria-hidden="true"><CharacterSprite occasion={occasion} avatar={avatar} mood={mood} decorative /></span>
      <span className="theme-tap-hint" aria-hidden="true">{emoji} {preview.reducedMotion ? 'A little scene, just for you' : 'Tap for a little magic'}</span>
    </button>
    <div className="theme-preview-copy"><span className="theme-eyebrow">A SCENE FOR YOUR OCCASION</span>
      <h3>{theme.label}</h3><p>{profile.description}</p>
      <div className="theme-preview-actions">
        <button type="button" className="theme-effect-button" disabled={preview.reducedMotion} onClick={() => preview.react()}><Icon name="spark" size={15} />{profile.action}</button>
        <button type="button" className="theme-play-button" disabled={preview.reducedMotion} onClick={preview.toggle}
          aria-label={preview.playing ? 'Pause background preview' : 'Play background preview'}><Icon name={preview.playing ? 'pause' : 'play'} size={15} />{preview.playing ? 'Pause' : 'Preview'}</button>
      </div>
      <p className="theme-preview-note">{preview.reducedMotion ? 'Reduced motion is on. Your background stays still in the preview and video.' : 'The moving background goes into your video. Tap effects are just for this preview.'}</p>
    </div>
  </div>;
}