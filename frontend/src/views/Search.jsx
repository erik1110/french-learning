import { useEffect, useMemo, useState } from 'react'
import { conjugate, searchAll, toggleUnfamiliar } from '../store'
import { navigate, replaceQuery } from '../router'
import {
  ConjGrid,
  DialogueLines,
  EmptyState,
  Flashcard,
  GrammarBody,
  PageHeader,
  PlayAllButton,
  SearchField,
  Segmented,
  SpeakableItems,
} from '../ui'

const SUGGESTIONS = ['國籍', '有', '游泳', '時間', '日期', '顏色', '家人', '點餐']
const CARD_LIMIT = 18

function ResultBlock({ title, sub, onOpen, openLabel, actions, children }) {
  return (
    <article className="panel result-block">
      <div className="panel-head">
        <div>
          <button type="button" className="result-jump" onClick={onOpen}>
            {title}
            <span className="result-arrow" aria-hidden="true">→</span>
          </button>
          {sub && <p className="panel-sub">{sub}</p>}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
      {children}
      {openLabel && (
        <button type="button" className="course-more" onClick={onOpen}>
          {openLabel}
        </button>
      )}
    </article>
  )
}

export default function SearchView({ cards, reload, route }) {
  const [q, setQ] = useState(route.query.q ?? '')
  const [type, setType] = useState('all')

  // Keep the URL in sync so a search can be shared or re-opened from history.
  useEffect(() => {
    const id = setTimeout(() => replaceQuery('search', [], { q: q.trim() }), 300)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    if (route.query.q != null && route.query.q !== q) setQ(route.query.q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.query.q])

  const results = useMemo(() => searchAll(q), [q])
  const liveById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  const TYPES = results
    ? [
        { key: 'all', label: '全部', count: results.total },
        { key: 'cards', label: '📇 單字', count: results.cards.length },
        { key: 'units', label: '🔢 主題', count: results.units.length },
        { key: 'grammar', label: '📘 文法', count: results.grammar.length },
        { key: 'verbs', label: '🔧 動詞', count: results.verbs.length },
        { key: 'dialogues', label: '💬 對話', count: results.dialogues.length },
        { key: 'lessons', label: '📅 課程', count: results.lessons.length },
      ].filter((t) => t.key === 'all' || t.count > 0)
    : []

  const show = (key) => type === 'all' || type === key

  return (
    <>
      <PageHeader
        icon="🔍"
        title="搜尋"
        description="輸入中文或法文，一次找出相關的單字、主題單元、文法、動詞變化、對話與上課內容。"
      />

      <SearchField
        value={q}
        onChange={setQ}
        placeholder="例如：國籍、有、游泳、時間…"
        autoFocus
      />

      <div className="chip-row">
        <span className="muted">試試：</span>
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
            {s}
          </button>
        ))}
      </div>

      {!results ? (
        <EmptyState icon="🔍" title="開始輸入關鍵字">
          搜尋會同時比對法文與中文，包含例句和對話內容。
        </EmptyState>
      ) : results.total === 0 ? (
        <EmptyState icon="🤔" title={`找不到與「${results.q}」相關的內容`}>
          換個關鍵字試試看，例如用中文的詞（顏色、天氣）或法文原形。
        </EmptyState>
      ) : (
        <>
          <div className="filter-bar">
            <Segmented ariaLabel="結果類型" options={TYPES} value={type} onChange={setType} />
          </div>

          {show('cards') && results.categories.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">🏷️ 相關單字主題</h2>
              <div className="cat-grid">
                {results.categories.map((c) => (
                  <button
                    key={`${c.level}-${c.tag}`}
                    type="button"
                    className="cat-card"
                    onClick={() => navigate(`/cards?level=${c.level}&tag=${encodeURIComponent(c.tag)}`)}
                  >
                    <span className="cat-card-tag">{c.tag}</span>
                    <span className="cat-card-meta">
                      {c.level} · {c.count} 個字 →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {show('cards') && results.cards.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">📇 單字卡（點卡片看造句）</h2>
              <div className="card-grid">
                {results.cards.slice(0, CARD_LIMIT).map((c) => (
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
              {results.cards.length > CARD_LIMIT && (
                <p className="muted">
                  …還有 {results.cards.length - CARD_LIMIT} 張，用上面的「相關單字主題」或到「單字卡」瀏覽全部。
                </p>
              )}
            </section>
          )}

          {show('units') && results.units.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">🔢 主題單元</h2>
              {results.units.slice(0, 4).map((u) => (
                <ResultBlock
                  key={u.id}
                  title={u.title}
                  sub={u.intro}
                  onOpen={() => navigate(`/units/${encodeURIComponent(u.id)}`)}
                  openLabel={
                    u.items.length > 12 ? `🔢 看全部 ${u.items.length} 個 →` : null
                  }
                  actions={<PlayAllButton lines={u.items.map((it) => it.fr)} className="btn btn-ghost btn-sm" />}
                >
                  <SpeakableItems items={u.items.slice(0, 12)} />
                </ResultBlock>
              ))}
            </section>
          )}

          {show('grammar') && results.grammar.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">📘 文法教學</h2>
              {results.grammar.slice(0, 4).map((g) => (
                <ResultBlock
                  key={`${g.level}-${g.orderIndex}`}
                  title={g.title}
                  sub={g.summary}
                  onOpen={() => navigate(`/grammar/${g.level}/${g.orderIndex}`)}
                >
                  <GrammarBody grammar={g} />
                </ResultBlock>
              ))}
            </section>
          )}

          {show('verbs') && results.verbs.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">🔧 動詞變化</h2>
              {results.verbs.slice(0, 3).map((v) => {
                const { present } = conjugate(v)
                return (
                  <ResultBlock
                    key={v.inf}
                    title={`${v.inf} · ${v.zh}`}
                    sub={`第 ${v.group} 組動詞 · 現在式`}
                    onOpen={() => navigate(`/verbs/${encodeURIComponent(v.inf)}`)}
                    openLabel={`🔧 看 ${v.inf} 完整變位 →`}
                  >
                    <ConjGrid forms={present} />
                  </ResultBlock>
                )
              })}
            </section>
          )}

          {show('dialogues') && results.dialogues.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">💬 情境對話</h2>
              {results.dialogues.slice(0, 3).map((d) => (
                <ResultBlock
                  key={d.id}
                  title={d.title}
                  sub={`${d.category} · ${d.scene}`}
                  onOpen={() => navigate(`/dialogues/${d.id}`)}
                  actions={<PlayAllButton lines={d.lines.map((l) => l.french)} className="btn btn-ghost btn-sm" />}
                >
                  <DialogueLines lines={d.lines} />
                </ResultBlock>
              ))}
            </section>
          )}

          {show('lessons') && results.lessons.length > 0 && (
            <section className="search-group">
              <h2 className="search-group-title">📅 課程複習</h2>
              {results.lessons.slice(0, 5).map((le) => (
                <button
                  key={le.id}
                  type="button"
                  className="result-row"
                  onClick={() => navigate(`/lessons/${encodeURIComponent(le.id)}`)}
                >
                  <span className="result-row-head">
                    <strong>{le.title}</strong>
                    <span className="muted"> · {le.date}</span>
                    <span className="result-arrow" aria-hidden="true">→</span>
                  </span>
                  <span className="muted">{le.summary}</span>
                </button>
              ))}
            </section>
          )}
        </>
      )}
    </>
  )
}
