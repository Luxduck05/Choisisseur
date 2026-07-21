import { useState } from 'react'
import { uid } from '../../utils/random.js'
import { colorFor } from '../../utils/colors.js'

export default function OptionEditor({ options, onChange }) {
  const [newLabel, setNewLabel] = useState('')

  const update = (id, patch) =>
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  const remove = (id) => onChange(options.filter((o) => o.id !== id))

  const add = (e) => {
    e.preventDefault()
    const label = newLabel.trim()
    if (!label) return
    onChange([...options, { id: uid(), label, weight: 1, color: colorFor(options.length) }])
    setNewLabel('')
  }

  return (
    <section className="option-editor card">
      <h2>Options</h2>
      <form className="option-add" onSubmit={add}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Add an option…"
          aria-label="New option"
        />
        <button type="submit" className="btn" disabled={!newLabel.trim()}>
          Add
        </button>
      </form>
      {options.length === 0 && <p className="hint">No options yet — add a few!</p>}
      <ul className="option-list">
        {options.map((o) => (
          <li key={o.id} className="option-row">
            <input
              type="color"
              value={o.color}
              onChange={(e) => update(o.id, { color: e.target.value })}
              aria-label={`Color for ${o.label}`}
            />
            <input
              type="text"
              value={o.label}
              onChange={(e) => update(o.id, { label: e.target.value })}
              aria-label="Option label"
            />
            <label className="weight" title="Weight — bigger means more likely">
              ×
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={o.weight}
                onChange={(e) =>
                  update(o.id, { weight: Math.max(0.1, Number(e.target.value) || 0.1) })
                }
                aria-label={`Weight for ${o.label}`}
              />
            </label>
            <button
              className="icon-btn danger"
              onClick={() => remove(o.id)}
              aria-label={`Delete ${o.label}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
