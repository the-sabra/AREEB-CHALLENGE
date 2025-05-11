import { describe, expect, it, beforeEach, vi } from 'vitest'
import adminService from '../../services/admin.service.js'
import userService from '../../services/user.service.js'
import eventService from '../../services/event.service.js'
import bookingService from '../../services/booking.service.js'

vi.mock('../../services/user.service.js')
vi.mock('../../services/event.service.js')
vi.mock('../../services/booking.service.js')
vi.mock('../../config/logger.js', () => ({
    default: {
        error: vi.fn()
    }
}))

describe('Admin Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('status', () => {
        it('should return dashboard statistics', async () => {
            // Mock the dependencies
            eventService.getEventCount.mockResolvedValue(100)
            eventService.getUpcomingEventsCount.mockResolvedValue(50)
            userService.getUserCount.mockResolvedValue(200)
            bookingService.getBookingCount.mockResolvedValue(150)
            
            const result = await adminService.status()
            
            expect(result).toEqual({
                totalEvents: 100,
                upcomingEvents: 50,
                totalUsers: 200,
                registrations: 150
            })
            
            expect(eventService.getEventCount).toHaveBeenCalled()
            expect(eventService.getUpcomingEventsCount).toHaveBeenCalled()
            expect(userService.getUserCount).toHaveBeenCalled()
            expect(bookingService.getBookingCount).toHaveBeenCalled()
        })
        
        it('should handle errors properly', async () => {
            // Mock an error
            const error = new Error('Database error')
            eventService.getEventCount.mockRejectedValue(error)
            
            await expect(adminService.status())
                .rejects.toThrow('Error fetching admin dashboard statistics')
        })
    })
})
