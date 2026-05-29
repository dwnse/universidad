<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { User, Mail, Shield, CreditCard, Phone, Lock } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'save'])

const formData = ref({
  nombres: '',
  apellidos: '',
  email: '',
  rol: 'ESTUDIANTE',
  ci: '',
  telefono: '',
  password: ''
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    // Basic validation
    if (!formData.value.email || !formData.value.nombres || !formData.value.password) {
      alert('Por favor complete los campos obligatorios')
      return
    }

    const userData = {
      nombres: formData.value.nombres,
      apellidos: formData.value.apellidos,
      email: formData.value.email,
      rol: formData.value.rol,
      ci: formData.value.ci,
      telefono: formData.value.telefono,
      password_hash: formData.value.password, // Following schema requirement
      estado: 'ACTIVO'
    }

    emit('save', userData)
    resetForm()
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    nombres: '',
    apellidos: '',
    email: '',
    rol: 'ESTUDIANTE',
    ci: '',
    telefono: '',
    password: ''
  }
}
</script>

<template>
  <BaseModal :show="show" title="Agregar Nuevo Usuario" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nombres -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nombres *</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              v-model="formData.nombres"
              type="text" 
              required
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ej. Juan"
            />
          </div>
        </div>

        <!-- Apellidos -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos *</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              v-model="formData.apellidos"
              type="text" 
              required
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ej. Pérez"
            />
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico *</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            v-model="formData.email"
            type="email" 
            required
            class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="juan.perez@universidad.edu"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- CI -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Cédula de Identidad</label>
          <div class="relative">
            <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              v-model="formData.ci"
              type="text" 
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="12345678"
            />
          </div>
        </div>

        <!-- Teléfono -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              v-model="formData.telefono"
              type="text" 
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="+591 70000000"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Rol -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Rol *</label>
          <div class="relative">
            <Shield class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              v-model="formData.rol"
              required
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
            >
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="DOCENTE">Docente</option>
              <option value="ESTUDIANTE">Estudiante</option>
            </select>
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña *</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              v-model="formData.password"
              type="password" 
              required
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
        >
          {{ loading ? 'Guardando...' : 'Crear Usuario' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
