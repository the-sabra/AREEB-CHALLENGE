<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { ApiEvent, Category, CategoryResponse, EventListResponse, Pagination } from '@/types/event'
import type { Ref } from 'vue'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
// Dialog state
const showTicketDialog = ref(false)
const currentEvent = ref<ApiEvent | null>(null)
const isLoadingTickets = ref(false)

// Pagination state
const currentPage = ref<number>(1)
const totalPages = ref<number>(1)
const totalCount = ref<number>(0)
const itemsPerPage = ref<number>(10)
const paginationInfo = ref<Pagination | null>(null)

const router = useRouter()
const events: Ref<ApiEvent[]> = ref([])
const filteredEvents = ref<ApiEvent[]>([])
const loading = ref<boolean>(true)
const error = ref<string>('')
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('All Categories') // Changed from 'all' to 'All Categories'
const ticketCount = ref<number|null>(null)
 
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
    
    // Make sure 'All Categories' is selected by default
    selectedCategory.value = 'All Categories';
  } catch (err) {
    console.error('Failed to load categories:', err);
    toast.error('Failed to load categories');
  }
}

async function ticketInfo(event: ApiEvent) {
  currentEvent.value = event
  showTicketDialog.value = true
  isLoadingTickets.value = true
  
  try {
    const ticketResponse = await api.get<{ticket_count:number}>(`/bookings/${event.id}`, { requiresAuth: true })
    ticketCount.value = ticketResponse.ticket_count
  } catch (err) {
    console.error('Error fetching ticket information:', err)
    console.log('Error fetching event/ticket information:', err)
    toast.error('Failed to load ticket information')
    ticketCount.value = null
  } finally {
    isLoadingTickets.value = false
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
    
    // Initialize pagination with first page
    currentPage.value = 1;
    
    // Prepare pagination parameters
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value
    };
    
    if(authStore.isAuthenticated) {
      const eventsResponse = await api.get<EventListResponse>('/events/authed', {
        requiresAuth: true,
        params
      });

      if (eventsResponse && eventsResponse.events) {
        events.value = eventsResponse.events;
        if (eventsResponse.pagination) {
          paginationInfo.value = eventsResponse.pagination;
          totalPages.value = eventsResponse.pagination.totalPages;
          totalCount.value = eventsResponse.pagination.totalCount;
        }
        filterEvents();
      } else {
        throw new Error('Invalid response format');
      }
      return;
    }

    const eventsResponse = await api.get<EventListResponse>('/events', { params });
    
    if (eventsResponse && eventsResponse.events) {
      events.value = eventsResponse.events;
      if (eventsResponse.pagination) {
        paginationInfo.value = eventsResponse.pagination;
        totalPages.value = eventsResponse.pagination.totalPages;
        totalCount.value = eventsResponse.pagination.totalCount;
      }
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
  
  // For client-side filtering (search, categories, date range)
  filteredEvents.value = events.value.filter(event => {
    // Check if the event matches the search query
    const matchesSearch = searchQuery.value === '' || 
      event.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      (event.tags && event.tags.some(tag => 
        tag.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      ));
    
    // Check if the event matches the selected category
    const matchesCategory = selectedCategory.value === 'All Categories' || 
      event.category.name === selectedCategory.value;
    
    // Check if the event matches the date filter
    let matchesDateFilter = true;
    
    // Check if the event falls within the selected date range
    let matchesDateRange = true;
    if (dateRange.value.start) {
      // Set time to start of day for comparison
      const fromDate = new Date(dateRange.value.start);
      fromDate.setHours(0, 0, 0, 0);
      
      // If only from date is selected
      if (!dateRange.value.end) {
        matchesDateRange = new Date(event.date) >= fromDate;
      } else {
        // If both from and to dates are selected
        const toDate = new Date(dateRange.value.end);
        toDate.setHours(23, 59, 59, 999); // End of day
        matchesDateRange = new Date(event.date) >= fromDate && new Date(event.date) <= toDate;
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
watch([searchQuery, selectedCategory], () => {
  filterEvents();
})

// Watch for changes in date range
watch(dateRange, () => {
  filterEvents();
}, { deep: true })

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Navigate to event details
const viewEvent = (eventId: number) => {
  if (showTicketDialog.value) {
    showTicketDialog.value = false
  }
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

// Handle pagination page changes
const changePage = async (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  
  currentPage.value = page;
  loading.value = true;
  
  try {
    // Show toast to indicate page change
    toast.info(`Loading page ${page}...`, {
      duration: 2000,
      position: 'bottom-right'
    });
    
    // Prepare pagination parameters
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value
    };
    
    if (authStore.isAuthenticated) {
      const eventsResponse = await api.get<EventListResponse>('/events/authed', {
        requiresAuth: true,
        params
      });
      
      if (eventsResponse && eventsResponse.events) {
        events.value = eventsResponse.events;
        if (eventsResponse.pagination) {
          paginationInfo.value = eventsResponse.pagination;
          totalPages.value = eventsResponse.pagination.totalPages;
          totalCount.value = eventsResponse.pagination.totalCount;
        }
        // Apply filters to the newly fetched data
        filterEvents();
      }
    } else {
      const eventsResponse = await api.get<EventListResponse>('/events', { params });
      
      if (eventsResponse && eventsResponse.events) {
        events.value = eventsResponse.events;
        if (eventsResponse.pagination) {
          paginationInfo.value = eventsResponse.pagination;
          totalPages.value = eventsResponse.pagination.totalPages;
          totalCount.value = eventsResponse.pagination.totalCount;
        }
        // Apply filters to the newly fetched data
        filterEvents();
      }
    }
    
    // Scroll to top of events section when navigating pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Error loading events:', err);
    error.value = 'Failed to load events. Please try again later.';
    toast.error('Failed to load events', {
      description: 'Please try again later.'
    });
  } finally {
    loading.value = false;
  }
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
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i class="pi pi-search text-gray-400"></i>
            </div>            
            <input
              type="text"
              v-model="searchQuery"
              @input="filterEvents"
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
    <div v-else class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
      <Card
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="overflow-hidden hover:shadow-lg transition-all duration-300 relative border-opacity-80 hover:border-primary flex flex-col"
      >
        <!-- Event Image -->
        <div class="relative">
            <img 
            v-if="event.imageUrl"
            :src="event.imageUrl" 
            :alt="event.name" 
            class="w-full h-52 object-cover transition-transform duration-500 hover:scale-105" 
            />
            <div v-else class="w-full h-52 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
              <i :class="`pi pi-${getCategoryIcon(event.category?.name || 'all')} text-primary text-4xl opacity-50`"></i>
            </div>
            
          <!-- Category Badge -->
          <Badge class="absolute top-4 left-4 flex items-center shadow-sm">
            <i :class="`pi pi-${getCategoryIcon(event.category?.name || 'all')} mr-1`"></i>
            {{ event.category?.name || 'Uncategorized' }}
          </Badge>
          
          <!-- Booked Badge (Top Right) -->
          <Badge 
            v-if="event.isBooked" 
            variant="default" 
            class="absolute -top-2 right-2 rounded-full bg-green-600 text-white flex items-center px-3 py-1 z-10 shadow-md"
          >
            <i class="pi pi-check mr-1"></i>
            BOOKED
          </Badge>
          
          <!-- Almost Sold Out Badge -->
          <Badge 
            v-if="!event.isBooked && event.capacity && isAlmostSoldOut(event.attendees || 0, event.capacity)" 
            variant="destructive" 
            class="absolute top-4 right-4 flex items-center shadow-sm"
          >
            <i class="pi pi-exclamation-circle mr-1"></i>
            Almost Sold Out
          </Badge>
        </div>
        
        <!-- Event Info -->
        <CardContent class="p-5 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-bold truncate" :title="event.name">
              {{ event.name }}
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
          
          <!-- Tags Section -->
          <div v-if="event.tags && event.tags.length > 0" class="mb-3 flex flex-wrap gap-1.5 min-h-[28px]">
            <Badge v-for="tag in event.tags" :key="tag.id" variant="secondary" class="px-2 py-0.5 text-xs">
              <i class="pi pi-tag mr-1 text-xs"></i>
              {{ tag.name }}
            </Badge>
          </div>
          <div v-else class="mb-3 min-h-[28px]"></div>
          
          <!-- Event description -->
            <div class="mb-4 p-3 bg-muted/40 rounded-md border border-border/50 min-h-[80px]">
            <div class="flex items-start">
              <i class="pi pi-info-circle text-primary mt-1 mr-2"></i>
              <p class="text-foreground line-clamp-2" :title="event.description">
              {{ event.description || 'No description available' }}
              </p>
            </div>
            </div>
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
          <div v-else class="mb-4 min-h-[55px]"></div>
          
          <!-- Spacer to push button to bottom -->
          <div class="flex-grow"></div>
          
          <!-- Action Button -->
          <Button 
            @click="event.isBooked ? ticketInfo(event) : (currentEvent = event, showTicketDialog = true)" 
            :class="{'bg-green-600 hover:bg-green-700': event.isBooked}" 
            class="w-full justify-center mt-2 font-medium"
          >
            <i class="pi" :class="event.isBooked ? 'pi-ticket mr-2' : 'pi-eye mr-2'"></i>
            {{ event.isBooked ? 'View Booking' : 'View Details' }}
          </Button>
        </CardContent>
      </Card>
    </div>  
      <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="mt-8">
      <div class="flex justify-center items-center gap-1">
        <!-- Previous Button -->
        <Button 
          variant="outline" 
          size="sm"
          class="flex items-center gap-1"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="pi pi-chevron-left"></i>
          <span class="hidden sm:inline">Previous</span>
        </Button>
        
        <!-- Page Numbers -->
        <div class="flex items-center">
          <!-- First Page -->
          <Button 
            variant="outline" 
            size="sm"
            class="mx-0.5"
            :class="{'bg-primary text-white': currentPage === 1}"
            @click="changePage(1)"
          >
            1
          </Button>
          
          <!-- Ellipsis if needed -->
          <span v-if="currentPage > 3" class="mx-1">...</span>
          
          <!-- Page before current if applicable -->
          <Button 
            v-if="currentPage > 2" 
            variant="outline" 
            size="sm"
            class="mx-0.5"
            @click="changePage(currentPage - 1)"
          >
            {{ currentPage - 1 }}
          </Button>
          
          <!-- Current page (if not first or last) -->
          <Button 
            v-if="currentPage !== 1 && currentPage !== totalPages" 
            variant="outline" 
            size="sm"
            class="mx-0.5 bg-primary text-white"
          >
            {{ currentPage }}
          </Button>
          
          <!-- Page after current if applicable -->
          <Button 
            v-if="currentPage < totalPages - 1" 
            variant="outline" 
            size="sm"
            class="mx-0.5"
            @click="changePage(currentPage + 1)"
          >
            {{ currentPage + 1 }}
          </Button>
          
          <!-- Ellipsis if needed -->
          <span v-if="currentPage < totalPages - 2" class="mx-1">...</span>
          
          <!-- Last Page -->
          <Button 
            v-if="totalPages > 1" 
            variant="outline" 
            size="sm"
            class="mx-0.5"
            :class="{'bg-primary text-white': currentPage === totalPages}"
            @click="changePage(totalPages)"
          >
            {{ totalPages }}
          </Button>
        </div>
        
        <!-- Next Button -->
        <Button 
          variant="outline" 
          size="sm"
          class="flex items-center gap-1"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <span class="hidden sm:inline">Next</span>
          <i class="pi pi-chevron-right"></i>
        </Button>
      </div>
      
      <!-- Pagination Info -->
      <div class="text-center text-sm text-muted-foreground mt-3">
        Showing page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} total events)
      </div>
    </div>
    
  </div>
  <!-- Ticket Information Dialog --> 
  <Dialog :open="showTicketDialog" @update:open="showTicketDialog = $event">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader>
        <DialogTitle class="text-xl flex items-center">
          <i class="pi pi-ticket text-green-600 mr-2"></i>
          Event & Booking Details
        </DialogTitle>
      </DialogHeader>
      
      <div class="py-6">
        <div v-if="isLoadingTickets" class="flex justify-center">
          <div class="relative w-10 h-10">
            <div class="absolute top-0 left-0 w-full h-full border-4 border-green-200 rounded-full"></div>
            <div class="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
          </div>
        </div>
          <div v-else-if="currentEvent" class="space-y-4">
          <!-- Event Details -->
          <div class="border border-border rounded-md overflow-hidden">
            <!-- Event Image -->
            <div v-if="currentEvent.imageUrl" class="relative w-full h-48">
              <img 
                :src="currentEvent.imageUrl"
                :alt="currentEvent.name"
                class="w-full h-full object-cover"
              />              <!-- Category Badge -->
              <Badge class="absolute top-4 left-4">
                <i :class="`pi pi-${getCategoryIcon(currentEvent.category?.name || 'all')} mr-1`"></i>
                {{ currentEvent.category?.name || 'Uncategorized' }}
              </Badge>
              <!-- Booked Badge -->
              <Badge 
                v-if="currentEvent.isBooked" 
                class="absolute top-4 right-4 bg-green-600 text-white"
              >
                <i class="pi pi-check-circle mr-1"></i>
                BOOKED
              </Badge>
            </div>
            
            <!-- Event Information -->
            <div class="p-4">
              <h3 class="font-bold text-xl mb-3">{{ currentEvent.name }}</h3>
              
              <!-- Tags Section -->
              <div v-if="currentEvent.tags && currentEvent.tags.length > 0" class="mb-3 flex flex-wrap gap-1.5">
                <Badge v-for="tag in currentEvent.tags" :key="tag.id" variant="secondary" class="px-2 py-0.5 text-xs">
                  <i class="pi pi-tag mr-1 text-xs"></i>
                  {{ tag.name }}
                </Badge>
              </div>
              
              <!-- Event Details Grid -->
              <div class="grid grid-cols-1 gap-3">
                <!-- Date & Time -->
                <div class="flex items-center text-sm">
                  <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <i class="pi pi-calendar text-primary"></i>
                  </div>
                  <span>{{ formatDate(currentEvent.date) }} {{ currentEvent.time ? '• ' + currentEvent.time : '' }}</span>
                </div>
                
                <!-- Location -->
                <div class="flex items-center text-sm">
                  <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <i class="pi pi-map-marker text-primary"></i>
                  </div>
                  <span>{{ currentEvent.location_link || 'Location TBD' }}</span>
                </div>
                
                  <!-- Description -->
                <div class="mt-2 p-3 bg-muted/30 rounded-md">
                  <div class="flex items-start">
                    <i class="pi pi-info-circle text-primary mt-1 mr-2"></i>
                    <p class="text-sm">{{ currentEvent.description || 'No description available' }}</p>
                  </div>
                </div>
                
                <!-- Tags -->
                <div v-if="currentEvent.tags && currentEvent.tags.length > 0" class="mt-3">
                  <div class="flex items-center mb-2">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <i class="pi pi-tags text-primary"></i>
                    </div>
                    <span class="text-sm font-medium">Tags</span>
                  </div>
                  <div class="ml-10 flex flex-wrap gap-1.5">
                    <Badge v-for="tag in currentEvent.tags" :key="tag.id" variant="secondary" class="px-2 py-0.5 text-xs">
                      <i class="pi pi-tag mr-1 text-xs"></i>
                      {{ tag.name }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Ticket Information -->
          <div v-if="currentEvent.isBooked" class="border border-border rounded-md p-4">
            <div class="text-center">
              <div class="mb-2 text-sm text-muted-foreground">Your Tickets</div>
              <div class="flex items-center justify-center gap-2">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-ticket text-green-600 text-lg"></i>
                </div>
                <div class="text-4xl font-bold text-green-600">{{ ticketCount }}</div>
              </div>
              <div class="text-sm text-muted-foreground mt-2">{{ ticketCount === 1 ? 'Ticket' : 'Tickets' }}</div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-border">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-muted-foreground">Event Price</span>
                <span class="font-medium">{{ currentEvent.price > 0 ? `$${currentEvent.price.toFixed(2)}` : 'Free' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-muted-foreground">Number of Tickets</span>
                <span class="font-medium">{{ ticketCount }}</span>
              </div>
              <div class="flex items-center justify-between font-bold mt-2">
                <span>Total Amount</span>
                <span class="text-lg text-primary">{{ currentEvent.price > 0 ? `$${(currentEvent.price * (ticketCount || 0)).toFixed(2)}` : 'Free' }}</span>
              </div>
            </div>
            
            <!-- Availability Information -->
            <div class="mt-4 pt-4 border-t border-border">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-muted-foreground flex items-center">
                  <i class="pi pi-users mr-1"></i>
                  Availability
                </span>
                <Badge 
                  :class="getAvailabilityStatus(currentEvent.attendees || 0, currentEvent.capacity).color" 
                  variant="outline"
                >
                  {{ getAvailabilityStatus(currentEvent.attendees || 0, currentEvent.capacity).text }}
                </Badge>
              </div>
              <div class="bg-muted rounded-full h-2">
                <div 
                  class="bg-primary h-2 rounded-full" 
                  :style="`width: ${calculateAvailability(currentEvent.attendees || 0, currentEvent.capacity)}%`"
                ></div>
              </div>
              <div class="text-xs text-muted-foreground text-right mt-1">
                {{ currentEvent.attendees || 0 }} / {{ currentEvent.capacity }} spots taken
              </div>
            </div>
          </div>
        </div>
      </div>    
      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <Button @click="showTicketDialog = false" class="flex-1">
          <i class="pi pi-check mr-2"></i>
          Done
        </Button>        <Button variant="outline" @click="viewEvent(currentEvent?.id || 0)" class="flex-1">
          <i class="pi pi-external-link mr-2"></i>
          View Full Details
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>