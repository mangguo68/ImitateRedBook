import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from './useNavigation'
import type { User } from '@/types'

export function useAuth() {
  const authStore = useAuthStore()
  const { navigateTo } = useNavigation()

  const isLoggedIn = computed(() => authStore.isAuthenticated)
  const userInfo = computed(() => authStore.getUserInfo as User | null)

  const handleLogin = () => {
    if (isLoggedIn.value) {
      const userId = userInfo.value?._id || '1'
      navigateTo('user-profile', { uid: userId })
    }
  }

  const handleLogout = async () => {
    try {
      await authStore.logoutUser()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const handleLoginSuccess = (userData: User) => {
    console.log('登录成功:', userData)
  }

  return {
    isLoggedIn,
    userInfo,
    handleLogin,
    handleLogout,
    handleLoginSuccess
  }
}
