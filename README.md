# Avatar Message Studio

Turn personal messages into short, silent avatar videos for friends, partners, and family. Birthday wishes, “I miss you,” celebrations, cheeky invitations, funny anger, apologies, and friendly teasing are the core use cases.

The app keeps its warm, soft-green design and three separate screens:

1. **Your character** — choose Arjun or Meera, or upload your own expression sheet using the copyable AI prompt and style reference.
2. **Your message** — choose an occasion and feeling, type/paste your words, and optionally cast a second character.
3. **Your animation** — preview and adjust the expressions, then create a video to download or share.

No accounts, backend, databases, keys, cloud uploads, voice, or audio. React and React DOM are the only runtime dependencies.

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

32 occasions are available through the eight quick choices and **More occasions**. These cover everyday messages, birthdays and anniversaries, friendship, thank-you notes, encouragement, recovery, morning/night wishes, graduations/exams, welcomes/farewells/reunions, dates, engagements/weddings/new babies, family days, and Diwali, Holi, New Year, Christmas, Eid, and Raksha Bandhan.

Every occasion has examples for all eight selected feelings, plus automatic expression direction, in both one- and two-character modes. Open **Preview example** to see the current combination. **Use … example** preserves the selected character mode; **Try a conversation** explicitly loads a two-person example; **Use one-character example** switches back to solo. Existing two-person speaker names are kept.

Changing an occasion or feeling **keeps your words**. Only an explicit example button replaces the text.

Eight prominent emotion choices show the selected character's actual face: happy, loving, shy, surprised, mock angry, sad, excited, and playful. “Follow my message” uses local text rules to vary the expression from moment to moment. Both defaults have **48 distinct expression frames**; all 48 are available in the scene editor. The 24 new personal-message poses include playful, cheeky, kisses, birthday gifts, mock anger, apologies, and hopeful reconciliation. They appear first in the built-in gallery.

Emotion priority:

1. A recognized tag, such as `[angry]`, `[love]`, `[shy]`, `[playful]`, `[hopeful]`, or `[mock-angry]`.
2. The last recognized emoji in that moment.
3. Your selected main feeling, if automatic direction is turned off.
4. English keyword rules.
5. The occasion's default expression, or neutral/curious for an unmarked “just because” message.

New lines and sentences create readable moments. A “but…” reversal can create its own expression, so “I’m mad at you… but save me some cake!” becomes angry, then playful. Tags are removed from visible text; emoji remain. Text display time is an approximate reading duration, with no speech timing or lip-sync.

The 5,000-character limit and 60-scene limit allow longer previews; **video files are limited to 60 seconds at the selected speed**. Short personal notes work best.

## One person or two

Use Auto-detect, One character, or Two characters. For dialogue, label every line with one of two names:

```text
Me: You forgot my birthday?
Friend: What if I bring cake?
Me: Fine. The big one.
```

Each speaker independently chooses a default or uploaded character. Default/default, custom/default, default/custom, and custom/custom all work. Unlabelled prose does not infer arbitrary speakers. The cast is visible above the text box.

## Watch, adjust, and send

Avatar poses now render through a contained SVG frame with safe padding. Only the thin atlas boundary is trimmed; images keep their proportions and no longer lose the bottom 4%. The same frame crop and containment logic is used for video. The writing banner gives each character its own space, and the stage grows when a long caption needs more room.

The animation screen includes play, pause/resume at the same point, stop, replay, previous/next scene, seeking, playback speed, and an editable expression for every scene. The active character moves while the other listens. Reduced-motion settings disable movement; the preview pauses in a hidden tab.

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

Validation checks type, extension, size, decoding, 2:3 ratio, and minimum dimensions. It cannot verify face identity, expression quality, or cell order; check the expression gallery. Up to four custom characters can stay in the session. The app does not generate missing expressions from a single photograph.

The default art consists of reference-derived recreations and additional expression sheets, not the original attached JPGs. See [asset provenance and prompts](docs/ASSETS.md).

## Privacy and resources

Messages, uploaded images, and generated videos stay in browser memory. Refresh clears the session. No analytics, external fonts, speech API, persistence database, or request sends user content out.

Image generation in a separate AI tool is a user-directed step governed by that tool. Downloading saves a local file; device sharing is an explicit user action.

Upload URLs stay valid while the character remains in the library for either speaker, even when a default is selected. Removal, invalid image decoding, stale uploads, and unmount release URLs. Generated video URLs are released when their result is replaced or the export component unmounts. Capture tracks, animation frames, and abort listeners are stopped on completion, error, cancel, and navigation.

## Code organization

- `src/app/App.tsx`: session state, three hash routes, library, cast, occasion, and feeling.
- `src/pages/`: character, message, and animation screens.
- `src/components/MessageSettings.tsx`: quick and grouped occasion choices and feelings.
- `src/components/MessageExamples.tsx`, `src/features/message/examples.ts`: occasion/feeling examples for one or two characters.
- `src/features/avatar/framing.ts`: shared source cropping and contained proportions for preview/video.
- `src/components/VideoExport.tsx`: export progress, cancel, video review, download, and native share.
- `src/components/CharacterSprite.tsx`, `AnimationStage.tsx`: face frames and responsive animation preview.
- `src/components/UploadGuide.tsx`, `ExpressionGallery.tsx`: custom-character workflow.
- `src/features/message/occasions.ts`: occasion examples, themes, and main feelings.
- `src/features/avatar/`: shared expression catalog, image resource ownership, frame lookup, and generation prompt.
- `src/features/story/`: local scene conversion and playback timeline.
- `src/features/video/`: format negotiation, canvas drawing, text wrapping, and local recording.
- `src/styles/studio.css`: warm responsive design, keyboard focus, and reduced motion.
- `public/avatars/`: six packaged expression sheets.
- `tests/`, `scripts/`: unit and Chrome browser verification.

Hash routes remain `#/avatar`, `#/script`, and `#/animation`. Browser Back/Forward works. Opening the animation route without a message redirects to the writing screen.

## Checks

```powershell
npm test
npm run build
```

With the app running in another terminal:

```powershell
npm run test:browser
```

This runs all three browser suites using installed Chrome and playwright-core, with no downloaded browser binary. Screenshots, JSON reports, and a real sample video go into ignored `artifacts/`.

For another local preview URL or installed browser:

```powershell
$env:PREVIEW_URL = 'http://127.0.0.1:4173'
$env:BROWSER_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:browser
```

See [verification evidence](docs/QA.md) and [project plan](PROJECT_PLAN.md).
