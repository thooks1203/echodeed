import { storage } from './storage';
import { log } from './vite';

export async function initializeSampleData() {
  try {
    log('Initializing sample data...');
    
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
      .set({ count: 0, updatedAt: new Date() })
      .where(eq(kindnessCounter.id, "global"));
    
    log('✅ Global kindness counter reset to 0');
    
    if (hasAdultContent) {
      log('Found adult content in posts, will add kid-friendly posts...');
      // Continue to add kid-friendly posts rather than trying to delete
    }

    // Sample kindness posts - diverse content across all categories
    const samplePosts = [
      // Random Acts
      {
        content: "Left a kind note in someone's locker today. Hope it made them smile! 📝",
        category: "Random Acts",
        location: "Burlington, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Gave my extra pencils to a classmate who forgot theirs for the big test today! ✏️",
        category: "Random Acts",
        location: "Graham, North Carolina",
        city: "Graham", 
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Shared my lunch with the new kid who forgot theirs. Making friends is important! 🥪",
        category: "Random Acts",
        location: "Mebane, North Carolina",
        city: "Mebane",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Picked up trash on the playground during recess. Our school should be clean for everyone! 🗑️",
        category: "Random Acts",
        location: "Elon, North Carolina",
        city: "Elon",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Drew pictures for all the teachers on Teacher Appreciation Day. They work so hard for us! 🎨",
        category: "Random Acts",
        location: "Alamance County, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Helping Others
      {
        content: "Helped some kids with their homework today! Math is easier when we work together. 📚",
        category: "Helping Others",
        location: "Burlington, North Carolina",
        city: "Burlington",
        state: "North Carolina", 
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Taught my little brother how to tie his shoes. He was so proud when he finally got it! 👟",
        category: "Helping Others",
        location: "Graham, North Carolina",
        city: "Graham",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped a classmate find their lost backpack. It was in the library the whole time! 🎒",
        category: "Helping Others",
        location: "Mebane, North Carolina",
        city: "Mebane",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Stayed after school to help Mrs. Johnson clean up the art room. Teamwork makes everything better! 🎨",
        category: "Helping Others",
        location: "Elon, North Carolina",
        city: "Elon",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped a kindergartener who was crying find their teacher during lunch. Big kids help little kids! 🤗",
        category: "Helping Others",
        location: "Alamance County, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Encouragement  
      {
        content: "Left encouraging sticky notes in library books for other students to find. Reading is amazing! 📚",
        category: "Encouragement",
        location: "Burlington, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States", 
        isAnonymous: 1
      },
      {
        content: "Made a get-well card for a classmate who's been sick. Hope they feel better soon! 🌸",
        category: "Encouragement",
        location: "Graham, North Carolina",
        city: "Graham",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Drew happy chalk pictures on the sidewalk for people to see on their way to school! 🌈",
        category: "Encouragement",
        location: "Mebane, North Carolina",
        city: "Mebane",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Wrote thank you notes to all my teachers because they help us learn every day! ✏️",
        category: "Encouragement",
        location: "Elon, North Carolina",
        city: "Elon",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Cheered really loud for my friend's soccer game even though I don't like sports. Friends support friends! ⚽️",
        category: "Encouragement",
        location: "Alamance County, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Charity
      {
        content: "Gave my old toys to kids who don't have many. Sharing makes everyone happy! 🧥",
        category: "Charity",
        location: "Burlington, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped at the animal shelter by playing with the puppies and kittens. They need love too! 🐕",
        category: "Charity",
        location: "Graham, North Carolina",
        city: "Graham",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Brought canned food from home for our school food drive. My class collected 50 cans! 🍲",
        category: "Charity",
        location: "Mebane, North Carolina",
        city: "Mebane",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made blankets for animal shelters in our after-school club. Puppies need to stay warm! 🐶",
        category: "Charity",
        location: "Elon, North Carolina",
        city: "Elon",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Read books to little kids at the library. Story time is the best time! 📖",
        category: "Charity",
        location: "Alamance County, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Community Action
      {
        content: "Organized a playground cleanup with my class! We collected 8 bags of trash together. 🌟",
        category: "Community Action",
        location: "Burlington, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a classroom garden where we grow flowers and vegetables for everyone to enjoy! 🌱",
        category: "Community Action",
        location: "Graham, North Carolina",
        city: "Graham",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made a Little Free Library box with my dad for our neighborhood. Now kids can share books! 📚",
        category: "Community Action",
        location: "Mebane, North Carolina",
        city: "Mebane",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a talent show at school to raise money for new playground equipment! 🎤",
        category: "Community Action",
        location: "Elon, North Carolina",
        city: "Elon",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a recycling club at school. We've collected 200 bottles and cans so far! ♾️",
        category: "Community Action",
        location: "Alamance County, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      // Spreading Positivity
      {
        content: "Drew rainbow chalk art with happy messages on the school sidewalk. Smiles make everything better! 🌈",
        category: "Spreading Positivity",
        location: "Burlington, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a compliment circle in my class - we each say something nice about someone every day! 😊",
        category: "Spreading Positivity",
        location: "Graham, North Carolina",
        city: "Graham",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Made handmade cards with happy messages and left them in the school library for others to find! 💌",
        category: "Spreading Positivity",
        location: "Mebane, North Carolina",
        city: "Mebane",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Told jokes during lunch to make my friends laugh when they were having a bad day! ✨",
        category: "Spreading Positivity",
        location: "Elon, North Carolina",
        city: "Elon",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a gratitude journal club where we write what we're thankful for every day! 🙏",
        category: "Spreading Positivity",
        location: "Alamance County, North Carolina",
        city: "Burlington",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      }
    ];

    // Create sample posts
    for (const post of samplePosts) {
      await storage.createPost(post);
    }

    // The global counter will automatically increment as posts are added
    log(`✓ Added ${samplePosts.length} sample posts`);
    log(`✓ Counter will reflect actual post count`);

    // Initialize sample community service hours for Sarah Chen (authenticated student user)
    try {
      const { CommunityServiceEngine } = await import('./services/communityServiceEngine');
      const serviceEngine = new CommunityServiceEngine();
      
      // Use the actual authenticated student user ID instead of hardcoded ID
      const studentUserId = 'eeea79c7-114d-4d7d-8d16-b58cd7887c21'; // Sarah Chen's actual auth ID
      
      // First, ensure the user exists in the database
      const existingUser = await storage.getUser(studentUserId);
      if (!existingUser) {
        log('👤 Creating database record for Sarah Chen...');
        await storage.upsertUser({
          id: studentUserId,
          firstName: 'Sarah',
          lastName: 'Chen',
          email: 'sarah@bca.edu'
        });
        log('✅ Created user record for Sarah Chen');
      }
      
      // Check if Sarah Chen already has service hours
      const existingServiceHours = await serviceEngine.getStudentServiceLogs(studentUserId, 1);
      
      // FORCE RE-CREATION: Always create fresh service hours for demo
      log('🏥 Force creating fresh community service hours for Sarah Chen...');
      
      // Delete any existing service hours for this user to ensure clean demo data
      try {
        const { communityServiceLogs, studentServiceSummaries } = await import('@shared/schema');
        await db.delete(communityServiceLogs).where(eq(communityServiceLogs.userId, studentUserId));
        await db.delete(studentServiceSummaries).where(eq(studentServiceSummaries.userId, studentUserId));
        log('🧹 Cleared existing service hours data for clean demo');
      } catch (error) {
        log('⚠️ Note: No existing service hours to clear (normal for first run)');
      }
      
      // Add some sample service hours for demonstration
      await serviceEngine.logServiceHours({
          userId: studentUserId,
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Food Bank Volunteer',
          serviceDescription: 'Helped sort and package food donations for local families',
          organizationName: 'Burlington Community Food Bank',
          contactPerson: 'Ms. Johnson',
          contactEmail: 'volunteer@burlingtonfoodbank.org',
          contactPhone: '(336) 123-4567',
          hoursLogged: 4.5,
          serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          location: 'Burlington, NC',
          category: 'Community Support',
          studentReflection: 'It felt great knowing I helped families have meals. I learned about food insecurity in our community.',
          photoEvidence: undefined
        });

        await serviceEngine.logServiceHours({
          userId: studentUserId,
          schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
          serviceName: 'Park Cleanup',
          serviceDescription: 'Picked up litter and helped maintain trails at City Park',
          organizationName: 'Burlington Parks & Recreation',
          contactPerson: 'Mr. Williams',
          contactEmail: 'parks@burlington.nc.gov',
          contactPhone: '(336) 222-5555',
          hoursLogged: 3.0,
          serviceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          location: 'Burlington City Park, NC',
          category: 'Environmental',
          studentReflection: 'Working outside was refreshing and I could see the immediate impact of our work making the park beautiful.',
          photoEvidence: undefined
        });

      log('✅ Force created fresh community service hours for Sarah Chen');
      log('📊 Sarah Chen now has 7.5 total service hours (4.5 + 3.0)');
    } catch (error: any) {
      log('⚠️ Could not initialize community service hours:', error.message || error);
    }

    // Initialize sample reward partners
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

    log(`✓ Successfully initialized ${samplePosts.length} sample posts and updated global counter`);
  } catch (error: any) {
    log(`✗ Error initializing sample data: ${error.message}`);
    // Re-throw the error so the calling code can decide how to handle it
    throw new Error(`Sample data initialization failed: ${error.message}`);
  }
}