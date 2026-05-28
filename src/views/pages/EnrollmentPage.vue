<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentController } from '@/controllers/StudentController'
import { 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  CheckCircle2, 
  Clock,
  Info,
  ChevronRight
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const studentController = useStudentController()
const toast = useToast()
const searchQuery = ref('')

// Para fines de demo, usamos un careerId fijo o del perfil si existiera
const careerId = 'demo-career-id' 

onMounted(async () => {
  await studentController.fetchAvailableSubjects(careerId)
  if (authStore.profile?.id) {
    await studentController.fetchMyEnrollments(authStore.profile.id)
  }
})

const isEnrolled = (subjectId: string) => {
  return studentController.enrollments.value?.some((e: any) => e.parallels.subject_id === subjectId)
}

const handleEnroll = async (parallelId: string) => {
  if (!authStore.profile?.id) return
  try {
    await studentController.enroll(authStore.profile.id, parallelId)
    toast.success('Inscripción realizada correctamente')
  } catch (error: any) {
    toast.error(error.message || 'Error al inscribirse')
  }
}

const filteredSubjects = computed(() => {
  return studentController.subjects.value.filter((s: any) => 
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inscripción de Materias</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Selecciona tus materias para el periodo académico actual.</p>
      </div>
      <div class="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/50">
        <Info class="h-5 w-5 mr-2" />
        <span class="text-sm font-medium">Máximo 6 materias por periodo</span>
      </div>
    </div>

    <!-- Search -->
    <div class="relative max-w-md">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Buscar materia por nombre o código..." 
        class="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div v-if="studentController.loading.value" class="grid grid-cols-1 gap-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse"></div>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="subject in filteredSubjects" 
        :key="subject.id"
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
      >
        <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div :class="[
              'p-3 rounded-lg',
              isEnrolled(subject.id) ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
            ]">
              <BookOpen class="h-6 w-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ subject.name }}</h3>
                <span v-if="isEnrolled(subject.id)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  INSCRITO
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                {{ subject.code }} • Semestre {{ subject.semester }} • {{ subject.credits }} Créditos
              </p>
            </div>
          </div>
          
          <div v-if="!isEnrolled(subject.id)" class="flex flex-wrap gap-2">
            <div 
              v-for="parallel in subject.parallels" 
              :key="parallel.id"
              class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary-500 transition-colors cursor-pointer group"
              @click="handleEnroll(parallel.id)"
            >
              <div class="text-center border-r border-gray-200 dark:border-gray-700 pr-4">
                <span class="block text-xs font-bold text-gray-400 uppercase">Paralelo</span>
                <span class="text-lg font-black text-primary-600">{{ parallel.name }}</span>
              </div>
              <div class="space-y-1">
                <div class="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  <User class="h-3 w-3 mr-1.5" />
                  {{ parallel.profiles?.full_name || 'Docente por asignar' }}
                </div>
                <div class="flex items-center text-xs text-gray-500">
                  <Clock class="h-3 w-3 mr-1.5" />
                  {{ parallel.schedule }} ({{ parallel.turn }})
                </div>
                <div class="flex items-center text-xs text-gray-500">
                  <div class="flex gap-1">
                    <span v-for="day in parallel.days" :key="day" class="px-1 bg-gray-200 dark:bg-gray-700 rounded-sm text-[10px]">{{ day }}</span>
                  </div>
                </div>
              </div>
              <div class="pl-4">
                <div class="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight class="h-5 w-5" />
                </div>
                <div class="text-[10px] font-bold text-gray-400 mt-1 group-hover:hidden text-center">
                  {{ parallel.capacity - parallel.enrolled_count }} CUPOS
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="flex items-center text-green-600 font-semibold text-sm">
            <CheckCircle2 class="h-5 w-5 mr-2" />
            Ya estás inscrito en esta materia
          </div>
        </div>
      </div>
      
      <div v-if="filteredSubjects.length === 0" class="py-20 text-center bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <BookOpen class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">No se encontraron materias disponibles</p>
      </div>
    </div>
  </div>
</template>
