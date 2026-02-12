<template>
  <div class="search-input" ref="searchContainer">
    <el-input 
      ref="inputRef"
      v-model="localValue" 
      :placeholder="placeholder"
      :suffix-icon="Search" 
      @focus="showHistory = true"
      @blur="handleBlur"
      @keyup.enter="handleSearch"
      @input="handleInput"
    />
    
    <!-- 历史记录标签展示 -->
    <div 
      v-show="showHistory" 
      class="history-tags-container"
      @mousedown.prevent
    >
      <!-- 历史记录板块 -->
      <div v-if="history.length > 0">
        <!-- 标题栏 -->
        <div class="history-header">
          <span class="history-title">搜索历史</span>
          <el-tooltip content="清除搜索历史" placement="top">
            <el-button 
              circle
              size="small" 
              @click="clearHistory"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        
        <div class="history-tags">
          <div 
            v-for="(item, index) in history" 
            :key="index"
            class="history-tag"
            @click="selectHistory(item)"
          >
            <span class="tag-text">{{ item }}</span>
            <el-icon 
              class="tag-delete" 
              @click.stop="removeHistoryItem(item)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </div>
      
      <!-- 猜你想搜板块 -->
      <div class="suggested-section">
        <div class="suggested-header">
          <span class="suggested-title">猜你想搜</span>
        </div>
        <div class="suggested-tags">
          <div 
            v-for="(keyword, index) in suggestedKeywords" 
            :key="index"
            class="suggested-tag"
            @click="selectSuggested(keyword)"
          >
            {{ keyword }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Search, Close, Delete } from '@element-plus/icons-vue'
import SearchHistoryManager from '@/utils/searchHistory'

interface Props {
  modelValue?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索笔记或用户'
})

const emit = defineEmits<Emits>()

// refs
const searchContainer = ref<HTMLElement>()
const inputRef = ref()

// 状态
const localValue = ref(props.modelValue)
const showHistory = ref(false)
const history = ref<string[]>([])

// 推荐搜索词
const suggestedKeywords = [
  '美妆教程',
  '穿搭分享',
  '美食探店',
  '旅行攻略',
  '健身打卡',
  '读书笔记',
  '影视推荐',
  '职场经验'
]

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue
  }
)

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})

// 加载历史记录
const loadHistory = () => {
  history.value = SearchHistoryManager.getHistory()
}

// 处理输入事件
const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

// 处理搜索事件
const handleSearch = () => {
  if (localValue.value.trim()) {
    // 添加到历史记录
    SearchHistoryManager.addHistory(localValue.value)
    loadHistory()
    
    emit('search', localValue.value)
    showHistory.value = false
  }
}

// 处理失去焦点
const handleBlur = () => {
  // 延迟隐藏，让用户有时间点击历史记录
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}

// 选择历史记录
const selectHistory = (keyword: string) => {
  localValue.value = keyword
  emit('update:modelValue', keyword)
  emit('search', keyword)
  showHistory.value = false
  // 失去焦点
  inputRef.value?.blur()
}

// 选择推荐搜索词
const selectSuggested = (keyword: string) => {
  localValue.value = keyword
  emit('update:modelValue', keyword)
  // 添加到历史记录
  SearchHistoryManager.addHistory(keyword)
  loadHistory()
  emit('search', keyword)
  showHistory.value = false
  // 失去焦点
  inputRef.value?.blur()
}

// 删除历史记录项
const removeHistoryItem = (keyword: string) => {
  SearchHistoryManager.removeHistory(keyword)
  loadHistory()
}

// 清除所有历史记录
const clearHistory = () => {
  SearchHistoryManager.clearHistory()
  loadHistory()
}
</script>

<style scoped>
.search-input {
  width: 100%;
  position: relative;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #f5f5f5;
  border: none;
  box-shadow: none;
  height: 40px;
  padding-left: 24px; /* 增大左侧内边距 */
}

.search-input :deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
}

.search-input :deep(.el-input__suffix) {
  font-size: 20px;
  color: #666;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ff2442 inset;
}

/* 历史记录标签容器 */
.history-tags-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  z-index: 1000;
  padding: 12px;
}

/* 历史记录标题栏 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 猜你想搜板块 */
.suggested-section {
  margin-top: 12px;
}

.suggested-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.suggested-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-tag:hover {
  border-color: #ff2442;
  color: #ff2442;
  background-color: #fff5f5;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.history-tag {
  display: inline-flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 100%;
}

.history-tag:hover {
  background-color: #e8e8e8;
  transform: translateY(-1px);
}

.tag-text {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 6px;
}

.tag-delete {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}

.tag-delete:hover {
  color: #ff4d4f;
}

</style>