import { useMemo } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import { compileStory, MAX_SCRIPT_LENGTH, formatTime } from '../features/story/compileStory';
import type { Story, StoryMode } from '../features/story/compileStory';
import { moodDetails } from '../features/avatar/expressions';
import { emotionMood, occasionDetails } from '../features/message/occasions';
import type { MessageOptions } from '../features/message/occasions';
import { messageExample } from '../features/message/examples';
import { MessageExamples } from '../components/MessageExamples';
import { CharacterSprite } from '../components/CharacterSprite';
import { MessageSettings } from '../components/MessageSettings';
import { Icon } from '../components/Icon';

type Props = {
  script: string; onScript: (text: string) => void; mode: StoryMode; onMode: (mode: StoryMode) => void;
  options: MessageOptions; onOptions: (options: MessageOptions) => void;
  library: AvatarAsset[]; castIds: [string, string]; onCast: (slot: number, id: string) => void;
  onBack: () => void; onCreate: (story: Story) => void;
};
export function StoryPage({ script, onScript, mode, onMode, options, onOptions, library, castIds, onCast, onBack, onCreate }: Props) {
  const result = useMemo(() => {
    try { return { story: compileStory(script, mode, options), error: '' }; }
    catch (error) { return { story: null, error: (error as Error).message }; }
  }, [script, mode, options]);
  const dialogue = Boolean(mode === 'dialogue' || result.story?.dialogue);
  const cast = castIds.map((id) => library.find((avatar) => avatar.id === id) ?? library[0]);
  const occasion = occasionDetails(options.occasion);
  const previewMood = emotionMood(options.emotion) ?? occasion.mood;
  function useExample(conversation: boolean) {
    onMode(conversation ? 'dialogue' : 'solo');
    onScript(messageExample(options, conversation, result.story?.dialogue ? result.story.speakers : undefined));
  }
  return <>
    <section className="page-intro compact"><p className="eyebrow">FOR YOUR FAVOURITE PEOPLE.</p><h1>A little message.<br className="mobile-break" /> <em>A lot of feeling.</em></h1><p>Birthday wishes, shy love notes, dramatic complaints. Make their phone light up with a smile.</p></section>
    <MessageSettings options={options} onChange={onOptions} avatar={cast[0]} />
    <div className="writing-layout">
      <section className="writing-card" aria-labelledby="story-heading">
        <div className={'script-character-preview' + (dialogue ? ' two-preview' : '')}><div className="script-cast">{cast.slice(0, dialogue ? 2 : 1).map((avatar, index) => <CharacterSprite key={index} avatar={avatar} mood={index ? 'curious' : previewMood} />)}</div>
          <div className="mini-speech">{occasion.emoji} {occasion.label}<br /><strong>A message only you could send.</strong><span>✨</span></div></div>
        <div className="writing-card-body"><div className="section-line"><h2 id="story-heading">What do you want to tell them?</h2><span>Your words. We add the feeling.</span></div>
          <p className="input-guidance" id="message-guidance">Just type what you want to say. We’ll add the expressions and emoji.</p>
          <label className="sr-only" htmlFor="story-text">Your message</label>
          <textarea id="story-text" value={script} onChange={(event) => onScript(event.target.value)}
            aria-invalid={Boolean(script && result.error)} spellCheck autoCapitalize="sentences" aria-describedby="message-guidance story-help story-count story-validation"
            placeholder={messageExample(options, dialogue)} />
          <div className="script-meta"><span>{script.trim() ? script.trim().split(/\s+/).length : 0} words</span><span id="story-count" className={script.length > MAX_SCRIPT_LENGTH ? 'over-limit' : ''}>{script.length.toLocaleString()} / 5,000 characters</span></div>
          <MessageExamples options={options} dialogue={dialogue} speakers={result.story?.dialogue ? result.story.speakers : undefined} onUse={useExample} />
          <p id="story-validation" className={result.error && script ? 'error-message' : 'small-note'} role="status">
            {result.story ? result.story.scenes.length + ' moments · about ' + formatTime(result.story.durationMs) + ' · ' + (result.story.dialogue ? '2 characters' : '1 character') : result.error}
          </p>
          {result.story && <div className="matched-feelings" role="group" aria-label="Matched expressions"><span>Your message feels like:</span>{result.story.scenes.slice(0, 6).map((scene) => <span className="feeling-chip" key={scene.id}><span aria-hidden="true">{scene.emoji}</span> {moodDetails(scene.mood).label}</span>)}{result.story.scenes.length > 6 && <span>+{result.story.scenes.length - 6} more moments</span>}</div>}
          {result.story && result.story.durationMs > 60000 && <p className="duration-hint">A video can be up to 60 seconds. Shorten the message, or choose a faster speed on the next screen.</p>}
        </div>
      </section>
      <aside className="story-sidebar">
        <section className="settings-card"><span className="eyebrow">WHO’S SAYING IT?</span><h2>A note from you.<br />Or a little back-and-forth.</h2>
          <div className="mode-options" role="group" aria-label="Message type">
            {([{ value: 'auto', label: 'Auto-detect', detail: 'We look for speaker names' }, { value: 'solo', label: 'One character', detail: 'Your message, your expressions' }, { value: 'dialogue', label: 'Two characters', detail: 'A playful conversation for two' }] as const).map((item) =>
              <button key={item.value} type="button" aria-pressed={mode === item.value} onClick={() => onMode(item.value)}><span className="radio-dot" /><span><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}
          </div>
          <div className="cast-settings"><h3>Choose your cast</h3>{cast.slice(0, dialogue ? 2 : 1).map((avatar, index) => <div className="cast-row" key={index}>
            <CharacterSprite avatar={avatar} mood="neutral" decorative /><div><label htmlFor={'cast-' + index}>{result.story?.speakers[index] ?? (index ? 'Speaker 2' : 'Speaker 1')}</label>
              <select id={'cast-' + index} value={castIds[index]} onChange={(event) => onCast(index, event.target.value)}>
                {library.map((asset) => <option value={asset.id} key={asset.id}>{asset.name} {asset.kind === 'upload' ? '(uploaded)' : asset.id === 'male' ? '(male)' : '(female)'}</option>)}
              </select></div></div>)}
            <button type="button" className="text-button" onClick={onBack}><Icon name="upload" size={14} />Add another uploaded character</button>
          </div>
        </section>
        <section className="writing-tip" id="story-help"><span aria-hidden="true">✦</span><div><h3>Write it like you’d say it.</h3><p>“I’m mad at you… but save me some cake!” automatically turns dramatic, then playful.</p><p>Choose a feeling above for the whole message, or use <strong>Follow my message</strong> to let the expressions change with your words.</p><p>Use a new line for each little moment. For two people: <code>Me: Miss you!</code><br /><code>You: Miss you more.</code></p><p>No emoji or special instructions needed. You can change any expression on the next screen.</p></div></section>
      </aside>
    </div>
    <div className="next-bar"><button className="text-button" type="button" onClick={onBack}><Icon name="back" size={17} />Back to characters</button>
      <button className="button button-green" type="button" disabled={!result.story} onClick={() => result.story && onCreate(result.story)}><Icon name="spark" size={18} />Animate my message <Icon name="arrow" size={18} /></button></div>
    <p className="local-note">Big feelings. No sound needed. Made just for the people you care about.</p>
  </>;
}
