import { useState } from 'react'
import { UNITS, findUnit } from '../store'
import { navigate } from '../router'
import { PageHeader, PlayAllButton, StudyItems } from '../ui'
import { SOUND_RULES } from '../pronunciation'

/** Collapsible cheat sheet: French spelling → the closest 注音 sound. */
function SoundCard() {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? 'sound-card open' : 'sound-card'}>
      <button type="button" className="sound-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="sound-title">ㄅ 發音對照表</span>
        <span className="sound-sub">看到這些拼法，大概要唸什麼音</span>
        <span className="sound-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="sound-list">
          {SOUND_RULES.map((r, i) => (
            <li key={i}>
              <span className="sr-fr">{r.fr}</span>
              <span className="sr-zy">{r.zy}</span>
              <span className="sr-body">
                <span className="sr-ex">{r.ex}</span>
                <span className="sr-tip">{r.tip}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function UnitsView({ route }) {
  const unit = findUnit(route.segments[1]) ?? UNITS[0]

  return (
    <>
      <PageHeader
        icon="🔢"
        title="單元主題"
        description="數字、時間、星期、月份、日期、金錢與基本句型。點 🔊 聽發音，滑過句子按 ㄅ 看注音提示。"
      />

      <SoundCard />

      <div className="chip-row">
        {UNITS.map((u) => (
          <button
            key={u.id}
            type="button"
            className={u.id === unit.id ? 'chip active' : 'chip'}
            onClick={() => navigate(`/units/${encodeURIComponent(u.id)}`)}
          >
            {u.title}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">{unit.title}</h2>
            <p className="panel-sub">{unit.intro}</p>
          </div>
          <div className="panel-actions">
            <PlayAllButton lines={unit.items.map((it) => it.fr)} className="btn" />
          </div>
        </div>
        <StudyItems items={unit.items} numbered />
      </section>
    </>
  )
}
