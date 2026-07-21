import { useEffect, useRef, useState } from 'react'
import { pickN, shuffle } from '../../utils/random.js'
import { colorFor, TEAM_COLORS } from '../../utils/colors.js'
import * as sound from '../../utils/sound.js'

const COUNTDOWN_MS = 3000
const HAS_TOUCH = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0

// Phases: 'idle' (waiting for fingers) → 'armed' (countdown running) → 'done'
// (result shown from a snapshot until Reset).
export default function TouchArea({ mode, count }) {
  const [touches, setTouches] = useState([])
  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(3)
  const [result, setResult] = useState(null)

  const areaRef = useRef(null)
  const mapRef = useRef(new Map())
  const phaseRef = useRef('idle')
  const timerRef = useRef(0)
  const tickerRef = useRef(0)
  const colorSeqRef = useRef(0)
  const modeRef = useRef(mode)
  const countRef = useRef(count)

  modeRef.current = mode
  countRef.current = count

  const clearTimers = () => {
    clearTimeout(timerRef.current)
    clearInterval(tickerRef.current)
  }

  useEffect(() => clearTimers, [])

  // Switching mode/count mid-countdown restarts it.
  useEffect(() => {
    if (phaseRef.current === 'armed') rearm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, count])

  const setPhaseBoth = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  const sync = () =>
    setTouches(Array.from(mapRef.current, ([id, t]) => ({ id, ...t })))

  function rearm() {
    clearTimers()
    if (mapRef.current.size >= 2) {
      setPhaseBoth('armed')
      setSeconds(3)
      let s = 3
      tickerRef.current = setInterval(() => {
        s -= 1
        if (s > 0) setSeconds(s)
      }, COUNTDOWN_MS / 3)
      timerRef.current = setTimeout(select, COUNTDOWN_MS)
    } else {
      setPhaseBoth('idle')
    }
  }

  function select() {
    clearTimers()
    const entries = Array.from(mapRef.current, ([id, t]) => ({ id, ...t }))
    if (entries.length < 2) {
      rearm()
      return
    }
    const ids = entries.map((e) => e.id)
    const m = modeRef.current
    const c = countRef.current
    const res = { mode: m, rings: entries, winners: [], teams: {}, ranks: {} }

    if (m === 'single') {
      res.winners = pickN(ids, 1)
    } else if (m === 'multi') {
      res.winners = pickN(ids, Math.min(c, ids.length - 1))
    } else if (m === 'teams') {
      const nTeams = Math.min(c, ids.length)
      shuffle(ids).forEach((id, i) => {
        res.teams[id] = i % nTeams
      })
    } else if (m === 'rank') {
      shuffle(ids).forEach((id, i) => {
        res.ranks[id] = i + 1
      })
    }

    setResult(res)
    setPhaseBoth('done')
    if (navigator.vibrate) navigator.vibrate([100, 60, 100])
    sound.fanfare()
  }

  const relPos = (e) => {
    const rect = areaRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // A touch after a finished round starts a fresh one automatically —
    // this finger becomes the first of the new round.
    if (phaseRef.current === 'done') {
      clearTimers()
      setResult(null)
      mapRef.current.clear()
      colorSeqRef.current = 0
      setPhaseBoth('idle')
    }
    try {
      areaRef.current.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic events have no active pointer to capture */
    }
    const { x, y } = relPos(e)
    mapRef.current.set(e.pointerId, { x, y, color: colorFor(colorSeqRef.current++) })
    sync()
    rearm()
  }

  function onPointerMove(e) {
    const t = mapRef.current.get(e.pointerId)
    if (!t || phaseRef.current === 'done') return
    const { x, y } = relPos(e)
    t.x = x
    t.y = y
    sync()
  }

  function onPointerUp(e) {
    if (!mapRef.current.has(e.pointerId)) return
    mapRef.current.delete(e.pointerId)
    if (phaseRef.current !== 'done') {
      sync()
      rearm()
    }
  }

  const rings = phase === 'done' && result ? result.rings : touches

  const ringProps = (t) => {
    if (phase !== 'done' || !result) return { className: 'touch-ring', color: t.color, label: null }
    if (result.mode === 'teams') {
      const team = result.teams[t.id]
      return { className: 'touch-ring team', color: TEAM_COLORS[team % TEAM_COLORS.length], label: null }
    }
    if (result.mode === 'rank') {
      const rank = result.ranks[t.id]
      return { className: `touch-ring rank ${rank === 1 ? 'winner' : ''}`, color: t.color, label: rank }
    }
    const isWinner = result.winners.includes(t.id)
    return { className: `touch-ring ${isWinner ? 'winner' : 'loser'}`, color: t.color, label: null }
  }

  return (
    <div
      ref={areaRef}
      className="touch-area"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {rings.map((t) => {
        const { className, color, label } = ringProps(t)
        return (
          <div
            key={t.id}
            className={className}
            style={{ left: t.x, top: t.y, '--ring-color': color }}
          >
            {label != null && <span className="ring-label">{label}</span>}
          </div>
        )
      })}

      {phase !== 'done' && touches.length > 0 && (
        <div className="finger-count">
          {touches.length} finger{touches.length > 1 ? 's' : ''}
        </div>
      )}

      {phase === 'idle' && touches.length === 0 && (
        <div className="touch-overlay">
          <p className="touch-instruction">👆 Everyone place a finger</p>
          {!HAS_TOUCH && (
            <p className="hint">
              This mode shines on a touchscreen — a mouse only counts as one finger.
            </p>
          )}
        </div>
      )}
      {phase === 'idle' && touches.length === 1 && (
        <div className="touch-overlay dim">
          <p className="touch-instruction">One more finger needed…</p>
        </div>
      )}
      {phase === 'armed' && <div className="countdown">{seconds}</div>}
      {phase === 'done' && (
        <div className="touch-overlay done-hint">
          <p className="touch-instruction">Touch again to go for another round</p>
        </div>
      )}
    </div>
  )
}
