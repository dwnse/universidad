<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminController } from '@/controllers/AdminController'
import BaseModal from '@/views/components/BaseModal.vue'
import { 
  BookOpen, 
  Plus, 
  GraduationCap, 
  Code, 
  MoreVertical,
  Loader2
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const adminController = useAdminController()
const toast = useToast()
const isModalOpen = ref(false)
const isSubmitting = ref(false)

const newCareer = ref({
  name: '',
  code: '',
  description: ''
})

onMounted(() => {
  adminController.fetchCareers()
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await adminController.createCareer(newCareer.value)
    toast.success('Carrera creada exitosamente')
    isModalOpen.value = false
    newCareer.value = { name: '', code: '', description: '' }
  } catch (error: any) {
    toast.error(error.message || 'Error al crear la carrera')
  } finally {
    isSubmitting.value = false
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
        @click="isModalOpen = true"
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
        class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary-500/50 transition-all group"
      >
        <div class="flex items-start justify-between">
          <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
            <GraduationCap class="h-6 w-6" />
          </div>
          <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <MoreVertical class="h-5 w-5" />
          </button>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            {{ career.name }}
          </h3>
          <div class="flex items-center mt-2 text-sm text-gray-500">
            <Code class="h-4 w-4 mr-2" />
            Código: <span class="font-mono ml-1 font-semibold text-gray-700 dark:text-gray-300">{{ career.code }}</span>
          </div>
          <p v-if="career.description" class="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ career.description }}
          </p>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-400">
            Creado: {{ new Date(career.created_at).toLocaleDateString() }}
          </span>
          <button class="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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

    <!-- Create Career Modal -->
    <BaseModal :show="isModalOpen" title="Nueva Carrera" @close="isModalOpen = false">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Carrera</label>
          <input 
            v-model="newCareer.name"
            type="text" 
            required
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: Ingeniería de Sistemas"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código</label>
          <input 
            v-model="newCareer.code"
            type="text" 
            required
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder="Ej: IS-01"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (Opcional)</label>
          <textarea 
            v-model="newCareer.description"
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
            Guardar Carrera
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
