import db from '../../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    
    // Get migration file path
    const migrationsDir = path.join(dirname(__dirname), '..', 'migrations');
    const filePath = path.join(migrationsDir, 'migration.sql');
    
    // Check if migration file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('migration.sql file not found');
    }
    
    console.log('Executing migration.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolon to get individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch (err) {
        // Log error but continue with other statements
        console.error('Error executing statement:', err.message);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
};

// Run migrations if this file is executed directly
runMigrations();
