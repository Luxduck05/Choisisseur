import { useState } from 'react'
import TouchArea from './TouchArea.jsx'

const MODES = [
  { id: 'single', label: 'One winner', emoji: '🏆' },
  { id: 'multi', label: 'Multiple', emoji: '✌️' },
  { id: 'teams', label: 'Teams', emoji: '👥' },
  { id: 'rank', label: 'Order', emoji: '🔢' },
]

export default function FingerMode() {
  const [mode, setMode] = useState('single')
  const [count, setCount] = useState(2)

  return (
    <div className="finger-mode">
      <div className="finger-controls">
        <div className="segmented" role="tablist" aria-label="Picker mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
            >
              <span aria-hidden="true">{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
        {(mode === 'multi' || mode === 'teams') && (
          <div className="stepper">
            <button onClick={() => setCount(Math.max(2, count - 1))} aria-label="Fewer">
              −
            </button>
            <span>{mode === 'multi' ? `${count} winners` : `${count} teams`}</span>
            <button onClick={() => setCount(Math.min(15, count + 1))} aria-label="More">
              ＋
            </button>
          </div>
        )}
      </div>
      <TouchArea mode={mode} count={count} />
    </div>
  )
}
