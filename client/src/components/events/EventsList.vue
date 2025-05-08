<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { Category } from '@/types/event'
import type { Ref } from 'vue'
import { api } from '@/lib/api'

// Updated interfaces for API responses
interface ApiEvent {
  id: number
  title: string
  description: string
  date: string
  time: string
  location_link: string
  image: string
  price: number
  capacity: number
  attendees: number
  categoryId: number
  category: {
    id: number
    name: string
  }
  organizer: {
    id: number
    name: string
  }
}

interface EventListResponse {
  events: ApiEvent[]
}

interface CategoryResponse {
  categories: Category[]
}

const router = useRouter()
const events: Ref<ApiEvent[]> = ref([])
const filteredEvents = ref<ApiEvent[]>([])
const loading = ref<boolean>(true)
const error = ref<string>('')
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('All Categories') // Changed from 'all' to 'All Categories'
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

// Categories for filtering
const categories = ref<Category[]>([]);

// Fix the getCategories method syntax
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
    
    // Make sure 'All Categories' is selected by default
    selectedCategory.value = 'All Categories';
  } catch (err) {
    console.error('Failed to load categories:', err);
    toast.error('Failed to load categories');
  }
}

// Get category icon based on category value
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    music: 'music',
    sports: 'flag',
    conference: 'briefcase',
    workshop: 'cog',
    social: 'users',
    art: 'image',
    food: 'shopping-bag',
    technology: 'desktop',
    health: 'heart',
    business: 'briefcase',
    education: 'book',
    entertainment: 'video',
    charity: 'heart',
    all: 'list'
  }
  return iconMap[category] || 'tag'
}

onMounted(async () => {
  try {
    loading.value = true;
    await getCategories();
    const eventsResponse = await api.get<EventListResponse>('/events');
    
    if (eventsResponse && eventsResponse.events) {
      events.value = eventsResponse.events;
      filterEvents();
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    console.error('Error loading events:', err);
    error.value = 'Failed to load events. Please try again later.';
    toast.error('Failed to load events', {
      description: 'Please try again later.'
    });
  } finally {
    loading.value = false;
  }
})

// Filter events based on search query, category, and date filter
const filterEvents = () => {
  if (!events.value.length) {
    filteredEvents.value = [];
    return;
  }
  
  filteredEvents.value = events.value.filter(event => {
    // Check if the event matches the search query
    const matchesSearch = searchQuery.value === '' || 
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      event.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.location_link.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Check if the event matches the selected category
    const matchesCategory = selectedCategory.value === 'All Categories' || 
      event.category.name === selectedCategory.value;
    
    // Check if the event matches the date filter
    let matchesDateFilter = true
    const eventDate = new Date(event.date)
    
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
    
    return matchesSearch && matchesCategory && matchesDateFilter && matchesDateRange;
  });
  
  // Sort events by date (nearest first)
  filteredEvents.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
    <div class="mb-8 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <i class="pi pi-calendar-plus mr-3 text-primary"></i>
          Upcoming Events
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Discover and join exciting events in your area</p>
      </div>
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
            :key="category.id"
            :variant="selectedCategory === category.name ? 'default' : 'outline'"
            @click="selectedCategory = category.name"
            class="whitespace-nowrap"
            size="sm"
          >
            <i :class="`pi pi-${getCategoryIcon(category.name)} mr-1`" v-if="category.name !== 'all'"></i>
            <i class="pi pi-list mr-1" v-else></i>
            {{ category.name }}
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <!-- Loading State - Enhanced with better spinner -->
    <div v-if="loading" class="flex flex-col justify-center items-center py-20">
      <div class="relative w-16 h-16 mb-4">
        <div class="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
        <div class="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <div class="text-lg font-semibold text-primary">Loading events...</div>
      <p class="text-sm text-muted-foreground mt-2">Please wait while we fetch the latest events</p>
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
            <img 
            v-if="event.image"
            :src="event.image" 
            :alt="event.title" 
            class="w-full h-48 object-cover" 
            />
          <!-- Category Badge -->
          <Badge class="absolute top-4 left-4 flex items-center">
            <i :class="`pi pi-${getCategoryIcon(event.category?.name || 'all')} mr-1`"></i>
            {{ event.category?.name || 'Uncategorized' }}
          </Badge>
          <!-- Almost Sold Out Badge -->
          <Badge 
            v-if="event.capacity && isAlmostSoldOut(event.attendees || 0, event.capacity)" 
            variant="destructive" 
            class="absolute top-4 right-4 flex items-center"
          >
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
              {{ formatDate(event.date) }} {{ event.time ? '• ' + event.time : '' }}
              </p>
            </div>
            <div class="text-xl font-bold text-primary flex items-center">
              <span v-if="event.price > 0" class="text-xl">
              <i class="pi pi-dollar text-xl mr-1"></i>{{ event.price.toFixed(2) }}
              </span>
              <span v-else class="text-green-600">Free</span>
            </div>
            </div>
          
          <!-- Event description -->
          <p class="text-foreground mb-4 line-clamp-2" :title="event.description">
            {{ event.description || 'No description available' }}
          </p>
          
          <!-- Event details row -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <!-- Location -->
            <div class="flex items-center text-sm text-muted-foreground">
              <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                <i class="pi pi-map-marker text-primary"></i>
              </div>
              <span class="truncate">{{ event.location_link || 'Location TBD' }}</span>
            </div>
          </div>
          
          <!-- Availability -->
          <div v-if="event.capacity" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-muted-foreground flex items-center">
                <i class="pi pi-users mr-1"></i>
                Availability
              </span>
              <Badge 
                :class="getAvailabilityStatus(event.attendees || 0, event.capacity).color" 
                variant="outline"
              >
                {{ getAvailabilityStatus(event.attendees || 0, event.capacity).text }}
              </Badge>
            </div>
            <div class="bg-muted rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full" 
                :style="`width: ${calculateAvailability(event.attendees || 0, event.capacity)}%`"
              ></div>
            </div>
            <div class="text-xs text-muted-foreground text-right mt-1">
              {{ event.attendees || 0 }} / {{ event.capacity }} spots taken
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