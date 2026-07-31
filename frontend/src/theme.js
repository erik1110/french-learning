// Colour scheme: 'auto' follows the OS, 'light' / 'dark' pin it.
// The resolved value is written to <html data-theme> so the CSS can switch
// tokens, and persisted in localStorage so the choice survives reloads.

import { useEffect, useState } from 'react'

const K_THEME = 'fl_theme'
export const THEMES = [
  { key: 'light', icon: '☀️', label: '淺色' },
  { key: 'dark', icon: '🌙', label: '深色' },
  { key: 'auto', icon: '🖥️', label: '跟隨系統' },
]

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function getTheme() {
  try {
    const v = localStorage.getItem(K_THEME)
    return v === 'light' || v === 'dark' || v === 'auto' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function resolveTheme(theme) {
  return theme === 'auto' ? (prefersDark() ? 'dark' : 'light') : theme
}

export function applyTheme(theme) {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  root.dataset.theme = resolved
  root.style.colorScheme = resolved
}

/** Current preference + setter; re-applies when the OS scheme changes. */
export function useTheme() {
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('auto')
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [theme])

  function setTheme(next) {
    setThemeState(next)
    try {
      localStorage.setItem(K_THEME, next)
    } catch {
      /* storage unavailable — the theme still applies for this session */
    }
  }

  return [theme, setTheme]
}

// Apply the stored theme before React mounts, so there is no light flash.
if (typeof document !== 'undefined') applyTheme(getTheme())
