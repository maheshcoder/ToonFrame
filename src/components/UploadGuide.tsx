import { useRef, useState } from 'react';
import { characterPrompt } from '../features/avatar/prompt';
import { SHEET_FORMATS, UPLOAD_ORDER, moodDetails } from '../features/avatar/expressions';
import type { SheetLayout } from '../features/avatar/expressions';
import { Icon } from './Icon';

export function UploadGuide({ onUpload, busy, error }: {
  onUpload: (file: File, layout: SheetLayout) => void; busy: boolean; error: string;
}) {
  const [layout, setLayout] = useState<SheetLayout>('48');
  const [reference, setReference] = useState<'male' | 'female'>('female');
  const [copyStatus, setCopyStatus] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const prompt = characterPrompt(layout);
  const format = SHEET_FORMATS[layout];
  const referenceUrl = '/avatars/' + reference + (layout === '48' ? '-extra-2.png' : '-expressions.png');
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus('Prompt copied. Attach your photo and a reference sheet in your image generator.');
    } catch {
      promptRef.current?.focus();
      promptRef.current?.select();
      setCopyStatus('The prompt is selected. Press Ctrl+C or use your device’s Copy command.');
    }
  }
  return <section id="upload-guide" className="upload-guide" aria-labelledby="upload-title">
    <div className="upload-intro"><span className="eyebrow">MAKE THE CHARACTER YOURS</span><h2 id="upload-title">Your photo. A whole range of feelings.</h2>
      <p>Use the prompt below in your favourite AI image generator, then bring the finished expression sheet back here.</p></div>
    <div className="guide-columns">
      <div className="prompt-side">
        <div className="guide-step"><span>1</span><div><h3>Copy your character prompt</h3><p>Attach a clear, square, front-facing head-and-shoulders photo of yourself and a style reference. Use a simple background. Keep your face centered, evenly lit, and unobstructed. Avoid group photos, sunglasses, and strong filters.</p></div></div>
        <div className="segmented-control" role="group" aria-label="Expression sheet format">
          <button type="button" aria-pressed={layout === '48'} onClick={() => { setLayout('48'); setCopyStatus(''); }}>48 expressions <span>6 × 8 grid · Full set</span></button>
          <button type="button" aria-pressed={layout === '24'} onClick={() => { setLayout('24'); setCopyStatus(''); }}>24 expressions <span>4 × 6 grid</span></button>
          <button type="button" aria-pressed={layout === '12'} onClick={() => { setLayout('12'); setCopyStatus(''); }}>12 expressions <span>3 × 4 grid</span></button>
        </div>
        <label className="sr-only" htmlFor="character-prompt">AI character generation prompt</label>
        <textarea id="character-prompt" className="prompt-text" readOnly value={prompt} ref={promptRef} />
        <button className="button button-outline copy-button" type="button" onClick={copyPrompt}><Icon name="copy" size={17} />Copy prompt</button>
        <p className="copy-status" role="status">{copyStatus}</p>
        <div className="guide-step"><span>2</span><div><h3>Generate, then upload your sheet</h3><p>One PNG, JPG/JPEG, or WebP, up to 10 MB. Portrait 2:3 format, ideally {format.width} × {format.height} px. Use equal cells and the exact expression order. Plain white background; no labels or borders.</p></div></div>
        <div className="file-control">
          <input className="sr-only" id="sheet-file" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            disabled={busy} aria-describedby="sheet-upload-status" onChange={(event) => {
              const file = event.target.files?.[0]; event.target.value = '';
              if (file) onUpload(file, layout);
            }} />
          <label className="button button-green" htmlFor="sheet-file"><Icon name="upload" size={17} />{busy ? 'Checking your sheet…' : 'Upload ' + layout + '-expression sheet'}</label>
        </div>
        <p id="sheet-upload-status" className={error ? 'error-message' : 'small-note'} role={error ? 'alert' : 'status'}>
          {error || (busy ? 'Checking file type, size, and dimensions…' : 'Your file stays in this browser. We check dimensions; please check the pose order in the preview.')}
        </p>
      </div>
      <div className="reference-side">
        <div className="reference-heading"><h3>A little visual guidance</h3><div role="group" aria-label="Style reference">
          <button type="button" aria-pressed={reference === 'male'} onClick={() => setReference('male')}>Male</button>
          <button type="button" aria-pressed={reference === 'female'} onClick={() => setReference('female')}>Female</button>
        </div></div>
        <img className="reference-sheet" src={referenceUrl} alt={reference + ' cartoon style reference with ' + (layout === '48' ? '24 personal-message poses' : '12 expressions')} />
        <a className="text-button reference-download" href={referenceUrl} download={reference + '-style-reference.png'}><Icon name="download" size={15} />Download style reference</a>
        <p className="small-note">Use this for the drawing style. Your upload must follow the order below and in the prompt.</p>
        {layout === '48' && <p className="small-note">All 48 poses, left to right and top to bottom. On a phone, swipe the grid sideways to see all six columns.</p>}
        <div className="format-map-scroll" tabIndex={0} role="region" aria-label="Required expression order"><div className={'format-map columns-' + format.columns}>
          {UPLOAD_ORDER[layout].map((mood, index) => <div key={mood}><span>{index + 1}</span><b aria-hidden="true">{moodDetails(mood).emoji}</b><small>{moodDetails(mood).label}</small></div>)}
        </div></div>
      </div>
    </div>
  </section>;
}
