import { storage } from './storage';
import { log } from './vite';

export async function initializeSampleData() {
  try {
    log('Initializing sample data...');
    
    // Check if we already have posts (to avoid duplicate initialization)
    const existingPosts = await storage.getPosts();
    if (existingPosts.length > 0) {
      log('Sample data already exists, skipping initialization');
      return;
    }

    // Sample kindness posts
    const samplePosts = [
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
        content: "Helped an elderly neighbor carry groceries up three flights of stairs. Small acts, big impact! 🛍️",
        category: "Helping Others",
        location: "New York, NY",
        city: "New York",
        state: "New York", 
        country: "United States",
        isAnonymous: 1
      },
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
        category: "Volunteering",
        location: "Denver, Colorado",
        city: "Denver",
        state: "Colorado", 
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
        content: "Wrote thank you cards to all the essential workers in my building. They work so hard every day! 💌",
        category: "Appreciation",
        location: "Miami, Florida",
        city: "Miami",
        state: "Florida",
        country: "United States", 
        isAnonymous: 1
      },
      {
        content: "Organized a neighborhood cleanup and got 15 people to join! Together we collected 8 bags of trash. 🌱",
        category: "Environment",
        location: "Portland, Oregon",
        city: "Portland",
        state: "Oregon",
        country: "United States",
        isAnonymous: 1
      }
    ];

    // Create sample posts
    for (const post of samplePosts) {
      await storage.createPost(post);
    }

    // Update global counter to reflect the sample posts
    await storage.incrementCounter(samplePosts.length);

    log(`Successfully initialized ${samplePosts.length} sample posts and updated global counter`);
  } catch (error) {
    log(`Error initializing sample data: ${error}`);
  }
}