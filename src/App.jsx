import { useEffect, useState } from 'react'
import TabBar from './components/TabBar.jsx'
import WheelMode from './components/wheel/WheelMode.jsx'
import FingerMode from './components/finger/FingerMode.jsx'
import useLocalStorage from './hooks/useLocalStorage.js'

const THEME_COLORS = { dark: '#14121f', light: '#f3f0fa' }

export default function App() {
  const [tab, setTab] = useState('finger')
  const [theme, setTheme] = useLocalStorage('chooser.theme', () =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Choisisseur</h1>
        <TabBar tab={tab} onChange={setTab} />
        <button
          className="icon-btn theme-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>
      <main className={`app-main ${tab === 'finger' ? 'no-scroll' : ''}`}>
        {tab === 'wheel' ? <WheelMode /> : <FingerMode />}
      </main>
    </div>
  )
}
