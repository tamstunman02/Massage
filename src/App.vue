<script setup>
import { computed, ref } from 'vue'

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

const providers = ref([
  {
    id: 1, name: 'มะลิ', age: 28, province: 'กรุงเทพมหานคร', area: 'สุขุมวิท · วัฒนา',
    gender: 'ผู้หญิง', line: 'mali.relax', price: 1200, rating: '4.98', reviews: 128,
    initials: 'ม', visual: 'visual-sand', category: 'Aroma ritual',
    description: 'ผู้เชี่ยวชาญด้านอโรมาเธอราพีและการนวดผ่อนคลาย ออกแบบทุกสัมผัสให้พอดีกับความต้องการของคุณ',
    tags: ['Aroma oil', 'นวดไทย', 'ยืนยันใบรับรอง'], venue: 'NuaNia Wellness, สุขุมวิท 39',
    modes: ['ที่ร้าน', 'นอกสถานที่'], active: true, membershipActive: true,
  },
  {
    id: 2, name: 'นนท์', age: 31, province: 'เชียงใหม่', area: 'นิมมาน · เมืองเชียงใหม่',
    gender: 'ผู้ชาย', line: 'nonthetherapist', price: 1000, rating: '5.00', reviews: 96,
    initials: 'น', visual: 'visual-olive', category: 'Thai therapy',
    description: 'นักบำบัดผู้เชี่ยวชาญนวดไทยและสปอร์ตรีคัฟเวอรี ประสบการณ์กว่า 6 ปี ใส่ใจการดูแลเฉพาะบุคคล',
    tags: ['นวดไทย', 'Sport recovery', 'ยืนยันใบรับรอง'], venue: 'บ้านนวด นิมมาน',
    modes: ['ที่ร้าน', 'นอกสถานที่'], active: true, membershipActive: true,
  },
  {
    id: 3, name: 'เรน', age: 26, province: 'ภูเก็ต', area: 'ป่าตอง · กะทู้',
    gender: 'LGBTQ+', line: 'rain.sabai', price: 1400, rating: '4.96', reviews: 74,
    initials: 'ร', visual: 'visual-lilac', category: 'Island escape',
    description: 'นวดอโรมาและนวดเท้าอย่างอ่อนโยน พร้อมต้อนรับทุกคนในพื้นที่อบอุ่นและปลอดภัย',
    tags: ['Aroma oil', 'Foot ritual', 'Inclusive space'], venue: 'Sabai House, ป่าตอง',
    modes: ['ที่ร้าน', 'นอกสถานที่'], active: true, membershipActive: true,
  },
  {
    id: 4, name: 'แพรว', age: 30, province: 'ชลบุรี', area: 'บางแสน · เมืองชลบุรี',
    gender: 'ผู้หญิง', line: 'praew.massage', price: 950, rating: '4.95', reviews: 52,
    initials: 'พ', visual: 'visual-clay', category: 'Herbal warmth',
    description: 'นวดผ่อนคลายและประคบสมุนไพร คัดสรรสมุนไพรธรรมชาติและดูแลทุกขั้นตอนอย่างสุภาพ',
    tags: ['Herbal compress', 'นวดไทย', 'ยืนยันใบรับรอง'], venue: 'Praew Wellness, บางแสน',
    modes: ['ที่ร้าน', 'นอกสถานที่'], active: true, membershipActive: true,
  },
  {
    id: 5, name: 'คิม', age: 29, province: 'กรุงเทพมหานคร', area: 'อารีย์ · พญาไท',
    gender: 'LGBTQ+', line: 'kim.kindtouch', price: 1250, rating: '4.97', reviews: 83,
    initials: 'ค', visual: 'visual-moss', category: 'Restore & release',
    description: 'นักบำบัดออฟฟิศซินโดรมและนวดน้ำมัน ออกแบบทรีตเมนต์ให้เหมาะกับร่างกายของแต่ละคน',
    tags: ['Office syndrome', 'นวดน้ำมัน', 'Inclusive space'], venue: 'Kindred Studio, อารีย์',
    modes: ['ที่ร้าน', 'นอกสถานที่'], active: true, membershipActive: true,
  },
  {
    id: 6, name: 'ฟ้า', age: 27, province: 'ขอนแก่น', area: 'ในเมือง · ขอนแก่น',
    gender: 'ผู้หญิง', line: 'fah.wellness', price: 850, rating: '4.91', reviews: 41,
    initials: 'ฟ', visual: 'visual-honey', category: 'Quiet moments',
    description: 'นวดแผนไทยและนวดเท้าในบรรยากาศสงบ เป็นกันเอง และใส่ใจสุขอนามัยเป็นอันดับแรก',
    tags: ['นวดไทย', 'Foot ritual', 'ยืนยันใบรับรอง'], venue: 'Fah Wellness, ในเมือง',
    modes: ['ที่ร้าน'], active: true, membershipActive: true,
  },
])

const view = ref('home')
const searchName = ref('')
const selectedProvince = ref('')
const selectedGender = ref('')
const selectedMode = ref('')
const selectedService = ref('')
const sortBy = ref('แนะนำ')
const selectedProvider = ref(providers.value[0])
const profileBookingMode = ref('ที่ร้าน')
const booking = ref({ mode: 'ที่ร้าน', service: '', date: '', time: '', guestName: '', phone: '', address: '', note: '' })
const bookings = ref([
  {
    id: 'ND-260918', providerId: 2, provider: 'นนท์', service: 'นวดไทย · 90 นาที',
    date: '2026-10-22', time: '15:00', mode: 'ที่ร้าน', venue: 'บ้านนวด นิมมาน',
    amount: 1500, status: 'ยืนยันแล้ว',
  },
  {
    id: 'ND-260774', providerId: 1, provider: 'มะลิ', service: 'Aroma oil · 60 นาที',
    date: '2026-10-11', time: '19:00', mode: 'นอกสถานที่', venue: 'สุขุมวิท 24',
    amount: 1500, status: 'เสร็จสิ้น',
  },
])
const applications = ref([])
const application = ref({ name: '', line: '', province: '', gender: '', service: '', consent: false })
const favorites = ref([3])
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

const services = [
  { name: 'Aroma oil', duration: '60 นาที', add: 0 },
  { name: 'นวดไทย', duration: '90 นาที', add: 300 },
  { name: 'Herbal compress', duration: '90 นาที', add: 500 },
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

function navigate(nextView) {
  if (nextView === 'apply') {
    membership.value.role = 'seller'
    nextView = 'membership'
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

function submitBooking() {
  const reference = `ND-${Date.now().toString().slice(-6)}`
  bookingReference.value = reference
  bookings.value.unshift({
    id: reference,
    providerId: selectedProvider.value.id,
    provider: selectedProvider.value.name,
    service: `${booking.value.service} · ${selectedServiceOption.value.duration}`,
    date: booking.value.date,
    time: booking.value.time,
    mode: booking.value.mode,
    venue: booking.value.mode === 'ที่ร้าน' ? selectedProvider.value.venue : booking.value.address,
    amount: bookingPrice.value,
    status: 'รอยืนยัน',
  })
  navigate('account')
  showNotice(`ส่งคำขอนัดหมาย ${reference} แล้ว`)
}

function toggleFavorite(provider) {
  favorites.value = favorites.value.includes(provider.id)
    ? favorites.value.filter((id) => id !== provider.id)
    : [...favorites.value, provider.id]
}

function submitApplication() {
  applications.value.push({ ...application.value, id: Date.now(), status: 'รอตรวจสอบ' })
  application.value = { name: '', line: '', province: '', gender: '', service: '', consent: false }
  showNotice('ส่งใบสมัครแล้ว ทีมงานจะตรวจสอบข้อมูลก่อนเผยแพร่')
}

function submitMembership() {
  member.value = {
    role: membership.value.role,
    name: membership.value.name.trim(),
    email: membership.value.email.trim(),
    phone: membership.value.phone.trim(),
  }
  activeRole.value = membership.value.role
  membership.value.password = ''

  if (membership.value.role === 'seller') {
    const providerId = Date.now()
    const provider = {
      id: providerId,
      name: membership.value.name.trim(),
      age: null,
      province: membership.value.province,
      area: membership.value.province,
      gender: 'ไม่ประสงค์ระบุ',
      line: membership.value.phone.trim(),
      price: Number(membership.value.price),
      rating: 'ใหม่',
      reviews: 0,
      initials: membership.value.name.trim().slice(0, 1),
      visual: 'visual-moss',
      category: 'Wellness practitioner',
      description: membership.value.service.trim(),
      tags: ['ผู้ให้บริการใหม่'],
      venue: membership.value.businessName.trim() || `สถานที่ตามที่ผู้ให้บริการระบุ · ${membership.value.province}`,
      modes: ['ที่ร้าน'],
      active: false,
      membershipActive: true,
    }
    providers.value.push(provider)
    memberSellerProviderId.value = providerId
    applications.value.push({
      id: providerId,
      providerId,
      name: provider.name,
      line: provider.line,
      province: provider.province,
      gender: provider.gender,
      service: provider.description,
      consent: true,
      status: 'รอตรวจสอบ',
    })
    sellerDashboardTab.value = 'overview'
    navigate('seller')
    showNotice('สมัครสมาชิกผู้ให้บริการแล้ว โปรไฟล์จะเผยแพร่หลังผ่านการตรวจสอบ')
    return
  }

  navigate('account')
  showNotice('สมัครสมาชิกผู้ใช้บริการเรียบร้อยแล้ว')
}

function updateSellerBooking(item, status) {
  item.status = status
  showNotice(`อัปเดตสถานะนัดหมาย ${item.id} แล้ว`)
}

function approveApplication(item) {
  const existingProvider = providers.value.find((provider) => provider.id === item.providerId)
  if (existingProvider) {
    existingProvider.active = true
  } else {
    providers.value.push({
    id: Date.now(), name: item.name, age: 0, province: item.province, area: item.province,
    gender: item.gender, line: item.line, price: 1000, rating: 'ใหม่', reviews: 0,
    initials: item.name.slice(0, 1), visual: 'visual-moss', category: 'New practitioner',
    description: item.service || 'ผู้ให้บริการนวดเพื่อสุขภาพ',
    tags: ['ผู้ให้บริการใหม่', 'ยืนยันใบรับรอง'], venue: 'สถานที่ตามที่ผู้ให้บริการระบุ',
    modes: ['ที่ร้าน', 'นอกสถานที่'], active: true, membershipActive: true,
    })
  }
  applications.value = applications.value.filter((entry) => entry.id !== item.id)
  showNotice('อนุมัติใบสมัครและเผยแพร่โปรไฟล์แล้ว')
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
  <div class="lux-app" :class="{ 'seller-dashboard': view === 'seller' }">
    <div class="lux-topline">
      <span>นวดเพื่อสุขภาพสำหรับผู้ใหญ่ 18+ · ทุกสัมผัส เริ่มต้นจากการเลือกของคุณ</span>
      <span class="lux-topline-right"><i></i> แพลตฟอร์มที่ใส่ใจความเป็นส่วนตัว <span class="lux-topline-sep">·</span> TH / EN</span>
    </div>

    <header class="lux-header">
      <button class="lux-mobile-menu" type="button" aria-label="เปิดเมนู" @click="isCompactMenuOpen = !isCompactMenuOpen">☰</button>
      <a class="lux-logo" href="#" @click.prevent="navigate('home')">
        <span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>WELLNESS, YOUR WAY</small></span>
      </a>
      <nav class="lux-nav" :class="{ 'lux-nav-open': isCompactMenuOpen }" aria-label="เมนูหลัก">
        <button :class="{ selected: view === 'home' }" @click="navigate('home')">หน้าแรก</button>
        <button :class="{ selected: view === 'search' }" @click="navigate('search')">ค้นหาบริการ</button>
        <button :class="{ selected: view === 'account' }" @click="navigate('account')">การจองของฉัน</button>
      </nav>
      <div class="lux-header-actions">
        <button class="lux-login-shortcut" @click="navigate('login')">เข้าสู่ระบบ</button>
        <button class="lux-membership-shortcut" @click="member?.role === 'seller' ? openSellerArea() : member ? openBuyerArea() : navigate('membership')">{{ member ? 'จัดการสมาชิก' : 'สมัครสมาชิก' }}</button>
        <button class="lux-icon-button" aria-label="รายการโปรด" title="รายการโปรด" @click="navigate('account')">♡</button>
        <button class="lux-account-button" @click="navigate('account')"><span class="lux-user-avatar">ก</span><span>บัญชีของฉัน</span><span class="lux-chevron">⌄</span></button>
        <button class="lux-admin-shortcut" @click="navigate('admin')">สำหรับผู้ดูแล</button>
      </div>
    </header>

    <main v-if="view === 'home'">
      <section class="lux-hero">
        <div class="lux-hero-copy">
          <div class="lux-kicker"><span></span> WELLNESS, WITHIN REACH</div>
          <h1>คืนพื้นที่<br />ให้<span>ความรู้สึกดี</span></h1>
          <p>แพลตฟอร์มจองนวดเพื่อสุขภาพสำหรับผู้ใหญ่ 18+ ค้นหาร้านนวดและนักบำบัดที่ผ่านการตรวจสอบ<br class="lux-desktop-only" />เลือกนวดไทย นวดอโรม่า หรือนวดน้ำมัน นัดหมายที่ร้านหรือนอกสถานที่ได้ตามต้องการ</p>
          <button class="lux-button lux-button-primary lux-hero-cta" @click="scrollToProviders">ค้นหาช่วงเวลาของคุณ <span>↗</span></button>
          <div class="lux-hero-proof"><div class="lux-proof-seal">✳</div><div><strong>ผู้ให้บริการที่ผ่านการตรวจสอบ</strong><span>ดูแลด้วยความใส่ใจ ในพื้นที่ที่ปลอดภัย</span></div></div>
        </div>
        <div class="lux-hero-visual" aria-label="ภาพบรรยากาศพื้นที่พักผ่อน">
          <div class="lux-visual-arch"><div class="lux-arch-window"></div><div class="lux-plant plant-left"></div><div class="lux-plant plant-right"></div><div class="lux-visual-table"></div></div>
          <div class="lux-floating-card"><span class="lux-floating-icon">✦</span><div><small>YOUR MOMENT</small><strong>พักให้เต็มที่</strong></div></div>
          <div class="lux-visual-index">01 <span></span> A MOMENT FOR YOU</div>
        </div>
        <div class="lux-hero-vertical">NUANIA WELLNESS · THAILAND</div>
      </section>

      <section class="lux-discovery">
        <div class="lux-section-intro">
          <div><div class="lux-kicker"><span></span> FIND YOUR RITUAL</div><h2>เลือกการดูแล<br class="lux-mobile-only" />ที่<span>ใช่สำหรับคุณ</span></h2></div>
          <p>นัดหมายที่ร้าน หรือเลือกให้เรามาหาคุณ<br />ประสบการณ์ที่ลงตัว เริ่มได้ในไม่กี่ขั้นตอน</p>
        </div>
        <div class="lux-quick-search">
          <label><span>⌕</span><div><small>ค้นหาบริการหรือสถานที่</small><input v-model="searchName" placeholder="เช่น นวดอโรม่า, สุขุมวิท" @focus="view = 'home'" /></div></label>
          <label><span>⌖</span><div><small>เลือกจังหวัด</small><select v-model="selectedProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></div></label>
          <label><span>◷</span><div><small>รูปแบบการรับบริการ</small><select v-model="selectedMode"><option value="">ทุกรูปแบบ</option><option>ที่ร้าน</option><option>นอกสถานที่</option></select></div></label>
          <button class="lux-button lux-button-olive" @click="scrollToProviders">ค้นหา <span>→</span></button>
        </div>
        <div class="lux-category-row"><span>สำรวจตามบรรยากาศ</span><button @click="selectedService = ''; navigate('search')">ทั้งหมด</button><button @click="selectedService = 'Aroma'; navigate('search')">Aroma ritual</button><button @click="selectedService = 'นวดไทย'; navigate('search')">นวดแผนไทย</button><button @click="selectedService = 'Herbal'; navigate('search')">Herbal therapy</button><button @click="selectedService = 'Foot'; navigate('search')">Foot ritual</button></div>
      </section>

      <section class="lux-curated">
        <div class="lux-curated-heading"><div><div class="lux-kicker"><span></span> THE NUANIA EDIT</div><h2>คัดสรรเพื่อ<span>คุณ</span></h2><p>ผู้ให้บริการที่ได้รับความไว้วางใจ และใส่ใจทุกรายละเอียด</p></div><button class="lux-text-link" @click="navigate('search')">ดูทั้งหมด <span>↗</span></button></div>
        <div class="lux-provider-grid">
          <article v-for="provider in providers.slice(0, 3)" :key="provider.id" class="lux-provider-card">
            <div class="lux-card-image" :class="provider.visual" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)">
              <span class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span>
              <button class="lux-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)">{{ favorites.includes(provider.id) ? '♥' : '♡' }}</button>
              <span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span>
            </div>
            <div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">✓ VERIFIED</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">รายละเอียด <span>↗</span></button></div></div>
          </article>
        </div>
      </section>

      <section class="lux-experience">
        <div class="lux-experience-art"><div class="lux-experience-circle">N<span>✳</span></div><div class="lux-experience-caption">NUANIA · WELLNESS, YOUR WAY</div></div>
        <div class="lux-experience-copy"><div class="lux-kicker"><span></span> A MORE PERSONAL WAY TO UNWIND</div><h2>การพักผ่อนที่ดี<br />เริ่มจาก<span>ความสบายใจ</span></h2><p>เราเชื่อว่าทุกคนควรได้พบกับการดูแลที่ตรงกับตัวเอง NuaNia จึงคัดสรรร้านและนักบำบัดที่ใส่ใจคุณภาพ พร้อมข้อมูลชัดเจนก่อนทุกการนัดหมาย</p><div class="lux-value-list"><span><i>01</i> ผู้ให้บริการที่ตรวจสอบข้อมูลแล้ว</span><span><i>02</i> เลือกได้ทั้งที่ร้านและนอกสถานที่</span><span><i>03</i> เคารพความเป็นส่วนตัวของทุกคน</span></div><button class="lux-text-link" @click="navigate('search')">ค้นพบ NuaNia <span>↗</span></button></div>
      </section>

      <section class="lux-partner-banner"><div class="lux-partner-mark">N</div><div><small>FOR WELLNESS PARTNERS</small><h2>เรื่องดีๆ ที่คุณทำ<br />ควรถูกค้นพบ</h2><p>ร่วมเติบโตไปกับชุมชนผู้ให้บริการที่ใส่ใจคุณภาพ</p></div><button class="lux-button lux-button-light" @click="membership.role = 'seller'; navigate('membership')">สมัครเป็นผู้ให้บริการ <span>↗</span></button><span class="lux-partner-bg">NUANIA</span></section>
    </main>

    <main v-else-if="view === 'search'" class="lux-page lux-search-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ค้นหาบริการ</span></div>
      <div class="lux-page-heading"><div><div class="lux-kicker"><span></span> FIND YOUR WAY TO UNWIND</div><h1>ค้นพบการดูแล<span>ที่ใช่</span></h1><p>สำรวจร้านนวดและนักบำบัดที่คัดสรรทั่วประเทศไทย</p></div><div class="lux-result-note"><strong>{{ visibleProviders.length.toString().padStart(2, '0') }}</strong><span>ผลลัพธ์ที่ตรงกับคุณ</span></div></div>
      <div class="lux-search-layout">
        <aside class="lux-filter-panel"><div class="lux-filter-heading"><strong>ตัวกรอง</strong><button @click="searchName = ''; selectedProvince = ''; selectedGender = ''; selectedMode = ''; selectedService = ''">ล้างทั้งหมด</button></div>
          <label class="lux-filter-search"><span>⌕</span><input v-model="searchName" placeholder="ชื่อ บริการ หรือพื้นที่" /></label>
          <fieldset><legend>รูปแบบการรับบริการ</legend><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="" /><span>ทั้งหมด</span></label><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="ที่ร้าน" /><span>ที่ร้าน</span><small>ดูสถานที่และเวลาเปิด</small></label><label class="lux-check-row"><input v-model="selectedMode" type="radio" value="นอกสถานที่" /><span>นอกสถานที่</span><small>ให้ผู้ให้บริการเดินทางมาหาคุณ</small></label></fieldset>
          <label class="lux-filter-select"><span>จังหวัด</span><select v-model="selectedProvince"><option value="">ทุกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
          <label class="lux-filter-select"><span>อัตลักษณ์ทางเพศ</span><select v-model="selectedGender"><option value="">ทั้งหมด</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label>
          <fieldset><legend>ประเภทการดูแล</legend><label class="lux-check-row"><input v-model="selectedService" type="radio" value="" /><span>ทุกประเภท</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="Aroma" /><span>Aroma ritual</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="นวดไทย" /><span>นวดแผนไทย</span></label><label class="lux-check-row"><input v-model="selectedService" type="radio" value="Foot" /><span>Foot ritual</span></label></fieldset>
        </aside>
        <section class="lux-search-results"><div class="lux-results-toolbar"><div><span>แสดง</span> {{ visibleProviders.length }} ผู้ให้บริการ <span>ที่คัดสรร</span></div><label>เรียงตาม <select v-model="sortBy"><option>แนะนำ</option><option>คะแนนสูงสุด</option><option>ราคา: ต่ำไปสูง</option></select></label></div>
          <div class="lux-provider-grid lux-results-grid"><article v-for="provider in visibleProviders" :key="provider.id" class="lux-provider-card"><div class="lux-card-image" :class="provider.visual" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)"><span class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span><button class="lux-heart" :class="{ loved: favorites.includes(provider.id) }" :aria-label="favorites.includes(provider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click.stop="toggleFavorite(provider)">{{ favorites.includes(provider.id) ? '♥' : '♡' }}</button><span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span></div><div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">✓ VERIFIED</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">รายละเอียด <span>↗</span></button></div></div></article>
            <div v-if="!visibleProviders.length" class="lux-empty"><span>✳</span><h3>ยังไม่พบการดูแลที่ตรงใจ</h3><p>ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p><button class="lux-button lux-button-primary" @click="searchName = ''; selectedProvince = ''; selectedGender = ''; selectedMode = ''; selectedService = ''">ล้างตัวกรอง</button></div>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="view === 'profile' && selectedProvider" class="lux-page lux-profile-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><button @click="navigate('search')">ค้นหาบริการ</button><span>/</span><span>{{ selectedProvider.name }}</span></div>
      <div class="lux-profile-cover" :class="selectedProvider.visual"><div class="lux-profile-cover-copy"><span>THE ART OF WELLNESS</span><strong>{{ selectedProvider.category }}</strong></div><span class="lux-cover-index">NUANIA · {{ selectedProvider.province }}</span></div>
      <div class="lux-profile-layout"><section class="lux-profile-main"><div class="lux-profile-identity"><div class="lux-profile-monogram" :class="selectedProvider.visual">{{ selectedProvider.initials }}</div><div class="lux-profile-title"><div class="lux-profile-label"><span class="lux-verified">✓ VERIFIED PARTNER</span><span>✦ {{ selectedProvider.rating }} <small>({{ selectedProvider.reviews }} รีวิว)</small></span></div><h1>{{ selectedProvider.name }}<small>, {{ selectedProvider.age }}</small></h1><p>นักบำบัด · {{ selectedProvider.area }}, {{ selectedProvider.province }}</p></div><button class="lux-heart lux-profile-heart" :class="{ loved: favorites.includes(selectedProvider.id) }" :aria-label="favorites.includes(selectedProvider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click="toggleFavorite(selectedProvider)">{{ favorites.includes(selectedProvider.id) ? '♥' : '♡' }}</button></div>
          <div class="lux-profile-section"><div class="lux-kicker"><span></span> THE PRACTITIONER</div><h2>การดูแลที่เริ่มจาก<span>การรับฟัง</span></h2><p>{{ selectedProvider.description }} ทุกการนัดหมายจะเริ่มจากการพูดคุยเพื่อให้เราเข้าใจความต้องการ และปรับการดูแลให้เหมาะกับคุณ</p><div class="lux-tag-row"><span v-for="tag in selectedProvider.tags" :key="tag">{{ tag }}</span></div></div>
          <div class="lux-profile-section lux-service-section"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> SIGNATURE RITUALS</div><h2>บริการที่เลือกได้</h2></div><span>ราคาเริ่มต้น / 60 นาที</span></div><article v-for="(service, index) in services" :key="service.name" class="lux-service-row"><div class="lux-service-number">0{{ index + 1 }}</div><div class="lux-service-name"><strong>{{ service.name }}</strong><span>{{ service.duration }} · ปรับตามความต้องการ</span></div><div class="lux-service-price">฿{{ (selectedProvider.price + service.add).toLocaleString() }}</div><button class="lux-outline-button" @click="startBooking(selectedProvider)">เลือก</button></article></div>
          <div class="lux-profile-section lux-venue-section"><div class="lux-kicker"><span></span> THE SPACE</div><h2>สถานที่รับบริการ</h2><div class="lux-venue-card"><div class="lux-venue-art"><span>⌖</span><small>PRIVATE WELLNESS SPACE</small></div><div><strong>{{ selectedProvider.venue }}</strong><span>{{ selectedProvider.area }}, {{ selectedProvider.province }}</span><span class="lux-venue-features">✦ สะอาดและเป็นส่วนตัว <span>·</span> มีที่จอดรถ</span></div></div><p v-if="selectedProvider.modes.includes('นอกสถานที่')" class="lux-home-visit">ต้องการรับบริการที่บ้าน? <button @click="profileBookingMode = 'นอกสถานที่'; startBooking(selectedProvider)">เลือกบริการนอกสถานที่ ↗</button></p></div>
          <div class="lux-profile-section lux-review-section"><div class="lux-section-title"><div><div class="lux-kicker"><span></span> GUEST NOTES</div><h2>เสียงจากผู้รับบริการ</h2></div><span>✦ {{ selectedProvider.rating }} / 5.00</span></div><blockquote>“ใส่ใจและให้คำแนะนำดีมาก บรรยากาศผ่อนคลาย ทำให้ได้พักจริงๆ จะกลับมาอีกแน่นอน”<footer>ผู้รับบริการที่ยืนยันแล้ว <span>·</span> 12 ตุลาคม 2026</footer></blockquote></div>
        </section>
        <aside class="lux-booking-card"><div class="lux-booking-card-top"><span>PRIVATE SESSION</span><strong>เริ่มต้น ฿{{ selectedProvider.price.toLocaleString() }}<small> / ชั่วโมง</small></strong></div><div class="lux-booking-select"><label>เลือกรูปแบบการรับบริการ</label><button :class="{ active: profileBookingMode === 'ที่ร้าน' }" @click="profileBookingMode = 'ที่ร้าน'"><span class="lux-radio"></span><span><strong>ที่ร้าน</strong><small>{{ selectedProvider.venue }}</small></span></button><button v-if="selectedProvider.modes.includes('นอกสถานที่')" :class="{ active: profileBookingMode === 'นอกสถานที่' }" @click="profileBookingMode = 'นอกสถานที่'"><span class="lux-radio"></span><span><strong>นอกสถานที่</strong><small>ให้เรามาหาคุณ · ค่าบริการเดินทาง ฿250</small></span></button></div><div class="lux-booking-reassurance"><span>✓</span> ยังไม่เรียกเก็บเงินจนกว่าจะยืนยัน</div><button class="lux-button lux-button-primary lux-full-button" @click="startBooking(selectedProvider)">เลือกวันและเวลานัดหมาย <span>→</span></button><p class="lux-booking-privacy">การนัดหมายและข้อมูลส่วนตัวของคุณ<br />จะถูกเก็บเป็นความลับ</p></aside></div>
    </main>

    <main v-else-if="view === 'booking'" class="lux-page lux-booking-page">
      <div class="lux-breadcrumb"><button @click="navigate('search')">ค้นหาบริการ</button><span>/</span><button @click="navigate('profile')">{{ selectedProvider.name }}</button><span>/</span><span>นัดหมาย</span></div>
      <div class="lux-booking-heading"><div class="lux-kicker"><span></span> YOUR TIME, YOUR WAY</div><h1>นัดหมาย<span>ช่วงเวลาของคุณ</span></h1><p>ใกล้เสร็จแล้ว เลือกสถานที่และเวลาที่สะดวก</p></div>
      <div class="lux-booking-layout"><form class="lux-booking-form" @submit.prevent="submitBooking">
        <section class="lux-form-section"><div class="lux-step-heading"><span>01</span><div><h2>เลือกรูปแบบการรับบริการ</h2><p>เลือกพื้นที่ที่คุณรู้สึกสบายใจที่สุด</p></div></div><div class="lux-mode-options"><button type="button" :class="{ active: booking.mode === 'ที่ร้าน' }" @click="booking.mode = 'ที่ร้าน'"><span class="lux-mode-icon">⌂</span><strong>ที่ร้าน</strong><small>ผ่อนคลายในพื้นที่ส่วนตัวที่คัดสรร</small><i>◉</i></button><button type="button" :class="{ active: booking.mode === 'นอกสถานที่' }" @click="booking.mode = 'นอกสถานที่'"><span class="lux-mode-icon">⌖</span><strong>นอกสถานที่</strong><small>ให้ผู้ให้บริการเดินทางมาหาคุณ</small><i>◉</i></button></div>
          <div v-if="booking.mode === 'ที่ร้าน'" class="lux-selected-venue"><span>⌖</span><div><small>สถานที่ให้บริการ</small><strong>{{ selectedProvider.venue }}</strong><small>{{ selectedProvider.area }}, {{ selectedProvider.province }}</small></div><button type="button" @click="navigate('profile')">ดูแผนที่ ↗</button></div>
          <label v-else class="lux-form-label">ที่อยู่สำหรับรับบริการ<textarea v-model.trim="booking.address" rows="2" placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด" required></textarea><small>ข้อมูลที่อยู่จะแชร์กับผู้ให้บริการหลังยืนยันนัดหมายเท่านั้น</small></label>
        </section>
        <section class="lux-form-section"><div class="lux-step-heading"><span>02</span><div><h2>เลือกการดูแล</h2><p>เลือกบริการที่เหมาะกับช่วงเวลาของคุณ</p></div></div><label class="lux-form-label">บริการ<select v-model="booking.service" required><option v-for="service in services" :key="service.name" :value="service.name">{{ service.name }} · {{ service.duration }} · ฿{{ (selectedProvider.price + service.add).toLocaleString() }}</option></select></label><div class="lux-form-grid"><label class="lux-form-label">วันที่สะดวก<input v-model="booking.date" type="date" :min="new Date().toISOString().slice(0, 10)" required /></label><label class="lux-form-label">เวลา<select v-model="booking.time" required><option value="" disabled>เลือกช่วงเวลา</option><option>10:00</option><option>12:00</option><option>14:00</option><option>16:00</option><option>18:00</option><option>20:00</option></select></label></div><label class="lux-form-label">แจ้งความต้องการเพิ่มเติม <span class="lux-optional">(ไม่บังคับ)</span><textarea v-model.trim="booking.note" rows="2" maxlength="240" placeholder="เช่น แรงกดที่ต้องการ หรือบริเวณที่ควรหลีกเลี่ยง"></textarea></label></section>
        <section class="lux-form-section"><div class="lux-step-heading"><span>03</span><div><h2>ข้อมูลผู้รับบริการ</h2><p>สำหรับยืนยันการนัดหมายและติดต่อกลับ</p></div></div><div class="lux-form-grid"><label class="lux-form-label">ชื่อผู้รับบริการ<input v-model.trim="booking.guestName" type="text" autocomplete="name" placeholder="ชื่อที่ต้องการให้เรียก" required /></label><label class="lux-form-label">เบอร์โทรศัพท์<input v-model.trim="booking.phone" type="tel" inputmode="numeric" pattern="[0-9]{9,10}" maxlength="10" autocomplete="tel" placeholder="08XXXXXXXX" required /></label></div><label class="lux-consent"><input type="checkbox" required /><span>ยอมรับ <button type="button">เงื่อนไขการจอง</button> และ <button type="button">นโยบายความเป็นส่วนตัว</button></span></label></section>
        <button class="lux-button lux-button-primary lux-confirm-button" type="submit">ส่งคำขอนัดหมาย <span>→</span></button><p class="lux-secure-note">▣ ข้อมูลถูกเข้ารหัส · ยังไม่มีการตัดเงิน</p>
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
        </div>
        <template v-if="loginRole === 'buyer'">
          <button class="lux-google-button" type="button" @click="startGoogleLogin"><span class="lux-google-mark" aria-hidden="true">G</span>เข้าสู่ระบบด้วย Google</button>
          <p class="lux-google-demo">Google Login สำหรับผู้ซื้อบริการเท่านั้น · ปุ่มตัวอย่างที่ยังไม่ได้เชื่อมต่อ OAuth</p>
        </template>
        <div v-else class="lux-seller-login-note">
          <strong>Google Login ใช้ได้เฉพาะผู้ซื้อบริการ</strong>
          <p>ผู้ขายบริการใช้บัญชีผู้ขายเพื่อจัดการโปรไฟล์และนัดหมาย ระบบเข้าสู่ระบบผู้ขายยังไม่พร้อมใช้งานในต้นแบบนี้</p>
          <button type="button" @click="membership.role = 'seller'; navigate('membership')">สมัครสมาชิกผู้ขาย</button>
        </div>
        <div class="lux-login-signup">ยังไม่มีบัญชี? <button @click="navigate('membership')">สมัครสมาชิก</button></div>
      </section>
    </main>

    <main v-else-if="view === 'membership'" class="lux-page lux-membership-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>สมัครสมาชิก</span></div>
      <div class="lux-membership-heading"><div class="lux-kicker"><span></span> JOIN NUANIA</div><h1>เลือกประเภท<span>สมาชิก</span></h1><p>สมัครเป็นผู้ใช้บริการ หรือสร้างพื้นที่จัดการร้านและบริการของคุณ</p></div>
      <form class="lux-membership-form" @submit.prevent="submitMembership">
        <fieldset class="lux-role-picker"><legend>คุณต้องการใช้งานในฐานะใด?</legend>
          <label class="lux-role-option" :class="{ active: membership.role === 'buyer' }"><input v-model="membership.role" type="radio" value="buyer" /><span class="lux-role-icon">⌕</span><span class="lux-role-copy"><strong>ผู้ซื้อบริการ</strong><small>ค้นหา จองนวด ติดตามนัดหมาย และจัดการรายการโปรด</small></span><span class="lux-role-check">✓</span></label>
          <label class="lux-role-option" :class="{ active: membership.role === 'seller' }"><input v-model="membership.role" type="radio" value="seller" /><span class="lux-role-icon">✳</span><span class="lux-role-copy"><strong>ผู้ขายบริการ</strong><small>จัดการโปรไฟล์ร้าน บริการ ราคา และคำขอนัดหมาย</small></span><span class="lux-role-check">✓</span></label>
        </fieldset>
        <div class="lux-membership-fields">
          <label class="lux-form-label">{{ membership.role === 'seller' ? 'ชื่อผู้ให้บริการ / ชื่อร้าน' : 'ชื่อที่ใช้แสดง' }}<input v-model.trim="membership.name" type="text" autocomplete="name" maxlength="40" placeholder="ระบุชื่อ" required /></label>
          <label class="lux-form-label">อีเมล<input v-model.trim="membership.email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com" required /></label>
          <label class="lux-form-label">เบอร์โทรศัพท์<input v-model.trim="membership.phone" type="tel" inputmode="numeric" pattern="[0-9]{9,10}" maxlength="10" autocomplete="tel" placeholder="08XXXXXXXX" required /></label>
          <label class="lux-form-label">รหัสผ่าน<input v-model="membership.password" type="password" autocomplete="new-password" minlength="8" placeholder="อย่างน้อย 8 ตัวอักษร" required /></label>
          <template v-if="membership.role === 'seller'">
            <label class="lux-form-label">จังหวัดที่ให้บริการ<select v-model="membership.province" required><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
            <label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="membership.price" type="number" min="50" step="50" required /></label>
            <label class="lux-form-label lux-membership-wide">ชื่อร้าน / สถานที่ให้บริการ<input v-model.trim="membership.businessName" type="text" maxlength="80" placeholder="ไม่บังคับ" /></label>
            <label class="lux-form-label lux-membership-wide">รายละเอียดบริการ<textarea v-model.trim="membership.service" rows="3" maxlength="300" placeholder="เช่น นวดไทย นวดอโรม่า ประสบการณ์ และแนวทางการดูแล" required></textarea></label>
          </template>
        </div>
        <p class="lux-membership-notice" v-if="membership.role === 'seller'">โปรไฟล์ผู้ขายจะรอตรวจสอบก่อนเผยแพร่ เมื่อได้รับอนุมัติแล้วจึงจะแสดงในหน้าค้นหา</p>
        <button class="lux-button lux-button-primary lux-full-button" type="submit">สมัครสมาชิก<span>→</span></button>
        <p class="lux-membership-demo">ต้นแบบระบบสมาชิก · ข้อมูลจะอยู่ในหน้านี้ชั่วคราว ยังไม่มีระบบยืนยันอีเมลหรือจัดเก็บบัญชีถาวร</p>
      </form>
    </main>

    <main v-else-if="view === 'account'" class="lux-page lux-account-page">
      <div class="lux-account-welcome"><div class="lux-kicker"><span></span> YOUR NUANIA</div><h1>ช่วงเวลาสำหรับ<span>คุณ</span></h1><p>ติดตามการนัดหมายและจัดการช่วงเวลาพักผ่อนในที่เดียว</p><button class="lux-account-role-link" @click="openSellerArea">{{ member?.role === 'seller' ? 'กลับสู่หน้าผู้ขาย ↗' : 'สมัครสมาชิกผู้ขาย ↗' }}</button></div>
      <div class="lux-account-layout"><aside class="lux-account-sidebar"><div class="lux-account-person"><div class="lux-user-avatar lux-user-avatar-large">{{ member?.name?.slice(0, 1) || 'ก' }}</div><div><strong>{{ member?.name || 'คุณกานต์' }}</strong><span>สมาชิกผู้ใช้บริการ</span></div></div><button class="lux-account-tab" :class="{ active: accountTab === 'appointments' }" @click="accountTab = 'appointments'"><span>▦</span> ภาพรวม <small>{{ upcomingBookings.length }}</small></button><button class="lux-account-tab" :class="{ active: accountTab === 'favorites' }" @click="accountTab = 'favorites'"><span>♡</span> รายการโปรด <small>{{ favorites.length }}</small></button><button class="lux-account-tab" @click="showNotice('จัดการข้อมูลส่วนตัวได้ในบัญชีจริงเมื่อเชื่อมระบบ')"><span>◉</span> ข้อมูลส่วนตัว</button><div class="lux-account-help"><span>ต้องการความช่วยเหลือ?</span><button @click="showNotice('ทีมดูแลลูกค้าพร้อมช่วยเหลือคุณ')">ติดต่อทีม NuaNia ↗</button></div></aside><section class="lux-account-main"><template v-if="accountTab === 'appointments'"><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> YOUR APPOINTMENTS</div><h2>การนัดหมายของฉัน</h2></div><button class="lux-text-link" @click="navigate('search')">ค้นหาการดูแล <span>↗</span></button></div>
        <div v-if="upcomingBookings.length" class="lux-appointment-list"><article v-for="item in upcomingBookings" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-date"><span>{{ new Intl.DateTimeFormat('th-TH', { day: '2-digit' }).format(new Date(`${item.date}T00:00:00`)) }}</span><small>{{ new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(new Date(`${item.date}T00:00:00`)) }}</small></div><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ item.provider }} <span>·</span> {{ item.mode }} <span>·</span> {{ formatDate(item.date) }} เวลา {{ item.time }}</p><span class="lux-appointment-place">⌖ {{ item.venue }}</span></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button @click="showNotice('รายละเอียดนัดหมายจะแสดงในบัญชีของคุณ')">ดูรายละเอียด ↗</button></div></article></div><div v-else class="lux-empty"><span>✳</span><h3>ยังไม่มีนัดหมาย</h3><p>ช่วงเวลาพักผ่อนครั้งต่อไปของคุณ เริ่มต้นที่นี่</p><button class="lux-button lux-button-primary" @click="navigate('search')">ค้นหาการดูแล</button></div>
        <div class="lux-account-section-heading lux-history-heading"><div><div class="lux-kicker"><span></span> A LITTLE WHILE AGO</div><h2>ที่ผ่านมาไม่นาน</h2></div></div><div v-if="completedBookings.length" class="lux-history-list"><article v-for="item in completedBookings" :key="item.id" class="lux-history-item"><span class="lux-history-check">✓</span><div><strong>{{ item.service }}</strong><span>{{ item.provider }} · {{ formatDate(item.date) }}</span></div><span class="lux-history-amount">฿{{ item.amount.toLocaleString() }}</span><button @click="openProfile(providers.find((provider) => provider.id === item.providerId) || providers[0])">จองอีกครั้ง ↗</button></article></div>
        <div class="lux-account-promo"><span>✳</span><div><strong>ทุกการดูแล เริ่มจากความสบายใจ</strong><small>บันทึกรายการโปรด เพื่อกลับมาหาช่วงเวลาที่ใช่ได้ทุกเมื่อ</small></div><button @click="navigate('search')">สำรวจเพิ่มเติม ↗</button></div></template>
        <template v-else><div class="lux-account-section-heading"><div><div class="lux-kicker"><span></span> YOUR SAVED PARTNERS</div><h2>รายการโปรดของคุณ</h2></div><button class="lux-text-link" @click="navigate('search')">ค้นหาเพิ่มเติม <span>↗</span></button></div><div v-if="favoriteProviders.length" class="lux-provider-grid lux-favorite-grid"><article v-for="provider in favoriteProviders" :key="provider.id" class="lux-provider-card"><div class="lux-card-image" :class="provider.visual" role="button" tabindex="0" :aria-label="`ดูโปรไฟล์ ${provider.name}`" @click="openProfile(provider)" @keydown.enter="openProfile(provider)" @keydown.space.prevent="openProfile(provider)"><span class="lux-scene-symbol">{{ provider.initials }}</span><span class="lux-card-label">{{ provider.category }}</span><button class="lux-heart loved" aria-label="นำออกจากรายการโปรด" @click.stop="toggleFavorite(provider)">♥</button><span class="lux-image-bottom"><span>✦ {{ provider.rating }}</span><span>{{ provider.province }}</span></span></div><div class="lux-card-content"><div class="lux-card-meta"><span class="lux-verified">✓ VERIFIED</span><span>{{ provider.gender }}</span></div><button class="lux-provider-name" @click="openProfile(provider)">{{ provider.name }}<small>, {{ provider.age }} · {{ provider.area }}</small></button><p>{{ provider.description }}</p><div class="lux-card-foot"><span>เริ่มต้น <strong>฿{{ provider.price.toLocaleString() }}</strong> <small>/ ชม.</small></span><button @click="openProfile(provider)">ดูโปรไฟล์ <span>↗</span></button></div></div></article></div><div v-else class="lux-empty"><span>♡</span><h3>ยังไม่มีรายการโปรด</h3><p>บันทึกผู้ให้บริการที่คุณสนใจ เพื่อกลับมาดูได้ทุกเมื่อ</p><button class="lux-button lux-button-primary" @click="navigate('search')">ค้นหาการดูแล</button></div></template>
      </section></div>
    </main>

    <main v-else-if="view === 'apply'" class="lux-page lux-apply-page"><div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>สมัครเป็นพาร์ตเนอร์</span></div><div class="lux-apply-layout"><div class="lux-apply-intro"><div class="lux-kicker"><span></span> GROW WITH NUANIA</div><h1>ให้การดูแล<br />ของคุณ<span>ถูกค้นพบ</span></h1><p>ร่วมเป็นส่วนหนึ่งของชุมชนผู้ให้บริการที่เชื่อในคุณภาพ ความใส่ใจ และการดูแลทุกคนอย่างเท่าเทียม</p><div class="lux-apply-benefit"><span>01</span><div><strong>สร้างตัวตนที่น่าเชื่อถือ</strong><small>แชร์ประสบการณ์ บริการ และใบรับรองของคุณ</small></div></div><div class="lux-apply-benefit"><span>02</span><div><strong>จัดการนัดหมายได้สะดวก</strong><small>ลูกค้าเลือกเวลาและรูปแบบบริการได้ด้วยตัวเอง</small></div></div><div class="lux-apply-benefit"><span>03</span><div><strong>โปร่งใสและเป็นส่วนตัว</strong><small>คุณเป็นผู้กำหนดขอบเขตบริการและข้อมูลที่แสดง</small></div></div></div><form class="lux-apply-form" @submit.prevent="submitApplication"><div class="lux-kicker"><span></span> PARTNER APPLICATION</div><h2>เริ่มต้นสมัครใช้งาน</h2><p>ทีมงานจะติดต่อกลับเพื่อยืนยันข้อมูลก่อนเผยแพร่</p><label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="application.name" type="text" maxlength="40" placeholder="ชื่อเล่นหรือชื่อร้าน" required /></label><div class="lux-form-grid"><label class="lux-form-label">LINE ID<input v-model.trim="application.line" type="text" maxlength="50" placeholder="สำหรับติดต่อลูกค้า" required /></label><label class="lux-form-label">จังหวัด<select v-model="application.province" required><option value="" disabled>เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label></div><div class="lux-form-grid"><label class="lux-form-label">อัตลักษณ์ทางเพศ<select v-model="application.gender" required><option value="" disabled>เลือกตามที่คุณสบายใจ</option><option>ผู้หญิง</option><option>ผู้ชาย</option><option>นอนไบนารี</option><option>ทรานส์เจนเดอร์</option><option>เควียร์</option><option>LGBTQ+</option><option>ไม่ประสงค์ระบุ</option></select></label><label class="lux-form-label">บริการเด่น<input v-model.trim="application.service" type="text" maxlength="100" placeholder="เช่น Aroma, นวดไทย" required /></label></div><label class="lux-consent"><input v-model="application.consent" type="checkbox" required /><span>ยินยอมให้แสดงข้อมูลโปรไฟล์สาธารณะตามที่ระบุ</span></label><div class="lux-apply-fee"><span>สมาชิกพาร์ตเนอร์</span><strong>฿299 <small>/ เดือน</small></strong><span>เรียกเก็บหลังผ่านการอนุมัติเท่านั้น</span></div><button class="lux-button lux-button-primary lux-full-button" type="submit">ส่งใบสมัคร ↗</button><small class="lux-demo-note">แบบฟอร์มต้นแบบ · ไม่มีการส่งข้อมูลหรือเรียกเก็บเงินจริง</small></form></div></main>

    <main v-else-if="view === 'admin'" class="lux-page lux-admin-page"><div class="lux-admin-top"><div><div class="lux-kicker"><span></span> NUANIA ADMINISTRATION</div><h1>ภาพรวม<span>แพลตฟอร์ม</span></h1><p>จัดการพาร์ตเนอร์ การนัดหมาย และดูแลประสบการณ์ของสมาชิก</p></div><span class="lux-demo-status">● DEMO ENVIRONMENT · ข้อมูลตัวอย่าง</span></div><div class="lux-admin-tabs"><button v-for="tab in [{id:'overview', label:'ภาพรวม'}, {id:'providers', label:'พาร์ตเนอร์'}, {id:'bookings', label:'การนัดหมาย'}, {id:'applications', label:'ใบสมัคร'}]" :key="tab.id" :class="{ active: adminTab === tab.id }" @click="adminTab = tab.id">{{ tab.label }} <small v-if="tab.id === 'applications' && applications.length">{{ applications.length }}</small></button></div>
      <template v-if="adminTab === 'overview'"><div class="lux-admin-metrics"><article><span>พาร์ตเนอร์ที่เผยแพร่</span><strong>{{ activeProviderCount }}</strong><small>↑ 8.4% <i>เทียบกับเดือนก่อน</i></small></article><article><span>นัดหมายเดือนนี้</span><strong>{{ bookings.length + 126 }}</strong><small>● <i>อัปเดตจากข้อมูลตัวอย่าง</i></small></article><article><span>รายได้ค่าสมาชิก</span><strong>฿{{ (activeProviderCount * 299).toLocaleString() }}</strong><small>สมมติสมาชิก {{ activeProviderCount }} ราย</small></article><article><span>กำลังรอตรวจสอบ</span><strong>{{ applications.length }}</strong><small><i>ใบสมัครพาร์ตเนอร์ใหม่</i></small></article></div><div class="lux-admin-overview-grid"><section class="lux-admin-panel"><div class="lux-admin-panel-head"><div><h2>การนัดหมายล่าสุด</h2><p>ภาพรวมการจองจากผู้ใช้บริการ</p></div><button @click="adminTab = 'bookings'">ดูทั้งหมด ↗</button></div><div class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัส / ผู้รับบริการ</th><th>ผู้ให้บริการ</th><th>วันและเวลา</th><th>รูปแบบ</th><th>ยอด</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in bookings.slice(0, 5)" :key="item.id"><td><strong>{{ item.id }}</strong><small>คุณ{{ item === bookings[0] ? 'กานต์' : 'ลูกค้า' }}</small></td><td>{{ item.provider }}</td><td>{{ formatDate(item.date) }} · {{ item.time }}</td><td>{{ item.mode }}</td><td>฿{{ item.amount.toLocaleString() }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div></section><aside class="lux-admin-panel lux-admin-side-panel"><div class="lux-admin-panel-head"><div><h2>รอตรวจสอบ</h2><p>ใบสมัครพาร์ตเนอร์</p></div><span>{{ applications.length }}</span></div><div v-if="applications.length" class="lux-pending-list"><div v-for="item in applications.slice(0, 4)" :key="item.id"><span class="lux-pending-avatar">{{ item.name.slice(0, 1) }}</span><div><strong>{{ item.name }}</strong><small>{{ item.province }} · {{ item.line }}</small></div><button @click="approveApplication(item)">อนุมัติ</button></div></div><div v-else class="lux-admin-no-pending"><span>✓</span><strong>ไม่มีรายการค้าง</strong><small>ใบสมัครใหม่จะแสดงที่นี่</small></div></aside></div></template>
      <section v-else class="lux-admin-panel lux-admin-detail-panel"><div class="lux-admin-panel-head"><div><h2>{{ adminTab === 'providers' ? 'พาร์ตเนอร์ทั้งหมด' : adminTab === 'bookings' ? 'รายการนัดหมาย' : 'ใบสมัครพาร์ตเนอร์' }}</h2><p>การจัดการภายใน · การเปลี่ยนแปลงเป็นข้อมูลตัวอย่างในเบราว์เซอร์</p></div><span>{{ adminTab === 'providers' ? providers.length : adminTab === 'bookings' ? bookings.length : applications.length }} รายการ</span></div><div v-if="adminTab === 'providers'" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>พาร์ตเนอร์</th><th>พื้นที่ให้บริการ</th><th>รูปแบบ</th><th>สมาชิก</th><th>โปรไฟล์</th></tr></thead><tbody><tr v-for="provider in providers" :key="provider.id"><td><strong>{{ provider.name }} · {{ provider.category }}</strong><small>LINE {{ provider.line }}</small></td><td>{{ provider.area }}, {{ provider.province }}</td><td>{{ provider.modes.join(' / ') }}</td><td><button class="lux-admin-action" @click="provider.membershipActive = !provider.membershipActive">{{ provider.membershipActive ? 'สมาชิกใช้งาน' : 'หมดอายุ' }}</button></td><td><button class="lux-admin-action" @click="provider.active = !provider.active">{{ provider.active ? 'เผยแพร่' : 'ซ่อน' }}</button></td></tr></tbody></table></div><div v-else-if="adminTab === 'bookings'" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>รหัสการจอง</th><th>ผู้ให้บริการ</th><th>บริการ</th><th>วัน / เวลา</th><th>รูปแบบ</th><th>สถานะ</th></tr></thead><tbody><tr v-for="item in bookings" :key="item.id"><td><strong>{{ item.id }}</strong></td><td>{{ item.provider }}</td><td>{{ item.service }}</td><td>{{ formatDate(item.date) }} · {{ item.time }}</td><td>{{ item.mode }}</td><td><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span></td></tr></tbody></table></div><div v-else-if="applications.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>ผู้สมัคร</th><th>จังหวัด</th><th>อัตลักษณ์</th><th>บริการ</th><th>LINE ID</th><th>จัดการ</th></tr></thead><tbody><tr v-for="item in applications" :key="item.id"><td><strong>{{ item.name }}</strong></td><td>{{ item.province }}</td><td>{{ item.gender }}</td><td>{{ item.service }}</td><td>{{ item.line }}</td><td><button class="lux-admin-action" @click="approveApplication(item)">อนุมัติ</button><button class="lux-admin-action reject" @click="applications = applications.filter((entry) => entry.id !== item.id)">ปฏิเสธ</button></td></tr></tbody></table></div><div v-else class="lux-admin-no-pending"><span>✓</span><strong>ไม่มีใบสมัครค้างตรวจสอบ</strong></div></section>
      <p class="lux-admin-footnote">หน้าจอตัวอย่างสำหรับการออกแบบ · ไม่มีระบบบัญชีผู้ดูแลหรือการชำระเงินจริง</p></main>

    <main v-else-if="view === 'design'" class="lux-page lux-design-page"><div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>Design system</span></div><div class="lux-page-heading"><div><div class="lux-kicker"><span></span> NUANIA · VISUAL LANGUAGE</div><h1>Design<span>system</span></h1><p>ระบบภาพที่ออกแบบเพื่อให้การพักผ่อนรู้สึกสงบ เชื่อถือได้ และเป็นส่วนตัว</p></div></div><section class="lux-design-section"><span class="lux-design-index">01 / COLOR</span><h2>Palette <small>ชุดสีสดใสแบบ full-color พร้อมไล่เฉดม่วง–ชมพู–ส้ม</small></h2><div class="lux-gradient-strip" aria-label="Signature gradient"></div><div class="lux-color-grid"><article v-for="color in [{name:'Violet', hex:'#7C3AED', cls:'swatch-violet'}, {name:'Pink',hex:'#EC4899',cls:'swatch-pink'}, {name:'Orange',hex:'#F97316',cls:'swatch-orange'}, {name:'Teal',hex:'#14B8A6',cls:'swatch-teal'}, {name:'Sky',hex:'#0EA5E9',cls:'swatch-sky'}, {name:'Indigo',hex:'#1E1B4B',cls:'swatch-indigo'}]" :key="color.name"><div :class="color.cls"></div><strong>{{ color.name }}</strong><span>{{ color.hex }}</span></article></div></section><section class="lux-design-section lux-type-samples"><span class="lux-design-index">02 / TYPOGRAPHY</span><h2>Type scale <small>ตัวอักษร sans สมัยใหม่ หนา ชัด และอ่านง่ายทุกหน้าจอ</small></h2><div><span>Display / 64</span><strong>คืนพื้นที่ให้ความรู้สึกดี</strong><span>Heading / 32</span><h3>ค้นพบการดูแลที่ใช่</h3><span>Body / 16</span><p>ช่วงเวลาที่ได้พักอย่างแท้จริง เริ่มต้นจากการดูแลที่เข้าใจคุณ</p><span>Caption / 12</span><small>PRIVATE WELLNESS · VERIFIED PARTNER</small></div></section><section class="lux-design-section"><span class="lux-design-index">03 / COMPONENTS</span><h2>UI elements <small>คอมโพเนนต์มุมโค้งนุ่ม สีสดใส และสม่ำเสมอในทุกหน้าจอ</small></h2><div class="lux-component-row"><button class="lux-button lux-button-primary">ปุ่มหลัก ↗</button><button class="lux-button lux-button-light lux-border-button">ปุ่มรอง</button><span class="lux-verified">✓ VERIFIED</span><span class="lux-status">ยืนยันแล้ว</span><span class="lux-status waiting">รอยืนยัน</span></div><div class="lux-design-input"><label class="lux-form-label">Input / default<input placeholder="ชื่อหรือพื้นที่ให้บริการ" /></label><label class="lux-form-label">Select / default<select><option>เลือกจังหวัด</option></select></label></div></section><section class="lux-design-section"><span class="lux-design-index">04 / SPACING & SHAPE</span><h2>Layout principles <small>จังหวะพื้นที่และรูปทรง</small></h2><div class="lux-principles"><div><span class="lux-space-swatch space-8"></span><strong>8 px</strong><small>micro spacing</small></div><div><span class="lux-space-swatch space-16"></span><strong>16 px</strong><small>component gap</small></div><div><span class="lux-space-swatch space-24"></span><strong>24 px</strong><small>card padding</small></div><div><span class="lux-space-swatch space-40"></span><strong>40 px</strong><small>section rhythm</small></div><p>ใช้กริด 12 คอลัมน์บน desktop และ single-column flow บนมือถือ ปุ่มและช่องกรอกมีพื้นที่สัมผัสอย่างน้อย 44 px, มุมโค้ง 14–24 px พร้อมเงานุ่มและสีไล่เฉดเพื่อความทันสมัย และหลีกเลี่ยงการเปิดเผยข้อมูลที่ไม่จำเป็น</p></div></section></main>

    <footer class="lux-footer"><div class="lux-footer-main"><div class="lux-logo"><span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>WELLNESS, YOUR WAY</small></span></div><p>พื้นที่ของการดูแลที่ดี<br />สำหรับทุกช่วงเวลาของคุณ</p><div class="lux-footer-links"><button @click="navigate('search')">ค้นหาการดูแล</button><button @click="navigate('account')">บัญชีของฉัน</button><button @click="navigate('apply')">ร่วมเป็นพาร์ตเนอร์</button><button @click="navigate('admin')">Admin preview</button><button @click="navigate('design')">Design system ↗</button></div><div class="lux-footer-contact"><span>NEED A MOMENT?</span><strong>เราพร้อมช่วยเหลือคุณ</strong><button @click="showNotice('ทีม NuaNia พร้อมช่วยเหลือในเวลาทำการ')">ติดต่อ NuaNia ↗</button></div></div><div class="lux-footer-bottom"><span>© 2026 NUANIA WELLNESS · DEMO EXPERIENCE</span><span>ความเป็นส่วนตัว　 ข้อกำหนดการใช้บริการ</span><span>THAILAND · MADE WITH CARE</span></div></footer>

    <nav class="lux-mobile-bottom" aria-label="เมนูมือถือ"><button :class="{ active: view === 'home' }" @click="navigate('home')"><span>⌂</span>หน้าแรก</button><button :class="{ active: view === 'search' }" @click="navigate('search')"><span>⌕</span>ค้นหา</button><button :class="{ active: view === 'account' }" @click="navigate('account')"><span>▦</span>การจอง</button><button :class="{ active: view === 'account' }" @click="navigate('account')"><span>◉</span>บัญชี</button></nav>
    <main v-if="view === 'seller' && sellerProvider" class="lux-page lux-seller-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>ศูนย์จัดการผู้ขาย</span></div>
      <div class="lux-seller-heading"><div><div class="lux-kicker"><span></span> SELLER WORKSPACE</div><h1>จัดการ<span>บริการของคุณ</span></h1><p>{{ sellerProvider.name }} · {{ sellerProvider.province }}</p></div><span class="lux-seller-status" :class="{ published: sellerProvider.active }">{{ sellerProvider.active ? 'เผยแพร่แล้ว' : 'รอตรวจสอบโปรไฟล์' }}</span></div>
      <nav class="lux-seller-tabs" aria-label="เมนูจัดการผู้ขาย"><button :class="{ active: sellerDashboardTab === 'overview' }" @click="sellerDashboardTab = 'overview'">ภาพรวม</button><button :class="{ active: sellerDashboardTab === 'profile' }" @click="sellerDashboardTab = 'profile'">โปรไฟล์และบริการ</button><button :class="{ active: sellerDashboardTab === 'bookings' }" @click="sellerDashboardTab = 'bookings'">คำขอนัดหมาย <span>{{ sellerBookings.filter(item => item.status === 'รอยืนยัน').length }}</span></button><button class="lux-seller-switch" @click="openBuyerArea">ไปหน้าผู้ซื้อ ↗</button></nav>
      <section v-if="sellerDashboardTab === 'overview'" class="lux-seller-overview">
        <div v-if="!sellerProvider.active" class="lux-seller-review-note"><strong>โปรไฟล์กำลังรอตรวจสอบ</strong><span>ทีมงานจะตรวจสอบข้อมูลก่อนเผยแพร่ คุณสามารถจัดการรายละเอียดบริการได้ระหว่างนี้</span><button @click="sellerDashboardTab = 'profile'">ตรวจสอบโปรไฟล์ ↗</button></div>
        <div class="lux-seller-metrics"><article><span>คำขอนัดหมายใหม่</span><strong>{{ sellerBookings.filter(item => item.status === 'รอยืนยัน').length }}</strong></article><article><span>นัดหมายที่ยืนยัน</span><strong>{{ sellerBookings.filter(item => item.status === 'ยืนยันแล้ว').length }}</strong></article><article><span>บริการที่ลงไว้</span><strong>1</strong></article><article><span>ราคาเริ่มต้น</span><strong>฿{{ sellerProvider.price.toLocaleString() }}</strong></article></div>
        <section class="lux-seller-panel"><div class="lux-seller-panel-head"><div><h2>นัดหมายล่าสุด</h2><p>จัดการคำขอจากผู้ใช้บริการ</p></div><button @click="sellerDashboardTab = 'bookings'">ดูนัดหมายทั้งหมด ↗</button></div><div v-if="sellerBookings.length" class="lux-appointment-list"><article v-for="item in sellerBookings.slice(0, 3)" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ formatDate(item.date) }} · {{ item.time }} · {{ item.mode }}</p></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button @click="sellerDashboardTab = 'bookings'">จัดการ ↗</button></div></article></div><div v-else class="lux-empty"><span>▦</span><h3>ยังไม่มีคำขอนัดหมาย</h3><p>เมื่อผู้ใช้จองบริการ รายการจะปรากฏในหน้านี้</p></div></section>
      </section>
      <form v-else-if="sellerDashboardTab === 'profile'" class="lux-seller-panel lux-seller-profile" @submit.prevent="showNotice('บันทึกข้อมูลบริการแล้ว')"><div class="lux-seller-panel-head"><div><h2>โปรไฟล์และบริการ</h2><p>ข้อมูลนี้จะแสดงในหน้าค้นหาหลังผ่านการตรวจสอบ</p></div></div><div class="lux-membership-fields"><label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="sellerProvider.name" maxlength="40" required /></label><label class="lux-form-label">จังหวัด<select v-model="sellerProvider.province" required><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="sellerProvider.price" type="number" min="1" step="50" required /></label><label class="lux-form-label">สถานที่ให้บริการ<input v-model.trim="sellerProvider.venue" maxlength="100" required /></label><label class="lux-form-label lux-membership-wide">รายละเอียดบริการ<textarea v-model.trim="sellerProvider.description" rows="4" maxlength="300" required></textarea></label><fieldset class="lux-seller-modes"><legend>รูปแบบการให้บริการ</legend><label><input v-model="sellerProvider.modes" type="checkbox" value="ที่ร้าน" :disabled="sellerProvider.modes.length === 1 && sellerProvider.modes.includes('ที่ร้าน')" /> ที่ร้าน</label><label><input v-model="sellerProvider.modes" type="checkbox" value="นอกสถานที่" :disabled="sellerProvider.modes.length === 1 && sellerProvider.modes.includes('นอกสถานที่')" /> นอกสถานที่</label></fieldset></div><button class="lux-button lux-button-primary" type="submit">บันทึกข้อมูลบริการ ↗</button></form>
      <section v-else class="lux-seller-panel"><div class="lux-seller-panel-head"><div><h2>คำขอนัดหมาย</h2><p>ยืนยันหรืออัปเดตสถานะการให้บริการ</p></div></div><div v-if="sellerBookings.length" class="lux-appointment-list"><article v-for="item in sellerBookings" :key="item.id" class="lux-appointment-card"><div class="lux-appointment-info"><div class="lux-appointment-top"><span class="lux-status" :class="{ waiting: item.status === 'รอยืนยัน' }">{{ item.status }}</span><small>รหัส {{ item.id }}</small></div><h3>{{ item.service }}</h3><p>{{ formatDate(item.date) }} · {{ item.time }} · {{ item.mode }}</p><span class="lux-appointment-place">{{ item.venue }}</span></div><div class="lux-appointment-side"><strong>฿{{ item.amount.toLocaleString() }}</strong><button v-if="item.status === 'รอยืนยัน'" @click="updateSellerBooking(item, 'ยืนยันแล้ว')">ยืนยันนัดหมาย</button><button v-else-if="item.status === 'ยืนยันแล้ว'" @click="updateSellerBooking(item, 'เสร็จสิ้น')">เสร็จสิ้น</button></div></article></div><div v-else class="lux-empty"><span>▦</span><h3>ยังไม่มีคำขอนัดหมาย</h3><p>รายการจองใหม่จะแสดงที่นี่</p></div></section>
      <p class="lux-membership-demo">ต้นแบบหน้าจัดการผู้ขาย · สิทธิ์และข้อมูลยังจัดเก็บในเบราว์เซอร์ ไม่ใช่ระบบบัญชีจริง</p>
    </main>
    <div v-if="notice" class="lux-toast" role="status"><span>✓</span>{{ notice }}</div>
  </div>
</template>
