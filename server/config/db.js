import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config(); 
    
const db = new Database('store.db', { verbose: console.log });
 
export async function connect() {
    try {
        const result = db.prepare('SELECT 1 as test').get();
        if (!result || result.test !== 1) throw new Error('Database connection test failed');
        console.log("Connected to the database"); 
        return db;
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); 
    }
}  

export default db; 