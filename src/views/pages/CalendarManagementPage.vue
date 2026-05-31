<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminController } from '@/controllers/AdminController'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const adminController = useAdminController()
const showAddModal = ref(false)
const targetAudience = ref('TODOS')
const newEvent = ref({
  periodo_id: '',
  evento: '',
  fecha_inicio: '',
  fecha_fin: '',
  descripcion: ''
})

onMounted(async () => {
  await adminController.fetchAuxiliarData()
  await adminController.fetchCalendarEvents()
})

const handleCreateEvent = async () => {
  try {
    // Agregamos el tag de audiencia a la descripción
    const eventToCreate = {
      ...newEvent.value,
      descripcion: `[${targetAudience.value}] ${newEvent.value.descripcion}`
    }
    await adminController.createCalendarEvent(eventToCreate)
    showAddModal.value = false
    newEvent.value = {
      periodo_id: '',
      evento: '',
      fecha_inicio: '',
      fecha_fin: '',
      descripcion: ''
    }
    targetAudience.value = 'TODOS'
  } catch (error) {
    console.error('Error al crear evento:', error)
  }
}

const parseDescription = (desc: string) => {
  if (!desc) return { text: '', tag: 'TODOS' }
  const match = desc.match(/^\[(.*?)\] (.*)/)
  if (match) {
    return { tag: match[1], text: match[2] }
  }
  return { tag: 'TODOS', text: desc }
}

const getTagColor = (tag: string) => {
  switch (tag) {
    case 'ESTUDIANTE': return 'bg-blue-100 text-blue-700'
    case 'DOCENTE': return 'bg-purple-100 text-purple-700'
    default: return 'bg-indigo-100 text-indigo-700'
  }
}

const handleDeleteEvent = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este evento?')) {
    await adminController.deleteCalendarEvent(id)
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon class="w-8 h-8 text-indigo-600" />
          Calendario Académico
        </h1>
        <p class="text-gray-600">Gestión de eventos y fechas importantes del sistema</p>
      </div>
      <button 
        @click="showAddModal = true"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
      >
        <Plus class="w-5 h-5" />
        Nuevo Evento
      </button>
    </div>

    <!-- Timeline of Events -->
    <div class="space-y-6">
      <div v-if="adminController.loading.value" class="flex justify-center p-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else-if="adminController.calendarEvents.value.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <CalendarIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900">No hay eventos programados</h3>
        <p class="text-gray-500">Comienza agregando un nuevo evento al calendario académico.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="event in adminController.calendarEvents.value" 
          :key="event.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                  {{ event.periodos_academicos?.nombre || 'General' }}
                </span>
                <span :class="['px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider', getTagColor(parseDescription(event.descripcion).tag)]">
                  {{ parseDescription(event.descripcion).tag }}
                </span>
              </div>
              <button 
                @click="handleDeleteEvent(event.id)"
                class="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
            
            <h3 class="text-lg font-bold text-gray-800 mb-2">{{ event.evento }}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ parseDescription(event.descripcion).text || 'Sin descripción' }}</p>
            
            <div class="space-y-2 pt-4 border-t border-gray-50">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <Clock class="w-4 h-4 text-indigo-400" />
                <span>Inicio: {{ formatDate(event.fecha_inicio) }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <Clock class="w-4 h-4 text-rose-400" />
                <span>Fin: {{ formatDate(event.fecha_fin) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-xl font-bold text-gray-800">Agregar Nuevo Evento</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
            <Plus class="w-6 h-6 transform rotate-45" />
          </button>
        </div>
        
        <form @submit.prevent="handleCreateEvent" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Periodo Académico</label>
              <select 
                v-model="newEvent.periodo_id"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Seleccione un periodo</option>
                <option v-for="p in adminController.periodos.value" :key="p.id" :value="p.id">
                  {{ p.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Público Objetivo</label>
              <select 
                v-model="targetAudience"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="TODOS">Todos</option>
                <option value="ESTUDIANTE">Estudiantes</option>
                <option value="DOCENTE">Docentes</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Evento</label>
            <input 
              v-model="newEvent.evento"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Exámenes Finales"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input 
                v-model="newEvent.fecha_inicio"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input 
                v-model="newEvent.fecha_fin"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              v-model="newEvent.descripcion"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              placeholder="Detalles adicionales del evento..."
            ></textarea>
          </div>

          <div class="pt-4 flex gap-3">
            <button 
              type="button"
              @click="showAddModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Guardar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
