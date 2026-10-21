<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-page lux-search-page">
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
</template>
