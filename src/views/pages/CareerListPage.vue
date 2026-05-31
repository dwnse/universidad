<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminController } from '@/controllers/AdminController'
import BaseModal from '@/views/components/BaseModal.vue'
import SubjectsManagementModal from '../components/SubjectsManagementModal.vue'
import { 
  BookOpen, 
  Plus, 
  GraduationCap, 
  Code, 
  MoreVertical,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { ReportController } from '@/controllers/ReportController'
import { FileText } from 'lucide-vue-next'

const adminController = useAdminController()
const toast = useToast()
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const editingCareer = ref<any>(null)
const activeDropdown = ref<string | null>(null)
const selectedCareerForSubjects = ref<any>(null)
const isSubjectsModalOpen = ref(false)
const isGeneratingReport = ref(false)

const handleDownloadReport = async (career: any) => {
  activeDropdown.value = null
  isGeneratingReport.value = true
  try {
    await ReportController.materiasPorCarrera(career.id, career.nombre)
    toast.success('Reporte generado correctamente')
  } catch (error: any) {
    toast.error('Error al generar reporte: ' + error.message)
  } finally {
    isGeneratingReport.value = false
  }
}

const openSubjectsModal = (career: any) => {
  selectedCareerForSubjects.value = career
  isSubjectsModalOpen.value = true
}

const careerForm = ref({
  nombre: '',
  codigo: '',
  descripcion: ''
})

onMounted(() => {
  adminController.fetchCareers()
  window.addEventListener('click', () => activeDropdown.value = null)
})

const openAddModal = () => {
  editingCareer.value = null
  careerForm.value = { nombre: '', codigo: '', descripcion: '' }
  isModalOpen.value = true
}

const openEditModal = (career: any) => {
  editingCareer.value = career
  careerForm.value = { 
    nombre: career.nombre, 
    codigo: career.codigo, 
    descripcion: career.descripcion || '' 
  }
  isModalOpen.value = true
  activeDropdown.value = null
}

const toggleDropdown = (e: Event, id: string) => {
  e.stopPropagation()
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (editingCareer.value) {
      await adminController.updateCareer(editingCareer.value.id, careerForm.value)
      toast.success('Carrera actualizada exitosamente')
    } else {
      await adminController.createCareer(careerForm.value)
      toast.success('Carrera creada exitosamente')
    }
    isModalOpen.value = false
    careerForm.value = { nombre: '', codigo: '', descripcion: '' }
  } catch (error: any) {
    toast.error(error.message || 'Error al procesar la carrera')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (career: any) => {
  activeDropdown.value = null
  if (confirm(`¿Estás seguro de que deseas eliminar la carrera ${career.nombre}?`)) {
    try {
      await adminController.deleteCareer(career.id)
      toast.success('Carrera eliminada')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar')
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Carreras Universitarias</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gestiona la oferta académica de la institución.</p>
      </div>
      <button 
        @click="openAddModal"
        class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        <Plus class="h-5 w-5 mr-2" />
        Nueva Carrera
      </button>
    </div>

    <div v-if="adminController.loading.value" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="career in adminController.careers.value" 
        :key="career.id"
        class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary-500/50 transition-all group relative"
      >
        <div class="flex items-start justify-between">
          <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
            <GraduationCap class="h-6 w-6" />
          </div>
          <div class="relative">
            <button 
              @click="toggleDropdown($event, career.id)"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical class="h-5 w-5" />
            </button>
            
            <!-- Dropdown -->
            <div 
              v-if="activeDropdown === career.id"
              class="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-10 py-1 overflow-hidden"
            >
              <button 
                @click="handleDownloadReport(career)"
                :disabled="isGeneratingReport"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FileText class="h-4 w-4 mr-2 text-primary-500" />
                Descargar Materias
              </button>
              <button 
                @click="openEditModal(career)"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Pencil class="h-4 w-4 mr-2 text-blue-500" />
                Editar
              </button>
              <button 
                @click="handleDelete(career)"
                class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 class="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            {{ career.nombre }}
          </h3>
          <div class="flex items-center mt-2 text-sm text-gray-500">
            <Code class="h-4 w-4 mr-2" />
            Código: <span class="font-mono ml-1 font-semibold text-gray-700 dark:text-gray-300">{{ career.codigo }}</span>
          </div>
          <p v-if="career.descripcion" class="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ career.descripcion }}
          </p>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-400">
            Creado: {{ new Date(career.created_at).toLocaleDateString() }}
          </span>
          <button 
            @click="openSubjectsModal(career)"
            class="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Ver materias
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="adminController.careers.value?.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <BookOpen class="h-12 w-12 text-gray-300 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">No hay carreras registradas</p>
        <button @click="isModalOpen = true" class="mt-4 text-primary-600 font-semibold hover:underline">
          Comienza creando una carrera
        </button>
      </div>
    </div>

    <!-- Create/Edit Career Modal -->
    <BaseModal :show="isModalOpen" :title="editingCareer ? 'Editar Carrera' : 'Nueva Carrera'" @close="isModalOpen = false">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Carrera</label>
          <input 
            v-model="careerForm.nombre"
            type="text" 
            required
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: Ingeniería de Sistemas"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código</label>
          <input 
            v-model="careerForm.codigo"
            type="text" 
            required
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder="Ej: IS-01"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (Opcional)</label>
          <textarea 
            v-model="careerForm.descripcion"
            rows="3"
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Breve descripción de la carrera..."
          ></textarea>
        </div>
        
        <div class="pt-4 flex items-center justify-end gap-3">
          <button 
            type="button"
            @click="isModalOpen = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 shadow-md shadow-primary-500/20"
          >
            <Loader2 v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" />
            {{ editingCareer ? 'Guardar Cambios' : 'Crear Carrera' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Subjects Management Modal -->
    <SubjectsManagementModal 
      :show="isSubjectsModalOpen" 
      :career="selectedCareerForSubjects"
      @close="isSubjectsModalOpen = false"
    />
  </div>
</template>
