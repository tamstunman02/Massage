<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-home">
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
</template>
