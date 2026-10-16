import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { BIRTHDAY_ORDER } from '../src/features/avatar/sheets/birthday.ts';
import { BUILTINS, avatarFrame, avatarSourceRect, avatarSheetAspectRatio } from '../src/features/avatar/types.ts';
import { chooseOccasion, chooseExpression } from './ui-helpers.mjs';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : { channel: 'chrome' }), headless: true });
const checks = [], errors = [], missing = [];
const pass = (message) => { checks.push(message); console.log('PASS ' + message); };
await mkdir('artifacts', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    window.__avatarDraws = [];
    const drawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(...args) {
      if (this.canvas.width === 720 && this.canvas.height === 900 && args[0] instanceof HTMLImageElement && args[0].src.includes('/avatars/')) {
        window.__avatarDraws.push({ src: decodeURIComponent(new URL(args[0].src).pathname), source: args.slice(1,5) });
      }
      return drawImage.apply(this,args);
    };
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) missing.push(response.url()); });
  await page.goto(base + '/#/avatar');
  await page.getByRole('button', { name: 'Choose Meera', exact: true }).click();
  await page.getByRole('button', { name: 'A face for every feeling', exact: false }).click();
  const joyful = page.locator('.expression-tile [data-expression="joyful"] .sprite-frame');
  const viewBox = (await joyful.getAttribute('viewBox')).split(' ').map(Number);
  assert.ok((viewBox[0] + viewBox[2]) * 1536 > 270, 'The rendered female crop includes her missing right edge');
  await page.locator('.expression-grid').screenshot({ path: 'artifacts/female-framing-after.png' });
  for (const width of [1440,768,375,320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await page.locator('.expression-tile .character-sprite').evaluateAll((sprites) => sprites.every((sprite) => {
      const outer = sprite.getBoundingClientRect(), svg = sprite.querySelector('svg').getBoundingClientRect();
      return svg.x >= outer.x - .5 && svg.right <= outer.right + .5 && svg.y >= outer.y - .5 && svg.bottom <= outer.bottom + .5;
    })));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  pass('Female gallery uses measured source boundaries and every pose fits at desktop/tablet/phone widths');
  await page.getByRole('button', { name: 'Next: write your message' }).click();
  await chooseOccasion(page, 'birthday');
  assert.ok((await page.locator('.theme-mini-character image').getAttribute('href')).includes('/female/birthday/'));
  assert.ok((await page.locator('.script-cast image').first().getAttribute('href')).includes('/female/birthday/'));
  await page.getByRole('button', { name: /^Two characters/ }).click();
  await page.locator('#cast-0').selectOption('male'); await page.locator('#cast-1').selectOption('female');
  await page.getByRole('textbox', { name: 'Your message', exact: true }).fill('Me: A gift for you!\nFriend: Thank you!');
  await page.getByRole('button', { name: 'Animate my message' }).click();
  for (const [slot, avatar] of BUILTINS.entries()) {
    for (const mood of BIRTHDAY_ORDER) {
      await chooseExpression(page, slot + 1, mood, 'birthday');
      const sprite = page.locator('.stage-person.active .character-sprite');
      const frame = avatarFrame(avatar, mood, 'birthday');
      assert.equal(await sprite.getAttribute('data-avatar'), avatar.id);
      assert.equal(await sprite.locator('image').getAttribute('href'), frame.url);
      assert.equal(Number(await sprite.getAttribute('data-frame')), frame.frame);
      const expected = avatarSourceRect(frame, avatarSheetAspectRatio(frame.url), 1);
      const actual = (await sprite.locator('svg').getAttribute('viewBox')).split(' ').map(Number);
      [expected.x,expected.y,expected.width,expected.height].forEach((value,index) => assert.ok(Math.abs(value-actual[index])<.000001));
    }
  }
  pass('All twelve male and twelve female birthday drawings are available from the expression keyboard and use the correct source crop');
  await chooseExpression(page, 2, 'cheering', 'birthday');
  for (const width of [1440,768,375,320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(80);
    const stage = await page.locator('.animation-stage').boundingBox(), bubble = await page.locator('.story-bubble').boundingBox();
    for (const sprite of await page.locator('.stage-person .character-sprite').all()) {
      const bounds = await sprite.boundingBox();
      assert.ok(bounds.x >= stage.x && bounds.x+bounds.width <= stage.x+stage.width+.5);
      assert.ok(bounds.y >= bubble.y+bubble.height+15 && bounds.y+bounds.height <= stage.y+stage.height);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('.animation-stage').screenshot({ path: 'artifacts/birthday-female-fit-' + width + '.png' });
  }
  await page.getByRole('button', { name: 'Expression for scene 2', exact: true }).click();
  await page.getByRole('dialog').screenshot({ path: 'artifacts/birthday-expression-keyboard-320.png' });
  await page.keyboard.press('Escape');
  pass('Birthday poses and captions remain separate, fully contained, and proportionate on narrow phones and desktop');
  await chooseExpression(page, 1, 'gift', 'birthday'); await chooseExpression(page, 2, 'hopeful', 'birthday');
  await page.getByLabel('Animation speed').selectOption('1.5');
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  const video = page.getByLabel('Your finished message video');
  try { await video.waitFor({ timeout: 25000 }); }
  catch (error) { throw new Error(await page.locator('.video-export').innerText(), { cause: error }); }
  const draws = await page.evaluate(() => window.__avatarDraws);
  for (const avatar of BUILTINS) {
    const frame = avatarFrame(avatar, 'heartfelt', 'birthday');
    assert.ok(draws.some((draw) => draw.src === frame.url), 'Video must draw the new ' + avatar.id + ' birthday sheet');
    const relevant = draws.filter((draw) => draw.src === frame.url);
    assert.ok(relevant.every((draw) => draw.source.every(Number.isFinite)));
  }
  const decoded = await video.evaluate(async (element) => { await element.play(); element.pause(); return { width: element.videoWidth, height: element.videoHeight }; });
  assert.deepEqual(decoded, { width: 720, height: 900 });
  await chooseExpression(page, 2, 'hopeful');
  assert.equal(await video.count(),0,'Selecting a different image with the same mood must invalidate the video');
  assert.ok(!(await page.locator('.stage-person.active image').getAttribute('href')).includes('/birthday/'));
  await page.getByRole('button', { name: 'Edit message & cast' }).click();
  await chooseOccasion(page, 'love');
  assert.ok(!(await page.locator('.script-cast image').first().getAttribute('href')).includes('/birthday/'));
  await page.getByRole('button', { name: 'Animate my message' }).click();
  await chooseExpression(page, 1, 'gift', 'birthday');
  await chooseExpression(page, 2, 'hopeful', 'birthday');
  assert.equal(await page.locator('.animation-stage .theme-background').getAttribute('data-theme'),'love');
  assert.ok((await page.locator('.stage-person.active image').getAttribute('href')).includes('/female/birthday/'));
  await page.evaluate(() => { window.__avatarDraws.length = 0; });
  await page.getByLabel('Animation speed').selectOption('1.5');
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  await video.waitFor({timeout:25000});
  const crossOccasionDraws = await page.evaluate(() => window.__avatarDraws);
  for (const avatar of BUILTINS) assert.ok(crossOccasionDraws.some((draw) => draw.src.includes('/' + avatar.id + '/birthday/')),'Manually selected occasion poses must load and render with another background');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  pass('Actual videos preserve both exact selected birthday poses with Birthday and Love backgrounds; image changes invalidate old video even when the mood is unchanged');
  await writeFile('artifacts/birthday-artwork-report.json', JSON.stringify({ checks, errors, missing }, null, 2));
} finally { await browser.close(); }