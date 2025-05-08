import db from '../config/db.js';
import logger from '../config/logger.js';
import Event from './event.model.js';

/**
 * Waitlist model for handling event waitlist operations
 */
class Waitlist {
    /**
     * Create a new waitlist entry instance
     * @param {Object} waitlistData - The waitlist data
     */
    constructor({ id, event_id, user_id, requested_tickets, request_date, status, notification_sent_at }) {
        this.id = id;
        this.event_id = event_id;
        this.user_id = user_id;
        this.requested_tickets = requested_tickets || 1;
        this.request_date = request_date || new Date();
        this.status = status || 'waiting';
        this.notification_sent_at = notification_sent_at || null;
    }

    /**
     * Save a new waitlist entry to the database
     * @returns {Promise<Waitlist>} The saved waitlist entry
     */
    async save() {
        try {
            if (this.id) {
                return await this.update();
            }

            // Get the event to check if it's sold out
            const event = await Event.findById(this.event_id);
            if (!event) {
                throw new Error('Event not found');
            }

            // Check if event is actually sold out
            const stats = await event.getBookingStats();
            if (!stats.isSoldOut) {
                throw new Error('Event is not sold out, direct booking is possible');
            }

            // Check if user is already on waitlist
            const existingEntry = await Waitlist.findByEventAndUser(this.event_id, this.user_id);
            if (existingEntry) {
                throw new Error('You are already on the waitlist for this event');
            }

            const stmt = db.prepare(
                'INSERT INTO waitlist (event_id, user_id, requested_tickets, request_date, status) VALUES (?, ?, ?, ?, ?)'
            );
            
            const result = stmt.run(
                this.event_id,
                this.user_id,
                this.requested_tickets,
                this.request_date,
                this.status
            );
            
            this.id = result.lastInsertRowid;
            
            return this;
        } catch (error) {
            logger.error("Error saving waitlist entry", error);
            throw error;
        }
    }

    /**
     * Update an existing waitlist entry
     * @returns {Promise<Waitlist|null>} The updated waitlist entry or null if not found
     */
    async update() {
        try {
            const validFields = ['requested_tickets', 'status', 'notification_sent_at'];
            
            const updates = Object.fromEntries(
                Object.entries(this).filter(([key]) => validFields.includes(key))
            );
            
            if (Object.keys(updates).length === 0) return this;
            
            const query = `UPDATE waitlist SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
            const values = [...Object.values(updates), this.id];
            
            const stmt = db.prepare(query);
            const result = stmt.run(...values);
            
            return result.changes > 0 ? this : null;
        } catch (error) {
            logger.error("Error updating waitlist entry", error);
            throw error;
        }
    }

    /**
     * Mark waitlist entry as notified
     * @returns {Promise<Waitlist>} The updated waitlist entry
     */
    async markNotified() {
        this.status = 'notified';
        this.notification_sent_at = new Date();
        await this.update();
        return this;
    }

    /**
     * Mark waitlist entry as converted to booking
     * @returns {Promise<Waitlist>} The updated waitlist entry
     */
    async markConverted() {
        this.status = 'converted';
        await this.update();
        return this;
    }

    /**
     * Remove entry from waitlist
     * @returns {Promise<boolean>} True if successful
     */
    async remove() {
        try {
            const stmt = db.prepare('DELETE FROM waitlist WHERE id = ?');
            const result = stmt.run(this.id);
            return result.changes > 0;
        } catch (error) {
            logger.error("Error removing waitlist entry", error);
            throw error;
        }
    }

    /**
     * Find a waitlist entry by ID
     * @param {number} id - The waitlist entry ID
     * @returns {Promise<Waitlist|null>} The waitlist entry or null if not found
     */
    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM waitlist WHERE id = ?');
            const row = stmt.get(id);
            
            return row ? new Waitlist(row) : null;
        } catch (error) {
            logger.error("Error fetching waitlist entry", error);
            throw error;
        }
    }

    /**
     * Find a user's waitlist entry for a specific event
     * @param {number} eventId - The event ID
     * @param {number} userId - The user ID
     * @returns {Promise<Waitlist|null>} The waitlist entry or null if not found
     */
    static async findByEventAndUser(eventId, userId) {
        try {
            const stmt = db.prepare('SELECT * FROM waitlist WHERE event_id = ? AND user_id = ?');
            const row = stmt.get(eventId, userId);
            
            return row ? new Waitlist(row) : null;
        } catch (error) {
            logger.error("Error fetching waitlist entry by event and user", error);
            throw error;
        }
    }

    /**
     * Find all waitlist entries for an event
     * @param {number} eventId - The event ID
     * @param {string} status - Optional status filter
     * @returns {Promise<Array<Waitlist>>} Array of waitlist entries
     */
    static async findByEvent(eventId, status = null) {
        try {
            let query = 'SELECT * FROM waitlist WHERE event_id = ?';
            let params = [eventId];
            
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY request_date ASC';
            
            const stmt = db.prepare(query);
            const rows = stmt.all(...params);
            
            return rows.map(row => new Waitlist(row));
        } catch (error) {
            logger.error("Error fetching waitlist entries", error);
            throw error;
        }
    }

    /**
     * Get waitlist statistics for an event
     * @param {number} eventId - The event ID
     * @returns {Promise<Object>} Waitlist statistics
     */
    static async getEventWaitlistStats(eventId) {
        try {
            const stmt = db.prepare(`
                SELECT 
                    COUNT(*) AS total_entries,
                    SUM(requested_tickets) AS total_requested_tickets,
                    SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) AS waiting_count,
                    SUM(CASE WHEN status = 'notified' THEN 1 ELSE 0 END) AS notified_count,
                    SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted_count
                FROM waitlist
                WHERE event_id = ?
            `);
            
            const stats = stmt.get(eventId);
            
            return {
                totalEntries: stats.total_entries || 0,
                totalRequestedTickets: stats.total_requested_tickets || 0,
                waitingCount: stats.waiting_count || 0,
                notifiedCount: stats.notified_count || 0,
                convertedCount: stats.converted_count || 0
            };
        } catch (error) {
            logger.error("Error getting waitlist statistics", error);
            throw error;
        }
    }

    /**
     * Process the waitlist when new tickets become available
     * @param {number} eventId - The event ID
     * @returns {Promise<Array>} Array of notified waitlist entries
     */
    static async processWaitlistForAvailableTickets(eventId) {
        try {
            // Get event availability
            const event = await Event.findById(eventId);
            const availability = await event.getBookingStats();
            
            if (availability.availableTickets <= 0) {
                return [];
            }
            
            // Get waiting entries in order of request
            const waitingEntries = await Waitlist.findByEvent(eventId, 'waiting');
            if (waitingEntries.length === 0) {
                return [];
            }
            
            const notifiedEntries = [];
            let availableTickets = availability.availableTickets;
            
            // Notify users based on availability and request order
            for (const entry of waitingEntries) {
                // Only notify if we can fulfill their ticket request
                if (entry.requested_tickets <= availableTickets) {
                    await entry.markNotified();
                    availableTickets -= entry.requested_tickets;
                    notifiedEntries.push(entry);
                }
                
                // Stop if we've allocated all available tickets
                if (availableTickets <= 0) {
                    break;
                }
            }
            
            return notifiedEntries;
        } catch (error) {
            logger.error("Error processing waitlist", error);
            throw error;
        }
    }
}

export default Waitlist;
