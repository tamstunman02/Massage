<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, onViewerTouchStart, onViewerTouchEnd, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()

let promoPointerX = 0
let promoPointerY = 0
let promoScrollLeft = 0
let promoDidDrag = false

function onPromoPointerDown(event) {
  const grid = event.currentTarget.closest('.lux-promo-grid')
  promoPointerX = event.clientX
  promoPointerY = event.clientY
  promoScrollLeft = grid?.scrollLeft ?? 0
  promoDidDrag = false
}

function onPromoPointerMove(event) {
  if (promoDidDrag) return
  const dx = Math.abs(event.clientX - promoPointerX)
  const dy = Math.abs(event.clientY - promoPointerY)
  if (dx > 10 || dy > 10) promoDidDrag = true
}

function onPromoActivate(index, event) {
  const grid = event?.currentTarget?.closest?.('.lux-promo-grid')
  const scrolled = Math.abs((grid?.scrollLeft ?? 0) - promoScrollLeft) > 6
  if (promoDidDrag || scrolled) return
  openMediaViewer(selectedProvider.value.media, index)
}
</script>

<template>
    <main class="lux-page lux-profile-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><button v-if="currentRole === 'admin'" @click="adminTab = 'providers'; navigate('admin')">พาร์ตเนอร์</button><button v-else @click="navigate('search')">ค้นหาบริการ</button><span>/</span><span>{{ selectedProvider.name }}</span></div>
      <div class="lux-profile-layout"><section class="lux-profile-main"><div class="lux-profile-identity"><div class="lux-profile-monogram" :class="[selectedProvider.visual, { 'has-profile-image': featuredProfileImage }]"><img v-if="featuredProfileImage" :src="featuredProfileImage.url" :alt="`รูปโปรไฟล์ ${selectedProvider.name}`" /><span v-else>{{ selectedProvider.initials }}</span></div><div class="lux-profile-title"><div class="lux-profile-label"><span v-if="reviewSummary"><AppIcon name="star" /> {{ reviewSummary.service }} / 5 <small>({{ reviewSummary.count }} รีวิว)</small></span><span v-else>ยังไม่มีคะแนนรีวิว</span></div><h1>{{ selectedProvider.name }}<small>, {{ selectedProvider.age }}</small></h1><p>ผู้ให้บริการอิสระ · {{ selectedProvider.area }}, {{ selectedProvider.province }}</p></div><button type="button" class="lux-heart lux-profile-share" aria-label="แชร์โปรไฟล์" @click="shareProviderProfile(selectedProvider)"><AppIcon name="share" /></button><button class="lux-heart lux-profile-heart" :class="{ loved: favorites.includes(selectedProvider.id) }" :aria-label="favorites.includes(selectedProvider.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'" @click="toggleFavorite(selectedProvider)"><AppIcon name="heart" /></button></div>
          <div v-if="selectedProvider.media?.length" class="lux-profile-section lux-promo-gallery">
            <div class="lux-section-title">
              <div>
                <div class="lux-kicker"><span></span> PROVIDER MOMENTS</div>
                <h2>ภาพและวิดีโอแนะนำโปรไฟล์</h2>
              </div>
              <span>{{ selectedProvider.media.length }} รายการ · ปัดเพื่อเลื่อน · แตะเพื่อขยาย</span>
            </div>
            <div class="lux-promo-grid">
              <button
                v-for="(media, index) in selectedProvider.media"
                :key="media.id"
                class="lux-promo-item"
                type="button"
                :aria-label="`ขยาย${media.type === 'image' ? 'รูปภาพ' : 'วิดีโอ'} ${media.name}`"
                @pointerdown="onPromoPointerDown"
                @pointermove="onPromoPointerMove"
                @pointerup="onPromoActivate(index, $event)"
                @pointercancel="promoDidDrag = true"
                @keydown.enter.prevent="openMediaViewer(selectedProvider.media, index)"
                @keydown.space.prevent="openMediaViewer(selectedProvider.media, index)"
              >
                <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" loading="lazy" draggable="false" />
                <template v-else>
                  <video :src="media.url" preload="metadata" playsinline :aria-label="media.name"></video>
                  <span class="lux-promo-play" aria-hidden="true"><AppIcon name="play" /></span>
                </template>
              </button>
            </div>
          </div>
          <div class="lux-profile-section"><h2>คุยรายละเอียดและ<span>ขอบเขตให้ชัดเจน</span></h2><p class="lux-provider-about-copy">{{ selectedProvider.description }}</p><p class="lux-provider-about-guidance">ไม่มีการจองผ่านเว็บ · ติดต่อผู้ให้บริการผ่าน LINE หรือ Facebook แล้วตกลงเวลา สถานที่ ราคา และขอบเขตกันเอง</p><div class="lux-tag-row"><span v-for="tag in selectedProvider.tags" :key="tag">{{ tag }}</span></div><div v-if="providerLineUrl(selectedProvider) || providerFacebookUrl(selectedProvider)" class="lux-provider-contacts"><span class="lux-provider-contacts-label">ช่องทางติดต่อ</span><div class="lux-provider-contact-actions"><a v-if="providerLineUrl(selectedProvider)" class="lux-contact-btn lux-contact-line" :href="providerLineUrl(selectedProvider)" target="_blank" rel="noopener noreferrer"><i>LINE</i><span>{{ selectedProvider.line }}</span></a><a v-if="providerFacebookUrl(selectedProvider)" class="lux-contact-btn lux-contact-facebook" :href="providerFacebookUrl(selectedProvider)" target="_blank" rel="noopener noreferrer"><i>Facebook</i><span>เปิดโปรไฟล์</span></a></div></div></div>
          <div class="lux-profile-section lux-review-section">
            <div class="lux-section-title"><div><h2>ประสบการณ์จากนักท่องเที่ยว</h2></div><span v-if="reviewSummary">บริการ {{ reviewSummary.service }} <AppIcon name="star" /> · คุ้มค่าเงิน {{ reviewSummary.value }} <AppIcon name="star" /> · {{ reviewSummary.count }} รีวิว</span><span v-else>ยังไม่มีรีวิว</span></div>
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
                  <div class="lux-appointment-option-meta">
                    <span>{{ service.duration }}</span>
                    <strong class="lux-service-price">฿{{ Number(service.price).toLocaleString() }}</strong>
                  </div>
                  <p>{{ service.description }}</p>
                </div>
              </div>
            </article>
          </div>
          <p class="lux-appointments-contact-note">ไม่มีการจองผ่านเว็บ · ตกลงรายละเอียดและชำระเงินกับผู้ให้บริการเอง</p>
        </aside>
      </div>
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
