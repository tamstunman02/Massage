<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-page lux-apply-page">
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
</template>
