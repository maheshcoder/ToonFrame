import { useMemo } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import { MOODS, moodDetails } from '../features/avatar/expressions';
import type { Mood } from '../features/avatar/expressions';
import { formatTime } from '../features/story/compileStory';
import type { Story } from '../features/story/compileStory';
import { useTimeline } from '../features/story/useTimeline';
import { AnimationStage } from '../components/AnimationStage';
import { CharacterSprite } from '../components/CharacterSprite';
import { VideoExport } from '../components/VideoExport';
import { Icon } from '../components/Icon';

export function AnimationPage({ story, onStory, cast, onEdit }: {
  story: Story; onStory: (story: Story) => void; cast: AvatarAsset[]; onEdit: () => void;
}) {
  const timeline = useTimeline(story.scenes);
  const scene = story.scenes[timeline.index];
  const playing = timeline.status === 'playing';
  const activeCast = useMemo(() => cast.slice(0, story.dialogue ? 2 : 1), [cast, story.dialogue]);
  function changeMood(index: number, mood: Mood) {
    onStory({ ...story, scenes: story.scenes.map((item, position) => position === index ? { ...item, mood, emoji: moodDetails(mood).emoji } : item) });
  }
  return <>
    <section className="page-intro compact result-intro"><div><p className="eyebrow">YOUR WORDS, NOW WITH FEELING.</p><h1>A little message.<br className="mobile-break" /> <em>Made to make their day.</em></h1><p>Your animation is ready. Check every feeling, then make a video to send.</p></div><span className="ready-badge"><Icon name="check" size={15} />{story.scenes.length} scenes created</span></section>
    <div className="result-layout">
      <section className="player-card" aria-label="Animation player">
        <AnimationStage scene={scene} cast={activeCast} speakers={story.speakers} playing={playing} occasion={story.occasion} />
        <div className="player-body">
          <div className="player-status"><span role="status">{timeline.status === 'playing' ? 'Playing your message' : timeline.status === 'paused' ? 'Paused' : timeline.status === 'ended' ? 'One more smile? Play it again.' : 'Ready when you are'}</span><span>Scene {timeline.index + 1} of {story.scenes.length}</span></div>
          <label htmlFor="timeline" className="sr-only">Animation progress</label>
          <input id="timeline" className="timeline-range" type="range" min={0} max={story.durationMs} step={10} value={timeline.currentTime}
            aria-valuetext={formatTime(timeline.currentTime) + ' of ' + formatTime(story.durationMs)} onChange={(event) => timeline.seek(Number(event.target.value))} />
          <div className="time-labels"><span>{formatTime(timeline.currentTime)}</span><span>{formatTime(story.durationMs)}</span></div>
          <div className="player-controls">
            <button className="button button-green" type="button" onClick={playing ? timeline.pause : timeline.play}><Icon name={playing ? 'pause' : timeline.status === 'ended' ? 'replay' : 'play'} size={18} />{playing ? 'Pause' : timeline.status === 'ended' ? 'Replay' : timeline.status === 'paused' ? 'Resume' : 'Play animation'}</button>
            <div className="transport-controls"><button type="button" aria-label="Previous scene" disabled={timeline.index === 0} onClick={() => timeline.goTo(timeline.index - 1)}><Icon name="previous" size={18} /></button>
              <button type="button" aria-label="Stop animation" onClick={timeline.stop} disabled={timeline.status === 'idle'}><Icon name="stop" size={17} /></button>
              <button type="button" aria-label="Next scene" disabled={timeline.index === story.scenes.length - 1} onClick={() => timeline.goTo(timeline.index + 1)}><Icon name="next" size={18} /></button></div>
            <label className="speed-control"><span>Speed</span><select aria-label="Animation speed" value={timeline.speed} onChange={(event) => timeline.setSpeed(Number(event.target.value))}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option></select></label>
          </div>
          <p className="small-note player-note">Every expression is yours to change. Text timing is estimated for reading; this is a silent animation.</p>
        </div>
      </section>
      <section className="scene-panel" aria-labelledby="scene-heading"><div className="scene-panel-heading"><div><span className="eyebrow">THE FEELINGS IN YOUR MESSAGE</span><h2 id="scene-heading">Your scenes</h2></div><span>{story.scenes.length}</span></div>
        <p className="small-note">Jump to a moment or change its feeling.</p>
        <ol className="scene-list">{story.scenes.map((item, index) => <li className={index === timeline.index ? 'current-scene' : ''} key={item.id}>
          <button type="button" className="scene-jump" aria-label={'Go to scene ' + (index + 1)} aria-current={index === timeline.index ? 'true' : undefined} onClick={() => timeline.goTo(index)}>
            <CharacterSprite avatar={activeCast[item.speakerIndex]} mood={item.mood} decorative />
            <span><small>{String(index + 1).padStart(2, '0')} <span>·</span> {item.speaker}</small><span className="scene-text">{item.text}</span></span>
          </button>
          <div className="scene-edit"><label className="sr-only" htmlFor={'mood-' + index}>Expression for scene {index + 1}</label><select id={'mood-' + index} value={item.mood} onChange={(event) => changeMood(index, event.target.value as Mood)}>
            {MOODS.map((mood) => <option key={mood.id} value={mood.id}>{mood.emoji} {mood.label}</option>)}</select><span>{(item.durationMs / 1000).toFixed(1)}s</span></div>
        </li>)}</ol>
      </section>
    </div>
    <VideoExport key={JSON.stringify([story.id, story.scenes.map((item) => item.mood), activeCast.map((item) => item.id), timeline.speed])} story={story} cast={activeCast} speed={timeline.speed} onStart={timeline.pause} />
    <div className="next-bar result-bottom"><button type="button" className="text-button" onClick={onEdit}><Icon name="back" size={17} />Edit message & cast</button><p>A little more personal than plain text.</p><span className="privacy-pill"><Icon name="shield" size={14} />Made on your device</span></div>
  </>;
}
