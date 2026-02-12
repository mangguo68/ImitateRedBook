<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 顶部用户信息 -->
      <div class="profile-header">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="error" class="error-state">
          <el-alert title="加载失败" type="error" description="无法加载用户信息，请稍后重试" show-icon :closable="false" />
          <el-button type="primary" @click="loadUserProfile">重新加载</el-button>
        </div>
        <div v-else class="user-info">
          <div class="user-info-left">
            <div class="avatar" @click="handleAvatarClick">
              <img
                :src="userProfile.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=profile%20avatar%20portrait%20professional&image_size=square'"
                :alt="userProfile.nickname">
              <div class="avatar-overlay">
                <el-icon>
                  <svg t="1763991069325" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="4169" width="200" height="200">
                    <path d="M831.6 639.6h-63.9v127.9H639.9v63.9h127.9v127.9h63.9V831.4h127.9v-63.9H831.6z" p-id="4170"
                      fill="#fff"></path>
                    <path
                      d="M564.3 925.2c0-18.5-15-33.6-33.6-33.6H287.3c-86.2 0-156.4-70.2-156.4-156.4V286.9c0-86.2 70.1-156.4 156.4-156.4h448.4c86.2 0 156.4 70.2 156.4 156.4v238.8c0 18.5 15 33.6 33.6 33.6s33.6-15 33.6-33.6V286.9C959.2 163.6 859 63.3 735.7 63.3H287.3C164 63.3 63.7 163.6 63.7 286.8v448.3c0 123.2 100.3 223.5 223.6 223.5h243.4c18.6 0 33.6-14.9 33.6-33.4z"
                      p-id="4171" fill="#fff"></path>
                  </svg>
                </el-icon>
                <span>更换头像</span>
              </div>
            </div>
            <input type="file" ref="avatarInputRef" accept="image/*" style="display: none" @change="handleAvatarChange">
            <div class="user-details">
              <h2 class="username">{{ userProfile.nickname || `用户${uid}` }}</h2>
              <p class="bio">{{ userProfile.bio || '暂无个人简介' }}</p>
              <div class="stats">
                <div class="stat-item">
                  <span class="stat-value">{{ userProfile.postsCount || 0 }}</span>
                  <span class="stat-label">笔记</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ userProfile.followersCount || 0 }}</span>
                  <span class="stat-label">粉丝</span>
                </div>
                <el-popover placement="top" :width="300" :trigger="'click'" v-model:visible="followingPopoverVisible"
                  @show="loadUserFollowing">
                  <template #reference>
                    <div class="stat-item cursor-pointer">
                      <span class="stat-value">{{ userProfile.followingCount || 0 }}</span>
                      <span class="stat-label">关注</span>
                    </div>
                  </template>
                  <div class="following-popover">
                    <h3 class="popover-title">关注列表</h3>
                    <div v-if="loadingFollowing" class="loading-state">
                      <el-skeleton :rows="3" animated />
                    </div>
                    <div v-else-if="errorFollowing" class="error-state">
                      <el-alert title="加载失败" type="error" description="无法加载关注列表，请稍后重试" show-icon :closable="false" />
                    </div>
                    <div v-else-if="following.length === 0" class="empty-state">
                      <el-icon class="empty-icon">
                        <Document />
                      </el-icon>
                      <p>还没有关注任何人</p>
                    </div>
                    <div v-else class="following-list">
                      <div class="follower-item" v-for="item in following" :key="item._id">
                        <div class="follower-avatar cursor-pointer" @click="handleFollowerClick(item)">
                          <el-image
                            :src="item.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=profile%20avatar%20portrait%20professional&image_size=square'"
                            :alt="item.nickname" />
                        </div>
                        <div class="follower-info">
                          <h4 class="follower-name">{{ item.nickname || item.username }}</h4>
                          <p class="follower-bio">{{ item.bio || '这个人很懒，什么都没有写' }}</p>
                        </div>
                        <el-button size="small" :type="item.isFollowing ? 'default' : 'primary'" round
                          @click="handleFollow(item)">
                          {{ item.isFollowing ? '已关注' : '关注' }}
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
          <div v-if="isOtherUserProfile" class="back-button" @click="handleBackToMyProfile">
            <el-icon>
              <IconBack />
            </el-icon>
            <span>返回我的主页</span>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="profile-content">
        <div class="content-tabs">
          <div class="tab" :class="{ active: activeTab === 'notes' }" @click="handleTabChange('notes')">笔记</div>
          <div class="tab" :class="{ active: activeTab === 'collections' }" @click="handleTabChange('collections')">收藏
          </div>
          <div class="tab" :class="{ active: activeTab === 'followers' }" @click="handleTabChange('followers')">粉丝</div>
        </div>

        <!-- 笔记列表 -->
        <div v-if="activeTab === 'notes'" class="note-list" :style="{ display: loadingNotes ? 'block' : 'grid' }">
          <div v-if="loadingNotes" class="loading-notes">
            <el-skeleton v-for="i in 6" :key="i" animated>
              <template #template>
                <el-skeleton-item variant="image" style="height: 200px" />
                <el-skeleton-item variant="p" style="width: 80%" />
                <el-skeleton-item variant="text" style="width: 60%" />
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="errorNotes" class="error-notes">
            <el-alert title="加载失败" type="error" description="无法加载笔记列表，请稍后重试" show-icon :closable="false" />
          </div>
          <div v-else-if="notes.length === 0" class="empty-state">
            <el-icon class="empty-icon">
              <Document />
            </el-icon>
            <p>还没有发布过笔记</p>
          </div>
          <div v-else class="note-item" v-for="note in notes" :key="note._id" @click="handleNoteClick(note)">
            <el-card class="rounded-[8px]! cursor-pointer" :body-style="{ padding: '0' }" shadow="hover">
              <el-image fit="cover" :src="note.images[0]" class="note-image" alt="笔记图片">
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <div class="note-content">
                <h3 class="note-title">{{ note.title }}</h3>
                <p class="note-desc">{{ note.content.substring(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}
                </p>
                <div class="note-meta">
                  <span class="note-time">{{ formatDate(note.createdAt) }}</span>
                  <div class="note-actions">
                    <span class="action-item">{{ note.likesCount || 0 }} 赞</span>
                    <span class="action-item">{{ note.commentsCount || 0 }} 评论</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div v-if="activeTab === 'collections'" class="note-list"
          :style="{ display: loadingCollections ? 'block' : 'grid' }">
          <div v-if="loadingCollections" class="loading-notes">
            <el-skeleton v-for="i in 6" :key="i" animated>
              <template #template>
                <el-skeleton-item variant="image" style="height: 200px" />
                <el-skeleton-item variant="p" style="width: 80%" />
                <el-skeleton-item variant="text" style="width: 60%" />
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="errorCollections" class="error-notes">
            <el-alert title="加载失败" type="error" description="无法加载收藏列表，请稍后重试" show-icon :closable="false" />
          </div>
          <div v-else-if="collections.length === 0" class="empty-state">
            <el-icon class="empty-icon">
              <Document />
            </el-icon>
            <p>还没有收藏过笔记</p>
          </div>
          <div v-else class="note-item" v-for="item in collections" :key="item._id" @click="handleNoteClick(item)">
            <el-card class="rounded-[8px]! cursor-pointer" :body-style="{ padding: '0' }" shadow="hover">
              <el-image fit="cover" :src="item.images[0]" class="note-image" alt="笔记图片">
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <div class="note-content">
                <h3 class="note-title">{{ item.title }}</h3>
                <p class="note-desc">{{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}
                </p>
                <div class="note-meta">
                  <span class="note-time">{{ formatDate(item.createdAt) }}</span>
                  <div class="note-actions">
                    <span class="action-item">{{ item.likesCount || 0 }} 赞</span>
                    <span class="action-item">{{ item.commentsCount || 0 }} 评论</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 粉丝列表 -->
        <div v-if="activeTab === 'followers'" class="followers-list">
          <div v-if="loadingFollowers" class="loading-followers">
            <el-skeleton v-for="i in 6" :key="i" animated>
              <template #template>
                <div class="follower-item">
                  <el-skeleton-item variant="circle" style="width: 60px; height: 60px" />
                  <el-skeleton-item variant="text" style="width: 120px" />
                </div>
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="errorFollowers" class="error-followers">
            <el-alert title="加载失败" type="error" description="无法加载粉丝列表，请稍后重试" show-icon :closable="false" />
          </div>
          <div v-else-if="followers.length === 0" class="empty-state">
            <el-icon class="empty-icon">
              <Document />
            </el-icon>
            <p>还没有粉丝</p>
          </div>
          <div v-else class="follower-item" v-for="follower in followers" :key="follower._id">
            <div class="follower-avatar cursor-pointer" @click="handleFollowerClick(follower)">
              <img
                :src="follower.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=profile%20avatar%20portrait%20professional&image_size=square'"
                :alt="follower.nickname">
            </div>
            <div class="follower-info">
              <h4 class="follower-name">{{ follower.nickname || follower.username }}</h4>
              <p class="follower-bio">{{ follower.bio || '这个人很懒，什么都没有写' }}</p>
            </div>
            <el-button size="small" :type="follower.isFollowing ? 'default' : 'primary'" round
              @click="handleFollow(follower)">
              {{ follower.isFollowing ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 笔记详情对话框 -->
    <NoteDetail v-model:dialogVisible="dialogVisible" :note="selectedNote" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser, uploadAvatar } from '@/apis/users'
import { getNotes, getUserCollections } from '@/apis/notes'
import type { Note } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import NoteDetail from '@/views/NoteDetail.vue'
import IconBack from '@/components/icons/IconBack.vue'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()
const uid = computed(() => {
  // 优先使用路由参数中的uid，如果没有则使用当前登录用户的_id
  return route.params.uid as string || authStore.userInfo?._id || ''
})

// 判断是否是其他用户的个人主页
const isOtherUserProfile = computed(() => {
  const currentUser = authStore.getUserInfo
  return currentUser && uid.value !== currentUser._id
})

// 响应式数据
const loading = ref(true)
const error = ref(false)
const userProfile = ref({
  nickname: '',
  avatar: '',
  bio: '',
  postsCount: 0,
  followersCount: 0,
  followingCount: 0
})

// 笔记相关数据
const loadingNotes = ref(true)
const errorNotes = ref(false)
const notes = ref<any[]>([])

// 收藏相关数据
const loadingCollections = ref(false)
const errorCollections = ref(false)
const collections = ref<any[]>([])

// 粉丝相关数据
const loadingFollowers = ref(false)
const errorFollowers = ref(false)
const followers = ref<any[]>([])

// 当前激活的标签页
const activeTab = ref('notes')

// 笔记详情对话框状态
const dialogVisible = ref(false)
// 当前选中的笔记
const selectedNote = ref<Note | null>(null)

// 关注列表相关状态
const following = ref<any[]>([])
const loadingFollowing = ref(false)
const errorFollowing = ref(false)
const followingPopoverVisible = ref(false)

// 头像上传相关状态
const avatarInputRef = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true
  error.value = false
  try {
    const profile = await getUserProfile(uid.value)
    userProfile.value = profile
  } catch (err) {
    console.error('加载用户信息失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 加载用户笔记
const loadUserNotes = async () => {
  loadingNotes.value = true
  errorNotes.value = false
  try {
    const result = await getNotes({ userId: uid.value })
    notes.value = result.posts || []
  } catch (err) {
    console.error('加载用户笔记失败:', err)
    errorNotes.value = true
  } finally {
    loadingNotes.value = false
  }
}

// 加载用户收藏
const loadUserCollections = async () => {
  loadingCollections.value = true
  errorCollections.value = false
  try {
    const result = await getUserCollections({ userId: uid.value })
    collections.value = result.notes || []
  } catch (err) {
    console.error('加载用户收藏失败:', err)
    errorCollections.value = true
  } finally {
    loadingCollections.value = false
  }
}

// 加载用户粉丝
const loadUserFollowers = async () => {
  loadingFollowers.value = true
  errorFollowers.value = false
  try {
    const result = await getUserFollowers(uid.value)
    followers.value = result.followers || []
  } catch (err) {
    console.error('加载用户粉丝失败:', err)
    errorFollowers.value = true
  } finally {
    loadingFollowers.value = false
  }
}

// 加载用户关注列表
const loadUserFollowing = async () => {
  loadingFollowing.value = true
  errorFollowing.value = false
  try {
    const result = await getUserFollowing(uid.value)
    following.value = result.following || []
  } catch (err) {
    console.error('加载用户关注列表失败:', err)
    errorFollowing.value = true
  } finally {
    loadingFollowing.value = false
  }
}

// 处理点击粉丝头像
const handleFollowerClick = (follower: any) => {
  followingPopoverVisible.value = false
  router.push({
    name: 'user-profile',
    params: { uid: follower._id }
  })
}

// 处理返回自己的主页
const handleBackToMyProfile = () => {
  const currentUser = authStore.getUserInfo
  if (currentUser) {
    router.push({
      name: 'user-profile',
      params: { uid: currentUser._id }
    })
  }
}

// 处理关注和取消关注
const handleFollow = async (user: any) => {
  // 检查是否是自己，防止关注自己
  const currentUser = authStore.getUserInfo
  if (currentUser && currentUser._id === user._id) {
    ElMessage.warning('不能关注自己')
    return
  }

  try {
    // 切换关注状态
    const newFollowState = !user.isFollowing

    // 先更新本地状态，提供即时反馈
    user.isFollowing = newFollowState
    // 更新关注数量
    userProfile.value.followingCount = (userProfile.value.followingCount || 0) + (newFollowState ? 1 : -1)

    // 调用API
    if (newFollowState) {
      await followUser(user._id)
    } else {
      await unfollowUser(user._id)
    }

    // 关注成功提示
    ElMessage.success(newFollowState ? '关注成功' : '取消关注成功')

    // 重新加载关注列表，以确保数据一致性
    await loadUserFollowing()
  } catch (error: any) {
    // 错误处理，恢复原状态
    user.isFollowing = !user.isFollowing
    // 恢复关注数量
    userProfile.value.followingCount = (userProfile.value.followingCount || 0) + (user.isFollowing ? 1 : -1)
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 处理头像点击
const handleAvatarClick = () => {
  // 检查是否是当前用户的个人主页
  const currentUser = authStore.getUserInfo
  if (!currentUser || currentUser._id !== uid.value) {
    ElMessage.warning('只能更换自己的头像')
    return
  }

  // 触发文件选择
  avatarInputRef.value?.click()
}

// 处理头像文件选择
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  uploadingAvatar.value = true

  try {
    // 读取文件为base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // 上传头像
    const result = await uploadAvatar({
      avatar: base64,
      name: file.name,
      contentType: file.type
    })

    // 更新本地头像
    userProfile.value.avatar = result.url

    // 更新authStore中的用户信息
    authStore.updateUser({
      avatar: result.url
    })

    ElMessage.success('头像更新成功')
  } catch (error: any) {
    console.error('上传头像失败:', error)
    ElMessage.error('头像更新失败，请稍后重试')
  } finally {
    uploadingAvatar.value = false
    // 清空input，允许重复选择同一文件
    if (target) {
      target.value = ''
    }
  }
}

// 切换标签页
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  if (tab === 'notes') {
    loadUserNotes()
  } else if (tab === 'collections') {
    loadUserCollections()
  } else if (tab === 'followers') {
    loadUserFollowers()
  }
}

// 处理笔记点击
const handleNoteClick = (note: Note) => {
  selectedNote.value = note
  notesStore.setSelectedNote(note)
  dialogVisible.value = true
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadUserProfile()
  await loadUserNotes()
})

// 监听路由参数变化，重新加载数据
watch(
  () => route.params.uid,
  (newUid, oldUid) => {
    if (newUid && newUid !== oldUid) {
      activeTab.value = 'notes'
      loadUserProfile()
      loadUserNotes()
    }
  }
)
</script>

<style scoped>
.image-placeholder,
.image-error {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 24px;
}

.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
}

.profile-header {
  padding: 40px 24px;
}

.loading-state {
  padding: 40px 0;
}

.error-state {
  padding: 40px 0;
  text-align: center;
}

.error-state .el-button {
  margin-top: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.back-button:hover {
  background-color: #e8e8e8;
  color: #333;
}

.back-button .el-icon {
  font-size: 16px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0f0f0;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: #ff4757;
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  color: white;
}

.avatar-overlay span {
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.bio {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.cursor-pointer {
  cursor: pointer;
}

.profile-content {
  padding: 24px;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 24px;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #ff4757;
  border-bottom-color: #ff4757;
}

.note-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.loading-notes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.error-notes {
  grid-column: 1 / -1;
  padding: 40px 0;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 笔记项样式 */
.note-item {
  transition: all 0.3s ease;
  cursor: pointer;
}

.note-item:hover {
  transform: translateY(-4px);
}

.note-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.note-content {
  padding: 16px;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.note-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.note-time {
  flex: 1;
}

.note-actions {
  display: flex;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 粉丝列表样式 */
.followers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 关注列表Popover样式 */
.following-popover {
  max-height: 300px;
  overflow-y: auto;
}

.popover-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.following-popover .loading-state {
  padding: 16px 0;
}

.following-popover .error-state {
  padding: 8px 0;
}

.following-popover .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #999;
}

.following-popover .empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.following-popover .following-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.following-popover .follower-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.following-popover .follower-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.following-popover .follower-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.following-popover .follower-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.following-popover .follower-info {
  flex: 1;
  min-width: 0;
}

.following-popover .follower-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.following-popover .follower-bio {
  font-size: 12px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.following-popover .el-button {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .following-popover {
    max-height: 250px;
  }

  .following-popover .follower-item {
    padding: 8px;
  }

  .following-popover .follower-avatar {
    width: 40px;
    height: 40px;
  }
}

.loading-followers {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-followers .follower-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 14px;
}

.error-followers {
  padding: 40px 0;
}

.follower-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.follower-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.follower-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.follower-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follower-info {
  flex: 1;
  min-width: 0;
}

.follower-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.follower-bio {
  font-size: 14px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    max-width: 100%;
  }

  .profile-header {
    padding: 24px 16px;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .stats {
    justify-content: center;
  }

  .profile-content {
    padding: 16px;
  }

  .note-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .loading-notes {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .note-image {
    height: 120px;
  }

  .note-content {
    padding: 12px;
  }

  .note-title {
    font-size: 14px;
  }

  .note-desc {
    font-size: 12px;
  }

  .follower-item {
    padding: 12px;
  }

  .follower-avatar {
    width: 50px;
    height: 50px;
  }

  .follower-name {
    font-size: 14px;
  }

  .follower-bio {
    font-size: 12px;
  }
}
</style>