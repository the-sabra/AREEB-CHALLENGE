<script setup lang="ts">
import { ref, onMounted,watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { toast } from 'vue-sonner'
import type { Category,  CategoryResponse,  ApiEvent, EventListResponse } from '@/types/event'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'

import {
  Pagination,
  PaginationFirst,
  PaginationLast, 
  PaginationNext,
} from '@/components/ui/pagination'

//pagination
const page = ref(1)
const itemsPerPage = 10 // adjust as needed
const totalItems = ref(0)

// Events list
const events = ref<ApiEvent[] | null>(null)
const loading = ref<boolean>(true)
const error = ref<string>('')
const showEventDialog = ref<boolean>(false) // Renamed from showEventForm to showEventDialog
const isEditing = ref<boolean>(false)
const currentEvent = ref<ApiEvent | null>(null)
const showDeleteConfirm = ref<boolean>(false)
const eventToDelete = ref<number | null>(null)


const categories = ref<Category[]>([]);

async function getCategories() {
  try {
    const catResponse = await api.get<CategoryResponse>('/events/categories')
    categories.value = catResponse.categories;

    if (!categories.value.find(cat => cat.name === 'All Categories')) {
      categories.value.unshift({
        id: 0,
        name: 'All Categories',
      });
    }
    
  } catch (err) {
    console.error('Failed to load categories:', err);
    toast.error('Failed to load categories');
  }
}
// // Sample categories for filtering
// const categories: EventCategory[] = [
//   { value: 'conference', label: 'Conferences' },
//   { value: 'workshop', label: 'Workshops' },
//   { value: 'concert', label: 'Concerts' },
//   { value: 'exhibition', label: 'Exhibitions' },
//   { value: 'seminar', label: 'Seminars' }
// ]


async function fetchData() {
  try {
    loading.value = true
    const response = await api.get<EventListResponse>('/events', {
      params: {
        page: page.value,
        limit: itemsPerPage
      }
    })

    events.value = response.events;
    totalItems.value = response.pagination.totalCount;
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load events. Please try again later.'
    toast.error('Failed to load events', {
      description: 'Please try again later'
    })
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await getCategories()
    const authStore = useAuthStore()
    if(authStore.isAuthenticated && authStore.isAdmin) {
      loading.value = true
     await fetchData()
    } else {
      error.value = 'You must be logged in as an admin to view events.'
    }
  } catch (err) {
    error.value = 'Failed to load events. Please try again later.'
    toast.error('Failed to load events', {
      description: 'Please try again later'
    })
    loading.value = false
  }
})

// Create new event
const createEvent = () => {
  currentEvent.value = {
    id: 0,
    name: '',  // Changed from title to name
    description: '',
    date: new Date().toISOString().split('T')[0], // Set today as default date
    time: '09:00',
    location_link: '', // Changed from location to location_link
    image: '',
    price: 0,
    capacity: 100, // Set reasonable default
    attendees: 0,
    categoryId: 1, // Default category ID
    venue: '', // Added venue property
    isBooked: false, // Default not booked
    category: {
      id: 1,
      name: 'Conference'
    },
    tags: [] // Empty tags array
  }
  isEditing.value = false
  showEventDialog.value = true
}

// Edit existing event
const editEvent = (event: ApiEvent) => {
  currentEvent.value = { ...event }
  isEditing.value = true
  showEventDialog.value = true
  
  toast.info('Editing event', {
    description: `You are now editing: ${event.name}`
  })
}

// Delete event
const deleteEvent = (id: number) => {
  eventToDelete.value = id
  showDeleteConfirm.value = true
}

// Confirm delete
const confirmDelete = () => {
  // if (eventToDelete.value === null) return
  
  // const index = events.value.findIndex((event: ApiEvent) => event.id === eventToDelete.value)
  // if (index !== -1) {
  //   events.value.splice(index, 1)
  //   toast.success('Event deleted', {
  //     description: 'Event has been successfully deleted'
  //   })
  // }
  
  showDeleteConfirm.value = false
  eventToDelete.value = null
}

// Save event (create or update)
const saveEvent = async (eventData: ApiEvent) => {
  // try {
  //   setTimeout(() => {
  //     if (isEditing.value) {
  //       const index = events.value.findIndex((event: ApiEvent) => event.id === eventData.id)
  //       if (index !== -1) {
  //         events.value[index] = { ...eventData }
  //         toast.success('Event updated', {
  //           description: `${eventData.title} has been successfully updated`
  //         })
  //       }
  //     } else {
  //       const newEvent = {
  //         ...eventData,
  //         id: Math.max(0, ...events.value.map((event: ApiEvent) => event.id)) + 1
  //       }
  //       events.value.push(newEvent)
  //       toast.success('Event created', {
  //         description: `${newEvent.title} has been successfully created`
  //       })
  //     }
      
  //     showEventDialog.value = false
  //     currentEvent.value = null
  //   }, 800)
  // } catch (err) {
  //   toast.error(`Failed to ${isEditing.value ? 'update' : 'create'} event`, {
  //     description: 'Please try again later'
  //   })
  // }
}

// Cancel form
const cancelForm = () => {
  if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
    showEventDialog.value = false
    currentEvent.value = null
    toast.info('Changes discarded', {
      description: 'You have cancelled the form'
    })
  }
}

// Format date for display
const formatDate = (dateString: string) => {
  const options: any = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Calculate availability percentage
const calculateAvailability = (attendees: number, capacity: number) => {
  return Math.round((attendees / capacity) * 100)
}

// Get availability status
const getAvailabilityStatus = (attendees: number, capacity: number) => {
  const percentage = (attendees / capacity) * 100
  if (percentage >= 90) return { text: 'Almost Full', color: 'bg-red-500' }
  if (percentage >= 75) return { text: 'Filling Up', color: 'bg-orange-500' }
  if (percentage >= 50) return { text: 'Going Well', color: 'bg-yellow-500' }
  return { text: 'Available', color: 'bg-green-500' }
}

watch(page, fetchData, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Event Management</h1>
        <p class="text-muted-foreground">Create and manage your events</p>
      </div>
      <Button @click="createEvent" class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Event
      </Button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-primary">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading events...
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
      {{ error }}
    </div>
    
    <!-- Event List -->
    <div v-else>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Price</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="event in events" :key="event.id" class="hover:bg-muted/50">
              <TableCell>
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                    <img
                      v-if="event.image"
                      :src="event.image" 
                      class="h-10 w-10 rounded-full object-cover" 
                      :alt="event.name" 
                    />
                    <!-- <Avatar
                      v-else
                      class="h-10 w-10"
                      :fallback="event.name.charAt(0)"
                    /> -->
                      <Avatar v-else class="h-10 w-10">
                        <AvatarFallback>{{ event.name.charAt(0) }}</AvatarFallback>
                      </Avatar>
                    </div>
                  <div class="ml-4">
                    <div class="font-medium">
                      {{ event.name }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ event.location_link }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>{{ formatDate(event.date) }}</div>
                <div class="text-sm text-muted-foreground">{{ event.time }}</div>
              </TableCell>
              <TableCell>
                <Badge>
                  {{ event.category.name.charAt(0).toUpperCase() + event.category.name.slice(1) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span>{{ event.attendees }} / {{ event.capacity }}</span>
                  <div class="w-24 bg-muted rounded-full h-1.5 mt-1">
                    <div 
                      class="bg-primary h-1.5 rounded-full" 
                      :style="`width: ${calculateAvailability(event.attendees, event.capacity)}%`"
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell>${{ event.price }}</TableCell>
              <TableCell class="text-right">
                <div class="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" @click="editEvent(event)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Event</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" @click="deleteEvent(event.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Event</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

  <!-- Pagination -->
  <div class="flex justify-center mt-4">
    <Card class="w-full p-4">
      <div class="flex justify-between items-center">
        <p class="text-sm text-muted-foreground">
          Showing {{ events?.length || 0 }} of {{ totalItems }} events
        </p>
        
        <Pagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total="totalItems"
          :sibling-count="1"
          show-edges
          class="flex items-center gap-1"
        >
          <!-- <PaginationNext />  -->

          <template v-for="(item, index) in Array.from({ length: Math.ceil(totalItems / itemsPerPage) })" :key="index">
            <Button 
              :variant="page === index + 1 ? 'default' : 'outline'"
              class="h-8 w-8 p-0"
              @click="page = index + 1"
            >
              {{ index + 1 }}
            </Button>
          </template>

          <PaginationNext />
        </Pagination>
      </div>
    </Card>
  </div>

      <div v-if="events?.length === 0" class="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="text-lg font-semibold">No events found</h3>
        <p class="text-muted-foreground mt-2">Create your first event to get started</p>
        <Button class="mt-4" @click="createEvent">Create Event</Button>
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Event Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-4">
          <Button variant="outline" @click="showDeleteConfirm = false">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <!-- Event Form Dialog -->
    <Dialog v-model:open="showEventDialog">
      <DialogContent class="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Event' : 'Create New Event' }}</DialogTitle>
          <DialogDescription>
            Enter the details for your event. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="saveEvent(currentEvent)" class="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2" v-if="currentEvent">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="title" class="block text-sm font-medium mb-1">Event Title</label>
                <input
                  id="title"
                  v-model="currentEvent.name"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="category" class="block text-sm font-medium mb-1">Category</label>
                <select
                  id="category"
                  v-model="currentEvent.category"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                >
                  <option v-for="category in categories" :key="category.id" :value="category.name">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label for="date" class="block text-sm font-medium mb-1">Start Date</label>
                <input
                  id="date"
                  v-model="currentEvent.date"
                  type="date"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="time" class="block text-sm font-medium mb-1">Start Time</label>
                <input
                  id="time"
                  v-model="currentEvent.time"
                  type="time"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              
              <div>
                <label for="location" class="block text-sm font-medium mb-1">Location Name</label>
                <input
                  id="location"
                  v-model="currentEvent.location_link"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="address" class="block text-sm font-medium mb-1">Address</label>
                <input
                  id="address"
                  v-model="currentEvent.venue"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="price" class="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  id="price"
                  v-model.number="currentEvent.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="capacity" class="block text-sm font-medium mb-1">Capacity</label>
                <input
                  id="capacity"
                  v-model.number="currentEvent.capacity"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div class="md:col-span-2">
                <label for="image" class="block text-sm font-medium mb-1">Image URL</label>
                <input
                  id="image"
                  v-model="currentEvent.image"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                <p class="mt-1 text-xs text-muted-foreground">
                  Enter a URL for the event image. In a production environment, you would upload an image here.
                </p>
              </div>
              
              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium mb-1">Description</label>
                <textarea
                  id="description"
                  v-model="currentEvent.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <DialogFooter class="pt-4 border-t border-border">
            <Button type="button" variant="outline" @click="cancelForm">
              Cancel
            </Button>
            <Button type="submit">
              {{ isEditing ? 'Update Event' : 'Create Event' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>