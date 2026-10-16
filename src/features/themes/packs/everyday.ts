import { createTheme } from '../definition.ts';
export const EVERYDAY_THEMES = [
  createTheme("just-because", "Everyday sunshine", '#edf2e1', '#b5cc8b', '#e3bb79', ['sun', 'leaf', 'sparkle', 'flower'], { atmosphere: 'sunshine' }),
  createTheme("love", "Little love hearts", '#fcecef', '#d4a4b0', '#d7b5cf', ['heart', 'heart', 'sparkle', 'heart', 'flower', 'heart'], { atmosphere: 'hearts' }),
  createTheme("invitation", "Disco party", '#f1eafa', '#b3a1d1', '#d6a8be', ['bunting', 'mirrorball', 'sparkle', 'confetti', 'star', 'confetti', 'bunting'], { atmosphere: 'disco' }),
  createTheme("funny-anger", "Dramatic cake complaint", '#fff0e1', '#e6ba88', '#dc9a86', ['bolt', 'cupcake', 'sparkle', 'bolt', 'cupcake', 'star'], { atmosphere: 'playful' }),
  createTheme("apology", "Gentle blue flowers", '#edf3fa', '#afc7df', '#cfb1d0', ['flower', 'heart', 'leaf', 'sparkle', 'flower', 'heart'], { atmosphere: 'petals' }),
  createTheme("teasing", "Cheeky little stars", '#faf2d9', '#dec581', '#d6b18d', ['star', 'sparkle', 'bolt', 'star', 'cupcake', 'ribbon'], { atmosphere: 'playful' }),
  createTheme("friendship", "Friendship daisies", '#fff2e8', '#dfb58d', '#c0cfa2', ['flower', 'star', 'sparkle', 'flower', 'leaf', 'star'], { atmosphere: 'petals' }),
  createTheme("thank-you", "Grateful garden", '#eaf5ed', '#a5c9b1', '#dfc38e', ['flower', 'leaf', 'leaf', 'sparkle', 'flower', 'heart'], { atmosphere: 'petals' }),
  createTheme("encouragement", "A little courage", '#eef4dd', '#b5ca83', '#d8bc82', ['star', 'sun', 'bolt', 'star', 'leaf', 'sparkle'], { atmosphere: 'sunshine' }),
  createTheme("get-well", "Soft healing sunshine", '#e9f5f0', '#a9cabb', '#e6ca88', ['sun', 'flower', 'leaf', 'flower', 'leaf', 'heart'], { atmosphere: 'sunshine' }),
  createTheme("good-morning", "Morning rays", '#fff4df', '#e8c076', '#bdcd9a', ['sun', 'flower', 'leaf', 'sparkle', 'flower', 'sun'], { atmosphere: 'sunshine' }),
  createTheme("good-night", "Moonlit dreams", '#eeeffa', '#b4b3d8', '#d7c995', ['moon', 'star', 'sparkle', 'star', 'moon', 'star'], { atmosphere: 'starlight' }),
  createTheme("date-invite", "A rosy invitation", '#fff0f2', '#dca5b0', '#c4bbd8', ['heart', 'flower', 'sparkle', 'heart', 'flower', 'star'], { atmosphere: 'hearts' }),
] as const;
