import { useState } from 'react'
import { VERBS, conjugate } from '../store'
import { speakFrench } from '../speech'
import { navigate } from '../router'
import { ConjGrid, CopyButton, GrammarContent, PageHeader, SearchField } from '../ui'

const VERB_GUIDE = [
  {
    title: '三大動詞組',
    content:
      '法文動詞依原形字尾分三組：\n第一組 -er（最多，規則）：parler, aimer, manger…\n第二組 -ir（規則，變位含 -iss-）：finir, choisir…\n第三組（不規則）：être, avoir, aller, prendre, faire… 需個別記。',
  },
  {
    title: '現在式 présent',
    content:
      '第一組 -er 去掉 -er 加字尾：-e, -es, -e, -ons, -ez, -ent。\n例：parler → je parle, nous parlons。\n第二組 -ir：-is, -is, -it, -issons, -issez, -issent。\n例：finir → je finis, nous finissons。\n第三組要逐一記憶（見下方變位表）。',
  },
  {
    title: '複合過去式 passé composé',
    content:
      "結構：助動詞（avoir 或 être 的現在式）+ 過去分詞。\n多數用 avoir：j'ai mangé（我吃了）。\n移動／狀態改變動詞與代動詞用 être，且過去分詞與主詞性數配合：elle est allée（她去了）。",
  },
  {
    title: '簡單未來式 futur simple',
    content:
      '未來語幹 + 字尾 -ai, -as, -a, -ons, -ez, -ont。\n規則動詞語幹＝原形（-re 去掉 e）：parler → je parlerai。\n不規則語幹要記：être→ser-, avoir→aur-, aller→ir-, faire→fer-。',
  },
]

export default function VerbsView({ route }) {
  const [q, setQ] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const verb = VERBS.find((v) => v.inf === route.segments[1]) ?? VERBS[0]
  const tables = conjugate(verb)

  const needle = q.trim().toLowerCase()
  const list = VERBS.filter(
    (v) => !needle || v.inf.toLowerCase().includes(needle) || v.zh.includes(q.trim()),
  )

  const tenses = [
    ['現在式 présent', tables.present],
    ['複合過去式 passé composé', tables.passeCompose],
    ['未來式 futur simple', tables.futur],
  ]

  return (
    <>
      <PageHeader
        icon="🔧"
        title="動詞變化"
        description="查 20 個最常用動詞的三大時態，每個形式都能點著唸。"
        actions={
          <button type="button" className="btn" onClick={() => setGuideOpen((o) => !o)}>
            {guideOpen ? '收起變位規則' : '📖 變位規則說明'}
          </button>
        }
      />

      {guideOpen && (
        <div className="panel guide">
          {VERB_GUIDE.map((g) => (
            <div key={g.title} className="guide-item">
              <h3>{g.title}</h3>
              <GrammarContent text={g.content} />
            </div>
          ))}
        </div>
      )}

      <SearchField value={q} onChange={setQ} placeholder="搜尋動詞：aller、去、吃…" />

      <div className="chip-row">
        {list.map((v) => (
          <button
            key={v.inf}
            type="button"
            className={v.inf === verb.inf ? 'chip active' : 'chip'}
            onClick={() => navigate(`/verbs/${encodeURIComponent(v.inf)}`)}
          >
            {v.inf}
            <span className="chip-count">{v.zh}</span>
          </button>
        ))}
        {list.length === 0 && <p className="muted">找不到這個動詞。</p>}
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">
              {verb.inf} <span className="muted">· {verb.zh}</span>
            </h2>
            <p className="panel-sub">
              第 {verb.group} 組 · 助動詞 {verb.aux} · 過去分詞 {verb.pp}
            </p>
          </div>
          <div className="panel-actions">
            <button type="button" className="btn" onClick={() => speakFrench(verb.inf)}>
              🔊 原形
            </button>
            <CopyButton
              text={tenses.map(([label, forms]) => `${label}\n${forms.join('\n')}`).join('\n\n')}
              label="複製全部變位"
              className="copy-btn-lg"
            />
          </div>
        </div>

        {tenses.map(([label, forms]) => (
          <div key={label} className="conj-block">
            <h3 className="conj-title">
              {label}
              <CopyButton text={forms.join('\n')} label={`複製 ${label} 六個變位`} />
            </h3>
            <ConjGrid forms={forms} />
          </div>
        ))}
      </section>
    </>
  )
}
