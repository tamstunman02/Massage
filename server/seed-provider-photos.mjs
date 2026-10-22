import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')
await mkdir(uploadDir, { recursive: true })

const concurrency = Number(process.env.PHOTO_CONCURRENCY) || 3
const photosPerProvider = Math.max(1, Number(process.env.PHOTOS_PER_PROVIDER) || 5)
const onlyMissing = !/^(0|false|no)$/i.test(String(process.env.ONLY_MISSING || '1'))

const { rows: providers } = await pool.query(
  onlyMissing
    ? `SELECT p.id, p.gender, p.age, p.name,
         (SELECT COUNT(*)::int FROM media m WHERE m.provider_id = p.id AND m.type = 'image') AS photo_count
       FROM providers p
       WHERE (SELECT COUNT(*) FROM media m WHERE m.provider_id = p.id AND m.type = 'image') < $1
       ORDER BY p.id`
    : `SELECT p.id, p.gender, p.age, p.name,
         (SELECT COUNT(*)::int FROM media m WHERE m.provider_id = p.id AND m.type = 'image') AS photo_count
       FROM providers p
       ORDER BY p.id`,
  onlyMissing ? [photosPerProvider] : [],
)

const genderFor = (p) =>
  p.gender === 'ผู้ชาย' ? 'male' : p.gender === 'ผู้หญิง' ? 'female' : p.id % 2 ? 'female' : 'male'

const scenes = [
  'soft cafe portrait, natural window light',
  'outdoor city street casual portrait',
  'evening lifestyle portrait, warm light',
  'friendly smile close-up portrait',
  'standing pose full upper body portrait',
  'sitting pose casual fashion portrait',
]

async function fetchFace(p, slot, attempt = 0) {
  const gender = genderFor(p)
  const scene = scenes[slot % scenes.length]
  const seed = p.id * 97 + slot * 31 + attempt * 7
  try {
    const prompt = encodeURIComponent(
      `realistic portrait photo of a young asian ${gender} adult, ${scene}, friendly expression, high quality profile photo, no text, no watermark`,
    )
    const img = await fetch(
      `https://image.pollinations.ai/prompt/${prompt}?width=768&height=1024&seed=${seed}&nologo=true&enhance=true`,
    )
    if (!img.ok) throw new Error(`pollinations ${img.status}`)
    const buf = Buffer.from(await img.arrayBuffer())
    if (buf.length < 8_000) throw new Error('image too small')
    return buf
  } catch (primaryError) {
    try {
      const age = p.age && p.age > 25 ? '26-35' : '19-25'
      const url = `https://this-person-does-not-exist.com/new?time=${Date.now() + seed}&gender=${gender}&age=${age}&etnic=asian`
      const meta = await (await fetch(url)).json()
      const img = await fetch(`https://this-person-does-not-exist.com${meta.src}`)
      if (!img.ok) throw new Error(`tpdne ${img.status}`)
      return Buffer.from(await img.arrayBuffer())
    } catch (fallbackError) {
      if (attempt >= 3) throw fallbackError || primaryError
      await new Promise((r) => setTimeout(r, 900 * (attempt + 1)))
      return fetchFace(p, slot, attempt + 1)
    }
  }
}

let done = 0
let failed = 0
const jobs = []

for (const p of providers) {
  const need = Math.max(0, photosPerProvider - Number(p.photo_count || 0))
  for (let slot = Number(p.photo_count || 0); slot < Number(p.photo_count || 0) + need; slot += 1) {
    jobs.push({ p, slot })
  }
}

async function processOne({ p, slot }) {
  try {
    const buf = await fetchFace(p, slot)
    const file = `ai-profile-${p.id}-${slot + 1}.jpg`
    await writeFile(path.join(uploadDir, file), buf)
    await pool.query(
      `INSERT INTO media (provider_id, name, type, file, sort_order)
       VALUES ($1, $2, 'image', $3, $4)`,
      [p.id, `รูปแนะนำ ${slot + 1}`, file, slot],
    )
    done += 1
    console.log(`ok provider ${p.id} (${p.name}) photo ${slot + 1}`)
  } catch (error) {
    failed += 1
    console.error(`fail provider ${p.id} slot ${slot + 1}:`, error.message)
  }
}

console.log(`providers=${providers.length} jobs=${jobs.length} photosPerProvider=${photosPerProvider}`)

for (let i = 0; i < jobs.length; i += concurrency) {
  await Promise.all(jobs.slice(i, i + concurrency).map(processOne))
  await new Promise((r) => setTimeout(r, 250))
}

console.log(`done ${done}, failed ${failed}, total jobs ${jobs.length}`)
await pool.end()
