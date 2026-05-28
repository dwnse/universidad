<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminController } from '@/controllers/AdminController'
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Shield, 
  Calendar,
  Filter
} from 'lucide-vue-next'

const adminController = useAdminController()
const searchQuery = ref('')
const roleFilter = ref('ALL')

onMounted(() => {
  adminController.fetchUsers()
})

const filteredUsers = computed(() => {
  return adminController.users.value.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'ALL' || user.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'DOCENTE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'ESTUDIANTE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Administra los roles y accesos de todo el personal y estudiantes.</p>
      </div>
      <button class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm">
        <UserPlus class="h-5 w-5 mr-2" />
        Nuevo Usuario
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nombre o correo..." 
          class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div class="flex items-center gap-2">
        <Filter class="h-5 w-5 text-gray-400" />
        <select 
          v-model="roleFilter"
          class="bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 text-sm py-2 px-4"
        >
          <option value="ALL">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="DOCENTE">Docentes</option>
          <option value="ESTUDIANTE">Estudiantes</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-if="adminController.loading.value" v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-6 py-4"><div class="h-10 w-40 bg-gray-100 dark:bg-gray-800 rounded"></div></td>
              <td class="px-6 py-4"><div class="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div></td>
              <td class="px-6 py-4"><div class="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div></td>
              <td class="px-6 py-4"><div class="h-6 w-8 bg-gray-100 dark:bg-gray-800 rounded ml-auto"></div></td>
            </tr>
            
            <tr v-else v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800">
                    {{ user.full_name.charAt(0) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.full_name }}</div>
                    <div class="text-xs text-gray-500 flex items-center mt-0.5">
                      <Mail class="h-3 w-3 mr-1" />
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleBadgeClass(user.role)]">
                  <Shield class="h-3 w-3 mr-1" />
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center">
                  <Calendar class="h-4 w-4 mr-2" />
                  {{ new Date(user.created_at).toLocaleDateString() }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <MoreVertical class="h-5 w-5" />
                </button>
              </td>
            </tr>
            
            <tr v-if="!adminController.loading.value && filteredUsers.length === 0">
              <td colspan="4" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center">
                  <Search class="h-12 w-12 text-gray-300 mb-4" />
                  <p class="text-gray-500 dark:text-gray-400 font-medium">No se encontraron usuarios</p>
                  <p class="text-sm text-gray-400">Intenta con otros términos de búsqueda.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
