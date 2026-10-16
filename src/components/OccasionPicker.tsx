import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { OCCASIONS, occasionDetails } from '../features/message/occasions';
import type { OccasionId } from '../features/message/occasions';
import { useReducedMotion } from '../lib/useReducedMotion';
import { Icon } from './Icon';

export function OccasionPicker({ value, onChange }: { value: OccasionId; onChange: (id: OccasionId) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const helpId = useId();
  const reducedMotion = useReducedMotion();
  const [edges, setEdges] = useState({ start: true, end: false });
  const selected = occasionDetails(value);
  function measure() {
    const rail = railRef.current;
    if (rail) setEdges({ start: rail.scrollLeft <= 2, end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2 });
  }
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    measure();
    const observer = new ResizeObserver(measure); observer.observe(rail);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const rail = railRef.current, tile = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!rail || !tile) return;
    if (tile.offsetLeft < rail.scrollLeft || tile.offsetLeft + tile.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: tile.offsetLeft - (rail.clientWidth - tile.offsetWidth) / 2 });
    }
    measure();
  }, [value]);
  function scroll(direction: number) {
    const rail = railRef.current;
    rail?.scrollBy({ left: direction * rail.clientWidth * .8, behavior: reducedMotion ? 'instant' : 'smooth' });
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-occasion]')];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const next = event.key === 'ArrowRight' ? Math.min(index + 1, buttons.length - 1) : event.key === 'ArrowLeft' ? Math.max(index - 1, 0) : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); buttons[next].focus({ preventScroll: true });
    const rail = railRef.current!;
    rail.scrollTo({ left: buttons[next].offsetLeft - (rail.clientWidth - buttons[next].offsetWidth) / 2 });
  }
  return <div className="occasion-carousel">
    <div className="occasion-browse-bar"><p id={helpId}>Swipe or scroll sideways · {OCCASIONS.length} occasions</p>
      <div className="occasion-arrows"><button type="button" aria-label="Previous occasions" disabled={edges.start} onClick={() => scroll(-1)}><Icon name="back" size={17} /></button>
        <button type="button" aria-label="Next occasions" disabled={edges.end} onClick={() => scroll(1)}><Icon name="arrow" size={17} /></button></div>
    </div>
    <div className="occasion-rail" ref={railRef} role="group" aria-label="Choose an occasion" aria-describedby={helpId} onScroll={measure} onKeyDown={navigate}>
      {OCCASIONS.map((occasion) => <button key={occasion.id} type="button" data-occasion={occasion.id} aria-label={occasion.label}
        aria-pressed={value === occasion.id} onClick={() => onChange(occasion.id)}>
        <span className="occasion-tile-emoji" aria-hidden="true">{occasion.emoji}</span><span>{occasion.label}</span><small>{occasion.group}</small>
      </button>)}
    </div>
    <p className="occasion-current"><span aria-hidden="true">{selected.emoji}</span> <strong>{selected.label}</strong><span>· {selected.group}</span></p>
  </div>;
}