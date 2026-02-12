<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// 初始化认证状态
const authStore = useAuthStore()

onMounted(async () => {
  // 页面刷新时从本地存储中恢复登录状态
  await authStore.initAuth()
})
</script>

<template>
  <router-view></router-view>
</template>

<style></style>
