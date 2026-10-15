import { MOODS } from '../features/avatar/expressions';
import type { AvatarAsset } from '../features/avatar/types';
import { EMOTIONS, OCCASIONS, OCCASION_GROUPS } from '../features/message/occasions';
import type { MessageOptions } from '../features/message/occasions';
import { CharacterSprite } from './CharacterSprite';

export function MessageSettings({ options, onChange, avatar }: { options: MessageOptions; onChange: (options: MessageOptions) => void; avatar: AvatarAsset }) {
  return <section className="message-settings" aria-label="Occasion and emotion">
    <div className="section-line"><h2>What’s the occasion?</h2><span>Big days. Little feelings.</span></div>
    <div className="occasion-grid" role="group" aria-label="Choose an occasion">{OCCASIONS.slice(0, 8).map((occasion) =>
      <button key={occasion.id} type="button" aria-pressed={options.occasion === occasion.id} onClick={() => onChange({ ...options, occasion: occasion.id })}>
        <span aria-hidden="true">{occasion.emoji}</span><span>{occasion.label}</span>
      </button>)}</div>
    <label className="more-occasions" htmlFor="all-occasions"><span>More occasions · {OCCASIONS.length} to choose from</span><select id="all-occasions" value={options.occasion} onChange={(event) => onChange({ ...options, occasion: event.target.value as MessageOptions['occasion'] })}>{OCCASION_GROUPS.map((group) => <optgroup label={group} key={group}>{OCCASIONS.filter((item) => item.group === group).map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</optgroup>)}</select></label>
    <div className="emotion-heading"><div><h2>Say it with a feeling.</h2><p>Try a face. Make it sound like you, without a sound.</p></div>
      <button type="button" className="auto-emotion" aria-pressed={options.emotion === 'auto'} onClick={() => onChange({ ...options, emotion: 'auto' })}>✨ Follow my message</button></div>
    <div className="emotion-grid" role="group" aria-label="Choose an emotion">{EMOTIONS.map((emotion) =>
      <button key={emotion.id} type="button" aria-label={emotion.label} aria-pressed={options.emotion === emotion.id} onClick={() => onChange({ ...options, emotion: emotion.id })}>
        <CharacterSprite avatar={avatar} mood={emotion.mood} decorative /><span>{emotion.label}</span>
      </button>)}</div>
    <p className="emotion-explainer">{options.emotion === 'auto'
      ? 'We match expressions to your words and occasion, then add emoji for you. Each moment can have a different feeling.'
      : 'This feeling sets the mood for your message. You can change individual expressions on the next screen.'} All {MOODS.length} expressions are available in the next step.</p>
  </section>;
}
