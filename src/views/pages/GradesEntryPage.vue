<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDocenteController } from '@/controllers/DocenteController'
import { 
  BookOpen, 
  Users, 
  Save, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { ReportController } from '@/controllers/ReportController'

const authStore = useAuthStore()
const docenteController = useDocenteController()
const toast = useToast()
const selectedParallel = ref<any>(null)
const docenteId = ref<string | null>(null)
const savingId = ref<string | null>(null)
const isGeneratingReport = ref(false)

onMounted(async () => {
  if (authStore.profile?.id) {
    const dId = await docenteController.fetchDocenteId(authStore.profile.id)
    if (dId) {
      docenteId.value = dId
      await docenteController.fetchAssignedParallels(dId)
    }
  }
})

watch(selectedParallel, async (newVal) => {
  if (newVal) {
    await docenteController.fetchParallelStudents(newVal.id)
  }
})

const calculateAverage = (s: any) => {
  const p1 = Number(s.nota_primer_parcial) || 0
  const p2 = Number(s.nota_segundo_parcial) || 0
  const ef = Number(s.nota_examen_final) || 0
  return Math.round((p1 + p2 + ef) / 3)
}

const saveStudentGrades = async (student: any) => {
  // Validación de rango
  if (student.nota_primer_parcial < 0 || student.nota_primer_parcial > 100 ||
      student.nota_segundo_parcial < 0 || student.nota_segundo_parcial > 100 ||
      student.nota_examen_final < 0 || student.nota_examen_final > 100) {
    toast.error('Las notas deben estar entre 0 y 100')
    return
  }

  savingId.value = student.id
  const grades = {
    nota_primer_parcial: Number(student.nota_primer_parcial) || 0,
    nota_segundo_parcial: Number(student.nota_segundo_parcial) || 0,
    nota_examen_final: Number(student.nota_examen_final) || 0
  }
  
  try {
    await docenteController.saveGrade(student.id, grades, authStore.profile?.id)
    student.promedio_final = Math.round((grades.nota_primer_parcial + grades.nota_segundo_parcial + grades.nota_examen_final) / 3)
    toast.success('Nota guardada: ' + student.student_name)
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar')
  } finally {
    savingId.value = null
  }
}

const generateGradesReport = async () => {
  if (!selectedParallel.value) return
  isGeneratingReport.value = true
  try {
    await ReportController.notasPorCurso(
      selectedParallel.value.id, 
      selectedParallel.value.materias?.nombre || 'Materia',
      selectedParallel.value.nombre
    )
    toast.success('Acta de notas generada correctamente')
  } catch (error: any) {
    toast.error('Error al generar reporte: ' + error.message)
  } finally {
    isGeneratingReport.value = false
  }
}

const generateInscritosReport = async () => {
  if (!selectedParallel.value) return
  isGeneratingReport.value = true
  try {
    await ReportController.listaInscritos(
      selectedParallel.value.id, 
      selectedParallel.value.materias?.nombre || 'Materia',
      selectedParallel.value.nombre
    )
    toast.success('Lista de inscritos generada correctamente')
  } catch (error: any) {
    toast.error('Error al generar reporte: ' + error.message)
  } finally {
    isGeneratingReport.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Vista de Selección de Paralelo -->
    <div v-if="!selectedParallel" class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white text-balance">Registro de Calificaciones</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Selecciona una de tus materias asignadas para gestionar las notas.</p>
        </div>
      </div>

      <div v-if="docenteController.loading.value" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="h-44 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse"></div>
      </div>

      <div v-else-if="docenteController.parallels.value.length === 0" class="py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <BookOpen class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">No tienes paralelos asignados en este periodo.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="p in docenteController.parallels.value" 
          :key="p.id"
          @click="selectedParallel = p"
          class="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/5 transition-all cursor-pointer relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BookOpen class="h-16 w-16 text-primary-600" />
          </div>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
              <BookOpen class="h-5 w-5" />
            </div>
            <span class="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 uppercase">
              Paralelo {{ p.nombre }}
            </span>
          </div>
          
          <h3 class="text-lg font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
            {{ p.materias?.nombre }}
          </h3>
          <p class="text-sm text-gray-500 font-mono mb-4">{{ p.materias?.codigo }}</p>
          
          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users class="h-4 w-4 mr-2 text-primary-500" />
              <span>Ver Estudiantes</span>
            </div>
            <div class="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <ChevronLeft class="h-4 w-4 rotate-180" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de Entrada de Notas -->
    <div v-else class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <button 
          @click="selectedParallel = null"
          class="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-primary-600 rounded-xl transition-all shadow-sm"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-black text-gray-900 dark:text-white">{{ selectedParallel.materias?.nombre }}</h1>
          <div class="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span class="font-bold text-primary-600">Paralelo {{ selectedParallel.nombre }}</span>
            <span>•</span>
            <span>{{ selectedParallel.periodos_academicos?.nombre }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="generateInscritosReport"
            :disabled="isGeneratingReport"
            class="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Users class="h-4 w-4 mr-2 text-primary-500" />
            Lista Inscritos
          </button>
          <button 
            @click="generateGradesReport"
            :disabled="isGeneratingReport"
            class="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95 disabled:opacity-50"
          >
            <FileText v-if="!isGeneratingReport" class="h-4 w-4 mr-2 text-red-500" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Descargar Acta
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Estudiante</th>
                <th class="px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">1er Parcial</th>
                <th class="px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">2do Parcial</th>
                <th class="px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Examen Final</th>
                <th class="px-4 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Promedio</th>
                <th class="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-if="docenteController.loading.value" v-for="i in 5" :key="i">
                <td colspan="6" class="px-6 py-6"><div class="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse"></div></td>
              </tr>
              <tr v-else v-for="student in docenteController.currentStudents.value" :key="student.id" class="hover:bg-primary-50/10 dark:hover:bg-primary-900/5 transition-colors group">
                <td class="px-6 py-4">
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ student.student_name }}</div>
                  <div class="text-[11px] text-gray-400 font-medium uppercase tracking-tight">{{ student.registro }}</div>
                </td>
                <td class="px-4 py-4">
                  <input 
                    type="number"
                    v-model="student.nota_primer_parcial"
                    min="0" max="100"
                    class="w-20 mx-auto block text-center py-2 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-700 rounded-xl text-sm font-bold transition-all outline-none"
                  />
                </td>
                <td class="px-4 py-4">
                  <input 
                    type="number"
                    v-model="student.nota_segundo_parcial"
                    min="0" max="100"
                    class="w-20 mx-auto block text-center py-2 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-700 rounded-xl text-sm font-bold transition-all outline-none"
                  />
                </td>
                <td class="px-4 py-4">
                  <input 
                    type="number"
                    v-model="student.nota_examen_final"
                    min="0" max="100"
                    class="w-20 mx-auto block text-center py-2 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-700 rounded-xl text-sm font-bold transition-all outline-none"
                  />
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex flex-col items-center">
                    <span :class="[
                      'text-base font-black px-3 py-1 rounded-lg',
                      calculateAverage(student) >= 51 
                        ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                        : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    ]">
                      {{ calculateAverage(student) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    @click="saveStudentGrades(student)"
                    :disabled="savingId === student.id"
                    :class="[
                      'inline-flex items-center justify-center p-2.5 rounded-xl transition-all active:scale-90',
                      savingId === student.id ? 'bg-gray-100 text-gray-400' : 'text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30'
                    ]"
                  >
                    <Loader2 v-if="savingId === student.id" class="h-5 w-5 animate-spin" />
                    <Save v-else class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="!docenteController.loading.value && docenteController.currentStudents.value.length === 0" class="p-12 text-center">
          <AlertCircle class="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">No hay estudiantes inscritos en este paralelo.</p>
        </div>
      </div>
    </div>
  </div>
</template>
