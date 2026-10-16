# Avatar Message Studio

Turn personal messages into short, silent avatar videos for friends, partners, and family. Birthday wishes, “I miss you,” celebrations, cheeky invitations, funny anger, apologies, and friendly teasing are the core use cases.

The app keeps its warm, soft-green design and three separate screens:

1. **Your character** — choose Arjun or Meera, or upload your own expression sheet using the copyable AI prompt and style reference.
2. **Your message** — choose an occasion and feeling, type/paste your words, and optionally cast a second character.
3. **Your animation** — preview and adjust the expressions, then create a video to download or share.

No accounts, backend, databases, keys, cloud uploads, voice, or audio. React and React DOM are the only runtime dependencies.

## Add future content

Read [Adding expressions, avatar artwork, occasions, and backgrounds](docs/ADDING_CONTENT.md) for exact folders and copyable code.

- New moods: `src/features/avatar/catalog/custom.ts`.
- Male/female artwork and grid order: `src/features/avatar/sheets/male.ts` and `female.ts`; files in `public/avatars/male/` and `female/`.
- New backgrounds: `src/features/themes/packs/custom.ts`; optional image files in `public/themes/`.
- New occasions: `src/features/message/occasions/custom.ts`.
- Occasion asset folders: `public/themes/<occasion>/`, `public/avatars/male/<occasion>/`, and `public/avatars/female/<occasion>/`. Run `npm run folders:occasions` after registering more occasions.
- Validate changes: `npm run check:content` (also runs before dev/build).

New built-in occasion packs use **3 × 4 grids, at most 12 poses per image**, in **2:3 or 3:4** portrait format. Keep each nominal cell at least 256 × 256 pixels. Add `pack-02.png`, `pack-03.png`, etc. in the same occasion folder and register each sheet; never squeeze extra cells into an existing image. Existing 12/24/48 generic and custom layouts remain supported.

The current 48-expression catalog is split into classic, personal, and custom packs. Upload orders are versioned independently, so adding a new mood keeps existing 12/24/48-frame sheets compatible. All 32 occasions have individual themes; birthday uses balloons/cake, party invitations use a mirror ball/confetti, and other occasions have their own motifs. The preview and video share decoration paths, palettes, and deterministic background animation.

## Run locally

Requires Node.js **22.18+** and npm.

```powershell
cd D:\Personal\Projects\Avatar-play
npm ci
npm run dev
```

Open the Local URL Vite prints, normally **http://127.0.0.1:5173/**. Keep the terminal open; Ctrl+C stops the server. If a port is busy, Vite chooses another.

Production build and preview:

```powershell
npm run build
npm run preview
```

Preview normally uses **http://127.0.0.1:4173/**. The build is in `dist/`. Opening index.html directly is not supported. No environment file is needed.

## Write a plain-text message

Type ordinary sentences such as “I miss you” or “I’m mad at you… but save me some cake!” The app reads the words and automatically adds the expressions and emoji to the animation. You do not need to type emoji or mood instructions.

Choose a feeling for the whole message, or use **Follow my message** for changing expressions. Live feeling chips below the text box show the matches before you animate. All examples use plain text; you can adjust any scene on the next screen.

## Choose the occasion and expression

All 32 occasions appear in a horizontal swipeable row. Swipe on a phone, scroll sideways with a trackpad, or use the previous/next arrows. Arrow keys and Home/End browse focused cards; Enter or Space selects one. These cover everyday messages, birthdays and anniversaries, friendship, thank-you notes, encouragement, recovery, morning/night wishes, graduations/exams, welcomes/farewells/reunions, dates, engagements/weddings/new babies, family days, and Diwali, Holi, New Year, Christmas, Eid, and Raksha Bandhan.

Every occasion has examples for all eight selected feelings, plus automatic expression direction, in both one- and two-character modes. Open **Preview example** to see the current combination. **Use … example** preserves the selected character mode; **Try a conversation** explicitly loads a two-person example; **Use one-character example** switches back to solo. Existing two-person speaker names are kept.

Changing an occasion or feeling **keeps your words**. Only an explicit example button replaces the text.

Eight prominent emotion choices show the selected character's actual face: happy, loving, shy, surprised, mock angry, sad, excited, and playful. “Follow my message” uses local text rules to vary the expression from moment to moment. Both defaults have **48 regular expression frames plus 12 dedicated birthday poses: 60 unique images each** in the scene keyboard. The 24 new personal-message poses include playful, cheeky, kisses, birthday gifts, mock anger, apologies, and hopeful reconciliation. They appear first in the built-in gallery.

Emotion priority:

1. A recognized tag, such as `[angry]`, `[love]`, `[shy]`, `[playful]`, `[hopeful]`, or `[mock-angry]`.
2. The last recognized emoji in that moment.
3. Your selected main feeling, if automatic direction is turned off.
4. English keyword rules.
5. The occasion's default expression, or neutral/curious for an unmarked “just because” message.

New lines and sentences create readable moments. A “but…” reversal can create its own expression, so “I’m mad at you… but save me some cake!” becomes angry, then playful. Tags are removed from visible text; emoji remain. Text display time is an approximate reading duration, with no speech timing or lip-sync.

The 5,000-character limit and 60-scene limit allow longer previews; **video files are limited to 60 seconds at the selected speed**. Short personal notes work best.


Birthday messages also use the two supplied **12-pose birthday sheets**, including waving, confetti celebrations, gifts, blowing candles, gratitude, and kisses. Birthday automatically uses these in the writing preview, animation, and local video. In the scene keyboard they are listed once as separate choices under Occasions → Birthday, including **Make a wish**. They can also be selected manually with any background. Close feelings can resolve to the same automatic pose, but those aliases never create repeated keyboard tiles. Sad/angry feelings keep their regular drawings. Uploaded characters keep their own sheets.

## One person or two

Use Auto-detect, One character, or Two characters. For dialogue, label every line with one of two names:

```text
Me: You forgot my birthday?
Friend: What if I bring cake?
Me: Fine. The big one.
```

Each speaker independently chooses a default or uploaded character. Default/default, custom/default, default/custom, and custom/custom all work. Unlabelled prose does not infer arbitrary speakers. The cast is visible above the text box.

## Watch, adjust, and send

Avatar poses now render through a contained SVG frame with safe padding. Built-in sheets use measured frame rectangles where cell spacing is uneven, so complete hair, flowers, hands, and outfits stay visible without neighboring poses leaking into a frame. Images keep their proportions; small frame gutters remove dividers. The same frame crop and containment logic is used for video. The writing banner gives each character its own space, and the stage grows when a long caption needs more room.

The animation screen includes play, pause/resume at the same point, stop, replay, previous/next scene, seeking, playback speed, and an editable expression for every scene. Tap a scene's feeling to open a character-and-emoji keyboard: each unique pose has a character thumbnail, emoji, and name, with search and **All / Personal / Classic / Occasions** filters. All 32 occasion categories show related existing poses; a dedicated pack takes priority when provided. Only Birthday currently has dedicated occasion artwork. The keyboard never clones a frame to fill a category, and uploaded characters list only their actual 12/24/48 images. It uses that speaker's male, female, or uploaded character. Opening it pauses playback; picking a feeling updates the scene and closes the panel. Escape or Close cancels without editing. Keyboard arrows browse faces, and focus returns to the scene button. The picker opens as a bottom sheet on phones and a centered dialog on larger screens. The active character moves while the other listens. Reduced-motion settings disable movement; the preview pauses in a hidden tab.

**Create video** renders locally using canvas and MediaRecorder:

- Portrait **720 × 900**, up to 24 frames per second, no audio track.
- Both built-in and uploaded characters use the same scene timeline and frame lookup.
- Expressions, text, emoji, occasion background, and playback speed are included.
- Export uses a portrait composition; the responsive page preview adapts to your screen.
- Recording takes roughly the video duration. Keep the tab visible. Cancel is available, and hiding the tab stops recording with a retry message.
- MP4 is offered when the browser reports a supported encoder; otherwise WebM is offered with its actual file extension. The app does not rename WebM to MP4.
- Review the finished video in the page, download it, then attach it in a chat.
- **Share video** appears only when the device reports that it can share the generated file. It opens the device's sharing interface; the app does not choose a recipient or send automatically.
- Cancelled/blocked sharing keeps the download available.
- Editing an expression, changing speed/cast, or leaving the animation screen discards the old file and cancels any in-progress recording.
- Unsupported browsers keep the in-page preview, with a clear video capability message.

MP4 support and device file sharing vary. Some chat apps do not accept WebM. Cross-device codec compatibility is not guaranteed; actual Safari/iOS and Android device verification is still needed. Capability checks use [MediaRecorder.isTypeSupported](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static); file sharing follows the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

This is expressive 2D frame animation with small movements. It is not generative video, interpolated facial rigging, real face tracking, or lip-sync.

## Backgrounds with a little personality

Choose an occasion on the message screen to see its matching scene. The interactive card includes your selected character, a sample greeting, layered color, and animated decorations.

- Birthdays and wins: balloons, gifts, and drifting confetti.
- Love, anniversaries, and date invites: floating hearts and a rosy glow.
- Party invitations: a mirror ball, gentle moving light beams, and sparkle.
- Flowers, sunshine, moonlight, lanterns, snow, and Holi color provide distinct moods for the other occasions.
- Tap the scene or its named effect button for a small burst. Mouse/pen movement adds gentle background depth. These interactions are preview-only.
- Pause/preview controls are keyboard accessible. Each demonstration ends after six seconds; it also pauses when the tab is hidden.
- In the final message, the background follows play, pause, seeking, speed, and stop. Its ambient animation is included in the locally recorded video.
- System reduced-motion preferences keep the background still in both preview and video and disable the extra preview effects. Captions stay clear in front of the scenery.

To add more, choose an `atmosphere` alongside the palette and motifs in `src/features/themes/packs/custom.ts`. See [the background extension guide](docs/ADDING_CONTENT.md#choose-the-motion-and-atmosphere).

## Your own character

Upload a **generated expression sheet**, not an unprocessed single portrait:

1. Open **Create & upload your own** on the first screen.
2. Choose **48 expressions (recommended)** and copy the prompt. Older 12/24-expression formats remain available.
3. In your chosen AI image tool, attach your clear, centered, front-facing head-and-shoulders portrait and a downloaded style reference. Use even lighting and a simple background; avoid group photos, sunglasses, face obstructions, and strong filters.
4. Generate a 2:3 portrait sheet, ideally **1536 × 2304** for 48 expressions (**1024 × 1536** for 12/24), with equal cells and a plain white background. No labels, borders, or extra people.
5. Upload the result as PNG, JPG/JPEG, or WebP, up to **10 MB** (10 × 1024 × 1024 bytes), using the matching layout.

48 expressions use **6 columns × 8 rows**, with the exact pose order shown in the app and the copied prompt. All 48 moods map directly to their own frame.

The 48-expression order, left to right and top to bottom:

```text
Neutral     Happy       Angry       Sad         Surprised   Thinking
Love        Crying      Winking     Confused    Sleepy      Excited
Worried     Scared      Proud       Shy         Awkward     Annoyed
Grateful    Curious     Bored       Calm        Determined  Celebrating
Joyful      Laughing    Gift        Love-heart  Blushing    Flirty
Missing-you Kiss        Wave        Cheering    Playful     Inviting
Mock-angry  Pouting     Frustrated  Furious     Apologetic  Downcast
Heartfelt   Hopeful     Smug        Cheeky      Shocked     Giggling
```

Older 24-expression uploads use **4 columns × 6 rows**, left to right, top to bottom:

```text
Neutral      Happy       Angry       Sad
Surprised    Thinking    Love        Crying
Winking      Confused    Sleepy      Excited
Worried      Scared      Proud       Shy
Awkward      Annoyed     Grateful    Curious
Bored        Calm        Determined  Celebrating
```

12 expressions use the first twelve moods arranged in **3 columns × 4 rows**. New personal-message moods reuse the nearest available pose in both upload formats; their original pose order remains unchanged. Built-in style references have their own pose order; follow the prompt's order for custom sheets.

Validation checks type, extension, 10 MB size, decoding, a strict 2:3 ratio, maximum 24 megapixels, minimum 256 × 256 pixels per grid cell, blank cells, repeated normalized character pixels, and poses already uploaded in this session. Minimum sheet dimensions: **768 × 1152 (12)**, **1024 × 1536 (24)**, **1536 × 2304 (48)**. Rejected images release their object URLs. Pixel comparison catches copied poses but cannot reliably detect redrawn/recolored lookalikes or verify face identity, expression meaning, or cell order; check the expression gallery. Up to four custom characters can stay in the session. The app does not generate missing expressions from a single photograph.

The default art consists of reference-derived recreations and additional expression sheets, not the original attached JPGs. See [asset provenance and prompts](docs/ASSETS.md).

## Privacy and resources

Messages, uploaded images, and generated videos stay in browser memory. Refresh clears the session. No analytics, external fonts, speech API, persistence database, or request sends user content out.

Image generation in a separate AI tool is a user-directed step governed by that tool. Downloading saves a local file; device sharing is an explicit user action.

Upload URLs stay valid while the character remains in the library for either speaker, even when a default is selected. Removal, invalid image decoding, stale uploads, and unmount release URLs. Generated video URLs are released when their result is replaced or the export component unmounts. Capture tracks, animation frames, and abort listeners are stopped on completion, error, cancel, and navigation.

## Code organization

- `src/app/App.tsx`: session state, three hash routes, library, cast, occasion, and feeling.
- `src/pages/`: character, message, and animation screens.
- `src/components/MessageSettings.tsx`, `OccasionPicker.tsx`: occasion swipe row, navigation, and main feelings.
- `src/components/SceneExpressionPicker.tsx`: searchable character/emoji keyboard, dialog focus handling, and scene expression selection.
- `src/components/MessageExamples.tsx`, `src/features/message/examples.ts`: occasion/feeling examples for one or two characters.
- `src/features/avatar/framing.ts`: shared source cropping and contained proportions for preview/video.
- `src/components/VideoExport.tsx`: export progress, cancel, video review, download, and native share.
- `src/components/CharacterSprite.tsx`, `AnimationStage.tsx`: face frames and responsive animation preview.
- `src/components/UploadGuide.tsx`, `ExpressionGallery.tsx`: custom-character workflow.
- `src/features/message/occasions/`: grouped occasion definitions and custom additions; `occasions.ts` is the compatibility facade.
- `src/features/message/feelings.ts`, `exampleTones.ts`: main feelings and their example wording.
- `src/components/ThemePreviewCard.tsx`, `ThemeBackground.tsx`: interactive scene sample and SVG scenery.
- `src/features/themes/packs/`: occasion palettes, motifs, atmosphere choices, and optional images.
- `src/features/themes/atmospheres.ts`, `frame.ts`: effect profiles and pure animation coordinates shared by preview/video.
- `src/features/themes/useThemePreview.ts`: finite preview playback, bursts, and visibility cleanup.
- `src/features/themes/drawBackground.ts`: canvas rendering of the same animated theme.
- `src/features/content/validateContent.ts`: registry validation.
- `src/features/avatar/catalog/`: classic/personal/custom mood packs and recognition rules.
- `src/features/avatar/sheets/`: separate male/female image manifests and frame orders.
- `src/features/avatar/expressionChoices.ts`, `occasionExpressions.ts`: unique physical pose choices and related-pose filters for every occasion. Selected sheet/frame references persist into preview and video.
- `src/features/avatar/sheetPolicy.ts`, `imageFingerprint.ts`: fixed format/quality limits and shared copied-pose comparison.
- `src/features/avatar/uploadFormats.ts`: permanent upload layouts and nearest-pose fallbacks.
- `src/features/avatar/`: resource ownership, contained framing, and generation prompt.
- `src/features/story/`: local scene conversion and playback timeline.
- `src/features/video/`: format negotiation, canvas drawing, text wrapping, and local recording.
- `src/styles/studio.css`: warm responsive design, keyboard focus, and reduced motion. `themes.css` owns the theme sample and scenery styles; `pickers.css` owns the occasion carousel and scene expression keyboard.
- `public/avatars/`: eight packaged sheets, including the male/female birthday packs in their occasion folders.
- `tests/`, `scripts/`: unit and Chrome browser verification.

Hash routes remain `#/avatar`, `#/script`, and `#/animation`. Browser Back/Forward works. Opening the animation route without a message redirects to the writing screen.

## Checks

```powershell
npm run check:content
npm test
npm run build
```

With the app running in another terminal:

```powershell
npm run test:browser
```

This runs all six browser suites using installed Chrome and playwright-core, with no downloaded browser binary. Screenshots, JSON reports, and a real sample video go into ignored `artifacts/`.

For another local preview URL or installed browser:

```powershell
$env:PREVIEW_URL = 'http://127.0.0.1:4173'
$env:BROWSER_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:browser
```

See [verification evidence](docs/QA.md) and [project plan](PROJECT_PLAN.md).
