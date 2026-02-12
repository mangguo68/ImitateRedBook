import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface PostsFilters {
  category: string | undefined
  hasImage: boolean | undefined
  sortBy: string
  timeRange: [string, string] | undefined
}

interface UsersFilters {
  sortBy: string
}

export const useSearchFilterStore = defineStore('searchFilter', () => {
  // 图文搜索筛选状态
  const postsFilters = ref<PostsFilters>({
    category: undefined,
    hasImage: undefined,
    sortBy: 'createdAt',
    timeRange: undefined
  })

  // 用户搜索筛选状态
  const usersFilters = ref<UsersFilters>({
    sortBy: 'followersCount'
  })

  // 当前激活的 tab
  const activeTab = ref<'posts' | 'users'>('posts')

  // 时间范围选项状态
  const selectedTimeOption = ref('all')

  // 获取当前 tab 的筛选状态
  const currentFilters = computed(() => {
    return activeTab.value === 'posts' ? postsFilters.value : usersFilters.value
  })

  // 获取当前的时间范围
  const currentTimeRange = computed(() => {
    return activeTab.value === 'posts' ? postsFilters.value.timeRange : undefined
  })

  // 检查当前 tab 是否有活动筛选
  const hasActiveFilters = computed(() => {
    if (activeTab.value === 'posts') {
      const filters = postsFilters.value
      const isDefaultCategory = !filters.category || filters.category === 'all'
      const isDefaultHasImage = filters.hasImage === undefined
      const isDefaultTimeRange = !filters.timeRange
      const isDefaultSort = filters.sortBy === 'createdAt'
      
      return !isDefaultCategory || !isDefaultHasImage || !isDefaultTimeRange || !isDefaultSort
    } else {
      const filters = usersFilters.value
      const isDefaultSort = filters.sortBy === 'followersCount'
      return !isDefaultSort
    }
  })

  // 设置当前 tab 的筛选状态
  function setCurrentFilters(filters: Partial<PostsFilters | UsersFilters>) {
    if (activeTab.value === 'posts') {
      Object.assign(postsFilters.value, filters)
    } else {
      Object.assign(usersFilters.value, filters)
    }
  }

  // 设置当前 tab 的时间范围
  function setCurrentTimeRange(timeRange: [string, string] | undefined) {
    if (activeTab.value === 'posts') {
      postsFilters.value.timeRange = timeRange
    }
  }

  // 重置当前 tab 的筛选状态
  function resetCurrentFilters() {
    if (activeTab.value === 'posts') {
      // 完全重置图文筛选状态
      postsFilters.value = {
        category: 'all',
        hasImage: undefined,
        sortBy: 'createdAt',
        timeRange: undefined
      }
      selectedTimeOption.value = 'all'
    } else {
      // 完全重置用户筛选状态
      usersFilters.value = {
        sortBy: 'followersCount'
      }
    }
  }

  // 切换 tab
  function setActiveTab(tab: 'posts' | 'users') {
    activeTab.value = tab
    
    // 确保切换到图文筛选时状态正确初始化
    if (tab === 'posts') {
      // 如果分类状态不存在或为空，设置为默认值
      if (!postsFilters.value.category) {
        postsFilters.value.category = 'all'
      }
    }
  }

  // 更新时间选项
  function setSelectedTimeOption(option: string) {
    selectedTimeOption.value = option
  }

  return {
    // 状态
    postsFilters,
    usersFilters,
    activeTab,
    selectedTimeOption,
    
    // 计算属性
    currentFilters,
    currentTimeRange,
    hasActiveFilters,
    
    // 方法
    setCurrentFilters,
    setCurrentTimeRange,
    resetCurrentFilters,
    setActiveTab,
    setSelectedTimeOption
  }
})