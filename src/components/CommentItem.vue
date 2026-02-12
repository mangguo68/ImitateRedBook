<script setup lang="ts">
import { ref } from 'vue'
import { ElAvatar, ElIcon } from 'element-plus'
import { Star, Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import type { Comment } from '@/types'

// 定义组件props
const props = defineProps<{
  comment: Comment
}>()

// 定义组件事件
const emit = defineEmits<{
  (e: 'reply', comment: Comment): void
  (e: 'like', commentId: string, isLiked: boolean): void
}>()

// 路由实例
const router = useRouter()

// 评论点赞加载状态
const isLiking = ref(false)

// 方法
const handleReply = (comment: Comment) => {
  emit('reply', comment)
}

const handleLike = (commentId: string, isLiked: boolean) => {
  if (isLiking.value) return
  isLiking.value = true
  emit('like', commentId, isLiked)
  // 重置加载状态（实际应该在父组件的回调中重置，但这里为了简化，使用setTimeout模拟）
  setTimeout(() => {
    isLiking.value = false
  }, 1000)
}

// 处理头像点击
const handleAvatarClick = (userId: string) => {
  router.push({
    name: 'user-profile',
    params: { uid: userId }
  })
}


</script>

<template>
  <div class="comment-item mb-3">
    <div class="flex gap-2">
      <el-avatar :src="comment.userId.avatar || 'https://t.alcy.cc/moe'" :size="24"
        @click="handleAvatarClick(comment.userId._id)" style="cursor: pointer;" />
      <div class="flex-1">
        <div class="flex justify-between items-center mb-1">
          <div class="font-medium text-gray-800 text-sm">{{ comment.userId.nickname }}</div>
          <div class="text-xs text-gray-500">{{ new Date(comment.createdAt).toLocaleString('zh-CN') }}</div>
        </div>
        <div class="text-gray-700 text-sm mb-2">
          <!-- 显示 @xxx 前缀（有 replyTo 的评论） -->
          <template v-if="comment.replyTo">
            <span class="text-gray-400">回复 @{{ comment.replyTo }} :</span>
          </template>
          {{ comment.content }}
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span class="cursor-pointer hover:text-blue-500" @click="handleReply(comment)">
            回复
          </span>
          <span class="cursor-pointer hover:text-red-500 flex items-center gap-1"
            :style="{ color: comment.isLiked ? '#ff4757' : '#666' }"
            @click="handleLike(comment._id, comment.isLiked || false)"
            :class="{ 'opacity-50 cursor-not-allowed': isLiking }">
            <el-icon :size="12">
              <Loading v-if="isLiking" />
              <svg v-else t="1769325778953" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="3592" width="200" height="200">
                <path
                  d="M411.904 153.728c19.797333-63.232 54.186667-90.24 122.026667-70.656l1.706666 0.554667c19.84 6.101333 42.666667 17.706667 64.085334 37.162666 33.706667 30.72 53.76 73.301333 53.76 126.805334 0 47.786667-2.773333 77.312-10.88 110.805333l-0.256 0.938667h175.488c107.264 0 149.888 72.362667 122.922666 192.682666l-2.304 9.856-5.461333 18.005334-20.608 67.114666-9.642667 30.677334-9.173333 28.672-17.066667 51.626666-11.648 33.621334-7.210666 20.053333-9.984 26.368-6.101334 15.232c-29.525333 71.253333-90.453333 103.978667-170.112 94.592l-387.114666-28.8a587.690667 587.690667 0 0 0-7.381334-0.341333l-15.36-0.341334H218.026667l-12.501334-0.213333-9.984-0.426667-8.32-0.768-3.712-0.554666-7.125333-1.408-11.52-3.029334c-59.349333-17.621333-90.24-67.925333-90.24-139.605333v-283.52c0-90.538667 54.954667-142.208 148.565333-142.208l75.776-0.042667 5.205334-3.968a293.632 293.632 0 0 0 72.234666-88.32l6.101334-11.946666c6.101333-12.544 11.093333-25.685333 15.829333-41.002667l0.768-2.602667z m88.661333 8.064c-1.834667-0.426667-2.645333 0.170667-3.541333 2.773333l-3.882667 14.933334-10.666666 38.442666-2.56 8.533334a366.933333 366.933333 0 0 1-20.565334 53.162666 387.754667 387.754667 0 0 1-72.618666 102.442667 333.141333 333.141333 0 0 1-49.28 42.026667l5.504-3.925334v417.408l336.682666 25.344c41.898667 4.906667 65.621333-6.101333 80.213334-36.096l2.858666-6.229333 5.76-14.378667 9.514667-25.173333 6.912-19.285333 11.221333-32.469334 8.064-24.064 17.365334-53.76 19.2-61.354666 15.445333-50.858667c18.986667-76.074667 7.808-94.592-38.357333-94.592h-217.685334a53.632 53.632 0 0 1-50.730666-71.125333l2.176-6.4 3.328-10.922667c10.282667-35.754667 13.226667-59.136 13.226666-108.629333 0-48.426667-26.88-72.96-57.045333-82.261334l-3.712-1.152z m-242.944 270.122667h-34.389333c-47.616 0-63.232 14.72-63.232 56.917333v283.52c0 38.016 9.941333 53.333333 33.792 59.008l1.493333 0.341333 3.754667 0.554667 5.12 0.426667 11.562667 0.256h28.586666l13.312 0.085333v-401.066667z"
                  p-id="3593"></path>
              </svg>
            </el-icon>
            {{ comment.likesCount || 0 }}
          </span>
        </div>

        <!-- 回复功能已移至一级评论的 replies 列表中 -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comment-item {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}
</style>