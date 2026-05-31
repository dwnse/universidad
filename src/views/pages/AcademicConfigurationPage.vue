<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminController } from '@/controllers/AdminController'
import { Plus, MapPin, Calendar, Trash2, Layers, CheckCircle, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const adminController = useAdminController()
const toast = useToast()
const activeTab = ref('aulas')
const isClosing = ref<string | null>(null)
const editingAulaId = ref<string | null>(null)

const aulaForm = ref({ nombre: '', capacidad: 40, ubicacion: '', activa: true })
const periodoForm = ref({ 
  nombre: '', 
  modalidad: 'SEMESTRAL', 
  fecha_inicio: '', 
  fecha_fin: '',
  estado: 'INSCRIPCION'
})

onMounted(async () => {
  await adminController.fetchAuxiliarData()
})

const handleCreateAula = async () => {
  try {
    if (editingAulaId.value) {
      await adminController.updateAula(editingAulaId.value, aulaForm.value)
      toast.success('Aula actualizada')
    } else {
      await adminController.createAula(aulaForm.value)
      toast.success('Aula creada')
    }
    resetAulaForm()
  } catch (e: any) {
    toast.error('Error: ' + e.message)
  }
}

const resetAulaForm = () => {
  aulaForm.value = { nombre: '', capacidad: 40, ubicacion: '', activa: true }
  editingAulaId.value = null
}

const startEditAula = (aula: any) => {
  editingAulaId.value = aula.id
  aulaForm.value = { 
    nombre: aula.nombre, 
    capacidad: aula.capacidad, 
    ubicacion: aula.ubicacion || '', 
    activa: aula.activa 
  }
}

const toggleAulaStatus = async (aula: any) => {
  try {
    await adminController.updateAula(aula.id, { activa: !aula.activa })
    toast.success(`Aula ${aula.activa ? 'desactivada' : 'activada'}`)
  } catch (e: any) {
    toast.error('Error al cambiar estado')
  }
}

const handleCreatePeriodo = async () => {
  await adminController.createPeriodo(periodoForm.value)
  periodoForm.value = { 
    nombre: '', 
    modalidad: 'SEMESTRAL', 
    fecha_inicio: '', 
    fecha_fin: '',
    estado: 'INSCRIPCION'
  }
}

const handleClosePeriod = async (periodo: any) => {
  if (confirm(`¿Estás seguro de cerrar el periodo ${periodo.nombre}? Esta acción migrará todas las notas al historial académico y no se podrá revertir.`)) {
    isClosing.value = periodo.id
    try {
      await adminController.closePeriod(periodo.id)
      toast.success(`Periodo ${periodo.nombre} cerrado exitosamente.`)
    } catch (e: any) {
      toast.error('Error al cerrar periodo: ' + e.message)
    } finally {
      isClosing.value = null
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configuración Académica</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Gestiona las aulas y los periodos académicos del sistema.</p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-800">
      <button 
        @click="activeTab = 'aulas'"
        :class="[
          'px-6 py-3 text-sm font-medium transition-colors border-b-2',
          activeTab === 'aulas' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        Aulas
      </button>
      <button 
        @click="activeTab = 'periodos'"
        :class="[
          'px-6 py-3 text-sm font-medium transition-colors border-b-2',
          activeTab === 'periodos' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        Periodos Académicos
      </button>
    </div>

    <div v-if="activeTab === 'aulas'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm h-fit">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Plus v-if="!editingAulaId" class="h-5 w-5 mr-2 text-primary-500" />
          <Pencil v-else class="h-5 w-5 mr-2 text-blue-500" />
          {{ editingAulaId ? 'Editar Aula' : 'Nueva Aula' }}
        </h3>
        <form @submit.prevent="handleCreateAula" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre/Código</label>
            <input v-model="aulaForm.nombre" type="text" required placeholder="Ej. Aula 101" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidad</label>
            <input v-model.number="aulaForm.capacidad" type="number" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
            <input v-model="aulaForm.ubicacion" type="text" placeholder="Ej. Bloque A, 2do Piso" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div class="flex items-center gap-2 py-2">
            <input v-model="aulaForm.activa" type="checkbox" id="aulaActiva" class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
            <label for="aulaActiva" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Aula Activa</label>
          </div>
          <div class="flex gap-2">
            <button v-if="editingAulaId" @click="resetAulaForm" type="button" class="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" class="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              {{ editingAulaId ? 'Actualizar' : 'Guardar Aula' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista Aulas -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="aula in adminController.aulas.value" :key="aula.id" class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-4">
            <div :class="['p-3 rounded-lg', aula.activa ? 'bg-gray-50 dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/10 opacity-50']">
              <MapPin :class="['h-6 w-6', aula.activa ? 'text-gray-400' : 'text-red-400']" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 :class="['font-bold', aula.activa ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through']">{{ aula.nombre }}</h4>
                <span v-if="!aula.activa" class="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-100 text-red-600">INACTIVA</span>
              </div>
              <p class="text-sm text-gray-500">{{ aula.ubicacion || 'Sin ubicación' }} • Capacidad: {{ aula.capacidad }}</p>
            </div>
          </div>
          <div class="flex gap-1">
            <button @click="toggleAulaStatus(aula)" :title="aula.activa ? 'Desactivar' : 'Activar'" class="p-2 text-gray-400 hover:text-amber-500 transition-colors">
              <ShieldOff v-if="aula.activa" class="h-4 w-4" />
              <ShieldCheck v-else class="h-4 w-4" />
            </button>
            <button @click="startEditAula(aula)" class="p-2 text-gray-400 hover:text-blue-500 transition-colors">
              <Pencil class="h-4 w-4" />
            </button>
            <button @click="adminController.deleteAula(aula.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'periodos'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulario Periodo -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm h-fit">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Plus class="h-5 w-5 mr-2 text-primary-500" />
          Nuevo Periodo
        </h3>
        <form @submit.prevent="handleCreatePeriodo" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input v-model="periodoForm.nombre" type="text" required placeholder="Ej. I-2024" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
              <input v-model="periodoForm.fecha_inicio" type="date" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin</label>
              <input v-model="periodoForm.fecha_fin" type="date" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modalidad</label>
            <select v-model="periodoForm.modalidad" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
              <option value="SEMESTRAL">Semestral</option>
              <option value="MODULAR">Modular</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>
          <button type="submit" class="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
            Crear Periodo
          </button>
        </form>
      </div>

      <!-- Lista Periodos -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="periodo in adminController.periodos.value" :key="periodo.id" class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar class="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white">{{ periodo.nombre }}</h4>
              <p class="text-sm text-gray-500">
                {{ periodo.fecha_inicio }} al {{ periodo.fecha_fin }} • {{ periodo.modalidad }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="periodo.activo" class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30">
              ACTIVO
            </span>
            <span v-else class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800">
              CERRADO
            </span>
            
            <button 
              v-if="periodo.activo"
              @click="handleClosePeriod(periodo)"
              :disabled="isClosing === periodo.id"
              class="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              title="Cerrar periodo y migrar notas"
            >
              <Loader2 v-if="isClosing === periodo.id" class="h-3 w-3 animate-spin" />
              <CheckCircle v-else class="h-3 w-3" />
              Cerrar
            </button>

            <button @click="adminController.deletePeriodo(periodo.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
