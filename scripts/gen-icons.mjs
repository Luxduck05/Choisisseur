// Regenerates the PWA/favicon icon set from a single high-res square source.
// Run: node scripts/gen-icons.mjs [sourcePath]
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SRC =
  process.argv[2] ||
  String.raw`C:\Users\Franck\Desktop\Claude code Teste\Ressources\Choisisseur\Plan de travail 1.png`
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const targets = [
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-48.png', size: 48 },
]

mkdirSync(outDir, { recursive: true })
const meta = await sharp(SRC).metadata()
console.log(`source: ${meta.width}x${meta.height} ${meta.format}`)

for (const { file, size } of targets) {
  await sharp(SRC).resize(size, size, { fit: 'cover' }).png().toFile(join(outDir, file))
  console.log(`wrote ${file} (${size}x${size})`)
}
