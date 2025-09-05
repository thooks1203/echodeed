import { type KindnessPost, type InsertKindnessPost, type KindnessCounter, type UserTokens, type InsertUserTokens, type BrandChallenge, type InsertBrandChallenge, type ChallengeCompletion, type Achievement, type UserAchievement } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createKindnessPost(post: InsertKindnessPost, sessionId?: string): Promise<KindnessPost>;
  getKindnessPosts(filters?: { category?: string; city?: string; state?: string; country?: string }): Promise<KindnessPost[]>;
  getKindnessCounter(): Promise<KindnessCounter>;
  incrementKindnessCounter(): Promise<KindnessCounter>;
  addHeartToPost(postId: string, sessionId?: string): Promise<KindnessPost>;
  addEchoToPost(postId: string, sessionId?: string): Promise<KindnessPost>;
  getUserTokens(sessionId: string): Promise<UserTokens>;
  createOrUpdateUserTokens(sessionId: string): Promise<UserTokens>;
  awardTokens(sessionId: string, amount: number, reason: string): Promise<UserTokens>;
  getBrandChallenges(): Promise<BrandChallenge[]>;
  completeChallenge(challengeId: string, sessionId: string): Promise<{ challenge: BrandChallenge; tokens: UserTokens }>;
  getChallengeCompletions(sessionId: string): Promise<string[]>; // Returns array of completed challenge IDs
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(sessionId: string): Promise<UserAchievement[]>;
  checkAndUnlockAchievements(sessionId: string): Promise<UserAchievement[]>; // Returns newly unlocked achievements
}

export class MemStorage implements IStorage {
  private posts: Map<string, KindnessPost>;
  private counter: KindnessCounter;
  private userTokens: Map<string, UserTokens>;
  private brandChallenges: Map<string, BrandChallenge>;
  private challengeCompletions: Map<string, string[]>; // sessionId -> challengeIds
  private achievements: Map<string, Achievement>;
  private userAchievements: Map<string, UserAchievement[]>; // sessionId -> achievements

  constructor() {
    this.posts = new Map();
    this.userTokens = new Map();
    this.brandChallenges = new Map();
    this.challengeCompletions = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.counter = {
      id: "global",
      count: 247891, // Starting count from design
      updatedAt: new Date(),
    };

    // Add some initial posts and challenges for demonstration
    this.seedInitialPosts();
    this.seedBrandChallenges();
    this.seedAchievements();
  }

  private seedInitialPosts() {
    const initialPosts = [
      {
        content: "Helped an elderly woman carry her groceries up three flights of stairs today. Her smile made my whole week brighter. Sometimes the smallest gestures create the biggest ripples.",
        category: "Helping Others",
        location: "Downtown, San Francisco",
        city: "San Francisco",
        state: "California",
        country: "United States",
        heartsCount: Math.floor(Math.random() * 50) + 10,
        echoesCount: Math.floor(Math.random() * 25) + 5,
      },
      {
        content: "Left encouraging sticky notes on random cars in the parking lot. Simple words like 'You're amazing!' and 'Someone believes in you!' Hope it brightens someone's day.",
        category: "Spreading Positivity", 
        location: "Austin, Texas",
        city: "Austin",
        state: "Texas",
        country: "United States",
        heartsCount: Math.floor(Math.random() * 50) + 10,
        echoesCount: Math.floor(Math.random() * 25) + 5,
      },
      {
        content: "Organized a neighborhood cleanup this morning. 15 people showed up! We collected 8 bags of trash and planted 12 flowers. Our community looks so much better now.",
        category: "Community Action",
        location: "Portland, Oregon",
        city: "Portland",
        state: "Oregon", 
        country: "United States",
        heartsCount: Math.floor(Math.random() * 50) + 10,
        echoesCount: Math.floor(Math.random() * 25) + 5,
      },
    ];

    initialPosts.forEach(postData => {
      const id = randomUUID();
      const post: KindnessPost = {
        ...postData,
        id,
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
      };
      this.posts.set(id, post);
    });
  }

  async createKindnessPost(insertPost: InsertKindnessPost, sessionId?: string): Promise<KindnessPost> {
    const id = randomUUID();
    const post: KindnessPost = {
      ...insertPost,
      id,
      city: insertPost.city || null,
      state: insertPost.state || null,
      country: insertPost.country || null,
      createdAt: new Date(),
      heartsCount: 0,
      echoesCount: 0,
    };
    this.posts.set(id, post);
    
    // Award tokens for posting (5 $ECHO per post)
    if (sessionId) {
      await this.awardTokens(sessionId, 5, 'kindness_post');
    }
    
    return post;
  }

  async getKindnessPosts(filters?: { category?: string; city?: string; state?: string; country?: string }): Promise<KindnessPost[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters?.category) {
      posts = posts.filter(post => post.category === filters.category);
    }
    
    if (filters?.city) {
      posts = posts.filter(post => post.city === filters.city);
    }
    
    if (filters?.state) {
      posts = posts.filter(post => post.state === filters.state);
    }
    
    if (filters?.country) {
      posts = posts.filter(post => post.country === filters.country);
    }
    
    // Sort by creation date, newest first
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getKindnessCounter(): Promise<KindnessCounter> {
    return this.counter;
  }

  async incrementKindnessCounter(): Promise<KindnessCounter> {
    this.counter = {
      ...this.counter,
      count: this.counter.count + 1,
      updatedAt: new Date(),
    };
    return this.counter;
  }

  async addHeartToPost(postId: string, sessionId?: string): Promise<KindnessPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    const updatedPost = {
      ...post,
      heartsCount: post.heartsCount + 1,
    };
    
    this.posts.set(postId, updatedPost);
    
    // Award tokens for giving hearts (1 $ECHO per heart)
    if (sessionId) {
      await this.awardTokens(sessionId, 1, 'heart_given');
    }
    
    return updatedPost;
  }

  async addEchoToPost(postId: string, sessionId?: string): Promise<KindnessPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    const updatedPost = {
      ...post,
      echoesCount: post.echoesCount + 1,
    };
    
    this.posts.set(postId, updatedPost);
    
    // Award tokens for echoing (2 $ECHO per echo - commitment to duplicate)
    if (sessionId) {
      await this.awardTokens(sessionId, 2, 'echo_given');
    }
    
    return updatedPost;
  }

  async getUserTokens(sessionId: string): Promise<UserTokens> {
    const tokens = this.userTokens.get(sessionId);
    if (!tokens) {
      return await this.createOrUpdateUserTokens(sessionId);
    }
    return tokens;
  }

  async createOrUpdateUserTokens(sessionId: string): Promise<UserTokens> {
    const existing = this.userTokens.get(sessionId);
    if (existing) {
      // Update last active
      const updated = {
        ...existing,
        lastActive: new Date(),
      };
      this.userTokens.set(sessionId, updated);
      return updated;
    }

    // Create new user tokens
    const tokens: UserTokens = {
      id: randomUUID(),
      sessionId,
      echoBalance: 0,
      totalEarned: 0,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    this.userTokens.set(sessionId, tokens);
    return tokens;
  }

  async awardTokens(sessionId: string, amount: number, reason: string): Promise<UserTokens> {
    const tokens = await this.getUserTokens(sessionId);
    
    const updatedTokens = {
      ...tokens,
      echoBalance: tokens.echoBalance + amount,
      totalEarned: tokens.totalEarned + amount,
      lastActive: new Date(),
    };
    
    this.userTokens.set(sessionId, updatedTokens);
    console.log(`Awarded ${amount} $ECHO to ${sessionId} for ${reason}. New balance: ${updatedTokens.echoBalance}`);
    
    return updatedTokens;
  }

  private seedBrandChallenges() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    const challenges = [
      // Standard ongoing challenges
      {
        title: "Green Earth Challenge",
        content: "Pick up 5 pieces of litter in your neighborhood and post a photo. Every piece makes a difference! Help us create cleaner communities together.",
        brandName: "EcoClean Solutions",
        brandLogo: "🌱",
        category: "Community Action",
        challengeType: "standard",
        difficulty: "beginner",
        echoReward: 15,
        isActive: 1,
        isPriority: 0,
        completionCount: 47,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Coffee & Kindness",
        content: "Buy coffee for the person behind you in line, or leave an encouraging note for the barista. Small gestures create big smiles!",
        brandName: "Brew Brothers Coffee",
        brandLogo: "☕",
        category: "Spreading Positivity",
        challengeType: "standard",
        difficulty: "beginner",
        echoReward: 12,
        isActive: 1,
        completionCount: 89,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      
      // Seasonal challenges based on current date
      ...(currentMonth === 11 ? [ // December - Holiday season
        {
          title: "Holiday Lights Kindness Tour",
          content: "Take an elderly neighbor or family with young kids to see holiday lights in your neighborhood. Share the joy of the season and create magical memories together!",
          brandName: "FamilyFirst Insurance",
          brandLogo: "🎄",
          category: "Spreading Positivity",
          challengeType: "seasonal",
          seasonalTheme: "holiday",
          difficulty: "intermediate",
          echoReward: 25,
          bonusReward: 10, // Extra holiday bonus
          isActive: 1,
          isPriority: 1,
          completionCount: 12,
          expiresAt: new Date(currentDate.getFullYear(), 11, 31), // End of December
        },
        {
          title: "Warm Hearts Winter Challenge",
          content: "Donate warm clothing, blankets, or hot meals to local shelters. Help someone stay warm this winter season. Every act of warmth matters!",
          brandName: "CozyCare Apparel",
          brandLogo: "🧥",
          category: "Helping Others",
          challengeType: "seasonal",
          seasonalTheme: "winter",
          difficulty: "intermediate",
          echoReward: 30,
          bonusReward: 15,
          isActive: 1,
          isPriority: 1,
          completionCount: 8,
          expiresAt: new Date(currentDate.getFullYear() + 1, 1, 28), // End of February
        }
      ] : []),
      
      ...(currentMonth >= 2 && currentMonth <= 4 ? [ // March-May - Spring
        {
          title: "Spring Community Garden",
          content: "Help plant flowers, vegetables, or trees in a community garden or public space. Let's make our neighborhoods bloom with kindness this spring!",
          brandName: "GrowGreen Gardens",
          brandLogo: "🌸",
          category: "Community Action",
          challengeType: "seasonal", 
          seasonalTheme: "spring",
          difficulty: "intermediate",
          echoReward: 20,
          bonusReward: 8,
          isActive: 1,
          isPriority: 1,
          completionCount: 23,
          expiresAt: new Date(currentDate.getFullYear(), 4, 31), // End of May
        }
      ] : []),
      
      // Advanced/Team challenges
      {
        title: "Monthly Community Impact Challenge",
        content: "Organize or participate in a community cleanup, food drive, or charity event. Leadership in kindness deserves extra recognition! Document your impact.",
        brandName: "Leadership Foundation",
        brandLogo: "🏆",
        category: "Community Action",
        challengeType: "recurring",
        recurringPeriod: "monthly",
        difficulty: "advanced",
        minParticipants: 3,
        maxParticipants: 20,
        echoReward: 50,
        bonusReward: 25, // Team bonus
        isActive: 1,
        isPriority: 1,
        completionCount: 5,
        expiresAt: new Date(currentDate.getFullYear(), currentMonth + 1, 0), // End of current month
      },
      
      // Location-based challenge
      {
        title: "Local Hero Spotlight",
        content: "Nominate a local community hero (teacher, volunteer, first responder) for recognition. Write a heartfelt note about their impact. Let's celebrate unsung heroes!",
        brandName: "Hometown Pride Media",
        brandLogo: "🏡",
        category: "Spreading Positivity",
        challengeType: "location",
        targetLocation: "Local Community",
        difficulty: "beginner",
        echoReward: 18,
        isActive: 1,
        completionCount: 34,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      
      // Weekly recurring challenge
      {
        title: "Weekly Wellness Wednesday",
        content: "Check in on someone who might be struggling - a friend, neighbor, or coworker. Send a thoughtful message or make a caring call. Mental health kindness counts!",
        brandName: "MindWell Wellness",
        brandLogo: "💚",
        category: "Spreading Positivity",
        challengeType: "recurring",
        recurringPeriod: "weekly",
        difficulty: "beginner",
        echoReward: 15,
        bonusReward: 5, // Weekly consistency bonus
        isActive: 1,
        completionCount: 156,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      },
      
      // High-value annual challenge
      {
        title: "Helping Hands Initiative",
        content: "Volunteer 2 hours at a local food bank, shelter, or community center. Share how it made you feel and inspire others to give their time too.",
        brandName: "Community First Bank",
        brandLogo: "🏦", 
        category: "Helping Others",
        challengeType: "standard",
        difficulty: "intermediate",
        echoReward: 35,
        isActive: 1,
        completionCount: 67,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      }
    ];

    challenges.forEach(challengeData => {
      const id = randomUUID();
      const challenge: BrandChallenge = {
        ...challengeData,
        id,
        challengeType: challengeData.challengeType || "standard",
        difficulty: challengeData.difficulty || "beginner",
        seasonalTheme: challengeData.seasonalTheme || null,
        targetLocation: challengeData.targetLocation || null,
        recurringPeriod: challengeData.recurringPeriod || null,
        minParticipants: challengeData.minParticipants || 1,
        maxParticipants: challengeData.maxParticipants || 1,
        bonusReward: challengeData.bonusReward || 0,
        isPriority: challengeData.isPriority || 0,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
      };
      this.brandChallenges.set(id, challenge);
    });
  }

  async getBrandChallenges(): Promise<BrandChallenge[]> {
    const challenges = Array.from(this.brandChallenges.values());
    
    // Only return active challenges that haven't expired
    const activeChallenges = challenges.filter(challenge => 
      challenge.isActive === 1 && 
      (!challenge.expiresAt || challenge.expiresAt > new Date())
    );
    
    // Sort by creation date, newest first
    return activeChallenges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async completeChallenge(challengeId: string, sessionId: string): Promise<{ challenge: BrandChallenge; tokens: UserTokens }> {
    const challenge = this.brandChallenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if user already completed this challenge
    const userCompletions = this.challengeCompletions.get(sessionId) || [];
    if (userCompletions.includes(challengeId)) {
      throw new Error('Challenge already completed');
    }

    // Mark challenge as completed for this user
    userCompletions.push(challengeId);
    this.challengeCompletions.set(sessionId, userCompletions);

    // Increment challenge completion count
    const updatedChallenge = {
      ...challenge,
      completionCount: challenge.completionCount + 1,
    };
    this.brandChallenges.set(challengeId, updatedChallenge);

    // Award tokens
    const tokens = await this.awardTokens(sessionId, challenge.echoReward, `Completed ${challenge.brandName} challenge`);

    return { challenge: updatedChallenge, tokens };
  }

  async getChallengeCompletions(sessionId: string): Promise<string[]> {
    return this.challengeCompletions.get(sessionId) || [];
  }

  private seedAchievements() {
    const achievementData = [
      // Kindness Milestones - Bronze Tier
      {
        title: "First Step",
        description: "Share your very first act of kindness",
        badge: "🌱",
        category: "kindness",
        tier: "bronze",
        requirement: JSON.stringify({ type: "posts_created", value: 1 }),
        echoReward: 10,
        sortOrder: 1
      },
      {
        title: "Kindness Streak",
        description: "Share 5 acts of kindness",
        badge: "🔥",
        category: "kindness",
        tier: "bronze",
        requirement: JSON.stringify({ type: "posts_created", value: 5 }),
        echoReward: 25,
        sortOrder: 2
      },
      
      // Kindness Milestones - Silver Tier
      {
        title: "Compassion Champion",
        description: "Share 25 acts of kindness",
        badge: "💎",
        category: "kindness",
        tier: "silver",
        requirement: JSON.stringify({ type: "posts_created", value: 25 }),
        echoReward: 100,
        sortOrder: 3
      },
      {
        title: "Kindness Ambassador",
        description: "Share 100 acts of kindness",
        badge: "👑",
        category: "kindness",
        tier: "gold",
        requirement: JSON.stringify({ type: "posts_created", value: 100 }),
        echoReward: 500,
        sortOrder: 4
      },
      
      // Social Engagement - Bronze Tier
      {
        title: "Heart Giver",
        description: "Give your first heart to someone's kindness",
        badge: "❤️",
        category: "social",
        tier: "bronze",
        requirement: JSON.stringify({ type: "hearts_given", value: 1 }),
        echoReward: 5,
        sortOrder: 10
      },
      {
        title: "Echo Supporter",
        description: "Echo someone's kindness for the first time",
        badge: "📢",
        category: "social", 
        tier: "bronze",
        requirement: JSON.stringify({ type: "echoes_given", value: 1 }),
        echoReward: 10,
        sortOrder: 11
      },
      {
        title: "Community Builder",
        description: "Give 50 hearts to others' kindness posts",
        badge: "🤝",
        category: "social",
        tier: "silver",
        requirement: JSON.stringify({ type: "hearts_given", value: 50 }),
        echoReward: 75,
        sortOrder: 12
      },
      
      // Challenge Achievements - Bronze to Diamond
      {
        title: "Challenge Starter",
        description: "Complete your first brand challenge",
        badge: "🎯",
        category: "challenges",
        tier: "bronze",
        requirement: JSON.stringify({ type: "challenges_completed", value: 1 }),
        echoReward: 15,
        sortOrder: 20
      },
      {
        title: "Challenge Enthusiast",
        description: "Complete 10 brand challenges",
        badge: "🏆",
        category: "challenges",
        tier: "silver",
        requirement: JSON.stringify({ type: "challenges_completed", value: 10 }),
        echoReward: 100,
        sortOrder: 21
      },
      {
        title: "Challenge Master",
        description: "Complete 25 brand challenges", 
        badge: "🥇",
        category: "challenges",
        tier: "gold",
        requirement: JSON.stringify({ type: "challenges_completed", value: 25 }),
        echoReward: 300,
        sortOrder: 22
      },
      {
        title: "Challenge Legend",
        description: "Complete 50 brand challenges",
        badge: "💫",
        category: "challenges",
        tier: "diamond",
        requirement: JSON.stringify({ type: "challenges_completed", value: 50 }),
        echoReward: 1000,
        sortOrder: 23
      },
      
      // Token Milestones - Silver to Legendary
      {
        title: "Echo Earner",
        description: "Earn your first 100 $ECHO tokens",
        badge: "🪙",
        category: "milestones",
        tier: "bronze", 
        requirement: JSON.stringify({ type: "tokens_earned", value: 100 }),
        echoReward: 25,
        sortOrder: 30
      },
      {
        title: "Token Collector",
        description: "Earn 1,000 $ECHO tokens",
        badge: "💰",
        category: "milestones",
        tier: "silver",
        requirement: JSON.stringify({ type: "tokens_earned", value: 1000 }),
        echoReward: 200,
        sortOrder: 31
      },
      {
        title: "Echo Tycoon",
        description: "Earn 10,000 $ECHO tokens",
        badge: "💎",
        category: "milestones",
        tier: "gold",
        requirement: JSON.stringify({ type: "tokens_earned", value: 10000 }),
        echoReward: 1500,
        sortOrder: 32
      },
      {
        title: "Kindness Millionaire",
        description: "Earn 50,000 $ECHO tokens",
        badge: "👑",
        category: "milestones",
        tier: "legendary",
        requirement: JSON.stringify({ type: "tokens_earned", value: 50000 }),
        echoReward: 10000,
        sortOrder: 33
      },
      
      // Special Achievements
      {
        title: "Early Adopter",
        description: "One of the first 1000 users on EchoDeed™",
        badge: "🚀",
        category: "special",
        tier: "gold",
        requirement: JSON.stringify({ type: "early_user", value: 1 }),
        echoReward: 500,
        sortOrder: 50
      },
      {
        title: "Community Pillar",
        description: "Active for 30 consecutive days",
        badge: "🏛️",
        category: "special",
        tier: "diamond",
        requirement: JSON.stringify({ type: "consecutive_days", value: 30 }),
        echoReward: 2000,
        sortOrder: 51
      }
    ];

    achievementData.forEach(data => {
      const id = randomUUID();
      const achievement: Achievement = {
        ...data,
        id,
        requirement: data.requirement,
        isActive: 1,
        createdAt: new Date()
      };
      this.achievements.set(id, achievement);
    });
  }

  async getAchievements(): Promise<Achievement[]> {
    const achievements = Array.from(this.achievements.values());
    return achievements
      .filter(a => a.isActive === 1)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getUserAchievements(sessionId: string): Promise<UserAchievement[]> {
    return this.userAchievements.get(sessionId) || [];
  }

  async checkAndUnlockAchievements(sessionId: string): Promise<UserAchievement[]> {
    const userTokens = await this.getUserTokens(sessionId);
    const userAchievements = await this.getUserAchievements(sessionId);
    const allAchievements = await this.getAchievements();
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const newlyUnlocked: UserAchievement[] = [];

    // Count user's activities
    const posts = Array.from(this.posts.values());
    const userPosts = posts.filter(p => p.createdAt > userTokens.createdAt); // Approximate user posts
    const challengeCompletions = await this.getChallengeCompletions(sessionId);
    
    // Rough estimates for hearts/echoes given (would be tracked properly in production)
    const heartsGiven = Math.floor(userTokens.totalEarned / 10); // Estimate based on token activity
    const echoesGiven = Math.floor(userTokens.totalEarned / 15); // Estimate based on token activity

    for (const achievement of allAchievements) {
      if (unlockedAchievementIds.has(achievement.id)) continue;

      const requirement = JSON.parse(achievement.requirement);
      let shouldUnlock = false;

      switch (requirement.type) {
        case 'posts_created':
          shouldUnlock = userPosts.length >= requirement.value;
          break;
        case 'challenges_completed':
          shouldUnlock = challengeCompletions.length >= requirement.value;
          break;
        case 'tokens_earned':
          shouldUnlock = userTokens.totalEarned >= requirement.value;
          break;
        case 'hearts_given':
          shouldUnlock = heartsGiven >= requirement.value;
          break;
        case 'echoes_given':
          shouldUnlock = echoesGiven >= requirement.value;
          break;
        case 'early_user':
          // Check if user is in first 1000 (simplified logic)
          shouldUnlock = this.userTokens.size <= 1000;
          break;
        case 'consecutive_days':
          // Simplified check - would need proper day tracking in production
          const daysSinceJoined = Math.floor((Date.now() - userTokens.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          shouldUnlock = daysSinceJoined >= requirement.value && userTokens.totalEarned > 100; // Active user approximation
          break;
      }

      if (shouldUnlock) {
        const userAchievement: UserAchievement = {
          id: randomUUID(),
          sessionId,
          achievementId: achievement.id,
          unlockedAt: new Date(),
          progress: requirement.value
        };
        
        newlyUnlocked.push(userAchievement);
        
        // Update user achievements
        const existing = this.userAchievements.get(sessionId) || [];
        existing.push(userAchievement);
        this.userAchievements.set(sessionId, existing);
        
        // Award bonus tokens for unlocking achievement
        await this.awardTokens(sessionId, achievement.echoReward, `Achievement unlocked: ${achievement.title}`);
      }
    }

    return newlyUnlocked;
  }
}

export const storage = new MemStorage();
