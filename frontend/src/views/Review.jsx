import { useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS, toggleUnfamiliar } from '../store'
import { GRADES, buildQueue, countsFor, getGoal, gradeCard, masteryOf, getCardState, todayStats } from '../srs'
import { speakFrench } from '../speech'
import { navigate, replaceQuery } from '../router'
import {
  CopyButton,
  EmptyState,
  GenderBadge,
  PageHeader,
  ProgressBar,
  Segmented,
  genderInfo,
} from '../ui'

const SCOPES = [
  { key: 'bank', label: '⭐ 單字庫' },
  { key: 'A1', label: 'A1' },
  { key: 'A2', label: 'A2' },
  { key: 'B1', label: 'B1' },
  { key: 'all', label: '全部' },
]

const K_AUTOSPEAK = 'fl_review_autospeak'

export default function ReviewView({ cards, reload, route }) {
  const scope = SCOPES.some((s) => s.key === route.query.scope) ? route.query.scope : 'bank'
  const [autoSpeak, setAutoSpeak] = useState(() => localStorage.getItem(K_AUTOSPEAK) !== '0')
  const [queue, setQueue] = useState([])
  const [ready, setReady] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [session, setSession] = useState({ done: 0, again: 0, started: 0 })
  const [round, setRound] = useState(0) // bumped to restart a session
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  const pool = useMemo(() => {
    if (scope === 'bank') return cards.filter((c) => c.unfamiliar || c.custom)
    if (LEVELS.includes(scope)) return cards.filter((c) => c.level === scope)
    return cards
  }, [cards, scope])

  // recomputed as you grade, so the "待複習" figure stays honest
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const counts = useMemo(() => countsFor(pool), [pool, session.done])

  // A session is built once per scope (or restart) so grading doesn't reshuffle
  // the cards under the learner's fingers.
  useEffect(() => {
    const source =
      scope === 'bank'
        ? cardsRef.current.filter((c) => c.unfamiliar || c.custom)
        : LEVELS.includes(scope)
          ? cardsRef.current.filter((c) => c.level === scope)
          : cardsRef.current
    const { queue: q } = buildQueue(source, getGoal())
    setQueue(q.map((c) => c.id))
    setSession({ done: 0, again: 0, started: q.length })
    setFlipped(false)
    setReady(true)
  }, [scope, round])

  const currentId = queue[0]
  const card = currentId ? byId.get(currentId) : null

  function say(text) {
    if (text) speakFrench(text)
  }

  function reveal() {
    setFlipped(true)
    if (autoSpeak && card) say(card.french)
  }

  function grade(key) {
    if (!card) return
    gradeCard(card.id, key)
    setSession((s) => ({ ...s, done: s.done + 1, again: s.again + (key === 'again' ? 1 : 0) }))
    setQueue((q) => (key === 'again' ? [...q.slice(1), q[0]] : q.slice(1)))
    setFlipped(false)
  }

  function skip() {
    setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q))
    setFlipped(false)
  }

  // Keyboard: space flips, 1/2/3 grade, S speaks, → skips.
  useEffect(() => {
    function onKey(e) {
      if (e.target.matches?.('input, textarea, select')) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!flipped) reveal()
        return
      }
      if (e.key.toLowerCase() === 's') return say(card?.french)
      if (e.key === 'ArrowRight') return skip()
      if (flipped && ['1', '2', '3'].includes(e.key)) grade(GRADES[Number(e.key) - 1].key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function setScope(next) {
    replaceQuery('review', [], { scope: next })
  }

  const today = todayStats()
  const goal = getGoal()
  const g = card ? genderInfo(card) : null
  const mastery = card ? masteryOf(getCardState(card.id)) : null

  return (
    <>
      <PageHeader
        icon="🔁"
        title="每日複習"
        description="答對的字會隔幾天再出現，答錯的馬上再練一次 — 用最少的時間記住最多的字。"
      />

      <div className="filter-bar">
        <Segmented ariaLabel="複習範圍" options={SCOPES} value={scope} onChange={setScope} />
        <label className="toggle">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => {
              setAutoSpeak(e.target.checked)
              localStorage.setItem(K_AUTOSPEAK, e.target.checked ? '1' : '0')
            }}
          />
          翻面時自動發音
        </label>
      </div>

      <div className="review-meta">
        <span>今日 {today.reviews} / {goal}</span>
        <span>· 範圍內待複習 {counts.due}</span>
        <span>· 已熟悉 {counts.mastered}</span>
      </div>

      {session.started > 0 && (
        <ProgressBar
          value={session.started - queue.length}
          max={session.started}
          label="本回合進度"
          tone="success"
        />
      )}

      {!ready ? null : !card ? (
        session.done > 0 ? (
          <div className="review-done">
            <span className="review-done-icon" aria-hidden="true">🎉</span>
            <h2>Bravo ！這一輪複習完成</h2>
            <p className="muted">
              這回合複習了 {session.done} 次，其中 {session.again} 次需要再看一遍。
            </p>
            <div className="review-done-actions">
              <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
                再來一輪
              </button>
              <button type="button" className="btn" onClick={() => navigate('/quiz')}>
                ✏️ 換做測驗
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="✅"
            title="這個範圍現在沒有要複習的字"
            action={
              <div className="review-done-actions">
                <button type="button" className="btn btn-primary" onClick={() => navigate('/cards')}>
                  📇 去單字卡收藏新字
                </button>
                <button type="button" className="btn" onClick={() => setScope('A1')}>
                  改複習 A1
                </button>
              </div>
            }
          >
            收藏（☆）過的字會在這裡依照記憶排程出現；也可以直接切換到 A1／A2／B1 開始學新字。
          </EmptyState>
        )
      ) : (
        <div className="review-stage">
          <div className={flipped ? 'review-card flipped' : 'review-card'}>
            <div className="review-card-top">
              {mastery.level > 0 && (
                <span className={`mastery mastery-${mastery.key}`}>{mastery.label}</span>
              )}
              <span className="review-level">{card.level}{card.tag ? ` · ${card.tag}` : ''}</span>
              <button
                type="button"
                className={card.unfamiliar ? 'star on' : 'star'}
                aria-pressed={Boolean(card.unfamiliar)}
                aria-label={card.unfamiliar ? '從單字庫移除' : '加入單字庫'}
                onClick={() => {
                  toggleUnfamiliar(card.id)
                  reload()
                }}
              >
                {card.unfamiliar ? '★' : '☆'}
              </button>
            </div>

            <p className="review-french">{card.french}</p>
            <div className="review-badges">
              {g && (
                <span className={g.isMasc ? 'art-badge masc' : 'art-badge fem'}>
                  {g.indef} · {g.def}
                </span>
              )}
              {card.partOfSpeech && <span className="pos">{card.partOfSpeech}</span>}
              <button type="button" className="btn btn-ghost" onClick={() => say(card.french)}>
                🔊 發音<kbd>S</kbd>
              </button>
              <CopyButton text={card.french} label={`複製「${card.french}」`} className="copy-btn-lg" />
            </div>

            {flipped ? (
              <div className="review-answer">
                <p className="review-translation">{card.translation}</p>
                <GenderBadge gender={card.gender} />
                {card.example && (
                  <div className="review-example">
                    <p>
                      🇫🇷 {card.example}
                      <button
                        type="button"
                        className="speak-mini"
                        aria-label="唸出例句"
                        onClick={() => say(card.example)}
                      >
                        🔊
                      </button>
                      <CopyButton text={card.example} label="複製例句" />
                    </p>
                    {card.exampleTranslation && <p className="muted">{card.exampleTranslation}</p>}
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn btn-primary btn-block" onClick={reveal}>
                顯示答案 <kbd>空白鍵</kbd>
              </button>
            )}
          </div>

          {flipped && (
            <div className="grade-row">
              {GRADES.map((gr, i) => (
                <button
                  key={gr.key}
                  type="button"
                  className={`grade grade-${gr.tone}`}
                  onClick={() => grade(gr.key)}
                >
                  <span className="grade-label">{gr.label}</span>
                  <span className="grade-hint">{gr.hint}</span>
                  <kbd>{i + 1}</kbd>
                </button>
              ))}
            </div>
          )}

          <div className="review-foot">
            <button type="button" className="btn btn-ghost" onClick={skip}>
              稍後再看 <kbd>→</kbd>
            </button>
            <span className="muted">剩餘 {queue.length} 張</span>
          </div>
        </div>
      )}
    </>
  )
}
