# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application that fosters and tracks anonymous acts of kindness through a community-driven feed. It allows users to anonymously share kind acts, browse a global feed with filtering options, and view a real-time global kindness counter. The platform operates without user profiles or personal information, prioritizing anonymity. Its strategic focus is on the K-8 education market to build empathy during critical developmental years, with future expansion into the corporate wellness market. Key capabilities include anonymous posting, a global kindness feed, real-time filtering and counting, robust content moderation, and AI integration for predictive wellness and content intelligence. The project also incorporates comprehensive frameworks for AI liability protection, customer validation, privacy communication, user adoption, competitive moat defense, regulatory compliance, enterprise architecture, founder execution, and cultural sensitivity.

## User Preferences
Preferred communication style: Simple, everyday language.
Business planning approach: Conservative, realistic projections always. Under-promise, over-deliver.
**IMPORTANT: Do NOT ask about Stripe integration - it is not needed for this educational platform.**

## System Architecture
### Frontend
The client is a single-page application built with React 18, TypeScript, and Vite. It leverages Radix UI primitives and shadcn/ui components styled with TailwindCSS for a consistent, mobile-first design. Wouter manages routing, and TanStack Query handles server state. Real-time features are powered by WebSockets. The UI/UX emphasizes a minimalist design with a custom color palette, consistent iconography (Lucide React), and responsive design, including an "Electric Heart Logo" with gradient ripple effects.

### Backend
The server uses Express.js and TypeScript, providing a RESTful API with WebSocket support. It follows a layered, modular architecture, designed for easy migration to PostgreSQL with Drizzle ORM. Features include content filtering, WebSocket broadcasting, and structured error handling.

### Data Storage
The system stores anonymous Kindness Posts (text, category, location, timestamps) and a global Kindness Counter. The database schema supports geographic and category filtering, timestamp ordering, and content validation.

### Real-time Communication
WebSockets facilitate live feed updates, real-time counter synchronization, automatic reconnection, and broadcast messaging.

### Content Moderation
A content filtering system ensures a positive environment through profanity detection, negative keyword filtering, length validation (10-280 characters), and automatic post flagging.

### Core Features
- **Anonymous Posting**: Users submit text-only descriptions of kind acts without personal identification.
- **Global Kindness Feed**: Real-time display of all shared acts.
- **Filtering**: Posts can be filtered by location and category.
- **Real-time Counter**: Tracks the total number of acts shared globally.
- **Surprise Giveaway System**: Automated reward distribution to boost engagement.
- **AI Integration**: Powers a predictive wellness engine, content intelligence (sentiment analysis, moderation, trend detection), and corporate analytics.
- **Dual Reward System**: Implemented for both kids and parents.
- **COPPA Compliance System**: Production-ready digital consent, automated workflows, and annual renewal system for K-8.
- **Middle and High School Curriculum**: 5 comprehensive lessons focused on character education for grades 6-12.
- **B2B Sponsor Monetization Platform**: Infrastructure for sponsor analytics, tiered sponsorships, and targeted campaigns (currently preserved).
- **Anonymous Workplace Wellness**: AI-powered predictive analytics for burnout risk and sentiment analysis using anonymized data.

### Technical Scalability
The architecture is designed for enterprise-grade performance, featuring database optimization, intelligent caching, load testing, real-time production monitoring, and an auto-scaling architecture for global deployment.

## External Dependencies
- **React 18**: Frontend framework.
- **Express.js**: Backend web framework.
- **TypeScript**: For type safety.
- **Vite**: Build tool.
- **Radix UI, shadcn/ui, TailwindCSS, Lucide React**: UI and styling components.
- **TanStack Query, React Hook Form, Zod**: State management, forms, and validation.
- **Drizzle ORM, Drizzle-Zod, @neondatabase/serverless**: Database interaction (PostgreSQL).
- **ws, wouter**: Real-time communication and routing.
- **Stripe, Amazon, Starbucks, Target, GrubHub**: External reward fulfillment and payment processing.