# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application designed to foster character education, increase a sense of belonging, and boost attendance in school communities through a platform for anonymously sharing kind acts. It allows students to document good deeds, browse a global feed of positive behaviors, and track a real-time kindness counter. The system notifies parents of their child's good deeds, promoting positive family interactions. Currently piloted at Eastern Guilford High School, the platform aims to expand to other schools and corporate wellness programs, differentiating itself with dual rewards for students and parents, local business partnerships, behavioral climate monitoring, and administrator benefits including automated compliance (90% reduction in character education compliance paperwork), 75-80% cost savings vs. traditional programs, and Principal's Corner recognition system.

## User Preferences
Preferred communication style: Simple, everyday language.
Business planning approach: Conservative, realistic projections always. Under-promise, over-deliver.
**IMPORTANT: Do NOT ask about Stripe integration - it is not needed for this educational platform.**

## System Architecture
### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, built with Radix UI, shadcn/ui, and TailwindCSS for a mobile-first, responsive design. It features a minimalist aesthetic, custom color palette, consistent Lucide React iconography, an "Electric Heart Logo," and permanent vibrant dashboard colors. Role-based logic ensures specific UI elements are displayed only to relevant user roles.

### Technical Implementations
- **Frontend**: React 18, TypeScript, Vite, Wouter for routing, TanStack Query for server state.
- **Backend**: Express.js, TypeScript, RESTful API with WebSocket support, layered and modular architecture.
- **Data Storage**: PostgreSQL (via Drizzle ORM) stores anonymous Kindness Posts (text, category, location, timestamps) and a global Kindness Counter.
- **Real-time Communication**: WebSockets provide live feed updates, counter synchronization, and broadcast messaging.
- **Content Moderation**: Automated filtering for profanity and negative keywords, length validation (10-280 characters), and post flagging.
- **Photo Verification System**: Secure photo uploads using Replit App Storage and Uppy, enabling teachers to approve student service hours quickly. Includes school-level ACL enforcement and audit logging.
- **x2vol District Integration**: Service hour tracking system compatible with x2vol, supporting clock in/out, annual goals, student reflections, and CSV export for simplified administrative tasks.
- **Kindness Connect Service Discovery**: Integrated platform for students to find and sign up for service opportunities with local organizations.
- **AI Behavioral Mitigation Architecture**: A three-layer system (Behavioral Pattern Analyzer, Compliance Filter, Aggregate Climate Monitor) for legal compliance, focusing on content classification, pre-posting filtering, and school-wide trend analytics. **Crucially, it avoids automatic crisis interventions**, routing all flagged content to a human moderation queue.
- **Teacher Moderation Dashboard**: API endpoints for human review workflows of flagged content, including claiming, resolving, and commenting, protected by role-based middleware, with CSV export options for various reports.
- **Student Dashboard Streaks**: Accurate display of current and best streaks.
- **Authentication**: Improved flow redirects unauthenticated users to a `/demo-login` page, with mock authentication for development and Replit OAuth for production.
- **Scalability**: Designed for enterprise performance with database optimization, caching, load testing, real-time monitoring, and auto-scaling.

### Production Database Configuration
- **Separate Databases**: Development and production use entirely separate PostgreSQL databases.
- **Demo Mode**: `DEMO_MODE=true` is critical for initializing demo data (e.g., Emma's service hours, tokens) in the production environment.
- **Required Production Secrets**: `DEMO_MODE`, `DATABASE_URL`, `OPENAI_API_KEY`, `SESSION_SECRET`.

### Feature Specifications
- **Anonymous Posting**: Users can submit text-only descriptions of kind acts without personal identification.
- **Global Kindness Feed**: Real-time display of shared acts with filtering capabilities.
- **Real-time Counter**: Tracks total global acts.
- **AI Behavioral Mitigation System**: Provides compliance filtering, aggregate school-wide climate monitoring, and a human review queue for flagged content, emphasizing documentation and decision-support analytics without automatic crisis interventions.
- **Dual Reward System**: Rewards for both students and parents.
- **High School Curriculum**: 5 comprehensive character education lessons for grades 9-12.
- **B2B Sponsor Monetization Platform**: Infrastructure for sponsor analytics, tiered sponsorships, and targeted campaigns.
- **Student Ambassador Referral Tracking System**: Infrastructure for sponsor-funded ambassador programs, including unique referral codes, recruit attribution, leaderboards, and sponsor ROI analytics.

### MVP Simplification (Features hidden by default, reactivated via feature flags)
- **Support Circle**: Mental health support feature.
- **Challenges**: Summer and school-year challenges.
- **AI Wellness**: Predictive wellness dashboards.
- **Curriculum**: Lesson plans tab.

## External Dependencies
- **Frontend Frameworks**: React 18
- **Backend Frameworks**: Express.js
- **Languages/Tools**: TypeScript, Vite
- **UI Libraries**: Radix UI, shadcn/ui, TailwindCSS, Lucide React
- **State Management/Forms/Validation**: TanStack Query, React Hook Form, Zod
- **Database Technologies**: Drizzle ORM, Drizzle-Zod, @neondatabase/serverless (PostgreSQL)
- **Object Storage**: @google-cloud/storage, @uppy/core, @uppy/react, @uppy/aws-s3
- **Real-time/Routing**: ws, wouter
- **Reward/Payment Integrations**: 21 Local Greensboro businesses (e.g., Chick-fil-A, Greensboro Science Center, Dave's Hot Chicken, Red Cinemas), and national partners (Scholastic Books, Target Education, LEGO Education, Amazon Family).