import Waitlist from '../models/waitlist.model.js';
import Event from '../models/event.model.js';
import apiResponse from '../utils/ApiResponse.js';
import logger from '../config/logger.js';

/**
 * Join waitlist for a sold-out event
 */
export const joinWaitlist = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const { requestedTickets = 1 } = req.body;
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return apiResponse.notFound(res, "Event not found");
        }
        
        // Check if the event date has passed
        const eventDate = new Date(event.date);
        if (eventDate < new Date()) {
            return apiResponse.badRequest(res, "Cannot join waitlist for a past event");
        }
        
        // Create waitlist entry
        const waitlistEntry = new Waitlist({
            event_id: eventId,
            user_id: userId,
            requested_tickets: requestedTickets
        });
        
        await waitlistEntry.save();
        
        // Get waitlist stats
        const waitlistStats = await Waitlist.getEventWaitlistStats(eventId);
        
        return apiResponse.created(res, "Added to waitlist successfully", {
            waitlistEntry,
            waitlistStats,
            position: waitlistStats.waitingCount // Approximate position
        });
    } catch (error) {
        logger.error("Error joining waitlist", error);
        
        if (error.message === 'Event is not sold out, direct booking is possible') {
            return apiResponse.badRequest(res, error.message);
        }
        
        if (error.message === 'You are already on the waitlist for this event') {
            return apiResponse.badRequest(res, error.message);
        }
        
        return apiResponse.serverError(res, error.message);
    }
};

/**
 * Leave waitlist for an event
 */
export const leaveWaitlist = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Find the waitlist entry
        const waitlistEntry = await Waitlist.findByEventAndUser(eventId, userId);
        if (!waitlistEntry) {
            return apiResponse.notFound(res, "You are not on the waitlist for this event");
        }
        
        // Remove from waitlist
        await waitlistEntry.remove();
        
        return apiResponse.success(res, "Removed from waitlist successfully");
    } catch (error) {
        logger.error("Error leaving waitlist", error);
        return apiResponse.serverError(res, error.message);
    }
};

/**
 * Check user's waitlist status for an event
 */
export const checkWaitlistStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return apiResponse.notFound(res, "Event not found");
        }
        
        // Check if user is on waitlist
        const waitlistEntry = await Waitlist.findByEventAndUser(eventId, userId);
        const isOnWaitlist = !!waitlistEntry;
        
        // Get waitlist stats
        const waitlistStats = await Waitlist.getEventWaitlistStats(eventId);
        
        // Calculate position if on waitlist
        let position = null;
        if (isOnWaitlist && waitlistEntry.status === 'waiting') {
            const allWaiting = await Waitlist.findByEvent(eventId, 'waiting');
            position = allWaiting.findIndex(entry => entry.id === waitlistEntry.id) + 1;
        }
        
        return apiResponse.success(res, "Waitlist status retrieved successfully", {
            isOnWaitlist,
            waitlistEntry,
            waitlistStats,
            position,
            canBook: waitlistEntry && waitlistEntry.status === 'notified'
        });
    } catch (error) {
        logger.error("Error checking waitlist status", error);
        return apiResponse.serverError(res, error.message);
    }
};

/**
 * Get waitlist for an event (admin only)
 */
export const getEventWaitlist = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return apiResponse.notFound(res, "Event not found");
        }
        
        // Get waitlist entries
        const waitlistEntries = await Waitlist.findByEvent(eventId);
        
        // Get user details for each entry
        const entriesWithUserDetails = await Promise.all(
            waitlistEntries.map(async (entry) => {
                const userStmt = db.prepare('SELECT id, name, email FROM users WHERE id = ?');
                const user = userStmt.get(entry.user_id);
                
                return {
                    ...entry,
                    user: user ? { id: user.id, name: user.name, email: user.email } : null
                };
            })
        );
        
        // Get waitlist stats
        const waitlistStats = await Waitlist.getEventWaitlistStats(eventId);
        
        return apiResponse.success(res, "Event waitlist retrieved successfully", {
            waitlist: entriesWithUserDetails,
            stats: waitlistStats
        });
    } catch (error) {
        logger.error("Error getting event waitlist", error);
        return apiResponse.serverError(res, error.message);
    }
};

/**
 * Process waitlist notifications for an event (admin only)
 */
export const processWaitlist = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return apiResponse.notFound(res, "Event not found");
        }
        
        // Process waitlist
        const notifiedEntries = await Waitlist.processWaitlistForAvailableTickets(eventId);
        
        // In a real app, you would send emails to notified users here
        
        return apiResponse.success(res, "Waitlist processed successfully", {
            notifiedCount: notifiedEntries.length,
            notifiedEntries
        });
    } catch (error) {
        logger.error("Error processing waitlist", error);
        return apiResponse.serverError(res, error.message);
    }
};

export default {
    joinWaitlist,
    leaveWaitlist,
    checkWaitlistStatus,
    getEventWaitlist,
    processWaitlist
};
