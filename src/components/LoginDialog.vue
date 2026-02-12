<template>
  <el-dialog v-model="visible" title="" width="800px" :show-close="false" :close-on-click-modal="false"
    class="login-dialog rounded-3xl!" @closed="handleClose">
    <div class="login-container">
      <!-- 关闭按钮 -->
      <div class="close-btn-container">
        <el-button class="close-btn" circle :icon="Close" @click="handleClose" />
      </div>

      <!-- 登录模式 - 左右布局 -->
      <div v-if="!isRegisterMode" class="login-mode-container">
        <!-- 左侧二维码区域 -->
        <div class="qr-code-section">
          <div class="qr-code-container">
            <div class="qr-code-placeholder">
              <el-icon class="qr-icon">
                <ChatDotRound />
              </el-icon>
              <p class="qr-code-text">扫码登录</p>
              <p class="qr-code-subtext">使用小红书App扫码</p>
            </div>
          </div>
          <div class="qr-code-footer">
            <p class="qr-code-footer-text">扫码登录更安全</p>
            <p class="qr-code-footer-subtext">无需输入账号密码</p>
          </div>
        </div>

        <!-- 右侧登录表单区域 -->
        <div class="login-form-section">
          <div class="login-form">
            <h2 class="form-title">账号登录</h2>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" class="login-input">
                  <template #prefix>
                    <el-icon>
                      <User />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large"
                  class="login-input" show-password>
                  <template #prefix>
                    <el-icon>
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item class="register-link">
                <el-link type="primary" @click="switchToRegister">还没有账号？立即注册</el-link>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLoginSuccess">
                  登录
                </el-button>
              </el-form-item>

              <el-form-item class="terms-agreement">
                <el-checkbox v-model="agreeTerms" class="terms-checkbox">
                  我已经阅读并同意
                  <a href="#" class="terms-link">用户协议</a>
                  和
                  <a href="#" class="terms-link">隐私政策</a>
                </el-checkbox>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 注册模式 -->
      <div v-else class="register-mode-container">
        <!-- 左侧注册表单区域 -->
        <div class="register-form-section">
          <div class="login-form">
            <h2 class="form-title">注册账号</h2>
            <el-form id="registerForm" ref="registerFormRef" :model="registerForm" :rules="registerRules">
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large" class="login-input">
                  <template #prefix>
                    <el-icon>
                      <User />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large"
                  class="login-input" show-password>
                  <template #prefix>
                    <el-icon>
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large"
                  class="login-input" show-password>
                  <template #prefix>
                    <el-icon>
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="email">
                <el-input v-model="registerForm.email" placeholder="请输入邮箱" size="large" class="login-input">
                  <template #prefix>
                    <el-icon>
                      <Message />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item class="login-link">
                <el-link type="primary" @click="switchToLogin">已有账号？立即登录</el-link>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleRegisterSuccess">
                  注册
                </el-button>
              </el-form-item>

              <el-form-item class="terms-agreement">
                <el-checkbox v-model="agreeTerms" class="terms-checkbox">
                  我已经阅读并同意
                  <a href="#" class="terms-link">用户协议</a>
                  和
                  <a href="#" class="terms-link">隐私政策</a>
                </el-checkbox>
              </el-form-item>
            </el-form>
          </div>
        </div>
        
        <!-- 右侧注册福利区域 -->
        <div class="register-benefits-section">
          <div class="benefits-content">
            <h3 class="benefits-title">注册即享</h3>
            <div class="benefits-list">
              <div class="benefit-item">
                <el-icon class="benefit-icon">
                  <Present />
                </el-icon>
                <div class="benefit-text">
                  <p class="benefit-title-text">新人礼包</p>
                  <p class="benefit-desc">注册即送专属新人福利</p>
                </div>
              </div>
              <div class="benefit-item">
                <el-icon class="benefit-icon">
                  <Star />
                </el-icon>
                <div class="benefit-text">
                  <p class="benefit-title-text">发现精彩</p>
                  <p class="benefit-desc">海量优质内容等你探索</p>
                </div>
              </div>
              <div class="benefit-item">
                <el-icon class="benefit-icon">
                  <UserFilled />
                </el-icon>
                <div class="benefit-text">
                  <p class="benefit-title-text">关注达人</p>
                  <p class="benefit-desc">一键关注感兴趣的创作者</p>
                </div>
              </div>
              <div class="benefit-item">
                <el-icon class="benefit-icon">
                  <ChatLineRound />
                </el-icon>
                <div class="benefit-text">
                  <p class="benefit-title-text">互动交流</p>
                  <p class="benefit-desc">与社区用户分享交流</p>
                </div>
              </div>
            </div>
            <div class="benefits-footer">
              <p class="footer-text">加入小红书，发现美好生活</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { User, Lock, Close, ChatDotRound, Star, Message, Present, UserFilled, ChatLineRound } from '@element-plus/icons-vue'
import { useLoginRegister } from '@/composables/useLoginRegister'
import { loginRules, registerRules } from '@/composables/useFormValidation'
import type { User as UserType } from '@/types'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  success: [userInfo: UserType | null]
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isRegisterMode = ref(false)

const {
  loading,
  loginFormRef,
  registerFormRef,
  agreeTerms,
  loginForm,
  registerForm,
  handleLogin,
  handleRegister,
  resetLoginForm,
  resetAll
} = useLoginRegister()

const handleLoginSuccess = () => {
  handleLogin((userInfo) => {
    emit('success', userInfo)
    handleClose()
  })
}

const handleRegisterSuccess = () => {
  handleRegister((userInfo) => {
    emit('success', userInfo)
    visible.value = false
  })
}

const switchToRegister = () => {
  isRegisterMode.value = true
}

const switchToLogin = () => {
  isRegisterMode.value = false
}

const handleClose = () => {
  visible.value = false
  resetLoginForm()
}

watch(visible, (newVal) => {
  if (newVal) {
    resetAll()
    isRegisterMode.value = false
  }
})
</script>

<style scoped>
:deep(.el-checkbox__inner) {
  border-radius: 4px;
}

:deep(.el-form-item__content) {
  justify-content: center;
}

.login-dialog {
  border-radius: var(--login-border-radius);
  overflow: hidden;
}

.login-container {
  padding: 0;
  background: white;
  border-radius: var(--login-border-radius);
  position: relative;
}

.close-btn-container {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.close-btn {
  background: #f0f0f0;
  border: none;
  color: var(--text-primary);
  transition: all 0.3s;
}

.close-btn:hover {
  background: var(--login-bg-hover);
  transform: scale(1.1);
}

.login-mode-container {
  display: flex;
  min-height: 500px;
}

.qr-code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  border-right: 1px solid var(--login-border-color);
}

.qr-code-container {
  margin-bottom: 32px;
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--login-shadow);
  padding: 24px;
}

.qr-icon {
  font-size: 48px;
  color: var(--login-primary-color);
  margin-bottom: 16px;
}

.qr-code-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.qr-code-subtext {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
}

.qr-code-footer {
  text-align: center;
}

.qr-code-footer-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.qr-code-footer-subtext {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.login-form-section {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
}

.login-form {
  width: 100%;
  max-width: 320px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 32px 0;
  text-align: center;
}

.login-input {
  border-radius: var(--login-input-radius);
  border: 2px solid #f0f0f0;
  transition: all 0.3s;
}

.login-input:hover,
.login-input:focus {
  border-color: var(--login-primary-color);
  box-shadow: var(--login-focus-shadow);
}

.login-input :deep(.el-input__wrapper) {
  border-radius: var(--login-input-radius);
  box-shadow: none;
  border: none;
  background: transparent;
}

.register-link,
.login-link {
  text-align: right;
  margin-bottom: 20px !important;
}

.login-btn {
  width: 100%;
  background: var(--login-primary-gradient);
  border: none;
  border-radius: var(--login-btn-radius);
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--login-btn-shadow);
}

.terms-agreement {
  margin-top: 16px !important;
  margin-bottom: 0 !important;
}

.terms-checkbox {
  font-size: 12px;
  color: var(--text-secondary);
}

.terms-link {
  color: var(--login-primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

.terms-link:hover {
  color: var(--login-primary-hover);
  text-decoration: underline;
}

.register-mode-container {
  display: flex;
  min-height: 500px;
}

.register-form-section {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  border-right: 1px solid var(--login-border-color);
}

.register-benefits-section {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefits-content {
  width: 100%;
  max-width: 320px;
}

.benefits-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 32px 0;
  text-align: center;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.benefit-icon {
  font-size: 24px;
  color: var(--login-primary-color);
  margin-top: 2px;
  flex-shrink: 0;
}

.benefit-text {
  flex: 1;
}

.benefit-title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.benefit-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.benefits-footer {
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
</style>