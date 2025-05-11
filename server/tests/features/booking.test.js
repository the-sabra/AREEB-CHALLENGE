import { describe, expect, it, beforeEach, vi } from 'vitest'
import bookingService from '../../services/booking.service.js'
import Booking from '../../models/booking.model.js'
import Event from '../../models/event.model.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import e from 'express'

// Mock dependencies
vi.mock('../../models/booking.model.js', () => {
    class MockBooking {
        constructor(data) {
            Object.assign(this, data)
            this.save = vi.fn().mockResolvedValue({ id: 1, ...data })
            this.getEvent = vi.fn()
        }
    }
    
    MockBooking.findByUser = vi.fn();
    MockBooking.findByEventAndUser = vi.fn();
    MockBooking.getAvailabilityForEvent = vi.fn();
    MockBooking.count = vi.fn();
    
    return { default: MockBooking };
})
vi.mock('../../models/event.model.js')
// vi.mock('../../utils/ApiResponse.js')
vi.mock('../../config/logger.js', () => ({
    default: {
        error: vi.fn()
    }
}))

describe('Booking Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getUserBookings', () => {
        it('should get all bookings for a user', async () => {
            const mockBookings = [
                { id: 1, event_id: 1, user_id: 1, getEvent: vi.fn() },
                { id: 2, event_id: 2, user_id: 1, getEvent: vi.fn() }
            ]
            
            const mockEvents = [
                { id: 1, name: 'Event 1', date: '2023-05-10', venue: 'Venue 1', image: 'image1.jpg' },
                { id: 2, name: 'Event 2', date: '2023-05-15', venue: 'Venue 2', image: 'image2.jpg' }
            ]
            
            mockBookings[0].getEvent.mockResolvedValue(mockEvents[0])
            mockBookings[1].getEvent.mockResolvedValue(mockEvents[1])
            
            Booking.findByUser.mockResolvedValue(mockBookings)
            
            const result = await bookingService.getUserBookings(1)
            
            expect(result).toHaveLength(2)
            expect(result[0].event).toEqual(expect.objectContaining({
                id: mockEvents[0].id,
                name: mockEvents[0].name
            }))
            expect(Booking.findByUser).toHaveBeenCalledWith(1)
        })
    })

    describe('getEventBookings', () => {
        it('should get all bookings for an event', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                getBookings: vi.fn().mockResolvedValue([
                    { id: 1, event_id: 1, user_id: 1 },
                    { id: 2, event_id: 1, user_id: 2 }
                ])
            }
            
            Event.findById.mockResolvedValue(mockEvent)
            
            const result = await bookingService.getEventBookings(1)
            expect(result).toHaveLength(2)
            expect(mockEvent.getBookings).toHaveBeenCalled()
        })

        it('should throw error if event not found', async () => {
            Event.findById.mockResolvedValue(null)
            try {
                await bookingService.getEventBookings(999)
            } catch (error) {
                expect(error).toBeInstanceOf(ApiResponse)
            }
        })
    })

    describe('createBooking', () => {
        it('should create a new booking', async () => {
            const mockEvent = { id: 1, name: 'Test Event' }
            const mockBooking = { id: 1, event_id: 1, user_id: 1, ticket_count: 2 }
            
            Event.findById.mockResolvedValue(mockEvent)
            Booking.findByEventAndUser.mockResolvedValue(null)
            // Booking.prototype.getEvent.mockResolvedValue(mockEvent)
            
             await bookingService.createBooking(1, 1, 2)

            expect(Booking.findByEventAndUser).toHaveBeenCalledWith(1, 1)
            expect(Event.findById).toHaveBeenCalledWith(1)
        })

        it('should throw error if event not found', async () => {
            Event.findById.mockResolvedValue(null)
            try {
                await bookingService.createBooking(999, 1, 2)
            } catch (error) {
                expect(error).toBeInstanceOf(ApiResponse)
                expect(error.statusCode).toBe(404)
                expect(error.message).toBe('Event not found')
            }
        })

        it('should throw error if booking already exists', async () => {
            const mockBooking = { id: 1, event_id: 1, user_id: 1 }
            Booking.findByEventAndUser.mockResolvedValue(mockBooking)
            Event.findById.mockResolvedValue({ id: 1, name: 'Test Event' })
            try {
                await bookingService.createBooking(1, 1, 2)
            } catch (error) {
                expect(error).toBeInstanceOf(ApiResponse)
                expect(error.statusCode).toBe(400)
                expect(error.message).toBe('You already have a booking for this event')
            }
        })
    })

    describe('getEventAvailability', () => {
        it('should get availability for an event', async () => {
            const mockAvailability = {
                total: 100,
                booked: 25,
                available: 75
            }
            
            Booking.getAvailabilityForEvent.mockResolvedValue(mockAvailability)
            
            const result = await bookingService.getEventAvailability(1)
            
            expect(result).toEqual(mockAvailability)
            expect(Booking.getAvailabilityForEvent).toHaveBeenCalledWith(1)
        })
    })
    
    describe('getUserEvents', () => {
        it('should get all events for a user', async () => {
            const mockBookings = [
                { id: 1, event_id: 1, user_id: 1, getEvent: vi.fn() },
                { id: 2, event_id: 2, user_id: 1, getEvent: vi.fn() }
            ]
            
            const mockEvents = [
                { id: 1, name: 'Event 1', date: '2023-05-10', venue: 'Venue 1', image: 'image1.jpg' },
                { id: 2, name: 'Event 2', date: '2023-05-15', venue: 'Venue 2', image: 'image2.jpg' }
            ]
            
            mockBookings[0].getEvent.mockResolvedValue(mockEvents[0])
            mockBookings[1].getEvent.mockResolvedValue(mockEvents[1])
            
            Booking.findByUser.mockResolvedValue(mockBookings)
            
            const result = await bookingService.getUserEvents(1)
            
            expect(result).toHaveLength(2)
            expect(result[0].id).toBe(mockEvents[0].id)
            expect(result[1].id).toBe(mockEvents[1].id)
            expect(Booking.findByUser).toHaveBeenCalledWith(1)
        })
    })
    
    describe('getBookingCount', () => {
        it('should get total booking count', async () => {
            Booking.count.mockResolvedValue(10)
            
            const result = await bookingService.getBookingCount()
            
            expect(result).toBe(10)
            expect(Booking.count).toHaveBeenCalled()
        })
    })
})
