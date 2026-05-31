<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'
import { useAdminController } from '@/controllers/AdminController'
import { BookOpen, User, Clock, MapPin, Calendar, Shield } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])
const adminController = useAdminController()

const formData = ref({
  materia_id: '',
  periodo_id: '',
  docente_id: '',
  aula_id: '',
  nombre: '',
  turno: 'MAÑANA',
  horario_inicio: '',
  horario_fin: '',
  cupo_maximo: 40,
  activo: true
})

onMounted(async () => {
  await adminController.fetchAllSubjects()
  await adminController.fetchAuxiliarData()
})

const handleSubmit = async () => {
  try {
    await adminController.createParalelo(formData.value)
    emit('close')
  } catch (error) {
    console.error('Error al crear paralelo:', error)
    alert('Error al guardar el paralelo')
  }
}
</script>

<template>
  <BaseModal :show="show" title="Nuevo Paralelo" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Materia & Periodo -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Materia *</label>
          <div class="relative">
            <BookOpen class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select v-model="formData.materia_id" required class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
              <option value="" disabled>Seleccionar materia</option>
              <option v-for="m in adminController.allSubjects.value" :key="m.id" :value="m.id">
                {{ m.nombre }} ({{ m.codigo }})
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Periodo Académico *</label>
          <div class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select v-model="formData.periodo_id" required class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
              <option value="" disabled>Seleccionar periodo</option>
              <option v-for="p in adminController.periodos.value" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Docente & Aula -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Docente *</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select v-model="formData.docente_id" required class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
              <option value="" disabled>Seleccionar docente</option>
              <option v-for="d in adminController.docentes.value" :key="d.id" :value="d.id">
                {{ d.usuarios?.nombres }} {{ d.usuarios?.apellidos }}
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Aula *</label>
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select v-model="formData.aula_id" required class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
              <option value="" disabled>Seleccionar aula</option>
              <option v-for="a in adminController.aulas.value" :key="a.id" :value="a.id">
                {{ a.nombre }} ({{ a.ubicacion }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Nombre del Paralelo & Turno -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Paralelo *</label>
          <input 
            v-model="formData.nombre"
            type="text" 
            required
            placeholder="Ej. A, B o Único"
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Turno *</label>
          <select v-model="formData.turno" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
            <option value="MANANA">Mañana</option>
            <option value="TARDE">Tarde</option>
            <option value="NOCHE">Noche</option>
          </select>
        </div>
      </div>

      <!-- Horarios -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Horario Inicio *</label>
          <div class="relative">
            <Clock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="formData.horario_inicio" type="time" required class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Horario Fin *</label>
          <div class="relative">
            <Clock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="formData.horario_fin" type="time" required class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <!-- Cupo Máximo -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Cupo Máximo *</label>
        <input v-model.number="formData.cupo_maximo" type="number" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          Cancelar
        </button>
        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">
          Crear Paralelo
        </button>
      </div>
    </form>
  </BaseModal>
</template>
