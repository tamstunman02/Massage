import nodemailer from 'nodemailer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// โหลด .env จากรากโปรเจกต์เสมอ (ไม่พึ่ง cwd)
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')
try { process.loadEnvFile(envPath) } catch { /* ไม่มีไฟล์ .env */ }

function env(name) {
  return String(process.env[name] ?? '').trim()
}

// Gmail App Password มักมีช่องว่าง — ตัดออกให้เหลือ 16 ตัวอักษร
function smtpPass() {
  const raw = env('SMTP_PASS')
  return raw.includes(' ') ? raw.replace(/\s+/g, '') : raw
}

function createTransport() {
  const host = env('SMTP_HOST')
  if (!host) return null
  const port = Number(env('SMTP_PORT')) || 587
  const user = env('SMTP_USER')
  const pass = smtpPass()
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  })
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function sendVerificationEmail({ to, name, link }) {
  const transport = createTransport()
  if (!transport) {
    console.log(`[mail] SMTP ยังไม่ได้ตั้งค่า — ลิงก์ยืนยันอีเมลของ ${to}: ${link}`)
    return false
  }
  try {
    const info = await transport.sendMail({
      from: env('MAIL_FROM') || env('SMTP_USER'),
      to,
      subject: 'NuaNia: ยืนยันอีเมลของคุณ',
      text: `สวัสดีคุณ ${name},\n\nกรุณายืนยันอีเมลสำหรับบัญชี NuaNia ภายใน 3 วัน:\n${link}\n\nหากคุณไม่ได้สมัครบัญชีนี้ สามารถละเว้นข้อความนี้ได้`,
      html: `<div style="font-family:'Prompt','Noto Sans Thai',Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#222">
      <h2 style="margin:0 0 12px">ยืนยันอีเมลของคุณ</h2>
      <p>สวัสดีคุณ ${escapeHtml(name)},</p>
      <p>กรุณายืนยันอีเมลนี้สำหรับบัญชี NuaNia ภายใน <b>3 วัน</b></p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 24px;background:#1f4d3a;color:#fff;border-radius:8px;text-decoration:none">ยืนยันอีเมล</a></p>
      <p style="color:#777;font-size:12px;word-break:break-all">${escapeHtml(link)}</p>
      <p style="color:#999;font-size:12px;margin-top:20px">หากคุณไม่ได้สมัครบัญชีนี้ สามารถละเว้นข้อความนี้ได้</p>
    </div>`,
    })
    console.log(`[mail] ส่งยืนยันถึง ${to} แล้ว (${info.response})`)
    return true
  } catch (error) {
    console.error(`[mail] SMTP error: ${error.code || ''} ${error.response || error.message}`)
    throw error
  }
}
