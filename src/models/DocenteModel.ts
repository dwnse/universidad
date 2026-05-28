import { supabase } from './supabase'

export const DocenteModel = {
  async getAssignedParallels(docenteId: string) {
    const { data, error } = await supabase
      .from('parallels')
      .select(`
        *,
        subjects (name, code, career_id)
      `)
      .eq('docente_id', docenteId)
    
    if (error) throw error
    return data
  },

  async getParallelStudents(parallelId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_id,
        profiles:student_id (full_name, email),
        grades:enrollment_id (
          id,
          partial_1,
          partial_2,
          final_exam,
          average
        )
      `)
      .eq('parallel_id', parallelId)
    
    if (error) throw error
    return data
  },

  async saveGrade(enrollmentId: string, grades: { partial_1: number, partial_2: number, final_exam: number }) {
    const average = (grades.partial_1 + grades.partial_2 + grades.final_exam) / 3
    
    const { data, error } = await supabase
      .from('grades')
      .upsert({
        enrollment_id: enrollmentId,
        ...grades,
        average
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
