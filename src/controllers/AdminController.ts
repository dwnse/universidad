import { AdminModel } from '@/models/AdminModel'
import { ref } from 'vue'
import type { Profile, Career } from '@/models/types'

export const useAdminController = () => {
  const users = ref<Profile[]>([])
  const careers = ref<Career[]>([])
  const careerSubjects = ref<any[]>([])
  const allSubjects = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async () => {
    loading.value = true
    try {
      users.value = await AdminModel.getUsers()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchCareers = async () => {
    loading.value = true
    try {
      careers.value = await AdminModel.getCareers()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (userId: string, role: string) => {
    try {
      await AdminModel.updateUserRole(userId, role)
      await fetchUsers()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const createCareer = async (careerData: any) => {
    try {
      await AdminModel.createCareer(careerData)
      await fetchCareers()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const updateCareer = async (careerId: string, careerData: any) => {
    try {
      await AdminModel.updateCareer(careerId, careerData)
      await fetchCareers()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const deleteCareer = async (careerId: string) => {
    try {
      await AdminModel.deleteCareer(careerId)
      await fetchCareers()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const fetchSubjectsByCareer = async (careerId: string) => {
    loading.value = true
    try {
      careerSubjects.value = await AdminModel.getSubjectsByCareer(careerId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchAllSubjects = async () => {
    try {
      allSubjects.value = await AdminModel.getAllSubjects()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const linkSubjectToCareer = async (careerId: string, materiaId: string, pensumData: any) => {
    try {
      await AdminModel.linkSubjectToCareer(careerId, materiaId, pensumData)
      await fetchSubjectsByCareer(careerId)
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const createSubject = async (careerId: string, subjectData: any, pensumData: any) => {
    try {
      await AdminModel.createSubject(careerId, subjectData, pensumData)
      await fetchSubjectsByCareer(careerId)
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const updateSubject = async (materiaId: string, subjectData: any, pensumId: string, pensumData: any, careerId: string) => {
    try {
      await AdminModel.updateSubject(materiaId, subjectData, pensumId, pensumData)
      await fetchSubjectsByCareer(careerId)
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deleteSubject = async (pensumId: string, materiaId: string, careerId: string) => {
    try {
      await AdminModel.deleteSubject(pensumId, materiaId)
      await fetchSubjectsByCareer(careerId)
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const createUser = async (userData: any) => {
    loading.value = true
    try {
      await AdminModel.createUser(userData)
      await fetchUsers()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    careers,
    careerSubjects,
    allSubjects,
    loading,
    error,
    fetchUsers,
    fetchCareers,
    fetchAllSubjects,
    fetchSubjectsByCareer,
    createSubject,
    linkSubjectToCareer,
    updateSubject,
    deleteSubject,
    updateRole,
    createCareer,
    updateCareer,
    deleteCareer,
    createUser
  }
}
