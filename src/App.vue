<script setup>
import { useApp } from './app/useApp.js'
import AppIcon from './components/AppIcon.vue'
import HomePage from './pages/HomePage.vue'
import SearchPage from './pages/SearchPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import BookingPage from './pages/BookingPage.vue'
import LoginPage from './pages/LoginPage.vue'
import MembershipPage from './pages/MembershipPage.vue'
import SeekPage from './pages/SeekPage.vue'
import AccountPage from './pages/AccountPage.vue'
import ApplyPage from './pages/ApplyPage.vue'
import AdminPage from './pages/AdminPage.vue'
import DesignPage from './pages/DesignPage.vue'
import SellerPage from './pages/SellerPage.vue'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
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
    <HomePage v-if="view === 'home'" key="home" />
    <SearchPage v-else-if="view === 'search'" key="search" />
    <ProfilePage v-else-if="view === 'profile' && selectedProvider" key="profile" />
    <BookingPage v-else-if="view === 'booking'" key="booking" />
    <LoginPage v-else-if="view === 'login'" key="login" />
    <MembershipPage v-else-if="view === 'membership'" key="membership" />
    <SeekPage v-else-if="view === 'seek'" key="seek" />
    <AccountPage v-else-if="view === 'account'" key="account" />
    <ApplyPage v-else-if="view === 'apply'" key="apply" />
    <AdminPage v-else-if="view === 'admin'" key="admin" />
    <DesignPage v-else-if="view === 'design'" key="design" />
    <SellerPage v-else-if="view === 'seller' && sellerProvider" key="seller" />
    </Transition>

    <footer class="lux-footer"><div class="lux-footer-main"><div class="lux-logo"><span class="lux-logo-symbol">N</span><span class="lux-logo-word">NuaNia<span>.</span><small>CONNECT ON YOUR TERMS</small></span></div><p>นัวเนีย รวมเด็กเอ็น เด็กเอนเตอร์เทรน<br />ทั่วประเทศไทย · ไม่จองผ่านเว็บ</p><div class="lux-footer-links"><button @click="navigate('search')">ค้นหาผู้ให้บริการ</button><button v-if="currentUser" @click="openOwnArea">{{ accountMenuLabel }}</button><button v-else @click="navigate('login')">เข้าสู่ระบบ</button><button v-if="!currentUser" @click="navigate('apply')">ลงโปรไฟล์ผู้ให้บริการ</button></div><div class="lux-footer-contact"><span>NEED SUPPORT?</span><strong>ติดต่อ NuaNia ได้ที่</strong><a class="lux-footer-line" :href="ownerLineUrl" target="_blank" rel="noopener noreferrer">LINE {{ ownerLineLabel }} <AppIcon name="arrow-right" /></a></div></div><div class="lux-footer-bottom"><span>© 2026 NUANIA · INDEPENDENT PROVIDER PLATFORM</span><span>ความเป็นส่วนตัว　 ข้อกำหนดการใช้บริการ</span><span>THAILAND · CONNECT WITH CARE</span></div></footer>

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
