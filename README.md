# Event Management System

## Overview

This is a comprehensive Event Management System built with a Vue.js frontend and Node.js/Express backend. The system allows users to browse events, make bookings, and provides administrators with tools to manage events, users, and bookings.

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Client (Frontend)](#client-frontend)
  - [Architecture](#architecture)
  - [Key Components](#key-components)
  - [State Management](#state-management)
- [Server (Backend)](#server-backend)
  - [API Structure](#api-structure)
  - [Authentication & Authorization](#authentication--authorization)
  - [Database](#database)
  - [Middleware](#middleware)
- [Testing](#testing)
- [Deployment](#deployment)

## Project Structure

The project is organized into two main directories:

- `client/` - Vue.js frontend application
- `server/` - Node.js/Express backend API

### Client Structure

```
client/
├── components.json          # UI component configuration
├── src/
│   ├── App.vue              # Main application component
│   ├── main.ts              # Application entry point
│   ├── assets/              # Static assets
│   ├── components/          # Vue components
│   │   ├── admin/           # Admin-specific components
│   │   ├── auth/            # Authentication components
│   │   ├── events/          # Event-related components
│   │   └── ui/              # UI component library
│   ├── composables/         # Vue composables
│   ├── lib/                 # Utility libraries
│   ├── stores/              # Pinia state stores
│   └── types/               # TypeScript type definitions
```

### Server Structure

```
server/
├── config/                  # Configuration files
├── controllers/             # Request handlers
├── middleware/              # Express middleware
├── migrations/              # Database migration files
├── models/                  # Data models
├── public/                  # Static public files
│   └── uploads/             # Uploaded files (images)
├── routes/                  # API routes
├── services/                # Business logic
├── tests/                   # Test suites
├── utils/                   # Utility functions
│   ├── seeders/             # Database seeders
│   └── validators/          # Input validation schemas
└── server.js                # Application entry point
```

## Features

### User Features

- User registration and authentication
- Browse and search events
- View detailed event information
- Book tickets for events
- User profile and account management
- Join event waitlists when events are full

### Admin Features

- Comprehensive admin dashboard
- Create, edit, and delete events
- Manage event images
- View and manage user accounts
- Process bookings and waitlists
- Generate reports

## Technologies Used

### Frontend

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next Generation Frontend Tooling
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Reka UI** - UI component library
- **Axios** - HTTP client
- **Vue Sonner** - Toast notifications

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Better-SQLite3** - SQLite database driver
- **JWT** - Authentication using JSON Web Tokens
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Multer** - File upload handling
- **Winston** - Logging
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/AREEB-CHALLENGE.git
cd AREEB-CHALLENGE
```

2. Install dependencies for both client and server

```bash
# Install client dependencies
cd client
pnpm install

# Install server dependencies
cd ../server
pnpm install
```

3. Set up environment variables

```bash
# In the server directory, create a .env file
touch .env
```

Add the following environment variables to the .env file:

```
PORT=3000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Run database migrations

```bash
cd server
pnpm migrate
```

5. (Optional) Seed the database with test data

```bash
pnpm seed
```

### Running the Application

#### Development mode

```bash
# Start the server (from server directory)
pnpm start:dev

# Start the client (from client directory)
pnpm dev
```

#### Production mode

```bash
# Build the client
cd client
pnpm build

# Start the server in production mode
cd ../server
pnpm start:prod
```

## Client (Frontend)

### Architecture

The frontend is built with Vue.js 3 using the Composition API and TypeScript. It uses Vite as the build tool and development server, providing fast hot module replacement during development.

### Key Components

- **Auth Components** - Handle user authentication and registration
- **Event Components** - Display and interact with event data
- **Admin Components** - Provide admin-only functionality
- **UI Components** - Reusable UI elements built with Tailwind CSS

### State Management

State management is handled using Pinia stores:

- **Auth Store** - Manages authentication state and user sessions
- **User Store** - Manages user data and preferences

## Server (Backend)

### API Structure

The backend follows a modular architecture with the following components:

- **Routes** - Define API endpoints
- **Controllers** - Handle HTTP requests and responses
- **Services** - Contain business logic
- **Models** - Define data structures and database interactions

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin vs. Regular users)
- Protected routes with custom middleware

### Database

- SQLite database using Better-SQLite3
- Database migrations for schema management
- Seeders for populating test data

### Middleware

- Error handling middleware
- Authentication middleware
- Validation middleware using Express Validator
- Rate limiting for API protection

## Testing

The server includes a comprehensive test suite using Vitest. Tests cover:

- Authentication flows
- Event management
- Booking processes
- User management
- Admin operations

To run tests:

```bash
cd server
pnpm test
```

## Deployment

### Backend Deployment

- Ensure all environment variables are properly set
- Run database migrations before starting the server
- Consider using a process manager like PM2 for production

### Frontend Deployment

- Build the Vue.js application
- Serve static files through a web server like Nginx
- Consider CDN for assets

## License

Created by Omar Sabra With AI🤖
