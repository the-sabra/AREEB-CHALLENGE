import express from 'express';
import bookingController from '../controllers/booking.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { checkUserPermission } from '../middleware/user.permission.js';
import validate from '../middleware/validation.js';
import { createBooking, updateBooking } from '../utils/validators/booking.schema.js';

const router = express.Router();

router.use(authenticate);

// User booking routes
router.post('/event/:eventId', createBooking, validate, bookingController.createBooking);

// Admin/organizer routes
router.get('/event/:eventId', isAdmin, bookingController.getEventBookings);

export default router;
