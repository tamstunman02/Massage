<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-page lux-membership-page">
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
</template>
