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
 * Main Event interface
 */
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  location: string;
  address: string;
  category: string;
  organizer: string;
  organizerEmail?: string;
  organizerPhone?: string;
  image?: string;
  price?: number;
  attendees: number;
  capacity: number;
  tags: string[];
}

/**
 * Interface for event categories
 */
export interface EventCategory {
  value: string;
  label: string;
}

/**
 * Type for date filter options
 */
export interface DateFilterOption {
  value: string;
  label: string;
}

/**
 * Interface for availability status
 */
export interface AvailabilityStatus {
  text: string;
  color: string;
}