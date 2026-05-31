import { ref } from 'vue'
import { supabase } from '@/models/supabase'
import { useAuthStore } from '@/stores/auth'

export const useProfileController = () => {
  const loading = ref(false)
  const authStore = useAuthStore()

  const updateProfile = async (usuarioId: string, updates: any) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioId)

      if (error) throw error
      
      // Actualizar perfil en el store
      await authStore.fetchProfile()
    } catch (e) {
      console.error('Error updating profile:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (newPassword: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      // También actualizamos password_hash en la tabla usuarios para consistencia
      // Nota: En una app real usarías el hash de auth.users, pero tu tabla pide password_hash
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ password_hash: 'PROTECTED_BY_AUTH' })
        .eq('id', authStore.profile?.id)

      if (dbError) throw dbError

    } catch (e) {
      console.error('Error changing password:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    updateProfile,
    changePassword
  }
}
