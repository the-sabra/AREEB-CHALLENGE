import Event from '../models/event.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

import logger from '../config/logger.js';
import db from '../config/db.js';

/**
 * Service class for event-related operations
 */
class EventService {
    /**
     * Create a new event
     * @param {Object} eventData - The event data
     * @returns {Promise<Event>} The created event
     */
    async createEvent(eventData) {
        try {
            //TODO: needs edit 
            const event = new Event(eventData);
            
            // If tags were included, set them
            if (eventData.tags && Array.isArray(eventData.tags) && eventData.tags.length > 0) {
                event.tags = eventData.tags;
            }
            
            return await event.save();
        } catch (error) {
            console.error("Error creating event", error);
            logger.error("Error creating event", error);
            throw error;
        }
    }    /**
     * Get an event by ID
     * @param {number} id - The event ID
     * @returns {Promise<Object>} The event with category and tags
     */
    async getEventById(id) {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw new ApiResponse(404, 'Event not found');
            }
            
            // Get category
            const category = await event.getCategory();
            
            
            // Return formatted event with category, tags, and booking info
            return {
                ...event,
                category: category ? { id: category.id, name: category.name } : null,
            };
        } catch (error) {
            logger.error("Error getting event", error);
            throw error;
        }
    }

    /**
     * Update an event
     * @param {number} id - The event ID
     * @param {Object} updates - The updates to apply
     * @returns {Promise<Event>} The updated event
     */
    async updateEvent(id, updates) {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw new ApiResponse(404, 'Event not found');
            }
            
            // Apply updates
            Object.assign(event, updates);
            
            // If tags were included in updates, set them
            if (updates.tags && Array.isArray(updates.tags)) {
                event.tags = updates.tags;
            }
            
            return await event.update();
        } catch (error) {
            logger.error("Error updating event", error);
            throw error;
        }
    }

    /**
     * Delete an event
     * @param {number} id - The event ID
     * @returns {Promise<boolean>} True if successful
     */
    async deleteEvent(id) {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw new ApiResponse(404, 'Event not found');
            }
            
            return await event.delete();
        } catch (error) {
            logger.error("Error deleting event", error);
            throw error;
        }
    }

    /**
     * Get all events with pagination and filters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {Object} filters - Filter options
     * @returns {Promise<Object>} Events and pagination info
     */
    async getAllEvents(page = 1, limit = 10, filters = {}) {
        try {
            const result = await Event.findAll(page, limit, filters);
            
            // Enhance the events with category information
            const enhancedEvents = await Promise.all(
                result.events.map(async (event) => {
                    const category = await event.getCategory();
                    return {
                        ...event,
                        category: category ? { id: category.id, name: category.name } : null
                    };
                })
            );
            
            return {
                events: enhancedEvents,
                pagination: result.pagination
            };
        } catch (error) {
            logger.error("Error getting events", error);
            throw error;
        }
    }

    /**
     * Get all categories
     * @returns {Promise<Array>} Array of categories
     */
    async getAllCategories() {
        try {
            const stmt = db.prepare('SELECT * FROM category ORDER BY name');
            return stmt.all();
        } catch (error) {
            logger.error("Error getting categories", error);
            throw new Error('Error fetching categories');
        }
    }

    /**
     * Create a new category
     * @param {Object} categoryData - The category data
     * @returns {Promise<Object>} The created category
     */
    async createCategory(categoryData) {
        try {
            if (!categoryData.name) {
                throw new Error('Category name is required');
            }
            
            const stmt = db.prepare('INSERT INTO category (name) VALUES (?)');
            const result = stmt.run(categoryData.name);
            
            return {
                id: result.lastInsertRowid,
                name: categoryData.name
            };
        } catch (error) {

            if(error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new Error('Category name must be unique');
            }

            console.error("Error creating category", error);
            logger.error("Error creating category", error);
            throw new Error('Error creating category');
        }
    }

    /**
     * Get all tags
     * @returns {Promise<Array>} Array of tags
     */
    async getAllTags() {
        try {
            const stmt = db.prepare('SELECT * FROM tags ORDER BY name');
            return stmt.all();
        } catch (error) {
            logger.error("Error getting tags", error);
            throw new Error('Error fetching tags');
        }
    }

    /**
     * Create a new tag
     * @param {Object} tagData - The tag data
     * @returns {Promise<Object>} The created tag
     */
    async createTag(tagData) {
        try {
            if (!tagData.name) {
                throw new Error('Tag name is required');
            }
            
            const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)');
            const result = stmt.run(tagData.name);
            
            return {
                id: result.lastInsertRowid,
                name: tagData.name
            };
        } catch (error) {
            logger.error("Error creating tag", error);
            throw new Error('Error creating tag');
        }
    }
}

// Create a singleton instance
const eventService = new EventService();

export default eventService;