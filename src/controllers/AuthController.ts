import { useAuthStore } from '@/stores/auth'
import { AuthModel } from '@/models/AuthModel'
import { supabase } from '@/models/supabase'

export const AuthController = {
  async init() {
    const store = useAuthStore()
    await store.fetchProfile()
  },

  async handleLogin(email: string, password: string) {
    const store = useAuthStore()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    await store.fetchProfile()
  },

  async handleLogout() {
    const store = useAuthStore()
    await store.signOut()
  },

  isAuthenticated() {
    const store = useAuthStore()
    return store.isAuthenticated
  },

  getUserRole() {
    const store = useAuthStore()
    return store.userRole
  }
}
