<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDocenteController } from '@/controllers/DocenteController'
import { supabase } from '@/models/supabase'
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
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-vue-next'

const authStore = useAuthStore()
const docenteController = useDocenteController()
const recentActivities = ref<any[]>([])
const calendarEvents = ref<any[]>([])
const loadingActivities = ref(false)
const loadingCalendar = ref(false)

// Detalles de evento
const selectedEvent = ref<any>(null)
const showEventModal = ref(false)

const openEventModal = (event: any) => {
  selectedEvent.value = event
  showEventModal.value = true
}

const fetchCalendarEvents = async () => {
  loadingCalendar.value = true
  try {
    const { data, error } = await supabase
      .from('calendario_academico')
      .select('*, periodos_academicos(nombre)')
      .order('fecha_inicio', { ascending: true })
      .gte('fecha_fin', new Date().toISOString().split('T')[0])
    
    if (error) throw error

    // Lógica de filtrado por rol (RF08)
    const allEvents = data || []
    const userRole = authStore.userRole

    if (userRole === 'ADMINISTRADOR') {
      calendarEvents.value = allEvents.slice(0, 5)
    } else {
      calendarEvents.value = allEvents.filter(event => {
        const desc = event.descripcion || ''
        const isForRole = desc.includes(`[${userRole}]`)
        const isForEveryone = desc.includes('[TODOS]') || (!desc.startsWith('[') && !desc.includes(']'))
        return isForRole || isForEveryone
      }).slice(0, 5)
    }
  } catch (e) {
    console.error('Error fetching calendar:', e)
  } finally {
    loadingCalendar.value = false
  }
}

const parseDescription = (desc: string) => {
  if (!desc) return ''
  return desc.replace(/^\[.*?\]\s*/, '')
}

const fetchRecentActivities = async () => {
  loadingActivities.value = true
  try {
    const { data, error } = await supabase
      .from('auditoria')
      .select('*')
      .eq('usuario_id', authStore.profile?.id)
      .order('fecha', { ascending: false })
      .limit(5)
    
    if (error) throw error
    recentActivities.value = data || []
  } catch (e) {
    console.error('Error fetching activities:', e)
  } finally {
    loadingActivities.value = false
  }
}

onMounted(async () => {
  fetchCalendarEvents()
  if (authStore.profile?.id) {
    fetchRecentActivities()
  }
  // ... resto de la lógica actual
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}

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
          <router-link 
            :to="{ name: 'admin-reports' }" 
            class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center"
          >
            <Download class="h-4 w-4 mr-2" />
            Exportar Reportes
          </router-link>
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
            <h3 class="font-bold text-gray-900 dark:text-white">Mis Actividades Recientes</h3>
            <Activity class="h-5 w-5 text-gray-400" />
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-if="loadingActivities" class="p-8 text-center"><Loader2 class="h-8 w-8 animate-spin mx-auto text-primary-500" /></div>
            <div v-else-if="recentActivities.length === 0" class="p-8 text-center text-gray-500 text-sm">No hay actividades registradas aún.</div>
            <div v-for="act in recentActivities" :key="act.id" class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-4">
              <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <Clock class="h-5 w-5" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ act.descripcion }}</p>
                <p class="text-xs text-gray-500">{{ act.tabla }} • {{ act.accion }}</p>
              </div>
              <span class="text-xs font-medium text-gray-400">{{ new Date(act.fecha).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- Calendario Académico (RF08) -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Calendario Académico</h3>
            <Calendar class="h-5 w-5 text-indigo-500" />
          </div>
          <div class="p-4 space-y-4">
            <div v-if="loadingCalendar" class="flex justify-center p-4">
              <div class="animate-spin h-6 w-6 border-b-2 border-indigo-500 rounded-full"></div>
            </div>
            <div v-else-if="calendarEvents.length === 0" class="text-center py-6 text-gray-500 text-sm">
              No hay eventos próximos.
            </div>
            <div 
              v-for="event in calendarEvents" 
              :key="event.id"
              @click="openEventModal(event)"
              class="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 cursor-pointer group"
            >
              <div class="flex-shrink-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <span class="text-xs font-bold uppercase">{{ formatDate(event.fecha_inicio).split(' ')[1] }}</span>
                <span class="text-lg font-black leading-none">{{ formatDate(event.fecha_inicio).split(' ')[0] }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{{ event.evento }}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ parseDescription(event.descripcion) || 'Evento académico' }}</p>
              </div>
            </div>
            <router-link 
              v-if="authStore.userRole === 'ADMINISTRADOR'"
              :to="{ name: 'admin-calendar' }" 
              class="block w-full text-center py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors"
            >
              Gestionar Calendario
            </router-link>
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

        <!-- Calendario Docente (RF08) -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Calendario Académico</h3>
            <Calendar class="h-5 w-5 text-indigo-500" />
          </div>
          <div class="p-4 space-y-4">
            <div v-if="loadingCalendar" class="flex justify-center p-4">
              <div class="animate-spin h-6 w-6 border-b-2 border-indigo-500 rounded-full"></div>
            </div>
            <div 
              v-for="event in calendarEvents" 
              :key="event.id" 
              @click="openEventModal(event)"
              class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
            >
              <div class="flex-shrink-0 w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <span class="text-[10px] font-bold uppercase leading-none">{{ formatDate(event.fecha_inicio).split(' ')[1] }}</span>
                <span class="text-sm font-black">{{ formatDate(event.fecha_inicio).split(' ')[0] }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{{ event.evento }}</p>
                <p class="text-[10px] text-gray-500 truncate">{{ event.periodos_academicos?.nombre }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL DE ESTUDIANTE / OTROS (RF08) -->
    <div v-else class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Mi Dashboard</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <GraduationCap class="h-4 w-4 mr-2 text-primary-600" />
            Bienvenido, {{ authStore.profile?.full_name }}. Revisa tus inscripciones y calendario.
          </p>
        </div>
        <div class="flex gap-3">
          <router-link :to="{ name: 'student-enrollment' }" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center shadow-md shadow-primary-500/20">
            <BookOpen class="h-4 w-4 mr-2" />
            Inscribir Materias
          </router-link>
          <router-link :to="{ name: 'student-grades' }" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center">
            <FileText class="h-4 w-4 mr-2" />
            Ver mis Notas
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Próximos Eventos Estudiante -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Calendario Académico</h3>
            <Calendar class="h-5 w-5 text-indigo-500" />
          </div>
          <div class="p-4 space-y-4">
            <div v-if="loadingCalendar" class="flex justify-center p-4">
              <div class="animate-spin h-6 w-6 border-b-2 border-indigo-500 rounded-full"></div>
            </div>
            <div v-else-if="calendarEvents.length === 0" class="text-center py-6 text-gray-500 text-sm">No hay eventos próximos.</div>
            <div 
              v-for="event in calendarEvents" 
              :key="event.id"
              @click="openEventModal(event)"
              class="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
            >
              <div class="flex-shrink-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <span class="text-xs font-bold uppercase">{{ formatDate(event.fecha_inicio).split(' ')[1] }}</span>
                <span class="text-lg font-black leading-none">{{ formatDate(event.fecha_inicio).split(' ')[0] }}</span>
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{{ event.evento }}</h4>
                <p class="text-xs text-gray-500">{{ event.periodos_academicos?.nombre }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mis Actividades Recientes Estudiante -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 dark:text-white">Mi Actividad</h3>
            <Activity class="h-5 w-5 text-gray-400" />
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-if="loadingActivities" class="p-8 text-center"><Loader2 class="h-8 w-8 animate-spin mx-auto text-primary-500" /></div>
            <div v-else-if="recentActivities.length === 0" class="p-8 text-center text-gray-500 text-sm">No tienes actividad reciente.</div>
            <div v-for="act in recentActivities" :key="act.id" class="px-6 py-4 flex items-center gap-4">
              <div class="h-8 w-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                <Clock class="h-4 w-4" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ act.descripcion }}</p>
                <p class="text-xs text-gray-400">{{ new Date(act.fecha).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Evento -->
    <div v-if="showEventModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center gap-2">
            <Calendar class="w-5 h-5 text-indigo-600" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Detalle del Evento</h3>
          </div>
          <button @click="showEventModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <div>
            <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider mb-2 inline-block">
              {{ selectedEvent?.periodos_academicos?.nombre || 'General' }}
            </span>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {{ selectedEvent?.evento }}
            </h2>
          </div>

          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Clock class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Duración</p>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Desde: {{ new Date(selectedEvent?.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                </p>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Hasta: {{ new Date(selectedEvent?.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Info class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ parseDescription(selectedEvent?.descripcion) || 'No hay descripción adicional para este evento.' }}
                </p>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <button 
              @click="showEventModal = false"
              class="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
