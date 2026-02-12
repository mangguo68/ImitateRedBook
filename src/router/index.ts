import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      redirect: '/discover',
      children: [
        {
          path: 'discover',
          name: 'discover',
          component: () => import('@/views/Discover.vue'),
        },
        {
          path: 'user/profile/:uid',
          name: 'user-profile',
          component: () => import('@/views/Profile.vue'),
        },
        {
          path: 'publish',
          name: 'publish-note',
          component: () => import('@/views/PublishNote.vue'),
          // 添加props属性，将路由参数转换为组件props
          props: (route) => ({ edit: route.query.edit })
        },
        {
          path: 'note-manage',
          name: 'note-manage',
          component: () => import('@/views/NoteManage.vue'),
        },
        {
          path: 'notification',
          name: 'notification',
          component: () => import('@/views/Notification.vue'),
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/views/Search.vue'),
          props: (route) => ({ query: route.query.q })
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ],
})

export default router
