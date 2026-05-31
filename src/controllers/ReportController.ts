import { supabase } from '@/models/supabase'
import { ReportService } from '@/utils/ReportService'

export const ReportController = {
  // RF12.1 - Listado de materias por carrera (Administrador)
  async materiasPorCarrera(carreraId: string, carreraNombre: string) {
    const { data, error } = await supabase
      .from('pensum')
      .select(`
        semestre,
        nivel,
        materias (codigo, nombre, creditos, tipo)
      `)
      .eq('carrera_id', carreraId)
      .order('semestre', { ascending: true })

    if (error) throw error

    const columns = ['Semestre', 'Código', 'Materia', 'Créditos', 'Tipo']
    const tableData = data.map((item: any) => [
      item.semestre,
      item.materias.codigo,
      item.materias.nombre,
      item.materias.creditos,
      item.materias.tipo
    ])

    ReportService.generatePDF(`Materias de la Carrera: ${carreraNombre}`, columns, tableData, `Materias_${carreraNombre.replace(/\s/g, '_')}`)
  },

  // RF12.3 - Notas por curso de todos los alumnos (Docente)
  async notasPorCurso(paraleloId: string, materiaNombre: string, paraleloNombre: string) {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(`
        nota_primer_parcial,
        nota_segundo_parcial,
        nota_examen_final,
        promedio_final,
        estudiantes (
          registro_universitario,
          usuarios (nombres, apellidos)
        )
      `)
      .eq('paralelo_id', paraleloId)

    if (error) throw error

    const columns = ['Registro', 'Estudiante', 'P1', 'P2', 'EF', 'Final']
    const tableData = data.map((item: any) => [
      item.estudiantes.registro_universitario,
      `${item.estudiantes.usuarios.nombres} ${item.estudiantes.usuarios.apellidos}`,
      item.nota_primer_parcial,
      item.nota_segundo_parcial,
      item.nota_examen_final,
      item.promedio_final
    ])

    ReportService.generatePDF(`Notas Curso: ${materiaNombre} - Paralelo ${paraleloNombre}`, columns, tableData, `Notas_${materiaNombre}_${paraleloNombre}`)
  },

  // RF12.4 - Historial académico del alumno (Alumno)
  async historialAcademico(estudianteId: string, estudianteNombre: string) {
    const { data, error } = await supabase
      .from('historial_academico')
      .select(`
        nota_final,
        aprobado,
        fecha_registro,
        materias (nombre, codigo),
        periodos_academicos (nombre)
      `)
      .eq('estudiante_id', estudianteId)
      .order('fecha_registro', { ascending: false })

    if (error) throw error

    const columns = ['Periodo', 'Código', 'Materia', 'Nota', 'Estado']
    const tableData = data.map((item: any) => [
      item.periodos_academicos.nombre,
      item.materias.codigo,
      item.materias.nombre,
      item.nota_final,
      item.aprobado ? 'APROBADO' : 'REPROBADO'
    ])

    ReportService.generatePDF(`Historial Académico: ${estudianteNombre}`, columns, tableData, `Historial_${estudianteNombre.replace(/\s/g, '_')}`)
  },

  // RF12.5 - Notas del periodo actual (Alumno)
  async boletaNotasPeriodo(estudianteId: string, estudianteNombre: string) {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(`
        nota_primer_parcial,
        nota_segundo_parcial,
        nota_examen_final,
        promedio_final,
        paralelos (
          nombre,
          materias (nombre, codigo),
          periodos_academicos (nombre)
        )
      `)
      .eq('estudiante_id', estudianteId)

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('No tienes materias inscritas en el periodo actual')
    }

    const periodoNombre = data[0].paralelos.periodos_academicos.nombre
    const columns = ['Materia', 'P1', 'P2', 'EF', 'Final', 'Estado']
    const tableData = data.map((item: any) => [
      item.paralelos.materias.nombre,
      item.nota_primer_parcial || 0,
      item.nota_segundo_parcial || 0,
      item.nota_examen_final || 0,
      Math.round(item.promedio_final) || 0,
      (item.promedio_final >= 51) ? 'APROBADO' : (item.promedio_final > 0 ? 'REPROBADO' : 'EN CURSO')
    ])

    ReportService.generatePDF(
      `Boleta de Calificaciones: ${estudianteNombre}\nPeriodo: ${periodoNombre}`, 
      columns, 
      tableData, 
      `Boleta_${estudianteNombre.replace(/\s/g, '_')}`
    )
  },

  // RF12.6 - Listado de alumnos inscritos a un curso (Docente)
  async listaInscritos(paraleloId: string, materiaNombre: string, paraleloNombre: string) {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(`
        estudiantes (
          registro_universitario,
          usuarios (nombres, apellidos, email, telefono)
        )
      `)
      .eq('paralelo_id', paraleloId)

    if (error) throw error

    const columns = ['Registro', 'Nombre Completo', 'Email', 'Teléfono']
    const tableData = data.map((item: any) => [
      item.estudiantes.registro_universitario,
      `${item.estudiantes.usuarios.nombres} ${item.estudiantes.usuarios.apellidos}`,
      item.estudiantes.usuarios.email,
      item.estudiantes.usuarios.telefono || 'N/A'
    ])

    ReportService.generatePDF(`Alumnos Inscritos: ${materiaNombre} - Paralelo ${paraleloNombre}`, columns, tableData, `Inscritos_${materiaNombre}_${paraleloNombre}`)
  },

  // RF12.6 (Excel) - Listado de alumnos en Excel
  async listaInscritosExcel(paraleloId: string, materiaNombre: string, paraleloNombre: string) {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(`
        estudiantes (
          registro_universitario,
          usuarios (nombres, apellidos, email, telefono)
        )
      `)
      .eq('paralelo_id', paraleloId)

    if (error) throw error

    const excelData = data.map((item: any) => ({
      'Registro': item.estudiantes.registro_universitario,
      'Nombres': item.estudiantes.usuarios.nombres,
      'Apellidos': item.estudiantes.usuarios.apellidos,
      'Email': item.estudiantes.usuarios.email,
      'Teléfono': item.estudiantes.usuarios.telefono || 'N/A'
    }))

    ReportService.generateExcel(excelData, `Lista_${materiaNombre}_${paraleloNombre}`)
  },

  // RF12.1+ - Reporte de Usuarios por Rol (Administrador)
  async usuariosPorRol(rol: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombres, apellidos, email, ci, rol, estado')
      .eq('rol', rol)

    if (error) throw error

    const columns = ['Nombre Completo', 'Email', 'CI', 'Estado']
    const tableData = data.map((u: any) => [
      `${u.nombres} ${u.apellidos}`,
      u.email,
      u.ci || 'N/A',
      u.estado
    ])

    ReportService.generatePDF(`Reporte de Usuarios: ${rol}`, columns, tableData, `Usuarios_${rol}`)
  },

  // Reporte de Auditoría de Sistema (Administrador)
  async auditoriaSistema() {
    const { data, error } = await supabase
      .from('auditoria')
      .select('fecha, tabla, accion, descripcion, usuarios(email)')
      .order('fecha', { ascending: false })
      .limit(100)

    if (error) throw error

    const columns = ['Fecha', 'Usuario', 'Tabla', 'Acción', 'Descripción']
    const tableData = data.map((a: any) => [
      new Date(a.fecha).toLocaleString(),
      a.usuarios?.email || 'Sistema',
      a.tabla,
      a.accion,
      a.descripcion
    ])

    ReportService.generatePDF('Auditoría de Movimientos del Sistema', columns, tableData, 'Reporte_Auditoria')
  },

  // Reporte de Alumnos por Carrera (Administrador) - Corregido para evitar errores de relación
  async alumnosPorCarrera(carreraId: string, carreraNombre: string) {
    // 1. Obtenemos los IDs de los estudiantes vinculados a la carrera
    const { data: vinculos, error: vError } = await supabase
      .from('estudiante_carreras')
      .select('estudiante_id')
      .eq('carrera_id', carreraId)

    if (vError) throw vError
    if (!vinculos || vinculos.length === 0) {
      throw new Error('No hay estudiantes inscritos en esta carrera')
    }

    const estudianteIds = vinculos.map(v => v.estudiante_id)

    // 2. Obtenemos los datos de esos estudiantes y sus usuarios
    const { data, error } = await supabase
      .from('estudiantes')
      .select(`
        registro_universitario,
        usuarios:usuario_id (nombres, apellidos, email)
      `)
      .in('id', estudianteIds)

    if (error) throw error

    const columns = ['Registro', 'Nombre Completo', 'Email']
    const tableData = data.map((item: any) => [
      item.registro_universitario,
      `${item.usuarios.nombres} ${item.usuarios.apellidos}`,
      item.usuarios.email
    ])

    ReportService.generatePDF(`Estudiantes de la Carrera: ${carreraNombre}`, columns, tableData, `Estudiantes_${carreraNombre.replace(/\s/g, '_')}`)
  }
}
