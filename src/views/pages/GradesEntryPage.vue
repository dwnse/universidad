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
  AlertCircle
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const docenteController = useDocenteController()
const toast = useToast()
const selectedParallel = ref<any>(null)

onMounted(async () => {
  if (authStore.profile?.id) {
    await docenteController.fetchAssignedParallels(authStore.profile.id)
  }
})

watch(selectedParallel, async (newVal) => {
  if (newVal) {
    await docenteController.fetchParallelStudents(newVal.id)
  }
})

const saveStudentGrades = async (student: any) => {
  const grades = {
    partial_1: student.grades?.[0]?.partial_1 || 0,
    partial_2: student.grades?.[0]?.partial_2 || 0,
    final_exam: student.grades?.[0]?.final_exam || 0
  }
  try {
    await docenteController.saveGrade(student.id, grades)
    await docenteController.fetchParallelStudents(selectedParallel.value.id)
    toast.success('Calificación guardada')
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar calificación')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Selection Header -->
    <div v-if="!selectedParallel" class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Registro de Calificaciones</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Selecciona una materia para gestionar las notas.</p>
      </div>

      <div v-if="docenteController.loading.value" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="h-40 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="p in docenteController.parallels.value" 
          :key="p.id"
          @click="selectedParallel = p"
          class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary-500 transition-all cursor-pointer group"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
              <BookOpen class="h-6 w-6" />
            </div>
            <span class="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 uppercase tracking-wider">
              Paralelo {{ p.name }}
            </span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            {{ p.subjects.name }}
          </h3>
          <p class="text-sm text-gray-500 mt-1 font-mono">{{ p.subjects.code }}</p>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users class="h-4 w-4 mr-2" />
            Ver lista de estudiantes
          </div>
        </div>
      </div>
    </div>

    <!-- Grades Entry View -->
    <div v-else class="space-y-6">
      <div class="flex items-center gap-4">
        <button 
          @click="selectedParallel = null"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft class="h-6 w-6 text-gray-500" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedParallel.subjects.name }}</h1>
          <p class="text-sm text-gray-500">Paralelo {{ selectedParallel.name }} • Gestión {{ new Date().getFullYear() }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase">
                <th class="px-6 py-4">Estudiante</th>
                <th class="px-6 py-4 text-center">1er Parcial</th>
                <th class="px-6 py-4 text-center">2do Parcial</th>
                <th class="px-6 py-4 text-center">Examen Final</th>
                <th class="px-6 py-4 text-center">Promedio</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-if="docenteController.loading.value" v-for="i in 5" :key="i" class="animate-pulse">
                <td colspan="6" class="px-6 py-4"><div class="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div></td>
              </tr>
              <tr v-else v-for="student in docenteController.currentStudents.value" :key="student.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ student.profiles.full_name }}</div>
                  <div class="text-xs text-gray-500">{{ student.profiles.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <input 
                    type="number"
                    v-model="student.grades[0].partial_1"
                    min="0" max="100"
                    class="w-20 mx-auto block text-center py-1 bg-gray-50 dark:bg-gray-800 border-none rounded focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </td>
                <td class="px-6 py-4">
                  <input 
                    type="number"
                    v-model="student.grades[0].partial_2"
                    min="0" max="100"
                    class="w-20 mx-auto block text-center py-1 bg-gray-50 dark:bg-gray-800 border-none rounded focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </td>
                <td class="px-6 py-4">
                  <input 
                    type="number"
                    v-model="student.grades[0].final_exam"
                    min="0" max="100"
                    class="w-20 mx-auto block text-center py-1 bg-gray-50 dark:bg-gray-800 border-none rounded focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'text-sm font-bold',
                    (student.grades[0]?.average || 0) >= 51 ? 'text-green-600' : 'text-red-600'
                  ]">
                    {{ Math.round(student.grades[0]?.average || 0) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    @click="saveStudentGrades(student)"
                    class="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <Save class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
