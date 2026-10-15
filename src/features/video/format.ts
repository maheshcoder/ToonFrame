export const MAX_VIDEO_DURATION_MS = 60_000;
export type VideoFormat = { mime: string; extension: 'mp4' | 'webm'; label: string };
const FORMATS: VideoFormat[] = [
  { mime: 'video/mp4;codecs=avc1.42001F', extension: 'mp4', label: 'MP4' },
  { mime: 'video/mp4', extension: 'mp4', label: 'MP4' },
  { mime: 'video/webm;codecs=vp9', extension: 'webm', label: 'WebM' },
  { mime: 'video/webm;codecs=vp8', extension: 'webm', label: 'WebM' },
  { mime: 'video/webm', extension: 'webm', label: 'WebM' },
];
export function chooseVideoFormat(supported: (mime: string) => boolean): VideoFormat | null {
  return FORMATS.find((format) => supported(format.mime)) ?? null;
}
export function browserVideoFormat(): VideoFormat | null {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement === 'undefined' || !HTMLCanvasElement.prototype.captureStream) return null;
  return chooseVideoFormat((mime) => MediaRecorder.isTypeSupported(mime));
}
export function videoDuration(duration: number, speed: number) {
  return duration / Math.max(.75, Math.min(1.5, speed));
}
