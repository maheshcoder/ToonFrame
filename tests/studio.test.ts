import test from 'node:test';
import assert from 'node:assert/strict';
import { compileStory, detectMood, validateScript, SOLO_EXAMPLE, DIALOGUE_EXAMPLE } from '../src/features/story/compileStory.ts';
import { MOODS, SHEET_FORMATS, UPLOAD_ORDER, uploadFrame } from '../src/features/avatar/expressions.ts';
import { BUILTINS, avatarFrame } from '../src/features/avatar/types.ts';
import { characterPrompt } from '../src/features/avatar/prompt.ts';
import { SheetResources, validateImage, validateDimensions, MAX_IMAGE_BYTES } from '../src/features/avatar/sheetResource.ts';
import { INITIAL_TIMELINE, advanceTimeline, seekTimeline } from '../src/features/story/timeline.ts';

test('script validation accepts words and emoji and rejects empty, symbol-only, and oversized scripts', () => {
  assert.ok(validateScript('  ')); assert.ok(validateScript('!!!'));
  assert.ok(validateScript('x'.repeat(5001)));
  assert.equal(validateScript('😄 ❤️'), null);
  assert.equal(validateScript('hello'), null);
});
test('explicit mood tags override emoji; emoji override words; negation is handled', () => {
  assert.equal(detectMood('[angry] I love you 😄'), 'angry');
  assert.equal(detectMood('I am angry 😌'), 'calm');
  assert.equal(detectMood('I am not happy'), 'sad');
  assert.equal(detectMood('What is that?'), 'curious');
  assert.equal(detectMood('The train arrived.'), 'neutral');
  assert.equal(detectMood('First 😭 then 🎉'), 'celebrate');
});
test('one-person text produces readable, timed scenes and retains emoji', () => {
  const story = compileStory(SOLO_EXAMPLE);
  assert.equal(story.dialogue, false);
  assert.ok(story.scenes.length >= 3);
  assert.ok(story.scenes.every((scene) => scene.speakerIndex === 0 && scene.durationMs >= 2400));
  assert.equal(story.durationMs, story.scenes.reduce((sum, scene) => sum + scene.durationMs, 0));
  const tagged = compileStory('[thinking] A tiny idea. 😄');
  assert.equal(tagged.scenes[0].mood, 'thinking');
  assert.equal(tagged.scenes[0].text, 'A tiny idea. 😄');
});
test('named dialogue auto-detects two speakers and assigns stable cast slots', () => {
  const story = compileStory(DIALOGUE_EXAMPLE);
  assert.equal(story.dialogue, true);
  assert.deepEqual(story.speakers, ['Me', 'Friend']);
  assert.equal(story.scenes[0].speakerIndex, 0);
  assert.equal(story.scenes[1].speakerIndex, 1);
  assert.ok(story.scenes.every((scene) => !/^Me:|^Friend:/.test(scene.text)));
  const stable = compileStory('Sam: Hello.\nJo: Hi.\nsam: Bye.');
  assert.equal(stable.scenes[2].speakerIndex, 0);
});
test('conversation errors explain missing labels, extra speakers, or absent second speaker', () => {
  assert.throws(() => compileStory('Me: Hello.', 'dialogue'), /two different names/);
  assert.throws(() => compileStory('Me: Hello.\nFriend: Hi.\nAn unlabelled line.'), /every conversation line/);
  assert.throws(() => compileStory('A: Hello.\nB: Hey.\nC: Hi.'), /two speakers/);
  assert.throws(() => compileStory('[sad]'), /Add message text/);
});
test('solo mode can intentionally narrate dialogue; long text is divided without loss', () => {
  assert.equal(compileStory(DIALOGUE_EXAMPLE, 'solo').dialogue, false);
  const text = Array(120).fill('a tiny idea').join(' ');
  const story = compileStory(text);
  assert.ok(story.scenes.every((scene) => scene.text.length <= 180));
  assert.equal(story.scenes.map((scene) => scene.text).join(' '), text);
  assert.throws(() => compileStory(Array(61).fill('Hi.').join('\n')), /60 scenes/);
});
test('every built-in character has a distinct valid frame for all 48 moods', () => {
  assert.equal(MOODS.length, 48);
  for (const avatar of BUILTINS) {
    const frames = MOODS.map((mood) => avatarFrame(avatar, mood.id));
    assert.ok(frames.every((item) => item.frame >= 0 && item.frame < item.columns * item.rows));
    assert.equal(new Set(frames.map((item) => item.url + ':' + item.frame)).size, 48);
  }
});
test('upload prompts and renderers use the same exact 12/24/48-expression order', () => {
  for (const layout of ['12', '24', '48'] as const) {
    const prompt = characterPrompt(layout);
    const format = SHEET_FORMATS[layout];
    assert.ok(prompt.includes(format.width + ' × ' + format.height));
    for (const mood of UPLOAD_ORDER[layout]) assert.equal(uploadFrame(mood, layout), UPLOAD_ORDER[layout].indexOf(mood));
    for (const mood of MOODS) assert.ok(uploadFrame(mood.id, layout) >= 0 && uploadFrame(mood.id, layout) < Number(layout));
    assert.ok(prompt.includes(format.columns + ' equal columns × ' + format.rows + ' equal rows'));
    assert.equal(UPLOAD_ORDER[layout].length, Number(layout));
  }
});
test('image checks enforce formats, size, portrait sheet ratio, and usable dimensions', () => {
  for (const [name, type] of [['a.png', 'image/png'], ['a.JPG', 'image/jpeg'], ['a.jpeg', 'image/jpeg'], ['a.webp', 'image/webp']]) {
    assert.equal(validateImage({ name, type, size: MAX_IMAGE_BYTES }), null);
  }
  assert.ok(validateImage({ name: 'a.gif', type: 'image/gif', size: 1 }));
  assert.ok(validateImage({ name: 'a.png', type: 'image/png', size: MAX_IMAGE_BYTES + 1 }));
  assert.ok(validateImage({ name: 'a.png', type: 'image/png', size: 0 }));
  assert.equal(validateDimensions({ width: 1024, height: 1536 }, '24'), null);
  assert.ok(validateDimensions({ width: 1000, height: 1000 }, '24'));
  assert.ok(validateDimensions({ width: 120, height: 180 }, '12'));
});
function resourceHarness() {
  let count = 0;
  const revoked: string[] = [];
  const pending = new Map<string, { resolve: (dimensions: {width:number;height:number}) => void; reject: (error: Error) => void }>();
  const resources = new SheetResources(() => 'blob:' + ++count, (url) => revoked.push(url),
    (url) => new Promise((resolve, reject) => pending.set(url, { resolve, reject })));
  const file = new File(['image'], 'sheet.png', { type: 'image/png' });
  const done = (url: string) => pending.get(url)!.resolve({ width: 1024, height: 1536 });
  return { resources, revoked, pending, file, done };
}
test('multiple uploaded cast members keep their URLs until removal or unmount', async () => {
  const h = resourceHarness();
  const first = h.resources.load(h.file, '24'); h.done('blob:1'); await first;
  const second = h.resources.load(h.file, '12'); h.done('blob:2'); await second;
  assert.deepEqual(h.revoked, []);
  h.resources.remove('blob:1'); h.resources.remove('blob:1');
  assert.deepEqual(h.revoked, ['blob:1']);
  h.resources.dispose(); h.resources.dispose();
  assert.deepEqual(h.revoked, ['blob:1', 'blob:2']);
});
test('invalid dimensions and corrupt decodes release URLs without removing valid cast assets', async () => {
  const h = resourceHarness();
  const first = h.resources.load(h.file, '24'); h.done('blob:1'); await first;
  const bad = h.resources.load(h.file, '24'); h.pending.get('blob:2')!.resolve({ width: 1000, height: 1000 });
  await assert.rejects(bad, /2:3/);
  const corrupt = h.resources.load(h.file, '24'); h.pending.get('blob:3')!.reject(new Error('corrupt'));
  await assert.rejects(corrupt, /corrupt/);
  assert.deepEqual(h.revoked, ['blob:2', 'blob:3']);
  h.resources.dispose();
  assert.equal(h.revoked.at(-1), 'blob:1');
});
test('stale decodes and pending unmounts do not leak URLs or add old characters', async () => {
  const h = resourceHarness();
  const first = h.resources.load(h.file, '24');
  const second = h.resources.load(h.file, '12'); h.done('blob:2'); await second;
  h.done('blob:1'); assert.equal(await first, null);
  const third = h.resources.load(h.file, '24'); h.resources.dispose(); h.done('blob:3');
  assert.equal(await third, null);
  assert.deepEqual([...h.revoked].sort(), ['blob:1', 'blob:2', 'blob:3']);
});
test('the timeline advances across frames, freezes when paused, and finishes at the exact end', () => {
  const durations = [2400, 3000, 4000];
  const playing = { ...INITIAL_TIMELINE, status: 'playing' as const };
  assert.deepEqual(advanceTimeline(playing, 3000, durations), { index: 1, elapsed: 600, status: 'playing' });
  const paused = { index: 1, elapsed: 600, status: 'paused' as const };
  assert.deepEqual(advanceTimeline(paused, 9000, durations), paused);
  assert.deepEqual(advanceTimeline(playing, 20000, durations), { index: 2, elapsed: 4000, status: 'ended' });
});
test('timeline seeking clamps endpoints and supports navigation without losing playback state', () => {
  assert.deepEqual(seekTimeline(3500, [2400, 3000], 'playing'), { index: 1, elapsed: 1100, status: 'playing' });
  assert.deepEqual(seekTimeline(10000, [2400, 3000], 'idle'), { index: 1, elapsed: 3000, status: 'paused' });
  assert.deepEqual(seekTimeline(-10, [2400, 3000], 'paused'), { index: 0, elapsed: 0, status: 'paused' });
});

test('new personal-message sheets use the exact 4×6 row-major frame order', () => {
  const order = [
    'joyful', 'laughing', 'gift', 'love-heart', 'blushing', 'flirty', 'missing-you', 'kiss',
    'wave', 'cheering', 'playful', 'inviting', 'mock-angry', 'pouting', 'frustrated', 'furious',
    'sorry', 'downcast', 'heartfelt', 'hopeful', 'smug', 'cheeky', 'shocked', 'giggling',
  ] as const;
  for (const avatar of BUILTINS) for (const [index, mood] of order.entries()) {
    assert.deepEqual(avatarFrame(avatar, mood), { url: '/avatars/' + avatar.id + '-extra-2.png', frame: index, columns: 4, rows: 6 });
    const story = compileStory('[' + mood + '] A message for you!');
    assert.equal(story.scenes[0].mood, mood);
    assert.equal(story.scenes[0].text, 'A message for you!');
  }
  assert.equal(UPLOAD_ORDER['24'].length, 24);
  assert.equal(uploadFrame('hopeful', '24'), UPLOAD_ORDER['24'].indexOf('grateful'));
  assert.equal(uploadFrame('hopeful', '12'), UPLOAD_ORDER['12'].indexOf('love'));
  assert.equal(uploadFrame('playful', '12'), UPLOAD_ORDER['12'].indexOf('wink'));
});

test('48-expression uploads map every pose directly with shared grid geometry', () => {
  const avatar = { kind: 'upload', id: 'custom-48', name: 'My avatar', url: 'blob:custom-48', layout: '48' } as const;
  assert.equal(validateDimensions({ width: 1536, height: 2304 }, '48'), null);
  assert.ok(validateDimensions({ width: 599, height: 899 }, '48'));
  for (const [index, mood] of MOODS.entries()) {
    assert.deepEqual(avatarFrame(avatar, mood.id), { url: avatar.url, frame: index, columns: 6, rows: 8 });
  }
  assert.equal(uploadFrame('hopeful', '48'), MOODS.findIndex((mood) => mood.id === 'hopeful'));
  assert.match(characterPrompt('48'), /6 equal columns × 8 equal rows = 48 expressions/);
  assert.match(characterPrompt('48'), /1536 × 2304 pixels/);
});
