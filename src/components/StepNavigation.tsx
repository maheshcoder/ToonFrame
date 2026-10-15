import { Icon } from './Icon';
export type Step = 'avatar' | 'script' | 'animation';
export const STEPS: { id: Step; label: string }[] = [
  { id: 'avatar', label: 'Your character' }, { id: 'script', label: 'Your message' }, { id: 'animation', label: 'Your animation' },
];
export function StepNavigation({ step, hasStory, onNavigate }: { step: Step; hasStory: boolean; onNavigate: (step: Step) => void }) {
  const current = STEPS.findIndex((item) => item.id === step);
  return <nav className="step-navigation" aria-label="Create your animation">
    {STEPS.map((item, index) => <button key={item.id} type="button" aria-current={step === item.id ? 'step' : undefined}
      disabled={item.id === 'animation' && !hasStory} onClick={() => onNavigate(item.id)}
      className={index === current ? 'current' : index < current ? 'complete' : ''}>
      <span className="step-circle">{index < current ? <Icon name="check" size={13} /> : '0' + (index + 1)}</span><span>{item.label}</span>
    </button>)}
  </nav>;
}
