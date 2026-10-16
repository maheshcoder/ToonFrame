import type { ExpressionDefinition } from './types.ts';

export const PERSONAL_EXPRESSIONS = [
  {
    "id": "joyful",
    "label": "Joyful",
    "emoji": "🥳",
    "motion": "bounce",
    "group": "personal",
    "fallback": "excited"
  },
  {
    "id": "laughing",
    "label": "Laughing",
    "emoji": "😂",
    "motion": "bounce",
    "group": "personal",
    "fallback": "happy"
  },
  {
    "id": "gift",
    "label": "Birthday surprise",
    "emoji": "🎁",
    "motion": "jump",
    "group": "personal",
    "fallback": "surprised"
  },
  {
    "id": "love-heart",
    "label": "Holding a heart",
    "emoji": "💖",
    "motion": "sway",
    "group": "personal",
    "fallback": "love"
  },
  {
    "id": "blushing",
    "label": "Blushing",
    "emoji": "😊",
    "motion": "tilt",
    "group": "personal",
    "fallback": "shy"
  },
  {
    "id": "flirty",
    "label": "Flirty",
    "emoji": "😍",
    "motion": "tilt",
    "group": "personal",
    "fallback": "love"
  },
  {
    "id": "missing-you",
    "label": "Missing you",
    "emoji": "💭",
    "motion": "sway",
    "group": "personal",
    "fallback": "sad"
  },
  {
    "id": "kiss",
    "label": "Blowing a kiss",
    "emoji": "😘",
    "motion": "sway",
    "group": "personal",
    "fallback": "love"
  },
  {
    "id": "wave",
    "label": "Waving hello",
    "emoji": "👋",
    "motion": "tilt",
    "group": "personal",
    "fallback": "happy"
  },
  {
    "id": "cheering",
    "label": "Cheering",
    "emoji": "🙌",
    "motion": "bounce",
    "group": "personal",
    "fallback": "celebrate"
  },
  {
    "id": "playful",
    "label": "Playful",
    "emoji": "😜",
    "motion": "tilt",
    "group": "personal",
    "fallback": "wink"
  },
  {
    "id": "inviting",
    "label": "Inviting",
    "emoji": "🪩",
    "motion": "bounce",
    "group": "personal",
    "fallback": "excited"
  },
  {
    "id": "mock-angry",
    "label": "Mock angry",
    "emoji": "😤",
    "motion": "shake",
    "group": "personal",
    "fallback": "angry"
  },
  {
    "id": "pouting",
    "label": "Pouting",
    "emoji": "😗",
    "motion": "tilt",
    "group": "personal",
    "fallback": "annoyed"
  },
  {
    "id": "frustrated",
    "label": "Frustrated",
    "emoji": "😩",
    "motion": "shake",
    "group": "personal",
    "fallback": "annoyed"
  },
  {
    "id": "furious",
    "label": "Dramatically furious",
    "emoji": "🤬",
    "motion": "shake",
    "group": "personal",
    "fallback": "angry"
  },
  {
    "id": "sorry",
    "label": "Apologetic",
    "emoji": "🥺",
    "motion": "sway",
    "group": "personal",
    "fallback": "worried"
  },
  {
    "id": "downcast",
    "label": "Downcast",
    "emoji": "😞",
    "motion": "sway",
    "group": "personal",
    "fallback": "sad"
  },
  {
    "id": "heartfelt",
    "label": "Offering a heart",
    "emoji": "🫶",
    "motion": "sway",
    "group": "personal",
    "fallback": "love"
  },
  {
    "id": "hopeful",
    "label": "Hopeful",
    "emoji": "🥹",
    "motion": "breathe",
    "group": "personal",
    "fallback": "grateful"
  },
  {
    "id": "smug",
    "label": "Smug",
    "emoji": "😏",
    "motion": "tilt",
    "group": "personal",
    "fallback": "proud"
  },
  {
    "id": "cheeky",
    "label": "Cheeky wink",
    "emoji": "😉",
    "motion": "tilt",
    "group": "personal",
    "fallback": "wink"
  },
  {
    "id": "shocked",
    "label": "Shocked",
    "emoji": "😲",
    "motion": "jump",
    "group": "personal",
    "fallback": "surprised"
  },
  {
    "id": "giggling",
    "label": "Giggling",
    "emoji": "🤣",
    "motion": "bounce",
    "group": "personal",
    "fallback": "happy"
  }
] as const satisfies readonly ExpressionDefinition[];
