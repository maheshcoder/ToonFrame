import { MOODS, isMood } from './index.ts';
import type { Mood } from './index.ts';
import type { ExpressionDefinition } from './types.ts';
const EMOJI_RULES: [Mood, string[]][] = [
  ['joyful', ['🥳']], ['laughing', ['😂']], ['gift', ['🎁']], ['love-heart', ['💖']],
  ['blushing', ['😊']], ['flirty', ['😍']], ['missing-you', ['💭']], ['kiss', ['😘']],
  ['wave', ['👋']], ['cheering', ['🙌']], ['playful', ['😜', '😝']], ['inviting', ['🪩']],
  ['mock-angry', ['😤']], ['pouting', ['😗']], ['frustrated', ['😩']], ['furious', ['🤬']],
  ['sorry', ['🥺']], ['downcast', ['😞']], ['heartfelt', ['🫶']], ['hopeful', ['🥹']],
  ['smug', ['😏']], ['shocked', ['😲']], ['giggling', ['🤣']],
  ['happy', ['😄', '😀', '😁']], ['love', ['❤️', '❤', '🥰', '💕', '💌']],
  ['angry', ['😠', '😡']], ['sad', ['😔', '☹️', '🙁']], ['surprised', ['😮', '😯', '🤯']],
  ['thinking', ['🤔']], ['cry', ['😭', '😢']], ['wink', ['😉']], ['confused', ['😕', '🤨', '😵']],
  ['sleepy', ['😴', '💤']], ['excited', ['🤩']], ['worried', ['😟', '😥']], ['scared', ['😨', '😱', '😰']],
  ['proud', ['😎']], ['shy', ['☺️', '☺', '🙈', '🫣']], ['awkward', ['😅', '😬']], ['annoyed', ['🙄']],
  ['grateful', ['🙏']], ['curious', ['🧐']], ['bored', ['🥱', '😒']], ['calm', ['😌', '🧘']],
  ['determined', ['💪', '🔥']], ['celebrate', ['🎉', '🎊', '🏆', '🥇', '🎂']],
];
const WORD_RULES: [Mood, RegExp][] = [
  ['calm', /\b(?:not (?:mad|angry)|we(?:'re| are) good|all good|no worries)\b/i],
  ['sorry', /\b(?:sorry|my fault|messed up|apologize|apologise)\b/i],
  ['hopeful', /\b(?:friends again|forgive me|make it up to you|hopeful)\b/i],
  ['mock-angry', /\b(?:mad at|never forgiving|forgot my birthday|mock anger)\b/i],
  ['missing-you', /\b(?:miss you|missed you|missing you)\b/i],
  ['gift', /\b(?:birthday present|a gift|your present|a present|a surprise gift)\b/i],
  ['kiss', /\b(?:sending kisses|blow a kiss|kisses for you|sending you a kiss)\b/i],
  ['wave', /\b(?:waving hello|waving goodbye)\b/i],
  ['cheering', /\b(?:cheering|cheer for you|victory dance)\b/i],
  ['flirty', /\b(?:flirty|flirting)\b/i],
  ['pouting', /\b(?:pouting|pout)\b/i],
  ['frustrated', /\b(?:frustrated|frustrating)\b/i],
  ['furious', /\b(?:furious|rage)\b/i],
  ['giggling', /\b(?:giggling|giggle)\b/i],
  ['laughing', /\b(?:laughing|hahaha|lol)\b/i],
  ['cheeky', /\b(?:cheeky)\b/i],
  ['smug', /\b(?:smug)\b/i],
  ['inviting', /\b(?:invited|come over|join the party)\b/i],

  ['sad', /\b(?:not happy|unhappy|sad|lonely|heartbroken|disappointed|sorry|my fault|messed up)\b/i],
  ['grateful', /\b(?:friends again|forgive me|make it up to you|thank you|thanks|grateful|thankful)\b/i],
  ['playful', /\b(?:save me.*cake|unless.*cake|bring.*cake|don'?t be late|just kidding|kidding|teasing|cheeky|playful|annoy you|cupcakes)\b/i],
  ['angry', /\b(?:angry|mad at|furious|hate|rage|never forgiving|forgot my birthday)\b/i],
  ['cry', /\b(?:cry|crying|tears|sobbing)\b/i],
  ['scared', /\b(?:scared|afraid|terrified|frightened|help me)\b/i],
  ['worried', /\b(?:worried|worry|nervous|anxious)\b/i],
  ['celebrate', /\b(?:congratulations|congrats|we won|(?:i|we) did it|hooray|celebrate)\b/i],
  ['excited', /\b(?:happy birthday|excited|amazing|awesome|can't wait|cannot wait|yay|invited)\b/i],
  ['love', /\b(?:love|adore|sweetheart|darling|miss you|hugs|kiss|mean the world|make my days better|a lot)\b/i],
  ['surprised', /\b(?:wow|surprise|surprised|really|unbelievable)\b/i],
  ['confused', /\b(?:confused|don't understand|do not understand|what do you mean|huh)\b/i],
  ['sleepy', /\b(?:sleepy|sleep|goodnight|tired|exhausted)\b/i],
  ['bored', /\b(?:bored|boring|whatever)\b/i],
  ['proud', /\b(?:proud|nailed it|looking good)\b/i],
  ['blushing', /\b(?:shy|blush|blushing|embarrassed)\b/i],
  ['awkward', /\b(?:awkward|oops|uh oh)\b/i],
  ['annoyed', /\b(?:annoyed|annoying|ugh|seriously|stop it)\b/i],
  ['determined', /\b(?:determined|i can do|never give up|let's do|lets do|i will try)\b/i],
  ['calm', /\b(?:calm|relax|peace|breathe)\b/i],
  ['thinking', /\b(?:think|thinking|wonder|maybe|idea)\b/i],
  ['happy', /\b(?:happy|great|wonderful|smile|hello|hi|hey)\b/i],
];
export function matchEmoji(text: string): Mood | undefined {
  let result: Mood | undefined, lastIndex = -1;
  const extensions: readonly ExpressionDefinition[] = MOODS;
  const extra: [Mood, readonly string[]][] = extensions.filter((item) => item.match?.emojis?.length && isMood(item.id)).map((item) => [item.id as Mood, item.match!.emojis!]);
  for (const [mood, aliases] of [...extra, ...EMOJI_RULES]) for (const emoji of aliases) {
    if (!emoji.trim()) continue;
    const index = text.lastIndexOf(emoji);
    if (index > lastIndex) { result = mood; lastIndex = index; }
  }
  return result;
}
export function matchWords(text: string): Mood | undefined {
  const normalized = text.replace(/[’‘]/g, "'");
  const extensions: readonly ExpressionDefinition[] = MOODS;
  for (const item of extensions) for (const phrase of item.match?.words ?? []) {
    if (!phrase.trim()) continue;
    // Plain words/phrases: no regular-expression syntax is required in custom packs.
    const words = normalized.toLocaleLowerCase();
    const target = phrase.toLocaleLowerCase();
    let index = words.indexOf(target);
    while (index >= 0) {
      const before = index === 0 ? '' : words[index - 1];
      const after = words[index + target.length] ?? '';
      if (!/[\p{L}\p{N}_]/u.test(before) && !/[\p{L}\p{N}_]/u.test(after) && isMood(item.id)) return item.id;
      index = words.indexOf(target, index + 1);
    }
  }
  return WORD_RULES.find(([, pattern]) => pattern.test(normalized))?.[0];
}
