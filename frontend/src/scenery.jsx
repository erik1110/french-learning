// Illustrated backdrops for the Paris game, one per location.
//
// Flat vector scenery drawn inline for the same reasons as the characters:
// no asset pipeline, sharp at any size, tiny. Every backdrop paints into the
// same 400×220 box and is sliced to fill the stage, so the composition works
// at any panel width.

const F = { // shared floor/wall helpers
  floor: (y, color) => <rect x="0" y={y} width="400" height={220 - y} fill={color} />,
  wall: (color) => <rect width="400" height="220" fill={color} />,
}

function Lamp({ x, y = 0, shade = '#f0b64a' }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 26} stroke="#2c2c38" strokeWidth="2" />
      <path d={`M${x - 14} ${y + 40}l14-14 14 14Z`} fill={shade} />
      <circle cx={x} cy={y + 43} r="3.5" fill="#ffe6a8" />
    </g>
  )
}

function Window({ x, y, w = 60, h = 66, sky = '#8fc0e8' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={sky} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#fff" strokeWidth="3" opacity="0.85" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#fff" strokeWidth="3" opacity="0.85" />
      <rect x={x} y={y} width={w} height={h} rx="4" fill="none" stroke="#5b4a3a" strokeWidth="4" />
    </g>
  )
}

/* -------------------------------- backdrops ------------------------------- */

const SCENES = {
  // ☕ café interior
  cafe: (
    <>
      {F.wall('#7a4b34')}
      <rect width="400" height="112" fill="#8c5a3f" />
      {F.floor(150, '#4e3223')}
      <rect x="0" y="145" width="400" height="8" fill="#3a2419" />
      <Window x={22} y={30} w={72} h={72} sky="#a9cfe8" />
      <Lamp x={190} /> <Lamp x={250} y={10} />
      {/* counter */}
      <rect x="228" y="118" width="160" height="52" rx="5" fill="#3f2a1d" />
      <rect x="228" y="112" width="160" height="10" rx="4" fill="#d8bb92" />
      {/* espresso machine */}
      <rect x="290" y="76" width="52" height="36" rx="5" fill="#c9ccd4" />
      <rect x="298" y="84" width="16" height="12" rx="2" fill="#6d7381" />
      <circle cx="330" cy="90" r="5" fill="#e0533f" />
      {/* cups */}
      <g fill="#f3efe6">
        <rect x="240" y="102" width="12" height="9" rx="2" />
        <rect x="256" y="102" width="12" height="9" rx="2" />
        <rect x="272" y="102" width="12" height="9" rx="2" />
      </g>
      {/* chalkboard */}
      <rect x="120" y="40" width="54" height="42" rx="4" fill="#2f3a33" stroke="#7a5a3a" strokeWidth="3" />
      <g stroke="#e8e4d8" strokeWidth="2" opacity="0.8">
        <line x1="130" y1="54" x2="164" y2="54" /><line x1="130" y1="62" x2="156" y2="62" />
        <line x1="130" y1="70" x2="160" y2="70" />
      </g>
    </>
  ),

  // 🥖 bakery
  bakery: (
    <>
      {F.wall('#f0dfc2')}
      {F.floor(152, '#c9a97c')}
      <rect x="0" y="146" width="400" height="8" fill="#a8875c" />
      {/* sign */}
      <rect x="112" y="16" width="176" height="30" rx="6" fill="#8c3b2c" />
      <g fill="#f6e7c8">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <rect key={i} x={124 + i * 15} y={26} width="9" height="10" rx="2" />
        ))}
      </g>
      {/* shelves with baguettes */}
      <rect x="24" y="58" width="120" height="94" rx="4" fill="#b98a55" />
      {[68, 100, 132].map((y) => (
        <rect key={y} x="24" y={y} width="120" height="5" fill="#8f6a3f" />
      ))}
      <g fill="#e0a95c">
        {[0, 1, 2, 3].map((i) => <rect key={`a${i}`} x={32 + i * 27} y={44 + 24} width="9" height="20" rx="4" transform={`rotate(6 ${36 + i * 27} 78)`} />)}
        {[0, 1, 2, 3].map((i) => <rect key={`b${i}`} x={32 + i * 27} y={100} width="9" height="20" rx="4" transform={`rotate(-6 ${36 + i * 27} 110)`} />)}
      </g>
      {/* display case with croissants */}
      <rect x="230" y="104" width="150" height="48" rx="5" fill="#d9c19a" />
      <rect x="230" y="82" width="150" height="26" rx="4" fill="#e8f2f6" opacity="0.75" stroke="#b39a72" strokeWidth="2" />
      <g fill="#d99a45">
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${246 + i * 34} 100q10-14 20 0q-10 5-20 0Z`} />
        ))}
      </g>
    </>
  ),

  // 🏙️ Paris street
  street: (
    <>
      <rect width="400" height="220" fill="#bcd9ee" />
      <rect y="150" width="400" height="70" fill="#8f8a83" />
      <rect y="146" width="400" height="8" fill="#6f6a63" />
      {/* haussmann buildings */}
      {[{ x: 0, w: 96, c: '#d8cdb8' }, { x: 96, w: 84, c: '#cbbfa8' }, { x: 300, w: 100, c: '#d2c7b1' }].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y="26" width={b.w} height="124" fill={b.c} />
          <rect x={b.x} y="20" width={b.w} height="10" fill="#5d6472" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((k) => (
              <rect key={`${r}-${k}`} x={b.x + 12 + k * (b.w / 3 - 4)} y={44 + r * 34} width="16" height="24" rx="2" fill="#7f95ad" />
            )),
          )}
        </g>
      ))}
      {/* street clock */}
      <rect x="228" y="92" width="6" height="58" fill="#2f3540" />
      <circle cx="231" cy="80" r="22" fill="#1f6f5c" />
      <circle cx="231" cy="80" r="17" fill="#f7f3e6" />
      <g stroke="#22303c" strokeWidth="2.5" strokeLinecap="round">
        <line x1="231" y1="80" x2="231" y2="69" />
        <line x1="231" y1="80" x2="239" y2="84" />
      </g>
      {/* lamppost + tree */}
      <rect x="196" y="96" width="4" height="54" fill="#2f3540" />
      <circle cx="198" cy="92" r="7" fill="#ffdf9b" />
      <rect x="272" y="118" width="7" height="32" fill="#6b4b31" />
      <circle cx="275" cy="112" r="20" fill="#5c8a4a" />
      <circle cx="262" cy="120" r="13" fill="#6d9c57" />
      <circle cx="288" cy="120" r="13" fill="#6d9c57" />
    </>
  ),

  // 📅 language school
  school: (
    <>
      {F.wall('#e6e2d6')}
      {F.floor(152, '#b39a78')}
      <rect x="0" y="146" width="400" height="8" fill="#8f7a5c" />
      {/* blackboard */}
      <rect x="34" y="26" width="180" height="94" rx="5" fill="#31463d" stroke="#7d5c3a" strokeWidth="5" />
      <g stroke="#eef0e6" strokeWidth="2.4" opacity="0.85" strokeLinecap="round">
        <line x1="52" y1="50" x2="150" y2="50" /><line x1="52" y1="66" x2="188" y2="66" />
        <line x1="52" y1="82" x2="130" y2="82" /><line x1="52" y1="98" x2="168" y2="98" />
      </g>
      {/* calendar */}
      <rect x="252" y="30" width="76" height="80" rx="5" fill="#fbf7ee" stroke="#c9bfa8" strokeWidth="2" />
      <rect x="252" y="30" width="76" height="18" rx="5" fill="#c2455c" />
      <g fill="#cdc4b0">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((k) => (
            <rect key={`${r}-${k}`} x={259 + k * 13} y={54 + r * 13} width="9" height="9" rx="2" />
          )),
        )}
      </g>
      <rect x="285" y="80" width="9" height="9" rx="2" fill="#c2455c" />
      {/* reception desk */}
      <rect x="222" y="120" width="164" height="50" rx="5" fill="#8a6a48" />
      <rect x="222" y="114" width="164" height="10" rx="4" fill="#c8a878" />
    </>
  ),

  // 🚻 toilets corridor
  wc: (
    <>
      {F.wall('#dfe7ea')}
      <g stroke="#c6d2d6" strokeWidth="2">
        {[0, 1, 2, 3, 4, 5].map((r) => <line key={r} x1="0" y1={20 + r * 24} x2="400" y2={20 + r * 24} />)}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => <line key={k} x1={k * 42} y1="0" x2={k * 42} y2="150" />)}
      </g>
      {F.floor(150, '#9fadb3')}
      <rect x="0" y="146" width="400" height="6" fill="#7c8b92" />
      {/* two doors */}
      {[{ x: 96, i: '♀' }, { x: 226, i: '♂' }].map((d) => (
        <g key={d.x}>
          <rect x={d.x} y="42" width="74" height="108" rx="4" fill="#7a5c40" />
          <rect x={d.x + 6} y="48" width="62" height="96" rx="3" fill="#8c6b4a" />
          <circle cx={d.x + 62} cy="98" r="4" fill="#d8c07a" />
          <rect x={d.x + 22} y="60" width="30" height="30" rx="4" fill="#f2f6f7" />
          <text x={d.x + 37} y="83" fontSize="22" textAnchor="middle" fill="#3d5a6c">{d.i}</text>
        </g>
      ))}
      {/* arrow sign */}
      <rect x="316" y="34" width="66" height="26" rx="4" fill="#2f7d5f" />
      <path d="M330 47h24m0 0l-7-6m7 6l-7 6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),

  // 🎫 métro station
  metro: (
    <>
      {F.wall('#2b3444')}
      <rect width="400" height="118" fill="#394761" />
      {/* tiled vault */}
      <path d="M0 118V56q100-46 200-46t200 46v62Z" fill="#e9eef2" />
      <g stroke="#cfd8de" strokeWidth="2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => <line key={k} x1={k * 46} y1="14" x2={k * 46} y2="118" />)}
        <line x1="0" y1="60" x2="400" y2="60" /><line x1="0" y1="90" x2="400" y2="90" />
      </g>
      {F.floor(146, '#4b5568')}
      <rect x="0" y="140" width="400" height="8" fill="#333c4d" />
      {/* line sign */}
      <rect x="140" y="34" width="120" height="34" rx="17" fill="#f5f2e8" stroke="#c9c2ad" strokeWidth="2" />
      <circle cx="164" cy="51" r="12" fill="#f2b01e" />
      <text x="164" y="56" fontSize="14" fontWeight="700" textAnchor="middle" fill="#2b3444">1</text>
      <g fill="#5c6676">
        <rect x="184" y="44" width="62" height="5" rx="2" />
        <rect x="184" y="54" width="44" height="5" rx="2" />
      </g>
      {/* ticket machine */}
      <rect x="292" y="66" width="72" height="80" rx="6" fill="#20603f" />
      <rect x="300" y="76" width="56" height="34" rx="3" fill="#8fd3b0" />
      <g fill="#154a30">
        {[0, 1, 2].map((k) => <rect key={k} x={302 + k * 19} y={116} width="14" height="10" rx="2" />)}
      </g>
      {/* rails hint */}
      <rect x="0" y="160" width="400" height="4" fill="#5d6979" />
      <rect x="0" y="176" width="400" height="4" fill="#5d6979" />
    </>
  ),

  // 🔢 phone shop
  shop: (
    <>
      {F.wall('#eef1f6')}
      <rect width="400" height="26" fill="#2f5aa8" />
      {F.floor(152, '#cfd6e2')}
      <rect y="146" width="400" height="8" fill="#a9b3c4" />
      {/* wall of phones */}
      <rect x="26" y="46" width="150" height="102" rx="5" fill="#dde3ec" stroke="#b9c2d1" strokeWidth="2" />
      <g fill="#3c4658">
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((k) => (
            <rect key={`${r}-${k}`} x={40 + k * 34} y={58 + r * 32} width="20" height="26" rx="3" />
          )),
        )}
      </g>
      {/* price signs */}
      <g fill="#f2b01e">
        <rect x="196" y="52" width="58" height="26" rx="4" />
        <rect x="196" y="86" width="58" height="26" rx="4" />
      </g>
      <g fill="#3c4658">
        <rect x="204" y="61" width="34" height="8" rx="2" />
        <rect x="204" y="95" width="34" height="8" rx="2" />
      </g>
      {/* counter + terminal */}
      <rect x="272" y="110" width="116" height="42" rx="4" fill="#31415c" />
      <rect x="272" y="104" width="116" height="10" rx="4" fill="#4e6386" />
      <rect x="300" y="74" width="58" height="32" rx="4" fill="#1f2937" />
      <rect x="306" y="80" width="46" height="20" rx="2" fill="#6fd3a8" />
    </>
  ),

  // 🏥 pharmacy
  pharmacy: (
    <>
      {F.wall('#eaf3ef')}
      <rect width="400" height="24" fill="#1f8f5f" />
      {F.floor(152, '#cddbd4')}
      <rect y="146" width="400" height="8" fill="#a3b8ae" />
      {/* green cross */}
      <g fill="#1f8f5f">
        <rect x="176" y="36" width="48" height="16" rx="3" />
        <rect x="192" y="20" width="16" height="48" rx="3" />
      </g>
      {/* shelves of boxes */}
      {[26, 300].map((x) => (
        <g key={x}>
          <rect x={x} y="56" width="74" height="94" rx="4" fill="#dfe9e4" stroke="#b6c8c0" strokeWidth="2" />
          {[64, 92, 120].map((y) => <rect key={y} x={x} y={y + 12} width="74" height="4" fill="#b6c8c0" />)}
          <g>
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((k) => (
                <rect key={`${r}-${k}`} x={x + 7 + k * 22} y={62 + r * 28} width="16" height="14" rx="2"
                  fill={['#e0533f', '#2f7d5f', '#e8b04a'][(r + k) % 3]} />
              )),
            )}
          </g>
        </g>
      ))}
      {/* counter */}
      <rect x="118" y="112" width="164" height="40" rx="4" fill="#cfd9e0" />
      <rect x="118" y="104" width="164" height="10" rx="4" fill="#eef3f6" />
      <rect x="228" y="80" width="44" height="26" rx="3" fill="#3a4a5c" />
      <rect x="233" y="85" width="34" height="14" rx="2" fill="#8fd3b0" />
    </>
  ),

  // 🧥 clothes boutique
  boutique: (
    <>
      {F.wall('#f2e9e2')}
      {F.floor(152, '#c9b7a6')}
      <rect y="146" width="400" height="8" fill="#a08d7c" />
      {/* rail of clothes */}
      <rect x="24" y="52" width="150" height="5" rx="2" fill="#8a8a8a" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 36 + i * 28
        const c = ['#c2455c', '#3f6fd8', '#2f9e78', '#e0863a', '#8a56b8'][i]
        return (
          <g key={i}>
            <path d={`M${x} 57l-6 6v4h12v-4Z`} fill={c} />
            <path d={`M${x - 12} 67h24l4 46h-32Z`} fill={c} />
          </g>
        )
      })}
      {/* mirror */}
      <rect x="196" y="44" width="46" height="108" rx="22" fill="#dfe7ec" stroke="#a89684" strokeWidth="4" />
      {/* fitting cabins */}
      <rect x="266" y="40" width="118" height="112" rx="4" fill="#b8a08c" />
      <rect x="272" y="46" width="50" height="106" fill="#8a6a52" />
      <rect x="328" y="46" width="50" height="106" fill="#8a6a52" />
      <path d="M272 46h50v106h-50Z" fill="#a4634f" opacity="0.75" />
      {/* counter */}
      <rect x="20" y="120" width="120" height="32" rx="4" fill="#8a6a52" />
      <rect x="20" y="114" width="120" height="9" rx="4" fill="#c9a889" />
    </>
  ),

  // 🚆 train station
  station: (
    <>
      <linearGradient id="sky-station" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8cf9a" />
        <stop offset="100%" stopColor="#cfe0ef" />
      </linearGradient>
      <rect width="400" height="220" fill="url(#sky-station)" />
      {/* glass roof arches */}
      <path d="M0 96V52q100-40 200-40t200 40v44Z" fill="#dce7ef" opacity="0.85" />
      <g stroke="#9aa9b6" strokeWidth="2" opacity="0.8">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <line key={k} x1={k * 52} y1="16" x2={k * 52} y2="96" />)}
        <line x1="0" y1="60" x2="400" y2="60" />
      </g>
      <rect y="150" width="400" height="70" fill="#9aa3ae" />
      <rect y="146" width="400" height="6" fill="#78818c" />
      {/* train */}
      <rect x="222" y="86" width="178" height="62" rx="10" fill="#cfd6de" />
      <path d="M222 86h-30q-12 12 0 24v38h30Z" fill="#dfe5ec" />
      <rect x="236" y="96" width="150" height="22" rx="4" fill="#2f4a6b" />
      <rect x="222" y="130" width="178" height="8" fill="#8fa0b4" />
      <g fill="#d0453f"><rect x="222" y="120" width="178" height="5" /></g>
      {/* platform sign */}
      <rect x="34" y="58" width="96" height="30" rx="4" fill="#1f4d8f" />
      <text x="82" y="79" fontSize="17" fontWeight="700" textAnchor="middle" fill="#fff">VOIE 7</text>
      <rect x="78" y="88" width="6" height="60" fill="#4a5563" />
    </>
  ),

  // 🎬 cinema
  cinema: (
    <>
      {F.wall('#241a2e')}
      <rect width="400" height="120" fill="#31223f" />
      {F.floor(150, '#3b1f24')}
      <rect y="146" width="400" height="6" fill="#25141a" />
      {/* marquee lights */}
      <rect x="30" y="20" width="340" height="60" rx="8" fill="#12202f" stroke="#f2b01e" strokeWidth="3" />
      <g fill="#ffd75e">
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={44 + i * 24.5} cy="26" r="3.2" />)}
        {Array.from({ length: 14 }, (_, i) => <circle key={`b${i}`} cx={44 + i * 24.5} cy="74" r="3.2" />)}
      </g>
      <g fill="#f2e6c8">
        <rect x="66" y="38" width="120" height="8" rx="3" />
        <rect x="66" y="54" width="80" height="7" rx="3" />
        <rect x="214" y="38" width="120" height="8" rx="3" />
        <rect x="214" y="54" width="66" height="7" rx="3" />
      </g>
      {/* box office */}
      <rect x="140" y="96" width="120" height="54" rx="5" fill="#4a2c34" />
      <rect x="152" y="104" width="96" height="30" rx="3" fill="#f7e6b8" opacity="0.9" />
      {/* poster boards */}
      {[24, 320].map((x) => (
        <g key={x}>
          <rect x={x} y="94" width="56" height="56" rx="3" fill="#12202f" stroke="#8a6a48" strokeWidth="2" />
          <path d={`M${x + 6} 144l14-22 10 12 10-16 12 26Z`} fill="#5c7f9e" />
        </g>
      ))}
    </>
  ),

  // ✈️ airport terminal
  airport: (
    <>
      {F.wall('#e9eef4')}
      <path d="M0 104V56q100-34 200-34t200 34v48Z" fill="#f4f7fa" />
      <g stroke="#c6d0da" strokeWidth="2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <line key={k} x1={k * 52} y1="20" x2={k * 52} y2="104" />)}
        <line x1="0" y1="64" x2="400" y2="64" />
      </g>
      {F.floor(150, '#cdd6df')}
      <rect y="146" width="400" height="6" fill="#a8b3bf" />
      {/* window with a plane */}
      <rect x="240" y="52" width="146" height="66" rx="6" fill="#a9cde8" stroke="#8fa4b6" strokeWidth="3" />
      <g fill="#f4f7fa">
        <path d="M292 88l34-8 18-12 4 6-12 12 22-4 6 4-24 10-30 6Z" />
      </g>
      {/* departures board */}
      <rect x="24" y="46" width="150" height="60" rx="5" fill="#16233f" />
      <g fill="#f2b01e">
        {[0, 1, 2, 3].map((r) => <rect key={r} x="34" y={56 + r * 13} width={104 - r * 16} height="6" rx="2" />)}
      </g>
      {/* info desk + trolley */}
      <rect x="150" y="112" width="120" height="38" rx="4" fill="#2f5aa8" />
      <rect x="150" y="106" width="120" height="9" rx="4" fill="#e9eef4" />
      <g fill="#7c8794">
        <rect x="304" y="118" width="46" height="6" rx="2" />
        <rect x="304" y="124" width="6" height="24" />
        <circle cx="310" cy="150" r="4" /><circle cx="346" cy="150" r="4" />
        <rect x="316" y="100" width="32" height="24" rx="3" fill="#b8492f" />
      </g>
    </>
  ),

  // 🏨 hotel lobby
  hotel: (
    <>
      {F.wall('#f0e6d8')}
      <rect width="400" height="18" fill="#c9b393" />
      {F.floor(150, '#8a6a4a')}
      <rect y="146" width="400" height="6" fill="#6b4f36" />
      {/* reception desk + key board */}
      <rect x="200" y="102" width="186" height="48" rx="4" fill="#6b4a30" />
      <rect x="200" y="94" width="186" height="11" rx="4" fill="#a8804f" />
      <rect x="266" y="36" width="112" height="52" rx="4" fill="#8a6a48" />
      <g fill="#e8c877">
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3, 4].map((k) => <circle key={`${r}-${k}`} cx={280 + k * 21} cy={48 + r * 16} r="4" />),
        )}
      </g>
      {/* lamp + plant + sofa */}
      <rect x="228" y="72" width="6" height="24" fill="#4a3a28" />
      <path d="M218 72l13-16 13 16Z" fill="#f0d79a" />
      <g>
        <rect x="26" y="118" width="90" height="32" rx="6" fill="#7d5c8c" />
        <rect x="26" y="98" width="90" height="24" rx="8" fill="#8e6a9e" />
      </g>
      <g>
        <rect x="146" y="126" width="18" height="24" rx="3" fill="#a8763f" />
        <circle cx="155" cy="112" r="18" fill="#4f7c3f" />
        <circle cx="142" cy="120" r="12" fill="#5f9049" />
        <circle cx="168" cy="120" r="12" fill="#5f9049" />
      </g>
    </>
  ),

  // 🎟️ Versailles
  versailles: (
    <>
      <linearGradient id="sky-vers" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9ecbe8" />
        <stop offset="100%" stopColor="#e2eef6" />
      </linearGradient>
      <rect width="400" height="220" fill="url(#sky-vers)" />
      <rect y="152" width="400" height="68" fill="#b9a77f" />
      {/* palace facade */}
      <rect x="0" y="60" width="400" height="92" fill="#e6d8b4" />
      <rect x="0" y="54" width="400" height="10" fill="#c9b48c" />
      <g fill="#8fa4b6">
        {Array.from({ length: 11 }, (_, k) => (
          <rect key={k} x={14 + k * 35} y="78" width="20" height="38" rx="10" />
        ))}
        {Array.from({ length: 11 }, (_, k) => (
          <rect key={`b${k}`} x={14 + k * 35} y="124" width="20" height="26" rx="3" />
        ))}
      </g>
      {/* gilded gate */}
      <g stroke="#d4a72c" strokeWidth="3" fill="none">
        {Array.from({ length: 9 }, (_, k) => <line key={k} x1={160 + k * 10} y1="112" x2={160 + k * 10} y2="152" />)}
        <line x1="156" y1="114" x2="244" y2="114" />
      </g>
      {/* parterre */}
      <g fill="#7ba85c">
        <ellipse cx="80" cy="186" rx="62" ry="20" />
        <ellipse cx="320" cy="186" rx="62" ry="20" />
      </g>
      <ellipse cx="200" cy="196" rx="46" ry="14" fill="#8fc0dd" />
    </>
  ),

  // 🖼️ Louvre
  louvre: (
    <>
      <rect width="400" height="220" fill="#a9cde8" />
      <circle cx="330" cy="42" r="22" fill="#fdf3c8" opacity="0.85" />
      <rect y="150" width="400" height="70" fill="#c4b79c" />
      {/* palace wings */}
      {[{ x: 0, w: 150 }, { x: 250, w: 150 }].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y="66" width={b.w} height="86" fill="#ded2b8" />
          <rect x={b.x} y="60" width={b.w} height="10" fill="#b9a988" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={b.x + 14 + k * (b.w / 4)} y="84" width="18" height="34" rx="9" fill="#8a9db0" />
          ))}
          {[0, 1, 2, 3].map((k) => (
            <rect key={`m${k}`} x={b.x + 14 + k * (b.w / 4)} y="126" width="18" height="22" rx="3" fill="#8a9db0" />
          ))}
        </g>
      ))}
      {/* pyramid */}
      <path d="M200 54l72 96H128Z" fill="#cfe6f2" opacity="0.92" stroke="#8fb4c9" strokeWidth="2" />
      <g stroke="#9dc3d6" strokeWidth="1.6">
        <line x1="200" y1="54" x2="200" y2="150" />
        <line x1="164" y1="102" x2="236" y2="102" />
        <line x1="146" y1="126" x2="254" y2="126" />
      </g>
      {/* fountain */}
      <ellipse cx="200" cy="166" rx="58" ry="10" fill="#8fc0dd" opacity="0.8" />
    </>
  ),

  // 🗼 Eiffel tower
  eiffel: (
    <>
      <linearGradient id="sky-eiffel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f7c98b" />
        <stop offset="100%" stopColor="#bcd9ee" />
      </linearGradient>
      <rect width="400" height="220" fill="url(#sky-eiffel)" />
      <rect y="164" width="400" height="56" fill="#6f9a55" />
      <rect y="160" width="400" height="6" fill="#5b8245" />
      {/* tower */}
      <g fill="#8a6f4e">
        <path d="M200 18l6 30h-12Z" />
        <path d="M186 48h28l10 44h-48Z" />
        <path d="M172 92h56l14 72h-84Z" />
        <path d="M158 164h84l6 0v4H152v-4Z" />
      </g>
      <g fill="#bcd9ee" opacity="0.55">
        <path d="M186 106h28v18h-28Z" />
        <path d="M176 140h48v22h-48Z" />
      </g>
      <g stroke="#6f583c" strokeWidth="2" opacity="0.7">
        <line x1="176" y1="140" x2="224" y2="162" /><line x1="224" y1="140" x2="176" y2="162" />
        <line x1="188" y1="60" x2="212" y2="60" />
      </g>
      {/* trees */}
      {[40, 92, 320, 366].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="140" width="6" height="26" fill="#6b4b31" />
          <circle cx={x} cy="134" r="18" fill="#4f7c3f" />
        </g>
      ))}
    </>
  ),

  // ⛪ Montmartre
  montmartre: (
    <>
      <linearGradient id="sky-mm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6b98a" />
        <stop offset="100%" stopColor="#f3dcc0" />
      </linearGradient>
      <rect width="400" height="220" fill="url(#sky-mm)" />
      <circle cx="70" cy="52" r="26" fill="#fde8b0" opacity="0.9" />
      {/* hill */}
      <path d="M0 220V150q120-56 200-56t200 56v70Z" fill="#7d9b5e" />
      {/* basilica */}
      <g fill="#f4f1e6">
        <rect x="164" y="86" width="72" height="52" />
        <ellipse cx="200" cy="76" rx="22" ry="26" />
        <ellipse cx="168" cy="96" rx="12" ry="15" />
        <ellipse cx="232" cy="96" rx="12" ry="15" />
        <rect x="196" y="42" width="8" height="14" />
      </g>
      <g fill="#c9c2b0">
        <rect x="192" y="110" width="16" height="28" rx="8" />
        <rect x="172" y="114" width="10" height="24" rx="5" />
        <rect x="218" y="114" width="10" height="24" rx="5" />
      </g>
      {/* stairs */}
      <g fill="#cbbda0">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={168 - i * 4} y={144 + i * 12} width={64 + i * 8} height="9" rx="2" />
        ))}
      </g>
      {/* easel */}
      <g stroke="#7a5a3a" strokeWidth="3" fill="none">
        <path d="M330 200v-44M316 200l14-44M344 200l-14-44" />
      </g>
      <rect x="308" y="128" width="46" height="34" rx="2" fill="#fbf8ef" stroke="#7a5a3a" strokeWidth="2" />
      <path d="M312 156l12-16 9 10 8-9 9 15Z" fill="#8fb4c9" />
    </>
  ),

  // 🌤️ park
  park: (
    <>
      <linearGradient id="sky-park" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a9cde8" />
        <stop offset="100%" stopColor="#dceaf4" />
      </linearGradient>
      <rect width="400" height="220" fill="url(#sky-park)" />
      <circle cx="330" cy="40" r="20" fill="#fdf0b8" />
      <g fill="#fff" opacity="0.85">
        <ellipse cx="96" cy="46" rx="26" ry="13" />
        <ellipse cx="120" cy="40" rx="20" ry="14" />
        <ellipse cx="222" cy="34" rx="22" ry="11" />
      </g>
      <rect y="150" width="400" height="70" fill="#7ba85c" />
      <rect y="146" width="400" height="6" fill="#628c47" />
      {/* path */}
      <path d="M120 220l40-70h80l40 70Z" fill="#cbbda0" />
      {/* trees */}
      {[46, 356].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="112" width="10" height="40" fill="#6b4b31" />
          <circle cx={x} cy="102" r="27" fill="#4f7c3f" />
          <circle cx={x - 18} cy="114" r="17" fill="#5f9049" />
          <circle cx={x + 18} cy="114" r="17" fill="#5f9049" />
        </g>
      ))}
      {/* bench */}
      <g fill="#8a6a48">
        <rect x="146" y="122" width="76" height="7" rx="3" />
        <rect x="146" y="106" width="76" height="7" rx="3" />
        <rect x="150" y="122" width="6" height="26" />
        <rect x="212" y="122" width="6" height="26" />
      </g>
    </>
  ),

  // 🥕 market
  market: (
    <>
      {F.wall('#e7ddc6')}
      <rect y="0" width="400" height="30" fill="#cbbda0" />
      <rect y="154" width="400" height="66" fill="#b0a184" />
      <rect y="150" width="400" height="6" fill="#8e8067" />
      {/* awning */}
      <path d="M20 30h360v22H20Z" fill="#c2455c" />
      <g fill="#f4efe2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <path key={i} d={`M${20 + i * 40} 52h20v10q-10 8-20 0Z`} />
        ))}
      </g>
      {/* stall */}
      <rect x="36" y="108" width="328" height="46" rx="4" fill="#a8794c" />
      <rect x="36" y="100" width="328" height="12" rx="4" fill="#c8a06a" />
      {/* crates of produce */}
      {[{ x: 56, c: '#d9534f', n: 'tomate' }, { x: 152, c: '#e08a2e', n: 'carotte' }, { x: 248, c: '#7aa93f', n: 'salade' }].map((s) => (
        <g key={s.x}>
          <rect x={s.x} y="76" width="92" height="26" rx="3" fill="#8a6a48" />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={s.x + 14 + i * 17} cy="76" r="9" fill={s.c} />)}
          {[0, 1, 2, 3].map((i) => <circle key={`b${i}`} cx={s.x + 22 + i * 17} cy="68" r="8" fill={s.c} opacity="0.85" />)}
        </g>
      ))}
      {/* scale */}
      <rect x="344" y="82" width="30" height="20" rx="3" fill="#cfd4dc" />
      <circle cx="359" cy="76" r="7" fill="#9aa2b0" />
    </>
  ),

  // 🏠 apartment
  apartment: (
    <>
      {F.wall('#e4d8c8')}
      <rect width="400" height="14" fill="#cbbda6" />
      {F.floor(150, '#b98a55')}
      <g stroke="#a3763f" strokeWidth="2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <line key={k} x1={k * 52} y1="150" x2={k * 52 - 20} y2="220" />)}
      </g>
      <Window x={38} y={30} w={78} h={72} sky="#2f3f63" />
      <circle cx="86" cy="48" r="8" fill="#f6e7a8" />
      {/* bed */}
      <rect x="238" y="98" width="140" height="54" rx="6" fill="#8a6a48" />
      <rect x="238" y="86" width="46" height="26" rx="6" fill="#f2ece0" />
      <rect x="258" y="104" width="120" height="34" rx="5" fill="#5b7fa8" />
      {/* table + lamp */}
      <rect x="142" y="112" width="76" height="8" rx="3" fill="#a8794c" />
      <rect x="150" y="120" width="6" height="32" fill="#8a6a48" />
      <rect x="204" y="120" width="6" height="32" fill="#8a6a48" />
      <rect x="172" y="96" width="6" height="18" fill="#5c6676" />
      <path d="M162 96l13-16 13 16Z" fill="#e8b04a" />
      {/* clock */}
      <circle cx="196" cy="42" r="18" fill="#f7f3e6" stroke="#8a6a48" strokeWidth="3" />
      <g stroke="#3a3f4d" strokeWidth="2.2" strokeLinecap="round">
        <line x1="196" y1="42" x2="196" y2="32" /><line x1="196" y1="42" x2="203" y2="46" />
      </g>
    </>
  ),

  // 🍽️ restaurant
  restaurant: (
    <>
      {F.wall('#4a2f33')}
      <rect width="400" height="120" fill="#5c3a3f" />
      {F.floor(152, '#33211f')}
      <rect y="146" width="400" height="8" fill="#241614" />
      {/* arched windows */}
      {[36, 300].map((x) => (
        <g key={x}>
          <path d={`M${x} 110V56a32 32 0 0 1 64 0v54Z`} fill="#22304a" stroke="#8a6a48" strokeWidth="4" />
          <circle cx={x + 32} cy="70" r="9" fill="#f7d98a" opacity="0.6" />
        </g>
      ))}
      {/* chandelier */}
      <line x1="200" y1="0" x2="200" y2="24" stroke="#8a6a48" strokeWidth="2" />
      <path d="M176 40l24-16 24 16Z" fill="#c8a06a" />
      <g fill="#ffe6a8">
        <circle cx="184" cy="44" r="4" /><circle cx="200" cy="47" r="4" /><circle cx="216" cy="44" r="4" />
      </g>
      {/* table */}
      <ellipse cx="200" cy="128" rx="86" ry="16" fill="#f4efe2" />
      <rect x="192" y="136" width="16" height="30" fill="#6b4b31" />
      <ellipse cx="200" cy="168" rx="34" ry="7" fill="#6b4b31" />
      {/* candle + wine + plates */}
      <rect x="196" y="106" width="8" height="18" rx="2" fill="#e8dcc0" />
      <ellipse cx="200" cy="104" rx="3.5" ry="6" fill="#ffb84d" />
      <path d="M232 106q0-16 8-20v-8h-8v-4h18v4h-8v8q8 4 8 20Z" fill="#2f5d3a" />
      <ellipse cx="156" cy="124" rx="18" ry="6" fill="#fbf8ef" />
      <ellipse cx="248" cy="124" rx="18" ry="6" fill="#fbf8ef" />
    </>
  ),
}

/** Which backdrop each scene uses. */
export const SCENE_BACKDROP = {
  'cafe-bonjour': 'cafe',
  boulangerie: 'bakery',
  'heure-rue': 'street',
  'ecole-date': 'school',
  toilettes: 'wc',
  'metro-ticket': 'metro',
  louvre: 'louvre',
  'tour-eiffel': 'eiffel',
  montmartre: 'montmartre',
  marche: 'market',
  'appartement-genre': 'apartment',
  'restaurant-diner': 'restaurant',
  'nombres-telecom': 'shop',
  'pays-nationalite-game': 'school',
  'se-presenter': 'cafe',
  'professions-game': 'apartment',
  'meteo-voisin': 'park',
  'rendez-vous': 'street',
  pharmacie: 'pharmacy',
  'objets-perdus': 'metro',
  vetements: 'boutique',
  'rdv-medecin': 'apartment',
  'gare-lyon': 'station',
  cinema: 'cinema',
  'apero-bar': 'restaurant',
  'en-classe': 'school',
  aeroport: 'airport',
  hotel: 'hotel',
  taxi: 'street',
  'office-tourisme': 'shop',
  versailles: 'versailles',
  photo: 'eiffel',
  souvenirs: 'boutique',
  'regime-alimentaire': 'restaurant',
}

export default function Scenery({ sceneId, className = '' }) {
  const art = SCENES[SCENE_BACKDROP[sceneId]] ?? SCENES.street
  return (
    <svg
      className={`scenery ${className}`}
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {art}
    </svg>
  )
}
