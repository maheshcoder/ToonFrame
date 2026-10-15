import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : { channel: 'chrome' }), headless: true });
const checks = [], errors = [], external = [];
const pass = (text) => { checks.push(text); console.log('PASS ' + text); };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
  await context.addInitScript(() => {
    window.__shares = []; window.__liveTracks = []; window.__urls = new Set(); window.__urlEvents = [];
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (value) => { const url = create(value); window.__urls.add(url); window.__urlEvents.push({ action: 'create', url, type: value.type }); return url; };
    URL.revokeObjectURL = (url) => { window.__urls.delete(url); window.__urlEvents.push({ action: 'revoke', url }); revoke(url); };
    const capture = HTMLCanvasElement.prototype.captureStream;
    HTMLCanvasElement.prototype.captureStream = function(...args) {
      const stream = capture.apply(this, args); window.__liveTracks.push(...stream.getTracks()); return stream;
    };
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (data) => {
      window.__shares.push({ name: data.files[0].name, type: data.files[0].type, size: data.files[0].size });
    } });
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (request) => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(baseURL).origin) external.push(request.url()); });
  await page.goto(baseURL + '/#/script');
  const input = page.getByRole('textbox', { name: 'Your message', exact: true });
  await input.fill('A message I want to keep.');
  await page.getByRole('button', { name: 'Birthday', exact: false }).first().click();
  assert.equal(await input.inputValue(), 'A message I want to keep.');
  await page.getByRole('button', { name: 'Shy', exact: true }).click();
  assert.equal(await page.locator('.script-cast [data-expression=blushing]').count(), 1);
  await page.getByRole('button', { name: 'Use birthday example' }).click();
  assert.match(await input.inputValue(), /Happy birthday/);
  assert.equal(await input.evaluate((el) => /[\p{Extended_Pictographic}]/u.test(el.value)), false);
  assert.ok(await page.getByRole('group', { name: 'Matched expressions' }).count());
  await page.getByRole('button', { name: 'Follow my message', exact: false }).click();
  for (const [width, name] of [[1440,'message-occasions-desktop'],[768,'message-occasions-tablet'],[320,'message-occasions-mobile']]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.activeElement?.blur());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: 'artifacts/' + name + '.png', fullPage: true });
  }
  await input.fill('I have a birthday present for you!\nFriends again?');
  await page.getByRole('button', { name: 'Animate my message' }).click();
  assert.equal(await page.getByLabel('Expression for scene 1', { exact: true }).inputValue(), 'gift');
  assert.equal(await page.getByLabel('Expression for scene 2', { exact: true }).inputValue(), 'hopeful');
  await page.getByLabel('Animation speed').selectOption('1.5');
  pass('Occasions preserve text, emotion selection previews a real face, templates and personal mood arcs work at 320/768/1440px');
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  await page.getByRole('button', { name: 'Cancel video' }).click();
  await page.getByRole('alert').filter({ hasText: 'cancelled' }).waitFor();
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  const video = page.getByLabel('Your finished message video');
  await video.waitFor({ timeout: 25000 });
  const metadata = await video.evaluate((el) => new Promise((resolve, reject) => {
    const ready = () => resolve({ width: el.videoWidth, height: el.videoHeight, duration: el.duration, muted: el.muted, audioTracks: el.audioTracks?.length ?? 0 });
    if (el.readyState >= 1) ready(); else { el.onloadedmetadata = ready; el.onerror = reject; }
  }));
  assert.equal(metadata.width, 720); assert.equal(metadata.height, 900);
  assert.ok(metadata.duration > 2 && metadata.duration < 8); assert.equal(metadata.audioTracks, 0); assert.equal(metadata.muted, true);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: /^Download (MP4|WebM)$/ }).click();
  const download = await downloadEvent;
  await download.saveAs('artifacts/message-sample.' + download.suggestedFilename().split('.').at(-1));
  await page.getByRole('button', { name: 'Share video', exact: true }).click();
  const shares = await page.evaluate(() => window.__shares);
  assert.ok(shares[0].size > 5000); assert.match(shares[0].type, /^video\/(mp4|webm)$/);
  await video.evaluate(async (el) => { el.currentTime = .5; await new Promise((resolve) => el.addEventListener('seeked', resolve, { once: true })); });
  await video.screenshot({ path: 'artifacts/message-video-frame.png' });
  await page.screenshot({ path: 'artifacts/message-video-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => window.__liveTracks.every((track) => track.readyState === 'ended' && track.kind === 'video')));
  await page.getByLabel('Expression for scene 1', { exact: true }).selectOption('shy');
  assert.equal(await video.count(), 0);
  await page.waitForFunction(() => window.__urls.size === 0, null, { timeout: 3000 }).catch(async (error) => { console.log(await page.evaluate(() => window.__urlEvents)); throw error; });
  pass('Real video encodes and decodes at 720×900 with no audio; cancel/retry, download, sharing handoff, and stale-file cleanup work');
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  await page.getByRole('button', { name: 'Edit message & cast' }).click();
  await page.waitForTimeout(250);
  assert.ok(await page.evaluate(() => window.__liveTracks.every((track) => track.readyState === 'ended' && track.kind === 'video')));
  await input.fill(Array(35).fill('Hello there.').join('\n'));
  await page.getByRole('button', { name: 'Animate my message' }).click();
  assert.equal(await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).isDisabled(), true);
  pass('Editing cancels in-flight recording; long messages show the 60-second limit');


  await page.getByRole('button', { name: 'Your character', exact: true }).click();
  await page.getByRole('button', { name: 'A character only you could be.', exact: false }).click();
  await page.getByRole('button', { name: '48 expressions', exact: false }).click();
  const sheet48 = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 912; canvas.height = 1368;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 912, 1368);
    for (let row = 0; row < 8; row++) for (let col = 0; col < 6; col++) {
      const x = (col + .5) * 152, y = (row + .38) * 171;
      ctx.fillStyle = ['#dea879', '#9bb888', '#cc977d'][col % 3]; ctx.beginPath(); ctx.arc(x,y,43,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#324939'; ctx.fillRect(x-40,y+48,80,50);
    }
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#sheet-file').setInputFiles({ name: 'Full-expression avatar.png', mimeType: 'image/png', buffer: Buffer.from(sheet48, 'base64') });
  await page.getByRole('button', { name: 'Choose Full-expression avatar', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Next: write your message' }).click();
  await page.getByRole('button', { name: /^Two characters/ }).click();
  await input.fill('Me: Sending kisses!\nFriend: Just kidding!');
  await page.getByLabel('Friend', { exact: true }).selectOption('female');
  await page.getByRole('button', { name: 'Animate my message' }).click();
  await page.getByLabel('Animation speed').selectOption('1.5');
  await page.getByRole('button', { name: /^Create (MP4|WebM) video$/ }).click();
  await video.waitFor({ timeout: 25000 });
  await page.getByRole('link', { name: /^Download (MP4|WebM)$/ }).waitFor();
  assert.equal(await page.locator('.stage-person.active .character-sprite').evaluate((el) => [el.dataset.columns, el.dataset.rows].join('x')), '6x8');
  const mixed = await video.evaluate(async (el) => {
    await el.play();
    await new Promise((resolve) => setTimeout(resolve, 150));
    el.pause();
    return { width: el.videoWidth, height: el.videoHeight, time: el.currentTime };
  });
  assert.equal(mixed.width, 720); assert.equal(mixed.height, 900); assert.ok(mixed.time > 0);
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('Dismissed', 'AbortError'); } }));
  await page.getByRole('button', { name: 'Share video', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Sharing cancelled' }).waitFor();
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new Error('Blocked'); } }));
  await page.getByRole('button', { name: 'Share video', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Download it and attach it' }).waitFor();
  await page.getByRole('button', { name: 'Your character', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Full-expression avatar', exact: true }).click();
  await page.waitForFunction(() => window.__urls.size === 0);
  pass('Uploaded/default cast encodes and plays; dismissed or blocked sharing preserves download; image and video URLs are released');

  const fallbackContext = await browser.newContext();
  await fallbackContext.addInitScript(() => {
    const supported = MediaRecorder.isTypeSupported.bind(MediaRecorder);
    MediaRecorder.isTypeSupported = (mime) => mime.startsWith('video/webm') && supported(mime);
  });
  const fallback = await fallbackContext.newPage();
  await fallback.goto(baseURL + '/#/script');
  await fallback.getByRole('textbox', { name: 'Your message' }).fill('Hey!');
  await fallback.getByRole('button', { name: 'Animate my message' }).click();
  await fallback.getByRole('button', { name: 'Create WebM video' }).click();
  const fallbackVideo = fallback.getByLabel('Your finished message video');
  await fallbackVideo.waitFor({ timeout: 20000 });
  await fallbackVideo.evaluate(async (el) => { await el.play(); el.pause(); });
  assert.equal(await fallbackVideo.evaluate((el) => el.videoWidth), 720);
  assert.match(await fallback.getByRole('link', { name: 'Download WebM' }).getAttribute('download'), /\.webm$/);
  await fallbackContext.close();
  pass('WebM-only capability path creates an actual playable WebM file with the correct extension');

  const unsupported = await browser.newContext();
  await unsupported.addInitScript(() => { Object.defineProperty(window, 'MediaRecorder', { value: undefined }); });
  const noVideo = await unsupported.newPage();
  await noVideo.goto(baseURL + '/#/script');
  await noVideo.getByRole('textbox', { name: 'Your message' }).fill('Miss you!');
  await noVideo.getByRole('button', { name: 'Animate my message' }).click();
  await noVideo.getByText('Video creation isn’t available in this browser.', { exact: false }).waitFor();
  assert.equal(await noVideo.getByRole('button', { name: 'Play animation' }).isEnabled(), true);
  await unsupported.close();
  pass('Unsupported recording browsers retain the working animation preview');
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  await writeFile('artifacts/message-report.json', JSON.stringify({ checks, metadata, shares, errors, external }, null, 2));
} finally { await browser.close(); }
