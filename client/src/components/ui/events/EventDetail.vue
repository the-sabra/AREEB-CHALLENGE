<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { useRoute, useRouter } from 'vue-router'
import { Event, AvailabilityStatus } from '@/types/event'

const route = useRoute()
const router = useRouter()
const eventId = computed<number>(() => Number(route.params.id))
const event = ref<Event | null>(null)
const loading = ref<boolean>(true)
const error = ref<string>('')
const isRegistering = ref<boolean>(false)
const registrationSuccess = ref<boolean>(false)

// Sample events data - will be replaced with API call
const sampleEvents: Event[] = [
  {
    id: 1,
    title: 'Tech Conference 2025',
    description: 'Join us for the biggest tech conference of the year featuring workshops, keynotes, and networking opportunities with industry leaders. This three-day event covers topics including AI, blockchain, cloud computing, cybersecurity, and more. Perfect for developers, IT professionals, entrepreneurs, and tech enthusiasts.',
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
      { time: '10:00 AM', title: 'Opening Keynote: Future of Technology' },
      { time: '11:30 AM', title: 'Panel Discussion: Industry Trends' },
      { time: '01:00 PM', title: 'Lunch Break' },
      { time: '02:00 PM', title: 'Workshop Sessions (Multiple Tracks)' },
      { time: '04:30 PM', title: 'Networking Reception' }
    ],
    speakers: [
      { name: 'Sarah Johnson', title: 'CTO, TechGiant Inc.', image: 'https://placehold.co/200x200/3498db/FFFFFF?text=SJ' },
      { name: 'Ahmed Al-Farsi', title: 'AI Research Director', image: 'https://placehold.co/200x200/3498db/FFFFFF?text=AA' },
      { name: 'Maria Rodriguez', title: 'Blockchain Specialist', image: 'https://placehold.co/200x200/3498db/FFFFFF?text=MR' }
    ]
  },
  {
    id: 2,
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest strategies in digital marketing with hands-on training sessions. This intensive workshop covers social media marketing, SEO, content marketing, email campaigns, analytics, and paid advertising. Perfect for marketing professionals, business owners, and entrepreneurs looking to enhance their digital presence.',
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
      { time: '11:00 AM', title: 'SEO & Content Strategy' },
      { time: '12:30 PM', title: 'Lunch Break' },
      { time: '01:30 PM', title: 'Social Media Marketing' },
      { time: '02:30 PM', title: 'Analytics & Reporting' },
      { time: '03:30 PM', title: 'Q&A and Wrap-up' }
    ],
    speakers: [
      { name: 'Michael Chang', title: 'Digital Marketing Director', image: 'https://placehold.co/200x200/27ae60/FFFFFF?text=MC' },
      { name: 'Laila Hassan', title: 'Social Media Strategist', image: 'https://placehold.co/200x200/27ae60/FFFFFF?text=LH' }
    ]
  },
  {
    id: 3,
    title: 'Symphony Orchestra Concert',
    description: 'An evening of classical music with renowned musicians performing masterpieces by Mozart, Beethoven, and Tchaikovsky. The National Symphony Orchestra, led by acclaimed conductor Maestro Robert Chen, presents a program of timeless classics in the stunning acoustic environment of the Royal Opera House.',
    date: '2025-08-20',
    time: '07:30 PM',
    endDate: '2025-08-20',
    endTime: '10:00 PM',
    location: 'Royal Opera House',
    address: '123 Opera Plaza, Cultural District, Dubai',
    category: 'concert',
    organizer: 'National Symphony',
    organizerEmail: 'tickets@nationalsymphony.org',
    organizerPhone: '+971-4-321-7890',
    image: 'https://placehold.co/600x400/e74c3c/FFFFFF?text=Symphony+Concert',
    attendees: 500,
    capacity: 800,
    price: 150,
    agenda: [
      { time: '07:30 PM', title: 'Mozart: Symphony No. 40' },
      { time: '08:15 PM', title: 'Intermission' },
      { time: '08:30 PM', title: 'Beethoven: Symphony No. 5' },
      { time: '09:15 PM', title: 'Tchaikovsky: 1812 Overture' }
    ],
    speakers: [
      { name: 'Maestro Robert Chen', title: 'Principal Conductor', image: 'https://placehold.co/200x200/e74c3c/FFFFFF?text=RC' },
      { name: 'Sophia Yang', title: 'Violin Soloist', image: 'https://placehold.co/200x200/e74c3c/FFFFFF?text=SY' }
    ]
  },
  {
    id: 4,
    title: 'Art Exhibition: Modern Masters',
    description: 'Showcasing contemporary artwork from around the world, featuring paintings, sculptures, installations, and digital art from over 50 international artists. This exhibition explores themes of identity, technology, and sustainability in the modern world through diverse artistic expressions.',
    date: '2025-09-05',
    time: '11:00 AM',
    endDate: '2025-10-15',
    endTime: '08:00 PM',
    location: 'National Art Gallery',
    address: '45 Museum Road, Dubai Arts District',
    category: 'exhibition',
    organizer: 'Arts Council',
    organizerEmail: 'exhibitions@artscouncil.org',
    organizerPhone: '+971-4-456-7890',
    image: 'https://placehold.co/600x400/f39c12/FFFFFF?text=Art+Exhibition',
    attendees: 120,
    capacity: 1000,
    price: 25,
    agenda: [
      { time: 'Daily', title: 'Main Exhibition Hall: International Collection' },
      { time: 'Weekends', title: 'Artist Talks (2:00 PM)' },
      { time: 'Thursdays', title: 'Late Night Viewing until 10:00 PM' },
      { time: 'Sep 20', title: 'Special Workshop: Contemporary Art Techniques' }
    ],
    speakers: [
      { name: 'Elena Kowalski', title: 'Lead Curator', image: 'https://placehold.co/200x200/f39c12/FFFFFF?text=EK' },
      { name: 'Jamal Ibrahim', title: 'Featured Artist', image: 'https://placehold.co/200x200/f39c12/FFFFFF?text=JI' },
      { name: 'Carlos Mendez', title: 'Art Historian', image: 'https://placehold.co/200x200/f39c12/FFFFFF?text=CM' }
    ]
  },
  {
    id: 5,
    title: 'Leadership Seminar',
    description: 'Develop your leadership skills with industry experts in this one-day intensive seminar. Topics include effective communication, team management, conflict resolution, strategic thinking, and emotional intelligence. This seminar combines theory with practical exercises to help you become a more effective leader.',
    date: '2025-07-25',
    time: '02:00 PM',
    endDate: '2025-07-25',
    endTime: '06:00 PM',
    location: 'Executive Training Center',
    address: '8 Leadership Lane, Business District, Dubai',
    category: 'seminar',
    organizer: 'Leadership Institute',
    organizerEmail: 'programs@leadershipinstitute.org',
    organizerPhone: '+971-4-765-4321',
    image: 'https://placehold.co/600x400/9b59b6/FFFFFF?text=Leadership+Seminar',
    attendees: 75,
    capacity: 100,
    price: 120,
    agenda: [
      { time: '02:00 PM', title: 'Opening: Leadership in the Modern Age' },
      { time: '02:45 PM', title: 'Workshop: Communication Skills' },
      { time: '03:30 PM', title: 'Break' },
      { time: '03:45 PM', title: 'Panel: Leading Through Change' },
      { time: '04:30 PM', title: 'Interactive Session: Problem-Solving' },
      { time: '05:30 PM', title: 'Networking & Closing Remarks' }
    ],
    speakers: [
      { name: 'Dr. Thomas Reed', title: 'Leadership Author & Consultant', image: 'https://placehold.co/200x200/9b59b6/FFFFFF?text=TR' },
      { name: 'Aisha Al-Mansouri', title: 'CEO, Global Enterprises', image: 'https://placehold.co/200x200/9b59b6/FFFFFF?text=AM' },
      { name: 'David Chen', title: 'Executive Coach', image: 'https://placehold.co/200x200/9b59b6/FFFFFF?text=DC' }
    ]
  }
]

onMounted(async () => {
  try {
    // TODO: Add API call to fetch event details
    // const response = await fetch(`/api/events/${eventId.value}`)
    // event.value = await response.json()
    
    // For now, use sample data with a slight delay to simulate API call
    setTimeout(() => {
      // Find the event with the matching ID
      const foundEvent = sampleEvents.find(e => e.id === eventId.value)
      
      if (foundEvent) {
        event.value = foundEvent
        toast.success('Event details loaded', { 
          description: `You're viewing ${foundEvent.title}` 
        })
      } else {
        error.value = 'Event not found'
        toast.error('Event not found', { 
          description: 'The event you are looking for does not exist.' 
        })
      }
      
      loading.value = false
    }, 800)
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
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Calculate availability percentage
const availabilityPercentage = computed(() => {
  if (!event.value) return 0
  return Math.round((event.value.attendees / event.value.capacity) * 100)
})

// Get availability status and color
const getAvailabilityStatus = (attendees: number, capacity: number): AvailabilityStatus => {
  const percentage = (attendees / capacity) * 100
  if (percentage >= 90) return { text: 'Almost Full', color: 'bg-red-500' }
  if (percentage >= 75) return { text: 'Filling Up', color: 'bg-orange-500' }
  if (percentage >= 50) return { text: 'Going Well', color: 'bg-yellow-500' }
  return { text: 'Available', color: 'bg-green-500' }
}

// Get icon based on category
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

// Register for the event
const registerForEvent = async () => {
  isRegistering.value = true
  
  try {
    // TODO: Add API call to register for the event
    // const response = await fetch(`/api/events/${eventId.value}/register`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    
    // Simulate successful registration
    setTimeout(() => {
      registrationSuccess.value = true
      isRegistering.value = false
      
      // Update attendee count (this would come from the API response in a real app)
      if (event.value) {
        event.value.attendees += 1
        toast.success('Registration successful!', {
          description: `You have registered for ${event.value.title}. We look forward to seeing you there!`
        })
      }
    }, 1000)
  } catch (err) {
    error.value = 'Failed to register for the event. Please try again.'
    toast.error('Registration failed', {
      description: 'Please try again later.'
    })
    isRegistering.value = false
  }
}

// Navigate back to events list
const goBack = () => {
  router.push('/events')
}

// Share event with others
const shareEvent = () => {
  if (navigator.share) {
    navigator.share({
      title: event.value.title,
      text: `Check out this event: ${event.value.title}`,
      url: window.location.href
    })
    .then(() => toast.success('Shared successfully'))
    .catch(() => toast.error('Share cancelled'))
  } else {
    // Copy link to clipboard as fallback
    navigator.clipboard.writeText(window.location.href)
    toast.success('Event link copied to clipboard', {
      description: 'You can now share it with others'
    })
  }
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <Button variant="outline" @click="goBack" class="mb-6">
      <i class="pi pi-arrow-left mr-2"></i>
      Back to Events
    </Button>
    
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
          <img :src="event.image" :alt="event.title" class="w-full h-64 md:h-96 object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div class="p-6 text-white">
              <Badge variant="default" class="mb-3 flex items-center">
                <i :class="`pi pi-${getCategoryIcon(event.category)} mr-1`"></i>
                {{ event.category.charAt(0).toUpperCase() + event.category.slice(1) }}
              </Badge>
              <h1 class="text-3xl md:text-4xl font-bold">{{ event.title }}</h1>
              <p class="text-lg opacity-90 mt-2 flex items-center">
                <i class="pi pi-building mr-2"></i>
                Organized by {{ event.organizer }}
              </p>
            </div>
          </div>
          
          <!-- Share Button -->
          <Button 
            @click="shareEvent" 
            variant="outline" 
            size="icon" 
            class="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
          >
            <i class="pi pi-share-alt"></i>
          </Button>
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
              
              <!-- Agenda -->
              <div class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Agenda</h2>
                <div class="border-l-2 border-primary/30 pl-4 space-y-4">
                  <div v-for="(item, index) in event.agenda" :key="index" class="relative">
                    <div class="absolute -left-[9px] mt-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p class="font-semibold">{{ item.time }}</p>
                    <p class="text-muted-foreground">{{ item.title }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Speakers -->
              <div>
                <h2 class="text-2xl font-bold mb-4">Speakers & Presenters</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card v-for="(speaker, index) in event.speakers" :key="index" class="overflow-hidden">
                    <div class="p-4 flex flex-col items-center text-center">
                      <img :src="speaker.image" :alt="speaker.name" class="w-20 h-20 rounded-full object-cover mb-3" />
                      <h3 class="font-semibold text-lg">{{ speaker.name }}</h3>
                      <p class="text-sm text-muted-foreground">{{ speaker.title }}</p>
                    </div>
                  </Card>
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
                    <p>{{ event.time }} - {{ event.endTime }}</p>
                    <p v-if="event.date !== event.endDate" class="text-muted-foreground text-sm">
                      Until {{ formatDate(event.endDate) }}
                    </p>
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
                    <p>{{ event.location }}</p>
                    <p>{{ event.address }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Price -->
              <div>
                <h3 class="text-lg font-semibold mb-2 flex items-center">
                  <i class="pi pi-dollar mr-2 text-primary"></i>
                  Price
                </h3>
                <p class="text-2xl font-bold text-primary">${{ event.price }}</p>
              </div>
              
              <!-- Availability -->
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <h3 class="text-lg font-semibold flex items-center">
                    <i class="pi pi-ticket mr-2 text-primary"></i>
                    Availability
                  </h3>
                  <Badge :class="getAvailabilityStatus(event.attendees, event.capacity).color" variant="outline">
                    {{ getAvailabilityStatus(event.attendees, event.capacity).text }}
                  </Badge>
                </div>
                <div class="bg-muted rounded-full h-2.5 mb-2">
                  <div 
                    class="bg-primary h-2.5 rounded-full" 
                    :style="`width: ${availabilityPercentage}%`"
                  ></div>
                </div>
                <p class="text-muted-foreground text-sm">
                  {{ event.attendees }} / {{ event.capacity }} spots taken
                </p>
              </div>
              
              <!-- Organizer Contact -->
              <div>
                <h3 class="text-lg font-semibold mb-2 flex items-center">
                  <i class="pi pi-phone mr-2 text-primary"></i>
                  Contact
                </h3>
                <div class="space-y-2 text-muted-foreground">
                  <div class="flex items-center">
                    <i class="pi pi-envelope mr-2"></i>
                    <p>{{ event.organizerEmail }}</p>
                  </div>
                  <div class="flex items-center">
                    <i class="pi pi-mobile mr-2"></i>
                    <p>{{ event.organizerPhone }}</p>
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
                  @click="registerForEvent" 
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