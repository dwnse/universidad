<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title: string
  class?: string
}>()

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <div 
          :class="[
            'bg-white dark:bg-gray-900 w-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col',
            $props.class || 'max-w-lg'
          ]"
        >
          <div class="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ title }}</h3>
            <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X class="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div class="p-6 overflow-hidden flex-1 flex flex-col">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
