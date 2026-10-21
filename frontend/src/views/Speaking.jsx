import { useMemo, useState } from 'react'
import speaking from '../data/speaking.json'
import { navigate } from '../router'
import { speakFrench } from '../speech'
import { PageHeader, PlayAllButton, Segmented, SpeakButton, WordText } from '../ui'

const { coach, pairs, words, texts } = speaking
const TAGS = [...new Set(words.map((w) => w.tag))]

/* ----------------------------- practice marks ----------------------------- */
// Which words still need work. Kept here (not in srs.js) because this is a
// different kind of record: "my French friend said this one is still off",
// not a spaced-repetition schedule.

const K_MARKS = 'fl_speak_marks'

function readMarks() {
  try {
    return JSON.parse(localStorage.getItem(K_MARKS) || '{}')
  } catch {
    return {}
  }
}
function writeMark(fr, value) {
  const m = readMarks()
  if (value) m[fr] = value
  else delete m[fr]
  try {
    localStorage.setItem(K_MARKS, JSON.stringify(m))
  } catch {
    /* storage unavailable — marks just won't persist this session */
  }
  return m
}

/* ------------------------------- coach card ------------------------------- */

function CoachCard({ friendMode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? 'coach open' : 'coach'}>
      <button type="button" className="coach-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="coach-flag" aria-hidden="true">🇫🇷</span>
        <span className="coach-title">{coach.title}</span>
        <span className="coach-sub">{friendMode ? coach.intro : coach.zhTitle}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="coach-body">
          <p className="coach-intro">{coach.intro}</p>
          {!friendMode && <p className="coach-intro zh">{coach.zhIntro}</p>}

          <h4 className="coach-h">Comment m'aider</h4>
          <ol className="coach-rules">
            {coach.rules.map((r, i) => (
              <li key={i}>
                <span className="cr-fr">{r.fr}</span>
                {!friendMode && <span className="cr-zh">{r.zh}</span>}
              </li>
            ))}
          </ol>

          <h4 className="coach-h">我可以這樣開口請他幫忙</h4>
          <ul className="coach-asks">
            {coach.asks.map((a, i) => (
              <li key={i}>
                <button type="button" className="ask-play" onClick={() => speakFrench(a.fr)}>🔊</button>
                <span className="ask-fr">{a.fr}</span>
                {!friendMode && <span className="ask-zh">{a.zh}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* -------------------------------- word tab -------------------------------- */

function WordTab({ friendMode }) {
  const [tag, setTag] = useState('all')
  const [onlyTodo, setOnlyTodo] = useState(false)
  const [marks, setMarks] = useState(readMarks)

  const shown = useMemo(() => {
    let list = tag === 'all' ? words : words.filter((w) => w.tag === tag)
    if (onlyTodo) list = list.filter((w) => marks[w.fr] === 'todo')
    return list
  }, [tag, onlyTodo, marks])

  const todoCount = Object.values(marks).filter((v) => v === 'todo').length

  function mark(fr, value) {
    setMarks(writeMark(fr, marks[fr] === value ? null : value))
  }

  return (
    <>
      <div className="sp-filters">
        <button
          type="button"
          className={tag === 'all' ? 'chip active' : 'chip'}
          onClick={() => setTag('all')}
        >
          全部 {words.length}
        </button>
        {TAGS.map((t) => (
          <button key={t} type="button" className={tag === t ? 'chip active' : 'chip'} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
        {todoCount > 0 && (
          <button
            type="button"
            className={onlyTodo ? 'chip active todo' : 'chip todo'}
            onClick={() => setOnlyTodo((o) => !o)}
          >
            ✗ 要再練 {todoCount}
          </button>
        )}
      </div>

      <div className="sp-actions">
        <PlayAllButton lines={shown.map((w) => w.fr)} className="btn btn-sm" />
        <span className="muted">{shown.length} 個字 · 唸給朋友聽，他說對就按 ✓，不對按 ✗</span>
      </div>

      <div className="wcard-grid">
        {shown.map((w) => {
          const m = marks[w.fr]
          return (
            <div key={w.fr} className={m ? `wcard ${m}` : 'wcard'}>
              <button type="button" className="wcard-fr" onClick={() => speakFrench(w.fr)} title="點一下唸出來">
                {w.fr}
              </button>

              {!friendMode && (
                <>
                  <p className="wcard-zy">{w.zy}</p>
                  <p className="wcard-zh">{w.zh}</p>
                  <p className="wcard-why">{w.why}</p>
                </>
              )}

              <div className="wcard-mark">
                <button
                  type="button"
                  className={m === 'ok' ? 'mk ok on' : 'mk ok'}
                  title="唸對了"
                  onClick={() => mark(w.fr, 'ok')}
                >
                  ✓
                </button>
                <button
                  type="button"
                  className={m === 'todo' ? 'mk todo on' : 'mk todo'}
                  title="還要再練"
                  onClick={() => mark(w.fr, 'todo')}
                >
                  ✗
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ------------------------------- pairs tab -------------------------------- */

function PairsTab({ friendMode }) {
  return (
    <>
      <p className="sp-lead">
        ★ 最小對立對是練發音最有效的工具：請朋友隨機唸 A 或 B，你猜他唸的是哪一個；
        反過來你唸，讓他告訴你他「聽到」的是哪一個。
      </p>
      <div className="pair-list">
        {pairs.map((p, i) => (
          <div key={i} className="pair">
            <div className="pair-side">
              <button type="button" className="pair-fr" onClick={() => speakFrench(p.a)}>{p.a}</button>
              {!friendMode && <span className="pair-zy">{p.za}</span>}
            </div>
            <span className="pair-vs" aria-hidden="true">↔</span>
            <div className="pair-side">
              <button type="button" className="pair-fr" onClick={() => speakFrench(p.b)}>{p.b}</button>
              {!friendMode && <span className="pair-zy">{p.zb}</span>}
            </div>
            {!friendMode && (
              <div className="pair-note">
                <span className="pair-zh">{p.zh}</span>
                <span className="pair-why">{p.why}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

/* -------------------------------- text tab -------------------------------- */

function TextTab({ friendMode, route }) {
  const picked = texts.find((t) => t.id === route.segments[2]) ?? texts[0]

  return (
    <div className="split">
      <nav className="split-list" aria-label="文章列表">
        {texts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === picked.id ? 'split-item active' : 'split-item'}
            onClick={() => navigate(`/speaking/texts/${encodeURIComponent(t.id)}`)}
          >
            <span className="split-item-title">{t.title}</span>
            <span className="split-item-sub">{friendMode ? t.focus : t.zhTitle}</span>
          </button>
        ))}
      </nav>

      <div className="split-main">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{picked.title}</h2>
              <p className="panel-sub">
                {friendMode ? picked.focus : `${picked.zhTitle} · 練習重點：${picked.focus}`}
                {' · '}
                {picked.level}
              </p>
            </div>
            <div className="panel-actions">
              <PlayAllButton lines={picked.lines.map((l) => l.fr)} className="btn" />
            </div>
          </div>

          {!friendMode && picked.note && <p className="sp-note">{picked.note}</p>}

          <ol className="read-list">
            {picked.lines.map((l, i) => (
              <li key={i} className="read-line">
                <span className="read-n">{i + 1}</span>
                <div className="read-text">
                  <p className="read-fr">
                    <WordText text={l.fr} />
                  </p>
                  {!friendMode && <p className="read-zh">{l.zh}</p>}
                </div>
                <SpeakButton text={l.fr} label={`唸「${l.fr}」`} />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

/* --------------------------------- shell ---------------------------------- */

export default function SpeakingView({ route }) {
  const tab = ['words', 'pairs', 'texts'].includes(route.segments[1]) ? route.segments[1] : 'words'
  // Hides every Chinese column so the screen can be handed to a French speaker.
  const [friendMode, setFriendMode] = useState(false)

  return (
    <div className={friendMode ? 'speaking friend' : 'speaking'}>
      <PageHeader
        icon="🗣️"
        title="發音練習"
        description="挑出課程裡最難唸的字和一些日常短文，拿給法國朋友聽、請他糾正。滑過句子裡的單字可以查字典。"
        actions={
          <button
            type="button"
            className={friendMode ? 'btn btn-primary' : 'btn'}
            aria-pressed={friendMode}
            onClick={() => setFriendMode((f) => !f)}
          >
            {friendMode ? '🇫🇷 朋友模式（已開啟）' : '🇫🇷 切到朋友模式'}
          </button>
        }
      />

      {friendMode && (
        <p className="friend-banner">
          Mode « ami » : le chinois est masqué. Écoute et corrige-moi, s'il te plaît !
          <span className="fb-zh">已隱藏所有中文，可以直接把畫面給朋友看</span>
        </p>
      )}

      <CoachCard friendMode={friendMode} />

      <div className="filter-bar">
        <Segmented
          ariaLabel="練習類型"
          options={[
            { key: 'words', label: `🔤 單字 ${words.length}` },
            { key: 'pairs', label: `⚖️ 對立對 ${pairs.length}` },
            { key: 'texts', label: `📄 短文 ${texts.length}` },
          ]}
          value={tab}
          onChange={(k) => navigate(`/speaking/${k}`)}
        />
      </div>

      {tab === 'words' && <WordTab friendMode={friendMode} />}
      {tab === 'pairs' && <PairsTab friendMode={friendMode} />}
      {tab === 'texts' && <TextTab friendMode={friendMode} route={route} />}
    </div>
  )
}
