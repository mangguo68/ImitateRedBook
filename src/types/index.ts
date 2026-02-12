// 用户相关类型
export interface User {
  _id: string
  username: string
  nickname: string
  email: string
  avatar: string
  bio?: string
  redBookId: string
  followersCount: number
  followingCount: number
  postsCount: number
  likesCount: number
  collectionsCount: number
}

export interface UserInfo {
  _id: string
  nickname: string
  avatar: string
  followersCount?: number
  followingCount?: number
}

// 笔记相关类型
export interface Note {
  _id: string
  userId: string | UserInfo
  title: string
  content: string
  images: string[]
  category: string
  tags: string[]
  likesCount: number
  commentsCount: number
  collectionsCount: number
  sharesCount: number
  isPublished: boolean
  isDraft: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  location?: string
  user?: UserInfo
  isLiked?: boolean
  isCollected?: boolean
  isFollowing?: boolean
}

// 发布笔记的请求数据类型
export interface PublishNoteData {
  title: string
  content: string
  category: string
  tags?: string[]
  images?: string[]
  isPublished?: boolean
}

// 更新笔记的请求数据类型
export interface UpdateNoteData {
  title?: string
  content?: string
  category?: string
  tags?: string[]
  images?: string[]
  isPublished?: boolean
}

// 获取笔记列表的参数类型
export interface GetNotesParams {
  page?: number
  limit?: number
  category?: string
  userId?: string
  isDraft?: boolean
  isPublished?: boolean
}

// 笔记列表响应类型
export interface NotesResponse {
  posts: Note[]
  total: number
  page: number
  limit: number
}

// API响应的标准格式
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// 用户笔记参数类型
export interface UserNotesParams {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'published' | 'draft'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  userId?: string
}

// 用户笔记响应类型
export interface UserNotesResponse {
  notes: Note[]
  total: number
  page: number
  limit: number
}

// 上传图片数据类型
export interface UploadImageData {
  image: string
  name: string
  contentType: string
}

// 上传图片响应类型
export interface UploadImageResponse {
  imageId: string
  name: string
  size: number
  contentType: string
  url: string
}

// 登录请求接口
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应接口
export interface LoginResponse {
  success: boolean
  message: string
  accessToken: string
  refreshToken: string
  user: User
}

// 注册请求接口
export interface RegisterRequest {
  username: string
  password: string
  email: string
  nickname?: string
}

// 上传头像数据类型
export interface UploadAvatarData {
  avatar: string
  name: string
  contentType: string
}

export interface UploadAvatarResponse {
  avatarId: string
  name: string
  size: number
  contentType: string
  url: string
}

// 更新用户信息数据类型
export interface UpdateUserData {
  nickname?: string
  bio?: string
  avatar?: string
}

// 通知相关类型
export interface Notification {
  _id: string
  userAvatar: string
  username: string
  notificationType: 'like' | 'comment' | 'follow' | 'collect'
  noteCover?: string
  createdAt: string
}

// 评论相关类型
export interface CommentUser {
  _id: string
  nickname: string
  avatar: string
}

export interface Comment {
  _id: string
  postId: string
  userId: CommentUser
  content: string
  parentId: string | null
  mentions?: CommentUser | null
  replyTo?: string
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export interface GetCommentsParams {
  postId: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCommentParams {
  postId: string
  content: string
  parentId?: string
  mentions?: string
}

export interface UpdateCommentParams {
  content: string
  mentions?: string
}

// 标签相关类型
export interface Tag {
  _id: string
  name: string
  count: number
  createdAt: string
}

// 分类相关类型
export interface Category {
  value: string
  label: string
}

// 标签相关类型
export interface Label {
  id: string
  name: string
  value: string
  createdAt: string
}

// 获取标签列表的响应类型
export interface LabelsResponse {
  labels: Label[]
  total: number
}

// 获取标签列表的参数类型
export interface GetLabelsParams {
  type?: 'recommend' | 'all'
  limit?: number
}

// 创建标签的请求数据类型
export interface CreateLabelData {
  labelName: string
  value: string
}
