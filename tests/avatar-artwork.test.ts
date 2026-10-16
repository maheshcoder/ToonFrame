import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILTINS, avatarFrame, avatarSourceRect, avatarSheetAspectRatio } from '../src/features/avatar/types.ts';
import { BUILTIN_SHEETS } from '../src/features/avatar/sheets/index.ts';
import { BIRTHDAY_ORDER } from '../src/features/avatar/sheets/birthday.ts';
import { MOODS } from '../src/features/avatar/expressions.ts';
import { atlasFrames, containFrame } from '../src/features/avatar/framing.ts';
import { APP_CONTENT, validateContent } from '../src/features/content/validateContent.ts';

test('each birthday sheet maps all twelve supplied drawings only for birthday messages', () => {
  for (const avatar of BUILTINS) for (const [index, mood] of BIRTHDAY_ORDER.entries()) {
    const frame = avatarFrame(avatar, mood, 'birthday');
    assert.ok(frame.url.startsWith('/avatars/' + avatar.id + '/birthday/'));
    assert.equal(frame.frame, index); assert.equal(frame.columns, 3); assert.equal(frame.rows, 4);
    assert.ok(!avatarFrame(avatar, mood, 'love').url.includes('/birthday/'));
  }
  assert.equal(avatarSheetAspectRatio(avatarFrame(BUILTINS[0], 'excited', 'birthday').url), 3 / 4);
  assert.equal(avatarSheetAspectRatio(avatarFrame(BUILTINS[1], 'excited', 'birthday').url), 2 / 3);
});
test('birthday aliases reuse related poses while sad/angry feelings keep accurate regular artwork', () => {
  for (const avatar of BUILTINS) {
    assert.deepEqual(avatarFrame(avatar, 'joyful', 'birthday'), avatarFrame(avatar, 'excited', 'birthday'));
    assert.deepEqual(avatarFrame(avatar, 'happy', 'birthday'), avatarFrame(avatar, 'laughing', 'birthday'));
    assert.deepEqual(avatarFrame(avatar, 'love-heart', 'birthday'), avatarFrame(avatar, 'heartfelt', 'birthday'));
    for (const mood of ['sad', 'angry', 'mock-angry', 'downcast'] as const) assert.deepEqual(avatarFrame(avatar, mood, 'birthday'), avatarFrame(avatar, mood));
  }
  for (const layout of ['12','24','48'] as const) for (const mood of MOODS) {
    const avatar = { kind: 'upload', id: 'my-sheet', name: 'Me', url: 'blob:my-sheet', layout } as const;
    assert.deepEqual(avatarFrame(avatar, mood.id, 'birthday'), avatarFrame(avatar, mood.id));
  }
});
test('measured female crops keep the missing right edge, top of the last row, and remove neighboring heads', () => {
  const avatar = BUILTINS[1];
  const joyful = avatarSourceRect(avatarFrame(avatar, 'joyful'), 1024, 1536);
  assert.ok(joyful.x + joyful.width > 270 && joyful.x + joyful.width < 276, 'First column extends past the incorrect 256px cut');
  const giggling = avatarSourceRect(avatarFrame(avatar, 'giggling'), 1024, 1536);
  assert.ok(giggling.y < 1256 && giggling.height > 275, 'Last-row hair begins above the old 1280px cut');
  const excited = avatarSourceRect(avatarFrame(avatar, 'excited'), 1024, 1536);
  assert.ok(excited.y + excited.height < 1130, 'The next row begins below this crop, without a stray head at the bottom');
});
test('SVG-normalized and canvas-pixel crops agree and all regular/birthday poses fit without stretching', () => {
  for (const avatar of BUILTINS) for (const occasion of [undefined, 'birthday']) for (const mood of MOODS) {
    const frame = avatarFrame(avatar, mood.id, occasion), aspect = avatarSheetAspectRatio(frame.url);
    const width = aspect === .75 ? 1086 : 1024, height = width / aspect;
    const svg = avatarSourceRect(frame, aspect, 1), canvas = avatarSourceRect(frame, width, height);
    for (const key of ['x','y','width','height'] as const) assert.ok(Math.abs(svg[key] * height - canvas[key]) < .00001);
    assert.ok(canvas.x >= 0 && canvas.y >= 0 && canvas.x + canvas.width <= width && canvas.y + canvas.height <= height);
    for (const size of [45,64,125,199,259,306]) {
      const fit = containFrame(canvas, { x: 0, y: 0, width: size, height: size });
      assert.ok(fit.x >= size * .039 && fit.y >= size * .039);
      assert.ok(fit.x + fit.width <= size * .961 && fit.y + fit.height <= size * .961);
      assert.ok(Math.abs(fit.width / fit.height - canvas.width / canvas.height) < .00001);
    }
  }
});
test('all measured rectangles are inside their images and preserve the intended cell order', () => {
  assert.deepEqual(atlasFrames(400,300,[0,100,400],[0,100,300],0), [
    {x:0,y:0,width:.25,height:1/3}, {x:.25,y:0,width:.75,height:1/3},
    {x:0,y:1/3,width:.25,height:2/3}, {x:.25,y:1/3,width:.75,height:2/3},
  ]);
  for (const sheet of Object.values(BUILTIN_SHEETS).flat()) if (sheet.frames) assert.equal(sheet.frames.length, sheet.columns * sheet.rows);
});
test('invalid occasion packs, aliases, and out-of-image rectangles fail content validation', () => {
  const bad = validateContent({ ...APP_CONTENT, sheets: { female: [{
    src: '/avatars/wrong.png', columns: 1, rows: 1, order: ['happy'], occasion: 'not-registered', aliases: { sad: 'cry' },
    frames: [{ x: .9, y: 0, width: .5, height: 1 }],
  }] } });
  assert.ok(bad.some((message) => message.includes('unknown occasion')));
  assert.ok(bad.some((message) => message.includes('alias target')));
  assert.ok(bad.some((message) => message.includes('within the source image')));
});