import { ref } from 'vue'
import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { LoginForm, RegisterForm } from './useFormValidation'
import type { User } from '@/types'

interface LoginRegisterReturn {
  loading: Ref<boolean>
  loginFormRef: Ref<FormInstance | undefined>
  registerFormRef: Ref<FormInstance | undefined>
  agreeTerms: Ref<boolean>
  loginForm: Ref<LoginForm>
  registerForm: Ref<RegisterForm>
  handleLogin: (onSuccess?: (userInfo: User | null) => void) => Promise<boolean>
  handleRegister: (onSuccess?: (userInfo: User | null) => void) => Promise<void>
  resetLoginForm: () => void
  resetRegisterForm: () => void
  resetAll: () => void
}

export function useLoginRegister(): LoginRegisterReturn {
  const loading = ref(false)
  const loginFormRef = ref<FormInstance>()
  const registerFormRef = ref<FormInstance>()
  const agreeTerms = ref(false)
  const authStore = useAuthStore()

  const loginForm = ref<LoginForm>({
    username: '',
    password: ''
  })

  const registerForm = ref<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  })

  const validateTerms = (): boolean => {
    if (!agreeTerms.value) {
      ElMessage.error('请阅读并同意用户协议和隐私政策')
      return false
    }
    return true
  }

  const handleLogin = async (onSuccess?: (userInfo: User | null) => void): Promise<boolean> => {
    if (!loginFormRef.value) return false

    try {
      await loginFormRef.value.validate()

      if (!validateTerms()) {
        return false
      }

      loading.value = true

      console.log('🚀 开始登录请求，发送数据:', {
        username: loginForm.value.username,
        password: loginForm.value.password
      })

      const success = await authStore.loginUser(loginForm.value.username, loginForm.value.password)

      if (success) {
        console.log('✅ 登录成功')

        const userInfo = authStore.getUserInfo
        console.log('📡 触发success事件，传递数据:', userInfo)
        onSuccess?.(userInfo)
        return true
      } else {
        console.log('❌ 登录失败')
        return false
      }
    } catch (error: any) {
      console.error('🚨 登录失败:', error)

      if (error.message) {
        ElMessage.error(error.message)
      } else {
        ElMessage.error('登录失败，请检查网络连接')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const handleRegister = async (onSuccess?: (userInfo: User | null) => void): Promise<void> => {
    if (!registerFormRef.value) return

    await registerFormRef.value.validate(async (valid) => {
      if (valid) {
        if (!validateTerms()) {
          return
        }

        loading.value = true
        try {
          console.log('🚀 开始注册请求，发送数据:', {
            username: registerForm.value.username,
            password: registerForm.value.password,
            email: registerForm.value.email
          })

          const success = await authStore.registerUser(
            registerForm.value.username,
            registerForm.value.email,
            registerForm.value.password
          )

          if (success) {
            console.log('✅ 注册成功')

            const userInfo = authStore.getUserInfo
            console.log('📡 触发success事件，传递数据:', userInfo)
            onSuccess?.(userInfo)

            resetRegisterForm()
          } else {
            console.log('❌ 注册失败')
          }
        } catch (error: any) {
          console.log('🚨 捕获到错误:', error)

          if (error.message) {
            ElMessage.error(error.message)
          } else {
            ElMessage.error('注册失败，请检查网络连接')
          }
        } finally {
          loading.value = false
        }
      }
    })
  }

  const resetRegisterForm = (): void => {
    registerForm.value.username = ''
    registerForm.value.password = ''
    registerForm.value.confirmPassword = ''
    registerForm.value.email = ''
    registerForm.value.phone = ''
  }

  const resetLoginForm = (): void => {
    loginForm.value.username = ''
    loginForm.value.password = ''
  }

  const resetAll = (): void => {
    resetLoginForm()
    resetRegisterForm()
    agreeTerms.value = false
    if (loginFormRef.value) {
      loginFormRef.value.clearValidate()
    }
    if (registerFormRef.value) {
      registerFormRef.value.clearValidate()
    }
  }

  return {
    loading,
    loginFormRef,
    registerFormRef,
    agreeTerms,
    loginForm,
    registerForm,
    handleLogin,
    handleRegister,
    resetRegisterForm,
    resetLoginForm,
    resetAll
  }
}
