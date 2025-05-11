import db from '../config/db.js';
import * as bcrypt from 'bcrypt';
import logger from '../config/logger.js';
import Event from './event.model.js'; 

class User {
    constructor({ id, name, email, password, is_admin}) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.is_admin = is_admin || false; 
    }

    async save() {
        try {
            if (this.id) {
                return await this.update();
            }
            this.password = await this.hashPassword(this.password);
            const stmt = db.prepare(
                'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)'
            );
            const result = stmt.run(this.name, this.email, this.password);
            this.id = result.lastInsertRowid;
            this.password = undefined;
            return this; 
        } catch (error) {
            logger.error("Error saving user", error);
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('Email already exists');
            }
            throw new Error('Error saving user');
        }
    }

    async update() {
        try {
            const validFields = ['name', 'email', 'password']; 

            const updates = Object.fromEntries(
                Object.entries(this).filter(([key]) => validFields.includes(key))
            );
            
            if ('is_admin' in updates) {
                updates.is_admin = updates.is_admin ? 1 : 0;
            }
            
            const query = `UPDATE users SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
            const values = [...Object.values(updates), this.id];
            
            const stmt = db.prepare(query);
            const result = stmt.run(...values);
            
            this.password = undefined;
            return result.changes > 0 ? this : null;
        } catch (error) {
            logger.error("Error updating user", error);
            throw new Error('Error updating user');
        }
    }

    async delete() {
        try {
            const stmt = db.prepare('DELETE FROM users WHERE id = ?');
            const result = stmt.run(this.id);
            return result.changes > 0;
        } catch (error) {
            throw new Error('Error deleting user');
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
            const row = stmt.get(id);
            return row ? new User(row) : null;
        } catch (error) {
            logger.error("Error fetching user", error);
            throw new Error('Error fetching user');
        }
    }

    static async findByEmail(email) {
        try {
            const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
            const row = stmt.get(email);
            return row ? new User(row) : null;
        } catch (error) {
            logger.error("Error fetching user", error);
            throw new Error('Error fetching user');
        }
    }

    static async findAll(page, limit, filters = {}) {
        try {
            const numLimit = parseInt(limit, 10);
            const numPage = parseInt(page, 10);
            const offset = (numPage - 1) * numLimit;
            
            let query = 'SELECT * FROM users';
            let countQuery = 'SELECT COUNT(*) as count FROM users';
            let queryParams = [];
            let whereConditions = [];

            if (filters.name || filters.email) {
                if (filters.name) whereConditions.push('name LIKE ?');
                if (filters.email) whereConditions.push('email = ?');

                queryParams = [
                    ...(filters.name ? [`%${filters.name}%`] : []),
                    ...(filters.email ? [filters.email] : []),
                ];
            }

            if (filters.start_date && filters.end_date) {
                whereConditions.push('created_at BETWEEN ? AND ?');
                queryParams.push(new Date(filters.start_date).toISOString(), new Date(filters.end_date).toISOString());
            }

            if (whereConditions.length > 0) {
                const whereClause = ' WHERE ' + whereConditions.join(' AND ');
                query += whereClause;
                countQuery += whereClause;
            }

            // Add pagination
            query += ' LIMIT ?, ?';
            
            let stmt = db.prepare(query);
            let rows;
            
            if (queryParams.length > 0) {
                const allParams = [...queryParams, offset, numLimit];
                const runQuery = stmt.bind(...allParams);
                rows = runQuery.all();
            } else {
                rows = stmt.all(offset, numLimit);
            }
            
            stmt = db.prepare(countQuery);
            let totalCountRow;
            
            if (queryParams.length > 0) {
                const runCountQuery = stmt.bind(...queryParams);
                totalCountRow = runCountQuery.get();
            } else {
                totalCountRow = stmt.get();
            }
            
            const verifiedStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_verified = 1');
            const totalVerifiedRow = verifiedStmt.get();
            
            const totalCountRegisteredUsers = totalCountRow.count;
            const totalVerifiedUsers = totalVerifiedRow.count;
            const totalPages = Math.ceil(totalCountRegisteredUsers / limit);

            return {
                users: rows.map(row => new User({ ...row, password: undefined })),
                pagination: {
                    currentPage: numPage,
                    totalPages,
                    totalCountRegisteredUsers,
                    totalVerifiedUsers,
                    hasMore: numPage < totalPages
                }
            };
        } catch (error) {
            logger.error("Error fetching users:", error);
            throw new Error('Error fetching users');
        }
    }

 
     async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    async getEvents(){
        try {
            const stmt = db.prepare(`
                    SELECT events.* 
                    FROM events
                    JOIN bookings ON events.id = bookings.event_id
                    WHERE bookings.user_id = ?
                `)
            const rows = stmt.all(this.id);
            return rows.map(row => new Event(row));
        } catch (error) {
            logger.error("Error fetching user events", error);
            throw new Error('Error fetching user events');
        }
    }

    
    /**
     * Counts the total number of users in the database
     * @async
     * @returns {Promise<number>} The total count of users
     * @throws {Error} If there's an error fetching the user count from the database
     */
    static async count(){
        try {
            const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
            const row = stmt.get();
            return row.count;
        } catch (error) {
            logger.error("Error fetching user count", error);
            throw new Error('Error fetching user count');
        }
    }
}
 
export default User;
