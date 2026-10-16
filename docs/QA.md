# Personal messages and video export — QA

Verified 16 October 2026 on Windows with Node 24.17.0 and installed Chrome.

## Completed checks

- `npm test`: **51 tests passed**.
- `npm run check:content`: all registries and local assets validate; checks run automatically before dev/build.
- `npm run build`: strict TypeScript and Vite production build passed.
- `npm run dev`: animated theme update ran on port 5174 (5173 was already occupied).
- `npm run preview`: documented production preview ran on port 4173.
- `npm run test:browser`: all six suites passed on development port 5174 (uploads/messages/examples first; themes, pickers, and birthday exports rerun after the final keyboard update), covering uploads, playback, examples/framing, themes/video, the occasion/expression pickers, and both new birthday packs. The production build passes; the earlier video implementation was also checked on production port 4173.

## Content extension checks

- A new expression definition can be added without changing existing 12/24/48 upload orders.
- Duplicate IDs, missing references, fallback cycles, malformed grids, and invalid theme URLs are rejected.
- Every occasion has an individual background; birthday and party use distinct decorations/palettes.
- Optional theme images use a centered cover crop and configured opacity.
- All 32 themes select the correct atmosphere. Birthday, party, love, Diwali, and night cards were visually checked at 1440/768/375/320px.
- Real keyboard activation, visible focus, touchscreen taps, pointer depth, and pause/replay work. Preview bursts appear and clear without affecting the message.
- Theme motion uses the message clock: play/pause/stop freeze and reset the background correctly.
- Actual recorded birthday/party frames have changing background pixels, with the selected palette preserved. A reduced-motion recording has a still background.
- Unit checks cover deterministic seeking, all 11 atmosphere presets, safe edge particles, bounded pointer offsets, burst expiry, reduced motion, and invalid atmosphere IDs.
- Extension instructions: docs/ADDING_CONTENT.md.

## Occasion carousel and expression keyboard

- All 32 occasion cards are available in one horizontal row, with no occasion dropdown. Selection preserves the draft and updates the matching theme.
- Real Chrome touch events verify swiping and tapping. Trackpad scrolling, previous/next buttons, arrow keys, Home/End, Enter, and visible focus work.
- Occasion cards and expression panels fit 1440/768/375/320px without horizontal page overflow.
- Scene expressions use a scrollable grid of 60 unique built-in character poses, emoji, and labels, with search and category filters. No scene-expression dropdown remains.
- The picker uses the correct speaker's male, female, or uploaded character, pauses the timeline, and applies the chosen expression/emoji to that scene.
- Keyboard grid arrows, Tab boundaries, Escape, Close, focus return, empty-search feedback, and restored body scrolling are covered.
- Desktop centered dialogs and phone bottom sheets were visually reviewed.
- Screenshots: `occasion-swipe-{width}.png` and `expression-keyboard-{width}.png`; results: `pickers-report.json`.

## Female framing and birthday artwork

- Uneven female row/column boundaries are measured instead of assuming an equal grid. The missing right edge, last-row hair, and stray next-row heads have regression checks.
- All 48 generic female poses were reviewed together after the fix; the gallery fits at 320/375/768/1440px.
- All 12 drawings from each supplied birthday sheet resolve in the expression keyboard and stage with the correct crop and aspect ratio.
- Birthday previews, cast/banner thumbnails, scene cards, and exported video use occasion-specific artwork. Other occasions automatically use normal artwork; manual birthday choices are retained with any theme. Uploaded sheets remain unchanged.
- A real 720 × 900 video was encoded and decoded. Canvas draw inspection confirms that both new birthday source images were used during recording.
- Captions stay above complete birthday characters at all four widths. The female raised-arm pose and birthday expression keyboard were visually reviewed at 320px.
- Invalid source rectangles, mood aliases, and occasion links are rejected by content checks.
- Evidence: `female-framing-before.png`, `female-framing-after.png`, `birthday-female-fit-{width}.png`, `birthday-expression-keyboard-320.png`, and `birthday-artwork-report.json`.

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
- Generic and birthday frame rectangles stay within their source images, agree between SVG/canvas, and fit thumbnail/video boxes without stretching. Known female boundary regressions have explicit pixel-coordinate checks.

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

- `browser-report.json`, `message-report.json`, and `themes-report.json`
- Character, writing, and animation screenshots for desktop and mobile
- `theme-card-{occasion}-{width}.png` for five occasions at four widths, plus birthday/party stage screenshots
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

## Sheet quality and occasion expression update

- Shared limits: fixed 2:3 uploads, minimum 256 × 256 pixels per nominal cell, max 24 MP / 10 MB. 12/24/48 upload orders remain unchanged.
- New built-in occasion packs: 3 × 4, at most 12 poses, 2:3 or 3:4. Larger packs need separate registered image files.
- All eight existing PNGs pass resolution, ratio, non-overlapping crop, blank-cell, duplicate-file SHA-256, and normalized-pose checks. There are 120 physical character poses, 60 per built-in.
- Browser uploads reject wrong ratios, low resolution, blank cells, copied cells, and poses already uploaded; valid PNG/WebP custom/custom casting and cleanup still pass.
- All/Personal/Classic/Occasions categories have unique sheet/frame identifiers. All 32 occasions provide related character expressions, with dedicated Birthday artwork taking priority. No assets were copied or generated to fill categories.
- Upload keyboards enumerate only the actual 12/24/48 images, avoiding repeated fallback poses.
- Explicit sheet/frame selection survives preview and real encoded video with another background (birthday poses with Love theme, for both speakers). Changing a pose invalidates stale video even when the mood ID stays the same.
- Unit regressions cover these limits, selected-art ownership, cancellation during pixel analysis, duplicate rejection and URL cleanup, PNG decode bounds, and per-occasion choices.
- One full-suite attempt produced an empty video in the theme suite while source files were still being updated. The theme suite and subsequent picker/birthday suites passed on rerun after code changes stopped. Encoding errors remain visible and retryable.
- Pixel comparison detects copied normalized character content, not every redrawn/recolored lookalike. Identity, emotional meaning, correct pose order, and real device performance still need human review.
Occasion keyboard screenshots at 320/375/768/1440px are saved as occasion-expression-keyboard-{width}.png. Automated checks ensure the extra category row leaves usable grid space. The 320px Birthday picker and two-character stage were visually reviewed: heads, hair, hands, and captions remain visible.
