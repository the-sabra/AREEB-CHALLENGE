/**
 * Interface for event agenda items
 */
export interface EventAgendaItem {
  time: string;
  title: string;
}

/**
 * Interface for event speakers
 */
export interface EventSpeaker {
  name: string;
  title: string;
  image?: string;
}

/**
 * Interface for event category in API response
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Interface for API event structure
 */
export interface ApiEvent {
  id: number;
  name: string;
  image: string | null;
  description: string;
  date: string;
  venue: string;
  location_link: string;
  category_id: string;
  created_at: string;
  tags: string[];
  category: Category;
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

/**
 * Interface for event list API response
 */
export interface EventListResponse {
  events: ApiEvent[];
  pagination: Pagination;
}

/**
 * Main Event interface (for UI display)
 * Directly reflecting the structure of ApiEvent
 */
export interface Event {
  id: number;
  name: string;
  image: string | null;
  description: string;
  date: string;
  venue: string;
  location_link: string;
  category_id: string;
  created_at: string;
  tags: string[];
  category: Category;
}

/**
 * Interface for event details API response
 */
export interface AvailabilityStatus {
  text: string;
  color: string;
}