import { supabase } from './supabase'
import type { Profile } from './types'

export const AuthModel = {
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as Profile
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
