const base = 'http://localhost:3001'
async function call(cookie, method, url, body, headers = {}) {
  const res = await fetch(base + url, {
    method,
    headers: { ...(body && !(body instanceof Uint8Array) ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers },
    body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined,
  })
  const set = res.headers.get('set-cookie')
  const data = await res.json().catch(() => null)
  return { status: res.status, data, cookie: set ? set.split(';')[0] : cookie }
}
const log = (label, r, pick = (d) => d) => console.log(label, r.status, JSON.stringify(pick(r.data))?.slice(0, 160))

log('bad login', await call('', 'POST', '/api/login', { email: 'admin@example.com', password: 'x' }))
log('role mismatch', await call('', 'POST', '/api/login', { email: 'admin@example.com', password: 'admin123', role: 'buyer' }))
const admin = await call('', 'POST', '/api/login', { email: 'admin@example.com', password: 'admin123', role: 'admin' })
log('admin login', admin, (d) => d.user.roleLabel)
log('apps (admin)', await call(admin.cookie, 'GET', '/api/applications'), (d) => d.length)
log('apps (guest)', await call('', 'GET', '/api/applications'))

const buyer = await call('', 'POST', '/api/login', { email: 'somchai@example.com', password: 'buyer123', role: 'buyer' })
log('buyer bookings', await call(buyer.cookie, 'GET', '/api/bookings'), (d) => d.length)
const b = await call(buyer.cookie, 'POST', '/api/bookings', { providerId: 1, service: 'ร่วมกิจกรรม', mode: 'นอกสถานที่', date: '2026-11-01', time: '19:00', address: 'x' })
log('create booking', b, (d) => [d.id, d.amount])
log('favorite toggle', await call(buyer.cookie, 'PUT', '/api/favorites/2'), (d) => d)
log('buyer admin patch', await call(buyer.cookie, 'PATCH', '/api/admin/providers/1', { active: false }))

const seller = await call('', 'POST', '/api/login', { email: 'mali@example.com', password: 'seller123', role: 'seller' })
log('seller bookings', await call(seller.cookie, 'GET', '/api/bookings'), (d) => d.length)
log('seller confirm', await call(seller.cookie, 'PATCH', `/api/bookings/${b.data.id}`, { status: 'ยืนยันแล้ว' }), (d) => d.status)
log('seller edit other', await call(seller.cookie, 'PATCH', '/api/providers/2', { name: 'hack' }))
log('seller edit own', await call(seller.cookie, 'PATCH', '/api/providers/1', { price: 1300, modes: ['ที่ร้าน'] }), (d) => [d.price, d.modes])
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
const m = await call(seller.cookie, 'POST', '/api/providers/1/media', png, { 'Content-Type': 'image/png', 'X-File-Name': encodeURIComponent('รูป.png') })
log('upload', m)
log('upload bad type', await call(seller.cookie, 'POST', '/api/providers/1/media', png, { 'Content-Type': 'text/html' }))
log('served', { status: (await fetch(base + m.data.url)).status, data: null })
log('delete media', await call(seller.cookie, 'DELETE', `/api/media/${m.data.id}`))

const reg = await call('', 'POST', '/api/register', { role: 'seller', name: 'ทดสอบ', email: `t${Date.now()}@example.com`, password: 'secret1', phone: '0800000000', province: 'ภูเก็ต', service: 'x', price: 900 })
log('register seller', reg, (d) => d.user.providerId)
log('register dup', await call('', 'POST', '/api/register', { role: 'admin', name: 'x', email: 'a@b.co', password: 'secret1' }))
const pending = await call(admin.cookie, 'GET', '/api/applications')
log('pending', pending, (d) => d.length)
log('public providers', await call('', 'GET', '/api/providers'), (d) => d.length)
log('approve', await call(admin.cookie, 'POST', `/api/applications/${pending.data.at(-1).id}/approve`))
log('public providers after', await call('', 'GET', '/api/providers'), (d) => d.length)
log('logout', await call(buyer.cookie, 'POST', '/api/logout'))
log('me after logout', await call(buyer.cookie, 'GET', '/api/me'))
