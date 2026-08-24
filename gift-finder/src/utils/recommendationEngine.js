const BUDGET_RANGES = {
  'under5k':  [0, 5000],
  '5k-10k':   [5000, 10000],
  '10k-20k':  [10000, 20000],
  '20k-50k':  [20000, 50000],
  '50k+':     [50000, Infinity],
};

const MAX_PER_INTEREST = 4; // diversity cap when picking final results

/**
 * Score a single gift against the user's quiz answers.
 *
 * Unlike the old engine, scoring starts from ZERO — a gift only ranks
 * high when it actually matches what the user asked for. Mismatches
 * are penalised, and budget fit is proportional (not a binary bonus).
 *
 *   Recipient match     → +25   (no match: −10)
 *   Occasion match      → +15
 *   Budget fit          → +10…+25 proportional to overlap (outside: −40)
 *   Interest matches    → +10 each, capped +20 (none: −8)
 *   Gift type match     → +10   (no match: −3)
 *   Quality tie-breaker → +gift.score × 0.3
 */
function scoreGift(gift, answers) {
  const { recipient, occasion, budget, interests, giftType } = answers;
  let score = gift.score * 0.3;

  if (recipient) {
    score += gift.recipient.includes(recipient) ? 25 : -10;
  }

  if (occasion && gift.occasion.includes(occasion)) score += 15;

  if (budget && BUDGET_RANGES[budget]) {
    const [uMin, uMax] = BUDGET_RANGES[budget];
    const overlap = Math.min(gift.budget_max, uMax) - Math.max(gift.budget_min, uMin);
    if (overlap <= 0) {
      score -= 40;
      if (gift.budget_min > uMax) score -= 20; // over budget is worse than too cheap
    } else {
      const giftSpan = gift.budget_max - gift.budget_min;
      const fitRatio = giftSpan > 0 ? overlap / giftSpan : 1;
      score += Math.round(10 + fitRatio * 15);
    }
  }

  if (interests.length > 0) {
    const matches = interests.filter(i => gift.interests.includes(i)).length;
    if (matches > 0) {
      score += Math.min(matches * 10, 20);
    } else {
      score -= 8;
    }
  }

  if (giftType) {
    score += gift.gift_type.includes(giftType) ? 10 : -3;
  }

  return Math.round(score * 10) / 10;
}

/** Shuffle array in place (Fisher–Yates) — used to vary ties */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick the final list: sorted by score, but shuffled inside equal-score
 * bands and capped per interest so one category can't dominate.
 */
function pickDiverse(ranked, limit) {
  const bands = new Map();
  for (const gift of ranked) {
    const key = gift.matchScore;
    if (!bands.has(key)) bands.set(key, []);
    bands.get(key).push(gift);
  }

  const ordered = [];
  for (const [, band] of [...bands.entries()].sort((a, b) => b[0] - a[0])) {
    ordered.push(...shuffle(band));
  }

  const picked = [];
  const interestCount = new Map();
  const leftovers = [];

  for (const gift of ordered) {
    const underCap = gift.interests.every(i => (interestCount.get(i) ?? 0) < MAX_PER_INTEREST);
    if (picked.length < limit && underCap) {
      picked.push(gift);
      for (const i of gift.interests) interestCount.set(i, (interestCount.get(i) ?? 0) + 1);
    } else {
      leftovers.push(gift);
    }
  }

  // Backfill if diversity capping left us short
  for (const gift of leftovers) {
    if (picked.length >= limit) break;
    picked.push(gift);
  }

  return picked.slice(0, limit);
}

/**
 * Return top gift recommendations for the quiz answers.
 * Gifts below the relevance threshold are excluded unless we'd
 * otherwise return too few results.
 * @param {object} answers  - { recipient, occasion, budget, interests[], giftType }
 * @param {Array}  gifts    - full gifts array
 * @param {number} limit    - max results to return (default 8)
 */
export function getRecommendations(answers, gifts, limit = 8) {
  const ranked = gifts
    .map(gift => ({ ...gift, matchScore: scoreGift(gift, answers) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const RELEVANCE_FLOOR = 12;
  const relevant = ranked.filter(g => g.matchScore >= RELEVANCE_FLOOR);
  const rest = ranked.filter(g => g.matchScore < RELEVANCE_FLOOR);

  const picked = pickDiverse(relevant, limit);

  // Backfill so the grid is never sparse — weaker matches go last
  if (picked.length < limit) {
    const pickedIds = new Set(picked.map(g => g.id));
    for (const gift of rest) {
      if (picked.length >= limit) break;
      if (!pickedIds.has(gift.id)) picked.push(gift);
    }
  }

  return picked.slice(0, limit);
}

/**
 * Convert a raw matchScore into a display percentage.
 * New score range: ~0 (irrelevant) to ~98 (perfect match).
 */
export function matchPercent(score) {
  const pct = Math.round(50 + (score / 98) * 48);
  return Math.min(98, Math.max(52, pct));
}

/** True when the user answered at least one quiz question */
export function hasAnswers(answers) {
  return Boolean(
    answers.recipient ||
    answers.occasion ||
    answers.budget ||
    answers.giftType ||
    answers.interests.length > 0
  );
}

/** Parse quiz answers from URL search params */
export function parseAnswersFromParams(searchParams) {
  return {
    recipient: searchParams.get('recipient') ?? '',
    occasion:  searchParams.get('occasion')  ?? '',
    budget:    searchParams.get('budget')    ?? '',
    interests: (searchParams.get('interests') ?? '').split(',').filter(Boolean),
    giftType:  searchParams.get('type')      ?? '',
    custom: {
      recipient: searchParams.get('cr') ?? '',
      occasion:  searchParams.get('co') ?? '',
      budget:    searchParams.get('cb') ?? '',
      interests: searchParams.get('ci') ?? '',
      giftType:  searchParams.get('ct') ?? '',
    },
  };
}

/** Serialize quiz answers to URL search params string */
export function answersToParams(answers, custom = {}) {
  const p = new URLSearchParams({
    recipient: answers.recipient,
    occasion:  answers.occasion,
    budget:    answers.budget,
    interests: answers.interests.join(','),
    type:      answers.giftType,
  });
  if (custom.recipient?.trim()) p.set('cr', custom.recipient.trim());
  if (custom.occasion?.trim())  p.set('co', custom.occasion.trim());
  if (custom.budget?.trim())    p.set('cb', custom.budget.trim());
  if (custom.interests?.trim()) p.set('ci', custom.interests.trim());
  if (custom.giftType?.trim())  p.set('ct', custom.giftType.trim());
  return p.toString();
}
