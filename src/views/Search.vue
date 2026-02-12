<template>
  <div class="search-page">

    <!-- Tab区域 -->
    <div class="tab-container">
      <div 
        v-for="tab in tabs" 
        :key="tab.key" 
        :class="['tab-item', { 'tab-active': activeTab === tab.key }]"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </div>
      
      <!-- 筛选按钮 -->
      <div class="filter-button-wrapper">
        <SearchFilter 
          :active-tab="activeTab"
          :filters="filters"
          :time-range="timeRange"
          @update:filters="handleFiltersUpdate"
          @update:timeRange="handleTimeRangeUpdate"
          @reset="handleFilterReset"
          @apply="handleFilterApply"
        />
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div class="results-container">
      <!-- 图文搜索结果 -->
      <div v-if="activeTab === 'posts'">
        <NoteWaterfall 
          :notes="searchResults.posts" 
          :loading="loading"
          @load-more="loadMorePosts"
          @reload="handleSearch"
          @item-click="handlePostClick"
          @like="handleLike"
          @collect="handleCollect"
        />
      </div>

      <!-- 用户搜索结果 -->
      <div v-else-if="activeTab === 'users'">
        <UserSearchResults 
          :users="searchResults.users"
          :loading="loading"
          @user-click="handleUserClick"
          @follow="handleUserFollow"
          @reload="handleSearch"
        />
      </div>


    </div>

    <!-- 笔记详情对话框 -->
    <NoteDetail v-model:dialogVisible="showNoteDetail" :note="selectedNote" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchFilterStore } from '@/stores/searchFilter'
import { ElMessage } from 'element-plus'
import NoteWaterfall from '@/components/NoteWaterfall.vue'
import NoteDetail from '@/views/NoteDetail.vue'
import SearchFilter from '@/components/SearchFilter.vue'
import UserSearchResults from '@/components/UserSearchResults.vue'
import { searchPosts, searchUsers } from '@/apis/search'
import { followUser, unfollowUser } from '@/apis/users'
import type { Note } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useNoteActions } from '@/composables/useNoteActions'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { handleLike, handleCollect } = useNoteActions()

// 使用筛选状态 store
const searchFilterStore = useSearchFilterStore()

// Tabs配置
const tabs = [
  { key: 'posts', label: '图文' },
  { key: 'users', label: '用户' }
]

// 响应式数据
const activeTab = ref('posts')
const searchKeyword = ref('')
const loading = ref(false)
const filterPopoverVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalUsers = ref(0)

// 搜索结果
const searchResults = reactive({
  posts: [] as Note[],
  users: [] as any[]
})

// 筛选条件
const filters = reactive({
  category: 'all' as string | undefined,  // 默认值改为 'all'
  hasImage: undefined as boolean | undefined,
  sortBy: 'createdAt' as string
})

const timeRange = ref<[string, string] | undefined>(undefined)

// 计算属性
const hasActiveFilters = computed(() => {
  return filters.category || 
         filters.hasImage !== undefined || 
         timeRange.value ||
         (activeTab.value === 'users' && filters.sortBy !== 'createdAt') ||
         (activeTab.value === 'posts' && filters.sortBy !== 'createdAt')
})

const selectedNote = ref<Note | null>(null)
const showNoteDetail = ref(false)

// 方法
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  currentPage.value = 1
  await performSearch()
}

const performSearch = async () => {
  loading.value = true
  
  try {
    if (activeTab.value === 'posts') {
      await searchPostsContent()
    } else {
      await searchUsersContent()
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const searchPostsContent = async () => {
  const params: any = {
    keyword: searchKeyword.value,
    page: currentPage.value,
    limit: 20
  }
  
  // 添加筛选条件
  if (filters.category) params.category = filters.category
  if (filters.hasImage !== undefined) params.hasImage = filters.hasImage
  if (timeRange.value) {
    params.startTime = timeRange.value[0]
    params.endTime = timeRange.value[1]
  }
  params.sortBy = filters.sortBy
  
  const result: any = await searchPosts(params)
  searchResults.posts = result.posts || []
}

const searchUsersContent = async () => {
  const params: any = {
    keyword: searchKeyword.value,
    page: currentPage.value,
    limit: pageSize.value,
    sortBy: filters.sortBy
  }
  
  const result: any = await searchUsers(params)
  searchResults.users = result.users || []
  totalUsers.value = result.total || 0
}

const handleTabChange = (tabKey: string) => {
  activeTab.value = tabKey
  currentPage.value = 1
  if (searchKeyword.value) {
    performSearch()
  }
}

const loadMorePosts = () => {
  // 瀑布流组件的加载更多逻辑
  currentPage.value++
  performSearch()
}

const handlePostClick = (note: Note) => {
  selectedNote.value = note
  showNoteDetail.value = true
}

const handleUserClick = (user: any) => {
  router.push({
    name: 'user-profile',
    params: { uid: user._id }
  })
}

const handleUserFollow = (user: any) => {
  // 用户关注状态已由 UserSearchResults 组件处理
  // 这里可以添加额外的逻辑（如统计等）
  console.log('用户关注状态更新:', user)
}

const handleFollow = async (user: any) => {
  try {
    if (user.isFollowing) {
      await unfollowUser(user._id)
      user.isFollowing = false
      user.followersCount = Math.max(0, (user.followersCount || 0) - 1)
      ElMessage.success('取消关注成功')
    } else {
      await followUser(user._id)
      user.isFollowing = true
      user.followersCount = (user.followersCount || 0) + 1
      ElMessage.success('关注成功')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  searchUsersContent()
}

// 筛选组件事件处理
const handleFiltersUpdate = (newFilters: any) => {
  Object.assign(filters, newFilters)
}

const handleTimeRangeUpdate = (newTimeRange: [string, string] | undefined) => {
  timeRange.value = newTimeRange
}

const handleFilterReset = () => {
  filters.category = 'all'  // 重置时设置为 'all' 而不是 undefined
  filters.hasImage = undefined
  filters.sortBy = activeTab.value === 'posts' ? 'createdAt' : 'followersCount'
  timeRange.value = undefined
}

const handleFilterApply = () => {
  currentPage.value = 1
  performSearch()
}

// 监听路由参数
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchKeyword.value = newQuery as string
      handleSearch()
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 初始化筛选状态
  searchFilterStore.setActiveTab(activeTab.value as 'posts' | 'users')
  
  // 组件挂载完成后的初始化逻辑（如果需要）
  // 搜索逻辑已由 watch 监听器处理
})

// 组件卸载时重置筛选状态
onUnmounted(() => {
  // 重置筛选状态，避免状态持久化
  searchFilterStore.resetCurrentFilters()
  searchFilterStore.setActiveTab('posts')
})
</script>

<style scoped>
.search-page {
  background-color: white;
  min-height: 100vh;
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
  align-items: center;
}

.filter-button-wrapper {
  margin-left: auto;
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

/* 结果区域样式 */
.results-container {
  padding: 0 24px 24px;
  min-height: 400px;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .tab-container {
    padding: 12px 16px;
  }
  
  .results-container {
    padding: 0 16px 16px;
  }
}

@media (max-width: 480px) {
  .tab-item {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>