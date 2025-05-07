<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Stats summary
const stats = ref({
  totalEvents: 0,
  totalUsers: 0,
  registrations: 0,
  upcomingEvents: 0
}) 

const loading = ref(true)

onMounted(async () => {
  try {
    // TODO: Replace with actual API calls to fetch admin stats
    // const response = await fetch('/api/admin/dashboard', {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // stats.value = await response.json()
    
    // For now, using sample data
    setTimeout(() => {
      stats.value = {
        totalEvents: 12,
        totalUsers: 356,
        registrations: 987,
        upcomingEvents: 8
      }
      loading.value = false
      toast.success('Admin dashboard loaded', {
        description: 'Welcome to the admin dashboard'
      })
    }, 500)
  } catch (err) {
    toast.error('Failed to load dashboard data', {
      description: 'Please try again later'
    })
    loading.value = false
  }
})

// Navigation helper
const isActive = (path: string) => {
  return route.path.includes(path)
}

// Navigate to sections
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <Button @click="() => router.push('/events')" variant="outline" class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Return to Site
      </Button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-primary">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading dashboard...
      </div>
    </div>
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="text-primary text-lg font-semibold mb-2">Total Events</div>
            <div class="text-3xl font-bold">{{ stats.totalEvents }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="text-green-500 text-lg font-semibold mb-2">Registered Users</div>
            <div class="text-3xl font-bold">{{ stats.totalUsers }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="text-amber-500 text-lg font-semibold mb-2">Event Registrations</div>
            <div class="text-3xl font-bold">{{ stats.registrations }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="text-blue-500 text-lg font-semibold mb-2">Upcoming Events</div>
            <div class="text-3xl font-bold">{{ stats.upcomingEvents }}</div>
          </CardContent>
        </Card>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="border-b border-border">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            @click="navigateTo('/admin/events')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              isActive('/admin/events')
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            ]"
          >
            Manage Events
          </button>
          
          <button
            @click="navigateTo('/admin/users')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              isActive('/admin/users')
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            ]"
          >
            Manage Users
          </button>
        </nav>
      </div>
      
      <!-- Router View for Child Routes -->
      <div>
        <router-view />
      </div>
    </div>
  </div>
</template>