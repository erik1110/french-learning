// Pronounce French text using the browser's built-in SpeechSynthesis API.
// No backend, no API key — works offline in modern browsers.
//
// Playback rate (speed) and voice (音色) are user-configurable and persisted
// in localStorage so the choice survives reloads.

const K_RATE = 'fl_speech_rate'
const K_VOICE = 'fl_speech_voice' // stores voiceURI

const DEFAULT_RATE = 0.8 // slower by default, easier for learners

let cachedFrenchVoices = []

/** All available French voices (fr-*), with fr-FR listed first. */
export function getFrenchVoices() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  const french = voices.filter((v) => v.lang?.toLowerCase().startsWith('fr'))
  return french.sort((a, b) => {
    const af = a.lang === 'fr-FR' ? 0 : 1
    const bf = b.lang === 'fr-FR' ? 0 : 1
    return af - bf || a.name.localeCompare(b.name)
  })
}

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : v
  } catch {
    return fallback
  }
}
function write(key, val) {
  try {
    localStorage.setItem(key, String(val))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getRate() {
  const r = parseFloat(read(K_RATE, ''))
  return Number.isFinite(r) ? r : DEFAULT_RATE
}

export function setRate(rate) {
  write(K_RATE, rate)
}

/** voiceURI of the currently selected voice (or '' for auto). */
export function getVoiceURI() {
  return read(K_VOICE, '') ?? ''
}

export function setVoiceURI(uri) {
  write(K_VOICE, uri ?? '')
}

/** Resolve the voice to use: the user's choice, else the best French voice. */
function resolveVoice() {
  const voices = cachedFrenchVoices.length ? cachedFrenchVoices : getFrenchVoices()
  const uri = getVoiceURI()
  if (uri) {
    const chosen = voices.find((v) => v.voiceURI === uri)
    if (chosen) return chosen
  }
  return voices[0] || null
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// --- playback state, so the UI can show "playing" and offer a stop button ---
const listeners = new Set()
let queued = 0
let sequence = false // true while a whole block (dialogue / unit) is playing

function snapshot() {
  return { speaking: queued > 0, remaining: queued, sequence: sequence && queued > 0 }
}

function notify() {
  const state = snapshot()
  for (const fn of listeners) fn(state)
}

/** Subscribe to playback changes; returns an unsubscribe function. */
export function subscribeSpeaking(fn) {
  listeners.add(fn)
  fn(snapshot())
  return () => listeners.delete(fn)
}

export function isSpeaking() {
  return queued > 0
}

function buildUtterance(text) {
  const voice = resolveVoice()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice?.lang || 'fr-FR'
  if (voice) utterance.voice = voice
  utterance.rate = getRate()
  const done = () => {
    queued = Math.max(0, queued - 1)
    notify()
  }
  utterance.onend = done
  utterance.onerror = done
  return utterance
}

/** Speak a single French string, cancelling anything already playing. */
export function speakFrench(text) {
  if (!isSpeechSupported() || !text) return
  window.speechSynthesis.cancel()
  queued = 1
  sequence = false
  notify()
  window.speechSynthesis.speak(buildUtterance(text))
}

/** Speak several French lines back-to-back (used to play a whole dialogue). */
export function speakFrenchSequence(texts) {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
  const lines = texts.filter(Boolean)
  queued = lines.length
  sequence = true
  notify()
  lines.forEach((t) => window.speechSynthesis.speak(buildUtterance(t)))
}

/** Stop any ongoing speech. */
export function stopSpeaking() {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
  queued = 0
  sequence = false
  notify()
}

// Voices load asynchronously in some browsers; cache them when available.
if (isSpeechSupported()) {
  cachedFrenchVoices = getFrenchVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    cachedFrenchVoices = getFrenchVoices()
  }
}
