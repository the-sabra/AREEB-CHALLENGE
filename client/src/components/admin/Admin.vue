<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { toast } from 'vue-sonner'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/lib/api'// Adjust the import based on your API setup

interface Stats {
  totalEvents: number
  totalUsers: number
  registrations: number
  upcomingEvents: number
}
const router = useRouter()
const route = useRoute()

// Stats summary
const stats = ref<Stats>({
  totalEvents: 0,
  totalUsers: 0,
  registrations: 0,
  upcomingEvents: 0
}) 

const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get<Stats>("/admin/status",{
      requiresAuth: true
    })
    stats.value = response;
    loading.value = false
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button @click="() => router.push('/events')" variant="outline" class="flex items-center">
              <i class="pi pi-arrow-left mr-2"></i>
              Back to Events
            </Button>
          </TooltipTrigger>
          <TooltipContent>Return to the events page</TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
            <div class="flex items-center justify-between mb-4">
              <div class="text-primary text-lg font-semibold">Total Events</div>
              <div class="bg-primary/10 p-2 rounded-full">
                <i class="pi pi-calendar text-primary text-xl"></i>
              </div>
            </div>
            <div class="text-3xl font-bold">{{ stats.totalEvents }}</div>
            <div class="text-sm text-muted-foreground mt-1">Active events in the system</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="text-green-500 text-lg font-semibold">Registered Users</div>
              <div class="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                <i class="pi pi-users text-green-500 text-xl"></i>
              </div>
            </div>
            <div class="text-3xl font-bold">{{ stats.totalUsers }}</div>
            <div class="text-sm text-muted-foreground mt-1">Total user accounts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="text-amber-500 text-lg font-semibold">Event Registrations</div>
              <div class="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
                <i class="pi pi-ticket text-amber-500 text-xl"></i>
              </div>
            </div>
            <div class="text-3xl font-bold">{{ stats.registrations }}</div>
            <div class="text-sm text-muted-foreground mt-1">Total event bookings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="flex flex-col p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="text-blue-500 text-lg font-semibold">Upcoming Events</div>
              <div class="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                <i class="pi pi-calendar-plus text-blue-500 text-xl"></i>
              </div>
            </div>
            <div class="text-3xl font-bold">{{ stats.upcomingEvents || 0 }}</div>
            <div class="text-sm text-muted-foreground mt-1">Events in the next 30 days</div>
          </CardContent>
        </Card>
      </div>
      
      <!-- Navigation Tabs with better styling -->
      <div class="border-b border-border mt-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            @click="navigateTo('/admin/events')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
              isActive('/admin/events')
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            ]"
          >
            <i class="pi pi-calendar mr-2"></i>
            Manage Events
          </button>
          
          <button
            @click="navigateTo('/admin/users')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
              isActive('/admin/users')
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            ]"
          >
            <i class="pi pi-users mr-2"></i>
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