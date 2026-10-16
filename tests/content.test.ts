import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_CONTENT, validateContent } from '../src/features/content/validateContent.ts';
import { THEMES, themeDetails } from '../src/features/themes/index.ts';
import { OCCASIONS } from '../src/features/message/occasions/index.ts';
import { UPLOAD_ORDER } from '../src/features/avatar/uploadFormats.ts';
import { drawThemeBackground } from '../src/features/themes/drawBackground.ts';
import type { ExpressionDefinition } from '../src/features/avatar/catalog/types.ts';

test('all content registries have valid links and each occasion has its own background', () => {
  assert.deepEqual(validateContent(), []);
  assert.equal(new Set(OCCASIONS.map((item) => item.theme)).size, OCCASIONS.length);
  assert.ok(THEMES.length >= OCCASIONS.length);
  assert.ok(themeDetails('birthday').decorations.some((item) => item.shape === 'balloon'));
  assert.ok(themeDetails('invitation').decorations.some((item) => item.shape === 'mirrorball'));
  assert.notEqual(themeDetails('birthday').background, themeDetails('invitation').background);
});
test('new catalog entries do not change already-generated upload layouts', () => {
  const extra: ExpressionDefinition = { id: 'relieved', label: 'Relieved', emoji: '😮‍💨', motion: 'breathe', group: 'custom', fallback: 'calm', match: { words: ['relieved'] } };
  const sizes = Object.fromEntries(Object.entries(UPLOAD_ORDER).map(([id,order]) => [id,order.length]));
  assert.deepEqual(validateContent({ ...APP_CONTENT, expressions: [...APP_CONTENT.expressions, extra] }), []);
  assert.deepEqual(sizes, { '12': 12, '24': 24, '48': 48 });
  assert.equal(UPLOAD_ORDER['48'].at(-1), 'giggling');
});
test('duplicate IDs, missing fallbacks, fallback cycles and unknown theme links produce useful errors', () => {
  assert.ok(validateContent({ ...APP_CONTENT, expressions: [...APP_CONTENT.expressions, APP_CONTENT.expressions[0]] }).some((error) => error.includes('duplicate ID neutral')));
  assert.ok(validateContent({ ...APP_CONTENT, expressions: [{ ...APP_CONTENT.expressions[0], fallback: 'not-defined' }, ...APP_CONTENT.expressions.slice(1)] }).some((error) => error.includes('unknown fallback')));
  const cycle: ExpressionDefinition[] = [
    { id: 'loop-one', label: 'One', emoji: '🙂', motion: 'breathe', group: 'custom', fallback: 'loop-two' },
    { id: 'loop-two', label: 'Two', emoji: '🙂', motion: 'breathe', group: 'custom', fallback: 'loop-one' },
  ];
  assert.ok(validateContent({ ...APP_CONTENT, expressions: [...APP_CONTENT.expressions, ...cycle] }).some((error) => error.includes('fallback cycle')));
  assert.ok(validateContent({ ...APP_CONTENT, occasions: [{ ...APP_CONTENT.occasions[0], theme: 'not-defined' }] }).some((error) => error.includes('unknown theme')));
});
test('bad atlas grids, pose counts and nonlocal image paths are rejected', () => {
  const bad = validateContent({ ...APP_CONTENT,
    sheets: { male: [{ src: '/avatars/missing.png', columns: 1, rows: 1, order: ['happy', 'not-defined'] }] },
    uploads: { '12': { columns: 3, rows: 4, order: ['happy'] } },
    themes: [{ ...APP_CONTENT.themes[0], image: 'https://example.com/not-local.png' }],
  });
  assert.ok(bad.some((error) => error.includes('more poses than grid cells')));
  assert.ok(bad.some((error) => error.includes('unknown expression')));
  assert.ok(bad.some((error) => error.includes('pose count must match')));
  assert.ok(bad.some((error) => error.includes('public/themes/')));
});
test('optional theme images are fitted as a centered cover image with the configured opacity', () => {
  const oldPath = globalThis.Path2D;
  globalThis.Path2D = class {} as typeof Path2D;
  const calls: { alpha: number; args: unknown[] }[] = [];
  const context = {
    globalAlpha: 1, save() {}, restore() {}, fillRect() {}, beginPath() {}, ellipse() {}, fill() {},
    translate() {}, rotate() {}, scale() {}, stroke() {}, createRadialGradient() { return { addColorStop() {} }; },
    drawImage(...args: unknown[]) { calls.push({ alpha: this.globalAlpha, args }); },
  };
  try {
    const image = { naturalWidth: 1000, naturalHeight: 500 } as HTMLImageElement;
    drawThemeBackground(context as unknown as CanvasRenderingContext2D, { ...themeDetails('birthday'), imageOpacity: .2 }, 720, 900, image);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].alpha, .2);
    assert.deepEqual(calls[0].args.slice(1), [-540, 0, 1800, 900]);
  } finally {
    if (oldPath) globalThis.Path2D = oldPath; else delete (globalThis as { Path2D?: unknown }).Path2D;
  }
});
