import express from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
const router  = express.Router();  

router.get('/status', authenticate, isAdmin, AdminController.status); 



export default router;