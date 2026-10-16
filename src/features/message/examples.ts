import { EXAMPLE_TONES } from './exampleTones.ts';
import { occasionDetails } from './occasions.ts';
import type { MessageOptions } from './occasions.ts';

export function messageExample(options: MessageOptions, dialogue: boolean, names: readonly string[] = ['Me', 'Friend']): string {
  const occasion = occasionDetails(options.occasion);
  const base = occasion.example.split('\n').filter(Boolean);
  const tone = options.emotion === 'auto' ? null : EXAMPLE_TONES[options.emotion];
  const lines = tone ? [occasion.lead, ...tone.lines] : base;
  if (!dialogue) return lines.join('\n');
  const first = names[0] || 'Me', second = names[1] || 'Friend';
  return [
    first + ': ' + lines[0],
    second + ': ' + (tone?.reply ?? occasion.reply),
    first + ': ' + lines.slice(1).join(' '),
    second + ': ' + (tone?.ending ?? 'I’m glad you sent this.'),
  ].join('\n');
}
