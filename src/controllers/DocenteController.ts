import { DocenteModel } from '@/models/DocenteModel'
import { ref } from 'vue'

export const useDocenteController = () => {
  const parallels = ref<any[]>([])
  const currentStudents = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAssignedParallels = async (docenteId: string) => {
    loading.value = true
    try {
      parallels.value = await DocenteModel.getAssignedParallels(docenteId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchParallelStudents = async (parallelId: string) => {
    loading.value = true
    try {
      currentStudents.value = await DocenteModel.getParallelStudents(parallelId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const saveGrade = async (enrollmentId: string, grades: any) => {
    try {
      await DocenteModel.saveGrade(enrollmentId, grades)
    } catch (e: any) {
      error.value = e.message
    }
  }

  return {
    parallels,
    currentStudents,
    loading,
    error,
    fetchAssignedParallels,
    fetchParallelStudents,
    saveGrade
  }
}
