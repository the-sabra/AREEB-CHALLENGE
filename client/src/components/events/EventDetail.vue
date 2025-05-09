<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import type { ApiEvent, EventDetailResponse, } from '@/types/event'

const route = useRoute()
const router = useRouter()
const eventId = computed<number>(() => Number(route.params.id))
const event = ref<ApiEvent | null>(null)
const loading = ref<boolean>(true)
const error = ref<string>('')
const isRegistering = ref<boolean>(false)
const registrationSuccess = ref<boolean>(false)

const showShareDialog = ref<boolean>(false)
const showRegisterDialog = ref<boolean>(false)
const ticketCount = ref<number>(1)

function copyToClipboard(){
   navigator.clipboard.writeText(window.location.href);
  toast.success('Link copied to clipboard');
  showShareDialog.value = false;
}

function shareOnWhatsApp() {
   window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${event.value!.name} - ${window.location.href}`)}`, '_blank');
  showShareDialog.value = false;
}

function shareOnTwitter() {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${event.value?.name}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  showShareDialog.value = false;
}

onMounted(async () => {
  try {
    const response = await api.get<EventDetailResponse>(`/events/${eventId.value}`)
    event.value = response.event
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load event details. Please try again later.'
    toast.error('Error loading event', {
      description: 'Please try again later.'
    })
    loading.value = false
  }
})

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Get icon based on category
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    conference: 'users',
    workshop: 'briefcase',
    concert: 'volume-2',
    exhibition: 'image',
    seminar: 'book'
  }
  return iconMap[categoryName.toLowerCase()] || 'tag'
}

const increaseTicketCount = () => {
  ticketCount.value++;
};

const decreaseTicketCount = () => {
  if (ticketCount.value > 1) {
    ticketCount.value--;
  }
};

const confirmRegistration = async () => {
  if (!event.value) return

  
  isRegistering.value = true
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    router.push('/auth')
    toast.info('Please log in to register for events', {
      description: 'You need to be logged in to register for events.'
    })
    return
  }

  try{
    isRegistering.value = true
    const ticketCountObj = {
      ticketCount: ticketCount.value
    }

    await api.post(`/bookings/event/${event.value?.id}`, ticketCountObj ,{requiresAuth: true})

    toast.success('Registration request sent', {
      description: `You have successfully registered for ${event.value?.name}`
    })
    isRegistering.value = false
    registrationSuccess.value = true
    setTimeout(() => {
    }, 5000)
    router.push('/')
  }catch (error) {
    isRegistering.value = false
    showRegisterDialog.value = false
    toast.error((error! as any).response.data.message)
  } 
}

// Navigate back to events list
const goBack = () => {
  router.push('/events')
}

// Share event with others
const shareEvent = () => {
  showShareDialog.value = true
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <Button variant="outline" @click="goBack" class="mb-6">
      <i class="pi pi-arrow-left mr-2"></i>
      Back to Events
    </Button>

    <!-- Share Dialog -->
    <Dialog v-model:open="showShareDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share This Event</DialogTitle>
          <DialogDescription>
            Choose how you would like to share this event with others.
          </DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          <Button variant="outline" class="flex flex-col items-center p-4 h-auto" @click="copyToClipboard">
            <i class="pi pi-copy text-xl mb-2"></i>
            <span>Copy Link</span>
          </Button>

          <Button variant="outline" class="flex flex-col items-center p-4 h-auto" @click="shareOnWhatsApp">
            <i class="pi pi-whatsapp text-xl mb-2 text-green-500"></i>
            <span>WhatsApp</span>
          </Button>


          <Button variant="outline" class="flex flex-col items-center p-4 h-auto" @click="shareOnTwitter">
            <i class="pi pi-twitter text-xl mb-2 text-blue-400"></i>
            <span>Twitter</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Registration Dialog -->
    <Dialog v-model:open="showRegisterDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for {{ event?.name }}</DialogTitle>
          <DialogDescription>
            Confirm your registration for this event. You can cancel your registration later if needed.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <div class="flex items-center justify-between mb-4 p-3 bg-muted rounded-md">
            <div class="flex items-center">
              <i class="pi pi-calendar text-primary mr-2 text-lg"></i>
              <span class="font-medium">Event Date:</span>
            </div>
            <span>{{ event?.date ? formatDate(event.date) : 'N/A' }}</span>
          </div>
          
          <!-- Ticket Count -->
          <div class="mb-6 p-4 bg-muted rounded-lg">
            <label for="ticketCount" class="block text-sm font-medium mb-3">Number of Tickets</label>
            <div class="flex items-center justify-between border border-input rounded-md bg-background overflow-hidden">
              <Button 
                variant="ghost" 
                @click="decreaseTicketCount" 
                :disabled="ticketCount <= 1"
                class="h-9 px-3 rounded-none hover:bg-primary/10"
              >
                <i class="pi pi-minus"></i>
              </Button>
              
              <input
                id="ticketCount"
                type="number"
                v-model="ticketCount"
                class="w-12 text-center border-none focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                min="1"
              />
              
              <Button 
                variant="ghost" 
                @click="increaseTicketCount"
                class="h-9 px-3 rounded-none hover:bg-primary/10"
              >
                <i class="pi pi-plus"></i>
              </Button>
            </div>
            
            <div class="flex items-center mt-2 text-sm text-muted-foreground">
              <i class="pi pi-ticket mr-2"></i>
              <span>{{ ticketCount }} {{ ticketCount === 1 ? 'ticket' : 'tickets' }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showRegisterDialog = false">Cancel</Button>
          <Button @click="confirmRegistration" :disabled="isRegistering">
            <span v-if="isRegistering">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>Confirm Registration</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-primary">
        <i class="pi pi-spin pi-spinner mr-2 text-xl"></i>
        Loading event details...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-center">
      <i class="pi pi-exclamation-circle mr-2 text-lg"></i>
      {{ error }}
    </div>

    <!-- Event Details -->
    <div v-else-if="event" class="space-y-8">
      <!-- Event Header -->
      <Card class="overflow-hidden">
        <div class="relative">
            <img 
            v-if="event.image"
            :src="event.image" 
            :alt="event.name" 
            class="w-full h-52 object-cover transition-transform duration-500 hover:scale-105" 
            />
            <div v-else class="w-full h-52 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
              <i :class="`pi pi-${getCategoryIcon(event.category?.name || 'all')} text-primary text-4xl opacity-50`"></i>
            </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div class="p-6 text-white">
              <Badge variant="default" class="mb-3 flex items-center" v-if="event.category">
                <i :class="`pi pi-${getCategoryIcon(event.category.name)} mr-1`"></i>
                {{ event.category.name.charAt(0).toUpperCase() + event.category.name.slice(1) }}
              </Badge>
              <h1 class="text-3xl md:text-4xl font-bold">{{ event.name }}</h1>
            </div>
          </div>

          <!-- Share Button -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  @click="shareEvent"
                  variant="outline"
                  size="icon"
                  class="absolute top-4 right-4 bg-black/40 backdrop-blur-sm hover:bg-primary/90 text-white border-white/30"
                >
                  <i class="pi pi-share-alt"></i>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Event</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>

      <!-- Event Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="md:col-span-2">
          <Card>
            <CardContent class="p-6">
              <div class="prose dark:prose-invert max-w-none mb-8">
                <h2 class="text-2xl font-bold mb-4">About This Event</h2>
                <p>{{ event.description }}</p>
              </div>

              <!-- Tags from ApiEvent -->
              <div v-if="event.tags && event.tags.length > 0" class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Tags</h2>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="tag in event.tags" :key="tag.id" variant="secondary">{{ tag.name }}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="md:col-span-1">
          <Card>
            <CardContent class="p-6 space-y-6">
              <!-- Date & Time -->
              <div>
                <h3 class="text-lg font-semibold mb-2 flex items-center">
                  <i class="pi pi-calendar mr-2 text-primary"></i>
                  Date & Time
                </h3>
                <div class="flex items-start space-x-3 text-muted-foreground">
                  <i class="pi pi-clock mt-0.5 shrink-0 text-lg"></i>
                  <div>
                    <p>{{ formatDate(event.date) }}</p>
                  </div>
                </div>
              </div>

              <!-- Location -->
              <div>
                <h3 class="text-lg font-semibold mb-2 flex items-center">
                  <i class="pi pi-map-marker mr-2 text-primary"></i>
                  Location
                </h3>
                <div class="flex items-start space-x-3 text-muted-foreground">
                  <i class="pi pi-home mt-0.5 shrink-0 text-lg"></i>
                  <div>
                    <p>{{ event.venue }}</p>
                    <p v-if="event.location_link" class="mt-1">
                      <a :href="event.location_link" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline text-sm">
                        View Map <i class="pi pi-external-link ml-1"></i>
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Registration -->
              <div>
                <div v-if="registrationSuccess" class="bg-success/10 border border-success text-success p-4 rounded-md mb-4">
                  <div class="flex items-center">
                    <i class="pi pi-check-circle mr-2 text-lg"></i>
                    <p>You have successfully registered for this event!</p>
                  </div>
                </div>

                <Button
                  @click="showRegisterDialog = true"
                  class="w-full justify-center"
                  :disabled="isRegistering || registrationSuccess"
                  :variant="registrationSuccess ? 'outline' : 'default'"
                >
                  <span v-if="isRegistering">
                    <i class="pi pi-spin pi-spinner mr-2"></i>
                    Processing...
                  </span>
                  <span v-else-if="registrationSuccess">
                    <i class="pi pi-check mr-2"></i>
                    Registered
                  </span>
                  <span v-else>
                    <i class="pi pi-calendar-plus mr-2"></i>
                    Register Now
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>