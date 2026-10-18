<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { api } from './api'

const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย',
  'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี',
  'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี',
  'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร',
  'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน',
  'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
  'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี',
  'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ',
  'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี',
]

const providers = ref([])

const view = ref('home')
const searchName = ref('')
const selectedProvince = ref('')
const selectedGender = ref('')
const selectedMode = ref('')
const selectedService = ref('')
const appliedSearchFilters = ref({ name: '', province: '', gender: '', mode: '', service: '' })
const isSearchFilterOpen = ref(false)
const searchFilterInput = ref(null)
const searchFilterTrigger = ref(null)
const sortBy = ref('แนะนำ')
const selectedProvider = ref(null)
const selectedReviews = ref([])
const reviewableBookingIds = ref([])
const reviewForm = ref({ bookingId: '', serviceRating: 5, valueRating: 5, comment: '' })
const reviewImages = ref([])
const viewerMedia = ref([])
const viewerIndex = ref(0)
const profileBookingMode = ref('ที่ร้าน')
const booking = ref({ mode: 'ที่ร้าน', service: '', date: '', time: '', guestName: '', phone: '', address: '', note: '' })
const bookings = ref([])
const applications = ref([])
const application = ref({ name: '', line: '', province: '', gender: '', service: '', consent: false })
const favorites = ref([])
const notice = ref('')
const bookingReference = ref('')
const isCompactMenuOpen = ref(false)
const adminTab = ref('overview')
const adminProviderSearch = ref('')
const adminProviderProvince = ref('')
const adminProviderGender = ref('')
const adminProviderPage = ref(1)
const adminProviderPageSize = 50
const adminTravelers = ref([])
const adminTravelerSearch = ref('')
const selectedTraveler = ref(null)
const isAdminTravelerLoading = ref(false)
const accountTab = ref('appointments')
const member = ref(null)
const activeRole = ref('buyer')
const loginRole = ref('buyer')
const memberSellerProviderId = ref(null)
const membership = ref({ role: 'buyer', name: '', email: '', phone: '', password: '', businessName: '', province: '', service: '', price: 1000 })
const sellerDashboardTab = ref('overview')
const currentUser = ref(null)
const loginForm = ref({ email: '', password: '' })
const appRoot = ref(null)
let scrollFrame = 0
const userPermissions = computed(() => currentUser.value?.permissions || [])

const currentRole = computed(() => currentUser.value?.role || 'guest')
const roleLabel = computed(() => currentUser.value?.roleLabel || '')
const currentHomeView = computed(() => ({ admin: 'admin', seller: 'seller' }[currentRole.value] || 'account'))
const accountMenuLabel = computed(() => ({ admin: 'แผงควบคุม', seller: 'ศูนย์ผู้ขาย', buyer: 'บัญชีของฉัน' }[currentRole.value] || 'บัญชีของฉัน'))
const protectedViews = { account: ['booking:view:own', 'buyer'], seller: ['dashboard:seller', 'seller'], admin: ['dashboard:admin', 'admin'] }

function can(permission) {
  return userPermissions.value.includes(permission)
}

async function loadData() {
  const [providerList, bookingList, favoriteList, applicationList, travelerList] = await Promise.all([
    api.providers(),
    currentUser.value ? api.bookings() : [],
    can('favorite:manage') ? api.favorites() : [],
    can('provider:approve') ? api.applications() : [],
    can('user:view') ? api.adminTravelers() : [],
  ])
  providers.value = providerList
  bookings.value = bookingList
  favorites.value = favoriteList
  applications.value = applicationList
  adminTravelers.value = travelerList
  if (selectedProvider.value) {
    selectedProvider.value = providerList.find((item) => item.id === selectedProvider.value.id) || null
  }
}

function applyUser(user) {
  currentUser.value = user
  member.value = user ? { role: user.role, name: user.name, email: user.email, phone: user.phone || '' } : null
  activeRole.value = user?.role || 'buyer'
  memberSellerProviderId.value = user?.providerId ?? null
}

async function safely(action, fallbackMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่') {
  try {
    return await action()
  } catch (error) {
    showNotice(error.message || fallbackMessage)
    return undefined
  }
}

function updateScrollEffects() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    const root = appRoot.value
    if (!root) return

    const pageRange = document.documentElement.scrollHeight - window.innerHeight
    root.style.setProperty('--page-progress', String(pageRange > 0 ? Math.min(1, Math.max(0, window.scrollY / pageRange)) : 0))

    const art = root.querySelector('.lux-experience-art')
    if (art) {
      const rect = art.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)))
      root.style.setProperty('--art-shift', `${34 - progress * 56}px`)
      root.style.setProperty('--art-scale', String(0.94 + progress * 0.08))
      root.style.setProperty('--ring-forward-shift', `${24 - progress * 42}px`)
      root.style.setProperty('--ring-forward-rotation', `${-14 + progress * 34}deg`)
      root.style.setProperty('--ring-backward-shift', `${-16 + progress * 36}px`)
      root.style.setProperty('--ring-backward-rotation', `${12 - progress * 36}deg`)
      root.style.setProperty('--circle-scale', String(0.78 + progress * 0.3))
      root.style.setProperty('--circle-rotation', `${-10 + progress * 18}deg`)
    }

    const revealItems = root.querySelectorAll([
      '[data-reveal]',
      '.lux-profile-page .lux-profile-section',
      '.lux-admin-page .lux-admin-metrics > article',
      '.lux-admin-page .lux-admin-overview-grid > *',
      '.lux-account-main .lux-appointment-card',
      '.lux-account-main .lux-history-item',
      '.lux-seller-page .lux-seller-panel',
      '.lux-seller-page .lux-seller-metrics > article',
    ].join(','))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    revealItems.forEach((element) => {
      if (reduceMotion || element.getBoundingClientRect().top < window.innerHeight * 0.88) {
        element.classList.add('is-visible')
      }
    })
    root.classList.add('lux-scroll-ready')
  })
}

let previousBodyOverflow = ''
watch(isSearchFilterOpen, (isOpen) => {
  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
})

watch(view, async () => {
  await nextTick()
  updateScrollEffects()
})

watch([providers, bookings, applications], async () => {
  await nextTick()
  updateScrollEffects()
}, { flush: 'post' })

onMounted(async () => {
  window.addEventListener('scroll', updateScrollEffects, { passive: true })
  window.addEventListener('resize', updateScrollEffects)
  window.addEventListener('keydown', handleViewerKeydown)
  updateScrollEffects()
  await safely(async () => {
    applyUser((await api.me()).user)
    await loadData()
  }, 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ')
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('scroll', updateScrollEffects)
  window.removeEventListener('resize', updateScrollEffects)
  window.removeEventListener('keydown', handleViewerKeydown)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  clearReviewImages()
})

function openOwnArea() {
  navigate(currentHomeView.value)
}

async function submitLogin() {
  const result = await safely(() => api.login({
    role: loginRole.value, email: loginForm.value.email.trim(), password: loginForm.value.password,
  }))
  if (!result) return
  applyUser(result.user)
  loginForm.value.password = ''
  await safely(loadData)
  showNotice(`เข้าสู่ระบบในฐานะ${result.user.roleLabel}`)
  navigate(currentHomeView.value)
}

async function logout() {
  await safely(() => api.logout())
  applyUser(null)
  bookings.value = []
  favorites.value = []
  applications.value = []
  await safely(loadData)
  navigate('home')
}

function openAdmin() {
  if (!can('dashboard:admin')) {
    showNotice('ต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแล')
    loginRole.value = 'admin'
    navigate('login')
    return
  }
  navigate('admin')
}

async function openAdminTraveler(traveler) {
  isAdminTravelerLoading.value = true
  const details = await safely(() => api.adminTraveler(traveler.id), 'โหลดข้อมูลนักท่องเที่ยวไม่สำเร็จ')
  if (details) selectedTraveler.value = details
  isAdminTravelerLoading.value = false
}

const services = [
  { name: 'พบปะพูดคุย', duration: '60 นาที', description: 'ตกลงรายละเอียดก่อนนัดหมาย', add: 0 },
  { name: 'ร่วมกิจกรรม', duration: '90 นาที', description: 'ตกลงรายละเอียดก่อนนัดหมาย', add: 300 },
  { name: 'งานอีเวนต์', duration: '90 นาที', description: 'ตกลงรายละเอียดก่อนนัดหมาย', add: 500 },
]

function providerServices(provider) {
  if (provider.services?.length) return provider.services
  return services.map(({ add, ...service }) => ({ ...service, price: provider.price + add }))
}

const visibleProviders = computed(() => {
  const filters = appliedSearchFilters.value
  const term = filters.name.trim().toLocaleLowerCase()
  const results = providers.value.filter((provider) => {
    const searchable = `${provider.name} ${provider.line} ${provider.area} ${provider.province} ${provider.category} ${provider.tags.join(' ')}`.toLocaleLowerCase()
    return provider.active && provider.membershipActive &&
      (!filters.province || provider.province === filters.province) &&
      (!filters.gender || provider.gender === filters.gender) &&
      (!filters.mode || provider.modes.includes(filters.mode)) &&
      (!filters.service || provider.tags.some((tag) => tag.toLocaleLowerCase().includes(filters.service.toLocaleLowerCase()))) &&
      (!term || searchable.includes(term))
  })
  if (sortBy.value === 'ราคา: ต่ำไปสูง') return [...results].sort((a, b) => a.price - b.price)
  if (sortBy.value === 'คะแนนสูงสุด') return [...results].sort((a, b) => Number(b.rating) - Number(a.rating))
  return results
})

const selectedServiceOption = computed(() => providerServices(selectedProvider.value || { price: 0 }).find((service) => service.name === booking.value.service) || providerServices(selectedProvider.value || { price: 0 })[0])
const bookingPrice = computed(() => (selectedServiceOption.value?.price || 0) + (booking.value.mode === 'นอกสถานที่' ? 250 : 0))
const featuredProfileImage = computed(() => selectedProvider.value?.media?.find((media) => media.type === 'image'))
const currentViewerMedia = computed(() => viewerMedia.value[viewerIndex.value] || null)
const availableAppointmentModes = computed(() => [
  ...new Set(providers.value.flatMap((provider) => provider.modes || [])),
].sort((a, b) => a.localeCompare(b, 'th')))
const reviewSummary = computed(() => {
  if (!selectedReviews.value.length) return null
  const totals = selectedReviews.value.reduce((summary, review) => ({
    service: summary.service + review.serviceRating,
    value: summary.value + review.valueRating,
  }), { service: 0, value: 0 })
  return {
    count: selectedReviews.value.length,
    service: (totals.service / selectedReviews.value.length).toFixed(1),
    value: (totals.value / selectedReviews.value.length).toFixed(1),
  }
})
const availableReviewBookings = computed(() => completedBookings.value.filter((item) =>
  item.providerId === selectedProvider.value?.id && reviewableBookingIds.value.includes(item.id),
))
const upcomingBookings = computed(() => bookings.value.filter((item) => item.status !== 'เสร็จสิ้น'))
const completedBookings = computed(() => bookings.value.filter((item) => item.status === 'เสร็จสิ้น'))
const favoriteProviders = computed(() => providers.value.filter((provider) => favorites.value.includes(provider.id)))
const filteredAdminProviders = computed(() => {
  const term = adminProviderSearch.value.trim().toLocaleLowerCase()
  return providers.value.filter((provider) =>
    (!term || provider.name.toLocaleLowerCase().includes(term)) &&
    (!adminProviderProvince.value || provider.province === adminProviderProvince.value) &&
    (!adminProviderGender.value || provider.gender === adminProviderGender.value),
  )
})
const adminProviderGenders = computed(() => [...new Set(providers.value.map((provider) => provider.gender).filter(Boolean))].sort())
const adminProviderPageCount = computed(() => Math.ceil(filteredAdminProviders.value.length / adminProviderPageSize))
const paginatedAdminProviders = computed(() => {
  const start = (adminProviderPage.value - 1) * adminProviderPageSize
  return filteredAdminProviders.value.slice(start, start + adminProviderPageSize)
})
const filteredAdminTravelers = computed(() => {
  const term = adminTravelerSearch.value.trim().toLocaleLowerCase()
  return adminTravelers.value.filter((traveler) =>
    !term || `${traveler.name} ${traveler.email} ${traveler.phone}`.toLocaleLowerCase().includes(term),
  )
})
const activeProviderCount = computed(() => providers.value.filter((provider) => provider.active && provider.membershipActive).length)
const sellerProvider = computed(() => providers.value.find((provider) => provider.id === memberSellerProviderId.value))
const sellerBookings = computed(() => bookings.value.filter((item) => item.providerId === memberSellerProviderId.value))

watch([adminProviderSearch, adminProviderProvince, adminProviderGender], () => {
  adminProviderPage.value = 1
})

async function addSellerMedia(event) {
  const input = event.target
  const files = Array.from(input.files || [])
  input.value = ''

  const acceptedFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
  const provider = sellerProvider.value
  if (!provider || acceptedFiles.length === 0) {
    showNotice('กรุณาเลือกรูปภาพหรือวิดีโอ')
    return
  }

  const uploaded = []
  for (const file of acceptedFiles) {
    const media = await safely(() => api.uploadMedia(provider.id, file))
    if (media) uploaded.push(media)
  }
  provider.media = [...(provider.media || []), ...uploaded]
  if (uploaded.length) {
    showNotice(`เพิ่มสื่อ ${uploaded.length} ไฟล์แล้ว${acceptedFiles.length < files.length ? ' (ข้ามไฟล์ที่ไม่ใช่รูปหรือวิดีโอ)' : ''}`)
  }
}

async function removeSellerMedia(mediaId) {
  const provider = sellerProvider.value
  if (!provider) return
  if (await safely(() => api.deleteMedia(mediaId))) {
    provider.media = (provider.media || []).filter((item) => item.id !== mediaId)
  }
}

async function saveSellerProfile() {
  const provider = sellerProvider.value
  if (!provider) return
  if (!Number.isInteger(Number(provider.age)) || Number(provider.age) < 18 || Number(provider.age) > 100 ||
      !Number.isInteger(Number(provider.heightCm)) || Number(provider.heightCm) < 120 || Number(provider.heightCm) > 230 ||
      !Number.isInteger(Number(provider.weightKg)) || Number(provider.weightKg) < 30 || Number(provider.weightKg) > 250 ||
      !provider.measurements.trim() || provider.measurements.length > 80) {
    showNotice('กรุณากรอกอายุ ส่วนสูง น้ำหนัก และสัดส่วนให้ถูกต้อง')
    return
  }
  if (!provider.description.trim()) {
    showNotice('กรุณากรอกรายละเอียดบริการ')
    return
  }
  const serviceNames = provider.services.map((service) => service.name.trim().toLocaleLowerCase())
  if (!provider.services.length || provider.services.length > 30 ||
      provider.services.some((service) => !service.name.trim() || service.name.trim().length > 60 ||
        !service.duration.trim() || service.duration.trim().length > 40 ||
        !service.description.trim() || service.description.trim().length > 200 ||
        !Number.isInteger(Number(service.price)) || Number(service.price) < 1 || Number(service.price) > 1000000) ||
      new Set(serviceNames).size !== serviceNames.length) {
    showNotice('กำหนดรูปแบบบริการ 1–30 รายการ กรอกชื่อ ระยะเวลา รายละเอียด และราคาให้ครบ โดยชื่อห้ามซ้ำ')
    return
  }
  const saved = await safely(() => api.updateProvider(provider.id, {
    name: provider.name, age: provider.age, heightCm: provider.heightCm, weightKg: provider.weightKg, measurements: provider.measurements,
    price: provider.price, description: provider.description, venue: provider.venue, province: provider.province, services: provider.services,
  }))
  if (saved) {
    providers.value = providers.value.map((item) => (item.id === saved.id ? saved : item))
    showNotice('บันทึกข้อมูลบริการแล้ว')
  }
}

function addSellerService() {
  const provider = sellerProvider.value
  if (!provider) return
  if (provider.services.length >= 30) {
    showNotice('เพิ่มรูปแบบบริการได้สูงสุด 30 รายการ')
    return
  }
  provider.services.push({ name: '', duration: '', description: '', price: provider.price })
}

function removeSellerService(index) {
  const provider = sellerProvider.value
  if (!provider || provider.services.length <= 1) {
    showNotice('ต้องมีรูปแบบบริการอย่างน้อย 1 รายการ')
    return
  }
  provider.services.splice(index, 1)
}

async function setProviderStatus(provider, field) {
  const saved = await safely(() => api.setProviderStatus(provider.id, { [field]: !provider[field] }))
  if (saved) providers.value = providers.value.map((item) => (item.id === saved.id ? saved : item))
}

function navigate(nextView) {
  isSearchFilterOpen.value = false
  if (nextView === 'apply') {
    membership.value.role = 'seller'
    nextView = 'membership'
  }
  const guard = protectedViews[nextView]
  if (guard && (!can(guard[0]) || currentRole.value !== guard[1])) {
    if (currentUser.value) {
      showNotice('บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้านี้')
      nextView = currentHomeView.value
    } else {
      loginRole.value = guard[1]
      showNotice('กรุณาเข้าสู่ระบบก่อน')
      nextView = 'login'
    }
  }
  view.value = nextView
  isCompactMenuOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function openSearchFilters() {
  isSearchFilterOpen.value = true
  await nextTick()
  searchFilterInput.value?.focus()
}

async function closeSearchFilters() {
  isSearchFilterOpen.value = false
  await nextTick()
  searchFilterTrigger.value?.focus()
}

function resetSearchFilters() {
  searchName.value = ''
  selectedProvince.value = ''
  selectedGender.value = ''
  selectedMode.value = ''
  selectedService.value = ''
}

function applySearchFilters() {
  appliedSearchFilters.value = {
    name: searchName.value,
    province: selectedProvince.value,
    gender: selectedGender.value,
    mode: selectedMode.value,
    service: selectedService.value,
  }
  closeSearchFilters()
}

function clearSearchFilters() {
  resetSearchFilters()
  appliedSearchFilters.value = { name: '', province: '', gender: '', mode: '', service: '' }
}

function openSellerArea() {
  if (member.value?.role === 'seller' && sellerProvider.value) {
    activeRole.value = 'seller'
    navigate('seller')
    return
  }
  membership.value.role = 'seller'
  navigate('membership')
}

function openBuyerArea() {
  activeRole.value = 'buyer'
  navigate('account')
}

function startGoogleLogin() {
  if (loginRole.value !== 'buyer') {
    showNotice('Google Login เปิดให้ใช้เฉพาะนักท่องเที่ยว')
    return
  }
  showNotice('ปุ่ม Google Login เป็นตัวอย่าง ยังไม่ได้เชื่อมต่อ Google OAuth')
}

async function openProfile(provider) {
  selectedProvider.value = provider
  profileBookingMode.value = provider.modes?.includes(profileBookingMode.value)
    ? profileBookingMode.value
    : provider.modes?.[0] || ''
  selectedReviews.value = []
  reviewableBookingIds.value = []
  reviewForm.value = { bookingId: '', serviceRating: 5, valueRating: 5, comment: '' }
  clearReviewImages()
  navigate('profile')
  await safely(() => loadProviderReviews(provider.id), 'โหลดรีวิวไม่สำเร็จ')
}

function providerPreviewMedia(provider) {
  return provider.media?.find((media) => media.type === 'image') || provider.media?.[0]
}

function openMediaViewer(media, index) {
  viewerMedia.value = media
  viewerIndex.value = index
}

function closeMediaViewer() {
  viewerMedia.value = []
  viewerIndex.value = 0
}

function handleViewerKeydown(event) {
  if (event.key === 'Escape' && isSearchFilterOpen.value) {
    closeSearchFilters()
    return
  }
  if (!currentViewerMedia.value) return
  if (event.key === 'Escape') closeMediaViewer()
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    changeViewerMedia(-1)
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    changeViewerMedia(1)
  }
}

function changeViewerMedia(direction) {
  if (!viewerMedia.value.length) return
  viewerIndex.value = (viewerIndex.value + direction + viewerMedia.value.length) % viewerMedia.value.length
}

function clearReviewImages() {
  reviewImages.value.forEach((image) => URL.revokeObjectURL(image.previewUrl))
  reviewImages.value = []
}

function selectReviewImages(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (files.length > 6) {
    showNotice('แนบรูปรีวิวได้ไม่เกิน 6 รูป')
    return
  }
  const invalid = files.find((file) => !file.type.startsWith('image/') || file.size > 8 * 1024 * 1024)
  if (invalid) {
    showNotice('เลือกรูปภาพ JPG, PNG, WebP หรือ GIF ที่มีขนาดไม่เกิน 8 MB')
    return
  }
  clearReviewImages()
  reviewImages.value = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
}

async function loadProviderReviews(providerId) {
  const result = await api.providerReviews(providerId)
  if (selectedProvider.value?.id === providerId) {
    selectedReviews.value = result.reviews
    reviewableBookingIds.value = result.canReviewBookings
    if (!reviewForm.value.bookingId || !result.canReviewBookings.includes(reviewForm.value.bookingId)) {
      reviewForm.value.bookingId = result.canReviewBookings[0] || ''
    }
  }
  return true
}

async function submitReview() {
  if (!can('review:create')) {
    showNotice('กรุณาเข้าสู่ระบบในฐานะนักท่องเที่ยวเพื่อเขียนรีวิว')
    navigate('login')
    return
  }
  if (!selectedProvider.value || !availableReviewBookings.value.some((item) => item.id === reviewForm.value.bookingId)) {
    showNotice('รีวิวได้เมื่อการนัดหมายของคุณเสร็จสิ้นแล้วเท่านั้น')
    return
  }
  const providerId = selectedProvider.value.id
  const result = await safely(() => api.createReview(providerId, reviewForm.value), 'ส่งรีวิวไม่สำเร็จ')
  if (!result) return
  let uploadError
  for (const image of reviewImages.value) {
    try {
      await api.uploadReviewMedia(result.id, image.file)
    } catch (error) {
      uploadError = error
      break
    }
  }
  clearReviewImages()
  reviewForm.value = { bookingId: '', serviceRating: 5, valueRating: 5, comment: '' }
  const refreshed = await safely(() => loadProviderReviews(providerId), 'บันทึกรีวิวแล้ว แต่โหลดรายการรีวิวไม่สำเร็จ')
  if (refreshed === undefined) return
  showNotice(uploadError ? `บันทึกรีวิวแล้ว แต่แนบรูปภาพบางรายการไม่สำเร็จ: ${uploadError.message}` : 'ขอบคุณสำหรับรีวิวของคุณ')
}

function startBooking(provider = selectedProvider.value, serviceName = '') {
  selectedProvider.value = provider
  const offeredServices = providerServices(provider)
  booking.value = {
    mode: provider.modes.includes(profileBookingMode.value) ? profileBookingMode.value : provider.modes[0],
    service: offeredServices.some((service) => service.name === serviceName)
      ? serviceName
      : offeredServices[0]?.name || '',
    date: '',
    time: '',
    guestName: '',
    phone: '',
    address: '',
    note: '',
  }
  bookingReference.value = ''
  navigate('booking')
}

async function submitBooking() {
  if (currentRole.value !== 'buyer') {
    loginRole.value = 'buyer'
    showNotice('กรุณาเข้าสู่ระบบในฐานะนักท่องเที่ยวก่อนส่งคำขอนัดหมาย')
    navigate('login')
    return
  }
  const created = await safely(() => api.createBooking({
    providerId: selectedProvider.value.id,
    service: booking.value.service,
    mode: booking.value.mode,
    date: booking.value.date,
    time: booking.value.time,
    guestName: booking.value.guestName,
    phone: booking.value.phone,
    address: booking.value.address,
    note: booking.value.note,
  }))
  if (!created) return
  bookingReference.value = created.id
  bookings.value.unshift(created)
  navigate('account')
  showNotice(`ส่งคำขอนัดหมาย ${created.id} แล้ว`)
}

async function toggleFavorite(provider) {
  if (!can('favorite:manage')) {
    loginRole.value = 'buyer'
    showNotice('กรุณาเข้าสู่ระบบในฐานะนักท่องเที่ยวเพื่อบันทึกรายการโปรด')
    navigate('login')
    return
  }
  const updated = await safely(() => api.toggleFavorite(provider.id))
  if (updated) favorites.value = updated
}

async function submitApplication() {
  if (await safely(() => api.submitApplication(application.value))) {
    application.value = { name: '', line: '', province: '', gender: '', service: '', consent: false }
    showNotice('ส่งใบสมัครแล้ว ทีมงานจะตรวจสอบข้อมูลก่อนเผยแพร่')
  }
}

async function submitMembership() {
  const result = await safely(() => api.register({
    role: membership.value.role,
    name: membership.value.name,
    email: membership.value.email,
    phone: membership.value.phone,
    password: membership.value.password,
    businessName: membership.value.businessName,
    province: membership.value.province,
    service: membership.value.service,
    price: membership.value.price,
  }))
  if (!result) return
  applyUser(result.user)
  membership.value.password = ''
  await safely(loadData)

  if (result.user.role === 'seller') {
    sellerDashboardTab.value = 'overview'
    navigate('seller')
    showNotice('สมัครสมาชิกผู้ให้บริการแล้ว โปรไฟล์จะเผยแพร่หลังผ่านการตรวจสอบ')
    return
  }

  navigate('account')
  showNotice('สมัครสมาชิกผู้ใช้บริการเรียบร้อยแล้ว')
}

async function updateSellerBooking(item, status) {
  const updated = await safely(() => api.updateBooking(item.id, status))
  if (updated) {
    bookings.value = bookings.value.map((entry) => (entry.id === updated.id ? updated : entry))
    showNotice(`อัปเดตสถานะนัดหมาย ${item.id} แล้ว`)
  }
}

async function approveApplication(item) {
  if (await safely(() => api.approveApplication(item.id))) {
    await safely(loadData)
    showNotice('อนุมัติใบสมัครและเผยแพร่โปรไฟล์แล้ว')
  }
}

async function rejectApplication(item) {
  if (await safely(() => api.rejectApplication(item.id))) {
    applications.value = applications.value.filter((entry) => entry.id !== item.id)
  }
}

function showNotice(message) {
  notice.value = message
  window.setTimeout(() => { notice.value = '' }, 3200)
}

async function resendVerification() {
  try {
    await api.resendVerification()
    showNotice('ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว')
  } catch (error) {
    showNotice(error.message || 'ส่งอีเมลไม่สำเร็จ')
  }
}

function formatDate(date) {
  if (!date) return 'ยังไม่ได้เลือกวันที่'
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function formatDateTime(date) {
  if (!date) return 'ไม่ระบุ'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

function scrollToProviders() {
  navigate('search')
}

</script>

<template>
  <div ref="appRoot" class="lux-app" :class="[{ 'seller-dashboard': view === 'seller' }, `role-theme-${currentRole}`]">
    <div class="lux-scroll-progress" aria-hidden="true"></div>
    <div class="lux-topline">
      <span class="lux-topline-right"><i></i> เคารพขอบเขตและความเป็นส่วนตัว <span class="lux-topline-sep">·</span> TH / EN</span>
    </div>

    <header class="lux-header">
      <button class="lux-mobile-menu" type="button" aria-label="เปิดเมนู" @click="isCompactMenuOpen = !isCompactMenuOpen">☰</button>
      <a class="lux-logo" href="#" @click.prevent="navigate('home')">
        <span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>CONNECT ON YOUR TERMS</small></span>
      </a>
      <nav class="lux-nav" :class="{ 'lux-nav-open': isCompactMenuOpen }" aria-label="เมนูหลัก">
        <button :class="{ selected: view === 'home' }" @click="navigate('home')">หน้าแรก</button>
        <button :class="{ selected: view === 'search' }" @click="navigate('search')">ค้นหาบริการ</button>
        <button v-if="currentRole === 'buyer'" :class="{ selected: view === 'account' }" @click="navigate('account')">การจองของฉัน</button>
        <button v-if="currentRole === 'seller'" :class="{ selected: view === 'seller' }" @click="navigate('seller')">ศูนย์จัดการผู้ขาย</button>
        <button v-if="currentRole === 'admin'" :class="{ selected: view === 'admin' }" @click="navigate('admin')">แผงควบคุมผู้ดูแล</button>
      </nav>
      <div class="lux-header-actions">
        <template v-if="!currentUser">
          <button class="lux-login-shortcut" @click="navigate('login')">เข้าสู่ระบบ</button>
          <button class="lux-membership-shortcut" @click="navigate('membership')">สมัครสมาชิก</button>
          <button class="lux-admin-shortcut" @click="openAdmin">สำหรับผู้ดูแล</button>
        </template>
        <template v-else>
          <span class="lux-role-badge" :class="`role-${currentRole}`">{{ roleLabel }}</span>
          <button v-if="currentRole === 'buyer'" class="lux-icon-button" aria-label="รายการโปรด" title="รายการโปรด" @click="accountTab = 'favorites'; navigate('account')">♡</button>
          <button class="lux-account-button" @click="openOwnArea"><span class="lux-user-avatar" :class="`role-${currentRole}`">{{ currentUser.name.slice(0, 1) }}</span><span>{{ accountMenuLabel }}</span><span class="lux-chevron">⌄</span></button>
          <button class="lux-login-shortcut" @click="logout">ออกจากระบบ</button>
        </template>
      </div>
    </header>
    <div v-if="currentUser && currentUser.emailVerified === false && currentRole !== 'admin'" class="lux-verify-banner" role="status"><span>✉ กรุณายืนยันอีเมล <strong>{{ currentUser.email }}</strong> ภายใน 3 วัน มิฉะนั้นบัญชีจะถูกลบอัตโนมัติ</span><button type="button" @click="resendVerification">ส่งลิงก์ยืนยันอีกครั้ง</button></div>

    <main v-if="view === 'home'" class="lux-home">
      <section class="lux-hero">
        <div class="lux-hero-copy">
          <div class="lux-kicker"><span></span> MEET ON YOUR TERMS</div>
          <h1>นัดพบคนที่ใช่<br />ในแบบ<span>ที่คุณเลือก</span></h1>
          <p>แพลตฟอร์มนัดหมายผู้ให้บริการอิสระสำหรับผู้ใหญ่ 18+<br class="lux-desktop-only" />เลือกโปรไฟล์ รูปแบบนัดพบ และพูดคุยขอบเขตให้ชัดเจนก่อนยืนยันทุกครั้ง</p>
          <button class="lux-button lux-button-primary lux-hero-cta" @click="scrollToProviders">ค้นหาผู้ให้บริการ <span>↗</span></button>
          <div class="lux-hero-proof"><div class="lux-proof-seal">✳</div><div><strong>เลือกและตกลงกันได้ก่อนนัด</strong><span>ความยินยอมและขอบเขตต้องชัดเจนเสมอ</span></div></div>
        </div>
        <div class="lux-hero-visual" aria-label="ภาพบรรยากาศพื้นที่พักผ่อน">
          <div class="lux-visual-arch"><div class="lux-arch-window"></div><div class="lux-plant plant-left"></div><div class="lux-plant plant-right"></div><div class="lux-visual-table"></div></div>
          <div class="lux-floating-card"><span class="lux-floating-icon">✦</span><div><small>YOUR CHOICE</small><strong>นัดหมายในแบบคุณ</strong></div></div>
          <div class="lux-visual-index">01 <span></span> CONNECT WITH CONFIDENCE</div>
        </div>
        <div class="lux-hero-vertical">NUANIA · THAILAND</div>
      </section>

      <section class="lux-discovery" data-reveal>
        <div class="lux-section-intro" data-reveal>
          <div><div class="lux-kicker"><span></span> FIND YOUR CONNECTION</div><h2>ค้นหาผู้ให้บริการ<br class="lux-mobile-only" />ที่<span>ตรงกับคุณ</span></h2></div>
          <p>เลือกพื้นที่และรูปแบบนัดพบที่สะดวก<br />คุยรายละเอียดและขอบเขตก่อนยืนยัน</p>
        </div>
        <div class="lux-quick-search" data-reveal>
          <label><span>⌕</span><div><small>ค้นหาผู้ให้บริการหรือพื้นที่</small><input v-model="searchName" placeholder="เช่น ร่วมกิจกรรม, สุขุมวิท" @focus="view = 'home'" /></div></label>
          <label><span>⌖</span><div><small>เลือกจังหวัด</small><select v-model="selectedProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></div></label>
          <label><span>◷</span><div><small>รูปแบบการนัดพบ</small><select v-model="selectedMode"><option value="">ทุกรูปแบบ</option><option v-for="mode in availableAppointmentModes" :key="mode">{{ mode }}</option></select></div></label>
          <button class="lux-button lux-button-olive" @click="scrollToProviders">ค้นหา <span>→</span></button>
        </div>
        <div class="lux-category-row" data-reveal><span>สำรวจรูปแบบ</span><button @click="selectedService = ''; navigate('search')">ทั้งหมด</button><button @click="selectedService = 'พบปะพูดคุย'; navigate('search')">พบปะพูดคุย</button><button @click="selectedService = 'ร่วมกิจกรรม'; navigate('search')">ร่วมกิจกรรม</button><button @click="selectedService = 'งานอีเวนต์'; navigate('search')">งานอีเวนต์</button><button @click="selectedService = 'ไลฟ์สไตล์'; navigate('search')">ไลฟ์สไตล์</button></div>
      </section>

      <section class="lux-home-guide" aria-labelledby="home-guide-heading">
        <div class="lux-home-guide-heading" data-reveal>
          <div><div class="lux-kicker"><span></span> CHOOSE YOUR EXPERIENCE</div><h2 id="home-guide-heading">เลือกนัดหมายในแบบ<span>ที่เหมาะกับคุณ</span></h2><p>ทำความรู้จักรูปแบบบริการก่อนค้นหา แล้วพูดคุยรายละเอียดให้ตรงกันก่อนยืนยัน</p></div>
          <button class="lux-text-link" @click="navigate('search')">ค้นหาบริการ <span>↗</span></button>
        </div>
        <div class="lux-home-guide-grid">
          <article class="lux-home-guide-card" data-reveal>
            <span class="lux-home-guide-number">01</span><span class="lux-home-guide-icon" aria-hidden="true">◎</span>
            <h3>พบปะพูดคุย</h3><p>เลือกเวลาพูดคุยและทำความรู้จัก โดยตกลงหัวข้อและขอบเขตที่สบายใจทั้งสองฝ่าย</p>
            <button @click="selectedService = 'พบปะพูดคุย'; navigate('search')">ดูรูปแบบนี้ <span>↗</span></button>
          </article>
          <article class="lux-home-guide-card" data-reveal>
            <span class="lux-home-guide-number">02</span><span class="lux-home-guide-icon" aria-hidden="true">◇</span>
            <h3>ร่วมกิจกรรม</h3><p>วางแผนกิจกรรมและระยะเวลาให้ชัดเจน พร้อมเลือกสถานที่และรูปแบบที่เหมาะกับคุณ</p>
            <button @click="selectedService = 'ร่วมกิจกรรม'; navigate('search')">ดูรูปแบบนี้ <span>↗</span></button>
          </article>
          <article class="lux-home-guide-card" data-reveal>
            <span class="lux-home-guide-number">03</span><span class="lux-home-guide-icon" aria-hidden="true">✳</span>
            <h3>งานอีเวนต์</h3><p>นัดหมายล่วงหน้าและพูดคุยวัน เวลา สถานที่ รวมถึงรายละเอียดที่คาดหวังให้ครบถ้วน</p>
            <button @click="selectedService = 'งานอีเวนต์'; navigate('search')">ดูรูปแบบนี้ <span>↗</span></button>
          </article>
        </div>
        <p class="lux-home-guide-note">รายละเอียดและเงื่อนไขขึ้นอยู่กับแต่ละบริการ โปรดตรวจสอบและตกลงกันก่อนนัดหมาย</p>
      </section>

      <section class="lux-experience" data-reveal>
        <div class="lux-experience-art"><div class="lux-experience-circle">N<span>✳</span></div><div class="lux-experience-caption">NUANIA · CONNECT ON YOUR TERMS</div></div>
        <div class="lux-experience-copy"><div class="lux-kicker"><span></span> CLEAR TERMS, BETTER CONNECTIONS</div><h2>นัดหมายอย่างมั่นใจ<br />เริ่มจาก<span>ความชัดเจน</span></h2><p>NuaNia เชื่อมต่อผู้ใช้บริการกับผู้ให้บริการอิสระ แสดงรายละเอียดและราคาให้พิจารณา พร้อมสนับสนุนการสื่อสารเรื่องความยินยอมและขอบเขตการนัดหมาย</p><div class="lux-value-list"><span><i>01</i> อ่านโปรไฟล์และรายละเอียดก่อนเลือก</span><span><i>02</i> ตกลงเวลา สถานที่ และราคาให้ชัดเจน</span><span><i>03</i> เคารพความยินยอมและความเป็นส่วนตัว</span></div><button class="lux-text-link" @click="navigate('search')">ค้นหาผู้ให้บริการ <span>↗</span></button></div>
      </section>

      <section class="lux-partner-banner" data-reveal><div class="lux-partner-mark">N</div><div><small>FOR INDEPENDENT PROVIDERS</small><h2>ให้โปรไฟล์ของคุณ<br />เข้าถึงคนที่ใช่</h2><p>กำหนดรูปแบบบริการ ราคา และขอบเขตได้ด้วยตัวเอง</p></div><button class="lux-button lux-button-light" @click="membership.role = 'seller'; navigate('membership')">ลงโปรไฟล์ผู้ให้บริการ <span>↗</span></button><span class="lux-partner-bg">NUANIA</span></section>
    </main>

    <main v-else-if="view === 'search'" class="lux-page lux-search-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ค้นหาผู้ให้บริการ</span></div>
      <button ref="searchFilterTrigger" class="lux-search-filter-trigger" type="button" @click="openSearchFilters"><span class="lux-search-filter-icon">⌕</span><span class="lux-search-filter-copy"><strong>ค้นหาบริการ</strong><small>{{ appliedSearchFilters.name || appliedSearchFilters.province || appliedSearchFilters.gender || appliedSearchFilters.mode || appliedSearchFilters.service ? 'ปรับคำค้นหาและตัวกรอง' : 'ค้นหาผู้ให้บริการ ชื่อบริการ หรือพื้นที่' }}</small></span><span v-if="appliedSearchFilters.province || appliedSearchFilters.gender || appliedSearchFilters.mode || appliedSearchFilters.service" class="lux-search-filter-active">มีตัวกรอง</span><span class="lux-search-filter-arrow">⌄</span></button>
      <div class="lux-page-heading"><div><div class="lux-kicker"><span></span> FIND YOUR CONNECTION</div><h1>ค้นหาผู้ให้บริการ<span>อิสระ</span></h1><p>เลือกดูโปรไฟล์ รูปแบบนัดพบ และรายละเอียดบริการทั่วประเทศไทย</p></div><div class="lux-result-note"><strong>{{ visibleProviders.length.toString().padStart(2, '0') }}</strong><span>โปรไฟล์ที่ตรงกับคุณ</span></div></div>
      <section class="lux-search-results"><div class="lux-results-toolbar"><div><span>แสดง</span> {{ visibleProviders.length }} โปรไฟล์ <span>ผู้ให้บริการอิสระ</span></div><label>เรียงตาม <select v-model="sortBy"><option>แนะนำ</option><option>คะแนนสูงสุด</option><option>ราคา: ต่ำไปสูง</option></select></label></div>
          <div class="lux-provider-grid lux-results-grid"><article v-for="provider in visibleProviders" :key="provider.id" class="lux-provider-card"><div class="lux-card-image" :class="[provider.visual, { 'lux-card-image-has-media': providerPreviewMedia(provider) }]" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)"><img v-if="providerPreviewMedia(provider)?.type === 'image'" class="lux-card-photo" :src="providerPreviewMedia(provider).url" :alt="`ภาพแนะนำของ ${provider.name}`" loading="lazy" /><video v-else-if="providerPreviewMedia(provider)" class="lux-card-photo" :src="providerPreviewMedia(provider).url" muted autoplay loop playsinline :aria-label="`วิดีโอแนะนำของ ${provider.name}`"></video><span v-else class="lux-scene-symbol">{{ provider.initials }}</span><button class="lux-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)">{{ favorites.includes(provider.id) ? '♥' : '♡' }}</button><span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span></div><div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">PROFILE</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} ปี · {{ provider.area }}</small></button><div class="lux-card-foot"><button @click="openProfile(provider)">รายละเอียด <span>↗</span></button></div></div></article>
            <div v-if="!visibleProviders.length" class="lux-empty"><span>✳</span><h3>ยังไม่พบโปรไฟล์ที่ตรงใจ</h3><p>ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p><button class="lux-button lux-button-primary" @click="clearSearchFilters">ล้างตัวกรอง</button></div>
          </div>
      </section>
      <div v-if="isSearchFilterOpen" class="lux-search-filter-modal" role="dialog" aria-modal="true" aria-labelledby="search-filter-title" @click.self="closeSearchFilters">
        <section class="lux-search-filter-dialog">
          <header class="lux-search-filter-header"><div><span class="lux-search-filter-eyebrow">FIND YOUR MATCH</span><h2 id="search-filter-title">ค้นหาบริการ</h2><p>เลือกตัวกรอง แล้วกดค้นหาเพื่อดูโปรไฟล์ที่ตรงใจ</p></div><button type="button" aria-label="ปิดตัวกรอง" @click="closeSearchFilters">×</button></header>
          <label class="lux-filter-search lux-search-modal-query"><span>⌕</span><input ref="searchFilterInput" v-model="searchName" placeholder="ค้นหาชื่อ บริการ หรือพื้นที่" /></label>
          <div class="lux-search-modal-selects"><label class="lux-filter-select"><span>จังหวัด</span><select v-model="selectedProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label class="lux-filter-select"><span>อัตลักษณ์ทางเพศ</span><select v-model="selectedGender"><option value="">ทั้งหมด</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label></div>
          <fieldset class="lux-filter-group lux-filter-mode"><legend>รูปแบบการนัดพบ</legend><div class="lux-search-modal-mode-options"><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="" /><span>ทั้งหมด</span></label><label v-for="mode in availableAppointmentModes" :key="mode" class="lux-check-row"><input v-model="selectedMode" type="radio" :value="mode" /><span>{{ mode === 'ที่ร้าน' ? 'สถานที่นัดพบ' : mode === 'นอกสถานที่' ? 'นัดตามพื้นที่ที่ตกลง' : mode }}</span></label></div></fieldset>
          <fieldset class="lux-filter-group lux-filter-services"><legend>รูปแบบบริการ</legend><div class="lux-search-modal-service-options"><label v-for="service in [{ value: '', label: 'ทั้งหมด' }, { value: 'พบปะพูดคุย', label: 'พบปะพูดคุย' }, { value: 'ร่วมกิจกรรม', label: 'ร่วมกิจกรรม' }, { value: 'งานอีเวนต์', label: 'งานอีเวนต์' }, { value: 'ไลฟ์สไตล์', label: 'ไลฟ์สไตล์' }]" :key="service.value || 'all'" class="lux-check-row"><input v-model="selectedService" type="radio" :value="service.value" /><span>{{ service.label }}</span></label></div></fieldset>
          <footer class="lux-search-filter-footer"><button type="button" class="lux-search-reset" @click="resetSearchFilters">ล้างตัวกรอง</button><button type="button" class="lux-button lux-button-primary" @click="applySearchFilters">ค้นหาโปรไฟล์ <span>→</span></button></footer>
        </section>
      </div>
    </main>

    <main v-else-if="view === 'profile' && selectedProvider" class="lux-page lux-profile-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><button v-if="currentRole === 'admin'" @click="adminTab = 'providers'; navigate('admin')">พาร์ตเนอร์</button><button v-else @click="navigate('search')">ค้นหาบริการ</button><span>/</span><span>{{ selectedProvider.name }}</span></div>
      <div class="lux-profile-layout"><section class="lux-profile-main"><div class="lux-profile-identity"><div class="lux-profile-monogram" :class="[selectedProvider.visual, { 'has-profile-image': featuredProfileImage }]"><img v-if="featuredProfileImage" :src="featuredProfileImage.url" :alt="`รูปโปรไฟล์ ${selectedProvider.name}`" /><span v-else>{{ selectedProvider.initials }}</span></div><div class="lux-profile-title"><div class="lux-profile-label"><span class="lux-verified">PROVIDER PROFILE</span><span v-if="reviewSummary">★ {{ reviewSummary.service }} / 5 <small>({{ reviewSummary.count }} รีวิว)</small></span><span v-else>ยังไม่มีคะแนนรีวิว</span></div><h1>{{ selectedProvider.name }}<small>, {{ selectedProvider.age }}</small></h1><p>ผู้ให้บริการอิสระ · {{ selectedProvider.area }}, {{ selectedProvider.province }}</p></div><button class="lux-heart lux-profile-heart" :class="{ loved: favorites.includes(selectedProvider.id) }" :aria-label="favorites.includes(selectedProvider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click="toggleFavorite(selectedProvider)">{{ favorites.includes(selectedProvider.id) ? '♥' : '♡' }}</button></div>
          <div v-if="selectedProvider.media?.length" class="lux-profile-section lux-promo-gallery"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> PROVIDER MOMENTS</div><h2>ภาพและวิดีโอแนะนำโปรไฟล์</h2></div><span>{{ selectedProvider.media.length }} รายการ · แตะเพื่อขยาย</span></div><div class="lux-promo-grid"><button v-for="(media, index) in selectedProvider.media" :key="media.id" class="lux-promo-item" type="button" :aria-label="`ขยาย${media.type === 'image' ? 'รูปภาพ' : 'วิดีโอ'} ${media.name}`" @click="openMediaViewer(selectedProvider.media, index)"><img v-if="media.type === 'image'" :src="media.url" :alt="media.name" loading="lazy" /><template v-else><video :src="media.url" preload="metadata" playsinline :aria-label="media.name"></video><span class="lux-promo-play" aria-hidden="true">▶</span></template></button></div></div>
          <div class="lux-profile-section"><div class="lux-kicker"><span></span> ABOUT THE PROVIDER</div><h2>คุยรายละเอียดและ<span>ขอบเขตให้ชัดเจน</span></h2><p class="lux-provider-about-copy">{{ selectedProvider.description }}</p><p class="lux-provider-about-guidance">โปรดพูดคุยเรื่องเวลา สถานที่ ราคา และขอบเขตให้ตรงกันก่อนยืนยัน ทุกฝ่ายสามารถปฏิเสธหรือยุติการนัดหมายได้</p><div class="lux-tag-row"><span v-for="tag in selectedProvider.tags" :key="tag">{{ tag }}</span></div></div>
          <div class="lux-profile-section lux-review-section">
            <div class="lux-section-title"><div><div class="lux-kicker"><span></span> COMMUNITY NOTES</div><h2>ประสบการณ์จากนักท่องเที่ยว</h2><small class="lux-demo-review-note">รีวิวตัวอย่างสำหรับสาธิตการใช้งานจะแสดงป้าย “ตัวอย่าง”</small></div><span v-if="reviewSummary">บริการ {{ reviewSummary.service }} ★ · คุ้มค่าเงิน {{ reviewSummary.value }} ★ · {{ reviewSummary.count }} รีวิว</span><span v-else>ยังไม่มีรีวิว</span></div>
            <form v-if="can('review:create') && availableReviewBookings.length" class="lux-review-form" @submit.prevent="submitReview">
              <h3>เขียนรีวิวหลังใช้บริการ</h3>
              <label class="lux-form-label">นัดหมายที่เสร็จสิ้น<select v-model="reviewForm.bookingId" required><option v-for="item in availableReviewBookings" :key="item.id" :value="item.id">{{ item.service }} · {{ formatDate(item.date) }}</option></select></label>
              <div class="lux-review-ratings">
                <div v-for="rating in [{ key: 'serviceRating', label: 'บริการ' }, { key: 'valueRating', label: 'คุ้มค่าเงิน' }]" :key="rating.key" class="lux-review-rating"><span>{{ rating.label }}</span><div role="group" :aria-label="`ให้คะแนน${rating.label}`"><button v-for="star in 5" :key="star" type="button" :class="{ active: star <= reviewForm[rating.key] }" :aria-label="`${star} ดาว`" :aria-pressed="reviewForm[rating.key] === star" @click="reviewForm[rating.key] = star">★</button></div></div>
              </div>
              <label class="lux-form-label">รายละเอียดประสบการณ์<textarea v-model.trim="reviewForm.comment" rows="4" maxlength="2000" minlength="2" placeholder="แบ่งปันประสบการณ์อย่างสุภาพและตรงตามจริง" required></textarea></label>
              <label class="lux-review-upload">เพิ่มรูปภาพ (ไม่บังคับ)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple @change="selectReviewImages" /><small>แนบได้ไม่เกิน 6 รูป ขนาดไม่เกิน 8 MB ต่อรูป</small></label>
              <div v-if="reviewImages.length" class="lux-review-image-previews"><img v-for="image in reviewImages" :key="image.previewUrl" :src="image.previewUrl" alt="ตัวอย่างรูปที่แนบในรีวิว" /></div>
              <button class="lux-button lux-button-primary" type="submit">ส่งรีวิว</button>
            </form>
            <p v-else-if="currentRole === 'guest'" class="lux-review-gate">เข้าสู่ระบบในฐานะนักท่องเที่ยวและรีวิวได้หลังจากนัดหมายเสร็จสิ้นแล้ว <button type="button" @click="navigate('login')">เข้าสู่ระบบ</button></p>
            <p v-else-if="currentRole === 'buyer'" class="lux-review-gate">รีวิวได้หลังจากนัดหมายกับผู้บริการรายนี้เสร็จสิ้นแล้ว</p>
            <div v-if="selectedReviews.length" class="lux-review-list">
              <article v-for="review in selectedReviews" :key="review.id" class="lux-review-card">
                <div class="lux-review-card-head"><span><strong>{{ review.userName }}</strong><small v-if="review.isDemo" class="lux-review-demo-badge">ตัวอย่าง</small></span><time>{{ new Date(review.createdAt).toLocaleDateString('th-TH') }}</time></div>
                <div class="lux-review-score"><span>บริการ <span class="lux-review-stars" :aria-label="`${review.serviceRating} จาก 5 ดาว`"><span v-for="star in 5" :key="star" :class="{ active: star <= review.serviceRating }">★</span></span></span><span>คุ้มค่าเงิน <span class="lux-review-stars" :aria-label="`${review.valueRating} จาก 5 ดาว`"><span v-for="star in 5" :key="star" :class="{ active: star <= review.valueRating }">★</span></span></span></div>
                <p>{{ review.comment }}</p>
                <div v-if="review.media.length" class="lux-review-media-row"><button v-for="(media, index) in review.media" :key="media.id" type="button" :aria-label="`ขยายรูปรีวิว ${index + 1}`" @click="openMediaViewer(review.media, index)"><img :src="media.url" :alt="media.name" loading="lazy" /></button></div>
              </article>
            </div>
            <p v-else class="lux-review-empty">ยังไม่มีความคิดเห็นจากนักท่องเที่ยว</p>
          </div>
        </section>
        <aside class="lux-booking-card lux-available-appointments"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> AVAILABLE APPOINTMENTS</div><h2>รูปแบบนัดหมาย</h2></div><span>ราคาแต่ละรูปแบบ</span></div><article v-for="(service, index) in providerServices(selectedProvider)" :key="service.name" class="lux-service-row"><div class="lux-service-number">{{ String(index + 1).padStart(2, '0') }}</div><div class="lux-service-name"><strong>{{ service.name }}</strong><span>{{ service.duration }}</span><p>{{ service.description }}</p></div><div class="lux-service-price">฿{{ Number(service.price).toLocaleString() }}</div><button class="lux-outline-button" @click="startBooking(selectedProvider, service.name)">เลือก</button></article></aside></div>
      <div v-if="currentViewerMedia" class="lux-media-viewer" role="dialog" aria-modal="true" aria-label="ตัวแสดงภาพและวิดีโอ" tabindex="-1" @click.self="closeMediaViewer">
        <button class="lux-media-viewer-close" type="button" aria-label="ปิดภาพขยาย" @click="closeMediaViewer">×</button>
        <button v-if="viewerMedia.length > 1" class="lux-media-viewer-arrow previous" type="button" aria-label="สื่อก่อนหน้า" @click="changeViewerMedia(-1)">‹</button>
        <div class="lux-media-viewer-stage"><img v-if="currentViewerMedia.type === 'image'" :src="currentViewerMedia.url" :alt="currentViewerMedia.name" /><video v-else :src="currentViewerMedia.url" controls autoplay playsinline></video><span>{{ viewerIndex + 1 }} / {{ viewerMedia.length }}</span></div>
        <button v-if="viewerMedia.length > 1" class="lux-media-viewer-arrow next" type="button" aria-label="สื่อถัดไป" @click="changeViewerMedia(1)">›</button>
      </div>
    </main>

    <main v-else-if="view === 'booking' && selectedProvider" class="lux-page lux-booking-page">
      <div class="lux-breadcrumb"><button @click="navigate('search')">ค้นหาบริการ</button><span>/</span><button @click="navigate('profile')">{{ selectedProvider.name }}</button><span>/</span><span>นัดหมาย</span></div>
      <div class="lux-booking-heading"><div class="lux-kicker"><span></span> YOUR TIME, YOUR TERMS</div><h1>ยืนยัน<span>การนัดหมาย</span></h1><p>ตรวจสอบรูปแบบ เวลา สถานที่ และข้อตกลงก่อนส่งคำขอ</p></div>
      <div class="lux-booking-layout"><form class="lux-booking-form" @submit.prevent="submitBooking">
        <section class="lux-form-section"><div class="lux-step-heading"><span>01</span><div><h2>เลือกรูปแบบนัดพบ</h2><p>เลือกสถานที่ที่ทั้งสองฝ่ายสะดวกและปลอดภัย</p></div></div><div class="lux-mode-options"><button v-for="mode in selectedProvider.modes" :key="mode" type="button" :class="{ active: booking.mode === mode }" @click="booking.mode = mode"><span class="lux-mode-icon">{{ mode === 'ที่ร้าน' ? '⌂' : mode === 'นอกสถานที่' ? '⌖' : '◇' }}</span><strong>{{ mode }}</strong><small>{{ mode === 'ที่ร้าน' ? 'ใช้สถานที่ตามที่ระบุในโปรไฟล์' : mode === 'นอกสถานที่' ? 'พูดคุยและยืนยันสถานที่ก่อนนัด · ค่าบริการเดินทาง ฿250' : 'รายละเอียดของรูปแบบนี้จะยืนยันร่วมกันก่อนนัด' }}</small><i>◉</i></button></div>
          <div v-if="booking.mode === 'ที่ร้าน'" class="lux-selected-venue"><span>⌖</span><div><small>สถานที่นัดพบตามโปรไฟล์</small><strong>{{ selectedProvider.venue }}</strong><small>{{ selectedProvider.area }}, {{ selectedProvider.province }}</small></div><button type="button" @click="navigate('profile')">ดูโปรไฟล์ ↗</button></div>
          <label v-else-if="booking.mode === 'นอกสถานที่'" class="lux-form-label">พื้นที่/สถานที่ที่ต้องการ<textarea v-model.trim="booking.address" rows="2" placeholder="ระบุพื้นที่นัดพบที่ตกลงกัน" required></textarea><small>อย่าใส่ข้อมูลส่วนตัวที่ไม่จำเป็น · ตกลงสถานที่โดยตรงก่อนยืนยัน</small></label><p v-else class="lux-mode-note">โปรดตกลงรายละเอียดของรูปแบบนี้กับผู้บริการก่อนส่งคำขอ</p>
        </section>
        <section class="lux-form-section"><div class="lux-step-heading"><span>02</span><div><h2>เลือกรูปแบบและเวลา</h2><p>เลือกบริการและเวลาที่ได้ตกลงกันไว้</p></div></div><label class="lux-form-label">รูปแบบบริการ<select v-model="booking.service" required><option v-for="service in providerServices(selectedProvider)" :key="service.name" :value="service.name">{{ service.name }} · {{ service.duration }} · ฿{{ Number(service.price).toLocaleString() }}</option></select></label><div class="lux-form-grid"><label class="lux-form-label">วันที่นัด<input v-model="booking.date" type="date" :min="new Date().toISOString().slice(0, 10)" required /></label><label class="lux-form-label">เวลานัด<select v-model="booking.time" required><option value="" disabled>เลือกช่วงเวลา</option><option>10:00</option><option>12:00</option><option>14:00</option><option>16:00</option><option>18:00</option><option>20:00</option></select></label></div><label class="lux-form-label">รายละเอียดหรือข้อตกลงเพิ่มเติม <span class="lux-optional">(ไม่บังคับ)</span><textarea v-model.trim="booking.note" rows="2" maxlength="240" placeholder="รายละเอียดที่ทั้งสองฝ่ายตกลงร่วมกัน"></textarea></label></section>
        <section class="lux-form-section"><div class="lux-step-heading"><span>03</span><div><h2>ข้อมูลผู้ใช้บริการ</h2><p>ใช้สำหรับยืนยันการนัดหมายเท่านั้น</p></div></div><div class="lux-form-grid"><label class="lux-form-label">ชื่อที่ใช้ติดต่อ<input v-model.trim="booking.guestName" type="text" autocomplete="name" placeholder="ชื่อที่ต้องการให้เรียก" required /></label><label class="lux-form-label">เบอร์โทรศัพท์<input v-model.trim="booking.phone" type="tel" inputmode="numeric" pattern="[0-9]{9,10}" maxlength="10" autocomplete="tel" placeholder="08XXXXXXXX" required /></label></div><label class="lux-consent"><input type="checkbox" required /><span>ข้าพเจ้ามีอายุ 18 ปีขึ้นไป และยืนยันว่าการนัดหมายเป็นไปโดยสมัครใจ ตกลงขอบเขตกันชัดเจน</span></label></section>
        <button class="lux-button lux-button-primary lux-confirm-button" type="submit">ส่งคำขอนัดหมาย <span>→</span></button><p class="lux-secure-note">ต้นแบบจำลอง · ไม่มีการตัดเงินหรือชำระเงินจริง</p>
      </form><aside class="lux-summary-card"><div class="lux-summary-header"><span>YOUR SELECTION</span><button @click="navigate('profile')">แก้ไข</button></div><div class="lux-summary-provider"><div class="lux-summary-avatar" :class="selectedProvider.visual">{{ selectedProvider.initials }}</div><div><strong>{{ selectedProvider.name }}</strong><span>✦ {{ selectedProvider.rating }} · {{ selectedProvider.province }}</span></div></div><div class="lux-summary-detail"><span>บริการ</span><strong>{{ booking.service || selectedServiceOption.name }} · {{ selectedServiceOption.duration }}</strong></div><div class="lux-summary-detail"><span>รูปแบบ</span><strong>{{ booking.mode }}{{ booking.mode === 'นอกสถานที่' ? ' · ' + (booking.address || 'ระบุที่อยู่') : '' }}</strong></div><div class="lux-summary-detail"><span>วันและเวลา</span><strong>{{ formatDate(booking.date) }}{{ booking.time ? ' · ' + booking.time : '' }}</strong></div><div class="lux-summary-price"><span>ราคาบริการ <small>รวมค่าเดินทาง (ถ้ามี)</small></span><strong>฿{{ bookingPrice.toLocaleString() }}</strong></div><div class="lux-summary-foot">ชำระหลังจากผู้ให้บริการยืนยัน<br /><span>ไม่มีการเรียกเก็บเงินในขั้นตอนนี้</span></div></aside></div>
    </main>

    <main v-else-if="view === 'login'" class="lux-page lux-login-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>เข้าสู่ระบบ</span></div>
      <section class="lux-login-card">
        <div class="lux-kicker"><span></span> WELCOME TO NUANIA</div>
        <h1>เข้าสู่<span>ระบบ</span></h1>
        <p>เลือกประเภทสมาชิกเพื่อเข้าสู่ระบบ</p>
        <div class="lux-login-roles" role="group" aria-label="ประเภทสมาชิก">
          <button type="button" :class="{ active: loginRole === 'buyer' }" @click="loginRole = 'buyer'">นักท่องเที่ยว</button>
          <button type="button" :class="{ active: loginRole === 'seller' }" @click="loginRole = 'seller'">ผู้บริการ</button>
          <button type="button" :class="{ active: loginRole === 'admin' }" @click="loginRole = 'admin'">ผู้ดูแล</button>
        </div>
        <form class="lux-login-form" @submit.prevent="submitLogin">
          <label class="lux-login-field">
            <span>อีเมล</span>
            <input v-model="loginForm.email" type="email" placeholder="you@example.com" required autocomplete="username" />
          </label>
          <label class="lux-login-field">
            <span>รหัสผ่าน</span>
            <input v-model="loginForm.password" type="password" placeholder="กรอกรหัสผ่าน" required autocomplete="current-password" />
          </label>
          <button class="lux-login-submit" type="submit">เข้าสู่ระบบ</button>
          <p class="lux-google-demo">บัญชีทดสอบ: admin@example.com / admin123 · mali@example.com / seller123 · somchai@example.com / buyer123</p>
        </form>
        <template v-if="loginRole === 'buyer'">
          <div class="lux-login-divider"><span>หรือ</span></div>
          <button class="lux-google-button" type="button" @click="startGoogleLogin"><span class="lux-google-mark" aria-hidden="true">G</span>เข้าสู่ระบบด้วย Google</button>
        </template>
        <div class="lux-login-signup">ยังไม่มีบัญชี? <button @click="navigate('membership')">สมัครสมาชิก</button></div>
      </section>
    </main>

    <main v-else-if="view === 'membership'" class="lux-page lux-membership-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>สมัครสมาชิก</span></div>
      <div class="lux-membership-heading"><div class="lux-kicker"><span></span> JOIN NUANIA</div><h1>สร้างบัญชี<span>ผู้ใช้บริการ</span></h1><p>สำหรับผู้ใหญ่ 18+ ที่ต้องการค้นหาและนัดหมายกับผู้ให้บริการอิสระ</p></div>
      <form class="lux-membership-form" @submit.prevent="submitMembership">
        <fieldset class="lux-role-picker"><legend>คุณต้องการใช้งานในฐานะใด?</legend>
          <label class="lux-role-option" :class="{ active: membership.role === 'buyer' }"><input v-model="membership.role" type="radio" value="buyer" /><span class="lux-role-icon">⌕</span><span class="lux-role-copy"><strong>นักท่องเที่ยว</strong><small>ค้นหาโปรไฟล์ เลือกบริการ นัดหมาย และจัดการรายการโปรด</small></span><span class="lux-role-check">✓</span></label>
          <label class="lux-role-option" :class="{ active: membership.role === 'seller' }"><input v-model="membership.role" type="radio" value="seller" /><span class="lux-role-icon">✳</span><span class="lux-role-copy"><strong>ผู้บริการ</strong><small>สร้างโปรไฟล์ กำหนดราคาและขอบเขต พร้อมจัดการคำขอนัดหมาย</small></span><span class="lux-role-check">✓</span></label>
        </fieldset>
        <div class="lux-membership-fields">
          <label class="lux-form-label">{{ membership.role === 'seller' ? 'ชื่อผู้ให้บริการ / ชื่อร้าน' : 'ชื่อที่ใช้แสดง' }}<input v-model.trim="membership.name" type="text" autocomplete="name" maxlength="40" placeholder="ระบุชื่อ" required /></label>
          <label class="lux-form-label">อีเมล<input v-model.trim="membership.email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com" required /></label>
          <label class="lux-form-label">เบอร์โทรศัพท์<input v-model.trim="membership.phone" type="tel" inputmode="numeric" pattern="[0-9]{9,10}" maxlength="10" autocomplete="tel" placeholder="08XXXXXXXX" required /></label>
          <label class="lux-form-label">รหัสผ่าน<input v-model="membership.password" type="password" autocomplete="new-password" minlength="8" placeholder="อย่างน้อย 8 ตัวอักษร" required /></label>
          <template v-if="membership.role === 'seller'">
            <label class="lux-form-label">จังหวัดที่ให้บริการ<select v-model="membership.province" required><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
            <label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="membership.price" type="number" min="50" step="50" required /></label>
            <label class="lux-form-label lux-membership-wide">สถานที่นัดพบ / พื้นที่ให้บริการ<input v-model.trim="membership.businessName" type="text" maxlength="80" placeholder="ไม่บังคับ" /></label>
            <label class="lux-form-label lux-membership-wide">รายละเอียดโปรไฟล์และรูปแบบบริการ<textarea v-model.trim="membership.service" rows="3" maxlength="300" placeholder="แนะนำตัว รูปแบบบริการ ราคา และขอบเขตที่ต้องการ" required></textarea></label>
          </template>
        </div>
        <p class="lux-membership-notice" v-if="membership.role === 'seller'">โปรไฟล์ผู้ให้บริการจะรอตรวจสอบก่อนเผยแพร่ · โปรดระบุบริการและขอบเขตอย่างชัดเจน และรับนัดหมายเฉพาะผู้ใหญ่ 18+ เท่านั้น</p>
        <button class="lux-button lux-button-primary lux-full-button" type="submit">สมัครสมาชิก<span>→</span></button>
        <p class="lux-membership-demo">ต้นแบบระบบสมาชิก · ข้อมูลจะอยู่ในหน้านี้ชั่วคราว ยังไม่มีระบบยืนยันอีเมลหรือจัดเก็บบัญชีถาวร</p>
      </form>
    </main>

    <main v-else-if="view === 'account'" class="lux-page lux-account-page">
      <div class="lux-account-welcome"><div class="lux-kicker"><span></span> YOUR NUANIA</div><h1>นัดหมายในแบบ<span>ของคุณ</span></h1><p>ติดตามคำขอนัดหมายและจัดการโปรไฟล์ที่บันทึกไว้ในที่เดียว</p><button class="lux-account-role-link" @click="openSellerArea">{{ member?.role === 'seller' ? 'กลับสู่ศูนย์ผู้ให้บริการ ↗' : 'ลงโปรไฟล์ผู้ให้บริการ ↗' }}</button></div>
      <div class="lux-account-layout"><aside class="lux-account-sidebar"><div class="lux-account-person"><div class="lux-user-avatar lux-user-avatar-large">{{ member?.name?.slice(0, 1) || 'ก' }}</div><div><strong>{{ member?.name || 'คุณกานต์' }}</strong><span>บัญชีผู้ใช้บริการ</span></div></div><button class="lux-account-tab" :class="{ active: accountTab === 'appointments' }" @click="accountTab = 'appointments'"><span>▦</span> ภาพรวม <small>{{ upcomingBookings.length }}</small></button><button class="lux-account-tab" :class="{ active: accountTab === 'favorites' }" @click="accountTab = 'favorites'"><span>♡</span> โปรไฟล์ที่บันทึก <small>{{ favorites.length }}</small></button><button class="lux-account-tab" @click="showNotice('จัดการข้อมูลส่วนตัวได้เมื่อเชื่อมต่อระบบบัญชีจริง')"><span>◉</span> ข้อมูลส่วนตัว</button><div class="lux-account-help"><span>ต้องการความช่วยเหลือ?</span><button @click="showNotice('ทีม NuaNia พร้อมช่วยประสานงาน')">ติดต่อทีม NuaNia ↗</button></div></aside><section class="lux-account-main"><template v-if="accountTab === 'appointments'"><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> YOUR APPOINTMENTS</div><h2>รายการนัดหมายของฉัน</h2></div><button class="lux-text-link" @click="navigate('search')">ค้นหาผู้ให้บริการ <span>↗</span></button></div>
        <div v-if="upcomingBookings.length" class="lux-appointment-list"><article v-for="item in upcomingBookings" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-date"><span>{{ new Intl.DateTimeFormat('th-TH', { day: '2-digit' }).format(new Date(`${item.date}T00:00:00`)) }}</span><small>{{ new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(new Date(`${item.date}T00:00:00`)) }}</small></div><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ item.provider }} <span>·</span> {{ item.mode }} <span>·</span> {{ formatDate(item.date) }} เวลา {{ item.time }}</p><span class="lux-appointment-place">⌖ {{ item.venue }}</span></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button @click="showNotice('รายละเอียดนัดหมายจะแสดงในบัญชีของคุณ')">ดูรายละเอียด ↗</button></div></article></div><div v-else class="lux-empty"><span>✳</span><h3>ยังไม่มีนัดหมาย</h3><p>เริ่มค้นหาโปรไฟล์และรูปแบบบริการที่ตรงกับคุณ</p><button class="lux-button lux-button-primary" @click="navigate('search')">ค้นหาผู้ให้บริการ</button></div>
        <div class="lux-account-section-heading lux-history-heading"><div><div class="lux-kicker"><span></span> A LITTLE WHILE AGO</div><h2>ที่ผ่านมาไม่นาน</h2></div></div><div v-if="completedBookings.length" class="lux-history-list"><article v-for="item in completedBookings" :key="item.id" class="lux-history-item"><span class="lux-history-check">✓</span><div><strong>{{ item.service }}</strong><span>{{ item.provider }} · {{ formatDate(item.date) }}</span></div><span class="lux-history-amount">฿{{ item.amount.toLocaleString() }}</span><button @click="openProfile(providers.find((provider) => provider.id === item.providerId) || providers[0])">จองอีกครั้ง ↗</button></article></div>
        <div class="lux-account-promo"><span>✳</span><div><strong>นัดหมายอย่างมั่นใจ เริ่มจากความชัดเจน</strong><small>บันทึกโปรไฟล์ที่สนใจไว้กลับมาดูรายละเอียดได้ภายหลัง</small></div><button @click="navigate('search')">สำรวจโปรไฟล์ ↗</button></div></template>
        <template v-else><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> YOUR SAVED PROVIDERS</div><h2>โปรไฟล์ที่บันทึกไว้</h2></div><button class="lux-text-link" @click="navigate('search')">ค้นหาเพิ่มเติม <span>↗</span></button></div><div v-if="favoriteProviders.length" class="lux-provider-grid lux-favorite-grid"><article v-for="provider in favoriteProviders" :key="provider.id" class="lux-provider-card"><div class="lux-card-image" :class="[provider.visual, { 'lux-card-image-has-media': providerPreviewMedia(provider) }]" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)"><img v-if="providerPreviewMedia(provider)?.type === 'image'" class="lux-card-photo" :src="providerPreviewMedia(provider).url" :alt="`ภาพแนะนำของ ${provider.name}`" loading="lazy" /><video v-else-if="providerPreviewMedia(provider)" class="lux-card-photo" :src="providerPreviewMedia(provider).url" muted autoplay loop playsinline :aria-label="`วิดีโอแนะนำของ ${provider.name}`"></video><span v-else class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span><button class="lux-heart loved" aria-label="นำออกจากรายการโปรด" @click.stop="toggleFavorite(provider)">♥</button><span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span></div><div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">✓ PROFILE</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">ดูโปรไฟล์ <span>↗</span></button></div></div></article></div><div v-else class="lux-empty"><span>♡</span><h3>ยังไม่มีโปรไฟล์ที่บันทึก</h3><p>บันทึกผู้ให้บริการที่สนใจ เพื่อกลับมาดูรายละเอียดได้ทุกเมื่อ</p><button class="lux-button lux-button-primary" @click="navigate('search')">ค้นหาผู้ให้บริการ</button></div></template>
      </section></div>
    </main>

    <main v-else-if="view === 'apply'" class="lux-page lux-apply-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ลงโปรไฟล์ผู้ให้บริการ</span></div>
      <div class="lux-apply-layout">
        <div class="lux-apply-intro">
          <div class="lux-kicker"><span></span> GROW WITH NUANIA</div>
          <h1>สร้างโปรไฟล์<br />ให้คนที่ใช่<span>ค้นพบคุณ</span></h1>
          <p>นำเสนอบริการอิสระของคุณอย่างชัดเจน กำหนดราคา เวลา และขอบเขตการนัดหมายได้ด้วยตัวเอง</p>
          <div class="lux-apply-benefit"><span>01</span><div><strong>แนะนำตัวในแบบของคุณ</strong><small>เพิ่มรายละเอียด รูปแบบบริการ และสื่อโปรโมต</small></div></div>
          <div class="lux-apply-benefit"><span>02</span><div><strong>จัดการคำขอนัดหมาย</strong><small>ตรวจสอบรายละเอียดก่อนตอบรับทุกครั้ง</small></div></div>
          <div class="lux-apply-benefit"><span>03</span><div><strong>กำหนดขอบเขตให้ชัดเจน</strong><small>แสดงข้อมูลเท่าที่คุณยินยอมและสบายใจ</small></div></div>
        </div>
        <form class="lux-apply-form" @submit.prevent="submitApplication">
          <div class="lux-kicker"><span></span> PROVIDER APPLICATION</div>
          <h2>สมัครเป็นผู้ให้บริการ</h2>
          <p>ใบสมัครจะรอตรวจสอบก่อนเผยแพร่โปรไฟล์</p>
          <label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="application.name" type="text" maxlength="40" placeholder="ชื่อที่ต้องการให้แสดง" required /></label>
          <div class="lux-form-grid">
            <label class="lux-form-label">LINE ID<input v-model.trim="application.line" type="text" maxlength="50" placeholder="ช่องทางติดต่อ" required /></label>
            <label class="lux-form-label">จังหวัด<select v-model="application.province" required><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
          </div>
          <div class="lux-form-grid">
            <label class="lux-form-label">อัตลักษณ์ทางเพศ<select v-model="application.gender" required><option value="" disabled>เลือกตามที่คุณสบายใจ</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label>
            <label class="lux-form-label">รูปแบบบริการ<input v-model.trim="application.service" type="text" maxlength="100" placeholder="เช่น พบปะพูดคุย, ร่วมกิจกรรม" required /></label>
          </div>
          <label class="lux-consent"><input v-model="application.consent" type="checkbox" required /><span>ยินยอมให้แสดงข้อมูลโปรไฟล์ตามที่ระบุ และรับทราบว่าแพลตฟอร์มนี้สำหรับผู้ใหญ่ 18+ เท่านั้น</span></label>
          <div class="lux-apply-fee"><span>ค่าสมาชิกตัวอย่าง</span><strong>฿299 <small>/ เดือน</small></strong><span>ข้อมูลค่าบริการนี้เป็นตัวอย่างในต้นแบบ</span></div>
          <button class="lux-button lux-button-primary lux-full-button" type="submit">ส่งใบสมัคร ↗</button>
          <small class="lux-demo-note">แบบฟอร์มต้นแบบ · ไม่มีการส่งข้อมูลหรือเรียกเก็บเงินจริง</small>
        </form>
      </div>
    </main>

    <main v-else-if="view === 'admin'" class="lux-page lux-admin-page"><div class="lux-admin-top"><div><div class="lux-kicker"><span></span> NUANIA ADMINISTRATION</div><h1>ภาพรวม<span>แพลตฟอร์ม</span></h1><p>จัดการพาร์ตเนอร์ การนัดหมาย และดูแลประสบการณ์ของสมาชิก</p></div><span class="lux-demo-status">● DEMO ENVIRONMENT · ข้อมูลตัวอย่าง</span></div><div class="lux-admin-tabs"><button v-for="tab in [{id:'overview', label:'ภาพรวม'}, {id:'providers', label:'พาร์ตเนอร์'}, {id:'bookings', label:'การนัดหมาย'}, {id:'applications', label:'ใบสมัคร'}, {id:'travelers', label:'นักท่องเที่ยว'}]" :key="tab.id" :class="{ active: adminTab === tab.id }" @click="adminTab = tab.id">{{ tab.label }} <small v-if="tab.id === 'applications' && applications.length">{{ applications.length }}</small></button></div>
      <template v-if="adminTab === 'overview'"><div class="lux-admin-metrics"><article><span>พาร์ตเนอร์ที่เผยแพร่</span><strong>{{ activeProviderCount }}</strong><small>↑ 8.4% <i>เทียบกับเดือนก่อน</i></small></article><article><span>นัดหมายเดือนนี้</span><strong>{{ bookings.length + 126 }}</strong><small>● <i>อัปเดตจากข้อมูลตัวอย่าง</i></small></article><article><span>รายได้ค่าสมาชิก</span><strong>฿{{ (activeProviderCount * 299).toLocaleString() }}</strong><small>สมมติสมาชิก {{ activeProviderCount }} ราย</small></article><article><span>กำลังรอตรวจสอบ</span><strong>{{ applications.length }}</strong><small><i>ใบสมัครพาร์ตเนอร์ใหม่</i></small></article></div><div class="lux-admin-overview-grid"><section class="lux-admin-panel"><div class="lux-admin-panel-head"><div><h2>การนัดหมายล่าสุด</h2><p>ภาพรวมการจองจากผู้ใช้บริการ</p></div><button @click="adminTab = 'bookings'">ดูทั้งหมด ↗</button></div><div class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัส / ผู้รับบริการ</th><th>ผู้ให้บริการ</th><th>วันและเวลา</th><th>รูปแบบ</th><th>ยอด</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in bookings.slice(0, 5)" :key="item.id"><td><strong>{{ item.id }}</strong><small>คุณ{{ item === bookings[0] ? 'กานต์' : 'ลูกค้า' }}</small></td><td>{{ item.provider }}</td><td>{{ formatDate(item.date) }} · {{ item.time }}</td><td>{{ item.mode }}</td><td>฿{{ item.amount.toLocaleString() }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div></section><aside class="lux-admin-panel lux-admin-side-panel"><div class="lux-admin-panel-head"><div><h2>รอตรวจสอบ</h2><p>ใบสมัครพาร์ตเนอร์</p></div><span>{{ applications.length }}</span></div><div v-if="applications.length" class="lux-pending-list"><div v-for="item in applications.slice(0, 4)" :key="item.id"><span class="lux-pending-avatar">{{ item.name.slice(0, 1) }}</span><div><strong>{{ item.name }}</strong><small>{{ item.province }} · {{ item.line }}</small></div><button @click="approveApplication(item)">อนุมัติ</button></div></div><div v-else class="lux-admin-no-pending"><span>✓</span><strong>ไม่มีรายการค้าง</strong><small>ใบสมัครใหม่จะแสดงที่นี่</small></div></aside></div></template>
      <section v-else-if="adminTab !== 'travelers'" class="lux-admin-panel lux-admin-detail-panel"><div class="lux-admin-panel-head"><div><h2>{{ adminTab === 'providers' ? 'พาร์ตเนอร์ทั้งหมด' : adminTab === 'bookings' ? 'รายการนัดหมาย' : 'ใบสมัครพาร์ตเนอร์' }}</h2><p>การจัดการภายใน · การเปลี่ยนแปลงเป็นข้อมูลตัวอย่างในเบราว์เซอร์</p></div><span>{{ adminTab === 'providers' ? `${filteredAdminProviders.length} / ${providers.length}` : adminTab === 'bookings' ? bookings.length : applications.length }} รายการ</span></div><div v-if="adminTab === 'providers'" class="lux-admin-provider-filters"><label><span>ค้นหาชื่อ</span><input v-model="adminProviderSearch" type="search" placeholder="พิมพ์ชื่อพาร์ตเนอร์" /></label><label><span>จังหวัด</span><select v-model="adminProviderProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label><span>เพศ</span><select v-model="adminProviderGender"><option value="">ทุกเพศ</option><option v-for="gender in adminProviderGenders" :key="gender">{{ gender }}</option></select></label><button type="button" @click="adminProviderSearch = ''; adminProviderProvince = ''; adminProviderGender = ''">ล้างตัวกรอง</button></div><div v-if="adminTab === 'providers' && filteredAdminProviders.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>พาร์ตเนอร์</th><th>พื้นที่ให้บริการ</th><th>รูปแบบ</th><th>สมาชิก</th><th>โปรไฟล์</th><th>รายละเอียด</th></tr></thead><tbody><tr v-for="provider in paginatedAdminProviders" :key="provider.id"><td><div class="lux-admin-provider"><img v-if="providerPreviewMedia(provider)?.type === 'image'" :src="providerPreviewMedia(provider).url" :alt="`ภาพโปรไฟล์ ${provider.name}`" loading="lazy" /><video v-else-if="providerPreviewMedia(provider)" :src="providerPreviewMedia(provider).url" muted playsinline preload="metadata" :aria-label="`วิดีโอโปรไฟล์ ${provider.name}`"></video><span v-else class="lux-admin-provider-placeholder">{{ provider.initials }}</span><div><strong>{{ provider.name }} · {{ provider.category }}</strong><small>LINE {{ provider.line }}</small></div></div></td><td>{{ provider.area }}, {{ provider.province }}</td><td>{{ provider.modes.join(' / ') }}</td><td><button class="lux-admin-action" @click="setProviderStatus(provider, 'membershipActive')">{{ provider.membershipActive ? 'สมาชิกใช้งาน' : 'หมดอายุ' }}</button></td><td><button class="lux-admin-action" @click="setProviderStatus(provider, 'active')">{{ provider.active ? 'เผยแพร่' : 'ซ่อน' }}</button></td><td><button type="button" class="lux-admin-action" @click="openProfile(provider)">ดูรายละเอียด</button></td></tr></tbody></table><nav v-if="adminProviderPageCount > 1" class="lux-admin-pagination" aria-label="หน้าพาร์ตเนอร์">
  <button type="button" :disabled="adminProviderPage === 1" @click="adminProviderPage--">ก่อนหน้า</button>
  <span>หน้า {{ adminProviderPage }} / {{ adminProviderPageCount }}</span>
  <button type="button" :disabled="adminProviderPage === adminProviderPageCount" @click="adminProviderPage++">ถัดไป</button>
</nav></div><div v-else-if="adminTab === 'providers'" class="lux-admin-provider-empty">ไม่พบพาร์ตเนอร์ตามเงื่อนไขที่เลือก</div><div v-else-if="adminTab === 'bookings'" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัสการจอง</th><th>ผู้ให้บริการ</th><th>บริการ</th><th>วัน / เวลา</th><th>รูปแบบ</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in bookings" :key="item.id"><td><strong>{{ item.id }}</strong></td><td>{{ item.provider }}</td><td>{{ item.service }}</td><td>{{ formatDate(item.date) }} · {{ item.time }}</td><td>{{ item.mode }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div><div v-else-if="applications.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>ผู้สมัคร</th><th>จังหวัด</th><th>อัตลักษณ์</th><th>บริการ</th><th>LINE ID</th><th>จัดการ</th></tr></thead><tbody><tr v-for="item in applications" :key="item.id"><td><strong>{{ item.name }}</strong></td><td>{{ item.province }}</td><td>{{ item.gender }}</td><td>{{ item.service }}</td><td>{{ item.line }}</td><td><button class="lux-admin-action" @click="approveApplication(item)">อนุมัติ</button><button class="lux-admin-action reject" @click="rejectApplication(item)">ปฏิเสธ</button></td></tr></tbody></table></div><div v-else class="lux-admin-no-pending"><span>✓</span><strong>ไม่มีใบสมัครค้างตรวจสอบ</strong></div></section>
      <section v-else class="lux-admin-panel lux-admin-detail-panel">
        <div class="lux-admin-panel-head">
          <div><h2>{{ selectedTraveler ? `ข้อมูลนักท่องเที่ยว: ${selectedTraveler.traveler.name}` : 'นักท่องเที่ยวทั้งหมด' }}</h2><p>{{ selectedTraveler ? 'ข้อมูลบัญชีและประวัติการใช้งาน' : 'ค้นหาและเปิดดูข้อมูลบัญชี ประวัติการจอง รายการโปรด และรีวิว' }}</p></div>
          <button v-if="selectedTraveler" type="button" @click="selectedTraveler = null">← กลับไปยังรายชื่อ</button>
          <span v-else>{{ filteredAdminTravelers.length }} บัญชี</span>
        </div>
        <template v-if="selectedTraveler">
          <div class="lux-admin-traveler-info">
            <article><span>ชื่อที่ใช้แสดง</span><strong>{{ selectedTraveler.traveler.name }}</strong></article>
            <article><span>อีเมล</span><strong>{{ selectedTraveler.traveler.email }}</strong></article>
            <article><span>เบอร์โทรศัพท์</span><strong>{{ selectedTraveler.traveler.phone || 'ไม่ระบุ' }}</strong></article>
            <article><span>วันที่สมัคร</span><strong>{{ formatDateTime(selectedTraveler.traveler.createdAt) }}</strong></article>
          </div>
          <section class="lux-admin-traveler-section">
            <h3>ประวัติการจอง ({{ selectedTraveler.bookings.length }})</h3>
            <div v-if="selectedTraveler.bookings.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัส / วันที่สร้าง</th><th>ผู้ให้บริการ</th><th>บริการ / รูปแบบ</th><th>วันนัดหมาย</th><th>สถานที่</th><th>ข้อมูลติดต่อขณะจอง</th><th>หมายเหตุ</th><th>ยอด</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in selectedTraveler.bookings" :key="item.id"><td><strong>{{ item.id }}</strong><small>{{ formatDateTime(item.createdAt) }}</small></td><td>{{ item.provider }}</td><td>{{ item.service }}<small>{{ item.mode }} · {{ item.time }}</small></td><td>{{ formatDate(item.date) }}</td><td>{{ item.venue || 'ไม่ระบุ' }}</td><td>{{ item.guestName || 'ไม่ระบุ' }}<small>{{ item.phone || 'ไม่ระบุ' }}</small></td><td>{{ item.note || 'ไม่มี' }}</td><td>฿{{ item.amount.toLocaleString() }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div>
            <p v-else class="lux-admin-traveler-empty">ยังไม่มีประวัติการจอง</p>
          </section>
          <section class="lux-admin-traveler-section">
            <h3>รายการโปรด ({{ selectedTraveler.favorites.length }})</h3>
            <ul v-if="selectedTraveler.favorites.length" class="lux-admin-traveler-favorites"><li v-for="provider in selectedTraveler.favorites" :key="provider.id">{{ provider.name }} <span>· {{ provider.province }}</span></li></ul>
            <p v-else class="lux-admin-traveler-empty">ไม่มีรายการโปรด</p>
          </section>
          <section class="lux-admin-traveler-section">
            <h3>รีวิวที่เขียน ({{ selectedTraveler.reviews.length }})</h3>
            <article v-for="review in selectedTraveler.reviews" :key="review.id" class="lux-admin-traveler-review"><div><strong>{{ review.provider }}</strong><span>บริการ {{ review.serviceRating }} ★ · ความคุ้มค่า {{ review.valueRating }} ★ · {{ formatDateTime(review.createdAt) }}</span></div><p>{{ review.comment }}</p><div v-if="review.media.length" class="lux-admin-traveler-review-media"><img v-for="media in review.media" :key="media.id" :src="media.url" :alt="media.name" loading="lazy" /></div><small>รหัสการจอง {{ review.bookingId }}</small></article>
            <p v-if="!selectedTraveler.reviews.length" class="lux-admin-traveler-empty">ยังไม่มีรีวิว</p>
          </section>
        </template>
        <div v-else class="lux-admin-traveler-list">
          <label class="lux-admin-traveler-search"><span>ค้นหาชื่อ อีเมล หรือเบอร์โทรศัพท์</span><input v-model="adminTravelerSearch" type="search" placeholder="พิมพ์ข้อมูลที่ต้องการค้นหา" /></label>
          <div v-if="filteredAdminTravelers.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>ชื่อที่ใช้แสดง</th><th>อีเมล</th><th>เบอร์โทรศัพท์</th><th>วันที่สมัคร</th><th>ประวัติการจอง</th><th>ข้อมูล</th></tr></thead><tbody><tr v-for="traveler in filteredAdminTravelers" :key="traveler.id"><td><strong>{{ traveler.name }}</strong></td><td>{{ traveler.email }}</td><td>{{ traveler.phone || 'ไม่ระบุ' }}</td><td>{{ formatDateTime(traveler.createdAt) }}</td><td>{{ traveler.bookingCount }} รายการ</td><td><button type="button" class="lux-admin-action" :disabled="isAdminTravelerLoading" @click="openAdminTraveler(traveler)">ดูรายละเอียด</button></td></tr></tbody></table></div>
          <p v-else class="lux-admin-traveler-empty">ไม่พบนักท่องเที่ยว</p>
        </div>
      </section>
      <p class="lux-admin-footnote">หน้าจอตัวอย่างสำหรับการออกแบบ · ไม่มีระบบบัญชีผู้ดูแลหรือการชำระเงินจริง</p></main>

    <main v-else-if="view === 'design'" class="lux-page lux-design-page"><div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>Design system</span></div><div class="lux-page-heading"><div><div class="lux-kicker"><span></span> NUANIA · VISUAL LANGUAGE</div><h1>Design<span>system</span></h1><p>ระบบภาพสำหรับแพลตฟอร์มนัดหมายผู้ให้บริการอิสระ เน้นความชัดเจน ความยินยอม และความเป็นส่วนตัว</p></div></div><section class="lux-design-section"><span class="lux-design-index">01 / COLOR</span><h2>Palette <small>ชุดสีสดใสแบบ full-color พร้อมไล่เฉดม่วง–ชมพู–ส้ม</small></h2><div class="lux-gradient-strip" aria-label="Signature gradient"></div><div class="lux-color-grid"><article v-for="color in [{name:'Violet', hex:'#7C3AED', cls:'swatch-violet'}, {name:'Pink',hex:'#EC4899',cls:'swatch-pink'}, {name:'Orange',hex:'#F97316',cls:'swatch-orange'}, {name:'Teal',hex:'#14B8A6',cls:'swatch-teal'}, {name:'Sky',hex:'#0EA5E9',cls:'swatch-sky'}, {name:'Indigo',hex:'#1E1B4B',cls:'swatch-indigo'}]" :key="color.name"><div :class="color.cls"></div><strong>{{ color.name }}</strong><span>{{ color.hex }}</span></article></div></section><section class="lux-design-section lux-type-samples"><span class="lux-design-index">02 / TYPOGRAPHY</span><h2>Type scale <small>ตัวอักษรชัดเจนและอ่านง่ายทุกหน้าจอ</small></h2><div><span>Display / 64</span><strong>นัดพบในแบบที่คุณเลือก</strong><span>Heading / 32</span><h3>ผู้ให้บริการอิสระ</h3><span>Body / 16</span><p>ดูโปรไฟล์และตกลงรายละเอียดก่อนยืนยันการนัดหมาย</p><span>Caption / 12</span><small>INDEPENDENT PROVIDER · CLEAR TERMS</small></div></section><section class="lux-design-section"><span class="lux-design-index">03 / COMPONENTS</span><h2>UI elements <small>คอมโพเนนต์ที่สม่ำเสมอและเข้าถึงได้บนทุกหน้าจอ</small></h2><div class="lux-component-row"><button class="lux-button lux-button-primary">ปุ่มหลัก ↗</button><button class="lux-button lux-button-light lux-border-button">ปุ่มรอง</button><span class="lux-verified">PROFILE</span><span class="lux-status">ยืนยันแล้ว</span><span class="lux-status waiting">รอยืนยัน</span></div><div class="lux-design-input"><label class="lux-form-label">Input / default<input placeholder="ชื่อหรือพื้นที่ให้บริการ" /></label><label class="lux-form-label">Select / default<select><option>เลือกจังหวัด</option></select></label></div></section><section class="lux-design-section"><span class="lux-design-index">04 / SPACING & SHAPE</span><h2>Layout principles <small>จังหวะพื้นที่และรูปทรง</small></h2><div class="lux-principles"><div><span class="lux-space-swatch space-8"></span><strong>8 px</strong><small>micro spacing</small></div><div><span class="lux-space-swatch space-16"></span><strong>16 px</strong><small>component gap</small></div><div><span class="lux-space-swatch space-24"></span><strong>24 px</strong><small>card padding</small></div><div><span class="lux-space-swatch space-40"></span><strong>40 px</strong><small>section rhythm</small></div><p>ใช้กริด 12 คอลัมน์บน desktop และ single-column flow บนมือถือ ปุ่มและช่องกรอกมีพื้นที่สัมผัสอย่างน้อย 44 px, มุมโค้ง 14–24 px และหลีกเลี่ยงการเปิดเผยข้อมูลที่ไม่จำเป็น</p></div></section></main>

    <footer class="lux-footer"><div class="lux-footer-main"><div class="lux-logo"><span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>CONNECT ON YOUR TERMS</small></span></div><p>แพลตฟอร์มนัดหมายผู้ให้บริการอิสระ<br />สำหรับผู้ใหญ่ 18+ เท่านั้น</p><div class="lux-footer-links"><button @click="navigate('search')">ค้นหาผู้ให้บริการ</button><button v-if="currentUser" @click="openOwnArea">{{ accountMenuLabel }}</button><button v-else @click="navigate('login')">เข้าสู่ระบบ</button><button v-if="!currentUser" @click="navigate('apply')">ลงโปรไฟล์ผู้ให้บริการ</button><button @click="navigate('design')">Design system ↗</button></div><div class="lux-footer-contact"><span>NEED SUPPORT?</span><strong>มีข้อสงสัยเรื่องการนัดหมาย?</strong><button @click="showNotice('ทีม NuaNia พร้อมช่วยประสานงาน')">ติดต่อ NuaNia ↗</button></div></div><div class="lux-footer-bottom"><span>© 2026 NUANIA · INDEPENDENT PROVIDER PLATFORM · DEMO</span><span>ความเป็นส่วนตัว　 ข้อกำหนดการใช้บริการ</span><span>THAILAND · CONNECT WITH CARE</span></div></footer>

    <nav class="lux-mobile-bottom" aria-label="เมนูมือถือ"><button :class="{ active: view === 'home' }" @click="navigate('home')"><span>⌂</span>หน้าแรก</button><button :class="{ active: view === 'search' }" @click="navigate('search')"><span>⌕</span>ค้นหา</button><button v-if="!currentUser" :class="{ active: view === 'login' }" @click="navigate('login')"><span>◉</span>เข้าสู่ระบบ</button><button v-else :class="{ active: view === currentHomeView }" @click="openOwnArea"><span>◉</span>{{ accountMenuLabel }}</button></nav>
    <main v-if="view === 'seller' && sellerProvider" class="lux-page lux-seller-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ศูนย์จัดการผู้ขาย</span></div>
      <div class="lux-seller-heading"><div><div class="lux-kicker"><span></span> SELLER WORKSPACE</div><h1>จัดการ<span>บริการของคุณ</span></h1><p>{{ sellerProvider.name }} · {{ sellerProvider.province }}</p></div><span class="lux-seller-status" :class="{ published: sellerProvider.active }">{{ sellerProvider.active ? 'เผยแพร่แล้ว' : 'รอตรวจสอบโปรไฟล์' }}</span></div>
      <nav class="lux-seller-tabs" aria-label="เมนูจัดการผู้ขาย"><button :class="{ active: sellerDashboardTab === 'overview' }" @click="sellerDashboardTab = 'overview'">ภาพรวม</button><button :class="{ active: sellerDashboardTab === 'profile' }" @click="sellerDashboardTab = 'profile'">โปรไฟล์และบริการ</button><button :class="{ active: sellerDashboardTab === 'bookings' }" @click="sellerDashboardTab = 'bookings'">คำขอนัดหมาย <span>{{ sellerBookings.filter(item => item.status === 'รอยืนยัน').length }}</span></button><button class="lux-seller-switch" @click="openBuyerArea">ไปหน้าผู้ซื้อ ↗</button></nav>
      <section v-if="sellerDashboardTab === 'overview'" class="lux-seller-overview">
        <div v-if="!sellerProvider.active" class="lux-seller-review-note"><strong>โปรไฟล์กำลังรอตรวจสอบ</strong><span>ทีมงานจะตรวจสอบข้อมูลก่อนเผยแพร่ คุณสามารถจัดการรายละเอียดบริการได้ระหว่างนี้</span><button @click="sellerDashboardTab = 'profile'">ตรวจสอบโปรไฟล์ ↗</button></div>
        <div class="lux-seller-metrics"><article><span>คำขอนัดหมายใหม่</span><strong>{{ sellerBookings.filter(item => item.status === 'รอยืนยัน').length }}</strong></article><article><span>นัดหมายที่ยืนยัน</span><strong>{{ sellerBookings.filter(item => item.status === 'ยืนยันแล้ว').length }}</strong></article><article><span>บริการที่ลงไว้</span><strong>{{ sellerProvider.services.length }}</strong></article><article><span>ราคาเริ่มต้น</span><strong>฿{{ sellerProvider.price.toLocaleString() }}</strong></article></div>
        <section class="lux-seller-panel"><div class="lux-seller-panel-head"><div><h2>นัดหมายล่าสุด</h2><p>จัดการคำขอจากผู้ใช้บริการ</p></div><button @click="sellerDashboardTab = 'bookings'">ดูนัดหมายทั้งหมด ↗</button></div><div v-if="sellerBookings.length" class="lux-appointment-list"><article v-for="item in sellerBookings.slice(0, 3)" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ formatDate(item.date) }} · {{ item.time }} · {{ item.mode }}</p></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button @click="sellerDashboardTab = 'bookings'">จัดการ ↗</button></div></article></div><div v-else class="lux-empty"><span>▦</span><h3>ยังไม่มีคำขอนัดหมาย</h3><p>เมื่อผู้ใช้จองบริการ รายการจะปรากฏในหน้านี้</p></div></section>
      </section>
      <form v-else-if="sellerDashboardTab === 'profile'" class="lux-seller-panel lux-seller-profile" @submit.prevent="saveSellerProfile"><div class="lux-seller-panel-head"><div><h2>โปรไฟล์และบริการ</h2><p>ข้อมูลนี้จะแสดงในหน้าค้นหาหลังผ่านการตรวจสอบ</p></div></div><div class="lux-membership-fields"><label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="sellerProvider.name" maxlength="40" required /></label><label class="lux-form-label">จังหวัด<select v-model="sellerProvider.province" required><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="sellerProvider.price" type="number" min="1" step="50" required /></label><label class="lux-form-label">อายุ<input v-model.number="sellerProvider.age" type="number" min="18" max="100" required /></label><label class="lux-form-label">ส่วนสูง (ซม.)<input v-model.number="sellerProvider.heightCm" type="number" min="120" max="230" required /></label><label class="lux-form-label">น้ำหนัก (กก.)<input v-model.number="sellerProvider.weightKg" type="number" min="30" max="250" required /></label><label class="lux-form-label">สัดส่วน<input v-model.trim="sellerProvider.measurements" maxlength="80" placeholder="เช่น 34-24-36 นิ้ว" required /></label><label class="lux-form-label">สถานที่ให้บริการ<input v-model.trim="sellerProvider.venue" maxlength="100" required /></label><label class="lux-form-label lux-membership-wide">รายละเอียดบริการ<textarea v-model="sellerProvider.description" rows="5" maxlength="300" placeholder="เขียนรายละเอียดได้หลายบรรทัด และใส่อิโมจิได้ ✨&#10;เช่น 🌿 จุดเด่นหรือบรรยากาศบริการ&#10;🕒 เวลาที่ให้บริการ" required></textarea></label></div><section class="lux-seller-services" aria-labelledby="seller-services-heading"><div class="lux-seller-panel-head"><div><h2 id="seller-services-heading">รูปแบบนัดหมาย</h2><p>เพิ่มบริการพร้อมกำหนดชื่อ ระยะเวลา รายละเอียด และราคาสำหรับแต่ละรายการ</p></div><button class="lux-button lux-button-light" type="button" :disabled="sellerProvider.services.length >= 30" @click="addSellerService">＋ เพิ่มรูปแบบนัดหมาย</button></div><article v-for="(service, index) in sellerProvider.services" :key="index" class="lux-seller-service-row"><div class="lux-seller-service-heading"><strong>รูปแบบที่ {{ index + 1 }}</strong><button type="button" :disabled="sellerProvider.services.length <= 1" @click="removeSellerService(index)">ลบ</button></div><label class="lux-form-label">ชื่อรูปแบบ<input v-model.trim="service.name" maxlength="60" placeholder="เช่น พบปะพูดคุย ✨" required /></label><div class="lux-seller-service-fields"><label class="lux-form-label">ระยะเวลา<input v-model.trim="service.duration" maxlength="40" placeholder="เช่น 60 นาที" required /></label><label class="lux-form-label">ราคา (บาท)<input v-model.number="service.price" type="number" min="1" max="1000000" step="1" required /></label></div><label class="lux-form-label">รายละเอียด<textarea v-model.trim="service.description" maxlength="200" rows="4" placeholder="ใส่รายละเอียดได้หลายบรรทัด และใช้อิโมจิได้ ✨&#10;เช่น 🌿 นัดพบในบรรยากาศสบาย ๆ" required></textarea></label></article></section><section class="lux-seller-media-manager" aria-labelledby="seller-media-heading"><div class="lux-seller-panel-head"><div><h2 id="seller-media-heading">สื่อโปรโมตบริการ</h2><p>เพิ่มรูปภาพหรือวิดีโอได้หลายไฟล์ เพื่อแสดงในหน้าโปรไฟล์ของคุณ</p></div><span class="lux-seller-media-count">{{ sellerProvider.media?.length || 0 }} ไฟล์</span></div><label class="lux-seller-upload"><input type="file" accept="image/*,video/*" multiple @change="addSellerMedia" /><span aria-hidden="true">＋</span><strong>เลือกรูปภาพหรือวิดีโอ</strong><small>เลือกหลายไฟล์พร้อมกันได้</small></label><div v-if="sellerProvider.media?.length" class="lux-seller-media-grid"><article v-for="media in sellerProvider.media" :key="media.id" class="lux-seller-media-item"><img v-if="media.type === 'image'" :src="media.url" :alt="media.name" /><video v-else :src="media.url" controls preload="metadata" playsinline :aria-label="media.name"></video><div><span :title="media.name">{{ media.name }}</span><button type="button" :aria-label="`ลบไฟล์ ${media.name}`" @click="removeSellerMedia(media.id)">ลบ</button></div></article></div><p class="lux-seller-media-note">สื่อที่เพิ่มจะปรากฏบนโปรไฟล์สาธารณะในเซสชันนี้ · ต้นแบบนี้ยังไม่ได้อัปโหลดไปเก็บบนเซิร์ฟเวอร์</p></section><button class="lux-button lux-button-primary" type="submit">บันทึกข้อมูลบริการ ↗</button></form>
      <section v-else class="lux-seller-panel"><div class="lux-seller-panel-head"><div><h2>คำขอนัดหมาย</h2><p>ยืนยันหรืออัปเดตสถานะการให้บริการ</p></div></div><div v-if="sellerBookings.length" class="lux-appointment-list"><article v-for="item in sellerBookings" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ formatDate(item.date) }} · {{ item.time }} · {{ item.mode }}</p><span class="lux-appointment-place">{{ item.venue }}</span></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button v-if="item.status === 'รอยืนยัน'" @click="updateSellerBooking(item, 'ยืนยันแล้ว')">ยืนยันนัดหมาย</button><button v-else-if="item.status === 'ยืนยันแล้ว'" @click="updateSellerBooking(item, 'เสร็จสิ้น')">เสร็จสิ้น</button></div></article></div><div v-else class="lux-empty"><span>▦</span><h3>ยังไม่มีคำขอนัดหมาย</h3><p>รายการจองใหม่จะแสดงที่นี่</p></div></section>
      <p class="lux-membership-demo">ต้นแบบหน้าจัดการผู้ขาย · สิทธิ์และข้อมูลยังจัดเก็บในเบราว์เซอร์ ไม่ใช่ระบบบัญชีจริง</p>
    </main>
    <div v-if="notice" class="lux-toast" role="status"><span>✓</span>{{ notice }}</div>
  </div>
</template>
