# Avatar artwork

Existing six atlases remain at these URLs for compatibility.

Add future male images in male/ and female images in female/.
Register them in src/features/avatar/sheets/male.ts or female.ts.
Define their expression IDs in src/features/avatar/catalog/custom.ts.

See docs/ADDING_CONTENT.md for complete copyable examples, grid order, aspect ratios, and fallbacks.

All registered occasions have matching subfolders under male/ and female/,
for example male/birthday/ and female/birthday/. Put occasion artwork in the
corresponding character folder and register each image in its sheet manifest.
Shared backgrounds go in public/themes/<occasion>/.

Run npm run folders:occasions after adding future occasions to create their
folders. Existing images and manifests are preserved.

New occasion images: 3 columns × 4 rows, maximum 12 poses, 2:3 or 3:4
portrait ratio, at least 256 pixels per nominal cell edge. Add another file
(pack-02.png, pack-03.png) for more poses; do not add grid rows/columns.
Built-in sheets must be 8-bit non-interlaced RGB/RGBA PNG, max 24 MP.
Register each actual file once, with unique character expressions and optional
per-pose labels/emoji. Content checks reject copied files/cells and blank poses.
Related occasion filters live in src/features/avatar/occasionExpressions.ts.
No artwork is copied to fill occasion folders.