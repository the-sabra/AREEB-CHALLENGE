import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import logger from '../config/logger.js';
import db from '../config/db.js';

class BookingService {
    /**
     * Get all bookings for a user
     * @param {number} userId - The user ID
     * @returns {Promise<Array>} Array of bookings with event details
     */
    async getUserBookings(userId) {
        try {
            const bookings = await Booking.findByUser(userId);
            
            const bookingsWithEvents = await Promise.all(
                bookings.map(async (booking) => {
                    const event = await booking.getEvent();
                    return {
                        ...booking,
                        event: event ? {
                            id: event.id,
                            name: event.name,
                            date: event.date,
                            venue: event.venue,
                            image: event.image
                        } : null
                    };
                })
            );
            
            return bookingsWithEvents;
        } catch (error) {
            logger.error("Error getting user bookings", error);
            throw error;
        }
    }

    /**
     * Get all bookings for an event
     * @param {number} eventId - The event ID
     * @returns {Promise<Array>} Array of bookings
     */
    async getEventBookings(eventId) {
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                throw new ApiResponse(404, 'Event not found');
            }
            
            return await event.getBookings();
        } catch (error) {
            logger.error("Error getting event bookings", error);
            throw error;
        }
    }

    /**
     * Create a new booking
     * @param {number} eventId - The event ID
     * @param {number} userId - The user ID
     * @param {number} ticketCount - Number of tickets to book
     * @returns {Promise<Object>} The created booking
     */
    async createBooking(eventId, userId, ticketCount = 1) {
        try {
            // Check if event exists
            const event = await Event.findById(eventId);
            if (!event) {
                throw new ApiResponse(404, 'Event not found');
            }
            
            // Check if the event date has passed
            const eventDate = new Date(event.date);
            if (eventDate < new Date()) {
                throw new ApiResponse(400, 'Cannot book a past event');
            }
            
            // Check if user already has a booking for this event
            const existingBooking = await Booking.findByEventAndUser(eventId, userId);
            if (existingBooking) {
                throw new ApiResponse(400, 'You already have a booking for this event');
            }
            
            // Create and save the booking
            const booking = new Booking({
                event_id: eventId,
                user_id: userId,
                ticket_count: ticketCount
            });
            
            await booking.save();
            
            return booking;
        } catch (error) {
            logger.error("Error creating booking", error);
            throw error;
        }
    }

    /**
     * Get availability for an event
     * @param {number} eventId - The event ID
     * @returns {Promise<Object>} Availability information
     */
    async getEventAvailability(eventId) {
        try {
            return await Booking.getAvailabilityForEvent(eventId);
        } catch (error) {
            logger.error("Error getting event availability", error);
            throw error;
        }
    }

        /**
     * Find a user's booking for a specific event
     * @param {number} eventId - The event ID
     * @param {number} userId - The user ID
     * @returns {Promise<Booking|null>} The booking or null if not found
     */
     async findByEventAndUser(eventId, userId) {
        try {
            const stmt = db.prepare('SELECT b.* FROM bookings b WHERE event_id = ? AND user_id = ?');
            const row = stmt.get(eventId, userId);
            
            return row ? new Booking(row) : null;
        } catch (error) {
            logger.error("Error fetching booking by event and user", error);
            throw error;
        }
    }

    async getUserEvents(userId) {
        try {
            const bookings = await Booking.findByUser(userId);
            
            const events = await Promise.all(
                bookings.map(async (booking) => {
                    const event = await booking.getEvent();
                    return event ? {
                        id: event.id,
                        name: event.name,
                        date: event.date,
                        venue: event.venue,
                        image: event.image
                    } : null;
                })
            );
            
            return events.filter(event => event !== null);
        } catch (error) {
            logger.error("Error getting user events", error);
            throw error;
        }
    }
}

// Create a singleton instance
const bookingService = new BookingService();

export default bookingService;