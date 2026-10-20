<script setup>
import AppIcon from '../components/AppIcon.vue'
import { useApp } from '../app/useApp.js'
const { clearMembershipErrors, setMembershipError, can, loadSeekPosts, loadData, applyUser, safely, updateScrollEffects, closeSeekDetail, openOwnArea, submitLogin, logout, openAdminTraveler, providerServices, hasAppliedFilters, addSellerMedia, removeSellerMedia, flashSellerAlert, saveSellerProfile, addSellerService, providerLineUrl, providerFacebookUrl, openProviderContact, openOwnerLine, removeSellerService, setProviderStatus, toDatetimeLocalValue, defaultMembershipExpiryLocal, isProviderPubliclyListed, saveProviderExpiry, deleteAdminTraveler, deleteAdminProviderAccount, onAccountButton, navigate, resetSeekForm, openSeekCompose, closeSeekCompose, stopSeekRealtime, stopSeekBoardPolling, refreshSelectedSeekPost, startSeekRealtime, startSeekBoardPolling, openSeekPost, validateSeekForm, submitSeekPost, closeSeekPost, submitSeekComment, startEditSeekComment, cancelEditSeekComment, saveSeekComment, removeSeekComment, applySeekBoardFilter, openSearchFilters, closeSearchFilters, resetSearchFilters, applySearchFilters, clearSearchFilters, searchWithFilters, openSellerArea, openBuyerArea, openProfile, sharedProfileId, profileShareUrl, rememberSharedProfile, clearSharedProfileUrl, openSharedProfileFromUrl, onProfilePopState, shareProviderProfile, openSeekCommentProfile, providerPreviewMedia, providerHasVideo, openMediaViewer, closeMediaViewer, handleViewerKeydown, changeViewerMedia, clearReviewImages, selectReviewImages, loadProviderReviews, loadSellerReviews, submitReview, startBooking, submitBooking, toggleFavorite, submitApplication, clearMembershipProfilePhoto, selectMembershipProfilePhoto, validateMembershipStep, nextMembershipStep, prevMembershipStep, onMembershipFormSubmit, submitMembership, updateSellerBooking, approveApplication, rejectApplication, showNotice, resendVerification, confirmDevVerification, formatDate, formatDateTime, scrollToProviders, OWNER_LINE_ID, ownerLineUrl, ownerLineLabel, provinces, providers, view, searchName, selectedProvince, selectedGender, selectedMode, selectedService, appliedSearchFilters, isSearchFilterOpen, searchFilterInput, searchFilterTrigger, sortBy, selectedProvider, selectedReviews, sellerReviews, reviewableBookingIds, reviewForm, reviewImages, viewerMedia, viewerIndex, profileBookingMode, booking, bookings, applications, application, favorites, notice, sellerSaveAlert, devVerifyLink, bookingReference, isCompactMenuOpen, isAccountMenuOpen, adminTab, adminProviderSearch, adminProviderProvince, adminProviderGender, adminProviderPage, adminProviderPageSize, adminTravelers, adminTravelerSearch, selectedTraveler, isAdminTravelerLoading, accountTab, seekPosts, mySeekPosts, selectedSeekPost, seekBoardFilter, seekForm, seekFormErrors, seekCommentDraft, editingSeekCommentId, editingSeekCommentBody, isSeekSubmitting, seekDetailLoading, isSeekComposeOpen, seekRealtimeConnected, member, activeRole, memberSellerProviderId, membership, membershipStep, showMembershipPassword, showMembershipPasswordConfirm, membershipErrors, membershipPasswordMismatch, membershipSteps, membershipStepMeta, isMembershipLastStep, membershipProfilePhoto, isMembershipSubmitting, sellerDashboardTab, adminApproveExpiresAt, currentUser, loginForm, appRoot, userPermissions, currentRole, roleLabel, currentHomeView, accountMenuLabel, protectedViews, serviceCategories, services, searchHasFilters, activeSearchProvince, searchFilterSummary, providersByProvince, visibleProviders, selectedServiceOption, bookingPrice, featuredProfileImage, currentViewerMedia, availableAppointmentModes, reviewSummary, availableReviewBookings, upcomingBookings, completedBookings, favoriteProviders, filteredAdminProviders, adminProviderGenders, adminProviderPageCount, paginatedAdminProviders, filteredAdminTravelers, activeProviderCount, sellerProvider, sellerBookings, sellerReviewSummary } = useApp()
</script>

<template>
    <main class="lux-page lux-seek-page">
      <div class="lux-breadcrumb"><button @click="navigate('home')">หน้าแรก</button><span>/</span><span>โพสหาผู้ให้บริการ</span></div>
      <div class="lux-seek-heading">
        <div>
          <div class="lux-kicker"><span></span> SEEK BOARD</div>
          <h1>โพสหา<span>ผู้ให้บริการ</span></h1>
          <p>{{ seekBoardFilter.province ? `กำลังดูโพสในจังหวัด${seekBoardFilter.province}` : 'เลือกจังหวัดเพื่อดูโพสของทุกคน · กดปุ่มโพสเมื่อต้องการลงประกาศหา' }}</p>
        </div>
        <span v-if="seekBoardFilter.province" class="lux-province-active" aria-live="polite">
          <span aria-hidden="true"><AppIcon name="location-dot" /></span>
          <small>จังหวัดที่เลือก</small>
          <strong>{{ seekBoardFilter.province }}</strong>
        </span>
      </div>

      <div class="lux-seek-toolbar">
        <label class="lux-seek-filter is-board">
          <span class="lux-seek-filter-icon" aria-hidden="true"><AppIcon name="location-dot" /></span>
          <span class="lux-seek-filter-copy">
            <small>จังหวัด</small>
            <select v-model="seekBoardFilter.province" @change="applySeekBoardFilter">
              <option value="">ทุกจังหวัด</option>
              <option v-for="province in provinces" :key="`seek-${province}`">{{ province }}</option>
            </select>
          </span>
          <span class="lux-seek-filter-chevron" aria-hidden="true"><AppIcon name="chevron-down" /></span>
        </label>
        <div class="lux-seek-toolbar-actions">
          <span class="lux-seek-count">
            {{ seekPosts.length }} โพส
            <template v-if="seekBoardFilter.province"> · {{ seekBoardFilter.province }}</template>
          </span>
          <button v-if="can('seek:create')" type="button" class="lux-button lux-button-primary" @click="openSeekCompose"><AppIcon name="plus" /> โพส</button>
        </div>
      </div>

      <div class="lux-seek-layout" :class="{ 'has-detail': selectedSeekPost }">
        <div class="lux-seek-main">
          <section class="lux-seek-board">
            <div v-if="seekPosts.length" class="lux-seek-list">
              <article v-for="post in seekPosts" :key="post.id" class="lux-seek-card" :class="{ closed: post.status === 'closed', active: selectedSeekPost?.id === post.id, mine: post.isOwner }">
                <button type="button" class="lux-seek-card-main" @click="openSeekPost(post.id)">
                  <div class="lux-seek-card-top">
                    <strong>{{ post.title }}</strong>
                    <span class="lux-seek-status" :class="post.status">{{ post.status === 'open' ? 'เปิดรับ' : 'ปิดรับแล้ว' }}</span>
                  </div>
                  <p v-if="post.description">{{ post.description }}</p>
                  <div class="lux-seek-card-meta">
                    <span>{{ post.isOwner ? 'โพสของฉัน' : post.author?.name }}</span>
                    <span>{{ post.province }}</span>
                    <span v-if="post.venue">ร้าน {{ post.venue }}</span>
                    <span>งบ {{ post.budget }}</span>
                    <span>{{ post.duration }}</span>
                    <span>{{ post.commentCount }} คอมเมนต์</span>
                    <span>{{ formatDateTime(post.createdAt) }}</span>
                  </div>
                </button>
                <button v-if="post.isOwner && post.status === 'open'" type="button" class="lux-seek-close-btn" @click="closeSeekPost(post)">ปิดรับ</button>
              </article>
            </div>
            <div v-else class="lux-empty lux-seek-empty">
              <span><AppIcon name="magnifying-glass" /></span>
              <h3>ยังไม่มีโพส{{ seekBoardFilter.province ? `ใน${seekBoardFilter.province}` : '' }}</h3>
              <p>{{ can('seek:create') ? 'กดปุ่มโพสเพื่อลงประกาศหาผู้ให้บริการ' : 'รอโพสใหม่จากนักท่องเที่ยว หรือลองเปลี่ยนจังหวัด' }}</p>
              <button v-if="can('seek:create')" type="button" class="lux-button lux-button-primary" @click="openSeekCompose"><AppIcon name="plus" /> โพส</button>
            </div>
          </section>
        </div>

        <aside v-if="selectedSeekPost" class="lux-seek-detail">
          <div class="lux-seek-detail-head">
            <button type="button" class="lux-text-link" @click="closeSeekDetail"><AppIcon name="arrow-left" /> ปิดรายละเอียด</button>
            <span class="lux-seek-status" :class="selectedSeekPost.status">{{ selectedSeekPost.status === 'open' ? 'เปิดรับ' : 'ปิดรับแล้ว' }}</span>
          </div>
          <div v-if="seekDetailLoading" class="lux-seek-detail-loading">กำลังโหลดรายละเอียด...</div>
          <template v-else>
            <h2>{{ selectedSeekPost.title }}</h2>
            <div class="lux-seek-detail-facts">
              <div><span>จังหวัด</span><strong>{{ selectedSeekPost.province }}</strong></div>
              <div><span>ร้าน</span><strong>{{ selectedSeekPost.venue || '-' }}</strong></div>
              <div><span>งบประมาณ</span><strong>{{ selectedSeekPost.budget || '-' }}</strong></div>
              <div><span>ระยะเวลา</span><strong>{{ selectedSeekPost.duration || '-' }}</strong></div>
            </div>
            <div class="lux-seek-card-meta">
              <span>{{ selectedSeekPost.author?.name }}</span>
              <span>{{ formatDateTime(selectedSeekPost.createdAt) }}</span>
            </div>
            <p v-if="selectedSeekPost.description" class="lux-seek-detail-body">{{ selectedSeekPost.description }}</p>
            <div v-if="selectedSeekPost.isOwner && selectedSeekPost.status === 'open'" class="lux-seek-detail-actions">
              <button type="button" class="lux-button lux-button-light" @click="closeSeekPost(selectedSeekPost)">ปิดรับเมื่อได้งานแล้ว</button>
            </div>

            <div class="lux-seek-comments">
              <div class="lux-seek-section-head">
                <h3>คอมเมนต์จากผู้ให้บริการ</h3>
                <p class="lux-seek-live-meta">
                  <span class="lux-seek-live" :class="{ on: seekRealtimeConnected }">{{ seekRealtimeConnected ? 'สด' : 'อัปเดตอัตโนมัติ' }}</span>
                  <span>{{ selectedSeekPost.comments?.length || 0 }} รายการ</span>
                </p>
              </div>

              <form v-if="can('seek:comment') && selectedSeekPost.status === 'open'" class="lux-seek-comment-form" @submit.prevent="submitSeekComment">
                <label class="lux-form-label">
                  <span>ตอบโพสนี้</span>
                  <textarea v-model.trim="seekCommentDraft" rows="3" maxlength="1000" placeholder="แนะนำตัว ช่องทางติดต่อ หรือรายละเอียดที่เสนอ"></textarea>
                </label>
                <button class="lux-button lux-button-primary" type="submit">ส่งคอมเมนต์ <AppIcon name="arrow-right" /></button>
              </form>
              <p v-else-if="selectedSeekPost.status !== 'open'" class="lux-seek-closed-note">โพสนี้ปิดรับแล้ว ไม่สามารถคอมเมนต์เพิ่มได้</p>

              <div v-if="selectedSeekPost.comments?.length" class="lux-seek-comment-list">
                <article v-for="comment in selectedSeekPost.comments" :key="comment.id" class="lux-seek-comment">
                  <div class="lux-seek-comment-head">
                    <div class="lux-seek-comment-person">
                      <div class="lux-seek-comment-avatar" aria-hidden="true">
                        <img v-if="comment.author?.photoUrl" :src="comment.author.photoUrl" :alt="comment.author?.providerName || comment.author?.name" />
                        <span v-else>{{ comment.author?.initials || (comment.author?.providerName || comment.author?.name || 'ผ').slice(0, 1) }}</span>
                      </div>
                      <div>
                        <strong>{{ comment.author?.providerName || comment.author?.name }}</strong>
                        <span>{{ comment.author?.province || 'ผู้ให้บริการ' }} · {{ formatDateTime(comment.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="lux-seek-comment-actions">
                      <button v-if="comment.author?.providerId" type="button" class="lux-seek-view-btn" @click="openSeekCommentProfile(comment)">ดูข้อมูล</button>
                      <template v-if="comment.canEdit">
                        <button type="button" @click="startEditSeekComment(comment)">แก้ไข</button>
                        <button type="button" class="is-danger" @click="removeSeekComment(comment)">ลบ</button>
                      </template>
                    </div>
                  </div>
                  <template v-if="editingSeekCommentId === comment.id">
                    <textarea v-model.trim="editingSeekCommentBody" rows="3" maxlength="1000"></textarea>
                    <div class="lux-seek-comment-edit-actions">
                      <button type="button" class="lux-button lux-button-primary" @click="saveSeekComment(comment)">บันทึก</button>
                      <button type="button" class="lux-button lux-button-light" @click="cancelEditSeekComment">ยกเลิก</button>
                    </div>
                  </template>
                  <template v-else>
                    <p>{{ comment.body }}</p>
                    <div v-if="comment.author?.line || comment.author?.facebook" class="lux-seek-comment-contact">
                      <span v-if="comment.author.line">LINE: {{ comment.author.line }}</span>
                      <span v-if="comment.author.facebook">Facebook: {{ comment.author.facebook }}</span>
                    </div>
                  </template>
                </article>
              </div>
              <div v-else class="lux-empty lux-seek-empty"><span><AppIcon name="comment" /></span><h3>ยังไม่มีคอมเมนต์</h3><p>{{ can('seek:comment') ? 'เป็นคนแรกที่แนะนำตัวในโพสนี้' : 'รอผู้ให้บริการเข้ามาคอมเมนต์' }}</p></div>
            </div>
          </template>
        </aside>
      </div>
    </main>
</template>
