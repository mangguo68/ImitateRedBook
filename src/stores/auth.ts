import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { login, register, refreshToken as refreshTokenApi, logout } from '@/apis/auth'
import type { User, LoginResponse } from '@/types'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const accessToken = ref<string>(localStorage.getItem('accessToken') || '')
  const refreshToken = ref<string>(localStorage.getItem('refreshToken') || '')
  const userInfo = ref<User | null>(null)
  const showLoginDialog = ref(false)
  const isAuthenticated = computed(() => !!accessToken.value && !!userInfo.value)

  // 初始化认证状态
  const initAuth = async () => {
    const savedAccessToken = localStorage.getItem('accessToken')
    const savedRefreshToken = localStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('userInfo')

    if (savedAccessToken && savedRefreshToken && savedUser) {
      try {
        accessToken.value = savedAccessToken
        refreshToken.value = savedRefreshToken
        userInfo.value = JSON.parse(savedUser)
        // 不再自动验证token，只在需要时验证
      } catch {
        // 初始化失败，清除认证状态
        console.log('初始化认证状态失败，清除认证状态')
        clearAuth()
      }
    } else {
      // 如果本地存储没有token或userInfo，清除认证状态
      console.log('本地存储没有token或userInfo，清除认证状态')
      clearAuth()
    }
  }

  // 用户登录
  const loginUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await login({ username, password })

      if (result.accessToken && result.refreshToken && result.user) {
        accessToken.value = result.accessToken
        refreshToken.value = result.refreshToken
        userInfo.value = {
          _id: result.user._id,
          username: result.user.username,
          nickname: result.user.nickname || result.user.username,
          email: result.user.email || '',
          avatar: result.user.avatar || '',
          redBookId: result.user.redBookId || result.user._id,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          likesCount: 0,
          collectionsCount: 0,
        }

        // 保存到本地存储
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('refreshToken', result.refreshToken)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

        ElMessage.success('登录成功')
        return true
      } else {
        ElMessage.error('登录失败')
        return false
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      // 从axiosError对象中获取后端返回的错误消息
      const errorMessage =
        error.response?.data?.message || error.message || '登录失败，请检查网络连接'
      ElMessage.error(errorMessage)
      return false
    }
  }

  // 用户注册
  const registerUser = async (
    username: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const result = await register({ username, email, password })

      if (result.accessToken && result.refreshToken && result.user) {
        accessToken.value = result.accessToken
        refreshToken.value = result.refreshToken
        userInfo.value = {
          _id: result.user._id,
          username: result.user.username,
          nickname: result.user.nickname || result.user.username,
          email: result.user.email || '',
          avatar: result.user.avatar || '',
          redBookId: result.user.redBookId || result.user._id,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          likesCount: 0,
          collectionsCount: 0,
        }

        // 保存到本地存储
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('refreshToken', result.refreshToken)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

        ElMessage.success('注册成功')
        return true
      } else {
        ElMessage.error('注册失败')
        return false
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      // 从axiosError对象中获取后端返回的错误消息
      const errorMessage =
        error.response?.data?.message || error.message || '注册失败，请检查网络连接'
      ElMessage.error(errorMessage)
      return false
    }
  }

  // 刷新token
  const refreshUserToken = async (): Promise<boolean> => {
    try {
      const result = await refreshTokenApi({ refreshToken: refreshToken.value })

      // 由于响应拦截器会提取res.data，所以result直接就是{ accessToken: "...", refreshToken: "..." }
      if (
        result &&
        typeof result === 'object' &&
        'accessToken' in result &&
        'refreshToken' in result
      ) {
        accessToken.value = result.accessToken
        refreshToken.value = result.refreshToken
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('refreshToken', result.refreshToken)
        return true
      } else {
        return false
      }
    } catch (error: any) {
      console.error('刷新token失败:', error)
      // 如果是401错误，表示token已失效，需要清除认证状态
      if (error.isUnauthorized || error.response?.status === 401) {
        console.log('Token已失效，清除认证状态')
        clearAuth()
        // 从axiosError对象中获取后端返回的错误消息
        const errorMessage =
          error.response?.data?.message || error.message || '登录已失效，请重新登录'
      } else {
        ElMessage.error('刷新token失败，请检查网络连接')
      }
      return false
    }
  }

  // 用户退出
  const logoutUser = async (): Promise<void> => {
    try {
      if (accessToken.value) {
        await logout()
      }
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      clearAuth()
      ElMessage.success('已退出登录')
    }
  }

  // 清除认证状态
  const clearAuth = (): void => {
    accessToken.value = ''
    refreshToken.value = ''
    userInfo.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  }

  // 更新用户信息
  const updateUser = (user: Partial<User>): void => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...user }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  // 验证token有效性
  const validateToken = async (): Promise<boolean> => {
    try {
      const result = await refreshTokenApi({ refreshToken: refreshToken.value })

      // 由于响应拦截器会提取res.data，所以result直接就是{ accessToken: "...", refreshToken: "..." }
      if (
        result &&
        typeof result === 'object' &&
        'accessToken' in result &&
        'refreshToken' in result
      ) {
        accessToken.value = result.accessToken
        refreshToken.value = result.refreshToken
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('refreshToken', result.refreshToken)
        return true
      } else {
        return false
      }
    } catch (error: any) {
      console.error('验证token失败:', error)
      // 如果是401错误，表示token已失效，需要清除认证状态
      if (error.isUnauthorized || error.response?.status === 401) {
        console.log('Token已失效，清除认证状态')
        clearAuth()
      }
      return false
    }
  }

  // 显示登录对话框
  const openLoginDialog = (): void => {
    showLoginDialog.value = true
  }

  // 隐藏登录对话框
  const closeLoginDialog = (): void => {
    showLoginDialog.value = false
  }

  // 获取用户信息（不包含敏感信息）
  const getUserInfo = computed(() => {
    if (!userInfo.value) return null

    const {
      _id,
      username,
      nickname,
      email,
      avatar,
      bio,
      redBookId,
      followersCount,
      followingCount,
      postsCount,
      likesCount,
      collectionsCount,
    } = userInfo.value

    return {
      _id,
      username,
      nickname,
      email,
      avatar,
      bio,
      redBookId,
      followersCount,
      followingCount,
      postsCount,
      likesCount,
      collectionsCount,
    }
  })

  return {
    // 状态
    accessToken,
    refreshToken,
    userInfo,
    showLoginDialog,
    isAuthenticated,

    // 计算属性
    getUserInfo,

    // 方法
    initAuth,
    loginUser,
    registerUser,
    refreshUserToken,
    validateToken,
    logoutUser,
    updateUser,
    clearAuth,
    openLoginDialog,
    closeLoginDialog,
  }
})
