import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { avatarFrame, avatarExpressionDetails } from '../features/avatar/types';
import { expressionChoices } from '../features/avatar/expressionChoices';
import type { ExpressionChoice } from '../features/avatar/expressionChoices';
import { expressionsForOccasion } from '../features/avatar/occasionExpressions';
import { OCCASIONS } from '../features/message/occasions';
import type { Mood } from '../features/avatar/expressions';
import type { AvatarAsset, AvatarArtwork } from '../features/avatar/types';
import { CharacterSprite } from './CharacterSprite';
import { Icon } from './Icon';

export function SceneExpressionPicker({ avatar, value, sceneNumber, speaker, onChange, onClose, occasion, artwork }: {
  avatar: AvatarAsset; value: Mood; sceneNumber: number; speaker: string; occasion?: string; artwork?: AvatarArtwork;
  onChange: (choice: ExpressionChoice) => void; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const titleId = useId(), helpId = useId();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [occasionFilter, setOccasionFilter] = useState('all');
  const catalog = expressionChoices(avatar);
  const current = avatarFrame(avatar,value,occasion,artwork);
  const currentId = current.url + '#' + current.frame;
  const selected = avatarExpressionDetails(avatar,value,occasion,artwork);
  const groups = [{ id: 'all', label: 'All' }, { id: 'personal', label: 'Personal' }, { id: 'classic', label: 'Classic' },
    { id: 'occasion', label: 'Occasions' }, ...(catalog.some((choice) => choice.group === 'custom') ? [{ id: 'custom', label: 'Custom' }] : [])];
  const term = search.trim().toLocaleLowerCase();
  const occasionChoices = occasionFilter === 'all' ? catalog : expressionsForOccasion(avatar,occasionFilter,catalog);
  const sourceChoices = group === 'occasion' ? occasionChoices : catalog;
  const choices = sourceChoices.filter((choice) => (group === 'all' || group === 'occasion' || choice.group === group)
    && (choice.label + ' ' + choice.mood + ' ' + choice.emoji).toLocaleLowerCase().includes(term));
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    const selectedButton = dialog.querySelector<HTMLButtonElement>('.expression-option[aria-pressed="true"]');
    selectedButton?.focus({ preventScroll: true });
    selectedButton?.scrollIntoView({ block: 'nearest' });
    return () => {
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, []);
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('.expression-option')];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const firstTop = buttons[0].offsetTop;
    const columns = buttons.findIndex((button) => button.offsetTop > firstTop + 1);
    const width = columns > 0 ? columns : buttons.length;
    const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'ArrowDown' ? index + width : event.key === 'ArrowUp' ? index - width : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : -1;
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); buttons[Math.max(0, Math.min(next, buttons.length - 1))].focus();
  }
  return createPortal(<dialog className="expression-dialog" ref={dialogRef} aria-labelledby={titleId} aria-describedby={helpId}
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
    }}>
    <div className="expression-picker-header"><CharacterSprite artwork={artwork} occasion={occasion} avatar={avatar} mood={value} decorative />
      <div><span className="eyebrow">A FACE FOR EVERY FEELING</span><h2 id={titleId}>Expressions for scene {sceneNumber}</h2><p>{speaker} · {avatar.name}</p></div>
      <button type="button" className="expression-picker-close" aria-label="Close expression picker" onClick={onClose}><Icon name="close" size={20} /></button>
    </div>
    <div className="expression-picker-tools"><label className="sr-only" htmlFor={titleId + '-search'}>Search expressions</label>
      <input id={titleId + '-search'} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a feeling or emoji…" autoComplete="off" />
      <div className="expression-picker-tabs" role="group" aria-label="Expression categories">{groups.map((item) => <button type="button" key={item.id} aria-pressed={group === item.id} onClick={() => setGroup(item.id)}>{item.label}</button>)}</div>
      {group === 'occasion' && <div className="expression-occasion-tabs" role="group" aria-label="Occasion expressions">
        <button type="button" aria-pressed={occasionFilter === 'all'} onClick={() => setOccasionFilter('all')}>All occasions <small>{catalog.length}</small></button>
        {OCCASIONS.map((item) => <button type="button" key={item.id} data-expression-occasion={item.id}
          aria-pressed={occasionFilter === item.id} onClick={() => setOccasionFilter(item.id)}><span aria-hidden="true">{item.emoji}</span> {item.label} <small>{expressionsForOccasion(avatar,item.id,catalog).length}</small></button>)}
      </div>}
      {group === 'occasion' && <p className="expression-pack-note">{occasionFilter === 'all' ? 'Browse related character expressions by occasion.' : occasionChoices.some((choice) => choice.occasion === occasionFilter) ? 'Dedicated artwork for this occasion.' : 'Related poses from this character’s library. Dedicated artwork will appear here when added.'}</p>}
    </div>
    <div className="expression-keyboard" role="group" aria-label={'Expressions for ' + speaker} onKeyDown={navigate}>
      {choices.map((choice) => <button type="button" className="expression-option" data-mood={choice.mood} data-source={choice.group === 'occasion' ? 'occasion' : 'generic'}
        data-artwork={choice.id} key={choice.id} aria-label={choice.label} aria-pressed={currentId === choice.id} onClick={() => onChange(choice)}>
        <span className="expression-option-art"><CharacterSprite artwork={choice.artwork} avatar={avatar} mood={choice.mood} decorative /><span className="expression-option-emoji" aria-hidden="true">{choice.emoji}</span></span>
        <span className="expression-option-label">{choice.label}</span>
      </button>)}
      {!choices.length && <p className="expression-empty">{group === 'occasion' && !term
        ? 'No dedicated expressions for this occasion yet. Try All for this character’s other feelings.'
        : 'No matching expressions. Try another feeling or choose All.'}</p>}
    </div>
    <div className="expression-picker-footer"><p id={helpId}>Tap a character to use its feeling.</p><span role="status">{choices.length} unique poses · Current: {selected.emoji} {selected.label}</span></div>
  </dialog>, document.body);
}