import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import * as seed from './seed.js'

// โหลด .env ก่อนสร้าง pool (import ใน index.js ถูก hoist มาก่อน loadEnvFile)
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')
try { process.loadEnvFile(envPath) } catch { /* ไม่มีไฟล์ .env */ }

const scrypt = promisify(scryptCb)

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/massage',
})

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await scrypt(password, salt, 64)
  return `${salt}:${key.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const key = await scrypt(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return key.length === expected.length && timingSafeEqual(key, expected)
}

const schema = `
CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INT,
  height_cm SMALLINT,
  weight_kg SMALLINT,
  measurements TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  line TEXT NOT NULL DEFAULT '',
  price INT NOT NULL DEFAULT 0,
  rating TEXT NOT NULL DEFAULT 'ใหม่',
  reviews INT NOT NULL DEFAULT 0,
  initials TEXT NOT NULL DEFAULT '',
  visual TEXT NOT NULL DEFAULT 'visual-moss',
  category TEXT NOT NULL DEFAULT 'Independent provider',
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  venue TEXT NOT NULL DEFAULT '',
  modes TEXT[] NOT NULL DEFAULT '{}',
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  membership_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES roles(name),
  provider_id INT REFERENCES providers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  amount INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'รอยืนยัน',
  guest_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, provider_id)
);
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  provider_id INT REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  line TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'รอตรวจสอบ',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_rating SMALLINT NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
  value_rating SMALLINT NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_provider_created_idx ON reviews(provider_id, created_at DESC);
CREATE TABLE IF NOT EXISTS review_media (
  id SERIAL PRIMARY KEY,
  review_id INT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS seek_posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS seek_posts_status_created_idx ON seek_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS seek_posts_user_idx ON seek_posts(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS seek_comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES seek_posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id INT REFERENCES providers(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS seek_comments_post_idx ON seek_comments(post_id, created_at ASC);
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`

export async function initDb() {
  await pool.query(schema)
  await pool.query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS services JSONB NOT NULL DEFAULT '[]'::jsonb")
  await pool.query('ALTER TABLE providers ADD COLUMN IF NOT EXISTS height_cm SMALLINT')
  await pool.query('ALTER TABLE providers ADD COLUMN IF NOT EXISTS weight_kg SMALLINT')
  await pool.query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS measurements TEXT NOT NULL DEFAULT ''")
  await pool.query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS facebook TEXT NOT NULL DEFAULT ''")
  await pool.query("ALTER TABLE seek_posts ADD COLUMN IF NOT EXISTS venue TEXT NOT NULL DEFAULT ''")
  await pool.query("ALTER TABLE seek_posts ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT ''")
  await pool.query("ALTER TABLE seek_posts ALTER COLUMN description SET DEFAULT ''")
  await pool.query('ALTER TABLE providers ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ')
  const { rows: verifyColumn } = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified_at'`)
  if (!verifyColumn.length) {
    await pool.query('ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ')
    await pool.query('UPDATE users SET email_verified_at = now()')
  }
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_token_hash TEXT')
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_sent_at TIMESTAMPTZ')
  await pool.query('CREATE INDEX IF NOT EXISTS users_verify_token_idx ON users(email_verify_token_hash)')
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_single_admin_idx
    ON users ((true))
    WHERE role = 'admin'
  `)
  await pool.query(`
    CREATE OR REPLACE FUNCTION prevent_extra_admins()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $prevent_admin$
    BEGIN
      IF TG_OP = 'INSERT' AND NEW.role = 'admin' THEN
        IF EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
          RAISE EXCEPTION 'sole admin already exists';
        END IF;
      END IF;
      IF TG_OP = 'UPDATE' THEN
        IF OLD.role IS DISTINCT FROM 'admin' AND NEW.role = 'admin' THEN
          RAISE EXCEPTION 'cannot promote user to admin';
        END IF;
        IF OLD.role = 'admin' AND NEW.role IS DISTINCT FROM 'admin' THEN
          RAISE EXCEPTION 'cannot demote the sole admin';
        END IF;
      END IF;
      RETURN NEW;
    END;
    $prevent_admin$
  `)
  await pool.query('DROP TRIGGER IF EXISTS users_prevent_extra_admins ON users')
  await pool.query(`
    CREATE TRIGGER users_prevent_extra_admins
    BEFORE INSERT OR UPDATE OF role ON users
    FOR EACH ROW
    EXECUTE PROCEDURE prevent_extra_admins()
  `)
  const roles = JSON.parse(readFileSync(new URL('./roles.json', import.meta.url), 'utf8'))
  for (const [name, role] of Object.entries(roles)) {
    await pool.query(
      `INSERT INTO roles (name, label, permissions) VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, permissions = EXCLUDED.permissions`,
      [name, role.label, role.permissions],
    )
  }

  const seedDemo = /^(1|true|yes)$/i.test(String(process.env.SEED_DEMO || '').trim())
  const { rows: providerRows } = await pool.query('SELECT count(*)::int AS n FROM providers')
  const isNewDatabase = providerRows[0].n === 0

  if (isNewDatabase && seedDemo) {
    for (const p of seed.providers) {
      await pool.query(
        `INSERT INTO providers (id, name, age, province, area, gender, line, price, rating, reviews, initials,
           visual, category, description, tags, venue, modes, active, membership_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE,TRUE)`,
        [p.id, p.name, p.age, p.province, p.area, p.gender, p.line, p.price, p.rating, p.reviews, p.initials,
          p.visual, p.category, p.description, p.tags, p.venue, p.modes],
      )
    }
  }

  const { rows: demoSeeded } = await pool.query("SELECT 1 FROM app_settings WHERE key = 'province-demo-providers-v1'")
  if (seedDemo && !demoSeeded.length) {
    const { rows: provinceCounts } = await pool.query(
      `SELECT province, count(*)::int AS count FROM providers
       WHERE active AND membership_active GROUP BY province`,
    )
    const counts = new Map(provinceCounts.map((row) => [row.province, row.count]))

    for (const province of seed.provinces) {
      const missing = Math.max(0, 3 - (counts.get(province) || 0))
      const demoProfiles = seed.provinceDemoProviders.filter((provider) => provider.province === province).slice(0, missing)
      for (const p of demoProfiles) {
        await pool.query(
          `INSERT INTO providers (id, name, age, province, area, gender, line, price, rating, reviews, initials,
             visual, category, description, tags, venue, modes, active, membership_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE,TRUE)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.age, p.province, p.area, p.gender, p.line, p.price, p.rating, p.reviews, p.initials,
            p.visual, p.category, p.description, p.tags, p.venue, p.modes],
        )
      }
    }
    await pool.query(
      `INSERT INTO app_settings (key, value) VALUES ('province-demo-providers-v1', 'complete')
       ON CONFLICT (key) DO NOTHING`,
    )
    await pool.query(
      `SELECT setval(pg_get_serial_sequence('providers', 'id'), (SELECT max(id) FROM providers))`,
    )
  }

  if (isNewDatabase && seedDemo) {
    const ids = {}
    for (const u of seed.users) {
      const res = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, provider_id, email_verified_at) VALUES ($1,$2,$3,$4,$5, now()) RETURNING id',
        [u.name, u.email, await hashPassword(u.password), u.role, u.providerId ?? null],
      )
      ids[u.role] = res.rows[0].id
    }

    for (const b of seed.bookings) {
      await pool.query(
        `INSERT INTO bookings (id, provider_id, user_id, service, date, time, mode, venue, amount, status, guest_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'สมชาย')`,
        [b.id, b.providerId, ids.buyer, b.service, b.date, b.time, b.mode, b.venue, b.amount, b.status],
      )
    }
    await pool.query('INSERT INTO favorites (user_id, provider_id) VALUES ($1, 3)', [ids.buyer])
    for (const review of seed.reviews) {
      await pool.query(
        `INSERT INTO reviews (booking_id, provider_id, user_id, service_rating, value_rating, comment, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (booking_id) DO NOTHING`,
        [review.bookingId, review.providerId, ids.buyer, review.serviceRating, review.valueRating, review.comment, review.createdAt],
      )
    }
  }

  await pool.query(`
    UPDATE providers SET
      age = CASE WHEN age IS NULL OR age < 18 THEN 22 + (id % 13) ELSE age END,
      height_cm = COALESCE(height_cm, 155 + (id % 26)),
      weight_kg = COALESCE(weight_kg, 45 + ((id * 7) % 36)),
      measurements = CASE WHEN measurements = '' THEN
        (30 + (id % 8))::text || '-' || (23 + (id % 7))::text || '-' || (33 + (id % 9))::text
        ELSE measurements END`)

  await pool.query('DROP TABLE IF EXISTS demo_reviews')

  // ลบคำที่บ่งบอกว่าเป็นข้อมูลทดสอบออกจากโปรไฟล์ที่ seed ไว้แล้ว
  await pool.query(`
    UPDATE providers
    SET tags = array_remove(tags, 'โปรไฟล์ตัวอย่าง')
    WHERE 'โปรไฟล์ตัวอย่าง' = ANY(tags)`)
  await pool.query(`
    UPDATE providers
    SET line = regexp_replace(line, '^demo\\.', 'nn.')
    WHERE line LIKE 'demo.%'`)

  // เติมแท็กหมวดใหม่ให้โปรไฟล์เดิมบางส่วน (เพื่อให้ตัวกรองใช้งานได้ทันที)
  await pool.query(`
    UPDATE providers
    SET tags = array_append(tags, 'ดื่มสังสรรค์')
    WHERE active
      AND NOT ('ดื่มสังสรรค์' = ANY(tags))
      AND (
        'พบปะพูดคุย' = ANY(tags)
        OR 'ร่วมกิจกรรม' = ANY(tags)
      )
      AND (id % 3 = 0)`)

  if (seedDemo) {
    await ensureSeedBuyerReviews()
    await seedTravelerReviewsIfNeeded()
    await seedProvinceExtraProvidersIfNeeded()
  }
}

async function ensureSeedBuyerReviews() {
  const { rows: buyers } = await pool.query(
    `SELECT id FROM users WHERE email = 'somchai@example.com' AND role = 'buyer' LIMIT 1`)
  if (!buyers[0]) return
  for (const review of seed.reviews) {
    await pool.query(
      `INSERT INTO reviews (booking_id, provider_id, user_id, service_rating, value_rating, comment, created_at)
       SELECT $1, $2, $3, $4, $5, $6, $7
       WHERE EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.id = $1 AND b.provider_id = $2 AND b.user_id = $3 AND b.status = 'เสร็จสิ้น'
       )
       ON CONFLICT (booking_id) DO NOTHING`,
      [review.bookingId, review.providerId, buyers[0].id, review.serviceRating, review.valueRating, review.comment, review.createdAt],
    )
  }
}

async function seedTravelerReviewsIfNeeded() {
  const { rows: flag } = await pool.query("SELECT 1 FROM app_settings WHERE key = 'traveler-reviews-v1'")
  if (flag.length) return

  const { rows: providers } = await pool.query(
    'SELECT id, venue FROM providers WHERE active AND membership_active ORDER BY id')
  if (!providers.length) return

  const hash = await hashPassword('buyer123')
  const first = ['สมชาย', 'สมหญิง', 'ธนพล', 'กมล', 'วรเชษฐ์', 'ปรีชา', 'นภัส', 'ศุภกร', 'อรุณ', 'พิมพ์ชนก', 'ชยพล', 'ณัฐวุฒิ', 'กานต์', 'พงศกร', 'ธีรภัทร', 'สุรชัย', 'ปวีณา', 'ภูมิ', 'รัตนา', 'อนุชา']
  const last = ['ใจดี', 'รักไทย', 'สุขสวัสดิ์', 'แสงทอง', 'ศรีสุข', 'มั่นคง', 'วงศ์ไทย', 'เพชรรัตน์', 'บุญมา', 'ทองดี', 'จันทร์เพ็ญ', 'พรหมมา', 'สายสุวรรณ', 'คงเจริญ', 'ลิ้มสกุล']
  const services = [
    { label: 'พบปะพูดคุย · 60 นาที', amount: 900 },
    { label: 'ดื่มสังสรรค์ · 90 นาที', amount: 1200 },
    { label: 'ร่วมกิจกรรม · 90 นาที', amount: 1500 },
    { label: 'ไลฟ์สไตล์ · 120 นาที', amount: 1800 },
    { label: 'งานอีเวนต์ · 180 นาที', amount: 2400 },
  ]
  const modes = ['ที่ร้าน', 'นอกสถานที่']
  const comments = [
    'บริการดีมาก ตรงเวลา ประทับใจครับ',
    'คุ้มค่า แนะนำเลยค่ะ',
    'พูดคุยสนุก เป็นกันเอง',
    'ทุกอย่างราบรื่น จะกลับมาใช้บริการอีก',
    'สุภาพ เป็นมืออาชีพ คุยรายละเอียดชัดเจน',
    'โดยรวมดีมาก บรรยากาศสบายใจ',
  ]
  const pad = (n) => String(n).padStart(2, '0')

  for (let i = 1; i <= 60; i++) {
    const email = `traveler${String(i).padStart(3, '0')}@example.com`
    const name = `${first[(i * 3) % first.length]} ${last[(i * 7) % last.length]}`
    const phone = `08${String(10000000 + ((i * 137) % 90000000)).slice(0, 8)}`
    const user = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, email_verified_at)
       VALUES ($1,$2,$3,$4,'buyer', now())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name, email, phone, hash],
    )
    const userId = user.rows[0].id
    const bookingCount = 1 + (i % 4)
    for (let k = 0; k < bookingCount; k++) {
      const provider = providers[(i + k * 11) % providers.length]
      const bookingId = `ND-T${String(i).padStart(3, '0')}${k}`
      const service = services[(i + k) % services.length]
      const daysAgo = 8 + ((i * 5 + k * 13) % 140)
      const date = new Date(Date.now() - daysAgo * 86400000)
      const dateText = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      const time = `${pad(10 + ((i + k) % 11))}:00`
      const mode = modes[(i + k) % modes.length]
      await pool.query(
        `INSERT INTO bookings (id, provider_id, user_id, service, date, time, mode, venue, amount, status, guest_name, phone, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'เสร็จสิ้น',$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [bookingId, provider.id, userId, service.label, dateText, time, mode, provider.venue || '', service.amount, name, phone, new Date(date.getTime() - 2 * 86400000)],
      )
      if ((i + k) % 5 !== 0) {
        await pool.query(
          `INSERT INTO reviews (booking_id, provider_id, user_id, service_rating, value_rating, comment, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (booking_id) DO NOTHING`,
          [bookingId, provider.id, userId, 3 + ((i + k) % 3), 3 + ((i * 2 + k) % 3), comments[(i + k) % comments.length], date],
        )
      }
    }
  }

  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ('traveler-reviews-v1', 'complete')
     ON CONFLICT (key) DO NOTHING`,
  )
}

async function seedProvinceExtraProvidersIfNeeded() {
  const { rows: flag } = await pool.query("SELECT 1 FROM app_settings WHERE key = 'province-providers-v2-10'")
  if (flag.length) return

  for (const p of seed.provinceExtraProviders) {
    await pool.query(
      `INSERT INTO providers (id, name, age, province, area, gender, line, price, rating, reviews, initials,
         visual, category, description, tags, venue, modes, active, membership_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE,TRUE)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.age, p.province, p.area, p.gender, p.line, p.price, p.rating, p.reviews, p.initials,
        p.visual, p.category, p.description, p.tags, p.venue, p.modes],
    )
  }
  await pool.query(
    `SELECT setval(pg_get_serial_sequence('providers', 'id'), GREATEST((SELECT max(id) FROM providers), 1))`,
  )

  await seedReviewsForProviders(
    seed.provinceExtraProviders.map((p) => p.id),
    'ND-P',
  )

  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ('province-providers-v2-10', 'complete')
     ON CONFLICT (key) DO NOTHING`,
  )
}

async function seedReviewsForProviders(providerIds, bookingPrefix) {
  if (!providerIds.length) return
  const { rows: travelers } = await pool.query(
    `SELECT id, name, phone FROM users WHERE role = 'buyer' ORDER BY id LIMIT 120`)
  if (!travelers.length) return

  const services = [
    { label: 'พบปะพูดคุย · 60 นาที', amount: 900 },
    { label: 'ดื่มสังสรรค์ · 90 นาที', amount: 1200 },
    { label: 'ร่วมกิจกรรม · 90 นาที', amount: 1500 },
    { label: 'ไลฟ์สไตล์ · 120 นาที', amount: 1800 },
    { label: 'งานอีเวนต์ · 180 นาที', amount: 2400 },
  ]
  const modes = ['ที่ร้าน', 'นอกสถานที่']
  const comments = [
    'บริการดีมาก ตรงเวลา ประทับใจครับ',
    'คุ้มค่า แนะนำเลยค่ะ',
    'พูดคุยสนุก เป็นกันเอง',
    'ทุกอย่างราบรื่น จะกลับมาใช้บริการอีก',
    'สุภาพ เป็นมืออาชีพ คุยรายละเอียดชัดเจน',
    'โดยรวมดีมาก บรรยากาศสบายใจ',
    'นัดหมายชัดเจน ดูแลดีตลอดการพบ',
    'รายละเอียดครบ คุยง่าย ประทับใจค่ะ',
  ]
  const pad = (n) => String(n).padStart(2, '0')
  const { rows: venues } = await pool.query(
    'SELECT id, venue FROM providers WHERE id = ANY($1::int[])', [providerIds])
  const venueById = new Map(venues.map((row) => [row.id, row.venue || '']))

  for (let i = 0; i < providerIds.length; i++) {
    const providerId = providerIds[i]
    const reviewCount = 2 + (i % 4)
    for (let k = 0; k < reviewCount; k++) {
      const traveler = travelers[(i * 3 + k * 7) % travelers.length]
      const bookingId = `${bookingPrefix}${String(providerId).padStart(5, '0')}${k}`
      const service = services[(i + k) % services.length]
      const daysAgo = 5 + ((i * 4 + k * 9) % 120)
      const date = new Date(Date.now() - daysAgo * 86400000)
      const dateText = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      await pool.query(
        `INSERT INTO bookings (id, provider_id, user_id, service, date, time, mode, venue, amount, status, guest_name, phone, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'เสร็จสิ้น',$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [bookingId, providerId, traveler.id, service.label, dateText, `${pad(10 + ((i + k) % 11))}:00`,
          modes[(i + k) % 2], venueById.get(providerId) || '', service.amount, traveler.name, traveler.phone || '',
          new Date(date.getTime() - 2 * 86400000)],
      )
      await pool.query(
        `INSERT INTO reviews (booking_id, provider_id, user_id, service_rating, value_rating, comment, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (booking_id) DO NOTHING`,
        [bookingId, providerId, traveler.id, 3 + ((i + k) % 3), 3 + ((i * 2 + k) % 3),
          comments[(i + k) % comments.length], date],
      )
    }
  }
}
