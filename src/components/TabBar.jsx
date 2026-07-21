const TABS = [
  { id: 'finger', label: 'Fingers', emoji: '👆' },
  { id: 'wheel', label: 'Wheel', emoji: '🎡' },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className="tab-bar" role="tablist" aria-label="Mode">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          className={`tab ${tab === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-emoji" aria-hidden="true">{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
