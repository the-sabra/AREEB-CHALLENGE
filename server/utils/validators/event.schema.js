import { body, param, query } from "express-validator";

/**
 * Validation schema for event ID
 */
export const eventIdSchema = [
    param('eventId').exists().isNumeric().withMessage('Event ID must be a number'),
];

/**
 * Validation schema for event creation
 */
export const createEventSchema = [
    body('name').exists().isString().withMessage('Event name is required'),
    body('description').optional().isString(),
    body('date').exists().isString().withMessage('Event date is required'),
    body('venue').exists().isString().withMessage('Event venue is required'),
    body('location_link').optional().isString(),
    body('price').exists().isNumeric().withMessage('Price must be a number'),
    body('capacity').exists().isNumeric().withMessage('Capacity must be a number'),
    body('category_id').exists().isNumeric().withMessage('Category ID is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array of IDs'),
    body('tags.*').optional().isNumeric().withMessage('Each tag ID must be a number'),
];

/**
 * Validation schema for event updates
 */
export const updateEventSchema = [
    param('eventId').exists().isNumeric().withMessage('Event ID must be a number'),
    body('name').optional().isString(),
    body('image').optional().isString(),
    body('description').optional().isString(),
    body('date').optional().isString(),
    body('venue').optional().isString(),
    body('location_link').optional().isString(),
    body('category_id').optional().isNumeric(),
    body('tags').optional().isArray().withMessage('Tags must be an array of IDs'),
    body('tags.*').optional().isNumeric().withMessage('Each tag ID must be a number'),
];

/**
 * Validation schema for event query parameters
 */
export const eventQuerySchema = [
    query('page').optional().isNumeric().withMessage('Page must be a number'),
    query('limit').optional().isNumeric().withMessage('Limit must be a number'),
    query('category_id').optional().isNumeric().withMessage('Category ID must be a number'),
    query('tag_id').optional().isNumeric().withMessage('Tag ID must be a number'),
    query('date_from').optional().isString(),
    query('date_to').optional().isString(),
];

/**
 * Validation schema for category creation
 */
export const createCategorySchema = [
    body('name').exists().isString().withMessage('Category name is required'),
];

/**
 * Validation schema for tag creation
 */
export const createTagSchema = [
    body('name').exists().isString().withMessage('Tag name is required'),
];