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
    
    // If we have posts AND a high counter, then we're fully initialized
    if (existingPosts.length > 0 && existingCounter.count > 1000) {
      log('Sample data already exists, skipping initialization');
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

    log(`✓ Successfully initialized ${samplePosts.length} sample posts and updated global counter`);
  } catch (error: any) {
    log(`✗ Error initializing sample data: ${error.message}`);
    // Re-throw the error so the calling code can decide how to handle it
    throw new Error(`Sample data initialization failed: ${error.message}`);
  }
}