import { useEffect, useRef, useState } from 'react'
import { computeSegments, arcPath, polar, pointerAngle, segmentAt } from '../../utils/wheelGeometry.js'
import { weightedPick } from '../../utils/random.js'
import * as sound from '../../utils/sound.js'

const C = 50
const R = 47

// Flick physics: exponential friction per ms; below MIN_V the wheel settles.
const FRICTION = 0.9985
const MIN_V = 0.01 // deg/ms
const FLICK_THRESHOLD = 0.25 // deg/ms needed to count a drag as a flick
const MAX_V = 3 // deg/ms cap so a wild flick stays watchable

export default function Wheel({ options, onResult }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const rotRef = useRef(0)
  const rafRef = useRef(0)
  const segmentsRef = useRef([])
  const lastSegRef = useRef(null)
  const dragRef = useRef(null)
  const svgRef = useRef(null)

  const segments = computeSegments(options)
  segmentsRef.current = segments
  const canSpin = options.length >= 2 && !spinning

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  function applyRotation(r) {
    rotRef.current = r
    setRotation(r)
    const segs = segmentsRef.current
    if (segs.length < 2) return
    const seg = segmentAt(segs, pointerAngle(r))
    if (seg && lastSegRef.current != null && seg.id !== lastSegRef.current) sound.tick()
    lastSegRef.current = seg ? seg.id : null
  }

  function finish() {
    setSpinning(false)
    const seg = segmentAt(segmentsRef.current, pointerAngle(rotRef.current))
    if (seg) {
      sound.fanfare()
      onResult(seg)
    }
  }

  // Button spin: pick the winner fairly up front (weights respected), then
  // animate the wheel so the pointer lands inside that segment.
  function spin() {
    if (!canSpin) return
    const idx = weightedPick(options)
    const seg = segmentsRef.current[idx]
    const margin = Math.min(4, seg.sweep * 0.15)
    const target = seg.start + margin + Math.random() * (seg.sweep - 2 * margin)
    const current = rotRef.current
    const landing = ((-target % 360) + 360) % 360
    const delta =
      (((landing - current) % 360) + 360) % 360 + 360 * (4 + Math.floor(Math.random() * 3))
    animateTo(current + delta, 4000 + Math.random() * 1200)
  }

  function animateTo(target, duration) {
    setSpinning(true)
    sound.spinStart()
    const start = rotRef.current
    const t0 = performance.now()
    const ease = (t) => 1 - Math.pow(1 - t, 4)
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      applyRotation(start + (target - start) * ease(t))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else finish()
    }
    rafRef.current = requestAnimationFrame(step)
  }

  // Flick spin: launch with the measured drag velocity and let friction decide.
  function startPhysicsSpin(v0) {
    setSpinning(true)
    sound.spinStart()
    let v = Math.max(-MAX_V, Math.min(MAX_V, v0))
    let last = performance.now()
    const step = (now) => {
      const dt = Math.min(50, now - last)
      last = now
      applyRotation(rotRef.current + v * dt)
      v *= Math.pow(FRICTION, dt)
      if (Math.abs(v) > MIN_V) rafRef.current = requestAnimationFrame(step)
      else finish()
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function angleFromEvent(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
  }

  function onPointerDown(e) {
    if (spinning || options.length < 2) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic events have no active pointer to capture */
    }
    dragRef.current = { id: e.pointerId, lastAngle: angleFromEvent(e), samples: [] }
  }

  function onPointerMove(e) {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    const a = angleFromEvent(e)
    let delta = a - d.lastAngle
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    d.lastAngle = a
    applyRotation(rotRef.current + delta)
    const now = performance.now()
    d.samples.push({ t: now, delta })
    while (d.samples.length && now - d.samples[0].t > 100) d.samples.shift()
  }

  function onPointerUp(e) {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    dragRef.current = null
    const now = performance.now()
    const recent = d.samples.filter((s) => now - s.t <= 100)
    if (recent.length < 2) return
    const dt = now - recent[0].t
    const v = dt > 15 ? recent.reduce((s, x) => s + x.delta, 0) / dt : 0
    if (Math.abs(v) > FLICK_THRESHOLD) startPhysicsSpin(v)
  }

  const showPlaceholder = segments.length === 0

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer" aria-hidden="true" />
      <svg
        ref={svgRef}
        className={`wheel-svg ${spinning ? 'spinning' : ''}`}
        viewBox="0 0 100 100"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <g transform={`rotate(${rotation} ${C} ${C})`}>
          {showPlaceholder ? (
            <circle cx={C} cy={C} r={R} fill="#2a2740" />
          ) : (
            segments.map((seg) => (
              <path
                key={seg.id}
                d={arcPath(C, C, R, seg.start, seg.end)}
                fill={seg.color}
                stroke="#14121f"
                strokeWidth="0.6"
              />
            ))
          )}
          {segments.map((seg) => {
            const label = seg.label.length > 18 ? `${seg.label.slice(0, 17)}…` : seg.label
            const fs = Math.max(2.4, Math.min(5.2, seg.sweep * 0.14, 46 / (label.length + 2)))
            const [lx, ly] = polar(C, C, R * 0.63, seg.mid)
            return (
              <text
                key={seg.id}
                x={lx}
                y={ly}
                fontSize={fs}
                fill="#1a1626"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${seg.mid - 90} ${lx} ${ly})`}
              >
                {label}
              </text>
            )
          })}
        </g>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.4" />
      </svg>
      <button className="wheel-hub" onClick={spin} disabled={!canSpin} aria-label="Spin the wheel">
        {spinning ? '···' : 'SPIN'}
      </button>
    </div>
  )
}
