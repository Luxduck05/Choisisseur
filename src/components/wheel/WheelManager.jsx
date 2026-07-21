import { TEMPLATES } from '../../utils/templates.js'

export default function WheelManager({
  wheels,
  activeWheel,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onTemplate,
}) {
  const rename = () => {
    const name = prompt('Rename wheel', activeWheel.name)
    if (name && name.trim()) onRename(name.trim())
  }
  const create = () => {
    const name = prompt('Name for the new wheel', 'New wheel')
    if (name && name.trim()) onCreate(name.trim())
  }
  const del = () => {
    if (confirm(`Delete "${activeWheel.name}"?`)) onDelete()
  }

  return (
    <section className="wheel-manager">
      <div className="wheel-manager-row">
        <select
          value={activeWheel.id}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="Saved wheels"
        >
          {wheels.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <button className="icon-btn" onClick={create} aria-label="New wheel" title="New wheel">
          ＋
        </button>
        <button className="icon-btn" onClick={rename} aria-label="Rename wheel" title="Rename">
          ✏️
        </button>
        <button className="icon-btn danger" onClick={del} aria-label="Delete wheel" title="Delete">
          🗑️
        </button>
      </div>
      <div className="template-row">
        {TEMPLATES.map((t) => (
          <button key={t.name} className="chip" onClick={() => onTemplate(t)}>
            {t.name}
          </button>
        ))}
      </div>
    </section>
  )
}
