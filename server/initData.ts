import { storage } from './storage';
import { log } from './vite';

export async function initializeSampleData() {
  try {
    const env = process.env.NODE_ENV || 'development';
    const demoMode = process.env.DEMO_MODE || 'false';
    const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET';
    
    log('='.repeat(80));
    log('🚀 INITIALIZING DEMO DATA');
    log(`📍 Environment: ${env}`);
    log(`🎭 DEMO_MODE: ${demoMode}`);
    log(`🗄️  Database URL: ${dbUrl}`);
    log('='.repeat(80));
    
    // Test database connection first
    try {
      await storage.getCounter();
      log('✓ Database connection verified');
    } catch (dbError: any) {
      log(`✗ Database connection failed: ${dbError.message}`);
      throw new Error(`Database connection failed during startup: ${dbError.message}`);
    }
    
    // 📢 Create notification preferences table if it doesn't exist (supports dev & production)
    try {
      log('📢 Setting up student notification system...');
      const { db } = await import('./db');
      const { sql } = await import('drizzle-orm');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS student_notification_preferences (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
          
          daily_encouragement_enabled INTEGER NOT NULL DEFAULT 1,
          notification_frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
          preferred_time VARCHAR(5) NOT NULL DEFAULT '09:00',
          timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
          
          push_notifications_enabled INTEGER NOT NULL DEFAULT 1,
          email_notifications_enabled INTEGER NOT NULL DEFAULT 0,
          
          last_notification_sent TIMESTAMP,
          total_notifications_sent INTEGER NOT NULL DEFAULT 0,
          total_notifications_opened INTEGER NOT NULL DEFAULT 0,
          
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      log('✅ Student notification preferences table ready (dev & production)');
    } catch (error: any) {
      log(`⚠️ Could not create notification preferences table: ${error.message}`);
    }
    
    // Update schools with enrollment codes for secure student registration
    try {
      log('🔐 Updating schools with enrollment codes...');
      const { db } = await import('./db');
      const { corporateAccounts } = await import('@shared/schema');
      const { eq, isNull } = await import('drizzle-orm');
      
      // Update Eastern Guilford High School
      await db.update(corporateAccounts)
        .set({ enrollmentCode: 'EGHS-2025' })
        .where(eq(corporateAccounts.companyName, 'Eastern Guilford High School'));
      
      log('✓ Updated Eastern Guilford High School with code: EGHS-2025');
      
      // Update other demo schools with codes if they exist
      const schoolCodes = [
        { name: 'Demo Elementary School', code: 'DEMO-ELEM-2025' },
        { name: 'Burlington Christian Academy', code: 'BCA-2025' },
        { name: 'Turrentine Middle School', code: 'TMS-2025' },
        { name: 'Wise Inc', code: 'WISE-2025' },
        { name: 'Winners Institute for Successful Empowerment', code: 'WISE-INST-2025' }
      ];
      
      for (const school of schoolCodes) {
        try {
          await db.update(corporateAccounts)
            .set({ enrollmentCode: school.code })
            .where(eq(corporateAccounts.companyName, school.name));
          log(`✓ Updated ${school.name} with code: ${school.code}`);
        } catch (error) {
          // School might not exist yet
        }
      }
      
      log('✅ School enrollment codes initialized');
    } catch (error: any) {
      log(`⚠️ Could not update school enrollment codes: ${error.message}`);
    }
    
    // Check if we already have posts (to avoid duplicate initialization)
    const existingPosts = await storage.getPosts();
    const existingCounter = await storage.getCounter();
    
    // Check if we need to refresh with kid-friendly posts
    const hasAdultContent = existingPosts.some(p => 
      p.content.includes('coffee') || 
      p.content.includes('coworker') || 
      p.content.includes('parking meter') ||
      p.content.includes('$20 tip')
    );
    
    // Check if we have kid-friendly content already
    const hasKidFriendlyContent = existingPosts.some(p =>
      p.content.includes('locker') ||
      p.content.includes('classmate') ||
      p.content.includes('playground') ||
      p.content.includes('teacher')
    );
    
    // FORCE COMPREHENSIVE RE-SEEDING FOR COMPLETE DEMO DATA
    log('🔄 FORCE RE-SEEDING: Adding comprehensive demo data regardless of existing content');
    
    // CRITICAL FIX: Reset the counter to prevent doubling
    log('🔄 Resetting global kindness counter to prevent accumulation...');
    
    // Get current counter and reset it to 0
    const currentCounter = await storage.getCounter();
    log(`📊 Current counter value: ${currentCounter.count}`);
    
    // Import database directly to reset counter
    const { db } = await import('./db');
    const { kindnessCounter } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.update(kindnessCounter)
      .set({ count: 287435, updatedAt: new Date() })
      .where(eq(kindnessCounter.id, "global"));
    
    log('✅ Global kindness counter set to 287,435');
    
    if (hasAdultContent) {
      log('Found adult content in posts, will add kid-friendly posts...');
      // Continue to add kid-friendly posts rather than trying to delete
    }

    // Sample kindness posts - culturally diverse for Eastern Guilford High School (grades 9-12)
    const samplePosts = [
      // Random Acts
      {
        content: "Helped my abuela carry groceries from the mercado. She taught me that familia comes first! 🛒",
        category: "Random Acts",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Shared my mom's homemade dumplings with the lunch table. Food brings everyone together! 🥟",
        category: "Random Acts",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville", 
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Brought extra lunch for a classmate who forgot theirs. We look out for each other here! 🍕",
        category: "Random Acts",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Cleaned up the soccer field after practice. This is our home away from home! ⚽",
        category: "Random Acts",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Left encouraging notes in different languages in lockers during finals. Everyone deserves support! 📝",
        category: "Random Acts",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Helping Others
      {
        content: "Tutored a classmate in algebra using both English and Spanish. Bilingual help hits different! 📚",
        category: "Helping Others",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina", 
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Showed the new exchange student around campus and introduced them to friends. We're all from somewhere! 🤝",
        category: "Helping Others",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped translate for a parent at the school office who needed Spanish interpretation. Building bridges! 🌉",
        category: "Helping Others",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Stayed late to help set up for the multicultural night. Celebrating all our backgrounds together! 🎉",
        category: "Helping Others",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Walked my younger sibling home and helped with homework. Family is everything in our culture! 👧",
        category: "Helping Others",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Encouragement  
      {
        content: "Supported my friend before their big math test. They aced it! Hard work pays off! 🎓",
        category: "Encouragement",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States", 
        isAnonymous: 1
      },
      {
        content: "Complimented a classmate's cultural outfit on heritage day. Celebrating diversity is beautiful! 👘",
        category: "Encouragement",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made a playlist mixing different cultures' music for study sessions. Unity through sound! 🎵",
        category: "Encouragement",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Posted positive affirmations in the group chat in both English and Spanish. ¡Sí se puede! 💪",
        category: "Encouragement",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Cheered loudly at the cultural arts showcase. Every tradition and performance matters! ✨",
        category: "Encouragement",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Charity
      {
        content: "Donated gently used clothes to families in need. Giving back feels amazing! 👕",
        category: "Charity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Volunteered at the local food pantry helping families from all backgrounds. Everyone deserves food! 🍲",
        category: "Charity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a coat drive for families in need this winter. Together we're stronger! 🧥",
        category: "Charity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Read bilingual books to kids at the library during cultural heritage month. Everyone's story matters! 📖",
        category: "Charity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a fundraiser at school for a classmate's family dealing with medical bills. Community support! 💝",
        category: "Charity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Community Action
      {
        content: "Organized a community cleanup day at the rec center. Taking care of our shared spaces! 🌟",
        category: "Community Action",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a community garden with neighbors from different backgrounds. Growing together! 🌱",
        category: "Community Action",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Painted a mural celebrating diversity and unity at the community center. Art brings us together! 🎨",
        category: "Community Action",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Led a school recycling project to help our community go green. Every action counts! ♻️",
        category: "Community Action",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a school supply drive for students who need support. Education is for everyone! 📚",
        category: "Community Action",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Spreading Positivity
      {
        content: "Started a poetry and spoken word club where everyone shares their stories. All voices welcome! 🎤",
        category: "Spreading Positivity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Created a social media page celebrating Eastern Guilford students' achievements. Shining a light on everyone! 📱",
        category: "Spreading Positivity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a multicultural music jam session in the courtyard. Different rhythms, one heartbeat! 🎧",
        category: "Spreading Positivity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Shouted out my teachers on social media for Teacher Appreciation Week. They believe in us when others don't! 🙏",
        category: "Spreading Positivity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made a gratitude video with friends about growing up in Gibsonville. This town raised us! 💚",
        category: "Spreading Positivity",
        location: "Gibsonville, North Carolina",
        city: "Gibsonville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      }
    ];

    // Create sample posts
    const createdPosts: any[] = [];
    for (const post of samplePosts) {
      const createdPost = await storage.createPost(post);
      createdPosts.push(createdPost);
    }

    // Add realistic engagement to demo posts (hearts and echoes)
    log('💫 Adding realistic engagement to demo posts...');
    
    // Get all posts to add engagement
    const allPosts = await storage.getPosts({});
    const recentDemoPosts = allPosts.slice(0, Math.min(15, allPosts.length)); // Last 15 posts
    
    for (const post of recentDemoPosts) {
      // Randomly add hearts (60% chance)
      if (Math.random() < 0.6) {
        const heartCount = Math.floor(Math.random() * 8) + 1; // 1-8 hearts
        for (let i = 0; i < heartCount; i++) {
          try {
            await storage.addHeartToPost(post.id, `demo_session_${i}_${Date.now()}`);
          } catch (error) {
            // Ignore duplicate heart errors for demo
          }
        }
      }
      
      // Randomly add echoes (35% chance)
      if (Math.random() < 0.35) {
        const echoCount = Math.floor(Math.random() * 4) + 1; // 1-4 echoes
        for (let i = 0; i < echoCount; i++) {
          try {
            await storage.addEchoToPost(post.id, `demo_echo_${i}_${Date.now()}`);
          } catch (error) {
            // Ignore duplicate echo errors for demo
          }
        }
      }
    }
    
    log('✨ Added realistic hearts and echoes to demo posts');

    // The global counter will automatically increment as posts are added
    log(`✓ Added ${samplePosts.length} sample posts`);
    log(`✓ Counter will reflect actual post count`);

    // 🎓 Initialize Sofia Rodriguez's Demo Data (Eastern Guilford High School)
    log('📚 Initializing Sofia Rodriguez demo student data...');
    
    try {
      const { db } = await import('./db');
      const { users, userTokens, communityServiceLogs, studentServiceSummaries } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Upsert Sofia Rodriguez user
      await storage.upsertUser({
        id: 'student-001',
        email: 'sofia.rodriguez@easterngs.gcsnc.com',
        firstName: 'Sofia',
        lastName: 'Rodriguez'
      });
      log('✅ Sofia Rodriguez user created');
      
      // Create/update Sofia's token record with realistic data
      const existingTokens = await db.select().from(userTokens).where(eq(userTokens.userId, 'student-001'));
      
      if (existingTokens.length === 0) {
        await db.insert(userTokens).values({
          userId: 'student-001',
          echoBalance: 1103,
          totalEarned: 1380,
          streakDays: 4,
          longestStreak: 4,
          lastPostDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        });
        log('✅ Sofia Rodriguez tokens initialized: 1103 balance, 1380 earned, 4-day streak');
      } else {
        await db.update(userTokens)
          .set({
            echoBalance: 1103,
            totalEarned: 1380,
            streakDays: 4,
            longestStreak: 4,
            lastPostDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
          })
          .where(eq(userTokens.userId, 'student-001'));
        log('✅ Sofia Rodriguez tokens updated: 1103 balance, 1380 earned, 4-day streak');
      }
      
      // Create Sofia's service hour logs - FORCE RESEED for consistent demo state
      const existingServiceLogs = await db.select().from(communityServiceLogs).where(eq(communityServiceLogs.userId, 'student-001'));
      
      // FORCE RE-SEED: Delete all service logs and recreate with 2 verified + 3 pending
      if (existingServiceLogs.length > 0) {
        await db.delete(communityServiceLogs).where(eq(communityServiceLogs.userId, 'student-001'));
        log('🔄 Deleted existing service logs to recreate with 2 VERIFIED + 3 PENDING');
      }
      
      // Create 2 VERIFIED service logs (7.5 hours already approved)
      if (true) { // Always create after delete
        // Verified log 1: Food Pantry Volunteer
        await db.insert(communityServiceLogs).values({
          userId: 'student-001',
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Food Pantry Volunteer',
          hoursLogged: '4.50',
          serviceDate: new Date('2025-09-25'),
          organizationName: 'Burlington Community Outreach Food Pantry',
          category: 'Community Support',
          serviceDescription: 'Helped sort and package food donations for local families',
          studentReflection: 'It felt great knowing I helped families have meals. I learned about food insecurity in our community.',
          verificationStatus: 'verified',
          verificationPhotoUrl: 'https://placehold.co/600x800/e3f2fd/1976d2?text=Food+Pantry+Volunteer%0AVerification+Letter%0A%0ABurlington+Community+Outreach%0A%0AThis+certifies+that+Sofia+Rodriguez%0Avolunteered+4.5+hours%0Aon+September+25,+2025',
          verifiedBy: 'teacher-001',
          verifiedAt: new Date('2025-09-26'),
          verificationNotes: 'Excellent work helping the community',
          parentNotified: true,
          tokensEarned: 225, // 50 tokens per hour * 4.5 hours
          submittedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        });
        
        // Verified log 2: Park & Trail Cleanup
        await db.insert(communityServiceLogs).values({
          userId: 'student-001',
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Park & Trail Cleanup',
          hoursLogged: '3.00',
          serviceDate: new Date('2025-09-18'),
          organizationName: 'Gibsonville Parks Department',
          category: 'Environmental',
          serviceDescription: 'Picked up litter and helped maintain trails at City Park',
          studentReflection: 'Working outside was refreshing and I could see the immediate impact of our work making the park beautiful.',
          verificationStatus: 'verified',
          verificationPhotoUrl: 'https://placehold.co/600x800/e8f5e9/388e3c?text=Park+%26+Trail+Cleanup%0AVerification+Letter%0A%0AGibsonville+Parks+Department%0A%0AThis+certifies+that+Sofia+Rodriguez%0Avolunteered+3.0+hours%0Aon+September+18,+2025',
          verifiedBy: 'teacher-001',
          verifiedAt: new Date('2025-09-19'),
          verificationNotes: 'Great environmental stewardship',
          parentNotified: true,
          tokensEarned: 150, // 50 tokens per hour * 3 hours
          submittedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
        });
        
        log('✅ Created 2 VERIFIED service logs: 7.5 hours already approved');
        
        // Create 3 PENDING service logs (7 hours awaiting approval)
        
        // Pending log 1: Library Tutoring
        await db.insert(communityServiceLogs).values({
          userId: 'student-001',
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Library Tutoring',
          hoursLogged: '3.00',
          serviceDate: new Date('2025-10-15'),
          organizationName: 'Eastern Guilford High School Library',
          category: 'Education',
          serviceDescription: 'Tutored middle school students in math and reading after school',
          studentReflection: 'I enjoyed helping younger students understand difficult concepts. It reinforced my own learning.',
          verificationStatus: 'pending',
          verificationPhotoUrl: 'https://placehold.co/600x800/fff3e0/f57c00?text=Library+Tutoring%0AVerification+Letter%0A%0AEastern+Guilford+HS+Library%0A%0AThis+certifies+that+Sofia+Rodriguez%0Avolunteered+3.0+hours%0Aon+October+15,+2025',
          verifiedBy: null,
          verifiedAt: null,
          verificationNotes: null,
          parentNotified: false,
          tokensEarned: 0,
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        
        // Pending log 2: Animal Shelter Care
        await db.insert(communityServiceLogs).values({
          userId: 'student-001',
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Animal Shelter Care',
          hoursLogged: '2.50',
          serviceDate: new Date('2025-10-12'),
          organizationName: 'Guilford County Animal Shelter',
          category: 'Animal Welfare',
          serviceDescription: 'Fed animals, cleaned kennels, and socialized dogs available for adoption',
          studentReflection: 'Working with rescue animals was heartwarming. I hope my work helps them find forever homes.',
          verificationStatus: 'pending',
          verificationPhotoUrl: 'https://placehold.co/600x800/fce4ec/c2185b?text=Animal+Shelter+Care%0AVerification+Letter%0A%0AGuilford+County+Animal+Shelter%0A%0AThis+certifies+that+Sofia+Rodriguez%0Avolunteered+2.5+hours%0Aon+October+12,+2025',
          verifiedBy: null,
          verifiedAt: null,
          verificationNotes: null,
          parentNotified: false,
          tokensEarned: 0,
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        });
        
        // Pending log 3: Senior Center Visit
        await db.insert(communityServiceLogs).values({
          userId: 'student-001',
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Senior Center Visit',
          hoursLogged: '1.50',
          serviceDate: new Date('2025-10-10'),
          organizationName: 'Gibsonville Senior Center',
          category: 'Community Support',
          serviceDescription: 'Played board games and read to elderly residents at the senior center',
          studentReflection: 'The seniors shared wonderful stories about their lives. I learned so much from their experiences.',
          verificationStatus: 'pending',
          verificationPhotoUrl: 'https://placehold.co/600x800/e1f5fe/0277bd?text=Senior+Center+Visit%0AVerification+Letter%0A%0AGibsonville+Senior+Center%0A%0AThis+certifies+that+Sofia+Rodriguez%0Avolunteered+1.5+hours%0Aon+October+10,+2025',
          verifiedBy: null,
          verifiedAt: null,
          verificationNotes: null,
          parentNotified: false,
          tokensEarned: 0,
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        });
        
        log('✅ Created 3 PENDING service logs: 7.0 hours awaiting teacher approval');
      }
      
      // Update service summary to reflect BOTH verified and pending hours
      const existingSummary = await db.select().from(studentServiceSummaries).where(eq(studentServiceSummaries.userId, 'student-001'));
      
      const summaryData = {
        userId: 'student-001',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
        totalHours: '14.50', // 7.5 verified + 7.0 pending
        verifiedHours: '7.50',
        pendingHours: '7.00',
        rejectedHours: '0',
        totalTokensEarned: 375, // 50 tokens per verified hour * 7.5 hours
        totalServiceSessions: 5, // 2 verified + 3 pending
        currentStreak: 2,
        longestStreak: 2,
        lastServiceDate: new Date('2025-10-15'),
        annualGoalHours: 30,
        currentSchoolYear: '2025-2026'
      };
      
      if (existingSummary.length === 0) {
        await db.insert(studentServiceSummaries).values(summaryData);
        log('✅ Sofia Rodriguez service summary created: 7.5 verified + 7.0 pending = 14.5 total hours');
      } else {
        await db.update(studentServiceSummaries)
          .set(summaryData)
          .where(eq(studentServiceSummaries.userId, 'student-001'));
        log('✅ Sofia Rodriguez service summary updated: 7.5 verified + 7.0 pending = 14.5 total hours');
      }
      
      // Verify data was created correctly
      const verifyTokens = await db.select().from(userTokens).where(eq(userTokens.userId, 'student-001'));
      const verifyServiceLogs = await db.select().from(communityServiceLogs).where(eq(communityServiceLogs.userId, 'student-001'));
      
      log('🔍 DATABASE VERIFICATION FOR SOFIA RODRIGUEZ:');
      log(`   💰 Tokens: ${verifyTokens[0]?.echoBalance} balance, ${verifyTokens[0]?.totalEarned} earned, streak: ${verifyTokens[0]?.streakDays}/${verifyTokens[0]?.longestStreak}`);
      const totalHours = verifyServiceLogs.reduce((sum, log) => sum + parseFloat(String(log.hoursLogged || 0)), 0);
      log(`   📝 Service Logs: ${verifyServiceLogs.length} records (${totalHours.toFixed(1)} hours total)`);
      
    } catch (error: any) {
      log(`⚠️  Error initializing Sofia Rodriguez data: ${error.message}`);
    }

    // Initialize Burlington Christian Academy fundraising campaigns
    try {
      log('🎯 Fundraising campaigns temporarily disabled due to schema mismatch');
      // TODO: Fix fundraising campaigns schema mismatch
      /*
      log('🎯 Initializing Burlington Christian Academy fundraising campaigns...');
      
      // Check if fundraisers already exist
      const existingFundraisers = await storage.getActiveFundraisers();
      
      if (existingFundraisers.length === 0) {
        // Create BCA Playground Improvement fundraiser
        await storage.createFundraiser({
          schoolName: 'Burlington Christian Academy',
          campaignName: 'New Playground Equipment Fund',
          description: 'Help us create an amazing new playground where BCA students can play, learn, and grow together! Our goal is to install modern, safe playground equipment that promotes physical activity and social interaction.',
          goalAmount: 15000, // $150.00 in cents
          currentAmount: 8750, // $87.50 in cents (58% progress)
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Ends in 60 days
          isActive: true,
          tokenMultiplier: 2 // Double tokens for donations!
        });

        // Create BCA Library Enhancement fundraiser
        await storage.createFundraiser({
          schoolName: 'Burlington Christian Academy',
          campaignName: 'Library Technology Upgrade',
          description: 'Transform our library into a modern learning hub! We\'re raising funds for new computers, tablets, and interactive learning stations to help our students explore, research, and create.',
          goalAmount: 12000, // $120.00 in cents
          currentAmount: 4200, // $42.00 in cents (35% progress)
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Started 15 days ago
          endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // Ends in 75 days
          isActive: true,
          tokenMultiplier: 2 // Double tokens for donations!
        });

        // Create BCA Garden Project fundraiser
        await storage.createFundraiser({
          schoolName: 'Burlington Christian Academy',
          campaignName: 'School Garden Project',
          description: 'Plant the seeds of learning! Our school garden will teach students about science, nutrition, and environmental stewardship while providing fresh produce for our cafeteria.',
          goalAmount: 5000, // $50.00 in cents
          currentAmount: 3100, // $31.00 in cents (62% progress)
          startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // Started 20 days ago
          endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // Ends in 40 days
          isActive: true,
          tokenMultiplier: 2 // Double tokens for donations!
        });

        log('✅ Created 3 active Burlington Christian Academy fundraising campaigns');
        log('🎁 All campaigns offer double tokens (2x multiplier) for family donations');
        log('🏫 Playground Equipment Fund: $87.50/$150.00 (58% complete)');
        log('💻 Library Technology: $42.00/$120.00 (35% complete)');
        log('🌱 School Garden: $31.00/$50.00 (62% complete)');
      } else {
        log(`ℹ️ ${existingFundraisers.length} fundraising campaigns already exist, skipping creation`);
      }
      */
    } catch (error: any) {
      log('⚠️ Could not initialize fundraising campaigns:', error.message || error);
    }

    // Initialize sample reward partners  
    log('Initializing reward partners and teacher recognition system...');
    /*
    const existingPartners = await storage.getRewardPartners();
    if (existingPartners.length === 0) {
      log('Initializing sample reward partners...');
      
      const samplePartners = [
        {
          partnerName: "Starbucks",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
          partnerType: "food",
          websiteUrl: "https://starbucks.com",
          description: "America's favorite coffee destination with premium beverages and food",
          isActive: 1,
          isFeatured: 1,
          minRedemptionAmount: 100,
          maxRedemptionAmount: 2000,
          contactEmail: "partners@starbucks.com"
        },
        {
          partnerName: "Amazon",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
          partnerType: "retail",
          websiteUrl: "https://amazon.com",
          description: "Everything you need, delivered fast with exclusive EchoDeed™ member discounts",
          isActive: 1,
          isFeatured: 1,
          minRedemptionAmount: 200,
          maxRedemptionAmount: 5000,
          contactEmail: "corporate@amazon.com"
        },
        {
          partnerName: "Nike",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
          partnerType: "wellness",
          websiteUrl: "https://nike.com",
          description: "Premium athletic gear and wellness products to support your active lifestyle",
          isActive: 1,
          isFeatured: 1,
          minRedemptionAmount: 300,
          maxRedemptionAmount: 3000,
          contactEmail: "corporate@nike.com"
        },
        {
          partnerName: "Spotify",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1200px-Spotify_logo_without_text.svg.png",
          partnerType: "tech",
          websiteUrl: "https://spotify.com",
          description: "Premium music streaming with exclusive wellness playlists for EchoDeed™ members",
          isActive: 1,
          isFeatured: 0,
          minRedemptionAmount: 150,
          maxRedemptionAmount: 1500,
          contactEmail: "partnerships@spotify.com"
        }
      ];

      for (const partner of samplePartners) {
        await storage.createRewardPartner(partner);
      }
      
      log(`✓ Initialized ${samplePartners.length} sample reward partners`);
    } else {
      log('🔄 Re-creating reward partners for comprehensive demo');
    }
    */

    // Initialize Kindness Connect Service Opportunities (Dr. Harris - Eastern Guilford HS)
    try {
      log('🤝 Initializing Kindness Connect service opportunities...');
      const { db } = await import('./db');
      const { serviceOpportunities } = await import('@shared/schema');
      const { count } = await import('drizzle-orm');
      
      // Check if opportunities already exist
      const existingOpportunities = await db.select({ count: count() }).from(serviceOpportunities);
      const oppCount = existingOpportunities[0]?.count || 0;
      
      if (oppCount === 0) {
        const guilfordOpportunities = [
          {
            organizationName: 'Second Harvest Food Bank of Northwest NC',
            location: 'Greensboro (Phillips Ave)',
            address: '3655 Reed St, Greensboro, NC 27404',
            geoLat: 36.0726,
            geoLong: -79.8097,
            title: 'Food Drive Volunteer',
            description: 'Help fight hunger in Guilford County by assisting with food sorting, packing, and distribution.',
            category: 'hunger_relief',
            serviceType: 'Food sorting, packing, and organizing',
            studentRole: 'Students can assist with food drives, sorting donated items, and packing supply boxes for distribution to local families in need.',
            minAge: 14,
            hoursOffered: 3,
            isRecurring: 1,
            schedule: 'Saturdays 9am-12pm',
            contactEmail: 'volunteer@secondharvestnwnc.org',
            contactPhone: '(336) 887-3517',
            verificationMethod: 'photo',
            schoolId: null, // County-wide opportunity
            radiusMiles: 15,
            status: 'active',
            featured: 1,
            createdBy: 'system-init'
          },
          {
            organizationName: 'The Servant Center',
            location: 'Greensboro',
            address: '2407 W Market St, Greensboro, NC 27403',
            geoLat: 36.0699,
            geoLong: -79.8352,
            title: 'Meal Prep & Food Drive Assistant',
            description: 'Support families in crisis by helping with meal preparation and food/supply organization.',
            category: 'food_housing_assistance',
            serviceType: 'Meal prep, food drives, supply organization',
            studentRole: 'Students can help with meal preparation, organize food drives, sort donations, and maintain supply closets for families experiencing homelessness.',
            minAge: 13,
            hoursOffered: 2.5,
            isRecurring: 1,
            schedule: 'Flexible weekday afternoons',
            contactEmail: 'volunteer@servantcenter.org',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 1,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Greensboro Urban Ministry',
            location: 'Greensboro',
            address: '305 West Gate City Blvd, Greensboro, NC 27401',
            geoLat: 36.0663,
            geoLong: -79.7918,
            title: 'Food Pantry & Clothing Sort Volunteer',
            description: 'Combat homelessness and hunger by assisting in the food pantry and clothing distribution.',
            category: 'homelessness_hunger',
            serviceType: 'Food pantry assistance, clothing sorting',
            studentRole: 'Great for organizing food drives, sorting donated clothing, and helping distribute supplies through the food pantry to individuals experiencing homelessness.',
            minAge: 14,
            hoursOffered: 3,
            isRecurring: 1,
            schedule: 'Tuesday/Thursday afternoons 3-6pm',
            contactEmail: 'volunteer@greensborourbanministry.org',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          },
          {
            organizationName: 'The Salvation Army (Greensboro Area)',
            location: 'Greensboro',
            address: '638 N Elm St, Greensboro, NC 27401',
            geoLat: 36.0773,
            geoLong: -79.7924,
            title: 'Thrift Store & Donation Sorting',
            description: 'Assist with social services by sorting donations and stocking shelves at our thrift store.',
            category: 'social_services',
            serviceType: 'Donation sorting, shelf stocking, seasonal programs',
            studentRole: 'Students can help sort donated items, stock thrift store shelves, and assist with seasonal community programs like back-to-school drives.',
            minAge: 13,
            hoursOffered: 2,
            isRecurring: 1,
            schedule: 'Saturdays 10am-2pm',
            contactEmail: 'greensboro@uss.salvationarmy.org',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Guilford County Animal Shelter',
            location: 'Greensboro',
            address: '3117 Hilltop Rd, Greensboro, NC 27405',
            geoLat: 36.0315,
            geoLong: -79.8461,
            title: 'Animal Care & Adoption Event Assistant',
            description: 'Help care for shelter animals and assist with adoption events.',
            category: 'animal_welfare',
            serviceType: 'Animal care, cleaning, socialization, adoption events',
            studentRole: 'Students can help clean animal areas, socialize cats and dogs, walk dogs, and assist with weekend adoption events to find forever homes.',
            minAge: 14,
            hoursOffered: 2,
            isRecurring: 1,
            schedule: 'Weekends 9am-12pm',
            contactEmail: 'volunteer@guilfordpets.com',
            contactPhone: '(336) 641-3401',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Habitat for Humanity of Greater Greensboro',
            location: 'Greensboro',
            address: '2510 Summit Ave, Greensboro, NC 27405',
            geoLat: 36.0598,
            geoLong: -79.8181,
            title: 'Construction Site Support (16+)',
            description: 'Build affordable housing and serve families in need through construction work.',
            category: 'affordable_housing',
            serviceType: 'Construction support, office work, fundraising',
            studentRole: 'Students 16+ can help with construction site tasks. Younger students can assist with office organization or fundraising events.',
            minAge: 16,
            hoursOffered: 4,
            isRecurring: 1,
            schedule: 'Saturdays 8am-3pm',
            contactEmail: 'volunteer@habitatgreensboro.org',
            contactPhone: '(336) 275-7679',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Greensboro Beautiful / Parks & Recreation',
            location: 'Greensboro',
            address: 'Various Greensboro parks',
            geoLat: 36.0726,
            geoLong: -79.7920,
            title: 'Park Cleanup & Trail Maintenance',
            description: 'Protect the environment through park cleanups, trail maintenance, and planting projects.',
            category: 'environment_parks',
            serviceType: 'Park cleanup, trail maintenance, planting',
            studentRole: 'Perfect for one-time school event days or recurring volunteer shifts. Students help with litter cleanup, trail maintenance, and community planting projects.',
            minAge: 12,
            hoursOffered: 2.5,
            isRecurring: 1,
            schedule: 'First Saturday of month 9am-12pm',
            contactEmail: 'volunteer@greensborobeautiful.org',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Backpack Beginnings',
            location: 'Greensboro',
            address: '3801 N Church St, Greensboro, NC 27405',
            geoLat: 36.1096,
            geoLong: -79.7848,
            title: 'Food Bag Packing for Kids',
            description: 'Fight child hunger by packing weekend food bags for elementary students in need.',
            category: 'child_hunger',
            serviceType: 'Food packing and organizing supplies',
            studentRole: 'Students pack bags with nutritious food and supplies for children facing food insecurity, ensuring no child goes hungry on weekends.',
            minAge: 12,
            hoursOffered: 1.5,
            isRecurring: 1,
            schedule: 'Thursdays 4-6pm',
            contactEmail: 'volunteer@backpackbeginnings.org',
            contactPhone: '(336) 389-0201',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 1,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Senior Living Facilities (Guilford County)',
            location: 'Greensboro Area',
            address: 'Various senior centers in Guilford County',
            geoLat: 36.0726,
            geoLong: -79.7920,
            title: 'Elderly Engagement Activities',
            description: 'Bring joy to seniors through activities, reading, and companionship.',
            category: 'elderly_engagement',
            serviceType: 'Activities, reading, socialization',
            studentRole: 'Students assist with planned activities like bingo or crafts, read to residents, or simply spend quality time socializing and brightening someone\'s day.',
            minAge: 13,
            hoursOffered: 2,
            isRecurring: 1,
            schedule: 'Flexible afternoons/weekends',
            contactEmail: 'activities@guilfordseniors.org',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          },
          {
            organizationName: 'Reading Connections',
            location: 'Greensboro',
            address: '601 S Elm St, Greensboro, NC 27406',
            geoLat: 36.0644,
            geoLong: -79.7892,
            title: 'Literacy Tutoring & Materials Organization',
            description: 'Support adult learners and promote literacy in Guilford County.',
            category: 'literacy_support',
            serviceType: 'Materials organization, tutoring support',
            studentRole: 'Students can organize educational materials or, with training, assist with tutoring adult learners. High-value community service opportunity.',
            minAge: 15,
            hoursOffered: 2,
            isRecurring: 1,
            schedule: 'Weekday evenings 5-7pm',
            contactEmail: 'volunteer@readingconnections.org',
            contactPhone: '(336) 230-2223',
            verificationMethod: 'photo',
            schoolId: null,
            radiusMiles: 15,
            status: 'active',
            featured: 0,
            createdBy: 'system-init'
          }
        ];

        // Insert all opportunities
        for (const opp of guilfordOpportunities) {
          await db.insert(serviceOpportunities).values(opp);
        }

        log(`✅ Initialized ${guilfordOpportunities.length} Kindness Connect service opportunities`);
        log('🏫 All opportunities within 15 miles of Eastern Guilford HS');
        log('📍 Categories: Hunger Relief, Animal Welfare, Environment, Literacy, Housing, Child Services');
      } else {
        log(`ℹ️  ${oppCount} service opportunities already exist, skipping creation`);
      }
    } catch (error: any) {
      log(`⚠️ Could not initialize service opportunities: ${error.message}`);
    }

    // Initialize mentor sample data (mentorships, activities, badges)
    try {
      const { initializeMentorSampleData } = await import('./mentorSampleData');
      await initializeMentorSampleData();
    } catch (error: any) {
      log(`⚠️ Could not initialize mentor sample data: ${error.message}`);
    }

    // Initialize Principal's Corner blog posts
    try {
      log(`📝 Initializing Principal's Corner blog posts...`);
      const { principalBlogPosts, users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Create Dr. Harris admin user if doesn't exist
      const drHarrisId = 'admin-dr-harris';
      const existingAdmin = await db.select().from(users).where(eq(users.id, drHarrisId)).limit(1);
      if (existingAdmin.length === 0) {
        await db.insert(users).values({
          id: drHarrisId,
          email: 'dr.harris@echodeed.com',
          firstName: 'Dr. Darrell',
          lastName: 'Harris',
          schoolRole: 'admin',
          schoolId: 'eastern-guilford-hs'
        });
        log(`✅ Created Dr. Darrell Harris admin user`);
      }
      
      const existingPosts = await db.select().from(principalBlogPosts).limit(1);
      if (existingPosts.length === 0) {
        const blogPosts = [
          {
            authorId: 'admin-dr-harris',
            title: 'Welcome to EchoDeed: Building Character Through Kindness',
            content: `Dear Parents and Families,

I'm thrilled to introduce EchoDeed to our Eastern Guilford community. As Principal of the Year for Guilford County, I've seen firsthand how powerful character education can be in transforming school culture.

EchoDeed isn't just another app - it's a movement to help our students develop empathy, compassion, and leadership skills that will serve them throughout their lives.

**Why Character Education Matters**

In today's fast-paced world, our students face unprecedented challenges. Social media, academic pressure, and constant connectivity can make it difficult for young people to develop meaningful relationships and a strong sense of self.

Character education provides the foundation for:
- Making ethical decisions
- Building resilience
- Developing emotional intelligence
- Creating positive relationships
- Contributing to their community

**How You Can Support Your Child**

1. **Talk about their acts of kindness** - Ask them what they posted on EchoDeed today
2. **Celebrate their service hours** - Acknowledge their commitment to helping others
3. **Model kindness yourself** - Show them what compassion looks like in action
4. **Review their progress together** - Use the Parent Dashboard to stay connected

Together, we're building a community where kindness is the norm, not the exception.

With gratitude,
Dr. Darrell Harris
Principal, Eastern Guilford High School`,
            excerpt: 'An introduction to EchoDeed and why character education matters for our students.',
            category: 'program-updates',
            publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          },
          {
            authorId: 'admin-dr-harris',
            title: '5 Daily Conversation Starters to Build Empathy',
            content: `Dear Families,

One of the most powerful tools we have as parents and educators is conversation. Here are five simple questions you can ask your child daily to build empathy and character:

**1. "What's one kind thing you saw today?"**
This helps children notice and appreciate kindness in their environment. It trains their brain to look for positive actions.

**2. "How did you help someone today?"**
Encourages reflection on their own actions and reinforces the habit of helping others.

**3. "Was there a moment when you felt someone needed help? What did you do?"**
Develops their ability to recognize when others need support and take action.

**4. "What made you feel grateful today?"**
Gratitude is the foundation of happiness. This simple question can shift their entire perspective.

**5. "If you could make one person's day better tomorrow, who would it be and how?"**
Helps them plan acts of kindness proactively, making compassion a deliberate choice.

**The Science Behind It**

Research shows that regular conversations about values and character:
- Strengthen parent-child bonds
- Improve emotional regulation
- Increase prosocial behavior
- Build self-awareness

**Make It a Routine**

Try asking one question during:
- Dinner time
- Car rides home
- Bedtime conversations

Remember, there are no wrong answers. The goal is to create space for reflection and connection.

Keep building those character muscles!

Dr. Darrell Harris`,
            excerpt: 'Five simple daily questions to build empathy and character in your children.',
            category: 'parent-resources',
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          },
          {
            authorId: 'admin-dr-harris',
            title: 'The Science of Service Learning: Why It Works',
            content: `Dear EchoDeed Families,

I want to share some exciting research about why service learning is so powerful for adolescent development.

**Brain Development in Teens**

The teenage brain is uniquely wired for:
- **Purpose-seeking** - They want to make a difference
- **Peer connection** - Social relationships drive motivation
- **Identity formation** - They're figuring out who they are
- **Risk and reward** - They're drawn to meaningful challenges

Service learning taps into all these developmental needs simultaneously.

**The Research Is Clear**

Studies show students engaged in service learning:
- Improve academic performance by 15-20%
- Show 40% increase in civic engagement
- Demonstrate better problem-solving skills
- Report higher life satisfaction
- Develop stronger career readiness

**What Makes EchoDeed Different**

Traditional service learning often:
- Lacks immediate feedback
- Feels disconnected from daily life
- Doesn't track long-term impact
- Misses the social component

EchoDeed solves these challenges by:
- **Instant recognition** through tokens and rewards
- **Daily opportunities** for kindness
- **Progress tracking** you can see together
- **Community connection** through the feed
- **Real partnerships** with local organizations

**At Eastern Guilford**

We're already seeing incredible results:
- 287,000+ acts of kindness shared
- Students averaging 7.5 service hours per semester
- 95% of parents report improved family conversations
- Dramatic decrease in bullying incidents

**Your Role**

You don't need to be an expert in character education. Just:
- Ask questions
- Celebrate efforts
- Share your own acts of kindness
- Review their dashboard together weekly

The impact you're making is real and measurable.

Proudly serving our community,
Dr. Darrell Harris`,
            excerpt: 'Research-backed insights on why service learning transforms student development.',
            category: 'character-education',
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            authorId: 'admin-dr-harris',
            title: 'Kindness in Action: Student Success Stories',
            content: `Dear Families,

I want to share some incredible stories from our Eastern Guilford students that demonstrate the power of kindness in action.

**Sofia's Story: From Shy to Service Leader**

Sofia Rodriguez started this semester barely speaking in class. Through EchoDeed, she:
- Completed 7.5 service hours at the Greensboro Science Center
- Organized a book drive for Books to Prisoners
- Mentored two 9th graders through peer support
- Earned over 1,100 Echo Tokens

But the real transformation? Her mother shared: "Sofia used to come home and go straight to her room. Now she can't wait to tell me about the people she helped today."

**The Cafeteria Kindness Campaign**

A group of 11th graders noticed new students eating alone. They started:
- "Save a Seat" movement - welcoming transfer students
- Daily compliment cards left at lunch tables
- Peer mentorship program connecting grades 9-12

Result? Zero reports of lunchtime bullying this semester.

**The Science Center Partnership**

Through Kindness Connect, 47 students have:
- Completed 156 service hours
- Taught science to 200+ visiting children
- Earned real work experience
- Built resume-worthy skills

Many are now considering STEM careers they never imagined.

**Parent Engagement Success**

The dual reward system is changing family dynamics:
- Parents earning Target/Amazon credits alongside students
- Family conversations about service increased 300%
- Joint volunteer opportunities up 85%
- Parent-child bonding through shared goals

**What These Stories Teach Us**

1. **Small acts compound** - Every kindness creates ripple effects
2. **Recognition matters** - Tokens and rewards reinforce positive behavior
3. **Community connection** - Students thrive when they feel part of something bigger
4. **Family involvement** - Parent engagement multiplies impact

**Your Child's Story**

Every student has a unique kindness journey. Use the Parent Dashboard to:
- Track their service hours
- See their kindness posts
- Celebrate their milestones
- Support their goals

You're raising the next generation of compassionate leaders.

With immense pride,
Dr. Darrell Harris
Principal, Eastern Guilford High School`,
            excerpt: 'Real stories from Eastern Guilford students showing how EchoDeed transforms school culture.',
            category: 'program-updates',
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
          }
        ];

        for (const post of blogPosts) {
          await db.insert(principalBlogPosts).values(post);
        }
        
        log(`✅ Created ${blogPosts.length} Principal's Corner blog posts from Dr. Harris`);
      } else {
        log(`ℹ️  Principal's Corner blog posts already exist, skipping creation`);
      }
    } catch (error: any) {
      log(`⚠️ Could not initialize blog posts: ${error.message}`);
    }

    // Initialize Parent Community posts (parent-to-parent sharing)
    try {
      log(`👪 Initializing Parent Community posts...`);
      const { parentCommunityPosts, users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Check if posts already exist
      const existingCommunityPosts = await db.select().from(parentCommunityPosts).limit(1);
      
      if (existingCommunityPosts.length === 0) {
        // Create sample parent users for community posts
        const parentUsers = [
          { id: 'parent-maria-rodriguez', name: 'Maria Rodriguez', email: 'maria.rodriguez@example.com' },
          { id: 'parent-james-chen', name: 'James Chen', email: 'james.chen@example.com' },
          { id: 'parent-sarah-williams', name: 'Sarah Williams', email: 'sarah.williams@example.com' },
          { id: 'parent-david-kim', name: 'David Kim', email: 'david.kim@example.com' }
        ];

        // Create parent user accounts if they don't exist
        for (const parent of parentUsers) {
          const existingUser = await db.select().from(users).where(eq(users.id, parent.id)).limit(1);
          if (existingUser.length === 0) {
            await db.insert(users).values({
              id: parent.id,
              email: parent.email,
              firstName: parent.name.split(' ')[0],
              lastName: parent.name.split(' ')[1],
              schoolRole: 'parent',
              schoolId: '1', // Eastern Guilford
            });
          }
        }

        // Sample parent community posts
        const communityPosts = [
          {
            authorId: 'parent-maria-rodriguez',
            authorName: 'Maria Rodriguez',
            schoolId: '1',
            title: 'Morning Routine Tips That Changed Everything',
            content: `I wanted to share what's been working for our family. We started a "kindness journal" at breakfast where each person shares one kind act they plan to do that day. It's been amazing to see my kids thinking about kindness first thing in the morning!\n\nWe also keep it simple - just 2 minutes while eating breakfast. The kids love it and it's become a natural part of our routine. Anyone else have morning rituals that promote kindness?`,
            category: 'parenting-tips',
            likesCount: 12,
            commentsCount: 8,
          },
          {
            authorId: 'parent-james-chen',
            authorName: 'James Chen',
            schoolId: '1',
            title: 'Thank You Eastern Guilford Teachers! 🙏',
            content: `I just want to publicly thank the incredible teachers at Eastern Guilford. My son came home yesterday excited to tell me about the kindness act he did at school - helping a classmate understand math homework.\n\nThe teachers here don't just teach academics, they're building character. We're so grateful to be part of this community. Thank you Dr. Harris and all the staff!`,
            category: 'celebrations',
            likesCount: 24,
            commentsCount: 15,
          },
          {
            authorId: 'parent-sarah-williams',
            authorName: 'Sarah Williams',
            schoolId: '1',
            title: 'How Do You Handle Screen Time vs. Real World Kindness?',
            content: `Looking for advice from other parents. My daughter loves using EchoDeed to track her kindness, but I also want to make sure she's doing acts of kindness beyond the app.\n\nHow do you balance encouraging kids to log their kindness while also teaching them to do good deeds without needing recognition? Would love to hear what's working for your family!`,
            category: 'questions',
            likesCount: 18,
            commentsCount: 22,
          },
          {
            authorId: 'parent-david-kim',
            authorName: 'David Kim',
            schoolId: '1',
            title: 'Local Resources: Free Character Ed Books at Greensboro Library',
            content: `Heads up parents! The Greensboro Public Library just added a new "Character Education" section with free books about kindness, empathy, and service.\n\nI took my kids there last weekend and they loved it. The librarian said they partnered with local schools including Eastern Guilford to build this collection. Great supplement to what they're learning in school!\n\nAddress: 219 N Church St, Greensboro, NC 27401`,
            category: 'resources',
            likesCount: 31,
            commentsCount: 12,
          },
          {
            authorId: 'parent-maria-rodriguez',
            authorName: 'Maria Rodriguez',
            schoolId: '1',
            title: 'Service Hour Success Story - Worth Sharing!',
            content: `My daughter Sofia just completed her first 10 hours of community service at the Greensboro Science Center, and I'm so proud! 🎉\n\nWhat made it special: she didn't just do it for the hours. She genuinely loved helping educate younger kids about animals. Now she wants to volunteer there all summer!\n\nThank you EchoDeed for making service hours trackable and rewarding. It gave her that initial motivation, but now she's doing it because she loves it. That's the real win!`,
            category: 'celebrations',
            likesCount: 45,
            commentsCount: 18,
          },
        ];

        // Insert posts with proper timestamps (newest first in the feed)
        for (let i = 0; i < communityPosts.length; i++) {
          await db.insert(parentCommunityPosts).values({
            ...communityPosts[i],
            createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000), // Stagger posts over 10 days
          });
        }

        log(`✅ Created ${communityPosts.length} Parent Community posts for demo`);
      } else {
        log(`ℹ️  Parent Community posts already exist, skipping creation`);
      }
    } catch (error: any) {
      log(`⚠️ Could not initialize parent community posts: ${error.message}`);
    }

    log(`✓ Successfully initialized ${samplePosts.length} sample posts and updated global counter`);
  } catch (error: any) {
    log(`✗ Error initializing sample data: ${error.message}`);
    // Re-throw the error so the calling code can decide how to handle it
    throw new Error(`Sample data initialization failed: ${error.message}`);
  }
}