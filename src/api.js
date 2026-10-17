async function request(method, url, body, options = {}) {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined && !options.raw ? { 'Content-Type': 'application/json' } : options.headers,
    body: options.raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ')
  return data
}

export const api = {
  me: () => request('GET', '/api/me'),
  login: (payload) => request('POST', '/api/login', payload),
  register: (payload) => request('POST', '/api/register', payload),
  logout: () => request('POST', '/api/logout'),
  providers: () => request('GET', '/api/providers'),
  updateProvider: (id, payload) => request('PATCH', `/api/providers/${id}`, payload),
  setProviderStatus: (id, payload) => request('PATCH', `/api/admin/providers/${id}`, payload),
  uploadMedia: (id, file) => request('POST', `/api/providers/${id}/media`, file, {
    raw: true,
    headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
  }),
  deleteMedia: (id) => request('DELETE', `/api/media/${id}`),
  providerReviews: (id) => request('GET', `/api/providers/${id}/reviews`),
  createReview: (providerId, payload) => request('POST', `/api/providers/${providerId}/reviews`, payload),
  uploadReviewMedia: (reviewId, file) => request('POST', `/api/reviews/${reviewId}/media`, file, {
    raw: true,
    headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
  }),
  bookings: () => request('GET', '/api/bookings'),
  createBooking: (payload) => request('POST', '/api/bookings', payload),
  updateBooking: (id, status) => request('PATCH', `/api/bookings/${encodeURIComponent(id)}`, { status }),
  favorites: () => request('GET', '/api/favorites'),
  toggleFavorite: (providerId) => request('PUT', `/api/favorites/${providerId}`),
  applications: () => request('GET', '/api/applications'),
  submitApplication: (payload) => request('POST', '/api/applications', payload),
  approveApplication: (id) => request('POST', `/api/applications/${id}/approve`),
  rejectApplication: (id) => request('POST', `/api/applications/${id}/reject`),
}
