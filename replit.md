# EchoDeed™ - Anonymous Kindness Platform

## Overview

EchoDeed™ is a mobile-first web application designed to inspire and track anonymous acts of kindness through a community-driven feed. Built with the philosophy of "Your Kindness, Amplified," the platform provides a simple, anonymous way for users to share kind acts and view a real-time global feed of positivity.

The application features a minimalist design with a focus on anonymity - no user profiles, social interactions, or personal information. Users can post text-only descriptions of their kind acts, browse a global feed, filter by location and category, and watch a real-time global kindness counter that tracks all acts shared on the platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 using TypeScript and Vite as the build tool. The UI leverages Radix UI primitives with shadcn/ui components for a consistent, accessible design system. TailwindCSS provides utility-first styling with a custom color palette optimized for positivity and readability.

The application uses Wouter for lightweight client-side routing and TanStack Query for server state management and caching. Real-time features are implemented via WebSocket connections to provide live feed updates and counter synchronization.

Key architectural decisions:
- Single-page application with minimal routing (home page focus)
- Component-based architecture with reusable UI components
- Real-time updates without page refreshes
- Mobile-first responsive design
- Client-side filtering and search capabilities

### Backend Architecture
The server is built with Express.js and TypeScript, providing a RESTful API with WebSocket support for real-time features. The application follows a layered architecture with clear separation between routes, storage, and business logic.

Currently implemented with in-memory storage for rapid prototyping, but structured to easily migrate to a PostgreSQL database using Drizzle ORM. The storage layer uses dependency injection patterns to support multiple storage implementations.

Key features:
- Content filtering service to ensure positive-only posts
- WebSocket broadcasting for real-time updates
- Structured error handling and logging
- Modular service architecture

### Data Storage Design
The application is designed around two primary entities:
- **Kindness Posts**: Anonymous text posts with category, location metadata, and timestamps
- **Kindness Counter**: Global counter tracking total acts of kindness shared

Database schema supports:
- Geographic filtering (city, state, country)
- Category-based organization
- Timestamp-based ordering
- Content validation and filtering

### Real-time Communication
WebSocket implementation provides:
- Live feed updates when new posts are added
- Real-time counter synchronization across all clients
- Automatic reconnection handling
- Broadcast messaging to all connected clients

### Content Moderation
Simple content filtering system to maintain positive environment:
- Profanity detection and blocking
- Negative keyword filtering
- Length validation (10-280 characters)
- Automatic post flagging for manual review

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Node.js web framework for API development
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast build tool with hot module replacement

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built component library with consistent design
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition

### Database and ORM
- **Drizzle ORM**: Type-safe PostgreSQL ORM with migrations
- **Drizzle-Zod**: Integration for automatic schema validation
- **@neondatabase/serverless**: PostgreSQL database connection (planned)

### Development and Build Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

### Real-time and Networking
- **ws**: WebSocket library for real-time communication
- **wouter**: Lightweight routing library

The application is structured to deploy on Replit with development tooling optimized for the platform, including runtime error overlays and cartographer integration for enhanced debugging.