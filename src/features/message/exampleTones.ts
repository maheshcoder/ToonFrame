import type { EmotionId } from './feelings.ts';
export const EXAMPLE_TONES: Record<Exclude<EmotionId, 'auto'>, { lines: [string, string]; reply: string; ending: string }> = {
  happy: { lines: ['You put the biggest smile on my face.', 'Let’s make another happy memory.'], reply: 'Now I’m smiling too!', ending: 'That sounds like our kind of day.' },
  love: { lines: ['Whatever the day brings, you’re my favourite person.', 'Sending you all my love.'], reply: 'You make everything feel a little warmer.', ending: 'Sending that love right back.' },
  shy: { lines: ['I rehearsed this message twice and I’m still blushing.', 'You mean more to me than I know how to say.'], reply: 'Take your time. I’m listening.', ending: 'That was the sweetest thing to hear.' },
  surprised: { lines: ['Wait, really? I’m still trying to believe it!', 'Tell me every tiny detail.'], reply: 'Yes, really! This is happening.', ending: 'I’ll tell you everything.' },
  angry: { lines: ['I’m filing a very dramatic complaint: not enough hugs!', 'You can fix it with cake.'], reply: 'A complaint? Should I bring emergency snacks?', ending: 'Cake and hugs. Case closed.' },
  sad: { lines: ['Wish I could be there with you right now.', 'Sending a little hug until I can give you a real one.'], reply: 'I wish you were here too.', ending: 'We’ll make time for that hug soon.' },
  excited: { lines: ['I can barely sit still!', 'I’m cheering for you as loudly as a silent message can.'], reply: 'Okay, now I’m excited too!', ending: 'Let’s make this a moment to remember.' },
  playful: { lines: ['Consider this your official reminder that I’m your favourite.', 'No arguing. I already checked.'], reply: 'Official? Who approved this?', ending: 'Fine. You win this round.' },
};
