import { useEffect, useRef, useState } from 'react';
import type { AvatarAsset } from '../features/avatar/types';
import type { Story } from '../features/story/compileStory';
import { browserVideoFormat, MAX_VIDEO_DURATION_MS, videoDuration } from '../features/video/format';
import { recordVideo } from '../features/video/recordVideo';
import { Icon } from './Icon';

export function VideoExport({ story, cast, speed, onStart }: { story: Story; cast: AvatarAsset[]; speed: number; onStart: () => void }) {
  const [format] = useState(browserVideoFormat);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; file: File; shareable: boolean } | null>(null);
  const [sharing, setSharing] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const outputUrl = useRef<string | null>(null);
  const alive = useRef(true);
  const duration = videoDuration(story.durationMs, speed);
  const tooLong = duration > MAX_VIDEO_DURATION_MS;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
      if (outputUrl.current) URL.revokeObjectURL(outputUrl.current);
    };
  }, []);
  async function createVideo() {
    if (busy) return;
    onStart(); setBusy(true); setError(''); setProgress(0);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const recorded = await recordVideo({ story, cast, speed, signal: abort.signal,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onProgress: (value) => { if (alive.current) setProgress(value); } });
      if (!alive.current || abort.signal.aborted) return;
      const url = URL.createObjectURL(recorded.blob);
      if (outputUrl.current) URL.revokeObjectURL(outputUrl.current);
      outputUrl.current = url;
      const file = new File([recorded.blob], story.occasion + '-message.' + recorded.extension, { type: recorded.blob.type.split(';')[0] });
      let shareable = false;
      try { shareable = Boolean(typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })); } catch { /* Download stays available. */ }
      setResult({ url, file, shareable });
    } catch (problem) {
      if (alive.current) setError(problem instanceof DOMException && problem.name === 'AbortError'
        ? 'Video creation cancelled. Your message is still here.'
        : problem instanceof Error ? problem.message : 'Could not create a video. Please try again.');
    } finally {
      if (alive.current) setBusy(false);
      if (controller.current === abort) controller.current = null;
    }
  }
  async function shareVideo() {
    if (!result || sharing) return;
    setSharing(true); setError('');
    try {
      // Called directly from this click, after the file exists, to retain user activation.
      await navigator.share({ files: [result.file], title: 'A little message for you' });
    } catch (problem) {
      setError(problem instanceof DOMException && problem.name === 'AbortError'
        ? 'Sharing cancelled. Your video is still ready to download.'
        : 'This device could not share the video. Download it and attach it in your chat app.');
    } finally { if (alive.current) setSharing(false); }
  }
  return <section className="video-export" aria-labelledby="video-heading">
    <div className="export-heading"><span className="export-icon" aria-hidden="true">💌</span><div><span className="eyebrow">MAKE THEIR DAY</span><h2 id="video-heading">A little feeling, ready to send.</h2></div></div>
    {!format ? <p role="status">Video creation isn’t available in this browser. You can still preview your message here. Try a current Chrome, Edge, or Safari browser to save a video.</p> : <>
      <p>Make a silent {format.label} video with your characters, expressions, text, and emoji. Download it and attach it in your favourite chat.</p>
      <p className="small-note">{Math.ceil(duration / 1000)} seconds at {speed}× · Portrait 720 × 900 · No audio</p>
      {format.extension === 'webm' && <p className="small-note">This browser offers WebM. Some messaging apps need MP4; try another browser if yours does.</p>}
      {tooLong && <p className="error-message">Videos can be up to 60 seconds. Shorten your message or increase the speed above.</p>}
      {busy ? <div className="export-progress">
        <p role="status">Making your video… Keep this tab visible.</p>
        <progress max={1} value={progress} aria-label="Video creation progress" />
        <div><span>{Math.round(progress * 100)}%</span><button type="button" className="text-button" onClick={() => controller.current?.abort()}>Cancel video</button></div>
      </div> : !result && <button type="button" className="button button-green" disabled={tooLong} onClick={createVideo}><Icon name="download" size={17} />Create {format.label} video</button>}
      {result && <div className="video-ready">
        <video src={result.url} controls muted playsInline preload="metadata" aria-label="Your finished message video" />
        <p role="status">Your video is ready. Watch it here, then send a little happiness.</p>
        <div className="video-actions"><a className="button button-green" href={result.url} download={result.file.name}><Icon name="download" size={17} />Download {result.file.name.endsWith('.mp4') ? 'MP4' : 'WebM'}</a>
          {result.shareable && <button className="button share-button" type="button" disabled={sharing} onClick={shareVideo}>{sharing ? 'Opening share…' : 'Share video'}</button>}</div>
        {!result.shareable && <p className="small-note">Direct sharing isn’t available here. Save the file, then attach it in your chat app.</p>}
      </div>}
    </>}
    {error && <p className="error-message" role="alert">{error}</p>}
    <p className="export-local"><Icon name="shield" size={14} />Created on your device. Nothing is uploaded.</p>
  </section>;
}
