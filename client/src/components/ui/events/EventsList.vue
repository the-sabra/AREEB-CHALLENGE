<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type {  Event, EventCategory, DateFilterOption } from '@/types/event'

const router = useRouter()
const events = ref<Event[]>([])
const filteredEvents = ref<Event[]>([])
const loading = ref<boolean>(true)
const error = ref<string>('')
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('all')
const dateFilter = ref<string>('all') // 'all', 'upcoming', 'today', 'thisWeek', 'thisMonth'

// Date range picker state
const showRangeCalendar = ref<boolean>(false)
const dateRange = ref<{start?: Date, end?: Date}>({})
const formattedDateRange = computed(() => {
  if (!dateRange.value.start) return 'Filter'
  
  const fromDate = dateRange.value.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  
  if (!dateRange.value.end) return `From ${fromDate}`
  
  const toDate = dateRange.value.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fromDate} - ${toDate}`
})

// Sample categories for filtering
const categories: EventCategory[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'conference', label: 'Conferences' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'concert', label: 'Concerts' },
  { value: 'exhibition', label: 'Exhibitions' },
  { value: 'seminar', label: 'Seminars' }
]

// Get icon for each category
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    conference: 'users',
    workshop: 'briefcase',
    concert: 'volume-2',
    exhibition: 'image',
    seminar: 'book'
  }
  return iconMap[category] || 'tag'
}

onMounted(async () => {
  try {
    // TODO: Add API call to fetch events
    // const response = await fetch('/api/events')
    // events.value = await response.json()
    
    // For now, use sample data with a slight delay to simulate API call
    setTimeout(() => {
      events.value = [ 
        {
        id: 1,
        title: 'Tech Conference 2023',
        description: 'Join us for the annual Tech Conference where industry leaders share insights and trends.',
        date: '2023-10-15',
        time: '10:00 AM - 5:00 PM',
        endDate: '2023-10-15',
        endTime: '5:00 PM',
        location: 'San Francisco, CA',
        address: '123 Tech St, San Francisco, CA 94103',
        image: 'https://placehold.co/600x400/3498db/FFFFFF?text=Tech+Conference',
        category: 'conference',
        price: 19,
        attendees: 150,
        capacity: 300,
        organizer: 'Tech Corp',
        tags: ['technology', 'networking', 'innovation'], 
        }, 
      ] 
      
      // Initialize filtered events with all events
      filterEvents()
      loading.value = false
      toast.success('Events loaded', {
        description: 'Browse upcoming events and register for those you like!'
      })
    }, 800)
  } catch (err) {
    error.value = 'Failed to load events. Please try again later.'
    toast.error('Failed to load events', {
      description: 'Please try again later.'
    })
    loading.value = false
  }
})

// Filter events based on search query, category, and date filter
const filterEvents = () => {
  if (!events.value.length) return
  
  filteredEvents.value = events.value.filter(event => {
    // Check if the event matches the search query
    const matchesSearch = searchQuery.value === '' || 
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      event.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Check if the event matches the selected category
    const matchesCategory = selectedCategory.value === 'all' || 
      event.category === selectedCategory.value
    
    // Check if the event matches the date filter
    let matchesDateFilter = true
    const eventDate = new Date(event.date)
    const today = new Date()
    
    if (dateFilter.value !== 'all') {
      matchesDateFilter = 
        (dateFilter.value === 'today' && isToday(eventDate)) ||
        (dateFilter.value === 'thisWeek' && isThisWeek(eventDate)) ||
        (dateFilter.value === 'thisMonth' && isThisMonth(eventDate)) ||
        (dateFilter.value === 'upcoming' && eventDate > today)
    }
    
    // Check if the event falls within the selected date range
    let matchesDateRange = true
    if (dateRange.value.start) {
      // Set time to start of day for comparison
      const fromDate = new Date(dateRange.value.start)
      fromDate.setHours(0, 0, 0, 0)
      
      // If only from date is selected
      if (!dateRange.value.end) {
        matchesDateRange = eventDate >= fromDate
      } else {
        // If both from and to dates are selected
        const toDate = new Date(dateRange.value.end)
        toDate.setHours(23, 59, 59, 999) // End of day
        matchesDateRange = eventDate >= fromDate && eventDate <= toDate
      }
    }
    
    return matchesSearch && matchesCategory && matchesDateFilter && matchesDateRange
  })
  
  // Sort events by date (nearest first)
  filteredEvents.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Handle date range update
const handleDateRangeUpdate = (range: {start?: Date, end?: Date}) => {
  dateRange.value = range
  filterEvents()
}

// Clear date range
const clearDateRange = () => {
  dateRange.value = {}
  filterEvents()
  showRangeCalendar.value = false
}

// Helper functions for date filtering
const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const isThisWeek = (date: Date) => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return date >= startOfWeek && date <= endOfWeek
}

const isThisMonth = (date: Date) => {
  const today = new Date()
  return date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// Watch for changes in search query, category, and date filter
watch([searchQuery, selectedCategory, dateFilter], () => {
  filterEvents()
})

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Navigate to event details
const viewEvent = (eventId: number) => {
  router.push(`/events/${eventId}`)
}

// Calculate availability percentage
const calculateAvailability = (attendees: number, capacity: number) => {
  return Math.round((attendees / capacity) * 100)
}

// Calculate if an event is almost sold out (more than 80% full)
const isAlmostSoldOut = (attendees: number, capacity: number) => {
  return (attendees / capacity) > 0.8
}

// Get availability status and color
const getAvailabilityStatus = (attendees: number, capacity: number) => {
  const percentage = (attendees / capacity) * 100
  if (percentage >= 90) return { text: 'Almost Full', color: 'bg-red-500' }
  if (percentage >= 75) return { text: 'Filling Up', color: 'bg-orange-500' }
  if (percentage >= 50) return { text: 'Going Well', color: 'bg-yellow-500' }
  return { text: 'Available', color: 'bg-green-500' }
}

// Set up click outside for range calendar dropdown
const setupClickOutside = () => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    // Check if click is outside of the calendar dropdown
    if (showRangeCalendar.value && !target.closest('.range-calendar-container')) {
      showRangeCalendar.value = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
}

setupClickOutside()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
        <i class="pi pi-calendar-plus mr-3 text-primary"></i>
        Upcoming Events
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Discover and join exciting events in your area</p>
    </div>
    
    <!-- Filter and Search -->
    <Card class="mb-8">
      <CardContent class="p-5">
        <!-- Search and Date Filter Row -->
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <!-- Search Box -->
          <div class="relative flex-1">
            <i class="pi pi-search absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search events..."
              class="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <!-- Date Range Picker -->
          <div class="relative range-calendar-container w-full md:w-auto md:min-w-[220px]">
            <Button 
              variant="outline" 
              class="w-full h-full justify-start"
              @click="showRangeCalendar = !showRangeCalendar"
            >
              <i class="pi pi-calendar mr-2 flex-shrink-0"></i>
              <span class="truncate">{{ formattedDateRange }}</span>
            </Button>
            
            <!-- Calendar Dropdown -->
            <div 
              v-if="showRangeCalendar" 
              class="absolute z-50 mt-2 bg-background border border-input shadow-lg rounded-md overflow-hidden right-0"
              style="width: 300px"
            >
              <div class="p-3">
                <RangeCalendar
                  v-model="(dateRange) as any" 
                  :numberOfMonths="2"
                  @update:model-value="(handleDateRangeUpdate as any)"
                />
                <div class="flex justify-between mt-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    @click="clearDateRange()"
                  >
                    <i class="pi pi-times mr-1"></i>
                    Clear
                  </Button>
                  <Button 
                    size="sm" 
                    @click="showRangeCalendar = false"
                  >
                    <i class="pi pi-check mr-1"></i>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Category Filter -->
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="category in categories"
            :key="category.value"
            :variant="selectedCategory === category.value ? 'default' : 'outline'"
            @click="selectedCategory = category.value"
            class="whitespace-nowrap"
            size="sm"
          >
            <i :class="`pi pi-${getCategoryIcon(category.value)} mr-1`" v-if="category.value !== 'all'"></i>
            <i class="pi pi-list mr-1" v-else></i>
            {{ category.label }}
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-primary">
        <i class="pi pi-spin pi-spinner mr-2 text-xl"></i>
        Loading events...
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-center">
      <i class="pi pi-exclamation-circle mr-2 text-lg"></i>
      {{ error }}
    </div>
    
    <!-- No Results -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-16">
      <i class="pi pi-inbox text-gray-400 text-6xl mb-4"></i>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">No events found</h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Try changing your search or filter criteria</p>
    </div>
    
    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <!-- Event Image -->
        <div class="relative">
          <img :src="event.image" :alt="event.title" class="w-full h-48 object-cover" />
          <!-- Category Badge -->
          <Badge class="absolute top-4 left-4 flex items-center">
            <i :class="`pi pi-${getCategoryIcon(event.category)} mr-1`"></i>
            {{ event.category.charAt(0).toUpperCase() + event.category.slice(1) }}
          </Badge>
          <!-- Almost Sold Out Badge -->
          <Badge v-if="isAlmostSoldOut(event.attendees, event.capacity)" variant="destructive" class="absolute top-4 right-4 flex items-center">
            <i class="pi pi-exclamation-circle mr-1"></i>
            Almost Sold Out
          </Badge>
        </div>
        
        <!-- Event Info -->
        <CardContent class="p-5">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-bold truncate" :title="event.title">
                {{ event.title }}
              </h3>
              <p class="text-muted-foreground text-sm flex items-center">
                <i class="pi pi-calendar mr-1"></i>
                {{ formatDate(event.date) }} • {{ event.time }}
              </p>
            </div>
            <div class="text-xl font-bold text-primary flex items-center">
              <i class="pi pi-dollar mr-1"></i>${{ event.price }}
            </div>
          </div>
          
          <p class="text-foreground mb-4 line-clamp-2" :title="event.description">
            {{ event.description }}
          </p>
          
          <!-- Location -->
          <div class="flex items-center text-muted-foreground text-sm mb-4">
            <i class="pi pi-map-marker mr-1"></i>
            {{ event.location }}
          </div>
          
          <!-- Availability -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-muted-foreground flex items-center">
                <i class="pi pi-users mr-1"></i>
                Availability
              </span>
              <Badge :class="getAvailabilityStatus(event.attendees, event.capacity).color" variant="outline">
                {{ getAvailabilityStatus(event.attendees, event.capacity).text }}
              </Badge>
            </div>
            <div class="bg-muted rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full" 
                :style="`width: ${calculateAvailability(event.attendees, event.capacity)}%`"
              ></div>
            </div>
            <div class="text-xs text-muted-foreground text-right mt-1">
              {{ event.attendees }} / {{ event.capacity }} spots taken
            </div>
          </div>
          
          <Button @click="viewEvent(event.id)" class="w-full justify-center">
            <i class="pi pi-eye mr-2"></i>
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>