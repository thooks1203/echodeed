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
}

export const storage = new DatabaseStorage();