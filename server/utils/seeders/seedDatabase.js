import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import { connect } from '../../config/db.js';
import logger from '../../config/logger.js';

/**
 * Clear all existing data from the database
 */
const clearDatabase = () => {
  try {
    // Drop tables in reverse order to avoid foreign key constraints
    db.prepare('DELETE FROM bookings').run();
    db.prepare('DELETE FROM event_tags').run();
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM tags').run();
    db.prepare('DELETE FROM category').run();
    db.prepare('DELETE FROM users').run();
    
    // Reset auto-increment counters
    // db.prepare('DELETE FROM sqlite_sequence WHERE name IN ("users", "events", "tags", "category", "bookings")').run();
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

/**
 * Seed the users table with fake data
 * @param {number} count - Number of users to create
 * @returns {Array} - Array of created user IDs
 */
const seedUsers = (count = 10) => {
  try {
    const users = [];
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    // Create admin user
    const adminStmt = db.prepare(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)'
    );
    
    const adminResult = adminStmt.run(
      'Admin User',
      'admin@example.com',
      adminPassword,
      1
    );
    
    users.push(adminResult.lastInsertRowid);
    
    // Create regular users
    const userStmt = db.prepare(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)'
    );
    
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      const password = bcrypt.hashSync('password123', 10);
      
      const result = userStmt.run(
        `${firstName} ${lastName}`,
        email,
        password,
        0
      );
      
      users.push(result.lastInsertRowid);
    }
    
    console.log(`Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

/**
 * Seed the categories table with fake data
 * @returns {Array} - Array of created category IDs
 */
const seedCategories = () => {
  try {
    const categories = [
      'Music',
      'Technology',
      'Business',
      'Food & Drink',
      'Arts & Culture',
      'Sports & Fitness',
      'Health & Wellness',
      'Science & Education',
      'Travel & Outdoor',
      'Community & Causes'
    ];
    
    const categoryIds = [];
    const stmt = db.prepare('INSERT INTO category (name) VALUES (?)');
    
    for (const category of categories) {
      const result = stmt.run(category);
      categoryIds.push(result.lastInsertRowid);
    }
    
    console.log(`Created ${categoryIds.length} categories`);
    return categoryIds;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

/**
 * Seed the tags table with fake data
 * @returns {Array} - Array of created tag IDs
 */
const seedTags = () => {
  try {
    const tags = [
      'Free',
      'Premium',
      'Featured',
      'Popular',
      'New',
      'Weekend',
      'Virtual',
      'In-Person',
      'Workshop',
      'Conference',
      'Networking',
      'Family-friendly',
      'Adult-only',
      'Outdoor',
      'Indoor'
    ];
    
    const tagIds = [];
    const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)');
    
    for (const tag of tags) {
      const result = stmt.run(tag);
      tagIds.push(result.lastInsertRowid);
    }
    
    console.log(`Created ${tagIds.length} tags`);
    return tagIds;
  } catch (error) {
    console.error('Error seeding tags:', error);
    throw error;
  }
};

/**
 * Seed the events table with fake data
 * @param {Array} categoryIds - Array of category IDs
 * @param {number} count - Number of events to create
 * @returns {Array} - Array of created event IDs
 */
const seedEvents = (categoryIds, count = 15) => {
  try {
    const events = [];
    const stmt = db.prepare(
      'INSERT INTO events (name, image, description, date, time, venue, location_link, price, capacity, attendees, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    console.log("Category IDs:", categoryIds);
    
    for (let i = 0; i < count; i++) {
      const eventName = faker.company.buzzPhrase();
      const futureDate = faker.date.future();
      const formattedDate = futureDate.toISOString().split('T')[0];
      const formattedTime = faker.date.anytime().toTimeString().split(' ')[0];
      const capacity = faker.number.int({ min: 20, max: 200 });
      const attendees = 0; // This will be updated when bookings are created
      const categoryId = faker.helpers.arrayElement(categoryIds);
      
      const result = stmt.run(
        eventName,
        `/uploads/event-${i + 1}.jpg`, // Placeholder for image paths
        faker.lorem.paragraphs(3),
        formattedDate,
        formattedTime,
        faker.location.streetAddress(),
        faker.internet.url(),
        faker.number.int({ min: 0, max: 500}),
        capacity,
        attendees,
        categoryId
      );
      
      events.push(result.lastInsertRowid);
    }
    
    console.log(`Created ${events.length} events`);
    return events;
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
};

/**
 * Seed the event_tags junction table
 * @param {Array} eventIds - Array of event IDs
 * @param {Array} tagIds - Array of tag IDs
 */
const seedEventTags = (eventIds, tagIds) => {
  try {
    const stmt = db.prepare('INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)');
    let count = 0;
    
    for (const eventId of eventIds) {
      // Assign 1-3 random tags to each event
      const numTags = faker.number.int({ min: 1, max: 3 });
      const selectedTags = faker.helpers.arrayElements(tagIds, numTags);
      
      for (const tagId of selectedTags) {
        stmt.run(eventId, tagId);
        count++;
      }
    }
    
    console.log(`Created ${count} event-tag associations`);
  } catch (error) {
    console.error('Error seeding event tags:', error);
    throw error;
  }
};

/**
 * Seed the bookings table with fake data
 * @param {Array} eventIds - Array of event IDs
 * @param {Array} userIds - Array of user IDs
 * @param {number} count - Number of bookings to create
 */
const seedBookings = (eventIds, userIds, count = 30) => {
  try {
    const stmt = db.prepare('INSERT INTO bookings (event_id, user_id, ticket_count) VALUES (?, ?, ?)');
    const updateEventStmt = db.prepare('UPDATE events SET attendees = attendees + ? WHERE id = ?');
    
    for (let i = 0; i < count; i++) {
      const eventId = faker.helpers.arrayElement(eventIds);
      const userId = faker.helpers.arrayElement(userIds);
      const ticketCount = faker.number.int({ min: 1, max: 5 });
      
      try {
        // Insert booking
        stmt.run(eventId, userId, ticketCount);
        
        // Update event attendees count
        updateEventStmt.run(ticketCount, eventId);
      } catch (error) {
        // Skip if booking already exists (due to unique constraint)
        console.log(`Skipping duplicate booking for event ${eventId} and user ${userId}`);
        continue;
      }
    }
    
    console.log(`Created approximately ${count} bookings (some may have been skipped due to uniqueness constraints)`);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  }
};

/**
 * Main function to seed the database
 */
const seedDatabase = async () => {
  try {
    await connect();
    
    console.log('Starting database seeding...');
    
    // Clear existing data
    clearDatabase();
    
    // Seed users
    const userIds = seedUsers(20);
    
    // Seed categories
    const categoryIds = seedCategories();
    
    // Seed tags
    const tagIds = seedTags();
    
    // Seed events
    const eventIds = seedEvents(categoryIds, 25);
    
    // Seed event tags
    seedEventTags(eventIds, tagIds);
    
    // Seed bookings
    seedBookings(eventIds, userIds, 50);
    
    console.log('Database seeding completed successfully!');
    
    // Print credentials for the admin user
    console.log('\nAdmin user created:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    console.log('\nRegular users created with password: password123');
    
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
};

// Execute seeding if this file is run directly
seedDatabase();
