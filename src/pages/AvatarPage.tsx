import { useState } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import { MOODS } from '../features/avatar/expressions';
import type { Mood, SheetLayout } from '../features/avatar/expressions';
import { CharacterSprite } from '../components/CharacterSprite';
import { ExpressionGallery } from '../components/ExpressionGallery';
import { UploadGuide } from '../components/UploadGuide';
import { Icon } from '../components/Icon';

type Props = {
  library: AvatarAsset[]; selectedId: string; onSelect: (id: string) => void;
  onUpload: (file: File, layout: SheetLayout) => void; onRemove: (id: string) => void;
  busy: boolean; error: string; onContinue: () => void;
};
export function AvatarPage({ library, selectedId, onSelect, onUpload, onRemove, busy, error, onContinue }: Props) {
  const [showGuide, setShowGuide] = useState(false);
  const [mood, setMood] = useState<Mood>('joyful');
  const selected = library.find((avatar) => avatar.id === selectedId) ?? library[0];
  return <>
    <section className="page-intro">
      <p className="eyebrow"><span aria-hidden="true">✳</span> A LITTLE CHARACTER. A LOT OF EXPRESSION.</p>
      <h1>Some things need<br />a little <em>expression.</em></h1>
      <p>“I miss you.” “Happy birthday!” “You owe me cake.”<br className="desktop-break" /> Pick a face and send a message they can feel.</p>
    </section>
    <div className="section-line"><h2>Who’s sending a little happiness?</h2><span>Choose your first character</span></div>
    <div className="character-choices">
      {library.filter((avatar) => avatar.kind === 'builtin').map((avatar) => <button type="button"
        className={'character-card ' + avatar.id + (selectedId === avatar.id ? ' selected' : '')}
        key={avatar.id} aria-pressed={selectedId === avatar.id} aria-label={'Choose ' + avatar.name}
        onClick={() => onSelect(avatar.id)}>
        <div className="card-topline"><span>THE ORIGINALS</span><span className="selection-check">{selectedId === avatar.id && <Icon name="check" size={14} />}</span></div>
        <div className="card-character"><span className="character-halo" /><CharacterSprite avatar={avatar} mood={mood} decorative /></div>
        <div className="character-card-footer"><div><h3>{avatar.name}</h3><p>{avatar.id === 'male' ? 'A little charm. A lot of personality.' : 'Every feeling, beautifully expressed.'}</p></div><span className="expression-count">{MOODS.length}<br /><small>expressions</small></span></div>
        <span className="character-role">{avatar.id === 'male' ? 'Male character' : 'Female character'} <span>·</span> Ready to animate</span>
      </button>)}
      <button type="button" className={'upload-choice ' + (showGuide ? 'selected' : '')} aria-expanded={showGuide}
        onClick={() => setShowGuide(!showGuide)}>
        <span className="upload-art"><Icon name="image" size={38} /><span className="upload-art-star">✦</span><span className="upload-art-smile">☺</span></span>
        <h3>A character only you could be.</h3><p>Turn your photo into an expression sheet using our ready-to-copy AI prompt.</p>
        <span className="upload-choice-link"><Icon name="upload" size={16} />Create & upload your own <Icon name="arrow" size={16} /></span>
        <small>PNG, JPG or WebP · Up to 10 MB</small>
      </button>
    </div>
    <div className="expression-sampler"><span>Try a feeling</span>
      {(['joyful', 'blushing', 'kiss', 'playful'] as Mood[]).map((value, index) => <button key={value} type="button" aria-pressed={mood === value}
        onClick={() => setMood(value)}>{['🥳 Joyful', '😊 Blushing', '😘 Kiss', '😜 Playful'][index]}</button>)}
    </div>
    {library.some((avatar) => avatar.kind === 'upload') && <section className="your-characters"><h2>Your characters</h2><div className="uploaded-list">
      {library.filter((avatar) => avatar.kind === 'upload').map((avatar) => <div className={'uploaded-card ' + (selectedId === avatar.id ? 'selected' : '')} key={avatar.id}>
        <button type="button" onClick={() => onSelect(avatar.id)} aria-pressed={selectedId === avatar.id} aria-label={'Choose ' + avatar.name}>
          <CharacterSprite avatar={avatar} mood="neutral" decorative /><span><strong>{avatar.name}</strong><small>{avatar.layout} expressions · This session only</small></span>
        </button><button type="button" className="remove-character" aria-label={'Remove ' + avatar.name} onClick={() => onRemove(avatar.id)}><Icon name="close" size={16} /></button>
      </div>)}</div></section>}
    {(showGuide || error) && <UploadGuide onUpload={onUpload} busy={busy} error={error} />}
    <ExpressionGallery avatar={selected} />
    <div className="next-bar"><div><span className="selected-dot" /><span><strong>{selected.name}</strong> is ready to make someone smile.</span></div>
      <button className="button button-green" type="button" disabled={busy} onClick={onContinue}>Next: write your message <Icon name="arrow" size={18} /></button></div>
    <p className="local-note"><Icon name="shield" size={15} />Made in your browser. No account. No uploads to our servers.</p>
  </>;
}
