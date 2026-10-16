import type { OccasionDefinition } from './definition.ts';
export const FAMILY_OCCASIONS = [
  {
    "id": "mothers-day",
    "label": "Mother’s Day",
    "emoji": "🌷",
    "heading": "For the one who cares",
    "mood": "love",
    "group": "Family days",
    "lead": "Happy Mother’s Day!",
    "reply": "You’ll always be my favourite little troublemaker.",
    "example": "Happy Mother’s Day!\nThank you for all the little things you do.\nI love you more than this message can say.",
    "theme": "mothers-day"
  },
  {
    "id": "fathers-day",
    "label": "Father’s Day",
    "emoji": "🧡",
    "heading": "For my everyday hero",
    "mood": "grateful",
    "group": "Family days",
    "lead": "Happy Father’s Day!",
    "reply": "Terrible jokes? I call them classics.",
    "example": "Happy Father’s Day!\nI’m grateful for your love and your terrible jokes.\nI’m proud to be your biggest fan.",
    "theme": "fathers-day"
  },
  {
    "id": "rakhi",
    "label": "Raksha Bandhan",
    "emoji": "🎀",
    "heading": "My favourite sibling",
    "mood": "playful",
    "group": "Family days",
    "lead": "Happy Raksha Bandhan!",
    "reply": "Fine. I’ll replace the snacks this time.",
    "example": "Happy Raksha Bandhan!\nI love you, even when you steal my snacks.\nJust kidding. Mostly.",
    "theme": "rakhi"
  }
] as const satisfies readonly OccasionDefinition[];
