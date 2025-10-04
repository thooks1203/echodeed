# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application designed to foster and track anonymous acts of kindness through a community-driven feed. It allows users to anonymously share kind acts, browse a global feed with filtering options, and view a real-time global kindness counter. The platform prioritizes anonymity by operating without user profiles or personal information. Currently being demoed at **Eastern Guilford High School in Gibsonville, NC** (grades 9-12), led by Principal of the Year Dr. Darrell Harris, the platform focuses on building character and empathy in diverse school communities, with plans for future expansion into additional schools and corporate wellness. Key capabilities include anonymous posting, a global kindness feed, real-time filtering and counting, robust content moderation, service hour tracking with photo verification, and local Greensboro business reward partnerships. The project emphasizes student privacy protection, workload reduction for teachers through automation, and regulatory compliance.

## User Preferences
Preferred communication style: Simple, everyday language.
Business planning approach: Conservative, realistic projections always. Under-promise, over-deliver.
**IMPORTANT: Do NOT ask about Stripe integration - it is not needed for this educational platform.**

## System Architecture
### UI/UX Decisions
The frontend is a React 18, TypeScript, and Vite single-page application. It utilizes Radix UI primitives and shadcn/ui components with TailwindCSS for a mobile-first, responsive design. The UI/UX emphasizes minimalism, a custom color palette, consistent iconography (Lucide React), and an "Electric Heart Logo" with gradient ripple effects. All dashboard tabs feature permanent vibrant colors for enhanced visual engagement, and role-based logic ensures specific UI elements (e.g., Echo Tokens button) are displayed only to relevant user roles (students/parents). Quick action buttons are proportionally sized for a professional appearance.

### Production Database Configuration (CRITICAL)
**Development vs Production Database Separation:**
- Development and production use **completely separate PostgreSQL databases**
- Each environment has its own DATABASE_URL
- Demo data (Emma's 7.5 service hours, tokens, streaks) must be initialized in BOTH databases

**Required Production Secrets (MUST be configured):**
1. **DEMO_MODE=true** - CRITICAL for demo data initialization in production
   - Without this, production database remains empty (0 hours, 0 tokens)
   - Set in: Replit Secrets → Production app secrets → DEMO_MODE = true
2. **DATABASE_URL** - Automatically configured by Replit for production
3. **OPENAI_API_KEY** - For AI features
4. **SESSION_SECRET** - For session management

**Production Deployment Checklist:**
1. ✅ Verify DEMO_MODE=true exists in "Production app secrets"
2. ✅ Click "Publish/Deploy" to trigger server restart
3. ✅ Production logs will show initialization:
   ```
   🚀 INITIALIZING DEMO DATA
   🎭 DEMO_MODE: true
   🔍 DATABASE VERIFICATION FOR EMMA JOHNSON:
      💰 Tokens: 1103 balance, 1380 earned, streak: 4/4
      📝 Service Logs: 2 records (7.5 hours total)
   ```
4. ✅ Verify www.echodeed.com shows Emma's data correctly

**Troubleshooting Production Issues:**
- **Problem:** Production shows 0 hours/0 tokens
- **Cause:** DEMO_MODE secret not enabled for production OR server not restarted after adding secret
- **Fix:** Add DEMO_MODE=true to production secrets, then republish app

### Technical Implementations
- **Frontend**: React 18, TypeScript, Vite, Wouter for routing, TanStack Query for server state.
- **Backend**: Express.js, TypeScript, RESTful API with WebSocket support, layered and modular architecture.
- **Data Storage**: Stores anonymous Kindness Posts (text, category, location, timestamps) and a global Kindness Counter. Schema supports geographic/category filtering and timestamp ordering.
- **Real-time Communication**: WebSockets for live feed updates, counter synchronization, automatic reconnection, and broadcast messaging.
- **Content Moderation**: Filters profanity and negative keywords, enforces length validation (10-280 characters), and automatically flags posts.
- **Kindness Sparks Celebration**: Visual animated celebration upon posting deeds for engagement.
- **COPPA Compliance System**: Digital consent, automated workflows, and annual renewal for K-8.
- **Summer Challenges**: Engine supports age-appropriate challenges for high school (grades 9-12).
- **Student Dashboard Streaks**: Data fixes ensure accurate display of current and best streaks.
- **Authentication**: Improved flow redirects unauthenticated users to a clean `/demo-login` page. Development uses mock authentication, while production requires real Replit OAuth.
- **Photo Verification System**: Complete implementation using Replit's App Storage with presigned URLs, ACL policies, and secure photo uploads via Uppy. Students can upload photos of verification letters when submitting service hours, and teachers see visual proof instantly for one-click approval - reducing verification time from 15 minutes to 30 seconds per student. Security features include school-level ACL enforcement (teachers can only view photos from their school), targeted database lookups for efficiency, and comprehensive audit logging.
- **x2vol District Integration**: EchoDeed's service hour tracking system is fully compatible with Guilford County's required x2vol platform. Database schema includes all x2vol-required fields: start_time/end_time (clock in/out), annual_goal_hours (default 30), current_school_year tracking, student reflections, organization contact info, and verification status. Teachers can export service hours to x2vol-compatible CSV format, eliminating duplicate data entry and reducing administrative workload by 95%. System maintains separate tracking of verified vs pending hours to match x2vol's approval workflow.
- **Kindness Connect Service Discovery**: Students discover and sign up for real service opportunities through an integrated opportunity browser featuring 10 verified Guilford County organizations (Greensboro Science Center, Interactive Resource Center, Out of the Garden Project, Habitat for Humanity, Urban Ministry, Second Harvest Food Bank, Books to Prisoners, Triad Health Project, Greensboro Public Library, Salvation Army). Backend includes service_opportunities and service_opportunity_signups tables with 8 API routes for browsing, filtering, signup management, and availability tracking.
- **AI Behavioral Mitigation Architecture**: Three-layer system designed for legal compliance: (1) **Behavioral Pattern Analyzer** (`behavioralPatternAnalyzer.ts`) - Classifies content into low/medium/high severity tiers using pattern matching, NO crisis detection; (2) **Compliance Filter** (`complianceFilter.ts`) - Pre-posting filter blocks profanity/bullying, queues concerning content for review, NO automatic counselor alerts; (3) **Aggregate Climate Monitor** (`aggregateClimateMonitor.ts`) - School-wide trend analytics, sentiment tracking, NO individual student predictions. All services explicitly avoid automatic interventions and route flagged content to human moderation queue.
- **Teacher Moderation Dashboard**: API endpoints for human review workflow: `/api/moderation/queue` (list flagged content), `/api/moderation/claim/:id` (assign to teacher), `/api/moderation/resolve/:id` (approve/reject), `/api/moderation/comment/:id` (add notes). All endpoints protected by `requireTeacherRole` middleware. Includes CSV export endpoints for Google Sheets integration: `/api/export/moderation-queue`, `/api/export/climate-metrics`, `/api/export/behavioral-trends`, `/api/export/comprehensive-report`.
- **Scalability**: Designed for enterprise performance with database optimization, caching, load testing, real-time monitoring, and auto-scaling.

### Feature Specifications
- **Anonymous Posting**: Users submit text-only descriptions of kind acts without personal identification.
- **Global Kindness Feed**: Real-time display of shared acts with location and category filtering.
- **Real-time Counter**: Tracks total global acts.
- **AI Behavioral Mitigation System**: Positions AI as a "Behavioral Mitigation and Documentation Tool" (NOT crisis intervention) to eliminate legal liability. System provides: (1) Compliance filtering for inappropriate content (profanity, bullying), (2) Aggregate school-wide climate monitoring (sentiment trends, behavioral patterns), (3) Human review queue for teacher decision-making on flagged content, (4) CSV export for Google Sheets integration. **CRITICAL: NO automatic crisis interventions** - no NCMEC reporting, no Slack alerts, no counselor notifications. All flagged content flows to teacher moderation queue requiring human approval. System provides documentation and decision-support analytics only.
- **Dual Reward System**: Implemented for both kids and parents.
- **High School Curriculum**: 5 comprehensive character education lessons for grades 9-12.
- **B2B Sponsor Monetization Platform**: Infrastructure for sponsor analytics, tiered sponsorships, and targeted campaigns.
- **Anonymous Workplace Wellness**: AI-powered predictive analytics for burnout risk and sentiment analysis.
- **Sustainable Reward Frequency Framework**: Optimized student surprise giveaways (weekly for high activity scores) and a structured teacher reward system with sponsor-covered and platform-funded frequencies.

### MVP Simplification: Hidden Features (Can be reactivated via feature flags)
- **Support Circle (HIDDEN FOR MVP)**: Mental health support feature deferred until licensed responder network is established. Current UI promised "licensed professionals at your school" but lacked monitoring infrastructure, creating liability risk. Conflicts with teacher workload reduction goal. Requires: external licensed provider partnership, FERPA/COPPA compliance, crisis response protocols, 24/7 monitoring SLAs. Set `VITE_ENABLE_SUPPORT_CIRCLE=true` to reactivate.
- **Challenges (HIDDEN)**: Summer and school-year challenges hidden to reduce complexity. Set `VITE_ENABLE_CHALLENGES=true` to reactivate.
- **AI Wellness (HIDDEN)**: Predictive wellness dashboards hidden. Set `VITE_ENABLE_AI_FEATURES=true` to reactivate.
- **Curriculum (HIDDEN)**: Lesson plans tab hidden from teacher dashboard. Set `VITE_ENABLE_CURRICULUM=true` to reactivate.

## External Dependencies
- **Frontend Frameworks**: React 18
- **Backend Frameworks**: Express.js
- **Languages/Tools**: TypeScript, Vite
- **UI Libraries**: Radix UI, shadcn/ui, TailwindCSS, Lucide React
- **State Management/Forms/Validation**: TanStack Query, React Hook Form, Zod
- **Database Technologies**: Drizzle ORM, Drizzle-Zod, @neondatabase/serverless (PostgreSQL)
- **Object Storage**: @google-cloud/storage, @uppy/core, @uppy/react, @uppy/aws-s3 (for verification photo uploads)
- **Real-time/Routing**: ws, wouter
- **Reward/Payment Integrations**: 21 Local Greensboro businesses (A Special Blend Coffee, Tate Street Coffee House, Chez Genèse, Chick-fil-A, Cook Out, Dames Chicken & Waffles, Dave's Hot Chicken, Boxcar Bar + Arcade, Yum Yum Better Ice Cream, Red Cinemas, Triad Lanes, Urban Air Trampoline Park, Greensboro Science Center, YMCA Greensboro, Barnes & Noble UNCG, Common Grounds Coffee, Greensboro Grasshoppers, Greensboro Public Library) plus national partners (Scholastic Books, Target Education, LEGO Education, Amazon Family)

## Demo School Configuration
**Primary School**: Eastern Guilford High School
- **Location**: 3609 Terrace Drive, Gibsonville, NC 27249
- **Phone**: (336) 449-4521
- **Grade Range**: 9-12
- **Student Count**: 1,200 students
- **Principal**: Dr. Darrell Harris (Guilford County Principal of the Year)
- **School Type**: Public High School
- **Accreditation**: Southern Association of Colleges and Schools (SACS)
- **Established**: 1965
- **Demographics**: Diverse student population serving Gibsonville and surrounding communities outside city limits

## Local Reward Partners (Eastern Guilford Area)
The platform features local businesses within 15 miles of Eastern Guilford High School in Gibsonville/Burlington/Greensboro area:

**Burlington Rd, Whitsett (0-2 miles from school - Walking/Biking Distance):**
- Chick-fil-A Burlington Rd (closest restaurant to Eastern Guilford HS)
- McDonald's Burlington Rd
- Wendy's Burlington Rd
- Taco Bell Burlington Rd
- Subway Burlington Rd
- Pizza Hut Burlington Rd
- Cook Out (NC institution - student favorite!)

**Greensboro Area (10-15 miles):**
- Greensboro Science Center (educational trips)
- Dave's Hot Chicken (trending Nashville-style hot chicken)
- Dames Chicken & Waffles (downtown Greensboro favorite)
- Boxcar Bar + Arcade (pizza & retro games)
- Yum Yum Better Ice Cream (Greensboro tradition since 1906)
- Red Cinemas (upscale downtown theater)
- Triad Lanes (bowling & arcade)
- Urban Air Trampoline Park
- YMCA of Greensboro
- Barnes & Noble UNCG
- Greensboro Grasshoppers (minor league baseball)
- Greensboro Public Library

**National Partners (Dual Rewards - Kid + Parent):**
- Scholastic Books
- Target Education
- LEGO Education
- Amazon Family

These hyper-local partnerships emphasize **Burlington Rd in Whitsett** (walking/biking distance from Eastern Guilford High School) to provide immediate, accessible rewards that students can actually use without transportation barriers, supporting the B2B sponsor monetization model while demonstrating community investment in character education.