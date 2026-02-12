import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { followUser, unfollowUser } from '@/apis/users'
import type { UserInfo } from '@/types'
import { useAuthStore } from '@/stores/auth'

export function useUserActions() {
  const following = ref(false)
  const authStore = useAuthStore()

  // 关注/取消关注用户
  const handleFollow = async (
    user: UserInfo | null | undefined,
    currentFollowingState: boolean,
  ) => {
    if (following.value || !user) return { success: false, newState: currentFollowingState }

    // 检查是否登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return { success: false, newState: currentFollowingState }
    }

    // 检查是否是自己，防止关注自己
    const currentUser = authStore.getUserInfo
    if (currentUser && currentUser._id === user._id) {
      ElMessage.warning('不能关注自己')
      return { success: false, newState: currentFollowingState }
    }

    try {
      following.value = true
      const newFollowingState = !currentFollowingState

      if (newFollowingState) {
        await followUser(user._id)
      } else {
        await unfollowUser(user._id)
      }

      // 更新本地关注数
      user.followersCount = (user.followersCount || 0) + (newFollowingState ? 1 : -1)

      ElMessage.success(newFollowingState ? '关注成功' : '取消关注成功')
      return { success: true, newState: newFollowingState }
    } catch (error) {
      ElMessage.error(currentFollowingState ? '取消关注失败' : '关注失败')
      console.error('处理关注失败:', error)
      return { success: false, newState: currentFollowingState }
    } finally {
      following.value = false
    }
  }

  return {
    following,
    handleFollow,
  }
}
