import test from 'node:test';
import assert from 'node:assert/strict';
import { themeFrame } from '../src/features/themes/frame.ts';
import { THEMES, themeDetails } from '../src/features/themes/index.ts';
import { ATMOSPHERES } from '../src/features/themes/definition.ts';
import { APP_CONTENT, validateContent } from '../src/features/content/validateContent.ts';

test('every atmosphere is used and background motion is deterministic at any seek position', () => {
  assert.deepEqual(new Set(THEMES.map((theme) => theme.atmosphere)), new Set(ATMOSPHERES));
  for (const theme of THEMES) {
    const first = themeFrame(theme, { timeMs: 350 });
    assert.deepEqual(first, themeFrame(theme, { timeMs: 350 }));
    assert.notDeepEqual(first.particles, themeFrame(theme, { timeMs: 1350 }).particles);
    assert.ok(first.particles.every((particle) => particle.x < 150 || particle.x > 570), 'Particles leave a clear message center');
    assert.ok([...first.motifs, ...first.particles].every((item) => Object.values(item).every((value) => typeof value !== 'number' || Number.isFinite(value))));
  }
});
test('reduced motion freezes all scenery, ignores pointer depth and suppresses tap bursts', () => {
  for (const theme of THEMES) {
    const initial = themeFrame(theme, { reducedMotion: true });
    const later = themeFrame(theme, { timeMs: 50000, reducedMotion: true, pointer: { x: 1, y: -1 }, burst: { progress: .3, origin: { x: 360, y: 400 } } });
    assert.deepEqual(initial, later);
    assert.equal(later.reactions.length, 0);
  }
});
test('preview bursts expire and pointer depth stays bounded without moving the message', () => {
  const theme = themeDetails('birthday');
  const base = themeFrame(theme);
  const moved = themeFrame(theme, { pointer: { x: 400, y: -400 } });
  assert.equal(moved.motifs[0].x - base.motifs[0].x, 6);
  assert.equal(moved.motifs[0].y - base.motifs[0].y, -5);
  const burst = { progress: .4, origin: { x: 200, y: 350 } };
  const result = themeFrame(theme, { burst });
  assert.ok(result.reactions.length > 0);
  assert.deepEqual(result.particles, base.particles, 'Tap reactions do not change the recorded ambient sequence');
  assert.equal(themeFrame(theme, { burst: { ...burst, progress: 1 } }).reactions.length, 0);
  assert.deepEqual(themeFrame(theme, { timeMs: -100 }), base);
});
test('invalid atmosphere names fail content validation with the theme ID', () => {
  const themes = [{ ...themeDetails('birthday'), atmosphere: 'missing' as typeof ATMOSPHERES[number] }];
  assert.ok(validateContent({ ...APP_CONTENT, themes }).includes('birthday: unknown atmosphere missing'));
});