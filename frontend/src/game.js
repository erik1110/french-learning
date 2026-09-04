// Progress for the "巴黎生活" game — kept in localStorage like the rest of the
// app's user data, so there is still no backend.
//
//   fl_game { xp, coins, scenes: { [sceneId]: { correct, total, stars, done } } }

import gameData from './data/game.json'

const KEY = 'fl_game'

export const SCENES = gameData
export const XP_PER_CORRECT = 10
export const XP_PER_LEVEL = 100
export const COINS_PER_CORRECT = 25

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (v && typeof v === 'object') return { xp: 0, coins: 0, scenes: {}, ...v }
  } catch {
    /* unreadable / unavailable — fall through to a clean slate */
  }
  return { xp: 0, coins: 0, scenes: {} }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked — the current run still works, it just won't persist */
  }
}

export function loadGame() {
  return read()
}

/** 3 stars for a clean run, 2 for ≥80%, 1 for finishing at all. */
export function starsFor(correct, total) {
  if (!total) return 0
  if (correct === total) return 3
  if (correct / total >= 0.8) return 2
  return 1
}

/**
 * Record a finished scene. Only the best attempt is kept, and XP/coins are
 * awarded on the improvement so replaying can't farm points.
 */
export function finishScene(sceneId, correct, total) {
  const state = read()
  const prev = state.scenes[sceneId]
  const gained = Math.max(0, correct - (prev?.correct ?? 0))

  state.xp += gained * XP_PER_CORRECT
  state.coins += gained * COINS_PER_CORRECT
  state.scenes[sceneId] = {
    correct: Math.max(correct, prev?.correct ?? 0),
    total,
    stars: Math.max(starsFor(correct, total), prev?.stars ?? 0),
    done: true,
  }

  write(state)
  return state
}

export function resetGame() {
  write({ xp: 0, coins: 0, scenes: {} })
}

/** Everything the HUD needs, derived from the stored state. */
export function gameStats(state = read()) {
  const totalSteps = SCENES.reduce((n, s) => n + s.steps.length, 0)
  const scenes = Object.values(state.scenes)
  return {
    xp: state.xp,
    coins: state.coins,
    level: Math.floor(state.xp / XP_PER_LEVEL) + 1,
    levelXp: state.xp % XP_PER_LEVEL,
    scenesDone: scenes.filter((s) => s.done).length,
    scenesTotal: SCENES.length,
    stars: scenes.reduce((n, s) => n + (s.stars ?? 0), 0),
    starsTotal: SCENES.length * 3,
    stepsCleared: scenes.reduce((n, s) => n + (s.correct ?? 0), 0),
    stepsTotal: totalSteps,
  }
}
