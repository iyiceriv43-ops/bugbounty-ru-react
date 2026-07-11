// Boot screen shown only on mobile, first load per session.
// Black screen + Apple-style white progress bar + a pixel-art Mario running on top.

const PIX = {
  R: '#E52521', // red cap / shirt
  B: '#6B3F1F', // brown hair, mustache, shoes
  S: '#FFB68C', // skin
  D: '#2D6AD6', // overalls blue
  W: '#FFFFFF', // eye white
}

// 10-wide pixel grid, shared head/body for both run frames
const HEAD = [
  '...RRRR...',
  '..RRRRRR..',
  '.BSSSWW...',
  '.BSSSWW...',
  '.BSSSS....',
  '..SSBBB...',
  '.RRBBBRR..',
  'SBBBDBBBS.',
  '..DDDDDD..',
]
const LEGS = {
  1: ['.DD...DD..', '.BB...BB..', 'BB....BBB.'],
  2: ['..DD...DD.', '..BB...BB.', '.BBB....BB'],
}

function Mario({ frame, className }) {
  const rows = HEAD.concat(LEGS[frame])
  const rects = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = PIX[row[x]]
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />)
    }
  })
  return (
    <svg viewBox="0 0 10 12" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {rects}
    </svg>
  )
}

export default function BootScreen({ progress = 0, fading = false }) {
  const pct = Math.min(100, Math.max(0, progress))
  return (
    <div className={`boot${fading ? ' boot-fadeout' : ''}`} role="status" aria-label="Загрузка">
      <div className="boot-mario">
        <Mario frame={1} className="mario-1" />
        <Mario frame={2} className="mario-2" />
      </div>
      <div className="boot-bar">
        <div className="boot-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}