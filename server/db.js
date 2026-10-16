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
`

export async function initDb() {
  await pool.query(schema)

  const roles = JSON.parse(readFileSync(new URL('./roles.json', import.meta.url), 'utf8'))
  for (const [name, role] of Object.entries(roles)) {
    await pool.query(
      `INSERT INTO roles (name, label, permissions) VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, permissions = EXCLUDED.permissions`,
      [name, role.label, role.permissions],
    )
  }

  const { rows } = await pool.query('SELECT count(*)::int AS n FROM providers')
  if (rows[0].n > 0) return

  for (const p of seed.providers) {
    await pool.query(
      `INSERT INTO providers (id, name, age, province, area, gender, line, price, rating, reviews, initials,
         visual, category, description, tags, venue, modes, active, membership_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE,TRUE)`,
      [p.id, p.name, p.age, p.province, p.area, p.gender, p.line, p.price, p.rating, p.reviews, p.initials,
        p.visual, p.category, p.description, p.tags, p.venue, p.modes],
    )
  }
  await pool.query(`SELECT setval(pg_get_serial_sequence('providers', 'id'), (SELECT max(id) FROM providers))`)

  const ids = {}
  for (const u of seed.users) {
    const res = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, provider_id) VALUES ($1,$2,$3,$4,$5) RETURNING id',
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
