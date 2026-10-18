import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')
await mkdir(uploadDir, { recursive: true })

const concurrency = Number(process.env.PHOTO_CONCURRENCY) || 4
const { rows } = await pool.query(
  `SELECT p.id, p.gender, p.age, p.name FROM providers p
   WHERE NOT EXISTS (SELECT 1 FROM media m WHERE m.provider_id = p.id AND m.type = 'image')
   ORDER BY p.id`,
)

const genderFor = (p) =>
  p.gender === 'ผู้ชาย' ? 'male' : p.gender === 'ผู้หญิง' ? 'female' : p.id % 2 ? 'female' : 'male'

async function fetchFace(p, attempt = 0) {
  const age = p.age && p.age > 25 ? '26-35' : '19-25'
  const gender = genderFor(p)
  try {
    const url = `https://this-person-does-not-exist.com/new?time=${Date.now() + p.id + attempt}&gender=${gender}&age=${age}&etnic=asian`
    const meta = await (await fetch(url)).json()
    const img = await fetch(`https://this-person-does-not-exist.com${meta.src}`)
    if (!img.ok) throw new Error(`tpdne ${img.status}`)
    return Buffer.from(await img.arrayBuffer())
  } catch (primaryError) {
    try {
      const prompt = encodeURIComponent(
        `realistic portrait photo of a young asian ${gender} adult companion, soft natural light, friendly expression, professional profile photo, no text`,
      )
      const img = await fetch(
        `https://image.pollinations.ai/prompt/${prompt}?width=512&height=640&seed=${p.id * 17 + attempt}&nologo=true`,
      )
      if (!img.ok) throw new Error(`pollinations ${img.status}`)
      return Buffer.from(await img.arrayBuffer())
    } catch (fallbackError) {
      if (attempt >= 4) throw fallbackError || primaryError
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)))
      return fetchFace(p, attempt + 1)
    }
  }
}

let done = 0
let failed = 0
async function processOne(p) {
  try {
    const buf = await fetchFace(p)
    const file = `ai-profile-${p.id}.jpg`
    await writeFile(path.join(uploadDir, file), buf)
    await pool.query(
      `INSERT INTO media (provider_id, name, type, file)
       SELECT $1, 'รูปโปรไฟล์ (AI)', 'image', $2
       WHERE NOT EXISTS (SELECT 1 FROM media WHERE provider_id = $1 AND type = 'image')`,
      [p.id, file],
    )
    done += 1
  } catch (error) {
    failed += 1
    console.error(`fail ${p.id}:`, error.message)
  }
  if ((done + failed) % 20 === 0 || done + failed === rows.length) {
    console.log(`${done + failed}/${rows.length} (ok ${done}, fail ${failed})`)
  }
}

for (let i = 0; i < rows.length; i += concurrency) {
  await Promise.all(rows.slice(i, i + concurrency).map(processOne))
  await new Promise((r) => setTimeout(r, 200))
}

console.log(`done ${done}, failed ${failed}, total ${rows.length}`)
await pool.end()
