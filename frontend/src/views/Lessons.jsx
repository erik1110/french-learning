import { useEffect, useMemo, useRef, useState } from 'react'
import { LESSONS, LESSON_TOPICS, getReviewedLessons, toggleLessonReviewed, topicOfLesson } from '../store'
import { navigate } from '../router'
import {
  EmptyState,
  PageHeader,
  PlayAllButton,
  SearchField,
  Segmented,
  StudyItems,
  SpeakButton,
} from '../ui'
import { speakFrench } from '../speech'

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function pad2(n) {
  return String(n).padStart(2, '0')
}

function LessonCalendar({ byDate, selected, onPick }) {
  const [cursor, setCursor] = useState(() => {
    const d = selected ? new Date(selected.date) : new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  function shiftMonth(delta) {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7 // 0 = Mon
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="cal">
      <div className="cal-header">
        <button type="button" className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="上個月">
          ‹
        </button>
        <span className="cal-title">
          {cursor.y} 年 {cursor.m + 1} 月
        </span>
        <button type="button" className="cal-nav" onClick={() => shiftMonth(1)} aria-label="下個月">
          ›
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-day empty" />
          const ds = `${cursor.y}-${pad2(cursor.m + 1)}-${pad2(day)}`
          const items = byDate[ds] || []
          const has = items.length > 0
          const isSel = ds === selected?.date

          return (
            <button
              key={ds}
              type="button"
              disabled={!has}
              className={`cal-day${has ? ' has' : ''}${isSel ? ' selected' : ''}`}
              title={has ? items.map((l) => l.title).join('、') : undefined}
              onClick={() => has && onPick(items[0].id)}
            >
              <span className="cal-num">{day}</span>
              {has && <span className="cal-dot" />}
              {has && items.length > 1 && <span className="cal-badge">{items.length}</span>}
            </button>
          )
        })}
      </div>

      <p className="cal-legend">
        <span className="cal-dot" /> 有上課內容，點日期看當天的單元
      </p>
    </div>
  )
}

/* ------------------------------ topic browser ----------------------------- */

function TopicList({ current, reviewed, onPick }) {
  const total = LESSON_TOPICS.reduce((n, t) => n + t.lessons.length, 0)
  const done = LESSON_TOPICS.reduce((n, t) => n + t.lessons.filter((l) => reviewed.has(l.id)).length, 0)
  const navRef = useRef(null)
  // Keep the current lesson visible inside the list (without scrolling the page).
  useEffect(() => {
    const nav = navRef.current
    const el = nav?.querySelector('.topic-item.active')
    if (!nav || !el) return
    const top = el.offsetTop - nav.offsetTop
    if (top < nav.scrollTop || top + el.offsetHeight > nav.scrollTop + nav.clientHeight) {
      nav.scrollTop = top - nav.clientHeight / 3
    }
  }, [current])
  return (
    <nav ref={navRef} className="split-list topic-list" aria-label="依主題">
      <p className="topic-overall">
        建議由上往下讀，每個主題內也照順序。已複習 {done} / {total} 課
      </p>
      {LESSON_TOPICS.map((t, ti) => {
        const n = t.lessons.filter((l) => reviewed.has(l.id)).length
        return (
          <div key={t.id} className="topic-group">
            <div className="topic-head">
              <span className="topic-title">
                {ti + 1}. {t.icon} {t.title}
              </span>
              <span className={n === t.lessons.length ? 'topic-count full' : 'topic-count'}>
                {n}/{t.lessons.length}
              </span>
            </div>
            <p className="topic-goal">{t.goal}</p>
            {t.lessons.map((l, i) => (
              <button
                key={l.id}
                type="button"
                className={l.id === current ? 'split-item topic-item active' : 'split-item topic-item'}
                onClick={() => onPick(l.id)}
              >
                <span className={reviewed.has(l.id) ? 'topic-mark done' : 'topic-mark'} aria-hidden="true">
                  {reviewed.has(l.id) ? '✓' : i + 1}
                </span>
                <span className="topic-item-text">
                  <span className="split-item-title">{l.title}</span>
                  <span className="split-item-sub">{l.focus}</span>
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function TopicNav({ lesson, reviewed, onToggle, onPick }) {
  const where = topicOfLesson(lesson.id)
  const isDone = reviewed.has(lesson.id)
  const prev = where?.topic.lessons[where.index - 1]
  const next = where?.topic.lessons[where.index + 1]
  // After the last lesson of a topic, point to the first lesson of the next topic.
  const ti = where ? LESSON_TOPICS.indexOf(where.topic) : -1
  const nextTopic = !next && ti !== -1 ? LESSON_TOPICS[ti + 1] : null
  return (
    <div className="topic-nav">
      {where && (
        <p className="topic-nav-where">
          {where.topic.icon} {where.topic.title} · 第 {where.index + 1} / {where.topic.lessons.length} 課
          <span className="muted"> — {where.topic.lessons[where.index].focus}</span>
        </p>
      )}
      <div className="topic-nav-actions">
        <button type="button" className="btn btn-sm" disabled={!prev} onClick={() => prev && onPick(prev.id)}>
          ‹ 上一課
        </button>
        <button
          type="button"
          className={isDone ? 'btn btn-sm topic-done on' : 'btn btn-sm topic-done'}
          aria-pressed={isDone}
          onClick={() => onToggle(lesson.id)}
        >
          {isDone ? '✓ 已複習' : '標記為已複習'}
        </button>
        {next ? (
          <button type="button" className="btn btn-sm" onClick={() => onPick(next.id)}>
            下一課 ›
          </button>
        ) : nextTopic ? (
          <button type="button" className="btn btn-sm" onClick={() => onPick(nextTopic.lessons[0].id)}>
            下一個主題：{nextTopic.icon} {nextTopic.title} ›
          </button>
        ) : (
          <button type="button" className="btn btn-sm" disabled>
            下一課 ›
          </button>
        )}
      </div>
    </div>
  )
}

/* --------------------------- end-of-lesson quiz --------------------------- */

/**
 * Options are authored with the correct answer first so the data stays easy to
 * read, which would make every question answerable without looking. Shuffle per
 * question, seeded by the lesson + index so the order holds across re-renders
 * (answering re-renders, and the list must not move under the cursor).
 */
function shuffled(options, answer, seedText) {
  let seed = 2166136261
  for (const ch of seedText) {
    seed ^= ch.charCodeAt(0)
    seed = Math.imul(seed, 16777619) >>> 0
  }
  const rand = () => {
    seed ^= (seed << 13) >>> 0
    seed >>>= 0
    seed ^= seed >>> 17
    seed ^= (seed << 5) >>> 0
    seed >>>= 0
    return seed / 2 ** 32
  }
  const out = options.map((text, i) => ({ text, correct: i === answer }))
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function QuizQuestion({ item, index, lessonId }) {
  const [picked, setPicked] = useState(null)
  const options = useMemo(
    () => shuffled(item.options, item.answer, `${lessonId}:${index}`),
    [item, index, lessonId],
  )
  const answered = picked !== null

  return (
    <li className="qz-item">
      <p className="qz-q">
        <span className="qz-num">{index + 1}</span>
        {item.q}
      </p>
      <div className="qz-options">
        {options.map((o, i) => {
          const cls = !answered
            ? 'qz-opt'
            : o.correct
              ? 'qz-opt right'
              : picked === i
                ? 'qz-opt wrong'
                : 'qz-opt dim'
          return (
            <button key={i} type="button" className={cls} disabled={answered} onClick={() => setPicked(i)}>
              <span className="qz-mark" aria-hidden="true">
                {answered ? (o.correct ? '✓' : picked === i ? '✕' : '·') : String.fromCharCode(65 + i)}
              </span>
              {o.text}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={options[picked].correct ? 'qz-why ok' : 'qz-why no'}>
          {options[picked].correct ? '✅ 答對了！' : '❌ 再看一次：'} {item.why}
        </p>
      )}
    </li>
  )
}

function LessonQuiz({ lesson }) {
  // Remount every question when the lesson changes, so answers never carry over.
  return (
    <div className="quiz-block" key={lesson.id}>
      <h3 className="block-title">✏️ 牛刀小試</h3>
      <p className="block-hint">{lesson.quiz.length} 題，點選項立刻看答案和詳解。</p>
      <ol className="qz-list">
        {lesson.quiz.map((item, i) => (
          <QuizQuestion key={i} item={item} index={i} lessonId={lesson.id} />
        ))}
      </ol>
    </div>
  )
}

/* ------------------------- pronunciation practice ------------------------- */

function LessonDrill({ lesson }) {
  const lines = lesson.drill.map((d) => d.fr)
  return (
    <div className="drill-block">
      <div className="block-head">
        <div>
          <h3 className="block-title">🔊 發音練習</h3>
          <p className="block-hint">這一課最該唸熟的 {lines.length} 句，點任一句聽發音。</p>
        </div>
        <PlayAllButton lines={lines} className="btn btn-sm" />
      </div>
      <StudyItems items={lesson.drill} numbered force="lines" />
    </div>
  )
}

export default function LessonsView({ route }) {
  const [view, setView] = useState('topics')
  const [reviewed, setReviewed] = useState(() => getReviewedLessons())
  const toggleReviewed = (id) => setReviewed(new Set(toggleLessonReviewed(id)))
  const pick = (id) => {
    navigate(`/lessons/${encodeURIComponent(id)}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const [q, setQ] = useState('')
  // Collapsed by default on narrow screens: the lesson itself is what you came
  // for, the date picker is navigation you only need between lessons.
  const [pickerOpen, setPickerOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth > 1100,
  )

  const sorted = useMemo(() => [...LESSONS].sort((a, b) => (a.date < b.date ? 1 : -1)), [])
  const byDate = useMemo(() => {
    const m = {}
    for (const l of LESSONS) (m[l.date] ||= []).push(l)
    return m
  }, [])

  const lesson = LESSONS.find((l) => l.id === route.segments[1]) ?? sorted[0]
  const needle = q.trim().toLowerCase()
  const list = sorted.filter(
    (l) => !needle || l.title.toLowerCase().includes(needle) || l.summary?.toLowerCase().includes(needle),
  )
  const sameDay = lesson ? byDate[lesson.date] ?? [] : []
  const allLines = lesson ? lesson.sections.flatMap((s) => s.items.map((it) => it.fr)) : []

  if (!lesson) {
    return <EmptyState icon="📅" title="還沒有上課紀錄" />
  }

  return (
    <>
      <PageHeader
        icon="📅"
        title="課程複習"
        description="老師上課教過的內容。「主題」把各堂課依文法主題和建議順序排好；也可以用日曆查某一天，或切到列表快速瀏覽。"
      />

      <div className="filter-bar">
        <button
          type="button"
          className={pickerOpen ? 'picker-toggle on' : 'picker-toggle'}
          aria-expanded={pickerOpen}
          onClick={() => setPickerOpen((o) => !o)}
        >
          <span aria-hidden="true">📅</span>
          {pickerOpen ? '收起日期' : '選擇日期'}
          <span className="picker-chevron" aria-hidden="true">{pickerOpen ? '◂' : '▸'}</span>
        </button>

        {pickerOpen && (
          <Segmented
            ariaLabel="檢視方式"
            options={[
              { key: 'topics', label: '📚 主題' },
              { key: 'calendar', label: '📅 日曆' },
              { key: 'list', label: '📋 列表' },
            ]}
            value={view}
            onChange={setView}
          />
        )}

        {!pickerOpen && (
          <span className="picker-now">
            {lesson.date} · {lesson.title}
          </span>
        )}
      </div>

      <div className={pickerOpen ? 'split' : 'split solo'}>
        {pickerOpen && (
        <div className="split-list-wrap">
          {view === 'topics' ? (
            <TopicList current={lesson.id} reviewed={reviewed} onPick={pick} />
          ) : view === 'calendar' ? (
            <LessonCalendar
              // remount when the selected month changes, so jumping in from
              // search lands the calendar on the right month
              key={lesson.date.slice(0, 7)}
              byDate={byDate}
              selected={lesson}
              onPick={(id) => navigate(`/lessons/${encodeURIComponent(id)}`)}
            />
          ) : (
            <>
              <SearchField value={q} onChange={setQ} placeholder="搜尋單元…" />
              <nav className="split-list" aria-label="課程列表">
                {list.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={l.id === lesson.id ? 'split-item active' : 'split-item'}
                    onClick={() => navigate(`/lessons/${encodeURIComponent(l.id)}`)}
                  >
                    <span className="split-item-sub">{l.date}</span>
                    <span className="split-item-title">{l.title}</span>
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>
        )}

        <div className="split-main">
          {sameDay.length > 1 && (
            <div className="chip-row">
              <span className="muted">{lesson.date} 當天單元：</span>
              {sameDay.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={l.id === lesson.id ? 'chip active' : 'chip'}
                  onClick={() => navigate(`/lessons/${encodeURIComponent(l.id)}`)}
                >
                  {l.title}
                </button>
              ))}
            </div>
          )}

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">{lesson.title}</h2>
                <p className="panel-sub">
                  {lesson.date} · {lesson.summary}
                </p>
              </div>
              <div className="panel-actions">
                <PlayAllButton lines={allLines} className="btn" />
              </div>
            </div>

            {lesson.sections.map((sec, i) => (
              <div key={i} className="conj-block">
                <h3 className="conj-title">{sec.heading}</h3>
                {sec.note && <p className="muted">{sec.note}</p>}
                <StudyItems items={sec.items} />
              </div>
            ))}

            {lesson.points?.length > 0 && (
              <div className="keypoints">
                <h3>📌 重點整理</h3>
                <ul>
                  {lesson.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.drill?.length > 0 && <LessonDrill lesson={lesson} />}
            {lesson.quiz?.length > 0 && <LessonQuiz lesson={lesson} />}

            <TopicNav lesson={lesson} reviewed={reviewed} onToggle={toggleReviewed} onPick={pick} />
          </section>
        </div>
      </div>
    </>
  )
}
