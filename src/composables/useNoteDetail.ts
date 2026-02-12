import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useNotesStore } from '@/stores/notes'
import { useAuthStore } from '@/stores/auth'
import { getNoteDetail, likeNote, unlikeNote, collectNote, uncollectNote } from '@/apis/notes'
import type { Note, Comment, UserInfo } from '@/types'
import { useCommentActions } from './useCommentActions'
import { useUserActions } from './useUserActions'
import { useInputFocus } from './useInputFocus'

export function useNoteDetail() {
  const notesStore = useNotesStore()
  const authStore = useAuthStore()
  const localNote = ref<Note | null>(null)
  const isLiked = ref(false)
  const isCollected = ref(false)
  const isFollowing = ref(false)
  const isLiking = ref(false)
  const isCollecting = ref(false)
  const commentText = ref('')
  const comments = ref<Comment[]>([])
  const hasMore = ref(true)
  const currentPage = ref(1)
  const totalComments = ref(0)
  const replyingToCommentId = ref<string | null>(null)
  const replyingToUserId = ref<string | null>(null)
  const replyingToUserName = ref<string>('')
  const refreshing = ref(false)
  const expandedComments = ref<Record<string, boolean>>({})

  // 使用可组合函数
  const { loading, loadingMore, commentLiking, loadComments, handleComment, handleCommentLike } =
    useCommentActions()
  const { following, handleFollow } = useUserActions()
  const {
    isInputFocused,
    commentInputRef,
    handleInputFocus,
    handleInputBlur,
    handleCancelReply: cancelReply,
  } = useInputFocus()

  // 计算属性
  const userInfo = computed(() => {
    if (!localNote.value) return null
    if (typeof localNote.value.userId === 'object') {
      return localNote.value.userId as UserInfo
    }
    return localNote.value.user
  })

  // 重置评论输入框状态
  const resetCommentState = () => {
    commentText.value = ''
    replyingToCommentId.value = null
    replyingToUserId.value = null
    replyingToUserName.value = ''
    isInputFocused.value = false
    expandedComments.value = {}
  }

  // 后台刷新笔记数据
  const refreshNoteData = async () => {
    if (refreshing.value || !localNote.value) return

    try {
      refreshing.value = true
      const freshNote = await getNoteDetail(localNote.value._id)

      // 更新本地数据
      localNote.value = freshNote

      // 直接更新store
      notesStore.updateNoteStatus(localNote.value._id, localNote.value)

      // 更新相关状态
      isLiked.value = freshNote.isLiked || false
      isCollected.value = freshNote.isCollected || false
      isFollowing.value = freshNote.isFollowing || false

      // 无需重新加载评论，因为评论是独立加载的
    } catch (error) {
      console.error('刷新笔记数据失败:', error)
      // 失败时不影响用户，继续使用原有数据
    } finally {
      refreshing.value = false
    }
  }

  // 处理评论发布
  const handleCommentSubmit = async () => {
    if (!commentText.value.trim() || !localNote.value) return

    // 检查是否登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return
    }

    const success = await handleComment(
      localNote.value,
      commentText.value,
      replyingToCommentId.value,
      replyingToUserId.value,
    )

    if (success) {
      // 清空评论输入框和回复状态
      commentText.value = ''
      replyingToCommentId.value = null
      replyingToUserId.value = null
      replyingToUserName.value = ''
      isInputFocused.value = false

      // 重新加载评论列表
      const result = await loadComments(localNote.value._id, 1, false)
      comments.value = result.comments
      totalComments.value = result.total
      hasMore.value = result.hasMore

      // 更新本地评论数
      localNote.value.commentsCount += 1

      // 直接更新store
      notesStore.updateNoteStatus(localNote.value._id, {
        commentsCount: localNote.value.commentsCount,
      })
    }
  }

  // 处理回复评论
  const handleReply = (comment: Comment) => {
    // 保存被回复评论的ID
    replyingToCommentId.value = comment._id
    // 保存被回复评论的用户ID
    replyingToUserId.value = comment.userId._id
    // 保存被回复评论的用户昵称
    replyingToUserName.value = comment.userId.nickname
    // 清空评论输入框的内容，不再显示@xxx，因为上方已经有提示
    commentText.value = ''
    // 触发输入框聚焦，使用现有的 handleInputFocus 方法
    handleInputFocus()
  }

  // 处理取消回复
  const handleCancelReply = () => {
    commentText.value = ''
    replyingToCommentId.value = null
    replyingToUserId.value = null
    replyingToUserName.value = ''
    cancelReply()
  }

  // 切换评论折叠状态
  const toggleCommentExpand = (commentId: string) => {
    expandedComments.value[commentId] = !expandedComments.value[commentId]
  }

  // 组件挂载时加载数据
  onMounted(() => {
    // 重置评论输入框状态
    resetCommentState()

    // 初始化本地笔记数据
    if (notesStore.selectedNote) {
      localNote.value = notesStore.selectedNote
      isLiked.value = notesStore.selectedNote.isLiked || false
      isCollected.value = notesStore.selectedNote.isCollected || false
      isFollowing.value = notesStore.selectedNote.isFollowing || false

      // 加载评论
      loadCommentsData(1)

      // 组件挂载后后台静默刷新数据
      setTimeout(() => {
        refreshNoteData()
      }, 500) // 延迟一点刷新，避免与评论加载冲突
    }
  })

  // 处理点赞
  const handleLike = async () => {
    if (!localNote.value || isLiking.value) return

    // 检查是否登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return
    }

    try {
      isLiking.value = true
      const newLikedState = !isLiked.value
      if (newLikedState) {
        await likeNote(localNote.value._id)
      } else {
        await unlikeNote(localNote.value._id)
      }

      // 更新本地状态
      notesStore.updateNoteStatus(localNote.value._id, {
        isLiked: newLikedState,
        likesCount: localNote.value.likesCount + (newLikedState ? 1 : -1),
      })
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('处理点赞失败:', error)
    } finally {
      isLiking.value = false
    }
  }

  // 处理收藏
  const handleCollect = async () => {
    if (!localNote.value || isCollecting.value) return

    // 检查是否登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return
    }

    try {
      isCollecting.value = true
      const newCollectedState = !isCollected.value
      if (newCollectedState) {
        await collectNote(localNote.value._id)
      } else {
        await uncollectNote(localNote.value._id)
      }

      // 更新本地状态
      notesStore.updateNoteStatus(localNote.value._id, {
        isCollected: newCollectedState,
        collectionsCount: localNote.value.collectionsCount + (newCollectedState ? 1 : -1),
      })
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('处理收藏失败:', error)
    } finally {
      isCollecting.value = false
    }
  }

  // 加载评论数据
  const loadCommentsData = async (page: number, isLoadMore: boolean = false) => {
    if (!localNote.value) return

    const result = await loadComments(localNote.value._id, page, isLoadMore, comments.value)

    comments.value = result.comments
    totalComments.value = result.total
    currentPage.value = page
    hasMore.value = result.hasMore
  }

  // 监听selectedNote变化，重新加载评论
  watch(
    () => notesStore.selectedNote,
    (newNote, oldNote) => {
      if (newNote) {
        // 初始化本地笔记数据
        localNote.value = newNote
        isLiked.value = newNote.isLiked || false
        isCollected.value = newNote.isCollected || false
        isFollowing.value = newNote.isFollowing || false

        // 只有当note的_id变化时才重置评论状态和重新加载评论
        if (newNote._id !== oldNote?._id) {
          // 重置评论相关状态
          comments.value = []
          currentPage.value = 1
          totalComments.value = 0
          hasMore.value = true
          // 重置评论输入框状态
          resetCommentState()
          // 重置评论展开状态
          expandedComments.value = {}

          // 重新加载评论
          loadCommentsData(1)

          // 后台静默刷新数据
          setTimeout(() => {
            refreshNoteData()
          }, 500)
        }
      }
    },
    { immediate: true },
  )

  return {
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
    replyingToUserId,
    replyingToUserName,
    refreshing,
    expandedComments,
    commentLiking,
    following,
    isInputFocused,
    commentInputRef,
    userInfo,

    // 方法
    handleInputFocus,
    handleInputBlur,
    handleCommentSubmit,
    handleReply,
    handleCancelReply,
    handleLike,
    handleCollect,
    handleFollow: async (user: UserInfo | null | undefined, currentState: boolean) => {
      const result = await handleFollow(user, currentState)
      if (result.success) {
        isFollowing.value = result.newState
        // 更新notesStore中的关注状态
        if (localNote.value) {
          notesStore.updateNoteStatus(localNote.value._id, {
            isFollowing: result.newState,
          })
        }
      }
    },
    handleCommentLike: (commentId: string, isLiked: boolean) =>
      handleCommentLike(commentId, isLiked, comments.value),
    toggleCommentExpand,
    refreshNoteData,
    loadCommentsData,
  }
}
