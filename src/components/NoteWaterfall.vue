<template>
  <div class="note-waterfall">
    <!-- 内容区域 - 瀑布流 -->
    <transition name="fade" mode="out-in">
      <div class="content-container" key="content">
        <WaterfallLayout 
          :dataList="formattedItems" 
          :loading="loading" 
          :cols="WATERFALL_CONFIG.COLS"
          :gap="WATERFALL_CONFIG.GAP" 
          @load-more="handleLoadMore"
        >
          <template #item="{ item }">
            <div class="waterfall-item hover:cursor-pointer" @click="handleItemClick(item)">
              <!-- 封面 -->
              <div class="image-container">
                <template v-if="item.images && item.images.length > 0">
                  <el-image 
                    :src="item.images[0]" 
                    :alt="item.title" 
                    class="item-cover" 
                    fit="cover" 
                    lazy
                  >
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
                </template>
                <div v-else class="image-placeholder image-placeholder-empty">
                  <el-icon>
                    <Picture />
                  </el-icon>
                </div>
                <div class="image-overlay">
                  <!-- 收藏按钮 -->
                  <el-button 
                    circle 
                    size="small" 
                    :class="['overlay-btn', { 'collected': item.isCollected }]"
                    @click.stop="handleCollect(item)"
                  >
                    <el-icon>
                      <Star />
                    </el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 标题 -->
              <div class="item-title">{{ item.title }}</div>

              <!-- 底部区域 -->
              <div class="item-bottom">
                <!-- 左侧：用户头像+用户名 -->
                <div class="user-info">
                  <el-avatar 
                    :src="(item.userId as any)?.avatar || 'https://t.alcy.cc/moe'" 
                    :size="24"
                    class="user-avatar" 
                  />
                  <span class="user-name">{{ (item.userId as any)?.nickname || '未知用户' }}</span>
                </div>

                <!-- 右侧：点赞 -->
                <div class="like-info">
                  <el-button 
                    circle 
                    size="small" 
                    :class="['like-btn', { 'liked': item.isLiked }]"
                    @click.stop="handleLike(item)"
                  >
                    <el-icon>
                      <HeatLike :isLiked="item.isLiked" />
                    </el-icon>
                  </el-button>
                  <span class="like-count">{{ item.formattedLikes }}</span>
                </div>
              </div>
            </div>
          </template>
          
          <template #loading>
            <div class="loading-container">
              <div class="skeleton-grid">
                <div 
                  v-for="i in WATERFALL_CONFIG.SKELETON_COUNT" 
                  :key="'skeleton-' + i" 
                  class="skeleton-item"
                >
                  <div class="skeleton-image"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-footer">
                      <div class="skeleton-avatar"></div>
                      <div class="skeleton-text"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template #empty>
            <el-empty description="暂无内容">
              <el-button class="empty-reload-btn" @click="handleReload">重新加载</el-button>
            </el-empty>
          </template>
        </WaterfallLayout>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star, Picture } from '@element-plus/icons-vue'
import WaterfallLayout from '@/components/WaterfallLayout.vue'
import type { Note } from '@/types'
import { formatLikeCount } from '@/utils/formatters'
import { WATERFALL_CONFIG } from '@/config/constants'
import HeatLike from '@/components/icons/HeatLike.vue'

// 定义组件props
interface Props {
  notes: Note[]
  loading?: boolean
}

// 定义组件emits
interface Emits {
  (e: 'load-more'): void
  (e: 'reload'): void
  (e: 'item-click', note: Note): void
  (e: 'like', note: Note): void
  (e: 'collect', note: Note): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 格式化数据
const formattedItems = computed(() =>
  props.notes.map(item => ({
    ...item,
    formattedLikes: formatLikeCount(item.likesCount || 0)
  }))
)

// 事件处理函数
const handleLoadMore = () => {
  emit('load-more')
}

const handleReload = () => {
  emit('reload')
}

const handleItemClick = (item: Note) => {
  emit('item-click', item)
}

const handleLike = (item: Note) => {
  emit('like', item)
}

const handleCollect = (item: Note) => {
  emit('collect', item)
}
</script>

<style scoped>
.note-waterfall {
  width: 100%;
}

/* 内容区域样式 */
.content-container {
  padding: 24px;
}

.waterfall-item {
  background: transparent;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.waterfall-item:hover {
  transform: translateY(-2px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图片容器 */
.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

/* 封面样式 */
.item-cover {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.image-container:hover .item-cover {
  transform: scale(1.05);
}

/* 蒙版效果 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px;
  pointer-events: none;
}

.overlay-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #333;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  pointer-events: auto;
}

.overlay-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.overlay-btn.collected {
  color: #ffb800;
  background-color: rgba(255, 184, 0, 0.1);
}

.overlay-btn.collected:hover {
  color: #ffb800;
  background-color: rgba(255, 184, 0, 0.2);
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 24px;
}

.image-placeholder-empty {
  min-height: 200px;
}

/* 标题样式 */
.item-title {
  padding: 8px 0 4px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部区域样式 */
.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 0;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
}

/* 点赞信息 */
.like-info {
  display: flex;
  align-items: center;
}

.like-btn {
  padding: 4px !important;
  border: none;
  background-color: transparent;
  color: #999;
  transition: all 0.2s;
}

.like-btn:hover {
  color: #ff2442;
  background-color: rgba(255, 36, 66, 0.1);
}

.like-btn.liked {
  color: #ff2442;
  background-color: rgba(255, 36, 66, 0.1);
}

.like-btn.liked:hover {
  color: #ff2442;
  background-color: rgba(255, 36, 66, 0.2);
}

.like-count {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  line-height: 1rem;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
  gap: 12px;
  width: 100%;
}

/* 空状态样式 */
.empty-icon {
  font-size: 48px;
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 骨架屏样式 */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  padding: 0 24px;
  width: 100%;
}

.skeleton-item {
  width: 100%;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
  margin-bottom: 12px;
}

.skeleton-content {
  width: 100%;
}

.skeleton-title {
  width: 80%;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.skeleton-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 50%;
}

.skeleton-text {
  width: 60%;
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .waterfall-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .content-container {
    padding: 16px;
  }

  .waterfall-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .waterfall-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>