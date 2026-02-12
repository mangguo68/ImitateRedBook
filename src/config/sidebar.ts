import { Pointer, MagicStick, Star, ChatDotRound } from '@element-plus/icons-vue'
import DiscoverIcon from '@/components/icons/DiscoverIcon.vue'
import PublishIcon from '@/components/icons/PublishIcon.vue'
import NotificationIcon from '@/components/icons/NotificationIcon.vue'
import type { Component } from 'vue'

export interface NavItem {
  id: string
  name: string
  route: string
  icon: Component
}

export interface LoginBenefit {
  icon: Component
  text: string
}

export const navItems: NavItem[] = [
  {
    id: 'discover',
    name: '发现',
    route: 'discover',
    icon: DiscoverIcon
  },
  {
    id: 'publish',
    name: '发布',
    route: 'publish',
    icon: PublishIcon
  },
  {
    id: 'notification',
    name: '通知',
    route: 'notification',
    icon: NotificationIcon
  }
]

export const loginBenefits: LoginBenefit[] = [
  {
    icon: Pointer,
    text: '刷到更懂你的优质内容'
  },
  {
    icon: MagicStick,
    text: '搜索最新种草、拔草信息'
  },
  {
    icon: Star,
    text: '查看收藏、点赞的笔记'
  },
  {
    icon: ChatDotRound,
    text: '与他人更好的互动、交流'
  }
]

export interface MoreMenuItem {
  id: string
  name: string
  action: string
  requiresAuth?: boolean
}

export const moreMenuItems: MoreMenuItem[] = [
  {
    id: 'settings',
    name: '设置',
    action: 'settings'
  },
  {
    id: 'help',
    name: '帮助',
    action: 'help'
  },
  {
    id: 'about',
    name: '关于',
    action: 'about'
  },
  {
    id: 'logout',
    name: '退出登录',
    action: 'logout',
    requiresAuth: true
  }
]
