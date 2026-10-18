import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import pg from 'pg'
import * as seed from './seed.js'

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
CREATE TABLE IF NOT EXISTS demo_reviews (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  sample_index SMALLINT NOT NULL,
  user_name TEXT NOT NULL,
  service_rating SMALLINT NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
  value_rating SMALLINT NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_id, sample_index)
);
CREATE TABLE IF NOT EXISTS review_media (
  id SERIAL PRIMARY KEY,
  review_id INT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
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
  const { rows: verifyColumn } = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified_at'`)
  if (!verifyColumn.length) {
    await pool.query('ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ')
    await pool.query('UPDATE users SET email_verified_at = now()')
  }
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_token_hash TEXT')
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_sent_at TIMESTAMPTZ')
  await pool.query('CREATE INDEX IF NOT EXISTS users_verify_token_idx ON users(email_verify_token_hash)')
  const roles = JSON.parse(readFileSync(new URL('./roles.json', import.meta.url), 'utf8'))
  for (const [name, role] of Object.entries(roles)) {
    await pool.query(
      `INSERT INTO roles (name, label, permissions) VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, permissions = EXCLUDED.permissions`,
      [name, role.label, role.permissions],
    )
  }

  const { rows: providerRows } = await pool.query('SELECT count(*)::int AS n FROM providers')
  const isNewDatabase = providerRows[0].n === 0

  if (isNewDatabase) {
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
  if (!demoSeeded.length) {
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

  if (isNewDatabase) {
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
  }

  await pool.query(`
    UPDATE providers SET
      age = CASE WHEN age IS NULL OR age < 18 THEN 22 + (id % 13) ELSE age END,
      height_cm = COALESCE(height_cm, 155 + (id % 26)),
      weight_kg = COALESCE(weight_kg, 45 + ((id * 7) % 36)),
      measurements = CASE WHEN measurements = '' THEN
        (30 + (id % 8))::text || '-' || (23 + (id % 7))::text || '-' || (33 + (id % 9))::text
        ELSE measurements END`)

  await pool.query(
    `INSERT INTO demo_reviews (provider_id, sample_index, user_name, service_rating, value_rating, comment, created_at)
     SELECT p.id, sample.sample_index,
       CASE sample.sample_index
         WHEN 1 THEN $1
         WHEN 2 THEN $2
         ELSE $3
       END,
       (5 - ((p.id + sample.sample_index) % 2))::smallint, 5::smallint,
       CASE ((p.id + sample.sample_index) % 3)
         WHEN 0 THEN $4
         WHEN 1 THEN $5
         ELSE $6
       END,
       now() - (sample.sample_index * 15 * interval '1 day')
     FROM providers p CROSS JOIN generate_series(1, 3) AS sample(sample_index)
     WHERE p.active AND p.membership_active
     ON CONFLICT (provider_id, sample_index) DO NOTHING`,
    ['นักท่องเที่ยวตัวอย่าง', 'คุณผู้ใช้ตัวอย่าง', 'ผู้จองตัวอย่าง',
      'นัดหมายสะดวก พูดคุยรายละเอียดและขอบเขตกันชัดเจน ประทับใจการสื่อสารครับ',
      'บรรยากาศเป็นกันเอง ตรงต่อเวลา และดูแลการนัดหมายได้ดีค่ะ',
      'รายละเอียดบริการชัดเจน คุยกันเข้าใจง่าย โดยรวมประทับใจค่ะ'],
  )
}
