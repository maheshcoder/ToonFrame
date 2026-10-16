# Adding expressions, avatar artwork, occasions, and backgrounds

The current app has **48 moods**, **32 occasions**, and **32 background themes**, with 60 unique images per built-in character (48 regular + 12 birthday). Content lives in registries; components and video rendering read those registries.

## Occasion asset folders

Every current occasion has a folder in each of these locations:

```text
public/
  themes/<occasion>/          # Background artwork
  avatars/male/<occasion>/    # Male character artwork
  avatars/female/<occasion>/  # Female character artwork
```

For example, birthday assets belong in `public/themes/birthday/`,
`public/avatars/male/birthday/`, and `public/avatars/female/birthday/`.
Folder names use the registered occasion ID (lowercase words with hyphens).
The 32 occasions therefore have 96 folders across the three locations.

After adding a future occasion to its registry, create its folders with:

```powershell
npm run folders:occasions
```

This command reads the occasion registry, preserves existing files, and adds
`.gitkeep` placeholders so empty folders stay in source control. It can be run
again whenever you add occasions. It does not register artwork automatically:
background paths still belong in theme packs, and character image/grid entries
belong in the male or female sheet manifest.

For example, the background `public/themes/birthday/background.webp` is referenced
as `/themes/birthday/background.webp` in `createTheme` options. A character pose
at `public/avatars/male/birthday/pack-01.png` is referenced as
`/avatars/male/birthday/pack-01.png` in `MALE_SHEETS`.

## Where to make changes

| What you want to add | Edit here | Put image files here |
| --- | --- | --- |
| New expression ID, label, emoji, motion, word matching | `src/features/avatar/catalog/custom.ts` | — |
| Male expression images / atlas order | `src/features/avatar/sheets/male.ts` | `public/avatars/male/` |
| Female expression images / atlas order | `src/features/avatar/sheets/female.ts` | `public/avatars/female/` |
| New occasion and its message examples | `src/features/message/occasions/custom.ts` | — |
| Background effect wording, particle shape, speed | `src/features/themes/atmospheres.ts` | — |
| New background theme | `src/features/themes/packs/custom.ts` | Optional: `public/themes/` |
| Main feeling buttons | `src/features/message/feelings.ts` | Use an expression already in the catalog |
| Example wording for a main feeling | `src/features/message/exampleTones.ts` | — |
| A new custom-upload grid size | `src/features/avatar/uploadFormats.ts` | User uploads stay in browser memory |

Run this after making changes:

```powershell
npm run check:content
npm test
npm run build
npm run dev
```

The content check also runs automatically before dev/build. No API key or service is needed.

## Add one expression

### 1. Add its definition

Edit `src/features/avatar/catalog/custom.ts`:

```ts
import type { ExpressionDefinition } from './types.ts';

export const CUSTOM_EXPRESSIONS = [
  {
    id: 'relieved',
    label: 'Relieved',
    emoji: '😮‍💨',
    motion: 'breathe',
    group: 'custom',
    fallback: 'calm',
    match: {
      words: ['relieved', 'what a relief'],
      emojis: ['😮‍💨'],
    },
  },
] as const satisfies readonly ExpressionDefinition[];
```

IDs use lowercase words and hyphens and must remain unique. The ID is also available as an optional `[relieved]` direction tag; ordinary users can just type the matching words.

Available motions: `breathe`, `bounce`, `shake`, `sway`, `jump`, and `tilt`. Words are plain phrases, not regular expressions. The fallback must name an existing expression and eventually reach `neutral`.

Tags and word recognition read the catalog automatically. The gallery and scene picker deduplicate by actual sheet/frame: a fallback does not become another image choice. Add real artwork to expose a new distinct pose. No component changes are needed. The main feeling buttons are a separate, optional step described below.

### 2. Add the artwork

For a single square pose, add:

```text
public/avatars/male/relieved.png
public/avatars/female/relieved.png
```

Add this entry to `MALE_SHEETS` in `src/features/avatar/sheets/male.ts`:

```ts
{
  src: '/avatars/male/relieved.png',
  columns: 1,
  rows: 1,
  aspectRatio: 1,
  order: ['relieved'],
},
```

Add the corresponding entry to `FEMALE_SHEETS`, using `/avatars/female/relieved.png`.

The URL omits `public`. `aspectRatio` is the **whole image width divided by height**; use `1` for a square, `2 / 3` for a 2:3 portrait, or `3 / 4` for a 3:4 occasion sheet. Generic atlases use 2:3; a single pose may be square. It defaults to `2 / 3` for the existing sheets. The PNG content check catches mismatched proportions. Registered built-in artwork must be non-interlaced, 8-bit RGB/RGBA PNG so the local validator can audit each cell. Custom browser uploads still accept PNG/JPEG/WebP.

Preview and video share frame containment and source cropping, so new sheets keep their proportions. Keep every head and hand inside its own atlas cell.

If artwork for one character is not ready, that character uses the expression's fallback. The app keeps working; it cannot invent a new drawing. Later entries in a character's sheet list take priority when an existing expression has replacement artwork.

### 3. Add a whole expression pack

For example, a 2:3 portrait atlas with four poses in two columns and two rows (at least 512 × 768 pixels):

```ts
{
  src: '/avatars/male/reactions.png',
  columns: 2,
  rows: 2,
  aspectRatio: 2 / 3,
  order: ['relieved', 'another-mood', 'third-mood', 'fourth-mood'],
},
```

Define every ID first. Order runs left to right, then top to bottom. Do not repeat an ID inside one sheet. Unused trailing cells are allowed.

For larger code packs, create another catalog file and spread its exported definitions into `CUSTOM_EXPRESSIONS`. The already-imported custom registry is the extension point.

### 4. Add occasion-specific character art

Keep an occasion pack in `public/avatars/male/<occasion>/` or
`public/avatars/female/<occasion>/`, then add it to that character's sheet
manifest. Set `occasion` to the registered occasion ID. The current birthday
entries in `sheets/male.ts` and `sheets/female.ts` are complete examples.

- `order` maps the visible drawings to existing mood IDs.
- `aliases` optionally maps close feelings to a pose in this sheet, such as
  `{ joyful: 'excited' }`. Every alias target must appear in the sheet's order.
- Exact/aliased poses in the matching occasion pack take priority. Missing
  feelings use their ordinary artwork and fallback chain.
- Always set `aspectRatio` to the actual source width / height. The birthday
  male sheet is `3 / 4`; its female counterpart is `2 / 3`.
- The writing previews, keyboard, player, and video all pass the occasion to
  the shared frame resolver. Uploaded characters keep their own artwork.

### 5. Handle uneven cells without cutting artwork

An atlas may have equal row/column counts but unequal cell spacing. Add
normalized `frames` via the `atlasFrames` helper from `avatar/framing.ts`:

```ts
frames: atlasFrames(
  1024, 1536,                    // actual source width / height
  [1, 276, 519, 773, 1023],       // measured vertical cell boundaries
  [1, 254, 496, 745, 998, 1251, 1533], // measured horizontal boundaries
  0.006,                         // small inset to remove divider lines
),
```

This is the current female personal sheet. Measure your own image rather
than copying its numbers. Boundaries are source-image pixels; the helper
normalizes them for both SVG and video. A frame list must cover every cell,
keep positive sizes, and remain within the image. For an even grid, `frames`
can be omitted. Place boundaries in blank gaps and remove only divider
pixels, keeping hair, hands, props, and outfits intact.

## Fixed occasion sheets and additional packs

Keep **at most 12 poses per occasion image**, in exactly **3 columns × 4 rows**. Approved ratios are **2:3** and **3:4**, with a tolerance of 0.005 for pixel rounding. Minimum 256 pixels along each nominal cell edge, maximum 24 MP. Recommended: **1024 × 1536** (2:3) or **1080 × 1440** (3:4). Preserve the full head, hair, hands, and torso inside each cell with blank margins. Every occupied cell must contain one distinct expression of that character. Do not copy an existing pose, add another person, or add text/emoji as a substitute for facial expression.

For 13–24 poses, put the next set in another image in the same folder:

```text
public/avatars/female/birthday/pack-01.png
public/avatars/female/birthday/pack-02.png
public/avatars/male/birthday/pack-01.png
public/avatars/male/birthday/pack-02.png
```

These are example paths; no copies of existing artwork are created. Use your actual filenames. Register **each new file once** in its character's sheet manifest. For example, append this entry only after providing real, different artwork:

```ts
{
  src: '/avatars/female/birthday/pack-02.png',
  occasion: 'birthday',
  columns: 3,
  rows: 4,
  aspectRatio: 2 / 3,
  order: ['happy', 'love', 'surprised'], // occupied cells, row-major
  poses: [
    { label: 'Birthday grin', emoji: '😁' },
    { label: 'Birthday hug', emoji: '🫶' },
    { label: 'Birthday gasp', emoji: '😮' },
  ],
},
```

Use your exact occupied-cell order; do not label blank cells as expressions. `poses` is optional, but if supplied it needs one label/emoji per `order` item. Multiple sheets may use the same semantic mood with different drawings. Each physical frame appears once in **All** and **Occasions → Birthday**; aliases never add extra tiles. Manual scene selection stores the exact file/frame through playback and video, regardless of the background.

Every occasion registered in `message/occasions/` automatically appears under **Occasions** in the expression keyboard. A dedicated pack is used when present; otherwise the category filters related existing character poses without copying assets. Adjust those related moods in **`src/features/avatar/occasionExpressions.ts`**. Future occasions use their default mood plus warm general reactions until you add a specific mapping. Only Birthday currently has dedicated occasion art. All 32 categories remain usable for built-ins and uploaded sheets.

The policies are centralized in `avatar/sheetPolicy.ts`; do not increase grid density to fit more drawings. `npm run check:content` blocks invalid ratios, low resolution, overfull packs, repeated source files/cells, and overlapping crops before dev/build. Existing generic 12/24-frame atlases remain supported; upload orders stay versioned separately.
## Keep old uploads compatible

**Do not append new poses to an existing 12, 24, or 48 upload order.** Those orders describe files people have already generated. A new catalog expression uses its nearest fallback in those older uploads.

Current uploads are capped at 48 frames per sheet. Their fixed 2:3 layouts require minimum sizes of 768 × 1152 (12), 1024 × 1536 (24), and 1536 × 2304 (48), no more than 10 MB / 24 MP. Each nominal cell must be at least 256 × 256 pixels. The browser rejects blank cells, copied normalized poses, and poses already in the upload library. It does not verify expression meaning or identity. Never add rows/columns to an existing layout.

Multiple files can extend built-in characters through separate manifest entries as described below. Each custom-upload character currently has one 12/24/48-frame sheet; combining multiple uploaded sheets into one character is a future feature.
## Add an occasion and its theme

### 1. Add the background theme

Edit `src/features/themes/packs/custom.ts`:

```ts
import { createTheme } from '../definition.ts';

export const CUSTOM_THEMES = [
  createTheme(
    'pet-birthday',
    'A birthday for your little buddy',
    '#fff4df', // background
    '#e2be80', // main decoration color
    '#cfb3d8', // secondary decoration color
    ['balloon', 'gift', 'confetti', 'star'],
    { atmosphere: 'confetti' },
  ),
] as const;
```

Use six-digit hex colors. The helper places decorations around the edges, away from the main message. Available shapes are listed in `themes/definition.ts`; their vector paths live in `themes/shapes.ts`.

Existing birthday themes use balloons/cake; parties use a mirror ball/confetti; love notes use hearts; festival themes have their own motifs. Category files in `themes/packs/` provide examples.

Both the responsive preview and video use the same palette, shape paths, and deterministic animation coordinates. No new component or renderer branch is needed when an occasion uses an existing atmosphere.

### Choose the motion and atmosphere

Set `atmosphere` in the seventh `createTheme` argument. It defaults to `petals` when omitted.

| Atmosphere | Effect | Good for |
| --- | --- | --- |
| `confetti` | Falling confetti and overhead garlands | Birthdays, wins, graduation, New Year |
| `hearts` | Rising hearts, rosy color, fine arches | Love notes, couples, anniversaries |
| `disco` | Moving light beams, garlands, sparkle | Party invitations |
| `petals` | Floating flowers and garden arches | Apologies, thanks, family, weddings |
| `sunshine` | Warm rays and drifting sparkle | Morning, encouragement, get-well wishes |
| `starlight` | Slowly drifting stars and moonlit color | Good night, new babies, wishes |
| `lanterns` | Golden sparkle and glowing festive color | Diwali, Eid |
| `snow` | Falling tiny snowflakes | Christmas |
| `breeze` | Floating leaves and light arches | Farewells |
| `playful` | Bouncy stars and warm color | Teasing, funny anger |
| `colors` | Drifting colored splashes | Holi |

Each theme still has its own palette and large motifs, even when it shares an atmosphere. For example, birthday uses balloons/cake while graduation uses caps/stars; both can use `confetti` motion.

To tune an effect's description, button label, particle shape, count, drift, or cycle duration, edit `src/features/themes/atmospheres.ts`. To create a new effect family, add its ID to `ATMOSPHERES` in `definition.ts` and a profile in `atmospheres.ts`; optional new scenery belongs in the pure `frame.ts` function. Keep particles near the edges, use slow movement, and preserve the `reducedMotion` branch. SVG and video both consume `themeFrame`; do not duplicate occasion-specific animation inside components.

`ThemePreviewCard.tsx` handles the interactive sample; `useThemePreview.ts` limits automatic demos to six seconds, supports pause/replay, and cancels timers on unmount. Tap bursts and pointer depth are preview-only. Final ambient animation uses the message clock, so pause, seek, speed, and export agree. System reduced motion disables background movement in both outputs.

### 2. Optionally use your own background image

Add a PNG, JPG/JPEG, WebP, or SVG to:

```text
public/themes/pet-birthday.webp
```

Pass the optional seventh argument to `createTheme`:

```ts
{
  atmosphere: 'confetti',
  image: '/themes/pet-birthday.webp',
  imageOpacity: 0.18,
}
```

Images fill the background with a centered cover crop. Opacity keeps the message and avatars readable. The image is loaded for video export too. The content checker verifies the registered path exists.

### 3. Register the occasion

Edit `src/features/message/occasions/custom.ts`:

```ts
import type { OccasionDefinition } from './definition.ts';

export const CUSTOM_OCCASIONS = [
  {
    id: 'pet-birthday',
    label: 'Pet birthday',
    emoji: '🐾',
    heading: 'For my little buddy',
    mood: 'joyful',
    group: 'Family days',
    theme: 'pet-birthday',
    lead: 'Happy birthday, little buddy!',
    reply: 'Did somebody say birthday snacks?',
    example: 'Happy birthday, little buddy!\nI love our little adventures.\nLet’s celebrate with extra treats.',
  },
] as const satisfies readonly OccasionDefinition[];
```

The theme ID and default mood must already exist. The occasion automatically appears in the swipeable occasion row, gets one- and two-character examples for every selected feeling, and uses its background in preview and video.

To place it near the start of the row, add its ID to `QUICK_OCCASION_IDS` in `message/occasions/index.ts`. To add a category, update `OCCASION_GROUPS` in `message/occasions/definition.ts`.

Existing occasions are organized into `everyday.ts`, `milestones.ts`, `family.ts`, and `festivals.ts`. Change an existing occasion's `theme` field to choose a different registered background.

## Optional: a new main feeling button

A new expression with distinct registered artwork automatically appears in the scene expression keyboard. A catalog-only fallback does not create a repeated image tile. To promote it to a main feeling:

1. Add an entry to `EMOTIONS` in `message/feelings.ts`.
2. Add its wording profile to `EXAMPLE_TONES` in `message/exampleTones.ts`.

TypeScript checks that every main feeling has an example profile. The buttons and example library then update automatically.

## What the checks catch

`check:content` verifies IDs, fallback references/cycles, sheet grids/counts, local assets, approved PNG ratios, minimum 256 px per nominal cell, maximum 24 MP, repeated files/normalized character cells, blank cells, non-overlapping crop bounds, pose metadata, upload counts, palette values, decorations, atmospheres, and occasion links. Pixel checks detect copied image content, not every semantic lookalike or incorrect emotion. Missing or invalid definitions stop dev/build with a specific message.

The tests and browser checks also cover old upload compatibility, example generation, reduced motion, framing, and video output. To check the full UI with the dev server running:

```powershell
npm run test:browser
```

Adding an image file alone does not register a pose or an occasion. Add the matching catalog/manifest entry, run the checks, and review the gallery.
