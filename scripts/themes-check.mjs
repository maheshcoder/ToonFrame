import { chooseOccasion } from './ui-helpers.mjs';
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { OCCASIONS } from '../src/features/message/occasions/index.ts';
import { themeDetails } from '../src/features/themes/index.ts';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : { channel: 'chrome' }), headless: true });
const errors = [], checks = [];
const pass = (message) => { checks.push(message); console.log('PASS ' + message); };
await mkdir('artifacts', { recursive: true });
async function pausedPreview(page) {
  const pause = page.getByRole('button', { name: 'Pause background preview', exact: true });
  if (await pause.count()) await pause.click();
  await page.mouse.move(0, 0);
}
async function framePixels(video, time) {
  return video.evaluate(async (element, requested) => {
    element.pause();
    if (Math.abs(element.currentTime - requested) > .01) {
      await new Promise((resolve) => { element.addEventListener('seeked', resolve, { once: true }); element.currentTime = requested; });
    }
    const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 900;
    const context = canvas.getContext('2d'); context.drawImage(element, 0, 0, 720, 900);
    return { edge: [...context.getImageData(0,140,52,610).data], color: [...context.getImageData(360,125,1,1).data] };
  }, time);
}
function changedPixels(a, b) {
  let changed = 0;
  for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i]-b[i]) + Math.abs(a[i+1]-b[i+1]) + Math.abs(a[i+2]-b[i+2]) > 20) changed++;
  return changed;
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/#/script');
  for (const occasion of OCCASIONS) {
    await chooseOccasion(page, occasion.id);
    const theme = themeDetails(occasion.theme);
    const background = page.locator('.theme-preview .theme-background');
    assert.equal(await background.getAttribute('data-theme'), theme.id);
    assert.equal(await background.getAttribute('data-atmosphere'), theme.atmosphere);
    assert.equal(await background.locator(':scope > rect').getAttribute('fill'), theme.background);
    assert.equal(await background.locator('[data-motif]').count(), theme.decorations.length);
    assert.ok(await background.locator('[data-particle]').count() >= 16);
  }
  pass('All 32 occasions select their own palette, decorations, and animated atmosphere');
  await chooseOccasion(page, 'birthday');
  await page.getByRole('button', { name: 'Shy', exact: true }).click();
  assert.equal(await page.locator('.theme-mini-character .character-sprite').getAttribute('data-expression'), 'blushing');
  await page.getByRole('button', { name: 'Follow my message', exact: false }).click();
  await pausedPreview(page);
  const particle = page.locator('.theme-preview [data-particle]').first();
  const frozen = await particle.getAttribute('transform');
  await page.waitForTimeout(200);
  assert.equal(await particle.getAttribute('transform'), frozen);
  const effect = page.getByRole('button', { name: 'Toss confetti', exact: true });
  await effect.focus(); await page.keyboard.press('Enter');
  assert.ok(await page.locator('[data-reaction]').count() > 0);
  await page.waitForTimeout(220);
  assert.notEqual(await particle.getAttribute('transform'), frozen);
  await page.getByRole('button', { name: 'Pause background preview', exact: true }).click();
  const visual = page.getByRole('button', { name: 'Try the Birthday balloons & cake background', exact: true });
  await visual.focus();
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  assert.notEqual(await visual.evaluate((element) => getComputedStyle(element).outlineStyle), 'none');
  await page.keyboard.press('Space');
  assert.ok(await page.locator('[data-reaction]').count() > 0);
  await pausedPreview(page);
  const staticPose = await particle.getAttribute('transform');
  await visual.hover({ position: { x: 8, y: 8 } });
  assert.notEqual(await particle.getAttribute('transform'), staticPose);
  await page.mouse.move(0, 0);
  assert.equal(await particle.getAttribute('transform'), staticPose);
  pass('Theme preview supports keyboard bursts, pointer depth, play, and exact pause');
  for (const id of ['birthday', 'invitation', 'love', 'diwali', 'good-night']) {
    await chooseOccasion(page, id);
    for (const width of [1440, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.theme-preview').screenshot({ path: 'artifacts/theme-card-' + id + '-' + width + '.png' });
    }
  }
  const touchPage = await browser.newPage({ hasTouch: true, viewport: { width: 375, height: 900 } });
  touchPage.on('pageerror', (error) => errors.push(error.message));
  await touchPage.goto(base + '/#/script');
  await chooseOccasion(touchPage, 'birthday');
  await touchPage.locator('.theme-swatch').tap();
  assert.ok(await touchPage.locator('[data-reaction]').count() > 0);
  await touchPage.close();
  pass('Occasion cards fit desktop, tablet, 375px and 320px screens; tap reactions work');
  for (const id of ['birthday', 'invitation']) {
    const theme = themeDetails(id);
    await chooseOccasion(page, id);
    await page.getByRole('textbox', { name: 'Your message', exact: true }).fill('A little hello.');
    await page.getByRole('button', { name: 'Animate my message' }).click();
    const stage = page.locator('.animation-stage');
    const stageParticle = stage.locator('[data-particle]').first();
    assert.equal(await stage.locator('.theme-background').getAttribute('data-theme'), theme.id);
    const initial = await stageParticle.getAttribute('transform');
    await page.getByRole('button', { name: 'Play animation', exact: true }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const paused = await stageParticle.getAttribute('transform');
    assert.notEqual(paused, initial);
    await page.waitForTimeout(200);
    assert.equal(await stageParticle.getAttribute('transform'), paused);
    await page.getByRole('button', { name: 'Stop animation', exact: true }).click();
    assert.equal(await stageParticle.getAttribute('transform'), initial);
    for (const width of [1440, 375, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await stage.screenshot({ path: 'artifacts/theme-' + id + '-' + width + '.png' });
    }
    await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
    const video = page.getByLabel('Your finished message video');
    try { await video.waitFor({ timeout: 20000 }); }
    catch (error) {
      await page.screenshot({ path: 'artifacts/theme-export-failure.png', fullPage: true });
      throw new Error('Theme video did not finish: ' + await page.locator('.video-export').innerText(), { cause: error });
    }
    await video.evaluate(async (element) => { await element.play(); element.pause(); });
    const first = await framePixels(video, .2), second = await framePixels(video, 1.3);
    const rgb = theme.background.slice(1).match(/../g).map((hex) => parseInt(hex, 16));
    rgb.forEach((value, index) => assert.ok(Math.abs(value - first.color[index]) < 10, id + ' video contains its theme palette'));
    const difference = changedPixels(first.edge, second.edge);
    assert.ok(difference > 100, id + ' background must move in the actual video, changed pixels: ' + difference);
    await page.getByRole('button', { name: 'Edit message & cast' }).click();
  }
  pass('Background animation follows play/pause/stop and remains animated in real encoded birthday and party video');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await chooseOccasion(page, 'birthday');
  const background = page.locator('.theme-preview .theme-background');
  assert.equal(await background.getAttribute('data-motion'), 'reduced');
  assert.equal(await page.getByRole('button', { name: 'Toss confetti', exact: true }).isDisabled(), true);
  const before = await background.locator('[data-particle]').first().getAttribute('transform');
  await page.waitForTimeout(250);
  assert.equal(await background.locator('[data-particle]').first().getAttribute('transform'), before);
  assert.equal(await background.locator('[data-reaction]').count(), 0);
  await page.getByRole('button', { name: 'Animate my message' }).click();
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  const video = page.getByLabel('Your finished message video');
  await video.waitFor({ timeout: 20000 });
  await video.evaluate(async (element) => { await element.play(); element.pause(); });
  const stillA = await framePixels(video, .2), stillB = await framePixels(video, 1.3);
  assert.ok(changedPixels(stillA.edge, stillB.edge) < 20, 'Reduced-motion exported background stays still');
  pass('Reduced motion freezes the interactive preview and the recorded background');
  assert.deepEqual(errors, []);
  await writeFile('artifacts/themes-report.json', JSON.stringify({ checks, errors }, null, 2));
} finally { await browser.close(); }