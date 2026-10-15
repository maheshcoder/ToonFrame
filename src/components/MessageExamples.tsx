import { EMOTIONS, occasionDetails } from '../features/message/occasions';
import type { MessageOptions } from '../features/message/occasions';
import { messageExample } from '../features/message/examples';

export function MessageExamples({ options, dialogue, speakers, onUse }: {
  options: MessageOptions; dialogue: boolean; speakers?: string[]; onUse: (dialogue: boolean) => void;
}) {
  const occasion = occasionDetails(options.occasion);
  const feeling = EMOTIONS.find((item) => item.id === options.emotion)?.label ?? 'Changing feelings';
  return <section className="message-examples" aria-label="Examples for your occasion and feeling">
    <details className="example-preview">
      <summary>Preview example <span>{occasion.label} · {feeling} · {dialogue ? 'Two characters' : 'One character'}</span></summary>
      <p>{messageExample(options, dialogue, speakers)}</p>
    </details>
    <div className="example-actions"><span>Need a starting line?</span>
      <button className="text-button" type="button" onClick={() => onUse(dialogue)}>Use {occasion.label.toLowerCase()} example</button>
      <button className="text-button" type="button" onClick={() => onUse(true)}>Try a conversation</button>
      {dialogue && <button className="text-button" type="button" onClick={() => onUse(false)}>Use one-character example</button>}
    </div>
    <p className="small-note">Examples match your chosen occasion and feeling. “Use” replaces your text; changing a selection keeps your draft.</p>
  </section>;
}
