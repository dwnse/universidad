import { supabase } from './supabase'

export const StudentModel = {
  async getAvailableSubjects(careerId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        parallels (
          *,
          usuarios (full_name)
        )
      `)
      .eq('career_id', careerId)
    
    if (error) {
      console.error('Error fetching subjects:', error)
      throw error
    }
    return data || []
  },

  async enroll(studentId: string, parallelId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ student_id: studentId, parallel_id: parallelId })
      .select()
      .maybeSingle()
    
    if (error) {
      console.error('Error enrolling student:', error)
      throw error
    }
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
    
    if (error) {
      console.error('Error fetching enrollments:', error)
      throw error
    }
    return data || []
  }
}
