import { occasionDetails } from '../message/occasions';
import { themeDetails } from '../themes/index';
import type { AvatarAsset } from '../avatar/types';
import type { Story } from '../story/compileStory';
import { browserVideoFormat, MAX_VIDEO_DURATION_MS, videoDuration } from './format';
import { drawMessageFrame, loadCastImages, VIDEO_HEIGHT, VIDEO_WIDTH } from './renderFrame';

export type RecordedVideo = { blob: Blob; extension: 'mp4' | 'webm'; durationMs: number };
export async function recordVideo({ story, cast, speed, reducedMotion, signal, onProgress }: {
  story: Story; cast: AvatarAsset[]; speed: number; reducedMotion: boolean; signal: AbortSignal; onProgress: (progress: number) => void;
}): Promise<RecordedVideo> {
  const format = browserVideoFormat();
  if (!format) throw new Error('This browser cannot create a video. Try a current Chrome, Edge, or Safari browser.');
  const durationMs = videoDuration(story.durationMs, speed);
  if (durationMs > MAX_VIDEO_DURATION_MS) throw new Error('Keep the video under 60 seconds. Shorten your message or increase the playback speed.');
  const theme = themeDetails(occasionDetails(story.occasion).theme);
  const images = await loadCastImages(cast, signal, theme.image ? [theme.image] : [], story.occasion, story.scenes);
  signal.throwIfAborted();
  if (document.hidden) throw new Error('Keep this tab visible while making the video. Try again when you are ready.');
  const canvas = document.createElement('canvas');
  canvas.width = VIDEO_WIDTH; canvas.height = VIDEO_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not open the video canvas.');
  drawMessageFrame(context, story, cast, images, 0, reducedMotion);
  const stream = canvas.captureStream(24);
  try {
    const recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 3_000_000 });
    return await new Promise<RecordedVideo>((resolve, reject) => {
      const chunks: Blob[] = [];
      let frame = 0, deadline = 0, settled = false;
      let failure: Error | null = null;
      const clean = () => {
        cancelAnimationFrame(frame); clearTimeout(deadline);
        signal.removeEventListener('abort', abort);
        document.removeEventListener('visibilitychange', visibility);
      };
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true; clean();
        if (error) reject(error);
        else {
          const mime = recorder.mimeType || format.mime;
          const blob = new Blob(chunks, { type: mime });
          if (!blob.size) reject(new Error('The browser made an empty video. Please try again.'));
          else resolve({ blob, extension: mime.includes('mp4') ? 'mp4' : 'webm', durationMs });
        }
      };
      const stop = (error?: Error) => {
        if (settled) return;
        if (error) failure = error;
        cancelAnimationFrame(frame);
        if (recorder.state !== 'inactive') recorder.stop();
        else finish(failure ?? undefined);
      };
      const abort = () => stop(new DOMException('Cancelled', 'AbortError'));
      const visibility = () => { if (document.hidden) stop(new Error('Video creation stopped when the tab was hidden. Keep this tab visible and try again.')); };
      signal.addEventListener('abort', abort, { once: true });
      document.addEventListener('visibilitychange', visibility);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => stop(new Error('Your browser could not encode this video. Try again, or use another browser.'));
      recorder.onstop = () => finish(failure ?? undefined);
      deadline = window.setTimeout(() => { stop(new Error('Video creation took too long. Please try again.')); finish(failure ?? undefined); }, durationMs + 15000);
      try {
        recorder.start(250);
        const start = performance.now();
        const tick = (now: number) => {
          if (settled || failure) return;
          const elapsed = Math.min(now - start, durationMs);
          try { drawMessageFrame(context, story, cast, images, Math.min(elapsed * speed, story.durationMs - 1), reducedMotion); }
          catch { stop(new Error('Could not draw a video frame. Re-upload the character and try again.')); return; }
          onProgress(elapsed / durationMs);
          if (elapsed >= durationMs) stop(); else frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      } catch (error) { finish(error instanceof Error ? error : new Error('Could not start video recording.')); }
    });
  } finally {
    stream.getTracks().forEach((track) => track.stop());
    canvas.width = canvas.height = 0;
    images.clear();
  }
}
