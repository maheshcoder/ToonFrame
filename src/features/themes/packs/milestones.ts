import { createTheme } from '../definition.ts';
export const MILESTONES_THEMES = [
  createTheme("birthday", "Birthday balloons & cake", '#fff3d9', '#e6b66b', '#df9fa5', ['balloon', 'balloon', 'confetti', 'confetti', 'cupcake', 'gift', 'bunting'], { atmosphere: 'confetti' }),
  createTheme("celebration", "Victory confetti", '#f1f6dc', '#bbcf7d', '#e3bd71', ['star', 'confetti', 'confetti', 'star', 'ribbon', 'star', 'bunting'], { atmosphere: 'confetti' }),
  createTheme("anniversary", "Anniversary rings & hearts", '#fbecef', '#d4a0b5', '#dfba8c', ['heart', 'ring', 'sparkle', 'heart', 'flower', 'heart'], { atmosphere: 'hearts' }),
  createTheme("graduation", "Graduation stars", '#eaf2fb', '#a9c4df', '#dfbf7a', ['cap', 'star', 'sparkle', 'star', 'ribbon', 'cap'], { atmosphere: 'confetti' }),
  createTheme("exam-wishes", "Lucky little stars", '#e9f4f2', '#a3c9c3', '#dacb91', ['star', 'leaf', 'sparkle', 'star', 'leaf', 'ribbon'], { atmosphere: 'starlight' }),
  createTheme("farewell", "Paper plane goodbye", '#f1f1f7', '#babbd2', '#c4d0b0', ['plane', 'leaf', 'sparkle', 'plane', 'leaf', 'star'], { atmosphere: 'breeze' }),
  createTheme("welcome", "Home sweet home", '#fff2e2', '#dfbf96', '#b8c6a0', ['home', 'star', 'leaf', 'sparkle', 'flower', 'home'], { atmosphere: 'sunshine' }),
  createTheme("reunion", "Together again", '#f4edfa', '#c4afd9', '#ddaec1', ['heart', 'flower', 'sparkle', 'heart', 'star', 'flower'], { atmosphere: 'hearts' }),
  createTheme("engagement", "Sparkling rings", '#f9eef6', '#d6b0ce', '#e2c28c', ['ring', 'heart', 'sparkle', 'ring', 'flower', 'star'], { atmosphere: 'hearts' }),
  createTheme("wedding", "Wedding garden", '#f4f5e9', '#c0ca9e', '#d8bb9d', ['flower', 'ring', 'leaf', 'heart', 'flower', 'ribbon'], { atmosphere: 'petals' }),
  createTheme("new-baby", "Tiny new dreams", '#edf6fa', '#b0ccd9', '#ddc3a0', ['star', 'bottle', 'moon', 'sparkle', 'heart', 'star'], { atmosphere: 'starlight' }),
] as const;
