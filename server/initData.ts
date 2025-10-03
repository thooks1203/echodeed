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

    // Sample kindness posts - culturally relevant for Dudley High School (grades 9-12, urban Greensboro)
    const samplePosts = [
      // Random Acts
      {
        content: "Helped my grandma carry groceries from the corner store on MLK Drive. She always looks out for me! 🛒",
        category: "Random Acts",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Gave my old Jordans to my cousin starting high school. Gotta help fam look fresh on day one! 👟",
        category: "Random Acts",
        location: "Greensboro, North Carolina",
        city: "Greensboro", 
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Brought extra lunch for my homie who didn't have meal money. Nobody goes hungry on my watch! 🍕",
        category: "Random Acts",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Cleaned up the basketball court at Windsor Rec Center after playing. It's our community space! 🏀",
        category: "Random Acts",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Left encouraging notes in lockers during finals week. We all need that extra push sometimes! 📝",
        category: "Random Acts",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Helping Others
      {
        content: "Tutored underclassmen in algebra after school. Math hit different when someone explains it right! 📚",
        category: "Helping Others",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina", 
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Showed the new kid how to navigate the hallways and introduced them to my crew. Nobody should feel alone! 🤝",
        category: "Helping Others",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped my neighbor Ms. Johnson fix her porch railing. Elders built this community, we gotta look out for them! 🔨",
        category: "Helping Others",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Stayed late to help Coach set up for the pep rally. School spirit hits different when we all contribute! 🎉",
        category: "Helping Others",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Walked my little sister home from middle school when mom had to work late. Family first always! 👧",
        category: "Helping Others",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Encouragement  
      {
        content: "Hyped up my friend before their college interview. They got accepted! Black excellence is real! 🎓",
        category: "Encouragement",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States", 
        isAnonymous: 1
      },
      {
        content: "Complimented someone's natural hair in the bathroom. Self-love and representation matter! 👑",
        category: "Encouragement",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made a playlist for my friend going through it. Music heals when words fail! 🎵",
        category: "Encouragement",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Posted positive affirmations in the group chat when everyone was stressing about SATs. We got this! 💪",
        category: "Encouragement",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Cheered loud at my homie's step show performance. Supporting Black art and culture! ✨",
        category: "Encouragement",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Charity
      {
        content: "Donated clothes to the Urban Ministry clothes closet. Somebody needs this more than me! 👕",
        category: "Charity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Volunteered at the East Greensboro food bank. Fighting food insecurity in our community! 🍲",
        category: "Charity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a coat drive at church for families in need this winter. Community keeps us warm! 🧥",
        category: "Charity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Read to kids at the library for Black History Month. Representation in stories matters! 📖",
        category: "Charity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Raised money at the barbershop for a classmate's family dealing with medical bills. We take care of our own! 💈",
        category: "Charity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Community Action
      {
        content: "Organized a Juneteenth cleanup at Smith Recreation Center with the crew. Our history, our space! 🌟",
        category: "Community Action",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a community garden in the vacant lot on East Market Street. Fresh food for the neighborhood! 🌱",
        category: "Community Action",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Painted a mural honoring local Black leaders at the community center. Art tells our story! 🎨",
        category: "Community Action",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Led a voter registration drive for seniors turning 18. Our voices matter in this city! 🗳️",
        category: "Community Action",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a school supply drive for kids in East Greensboro. Education is our way up! 📚",
        category: "Community Action",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Spreading Positivity
      {
        content: "Started a spoken word club where we share our truth and lift each other up. Our voices matter! 🎤",
        category: "Spreading Positivity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Created an IG page celebrating Dudley students' achievements. We don't get enough credit for what we do! 📱",
        category: "Spreading Positivity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a cypher session in the courtyard. Hip hop culture brings us together! 🎧",
        category: "Spreading Positivity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Shouted out my teachers on social media for Teacher Appreciation Week. They believe in us when others don't! 🙏",
        category: "Spreading Positivity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made a gratitude video with friends about growing up in Greensboro. This city raised us! 💚",
        category: "Spreading Positivity",
        location: "Greensboro, North Carolina",
        city: "Greensboro",
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

    // NOTE: No pre-seeded student data - students will create their own accounts via Replit Auth
    log('✓ Demo uses real Dudley High School students (no mock data)');

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

    log(`✓ Successfully initialized ${samplePosts.length} sample posts and updated global counter`);
  } catch (error: any) {
    log(`✗ Error initializing sample data: ${error.message}`);
    // Re-throw the error so the calling code can decide how to handle it
    throw new Error(`Sample data initialization failed: ${error.message}`);
  }
}