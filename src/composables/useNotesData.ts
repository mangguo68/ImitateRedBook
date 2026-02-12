import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getNotes } from '@/apis/notes'
import { formatLikeCount } from '@/utils/formatters'
import { useNotesStore } from '@/stores/notes'
import type { Note, GetNotesParams, NotesResponse } from '@/types'

const DEFAULT_PAGE_SIZE = 20

export function useNotesData(activeTab: () => string) {
  const contentItems = ref<Note[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)
  const hasMore = ref(true)
  const total = ref(0)
  const notesStore = useNotesStore()

  const formattedItems = computed(() =>
    contentItems.value.map(item => ({
      ...item,
      formattedLikes: formatLikeCount(item.likesCount || 0)
    }))
  )

  const loadNotes = async (isLoadMore = false) => {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const params: GetNotesParams = {
        page: isLoadMore ? currentPage.value + 1 : 1,
        limit: pageSize.value,
        category: activeTab() !== 'recommend' ? activeTab() : undefined
      }
      const response: NotesResponse = await getNotes(params)
      if (isLoadMore) {
        contentItems.value = [...contentItems.value, ...response.posts]
        currentPage.value = response.page
      } else {
        contentItems.value = response.posts
        currentPage.value = 1
      }
      total.value = response.total
      hasMore.value = contentItems.value.length < total.value
      
      // 更新本地笔记列表到store
      notesStore.setLocalNoteList(contentItems.value)
    } catch (error: any) {
      console.error('获取笔记数据失败:', error)
      ElMessage.error('获取笔记失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }

  const loadMore = () => {
    if (!loading.value && hasMore.value) {
      loadNotes(true)
    }
  }

  const resetAndLoad = () => {
    currentPage.value = 1
    hasMore.value = true
    contentItems.value = []
    loadNotes()
  }

  watch(activeTab, () => {
    resetAndLoad()
  })

  return {
    contentItems,
    formattedItems,
    loading,
    currentPage,
    pageSize,
    hasMore,
    total,
    loadNotes,
    loadMore,
    resetAndLoad
  }
}
