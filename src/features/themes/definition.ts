export type DecorationKind = 'balloon' | 'bunting' | 'confetti' | 'heart' | 'star' | 'sparkle' | 'flower' | 'moon' | 'lantern' | 'gift' | 'mirrorball' | 'ring' | 'cap' | 'sun' | 'leaf' | 'home' | 'bottle' | 'ribbon' | 'cupcake' | 'bolt' | 'plane' | 'splash' | 'tree';
export const ATMOSPHERES = ['confetti', 'hearts', 'disco', 'petals', 'sunshine', 'starlight', 'lanterns', 'snow', 'breeze', 'playful', 'colors'] as const;
export type Atmosphere = typeof ATMOSPHERES[number];
export type ThemeDecoration = { shape: DecorationKind; x: number; y: number; size: number; rotation: number; color: string };
export type ThemeDefinition = {
  id: string; label: string; background: string; accent: string; secondary: string;
  atmosphere: Atmosphere;
  decorations: readonly ThemeDecoration[];
  image?: string; imageOpacity?: number;
};
const POSITIONS = [
  { x: .075, y: .18, size: .23, rotation: -13 },
  { x: .925, y: .2, size: .25, rotation: 12 },
  { x: .045, y: .52, size: .1, rotation: -15 },
  { x: .955, y: .51, size: .12, rotation: 15 },
  { x: .1, y: .88, size: .18, rotation: -8 },
  { x: .9, y: .88, size: .17, rotation: 9 },
  { x: .5, y: .025, size: .38, rotation: 0 },
] as const;
export function createTheme<const Id extends string>(
  id: Id, label: string, background: string, accent: string, secondary: string,
  motifs: readonly DecorationKind[], options: Pick<ThemeDefinition, 'image' | 'imageOpacity'> & { atmosphere?: Atmosphere } = {},
): ThemeDefinition & { id: Id } {
  return { id, label, background, accent, secondary, atmosphere: 'petals', ...options,
    decorations: motifs.map((shape, index) => ({
      ...POSITIONS[index % POSITIONS.length], shape, color: index % 2 ? secondary : accent,
      ...(shape === 'mirrorball' ? { x: .5, y: .035, size: .2, rotation: 0 } : {}),
    })),
  };
}