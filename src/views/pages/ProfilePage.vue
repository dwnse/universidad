<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileController } from '@/controllers/ProfileController'
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Shield, 
  Lock,
  Loader2,
  Camera,
  Save,
  CheckCircle2
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const profileController = useProfileController()
const toast = useToast()

const profileForm = reactive({
  nombres: authStore.profile?.nombres || '',
  apellidos: authStore.profile?.apellidos || '',
  telefono: authStore.profile?.telefono || '',
  ci: authStore.profile?.ci || ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const handleUpdateProfile = async () => {
  try {
    await profileController.updateProfile(authStore.profile!.id, {
      nombres: profileForm.nombres,
      apellidos: profileForm.apellidos,
      telefono: profileForm.telefono,
      ci: profileForm.ci
    })
    toast.success('Perfil actualizado correctamente')
  } catch (e: any) {
    toast.error(e.message || 'Error al actualizar perfil')
  }
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    toast.error('La contraseña debe tener al menos 6 caracteres')
    return
  }

  try {
    await profileController.changePassword(passwordForm.newPassword)
    toast.success('Contraseña cambiada exitosamente')
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e: any) {
    toast.error(e.message || 'Error al cambiar contraseña')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h1 class="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
        <User class="h-8 w-8 text-primary-600" />
        Configuración de Perfil
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Gestiona tu información personal y seguridad de la cuenta.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Sidebar Info -->
      <div class="md:col-span-1 space-y-6">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
          <div class="relative inline-block group">
            <div class="h-32 w-32 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-4xl font-black border-4 border-white dark:border-gray-800 shadow-xl group-hover:opacity-75 transition-opacity">
              {{ authStore.profile?.full_name?.charAt(0) }}
            </div>
            <button class="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors">
              <Camera class="h-4 w-4" />
            </button>
          </div>
          <h2 class="mt-4 text-xl font-bold text-gray-900 dark:text-white">{{ authStore.profile?.full_name }}</h2>
          <p class="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">{{ authStore.userRole }}</p>
          <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Mail class="h-4 w-4" />
              <span class="truncate">{{ authStore.profile?.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Shield class="h-4 w-4" />
              <span>Estado: <span class="font-bold text-green-500">Activo</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Forms -->
      <div class="md:col-span-2 space-y-8">
        <!-- Personal Info -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
            <User class="h-5 w-5 text-primary-600" />
            <h3 class="font-bold text-gray-900 dark:text-white">Información Personal</h3>
          </div>
          <form @submit.prevent="handleUpdateProfile" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nombres</label>
                <input v-model="profileForm.nombres" type="text" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Apellidos</label>
                <input v-model="profileForm.apellidos" type="text" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Cédula de Identidad (CI)</label>
              <div class="relative">
                <CreditCard class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input v-model="profileForm.ci" type="text" class="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Teléfono / WhatsApp</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input v-model="profileForm.telefono" type="text" class="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium" />
              </div>
            </div>
            <div class="pt-4 flex justify-end">
              <button 
                type="submit"
                :disabled="profileController.loading.value"
                class="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 active:scale-95"
              >
                <Loader2 v-if="profileController.loading.value" class="h-4 w-4 mr-2 animate-spin" />
                <Save v-else class="h-4 w-4 mr-2" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        <!-- Security -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
            <Lock class="h-5 w-5 text-primary-600" />
            <h3 class="font-bold text-gray-900 dark:text-white">Cambiar Contraseña</h3>
          </div>
          <form @submit.prevent="handleChangePassword" class="p-6 space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Nueva Contraseña</label>
              <input v-model="passwordForm.newPassword" type="password" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium" placeholder="Mínimo 6 caracteres" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-400 uppercase ml-1">Confirmar Nueva Contraseña</label>
              <input v-model="passwordForm.confirmPassword" type="password" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-medium" />
            </div>
            <div class="pt-4 flex justify-end">
              <button 
                type="submit"
                :disabled="profileController.loading.value"
                class="inline-flex items-center px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 active:scale-95"
              >
                <Loader2 v-if="profileController.loading.value" class="h-4 w-4 mr-2 animate-spin" />
                <Lock v-else class="h-4 w-4 mr-2" />
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
