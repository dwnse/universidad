<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminController } from '@/controllers/AdminController'
import { 
  Search, 
  Plus, 
  BookOpen, 
  User, 
  Clock, 
  MapPin, 
  Calendar,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-vue-next'
import AddParallelModal from '../components/AddParallelModal.vue'

const adminController = useAdminController()
const searchQuery = ref('')
const showAddModal = ref(false)

onMounted(async () => {
  await adminController.fetchParalelos()
  await adminController.fetchAuxiliarData()
})

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este paralelo?')) {
    await adminController.deleteParalelo(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Paralelos</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Administra los cursos, horarios y docentes asignados.</p>
      </div>
      <button 
        @click="showAddModal = true"
        class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        <Plus class="h-5 w-5 mr-2" />
        Nuevo Paralelo
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por materia o docente..." 
          class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>

    <!-- Parallels Grid -->
    <div v-if="adminController.loading.value" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="p in adminController.paralelos.value" 
        :key="p.id"
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-5 space-y-4">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold">
                {{ p.nombre }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white line-clamp-1">{{ p.materias?.nombre }}</h3>
                <span class="text-xs text-gray-500 font-mono">{{ p.materias?.codigo }}</span>
              </div>
            </div>
            <button @click="handleDelete(p.id)" class="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-2 pt-2">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <User class="h-4 w-4 mr-2 text-gray-400" />
              {{ p.docentes?.usuarios ? `${p.docentes.usuarios.nombres} ${p.docentes.usuarios.apellidos}` : 'Sin docente' }}
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock class="h-4 w-4 mr-2 text-gray-400" />
              {{ p.horario_inicio }} - {{ p.horario_fin }} ({{ p.turno }})
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin class="h-4 w-4 mr-2 text-gray-400" />
              Aula: {{ p.aulas?.nombre || 'No asignada' }}
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar class="h-4 w-4 mr-2 text-gray-400" />
              {{ p.periodos_academicos?.nombre }}
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary-500" 
                  :style="{ width: `${(p.cupo_actual / p.cupo_maximo) * 100}%` }"
                ></div>
              </div>
              <span class="ml-2 text-xs font-medium text-gray-500">
                {{ p.cupo_actual }}/{{ p.cupo_maximo }}
              </span>
            </div>
            <span :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
              p.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
            ]">
              {{ p.activo ? 'Activo' : 'Cerrado' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddParallelModal 
      v-if="showAddModal" 
      :show="showAddModal"
      @close="showAddModal = false"
    />
  </div>
</template>
