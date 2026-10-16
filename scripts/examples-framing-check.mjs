import { chooseOccasion } from './ui-helpers.mjs';
import { MOODS } from '../src/features/avatar/catalog/index.ts';
import { OCCASIONS } from '../src/features/message/occasions/index.ts';
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], checks = [];
const pass = (message) => { checks.push(message); console.log('PASS ' + message); };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/#/script');
  const input = page.getByRole('textbox', { name: 'Your message', exact: true });
  assert.equal(await page.locator('[data-occasion]').count(), OCCASIONS.length);
  await input.fill('This draft stays mine.');
  await chooseOccasion(page, 'anniversary');
  await page.getByRole('button', { name: 'Shy', exact: true }).click();
  assert.equal(await input.inputValue(), 'This draft stays mine.');
  await page.locator('.example-preview summary').click();
  await page.getByRole('button', { name: 'Use anniversary example' }).click();
  assert.match(await input.inputValue(), /Happy anniversary/);
  assert.match(await input.inputValue(), /blushing/);
  await page.getByRole('button', { name: /^Two characters/ }).click();
  await page.getByRole('button', { name: 'Use anniversary example' }).click();
  assert.match(await input.inputValue(), /^Me:.*\nFriend:/);
  assert.equal(await page.getByRole('button', { name: /^Two characters/ }).getAttribute('aria-pressed'), 'true');
  await chooseOccasion(page, 'diwali');
  await page.getByRole('button', { name: 'Excited', exact: true }).click();
  await page.getByRole('button', { name: 'Use diwali example' }).click();
  assert.match(await input.inputValue(), /Happy Diwali/);
  assert.match(await input.inputValue(), /I can barely sit still/);
  const bannerFits = () => page.locator('.script-cast .character-sprite').evaluateAll((elements) => elements.every((element) => {
    const r = element.getBoundingClientRect(), banner = element.closest('.script-character-preview').getBoundingClientRect();
    return r.left >= banner.left && r.right <= banner.right && r.top >= banner.top && r.bottom <= banner.bottom;
  }));
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await bannerFits(), 'Banner characters must fit at ' + width);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: 'artifacts/examples-' + width + '.png', fullPage: true });
  }
  await page.getByRole('button', { name: 'Use one-character example' }).click();
  assert.ok(!/^Me:/.test(await input.inputValue()));
  assert.equal(await page.locator('.script-cast .character-sprite').count(), 1);
  pass('Occasion/feeling examples follow selections; the main example preserves two-character mode; banners fit at every size');

  await page.getByRole('button', { name: 'Your character', exact: true }).click();
  for (const avatar of ['Arjun', 'Meera']) {
    await page.getByRole('button', { name: 'Choose ' + avatar, exact: true }).click();
    const gallery = page.getByRole('button', { name: 'A face for every feeling', exact: false });
    if (await gallery.getAttribute('aria-expanded') !== 'true') await gallery.click();
    for (const width of [1440, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const fits = await page.locator('.expression-tile .character-sprite').evaluateAll((elements, expected) => elements.length === expected && elements.every((element) => {
        const box = element.getBoundingClientRect(), image = element.querySelector('svg').getBoundingClientRect(), cell = element.closest('.expression-tile').getBoundingClientRect();
        return image.left >= box.left && image.right <= box.right && image.top >= box.top && image.bottom <= box.bottom && box.left >= cell.left && box.right <= cell.right && box.top >= cell.top && box.bottom <= cell.bottom;
      }), MOODS.length);
      assert.ok(fits, avatar + ' gallery frames must fit at ' + width);
    }
    await page.locator('.expression-grid').screenshot({ path: 'artifacts/' + avatar.toLowerCase() + '-all-poses-mobile.png' });
  }
  pass('All 96 built-in poses fit their SVG slots and gallery cells at 320/375/768/1440px');

  // Rasterize one actual frame and check its transparent letterbox. Neighboring
  // atlas cells used to paint into this margin when only the viewport was clipped.
  const margins = await page.locator('.expression-tile [data-expression=neutral] .sprite-frame').evaluate(async (element) => {
    const clone = element.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', '128'); clone.setAttribute('height', '128');
    clone.style.width = '128px'; clone.style.height = '128px';
    const picture = clone.querySelector('image');
    const blob = await (await fetch(picture.getAttribute('href'))).blob();
    picture.setAttribute('href', await new Promise((resolve) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob);
    }));
    const image = new Image();
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
    try {
      image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, 128, 128);
      return { left: ctx.getImageData(1,64,1,1).data[3], right: ctx.getImageData(126,64,1,1).data[3], center: ctx.getImageData(64,64,1,1).data[3] };
    } finally { URL.revokeObjectURL(url); }
  });
  assert.equal(margins.left, 0); assert.equal(margins.right, 0); assert.ok(margins.center > 0);
  pass('Rendered letterbox pixels are transparent; neighboring atlas poses do not bleed into the preview');


  await page.getByRole('button', { name: 'Next: write your message' }).click();
  await input.fill('W'.repeat(180));
  await page.getByRole('button', { name: 'Animate my message' }).click();
  await page.waitForTimeout(400);
  const bubble = await page.locator('.story-bubble').boundingBox(), character = await page.locator('.stage-person.active .character-sprite').boundingBox();
  assert.ok(bubble.y + bubble.height + 15 <= character.y, 'Long captions need space above the character');
  await page.screenshot({ path: 'artifacts/long-caption-fit-320.png', fullPage: true });
  pass('Even a maximum-width unbroken caption leaves room for the complete character on a narrow phone');
  assert.deepEqual(errors, []);
  await writeFile('artifacts/examples-framing-report.json', JSON.stringify({ checks, errors }, null, 2));
} finally { await browser.close(); }
