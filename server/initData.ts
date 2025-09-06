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
    
    // If we have posts AND a high counter AND the right categories, then we're fully initialized
    const hasNewCategories = existingPosts.some(p => p.category === 'Community Action' || p.category === 'Spreading Positivity');
    if (existingPosts.length > 0 && existingCounter.count > 1000 && hasNewCategories) {
      log('Sample data already exists with new categories, skipping initialization');
      return;
    }
    
    // If we have some posts but low counter, we need to fix the counter
    if (existingPosts.length > 0 && existingCounter.count < 243876) {
      log(`Found ${existingPosts.length} posts but counter only at ${existingCounter.count}, updating counter...`);
      await storage.incrementCounter(243876 - existingCounter.count);
      log(`✓ Updated counter to 243,876 for existing deployment`);
      return;
    }

    // Sample kindness posts - diverse content across all categories
    const samplePosts = [
      // Random Acts
      {
        content: "Bought coffee for the person behind me in line at the local café. Their smile made my whole day! ☕️",
        category: "Random Acts",
        location: "San Francisco, California",
        city: "San Francisco",
        state: "California",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Paid for a stranger's parking meter when I saw it was about to expire. Small gesture, big relief for them! 🅿️",
        category: "Random Acts",
        location: "Chicago, Illinois",
        city: "Chicago", 
        state: "Illinois",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Left a $20 tip for the barista who looked like they were having a rough morning. Hope it brightened their day! ☀️",
        category: "Random Acts",
        location: "Los Angeles, California",
        city: "Los Angeles",
        state: "California",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Gave my umbrella to someone running in the rain. Got soaked but seeing them stay dry was worth it! 🌧️",
        category: "Random Acts",
        location: "Portland, Oregon",
        city: "Portland",
        state: "Oregon",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Anonymously paid for a family's dinner at a restaurant after overhearing they were celebrating a birthday on a tight budget! 🎂",
        category: "Random Acts",
        location: "Dallas, Texas",
        city: "Dallas",
        state: "Texas",
        country: "United States",
        isAnonymous: 1
      },
      // Helping Others
      {
        content: "Helped an elderly neighbor carry groceries up three flights of stairs. Small acts, big impact! 🛍️",
        category: "Helping Others",
        location: "New York, NY",
        city: "New York",
        state: "New York", 
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Spent 2 hours teaching my neighbor's kid how to ride a bike. The joy on their face when they finally got it! 🚲",
        category: "Helping Others",
        location: "Phoenix, Arizona",
        city: "Phoenix",
        state: "Arizona",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped a lost tourist find their hotel and even walked them there. Sometimes we all need a helping hand! 🗺️",
        category: "Helping Others",
        location: "Miami, Florida",
        city: "Miami",
        state: "Florida",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Assisted a mom with a stroller up the subway stairs during rush hour. Teamwork makes the dream work! 🚇",
        category: "Helping Others",
        location: "Boston, Massachusetts",
        city: "Boston",
        state: "Massachusetts",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Helped my coworker finish their project when they were overwhelmed. We're all in this together! 💼",
        category: "Helping Others",
        location: "Atlanta, Georgia",
        city: "Atlanta",
        state: "Georgia",
        country: "United States",
        isAnonymous: 1
      },
      // Encouragement  
      {
        content: "Left encouraging sticky notes in library books for future readers to find. Spreading positivity one page at a time! 📚",
        category: "Encouragement",
        location: "Austin, Texas",
        city: "Austin",
        state: "Texas",
        country: "United States", 
        isAnonymous: 1
      },
      {
        content: "Sent anonymous flowers to a colleague who's been working extra hard lately. Everyone deserves recognition! 🌸",
        category: "Encouragement",
        location: "Denver, Colorado",
        city: "Denver",
        state: "Colorado",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Left positive chalk messages on sidewalks throughout my neighborhood. Spreading smiles one step at a time! 🌈",
        category: "Encouragement",
        location: "Nashville, Tennessee",
        city: "Nashville",
        state: "Tennessee",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Wrote heartfelt thank you letters to teachers at my local school. They shape our future every day! ✏️",
        category: "Encouragement",
        location: "Sacramento, California",
        city: "Sacramento",
        state: "California",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Created care packages with encouraging notes for hospital staff. Heroes deserve to feel appreciated! 🏥",
        category: "Encouragement",
        location: "Houston, Texas",
        city: "Houston",
        state: "Texas",
        country: "United States",
        isAnonymous: 1
      },
      // Charity
      {
        content: "Donated my old winter coats to a homeless shelter. Hope they keep someone warm this season! 🧥",
        category: "Charity",
        location: "Seattle, Washington",
        city: "Seattle",
        state: "Washington",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Spent my lunch break volunteering at the local animal shelter. Those puppies deserve all the love! 🐕",
        category: "Charity",
        location: "San Diego, California",
        city: "San Diego",
        state: "California",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a neighborhood food drive and collected 200+ items for the local food bank! 🍲",
        category: "Charity",
        location: "Minneapolis, Minnesota",
        city: "Minneapolis",
        state: "Minnesota",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Donated blood and encouraged 5 friends to do the same. Every donation can save up to 3 lives! 🩸",
        category: "Charity",
        location: "Charlotte, North Carolina",
        city: "Charlotte",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Volunteered to read to kids at the children's hospital. Their smiles heal more than any medicine! 📖",
        category: "Charity",
        location: "Salt Lake City, Utah",
        city: "Salt Lake City",
        state: "Utah",
        country: "United States",
        isAnonymous: 1
      },
      // Community Action
      {
        content: "Organized a neighborhood cleanup day and 30 volunteers showed up! Together we collected 15 bags of trash. 🌟",
        category: "Community Action",
        location: "Portland, Oregon",
        city: "Portland",
        state: "Oregon",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a community garden in an empty lot. Now families have fresh vegetables and a place to connect! 🌱",
        category: "Community Action",
        location: "Detroit, Michigan",
        city: "Detroit",
        state: "Michigan",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Coordinated a tool lending library for neighbors. Why buy when you can share and build community? 🔨",
        category: "Community Action",
        location: "Burlington, Vermont",
        city: "Burlington",
        state: "Vermont",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized free community skill-sharing workshops. Teaching photography, cooking, and guitar lessons! 📸",
        category: "Community Action",
        location: "Asheville, North Carolina",
        city: "Asheville",
        state: "North Carolina",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a neighborhood book exchange in old phone booth. Now everyone has access to free books! 📚",
        category: "Community Action",
        location: "Madison, Wisconsin",
        city: "Madison",
        state: "Wisconsin",
        country: "United States",
        isAnonymous: 1
      },
      // Spreading Positivity
      {
        content: "Left rainbow chalk art with inspiring quotes on sidewalks throughout my town. Color makes everything better! 🌈",
        category: "Spreading Positivity",
        location: "Santa Fe, New Mexico",
        city: "Santa Fe",
        state: "New Mexico",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a compliment chain at work - each person has to genuinely compliment someone new daily! 😊",
        category: "Spreading Positivity",
        location: "Richmond, Virginia",
        city: "Richmond",
        state: "Virginia",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Created handmade gratitude cards and left them randomly in coffee shops, libraries, and bus stops! 💌",
        category: "Spreading Positivity",
        location: "Eugene, Oregon",
        city: "Eugene",
        state: "Oregon",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Started a social media campaign sharing one positive local business story daily. Spreading good vibes! ✨",
        category: "Spreading Positivity",
        location: "Savannah, Georgia",
        city: "Savannah",
        state: "Georgia",
        country: "United States",
        isAnonymous: 1
      },
      {
        content: "Organized a community gratitude circle in the park. 20 strangers sharing what they're thankful for! 🙏",
        category: "Spreading Positivity",
        location: "Boulder, Colorado",
        city: "Boulder",
        state: "Colorado",
        country: "United States",
        isAnonymous: 1
      }
    ];

    // Create sample posts
    for (const post of samplePosts) {
      await storage.createPost(post);
    }

    // Set the global counter to a high number to show platform popularity
    // For fresh deployments, set to our target high number
    await storage.incrementCounter(243876);
    log(`✓ Set global counter to 243,876 for fresh deployment`);
    log(`✓ Added ${samplePosts.length} sample posts`);

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
      log('Reward partners already exist, skipping initialization');
    }

    log(`✓ Successfully initialized ${samplePosts.length} sample posts and updated global counter`);
  } catch (error: any) {
    log(`✗ Error initializing sample data: ${error.message}`);
    // Re-throw the error so the calling code can decide how to handle it
    throw new Error(`Sample data initialization failed: ${error.message}`);
  }
}