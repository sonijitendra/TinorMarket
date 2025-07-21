# Tinor - Local Marketplace Application

## Overview

Tinor is a full-stack local marketplace application that helps users find nearby shops where specific products are available in stock, with price and expiry date information. The application is built using React (frontend), Node.js/Express (backend), and PostgreSQL with Drizzle ORM for data storage.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and bundling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Comprehensive set of Radix UI-based components via shadcn/ui

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Storage**: In-memory storage implementation with interface for future database integration

## Key Components

### Database Schema (Drizzle ORM)
- **Users**: Stores customer and shopkeeper accounts with role-based access
- **Shops**: Shop information including location (latitude/longitude) and ratings
- **Products**: Product catalog with pricing, stock, expiry dates, and shop associations
- **Bookings**: Product reservations with status tracking

### Authentication System
- JWT token-based authentication
- Role-based access control (customer vs shopkeeper)
- Secure password hashing with bcrypt
- Protected routes for shopkeeper operations

### API Endpoints
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication
- `/api/products/search` - Product search with location filtering
- `/api/products/shop/:id` - Shop-specific product listings
- `/api/products` - Product CRUD operations
- `/api/bookings` - Product reservation system

### Frontend Pages
- **Home**: Product search interface with location-based filtering
- **Dashboard**: Shopkeeper admin panel for inventory management
- **Authentication**: Login/register functionality

## Data Flow

1. **Product Search**: Users search for products → API queries products with shop information → Results displayed with distance, price, and availability
2. **Product Management**: Shopkeepers add/update products → Protected API endpoints → Real-time inventory updates
3. **Booking System**: Customers reserve products → API creates booking records → Stock levels updated
4. **Authentication Flow**: Login/register → JWT token generation → Protected route access

## External Dependencies

### Core Framework Dependencies
- **Frontend**: React, TypeScript, Vite, TanStack Query, Wouter
- **Backend**: Express.js, JWT, bcrypt
- **Database**: Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)
- **UI**: Radix UI components, Tailwind CSS, class-variance-authority

### Development Tools
- **Build**: esbuild for production builds
- **Database**: Drizzle Kit for schema management and migrations
- **Styling**: PostCSS with Tailwind CSS and autoprefixer

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for running TypeScript server code directly
- Concurrent development setup with proxy configuration

### Production Build
- Frontend: Vite build generating optimized static assets
- Backend: esbuild bundling server code with external dependencies
- Single Node.js process serving both API and static files

### Database Configuration
- PostgreSQL via Neon serverless driver
- Environment-based connection string
- Drizzle migrations for schema management

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with client, server, and shared directories for code organization
2. **Shared Schema**: Common TypeScript types and Zod validation schemas shared between frontend and backend
3. **In-Memory Storage**: Current implementation uses memory storage with interface pattern for easy database integration
4. **Component Library**: shadcn/ui for consistent, accessible UI components
5. **Type Safety**: Full TypeScript implementation across the stack with shared types
6. **Modern Tooling**: Vite for fast development, esbuild for production builds