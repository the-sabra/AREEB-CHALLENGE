/**
 * Interface for event category in API response
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Interface for event details in API response
 */
export interface EventListResponse {
  events: ApiEvent[],
  pagination: Pagination
}


/**
 * Interface for pagination data
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

// Updated interfaces for API responses
export interface ApiEvent {
  id: number
  name: string
  description: string
  date: string
  time: string
  location_link: string
  imageUrl: string
  image?: File | null  // File for upload
  price: number
  capacity: number
  attendees: number
  categoryId: number
  category_id?: number // For compatibility with API
  venue: string
  isBooked: boolean
  category: {
    id: number
    name: string
  },
  tags: Tag[]
}

export interface AddEvent {
  name: string
  description: string
  date: string
  time?: string
  location_link: string
  image: File | null
  price: number
  capacity: number
  attendees: number
  categoryId: number
  venue: string
  isBooked: boolean
  category_id: number,
  tags: number[]
}


export interface Tag {
  id: number
  name: string
}

export interface CategoryResponse {
  categories: Category[]
}

export interface EventDetailResponse {
  event: ApiEvent
}

export interface BookingResponse {
  success: boolean
  message: string
  ticket_count?: number
}

