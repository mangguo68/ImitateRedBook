import { useRouter } from 'vue-router'
import type { RouteName } from '@/router/config'
import { isRouteExists, getRoutePath } from '@/router/config'

/**
 * 导航相关的组合式函数
 * 提供路由导航、路径生成等功能
 */
export function useNavigation() {
  const router = useRouter()

  /**
   * 导航到指定路由
   * @param routeName 路由名称
   * @param params 路由参数
   * @param query 查询参数
   * @returns 是否导航成功
   */
  const navigateTo = (routeName: RouteName | string, params?: Record<string, string>, query?: Record<string, string>): boolean => {
    try {
      // 检查路由是否存在
      if (!isRouteExists(routeName)) {
        console.warn(`Route ${routeName} does not exist`)
        return false
      }

      // 获取路由路径
      const path = getRoutePath(routeName as RouteName, params)

      // 导航到路由
      router.push({
        path,
        query
      })

      return true
    } catch (error) {
      console.error('Navigation error:', error)
      return false
    }
  }

  /**
   * 生成路由路径
   * @param routeName 路由名称
   * @param params 路由参数
   * @returns 生成的路由路径
   */
  const generateRoutePath = (routeName: RouteName, params?: Record<string, string>): string => {
    return getRoutePath(routeName, params)
  }

  /**
   * 检查路由是否存在
   * @param routeName 路由名称
   * @returns 是否存在
   */
  const routeExists = (routeName: string): routeName is RouteName => {
    return isRouteExists(routeName)
  }

  /**
   * 导航回上一页
   */
  const goBack = () => {
    router.back()
  }

  /**
   * 导航到首页
   */
  const goHome = () => {
    navigateTo('discover')
  }

  return {
    navigateTo,
    generateRoutePath,
    routeExists,
    goBack,
    goHome
  }
}
