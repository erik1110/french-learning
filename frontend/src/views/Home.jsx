import { useMemo, useState } from 'react'
import {
  COURSE_FLAT,
  COURSE_LESSON_COUNT,
  LESSONS,
  getDoneLessons,
  nextCourseLesson,
} from '../store'
import { countsFor, getGoal, getStreak, recentActivity, todayStats } from '../srs'
import { navigate } from '../router'
import { ProgressBar, ProgressRing, SearchField } from '../ui'

const SHORTCUTS = [
  { path: '/cards', icon: '📇', label: '單字卡', desc: 'A1–B1 主題單字' },
  { path: '/quiz', icon: '✏️', label: '牛刀小試', desc: '三種測驗模式' },
  { path: '/grammar', icon: '📘', label: '文法教學', desc: '規則與例句發音' },
  { path: '/verbs', icon: '🔧', label: '動詞變化', desc: '三大時態查詢' },
  { path: '/dialogues', icon: '💬', label: '情境對話', desc: '真實場景會話' },
  { path: '/units', icon: '🔢', label: '單元主題', desc: '數字、時間、日期' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return { fr: 'Bonjour', zh: '早安' }
  if (h < 18) return { fr: 'Bon après-midi', zh: '午安' }
  return { fr: 'Bonsoir', zh: '晚安' }
}

function frenchDate() {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())
  } catch {
    return ''
  }
}

export default function HomeView({ cards }) {
  const [q, setQ] = useState('')

  const done = useMemo(() => getDoneLessons(), [])
  const doneCount = COURSE_FLAT.filter((l) => done.has(l.id)).length
  const next = nextCourseLesson(done)
  const counts = useMemo(() => countsFor(cards), [cards])
  const today = todayStats()
  const goal = getGoal()
  const streak = getStreak()
  const activity = useMemo(() => recentActivity(14), [])
  const maxActivity = Math.max(1, ...activity.map((a) => a.reviews))
  const bankCount = cards.filter((c) => c.unfamiliar || c.custom).length
  const latest = useMemo(() => [...LESSONS].sort((a, b) => (a.date < b.date ? 1 : -1))[0], [])
  const hello = greeting()

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="hero-date">{frenchDate()}</p>
          <h1 className="hero-title">
            {hello.fr} ! <span className="hero-title-zh">{hello.zh}</span>
          </h1>
          <p className="hero-sub">今天想學什麼？輸入中文或法文，一次找出單字、文法、對話與課程。</p>
        </div>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="搜尋：國籍、有、游泳、時間…"
          onSubmit={(v) => v.trim() && navigate(`/search?q=${encodeURIComponent(v.trim())}`)}
        />
      </section>

      <div className="home-grid">
        <section className="panel today-panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">今天的學習</h2>
              <p className="panel-sub">
                {counts.due > 0
                  ? `有 ${counts.due} 張單字到了該複習的時間`
                  : today.reviews > 0
                    ? '今天的複習已經清空，做得好！'
                    : '還沒開始，先來 5 分鐘吧'}
              </p>
            </div>
          </div>

          <div className="today-body">
            <ProgressRing
              value={today.reviews}
              max={goal}
              caption="今日複習"
              sub={`目標 ${goal} 張`}
            />
            <div className="today-facts">
              <div className="fact">
                <span className="fact-num">🔥 {streak}</span>
                <span className="fact-label">連續學習天數</span>
              </div>
              <div className="fact">
                <span className="fact-num">{counts.due}</span>
                <span className="fact-label">待複習</span>
              </div>
              <div className="fact">
                <span className="fact-num">{counts.mastered}</span>
                <span className="fact-label">已熟悉</span>
              </div>
            </div>
          </div>

          <div className="today-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/review')}>
              {counts.due > 0 ? `開始複習 ${counts.due} 張 →` : '開始今天的複習 →'}
            </button>
            <button type="button" className="btn" onClick={() => navigate('/quiz')}>
              ✏️ 做測驗
            </button>
          </div>

          <div className="activity" aria-label="最近 14 天複習量">
            {activity.map((a) => (
              <span
                key={a.date}
                className={a.reviews > 0 ? 'activity-bar on' : 'activity-bar'}
                style={{ '--h': `${Math.round((a.reviews / maxActivity) * 100)}%` }}
                title={`${a.date}：${a.reviews} 張`}
              />
            ))}
            <span className="activity-label">近 14 天</span>
          </div>
        </section>

        <section className="panel continue-panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">🗺️ 繼續學習路徑</h2>
              <p className="panel-sub">
                已完成 {doneCount} / {COURSE_LESSON_COUNT} 課
              </p>
            </div>
          </div>

          <ProgressBar value={doneCount} max={COURSE_LESSON_COUNT} label="學習路徑進度" />

          {next && (
            <button
              type="button"
              className="next-lesson"
              onClick={() => navigate(`/course/${encodeURIComponent(next.id)}`)}
            >
              <span className="next-badge">
                第 {next.number} 課{done.has(next.id) ? '（已完成）' : ''}
              </span>
              <span className="next-title">{next.title}</span>
              <span className="next-goal">🎯 {next.goal}</span>
              <span className="next-cta">
                {doneCount === 0 ? '從這裡開始 →' : '繼續這一課 →'}
              </span>
            </button>
          )}
        </section>
      </div>

      <div className="stat-row">
        <button type="button" className="stat-tile" onClick={() => navigate('/bank')}>
          <span className="stat-num">{bankCount}</span>
          <span className="stat-label">⭐ 我的單字庫</span>
        </button>
        <button type="button" className="stat-tile" onClick={() => navigate('/cards')}>
          <span className="stat-num">{cards.length}</span>
          <span className="stat-label">📇 可學單字總數</span>
        </button>
        <div className="stat-tile static">
          <span className="stat-num">{counts.studied}</span>
          <span className="stat-label">🧠 已開始學的字</span>
        </div>
        <div className="stat-tile static">
          <span className="stat-num">{today.learned}</span>
          <span className="stat-label">🌱 今天新學</span>
        </div>
      </div>

      {latest && (
        <button
          type="button"
          className="latest-lesson"
          onClick={() => navigate(`/lessons/${encodeURIComponent(latest.id)}`)}
        >
          <span className="latest-tag">📅 最新上課內容</span>
          <span className="latest-title">{latest.title}</span>
          <span className="latest-sub">
            {latest.date} · {latest.summary}
          </span>
          <span className="latest-cta">複習這一課 →</span>
        </button>
      )}

      <h2 className="section-title">快速進入</h2>
      <div className="shortcut-grid">
        {SHORTCUTS.map((s) => (
          <button key={s.path} type="button" className="shortcut" onClick={() => navigate(s.path)}>
            <span className="shortcut-icon" aria-hidden="true">{s.icon}</span>
            <span className="shortcut-text">
              <span className="shortcut-label">{s.label}</span>
              <span className="shortcut-desc">{s.desc}</span>
            </span>
            <span className="shortcut-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </>
  )
}
