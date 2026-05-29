import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthModel } from '@/models/AuthModel'
import type { Profile } from '@/models/types'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(true)
  const authReady = ref(false)
  const profileError = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && authReady.value)
  const userRole = computed(() => profile.value?.rol)

  async function fetchProfile() {
    try {
      loading.value = true
      profileError.value = null
      
      console.log('Fetching user session...')
      const currentUser = await AuthModel.getUser()
      user.value = currentUser

      if (!currentUser) {
        console.log('No user session found')
        profile.value = null
        authReady.value = true
        return
      }

      console.log('User found:', currentUser.id, 'Fetching profile...')
      let data = await AuthModel.getProfile(currentUser.id)
      
      // Intentar obtener el rol de los metadatos de Auth si existen
      const authMetadataRole = currentUser.app_metadata?.role || currentUser.user_metadata?.role
      
      if (!data) {
        console.log('Profile missing. Attempting auto-sync with metadata...')
        // Only use a default role if we absolutely have no other info
        const fallbackRole = (authMetadataRole === 'ADMIN' || authMetadataRole === 'ADMINISTRADOR') ? 'ADMINISTRADOR' : (authMetadataRole || 'ESTUDIANTE')
        
        try {
          const nameParts = (currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Nuevo Usuario').split(' ')
          data = await AuthModel.createProfile({
            id: currentUser.id,
            email: currentUser.email || '',
            nombres: nameParts[0],
            apellidos: nameParts.slice(1).join(' ') || ' ',
            rol: fallbackRole // The model will overwrite this if it finds an existing email with a different role
          })
          console.log('Profile created successfully')
        } catch (syncError) {
          console.error('Failed to sync profile:', syncError)
          profileError.value = "Error al crear perfil automático."
          profile.value = null
          return
        }
      } else if (authMetadataRole) {
        // Solo actualizar si el rol de Auth es EXPLICITAMENTE diferente y existe
        const correctAuthRole = (authMetadataRole === 'ADMIN' || authMetadataRole === 'ADMINISTRADOR') ? 'ADMINISTRADOR' : authMetadataRole
        if (data.rol !== correctAuthRole) {
          console.log(`Updating role to match Auth metadata: ${correctAuthRole}`)
          try {
            data = await AuthModel.createProfile({ ...data, rol: correctAuthRole })
          } catch (e) {
            console.error('Error updating role:', e)
          }
        }
      }

      if (data) {
        console.log('Profile loaded successfully:', data.rol)
        profile.value = data
      } else {
        console.error('Data is still null after fetching/creating profile. Likely RLS policy issue.')
        profileError.value = "Usuario autenticado pero sin perfil registrado en la tabla 'usuarios'. Verifica las políticas RLS."
        profile.value = null
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error)
      profileError.value = error.message || 'Error al obtener el perfil'
      profile.value = null
    } finally {
      loading.value = false
      authReady.value = true
      console.log('Auth initialization complete. Ready:', authReady.value)
    }
  }

  async function signOut() {
    try {
      await AuthModel.signOut()
      profile.value = null
      user.value = null
      authReady.value = false
      profileError.value = null
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    profile,
    user,
    loading,
    authReady,
    profileError,
    isAuthenticated,
    userRole,
    fetchProfile,
    signOut
  }
})
