# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application designed to foster character education, increase a sense of belonging, and boost attendance in school communities through a platform for anonymously sharing kind acts. 

**v2.0 Update (Nov 2025):** Platform now positioned as official 200-hour Service-Learning Diploma tracking system for districts, with real-time Inclusion Score measurement and Character Strengths analysis. It allows students to document good deeds, browse a global feed of positive behaviors, and track a real-time kindness counter. The system notifies parents of their child's good deeds, promoting positive family interactions. Currently piloted at Eastern Guilford High School, the platform aims to expand to other schools and corporate wellness programs, differentiating itself with dual rewards for students and parents, local business partnerships, behavioral climate monitoring, and administrator benefits including automated compliance (90% reduction in character education compliance paperwork), 75-80% cost savings vs. traditional programs, and Principal's Corner recognition system.

**v2.1 Update (Nov 2025 - IPARD Integration):** Platform now fully implements Guilford County Schools' IPARD Service-Learning model (Investigation, Preparation, Action, Reflection, Demonstration) with process-based intrinsic motivation rewards. Key additions:
- **IPARD Bonus Token System**: Students earn milestone bonuses (25/50/75 tokens) for completing Investigation+Preparation, Reflection, and Demonstration phases
- **Reflection Skills & Traits Tagging**: Students tag service experiences with 21st Century Learning Skills (Accountability, Critical Thinking, Communication, Leadership, Initiative, Social Skills) and Character Traits (Kindness, Integrity, Compassion, Leadership, Service, Empathy, Resilience, Respect)
- **IPARD Phase Tracking**: Visual progress indicators showing students their journey through each service-learning phase
- **Admin School Rewards Portal**: High-value non-token rewards (VIP parking, homework passes, field trip vouchers) requiring admin approval
- **Character Excellence Awards**: Teacher-administered manual token awards (500-1000 tokens) for exceptional character demonstration with narrative justification
- **Monthly Top 5 Leaderboards**: Recognition system displaying top token earners per grade level for Principal's Corner announcements
- **Transaction-Safe Architecture**: All token awards use database transactions with row-level locking to prevent duplicate payouts and ensure audit trail integrity

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
- **v2.1 IPARD Service-Learning System**: 
  - **Database Schema**: 9 new tables including `ipard_phase_events`, `reflection_skills`, `reflection_traits`, `community_service_log_skills`, `community_service_log_traits`, `token_transactions`, `admin_rewards`, `admin_reward_redemptions`, `character_excellence_awards`
  - **IPARD Bonus Service** (`server/services/ipardService.ts`): Transaction-safe functions for awarding Investigation+Preparation (25 tokens), Reflection (50 tokens), and Demonstration (75 tokens) bonuses with row-level locking and idempotency checks
  - **API Endpoints**: 
    - `POST /api/community-service/:id/submit-approval-form` - Student submits Service-Learning Approval Form
    - `POST /api/community-service/:id/approve-reflection` - Teacher approves high-quality reflection
    - `POST /api/community-service/:id/submit-demonstration` - Student submits demonstration of service experience
    - `GET /api/reflection/skills-and-traits` - Fetch available reflection skills and character traits
    - `POST /api/community-service/:id/tag-reflections` - Tag service log with developed skills/traits
  - **Admin Rewards Portal APIs**:
    - `GET /api/admin-rewards` - Fetch school rewards inventory
    - `POST /api/admin-rewards` - Create new high-value reward (admin only)
    - `POST /api/admin-rewards/:id/redeem` - Student applies for reward
    - `GET /api/admin-rewards/redemptions` - Admin views pending applications
    - `PATCH /api/admin-rewards/redemptions/:id` - Admin approves/denies/fulfills application
  - **Character Excellence API**:
    - `POST /api/character-excellence/award` - Teacher awards 500-1000 tokens with narrative (transaction-safe)
  - **Leaderboard API**:
    - `GET /api/leaderboard/monthly-top-earners` - Fetch top 5 students per grade for current month
  - **Frontend UI Components**:
    - Reflection tagging checkboxes in service log submission form (6 skills, 8 traits)
    - IPARD phase progress display in service history showing completed milestones and bonus tokens earned
    - Visual phase badges (Investigation 🔍, Preparation 📋, Action 💪, Reflection 💭, Demonstration 🎬, Complete ✅)
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
- **v2.1 IPARD Service-Learning Features**:
  - **Process-Based Token Rewards**: Milestone bonuses (25/50/75 tokens) for completing Investigation+Preparation, Reflection, and Demonstration phases
  - **21st Century Skills Tagging**: Students tag service experiences with Accountability, Critical Thinking, Communication/Collaboration, Leadership, Initiative, and Social/Cross-Cultural Skills
  - **Character Traits Development Tracking**: Students track development of Kindness, Integrity, Compassion, Leadership, Service, Empathy, Resilience, and Respect
  - **IPARD Phase Visualization**: Students see their progress through Investigation → Preparation → Action → Reflection → Demonstration → Complete
  - **Admin School Rewards**: High-value non-token rewards (VIP parking passes, homework passes, field trip vouchers) with application-approval workflow
  - **Character Excellence Recognition**: Teachers award 500-1000 bonus tokens for exceptional character demonstration with required narrative explanation
  - **Monthly Recognition Leaderboards**: Top 5 token earners per grade level for Principal's Corner announcements and positive reinforcement
  - **AI-Suggested Communications**: Ready-to-send email and announcement templates based on real-time Inclusion Score metrics, eliminating drafting friction for busy administrators. Includes 4 template types: Student Body Email (engagement boost), Morning Announcement Script (celebrating wins), Parent Newsletter Blurb (monthly updates), and Staff Memo (call-to-action). All templates personalize with actual school data and offer one-click copy functionality.
  - **Student Notification System**: Email-first digest architecture complying with high school phone restrictions and FERPA requirements
    - **Architecture**: Queue-based system with 7:30am daily digests and 3:30pm milestone notifications sent to parent emails
    - **Database Schema**: 3 tables (`student_notification_preferences`, `student_notification_events`, `student_notifications`) with indexed userId/status fields
    - **Service Layer** (`server/services/studentNotificationService.ts`): 331-line service with 6 queue methods (service approval, token milestones, streak achievements, IPARD bonuses, reward status, daily encouragement) and 3 processing methods (immediate, daily digest, milestone digest)
    - **Email Integration**: Two new methods added to EmailService interface (`sendStudentNotificationEmail`, `sendStudentDigestEmail`) implemented in NodemailerEmailService class with proper DEMO_MODE.enabled checks
    - **API Endpoints**:
      - `GET /api/student-notifications/preferences` - Fetch user notification preferences
      - `PUT /api/student-notifications/preferences` - Update preferences (emailNotificationsEnabled, dailyDigestTime, milestoneDigestTime)
      - `GET /api/student-notifications/history` - Paginated notification history with status filters
    - **Notification Types**: 6 event types (service_approved, token_milestone, streak_achievement, reward_status, ipard_bonus, daily_encouragement)
    - **Milestone Anti-Spam**: Tracks lastTokenMilestoneNotified and lastStreakMilestoneNotified per user to prevent duplicate notifications
    - **UI Component**: NotificationPreferences component integrated into StudentDashboard settings tab with email toggle, digest time selectors, and save functionality
    - **Trigger Integration**: Wired into 6 existing routes (service verification, IPARD bonuses, character excellence, reward redemptions) with try-catch error handling
  - **Comprehensive Audit Trail**: All token transactions logged in `token_transactions` table with before/after balance, source, and approving teacher context
  - **GCS Alignment**: Full compliance with Guilford County Schools Service-Learning Diploma requirements and IPARD model

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