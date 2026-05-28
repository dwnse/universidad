import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthModel } from '@/models/AuthModel'
import type { Profile } from '@/models/types'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => profile.value?.role)

  async function fetchProfile() {
    try {
      loading.value = true
      const currentUser = await AuthModel.getUser()
      user.value = currentUser

      if (!currentUser) {
        profile.value = null
        return
      }

      const data = await AuthModel.getProfile(currentUser.id)
      profile.value = data
    } catch (error) {
      console.error('Error fetching profile:', error)
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      await AuthModel.signOut()
      profile.value = null
      user.value = null
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    profile,
    user,
    loading,
    isAuthenticated,
    userRole,
    fetchProfile,
    signOut
  }
})
