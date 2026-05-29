<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useAdminController } from '@/controllers/AdminController'
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  X,
  Loader2,
  Clock,
  Hash,
  Search,
  Library
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  career: any
}>()

const emit = defineEmits(['close'])
const adminController = useAdminController()
const toast = useToast()

const isAdding = ref(false)
const isExisting = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const searchQuery = ref('')
const selectedSubjectId = ref<string | null>(null)

const form = ref({
  nombre: '',
  codigo: '',
  creditos: 1,
  semestre: 1,
  nivel: 1,
  horas_teoricas: 2,
  horas_practicas: 2
})

watch(() => props.show, (newVal) => {
  if (newVal && props.career) {
    adminController.fetchSubjectsByCareer(props.career.id)
    adminController.fetchAllSubjects()
  }
})

const filteredGlobalSubjects = computed(() => {
  const currentIds = adminController.careerSubjects.value.map(s => s.materias.id)
  return adminController.allSubjects.value.filter(s => 
    !currentIds.includes(s.id) && 
    (s.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
     s.codigo.toLowerCase().includes(searchQuery.value.toLowerCase()))
  ).slice(0, 10) // Limit to top 10 results
})

const resetForm = () => {
  form.value = {
    nombre: '',
    codigo: '',
    creditos: 1,
    semestre: 1,
    nivel: 1,
    horas_teoricas: 2,
    horas_practicas: 2
  }
  isAdding.value = false
  isExisting.value = false
  editingId.value = null
  selectedSubjectId.value = null
  searchQuery.value = ''
}

const handleSave = async () => {
  isSubmitting.value = true
  try {
    const pensumData = {
      semestre: form.value.semestre,
      nivel: form.value.nivel,
      obligatoria: true
    }

    if (isExisting.value) {
      if (!selectedSubjectId.value) throw new Error('Selecciona una materia')
      await adminController.linkSubjectToCareer(props.career.id, selectedSubjectId.value, pensumData)
      toast.success('Materia vinculada')
    } else {
      const subjectData = {
        nombre: form.value.nombre,
        codigo: form.value.codigo,
        creditos: form.value.creditos,
        horas_teoricas: form.value.horas_teoricas,
        horas_practicas: form.value.horas_practicas
      }

      if (editingId.value) {
        const subject = adminController.careerSubjects.value.find(s => s.id === editingId.value)
        await adminController.updateSubject(subject.materias.id, subjectData, subject.id, pensumData, props.career.id)
        toast.success('Materia actualizada')
      } else {
        await adminController.createSubject(props.career.id, subjectData, pensumData)
        toast.success('Materia creada')
      }
    }
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar')
  } finally {
    isSubmitting.value = false
  }
}

const selectExisting = (materia: any) => {
  selectedSubjectId.value = materia.id
  searchQuery.value = materia.nombre
}

const startEdit = (item: any) => {
  editingId.value = item.id
  isAdding.value = true
  form.value = {
    nombre: item.materias.nombre,
    codigo: item.materias.codigo,
    creditos: item.materias.creditos,
    semestre: item.semestre,
    nivel: item.nivel,
    horas_teoricas: item.materias.horas_teoricas,
    horas_practicas: item.materias.horas_practicas
  }
}

const handleDelete = async (item: any) => {
  if (confirm(`¿Eliminar ${item.materias.nombre} de esta carrera?`)) {
    try {
      await adminController.deleteSubject(item.id, item.materias.id, props.career.id)
      toast.success('Materia eliminada')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar')
    }
  }
}
</script>

<template>
  <BaseModal :show="show" :title="`Materias - ${career?.nombre}`" @close="$emit('close')" class="max-w-4xl">
    <div class="space-y-6">
      <!-- Add/Edit Form -->
      <div v-if="isAdding" class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-bold text-gray-900 dark:text-white">{{ editingId ? 'Editar Materia' : (isExisting ? 'Vincular Materia Existente' : 'Nueva Materia') }}</h4>
          <button @click="resetForm" class="text-gray-400 hover:text-gray-600"><X class="h-5 w-5" /></button>
        </div>

        <div v-if="!editingId" class="flex gap-2 mb-6">
          <button 
            type="button"
            @click="isExisting = false; selectedSubjectId = null; searchQuery = ''"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all', !isExisting ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300']"
          >
            Nueva Materia
          </button>
          <button 
            type="button"
            @click="isExisting = true"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all', isExisting ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300']"
          >
            Materia Existente
          </button>
        </div>
        
        <form @submit.prevent="handleSave" class="space-y-4">
          <!-- Existing Subject Search -->
          <div v-if="isExisting && !editingId" class="relative">
            <label class="block text-xs font-medium text-gray-500 mb-1">Buscar Materia</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Nombre o código de la materia..."
                class="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" 
              />
            </div>

            <!-- Search Results -->
            <div v-if="searchQuery && !selectedSubjectId" class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              <div 
                v-for="s in filteredGlobalSubjects" 
                :key="s.id"
                @click="selectExisting(s)"
                class="px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ s.nombre }}</p>
                <p class="text-xs text-gray-500 font-mono">{{ s.codigo }}</p>
              </div>
              <div v-if="filteredGlobalSubjects.length === 0" class="px-4 py-3 text-sm text-gray-500 italic">
                No se encontraron materias disponibles.
              </div>
            </div>

            <div v-if="selectedSubjectId" class="mt-2 p-2 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 rounded-lg flex items-center justify-between">
              <div class="flex items-center">
                <Library class="h-4 w-4 text-primary-600 mr-2" />
                <span class="text-sm font-medium text-primary-900 dark:text-primary-300">{{ searchQuery }}</span>
              </div>
              <button @click="selectedSubjectId = null; searchQuery = ''" class="text-primary-600 hover:text-primary-700"><X class="h-4 w-4" /></button>
            </div>
          </div>

          <!-- Fields -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <template v-if="!isExisting">
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">Nombre de Materia</label>
                <input v-model="form.nombre" type="text" required class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Código</label>
                <input v-model="form.codigo" type="text" required class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono" />
              </div>
            </template>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Semestre</label>
              <input v-model.number="form.semestre" type="number" required class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
            </div>
            
            <template v-if="!isExisting">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Créditos</label>
                <input v-model.number="form.creditos" type="number" required class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
            </template>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Nivel</label>
              <input v-model.number="form.nivel" type="number" required class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
            </div>
          </div>
          
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="resetForm" class="px-4 py-2 text-sm text-gray-600">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center">
              <Loader2 v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" />
              <Save class="h-4 w-4 mr-2" />
              {{ editingId ? 'Actualizar' : (isExisting ? 'Vincular' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="flex justify-between items-center">
        <p class="text-sm text-gray-500">Lista de materias que conforman el plan de estudios.</p>
        <button @click="isAdding = true" class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus class="h-4 w-4 mr-1" />
          Agregar Materia
        </button>
      </div>

      <!-- Subjects List -->
      <div class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-3">Materia</th>
              <th class="px-4 py-3 text-center">Sem.</th>
              <th class="px-4 py-3 text-center">Créd.</th>
              <th class="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-if="adminController.loading.value" v-for="i in 3" :key="i">
              <td colspan="4" class="px-4 py-4 animate-pulse"><div class="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div></td>
            </tr>
            <tr v-else-if="adminController.careerSubjects.value.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-gray-400 text-sm italic">
                No hay materias registradas para esta carrera.
              </td>
            </tr>
            <tr v-for="item in adminController.careerSubjects.value" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-white">{{ item.materias?.nombre }}</div>
                <div class="text-xs text-gray-500 font-mono">{{ item.materias?.codigo }}</div>
              </td>
              <td class="px-4 py-3 text-center text-sm">{{ item.semestre }}°</td>
              <td class="px-4 py-3 text-center text-sm font-semibold text-primary-600">{{ item.materias?.creditos }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-1">
                  <button @click="startEdit(item)" class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button @click="handleDelete(item)" class="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </BaseModal>
</template>
