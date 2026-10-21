import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const BRAND = [
  [124, 58, 237],
  [236, 72, 153],
  [249, 115, 22],
]

function lerp(a, b, t) {
  return a + (b - a) * t
}

function mix(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ]
}

function brandColor(t) {
  if (t <= 0.55) return mix(BRAND[0], BRAND[1], t / 0.55)
  return mix(BRAND[1], BRAND[2], (t - 0.55) / 0.45)
}

function crc32(buf) {
  let c = ~0
  for (const b of buf) {
    c ^= b
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1)
    raw[row] = 0
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function insideRoundRect(x, y, size, radius) {
  const r = radius
  if (x >= r && x < size - r) return y >= 0 && y < size
  if (y >= r && y < size - r) return x >= 0 && x < size
  const cx = x < r ? r : size - r
  const cy = y < r ? r : size - r
  const dx = x - cx + 0.5
  const dy = y - cy + 0.5
  return dx * dx + dy * dy <= r * r
}

function pointInPoly(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0]
    const yi = poly[i][1]
    const xj = poly[j][0]
    const yj = poly[j][1]
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi
    if (hit) inside = !inside
  }
  return inside
}

// Path from favicon.svg scaled from 64x64
const N_POLY = [
  [19, 46], [19, 18], [26, 18], [39, 35], [39, 18], [46, 18],
  [46, 46], [39, 46], [26, 29], [26, 46],
]

function rasterIcon(size) {
  const rgba = Buffer.alloc(size * size * 4)
  const radius = size * 0.25
  const scale = size / 64
  const poly = N_POLY.map(([x, y]) => [x * scale, y * scale])
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      if (!insideRoundRect(x, y, size, radius)) continue
      const t = (x / (size - 1) + y / (size - 1)) / 2
      const [r, g, b] = brandColor(t)
      const letter = pointInPoly(x + 0.5, y + 0.5, poly)
      rgba[i] = letter ? 255 : r
      rgba[i + 1] = letter ? 255 : g
      rgba[i + 2] = letter ? 255 : b
      rgba[i + 3] = 255
    }
  }
  return encodePng(size, size, rgba)
}

function rasterOg(width, height) {
  const rgba = Buffer.alloc(width * height * 4)
  const icon = 280
  const ox = Math.round((width - icon) / 2)
  const oy = Math.round((height - icon) / 2 - 24)
  const radius = icon * 0.25
  const scale = icon / 64
  const poly = N_POLY.map(([x, y]) => [ox + x * scale, oy + y * scale])
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const gt = x / (width - 1)
      const [br, bg, bb] = mix([250, 248, 255], mix([244, 237, 255], [255, 232, 243], gt), 0.7)
      rgba[i] = br
      rgba[i + 1] = bg
      rgba[i + 2] = bb
      rgba[i + 3] = 255
      if (x >= ox && x < ox + icon && y >= oy && y < oy + icon) {
        const lx = x - ox
        const ly = y - oy
        if (insideRoundRect(lx, ly, icon, radius)) {
          const t = (lx / (icon - 1) + ly / (icon - 1)) / 2
          const [r, g, b] = brandColor(t)
          const letter = pointInPoly(x + 0.5, y + 0.5, poly)
          rgba[i] = letter ? 255 : r
          rgba[i + 1] = letter ? 255 : g
          rgba[i + 2] = letter ? 255 : b
        }
      }
    }
  }
  return encodePng(width, height, rgba)
}

function pngToIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry[0] = size === 256 ? 0 : size
  entry[1] = size === 256 ? 0 : size
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, png])
}

const out = (name) => path.join('public', name)
const png48 = rasterIcon(48)
const png96 = rasterIcon(96)
const png192 = rasterIcon(192)
const png180 = rasterIcon(180)
writeFileSync(out('favicon-48.png'), png48)
writeFileSync(out('favicon-96.png'), png96)
writeFileSync(out('favicon-192.png'), png192)
writeFileSync(out('apple-touch-icon.png'), png180)
writeFileSync(out('favicon.ico'), pngToIco(png48, 48))
writeFileSync(out('og-image.png'), rasterOg(1200, 630))
console.log('wrote favicon png/ico and og-image')
