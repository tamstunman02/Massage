<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { api } from './api'

const OWNER_LINE_ID = '390xblmm'
const ownerLineUrl = `https://line.me/ti/p/~${encodeURIComponent(OWNER_LINE_ID)}`
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
  window.open(url, '_blank', 'noopener,noreferrer')
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

</script>

<template>
  <div ref="appRoot" class="lux-app" :class="[{ 'seller-dashboard': view === 'seller' }, `role-theme-${currentRole}`]">
    <div class="lux-scroll-progress" aria-hidden="true"></div>
    <div class="lux-topline">
      <span class="lux-topline-right"><i></i> เคารพขอบเขตและความเป็นส่วนตัว <span class="lux-topline-sep">·</span> ติดต่อ NuaNia ได้ที่ <button type="button" class="lux-topline-line" @click="openOwnerLine">LINE {{ ownerLineLabel }}</button></span>
    </div>

    <header class="lux-header">
      <button class="lux-mobile-menu" type="button" aria-label="เปิดเมนู" @click="isCompactMenuOpen = !isCompactMenuOpen"><AppIcon name="bars" /></button>
      <a class="lux-logo" href="#" @click.prevent="navigate('home')">
        <span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>CONNECT ON YOUR TERMS</small></span>
      </a>
      <nav class="lux-nav" :class="{ 'lux-nav-open': isCompactMenuOpen }" aria-label="เมนูหลัก">
        <button :class="{ selected: view === 'home' }" @click="navigate('home')">หน้าแรก</button>
        <button :class="{ selected: view === 'search' }" @click="openSearchFilters()">ค้นหาบริการ</button>
        <button v-if="can('seek:view')" :class="{ selected: view === 'seek' }" @click="navigate('seek')">โพสหาผู้ให้บริการ</button>
        <button v-if="currentRole === 'buyer'" :class="{ selected: view === 'account' }" @click="navigate('account')">บัญชีของฉัน</button>
        <button v-if="currentRole === 'seller'" :class="{ selected: view === 'seller' }" @click="navigate('seller')">ศูนย์จัดการผู้ขาย</button>
        <button v-if="currentRole === 'admin'" :class="{ selected: view === 'admin' }" @click="navigate('admin')">แผงควบคุมผู้ดูแล</button>
      </nav>
      <div class="lux-header-actions">
        <template v-if="!currentUser">
          <button class="lux-login-shortcut lux-header-login" @click="navigate('login')">เข้าสู่ระบบ</button>
          <button class="lux-membership-shortcut lux-header-signup" @click="navigate('membership')">สมัครสมาชิก</button>
        </template>
        <template v-else>
          <span class="lux-role-badge" :class="`role-${currentRole}`">{{ roleLabel }}</span>
          <button v-if="currentRole === 'buyer'" class="lux-icon-button" aria-label="รายการโปรด" title="รายการโปรด" @click="accountTab = 'favorites'; navigate('account')"><AppIcon name="heart" /></button>
          <div class="lux-account-menu" :class="{ open: isAccountMenuOpen }">
            <button class="lux-account-button" type="button" :aria-expanded="isAccountMenuOpen" aria-haspopup="menu" @click="onAccountButton"><span class="lux-user-avatar" :class="`role-${currentRole}`">{{ currentUser.name.slice(0, 1) }}</span><span>{{ accountMenuLabel }}</span><span class="lux-chevron"><AppIcon name="chevron-down" /></span></button>
            <button v-if="isAccountMenuOpen" class="lux-account-menu-backdrop" type="button" aria-label="ปิดเมนูบัญชี" @click="isAccountMenuOpen = false"></button>
            <div v-if="isAccountMenuOpen" class="lux-account-dropdown" role="menu">
              <button class="lux-account-logout" type="button" role="menuitem" @click="logout">ออกจากระบบ</button>
            </div>
          </div>
          <button class="lux-login-shortcut lux-header-logout" @click="logout">ออกจากระบบ</button>
        </template>
      </div>
    </header>
    <div v-if="currentUser && currentUser.emailVerified === false && currentRole !== 'admin'" class="lux-verify-banner" role="status"><span><AppIcon name="envelope" /> กรุณายืนยันอีเมล <strong>{{ currentUser.email }}</strong> ภายใน 3 วัน มิฉะนั้นบัญชีจะถูกลบอัตโนมัติ</span><button type="button" @click="resendVerification">ส่งลิงก์ยืนยันอีกครั้ง</button><button v-if="devVerifyLink" type="button" class="lux-verify-direct" @click="confirmDevVerification">ยืนยันอีเมลเลย</button></div>

    <Transition name="lux-view" mode="out-in">
    <main :key="'home'" v-if="view === 'home'" class="lux-home">
      <section class="lux-hero">
        <div class="lux-hero-copy">
          <div class="lux-kicker"><span></span> นัวเนีย · NUANIA</div>
          <h1>รวมเด็กเอ็น<br />ทั่ว<span>ประเทศไทย</span></h1>
          <p>นัวเนีย เว็บรวมเด็กเอน เด็กเอนเตอร์เทรน ดูโปรไฟล์และราคา<br class="lux-desktop-only" />แล้วติดต่อนัดหมายโดยตรงผ่าน LINE หรือ Facebook — ไม่จองผ่านเว็บ</p>
          <button class="lux-button lux-button-primary lux-hero-cta" @click="scrollToProviders">ค้นหาเด็กเอ็น <span><AppIcon name="arrow-right" /></span></button>
          <div class="lux-hero-proof"><div class="lux-proof-seal"><AppIcon name="handshake" /></div><div><strong>ติดต่อกันเองนอกเว็บ</strong><span>เว็บนี้แสดงข้อมูลและราคาเท่านั้น</span></div></div>
        </div>
        <div class="lux-hero-visual" aria-label="ภาพบรรยากาศพื้นที่พักผ่อน">
          <div class="lux-visual-arch"><div class="lux-arch-window"></div><div class="lux-plant plant-left"></div><div class="lux-plant plant-right"></div><div class="lux-visual-table"></div></div>
          <div class="lux-floating-card"><span class="lux-floating-icon"><AppIcon name="star" /></span><div><small>LISTING ONLY</small><strong>ดูโปรไฟล์แล้วติดต่อเอง</strong></div></div>
          <div class="lux-visual-index">01 <span></span> CONNECT WITH CONFIDENCE</div>
        </div>
        <div class="lux-hero-vertical">นัวเนีย · เด็กเอ็น · ทั่วไทย</div>
      </section>

      <section class="lux-discovery" data-reveal>
        <div class="lux-section-intro" data-reveal>
          <div><div class="lux-kicker"><span></span> FIND YOUR CONNECTION</div><h2>ค้นหาผู้ให้บริการ<br class="lux-mobile-only" />ที่<span>ตรงกับคุณ</span></h2></div>
          <p>เลือกพื้นที่และรูปแบบที่สนใจ<br />แล้วติดต่อผู้ให้บริการโดยตรง</p>
        </div>
        <div class="lux-quick-search" data-reveal>
          <label><span><AppIcon name="magnifying-glass" /></span><div><small>ค้นหาผู้ให้บริการหรือพื้นที่</small><input v-model="searchName" placeholder="เช่น ดื่มสังสรรค์, สุขุมวิท" @focus="view = 'home'" /></div></label>
          <label><span><AppIcon name="location-dot" /></span><div><small>เลือกจังหวัด</small><select v-model="selectedProvince"><option value="">เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></div></label>
          <label><span><AppIcon name="clock" /></span><div><small>รูปแบบการนัดพบ</small><select v-model="selectedMode"><option value="">ทุกรูปแบบ</option><option v-for="mode in availableAppointmentModes" :key="mode">{{ mode }}</option></select></div></label>
          <button class="lux-button lux-button-olive lux-quick-search-cta" @click="scrollToProviders">ค้นหา <span><AppIcon name="arrow-right" /></span></button>
        </div>
        <div class="lux-category-row" data-reveal>
          <span>สำรวจรูปแบบ</span>
          <button
            v-for="cat in serviceCategories"
            :key="`chip-${cat.value}`"
            type="button"
            @click="searchWithFilters({ service: cat.value })"
          >{{ cat.label }}</button>
        </div>
      </section>

      <section class="lux-home-guide" aria-labelledby="home-guide-heading">
        <div class="lux-home-guide-heading" data-reveal>
          <div><div class="lux-kicker"><span></span> CHOOSE YOUR EXPERIENCE</div><h2 id="home-guide-heading">เลือกรูปแบบที่<span>เหมาะกับคุณ</span></h2><p>รูปแบบงานเด็กเอนเตอร์เทรนที่พบบ่อย — อ่านโปรไฟล์แล้วติดต่อตกลงขอบเขตกันเอง</p></div>
          <button class="lux-text-link" @click="navigate('search')">ค้นหาบริการ <span><AppIcon name="arrow-right" /></span></button>
        </div>
        <div class="lux-home-guide-grid">
          <article
            v-for="(cat, index) in serviceCategories"
            :key="`guide-${cat.value}`"
            class="lux-home-guide-card"
            data-reveal
          >
            <span class="lux-home-guide-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="lux-home-guide-icon" aria-hidden="true"><AppIcon :name="cat.icon" /></span>
            <h3>{{ cat.label }}</h3>
            <p>{{ cat.blurb }}</p>
            <button type="button" @click="searchWithFilters({ service: cat.value })">ดูรูปแบบนี้ <span><AppIcon name="arrow-right" /></span></button>
          </article>
        </div>
        <p class="lux-home-guide-note">รายละเอียด ราคา และขอบเขตขึ้นกับแต่ละโปรไฟล์ โปรดตกลงกันชัดเจนก่อนนัดหมาย · ไม่จองผ่านเว็บ</p>
      </section>

      <section class="lux-experience" data-reveal>
        <div class="lux-experience-art"><div class="lux-experience-circle">N<span><AppIcon name="star" /></span></div><div class="lux-experience-caption">NUANIA · CONNECT ON YOUR TERMS</div></div>
        <div class="lux-experience-copy"><div class="lux-kicker"><span></span> CLEAR TERMS, BETTER CONNECTIONS</div><h2>ค้นหาอย่างมั่นใจ<br />ติดต่อ<span>กันเอง</span></h2><p>NuaNia เป็นพื้นที่ลงโปรไฟล์และราคาสำหรับผู้ให้บริการอิสระ นักท่องเที่ยวติดต่อนัดหมายโดยตรงผ่านช่องทางในโปรไฟล์ — ไม่มีการจองผ่านเว็บ</p><div class="lux-value-list"><span><i>01</i> อ่านโปรไฟล์และราคา</span><span><i>02</i> ติดต่อ LINE / Facebook โดยตรง</span><span><i>03</i> ตกลงรายละเอียดกันเองนอกเว็บ</span></div><button class="lux-text-link" @click="navigate('search')">ค้นหาผู้ให้บริการ <span><AppIcon name="arrow-right" /></span></button></div>
      </section>

      <section class="lux-partner-banner" data-reveal><div class="lux-partner-mark">N</div><div><small>FOR INDEPENDENT PROVIDERS</small><h2>ให้โปรไฟล์ของคุณ<br />เข้าถึงคนที่ใช่</h2><p>กำหนดรูปแบบบริการ ราคา และขอบเขตได้ด้วยตัวเอง</p></div><button class="lux-button lux-button-light" @click="membership.role = 'seller'; navigate('membership')">ลงโปรไฟล์ผู้ให้บริการ <span><AppIcon name="arrow-right" /></span></button><span class="lux-partner-bg">NUANIA</span></section>
    </main>

    <main :key="'search'" v-else-if="view === 'search'" class="lux-page lux-search-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ค้นหาผู้ให้บริการ</span></div>
      <div class="lux-search-filter-trigger">
        <button ref="searchFilterTrigger" class="lux-search-filter-main" type="button" @click="openSearchFilters">
          <span class="lux-search-filter-icon"><AppIcon name="magnifying-glass" /></span>
          <span class="lux-search-filter-copy">
            <strong>ค้นหาบริการ</strong>
            <small>{{ searchFilterSummary }}</small>
          </span>
        </button>
        <button v-if="searchHasFilters" class="lux-search-filter-active" type="button" @click="clearSearchFilters">ล้างค่า</button>
        <button class="lux-search-filter-cta" type="button" @click="openSearchFilters">ค้นหาบริการ <span aria-hidden="true"><AppIcon name="arrow-right" /></span></button>
      </div>
      <div class="lux-page-heading">
        <div>
          <div class="lux-kicker"><span></span> FIND YOUR CONNECTION</div>
          <h1>ค้นหาผู้ให้บริการ<span>อิสระ</span></h1>
          <p>{{ activeSearchProvince ? `กำลังแสดงผลในจังหวัด${activeSearchProvince}` : (searchHasFilters ? 'โปรไฟล์ที่ตรงกับการค้นหา และจำนวนตามจังหวัดตามเงื่อนไขปัจจุบัน' : 'เลือกจังหวัดเพื่อดูจำนวนและรายชื่อผู้ให้บริการ') }}</p>
        </div>
        <div v-if="searchHasFilters" class="lux-heading-meta">
          <span v-if="activeSearchProvince" class="lux-province-active" aria-live="polite">
            <span aria-hidden="true"><AppIcon name="location-dot" /></span>
            <small>จังหวัดที่เลือก</small>
            <strong>{{ activeSearchProvince }}</strong>
          </span>
          <div class="lux-result-note"><strong>{{ visibleProviders.length }}</strong><span>พบโปรไฟล์</span></div>
        </div>
      </div>
      <section v-if="searchHasFilters" class="lux-search-results">
        <div class="lux-results-toolbar">
          <div>
            <span>แสดง</span> {{ visibleProviders.length }} โปรไฟล์
            <span v-if="activeSearchProvince">ใน {{ activeSearchProvince }}</span>
            <span v-else>ผู้ให้บริการอิสระ</span>
          </div>
          <label>เรียงตาม <select v-model="sortBy"><option>แนะนำ</option><option>คะแนนสูงสุด</option><option>ราคา: ต่ำไปสูง</option></select></label>
        </div>
          <div class="lux-provider-grid lux-results-grid">
            <article v-for="provider in visibleProviders" :key="provider.id" class="lux-provider-card" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)">
              <div class="lux-card-media" :class="[provider.visual, { 'has-media': providerPreviewMedia(provider) }]">
                <img v-if="providerPreviewMedia(provider)?.type === 'image'" class="lux-card-photo" :src="providerPreviewMedia(provider).url" :alt="`ภาพแนะนำของ ${provider.name}`" loading="lazy" />
                <video v-else-if="providerPreviewMedia(provider)" class="lux-card-photo" :src="providerPreviewMedia(provider).url" muted autoplay loop playsinline :aria-label="`วิดีโอแนะนำของ ${provider.name}`"></video>
                <span v-else class="lux-scene-symbol">{{ provider.initials }}</span>
                <div class="lux-card-badges">
                  <span class="lux-card-badge is-check" title="โปรไฟล์เผยแพร่"><AppIcon name="check" /></span>
                  <span v-if="providerHasVideo(provider)" class="lux-card-badge is-video" title="มีวิดีโอ"><AppIcon name="play" /></span>
                  <button type="button" class="lux-card-badge is-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)"><AppIcon name="heart" /></button>
                </div>
                <div class="lux-card-caption">
                  <strong>{{ provider.name }}</strong>
                  <span class="lux-card-place">{{ provider.area || provider.province }}</span>
                </div>
              </div>
              <div class="lux-card-panel">
                <div class="lux-card-panel-row">
                  <span><AppIcon name="star" /> {{ provider.rating }}</span>
                  <span>{{ provider.reviews || 0 }} รีวิว</span>
                </div>
                <div class="lux-card-panel-row">
                  <span>อายุ {{ provider.age }}</span>
                  <span>{{ provider.category || 'ผู้ให้บริการ' }}</span>
                </div>
              </div>
            </article>
            <div v-if="!visibleProviders.length" class="lux-empty"><span><AppIcon name="magnifying-glass" /></span>
                <h3>ยังไม่พบโปรไฟล์ที่ตรงใจ</h3>
                <p>ลองปรับการค้นหาบริการหรือค้นหาด้วยคำอื่น</p>
                <button class="lux-button lux-button-primary" type="button" @click="clearSearchFilters">ล้างการค้นหา</button>
            </div>
          </div>
      </section>
      <section class="lux-province-counts" :class="{ 'has-results-above': searchHasFilters }" aria-label="จำนวนผู้ให้บริการตามจังหวัด">
        <div class="lux-province-counts-heading">
          <div>
            <h2>จำนวนผู้ให้บริการ<span>ตามจังหวัด</span></h2>
            <p>{{ activeSearchProvince ? `ตอนนี้เลือก ${activeSearchProvince} · แตะจังหวัดอื่นเพื่อเปลี่ยนพื้นที่` : (searchHasFilters ? 'จำนวนตามเงื่อนไขที่ค้นหาอยู่ · แตะจังหวัดเพื่อเปลี่ยนพื้นที่' : 'แตะจังหวัดเพื่อดูรายชื่อผู้ให้บริการในพื้นที่นั้น') }}</p>
          </div>
          <span v-if="activeSearchProvince" class="lux-province-active is-compact" aria-live="polite">
            <span aria-hidden="true"><AppIcon name="location-dot" /></span>
            <strong>{{ activeSearchProvince }}</strong>
          </span>
        </div>
        <div v-if="providersByProvince.length" class="lux-province-chip-grid">
          <button
            v-for="item in providersByProvince"
            :key="item.province"
            type="button"
            class="lux-province-chip"
            :class="{ active: appliedSearchFilters.province === item.province }"
            :aria-label="`${item.province} มีผู้ให้บริการ ${item.count} คน`"
            :aria-pressed="appliedSearchFilters.province === item.province"
            @click="searchWithFilters({ province: item.province })"
          >
            <span class="lux-province-chip-pin" aria-hidden="true"><AppIcon name="location-dot" /></span>
            <span class="lux-province-chip-name">{{ item.province }}</span>
            <span class="lux-province-chip-count">{{ item.count }}</span>
          </button>
        </div>
        <div v-else class="lux-empty"><span><AppIcon name="magnifying-glass" /></span><h3>{{ searchHasFilters ? 'ไม่พบผู้ให้บริการตามเงื่อนไขนี้' : 'ยังไม่มีผู้ให้บริการที่เผยแพร่' }}</h3><p>{{ searchHasFilters ? 'ลองปรับการค้นหาบริการหรือเลือกเงื่อนไขอื่น' : 'เมื่อมีโปรไฟล์ที่เปิดใช้งาน จำนวนจะแสดงตามจังหวัดที่นี่' }}</p></div>
      </section>
    </main>

    <main :key="'profile'" v-else-if="view === 'profile' && selectedProvider" class="lux-page lux-profile-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><button v-if="currentRole === 'admin'" @click="adminTab = 'providers'; navigate('admin')">พาร์ตเนอร์</button><button v-else @click="navigate('search')">ค้นหาบริการ</button><span>/</span><span>{{ selectedProvider.name }}</span></div>
      <div class="lux-profile-layout"><section class="lux-profile-main"><div class="lux-profile-identity"><div class="lux-profile-monogram" :class="[selectedProvider.visual, { 'has-profile-image': featuredProfileImage }]"><img v-if="featuredProfileImage" :src="featuredProfileImage.url" :alt="`รูปโปรไฟล์ ${selectedProvider.name}`" /><span v-else>{{ selectedProvider.initials }}</span></div><div class="lux-profile-title"><div class="lux-profile-label"><span class="lux-verified">PROVIDER PROFILE</span><span v-if="reviewSummary"><AppIcon name="star" /> {{ reviewSummary.service }} / 5 <small>({{ reviewSummary.count }} รีวิว)</small></span><span v-else>ยังไม่มีคะแนนรีวิว</span></div><h1>{{ selectedProvider.name }}<small>, {{ selectedProvider.age }}</small></h1><p>ผู้ให้บริการอิสระ · {{ selectedProvider.area }}, {{ selectedProvider.province }}</p></div><button class="lux-heart lux-profile-heart" :class="{ loved: favorites.includes(selectedProvider.id) }" :aria-label="favorites.includes(selectedProvider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click="toggleFavorite(selectedProvider)"><AppIcon name="heart" /></button></div>
          <div v-if="selectedProvider.media?.length" class="lux-profile-section lux-promo-gallery"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> PROVIDER MOMENTS</div><h2>ภาพและวิดีโอแนะนำโปรไฟล์</h2></div><span>{{ selectedProvider.media.length }} รายการ · แตะเพื่อขยาย</span></div><div class="lux-promo-grid"><button v-for="(media, index) in selectedProvider.media" :key="media.id" class="lux-promo-item" type="button" :aria-label="`ขยาย${media.type === 'image' ? 'รูปภาพ' : 'วิดีโอ'} ${media.name}`" @click="openMediaViewer(selectedProvider.media, index)"><img v-if="media.type === 'image'" :src="media.url" :alt="media.name" loading="lazy" /><template v-else><video :src="media.url" preload="metadata" playsinline :aria-label="media.name"></video><span class="lux-promo-play" aria-hidden="true"><AppIcon name="play" /></span></template></button></div></div>
          <div class="lux-profile-section"><div class="lux-kicker"><span></span> ABOUT THE PROVIDER</div><h2>คุยรายละเอียดและ<span>ขอบเขตให้ชัดเจน</span></h2><p class="lux-provider-about-copy">{{ selectedProvider.description }}</p><p class="lux-provider-about-guidance">ไม่มีการจองผ่านเว็บ · ติดต่อผู้ให้บริการผ่าน LINE หรือ Facebook แล้วตกลงเวลา สถานที่ ราคา และขอบเขตกันเอง</p><div class="lux-tag-row"><span v-for="tag in selectedProvider.tags" :key="tag">{{ tag }}</span></div><div v-if="providerLineUrl(selectedProvider) || providerFacebookUrl(selectedProvider)" class="lux-provider-contacts"><span class="lux-provider-contacts-label">ช่องทางติดต่อ</span><div class="lux-provider-contact-actions"><a v-if="providerLineUrl(selectedProvider)" class="lux-contact-btn lux-contact-line" :href="providerLineUrl(selectedProvider)" target="_blank" rel="noopener noreferrer" @click.prevent="openProviderContact(providerLineUrl(selectedProvider))"><i>LINE</i><span>{{ selectedProvider.line }}</span></a><a v-if="providerFacebookUrl(selectedProvider)" class="lux-contact-btn lux-contact-facebook" :href="providerFacebookUrl(selectedProvider)" target="_blank" rel="noopener noreferrer" @click.prevent="openProviderContact(providerFacebookUrl(selectedProvider))"><i>Facebook</i><span>เปิดโปรไฟล์</span></a></div></div></div>
          <div class="lux-profile-section lux-review-section">
            <div class="lux-section-title"><div><div class="lux-kicker"><span></span> COMMUNITY NOTES</div><h2>ประสบการณ์จากนักท่องเที่ยว</h2></div><span v-if="reviewSummary">บริการ {{ reviewSummary.service }} <AppIcon name="star" /> · คุ้มค่าเงิน {{ reviewSummary.value }} <AppIcon name="star" /> · {{ reviewSummary.count }} รีวิว</span><span v-else>ยังไม่มีรีวิว</span></div>
            <form v-if="can('review:create') && availableReviewBookings.length" class="lux-review-form" @submit.prevent="submitReview">
              <h3>เขียนรีวิวหลังใช้บริการ</h3>
              <label class="lux-form-label">นัดหมายที่เสร็จสิ้น<select v-model="reviewForm.bookingId" required><option v-for="item in availableReviewBookings" :key="item.id" :value="item.id">{{ item.service }} · {{ formatDate(item.date) }}</option></select></label>
              <div class="lux-review-ratings">
                <div v-for="rating in [{ key: 'serviceRating', label: 'บริการ' }, { key: 'valueRating', label: 'คุ้มค่าเงิน' }]" :key="rating.key" class="lux-review-rating"><span>{{ rating.label }}</span><div role="group" :aria-label="`ให้คะแนน${rating.label}`"><button v-for="star in 5" :key="star" type="button" :class="{ active: star <= reviewForm[rating.key] }" :aria-label="`${star} ดาว`" :aria-pressed="reviewForm[rating.key] === star" @click="reviewForm[rating.key] = star"><AppIcon name="star" /></button></div></div>
              </div>
              <label class="lux-form-label">รายละเอียดประสบการณ์<textarea v-model.trim="reviewForm.comment" rows="4" maxlength="2000" minlength="2" placeholder="แบ่งปันประสบการณ์อย่างสุภาพและตรงตามจริง" required></textarea></label>
              <label class="lux-review-upload">เพิ่มรูปภาพ (ไม่บังคับ)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple @change="selectReviewImages" /><small>แนบได้ไม่เกิน 6 รูป ขนาดไม่เกิน 8 MB ต่อรูป</small></label>
              <div v-if="reviewImages.length" class="lux-review-image-previews"><img v-for="image in reviewImages" :key="image.previewUrl" :src="image.previewUrl" alt="รูปที่แนบในรีวิว" /></div>
              <button class="lux-button lux-button-primary" type="submit">ส่งรีวิว</button>
            </form>
            <p v-else-if="currentRole === 'guest'" class="lux-review-gate">เข้าสู่ระบบและรีวิวได้หลังจากนัดหมายเสร็จสิ้นแล้ว <button type="button" @click="navigate('login')">เข้าสู่ระบบ</button></p>
            <p v-else-if="currentRole === 'buyer'" class="lux-review-gate">รีวิวได้หลังจากนัดหมายกับผู้บริการรายนี้เสร็จสิ้นแล้ว</p>
            <div v-if="selectedReviews.length" class="lux-review-list">
              <article v-for="review in selectedReviews" :key="review.id" class="lux-review-card">
                <div class="lux-review-card-head"><span><strong>{{ review.userName }}</strong></span><time>{{ new Date(review.createdAt).toLocaleDateString('th-TH') }}</time></div>
                <div class="lux-review-score"><span>บริการ <span class="lux-review-stars" :aria-label="`${review.serviceRating} จาก 5 ดาว`"><span v-for="star in 5" :key="star" :class="{ active: star <= review.serviceRating }"><AppIcon name="star" /></span></span></span><span>คุ้มค่าเงิน <span class="lux-review-stars" :aria-label="`${review.valueRating} จาก 5 ดาว`"><span v-for="star in 5" :key="star" :class="{ active: star <= review.valueRating }"><AppIcon name="star" /></span></span></span></div>
                <p>{{ review.comment }}</p>
                <div v-if="review.media.length" class="lux-review-media-row"><button v-for="(media, index) in review.media" :key="media.id" type="button" :aria-label="`ขยายรูปรีวิว ${index + 1}`" @click="openMediaViewer(review.media, index)"><img :src="media.url" :alt="media.name" loading="lazy" /></button></div>
              </article>
            </div>
            <p v-else class="lux-review-empty">ยังไม่มีความคิดเห็นจากนักท่องเที่ยว</p>
          </div>
        </section>
        <aside class="lux-booking-card lux-available-appointments">
          <header class="lux-appointments-head">
            <div class="lux-kicker"><span></span> SERVICE RATES</div>
            <h2>รูปแบบและราคา</h2>
            <p>ดูราคาได้ที่นี่ · นัดหมายติดต่อผู้ให้บริการโดยตรงผ่าน LINE หรือ Facebook</p>
          </header>
          <div class="lux-appointment-options">
            <article v-for="(service, index) in providerServices(selectedProvider)" :key="service.name" class="lux-appointment-option">
              <div class="lux-appointment-option-main">
                <span class="lux-service-number">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="lux-service-name">
                  <strong>{{ service.name }}</strong>
                  <span>{{ service.duration }}</span>
                  <p>{{ service.description }}</p>
                </div>
              </div>
              <div class="lux-appointment-option-side lux-price-only">
                <strong class="lux-service-price">฿{{ Number(service.price).toLocaleString() }}</strong>
              </div>
            </article>
          </div>
          <p class="lux-appointments-contact-note">ไม่มีการจองผ่านเว็บ · ตกลงรายละเอียดและชำระเงินกับผู้ให้บริการเอง</p>
        </aside>
      </div>
      <div v-if="currentViewerMedia" class="lux-media-viewer" role="dialog" aria-modal="true" aria-label="ตัวแสดงภาพและวิดีโอ" tabindex="-1" @click.self="closeMediaViewer">
        <button class="lux-media-viewer-close" type="button" aria-label="ปิดภาพขยาย" @click="closeMediaViewer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
        <button v-if="viewerMedia.length > 1" class="lux-media-viewer-arrow previous" type="button" aria-label="สื่อก่อนหน้า" @click="changeViewerMedia(-1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="lux-media-viewer-stage"><img v-if="currentViewerMedia.type === 'image'" :src="currentViewerMedia.url" :alt="currentViewerMedia.name" /><video v-else :src="currentViewerMedia.url" controls autoplay playsinline></video><span>{{ viewerIndex + 1 }} / {{ viewerMedia.length }}</span></div>
        <button v-if="viewerMedia.length > 1" class="lux-media-viewer-arrow next" type="button" aria-label="สื่อถัดไป" @click="changeViewerMedia(1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </main>

    <main :key="'booking'" v-else-if="view === 'booking'" class="lux-page lux-booking-page">
      <div class="lux-breadcrumb"><button @click="navigate('search')">ค้นหาบริการ</button><span>/</span><span>นัดหมาย</span></div>
      <div class="lux-empty" style="margin-top:40px"><span><AppIcon name="circle-info" /></span><h3>ไม่รองรับการนัดหมายผ่านเว็บ</h3><p>NuaNia เป็นพื้นที่ลงโปรไฟล์และค้นหาข้อมูลเท่านั้น กรุณากลับไปที่โปรไฟล์แล้วติดต่อผู้ให้บริการผ่าน LINE หรือ Facebook โดยตรง</p><button class="lux-button lux-button-primary" type="button" @click="navigate(selectedProvider ? 'profile' : 'search')">กลับไปค้นหา / โปรไฟล์</button></div>
    </main>

    <main :key="'login'" v-else-if="view === 'login'" class="lux-page lux-login-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>เข้าสู่ระบบ</span></div>
      <section class="lux-login-card">
        <div class="lux-kicker"><span></span> WELCOME TO NUANIA</div>
        <h1>เข้าสู่<span>ระบบ</span></h1>
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
        </form>
        <div class="lux-login-signup">ยังไม่มีบัญชี? <button @click="navigate('membership')">สมัครสมาชิก</button></div>
      </section>
    </main>

    <main :key="'membership'" v-else-if="view === 'membership'" class="lux-page lux-membership-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>สมัครสมาชิก</span></div>
      <div class="lux-membership-heading">
        <div class="lux-kicker"><span></span> JOIN NUANIA</div>
        <h1>สมัครสมาชิก<span>ทีละขั้น</span></h1>
        <p>{{ membershipStepMeta.hint }}</p>
      </div>
      <form class="lux-membership-form lux-membership-wizard" :class="{ 'is-submitting': isMembershipSubmitting }" novalidate @submit.prevent="onMembershipFormSubmit" :aria-busy="isMembershipSubmitting">
        <ol class="lux-membership-steps" aria-label="ขั้นตอนการสมัคร">
          <li
            v-for="step in membershipSteps"
            :key="step.id"
            :class="{ active: membershipStep === step.id, done: membershipStep > step.id }"
          >
            <span>{{ step.id }}</span>
            <strong>{{ step.short || step.title }}</strong>
          </li>
        </ol>
        <div class="lux-membership-step-head">
          <small>ขั้นตอน {{ membershipStep }} / {{ membershipSteps.length }}</small>
          <h2>{{ membershipStepMeta.title }}</h2>
        </div>

        <section v-if="membershipStep === 1" class="lux-membership-panel">
          <fieldset class="lux-role-picker" :disabled="isMembershipSubmitting">
            <legend>คุณต้องการใช้งานในฐานะใด?</legend>
            <label class="lux-role-option" :class="{ active: membership.role === 'buyer' }"><input v-model="membership.role" type="radio" value="buyer" /><span class="lux-role-icon"><AppIcon name="user" /></span><span class="lux-role-copy"><strong>นักท่องเที่ยว</strong><small>ค้นหาโปรไฟล์ ดูราคา บันทึกรายการโปรด และติดต่อผู้ขายเอง</small></span><span class="lux-role-check"><AppIcon name="check" /></span></label>
            <label class="lux-role-option" :class="{ active: membership.role === 'seller' }"><input v-model="membership.role" type="radio" value="seller" /><span class="lux-role-free" aria-hidden="true">ฟรี</span><span class="lux-role-icon"><AppIcon name="id-card" /></span><span class="lux-role-copy"><strong>ผู้บริการ</strong><small>ลงโปรไฟล์และราคา · รับติดต่อจากลูกค้าโดยตรงนอกเว็บ</small></span><span class="lux-role-check"><AppIcon name="check" /></span></label>
          </fieldset>
        </section>

        <section v-else-if="membershipStep === 2" class="lux-membership-panel">
          <div class="lux-membership-fields lux-membership-fields-2">
            <label class="lux-form-label lux-membership-wide" :class="{ 'has-error': membershipErrors.name }">
              <span>{{ membership.role === 'seller' ? 'ชื่อผู้ให้บริการ / ชื่อร้าน' : 'ชื่อที่ใช้แสดง' }}</span>
              <input v-model.trim="membership.name" type="text" autocomplete="name" maxlength="40" placeholder="ระบุชื่อ" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.name)" />
              <small v-if="membershipErrors.name" class="lux-field-error">{{ membershipErrors.name }}</small>
            </label>
            <label class="lux-form-label lux-membership-wide" :class="{ 'has-error': membershipErrors.email }">
              <span>อีเมล</span>
              <input v-model.trim="membership.email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.email)" />
              <small v-if="membershipErrors.email" class="lux-field-error">{{ membershipErrors.email }}</small>
            </label>
            <div class="lux-membership-password-row">
              <label class="lux-form-label" :class="{ 'has-error': membershipErrors.password }">
                <span>รหัสผ่าน</span>
                <div class="lux-password-field">
                  <input
                    v-model="membership.password"
                    :type="showMembershipPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    minlength="8"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    :disabled="isMembershipSubmitting"
                    :aria-invalid="Boolean(membershipErrors.password)"
                  />
                  <button
                    type="button"
                    class="lux-password-toggle"
                    :aria-label="showMembershipPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'"
                    :aria-pressed="showMembershipPassword"
                    :disabled="isMembershipSubmitting"
                    @click="showMembershipPassword = !showMembershipPassword"
                  >
                    <svg v-if="!showMembershipPassword" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
                    <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M3.3 2.3 2 3.6l3.1 3.1C3.4 8 1.9 9.8 1 12c1.7 3.9 6 7 11 7 2.1 0 4.1-.5 5.8-1.4l3.2 3.2 1.3-1.3L3.3 2.3zM12 17c-3.4 0-6.4-1.8-8.2-4.5.7-1.1 1.8-2.2 3.1-3L9 11.6A3 3 0 0 0 12.4 15l1.8 1.8c-.7.1-1.4.2-2.2.2zm8.8-1.3-2.5-2.5c.4-.7.6-1.4.7-2.2C17.4 7.8 14.9 6 12 6c-.5 0-1 .1-1.5.2L8.7 4.4C9.7 4.1 10.8 4 12 4c5 0 9.3 3.1 11 7-.6 1.4-1.6 2.7-2.9 3.7l1.7 1z"/></svg>
                  </button>
                </div>
                <small v-if="membershipErrors.password" class="lux-field-error">{{ membershipErrors.password }}</small>
              </label>
              <label class="lux-form-label" :class="{ 'has-error': membershipErrors.passwordConfirm || membershipPasswordMismatch }">
                <span>ยืนยันรหัสผ่าน</span>
                <div class="lux-password-field">
                  <input
                    v-model="membership.passwordConfirm"
                    :type="showMembershipPasswordConfirm ? 'text' : 'password'"
                    autocomplete="new-password"
                    minlength="8"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    :disabled="isMembershipSubmitting"
                    :aria-invalid="Boolean(membershipErrors.passwordConfirm || membershipPasswordMismatch)"
                  />
                  <button
                    type="button"
                    class="lux-password-toggle"
                    :aria-label="showMembershipPasswordConfirm ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'"
                    :aria-pressed="showMembershipPasswordConfirm"
                    :disabled="isMembershipSubmitting"
                    @click="showMembershipPasswordConfirm = !showMembershipPasswordConfirm"
                  >
                    <svg v-if="!showMembershipPasswordConfirm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
                    <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M3.3 2.3 2 3.6l3.1 3.1C3.4 8 1.9 9.8 1 12c1.7 3.9 6 7 11 7 2.1 0 4.1-.5 5.8-1.4l3.2 3.2 1.3-1.3L3.3 2.3zM12 17c-3.4 0-6.4-1.8-8.2-4.5.7-1.1 1.8-2.2 3.1-3L9 11.6A3 3 0 0 0 12.4 15l1.8 1.8c-.7.1-1.4.2-2.2.2zm8.8-1.3-2.5-2.5c.4-.7.6-1.4.7-2.2C17.4 7.8 14.9 6 12 6c-.5 0-1 .1-1.5.2L8.7 4.4C9.7 4.1 10.8 4 12 4c5 0 9.3 3.1 11 7-.6 1.4-1.6 2.7-2.9 3.7l1.7 1z"/></svg>
                  </button>
                </div>
                <small v-if="membershipErrors.passwordConfirm || membershipPasswordMismatch" class="lux-field-error">{{ membershipErrors.passwordConfirm || 'รหัสผ่านไม่ตรงกัน' }}</small>
              </label>
            </div>
          </div>
        </section>

        <section v-else-if="membershipStep === 3" class="lux-membership-panel">
          <div class="lux-membership-fields lux-membership-fields-2">
            <label class="lux-form-label" :class="{ 'has-error': membershipErrors.province }">
              <span>จังหวัดที่ให้บริการ</span>
              <select v-model="membership.province" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.province)"><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select>
              <small v-if="membershipErrors.province" class="lux-field-error">{{ membershipErrors.province }}</small>
            </label>
            <label class="lux-form-label" :class="{ 'has-error': membershipErrors.price }">
              <span>ราคาเริ่มต้นต่อชั่วโมง</span>
              <input v-model.number="membership.price" type="number" inputmode="numeric" min="50" step="1" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.price)" />
              <small v-if="membershipErrors.price" class="lux-field-error">{{ membershipErrors.price }}</small>
            </label>
            <label class="lux-form-label" :class="{ 'has-error': membershipErrors.age }">
              <span>อายุ</span>
              <input v-model.number="membership.age" type="number" inputmode="numeric" min="18" max="100" step="1" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.age)" />
              <small v-if="membershipErrors.age" class="lux-field-error">{{ membershipErrors.age }}</small>
            </label>
            <label class="lux-form-label" :class="{ 'has-error': membershipErrors.weightKg }">
              <span>น้ำหนัก (กก.)</span>
              <input v-model.number="membership.weightKg" type="number" inputmode="numeric" min="30" max="250" step="1" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.weightKg)" />
              <small v-if="membershipErrors.weightKg" class="lux-field-error">{{ membershipErrors.weightKg }}</small>
            </label>
            <label class="lux-form-label lux-membership-wide" :class="{ 'has-error': membershipErrors.measurements }">
              <span>สัดส่วน</span>
              <input v-model.trim="membership.measurements" type="text" maxlength="80" placeholder="เช่น 34-24-36 นิ้ว" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.measurements)" />
              <small v-if="membershipErrors.measurements" class="lux-field-error">{{ membershipErrors.measurements }}</small>
            </label>
          </div>
        </section>

        <section v-else-if="membershipStep === 4" class="lux-membership-panel">
          <div class="lux-membership-fields lux-membership-fields-2">
            <p class="lux-membership-contact-hint lux-membership-wide" :class="{ 'is-error': membershipErrors.contact }">
              {{ membershipErrors.contact || 'ใส่ LINE หรือ Facebook อย่างน้อย 1 ช่อง' }}
            </p>
            <label class="lux-form-label" :class="{ 'has-error': membershipErrors.contact }">
              <span>LINE ID / ลิงก์ LINE</span>
              <input v-model.trim="membership.line" type="text" maxlength="120" placeholder="เช่น mali.relax หรือ https://line.me/ti/p/..." :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.contact)" />
            </label>
            <label class="lux-form-label" :class="{ 'has-error': membershipErrors.contact }">
              <span>ลิงก์ Facebook</span>
              <input v-model.trim="membership.facebook" type="text" inputmode="url" maxlength="300" placeholder="https://facebook.com/yourpage" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.contact)" />
            </label>
            <label class="lux-form-label lux-membership-wide" :class="{ 'has-error': membershipErrors.service }">
              <span>รายละเอียดโปรไฟล์และรูปแบบบริการ</span>
              <textarea v-model.trim="membership.service" rows="4" maxlength="300" placeholder="แนะนำตัว รูปแบบบริการ ราคา และขอบเขตที่ต้องการ" :disabled="isMembershipSubmitting" :aria-invalid="Boolean(membershipErrors.service)"></textarea>
              <small v-if="membershipErrors.service" class="lux-field-error">{{ membershipErrors.service }}</small>
            </label>
          </div>
        </section>

        <section v-else class="lux-membership-panel">
          <p class="lux-membership-notice">อัปโหลดรูปโปรไฟล์ 1 รูป เพื่อให้ผู้ดูแลตรวจสอบก่อนอนุมัติ</p>
          <div class="lux-membership-photo" :class="{ 'has-error': membershipErrors.photo }">
            <label class="lux-membership-photo-upload" :class="{ 'has-preview': membershipProfilePhoto, 'has-error': membershipErrors.photo }">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" :disabled="isMembershipSubmitting" @change="selectMembershipProfilePhoto" />
              <img v-if="membershipProfilePhoto" :src="membershipProfilePhoto.previewUrl" alt="รูปโปรไฟล์" />
              <template v-else>
                <strong><AppIcon name="plus" /> เลือกรูปโปรไฟล์</strong>
                <small>JPG, PNG, WebP หรือ GIF ไม่เกิน 8 MB</small>
              </template>
            </label>
            <small v-if="membershipErrors.photo" class="lux-field-error">{{ membershipErrors.photo }}</small>
            <button v-if="membershipProfilePhoto" type="button" class="lux-text-link" :disabled="isMembershipSubmitting" @click="clearMembershipProfilePhoto">ลบรูปนี้</button>
          </div>
        </section>

        <div class="lux-membership-nav">
          <button v-if="membershipStep > 1" class="lux-button lux-button-light" type="button" :disabled="isMembershipSubmitting" @click="prevMembershipStep"><AppIcon name="arrow-left" /> ย้อนกลับ</button>
          <button class="lux-button lux-button-primary" type="submit" :disabled="isMembershipSubmitting">
            <span v-if="isMembershipSubmitting" class="lux-btn-spinner" aria-hidden="true"></span>
            <template v-if="isMembershipSubmitting">กำลังสมัครสมาชิก...</template>
            <template v-else-if="isMembershipLastStep">ยืนยันสมัครสมาชิก <AppIcon name="arrow-right" /></template>
            <template v-else>ถัดไป <AppIcon name="arrow-right" /></template>
          </button>
        </div>
      </form>
    </main>

    <main :key="'seek'" v-else-if="view === 'seek'" class="lux-page lux-seek-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>โพสหาผู้ให้บริการ</span></div>
      <div class="lux-seek-heading">
        <div>
          <div class="lux-kicker"><span></span> SEEK BOARD</div>
          <h1>โพสหา<span>ผู้ให้บริการ</span></h1>
          <p>{{ seekBoardFilter.province ? `กำลังดูโพสในจังหวัด${seekBoardFilter.province}` : 'เลือกจังหวัดเพื่อดูโพสของทุกคน · กดปุ่มโพสเมื่อต้องการลงประกาศหา' }}</p>
        </div>
        <span v-if="seekBoardFilter.province" class="lux-province-active" aria-live="polite">
          <span aria-hidden="true"><AppIcon name="location-dot" /></span>
          <small>จังหวัดที่เลือก</small>
          <strong>{{ seekBoardFilter.province }}</strong>
        </span>
      </div>

      <div class="lux-seek-toolbar">
        <label class="lux-seek-filter is-board">
          <span class="lux-seek-filter-icon" aria-hidden="true"><AppIcon name="location-dot" /></span>
          <span class="lux-seek-filter-copy">
            <small>จังหวัด</small>
            <select v-model="seekBoardFilter.province" @change="applySeekBoardFilter">
              <option value="">ทุกจังหวัด</option>
              <option v-for="province in provinces" :key="`seek-${province}`">{{ province }}</option>
            </select>
          </span>
          <span class="lux-seek-filter-chevron" aria-hidden="true"><AppIcon name="chevron-down" /></span>
        </label>
        <div class="lux-seek-toolbar-actions">
          <span class="lux-seek-count">
            {{ seekPosts.length }} โพส
            <template v-if="seekBoardFilter.province"> · {{ seekBoardFilter.province }}</template>
          </span>
          <button v-if="can('seek:create')" type="button" class="lux-button lux-button-primary" @click="openSeekCompose"><AppIcon name="plus" /> โพส</button>
        </div>
      </div>

      <div class="lux-seek-layout" :class="{ 'has-detail': selectedSeekPost }">
        <div class="lux-seek-main">
          <section class="lux-seek-board">
            <div v-if="seekPosts.length" class="lux-seek-list">
              <article v-for="post in seekPosts" :key="post.id" class="lux-seek-card" :class="{ closed: post.status === 'closed', active: selectedSeekPost?.id === post.id, mine: post.isOwner }">
                <button type="button" class="lux-seek-card-main" @click="openSeekPost(post.id)">
                  <div class="lux-seek-card-top">
                    <strong>{{ post.title }}</strong>
                    <span class="lux-seek-status" :class="post.status">{{ post.status === 'open' ? 'เปิดรับ' : 'ปิดรับแล้ว' }}</span>
                  </div>
                  <p v-if="post.description">{{ post.description }}</p>
                  <div class="lux-seek-card-meta">
                    <span>{{ post.isOwner ? 'โพสของฉัน' : post.author?.name }}</span>
                    <span>{{ post.province }}</span>
                    <span v-if="post.venue">ร้าน {{ post.venue }}</span>
                    <span>งบ {{ post.budget }}</span>
                    <span>{{ post.duration }}</span>
                    <span>{{ post.commentCount }} คอมเมนต์</span>
                    <span>{{ formatDateTime(post.createdAt) }}</span>
                  </div>
                </button>
                <button v-if="post.isOwner && post.status === 'open'" type="button" class="lux-seek-close-btn" @click="closeSeekPost(post)">ปิดรับ</button>
              </article>
            </div>
            <div v-else class="lux-empty lux-seek-empty">
              <span><AppIcon name="magnifying-glass" /></span>
              <h3>ยังไม่มีโพส{{ seekBoardFilter.province ? `ใน${seekBoardFilter.province}` : '' }}</h3>
              <p>{{ can('seek:create') ? 'กดปุ่มโพสเพื่อลงประกาศหาผู้ให้บริการ' : 'รอโพสใหม่จากนักท่องเที่ยว หรือลองเปลี่ยนจังหวัด' }}</p>
              <button v-if="can('seek:create')" type="button" class="lux-button lux-button-primary" @click="openSeekCompose"><AppIcon name="plus" /> โพส</button>
            </div>
          </section>
        </div>

        <aside v-if="selectedSeekPost" class="lux-seek-detail">
          <div class="lux-seek-detail-head">
            <button type="button" class="lux-text-link" @click="closeSeekDetail"><AppIcon name="arrow-left" /> ปิดรายละเอียด</button>
            <span class="lux-seek-status" :class="selectedSeekPost.status">{{ selectedSeekPost.status === 'open' ? 'เปิดรับ' : 'ปิดรับแล้ว' }}</span>
          </div>
          <div v-if="seekDetailLoading" class="lux-seek-detail-loading">กำลังโหลดรายละเอียด...</div>
          <template v-else>
            <h2>{{ selectedSeekPost.title }}</h2>
            <div class="lux-seek-detail-facts">
              <div><span>จังหวัด</span><strong>{{ selectedSeekPost.province }}</strong></div>
              <div><span>ร้าน</span><strong>{{ selectedSeekPost.venue || '-' }}</strong></div>
              <div><span>งบประมาณ</span><strong>{{ selectedSeekPost.budget || '-' }}</strong></div>
              <div><span>ระยะเวลา</span><strong>{{ selectedSeekPost.duration || '-' }}</strong></div>
            </div>
            <div class="lux-seek-card-meta">
              <span>{{ selectedSeekPost.author?.name }}</span>
              <span>{{ formatDateTime(selectedSeekPost.createdAt) }}</span>
            </div>
            <p v-if="selectedSeekPost.description" class="lux-seek-detail-body">{{ selectedSeekPost.description }}</p>
            <div v-if="selectedSeekPost.isOwner && selectedSeekPost.status === 'open'" class="lux-seek-detail-actions">
              <button type="button" class="lux-button lux-button-light" @click="closeSeekPost(selectedSeekPost)">ปิดรับเมื่อได้งานแล้ว</button>
            </div>

            <div class="lux-seek-comments">
              <div class="lux-seek-section-head">
                <h3>คอมเมนต์จากผู้ให้บริการ</h3>
                <p class="lux-seek-live-meta">
                  <span class="lux-seek-live" :class="{ on: seekRealtimeConnected }">{{ seekRealtimeConnected ? 'สด' : 'อัปเดตอัตโนมัติ' }}</span>
                  <span>{{ selectedSeekPost.comments?.length || 0 }} รายการ</span>
                </p>
              </div>

              <form v-if="can('seek:comment') && selectedSeekPost.status === 'open'" class="lux-seek-comment-form" @submit.prevent="submitSeekComment">
                <label class="lux-form-label">
                  <span>ตอบโพสนี้</span>
                  <textarea v-model.trim="seekCommentDraft" rows="3" maxlength="1000" placeholder="แนะนำตัว ช่องทางติดต่อ หรือรายละเอียดที่เสนอ"></textarea>
                </label>
                <button class="lux-button lux-button-primary" type="submit">ส่งคอมเมนต์ <AppIcon name="arrow-right" /></button>
              </form>
              <p v-else-if="selectedSeekPost.status !== 'open'" class="lux-seek-closed-note">โพสนี้ปิดรับแล้ว ไม่สามารถคอมเมนต์เพิ่มได้</p>

              <div v-if="selectedSeekPost.comments?.length" class="lux-seek-comment-list">
                <article v-for="comment in selectedSeekPost.comments" :key="comment.id" class="lux-seek-comment">
                  <div class="lux-seek-comment-head">
                    <div class="lux-seek-comment-person">
                      <div class="lux-seek-comment-avatar" aria-hidden="true">
                        <img v-if="comment.author?.photoUrl" :src="comment.author.photoUrl" :alt="comment.author?.providerName || comment.author?.name" />
                        <span v-else>{{ comment.author?.initials || (comment.author?.providerName || comment.author?.name || 'ผ').slice(0, 1) }}</span>
                      </div>
                      <div>
                        <strong>{{ comment.author?.providerName || comment.author?.name }}</strong>
                        <span>{{ comment.author?.province || 'ผู้ให้บริการ' }} · {{ formatDateTime(comment.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="lux-seek-comment-actions">
                      <button v-if="comment.author?.providerId" type="button" class="lux-seek-view-btn" @click="openSeekCommentProfile(comment)">ดูข้อมูล</button>
                      <template v-if="comment.canEdit">
                        <button type="button" @click="startEditSeekComment(comment)">แก้ไข</button>
                        <button type="button" class="is-danger" @click="removeSeekComment(comment)">ลบ</button>
                      </template>
                    </div>
                  </div>
                  <template v-if="editingSeekCommentId === comment.id">
                    <textarea v-model.trim="editingSeekCommentBody" rows="3" maxlength="1000"></textarea>
                    <div class="lux-seek-comment-edit-actions">
                      <button type="button" class="lux-button lux-button-primary" @click="saveSeekComment(comment)">บันทึก</button>
                      <button type="button" class="lux-button lux-button-light" @click="cancelEditSeekComment">ยกเลิก</button>
                    </div>
                  </template>
                  <template v-else>
                    <p>{{ comment.body }}</p>
                    <div v-if="comment.author?.line || comment.author?.facebook" class="lux-seek-comment-contact">
                      <span v-if="comment.author.line">LINE: {{ comment.author.line }}</span>
                      <span v-if="comment.author.facebook">Facebook: {{ comment.author.facebook }}</span>
                    </div>
                  </template>
                </article>
              </div>
              <div v-else class="lux-empty lux-seek-empty"><span><AppIcon name="comment" /></span><h3>ยังไม่มีคอมเมนต์</h3><p>{{ can('seek:comment') ? 'เป็นคนแรกที่แนะนำตัวในโพสนี้' : 'รอผู้ให้บริการเข้ามาคอมเมนต์' }}</p></div>
            </div>
          </template>
        </aside>
      </div>
    </main>

    <main :key="'account'" v-else-if="view === 'account'" class="lux-page lux-account-page">
      <div class="lux-account-welcome"><div class="lux-kicker"><span></span> YOUR NUANIA</div><h1>โปรไฟล์ในแบบ<span>ของคุณ</span></h1><p>บันทึกโปรไฟล์ที่สนใจ · นัดหมายติดต่อผู้ให้บริการโดยตรงนอกเว็บ</p><button class="lux-account-role-link" @click="openSellerArea">{{ member?.role === 'seller' ? 'กลับสู่ศูนย์ผู้ให้บริการ' : 'ลงโปรไฟล์ผู้ให้บริการ' }} <AppIcon name="arrow-right" /></button></div>
      <div class="lux-account-layout"><aside class="lux-account-sidebar"><div class="lux-account-person"><div class="lux-user-avatar lux-user-avatar-large">{{ member?.name?.slice(0, 1) || 'ส' }}</div><div><strong>{{ member?.name || 'สมาชิก' }}</strong><span>บัญชีผู้ใช้บริการ</span></div></div><button class="lux-account-tab" :class="{ active: accountTab === 'favorites' }" @click="accountTab = 'favorites'"><span><AppIcon name="heart" /></span> โปรไฟล์ที่บันทึก <small>{{ favorites.length }}</small></button><button class="lux-account-tab" :class="{ active: accountTab === 'seek' }" @click="accountTab = 'seek'; safely(() => loadSeekPosts())"><span><AppIcon name="pen" /></span> โพสหาของฉัน <small>{{ mySeekPosts.length }}</small></button><div class="lux-account-help"><span>ต้องการความช่วยเหลือ?</span><button type="button" @click="openOwnerLine">ติดต่อ NuaNia ได้ที่ LINE {{ ownerLineLabel }} <AppIcon name="arrow-right" /></button></div></aside><section class="lux-account-main"><Transition name="lux-panel" mode="out-in"><div :key="accountTab" class="lux-account-tab-body"><template v-if="accountTab === 'seek'"><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> MY SEEK POSTS</div><h2>โพสหาผู้ให้บริการของฉัน</h2></div><button class="lux-text-link" @click="navigate('seek')">เปิดบอร์ดโพส <span><AppIcon name="arrow-right" /></span></button></div><div v-if="mySeekPosts.length" class="lux-seek-list"><article v-for="post in mySeekPosts" :key="`acc-${post.id}`" class="lux-seek-card" :class="{ closed: post.status === 'closed' }"><button type="button" class="lux-seek-card-main" @click="openSeekPost(post.id)"><div class="lux-seek-card-top"><strong>{{ post.title }}</strong><span class="lux-seek-status" :class="post.status">{{ post.status === 'open' ? 'เปิดรับ' : 'ปิดรับแล้ว' }}</span></div><p>{{ post.description }}</p><div class="lux-seek-card-meta"><span>{{ post.province }}</span><span v-if="post.venue">ร้าน {{ post.venue }}</span><span>งบ {{ post.budget }}</span><span>{{ post.duration }}</span><span>{{ post.commentCount }} คอมเมนต์</span><span>{{ formatDateTime(post.createdAt) }}</span></div></button><button v-if="post.status === 'open'" type="button" class="lux-seek-close-btn" @click="closeSeekPost(post)">ปิดรับ</button></article></div><div v-else class="lux-empty"><span><AppIcon name="pen" /></span><h3>ยังไม่มีโพสหา</h3><p>สร้างโพสเพื่อให้ผู้ให้บริการเข้ามาคอมเมนต์แนะนำตัว</p><button class="lux-button lux-button-primary" @click="navigate('seek')">ไปสร้างโพส</button></div></template><template v-else-if="accountTab === 'favorites'"><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> YOUR SAVED PROVIDERS</div><h2>โปรไฟล์ที่บันทึกไว้</h2></div><button class="lux-text-link" @click="navigate('search')">ค้นหาเพิ่มเติม <span><AppIcon name="arrow-right" /></span></button></div><div v-if="favoriteProviders.length" class="lux-provider-grid lux-favorite-grid">
            <article v-for="provider in favoriteProviders" :key="provider.id" class="lux-provider-card" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)">
              <div class="lux-card-media" :class="[provider.visual, { 'has-media': providerPreviewMedia(provider) }]">
                <img v-if="providerPreviewMedia(provider)?.type === 'image'" class="lux-card-photo" :src="providerPreviewMedia(provider).url" :alt="`ภาพแนะนำของ ${provider.name}`" loading="lazy" />
                <video v-else-if="providerPreviewMedia(provider)" class="lux-card-photo" :src="providerPreviewMedia(provider).url" muted autoplay loop playsinline :aria-label="`วิดีโอแนะนำของ ${provider.name}`"></video>
                <span v-else class="lux-scene-symbol">{{ provider.initials }}</span>
                <div class="lux-card-badges">
                  <span class="lux-card-badge is-check" title="โปรไฟล์เผยแพร่"><AppIcon name="check" /></span>
                  <span v-if="providerHasVideo(provider)" class="lux-card-badge is-video" title="มีวิดีโอ"><AppIcon name="play" /></span>
                  <button type="button" class="lux-card-badge is-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)"><AppIcon name="heart" /></button>
                </div>
                <div class="lux-card-caption">
                  <strong>{{ provider.name }}</strong>
                  <span class="lux-card-place">{{ provider.area || provider.province }}</span>
                </div>
              </div>
              <div class="lux-card-panel">
                <div class="lux-card-panel-row">
                  <span><AppIcon name="star" /> {{ provider.rating }}</span>
                  <span>{{ provider.reviews || 0 }} รีวิว</span>
                </div>
                <div class="lux-card-panel-row">
                  <span>อายุ {{ provider.age }}</span>
                  <span>{{ provider.category || 'ผู้ให้บริการ' }}</span>
                </div>
              </div>
            </article>
          </div><div v-else class="lux-empty"><span><AppIcon name="heart" /></span><h3>ยังไม่มีโปรไฟล์ที่บันทึก</h3><p>บันทึกผู้ให้บริการที่สนใจ เพื่อกลับมาดูรายละเอียดได้ทุกเมื่อ</p><button class="lux-button lux-button-primary" @click="navigate('search')">ค้นหาผู้ให้บริการ</button></div></template>
      </div></Transition></section></div>
    </main>

    <main :key="'apply'" v-else-if="view === 'apply'" class="lux-page lux-apply-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ลงโปรไฟล์ผู้ให้บริการ</span></div>
      <div class="lux-apply-layout">
        <div class="lux-apply-intro">
          <div class="lux-kicker"><span></span> GROW WITH NUANIA</div>
          <h1>สร้างโปรไฟล์<br />ให้คนที่ใช่<span>ค้นพบคุณ</span></h1>
          <p>ลงโปรไฟล์และราคาบนเว็บ · รับติดต่อจากลูกค้าโดยตรงผ่าน LINE / Facebook · ไม่มีการจองผ่านระบบ</p>
          <div class="lux-apply-benefit"><span>01</span><div><strong>แนะนำตัวในแบบของคุณ</strong><small>เพิ่มรายละเอียด รูปแบบบริการ และสื่อโปรโมต</small></div></div>
          <div class="lux-apply-benefit"><span>02</span><div><strong>ชำระค่าลงประกาศนอกระบบ</strong><small>จ่ายกับเจ้าของเว็บทาง LINE {{ ownerLineLabel }} แล้วรอผู้ดูแลอนุมัติ</small></div></div>
          <div class="lux-apply-benefit"><span>03</span><div><strong>รับติดต่อโดยตรง</strong><small>ลูกค้าเห็นราคาแล้วติดต่อคุณเองนอกเว็บ</small></div></div>
        </div>
        <form class="lux-apply-form" @submit.prevent="submitApplication">
          <div class="lux-kicker"><span></span> PROVIDER APPLICATION</div>
          <h2>สมัครเป็นผู้ให้บริการ</h2>
          <p>ใบสมัครจะรอตรวจสอบ · เผยแพร่หลังชำระและอนุมัติ พร้อมวันหมดอายุที่ผู้ดูแลกำหนด</p>
          <label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="application.name" type="text" maxlength="40" placeholder="ชื่อที่ต้องการให้แสดง" required /></label>
          <div class="lux-form-grid">
            <label class="lux-form-label">LINE ID<input v-model.trim="application.line" type="text" maxlength="50" placeholder="ช่องทางติดต่อ" required /></label>
            <label class="lux-form-label">จังหวัด<select v-model="application.province" required><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
          </div>
          <div class="lux-form-grid">
            <label class="lux-form-label">อัตลักษณ์ทางเพศ<select v-model="application.gender" required><option value="" disabled>เลือกตามที่คุณสบายใจ</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label>
            <label class="lux-form-label">รูปแบบบริการ<input v-model.trim="application.service" type="text" maxlength="100" placeholder="เช่น พบปะพูดคุย, ดื่มสังสรรค์" required /></label>
          </div>
          <label class="lux-consent"><input v-model="application.consent" type="checkbox" required /><span>ยินยอมให้แสดงข้อมูลโปรไฟล์ตามที่ระบุบนเว็บไซต์</span></label>
          <div class="lux-apply-fee"><span>ค่าลงประกาศ (ชำระนอกระบบ)</span><strong>฿299 <small>/ เดือน</small></strong><span>ชำระกับเจ้าของเว็บทาง LINE {{ ownerLineLabel }} แล้วรออนุมัติบนระบบ</span><button type="button" class="lux-apply-line" @click="openOwnerLine">เปิด LINE {{ ownerLineLabel }}</button></div>
          <button class="lux-button lux-button-primary lux-full-button" type="submit">ส่งใบสมัคร <AppIcon name="arrow-right" /></button>
          <small class="lux-apply-note">ไม่มีการจองหรือชำระเงินผ่านเว็บ · ค่าสมาชิกจัดการนอกระบบ</small>
        </form>
      </div>
    </main>

    <main :key="'admin'" v-else-if="view === 'admin'" class="lux-page lux-admin-page"><div class="lux-admin-top"><div><div class="lux-kicker"><span></span> NUANIA ADMINISTRATION</div><h1>ภาพรวม<span>แพลตฟอร์ม</span></h1><p>จัดการพาร์ตเนอร์ อนุมัติหลังชำระนอกระบบ และตั้งวันหมดอายุสมาชิก</p></div><span class="lux-admin-status"><AppIcon name="circle" /> LISTING ONLY · ไม่มีจองผ่านเว็บ</span></div><div class="lux-admin-tabs"><button v-for="tab in [{id:'overview', label:'ภาพรวม'}, {id:'providers', label:'พาร์ตเนอร์'}, {id:'applications', label:'ใบสมัคร'}, {id:'travelers', label:'นักท่องเที่ยว'}]" :key="tab.id" :class="{ active: adminTab === tab.id }" @click="adminTab = tab.id">{{ tab.label }} <small v-if="tab.id === 'applications' && applications.length">{{ applications.length }}</small></button></div>
      <Transition name="lux-panel" mode="out-in">
      <div :key="adminTab" class="lux-admin-tab-body">
      <template v-if="adminTab === 'overview'"><div class="lux-admin-metrics"><article><span>พาร์ตเนอร์ที่เผยแพร่</span><strong>{{ activeProviderCount }}</strong><small>active + สมาชิกยังไม่หมดอายุ</small></article><article><span>พาร์ตเนอร์ทั้งหมด</span><strong>{{ providers.length }}</strong><small>รวมที่ซ่อน / หมดอายุ</small></article><article><span>รายได้ค่าสมาชิก</span><strong>฿{{ (activeProviderCount * 299).toLocaleString() }}</strong><small>ชำระนอกระบบ · {{ activeProviderCount }} รายที่เผยแพร่</small></article><article><span>กำลังรอตรวจสอบ</span><strong>{{ applications.length }}</strong><small><i>ใบสมัครพาร์ตเนอร์ใหม่</i></small></article></div><div class="lux-admin-overview-grid"><section class="lux-admin-panel"><div class="lux-admin-panel-head"><div><h2>ระบบลงประกาศเท่านั้น</h2><p>ไม่มีการจองผ่านเว็บ · นักท่องเที่ยวติดต่อผู้ขายเอง</p></div><button @click="adminTab = 'providers'">จัดการพาร์ตเนอร์ <AppIcon name="arrow-right" /></button></div><div class="lux-empty" style="padding:28px 16px"><span><AppIcon name="circle-info" /></span><h3>อนุมัติหลังรับชำระนอกระบบ</h3><p>ตั้งวันหมดอายุสมาชิกเมื่ออนุมัติใบสมัคร หรือแก้ได้ในแท็บพาร์ตเนอร์</p></div></section><aside class="lux-admin-panel lux-admin-side-panel"><div class="lux-admin-panel-head"><div><h2>รอตรวจสอบ</h2><p>ใบสมัครพาร์ตเนอร์</p></div><span>{{ applications.length }}</span></div><label v-if="applications.length" class="lux-admin-expiry-field"><span>วันหมดอายุเมื่ออนุมัติ</span><input v-model="adminApproveExpiresAt" type="datetime-local" /></label><div v-if="applications.length" class="lux-pending-list"><div v-for="item in applications.slice(0, 4)" :key="item.id"><img v-if="item.profilePhotoUrl" class="lux-pending-avatar lux-pending-photo" :src="item.profilePhotoUrl" :alt="item.name" /><span v-else class="lux-pending-avatar">{{ item.name.slice(0, 1) }}</span><div><strong>{{ item.name }}</strong><small>{{ item.province }} · {{ item.line }}</small><small class="lux-email-status" :class="item.emailVerified === true ? 'is-active' : item.emailVerified === false ? 'is-pending' : 'is-unknown'">{{ item.emailVerified === true ? 'อีเมลยืนยันแล้ว' : item.emailVerified === false ? 'ยังไม่ยืนยันอีเมล' : 'ไม่มีบัญชี' }}</small><small class="lux-email-status" :class="item.hasProfilePhoto ? 'is-active' : 'is-pending'">{{ item.hasProfilePhoto ? 'มีรูปโปรไฟล์' : 'ยังไม่มีรูป' }}</small></div><button :disabled="!item.hasProfilePhoto" @click="approveApplication(item)">{{ item.hasProfilePhoto ? 'อนุมัติ' : 'รอรูป' }}</button></div></div><div v-else class="lux-admin-no-pending"><span><AppIcon name="check" /></span><strong>ไม่มีรายการค้าง</strong><small>ใบสมัครใหม่จะแสดงที่นี่</small></div></aside></div></template>
      <section v-else-if="adminTab !== 'travelers'" class="lux-admin-panel lux-admin-detail-panel">
        <div class="lux-admin-panel-head">
          <div>
            <h2>{{ adminTab === 'providers' ? 'พาร์ตเนอร์ทั้งหมด' : 'ใบสมัครพาร์ตเนอร์' }}</h2>
            <p>{{ adminTab === 'providers' ? 'ตั้งสถานะเผยแพร่ สมาชิก และวันหมดอายุหลังรับชำระนอกระบบ' : 'อนุมัติหลังรับชำระแล้ว · ต้องระบุวันหมดอายุสมาชิก' }}</p>
          </div>
          <span>{{ adminTab === 'providers' ? (filteredAdminProviders.length + ' / ' + providers.length) : applications.length }} รายการ</span>
        </div>
        <div v-if="adminTab === 'providers'" class="lux-admin-provider-filters">
          <label><span>ค้นหาชื่อ</span><input v-model="adminProviderSearch" type="search" placeholder="พิมพ์ชื่อพาร์ตเนอร์" /></label>
          <label><span>จังหวัด</span><select v-model="adminProviderProvince"><option value="">เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
          <label><span>เพศ</span><select v-model="adminProviderGender"><option value="">ทุกเพศ</option><option v-for="gender in adminProviderGenders" :key="gender">{{ gender }}</option></select></label>
          <button type="button" @click="adminProviderSearch = ''; adminProviderProvince = ''; adminProviderGender = ''">ล้างตัวกรอง</button>
        </div>
        <div v-if="adminTab === 'providers' && filteredAdminProviders.length" class="lux-admin-table-wrap">
          <table class="lux-admin-table">
            <thead><tr><th>พาร์ตเนอร์</th><th>พื้นที่ให้บริการ</th><th>สมาชิก</th><th>หมดอายุ</th><th>โปรไฟล์</th><th>จัดการ</th></tr></thead>
            <tbody>
              <tr v-for="provider in paginatedAdminProviders" :key="provider.id">
                <td>
                  <div class="lux-admin-provider">
                    <img v-if="providerPreviewMedia(provider)?.type === 'image'" :src="providerPreviewMedia(provider).url" :alt="'ภาพโปรไฟล์ ' + provider.name" loading="lazy" />
                    <video v-else-if="providerPreviewMedia(provider)" :src="providerPreviewMedia(provider).url" muted playsinline preload="metadata" :aria-label="'วิดีโอโปรไฟล์ ' + provider.name"></video>
                    <span v-else class="lux-admin-provider-placeholder">{{ provider.initials }}</span>
                    <div><strong>{{ provider.name }} · {{ provider.category }}</strong><small>LINE {{ provider.line }}</small></div>
                  </div>
                </td>
                <td>{{ provider.area }}, {{ provider.province }}</td>
                <td><button class="lux-admin-action" @click="setProviderStatus(provider, 'membershipActive')">{{ provider.membershipActive ? 'สมาชิกใช้งาน' : 'หมดอายุ' }}</button></td>
                <td>
                  <label class="lux-admin-expiry-inline">
                    <input type="datetime-local" :value="toDatetimeLocalValue(provider.membershipExpiresAt)" @change="saveProviderExpiry(provider, $event)" />
                    <small>{{ provider.membershipExpiresAt ? formatDateTime(provider.membershipExpiresAt) : 'ยังไม่ตั้ง' }}</small>
                  </label>
                </td>
                <td><button class="lux-admin-action" @click="setProviderStatus(provider, 'active')">{{ provider.active ? 'เผยแพร่' : 'ซ่อน' }}</button></td>
                <td>
                  <button type="button" class="lux-admin-action" @click="openProfile(provider)">ดูรายละเอียด</button>
                  <button v-if="can('user:delete')" type="button" class="lux-admin-action reject" @click="deleteAdminProviderAccount(provider)">ลบบัญชี</button>
                </td>
              </tr>
            </tbody>
          </table>
          <nav v-if="adminProviderPageCount > 1" class="lux-admin-pagination" aria-label="หน้าพาร์ตเนอร์">
            <button type="button" :disabled="adminProviderPage === 1" @click="adminProviderPage--">ก่อนหน้า</button>
            <span>หน้า {{ adminProviderPage }} / {{ adminProviderPageCount }}</span>
            <button type="button" :disabled="adminProviderPage === adminProviderPageCount" @click="adminProviderPage++">ถัดไป</button>
          </nav>
        </div>
        <div v-else-if="adminTab === 'providers'" class="lux-admin-provider-empty">ไม่พบพาร์ตเนอร์ตามเงื่อนไขที่เลือก</div>
        <template v-else>
          <label class="lux-admin-expiry-field"><span>วันและเวลาหมดอายุเมื่ออนุมัติ</span><input v-model="adminApproveExpiresAt" type="datetime-local" required /></label>
          <div v-if="applications.length" class="lux-admin-table-wrap">
            <table class="lux-admin-table">
              <thead><tr><th>รูป</th><th>ผู้สมัคร</th><th>อีเมล</th><th>สถานะอีเมล</th><th>รูปโปรไฟล์</th><th>จังหวัด</th><th>อัตลักษณ์</th><th>บริการ</th><th>LINE ID</th><th>จัดการ</th></tr></thead>
              <tbody>
                <tr v-for="item in applications" :key="item.id">
                  <td>
                    <img v-if="item.profilePhotoUrl" class="lux-admin-app-photo" :src="item.profilePhotoUrl" :alt="'รูปโปรไฟล์ ' + item.name" loading="lazy" />
                    <span v-else class="lux-admin-app-photo is-empty">ไม่มีรูป</span>
                  </td>
                  <td><strong>{{ item.name }}</strong></td>
                  <td>{{ item.email || '—' }}</td>
                  <td>
                    <span class="lux-email-status" :class="item.emailVerified === true ? 'is-active' : item.emailVerified === false ? 'is-pending' : 'is-unknown'">
                      {{ item.emailVerified === true ? 'ยืนยันแล้ว' : item.emailVerified === false ? 'ยังไม่ยืนยัน' : 'ไม่มีบัญชี' }}
                    </span>
                  </td>
                  <td>
                    <span class="lux-email-status" :class="item.hasProfilePhoto ? 'is-active' : 'is-pending'">
                      {{ item.hasProfilePhoto ? 'พร้อมตรวจ' : 'ยังไม่มีรูป' }}
                    </span>
                  </td>
                  <td>{{ item.province }}</td>
                  <td>{{ item.gender }}</td>
                  <td>{{ item.service }}</td>
                  <td>{{ item.line }}</td>
                  <td>
                    <button class="lux-admin-action" type="button" :disabled="!item.hasProfilePhoto" @click="approveApplication(item)">{{ item.hasProfilePhoto ? 'อนุมัติ' : 'รอรูป' }}</button>
                    <button class="lux-admin-action reject" type="button" @click="rejectApplication(item)">ปฏิเสธ</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="lux-admin-no-pending"><span><AppIcon name="check" /></span><strong>ไม่มีใบสมัครค้างตรวจสอบ</strong></div>
        </template>
      </section>
      <section v-else class="lux-admin-panel lux-admin-detail-panel">
        <div class="lux-admin-panel-head">
          <div><h2>{{ selectedTraveler ? `ข้อมูลนักท่องเที่ยว: ${selectedTraveler.traveler.name}` : 'นักท่องเที่ยวทั้งหมด' }}</h2><p>{{ selectedTraveler ? 'ข้อมูลบัญชีและประวัติการใช้งาน' : 'ค้นหาและเปิดดูข้อมูลบัญชี รายการโปรด และรีวิว' }}</p></div>
          <button v-if="selectedTraveler" type="button" @click="selectedTraveler = null"><AppIcon name="arrow-left" /> กลับไปยังรายชื่อ</button>
          <span v-else>{{ filteredAdminTravelers.length }} บัญชี</span>
        </div>
        <template v-if="selectedTraveler">
          <div class="lux-admin-traveler-info">
            <article><span>ชื่อที่ใช้แสดง</span><strong>{{ selectedTraveler.traveler.name }}</strong></article>
            <article><span>อีเมล</span><strong>{{ selectedTraveler.traveler.email }}</strong></article>
            <article><span>สถานะอีเมล</span><strong><span class="lux-email-status" :class="selectedTraveler.traveler.emailVerified ? 'is-active' : 'is-pending'">{{ selectedTraveler.traveler.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}</span></strong></article>
            <article><span>เบอร์โทรศัพท์</span><strong>{{ selectedTraveler.traveler.phone || 'ไม่ระบุ' }}</strong></article>
            <article><span>วันที่สมัคร</span><strong>{{ formatDateTime(selectedTraveler.traveler.createdAt) }}</strong></article>
          </div>
          <div v-if="can('user:delete')" class="lux-admin-traveler-actions">
            <button type="button" class="lux-admin-action reject" @click="deleteAdminTraveler(selectedTraveler.traveler)">ลบบัญชีนักท่องเที่ยว</button>
          </div>
          <section class="lux-admin-traveler-section">
            <h3>รายการโปรด ({{ selectedTraveler.favorites.length }})</h3>
            <ul v-if="selectedTraveler.favorites.length" class="lux-admin-traveler-favorites"><li v-for="provider in selectedTraveler.favorites" :key="provider.id">{{ provider.name }} <span>· {{ provider.province }}</span></li></ul>
            <p v-else class="lux-admin-traveler-empty">ไม่มีรายการโปรด</p>
          </section>
          <section class="lux-admin-traveler-section">
            <h3>รีวิวที่เขียน ({{ selectedTraveler.reviews.length }})</h3>
            <article v-for="review in selectedTraveler.reviews" :key="review.id" class="lux-admin-traveler-review"><div><strong>{{ review.provider }}</strong><span>บริการ {{ review.serviceRating }} <AppIcon name="star" /> · ความคุ้มค่า {{ review.valueRating }} <AppIcon name="star" /> · {{ formatDateTime(review.createdAt) }}</span></div><p>{{ review.comment }}</p><div v-if="review.media.length" class="lux-admin-traveler-review-media"><img v-for="media in review.media" :key="media.id" :src="media.url" :alt="media.name" loading="lazy" /></div></article>
            <p v-if="!selectedTraveler.reviews.length" class="lux-admin-traveler-empty">ยังไม่มีรีวิว</p>
          </section>
        </template>
        <div v-else class="lux-admin-traveler-list">
          <label class="lux-admin-traveler-search"><span>ค้นหาชื่อ อีเมล หรือเบอร์โทรศัพท์</span><input v-model="adminTravelerSearch" type="search" placeholder="พิมพ์ข้อมูลที่ต้องการค้นหา" /></label>
          <div v-if="filteredAdminTravelers.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>ชื่อที่ใช้แสดง</th><th>อีเมล</th><th>สถานะอีเมล</th><th>เบอร์โทรศัพท์</th><th>วันที่สมัคร</th><th>จัดการ</th></tr></thead><tbody><tr v-for="traveler in filteredAdminTravelers" :key="traveler.id"><td><strong>{{ traveler.name }}</strong></td><td>{{ traveler.email }}</td><td><span class="lux-email-status" :class="traveler.emailVerified ? 'is-active' : 'is-pending'">{{ traveler.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}</span></td><td>{{ traveler.phone || 'ไม่ระบุ' }}</td><td>{{ formatDateTime(traveler.createdAt) }}</td><td><button type="button" class="lux-admin-action" :disabled="isAdminTravelerLoading" @click="openAdminTraveler(traveler)">ดูรายละเอียด</button><button v-if="can('user:delete')" type="button" class="lux-admin-action reject" @click="deleteAdminTraveler(traveler)">ลบ</button></td></tr></tbody></table></div>
          <p v-else class="lux-admin-traveler-empty">ไม่พบนักท่องเที่ยว</p>
        </div>
      </section>
      </div>
      </Transition>
</main>

    <main :key="'design'" v-else-if="view === 'design'" class="lux-page lux-design-page"><div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>Design system</span></div><div class="lux-page-heading"><div><div class="lux-kicker"><span></span> NUANIA · VISUAL LANGUAGE</div><h1>Design<span>system</span></h1><p>ระบบภาพสำหรับแพลตฟอร์มนัดหมายผู้ให้บริการอิสระ เน้นความชัดเจน ความยินยอม และความเป็นส่วนตัว</p></div></div><section class="lux-design-section"><span class="lux-design-index">01 / COLOR</span><h2>Palette <small>ชุดสีสดใสแบบ full-color พร้อมไล่เฉดม่วง–ชมพู–ส้ม</small></h2><div class="lux-gradient-strip" aria-label="Signature gradient"></div><div class="lux-color-grid"><article v-for="color in [{name:'Violet', hex:'#7C3AED', cls:'swatch-violet'}, {name:'Pink',hex:'#EC4899',cls:'swatch-pink'}, {name:'Orange',hex:'#F97316',cls:'swatch-orange'}, {name:'Teal',hex:'#14B8A6',cls:'swatch-teal'}, {name:'Sky',hex:'#0EA5E9',cls:'swatch-sky'}, {name:'Indigo',hex:'#1E1B4B',cls:'swatch-indigo'}]" :key="color.name"><div :class="color.cls"></div><strong>{{ color.name }}</strong><span>{{ color.hex }}</span></article></div></section><section class="lux-design-section lux-type-samples"><span class="lux-design-index">02 / TYPOGRAPHY</span><h2>Type scale <small>ตัวอักษรชัดเจนและอ่านง่ายทุกหน้าจอ</small></h2><div><span>Display / 64</span><strong>นัดพบในแบบที่คุณเลือก</strong><span>Heading / 32</span><h3>ผู้ให้บริการอิสระ</h3><span>Body / 16</span><p>ดูโปรไฟล์และตกลงรายละเอียดก่อนยืนยันการนัดหมาย</p><span>Caption / 12</span><small>INDEPENDENT PROVIDER · CLEAR TERMS</small></div></section><section class="lux-design-section"><span class="lux-design-index">03 / COMPONENTS</span><h2>UI elements <small>คอมโพเนนต์ที่สม่ำเสมอและเข้าถึงได้บนทุกหน้าจอ</small></h2><div class="lux-component-row"><button class="lux-button lux-button-primary">ปุ่มหลัก <AppIcon name="arrow-right" /></button><button class="lux-button lux-button-light lux-border-button">ปุ่มรอง</button><span class="lux-verified">PROFILE</span><span class="lux-status">ยืนยันแล้ว</span><span class="lux-status waiting">รอยืนยัน</span></div><div class="lux-design-input"><label class="lux-form-label">Input / default<input placeholder="ชื่อหรือพื้นที่ให้บริการ" /></label><label class="lux-form-label">Select / default<select><option>เลือกจังหวัด</option></select></label></div></section><section class="lux-design-section"><span class="lux-design-index">04 / SPACING & SHAPE</span><h2>Layout principles <small>จังหวะพื้นที่และรูปทรง</small></h2><div class="lux-principles"><div><span class="lux-space-swatch space-8"></span><strong>8 px</strong><small>micro spacing</small></div><div><span class="lux-space-swatch space-16"></span><strong>16 px</strong><small>component gap</small></div><div><span class="lux-space-swatch space-24"></span><strong>24 px</strong><small>card padding</small></div><div><span class="lux-space-swatch space-40"></span><strong>40 px</strong><small>section rhythm</small></div><p>ใช้กริด 12 คอลัมน์บน desktop และ single-column flow บนมือถือ ปุ่มและช่องกรอกมีพื้นที่สัมผัสอย่างน้อย 44 px, มุมโค้ง 14–24 px และหลีกเลี่ยงการเปิดเผยข้อมูลที่ไม่จำเป็น</p></div></section></main>

    <main :key="'seller'" v-else-if="view === 'seller' && sellerProvider" class="lux-page lux-seller-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ศูนย์จัดการผู้ขาย</span></div>
      <div class="lux-seller-heading"><div><div class="lux-kicker"><span></span> SELLER WORKSPACE</div><h1>จัดการ<span>บริการของคุณ</span></h1><p>{{ sellerProvider.name }} · {{ sellerProvider.province }}</p></div><span class="lux-seller-status" :class="{ published: sellerProvider.active }">{{ sellerProvider.active ? 'เผยแพร่แล้ว' : 'รอตรวจสอบโปรไฟล์' }}</span></div>
      <nav class="lux-seller-tabs" aria-label="เมนูจัดการผู้ขาย"><button :class="{ active: sellerDashboardTab === 'overview' }" @click="sellerDashboardTab = 'overview'">ภาพรวม</button><button :class="{ active: sellerDashboardTab === 'seek' }" @click="sellerDashboardTab = 'seek'; safely(() => loadSeekPosts())">โพสหา <small v-if="seekPosts.length">{{ seekPosts.length }}</small></button><button :class="{ active: sellerDashboardTab === 'profile' }" @click="sellerDashboardTab = 'profile'">โปรไฟล์และบริการ</button><button class="lux-seller-switch" @click="openBuyerArea">ไปหน้าผู้ซื้อ ↗</button></nav>
      <Transition name="lux-panel" mode="out-in">
      <section v-if="sellerDashboardTab === 'overview'" :key="'seller-overview'" class="lux-seller-overview">
        <div v-if="!sellerProvider.active || !sellerProvider.membershipActive" class="lux-seller-review-note"><strong>{{ !sellerProvider.active ? 'โปรไฟล์กำลังรอตรวจสอบ' : 'สมาชิกยังไม่เปิดใช้งาน' }}</strong><span>{{ !sellerProvider.active ? 'ชำระค่าลงประกาศกับเจ้าของเว็บนอกระบบ แล้วรอผู้ดูแลอนุมัติและตั้งวันหมดอายุ' : 'โปรดติดต่อผู้ดูแลเพื่อต่ออายุสมาชิกหลังชำระเงินนอกระบบ' }} · LINE {{ ownerLineLabel }}</span><div class="lux-seller-review-actions"><button type="button" @click="openOwnerLine">ติดต่อ NuaNia ได้ที่ LINE {{ ownerLineLabel }} ↗</button><button type="button" @click="sellerDashboardTab = 'profile'">ตรวจสอบโปรไฟล์ ↗</button></div></div>
        <div class="lux-seller-metrics"><article><span>สถานะโปรไฟล์</span><strong>{{ isProviderPubliclyListed(sellerProvider) ? 'เผยแพร่' : 'ยังไม่แสดง' }}</strong></article><article><span>หมดอายุสมาชิก</span><strong>{{ sellerProvider.membershipExpiresAt ? formatDateTime(sellerProvider.membershipExpiresAt) : 'ไม่ระบุ' }}</strong></article><article><span>รีวิวทั้งหมด</span><strong>{{ sellerReviewSummary?.count || 0 }}</strong></article><article><span>คะแนนเฉลี่ย</span><strong>{{ sellerReviewSummary ? ((Number(sellerReviewSummary.service) + Number(sellerReviewSummary.value)) / 2).toFixed(1) + ' ★' : '—' }}</strong></article></div>
        <section class="lux-seller-panel lux-seller-reviews-panel">
          <div class="lux-seller-panel-head">
            <div>
              <h2>รีวิวจากนักท่องเที่ยว</h2>
              <p>{{ sellerReviewSummary ? `บริการ ${sellerReviewSummary.service} ★ · คุ้มค่าเงิน ${sellerReviewSummary.value} ★ · เรียงล่าสุดก่อน` : 'ความคิดเห็นจากนักท่องเที่ยวที่รีวิวโปรไฟล์ของคุณ' }}</p>
            </div>
            <span>{{ sellerReviews.length }} รีวิว</span>
          </div>
          <div v-if="sellerReviews.length" class="lux-review-list">
            <article v-for="review in sellerReviews" :key="review.id" class="lux-review-card">
              <div class="lux-review-card-head">
                <span><strong>{{ review.userName }}</strong></span>
                <time>{{ formatDateTime(review.createdAt) }}</time>
              </div>
              <div class="lux-review-score">
                <span>บริการ <span class="lux-review-stars" :aria-label="`${review.serviceRating} จาก 5 ดาว`"><span v-for="star in 5" :key="`s-${review.id}-${star}`" :class="{ active: star <= review.serviceRating }">★</span></span></span>
                <span>คุ้มค่าเงิน <span class="lux-review-stars" :aria-label="`${review.valueRating} จาก 5 ดาว`"><span v-for="star in 5" :key="`v-${review.id}-${star}`" :class="{ active: star <= review.valueRating }">★</span></span></span>
              </div>
              <p>{{ review.comment }}</p>
              <div v-if="review.media?.length" class="lux-review-media-row">
                <button v-for="(media, index) in review.media" :key="media.id" type="button" :aria-label="`ขยายรูปรีวิว ${index + 1}`" @click="openMediaViewer(review.media, index)">
                  <img :src="media.url" :alt="media.name" loading="lazy" />
                </button>
              </div>
            </article>
          </div>
          <div v-else class="lux-empty">
            <span>✦</span>
            <h3>ยังไม่มีรีวิว</h3>
            <p>เมื่อนักท่องเที่ยวรีวิวโปรไฟล์ของคุณ รายการล่าสุดจะแสดงที่นี่ก่อน</p>
          </div>
        </section>
      </section>
      <section v-else-if="sellerDashboardTab === 'seek'" :key="'seller-seek'" class="lux-seller-panel lux-seller-seek">
        <div class="lux-seller-panel-head">
          <div>
            <h2>โพสหาจากนักท่องเที่ยว</h2>
            <p>{{ seekBoardFilter.province ? `กำลังดูโพสในจังหวัด${seekBoardFilter.province}` : 'คอมเมนต์แนะนำตัวได้เมื่อโพสยังเปิดรับ · แก้ไขหรือลบคอมเมนต์ของตัวเองได้' }}</p>
          </div>
          <button type="button" class="lux-text-link" @click="navigate('seek')">เปิดบอร์ดเต็ม ↗</button>
        </div>
        <div class="lux-seek-filter" style="margin-bottom:14px">
          <span>จังหวัด{{ seekBoardFilter.province ? ` · ${seekBoardFilter.province}` : '' }}</span>
          <select v-model="seekBoardFilter.province" @change="applySeekBoardFilter">
            <option value="">ทุกจังหวัด</option>
            <option v-for="province in provinces" :key="`seller-seek-${province}`">{{ province }}</option>
          </select>
        </div>
        <div v-if="seekPosts.length" class="lux-seek-list">
          <article v-for="post in seekPosts" :key="`seller-${post.id}`" class="lux-seek-card" :class="{ active: selectedSeekPost?.id === post.id }">
            <button type="button" class="lux-seek-card-main" @click="openSeekPost(post.id)">
              <div class="lux-seek-card-top">
                <strong>{{ post.title }}</strong>
                <span class="lux-seek-status open">เปิดรับ</span>
              </div>
              <p v-if="post.description">{{ post.description }}</p>
              <div class="lux-seek-card-meta">
                <span>{{ post.author?.name }}</span>
                <span>{{ post.province }}</span>
                <span v-if="post.venue">ร้าน {{ post.venue }}</span>
                <span>งบ {{ post.budget }}</span>
                <span>{{ post.duration }}</span>
                <span>{{ post.commentCount }} คอมเมนต์</span>
                <span>{{ formatDateTime(post.createdAt) }}</span>
              </div>
            </button>
          </article>
        </div>
        <div v-else class="lux-empty"><span>⌕</span><h3>ยังไม่มีโพสเปิดรับ</h3><p>เมื่อนักท่องเที่ยวโพสหาในจังหวัดที่เกี่ยวข้อง จะแสดงที่นี่</p></div>
      </section>
      <form v-else :key="'seller-profile'" class="lux-seller-panel lux-seller-profile" novalidate @submit.prevent="saveSellerProfile"><div class="lux-seller-panel-head"><div><h2>โปรไฟล์และบริการ</h2><p>ข้อมูลนี้จะแสดงในหน้าค้นหาหลังผ่านการตรวจสอบ</p></div></div><div v-if="sellerSaveAlert" id="seller-save-alert" class="lux-seller-save-alert" :class="{ ok: sellerSaveAlert === 'บันทึกข้อมูลบริการแล้ว' }" role="alert">{{ sellerSaveAlert }}</div><div class="lux-membership-fields"><label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="sellerProvider.name" maxlength="40" required /></label><label class="lux-form-label">จังหวัด<select v-model="sellerProvider.province" required><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="sellerProvider.price" type="number" inputmode="numeric" min="1" step="1" required /></label><label class="lux-form-label">อายุ<input v-model.number="sellerProvider.age" type="number" inputmode="numeric" min="18" max="100" step="1" required /></label><label class="lux-form-label">ส่วนสูง (ซม.)<input v-model.number="sellerProvider.heightCm" type="number" inputmode="numeric" min="120" max="230" step="1" required /></label><label class="lux-form-label">น้ำหนัก (กก.)<input v-model.number="sellerProvider.weightKg" type="number" inputmode="numeric" min="30" max="250" step="1" required /></label><label class="lux-form-label">สัดส่วน<input v-model.trim="sellerProvider.measurements" maxlength="80" placeholder="เช่น 34-24-36 นิ้ว" required /></label><label class="lux-form-label">สถานที่ให้บริการ<input v-model.trim="sellerProvider.venue" maxlength="100" required /></label><label class="lux-form-label">LINE ID<input v-model.trim="sellerProvider.line" maxlength="80" placeholder="เช่น mali.relax" /></label><label class="lux-form-label">ลิงก์ Facebook<input v-model.trim="sellerProvider.facebook" maxlength="300" type="text" inputmode="url" placeholder="https://facebook.com/yourpage" /></label><label class="lux-form-label lux-membership-wide">รายละเอียดบริการ<textarea v-model="sellerProvider.description" rows="5" maxlength="300" placeholder="เขียนรายละเอียดได้หลายบรรทัด และใส่อิโมจิได้ ✨&#10;เช่น 🌿 จุดเด่นหรือบรรยากาศบริการ&#10;🕒 เวลาที่ให้บริการ" required></textarea></label></div><section class="lux-seller-services" aria-labelledby="seller-services-heading"><div class="lux-seller-panel-head"><div><h2 id="seller-services-heading">รูปแบบและราคา</h2><p>เพิ่มรายการบริการพร้อมชื่อ ระยะเวลา รายละเอียด และราคา (แสดงบนโปรไฟล์เท่านั้น ไม่มีการจองผ่านเว็บ)</p></div><button class="lux-button lux-button-light" type="button" :disabled="sellerProvider.services.length >= 30" @click="addSellerService">＋ เพิ่มรูปแบบ</button></div><article v-for="(service, index) in sellerProvider.services" :key="index" class="lux-seller-service-row"><div class="lux-seller-service-heading"><strong>รูปแบบที่ {{ index + 1 }}</strong><button type="button" :disabled="sellerProvider.services.length <= 1" @click="removeSellerService(index)">ลบ</button></div><label class="lux-form-label">ชื่อรูปแบบ<input v-model.trim="service.name" maxlength="60" placeholder="เช่น พบปะพูดคุย ✨" required /></label><div class="lux-seller-service-fields"><label class="lux-form-label">ระยะเวลา<input v-model.trim="service.duration" maxlength="40" placeholder="เช่น 60 นาที" required /></label><label class="lux-form-label">ราคา (บาท)<input v-model.number="service.price" type="number" inputmode="numeric" min="1" max="1000000" step="1" required /></label></div><label class="lux-form-label">รายละเอียด<textarea v-model.trim="service.description" maxlength="200" rows="4" placeholder="ใส่รายละเอียดได้หลายบรรทัด และใช้อิโมจิได้ ✨&#10;เช่น 🌿 นัดพบในบรรยากาศสบาย ๆ" required></textarea></label></article></section><section class="lux-seller-media-manager" aria-labelledby="seller-media-heading"><div class="lux-seller-panel-head"><div><h2 id="seller-media-heading">สื่อโปรโมตบริการ</h2><p>เพิ่มรูปภาพหรือวิดีโอได้หลายไฟล์ เพื่อแสดงในหน้าโปรไฟล์ของคุณ</p></div><span class="lux-seller-media-count">{{ sellerProvider.media?.length || 0 }} ไฟล์</span></div><label class="lux-seller-upload"><input type="file" accept="image/*,video/*" multiple @change="addSellerMedia" /><span aria-hidden="true">＋</span><strong>เลือกรูปภาพหรือวิดีโอ</strong><small>เลือกหลายไฟล์พร้อมกันได้</small></label><div v-if="sellerProvider.media?.length" class="lux-seller-media-grid"><article v-for="media in sellerProvider.media" :key="media.id" class="lux-seller-media-item"><img v-if="media.type === 'image'" :src="media.url" :alt="media.name" /><video v-else :src="media.url" controls preload="metadata" playsinline :aria-label="media.name"></video><div><span :title="media.name">{{ media.name }}</span><button type="button" :aria-label="`ลบไฟล์ ${media.name}`" @click="removeSellerMedia(media.id)">ลบ</button></div></article></div><p class="lux-seller-media-note">สื่อที่เพิ่มจะปรากฏบนโปรไฟล์สาธารณะหลังบันทึก</p></section><div v-if="sellerSaveAlert" class="lux-seller-save-alert" :class="{ ok: sellerSaveAlert === 'บันทึกข้อมูลบริการแล้ว' }" role="alert">{{ sellerSaveAlert }}</div><button class="lux-button lux-button-primary" type="button" @click="saveSellerProfile">บันทึกข้อมูลบริการ ↗</button></form>
      </Transition>
    </main>
    </Transition>

    <footer class="lux-footer"><div class="lux-footer-main"><div class="lux-logo"><span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>CONNECT ON YOUR TERMS</small></span></div><p>นัวเนีย รวมเด็กเอ็น เด็กเอนเตอร์เทรน<br />ทั่วประเทศไทย · ไม่จองผ่านเว็บ</p><div class="lux-footer-links"><button @click="navigate('search')">ค้นหาผู้ให้บริการ</button><button v-if="currentUser" @click="openOwnArea">{{ accountMenuLabel }}</button><button v-else @click="navigate('login')">เข้าสู่ระบบ</button><button v-if="!currentUser" @click="navigate('apply')">ลงโปรไฟล์ผู้ให้บริการ</button></div><div class="lux-footer-contact"><span>NEED SUPPORT?</span><strong>ติดต่อ NuaNia ได้ที่</strong><a class="lux-footer-line" :href="ownerLineUrl" target="_blank" rel="noopener noreferrer" @click.prevent="openOwnerLine">LINE {{ ownerLineLabel }} <AppIcon name="arrow-right" /></a></div></div><div class="lux-footer-bottom"><span>© 2026 NUANIA · INDEPENDENT PROVIDER PLATFORM</span><span>ความเป็นส่วนตัว　 ข้อกำหนดการใช้บริการ</span><span>THAILAND · CONNECT WITH CARE</span></div></footer>

    <nav class="lux-mobile-bottom" aria-label="เมนูมือถือ"><button :class="{ active: view === 'search' || isSearchFilterOpen }" @click="openSearchFilters()"><span><AppIcon name="magnifying-glass" /></span>ค้นหา</button><button :class="{ active: view === 'home' }" @click="navigate('home')"><span><AppIcon name="house" /></span>หน้าแรก</button><button v-if="!currentUser" :class="{ active: view === 'membership' }" @click="navigate('membership')"><span><AppIcon name="user-plus" /></span>สมัครสมาชิก</button><button v-else :class="{ active: view === currentHomeView }" @click="openOwnArea"><span><AppIcon name="user" /></span>{{ accountMenuLabel }}</button></nav>

    <Teleport to="body">
      <div v-if="isSearchFilterOpen" class="lux-search-filter-modal" role="dialog" aria-modal="true" aria-labelledby="search-filter-title" @click.self="closeSearchFilters">
        <section class="lux-search-filter-dialog">
          <header class="lux-search-filter-header">
            <h2 id="search-filter-title">ค้นหาบริการ</h2>
            <button type="button" aria-label="ปิดหน้าค้นหาบริการ" @click="closeSearchFilters"><AppIcon name="xmark" /></button>
          </header>
          <label class="lux-filter-search lux-search-modal-query"><span><AppIcon name="magnifying-glass" /></span><input ref="searchFilterInput" v-model="searchName" placeholder="ค้นหาชื่อ บริการ หรือพื้นที่" /></label>
          <div class="lux-search-modal-selects">
            <label class="lux-filter-select"><span>จังหวัด</span><select v-model="selectedProvince"><option value="">เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
            <label class="lux-filter-select"><span>อัตลักษณ์ทางเพศ</span><select v-model="selectedGender"><option value="">ทั้งหมด</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label>
          </div>
          <fieldset class="lux-filter-group lux-filter-mode"><legend>รูปแบบการนัดพบ</legend><div class="lux-search-modal-mode-options"><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="" /><span>ทั้งหมด</span></label><label v-for="mode in availableAppointmentModes" :key="mode" class="lux-check-row"><input v-model="selectedMode" type="radio" :value="mode" /><span>{{ mode === 'ที่ร้าน' ? 'สถานที่นัดพบ' : mode === 'นอกสถานที่' ? 'นัดตามพื้นที่' : mode }}</span></label></div></fieldset>
          <fieldset class="lux-filter-group lux-filter-services">
            <legend>รูปแบบบริการ</legend>
            <div class="lux-search-modal-service-options">
              <label class="lux-check-row"><input v-model="selectedService" type="radio" value="" /><span>ทั้งหมด</span></label>
              <label v-for="cat in serviceCategories" :key="cat.value" class="lux-check-row">
                <input v-model="selectedService" type="radio" :value="cat.value" />
                <span>{{ cat.label }}</span>
              </label>
            </div>
          </fieldset>
          <footer class="lux-search-filter-footer"><button type="button" class="lux-search-reset" @click="resetSearchFilters">ล้างตัวกรอง</button><button type="button" class="lux-button lux-button-primary lux-search-submit-cta" @click="applySearchFilters">ค้นหาโปรไฟล์ <span><AppIcon name="arrow-right" /></span></button></footer>
        </section>
      </div>
      <div v-if="notice" class="lux-toast" role="status" aria-live="polite"><span><AppIcon name="check" /></span>{{ notice }}</div>
      <div v-if="isMembershipSubmitting" class="lux-loading-overlay" role="status" aria-live="assertive" aria-busy="true">
        <div class="lux-loading-card">
          <span class="lux-loading-spinner" aria-hidden="true"></span>
          <strong>กำลังสมัครสมาชิก</strong>
          <p>กำลังสร้างบัญชีและส่งอีเมลยืนยัน กรุณารอสักครู่...</p>
        </div>
      </div>
      <div
        v-if="isSeekComposeOpen"
        class="lux-seek-modal-backdrop"
        role="presentation"
        @click.self="closeSeekCompose"
      >
        <div class="lux-seek-modal" role="dialog" aria-modal="true" aria-labelledby="seek-compose-title">
          <div class="lux-seek-modal-head">
            <div>
              <div class="lux-kicker"><span></span> NEW SEEK POST</div>
              <h2 id="seek-compose-title">สร้างโพสหา</h2>
            </div>
            <button type="button" class="lux-seek-modal-close" aria-label="ปิด" :disabled="isSeekSubmitting" @click="closeSeekCompose"><AppIcon name="xmark" /></button>
          </div>
          <form class="lux-seek-form" novalidate @submit.prevent="submitSeekPost">
            <label class="lux-form-label" :class="{ 'has-error': seekFormErrors.title }">
              <span>หัวข้อ</span>
              <input v-model.trim="seekForm.title" maxlength="120" placeholder="เช่น หาผู้ให้บริการเย็นนี้" :disabled="isSeekSubmitting" />
              <small v-if="seekFormErrors.title" class="lux-field-error">{{ seekFormErrors.title }}</small>
            </label>
            <div class="lux-seek-form-row">
              <label class="lux-form-label" :class="{ 'has-error': seekFormErrors.province }">
                <span>จังหวัด</span>
                <select v-model="seekForm.province" :disabled="isSeekSubmitting"><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="`compose-${province}`">{{ province }}</option></select>
                <small v-if="seekFormErrors.province" class="lux-field-error">{{ seekFormErrors.province }}</small>
              </label>
              <label class="lux-form-label" :class="{ 'has-error': seekFormErrors.venue }">
                <span>ร้าน</span>
                <input v-model.trim="seekForm.venue" maxlength="120" placeholder="เช่น ร้านนวดสุขใจ / โรงแรม..." :disabled="isSeekSubmitting" />
                <small v-if="seekFormErrors.venue" class="lux-field-error">{{ seekFormErrors.venue }}</small>
              </label>
            </div>
            <div class="lux-seek-form-row">
              <label class="lux-form-label" :class="{ 'has-error': seekFormErrors.budget }">
                <span>งบประมาณ</span>
                <input v-model.trim="seekForm.budget" maxlength="80" placeholder="เช่น 1,500–2,000 บาท" :disabled="isSeekSubmitting" />
                <small v-if="seekFormErrors.budget" class="lux-field-error">{{ seekFormErrors.budget }}</small>
              </label>
              <label class="lux-form-label" :class="{ 'has-error': seekFormErrors.duration }">
                <span>ระยะเวลา</span>
                <input v-model.trim="seekForm.duration" maxlength="80" placeholder="เช่น 2 ชั่วโมง / เย็นนี้ 20:00–22:00" :disabled="isSeekSubmitting" />
                <small v-if="seekFormErrors.duration" class="lux-field-error">{{ seekFormErrors.duration }}</small>
              </label>
            </div>
            <label class="lux-form-label">
              <span>รายละเอียดเพิ่มเติม <span class="lux-optional">(ไม่บังคับ)</span></span>
              <textarea v-model.trim="seekForm.description" rows="3" maxlength="1000" placeholder="ขอบเขตหรือเงื่อนไขเพิ่มเติม" :disabled="isSeekSubmitting"></textarea>
            </label>
            <div class="lux-seek-modal-actions">
              <button class="lux-button lux-button-light" type="button" :disabled="isSeekSubmitting" @click="closeSeekCompose">ยกเลิก</button>
              <button class="lux-button lux-button-primary" type="submit" :disabled="isSeekSubmitting">
                {{ isSeekSubmitting ? 'กำลังโพส...' : 'โพสหาผู้ให้บริการ' }} <AppIcon name="arrow-right" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
