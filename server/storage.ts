import { type KindnessPost, type InsertKindnessPost, type KindnessCounter, type UserTokens, type InsertUserTokens, type BrandChallenge, type InsertBrandChallenge, type ChallengeCompletion, type Achievement, type UserAchievement, type CorporateAccount, type InsertCorporateAccount, type CorporateTeam, type InsertCorporateTeam, type CorporateEmployee, type InsertCorporateEmployee, type CorporateChallenge, type InsertCorporateChallenge, type CorporateAnalytics } from "@shared/schema";
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
  
  // AI Analytics Methods  
  updatePostWithAIAnalysis(postId: string, analysis: any): Promise<KindnessPost>;
  getPostsWithAIAnalysis(): Promise<KindnessPost[]>;
  getCommunityWellnessInsights(): Promise<any>;

  // B2B SaaS Corporate Methods
  createCorporateAccount(account: InsertCorporateAccount): Promise<CorporateAccount>;
  getCorporateAccount(accountId: string): Promise<CorporateAccount | null>;
  getCorporateAccountByDomain(domain: string): Promise<CorporateAccount | null>;
  updateCorporateAccount(accountId: string, updates: Partial<CorporateAccount>): Promise<CorporateAccount>;
  getCorporateAccounts(): Promise<CorporateAccount[]>;
  
  createCorporateTeam(team: InsertCorporateTeam): Promise<CorporateTeam>;
  getCorporateTeams(corporateAccountId: string): Promise<CorporateTeam[]>;
  updateCorporateTeam(teamId: string, updates: Partial<CorporateTeam>): Promise<CorporateTeam>;
  deleteCorporateTeam(teamId: string): Promise<boolean>;
  
  enrollCorporateEmployee(employee: InsertCorporateEmployee): Promise<CorporateEmployee>;
  getCorporateEmployees(corporateAccountId: string): Promise<CorporateEmployee[]>;
  getCorporateEmployee(sessionId: string): Promise<CorporateEmployee | null>;
  updateCorporateEmployee(employeeId: string, updates: Partial<CorporateEmployee>): Promise<CorporateEmployee>;
  
  createCorporateChallenge(challenge: InsertCorporateChallenge): Promise<CorporateChallenge>;
  getCorporateChallenges(corporateAccountId: string): Promise<CorporateChallenge[]>;
  completeCorporateChallenge(challengeId: string, sessionId: string): Promise<{ challenge: CorporateChallenge; tokens: UserTokens }>;
  
  recordCorporateAnalytics(analytics: CorporateAnalytics): Promise<void>;
  getCorporateAnalytics(corporateAccountId: string, days?: number): Promise<CorporateAnalytics[]>;
  generateDailyCorporateAnalytics(corporateAccountId: string): Promise<CorporateAnalytics>;
}

export class MemStorage implements IStorage {
  private posts: Map<string, KindnessPost>;
  private counter: KindnessCounter;
  private userTokens: Map<string, UserTokens>;
  private brandChallenges: Map<string, BrandChallenge>;
  private challengeCompletions: Map<string, string[]>; // sessionId -> challengeIds
  private achievements: Map<string, Achievement>;
  private userAchievements: Map<string, UserAchievement[]>; // sessionId -> achievements
  
  // B2B SaaS Data Stores
  private corporateAccounts: Map<string, CorporateAccount>;
  private corporateTeams: Map<string, CorporateTeam>;
  private corporateEmployees: Map<string, CorporateEmployee>;
  private corporateChallenges: Map<string, CorporateChallenge>;
  private corporateAnalytics: Map<string, CorporateAnalytics[]>; // corporateAccountId -> analytics

  constructor() {
    this.posts = new Map();
    this.userTokens = new Map();
    this.brandChallenges = new Map();
    this.challengeCompletions = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    
    // Initialize B2B SaaS data stores
    this.corporateAccounts = new Map();
    this.corporateTeams = new Map();
    this.corporateEmployees = new Map();
    this.corporateChallenges = new Map();
    this.corporateAnalytics = new Map();
    this.counter = {
      id: "global",
      count: 247891, // Starting count from design
      updatedAt: new Date(),
    };

    // Add some initial posts and challenges for demonstration
    this.seedInitialPosts();
    this.seedBrandChallenges();
    this.seedAchievements();
    this.seedCorporateAccounts();
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
      // Initialize AI fields as null - will be populated by background analysis
      sentimentScore: null,
      impactScore: null,
      emotionalUplift: null,
      kindnessCategory: null,
      rippleEffect: null,
      wellnessContribution: null,
      aiConfidence: null,
      aiTags: null,
      analyzedAt: null,
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

  // B2B SaaS Corporate Account Methods
  private seedCorporateAccounts() {
    const corporateAccountsData = [
      {
        companyName: "TechFlow Solutions",
        companyLogo: "https://placeholder.com/100x100",
        domain: "techflow.com",
        industry: "Technology",
        companySize: "medium",
        subscriptionTier: "pro",
        maxEmployees: 200,
        monthlyBudget: 5000,
        primaryColor: "#6366F1",
        contactEmail: "hr@techflow.com",
        contactName: "Sarah Chen",
        isActive: 1,
        billingStatus: "active",
        trialEndsAt: null
      },
      {
        companyName: "Wellness Corp",
        companyLogo: "https://placeholder.com/100x100",
        domain: "wellnesscorp.com",
        industry: "Healthcare",
        companySize: "large",
        subscriptionTier: "enterprise",
        maxEmployees: 500,
        monthlyBudget: 15000,
        primaryColor: "#10B981",
        contactEmail: "admin@wellnesscorp.com",
        contactName: "Mike Rodriguez",
        isActive: 1,
        billingStatus: "active",
        trialEndsAt: null
      }
    ];

    corporateAccountsData.forEach(data => {
      const id = randomUUID();
      const account: CorporateAccount = {
        id,
        companyName: data.companyName,
        companyLogo: data.companyLogo || null,
        domain: data.domain,
        industry: data.industry || null,
        companySize: data.companySize || null,
        subscriptionTier: data.subscriptionTier,
        maxEmployees: data.maxEmployees,
        monthlyBudget: data.monthlyBudget,
        primaryColor: data.primaryColor,
        contactEmail: data.contactEmail,
        contactName: data.contactName || null,
        isActive: 1,
        billingStatus: data.billingStatus,
        trialEndsAt: data.trialEndsAt || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.corporateAccounts.set(id, account);
      
      // Add sample teams for each corporate account
      const teamData = [
        { teamName: "Engineering", department: "Engineering", teamLead: "John Smith", targetSize: 25 },
        { teamName: "Marketing", department: "Marketing", teamLead: "Lisa Wong", targetSize: 15 },
        { teamName: "HR & People", department: "HR", teamLead: "David Kim", targetSize: 8 }
      ];
      
      teamData.forEach(team => {
        const teamId = randomUUID();
        const corporateTeam: CorporateTeam = {
          id: teamId,
          corporateAccountId: id,
          teamName: team.teamName,
          department: team.department || null,
          teamLead: team.teamLead || null,
          teamLeadEmail: `${team.teamLead.toLowerCase().replace(' ', '.')}@${data.domain}`,
          targetSize: team.targetSize || null,
          currentSize: Math.floor(team.targetSize * 0.7), // 70% filled
          monthlyKindnessGoal: team.targetSize * 3, // 3 acts per person per month
          isActive: 1,
          createdAt: new Date()
        };
        this.corporateTeams.set(teamId, corporateTeam);
      });
    });
  }

  async createCorporateAccount(account: InsertCorporateAccount): Promise<CorporateAccount> {
    const id = randomUUID();
    const corporateAccount: CorporateAccount = {
      ...account,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.corporateAccounts.set(id, corporateAccount);
    return corporateAccount;
  }

  async getCorporateAccount(accountId: string): Promise<CorporateAccount | null> {
    return this.corporateAccounts.get(accountId) || null;
  }

  async getCorporateAccountByDomain(domain: string): Promise<CorporateAccount | null> {
    for (const account of Array.from(this.corporateAccounts.values())) {
      if (account.domain === domain) {
        return account;
      }
    }
    return null;
  }

  // Public method to initialize sample corporate data for demo
  async initializeSampleCorporateData(): Promise<void> {
    // Check if sample data already exists
    const existingAccount = await this.getCorporateAccountByDomain('techflow.com');
    if (existingAccount) {
      return; // Sample data already exists
    }

    // Re-seed corporate accounts with fixed demo data
    this.seedCorporateAccounts();
  }

  async updateCorporateAccount(accountId: string, updates: Partial<CorporateAccount>): Promise<CorporateAccount> {
    const existing = this.corporateAccounts.get(accountId);
    if (!existing) throw new Error('Corporate account not found');
    
    const updated: CorporateAccount = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.corporateAccounts.set(accountId, updated);
    return updated;
  }

  async getCorporateAccounts(): Promise<CorporateAccount[]> {
    return Array.from(this.corporateAccounts.values())
      .filter(account => account.isActive === 1)
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }

  async createCorporateTeam(team: InsertCorporateTeam): Promise<CorporateTeam> {
    const id = randomUUID();
    const corporateTeam: CorporateTeam = {
      ...team,
      id,
      isActive: 1,
      createdAt: new Date(),
    };
    this.corporateTeams.set(id, corporateTeam);
    return corporateTeam;
  }

  async getCorporateTeams(corporateAccountId: string): Promise<CorporateTeam[]> {
    return Array.from(this.corporateTeams.values())
      .filter(team => team.corporateAccountId === corporateAccountId && team.isActive === 1)
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  }

  async updateCorporateTeam(teamId: string, updates: Partial<CorporateTeam>): Promise<CorporateTeam> {
    const existing = this.corporateTeams.get(teamId);
    if (!existing) throw new Error('Corporate team not found');
    
    const updated: CorporateTeam = {
      ...existing,
      ...updates,
    };
    this.corporateTeams.set(teamId, updated);
    return updated;
  }

  async deleteCorporateTeam(teamId: string): Promise<boolean> {
    return this.corporateTeams.delete(teamId);
  }

  async enrollCorporateEmployee(employee: InsertCorporateEmployee): Promise<CorporateEmployee> {
    const id = randomUUID();
    const corporateEmployee: CorporateEmployee = {
      id,
      sessionId: employee.sessionId,
      corporateAccountId: employee.corporateAccountId,
      teamId: employee.teamId || null,
      employeeEmail: employee.employeeEmail,
      displayName: employee.displayName || null,
      role: employee.role || 'employee',
      department: employee.department || null,
      startDate: employee.startDate || new Date(),
      isActive: 1,
      enrolledAt: new Date(),
    };
    this.corporateEmployees.set(id, corporateEmployee);
    
    // Update team size if assigned to a team
    if (employee.teamId) {
      const team = this.corporateTeams.get(employee.teamId);
      if (team) {
        team.currentSize = (team.currentSize || 0) + 1;
        this.corporateTeams.set(employee.teamId, team);
      }
    }
    
    return corporateEmployee;
  }

  async getCorporateEmployees(corporateAccountId: string): Promise<CorporateEmployee[]> {
    return Array.from(this.corporateEmployees.values())
      .filter(emp => emp.corporateAccountId === corporateAccountId && emp.isActive === 1)
      .sort((a, b) => (a.displayName || a.employeeEmail).localeCompare(b.displayName || b.employeeEmail));
  }

  async getCorporateEmployee(sessionId: string): Promise<CorporateEmployee | null> {
    for (const employee of Array.from(this.corporateEmployees.values())) {
      if (employee.sessionId === sessionId && employee.isActive === 1) {
        return employee;
      }
    }
    return null;
  }

  async updateCorporateEmployee(employeeId: string, updates: Partial<CorporateEmployee>): Promise<CorporateEmployee> {
    const existing = this.corporateEmployees.get(employeeId);
    if (!existing) throw new Error('Corporate employee not found');
    
    const updated: CorporateEmployee = {
      ...existing,
      ...updates,
    };
    this.corporateEmployees.set(employeeId, updated);
    return updated;
  }

  async createCorporateChallenge(challenge: InsertCorporateChallenge): Promise<CorporateChallenge> {
    const id = randomUUID();
    const corporateChallenge: CorporateChallenge = {
      id,
      corporateAccountId: challenge.corporateAccountId,
      title: challenge.title,
      content: challenge.content,
      challengeType: challenge.challengeType || 'company_wide',
      targetTeamIds: challenge.targetTeamIds || null,
      echoReward: challenge.echoReward || 15,
      bonusReward: challenge.bonusReward || null,
      participationGoal: challenge.participationGoal || null,
      currentParticipation: 0,
      completionCount: 0,
      isActive: challenge.isActive || 1,
      isInternal: challenge.isInternal || 1,
      createdByEmployeeId: challenge.createdByEmployeeId || null,
      startsAt: challenge.startsAt || new Date(),
      expiresAt: challenge.expiresAt || null,
      createdAt: new Date(),
    };
    this.corporateChallenges.set(id, corporateChallenge);
    return corporateChallenge;
  }

  async getCorporateChallenges(corporateAccountId: string): Promise<CorporateChallenge[]> {
    return Array.from(this.corporateChallenges.values())
      .filter(challenge => challenge.corporateAccountId === corporateAccountId && challenge.isActive === 1)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async completeCorporateChallenge(challengeId: string, sessionId: string): Promise<{ challenge: CorporateChallenge; tokens: UserTokens }> {
    const challenge = this.corporateChallenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');
    
    // Update challenge participation and completion count
    challenge.currentParticipation = (challenge.currentParticipation || 0) + 1;
    challenge.completionCount = (challenge.completionCount || 0) + 1;
    this.corporateChallenges.set(challengeId, challenge);
    
    // Award tokens (corporate challenges pay more)
    const totalReward = challenge.echoReward + (challenge.bonusReward || 0);
    const tokens = await this.awardTokens(sessionId, totalReward, `Corporate challenge: ${challenge.title}`);
    
    return { challenge, tokens };
  }

  async recordCorporateAnalytics(analytics: CorporateAnalytics): Promise<void> {
    const existing = this.corporateAnalytics.get(analytics.corporateAccountId) || [];
    existing.push(analytics);
    
    // Keep only last 90 days of data
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const filtered = existing.filter(a => a.analyticsDate > ninetyDaysAgo);
    
    this.corporateAnalytics.set(analytics.corporateAccountId, filtered);
  }

  async getCorporateAnalytics(corporateAccountId: string, days = 30): Promise<CorporateAnalytics[]> {
    const analytics = this.corporateAnalytics.get(corporateAccountId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return analytics
      .filter(a => a.analyticsDate > cutoffDate)
      .sort((a, b) => a.analyticsDate.getTime() - b.analyticsDate.getTime());
  }

  async generateDailyCorporateAnalytics(corporateAccountId: string): Promise<CorporateAnalytics> {
    const employees = await this.getCorporateEmployees(corporateAccountId);
    const teams = await this.getCorporateTeams(corporateAccountId);
    const corporateChallenges = await this.getCorporateChallenges(corporateAccountId);
    
    // Calculate daily metrics (simplified for demo)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeEmployees = employees.filter(emp => 
      emp.enrolledAt <= today && emp.isActive === 1
    ).length;
    
    const totalEchoTokensEarned = employees.reduce((sum, emp) => {
      const userTokens = this.userTokens.get(emp.sessionId);
      return sum + (userTokens?.totalEarned || 0);
    }, 0);
    
    const totalChallengesCompleted = corporateChallenges.reduce((sum, challenge) => 
      sum + challenge.completionCount, 0
    );
    
    // Calculate engagement score (0-100)
    const averageEngagementScore = Math.min(100, Math.floor(
      (activeEmployees > 0 ? (totalChallengesCompleted / activeEmployees) * 10 : 0) + 
      (totalEchoTokensEarned > 0 ? Math.min(50, totalEchoTokensEarned / 100) : 0)
    ));
    
    // Find top performing team
    const topPerformingTeam = teams.reduce((best, team) => {
      const teamEmployees = employees.filter(emp => emp.teamId === team.id);
      const teamTokens = teamEmployees.reduce((sum, emp) => {
        const tokens = this.userTokens.get(emp.sessionId);
        return sum + (tokens?.totalEarned || 0);
      }, 0);
      
      return teamTokens > (best.score || 0) ? { team, score: teamTokens } : best;
    }, { team: null as CorporateTeam | null, score: 0 });
    
    const analytics: CorporateAnalytics = {
      id: randomUUID(),
      corporateAccountId,
      analyticsDate: today,
      activeEmployees,
      totalKindnessPosts: Math.floor(totalEchoTokensEarned / 5), // Estimate posts from tokens
      totalChallengesCompleted,
      totalEchoTokensEarned,
      averageEngagementScore,
      topPerformingTeamId: topPerformingTeam.team?.id || null,
      topPerformingDepartment: topPerformingTeam.team?.department || null,
      wellnessImpactScore: Math.floor(averageEngagementScore * 0.8), // Simplified wellness calculation
      createdAt: new Date()
    };
    
    await this.recordCorporateAnalytics(analytics);
    return analytics;
  }

  // AI Analytics Methods Implementation
  async updatePostWithAIAnalysis(postId: string, analysis: any): Promise<KindnessPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    const updatedPost: KindnessPost = {
      ...post,
      sentimentScore: analysis.sentimentScore,
      impactScore: analysis.impactScore,
      emotionalUplift: analysis.emotionalUplift,
      kindnessCategory: analysis.kindnessCategory,
      rippleEffect: analysis.rippleEffect,
      wellnessContribution: analysis.wellnessContribution,
      aiConfidence: analysis.confidence,
      aiTags: analysis.tags,
      analyzedAt: new Date(),
    };
    
    this.posts.set(postId, updatedPost);
    return updatedPost;
  }

  async getPostsWithAIAnalysis(): Promise<KindnessPost[]> {
    return Array.from(this.posts.values())
      .filter(post => post.analyzedAt !== null)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCommunityWellnessInsights(): Promise<any> {
    const posts = Array.from(this.posts.values()).filter(p => p.analyzedAt !== null);
    
    if (posts.length === 0) {
      return {
        overallWellness: 75,
        trendDirection: 'stable',
        dominantCategories: ['helping', 'supporting', 'encouraging'],
        totalAnalyzed: 0
      };
    }
    
    const avgWellness = posts.reduce((sum, p) => sum + (p.wellnessContribution || 50), 0) / posts.length;
    const categoryCount = posts.reduce((acc, p) => {
      const category = p.kindnessCategory || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
    
    return {
      overallWellness: Math.round(avgWellness),
      trendDirection: 'rising',
      dominantCategories,
      totalAnalyzed: posts.length,
      avgSentiment: Math.round(posts.reduce((sum, p) => sum + (p.sentimentScore || 50), 0) / posts.length),
      avgImpact: Math.round(posts.reduce((sum, p) => sum + (p.impactScore || 50), 0) / posts.length)
    };
  }
}

export const storage = new MemStorage();
