import { describe, expect, it, beforeEach, vi } from 'vitest'
import eventService from '../../services/event.service.js'
import Event from '../../models/event.model.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import db from '../../config/db.js'

// Mock dependencies
vi.mock('../../models/event.model.js')
vi.mock('../../utils/fileUpload.js', () => ({
    getFileUrl: vi.fn(file => `http://localhost:3000/uploads/${file}`),
}))
vi.mock('../../config/logger.js', () => ({
    default: {
        error: vi.fn()
    }
}))
vi.mock('../../config/db.js', () => ({
    default: {
        prepare: vi.fn()
    }
}))

describe('Event Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createEvent', () => {
        it('should create event successfully', async () => {
            const eventData = {
                name: 'Test Event',
                description: 'Test Description',
                date: '2023-06-01',
                venue: 'Test Venue',
                price: 100,
                capacity: 50,
                category_id: 1,
                tags: ['tag1', 'tag2']
            }
            
            const mockSave = vi.fn().mockResolvedValue({
                id: 1,
                ...eventData
            })
            
            Event.mockImplementation((data) => {
                return {
                    ...data,
                    save: mockSave
                }
            })
            
            const result = await eventService.createEvent(eventData)
            
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                tags: ['tag1', 'tag2']
            }))
            expect(mockSave).toHaveBeenCalled()
        })
        
        it('should handle events without tags', async () => {
            const eventData = {
                name: 'Test Event',
                description: 'Test Description',
                date: '2023-06-01',
                venue: 'Test Venue',
                price: 100,
                capacity: 50,
                category_id: 1
            }
            
            const mockSave = vi.fn().mockResolvedValue({
                id: 1,
                ...eventData
            })
            
            Event.mockImplementation((data) => {
                return {
                    ...data,
                    save: mockSave
                }
            })
            
            const result = await eventService.createEvent(eventData)
            
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event'
            }))
            expect(mockSave).toHaveBeenCalled()
        })
    })

    describe('getEventById', () => {
        it('should get event with category', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                description: 'Test Description',
                getCategory: vi.fn().mockResolvedValue({ id: 1, name: 'Category 1' })
            }
            
            Event.findById.mockResolvedValue(mockEvent)
            
            const result = await eventService.getEventById(1)
            
            expect(result.id).toBe(1)
            expect(result.category).toEqual({ id: 1, name: 'Category 1' })
            expect(Event.findById).toHaveBeenCalledWith(1)
        })
        
        it('should throw error if event not found', async () => {
            Event.findById.mockResolvedValue(null)
            
            try {
                await eventService.getEventById(999)
            } catch (error) {
                expect(error).toBeInstanceOf(ApiResponse)
                expect(error.statusCode).toBe(404)
                expect(error.message).toBe('Event not found')      
            }
        })
    })

    describe('updateEvent', () => {
        it('should update event successfully', async () => {
            const mockEvent = {
                id: 1,
                name: 'Old Name',
                description: 'Old Description',
                update: vi.fn().mockResolvedValue({
                    id: 1,
                    name: 'New Name',
                    description: 'New Description'
                })
            }
            
            Event.findById.mockResolvedValue(mockEvent)
            
            const updates = {
                name: 'New Name',
                description: 'New Description'
            }
            
            const result = await eventService.updateEvent(1, updates)
            
            expect(result.name).toBe('New Name')
            expect(result.description).toBe('New Description')
            expect(mockEvent.update).toHaveBeenCalled()
        })
        
        it('should update event tags', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                tags: ['oldTag'],
                update: vi.fn().mockResolvedValue({
                    id: 1,
                    name: 'Test Event',
                    tags: ['newTag1', 'newTag2']
                })
            }
            
            Event.findById.mockResolvedValue(mockEvent)
            
            const updates = {
                tags: ['newTag1', 'newTag2']
            }
            
            const result = await eventService.updateEvent(1, updates)
            
            expect(result.tags).toEqual(['newTag1', 'newTag2'])
            expect(mockEvent.tags).toEqual(['newTag1', 'newTag2'])
            expect(mockEvent.update).toHaveBeenCalled()
        })
        
        it('should throw error if event not found', async () => {
            Event.findById.mockResolvedValue(null)
            
            await expect(eventService.updateEvent(999, { name: 'New Name' }))
                .rejects.toThrow('Event not found')
        })
    })

    describe('deleteEvent', () => {
        it('should delete event successfully', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                delete: vi.fn().mockResolvedValue(true)
            }
            
            Event.findById.mockResolvedValue(mockEvent)
            
            const result = await eventService.deleteEvent(1)
            
            expect(result).toBe(true)
            expect(mockEvent.delete).toHaveBeenCalled()
        })
        
        it('should throw error if event not found', async () => {
            Event.findById.mockResolvedValue(null)
            
            await expect(eventService.deleteEvent(999))
                .rejects.toThrow('Event not found')
        })
    })

    describe('getAllEvents', () => {
        it('should get events with pagination and category info', async () => {
            const mockEvents = [
                { 
                    id: 1, 
                    name: 'Event 1',
                    getCategory: vi.fn().mockResolvedValue({ id: 1, name: 'Category 1' })
                },
                { 
                    id: 2, 
                    name: 'Event 2',
                    getCategory: vi.fn().mockResolvedValue({ id: 2, name: 'Category 2' })
                }
            ]
            
            const mockPagination = {
                totalItems: 2,
                totalPages: 1,
                currentPage: 1
            }
            
            Event.findAll.mockResolvedValue({
                events: mockEvents,
                pagination: mockPagination
            })
            
            const result = await eventService.getAllEvents(1, 10, { category: 1 })
            
            expect(result.events).toHaveLength(2)
            expect(result.events[0].category).toEqual({ id: 1, name: 'Category 1' })
            expect(result.pagination).toEqual(mockPagination)
            expect(Event.findAll).toHaveBeenCalledWith(1, 10, { category: 1 })
        })
    })

    describe('getAllCategories', () => {
        it('should get all categories', async () => {
            const mockCategories = [
                { id: 1, name: 'Category 1' },
                { id: 2, name: 'Category 2' }
            ]
            
            const mockStmt = {
                all: vi.fn().mockReturnValue(mockCategories)
            }
            
            db.prepare.mockReturnValue(mockStmt)
            
            const result = await eventService.getAllCategories()
            
            expect(result).toEqual(mockCategories)
            expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM category ORDER BY name')
            expect(mockStmt.all).toHaveBeenCalled()
        })
    })

    describe('createCategory', () => {
        it('should create category successfully', async () => {
            const mockResult = {
                lastInsertRowid: 1
            }
            
            const mockStmt = {
                run: vi.fn().mockReturnValue(mockResult)
            }
            
            db.prepare.mockReturnValue(mockStmt)
            
            const result = await eventService.createCategory({ name: 'New Category' })
            
            expect(result).toEqual({
                id: 1,
                name: 'New Category'
            })
            expect(db.prepare).toHaveBeenCalledWith('INSERT INTO category (name) VALUES (?)')
            expect(mockStmt.run).toHaveBeenCalledWith('New Category')
        })
        
        it('should throw error if category name is missing', async () => {

            try {
                await eventService.createCategory({ name: '' })
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Category name is required')   
            }
        })
        
        it('should handle unique constraint error', async () => {
            const mockStmt = {
                run: vi.fn().mockImplementation(() => {
                    const err = new Error('UNIQUE constraint failed');
                    err.code = 'SQLITE_CONSTRAINT_UNIQUE';
                    throw err;
                })
            }
            
            db.prepare.mockReturnValue(mockStmt)
            
            try {
                await eventService.createCategory({ name: 'Existing Category' })
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Category name must be unique')
                
            }
        })
    })

    describe('getAllTags', () => {
        it('should get all tags', async () => {
            const mockTags = [
                { id: 1, name: 'Tag 1' },
                { id: 2, name: 'Tag 2' }
            ]
            
            const mockStmt = {
                all: vi.fn().mockReturnValue(mockTags)
            }
            
            db.prepare.mockReturnValue(mockStmt)
            
            const result = await eventService.getAllTags()
            
            expect(result).toEqual(mockTags)
            expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM tags ORDER BY name')
            expect(mockStmt.all).toHaveBeenCalled()
        })
    })

    describe('getEventCount', () => {
        it('should get total event count', async () => {
            Event.count.mockResolvedValue(10)
            
            const result = await eventService.getEventCount()
            
            expect(result).toBe(10)
            expect(Event.count).toHaveBeenCalled()
        })
    })

    describe('getUpcomingEventsCount', () => {
        it('should get upcoming events count', async () => {
            Event.UpComingCount.mockResolvedValue(5)
            
            const result = await eventService.getUpcomingEventsCount()
            
            expect(result).toBe(5)
            expect(Event.UpComingCount).toHaveBeenCalled()
        })
    })
})
