<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElAvatar, ElButton, ElTag, ElIcon, ElDivider } from 'element-plus'
import { Star, Loading, Share, StarFilled } from '@element-plus/icons-vue'
import type { Comment } from '@/types'
import { useNoteDetail } from '@/composables/useNoteDetail'
import CommentItem from './CommentItem.vue'
import Like from './icons/Like.vue'
import LikeFilled from './icons/LikeFilled.vue'
import HandLike from './icons/HandLike.vue'


// 定义组件事件
const emit = defineEmits<{
    (e: 'close'): void
}>()

// 获取路由
const router = useRouter()

// 使用可组合函数
const {
    // 状态
    localNote,
    isLiked,
    isCollected,
    isFollowing,
    isLiking,
    isCollecting,
    commentText,
    comments,
    loading,
    loadingMore,
    hasMore,
    currentPage,
    totalComments,
    replyingToCommentId,
    replyingToUserName,
    expandedComments,
    commentLiking,
    following,
    isInputFocused,
    userInfo,
    commentInputRef,

    // 方法
    handleInputFocus,
    handleInputBlur,
    handleCommentSubmit,
    handleReply,
    handleCancelReply,
    handleLike,
    handleCollect,
    handleFollow,
    handleCommentLike,
    toggleCommentExpand,
    loadCommentsData,
} = useNoteDetail()

const handleShare = () => {
    // 这里可以添加分享API调用
}

const handleAvatarClick = (userId: string | undefined) => {
    if (userId) {
        // 触发close事件，通知父组件关闭弹窗
        emit('close')
        // 跳转路由
        router.push({
            name: 'user-profile',
            params: { uid: userId },
        })
    }
}
</script>

<template>
    <div class="detail-content-container">
        <!-- 数据加载中状态 -->
        <div v-if="!localNote" class="flex items-center justify-center h-full">
            <div class="text-center">
                <el-icon class="text-4xl text-gray-400 mb-4">
                    <Loading />
                </el-icon>
                <div class="text-gray-500">加载中...</div>
            </div>
        </div>

        <!-- 左右两栏布局 -->
        <div v-else class="flex flex-col md:flex-row gap-8 h-full">
            <!-- 左侧图片展示区域 -->
            <el-scrollbar class="md:w-1/2 h-full overflow-auto">
                <div class="image-gallery">
                    <el-image v-for="(image, index) in localNote.images" :key="index" :src="image"
                        :alt="localNote.title" fit="cover" class="gallery-image" lazy
                        :preview-src-list="localNote.images">
                        <template #placeholder>
                            <div class="image-placeholder">
                                <el-icon>
                                    <Loading />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                </div>
            </el-scrollbar>

            <!-- 右侧文字展示区 -->
            <div class="md:w-1/2 flex flex-col h-full">
                <!-- 头部：头像、昵称、关注按钮 -->
                <div class="header-section mb-6">
                    <div class="flex items-center gap-3">
                        <el-avatar :src="userInfo?.avatar || 'https://t.alcy.cc/moe'" :size="48"
                            @click="handleAvatarClick(userInfo?._id)" style="cursor: pointer" />
                        <div class="flex-1">
                            <div class="font-medium text-gray-800">{{ userInfo?.nickname || '未知用户' }}</div>
                            <div class="text-xs text-gray-500 mt-1">
                                {{ userInfo?.followersCount || 0 }} 粉丝 · {{ userInfo?.followingCount || 0 }} 关注
                            </div>
                        </div>
                        <el-button size="small" :type="isFollowing ? 'default' : 'danger'" :loading="following" round
                            @click="handleFollow(userInfo, isFollowing)">
                            {{ isFollowing ? '已关注' : '关注' }}
                        </el-button>
                    </div>
                </div>

                <!-- 主要内容区域 -->
                <div class="main-content mb-6">
                    <!-- 标题 -->
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ localNote.title }}</h1>

                    <!-- 文字内容 -->
                    <div class="text-gray-700 mb-4 whitespace-pre-line">{{ localNote.content }}</div>

                    <!-- 标签 -->
                    <div class="tags-container mb-4">
                        <el-tag v-for="tag in localNote.tags" :key="tag" size="small" class="mr-2 mb-2">
                            {{ tag }}
                        </el-tag>
                    </div>

                    <!-- 编辑时间和IP属地 -->
                    <div class="text-xs text-gray-500 mb-4">
                        编辑于 {{ new Date(localNote.updatedAt).toLocaleString('zh-CN') }}
                        <span class="ml-4">IP属地：未知</span>
                    </div>
                </div>

                <!-- 评论区 -->
                <el-scrollbar class="comments-section flex-1 overflow-y-auto mb-6 pr-3">
                    <!-- 评论数量 -->
                    <div class="font-medium text-gray-800 mb-4">
                        评论 {{ totalComments || localNote.commentsCount }}
                    </div>

                    <!-- 评论内容 -->
                    <div class="comments-list">
                        <!-- 加载状态 -->
                        <div v-if="loading" class="text-center text-gray-500 py-8">加载中...</div>

                        <!-- 评论列表 -->
                        <template v-else>
                            <div v-for="comment in comments" :key="comment._id" class="comment-item mb-4">
                                <div class="flex gap-3">
                                    <el-avatar :src="comment.userId.avatar || 'https://t.alcy.cc/moe'" :size="32"
                                        @click="handleAvatarClick(comment.userId._id)" style="cursor: pointer" />
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-1">
                                            <div class="font-medium text-gray-800">{{ comment.userId.nickname }}</div>
                                            <div class="text-xs text-gray-500">
                                                {{ new Date(comment.createdAt).toLocaleString('zh-CN') }}
                                            </div>
                                        </div>
                                        <div class="text-gray-700 mb-3">{{ comment.content }}</div>

                                        <!-- 评论操作 -->
                                        <div class="flex items-center gap-4 text-xs text-gray-500">
                                            <span class="cursor-pointer hover:text-blue-500"
                                                @click="handleReply(comment)">
                                                回复
                                            </span>
                                            <span class="cursor-pointer hover:text-red-500 flex items-center gap-1"
                                                :style="{ color: comment.isLiked ? '#ff4757' : '#666' }"
                                                @click="handleCommentLike(comment._id, comment.isLiked || false)"
                                                :class="{ 'opacity-50 cursor-not-allowed': commentLiking[comment._id] }">
                                                <el-icon :size="14">
                                                    <Loading v-if="commentLiking[comment._id]" />
                                                    <HandLike v-else />
                                                </el-icon>
                                                {{ comment.likesCount || 0 }}
                                            </span>
                                        </div>

                                        <!-- 回复列表 -->
                                        <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 pl-8">
                                            <!-- 显示回复列表 -->
                                            <CommentItem
                                                v-for="reply in (comment.replies.length > 2 && !expandedComments[comment._id] ? comment.replies.slice(0, 2) : comment.replies)"
                                                :key="reply._id" :comment="reply" @reply="handleReply"
                                                @like="handleCommentLike" />

                                            <!-- 展开/收起按钮 -->
                                            <div v-if="comment.replies.length > 2" class="text-center mt-2">
                                                <span class="text-xs text-gray-500 cursor-pointer hover:text-blue-500"
                                                    @click="toggleCommentExpand(comment._id)">
                                                    {{ expandedComments[comment._id] ? '收起' : `展开全部
                                                    ${comment.replies.length} 条回复` }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 暂无评论提示 -->
                            <div v-if="comments.length === 0" class="text-center text-gray-500 py-4">
                                暂无评论，快来抢沙发吧！
                            </div>

                            <!-- 加载更多按钮 -->
                            <div v-if="hasMore && comments.length > 0" class="text-center mt-6">
                                <el-button size="small" class="rounded-lg!" :loading="loadingMore"
                                    @click="loadCommentsData(currentPage + 1, true)">
                                    加载更多评论
                                </el-button>
                            </div>
                        </template>
                    </div>
                </el-scrollbar>

                <!-- 底部：评论输入框、收藏、点赞、分享 -->
                <div class="bottom-section">
                    <el-divider />

                    <div class="flex items-center gap-4 mb-3">
                        <!-- 评论输入框（只有一个） -->
                        <div class="flex-1">
                            <!-- 回复提示：只在回复状态下显示 -->
                            <div v-if="replyingToCommentId" class="text-sm text-gray-500 mb-2">
                                回复 @{{ replyingToUserName }}
                            </div>

                            <!-- 评论输入框 -->
                            <input ref="commentInputRef" v-model="commentText" placeholder="写下你的评论..."
                                @keyup.enter="handleCommentSubmit" @focus="handleInputFocus" @blur="handleInputBlur"
                                class="w-full h-10 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>

                        <!-- 非焦点状态：右侧的点赞按钮（初始显示） -->
                        <div v-if="!isInputFocused" class="flex items-center justify-end gap-4">
                            <!-- 收藏按钮 -->
                            <div class="flex flex-col items-center cursor-pointer" @click="handleCollect"
                                :style="{ color: isCollected ? '#ff4757' : '#666' }"
                                :class="{ 'opacity-50': isCollecting }" :disabled="isCollecting">
                                <el-icon :size="20">
                                    <component :is="isCollecting ? Loading : (isCollected ? StarFilled : Star)" />
                                </el-icon>
                                <span class="text-xs mt-1">{{ localNote.collectionsCount }}</span>
                            </div>

                            <!-- 点赞按钮 -->
                            <div class="flex flex-col items-center cursor-pointer" @click="handleLike"
                                :style="{ color: isLiked ? '#ff4757' : '#666' }" :class="{ 'opacity-50': isLiking }"
                                :disabled="isLiking">
                                <el-icon :size="20">
                                    <component :is="isLiking ? Loading : (isLiked ? LikeFilled : Like)" />
                                </el-icon>
                                <span class="text-xs mt-1">{{ localNote.likesCount }}</span>
                            </div>

                            <!-- 分享按钮 -->
                            <div class="flex flex-col items-center cursor-pointer" @click="handleShare">
                                <el-icon :size="20" color="#666">
                                    <Share />
                                </el-icon>
                                <span class="text-xs text-gray-600 mt-1">{{ localNote.sharesCount }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 焦点状态：底部的操作按钮区域（包含点赞按钮+发布取消按钮，初始隐藏） -->
                    <transition name="slide-up">
                        <div v-if="isInputFocused" class="flex justify-between items-center">
                            <div class="flex items-center gap-4">
                                <!-- 收藏按钮 -->
                                <div class="flex flex-col items-center cursor-pointer" @click="handleCollect"
                                    :style="{ color: isCollected ? '#ff4757' : '#666' }"
                                    :class="{ 'opacity-50': isCollecting }" :disabled="isCollecting">
                                    <el-icon :size="20">
                                        <component :is="isCollecting ? Loading : (isCollected ? StarFilled : Star)" />
                                    </el-icon>
                                    <span class="text-xs mt-1">{{ localNote.collectionsCount }}</span>
                                </div>

                                <!-- 点赞按钮 -->
                                <div class="flex flex-col items-center cursor-pointer" @click="handleLike"
                                    :style="{ color: isLiked ? '#ff4757' : '#666' }" :class="{ 'opacity-50': isLiking }"
                                    :disabled="isLiking">
                                    <el-icon :size="20">
                                        <component :is="isLiking ? Loading : (isLiked ? LikeFilled : Like)" />
                                    </el-icon>
                                    <span class="text-xs mt-1">{{ localNote.likesCount }}</span>
                                </div>

                                <!-- 分享按钮 -->
                                <div class="flex flex-col items-center cursor-pointer" @click="handleShare">
                                    <el-icon :size="20" color="#666">
                                        <Share />
                                    </el-icon>
                                    <span class="text-xs text-gray-600 mt-1">{{ localNote.sharesCount }}</span>
                                </div>
                            </div>

                            <!-- 发送和取消按钮 -->
                            <div class="flex items-center">
                                <el-button class="rounded-full!" type="primary" @click="handleCommentSubmit"
                                    :disabled="!commentText.trim()">发送</el-button>
                                <el-button class="rounded-full!" @click="handleCancelReply">取消</el-button>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
// 动画变量
$animation-duration: 0.3s;
$animation-timing-function: ease;
$slide-out-distance: 100px;
$slide-up-distance: 20px;
$delay-step: 0.1s;

// 混合宏：定义基础动画过渡
@mixin animation-transition {
    transition: all $animation-duration $animation-timing-function;
}

// 混合宏：定义向上滑动动画
@mixin slide-up-animation {

    &-enter-active,
    &-leave-active {
        @include animation-transition;
    }

    &-enter-from {
        opacity: 0;
        transform: translateY($slide-up-distance);
    }

    &-enter-to {
        opacity: 1;
        transform: translateY(0);
    }

    &-leave-from {
        opacity: 1;
        transform: translateY(0);
    }

    &-leave-to {
        opacity: 0;
        transform: translateY($slide-up-distance);
    }
}

// 过渡动画样式
// 焦点状态整体移入动画
.slide-up {
    @include slide-up-animation;
}

// 焦点状态按钮组移入动画
.slide-up-items {
    @include slide-up-animation;

    // 为不同按钮设置不同的动画延迟，使动画更有层次感
    &-enter-active {
        >div:first-child {
            transition-delay: $delay-step;
        }

        >div:last-child {
            transition-delay: $delay-step * 2;
        }
    }
}
</style>

<style lang="scss" scoped>
.detail-content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    height: 100%;
}

.image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    gap: 12px;
    margin: 4px;
}

.gallery-image {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    border-radius: 12px;
}



.tags-container {
    display: flex;
    flex-wrap: wrap;
}

.comment-item {
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
    border-bottom: none;
}

@media (max-width: 768px) {
    .detail-content-container {
        padding: 16px;
    }

    .image-gallery {
        margin-bottom: 24px;
    }

    h1 {
        font-size: 1.5rem !important;
    }
}

/* 刷新指示器样式 */
.refresh-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    pointer-events: none;
}

.refresh-progress {
    height: 2px;
    background-color: #409eff;
    animation: refreshAnimation 1.5s ease-in-out infinite;
}

@keyframes refreshAnimation {
    0% {
        width: 0;
        left: 0;
    }

    50% {
        width: 50%;
        left: 0;
    }

    100% {
        width: 100%;
        left: 0;
    }
}
</style>