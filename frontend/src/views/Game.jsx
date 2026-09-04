import { useEffect, useMemo, useRef, useState } from 'react'
import { SCENES, finishScene, gameStats, loadGame, starsFor } from '../game'
import { navigate } from '../router'
import { speakFrench, stopSpeaking } from '../speech'
import Avatar, { Character } from '../avatars'
import Scenery from '../scenery'
import { PageHeader, SpeakButton } from '../ui'

function Stars({ n, max = 3 }) {
  return (
    <span className="stars" aria-label={`${n} / ${max} 顆星`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'star on' : 'star'} aria-hidden="true">★</span>
      ))}
    </span>
  )
}

/**
 * Options are authored with the correct answer first, which would make every
 * question answerable without reading. Shuffle them per step — seeded by the
 * step's identity so the order is stable across re-renders (picking an answer
 * re-renders, and the list must not jump under the cursor).
 */
function shuffleOptions(options, seedText) {
  // FNV-1a for the seed + xorshift32 for the stream: a weaker pairing makes
  // neighbouring seeds ("scene:0", "scene:1") produce the same permutation.
  let seed = 2166136261
  for (const ch of seedText) {
    seed ^= ch.charCodeAt(0)
    seed = Math.imul(seed, 16777619) >>> 0
  }
  const rand = () => {
    seed ^= (seed << 13) >>> 0
    seed >>>= 0
    seed ^= seed >>> 17
    seed ^= (seed << 5) >>> 0
    seed >>>= 0
    return seed / 2 ** 32
  }
  const out = options.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/* --------------------------- the notebook overlay -------------------------- */

function Notes({ scene }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={open ? 'notes-float' : 'notes-float closed'}>
      <button type="button" className="notes-head" onClick={() => setOpen((o) => !o)}>
        <span className="notes-title">📝 學習筆記</span>
        <span className="notes-toggle" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <>
          <p className="notes-topic">{scene.topic}</p>
          <ul className="notes-list">
            {scene.vocab.map((v, i) => (
              <li key={i}>
                <button type="button" className="notes-word" onClick={() => speakFrench(v.fr)}>
                  <span className="nw-fr">{v.fr}</span>
                  <span className="nw-zh">{v.zh}</span>
                  <span className="nw-spk" aria-hidden="true">🔊</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/* -------------------------------- the scene ------------------------------- */

function ScenePlayer({ scene, onFinish, onStep }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const topRef = useRef(null)

  const step = scene.steps[index]
  const options = useMemo(
    () => shuffleOptions(step.options, `${scene.id}:${index}`),
    [scene.id, index, step.options],
  )
  const answered = picked !== null
  const chosen = answered ? options[picked] : null
  const right = options.find((o) => o.correct)

  useEffect(() => {
    if (done) return
    onStep(index)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    speakFrench(step.npc.fr)
    return () => stopSpeaking()
  }, [scene.id, index, done, onStep])

  function choose(i) {
    if (answered) return
    setPicked(i)
    if (options[i].correct) {
      setScore((n) => n + 1)
      speakFrench(options[i].fr)
    }
  }

  function next() {
    if (index + 1 < scene.steps.length) {
      setIndex(index + 1)
      setPicked(null)
    } else {
      stopSpeaking()
      setDone(true)
      onFinish(score, scene.steps.length)
    }
  }

  if (done) {
    const stars = starsFor(score, scene.steps.length)
    const nextScene = SCENES[SCENES.findIndex((s) => s.id === scene.id) + 1]
    return (
      <div className="game-result">
        <span className="result-icon" aria-hidden="true">
          {stars === 3 ? '🏆' : stars === 2 ? '🎉' : '💪'}
        </span>
        <h2>{stars === 3 ? '完美通關！' : stars === 2 ? '過關了！' : '完成了，再練一次會更好'}</h2>
        <Stars n={stars} />
        <p className="result-score">
          答對 <strong>{score}</strong> / {scene.steps.length} 題 · 獲得 <strong>{score * 10}</strong> XP
        </p>
        <div className="result-actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setIndex(0)
              setPicked(null)
              setScore(0)
              setDone(false)
            }}
          >
            🔁 再玩一次
          </button>
          {nextScene && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/game/${encodeURIComponent(nextScene.id)}`)}
            >
              下一幕：{nextScene.icon} {nextScene.title} ▸
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/game')}>
            回到地圖
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="stage-frame" ref={topRef}>
        <Scenery sceneId={scene.id} />

        <div className="stage-tags">
          <span className="scene-tag">
            情境對話
            <span className="scene-tag-q" title={scene.intro}>?</span>
          </span>
          <span className="step-count">第 {index + 1} / {scene.steps.length} 題</span>
        </div>

        <div className="stage-bubble">
          <Avatar id={scene.npc.avatar} size={44} ring={false} className="bubble-face" />
          <div className="bubble-text">
            <p className="bubble-fr">
              {step.npc.fr}
              <SpeakButton text={step.npc.fr} label="再聽一次" />
            </p>
            <p className="bubble-zh">{step.npc.zh}</p>
          </div>
        </div>

        {/* middle band: characters and the notebook both sit on its floor, so
            they stay just above the choices however tall that block gets */}
        <div className="stage-mid">
          <div className="stage-cast">
            <div className="cast-slot">
              <Character id={scene.npc.avatar} height={200} />
              <span className="cast-name">{scene.npc.name}</span>
            </div>
            <div className="cast-slot">
              <Character id="player" height={172} />
              <span className="cast-name">你</span>
            </div>
          </div>
          <Notes scene={scene} />
        </div>

        <div className="stage-band">
          <span className="band-label">請選擇你的回應</span>
          <div className="choice-stack">
            {options.map((o, i) => {
              const isPicked = picked === i
              const cls = !answered
                ? 'choice'
                : o.correct
                  ? 'choice correct'
                  : isPicked
                    ? 'choice wrong'
                    : 'choice dim'
              return (
                <button key={i} type="button" className={cls} disabled={answered} onClick={() => choose(i)}>
                  <span className="choice-mark" aria-hidden="true">
                    {answered ? (o.correct ? '✓' : isPicked ? '✕' : '·') : '🔊'}
                  </span>
                  <span className="choice-text">
                    <span className="choice-fr">{o.fr}</span>
                    <span className="choice-zh">{o.zh}</span>
                  </span>
                  {!answered && i === 0 && <span className="choice-hand" aria-hidden="true">👆</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {answered && (
        <div className={chosen.correct ? 'feedback ok' : 'feedback no'}>
          <p className="fb-head">
            {chosen.correct ? '✅ 答對了！' : '❌ 這句不太對'}
            {!chosen.correct && <span className="fb-sub">別擔心，看看下面的說明</span>}
          </p>
          <p className="fb-why">{chosen.why}</p>

          {!chosen.correct && (
            <div className="fb-answer">
              <p className="fb-answer-label">✓ 正確說法</p>
              <p className="fb-answer-fr">
                {right.fr}
                <SpeakButton text={right.fr} label="聽正確說法" />
              </p>
              <p className="fb-answer-zh">{right.zh}</p>
              <p className="fb-why">{right.why}</p>
            </div>
          )}

          <button type="button" className="btn btn-primary" onClick={next}>
            {index + 1 < scene.steps.length ? '下一題 ▸' : '完成這一幕 ▸'}
          </button>
        </div>
      )}
    </>
  )
}

/* ------------------------------- scene picker ----------------------------- */

function SceneMap({ progress, stats }) {
  const chapters = []
  for (const s of SCENES) {
    const last = chapters[chapters.length - 1]
    if (last && last.name === s.chapter) last.scenes.push(s)
    else chapters.push({ name: s.chapter, scenes: [s] })
  }

  return (
    <>
      <PageHeader
        icon="🎮"
        title="巴黎生活"
        description="想像你剛搬到巴黎。跟店員、路人、室友對話，每一句都有選擇題和詳解 —— 選錯也沒關係，會告訴你為什麼。"
      />

      <div className="game-summary">
        <div className="gs-card"><span className="gs-num">Lv.{stats.level}</span><span className="gs-label">目前等級</span></div>
        <div className="gs-card"><span className="gs-num">{stats.scenesDone}/{stats.scenesTotal}</span><span className="gs-label">完成場景</span></div>
        <div className="gs-card"><span className="gs-num">★ {stats.stars}/{stats.starsTotal}</span><span className="gs-label">獲得星星</span></div>
        <div className="gs-card"><span className="gs-num">🪙 {stats.coins.toLocaleString()}</span><span className="gs-label">歐元存款</span></div>
      </div>

      {chapters.map((ch) => (
        <section key={ch.name} className="chapter">
          <h2 className="chapter-title">{ch.name}</h2>
          <div className="scene-grid">
            {ch.scenes.map((s) => {
              const p = progress.scenes[s.id]
              return (
                <button
                  key={s.id}
                  type="button"
                  className={p?.done ? 'scene-card done' : 'scene-card'}
                  onClick={() => navigate(`/game/${encodeURIComponent(s.id)}`)}
                >
                  <span className="sc-icon" aria-hidden="true">{s.icon}</span>
                  <span className="sc-body">
                    <span className="sc-day">第 {s.order} 幕 · {s.topic}</span>
                    <span className="sc-title">{s.title}</span>
                    <span className="sc-place">{s.place} · {s.time} {s.weather}</span>
                    <span className="sc-goal">🎯 {s.goal}</span>
                  </span>
                  <span className="sc-foot">
                    <span className="sc-npc">
                      <Avatar id={s.npc.avatar} size={26} ring={false} />
                      {s.npc.name}
                    </span>
                    <span className="chip sm ghost">{s.level}</span>
                    {p?.done ? <Stars n={p.stars} /> : <span className="sc-cta">開始 ▸</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}

/* --------------------------------- shell ---------------------------------- */

export default function GameView({ route }) {
  const [version, setVersion] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const progress = useMemo(() => loadGame(), [version])
  const stats = useMemo(() => gameStats(progress), [progress])

  const scene = SCENES.find((s) => s.id === route.segments[1])
  if (!scene) return <SceneMap progress={progress} stats={stats} />

  const p = progress.scenes[scene.id]
  const pct = Math.round((stats.stepsCleared / stats.stepsTotal) * 100)

  return (
    <div className="game">
      <header className="game-hud">
        <div className="hud-player">
          <span className="hud-frame"><Avatar id="player" size={46} ring={false} /></span>
          <span className="hud-player-text">
            <span className="hud-name">巴黎新生活</span>
            <span className="hud-level">Lv.{stats.level}</span>
          </span>
          <span className="hud-xp-wrap">
            <span className="hud-xp"><span style={{ width: `${stats.levelXp}%` }} /></span>
            <span className="hud-xp-pct">{stats.levelXp}%</span>
          </span>
        </div>

        <div className="hud-goal">
          <span className="hud-goal-label">任務目標</span>
          <span className="hud-goal-text">{scene.goal}</span>
          <span className="hud-goal-count">
            <span aria-hidden="true">✨</span> ({stepIndex}/{scene.steps.length})
          </span>
        </div>

        <div className="hud-stats">
          <span className="hud-pill"><span aria-hidden="true">⚡</span> {stats.stepsCleared}/{stats.stepsTotal}</span>
          <span className="hud-pill"><span aria-hidden="true">🪙</span> {stats.coins.toLocaleString()}</span>
          <button type="button" className="hud-exit" onClick={() => navigate('/game')}>← 地圖</button>
        </div>
      </header>

      <div className="game-main">
        <section className="game-stage">
          <ScenePlayer
            key={scene.id}
            scene={scene}
            onStep={setStepIndex}
            onFinish={(correct, total) => {
              finishScene(scene.id, correct, total)
              setVersion((v) => v + 1)
            }}
          />
        </section>

        <aside className="game-side">
          <div className="side-card map-card">
            <div className="map-head">
              <span className="map-title">{scene.place}</span>
              <span className="map-time">{scene.time} {scene.weather}</span>
            </div>
            <div className="minimap">
              <Scenery sceneId={scene.id} className="minimap-art" />
              <span className="minimap-pin" aria-hidden="true">📍</span>
            </div>
            <div className="map-links">
              {[
                { icon: '🗺️', label: '地圖', to: '/game' },
                { icon: '🎒', label: '單字庫', to: '/bank' },
                { icon: '📅', label: '課程', to: '/lessons' },
                { icon: '💬', label: '對話', to: '/dialogues' },
              ].map((l) => (
                <button key={l.label} type="button" className="map-link" onClick={() => navigate(l.to)}>
                  <span aria-hidden="true">{l.icon}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="side-card">
            <h3 className="side-title">任務列表</h3>
            <ul className="quest-list">
              {scene.steps.map((st, i) => (
                <li key={i} className={i < stepIndex ? 'quest done' : i === stepIndex ? 'quest now' : 'quest'}>
                  <span className="quest-icon" aria-hidden="true">
                    {i < stepIndex ? '✅' : i === stepIndex ? '✨' : '⬜'}
                  </span>
                  <span className="quest-text">{st.prompt}</span>
                  <span className="quest-count">({i < stepIndex ? 1 : 0}/1)</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="side-card">
            <h3 className="side-title">今日學習進度</h3>
            <div className="progress-row">
              <div className="pct-ring" style={{ '--pct': `${pct}%` }}><span>{pct}%</span></div>
              <ul className="progress-legend">
                <li><span className="dot brand" />學習單字<strong>{scene.vocab.length}</strong></li>
                <li><span className="dot warn" />這一幕<strong>{p?.correct ?? 0}/{scene.steps.length}</strong></li>
                <li><span className="dot ok" />完成場景<strong>{stats.scenesDone}/{stats.scenesTotal}</strong></li>
              </ul>
            </div>
            {p?.done && <Stars n={p.stars} />}
          </div>

          <div className="side-card">
            <h3 className="side-title">對話對象</h3>
            <div className="side-npc">
              <Avatar id={scene.npc.avatar} size={52} />
              <div>
                <p className="side-npc-name">{scene.npc.name}</p>
                <p className="side-npc-role">{scene.npc.role}</p>
              </div>
            </div>
            <p className="side-intro">{scene.intro}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
