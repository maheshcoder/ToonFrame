import { MOODS } from '../features/avatar/expressions';
import type { AvatarAsset } from '../features/avatar/types';
import { EMOTIONS, occasionDetails, emotionMood } from '../features/message/occasions';
import type { MessageOptions } from '../features/message/occasions';
import { themeDetails } from '../features/themes/index';
import { ThemePreviewCard } from './ThemePreviewCard';
import { OccasionPicker } from './OccasionPicker';
import { CharacterSprite } from './CharacterSprite';

export function MessageSettings({ options, onChange, avatar }: { options: MessageOptions; onChange: (options: MessageOptions) => void; avatar: AvatarAsset }) {
  const selectedOccasion = occasionDetails(options.occasion);
  const theme = themeDetails(selectedOccasion.theme);
  return <section className="message-settings" aria-label="Occasion and emotion">
    <div className="section-line"><h2>What’s the occasion?</h2><span>Big days. Little feelings.</span></div>
    <OccasionPicker value={options.occasion} onChange={(occasion) => onChange({ ...options, occasion })} />
    <ThemePreviewCard occasion={options.occasion} key={theme.id} theme={theme} avatar={avatar} mood={emotionMood(options.emotion) ?? selectedOccasion.mood} greeting={selectedOccasion.lead} emoji={selectedOccasion.emoji} />
    <div className="emotion-heading"><div><h2>Say it with a feeling.</h2><p>Try a face. Make it sound like you, without a sound.</p></div>
      <button type="button" className="auto-emotion" aria-pressed={options.emotion === 'auto'} onClick={() => onChange({ ...options, emotion: 'auto' })}>✨ Follow my message</button></div>
    <div className="emotion-grid" role="group" aria-label="Choose an emotion">{EMOTIONS.map((emotion) =>
      <button key={emotion.id} type="button" aria-label={emotion.label} aria-pressed={options.emotion === emotion.id} onClick={() => onChange({ ...options, emotion: emotion.id })}>
        <CharacterSprite occasion={options.occasion} avatar={avatar} mood={emotion.mood} decorative /><span>{emotion.label}</span>
      </button>)}</div>
    <p className="emotion-explainer">{options.emotion === 'auto'
      ? 'We match expressions to your words and occasion, then add emoji for you. Each moment can have a different feeling.'
      : 'This feeling sets the mood for your message. You can change individual expressions on the next screen.'} All {MOODS.length} expressions are available in the next step.</p>
  </section>;
}
