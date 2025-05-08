import bookingService from '../services/booking.service.js';
import eventService from '../services/event.service.js';
import userService from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bookingController from './booking.controller.js';


class EventController {
    /**
     * Create a new event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async createEvent(req, res, next) {
        try {
            const event = await eventService.createEvent(req.body);
            res.status(201).json(
                ApiResponse.success(
                    201,
                    { event },
                    "Event created successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get an event by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getEvent(req, res, next) {
        try {
            const event = await eventService.getEventById(req.params.eventId);
            res.json(
                ApiResponse.success(
                    200,
                    { event },
                    "Event retrieved successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update an event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async updateEvent(req, res, next) {
        try {
            const event = await eventService.updateEvent(req.params.eventId, req.body);
            res.json(
                ApiResponse.success(
                    200,
                    { event },
                    "Event updated successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete an event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async deleteEvent(req, res, next) {
        try {
            await eventService.deleteEvent(req.params.eventId);
            res.json(
                ApiResponse.success(
                    200,
                    {},
                    "Event deleted successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all events with pagination and filters
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getAllEvents(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Extract filter parameters from query
            const filters = {
                category_id: req.query.category_id,
                tag_id: req.query.tag_id,
                search: req.query.search,
                date_from: req.query.date_from,
                date_to: req.query.date_to
            };
            
            // Remove undefined filters
            Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
            
            const result = await eventService.getAllEvents(page, limit, filters);
            
            res.json(
                ApiResponse.success(
                    200,
                    { 
                        events: result.events,
                        pagination: result.pagination
                    },
                    "Events retrieved successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all categories
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getAllCategories(req, res, next) {
        try {
            const categories = await eventService.getAllCategories();
            res.json(
                ApiResponse.success(
                    200,
                    { categories },
                    "Categories retrieved successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new category
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async createCategory(req, res, next) {
        try {
            const category = await eventService.createCategory(req.body);
            res.status(201).json(
                ApiResponse.success(
                    201,
                    { category },
                    "Category created successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all tags
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getAllTags(req, res, next) {
        try {
            const tags = await eventService.getAllTags();
            res.json(
                ApiResponse.success(
                    200,
                    { tags },
                    "Tags retrieved successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new tag
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async createTag(req, res, next) {
        try {
            const tag = await eventService.createTag(req.body);
            res.status(201).json(
                ApiResponse.success(
                    201,
                    { tag },
                    "Tag created successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all events for authenticated users with booking status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getAllEventsAuthed(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Extract filter parameters from query
            const filters = {
                category_id: req.query.category_id,
                tag_id: req.query.tag_id,
                search: req.query.search,
                date_from: req.query.date_from,
                date_to: req.query.date_to
            };

            Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
            
            const userId = req.user.id; 
            const result = await eventService.getAllEvents(page, limit, filters);
            const userEvents = await userService.getUserEvents(userId, filters);

            const eventsWithBookingStatus = result.events.map(event => {
                const isBooked = userEvents.some(userEvent => userEvent.id === event.id);

                return  { ...event, isBooked: !!isBooked } ;
            });
            
            res.json(
                ApiResponse.success(
                    200,
                    { 
                        events: eventsWithBookingStatus,
                        pagination: result.pagination
                    },
                    "Events retrieved successfully"
                )
            );
        } catch (error) {
            next(error);
        }
    }
}

// Create a singleton instance
const eventController = new EventController();

export default eventController;