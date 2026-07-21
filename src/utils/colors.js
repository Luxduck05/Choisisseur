// Playful palette used for wheel segments and finger rings.
export const PALETTE = [
  '#ff5d73',
  '#ffb347',
  '#ffe156',
  '#7bd88f',
  '#38c7d8',
  '#5c95ff',
  '#9b6bff',
  '#ff6bcb',
  '#ff8a5c',
  '#4ce0b3',
  '#c3f73a',
  '#f45b69',
]

export function colorFor(i) {
  return PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length]
}

// High-contrast set for team divider mode.
export const TEAM_COLORS = [
  '#ff5d73',
  '#38c7d8',
  '#ffe156',
  '#9b6bff',
  '#7bd88f',
  '#ff8a5c',
  '#5c95ff',
  '#ff6bcb',
]
