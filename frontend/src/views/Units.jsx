import { UNITS, findUnit } from '../store'
import { navigate } from '../router'
import { PageHeader, PlayAllButton, SpeakableItems } from '../ui'

export default function UnitsView({ route }) {
  const unit = findUnit(route.segments[1]) ?? UNITS[0]

  return (
    <>
      <PageHeader
        icon="🔢"
        title="單元主題"
        description="數字、時間、星期、月份、日期、金錢與基本句型 — 點任何一句就會唸出來。"
      />

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
        <SpeakableItems items={unit.items} />
      </section>
    </>
  )
}
