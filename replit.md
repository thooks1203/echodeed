# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application designed to foster and track anonymous acts of kindness through a community-driven feed. It allows users to anonymously share kind acts, browse a global feed with filtering options, and view a real-time global kindness counter. The platform prioritizes anonymity by operating without user profiles or personal information. Its primary focus is the K-8 education market to build empathy, with plans for future expansion into corporate wellness. Key capabilities include anonymous posting, a global kindness feed, real-time filtering and counting, robust content moderation, and AI integration for predictive wellness and content intelligence. The project emphasizes AI liability protection, privacy, user adoption, and regulatory compliance.

## User Preferences
Preferred communication style: Simple, everyday language.
Business planning approach: Conservative, realistic projections always. Under-promise, over-deliver.
**IMPORTANT: Do NOT ask about Stripe integration - it is not needed for this educational platform.**

## System Architecture
### UI/UX Decisions
The frontend is a React 18, TypeScript, and Vite single-page application. It utilizes Radix UI primitives and shadcn/ui components with TailwindCSS for a mobile-first, responsive design. The UI/UX emphasizes minimalism, a custom color palette, consistent iconography (Lucide React), and an "Electric Heart Logo" with gradient ripple effects. All dashboard tabs feature permanent vibrant colors for enhanced visual engagement, and role-based logic ensures specific UI elements (e.g., Echo Tokens button) are displayed only to relevant user roles (students/parents). Quick action buttons are proportionally sized for a professional appearance.

### Technical Implementations
- **Frontend**: React 18, TypeScript, Vite, Wouter for routing, TanStack Query for server state.
- **Backend**: Express.js, TypeScript, RESTful API with WebSocket support, layered and modular architecture.
- **Data Storage**: Stores anonymous Kindness Posts (text, category, location, timestamps) and a global Kindness Counter. Schema supports geographic/category filtering and timestamp ordering.
- **Real-time Communication**: WebSockets for live feed updates, counter synchronization, automatic reconnection, and broadcast messaging.
- **Content Moderation**: Filters profanity and negative keywords, enforces length validation (10-280 characters), and automatically flags posts.
- **Kindness Sparks Celebration**: Visual animated celebration upon posting deeds for engagement.
- **COPPA Compliance System**: Digital consent, automated workflows, and annual renewal for K-8.
- **Summer Challenges**: Engine supports age-appropriate challenges for grades 6-12.
- **Student Dashboard Streaks**: Data fixes ensure accurate display of current and best streaks.
- **Authentication**: Improved flow redirects unauthenticated users to a clean `/demo-login` page. Development uses mock authentication, while production requires real Replit OAuth.
- **Scalability**: Designed for enterprise performance with database optimization, caching, load testing, real-time monitoring, and auto-scaling.

### Feature Specifications
- **Anonymous Posting**: Users submit text-only descriptions of kind acts without personal identification.
- **Global Kindness Feed**: Real-time display of shared acts with location and category filtering.
- **Real-time Counter**: Tracks total global acts.
- **AI Integration**: Powers predictive wellness, content intelligence (sentiment analysis, moderation, trend detection), and corporate analytics.
- **Dual Reward System**: Implemented for both kids and parents.
- **Middle and High School Curriculum**: 5 comprehensive character education lessons for grades 6-12.
- **B2B Sponsor Monetization Platform**: Infrastructure for sponsor analytics, tiered sponsorships, and targeted campaigns.
- **Anonymous Workplace Wellness**: AI-powered predictive analytics for burnout risk and sentiment analysis.
- **Sustainable Reward Frequency Framework**: Optimized student surprise giveaways (weekly for high activity scores) and a structured teacher reward system with sponsor-covered and platform-funded frequencies.

## External Dependencies
- **Frontend Frameworks**: React 18
- **Backend Frameworks**: Express.js
- **Languages/Tools**: TypeScript, Vite
- **UI Libraries**: Radix UI, shadcn/ui, TailwindCSS, Lucide React
- **State Management/Forms/Validation**: TanStack Query, React Hook Form, Zod
- **Database Technologies**: Drizzle ORM, Drizzle-Zod, @neondatabase/serverless (PostgreSQL)
- **Real-time/Routing**: ws, wouter
- **Reward/Payment Integrations**: Amazon, Starbucks, Target, GrubHub (for reward fulfillment)