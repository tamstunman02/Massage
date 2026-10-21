<script setup>
import PartnerMediaManager from '../components/PartnerMediaManager.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, renameSellerMedia, replaceSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-page lux-seller-page">
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
      <form v-else :key="'seller-profile'" class="lux-seller-panel lux-seller-profile" novalidate @submit.prevent="saveSellerProfile"><div class="lux-seller-panel-head"><div><h2>โปรไฟล์และบริการ</h2><p>ข้อมูลนี้จะแสดงในหน้าค้นหาหลังผ่านการตรวจสอบ</p></div></div><div v-if="sellerSaveAlert" id="seller-save-alert" class="lux-seller-save-alert" :class="{ ok: sellerSaveAlert === 'บันทึกข้อมูลบริการแล้ว' }" role="alert">{{ sellerSaveAlert }}</div><div class="lux-membership-fields"><label class="lux-form-label">ชื่อที่ใช้แสดง<input v-model.trim="sellerProvider.name" maxlength="40" required /></label><label class="lux-form-label">จังหวัด<select v-model="sellerProvider.province" required><option v-for="province in provinces" :key="province">{{ province }}</option></select></label><label class="lux-form-label">ราคาเริ่มต้นต่อชั่วโมง<input v-model.number="sellerProvider.price" type="number" inputmode="numeric" min="1" step="1" required /></label><label class="lux-form-label">อายุ<input v-model.number="sellerProvider.age" type="number" inputmode="numeric" min="18" max="100" step="1" required /></label><label class="lux-form-label">ส่วนสูง (ซม.)<input v-model.number="sellerProvider.heightCm" type="number" inputmode="numeric" min="120" max="230" step="1" required /></label><label class="lux-form-label">น้ำหนัก (กก.)<input v-model.number="sellerProvider.weightKg" type="number" inputmode="numeric" min="30" max="250" step="1" required /></label><label class="lux-form-label">สัดส่วน<input v-model.trim="sellerProvider.measurements" maxlength="80" placeholder="เช่น 34-24-36 นิ้ว" required /></label><label class="lux-form-label">สถานที่ให้บริการ<input v-model.trim="sellerProvider.venue" maxlength="100" required /></label><label class="lux-form-label">LINE ID<input v-model.trim="sellerProvider.line" maxlength="80" placeholder="เช่น mali.relax" /></label><label class="lux-form-label">ลิงก์ Facebook<input v-model.trim="sellerProvider.facebook" maxlength="300" type="text" inputmode="url" placeholder="https://facebook.com/yourpage" /></label><label class="lux-form-label lux-membership-wide">รายละเอียดบริการ<textarea v-model="sellerProvider.description" rows="5" maxlength="300" placeholder="เขียนรายละเอียดได้หลายบรรทัด และใส่อิโมจิได้ ✨&#10;เช่น 🌿 จุดเด่นหรือบรรยากาศบริการ&#10;🕒 เวลาที่ให้บริการ" required></textarea></label></div><section class="lux-seller-services" aria-labelledby="seller-services-heading"><div class="lux-seller-panel-head"><div><h2 id="seller-services-heading">รูปแบบและราคา</h2><p>เพิ่มรายการบริการพร้อมชื่อ ระยะเวลา รายละเอียด และราคา (แสดงบนโปรไฟล์เท่านั้น ไม่มีการจองผ่านเว็บ)</p></div><button class="lux-button lux-button-light" type="button" :disabled="sellerProvider.services.length >= 30" @click="addSellerService">＋ เพิ่มรูปแบบ</button></div><article v-for="(service, index) in sellerProvider.services" :key="index" class="lux-seller-service-row"><div class="lux-seller-service-heading"><strong>รูปแบบที่ {{ index + 1 }}</strong><button type="button" :disabled="sellerProvider.services.length <= 1" @click="removeSellerService(index)">ลบ</button></div><label class="lux-form-label">ชื่อรูปแบบ<input v-model.trim="service.name" maxlength="60" placeholder="เช่น พบปะพูดคุย ✨" required /></label><div class="lux-seller-service-fields"><label class="lux-form-label">ระยะเวลา<input v-model.trim="service.duration" maxlength="40" placeholder="เช่น 60 นาที" required /></label><label class="lux-form-label">ราคา (บาท)<input v-model.number="service.price" type="number" inputmode="numeric" min="1" max="1000000" step="1" required /></label></div><label class="lux-form-label">รายละเอียด<textarea v-model.trim="service.description" maxlength="200" rows="4" placeholder="ใส่รายละเอียดได้หลายบรรทัด และใช้อิโมจิได้ ✨&#10;เช่น 🌿 นัดพบในบรรยากาศสบาย ๆ" required></textarea></label></article></section><PartnerMediaManager :provider="sellerProvider" @add="addSellerMedia" @remove="removeSellerMedia" @rename="renameSellerMedia" @replace="replaceSellerMedia" /><div v-if="sellerSaveAlert" class="lux-seller-save-alert" :class="{ ok: sellerSaveAlert === 'บันทึกข้อมูลบริการแล้ว' }" role="alert">{{ sellerSaveAlert }}</div><button class="lux-button lux-button-primary" type="button" @click="saveSellerProfile">บันทึกข้อมูลบริการ ↗</button></form>
      </Transition>
    </main>
</template>
