<template>
  <div class="notification-container">
    <div class="notification-header">
      <h2>通知</h2>
    </div>

    <div class="notification-tabs">
      <el-tabs type="card" v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="点赞" name="like"></el-tab-pane>
        <el-tab-pane label="评论" name="comment"></el-tab-pane>
        <el-tab-pane label="关注" name="follow"></el-tab-pane>
        <el-tab-pane label="收藏" name="collect"></el-tab-pane>
      </el-tabs>
    </div>

    <div class="notification-content">
      <!-- 未登录状态 -->
      <div v-if="!isLoggedIn" class="login-prompt-container">
        <div class="login-prompt-content">
          <div class="login-icon">
            <el-icon class="icon">
              <Avatar />
            </el-icon>
          </div>
          <h2 class="login-title">请先登录</h2>
          <p class="login-description">登录后才能查看通知</p>
          <div class="button-group">
            <el-button type="primary" @click="handleLogin" style="border-radius: 24px; padding: 8px 32px;">
              登录 / 注册
            </el-button>
            <el-button @click="handleBackToHome" style="border-radius: 24px; padding: 8px 32px;">
              返回首页
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-alert :title="error" type="error" show-icon :closable="false" />
        <el-button type="primary" @click="loadNotifications">重试</el-button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="notifications.length === 0" class="empty-container">
        <el-empty description="暂无通知" />
      </div>

      <!-- 通知列表 -->
      <div v-else class="notification-list">
        <div v-for="notification in notifications" :key="notification._id" class="notification-item">
          <div class="notification-avatar cursor-pointer" @click="handleAvatarClick(notification.uid)">
            <el-avatar :src="notification.userAvatar || ''" />
          </div>
          <div class="notification-body">
            <div class="notification-message">
              <span class="notification-username cursor-pointer" @click="handleAvatarClick(notification.uid)">{{
                notification.username }}</span>
              <span v-if="notification.notificationType === 'like'">赞了你的笔记</span>
              <span v-else-if="notification.notificationType === 'comment'">评论了你的笔记</span>
              <span v-else-if="notification.notificationType === 'follow'">关注了你</span>
              <span v-else-if="notification.notificationType === 'collect'">收藏了你的笔记</span>
            </div>
            <div class="notification-time">
              {{ formatTime(notification.createdAt) }}
            </div>
          </div>
          <div v-if="notification.noteCover && notification.noteId" class="notification-note cursor-pointer"
            @click="handleNoteClick(notification.noteId)">
            <img :src="notification.noteCover" alt="笔记封面" />
          </div>
          <div v-else-if="notification.notificationType !== 'follow' && notification.noteId"
            class="notification-note notification-note-placeholder cursor-pointer"
            @click="handleNoteClick(notification.noteId)">
            <div class="placeholder-content">
              <el-icon class="placeholder-icon">
                <Document />
              </el-icon>
              <span class="placeholder-text">无封面</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 笔记详情对话框 -->
  <NoteDetail v-model:dialogVisible="showNoteDetail" :noteId="currentNoteId" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Avatar } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getUserNotifications } from '@/apis/users'
import NoteDetail from '@/views/NoteDetail.vue'

interface Notification {
  _id: string
  userAvatar: string
  username: string
  notificationType: 'like' | 'comment' | 'follow' | 'collect'
  noteCover?: string
  createdAt: string
  uid: string
  noteId?: string
}

const router = useRouter()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)
const activeTab = ref('all')
const notifications = ref<Notification[]>([])
const loading = ref(false)
const error = ref('')

// 笔记详情对话框状态
const showNoteDetail = ref(false)
const currentNoteId = ref('')

// 登录处理
const handleLogin = () => {
  authStore.openLoginDialog()
}

// 返回首页
const handleBackToHome = () => {
  router.push('/')
}

// 加载通知
const loadNotifications = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await getUserNotifications(activeTab.value)
    notifications.value = result.notifications || []
  } catch (err) {
    error.value = '加载通知失败'
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

// 处理标签页切换
const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name
  loadNotifications()
}

// 处理头像点击，跳转到用户个人主页
const handleAvatarClick = (userId: string) => {
  router.push({
    name: 'user-profile',
    params: { uid: userId }
  })
}

// 处理笔记封面点击，显示笔记详情对话框
const handleNoteClick = (noteId: string) => {
  currentNoteId.value = noteId
  showNoteDetail.value = true
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString()
}

// 组件挂载时加载通知
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
}

/* 自定义 tab 样式 */
:deep(.el-tabs__nav-wrap::after) {
  display: none !important;
}

:deep(.el-tabs__item) {
  border-radius: 20px !important;
  margin: 0 4px !important;
  transition: all 0.3s ease;
  border: none !important;
  font-weight: 800 !important;
}

:deep(.el-tabs__item:not(.is-active)) {
  font-weight: 800 !important;
}

:deep(.el-tabs__item.is-active) {
  background-color: #f5f7fa !important;
  color: #ff4757 !important;
  font-weight: 800 !important;
  border: none !important;
}

:deep(.el-tabs__active-bar) {
  display: none !important;
}

/* 移除 card 类型的边框 */
:deep(.el-tabs--card>.el-tabs__header) {
  border-bottom: none !important;
}

:deep(.el-tabs--card>.el-tabs__header .el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs--card>.el-tabs__header .el-tabs__item) {
  border: none !important;
  border-bottom: none !important;
}

.notification-header {
  margin-bottom: 20px;
}

.notification-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.notification-tabs {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.loading-container,
.error-container,
.empty-container {
  padding: 40px 0;
}

.error-container {
  text-align: center;
}

.error-container .el-button {
  margin-top: 20px;
}

/* 登录提示页面样式 */
.login-prompt-container {
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-prompt-content {
  background-color: white;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.login-icon {
  margin-bottom: 24px;
}

.login-icon .icon {
  font-size: 64px;
  color: #ff4757;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.login-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.button-group .el-button {
  flex: 1;
  min-width: 120px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background-color: #fff;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.notification-item:hover {
  transform: translateY(-2px);
}

.notification-avatar {
  margin-right: 12px;
}

.notification-body {
  flex: 1;
}

.notification-message {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-username {
  font-weight: 600;
  color: #333;
  margin-right: 8px;
  cursor: pointer;
}

.notification-username:hover {
  color: #ff4757;
}

.cursor-pointer {
  cursor: pointer;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-note {
  margin-left: 12px;
}

.notification-note img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.notification-note-placeholder {
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
}

.placeholder-content {
  text-align: center;
  color: #909399;
}

.placeholder-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.placeholder-text {
  font-size: 10px;
  display: block;
}

@media (max-width: 768px) {
  .notification-container {
    padding: 16px;
  }

  .notification-header h2 {
    font-size: 20px;
  }

  .notification-note img {
    width: 50px;
    height: 50px;
  }

  .notification-note-placeholder {
    width: 50px;
    height: 50px;
  }

  .placeholder-icon {
    font-size: 16px;
  }

  .placeholder-text {
    font-size: 8px;
  }

  .login-prompt-content {
    padding: 32px;
  }

  .login-icon .icon {
    font-size: 48px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-description {
    font-size: 14px;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .el-button {
    width: 100%;
    margin-top: 8px;
  }
}
</style>