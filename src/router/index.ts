import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/models/supabase'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/pages/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/views/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/pages/DashboardPage.vue')
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/pages/UserListPage.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/careers',
        name: 'admin-careers',
        component: () => import('@/views/pages/CareerListPage.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'student/enrollment',
        name: 'student-enrollment',
        component: () => import('@/views/pages/EnrollmentPage.vue'),
        meta: { roles: ['ESTUDIANTE', 'ADMIN'] }
      },
      {
        path: 'docente/grades',
        name: 'docente-grades',
        component: () => import('@/views/pages/GradesEntryPage.vue'),
        meta: { roles: ['DOCENTE'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.loading) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await authStore.fetchProfile()
    } else {
      authStore.loading = false
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublic = to.matched.some(record => record.meta.public)
  const allowedRoles = to.meta.roles as string[] | undefined

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (isPublic && isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
