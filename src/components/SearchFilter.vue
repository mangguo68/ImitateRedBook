<template>
  <div class="search-filter">
    <el-popover
      placement="bottom-end"
      :width="'auto'"
      trigger="click"
      v-model:visible="visible"
    >
      <template #reference>
        <el-button class="filter-button" :type="hasActiveFilters ? 'primary' : 'default'">
          <el-icon>
            <Filter />
          </el-icon>
          筛选
        </el-button>
      </template>
      
      <div class="filter-popover">
        <h3 class="filter-title">筛选条件</h3>
        
        <!-- 图文筛选条件 -->
        <div v-if="activeTab === 'posts'" class="filter-section">
          <!-- 分类筛选 -->
          <div class="filter-group">
            <label class="filter-label">分类</label>
            <div class="filter-tabs">
              <div 
                v-for="category in categories" 
                :key="category.value"
                :class="['filter-tab', { 'active': (searchFilterStore.currentFilters as any).category === category.value }]"
                @click="searchFilterStore.setCurrentFilters({ category: category.value })"
              >
                {{ category.label }}
              </div>
            </div>
          </div>
          
          <!-- 时间范围筛选 -->
          <div class="filter-group">
            <label class="filter-label">时间范围</label>
            <div class="filter-tabs">
              <div 
                v-for="timeOption in timeOptions" 
                :key="timeOption.value"
                :class="['filter-tab', { 'active': searchFilterStore.selectedTimeOption === timeOption.value }]"
                @click="selectTimeRange(timeOption.value)"
              >
                {{ timeOption.label }}
              </div>
            </div>
          </div>
          
          <!-- 图片筛选 -->
          <div class="filter-group">
            <label class="filter-label">是否有图片</label>
            <div class="filter-tabs">
              <div 
                v-for="(imageOption, index) in imageOptions" 
                :key="index"
                :class="['filter-tab', { 'active': (searchFilterStore.currentFilters as any).hasImage === imageOption.value }]"
                @click="searchFilterStore.setCurrentFilters({ hasImage: imageOption.value })"
              >
                {{ imageOption.label }}
              </div>
            </div>
          </div>
          
          <!-- 排序方式 -->
          <div class="filter-group">
            <label class="filter-label">排序方式</label>
            <div class="filter-tabs">
              <div 
                v-for="sortOption in postSortOptions" 
                :key="sortOption.value"
                :class="['filter-tab', { 'active': searchFilterStore.currentFilters.sortBy === sortOption.value }]"
                @click="searchFilterStore.setCurrentFilters({ sortBy: sortOption.value })"
              >
                {{ sortOption.label }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 用户筛选条件 -->
        <div v-else class="filter-section">
          <!-- 用户排序方式 -->
          <div class="filter-group">
            <label class="filter-label">排序方式</label>
            <div class="filter-tabs">
              <div 
                v-for="sortOption in userSortOptions" 
                :key="sortOption.value"
                :class="['filter-tab', { 'active': searchFilterStore.currentFilters.sortBy === sortOption.value }]"
                @click="searchFilterStore.setCurrentFilters({ sortBy: sortOption.value })"
              >
                {{ sortOption.label }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleApply">应用筛选</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Filter } from '@element-plus/icons-vue'
import { getLabels } from '@/apis/labels'
import { ElMessage } from 'element-plus'
import { useSearchFilterStore } from '@/stores/searchFilter'

// 定义组件props
interface FiltersType {
  category?: string
  hasImage?: boolean
  sortBy: string
}

interface Props {
  activeTab: string
  filters: FiltersType
  timeRange?: [string, string] | undefined
}

// 定义组件emits
interface Emits {
  (e: 'update:filters', filters: Props['filters']): void
  (e: 'update:timeRange', timeRange: [string, string] | undefined): void
  (e: 'reset'): void
  (e: 'apply'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用 store
const searchFilterStore = useSearchFilterStore()

// 响应式数据
const visible = ref(false)
const categories = ref<Array<{ label: string; value: string }>>([])

// 同步 store 状态
searchFilterStore.setActiveTab(props.activeTab as 'posts' | 'users')

// 筛选选项数据
const timeOptions = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const imageOptions = [
  { label: '全部', value: undefined },
  { label: '有图', value: true },
  { label: '无图', value: false }
]

const postSortOptions = [
  { label: '最新发布', value: 'createdAt' },
  { label: '最多点赞', value: 'likesCount' },
  { label: '最多收藏', value: 'collectionsCount' }
]

const userSortOptions = [
  { label: '最多粉丝', value: 'followersCount' },
  { label: '最新加入', value: 'createdAt' },
  { label: '最多笔记', value: 'postsCount' }
]

// 获取分类数据
const fetchCategories = async () => {
  try {
    const response: any = await getLabels()
    // 假设后端返回格式为 { data: { labels: [{ name: '美妆', _id: 'beauty' }, ...] } }
    const backendCategories = response.data?.labels || response.labels || []
    
    // 过滤掉推荐标签
    const categoryLabels = backendCategories.filter((cat: any) => {
      // 排除 value 为 "recommend" 的标签
      return cat.value !== 'recommend'
    })
    
    // 转换为组件需要的格式，使用 value 作为筛选参数
    const formattedCategories = categoryLabels.map((cat: any) => ({
      label: cat.name,
      value: cat.value  // 使用 value 字段作为筛选参数
    }))
    
    // 添加"全部"选项
    categories.value = [
      { label: '全部', value: 'all' },
      ...formattedCategories
    ]
    
    // 设置默认选中第一个分类（如果没有已选中的有效分类）
    const currentFilters = searchFilterStore.currentFilters as any
    const firstCategory = categories.value[0]
    if (firstCategory && (!currentFilters.category || currentFilters.category === 'all')) {
      searchFilterStore.setCurrentFilters({ category: firstCategory.value })
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    ElMessage.error('获取分类数据失败')
    // 降级到默认分类
    categories.value = [
      { label: '全部', value: 'all' },
      { label: '美妆', value: '美妆' },
      { label: '穿搭', value: '穿搭' },
      { label: '美食', value: '美食' },
      { label: '旅行', value: '旅行' },
      { label: '生活', value: '生活' }
    ]
  }
}

// 计算属性
const hasActiveFilters = computed(() => searchFilterStore.hasActiveFilters)

// 时间范围处理方法
const selectTimeRange = (option: string) => {
  searchFilterStore.setSelectedTimeOption(option)
  const now = new Date()
  let startDate: Date
  
  switch (option) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default:
      searchFilterStore.setCurrentTimeRange(undefined)
      return
  }
  
  const timeRange = [
    startDate.toISOString().split('T')[0],
    now.toISOString().split('T')[0]
  ] as [string, string]
  
  searchFilterStore.setCurrentTimeRange(timeRange)
}

// 方法
const handleReset = () => {
  searchFilterStore.resetCurrentFilters()
  visible.value = false
  emit('reset')
}

const handleApply = () => {
  // 更新父组件状态
  emit('update:filters', { ...searchFilterStore.currentFilters })
  if (props.activeTab === 'posts') {
    emit('update:timeRange', searchFilterStore.currentTimeRange)
  }
  visible.value = false
  emit('apply')
}

// 监听props变化，同步到 store
watch(
  () => props.filters,
  (newFilters) => {
    searchFilterStore.setCurrentFilters(newFilters)
  },
  { deep: true }
)

watch(
  () => props.timeRange,
  (newTimeRange) => {
    if (props.activeTab === 'posts') {
      searchFilterStore.setCurrentTimeRange(newTimeRange)
    }
  }
)

// 监听 activeTab 变化
watch(() => props.activeTab, (newTab, oldTab) => {
  // 只有当 tab 真正发生变化时才处理
  if (newTab !== oldTab) {
    searchFilterStore.setActiveTab(newTab as 'posts' | 'users')
  }
})

// 组件挂载时获取分类数据
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.search-filter {
  display: inline-block;
}

.filter-button {
  border-radius: 20px;
}

/* 筛选弹窗样式 */
.filter-popover {
  padding: 16px;
  min-width: 280px;
  max-width: 400px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.filter-tab {
  padding: 6px 12px;
  border-radius: 16px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.filter-tab:hover {
  background-color: #e8e8e8;
  color: #333;
}

.filter-tab.active {
  background-color: #ff4757;
  color: white;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.filter-actions :deep(.el-button) {
  border-radius: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-popover {
    padding: 12px;
    min-width: 250px;
    max-width: 350px;
  }
  
  .filter-tabs {
    gap: 6px;
  }
  
  .filter-tab {
    padding: 5px 10px;
    font-size: 12px;
  }
  
  .filter-actions {
    gap: 3px;
  }
  
  .filter-actions :deep(.el-button) {
    border-radius: 18px;
  }
}

@media (max-width: 480px) {
  .filter-popover {
    min-width: 220px;
    max-width: 300px;
  }
  
  .filter-tabs {
    gap: 4px;
  }
  
  .filter-tab {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .filter-actions {
    gap: 2px;
  }
  
  .filter-actions :deep(.el-button) {
    border-radius: 16px;
  }
}
</style>