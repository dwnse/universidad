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
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/careers',
        name: 'admin-careers',
        component: () => import('@/views/pages/CareerListPage.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/parallels',
        name: 'admin-parallels',
        component: () => import('@/views/pages/ParallelsPage.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/config',
        name: 'admin-config',
        component: () => import('@/views/pages/AcademicConfigurationPage.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/reports',
        name: 'admin-reports',
        component: () => import('@/views/pages/ReportsPage.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/calendar',
        name: 'admin-calendar',
        component: () => import('@/views/pages/CalendarManagementPage.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'student/enrollment',
        name: 'student-enrollment',
        component: () => import('@/views/pages/EnrollmentPage.vue'),
        meta: { roles: ['ESTUDIANTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'student/grades',
        name: 'student-grades',
        component: () => import('@/views/pages/MyGradesPage.vue'),
        meta: { roles: ['ESTUDIANTE'] }
      },
      {
        path: 'docente/grades',
        name: 'docente-grades',
        component: () => import('@/views/pages/GradesEntryPage.vue'),
        meta: { roles: ['DOCENTE'] }
      },
      {
        path: 'docente/reports',
        name: 'docente-reports',
        component: () => import('@/views/pages/DocenteReportsPage.vue'),
        meta: { roles: ['DOCENTE'] }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/pages/ProfilePage.vue'),
        meta: { roles: ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'] }
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
  
  if (!authStore.authReady) {
    console.log('Initializing auth from router...')
    await authStore.fetchProfile()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublic = to.matched.some(record => record.meta.public)
  const allowedRoles = to.meta.roles as string[] | undefined

  console.log(`Route: ${to.name as string}, Auth: ${isAuthenticated}, Role: ${userRole}`)

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (isPublic && isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    console.warn(`Access denied to ${to.name as string} for role ${userRole}`)
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
