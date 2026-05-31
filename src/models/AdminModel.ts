import { createClient } from '@supabase/supabase-js'
import { supabase, supabaseUrl, supabaseAnonKey } from './supabase'
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

    // Registrar en auditoría
    await supabase.from('auditoria').insert({
      tabla: 'carreras',
      accion: 'CREATE_CAREER',
      descripcion: `Se creó la carrera: ${career.nombre}`
    })

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
  },

  // Gestión de Prerrequisitos
  async getPrerequisites(materiaId: string) {
    const { data, error } = await supabase
      .from('materias_prerrequisitos')
      .select(`
        id,
        materia_prerrequisito_id,
        prerrequisito:materia_prerrequisito_id (nombre, codigo)
      `)
      .eq('materia_id', materiaId)
    
    if (error) throw error
    return data
  },

  async addPrerequisite(materiaId: string, prerequisiteId: string) {
    const { data, error } = await supabase
      .from('materias_prerrequisitos')
      .insert({
        materia_id: materiaId,
        materia_prerrequisito_id: prerequisiteId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async removePrerequisite(id: string) {
    const { error } = await supabase
      .from('materias_prerrequisitos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Paralelos (Cursos)
  async getParalelos() {
    const { data, error } = await supabase
      .from('paralelos')
      .select(`
        *,
        materias (nombre, codigo),
        periodos_academicos (nombre),
        docentes (
          usuarios (nombres, apellidos)
        ),
        aulas (nombre)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createParalelo(paralelo: any) {
    const { data, error } = await supabase
      .from('paralelos')
      .insert(paralelo)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateParalelo(id: string, paralelo: any) {
    const { data, error } = await supabase
      .from('paralelos')
      .update(paralelo)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteParalelo(id: string) {
    const { error } = await supabase
      .from('paralelos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Helpers para creación de paralelos
  async getAulas() {
    const { data, error } = await supabase.from('aulas').select('*').order('nombre')
    if (error) throw error
    return data
  },

  async createAula(aula: any) {
    const { data, error } = await supabase.from('aulas').insert(aula).select().single()
    if (error) throw error
    return data
  },

  async deleteAula(id: string) {
    const { error } = await supabase.from('aulas').delete().eq('id', id)
    if (error) throw error
  },

  async updateAula(id: string, aula: any) {
    const { data, error } = await supabase.from('aulas').update(aula).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async getDocentes() {
    const { data, error } = await supabase
      .from('docentes')
      .select(`
        id,
        usuarios (nombres, apellidos)
      `)
      .eq('activo', true)
    if (error) throw error
    return data
  },

  async getPeriodos() {
    const { data, error } = await supabase.from('periodos_academicos').select('*').order('fecha_inicio', { ascending: false })
    if (error) throw error
    return data
  },

  async createPeriodo(periodo: any) {
    const { data, error } = await supabase.from('periodos_academicos').insert(periodo).select().single()
    if (error) throw error
    return data
  },

  async deletePeriodo(id: string) {
    const { error } = await supabase.from('periodos_academicos').delete().eq('id', id)
    if (error) throw error
  },

  async closePeriod(periodoId: string) {
    // 1. Obtener todas las inscripciones del periodo a través de los paralelos
    const { data: inscripciones, error: iError } = await supabase
      .from('inscripciones')
      .select(`
        estudiante_id,
        promedio_final,
        paralelos!inner (
          materia_id,
          periodo_id
        )
      `)
      .eq('paralelos.periodo_id', periodoId)

    if (iError) throw iError
    if (!inscripciones || inscripciones.length === 0) {
      throw new Error('No hay inscripciones registradas en este periodo.')
    }

    // 2. Preparar los datos para el historial académico
    const historialData = inscripciones.map((ins: any) => ({
      estudiante_id: ins.estudiante_id,
      materia_id: ins.paralelos.materia_id,
      periodo_id: ins.paralelos.periodo_id,
      nota_final: ins.promedio_final,
      aprobado: ins.promedio_final >= 51,
      fecha_registro: new Date().toISOString()
    }))

    // 3. Insertar en historial_academico (Migración)
    const { error: hError } = await supabase
      .from('historial_academico')
      .insert(historialData)

    if (hError) {
      console.error('Error al insertar en historial:', hError)
      throw new Error('Error al migrar los datos al historial académico.')
    }

    // 4. Actualizar el estado del periodo a 'FINALIZADO' (asumiendo que existe el estado)
    // Usamos 'ACTIVO' false como alternativa si el enum es estricto
    const { error: pError } = await supabase
      .from('periodos_academicos')
      .update({ 
        estado: 'FINALIZADO',
        activo: false 
      })
      .eq('id', periodoId)

    if (pError) {
      // Si falla por el enum, intentamos solo desactivar
      await supabase
        .from('periodos_academicos')
        .update({ activo: false })
        .eq('id', periodoId)
    }

    // 5. Registrar en auditoría
    await supabase.from('auditoria').insert({
      tabla: 'periodos_academicos',
      accion: 'CLOSE_PERIOD',
      descripcion: `Se cerró formalmente el periodo ID: ${periodoId} y se migraron las notas al historial.`
    })

    return true
  },

  // Calendario Académico
  async getCalendarEvents() {
    const { data, error } = await supabase
      .from('calendario_academico')
      .select(`
        *,
        periodos_academicos (nombre)
      `)
      .order('fecha_inicio', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createCalendarEvent(event: any) {
    const { data, error } = await supabase
      .from('calendario_academico')
      .insert(event)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCalendarEvent(id: string) {
    const { error } = await supabase
      .from('calendario_academico')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async assignCareerToStudent(studentId: string, careerId: string) {
    const { data, error } = await supabase
      .from('estudiante_carreras')
      .upsert({
        estudiante_id: studentId,
        carrera_id: careerId,
        carrera_principal: true,
        fecha_asignacion: new Date().toISOString().split('T')[0]
      }, { onConflict: 'estudiante_id, carrera_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createUser(user: any) {
    // Usamos un cliente temporal para registrar al nuevo usuario en Supabase Auth
    // sin cerrar la sesión del administrador actual.
    const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email: user.email,
      password: user.password_hash, // Contraseña temporal enviada desde el modal
      options: {
        data: {
          nombres: user.nombres,
          apellidos: user.apellidos,
          rol: user.rol
        }
      }
    })

    if (authError) {
      console.error('Error en Supabase Auth signUp:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en Supabase Auth')
    }

    // Ahora insertamos en la tabla pública usuarios usando el ID de Auth
    const dbUser = {
      id: authData.user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      rol: user.rol,
      ci: user.ci,
      telefono: user.telefono,
      password_hash: 'managed_by_supabase_auth',
      estado: user.estado || 'ACTIVO'
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert(dbUser)
      .select()
      .single()
    
    if (error) {
      console.error('Error al crear perfil público:', error)
      throw error
    }

    if (data) {
      // Registrar creación en AUDITORIA y LOGS
      await supabase.from('auditoria').insert({
        usuario_id: data.id,
        tabla: 'usuarios',
        accion: 'CREATE_USER',
        descripcion: `Nuevo usuario registrado: ${data.email} con rol ${data.rol}`
      })

      await supabase.from('logs_sistema').insert({
        usuario_id: data.id,
        accion: `Registro inicial de perfil para ${data.email}`,
        ip_address: '127.0.0.1'
      })

      // Crear registros especializados según el rol
      if (data.rol === 'DOCENTE') {
        await supabase.from('docentes').insert({
          usuario_id: data.id,
          activo: true
        })
      } else if (data.rol === 'ESTUDIANTE') {
        const { data: studentData, error: studentError } = await supabase.from('estudiantes').insert({
          usuario_id: data.id, 
          registro_universitario: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          activo: true
        }).select().single()

        if (!studentError && studentData && user.carrera_id) {
          await supabase.from('estudiante_carreras').insert({
            estudiante_id: studentData.id,
            carrera_id: user.carrera_id,
            carrera_principal: true,
            fecha_asignacion: new Date().toISOString().split('T')[0]
          })
        }
      }
      
      (data as any).full_name = `${data.nombres} ${data.apellidos}`
    }

    return data
  },
}
