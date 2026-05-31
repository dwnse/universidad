<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ReportController } from '@/controllers/ReportController'
import { useAdminController } from '@/controllers/AdminController'
import { 
  FileText, 
  BarChart3, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Download,
  Loader2,
  Calendar,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const adminController = useAdminController()
const toast = useToast()
const loading = ref(false)
const selectedCarrera = ref('')

onMounted(() => {
  adminController.fetchCareers()
})

const handleReport = async (type: string, payload?: any) => {
  loading.value = true
  try {
    switch(type) {
      case 'AUDITORIA':
        await ReportController.auditoriaSistema()
        break
      case 'USUARIOS_ROL':
        await ReportController.usuariosPorRol(payload)
        break
      case 'MATERIAS_CARRERA':
        if (!selectedCarrera.value) {
          toast.warning('Por favor selecciona una carrera')
          return
        }
        const carrera = adminController.careers.value.find(c => c.id === selectedCarrera.value)
        await ReportController.materiasPorCarrera(carrera.id, carrera.nombre)
        break
      case 'ALUMNOS_CARRERA':
        if (!selectedCarrera.value) {
          toast.warning('Por favor selecciona una carrera')
          return
        }
        const carrAlumn = adminController.careers.value.find(c => c.id === selectedCarrera.value)
        await ReportController.alumnosPorCarrera(carrAlumn.id, carrAlumn.nombre)
        break
    }
    toast.success('Reporte generado exitosamente')
  } catch (e: any) {
    toast.error('Error al generar reporte: ' + e.message)
  } finally {
    loading.value = false
  }
}

const reports = [
  { 
    id: 'AUDITORIA', 
    title: 'Auditoría de Movimientos', 
    desc: 'Historial completo de acciones, cambios y accesos de todos los usuarios.',
    icon: Activity,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  { 
    id: 'USUARIOS_ADMIN', 
    title: 'Listado de Administradores', 
    desc: 'Reporte detallado de personal administrativo con acceso al sistema.',
    icon: ShieldCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    payload: 'ADMINISTRADOR'
  },
  { 
    id: 'USUARIOS_DOCENTE', 
    title: 'Nómina de Docentes', 
    desc: 'Listado oficial de todos los profesores activos en la institución.',
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    payload: 'DOCENTE'
  }
]
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 class="h-8 w-8 text-primary-600" />
          Centro de Reportes
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Genera documentos oficiales y análisis de datos institucionales.</p>
      </div>
    </div>

    <!-- Filtros de Carrera para reportes específicos -->
    <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-end gap-6">
      <div class="flex-1 space-y-2 w-full">
        <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Carrera para Reportes Específicos</label>
        <select 
          v-model="selectedCarrera"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
        >
          <option value="">-- Elige una carrera --</option>
          <option v-for="c in adminController.careers.value" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button 
          @click="handleReport('MATERIAS_CARRERA')"
          :disabled="loading || !selectedCarrera"
          class="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
        >
          <BookOpen class="h-5 w-5 mr-2" />
          Materias (PDF)
        </button>
        <button 
          @click="handleReport('ALUMNOS_CARRERA')"
          :disabled="loading || !selectedCarrera"
          class="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
        >
          <GraduationCap class="h-5 w-5 mr-2 text-primary-600" />
          Alumnos (PDF)
        </button>
      </div>
    </div>

    <!-- Grid de Reportes Generales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="rep in reports" 
        :key="rep.id"
        @click="handleReport(rep.id.startsWith('USUARIOS') ? 'USUARIOS_ROL' : rep.id, rep.payload)"
        class="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/5 transition-all cursor-pointer relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <FileText class="h-16 w-16 text-primary-600" />
        </div>
        
        <div class="flex items-center gap-4 mb-4">
          <div :class="['p-3 rounded-xl transition-transform group-hover:scale-110', rep.bg]">
            <component :is="rep.icon" :class="['h-6 w-6', rep.color]" />
          </div>
          <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl z-20">
            <Loader2 class="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </div>

        <h3 class="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{{ rep.title }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{{ rep.desc }}</p>
        
        <div class="flex items-center text-primary-600 font-bold text-sm">
          Generar ahora
          <ChevronRight class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>

    <!-- Sección Informativa (RF12) -->
    <div class="bg-gray-900 dark:bg-primary-900/20 rounded-2xl p-8 text-white relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="max-w-xl">
          <h3 class="text-2xl font-black mb-2">Información de los Reportes</h3>
          <p class="text-gray-300">Todos los documentos generados son oficiales y contienen sellos de tiempo automáticos extraídos directamente de la base de datos de producción.</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-center px-4 border-r border-white/10">
            <p class="text-3xl font-black">PDF</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Formato Oficial</p>
          </div>
          <div class="text-center px-4">
            <p class="text-3xl font-black">XLSX</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Análisis de Datos</p>
          </div>
        </div>
      </div>
      <!-- Decorative circle -->
      <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-600 rounded-full blur-3xl opacity-20"></div>
    </div>
  </div>
</template>
