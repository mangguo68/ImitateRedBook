import request from '@/utils/request'

// 搜索图文内容
export const searchPosts = (params: any) => {
  return request({
    url: '/api/posts/search',
    method: 'GET',
    params
  })
}

// 搜索用户
export const searchUsers = (params: any) => {
  return request({
    url: '/api/users/find',
    method: 'GET',
    params
  })
}