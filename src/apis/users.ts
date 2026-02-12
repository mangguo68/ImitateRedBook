import request from '@/utils/request'
import type { ApiResponse, UploadAvatarData, UploadAvatarResponse, UpdateUserData } from '@/types'

/**
 * 关注用户
 * @param userId - 要关注的用户ID
 * @returns 返回关注结果
 */
export function followUser(userId: string): Promise<ApiResponse> {
  return request({
    url: `/api/users/${userId}/follow`,
    method: 'post',
  })
}

/**
 * 取消关注用户
 * @param userId - 要取消关注的用户ID
 * @returns 返回取消关注结果
 */
export function unfollowUser(userId: string): Promise<ApiResponse> {
  return request({
    url: `/api/users/${userId}/follow`,
    method: 'delete',
  })
}

/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 返回用户信息
 */
export function getUserProfile(userId: string): Promise<any> {
  return request({
    url: `/api/users/${userId}`,
    method: 'get',
  })
}

/**
 * 获取用户关注列表
 * @param userId - 用户ID
 * @param params - 查询参数
 * @returns 返回关注列表
 */
export function getUserFollowing(userId: string, params: { page?: number; limit?: number } = {}): Promise<any> {
  return request({
    url: `/api/users/${userId}/following`,
    method: 'get',
    params,
  })
}

/**
 * 获取用户粉丝列表
 * @param userId - 用户ID
 * @param params - 查询参数
 * @returns 返回粉丝列表
 */
export function getUserFollowers(userId: string, params: { page?: number; limit?: number } = {}): Promise<any> {
  return request({
    url: `/api/users/${userId}/followers`,
    method: 'get',
    params,
  })
}

/**
 * 上传用户头像
 * @param data - 头像数据
 * @returns 返回上传结果和头像信息
 */
export function uploadAvatar(data: UploadAvatarData): Promise<UploadAvatarResponse> {
  return request({
    url: '/api/users/avatar/upload',
    method: 'post',
    data,
  })
}

/**
 * 更新用户信息
 * @param userId - 用户ID
 * @param data - 用户信息数据
 * @returns 返回更新结果
 */
export function updateUser(userId: string, data: UpdateUserData): Promise<any> {
  return request({
    url: `/api/users/${userId}`,
    method: 'put',
    data,
  })
}

// 默认导出所有函数
/**
 * 获取用户通知
 * @param type - 通知类型 (all, like, comment, follow, collect)
 * @param params - 查询参数
 * @returns 返回通知列表
 */
export function getUserNotifications(type: string = 'all', params: { page?: number; limit?: number } = {}): Promise<any> {
  return request({
    url: `/api/users/notifications`,
    method: 'get',
    params: {
      type,
      ...params
    },
  })
}

// 默认导出所有函数
export default {
  followUser,
  unfollowUser,
  getUserProfile,
  getUserFollowing,
  getUserFollowers,
  uploadAvatar,
  updateUser,
  getUserNotifications,
}
