import { useMemo, useState } from 'react'
import { deleteCustomCard, toggleUnfamiliar, updateCustomCard } from '../store'
import { countsFor, dayKey, getSrs, masteryOf } from '../srs'
import { navigate } from '../router'
import { EmptyState, Flashcard, PageHeader, Segmented } from '../ui'

export default function BankView({ cards, reload }) {
  const [filter, setFilter] = useState('all')
  const bank = useMemo(() => cards.filter((c) => c.unfamiliar || c.custom), [cards])
  const srs = getSrs()
  const today = dayKey()
  const counts = countsFor(bank)

  const groups = useMemo(() => {
    const due = []
    const learning = []
    const mastered = []
    const untouched = []
    for (const c of bank) {
      const s = srs[c.id]
      if (!s) untouched.push(c)
      else if (s.due <= today) due.push(c)
      else if (masteryOf(s).level >= 3) mastered.push(c)
      else learning.push(c)
    }
    return { due, learning, mastered, untouched }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank])

  const FILTERS = [
    { key: 'all', label: '全部', count: bank.length },
    { key: 'due', label: '🔁 待複習', count: groups.due.length },
    { key: 'untouched', label: '未複習過', count: groups.untouched.length },
    { key: 'learning', label: '學習中', count: groups.learning.length },
    { key: 'mastered', label: '已熟悉', count: groups.mastered.length },
    { key: 'custom', label: '✍️ 自訂卡', count: bank.filter((c) => c.custom).length },
  ]

  const shown =
    filter === 'all'
      ? bank
      : filter === 'custom'
        ? bank.filter((c) => c.custom)
        : groups[filter] ?? []

  const cardProps = {
    onToggleUnfamiliar: (id) => {
      toggleUnfamiliar(id)
      reload()
    },
    onDelete: (id) => {
      deleteCustomCard(id)
      reload()
    },
    onSave: (id, patch) => {
      updateCustomCard(id, patch)
      reload()
    },
  }

  return (
    <>
      <PageHeader
        icon="⭐"
        title="我的單字庫"
        description="在任何單字卡點 ☆ 就會加進來，並自動排進「每日複習」的記憶排程。"
        actions={
          bank.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/review?scope=bank')}
            >
              {counts.due > 0 ? `複習 ${counts.due} 張到期的字 →` : '開始複習 →'}
            </button>
          )
        }
      />

      {bank.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="單字庫還是空的"
          action={
            <button type="button" className="btn btn-primary" onClick={() => navigate('/cards')}>
              📇 去單字卡挑幾個字
            </button>
          }
        >
          到「單字卡」或「每日複習」點卡片右上角的 ☆，把不熟的字收藏進來吧。
        </EmptyState>
      ) : (
        <>
          <div className="filter-bar">
            <Segmented ariaLabel="熟練度篩選" options={FILTERS} value={filter} onChange={setFilter} />
          </div>

          <p className="result-count">{shown.length} 張卡</p>

          {shown.length === 0 ? (
            <EmptyState icon="🗂️" title="這一組目前是空的">
              換個篩選條件看看。
            </EmptyState>
          ) : (
            <div className="card-grid">
              {shown.map((card) => (
                <Flashcard key={card.id} card={card} {...cardProps} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
