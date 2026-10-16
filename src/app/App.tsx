import { useEffect, useRef, useState } from 'react';
import { AvatarPage } from '../pages/AvatarPage';
import { StoryPage } from '../pages/StoryPage';
import { AnimationPage } from '../pages/AnimationPage';
import { StepNavigation } from '../components/StepNavigation';
import type { Step } from '../components/StepNavigation';
import { Icon } from '../components/Icon';
import { BUILTINS } from '../features/avatar/types';
import type { AvatarAsset } from '../features/avatar/types';
import type { SheetLayout } from '../features/avatar/expressions';
import { SheetResources } from '../features/avatar/sheetResource';
import { DEFAULT_MESSAGE_OPTIONS } from '../features/message/occasions';
import type { MessageOptions } from '../features/message/occasions';
import type { Story, StoryMode } from '../features/story/compileStory';

function readStep(): Step {
  const step = window.location.hash.replace('#/', '');
  return step === 'script' || step === 'animation' ? step : 'avatar';
}
export function App() {
  const [step, setStep] = useState<Step>(readStep);
  const [uploads, setUploads] = useState<AvatarAsset[]>([]);
  const [castIds, setCastIds] = useState<[string, string]>(['male', 'female']);
  const [resources] = useState(() => new SheetResources());
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [script, setScript] = useState('');
  const [options, setOptions] = useState<MessageOptions>(DEFAULT_MESSAGE_OPTIONS);
  const [mode, setMode] = useState<StoryMode>('auto');
  const [story, setStory] = useState<Story | null>(null);
  const main = useRef<HTMLElement>(null);
  const library = [...BUILTINS, ...uploads];

  useEffect(() => {
    const change = () => setStep(readStep());
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (step === 'animation' && !story) {
      history.replaceState(null, '', '#/script');
      setStep('script');
      return;
    }
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = (step === 'avatar' ? 'Choose your character' : step === 'script' ? 'Write your message' : 'Your animation') + ' · Avatar Message Studio';
  }, [step, Boolean(story)]);
  useEffect(() => () => resources.dispose(), [resources]);

  function navigate(next: Step) {
    if (next === 'animation' && !story) return;
    window.location.hash = '/' + next;
    setStep(next);
  }
  function updateCast(slot: number, id: string) {
    setCastIds((current) => slot === 0 ? [id, current[1]] : [current[0], id]);
    setStory(null);
  }
  async function upload(file: File, layout: SheetLayout) {
    if (uploads.length >= 4) { setUploadError('You can keep four uploaded characters in this session. Remove one to add another.'); return; }
    setUploadBusy(true);
    setUploadError('');
    try {
      const url = await resources.load(file, layout);
      if (!url) return;
      const avatar: AvatarAsset = { kind: 'upload', id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, '').slice(0, 36) || 'Your character', url, layout };
      setUploads((current) => [...current, avatar]);
      updateCast(0, avatar.id);
      setUploadBusy(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not open this expression sheet.');
      setUploadBusy(false);
    }
  }
  function removeUpload(id: string) {
    const asset = uploads.find((avatar) => avatar.id === id);
    if (asset?.kind === 'upload') resources.remove(asset.url);
    setUploads((current) => current.filter((avatar) => avatar.id !== id));
    setCastIds((current) => [current[0] === id ? 'male' : current[0], current[1] === id ? 'female' : current[1]]);
    setStory(null);
    setUploadError('');
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <header className="site-header">
      <a href="#/avatar" className="brand" aria-label="Avatar Message Studio home"><span className="brand-mark"><Icon name="spark" size={22} /></span><span>avatar<span className="brand-light"> / message studio</span></span></a>
      <span className="silent-badge"><Icon name="silent" size={16} />Little messages. Big feelings.</span>
    </header>
    <StepNavigation step={step} hasStory={Boolean(story)} onNavigate={navigate} />
    <main id="main-content" tabIndex={-1} ref={main}>
      {step === 'avatar' && <AvatarPage library={library} selectedId={castIds[0]} onSelect={(id) => updateCast(0, id)} onUpload={upload} onRemove={removeUpload} busy={uploadBusy} error={uploadError} onContinue={() => navigate('script')} />}
      {step === 'script' && <StoryPage script={script} onScript={(value) => { setScript(value); setStory(null); }} mode={mode}
        options={options} onOptions={(value) => { setOptions(value); setStory(null); }} onMode={(value) => { setMode(value); setStory(null); }} library={library} castIds={castIds} onCast={updateCast}
        onBack={() => navigate('avatar')} onCreate={(value) => { setStory(value); window.location.hash = '/animation'; setStep('animation'); }} />}
      {step === 'animation' && story && <AnimationPage key={story.id} story={story} onStory={setStory}
        cast={castIds.map((id) => library.find((avatar) => avatar.id === id) ?? BUILTINS[0])} onEdit={() => navigate('script')} />}
    </main>
    <footer><span>Avatar Message Studio <span>✳</span> A little more expressive.</span> <span>Made by S.Maheswar</span><span>For friends, family, and your favourite person.</span></footer>
   </div>;
}
