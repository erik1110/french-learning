// Shared presentation pieces used by more than one view.

import { useEffect, useMemo, useRef, useState } from 'react'
import { speakFrench, speakFrenchSequence, stopSpeaking, subscribeSpeaking } from './speech'
import { genderOf, hintsFor, isSentence, zhuyinFor } from './pronunciation'
import { lookup } from './dictionary'
import { getCardState, masteryOf } from './srs'
import { bankedWord, toggleWordInBank } from './store'

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

/* --------------------------- word-level dictionary ------------------------- */

/**
 * A French sentence split into words, where every word the dictionary knows
 * becomes hoverable. Hovering (or tapping) pops a small card with the part of
 * speech, the Chinese meaning, 注音 when the word is hard to say, and a 🔊.
 *
 * The popup is positioned by the browser's own layout (absolute inside a
 * relative span) rather than measured coordinates — simpler, and it can't drift
 * out of sync while the page scrolls.
 */
function Word({ raw }) {
  // Two dismiss speeds, both automatic: a quick one for a card you merely
  // brushed past, and a slow one for a card you deliberately pinned — long
  // enough to read it, short enough that you never have to tidy up.
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  // Flip below the word when there isn't room above (first line of a section
  // would otherwise slide under the sticky top bar).
  const [below, setBelow] = useState(false)
  // Read the bank lazily — only when a card actually opens, so hovering doesn't
  // hit localStorage for every word on the page.
  const [starred, setStarred] = useState(null)
  const closeTimer = useRef(null)
  const ref = useRef(null)
  const entry = useMemo(() => lookup(raw), [raw])

  // A short grace period on the way out: crossing the gap between the word and
  // the card, or clipping a corner, shouldn't dismiss it.
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // Escape always dismisses, so a pinned card can never get stuck.
  useEffect(() => {
    if (!pinned) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setPinned(false)
        setHover(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pinned])

  function enter() {
    clearTimeout(closeTimer.current)
    const top = ref.current?.getBoundingClientRect().top ?? 999
    setBelow(top < 190)
    if (entry) setStarred(Boolean(bankedWord(entry.word)))
    setHover(true)
  }
  function leave() {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(
      () => {
        setHover(false)
        setPinned(false)
      },
      pinned ? 2000 : 220,
    )
  }

  if (!entry) return <span>{raw}</span>

  const open = hover || pinned
  const zy = zhuyinFor(entry.word)

  return (
    <span
      ref={ref}
      className={open ? 'w on' : 'w'}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        type="button"
        className={pinned ? 'w-hit pinned' : 'w-hit'}
        aria-expanded={open}
        title={pinned ? '點一下收起' : '點一下釘住'}
        onClick={(e) => {
          e.stopPropagation()
          setPinned((p) => !p)
        }}
      >
        {raw}
      </button>

      {open && (
        <span
          className={`w-pop${pinned ? ' pinned' : ''}${below ? ' below' : ''}`}
          role="tooltip"
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <span className="w-pop-head">
            <b className="w-pop-word">{entry.word}</b>
            {zy && <span className="w-pop-zy">{zy[0]}</span>}
            <button
              type="button"
              className="w-pop-play"
              title={`唸「${entry.word}」`}
              onClick={(e) => {
                e.stopPropagation()
                speakFrench(entry.word)
              }}
            >
              🔊
            </button>
            <button
              type="button"
              className={starred ? 'w-pop-star on' : 'w-pop-star'}
              title={starred ? '已在單字庫，點一下移除' : '加入我的單字庫'}
              aria-pressed={Boolean(starred)}
              onClick={(e) => {
                e.stopPropagation()
                setStarred(toggleWordInBank(entry.word, entry.pos))
              }}
            >
              {starred ? '★' : '☆'}
            </button>
            {pinned && (
              <button
                type="button"
                className="w-pop-close"
                title="立刻關閉"
                onClick={(e) => {
                  e.stopPropagation()
                  setPinned(false)
                  setHover(false)
                }}
              >
                ✕
              </button>
            )}
          </span>
          <span className="w-pop-pos">{entry.pos}</span>
          {zy?.[1] && <span className="w-pop-tip">發音：{zy[1]}</span>}
          {entry.note && <span className="w-pop-note">{entry.note}</span>}
          <span className="w-pop-hint">
            {starred
              ? '★ 已加入單字庫，可以在「我的單字庫」和每日複習裡練'
              : pinned
                ? '已釘住 · 滑鼠離開 2 秒後自動關閉'
                : '點單字可以釘住 · 按 ☆ 加入單字庫'}
          </span>
        </span>
      )}
    </span>
  )
}

/** Render French text with every known word hoverable. */
export function WordText({ text }) {
  // Keep the separators so punctuation and spacing survive the round trip.
  const parts = useMemo(() => String(text).split(/([^\p{L}'’-]+)/u), [text])
  return (
    <>
      {parts.map((p, i) =>
        /[\p{L}]/u.test(p) ? <Word key={i} raw={p} /> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

/* ------------------------------ study lines ------------------------------- */

/**
 * One line of study material, laid out full width so a whole sentence stays on
 * one row and stays readable.
 *
 * Everything extra — pronunciation hints, gender, copy — lives behind hover (or
 * a tap on touch screens) so the default view is just French + Chinese and a
 * beginner isn't drowning in badges.
 */
export function StudyLine({ fr, zh, n }) {
  const [open, setOpen] = useState(false)
  const speech = frenchFromLine(fr)
  const speakable = hasFrench(speech)
  const hints = useMemo(() => (speakable ? hintsFor(speech) : []), [speech, speakable])
  const gender = useMemo(() => (speakable ? genderOf(speech) : null), [speech, speakable])
  const hasExtra = hints.length > 0 || gender

  return (
    <li className={open ? 'sline open' : 'sline'} onMouseLeave={() => setOpen(false)}>
      <div className="sline-main">
        {n != null && <span className="sline-n">{n}</span>}

        {speakable ? (
          <button
            type="button"
            className="sline-play"
            title="點這裡唸出來"
            aria-label={`唸「${speech}」`}
            onClick={() => speakFrench(speech)}
          >
            🔊
          </button>
        ) : (
          <span className="sline-play ghost" aria-hidden="true">
            💡
          </span>
        )}

        <div className="sline-text">
          <p className="sline-fr">{speakable ? <WordText text={fr} /> : fr}</p>
          <p className="sline-zh">{zh}</p>
        </div>

        <div className="sline-tools">
          {gender && (
            <span className={`g-badge ${gender.key}`} title={gender.hint}>
              {gender.label}
            </span>
          )}
          {hasExtra && (
            <button
              type="button"
              className={open ? 'sline-more on' : 'sline-more'}
              aria-expanded={open}
              title="看發音提示"
              onClick={() => setOpen((o) => !o)}
            >
              ㄅ
            </button>
          )}
          {speakable && <CopyButton text={speech} label={`複製「${speech}」`} className="sline-copy" />}
        </div>
      </div>

      {open && hasExtra && (
        <div className="sline-extra">
          {hints.length > 0 && (
            <ul className="zy-list">
              {hints.map((h, i) => (
                <li key={i}>
                  <button type="button" className="zy-word" onClick={() => speakFrench(h.word)}>
                    {h.word}
                  </button>
                  <span className="zy-say">{h.zy}</span>
                  {h.tip && <span className="zy-tip">{h.tip}</span>}
                </li>
              ))}
            </ul>
          )}
          {gender && <p className="g-note">{gender.label}：{gender.hint}</p>}
        </div>
      )}
    </li>
  )
}

/**
 * A block of study items.
 *
 * One line per item is the default — a sentence you can actually read beats a
 * cramped two-column card. The grid is reserved for what it's good at: a long
 * list of bare vocabulary you want to scan all at once.
 */
export function StudyItems({ items, numbered = false, force }) {
  const plainWords = items.filter((it) => !isSentence(it.fr)).length
  const isVocabList = items.length >= 6 && plainWords >= items.length * 0.8
  const mode = force ?? (isVocabList ? 'grid' : 'lines')

  if (mode === 'grid') {
    return (
      <div className="term-grid">
        {items.map((it, i) => (
          <Term key={i} fr={it.fr} zh={it.zh} />
        ))}
      </div>
    )
  }
  return (
    <ol className="sline-list">
      {items.map((it, i) => (
        <StudyLine key={i} fr={it.fr} zh={it.zh} n={numbered ? i + 1 : null} />
      ))}
    </ol>
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
          <div className="examples-head">
            <h4 className="examples-title">🔊 例句練習</h4>
            <PlayAllButton lines={grammar.examples.map((ex) => ex.fr)} className="btn btn-sm" />
          </div>
          <StudyItems items={grammar.examples} numbered force="lines" />
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
