import { useEffect, useLayoutEffect, useState } from 'react'
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

  // Set the theme attribute BEFORE paint so the freshly-mounted DOM (see the
  // key={theme} on .app) is born in the right theme. Fresh elements have no
  // cached raster, which sidesteps WebKit not repainting composited layers
  // (fixed auras, backdrop-filter) on a CSS-variable change.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  useEffect(() => {
    sound.setMuted(muted)
  }, [muted])

  // Block document rubber-banding without overflow:hidden on the root (which
  // makes iOS standalone clip the layout above the home indicator). Touch
  // scrolls are only allowed inside elements that can actually scroll.
  useEffect(() => {
    const onTouchMove = (e) => {
      let el = e.target
      while (el && el !== document.body) {
        const { overflowY } = getComputedStyle(el)
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight
        ) {
          return
        }
        el = el.parentElement
      }
      e.preventDefault()
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', onTouchMove)
  }, [])

  return (
    <div className="app" key={theme}>
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
