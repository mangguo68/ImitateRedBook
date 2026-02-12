<template>
  <div class="user-search-results">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="user-skeleton-grid">
        <div 
          v-for="i in skeletonCount" 
          :key="'skeleton-' + i" 
          class="user-skeleton-item"
        >
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-nickname"></div>
            <div class="skeleton-bio"></div>
            <div class="skeleton-stats">
              <div class="skeleton-stat"></div>
              <div class="skeleton-stat"></div>
            </div>
          </div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="users.length === 0" class="empty-container">
      <el-empty description="暂无搜索结果">
        <el-button class="empty-reload-btn" @click="$emit('reload')">重新搜索</el-button>
      </el-empty>
    </div>
    
    <!-- 用户列表 -->
    <div v-else class="user-grid">
      <div 
        v-for="user in users" 
        :key="user._id" 
        class="user-card"
        @click="handleUserClick(user)"
      >
        <div class="user-avatar-wrapper">
          <el-avatar 
            :src="user.avatar || 'https://t.alcy.cc/moe'" 
            :size="60" 
            class="user-avatar"
          />
        </div>
        <div class="user-info">
          <h3 class="user-nickname">{{ user.nickname }}</h3>
          <p class="user-bio">{{ user.bio || '这个人很懒，什么都没有写' }}</p>
          <div class="user-stats">
            <span class="stat-item">{{ user.postsCount || 0 }} 笔记</span>
            <span class="stat-item">{{ user.followersCount || 0 }} 粉丝</span>
          </div>
        </div>
        <el-button 
          size="small" 
          :type="user.isFollowing ? 'default' : 'primary'" 
          round
          :loading="followingLoading[user._id]"
          @click.stop="handleFollow(user)"
        >
          {{ user.isFollowing ? '已关注' : '关注' }}
        </el-button>
      </div>
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { followUser, unfollowUser } from '@/apis/users'

// 定义组件props
interface User {
  _id: string
  nickname: string
  avatar?: string
  bio?: string
  postsCount?: number
  followersCount?: number
  isFollowing?: boolean
}

interface Props {
  users: User[]
  loading?: boolean
  skeletonCount?: number
}

// 定义组件emits
interface Emits {
  (e: 'user-click', user: User): void
  (e: 'follow', user: User): void
  (e: 'reload'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  skeletonCount: 6
})

const emit = defineEmits<Emits>()

const router = useRouter()
const followingLoading = ref<Record<string, boolean>>({})

// 方法
const handleUserClick = (user: User) => {
  emit('user-click', user)
}

const handleFollow = async (user: User) => {
  // 设置加载状态
  followingLoading.value[user._id] = true
  
  try {
    if (user.isFollowing) {
      await unfollowUser(user._id)
      user.isFollowing = false
      user.followersCount = Math.max(0, (user.followersCount || 0) - 1)
      ElMessage.success('取消关注成功')
    } else {
      await followUser(user._id)
      user.isFollowing = true
      user.followersCount = (user.followersCount || 0) + 1
      ElMessage.success('关注成功')
    }
    emit('follow', user)
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    // 清除加载状态
    followingLoading.value[user._id] = false
  }
}
</script>

<style scoped>
.user-search-results {
  width: 100%;
}

/* 加载状态样式 */
.loading-container {
  padding: 24px 0;
}

.user-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.user-skeleton-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  margin: 0 auto 16px;
}

.skeleton-content {
  margin-bottom: 16px;
}

.skeleton-nickname {
  width: 60%;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto 8px;
}

.skeleton-bio {
  width: 80%;
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto 12px;
}

.skeleton-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.skeleton-stat {
  width: 40px;
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-button {
  width: 60px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
  margin: 0 auto;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 空状态样式 */
.empty-container {
  padding: 80px 0;
  text-align: center;
}
  
/* 空状态按钮样式 */
.empty-reload-btn {
  margin-top: 8px;
  padding: 6px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-reload-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}

.user-avatar-wrapper {
  margin-bottom: 16px;
}

.user-avatar {
  border: 3px solid #f0f0f0;
}

.user-info {
  margin-bottom: 16px;
}

.user-nickname {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.user-bio {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}



/* 响应式设计 */
@media (max-width: 1024px) {
  .user-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .user-skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .user-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .user-card {
    padding: 16px;
  }
  
  .user-skeleton-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .user-skeleton-item {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .user-grid {
    gap: 12px;
  }
  
  .user-card {
    padding: 12px;
    border-radius: 14px;
  }
  
  .user-nickname {
    font-size: 14px;
  }
  
  .user-bio {
    font-size: 12px;
  }
  
  .user-skeleton-grid {
    gap: 12px;
  }
  
  .user-skeleton-item {
    padding: 12px;
  }
  
  .skeleton-avatar {
    width: 48px;
    height: 48px;
  }
  
  .skeleton-nickname {
    height: 14px;
  }
  
  .skeleton-bio {
    height: 12px;
  }
  
  .skeleton-stat {
    height: 10px;
  }
  
  .skeleton-button {
    height: 20px;
  }
}
</style>