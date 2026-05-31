<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentController } from '@/controllers/StudentController'
import { ReportController } from '@/controllers/ReportController'
import { useToast } from 'vue-toastification'
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  XCircle,
  FileText,
  Clock,
  User,
  Loader2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const studentController = useStudentController()
const toast = useToast()
const isGeneratingReport = ref(false)
const isGeneratingBoleta = ref(false)

onMounted(async () => {
  if (authStore.profile?.id) {
    await studentController.init(authStore.profile.id)
    if (studentController.studentId.value) {
      await studentController.fetchMyEnrollments(studentController.studentId.value)
    }
  }
})

const handleDownloadHistory = async () => {
  if (!studentController.studentId.value) return
  isGeneratingReport.value = true
  try {
    await ReportController.historialAcademico(
      studentController.studentId.value,
      authStore.profile?.full_name || 'Estudiante'
    )
    toast.success('Historial académico generado')
  } catch (error: any) {
    toast.error('Error al generar historial: ' + error.message)
  } finally {
    isGeneratingReport.value = false
  }
}

const handleDownloadBoleta = async () => {
  if (!studentController.studentId.value) return
  isGeneratingBoleta.value = true
  try {
    await ReportController.boletaNotasPeriodo(
      studentController.studentId.value,
      authStore.profile?.full_name || 'Estudiante'
    )
    toast.success('Boleta de notas generada')
  } catch (error: any) {
    toast.error('Error al generar boleta: ' + error.message)
  } finally {
    isGeneratingBoleta.value = false
  }
}

const getStatusClass = (grade: number) => {
  if (!grade && grade !== 0) return 'bg-gray-100 text-gray-500 dark:bg-gray-800'
  return grade >= 51 
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <GraduationCap class="h-8 w-8 text-primary-600" />
          Mis Calificaciones
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Sigue tu progreso académico y rendimiento por materia.</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="handleDownloadBoleta"
          :disabled="isGeneratingBoleta"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-md disabled:opacity-50"
        >
          <FileText v-if="!isGeneratingBoleta" class="h-4 w-4 mr-2" />
          <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
          Boleta de Notas
        </button>
        <button 
          @click="handleDownloadHistory"
          :disabled="isGeneratingReport"
          class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
        >
          <FileText v-if="!isGeneratingReport" class="h-4 w-4 mr-2 text-primary-500" />
          <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
          Historial Académico
        </button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Materias Inscritas</p>
        <p class="text-3xl font-black text-gray-900 dark:text-white">{{ studentController.enrollments.value.length }}</p>
      </div>
      <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Promedio General</p>
        <p class="text-3xl font-black text-primary-600">--</p>
      </div>
      <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estado Académico</p>
        <div class="flex items-center gap-2">
          <CheckCircle2 class="h-6 w-6 text-green-500" />
          <p class="text-xl font-bold text-gray-900 dark:text-white">Regular</p>
        </div>
      </div>
    </div>

    <!-- Grades Table -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Materia</th>
              <th class="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">1er P.</th>
              <th class="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">2do P.</th>
              <th class="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Examen</th>
              <th class="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Final</th>
              <th class="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-if="studentController.loading.value" v-for="i in 3" :key="i">
              <td colspan="6" class="px-6 py-6"><div class="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse"></div></td>
            </tr>
            <tr v-else v-for="insc in studentController.enrollments.value" :key="insc.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                    <BookOpen class="h-5 w-5" />
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900 dark:text-white">{{ insc.paralelos?.materias?.nombre }}</div>
                    <div class="text-[10px] text-gray-500 font-medium uppercase">{{ insc.paralelos?.nombre }} • {{ insc.paralelos?.docentes?.usuarios?.nombres }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-300">
                {{ insc.nota_primer_parcial || '--' }}
              </td>
              <td class="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-300">
                {{ insc.nota_segundo_parcial || '--' }}
              </td>
              <td class="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-300">
                {{ insc.nota_examen_final || '--' }}
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-lg font-black text-gray-900 dark:text-white">
                  {{ Math.round(insc.promedio_final) || '--' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="[
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter',
                  getStatusClass(insc.promedio_final)
                ]">
                  {{ (insc.promedio_final || 0) >= 51 ? 'Aprobado' : (insc.promedio_final === 0 ? 'En curso' : 'Reprobado') }}
                </span>
              </td>
            </tr>
            <tr v-if="!studentController.loading.value && studentController.enrollments.value.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 font-medium">
                No tienes materias inscritas en este periodo.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
