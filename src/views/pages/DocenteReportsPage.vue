<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDocenteController } from '@/controllers/DocenteController'
import { ReportController } from '@/controllers/ReportController'
import { 
  BarChart3, 
  BookOpen, 
  FileText, 
  Users, 
  Download,
  Loader2,
  ChevronRight,
  ClipboardList
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const docenteController = useDocenteController()
const toast = useToast()
const loading = ref(false)
const selectedParallelId = ref('')

onMounted(async () => {
  if (authStore.profile?.id) {
    const dId = await docenteController.fetchDocenteId(authStore.profile.id)
    if (dId) {
      await docenteController.fetchAssignedParallels(dId)
    }
  }
})

const handleGenerateReport = async (type: 'GRADES' | 'LIST') => {
  if (!selectedParallelId.value) {
    toast.warning('Por favor selecciona una materia/paralelo')
    return
  }

  const parallel = docenteController.parallels.value.find(p => p.id === selectedParallelId.value)
  if (!parallel) return

  loading.value = true
  try {
    if (type === 'GRADES') {
      await ReportController.notasPorCurso(parallel.id, parallel.materias.nombre, parallel.nombre)
      toast.success('Acta de notas generada correctamente')
    } else {
      await ReportController.listaInscritos(parallel.id, parallel.materias.nombre, parallel.nombre)
      toast.success('Lista de estudiantes generada correctamente')
    }
  } catch (e: any) {
    toast.error('Error al generar el reporte: ' + e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h1 class="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
        <BarChart3 class="h-8 w-8 text-primary-600" />
        Mis Reportes Académicos
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Genera actas de notas y listados oficiales de tus materias asignadas.</p>
    </div>

    <!-- Selector de Materia -->
    <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
      <div class="max-w-xl space-y-2">
        <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Materia y Paralelo</label>
        <select 
          v-model="selectedParallelId"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-700 dark:text-gray-200"
        >
          <option value="">-- Elige una materia --</option>
          <option v-for="p in docenteController.parallels.value" :key="p.id" :value="p.id">
            {{ p.materias?.nombre }} - Paralelo {{ p.nombre }} ({{ p.periodos_academicos?.nombre }})
          </option>
        </select>
      </div>

      <div v-if="selectedParallelId" class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <!-- Card Acta de Notas -->
        <div 
          @click="handleGenerateReport('GRADES')"
          class="group p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-primary-500 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer relative"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl">
              <ClipboardList class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Acta de Calificaciones</h3>
              <p class="text-xs text-gray-500">Formato PDF oficial con promedios finales.</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm font-bold text-red-600">
            <span>Generar Acta (PDF)</span>
            <Download class="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl">
            <Loader2 class="h-6 w-6 animate-spin text-primary-600" />
          </div>
        </div>

        <!-- Card Lista de Estudiantes -->
        <div 
          @click="handleGenerateReport('LIST')"
          class="group p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-primary-500 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer relative"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-xl">
              <Users class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Lista de Inscritos</h3>
              <p class="text-xs text-gray-500">Listado de alumnos con datos de contacto.</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm font-bold text-primary-600">
            <span>Descargar Lista (PDF)</span>
            <Download class="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl">
            <Loader2 class="h-6 w-6 animate-spin text-primary-600" />
          </div>
        </div>
      </div>

      <div v-else class="py-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
        <FileText class="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <p class="text-gray-400 font-medium text-sm">Selecciona una materia para habilitar los reportes.</p>
      </div>
    </div>

    <!-- Banner Info -->
    <div class="bg-primary-600 rounded-2xl p-6 text-white flex items-center gap-6">
      <div class="p-4 bg-white/10 rounded-2xl">
        <ClipboardList class="h-8 w-8" />
      </div>
      <div>
        <h4 class="text-lg font-bold">Validez de los Documentos</h4>
        <p class="text-primary-100 text-sm">Todos los reportes generados aquí están sincronizados en tiempo real con la tabla `inscripciones`. Cualquier cambio en las notas se reflejará instantáneamente en el PDF.</p>
      </div>
    </div>
  </div>
</template>
