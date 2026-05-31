import { StudentModel } from '@/models/StudentModel'
import { ref } from 'vue'

export const useStudentController = () => {
  const subjects = ref<any[]>([])
  const enrollments = ref<any[]>([])
  const studentId = ref<string | null>(null)
  const careerId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const init = async (userId: string) => {
    loading.value = true
    try {
      const id = await StudentModel.getStudentId(userId)
      if (id) {
        studentId.value = id
        // En una implementación real, aquí buscaríamos la carrera del estudiante
        // Por ahora lo dejaremos para que se pase por parámetro o se busque luego
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableSubjects = async (cId: string) => {
    loading.value = true
    try {
      subjects.value = await StudentModel.getAvailableMaterias(cId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchMyEnrollments = async (sId: string) => {
    loading.value = true
    try {
      enrollments.value = await StudentModel.getMyInscripciones(sId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const enroll = async (sId: string, parallelId: string) => {
    loading.value = true
    error.value = null
    try {
      await StudentModel.enroll(sId, parallelId)
      await fetchMyEnrollments(sId)
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    subjects,
    enrollments,
    studentId,
    loading,
    error,
    init,
    fetchAvailableSubjects,
    fetchMyEnrollments,
    enroll
  }
}
