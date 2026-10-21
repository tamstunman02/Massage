import express from 'express'
import { EventEmitter } from 'node:events'
import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync, existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { hashPassword, initDb, pool, verifyPassword } from './db.js'
import { describeMailSetup, sendVerificationEmail } from './mailer.js'

const seekRealtime = new EventEmitter()
seekRealtime.setMaxListeners(0)

function publishSeekEvent(postId, type, payload = {}) {
  seekRealtime.emit(`post:${Number(postId)}`, { type, postId: Number(postId), at: Date.now(), ...payload })
  seekRealtime.emit('board', { type, postId: Number(postId), at: Date.now(), ...payload })
}

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

function normalizeLineId(value) {
  let raw = text(value, 200)
  if (!raw) return ''
  try {
    const asUrl = /^https?:\/\//i.test(raw) ? raw : /line\.me/i.test(raw) ? `https://${raw.replace(/^\/+/, '')}` : ''
    if (asUrl) {
      const parsed = new URL(asUrl)
      const path = decodeURIComponent(parsed.pathname)
      const match = path.match(/\/(?:ti\/p\/~?|R\/ti\/p\/@?)([^/?#]+)/i)
      if (match?.[1]) return match[1].replace(/^@+/, '').slice(0, 80)
    }
  } catch { /* keep raw */ }
  return raw.replace(/^@+/, '').replace(/^https?:\/\/line\.me\/ti\/p\/~?/i, '').slice(0, 80)
}

function normalizeFacebookUrl(value) {
  let facebook = text(value, 300)
  if (!facebook) return { ok: true, value: '' }
  const asUrl = /^https?:\/\//i.test(facebook)
    ? facebook
    : /facebook\.com|fb\.com|fb\.me/i.test(facebook)
      ? `https://${facebook.replace(/^\/+/, '')}`
      : `https://www.facebook.com/${facebook.replace(/^@+/, '').replace(/^\/+/, '')}`
  try {
    const parsed = new URL(asUrl)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    if (!['facebook.com', 'm.facebook.com', 'fb.com', 'fb.me'].includes(host)) {
      return { ok: false }
    }
    return { ok: true, value: parsed.toString() }
  } catch {
    return { ok: false }
  }
}
const defaultServices = [
  { name: 'พบปะพูดคุย', duration: '60 นาที', description: 'ทำความรู้จักและพูดคุยตามขอบเขตที่ตกลง', add: 0 },
  { name: 'ดื่มสังสรรค์', duration: '90 นาที', description: 'เป็นเพื่อนดื่มหรือสังสรรค์ตามร้านที่ตกลง', add: 200 },
  { name: 'ร่วมกิจกรรม', duration: '90 นาที', description: 'ร่วมกิจกรรมสั้นๆ ตามแผนที่ตกลง', add: 300 },
  { name: 'งานอีเวนต์', duration: '180 นาที', description: 'ร่วมงานเลี้ยงหรืออีเวนต์ตามนัด', add: 500 },
  { name: 'ไลฟ์สไตล์', duration: '120 นาที', description: 'ถ่ายรูป คอนเทนต์ หรือไลฟ์สไตล์ตามตกลง', add: 400 },
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

const isLocalApp = /localhost|127\.0\.0\.1/i.test(APP_URL)

async function issueVerification(user) {
  const token = randomBytes(32).toString('hex')
  const link = `${APP_URL}/api/verify-email?token=${token}`
  // บันทึกโทเคนก่อนส่งเมล เพื่อให้ยืนยันด้วยลิงก์ได้แม้ SMTP พลาด
  await pool.query(
    'UPDATE users SET email_verify_token_hash = $2, email_verify_sent_at = now() WHERE id = $1',
    [user.id, sha256(token)])
  console.log(`[mail] ลิงก์ยืนยันของ ${user.email}: ${link}`)
  try {
    const sent = await sendVerificationEmail({ to: user.email, name: user.name, link })
    return { sent, link, to: user.email }
  } catch (error) {
    console.error(`[mail] ส่งยืนยันถึง ${user.email} ไม่สำเร็จ:`, error.code || '', error.response || error.message)
    // ไม่ให้สมัคร/ยืนยันค้างจน Nginx 504 เมื่อ SMTP ถูกบล็อกหรือล้มเหลว
    return { sent: false, link, to: user.email, mailError: error.message }
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
  SELECT p.id, p.name, p.age, p.height_cm, p.weight_kg, p.measurements, p.province, p.area, p.gender,
    p.line, p.facebook, p.price, p.initials, p.visual, p.category, p.description, p.tags, p.venue, p.modes,
    p.services, p.active, p.membership_active, p.membership_expires_at,
    COALESCE((
      SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'type', m.type, 'url', '/uploads/' || m.file) ORDER BY m.id)
      FROM media m WHERE m.provider_id = p.id), '[]') AS media,
    COALESCE((SELECT COUNT(*)::int FROM reviews r WHERE r.provider_id = p.id), 0) AS review_count,
    (
      SELECT ROUND(AVG((r.service_rating + r.value_rating) / 2.0)::numeric, 2)
      FROM reviews r WHERE r.provider_id = p.id
    ) AS rating_avg
  FROM providers p`

function toProvider(row) {
  const services = Array.isArray(row.services) && row.services.length
    ? row.services
    : defaultServices.map(({ add, ...service }) => ({ ...service, price: Number(row.price) + add }))
  const reviewCount = Number(row.review_count) || 0
  const rating = row.rating_avg != null ? String(row.rating_avg) : 'ใหม่'
  return {
    id: row.id, name: row.name, age: row.age, heightCm: row.height_cm, weightKg: row.weight_kg,
    measurements: row.measurements, province: row.province, area: row.area, gender: row.gender,
    line: row.line, facebook: row.facebook || '', price: row.price, rating, reviews: reviewCount, initials: row.initials,
    visual: row.visual, category: row.category, description: row.description, tags: row.tags, venue: row.venue,
    modes: row.modes, services, active: row.active, membershipActive: row.membership_active,
    membershipExpiresAt: row.membership_expires_at || null, media: row.media,
  }
}

function isMembershipCurrent(row) {
  if (!row.active || !row.membership_active) return false
  if (!row.membership_expires_at) return true
  return new Date(row.membership_expires_at).getTime() > Date.now()
}

function parseExpiresAt(value) {
  if (value === null || value === '') return { ok: true, value: null }
  if (value === undefined) return { ok: true, value: undefined }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { ok: false }
  return { ok: true, value: date.toISOString() }
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
    email: row.email || '',
    emailVerified: row.email_verified_at != null ? Boolean(row.email_verified_at) : null,
    profilePhotoUrl: row.profile_photo_url || '',
    hasProfilePhoto: Boolean(row.has_profile_photo),
  }
}

// ---------- auth ----------
app.post('/api/login', wrap(async (req, res) => {
  const email = text(req.body.email, 200).toLowerCase()
  const password = String(req.body.password ?? '')
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [email])
  const user = rows[0]
  const valid = user && await verifyPassword(password, user.password_hash)
  if (!valid) return fail(res, 401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  await startSession(res, user.id)
  res.json({ user: await publicUser(user) })
}))

app.post('/api/register', wrap(async (req, res) => {
  const role = req.body.role
  if (role === 'admin') return fail(res, 403, 'ไม่สามารถสมัครเป็นผู้ดูแลได้')
  if (!['buyer', 'seller'].includes(role)) return fail(res, 400, 'ประเภทสมาชิกไม่ถูกต้อง')
  const name = text(req.body.name, 100)
  const email = text(req.body.email, 200).toLowerCase()
  const password = String(req.body.password ?? '')
  const reservedAdminEmail = String(process.env.ADMIN_EMAIL || 'admin@nuania.app').trim().toLowerCase()
  if (email === reservedAdminEmail) return fail(res, 403, 'อีเมลนี้สงวนไว้สำหรับผู้ดูแล')
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'กรุณากรอกชื่อและอีเมลให้ถูกต้อง')
  if (password.length < 6) return fail(res, 400, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')

  let sellerProfile = null
  if (role === 'seller') {
    const province = text(req.body.province, 100)
    const description = text(req.body.service, 1000)
    const price = Math.max(0, Math.min(1000000, Number(req.body.price) || 0))
    const age = Number(req.body.age)
    const weightKg = Number(req.body.weightKg)
    const measurements = text(req.body.measurements, 80)
    const line = normalizeLineId(req.body.line)
    const facebookResult = normalizeFacebookUrl(req.body.facebook)
    if (!province || !description) return fail(res, 400, 'กรุณากรอกจังหวัดและรายละเอียดบริการ')
    if (!Number.isInteger(age) || age < 18 || age > 100) return fail(res, 400, 'กรุณากรอกอายุระหว่าง 18–100 ปี')
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) return fail(res, 400, 'กรุณากรอกน้ำหนักระหว่าง 30–250 กก.')
    if (!measurements) return fail(res, 400, 'กรุณากรอกสัดส่วน')
    if (!facebookResult.ok) return fail(res, 400, 'กรุณากรอกลิงก์ Facebook ให้ถูกต้อง')
    if (!line && !facebookResult.value) return fail(res, 400, 'กรุณากรอก LINE หรือ Facebook อย่างน้อย 1 ช่อง')
    sellerProfile = {
      province, description, price, age, weightKg: Math.round(weightKg),
      measurements, line: line || '', facebook: facebookResult.value || '',
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let providerId = null
    if (sellerProfile) {
      const created = await client.query(
        `INSERT INTO providers (
           name, age, province, area, gender, line, facebook, price, initials, description,
           venue, modes, tags, active, weight_kg, measurements
         ) VALUES ($1,$2,$3,$3,'ไม่ประสงค์ระบุ',$4,$5,$6,$7,$8,'','{ที่ร้าน}','{ผู้ให้บริการใหม่}',FALSE,$9,$10)
         RETURNING id`,
        [
          name, sellerProfile.age, sellerProfile.province, sellerProfile.line, sellerProfile.facebook,
          sellerProfile.price, name.slice(0, 1), sellerProfile.description, sellerProfile.weightKg,
          sellerProfile.measurements,
        ])
      providerId = created.rows[0].id
      await populateMockProviderDetails(client, providerId)
      await client.query(
        'INSERT INTO applications (provider_id, name, line, province, gender, service) VALUES ($1,$2,$3,$4,$5,$6)',
        [providerId, name, sellerProfile.line, sellerProfile.province, 'ไม่ประสงค์ระบุ', sellerProfile.description])
    }
    const created = await client.query(
      'INSERT INTO users (name, email, phone, password_hash, role, provider_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, email, '', await hashPassword(password), role, providerId])
    await client.query('COMMIT')
    try {
      await issueVerification(created.rows[0])
    } catch {
      // บัญชีสร้างแล้ว แต่ส่งเมลไม่สำเร็จ — ให้ผู้ใช้กดส่งใหม่จากแบนเนอร์ได้
      console.error(`[mail] สมัครสำเร็จแต่ส่งเมลยืนยันไม่ถึง ${created.rows[0].email}`)
    }
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

function readVerifyToken(value) {
  const raw = String(Array.isArray(value) ? value[0] : value ?? '').trim()
  return (raw.match(/[0-9a-f]{64}/i) || [])[0]?.toLowerCase() || ''
}

async function applyEmailVerification(token) {
  if (!token) return { ok: false, reason: 'invalid' }
  const { rows } = await pool.query(
    `UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()), email_verify_token_hash = NULL
     WHERE email_verify_token_hash = $1 AND created_at > now() - interval '3 days' RETURNING id`,
    [sha256(token)])
  if (!rows.length) return { ok: false, reason: 'expired' }
  return { ok: true, userId: rows[0].id }
}

app.get('/api/verify-email', wrap(async (req, res) => {
  res.type('html')
  const result = await applyEmailVerification(readVerifyToken(req.query.token))
  if (!result.ok && result.reason === 'invalid') {
    return res.status(400).send(verifyPage(false, 'ลิงก์ไม่ถูกต้อง', 'ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว กรุณากดส่งลิงก์ใหม่จากหน้าเว็บ'))
  }
  if (!result.ok) {
    return res.status(400).send(verifyPage(false, 'ลิงก์หมดอายุหรือใช้ไปแล้ว', 'กรุณาเข้าสู่ระบบแล้วกดขอส่งลิงก์ยืนยันใหม่อีกครั้ง'))
  }
  res.send(verifyPage(true, 'คุณยืนยันอีเมลแล้ว', 'ขอบคุณที่ยืนยันอีเมล บัญชีของคุณพร้อมใช้งานเต็มรูปแบบแล้ว'))
}))

app.post('/api/verify-email', wrap(async (req, res) => {
  const result = await applyEmailVerification(readVerifyToken(req.body?.token))
  if (!result.ok && result.reason === 'invalid') return fail(res, 400, 'ลิงก์ไม่ถูกต้อง')
  if (!result.ok) return fail(res, 400, 'ลิงก์หมดอายุหรือใช้ไปแล้ว')
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [result.userId])
  res.json({ ok: true, user: rows[0] ? await publicUser(rows[0]) : null })
}))

app.post('/api/resend-verification', wrap(async (req, res) => {
  if (!req.user) return fail(res, 401, 'กรุณาเข้าสู่ระบบ')
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
  const user = rows[0]
  if (user.email_verified_at) return res.json({ ok: true, alreadyVerified: true })
  if (user.email_verify_sent_at && Date.now() - new Date(user.email_verify_sent_at).getTime() < 60000) {
    return fail(res, 429, 'ส่งอีเมลบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่')
  }
  try {
    const result = await issueVerification(user)
    if (!result.sent) {
      const detail = result.mailError || ''
      const hint = /Invalid login|EAUTH|535/i.test(detail)
        ? 'รหัส SMTP ไม่ถูกต้อง — ตรวจ SMTP_USER / SMTP_PASS ใน .env'
        : /ETIMEDOUT|ECONNREFUSED|ESOCKET/i.test(detail)
          ? 'ต่อ SMTP ไม่ได้ — ตั้ง SMTP_PORT=2525 (เซิร์ฟเวอร์อนุญาตแค่พอร์ตนี้)'
          : detail
            ? `ส่งอีเมลไม่สำเร็จ: ${detail}`
            : 'ยังไม่ได้ตั้งค่า SMTP พอร์ต 2525 ใน .env'
      return fail(res, 503, hint)
    }
    res.json({
      ok: true,
      to: result.to,
      sent: true,
      // ตอนรัน local โชว์ลิงก์บนหน้าเว็บด้วย เพราะ Gmail มักกรองเมลที่มีลิงก์ localhost
      verifyLink: isLocalApp ? result.link : undefined,
    })
  } catch (error) {
    console.error('[mail] resend failed:', error.code || '', error.response || error.message)
    const detail = error.response || error.message || ''
    const hint = /Invalid login|EAUTH|535/i.test(detail)
      ? 'รหัส SMTP ไม่ถูกต้อง — ตรวจ SMTP_USER / SMTP_PASS ใน .env'
      : /ETIMEDOUT|ECONNREFUSED|ESOCKET/i.test(detail)
        ? 'ต่อ SMTP ไม่ได้ — ตั้ง SMTP_PORT=2525 (เซิร์ฟเวอร์อนุญาตแค่พอร์ตนี้)'
        : `ส่งอีเมลไม่สำเร็จ: ${detail || 'ตรวจ SMTP ใน .env แล้วรีสตาร์ทเซิร์ฟเวอร์'}`
    return fail(res, 502, hint)
  }
}))

// ---------- providers ----------
app.get('/api/providers', wrap(async (req, res) => {
  const isAdmin = req.user?.role === 'admin'
  const { rows } = await pool.query(
    `${providerSql} WHERE (
       $1
       OR (
         p.active AND p.membership_active
         AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
       )
       OR p.id = $2
     ) ORDER BY p.id`,
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
  let line = null
  if (req.body.line !== undefined) {
    if (typeof req.body.line !== 'string') return fail(res, 400, 'LINE ID ไม่ถูกต้อง')
    line = normalizeLineId(req.body.line)
  }
  let facebook = null
  if (req.body.facebook !== undefined) {
    if (typeof req.body.facebook !== 'string') return fail(res, 400, 'ลิงก์ Facebook ไม่ถูกต้อง')
    const facebookResult = normalizeFacebookUrl(req.body.facebook)
    if (!facebookResult.ok) return fail(res, 400, 'กรุณาใส่ลิงก์ Facebook ที่ถูกต้อง')
    facebook = facebookResult.value
  }
  const { rows } = await pool.query(
    `UPDATE providers SET
       name = COALESCE($2, name), price = COALESCE($3, price), description = COALESCE($4, description),
       venue = COALESCE($5, venue), province = COALESCE($6, province), modes = COALESCE($7, modes),
       services = COALESCE($8, services), age = COALESCE($9, age), height_cm = COALESCE($10, height_cm),
       weight_kg = COALESCE($11, weight_kg), measurements = COALESCE($12, measurements),
       line = COALESCE($13, line), facebook = COALESCE($14, facebook)
     WHERE id = $1 RETURNING id`,
    [id, req.body.name === undefined ? null : text(req.body.name, 100) || null,
      Number.isFinite(Number(req.body.price)) && req.body.price !== '' && req.body.price != null
        ? Math.max(0, Math.min(1000000, Number(req.body.price))) : null,
      req.body.description === undefined ? null
        : typeof req.body.description === 'string' ? req.body.description.slice(0, 1000) : '',
      req.body.venue === undefined ? null : text(req.body.venue, 200),
      req.body.province === undefined ? null : text(req.body.province, 100), modes,
      services === null ? null : JSON.stringify(services), age, heightCm, weightKg, measurements,
      line, facebook])
  if (!rows[0]) return fail(res, 404, 'ไม่พบโปรไฟล์')
  const result = await pool.query(`${providerSql} WHERE p.id = $1`, [id])
  res.json(toProvider(result.rows[0]))
}))

app.patch('/api/admin/providers/:id', requirePermission('provider:suspend'), wrap(async (req, res) => {
  const { active, membershipActive } = req.body
  const expires = Object.hasOwn(req.body, 'membershipExpiresAt')
    ? parseExpiresAt(req.body.membershipExpiresAt)
    : { ok: true, value: undefined }
  if (!expires.ok) return fail(res, 400, 'วันหมดอายุสมาชิกไม่ถูกต้อง')
  const { rows } = await pool.query(
    `UPDATE providers SET
       active = COALESCE($2, active),
       membership_active = COALESCE($3, membership_active),
       membership_expires_at = CASE
         WHEN $4::boolean THEN $5::timestamptz
         ELSE membership_expires_at
       END
     WHERE id = $1 RETURNING id`,
    [
      Number(req.params.id),
      typeof active === 'boolean' ? active : null,
      typeof membershipActive === 'boolean' ? membershipActive : null,
      expires.value !== undefined,
      expires.value === undefined ? null : expires.value,
    ])
  if (!rows[0]) return fail(res, 404, 'ไม่พบโปรไฟล์')
  const result = await pool.query(`${providerSql} WHERE p.id = $1`, [rows[0].id])
  res.json(toProvider(result.rows[0]))
}))

async function collectProviderFiles(db, providerId) {
  const { rows } = await db.query('SELECT file FROM media WHERE provider_id = $1', [providerId])
  const { rows: reviewFiles } = await db.query(
    `SELECT rm.file FROM review_media rm
     JOIN reviews r ON r.id = rm.review_id
     WHERE r.provider_id = $1`, [providerId])
  return [...rows, ...reviewFiles].map((row) => row.file)
}

async function unlinkUploadFiles(files) {
  for (const file of files) {
    await unlink(path.join(uploadDir, file)).catch(() => {})
  }
}

app.delete('/api/admin/users/:id', requirePermission('user:delete'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isSafeInteger(id) || id <= 0) return fail(res, 400, 'รหัสบัญชีไม่ถูกต้อง')
  if (req.user.id === id) return fail(res, 400, 'ไม่สามารถลบบัญชีของตนเองได้')

  const client = await pool.connect()
  let files = []
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `SELECT id, role, provider_id, name, email FROM users WHERE id = $1 FOR UPDATE`, [id])
    const user = rows[0]
    if (!user) {
      await client.query('ROLLBACK')
      return fail(res, 404, 'ไม่พบบัญชี')
    }
    if (!['buyer', 'seller'].includes(user.role)) {
      await client.query('ROLLBACK')
      return fail(res, 400, 'ลบได้เฉพาะบัญชีนักท่องเที่ยวหรือผู้ขาย')
    }

    const providerId = user.provider_id
    if (providerId) files = await collectProviderFiles(client, providerId)
    await client.query('DELETE FROM users WHERE id = $1', [id])
    if (providerId) await client.query('DELETE FROM providers WHERE id = $1', [providerId])
    await client.query('COMMIT')
    await unlinkUploadFiles(files)
    res.json({ ok: true, id: user.id, role: user.role, name: user.name, email: user.email, providerId })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}))

app.delete('/api/admin/providers/:id', requirePermission('user:delete'), wrap(async (req, res) => {
  const providerId = Number(req.params.id)
  if (!Number.isSafeInteger(providerId) || providerId <= 0) return fail(res, 400, 'รหัสผู้ขายไม่ถูกต้อง')

  const client = await pool.connect()
  let files = []
  try {
    await client.query('BEGIN')
    const { rows: providerRows } = await client.query(
      'SELECT id, name FROM providers WHERE id = $1 FOR UPDATE', [providerId])
    if (!providerRows[0]) {
      await client.query('ROLLBACK')
      return fail(res, 404, 'ไม่พบผู้ขาย')
    }

    files = await collectProviderFiles(client, providerId)
    const { rows: sellerRows } = await client.query(
      `DELETE FROM users WHERE provider_id = $1 AND role = 'seller' RETURNING id, name, email`, [providerId])
    await client.query('DELETE FROM providers WHERE id = $1', [providerId])
    await client.query('COMMIT')
    await unlinkUploadFiles(files)
    res.json({
      ok: true,
      providerId,
      name: providerRows[0].name,
      deletedUsers: sellerRows.map((row) => ({ id: row.id, name: row.name, email: row.email })),
    })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
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
    comment: row.comment, createdAt: row.created_at, media: row.media,
  }))
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
    `SELECT u.id, u.name, u.email, u.phone, u.created_at, u.email_verified_at,
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
    emailVerified: Boolean(row.email_verified_at),
  })))
}))

app.get('/api/admin/travelers/:id', requirePermission('user:view'), wrap(async (req, res) => {
  const travelerId = Number(req.params.id)
  if (!Number.isSafeInteger(travelerId) || travelerId <= 0) return fail(res, 400, 'รหัสนักท่องเที่ยวไม่ถูกต้อง')
  const { rows: travelerRows } = await pool.query(
    `SELECT id, name, email, phone, created_at, email_verified_at
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
      createdAt: traveler.created_at, emailVerified: Boolean(traveler.email_verified_at),
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

app.post('/api/bookings', requirePermission('booking:create'), wrap(async (_req, res) => {
  return fail(res, 410, 'ระบบนี้ไม่รองรับการนัดหมายผ่านเว็บ กรุณาติดต่อผู้ให้บริการโดยตรงผ่าน LINE หรือ Facebook')
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

// ---------- seek posts ----------
const seekCommentDetailSql = `
  SELECT sc.*, u.name AS author_name,
    p.name AS provider_name, p.line AS provider_line, p.facebook AS provider_facebook,
    p.province AS provider_province, p.initials AS provider_initials,
    (
      SELECT '/uploads/' || m.file FROM media m
      WHERE m.provider_id = sc.provider_id AND m.type = 'image'
      ORDER BY m.id ASC LIMIT 1
    ) AS provider_photo_url
  FROM seek_comments sc
  JOIN users u ON u.id = sc.user_id
  LEFT JOIN providers p ON p.id = sc.provider_id`

function toSeekComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    canEdit: Boolean(row.can_edit),
    author: {
      id: row.user_id,
      name: row.author_name || 'ผู้ให้บริการ',
      providerId: row.provider_id || null,
      providerName: row.provider_name || '',
      line: row.provider_line || '',
      facebook: row.provider_facebook || '',
      province: row.provider_province || '',
      initials: row.provider_initials || (row.author_name || 'ผ').slice(0, 1),
      photoUrl: row.provider_photo_url || '',
    },
  }
}

function toSeekPost(row, comments = undefined) {
  const post = {
    id: row.id,
    title: row.title,
    province: row.province,
    venue: row.venue || '',
    budget: row.budget,
    duration: row.duration || '',
    description: row.description || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
    commentCount: Number(row.comment_count) || 0,
    author: {
      id: row.user_id,
      name: row.author_name || 'นักท่องเที่ยว',
    },
    isOwner: Boolean(row.is_owner),
  }
  if (comments !== undefined) post.comments = comments
  return post
}

const seekPostListSql = `
  SELECT sp.*, u.name AS author_name,
    COALESCE((SELECT COUNT(*)::int FROM seek_comments sc WHERE sc.post_id = sp.id), 0) AS comment_count
  FROM seek_posts sp
  JOIN users u ON u.id = sp.user_id`

app.get('/api/seek-posts', requirePermission('seek:view'), wrap(async (req, res) => {
  const mine = String(req.query.mine || '') === '1'
  const status = text(req.query.status, 20)
  const province = text(req.query.province, 100)
  const clauses = []
  const params = []
  if (mine) {
    if (!req.user.permissions.includes('seek:manage:own') && req.user.role !== 'admin') {
      return fail(res, 403, 'ไม่มีสิทธิ์ดูโพสของตัวเอง')
    }
    params.push(req.user.id)
    clauses.push(`sp.user_id = $${params.length}`)
  } else if (req.user.role !== 'admin') {
    clauses.push(`sp.status = 'open'`)
  }
  if (status === 'open' || status === 'closed') {
    params.push(status)
    clauses.push(`sp.status = $${params.length}`)
  }
  if (province) {
    params.push(province)
    clauses.push(`sp.province = $${params.length}`)
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const { rows } = await pool.query(
    `${seekPostListSql} ${where} ORDER BY sp.created_at DESC LIMIT 100`,
    params,
  )
  res.json(rows.map((row) => toSeekPost({ ...row, is_owner: row.user_id === req.user.id })))
}))

app.get('/api/seek-posts/:id', requirePermission('seek:view'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  const { rows } = await pool.query(`${seekPostListSql} WHERE sp.id = $1`, [id])
  if (!rows.length) return fail(res, 404, 'ไม่พบโพส')
  const row = rows[0]
  const isOwner = row.user_id === req.user.id || req.user.role === 'admin'
  if (row.status !== 'open' && !isOwner) return fail(res, 404, 'โพสนี้ปิดรับแล้ว')
  const { rows: commentRows } = await pool.query(
    `${seekCommentDetailSql}
     WHERE sc.post_id = $1
     ORDER BY sc.created_at ASC`,
    [id],
  )
  const comments = commentRows.map((comment) => toSeekComment({
    ...comment,
    can_edit: comment.user_id === req.user.id || req.user.role === 'admin',
  }))
  res.json(toSeekPost({ ...row, is_owner: isOwner }, comments))
}))

app.get('/api/seek-posts/:id/stream', requirePermission('seek:view'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 400, 'โพสไม่ถูกต้อง')
  const { rows } = await pool.query('SELECT id, user_id, status FROM seek_posts WHERE id = $1', [id])
  if (!rows.length) return fail(res, 404, 'ไม่พบโพส')
  const isOwner = rows[0].user_id === req.user.id || req.user.role === 'admin'
  if (rows[0].status !== 'open' && !isOwner) return fail(res, 404, 'โพสนี้ปิดรับแล้ว')

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  if (typeof res.flushHeaders === 'function') res.flushHeaders()

  const channel = `post:${id}`
  const send = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  send('ready', { postId: id })
  const onEvent = (payload) => send('seek', payload)
  seekRealtime.on(channel, onEvent)
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n')
  }, 15000)
  req.on('close', () => {
    clearInterval(heartbeat)
    seekRealtime.off(channel, onEvent)
  })
}))

app.post('/api/seek-posts', requirePermission('seek:create'), wrap(async (req, res) => {
  const title = text(req.body.title, 120)
  const province = text(req.body.province, 100)
  const venue = text(req.body.venue, 120)
  const budget = text(req.body.budget, 80)
  const duration = text(req.body.duration, 80)
  const description = text(req.body.description, 1000)
  if (!title) return fail(res, 400, 'กรุณาระบุหัวข้อโพส')
  if (!province) return fail(res, 400, 'กรุณาเลือกจังหวัด')
  if (!venue) return fail(res, 400, 'กรุณาระบุร้าน')
  if (!budget) return fail(res, 400, 'กรุณาระบุงบประมาณ')
  if (!duration) return fail(res, 400, 'กรุณาระบุระยะเวลา')
  const { rows } = await pool.query(
    `INSERT INTO seek_posts (user_id, title, province, venue, budget, duration, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.id, title, province, venue, budget, duration, description],
  )
  const created = rows[0]
  publishSeekEvent(created.id, 'post:created')
  res.status(201).json(toSeekPost({
    ...created,
    author_name: req.user.name,
    comment_count: 0,
    is_owner: true,
  }, []))
}))

app.patch('/api/seek-posts/:id', requirePermission('seek:manage:own'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  const { rows } = await pool.query('SELECT * FROM seek_posts WHERE id = $1', [id])
  if (!rows.length) return fail(res, 404, 'ไม่พบโพส')
  const post = rows[0]
  if (post.user_id !== req.user.id && req.user.role !== 'admin') return fail(res, 403, 'แก้ไขได้เฉพาะโพสของตัวเอง')
  if (post.status === 'closed' && req.body.status !== 'open') return fail(res, 400, 'โพสนี้ปิดรับแล้ว')
  const title = req.body.title !== undefined ? text(req.body.title, 120) : post.title
  const province = req.body.province !== undefined ? text(req.body.province, 100) : post.province
  const venue = req.body.venue !== undefined ? text(req.body.venue, 120) : (post.venue || '')
  const budget = req.body.budget !== undefined ? text(req.body.budget, 80) : post.budget
  const duration = req.body.duration !== undefined ? text(req.body.duration, 80) : (post.duration || '')
  const description = req.body.description !== undefined ? text(req.body.description, 1000) : (post.description || '')
  if (!title || !province || !venue || !budget || !duration) {
    return fail(res, 400, 'กรุณากรอกหัวข้อ จังหวัด ร้าน งบประมาณ และระยะเวลาให้ครบ')
  }
  const { rows: updated } = await pool.query(
    `UPDATE seek_posts
     SET title = $2, province = $3, venue = $4, budget = $5, duration = $6, description = $7, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, title, province, venue, budget, duration, description],
  )
  res.json(toSeekPost({
    ...updated[0],
    author_name: req.user.name,
    comment_count: 0,
    is_owner: true,
  }))
}))

app.post('/api/seek-posts/:id/close', requirePermission('seek:manage:own'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  const { rows } = await pool.query(
    `UPDATE seek_posts
     SET status = 'closed', closed_at = now(), updated_at = now()
     WHERE id = $1 AND user_id = $2 AND status = 'open'
     RETURNING *`,
    [id, req.user.id],
  )
  if (!rows.length && req.user.role === 'admin') {
    const adminClose = await pool.query(
      `UPDATE seek_posts
       SET status = 'closed', closed_at = now(), updated_at = now()
       WHERE id = $1 AND status = 'open' RETURNING *`,
      [id],
    )
    if (!adminClose.rows.length) return fail(res, 404, 'ไม่พบโพสที่เปิดรับอยู่')
    publishSeekEvent(id, 'post:closed')
    return res.json(toSeekPost({ ...adminClose.rows[0], author_name: '', comment_count: 0, is_owner: true }))
  }
  if (!rows.length) return fail(res, 404, 'ไม่พบโพสที่เปิดรับอยู่')
  publishSeekEvent(id, 'post:closed')
  res.json(toSeekPost({ ...rows[0], author_name: req.user.name, comment_count: 0, is_owner: true }))
}))

app.post('/api/seek-posts/:id/comments', requirePermission('seek:comment'), wrap(async (req, res) => {
  const id = Number(req.params.id)
  const body = text(req.body.body, 1000)
  if (!body || body.length < 2) return fail(res, 400, 'กรุณากรอกข้อความคอมเมนต์')
  const { rows: posts } = await pool.query('SELECT * FROM seek_posts WHERE id = $1', [id])
  if (!posts.length) return fail(res, 404, 'ไม่พบโพส')
  if (posts[0].status !== 'open') return fail(res, 400, 'โพสนี้ปิดรับแล้ว ไม่สามารถคอมเมนต์ได้')
  if (!req.user.providerId) return fail(res, 403, 'บัญชีผู้ให้บริการเท่านั้นที่คอมเมนต์ได้')
  const { rows } = await pool.query(
    `INSERT INTO seek_comments (post_id, user_id, provider_id, body)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, req.user.id, req.user.providerId, body],
  )
  const { rows: detail } = await pool.query(
    `${seekCommentDetailSql} WHERE sc.id = $1`,
    [rows[0].id],
  )
  const comment = toSeekComment({ ...detail[0], can_edit: true })
  publishSeekEvent(id, 'comment:created', { commentId: comment.id })
  res.status(201).json(comment)
}))

app.patch('/api/seek-comments/:id', wrap(async (req, res) => {
  if (!req.user) return fail(res, 401, 'กรุณาเข้าสู่ระบบ')
  const id = Number(req.params.id)
  const body = text(req.body.body, 1000)
  if (!body || body.length < 2) return fail(res, 400, 'กรุณากรอกข้อความคอมเมนต์')
  const { rows } = await pool.query('SELECT * FROM seek_comments WHERE id = $1', [id])
  if (!rows.length) return fail(res, 404, 'ไม่พบคอมเมนต์')
  if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') return fail(res, 403, 'แก้ไขได้เฉพาะคอมเมนต์ของตัวเอง')
  const { rows: postRows } = await pool.query('SELECT status FROM seek_posts WHERE id = $1', [rows[0].post_id])
  if (!postRows.length || postRows[0].status !== 'open') return fail(res, 400, 'โพสนี้ปิดรับแล้ว')
  const updated = await pool.query(
    `UPDATE seek_comments SET body = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, body],
  )
  const { rows: detail } = await pool.query(
    `${seekCommentDetailSql} WHERE sc.id = $1`,
    [updated.rows[0].id],
  )
  const comment = toSeekComment({ ...detail[0], can_edit: true })
  publishSeekEvent(rows[0].post_id, 'comment:updated', { commentId: comment.id })
  res.json(comment)
}))

app.delete('/api/seek-comments/:id', wrap(async (req, res) => {
  if (!req.user) return fail(res, 401, 'กรุณาเข้าสู่ระบบ')
  const id = Number(req.params.id)
  const { rows } = await pool.query('SELECT * FROM seek_comments WHERE id = $1', [id])
  if (!rows.length) return fail(res, 404, 'ไม่พบคอมเมนต์')
  if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') return fail(res, 403, 'ลบได้เฉพาะคอมเมนต์ของตัวเอง')
  const postId = rows[0].post_id
  await pool.query('DELETE FROM seek_comments WHERE id = $1', [id])
  publishSeekEvent(postId, 'comment:deleted', { commentId: id })
  res.json({ ok: true })
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
  const { rows } = await pool.query(
    `SELECT a.*, u.email, u.email_verified_at,
       (
         SELECT '/uploads/' || m.file FROM media m
         WHERE m.provider_id = a.provider_id AND m.type = 'image'
         ORDER BY m.id ASC LIMIT 1
       ) AS profile_photo_url,
       EXISTS (
         SELECT 1 FROM media m
         WHERE m.provider_id = a.provider_id AND m.type = 'image'
       ) AS has_profile_photo
     FROM applications a
     LEFT JOIN users u ON u.provider_id = a.provider_id AND u.role = 'seller'
     WHERE a.status = 'รอตรวจสอบ'
     ORDER BY a.id`)
  res.json(rows.map(toApplication))
}))

app.post('/api/applications/:id/approve', requirePermission('provider:approve'), wrap(async (req, res) => {
  const expires = parseExpiresAt(req.body.membershipExpiresAt)
  if (!expires.ok) return fail(res, 400, 'กรุณาระบุวันหมดอายุสมาชิกให้ถูกต้อง')
  if (!expires.value) return fail(res, 400, 'กรุณาระบุวันและเวลาหมดอายุสมาชิกก่อนอนุมัติ')
  const { rows: pending } = await pool.query(
    `SELECT * FROM applications WHERE id = $1 AND status = 'รอตรวจสอบ'`, [Number(req.params.id)])
  const item = pending[0]
  if (!item) return fail(res, 404, 'ไม่พบใบสมัคร')
  if (!item.provider_id) {
    return fail(res, 400, 'ใบสมัครนี้ยังไม่มีโปรไฟล์/รูปภาพ — ต้องสมัครเป็นผู้ให้บริการพร้อมอัปโหลดรูปก่อน')
  }
  const { rows: photoRows } = await pool.query(
    `SELECT 1 FROM media WHERE provider_id = $1 AND type = 'image' LIMIT 1`, [item.provider_id])
  if (!photoRows[0]) {
    return fail(res, 400, 'ยังไม่มีรูปโปรไฟล์ — ต้องให้ผู้สมัครอัปโหลดอย่างน้อย 1 รูปก่อนอนุมัติ')
  }
  const { rows } = await pool.query(
    `UPDATE applications SET status = 'อนุมัติแล้ว' WHERE id = $1 AND status = 'รอตรวจสอบ' RETURNING *`, [item.id])
  if (!rows[0]) return fail(res, 404, 'ไม่พบใบสมัคร')
  await pool.query(
    `UPDATE providers SET active = TRUE, membership_active = TRUE, membership_expires_at = $2 WHERE id = $1`,
    [item.provider_id, expires.value])
  res.json({ ok: true, membershipExpiresAt: expires.value })
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
app.listen(port, () => {
  console.log(`API ready on http://localhost:${port}`)
  console.log(`[mail] ช่องทางส่งเมล: ${describeMailSetup()}`)
})
