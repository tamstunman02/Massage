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
  resendVerification: () => request('POST', '/api/resend-verification'),
  verifyEmail: (token) => request('POST', '/api/verify-email', { token }),
  providers: () => request('GET', '/api/providers'),
  updateProvider: (id, payload) => request('PATCH', `/api/providers/${id}`, payload),
  setProviderStatus: (id, payload) => request('PATCH', `/api/admin/providers/${id}`, payload),
  deleteAdminUser: (id) => request('DELETE', `/api/admin/users/${id}`),
  deleteAdminProvider: (id) => request('DELETE', `/api/admin/providers/${id}`),
  createAdminProvider: (payload) => request('POST', '/api/admin/providers', payload),
  uploadMedia: (id, file) => request('POST', `/api/providers/${id}/media`, file, {
    raw: true,
    headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
  }),
  updateMedia: (id, payload) => request('PATCH', `/api/media/${id}`, payload),
  deleteMedia: (id) => request('DELETE', `/api/media/${id}`),
  providerReviews: (id) => request('GET', `/api/providers/${id}/reviews`),
  createReview: (providerId, payload) => request('POST', `/api/providers/${providerId}/reviews`, payload),
  uploadReviewMedia: (reviewId, file) => request('POST', `/api/reviews/${reviewId}/media`, file, {
    raw: true,
    headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
  }),
  bookings: () => request('GET', '/api/bookings'),
  adminTravelers: () => request('GET', '/api/admin/travelers'),
  adminTraveler: (id) => request('GET', `/api/admin/travelers/${encodeURIComponent(id)}`),
  createBooking: (payload) => request('POST', '/api/bookings', payload),
  updateBooking: (id, status) => request('PATCH', `/api/bookings/${encodeURIComponent(id)}`, { status }),
  favorites: () => request('GET', '/api/favorites'),
  toggleFavorite: (providerId) => request('PUT', `/api/favorites/${providerId}`),
  applications: () => request('GET', '/api/applications'),
  submitApplication: (payload) => request('POST', '/api/applications', payload),
  approveApplication: (id, payload = {}) => request('POST', `/api/applications/${id}/approve`, payload),
  rejectApplication: (id) => request('POST', `/api/applications/${id}/reject`),
  seekPosts: (params = {}) => {
    const query = new URLSearchParams()
    if (params.mine) query.set('mine', '1')
    if (params.status) query.set('status', params.status)
    if (params.province) query.set('province', params.province)
    const suffix = query.toString() ? `?${query}` : ''
    return request('GET', `/api/seek-posts${suffix}`)
  },
  seekPost: (id) => request('GET', `/api/seek-posts/${id}`),
  seekPostStreamUrl: (id) => `/api/seek-posts/${id}/stream`,
  createSeekPost: (payload) => request('POST', '/api/seek-posts', payload),
  updateSeekPost: (id, payload) => request('PATCH', `/api/seek-posts/${id}`, payload),
  closeSeekPost: (id) => request('POST', `/api/seek-posts/${id}/close`),
  createSeekComment: (id, payload) => request('POST', `/api/seek-posts/${id}/comments`, payload),
  updateSeekComment: (id, payload) => request('PATCH', `/api/seek-comments/${id}`, payload),
  deleteSeekComment: (id) => request('DELETE', `/api/seek-comments/${id}`),
}
