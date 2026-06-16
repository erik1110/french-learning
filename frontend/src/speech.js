// Pronounce French text using the browser's built-in SpeechSynthesis API.
// No backend, no API key — works offline in modern browsers.

let cachedFrenchVoice

function pickFrenchVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  // Prefer a fr-FR voice, fall back to any French ("fr") voice.
  return (
    voices.find((v) => v.lang === 'fr-FR') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('fr')) ||
    null
  )
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function buildUtterance(text) {
  if (!cachedFrenchVoice) cachedFrenchVoice = pickFrenchVoice()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  if (cachedFrenchVoice) utterance.voice = cachedFrenchVoice
  utterance.rate = 0.9 // slightly slower, easier for learners
  return utterance
}

/** Speak a single French string, cancelling anything already playing. */
export function speakFrench(text) {
  if (!isSpeechSupported() || !text) return
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(buildUtterance(text))
}

/** Speak several French lines back-to-back (used to play a whole dialogue). */
export function speakFrenchSequence(texts) {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
  texts.filter(Boolean).forEach((t) => window.speechSynthesis.speak(buildUtterance(t)))
}

/** Stop any ongoing speech. */
export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}

// Re-pick the voice when the list becomes available.
if (isSpeechSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedFrenchVoice = pickFrenchVoice()
  }
}
