import { StudentModel } from '@/models/StudentModel'
import { ref } from 'vue'

export const useStudentController = () => {
  const subjects = ref<any[]>([])
  const enrollments = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAvailableSubjects = async (careerId: string) => {
    loading.value = true
    try {
      subjects.value = await StudentModel.getAvailableSubjects(careerId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchMyEnrollments = async (studentId: string) => {
    loading.value = true
    try {
      enrollments.value = await StudentModel.getMyEnrollments(studentId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const enroll = async (studentId: string, parallelId: string) => {
    try {
      await StudentModel.enroll(studentId, parallelId)
      await fetchMyEnrollments(studentId)
    } catch (e: any) {
      error.value = e.message
    }
  }

  return {
    subjects,
    enrollments,
    loading,
    error,
    fetchAvailableSubjects,
    fetchMyEnrollments,
    enroll
  }
}
