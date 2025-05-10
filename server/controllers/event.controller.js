import bookingService from '../services/booking.service.js';
import eventService from '../services/event.service.js';
import userService from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bookingController from './booking.controller.js';


import { getFileUrl, deleteFile, ensureUploadDirExists } from '../utils/fileUpload.js';

// Ensure upload directory exists
ensureUploadDirExists();

class EventController {    /**
     * Create a new event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async createEvent(req, res, next) {
        try {
            // Handle file upload
            const eventData = req.body;
            
            // If there's a file, add the image path to the event data
            if (req.file) {
                const filename = req.file.filename;
                eventData.image = filename;
                console.log(`Image file ${filename} uploaded and associated with event`);
            } else {
                console.log('No image file uploaded with event');
            }
            
            const event = await eventService.createEvent(eventData);
            
            // Add full image URL to the response
            if (event.image) {
                event.imageUrl = getFileUrl(event.image);
            }
            
            res.status(201).json(
                ApiResponse.success(
                    201,
                    { event },
                    "Event created successfully"
                )
            );
        } catch (error) {
            // If there was an error and a file was uploaded, clean it up
            if (req.file) {
                deleteFile(req.file.filename);
            }
            next(error);
        }
    }/**
     * Get an event by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async getEvent(req, res, next) {
        try {
            const event = await eventService.getEventById(req.params.eventId);
            
            // Add full image URL to the response
            if (event.image) {
                event.imageUrl = getFileUrl(event.image);
            }
            
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
    }    /**
     * Update an event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async updateEvent(req, res, next) {
        try {
            // Get current event to check if we need to delete an old image
            const currentEvent = await eventService.getEventById(req.params.eventId);
            const eventData = req.body;
            
            // Handle file upload
            if (req.file) {
                // Delete old image if exists
                if (currentEvent.image) {
                    deleteFile(currentEvent.image);
                    console.log(`Previous image ${currentEvent.image} deleted`);
                }
                
                // Set new image filename
                eventData.image = req.file.filename;
                console.log(`New image ${req.file.filename} uploaded for event ${req.params.eventId}`);
            }
            
            const event = await eventService.updateEvent(req.params.eventId, eventData);
            
            // Add full image URL to the response
            if (event.image) {
                event.imageUrl = getFileUrl(event.image);
            }
            
            res.json(
                ApiResponse.success(
                    200,
                    { event },
                    "Event updated successfully"
                )
            );
        } catch (error) {
            // If there was an error and a new file was uploaded, clean it up
            if (req.file) {
                deleteFile(req.file.filename);
            }
            next(error);
        }
    }    /**
     * Delete an event
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    async deleteEvent(req, res, next) {
        try {
            // Get current event to delete image file
            const currentEvent = await eventService.getEventById(req.params.eventId);
            
            // Delete the event
            await eventService.deleteEvent(req.params.eventId);
            
            // Delete the image file if exists
            if (currentEvent && currentEvent.image) {
                deleteFile(currentEvent.image);
                console.log(`Image ${currentEvent.image} deleted along with event ${req.params.eventId}`);
            }
            
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
    }    /**
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
            
            // Add image URLs to all events
            if (result.events && result.events.length > 0) {
                result.events = result.events.map(event => {
                    if (event.image) {
                        event.imageUrl = getFileUrl(event.image);
                    }
                    return event;
                });
            }
            
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
    }    /**
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
                
                // Add image URL if image exists
                if (event.image) {
                    event.imageUrl = getFileUrl(event.image);
                }

                return { ...event, isBooked: !!isBooked };
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