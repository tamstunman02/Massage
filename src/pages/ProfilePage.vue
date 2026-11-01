<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, onViewerTouchStart, onViewerTouchEnd, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()

const heroStage = ref(null)
const heroVideo = ref(null)
const thumbRail = ref(null)
const heroIndex = ref(0)
const heroPlaying = ref(false)
const galleryFilter = ref('all')
const canScrollThumbsPrev = ref(false)
const canScrollThumbsNext = ref(false)
let thumbResize = null

let heroStartX = 0
let heroStartY = 0
let heroAxis = ''

const profileMedia = computed(() => selectedProvider.value?.media || [])
const heroMedia = computed(() => profileMedia.value[heroIndex.value] || featuredProfileImage.value || null)
const imageCount = computed(() => profileMedia.value.filter((item) => item.type === 'image').length)
const videoCount = computed(() => profileMedia.value.filter((item) => item.type === 'video').length)
const filteredGallery = computed(() => {
  if (galleryFilter.value === 'image') return profileMedia.value.filter((item) => item.type === 'image')
  if (galleryFilter.value === 'video') return profileMedia.value.filter((item) => item.type === 'video')
  return profileMedia.value
})
const profileChat = computed(() => {
  const provider = selectedProvider.value
  const line = providerLineUrl(provider)
  if (line) return { href: line, label: 'แชทผ่าน LINE', kind: 'line' }
  const facebook = providerFacebookUrl(provider)
  if (facebook) return { href: facebook, label: 'แชทผ่าน Facebook', kind: 'facebook' }
  return null
})

function genderCode(gender) {
  if (gender === 'ผู้หญิง') return 'F'
  if (gender === 'ผู้ชาย') return 'M'
  return gender || ''
}

function mediaIndex(media) {
  return profileMedia.value.findIndex((item) => item.id === media.id)
}

function changeHero(delta) {
  const total = profileMedia.value.length
  if (total < 2) return
  heroIndex.value = (heroIndex.value + delta + total) % total
}

function selectHero(media) {
  const index = mediaIndex(media)
  if (index >= 0) heroIndex.value = index
}

function updateThumbScroll() {
  const rail = thumbRail.value
  if (!rail) {
    canScrollThumbsPrev.value = false
    canScrollThumbsNext.value = false
    return
  }
  const max = rail.scrollWidth - rail.clientWidth
  canScrollThumbsPrev.value = rail.scrollLeft > 4
  canScrollThumbsNext.value = max > 4 && rail.scrollLeft < max - 4
}

function thumbStep() {
  const rail = thumbRail.value
  const first = rail?.firstElementChild
  if (!first) return 0
  const gap = Number.parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 12
  return first.getBoundingClientRect().width + gap
}

function scrollThumbs(direction) {
  const rail = thumbRail.value
  if (!rail) return
  rail.scrollBy({ left: thumbStep() * direction, behavior: 'smooth' })
}

function bindThumbRail(el) {
  el?.addEventListener('scroll', updateThumbScroll, { passive: true })
}

function unbindThumbRail(el) {
  el?.removeEventListener('scroll', updateThumbScroll)
}

function toggleHeroVideo(event) {
  event.stopPropagation()
  const video = heroVideo.value
  if (!video) return
  if (video.paused) {
    video.play()
    heroPlaying.value = true
    return
  }
  video.pause()
  heroPlaying.value = false
}

function onHeroTouchStart(event) {
  const touch = event.changedTouches?.[0]
  if (!touch) return
  heroStartX = touch.clientX
  heroStartY = touch.clientY
  heroAxis = ''
}

function onHeroTouchMove(event) {
  const touch = event.touches?.[0]
  if (!touch) return
  const dx = touch.clientX - heroStartX
  const dy = touch.clientY - heroStartY
  if (!heroAxis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    heroAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }
  if (heroAxis === 'x') event.preventDefault()
}

function onHeroTouchEnd(event) {
  if (heroAxis !== 'x') return
  const touch = event.changedTouches?.[0]
  if (!touch) return
  const dx = touch.clientX - heroStartX
  if (dx < -40) changeHero(1)
  else if (dx > 40) changeHero(-1)
}

function bindHeroStage(el) {
  el?.addEventListener('touchstart', onHeroTouchStart, { passive: true })
  el?.addEventListener('touchmove', onHeroTouchMove, { passive: false })
  el?.addEventListener('touchend', onHeroTouchEnd, { passive: true })
  el?.addEventListener('touchcancel', onHeroTouchEnd, { passive: true })
}

function unbindHeroStage(el) {
  el?.removeEventListener('touchstart', onHeroTouchStart)
  el?.removeEventListener('touchmove', onHeroTouchMove)
  el?.removeEventListener('touchend', onHeroTouchEnd)
  el?.removeEventListener('touchcancel', onHeroTouchEnd)
}

watch(heroStage, (el, prev) => {
  unbindHeroStage(prev)
  bindHeroStage(el)
}, { flush: 'post' })

watch(thumbRail, (el, prev) => {
  unbindThumbRail(prev)
  bindThumbRail(el)
  thumbResize?.disconnect()
  if (el && typeof ResizeObserver !== 'undefined') {
    thumbResize = new ResizeObserver(() => updateThumbScroll())
    thumbResize.observe(el)
  }
  nextTick(updateThumbScroll)
}, { flush: 'post' })

watch(
  () => selectedProvider.value?.id,
  () => {
    heroIndex.value = 0
    heroPlaying.value = false
    galleryFilter.value = 'all'
  },
)

watch(filteredGallery, async () => {
  await nextTick()
  if (thumbRail.value) thumbRail.value.scrollLeft = 0
  updateThumbScroll()
})

watch(heroIndex, () => {
  heroPlaying.value = false
})

onBeforeUnmount(() => {
  unbindHeroStage(heroStage.value)
  unbindThumbRail(thumbRail.value)
  thumbResize?.disconnect()
})
</script>

<template>
  <main class="lux-page lux-profile-page">
    <div class="lux-breadcrumb">
      <button @click="navigate('home')">หน้าแรก</button>
      <span>/</span>
      <button v-if="currentRole === 'admin'" @click="adminTab = 'providers'; navigate('admin')">พาร์ตเนอร์</button>
      <button v-else @click="navigate('search')">ค้นหาบริการ</button>
      <span>/</span>
      <span>{{ selectedProvider.name }}</span>
    </div>

    <div class="lux-profile-showcase">
      <section class="lux-profile-hero">
        <div
          ref="heroStage"
          class="lux-profile-hero-stage"
          :class="{ 'is-empty': !heroMedia }"
          :aria-label="heroMedia ? `${heroMedia.type === 'video' ? 'วิดีโอ' : 'รูปภาพ'} ${heroMedia.name || selectedProvider.name}` : `โปรไฟล์ ${selectedProvider.name}`"
        >
          <img
            v-if="heroMedia?.type === 'image' || (heroMedia && heroMedia.type !== 'video')"
            :src="heroMedia.url"
            :alt="heroMedia.name || selectedProvider.name"
            draggable="false"
          />
          <video
            v-else-if="heroMedia?.type === 'video'"
            ref="heroVideo"
            :src="heroMedia.url"
            :aria-label="heroMedia.name"
            preload="metadata"
            playsinline
            muted
          ></video>
          <div v-else class="lux-profile-hero-fallback" :class="selectedProvider.visual">
            <span>{{ selectedProvider.initials }}</span>
          </div>

          <button
            v-if="heroMedia?.type === 'video'"
            type="button"
            class="lux-profile-hero-play"
            :aria-label="heroPlaying ? 'หยุดวิดีโอ' : 'เล่นวิดีโอ'"
            @click="toggleHeroVideo"
          >
            <AppIcon :name="heroPlaying ? 'circle' : 'play'" />
          </button>

          <button
            v-if="profileMedia.length > 1"
            type="button"
            class="lux-profile-hero-nav previous"
            aria-label="สื่อก่อนหน้า"
            @click.stop="changeHero(-1)"
          >
            <AppIcon name="arrow-left" />
          </button>
          <button
            v-if="profileMedia.length > 1"
            type="button"
            class="lux-profile-hero-nav next"
            aria-label="สื่อถัดไป"
            @click.stop="changeHero(1)"
          >
            <AppIcon name="arrow-right" />
          </button>

          <div class="lux-profile-hero-tools">
            <button
              type="button"
              class="lux-profile-hero-tool"
              :class="{ loved: favorites.includes(selectedProvider.id) }"
              :aria-label="favorites.includes(selectedProvider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'"
              @click.stop="toggleFavorite(selectedProvider)"
            >
              <AppIcon name="heart" />
            </button>
            <button type="button" class="lux-profile-hero-tool" aria-label="แชร์โปรไฟล์" @click.stop="shareProviderProfile(selectedProvider)">
              <AppIcon name="share" />
            </button>
          </div>

          <div v-if="profileMedia.length" class="lux-profile-hero-foot">
            <span>{{ heroIndex + 1 }} / {{ profileMedia.length }}</span>
            <div class="lux-profile-hero-dots" aria-hidden="true">
              <i
                v-for="(media, index) in profileMedia"
                :key="media.id"
                :class="{ active: index === heroIndex }"
              ></i>
            </div>
          </div>
        </div>
      </section>

      <section class="lux-profile-sheet">
        <header class="lux-profile-sheet-head">
          <div class="lux-profile-sheet-who">
            <div class="lux-profile-monogram" :class="[selectedProvider.visual, { 'has-profile-image': featuredProfileImage }]">
              <img v-if="featuredProfileImage" :src="featuredProfileImage.url" :alt="`รูปโปรไฟล์ ${selectedProvider.name}`" />
              <span v-else>{{ selectedProvider.initials }}</span>
            </div>
            <div>
              <h1>{{ selectedProvider.name }}</h1>
              <p v-if="reviewSummary">{{ reviewSummary.service }} / 5 จาก {{ reviewSummary.count }} รีวิว</p>
              <p v-else>ยังไม่มีคะแนนรีวิว</p>
            </div>
          </div>
          <strong>{{ selectedProvider.age }}<template v-if="genderCode(selectedProvider.gender)">,{{ genderCode(selectedProvider.gender) }}</template></strong>
        </header>

        <div class="lux-profile-sheet-stats">
          <span v-if="reviewSummary"><AppIcon name="star" /> {{ reviewSummary.service }}</span>
          <span v-else><AppIcon name="star" /> ยังไม่มีคะแนน</span>
          <span>{{ reviewSummary?.count || 0 }} รีวิว</span>
        </div>

        <div class="lux-profile-place">
          <span><AppIcon name="location-dot" /> พื้นที่</span>
          <p>{{ selectedProvider.area }}, {{ selectedProvider.province }}</p>
        </div>

        <div class="lux-profile-metrics">
          <div>
            <strong>{{ selectedProvider.heightCm || '-' }}<small> ซม.</small></strong>
            <span>ส่วนสูง</span>
          </div>
          <div>
            <strong>{{ selectedProvider.weightKg || '-' }}<small> กก.</small></strong>
            <span>น้ำหนัก</span>
          </div>
          <div>
            <strong>{{ selectedProvider.measurements || '-' }}</strong>
            <span>สัดส่วน</span>
          </div>
        </div>

        <div class="lux-profile-about-block">
          <h2>เกี่ยวกับ {{ selectedProvider.name }}</h2>
          <ul class="lux-profile-facts">
            <li v-for="(service, index) in providerServices(selectedProvider)" :key="`${service.name}-${index}`">
              {{ service.name }}
              <template v-if="service.duration"> · {{ service.duration }}</template>
              <template v-if="service.price"> · ฿{{ Number(service.price).toLocaleString() }}</template>
            </li>
            <li v-if="selectedProvider.age">อายุ {{ selectedProvider.age }} ปี</li>
            <li v-if="selectedProvider.heightCm">ส่วนสูง {{ selectedProvider.heightCm }} ซม.</li>
            <li v-if="selectedProvider.weightKg">น้ำหนัก {{ selectedProvider.weightKg }} กก.</li>
            <li v-if="selectedProvider.measurements">สัดส่วน {{ selectedProvider.measurements }}</li>
            <li>พื้นที่ {{ selectedProvider.area }}, {{ selectedProvider.province }}</li>
          </ul>
          <p v-if="selectedProvider.description" class="lux-provider-about-copy">{{ selectedProvider.description }}</p>
          <div v-if="selectedProvider.tags?.length" class="lux-tag-row">
            <span v-for="tag in selectedProvider.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </section>
    </div>

    <section v-if="profileMedia.length" class="lux-profile-album">
      <div class="lux-profile-album-head">
        <h2>รูปภาพและวิดีโอ</h2>
        <div class="lux-profile-album-tabs" role="tablist" aria-label="กรองสื่อ">
          <button type="button" :class="{ active: galleryFilter === 'all' }" @click="galleryFilter = 'all'">ทั้งหมด {{ profileMedia.length }}</button>
          <button type="button" :class="{ active: galleryFilter === 'image' }" @click="galleryFilter = 'image'">รูปภาพ {{ imageCount }}</button>
          <button type="button" :class="{ active: galleryFilter === 'video' }" @click="galleryFilter = 'video'">วิดีโอ {{ videoCount }}</button>
        </div>
      </div>
      <div class="lux-profile-rail">
        <button
          v-if="canScrollThumbsPrev"
          type="button"
          class="lux-profile-rail-nav previous"
          aria-label="เลื่อนรูปไปทางซ้าย"
          @click="scrollThumbs(-1)"
        >
          <AppIcon name="arrow-left" />
        </button>
        <div ref="thumbRail" class="lux-profile-thumbs">
          <button
            v-for="media in filteredGallery"
            :key="media.id"
            type="button"
            class="lux-profile-thumb"
            :class="{ active: mediaIndex(media) === heroIndex }"
            :aria-label="`ดู${media.type === 'image' ? 'รูปภาพ' : 'วิดีโอ'} ${media.name}`"
            @click="selectHero(media)"
          >
            <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" loading="lazy" />
            <template v-else>
              <video :src="media.url" preload="metadata" playsinline :aria-label="media.name"></video>
              <span class="lux-profile-thumb-play" aria-hidden="true"><AppIcon name="play" /></span>
            </template>
          </button>
        </div>
        <button
          v-if="canScrollThumbsNext"
          type="button"
          class="lux-profile-rail-nav next"
          aria-label="เลื่อนรูปไปทางขวา"
          @click="scrollThumbs(1)"
        >
          <AppIcon name="arrow-right" />
        </button>
      </div>
    </section>

    <div class="lux-profile-section lux-review-section">
      <div class="lux-section-title">
        <div><h2>ประสบการณ์จากนักท่องเที่ยว</h2></div>
        <span v-if="reviewSummary">บริการ {{ reviewSummary.service }} <AppIcon name="star" /> · คุ้มค่าเงิน {{ reviewSummary.value }} <AppIcon name="star" /> · {{ reviewSummary.count }} รีวิว</span>
        <span v-else>ยังไม่มีรีวิว</span>
      </div>
      <form v-if="can('review:create') && availableReviewBookings.length" class="lux-review-form" @submit.prevent="submitReview">
        <h3>เขียนรีวิวหลังใช้บริการ</h3>
        <label class="lux-form-label">นัดหมายที่เสร็จสิ้น<select v-model="reviewForm.bookingId" required><option v-for="item in availableReviewBookings" :key="item.id" :value="item.id">{{ item.service }} · {{ formatDate(item.date) }}</option></select></label>
        <div class="lux-review-ratings">
          <div v-for="rating in [{ key: 'serviceRating', label: 'บริการ' }, { key: 'valueRating', label: 'คุ้มค่าเงิน' }]" :key="rating.key" class="lux-review-rating">
            <span>{{ rating.label }}</span>
            <div role="group" :aria-label="`ให้คะแนน${rating.label}`">
              <button v-for="star in 5" :key="star" type="button" :class="{ active: star <= reviewForm[rating.key] }" :aria-label="`${star} ดาว`" :aria-pressed="reviewForm[rating.key] === star" @click="reviewForm[rating.key] = star"><AppIcon name="star" /></button>
            </div>
          </div>
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

    <a
      v-if="profileChat && !currentViewerMedia"
      class="lux-profile-chat-float"
      :class="`is-${profileChat.kind}`"
      :href="profileChat.href"
      target="_blank"
      rel="noopener noreferrer"
    >{{ profileChat.label }}</a>

    <div
      v-if="currentViewerMedia"
      class="lux-media-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="ตัวแสดงภาพและวิดีโอ"
      tabindex="-1"
      @click.self="closeMediaViewer"
      @touchstart.passive="onViewerTouchStart"
      @touchend="onViewerTouchEnd"
    >
      <button class="lux-media-viewer-close" type="button" aria-label="ปิดภาพขยาย" @click="closeMediaViewer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
      <button v-if="viewerMedia.length > 1" class="lux-media-viewer-arrow previous" type="button" aria-label="สื่อก่อนหน้า" @click="changeViewerMedia(-1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="lux-media-viewer-stage">
        <img v-if="currentViewerMedia.type === 'image'" :src="currentViewerMedia.url" :alt="currentViewerMedia.name" draggable="false" />
        <video v-else :src="currentViewerMedia.url" controls autoplay playsinline></video>
        <span>{{ viewerIndex + 1 }} / {{ viewerMedia.length }}</span>
        <small v-if="viewerMedia.length > 1" class="lux-media-viewer-hint">ปัดซ้ายหรือขวาเพื่อเปลี่ยนรูป</small>
      </div>
      <button v-if="viewerMedia.length > 1" class="lux-media-viewer-arrow next" type="button" aria-label="สื่อถัดไป" @click="changeViewerMedia(1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
  </main>
</template>
