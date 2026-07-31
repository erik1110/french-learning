import { useMemo, useState } from 'react'
import { LESSONS } from '../store'
import { navigate } from '../router'
import { EmptyState, PageHeader, PlayAllButton, SearchField, Segmented, SpeakableItems } from '../ui'

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

export default function LessonsView({ route }) {
  const [view, setView] = useState('calendar')
  const [q, setQ] = useState('')

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
        description="老師上課教過的內容，依日期整理。用日曆查某一天，或切到列表快速瀏覽。"
      />

      <div className="filter-bar">
        <Segmented
          ariaLabel="檢視方式"
          options={[
            { key: 'calendar', label: '📅 日曆' },
            { key: 'list', label: '📋 列表' },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <div className="split">
        <div className="split-list-wrap">
          {view === 'calendar' ? (
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
                <SpeakableItems items={sec.items} />
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
          </section>
        </div>
      </div>
    </>
  )
}
