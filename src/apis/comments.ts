import request from '@/utils/request'
import type {
  CommentUser,
  Comment,
  GetCommentsParams,
  CreateCommentParams,
  UpdateCommentParams
} from '@/types'

/**
 * 获取评论列表
 */
export const getComments = async (params: GetCommentsParams) => {
  const { postId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params
  return request.get<{
    comments: Comment[]
    total: number
    page: number
    limit: number
  }>(`/api/comments/posts/${postId}/comments`, {
    params: { page, limit, sortBy, sortOrder }
  })
}

/**
 * 创建评论
 */
export const createComment = async (params: CreateCommentParams) => {
  const { postId, ...data } = params
  return request.post(`/api/comments/posts/${postId}/comments`, data)
}

/**
 * 更新评论
 */
export const updateComment = async (commentId: string, params: UpdateCommentParams) => {
  return request.put(`/api/comments/${commentId}`, params)
}

/**
 * 删除评论
 */
export const deleteComment = async (commentId: string) => {
  return request.delete(`/api/comments/${commentId}`)
}

/**
 * 点赞评论
 */
export const likeComment = async (commentId: string) => {
  return request.post(`/api/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 */
export const unlikeComment = async (commentId: string) => {
  return request.delete(`/api/comments/${commentId}/like`)
}
