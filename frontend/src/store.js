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

// --- localStorage ---
const K_UNFAMILIAR = 'fl_unfamiliar'
const K_CUSTOM = 'fl_custom_cards'

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
