// Shared presentation pieces used by more than one view.

import { useEffect, useRef, useState } from 'react'
import { speakFrench, speakFrenchSequence, stopSpeaking, subscribeSpeaking } from './speech'
import { getCardState, masteryOf } from './srs'

/* ------------------------------ speech helpers ---------------------------- */

/** `{ speaking, remaining, sequence }` for the current playback. */
export function useSpeaking() {
  const [state, setState] = useState({ speaking: false, remaining: 0, sequence: false })
  useEffect(() => subscribeSpeaking(setState), [])
  return state
}

/* ------------------------------- clipboard -------------------------------- */

/**
 * Copy text to the clipboard. Falls back to a hidden textarea for browsers
 * (or non-HTTPS origins) where the async Clipboard API isn't available.
 */
export async function copyText(text) {
  if (!text) return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* permission denied or insecure context — try the fallback below */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '-1000px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/** 📋 button that briefly turns into ✅ once the text is on the clipboard. */
export function CopyButton({ text, label = '複製', className = '' }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <button
      type="button"
      className={copied ? `copy-btn copied ${className}` : `copy-btn ${className}`}
      title={copied ? '已複製！' : label}
      aria-label={copied ? '已複製' : label}
      onClick={async (e) => {
        e.stopPropagation()
        if (await copyText(text)) setCopied(true)
      }}
    >
      {copied ? '✅' : '📋'}
    </button>
  )
}

/** Small round 🔊 button used inline next to a line of French. */
export function SpeakButton({ text, label = '唸這句', className = '' }) {
  return (
    <button
      type="button"
      className={`speak-mini ${className}`}
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        speakFrench(text)
      }}
    >
      🔊
    </button>
  )
}

/** "Play everything in this block" button, with a stop state while running. */
export function PlayAllButton({ lines, className = 'btn btn-primary' }) {
  // Only a running *sequence* turns this into a stop button — a single 🔊 tap
  // elsewhere on the page shouldn't relabel every play-all button.
  const { sequence } = useSpeaking()
  // Keep the French only — a Chinese label on a line would come out garbled in
  // a French voice, and explanation-only lines shouldn't be read at all.
  const list = (lines || []).filter(Boolean).map(frenchFromLine).filter(hasFrench)
  if (list.length === 0) return null
  return (
    <button
      type="button"
      className={className}
      onClick={() => (sequence ? stopSpeaking() : speakFrenchSequence(list))}
    >
      {sequence ? '■ 停止播放' : `▶ 全部播放（${list.length}）`}
    </button>
  )
}

/* --------------------------------- layout --------------------------------- */

export function PageHeader({ icon, title, description, actions, children }) {
  return (
    <header className="page-head">
      <div className="page-head-main">
        <h1 className="page-title">
          {icon && <span aria-hidden="true">{icon}</span>} {title}
        </h1>
        {description && <p className="page-desc">{description}</p>}
        {children}
      </div>
      {actions && <div className="page-head-actions">{actions}</div>}
    </header>
  )
}

export function Panel({ title, sub, actions, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <div className="panel-head">
          <div>
            {title && <h2 className="panel-title">{title}</h2>}
            {sub && <p className="panel-sub">{sub}</p>}
          </div>
          {actions && <div className="panel-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ icon = '🔍', title, children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-title">{title}</p>
      {children && <p className="empty-body">{children}</p>}
      {action}
    </div>
  )
}

/** Segmented control used for levels / scopes / modes. */
export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const key = o.key ?? o
        const label = o.label ?? o
        return (
          <button
            key={key}
            type="button"
            className={key === value ? 'segment active' : 'segment'}
            aria-pressed={key === value}
            onClick={() => onChange(key)}
          >
            {label}
            {o.count != null && <span className="segment-count">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function ProgressBar({ value, max = 100, tone = 'brand', label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      className={`progress-track tone-${tone}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Circular daily-goal indicator (pure CSS conic gradient). */
export function ProgressRing({ value, max, caption, sub }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="ring" style={{ '--ring-pct': `${pct}%` }}>
      <div className="ring-inner">
        <span className="ring-value">{value}</span>
        <span className="ring-max">/ {max}</span>
      </div>
      {caption && <span className="ring-caption">{caption}</span>}
      {sub && <span className="ring-sub">{sub}</span>}
    </div>
  )
}

/* -------------------------------- flashcards ------------------------------ */

export function GenderBadge({ gender, compact = false }) {
  if (gender !== 'm' && gender !== 'f') return null
  const isMasc = gender === 'm'
  return (
    <span className={isMasc ? 'gender masc' : 'gender fem'}>
      {compact ? (isMasc ? 'le' : 'la') : isMasc ? 'm · 陽性 (le)' : 'f · 陰性 (la)'}
    </span>
  )
}

// Article + gender info for a noun card. Returns null for non-nouns /
// genderless words. The definite article elides to l' before a vowel or h.
export function genderInfo(card) {
  if (card.gender !== 'm' && card.gender !== 'f') return null
  const isMasc = card.gender === 'm'
  const startsVowel = /^[aeiouhâàéèêîïôùûAEIOUH]/.test(card.french || '')
  const def = startsVowel ? "l'" : isMasc ? 'le' : 'la'
  return { isMasc, indef: isMasc ? 'un' : 'une', def, label: isMasc ? '陽性' : '陰性' }
}

function MasteryDot({ cardId }) {
  const m = masteryOf(getCardState(cardId))
  if (m.level === 0) return null
  return (
    <span className={`mastery mastery-${m.key}`} title={`熟練度：${m.label}`}>
      {m.label}
    </span>
  )
}

/**
 * A flip card. The flip surface is a single button (so keyboard users can flip
 * with Enter/Space) and every other control lives outside it — no nested
 * interactive elements.
 */
export function Flashcard({ card, onToggleUnfamiliar, onDelete, onSave, autoFlip = false }) {
  const [flipped, setFlipped] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setFlipped(autoFlip)
  }, [card.id, autoFlip])

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

  const g = genderInfo(card)

  return (
    <article className={card.unfamiliar ? 'card marked' : 'card'}>
      <div className="card-top">
        <MasteryDot cardId={card.id} />
        {onToggleUnfamiliar && (
          <button
            type="button"
            className={card.unfamiliar ? 'star on' : 'star'}
            aria-pressed={Boolean(card.unfamiliar)}
            aria-label={card.unfamiliar ? '從單字庫移除' : '加入單字庫'}
            title={card.unfamiliar ? '從單字庫移除' : '標示為不熟，加入單字庫'}
            onClick={() => onToggleUnfamiliar(card.id)}
          >
            {card.unfamiliar ? '★' : '☆'}
          </button>
        )}
      </div>

      <button
        type="button"
        className={flipped ? 'card-flip flipped' : 'card-flip'}
        aria-pressed={flipped}
        aria-label={`${card.french}，點擊翻面看中文與例句`}
        onClick={() => setFlipped((f) => !f)}
      >
        <span className="card-face card-front">
          <span className="french">{card.french}</span>
          <span className="badges">
            {g && (
              <span className={g.isMasc ? 'art-badge masc' : 'art-badge fem'}>
                {g.indef} · {g.def}
              </span>
            )}
            {card.partOfSpeech && <span className="pos">{card.partOfSpeech}</span>}
            {card.tag && <span className="tagchip">{card.tag}</span>}
          </span>
          <span className="hint">點一下看翻譯</span>
        </span>

        <span className="card-face card-back">
          <span className="translation">{card.translation}</span>
          <GenderBadge gender={card.gender} />
          {card.example && (
            <span className="example-block">
              <span className="example">🇫🇷 {card.example}</span>
              {card.exampleTranslation && (
                <span className="example-zh">{card.exampleTranslation}</span>
              )}
            </span>
          )}
          <span className="hint">點一下看法文</span>
        </span>
      </button>

      <div className="card-actions">
        <button
          type="button"
          className="speak"
          onClick={() => speakFrench(card.french)}
          title="唸出單字"
        >
          🔊 單字
        </button>
        {card.example && (
          <button
            type="button"
            className="speak"
            onClick={() => speakFrench(card.example)}
            title="唸出例句"
          >
            🔊 例句
          </button>
        )}
        {/* one button — the action bar is too narrow on phones for two */}
        <CopyButton
          text={card.example ? `${card.french}\n${card.example}` : card.french}
          label={card.example ? '複製單字與例句' : `複製「${card.french}」`}
        />
        {card.custom && onSave && (
          <button type="button" className="icon-action" title="編輯" aria-label="編輯卡片" onClick={() => setEditing(true)}>
            ✏️
          </button>
        )}
        {card.custom && onDelete && (
          <button type="button" className="icon-action danger" title="刪除" aria-label="刪除卡片" onClick={() => onDelete(card.id)}>
            🗑
          </button>
        )}
      </div>
    </article>
  )
}

export function CardEditor({ card, onSubmit, onCancel }) {
  const [f, setF] = useState({
    french: card.french || '',
    translation: card.translation || '',
    gender: card.gender || '',
    example: card.example || '',
    exampleTranslation: card.exampleTranslation || '',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  return (
    <form
      className="card card-editing"
      onSubmit={(e) => {
        e.preventDefault()
        if (!f.french.trim() || !f.translation.trim()) return
        onSubmit({ ...f, gender: f.gender || null })
      }}
    >
      <input placeholder="法文單字 *" value={f.french} onChange={set('french')} aria-label="法文單字" />
      <input placeholder="中文翻譯 *" value={f.translation} onChange={set('translation')} aria-label="中文翻譯" />
      <select value={f.gender} onChange={set('gender')} aria-label="性別">
        <option value="">性別（名詞）</option>
        <option value="m">陽性 (le)</option>
        <option value="f">陰性 (la)</option>
      </select>
      <input placeholder="法文例句" value={f.example} onChange={set('example')} aria-label="法文例句" />
      <input
        placeholder="例句中文翻譯"
        value={f.exampleTranslation}
        onChange={set('exampleTranslation')}
        aria-label="例句中文翻譯"
      />
      <div className="editor-actions">
        <button type="submit" className="btn btn-primary">儲存</button>
        <button type="button" className="btn" onClick={onCancel}>取消</button>
      </div>
    </form>
  )
}

/* --------------------------- speakable term lists -------------------------- */

// A term is a row with two controls (speak + copy), so the clickable area is a
// nested <button> rather than the row itself — no button-inside-button.
//
// Some rows are pure Chinese explanation (a rule, a mnemonic). Those get no 🔊
// at all, and rows that mix a Chinese label with French only ever speak the
// French part — the voice is a French one, so Chinese would come out garbled.
function Term({ fr, zh, title, badge }) {
  const speech = frenchFromLine(fr)
  const speakable = hasFrench(speech)

  const body = (
    <>
      <span className="term-fr">
        {speakable && (
          <span className="term-speaker" aria-hidden="true">🔊</span>
        )}
        {fr}
        {badge}
      </span>
      <span className="term-zh">{zh}</span>
    </>
  )

  if (!speakable) {
    return (
      <div className="term">
        <div className="term-main term-plain">{body}</div>
      </div>
    )
  }

  return (
    <div className="term">
      <button type="button" className="term-main" title={title ?? '點擊發音'} onClick={() => speakFrench(speech)}>
        {body}
      </button>
      <CopyButton text={speech} label={`複製「${speech}」`} className="term-copy" />
    </div>
  )
}

export function SpeakableItems({ items }) {
  return (
    <div className="term-grid">
      {items.map((it, i) => (
        <Term key={i} fr={it.fr} zh={it.zh} />
      ))}
    </div>
  )
}

/** Same look, but nouns carry their article + gender badge. */
export function VocabItems({ cards }) {
  return (
    <div className="term-grid">
      {cards.map((c, i) => {
        const g = genderInfo(c)
        return (
          <Term
            key={i}
            fr={c.french}
            zh={c.translation}
            title={g ? `${g.indef} ${c.french}（${g.def} ${c.french}）· ${g.label}．點擊發音` : '點擊發音'}
            badge={
              g && (
                <span className={g.isMasc ? 'art-badge masc' : 'art-badge fem'}>
                  {g.indef} · {g.def}
                </span>
              )
            }
          />
        )
      })}
    </div>
  )
}

/** Conjugation table: every form speaks and copies. */
export function ConjGrid({ forms }) {
  return (
    <div className="conj-grid">
      {forms.map((form, i) => (
        <div key={i} className="conj-cell">
          <button type="button" className="conj-main" title="點擊發音" onClick={() => speakFrench(form)}>
            <span className="term-speaker" aria-hidden="true">🔊</span>
            {form}
          </button>
          <CopyButton text={form} label={`複製「${form}」`} className="term-copy" />
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------- text ---------------------------------- */

// Pull the French portion out of a mixed zh/fr grammar line so it can be
// spoken. Drops CJK characters and CJK/fullwidth punctuation, keeps Latin.
/** Does this string still hold something a French voice can read out? */
export function hasFrench(text) {
  return /[a-zA-ZÀ-ÿ]/.test(text)
}

export function frenchFromLine(line) {
  return String(line)
    .replace(/[㐀-鿿豈-﫿぀-ヿ]/g, '')
    .replace(/[‘’“”　-〿＀-￯]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Grammar body, one 🔊 per line that actually contains French. */
export function GrammarContent({ text }) {
  return (
    <div className="prose">
      {String(text)
        .split('\n')
        .map((line, i) => {
          if (line.trim() === '') return <div key={i} className="prose-gap" />
          const fr = frenchFromLine(line)
          const speakable = hasFrench(fr)
          return (
            <div key={i} className="prose-line">
              <span className="prose-text">{line}</span>
              {speakable && (
                <span className="prose-tools">
                  <SpeakButton text={fr} label="唸出這行的法文" />
                  <CopyButton text={fr} label={`複製「${fr}」`} />
                </span>
              )}
            </div>
          )
        })}
    </div>
  )
}

export function GrammarBody({ grammar }) {
  return (
    <div className="grammar-body">
      <GrammarContent text={grammar.content} />
      {grammar.examples?.length > 0 && (
        <div className="examples">
          <h4 className="examples-title">🔊 例句發音</h4>
          {grammar.examples.map((ex, i) => (
            <div key={i} className="example-line">
              <SpeakButton text={ex.fr} />
              <CopyButton text={ex.fr} label={`複製「${ex.fr}」`} />
              <span className="example-fr">{ex.fr}</span>
              <span className="example-zh">{ex.zh}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DialogueLines({ lines }) {
  return (
    <div className="dlg-lines">
      {lines.map((line, i) => (
        <div key={i} className="dlg-line">
          <span className="speaker">{line.speaker}</span>
          <div className="dlg-text">
            <div className="dlg-fr">
              <span>{line.french}</span>
              <SpeakButton text={line.french} />
              <CopyButton text={line.french} label={`複製「${line.french}」`} />
            </div>
            <div className="dlg-zh">{line.translation}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function KeyPoints({ title = '📌 重點教學', points }) {
  if (!points?.length) return null
  return (
    <div className="keypoints">
      <h3>{title}</h3>
      <ul>
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  )
}

/* --------------------------------- inputs --------------------------------- */

export function SearchField({ value, onChange, placeholder, autoFocus, onSubmit, inputRef }) {
  const localRef = useRef(null)
  const ref = inputRef ?? localRef
  return (
    <form
      className="search-field"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(value)
      }}
    >
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        ref={ref}
        className="search-input"
        type="search"
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search-clear" aria-label="清除搜尋" onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </form>
  )
}
