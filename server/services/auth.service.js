import userService from "./user.service.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt';
import jwt from '../utils/jwt.js';


class AuthService {
    async register({ email, password, name }) {
        try {
            const existingUser = await userService.getUserByEmail(email);
            if (existingUser) {
                throw new ApiResponse(404, 'Email already exists');
            }
            const user = new User({ name, email, password });
            const savedUser = await user.save();
            const token = jwt.sign({ userId: savedUser.id });
            return { user: savedUser, token };
        } catch (error) {
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            const user = await userService.getUserByEmail(email);
            if (!user) {
                throw new ApiResponse(401,'Invalid email or password');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                console.error("Invalid password");
                throw new ApiResponse(401,'Invalid email or password');
            }
        
            const token = jwt.sign({ userId: user.id });
            
            user.password = undefined;
            return { user , token };
        } catch (error) {
            throw error;
        }
    }
}

const authService = new AuthService();
export default authService;