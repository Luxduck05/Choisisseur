// All angles are in degrees, measured CLOCKWISE from 12 o'clock (where the
// pointer sits). A wheel rotated by `rotation` deg shows wheel-angle
// (-rotation mod 360) under the pointer.

export function computeSegments(options) {
  const weightOf = (o) => Math.max(0.1, Number(o.weight) || 1)
  const total = options.reduce((s, o) => s + weightOf(o), 0)
  let angle = 0
  return options.map((o) => {
    const sweep = (weightOf(o) / total) * 360
    const seg = { ...o, start: angle, end: angle + sweep, mid: angle + sweep / 2, sweep }
    angle += sweep
    return seg
  })
}

// Point on a circle at `deg` clockwise from top (SVG screen coordinates).
export function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

// SVG path for a pie sector from startDeg to endDeg.
export function arcPath(cx, cy, r, startDeg, endDeg) {
  const sweep = endDeg - startDeg
  if (sweep >= 359.999) {
    return (
      `M ${cx} ${cy - r} ` +
      `A ${r} ${r} 0 1 1 ${cx} ${cy + r} ` +
      `A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`
    )
  }
  const [x1, y1] = polar(cx, cy, r, startDeg)
  const [x2, y2] = polar(cx, cy, r, endDeg)
  const large = sweep > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

// Wheel-space angle currently under the top pointer.
export function pointerAngle(rotation) {
  return ((-rotation % 360) + 360) % 360
}

export function segmentAt(segments, wheelAngle) {
  for (const seg of segments) {
    if (wheelAngle >= seg.start && wheelAngle < seg.end) return seg
  }
  return segments[segments.length - 1]
}
