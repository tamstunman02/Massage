import express from 'express'
import { randomBytes } from 'node:crypto'
import { mkdirSync, existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { hashPassword, initDb, pool, verifyPassword } from './db.js'
import { sendVerificationEmail } from './mailer.js'
import { createHash } from 'node:crypto'

const root = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(root, 'uploads')
const distDir = path.join(root, '..', 'dist')
mkdirSync(uploadDir, { recursive: true })

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))
app.use('/uploads', express.static(uploadDir, { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }))

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)
const fail = (res, status, message) => res.status(status).json({ error: message })
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max)
const defaultServices = [
  { name: 'พบปะพูดคุย', duration: '60 นาที', description: 'ตกลงรายละเอียดก่อนนัดหมาย', add: 0 },
  { name: 'ร่วมกิจกรรม', duration: '90 นาที', description: 'ตกลงรายละเอียดก่อนนัดหมาย', add: 300 },
  { name: 'งานอีเวนต์', duration: '90 นาที', description: 'ตกลงรายละเอียดก่อนนัดหมาย', add: 500 },
]

async function populateMockProviderDetails(db, providerId) {
  await db.query(
    `UPDATE providers SET
       age = CASE WHEN age IS NULL OR age < 18 THEN 22 + (id % 13) ELSE age END,
       height_cm = COALESCE(height_cm, 155 + (id % 26)),
       weight_kg = COALESCE(weight_kg, 45 + ((id * 7) % 36)),
       measurements = CASE WHEN measurements = '' THEN
         (30 + (id % 8))::text || '-' || (23 + (id % 7))::text || '-' || (33 + (id % 9))::text
         ELSE measurements END
     WHERE id = $1`,
    [providerId],
  )
}

const mediaTypes = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
}

function readCookie(req, name) {
  const match = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

async function publicUser(user) {
  const { rows } = await pool.query('SELECT label, permissions FROM roles WHERE name = $1', [user.role])
  return {
    id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role,
    providerId: user.provider_id, roleLabel: rows[0]?.label || '', permissions: rows[0]?.permissions || [],
    emailVerified: Boolean(user.email_verified_at),
  }
}

const APP_URL = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')
const sha256 = (value) => createHash('sha256').update(value).digest('hex')

async function issueVerification(user) {
  const token = randomBytes(32).toString('hex')
  await pool.query(
    'UPDATE users SET email_verify_token_hash = $2, email_verify_sent_at = now() WHERE id = $1',
    [user.id, sha256(token)])
  try {
    await sendVerificationEmail({ to: user.email, name: user.name, link: `${APP_URL}/api/verify-email?token=${token}` })
  } catch (error) {
    console.error('ส่งอีเมลยืนยันไม่สำเร็จ', error.message)
  }
}

// ลบบัญชีนักท่องเที่ยว/ผู้ให้บริการที่ไม่ยืนยันอีเมลภายใน 3 วัน
async function purgeUnverified() {
  const { rows } = await pool.query(
    `DELETE FROM users WHERE email_verified_at IS NULL AND role IN ('buyer', 'seller')
       AND created_at < now() - interval '3 days' RETURNING provider_id`)
  const providerIds = rows.map((row) => row.provider_id).filter(Boolean)
  if (providerIds.length) await pool.query('DELETE FROM providers WHERE id = ANY($1::int[])', [providerIds])
  if (rows.length) console.log(`ลบบัญชีที่ไม่ยืนยันอีเมล ${rows.length} รายการ`)
}

const verifyPage = (ok, title, message) => `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#eef7f1,#f6f1e4);font-family:'Noto Sans Thai',system-ui,sans-serif;color:#1f2d26}
.card{max-width:420px;margin:24px;padding:44px 36px;background:#fff;border-radius:24px;text-align:center;box-shadow:0 24px 60px rgba(31,77,58,.15)}
.icon{width:84px;height:84px;margin:0 auto 22px;border-radius:50%;display:grid;place-items:center;font-size:44px;color:#fff;background:${ok ? 'linear-gradient(135deg,#2e9d6a,#1f6f4a)' : 'linear-gradient(135deg,#d9822b,#b85c1c)'};animation:pop .5s ease}
@keyframes pop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
h1{margin:0 0 10px;font-size:26px}p{margin:0 0 28px;color:#5b6b63;line-height:1.7}
a{display:inline-block;padding:13px 30px;border-radius:999px;background:#1f4d3a;color:#fff;text-decoration:none;font-weight:600}</style></head>
<body><div class="card"><div class="icon">${ok ? '✓' : '!'}</div><h1>${title}</h1><p>${message}</p><a href="${APP_URL}/">กลับสู่ NuaNia</a></div></body></html>`


async function startSession(res, userId) {
  const token = randomBytes(32).toString('hex')
  await pool.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [token, userId])
  res.setHeader('Set-Cookie',
    `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

app.use(wrap(async (req, _res, next) => {
  const token = readCookie(req, 'sid')
  if (token) {
    const { rows } = await pool.query(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = $1 AND s.created_at > now() - interval '7 days'`, [token])
    if (rows[0]) req.user = await publicUser(rows[0])
  }
  next()
}))

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return fail(res, 401, 'กรุณาเข้าสู่ระบบ')
  if (!req.user.permissions.includes(permission)) return fail(res, 403, 'ไม่มีสิทธิ์ดำเนินการนี้')
  next()
}

const providerSql = `
  SELECT p.*, COALESCE((
    SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'type', m.type, 'url', '/uploads/' || m.file) ORDER BY m.id)
    FROM media m WHERE m.provider_id = p.id), '[]') AS media
  FROM providers p`

function toProvider(row) {
  const services = Array.isArray(row.services) && row.services.length
    ? row.services
    : defaultServices.map(({ add, ...service }) => ({ ...service, price: Number(row.price) + add }))
  return {
    id: row.id, name: row.name, age: row.age, heightCm: row.height_cm, weightKg: row.weight_kg,
    measurements: row.measurements, province: row.province, area: row.area, gender: row.gender,
    line: row.line, price: row.price, rating: row.rating, reviews: row.reviews, initials: row.initials,
    visual: row.visual, category: row.category, description: row.description, tags: row.tags, venue: row.venue,
    modes: row.modes, services, active: row.active, membershipActive: row.membership_active, media: row.media,
  }
}

const bookingSql = `
  SELECT b.*, p.name AS provider FROM bookings b JOIN providers p ON p.id = b.provider_id`

const reviewSql = `
  SELECT r.id, r.booking_id, r.provider_id, r.user_id, r.service_rating, r.value_rating, r.comment, r.created_at,
    u.name AS user_name, (SELECT p.name FROM providers p WHERE p.id = r.provider_id) AS provider,
    COALESCE(json_agg(json_build_object('id', rm.id, 'name', rm.name, 'type', 'image', 'url', '/uploads/' || rm.file) ORDER BY rm.id)
      FILTER (WHERE rm.id IS NOT NULL), '[]') AS media
  FROM reviews r
  JOIN users u ON u.id = r.user_id
  LEFT JOIN review_media rm ON rm.review_id = r.id`

function toBooking(row) {
  return {
    id: row.id, providerId: row.provider_id, provider: row.provider, service: row.service, date: row.date,
    time: row.time, mode: row.mode, venue: row.venue, amount: row.amount, status: row.status,
    guestName: row.guest_name, phone: row.phone, note: row.note, createdAt: row.created_at,
  }
}

function toApplication(row) {
  return {
    id: row.id, providerId: row.provider_id, name: row.name, line: row.line, province: row.province,
    gender: row.gender, service: row.service, status: row.status,
  }
}

// ---------- auth ----------
app.post('/api/login', wrap(async (req, res) => {
  const email = text(req.body.email, 200).toLowerCase()
  const password = String(req.body.password ?? '')
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [email])
  const user = rows[0]
  const valid = user && await verifyPassword(password, user.password_hash)
  if (!valid || (req.body.role && req.body.role !== user.role)) return fail(res, 401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  await startSession(res, user.id)
  res.json({ user: await publicUser(user) })
}))

app.post('/api/register', wrap(async (req, res) => {
  const role = req.body.role
  if (!['buyer', 'seller'].includes(role)) return fail(res, 400, 'ประเภทสมาชิกไม่ถูกต้อง')
  const name = text(req.body.name, 100)
  const email = text(req.body.email, 200).toLowerCase()
  const password = String(req.body.password ?? '')
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'กรุณากรอกชื่อและอีเมลให้ถูกต้อง')
  if (password.length < 6) return fail(res, 400, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let providerId = null
    const phone = text(req.body.phone, 50)
    if (role === 'seller') {
      const province = text(req.body.province, 100)
      const description = text(req.body.service, 1000)
      const price = Math.max(0, Math.min(1000000, Number(req.body.price) || 0))
      const created = await client.query(
        `INSERT INTO providers (name, province, area, gender, line, price, initials, description, venue, modes, tags, active)
         VALUES ($1,$2,$2,'ไม่ประสงค์ระบุ',$3,$4,$5,$6,$7,'{ที่ร้าน}','{ผู้ให้บริการใหม่}',FALSE) RETURNING id`,
        [name, province, phone, price, name.slice(0, 1), description,
          text(req.body.businessName, 200) || `สถานที่ตามที่ผู้ให้บริการระบุ · ${province}`])
      providerId = created.rows[0].id
      await populateMockProviderDetails(client, providerId)
      await client.query(
        'INSERT INTO applications (provider_id, name, line, province, gender, service) VALUES ($1,$2,$3,$4,$5,$6)',
        [providerId, name, phone, province, 'ไม่ประสงค์ระบุ', description])
    }
    const created = await client.query(
      'INSERT INTO users (name, email, phone, password_hash, role, provider_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, email, phone, await hashPassword(password), role, providerId])
    await client.query('COMMIT')
    await issueVerification(created.rows[0])
    await startSession(res, created.rows[0].id)
    res.status(201).json({ user: await publicUser(created.rows[0]) })
  } catch (error) {
    await client.query('ROLLBACK')
    if (error.code === '23505') return fail(res, 409, 'อีเมลนี้ถูกใช้งานแล้ว')
    throw error
  } finally {
    client.release()
  }
}))

app.post('/api/logout', wrap(async (req, res) => {
  const token = readCookie(req, 'sid')
  if (token) await pool.query('DELETE FROM sessions WHERE token = $1', [token])
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
  res.json({ ok: true })
}))

app.get('/api/me', (req, res) => res.json({ user: req.user || null }))

app.get('/api/verify-email', wrap(async (req, res) => {
  const token = String(req.query.token ?? '')
  res.type('html')
  if (!/^[0-9a-f]{64}$/.test(token)) return res.status(400).send(verifyPage(false, 'ลิงก์ไม่ถูกต้อง', 'ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว'))
  const hash = sha256(token)
  const { rows } = await pool.query(
    `UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()), email_verify_token_hash = NULL
     WHERE email_verify_token_hash = $1 AND created_at > now() - interval '3 days' RETURNING id`, [hash])
  if (!rows.length) return res.status(400).send(verifyPage(false, 'ลิงก์หมดอายุหรือใช้ไปแล้ว', 'กรุณาเข้าสู่ระบบแล้วกดขอส่งลิงก์ยืนยันใหม่อีกครั้ง'))
  res.send(verifyPage(true, 'คุณยืนยันอีเมลแล้ว', 'ขอบคุณที่ยืนยันอีเมล บัญชีของคุณพร้อมใช้งานเต็มรูปแบบแล้ว'))
}))

app.post('/api/resend-verification', wrap(async (req, res) => {
  if (!req.user) return fail(res, 401, 'กรุณาเข้าสู่ระบบ')
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
  const user = rows[0]
  if (user.email_verified_at) return res.json({ ok: true, alreadyVerified: true })
  if (user.email_verify_sent_at && Date.now() - new Date(user.email_verify_sent_at).getTime() < 60000) {
    return fail(res, 429, 'ส่งอีเมลบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่')
  }
  await issueVerification(user)
  res.json({ ok: true })
}))

// ---------- providers ----------
app.get('/api/providers', wrap(async (req, res) => {
  const isAdmin = req.user?.role === 'admin'
  const { rows } = await pool.query(
    `${providerSql} WHERE ($1 OR (p.active AND p.membership_active) OR p.id = $2) ORDER BY p.id`,
    [isAdmin, req.user?.role === 'seller' ? req.user.providerId : null])
  res.json(rows.map(toProvider))
}))

app.patch('/api/providers/:id', requirePermission('profile:edit:own'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  if (req.user.providerId !== id) return fail(res, 403, 'แก้ไขได้เฉพาะโปรไฟล์ของตนเอง')
  let modes = null
  if (Object.hasOwn(req.body, 'modes')) {
    if (!Array.isArray(req.body.modes) || req.body.modes.length > 30 ||
        req.body.modes.some((mode) => typeof mode !== 'string' || mode.length > 60)) {
      return fail(res, 400, 'รูปแบบนัดหมายต้องเป็นรายการไม่เกิน 30 แบบ และแต่ละแบบไม่เกิน 60 ตัวอักษร')
    }
    modes = [...new Set(req.body.modes.map((mode) => mode.trim()).filter(Boolean))]
    if (!modes.length) return fail(res, 400, 'ต้องกำหนดรูปแบบนัดหมายอย่างน้อย 1 แบบ')
  }
  let services = null
  if (Object.hasOwn(req.body, 'services')) {
    if (!Array.isArray(req.body.services) || !req.body.services.length || req.body.services.length > 30) {
      return fail(res, 400, 'ต้องกำหนดรูปแบบบริการ 1–30 รายการ')
    }
    services = []
    const serviceNames = new Set()
    for (const item of req.body.services) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return fail(res, 400, 'ข้อมูลรูปแบบบริการไม่ถูกต้อง')
      }
      const name = text(item.name, 60)
      const duration = text(item.duration, 40)
      const description = text(item.description, 200)
      const price = Number(item.price)
      const nameKey = name.toLocaleLowerCase()
      if (!name || !duration || !description.trim() || !Number.isInteger(price) || price < 1 || price > 1000000 ||
          serviceNames.has(nameKey)) {
        return fail(res, 400, 'กรุณากรอกชื่อ ระยะเวลา รายละเอียด และราคาของแต่ละรูปแบบให้ถูกต้องและไม่ซ้ำกัน')
      }
      serviceNames.add(nameKey)
      services.push({ name, duration, description, price })
    }
  }
  const integerField = (value, min, max) => Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= max
  const age = req.body.age === undefined ? null : integerField(req.body.age, 18, 100) ? Number(req.body.age) : undefined
  const heightCm = req.body.heightCm === undefined ? null : integerField(req.body.heightCm, 120, 230) ? Number(req.body.heightCm) : undefined
  const weightKg = req.body.weightKg === undefined ? null : integerField(req.body.weightKg, 30, 250) ? Number(req.body.weightKg) : undefined
  const measurements = req.body.measurements === undefined ? null
    : typeof req.body.measurements === 'string' ? text(req.body.measurements, 80) : undefined
  if (age === undefined || heightCm === undefined || weightKg === undefined || measurements === undefined) {
    return fail(res, 400, 'กรุณากรอกอายุ ส่วนสูง น้ำหนัก และสัดส่วนให้ถูกต้อง')
  }
  const { rows } = await pool.query(
    `UPDATE providers SET
       name = COALESCE($2, name), price = COALESCE($3, price), description = COALESCE($4, description),
       venue = COALESCE($5, venue), province = COALESCE($6, province), modes = COALESCE($7, modes),
       services = COALESCE($8, services), age = COALESCE($9, age), height_cm = COALESCE($10, height_cm),
       weight_kg = COALESCE($11, weight_kg), measurements = COALESCE($12, measurements)
     WHERE id = $1 RETURNING id`,
    [id, req.body.name === undefined ? null : text(req.body.name, 100) || null,
      Number.isFinite(Number(req.body.price)) && req.body.price !== '' && req.body.price != null
        ? Math.max(0, Math.min(1000000, Number(req.body.price))) : null,
      req.body.description === undefined ? null
        : typeof req.body.description === 'string' ? req.body.description.slice(0, 1000) : '',
      req.body.venue === undefined ? null : text(req.body.venue, 200),
      req.body.province === undefined ? null : text(req.body.province, 100), modes,
      services === null ? null : JSON.stringify(services), age, heightCm, weightKg, measurements])
  if (!rows[0]) return fail(res, 404, 'ไม่พบโปรไฟล์')
  const result = await pool.query(`${providerSql} WHERE p.id = $1`, [id])
  res.json(toProvider(result.rows[0]))
}))

app.patch('/api/admin/providers/:id', requirePermission('provider:suspend'), wrap(async (req, res) => {
  const { active, membershipActive } = req.body
  const { rows } = await pool.query(
    `UPDATE providers SET active = COALESCE($2, active), membership_active = COALESCE($3, membership_active)
     WHERE id = $1 RETURNING id`,
    [Number(req.params.id), typeof active === 'boolean' ? active : null, typeof membershipActive === 'boolean' ? membershipActive : null])
  if (!rows[0]) return fail(res, 404, 'ไม่พบโปรไฟล์')
  const result = await pool.query(`${providerSql} WHERE p.id = $1`, [rows[0].id])
  res.json(toProvider(result.rows[0]))
}))

// ---------- media ----------
app.post('/api/providers/:id/media', requirePermission('profile:edit:own'),
  express.raw({ type: () => true, limit: '100mb' }), wrap(async (req, res) => {
    const id = Number(req.params.id)
    if (req.user.providerId !== id) return fail(res, 403, 'อัปโหลดได้เฉพาะโปรไฟล์ของตนเอง')
    const mime = String(req.headers['content-type'] || '').split(';')[0].trim()
    const ext = mediaTypes[mime]
    if (!ext) return fail(res, 415, 'รองรับเฉพาะรูปภาพ (JPG, PNG, WebP, GIF) และวิดีโอ (MP4, WebM, MOV)')
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return fail(res, 400, 'ไม่พบไฟล์')
    let name = 'media'
    try { name = text(decodeURIComponent(String(req.headers['x-file-name'] || 'media')), 200) } catch { /* keep default */ }
    const file = `${randomBytes(16).toString('hex')}.${ext}`
    await writeFile(path.join(uploadDir, file), req.body)
    const { rows } = await pool.query(
      'INSERT INTO media (provider_id, name, type, file) VALUES ($1,$2,$3,$4) RETURNING id',
      [id, name, mime.startsWith('video/') ? 'video' : 'image', file])
    res.status(201).json({ id: rows[0].id, name, type: mime.startsWith('video/') ? 'video' : 'image', url: `/uploads/${file}` })
  }))

app.delete('/api/media/:id', requirePermission('profile:edit:own'), wrap(async (req, res) => {
  const { rows } = await pool.query('DELETE FROM media WHERE id = $1 AND provider_id = $2 RETURNING file',
    [Number(req.params.id), req.user.providerId])
  if (!rows[0]) return fail(res, 404, 'ไม่พบไฟล์')
  await unlink(path.join(uploadDir, rows[0].file)).catch(() => {})
  res.json({ ok: true })
}))

// ---------- provider reviews ----------
app.get('/api/providers/:id/reviews', wrap(async (req, res) => {
  const providerId = Number(req.params.id)
  if (!Number.isInteger(providerId) || providerId < 1) return fail(res, 400, 'รหัสโปรไฟล์ไม่ถูกต้อง')
  const { rows } = await pool.query(
    `${reviewSql} WHERE r.provider_id = $1 GROUP BY r.id, u.name ORDER BY r.created_at DESC`, [providerId])
  const reviewRows = rows.map((row) => ({
    id: row.id, bookingId: row.user_id === req.user?.id ? row.booking_id : null,
    userName: row.user_name, serviceRating: row.service_rating, valueRating: row.value_rating,
    comment: row.comment, createdAt: row.created_at, media: row.media, isDemo: false,
  }))
  const { rows: demoRows } = await pool.query(
    `SELECT id, user_name, service_rating, value_rating, comment, created_at
     FROM demo_reviews WHERE provider_id = $1 ORDER BY created_at DESC, id DESC`, [providerId])
  reviewRows.push(...demoRows.map((row) => ({
    id: `demo-${row.id}`, bookingId: null, userName: row.user_name,
    serviceRating: row.service_rating, valueRating: row.value_rating,
    comment: row.comment, createdAt: row.created_at, media: [], isDemo: true,
  })))
  reviewRows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const canReviewBookings = req.user?.role === 'buyer'
    ? (await pool.query(
      `SELECT b.id FROM bookings b
       WHERE b.provider_id = $1 AND b.user_id = $2 AND b.status = 'เสร็จสิ้น'
         AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = b.id)
       ORDER BY b.created_at DESC`, [providerId, req.user.id])).rows.map((row) => row.id)
    : []
  res.json({ reviews: reviewRows, canReviewBookings })
}))

app.post('/api/providers/:id/reviews', requirePermission('review:create'), wrap(async (req, res) => {
  const providerId = Number(req.params.id)
  const bookingId = text(req.body.bookingId, 100)
  const serviceRating = Number(req.body.serviceRating)
  const valueRating = Number(req.body.valueRating)
  const comment = text(req.body.comment, 2000)
  if (!Number.isInteger(providerId) || providerId < 1 ||
      !Number.isInteger(serviceRating) || serviceRating < 1 || serviceRating > 5 ||
      !Number.isInteger(valueRating) || valueRating < 1 || valueRating > 5 ||
      comment.length < 2) {
    return fail(res, 400, 'กรุณาให้คะแนนและเขียนรีวิวให้ครบถ้วน')
  }
  const { rows: bookings } = await pool.query(
    `SELECT id FROM bookings WHERE id = $1 AND provider_id = $2 AND user_id = $3 AND status = 'เสร็จสิ้น'`,
    [bookingId, providerId, req.user.id])
  if (!bookings[0]) return fail(res, 403, 'รีวิวได้เมื่อการนัดหมายของคุณเสร็จสิ้นแล้วเท่านั้น')
  try {
    const { rows } = await pool.query(
      `INSERT INTO reviews (booking_id, provider_id, user_id, service_rating, value_rating, comment)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [bookingId, providerId, req.user.id, serviceRating, valueRating, comment])
    const review = await pool.query(
      `${reviewSql} WHERE r.id = $1 GROUP BY r.id, u.name`, [rows[0].id])
    const row = review.rows[0]
    res.status(201).json({
      id: row.id, bookingId: row.booking_id, userName: row.user_name,
      serviceRating: row.service_rating, valueRating: row.value_rating,
      comment: row.comment, createdAt: row.created_at, media: row.media,
    })
  } catch (error) {
    if (error.code === '23505') return fail(res, 409, 'รีวิวการนัดหมายนี้ไปแล้ว')
    throw error
  }
}))

app.post('/api/reviews/:id/media', requirePermission('review:create'),
  express.raw({ type: () => true, limit: '8mb' }), wrap(async (req, res) => {
    const reviewId = Number(req.params.id)
    if (!Number.isInteger(reviewId) || reviewId < 1) return fail(res, 400, 'รหัสรีวิวไม่ถูกต้อง')
    const { rows: reviews } = await pool.query(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2', [reviewId, req.user.id])
    if (!reviews[0]) return fail(res, 404, 'ไม่พบรีวิวของคุณ')
    const mime = String(req.headers['content-type'] || '').split(';')[0].trim()
    const ext = mediaTypes[mime]
    if (!ext || !mime.startsWith('image/')) return fail(res, 415, 'ไฟล์แนบรีวิวต้องเป็น JPG, PNG, WebP หรือ GIF')
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return fail(res, 400, 'ไม่พบไฟล์รูปภาพ')
    const { rows: countRows } = await pool.query('SELECT count(*)::int AS count FROM review_media WHERE review_id = $1', [reviewId])
    if (countRows[0].count >= 6) return fail(res, 400, 'แนบรูปรีวิวได้ไม่เกิน 6 รูป')
    let name = 'review-image'
    try { name = text(decodeURIComponent(String(req.headers['x-file-name'] || name)), 200) } catch { /* keep default */ }
    const file = `${randomBytes(16).toString('hex')}.${ext}`
    await writeFile(path.join(uploadDir, file), req.body)
    try {
      const { rows } = await pool.query(
        'INSERT INTO review_media (review_id, name, file) VALUES ($1,$2,$3) RETURNING id',
        [reviewId, name, file])
      res.status(201).json({ id: rows[0].id, name, url: `/uploads/${file}` })
    } catch (error) {
      await unlink(path.join(uploadDir, file)).catch(() => {})
      throw error
    }
  }))

// ---------- bookings ----------
app.get('/api/bookings', wrap(async (req, res) => {
  if (!req.user) return res.json([])
  const { role, id, providerId } = req.user
  let where = 'WHERE b.user_id = $1'
  let param = id
  if (role === 'admin') { where = 'WHERE $1::int IS NOT NULL'; param = id }
  if (role === 'seller') { where = 'WHERE b.provider_id = $1'; param = providerId }
  const { rows } = await pool.query(`${bookingSql} ${where} ORDER BY b.created_at DESC`, [param])
  res.json(rows.map(toBooking))
}))

app.get('/api/admin/travelers', requirePermission('user:view'), wrap(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at,
      COUNT(b.id)::int AS booking_count
     FROM users u
     LEFT JOIN bookings b ON b.user_id = u.id
     WHERE u.role = 'buyer'
     GROUP BY u.id
     ORDER BY u.created_at DESC, u.id DESC`,
  )
  res.json(rows.map((row) => ({
    id: row.id, name: row.name, email: row.email, phone: row.phone,
    createdAt: row.created_at, bookingCount: row.booking_count,
  })))
}))

app.get('/api/admin/travelers/:id', requirePermission('user:view'), wrap(async (req, res) => {
  const travelerId = Number(req.params.id)
  if (!Number.isSafeInteger(travelerId) || travelerId <= 0) return fail(res, 400, 'รหัสนักท่องเที่ยวไม่ถูกต้อง')
  const { rows: travelerRows } = await pool.query(
    `SELECT id, name, email, phone, created_at
     FROM users WHERE id = $1 AND role = 'buyer'`,
    [travelerId],
  )
  const traveler = travelerRows[0]
  if (!traveler) return fail(res, 404, 'ไม่พบนักท่องเที่ยว')

  const [bookingResult, favoriteResult, reviewResult] = await Promise.all([
    pool.query(`${bookingSql} WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [travelerId]),
    pool.query(
      `SELECT p.id, p.name, p.province
       FROM favorites f JOIN providers p ON p.id = f.provider_id
       WHERE f.user_id = $1 ORDER BY p.name`,
      [travelerId],
    ),
    pool.query(`${reviewSql} WHERE r.user_id = $1 GROUP BY r.id, u.name ORDER BY r.created_at DESC`, [travelerId]),
  ])

  res.json({
    traveler: {
      id: traveler.id, name: traveler.name, email: traveler.email, phone: traveler.phone,
      createdAt: traveler.created_at,
    },
    bookings: bookingResult.rows.map(toBooking),
    favorites: favoriteResult.rows.map((row) => ({ id: row.id, name: row.name, province: row.province })),
    reviews: reviewResult.rows.map((row) => ({
      id: row.id, bookingId: row.booking_id, providerId: row.provider_id, provider: row.provider,
      serviceRating: row.service_rating, valueRating: row.value_rating, comment: row.comment,
      createdAt: row.created_at, media: row.media,
    })),
  })
}))

app.post('/api/bookings', requirePermission('booking:create'), wrap(async (req, res) => {
  const { rows: found } = await pool.query(
    'SELECT * FROM providers WHERE id = $1 AND active AND membership_active', [Number(req.body.providerId)])
  const provider = found[0]
  if (!provider) return fail(res, 404, 'ไม่พบผู้ให้บริการ')
  const mode = text(req.body.mode, 60)
  if (!provider.modes.includes(mode)) return fail(res, 400, 'รูปแบบนัดหมายนี้ไม่มีให้บริการแล้ว')
  const service = toProvider(provider).services.find((item) => item.name === text(req.body.service, 60))
  if (!service) return fail(res, 400, 'รูปแบบบริการนี้ไม่มีให้จองแล้ว')
  const amount = service.price + (mode === 'นอกสถานที่' ? 250 : 0)
  const reference = `ND-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`
  const { rows } = await pool.query(
    `INSERT INTO bookings (id, provider_id, user_id, service, date, time, mode, venue, amount, guest_name, phone, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [reference, provider.id, req.user.id, `${service.name} · ${service.duration}`, text(req.body.date, 20), text(req.body.time, 10), mode,
      mode === 'ที่ร้าน' ? provider.venue : text(req.body.address, 300), amount,
      text(req.body.guestName, 100), text(req.body.phone, 50), text(req.body.note, 1000)])
  const result = await pool.query(`${bookingSql} WHERE b.id = $1`, [rows[0].id])
  res.status(201).json(toBooking(result.rows[0]))
}))

app.patch('/api/bookings/:id', wrap(async (req, res) => {
  if (!req.user) return fail(res, 401, 'กรุณาเข้าสู่ระบบ')
  const status = req.body.status
  const allowed = {
    seller: { 'ยืนยันแล้ว': 'booking:accept', 'เสร็จสิ้น': 'booking:complete', 'ปฏิเสธ': 'booking:reject' },
    buyer: { 'ยกเลิก': 'booking:cancel:own' },
    admin: { 'ยกเลิก': 'booking:cancel:all' },
  }[req.user.role] || {}
  const needed = allowed[status]
  if (!needed || !req.user.permissions.includes(needed)) return fail(res, 403, 'ไม่มีสิทธิ์เปลี่ยนสถานะนี้')
  const scope = { seller: 'provider_id = $3', buyer: 'user_id = $3', admin: '$3::int IS NOT NULL' }[req.user.role]
  const scopeValue = req.user.role === 'seller' ? req.user.providerId : req.user.id
  const { rows } = await pool.query(
    `UPDATE bookings SET status = $2 WHERE id = $1 AND ${scope} RETURNING id`, [req.params.id, status, scopeValue])
  if (!rows[0]) return fail(res, 404, 'ไม่พบนัดหมาย')
  const result = await pool.query(`${bookingSql} WHERE b.id = $1`, [rows[0].id])
  res.json(toBooking(result.rows[0]))
}))

// ---------- favorites ----------
app.get('/api/favorites', wrap(async (req, res) => {
  if (!req.user) return res.json([])
  const { rows } = await pool.query('SELECT provider_id FROM favorites WHERE user_id = $1 ORDER BY provider_id', [req.user.id])
  res.json(rows.map((row) => row.provider_id))
}))

app.put('/api/favorites/:providerId', requirePermission('favorite:manage'), wrap(async (req, res) => {
  const providerId = Number(req.params.providerId)
  const removed = await pool.query('DELETE FROM favorites WHERE user_id = $1 AND provider_id = $2', [req.user.id, providerId])
  if (removed.rowCount === 0) {
    const exists = await pool.query('SELECT 1 FROM providers WHERE id = $1', [providerId])
    if (!exists.rowCount) return fail(res, 404, 'ไม่พบผู้ให้บริการ')
    await pool.query('INSERT INTO favorites (user_id, provider_id) VALUES ($1, $2)', [req.user.id, providerId])
  }
  const { rows } = await pool.query('SELECT provider_id FROM favorites WHERE user_id = $1 ORDER BY provider_id', [req.user.id])
  res.json(rows.map((row) => row.provider_id))
}))

// ---------- applications ----------
app.post('/api/applications', wrap(async (req, res) => {
  const name = text(req.body.name, 100)
  if (!name || req.body.consent !== true) return fail(res, 400, 'กรุณากรอกชื่อและยืนยันความยินยอม')
  const { rows } = await pool.query(
    'INSERT INTO applications (name, line, province, gender, service) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, text(req.body.line, 100), text(req.body.province, 100), text(req.body.gender, 50), text(req.body.service, 1000)])
  res.status(201).json(toApplication(rows[0]))
}))

app.get('/api/applications', requirePermission('provider:approve'), wrap(async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM applications WHERE status = 'รอตรวจสอบ' ORDER BY id`)
  res.json(rows.map(toApplication))
}))

app.post('/api/applications/:id/approve', requirePermission('provider:approve'), wrap(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE applications SET status = 'อนุมัติแล้ว' WHERE id = $1 AND status = 'รอตรวจสอบ' RETURNING *`, [Number(req.params.id)])
  const item = rows[0]
  if (!item) return fail(res, 404, 'ไม่พบใบสมัคร')
  if (item.provider_id) {
    await pool.query('UPDATE providers SET active = TRUE WHERE id = $1', [item.provider_id])
  } else {
    const createdProvider = await pool.query(
      `INSERT INTO providers (name, age, province, area, gender, line, price, initials, category, description, tags, venue, modes, active)
       VALUES ($1,0,$2,$2,$3,$4,1000,$5,'New provider',$6,'{ผู้ให้บริการใหม่,โปรไฟล์ตัวอย่าง}','สถานที่นัดพบตามที่ระบุ','{ที่ร้าน,นอกสถานที่}',TRUE)
       RETURNING id`,
      [item.name, item.province, item.gender, item.line, item.name.slice(0, 1),
        item.service || 'ผู้ให้บริการอิสระ · กรุณาตกลงรายละเอียดและขอบเขตก่อนนัดหมาย'])
    await populateMockProviderDetails(pool, createdProvider.rows[0].id)
  }
  res.json({ ok: true })
}))

app.post('/api/applications/:id/reject', requirePermission('provider:approve'), wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    `UPDATE applications SET status = 'ปฏิเสธ' WHERE id = $1 AND status = 'รอตรวจสอบ'`, [Number(req.params.id)])
  if (!rowCount) return fail(res, 404, 'ไม่พบใบสมัคร')
  res.json({ ok: true })
}))

// ---------- static + errors ----------
app.use('/api', (_req, res) => fail(res, 404, 'ไม่พบ API'))
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.use((error, _req, res, _next) => {
  console.error(error)
  fail(res, 500, 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์')
})

const port = Number(process.env.PORT) || 3001
await initDb()
await purgeUnverified()
setInterval(() => purgeUnverified().catch((error) => console.error(error)), 60 * 60 * 1000)
app.listen(port, () => console.log(`API ready on http://localhost:${port}`))
