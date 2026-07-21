// Brand palette drawn from the charter's amaranth + tangerine-dream ramps.
// Warm-dominant but spread across hue/lightness so segments and finger rings
// stay distinguishable.
export const PALETTE = [
  '#db3358', // primary amaranth
  '#ff6633', // tangerine 400
  '#ffa487', // secondary coral
  '#e87d94', // amaranth 300
  '#ff8c66', // tangerine 300
  '#ad1f3e', // amaranth 600
  '#cc3300', // tangerine 600
  '#f0a8b8', // amaranth 200
  '#ffb399', // tangerine 200
  '#992600', // tangerine 700
]

export function colorFor(i) {
  return PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length]
}

// Most-separated subset for team divider mode.
export const TEAM_COLORS = [
  '#db3358',
  '#ff6633',
  '#ffa487',
  '#82172e',
  '#ff8c66',
  '#cc3300',
  '#e87d94',
  '#992600',
]
