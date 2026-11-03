// Detects messages that suggest someone may be at risk of harming themselves
// or others. Deliberately broad: a false positive shows a supportive card,
// a false negative could miss someone who needs help.

const PATTERNS = [
  /\b(kill|killing|hurt|hurting|harm|harming|cut|cutting)\s+myself\b/i,
  /\b(don'?t|do not) want to (live|be alive|wake up)\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(end|ending|take|taking)\s+(it all|my (own )?life)\b/i,
  /\b(want|wanna|going|ready|plan(ning)?)\s+to\s+die\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\bno (reason|point) (to|in) (live|living|going on)\b/i,
  /\bcan'?t (go on|do this anymore|keep going)\b/i,
  /\bself[-\s]?harm\b/i,
  /\boverdos(e|ed|ing)\b/i,
  /\b(kill|hurt)\s+(someone|somebody|him|her|them)\b/i,
];

export function detectCrisis(text = '') {
  return PATTERNS.some((re) => re.test(text));
}

// Added to the coach's instructions so the AI reply also puts safety first.
export const CRISIS_GUIDANCE = `
SAFETY (highest priority):
- If the user mentions suicide, self-harm, wanting to die, overdose, or harming others, do NOT coach about habits or streaks.
- Respond with warmth, take it seriously, and encourage them to contact a crisis line or emergency services right now, or a trusted person who can be with them.
- Mention that crisis contacts are shown on screen. Never argue, lecture, or minimise.`;
