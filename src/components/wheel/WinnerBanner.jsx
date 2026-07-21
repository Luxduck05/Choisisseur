export default function WinnerBanner({ winner, willRemove, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal winner-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Winner"
        style={{ '--winner-color': winner.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="winner-emoji" aria-hidden="true">
          🎉
        </div>
        <p className="winner-eyebrow">The wheel has chosen</p>
        <h2 className="winner-label">{winner.label}</h2>
        {willRemove && <p className="hint">This option will now be removed from the wheel.</p>}
        <button className="btn primary" onClick={onClose} autoFocus>
          Nice!
        </button>
      </div>
    </div>
  )
}
