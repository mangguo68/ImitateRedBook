<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo" @click="goToHome">
        <span class="logo-text">小红书</span>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <SearchInput 
          v-model="searchKeyword" 
          placeholder="搜索笔记或用户" 
          @search="handleSearch"
        />
      </div>

      <!-- 右侧按钮区域 -->
      <div class="header-buttons">
        <el-button link class="header-btn" @click="handleCreationCenter">创作中心</el-button>
        <el-button link class="header-btn" @click="handleBusinessCooperation">业务合作</el-button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import SearchInput from './SearchInput.vue'

const route = useRoute()
const router = useRouter()
const searchKeyword = ref('')
const authStore = useAuthStore()

// 监听路由变化，同步搜索关键词
watch(
  [() => route.name, () => route.query.q],
  ([routeName, newQuery]) => {
    // 只在搜索页面保留关键词
    if (routeName === 'search' && newQuery && typeof newQuery === 'string') {
      searchKeyword.value = newQuery
    } else if (routeName !== 'search') {
      // 离开搜索页面时清空搜索框
      searchKeyword.value = ''
    }
  },
  { immediate: true }
)

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    // 检查是否登录
    if (!authStore.isAuthenticated) {
      authStore.openLoginDialog()
      return
    }
    console.log('搜索关键词:', searchKeyword.value)
    // 跳转到搜索页面并传递搜索关键词
    router.push({
      name: 'search',
      query: { q: searchKeyword.value }
    })
    // 不清空搜索框，让用户可以看到当前搜索的关键词
  }
}

// 处理创作中心点击
const handleCreationCenter = () => {
  ElMessage.info('功能开发中，敬请期待')
  console.log('打开创作中心')
  // 这里可以添加跳转到创作中心的逻辑
}

// 处理业务合作点击
const handleBusinessCooperation = () => {
  ElMessage.info('功能开发中，敬请期待')
  console.log('打开业务合作')
  // 这里可以添加跳转到业务合作的逻辑
}
</script>

<style scoped>
.app-header {
  background-color: white;
  height: 72px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  width: 100%;
}

.logo {
  cursor: pointer;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #FF2442;
  border-radius: 100px;
  padding: 12px 24px;
  line-height: 1;
}

.search-box {
  flex: 1;
  max-width: 480px;
  margin: 0 40px;
}

.header-buttons {
  display: flex;
  gap: 0;
}

.app-header .header-buttons .header-btn {
  padding: 12px 20px !important;
  border-radius: 100px !important;
  transition: all 0.2s !important;
  color: #333 !important;
  height: 40px !important;
  font-size: 16px !important;
  line-height: 16px !important;
  margin-left: 0 !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
}

.app-header .header-buttons .header-btn:hover {
  background-color: #f5f5f5 !important;
  color: #ff2442 !important;
}

.header-buttons .header-btn:last-child {
  margin-left: 0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .logo-text {
    font-size: 20px;
    padding: 10px 20px;
  }

  .search-box {
    margin: 0 20px;
    max-width: 300px;
  }

  .header-btn {
    font-size: 14px;
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 18px;
    padding: 8px 16px;
  }

  .search-box {
    margin: 0 12px;
    max-width: 200px;
  }

  .header-btn {
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>