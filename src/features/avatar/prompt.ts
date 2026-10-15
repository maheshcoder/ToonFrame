import { SHEET_FORMATS, UPLOAD_ORDER, moodDetails } from './expressions.ts';
import type { SheetLayout } from './expressions.ts';

export function characterPrompt(layout: SheetLayout): string {
  const { columns, rows, width, height } = SHEET_FORMATS[layout];
  const order = UPLOAD_ORDER[layout];
  const rowInstructions = Array.from({ length: rows }, (_, row) =>
    'Row ' + (row + 1) + ': ' + order.slice(row * columns, (row + 1) * columns).map((mood) => moodDetails(mood).label.toLowerCase()).join(', ') + '.',
  ).join('\n');
  return `Use my attached portrait as the character identity reference, and the attached cartoon sheet as the drawing-style reference.
Create one expression sprite sheet of the SAME person in a cute, polished chibi cartoon style: expressive eyes, clean outlines, soft colors, head-and-upper-torso framing. Preserve my hairstyle, skin tone, outfit, accessories, and recognizable face consistently.

OUTPUT: one PNG image, ${width} × ${height} pixels (2:3 portrait aspect ratio). Arrange exactly ${columns} equal columns × ${rows} equal rows = ${layout} expressions. Each character must be centered at the same scale inside its own equal-sized cell. Leave a little empty space around every character; no hair or hands may cross cell boundaries. Use a plain white background, no borders or drawn gridlines, no text, no labels, no watermark, and no extra people.

EXACT EXPRESSION ORDER, left to right, top to bottom:
${rowInstructions}

These expressions are for fun messages to friends, partners, and family. Make happy bright and smiling, love warm and affectionate, shy blushing with a bashful glance, surprised wide-eyed, angry comically exaggerated rather than frightening, sad gently apologetic, excited energetic, winking cheeky and playful, and grateful teary-eyed but hopeful. The feelings must be visibly distinct at small sizes.

Change the face and small hand gestures for each expression. Do not change the person, outfit, hairstyle, background, or framing. Deliver only the complete expression sheet.`;
}
