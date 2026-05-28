<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        Bienvenido, {{ authStore.profile?.full_name || 'Usuario' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Has accedido como <span class="font-semibold text-primary-600">{{ authStore.userRole }}</span>
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    </div>
  </div>
</template>
