import { supabase } from './supabase'

export const StudentModel = {
  // Obtener el ID de estudiante a partir del ID de usuario (Auth)
  async getStudentId(userId: string) {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('id')
      .eq('usuario_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data?.id
  },

  // Obtener materias disponibles para una carrera con sus paralelos
  async getAvailableMaterias(careerId: string) {
    const { data, error } = await supabase
      .from('pensum')
      .select(`
        materia_id,
        semestre,
        materias (
          id,
          nombre,
          codigo,
          creditos,
          paralelos (
            id,
            nombre,
            turno,
            horario_inicio,
            horario_fin,
            cupo_maximo,
            cupo_actual,
            docentes (
              usuarios (
                nombres,
                apellidos
              )
            )
          )
        )
      `)
      .eq('carrera_id', careerId)
      .eq('materias.activa', true)
    
    if (error) {
      console.error('Error fetching available materias:', error)
      throw error
    }

    // Aplanar la estructura para que sea más fácil de usar en el frontend
    return (data || [])
      .filter(item => item.materias !== null)
      .map(item => ({
        ...item.materias,
        semestre: item.semestre,
        paralelos: (item.materias as any).paralelos || []
      }))
  },

  // Obtener la carrera del estudiante
  async getStudentCareer(studentId: string) {
    const { data, error } = await supabase
      .from('estudiante_carreras')
      .select('carrera_id')
      .eq('estudiante_id', studentId)
      .eq('carrera_principal', true)
      .maybeSingle()
    
    if (error) throw error
    return data?.carrera_id
  },

  // Inscribir al estudiante en un paralelo
  async enroll(studentId: string, parallelId: string) {
    // 1. Obtener información del paralelo y la materia
    const { data: paraleloInfo } = await supabase
      .from('paralelos')
      .select('materia_id, cupo_actual, cupo_maximo, materias(nombre)')
      .eq('id', parallelId)
      .single()

    if (!paraleloInfo) throw new Error('El paralelo no existe')
    if (paraleloInfo.cupo_actual >= paraleloInfo.cupo_maximo) {
      throw new Error('No hay cupos disponibles en este paralelo')
    }

    // 2. VALIDACIÓN DE PRERREQUISITOS (Real)
    const { data: prereqs } = await supabase
      .from('materias_prerrequisitos')
      .select('materia_prerrequisito_id, materias:materia_prerrequisito_id(nombre)')
      .eq('materia_id', paraleloInfo.materia_id)

    if (prereqs && prereqs.length > 0) {
      const { data: historial } = await supabase
        .from('historial_academico')
        .select('materia_id')
        .eq('estudiante_id', studentId)
        .eq('aprobado', true)

      const materiasAprobadasIds = historial?.map(h => h.materia_id) || []
      
      for (const p of prereqs) {
        if (!materiasAprobadasIds.includes(p.materia_prerrequisito_id)) {
          throw new Error(`No cumples con el prerrequisito: ${(p.materias as any).nombre}`)
        }
      }
    }

    // 3. Verificar duplicidad (evitar inscribirse dos veces en la misma materia)
    const { data: existing } = await supabase
      .from('inscripciones')
      .select('id, paralelos(materia_id)')
      .eq('estudiante_id', studentId)
    
    const isAlreadyEnrolled = existing?.some((ins: any) => ins.paralelos.materia_id === paraleloInfo.materia_id)
    
    if (isAlreadyEnrolled) {
      throw new Error('Ya estás inscrito en esta materia')
    }

    // 3. Realizar la inscripción
    const { data, error } = await supabase
      .from('inscripciones')
      .insert({ 
        estudiante_id: studentId, 
        paralelo_id: parallelId,
        estado: 'INSCRITO'
      })
      .select('*, estudiantes(usuario_id), paralelos(materias(nombre))')
      .single()
    
    if (error) {
      console.error('Error enrolling student:', error)
      throw error
    }

    // 4. Actualizar el cupo actual del paralelo
    await supabase
      .from('paralelos')
      .update({ cupo_actual: (paraleloInfo.cupo_actual || 0) + 1 })
      .eq('id', parallelId)

    // 5. REGISTRO REAL (Auditoría, Logs y Notificación RF10)
    const usuarioId = (data as any).estudiantes.usuario_id
    const materiaNombre = (data as any).paralelos.materias.nombre

    // Auditoría
    await supabase.from('auditoria').insert({
      usuario_id: usuarioId,
      tabla: 'inscripciones',
      accion: 'CREATE_ENROLLMENT',
      descripcion: `Inscripción exitosa en la materia: ${materiaNombre}`
    })

    // Log de Sistema
    await supabase.from('logs_sistema').insert({
      usuario_id: usuarioId,
      accion: `El estudiante realizó una inscripción en ${materiaNombre}`,
      ip_address: '127.0.0.1'
    })

    // Notificación al Estudiante (RF10)
    await supabase.from('notificaciones').insert({
      usuario_id: usuarioId,
      tipo: 'INFO',
      titulo: 'Inscripción Confirmada',
      mensaje: `Te has inscrito correctamente en la materia ${materiaNombre}.`,
      leida: false
    })

    return data
  },

  // Obtener mis inscripciones actuales
  async getMyInscripciones(studentId: string) {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(`
        *,
        paralelos (
          nombre,
          turno,
          horario_inicio,
          horario_fin,
          materias (
            nombre,
            codigo
          ),
          docentes (
            usuarios (
              nombres,
              apellidos
            )
          )
        )
      `)
      .eq('estudiante_id', studentId)
    
    if (error) {
      console.error('Error fetching inscripciones:', error)
      throw error
    }
    return data || []
  }
}
