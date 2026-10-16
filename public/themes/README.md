# Occasion background assets

Every registered occasion has a matching folder in these three locations:

- public/themes/<occasion>/ — shared background images
- public/avatars/male/<occasion>/ — male character artwork
- public/avatars/female/<occasion>/ — female character artwork

For example:

```text
public/themes/birthday/background.webp
public/avatars/male/birthday/joyful.png
public/avatars/female/birthday/joyful.png
```

Folder names match the occasion IDs, such as birthday, love, invitation, diwali,
and good-night. Empty folders contain .gitkeep so they stay in source control.

Register a background in src/features/themes/packs/ using its local URL:

```ts
{ atmosphere: 'confetti', image: '/themes/birthday/background.webp', imageOpacity: 0.18 }
```

Register character images in src/features/avatar/sheets/male.ts or female.ts.
A file needs a registry entry before it appears in the app. Backgrounds are
shared by either character; male/female artwork lives under avatars/.

After registering future occasions, run npm run folders:occasions from the
project root to create their folders. The command preserves existing files.

Motion profiles: src/features/themes/atmospheres.ts.
Shared SVG/video coordinates: src/features/themes/frame.ts.
Full instructions: docs/ADDING_CONTENT.md.