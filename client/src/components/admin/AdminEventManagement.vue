<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileUpload, FileUploadGrid } from '@/components/ui/file-upload'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { toast } from 'vue-sonner'
import type { Category, CategoryResponse, ApiEvent, EventListResponse, Tag, AddEvent } from '@/types/event'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
// Add imports for Combobox components
import { 
  Combobox, 
  ComboboxAnchor, 
  ComboboxInput, 
  ComboboxList, 
  ComboboxEmpty, 
  ComboboxGroup, 
  ComboboxItem 
} from '@/components/ui/combobox'
// Add imports for TagsInput components
import { 
  TagsInput, 
  TagsInputItem, 
  TagsInputItemDelete, 
  TagsInputItemText, 
  TagsInputInput 
} from '@/components/ui/tags-input'

import {
  Pagination,
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
const newEvent = ref<AddEvent | null>(null)
const showDeleteConfirm = ref<boolean>(false)
const eventToDelete = ref<number | null>(null)
const imagePreview = ref<string | null>(null) // Add this for image preview

const categories = ref<Category[]>([]);

const tags = ref<Tag[]>([])
const selectedTags = ref<string[]>([])
const searchTerm = ref('')
const open = ref(false)

// Add a computed property to filter tags based on search term
const filteredTags = computed(() => {
  if (!searchTerm.value) return tags.value
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

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
  }
}

async function getTags() {
  try {
    const tagResponse = await api.get<{ tags: Tag[]}>('/events/tags')
    tags.value = tagResponse.tags;
  } catch (err) {
    console.error('Failed to load tags:', err);
  }
}

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
    await getTags()
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
  newEvent.value = {
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Set today as default date
    time: '12:00', // Set default time
    location_link: '',
    image: null,
    price: 0,
    capacity: 100, // Set reasonable default
    attendees: 0,
    categoryId: 1, // Default category ID
    venue: '',
    isBooked: false,
    category_id: 1, // Default category ID
    tags: [] // Empty tags array
  }
  currentEvent.value = newEvent.value as unknown as ApiEvent
  isEditing.value = false
  showEventDialog.value = true
  selectedTags.value = []
  imagePreview.value = null // Reset image preview
}

// Edit existing event
const editEvent = (event: ApiEvent) => {
  currentEvent.value = { ...event }
  isEditing.value = true
  showEventDialog.value = true
  selectedTags.value = event.tags?.map(tag => tag.name) || []
  
  // Set image preview from existing image URL if available
  imagePreview.value = event.imageUrl || null
  
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
const confirmDelete = async () => {
   await api.delete(`/events/${eventToDelete.value }`, {
    requiresAuth: true
  })
  
  toast.success('Event deleted successfully', {
    description: 'The event has been deleted'
  })
  await fetchData()
  showDeleteConfirm.value = false
  eventToDelete.value = null
}

// Save event (create or update)
const saveEvent = async (eventData: ApiEvent | AddEvent) => {
  try {
    loading.value = true
      if (isEditing.value && 'id' in eventData) {
      // Update existing event
      const formData = new FormData()
      
      // Add basic event details
      formData.append('name', eventData.name)
      formData.append('description', eventData.description)
      formData.append('date', eventData.date)
      formData.append('time', eventData.time || '12:00') // Add time field with fallback
      formData.append('venue', eventData.venue)
      formData.append('location_link', eventData.location_link)
      formData.append('capacity', eventData.capacity.toString())
      formData.append('price', eventData.price.toString())
      formData.append('category_id', (eventData.categoryId || eventData.category_id).toString())
      
      // Add image if provided
      if (eventData.image instanceof File) {
        formData.append('image', eventData.image)
      }
      
      // Add tags if any
      if (Array.isArray(selectedTags.value) && selectedTags.value.length > 0) {
        // Get tag IDs from selected tag names
        const selectedTagObjects = tags.value.filter(tag => selectedTags.value.includes(tag.name))
        selectedTagObjects.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag.id.toString())
        })
      }
      
      // Make API request
      const response = await api.put(`/events/${eventData.id}`, formData, {
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Show success message
      toast.success('Event updated successfully', {
        description: `Your event "${eventData.name}" has been updated`
      })
      
      // Refresh the events list
      await fetchData()
    } else {
      // Create new event
      const formData = new FormData()
        // Add basic event details
      formData.append('name', eventData.name)
      formData.append('description', eventData.description)
      formData.append('date', eventData.date)
      formData.append('time', eventData.time || '12:00') // Add time field with fallback
      formData.append('venue', eventData.venue)
      formData.append('location_link', eventData.location_link)
      formData.append('capacity', eventData.capacity.toString())
      formData.append('price', eventData.price.toString())
      formData.append('category_id', (eventData.categoryId || eventData.category_id).toString())
      
      // Add image if provided
      if (eventData.image instanceof File) {
        formData.append('image', eventData.image)
      }
      
      // Add tags if any
      if (Array.isArray(selectedTags.value) && selectedTags.value.length > 0) {
        // Get tag IDs from selected tag names
        const selectedTagObjects = tags.value.filter(tag => selectedTags.value.includes(tag.name))
        selectedTagObjects.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag.id.toString())
        })
      }
      
      // Make API request
      const response = await api.post('/events', formData, {
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Show success message
      toast.success('Event created successfully', {
        description: `Your event "${eventData.name}" has been created`
      })
      
      // Refresh the events list
      await fetchData()
    }
    
    // Close the dialog
    showEventDialog.value = false
    currentEvent.value = null
      } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to save event'
    toast.error(isEditing.value ? 'Error updating event' : 'Error creating event', {
      description: errorMessage
    })
    console.error('Error saving event:', error)
  } finally {
    loading.value = false
  }
}

// Cancel form
const cancelForm = () => {
    showEventDialog.value = false
    currentEvent.value = null
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


// Add a function to handle tag selection
const handleTagSelection = (tagName: string) => {
  if (!selectedTags.value.includes(tagName)) {
    selectedTags.value.push(tagName)
  }
  searchTerm.value = ''
  
  if (currentEvent.value) {
    const selectedTagObjects = tags.value.filter(tag => 
      selectedTags.value.includes(tag.name)
    )
    currentEvent.value.tags = selectedTagObjects
  }
}

// Add a function to remove tags
const removeTag = (tagName: string) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tagName)
  
  if (currentEvent.value) {
    const selectedTagObjects = tags.value.filter(tag => 
      selectedTags.value.includes(tag.name)
    )
    currentEvent.value.tags = selectedTagObjects
  }
}

// Handle image file selection
const handleImageChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    // Store the file in the event data
    if (currentEvent.value) {
      currentEvent.value.image = input.files[0];
    }
    
    // Create a preview URL
    imagePreview.value = URL.createObjectURL(input.files[0]);
  }
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
                      v-if="event.imageUrl"
                      :src="event.imageUrl" 
                      class="h-10 w-10 rounded-full object-cover" 
                      :alt="event.name" 
                    />
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
      <DialogTitle class="text-xl">{{ isEditing ? 'Edit Event' : 'Create New Event' }}</DialogTitle>
      <DialogDescription>
      Fill in the details below to {{ isEditing ? 'update your' : 'create a new' }} event.
      </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="saveEvent(currentEvent)" class="space-y-8 mt-6 max-h-[70vh] overflow-y-auto pr-2" v-if="currentEvent">
      <!-- Basic Information Section -->
      <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold">Event Details</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
        <label for="title" class="block text-sm font-medium">Event Title <span class="text-destructive">*</span></label>
        <input
        id="title"
        v-model="currentEvent.name"
        type="text"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="Enter a catchy title"
        required
        />
        <p class="text-xs text-muted-foreground">Choose a clear, descriptive name for your event</p>
        </div>
        
        <div class="space-y-2">
        <label for="category" class="block text-sm font-medium">Category <span class="text-destructive">*</span></label>
        <select
        id="category"
        v-model="currentEvent.categoryId"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        required
        >
        <option disabled value="">Select a category</option>
        <option v-for="category in categories.filter(c => c.id !== 0)" :key="category.id" :value="category.id">
        {{ category.name }}
        </option>
        </select>
        <p class="text-xs text-muted-foreground">Categorize your event to help attendees find it</p>
        </div>
      </div>
      </div>

      <!-- Tags Section -->
      <div class="space-y-6">
        <div class="flex items-center gap-2 pb-2 border-b">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
          <h3 class="text-lg font-semibold">Event Tags</h3>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium">Tags</label>
          <p class="text-xs text-muted-foreground mb-2">Add tags to help categorize your event (e.g., "Technology", "Workshop")</p>
          
          <div class="relative">
            <TagsInput class="w-full rounded-md border border-input px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
              <TagsInputItem 
                v-for="tagName in selectedTags" 
                :key="tagName" 
                :value="tagName"
                class="inline-flex items-center bg-muted text-muted-foreground rounded-md px-2 py-1 text-sm"
              >
                <TagsInputItemText class="mr-1">{{ tagName }}</TagsInputItemText>
                <TagsInputItemDelete 
                  @click="removeTag(tagName)"
                  class="text-muted-foreground/50 hover:text-muted-foreground" 
                />
              </TagsInputItem>
              
              <TagsInputInput 
                v-model="searchTerm"
                placeholder="Type to search tags..." 
                class="outline-none bg-transparent flex-1 min-w-[120px]"
                @click="open = true"
                @keydown.enter.prevent="
                  if (searchTerm && filteredTags.length > 0) {
                    handleTagSelection(filteredTags[0].name);
                    searchTerm = '';
                  }
                "
              />
            </TagsInput>
            
            <div 
              v-if="open && filteredTags.length > 0" 
              class="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-md"
            >
              <ul class="py-1 max-h-60 overflow-auto">
                <li 
                  v-for="tag in filteredTags" 
                  :key="tag.id"
                  class="px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                  @click="handleTagSelection(tag.name); open = false"
                >
                  {{ tag.name }}
                </li>
                <li v-if="filteredTags.length === 0" class="px-2 py-1.5 text-sm text-muted-foreground">
                  No tags found
                </li>
              </ul>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">Click on a tag to add it, or press Enter to add the first matching tag</p>
        </div>
      </div>
      
      <!-- Date and Location Section -->
      <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold">Date & Location</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
        <label for="date" class="block text-sm font-medium">Date <span class="text-destructive">*</span></label>
        <input
        id="date"
        v-model="currentEvent.date"
        type="date"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        required
        />
        </div>
        
        <div class="space-y-2">
        <label for="time" class="block text-sm font-medium">Time <span class="text-destructive">*</span></label>
        <input
        id="time"
        v-model="currentEvent.time"
        type="time"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        required
        />
        </div>
        
        <div class="space-y-2">
        <label for="location" class="block text-sm font-medium">Venue Name <span class="text-destructive">*</span></label>
        <input
        id="location"
        v-model="currentEvent.location_link"
        type="text"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="e.g. Conference Center, Virtual"
        required
        />
        </div>
        
        <div class="space-y-2">
        <label for="address" class="block text-sm font-medium">Address <span class="text-destructive">*</span></label>
        <input
        id="address"
        v-model="currentEvent.venue"
        type="text"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="Full address or online link"
        required
        />
        </div>
      </div>
      </div>
      
      <!-- Capacity & Pricing Section -->
      <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold">Capacity & Pricing</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
        <label for="price" class="block text-sm font-medium">Price ($) <span class="text-destructive">*</span></label>
        <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
        <input
        id="price"
        v-model.number="currentEvent.price"
        type="number"
        min="0"
        step="0.01"
        class="w-full pl-7 pr-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="0.00"
        required
        />
        </div>
        <p class="text-xs text-muted-foreground">Set to 0 for free events</p>
        </div>
        
        <div class="space-y-2">
        <label for="capacity" class="block text-sm font-medium">Capacity <span class="text-destructive">*</span></label>
        <input
        id="capacity"
        v-model.number="currentEvent.capacity"
        type="number"
        min="1"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="Maximum number of attendees"
        required
        />
        <p class="text-xs text-muted-foreground">Maximum number of attendees allowed</p>
        </div>
      </div>
      </div>
      
      <!-- Image Upload Section -->
      <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold">Event Image</h3>
      </div>
      
      <div class="space-y-4">        <!-- Current image preview when editing -->
        <div v-if="isEditing && currentEvent.imageUrl" class="flex flex-col items-center p-4 border border-input rounded-md bg-muted/20">
        <img :src="currentEvent.imageUrl" alt="Current event image" class="h-40 object-cover rounded-md mb-2" />
        <p class="text-sm text-muted-foreground">Current image</p>
        </div>
        
        <div class="space-y-2">
          <label for="image-upload" class="block text-sm font-medium">Upload Image</label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            class="w-full px-3 py-2 border border-input rounded-md bg-background"
            @change="handleImageChange"
          />
          <p class="text-xs text-muted-foreground">Upload a high-quality image for your event (JPG, PNG)</p>
        </div>
        
        <!-- Image preview -->
        <div v-if="imagePreview" class="mt-4 flex flex-col items-center">
          <img :src="imagePreview" alt="Selected event image" class="h-40 object-cover rounded-md" />
          <p class="text-sm text-muted-foreground mt-2">Preview of selected image</p>
        </div>
      </div>
      </div>
      
      <!-- Description Section -->
      <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold">Description</h3>
      </div>
      
      <div class="space-y-2">
        <label for="description" class="block text-sm font-medium">Event Description <span class="text-destructive">*</span></label>
        <textarea
        id="description"
        v-model="currentEvent.description"
        rows="5"
        class="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="Provide a detailed description of your event..."
        required
        ></textarea>
        <p class="text-xs text-muted-foreground">Include information about what attendees can expect from your event</p>
      </div>
      </div>
      
      <DialogFooter class="pt-6 border-t border-border">
      <div class="flex items-center justify-between w-full">
        <p class="text-xs text-muted-foreground"><span class="text-destructive">*</span> Required fields</p>
        <div class="flex gap-2">
        <Button type="button" variant="outline" @click="cancelForm">
        Cancel
        </Button>
        <Button type="submit">
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isEditing ? 'Update Event' : 'Create Event' }}
        </Button>
        </div>
      </div>
      </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  </div>
</template>