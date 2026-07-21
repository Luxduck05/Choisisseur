// Single source of randomness so every mode stays uniformly fair.

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function randInt(n) {
  return Math.floor(Math.random() * n)
}

// Returns the index of the picked item, probability proportional to weight.
export function weightedPick(items, getWeight = (it) => it.weight ?? 1) {
  const weights = items.map((it) => Math.max(0, Number(getWeight(it)) || 0))
  const total = weights.reduce((s, w) => s + w, 0)
  if (total <= 0) return randInt(items.length)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r < 0) return i
  }
  return items.length - 1
}

// Fisher–Yates, returns a new array.
export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickN(arr, n) {
  return shuffle(arr).slice(0, Math.max(0, n))
}
