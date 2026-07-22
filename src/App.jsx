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
  const [dbg, setDbg] = useState(null)

  // TEMP diagnostic — measures how iOS sizes the viewport in installed mode.
  useEffect(() => {
    const measure = () => {
      const probe = document.createElement('div')
      probe.style.cssText =
        'position:fixed;bottom:0;left:0;width:1px;height:env(safe-area-inset-bottom);'
      document.body.appendChild(probe)
      const safeBottom = Math.round(probe.getBoundingClientRect().height)
      probe.remove()
      const app = document.querySelector('.app')
      const ta = document.querySelector('.touch-area')
      setDbg({
        innerH: window.innerHeight,
        clientH: document.documentElement.clientHeight,
        visualVP: Math.round(window.visualViewport?.height || 0),
        screenH: window.screen.height,
        dpr: window.devicePixelRatio,
        safeBottom,
        appH: app ? Math.round(app.getBoundingClientRect().height) : null,
        taBottom: ta ? Math.round(ta.getBoundingClientRect().bottom) : null,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
      })
    }
    measure()
    const t = setTimeout(measure, 400)
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
    }
  }, [tab])

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
    <div className="app">
      <div className="grain" aria-hidden="true" />
      <div className="bg-auras" aria-hidden="true" />
      {dbg && (
        <pre className="debug-overlay">
{`standalone ${dbg.standalone}
innerH   ${dbg.innerH}
clientH  ${dbg.clientH}
visualVP ${dbg.visualVP}
screenH  ${dbg.screenH}  dpr ${dbg.dpr}
screen/dpr ${Math.round(dbg.screenH / dbg.dpr)}
safeBottom ${dbg.safeBottom}
appH ${dbg.appH}
touchBottom ${dbg.taBottom}`}
        </pre>
      )}
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
