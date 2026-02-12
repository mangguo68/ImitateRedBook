import request from '@/utils/request'
import type {
  UserInfo,
  Note,
  PublishNoteData,
  UpdateNoteData,
  GetNotesParams,
  NotesResponse,
  ApiResponse,
  UserNotesParams,
  UserNotesResponse,
  UploadImageData,
  UploadImageResponse
} from '@/types'

/**
 * 发布笔记
 * @param data - 笔记数据
 * @returns 返回发布结果和笔记数据
 */
export function publishNote(data: PublishNoteData): Promise<Note> {
  return request({
    url: '/api/posts',
    method: 'post',
    data,
  })
}

/**
 * 保存笔记为草稿
 * @param data - 笔记数据
 * @returns 返回保存结果和笔记数据
 */
export function saveDraft(data: PublishNoteData): Promise<Note> {
  return publishNote({
    ...data,
    isPublished: false,
  })
}

/**
 * 获取笔记列表
 * @param params - 查询参数
 * @returns 返回笔记列表数据
 */
export function getNotes(params: GetNotesParams = {}): Promise<NotesResponse> {
  return request({
    url: '/api/posts',
    method: 'get',
    params,
  })
}

/**
 * 获取草稿列表
 * @param params - 查询参数
 * @returns 返回草稿列表数据
 */
export function getDrafts(params: Omit<GetNotesParams, 'isDraft'> = {}): Promise<NotesResponse> {
  return getNotes({
    ...params,
    isDraft: true,
  })
}



export function getUserNotes(params: UserNotesParams = {}): Promise<UserNotesResponse> {
  return request({
    url: '/api/posts/user/notes',
    method: 'get',
    params,
  })
}

/**
 * 获取已发布的笔记列表
 * @param params - 查询参数
 * @returns 返回已发布笔记列表数据
 */
export function getPublishedNotes(
  params: Omit<GetNotesParams, 'isPublished'> = {},
): Promise<NotesResponse> {
  return getNotes({
    ...params,
    isPublished: true,
  })
}

/**
 * 获取笔记详情
 * @param id - 笔记ID
 * @returns 返回笔记详情数据
 */
export function getNoteDetail(id: string): Promise<Note> {
  return request({
    url: `/api/posts/${id}`,
    method: 'get',
  })
}

/**
 * 更新笔记
 * @param id - 笔记ID
 * @param data - 更新数据
 * @returns 返回更新结果和笔记数据
 */
export function updateNote(id: string, data: UpdateNoteData): Promise<Note> {
  return request({
    url: `/api/posts/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除笔记
 * @param id - 笔记ID
 * @returns 返回删除结果
 */
export function deleteNote(id: string): Promise<null> {
  return request({
    url: `/api/posts/${id}`,
    method: 'delete',
  })
}

/**
 * 删除草稿
 * @param id - 草稿ID
 * @returns 返回删除结果
 */
export function deleteDraft(id: string): Promise<null> {
  return request({
    url: `/api/posts/drafts/${id}`,
    method: 'delete',
  })
}

/**
 * 发布草稿
 * @param id - 草稿ID
 * @returns 返回发布结果
 */
export function publishDraft(id: string): Promise<Note> {
  return request({
    url: `/api/posts/drafts/${id}/publish`,
    method: 'post',
  })
}

/**
 * 测试API连接
 * @returns 返回连接状态
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await getNotes({ limit: 1 })
    return {
      success: true,
      message: 'API连接正常',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'API连接失败',
    }
  }
}

/**
 * 上传图片
 * @param data - 图片数据
 * @returns 返回上传结果和图片信息
 */

export function uploadImage(data: UploadImageData): Promise<UploadImageResponse> {
  return request({
    url: '/api/posts/upload',
    method: 'post',
    data,
  })
}

/**
 * 收藏笔记
 * @param id - 笔记ID
 * @returns 返回收藏结果
 */
export function collectNote(id: string): Promise<ApiResponse> {
  return request({
    url: `/api/posts/${id}/collect`,
    method: 'post',
  })
}

/**
 * 取消收藏笔记
 * @param id - 笔记ID
 * @returns 返回取消收藏结果
 */
export function uncollectNote(id: string): Promise<ApiResponse> {
  return request({
    url: `/api/posts/${id}/collect`,
    method: 'delete',
  })
}

/**
 * 点赞笔记
 * @param id - 笔记ID
 * @returns 返回点赞结果
 */
export function likeNote(id: string): Promise<ApiResponse> {
  return request({
    url: `/api/posts/${id}/like`,
    method: 'post',
  })
}

/**
 * 取消点赞笔记
 * @param id - 笔记ID
 * @returns 返回取消点赞结果
 */
export function unlikeNote(id: string): Promise<ApiResponse> {
  return request({
    url: `/api/posts/${id}/like`,
    method: 'delete',
  })
}

/**
 * 获取用户收藏的笔记列表
 * @param params - 查询参数
 * @returns 返回用户收藏的笔记列表数据
 */
export function getUserCollections(params: UserNotesParams = {}): Promise<UserNotesResponse> {
  return request({
    url: '/api/posts/user/collections',
    method: 'get',
    params,
  })
}

// 默认导出所有函数
export default {
  publishNote,
  saveDraft,
  getNotes,
  getDrafts,
  getPublishedNotes,
  getUserNotes,
  getUserCollections,
  getNoteDetail,
  updateNote,
  deleteNote,
  testConnection,
  uploadImage,
  collectNote,
  uncollectNote,
  likeNote,
  unlikeNote,
}
