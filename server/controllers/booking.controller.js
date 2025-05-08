import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import logger from '../config/logger.js';

class BookingController {
    /**
     * Get bookings for the authenticated user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getUserBookings(req, res, next) {
        try {
            const userId = req.user.id;
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
            
            return res.status(200).json(
                ApiResponse.success(
                    200,
                    bookingsWithEvents,
                    "Bookings retrieved successfully"
                )
            );
        } catch (error) {
            logger.error("Error in getUserBookings", error);
            next(error);
        }
    }

    /**
     * Get all bookings for a specific event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getEventBookings(req, res, next) {
        try {
            const { eventId } = req.params;
            
            // Check if event exists
            const event = await Event.findById(eventId);
            if (!event) {
                return next(new ApiResponse.error(404, "Event not found"));
            }
            
            const bookings = await event.getBookings();
            return res.status(200).json(
                ApiResponse.success(
                    200,
                    bookings,
                    "Event bookings retrieved successfully"
                )
            );
        } catch (error) {
            logger.error("Error in getEventBookings", error);
            next(error);
        }
    }

    /**
     * Create a new booking for an event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async createBooking(req, res, next) {
        try {
            const { eventId } = req.params;
            const userId = req.user.id;
            const { ticketCount = 1 } = req.body;
            
            // Check if event exists
            const event = await Event.findById(eventId);
            if (!event) {
                return next(new ApiResponse.error(404, "Event not found"));
            }
            
            // Check if the event date has passed
            const eventDate = new Date(event.date);
            if (eventDate < new Date()) {
                return next(new ApiResponse.error(400, "Cannot book a past event"));
            }
            
            // Check if user already has a booking for this event
            const existingBooking = await Booking.findByEventAndUser(eventId, userId);
            if (existingBooking) {
                return next(new ApiResponse.error(400, "You already have a booking for this event"));
            }
            
            // Create and save the booking
            const booking = new Booking({
                event_id: eventId,
                user_id: userId,
                ticket_count: ticketCount
            });
            
            await booking.save();
            
            return res.status(201).json(
                ApiResponse.success(
                    201,
                    { booking },
                    "Booking created successfully"
                )
            );
        } catch (error) {
            logger.error("Error in createBooking", error);
            
            if (error.message === 'Not enough tickets available') {
                return next(new ApiResponse.error(400, error.message));
            }
            
            next(error);
        }
    }
}

// Create a singleton instance
const bookingController = new BookingController();

export default bookingController;
