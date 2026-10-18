import { pool, hashPassword } from './db.js'

const COUNT = 100
const first = ['สมชาย', 'สมหญิง', 'ธนพล', 'กมล', 'วรเชษฐ์', 'ปรีชา', 'นภัส', 'ศุภกร', 'อรุณ', 'พิมพ์ชนก', 'ชยพล', 'ณัฐวุฒิ', 'กานต์', 'พงศกร', 'ธีรภัทร', 'สุรชัย', 'ปวีณา', 'ภูมิ', 'รัตนา', 'อนุชา']
const last = ['ใจดี', 'รักไทย', 'สุขสวัสดิ์', 'แสงทอง', 'ศรีสุข', 'มั่นคง', 'วงศ์ไทย', 'เพชรรัตน์', 'บุญมา', 'ทองดี', 'จันทร์เพ็ญ', 'พรหมมา', 'สายสุวรรณ', 'คงเจริญ', 'ลิ้มสกุล']
const services = ['พบปะพูดคุย · 60 นาที', 'ร่วมกิจกรรม · 90 นาที', 'ไลฟ์สไตล์ · 120 นาที', 'งานอีเวนต์ · 180 นาที']
const modes = ['ที่ร้าน', 'นอกสถานที่']
const comments = [
  'บริการดีมาก ตรงเวลา ประทับใจครับ',
  'คุ้มค่า แนะนำเลยค่ะ',
  'พูดคุยสนุก เป็นกันเอง',
  'ทุกอย่างราบรื่น จะกลับมาใช้บริการอีก',
  'โดยรวมดี แต่รอคิวนานนิดหน่อย',
  'สุภาพ เป็นมืออาชีพ',
]
const pick = (arr, i) => arr[i % arr.length]
const rnd = (n) => Math.floor(Math.random() * n)
const pad = (n) => String(n).padStart(2, '0')

const providers = (await pool.query('SELECT id FROM providers ORDER BY id')).rows.map((r) => r.id)
const hash = await hashPassword('buyer123')
let created = 0

for (let i = 1; i <= COUNT; i++) {
  const email = `traveler${String(i).padStart(3, '0')}@example.com`
  const name = `${pick(first, rnd(first.length))} ${pick(last, rnd(last.length))}`
  const phone = `08${rnd(10)}${String(1000000 + rnd(9000000))}`
  const u = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'buyer')
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [name, email, phone, hash],
  )
  if (!u.rows.length) continue
  created++
  const userId = u.rows[0].id

  const bookingCount = 1 + rnd(6)
  for (let k = 0; k < bookingCount; k++) {
    const id = `ND-S${String(i).padStart(3, '0')}${k}`
    const pid = providers[rnd(providers.length)]
    const status = pick(['เสร็จสิ้น', 'เสร็จสิ้น', 'เสร็จสิ้น', 'ยืนยันแล้ว', 'รอยืนยัน'], rnd(5))
    const daysAgo = status === 'เสร็จสิ้น' ? 5 + rnd(150) : -(1 + rnd(20))
    const d = new Date(Date.now() - daysAgo * 86400000)
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const service = pick(services, rnd(services.length))
    const amount = [900, 1200, 1500, 2400][services.indexOf(service)]
    const venue = (await pool.query('SELECT venue FROM providers WHERE id = $1', [pid])).rows[0]?.venue ?? ''
    await pool.query(
      `INSERT INTO bookings (id, provider_id, user_id, service, date, time, mode, venue, amount, status, guest_name, phone, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, pid, userId, service, date, `${pad(10 + rnd(11))}:00`, pick(modes, rnd(2)), venue, amount, status, name, phone, new Date(d.getTime() - 3 * 86400000)],
    )
    if (status === 'เสร็จสิ้น' && Math.random() < 0.6) {
      await pool.query(
        `INSERT INTO reviews (booking_id, provider_id, user_id, service_rating, value_rating, comment, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, pid, userId, 3 + rnd(3), 3 + rnd(3), pick(comments, rnd(comments.length)), d],
      )
    }
  }

  const favCount = rnd(4)
  for (let f = 0; f < favCount; f++) {
    await pool.query(
      'INSERT INTO favorites (user_id, provider_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [userId, providers[rnd(providers.length)]],
    )
  }
}

const total = (await pool.query(`SELECT count(*)::int AS n FROM users WHERE role = 'buyer'`)).rows[0].n
console.log(`created ${created}, total buyers ${total}`)
await pool.end()
