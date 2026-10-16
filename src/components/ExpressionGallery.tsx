import { useState } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import { GALLERY_MOODS } from '../features/avatar/expressions';
import { expressionChoices } from '../features/avatar/expressionChoices';
import { CharacterSprite } from './CharacterSprite';

export function ExpressionGallery({ avatar }: { avatar: AvatarAsset }) {
  const [open, setOpen] = useState(false);
  const choices = avatar.kind === 'upload' ? expressionChoices(avatar) : GALLERY_MOODS.map((mood) => ({ ...mood, mood: mood.id }));
  return <section className="expression-library">
    <button className="gallery-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span><span className="tiny-emoji" aria-hidden="true">😄 😮 😭</span> A face for every feeling</span>
      <span>{open ? 'Close expressions −' : 'Explore ' + choices.length + ' moods +'}</span>
    </button>
    {open && <><p className="small-note">Click through your expressions before writing. Personal and custom expression packs appear first for built-in characters. Uploaded sheets keep their own frame order and use the closest available pose for moods outside their format.</p>
      <div className="expression-grid">{choices.map((mood) => <div className="expression-tile" key={mood.id}>
        <CharacterSprite avatar={avatar} mood={mood.mood} /><span>{mood.emoji} {mood.label}</span>
      </div>)}</div>
    </>}
  </section>;
}
