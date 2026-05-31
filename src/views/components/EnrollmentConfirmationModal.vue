<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import { 
  BookOpen, 
  User, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  subject: any
  parallel: any
  loading: boolean
}>()

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <BaseModal :show="show" title="Confirmar Inscripción" @close="$emit('close')">
    <div v-if="subject && parallel" class="space-y-6">
      <!-- Info de la Materia -->
      <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
        <div class="flex items-start gap-4">
          <div class="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <BookOpen class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ subject.nombre }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">{{ subject.codigo }} • {{ subject.creditos }} Créditos</p>
          </div>
        </div>
      </div>

      <!-- Detalles del Paralelo -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <User class="h-5 w-5 text-gray-400" />
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase leading-none">Docente</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ parallel.docentes?.usuarios ? `${parallel.docentes.usuarios.nombres} ${parallel.docentes.usuarios.apellidos}` : 'Por asignar' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Clock class="h-5 w-5 text-gray-400" />
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase leading-none">Horario y Turno</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ parallel.horario_inicio }} - {{ parallel.horario_fin }} ({{ parallel.turno }})
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <MapPin class="h-5 w-5 text-gray-400" />
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase leading-none">Aula / Ubicación</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ parallel.aulas?.nombre || 'Aula por asignar' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <CheckCircle2 class="h-5 w-5 text-gray-400" />
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase leading-none">Cupos Disponibles</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ parallel.cupo_maximo - (parallel.cupo_actual || 0) }} vacantes de {{ parallel.cupo_maximo }}
            </p>
          </div>
        </div>
      </div>

      <!-- Advertencia -->
      <div class="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-800/50 text-xs">
        <AlertTriangle class="h-5 w-5 shrink-0" />
        <p>Una vez confirmada la inscripción, no podrás cambiar de paralelo sin autorización académica.</p>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 pt-2">
        <button 
          @click="$emit('close')"
          class="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="$emit('confirm')"
          :disabled="loading"
          class="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {{ loading ? 'Inscribiendo...' : 'Confirmar Inscripción' }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
