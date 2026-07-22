import { useEffect, useState } from 'react'
import TabBar from './components/TabBar.jsx'
import WheelMode from './components/wheel/WheelMode.jsx'
import FingerMode from './components/finger/FingerMode.jsx'
import useLocalStorage from './hooks/useLocalStorage.js'
import * as sound from './utils/sound.js'

const THEME_COLORS = { dark: '#1e050b', light: '#fff4ee' }

export default function App() {
  const [tab, setTab] = useState('finger')
  const [theme, setTheme] = useLocalStorage('chooser.theme', () =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  )
  const [muted, setMuted] = useLocalStorage('chooser.muted', false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme])
    // Safari sometimes fails to repaint backdrop-filter surfaces when CSS
    // variables change; nudging a reflow on the next frame forces it.
    requestAnimationFrame(() => {
      document.body.style.display = 'none'
      void document.body.offsetHeight
      document.body.style.display = ''
    })
  }, [theme])

  useEffect(() => {
    sound.setMuted(muted)
  }, [muted])

  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />
      <div className="bg-auras" aria-hidden="true" />
      <header className="app-header">
        <h1 className="app-title">Choisisseur</h1>
        <TabBar tab={tab} onChange={setTab} />
        <button
          className="icon-btn header-btn"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="icon-btn header-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </header>
      <main className={`app-main ${tab === 'finger' ? 'no-scroll' : ''}`}>
        {tab === 'wheel' ? <WheelMode /> : <FingerMode />}
      </main>
    </div>
  )
}
