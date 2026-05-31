import { AdminModel } from '@/models/AdminModel'
import { ref } from 'vue'
import type { Profile, Career } from '@/models/types'

export const useAdminController = () => {
  const users = ref<Profile[]>([])
  const careers = ref<Career[]>([])
  const careerSubjects = ref<any[]>([])
  const allSubjects = ref<any[]>([])
  const paralelos = ref<any[]>([])
  const aulas = ref<any[]>([])
  const docentes = ref<any[]>([])
  const periodos = ref<any[]>([])
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

  // Prerrequisitos
  const fetchPrerequisites = async (materiaId: string) => {
    try {
      return await AdminModel.getPrerequisites(materiaId)
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const addPrerequisite = async (materiaId: string, prerequisiteId: string) => {
    try {
      await AdminModel.addPrerequisite(materiaId, prerequisiteId)
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    }
  }

  const removePrerequisite = async (id: string) => {
    try {
      await AdminModel.removePrerequisite(id)
      return true
    } catch (e: any) {
      error.value = e.message
      return false
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

  const fetchParalelos = async () => {
    loading.value = true
    try {
      paralelos.value = await AdminModel.getParalelos()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchAuxiliarData = async () => {
    try {
      const [a, d, p] = await Promise.all([
        AdminModel.getAulas(),
        AdminModel.getDocentes(),
        AdminModel.getPeriodos()
      ])
      aulas.value = a
      docentes.value = d
      periodos.value = p
    } catch (e: any) {
      error.value = e.message
    }
  }

  const createAula = async (data: any) => {
    try {
      await AdminModel.createAula(data)
      await fetchAuxiliarData()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deleteAula = async (id: string) => {
    try {
      await AdminModel.deleteAula(id)
      await fetchAuxiliarData()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const updateAula = async (id: string, data: any) => {
    try {
      await AdminModel.updateAula(id, data)
      await fetchAuxiliarData()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const createPeriodo = async (data: any) => {
    try {
      await AdminModel.createPeriodo(data)
      await fetchAuxiliarData()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deletePeriodo = async (id: string) => {
    try {
      await AdminModel.deletePeriodo(id)
      await fetchAuxiliarData()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const closePeriod = async (id: string) => {
    loading.value = true
    try {
      await AdminModel.closePeriod(id)
      await fetchAuxiliarData()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Calendario
  const calendarEvents = ref<any[]>([])
  const fetchCalendarEvents = async () => {
    loading.value = true
    try {
      calendarEvents.value = await AdminModel.getCalendarEvents()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createCalendarEvent = async (data: any) => {
    try {
      await AdminModel.createCalendarEvent(data)
      await fetchCalendarEvents()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deleteCalendarEvent = async (id: string) => {
    try {
      await AdminModel.deleteCalendarEvent(id)
      await fetchCalendarEvents()
    } catch (e: any) {
      error.value = e.message
    }
  }

  const createParalelo = async (data: any) => {
    try {
      await AdminModel.createParalelo(data)
      await fetchParalelos()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const updateParalelo = async (id: string, data: any) => {
    try {
      await AdminModel.updateParalelo(id, data)
      await fetchParalelos()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deleteParalelo = async (id: string) => {
    try {
      await AdminModel.deleteParalelo(id)
      await fetchParalelos()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  return {
    users,
    careers,
    careerSubjects,
    allSubjects,
    paralelos,
    aulas,
    docentes,
    periodos,
    loading,
    error,
    fetchUsers,
    fetchCareers,
    fetchAllSubjects,
    fetchSubjectsByCareer,
    fetchParalelos,
    fetchAuxiliarData,
    createSubject,
    linkSubjectToCareer,
    updateSubject,
    deleteSubject,
    updateRole,
    createCareer,
    updateCareer,
    deleteCareer,
    createUser,
    createParalelo,
    updateParalelo,
    deleteParalelo,
    createAula,
    updateAula,
    deleteAula,
    createPeriodo,
    deletePeriodo,
    closePeriod,
    fetchPrerequisites,
    addPrerequisite,
    removePrerequisite,
    calendarEvents,
    fetchCalendarEvents,
    createCalendarEvent,
    deleteCalendarEvent
  }
}
