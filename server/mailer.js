import nodemailer from 'nodemailer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// โหลด .env จากรากโปรเจกต์เสมอ (ไม่พึ่ง cwd)
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')
try { process.loadEnvFile(envPath) } catch { /* ไม่มีไฟล์ .env */ }

function env(name) {
  let value = String(process.env[name] ?? '').trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1).trim()
  }
  return value
}

function mailgunConfig() {
  const apiKey = env('MAILGUN_API_KEY') || env('API_KEY')
  const domain = env('MAILGUN_DOMAIN')
  if (!apiKey || !domain) return null
  // Private API key ของ Mailgun ยาวมาก — ถ้าน้อยกว่า 20 ตัวมักคัดลอกไม่ครบ
  if (apiKey.length < 20) {
    console.warn(`[mail] MAILGUN_API_KEY สั้นเกินไป (${apiKey.length} ตัว) — ไปคัดลอก Private API key ทั้งก้อนที่ app.mailgun.com/settings/api_security`)
  }
  const baseUrl = env('MAILGUN_API_URL') || 'https://api.mailgun.net'
  return { apiKey, domain, baseUrl }
}

function mailFrom() {
  const mg = mailgunConfig()
  const fallback = mg
    ? `NuaNia <postmaster@${mg.domain}>`
    : (env('SMTP_USER') || 'NuaNia <noreply@nuania.app>')
  const raw = env('MAIL_FROM') || fallback
  if (/^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(raw)) return raw
  if (/^[^<>]+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(raw)) return raw
  if (raw && !raw.includes('@')) return fallback
  return raw
}

function smtpPass() {
  const raw = env('SMTP_PASS')
  if (/^[a-z]{4}(?:\s+[a-z]{4}){3}$/i.test(raw)) return raw.replace(/\s+/g, '')
  return raw.replace(/\s+/g, '')
}

function resendApiKey() {
  const key = env('RESEND_API_KEY')
  if (!key) return ''
  if (!key.startsWith('re_') || key.length < 20) return ''
  if (/[\u0E00-\u0E7F]/.test(key) || /ใส่|your|example|xxxx/i.test(key)) return ''
  return key
}

function smtpConfig() {
  const host = env('SMTP_HOST')
  if (!host) return null
  const port = Number(env('SMTP_PORT')) || 2525
  const user = env('SMTP_USER')
  const pass = smtpPass()
  if (!user || !pass) return null
  return { host, port, user, pass }
}

function createTransport() {
  const cfg = smtpConfig()
  if (!cfg) return null
  const { host, port, user, pass } = cfg
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587 || port === 2525,
    auth: { user, pass },
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 20_000,
    tls: { servername: host, minVersion: 'TLSv1.2' },
  })
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function buildVerificationContent({ name, link }) {
  const text = `สวัสดีคุณ ${name},\n\nกรุณายืนยันอีเมลสำหรับบัญชี NuaNia ภายใน 3 วัน:\n${link}\n\nหากคุณไม่ได้สมัครบัญชีนี้ สามารถละเว้นข้อความนี้ได้`
  const html = `<div style="font-family:'Prompt','Noto Sans Thai',Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#222">
      <h2 style="margin:0 0 12px">ยืนยันอีเมลของคุณ</h2>
      <p>สวัสดีคุณ ${escapeHtml(name)},</p>
      <p>กรุณายืนยันอีเมลนี้สำหรับบัญชี NuaNia ภายใน <b>3 วัน</b></p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 24px;background:#1f4d3a;color:#fff;border-radius:8px;text-decoration:none">ยืนยันอีเมล</a></p>
      <p style="color:#777;font-size:12px;word-break:break-all">${escapeHtml(link)}</p>
      <p style="color:#999;font-size:12px;margin-top:20px">หากคุณไม่ได้สมัครบัญชีนี้ สามารถละเว้นข้อความนี้ได้</p>
    </div>`
  return { text, html }
}

/** Mailgun HTTP API (พอร์ต 443) — ไม่พึ่ง SMTP 2525/587 */
async function sendWithMailgunApi({ to, name, link }) {
  const cfg = mailgunConfig()
  if (!cfg) return null
  const { text, html } = buildVerificationContent({ name, link })
  const body = new URLSearchParams()
  body.set('from', mailFrom())
  body.set('to', to)
  body.set('subject', 'NuaNia: ยืนยันอีเมลของคุณ')
  body.set('text', text)
  body.set('html', html)

  const auth = Buffer.from(`api:${cfg.apiKey}`).toString('base64')
  const response = await fetch(`${cfg.baseUrl}/v3/${cfg.domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const raw = await response.text()
  let payload = {}
  try { payload = raw ? JSON.parse(raw) : {} } catch { payload = { raw } }
  if (!response.ok) {
    let detail = payload?.message || payload?.error || payload?.raw || raw || response.statusText
    if (typeof detail === 'object') detail = JSON.stringify(detail)
    if (!detail || detail === '{}' || detail === '[]') {
      detail = response.status === 401
        ? 'API key ไม่ถูกต้องหรือคัดลอกไม่ครบ — ใช้ Private API key ทั้งก้อนจาก Settings → API Security'
        : response.status === 403 || /unverified/i.test(raw)
          ? 'โดเมนยังไม่ verified — ตรวจ DNS ใน Mailgun ให้ครบก่อน'
          : `Mailgun ตอบ ${response.status} ${response.statusText}`
    }
    const error = new Error(detail)
    error.code = 'MAILGUN_API'
    error.response = detail
    throw error
  }
  console.log(`[mail] ส่งยืนยันถึง ${to} แล้วผ่าน Mailgun API (${payload.id || 'ok'})`)
  return true
}

async function sendWithSmtp({ to, name, link }) {
  const transport = createTransport()
  if (!transport) return null
  const cfg = smtpConfig()
  const { text, html } = buildVerificationContent({ name, link })
  const info = await transport.sendMail({
    from: mailFrom(),
    to,
    subject: 'NuaNia: ยืนยันอีเมลของคุณ',
    text,
    html,
  })
  console.log(`[mail] ส่งยืนยันถึง ${to} แล้วผ่าน SMTP ${cfg.host}:${cfg.port} (${info.response || info.messageId || 'ok'})`)
  return true
}

async function sendWithResendApi({ to, name, link }) {
  const apiKey = resendApiKey()
  if (!apiKey) return null
  const { text, html } = buildVerificationContent({ name, link })
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: [to],
      subject: 'NuaNia: ยืนยันอีเมลของคุณ',
      text,
      html,
    }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body?.message || body?.error || JSON.stringify(body) || response.statusText
    const error = new Error(detail)
    error.code = 'RESEND_API'
    error.response = detail
    throw error
  }
  console.log(`[mail] ส่งยืนยันถึง ${to} แล้วผ่าน Resend API (${body.id || 'ok'})`)
  return true
}

export async function sendVerificationEmail({ to, name, link }) {
  // 1) Mailgun API ก่อน — ใช้ HTTPS ไม่โดนบล็อกพอร์ต SMTP
  if (mailgunConfig()) {
    try {
      return await sendWithMailgunApi({ to, name, link })
    } catch (error) {
      console.error(`[mail] Mailgun error: ${error.code || ''} ${error.response || error.message}`)
      throw error
    }
  }

  // 2) SMTP สำรอง (เช่น พอร์ต 2525)
  if (smtpConfig()) {
    try {
      return await sendWithSmtp({ to, name, link })
    } catch (error) {
      console.error(`[mail] SMTP error: ${error.code || ''} ${error.response || error.message}`)
      if (resendApiKey()) {
        console.warn('[mail] ลอง Resend API เป็นสำรอง...')
        return await sendWithResendApi({ to, name, link })
      }
      throw error
    }
  }

  if (resendApiKey()) {
    try {
      return await sendWithResendApi({ to, name, link })
    } catch (error) {
      console.error(`[mail] Resend error: ${error.code || ''} ${error.response || error.message}`)
      throw error
    }
  }

  console.log(`[mail] ยังไม่ได้ตั้ง Mailgun/SMTP/Resend — ลิงก์ยืนยันของ ${to}: ${link}`)
  return false
}

export function describeMailSetup() {
  const mg = mailgunConfig()
  if (mg) return `Mailgun API (${mg.domain})`
  const smtp = smtpConfig()
  if (smtp) return `SMTP ${smtp.host}:${smtp.port}`
  if (resendApiKey()) return 'Resend API'
  return 'ไม่ได้ตั้งค่า'
}
