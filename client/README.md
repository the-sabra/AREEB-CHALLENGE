# Areeb Challenge - Client Application

Event Hub is a modern web application built with Vue 3, TypeScript, and Vite, designed to provide a seamless experience for event discovery, management, and participation. This README provides comprehensive information about the client-side application architecture, setup instructions, and development workflow.

![Event Hub Logo](./public/vite.svg)

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Event Discovery**: Browse and search for events
- **Event Details**: View comprehensive information about events
- **Admin Dashboard**: Manage events and users (admin-only)
- **Responsive Design**: Optimized for all device sizes
- **Dark Mode Support**: Toggle between light and dark themes
- **Toast Notifications**: Real-time feedback for user actions

## 📋 Table of Contents

- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [State Management](#-state-management)
- [Routing](#-routing)
- [API Integration](#-api-integration)
- [UI Components](#-ui-components)
- [Development Workflow](#-development-workflow)
- [Building for Production](#-building-for-production)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠 Technology Stack

Event Hub client is built with the following technologies:

- **[Vue 3](https://vuejs.org/)**: Progressive JavaScript framework for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)**: Typed superset of JavaScript
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling
- **[Vue Router](https://router.vuejs.org/)**: Official router for Vue.js
- **[Pinia](https://pinia.vuejs.org/)**: Intuitive, type-safe store for Vue
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[shadcn-vue](https://www.shadcn-vue.com/)**: Re-usable components built with Radix Vue & Tailwind CSS
- **[Vue Sonner](https://vue-sonner.vercel.app/)**: Toast notifications for Vue
- **[Axios](https://axios-http.com/)**: Promise-based HTTP client
- **[Lucide Vue Next](https://lucide.dev/docs/lucide-vue-next)**: Beautiful & consistent icon set
- **[TanStack Table](https://tanstack.com/table/latest)**: Headless UI for building powerful tables
- **Additional Libraries**:
  - `class-variance-authority`: For creating type-safe UI components with variants
  - `clsx` & `tailwind-merge`: For conditional class application
  - `motion-v`: For animation capabilities
  - `radix-vue`: Primitive UI components for Vue applications

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/the-sabra/ATC_01024638615.git
   cd ATC_01024638615/client
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Start the development server

   ```bash
   pnpm dev
   ```

4. Open your browser and visit [http://localhost:5173](http://localhost:5173)

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:3000
```

## 📂 Project Structure

The client application follows a modular organization:

```
/client
├── public/               # Static assets
├── src/
│   ├── assets/           # Project assets (images, fonts)
│   ├── components/       # Vue components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── auth/         # Authentication components
│   │   ├── events/       # Event-related components
│   │   └── ui/           # Reusable UI components
│   ├── composables/      # Reusable Vue composition functions
│   ├── lib/              # Helper utilities
│   ├── stores/           # Pinia state stores
│   ├── types/            # TypeScript type definitions
│   ├── App.vue           # Root component
│   ├── main.ts           # Application entry point
│   └── style.css         # Global styles
├── index.html            # Entry HTML file
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🧩 Key Components

### Authentication Flow

- **AuthTabs.vue**: Handles user login and registration
- **auth.ts store**: Manages authentication state and operations

### Event Management

- **EventsList.vue**: Displays list of available events
- **EventDetail.vue**: Shows detailed information for a specific event

### Admin Dashboard

- **Admin.vue**: Main admin dashboard component
- **AdminEventManagement.vue**: Interface for admins to manage events

## 🗃 State Management

Event Hub uses Pinia for state management with the following main stores:

- **auth.ts**: Handles authentication state, user details, and login/logout operations
- **user.ts**: Manages user-specific data and preferences

## 🔄 Routing

Vue Router is configured in `main.ts` with the following routes:

- `/`: Home page (Event List)
- `/auth`: Authentication page (Login/Register)
- `/events`: Event browsing page
- `/events/:id`: Event details page
- `/admin/*`: Admin dashboard (requires admin privileges)

## 🔌 API Integration

API requests are handled using Axios. The base configuration is in `lib/api.ts`, providing:

- Centralized API endpoint management
- Request/response interceptors
- Authentication headers handling
- Error handling

## 🎨 UI Components

The application utilizes shadcn-vue for UI components, a collection of reusable components built on Radix Vue and Tailwind CSS:

- **Layout Components**: Cards, Avatars, Badges
- **Interactive Elements**: Buttons, Dialogs, Dropdowns, Tabs
- **Form Elements**: Inputs, Select, TextArea, File Upload, Tags Input
- **Feedback Elements**: Toast notifications (Vue Sonner), Skeleton loaders
- **Data Display**: Tables (powered by TanStack Table), Pagination
- **User Preferences**: Theme toggle (Light/Dark mode)
- **Advanced UI**: Combobox, Range Calendar, Tooltips

All UI components are organized in the `src/components/ui/` directory following a modular structure with each component type having its own folder and index.ts export file for clean imports.

## 👩‍💻 Development Workflow

1. Make changes to the codebase
2. Test locally with `pnpm dev`
3. Build and preview production version with `pnpm build` and `pnpm preview`

## 🏗 Building for Production

```bash
pnpm build
```

This creates an optimized build in the `dist` directory ready for deployment.

---

© 2025 Event Hub - All rights reserved
