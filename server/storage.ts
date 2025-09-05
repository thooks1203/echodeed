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
}

export const storage = new DatabaseStorage();