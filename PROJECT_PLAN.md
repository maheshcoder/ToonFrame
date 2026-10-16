# Avatar Message Studio — Project Plan

## Product direction

A fun way to send expressive personal messages to friends, partners, and family. Type a note, choose an occasion and emotion, and turn it into a short silent avatar video. Facial expressions are the center of the experience.

Primary situations:
- Excited birthday wishes.
- Loving, shy, and playful “I miss you” messages.
- Joyful celebrations and shared wins.
- Cheeky party invitations.
- Exaggerated funny anger and friendly teasing.
- Sad apologies followed by hopeful reconciliation.

Keep the warm, soft-green visual language and the reference-inspired cartoon male/female characters. The product has three separate screens, with no speech or audio.

## Implemented

### 1. Choose a character
- Male Arjun and female Meera, each with 48 generic expressions and a separate 12-pose birthday art pack.
- Mood sampler and full expression gallery.
- Copyable AI prompt and downloadable style references for a custom character.
- Precise 12/24/48-expression sheet layouts and pose order; 48 is the default, with a 6 × 8 grid and 1536 × 2304 target.
- Local PNG/JPEG/WebP uploads up to 10 MB, strict ratio/resolution/decoding, blank-cell and copied-pose checks, four-character library, and URL cleanup.

### 2. Make the message personal
- All 32 occasion presets in a swipeable horizontal row, with trackpad scrolling, arrow buttons, and keyboard navigation. Each has examples for every selected feeling in one- and two-character modes.
- Visible face previews for happy, loving, shy, surprised, mock angry, sad, excited, and playful.
- Plain-text messages and examples, automatic expression/emoji generation from words, a chosen main feeling, and live matched-feeling chips. No emoji or tags need to be typed.
- Actual selected characters above the text box.
- 5,000-character validation, scene count, estimated duration, and a notice for long videos.
- One-character messages or two labelled speakers; either speaker can choose a default or custom avatar.
- Occasion and feeling changes preserve text. Examples match both selections and preserve two-character mode; explicit buttons load or change example type.
- Local rules for love, apology, reconciliation, invitations, cake jokes, and playful reversals.

### 3. Preview and send
- Expressions, movement, readable text bubbles, and emoji. Measured source rectangles handle uneven sprite spacing, and shared contained framing keeps complete poses visible; caption measurements reserve enough stage space.
- 32 occasion-specific layered backgrounds: floating confetti/hearts/petals, party light beams, sunshine, stars, lanterns, snow, and Holi color. Interactive character/greeting cards support taps, keyboard effects, pointer depth, and finite play/pause demos. Ambient scenery follows the message timeline and is included in video; tap/pointer effects are preview-only. Reduced motion freezes all background animation.
- Play/pause/resume/stop/replay, seek, speed, and scene navigation. Scene expressions use a searchable emoji-style keyboard with actual character thumbnails and feeling names, All/Personal/Classic/Occasions filters, all 32 occasion categories, and 60 unique choices per built-in. Categories without dedicated sheets show related existing character poses; Birthday has its own 12-pose pack. Uploaded keyboards list only their actual frames. The picker pauses playback, uses the correct male/female/uploaded speaker, supports keyboard/Escape/focus return, and becomes a bottom sheet on phones.
- Reduced-motion behavior and background-tab pause.
- Real browser-local video recording, including default and uploaded characters.
- Portrait 720 × 900, up to 24 fps, silent, maximum 60 seconds.
- MP4 where supported; correctly labelled WebM fallback.
- Creation progress, cancel, unsupported/error states, in-page video review, and download.
- Native file sharing only on devices that report support, initiated by a user click.
- Recording and output cleanup after edits, errors, cancellation, and navigation.

- Birthday art is selected by sheet-level occasion metadata in both preview and export. Related mood aliases use matching birthday poses; missing sad/angry poses use the normal art. Custom-upload orders stay unchanged. Manual scene selection stores the exact sheet/frame, so a dedicated pose can be used with any theme and is preserved by video export. Changing the image invalidates old recordings even when the semantic mood is unchanged.

## Content extension structure

Implemented: separate classic/personal/custom expression packs, male/female atlas manifests, versioned upload formats, grouped occasion files, feeling-example profiles, and a theme registry. All 32 occasions now have individual pastel backgrounds and themed vector decorations, shared by preview and video. Optional local background images are supported. An atmosphere preset selects motion and effects per theme; shared deterministic frame coordinates keep SVG preview and canvas video aligned. Components and rendering do not need occasion-specific conditionals.

Future additions belong in the custom registry files, with images under public/avatars/male, public/avatars/female, or public/themes. Existing IDs and upload orders remain stable. The content validator checks grids, missing assets, approved PNG proportions, minimum 256 px per nominal cell, maximum 24 MP, duplicate files/normalized poses, overlapping crops, fallback cycles, palette values, and occasion/theme links before dev/build. New occasion sheets are 3 × 4, maximum 12 poses; extra drawings require another sheet, never denser grids. See docs/ADDING_CONTENT.md for complete examples.

## Architecture and constraints

Vite + React + TypeScript with React/React DOM as the only runtime dependencies. Separate modules own message presets, scene conversion, avatar frame mapping, timeline behavior, canvas rendering, format selection, and recording. Future rendering work must continue to support both default and uploaded characters.

All user data stays in browser memory until the user downloads or invokes device sharing. No accounts, backend, cloud storage, API keys, paid generation provider, database, or external font service. Reload clears the session.

Image generation remains a separate action in the user's chosen tool. The app accepts expression sheets; it cannot animate new facial expressions from one unprocessed photo.

## Known limits

- Local English keyword rules cannot reliably understand sarcasm or every language. Emoji, tags, and manual scene controls are authoritative alternatives.
- Two labelled speakers maximum.
- The user-added 4 × 6 sheets provide 24 additional drawings per character, including dedicated playful and hopeful poses. 48-expression custom sheets map all poses directly. Older 12/24-frame sheets retain their original layouts and reuse the closest pose for additional moods.
- 12/24-frame custom sheets reuse nearby poses for new moods; pixel checks reject blank/copy cells but cannot verify identity, expression meaning, or correct order.
- Frame animation and movement are not interpolated face tracking or lip-sync.
- Recording is performed in real time in a visible tab. Older browsers may not support it.
- MP4 codecs and file sharing vary by browser/device; WebM may not be accepted in all chat apps.
- Native device sharing and Safari/iOS/Android still need physical-device checks.
- No durable drafts, hosted share links, automatic sending, or universal video transcoding.

## Next improvements

1. Physical-device video/sharing verification and broader encoder fallback handling.
2. Editable scene duration, alternate card layouts, and gentle transitions.
3. Additional purpose-drawn gestures and expression packs, without changing identity.
4. Optional local project import/export so drafts survive a refresh.
5. Expanded multilingual expression rules.
6. Consider a dedicated MP4 pipeline only if universal compatibility becomes a requirement, while preserving both character sources.

Voice, audio, and lip-sync are not requirements for this silent personal-message product.
