import request from '@/utils/request'
import type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '@/types'

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/api/auth/login', data)
}

/**
 * 用户注册
 */
export function register(data: RegisterRequest): Promise<{ user: LoginResponse['user']; accessToken: string; refreshToken: string }> {
  return request.post('/api/auth/register', data)
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<LoginResponse['user']> {
  return request.get('/api/auth/userinfo')
}

/**
 * 刷新token
 */
export function refreshToken(data: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> {
  return request.post('/api/auth/refresh', data)
}

/**
 * 退出登录
 */
export function logout(): Promise<void> {
  return request.post('/api/auth/logout')
}
