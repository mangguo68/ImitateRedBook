// 路由名称类型
export type RouteName = 'discover' | 'publish' | 'notification' | 'user-profile' | 'note-manage' | 'search'

// 路由映射配置
export const ROUTE_MAP = {
  discover: '/discover',
  publish: '/publish',
  notification: '/notification',
  'user-profile': '/user/profile/:uid',
  'note-manage': '/note-manage',
  search: '/search'
} as const

// 路由到菜单项的映射
export const ROUTE_TO_MENU: Record<string, string> = {
  '/discover': 'discover',
  '/publish': 'publish',
  '/notification': 'notification',
  '/note-manage': 'note-manage'
}

// 路由参数类型
export interface RouteParams {
  'user-profile'?: {
    uid: string
  }
}

// 检查路由是否存在
export const isRouteExists = (routeName: string): routeName is RouteName => {
  return routeName in ROUTE_MAP
}

// 获取路由路径
export const getRoutePath = (routeName: RouteName, params?: Record<string, string>): string => {
  let path = ROUTE_MAP[routeName] as string
  
  // 处理带参数的路由
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value)
    })
  }
  
  return path
}
