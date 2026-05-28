import { supabase } from './supabase'
import type { Profile, Career } from './types'

export const AdminModel = {
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Profile[]
  },

  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    
    if (error) throw error
    return data
  },

  async getCareers() {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Career[]
  },

  async createCareer(career: Omit<Career, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('careers')
      .insert(career)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
