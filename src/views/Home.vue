<template>
  <div class="app-container">
    <!-- 头部区域 -->
    <AppHeader />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 侧边栏区域 -->
      <AppSidebar :current-route="currentRoute" />
      <!-- 右侧路由容器区域 -->
      <section class="router-container">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { ROUTE_TO_MENU } from '@/router/config'

// 路由相关
const route = useRoute()

// 计算属性
const currentRoute = computed(() => {
  return ROUTE_TO_MENU[route.path] || ''
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: white;
}

.main-content {
  flex: 1;
  display: flex;
  width: 100%;
  min-height: 0;
}

.router-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>