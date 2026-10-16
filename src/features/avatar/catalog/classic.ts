import type { ExpressionDefinition } from './types.ts';

export const CLASSIC_EXPRESSIONS = [
  {
    "id": "neutral",
    "label": "Neutral",
    "emoji": "🙂",
    "motion": "breathe",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "happy",
    "label": "Happy",
    "emoji": "😄",
    "motion": "bounce",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "angry",
    "label": "Angry",
    "emoji": "😠",
    "motion": "shake",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "sad",
    "label": "Sad",
    "emoji": "😔",
    "motion": "sway",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "surprised",
    "label": "Surprised",
    "emoji": "😮",
    "motion": "jump",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "thinking",
    "label": "Thinking",
    "emoji": "🤔",
    "motion": "tilt",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "love",
    "label": "Love",
    "emoji": "❤️",
    "motion": "sway",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "cry",
    "label": "Crying",
    "emoji": "😭",
    "motion": "sway",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "wink",
    "label": "Winking",
    "emoji": "😉",
    "motion": "tilt",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "confused",
    "label": "Confused",
    "emoji": "😕",
    "motion": "tilt",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "sleepy",
    "label": "Sleepy",
    "emoji": "😴",
    "motion": "sway",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "excited",
    "label": "Excited",
    "emoji": "🤩",
    "motion": "bounce",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "worried",
    "label": "Worried",
    "emoji": "😟",
    "motion": "tilt",
    "group": "classic",
    "fallback": "sad"
  },
  {
    "id": "scared",
    "label": "Scared",
    "emoji": "😨",
    "motion": "shake",
    "group": "classic",
    "fallback": "surprised"
  },
  {
    "id": "proud",
    "label": "Proud",
    "emoji": "😎",
    "motion": "breathe",
    "group": "classic",
    "fallback": "happy"
  },
  {
    "id": "shy",
    "label": "Shy",
    "emoji": "☺️",
    "motion": "sway",
    "group": "classic",
    "fallback": "love"
  },
  {
    "id": "awkward",
    "label": "Awkward",
    "emoji": "😅",
    "motion": "tilt",
    "group": "classic",
    "fallback": "confused"
  },
  {
    "id": "annoyed",
    "label": "Annoyed",
    "emoji": "😤",
    "motion": "shake",
    "group": "classic",
    "fallback": "angry"
  },
  {
    "id": "grateful",
    "label": "Grateful",
    "emoji": "🙏",
    "motion": "sway",
    "group": "classic",
    "fallback": "love"
  },
  {
    "id": "curious",
    "label": "Curious",
    "emoji": "🧐",
    "motion": "tilt",
    "group": "classic",
    "fallback": "thinking"
  },
  {
    "id": "bored",
    "label": "Bored",
    "emoji": "🥱",
    "motion": "sway",
    "group": "classic",
    "fallback": "sleepy"
  },
  {
    "id": "calm",
    "label": "Calm",
    "emoji": "😌",
    "motion": "breathe",
    "group": "classic",
    "fallback": "neutral"
  },
  {
    "id": "determined",
    "label": "Determined",
    "emoji": "💪",
    "motion": "bounce",
    "group": "classic",
    "fallback": "angry"
  },
  {
    "id": "celebrate",
    "label": "Celebrating",
    "emoji": "🎉",
    "motion": "bounce",
    "group": "classic",
    "fallback": "excited"
  }
] as const satisfies readonly ExpressionDefinition[];
