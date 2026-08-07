import { useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS } from '../store'
import { dayKey, getSrs, gradeCard } from '../srs'
import { speakFrench } from '../speech'
import { replaceQuery } from '../router'
import { CopyButton, EmptyState, PageHeader, Segmented } from '../ui'

const MODES = [
  { key: 'fr-zh', label: '法 → 中', hint: '看法文選中文' },
  { key: 'zh-fr', label: '中 → 法', hint: '看中文選法文' },
  { key: 'listen', label: '🎧 聽力', hint: '只聽發音選出正確的字' },
]

const SCOPES = [
  { key: 'all', label: '全部' },
  { key: 'A1', label: 'A1' },
  { key: 'A2', label: 'A2' },
  { key: 'B1', label: 'B1' },
  { key: 'bank', label: '⭐ 單字庫' },
  { key: 'due', label: '🔁 待複習' },
]

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizView({ cards, route }) {
  const mode = MODES.some((m) => m.key === route.query.mode) ? route.query.mode : 'fr-zh'
  const scope = SCOPES.some((s) => s.key === route.query.scope) ? route.query.scope : 'all'
  const [q, setQ] = useState(null)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0, best: 0 })
  const recent = useRef([])

  const pool = useMemo(() => {
    if (scope === 'bank') return cards.filter((c) => c.unfamiliar || c.custom)
    if (scope === 'due') {
      const srs = getSrs()
      const today = dayKey()
      return cards.filter((c) => srs[c.id] && srs[c.id].due <= today)
    }
    if (LEVELS.includes(scope)) return cards.filter((c) => c.level === scope)
    return cards
  }, [cards, scope])

  // The answer key differs per mode, so distractors must be unique on that field.
  const answerField = mode === 'fr-zh' ? 'translation' : 'french'

  function newQuestion(currentPool = pool) {
    if (currentPool.length < 4) {
      setQ(null)
      return
    }
    // avoid repeating the last few words
    const fresh = currentPool.filter((c) => !recent.current.includes(c.id))
    const source = fresh.length >= 4 ? fresh : currentPool
    const answer = source[Math.floor(Math.random() * source.length)]
    const seen = new Set([answer[answerField]])
    const distractors = []
    for (const c of shuffle(currentPool)) {
      if (!seen.has(c[answerField])) {
        seen.add(c[answerField])
        distractors.push(c)
        if (distractors.length === 3) break
      }
    }
    if (distractors.length < 3) {
      setQ(null)
      return
    }
    recent.current = [answer.id, ...recent.current].slice(0, 12)
    setQ({ answer, options: shuffle([answer, ...distractors]) })
    setPicked(null)
  }

  useEffect(() => {
    setScore({ correct: 0, total: 0, streak: 0, best: 0 })
    recent.current = []
    newQuestion(pool)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, scope, pool.length])

  // Listening mode plays the word as soon as the question appears.
  useEffect(() => {
    if (mode === 'listen' && q && !picked) speakFrench(q.answer.french)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, mode])

  function pick(opt) {
    if (picked || !q) return
    const correct = opt[answerField] === q.answer[answerField]
    setPicked(opt)
    setScore((s) => {
      const streak = correct ? s.streak + 1 : 0
      return {
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
        streak,
        best: Math.max(s.best, streak),
      }
    })
    // A quiz answer is a real review — feed it into the spaced-repetition plan.
    gradeCard(q.answer.id, correct ? 'good' : 'again')
    if (mode !== 'listen' && correct) speakFrench(q.answer.french)
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.matches?.('input, textarea, select')) return
      if (!picked && ['1', '2', '3', '4'].includes(e.key)) {
        const opt = q?.options[Number(e.key) - 1]
        if (opt) pick(opt)
        return
      }
      if (picked && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        newQuestion()
      }
      if (e.key.toLowerCase() === 's' && q) speakFrench(q.answer.french)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const accuracy = score.total ? Math.round((score.correct / score.total) * 100) : 0

  return (
    <>
      <PageHeader
        icon="✏️"
        title="牛刀小試"
        description="答對的字會延後再考，答錯的會排進今天的複習。鍵盤 1–4 作答、Enter 下一題。"
      />

      <div className="filter-bar">
        <Segmented
          ariaLabel="測驗模式"
          options={MODES}
          value={mode}
          onChange={(m) => replaceQuery('quiz', [], { mode: m, scope })}
        />
        <Segmented
          ariaLabel="出題範圍"
          options={SCOPES}
          value={scope}
          onChange={(s) => replaceQuery('quiz', [], { mode, scope: s })}
        />
      </div>

      <div className="scoreboard">
        <div className="score-item">
          <span className="score-num">{score.correct}/{score.total}</span>
          <span className="score-label">答對</span>
        </div>
        <div className="score-item">
          <span className="score-num">{accuracy}%</span>
          <span className="score-label">正確率</span>
        </div>
        <div className="score-item">
          <span className="score-num">🔥 {score.streak}</span>
          <span className="score-label">連續答對（最佳 {score.best}）</span>
        </div>
      </div>

      {!q ? (
        <EmptyState icon="🧩" title="這個範圍的單字不足以出題">
          至少需要 4 個不同的字。換個範圍，或先到「單字卡」收藏一些字。
        </EmptyState>
      ) : (
        <div className="quiz-card">
          <p className="quiz-prompt">{MODES.find((m) => m.key === mode).hint}</p>

          <div className="quiz-question">
            {mode === 'listen' ? (
              <button
                type="button"
                className="quiz-listen"
                onClick={() => speakFrench(q.answer.french)}
              >
                🔊 再聽一次 <kbd>S</kbd>
              </button>
            ) : mode === 'fr-zh' ? (
              <>
                <span className="quiz-fr">{q.answer.french}</span>
                <button
                  type="button"
                  className="speak-mini"
                  aria-label="發音"
                  onClick={() => speakFrench(q.answer.french)}
                >
                  🔊
                </button>
              </>
            ) : (
              <span className="quiz-zh">{q.answer.translation}</span>
            )}
          </div>

          <div className="quiz-options">
            {q.options.map((opt, i) => {
              let cls = 'quiz-option'
              if (picked) {
                if (opt[answerField] === q.answer[answerField]) cls += ' correct'
                else if (opt === picked) cls += ' wrong'
              }
              return (
                <button key={opt.id} type="button" className={cls} onClick={() => pick(opt)}>
                  <kbd>{i + 1}</kbd>
                  {opt[answerField]}
                </button>
              )
            })}
          </div>

          {picked && (
            <div className="quiz-feedback" aria-live="polite">
              <p className="quiz-result">
                {picked[answerField] === q.answer[answerField]
                  ? '✅ 答對了！'
                  : `❌ 正解：${q.answer[answerField]}`}
              </p>
              <p className="quiz-word">
                {q.answer.french} · {q.answer.translation}
                <CopyButton text={q.answer.french} label={`複製「${q.answer.french}」`} />
              </p>
              {q.answer.example && (
                <div className="quiz-example">
                  <p>
                    🇫🇷 {q.answer.example}
                    <button
                      type="button"
                      className="speak-mini"
                      aria-label="唸出例句"
                      onClick={() => speakFrench(q.answer.example)}
                    >
                      🔊
                    </button>
                    <CopyButton text={q.answer.example} label="複製例句" />
                  </p>
                  {q.answer.exampleTranslation && (
                    <p className="muted">{q.answer.exampleTranslation}</p>
                  )}
                </div>
              )}
              <button type="button" className="btn btn-primary" onClick={() => newQuestion()}>
                下一題 <kbd>Enter</kbd>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
