import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getComments, createComment, likeComment, unlikeComment } from '@/apis/comments'
import type { Comment, Note } from '@/types'

export function useCommentActions() {
  const loading = ref(false)
  const loadingMore = ref(false)
  const commentLiking = ref<Record<string, boolean>>({})
  const authStore = useAuthStore()

  // 加载评论
  const loadComments = async (
    noteId: string,
    page: number = 1,
    isLoadMore: boolean = false,
    existingComments: Comment[] = [],
  ) => {
    if (loading.value || (isLoadMore && loadingMore.value))
      return { comments: existingComments, total: 0, hasMore: true }

    try {
      if (isLoadMore) {
        loadingMore.value = true
      } else {
        loading.value = true
      }

      const response = await getComments({
        postId: noteId,
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      // 处理响应数据，因为响应拦截器可能只返回了data部分
      const responseData = response.data || response
      const newComments = responseData.comments || []
      const total = responseData.total || 0

      const comments = isLoadMore ? [...existingComments, ...newComments] : newComments
      const hasMore = comments.length < total

      return { comments, total, hasMore }
    } catch (error) {
      ElMessage.error('加载评论失败')
      console.error('加载评论失败:', error)
      return { comments: existingComments, total: 0, hasMore: false }
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  // 发布评论
  const handleComment = async (
    note: Note,
    content: string,
    replyingToCommentId: string | null,
    replyingToUserId: string | null,
  ) => {
    if (!content.trim()) return false

    try {
      loading.value = true
      // 使用被回复评论的用户ID作为mentions
      const mentions = replyingToUserId || undefined

      await createComment({
        postId: note._id,
        content: content.trim(),
        parentId: replyingToCommentId || undefined,
        mentions,
      })

      ElMessage.success('评论成功')
      return true
    } catch (error) {
      ElMessage.error('评论失败')
      console.error('发布评论失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 评论点赞
  const handleCommentLike = async (
    commentId: string,
    isCurrentlyLiked: boolean,
    comments?: Comment[],
  ) => {
    if (commentLiking.value[commentId] || !comments) return

    // 检查是否登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return false
    }

    try {
      commentLiking.value[commentId] = true
      if (isCurrentlyLiked) {
        await unlikeComment(commentId)
      } else {
        await likeComment(commentId)
      }

      // 更新本地评论点赞状态和数量
      const updateCommentLikeStatus = (commentsArray: Comment[]) => {
        for (const comment of commentsArray) {
          if (comment._id === commentId) {
            comment.isLiked = !isCurrentlyLiked
            comment.likesCount += isCurrentlyLiked ? -1 : 1
            return true
          }
          if (comment.replies && comment.replies.length > 0) {
            if (updateCommentLikeStatus(comment.replies)) {
              return true
            }
          }
        }
        return false
      }

      updateCommentLikeStatus(comments)
      return true
    } catch (error) {
      ElMessage.error(isCurrentlyLiked ? '取消点赞失败' : '点赞失败')
      console.error('处理评论点赞失败:', error)
      return false
    } finally {
      commentLiking.value[commentId] = false
    }
  }

  return {
    loading,
    loadingMore,
    commentLiking,
    loadComments,
    handleComment,
    handleCommentLike,
  }
}
