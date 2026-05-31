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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    await store.fetchProfile()
    
    // Registrar log de inicio de sesión
    if (data.user) {
      await AuthModel.logSystemAction(data.user.id, 'LOGIN')
    }
  },

  async handleLogout() {
    const store = useAuthStore()
    const userId = store.profile?.id
    if (userId) {
      await AuthModel.logSystemAction(userId, 'LOGOUT')
    }
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
