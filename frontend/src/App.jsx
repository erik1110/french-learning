import { useEffect, useMemo, useState } from 'react'
import {
  LEVELS,
  GRAMMAR,
  DIALOGUES,
  DIALOGUE_CATEGORIES,
  UNITS,
  VERBS,
  LESSONS,
  COURSE,
  COURSE_LESSON_COUNT,
  findGrammar,
  findUnit,
  findDialogue,
  vocabFor,
  getDoneLessons,
  toggleLessonDone,
  conjugate,
  categoriesFor,
  searchAll,
  loadCards,
  toggleUnfamiliar,
  addCustomCard,
  updateCustomCard,
  deleteCustomCard,
} from './store'
import {
  speakFrench,
  speakFrenchSequence,
  stopSpeaking,
  isSpeechSupported,
  getFrenchVoices,
  getRate,
  setRate as persistRate,
  getVoiceURI,
  setVoiceURI as persistVoiceURI,
} from './speech'

const TABS = [
  { key: 'search', label: '🔍 搜尋' },
  { key: 'course', label: '🗺️ 學習路徑' },
  { key: 'cards', label: '📇 單字卡' },
  { key: 'lessons', label: '📚 課程複習' },
  { key: 'random', label: '🎲 隨機複習' },
  { key: 'quiz', label: '✏️ 牛刀小試' },
  { key: 'bank', label: '⭐ 我的單字庫' },
  { key: 'units', label: '🔢 單元主題' },
  { key: 'grammar', label: '📖 文法教學' },
  { key: 'verbs', label: '🔧 動詞變化' },
  { key: 'dialogues', label: '💬 情境對話' },
]

const LINKS = [
  { label: '🇹🇼 個人部落格', url: 'https://erik1110.com/' },
  { label: '🇯🇵 日語學習', url: 'https://erik1110.com/japanese-learning/' },
]

function LinksMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [open])

  return (
    <div className="links-menu" onClick={(e) => e.stopPropagation()}>
      <button
        className="links-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        🔗 其他連結 <span className="chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="links-dropdown">
          {LINKS.map((l) => (
            <a
              key={l.url}
              className="links-item"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function SpeechSettings() {
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURIState] = useState(getVoiceURI())
  const [rate, setRateState] = useState(getRate())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isSpeechSupported()) return
    const load = () => setVoices(getFrenchVoices())
    load()
    const synth = window.speechSynthesis
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [])

  if (!isSpeechSupported()) return null

  function changeRate(r) {
    setRateState(r)
    persistRate(r)
  }
  function changeVoice(uri) {
    setVoiceURIState(uri)
    persistVoiceURI(uri)
  }

  return (
    <div className="speech-settings">
      <button className="speech-toggle" onClick={() => setOpen((o) => !o)}>
        🔊 發音設定 · 速度 {rate.toFixed(1)}×
        <span className="chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="speech-panel">
          <label className="speech-row">
            <span className="speech-label">速度 {rate.toFixed(1)}×</span>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.1"
              value={rate}
              onChange={(e) => changeRate(parseFloat(e.target.value))}
            />
          </label>

          <label className="speech-row">
            <span className="speech-label">音色</span>
            <select value={voiceURI} onChange={(e) => changeVoice(e.target.value)}>
              <option value="">自動（系統預設法語）</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}（{v.lang}）
                </option>
              ))}
            </select>
          </label>

          {voices.length === 0 && (
            <p className="muted">此瀏覽器目前沒有偵測到法語音色，將使用系統預設發音。</p>
          )}

          <button
            className="speech-test"
            onClick={() => speakFrench('Bonjour ! Aujourd’hui, on est jeudi.')}
          >
            ▶ 試聽
          </button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('course')
  // bumped whenever localStorage changes, to re-read cards everywhere
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  // set by the course view to open the cards tab pre-filtered to a category
  const [cardsPreset, setCardsPreset] = useState(null)

  const cards = useMemo(() => loadCards(), [version])

  function goVocab(level, tag) {
    stopSpeaking()
    setCardsPreset({ level, tag, ts: Date.now() })
    setTab('cards')
  }

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <h1>🇫🇷 法文學習</h1>
          <LinksMenu />
        </div>
        <p className="sub">A1 / A2 / B1 · 單字卡 · 文法 · 情境對話</p>
      </header>

      {!isSpeechSupported() && (
        <p className="warn">⚠️ 此瀏覽器不支援語音合成，發音功能無法使用。</p>
      )}

      <SpeechSettings />

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={t.key === tab ? 'tab active' : 'tab'}
            onClick={() => {
              stopSpeaking()
              setTab(t.key)
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'search' && <SearchView cards={cards} reload={reload} goVocab={goVocab} />}
      {tab === 'course' && <CourseView goVocab={goVocab} />}
      {tab === 'cards' && <CardsView cards={cards} reload={reload} preset={cardsPreset} />}
      {tab === 'lessons' && <LessonsView />}
      {tab === 'random' && <RandomView cards={cards} reload={reload} />}
      {tab === 'quiz' && <QuizView cards={cards} />}
      {tab === 'bank' && <BankView cards={cards} reload={reload} />}
      {tab === 'units' && <UnitsView />}
      {tab === 'grammar' && <GrammarView />}
      {tab === 'verbs' && <VerbsView />}
      {tab === 'dialogues' && <DialoguesView />}
    </div>
  )
}

/* ----------------------------- shared card UI ---------------------------- */

function GenderBadge({ gender }) {
  if (gender !== 'm' && gender !== 'f') return null
  const isMasc = gender === 'm'
  return (
    <span className={isMasc ? 'gender masc' : 'gender fem'}>
      {isMasc ? 'm · 陽性 (le)' : 'f · 陰性 (la)'}
    </span>
  )
}

function Flashcard({ card, onToggleUnfamiliar, onDelete, onSave }) {
  const [flipped, setFlipped] = useState(false)
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <CardEditor
        card={card}
        onCancel={() => setEditing(false)}
        onSubmit={(patch) => {
          onSave(card.id, patch)
          setEditing(false)
        }}
      />
    )
  }

  return (
    <div className={card.unfamiliar ? 'card marked' : 'card'}>
      <button
        className={card.unfamiliar ? 'star on' : 'star'}
        title={card.unfamiliar ? '從單字庫移除' : '標示為不熟，加入單字庫'}
        onClick={() => {
          onToggleUnfamiliar(card.id)
        }}
      >
        {card.unfamiliar ? '★' : '☆'}
      </button>

      <div className="card-body" onClick={() => setFlipped((f) => !f)}>
        {!flipped ? (
          <>
            <div className="french">{card.french}</div>
            <div className="badges">
              <GenderBadge gender={card.gender} />
              {card.partOfSpeech && <span className="pos">{card.partOfSpeech}</span>}
              {card.tag && <span className="tagchip">{card.tag}</span>}
            </div>
            <div className="hint">點擊看翻譯與例句</div>
          </>
        ) : (
          <>
            <div className="translation">{card.translation}</div>
            <GenderBadge gender={card.gender} />
            {card.example && (
              <div className="example-block">
                <div className="example">
                  <span>🇫🇷 {card.example}</span>
                  <button
                    className="speak-mini"
                    title="唸出例句"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakFrench(card.example)
                    }}
                  >
                    🔊
                  </button>
                </div>
                {card.exampleTranslation && (
                  <div className="example-zh">{card.exampleTranslation}</div>
                )}
              </div>
            )}
            <div className="hint">點擊看法文</div>
          </>
        )}
      </div>

      <div className="card-actions">
        <button className="speak" title="唸出單字" onClick={() => speakFrench(card.french)}>
          🔊 單字發音
        </button>
        {card.custom && onSave && (
          <button className="edit" title="編輯" onClick={() => setEditing(true)}>
            ✏️
          </button>
        )}
        {card.custom && onDelete && (
          <button className="del" title="刪除" onClick={() => onDelete(card.id)}>
            🗑
          </button>
        )}
      </div>
    </div>
  )
}

function CardEditor({ card, onSubmit, onCancel }) {
  const [f, setF] = useState({
    french: card.french || '',
    translation: card.translation || '',
    gender: card.gender || '',
    example: card.example || '',
    exampleTranslation: card.exampleTranslation || '',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  return (
    <div className="card editing">
      <input placeholder="法文單字 *" value={f.french} onChange={set('french')} />
      <input placeholder="中文翻譯 *" value={f.translation} onChange={set('translation')} />
      <select value={f.gender} onChange={set('gender')}>
        <option value="">性別（名詞）</option>
        <option value="m">陽性 (le)</option>
        <option value="f">陰性 (la)</option>
      </select>
      <input placeholder="法文例句" value={f.example} onChange={set('example')} />
      <input
        placeholder="例句中文翻譯"
        value={f.exampleTranslation}
        onChange={set('exampleTranslation')}
      />
      <div className="editor-actions">
        <button
          className="primary"
          onClick={() => {
            if (!f.french.trim() || !f.translation.trim()) return
            onSubmit({ ...f, gender: f.gender || null })
          }}
        >
          儲存
        </button>
        <button onClick={onCancel}>取消</button>
      </div>
    </div>
  )
}

function AddCardForm({ level, reload }) {
  const [f, setF] = useState({
    french: '',
    translation: '',
    gender: '',
    example: '',
    exampleTranslation: '',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    if (!f.french.trim() || !f.translation.trim()) return
    addCustomCard({
      french: f.french.trim(),
      translation: f.translation.trim(),
      gender: f.gender || null,
      example: f.example.trim(),
      exampleTranslation: f.exampleTranslation.trim(),
      level,
    })
    setF({ french: '', translation: '', gender: '', example: '', exampleTranslation: '' })
    reload()
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <input placeholder="法文單字 *" value={f.french} onChange={set('french')} />
      <input placeholder="中文翻譯 *" value={f.translation} onChange={set('translation')} />
      <select value={f.gender} onChange={set('gender')}>
        <option value="">性別（名詞）</option>
        <option value="m">陽性 (le)</option>
        <option value="f">陰性 (la)</option>
      </select>
      <input placeholder="法文例句（選填）" value={f.example} onChange={set('example')} />
      <input
        placeholder="例句中文翻譯（選填）"
        value={f.exampleTranslation}
        onChange={set('exampleTranslation')}
      />
      <button type="submit">+ 新增到 {level}</button>
    </form>
  )
}

/* ----------------------------- learning path ----------------------------- */

const SECTION_BADGES = {
  teach: '🔤 發音教學',
  grammar: '📖 文法',
  unit: '🔢 主題',
  dialogue: '💬 對話',
  vocab: '📇 單字',
}

const VOCAB_PREVIEW_LIMIT = 24

function SpeakableItems({ items }) {
  return (
    <div className="unit-items">
      {items.map((it, i) => (
        <button key={i} className="unit-item" title="點擊發音" onClick={() => speakFrench(it.fr)}>
          <span className="unit-fr">🔊 {it.fr}</span>
          <span className="unit-zh">{it.zh}</span>
        </button>
      ))}
    </div>
  )
}

// Article + gender info for a noun card. Returns null for non-nouns / genderless
// words. The definite article elides to l' before a vowel or (mute) h.
function genderInfo(card) {
  if (card.gender !== 'm' && card.gender !== 'f') return null
  const isMasc = card.gender === 'm'
  const startsVowel = /^[aeiouhâàéèêîïôùûAEIOUH]/.test(card.french || '')
  const def = startsVowel ? "l'" : isMasc ? 'le' : 'la'
  const indef = isMasc ? 'un' : 'une'
  return { isMasc, indef, def, label: isMasc ? '陽性' : '陰性' }
}

// Vocab list for the learning path: same look as SpeakableItems, but each noun
// carries an article + gender badge that reveals on hover (always shown on
// touch devices, which have no hover).
function VocabItems({ cards }) {
  return (
    <div className="unit-items">
      {cards.map((c, i) => {
        const g = genderInfo(c)
        const title = g
          ? `${g.indef} ${c.french}（${g.def} ${c.french}）· ${g.label}．點擊發音`
          : '點擊發音'
        return (
          <button
            key={i}
            className={g ? 'unit-item vocab-item has-gender' : 'unit-item vocab-item'}
            title={title}
            onClick={() => speakFrench(c.french)}
          >
            <span className="unit-fr">
              {g && (
                <span className={g.isMasc ? 'art-badge masc' : 'art-badge fem'}>
                  {g.indef} · {g.def}
                </span>
              )}
              🔊 {c.french}
            </span>
            <span className="unit-zh">{c.translation}</span>
          </button>
        )
      })}
    </div>
  )
}

function CourseSection({ section, goVocab }) {
  const badge = <span className="course-badge">{SECTION_BADGES[section.type]}</span>

  if (section.type === 'teach') {
    return (
      <div className="course-section">
        <h4>
          {badge}
          {section.heading}
          <button
            className="speak-mini"
            title="全部播放"
            onClick={() => speakFrenchSequence(section.items.map((it) => it.fr))}
          >
            ▶
          </button>
        </h4>
        {section.note && <p className="muted">{section.note}</p>}
        <SpeakableItems items={section.items} />
      </div>
    )
  }

  if (section.type === 'grammar') {
    const g = findGrammar(section.level, section.orderIndex)
    if (!g) return null
    return (
      <div className="course-section">
        <h4>
          {badge}
          {g.title}
          <span className="course-sub">{g.summary}</span>
        </h4>
        <div className="grammar-content">
          {g.content}
          {g.examples?.length > 0 && (
            <div className="grammar-examples">
              <h4>🔊 例句發音</h4>
              {g.examples.map((ex, i) => (
                <div key={i} className="gx-line">
                  <button className="speak-mini" title="唸這句" onClick={() => speakFrench(ex.fr)}>
                    🔊
                  </button>
                  <span className="gx-fr">{ex.fr}</span>
                  <span className="gx-zh">{ex.zh}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (section.type === 'unit') {
    const u = findUnit(section.id)
    if (!u) return null
    return (
      <div className="course-section">
        <h4>
          {badge}
          {u.title}
          <button
            className="speak-mini"
            title="全部播放"
            onClick={() => speakFrenchSequence(u.items.map((it) => it.fr))}
          >
            ▶
          </button>
        </h4>
        <p className="muted">{u.intro}</p>
        <SpeakableItems items={u.items} />
      </div>
    )
  }

  if (section.type === 'dialogue') {
    const d = findDialogue(section.title)
    if (!d) return null
    return (
      <div className="course-section">
        <h4>
          {badge}
          {d.title}
          <button
            className="speak-mini"
            title="全部播放"
            onClick={() => speakFrenchSequence(d.lines.map((l) => l.french))}
          >
            ▶
          </button>
        </h4>
        <p className="muted">{d.scene}</p>
        <div className="dlg-lines">
          {d.lines.map((line, i) => (
            <div key={i} className="dlg-line">
              <span className="speaker">{line.speaker}</span>
              <div className="dlg-text">
                <div className="dlg-fr">
                  <span>{line.french}</span>
                  <button className="speak-mini" title="唸這句" onClick={() => speakFrench(line.french)}>
                    🔊
                  </button>
                </div>
                <div className="dlg-zh">{line.translation}</div>
              </div>
            </div>
          ))}
        </div>
        {d.keyPoints?.length > 0 && (
          <div className="keypoints">
            <h3>📌 重點教學</h3>
            <ul>
              {d.keyPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (section.type === 'vocab') {
    const words = vocabFor(section.level, section.tag)
    const shown = words.slice(0, VOCAB_PREVIEW_LIMIT)
    return (
      <div className="course-section">
        <h4>
          {badge}
          {section.tag}
          <span className="course-sub">
            {section.level} · 共 {words.length} 個字
          </span>
        </h4>
        {section.note && <p className="muted">{section.note}</p>}
        <p className="muted vocab-hint">滑鼠移到單字上（手機直接顯示）可看冠詞與陰陽性。</p>
        <VocabItems cards={shown} />
        <button className="course-more" onClick={() => goVocab(section.level, section.tag)}>
          📇 到單字卡練習「{section.tag}」全部 {words.length} 個字 →
        </button>
      </div>
    )
  }

  return null
}

function CourseLesson({ lesson, index, stage, done, onToggleDone, onBack, prev, next, onGo, goVocab }) {
  return (
    <>
      <button className="course-back" onClick={onBack}>
        ← 回學習路徑
      </button>

      <div className="dlg-card">
        <div className="dlg-header">
          <div>
            <p className="course-crumb">
              第 {stage.stage} 階段 · {stage.title} · 第 {index + 1} 課
            </p>
            <h2>{lesson.title}</h2>
            <p className="muted">🎯 學習目標：{lesson.goal}</p>
          </div>
          <button
            className={done ? 'done-btn on' : 'done-btn'}
            onClick={() => onToggleDone(lesson.id)}
          >
            {done ? '✅ 已完成' : '☑️ 標記完成'}
          </button>
        </div>

        {lesson.sections.map((sec, i) => (
          <CourseSection key={i} section={sec} goVocab={goVocab} />
        ))}

        {lesson.tips?.length > 0 && (
          <div className="keypoints">
            <h3>💡 學習提示</h3>
            <ul>
              {lesson.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="course-nav">
          {prev ? (
            <button onClick={() => onGo(prev.id)}>← 上一課：{prev.title}</button>
          ) : (
            <span />
          )}
          {next ? (
            <button className="primary" onClick={() => onGo(next.id)}>
              下一課：{next.title} →
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </>
  )
}

function CourseView({ goVocab }) {
  const [lessonId, setLessonId] = useState(null)
  // bumped when progress toggles, to re-read localStorage
  const [version, setVersion] = useState(0)
  const done = useMemo(() => getDoneLessons(), [version])

  const flat = useMemo(() => COURSE.flatMap((s) => s.lessons.map((l) => ({ ...l, stage: s }))), [])
  const doneCount = flat.filter((l) => done.has(l.id)).length

  function toggleDone(id) {
    toggleLessonDone(id)
    setVersion((v) => v + 1)
  }

  function open(id) {
    stopSpeaking()
    setLessonId(id)
    window.scrollTo({ top: 0 })
  }

  function back() {
    stopSpeaking()
    setLessonId(null)
  }

  if (lessonId) {
    const idx = flat.findIndex((l) => l.id === lessonId)
    const lesson = flat[idx]
    return (
      <CourseLesson
        lesson={lesson}
        index={idx}
        stage={lesson.stage}
        done={done.has(lesson.id)}
        onToggleDone={toggleDone}
        onBack={back}
        prev={flat[idx - 1]}
        next={flat[idx + 1]}
        onGo={open}
        goVocab={goVocab}
      />
    )
  }

  return (
    <>
      <div className="course-progress">
        <div className="course-progress-text">
          <strong>從零開始 → 基礎對話</strong>
          <span>
            已完成 {doneCount} / {COURSE_LESSON_COUNT} 課
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(doneCount / COURSE_LESSON_COUNT) * 100}%` }}
          />
        </div>
        {doneCount === 0 && (
          <p className="muted">按照順序一課一課學：每課都有教學、單字、文法和對話，學完點「標記完成」。</p>
        )}
      </div>

      {COURSE.map((stage) => {
        const stageDone = stage.lessons.filter((l) => done.has(l.id)).length
        return (
          <div key={stage.stage} className="course-stage">
            <div className="course-stage-head">
              <h3>
                <span className="stage-num">第 {stage.stage} 階段</span>
                {stage.title}
              </h3>
              <span className="stage-count">
                {stageDone} / {stage.lessons.length}
              </span>
            </div>
            <p className="muted">{stage.description}</p>

            <div className="course-lessons">
              {stage.lessons.map((l) => {
                const gi = flat.findIndex((f) => f.id === l.id)
                const isDone = done.has(l.id)
                return (
                  <button
                    key={l.id}
                    className={isDone ? 'lesson-row done' : 'lesson-row'}
                    onClick={() => open(l.id)}
                  >
                    <span className="lesson-num">{isDone ? '✓' : gi + 1}</span>
                    <span className="lesson-text">
                      <span className="lesson-title">{l.title}</span>
                      <span className="lesson-goal">{l.goal}</span>
                    </span>
                    <span className="lesson-arrow">›</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

/* -------------------------------- search --------------------------------- */

const SEARCH_SUGGESTIONS = ['國籍', '有', '游泳', '時間', '日期', '顏色', '家人', '點餐']

function SearchVerbBlock({ verb }) {
  const { present } = conjugate(verb)
  return (
    <div className="conj-block">
      <h4>
        {verb.inf} <span className="muted">· {verb.zh}（第 {verb.group} 組）</span>
      </h4>
      <div className="conj-grid">
        {present.map((f, i) => (
          <button key={i} className="conj-cell" title="發音" onClick={() => speakFrench(f)}>
            🔊 {f}
          </button>
        ))}
      </div>
      <p className="muted">以上為現在式；完整過去／未來變位請見「🔧 動詞變化」分頁。</p>
    </div>
  )
}

function SearchUnitBlock({ unit }) {
  const preview = unit.items.slice(0, 12)
  return (
    <div className="conj-block">
      <h4>
        {unit.title}
        <button
          className="speak-mini"
          title="全部播放"
          onClick={() => speakFrenchSequence(unit.items.map((it) => it.fr))}
        >
          ▶
        </button>
      </h4>
      <p className="muted">{unit.intro}</p>
      <SpeakableItems items={preview} />
      {unit.items.length > preview.length && (
        <p className="muted">…共 {unit.items.length} 個，到「🔢 單元主題」看完整列表。</p>
      )}
    </div>
  )
}

function SearchGrammarBlock({ g }) {
  return (
    <div className="course-section">
      <h4>
        {g.title}
        <span className="course-sub">{g.summary}</span>
      </h4>
      <div className="grammar-content">
        {g.content}
        {g.examples?.length > 0 && (
          <div className="grammar-examples">
            <h4>🔊 例句發音</h4>
            {g.examples.map((ex, i) => (
              <div key={i} className="gx-line">
                <button className="speak-mini" title="唸這句" onClick={() => speakFrench(ex.fr)}>
                  🔊
                </button>
                <span className="gx-fr">{ex.fr}</span>
                <span className="gx-zh">{ex.zh}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SearchDialogueBlock({ d }) {
  return (
    <div className="conj-block">
      <h4>
        {d.title}
        <button
          className="speak-mini"
          title="全部播放"
          onClick={() => speakFrenchSequence(d.lines.map((l) => l.french))}
        >
          ▶
        </button>
      </h4>
      <p className="muted">
        {d.category} · {d.scene}
      </p>
      <div className="dlg-lines">
        {d.lines.map((line, i) => (
          <div key={i} className="dlg-line">
            <span className="speaker">{line.speaker}</span>
            <div className="dlg-text">
              <div className="dlg-fr">
                <span>{line.french}</span>
                <button className="speak-mini" title="唸這句" onClick={() => speakFrench(line.french)}>
                  🔊
                </button>
              </div>
              <div className="dlg-zh">{line.translation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SEARCH_CARD_LIMIT = 18

function SearchView({ cards, reload, goVocab }) {
  const [query, setQuery] = useState('')

  const liveById = useMemo(() => {
    const m = new Map()
    for (const c of cards) m.set(c.id, c)
    return m
  }, [cards])

  const results = useMemo(() => searchAll(query), [query])

  return (
    <>
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="search"
          placeholder="輸入中文或法文，例如：國籍、有、游泳、時間…"
          value={query}
          onChange={(e) => {
            stopSpeaking()
            setQuery(e.target.value)
          }}
          autoFocus
        />
        {query && (
          <button className="search-clear" title="清除" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>

      <div className="search-suggest">
        <span className="muted">試試：</span>
        {SEARCH_SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => setQuery(s)}>
            {s}
          </button>
        ))}
      </div>

      {!results ? (
        <p className="muted">
          輸入關鍵字，一次找到相關的主題單元、文法、動詞變化、單字卡（含造句）與情境對話。
        </p>
      ) : results.total === 0 ? (
        <p className="empty">找不到與「{results.q}」相關的內容，換個關鍵字試試看。</p>
      ) : (
        <>
          <p className="muted search-count">
            找到 {results.total} 筆與「{results.q}」相關的結果
          </p>

          {results.units.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">🔢 主題單元</h3>
              {results.units.slice(0, 4).map((u) => (
                <SearchUnitBlock key={u.id} unit={u} />
              ))}
            </section>
          )}

          {results.grammar.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">📖 文法教學</h3>
              {results.grammar.slice(0, 4).map((g) => (
                <SearchGrammarBlock key={`${g.level}-${g.orderIndex}`} g={g} />
              ))}
            </section>
          )}

          {results.verbs.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">🔧 動詞變化</h3>
              {results.verbs.slice(0, 3).map((v) => (
                <SearchVerbBlock key={v.inf} verb={v} />
              ))}
            </section>
          )}

          {results.cards.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">📇 單字卡（點卡片看造句）</h3>
              <div className="grid">
                {results.cards.slice(0, SEARCH_CARD_LIMIT).map((c) => (
                  <Flashcard
                    key={c.id}
                    card={liveById.get(c.id) ?? c}
                    onToggleUnfamiliar={(id) => {
                      toggleUnfamiliar(id)
                      reload()
                    }}
                  />
                ))}
              </div>
              {results.cards.length > SEARCH_CARD_LIMIT && (
                <p className="muted">
                  …還有 {results.cards.length - SEARCH_CARD_LIMIT} 張，用下方「相關單字主題」或「📇 單字卡」分頁瀏覽全部。
                </p>
              )}
            </section>
          )}

          {results.categories.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">🏷️ 相關單字主題</h3>
              <div className="search-cats">
                {results.categories.map((c) => (
                  <button
                    key={`${c.level}-${c.tag}`}
                    className="search-cat"
                    onClick={() => goVocab(c.level, c.tag)}
                  >
                    <span className="search-cat-tag">{c.tag}</span>
                    <span className="search-cat-meta">
                      {c.level} · {c.count} 個字 →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {results.dialogues.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">💬 情境對話</h3>
              {results.dialogues.slice(0, 3).map((d) => (
                <SearchDialogueBlock key={d.id} d={d} />
              ))}
            </section>
          )}

          {results.lessons.length > 0 && (
            <section className="search-group">
              <h3 className="search-group-title">📚 課程複習</h3>
              {results.lessons.slice(0, 4).map((le) => (
                <div key={le.id} className="search-lesson">
                  <strong>{le.title}</strong>
                  <span className="muted"> · {le.date}</span>
                  <p className="muted">{le.summary}</p>
                </div>
              ))}
              <p className="muted">到「📚 課程複習」點對應日期即可複習完整內容。</p>
            </section>
          )}
        </>
      )}
    </>
  )
}

/* -------------------------------- views ---------------------------------- */

function CardsView({ cards, reload, preset }) {
  const [level, setLevel] = useState(preset?.level ?? 'A1')
  const [category, setCategory] = useState(preset?.tag ?? '全部')
  const categories = ['全部', ...categoriesFor(level)]

  // jump requested from the course view
  useEffect(() => {
    if (!preset) return
    setLevel(preset.level)
    setCategory(preset.tag)
  }, [preset])

  const shown = cards.filter(
    (c) => c.level === level && (category === '全部' || c.tag === category),
  )

  return (
    <>
      <div className="levels">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            className={lv === level ? 'level active' : 'level'}
            onClick={() => {
              setLevel(lv)
              setCategory('全部')
            }}
          >
            {lv}
          </button>
        ))}
      </div>

      <div className="cat-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={cat === category ? 'cat-chip active' : 'cat-chip'}
            onClick={() => setCategory(cat)}
          >
            {cat}
            {cat !== '全部' && (
              <span className="cat-count">
                {cards.filter((c) => c.level === level && c.tag === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="muted">{shown.length} 張卡</p>

      <AddCardForm level={level} reload={reload} />

      <div className="grid">
        {shown.map((card) => (
          <Flashcard
            key={card.id}
            card={card}
            onToggleUnfamiliar={(id) => {
              toggleUnfamiliar(id)
              reload()
            }}
            onDelete={(id) => {
              deleteCustomCard(id)
              reload()
            }}
            onSave={(id, patch) => {
              updateCustomCard(id, patch)
              reload()
            }}
          />
        ))}
      </div>
    </>
  )
}

function RandomView({ cards, reload }) {
  const [scope, setScope] = useState('all') // all | A1 | A2 | B1 | bank
  const [current, setCurrent] = useState(null)

  const pool = useMemo(() => {
    if (scope === 'bank') return cards.filter((c) => c.unfamiliar)
    if (LEVELS.includes(scope)) return cards.filter((c) => c.level === scope)
    return cards
  }, [cards, scope])

  function draw() {
    if (pool.length === 0) {
      setCurrent(null)
      return
    }
    const next = pool[Math.floor(Math.random() * pool.length)]
    setCurrent(next)
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, cards.length])

  return (
    <>
      <div className="levels">
        {[
          ['all', '全部'],
          ['A1', 'A1'],
          ['A2', 'A2'],
          ['B1', 'B1'],
          ['bank', '⭐ 單字庫'],
        ].map(([k, label]) => (
          <button
            key={k}
            className={k === scope ? 'level active' : 'level'}
            onClick={() => setScope(k)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="muted">範圍內共 {pool.length} 張卡</p>

      <div className="random-stage">
        {current ? (
          <Flashcard
            key={current.id}
            card={current}
            onToggleUnfamiliar={(id) => {
              toggleUnfamiliar(id)
              reload()
            }}
          />
        ) : (
          <p className="empty">這個範圍沒有單字卡。</p>
        )}
      </div>

      <div className="center">
        <button className="big-btn" onClick={draw} disabled={pool.length === 0}>
          🎲 抽下一張
        </button>
      </div>
    </>
  )
}

function BankView({ cards, reload }) {
  const bank = cards.filter((c) => c.unfamiliar || c.custom)

  return (
    <>
      <p className="muted">
        這裡收錄你標示「不熟」的單字與自訂單字卡，共 {bank.length} 張。在任何單字卡點 ☆
        即可加入；自訂卡片可編輯或刪除。
      </p>

      {bank.length === 0 ? (
        <p className="empty">
          目前是空的。到「單字卡」或「隨機複習」頁，點卡片右上角的 ☆ 把不熟的單字加進來吧！
        </p>
      ) : (
        <div className="grid">
          {bank.map((card) => (
            <Flashcard
              key={card.id}
              card={card}
              onToggleUnfamiliar={(id) => {
                toggleUnfamiliar(id)
                reload()
              }}
              onDelete={(id) => {
                deleteCustomCard(id)
                reload()
              }}
              onSave={(id, patch) => {
                updateCustomCard(id, patch)
                reload()
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

function GrammarView() {
  const [level, setLevel] = useState('A1')
  const [openId, setOpenId] = useState(null)
  const shown = GRAMMAR.filter((g) => g.level === level)

  return (
    <>
      <div className="levels">
        {['A1', 'A2'].map((lv) => (
          <button
            key={lv}
            className={lv === level ? 'level active' : 'level'}
            onClick={() => setLevel(lv)}
          >
            {lv} 文法
          </button>
        ))}
      </div>

      <div className="grammar-list">
        {shown.map((g) => {
          const id = `${g.level}-${g.orderIndex}`
          const open = openId === id
          return (
            <div key={id} className="grammar-item">
              <button className="grammar-head" onClick={() => setOpenId(open ? null : id)}>
                <span className="grammar-title">
                  {g.orderIndex}. {g.title}
                </span>
                <span className="grammar-summary">{g.summary}</span>
                <span className="chevron">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="grammar-content">
                  {g.content}
                  {g.examples?.length > 0 && (
                    <div className="grammar-examples">
                      <h4>🔊 例句發音</h4>
                      {g.examples.map((ex, i) => (
                        <div key={i} className="gx-line">
                          <button
                            className="speak-mini"
                            title="唸這句"
                            onClick={() => speakFrench(ex.fr)}
                          >
                            🔊
                          </button>
                          <span className="gx-fr">{ex.fr}</span>
                          <span className="gx-zh">{ex.zh}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function QuizView({ cards }) {
  const [scope, setScope] = useState('全部')
  const [q, setQ] = useState(null)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const pool = useMemo(
    () => (scope === '全部' ? cards : cards.filter((c) => c.level === scope)),
    [cards, scope],
  )

  function newQuestion() {
    if (pool.length < 4) {
      setQ(null)
      return
    }
    const answer = pool[Math.floor(Math.random() * pool.length)]
    const seen = new Set([answer.translation])
    const distractors = []
    for (const c of shuffle(pool)) {
      if (!seen.has(c.translation)) {
        seen.add(c.translation)
        distractors.push(c)
        if (distractors.length === 3) break
      }
    }
    setQ({ answer, options: shuffle([answer, ...distractors]) })
    setPicked(null)
  }

  useEffect(() => {
    newQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, cards.length])

  function pick(opt) {
    if (picked) return
    setPicked(opt)
    setScore((s) => ({
      correct: s.correct + (opt.translation === q.answer.translation ? 1 : 0),
      total: s.total + 1,
    }))
  }

  return (
    <>
      <div className="levels">
        {['全部', 'A1', 'A2', 'B1'].map((s) => (
          <button
            key={s}
            className={s === scope ? 'level active' : 'level'}
            onClick={() => {
              setScore({ correct: 0, total: 0 })
              setScope(s)
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="muted">
        得分：{score.correct} / {score.total}
      </p>

      {!q ? (
        <p className="empty">這個範圍的單字不足以出題。</p>
      ) : (
        <div className="quiz-card">
          <div className="quiz-question">
            <span className="quiz-fr">{q.answer.french}</span>
            <button className="speak-mini" title="發音" onClick={() => speakFrench(q.answer.french)}>
              🔊
            </button>
          </div>
          <p className="muted">這個字是什麼意思？</p>

          <div className="quiz-options">
            {q.options.map((opt) => {
              let cls = 'quiz-option'
              if (picked) {
                if (opt.translation === q.answer.translation) cls += ' correct'
                else if (opt === picked) cls += ' wrong'
              }
              return (
                <button key={opt.id} className={cls} onClick={() => pick(opt)}>
                  {opt.translation}
                </button>
              )
            })}
          </div>

          {picked && (
            <div className="quiz-feedback">
              <span className="quiz-result">
                {picked.translation === q.answer.translation
                  ? '✅ 答對了！'
                  : `❌ 答錯了，正解：${q.answer.translation}`}
              </span>
              {q.answer.example && (
                <div className="quiz-example">
                  <span>🇫🇷 {q.answer.example}</span>
                  <button
                    className="speak-mini"
                    title="唸例句"
                    onClick={() => speakFrench(q.answer.example)}
                  >
                    🔊
                  </button>
                  {q.answer.exampleTranslation && (
                    <div className="quiz-example-zh">{q.answer.exampleTranslation}</div>
                  )}
                </div>
              )}
              <button className="big-btn" onClick={newQuestion}>
                下一題 →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const VERB_GUIDE = [
  {
    title: '三大動詞組',
    content:
      '法文動詞依原形字尾分三組：\n第一組 -er（最多，規則）：parler, aimer, manger…\n第二組 -ir（規則，變位含 -iss-）：finir, choisir…\n第三組（不規則）：être, avoir, aller, prendre, faire… 需個別記。',
  },
  {
    title: '現在式 présent',
    content:
      '第一組 -er 去掉 -er 加字尾：-e, -es, -e, -ons, -ez, -ent。\n例：parler → je parle, nous parlons。\n第二組 -ir：-is, -is, -it, -issons, -issez, -issent。\n例：finir → je finis, nous finissons。\n第三組要逐一記憶（見下方變位表）。',
  },
  {
    title: '複合過去式 passé composé',
    content:
      "結構：助動詞（avoir 或 être 的現在式）+ 過去分詞。\n多數用 avoir：j'ai mangé（我吃了）。\n移動／狀態改變動詞與代動詞用 être，且過去分詞與主詞性數配合：elle est allée（她去了）。",
  },
  {
    title: '簡單未來式 futur simple',
    content:
      '未來語幹 + 字尾 -ai, -as, -a, -ons, -ez, -ont。\n規則動詞語幹＝原形（-re 去掉 e）：parler → je parlerai。\n不規則語幹要記：être→ser-, avoir→aur-, aller→ir-, faire→fer-。',
  },
]

function VerbsView() {
  const [inf, setInf] = useState(VERBS[0].inf)
  const verb = VERBS.find((v) => v.inf === inf) ?? VERBS[0]
  const tables = conjugate(verb)

  const tenseList = [
    ['現在式 présent', tables.present],
    ['複合過去式 passé composé', tables.passeCompose],
    ['未來式 futur simple', tables.futur],
  ]

  return (
    <>
      <div className="grammar-list">
        {VERB_GUIDE.map((g, i) => (
          <div key={i} className="grammar-item">
            <div className="grammar-head static">
              <span className="grammar-title">{g.title}</span>
            </div>
            <div className="grammar-content">{g.content}</div>
          </div>
        ))}
      </div>

      <h3 className="section-title">🔧 動詞變位查詢</h3>
      <div className="dlg-cats">
        {VERBS.map((v) => (
          <button
            key={v.inf}
            className={v.inf === inf ? 'chip active' : 'chip'}
            onClick={() => {
              stopSpeaking()
              setInf(v.inf)
            }}
          >
            {v.inf}
          </button>
        ))}
      </div>

      <div className="dlg-card">
        <div className="dlg-header">
          <div>
            <h2>
              {verb.inf} <span className="muted">· {verb.zh}</span>
            </h2>
            <p className="muted">
              第 {verb.group} 組 · 助動詞 {verb.aux} · 過去分詞 {verb.pp}
            </p>
          </div>
          <button className="big-btn" onClick={() => speakFrench(verb.inf)}>
            🔊 原形
          </button>
        </div>

        {tenseList.map(([label, forms]) => (
          <div key={label} className="conj-block">
            <h4>{label}</h4>
            <div className="conj-grid">
              {forms.map((form, i) => (
                <button
                  key={i}
                  className="conj-cell"
                  title="發音"
                  onClick={() => speakFrench(form)}
                >
                  🔊 {form}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function pad2(n) {
  return String(n).padStart(2, '0')
}

function LessonCalendar({ byDate, selectedDate, onPickDate }) {
  // Build a date -> lessons map and start on the month of the latest lesson.
  const allDates = Object.keys(byDate).sort()
  const latest = allDates[allDates.length - 1]
  const [cursor, setCursor] = useState(() => {
    const d = selectedDate || latest ? new Date(selectedDate || latest) : new Date()
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
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="cal">
      <div className="cal-header">
        <button className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="上個月">
          ‹
        </button>
        <span className="cal-title">
          {cursor.y} 年 {cursor.m + 1} 月
        </span>
        <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="下個月">
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
          const isSel = ds === selectedDate

          return (
            <button
              key={ds}
              type="button"
              disabled={!has}
              className={`cal-day${has ? ' has' : ''}${isSel ? ' selected' : ''}`}
              title={has ? items.map((l) => l.title).join('、') : undefined}
              onClick={() => has && onPickDate(ds)}
            >
              <span className="cal-num">{day}</span>
              {has && <span className="cal-dot" />}
              {has && items.length > 1 && <span className="cal-badge">{items.length}</span>}
            </button>
          )
        })}
      </div>

      <p className="cal-legend">
        <span className="cal-dot" /> 有課程內容，點日期在右側複習當天的單元
      </p>
    </div>
  )
}

function LessonsView() {
  const byDate = useMemo(() => {
    const m = {}
    for (const l of LESSONS) (m[l.date] ||= []).push(l)
    return m
  }, [])
  // Default to the most recent lesson.
  const latest = useMemo(
    () => [...LESSONS].sort((a, b) => (a.date < b.date ? 1 : -1))[0],
    [],
  )
  const [date, setDate] = useState(latest?.date)
  const [id, setId] = useState(latest?.id)

  const dayLessons = byDate[date] || []
  const lesson = dayLessons.find((l) => l.id === id) ?? dayLessons[0] ?? LESSONS[0]
  const allLines = lesson.sections.flatMap((s) => s.items.map((it) => it.fr))

  function pickDate(ds) {
    stopSpeaking()
    setDate(ds)
    // default to the first lesson of that day
    setId((byDate[ds] || [])[0]?.id)
  }

  function pick(nextId) {
    stopSpeaking()
    setId(nextId)
  }

  return (
    <>
      <p className="muted">老師上課教過的內容，依日期整理。點日曆上有圓點的日期即可複習當天的單元。</p>

      <div className="lessons-layout">
        <LessonCalendar byDate={byDate} selectedDate={date} onPickDate={pickDate} />

        <div className="lessons-main">
          {dayLessons.length > 1 && (
            <div className="day-lessons">
              <span className="day-lessons-label">{date} 當天單元：</span>
              <div className="day-lessons-chips">
                {dayLessons.map((l) => (
                  <button
                    key={l.id}
                    className={l.id === lesson.id ? 'chip active' : 'chip'}
                    onClick={() => pick(l.id)}
                  >
                    {l.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="dlg-card">
            <div className="dlg-header">
              <div>
                <h2>{lesson.title}</h2>
                <p className="muted">
                  {lesson.date} · {lesson.summary}
                </p>
              </div>
              <button className="big-btn" onClick={() => speakFrenchSequence(allLines)}>
                ▶ 全部播放
              </button>
            </div>

            {lesson.sections.map((sec, si) => (
              <div key={si} className="conj-block">
                <h4>{sec.heading}</h4>
                {sec.note && <p className="muted">{sec.note}</p>}
                <div className="unit-items">
                  {sec.items.map((it, i) => (
                    <button
                      key={i}
                      className="unit-item"
                      title="點擊發音"
                      onClick={() => speakFrench(it.fr)}
                    >
                      <span className="unit-fr">🔊 {it.fr}</span>
                      <span className="unit-zh">{it.zh}</span>
                    </button>
                  ))}
                </div>
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
          </div>
        </div>
      </div>
    </>
  )
}

function UnitsView() {
  const [id, setId] = useState(UNITS[0].id)
  const unit = UNITS.find((u) => u.id === id) ?? UNITS[0]

  return (
    <>
      <div className="dlg-cats">
        {UNITS.map((u) => (
          <button
            key={u.id}
            className={u.id === id ? 'chip active' : 'chip'}
            onClick={() => {
              stopSpeaking()
              setId(u.id)
            }}
          >
            {u.title}
          </button>
        ))}
      </div>

      <div className="dlg-card">
        <div className="dlg-header">
          <div>
            <h2>{unit.title}</h2>
            <p className="muted">{unit.intro}</p>
          </div>
          <button
            className="big-btn"
            onClick={() => speakFrenchSequence(unit.items.map((it) => it.fr))}
          >
            ▶ 全部播放
          </button>
        </div>

        <div className="unit-items">
          {unit.items.map((it, i) => (
            <button
              key={i}
              className="unit-item"
              title="點擊發音"
              onClick={() => speakFrench(it.fr)}
            >
              <span className="unit-fr">🔊 {it.fr}</span>
              <span className="unit-zh">{it.zh}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function DialoguesView() {
  const [category, setCategory] = useState(DIALOGUE_CATEGORIES[0])
  const inCategory = DIALOGUES.filter((d) => d.category === category)
  const [dialogueId, setDialogueId] = useState(inCategory[0]?.id)

  const dialogue =
    DIALOGUES.find((d) => d.id === dialogueId) ?? inCategory[0] ?? DIALOGUES[0]

  function pickCategory(cat) {
    setCategory(cat)
    const first = DIALOGUES.find((d) => d.category === cat)
    setDialogueId(first?.id)
    stopSpeaking()
  }

  return (
    <>
      <div className="dlg-cats">
        {DIALOGUE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={cat === category ? 'chip active' : 'chip'}
            onClick={() => pickCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <select
        className="dlg-select"
        value={dialogue.id}
        onChange={(e) => {
          setDialogueId(Number(e.target.value))
          stopSpeaking()
        }}
      >
        {inCategory.map((d) => (
          <option key={d.id} value={d.id}>
            {d.title}
          </option>
        ))}
      </select>

      <div className="dlg-card">
        <div className="dlg-header">
          <div>
            <h2>{dialogue.title}</h2>
            <p className="muted">
              {dialogue.scene}
              {dialogue.level ? ` · ${dialogue.level}` : ''}
            </p>
          </div>
          <button
            className="big-btn"
            onClick={() => speakFrenchSequence(dialogue.lines.map((l) => l.french))}
          >
            ▶ 全部播放
          </button>
        </div>

        <div className="dlg-lines">
          {dialogue.lines.map((line, i) => (
            <div key={i} className="dlg-line">
              <span className="speaker">{line.speaker}</span>
              <div className="dlg-text">
                <div className="dlg-fr">
                  <span>{line.french}</span>
                  <button
                    className="speak-mini"
                    title="唸這句"
                    onClick={() => speakFrench(line.french)}
                  >
                    🔊
                  </button>
                </div>
                <div className="dlg-zh">{line.translation}</div>
              </div>
            </div>
          ))}
        </div>

        {dialogue.keyPoints?.length > 0 && (
          <div className="keypoints">
            <h3>📌 重點教學</h3>
            <ul>
              {dialogue.keyPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}
