import { useEffect, useMemo, useState } from 'react'
import {
  LEVELS,
  GRAMMAR,
  DIALOGUES,
  DIALOGUE_CATEGORIES,
  UNITS,
  loadCards,
  toggleUnfamiliar,
  addCustomCard,
  updateCustomCard,
  deleteCustomCard,
} from './store'
import { speakFrench, speakFrenchSequence, stopSpeaking, isSpeechSupported } from './speech'

const TABS = [
  { key: 'cards', label: '📇 單字卡' },
  { key: 'random', label: '🎲 隨機複習' },
  { key: 'bank', label: '⭐ 我的單字庫' },
  { key: 'units', label: '🔢 單元主題' },
  { key: 'grammar', label: '📖 文法教學' },
  { key: 'dialogues', label: '💬 情境對話' },
]

export default function App() {
  const [tab, setTab] = useState('cards')
  // bumped whenever localStorage changes, to re-read cards everywhere
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  const cards = useMemo(() => loadCards(), [version])

  return (
    <div className="app">
      <header>
        <h1>🇫🇷 法文學習</h1>
        <p className="sub">A1 / A2 / B1 · 單字卡 · 文法 · 情境對話</p>
      </header>

      {!isSpeechSupported() && (
        <p className="warn">⚠️ 此瀏覽器不支援語音合成，發音功能無法使用。</p>
      )}

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

      {tab === 'cards' && <CardsView cards={cards} reload={reload} />}
      {tab === 'random' && <RandomView cards={cards} reload={reload} />}
      {tab === 'bank' && <BankView cards={cards} reload={reload} />}
      {tab === 'units' && <UnitsView />}
      {tab === 'grammar' && <GrammarView />}
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

/* -------------------------------- views ---------------------------------- */

function CardsView({ cards, reload }) {
  const [level, setLevel] = useState('A1')
  const shown = cards.filter((c) => c.level === level)

  return (
    <>
      <div className="levels">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            className={lv === level ? 'level active' : 'level'}
            onClick={() => setLevel(lv)}
          >
            {lv}
          </button>
        ))}
      </div>

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
