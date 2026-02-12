<template>
  <div class="discover-page">
    <!-- Tab区域 -->
    <div class="tab-container">
      <div v-for="tab in tabs" :key="tab.key" :class="['tab-item', { 'tab-active': activeTab === tab.key }]"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </div>
    </div>

    <!-- 内容区域 - 瀑布流 -->
    <NoteWaterfall :notes="localFormattedItems" :loading="loading" @load-more="loadMore" @reload="resetAndLoad"
      @item-click="handleNoteClick" @like="handleLike" @collect="handleCollect" />

    <!-- 发现-详情 -->
    <NoteDetail v-model:dialogVisible="visible" :note="notesStore.selectedNote" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Note } from '@/types'
import NoteDetail from '@/views/NoteDetail.vue'
import NoteWaterfall from '@/components/NoteWaterfall.vue'
import { useLabels } from '@/composables/useLabels'
import { useNotesData } from '@/composables/useNotesData'
import { useNoteActions } from '@/composables/useNoteActions'
import { useNotesStore } from '@/stores/notes'

const visible = ref(false)

const { tabs, activeTab, loadLabels } = useLabels('recommend')
const { loading, loadMore, loadNotes, resetAndLoad } = useNotesData(() => activeTab.value)
const { handleLike, handleCollect } = useNoteActions()
const notesStore = useNotesStore()

// 从store的localNoteList中获取笔记数据
const localFormattedItems = computed(() => notesStore.localNoteList)

const handleNoteClick = (item: Note) => {
  // 从本地笔记列表中获取笔记
  const noteFromStore = notesStore.getNoteById(item._id)
  notesStore.setSelectedNote(noteFromStore || item)
  visible.value = true
}

onMounted(() => {
  loadLabels()
  loadNotes()
})
</script>

<style scoped>
.discover-page {
  background-color: white;
}

/* Tab区域样式 */
.tab-container {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background-color: white;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-container::-webkit-scrollbar {
  display: none;
}

.tab-item {
  padding: 8px 16px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
  color: #666;
  user-select: none;
}

.tab-item:hover {
  color: #333;
}

.tab-active {
  background-color: #f5f5f5;
  color: #333;
  font-weight: 600;
}


</style>