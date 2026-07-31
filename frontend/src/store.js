// Data + persistence layer for the (backend-free) app.
//
// • Word content is imported directly from the JSON files (bundled at build
//   time) — no API/server needed, so the site can be hosted statically.
// • User data (word bank marks + custom cards) is stored in localStorage.

import a1 from './data/a1.json'
import a2 from './data/a2.json'
import b1 from './data/b1.json'
import grammarData from './data/grammar.json'
import dialoguesData from './data/dialogues.json'
import unitsData from './data/units.json'
import verbsData from './data/verbs.json'
import lessonsData from './data/lessons.json'
import courseData from './data/course.json'

export const LEVELS = ['A1', 'A2', 'B1']

// --- seed flashcards: attach a stable id + level (assigned from the file) ---
// ids are unique within a level: `${level}-${indexInFile}`.
function levelCards(arr, level) {
  return arr.map((c, i) => ({ ...c, level, id: `${level}-${i}` }))
}

export const SEED_CARDS = [
  ...levelCards(a1, 'A1'),
  ...levelCards(a2, 'A2'),
  ...levelCards(b1, 'B1'),
]

/** Distinct category tags present at a given level (for the category browser). */
export function categoriesFor(level) {
  return [...new Set(SEED_CARDS.filter((c) => c.level === level).map((c) => c.tag).filter(Boolean))]
}

export const GRAMMAR = grammarData
  .slice()
  .sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0))

export const DIALOGUES = dialoguesData.map((d, i) => ({ ...d, id: i }))
export const DIALOGUE_CATEGORIES = [...new Set(DIALOGUES.map((d) => d.category))]

// --- "Lessons review" tab: in-class lessons, organised section by section ---
export const LESSONS = lessonsData

// --- "Learning path" tab: the structured zero-to-conversation course -------
// Stages contain lessons; lesson sections reference grammar (level +
// orderIndex), units (id), dialogues (title) and vocab (level + tag), or
// carry their own teaching items inline.
export const COURSE = courseData
export const COURSE_LESSON_COUNT = COURSE.reduce((n, s) => n + s.lessons.length, 0)

/** Every course lesson in order, each carrying its stage and 1-based number. */
export const COURSE_FLAT = COURSE.flatMap((stage) =>
  stage.lessons.map((l) => ({ ...l, stage })),
).map((l, i) => ({ ...l, number: i + 1 }))

export function findCourseLesson(id) {
  return COURSE_FLAT.find((l) => l.id === id)
}

/** The first lesson the learner hasn't ticked off (or the last one if all done). */
export function nextCourseLesson(doneSet) {
  return COURSE_FLAT.find((l) => !doneSet.has(l.id)) ?? COURSE_FLAT[COURSE_FLAT.length - 1]
}


export function findGrammar(level, orderIndex) {
  return GRAMMAR.find((g) => g.level === level && g.orderIndex === orderIndex)
}

export function findDialogue(title) {
  return DIALOGUES.find((d) => d.title === title)
}

export function vocabFor(level, tag) {
  return SEED_CARDS.filter((c) => c.level === level && c.tag === tag)
}

// --- "Units / themes" tab: numbers are generated, the rest come from JSON ---
const NUMBER_WORDS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
]

export function frenchNumber(n) {
  if (n < 20) return NUMBER_WORDS[n]
  if (n < 60) {
    const base = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante' }[Math.floor(n / 10)]
    const r = n % 10
    if (r === 0) return base
    if (r === 1) return `${base} et un`
    return `${base}-${NUMBER_WORDS[r]}`
  }
  if (n < 70) {
    const r = n - 60
    if (r === 0) return 'soixante'
    if (r === 1) return 'soixante et un'
    return `soixante-${NUMBER_WORDS[r]}`
  }
  if (n < 80) {
    if (n === 71) return 'soixante et onze'
    return `soixante-${NUMBER_WORDS[n - 60]}`
  }
  if (n < 90) {
    const r = n - 80
    return r === 0 ? 'quatre-vingts' : `quatre-vingt-${NUMBER_WORDS[r]}`
  }
  if (n < 100) return `quatre-vingt-${NUMBER_WORDS[n - 80]}`
  return 'cent'
}

const numbersUnit = {
  id: 'numbers',
  category: '數字',
  title: '數字 0–100 怎麼念',
  intro: '法文數字的規律：70 = soixante-dix（60+10）、80 = quatre-vingts（4×20）、90 = quatre-vingt-dix。',
  items: Array.from({ length: 101 }, (_, n) => ({ fr: frenchNumber(n), zh: String(n) })),
}

export const UNITS = [numbersUnit, ...unitsData]

export function findUnit(id) {
  return UNITS.find((u) => u.id === id)
}

// --- verb conjugation (présent stored; passé composé + futur derived) ---
const SUBJECTS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles']
const AVOIR = ['ai', 'as', 'a', 'avons', 'avez', 'ont']
const ETRE = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']
const FUTUR_ENDINGS = ['ai', 'as', 'a', 'ons', 'ez', 'ont']

// "je" elides to "j'" before a vowel sound.
function withSubject(subject, form) {
  if (subject === 'je' && /^[aeiouhâàéèêîïôùû]/i.test(form)) return `j'${form}`
  return `${subject} ${form}`
}

export const VERBS = verbsData

/** Build présent / passé composé / futur tables for a verb entry. */
export function conjugate(v) {
  const present = v.present.map((f, i) => withSubject(SUBJECTS[i], f))
  const auxForms = v.aux === 'être' ? ETRE : AVOIR
  const passeCompose = auxForms.map((a, i) => `${withSubject(SUBJECTS[i], a)} ${v.pp}`)
  const futur = FUTUR_ENDINGS.map((e, i) => withSubject(SUBJECTS[i], v.futureStem + e))
  return { subjects: SUBJECTS, present, passeCompose, futur }
}

// --- global search across every content type ---------------------------------
// Matches a Chinese or French query against vocab, units, grammar, verbs,
// dialogues and in-class lessons, returning grouped, ranked results.

// Part-of-speech tags are too broad to be useful as a "related topic" (e.g.
// there are 127 「動詞」cards); topical tags like 運動休閒 / 時間 are.
const POS_TAGS = new Set([
  '動詞', '形容詞', '副詞', '名詞', '其他名詞', '介係詞', '連接詞', '常用語', '招呼用語',
])

function normQuery(s) {
  return (s ?? '').toString().trim().toLowerCase()
}

// Score how well `text` matches the already-normalised query `q`.
// exact > whole-segment > prefix > substring. Returns 0 for no match.
function scoreText(text, q) {
  if (!text || !q) return 0
  const t = text.toString().toLowerCase()
  if (t === q) return 100
  const segs = t.split(/[\s,，、；;:：/／()（）.。!！?？·・—－\-]+/).filter(Boolean)
  if (segs.includes(q)) return 80
  if (t.startsWith(q)) return 55
  if (t.includes(q)) return 35
  return 0
}

function best(...scores) {
  return scores.reduce((m, s) => (s > m ? s : m), 0)
}

export function searchAll(rawQuery) {
  const q = normQuery(rawQuery)
  if (!q) return null

  // vocab cards
  const cardScored = SEED_CARDS.map((c) => ({
    card: c,
    score: best(
      scoreText(c.french, q),
      scoreText(c.translation, q),
      scoreText(c.tag, q) * 0.9,
      scoreText(c.example, q) * 0.5,
      scoreText(c.exampleTranslation, q) * 0.5,
    ),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  const cards = cardScored.map((x) => x.card)

  // related topical categories: tags whose name matches, plus the topical tags
  // of the strongest card matches (this is what surfaces "運動" when you type 游泳)
  const catMap = new Map()
  const addCat = (level, tag, score) => {
    if (!tag) return
    const key = `${level}|${tag}`
    const prev = catMap.get(key)
    if (!prev || score > prev.score) catMap.set(key, { level, tag, score })
  }
  for (const level of LEVELS) {
    for (const tag of categoriesFor(level)) {
      const s = scoreText(tag, q)
      if (s > 0) addCat(level, tag, s + (POS_TAGS.has(tag) ? 0 : 25))
    }
  }
  for (const { card, score } of cardScored.slice(0, 8)) {
    if (card.tag && !POS_TAGS.has(card.tag)) addCat(card.level, card.tag, score - 10)
  }
  const categories = [...catMap.values()]
    .map((c) => ({ ...c, count: vocabFor(c.level, c.tag).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  // units / themes
  const units = UNITS.map((u) => ({
    u,
    score: best(
      scoreText(u.title, q),
      scoreText(u.category, q) * 0.9,
      scoreText(u.intro, q) * 0.6,
      ...u.items.slice(0, 80).map((it) => best(scoreText(it.fr, q), scoreText(it.zh, q)) * 0.5),
    ),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.u)

  // grammar
  const grammar = GRAMMAR.map((g) => ({
    g,
    score: best(
      scoreText(g.title, q),
      scoreText(g.summary, q) * 0.8,
      scoreText(g.content, q) * 0.4,
      ...(g.examples || []).map((ex) => best(scoreText(ex.fr, q), scoreText(ex.zh, q)) * 0.5),
    ),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.g)

  // verbs
  const verbs = VERBS.map((v) => ({
    v,
    score: best(scoreText(v.inf, q), scoreText(v.zh, q)),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.v)

  // dialogues
  const dialogues = DIALOGUES.map((d) => ({
    d,
    score: best(
      scoreText(d.title, q),
      scoreText(d.category, q) * 0.8,
      scoreText(d.scene, q) * 0.6,
      ...d.lines.map((l) => best(scoreText(l.french, q), scoreText(l.translation, q)) * 0.4),
    ),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d)

  // in-class lesson reviews
  const lessons = LESSONS.map((le) => ({
    le,
    score: best(
      scoreText(le.title, q),
      scoreText(le.summary, q) * 0.7,
      ...le.sections.map((sec) =>
        best(
          scoreText(sec.heading, q),
          ...sec.items.map((it) => best(scoreText(it.fr, q), scoreText(it.zh, q)) * 0.4),
        ),
      ),
    ),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.le)

  const total =
    cards.length + units.length + grammar.length + verbs.length + dialogues.length + lessons.length

  return { q: rawQuery.trim(), cards, categories, units, grammar, verbs, dialogues, lessons, total }
}

// --- localStorage ---
const K_UNFAMILIAR = 'fl_unfamiliar'
const K_CUSTOM = 'fl_custom_cards'
const K_COURSE_DONE = 'fl_course_done'

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
    /* storage full / unavailable — ignore */
  }
}

export function getUnfamiliarSet() {
  return new Set(read(K_UNFAMILIAR, []))
}

// --- course progress (completed lesson ids) ---
export function getDoneLessons() {
  return new Set(read(K_COURSE_DONE, []))
}

export function toggleLessonDone(id) {
  const set = getDoneLessons()
  if (set.has(id)) set.delete(id)
  else set.add(id)
  write(K_COURSE_DONE, [...set])
}

export function toggleUnfamiliar(id) {
  const set = getUnfamiliarSet()
  if (set.has(id)) set.delete(id)
  else set.add(id)
  write(K_UNFAMILIAR, [...set])
}

export function getCustomCards() {
  return read(K_CUSTOM, [])
}

export function addCustomCard(card) {
  const cards = getCustomCards()
  cards.unshift({ ...card, id: `custom-${Date.now()}`, custom: true })
  write(K_CUSTOM, cards)
}

export function updateCustomCard(id, patch) {
  write(
    K_CUSTOM,
    getCustomCards().map((c) => (c.id === id ? { ...c, ...patch } : c)),
  )
}

export function deleteCustomCard(id) {
  write(
    K_CUSTOM,
    getCustomCards().filter((c) => c.id !== id),
  )
}

/** All cards (seed + custom) with the current `unfamiliar` flag applied. */
export function loadCards() {
  const unfam = getUnfamiliarSet()
  const custom = getCustomCards().map((c) => ({ ...c, custom: true }))
  return [...SEED_CARDS, ...custom].map((c) => ({
    ...c,
    unfamiliar: unfam.has(c.id),
  }))
}
