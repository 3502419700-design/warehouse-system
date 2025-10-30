import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      // 老板角色路由
      {
        path: 'boss/overview',
        name: 'BossOverview',
        component: () => import('@/views/boss/Overview.vue'),
        meta: { roles: ['boss'] }
      },
      {
        path: 'boss/reports',
        name: 'BossReports',
        component: () => import('@/views/boss/Reports.vue'),
        meta: { roles: ['boss'] }
      },
      {
        path: 'boss/records',
        name: 'BossRecords',
        component: () => import('@/views/boss/Records.vue'),
        meta: { roles: ['boss'] }
      },
      // 管理员角色路由
      {
        path: 'admin/materials',
        name: 'AdminMaterials',
        component: () => import('@/views/admin/Materials.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/inbound',
        name: 'AdminInbound',
        component: () => import('@/views/admin/Inbound.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/outbound',
        name: 'AdminOutbound',
        component: () => import('@/views/admin/Outbound.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/inventory',
        name: 'AdminInventory',
        component: () => import('@/views/admin/Inventory.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/applications',
        name: 'AdminApplications',
        component: () => import('@/views/admin/Applications.vue'),
        meta: { roles: ['admin'] }
      },
      // 工程人员角色路由
      {
        path: 'engineer/apply',
        name: 'EngineerApply',
        component: () => import('@/views/engineer/Apply.vue'),
        meta: { roles: ['engineer'] }
      },
      {
        path: 'engineer/my-applications',
        name: 'EngineerMyApplications',
        component: () => import('@/views/engineer/MyApplications.vue'),
        meta: { roles: ['engineer'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    next('/login')
  } else {
    next()
  }
})

export default router

