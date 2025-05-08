import db from '../config/db.js';
import logger from '../config/logger.js';
import Event from './event.model.js';

/**
 * Booking model class for handling event booking operations
 */
class Booking {
    /**
     * Create a new Booking instance
     * @param {Object} bookingData - The booking data
     */
    constructor({ event_id, user_id, ticket_count }) {
        this.event_id = event_id;
        this.user_id = user_id;
        this.ticket_count = ticket_count || 1; 
    }

    /**
     * Save the booking to the database
     * @returns {Promise<Booking>} The saved booking
     */
    async save() {
        try {
            if (this.id) {
                return await this.update();
            }

            const event = await Event.findById(this.event_id);
            if (!event) {
                throw new Error('Event not found');
            }

            // Check if there's enough capacity
            const bookingsStmt = db.prepare('SELECT SUM(ticket_count) as booked FROM bookings WHERE event_id = ?');
            const result = bookingsStmt.get(this.event_id);
            const currentlyBooked = result.booked || 0;
            
            if (currentlyBooked + this.ticket_count > event.capacity) {
                throw new Error('Not enough tickets available');
            }


            const stmt = db.prepare(
                'INSERT INTO bookings (event_id, user_id, ticket_count) VALUES (?, ?, ?)'
            );
            
            const insertResult = stmt.run(
                this.event_id,
                this.user_id,
                this.ticket_count
            );
            
            this.id = insertResult.lastInsertRowid;

            // Update event attendees count
            // await this.updateEventAttendees(this.event_id);

            return this;
        } catch (error) {
            logger.error("Error saving booking", error);
            throw error;
        }
    }

    /**
     * Update an existing booking
     * @returns {Promise<Booking|null>} The updated booking or null if not found
     */
    async update() {
        try {
            const validFields = ['status', 'payment_status', 'ticket_count'];
            
            const updates = Object.fromEntries(
                Object.entries(this).filter(([key]) => validFields.includes(key))
            );
            
            // If changing ticket count, check availability
            if ('ticket_count' in updates && updates.ticket_count !== this.ticket_count) {
                const event = await Event.findById(this.event_id);
                const bookingsStmt = db.prepare(
                    'SELECT SUM(ticket_count) as booked FROM bookings WHERE event_id = ? AND id != ? AND status != "cancelled"'
                );
                const result = bookingsStmt.get(this.event_id, this.id);
                const otherBookings = result.booked || 0;
                
                if (otherBookings + updates.ticket_count > event.capacity) {
                    throw new Error('Not enough tickets available for this update');
                }

                // Recalculate payment amount if ticket count changed
                updates.payment_amount = event.price * updates.ticket_count;
            }
            
            if (Object.keys(updates).length === 0) return this;
            
            const query = `UPDATE bookings SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
            const values = [...Object.values(updates), this.id];
            
            const stmt = db.prepare(query);
            const result = stmt.run(...values);


            
            return result.changes > 0 ? this : null;
        } catch (error) {
            logger.error("Error updating booking", error);
            throw error;
        }
    }    /**
     * Cancel a booking
     * @returns {Promise<Booking>} The cancelled booking
     */
    async cancel() {
        try {
            this.status = 'cancelled';
            await this.update();
            
            // Process waitlist if there is one
            const Waitlist = (await import('./waitlist.model.js')).default;
            await Waitlist.processWaitlistForAvailableTickets(this.event_id);
            
            return this;
        } catch (error) {
            logger.error("Error cancelling booking", error);
            throw error;
        }
    }

    /**
     * Mark a booking as attended
     * @returns {Promise<Booking>} The attended booking
     */
    async markAttended() {
        this.status = 'attended';
        await this.update();
        return this;
    }

    /**
     * Complete payment for a booking
     * @returns {Promise<Booking>} The booking with completed payment
     */
    async completePayment() {
        this.payment_status = 'completed';
        await this.update();
        return this;
    }

    /**
     * Delete a booking
     * @returns {Promise<boolean>} True if successful
     */
    async delete() {
        try {
            const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
            const result = stmt.run(this.id);
            
            
            return result.changes > 0;
        } catch (error) {
            logger.error("Error deleting booking", error);
            throw error;
        }
    }

    /**
     * Find a booking by ID
     * @param {number} id - The booking ID
     * @returns {Promise<Booking|null>} The booking or null if not found
     */
    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
            const row = stmt.get(id);
            
            return row ? new Booking(row) : null;
        } catch (error) {
            logger.error("Error fetching booking", error);
            throw error;
        }
    }


    /**
     * Find all bookings for an event
     * @param {number} eventId - The event ID
     * @returns {Promise<Array<Booking>>} Array of bookings
     */
    static async findByEvent(eventId) {
        try {
            const stmt = db.prepare('SELECT * FROM bookings WHERE event_id = ?');
            const rows = stmt.all(eventId);
            
            return rows.map(row => new Booking(row));
        } catch (error) {
            logger.error("Error fetching bookings by event", error);
            throw error;
        }
    }

    /**
     * Find all bookings for a user
     * @param {number} userId - The user ID
     * @returns {Promise<Array<Booking>>} Array of bookings
     */
    static async findByUser(userId) {
        try {
            const stmt = db.prepare('SELECT * FROM bookings WHERE user_id = ?');
            const rows = stmt.all(userId);
            
            return rows.map(row => new Booking(row));
        } catch (error) {
            logger.error("Error fetching bookings by user", error);
            throw error;
        }
    }

    /**
     * Get available tickets for an event
     * @param {number} eventId - The event ID
     * @returns {Promise<Object>} Object with capacity, booked, and available counts
     */
    static async getAvailabilityForEvent(eventId) {
        try {
            // Get event capacity
            const eventStmt = db.prepare('SELECT capacity FROM events WHERE id = ?');
            const event = eventStmt.get(eventId);
            
            if (!event) {
                throw new Error('Event not found');
            }
            
            // Get booked tickets
            const bookingsStmt = db.prepare(`
                SELECT SUM(ticket_count) as booked
                FROM bookings
                WHERE event_id = ? AND status != 'cancelled'
            `);
            const bookings = bookingsStmt.get(eventId);
            
            const capacity = event.capacity;
            const booked = bookings.booked || 0;
            const available = capacity - booked;
            
            return { capacity, booked, available };
        } catch (error) {
            logger.error("Error getting event availability", error);
            throw error;
        }
    }
    
    async getEvent(){
        try {
            const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
            const row = stmt.get(this.event_id);
            
            return row ? new Event(row) : null;
        } catch (error) {
            logger.error("Error fetching event", error);
            throw error;
        }
    }
}


export default Booking;
