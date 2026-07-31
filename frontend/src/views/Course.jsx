import { useMemo, useState } from 'react'
import {
  COURSE,
  COURSE_FLAT,
  COURSE_LESSON_COUNT,
  findCourseLesson,
  findDialogue,
  findGrammar,
  findUnit,
  getDoneLessons,
  toggleLessonDone,
  vocabFor,
} from '../store'
import { navigate } from '../router'
import { speakFrenchSequence } from '../speech'
import {
  DialogueLines,
  EmptyState,
  GrammarBody,
  KeyPoints,
  PageHeader,
  PlayAllButton,
  ProgressBar,
  SpeakableItems,
  VocabItems,
} from '../ui'

const SECTION_BADGES = {
  teach: '🔤 發音教學',
  grammar: '📖 文法',
  unit: '🔢 主題',
  dialogue: '💬 對話',
  vocab: '📇 單字',
}

const VOCAB_PREVIEW_LIMIT = 24

function sectionTitle(section) {
  if (section.type === 'teach') return section.heading
  if (section.type === 'grammar') return findGrammar(section.level, section.orderIndex)?.title
  if (section.type === 'unit') return findUnit(section.id)?.title
  if (section.type === 'dialogue') return findDialogue(section.title)?.title
  if (section.type === 'vocab') return section.tag
  return null
}

function CourseSection({ section, index }) {
  const badge = <span className="course-badge">{SECTION_BADGES[section.type]}</span>
  const anchor = `sec-${index}`

  if (section.type === 'teach') {
    return (
      <section className="course-section" id={anchor}>
        <h3 className="course-section-title">
          {badge}
          <span>{section.heading}</span>
          <PlayAllButton lines={section.items.map((it) => it.fr)} className="btn btn-ghost btn-sm" />
        </h3>
        {section.note && <p className="muted">{section.note}</p>}
        <SpeakableItems items={section.items} />
      </section>
    )
  }

  if (section.type === 'grammar') {
    const g = findGrammar(section.level, section.orderIndex)
    if (!g) return null
    return (
      <section className="course-section" id={anchor}>
        <h3 className="course-section-title">
          {badge}
          <span>{g.title}</span>
          <span className="course-sub">{g.summary}</span>
        </h3>
        <GrammarBody grammar={g} />
        <button
          type="button"
          className="course-more"
          onClick={() => navigate(`/grammar/${g.level}/${g.orderIndex}`)}
        >
          📘 到「文法教學」看這個主題 →
        </button>
      </section>
    )
  }

  if (section.type === 'unit') {
    const u = findUnit(section.id)
    if (!u) return null
    return (
      <section className="course-section" id={anchor}>
        <h3 className="course-section-title">
          {badge}
          <span>{u.title}</span>
          <PlayAllButton lines={u.items.map((it) => it.fr)} className="btn btn-ghost btn-sm" />
        </h3>
        <p className="muted">{u.intro}</p>
        <SpeakableItems items={u.items} />
      </section>
    )
  }

  if (section.type === 'dialogue') {
    const d = findDialogue(section.title)
    if (!d) return null
    return (
      <section className="course-section" id={anchor}>
        <h3 className="course-section-title">
          {badge}
          <span>{d.title}</span>
          <PlayAllButton lines={d.lines.map((l) => l.french)} className="btn btn-ghost btn-sm" />
        </h3>
        <p className="muted">{d.scene}</p>
        <DialogueLines lines={d.lines} />
        <KeyPoints points={d.keyPoints} />
      </section>
    )
  }

  if (section.type === 'vocab') {
    const words = vocabFor(section.level, section.tag)
    return (
      <section className="course-section" id={anchor}>
        <h3 className="course-section-title">
          {badge}
          <span>{section.tag}</span>
          <span className="course-sub">
            {section.level} · 共 {words.length} 個字
          </span>
        </h3>
        {section.note && <p className="muted">{section.note}</p>}
        <VocabItems cards={words.slice(0, VOCAB_PREVIEW_LIMIT)} />
        <button
          type="button"
          className="course-more"
          onClick={() =>
            navigate(`/cards?level=${section.level}&tag=${encodeURIComponent(section.tag)}`)
          }
        >
          📇 用單字卡練「{section.tag}」全部 {words.length} 個字 →
        </button>
      </section>
    )
  }

  return null
}

function LessonDetail({ lesson, done, onToggleDone }) {
  const idx = COURSE_FLAT.findIndex((l) => l.id === lesson.id)
  const prev = COURSE_FLAT[idx - 1]
  const next = COURSE_FLAT[idx + 1]
  const allLines = useMemo(
    () =>
      lesson.sections.flatMap((s) =>
        s.type === 'teach' || s.type === 'unit'
          ? (s.items ?? findUnit(s.id)?.items ?? []).map((it) => it.fr)
          : [],
      ),
    [lesson],
  )

  return (
    <>
      <nav className="crumbs" aria-label="麵包屑">
        <button type="button" className="crumb-link" onClick={() => navigate('/course')}>
          ← 學習路徑
        </button>
        <span className="crumb-sep">/</span>
        <span>
          第 {lesson.stage.stage} 階段 · {lesson.stage.title}
        </span>
      </nav>

      <div className="lesson-head">
        <div>
          <p className="lesson-eyebrow">第 {lesson.number} / {COURSE_LESSON_COUNT} 課</p>
          <h1 className="page-title">{lesson.title}</h1>
          <p className="page-desc">🎯 學習目標：{lesson.goal}</p>
        </div>
        <div className="lesson-head-actions">
          {allLines.length > 0 && <PlayAllButton lines={allLines} className="btn" />}
          <button
            type="button"
            className={done ? 'btn btn-success' : 'btn btn-primary'}
            aria-pressed={done}
            onClick={() => onToggleDone(lesson.id)}
          >
            {done ? '✅ 已完成' : '☑️ 標記完成'}
          </button>
        </div>
      </div>

      <nav className="lesson-toc" aria-label="本課內容">
        {lesson.sections.map((s, i) => {
          const title = sectionTitle(s)
          if (!title) return null
          return (
            <a key={i} className="toc-item" href={`#/course/${lesson.id}`} onClick={(e) => {
              e.preventDefault()
              document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}>
              <span className="toc-type">{SECTION_BADGES[s.type]?.slice(0, 2)}</span>
              {title}
            </a>
          )
        })}
      </nav>

      <div className="panel lesson-body">
        {lesson.sections.map((sec, i) => (
          <CourseSection key={i} section={sec} index={i} />
        ))}
        <KeyPoints title="💡 學習提示" points={lesson.tips} />
      </div>

      <div className="pager">
        {prev ? (
          <button type="button" className="pager-btn" onClick={() => navigate(`/course/${prev.id}`)}>
            <span className="pager-dir">← 上一課</span>
            <span className="pager-title">{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            type="button"
            className="pager-btn primary"
            onClick={() => navigate(`/course/${next.id}`)}
          >
            <span className="pager-dir">下一課 →</span>
            <span className="pager-title">{next.title}</span>
          </button>
        ) : (
          <span />
        )}
      </div>
    </>
  )
}

export default function CourseView({ route }) {
  const [version, setVersion] = useState(0)
  const done = useMemo(() => getDoneLessons(), [version])
  const lessonId = route.segments[1]
  const lesson = lessonId ? findCourseLesson(lessonId) : null
  const doneCount = COURSE_FLAT.filter((l) => done.has(l.id)).length

  function toggleDone(id) {
    toggleLessonDone(id)
    setVersion((v) => v + 1)
  }

  if (lessonId && !lesson) {
    return (
      <EmptyState
        icon="🗺️"
        title="找不到這一課"
        action={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/course')}>
            回學習路徑
          </button>
        }
      />
    )
  }

  if (lesson) {
    return <LessonDetail lesson={lesson} done={done.has(lesson.id)} onToggleDone={toggleDone} />
  }

  return (
    <>
      <PageHeader
        icon="🗺️"
        title="學習路徑"
        description="從字母發音到真實對話，照順序一課一課學。每課都有教學、單字、文法與對話。"
      />

      <div className="panel course-overview">
        <div className="course-overview-text">
          <strong>從零開始 → 基礎對話</strong>
          <span className="muted">
            已完成 {doneCount} / {COURSE_LESSON_COUNT} 課
          </span>
        </div>
        <ProgressBar value={doneCount} max={COURSE_LESSON_COUNT} label="學習路徑進度" />
      </div>

      {COURSE.map((stage) => {
        const stageDone = stage.lessons.filter((l) => done.has(l.id)).length
        return (
          <section key={stage.stage} className="stage">
            <div className="stage-head">
              <h2>
                <span className="stage-num">第 {stage.stage} 階段</span>
                {stage.title}
              </h2>
              <span className={stageDone === stage.lessons.length ? 'stage-count done' : 'stage-count'}>
                {stageDone} / {stage.lessons.length}
              </span>
            </div>
            <p className="muted">{stage.description}</p>

            <div className="lesson-rows">
              {stage.lessons.map((l) => {
                const meta = COURSE_FLAT.find((f) => f.id === l.id)
                const isDone = done.has(l.id)
                return (
                  <button
                    key={l.id}
                    type="button"
                    className={isDone ? 'lesson-row done' : 'lesson-row'}
                    onClick={() => navigate(`/course/${l.id}`)}
                  >
                    <span className="lesson-num">{isDone ? '✓' : meta?.number}</span>
                    <span className="lesson-text">
                      <span className="lesson-title">{l.title}</span>
                      <span className="lesson-goal">{l.goal}</span>
                    </span>
                    <span className="lesson-arrow" aria-hidden="true">›</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </>
  )
}
