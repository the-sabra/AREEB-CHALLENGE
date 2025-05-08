import express from 'express';
import validate from '../middleware/validation.js';
import { 
    eventIdSchema, 
    createEventSchema, 
    updateEventSchema, 
    eventQuerySchema,
    createCategorySchema,
    createTagSchema
} from '../utils/validators/event.schema.js';
import eventController from '../controllers/event.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Category routes
router.get('/categories', eventController.getAllCategories);
router.post('/categories', authenticate, isAdmin, createCategorySchema, validate, eventController.createCategory);

// Tag routes
router.get('/tagss', eventController.getAllTags);
router.post('/tags', authenticate, isAdmin, createTagSchema, validate, eventController.createTag);

// Event routes
router.get('/', eventQuerySchema, validate, eventController.getAllEvents);
router.get('/:eventId', eventIdSchema, validate, eventController.getEvent);
router.post('/', authenticate, isAdmin, createEventSchema, validate, eventController.createEvent);
router.put('/:eventId', authenticate, isAdmin, updateEventSchema, validate, eventController.updateEvent);
router.delete('/:eventId', authenticate, isAdmin, eventIdSchema, validate, eventController.deleteEvent);

export default router;