import { AdminModel } from '@/models/AdminModel'
import { ref } from 'vue'
import type { Profile, Career } from '@/models/types'

export const useAdminController = () => {
  const users = ref<Profile[]>([])
  const careers = ref<Career[]>([])
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

  const createCareer = async (careerData: Omit<Career, 'id' | 'created_at'>) => {
    try {
      await AdminModel.createCareer(careerData)
      await fetchCareers()
    } catch (e: any) {
      error.value = e.message
    }
  }

  return {
    users,
    careers,
    loading,
    error,
    fetchUsers,
    fetchCareers,
    updateRole,
    createCareer
  }
}
