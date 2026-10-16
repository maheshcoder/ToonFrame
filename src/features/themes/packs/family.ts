import { createTheme } from '../definition.ts';
export const FAMILY_THEMES = [
  createTheme("mothers-day", "Flowers for Mum", '#fceef2', '#dba9bd', '#bccb9d', ['flower', 'heart', 'leaf', 'flower', 'heart', 'flower'], { atmosphere: 'petals' }),
  createTheme("fathers-day", "Dad’s little award", '#f2f3df', '#c3c792', '#c5af89', ['ribbon', 'star', 'leaf', 'sparkle', 'star', 'gift'], { atmosphere: 'sunshine' }),
  createTheme("rakhi", "Rakhi ribbons", '#fff0e6', '#dcb38d', '#d7a5aa', ['ribbon', 'flower', 'sparkle', 'ribbon', 'heart', 'flower'], { atmosphere: 'petals' }),
] as const;
