<script setup>
import { ref } from 'vue'

const props = defineProps({
  provider: { type: Object, required: true },
  note: { type: String, default: 'สื่อที่เพิ่มจะปรากฏบนโปรไฟล์สาธารณะหลังบันทึก' },
})
const emit = defineEmits(['add', 'remove', 'rename', 'replace', 'reorder'])

const dragIndex = ref(null)
const overIndex = ref(null)

function coverId() {
  return props.provider.media?.find((item) => item.type === 'image')?.id
}

function isInteractive(target) {
  return Boolean(target?.closest?.('input, button, label, video, a, textarea, select'))
}

function orderedIds(from, to) {
  const ids = (props.provider.media || []).map((item) => item.id)
  if (from < 0 || to < 0 || from === to) return null
  const [moved] = ids.splice(from, 1)
  ids.splice(to, 0, moved)
  return ids
}

function startDrag(index, event) {
  if (isInteractive(event.target)) {
    event.preventDefault()
    return
  }
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(index))
}

function onDragOver(index, event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  overIndex.value = index
}

function onDrop(index, event) {
  event.preventDefault()
  const from = dragIndex.value
  dragIndex.value = null
  overIndex.value = null
  const ids = orderedIds(from, index)
  if (ids) emit('reorder', ids)
}

function onDragEnd() {
  dragIndex.value = null
  overIndex.value = null
}

function onGripPointerDown(index, event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  event.preventDefault()
  event.currentTarget.setPointerCapture(event.pointerId)
  dragIndex.value = index
}

function onGripPointerMove(event) {
  if (dragIndex.value == null) return
  const el = document.elementFromPoint(event.clientX, event.clientY)
  const card = el?.closest('[data-media-index]')
  if (!card) return
  overIndex.value = Number(card.dataset.mediaIndex)
}

function onGripPointerUp(event) {
  const from = dragIndex.value
  const to = overIndex.value
  dragIndex.value = null
  overIndex.value = null
  try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* already released */ }
  const ids = orderedIds(from, to)
  if (ids) emit('reorder', ids)
}

function makeCover(index) {
  const ids = orderedIds(index, 0)
  if (ids) emit('reorder', ids)
}
</script>

<template>
  <section class="lux-seller-media-manager" aria-labelledby="partner-media-heading">
    <div class="lux-seller-panel-head">
      <div>
        <h2 id="partner-media-heading">สื่อโปรโมตบริการ</h2>
        <p>ลากสลับลำดับได้ · รูปแรกจะเป็นรูปโปรไฟล์</p>
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
      <article
        v-for="(media, index) in provider.media"
        :key="media.id"
        class="lux-seller-media-item"
        :class="{
          'is-cover': media.id === coverId(),
          'is-dragging': dragIndex === index,
          'is-over': overIndex === index && dragIndex !== null && dragIndex !== index,
        }"
        :data-media-index="index"
        draggable="true"
        @dragstart="startDrag(index, $event)"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index, $event)"
        @dragend="onDragEnd"
      >
        <span class="lux-seller-media-handle" title="ลากเพื่อจัดลำดับ" aria-label="ลากเพื่อจัดลำดับ" @pointerdown="onGripPointerDown(index, $event)" @pointermove="onGripPointerMove" @pointerup="onGripPointerUp" @pointercancel="onDragEnd">⠿</span>
        <span v-if="media.id === coverId()" class="lux-seller-media-cover">รูปโปรไฟล์</span>
        <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" draggable="false" />
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
            <button v-if="media.type === 'image' && media.id !== coverId()" type="button" class="lux-seller-media-cover-btn" @click="makeCover(index)">ตั้งเป็นรูปแรก</button>
            <label class="lux-seller-media-replace">
              <input type="file" accept="image/*,video/*" @change="$emit('replace', media, $event)" />
              แก้ไขไฟล์
            </label>
            <button type="button" :aria-label="`ลบไฟล์ ${media.name}`" @click="$emit('remove', media.id)">ลบ</button>
          </div>
        </div>
      </article>
    </div>
    <p class="lux-seller-media-note">{{ note }} · ลากรูปเพื่อเลือกว่ารูปไหนขึ้นก่อน รูปแรกคือรูปโปรไฟล์</p>
  </section>
</template>
