// Minimal hash router (no dependencies, works on GitHub Pages sub-paths).
//
// Every view is addressable, so the browser back button, refresh and shared
// links all behave the way people expect:
//
//   #/home
//   #/course              #/course/alphabet
//   #/lessons             #/lessons/etre
//   #/cards?level=A1&tag=動物&q=chat&filter=bank
//   #/review?scope=bank   #/quiz?mode=fr-zh&scope=A1
//   #/bank
//   #/units/numbers       #/grammar/A1/3       #/verbs/aller
//   #/dialogues/12        #/search?q=國籍
//   #/game                #/game/cafe-bonjour

import { useEffect, useState } from 'react'

export const DEFAULT_ROUTE = '/home'

function parse(hash) {
  const raw = (hash || '').replace(/^#/, '') || DEFAULT_ROUTE
  const [pathPart, queryPart] = raw.split('?')
  const segments = pathPart.split('/').filter(Boolean).map(decodeURIComponent)
  const query = {}
  for (const [k, v] of new URLSearchParams(queryPart || '')) query[k] = v
  return { key: raw, tab: segments[0] || 'home', segments, query }
}

export function buildPath(tab, segments = [], query = {}) {
  const path = ['', tab, ...segments.map((s) => encodeURIComponent(s))].join('/')
  const entries = Object.entries(query).filter(([, v]) => v !== '' && v != null)
  if (entries.length === 0) return path
  return `${path}?${new URLSearchParams(entries)}`
}

// history.replaceState doesn't fire hashchange, so tell the app ourselves.
function emitRouteChange() {
  window.dispatchEvent(new Event('hashchange'))
}

/** Navigate to a path like '/cards?level=A1'. `replace` keeps history clean. */
export function navigate(path, { replace = false } = {}) {
  const next = `#${path.startsWith('/') ? path : `/${path}`}`
  if (window.location.hash === next) return
  if (replace) {
    window.history.replaceState(null, '', next)
    emitRouteChange()
  } else {
    window.location.hash = next
  }
}

/** Swap the current route's params in place (no extra history entry). */
export function replaceQuery(tab, segments, query) {
  const path = buildPath(tab, segments, query)
  if (window.location.hash.replace(/^#/, '') === path) return
  window.history.replaceState(null, '', `#${path}`)
  emitRouteChange()
}

export function useRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    if (!window.location.hash) window.history.replaceState(null, '', `#${DEFAULT_ROUTE}`)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
