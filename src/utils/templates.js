import { uid } from './random.js'
import { colorFor } from './colors.js'

export const TEMPLATES = [
  { name: 'Yes / No', labels: ['Yes', 'No', 'Yes', 'No'] },
  { name: 'Food', labels: ['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Pasta', 'Salad', 'Curry', 'Ramen'] },
  { name: 'Movies', labels: ['Comedy', 'Action', 'Horror', 'Sci-Fi', 'Romance', 'Documentary', 'Animation', 'Thriller'] },
  { name: 'Activities', labels: ['Board games', 'Movie night', 'Go for a walk', 'Video games', 'Cook together', 'Read a book', 'Call a friend', 'Do nothing'] },
  { name: 'Colors', labels: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Pink'] },
  { name: 'Numbers 1–10', labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
]

export function makeOptions(labels) {
  return labels.map((label, i) => ({ id: uid(), label, weight: 1, color: colorFor(i) }))
}

export function makeWheel(name, labels) {
  return { id: uid(), name, options: makeOptions(labels), removeWinner: false }
}
