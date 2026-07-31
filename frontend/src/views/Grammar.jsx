import { useMemo, useState } from 'react'
import { GRAMMAR } from '../store'
import { navigate } from '../router'
import { EmptyState, GrammarBody, PageHeader, SearchField, Segmented } from '../ui'

const LEVELS = ['A1', 'A2']

export default function GrammarView({ route }) {
  const routeLevel = route.segments[1]
  const routeOrder = route.segments[2]
  const level = LEVELS.includes(routeLevel) ? routeLevel : 'A1'
  const openId = routeOrder != null ? `${level}-${routeOrder}` : null
  const [q, setQ] = useState('')

  const needle = q.trim().toLowerCase()
  const shown = useMemo(
    () =>
      GRAMMAR.filter((g) => g.level === level).filter(
        (g) =>
          !needle ||
          g.title.toLowerCase().includes(needle) ||
          g.summary?.toLowerCase().includes(needle) ||
          g.content?.toLowerCase().includes(needle),
      ),
    [level, needle],
  )

  return (
    <>
      <PageHeader
        icon="📘"
        title="文法教學"
        description="每個規則都附中文說明與可發音的法文例句；點標題展開，網址可直接分享。"
      />

      <div className="filter-bar">
        <Segmented
          ariaLabel="程度"
          options={LEVELS.map((lv) => ({ key: lv, label: `${lv} 文法` }))}
          value={level}
          onChange={(lv) => navigate(`/grammar/${lv}`)}
        />
      </div>

      <SearchField value={q} onChange={setQ} placeholder="搜尋文法主題，例如：冠詞、否定、時態…" />

      {shown.length === 0 ? (
        <EmptyState icon="📘" title={`${level} 沒有符合「${q}」的文法主題`}>
          換個關鍵字，或切換到另一個程度。
        </EmptyState>
      ) : (
        <div className="accordion">
          {shown.map((g) => {
            const id = `${g.level}-${g.orderIndex}`
            const open = openId === id
            return (
              <div key={id} className={open ? 'accordion-item open' : 'accordion-item'}>
                <button
                  type="button"
                  className="accordion-head"
                  aria-expanded={open}
                  onClick={() =>
                    navigate(open ? `/grammar/${g.level}` : `/grammar/${g.level}/${g.orderIndex}`)
                  }
                >
                  <span className="accordion-index">{g.orderIndex}</span>
                  <span className="accordion-text">
                    <span className="accordion-title">{g.title}</span>
                    <span className="accordion-sub">{g.summary}</span>
                  </span>
                  <span className="accordion-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="accordion-body">
                    <GrammarBody grammar={g} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
