import { ref } from 'vue'
import { supabase } from '@/models/supabase'

export const useNotificationController = () => {
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const fetchNotifications = async (usuarioId: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('fecha_envio', { ascending: false })
        .limit(10)

      if (error) throw error
      notifications.value = data || []
      unreadCount.value = notifications.value.filter(n => !n.leida).length
    } catch (e) {
      console.error('Error fetching notifications:', e)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId)

      if (error) throw error
      
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.leida) {
        notification.leida = true
        unreadCount.value--
      }
    } catch (e) {
      console.error('Error marking notification as read:', e)
    }
  }

  const markAllAsRead = async (usuarioId: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('usuario_id', usuarioId)
        .eq('leida', false)

      if (error) throw error
      
      notifications.value.forEach(n => n.leida = true)
      unreadCount.value = 0
    } catch (e) {
      console.error('Error marking all as read:', e)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
