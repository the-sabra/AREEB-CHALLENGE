<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { toast } from 'vue-sonner'
import type { Event, EventCategory } from '@/types/event'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

// Events list
const events = ref<Event[]>([])
const loading = ref<boolean>(true)
const error = ref<string>('')
const showEventDialog = ref<boolean>(false) // Renamed from showEventForm to showEventDialog
const isEditing = ref<boolean>(false)
const currentEvent = ref<Event | null>(null)
const showDeleteConfirm = ref<boolean>(false)
const eventToDelete = ref<number | null>(null)

// Sample categories for filtering
const categories: EventCategory[] = [
  { value: 'conference', label: 'Conferences' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'concert', label: 'Concerts' },
  { value: 'exhibition', label: 'Exhibitions' },
  { value: 'seminar', label: 'Seminars' }
]

onMounted(async () => {
  try {
    setTimeout(() => {
      events.value = [
        {
          id: 1,
          title: 'Tech Conference 2025',
          description: 'Join us for the biggest tech conference of the year featuring workshops, keynotes, and networking opportunities.',
          date: '2025-06-15',
          time: '09:00 AM',
          endDate: '2025-06-17',
          endTime: '05:00 PM',
          location: 'Dubai Convention Center',
          address: '1 Convention Center Blvd, Dubai Financial District',
          category: 'conference',
          organizer: 'Tech United',
          organizerEmail: 'info@techunited.org',
          organizerPhone: '+971-4-123-4567',
          image: 'https://placehold.co/600x400/3498db/FFFFFF?text=Tech+Conference',
          attendees: 350,
          capacity: 500,
          price: 199,
          agenda: [
            { time: '09:00 AM', title: 'Registration & Welcome Coffee' },
            { time: '10:00 AM', title: 'Opening Keynote: Future of Technology' }
          ],
          speakers: [
            { name: 'Sarah Johnson', title: 'CTO, TechGiant Inc.', image: 'https://placehold.co/200x200/3498db/FFFFFF?text=SJ' },
            { name: 'Ahmed Al-Farsi', title: 'AI Research Director', image: 'https://placehold.co/200x200/3498db/FFFFFF?text=AA' }
          ]
        },
        {
          id: 2,
          title: 'Digital Marketing Workshop',
          description: 'Learn the latest strategies in digital marketing with hands-on training sessions.',
          date: '2025-07-10',
          time: '10:00 AM',
          endDate: '2025-07-10',
          endTime: '04:00 PM',
          location: 'Business Bay Training Center',
          address: '27 Business Bay Rd, Dubai',
          category: 'workshop',
          organizer: 'Marketing Pros',
          organizerEmail: 'workshops@marketingpros.com',
          organizerPhone: '+971-4-987-6543',
          image: 'https://placehold.co/600x400/27ae60/FFFFFF?text=Marketing+Workshop',
          attendees: 45,
          capacity: 60,
          price: 99,
          agenda: [
            { time: '10:00 AM', title: 'Introduction to Digital Marketing' },
            { time: '11:00 AM', title: 'SEO & Content Strategy' }
          ],
          speakers: [
            { name: 'Michael Chang', title: 'Digital Marketing Director', image: 'https://placehold.co/200x200/27ae60/FFFFFF?text=MC' }
          ]
        }
      ]
      loading.value = false
      toast.success('Events loaded successfully', {
        description: 'You can now manage your events'
      })
    }, 800)
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
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Set today as default date
    time: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00',
    location: '',
    address: '',
    category: 'conference',
    organizer: '',
    organizerEmail: '',
    organizerPhone: '',
    image: '',
    price: 0,
    attendees: 0,
    capacity: 100, // Set reasonable default
    agenda: [{ time: '', title: '' }],
    speakers: [{ name: '', title: '', image: '' }]
  }
  isEditing.value = false
  showEventDialog.value = true
}

// Edit existing event
const editEvent = (event: Event) => {
  currentEvent.value = { ...event }
  isEditing.value = true
  showEventDialog.value = true
  
  toast.info('Editing event', {
    description: `You are now editing: ${event.title}`
  })
}

// Delete event
const deleteEvent = (id: number) => {
  eventToDelete.value = id
  showDeleteConfirm.value = true
}

// Confirm delete
const confirmDelete = () => {
  if (eventToDelete.value === null) return
  
  const index = events.value.findIndex(event => event.id === eventToDelete.value)
  if (index !== -1) {
    events.value.splice(index, 1)
    toast.success('Event deleted', {
      description: 'Event has been successfully deleted'
    })
  }
  
  showDeleteConfirm.value = false
  eventToDelete.value = null
}

// Save event (create or update)
const saveEvent = async (eventData: Event) => {
  try {
    setTimeout(() => {
      if (isEditing.value) {
        const index = events.value.findIndex(e => e.id === eventData.id)
        if (index !== -1) {
          events.value[index] = { ...eventData }
          toast.success('Event updated', {
            description: `${eventData.title} has been successfully updated`
          })
        }
      } else {
        const newEvent = {
          ...eventData,
          id: Math.max(0, ...events.value.map(e => e.id)) + 1
        }
        events.value.push(newEvent)
        toast.success('Event created', {
          description: `${newEvent.title} has been successfully created`
        })
      }
      
      showEventDialog.value = false
      currentEvent.value = null
    }, 800)
  } catch (err) {
    toast.error(`Failed to ${isEditing.value ? 'update' : 'create'} event`, {
      description: 'Please try again later'
    })
  }
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
                    <img class="h-10 w-10 rounded-full object-cover" :src="event.image" :alt="event.title" />
                  </div>
                  <div class="ml-4">
                    <div class="font-medium">
                      {{ event.title }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ event.location }}
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
                  {{ event.category.charAt(0).toUpperCase() + event.category.slice(1) }}
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
      
      <!-- Empty State -->
      <div v-if="events.length === 0" class="text-center py-10">
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
                  v-model="currentEvent.title"
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
                  <option v-for="category in categories" :key="category.value" :value="category.value">
                    {{ category.label }}
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
                <label for="endDate" class="block text-sm font-medium mb-1">End Date</label>
                <input
                  id="endDate"
                  v-model="currentEvent.endDate"
                  type="date"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="endTime" class="block text-sm font-medium mb-1">End Time</label>
                <input
                  id="endTime"
                  v-model="currentEvent.endTime"
                  type="time"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="location" class="block text-sm font-medium mb-1">Location Name</label>
                <input
                  id="location"
                  v-model="currentEvent.location"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="address" class="block text-sm font-medium mb-1">Address</label>
                <input
                  id="address"
                  v-model="currentEvent.address"
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
          
          <!-- Organizer Information -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Organizer Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="organizer" class="block text-sm font-medium mb-1">Organizer Name</label>
                <input
                  id="organizer"
                  v-model="currentEvent.organizer"
                  type="text"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="organizerEmail" class="block text-sm font-medium mb-1">Email</label>
                <input
                  id="organizerEmail"
                  v-model="currentEvent.organizerEmail"
                  type="email"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label for="organizerPhone" class="block text-sm font-medium mb-1">Phone</label>
                <input
                  id="organizerPhone"
                  v-model="currentEvent.organizerPhone"
                  type="tel"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
            </div>
          </div>
          
          <!-- Event Agenda -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Agenda</h3>
            <Card v-for="(item, index) in currentEvent.agenda" :key="index" class="mb-3">
              <CardContent class="p-3 flex space-x-4">
                <div class="w-1/3">
                  <label :for="`agenda-time-${index}`" class="block text-sm font-medium mb-1">Time</label>
                  <input
                    :id="`agenda-time-${index}`"
                    v-model="item.time"
                    type="text"
                    placeholder="Time (e.g., 10:00 AM)"
                    class="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  />
                </div>
                <div class="flex-1">
                  <label :for="`agenda-title-${index}`" class="block text-sm font-medium mb-1">Activity</label>
                  <input
                    :id="`agenda-title-${index}`"
                    v-model="item.title"
                    type="text"
                    placeholder="Activity title"
                    class="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  />
                </div>
                <div class="flex items-end">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    @click="currentEvent.agenda.splice(index, 1)"
                    :disabled="currentEvent.agenda.length <= 1"
                    class="h-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Button 
              type="button" 
              variant="outline" 
              class="mt-2"
              @click="currentEvent.agenda.push({ time: '', title: '' })"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Agenda Item
            </Button>
          </div>
          
          <!-- Event Speakers -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Speakers</h3>
            <Card v-for="(speaker, index) in currentEvent.speakers" :key="index" class="mb-4">
              <CardContent class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label :for="`speaker-name-${index}`" class="block text-sm font-medium mb-1">Name</label>
                    <input
                      :id="`speaker-name-${index}`"
                      v-model="speaker.name"
                      type="text"
                      class="w-full px-3 py-2 border border-input rounded-md bg-background"
                      required
                    />
                  </div>
                  
                  <div>
                    <label :for="`speaker-title-${index}`" class="block text-sm font-medium mb-1">Title/Position</label>
                    <input
                      :id="`speaker-title-${index}`"
                      v-model="speaker.title"
                      type="text"
                      class="w-full px-3 py-2 border border-input rounded-md bg-background"
                      required
                    />
                  </div>
                  
                  <div>
                    <label :for="`speaker-image-${index}`" class="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      :id="`speaker-image-${index}`"
                      v-model="speaker.image"
                      type="text"
                      class="w-full px-3 py-2 border border-input rounded-md bg-background"
                      placeholder="https://example.com/speaker.jpg"
                      required
                    />
                  </div>
                </div>
                
                <div class="flex justify-end mt-4">
                  <Button 
                    type="button" 
                    variant="destructive"
                    size="sm" 
                    @click="currentEvent.speakers.splice(index, 1)"
                    :disabled="currentEvent.speakers.length <= 1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Speaker
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Button 
              type="button" 
              variant="outline" 
              class="mt-2"
              @click="currentEvent.speakers.push({ name: '', title: '', image: '' })"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Speaker
            </Button>
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