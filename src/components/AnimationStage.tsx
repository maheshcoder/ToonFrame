import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { themeDetails } from '../features/themes/index';
import { ThemeBackground } from './ThemeBackground';
import { occasionDetails } from '../features/message/occasions';
import type { OccasionId } from '../features/message/occasions';
import type { AvatarAsset } from '../features/avatar/types';
import type { Scene } from '../features/story/compileStory';
import { avatarExpressionDetails } from '../features/avatar/types';
import { CharacterSprite } from './CharacterSprite';

export function AnimationStage({ scene, cast, speakers, playing, occasion, timeMs }: { scene: Scene; cast: AvatarAsset[]; speakers: string[]; playing: boolean; occasion: OccasionId; timeMs: number }) {
  const feeling = avatarExpressionDetails(cast[scene.speakerIndex],scene.mood,occasion,scene.artwork);
  const bubbleRef = useRef<HTMLDivElement>(null), castRef = useRef<HTMLDivElement>(null);
  const [minimumHeight, setMinimumHeight] = useState(0);
  useLayoutEffect(() => {
    const bubble = bubbleRef.current, castElement = castRef.current;
    if (!bubble || !castElement) return;
    const measure = () => {
      const bottom = Number.parseFloat(getComputedStyle(castElement).bottom) || 34;
      const next = bubble.offsetTop + bubble.offsetHeight + castElement.offsetHeight + bottom + 26;
      setMinimumHeight((previous) => Math.abs(previous - next) < 1 ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bubble); observer.observe(castElement);
    return () => observer.disconnect();
  }, [scene.text, cast.length]);
  const occasionInfo = occasionDetails(occasion);
  const theme = themeDetails(occasionInfo.theme);
  return <div className={'animation-stage ' + (cast.length === 2 ? 'two-characters ' : '') + (playing ? 'is-playing ' : '') + (scene.text.length > 80 ? 'long-scene' : '')} data-scene={scene.id} style={{ minHeight: minimumHeight || undefined, "--stage-background": theme.background, "--stage-accent": theme.accent } as CSSProperties}>
    <ThemeBackground theme={theme} timeMs={timeMs} /><div className="stage-grain" />
    <div className="stage-top"><span className="stage-label"><i />{occasionInfo.emoji} {occasionInfo.heading}</span><span className="stage-silent">Text & expressions</span></div>
    <div ref={bubbleRef} className={'story-bubble speaker-' + scene.speakerIndex} key={scene.id + '-bubble'}>
      <span className="bubble-speaker">{scene.speaker}</span><p>{scene.text}</p>
    </div>
    <div className={'scene-emoji mood-' + scene.mood} key={scene.id + '-emoji'} role="img" aria-label={feeling.label}>{feeling.emoji}</div>
    <div className="stage-cast" ref={castRef}>{cast.map((avatar, index) => <div key={avatar.id + index}
      className={'stage-person ' + (index === scene.speakerIndex ? 'active motion-' + feeling.motion : 'listening')}>
      <CharacterSprite occasion={occasion} avatar={avatar} artwork={index === scene.speakerIndex ? scene.artwork : undefined} mood={index === scene.speakerIndex ? scene.mood : 'neutral'} />
      <span className="person-name">{speakers[index]}</span>
    </div>)}</div>
    <div className="stage-footer"><span>{feeling.emoji} {feeling.label}</span><span>A little feeling, just for you ✳</span></div>
  </div>;
}
