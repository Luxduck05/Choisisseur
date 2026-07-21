import { useEffect, useState } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage.js'
import Wheel from './Wheel.jsx'
import OptionEditor from './OptionEditor.jsx'
import WheelManager from './WheelManager.jsx'
import WinnerBanner from './WinnerBanner.jsx'
import { makeWheel } from '../../utils/templates.js'

const DEFAULT_LABELS = ['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Pasta', 'Salad']

export default function WheelMode() {
  const [wheels, setWheels] = useLocalStorage('chooser.wheels', () => [
    makeWheel('My first wheel', DEFAULT_LABELS),
  ])
  const [activeId, setActiveId] = useLocalStorage('chooser.activeWheelId', null)
  const [winner, setWinner] = useState(null)

  const wheel = wheels.find((w) => w.id === activeId) || wheels[0]

  useEffect(() => {
    if (wheel && wheel.id !== activeId) setActiveId(wheel.id)
  }, [wheel, activeId, setActiveId])

  const updateWheel = (patch) =>
    setWheels(wheels.map((w) => (w.id === wheel.id ? { ...w, ...patch } : w)))

  const createWheel = (name, labels = ['Option 1', 'Option 2']) => {
    const w = makeWheel(name, labels)
    setWheels([...wheels, w])
    setActiveId(w.id)
  }

  const deleteWheel = () => {
    const rest = wheels.filter((w) => w.id !== wheel.id)
    if (rest.length === 0) {
      const w = makeWheel('My wheel', DEFAULT_LABELS)
      setWheels([w])
      setActiveId(w.id)
    } else {
      setWheels(rest)
      setActiveId(rest[0].id)
    }
  }

  const handleResult = (seg) => {
    if (navigator.vibrate) navigator.vibrate(80)
    setWinner(seg)
  }

  const closeWinner = () => {
    if (wheel.removeWinner && winner && wheel.options.length > 1) {
      updateWheel({ options: wheel.options.filter((o) => o.id !== winner.id) })
    }
    setWinner(null)
  }

  return (
    <div className="wheel-mode">
      <WheelManager
        wheels={wheels}
        activeWheel={wheel}
        onSelect={setActiveId}
        onCreate={createWheel}
        onRename={(name) => updateWheel({ name })}
        onDelete={deleteWheel}
        onTemplate={(t) => createWheel(t.name, t.labels)}
      />

      <Wheel options={wheel.options} onResult={handleResult} />

      {wheel.options.length < 2 && (
        <p className="hint">Add at least 2 options below to spin the wheel.</p>
      )}

      <div className="wheel-toolbar">
        <label className="toggle">
          <input
            type="checkbox"
            checked={!!wheel.removeWinner}
            onChange={(e) => updateWheel({ removeWinner: e.target.checked })}
          />
          Remove winner after spin
        </label>
      </div>

      <OptionEditor options={wheel.options} onChange={(options) => updateWheel({ options })} />

      {winner && (
        <WinnerBanner winner={winner} willRemove={!!wheel.removeWinner} onClose={closeWinner} />
      )}
    </div>
  )
}
