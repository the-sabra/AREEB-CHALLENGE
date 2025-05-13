import db from '../config/db.js';
import logger from '../config/logger.js';

/**
 * Event model class for handling event-related database operations
 */
class Event {
    /**
     * Create a new Event instance
     * @param {Object} eventData - The event data
     */    constructor({ id, name, image, description, date, time,venue, location_link, price, capacity, attendees, category_id, created_at }) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.description = description;
        this.date = date;
        this.venue = venue;
        this.location_link = location_link;
        this.category_id = category_id;
        this.created_at = created_at;
        this.price = price;
        this.capacity = capacity;
        this.time = time;
        this.attendees = attendees || 0;
        this.tags = []; // Will store tag relationships
    }

    /**
     * Save the event to the database (create or update)
     * @returns {Promise<Event>} The saved event
     */
    async save() {
        try {
            if (this.id) {
                return await this.update();
            }            const stmt = db.prepare(
                'INSERT INTO events (name, image, description, date, time, venue, location_link, price, capacity, attendees, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            
            // check the category_id exists
            const categoryStmt = db.prepare('SELECT * FROM category WHERE id = ?');
            const category = categoryStmt.get(this.category_id);
            if (!category) {
                throw new Error('Category ID does not exist');
            }
            
            const result = stmt.run(
                this.name,
                this.image,
                this.description,
                this.date,
                this.time,
                this.venue,
                this.location_link,
                this.price,
                this.capacity,
                this.attendees || 0,
                this.category_id
            );
            
            this.id = result.lastInsertRowid;
            
            // If tags were provided, add them
            if (this.tags && this.tags.length > 0) {
                await this.setTags(this.tags);
            }
            
            return this;
        } catch (error) {
            console.error("Error saving event", error);
            logger.error("Error saving event", error);
            throw new Error('Error saving event');
        }
    }

    /**
     * Update an existing event
     * @returns {Promise<Event|null>} The updated event or null if not found
     */    async update() {
        try {
            const validFields = ['name', 'image', 'description', 'date', 'time','venue', 'location_link', 'price', 'capacity', 'category_id'];

            const updates = Object.fromEntries(
                Object.entries(this).filter(([key]) => validFields.includes(key))
            );
            
            const query = `UPDATE events SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
            const values = [...Object.values(updates), this.id];
            
            const stmt = db.prepare(query);
            const result = stmt.run(...values);
            
            // If tags were provided, update them
            if (this.tags && this.tags.length > 0) {
                await this.setTags(this.tags)
            }
            
            return result.changes > 0 ? this : null;
        } catch (error) {
            logger.error("Error updating event", error);
            throw new Error('Error updating event');
        }
    }

    /**
     * Delete an event from the database
     * @returns {Promise<boolean>} True if successful
     */
    async delete() {
        try {
            // Delete all tag associations first (cascade should handle this but being explicit)
            const deleteTagsStmt = db.prepare('DELETE FROM event_tags WHERE event_id = ?');
            deleteTagsStmt.run(this.id);
            
            // Then delete the event
            const stmt = db.prepare('DELETE FROM events WHERE id = ?');
            const result = stmt.run(this.id);
            return result.changes > 0;
        } catch (error) {
            logger.error("Error deleting event", error);
            throw new Error('Error deleting event');
        }
    }

    /**
     * Set tags for this event (replace existing tags)
     * @param {Array<number>} tagIds - Array of tag IDs
     * @returns {Promise<void>}
     */
    async setTags(tagIds) {
        try {
            // First, remove all existing tag associations
            const deleteStmt = db.prepare('DELETE FROM event_tags WHERE event_id = ?');
            deleteStmt.run(this.id);
            
            // Then add new tag associations
            const insertStmt = db.prepare('INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)');
            
            for (const tagId of tagIds) {
                insertStmt.run(this.id, tagId);
            }
            
            // Update the instance's tags
            this.tags = tagIds;
        } catch (error) {
            logger.error("Error setting event tags", error);
            throw new Error('Error setting event tags');
        }
    }

    /**
     * Get all tags for this event
     * @returns {Promise<Array>} Array of tag objects
     */
    async getTags() {
        try {
            const stmt = db.prepare(`
                SELECT t.* 
                FROM tags t
                JOIN event_tags et ON t.id = et.tag_id
                WHERE et.event_id = ?
            `);
            
            const tags = stmt.all(this.id);
            this.tags = tags;
            return tags;
        } catch (error) {
            logger.error("Error fetching event tags", error);
            throw new Error('Error fetching event tags');
        }
    }

    /**
     * Get all bookings for this event
     * @returns {Promise<Array>} Array of booking objects
     */
    async getBookings() {
        try {
            const stmt = db.prepare(`
                SELECT b.*, u.name as user_name, u.email as user_email
                 FROM bookings b
                JOIN users u ON b.user_id = u.id
                WHERE b.event_id = ?
                ORDER BY b.booking_date DESC
            `);
            
            return stmt.all(this.id);
        } catch (error) {
            logger.error("Error fetching event bookings", error);
            throw new Error('Error fetching event bookings');
        }
    }

    /**
     * Check if a user has booked this event
     * @param {number} userId - The user ID
     * @returns {Promise<boolean>} True if the user has an active booking
     */
    async isUserBooked(userId) {
        try {
            const stmt = db.prepare(`
                SELECT COUNT(*) as count
                FROM bookings
                WHERE event_id = ? AND user_id = ? AND status != 'cancelled'
            `);
            
            const result = stmt.get(this.id, userId);
            return result.count > 0;
        } catch (error) {
            logger.error("Error checking if user is booked", error);
            throw new Error('Error checking if user is booked');
        }
    }

    /**
     * Find an event by its ID
     * @param {number} id - The event ID
     * @returns {Promise<Event|null>} The event or null if not found
     */
    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
            const row = stmt.get(id);
            
            if (!row) return null;
            
            const event = new Event(row);
            
            // Get the event's tags
            await event.getTags();
            
            return event;
        } catch (error) {
            logger.error("Error fetching event", error);
            throw new Error('Error fetching event');
        }
    }

    /**
     * Find events by category
     * @param {number} categoryId - The category ID
     * @returns {Promise<Array<Event>>} Array of events
     */
    static async findByCategory(categoryId) {
        try {
            const stmt = db.prepare('SELECT * FROM events WHERE category_id = ?');
            const rows = stmt.all(categoryId);
            
            return Promise.all(rows.map(async row => {
                const event = new Event(row);
                await event.getTags();
                return event;
            }));
        } catch (error) {
            logger.error("Error fetching events by category", error);
            throw new Error('Error fetching events by category');
        }
    }

    /**
     * Find events with pagination and optional filters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {Object} filters - Filter options (category_id, tag_id, search, date_from, date_to)
     * @returns {Promise<Object>} Events and pagination info
     */
    static async findAll(page = 1, limit = 10, filters = {}) {
        try {
            const numLimit = parseInt(limit, 10);
            const numPage = parseInt(page, 10);
            const offset = (numPage - 1) * numLimit;
            
            let baseQuery = 'SELECT DISTINCT e.* FROM events e';
            let countQuery = 'SELECT COUNT(DISTINCT e.id) as count FROM events e';
            let queryParams = [];
            let whereConditions = [];
            
            // Join with event_tags if filtering by tag
            if (filters.tag_id) {
                baseQuery += ' JOIN event_tags et ON e.id = et.event_id';
                countQuery += ' JOIN event_tags et ON e.id = et.event_id';
                whereConditions.push('et.tag_id = ?');
                queryParams.push(filters.tag_id);
            }
            
            // Filter by category
            if (filters.category_id) {
                whereConditions.push('e.category_id = ?');
                queryParams.push(filters.category_id);
            }
            
            // Filter by search term (name or description)
            if (filters.search) {
                whereConditions.push('(e.name LIKE ? OR e.description LIKE ?)');
                queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
            }
            
            // Filter by date range
            if (filters.date_from) {
                whereConditions.push('e.date >= ?');
                queryParams.push(filters.date_from);
            }
            
            if (filters.date_to) {
                whereConditions.push('e.date <= ?');
                queryParams.push(filters.date_to);
            }
            
            // Add WHERE clause if there are conditions
            if (whereConditions.length > 0) {
                const whereClause = ' WHERE ' + whereConditions.join(' AND ');
                baseQuery += whereClause;
                countQuery += whereClause;
            }
            
            // Add sorting by date
            baseQuery += ' ORDER BY e.date ASC';
            
            // Add pagination
            baseQuery += ' LIMIT ?, ?';
            
            // Execute the queries
            let stmt = db.prepare(baseQuery);
            let rows;
            
            if (queryParams.length > 0) {
                const allParams = [...queryParams, offset, numLimit];
                const runQuery = stmt.bind(...allParams);
                rows = runQuery.all();
            } else {
                rows = stmt.all(offset, numLimit);
            }
            
            // Get total count
            stmt = db.prepare(countQuery);
            let totalCountRow;
            
            if (queryParams.length > 0) {
                const runCountQuery = stmt.bind(...queryParams);
                totalCountRow = runCountQuery.get();
            } else {
                totalCountRow = stmt.get();
            }
            
            const totalCount = totalCountRow.count;
            const totalPages = Math.ceil(totalCount / numLimit);
            
            // Create Event objects and get their tags
            const events = await Promise.all(rows.map(async row => {
                const event = new Event(row);
                await event.getTags();
                return event;
            }));
            
            return {
                events,
                pagination: {
                    currentPage: numPage,
                    totalPages,
                    totalCount,
                    hasMore: numPage < totalPages
                }
            };
        } catch (error) {
            logger.error("Error fetching events", error);
            throw new Error('Error fetching events');
        }
    }

    /**
     * Get the category for this event
     * @returns {Promise<Object|null>} The category or null
     */
    async getCategory() {
        try {
            const stmt = db.prepare('SELECT * FROM category WHERE id = ?');
            return stmt.get(this.category_id);
        } catch (error) {
            logger.error("Error fetching event category", error);
            throw new Error('Error fetching event category');
        }
    }


    /**
     * Retrieves the total number of events in the database.
     * 
     * @async
     * @returns {Promise<number>} The total count of events.
     * @throws {Error} If there is an error fetching the event count from the database.
     */
    static async count() {
        try {
            const stmt = db.prepare('SELECT COUNT(*) as count FROM events');
            const row = stmt.get();
            return row.count;
        } catch (error) {
            logger.error("Error fetching event count", error);
            throw new Error('Error fetching event count');
        }
    }

    /**
     * Retrieves the count of upcoming events from the database.
     * An upcoming event is defined as an event with a date greater than or equal to the current date.
     * 
     * @async
     * @returns {Promise<number>} The count of upcoming events.
     * @throws {Error} If there is an error fetching upcoming events from the database.
     */
    static async UpComingCount() {
        try {
            const stmt = db.prepare(`SELECT COUNT(*) as count FROM events WHERE date >= datetime('now') AND date <= datetime('now', '+30 days')`);
            const rows = stmt.all();
            return rows[0].count;
        } catch (error) {
            console.error("Error fetching upcoming events", error);
            logger.error("Error fetching upcoming events", error);
            throw new Error('Error fetching upcoming events');
        }
    }

}

export default Event;