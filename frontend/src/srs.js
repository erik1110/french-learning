// Spaced repetition (a Leitner box ladder) + daily study stats.
//
// Everything lives in localStorage — no backend. A card's state is only
// created once you actually review it, so the 600+ seed cards cost nothing
// until they are studied.
//
//   fl_srs   { [cardId]: { box, due: 'YYYY-MM-DD', seen, correct, last } }
//   fl_stats { [YYYY-MM-DD]: { reviews, correct, learned } }
//   fl_goal  number of reviews that counts as "today done"

const K_SRS = 'fl_srs'
const K_STATS = 'fl_stats'
const K_GOAL = 'fl_goal'

export const DEFAULT_GOAL = 20

// Days until a card in box N comes back. Box 0 = "just got it wrong".
const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32, 60]
export const MAX_BOX = BOX_DAYS.length - 1

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
function write(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* storage full / unavailable — reviews still work for this session */
  }
}

/** Local-time YYYY-MM-DD (never UTC — "today" must match the user's day). */
export function dayKey(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function addDays(days, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return dayKey(d)
}

/* ------------------------------- card state ------------------------------- */

// The map is read for every card that renders a mastery badge, so parsing the
// JSON each time would be O(cards) parses per screen — cache it instead.
let srsCache = null

export function getSrs() {
  if (!srsCache) srsCache = read(K_SRS, {})
  return srsCache
}

function writeSrs(next) {
  srsCache = next
  write(K_SRS, next)
}

export function getCardState(id) {
  return getSrs()[id] ?? null
}

/** 新學 / 學習中 / 已熟悉 — used for the badges in the word bank. */
export function masteryOf(state) {
  if (!state) return { key: 'new', label: '未複習', level: 0 }
  if (state.box <= 1) return { key: 'learning', label: '新學', level: 1 }
  if (state.box <= 3) return { key: 'familiar', label: '學習中', level: 2 }
  return { key: 'mastered', label: '已熟悉', level: 3 }
}

export const GRADES = [
  { key: 'again', label: '不會', hint: '再看一次', tone: 'danger' },
  { key: 'good', label: '普通', hint: '想一下才想起來', tone: 'brand' },
  { key: 'easy', label: '很熟', hint: '馬上就會', tone: 'success' },
]

/**
 * Record a review. `again` drops the card back to box 0 (due today, so the
 * session re-queues it); `good` moves up one box; `easy` moves up two.
 */
export function gradeCard(id, grade) {
  const srs = { ...getSrs() }
  const prev = srs[id] ?? { box: 0, seen: 0, correct: 0 }
  const step = grade === 'again' ? -prev.box : grade === 'easy' ? 2 : 1
  const box = Math.max(0, Math.min(MAX_BOX, prev.box + step))
  const next = {
    box,
    due: addDays(BOX_DAYS[box]),
    seen: (prev.seen ?? 0) + 1,
    correct: (prev.correct ?? 0) + (grade === 'again' ? 0 : 1),
    last: dayKey(),
  }
  srs[id] = next
  writeSrs(srs)
  recordReview({ correct: grade !== 'again', isNew: !prev.last })
  return next
}

export function forgetCard(id) {
  const srs = { ...getSrs() }
  delete srs[id]
  writeSrs(srs)
}

/* ------------------------------ review queue ------------------------------ */

/** Cards whose due date has arrived (or passed), oldest due first. */
export function dueCards(cards, srs = getSrs()) {
  const today = dayKey()
  return cards
    .filter((c) => srs[c.id] && srs[c.id].due <= today)
    .sort((a, b) => (srs[a.id].due < srs[b.id].due ? -1 : 1))
}

export function newCards(cards, srs = getSrs()) {
  return cards.filter((c) => !srs[c.id])
}

/**
 * Build a study queue: everything that is due, then unseen cards to top it up
 * to `limit`. Starred (unfamiliar) cards jump the queue among the new ones.
 */
export function buildQueue(cards, limit = 30) {
  const srs = getSrs()
  const due = dueCards(cards, srs)
  const fresh = newCards(cards, srs).sort(
    (a, b) => Number(Boolean(b.unfamiliar)) - Number(Boolean(a.unfamiliar)),
  )
  return { due, fresh, queue: [...due, ...fresh.slice(0, Math.max(0, limit - due.length))] }
}

export function countsFor(cards) {
  const srs = getSrs()
  const today = dayKey()
  let due = 0
  let learning = 0
  let mastered = 0
  for (const c of cards) {
    const s = srs[c.id]
    if (!s) continue
    if (s.due <= today) due += 1
    if (s.box >= 4) mastered += 1
    else learning += 1
  }
  return { due, learning, mastered, studied: learning + mastered }
}

/* --------------------------------- stats ---------------------------------- */

export function getStats() {
  return read(K_STATS, {})
}

export function getGoal() {
  const n = Number(read(K_GOAL, DEFAULT_GOAL))
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_GOAL
}

export function setGoal(n) {
  write(K_GOAL, Math.max(5, Math.min(200, Math.round(n))))
}

/** Log one answered card (from the review queue or the quiz). */
export function recordReview({ correct = false, isNew = false } = {}) {
  const stats = getStats()
  const key = dayKey()
  const day = stats[key] ?? { reviews: 0, correct: 0, learned: 0 }
  stats[key] = {
    reviews: day.reviews + 1,
    correct: day.correct + (correct ? 1 : 0),
    learned: day.learned + (isNew ? 1 : 0),
  }
  write(K_STATS, stats)
}

export function todayStats() {
  return getStats()[dayKey()] ?? { reviews: 0, correct: 0, learned: 0 }
}

/** Consecutive days with at least one review, counting back from today. */
export function getStreak() {
  const stats = getStats()
  let streak = 0
  const cursor = new Date()
  // A day that hasn't been studied yet doesn't break a streak until it ends.
  if (!stats[dayKey(cursor)]?.reviews) cursor.setDate(cursor.getDate() - 1)
  for (;;) {
    const key = dayKey(cursor)
    if (!stats[key]?.reviews) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Review counts for the last `days` days, oldest first (for the mini chart). */
export function recentActivity(days = 14) {
  const stats = getStats()
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    out.push({ date: key, day: d.getDate(), reviews: stats[key]?.reviews ?? 0 })
  }
  return out
}
