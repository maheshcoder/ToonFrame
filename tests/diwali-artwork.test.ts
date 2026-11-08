import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILTINS, avatarExpressionDetails, avatarFrame } from '../src/features/avatar/types.ts';
import { expressionChoices } from '../src/features/avatar/expressionChoices.ts';
import { DIWALI_ORDER, DIWALI_POSES } from '../src/features/avatar/sheets/diwali.ts';

test('each supplied Diwali sheet exposes its twelve labelled poses and drives the Diwali default', () => {
  for (const avatar of BUILTINS) {
    for (const [index, mood] of DIWALI_ORDER.entries()) {
      const frame = avatarFrame(avatar, mood, 'diwali');
      assert.ok(frame.url.includes('/' + avatar.id + '/diwali/'));
      assert.equal(frame.frame, index);
      assert.equal(avatarExpressionDetails(avatar, mood, 'diwali').label, DIWALI_POSES[index].label);
    }
    assert.equal(avatarFrame(avatar, 'joyful', 'diwali').frame, 1);
    assert.ok(!avatarFrame(avatar, 'sad', 'diwali').url.includes('/diwali/'));
    const choices = expressionChoices(avatar).filter((choice) => choice.occasion === 'diwali');
    assert.equal(choices.length, 12);
    assert.equal(new Set(choices.map((choice) => choice.id)).size, 12);
    assert.deepEqual(choices.map((choice) => choice.label), DIWALI_POSES.map((pose) => pose.label));
  }
});
