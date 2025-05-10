import userService from "./user.service.js";
import eventService from "./event.service.js";
import bookingService from "./booking.service.js";
import logger from '../config/logger.js';

class AdminService {
    /**
     * Get admin dashboard statistics
     * @returns {Promise<Object>} Dashboard statistics
     */
    async status() {
        try {
            const totalEvents = await eventService.getEventCount();        
            const upcomingEvents = await eventService.getUpcomingEventsCount();
            console.log("upcomingEvents", upcomingEvents);
            const totalUsers = await userService.getUserCount();
            
            const registrations = await bookingService.getBookingCount();
            
            return {
                totalEvents,
                totalUsers,
                registrations,
                upcomingEvents
            };
        } catch (error) {
            logger.error("Error getting admin stats", error);
            throw new Error('Error fetching admin dashboard statistics');
        }
    }
}

const adminService = new AdminService();
export default adminService;