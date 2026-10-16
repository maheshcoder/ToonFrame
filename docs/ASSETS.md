# Character asset provenance and generation prompts

Eight PNG atlases in public/avatars are packaged project assets, including two user-supplied birthday sheets in the male/female birthday folders. The original four were created using the built-in image-generation tool. The user subsequently supplied male-extra-2.png and female-extra-2.png directly in the avatar folder; their generation process is not recorded here. No generation service or API key is added to the app.

The user supplied male and female cartoon reference images in the conversation. Their original Downloads paths were readable at the start, but unavailable when copied. The base atlases were recreated from the visible references; they are **reference-derived recreations, not byte-for-byte copies of the originals**. Additional sheets supply the other moods. Identity, outfits, flower/accessories, and drawing style were retained as visual constraints.

The six generic atlases are 1024 × 1536. The original four use 3 columns × 4 rows; the extra-2 sheets use 4 columns × 6 rows. The female birthday sheet is 1024 × 1536 and the male birthday sheet is 1086 × 1448; both have 3 columns × 4 rows. The app displays each frame through an SVG viewBox using contained proportions and safe padding. An explicit per-frame clip keeps neighboring atlas cells out of the letterbox margins. Measured per-frame rectangles account for uneven row/column spacing, with small sheet-specific gutters removing dividers. Generic uploads keep their equal-grid format. The earlier incorrect equal-grid cuts and 4% bottom crop are not used for these built-in sheets. Video uses the same source crop and containment helper. White backgrounds blend into the stage. The source PNG pixels are not modified by the app.

| Asset | Role |
| --- | --- |
| public/avatars/male-expressions.png | Twelve base male poses |
| public/avatars/female-expressions.png | Twelve base female poses |
| public/avatars/male-extra.png | Twelve additional male poses |
| public/avatars/female-extra.png | Twelve additional female poses |
| public/avatars/male-extra-2.png | Twenty-four user-added personal-message poses, 4 × 6 |
| public/avatars/female-extra-2.png | Twenty-four user-added personal-message poses, 4 × 6 |
| public/avatars/male/birthday/Male birthday expression-1.png | Twelve user-supplied birthday poses, 3 × 4, 1086 × 1448 |
| public/avatars/female/birthday/Female Birthday-1.png | Twelve user-supplied birthday poses, 3 × 4, 1024 × 1536 |

Exact frame orders live in src/features/avatar/sheets/orders.ts and the male/female manifests. Expression metadata lives in src/features/avatar/catalog/. The user-facing custom generation prompt lives in src/features/avatar/prompt.ts and has a separate, consistent 12/24/48-frame order.

## Final base-sheet prompts

### male

Create a production 3-column by 4-row character expression sprite sheet, portrait aspect ratio 2:3. Match the ORIGINAL male reference image visible earlier in this conversation: cute Indian young man with tousled black hair, warm tan skin, cream open-collar shirt, dark hand-drawn outlines and soft cartoon shading. Preserve its character identity and outfit. Use the recently generated male supplemental sheet only for consistency in rendering. Exactly 12 evenly spaced head-and-torso characters at identical scales centered inside equal cells. Solid white background; no text or letters, labels, grids, borders or watermark. Each cell's hands and hair must stay fully inside its cell with generous padding. Row-major expression order exactly: Row1 happy laughing with shut eyes; angry stern with crossed arms; crying big tears with hands by face. Row2 annoyed pout with crossed arms; thinking hand on chin; sleepy relaxed closed eyes. Row3 playful confident wink; shocked wide eyes and palms raised; affectionate love smile with hands near heart. Row4 awkward grin and shrug; confused puzzled brow; celebrating smile with thumbs up and wave. Faithfully use the male character from the supplied references.

### female

Create a production 3-column by 4-row character expression sprite sheet, portrait aspect ratio 2:3. Match the ORIGINAL female reference image visible earlier in this conversation: cute Indian young woman with shoulder-length wavy black hair, warm skin, white-and-yellow plumeria flower on viewer-right side, yellow patterned short-sleeve top over white camisole, small gold earrings, dark hand-drawn outlines and soft cartoon shading. Preserve its character identity and outfit. Use the recently generated female supplemental sheet only for consistency in rendering. Exactly 12 evenly spaced head-and-torso characters at identical scales centered inside equal cells. Solid white background; no text or letters, labels, grids, borders or watermark. Each cell's hands and hair must stay fully inside its cell with generous padding. Row-major expression order exactly: Row1 happy laughing with shut eyes; angry gritted teeth and crossed arms; crying long tears with hand near mouth. Row2 annoyed pout and crossed arms; thinking hand on chin and small smile; worried lifted inner eyebrows. Row3 love kiss expression blowing a kiss; neutral pleasant attentive face with both eyes open; excited big grin with a playful wink. Row4 shy small smile hand near cheek; surprised wide eyes and open mouth; confident playful wink with toothy smile. Faithfully use the female character from the supplied references.

## Final additional-expression prompts

### male

Use only the male character reference, ignoring the other character. Use case: illustration-story. Asset type: production character expression sprite sheet for a silent text-animation web app.
Input image: provided reference is the exact character identity and illustration style to preserve. Create ONE additional sheet of the SAME character with 12 NEW poses, not a copy of existing expressions.
Composition: portrait image aspect 2:3, exactly 3 equal-width columns and 4 equal-height rows, 12 equally sized cells. Every cell has the same character as a front-facing head-and-upper-torso sticker, same scale and aligned shoulders, with comfortable empty padding entirely inside its cell. Fill a simple solid white background. No visible cell outlines, gridlines, labels, captions, written text, lettering, watermark, or extra characters. Never let hair or hands cross a cell edge. Preserve character identity, original cartoon line weight, hair, skin, outfit, proportions, and accessories exactly. These expressions must be individually legible when cropped by an equal 3x4 grid.
Reading order MUST be row-major left to right top to bottom. Subject: same young Indian male cartoon avatar, short tousled dark hair, warm tan skin, cream open-collar shirt.
Row 1: neutral attentive face with relaxed arms; sad downcast eyes and small frown without tears; worried pinched brows with hand near chest.
Row 2: scared wide eyes and raised hands; excited delighted open smile with raised fists; proud chin up and hand on hip.
Row 3: shy blushing eyes looking aside with small smile; grateful warm eyes with palms together; curious one eyebrow raised and head tilted.
Row 4: bored half-lidded eyes and hand propping cheek; calm serene closed eyes and soft smile; determined focused brows and firm fist near chest.
Make a polished set consistent with the supplied male reference.

### female

Use only the female character reference, ignoring the other character. Use case: illustration-story. Asset type: production character expression sprite sheet for a silent text-animation web app.
Input image: provided reference is the exact character identity and illustration style to preserve. Create ONE additional sheet of the SAME character with 12 NEW poses, not a copy of existing expressions.
Composition: portrait image aspect 2:3, exactly 3 equal-width columns and 4 equal-height rows, 12 equally sized cells. Every cell has the same character as a front-facing head-and-upper-torso sticker, same scale and aligned shoulders, with comfortable empty padding entirely inside its cell. Fill a simple solid white background. No visible cell outlines, gridlines, labels, captions, written text, lettering, watermark, or extra characters. Never let hair or hands cross a cell edge. Preserve character identity, original cartoon line weight, hair, skin, outfit, proportions, and accessories exactly. These expressions must be individually legible when cropped by an equal 3x4 grid.
Reading order MUST be row-major left to right top to bottom. Subject: same young Indian female cartoon avatar, shoulder-length black wavy hair, white-and-yellow plumeria flower on viewer-right side, yellow short-sleeve patterned top over white camisole, small earrings.
Row 1: sad downcast eyes and small frown without tears; confused uneven brows and puzzled mouth with palms up; scared wide eyes and raised hands.
Row 2: sleepy closed drooping eyes with hand near yawning mouth; proud chin up and hand on hip; awkward embarrassed toothy grin with small shrug.
Row 3: grateful warm eyes with palms together; curious one eyebrow raised and head tilted; bored half-lidded eyes and hand propping cheek.
Row 4: calm serene closed eyes and soft smile; determined focused brows and firm fist near chest; celebrating delighted open smile with raised arms.
Make a polished set consistent with the supplied female reference.


## User-added personal-message sheets

The extra-2 sheets were visually inspected and mapped without changing their pixels. Both use the same row-major order:

| Row | Column 1 | Column 2 | Column 3 | Column 4 |
| --- | --- | --- | --- | --- |
| 1 | Joyful | Laughing | Birthday surprise | Holding a heart |
| 2 | Blushing | Flirty | Missing you | Blowing a kiss |
| 3 | Waving hello | Cheering | Playful | Inviting |
| 4 | Mock angry | Pouting | Frustrated | Dramatically furious |
| 5 | Apologetic | Downcast | Offering a heart | Hopeful |
| 6 | Smug | Cheeky wink | Shocked | Giggling |

These labels describe the visible poses and can be directed by matching mood tags. Grid-line gutters are hidden by the existing renderer's frame insets. Both the preview and video renderer use the sheet-specific 4 × 6 geometry. Full 48-expression uploads use a 6 × 8 grid with all moods in catalog order, at 1536 × 2304 recommended resolution. Older 12/24-expression uploads retain their previous order and use nearest-pose fallbacks for new moods.

Occasion backgrounds use code-native vector paths in src/features/themes/shapes.ts, with 32 individually registered palettes and motif lists. No new raster assets or generated artwork were required for these backgrounds. Future optional background files go in public/themes and are registered by their local URL.

The male extra-2 atlas has a light gray backdrop. A shared brightness(1.1) display filter lifts this backdrop to white before multiply blending in both SVG preview and canvas export. The uploaded source file is unchanged; the filter applies only to this built-in sheet.

## User-supplied birthday packs

The birthday source files are used unchanged. Their drawing order is in
src/features/avatar/sheets/birthday.ts, shared by the male/female manifests:

| Row | Column 1 | Column 2 | Column 3 |
| --- | --- | --- | --- |
| 1 | Waving | Excited with confetti | Laughing |
| 2 | Surprised | Holding a gift | Hopeful / blowing candles |
| 3 | Grateful | Hand over heart | Blushing |
| 4 | Playful | Cheering | Blowing a kiss |

A sheet-level occasion field selects these variants automatically for Birthday. They also appear as 12 individually labelled choices under Occasions → Birthday and can be selected manually with any background. Related
feeling aliases resolve to these poses without adding duplicate keyboard tiles; unsupported sad/angry feelings use regular
artwork. The full 48-mood catalog and custom-upload orders are unchanged.
The male birthday sheet uses brightness(1.08) in preview and video to soften
its gray paper background. All sheets use contained, proportional rendering.

The female personal sheet has column edges near 276, 519, and 773 pixels,
not 256/512/768. Its final row starts near 1251, not 1280. The female base
sheet also has unequal row spacing. The manifests record measured bounds
instead of cutting hair/flowers or showing part of the next row.

No artwork was generated, copied, or modified for the sheet-validation update. The eight existing files contain 120 unique physical character poses (60 per character). All 32 occasion keyboard categories filter real character artwork; only Birthday has dedicated occasion sheets. New occasion packs are limited to 12 poses per file in a fixed 3 × 4 grid. More drawings belong in another registered file. The content check audits resolution, ratio, crops, blank cells, copied normalized pixels, and duplicate file hashes.
