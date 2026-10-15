# Personal messages and video export — QA

Verified 13 October 2026 on Windows with Node 24.17.0 and installed Chrome.

## Completed checks

- `npm test`: **26 tests passed**.
- `npm run build`: strict TypeScript and Vite production build passed.
- `npm run dev`: latest expression integration ran on port 5174 (5173 was already occupied).
- `npm run preview`: documented production preview ran on port 4173.
- `npm run test:browser`: all three suites passed for the occasion/feeling examples and contained-avatar flow on development port 5174; the production build also passes. The earlier video implementation was verified on production port 4173.

## Unit coverage

- Blank, oversized, punctuation-only, and emoji-only input.
- Personal-message rules for birthdays, love/missing you, celebration, invitations, funny anger, apologies, reconciliation, and teasing.
- Tags, emoji, chosen emotion, keywords, and occasion fallback precedence.
- All eight occasion examples produce varied expression sequences under 60 seconds.
- Emoji after sentence punctuation stay with the correct sentence; a comic “but” reversal changes pose.
- Labelled dialogue, cast-slot stability, invalid third speaker, missing labels, long text, and scene limits.
- All 48 distinct frames per built-in; exact shared 12/24/48 prompt/upload geometry and older-format fallbacks.
- Upload size/type/geometry/decode checks; resource cleanup and concurrent upload races.
- Timeline advance, exact pause, seek, and completion.
- Video scene boundaries, format negotiation, speed-adjusted duration, and text wrapping including compound emoji.
- All 576 occasion × feeling × one/two-character example combinations compile; named conversations and selected moods are preserved.
- All 96 built-in frame crops keep at least 99% of the source cell and fit proportionately into thumbnail and video boxes.

## Browser coverage

- Three-screen navigation, keyboard selection/focus, and browser Back.
- Male/female/default/custom combinations, custom/custom dialogue, and the 48-expression gallery.
- Occasion changes preserve drafts; explicit examples replace text; mood choices show real avatar previews.
- Play, pause/resume, stop, next/previous, seek, speed, replay, and manual scene expressions.
- Copyable AI prompt, valid PNG/WebP uploads, invalid type/size/decode/geometry feedback, and released object URLs.
- A rendered-pixel check confirms transparent letterbox margins, with no neighboring atlas poses visible.
- Every gallery pose fits at 1440/768/375/320px; writing-banner characters stay inside their slots. Very long unbroken captions remain above the complete avatar.
- 1440px desktop, 768px tablet, 375px phone, and 320px narrow phone. No horizontal overflow. Long text remains above the character.
- Reduced-motion CSS disables character motion.
- Plain-word examples and live expression matching without required emoji/tags.
- 48-frame custom PNG upload, exact 6 × 8 geometry, mobile upload guidance, and custom/default video creation.
- Real **MP4 creation, download, decoding, and playback**. The sample decodes at 720 × 900 with no audio track. Its duration and size depend on the chosen message.
- Real WebM encoding/playback after limiting reported capabilities to supported WebM formats.
- Local recording with an uploaded character and a default character together.
- Capture streams contain only video tracks; all tracks end after completion/cancellation.
- Cancellation/retry, navigation during recording, 60-second limit, expression edits invalidating old files, and video URL cleanup.
- File-sharing handoff and cancellation/error recovery using a mocked native sharing API. No message was actually sent.
- Missing MediaRecorder capability retains the working preview and shows an explanation.
- No speech calls, user-content network requests, missing assets, or uncaught JavaScript errors.

## Artifacts

Ignored `artifacts/` contains:

- `browser-report.json` and `message-report.json`
- Character, writing, and animation screenshots for desktop and mobile
- `message-occasions-desktop.png`, `message-occasions-tablet.png`, `message-occasions-mobile.png`
- `message-video-mobile.png` and `message-video-frame.png`
- `message-sample.mp4`: an actual locally generated video, not a renamed image or WebM file

## Remaining verification

- Physical iOS Safari, Android Chrome, Firefox, and Edge.
- Actual OS share sheets and receiving chat apps; their codec/file acceptance varies.
- Screen-reader sessions, OS high contrast, and 200% text zoom.
- Complex non-English text and real AI-generated sheets with unusual pose spacing.
- Low-memory devices and hardware encoder failures.

The automated rules do not prove perfect interpretation of sarcasm. Geometry checks cannot prove uploaded face identity or correct expression order. Motion is frame-based 2D animation; there is no facial tracking or lip-sync.
