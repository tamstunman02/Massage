<script setup>
import { computed, onMounted, ref } from 'vue'
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
const sortBy = ref('แนะนำ')
const selectedProvider = ref(null)
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
const accountTab = ref('appointments')
const member = ref(null)
const activeRole = ref('buyer')
const loginRole = ref('buyer')
const memberSellerProviderId = ref(null)
const membership = ref({ role: 'buyer', name: '', email: '', phone: '', password: '', businessName: '', province: '', service: '', price: 1000 })
const sellerDashboardTab = ref('overview')
const currentUser = ref(null)
const loginForm = ref({ email: '', password: '' })
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
  const [providerList, bookingList, favoriteList, applicationList] = await Promise.all([
    api.providers(),
    currentUser.value ? api.bookings() : [],
    can('favorite:manage') ? api.favorites() : [],
    can('provider:approve') ? api.applications() : [],
  ])
  providers.value = providerList
  bookings.value = bookingList
  favorites.value = favoriteList
  applications.value = applicationList
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

onMounted(async () => {
  await safely(async () => {
    applyUser((await api.me()).user)
    await loadData()
  }, 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ')
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

const services = [
  { name: 'พบปะพูดคุย', duration: '60 นาที', add: 0 },
  { name: 'ร่วมกิจกรรม', duration: '90 นาที', add: 300 },
  { name: 'งานอีเวนต์', duration: '90 นาที', add: 500 },
]

const visibleProviders = computed(() => {
  const term = searchName.value.trim().toLocaleLowerCase()
  const results = providers.value.filter((provider) => {
    const searchable = `${provider.name} ${provider.line} ${provider.area} ${provider.province} ${provider.category} ${provider.tags.join(' ')}`.toLocaleLowerCase()
    return provider.active && provider.membershipActive &&
      (!selectedProvince.value || provider.province === selectedProvince.value) &&
      (!selectedGender.value || provider.gender === selectedGender.value) &&
      (!selectedMode.value || provider.modes.includes(selectedMode.value)) &&
      (!selectedService.value || provider.tags.some((tag) => tag.toLocaleLowerCase().includes(selectedService.value.toLocaleLowerCase()))) &&
      (!term || searchable.includes(term))
  })
  if (sortBy.value === 'ราคา: ต่ำไปสูง') return [...results].sort((a, b) => a.price - b.price)
  if (sortBy.value === 'คะแนนสูงสุด') return [...results].sort((a, b) => Number(b.rating) - Number(a.rating))
  return results
})

const selectedServiceOption = computed(() => services.find((service) => service.name === booking.value.service) || services[0])
const bookingPrice = computed(() => (selectedProvider.value?.price || 0) + (selectedServiceOption.value?.add || 0) + (booking.value.mode === 'นอกสถานที่' ? 250 : 0))
const upcomingBookings = computed(() => bookings.value.filter((item) => item.status !== 'เสร็จสิ้น'))
const completedBookings = computed(() => bookings.value.filter((item) => item.status === 'เสร็จสิ้น'))
const favoriteProviders = computed(() => providers.value.filter((provider) => favorites.value.includes(provider.id)))
const activeProviderCount = computed(() => providers.value.filter((provider) => provider.active && provider.membershipActive).length)
const sellerProvider = computed(() => providers.value.find((provider) => provider.id === memberSellerProviderId.value))
const sellerBookings = computed(() => bookings.value.filter((item) => item.providerId === memberSellerProviderId.value))

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
  const saved = await safely(() => api.updateProvider(provider.id, {
    name: provider.name, price: provider.price, description: provider.description,
    venue: provider.venue, province: provider.province, modes: provider.modes,
  }))
  if (saved) {
    providers.value = providers.value.map((item) => (item.id === saved.id ? saved : item))
    showNotice('บันทึกข้อมูลบริการแล้ว')
  }
}

async function setProviderStatus(provider, field) {
  const saved = await safely(() => api.setProviderStatus(provider.id, { [field]: !provider[field] }))
  if (saved) providers.value = providers.value.map((item) => (item.id === saved.id ? saved : item))
}

function navigate(nextView) {
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
    showNotice('Google Login เปิดให้ใช้เฉพาะผู้ซื้อบริการ')
    return
  }
  showNotice('ปุ่ม Google Login เป็นตัวอย่าง ยังไม่ได้เชื่อมต่อ Google OAuth')
}

function openProfile(provider) {
  selectedProvider.value = provider
  navigate('profile')
}

function startBooking(provider = selectedProvider.value) {
  selectedProvider.value = provider
  booking.value = {
    mode: provider.modes.includes(profileBookingMode.value) ? profileBookingMode.value : provider.modes[0],
    service: services[0].name,
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
    showNotice('กรุณาเข้าสู่ระบบในฐานะผู้ซื้อบริการก่อนส่งคำขอนัดหมาย')
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
    showNotice('กรุณาเข้าสู่ระบบในฐานะผู้ซื้อบริการเพื่อบันทึกรายการโปรด')
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

function formatDate(date) {
  if (!date) return 'ยังไม่ได้เลือกวันที่'
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function scrollToProviders() {
  navigate('search')
}

</script>

<template>
  <div class="lux-app" :class="[{ 'seller-dashboard': view === 'seller' }, `role-theme-${currentRole}`]">
    <div class="lux-topline">
      <span>แพลตฟอร์มนัดหมายส่วนตัวสำหรับผู้ใหญ่ 18+ · ทุกบริการต้องมีความยินยอม</span>
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

    <main v-if="view === 'home'">
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

      <section class="lux-discovery">
        <div class="lux-section-intro">
          <div><div class="lux-kicker"><span></span> FIND YOUR CONNECTION</div><h2>ค้นหาผู้ให้บริการ<br class="lux-mobile-only" />ที่<span>ตรงกับคุณ</span></h2></div>
          <p>เลือกพื้นที่และรูปแบบนัดพบที่สะดวก<br />คุยรายละเอียดและขอบเขตก่อนยืนยัน</p>
        </div>
        <div class="lux-quick-search">
          <label><span>⌕</span><div><small>ค้นหาผู้ให้บริการหรือพื้นที่</small><input v-model="searchName" placeholder="เช่น ร่วมกิจกรรม, สุขุมวิท" @focus="view = 'home'" /></div></label>
          <label><span>⌖</span><div><small>เลือกจังหวัด</small><select v-model="selectedProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></div></label>
          <label><span>◷</span><div><small>รูปแบบการนัดพบ</small><select v-model="selectedMode"><option value="">ทุกรูปแบบ</option><option>ที่ร้าน</option><option>นอกสถานที่</option></select></div></label>
          <button class="lux-button lux-button-olive" @click="scrollToProviders">ค้นหา <span>→</span></button>
        </div>
        <div class="lux-category-row"><span>สำรวจรูปแบบ</span><button @click="selectedService = ''; navigate('search')">ทั้งหมด</button><button @click="selectedService = 'พบปะพูดคุย'; navigate('search')">พบปะพูดคุย</button><button @click="selectedService = 'ร่วมกิจกรรม'; navigate('search')">ร่วมกิจกรรม</button><button @click="selectedService = 'งานอีเวนต์'; navigate('search')">งานอีเวนต์</button><button @click="selectedService = 'ไลฟ์สไตล์'; navigate('search')">ไลฟ์สไตล์</button></div>
      </section>

      <section class="lux-curated">
        <div class="lux-curated-heading"><div><div class="lux-kicker"><span></span> THE NUANIA EDIT</div><h2>โปรไฟล์น่าสนใจ<span>สำหรับคุณ</span></h2><p>ดูรายละเอียด รูปแบบบริการ และข้อตกลงก่อนตัดสินใจนัดหมาย</p></div><button class="lux-text-link" @click="navigate('search')">ดูทั้งหมด <span>↗</span></button></div>
        <div class="lux-provider-grid">
          <article v-for="provider in providers.slice(0, 3)" :key="provider.id" class="lux-provider-card">
            <div class="lux-card-image" :class="provider.visual" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)">
              <span class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span>
              <button class="lux-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)">{{ favorites.includes(provider.id) ? '♥' : '♡' }}</button>
              <span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span>
            </div>
            <div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">PROFILE</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">รายละเอียด <span>↗</span></button></div></div>
          </article>
        </div>
      </section>

      <section class="lux-experience">
        <div class="lux-experience-art"><div class="lux-experience-circle">N<span>✳</span></div><div class="lux-experience-caption">NUANIA · CONNECT ON YOUR TERMS</div></div>
        <div class="lux-experience-copy"><div class="lux-kicker"><span></span> CLEAR TERMS, BETTER CONNECTIONS</div><h2>นัดหมายอย่างมั่นใจ<br />เริ่มจาก<span>ความชัดเจน</span></h2><p>NuaNia เชื่อมต่อผู้ใช้บริการกับผู้ให้บริการอิสระ แสดงรายละเอียดและราคาให้พิจารณา พร้อมสนับสนุนการสื่อสารเรื่องความยินยอมและขอบเขตการนัดหมาย</p><div class="lux-value-list"><span><i>01</i> อ่านโปรไฟล์และรายละเอียดก่อนเลือก</span><span><i>02</i> ตกลงเวลา สถานที่ และราคาให้ชัดเจน</span><span><i>03</i> เคารพความยินยอมและความเป็นส่วนตัว</span></div><button class="lux-text-link" @click="navigate('search')">ค้นหาผู้ให้บริการ <span>↗</span></button></div>
      </section>

      <section class="lux-partner-banner"><div class="lux-partner-mark">N</div><div><small>FOR INDEPENDENT PROVIDERS</small><h2>ให้โปรไฟล์ของคุณ<br />เข้าถึงคนที่ใช่</h2><p>กำหนดรูปแบบบริการ ราคา และขอบเขตได้ด้วยตัวเอง</p></div><button class="lux-button lux-button-light" @click="membership.role = 'seller'; navigate('membership')">ลงโปรไฟล์ผู้ให้บริการ <span>↗</span></button><span class="lux-partner-bg">NUANIA</span></section>
    </main>

    <main v-else-if="view === 'search'" class="lux-page lux-search-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ค้นหาผู้ให้บริการ</span></div>
      <div class="lux-page-heading"><div><div class="lux-kicker"><span></span> FIND YOUR CONNECTION</div><h1>ค้นหาผู้ให้บริการ<span>อิสระ</span></h1><p>เลือกดูโปรไฟล์ รูปแบบนัดพบ และรายละเอียดบริการทั่วประเทศไทย</p></div><div class="lux-result-note"><strong>{{ visibleProviders.length.toString().padStart(2, '0') }}</strong><span>โปรไฟล์ที่ตรงกับคุณ</span></div></div>
      <div class="lux-search-layout">
        <aside class="lux-filter-panel"><div class="lux-filter-heading"><strong>ตัวกรอง</strong><button @click="searchName = ''; selectedProvince = ''; selectedGender = ''; selectedMode = ''; selectedService = ''">ล้างทั้งหมด</button></div>
          <label class="lux-filter-search"><span>⌕</span><input v-model="searchName" placeholder="ชื่อ รูปแบบบริการ หรือพื้นที่" /></label>
          <fieldset><legend>รูปแบบการนัดพบ</legend><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="" /><span>ทั้งหมด</span></label><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="ที่ร้าน" /><span>สถานที่นัดพบ</span><small>ดูรายละเอียดสถานที่ในโปรไฟล์</small></label><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="นอกสถานที่" /><span>นัดตามพื้นที่ที่ตกลง</span><small>นัดหมายตามข้อตกลงร่วมกัน</small></label></fieldset>
          <label class="lux-filter-select"><span>จังหวัด</span><select v-model="selectedProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
          <label class="lux-filter-select"><span>อัตลักษณ์ทางเพศ</span><select v-model="selectedGender"><option value="">ทั้งหมด</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label>
          <fieldset><legend>รูปแบบบริการ</legend><label class="lux-check-row"><input v-model="selectedService" type="radio" value="" /><span>ทั้งหมด</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="พบปะพูดคุย" /><span>พบปะพูดคุย</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="ร่วมกิจกรรม" /><span>ร่วมกิจกรรม</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="งานอีเวนต์" /><span>งานอีเวนต์</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="ไลฟ์สไตล์" /><span>ไลฟ์สไตล์</span></label></fieldset>
        </aside>
        <section class="lux-search-results"><div class="lux-results-toolbar"><div><span>แสดง</span> {{ visibleProviders.length }} โปรไฟล์ <span>ผู้ให้บริการอิสระ</span></div><label>เรียงตาม <select v-model="sortBy"><option>แนะนำ</option><option>คะแนนสูงสุด</option><option>ราคา: ต่ำไปสูง</option></select></label></div>
          <div class="lux-provider-grid lux-results-grid"><article v-for="provider in visibleProviders" :key="provider.id" class="lux-provider-card"><div class="lux-card-image" :class="provider.visual" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)"><span class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span><button class="lux-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)">{{ favorites.includes(provider.id) ? '♥' : '♡' }}</button><span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span></div><div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">PROFILE</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">รายละเอียด <span>↗</span></button></div></div></article>
            <div v-if="!visibleProviders.length" class="lux-empty"><span>✳</span><h3>ยังไม่พบโปรไฟล์ที่ตรงใจ</h3><p>ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p><button class="lux-button lux-button-primary" @click="searchName = ''; selectedProvince = ''; selectedGender = ''; selectedMode = ''; selectedService = ''">ล้างตัวกรอง</button></div>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="view === 'profile' && selectedProvider" class="lux-page lux-profile-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><button @click="navigate('search')">ค้นหาบริการ</button><span>/</span><span>{{ selectedProvider.name }}</span></div>
      <div class="lux-profile-cover" :class="selectedProvider.visual"><div class="lux-profile-cover-copy"><span>MEET THE PROVIDER</span><strong>{{ selectedProvider.category }}</strong></div><span class="lux-cover-index">NUANIA · {{ selectedProvider.province }}</span></div>
      <div class="lux-profile-layout"><section class="lux-profile-main"><div class="lux-profile-identity"><div class="lux-profile-monogram" :class="selectedProvider.visual">{{ selectedProvider.initials }}</div><div class="lux-profile-title"><div class="lux-profile-label"><span class="lux-verified">PROVIDER PROFILE</span><span>✦ {{ selectedProvider.rating }} <small>({{ selectedProvider.reviews }} รีวิวตัวอย่าง)</small></span></div><h1>{{ selectedProvider.name }}<small>, {{ selectedProvider.age }}</small></h1><p>ผู้ให้บริการอิสระ · {{ selectedProvider.area }}, {{ selectedProvider.province }}</p></div><button class="lux-heart lux-profile-heart" :class="{ loved: favorites.includes(selectedProvider.id) }" :aria-label="favorites.includes(selectedProvider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click="toggleFavorite(selectedProvider)">{{ favorites.includes(selectedProvider.id) ? '♥' : '♡' }}</button></div>
          <div class="lux-profile-section"><div class="lux-kicker"><span></span> ABOUT THE PROVIDER</div><h2>คุยรายละเอียดและ<span>ขอบเขตให้ชัดเจน</span></h2><p>{{ selectedProvider.description }} โปรดพูดคุยเรื่องเวลา สถานที่ ราคา และขอบเขตให้ตรงกันก่อนยืนยัน ทุกฝ่ายสามารถปฏิเสธหรือยุติการนัดหมายได้</p><div class="lux-tag-row"><span v-for="tag in selectedProvider.tags" :key="tag">{{ tag }}</span></div></div>
          <div v-if="selectedProvider.media?.length" class="lux-profile-section lux-promo-gallery"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> PROVIDER MOMENTS</div><h2>ภาพและวิดีโอแนะนำโปรไฟล์</h2></div><span>{{ selectedProvider.media.length }} รายการ</span></div><div class="lux-promo-grid"><article v-for="media in selectedProvider.media" :key="media.id" class="lux-promo-item"><img v-if="media.type === 'image'" :src="media.url" :alt="media.name" loading="lazy" /><video v-else :src="media.url" controls preload="metadata" playsinline :aria-label="media.name"></video></article></div></div>
          <div class="lux-profile-section lux-service-section"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> AVAILABLE APPOINTMENTS</div><h2>รูปแบบนัดหมาย</h2></div><span>ราคาเริ่มต้นตามระยะเวลา</span></div><article v-for="(service, index) in services" :key="service.name" class="lux-service-row"><div class="lux-service-number">0{{ index + 1 }}</div><div class="lux-service-name"><strong>{{ service.name }}</strong><span>{{ service.duration }} · ตกลงรายละเอียดก่อนนัดหมาย</span></div><div class="lux-service-price">฿{{ (selectedProvider.price + service.add).toLocaleString() }}</div><button class="lux-outline-button" @click="startBooking(selectedProvider)">เลือก</button></article></div>
          <div class="lux-profile-section lux-venue-section"><div class="lux-kicker"><span></span> MEETING PLACE</div><h2>สถานที่นัดพบ</h2><div class="lux-venue-card"><div class="lux-venue-art"><span>⌖</span><small>MEETING PLACE</small></div><div><strong>{{ selectedProvider.venue }}</strong><span>{{ selectedProvider.area }}, {{ selectedProvider.province }}</span><span class="lux-venue-features">✦ แจ้งสถานที่ให้ชัดเจนก่อนยืนยัน</span></div></div><p v-if="selectedProvider.modes.includes('นอกสถานที่')" class="lux-home-visit">ต้องการนัดตามพื้นที่อื่น? <button @click="profileBookingMode = 'นอกสถานที่'; startBooking(selectedProvider)">เลือกพื้นที่นัดหมาย ↗</button></p></div>
          <div class="lux-profile-section lux-review-section"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> COMMUNITY NOTES</div><h2>ประสบการณ์จากผู้ใช้บริการ</h2></div><span>✦ {{ selectedProvider.rating }} / 5.00</span></div><blockquote>“สื่อสารรายละเอียดชัดเจน ตรงต่อเวลา และเคารพข้อตกลงที่คุยกันไว้”<footer>รีวิวตัวอย่างจากผู้ใช้บริการ <span>·</span> ข้อมูลจำลอง</footer></blockquote></div>
        </section>
        <aside class="lux-booking-card"><div class="lux-booking-card-top"><span>PRIVATE SESSION</span><strong>เริ่มต้น ฿{{ selectedProvider.price.toLocaleString() }}<small> / ชั่วโมง</small></strong></div><div class="lux-booking-select"><label>เลือกรูปแบบการรับบริการ</label><button :class="{ active: profileBookingMode === 'ที่ร้าน' }" @click="profileBookingMode = 'ที่ร้าน'"><span class="lux-radio"></span><span><strong>ที่ร้าน</strong><small>{{ selectedProvider.venue }}</small></span></button><button v-if="selectedProvider.modes.includes('นอกสถานที่')" :class="{ active: profileBookingMode === 'นอกสถานที่' }" @click="profileBookingMode = 'นอกสถานที่'"><span class="lux-radio"></span><span><strong>นอกสถานที่</strong><small>ให้เรามาหาคุณ · ค่าบริการเดินทาง ฿250</small></span></button></div><div class="lux-booking-reassurance"><span>✓</span> ยังไม่เรียกเก็บเงินจนกว่าจะยืนยัน</div><button class="lux-button lux-button-primary lux-full-button" @click="startBooking(selectedProvider)">เลือกวันและเวลานัดหมาย <span>→</span></button><p class="lux-booking-privacy">การนัดหมายและข้อมูลส่วนตัวของคุณ<br />จะถูกเก็บเป็นความลับ</p></aside></div>
    </main>

    <main v-else-if="view === 'booking' && selectedProvider" class="lux-page lux-booking-page">
      <div class="lux-breadcrumb"><button @click="navigate('search')">ค้นหาบริการ</button><span>/</span><button @click="navigate('profile')">{{ selectedProvider.name }}</button><span>/</span><span>นัดหมาย</span></div>
      <div class="lux-booking-heading"><div class="lux-kicker"><span></span> YOUR TIME, YOUR TERMS</div><h1>ยืนยัน<span>การนัดหมาย</span></h1><p>ตรวจสอบรูปแบบ เวลา สถานที่ และข้อตกลงก่อนส่งคำขอ</p></div>
      <div class="lux-booking-layout"><form class="lux-booking-form" @submit.prevent="submitBooking">
        <section class="lux-form-section"><div class="lux-step-heading"><span>01</span><div><h2>เลือกรูปแบบนัดพบ</h2><p>เลือกสถานที่ที่ทั้งสองฝ่ายสะดวกและปลอดภัย</p></div></div><div class="lux-mode-options"><button type="button" :class="{ active: booking.mode === 'ที่ร้าน' }" @click="booking.mode = 'ที่ร้าน'"><span class="lux-mode-icon">⌂</span><strong>สถานที่นัดพบ</strong><small>ใช้สถานที่ตามที่ระบุในโปรไฟล์</small><i>◉</i></button><button type="button" :class="{ active: booking.mode === 'นอกสถานที่' }" @click="booking.mode = 'นอกสถานที่'"><span class="lux-mode-icon">⌖</span><strong>พื้นที่อื่นที่ตกลงกัน</strong><small>พูดคุยและยืนยันสถานที่ก่อนนัด</small><i>◉</i></button></div>
          <div v-if="booking.mode === 'ที่ร้าน'" class="lux-selected-venue"><span>⌖</span><div><small>สถานที่นัดพบตามโปรไฟล์</small><strong>{{ selectedProvider.venue }}</strong><small>{{ selectedProvider.area }}, {{ selectedProvider.province }}</small></div><button type="button" @click="navigate('profile')">ดูโปรไฟล์ ↗</button></div>
          <label v-else class="lux-form-label">พื้นที่/สถานที่ที่ต้องการ<textarea v-model.trim="booking.address" rows="2" placeholder="ระบุพื้นที่นัดพบที่ตกลงกัน" required></textarea><small>อย่าใส่ข้อมูลส่วนตัวที่ไม่จำเป็น · ตกลงสถานที่โดยตรงก่อนยืนยัน</small></label>
        </section>
        <section class="lux-form-section"><div class="lux-step-heading"><span>02</span><div><h2>เลือกรูปแบบและเวลา</h2><p>เลือกบริการและเวลาที่ได้ตกลงกันไว้</p></div></div><label class="lux-form-label">รูปแบบบริการ<select v-model="booking.service" required><option v-for="service in services" :key="service.name" :value="service.name">{{ service.name }} · {{ service.duration }} · ฿{{ (selectedProvider.price + service.add).toLocaleString() }}</option></select></label><div class="lux-form-grid"><label class="lux-form-label">วันที่นัด<input v-model="booking.date" type="date" :min="new Date().toISOString().slice(0, 10)" required /></label><label class="lux-form-label">เวลานัด<select v-model="booking.time" required><option value="" disabled>เลือกช่วงเวลา</option><option>10:00</option><option>12:00</option><option>14:00</option><option>16:00</option><option>18:00</option><option>20:00</option></select></label></div><label class="lux-form-label">รายละเอียดหรือข้อตกลงเพิ่มเติม <span class="lux-optional">(ไม่บังคับ)</span><textarea v-model.trim="booking.note" rows="2" maxlength="240" placeholder="รายละเอียดที่ทั้งสองฝ่ายตกลงร่วมกัน"></textarea></label></section>
        <section class="lux-form-section"><div class="lux-step-heading"><span>03</span><div><h2>ข้อมูลผู้ใช้บริการ</h2><p>ใช้สำหรับยืนยันการนัดหมายเท่านั้น</p></div></div><div class="lux-form-grid"><label class="lux-form-label">ชื่อที่ใช้ติดต่อ<input v-model.trim="booking.guestName" type="text" autocomplete="name" placeholder="ชื่อที่ต้องการให้เรียก" required /></label><label class="lux-form-label">เบอร์โทรศัพท์<input v-model.trim="booking.phone" type="tel" inputmode="numeric" pattern="[0-9]{9,10}" maxlength="10" autocomplete="tel" placeholder="08XXXXXXXX" required /></label></div><label class="lux-consent"><input type="checkbox" required /><span>ข้าพเจ้ามีอายุ 18 ปีขึ้นไป และยืนยันว่าการนัดหมายเป็นไปโดยสมัครใจ ตกลงขอบเขตกันชัดเจน</span></label></section>
        <button class="lux-button lux-button-primary lux-confirm-button" type="submit">ส่งคำขอนัดหมาย <span>→</span></button><p class="lux-secure-note">ต้นแบบจำลอง · ไม่มีการตัดเงินหรือชำระเงินจริง</p>
      </form><aside class="lux-summary-card"><div class="lux-summary-header"><span>YOUR SELECTION</span><button @click="navigate('profile')">แก้ไข</button></div><div class="lux-summary-provider"><div class="lux-summary-avatar" :class="selectedProvider.visual">{{ selectedProvider.initials }}</div><div><strong>{{ selectedProvider.name }}</strong><span>✦ {{ selectedProvider.rating }} · {{ selectedProvider.province }}</span></div></div><div class="lux-summary-detail"><span>บริการ</span><strong>{{ booking.service || services[0].name }} · {{ selectedServiceOption.duration }}</strong></div><div class="lux-summary-detail"><span>รูปแบบ</span><strong>{{ booking.mode }}{{ booking.mode === 'นอกสถานที่' ? ' · ' + (booking.address || 'ระบุที่อยู่') : '' }}</strong></div><div class="lux-summary-detail"><span>วันและเวลา</span><strong>{{ formatDate(booking.date) }}{{ booking.time ? ' · ' + booking.time : '' }}</strong></div><div class="lux-summary-price"><span>ราคาบริการ <small>รวมค่าเดินทาง (ถ้ามี)</small></span><strong>฿{{ bookingPrice.toLocaleString() }}</strong></div><div class="lux-summary-foot">ชำระหลังจากผู้ให้บริการยืนยัน<br /><span>ไม่มีการเรียกเก็บเงินในขั้นตอนนี้</span></div></aside></div>
    </main>

    <main v-else-if="view === 'login'" class="lux-page lux-login-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>เข้าสู่ระบบ</span></div>
      <section class="lux-login-card">
        <div class="lux-kicker"><span></span> WELCOME TO NUANIA</div>
        <h1>เข้าสู่<span>ระบบ</span></h1>
        <p>เลือกประเภทสมาชิกเพื่อเข้าสู่ระบบ</p>
        <div class="lux-login-roles" role="group" aria-label="ประเภทสมาชิก">
          <button type="button" :class="{ active: loginRole === 'buyer' }" @click="loginRole = 'buyer'">ผู้ซื้อบริการ</button>
          <button type="button" :class="{ active: loginRole === 'seller' }" @click="loginRole = 'seller'">ผู้ขายบริการ</button>
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
          <label class="lux-role-option" :class="{ active: membership.role === 'buyer' }"><input v-model="membership.role" type="radio" value="buyer" /><span class="lux-role-icon">⌕</span><span class="lux-role-copy"><strong>ผู้ซื้อบริการ</strong><small>ค้นหาโปรไฟล์ เลือกบริการ นัดหมาย และจัดการรายการโปรด</small></span><span class="lux-role-check">✓</span></label>
          <label class="lux-role-option" :class="{ active: membership.role === 'seller' }"><input v-model="membership.role" type="radio" value="seller" /><span class="lux-role-icon">✳</span><span class="lux-role-copy"><strong>ผู้ขายบริการ</strong><small>สร้างโปรไฟล์ กำหนดราคาและขอบเขต พร้อมจัดการคำขอนัดหมาย</small></span><span class="lux-role-check">✓</span></label>
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
        <template v-else><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> YOUR SAVED PROVIDERS</div><h2>โปรไฟล์ที่บันทึกไว้</h2></div><button class="lux-text-link" @click="navigate('search')">ค้นหาเพิ่มเติม <span>↗</span></button></div><div v-if="favoriteProviders.length" class="lux-provider-grid lux-favorite-grid"><article v-for="provider in favoriteProviders" :key="provider.id" class="lux-provider-card"><div class="lux-card-image" :class="provider.visual" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)"><span class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span><button class="lux-heart loved" aria-label="นำออกจากรายการโปรด" @click.stop="toggleFavorite(provider)">♥</button><span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span></div><div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">✓ PROFILE</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">ดูโปรไฟล์ <span>↗</span></button></div></div></article></div><div v-else class="lux-empty"><span>♡</span><h3>ยังไม่มีโปรไฟล์ที่บันทึก</h3><p>บันทึกผู้ให้บริการที่สนใจ เพื่อกลับมาดูรายละเอียดได้ทุกเมื่อ</p><button class="lux-button lux-button-primary" @click="navigate('search')">ค้นหาผู้ให้บริการ</button></div></template>
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

    <main v-else-if="view === 'admin'" class="lux-page lux-admin-page"><div class="lux-admin-top"><div><div class="lux-kicker"><span></span> NUANIA ADMINISTRATION</div><h1>ภาพรวม<span>แพลตฟอร์ม</span></h1><p>จัดการพาร์ตเนอร์ การนัดหมาย และดูแลประสบการณ์ของสมาชิก</p></div><span class="lux-demo-status">● DEMO ENVIRONMENT · ข้อมูลตัวอย่าง</span></div><div class="lux-admin-tabs"><button v-for="tab in [{id:'overview', label:'ภาพรวม'}, {id:'providers', label:'พาร์ตเนอร์'}, {id:'bookings', label:'การนัดหมาย'}, {id:'applications', label:'ใบสมัคร'}]" :key="tab.id" :class="{ active: adminTab === tab.id }" @click="adminTab = tab.id">{{ tab.label }} <small v-if="tab.id === 'applications' && applications.length">{{ applications.length }}</small></button></div>
      <template v-if="adminTab === 'overview'"><div class="lux-admin-metrics"><article><span>พาร์ตเนอร์ที่เผยแพร่</span><strong>{{ activeProviderCount }}</strong><small>↑ 8.4% <i>เทียบกับเดือนก่อน</i></small></article><article><span>นัดหมายเดือนนี้</span><strong>{{ bookings.length + 126 }}</strong><small>● <i>อัปเดตจากข้อมูลตัวอย่าง</i></small></article><article><span>รายได้ค่าสมาชิก</span><strong>฿{{ (activeProviderCount * 299).toLocaleString() }}</strong><small>สมมติสมาชิก {{ activeProviderCount }} ราย</small></article><article><span>กำลังรอตรวจสอบ</span><strong>{{ applications.length }}</strong><small><i>ใบสมัครพาร์ตเนอร์ใหม่</i></small></article></div><div class="lux-admin-overview-grid"><section class="lux-admin-panel"><div class="lux-admin-panel-head"><div><h2>การนัดหมายล่าสุด</h2><p>ภาพรวมการจองจากผู้ใช้บริการ</p></div><button @click="adminTab = 'bookings'">ดูทั้งหมด ↗</button></div><div class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัส / ผู้รับบริการ</th><th>ผู้ให้บริการ</th><th>วันและเวลา</th><th>รูปแบบ</th><th>ยอด</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in bookings.slice(0, 5)" :key="item.id"><td><strong>{{ item.id }}</strong><small>คุณ{{ item === bookings[0] ? 'กานต์' : 'ลูกค้า' }}</small></td><td>{{ item.provider }}</td><td>{{ formatDate(item.date) }} · {{ item.time }}</td><td>{{ item.mode }}</td><td>฿{{ item.amount.toLocaleString() }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div></section><aside class="lux-admin-panel lux-admin-side-panel"><div class="lux-admin-panel-head"><div><h2>รอตรวจสอบ</h2><p>ใบสมัครพาร์ตเนอร์</p></div><span>{{ applications.length }}</span></div><div v-if="applications.length" class="lux-pending-list"><div v-for="item in applications.slice(0, 4)" :key="item.id"><span class="lux-pending-avatar">{{ item.name.slice(0, 1) }}</span><div><strong>{{ item.name }}</strong><small>{{ item.province }} · {{ item.line }}</small></div><button @click="approveApplication(item)">อนุมัติ</button></div></div><div v-else class="lux-admin-no-pending"><span>✓</span><strong>ไม่มีรายการค้าง</strong><small>ใบสมัครใหม่จะแสดงที่นี่</small></div></aside></div></template>
      <section v-else class="lux-admin-panel lux-admin-detail-panel"><div class="lux-admin-panel-head"><div><h2>{{ adminTab === 'providers' ? 'พาร์ตเนอร์ทั้งหมด' : adminTab === 'bookings' ? 'รายการนัดหมาย' : 'ใบสมัครพาร์ตเนอร์' }}</h2><p>การจัดการภายใน · การเปลี่ยนแปลงเป็นข้อมูลตัวอย่างในเบราว์เซอร์</p></div><span>{{ adminTab === 'providers' ? providers.length : adminTab === 'bookings' ? bookings.length : applications.length }} รายการ</span></div><div v-if="adminTab === 'providers'" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>พาร์ตเนอร์</th><th>พื้นที่ให้บริการ</th><th>รูปแบบ</th><th>สมาชิก</th><th>โปรไฟล์</th></tr></thead><tbody><tr v-for="provider in providers" :key="provider.id"><td><strong>{{ provider.name }} · {{ provider.category }}</strong><small>LINE {{ provider.line }}</small></td><td>{{ provider.area }}, {{ provider.province }}</td><td>{{ provider.modes.join(' / ') }}</td><td><button class="lux-admin-action" @click="setProviderStatus(provider, 'membershipActive')">{{ provider.membershipActive ? 'สมาชิกใช้งาน' : 'หมดอายุ' }}</button></td><td><button class="lux-admin-action" @click="setProviderStatus(provider, 'active')">{{ provider.active ? 'เผยแพร่' : 'ซ่อน' }}</button></td></tr></tbody></table></div><div v-else-if="adminTab === 'bookings'" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัสการจอง</th><th>ผู้ให้บริการ</th><th>บริการ</th><th>วัน / เวลา</th><th>รูปแบบ</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in bookings" :key="item.id"><td><strong>{{ item.id }}</strong></td><td>{{ item.provider }}</td><td>{{ item.service }}</td><td>{{ formatDate(item.date) }} · {{ item.time }}</td><td>{{ item.mode }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div><div v-else-if="applications.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>ผู้สมัคร</th><th>จังหวัด</th><th>อัตลักษณ์</th><th>บริการ</th><th>LINE ID</th><th>จัดการ</th></tr></thead><tbody><tr v-for="item in applications" :key="item.id"><td><strong>{{ item.name }}</strong></td><td>{{ item.province }}</td><td>{{ item.gender }}</td><td>{{ item.service }}</td><td>{{ item.line }}</td><td><button class="lux-admin-action" @click="approveApplication(item)">อนุมัติ</button><button class="lux-admin-action reject" @click="rejectApplication(item)">ปฏิเสธ</button></td></tr></tbody></table></div><div v-else class="lux-admin-no-pending"><span>✓</span><strong>ไม่มีใบสมัครค้างตรวจสอบ</strong></div></section>
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
        <div class="lux-seller-metrics"><article><span>คำขอนัดหมายใหม่</span><strong>{{ sellerBookings.filter(item => item.status === 'รอยืนยัน').length }}</strong></article><article><span>นัดหมายที่ยืนยัน</span><strong>{{ sellerBookings.filter(item => item.status === 'ยืนยันแล้ว').length }}</strong></article><article><span>บริการที่ลงไว้</span><strong>1</strong></article><article><span>ราคาเริ่มต้น</span><strong>฿{{ sellerProvider.price.toLocaleString() }}</strong></article></div>
        <section class="lux-seller-panel"><div class="lux-seller-panel-head"><div><h2>นัดหมายล่าสุด</h2><p>จัดการคำขอจากผู้ใช้บริการ</p></div><button @click="sellerDashboardTab = 'bookings'">ดูนัดหมายทั้งหมด ↗</button></div><div v-if="sellerBookings.length" class="lux-appointment-list"><article v-for="item in sellerBookings.slice(0, 3)" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ formatDate(item.date) }} · {{ item.time }} · {{ item.mode }}</p></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button @click="sellerDashboardTab = 'bookings'">จัดการ ↗</button></div></article></div><div v-else class="lux-empty"><span>▦</span><h3>ยังไม่มีคำขอนัดหมาย</h3><p>เมื่อผู้ใช้จองบริการ รายการจะปรากฏในหน้านี้</p></div></section>
      </section>
      <form v-else-if="sellerDashboardTab === 'profile'" class="lux-seller-panel lux-seller-profile" @submit.prevent="saveSellerProfile"><div class="lux-seller-panel-head"><div><h2>โปรไฟล์และบริการ</h2><p>ข้อมูลนี้จะแสดงในหน้าค้นหาหลังผ่านการตรวจสอบ</p></div></div><div class="lux-membership-fields"><label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="sellerProvider.name" maxlength="40" required /></label><label class="lux-form-label">จังหวัด<select v-model="sellerProvider.province" required><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="sellerProvider.price" type="number" min="1" step="50" required /></label><label class="lux-form-label">สถานที่ให้บริการ<input v-model.trim="sellerProvider.venue" maxlength="100" required /></label><label class="lux-form-label lux-membership-wide">รายละเอียดบริการ<textarea v-model.trim="sellerProvider.description" rows="4" maxlength="300" required></textarea></label><fieldset class="lux-seller-modes"><legend>รูปแบบการให้บริการ</legend><label><input v-model="sellerProvider.modes" type="checkbox" value="ที่ร้าน" :disabled="sellerProvider.modes.length === 1 && sellerProvider.modes.includes('ที่ร้าน')" /> ที่ร้าน</label><label><input v-model="sellerProvider.modes" type="checkbox" value="นอกสถานที่" :disabled="sellerProvider.modes.length === 1 && sellerProvider.modes.includes('นอกสถานที่')" /> นอกสถานที่</label></fieldset></div><section class="lux-seller-media-manager" aria-labelledby="seller-media-heading"><div class="lux-seller-panel-head"><div><h2 id="seller-media-heading">สื่อโปรโมตบริการ</h2><p>เพิ่มรูปภาพหรือวิดีโอได้หลายไฟล์ เพื่อแสดงในหน้าโปรไฟล์ของคุณ</p></div><span class="lux-seller-media-count">{{ sellerProvider.media?.length || 0 }} ไฟล์</span></div><label class="lux-seller-upload"><input type="file" accept="image/*,video/*" multiple @change="addSellerMedia" /><span aria-hidden="true">＋</span><strong>เลือกรูปภาพหรือวิดีโอ</strong><small>เลือกหลายไฟล์พร้อมกันได้</small></label><div v-if="sellerProvider.media?.length" class="lux-seller-media-grid"><article v-for="media in sellerProvider.media" :key="media.id" class="lux-seller-media-item"><img v-if="media.type === 'image'" :src="media.url" :alt="media.name" /><video v-else :src="media.url" controls preload="metadata" playsinline :aria-label="media.name"></video><div><span :title="media.name">{{ media.name }}</span><button type="button" :aria-label="`ลบไฟล์ ${media.name}`" @click="removeSellerMedia(media.id)">ลบ</button></div></article></div><p class="lux-seller-media-note">สื่อที่เพิ่มจะปรากฏบนโปรไฟล์สาธารณะในเซสชันนี้ · ต้นแบบนี้ยังไม่ได้อัปโหลดไปเก็บบนเซิร์ฟเวอร์</p></section><button class="lux-button lux-button-primary" type="submit">บันทึกข้อมูลบริการ ↗</button></form>
      <section v-else class="lux-seller-panel"><div class="lux-seller-panel-head"><div><h2>คำขอนัดหมาย</h2><p>ยืนยันหรืออัปเดตสถานะการให้บริการ</p></div></div><div v-if="sellerBookings.length" class="lux-appointment-list"><article v-for="item in sellerBookings" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ formatDate(item.date) }} · {{ item.time }} · {{ item.mode }}</p><span class="lux-appointment-place">{{ item.venue }}</span></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button v-if="item.status === 'รอยืนยัน'" @click="updateSellerBooking(item, 'ยืนยันแล้ว')">ยืนยันนัดหมาย</button><button v-else-if="item.status === 'ยืนยันแล้ว'" @click="updateSellerBooking(item, 'เสร็จสิ้น')">เสร็จสิ้น</button></div></article></div><div v-else class="lux-empty"><span>▦</span><h3>ยังไม่มีคำขอนัดหมาย</h3><p>รายการจองใหม่จะแสดงที่นี่</p></div></section>
      <p class="lux-membership-demo">ต้นแบบหน้าจัดการผู้ขาย · สิทธิ์และข้อมูลยังจัดเก็บในเบราว์เซอร์ ไม่ใช่ระบบบัญชีจริง</p>
    </main>
    <div v-if="notice" class="lux-toast" role="status"><span>✓</span>{{ notice }}</div>
  </div>
</template>
