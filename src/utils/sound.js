// Synthesized sound effects via Web Audio — no audio assets needed.
// The AudioContext is created lazily on the first user-gesture-triggered call.

let ctx = null
let muted = false

export function setMuted(m) {
  muted = m
}

function ac() {
  if (muted) return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function blip(c, { type, freq, freqEnd, gain, start, dur }) {
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur * 0.8)
  g.gain.setValueAtTime(gain, start)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g).connect(c.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

// Short click as the pointer passes a segment boundary.
export function tick() {
  const c = ac()
  if (!c) return
  blip(c, { type: 'square', freq: 1900, gain: 0.06, start: c.currentTime, dur: 0.04 })
}

// Whoosh when a spin launches.
export function spinStart() {
  const c = ac()
  if (!c) return
  blip(c, { type: 'sawtooth', freq: 150, freqEnd: 540, gain: 0.1, start: c.currentTime, dur: 0.5 })
}

// Little arpeggio when a winner is revealed.
export function fanfare() {
  const c = ac()
  if (!c) return
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    blip(c, { type: 'triangle', freq, gain: 0.14, start: c.currentTime + i * 0.09, dur: 0.28 })
  })
}
