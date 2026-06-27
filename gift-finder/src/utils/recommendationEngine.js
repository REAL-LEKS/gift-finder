const BUDGET_RANGES = {
  'under5k':  [0, 5000],
  '5k-10k':   [5000, 10000],
  '10k-20k':  [10000, 20000],
  '20k-50k':  [20000, 50000],
  '50k+':     [50000, Infinity],
};

/**
 * Score a single gift against the user's quiz answers.
 * Scoring weights:
 *   Recipient match  → +5
 *   Occasion match   → +3
 *   Budget match     → +5
 *   Interest match   → +4 per matching interest
 *   Gift type match  → +2
 */
function scoreGift(gift, answers) {
  const { recipient, occasion, budget, interests, giftType } = answers;
  let score = gift.score; // start from the gift's base quality score

  if (gift.recipient.includes(recipient)) score += 5;
  if (gift.occasion.includes(occasion))   score += 3;

  const [budgetMin, budgetMax] = BUDGET_RANGES[budget] ?? [0, Infinity];
  if (gift.budget_min <= budgetMax && gift.budget_max >= budgetMin) score += 5;

  for (const interest of interests) {
    if (gift.interests.includes(interest)) score += 4;
  }

  if (gift.gift_type.includes(giftType)) score += 2;

  return score;
}

/**
 * Return top gift recommendations sorted by match score.
 * @param {object} answers  - { recipient, occasion, budget, interests[], giftType }
 * @param {Array}  gifts    - full gifts array from gifts.json
 * @param {number} limit    - max results to return (default 8)
 */
export function getRecommendations(answers, gifts, limit = 8) {
  return gifts
    .map(gift => ({ ...gift, matchScore: scoreGift(gift, answers) }))
    .filter(g => g.matchScore > 5) // exclude poor matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Convert a raw matchScore into a display percentage (72–99%).
 * Keeps numbers in a realistic "AI confidence" range.
 */
export function matchPercent(score) {
  const pct = Math.round(40 + (score / 35) * 60);
  return Math.min(99, Math.max(72, pct));
}

/** Parse quiz answers from URL search params */
export function parseAnswersFromParams(searchParams) {
  return {
    recipient: searchParams.get('recipient') ?? '',
    occasion:  searchParams.get('occasion')  ?? '',
    budget:    searchParams.get('budget')    ?? '',
    interests: (searchParams.get('interests') ?? '').split(',').filter(Boolean),
    giftType:  searchParams.get('type')      ?? '',
  };
}

/** Serialize quiz answers to URL search params string */
export function answersToParams(answers) {
  const p = new URLSearchParams({
    recipient: answers.recipient,
    occasion:  answers.occasion,
    budget:    answers.budget,
    interests: answers.interests.join(','),
    type:      answers.giftType,
  });
  return p.toString();
}
