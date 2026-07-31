import { useMemo, useState } from 'react'
import { DIALOGUES, DIALOGUE_CATEGORIES } from '../store'
import { navigate } from '../router'
import { DialogueLines, EmptyState, KeyPoints, PageHeader, PlayAllButton, SearchField } from '../ui'

export default function DialoguesView({ route }) {
  const [q, setQ] = useState('')
  const routeId = Number(route.segments[1])
  const dialogue = DIALOGUES.find((d) => d.id === routeId) ?? DIALOGUES[0]
  // The selected dialogue decides which category tab is active, so the URL
  // stays the only source of truth.
  const category = dialogue.category

  const needle = q.trim().toLowerCase()
  const list = useMemo(() => {
    if (needle) {
      return DIALOGUES.filter(
        (d) =>
          d.title.toLowerCase().includes(needle) ||
          d.scene?.toLowerCase().includes(needle) ||
          d.category.toLowerCase().includes(needle),
      )
    }
    return DIALOGUES.filter((d) => d.category === category)
  }, [needle, category])

  return (
    <>
      <PageHeader
        icon="💬"
        title="情境對話"
        description={`${DIALOGUES.length} 個真實場景：點單句聽發音，或整段連續播放。`}
      />

      <SearchField value={q} onChange={setQ} placeholder="搜尋情境：餐廳、退貨、看醫生…" />

      {!needle && (
        <div className="chip-row">
          {DIALOGUE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={cat === category ? 'chip active' : 'chip'}
              onClick={() => {
                const first = DIALOGUES.find((d) => d.category === cat)
                if (first) navigate(`/dialogues/${first.id}`)
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="split">
        <nav className="split-list" aria-label="對話列表">
          {list.length === 0 && <p className="muted">找不到符合的情境。</p>}
          {list.map((d) => (
            <button
              key={d.id}
              type="button"
              className={d.id === dialogue.id ? 'split-item active' : 'split-item'}
              onClick={() => navigate(`/dialogues/${d.id}`)}
            >
              <span className="split-item-title">{d.title}</span>
              <span className="split-item-sub">{d.category}</span>
            </button>
          ))}
        </nav>

        <div className="split-main">
          {!dialogue ? (
            <EmptyState icon="💬" title="選一個情境開始" />
          ) : (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">{dialogue.title}</h2>
                  <p className="panel-sub">
                    {dialogue.scene}
                    {dialogue.level ? ` · ${dialogue.level}` : ''}
                  </p>
                </div>
                <div className="panel-actions">
                  <PlayAllButton lines={dialogue.lines.map((l) => l.french)} className="btn" />
                </div>
              </div>
              <DialogueLines lines={dialogue.lines} />
              <KeyPoints points={dialogue.keyPoints} />
            </section>
          )}
        </div>
      </div>
    </>
  )
}
