export interface UserData {
  _id: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  bio?: string
  followersCount?: number
  followingCount?: number
  notesCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: UserData | null
  token: string | null
}

export interface LoginResponse {
  success: boolean
  data: {
    user: UserData
    token: string
  }
  message: string
}

export interface RegisterResponse {
  success: boolean
  data: {
    user: UserData
    token: string
  }
  message: string
}
