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
  subscriptionPlans,
  workplaceSentimentData,
  wellnessPredictions,
  wellnessHeatmapData,
  parentAccounts,
  studentParentLinks,
  selStandards,
  studentSelProgress,
  parentNotifications,
  schoolContentReports,
  schoolAdministrators,
  googleClassroomIntegrations,
  sponsorAnalytics,
  sponsorProfiles,
  sponsorImpactReports,
  sponsorCampaigns,
  sponsorCommunications,
  conflictReports,
  conflictResolutions,
  bullyingPredictions,
  kindnessExchanges,
  supportPosts,
  supportResponses,
  crisisEscalations,
  licensedCounselors,
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
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type WorkplaceSentimentData,
  type InsertWorkplaceSentimentData,
  type ParentAccount,
  type InsertParentAccount,
  type StudentParentLink,
  type InsertStudentParentLink,
  type SelStandard,
  type InsertSelStandard,
  type StudentSelProgress,
  type InsertStudentSelProgress,
  type ParentNotification,
  type InsertParentNotification,
  type SchoolContentReport,
  type InsertSchoolContentReport,
  type SchoolAdministrator,
  type InsertSchoolAdministrator,
  type GoogleClassroomIntegration,
  type InsertGoogleClassroomIntegration,
  type SponsorAnalytics,
  type InsertSponsorAnalytics,
  type SponsorProfile,
  type InsertSponsorProfile,
  type SponsorImpactReport,
  type InsertSponsorImpactReport,
  type SponsorCampaign,
  type InsertSponsorCampaign,
  type SponsorCommunication,
  type InsertSponsorCommunication,
  type WellnessPrediction,
  type InsertWellnessPrediction,
  type WellnessHeatmapData,
  type InsertWellnessHeatmapData,
  type SupportPost,
  type InsertSupportPost,
  type SupportResponse,
  type InsertSupportResponse,
  type CrisisEscalation,
  type InsertCrisisEscalation,
  type LicensedCounselor,
  type InsertLicensedCounselor,
  wellnessCheckIns,
  pushSubscriptions,
  wellnessTrends,
  type WellnessCheckIn,
  type InsertWellnessCheckIn,
  type PushSubscription,
  type InsertPushSubscription,
  type WellnessTrend,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, count, or, gte } from "drizzle-orm";

// Storage interface for all operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getActiveUsers(days?: number): Promise<User[]>;
  getUserPosts(userId: string, filters?: { limit?: number }): Promise<KindnessPost[]>;
  
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
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>;
  
  // Corporate operations
  getCorporateAccount(id: string): Promise<CorporateAccount | undefined>;
  getCorporateAccounts(): Promise<CorporateAccount[]>;
  createCorporateAccount(account: InsertCorporateAccount): Promise<CorporateAccount>;
  getCorporateEmployee(userId: string): Promise<CorporateEmployee | undefined>;
  enrollCorporateEmployee(employee: InsertCorporateEmployee): Promise<CorporateEmployee>;
  getCorporateTeams(corporateAccountId: string): Promise<CorporateTeam[]>;
  createCorporateTeam(team: InsertCorporateTeam): Promise<CorporateTeam>;
  updateCorporateTeam(id: string, updates: Partial<CorporateTeam>): Promise<CorporateTeam | undefined>;
  deleteCorporateTeam(id: string): Promise<void>;
  getCorporateEmployees(corporateAccountId: string): Promise<CorporateEmployee[]>;
  updateCorporateEmployee(id: string, updates: Partial<CorporateEmployee>): Promise<CorporateEmployee | undefined>;
  updateCorporateAccount(id: string, updates: Partial<CorporateAccount>): Promise<CorporateAccount | undefined>;
  getCorporateChallenges(corporateAccountId: string): Promise<CorporateChallenge[]>;
  createCorporateChallenge(challenge: InsertCorporateChallenge): Promise<CorporateChallenge>;
  completeCorporateChallenge(userId: string, challengeId: string): Promise<ChallengeCompletion>;
  getCorporateAnalytics(corporateAccountId: string, days?: number): Promise<CorporateAnalytics[]>;
  generateDailyCorporateAnalytics(corporateAccountId: string): Promise<void>;
  
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
  
  // PREMIUM SPONSOR ANALYTICS OPERATIONS
  logSponsorAnalytics(analytics: InsertSponsorAnalytics): Promise<SponsorAnalytics>;
  getSponsorAnalytics(sponsorCompany: string, filters?: { 
    startDate?: Date; 
    endDate?: Date; 
    eventType?: string; 
  }): Promise<SponsorAnalytics[]>;
  createSponsorProfile(profile: InsertSponsorProfile): Promise<SponsorProfile>;
  getSponsorProfile(companyName: string): Promise<SponsorProfile | undefined>;
  updateSponsorProfile(companyName: string, updates: Partial<SponsorProfile>): Promise<SponsorProfile | undefined>;
  generateSponsorImpactReport(sponsorCompany: string, startDate: Date, endDate: Date): Promise<SponsorImpactReport>;
  getSponsorImpactReports(sponsorCompany: string, limit?: number): Promise<SponsorImpactReport[]>;
  createSponsorCampaign(campaign: InsertSponsorCampaign): Promise<SponsorCampaign>;
  getSponsorCampaigns(sponsorCompany: string): Promise<SponsorCampaign[]>;
  logSponsorCommunication(communication: InsertSponsorCommunication): Promise<SponsorCommunication>;
  trackSponsorImpression(sponsorCompany: string, offerId: string, userId?: string): Promise<void>;
  trackSponsorClick(sponsorCompany: string, offerId: string, targetUrl: string, userId?: string): Promise<void>;
  
  // Weekly prizes
  getWeeklyPrizes(filters?: { status?: string; }): Promise<WeeklyPrize[]>;
  createWeeklyPrize(prize: InsertWeeklyPrize): Promise<WeeklyPrize>;
  drawWeeklyPrizeWinners(prizeId: string): Promise<PrizeWinner[]>;
  getPrizeWinners(prizeId: string): Promise<PrizeWinner[]>;
  
  // AI Analysis operations
  getPostsWithAIAnalysis(limit?: number): Promise<KindnessPost[]>;
  updatePostWithAIAnalysis(id: string, analysis: any): Promise<void>;
  
  // Sample data initialization
  initializeSampleCorporateData(): Promise<void>;

  // PREMIUM SUBSCRIPTION SYSTEM (Revenue Diversification)
  getSubscriptionPlans(planType?: string): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateUserSubscription(userId: string, tier: string, status: string, endDate?: Date): Promise<User | undefined>;
  getUserSubscriptionStatus(userId: string): Promise<{ tier: string; status: string; features: string[]; }>;
  checkFeatureAccess(userId: string, feature: string): Promise<boolean>;
  
  // ANONYMOUS WORKPLACE WELLNESS FEATURES
  createWellnessPrediction(prediction: InsertWellnessPrediction): Promise<WellnessPrediction>;
  getUserWellnessPredictions(userId: string, riskLevel?: string): Promise<WellnessPrediction[]>;
  getCorporateWellnessRisks(corporateAccountId: string): Promise<WellnessPrediction[]>;
  updateWellnessPredictionStatus(id: string, status: string): Promise<WellnessPrediction | undefined>;
  
  // WORKPLACE SENTIMENT ANALYSIS (Anonymous Only)
  recordWorkplaceSentiment(sentiment: InsertWorkplaceSentimentData): Promise<WorkplaceSentimentData>;
  getCorporateSentimentTrends(corporateAccountId: string, days?: number): Promise<WorkplaceSentimentData[]>;
  generateAnonymousSentimentInsights(corporateAccountId: string): Promise<{
    overallSentiment: number;
    departmentBreakdown: Array<{ department: string; sentimentScore: number; }>;
    riskDepartments: string[];
    positivityTrends: string[];
  }>;

  // SCHOOL ADMINISTRATOR MANAGEMENT
  createSchoolAdministrator(admin: InsertSchoolAdministrator): Promise<SchoolAdministrator>;
  getSchoolAdministrator(id: string): Promise<SchoolAdministrator | undefined>;
  getAdministratorsBySchool(schoolId: string): Promise<SchoolAdministrator[]>;
  getAdministratorsByDistrict(districtId: string): Promise<SchoolAdministrator[]>;
  updateAdministratorPermissions(id: string, permissions: string[]): Promise<SchoolAdministrator | undefined>;
  
  // GOOGLE CLASSROOM INTEGRATION
  createGoogleClassroomIntegration(integration: InsertGoogleClassroomIntegration): Promise<GoogleClassroomIntegration>;
  getGoogleClassroomIntegrations(schoolId: string): Promise<GoogleClassroomIntegration[]>;
  getGoogleIntegrationByTeacher(teacherUserId: string): Promise<GoogleClassroomIntegration[]>;
  updateGoogleIntegrationTokens(id: string, accessToken: string, refreshToken: string): Promise<GoogleClassroomIntegration | undefined>;
  syncGoogleClassroomStudents(integrationId: string, studentCount: number): Promise<void>;

  // REVOLUTIONARY FEATURES STORAGE
  // Conflict Resolution System
  createConflictReport(report: any): Promise<void>;
  getConflictReports(schoolId: string): Promise<any[]>;
  createConflictResolution(resolution: any): Promise<void>;
  
  // Bullying Prevention Analytics
  createBullyingPrediction(prediction: any): Promise<void>;
  getBullyingPredictions(schoolId: string): Promise<any[]>;
  
  // Cross-School Kindness Exchange
  createKindnessExchange(exchange: any): Promise<void>;
  getKindnessExchanges(schoolId: string): Promise<any[]>;
  getAllKindnessExchanges(): Promise<any[]>;

  // Support Circle operations - Anonymous peer support for grades 6-8
  getSupportPosts(filters?: { schoolId?: string; category?: string; gradeLevel?: string; }): Promise<SupportPost[]>;
  createSupportPost(post: InsertSupportPost): Promise<SupportPost>;
  heartSupportPost(postId: string): Promise<SupportPost>;
  getSupportResponses(postId: string): Promise<SupportResponse[]>;
  createSupportResponse(response: InsertSupportResponse): Promise<SupportResponse>;
  createCrisisEscalation(escalation: InsertCrisisEscalation): Promise<CrisisEscalation>;
  getCrisisEscalations(filters?: { status?: string; }): Promise<CrisisEscalation[]>;
  getLicensedCounselors(filters?: { schoolId?: string; isActive?: boolean; }): Promise<LicensedCounselor[]>;

  // Daily wellness check-in operations - Proactive mental health monitoring
  createWellnessCheckIn(checkIn: InsertWellnessCheckIn): Promise<WellnessCheckIn>;
  getWellnessCheckIns(filters?: { schoolId?: string; gradeLevel?: string; dateRange?: { start: Date; end: Date; }; }): Promise<WellnessCheckIn[]>;
  getWellnessTrends(schoolId: string, gradeLevel?: string): Promise<WellnessTrend[]>;
  subscribeToPushNotifications(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptions(schoolId: string, gradeLevel?: string): Promise<PushSubscription[]>;
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

  async getActiveUsers(days: number = 30): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Get users who have posted in the last N days
    const activeUserIds = await db
      .selectDistinct({ userId: kindnessPosts.userId })
      .from(kindnessPosts)
      .where(gte(kindnessPosts.createdAt, cutoffDate));
    
    if (activeUserIds.length === 0) {
      return [];
    }
    
    // Get full user data for active users
    return await db
      .select()
      .from(users)
      .where(or(...activeUserIds.map(u => eq(users.id, u.userId || ''))));
  }

  async getUserPosts(userId: string, filters?: { limit?: number }): Promise<KindnessPost[]> {
    return await db
      .select()
      .from(kindnessPosts)
      .where(eq(kindnessPosts.userId, userId))
      .orderBy(desc(kindnessPosts.createdAt))
      .limit(filters?.limit || 50);
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

  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = [];
    
    try {
      // Get user's current achievements to avoid duplicates
      const existingAchievements = await this.getUserAchievements(userId);
      const existingIds = existingAchievements.map(a => a.achievementId);
      
      // Get user's stats for checking requirements
      const userTokens = await this.getUserTokens(userId);
      const userPosts = await db.select().from(kindnessPosts).where(eq(kindnessPosts.userId, userId));
      const totalPosts = userPosts.length;
      const totalEarned = userTokens?.totalEarned || 0;
      
      console.log(`🎯 Achievement check for user ${userId}: ${totalPosts} posts, ${totalEarned} tokens earned`);
      
      // Calculate category-specific posts
      const helpingPosts = userPosts.filter(p => p.category === 'Helping Others').length;
      const communityPosts = userPosts.filter(p => p.category === 'Community Action').length;
      const positivityPosts = userPosts.filter(p => p.category === 'Spreading Positivity').length;
      
      // Calculate total engagement received
      const totalHearts = userPosts.reduce((sum, p) => sum + (p.heartsCount || 0), 0);
      const totalEchoes = userPosts.reduce((sum, p) => sum + (p.echoesCount || 0), 0);
      
      // Define achievements to check
      const achievementsToCheck = [
        {
          id: 'first_post',
          title: '🌟 First Spark',
          description: 'Shared your first act of kindness',
          category: 'milestones',
          tier: 'bronze',
          echoReward: 25,
          condition: () => totalPosts >= 1
        },
        {
          id: 'kindness_streak_5',
          title: '🔥 Kindness Streak',
          description: 'Shared 5 acts of kindness',
          category: 'streaks',
          tier: 'silver',
          echoReward: 50,
          condition: () => totalPosts >= 5
        },
        {
          id: 'helping_hero',
          title: '🤝 Helping Hero',
          description: 'Shared 10 acts focused on helping others',
          category: 'kindness',
          tier: 'gold',
          echoReward: 100,
          condition: () => helpingPosts >= 10
        },
        {
          id: 'community_builder',
          title: '🏘️ Community Builder',
          description: 'Shared 15 community action posts',
          category: 'kindness',
          tier: 'gold',
          echoReward: 100,
          condition: () => communityPosts >= 15
        },
        {
          id: 'inspiration_source',
          title: '✨ Inspiration Source',
          description: 'Received 50 total hearts on your posts',
          category: 'social',
          tier: 'platinum',
          echoReward: 200,
          condition: () => totalHearts >= 50
        },
        {
          id: 'echo_champion',
          title: '📢 Echo Champion',
          description: 'Received 25 echoes - your kindness resonates!',
          category: 'social',
          tier: 'platinum',
          echoReward: 200,
          condition: () => totalEchoes >= 25
        }
      ];
      
      // Check each achievement
      for (const achievement of achievementsToCheck) {
        if (!existingIds.includes(achievement.id) && achievement.condition()) {
          try {
            // Create the achievement if it doesn't exist
            const existing = await db.select().from(achievements).where(eq(achievements.id, achievement.id)).limit(1);
            if (existing.length === 0) {
              await db.insert(achievements).values({
                id: achievement.id,
                title: achievement.title,
                description: achievement.description,
                badge: achievement.title.split(' ')[0], // Extract emoji
                category: achievement.category,
                tier: achievement.tier,
                requirement: JSON.stringify({ condition: 'dynamic' }),
                echoReward: achievement.echoReward,
              });
            }
            
            // Unlock for user
            const userAchievement = await this.unlockUserAchievement({
              userId,
              achievementId: achievement.id
            });
            
            // Award bonus tokens
            if (userTokens) {
              await this.updateUserTokens(userId, {
                echoBalance: userTokens.echoBalance + achievement.echoReward,
                totalEarned: userTokens.totalEarned + achievement.echoReward
              });
            }
            
            unlockedAchievements.push(userAchievement);
          } catch (error) {
            console.error('Error unlocking achievement:', achievement.id, error);
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
    
    return unlockedAchievements;
  }
  
  // Corporate operations
  async getCorporateAccount(id: string): Promise<CorporateAccount | undefined> {
    const [account] = await db.select().from(corporateAccounts).where(eq(corporateAccounts.id, id));
    return account || undefined;
  }

  async getCorporateAccounts(): Promise<CorporateAccount[]> {
    return await db.select().from(corporateAccounts)
      .where(eq(corporateAccounts.isActive, 1))
      .orderBy(desc(corporateAccounts.createdAt));
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

  async updateCorporateAccount(id: string, updates: Partial<CorporateAccount>): Promise<CorporateAccount | undefined> {
    const [updatedAccount] = await db
      .update(corporateAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(corporateAccounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async createCorporateTeam(team: InsertCorporateTeam): Promise<CorporateTeam> {
    const [newTeam] = await db
      .insert(corporateTeams)
      .values(team)
      .returning();
    return newTeam;
  }

  async updateCorporateTeam(id: string, updates: Partial<CorporateTeam>): Promise<CorporateTeam | undefined> {
    const [updatedTeam] = await db
      .update(corporateTeams)
      .set(updates)
      .where(eq(corporateTeams.id, id))
      .returning();
    return updatedTeam || undefined;
  }

  async deleteCorporateTeam(id: string): Promise<void> {
    await db
      .update(corporateTeams)
      .set({ isActive: 0 })
      .where(eq(corporateTeams.id, id));
  }

  async getCorporateEmployees(corporateAccountId: string): Promise<CorporateEmployee[]> {
    return await db.select()
      .from(corporateEmployees)
      .where(and(
        eq(corporateEmployees.corporateAccountId, corporateAccountId),
        eq(corporateEmployees.isActive, 1)
      ));
  }

  async updateCorporateEmployee(id: string, updates: Partial<CorporateEmployee>): Promise<CorporateEmployee | undefined> {
    const [updatedEmployee] = await db
      .update(corporateEmployees)
      .set(updates)
      .where(eq(corporateEmployees.id, id))
      .returning();
    return updatedEmployee || undefined;
  }

  async createCorporateChallenge(challenge: InsertCorporateChallenge): Promise<CorporateChallenge> {
    const [newChallenge] = await db
      .insert(corporateChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async completeCorporateChallenge(userId: string, challengeId: string): Promise<ChallengeCompletion> {
    const [completion] = await db
      .insert(challengeCompletions)
      .values({ userId, challengeId })
      .returning();
    return completion;
  }

  async generateDailyCorporateAnalytics(corporateAccountId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get employee metrics for today
    const employees = await this.getCorporateEmployees(corporateAccountId);
    const activeEmployees = employees.length;
    
    // Insert daily analytics
    await db
      .insert(corporateAnalytics)
      .values({
        corporateAccountId,
        analyticsDate: today,
        activeEmployees,
        totalKindnessPosts: 0,
        totalChallengesCompleted: 0,
        totalEchoTokensEarned: 0,
        averageEngagementScore: 75,
        wellnessImpactScore: 80,
      })
      .onConflictDoNothing();
  }

  async getPostsWithAIAnalysis(limit: number = 50): Promise<KindnessPost[]> {
    return await db.select()
      .from(kindnessPosts)
      .where(sql`${kindnessPosts.analyzedAt} IS NOT NULL`)
      .orderBy(desc(kindnessPosts.createdAt))
      .limit(limit);
  }

  async updatePostWithAIAnalysis(id: string, analysis: any): Promise<void> {
    await db
      .update(kindnessPosts)
      .set({
        sentimentScore: analysis.sentimentScore,
        impactScore: analysis.impactScore,
        emotionalUplift: analysis.emotionalUplift,
        analyzedAt: new Date(),
      })
      .where(eq(kindnessPosts.id, id));
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

  // PREMIUM SPONSOR ANALYTICS IMPLEMENTATIONS
  
  async logSponsorAnalytics(analytics: InsertSponsorAnalytics): Promise<SponsorAnalytics> {
    const [newAnalytics] = await db
      .insert(sponsorAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async getSponsorAnalytics(sponsorCompany: string, filters?: { 
    startDate?: Date; 
    endDate?: Date; 
    eventType?: string; 
  }): Promise<SponsorAnalytics[]> {
    const conditions = [eq(sponsorAnalytics.sponsorCompany, sponsorCompany)];
    
    if (filters?.startDate) {
      conditions.push(gte(sponsorAnalytics.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(sponsorAnalytics.createdAt, filters.endDate));
    }
    if (filters?.eventType) {
      conditions.push(eq(sponsorAnalytics.eventType, filters.eventType));
    }
    
    return await db.select()
      .from(sponsorAnalytics)
      .where(and(...conditions))
      .orderBy(desc(sponsorAnalytics.createdAt));
  }

  async createSponsorProfile(profile: InsertSponsorProfile): Promise<SponsorProfile> {
    const [newProfile] = await db
      .insert(sponsorProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async getSponsorProfile(companyName: string): Promise<SponsorProfile | undefined> {
    const [profile] = await db.select()
      .from(sponsorProfiles)
      .where(eq(sponsorProfiles.companyName, companyName));
    return profile || undefined;
  }

  async updateSponsorProfile(companyName: string, updates: Partial<SponsorProfile>): Promise<SponsorProfile | undefined> {
    const [updatedProfile] = await db
      .update(sponsorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sponsorProfiles.companyName, companyName))
      .returning();
    return updatedProfile || undefined;
  }

  async generateSponsorImpactReport(sponsorCompany: string, startDate: Date, endDate: Date): Promise<SponsorImpactReport> {
    // Calculate metrics from sponsor analytics
    const analytics = await this.getSponsorAnalytics(sponsorCompany, { startDate, endDate });
    
    const totalImpressions = analytics.filter(a => a.eventType === 'impression').length;
    const totalClicks = analytics.filter(a => a.eventType === 'click').length;
    const totalRedemptions = analytics.filter(a => a.eventType === 'redemption').length;
    
    const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalRedemptions / totalClicks) * 100 : 0;
    
    // Get unique users reached
    const uniqueUsers = new Set(analytics.filter(a => a.userId).map(a => a.userId)).size;
    
    // Enhanced impact calculation - Get actual kindness posts during sponsor period
    const kindnessPostsResult = await db.select({ count: sql<number>`count(*)` })
      .from(kindnessPosts)
      .where(and(
        gte(kindnessPosts.createdAt, startDate),
        lte(kindnessPosts.createdAt, endDate)
      ));

    const actualPosts = kindnessPostsResult[0]?.count || 0;
    
    // Calculate baseline and sponsor-influenced posts
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const baselinePostRate = 15; // avg posts per day
    const expectedBaseline = Math.max(1, baselinePostRate * daysInPeriod);
    
    // Acts enabled = correlation between sponsor visibility and increased posting
    const sponsorInfluenceMultiplier = Math.min(1.5, 1 + (totalImpressions / 10000)); // Scale with impressions
    const kindnessActsEnabled = Math.max(0, Math.floor(
      (actualPosts * sponsorInfluenceMultiplier) - expectedBaseline + (totalImpressions * 0.03)
    ));

    // Enhanced engagement score with multiple factors
    const uniqueInteractions = new Set(analytics.map(a => `${a.userId}_${a.eventType}`)).size;
    const repeatEngagements = analytics.length - uniqueInteractions;
    const socialShareEstimate = Math.floor(totalClicks * 0.08); // estimated viral sharing
    const brandAwarenessLift = Math.floor(totalImpressions * 0.05); // brand awareness points

    const engagementScore = Math.min(100, Math.round(
      (clickThroughRate * 1.2) + 
      (conversionRate * 2) + 
      (repeatEngagements * 0.5) + 
      (socialShareEstimate * 0.8) +
      (kindnessActsEnabled * 0.3) +
      (brandAwarenessLift * 0.1)
    ));

    // Dynamic brand sentiment based on engagement quality
    const baselineSentiment = 75;
    const sentimentBoost = Math.min(20, Math.round(
      (clickThroughRate * 0.4) + 
      (conversionRate * 0.6) + 
      (kindnessActsEnabled * 0.02) + 
      (engagementScore * 0.15)
    ));
    const brandSentiment = Math.min(95, baselineSentiment + sentimentBoost);

    // Sophisticated ROI calculation 
    const sponsorshipCost = 6000; // $6K premium sponsorship value
    const avgUserLifetimeValue = 28; // estimated LTV per engaged user
    const brandValuePerAct = 3.5; // brand value per kindness act enabled
    const trafficValue = totalClicks * 2.5; // value of website traffic
    const brandAwarenessValue = totalImpressions * 0.008; // CPM value
    
    const totalValue = (uniqueUsers * avgUserLifetimeValue) + 
                      (kindnessActsEnabled * brandValuePerAct) + 
                      trafficValue + 
                      brandAwarenessValue;
    
    const roi = sponsorshipCost > 0 ? Math.round(((totalValue - sponsorshipCost) / sponsorshipCost) * 100) : 0;

    // Cost per engagement with quality weighting
    const totalEngagements = totalClicks + (totalRedemptions * 2) + (repeatEngagements * 0.5);
    const costPerEngagement = totalEngagements > 0 ? 
      Math.round((sponsorshipCost * 100) / totalEngagements) : 0;

    const reportData = {
      sponsorCompany,
      reportPeriodStart: startDate,
      reportPeriodEnd: endDate,
      totalImpressions,
      totalClicks,
      totalRedemptions,
      clickThroughRate,
      conversionRate,
      kindnessActsEnabled,
      usersReached: uniqueUsers,
      engagementScore,
      brandSentiment,
      costPerEngagement,
      roi,
      reportData: { 
        analytics: analytics.length > 0 ? analytics.slice(0, 100) : [],
        insights: {
          totalValue: Math.round(totalValue),
          trafficValue: Math.round(trafficValue),
          brandAwarenessValue: Math.round(brandAwarenessValue),
          socialShares: socialShareEstimate,
          repeatEngagements,
          daysAnalyzed: daysInPeriod
        }
      },
    };

    const [newReport] = await db
      .insert(sponsorImpactReports)
      .values(reportData)
      .returning();
    
    return newReport;
  }

  async getSponsorImpactReports(sponsorCompany: string, limit: number = 10): Promise<SponsorImpactReport[]> {
    return await db.select()
      .from(sponsorImpactReports)
      .where(eq(sponsorImpactReports.sponsorCompany, sponsorCompany))
      .orderBy(desc(sponsorImpactReports.generatedAt))
      .limit(limit);
  }

  async createSponsorCampaign(campaign: InsertSponsorCampaign): Promise<SponsorCampaign> {
    const [newCampaign] = await db
      .insert(sponsorCampaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async getSponsorCampaigns(sponsorCompany: string): Promise<SponsorCampaign[]> {
    return await db.select()
      .from(sponsorCampaigns)
      .where(eq(sponsorCampaigns.sponsorCompany, sponsorCompany))
      .orderBy(desc(sponsorCampaigns.createdAt));
  }

  async logSponsorCommunication(communication: InsertSponsorCommunication): Promise<SponsorCommunication> {
    const [newCommunication] = await db
      .insert(sponsorCommunications)
      .values(communication)
      .returning();
    return newCommunication;
  }

  async trackSponsorImpression(sponsorCompany: string, offerId: string, userId?: string): Promise<void> {
    await this.logSponsorAnalytics({
      sponsorCompany,
      offerId,
      eventType: 'impression',
      userId,
      sessionId: Date.now().toString(), // Simple session ID
      engagementDuration: 0,
      conversionValue: 0,
    });
  }

  async trackSponsorClick(sponsorCompany: string, offerId: string, targetUrl: string, userId?: string): Promise<void> {
    await this.logSponsorAnalytics({
      sponsorCompany,
      offerId,
      eventType: 'click',
      userId,
      targetUrl,
      sessionId: Date.now().toString(),
      engagementDuration: 0,
      conversionValue: 1, // Click has value
    });
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
  async initializeSampleSubscriptionPlans(): Promise<void> {
    try {
      // Check if subscription plans already exist
      const existingPlans = await db.select().from(subscriptionPlans);
      
      if (existingPlans.length > 0) {
        console.log('Subscription plans already exist, skipping initialization');
        return;
      }

      // Individual Subscription Plans for Revenue Diversification
      const individualPlans = [
        {
          planName: 'Free',
          planType: 'individual',
          monthlyPrice: 0,
          yearlyPrice: 0,
          features: ['basic_posting', 'view_feed', 'basic_filters', 'global_counter'],
          limits: { postsPerMonth: 10, filtersPerDay: 5 },
          isActive: 1,
          sortOrder: 1,
        },
        {
          planName: 'Basic',
          planType: 'individual',
          monthlyPrice: 999, // $9.99
          yearlyPrice: 9990, // $99.90 (save 2 months)
          features: [
            'basic_posting', 'view_feed', 'basic_filters', 'global_counter',
            'unlimited_posts', 'advanced_filters', 'kindness_analytics', 'personal_insights'
          ],
          limits: { postsPerMonth: -1, filtersPerDay: -1 },
          isActive: 1,
          sortOrder: 2,
        },
        {
          planName: 'Premium',
          planType: 'individual',
          monthlyPrice: 1999, // $19.99
          yearlyPrice: 19990, // $199.90 (save 2 months)
          features: [
            'basic_posting', 'view_feed', 'basic_filters', 'global_counter',
            'unlimited_posts', 'advanced_filters', 'kindness_analytics', 'personal_insights',
            'ai_wellness_predictions', 'burnout_alerts', 'sentiment_tracking', 'goal_setting',
            'export_data', 'premium_support'
          ],
          limits: { postsPerMonth: -1, filtersPerDay: -1 },
          isActive: 1,
          sortOrder: 3,
        },
        {
          planName: 'Pro',
          planType: 'individual',
          monthlyPrice: 4999, // $49.99
          yearlyPrice: 49990, // $499.90 (save 2 months)
          features: [
            'basic_posting', 'view_feed', 'basic_filters', 'global_counter',
            'unlimited_posts', 'advanced_filters', 'kindness_analytics', 'personal_insights',
            'ai_wellness_predictions', 'burnout_alerts', 'sentiment_tracking', 'goal_setting',
            'export_data', 'premium_support', 'workplace_analytics', 'team_insights',
            'custom_challenges', 'priority_support', 'beta_features'
          ],
          limits: { postsPerMonth: -1, filtersPerDay: -1 },
          isActive: 1,
          sortOrder: 4,
        }
      ];

      for (const plan of individualPlans) {
        await db.insert(subscriptionPlans).values(plan);
      }

      console.log('✅ Individual subscription plans initialized successfully');

    } catch (error) {
      console.error('Failed to initialize subscription plans:', error);
    }
  }

  async initializeSampleCorporateData(): Promise<void> {
    try {
      // Check if demo corporate accounts already exist
      const existingTechFlow = await db.select()
        .from(corporateAccounts)
        .where(eq(corporateAccounts.domain, 'techflow.com'));
      
      const existingWise = await db.select()
        .from(corporateAccounts)
        .where(eq(corporateAccounts.domain, 'wise.com'));
      
      if (existingTechFlow.length > 0 && existingWise.length > 0) {
        return; // Demo data already exists
      }

      // Create sample corporate accounts
      let techFlowAccount: any;
      let wiseAccount: any;

      // Create Winners Institute for Successful Empowerment if it doesn't exist
      if (existingTechFlow.length === 0) {
        [techFlowAccount] = await db.insert(corporateAccounts).values({
          companyName: 'Winners Institute for Successful Empowerment',
          domain: 'techflow.com',
          industry: 'Technology',
          companySize: 'medium',
          subscriptionTier: 'pro',
          maxEmployees: 200,
          monthlyBudget: 2500,
          primaryColor: '#8B5CF6',
          companyLogo: null,
          contactEmail: 'hello@techflow.com',
          contactName: 'Sarah Chen',
          isActive: 1,
          billingStatus: 'active'
        }).returning();
      } else {
        techFlowAccount = existingTechFlow[0];
      }

      // Create Wise Inc if it doesn't exist
      if (existingWise.length === 0) {
        [wiseAccount] = await db.insert(corporateAccounts).values({
          companyName: 'Wise Inc',
          domain: 'wise.com',
          industry: 'Financial Technology',
          companySize: 'large',
          subscriptionTier: 'enterprise',
          maxEmployees: 500,
          monthlyBudget: 5000,
          primaryColor: '#00D4AA',
          companyLogo: null,
          contactEmail: 'wellness@wise.com',
          contactName: 'Marcus Johnson',
          isActive: 1,
          billingStatus: 'active'
        }).returning();
      } else {
        wiseAccount = existingWise[0];
      }

      // Create sample teams for Winners Institute
      if (existingTechFlow.length === 0) {
        const techFlowTeams = [
          { teamName: 'Engineering', department: 'Technology', currentSize: 24, targetSize: 30, monthlyKindnessGoal: 50 },
          { teamName: 'Design', department: 'Product', currentSize: 8, targetSize: 10, monthlyKindnessGoal: 20 },
          { teamName: 'Marketing', department: 'Marketing', currentSize: 12, targetSize: 15, monthlyKindnessGoal: 30 },
          { teamName: 'Sales', department: 'Sales', currentSize: 18, targetSize: 20, monthlyKindnessGoal: 40 },
          { teamName: 'People Operations', department: 'HR', currentSize: 6, targetSize: 8, monthlyKindnessGoal: 15 }
        ];

        for (const team of techFlowTeams) {
          await db.insert(corporateTeams).values({
            ...team,
            corporateAccountId: techFlowAccount.id,
            isActive: 1
          });
        }
      }

      // Create sample teams for Wise Inc
      if (existingWise.length === 0) {
        const wiseTeams = [
          { teamName: 'Product Engineering', department: 'Engineering', currentSize: 45, targetSize: 55, monthlyKindnessGoal: 80 },
          { teamName: 'Data & Analytics', department: 'Engineering', currentSize: 22, targetSize: 28, monthlyKindnessGoal: 40 },
          { teamName: 'Customer Success', department: 'Customer Operations', currentSize: 38, targetSize: 45, monthlyKindnessGoal: 65 },
          { teamName: 'Design Systems', department: 'Product', currentSize: 15, targetSize: 18, monthlyKindnessGoal: 30 },
          { teamName: 'Marketing & Growth', department: 'Marketing', currentSize: 25, targetSize: 30, monthlyKindnessGoal: 50 },
          { teamName: 'Finance & Operations', department: 'Finance', currentSize: 18, targetSize: 20, monthlyKindnessGoal: 35 },
          { teamName: 'People & Culture', department: 'HR', currentSize: 12, targetSize: 15, monthlyKindnessGoal: 25 }
        ];

        for (const team of wiseTeams) {
          await db.insert(corporateTeams).values({
            ...team,
            corporateAccountId: wiseAccount.id,
            isActive: 1
          });
        }
      }

      // Create sample employees for Winners Institute
      if (existingTechFlow.length === 0) {
        const techFlowEmployees = [
          { displayName: 'Sarah Chen', employeeEmail: 'sarah@techflow.com', department: 'Technology', role: 'corporate_admin' },
          { displayName: 'Mike Johnson', employeeEmail: 'mike@techflow.com', department: 'Technology', role: 'employee' },
          { displayName: 'Elena Rodriguez', employeeEmail: 'elena@techflow.com', department: 'Product', role: 'team_lead' },
          { displayName: 'David Kim', employeeEmail: 'david@techflow.com', department: 'Marketing', role: 'employee' },
          { displayName: 'Jessica Wright', employeeEmail: 'jessica@techflow.com', department: 'HR', role: 'hr_admin' }
        ];

        for (const employee of techFlowEmployees) {
          // First create a user record 
          const userId = `tf-${employee.employeeEmail.split('@')[0]}`;
          const [user] = await db.insert(users).values({
            id: userId,
            email: employee.employeeEmail,
            name: employee.displayName,
            createdAt: new Date()
          }).onConflictDoNothing().returning();

          // Then create the corporate employee record
          await db.insert(corporateEmployees).values({
            ...employee,
            userId: userId,
            corporateAccountId: techFlowAccount.id,
            isActive: 1
          });
        }
      }

      // Create sample employees for Wise Inc
      if (existingWise.length === 0) {
        const wiseEmployees = [
          { displayName: 'Marcus Johnson', employeeEmail: 'marcus@wise.com', department: 'HR', role: 'corporate_admin' },
          { displayName: 'Priya Sharma', employeeEmail: 'priya@wise.com', department: 'Engineering', role: 'team_lead' },
          { displayName: 'James Chen', employeeEmail: 'james@wise.com', department: 'Engineering', role: 'employee' },
          { displayName: 'Sofia Martins', employeeEmail: 'sofia@wise.com', department: 'Product', role: 'employee' },
          { displayName: 'Alex Thompson', employeeEmail: 'alex@wise.com', department: 'Customer Operations', role: 'team_lead' },
          { displayName: 'Rachel Park', employeeEmail: 'rachel@wise.com', department: 'Marketing', role: 'employee' },
          { displayName: 'Michael Brown', employeeEmail: 'michael@wise.com', department: 'Finance', role: 'employee' },
          { displayName: 'Lisa Wang', employeeEmail: 'lisa@wise.com', department: 'HR', role: 'hr_admin' }
        ];

        for (const employee of wiseEmployees) {
          // First create a user record 
          const userId = `wise-${employee.employeeEmail.split('@')[0]}`;
          const [user] = await db.insert(users).values({
            id: userId,
            email: employee.employeeEmail,
            name: employee.displayName,
            createdAt: new Date()
          }).onConflictDoNothing().returning();

          // Then create the corporate employee record
          await db.insert(corporateEmployees).values({
            ...employee,
            userId: userId,
            corporateAccountId: wiseAccount.id,
            isActive: 1
          });
        }
      }

      // Create sample challenges for Winners Institute
      if (existingTechFlow.length === 0) {
        const techFlowChallenges = [
          {
            corporateAccountId: techFlowAccount.id,
            title: 'Coffee Chain Kindness',
            content: 'Buy coffee for a colleague or stranger this week',
            challengeType: 'individual',
            echoReward: 150,
            isActive: 1
          },
          {
            corporateAccountId: techFlowAccount.id,
            title: 'Team Volunteer Day',
            content: 'Organize a volunteer activity with your team',
            challengeType: 'team',
            echoReward: 500,
            isActive: 1
          }
        ];

        for (const challenge of techFlowChallenges) {
          await db.insert(corporateChallenges).values(challenge);
        }

        // Create sample analytics for Winners Institute (last 7 days)
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          await db.insert(corporateAnalytics).values({
            corporateAccountId: techFlowAccount.id,
            analyticsDate: date,
            activeEmployees: 45 + Math.floor(Math.random() * 15),
            totalKindnessPosts: 8 + Math.floor(Math.random() * 12),
            totalChallengesCompleted: 3 + Math.floor(Math.random() * 5),
            totalEchoTokensEarned: 850 + Math.floor(Math.random() * 300),
            averageEngagementScore: 75 + Math.floor(Math.random() * 15),
            wellnessImpactScore: 80 + Math.floor(Math.random() * 10)
          });
        }
      }

      // Create sample challenges for Wise Inc
      if (existingWise.length === 0) {
        const wiseChallenges = [
          {
            corporateAccountId: wiseAccount.id,
            title: 'Global Kindness Initiative',
            content: 'Help a colleague from a different country or time zone this week',
            challengeType: 'individual',
            echoReward: 200,
            isActive: 1
          },
          {
            corporateAccountId: wiseAccount.id,
            title: 'Financial Literacy Support',
            content: 'Share financial tips or resources with someone who could benefit',
            challengeType: 'individual',
            echoReward: 175,
            isActive: 1
          },
          {
            corporateAccountId: wiseAccount.id,
            title: 'Cross-Department Collaboration',
            content: 'Work with another team to complete a kindness project together',
            challengeType: 'team',
            echoReward: 750,
            isActive: 1
          },
          {
            corporateAccountId: wiseAccount.id,
            title: 'Customer Success Champion',
            content: 'Go above and beyond to help a customer with their financial journey',
            challengeType: 'individual',
            echoReward: 300,
            isActive: 1
          }
        ];

        for (const challenge of wiseChallenges) {
          await db.insert(corporateChallenges).values(challenge);
        }

        // Create sample analytics for Wise Inc (last 7 days)
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          await db.insert(corporateAnalytics).values({
            corporateAccountId: wiseAccount.id,
            analyticsDate: date,
            activeEmployees: 175 + Math.floor(Math.random() * 25),
            totalKindnessPosts: 25 + Math.floor(Math.random() * 15),
            totalChallengesCompleted: 12 + Math.floor(Math.random() * 8),
            totalEchoTokensEarned: 2250 + Math.floor(Math.random() * 500),
            averageEngagementScore: 82 + Math.floor(Math.random() * 12),
            wellnessImpactScore: 88 + Math.floor(Math.random() * 8)
          });
        }
      }

    } catch (error: any) {
      console.error('Failed to initialize sample corporate data:', error.message);
      throw error;
    }
  }

  // PREMIUM SUBSCRIPTION SYSTEM IMPLEMENTATIONS
  async getSubscriptionPlans(planType?: string): Promise<SubscriptionPlan[]> {
    let query = db.select().from(subscriptionPlans);
    
    if (planType) {
      query = query.where(eq(subscriptionPlans.planType, planType));
    }
    
    return await query.orderBy(subscriptionPlans.sortOrder);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateUserSubscription(userId: string, tier: string, status: string, endDate?: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionTier: tier,
        subscriptionStatus: status,
        subscriptionEndDate: endDate || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserSubscriptionStatus(userId: string): Promise<{ tier: string; status: string; features: string[]; }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return { tier: 'free', status: 'active', features: [] };
    }

    // Get plan features based on tier
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planName, user.subscriptionTier || 'free'));

    const features = plan ? (plan.features as string[]) : [];

    return {
      tier: user.subscriptionTier || 'free',
      status: user.subscriptionStatus || 'active',
      features,
    };
  }

  async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscriptionStatus(userId);
    
    // Free tier features
    const freeFeatures = ['basic_posting', 'view_feed', 'basic_filters'];
    
    if (freeFeatures.includes(feature)) {
      return true;
    }

    // Check if user's subscription includes the feature
    return subscription.features.includes(feature) && subscription.status === 'active';
  }

  // WORKPLACE WELLNESS IMPLEMENTATIONS
  async createWellnessPrediction(prediction: InsertWellnessPrediction): Promise<WellnessPrediction> {
    const [newPrediction] = await db.insert(wellnessPredictions).values(prediction).returning();
    return newPrediction;
  }

  async getUserWellnessPredictions(userId: string, riskLevel?: string): Promise<WellnessPrediction[]> {
    let query = db.select().from(wellnessPredictions).where(eq(wellnessPredictions.userId, userId));
    
    if (riskLevel) {
      query = query.where(and(
        eq(wellnessPredictions.userId, userId),
        eq(wellnessPredictions.riskLevel, riskLevel)
      ));
    }
    
    return await query.orderBy(desc(wellnessPredictions.createdAt));
  }

  async getCorporateWellnessRisks(corporateAccountId: string): Promise<WellnessPrediction[]> {
    return await db.select()
      .from(wellnessPredictions)
      .where(eq(wellnessPredictions.corporateAccountId, corporateAccountId))
      .orderBy(desc(wellnessPredictions.createdAt));
  }

  async updateWellnessPredictionStatus(id: string, status: string): Promise<WellnessPrediction | undefined> {
    const [prediction] = await db
      .update(wellnessPredictions)
      .set({ 
        status,
        resolvedAt: status === 'resolved' ? new Date() : null
      })
      .where(eq(wellnessPredictions.id, id))
      .returning();
    return prediction;
  }

  // WORKPLACE SENTIMENT ANALYSIS IMPLEMENTATIONS
  async recordWorkplaceSentiment(sentiment: InsertWorkplaceSentimentData): Promise<WorkplaceSentimentData> {
    const [newSentiment] = await db.insert(workplaceSentimentData).values(sentiment).returning();
    return newSentiment;
  }

  async getCorporateSentimentTrends(corporateAccountId: string, days: number = 30): Promise<WorkplaceSentimentData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select()
      .from(workplaceSentimentData)
      .where(and(
        eq(workplaceSentimentData.corporateAccountId, corporateAccountId),
        gte(workplaceSentimentData.dataDate, startDate)
      ))
      .orderBy(desc(workplaceSentimentData.dataDate));
  }

  async generateAnonymousSentimentInsights(corporateAccountId: string): Promise<{
    overallSentiment: number;
    departmentBreakdown: Array<{ department: string; sentimentScore: number; }>;
    riskDepartments: string[];
    positivityTrends: string[];
  }> {
    const recentData = await this.getCorporateSentimentTrends(corporateAccountId, 30);
    
    if (recentData.length === 0) {
      return {
        overallSentiment: 50,
        departmentBreakdown: [],
        riskDepartments: [],
        positivityTrends: [],
      };
    }

    // Calculate overall sentiment
    const overallSentiment = Math.round(
      recentData.reduce((sum, data) => sum + data.sentimentScore, 0) / recentData.length
    );

    // Group by department
    const departmentMap = new Map<string, number[]>();
    recentData.forEach(data => {
      if (data.department) {
        if (!departmentMap.has(data.department)) {
          departmentMap.set(data.department, []);
        }
        departmentMap.get(data.department)!.push(data.sentimentScore);
      }
    });

    // Calculate department breakdown
    const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, scores]) => ({
      department,
      sentimentScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    }));

    // Identify risk departments (below 40)
    const riskDepartments = departmentBreakdown
      .filter(dept => dept.sentimentScore < 40)
      .map(dept => dept.department);

    // Identify positive trends (above 70)
    const positivityTrends = departmentBreakdown
      .filter(dept => dept.sentimentScore > 70)
      .map(dept => dept.department);

    return {
      overallSentiment,
      departmentBreakdown,
      riskDepartments,
      positivityTrends,
    };
  }

  // SCHOOL-SPECIFIC FUNCTIONALITY
  
  // Parent account management (COPPA compliance)
  async createParentAccount(parent: InsertParentAccount): Promise<ParentAccount> {
    const [newParent] = await db.insert(parentAccounts).values(parent).returning();
    return newParent;
  }

  async getParentAccountByEmail(email: string): Promise<ParentAccount | undefined> {
    const [parent] = await db.select().from(parentAccounts).where(eq(parentAccounts.parentEmail, email));
    return parent;
  }

  async verifyParentAccount(parentId: string): Promise<ParentAccount | undefined> {
    const [parent] = await db
      .update(parentAccounts)
      .set({ isVerified: 1, verificationCode: null })
      .where(eq(parentAccounts.id, parentId))
      .returning();
    return parent;
  }

  // Student-parent linking (COPPA compliance)
  async linkStudentToParent(link: InsertStudentParentLink): Promise<StudentParentLink> {
    const [newLink] = await db.insert(studentParentLinks).values(link).returning();
    return newLink;
  }

  async getParentsForStudent(studentUserId: string): Promise<ParentAccount[]> {
    return await db.select({
      id: parentAccounts.id,
      parentEmail: parentAccounts.parentEmail,
      parentName: parentAccounts.parentName,
      phoneNumber: parentAccounts.phoneNumber,
      preferredContact: parentAccounts.preferredContact,
      isVerified: parentAccounts.isVerified,
      verificationCode: parentAccounts.verificationCode,
      consentGiven: parentAccounts.consentGiven,
      consentDate: parentAccounts.consentDate,
      notificationsEnabled: parentAccounts.notificationsEnabled,
      createdAt: parentAccounts.createdAt,
    })
    .from(parentAccounts)
    .innerJoin(studentParentLinks, eq(parentAccounts.id, studentParentLinks.parentAccountId))
    .where(eq(studentParentLinks.studentUserId, studentUserId));
  }

  // SEL Standards management
  async createSelStandard(standard: InsertSelStandard): Promise<SelStandard> {
    const [newStandard] = await db.insert(selStandards).values(standard).returning();
    return newStandard;
  }

  async getSelStandardsByGrade(gradeLevel: string): Promise<SelStandard[]> {
    return await db.select()
      .from(selStandards)
      .where(and(
        eq(selStandards.gradeLevel, gradeLevel),
        eq(selStandards.isActive, 1)
      ))
      .orderBy(selStandards.competencyArea, selStandards.standardCode);
  }

  // Parent notifications
  async createParentNotification(notification: InsertParentNotification): Promise<ParentNotification> {
    const [newNotification] = await db.insert(parentNotifications).values(notification).returning();
    return newNotification;
  }

  async getParentNotifications(parentAccountId: string, limit: number = 20): Promise<ParentNotification[]> {
    return await db.select()
      .from(parentNotifications)
      .where(eq(parentNotifications.parentAccountId, parentAccountId))
      .orderBy(desc(parentNotifications.createdAt))
      .limit(limit);
  }

  // School content reporting and safety
  async createSchoolContentReport(report: InsertSchoolContentReport): Promise<SchoolContentReport> {
    const [newReport] = await db.insert(schoolContentReports).values(report).returning();
    return newReport;
  }

  async getSchoolContentReports(corporateAccountId: string, status?: string): Promise<SchoolContentReport[]> {
    let query = db.select()
      .from(schoolContentReports)
      .where(eq(schoolContentReports.corporateAccountId, corporateAccountId));

    if (status) {
      query = query.where(and(
        eq(schoolContentReports.corporateAccountId, corporateAccountId),
        eq(schoolContentReports.status, status)
      ));
    }

    return await query.orderBy(desc(schoolContentReports.createdAt));
  }

  // Education subscription plan initialization
  async initializeEducationSubscriptionPlans(): Promise<void> {
    try {
      // Check if education plans already exist
      const existingPlans = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.planType, 'education'));

      if (existingPlans.length > 0) {
        console.log('Education subscription plans already exist, skipping initialization');
        return;
      }

      const educationPlans = [
        {
          planName: 'Education Basic',
          planType: 'education',
          monthlyPrice: 0, // Free for basic schools
          yearlyPrice: 0,
          features: [
            'basic_posting',
            'view_feed',
            'basic_filters',
            'classroom_assignments',
            'basic_parent_reports',
            'content_moderation',
            'student_safety_features'
          ],
          limits: {
            postsPerMonth: 1000,
            studentsPerClass: 35,
            classrooms: 10
          },
          isActive: 1,
          sortOrder: 10
        },
        {
          planName: 'Education Standard',
          planType: 'education',
          monthlyPrice: 300, // $3/month for 100 students
          yearlyPrice: 3000, // $30/year (2 months free)
          features: [
            'unlimited_posting',
            'advanced_filters',
            'sel_standards_tracking',
            'parent_engagement_portal',
            'weekly_parent_reports',
            'teacher_analytics',
            'anti_bullying_monitoring',
            'content_moderation',
            'student_safety_features'
          ],
          limits: {
            postsPerMonth: -1, // unlimited
            studentsPerClass: 35,
            classrooms: 50
          },
          isActive: 1,
          sortOrder: 11
        },
        {
          planName: 'Education Premium',
          planType: 'education',
          monthlyPrice: 800, // $8/month for 100 students  
          yearlyPrice: 8000, // $80/year (2 months free)
          features: [
            'unlimited_posting',
            'advanced_filters',
            'sel_standards_tracking',
            'parent_engagement_portal',
            'real_time_parent_notifications',
            'teacher_analytics',
            'principal_dashboard',
            'ai_wellness_insights',
            'predictive_student_support',
            'anti_bullying_monitoring',
            'content_moderation',
            'student_safety_features',
            'district_level_analytics',
            'compliance_reporting'
          ],
          limits: {
            postsPerMonth: -1, // unlimited
            studentsPerClass: -1, // unlimited
            classrooms: -1 // unlimited
          },
          isActive: 1,
          sortOrder: 12
        }
      ];

      for (const plan of educationPlans) {
        await db.insert(subscriptionPlans).values(plan);
      }

      console.log('✅ Education subscription plans initialized successfully');

    } catch (error: any) {
      console.error('Failed to initialize education subscription plans:', error.message);
      throw error;
    }
  }

  // SCHOOL ADMINISTRATOR MANAGEMENT
  async createSchoolAdministrator(admin: InsertSchoolAdministrator): Promise<SchoolAdministrator> {
    const [newAdmin] = await db.insert(schoolAdministrators).values(admin).returning();
    return newAdmin;
  }

  async getSchoolAdministrator(id: string): Promise<SchoolAdministrator | undefined> {
    const [admin] = await db.select()
      .from(schoolAdministrators)
      .where(eq(schoolAdministrators.id, id));
    return admin || undefined;
  }

  async getAdministratorsBySchool(schoolId: string): Promise<SchoolAdministrator[]> {
    return await db.select()
      .from(schoolAdministrators)
      .where(and(
        eq(schoolAdministrators.schoolId, schoolId),
        eq(schoolAdministrators.isActive, 1)
      ))
      .orderBy(schoolAdministrators.role);
  }

  async getAdministratorsByDistrict(districtId: string): Promise<SchoolAdministrator[]> {
    return await db.select()
      .from(schoolAdministrators)
      .where(and(
        eq(schoolAdministrators.districtId, districtId),
        eq(schoolAdministrators.isActive, 1)
      ))
      .orderBy(schoolAdministrators.role, schoolAdministrators.schoolId);
  }

  async updateAdministratorPermissions(id: string, permissions: string[]): Promise<SchoolAdministrator | undefined> {
    const [updatedAdmin] = await db.update(schoolAdministrators)
      .set({ 
        permissions: permissions,
        updatedAt: new Date()
      })
      .where(eq(schoolAdministrators.id, id))
      .returning();
    return updatedAdmin || undefined;
  }

  // GOOGLE CLASSROOM INTEGRATION
  async createGoogleClassroomIntegration(integration: InsertGoogleClassroomIntegration): Promise<GoogleClassroomIntegration> {
    const [newIntegration] = await db.insert(googleClassroomIntegrations).values(integration).returning();
    return newIntegration;
  }

  async getGoogleClassroomIntegrations(schoolId: string): Promise<GoogleClassroomIntegration[]> {
    return await db.select()
      .from(googleClassroomIntegrations)
      .where(and(
        eq(googleClassroomIntegrations.schoolId, schoolId),
        eq(googleClassroomIntegrations.syncEnabled, 1)
      ))
      .orderBy(googleClassroomIntegrations.courseName);
  }

  async getGoogleIntegrationByTeacher(teacherUserId: string): Promise<GoogleClassroomIntegration[]> {
    return await db.select()
      .from(googleClassroomIntegrations)
      .where(eq(googleClassroomIntegrations.teacherUserId, teacherUserId))
      .orderBy(googleClassroomIntegrations.courseName);
  }

  async updateGoogleIntegrationTokens(id: string, accessToken: string, refreshToken: string): Promise<GoogleClassroomIntegration | undefined> {
    const [updatedIntegration] = await db.update(googleClassroomIntegrations)
      .set({ 
        accessToken,
        refreshToken,
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(googleClassroomIntegrations.id, id))
      .returning();
    return updatedIntegration || undefined;
  }

  async syncGoogleClassroomStudents(integrationId: string, studentCount: number): Promise<void> {
    await db.update(googleClassroomIntegrations)
      .set({ 
        studentCount,
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(googleClassroomIntegrations.id, integrationId));
  }
  // ========== REVOLUTIONARY FEATURES IMPLEMENTATION ==========
  
  // REVOLUTIONARY #1: AI-Powered Anonymous Conflict Resolution
  async createConflictReport(report: any): Promise<void> {
    await db.insert(conflictReports).values(report);
  }

  async getConflictReports(schoolId: string): Promise<any[]> {
    return await db.select().from(conflictReports)
      .where(eq(conflictReports.schoolId, schoolId))
      .orderBy(desc(conflictReports.createdAt));
  }

  async createConflictResolution(resolution: any): Promise<void> {
    await db.insert(conflictResolutions).values(resolution);
  }

  // REVOLUTIONARY #2: Predictive Bullying Prevention Analytics
  async createBullyingPrediction(prediction: any): Promise<void> {
    await db.insert(bullyingPredictions).values(prediction);
  }

  async getBullyingPredictions(schoolId: string): Promise<any[]> {
    return await db.select().from(bullyingPredictions)
      .where(eq(bullyingPredictions.schoolId, schoolId))
      .orderBy(desc(bullyingPredictions.createdAt));
  }

  // REVOLUTIONARY #3: Cross-School Anonymous Kindness Exchange
  async createKindnessExchange(exchange: any): Promise<void> {
    await db.insert(kindnessExchanges).values(exchange);
  }

  async getKindnessExchanges(schoolId: string): Promise<any[]> {
    return await db.select().from(kindnessExchanges)
      .where(or(
        eq(kindnessExchanges.senderSchoolId, schoolId),
        eq(kindnessExchanges.recipientSchoolId, schoolId)
      ))
      .orderBy(desc(kindnessExchanges.createdAt));
  }

  async getAllKindnessExchanges(): Promise<any[]> {
    return await db.select().from(kindnessExchanges)
      .orderBy(desc(kindnessExchanges.createdAt));
  }

  // Support Circle operations - Anonymous peer support for grades 6-8
  async getSupportPosts(filters?: { schoolId?: string; category?: string; gradeLevel?: string; }): Promise<SupportPost[]> {
    let query = db.select().from(supportPosts);
    
    const conditions = [];
    if (filters?.schoolId) {
      conditions.push(eq(supportPosts.schoolId, filters.schoolId));
    }
    if (filters?.category) {
      conditions.push(eq(supportPosts.category, filters.category));
    }
    if (filters?.gradeLevel) {
      conditions.push(eq(supportPosts.gradeLevel, filters.gradeLevel));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(supportPosts.createdAt)).limit(50);
  }

  async createSupportPost(post: InsertSupportPost): Promise<SupportPost> {
    // Crisis detection algorithm
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself', 'cut myself',
      'abuse', 'abused', 'hitting me', 'touching me', 'unsafe at home',
      'drugs', 'drinking', 'high', 'pills', 'overdose',
      'can\'t take it', 'hopeless', 'worthless', 'nobody cares', 'hate myself',
      'bullying', 'bullied', 'threatening me', 'scared to go to school'
    ];

    const content = post.content.toLowerCase();
    const detectedKeywords = crisisKeywords.filter(keyword => content.includes(keyword));
    const isCrisis = detectedKeywords.length > 0;
    const crisisScore = Math.min(detectedKeywords.length * 25, 100); // Max 100

    const urgencyLevel = crisisScore >= 75 ? 'critical' : 
                        crisisScore >= 50 ? 'high' : 
                        crisisScore >= 25 ? 'medium' : 'low';

    const [newPost] = await db.insert(supportPosts).values({
      ...post,
      isCrisis: isCrisis ? 1 : 0,
      crisisKeywords: detectedKeywords.length > 0 ? detectedKeywords : null,
      crisisScore,
      urgencyLevel,
      flaggedAt: isCrisis ? new Date() : null,
    }).returning();

    return newPost;
  }

  async heartSupportPost(postId: string): Promise<SupportPost> {
    await db.update(supportPosts)
      .set({ 
        heartsCount: sql`${supportPosts.heartsCount} + 1`,
        viewCount: sql`${supportPosts.viewCount} + 1`
      })
      .where(eq(supportPosts.id, postId));

    const [updatedPost] = await db.select().from(supportPosts).where(eq(supportPosts.id, postId));
    return updatedPost;
  }

  async getSupportResponses(postId: string): Promise<SupportResponse[]> {
    return db.select().from(supportResponses)
      .where(eq(supportResponses.supportPostId, postId))
      .orderBy(desc(supportResponses.createdAt));
  }

  async createSupportResponse(response: InsertSupportResponse): Promise<SupportResponse> {
    const [newResponse] = await db.insert(supportResponses).values(response).returning();

    // Update the support post to show it has a response
    await db.update(supportPosts)
      .set({ 
        hasResponse: 1,
        responseCount: sql`${supportPosts.responseCount} + 1`,
        lastResponseAt: new Date(),
        assignedCounselorId: response.counselorId,
      })
      .where(eq(supportPosts.id, response.supportPostId));

    return newResponse;
  }

  async createCrisisEscalation(escalation: InsertCrisisEscalation): Promise<CrisisEscalation> {
    const [newEscalation] = await db.insert(crisisEscalations).values(escalation).returning();
    return newEscalation;
  }

  async getCrisisEscalations(filters?: { status?: string; }): Promise<CrisisEscalation[]> {
    let query = db.select().from(crisisEscalations);
    
    if (filters?.status) {
      query = query.where(eq(crisisEscalations.status, filters.status)) as any;
    }

    return query.orderBy(desc(crisisEscalations.escalatedAt));
  }

  async getLicensedCounselors(filters?: { schoolId?: string; isActive?: boolean; }): Promise<LicensedCounselor[]> {
    let query = db.select().from(licensedCounselors);
    
    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(licensedCounselors.isActive, filters.isActive ? 1 : 0));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(licensedCounselors.displayName);
  }

  // Daily wellness check-in operations - Proactive mental health monitoring
  async createWellnessCheckIn(checkIn: InsertWellnessCheckIn): Promise<WellnessCheckIn> {
    const [newCheckIn] = await db.insert(wellnessCheckIns).values({
      ...checkIn,
      triggeredByNotification: 1,
      notificationTime: new Date(),
    }).returning();

    // Generate wellness trend analytics if this is a concerning score
    if (checkIn.moodScore <= 2 || (checkIn.stressLevel && checkIn.stressLevel >= 4)) {
      await this.updateWellnessTrends(checkIn.schoolId, checkIn.gradeLevel);
    }

    return newCheckIn;
  }

  async getWellnessCheckIns(filters?: { schoolId?: string; gradeLevel?: string; dateRange?: { start: Date; end: Date; }; }): Promise<WellnessCheckIn[]> {
    let query = db.select().from(wellnessCheckIns);
    
    const conditions = [];
    if (filters?.schoolId) {
      conditions.push(eq(wellnessCheckIns.schoolId, filters.schoolId));
    }
    if (filters?.gradeLevel) {
      conditions.push(eq(wellnessCheckIns.gradeLevel, filters.gradeLevel));
    }
    if (filters?.dateRange) {
      conditions.push(gte(wellnessCheckIns.checkInDate, filters.dateRange.start));
      conditions.push(eq(wellnessCheckIns.checkInDate, filters.dateRange.end));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(wellnessCheckIns.checkInDate)).limit(100);
  }

  async getWellnessTrends(schoolId: string, gradeLevel?: string): Promise<WellnessTrend[]> {
    let query = db.select().from(wellnessTrends);
    
    const conditions = [eq(wellnessTrends.schoolId, schoolId)];
    if (gradeLevel) {
      conditions.push(eq(wellnessTrends.gradeLevel, gradeLevel));
    }

    return query.where(and(...conditions)).orderBy(desc(wellnessTrends.analysisDate));
  }

  async subscribeToPushNotifications(subscription: InsertPushSubscription): Promise<PushSubscription> {
    // Check if subscription already exists for this device
    const existing = await db.select().from(pushSubscriptions)
      .where(eq(pushSubscriptions.deviceId, subscription.deviceId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      const [updated] = await db.update(pushSubscriptions)
        .set({
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          isActive: 1,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.deviceId, subscription.deviceId))
        .returning();
      return updated;
    } else {
      // Create new subscription
      const [newSubscription] = await db.insert(pushSubscriptions).values(subscription).returning();
      return newSubscription;
    }
  }

  async getPushSubscriptions(schoolId: string, gradeLevel?: string): Promise<PushSubscription[]> {
    let query = db.select().from(pushSubscriptions);
    
    const conditions = [
      eq(pushSubscriptions.schoolId, schoolId),
      eq(pushSubscriptions.isActive, 1)
    ];
    if (gradeLevel) {
      conditions.push(eq(pushSubscriptions.gradeLevel, gradeLevel));
    }

    return query.where(and(...conditions));
  }

  // Helper method to update wellness trends for analytics
  private async updateWellnessTrends(schoolId: string, gradeLevel: string): Promise<void> {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    
    // Get this week's check-ins for the grade level
    const weeklyCheckIns = await db.select().from(wellnessCheckIns)
      .where(and(
        eq(wellnessCheckIns.schoolId, schoolId),
        eq(wellnessCheckIns.gradeLevel, gradeLevel),
        gte(wellnessCheckIns.checkInDate, startOfWeek)
      ));

    if (weeklyCheckIns.length === 0) return;

    const totalCheckIns = weeklyCheckIns.length;
    const averageMoodScore = weeklyCheckIns.reduce((sum, c) => sum + c.moodScore, 0) / totalCheckIns;
    const averageStressLevel = weeklyCheckIns.reduce((sum, c) => sum + (c.stressLevel || 0), 0) / totalCheckIns;
    const criticalConcerns = weeklyCheckIns.filter(c => c.moodScore <= 2).length;
    const positiveReports = weeklyCheckIns.filter(c => c.moodScore >= 4).length;

    const alertLevel = criticalConcerns >= 3 ? 'critical' :
                     criticalConcerns >= 2 ? 'concern' :
                     averageMoodScore < 2.5 ? 'watch' : 'normal';

    const recommendations = alertLevel !== 'normal' ? [
      'Consider individual check-ins with students showing concerning patterns',
      'Review current stress factors and academic workload',
      'Increase positive peer interaction activities',
      'Schedule counselor availability for support'
    ] : [];

    // Insert or update trend record
    await db.insert(wellnessTrends).values({
      schoolId,
      gradeLevel,
      analysisDate: today,
      totalCheckIns,
      averageMoodScore: averageMoodScore.toString(),
      averageStressLevel: averageStressLevel.toString(),
      criticalConcerns,
      positiveReports,
      trendDirection: 'stable', // Could be calculated based on historical data
      alertLevel,
      recommendations,
    }).onConflictDoUpdate({
      target: [wellnessTrends.schoolId, wellnessTrends.gradeLevel, wellnessTrends.analysisDate],
      set: {
        totalCheckIns,
        averageMoodScore: averageMoodScore.toString(),
        averageStressLevel: averageStressLevel.toString(),
        criticalConcerns,
        positiveReports,
        alertLevel,
        recommendations,
        generatedAt: new Date(),
      }
    });
  }
}

export const storage = new DatabaseStorage();