import adminSerivce from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

class AdminController {
    async status(req, res, next) {
        try {
            const stats = await adminSerivce.status();
            res.json(
                ApiResponse.success(
                    200,
                    stats,
                    'Admin dashboard statistics retrieved successfully'
                )
            );
        } catch (error) {
            next(error);
        }
    }
}

const adminController = new AdminController();
export default adminController;