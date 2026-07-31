import { useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS, categoriesFor, addCustomCard, deleteCustomCard, toggleUnfamiliar, updateCustomCard } from '../store'
import { getCardState } from '../srs'
import { replaceQuery } from '../router'
import { EmptyState, Flashcard, PageHeader, SearchField, Segmented } from '../ui'

const PAGE = 48
const VISIBLE_TAGS = 12

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'bank', label: '⭐ 單字庫' },
  { key: 'new', label: '還沒學過' },
  { key: 'learning', label: '學習中' },
]

function AddCardForm({ level, reload, onClose }) {
  const blank = { french: '', translation: '', gender: '', example: '', exampleTranslation: '' }
  const [f, setF] = useState(blank)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  return (
    <form
      className="add-form"
      onSubmit={(e) => {
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
        setF(blank)
        reload()
      }}
    >
      <input placeholder="法文單字 *" value={f.french} onChange={set('french')} aria-label="法文單字" />
      <input placeholder="中文翻譯 *" value={f.translation} onChange={set('translation')} aria-label="中文翻譯" />
      <select value={f.gender} onChange={set('gender')} aria-label="性別">
        <option value="">性別（名詞）</option>
        <option value="m">陽性 (le)</option>
        <option value="f">陰性 (la)</option>
      </select>
      <input placeholder="法文例句（選填）" value={f.example} onChange={set('example')} aria-label="法文例句" />
      <input
        placeholder="例句中文翻譯（選填）"
        value={f.exampleTranslation}
        onChange={set('exampleTranslation')}
        aria-label="例句中文翻譯"
      />
      <div className="add-form-actions">
        <button type="submit" className="btn btn-primary">+ 新增到 {level}</button>
        <button type="button" className="btn" onClick={onClose}>收起</button>
      </div>
    </form>
  )
}

export default function CardsView({ cards, reload, route }) {
  const level = LEVELS.includes(route.query.level) ? route.query.level : 'A1'
  const tag = route.query.tag ?? ''
  const filter = FILTERS.some((f) => f.key === route.query.filter) ? route.query.filter : 'all'
  const [q, setQ] = useState(route.query.q ?? '')
  const [showAll, setShowAll] = useState(false)
  const [adding, setAdding] = useState(false)
  const [limit, setLimit] = useState(PAGE)
  const sentinel = useRef(null)

  // The URL is the single source of truth for level/tag/filter, so links to a
  // filtered list can be shared and the back button steps through them.
  function setParams(next) {
    replaceQuery('cards', [], { level, tag, filter, q, ...next })
  }

  useEffect(() => {
    const id = setTimeout(() => setParams({ q }), 250)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  useEffect(() => {
    setLimit(PAGE)
  }, [level, tag, filter, q])

  const tags = useMemo(() => categoriesFor(level), [level])
  const shownTags = showAll ? tags : tags.slice(0, VISIBLE_TAGS)

  const needle = q.trim().toLowerCase()
  const matches = useMemo(() => {
    return cards.filter((c) => {
      if (c.level !== level) return false
      if (tag && c.tag !== tag) return false
      if (filter === 'bank' && !c.unfamiliar && !c.custom) return false
      if (filter === 'new' && getCardState(c.id)) return false
      if (filter === 'learning' && !getCardState(c.id)) return false
      if (!needle) return true
      return (
        c.french?.toLowerCase().includes(needle) ||
        c.translation?.toLowerCase().includes(needle) ||
        c.example?.toLowerCase().includes(needle) ||
        c.exampleTranslation?.toLowerCase().includes(needle)
      )
    })
  }, [cards, level, tag, filter, needle])

  // Render in batches — a level holds 500+ cards and mounting them all is slow.
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setLimit((n) => (n < matches.length ? n + PAGE : n))
    })
    io.observe(el)
    return () => io.disconnect()
  }, [matches.length])

  const shown = matches.slice(0, limit)

  return (
    <>
      <PageHeader
        icon="📇"
        title="單字卡"
        description="點卡片翻面看中文與例句，☆ 收藏不熟的字，之後在「每日複習」自動排程。"
        actions={
          <button type="button" className="btn" onClick={() => setAdding((a) => !a)}>
            {adding ? '✕ 取消' : '＋ 自訂單字'}
          </button>
        }
      />

      {adding && <AddCardForm level={level} reload={reload} onClose={() => setAdding(false)} />}

      <div className="filter-bar">
        <Segmented
          ariaLabel="程度"
          options={LEVELS}
          value={level}
          onChange={(lv) => setParams({ level: lv, tag: '' })}
        />
        <Segmented
          ariaLabel="篩選"
          options={FILTERS}
          value={filter}
          onChange={(f) => setParams({ filter: f })}
        />
      </div>

      <SearchField value={q} onChange={setQ} placeholder={`在 ${level} 的單字裡搜尋…`} />

      <div className="chip-row">
        <button
          type="button"
          className={tag === '' ? 'chip active' : 'chip'}
          onClick={() => setParams({ tag: '' })}
        >
          全部主題
        </button>
        {shownTags.map((t) => (
          <button
            key={t}
            type="button"
            className={t === tag ? 'chip active' : 'chip'}
            onClick={() => setParams({ tag: t === tag ? '' : t })}
          >
            {t}
            <span className="chip-count">
              {cards.filter((c) => c.level === level && c.tag === t).length}
            </span>
          </button>
        ))}
        {tags.length > VISIBLE_TAGS && (
          <button type="button" className="chip chip-ghost" onClick={() => setShowAll((s) => !s)}>
            {showAll ? '收起主題 ▲' : `還有 ${tags.length - VISIBLE_TAGS} 個主題 ▼`}
          </button>
        )}
      </div>

      <p className="result-count">
        {matches.length} 張卡
        {tag && <> · 主題「{tag}」</>}
        {needle && <> · 符合「{q.trim()}」</>}
      </p>

      {matches.length === 0 ? (
        <EmptyState icon="📭" title="這個條件下沒有單字卡">
          試著清掉搜尋字或切換主題／篩選條件。
        </EmptyState>
      ) : (
        <>
          <div className="card-grid">
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
          {limit < matches.length && (
            <div ref={sentinel} className="load-more">
              <button type="button" className="btn" onClick={() => setLimit((n) => n + PAGE)}>
                載入更多（還有 {matches.length - limit} 張）
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
