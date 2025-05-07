<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()

// Use storeToRefs to maintain reactivity for store state
const { isAuthenticated, isAdmin } = storeToRefs(authStore)

// Initialize authentication state when the app loads
onMounted(async () => {
  await authStore.checkAuth()
})

const logout = async () => {
  await authStore.logout()
  toast.success('Successfully logged out')
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white dark:bg-gray-900 border-b">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-xl font-bold text-gray-900 dark:text-white">Event Hub</router-link>
        </div>
        
        <nav>
          <ul class="flex items-center space-x-4">
            <li v-if="!isAuthenticated">
              <router-link to="/" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Sign In / Register</router-link>
            </li>
            <li v-if="isAuthenticated">
              <router-link to="/events" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Events</router-link>
            </li>
            <li v-if="isAdmin">
              <router-link to="/admin" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Admin Panel</router-link>
            </li>
            <li v-if="isAuthenticated">
              <Button variant="ghost" @click="logout">Logout</Button>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="flex-1 container mx-auto px-4 py-6">
      <router-view />
    </main>
    
    <footer class="bg-gray-100 dark:bg-gray-800 py-4 mt-auto">
      <div class="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
        &copy; 2025 Event Hub - All rights reserved
      </div>
    </footer>
    
    <!-- Add toast container -->
    <Toaster position="top-right" richColors closeButton />
  </div>
</template>