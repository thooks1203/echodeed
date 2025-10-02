# EchoDeed™ - Anonymous Kindness Platform

## Overview
EchoDeed™ is a mobile-first web application designed to foster and track anonymous acts of kindness through a community-driven feed. It allows users to anonymously share kind acts, browse a global feed with filtering options, and view a real-time global kindness counter. The platform prioritizes anonymity by operating without user profiles or personal information. Currently deployed at **Dudley High School in Greensboro, NC** (grades 9-12), the platform focuses on building character and empathy, with plans for future expansion into additional schools and corporate wellness. Key capabilities include anonymous posting, a global kindness feed, real-time filtering and counting, robust content moderation, service hour tracking with photo verification, and local Greensboro business reward partnerships. The project emphasizes student privacy protection, workload reduction for teachers through automation, and regulatory compliance.

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
- **Summer Challenges**: Engine supports age-appropriate challenges for grades 6-12.
- **Student Dashboard Streaks**: Data fixes ensure accurate display of current and best streaks.
- **Authentication**: Improved flow redirects unauthenticated users to a clean `/demo-login` page. Development uses mock authentication, while production requires real Replit OAuth.
- **Photo Verification System**: Complete implementation using Replit's App Storage with presigned URLs, ACL policies, and secure photo uploads via Uppy. Students can upload photos of verification letters when submitting service hours, and teachers see visual proof instantly for one-click approval - reducing verification time from 15 minutes to 30 seconds per student. Security features include school-level ACL enforcement (teachers can only view photos from their school), targeted database lookups for efficiency, and comprehensive audit logging.
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
- **Reward/Payment Integrations**: Local Greensboro businesses (A Special Blend Coffee, Tate Street Coffee House, Chez Genèse, Chick-fil-A, Greensboro Science Center, YMCA Greensboro, Barnes & Noble UNCG, Fig & Olive Cafe, Common Grounds Coffee, Recovery Café Greensboro, SHIELD Mentor Program, Greensboro Grasshoppers, Greensboro Public Library) plus national partners (Scholastic Books, Target Education, LEGO Education, Amazon Family)

## Demo School Configuration
**Primary School**: Dudley High School
- **Location**: 1200 Lincoln Street, Greensboro, NC 27401
- **Phone**: (336) 370-8240
- **Grade Range**: 9-12
- **Student Count**: 1,200 students
- **Principal**: Dr. Quinton Alston
- **School Type**: Public High School
- **Accreditation**: Southern Association of Colleges and Schools (SACS)
- **Established**: 1929

## Local Greensboro Reward Partners
The platform features 17 local Greensboro-area businesses supporting student kindness:

**Coffee Shops & Cafes:**
- A Special Blend Coffee (nonprofit employing adults with disabilities)
- Tate Street Coffee House (organic fair-trade near UNCG)
- Common Grounds Coffee (student-friendly with wifi)
- Fig & Olive Cafe (healthy meals for students)

**Restaurants:**
- Chez Genèse (French-inspired, employing adults with intellectual disabilities)
- Chick-fil-A Greensboro (near Dudley High School)
- Recovery Café Greensboro (community-based support cafe)

**Educational & Recreation:**
- Greensboro Science Center (aquarium, zoo, museum)
- Greensboro Public Library (study spaces, reading programs)
- Barnes & Noble UNCG (books and school supplies)
- YMCA of Greensboro (youth development programs)
- SHIELD Mentor Program (youth mentoring and robotics)

**Sports & Entertainment:**
- Greensboro Grasshoppers (minor league baseball)

These partnerships support the B2B sponsor monetization model while providing meaningful rewards for students demonstrating kindness and service.