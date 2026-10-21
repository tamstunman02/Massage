import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { api } from '../api.js'

let appState = null

export function useApp() {
  if (!appState) appState = createAppState()
  return appState
}

function createAppState() {
const OWNER_LINE_ID = '390xblmm'
const ownerLineUrl = `https://line.me/R/ti/p/@${OWNER_LINE_ID}`
const ownerLineLabel = `@${OWNER_LINE_ID}`

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
const sellerReviews = ref([])
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
const sellerSaveAlert = ref('')
const devVerifyLink = ref('')
const bookingReference = ref('')
const isCompactMenuOpen = ref(false)
const isAccountMenuOpen = ref(false)
const adminTab = ref('overview')
const adminProviderSearch = ref('')
const adminProviderProvince = ref('')
const adminProviderGender = ref('')
const adminProviderPage = ref(1)
const adminProviderPageSize = 50
const adminTravelers = ref([])
const adminTravelerSearch = ref('')
const selectedTraveler = ref(null)
const adminEditingProvider = ref(null)
const adminCreatingPartner = ref(false)
const isAdminPartnerSaving = ref(false)
const adminPartnerSaveError = ref('')
const adminGenderOptions = ['ผู้หญิง', 'ผู้ชาย', 'นอนไบนารี', 'ทรานส์เจนเดอร์', 'เควียร์', 'LGBTQ+', 'ไม่ประสงค์ระบุ']
const adminPartnerForm = ref(emptyAdminPartnerForm())
const isAdminTravelerLoading = ref(false)
const accountTab = ref('favorites')
const seekPosts = ref([])
const mySeekPosts = ref([])
const selectedSeekPost = ref(null)
const seekBoardFilter = ref({ province: '' })
const seekForm = ref({ title: '', province: '', venue: '', budget: '', duration: '', description: '' })
const seekFormErrors = ref({})
const seekCommentDraft = ref('')
const editingSeekCommentId = ref(null)
const editingSeekCommentBody = ref('')
const isSeekSubmitting = ref(false)
const seekDetailLoading = ref(false)
const isSeekComposeOpen = ref(false)
const seekRealtimeConnected = ref(false)
let seekEventSource = null
let seekPollTimer = 0
let seekBoardPollTimer = 0
const member = ref(null)
const activeRole = ref('buyer')
const memberSellerProviderId = ref(null)
const membership = ref({
  role: 'buyer', name: '', email: '', password: '', passwordConfirm: '',
  province: '', service: '', price: 1000,
  age: null, weightKg: null, measurements: '', line: '', facebook: '',
})
const membershipStep = ref(1)
const showMembershipPassword = ref(false)
const showMembershipPasswordConfirm = ref(false)
const membershipErrors = ref({})
const membershipPasswordMismatch = computed(() => {
  const password = membership.value.password
  const confirm = membership.value.passwordConfirm
  return Boolean(confirm) && password !== confirm
})

function clearMembershipErrors() {
  membershipErrors.value = {}
}

function setMembershipError(field, message) {
  membershipErrors.value = { ...membershipErrors.value, [field]: message }
}
const membershipSteps = computed(() => (
  membership.value.role === 'seller'
    ? [
      { id: 1, short: 'ประเภท', title: 'เลือกประเภท', hint: 'คุณจะใช้งานในฐานะใด' },
      { id: 2, short: 'บัญชี', title: 'สร้างบัญชี', hint: 'ชื่อ อีเมล และรหัสผ่าน' },
      { id: 3, short: 'โปรไฟล์', title: 'ข้อมูลโปรไฟล์', hint: 'จังหวัด ราคา และรายละเอียดตัวเอง' },
      { id: 4, short: 'ติดต่อ', title: 'ช่องทางติดต่อ', hint: 'ใส่ LINE หรือ Facebook อย่างน้อย 1 ช่อง' },
      { id: 5, short: 'รูป', title: 'รูปโปรไฟล์', hint: 'อัปโหลดรูปให้ผู้ดูแลตรวจสอบ' },
    ]
    : [
      { id: 1, short: 'ประเภท', title: 'เลือกประเภท', hint: 'คุณจะใช้งานในฐานะใด' },
      { id: 2, short: 'บัญชี', title: 'สร้างบัญชี', hint: 'ชื่อ อีเมล และรหัสผ่าน' },
    ]
))
const membershipStepMeta = computed(() => (
  membershipSteps.value.find((step) => step.id === membershipStep.value) || membershipSteps.value[0]
))
const isMembershipLastStep = computed(() => membershipStep.value >= membershipSteps.value.length)
const membershipProfilePhoto = ref(null)
const isMembershipSubmitting = ref(false)
const sellerDashboardTab = ref('overview')
const adminApproveExpiresAt = ref('')
const currentUser = ref(null)
const loginForm = ref({ email: '', password: '' })
const appRoot = ref(null)
let scrollFrame = 0
const userPermissions = computed(() => currentUser.value?.permissions || [])

const currentRole = computed(() => currentUser.value?.role || 'guest')
const roleLabel = computed(() => currentUser.value?.roleLabel || '')
const currentHomeView = computed(() => ({ admin: 'admin', seller: 'seller' }[currentRole.value] || 'account'))
const accountMenuLabel = computed(() => ({ admin: 'แผงควบคุม', seller: 'ศูนย์ผู้ขาย', buyer: 'บัญชีของฉัน' }[currentRole.value] || 'บัญชีของฉัน'))
const protectedViews = {
  account: ['booking:view:own', 'buyer'],
  seller: ['dashboard:seller', 'seller'],
  admin: ['dashboard:admin', 'admin'],
  seek: ['seek:view', null],
}

function can(permission) {
  return userPermissions.value.includes(permission)
}

async function loadSeekPosts() {
  if (!can('seek:view')) {
    seekPosts.value = []
    mySeekPosts.value = []
    return
  }
  const [board, mine] = await Promise.all([
    api.seekPosts({
      province: seekBoardFilter.value.province || undefined,
      status: currentRole.value === 'buyer' ? undefined : 'open',
    }),
    can('seek:manage:own') ? api.seekPosts({ mine: true }) : Promise.resolve([]),
  ])
  seekPosts.value = board
  mySeekPosts.value = mine
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
  if (adminEditingProvider.value) {
    adminEditingProvider.value = providerList.find((item) => item.id === adminEditingProvider.value.id) || null
  }
  if (can('seek:view')) await safely(() => loadSeekPosts(), 'โหลดโพสหาผู้ให้บริการไม่สำเร็จ')
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
  if (view.value === 'membership') {
    membershipStep.value = 1
    showMembershipPassword.value = false
    showMembershipPasswordConfirm.value = false
    clearMembershipErrors()
  }
  if (view.value === 'seller' && memberSellerProviderId.value) {
    await safely(() => loadSellerReviews(memberSellerProviderId.value), 'โหลดรีวิวไม่สำเร็จ')
  }
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
  adminApproveExpiresAt.value = defaultMembershipExpiryLocal()
  await safely(async () => {
    applyUser((await api.me()).user)
    await loadData()
  }, 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ')
  await openSharedProfileFromUrl()
  window.addEventListener('popstate', onProfilePopState)
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('scroll', updateScrollEffects)
  window.removeEventListener('resize', updateScrollEffects)
  window.removeEventListener('keydown', handleViewerKeydown)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  clearReviewImages()
  stopSeekRealtime()
  stopSeekBoardPolling()
  window.removeEventListener('popstate', onProfilePopState)
})

function closeSeekDetail() {
  stopSeekRealtime()
  selectedSeekPost.value = null
}

function openOwnArea() {
  navigate(currentHomeView.value)
}

async function submitLogin() {
  const result = await safely(() => api.login({
    email: loginForm.value.email.trim(), password: loginForm.value.password,
  }))
  if (!result) return
  applyUser(result.user)
  loginForm.value.password = ''
  await safely(loadData)
  showNotice(`เข้าสู่ระบบในฐานะ${result.user.roleLabel}`)
  navigate(currentHomeView.value)
}

async function logout() {
  isAccountMenuOpen.value = false
  await safely(() => api.logout())
  applyUser(null)
  bookings.value = []
  favorites.value = []
  applications.value = []
  await safely(loadData)
  navigate('home')
}

async function openAdminTraveler(traveler) {
  isAdminTravelerLoading.value = true
  const details = await safely(() => api.adminTraveler(traveler.id), 'โหลดข้อมูลนักท่องเที่ยวไม่สำเร็จ')
  if (details) selectedTraveler.value = details
  isAdminTravelerLoading.value = false
}

const serviceCategories = [
  { value: 'พบปะพูดคุย', label: 'พบปะพูดคุย', icon: 'comments', blurb: 'ทำความรู้จัก พูดคุย กินข้าวหรือกาแฟในบรรยากาศสบายๆ' },
  { value: 'ดื่มสังสรรค์', label: 'ดื่มสังสรรค์', icon: 'glass', blurb: 'เป็นเพื่อนดื่ม คาราโอเกะ หรือสังสรรค์ตามร้านที่ตกลง' },
  { value: 'ร่วมกิจกรรม', label: 'ร่วมกิจกรรม', icon: 'people-group', blurb: 'เที่ยว ช้อป ดูหนัง หรือกิจกรรมสั้นๆ ตามที่วางแผนไว้' },
  { value: 'งานอีเวนต์', label: 'งานอีเวนต์', icon: 'calendar-days', blurb: 'ร่วมงานเลี้ยง งานบริษัท หรืออีเวนต์ตามวันเวลาที่นัด' },
  { value: 'ไลฟ์สไตล์', label: 'ไลฟ์สไตล์', icon: 'sparkles', blurb: 'ถ่ายรูป คอนเทนต์ หรือใช้เวลาตามสไตล์ที่ตกลงกัน' },
]

const services = [
  { name: 'พบปะพูดคุย', duration: '60 นาที', description: 'ทำความรู้จักและพูดคุยตามขอบเขตที่ตกลง', add: 0 },
  { name: 'ดื่มสังสรรค์', duration: '90 นาที', description: 'เป็นเพื่อนดื่มหรือสังสรรค์ตามร้านที่ตกลง', add: 200 },
  { name: 'ร่วมกิจกรรม', duration: '90 นาที', description: 'ร่วมกิจกรรมสั้นๆ ตามแผนที่ตกลง', add: 300 },
  { name: 'งานอีเวนต์', duration: '180 นาที', description: 'ร่วมงานเลี้ยงหรืออีเวนต์ตามนัด', add: 500 },
  { name: 'ไลฟ์สไตล์', duration: '120 นาที', description: 'ถ่ายรูป คอนเทนต์ หรือไลฟ์สไตล์ตามตกลง', add: 400 },
]

function providerServices(provider) {
  if (provider.services?.length) return provider.services
  return services.map(({ add, ...service }) => ({ ...service, price: provider.price + add }))
}

function hasAppliedFilters(filters = appliedSearchFilters.value) {
  return Boolean(
    filters.name.trim()
    || filters.province
    || filters.gender
    || filters.mode
    || filters.service,
  )
}

const searchHasFilters = computed(() => hasAppliedFilters())
const activeSearchProvince = computed(() => appliedSearchFilters.value.province || '')
const searchFilterSummary = computed(() => {
  const parts = []
  if (activeSearchProvince.value) parts.push(activeSearchProvince.value)
  if (appliedSearchFilters.value.service) parts.push(appliedSearchFilters.value.service)
  if (appliedSearchFilters.value.gender) parts.push(appliedSearchFilters.value.gender)
  if (appliedSearchFilters.value.mode) parts.push(appliedSearchFilters.value.mode)
  if (appliedSearchFilters.value.name.trim()) parts.push(`“${appliedSearchFilters.value.name.trim()}”`)
  if (!parts.length) return 'ค้นหาผู้ให้บริการ ชื่อบริการ หรือพื้นที่'
  return `กำลังดู: ${parts.join(' · ')}`
})

const providersByProvince = computed(() => {
  const filters = appliedSearchFilters.value
  const term = filters.name.trim().toLocaleLowerCase()
  const counts = new Map()
  for (const provider of providers.value) {
    if (!isProviderPubliclyListed(provider) || !provider.province) continue
    const searchable = `${provider.name} ${provider.line} ${provider.area} ${provider.province} ${provider.category} ${provider.tags.join(' ')}`.toLocaleLowerCase()
    // นับตามจังหวัดโดยใช้ตัวกรองอื่นร่วมด้วย (ยกเว้นจังหวัด) เพื่อให้ตัวเลขสอดคล้องผลการค้นหา
    if (filters.gender && provider.gender !== filters.gender) continue
    if (filters.mode && !provider.modes.includes(filters.mode)) continue
    if (filters.service && !provider.tags.some((tag) => tag.toLocaleLowerCase().includes(filters.service.toLocaleLowerCase()))) continue
    if (term && !searchable.includes(term)) continue
    counts.set(provider.province, (counts.get(provider.province) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count || a.province.localeCompare(b.province, 'th'))
})

const visibleProviders = computed(() => {
  const filters = appliedSearchFilters.value
  if (!hasAppliedFilters(filters)) return []
  const term = filters.name.trim().toLocaleLowerCase()
  const results = providers.value.filter((provider) => {
    const searchable = `${provider.name} ${provider.line} ${provider.area} ${provider.province} ${provider.category} ${provider.tags.join(' ')}`.toLocaleLowerCase()
    return isProviderPubliclyListed(provider) &&
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
const activeProviderCount = computed(() => providers.value.filter((provider) => isProviderPubliclyListed(provider)).length)
const sellerProvider = computed(() => providers.value.find((provider) => provider.id === memberSellerProviderId.value))
const sellerBookings = computed(() => bookings.value.filter((item) => item.providerId === memberSellerProviderId.value))

watch([adminProviderSearch, adminProviderProvince, adminProviderGender], () => {
  adminProviderPage.value = 1
})

watch(() => membership.value.role, (role) => {
  if (role !== 'seller') clearMembershipProfilePhoto()
  if (membershipStep.value > membershipSteps.value.length) membershipStep.value = membershipSteps.value.length
})

function emptyAdminService(price = 1500) {
  return { name: 'พบปะพูดคุย', duration: '60 นาที', description: 'ทำความรู้จักและพูดคุยตามขอบเขตที่ตกลง', price }
}

function emptyAdminPartnerForm() {
  return {
    name: '',
    gender: '',
    province: '',
    venue: '',
    age: null,
    heightCm: null,
    weightKg: null,
    measurements: '',
    price: 1500,
    description: '',
    line: '',
    facebook: '',
    email: '',
    password: '',
    membershipExpiresAt: defaultMembershipExpiryLocal(),
    publishNow: false,
    services: [emptyAdminService()],
    media: [],
  }
}

function resetAdminPartnerForm() {
  for (const item of adminPartnerForm.value?.media || []) {
    if (String(item.url || '').startsWith('blob:')) URL.revokeObjectURL(item.url)
  }
  adminPartnerForm.value = emptyAdminPartnerForm()
}

function addAdminCreateService() {
  const form = adminPartnerForm.value
  if (form.services.length >= 30) {
    showNotice('เพิ่มรูปแบบบริการได้สูงสุด 30 รายการ')
    return
  }
  form.services.push({ name: '', duration: '60 นาที', description: '', price: Number(form.price) || 1500 })
}

function removeAdminCreateService(index) {
  const form = adminPartnerForm.value
  if (form.services.length <= 1) {
    showNotice('ต้องมีรูปแบบบริการอย่างน้อย 1 รายการ')
    return
  }
  form.services.splice(index, 1)
}

function addAdminCreateMedia(event) {
  const input = event.target
  const files = Array.from(input.files || []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
  input.value = ''
  if (!files.length) {
    showNotice('กรุณาเลือกรูปภาพหรือวิดีโอ')
    return
  }
  adminPartnerForm.value.media = [
    ...adminPartnerForm.value.media,
    ...files.map((file) => ({
      id: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      file,
    })),
  ]
}

function removeAdminCreateMedia(mediaId) {
  const current = adminPartnerForm.value.media.find((item) => item.id === mediaId)
  if (current?.url && String(current.url).startsWith('blob:')) URL.revokeObjectURL(current.url)
  adminPartnerForm.value.media = adminPartnerForm.value.media.filter((item) => item.id !== mediaId)
}

function replaceAdminCreateMedia(media, event) {
  const input = event.target
  const file = Array.from(input.files || []).find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'))
  input.value = ''
  if (!media || !file) {
    showNotice('กรุณาเลือกรูปภาพหรือวิดีโอ')
    return
  }
  if (media.url && String(media.url).startsWith('blob:')) URL.revokeObjectURL(media.url)
  media.name = file.name
  media.type = file.type.startsWith('video/') ? 'video' : 'image'
  media.url = URL.createObjectURL(file)
  media.file = file
}

function openAdminPartnerMedia(provider) {
  adminCreatingPartner.value = false
  adminEditingProvider.value = provider
  adminTab.value = 'providers'
}

function closeAdminPartnerMedia() {
  adminEditingProvider.value = null
}

function openAdminCreatePartner() {
  adminEditingProvider.value = null
  adminPartnerSaveError.value = ''
  resetAdminPartnerForm()
  adminCreatingPartner.value = true
  adminTab.value = 'providers'
}

function closeAdminCreatePartner() {
  adminCreatingPartner.value = false
  adminPartnerSaveError.value = ''
  resetAdminPartnerForm()
}

function failAdminCreate(message) {
  adminPartnerSaveError.value = message
  showNotice(message)
  nextTick(() => {
    document.querySelector('.lux-admin-create-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function submitAdminCreatePartner() {
  if (isAdminPartnerSaving.value) return
  adminPartnerSaveError.value = ''
  const form = adminPartnerForm.value
  const name = String(form.name || '').trim()
  const description = String(form.description || '').trim()
  const measurements = String(form.measurements || '').trim()
  const venue = String(form.venue || '').trim()
  const email = String(form.email || '').trim().toLowerCase()
  const password = String(form.password || '')
  if (!name) return failAdminCreate('กรุณาระบุชื่อพาร์ตเนอร์')
  if (!form.gender) return failAdminCreate('กรุณาเลือกอัตลักษณ์ทางเพศ')
  if (!form.province) return failAdminCreate('กรุณาเลือกจังหวัด')
  if (!venue) return failAdminCreate('กรุณาระบุสถานที่ให้บริการ')
  if (!Number.isInteger(Number(form.age)) || Number(form.age) < 18 || Number(form.age) > 100) {
    return failAdminCreate('กรุณากรอกอายุระหว่าง 18–100 ปี')
  }
  if (!Number.isInteger(Number(form.heightCm)) || Number(form.heightCm) < 120 || Number(form.heightCm) > 230) {
    return failAdminCreate('กรุณากรอกส่วนสูงระหว่าง 120–230 ซม.')
  }
  if (!Number.isFinite(Number(form.weightKg)) || Number(form.weightKg) < 30 || Number(form.weightKg) > 250) {
    return failAdminCreate('กรุณากรอกน้ำหนักระหว่าง 30–250 กก.')
  }
  if (!measurements) return failAdminCreate('กรุณากรอกสัดส่วน')
  if (!Number.isInteger(Number(form.price)) || Number(form.price) < 1) return failAdminCreate('กรุณากรอกราคาเริ่มต้น')
  if (!description) return failAdminCreate('กรุณากรอกรายละเอียดบริการ')
  if (!String(form.line || '').trim() && !String(form.facebook || '').trim()) {
    return failAdminCreate('กรุณากรอก LINE หรือ Facebook อย่างน้อย 1 ช่อง')
  }
  if (!form.membershipExpiresAt) return failAdminCreate('กรุณาระบุวันหมดอายุสมาชิก')
  if (email && password.length < 6) return failAdminCreate('ถ้าสร้างบัญชี รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  if (password && !email) return failAdminCreate('กรุณากรอกอีเมลถ้าต้องการสร้างบัญชีเข้าสู่ระบบ')
  const services = []
  const serviceNames = new Set()
  for (const item of form.services || []) {
    const serviceName = String(item.name || '').trim()
    const duration = String(item.duration || '').trim()
    const serviceDescription = String(item.description || '').trim()
    const servicePrice = Number(item.price)
    const nameKey = serviceName.toLocaleLowerCase()
    if (!serviceName || !duration || !serviceDescription || !Number.isInteger(servicePrice) || servicePrice < 1) {
      return failAdminCreate('กรุณากรอกชื่อ ระยะเวลา รายละเอียด และราคาของแต่ละรูปแบบงานให้ครบ')
    }
    if (serviceNames.has(nameKey)) return failAdminCreate('ชื่อรูปแบบงานต้องไม่ซ้ำกัน')
    serviceNames.add(nameKey)
    services.push({ name: serviceName, duration, description: serviceDescription, price: servicePrice })
  }
  if (!services.length) return failAdminCreate('ต้องมีรูปแบบงานอย่างน้อย 1 รายการ')

  isAdminPartnerSaving.value = true
  try {
    const saved = await safely(() => api.createAdminProvider({
      name,
      gender: form.gender,
      province: form.province,
      venue,
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      measurements,
      price: Number(form.price),
      description,
      line: form.line,
      facebook: form.facebook,
      email,
      password,
      membershipExpiresAt: form.membershipExpiresAt,
      publishNow: Boolean(form.publishNow),
      services,
    }))
    if (!saved) {
      const raw = notice.value || 'บันทึกพาร์ตเนอร์ไม่สำเร็จ'
      failAdminCreate(raw === 'ไม่พบ API' ? 'เซิร์ฟเวอร์ยังไม่อัปเดตเส้นทางบันทึกพาร์ตเนอร์ กรุณารีเฟรชหน้าแล้วลองใหม่' : raw)
      return
    }
    const draftFiles = form.media.filter((item) => item.file)
    const uploaded = []
    for (const item of draftFiles) {
      const media = await safely(() => api.uploadMedia(saved.id, item.file))
      if (media) uploaded.push({ ...media, name: item.name || media.name })
    }
    for (const media of uploaded) {
      if (media.name && media.name !== media.id) {
        const renamed = await safely(() => api.updateMedia(media.id, { name: media.name }))
        if (renamed) media.name = renamed.name
      }
    }
    saved.media = uploaded
    providers.value = [saved, ...providers.value.filter((item) => item.id !== saved.id)]
    closeAdminCreatePartner()
    showNotice(saved.hasAccount
      ? `เพิ่มพาร์ตเนอร์ ${saved.name} พร้อมบัญชีแล้ว${uploaded.length ? ` · อัปโหลดสื่อ ${uploaded.length} ไฟล์` : ''}`
      : `เพิ่มพาร์ตเนอร์ ${saved.name} แล้ว${uploaded.length ? ` · อัปโหลดสื่อ ${uploaded.length} ไฟล์` : ''}`)
  } finally {
    isAdminPartnerSaving.value = false
  }
}

async function addProviderMedia(provider, event) {
  const input = event.target
  const files = Array.from(input.files || [])
  input.value = ''

  const acceptedFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
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

async function addSellerMedia(event) {
  return addProviderMedia(sellerProvider.value, event)
}

async function addAdminPartnerMedia(event) {
  return addProviderMedia(adminEditingProvider.value, event)
}

async function addAdminPartnerMediaTo(provider, event) {
  return addProviderMedia(provider, event)
}

async function removeProviderMedia(provider, mediaId) {
  if (!provider) return
  if (await safely(() => api.deleteMedia(mediaId))) {
    provider.media = (provider.media || []).filter((item) => item.id !== mediaId)
    showNotice('ลบผลงานแล้ว')
  }
}

async function removeSellerMedia(mediaId) {
  return removeProviderMedia(sellerProvider.value, mediaId)
}

async function removeAdminPartnerMedia(mediaId) {
  return removeProviderMedia(adminEditingProvider.value, mediaId)
}

async function renameProviderMedia(provider, media) {
  if (!provider || !media) return
  const name = String(media.name || '').trim()
  if (!name) {
    showNotice('กรุณาระบุชื่อผลงาน')
    return
  }
  const saved = await safely(() => api.updateMedia(media.id, { name }))
  if (saved) {
    media.name = saved.name
    showNotice('บันทึกชื่อผลงานแล้ว')
  }
}

async function renameSellerMedia(media) {
  return renameProviderMedia(sellerProvider.value, media)
}

async function renameAdminPartnerMedia(media) {
  return renameProviderMedia(adminEditingProvider.value, media)
}

async function replaceProviderMedia(provider, media, event) {
  const input = event.target
  const file = Array.from(input.files || []).find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'))
  input.value = ''
  if (!provider || !media || !file) {
    showNotice('กรุณาเลือกรูปภาพหรือวิดีโอ')
    return
  }
  const uploaded = await safely(() => api.uploadMedia(provider.id, file))
  if (!uploaded) return
  if (await safely(() => api.deleteMedia(media.id))) {
    provider.media = (provider.media || []).map((item) => (item.id === media.id ? uploaded : item))
    showNotice('เปลี่ยนไฟล์ผลงานแล้ว')
  } else {
    provider.media = [...(provider.media || []), uploaded]
  }
}

async function replaceSellerMedia(media, event) {
  return replaceProviderMedia(sellerProvider.value, media, event)
}

async function replaceAdminPartnerMedia(media, event) {
  return replaceProviderMedia(adminEditingProvider.value, media, event)
}

function flashSellerAlert(message, ok = false) {
  sellerSaveAlert.value = message
  showNotice(message)
  nextTick(() => {
    document.getElementById('seller-save-alert')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
  if (ok) {
    window.setTimeout(() => {
      if (sellerSaveAlert.value === message) sellerSaveAlert.value = ''
    }, 5000)
  }
}

async function saveSellerProfile() {
  const provider = sellerProvider.value
  if (!provider) {
    flashSellerAlert('ไม่พบโปรไฟล์ผู้ขาย')
    return
  }
  const measurements = String(provider.measurements || '').trim()
  const description = String(provider.description || '').trim()
  if (!Number.isInteger(Number(provider.age)) || Number(provider.age) < 18 || Number(provider.age) > 100 ||
      !Number.isInteger(Number(provider.heightCm)) || Number(provider.heightCm) < 120 || Number(provider.heightCm) > 230 ||
      !Number.isInteger(Number(provider.weightKg)) || Number(provider.weightKg) < 30 || Number(provider.weightKg) > 250 ||
      !measurements || measurements.length > 80) {
    flashSellerAlert('กรุณากรอกอายุ ส่วนสูง น้ำหนัก และสัดส่วนให้ถูกต้อง')
    return
  }
  if (!description) {
    flashSellerAlert('กรุณากรอกรายละเอียดบริการ')
    return
  }
  if (!String(provider.name || '').trim() || !String(provider.province || '').trim() || !String(provider.venue || '').trim() ||
      !Number.isFinite(Number(provider.price)) || Number(provider.price) < 1) {
    flashSellerAlert('กรุณากรอกชื่อ จังหวัด ราคา และสถานที่ให้บริการให้ครบ')
    return
  }
  const services = Array.isArray(provider.services) ? provider.services : []
  const serviceNames = services.map((service) => String(service.name || '').trim().toLocaleLowerCase())
  if (!services.length || services.length > 30 ||
      services.some((service) => !String(service.name || '').trim() || String(service.name || '').trim().length > 60 ||
        !String(service.duration || '').trim() || String(service.duration || '').trim().length > 40 ||
        !String(service.description || '').trim() || String(service.description || '').trim().length > 200 ||
        !Number.isInteger(Number(service.price)) || Number(service.price) < 1 || Number(service.price) > 1000000) ||
      new Set(serviceNames).size !== serviceNames.length) {
    flashSellerAlert('กำหนดรูปแบบบริการ 1–30 รายการ กรอกชื่อ ระยะเวลา รายละเอียด และราคาให้ครบ โดยชื่อห้ามซ้ำ')
    return
  }
  try {
    const saved = await api.updateProvider(provider.id, {
      name: String(provider.name).trim(),
      age: Number(provider.age),
      heightCm: Number(provider.heightCm),
      weightKg: Number(provider.weightKg),
      measurements,
      price: Number(provider.price),
      description,
      venue: String(provider.venue).trim(),
      province: String(provider.province).trim(),
      services,
      line: String(provider.line || '').trim(),
      facebook: String(provider.facebook || '').trim(),
    })
    providers.value = providers.value.map((item) => (
      item.id === saved.id
        ? { ...item, ...saved, line: saved.line || '', facebook: saved.facebook || '' }
        : item
    ))
    flashSellerAlert('บันทึกข้อมูลบริการแล้ว', true)
  } catch (error) {
    flashSellerAlert(error?.message || 'บันทึกข้อมูลบริการไม่สำเร็จ')
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

function providerLineUrl(provider) {
  const id = String(provider?.line || '').trim().replace(/^@+/, '')
  if (!id) return ''
  return `https://line.me/ti/p/~${encodeURIComponent(id)}`
}

function providerFacebookUrl(provider) {
  const value = String(provider?.facebook || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (/facebook\.com|fb\.com|fb\.me/i.test(value)) return `https://${value.replace(/^\/+/, '')}`
  return `https://www.facebook.com/${value.replace(/^\/+/, '')}`
}

function openProviderContact(url) {
  if (!url) return
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) window.location.assign(url)
}

function openOwnerLine() {
  openProviderContact(ownerLineUrl)
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

function toDatetimeLocalValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultMembershipExpiryLocal(days = 30) {
  const date = new Date(Date.now() + days * 86400000)
  return toDatetimeLocalValue(date)
}

function isProviderPubliclyListed(provider) {
  if (!provider?.active || !provider.membershipActive) return false
  if (!provider.membershipExpiresAt) return true
  return new Date(provider.membershipExpiresAt).getTime() > Date.now()
}

async function saveProviderExpiry(provider, event) {
  const value = event?.target?.value || ''
  const saved = await safely(
    () => api.setProviderStatus(provider.id, { membershipExpiresAt: value || null }),
    'บันทึกวันหมดอายุไม่สำเร็จ',
  )
  if (!saved) return
  providers.value = providers.value.map((item) => (item.id === saved.id ? saved : item))
  showNotice(value ? `ตั้งวันหมดอายุของ ${provider.name} แล้ว` : `ล้างวันหมดอายุของ ${provider.name} แล้ว`)
}

async function deleteAdminTraveler(traveler) {
  if (!can('user:delete')) {
    showNotice('ไม่มีสิทธิ์ลบบัญชี')
    return
  }
  const label = traveler.name || traveler.email
  if (!window.confirm(`ลบบัญชีนักท่องเที่ยว "${label}" ถาวรหรือไม่?\nรายการโปรด/รีวิวที่เกี่ยวข้องจะถูกลบหรือยกเลิกการผูกกับบัญชีนี้`)) return
  const result = await safely(() => api.deleteAdminUser(traveler.id), 'ลบบัญชีไม่สำเร็จ')
  if (!result) return
  adminTravelers.value = adminTravelers.value.filter((item) => item.id !== traveler.id)
  if (selectedTraveler.value?.traveler?.id === traveler.id) selectedTraveler.value = null
  showNotice(`ลบบัญชีนักท่องเที่ยว ${label} แล้ว`)
}

async function deleteAdminProviderAccount(provider) {
  if (!can('user:delete')) {
    showNotice('ไม่มีสิทธิ์ลบบัญชี')
    return
  }
  if (!window.confirm(`ลบบัญชีผู้ขาย "${provider.name}" พร้อมโปรไฟล์ทั้งหมดถาวรหรือไม่?`)) return
  const result = await safely(() => api.deleteAdminProvider(provider.id), 'ลบผู้ขายไม่สำเร็จ')
  if (!result) return
  providers.value = providers.value.filter((item) => item.id !== provider.id)
  if (adminEditingProvider.value?.id === provider.id) adminEditingProvider.value = null
  if (selectedProvider.value?.id === provider.id) {
    selectedProvider.value = null
    if (view.value === 'profile') navigate('admin')
  }
  showNotice(`ลบผู้ขาย ${provider.name} แล้ว`)
}

function onAccountButton() {
  if (window.matchMedia('(max-width: 680px)').matches) {
    isAccountMenuOpen.value = !isAccountMenuOpen.value
    return
  }
  openOwnArea()
}

function navigate(nextView) {
  isSearchFilterOpen.value = false
  isAccountMenuOpen.value = false
  if (nextView === 'apply') {
    membership.value.role = 'seller'
    nextView = 'membership'
  }
  const guard = protectedViews[nextView]
  if (guard && (!can(guard[0]) || (guard[1] && currentRole.value !== guard[1]))) {
    if (currentUser.value) {
      showNotice('บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้านี้')
      nextView = currentHomeView.value
    } else {
      showNotice('กรุณาเข้าสู่ระบบก่อน')
      nextView = 'login'
    }
  }
  const leavingSeek = view.value === 'seek' && nextView !== 'seek'
  view.value = nextView
  if (leavingSeek) {
    selectedSeekPost.value = null
    isSeekComposeOpen.value = false
    stopSeekRealtime()
    stopSeekBoardPolling()
  }
  if (nextView === 'seek') {
    safely(() => loadSeekPosts(), 'โหลดโพสหาผู้ให้บริการไม่สำเร็จ')
    startSeekBoardPolling()
  }
  isCompactMenuOpen.value = false
  if (nextView !== 'profile') clearSharedProfileUrl()
  window.scrollTo({ top: 0, behavior: 'auto' })
}

function resetSeekForm() {
  seekForm.value = {
    title: '',
    province: seekBoardFilter.value.province || '',
    venue: '',
    budget: '',
    duration: '',
    description: '',
  }
  seekFormErrors.value = {}
}

function openSeekCompose() {
  if (!can('seek:create')) {
    showNotice('นักท่องเที่ยวเท่านั้นที่สร้างโพสหาได้')
    return
  }
  resetSeekForm()
  isSeekComposeOpen.value = true
}

function closeSeekCompose() {
  if (isSeekSubmitting.value) return
  isSeekComposeOpen.value = false
  seekFormErrors.value = {}
}

function stopSeekRealtime() {
  if (seekEventSource) {
    seekEventSource.close()
    seekEventSource = null
  }
  if (seekPollTimer) {
    window.clearInterval(seekPollTimer)
    seekPollTimer = 0
  }
  seekRealtimeConnected.value = false
}

function stopSeekBoardPolling() {
  if (seekBoardPollTimer) {
    window.clearInterval(seekBoardPollTimer)
    seekBoardPollTimer = 0
  }
}

async function refreshSelectedSeekPost({ silent = false } = {}) {
  if (!selectedSeekPost.value?.id) return
  try {
    const detail = await api.seekPost(selectedSeekPost.value.id)
    selectedSeekPost.value = detail
    const count = detail.comments?.length || 0
    seekPosts.value = seekPosts.value.map((post) => (
      post.id === detail.id ? { ...post, commentCount: count, status: detail.status } : post
    ))
    mySeekPosts.value = mySeekPosts.value.map((post) => (
      post.id === detail.id ? { ...post, commentCount: count, status: detail.status } : post
    ))
  } catch (error) {
    if (!silent) showNotice(error.message || 'โหลดรายละเอียดโพสไม่สำเร็จ')
  }
}

function startSeekRealtime(postId) {
  stopSeekRealtime()
  if (!postId || !can('seek:view') || typeof EventSource === 'undefined') {
    seekPollTimer = window.setInterval(() => {
      refreshSelectedSeekPost({ silent: true })
    }, 4000)
    return
  }
  const source = new EventSource(api.seekPostStreamUrl(postId), { withCredentials: true })
  seekEventSource = source
  source.addEventListener('ready', () => {
    seekRealtimeConnected.value = true
  })
  source.addEventListener('seek', () => {
    refreshSelectedSeekPost({ silent: true })
  })
  source.onerror = () => {
    seekRealtimeConnected.value = false
    source.close()
    if (seekEventSource === source) seekEventSource = null
    if (!seekPollTimer) {
      seekPollTimer = window.setInterval(() => {
        refreshSelectedSeekPost({ silent: true })
      }, 4000)
    }
  }
}

function startSeekBoardPolling() {
  stopSeekBoardPolling()
  if (!can('seek:view')) return
  seekBoardPollTimer = window.setInterval(() => {
    if (view.value === 'seek' || (view.value === 'seller' && sellerDashboardTab.value === 'seek')) {
      loadSeekPosts().catch(() => {})
    }
  }, 12000)
}

async function openSeekPost(postId) {
  seekDetailLoading.value = true
  seekCommentDraft.value = ''
  editingSeekCommentId.value = null
  editingSeekCommentBody.value = ''
  stopSeekRealtime()
  const detail = await safely(() => api.seekPost(postId), 'โหลดรายละเอียดโพสไม่สำเร็จ')
  seekDetailLoading.value = false
  if (!detail) return
  if (view.value !== 'seek') {
    view.value = 'seek'
    await safely(() => loadSeekPosts(), 'โหลดโพสหาผู้ให้บริการไม่สำเร็จ')
  }
  selectedSeekPost.value = detail
  startSeekRealtime(detail.id)
}

function validateSeekForm() {
  const errors = {}
  if (!seekForm.value.title.trim()) errors.title = 'กรุณากรอกหัวข้อ'
  if (!seekForm.value.province) errors.province = 'กรุณาเลือกจังหวัด'
  if (!seekForm.value.venue.trim()) errors.venue = 'กรุณากรอกร้าน'
  if (!seekForm.value.budget.trim()) errors.budget = 'กรุณากรองบประมาณ'
  if (!seekForm.value.duration.trim()) errors.duration = 'กรุณากรอกระยะเวลา'
  seekFormErrors.value = errors
  return !Object.keys(errors).length
}

async function submitSeekPost() {
  if (!can('seek:create')) {
    showNotice('นักท่องเที่ยวเท่านั้นที่สร้างโพสหาได้')
    return
  }
  if (!validateSeekForm() || isSeekSubmitting.value) return
  isSeekSubmitting.value = true
  const created = await safely(() => api.createSeekPost({
    title: seekForm.value.title,
    province: seekForm.value.province,
    venue: seekForm.value.venue,
    budget: seekForm.value.budget,
    duration: seekForm.value.duration,
    description: seekForm.value.description,
  }), 'สร้างโพสไม่สำเร็จ')
  isSeekSubmitting.value = false
  if (!created) return
  isSeekComposeOpen.value = false
  resetSeekForm()
  showNotice('โพสหาผู้ให้บริการแล้ว')
  if (created.province) seekBoardFilter.value.province = created.province
  await loadSeekPosts()
  selectedSeekPost.value = created
  await refreshSelectedSeekPost()
}

async function closeSeekPost(post) {
  if (!post?.id) return
  if (!window.confirm('ปิดรับโพสนี้เมื่อได้ผู้ให้บริการแล้วใช่ไหม?')) return
  const closed = await safely(() => api.closeSeekPost(post.id), 'ปิดรับโพสไม่สำเร็จ')
  if (!closed) return
  showNotice('ปิดรับโพสแล้ว')
  await loadSeekPosts()
  if (selectedSeekPost.value?.id === post.id) await refreshSelectedSeekPost()
}

async function submitSeekComment() {
  if (!can('seek:comment') || !selectedSeekPost.value?.id) return
  const body = seekCommentDraft.value.trim()
  if (body.length < 2) {
    showNotice('กรุณากรอกข้อความคอมเมนต์')
    return
  }
  const created = await safely(
    () => api.createSeekComment(selectedSeekPost.value.id, { body }),
    'ส่งคอมเมนต์ไม่สำเร็จ',
  )
  if (!created) return
  seekCommentDraft.value = ''
  showNotice('ส่งคอมเมนต์แล้ว')
  await refreshSelectedSeekPost()
  await loadSeekPosts()
}

function startEditSeekComment(comment) {
  editingSeekCommentId.value = comment.id
  editingSeekCommentBody.value = comment.body
}

function cancelEditSeekComment() {
  editingSeekCommentId.value = null
  editingSeekCommentBody.value = ''
}

async function saveSeekComment(comment) {
  const body = editingSeekCommentBody.value.trim()
  if (body.length < 2) {
    showNotice('กรุณากรอกข้อความคอมเมนต์')
    return
  }
  const saved = await safely(() => api.updateSeekComment(comment.id, { body }), 'แก้ไขคอมเมนต์ไม่สำเร็จ')
  if (!saved) return
  cancelEditSeekComment()
  showNotice('แก้ไขคอมเมนต์แล้ว')
  await refreshSelectedSeekPost()
}

async function removeSeekComment(comment) {
  if (!window.confirm('ลบคอมเมนต์นี้ใช่ไหม?')) return
  const result = await safely(() => api.deleteSeekComment(comment.id), 'ลบคอมเมนต์ไม่สำเร็จ')
  if (!result) return
  showNotice('ลบคอมเมนต์แล้ว')
  await refreshSelectedSeekPost()
  await loadSeekPosts()
}

async function applySeekBoardFilter() {
  await safely(() => loadSeekPosts(), 'โหลดโพสหาผู้ให้บริการไม่สำเร็จ')
}

async function openSearchFilters(options = {}) {
  if (options.sync !== false) {
    searchName.value = appliedSearchFilters.value.name
    selectedProvince.value = appliedSearchFilters.value.province
    selectedGender.value = appliedSearchFilters.value.gender
    selectedMode.value = appliedSearchFilters.value.mode
    selectedService.value = appliedSearchFilters.value.service
  }
  isSearchFilterOpen.value = true
  await nextTick()
  const canFocusWithoutZoom = window.matchMedia('(min-width: 681px) and (pointer: fine)').matches
  if (canFocusWithoutZoom) searchFilterInput.value?.focus()
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
  const next = {
    name: searchName.value,
    province: selectedProvince.value,
    gender: selectedGender.value,
    mode: selectedMode.value,
    service: selectedService.value,
  }
  if (!hasAppliedFilters(next)) {
    appliedSearchFilters.value = { name: '', province: '', gender: '', mode: '', service: '' }
    showNotice('กรุณาเลือกเงื่อนไขค้นหาบริการอย่างน้อย 1 รายการ')
    return
  }
  appliedSearchFilters.value = next
  if (view.value === 'search') closeSearchFilters()
  else navigate('search')
}

function clearSearchFilters() {
  resetSearchFilters()
  appliedSearchFilters.value = { name: '', province: '', gender: '', mode: '', service: '' }
}

function searchWithFilters(overrides = {}) {
  if (overrides.name !== undefined) searchName.value = overrides.name
  if (overrides.province !== undefined) selectedProvince.value = overrides.province
  if (overrides.gender !== undefined) selectedGender.value = overrides.gender
  if (overrides.mode !== undefined) selectedMode.value = overrides.mode
  if (overrides.service !== undefined) selectedService.value = overrides.service
  applySearchFilters()
  navigate('search')
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


async function openProfile(provider, { fromHistory = false } = {}) {
  selectedProvider.value = provider
  profileBookingMode.value = provider.modes?.includes(profileBookingMode.value)
    ? profileBookingMode.value
    : provider.modes?.[0] || ''
  selectedReviews.value = []
  reviewableBookingIds.value = []
  reviewForm.value = { bookingId: '', serviceRating: 5, valueRating: 5, comment: '' }
  clearReviewImages()
  navigate('profile')
  if (!fromHistory) rememberSharedProfile(provider.id)
  document.title = `${provider.name} | นัวเนีย NuaNia`
  await safely(() => loadProviderReviews(provider.id), 'โหลดรีวิวไม่สำเร็จ')
}

function sharedProfileId() {
  const match = window.location.pathname.match(/^\/p\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}

function profileShareUrl(id) {
  return `${window.location.origin}/p/${id}`
}

function rememberSharedProfile(id) {
  const path = `/p/${id}`
  if (window.location.pathname !== path) history.pushState({ profileId: id }, '', path)
}

function clearSharedProfileUrl() {
  document.title = 'นัวเนีย NuaNia | รวมเด็กเอ็น เด็กเอ็นเชียงใหม่ เด็กเอ็นสุราษ เด็กเอ็นพัทยา'
  if (!sharedProfileId()) return
  history.pushState({}, '', '/')
}

async function openSharedProfileFromUrl() {
  const id = sharedProfileId()
  if (!id) return
  const provider = providers.value.find((item) => item.id === id && isProviderPubliclyListed(item))
  if (!provider) {
    showNotice('ไม่พบโปรไฟล์นี้ หรือโปรไฟล์ยังไม่เผยแพร่')
    history.replaceState({}, '', '/')
    return
  }
  await openProfile(provider, { fromHistory: true })
}

function onProfilePopState() {
  const id = sharedProfileId()
  if (!id) {
    if (view.value === 'profile') {
      selectedProvider.value = null
      view.value = 'home'
      document.title = 'นัวเนีย NuaNia | รวมเด็กเอ็น เด็กเอ็นเชียงใหม่ เด็กเอ็นสุราษ เด็กเอ็นพัทยา'
    }
    return
  }
  const provider = providers.value.find((item) => item.id === id && isProviderPubliclyListed(item))
  if (!provider) {
    showNotice('ไม่พบโปรไฟล์นี้ หรือโปรไฟล์ยังไม่เผยแพร่')
    selectedProvider.value = null
    view.value = 'home'
    return
  }
  openProfile(provider, { fromHistory: true })
}

async function shareProviderProfile(provider) {
  if (!isProviderPubliclyListed(provider)) {
    showNotice('โปรไฟล์นี้ยังไม่เผยแพร่ จึงแชร์ให้คนอื่นเปิดไม่ได้')
    return
  }
  const url = profileShareUrl(provider.id)
  if (navigator.share) {
    try {
      await navigator.share({ title: `${provider.name} | นัวเนีย`, text: provider.name, url })
      return
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    showNotice('คัดลอกลิงก์โปรไฟล์แล้ว')
  } catch {
    showNotice(url)
  }
}

async function openSeekCommentProfile(comment) {
  const providerId = comment?.author?.providerId
  if (!providerId) {
    showNotice('ไม่พบโปรไฟล์ผู้ให้บริการ')
    return
  }
  let provider = providers.value.find((item) => item.id === providerId)
  if (!provider) {
    await safely(() => loadData(), 'โหลดโปรไฟล์ไม่สำเร็จ')
    provider = providers.value.find((item) => item.id === providerId)
  }
  if (!provider) {
    showNotice('ไม่พบโปรไฟล์ผู้ให้บริการ หรือโปรไฟล์ยังไม่เผยแพร่')
    return
  }
  await openProfile(provider)
}

function providerPreviewMedia(provider) {
  return provider.media?.find((media) => media.type === 'image') || provider.media?.[0]
}

function providerHasVideo(provider) {
  return Boolean(provider.media?.some((media) => media.type === 'video'))
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
    const reviewCount = result.reviews.length
    const avg = reviewCount
      ? (result.reviews.reduce((sum, review) => sum + (review.serviceRating + review.valueRating) / 2, 0) / reviewCount).toFixed(2)
      : 'ใหม่'
    selectedProvider.value = { ...selectedProvider.value, reviews: reviewCount, rating: avg }
    providers.value = providers.value.map((provider) => (
      provider.id === providerId ? { ...provider, reviews: reviewCount, rating: avg } : provider
    ))
  }
  return true
}

async function loadSellerReviews(providerId) {
  const result = await api.providerReviews(providerId)
  sellerReviews.value = [...(result.reviews || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return true
}

const sellerReviewSummary = computed(() => {
  if (!sellerReviews.value.length) return null
  const totals = sellerReviews.value.reduce((summary, review) => ({
    service: summary.service + review.serviceRating,
    value: summary.value + review.valueRating,
  }), { service: 0, value: 0 })
  const count = sellerReviews.value.length
  return {
    count,
    service: (totals.service / count).toFixed(1),
    value: (totals.value / count).toFixed(1),
  }
})

async function submitReview() {
  if (!can('review:create')) {
    showNotice(currentUser.value ? 'บัญชีนี้ไม่สามารถเขียนรีวิวได้' : 'กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว')
    navigate(currentUser.value ? currentHomeView.value : 'login')
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

function startBooking() {
  showNotice('เว็บนี้ไม่รองรับการนัดหมายออนไลน์ กรุณาติดต่อผู้ให้บริการโดยตรงผ่าน LINE หรือ Facebook')
}

async function submitBooking() {
  showNotice('เว็บนี้ไม่รองรับการนัดหมายออนไลน์ กรุณาติดต่อผู้ให้บริการโดยตรงผ่าน LINE หรือ Facebook')
}

async function toggleFavorite(provider) {
  if (!can('favorite:manage')) {
    showNotice(currentUser.value ? 'บัญชีนี้ไม่สามารถบันทึกรายการโปรดได้' : 'กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด')
    navigate(currentUser.value ? currentHomeView.value : 'login')
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

function clearMembershipProfilePhoto() {
  if (membershipProfilePhoto.value?.previewUrl) URL.revokeObjectURL(membershipProfilePhoto.value.previewUrl)
  membershipProfilePhoto.value = null
}

function selectMembershipProfilePhoto(event) {
  const input = event.target
  const file = input.files?.[0]
  input.value = ''
  clearMembershipProfilePhoto()
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showNotice('กรุณาเลือกรูปภาพโปรไฟล์ (JPG, PNG, WebP หรือ GIF)')
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    showNotice('รูปโปรไฟล์ต้องมีขนาดไม่เกิน 8 MB')
    return
  }
  membershipProfilePhoto.value = { file, previewUrl: URL.createObjectURL(file) }
}

function validateMembershipStep(step = membershipStep.value) {
  const data = membership.value
  clearMembershipErrors()
  if (step === 1) return true
  if (step === 2) {
    let ok = true
    if (!data.name.trim()) {
      setMembershipError('name', 'กรุณากรอกชื่อที่ใช้แสดง')
      ok = false
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
      setMembershipError('email', 'กรุณากรอกอีเมลให้ถูกต้อง')
      ok = false
    }
    if (data.password.length < 8) {
      setMembershipError('password', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      ok = false
    }
    if (data.password !== data.passwordConfirm) {
      setMembershipError('passwordConfirm', 'รหัสผ่านไม่ตรงกัน')
      ok = false
    }
    return ok
  }
  if (data.role !== 'seller') return true
  if (step === 3) {
    let ok = true
    if (!data.province) {
      setMembershipError('province', 'กรุณาเลือกจังหวัดที่ให้บริการ')
      ok = false
    }
    if (!Number.isFinite(Number(data.price)) || Number(data.price) < 50) {
      setMembershipError('price', 'กรุณากรอกราคาเริ่มต้น')
      ok = false
    }
    if (!Number.isInteger(Number(data.age)) || Number(data.age) < 18 || Number(data.age) > 100) {
      setMembershipError('age', 'กรุณากรอกอายุระหว่าง 18–100 ปี')
      ok = false
    }
    if (!Number.isFinite(Number(data.weightKg)) || Number(data.weightKg) < 30 || Number(data.weightKg) > 250) {
      setMembershipError('weightKg', 'กรุณากรอกน้ำหนักระหว่าง 30–250 กก.')
      ok = false
    }
    if (!String(data.measurements || '').trim()) {
      setMembershipError('measurements', 'กรุณากรอกสัดส่วน')
      ok = false
    }
    return ok
  }
  if (step === 4) {
    let ok = true
    if (!data.line.trim() && !data.facebook.trim()) {
      setMembershipError('contact', 'กรุณากรอก LINE หรือ Facebook อย่างน้อย 1 ช่อง')
      ok = false
    }
    if (!data.service.trim()) {
      setMembershipError('service', 'กรุณากรอกรายละเอียดโปรไฟล์')
      ok = false
    }
    return ok
  }
  if (step === 5) {
    if (!membershipProfilePhoto.value?.file) {
      setMembershipError('photo', 'กรุณาอัปโหลดรูปโปรไฟล์อย่างน้อย 1 รูป')
      return false
    }
    return true
  }
  return true
}

function nextMembershipStep() {
  if (!validateMembershipStep(membershipStep.value)) return
  clearMembershipErrors()
  if (membershipStep.value < membershipSteps.value.length) membershipStep.value += 1
}

function prevMembershipStep() {
  clearMembershipErrors()
  if (membershipStep.value > 1) membershipStep.value -= 1
}

function onMembershipFormSubmit() {
  if (!isMembershipLastStep.value) {
    nextMembershipStep()
    return
  }
  submitMembership()
}

async function submitMembership() {
  if (isMembershipSubmitting.value) return
  for (const step of membershipSteps.value) {
    if (!validateMembershipStep(step.id)) {
      membershipStep.value = step.id
      return
    }
  }
  isMembershipSubmitting.value = true
  try {
    const result = await safely(() => api.register({
      role: membership.value.role,
      name: membership.value.name,
      email: membership.value.email,
      password: membership.value.password,
      province: membership.value.province,
      service: membership.value.service,
      price: membership.value.price,
      age: membership.value.age,
      weightKg: membership.value.weightKg,
      measurements: membership.value.measurements,
      line: membership.value.line,
      facebook: membership.value.facebook,
    }))
    if (!result) return
    applyUser(result.user)
    membership.value.password = ''
    membership.value.passwordConfirm = ''

    if (result.user.role === 'seller') {
      const providerId = result.user.providerId
      const photo = membershipProfilePhoto.value?.file
      let photoError = null
      if (providerId && photo) {
        try {
          await api.uploadMedia(providerId, photo)
        } catch (error) {
          photoError = error
        }
      }
      clearMembershipProfilePhoto()
      await safely(loadData)
      sellerDashboardTab.value = photoError ? 'profile' : 'overview'
      navigate('seller')
      showNotice(photoError
        ? `สมัครแล้ว แต่อัปโหลดรูปไม่สำเร็จ: ${photoError.message} — กรุณาอัปโหลดรูปในโปรไฟล์ก่อนรออนุมัติ`
        : 'สมัครสมาชิกผู้ให้บริการแล้ว · ส่งรูปโปรไฟล์ให้ผู้ดูแลตรวจสอบแล้ว')
      return
    }

    clearMembershipProfilePhoto()
    await safely(loadData)
    navigate('account')
    showNotice('สมัครสมาชิกผู้ใช้บริการเรียบร้อยแล้ว')
  } finally {
    isMembershipSubmitting.value = false
  }
}

async function updateSellerBooking(item, status) {
  const updated = await safely(() => api.updateBooking(item.id, status))
  if (updated) {
    bookings.value = bookings.value.map((entry) => (entry.id === updated.id ? updated : entry))
    showNotice(`อัปเดตสถานะนัดหมาย ${item.id} แล้ว`)
  }
}

async function approveApplication(item) {
  if (!item.hasProfilePhoto) {
    showNotice('ยังอนุมัติไม่ได้ · ผู้สมัครต้องอัปโหลดรูปโปรไฟล์อย่างน้อย 1 รูปก่อน')
    return
  }
  const expiresAt = adminApproveExpiresAt.value || defaultMembershipExpiryLocal()
  if (!expiresAt) {
    showNotice('กรุณาระบุวันและเวลาหมดอายุสมาชิกก่อนอนุมัติ')
    return
  }
  if (await safely(() => api.approveApplication(item.id, { membershipExpiresAt: expiresAt }))) {
    await safely(loadData)
    adminApproveExpiresAt.value = defaultMembershipExpiryLocal()
    showNotice('อนุมัติแล้ว · โปรไฟล์จะแสดงจนถึงวันหมดอายุที่กำหนด')
  }
}

async function rejectApplication(item) {
  if (await safely(() => api.rejectApplication(item.id))) {
    applications.value = applications.value.filter((entry) => entry.id !== item.id)
  }
}

let noticeTimer = 0
function showNotice(message) {
  notice.value = message
  if (noticeTimer) window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = ''
    noticeTimer = 0
  }, 3200)
}

async function resendVerification() {
  try {
    const result = await api.resendVerification()
    if (result.alreadyVerified) {
      showNotice('อีเมลนี้ยืนยันแล้ว')
      applyUser((await api.me()).user)
      return
    }
    if (result.verifyLink) {
      devVerifyLink.value = result.verifyLink
      if (result.sent === false) {
        showNotice(result.mailError
          ? `ส่งเมลไม่สำเร็จ (${result.mailError}) — กดปุ่มยืนยันอีเมลเลยด้านบนได้`
          : 'ส่งเมลไม่สำเร็จ — กดปุ่มยืนยันอีเมลเลยด้านบนได้')
        return
      }
      showNotice(`ส่งแล้วไปที่ ${result.to || currentUser.value?.email} — ถ้าไม่เจอเมล กดปุ่มยืนยันด้านบน`)
      return
    }
    showNotice(`ส่งลิงก์ยืนยันไปที่ ${result.to || 'อีเมลของคุณ'} แล้ว (ตรวจ Spam ด้วย)`)
  } catch (error) {
    showNotice(error.message || 'ส่งอีเมลไม่สำเร็จ')
  }
}

async function confirmDevVerification() {
  try {
    const token = new URL(devVerifyLink.value, window.location.origin).searchParams.get('token')
    if (!token) {
      showNotice('ลิงก์ยืนยันไม่ถูกต้อง กรุณาส่งใหม่')
      return
    }
    const result = await api.verifyEmail(token)
    if (result.user) applyUser(result.user)
    else applyUser((await api.me()).user)
    devVerifyLink.value = ''
    showNotice('ยืนยันอีเมลเรียบร้อยแล้ว')
  } catch (error) {
    showNotice(error.message || 'ยืนยันอีเมลไม่สำเร็จ')
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
  openSearchFilters({ sync: false })
}

  return {
    clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, renameSellerMedia, replaceSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, adminEditingProvider, isAdminTravelerLoading, openAdminPartnerMedia, closeAdminPartnerMedia, addAdminPartnerMedia, addAdminPartnerMediaTo, removeAdminPartnerMedia, adminCreatingPartner, isAdminPartnerSaving, adminPartnerSaveError, adminGenderOptions, adminPartnerForm, openAdminCreatePartner, closeAdminCreatePartner, submitAdminCreatePartner, addAdminCreateService, removeAdminCreateService, addAdminCreateMedia, removeAdminCreateMedia, replaceAdminCreateMedia, renameAdminPartnerMedia, replaceAdminPartnerMedia, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary,
  }
}
