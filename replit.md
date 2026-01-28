# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application designed to foster character education, increase a sense of belonging, and boost attendance in school communities. It enables anonymous sharing of kind acts, allowing students to document good deeds, browse a global feed, and track a real-time kindness counter. The platform also serves as an official 200-hour Service-Learning Diploma tracking system for districts, incorporating Guilford County Schools' IPARD model, real-time Inclusion Score measurement, and Character Strengths analysis. It aims to reduce administrative burden for character education compliance, offer cost savings, and provide recognition through features like the Principal's Corner. EchoDeed™ differentiates itself with dual rewards for students and parents, local business partnerships, behavioral climate monitoring, and expansion potential to corporate wellness programs.

## User Preferences
Preferred communication style: Simple, everyday language.
Business planning approach: Conservative, realistic projections always. Under-promise, over-deliver.
**IMPORTANT: Do NOT ask about Stripe integration - it is not needed for this educational platform.**

## System Architecture
### UI/UX Decisions
The frontend utilizes React 18, TypeScript, and Vite, with Radix UI, shadcn/ui, and TailwindCSS for a mobile-first, responsive, and minimalist design. It features a custom color palette, consistent Lucide React iconography, an "Electric Heart Logo," and vibrant permanent dashboard colors. Role-based logic ensures specific UI elements are displayed only to relevant user roles.

### Technical Implementations
- **Frontend**: React 18, TypeScript, Vite, Wouter for routing, TanStack Query for server state.
- **Backend**: Express.js, TypeScript, RESTful API with WebSocket support, layered and modular architecture.
- **Data Storage**: PostgreSQL (via Drizzle ORM) stores anonymous Kindness Posts, user data, and supports the IPARD Service-Learning system with 9 new tables for tracking phases, reflections, tokens, and rewards.
- **Real-time Communication**: WebSockets for live feed updates, counter synchronization, and broadcast messaging.
- **Content Moderation**: Automated filtering for profanity and negative keywords, length validation (10-280 characters), and post flagging, routing flagged content to a human moderation queue.
- **Photo Verification System**: Secure photo uploads using Replit App Storage and Uppy, with school-level ACL and audit logging.
- **x2vol District Integration**: Compatibility with x2vol for service hour tracking, including clock in/out, annual goals, student reflections, and CSV export.
- **Kindness Connect Service Discovery**: Platform for finding and signing up for local service opportunities.
- **IPARD Service-Learning System (v2.1)**:
  - **Process-Based Intrinsic Motivation**: Awards milestone bonus tokens (25/50/75) for completing Investigation+Preparation, Reflection, and Demonstration phases, utilizing transaction-safe architecture with row-level locking.
  - **Reflection Tagging**: Students tag service experiences with 21st Century Learning Skills (e.g., Accountability, Critical Thinking) and Character Traits (e.g., Kindness, Integrity).
  - **Phase Tracking**: Visual progress indicators for students' journey through IPARD phases.
  - **Admin School Rewards Portal**: High-value non-token rewards (e.g., VIP parking) requiring admin approval.
  - **Character Excellence Awards**: Teacher-administered manual token awards (50-250 tokens) for exceptional character demonstration with narrative justification.
  - **Monthly Top 5 Leaderboards**: Recognition system for top token earners per grade level.
  - **Comprehensive Audit Trail**: All token transactions are logged with before/after balance, source, and approver context.
- **AI Behavioral Mitigation Architecture**: A three-layer system (Behavioral Pattern Analyzer, Compliance Filter, Aggregate Climate Monitor) for legal compliance and content classification, pre-posting filtering, and school-wide trend analytics, **without automatic crisis interventions**.
- **Teacher Moderation Dashboard**: API endpoints for human review workflows of flagged content, with role-based middleware and CSV export.
- **Student Dashboard Streaks**: Accurate display of current and best streaks.
- **Authentication**: Replit OAuth for production, with a `/demo-login` page for unauthenticated users and mock authentication for development.
- **Scalability**: Designed for enterprise performance with database optimization, caching, load testing, real-time monitoring, and auto-scaling.
- **School-Level Configuration System**: Supports middle and high school deployments with differentiated experiences based on `schoolLevel` enum in the `schools` table. School administrators select their configuration during registration using a dropdown that clearly explains each option. Configurations include:
  - **Middle School (Grades 6-8)**: Optional community service (0-hour requirement), 3-phase workflow, tokens 25/75/150/300, age-appropriate rewards. Service hours are encouraged but NOT required - students can log activities and earn rewards, but no goals or progress bars are shown.
  - **High School (Grades 9-12)**: 200-hour Service-Learning Diploma (required), 5-phase IPARD workflow, tokens 100/250/500/1000, advanced rewards including VIP parking. Full diploma tracking with progress visualization.
- **Student Notification System**: Email-first digest architecture (7:30am daily, 3:30pm milestone notifications) complying with FERPA, using a queue-based system and new `student_notification_preferences`, `student_notification_events`, `student_notifications` tables.
- **AI-Suggested Communications**: Generates ready-to-send email and announcement templates based on real-time Inclusion Score metrics for administrators.
- **Parent Communications Center**: Admin dashboard tab with 3 professional email templates (Parent Welcome, Good Deed Notification, Milestone Achievement) featuring copy-to-clipboard, download HTML, and preview functionality. Manual sending via school email systems until full email service integration.
- **Progressive Web App (PWA)**: Full PWA implementation enabling:
  - **Install on Home Screen**: Students can add EchoDeed to their phone's home screen like a native app
  - **Offline Support**: Core features available without internet connection
  - **Fast Loading**: Service worker caching for quick app startup
  - **App Shortcuts**: Quick access to Share Kindness, View Rewards, and Log Service Hours
  - **Push Notifications**: Support for sending important updates to students
  - **Cross-Platform**: Works on iOS, Android, Windows, Mac, and Chrome OS

### Production Database Configuration
- **Separate Databases**: Development and production use distinct PostgreSQL databases.
- **Demo Mode**: `DEMO_MODE=true` is essential for initializing demo data in production.
- **Required Production Secrets**: `DEMO_MODE`, `DATABASE_URL`, `OPENAI_API_KEY`, `SESSION_SECRET`.

### Feature Specifications
- **Anonymous Posting**: Users can submit text-only descriptions of kind acts.
- **Global Kindness Feed**: Real-time display of shared acts with filtering.
- **Real-time Counter**: Tracks total global acts.
- **AI Behavioral Mitigation System**: Provides compliance filtering and climate monitoring, routing to human review.
- **Dual Reward System**: Rewards for both students and parents.
- **High School Curriculum**: 5 comprehensive character education lessons for grades 9-12.
- **B2B Sponsor Monetization Platform**: Infrastructure for sponsor analytics, tiered sponsorships, and targeted campaigns.
- **Student Ambassador Referral Tracking System**: Infrastructure for sponsor-funded programs, including referral codes, attribution, leaderboards, and ROI analytics.
- **IPARD Service-Learning Features**: Process-based token rewards, 21st Century Skills and Character Traits tagging, IPARD phase visualization, Admin School Rewards, Character Excellence Recognition, Monthly Recognition Leaderboards, AI-Suggested Communications, and comprehensive audit trails.
- **School Registration with Level Selection**: During school registration, administrators use a dropdown to select their service-learning configuration (Middle School: optional community service, or High School: required 200-hour diploma). The selection determines platform behavior, UI displays, token milestones, and reward accessibility.
- **Student Notification System**: Email-first digests for approvals, token milestones, streaks, IPARD bonuses, and reward status.
- **School-Spirit Features (Eastern Guilford Pilot)**:
  - **Multi-Directional Recognition**: Staff can post Staff-to-Staff and Staff-to-Student posts with gold verified styling and "Verified Staff" badges in the feed.
  - **Badge & Achievement Engine**: Originator (first to share a category), Weekly Warrior (posts across 5 days), and Grade Hero (most posts in grade) badges with Badge Gallery UI on student dashboard.
  - **Social Media Sharing**: SocialShareModal with canvas-based branded image generation (1080x1080 Instagram-ready format), share button on all feed posts.
  - **Sign-up Incentive System**: Schools can configure bonus tokens for first Y sign-ups via admin settings, with atomic claim prevention and per-user eligibility checks.

## External Dependencies
- **Frontend Frameworks**: React 18
- **Backend Frameworks**: Express.js
- **Languages/Tools**: TypeScript, Vite
- **UI Libraries**: Radix UI, shadcn/ui, TailwindCSS, Lucide React
- **State Management/Forms/Validation**: TanStack Query, React Hook Form, Zod
- **Database Technologies**: Drizzle ORM, Drizzle-Zod, @neondatabase/serverless (PostgreSQL)
- **Object Storage**: @google-cloud/storage, @uppy/core, @uppy/react, @uppy/aws-s3
- **Real-time/Routing**: ws, wouter
- **Reward/Payment Integrations**: 21 Local Greensboro businesses (e.g., Chick-fil-A, Greensboro Science Center), and national partners (Scholastic Books, Target Education, LEGO Education, Amazon Family).