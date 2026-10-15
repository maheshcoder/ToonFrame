import { useState } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import { MOODS } from '../features/avatar/expressions';
import { CharacterSprite } from './CharacterSprite';

export function ExpressionGallery({ avatar }: { avatar: AvatarAsset }) {
  const [open, setOpen] = useState(false);
  return <section className="expression-library">
    <button className="gallery-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span><span className="tiny-emoji" aria-hidden="true">😄 😮 😭</span> A face for every feeling</span>
      <span>{open ? 'Close expressions −' : 'Explore ' + MOODS.length + ' moods +'}</span>
    </button>
    {open && <><p className="small-note">Click through your expressions before writing. The 24 new personal-message poses appear first for built-in characters. A 48-expression upload has every pose. Older 12/24-expression sheets use the closest available pose for extra moods.</p>
      <div className="expression-grid">{(avatar.kind === 'builtin' ? [...MOODS.slice(24), ...MOODS.slice(0, 24)] : MOODS).map((mood) => <div className="expression-tile" key={mood.id}>
        <CharacterSprite avatar={avatar} mood={mood.id} /><span>{mood.emoji} {mood.label}</span>
      </div>)}</div>
    </>}
  </section>;
}
