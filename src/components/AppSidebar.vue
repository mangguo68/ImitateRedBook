<template>
  <aside class="sidebar">
    <!-- 导航区域 -->
    <nav class="nav-menu">
      <div v-for="item in navItems" :key="item.id" class="nav-item" :class="{ active: currentRoute === item.route }"
        @click="navigateTo(item.route)">
        <el-icon class="nav-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="nav-text">{{ item.name }}</span>
      </div>

      <!-- 登录按钮 -->
      <div class="login-btn" @click="handleLogin">
        <span class="login-text">{{ isLoggedIn ? (userInfo?.nickname || '用户中心') : '登录' }}</span>
      </div>

      <!-- 登录卡片 -->
      <div v-if="!isLoggedIn" class="login-card">
        <h3 class="login-card-title">马上登录即可</h3>
        <div class="login-benefits">
          <div v-for="benefit in loginBenefits" :key="benefit.text" class="benefit-item">
            <el-icon class="benefit-icon">
              <component :is="benefit.icon" />
            </el-icon>
            <span class="benefit-text">{{ benefit.text }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 更多下拉菜单 -->
    <SidebarDropdown 
      :items="moreMenuItems"
      :is-logged-in="isLoggedIn"
      @item-click="handleMenuItemClick"
    />

    <!-- 登录弹窗 -->
    <LoginDialog v-model="authStore.showLoginDialog" @success="handleLoginSuccess" />
  </aside>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation'
import { useAuth } from '@/composables/useAuth'
import { useSidebarMenu } from '@/composables/useSidebarMenu'
import LoginDialog from './LoginDialog.vue'
import SidebarDropdown from './SidebarDropdown.vue'
import { navItems, loginBenefits, moreMenuItems } from '@/config/sidebar'
import { useAuthStore } from '@/stores/auth'

// 定义props
const props = defineProps<{
  currentRoute: string
}>()

// 使用组合式函数
const { navigateTo } = useNavigation()
const { isLoggedIn, userInfo, handleLogin: authHandleLogin, handleLogout } = useAuth()
const { handleSettings, handleHelp, handleAbout } = useSidebarMenu()
const authStore = useAuthStore()

// 方法定义
const handleLogin = () => {
  if (isLoggedIn.value) {
    authHandleLogin()
  } else {
    authStore.openLoginDialog()
  }
}

const handleLoginSuccess = () => {
  authStore.closeLoginDialog()
}

const handleMenuItemClick = (action: string) => {
  switch (action) {
    case 'settings':
      handleSettings()
      break
    case 'help':
      handleHelp()
      break
    case 'about':
      handleAbout()
      break
    case 'logout':
      handleLogout()
      break
  }
}
</script>

<style scoped>
:deep(.el-dialog__header) {
  display: none;
}

.sidebar {
  width: 280px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.nav-item:hover {
  background-color: #f3f4f6;
  transform: translateX(4px);
}

.nav-item:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 36, 66, 0.2);
}

.nav-item.active {
  background-color: #f3f4f6;
  font-weight: bold;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-text {
  color: #000000;
}

.nav-icon {
  font-size: 24px;
  margin-right: 12px;
}

.nav-text {
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background-color: #FF2442;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background-color: #e0203a;
  transform: scale(1.02);
}

.login-text {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.login-card {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
}

.login-card-title {
  color: #000000;
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 16px 0;
  text-align: left;
}

.login-benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.benefit-icon {
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
}

.benefit-text {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.more-btn {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 0 16px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.more-btn:hover {
  background-color: #f3f4f6;
}

.more-icon {
  font-size: 24px;
  margin-right: 12px;
}

.more-text {
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}

.logout-item {
  color: #FF2442;
}

.logout-item:hover {
  color: #e0203a;
}
</style>
