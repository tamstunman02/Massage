import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashPassword, initDb, pool } from './db.js'

const root = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(root, 'uploads')

const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@nuania.app').trim().toLowerCase()
const adminPassword = String(process.env.ADMIN_PASSWORD || '@Tam0931329908')
const adminName = String(process.env.ADMIN_NAME || 'Admin')

await initDb()

await pool.query(`
  TRUNCATE TABLE
    review_media,
    reviews,
    seek_comments,
    seek_posts,
    favorites,
    bookings,
    media,
    applications,
    sessions,
    users,
    providers,
    app_settings
  RESTART IDENTITY CASCADE
`)

await pool.query(
  `INSERT INTO app_settings (key, value) VALUES
    ('province-demo-providers-v1', 'skipped-production'),
    ('traveler-reviews-v1', 'skipped-production'),
    ('province-providers-v2-10', 'skipped-production')
   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
)

const hash = await hashPassword(adminPassword)
await pool.query(
  `INSERT INTO users (name, email, password_hash, role, email_verified_at)
   VALUES ($1, $2, $3, 'admin', now())`,
  [adminName, adminEmail, hash],
)

try {
  const files = await readdir(uploadDir)
  await Promise.all(
    files
      .filter((name) => name !== '.gitkeep')
      .map((name) => unlink(path.join(uploadDir, name)).catch(() => {})),
  )
} catch {
  /* โฟลเดอร์อัปโหลดยังไม่มีก็ข้าม */
}

const { rows } = await pool.query(`
  SELECT
    (SELECT count(*)::int FROM providers) AS providers,
    (SELECT count(*)::int FROM users) AS users,
    (SELECT count(*)::int FROM bookings) AS bookings,
    (SELECT count(*)::int FROM reviews) AS reviews,
    (SELECT count(*)::int FROM seek_posts) AS seek_posts
`)

console.log('ล้างฐานข้อมูลเรียบร้อย — พร้อมขึ้นโปรดักชัน')
console.log(rows[0])
console.log(`แอดมิน: ${adminEmail}`)
console.log('รหัสผ่าน: ตาม ADMIN_PASSWORD หรือค่าที่ตั้งไว้')
console.log('เข้าสู่ระบบแล้วเปลี่ยนรหัสทันที')

await pool.end()
