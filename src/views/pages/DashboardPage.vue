<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDocenteController } from '@/controllers/DocenteController'
import { 
  AlertCircle, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Bell, 
  ShieldCheck,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const docenteController = useDocenteController()

// Docente specific data
const docenteStats = ref([
  { name: 'Mis Cursos', value: '0', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Total Alumnos', value: '0', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Pendientes Calificar', value: '5', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { name: 'Reportes Listos', value: '2', icon: FileText, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
])

onMounted(async () => {
  if (authStore.userRole === 'DOCENTE' && authStore.profile?.id) {
    const dId = await docenteController.fetchDocenteId(authStore.profile.id)
    if (dId) {
      await docenteController.fetchAssignedParallels(dId)
      docenteStats.value[0].value = docenteController.parallels.value.length.toString()
      // Estimate total students
      const totalStudents = docenteController.parallels.value.reduce((acc, p) => acc + (p.cupo_actual || 0), 0)
      docenteStats.value[1].value = totalStudents.toString()
    }
  }
})

// Mock data for Admin metrics
const adminStats = [
  { name: 'Usuarios Activos', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Materias Dictadas', value: '48', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Estudiantes Inscritos', value: '850', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'Reportes Generados', value: '12', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Initializing State -->
    <div v-if="!authStore.authReady" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400">Cargando panel de control...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="authStore.profileError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
      <div class="flex items-center space-x-3 text-red-600 dark:text-red-400">
        <AlertCircle class="h-6 w-6" />
        <h3 class="text-lg font-bold">Error de Acceso</h3>
      </div>
      <p class="mt-2 text-red-500 dark:text-red-400">{{ authStore.profileError }}</p>
      <div class="mt-4 flex gap-3">
        <button @click="authStore.fetchProfile()" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">Reintentar</button>
        <button @click="authStore.signOut" class="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium">Cerrar Sesión</button>
      </div>
    </div>

    <!-- PANEL DE ADMINISTRADOR -->
    <div v-else-if="authStore.userRole === 'ADMINISTRADOR'" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Panel de Administración</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <ShieldCheck class="h-4 w-4 mr-2 text-primary-600" />
            Visión global del sistema académico y supervisión de datos.
          </p>
        </div>
        <div class="flex gap-3">
          <router-link :to="{ name: 'admin-users' }" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center shadow-md shadow-primary-500/20">
            <Users class="h-4 w-4 mr-2" />
            Gestionar Usuarios
          </router-link>
          <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center">
            <Download class="h-4 w-4 mr-2" />
            Exportar Reportes
          </button>
        </div>
      </div>

      <!-- Métricas Globales (RF12) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="stat in adminStats" :key="stat.name" class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div :class="['p-3 rounded-xl', stat.bg]">
              <component :is="stat.icon" :class="['h-6 w-6', stat.color]" />
            </div>
            <span class="flex items-center text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <TrendingUp class="h-3 w-3 mr-1" />
              +4.5%
            </span>
          </div>
          <h4 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{{ stat.name }}</h4>
          <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tareas de Supervisión (RF08) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Actividad Reciente del Sistema</h3>
            <Bell class="h-5 w-5 text-gray-400" />
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-4">
              <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <Bell class="h-5 w-5" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">Nueva inscripción en Ingeniería de Sistemas</p>
                <p class="text-xs text-gray-500">Hace 15 minutos • Paralelo A</p>
              </div>
              <span class="text-xs font-medium text-gray-400">Ver detalles</span>
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos (Supervisión RF10) -->
        <div class="bg-primary-600 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold mb-2">Resumen de Seguridad</h3>
            <p class="text-primary-100 text-sm opacity-90">No se han detectado conflictos de horarios ni duplicados en el último periodo.</p>
          </div>
          <div class="mt-8 space-y-4">
            <div class="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <span class="text-sm font-medium">Conflictos de Horario</span>
              <span class="bg-white text-primary-600 px-2 py-0.5 rounded-full text-xs font-bold">0</span>
            </div>
            <div class="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <span class="text-sm font-medium">Roles sin Asignar</span>
              <span class="bg-white text-primary-600 px-2 py-0.5 rounded-full text-xs font-bold">3</span>
            </div>
          </div>
          <button class="w-full mt-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg">
            Verificar Sistema
          </button>
        </div>
      </div>
    </div>

    <!-- PANEL DE DOCENTE (RF08) -->
    <div v-else-if="authStore.userRole === 'DOCENTE'" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Panel Docente</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <ShieldCheck class="h-4 w-4 mr-2 text-primary-600" />
            Bienvenido, profesor {{ authStore.profile?.full_name }}. Gestiona tus cursos y calificaciones.
          </p>
        </div>
        <div class="flex gap-3">
          <router-link :to="{ name: 'docente-grades' }" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center shadow-md shadow-primary-500/20">
            <CheckCircle2 class="h-4 w-4 mr-2" />
            Subir Notas
          </router-link>
          <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center">
            <Download class="h-4 w-4 mr-2" />
            Reportes PDF
          </button>
        </div>
      </div>

      <!-- Métricas Docente -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="stat in docenteStats" :key="stat.name" class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div :class="['p-3 rounded-xl', stat.bg]">
              <component :is="stat.icon" :class="['h-6 w-6', stat.color]" />
            </div>
          </div>
          <h4 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{{ stat.name }}</h4>
          <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Mis Cursos Asignados (RF06) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Cursos Asignados Este Periodo</h3>
            <router-link :to="{ name: 'docente-grades' }" class="text-primary-600 text-sm font-medium hover:underline">Ver todos</router-link>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-if="docenteController.parallels.value.length === 0" class="px-6 py-8 text-center text-gray-500">
              No tienes paralelos asignados actualmente.
            </div>
            <div v-for="parallel in docenteController.parallels.value" :key="parallel.id" class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <BookOpen class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ parallel.materias?.nombre }}</p>
                  <p class="text-xs text-gray-500">Paralelo {{ parallel.nombre }} • {{ parallel.turno }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-medium text-gray-400">Estudiantes</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ parallel.cupo_actual }}/{{ parallel.cupo_maximo }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notificaciones Docente (RF10) -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Avisos</h3>
            <Bell class="h-5 w-5 text-gray-400" />
          </div>
          <div class="p-4 space-y-3">
            <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl">
              <div class="flex items-start gap-3">
                <AlertCircle class="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p class="text-xs font-bold text-amber-900 dark:text-amber-400">Entrega de Notas Próxima</p>
                  <p class="text-[10px] text-amber-700 dark:text-amber-500 mt-0.5">La fecha límite para el 1er Parcial es en 3 días.</p>
                </div>
              </div>
            </div>
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
              <div class="flex items-start gap-3">
                <Users class="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p class="text-xs font-bold text-blue-900 dark:text-blue-400">Nuevos Inscritos</p>
                  <p class="text-[10px] text-blue-700 dark:text-blue-500 mt-0.5">3 alumnos nuevos se han inscrito en tu materia de Cálculo I.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL DE ESTUDIANTE / OTROS (RF08) -->
    <div v-else class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido, {{ authStore.profile?.full_name }}</h3>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Has accedido como <span class="font-semibold text-primary-600">{{ authStore.userRole }}</span></p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h4 class="text-gray-500 dark:text-gray-400 text-sm font-medium">No existen datos disponibles</h4>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
        </div>
      </div>
    </div>
  </div>
</template>
