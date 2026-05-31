<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useAdminController } from '@/controllers/AdminController'
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  X,
  Loader2,
  Clock,
  Hash,
  Search,
  Library,
  ChevronRight,
  Layers,
  ShieldCheck
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  show: boolean
  career: any
}>()

const emit = defineEmits(['close'])
const adminController = useAdminController()
const toast = useToast()

const isAdding = ref(false)
const isExisting = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const searchQuery = ref('')
const selectedSubjectId = ref<string | null>(null)
const activeSemester = ref(1)

const form = ref({
  nombre: '',
  codigo: '',
  creditos: 1,
  semestre: 1,
  nivel: 1,
  horas_teoricas: 2,
  horas_practicas: 2
})

watch(() => props.show, (newVal) => {
  if (newVal && props.career) {
    adminController.fetchSubjectsByCareer(props.career.id)
    adminController.fetchAllSubjects()
  }
})

const filteredGlobalSubjects = computed(() => {
  const currentIds = adminController.careerSubjects.value.map(s => s.materias.id)
  return adminController.allSubjects.value.filter(s => 
    !currentIds.includes(s.id) && 
    (s.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
     s.codigo.toLowerCase().includes(searchQuery.value.toLowerCase()))
  ).slice(0, 10)
})

const resetForm = () => {
  form.value = {
    nombre: '',
    codigo: '',
    creditos: 1,
    semestre: activeSemester.value,
    nivel: activeSemester.value,
    horas_teoricas: 2,
    horas_practicas: 2
  }
  isAdding.value = false
  isExisting.value = false
  editingId.value = null
  selectedSubjectId.value = null
  searchQuery.value = ''
}

const handleSave = async () => {
  const semesterCount = adminController.careerSubjects.value.filter(s => s.semestre === form.value.semestre).length
  if (semesterCount >= 6 && !editingId.value) {
    toast.warning(`El Semestre ${form.value.semestre} ya tiene el cupo máximo de 6 materias.`)
    return
  }

  isSubmitting.value = true
  try {
    const pensumData = {
      semestre: form.value.semestre,
      nivel: form.value.nivel,
      obligatoria: true
    }

    if (isExisting.value) {
      if (!selectedSubjectId.value) throw new Error('Selecciona una materia')
      await adminController.linkSubjectToCareer(props.career.id, selectedSubjectId.value, pensumData)
      toast.success('Materia vinculada')
    } else {
      const subjectData = {
        nombre: form.value.nombre,
        codigo: form.value.codigo,
        creditos: form.value.creditos,
        horas_teoricas: form.value.horas_teoricas,
        horas_practicas: form.value.horas_practicas
      }

      if (editingId.value) {
        const subject = adminController.careerSubjects.value.find(s => s.id === editingId.value)
        await adminController.updateSubject(subject.materias.id, subjectData, subject.id, pensumData, props.career.id)
        toast.success('Materia actualizada')
      } else {
        await adminController.createSubject(props.career.id, subjectData, pensumData)
        toast.success('Materia creada')
      }
    }
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar')
  } finally {
    isSubmitting.value = false
  }
}

const selectedSubjectForPrereqs = ref<any>(null)
const prerequisites = ref<any[]>([])
const loadingPrereqs = ref(false)
const prereqSearchQuery = ref('')

const openPrerequisites = async (item: any) => {
  selectedSubjectForPrereqs.value = item
  prereqSearchQuery.value = ''
  loadingPrereqs.value = true
  prerequisites.value = await adminController.fetchPrerequisites(item.materias.id)
  loadingPrereqs.value = false
}

const addPrereq = async (prereqMateriaId: string) => {
  const success = await adminController.addPrerequisite(selectedSubjectForPrereqs.value.materias.id, prereqMateriaId)
  if (success) {
    toast.success('Prerrequisito añadido')
    prereqSearchQuery.value = ''
    prerequisites.value = await adminController.fetchPrerequisites(selectedSubjectForPrereqs.value.materias.id)
  }
}

const removePrereq = async (id: string) => {
  if (confirm('¿Eliminar este prerrequisito?')) {
    const success = await adminController.removePrerequisite(id)
    if (success) {
      toast.success('Prerrequisito eliminado')
      prerequisites.value = await adminController.fetchPrerequisites(selectedSubjectForPrereqs.value.materias.id)
    }
  }
}

const availableForPrereq = computed(() => {
  if (!selectedSubjectForPrereqs.value) return []
  const currentPrereqIds = prerequisites.value.map(p => p.materia_prerrequisito_id)
  
  return adminController.careerSubjects.value
    .filter(s => 
      s.materias.id !== selectedSubjectForPrereqs.value.materias.id && 
      !currentPrereqIds.includes(s.materias.id) &&
      (s.materias.nombre.toLowerCase().includes(prereqSearchQuery.value.toLowerCase()) ||
       s.materias.codigo.toLowerCase().includes(prereqSearchQuery.value.toLowerCase()))
    )
})

const localMaxSem = ref(8)

const groupedSubjects = computed(() => {
  const groups: Record<number, any[]> = {}
  let maxFound = 0
  
  adminController.careerSubjects.value.forEach(item => {
    const sem = item.semestre || 0
    if (sem > maxFound) maxFound = sem
    if (!groups[sem]) groups[sem] = []
    groups[sem].push(item)
  })
  
  // El límite será el máximo entre 8, lo que haya en DB, o lo que el usuario haya añadido localmente
  const limit = Math.max(localMaxSem.value, maxFound)
  
  const result = []
  for (let i = 1; i <= limit; i++) {
    const subjects = groups[i] || []
    result.push({
      semestre: i,
      subjects: subjects,
      totalCredits: subjects.reduce((sum, s) => sum + (s.materias?.creditos || 0), 0)
    })
  }
  return result
})

const addSemesterTab = () => {
  const currentLimit = Math.max(localMaxSem.value, ...adminController.careerSubjects.value.map(s => s.semestre || 0))
  localMaxSem.value = currentLimit + 1
  activeSemester.value = localMaxSem.value
  toast.info(`Se ha habilitado el Semestre ${localMaxSem.value}`)
}

const currentSemesterData = computed(() => {
  return groupedSubjects.value.find(g => g.semestre === activeSemester.value) || { subjects: [], totalCredits: 0 }
})

const selectExisting = (subject: any) => {
  selectedSubjectId.value = subject.id
  searchQuery.value = subject.nombre
}

const startEdit = (item: any) => {
  editingId.value = item.id
  isAdding.value = true
  form.value = {
    nombre: item.materias.nombre,
    codigo: item.materias.codigo,
    creditos: item.materias.creditos,
    semestre: item.semestre,
    nivel: item.nivel,
    horas_teoricas: item.materias.horas_teoricas,
    horas_practicas: item.materias.horas_practicas
  }
}

const handleDelete = async (item: any) => {
  if (confirm(`¿Eliminar ${item.materias.nombre} de esta carrera?`)) {
    try {
      await adminController.deleteSubject(item.id, item.materias.id, props.career.id)
      toast.success('Materia eliminada')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar')
    }
  }
}
</script>

<template>
  <BaseModal :show="show" :title="`Materias - ${career?.nombre}`" @close="$emit('close')" class="max-w-6xl h-[90vh]">
    <div class="flex flex-col h-full">
      <!-- Sidebar de Semestres y Contenido Principal -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <div class="w-64 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 p-4 space-y-2 flex flex-col overflow-hidden">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Plan de Estudios</p>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
            <button 
              v-for="group in groupedSubjects" 
              :key="group.semestre"
              @click="activeSemester = group.semestre; isAdding = false; selectedSubjectForPrereqs = null"
              :class="[
                'w-full flex items-center justify-between p-3 rounded-xl transition-all group',
                activeSemester === group.semestre 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-bold' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              ]"
            >
              <div class="flex items-center gap-3">
                <span :class="['h-6 w-6 flex items-center justify-center rounded-lg text-xs font-black', activeSemester === group.semestre ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700']">{{ group.semestre }}</span>
                <span class="text-sm">Semestre {{ group.semestre }}</span>
              </div>
              <div v-if="group.subjects.length > 0" class="flex items-center gap-1">
                <span :class="['text-[10px] font-black px-1.5 py-0.5 rounded-md', activeSemester === group.semestre ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600']">
                  {{ group.subjects.length }}
                </span>
              </div>
            </button>
          </div>

          <!-- Botón dinámico para añadir más semestres -->
          <button 
            @click="addSemesterTab"
            class="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-black uppercase tracking-widest"
          >
            <Plus class="h-4 w-4" />
            Extender Pensum
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col p-6 overflow-hidden">
          <div class="flex-shrink-0 flex items-center justify-between mb-8">
            <div>
              <h4 class="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Semestre {{ activeSemester }}
                <span class="text-sm font-medium text-gray-400">| {{ currentSemesterData.totalCredits }} Créditos Totales</span>
              </h4>
              <p class="text-sm text-gray-500 mt-1">Gestión de materias y requisitos para este nivel.</p>
            </div>
            <button 
              @click="isAdding = true; form.semestre = activeSemester; form.nivel = activeSemester" 
              class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
            >
              <Plus class="h-5 w-5 mr-2" />
              Añadir Materia
            </button>
          </div>

          <!-- Add/Edit View Overlay -->
          <div v-if="isAdding" class="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 mb-4">
            <div class="flex justify-between items-center mb-6">
              <h5 class="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {{ editingId ? 'Actualizar Materia' : (isExisting ? 'Vincular Materia Existente' : 'Nueva Materia para el Semestre ' + activeSemester) }}
              </h5>
              <button @click="resetForm" class="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm"><X class="h-5 w-5" /></button>
            </div>

            <div v-if="!editingId" class="flex gap-2 mb-8">
              <button 
                type="button"
                @click="isExisting = false; selectedSubjectId = null; searchQuery = ''"
                :class="['flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border-2', !isExisting ? 'bg-white dark:bg-gray-900 border-indigo-600 text-indigo-600 shadow-lg' : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400']"
              >
                Crear Nueva
              </button>
              <button 
                type="button"
                @click="isExisting = true"
                :class="['flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border-2', isExisting ? 'bg-white dark:bg-gray-900 border-indigo-600 text-indigo-600 shadow-lg' : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400']"
              >
                Buscar Existente
              </button>
            </div>

            <form @submit.prevent="handleSave" class="space-y-6">
              <div v-if="isExisting && !editingId" class="relative">
                <div class="relative">
                  <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Escribe el nombre o código..."
                    class="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm transition-all" 
                  />
                </div>

                <div v-if="searchQuery && !selectedSubjectId" class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-60 overflow-y-auto custom-scrollbar">
                  <div 
                    v-for="s in filteredGlobalSubjects" 
                    :key="s.id"
                    @click="selectExisting(s)"
                    class="p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <p class="font-bold text-gray-900 dark:text-white">{{ s.nombre }}</p>
                    <p class="text-xs text-gray-500 font-mono">{{ s.codigo }}</p>
                  </div>
                </div>

                <div v-if="selectedSubjectId" class="mt-4 p-4 bg-indigo-600 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                  <div class="flex items-center gap-3">
                    <Library class="h-5 w-5" />
                    <span class="font-bold">{{ searchQuery }}</span>
                  </div>
                  <button @click="selectedSubjectId = null; searchQuery = ''" class="p-1 hover:bg-white/20 rounded-lg"><X class="h-5 w-5" /></button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <template v-if="!isExisting">
                  <div class="md:col-span-2">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de Materia</label>
                    <input v-model="form.nombre" type="text" required class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Código Identificador</label>
                    <input v-model="form.codigo" type="text" required class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono" />
                  </div>
                </template>

                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Semestre / Ciclo</label>
                  <input v-model.number="form.semestre" type="number" readonly class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black cursor-not-allowed" />
                </div>
                
                <template v-if="!isExisting">
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Créditos Académicos</label>
                    <input v-model.number="form.creditos" type="number" required class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
                  </div>
                </template>

                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nivel de Pensum</label>
                  <input v-model.number="form.nivel" type="number" required class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
                </div>
              </div>
              
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" @click="resetForm" class="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
                <button type="submit" :disabled="isSubmitting" class="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 dark:shadow-none flex items-center">
                  <Loader2 v-if="isSubmitting" class="animate-spin h-5 w-5 mr-3" />
                  <Save v-else class="h-5 w-5 mr-3" />
                  {{ editingId ? 'Actualizar' : (isExisting ? 'Vincular' : 'Confirmar Registro') }}
                </button>
              </div>
            </form>
          </div>

          <!-- Subjects List View -->
          <div v-else class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div v-if="adminController.loading.value" class="flex flex-col items-center justify-center h-full">
              <Loader2 class="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p class="text-gray-500 animate-pulse font-bold">Cargando materias...</p>
            </div>
            
            <div v-else-if="currentSemesterData.subjects.length === 0" class="flex flex-col items-center justify-center h-full text-center p-12 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div class="h-20 w-20 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm mb-6">
                <Library class="h-10 w-10 text-gray-300" />
              </div>
              <h5 class="text-xl font-black text-gray-900 dark:text-white mb-2">No hay materias registradas</h5>
              <p class="text-gray-500 max-w-xs mx-auto mb-8">Comienza a armar el plan de estudios para el semestre {{ activeSemester }} agregando tu primera materia.</p>
              <button @click="isAdding = true; form.semestre = activeSemester" class="text-indigo-600 font-black hover:underline flex items-center">
                Añadir materia ahora <ChevronRight class="h-4 w-4 ml-1" />
              </button>
            </div>

            <div v-else class="space-y-4">
              <!-- Warning UX: 6 subjects -->
              <div v-if="currentSemesterData.subjects.length >= 6" class="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex items-center gap-3">
                <ShieldCheck class="h-5 w-5 text-amber-600" />
                <p class="text-sm font-bold text-amber-800 dark:text-amber-400">Cupo máximo alcanzado para este semestre (6/6).</p>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div 
                  v-for="item in currentSemesterData.subjects" 
                  :key="item.id"
                  class="group bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all border-l-4 border-l-transparent hover:border-l-indigo-600"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                        <BookOpen class="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ item.materias?.codigo }}</p>
                        <h6 class="text-lg font-black text-gray-900 dark:text-white line-clamp-1">{{ item.materias?.nombre }}</h6>
                      </div>
                    </div>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="startEdit(item)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button @click="handleDelete(item)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-gray-400 hover:text-red-600 transition-all">
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-1.5">
                        <Layers class="h-3.5 w-3.5 text-gray-400" />
                        <span class="text-xs font-bold text-gray-500">Nivel {{ item.nivel }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <Hash class="h-3.5 w-3.5 text-gray-400" />
                        <span class="text-xs font-bold text-gray-500">{{ item.materias?.creditos }} Créditos</span>
                      </div>
                    </div>
                    <button 
                      @click="openPrerequisites(item)"
                      class="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Prerrequisitos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Prerrequisitos Float Panel -->
          <div v-if="selectedSubjectForPrereqs" class="absolute bottom-6 right-6 w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 z-50 animate-in slide-in-from-bottom-4">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h5 class="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">Requisitos</h5>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{{ selectedSubjectForPrereqs.materias.nombre }}</p>
              </div>
              <button @click="selectedSubjectForPrereqs = null" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X class="h-4 w-4" /></button>
            </div>

            <div class="space-y-4 max-h-64 overflow-y-auto custom-scrollbar mb-6">
              <div v-if="loadingPrereqs" class="flex justify-center py-4"><Loader2 class="h-6 w-6 animate-spin text-indigo-600" /></div>
              <div v-else-if="prerequisites.length === 0" class="text-center py-8">
                <p class="text-xs text-gray-400 font-medium italic">Sin materias previas requeridas.</p>
              </div>
              <div v-for="p in prerequisites" :key="p.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div class="overflow-hidden">
                  <p class="text-xs font-black text-gray-900 dark:text-white truncate">{{ p.prerrequisito.nombre }}</p>
                  <p class="text-[10px] text-gray-500 font-mono">{{ p.prerrequisito.codigo }}</p>
                </div>
                <button @click="removePrereq(p.id)" class="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 class="h-4 w-4" /></button>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-800 relative">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Buscar para Vincular</label>
              
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  v-model="prereqSearchQuery" 
                  type="text" 
                  placeholder="Escribe nombre o código..."
                  class="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-xs font-bold transition-all"
                />
              </div>

              <!-- Resultados de búsqueda de prerrequisitos -->
              <div v-if="prereqSearchQuery && availableForPrereq.length > 0" class="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-48 overflow-y-auto custom-scrollbar z-[60]">
                <div 
                  v-for="s in availableForPrereq" 
                  :key="s.id"
                  @click="addPrereq(s.materias.id)"
                  class="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <p class="text-xs font-bold text-gray-900 dark:text-white">{{ s.materias.nombre }}</p>
                  <p class="text-[10px] text-gray-500 font-mono">{{ s.materias.codigo }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Dark mode scrollbar */
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1f2937;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #374151;
}
</style>