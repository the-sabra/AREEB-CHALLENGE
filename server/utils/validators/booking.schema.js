import { body } from 'express-validator';

export const createBooking = [
    body('ticketCount')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Number of tickets to book must be between 1 and 10')
        .customSanitizer(value => value === undefined ? 1 : value)
];

export const updateBooking = [
    body('ticketCount')
        .exists()
        .withMessage('ticketCount is required')
        .isInt({ min: 1, max: 10 })
        .withMessage('Number of tickets for the booking must be between 1 and 10')
];

