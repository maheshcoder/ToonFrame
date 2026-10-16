import type { OccasionDefinition } from './definition.ts';
export const FESTIVALS_OCCASIONS = [
  {
    "id": "diwali",
    "label": "Diwali",
    "emoji": "🪔",
    "heading": "A little light for you",
    "mood": "joyful",
    "group": "Festivals",
    "lead": "Happy Diwali!",
    "reply": "Happy Diwali! I saved your favourite sweets.",
    "example": "Happy Diwali!\nHope your day is bright and wonderful.\nLet’s celebrate with sweets and a lot of love.",
    "theme": "diwali"
  },
  {
    "id": "holi",
    "label": "Holi",
    "emoji": "🎨",
    "heading": "A splash of happiness",
    "mood": "playful",
    "group": "Festivals",
    "lead": "Happy Holi!",
    "reply": "No chance. You’re getting every colour.",
    "example": "Happy Holi!\nI’m excited for all the colours and laughter.\nJust kidding about keeping my clothes clean.",
    "theme": "holi"
  },
  {
    "id": "new-year",
    "label": "New Year",
    "emoji": "✨",
    "heading": "Here’s to a fresh start",
    "mood": "excited",
    "group": "Festivals",
    "lead": "Happy New Year!",
    "reply": "New adventures, same excellent team.",
    "example": "Happy New Year!\nI’m grateful we get another year together.\nLet’s celebrate the adventures ahead.",
    "theme": "new-year"
  },
  {
    "id": "christmas",
    "label": "Christmas",
    "emoji": "🎄",
    "heading": "A warm little wish",
    "mood": "joyful",
    "group": "Festivals",
    "lead": "Merry Christmas!",
    "reply": "Merry Christmas! Now I’m curious about that gift.",
    "example": "Merry Christmas!\nSending you all my love.\nI have a surprise gift with your name on it.",
    "theme": "christmas"
  },
  {
    "id": "eid",
    "label": "Eid",
    "emoji": "🌙",
    "heading": "Warm wishes for you",
    "mood": "grateful",
    "group": "Festivals",
    "lead": "Eid Mubarak!",
    "reply": "Eid Mubarak! Come over. There’s plenty to share.",
    "example": "Eid Mubarak!\nWishing you a wonderful day with the people you love.\nThank you for making every celebration sweeter.",
    "theme": "eid"
  }
] as const satisfies readonly OccasionDefinition[];
