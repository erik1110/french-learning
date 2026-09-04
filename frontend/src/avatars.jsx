// Character art for the Paris game, drawn as inline SVG.
//
// No image files: the app is a static build with no asset pipeline, and
// hand-drawn SVG stays sharp at every size, recolours with the theme and
// costs nothing to load. Each character is one row in CAST — skin, hair
// colour + shape, top colour and an optional accessory.
//
// Two figures share that row: a circular portrait (Avatar) and a standing
// full body (Character). The head is drawn once, in "portrait space" (a
// 100×100 box with the head centred at 50,46), and transformed into place —
// so a character's face is identical wherever it appears.

export const CAST = {
  player:   { skin: '#f0c8a0', hair: '#2b1d16', cut: 'short', top: '#3f6fd8', acc: null },
  camille:  { skin: '#f3cba7', hair: '#4a2a1c', cut: 'bob',   top: '#c2455c', acc: 'apron' },
  bernard:  { skin: '#eec39d', hair: '#9a9a94', cut: 'buzz',  top: '#e8e3d8', acc: 'toque' },
  lea:      { skin: '#e8b48a', hair: '#1f1712', cut: 'curly', top: '#2f9e78', acc: 'scarf' },
  roux:     { skin: '#f2c7a4', hair: '#b0663a', cut: 'bun',   top: '#3c4a72', acc: 'glasses' },
  hugo:     { skin: '#d9a173', hair: '#211a14', cut: 'short', top: '#2b2b33', acc: 'apron' },
  karim:    { skin: '#c48b5f', hair: '#181310', cut: 'buzz',  top: '#2f5aa8', acc: 'cap' },
  sophie:   { skin: '#f4d0ad', hair: '#c99a3e', cut: 'long',  top: '#8a56b8', acc: null },
  antoine:  { skin: '#eec19b', hair: '#3a2b1e', cut: 'short', top: '#1f7a8c', acc: 'glasses' },
  yasmine:  { skin: '#c98a5c', hair: '#241a13', cut: 'bun',   top: '#d4722c', acc: 'beret' },
  petit:    { skin: '#f0c3a0', hair: '#8d8d88', cut: 'bob',   top: '#5d8c3a', acc: 'scarf' },
  julie:    { skin: '#f5d2b0', hair: '#6b3f22', cut: 'wavy',  top: '#d94f8a', acc: 'earrings' },
  marc:     { skin: '#e5b183', hair: '#2a2119', cut: 'short', top: '#1e2430', acc: 'bowtie' },
  nadia:    { skin: '#d9a06a', hair: '#2a1d15', cut: 'long',  top: '#c2455c', acc: null },
  emma:     { skin: '#f6d6b4', hair: '#d9b36a', cut: 'wavy',  top: '#2f9e78', acc: null },
  thomas:   { skin: '#eebd94', hair: '#4a3524', cut: 'curly', top: '#e0863a', acc: null },
  claire:   { skin: '#f3cba7', hair: '#7d3a2a', cut: 'bob',   top: '#8a56b8', acc: 'earrings' },
  gilles:   { skin: '#e9c19c', hair: '#a8a49c', cut: 'short', top: '#4a6b8a', acc: 'scarf' },
  lucas:    { skin: '#dda878', hair: '#1d1712', cut: 'buzz',  top: '#2f5aa8', acc: null },
}

const FALLBACK = CAST.player

/** Darken a hex colour — used for collars, cuffs and hair shading. */
function shade(hex, amount = 0.78) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * amount)
  const g = Math.round(((n >> 8) & 255) * amount)
  const b = Math.round((n & 255) * amount)
  return `rgb(${r},${g},${b})`
}

/* ------------------------------- the head --------------------------------- */
/* All of these draw in portrait space: head centred at (50,46), rx 23 ry 25.  */

function hair(cut, color) {
  const dark = shade(color, 0.82)
  switch (cut) {
    case 'bob':
      return {
        back: <ellipse cx="50" cy="45" rx="27" ry="28" fill={color} />,
        front: <path d="M23 46c0-17 11-25 27-25s27 8 27 25c-3-13-11-18-27-18S26 33 23 46Z" fill={dark} />,
      }
    case 'bun':
      return {
        back: (
          <>
            <circle cx="50" cy="15" r="10" fill={color} />
            <ellipse cx="50" cy="43" rx="25" ry="25" fill={color} />
          </>
        ),
        front: <path d="M25 42c3-14 12-21 25-21s22 7 25 21c-7-10-15-14-25-14s-18 4-25 14Z" fill={dark} />,
      }
    case 'curly':
      return {
        back: (
          <>
            <circle cx="31" cy="33" r="13" fill={color} />
            <circle cx="50" cy="24" r="14" fill={color} />
            <circle cx="69" cy="33" r="13" fill={color} />
            <circle cx="28" cy="48" r="11" fill={color} />
            <circle cx="72" cy="48" r="11" fill={color} />
          </>
        ),
        front: <path d="M27 40c3-13 11-19 23-19s20 6 23 19c-8-9-15-12-23-12s-15 3-23 12Z" fill={dark} />,
      }
    case 'long':
      return {
        back: <path d="M21 44a29 29 0 0 1 58 0v46q-8 5-14 0V56H35v34q-6 5-14 0Z" fill={color} />,
        front: <path d="M25 46c0-18 10-25 25-25s25 7 25 25c-4-12-12-17-25-17s-21 5-25 17Z" fill={dark} />,
      }
    case 'wavy':
      return {
        back: <path d="M22 44a28 28 0 0 1 56 0v26q-7 7-11-2-5 8-10 0-5 8-10 0-5 8-11 2Z" fill={color} />,
        front: <path d="M25 45c1-16 10-24 25-24s24 8 25 24c-5-11-13-16-25-16s-20 5-25 16Z" fill={dark} />,
      }
    case 'buzz':
      return {
        back: null,
        front: <path d="M26 44c0-16 10-23 24-23s24 7 24 23c-5-7-13-11-24-11s-19 4-24 11Z" fill={color} />,
      }
    default: // 'short'
      return {
        back: null,
        front: <path d="M25 45c0-17 10-24 25-24s25 7 25 24c-3-11-11-16-25-16s-22 5-25 16Z" fill={color} />,
      }
  }
}

/** Worn on the head — travels with the face into both figures. */
function headAccessory(acc) {
  switch (acc) {
    case 'glasses':
      return (
        <g fill="none" stroke="#3a3f4d" strokeWidth="2.2">
          <circle cx="40" cy="48" r="8.5" />
          <circle cx="60" cy="48" r="8.5" />
          <path d="M48.5 47.5h3" />
        </g>
      )
    case 'beret':
      return (
        <g>
          <path d="M25 30c0-11 11-17 25-17s25 6 25 16c0 5-11 3-25 3s-25 2-25-2Z" fill="#b8323f" />
          <circle cx="58" cy="13" r="3.4" fill="#8f2531" />
        </g>
      )
    case 'toque':
      return <path d="M28 28c-2-13 7-19 22-19s24 6 22 19Z" fill="#fbfbf7" stroke="#dcd8cc" strokeWidth="1.5" />
    case 'cap':
      return (
        <g>
          <path d="M26 30c0-14 10-20 24-20s24 6 24 20Z" fill="#1f3f7a" />
          <path d="M74 30c9 0 13 2 13 5H60Z" fill="#16305c" />
        </g>
      )
    case 'earrings':
      return (
        <g fill="#e6b422">
          <circle cx="25" cy="53" r="2.8" />
          <circle cx="75" cy="53" r="2.8" />
        </g>
      )
    default:
      return null
  }
}

/** The face itself — eyes with a highlight, brows, smile, blush. */
function face() {
  return (
    <>
      <g fill="#2c2118">
        <ellipse cx="40" cy="49" rx="3.2" ry="4" />
        <ellipse cx="60" cy="49" rx="3.2" ry="4" />
      </g>
      <g fill="#fff" opacity="0.9">
        <circle cx="41.2" cy="47.6" r="1.1" />
        <circle cx="61.2" cy="47.6" r="1.1" />
      </g>
      <g stroke="#2c2118" strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.6">
        <path d="M35.5 41.5q4.5-2.8 9 0" />
        <path d="M55.5 41.5q4.5-2.8 9 0" />
      </g>
      <path d="M44 58q6 5 12 0" stroke="#a4553f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <g fill="#e0876f" opacity="0.32">
        <ellipse cx="32" cy="55" rx="4.2" ry="2.6" />
        <ellipse cx="68" cy="55" rx="4.2" ry="2.6" />
      </g>
    </>
  )
}

/** Head, ears and hair as one unit, in portrait space. */
function head(c) {
  const h = hair(c.cut, c.hair)
  return (
    <>
      {h.back}
      <ellipse cx="27" cy="50" rx="4.2" ry="5.5" fill={c.skin} />
      <ellipse cx="73" cy="50" rx="4.2" ry="5.5" fill={c.skin} />
      <ellipse cx="50" cy="46" rx="23" ry="25" fill={c.skin} />
      {h.front}
      {face()}
      {headAccessory(c.acc)}
    </>
  )
}

/* -------------------------------- portrait -------------------------------- */

export default function Avatar({ id, size = 56, className = '', ring = true }) {
  const c = CAST[id] ?? FALLBACK
  const uid = `av-${id}`

  return (
    <svg
      className={`avatar ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <circle cx="50" cy="50" r="49" />
        </clipPath>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.top} stopOpacity="0.2" />
          <stop offset="100%" stopColor={c.top} stopOpacity="0.42" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="100" height="100" fill={`url(#${uid}-bg)`} />
        {/* shoulders first, then the neck, then the head on top: each layer
            covers the seam below it, so nothing ever looks detached */}
        <path d="M16 100c0-17 15-25 34-25s34 8 34 25Z" fill={c.top} />
        <path d="M16 100c0-17 15-25 34-25s34 8 34 25Z" fill="none" stroke={shade(c.top)} strokeWidth="1" />
        <rect x="42" y="58" width="16" height="22" rx="7" fill={c.skin} />
        {head(c)}
      </g>

      {ring && <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />}
    </svg>
  )
}

/* ------------------------------- full body -------------------------------- */

/** Aprons, scarves and bow ties live on the body, not the head. */
function bodyAccessory(acc, c) {
  switch (acc) {
    case 'apron':
      return (
        <g>
          <path d="M45 112h30v54a6 6 0 0 1-6 6H51a6 6 0 0 1-6-6Z" fill="#f7f4ea" opacity="0.95" />
          <path d="M52 112l8-10 8 10Z" fill="#f7f4ea" opacity="0.95" />
          <path d="M45 136h30" stroke="#d9d3c2" strokeWidth="2" />
        </g>
      )
    case 'scarf':
      return (
        <g>
          <path d="M39 96q21 13 42 0v13q-21 13-42 0Z" fill="#d8534f" />
          <path d="M56 108h9v26l-4.5 6-4.5-6Z" fill="#c1443f" />
        </g>
      )
    case 'bowtie':
      return (
        <g fill="#b8323f">
          <path d="M60 102l-10-6v12Z" />
          <path d="M60 102l10-6v12Z" />
          <circle cx="60" cy="102" r="3" />
        </g>
      )
    default:
      return null
  }
}

/**
 * Full-body standing character for the scene stage.
 *
 * Body parts are drawn bottom-up and deliberately overlap — legs into the
 * hips, arms into the torso, neck into both torso and head — so no joint can
 * show a gap at any size.
 */
export function Character({ id, height = 260, className = '' }) {
  const c = CAST[id] ?? FALLBACK
  const trousers = '#414a63'
  const shoes = '#232a3c'

  return (
    <svg
      className={`character ${className}`}
      height={height}
      viewBox="0 0 120 280"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="60" cy="262" rx="34" ry="6" fill="#000" opacity="0.2" />

      {/* legs, feet */}
      <rect x="42" y="172" width="16" height="74" rx="8" fill={trousers} />
      <rect x="62" y="172" width="16" height="74" rx="8" fill={trousers} />
      <ellipse cx="49" cy="250" rx="13" ry="7" fill={shoes} />
      <ellipse cx="71" cy="250" rx="13" ry="7" fill={shoes} />

      {/* hips tie the trousers to the torso */}
      <rect x="31" y="158" width="58" height="20" rx="8" fill={trousers} />

      {/* torso */}
      <path d="M31 120c0-16 13-27 29-27s29 11 29 27v50H31Z" fill={c.top} />
      {/* collar */}
      <path d="M48 95q12 13 24 0l-4-3q-8 8-16 0Z" fill={shade(c.top, 0.72)} />

      {bodyAccessory(c.acc, c)}

      {/* arms, hands */}
      <rect x="21" y="108" width="14" height="58" rx="7" fill={c.top} />
      <rect x="85" y="108" width="14" height="58" rx="7" fill={c.top} />
      <rect x="21" y="152" width="14" height="8" fill={shade(c.top, 0.86)} />
      <rect x="85" y="152" width="14" height="8" fill={shade(c.top, 0.86)} />
      <circle cx="28" cy="166" r="7.5" fill={c.skin} />
      <circle cx="92" cy="166" r="7.5" fill={c.skin} />

      {/* neck — starts inside the torso and ends inside the head */}
      <rect x="51" y="76" width="18" height="26" rx="9" fill={c.skin} />
      <rect x="51" y="76" width="18" height="10" rx="5" fill={shade(c.skin, 0.9)} />

      {/* head, mapped from portrait space so it matches the avatar exactly */}
      <g transform="translate(60 54) scale(1.2) translate(-50 -46)">{head(c)}</g>
    </svg>
  )
}
