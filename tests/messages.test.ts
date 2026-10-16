import test from 'node:test';
import assert from 'node:assert/strict';
import { compileStory, detectMood } from '../src/features/story/compileStory.ts';
import { OCCASIONS, EMOTIONS } from '../src/features/message/occasions.ts';
import { chooseVideoFormat, videoDuration, MAX_VIDEO_DURATION_MS } from '../src/features/video/format.ts';
import { sceneAtTime, wrapText } from '../src/features/video/renderFrame.ts';

test('personal occasions choose loving, playful, apologetic, and celebratory expressions', () => {
  const cases = [
    ['Happy birthday!', 'excited'], ['Hope your day is amazing!', 'excited'],
    ['I miss you ❤️', 'love'], ['I miss you', 'missing-you'], ['We did it!', 'celebrate'],
    ['You’re invited—don’t be late!', 'inviting'], ['I’m mad at you', 'mock-angry'],
    ['But save me some cake!', 'playful'], ['Okay, I’m sorry.', 'sorry'],
    ['Friends again?', 'hopeful'], ['You forgot my birthday?', 'mock-angry'],
    ['I’m never forgiving you!', 'mock-angry'], ['I am not angry', 'calm'],
  ];
  for (const [message, mood] of cases) assert.equal(detectMood(message), mood, message);
});
test('selected feeling overrides keywords; explicit direction still overrides the feeling', () => {
  const options = { occasion: 'birthday', emotion: 'shy' } as const;
  assert.equal(detectMood('I am happy', options), 'blushing');
  assert.equal(detectMood('I am happy ❤️', options), 'love');
  assert.equal(detectMood('[playful] I am happy ❤️', options), 'playful');
  assert.equal(detectMood('[hopeful] Friends again?', options), 'hopeful');
  const story = compileStory('[mock-angry] Save me cake!', 'solo', options);
  assert.equal(story.scenes[0].mood, 'mock-angry');
  assert.equal(story.scenes[0].text, 'Save me cake!');
  for (const emotion of EMOTIONS) assert.equal(detectMood('Hello', { ...options, emotion: emotion.id }), emotion.mood);
});
test('occasion defaults guide unmarked moments and every example has a varied expression arc', () => {
  for (const occasion of OCCASIONS) {
    const options = { occasion: occasion.id, emotion: 'auto' } as const;
    const story = compileStory(occasion.example, 'solo', options);
    assert.equal(story.occasion, occasion.id);
    assert.ok(story.durationMs < MAX_VIDEO_DURATION_MS);
    assert.ok(story.scenes.every((scene) => scene.text.length <= 180));
    assert.ok(new Set(story.scenes.map((scene) => scene.mood)).size > 1, occasion.id);
    if (occasion.id !== 'just-because') assert.equal(detectMood('A little something for you', options), occasion.mood);
  }
});
test('emoji after a sentence stay with that sentence; comic reversals get separate poses', () => {
  const story = compileStory('Happy birthday! 🤩 Hope your day is amazing! 🎉');
  assert.deepEqual(story.scenes.map((scene) => scene.mood), ['excited', 'celebrate']);
  assert.equal(story.scenes[0].text, 'Happy birthday! 🤩');
  const angry = compileStory('I’m mad at you… but save me some cake!');
  assert.deepEqual(angry.scenes.map((scene) => scene.mood), ['mock-angry', 'playful']);
  assert.equal(angry.scenes.map((scene) => scene.text).join(' '), 'I’m mad at you… but save me some cake!');
});
test('export frame lookup agrees with scene boundaries and clamps at both ends', () => {
  const story = compileStory('Hello!\nMiss you! ❤️');
  assert.equal(sceneAtTime(story, -1).scene, story.scenes[0]);
  assert.equal(sceneAtTime(story, story.scenes[0].durationMs).scene, story.scenes[1]);
  assert.equal(sceneAtTime(story, 1e9).scene, story.scenes[1]);
  assert.equal(sceneAtTime(story, 1e9).elapsed, story.scenes[1].durationMs);
});
test('video formats use actual support; duration includes the selected speed', () => {
  assert.equal(chooseVideoFormat(() => false), null);
  assert.equal(chooseVideoFormat((mime) => mime.includes('mp4'))?.extension, 'mp4');
  assert.equal(chooseVideoFormat((mime) => mime.includes('webm'))?.extension, 'webm');
  assert.equal(chooseVideoFormat((mime) => mime === 'video/webm')?.mime, 'video/webm');
  assert.equal(videoDuration(90000, 1.5), 60000);
  assert.equal(videoDuration(60000, .75), 80000);
});
test('video text wrapping preserves words, long tokens, and compound emoji', () => {
  const context = { measureText: (text: string) => ({ width: [...text].length * 10 }) as TextMetrics };
  assert.deepEqual(wrapText(context, 'A little love note', 130), ['A little love', 'note']);
  const token = 'W'.repeat(180);
  const lines = wrapText(context, token, 100);
  assert.equal(lines.join(''), token);
  assert.ok(lines.every((line) => line.length <= 10));
  assert.deepEqual(wrapText(context, '👩🏽‍❤️‍👨🏽', 10), ['👩🏽‍❤️‍👨🏽']);
});

test('plain-text examples need no emoji or tags and automatically add expression emoji', () => {
  for (const occasion of OCCASIONS) {
    assert.equal(/[\p{Extended_Pictographic}]/u.test(occasion.example), false);
    assert.equal(/\[[a-z-]+\]/i.test(occasion.example), false);
    const story = compileStory(occasion.example, 'solo', { occasion: occasion.id, emotion: 'auto' });
    assert.ok(story.scenes.every((scene) => scene.emoji.length > 0));
  }
  assert.deepEqual(compileStory('I miss you. Friends again?').scenes.map((scene) => scene.mood), ['missing-you', 'hopeful']);
  assert.deepEqual(compileStory('I have a birthday present for you! Friends again?').scenes.map((scene) => scene.mood), ['gift', 'hopeful']);
  const directed = compileStory('I miss you. Friends again?', 'solo', { occasion: 'love', emotion: 'playful' });
  assert.ok(directed.scenes.every((scene) => scene.mood === 'playful'));
});

import { messageExample } from '../src/features/message/examples.ts';
import { containFrame } from '../src/features/avatar/framing.ts';
import { MOODS } from '../src/features/avatar/expressions.ts';
import { avatarSourceRect, avatarFrame, BUILTINS } from '../src/features/avatar/types.ts';

test('every occasion and selected feeling has valid, distinct solo and two-speaker examples', () => {
  const examples = new Set<string>();
  for (const occasion of OCCASIONS) for (const emotion of ['auto', ...EMOTIONS.map((item) => item.id)] as const) {
    const options = { occasion: occasion.id, emotion };
    for (const dialogue of [false, true]) {
      const text = messageExample(options, dialogue);
      assert.equal(/[\p{Extended_Pictographic}]/u.test(text), false);
      assert.equal(/\[[a-z-]+\]/i.test(text), false);
      const story = compileStory(text, dialogue ? 'dialogue' : 'solo', options);
      assert.equal(story.dialogue, dialogue);
      assert.ok(story.durationMs < MAX_VIDEO_DURATION_MS);
      if (dialogue) assert.deepEqual(story.speakers, ['Me', 'Friend']);
      if (emotion !== 'auto') assert.ok(story.scenes.every((scene) => scene.mood === EMOTIONS.find((item) => item.id === emotion)!.mood));
      examples.add(text);
    }
  }
  assert.equal(examples.size, OCCASIONS.length * (EMOTIONS.length + 1) * 2);
  assert.match(messageExample({ occasion: 'birthday', emotion: 'shy' }, true, ['Sam', 'Jo']), /^Sam:.*\nJo:/);
});

test('all built-in frames use valid measured crops and fit safely at thumbnail and video sizes', () => {
  for (const avatar of BUILTINS) for (const mood of MOODS) {
    const frame = avatarFrame(avatar, mood.id);
    const source = avatarSourceRect(frame, 1024, 1536);
    assert.ok(source.width > 0 && source.height > 0);
    assert.ok(source.x >= 0 && source.y >= 0 && source.x + source.width <= 1024 && source.y + source.height <= 1536);
    for (const size of [45, 70, 120, 199, 259, 306]) {
      const box = { x: 0, y: 0, width: size, height: size };
      const fitted = containFrame(source, box);
      assert.ok(fitted.x >= size * .039 && fitted.y >= size * .039);
      assert.ok(fitted.x + fitted.width <= size * .961 && fitted.y + fitted.height <= size * .961);
      assert.ok(Math.abs(fitted.width / fitted.height - source.width / source.height) < .0001);
    }
  }
});
