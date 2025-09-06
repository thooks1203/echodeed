import {
  users,
  kindnessPosts,
  kindnessCounter,
  userTokens,
  brandChallenges,
  challengeCompletions,
  achievements,
  userAchievements,
  corporateAccounts,
  corporateTeams,
  corporateEmployees,
  corporateChallenges,
  corporateAnalytics,
  rewardPartners,
  rewardOffers,
  rewardRedemptions,
  kindnessVerifications,
  badgeRewards,
  weeklyPrizes,
  prizeWinners,
  type User,
  type UpsertUser,
  type KindnessPost,
  type InsertKindnessPost,
  type KindnessCounter,
  type UserTokens,
  type InsertUserTokens,
  type BrandChallenge,
  type InsertBrandChallenge,
  type ChallengeCompletion,
  type InsertChallengeCompletion,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type CorporateAccount,
  type InsertCorporateAccount,
  type CorporateTeam,
  type InsertCorporateTeam,
  type CorporateEmployee,
  type InsertCorporateEmployee,
  type CorporateChallenge,
  type InsertCorporateChallenge,
  type CorporateAnalytics,
  type InsertCorporateAnalytics,
  type RewardPartner,
  type InsertRewardPartner,
  type RewardOffer,
  type InsertRewardOffer,
  type RewardRedemption,
  type InsertRewardRedemption,
  type KindnessVerification,
  type InsertKindnessVerification,
  type BadgeReward,
  type InsertBadgeReward,
  type WeeklyPrize,
  type InsertWeeklyPrize,
  type PrizeWinner,
  type InsertPrizeWinner,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, count, or, gte } from "drizzle-orm";

// Storage interface for all operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Kindness posts operations
  getPosts(filters?: {
    category?: string;
    city?: string;
    state?: string;
    country?: string;
    limit?: number;
    userId?: string; // For user-specific posts
  }): Promise<KindnessPost[]>;
  createPost(post: InsertKindnessPost): Promise<KindnessPost>;
  addHeartToPost(postId: string, sessionId: string): Promise<KindnessPost>;
  addEchoToPost(postId: string, sessionId: string): Promise<KindnessPost>;
  updatePostAnalytics(id: string, analytics: {
    sentimentScore?: number;
    impactScore?: number;
    emotionalUplift?: number;
    kindnessCategory?: string;
    rippleEffect?: number;
    wellnessContribution?: number;
    aiConfidence?: number;
    aiTags?: string[];
  }): Promise<void>;
  
  // Counter operations
  getCounter(): Promise<KindnessCounter>;
  incrementCounter(amount?: number): Promise<KindnessCounter>;
  setCounter(count: number): Promise<KindnessCounter>;
  
  // User token operations
  getUserTokens(userId: string): Promise<UserTokens | undefined>;
  createUserTokens(tokens: InsertUserTokens): Promise<UserTokens>;
  updateUserTokens(userId: string, updates: Partial<UserTokens>): Promise<UserTokens | undefined>;
  
  // Challenge operations
  getChallenges(filters?: {
    isActive?: boolean;
    category?: string;
    difficulty?: string;
    challengeType?: string;
    limit?: number;
  }): Promise<BrandChallenge[]>;
  createChallenge(challenge: InsertBrandChallenge): Promise<BrandChallenge>;
  getCompletedChallenges(userId: string): Promise<ChallengeCompletion[]>;
  completeChallenge(completion: InsertChallengeCompletion): Promise<ChallengeCompletion>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  checkAndUnlockAchievements(sessionId: string): Promise<UserAchievement[]>;
  
  // Corporate operations
  getCorporateAccount(id: string): Promise<CorporateAccount | undefined>;
  createCorporateAccount(account: InsertCorporateAccount): Promise<CorporateAccount>;
  getCorporateEmployee(userId: string): Promise<CorporateEmployee | undefined>;
  enrollCorporateEmployee(employee: InsertCorporateEmployee): Promise<CorporateEmployee>;
  getCorporateTeams(corporateAccountId: string): Promise<CorporateTeam[]>;
  getCorporateChallenges(corporateAccountId: string): Promise<CorporateChallenge[]>;
  getCorporateAnalytics(corporateAccountId: string, days?: number): Promise<CorporateAnalytics[]>;
  
  // Wellness analytics operations
  calculateEmployeeWellnessScore(employeeId: string): Promise<number>;
  getEmployeeEngagementMetrics(corporateAccountId: string): Promise<{
    activeEmployees: number;
    totalEmployees: number;
    engagementRate: number;
    averagePostsPerEmployee: number;
    averageChallengesPerEmployee: number;
  }>;
  getTeamWellnessMetrics(teamId: string): Promise<{
    teamName: string;
    currentSize: number;
    wellnessScore: number;
    kindnessGoalProgress: number;
    challengeCompletionRate: number;
    atRiskEmployees: number;
  }>;
  generateWellnessInsights(corporateAccountId: string): Promise<{
    alerts: Array<{
      severity: 'low' | 'medium' | 'high';
      teamId: string;
      title: string;
      description: string;
      recommendations: string[];
    }>;
    successStories: Array<{
      teamId: string;
      title: string;
      description: string;
      impactScore: number;
    }>;
  }>;
  
  // Company-wide tracking operations
  getCompanyKindnessMetrics(corporateAccountId: string, days?: number): Promise<{
    totalKindnessPosts: number;
    totalChallengesCompleted: number;
    totalEchoTokensEarned: number;
    averageSentimentScore: number;
    kindnessGrowthRate: number;
    topCategories: Array<{ category: string; count: number; }>;
    monthlyTrends: Array<{ month: string; posts: number; challenges: number; }>;
  }>;

  // Community AI insights
  getCommunityWellnessInsights(): Promise<{
    overallWellness: number;
    trendDirection: 'rising' | 'stable' | 'declining';
    dominantCategories: string[];
    totalAnalyzed: number;
    avgSentiment: number;
    avgImpact: number;
  }>;
  getDepartmentalInsights(corporateAccountId: string): Promise<{
    departmentRankings: Array<{
      department: string;
      teamCount: number;
      totalEmployees: number;
      wellnessScore: number;
      kindnessScore: number;
      challengeCompletionRate: number;
      rank: number;
    }>;
    crossDepartmentTrends: {
      topPerforming: string;
      mostImproved: string;
      needsAttention: string;
    };
  }>;
  getCompanyBenchmarks(corporateAccountId: string): Promise<{
    industryComparison: {
      companyScore: number;
      industryAverage: number;
      percentile: number;
    };
    internalBenchmarks: {
      bestTeamScore: number;
      companyAverage: number;
      improvementPotential: number;
    };
    goalTracking: {
      monthlyTarget: number;
      currentProgress: number;
      projectedOutcome: number;
    };
  }>;
  
  // Rewards system operations
  getRewardPartners(filters?: { isActive?: boolean; partnerType?: string; }): Promise<RewardPartner[]>;
  createRewardPartner(partner: InsertRewardPartner): Promise<RewardPartner>;
  getRewardOffers(filters?: { partnerId?: string; isActive?: boolean; offerType?: string; badgeRequirement?: string; }): Promise<RewardOffer[]>;
  createRewardOffer(offer: InsertRewardOffer): Promise<RewardOffer>;
  redeemReward(redemption: InsertRewardRedemption): Promise<RewardRedemption>;
  getUserRedemptions(userId: string): Promise<RewardRedemption[]>;
  getRedemption(id: string): Promise<RewardRedemption | undefined>;
  updateRedemptionStatus(id: string, status: string, code?: string): Promise<RewardRedemption | undefined>;
  
  // Verification system
  submitKindnessVerification(verification: InsertKindnessVerification): Promise<KindnessVerification>;
  getKindnessVerifications(filters?: { userId?: string; status?: string; }): Promise<KindnessVerification[]>;
  approveKindnessVerification(id: string, reviewerId: string, bonusEcho?: number): Promise<KindnessVerification | undefined>;
  rejectKindnessVerification(id: string, reviewerId: string, notes?: string): Promise<KindnessVerification | undefined>;
  
  // Badge rewards
  getBadgeRewards(): Promise<BadgeReward[]>;
  createBadgeReward(reward: InsertBadgeReward): Promise<BadgeReward>;
  
  // Weekly prizes
  getWeeklyPrizes(filters?: { status?: string; }): Promise<WeeklyPrize[]>;
  createWeeklyPrize(prize: InsertWeeklyPrize): Promise<WeeklyPrize>;
  drawWeeklyPrizeWinners(prizeId: string): Promise<PrizeWinner[]>;
  getPrizeWinners(prizeId: string): Promise<PrizeWinner[]>;
  
  // Sample data initialization
  initializeSampleCorporateData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Kindness posts operations
  async getPosts(filters?: {
    category?: string;
    city?: string;
    state?: string;
    country?: string;
    limit?: number;
    userId?: string;
  }): Promise<KindnessPost[]> {
    let query = db.select().from(kindnessPosts);
    
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(kindnessPosts.category, filters.category));
    }
    if (filters?.city) {
      conditions.push(eq(kindnessPosts.city, filters.city));
    }
    if (filters?.state) {
      conditions.push(eq(kindnessPosts.state, filters.state));
    }
    if (filters?.country) {
      conditions.push(eq(kindnessPosts.country, filters.country));
    }
    if (filters?.userId) {
      conditions.push(eq(kindnessPosts.userId, filters.userId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const posts = await query
      .orderBy(desc(kindnessPosts.createdAt))
      .limit(filters?.limit || 50);
      
    return posts;
  }

  async createPost(post: InsertKindnessPost): Promise<KindnessPost> {
    const [newPost] = await db
      .insert(kindnessPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async addHeartToPost(postId: string, sessionId: string): Promise<KindnessPost> {
    const [updatedPost] = await db
      .update(kindnessPosts)
      .set({
        heartsCount: sql`${kindnessPosts.heartsCount} + 1`
      })
      .where(eq(kindnessPosts.id, postId))
      .returning();
    
    if (!updatedPost) {
      throw new Error('Post not found');
    }
    
    return updatedPost;
  }

  async addEchoToPost(postId: string, sessionId: string): Promise<KindnessPost> {
    const [updatedPost] = await db
      .update(kindnessPosts)
      .set({
        echoesCount: sql`${kindnessPosts.echoesCount} + 1`
      })
      .where(eq(kindnessPosts.id, postId))
      .returning();
    
    if (!updatedPost) {
      throw new Error('Post not found');
    }
    
    return updatedPost;
  }

  async updatePostAnalytics(id: string, analytics: {
    sentimentScore?: number;
    impactScore?: number;
    emotionalUplift?: number;
    kindnessCategory?: string;
    rippleEffect?: number;
    wellnessContribution?: number;
    aiConfidence?: number;
    aiTags?: string[];
  }): Promise<void> {
    await db
      .update(kindnessPosts)
      .set({
        ...analytics,
        aiTags: analytics.aiTags ? JSON.stringify(analytics.aiTags) : undefined,
        analyzedAt: new Date(),
      })
      .where(eq(kindnessPosts.id, id));
  }
  
  // Counter operations
  async getCounter(): Promise<KindnessCounter> {
    let [counter] = await db.select().from(kindnessCounter).where(eq(kindnessCounter.id, "global"));
    
    if (!counter) {
      [counter] = await db
        .insert(kindnessCounter)
        .values({ id: "global", count: 0 })
        .returning();
    }
    
    return counter;
  }

  async incrementCounter(amount: number = 1): Promise<KindnessCounter> {
    const [counter] = await db
      .update(kindnessCounter)
      .set({ 
        count: sql`${kindnessCounter.count} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(kindnessCounter.id, "global"))
      .returning();
      
    return counter;
  }

  async setCounter(count: number): Promise<KindnessCounter> {
    const [counter] = await db
      .update(kindnessCounter)
      .set({ 
        count: count,
        updatedAt: new Date()
      })
      .where(eq(kindnessCounter.id, "global"))
      .returning();
      
    return counter;
  }
  
  // User token operations
  async getUserTokens(userId: string): Promise<UserTokens | undefined> {
    const [tokens] = await db.select().from(userTokens).where(eq(userTokens.userId, userId));
    return tokens || undefined;
  }

  async createUserTokens(tokens: InsertUserTokens): Promise<UserTokens> {
    const [newTokens] = await db
      .insert(userTokens)
      .values(tokens)
      .returning();
    return newTokens;
  }

  async updateUserTokens(userId: string, updates: Partial<UserTokens>): Promise<UserTokens | undefined> {
    const [updatedTokens] = await db
      .update(userTokens)
      .set({ ...updates, lastActive: new Date() })
      .where(eq(userTokens.userId, userId))
      .returning();
    return updatedTokens || undefined;
  }
  
  // Challenge operations
  async getChallenges(filters?: {
    isActive?: boolean;
    category?: string;
    difficulty?: string;
    challengeType?: string;
    limit?: number;
  }): Promise<BrandChallenge[]> {
    let query = db.select().from(brandChallenges);
    
    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(brandChallenges.isActive, filters.isActive ? 1 : 0));
    }
    if (filters?.category) {
      conditions.push(eq(brandChallenges.category, filters.category));
    }
    if (filters?.difficulty) {
      conditions.push(eq(brandChallenges.difficulty, filters.difficulty));
    }
    if (filters?.challengeType) {
      conditions.push(eq(brandChallenges.challengeType, filters.challengeType));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const challenges = await query
      .orderBy(desc(brandChallenges.isPriority), desc(brandChallenges.createdAt))
      .limit(filters?.limit || 10);
      
    return challenges;
  }

  async createChallenge(challenge: InsertBrandChallenge): Promise<BrandChallenge> {
    const [newChallenge] = await db
      .insert(brandChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async getCompletedChallenges(userId: string): Promise<ChallengeCompletion[]> {
    return await db.select().from(challengeCompletions).where(eq(challengeCompletions.userId, userId));
  }

  async completeChallenge(completion: InsertChallengeCompletion): Promise<ChallengeCompletion> {
    const [newCompletion] = await db
      .insert(challengeCompletions)
      .values(completion)
      .returning();
    return newCompletion;
  }
  
  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db.select()
      .from(achievements)
      .where(eq(achievements.isActive, 1))
      .orderBy(achievements.sortOrder, achievements.tier);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async unlockUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db
      .insert(userAchievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async checkAndUnlockAchievements(sessionId: string): Promise<UserAchievement[]> {
    // For now, return empty array to fix the error
    // This can be expanded later with actual achievement checking logic
    return [];
  }
  
  // Corporate operations
  async getCorporateAccount(id: string): Promise<CorporateAccount | undefined> {
    const [account] = await db.select().from(corporateAccounts).where(eq(corporateAccounts.id, id));
    return account || undefined;
  }

  async createCorporateAccount(account: InsertCorporateAccount): Promise<CorporateAccount> {
    const [newAccount] = await db
      .insert(corporateAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async getCorporateEmployee(userId: string): Promise<CorporateEmployee | undefined> {
    const [employee] = await db.select().from(corporateEmployees).where(eq(corporateEmployees.userId, userId));
    return employee || undefined;
  }

  async enrollCorporateEmployee(employee: InsertCorporateEmployee): Promise<CorporateEmployee> {
    const [newEmployee] = await db
      .insert(corporateEmployees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async getCorporateTeams(corporateAccountId: string): Promise<CorporateTeam[]> {
    return await db.select()
      .from(corporateTeams)
      .where(and(
        eq(corporateTeams.corporateAccountId, corporateAccountId),
        eq(corporateTeams.isActive, 1)
      ));
  }

  async getCorporateChallenges(corporateAccountId: string): Promise<CorporateChallenge[]> {
    return await db.select()
      .from(corporateChallenges)
      .where(and(
        eq(corporateChallenges.corporateAccountId, corporateAccountId),
        eq(corporateChallenges.isActive, 1)
      ))
      .orderBy(desc(corporateChallenges.createdAt));
  }

  async getCorporateAnalytics(corporateAccountId: string, days: number = 30): Promise<CorporateAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select()
      .from(corporateAnalytics)
      .where(and(
        eq(corporateAnalytics.corporateAccountId, corporateAccountId),
        gte(corporateAnalytics.analyticsDate, startDate)
      ))
      .orderBy(desc(corporateAnalytics.analyticsDate));
  }

  // Wellness analytics implementations
  async calculateEmployeeWellnessScore(employeeId: string): Promise<number> {
    // Get the user's posts in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userPosts = await db.select()
      .from(kindnessPosts)
      .where(and(
        eq(kindnessPosts.userId, employeeId),
        gte(kindnessPosts.createdAt, thirtyDaysAgo)
      ));
    
    // Get completed challenges in the last 30 days
    const completedChallenges = await db.select()
      .from(challengeCompletions)
      .where(and(
        eq(challengeCompletions.userId, employeeId),
        gte(challengeCompletions.completedAt, thirtyDaysAgo)
      ));
    
    // Calculate wellness score (0-100)
    const postsScore = Math.min(userPosts.length * 10, 50); // Max 50 points from posts
    const challengesScore = Math.min(completedChallenges.length * 5, 30); // Max 30 points from challenges
    const sentimentScore = userPosts.reduce((sum, post) => sum + (post.sentimentScore || 70), 0) / Math.max(userPosts.length, 1) * 0.2; // 20% from sentiment
    
    return Math.min(Math.round(postsScore + challengesScore + sentimentScore), 100);
  }

  async getEmployeeEngagementMetrics(corporateAccountId: string): Promise<{
    activeEmployees: number;
    totalEmployees: number;
    engagementRate: number;
    averagePostsPerEmployee: number;
    averageChallengesPerEmployee: number;
  }> {
    // Get all employees for this corporate account
    const allEmployees = await db.select()
      .from(corporateEmployees)
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        eq(corporateEmployees.isActive, 1)
      ));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get active employees (posted or completed challenge in last 30 days)
    const activePosts = await db.select({ userId: kindnessPosts.userId })
      .from(kindnessPosts)
      .leftJoin(corporateEmployees, eq(kindnessPosts.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        gte(kindnessPosts.createdAt, thirtyDaysAgo)
      ));

    const activeChallenges = await db.select({ userId: challengeCompletions.userId })
      .from(challengeCompletions)
      .leftJoin(corporateEmployees, eq(challengeCompletions.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        gte(challengeCompletions.completedAt, thirtyDaysAgo)
      ));

    const activeUserIds = new Set([
      ...activePosts.map(p => p.userId),
      ...activeChallenges.map(c => c.userId)
    ].filter(Boolean));

    const totalPosts = activePosts.length;
    const totalChallenges = activeChallenges.length;
    const totalEmployees = allEmployees.length;
    const activeEmployees = activeUserIds.size;

    return {
      activeEmployees,
      totalEmployees,
      engagementRate: totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0,
      averagePostsPerEmployee: totalEmployees > 0 ? totalPosts / totalEmployees : 0,
      averageChallengesPerEmployee: totalEmployees > 0 ? totalChallenges / totalEmployees : 0,
    };
  }

  async getTeamWellnessMetrics(teamId: string): Promise<{
    teamName: string;
    currentSize: number;
    wellnessScore: number;
    kindnessGoalProgress: number;
    challengeCompletionRate: number;
    atRiskEmployees: number;
  }> {
    // Get team information
    const [team] = await db.select()
      .from(corporateTeams)
      .where(eq(corporateTeams.id, teamId));

    if (!team) {
      throw new Error('Team not found');
    }

    // Get team members
    const teamMembers = await db.select()
      .from(corporateEmployees)
      .where(and(
        eq(corporateEmployees.teamId, teamId),
        eq(corporateEmployees.isActive, 1)
      ));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate team wellness metrics
    let totalWellnessScore = 0;
    let atRiskCount = 0;

    for (const member of teamMembers) {
      const wellnessScore = await this.calculateEmployeeWellnessScore(member.userId);
      totalWellnessScore += wellnessScore;
      if (wellnessScore < 40) atRiskCount++;
    }

    // Get team posts and challenges for this month
    const teamPosts = await db.select()
      .from(kindnessPosts)
      .leftJoin(corporateEmployees, eq(kindnessPosts.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.teamId, teamId),
        gte(kindnessPosts.createdAt, thirtyDaysAgo)
      ));

    const teamChallenges = await db.select()
      .from(challengeCompletions)
      .leftJoin(corporateEmployees, eq(challengeCompletions.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.teamId, teamId),
        gte(challengeCompletions.completedAt, thirtyDaysAgo)
      ));

    const averageWellnessScore = teamMembers.length > 0 ? totalWellnessScore / teamMembers.length : 0;
    const kindnessGoalProgress = (teamPosts.length / team.monthlyKindnessGoal) * 100;
    const challengeCompletionRate = teamMembers.length > 0 ? (teamChallenges.length / teamMembers.length) * 100 : 0;

    return {
      teamName: team.teamName,
      currentSize: team.currentSize,
      wellnessScore: Math.round(averageWellnessScore),
      kindnessGoalProgress: Math.min(Math.round(kindnessGoalProgress), 100),
      challengeCompletionRate: Math.round(challengeCompletionRate),
      atRiskEmployees: atRiskCount,
    };
  }

  async generateWellnessInsights(corporateAccountId: string): Promise<{
    alerts: Array<{
      severity: 'low' | 'medium' | 'high';
      teamId: string;
      title: string;
      description: string;
      recommendations: string[];
    }>;
    successStories: Array<{
      teamId: string;
      title: string;
      description: string;
      impactScore: number;
    }>;
  }> {
    const teams = await this.getCorporateTeams(corporateAccountId);
    const alerts = [];
    const successStories = [];

    for (const team of teams) {
      const metrics = await this.getTeamWellnessMetrics(team.id);
      
      // Generate alerts based on metrics
      if (metrics.atRiskEmployees > 0) {
        const severity = metrics.atRiskEmployees >= 3 ? 'high' : metrics.atRiskEmployees >= 2 ? 'medium' : 'low';
        alerts.push({
          severity,
          teamId: team.id,
          title: `Team Wellness Alert: ${team.teamName}`,
          description: `${metrics.atRiskEmployees} employees showing wellness decline indicators. Team wellness score: ${metrics.wellnessScore}%`,
          recommendations: [
            'Schedule one-on-one check-ins with at-risk team members',
            'Implement team building activities to boost morale',
            'Consider workload redistribution to reduce stress',
            'Increase peer recognition and appreciation programs'
          ]
        });
      }

      if (metrics.kindnessGoalProgress < 50 && new Date().getDate() > 15) {
        alerts.push({
          severity: 'medium',
          teamId: team.id,
          title: `Kindness Goal Behind Schedule: ${team.teamName}`,
          description: `Team is at ${metrics.kindnessGoalProgress}% of monthly kindness goal with ${30 - new Date().getDate()} days remaining`,
          recommendations: [
            'Introduce team kindness challenges with rewards',
            'Share success stories from other high-performing teams',
            'Create friendly competition with peer teams',
            'Offer additional $ECHO token incentives'
          ]
        });
      }

      // Generate success stories
      if (metrics.wellnessScore >= 85 && metrics.challengeCompletionRate >= 80) {
        successStories.push({
          teamId: team.id,
          title: `Excellent Team Performance: ${team.teamName}`,
          description: `Achieved ${metrics.wellnessScore}% wellness score with ${metrics.challengeCompletionRate}% challenge completion rate`,
          impactScore: metrics.wellnessScore
        });
      }

      if (metrics.kindnessGoalProgress >= 100) {
        successStories.push({
          teamId: team.id,
          title: `Monthly Goal Exceeded: ${team.teamName}`,
          description: `Team exceeded monthly kindness goal by ${metrics.kindnessGoalProgress - 100}%, demonstrating exceptional engagement`,
          impactScore: Math.min(metrics.kindnessGoalProgress, 150)
        });
      }
    }

    return { alerts, successStories };
  }

  async getCommunityWellnessInsights(): Promise<{
    overallWellness: number;
    trendDirection: 'rising' | 'stable' | 'declining';
    dominantCategories: string[];
    totalAnalyzed: number;
    avgSentiment: number;
    avgImpact: number;
  }> {
    // Get all posts
    const allPosts = await this.getPosts();
    
    if (allPosts.length === 0) {
      return {
        overallWellness: 0,
        trendDirection: 'stable',
        dominantCategories: [],
        totalAnalyzed: 0,
        avgSentiment: 0,
        avgImpact: 0
      };
    }

    // Calculate category distribution
    const categoryCount: { [key: string]: number } = {};
    let totalSentiment = 0;
    let totalImpact = 0;
    let validSentimentCount = 0;
    let validImpactCount = 0;

    allPosts.forEach(post => {
      // Count categories
      if (post.category) {
        categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
      }

      // Sum sentiment scores (using default values if null)
      const sentiment = post.sentimentScore || 75; // Default positive sentiment
      totalSentiment += sentiment;
      validSentimentCount++;

      // Sum impact scores (using default values if null)
      const impact = post.impactScore || 80; // Default good impact
      totalImpact += impact;
      validImpactCount++;
    });

    // Calculate averages
    const avgSentiment = validSentimentCount > 0 ? Math.round(totalSentiment / validSentimentCount) : 75;
    const avgImpact = validImpactCount > 0 ? Math.round(totalImpact / validImpactCount) : 80;

    // Calculate overall wellness score (weighted average)
    const overallWellness = Math.round((avgSentiment * 0.4) + (avgImpact * 0.4) + (Math.min(allPosts.length * 2, 20) * 0.2));

    // Get dominant categories (top 3)
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Calculate trend direction based on recent activity
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentPosts = allPosts.filter(post => new Date(post.createdAt) >= dayAgo).length;
    const weekPosts = allPosts.filter(post => new Date(post.createdAt) >= weekAgo).length;
    
    let trendDirection: 'rising' | 'stable' | 'declining';
    if (recentPosts > 2 || (weekPosts > 10 && recentPosts > 0)) {
      trendDirection = 'rising';
    } else if (recentPosts === 0 && weekPosts < 3) {
      trendDirection = 'declining';
    } else {
      trendDirection = 'stable';
    }

    return {
      overallWellness: Math.min(overallWellness, 100),
      trendDirection,
      dominantCategories: sortedCategories,
      totalAnalyzed: allPosts.length,
      avgSentiment,
      avgImpact
    };
  }

  // Company-wide tracking implementations
  async getCompanyKindnessMetrics(corporateAccountId: string, days: number = 30): Promise<{
    totalKindnessPosts: number;
    totalChallengesCompleted: number;
    totalEchoTokensEarned: number;
    averageSentimentScore: number;
    kindnessGrowthRate: number;
    topCategories: Array<{ category: string; count: number; }>;
    monthlyTrends: Array<{ month: string; posts: number; challenges: number; }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    // Get current period data
    const currentPosts = await db.select()
      .from(kindnessPosts)
      .leftJoin(corporateEmployees, eq(kindnessPosts.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        gte(kindnessPosts.createdAt, startDate)
      ));

    const currentChallenges = await db.select()
      .from(challengeCompletions)
      .leftJoin(corporateEmployees, eq(challengeCompletions.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        gte(challengeCompletions.completedAt, startDate)
      ));

    // Get previous period for growth calculation
    const previousPosts = await db.select()
      .from(kindnessPosts)
      .leftJoin(corporateEmployees, eq(kindnessPosts.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        gte(kindnessPosts.createdAt, previousPeriodStart),
        gte(kindnessPosts.createdAt, startDate)
      ));

    // Calculate growth rate
    const currentCount = currentPosts.length;
    const previousCount = previousPosts.length;
    const growthRate = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

    // Calculate average sentiment score
    const validSentiments = currentPosts
      .map(p => p.kindness_posts?.sentimentScore)
      .filter(score => score !== null && score !== undefined);
    const averageSentimentScore = validSentiments.length > 0 
      ? validSentiments.reduce((sum, score) => sum + score!, 0) / validSentiments.length
      : 0;

    // Top categories
    const categoryCount = new Map<string, number>();
    currentPosts.forEach(post => {
      if (post.kindness_posts?.category) {
        categoryCount.set(
          post.kindness_posts.category, 
          (categoryCount.get(post.kindness_posts.category) || 0) + 1
        );
      }
    });
    
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

      const monthPosts = await db.select({ count: count() })
        .from(kindnessPosts)
        .leftJoin(corporateEmployees, eq(kindnessPosts.userId, corporateEmployees.userId))
        .where(and(
          eq(corporateEmployees.corporateAccountId, corporateAccountId),
          gte(kindnessPosts.createdAt, monthStart),
          gte(monthEnd, kindnessPosts.createdAt)
        ));

      const monthChallenges = await db.select({ count: count() })
        .from(challengeCompletions)
        .leftJoin(corporateEmployees, eq(challengeCompletions.userId, corporateEmployees.userId))
        .where(and(
          eq(corporateEmployees.corporateAccountId, corporateAccountId),
          gte(challengeCompletions.completedAt, monthStart),
          gte(monthEnd, challengeCompletions.completedAt)
        ));

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        posts: monthPosts[0]?.count || 0,
        challenges: monthChallenges[0]?.count || 0,
      });
    }

    return {
      totalKindnessPosts: currentCount,
      totalChallengesCompleted: currentChallenges.length,
      totalEchoTokensEarned: currentChallenges.length * 15 + currentCount * 10, // Estimated
      averageSentimentScore: Math.round(averageSentimentScore),
      kindnessGrowthRate: Math.round(growthRate * 100) / 100,
      topCategories,
      monthlyTrends,
    };
  }

  async getDepartmentalInsights(corporateAccountId: string): Promise<{
    departmentRankings: Array<{
      department: string;
      teamCount: number;
      totalEmployees: number;
      wellnessScore: number;
      kindnessScore: number;
      challengeCompletionRate: number;
      rank: number;
    }>;
    crossDepartmentTrends: {
      topPerforming: string;
      mostImproved: string;
      needsAttention: string;
    };
  }> {
    // Get all teams for the company
    const teams = await this.getCorporateTeams(corporateAccountId);
    
    // Group teams by department
    const departmentData = new Map<string, {
      teams: typeof teams;
      employees: number;
      wellnessScores: number[];
      kindnessScores: number[];
      challengeRates: number[];
    }>();

    for (const team of teams) {
      const dept = team.department || 'Other';
      if (!departmentData.has(dept)) {
        departmentData.set(dept, {
          teams: [],
          employees: 0,
          wellnessScores: [],
          kindnessScores: [],
          challengeRates: []
        });
      }
      
      const deptData = departmentData.get(dept)!;
      deptData.teams.push(team);
      deptData.employees += team.currentSize;
      
      // Get team metrics
      const metrics = await this.getTeamWellnessMetrics(team.id);
      deptData.wellnessScores.push(metrics.wellnessScore);
      deptData.kindnessScores.push(metrics.kindnessGoalProgress);
      deptData.challengeRates.push(metrics.challengeCompletionRate);
    }

    // Calculate department rankings
    const departmentRankings = Array.from(departmentData.entries()).map(([department, data]) => ({
      department,
      teamCount: data.teams.length,
      totalEmployees: data.employees,
      wellnessScore: Math.round(data.wellnessScores.reduce((sum, score) => sum + score, 0) / data.wellnessScores.length) || 0,
      kindnessScore: Math.round(data.kindnessScores.reduce((sum, score) => sum + score, 0) / data.kindnessScores.length) || 0,
      challengeCompletionRate: Math.round(data.challengeRates.reduce((sum, rate) => sum + rate, 0) / data.challengeRates.length) || 0,
      rank: 0 // Will be calculated after sorting
    })).sort((a, b) => (b.wellnessScore + b.kindnessScore + b.challengeCompletionRate) - (a.wellnessScore + a.kindnessScore + a.challengeCompletionRate));

    // Assign ranks
    departmentRankings.forEach((dept, index) => {
      dept.rank = index + 1;
    });

    // Determine cross-department trends
    const topPerforming = departmentRankings[0]?.department || 'N/A';
    const needsAttention = departmentRankings[departmentRankings.length - 1]?.department || 'N/A';
    
    // For "most improved", we'll use a simple heuristic based on current performance vs expected
    const mostImproved = departmentRankings.find(dept => 
      dept.wellnessScore > 75 && dept.rank > 2
    )?.department || departmentRankings[1]?.department || 'N/A';

    return {
      departmentRankings,
      crossDepartmentTrends: {
        topPerforming,
        mostImproved,
        needsAttention,
      },
    };
  }

  async getCompanyBenchmarks(corporateAccountId: string): Promise<{
    industryComparison: {
      companyScore: number;
      industryAverage: number;
      percentile: number;
    };
    internalBenchmarks: {
      bestTeamScore: number;
      companyAverage: number;
      improvementPotential: number;
    };
    goalTracking: {
      monthlyTarget: number;
      currentProgress: number;
      projectedOutcome: number;
    };
  }> {
    // Get company account for industry info
    const account = await this.getCorporateAccount(corporateAccountId);
    const teams = await this.getCorporateTeams(corporateAccountId);
    
    // Calculate company-wide metrics
    let totalWellnessScore = 0;
    let teamCount = 0;
    let bestTeamScore = 0;

    for (const team of teams) {
      try {
        const metrics = await this.getTeamWellnessMetrics(team.id);
        totalWellnessScore += metrics.wellnessScore;
        teamCount++;
        bestTeamScore = Math.max(bestTeamScore, metrics.wellnessScore);
      } catch {
        // Skip teams that can't be analyzed
        continue;
      }
    }

    const companyAverage = teamCount > 0 ? totalWellnessScore / teamCount : 0;

    // Industry benchmarks (simplified - in real app would come from external data)
    const industryBenchmarks: Record<string, number> = {
      'Technology': 78,
      'Healthcare': 82,
      'Finance': 75,
      'Manufacturing': 72,
      'Retail': 70,
      'Education': 80,
      'Default': 75
    };

    const industryAverage = industryBenchmarks[account?.industry || 'Default'] || 75;
    const percentile = companyAverage > 0 ? Math.min(Math.round((companyAverage / industryAverage) * 50 + 25), 99) : 50;

    // Goal tracking (based on company metrics)
    const employeeCount = teams.reduce((sum, team) => sum + team.currentSize, 0);
    const monthlyTarget = Math.max(employeeCount * 5, 50); // 5 kindness acts per employee per month minimum
    
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const monthlyPosts = await db.select({ count: count() })
      .from(kindnessPosts)
      .leftJoin(corporateEmployees, eq(kindnessPosts.userId, corporateEmployees.userId))
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        gte(kindnessPosts.createdAt, monthStart)
      ));

    const currentProgress = monthlyPosts[0]?.count || 0;
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysPassed = currentDate.getDate();
    const projectedOutcome = Math.round((currentProgress / daysPassed) * daysInMonth);

    return {
      industryComparison: {
        companyScore: Math.round(companyAverage),
        industryAverage,
        percentile,
      },
      internalBenchmarks: {
        bestTeamScore,
        companyAverage: Math.round(companyAverage),
        improvementPotential: Math.max(bestTeamScore - companyAverage, 0),
      },
      goalTracking: {
        monthlyTarget,
        currentProgress,
        projectedOutcome,
      },
    };
  }

  // Rewards system implementation
  async getRewardPartners(filters?: { isActive?: boolean; partnerType?: string; }): Promise<RewardPartner[]> {
    let query = db.select().from(rewardPartners);
    
    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(rewardPartners.isActive, filters.isActive ? 1 : 0));
    }
    if (filters?.partnerType) {
      conditions.push(eq(rewardPartners.partnerType, filters.partnerType));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(rewardPartners.createdAt));
  }

  async createRewardPartner(partner: InsertRewardPartner): Promise<RewardPartner> {
    const [newPartner] = await db.insert(rewardPartners).values(partner).returning();
    return newPartner;
  }

  async getRewardOffers(filters?: { partnerId?: string; isActive?: boolean; offerType?: string; badgeRequirement?: string; }): Promise<RewardOffer[]> {
    let query = db.select().from(rewardOffers);
    
    const conditions = [];
    if (filters?.partnerId) {
      conditions.push(eq(rewardOffers.partnerId, filters.partnerId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(rewardOffers.isActive, filters.isActive ? 1 : 0));
    }
    if (filters?.offerType) {
      conditions.push(eq(rewardOffers.offerType, filters.offerType));
    }
    if (filters?.badgeRequirement) {
      conditions.push(eq(rewardOffers.badgeRequirement, filters.badgeRequirement));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(rewardOffers.isFeatured), desc(rewardOffers.createdAt));
  }

  async createRewardOffer(offer: InsertRewardOffer): Promise<RewardOffer> {
    const [newOffer] = await db.insert(rewardOffers).values(offer).returning();
    return newOffer;
  }

  async redeemReward(redemption: InsertRewardRedemption): Promise<RewardRedemption> {
    const [newRedemption] = await db.insert(rewardRedemptions).values(redemption).returning();
    
    // Increment redemption count for the offer
    await db.update(rewardOffers)
      .set({ currentRedemptions: sql`${rewardOffers.currentRedemptions} + 1` })
      .where(eq(rewardOffers.id, redemption.offerId));
    
    return newRedemption;
  }

  async getUserRedemptions(userId: string): Promise<RewardRedemption[]> {
    return await db.select().from(rewardRedemptions)
      .where(eq(rewardRedemptions.userId, userId))
      .orderBy(desc(rewardRedemptions.redeemedAt));
  }

  async getRedemption(id: string): Promise<RewardRedemption | undefined> {
    const [redemption] = await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.id, id));
    return redemption;
  }

  async updateRedemptionStatus(id: string, status: string, code?: string): Promise<RewardRedemption | undefined> {
    const updates: Partial<RewardRedemption> = { status };
    if (code) updates.redemptionCode = code;
    if (status === 'used') updates.usedAt = new Date();
    
    const [updatedRedemption] = await db.update(rewardRedemptions)
      .set(updates)
      .where(eq(rewardRedemptions.id, id))
      .returning();
    
    return updatedRedemption;
  }

  // Verification system implementation
  async submitKindnessVerification(verification: InsertKindnessVerification): Promise<KindnessVerification> {
    const [newVerification] = await db.insert(kindnessVerifications).values(verification).returning();
    return newVerification;
  }

  async getKindnessVerifications(filters?: { userId?: string; status?: string; }): Promise<KindnessVerification[]> {
    let query = db.select().from(kindnessVerifications);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(kindnessVerifications.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(kindnessVerifications.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(kindnessVerifications.submittedAt));
  }

  async approveKindnessVerification(id: string, reviewerId: string, bonusEcho?: number): Promise<KindnessVerification | undefined> {
    const [updatedVerification] = await db.update(kindnessVerifications)
      .set({
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        bonusEchoAwarded: bonusEcho || 0,
      })
      .where(eq(kindnessVerifications.id, id))
      .returning();

    // Award bonus echo tokens to user if specified
    if (updatedVerification && bonusEcho && bonusEcho > 0) {
      await this.updateUserTokens(updatedVerification.userId, {
        echoTokens: sql`${userTokens.echoTokens} + ${bonusEcho}`,
      } as any);
    }
    
    return updatedVerification;
  }

  async rejectKindnessVerification(id: string, reviewerId: string, notes?: string): Promise<KindnessVerification | undefined> {
    const [updatedVerification] = await db.update(kindnessVerifications)
      .set({
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes || '',
      })
      .where(eq(kindnessVerifications.id, id))
      .returning();
    
    return updatedVerification;
  }

  // Badge rewards implementation
  async getBadgeRewards(): Promise<BadgeReward[]> {
    return await db.select().from(badgeRewards)
      .where(eq(badgeRewards.isActive, 1))
      .orderBy(desc(badgeRewards.createdAt));
  }

  async createBadgeReward(reward: InsertBadgeReward): Promise<BadgeReward> {
    const [newReward] = await db.insert(badgeRewards).values(reward).returning();
    return newReward;
  }

  // Weekly prizes implementation
  async getWeeklyPrizes(filters?: { status?: string; }): Promise<WeeklyPrize[]> {
    let query = db.select().from(weeklyPrizes);
    
    if (filters?.status) {
      query = query.where(eq(weeklyPrizes.status, filters.status));
    }
    
    return await query.orderBy(desc(weeklyPrizes.weekStartDate));
  }

  async createWeeklyPrize(prize: InsertWeeklyPrize): Promise<WeeklyPrize> {
    const [newPrize] = await db.insert(weeklyPrizes).values(prize).returning();
    return newPrize;
  }

  async drawWeeklyPrizeWinners(prizeId: string): Promise<PrizeWinner[]> {
    const prize = await db.select().from(weeklyPrizes).where(eq(weeklyPrizes.id, prizeId));
    if (!prize[0]) {
      throw new Error('Prize not found');
    }

    // For now, return empty array - would implement actual lottery logic
    // In real implementation, would select random qualifying users based on eligibility criteria
    return [];
  }

  async getPrizeWinners(prizeId: string): Promise<PrizeWinner[]> {
    return await db.select().from(prizeWinners)
      .where(eq(prizeWinners.prizeId, prizeId))
      .orderBy(desc(prizeWinners.wonAt));
  }

  // Sample corporate data initialization
  async initializeSampleCorporateData(): Promise<void> {
    try {
      // Check if demo corporate account already exists
      const existingAccount = await db.select()
        .from(corporateAccounts)
        .where(eq(corporateAccounts.domain, 'techflow.com'));
      
      if (existingAccount.length > 0) {
        return; // Demo data already exists
      }

      // Create sample corporate account - TechFlow Solutions
      const [corporateAccount] = await db.insert(corporateAccounts).values({
        companyName: 'TechFlow Solutions',
        domain: 'techflow.com',
        industry: 'Technology',
        subscriptionTier: 'Enterprise',
        primaryColor: '#8B5CF6',
        companyLogo: null,
        totalEmployees: 156,
        contactEmail: 'hello@techflow.com',
        isActive: 1
      }).returning();

      // Create sample teams
      const teams = [
        { id: 'team-engineering', teamName: 'Engineering', department: 'Technology', currentSize: 24, targetSize: 30, monthlyKindnessGoal: 50 },
        { id: 'team-design', teamName: 'Design', department: 'Product', currentSize: 8, targetSize: 10, monthlyKindnessGoal: 20 },
        { id: 'team-marketing', teamName: 'Marketing', department: 'Marketing', currentSize: 12, targetSize: 15, monthlyKindnessGoal: 30 },
        { id: 'team-sales', teamName: 'Sales', department: 'Sales', currentSize: 18, targetSize: 20, monthlyKindnessGoal: 40 },
        { id: 'team-hr', teamName: 'People Operations', department: 'HR', currentSize: 6, targetSize: 8, monthlyKindnessGoal: 15 }
      ];

      for (const team of teams) {
        await db.insert(corporateTeams).values({
          ...team,
          corporateAccountId: corporateAccount.id,
          isActive: 1
        });
      }

      // Create sample employees
      const employees = [
        { id: 'emp-sarah-chen', displayName: 'Sarah Chen', employeeEmail: 'sarah@techflow.com', department: 'Technology', role: 'corporate_admin', teamId: 'team-engineering' },
        { id: 'emp-mike-johnson', displayName: 'Mike Johnson', employeeEmail: 'mike@techflow.com', department: 'Technology', role: 'employee', teamId: 'team-engineering' },
        { id: 'emp-elena-rodriguez', displayName: 'Elena Rodriguez', employeeEmail: 'elena@techflow.com', department: 'Product', role: 'team_lead', teamId: 'team-design' },
        { id: 'emp-david-kim', displayName: 'David Kim', employeeEmail: 'david@techflow.com', department: 'Marketing', role: 'employee', teamId: 'team-marketing' },
        { id: 'emp-jessica-wright', displayName: 'Jessica Wright', employeeEmail: 'jessica@techflow.com', department: 'HR', role: 'hr_admin', teamId: 'team-hr' }
      ];

      for (const employee of employees) {
        await db.insert(corporateEmployees).values({
          ...employee,
          userId: employee.id,
          corporateAccountId: corporateAccount.id,
          isActive: 1
        });
      }

      // Create sample challenges
      const challenges = [
        {
          corporateAccountId: corporateAccount.id,
          title: 'Coffee Chain Kindness',
          content: 'Buy coffee for a colleague or stranger this week',
          challengeType: 'individual',
          echoReward: 150,
          isActive: 1
        },
        {
          corporateAccountId: corporateAccount.id,
          title: 'Team Volunteer Day',
          content: 'Organize a volunteer activity with your team',
          challengeType: 'team',
          echoReward: 500,
          isActive: 1
        }
      ];

      for (const challenge of challenges) {
        await db.insert(corporateChallenges).values(challenge);
      }

      // Create sample analytics for the last 7 days
      const analyticsData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        analyticsData.push({
          id: `analytics-${corporateAccount.id}-${i}`,
          corporateAccountId: corporateAccount.id,
          analyticsDate: date,
          activeEmployees: 45 + Math.floor(Math.random() * 15),
          totalKindnessPosts: 8 + Math.floor(Math.random() * 12),
          totalChallengesCompleted: 3 + Math.floor(Math.random() * 5),
          totalEchoTokensEarned: 850 + Math.floor(Math.random() * 300),
          averageEngagementScore: 75 + Math.floor(Math.random() * 15),
          wellnessImpactScore: 80 + Math.floor(Math.random() * 10)
        });
      }

      for (const analytics of analyticsData) {
        await db.insert(corporateAnalytics).values(analytics);
      }

    } catch (error: any) {
      console.error('Failed to initialize sample corporate data:', error.message);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();