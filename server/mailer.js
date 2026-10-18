import nodemailer from 'nodemailer'

try { process.loadEnvFile() } catch { /* ไม่มีไฟล์ .env */ }

// ใช้ SMTP ฟรี (เช่น Gmail App Password, Brevo, Mailjet) ผ่าน env; ถ้าไม่ตั้งค่าจะพิมพ์ลิงก์ในคอนโซลแทน
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env
const transport = SMTP_HOST
  ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  })
  : null

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function sendVerificationEmail({ to, name, link }) {
  if (!transport) {
    console.log(`[mail] SMTP ยังไม่ได้ตั้งค่า — ลิงก์ยืนยันอีเมลของ ${to}: ${link}`)
    return false
  }
  await transport.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject: 'ยืนยันอีเมลของคุณ · NuaNia',
    text: `สวัสดีคุณ ${name}\n\nกรุณากดลิงก์เพื่อยืนยันอีเมล (ภายใน 3 วัน มิฉะนั้นบัญชีจะถูกลบอัตโนมัติ):\n${link}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2>ยืนยันอีเมลของคุณ</h2>
      <p>สวัสดีคุณ ${escapeHtml(name)}</p>
      <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมล ภายใน <b>3 วัน</b> มิฉะนั้นข้อมูลบัญชีจะถูกลบอัตโนมัติ</p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 24px;background:#1f4d3a;color:#fff;border-radius:8px;text-decoration:none">ยืนยันอีเมล</a></p>
      <p style="color:#777;font-size:12px">หากปุ่มกดไม่ได้ ให้คัดลอกลิงก์นี้: ${escapeHtml(link)}</p></div>`,
  })
  return true
}
