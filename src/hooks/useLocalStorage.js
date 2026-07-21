import { useEffect, useState } from 'react'

// JSON state persisted under a localStorage key. Survives reloads; falls back
// gracefully when storage is unavailable (private mode, quota).
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw)
    } catch {
      /* corrupted or unavailable storage — use the default */
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore quota / private-mode failures */
    }
  }, [key, value])

  return [value, setValue]
}
