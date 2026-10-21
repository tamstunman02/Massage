<script setup>
defineProps({
  provider: { type: Object, required: true },
  note: { type: String, default: 'สื่อที่เพิ่มจะปรากฏบนโปรไฟล์สาธารณะหลังบันทึก' },
})
defineEmits(['add', 'remove', 'rename', 'replace'])
</script>

<template>
  <section class="lux-seller-media-manager" aria-labelledby="partner-media-heading">
    <div class="lux-seller-panel-head">
      <div>
        <h2 id="partner-media-heading">สื่อโปรโมตบริการ</h2>
        <p>เพิ่มรูปภาพหรือวิดีโอได้หลายไฟล์ เพื่อแสดงในหน้าโปรไฟล์</p>
      </div>
      <div class="lux-seller-media-toolbar">
        <span class="lux-seller-media-count">{{ provider.media?.length || 0 }} ไฟล์</span>
        <label class="lux-button lux-button-light lux-seller-media-add">
          <input type="file" accept="image/*,video/*" multiple @change="$emit('add', $event)" />
          ＋ เพิ่มผลงาน
        </label>
      </div>
    </div>
    <label class="lux-seller-upload">
      <input type="file" accept="image/*,video/*" multiple @change="$emit('add', $event)" />
      <span aria-hidden="true">＋</span>
      <strong>กดที่นี่เพื่อเพิ่มผลงาน</strong>
      <small>เลือกรูปภาพหรือวิดีโอได้หลายไฟล์พร้อมกัน</small>
    </label>
    <div v-if="provider.media?.length" class="lux-seller-media-grid">
      <article v-for="media in provider.media" :key="media.id" class="lux-seller-media-item">
        <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" />
        <video v-else :src="media.url" controls preload="metadata" playsinline :aria-label="media.name"></video>
        <div>
          <input
            v-model.trim="media.name"
            type="text"
            maxlength="200"
            :aria-label="`ชื่อผลงาน ${media.name}`"
            @change="$emit('rename', media)"
          />
          <div class="lux-seller-media-actions">
            <label class="lux-seller-media-replace">
              <input type="file" accept="image/*,video/*" @change="$emit('replace', media, $event)" />
              แก้ไขไฟล์
            </label>
            <button type="button" :aria-label="`ลบไฟล์ ${media.name}`" @click="$emit('remove', media.id)">ลบ</button>
          </div>
        </div>
      </article>
    </div>
    <p class="lux-seller-media-note">{{ note }}</p>
  </section>
</template>
