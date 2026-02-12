import { ElMessage } from 'element-plus'
import { likeNote, unlikeNote, collectNote, uncollectNote } from '@/apis/notes'
import { useNotesStore } from '@/stores/notes'
import { useAuthStore } from '@/stores/auth'
import type { Note } from '@/types'

export function useNoteActions() {
  const notesStore = useNotesStore()
  const authStore = useAuthStore()

  const handleLike = async (item: Note) => {
    try {
      const noteId = item._id
      const newLikedState = !item.isLiked

      item.isLiked = newLikedState
      item.likesCount += newLikedState ? 1 : -1

      // 更新notes store中的状态
      notesStore.updateNoteStatus(noteId, {
        isLiked: newLikedState,
        likesCount: item.likesCount,
      })

      if (newLikedState) {
        await likeNote(noteId)
      } else {
        await unlikeNote(noteId)
      }

      ElMessage.success(newLikedState ? '点赞成功' : '取消点赞成功')
    } catch (error: any) {
      item.isLiked = !item.isLiked
      item.likesCount += item.isLiked ? 1 : -1

      // 回滚notes store中的状态
      notesStore.updateNoteStatus(item._id, {
        isLiked: item.isLiked,
        likesCount: item.likesCount,
      })

      console.error('点赞操作失败:', error)
      if (error.isUnauthorized) {
        ElMessage.warning('请先登录再进行操作')
        authStore.openLoginDialog()
      } else {
        ElMessage.error('操作失败，请稍后重试')
      }
    }
  }

  const handleCollect = async (item: Note) => {
    try {
      const noteId = item._id
      const newCollectedState = !item.isCollected

      item.isCollected = newCollectedState
      item.collectionsCount += newCollectedState ? 1 : -1

      // 更新notes store中的状态
      notesStore.updateNoteStatus(noteId, {
        isCollected: newCollectedState,
        collectionsCount: item.collectionsCount,
      })

      if (newCollectedState) {
        await collectNote(noteId)
      } else {
        await uncollectNote(noteId)
      }

      ElMessage.success(newCollectedState ? '收藏成功' : '取消收藏成功')
    } catch (error: any) {
      item.isCollected = !item.isCollected
      item.collectionsCount += item.isCollected ? 1 : -1

      // 回滚notes store中的状态
      notesStore.updateNoteStatus(item._id, {
        isCollected: item.isCollected,
        collectionsCount: item.collectionsCount,
      })

      console.error('收藏操作失败:', error)
      if (error.isUnauthorized) {
        ElMessage.warning('请先登录再进行操作')
        authStore.openLoginDialog()
      } else {
        ElMessage.error('操作失败，请稍后重试')
      }
    }
  }

  return {
    handleLike,
    handleCollect,
  }
}
