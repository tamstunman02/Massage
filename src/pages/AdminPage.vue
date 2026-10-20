<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-page lux-admin-page"><div class="lux-admin-top"><div><div class="lux-kicker"><span></span> NUANIA ADMINISTRATION</div><h1>ภาพรวม<span>แพลตฟอร์ม</span></h1><p>จัดการพาร์ตเนอร์ อนุมัติหลังชำระนอกระบบ และตั้งวันหมดอายุสมาชิก</p></div><span class="lux-admin-status"><AppIcon name="circle" /> LISTING ONLY · ไม่มีจองผ่านเว็บ</span></div><div class="lux-admin-tabs"><button v-for="tab in [{id:'overview', label:'ภาพรวม'}, {id:'providers', label:'พาร์ตเนอร์'}, {id:'applications', label:'ใบสมัคร'}, {id:'travelers', label:'นักท่องเที่ยว'}]" :key="tab.id" :class="{ active: adminTab === tab.id }" @click="adminTab = tab.id">{{ tab.label }} <small v-if="tab.id === 'applications' && applications.length">{{ applications.length }}</small></button></div>
      <Transition name="lux-panel" mode="out-in">
      <div :key="adminTab" class="lux-admin-tab-body">
      <template v-if="adminTab === 'overview'"><div class="lux-admin-metrics"><article><span>พาร์ตเนอร์ที่เผยแพร่</span><strong>{{ activeProviderCount }}</strong><small>active + สมาชิกยังไม่หมดอายุ</small></article><article><span>พาร์ตเนอร์ทั้งหมด</span><strong>{{ providers.length }}</strong><small>รวมที่ซ่อน / หมดอายุ</small></article><article><span>รายได้ค่าสมาชิก</span><strong>฿{{ (activeProviderCount * 299).toLocaleString() }}</strong><small>ชำระนอกระบบ · {{ activeProviderCount }} รายที่เผยแพร่</small></article><article><span>กำลังรอตรวจสอบ</span><strong>{{ applications.length }}</strong><small><i>ใบสมัครพาร์ตเนอร์ใหม่</i></small></article></div><div class="lux-admin-overview-grid"><section class="lux-admin-panel"><div class="lux-admin-panel-head"><div><h2>ระบบลงประกาศเท่านั้น</h2><p>ไม่มีการจองผ่านเว็บ · นักท่องเที่ยวติดต่อผู้ขายเอง</p></div><button @click="adminTab = 'providers'">จัดการพาร์ตเนอร์ <AppIcon name="arrow-right" /></button></div><div class="lux-empty" style="padding:28px 16px"><span><AppIcon name="circle-info" /></span><h3>อนุมัติหลังรับชำระนอกระบบ</h3><p>ตั้งวันหมดอายุสมาชิกเมื่ออนุมัติใบสมัคร หรือแก้ได้ในแท็บพาร์ตเนอร์</p></div></section><aside class="lux-admin-panel lux-admin-side-panel"><div class="lux-admin-panel-head"><div><h2>รอตรวจสอบ</h2><p>ใบสมัครพาร์ตเนอร์</p></div><span>{{ applications.length }}</span></div><label v-if="applications.length" class="lux-admin-expiry-field"><span>วันหมดอายุเมื่ออนุมัติ</span><input v-model="adminApproveExpiresAt" type="datetime-local" /></label><div v-if="applications.length" class="lux-pending-list"><div v-for="item in applications.slice(0, 4)" :key="item.id"><img v-if="item.profilePhotoUrl" class="lux-pending-avatar lux-pending-photo" :src="item.profilePhotoUrl" :alt="item.name" /><span v-else class="lux-pending-avatar">{{ item.name.slice(0, 1) }}</span><div><strong>{{ item.name }}</strong><small>{{ item.province }} · {{ item.line }}</small><small class="lux-email-status" :class="item.emailVerified === true ? 'is-active' : item.emailVerified === false ? 'is-pending' : 'is-unknown'">{{ item.emailVerified === true ? 'อีเมลยืนยันแล้ว' : item.emailVerified === false ? 'ยังไม่ยืนยันอีเมล' : 'ไม่มีบัญชี' }}</small><small class="lux-email-status" :class="item.hasProfilePhoto ? 'is-active' : 'is-pending'">{{ item.hasProfilePhoto ? 'มีรูปโปรไฟล์' : 'ยังไม่มีรูป' }}</small></div><button :disabled="!item.hasProfilePhoto" @click="approveApplication(item)">{{ item.hasProfilePhoto ? 'อนุมัติ' : 'รอรูป' }}</button></div></div><div v-else class="lux-admin-no-pending"><span><AppIcon name="check" /></span><strong>ไม่มีรายการค้าง</strong><small>ใบสมัครใหม่จะแสดงที่นี่</small></div></aside></div></template>
      <section v-else-if="adminTab !== 'travelers'" class="lux-admin-panel lux-admin-detail-panel">
        <div class="lux-admin-panel-head">
          <div>
            <h2>{{ adminTab === 'providers' ? 'พาร์ตเนอร์ทั้งหมด' : 'ใบสมัครพาร์ตเนอร์' }}</h2>
            <p>{{ adminTab === 'providers' ? 'ตั้งสถานะเผยแพร่ สมาชิก และวันหมดอายุหลังรับชำระนอกระบบ' : 'อนุมัติหลังรับชำระแล้ว · ต้องระบุวันหมดอายุสมาชิก' }}</p>
          </div>
          <span>{{ adminTab === 'providers' ? (filteredAdminProviders.length + ' / ' + providers.length) : applications.length }} รายการ</span>
        </div>
        <div v-if="adminTab === 'providers'" class="lux-admin-provider-filters">
          <label><span>ค้นหาชื่อ</span><input v-model="adminProviderSearch" type="search" placeholder="พิมพ์ชื่อพาร์ตเนอร์" /></label>
          <label><span>จังหวัด</span><select v-model="adminProviderProvince"><option value="">เลือกจังหวัด</option><option v-for="province in provinces" :key="province">{{ province }}</option></select></label>
          <label><span>เพศ</span><select v-model="adminProviderGender"><option value="">ทุกเพศ</option><option v-for="gender in adminProviderGenders" :key="gender">{{ gender }}</option></select></label>
          <button type="button" @click="adminProviderSearch = ''; adminProviderProvince = ''; adminProviderGender = ''">ล้างตัวกรอง</button>
        </div>
        <div v-if="adminTab === 'providers' && filteredAdminProviders.length" class="lux-admin-table-wrap">
          <table class="lux-admin-table">
            <thead><tr><th>พาร์ตเนอร์</th><th>พื้นที่ให้บริการ</th><th>สมาชิก</th><th>หมดอายุ</th><th>โปรไฟล์</th><th>จัดการ</th></tr></thead>
            <tbody>
              <tr v-for="provider in paginatedAdminProviders" :key="provider.id">
                <td>
                  <div class="lux-admin-provider">
                    <img v-if="providerPreviewMedia(provider)?.type === 'image'" :src="providerPreviewMedia(provider).url" :alt="'ภาพโปรไฟล์ ' + provider.name" loading="lazy" />
                    <video v-else-if="providerPreviewMedia(provider)" :src="providerPreviewMedia(provider).url" muted playsinline preload="metadata" :aria-label="'วิดีโอโปรไฟล์ ' + provider.name"></video>
                    <span v-else class="lux-admin-provider-placeholder">{{ provider.initials }}</span>
                    <div><strong>{{ provider.name }} · {{ provider.category }}</strong><small>LINE {{ provider.line }}</small></div>
                  </div>
                </td>
                <td>{{ provider.area }}, {{ provider.province }}</td>
                <td><button class="lux-admin-action" @click="setProviderStatus(provider, 'membershipActive')">{{ provider.membershipActive ? 'สมาชิกใช้งาน' : 'หมดอายุ' }}</button></td>
                <td>
                  <label class="lux-admin-expiry-inline">
                    <input type="datetime-local" :value="toDatetimeLocalValue(provider.membershipExpiresAt)" @change="saveProviderExpiry(provider, $event)" />
                    <small>{{ provider.membershipExpiresAt ? formatDateTime(provider.membershipExpiresAt) : 'ยังไม่ตั้ง' }}</small>
                  </label>
                </td>
                <td><button class="lux-admin-action" @click="setProviderStatus(provider, 'active')">{{ provider.active ? 'เผยแพร่' : 'ซ่อน' }}</button></td>
                <td>
                  <button type="button" class="lux-admin-action" @click="openProfile(provider)">ดูรายละเอียด</button>
                  <button v-if="can('user:delete')" type="button" class="lux-admin-action reject" @click="deleteAdminProviderAccount(provider)">ลบบัญชี</button>
                </td>
              </tr>
            </tbody>
          </table>
          <nav v-if="adminProviderPageCount > 1" class="lux-admin-pagination" aria-label="หน้าพาร์ตเนอร์">
            <button type="button" :disabled="adminProviderPage === 1" @click="adminProviderPage--">ก่อนหน้า</button>
            <span>หน้า {{ adminProviderPage }} / {{ adminProviderPageCount }}</span>
            <button type="button" :disabled="adminProviderPage === adminProviderPageCount" @click="adminProviderPage++">ถัดไป</button>
          </nav>
        </div>
        <div v-else-if="adminTab === 'providers'" class="lux-admin-provider-empty">ไม่พบพาร์ตเนอร์ตามเงื่อนไขที่เลือก</div>
        <template v-else>
          <label class="lux-admin-expiry-field"><span>วันและเวลาหมดอายุเมื่ออนุมัติ</span><input v-model="adminApproveExpiresAt" type="datetime-local" required /></label>
          <div v-if="applications.length" class="lux-admin-table-wrap">
            <table class="lux-admin-table">
              <thead><tr><th>รูป</th><th>ผู้สมัคร</th><th>อีเมล</th><th>สถานะอีเมล</th><th>รูปโปรไฟล์</th><th>จังหวัด</th><th>อัตลักษณ์</th><th>บริการ</th><th>LINE ID</th><th>จัดการ</th></tr></thead>
              <tbody>
                <tr v-for="item in applications" :key="item.id">
                  <td>
                    <img v-if="item.profilePhotoUrl" class="lux-admin-app-photo" :src="item.profilePhotoUrl" :alt="'รูปโปรไฟล์ ' + item.name" loading="lazy" />
                    <span v-else class="lux-admin-app-photo is-empty">ไม่มีรูป</span>
                  </td>
                  <td><strong>{{ item.name }}</strong></td>
                  <td>{{ item.email || '—' }}</td>
                  <td>
                    <span class="lux-email-status" :class="item.emailVerified === true ? 'is-active' : item.emailVerified === false ? 'is-pending' : 'is-unknown'">
                      {{ item.emailVerified === true ? 'ยืนยันแล้ว' : item.emailVerified === false ? 'ยังไม่ยืนยัน' : 'ไม่มีบัญชี' }}
                    </span>
                  </td>
                  <td>
                    <span class="lux-email-status" :class="item.hasProfilePhoto ? 'is-active' : 'is-pending'">
                      {{ item.hasProfilePhoto ? 'พร้อมตรวจ' : 'ยังไม่มีรูป' }}
                    </span>
                  </td>
                  <td>{{ item.province }}</td>
                  <td>{{ item.gender }}</td>
                  <td>{{ item.service }}</td>
                  <td>{{ item.line }}</td>
                  <td>
                    <button class="lux-admin-action" type="button" :disabled="!item.hasProfilePhoto" @click="approveApplication(item)">{{ item.hasProfilePhoto ? 'อนุมัติ' : 'รอรูป' }}</button>
                    <button class="lux-admin-action reject" type="button" @click="rejectApplication(item)">ปฏิเสธ</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="lux-admin-no-pending"><span><AppIcon name="check" /></span><strong>ไม่มีใบสมัครค้างตรวจสอบ</strong></div>
        </template>
      </section>
      <section v-else class="lux-admin-panel lux-admin-detail-panel">
        <div class="lux-admin-panel-head">
          <div><h2>{{ selectedTraveler ? `ข้อมูลนักท่องเที่ยว: ${selectedTraveler.traveler.name}` : 'นักท่องเที่ยวทั้งหมด' }}</h2><p>{{ selectedTraveler ? 'ข้อมูลบัญชีและประวัติการใช้งาน' : 'ค้นหาและเปิดดูข้อมูลบัญชี รายการโปรด และรีวิว' }}</p></div>
          <button v-if="selectedTraveler" type="button" @click="selectedTraveler = null"><AppIcon name="arrow-left" /> กลับไปยังรายชื่อ</button>
          <span v-else>{{ filteredAdminTravelers.length }} บัญชี</span>
        </div>
        <template v-if="selectedTraveler">
          <div class="lux-admin-traveler-info">
            <article><span>ชื่อที่ใช้แสดง</span><strong>{{ selectedTraveler.traveler.name }}</strong></article>
            <article><span>อีเมล</span><strong>{{ selectedTraveler.traveler.email }}</strong></article>
            <article><span>สถานะอีเมล</span><strong><span class="lux-email-status" :class="selectedTraveler.traveler.emailVerified ? 'is-active' : 'is-pending'">{{ selectedTraveler.traveler.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}</span></strong></article>
            <article><span>เบอร์โทรศัพท์</span><strong>{{ selectedTraveler.traveler.phone || 'ไม่ระบุ' }}</strong></article>
            <article><span>วันที่สมัคร</span><strong>{{ formatDateTime(selectedTraveler.traveler.createdAt) }}</strong></article>
          </div>
          <div v-if="can('user:delete')" class="lux-admin-traveler-actions">
            <button type="button" class="lux-admin-action reject" @click="deleteAdminTraveler(selectedTraveler.traveler)">ลบบัญชีนักท่องเที่ยว</button>
          </div>
          <section class="lux-admin-traveler-section">
            <h3>รายการโปรด ({{ selectedTraveler.favorites.length }})</h3>
            <ul v-if="selectedTraveler.favorites.length" class="lux-admin-traveler-favorites"><li v-for="provider in selectedTraveler.favorites" :key="provider.id">{{ provider.name }} <span>· {{ provider.province }}</span></li></ul>
            <p v-else class="lux-admin-traveler-empty">ไม่มีรายการโปรด</p>
          </section>
          <section class="lux-admin-traveler-section">
            <h3>รีวิวที่เขียน ({{ selectedTraveler.reviews.length }})</h3>
            <article v-for="review in selectedTraveler.reviews" :key="review.id" class="lux-admin-traveler-review"><div><strong>{{ review.provider }}</strong><span>บริการ {{ review.serviceRating }} <AppIcon name="star" /> · ความคุ้มค่า {{ review.valueRating }} <AppIcon name="star" /> · {{ formatDateTime(review.createdAt) }}</span></div><p>{{ review.comment }}</p><div v-if="review.media.length" class="lux-admin-traveler-review-media"><img v-for="media in review.media" :key="media.id" :src="media.url" :alt="media.name" loading="lazy" /></div></article>
            <p v-if="!selectedTraveler.reviews.length" class="lux-admin-traveler-empty">ยังไม่มีรีวิว</p>
          </section>
        </template>
        <div v-else class="lux-admin-traveler-list">
          <label class="lux-admin-traveler-search"><span>ค้นหาชื่อ อีเมล หรือเบอร์โทรศัพท์</span><input v-model="adminTravelerSearch" type="search" placeholder="พิมพ์ข้อมูลที่ต้องการค้นหา" /></label>
          <div v-if="filteredAdminTravelers.length" class="lux-admin-table-wrap"><table class="lux-admin-table"><thead><tr><th>ชื่อที่ใช้แสดง</th><th>อีเมล</th><th>สถานะอีเมล</th><th>เบอร์โทรศัพท์</th><th>วันที่สมัคร</th><th>จัดการ</th></tr></thead><tbody><tr v-for="traveler in filteredAdminTravelers" :key="traveler.id"><td><strong>{{ traveler.name }}</strong></td><td>{{ traveler.email }}</td><td><span class="lux-email-status" :class="traveler.emailVerified ? 'is-active' : 'is-pending'">{{ traveler.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}</span></td><td>{{ traveler.phone || 'ไม่ระบุ' }}</td><td>{{ formatDateTime(traveler.createdAt) }}</td><td><button type="button" class="lux-admin-action" :disabled="isAdminTravelerLoading" @click="openAdminTraveler(traveler)">ดูรายละเอียด</button><button v-if="can('user:delete')" type="button" class="lux-admin-action reject" @click="deleteAdminTraveler(traveler)">ลบ</button></td></tr></tbody></table></div>
          <p v-else class="lux-admin-traveler-empty">ไม่พบนักท่องเที่ยว</p>
        </div>
      </section>
      </div>
      </Transition>
</main>
</template>
