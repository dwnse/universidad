<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AuthController } from '@/controllers/AuthController'
import { useDark, useToggle } from '@vueuse/core'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-vue-next'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSidebarOpen = ref(true)

const navigation = [
  { name: 'Dashboard', href: { name: 'dashboard' }, icon: LayoutDashboard, roles: ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'] },
  { name: 'Usuarios', href: { name: 'admin-users' }, icon: Users, roles: ['ADMINISTRADOR'] },
  { name: 'Carreras', href: { name: 'admin-careers' }, icon: BookOpen, roles: ['ADMINISTRADOR'] },
  { name: 'Inscripciones', href: { name: 'student-enrollment' }, icon: Calendar, roles: ['ADMINISTRADOR', 'ESTUDIANTE'] },
  { name: 'Calificaciones', href: { name: 'docente-grades' }, icon: BookOpen, roles: ['DOCENTE'] },
]

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = async () => {
  await AuthController.handleLogout()
  router.push({ name: 'login' })
}

const filteredNavigation = computed(() => {
  return navigation.filter(item => 
    item.roles.includes(authStore.userRole || '')
  )
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            ERP Académico
          </span>
          <button @click="toggleSidebar" class="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X class="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in filteredNavigation"
            :key="item.name"
            :to="item.href"
            :class="[
              route.name === (typeof item.href === 'object' ? item.href.name : '') 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200'
            ]"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
            {{ item.name }}
          </router-link>
        </nav>

        <div class="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            @click="handleLogout"
            class="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut class="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Navbar -->
      <header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
        <div class="flex items-center">
          <button @click="toggleSidebar" class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-4">
            <Menu class="h-5 w-5 text-gray-500" />
          </button>
          <div class="hidden md:flex items-center relative group">
            <Search class="absolute left-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              class="pl-10 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 w-64 transition-all"
            />
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button 
            @click="toggleDark()"
            class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Sun v-if="isDark" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>

          <button class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
            <Bell class="h-5 w-5" />
            <span class="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
          </button>
          
          <div v-if="authStore.profile" class="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-800">
            <div class="hidden text-right lg:block">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ authStore.profile.full_name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ authStore.userRole }}</p>
            </div>
            <div class="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800">
              {{ authStore.profile.full_name?.charAt(0) }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-8 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>
