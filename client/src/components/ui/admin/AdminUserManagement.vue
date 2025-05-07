<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { toast } from 'vue-sonner'
import type { User } from '@/types/user'

// Users list
const users = ref<User[]>([])
const loading = ref<boolean>(true)
const error = ref<string>('')
const selectedUser = ref<User | null>(null)
const showUserDetails = ref<boolean>(false)

onMounted(async () => {
  try {
    // TODO: Replace with actual API call to fetch users
    // const response = await fetch('/api/admin/users', {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // users.value = await response.json()
    
    // For now, using sample data
    setTimeout(() => {
      users.value = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@example.com',
          isAdmin: false,
          registeredEvents: [1, 3],
          createdAt: '2025-01-15'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          isAdmin: false,
          registeredEvents: [2],
          createdAt: '2025-02-20'
        },
        {
          id: 3,
          name: 'Mohammed Al-Farsi',
          email: 'mohammed.alfarsi@example.com',
          isAdmin: false,
          registeredEvents: [1, 2, 5],
          createdAt: '2025-01-28'
        },
        {
          id: 4,
          name: 'Admin User',
          email: 'admin@example.com',
          isAdmin: true,
          registeredEvents: [],
          createdAt: '2024-12-01'
        }
      ]
      loading.value = false
      toast.success('Users loaded successfully', {
        description: 'You can now manage user accounts'
      })
    }, 800)
  } catch (err) {
    error.value = 'Failed to load users. Please try again later.'
    toast.error('Failed to load users', {
      description: 'Please try again later'
    })
    loading.value = false
  }
})

// View user details
const viewUserDetails = (user: User) => {
  selectedUser.value = user
  showUserDetails.value = true
  
  toast.info(`Viewing ${user.name}'s details`, {
    description: `User ID: ${user.id}`
  })
}

// Close user details
const closeUserDetails = () => {
  showUserDetails.value = false
  selectedUser.value = null
}

// Toggle admin status
const toggleAdminStatus = async (userId: number) => {
  try {
    const user = users.value.find(u => u.id === userId)
    if (!user) return
    
    const newStatus = !user.isAdmin
    const actionText = newStatus ? 'promoted to admin' : 'demoted from admin'
    
    if (!confirm(`Are you sure you want to ${actionText} ${user.name}?`)) {
      return
    }
    
    // TODO: Replace with actual API call to update user admin status
    // await fetch(`/api/admin/users/${userId}/toggle-admin`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ isAdmin: !user.isAdmin })
    // })
    
    // For now, simulate API response
    user.isAdmin = newStatus
    
    toast.success(`User ${actionText}`, {
      description: `${user.name} has been ${actionText} successfully`
    })
  } catch (err) {
    toast.error('Failed to update user status', {
      description: 'Please try again later'
    })
  }
}

// Send password reset email
const sendPasswordReset = async (userId: number) => {
  try {
    const user = users.value.find(u => u.id === userId)
    if (!user) return
    
    // TODO: Replace with actual API call to send password reset
    // await fetch(`/api/admin/users/${userId}/reset-password`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    
    // Simulate API response
    toast.success('Password reset email sent', {
      description: `An email has been sent to ${user.email}`
    })
  } catch (err) {
    toast.error('Failed to send password reset', {
      description: 'Please try again later'
    })
  }
}

// Cancel user registration for an event
const cancelRegistration = async (userId: number, eventId: number) => {
  try {
    const user = users.value.find(u => u.id === userId)
    if (!user) return
    
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return
    }
    
    // TODO: Replace with actual API call to cancel registration
    // await fetch(`/api/admin/users/${userId}/events/${eventId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    
    // Simulate API response
    user.registeredEvents = user.registeredEvents.filter(id => id !== eventId)
    
    toast.success('Registration cancelled', {
      description: 'The user has been removed from this event'
    })
  } catch (err) {
    toast.error('Failed to cancel registration', {
      description: 'Please try again later'
    })
  }
}

// Get event name from ID (in a real app, this would fetch from your events data)
const getEventName = (eventId: number) => {
  const eventNames = {
    1: 'Tech Conference 2025',
    2: 'Digital Marketing Workshop',
    3: 'Symphony Orchestra Concert',
    4: 'Art Exhibition: Modern Masters',
    5: 'Leadership Seminar'
  }
  return eventNames[eventId as keyof typeof eventNames] || 'Unknown Event'
}

// Format date for display
const formatDate = (dateString: string) => {
  const options: any = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-4 pt-4">
      <div class="flex items-center">
        <i class="pi pi-users text-primary mr-2 text-xl"></i>
        <h1 class="text-2xl font-bold">User Management</h1>
      </div>
      <p class="text-muted-foreground">Manage user accounts and permissions</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-primary">
        <i class="pi pi-spinner pi-spin mr-2 text-xl"></i>
        Loading users...
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-center">
      <i class="pi pi-exclamation-triangle mr-2 text-destructive"></i>
      {{ error }}
    </div>
    
    <!-- User List -->
    <div v-else-if="!showUserDetails">
      <Card>
        <CardHeader>
          <div class="flex items-center">
            <i class="pi pi-list text-primary mr-2"></i>
            <CardTitle>User Accounts</CardTitle>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Registered Events</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id" class="hover:bg-muted/50">
              <TableCell>
                <div class="flex items-center">
                  <div class="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="text-primary font-medium text-sm">
                      {{ getInitials(user.name) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="font-medium">
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-muted-foreground flex items-center">
                      <i class="pi pi-envelope text-xs mr-1"></i>
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="user.isAdmin ? 'default' : 'outline'" class="flex items-center w-fit">
                  <i :class="user.isAdmin ? 'pi pi-shield mr-1' : 'pi pi-user mr-1'"></i>
                  {{ user.isAdmin ? 'Admin' : 'User' }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center">
                  <i class="pi pi-calendar text-muted-foreground mr-1"></i>
                  {{ formatDate(user.createdAt) }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center">
                  <i class="pi pi-ticket text-muted-foreground mr-1"></i>
                  <span>{{ user.registeredEvents.length }}</span>
                  <Badge v-if="user.registeredEvents.length > 0" variant="outline" class="ml-2">
                    {{ user.registeredEvents.length === 1 ? 'event' : 'events' }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 text-primary mr-2"
                  @click="viewUserDetails(user)"
                >
                  <i class="pi pi-eye mr-1"></i>
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8"
                  :class="user.isAdmin ? 'text-destructive' : 'text-primary'"
                  @click="toggleAdminStatus(user.id)"
                >
                  <i :class="user.isAdmin ? 'pi pi-shield-slash mr-1' : 'pi pi-shield mr-1'"></i>
                  {{ user.isAdmin ? 'Remove Admin' : 'Make Admin' }}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      
      <!-- Empty State -->
      <div v-if="users.length === 0" class="text-center py-10">
        <i class="pi pi-users text-5xl text-muted-foreground mb-4"></i>
        <h3 class="text-lg font-semibold">No users found</h3>
        <p class="text-muted-foreground mt-2">There are no registered users in the system yet</p>
      </div>
    </div>
    
    <!-- User Details -->
    <div v-else-if="selectedUser">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <i class="pi pi-user-edit text-primary mr-2 text-xl"></i>
          <h2 class="text-2xl font-bold">User Details</h2>
        </div>
        <Button variant="outline" @click="closeUserDetails" class="flex items-center">
          <i class="pi pi-arrow-left mr-1"></i>
          Back to Users
        </Button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- User Profile Card -->
        <Card className="md:col-span-1">
          <CardHeader>
            <div class="flex items-center">
              <i class="pi pi-id-card text-primary mr-2"></i>
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col items-center mb-6">
              <div class="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span class="text-primary font-bold text-2xl">
                  {{ getInitials(selectedUser.name) }}
                </span>
              </div>
              <h3 class="text-xl font-semibold">{{ selectedUser.name }}</h3>
              <p class="text-muted-foreground flex items-center mt-1">
                <i class="pi pi-envelope mr-1"></i>
                {{ selectedUser.email }}
              </p>
              <Badge :variant="selectedUser.isAdmin ? 'default' : 'outline'" class="mt-2 flex items-center">
                <i :class="selectedUser.isAdmin ? 'pi pi-shield mr-1' : 'pi pi-user mr-1'"></i>
                {{ selectedUser.isAdmin ? 'Admin' : 'User' }}
              </Badge>
            </div>
            
            <div class="space-y-4">
              <div class="bg-muted p-3 rounded-md flex items-center">
                <i class="pi pi-id-card text-muted-foreground mr-2"></i>
                <div>
                  <p class="text-sm text-muted-foreground">User ID</p>
                  <p class="font-medium">{{ selectedUser.id }}</p>
                </div>
              </div>
              
              <div class="bg-muted p-3 rounded-md flex items-center">
                <i class="pi pi-calendar text-muted-foreground mr-2"></i>
                <div>
                  <p class="text-sm text-muted-foreground">Joined On</p>
                  <p class="font-medium">{{ formatDate(selectedUser.createdAt) }}</p>
                </div>
              </div>
              
              <div class="bg-muted p-3 rounded-md flex items-center">
                <i class="pi pi-ticket text-muted-foreground mr-2"></i>
                <div>
                  <p class="text-sm text-muted-foreground">Total Events Registered</p>
                  <p class="font-medium">{{ selectedUser.registeredEvents.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="mt-6 space-y-3">
              <Button 
                class="w-full justify-center"
                :variant="selectedUser.isAdmin ? 'destructive' : 'default'"
                @click="toggleAdminStatus(selectedUser.id)"
              >
                <i :class="selectedUser.isAdmin ? 'pi pi-shield-slash mr-1' : 'pi pi-shield mr-1'"></i>
                {{ selectedUser.isAdmin ? 'Remove Admin Status' : 'Grant Admin Status' }}
              </Button>
              
              <Button variant="outline" class="w-full justify-center" @click="sendPasswordReset(selectedUser.id)">
                <i class="pi pi-key mr-1"></i>
                Send Password Reset
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <!-- Registered Events -->
        <Card className="md:col-span-2">
          <CardHeader>
            <div class="flex items-center">
              <i class="pi pi-calendar-plus text-primary mr-2"></i>
              <CardTitle>Registered Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="selectedUser.registeredEvents.length === 0" class="bg-muted p-4 rounded-md text-center">
              <i class="pi pi-calendar-times text-4xl text-muted-foreground mb-2"></i>
              <p class="text-muted-foreground">This user has not registered for any events yet.</p>
            </div>
            <div v-else class="space-y-3">
              <Card v-for="eventId in selectedUser.registeredEvents" :key="eventId" class="overflow-hidden">
                <div class="flex items-center justify-between p-4">
                  <div class="flex items-center">
                    <i class="pi pi-ticket text-primary mr-2"></i>
                    <div>
                      <h4 class="font-medium">{{ getEventName(eventId) }}</h4>
                      <p class="text-sm text-muted-foreground">
                        Event ID: {{ eventId }}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    class="text-destructive"
                    @click="cancelRegistration(selectedUser.id, eventId)"
                  >
                    <i class="pi pi-trash mr-1"></i>
                    Cancel Registration
                  </Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>