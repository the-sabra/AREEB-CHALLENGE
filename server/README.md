# Event Management API

A comprehensive REST API for managing events, bookings, users, and administrative functions. This backend server provides all the necessary endpoints to power an event booking platform.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Events](#events)
  - [Bookings](#bookings)
  - [Admin](#admin)
- [Security](#security)
- [Testing](#testing)
- [Docker](#docker)
- [Deployed Links](#deployed-links)
- [License](#license)

## ✨ Features

- **User Authentication**
  - Registration and login with JWT tokens
  - Role-based authorization (Admin/Regular users)
- **Event Management**
  - Create, read, update, and delete events
  - Filter events by category, price range, date, and more
  - Event categorization with tags
  - Image upload support for event banners
- **Booking System**
  - Reserve spots for events
  - View booking history
  - Automatic capacity management
- **Admin Dashboard**
  - Manage users, events, and bookings
  - Generate reports and analytics
- **Security Features**
  - Rate limiting to prevent abuse
  - Input validation with express-validator
  - Helmet for HTTP security headers

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (using better-sqlite3)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **File Upload:** multer
- **Logging:** winston, morgan
- **Security:** helmet, express-rate-limit, cors
- **Testing:** vitest
- **Containerization:** Docker (with docker-compose)
- **Development:** Node's --watch mode for hot reloading

## 📁 Project Structure

```
server/
├── config/               # Configuration files
│   ├── db.js             # Database connection
│   └── logger.js         # Logging configuration
│
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── event.controller.js
│   ├── booking.controller.js
│   └── ...
│
├── middleware/           # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── error.handler.js  # Global error handler
│   ├── validation.js     # Validation middleware
│   └── ...
│
├── migrations/           # Database schema migrations
│   ├── events.table.sql
│   ├── bookings.table.sql
│   └── ...
│
├── models/               # Data models
│   ├── user.model.js
│   ├── event.model.js
│   └── booking.model.js
│
├── routes/               # API route definitions
│   ├── auth.routes.js
│   ├── event.routes.js
│   └── ...
│
├── services/             # Business logic layer
│   ├── auth.service.js
│   ├── event.service.js
│   └── ...
│
├── tests/                # Test suite
│   ├── features/         # Feature tests
│   ├── middleware/       # Middleware tests
│   └── ...
│
├── utils/                # Utility functions and helpers
│   ├── ApiResponse.js    # API response formatter
│   ├── fileUpload.js     # File upload configuration
│   ├── jwt.js            # JWT utilities
│   ├── seeders/          # Database seeders
│   └── validators/       # Schema validation
│
├── public/               # Public static files
│   └── uploads/          # Uploaded images
│
├── server.js             # Application entry point
└── package.json          # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/the-sabra/ATC_01024638615.git
   cd ATC_01024638615/server
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Run database migrations:

   ```bash
   npm run migrate
   ```

4. Seed the database with sample data (optional):

   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
BASE_URL=http://localhost:3000
```

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **Users**: Stores user information and credentials
- **Events**: Contains event details including name, description, date, capacity
- **Categories**: Event categories for organization
- **Tags**: Additional event classification
- **Bookings**: Links users to events they've booked

## 📡 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate a user
- `GET /auth/me` - Get current user information

### Users

- `GET /users` - Get all users (admin only)
- `GET /users/event/:eventId` - Check If This event Booked by the user
- `GET /users/:id` - Get a specific user (admin only)
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user (admin only)

### Events

- `GET /events` - Get all events with filtering options
- `GET /events/:eventId` - Get a specific event
- `GET /events/authed` - Get all event with check if user have a booked in this event or no
- `POST /events` - Create a new event (admin only)
- `PUT /events/:eventId` - Update an event (admin only)
- `DELETE /events/:eventId` - Delete an event (admin only)
- `GET /events/categories` - Get all event categories
- `POST /events/categories` - Create a new category (admin only)
- `GET /events/tags` - Get all event tags
- `POST /events/tags` - Create a new tag (admin only)

### Bookings

- `GET /bookings/user` - Get all bookings for the current user
- `GET /bookings/:eventId` - Get a specific booking for current user
- `POST /bookings/event/:eventId` - Create a booking for an event
- `GET /bookings/event/:eventId` - Get all bookings for an event (admin only)

### Admin

- `GET /admin/status` - Get admin dashboard statistics
  information

## 🔒 Security

The API implements several security features:

- **Authentication**: JWT-based token authentication
- **Password Security**: Passwords are hashed using bcrypt
- **HTTP Security**: Helmet middleware for setting security-related HTTP headers
- **Rate Limiting**: Express rate limit to prevent brute force and DoS attacks
- **Input Validation**: Express validator for sanitizing and validating inputs
- **Error Handling**: Centralized error handling with appropriate status codes

## 🧪 Testing

The project uses Vitest for testing. Run the tests with:

```bash
npm test
```

Tests are organized into:

- Feature tests (API endpoints)
- Middleware tests
- Configuration tests
- Utility tests

## 🔗 Deployed Links

- API Server: [link]()
- API Documentation: [link]()

---

Created by Omar Sabra With AI🤖
