import { supabase } from './supabase'

export const DocenteModel = {
  async getDocenteId(usuarioId: string) {
    const { data, error } = await supabase
      .from('docentes')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle()
    
    if (error) throw error
    return data?.id
  },

  async getAssignedParallels(docenteId: string) {
    const { data, error } = await supabase
      .from('paralelos')
      .select(`
        *,
        materias (nombre, codigo),
        periodos_academicos (nombre)
      `)
      .eq('docente_id', docenteId)
      .eq('activo', true)
    
    if (error) {
      console.error('Error fetching assigned parallels:', error)
      throw error
    }
    return data || []
  },

  async getParallelStudents(parallelId: string) {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(`
        *,
        estudiantes:estudiante_id (
          id,
          registro_universitario,
          usuarios:usuario_id (nombres, apellidos, email)
        )
      `)
      .eq('paralelo_id', parallelId)
    
    if (error) {
      console.error('Error fetching parallel students:', error)
      throw error
    }

    // Synthesize full_name and other fields for the UI
    return (data || []).map((insc: any) => ({
      ...insc,
      student_name: `${insc.estudiantes.usuarios.nombres} ${insc.estudiantes.usuarios.apellidos}`,
      student_email: insc.estudiantes.usuarios.email,
      registro: insc.estudiantes.registro_universitario
    }))
  },

  async saveGrade(enrollmentId: string, grades: { 
    nota_primer_parcial: number, 
    nota_segundo_parcial: number, 
    nota_examen_final: number 
  }) {
    const promedio_final = (grades.nota_primer_parcial + grades.nota_segundo_parcial + grades.nota_examen_final) / 3
    
    const { data, error } = await supabase
      .from('inscripciones')
      .update({
        ...grades,
        promedio_final
      })
      .eq('id', enrollmentId)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving grade:', error)
      throw error
    }
    return data
  }
}
