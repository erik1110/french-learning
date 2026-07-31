import { useEffect, useMemo, useRef, useState } from 'react'
import { loadCards } from './store'
import { countsFor, getGoal, setGoal as persistGoal } from './srs'
import { useRoute, navigate } from './router'
import { THEMES, useTheme } from './theme'
import {
  getFrenchVoices,
  getRate,
  getVoiceURI,
  isSpeechSupported,
  setRate as persistRate,
  setVoiceURI as persistVoiceURI,
  speakFrench,
  stopSpeaking,
} from './speech'
import { useSpeaking } from './ui'

import HomeView from './views/Home'
import CourseView from './views/Course'
import LessonsView from './views/Lessons'
import CardsView from './views/Cards'
import ReviewView from './views/Review'
import QuizView from './views/Quiz'
import BankView from './views/Bank'
import UnitsView from './views/Units'
import GrammarView from './views/Grammar'
import VerbsView from './views/Verbs'
import DialoguesView from './views/Dialogues'
import SearchView from './views/Search'

const NAV = [
  {
    title: '學習',
    items: [
      { tab: 'home', path: '/home', icon: '🏠', label: '首頁' },
      { tab: 'course', path: '/course', icon: '🗺️', label: '學習路徑' },
      { tab: 'lessons', path: '/lessons', icon: '📅', label: '課程複習' },
    ],
  },
  {
    title: '練習',
    items: [
      { tab: 'review', path: '/review', icon: '🔁', label: '每日複習', badge: 'due' },
      { tab: 'cards', path: '/cards', icon: '📇', label: '單字卡' },
      { tab: 'quiz', path: '/quiz', icon: '✏️', label: '牛刀小試' },
      { tab: 'bank', path: '/bank', icon: '⭐', label: '我的單字庫' },
    ],
  },
  {
    title: '查詢',
    items: [
      { tab: 'search', path: '/search', icon: '🔍', label: '搜尋' },
      { tab: 'units', path: '/units', icon: '🔢', label: '單元主題' },
      { tab: 'grammar', path: '/grammar', icon: '📘', label: '文法教學' },
      { tab: 'verbs', path: '/verbs', icon: '🔧', label: '動詞變化' },
      { tab: 'dialogues', path: '/dialogues', icon: '💬', label: '情境對話' },
    ],
  },
]

const ALL_NAV = NAV.flatMap((g) => g.items)
const BOTTOM_NAV = ['home', 'course', 'review', 'cards'].map((t) =>
  ALL_NAV.find((i) => i.tab === t),
)

const LINKS = [
  { label: '🇹🇼 個人部落格', url: 'https://erik1110.com/' },
  { label: '🇯🇵 日語學習', url: 'https://erik1110.com/japanese-learning/' },
]

/* ------------------------------- settings --------------------------------- */

function SettingsPanel({ onClose }) {
  const [theme, setTheme] = useTheme()
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURIState] = useState(getVoiceURI())
  const [rate, setRateState] = useState(getRate())
  const [goal, setGoalState] = useState(getGoal())

  useEffect(() => {
    if (!isSpeechSupported()) return
    const load = () => setVoices(getFrenchVoices())
    load()
    const synth = window.speechSynthesis
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [])

  return (
    <div className="settings-panel" role="dialog" aria-label="設定">
      <div className="settings-row">
        <span className="settings-label">外觀</span>
        <div className="segmented compact">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={theme === t.key ? 'segment active' : 'segment'}
              aria-pressed={theme === t.key}
              onClick={() => setTheme(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-row">
        <span className="settings-label">每日目標</span>
        <div className="settings-goal">
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={goal}
            onChange={(e) => {
              const v = Number(e.target.value)
              setGoalState(v)
              persistGoal(v)
            }}
          />
          <span className="settings-value">{goal} 張／天</span>
        </div>
      </div>

      {isSpeechSupported() ? (
        <>
          <div className="settings-row">
            <span className="settings-label">語速</span>
            <div className="settings-goal">
              <input
                type="range"
                min="0.5"
                max="1.2"
                step="0.1"
                value={rate}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  setRateState(v)
                  persistRate(v)
                }}
              />
              <span className="settings-value">{rate.toFixed(1)}×</span>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-label">音色</span>
            <select
              value={voiceURI}
              onChange={(e) => {
                setVoiceURIState(e.target.value)
                persistVoiceURI(e.target.value)
              }}
            >
              <option value="">自動（系統預設法語）</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}（{v.lang}）
                </option>
              ))}
            </select>
          </div>

          {voices.length === 0 && (
            <p className="muted">此瀏覽器沒有偵測到法語音色，將使用系統預設發音。</p>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => speakFrench('Bonjour ! Aujourd’hui, on apprend le français.')}
          >
            ▶ 試聽發音
          </button>
        </>
      ) : (
        <p className="warn">⚠️ 此瀏覽器不支援語音合成，發音功能無法使用。</p>
      )}

      <div className="settings-links">
        {LINKS.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- shell ---------------------------------- */

export default function App() {
  const route = useRoute()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const cards = useMemo(() => loadCards(), [version])

  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)
  const { speaking } = useSpeaking()

  const active = ALL_NAV.find((i) => i.tab === route.tab) ?? ALL_NAV[0]
  const dueCount = useMemo(() => countsFor(cards).due, [cards])

  // Stop audio and go back to the top whenever the destination changes.
  useEffect(() => {
    stopSpeaking()
    window.scrollTo({ top: 0 })
    setMenuOpen(false)
  }, [route.tab, route.segments[1]])

  // Close the settings popover on outside click / Escape.
  useEffect(() => {
    if (!settingsOpen) return
    const onClick = (e) => {
      if (!settingsRef.current?.contains(e.target)) setSettingsOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setSettingsOpen(false)
    window.addEventListener('click', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  // "/" or ⌘K jumps to search from anywhere.
  useEffect(() => {
    function onKey(e) {
      if (e.target.matches?.('input, textarea, select')) return
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        navigate('/search')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Plain function (not a component) so the sidebar doesn't remount each render.
  function renderNav(onPick) {
    return NAV.map((group) => (
      <div key={group.title} className="nav-group">
        <p className="nav-group-title">{group.title}</p>
        {group.items.map((item) => (
          <button
            key={item.tab}
            type="button"
            className={item.tab === route.tab ? 'nav-item active' : 'nav-item'}
            aria-current={item.tab === route.tab ? 'page' : undefined}
            onClick={() => {
              navigate(item.path)
              onPick?.()
            }}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge === 'due' && dueCount > 0 && <span className="nav-badge">{dueCount}</span>}
          </button>
        ))}
      </div>
    ))
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        跳到主要內容
      </a>

      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <button type="button" className="brand" onClick={() => navigate('/home')}>
          <span className="brand-flag" aria-hidden="true">🇫🇷</span>
          <span className="brand-text">
            <span className="brand-name">法文學習</span>
            <span className="brand-sub">Apprendre le français</span>
          </span>
        </button>

        <nav className="nav" aria-label="主要導覽">
          {renderNav(() => setMenuOpen(false))}
        </nav>

        <p className="sidebar-foot">
          <kbd>/</kbd> 快速搜尋 · 進度儲存在這台裝置
        </p>
      </aside>

      {menuOpen && (
        <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <div className="content">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label="開啟選單"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
          <span className="topbar-title">
            <span aria-hidden="true">{active.icon}</span> {active.label}
          </span>
          <div className="topbar-actions">
            {speaking && (
              <button type="button" className="btn btn-sm btn-ghost stop-btn" onClick={stopSpeaking}>
                ■ 停止播放
              </button>
            )}
            <button
              type="button"
              className="icon-btn"
              aria-label="搜尋"
              onClick={() => navigate('/search')}
            >
              🔍
            </button>
            <div className="settings-anchor" ref={settingsRef}>
              <button
                type="button"
                className="icon-btn"
                aria-label="設定"
                aria-expanded={settingsOpen}
                onClick={(e) => {
                  e.stopPropagation()
                  setSettingsOpen((o) => !o)
                }}
              >
                ⚙️
              </button>
              {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
            </div>
          </div>
        </header>

        <main id="main" className="view" key={route.tab}>
          {route.tab === 'home' && <HomeView cards={cards} />}
          {route.tab === 'course' && <CourseView route={route} />}
          {route.tab === 'lessons' && <LessonsView route={route} />}
          {route.tab === 'cards' && <CardsView cards={cards} reload={reload} route={route} />}
          {route.tab === 'review' && <ReviewView cards={cards} reload={reload} route={route} />}
          {route.tab === 'quiz' && <QuizView cards={cards} route={route} />}
          {route.tab === 'bank' && <BankView cards={cards} reload={reload} />}
          {route.tab === 'units' && <UnitsView route={route} />}
          {route.tab === 'grammar' && <GrammarView route={route} />}
          {route.tab === 'verbs' && <VerbsView route={route} />}
          {route.tab === 'dialogues' && <DialoguesView route={route} />}
          {route.tab === 'search' && <SearchView cards={cards} reload={reload} route={route} />}
        </main>
      </div>

      <nav className="bottomnav" aria-label="快速導覽">
        {BOTTOM_NAV.map((item) => (
          <button
            key={item.tab}
            type="button"
            className={item.tab === route.tab ? 'bottomnav-item active' : 'bottomnav-item'}
            aria-current={item.tab === route.tab ? 'page' : undefined}
            onClick={() => navigate(item.path)}
          >
            <span className="bottomnav-icon" aria-hidden="true">
              {item.icon}
              {item.badge === 'due' && dueCount > 0 && <span className="dot" />}
            </span>
            <span className="bottomnav-label">{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className="bottomnav-item"
          aria-label="更多"
          onClick={() => setMenuOpen(true)}
        >
          <span className="bottomnav-icon" aria-hidden="true">☰</span>
          <span className="bottomnav-label">更多</span>
        </button>
      </nav>
    </div>
  )
}
