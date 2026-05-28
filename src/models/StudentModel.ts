import { supabase } from './supabase'

export const StudentModel = {
  async getAvailableSubjects(careerId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        parallels (
          *,
          profiles (full_name)
        )
      `)
      .eq('career_id', careerId)
    
    if (error) throw error
    return data
  },

  async enroll(studentId: string, parallelId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ student_id: studentId, parallel_id: parallelId })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getMyEnrollments(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        parallels (
          *,
          subjects (name, code)
        )
      `)
      .eq('student_id', studentId)
    
    if (error) throw error
    return data
  }
}
