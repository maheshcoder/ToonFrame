export const MOODS = [
  { id: 'neutral', label: 'Neutral', emoji: '🙂', motion: 'breathe' },
  { id: 'happy', label: 'Happy', emoji: '😄', motion: 'bounce' },
  { id: 'angry', label: 'Angry', emoji: '😠', motion: 'shake' },
  { id: 'sad', label: 'Sad', emoji: '😔', motion: 'sway' },
  { id: 'surprised', label: 'Surprised', emoji: '😮', motion: 'jump' },
  { id: 'thinking', label: 'Thinking', emoji: '🤔', motion: 'tilt' },
  { id: 'love', label: 'Love', emoji: '❤️', motion: 'sway' },
  { id: 'cry', label: 'Crying', emoji: '😭', motion: 'sway' },
  { id: 'wink', label: 'Winking', emoji: '😉', motion: 'tilt' },
  { id: 'confused', label: 'Confused', emoji: '😕', motion: 'tilt' },
  { id: 'sleepy', label: 'Sleepy', emoji: '😴', motion: 'sway' },
  { id: 'excited', label: 'Excited', emoji: '🤩', motion: 'bounce' },
  { id: 'worried', label: 'Worried', emoji: '😟', motion: 'tilt' },
  { id: 'scared', label: 'Scared', emoji: '😨', motion: 'shake' },
  { id: 'proud', label: 'Proud', emoji: '😎', motion: 'breathe' },
  { id: 'shy', label: 'Shy', emoji: '☺️', motion: 'sway' },
  { id: 'awkward', label: 'Awkward', emoji: '😅', motion: 'tilt' },
  { id: 'annoyed', label: 'Annoyed', emoji: '😤', motion: 'shake' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', motion: 'sway' },
  { id: 'curious', label: 'Curious', emoji: '🧐', motion: 'tilt' },
  { id: 'bored', label: 'Bored', emoji: '🥱', motion: 'sway' },
  { id: 'calm', label: 'Calm', emoji: '😌', motion: 'breathe' },
  { id: 'determined', label: 'Determined', emoji: '💪', motion: 'bounce' },
  { id: 'celebrate', label: 'Celebrating', emoji: '🎉', motion: 'bounce' },
  { id: 'joyful', label: 'Joyful', emoji: '🥳', motion: 'bounce' },
  { id: 'laughing', label: 'Laughing', emoji: '😂', motion: 'bounce' },
  { id: 'gift', label: 'Birthday surprise', emoji: '🎁', motion: 'jump' },
  { id: 'love-heart', label: 'Holding a heart', emoji: '💖', motion: 'sway' },
  { id: 'blushing', label: 'Blushing', emoji: '😊', motion: 'tilt' },
  { id: 'flirty', label: 'Flirty', emoji: '😍', motion: 'tilt' },
  { id: 'missing-you', label: 'Missing you', emoji: '💭', motion: 'sway' },
  { id: 'kiss', label: 'Blowing a kiss', emoji: '😘', motion: 'sway' },
  { id: 'wave', label: 'Waving hello', emoji: '👋', motion: 'tilt' },
  { id: 'cheering', label: 'Cheering', emoji: '🙌', motion: 'bounce' },
  { id: 'playful', label: 'Playful', emoji: '😜', motion: 'tilt' },
  { id: 'inviting', label: 'Inviting', emoji: '🪩', motion: 'bounce' },
  { id: 'mock-angry', label: 'Mock angry', emoji: '😤', motion: 'shake' },
  { id: 'pouting', label: 'Pouting', emoji: '😗', motion: 'tilt' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😩', motion: 'shake' },
  { id: 'furious', label: 'Dramatically furious', emoji: '🤬', motion: 'shake' },
  { id: 'sorry', label: 'Apologetic', emoji: '🥺', motion: 'sway' },
  { id: 'downcast', label: 'Downcast', emoji: '😞', motion: 'sway' },
  { id: 'heartfelt', label: 'Offering a heart', emoji: '🫶', motion: 'sway' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🥹', motion: 'breathe' },
  { id: 'smug', label: 'Smug', emoji: '😏', motion: 'tilt' },
  { id: 'cheeky', label: 'Cheeky wink', emoji: '😉', motion: 'tilt' },
  { id: 'shocked', label: 'Shocked', emoji: '😲', motion: 'jump' },
  { id: 'giggling', label: 'Giggling', emoji: '🤣', motion: 'bounce' },
] as const;
export type Mood = typeof MOODS[number]['id'];
export type SheetLayout = '12' | '24' | '48';
export const SHEET_FORMATS = {
  '12': { columns: 3, rows: 4, width: 1024, height: 1536, minWidth: 300 },
  '24': { columns: 4, rows: 6, width: 1024, height: 1536, minWidth: 400 },
  '48': { columns: 6, rows: 8, width: 1536, height: 2304, minWidth: 600 },
} as const;
// Existing user-generated sheets keep their original pose order.
export const UPLOAD_ORDER: Record<SheetLayout, readonly Mood[]> = {
  '12': MOODS.slice(0, 12).map((mood) => mood.id),
  '24': MOODS.slice(0, 24).map((mood) => mood.id),
  '48': MOODS.map((mood) => mood.id),
};
export const moodDetails = (mood: Mood) => MOODS.find((item) => item.id === mood)!;
export const isMood = (value: string): value is Mood => MOODS.some((mood) => mood.id === value);

export const ORIGINAL_ORDER: Record<'male' | 'female', readonly Mood[]> = {
  male: ['happy', 'angry', 'cry', 'annoyed', 'thinking', 'sleepy', 'wink', 'surprised', 'love', 'awkward', 'confused', 'celebrate'],
  female: ['happy', 'angry', 'cry', 'annoyed', 'thinking', 'worried', 'love', 'neutral', 'excited', 'shy', 'surprised', 'wink'],
};
export const EXTRA_ORDER: Record<'male' | 'female', readonly Mood[]> = {
  male: ['neutral', 'sad', 'worried', 'scared', 'excited', 'proud', 'shy', 'grateful', 'curious', 'bored', 'calm', 'determined'],
  female: ['sad', 'confused', 'scared', 'sleepy', 'proud', 'awkward', 'grateful', 'curious', 'bored', 'calm', 'determined', 'celebrate'],
};
// Visual inspection of the user-added 4-column × 6-row atlases, row-major.
export const EXTRA_2_ORDER = [
  'joyful', 'laughing', 'gift', 'love-heart',
  'blushing', 'flirty', 'missing-you', 'kiss',
  'wave', 'cheering', 'playful', 'inviting',
  'mock-angry', 'pouting', 'frustrated', 'furious',
  'sorry', 'downcast', 'heartfelt', 'hopeful',
  'smug', 'cheeky', 'shocked', 'giggling',
] as const satisfies readonly Mood[];
const FALLBACK: Partial<Record<Mood, Mood>> = {
  worried: 'sad', scared: 'surprised', proud: 'happy', shy: 'love',
  awkward: 'confused', annoyed: 'angry', grateful: 'love', curious: 'thinking',
  bored: 'sleepy', calm: 'neutral', determined: 'angry', celebrate: 'excited',
  joyful: 'excited', laughing: 'happy', gift: 'surprised', 'love-heart': 'love',
  blushing: 'shy', flirty: 'love', 'missing-you': 'sad', kiss: 'love',
  wave: 'happy', cheering: 'celebrate', playful: 'wink', inviting: 'excited',
  'mock-angry': 'angry', pouting: 'annoyed', frustrated: 'annoyed', furious: 'angry',
  sorry: 'worried', downcast: 'sad', heartfelt: 'love', hopeful: 'grateful',
  smug: 'proud', cheeky: 'wink', shocked: 'surprised', giggling: 'happy',
};
export function uploadFrame(mood: Mood, layout: SheetLayout) {
  const order = UPLOAD_ORDER[layout];
  let resolved = mood;
  for (let attempts = 0; !order.includes(resolved) && attempts < MOODS.length; attempts++) {
    resolved = FALLBACK[resolved] ?? 'neutral';
  }
  return Math.max(0, order.indexOf(resolved));
}
