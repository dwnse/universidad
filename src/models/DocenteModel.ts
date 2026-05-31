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
  }, usuarioId: string) {
    // 1. Obtener datos actuales para auditoría y el ID del estudiante para notificar
    const { data: currentGrade } = await supabase
      .from('inscripciones')
      .select('*, estudiantes(usuario_id), paralelos(materias(nombre))')
      .eq('id', enrollmentId)
      .single()

    // 2. No calculamos el promedio aquí, dejamos que la DB lo haga mediante su DEFAULT/GENERATED
    // 3. Actualizar tabla inscripciones
    const { data, error } = await supabase
      .from('inscripciones')
      .update({
        nota_primer_parcial: grades.nota_primer_parcial,
        nota_segundo_parcial: grades.nota_segundo_parcial,
        nota_examen_final: grades.nota_examen_final
      })
      .eq('id', enrollmentId)
      .select()
      .single()
    
    if (error) throw error

    // 4. Registrar en tabla AUDITORIA
    await supabase.from('auditoria').insert({
      usuario_id: usuarioId,
      tabla: 'inscripciones',
      accion: 'UPDATE_GRADE',
      descripcion: `Cambio de notas - ID: ${enrollmentId}. P1: ${grades.nota_primer_parcial}, P2: ${grades.nota_segundo_parcial}, EF: ${grades.nota_examen_final}`
    })

    // 5. Registrar en tabla LOGS_SISTEMA
    await supabase.from('logs_sistema').insert({
      usuario_id: usuarioId,
      accion: `Docente actualizó notas del paralelo ${currentGrade?.paralelos?.materias?.nombre}`,
      ip_address: '127.0.0.1' 
    })

    // 6. Enviar NOTIFICACION al estudiante (RF10)
    if (currentGrade?.estudiantes?.usuario_id) {
      await supabase.from('notificaciones').insert({
        usuario_id: currentGrade.estudiantes.usuario_id,
        tipo: 'INFO', 
        titulo: 'Calificación Actualizada',
        mensaje: `Tu nota en la materia ${currentGrade.paralelos.nombre} ha sido actualizada. Revisa tu panel para ver el nuevo promedio.`,
        leida: false
      })
    }

    return data
  }
}
