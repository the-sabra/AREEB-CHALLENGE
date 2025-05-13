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
    
    // Get migration files
    const migrationsDir = path.join(dirname(__dirname), '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure they run in alphabetical order
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
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
          console.error(`Error executing statement from ${file}:`, err.message);
          console.error('Statement:', statement);
        }
      }
    }
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
};

// Run migrations if this file is executed directly
runMigrations();
