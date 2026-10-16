import express from 'express'
import { randomBytes } from 'node:crypto'
import { mkdirSync, existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { hashPassword, initDb, pool, verifyPassword } from './db.js'

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
  }
}

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
  return {
    id: row.id, name: row.name, age: row.age, province: row.province, area: row.area, gender: row.gender,
    line: row.line, price: row.price, rating: row.rating, reviews: row.reviews, initials: row.initials,
    visual: row.visual, category: row.category, description: row.description, tags: row.tags, venue: row.venue,
    modes: row.modes, active: row.active, membershipActive: row.membership_active, media: row.media,
  }
}

const bookingSql = `
  SELECT b.*, p.name AS provider FROM bookings b JOIN providers p ON p.id = b.provider_id`

function toBooking(row) {
  return {
    id: row.id, providerId: row.provider_id, provider: row.provider, service: row.service, date: row.date,
    time: row.time, mode: row.mode, venue: row.venue, amount: row.amount, status: row.status,
    guestName: row.guest_name, phone: row.phone, note: row.note,
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
      await client.query(
        'INSERT INTO applications (provider_id, name, line, province, gender, service) VALUES ($1,$2,$3,$4,$5,$6)',
        [providerId, name, phone, province, 'ไม่ประสงค์ระบุ', description])
    }
    const created = await client.query(
      'INSERT INTO users (name, email, phone, password_hash, role, provider_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, email, phone, await hashPassword(password), role, providerId])
    await client.query('COMMIT')
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
  const modes = Array.isArray(req.body.modes) ? req.body.modes.filter((m) => ['ที่ร้าน', 'นอกสถานที่'].includes(m)) : null
  const { rows } = await pool.query(
    `UPDATE providers SET
       name = COALESCE($2, name), price = COALESCE($3, price), description = COALESCE($4, description),
       venue = COALESCE($5, venue), province = COALESCE($6, province), modes = COALESCE($7, modes)
     WHERE id = $1 RETURNING id`,
    [id, req.body.name === undefined ? null : text(req.body.name, 100) || null,
      Number.isFinite(Number(req.body.price)) && req.body.price !== '' && req.body.price != null
        ? Math.max(0, Math.min(1000000, Number(req.body.price))) : null,
      req.body.description === undefined ? null : text(req.body.description, 1000),
      req.body.venue === undefined ? null : text(req.body.venue, 200),
      req.body.province === undefined ? null : text(req.body.province, 100), modes])
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

app.post('/api/bookings', requirePermission('booking:create'), wrap(async (req, res) => {
  const { rows: found } = await pool.query(
    'SELECT * FROM providers WHERE id = $1 AND active AND membership_active', [Number(req.body.providerId)])
  const provider = found[0]
  if (!provider) return fail(res, 404, 'ไม่พบผู้ให้บริการ')
  const mode = provider.modes.includes(req.body.mode) ? req.body.mode : provider.modes[0]
  const extras = { 'พบปะพูดคุย': ['60 นาที', 0], 'ร่วมกิจกรรม': ['90 นาที', 300], 'งานอีเวนต์': ['90 นาที', 500] }
  const serviceName = extras[req.body.service] ? req.body.service : 'พบปะพูดคุย'
  const [duration, add] = extras[serviceName]
  const amount = provider.price + add + (mode === 'นอกสถานที่' ? 250 : 0)
  const reference = `ND-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`
  const { rows } = await pool.query(
    `INSERT INTO bookings (id, provider_id, user_id, service, date, time, mode, venue, amount, guest_name, phone, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [reference, provider.id, req.user.id, `${serviceName} · ${duration}`, text(req.body.date, 20), text(req.body.time, 10), mode,
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
    await pool.query(
      `INSERT INTO providers (name, age, province, area, gender, line, price, initials, category, description, tags, venue, modes, active)
       VALUES ($1,0,$2,$2,$3,$4,1000,$5,'New provider',$6,'{ผู้ให้บริการใหม่,โปรไฟล์ตัวอย่าง}','สถานที่นัดพบตามที่ระบุ','{ที่ร้าน,นอกสถานที่}',TRUE)`,
      [item.name, item.province, item.gender, item.line, item.name.slice(0, 1),
        item.service || 'ผู้ให้บริการอิสระ · กรุณาตกลงรายละเอียดและขอบเขตก่อนนัดหมาย'])
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
app.listen(port, () => console.log(`API ready on http://localhost:${port}`))
