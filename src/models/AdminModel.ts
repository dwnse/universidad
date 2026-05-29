import { supabase } from './supabase'
import type { Profile, Career } from './types'

export const AdminModel = {
  async getUsers() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    const users = (data || []).map(user => ({
      ...user,
      full_name: `${user.nombres} ${user.apellidos}`
    }))

    return users as Profile[]
  },

  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ role })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating user role:', error)
      throw error
    }
    return data
  },

  async getCareers() {
    const { data, error } = await supabase
      .from('carreras')
      .select('*')
      .order('nombre')
    
    if (error) throw error
    return data as Career[]
  },

  async createCareer(career: any) {
    const { data, error } = await supabase
      .from('carreras')
      .insert(career)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCareer(careerId: string, career: any) {
    const { data, error } = await supabase
      .from('carreras')
      .update(career)
      .eq('id', careerId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCareer(careerId: string) {
    const { error } = await supabase
      .from('carreras')
      .delete()
      .eq('id', careerId)
    
    if (error) throw error
  },

  // Subjects (Materias) & Pensum
  async getSubjectsByCareer(careerId: string) {
    const { data, error } = await supabase
      .from('pensum')
      .select(`
        id,
        semestre,
        nivel,
        obligatoria,
        materias (*)
      `)
      .eq('carrera_id', careerId)
      .order('semestre')
    
    if (error) throw error
    return data || []
  },

  async getAllSubjects() {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .order('nombre')
    
    if (error) throw error
    return data || []
  },

  async linkSubjectToCareer(careerId: string, materiaId: string, pensumData: any) {
    const { data, error } = await supabase
      .from('pensum')
      .insert({
        carrera_id: careerId,
        materia_id: materiaId,
        ...pensumData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createSubject(careerId: string, subjectData: any, pensumData: any) {
    // 1. Create Materia
    const { data: materia, error: mError } = await supabase
      .from('materias')
      .insert(subjectData)
      .select()
      .single()
    
    if (mError) throw mError

    // 2. Link to Career via Pensum
    const { data: pensum, error: pError } = await supabase
      .from('pensum')
      .insert({
        carrera_id: careerId,
        materia_id: materia.id,
        ...pensumData
      })
      .select()
      .single()
    
    if (pError) throw pError
    return { ...materia, pensum_id: pensum.id }
  },

  async updateSubject(materiaId: string, subjectData: any, pensumId: string, pensumData: any) {
    const { error: mError } = await supabase
      .from('materias')
      .update(subjectData)
      .eq('id', materiaId)
    
    if (mError) throw mError

    const { error: pError } = await supabase
      .from('pensum')
      .update(pensumData)
      .eq('id', pensumId)
    
    if (pError) throw pError
  },

  async deleteSubject(pensumId: string, materiaId: string) {
    // Delete from pensum first
    await supabase.from('pensum').delete().eq('id', pensumId)
    // Optional: Delete global materia if no other career uses it
    // For now just delete from current pensum
  },

  async createUser(user: any) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(user)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    if (data) {
      // Create specialized record based on role
      if (data.rol === 'DOCENTE') {
        await supabase.from('docentes').insert({
          usuario_id: data.id,
          activo: true
        })
      } else if (data.rol === 'ESTUDIANTE') {
        await supabase.from('estudiantes').insert({
          usuario_id: data.id,
          registro_universitario: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          activo: true
        })
      }
      
      (data as any).full_name = `${data.nombres} ${data.apellidos}`
    }

    return data
  },
}
