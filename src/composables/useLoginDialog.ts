import { ref } from 'vue'
import { useAuth } from './useAuth'
import type { User } from '@/types'

export function useLoginDialog() {
  const showLoginDialog = ref(false)
  const { handleLoginSuccess: authHandleLoginSuccess } = useAuth()

  const openLoginDialog = () => {
    showLoginDialog.value = true
  }

  const handleLoginSuccess = (userData: User | null) => {
    if (userData) {
      authHandleLoginSuccess(userData)
    }
    showLoginDialog.value = false
  }

  const handleLoginClose = () => {
    showLoginDialog.value = false
  }

  return {
    showLoginDialog,
    openLoginDialog,
    handleLoginSuccess,
    handleLoginClose
  }
}
