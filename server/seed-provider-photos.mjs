import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')
await mkdir(uploadDir, { recursive: true })

const { rows } = await pool.query(
  `SELECT p.id, p.gender, p.age FROM providers p
   WHERE NOT EXISTS (SELECT 1 FROM media m WHERE m.provider_id = p.id AND m.type = 'image')
   ORDER BY p.id`,
)

const genderFor = (p) =>
  p.gender === 'ผู้ชาย' ? 'male' : p.gender === 'ผู้หญิง' ? 'female' : p.id % 2 ? 'female' : 'male'

async function fetchFace(p, attempt = 0) {
  const age = p.age && p.age > 25 ? '26-35' : '19-25'
  const url = `https://this-person-does-not-exist.com/new?time=${Date.now()}&gender=${genderFor(p)}&age=${age}&etnic=asian`
  try {
    const meta = await (await fetch(url)).json()
    const img = await fetch(`https://this-person-does-not-exist.com${meta.src}`)
    if (!img.ok) throw new Error(`image ${img.status}`)
    return Buffer.from(await img.arrayBuffer())
  } catch (err) {
    if (attempt >= 3) throw err
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    return fetchFace(p, attempt + 1)
  }
}

let done = 0
for (const p of rows) {
  const buf = await fetchFace(p)
  const file = `ai-profile-${p.id}.jpg`
  await writeFile(path.join(uploadDir, file), buf)
  await pool.query(
    `INSERT INTO media (provider_id, name, type, file) VALUES ($1, 'รูปโปรไฟล์ (AI)', 'image', $2)`,
    [p.id, file],
  )
  if (++done % 25 === 0) console.log(`${done}/${rows.length}`)
}
console.log(`done ${done}`)
await pool.end()
