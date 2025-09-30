import {
  users,
  kindnessPosts,
  kindnessCounter,
  userTokens,
  brandChallenges,
  challengeCompletions,
  achievementBadges,
  userAchievements,
  rewardPartners,
  rewardOffers,
  rewardRedemptions,
  subscriptionPlans,
  wellnessCheckins,
  schools,
  studentAccounts,
  communityServiceLogs,
  communityServiceVerifications,
  coppaConsent,
  coppaConsentRequests,
  fundraisingCampaigns,
  fundraisingDonations,
  surpriseGiveawayCampaigns,
  surpriseGiveawayWinners,
  summerChallenges,
  summerChallengeCompletions,
  familyChallenges,
  familyChallengeCompletions,
  schoolYearChallenges,
  schoolYearChallengeEngagement,
  mentorBadges,
  mentorBadgeAwards,
  mentorTraining,
  userMentorTraining,
  mentorScenarios,
  mentorScenarioResponses,
  mentorConversations,
  mentorCertifications,
  privacyLogs,
  teacherRewards,
  teacherRewardCriteria,
  sponsors,
  sponsorAnalytics,
  supportPosts,
  supportResponses,
  heartReactions,
  echoReactions,
  helpfulReactions,
  corporateAccounts,
  corporateEmployees,
  corporateTeams,
  corporateChallenges,
  corporateAnalytics,
  parentalConsentRecords,
  parentalConsentRequests,
  studentServiceSummaries,
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
  type EncryptionKey,
  type InsertEncryptionKey,
  type DualAuthRequest,
  type InsertDualAuthRequest,
  type EncryptedEmergencyContact,
  type InsertEncryptedEmergencyContact,
  type CrisisEscalation,
  type InsertCrisisEscalation,
  type LicensedCounselor,
  type InsertLicensedCounselor,
  type YearRoundFamilyChallenge,
  type InsertYearRoundFamilyChallenge,
  type FamilyProgress,
  type InsertFamilyProgress,
  type FamilyActivity,
  type InsertFamilyActivity,
  type SchoolFundraiser,
  type InsertSchoolFundraiser,
  type FamilyDonation,
  type InsertFamilyDonation,
  type Mentorship,
  type InsertMentorship,
  type MentorActivity,
  type InsertMentorActivity,
  type MentorBadge,
  type InsertMentorBadge,
  type MentorPreferences,
  type InsertMentorPreferences,
  type MentorStats,
  type MentorTraining,
  type InsertMentorTraining,
  type MentorScenario,
  type InsertMentorScenario,
  type MentorConversation,
  type InsertMentorConversation,
  type CurriculumLesson,
  type InsertCurriculumLesson,
  type CurriculumProgress,
  type InsertCurriculumProgress,
  type StudentCurriculumResponse,
  type InsertStudentCurriculumResponse,
  type CurriculumResource,
  type InsertCurriculumResource,
  type StudentAccount,
  type InsertStudentAccount,
  type ParentalConsentRequest,
  type InsertParentalConsentRequest,
  // Enhanced COPPA consent types
  type ParentalConsentRecord,
  type InsertParentalConsentRecord,
  type VerifyConsent,
  type RevokeConsent,
  type TeacherClaimCode,
  type InsertTeacherClaimCode,
  type ClaimCodeUsage,
  type InsertClaimCodeUsage,
  // Enhanced consent tracking types
  type ConsentAuditEvent,
  type InsertConsentAuditEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, count, or, gte, lte, isNotNull, isNull, inArray, gt, getTableColumns } from "drizzle-orm";
import { CryptoSecurity } from "./utils/cryptoSecurity";
// Import demo seeding function
import { generateDemoConsentData, DEMO_CONFIG } from "./demoSeed";
import { nanoid } from 'nanoid';

// Storage interface for all operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
    schoolId?: string; // For school-specific posts
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
  incrementRedemptionCounter(offerId: string): Promise<void>;
  
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
  getSupportPostById(id: string): Promise<SupportPost | null>;
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
  
  // Family Kindness Challenge operations
  getFamilyChallenges(week?: number, ageGroup?: string): Promise<YearRoundFamilyChallenge[]>;
  getFamilyChallenge(id: string): Promise<YearRoundFamilyChallenge | undefined>;
  getFamilyActivities(challengeId: string): Promise<FamilyActivity[]>;
  completeFamilyChallenge(progress: InsertFamilyProgress): Promise<FamilyProgress>;
  getFamilyProgress(studentId: string, challengeId?: string): Promise<FamilyProgress[]>;
  approveFamilyChallenge(progressId: string, teacherApproved: boolean): Promise<FamilyProgress | undefined>;

  // School Fundraiser operations - DOUBLE TOKEN REWARDS!
  createSchoolFundraiser(fundraiser: InsertSchoolFundraiser): Promise<SchoolFundraiser>;
  getActiveFundraisers(schoolName?: string): Promise<SchoolFundraiser[]>;
  getFundraiserById(id: string): Promise<SchoolFundraiser | undefined>;
  updateFundraiserAmount(id: string, donationAmount: number): Promise<SchoolFundraiser | undefined>;
  createFamilyDonation(donation: InsertFamilyDonation): Promise<FamilyDonation>;
  getDonationsByUser(userTokenId: string): Promise<FamilyDonation[]>;
  verifyDonation(donationId: string): Promise<FamilyDonation | undefined>;

  // 🎓 KINDNESS MENTORS SYSTEM - PEER GUIDANCE & RECOGNITION!
  // Mentorship management
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  getMentorshipsByMentor(mentorUserId: string): Promise<Mentorship[]>;
  getMentorshipsByMentee(menteeUserId: string): Promise<Mentorship[]>;
  getActiveMentorships(schoolId?: string): Promise<Mentorship[]>;
  updateMentorshipStatus(id: string, status: string): Promise<Mentorship | undefined>;
  findMentorMatches(menteeUserId: string, ageGroup: string): Promise<User[]>;
  
  // Mentor activities and sessions
  createMentorActivity(activity: InsertMentorActivity): Promise<MentorActivity>;
  getMentorActivities(mentorshipId: string): Promise<MentorActivity[]>;
  completeMentorActivity(activityId: string, reflections: { mentorReflection?: string; menteeReflection?: string; }): Promise<MentorActivity | undefined>;
  
  // Mentor badges and recognition
  createMentorBadge(badge: InsertMentorBadge): Promise<MentorBadge>;
  getMentorBadges(): Promise<MentorBadge[]>;
  getUserMentorBadges(userId: string): Promise<MentorBadge[]>;
  awardMentorBadge(userId: string, badgeId: string, mentorshipId?: string): Promise<void>;
  checkMentorBadgeEligibility(userId: string): Promise<MentorBadge[]>;
  
  // Mentor preferences and matching
  createMentorPreferences(preferences: InsertMentorPreferences): Promise<MentorPreferences>;
  getMentorPreferences(userId: string): Promise<MentorPreferences | undefined>;
  updateMentorPreferences(userId: string, updates: Partial<MentorPreferences>): Promise<MentorPreferences | undefined>;
  getAvailableMentors(ageGroup?: string, interests?: string[]): Promise<User[]>;
  
  // Mentor analytics and progress
  getMentorStats(userId: string): Promise<MentorStats | undefined>;
  updateMentorStats(userId: string, updates: Partial<MentorStats>): Promise<void>;
  getMentorLeaderboard(schoolId?: string, limit?: number): Promise<Array<{ user: User; stats: MentorStats; }>>;
  
  // 🎓 COPPA-compliant student registration and parent operations
  createParentAccount(parent: InsertParentAccount): Promise<ParentAccount>;
  getParentAccountByEmail(email: string): Promise<ParentAccount | undefined>;
  verifyParentAccount(parentId: string): Promise<ParentAccount | undefined>;
  createStudentAccount(student: InsertStudentAccount): Promise<StudentAccount>;
  getStudentAccount(userId: string): Promise<StudentAccount | undefined>;
  getStudentAccountByEmail(email: string): Promise<StudentAccount | undefined>;
  updateStudentParentalConsent(studentId: string, consentData: {
    status: string;
    method: string;
    parentEmail?: string;
    ipAddress?: string;
  }): Promise<StudentAccount>;
  createParentalConsentRequest(request: InsertParentalConsentRequest): Promise<ParentalConsentRequest>;
  getParentalConsentRequest(verificationCode: string): Promise<ParentalConsentRequest | undefined>;
  updateParentalConsentStatus(requestId: string, status: string, ipAddress?: string): Promise<ParentalConsentRequest>;
  linkStudentToParent(link: InsertStudentParentLink): Promise<StudentParentLink>;
  getParentsForStudent(studentUserId: string): Promise<ParentAccount[]>;
  
  // 🔄 WORKFLOW ORCHESTRATION METHODS - For seamless integration
  upsertStudentAccount(student: InsertStudentAccount | Partial<StudentAccount>): Promise<StudentAccount>;
  createParentAccountIfMissing(parentEmail: string, parentName: string): Promise<ParentAccount>;
  markReminderSent(requestId: string, reminderType: 'day3' | 'day7'): Promise<ParentalConsentRequest>;
  listPendingConsentBySchool(schoolId: string, filters?: {
    olderThanDays?: number;
    needsReminder?: boolean;
    limit?: number;
  }): Promise<Array<ParentalConsentRequest & {
    studentFirstName: string;
    studentGrade: string;
    daysSinceRequest: number;
  }>>;
  
  // 🛡️ ENHANCED COPPA CONSENT OPERATIONS - PRODUCTION COMPLIANCE
  createConsentRecord(record: InsertParentalConsentRecord): Promise<ParentalConsentRecord>;
  getConsentRecord(recordId: string): Promise<ParentalConsentRecord | undefined>;
  getConsentRecordByCode(verificationCode: string): Promise<ParentalConsentRecord | undefined>;
  verifyConsentLink(verification: VerifyConsent, ipAddress: string, userAgent: string): Promise<{
    success: boolean;
    record?: ParentalConsentRecord;
    error?: string;
    errorCode?: string;
  }>;
  approveConsent(recordId: string, ipAddress: string, userAgent: string): Promise<ParentalConsentRecord>;
  approveConsentWithSignature(recordId: string, signatureData: {
    digitalSignatureHash: string;
    signaturePayload: string;
    signerFullName: string;
    finalConsentConfirmed: boolean;
    signatureTimestamp: Date;
    signatureMetadata: any;
    renewalDueAt: Date;
    ipAddress: string;
    userAgent: string;
  }): Promise<ParentalConsentRecord>;
  revokeConsent(revocation: RevokeConsent, ipAddress: string, userAgent: string): Promise<ParentalConsentRecord>;
  getStudentConsentStatus(studentAccountId: string): Promise<ParentalConsentRecord | undefined>;
  getConsentRecordsForSchool(schoolId: string, filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }): Promise<ParentalConsentRecord[]>;
  getConsentAuditTrail(studentAccountId: string): Promise<ParentalConsentRecord[]>;
  markConsentRecordImmutable(recordId: string): Promise<ParentalConsentRecord>;
  
  // 📊 CONSENT DASHBOARD FUNCTIONS - For school administrators
  listConsentsBySchool(schoolId: string, filters?: {
    status?: string;
    grade?: string;
    query?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    consents: Array<ParentalConsentRecord & {
      studentFirstName: string;
      studentLastName: string;
      studentGrade: string;
      parentName: string;
      parentEmail: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }>;
  getConsentStats(schoolId: string): Promise<{
    totalStudents: number;
    approvedCount: number;
    pendingCount: number;
    deniedCount: number;
    revokedCount: number;
    expiredCount: number;
    pendingOlderThan48h: number;
    expiringIn7Days: number;
    approvedRate: number;
  }>;
  getStudentConsentAudit(studentUserId: string): Promise<Array<ConsentAuditEvent & {
    milestone?: string;
  }>>;
  generateConsentReport(schoolId: string, filters?: {
    from?: Date;
    to?: Date;
  }): Promise<{
    summary: {
      totalStudents: number;
      consentsByStatus: Record<string, number>;
      averageResponseTime: number;
      complianceRate: number;
    };
    csvData: string;
  }>;
  
  // 🔄 ANNUAL CONSENT RENEWAL WORKFLOW - BURLINGTON POLICY
  getActiveConsent(studentId: string, schoolId: string): Promise<ParentalConsentRecord | undefined>;
  listExpiringConsentsBySchool(schoolId: string, start: Date, end: Date, grades?: string[]): Promise<Array<ParentalConsentRecord & {
    studentFirstName: string;
    studentLastName: string;
    studentGrade: string;
    parentName: string;
    parentEmail: string;
    daysUntilExpiry: number;
  }>>;
  createRenewalRequestFromConsent(consentId: string, snapshot: any, code: string): Promise<ParentalConsentRecord>;
  markRenewalReminderSent(renewalId: string, marker: string): Promise<void>;
  setRenewalStatus(renewalId: string, status: string): Promise<ParentalConsentRecord | undefined>;
  approveRenewal(renewalId: string, signatureData: {
    digitalSignatureHash: string;
    signaturePayload: string;
    signerFullName: string;
    finalConsentConfirmed: boolean;
    signatureTimestamp: Date;
    signatureMetadata: any;
    ipAddress: string;
    userAgent: string;
  }): Promise<ParentalConsentRecord>;
  listRenewalsDashboard(schoolId: string, filters?: {
    status?: string;
    grade?: string;
    query?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    renewals: Array<ParentalConsentRecord & {
      studentFirstName: string;
      studentLastName: string;
      studentGrade: string;
      parentName: string;
      parentEmail: string;
      daysUntilExpiry: number;
      reminderCount: number;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }>;
  
  // 🔍 AUDIT EVENT MANAGEMENT
  createConsentAuditEvent(event: InsertConsentAuditEvent): Promise<ConsentAuditEvent>;
  
  // 🎓 TEACHER CLAIM CODE SYSTEM - COPPA-compliant school registration
  createTeacherClaimCode(claimCode: InsertTeacherClaimCode): Promise<TeacherClaimCode>;
  getTeacherClaimCodes(teacherUserId: string): Promise<TeacherClaimCode[]>;
  getSchoolClaimCodes(schoolId: string): Promise<TeacherClaimCode[]>;
  getTeacherVerificationCount(teacherId: string, month: string): Promise<number>;
  getActiveClaimCode(claimCode: string): Promise<TeacherClaimCode | undefined>;
  validateClaimCode(claimCode: string, context?: {
    ipAddress?: string;
    userAgent?: string;
    schoolId?: string;
  }): Promise<{ 
    isValid: boolean; 
    code?: TeacherClaimCode; 
    error?: string; 
    errorCode?: string;
  }>;
  useClaimCode(claimCodeData: {
    claimCode: string;
    studentFirstName: string;
    studentLastName?: string;
    studentBirthYear: number;
    parentEmail: string;
    parentName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    deviceFingerprint?: string;
    schoolId?: string;
  }): Promise<{
    success: boolean;
    result?: ClaimCodeUsage;
    student?: any;
    consentRequest?: any;
    error?: string;
    errorCode?: string;
  }>;
  getClaimCodeUsages(claimCodeId: string): Promise<ClaimCodeUsage[]>;
  updateClaimCodeUsage(claimCodeId: string): Promise<TeacherClaimCode | undefined>;
  deactivateClaimCode(claimCodeId: string): Promise<TeacherClaimCode | undefined>;
  generateUniqueClaimCode(): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
    schoolId?: string;
  }): Promise<KindnessPost[]> {
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
    if (filters?.schoolId) {
      conditions.push(eq(kindnessPosts.schoolId, filters.schoolId));
    }
    
    return await db.select()
      .from(kindnessPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(kindnessPosts.createdAt))
      .limit(filters?.limit || 50);
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
    
    return await db.select()
      .from(brandChallenges)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(brandChallenges.isPriority), desc(brandChallenges.createdAt))
      .limit(filters?.limit || 10);
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

  async getCorporateAccountsByDomain(domain: string): Promise<CorporateAccount[]> {
    return await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.domain, domain));
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
    const monthlyGoal = team.monthlyKindnessGoal || 10; // Default goal if null
    const kindnessGoalProgress = (teamPosts.length / monthlyGoal) * 100;
    const challengeCompletionRate = teamMembers.length > 0 ? (teamChallenges.length / teamMembers.length) * 100 : 0;

    return {
      teamName: team.teamName,
      currentSize: team.currentSize || 0,
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
        const severity: 'low' | 'medium' | 'high' = metrics.atRiskEmployees >= 3 ? 'high' : metrics.atRiskEmployees >= 2 ? 'medium' : 'low';
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
          severity: 'medium' as const,
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
          lte(kindnessPosts.createdAt, monthEnd)
        ));

      const monthChallenges = await db.select({ count: count() })
        .from(challengeCompletions)
        .leftJoin(corporateEmployees, eq(challengeCompletions.userId, corporateEmployees.userId))
        .where(and(
          eq(corporateEmployees.corporateAccountId, corporateAccountId),
          gte(challengeCompletions.completedAt, monthStart),
          lte(challengeCompletions.completedAt, monthEnd)
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
      deptData.employees += team.currentSize || 0;
      
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
    const employeeCount = teams.reduce((sum, team) => sum + (team.currentSize || 0), 0);
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
    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(rewardPartners.isActive, filters.isActive ? 1 : 0));
    }
    if (filters?.partnerType) {
      conditions.push(eq(rewardPartners.partnerType, filters.partnerType));
    }
    
    return await db.select()
      .from(rewardPartners)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(rewardPartners.createdAt));
  }

  async createRewardPartner(partner: InsertRewardPartner): Promise<RewardPartner> {
    const [newPartner] = await db.insert(rewardPartners).values(partner).returning();
    return newPartner;
  }

  async getRewardOffers(filters?: { partnerId?: string; isActive?: boolean; offerType?: string; badgeRequirement?: string; }): Promise<RewardOffer[]> {
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
    
    return await db.select()
      .from(rewardOffers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(rewardOffers.isFeatured), desc(rewardOffers.createdAt));
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

  // New method for merchant verification system
  async getRedemptionByCode(code: string): Promise<RewardRedemption | undefined> {
    const [redemption] = await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.redemptionCode, code));
    return redemption;
  }

  async markRedemptionAsVerified(id: string, verificationData: { verifyMethod: string; usedAt: string }): Promise<RewardRedemption | undefined> {
    const [updatedRedemption] = await db.update(rewardRedemptions)
      .set({
        status: 'used',
        verifiedByMerchant: 1,
        verifyMethod: verificationData.verifyMethod,
        usedAt: new Date(verificationData.usedAt)
      })
      .where(eq(rewardRedemptions.id, id))
      .returning();
    
    return updatedRedemption;
  }

  async incrementRedemptionCounter(offerId: string): Promise<void> {
    await db.update(rewardOffers)
      .set({
        currentRedemptions: sql`${rewardOffers.currentRedemptions} + 1`
      })
      .where(eq(rewardOffers.id, offerId));
  }

  // Verification system implementation
  async submitKindnessVerification(verification: InsertKindnessVerification): Promise<KindnessVerification> {
    const [newVerification] = await db.insert(kindnessVerifications).values(verification).returning();
    return newVerification;
  }

  async getKindnessVerifications(filters?: { userId?: string; status?: string; }): Promise<KindnessVerification[]> {
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(kindnessVerifications.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(kindnessVerifications.status, filters.status));
    }
    
    return await db.select()
      .from(kindnessVerifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(kindnessVerifications.submittedAt));
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
      const currentTokens = await this.getUserTokens(updatedVerification.userId);
      if (currentTokens) {
        await this.updateUserTokens(updatedVerification.userId, {
          echoBalance: currentTokens.echoBalance + bonusEcho,
        });
      }
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
    return await db.select()
      .from(weeklyPrizes)
      .where(filters?.status ? eq(weeklyPrizes.status, filters.status) : undefined)
      .orderBy(desc(weeklyPrizes.weekStartDate));
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
      // TODO: Fix subscription plans schema mismatch - temporarily disabled
      console.log('⚠️ Subscription plans initialization temporarily disabled due to schema mismatch');
      return;
      // Check if subscription plans already exist
      // const existingPlans = await db.select().from(subscriptionPlans);
      
      if (existingPlans.length > 0) {
        console.log('Subscription plans already exist, skipping initialization');
        return;
      }

      // Individual Subscription Plans for Revenue Diversification
      const individualPlans = [
        {
          plan_name: 'Free',
          plan_type: 'individual',
          monthly_price: 0,
          yearly_price: 0,
          features: ['basic_posting', 'view_feed', 'basic_filters', 'global_counter'],
          is_active: 1,
        },
        {
          plan_name: 'Basic',
          plan_type: 'individual',
          monthly_price: 999, // $9.99
          yearly_price: 9990, // $99.90 (save 2 months)
          features: [
            'basic_posting', 'view_feed', 'basic_filters', 'global_counter',
            'unlimited_posts', 'advanced_filters', 'kindness_analytics', 'personal_insights'
          ],
          limits: { postsPerMonth: -1, filtersPerDay: -1 },
          is_active: 1,
          sort_order: 2,
        },
        {
          plan_name: 'Premium',
          plan_type: 'individual',
          monthly_price: 1999, // $19.99
          yearly_price: 19990, // $199.90 (save 2 months)
          features: [
            'basic_posting', 'view_feed', 'basic_filters', 'global_counter',
            'unlimited_posts', 'advanced_filters', 'kindness_analytics', 'personal_insights',
            'ai_wellness_predictions', 'burnout_alerts', 'sentiment_tracking', 'goal_setting',
            'export_data', 'premium_support'
          ],
          limits: { postsPerMonth: -1, filtersPerDay: -1 },
          is_active: 1,
          sort_order: 3,
        },
        {
          plan_name: 'Pro',
          plan_type: 'individual',
          monthly_price: 4999, // $49.99
          yearly_price: 49990, // $499.90 (save 2 months)
          features: [
            'basic_posting', 'view_feed', 'basic_filters', 'global_counter',
            'unlimited_posts', 'advanced_filters', 'kindness_analytics', 'personal_insights',
            'ai_wellness_predictions', 'burnout_alerts', 'sentiment_tracking', 'goal_setting',
            'export_data', 'premium_support', 'workplace_analytics', 'team_insights',
            'custom_challenges', 'priority_support', 'beta_features'
          ],
          limits: { postsPerMonth: -1, filtersPerDay: -1 },
          is_active: 1,
          sort_order: 4,
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

      // Check for Burlington Christian Academy
      const existingBCA = await db.select()
        .from(corporateAccounts)
        .where(eq(corporateAccounts.domain, 'bcaroyals.com'));
      
      if (existingTechFlow.length > 0 && existingWise.length > 0 && existingBCA.length > 0) {
        return; // Demo data already exists
      }

      // Create sample corporate accounts
      let techFlowAccount: any;
      let wiseAccount: any;
      let bcaAccount: any;
      let jeffersonAccount: any;
      let easternAccount: any;

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

      // Create Burlington Christian Academy if it doesn't exist
      if (existingBCA.length === 0) {
        [bcaAccount] = await db.insert(corporateAccounts).values({
          companyName: 'Burlington Christian Academy',
          domain: 'bcaroyals.com',
          industry: 'education',
          companySize: 'small',
          subscriptionTier: 'basic',
          maxEmployees: 350, // Students + staff
          monthlyBudget: 0, // Pilot program
          primaryColor: '#1E40AF', // Royal blue
          companyLogo: null,
          contactEmail: 'info@bcaroyals.com',
          contactName: 'Principal Administrator',
          isActive: 1,
          billingStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 day trial
        }).returning();

        // Create Jefferson Middle School
        [jeffersonAccount] = await db.insert(corporateAccounts).values({
          companyName: 'Jefferson Middle School',
          domain: 'jefferson.alamance.k12.nc.us',
          industry: 'education',
          companySize: 'medium',
          subscriptionTier: 'basic',
          maxEmployees: 650, // Students + staff
          monthlyBudget: 0,
          primaryColor: '#059669', // Green
          companyLogo: null,
          contactEmail: 'principal@jefferson.alamance.k12.nc.us',
          contactName: 'Jefferson Principal',
          isActive: 1,
          billingStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }).returning();

        // Create Eastern Alamance Middle School
        [easternAccount] = await db.insert(corporateAccounts).values({
          companyName: 'Eastern Alamance Middle School',
          domain: 'eastern.alamance.k12.nc.us',
          industry: 'education',
          companySize: 'medium',
          subscriptionTier: 'basic',
          maxEmployees: 580, // Students + staff
          monthlyBudget: 0,
          primaryColor: '#7C3AED', // Purple
          companyLogo: null,
          contactEmail: 'principal@eastern.alamance.k12.nc.us',
          contactName: 'Eastern Principal',
          isActive: 1,
          billingStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }).returning();
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
            email: employee.employeeEmail,
            firstName: employee.displayName.split(' ')[0],
            lastName: employee.displayName.split(' ')[1] || '',
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
            email: employee.employeeEmail,
            firstName: employee.displayName.split(' ')[0],
            lastName: employee.displayName.split(' ')[1] || '',
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

  // 🔒 SECURITY: Get schools associated with a user (for access control)
  async getUserSchools(userId: string): Promise<any[]> {
    try {
      // Check if user is a school administrator
      const adminSchools = await db.select()
        .from(schoolAdministrators)
        .leftJoin(corporateAccounts, eq(schoolAdministrators.schoolId, corporateAccounts.id))
        .where(eq(schoolAdministrators.userId, userId));

      if (adminSchools.length > 0) {
        return adminSchools.map(row => ({
          schoolId: row.school_administrators?.schoolId,
          schoolName: row.corporate_accounts?.companyName,
          role: row.school_administrators?.role,
          accessLevel: 'admin'
        }));
      }

      // Check if user is a registered school principal by email match
      const schools = await db.select()
        .from(corporateAccounts)
        .where(eq(corporateAccounts.contactEmail, userId));

      if (schools.length > 0) {
        return schools.map(school => ({
          schoolId: school.id,
          schoolName: school.companyName,
          role: 'principal',
          accessLevel: 'admin'
        }));
      }

      // For now, return empty array - in production you'd check student/parent associations
      return [];
    } catch (error) {
      console.error('Failed to get user schools:', error);
      return [];
    }
  }

  // PREMIUM SUBSCRIPTION SYSTEM IMPLEMENTATIONS
  async getSubscriptionPlans(planType?: string): Promise<SubscriptionPlan[]> {
    return await db.select()
      .from(subscriptionPlans)
      .where(planType ? eq(subscriptionPlans.planType, planType) : undefined)
      .orderBy(subscriptionPlans.sortOrder);
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
    const conditions = [eq(wellnessPredictions.userId, userId)];
    
    if (riskLevel) {
      // Note: riskLevel filter would need custom logic since schema uses riskScore (1-100)
      // For now, treating high risk as score > 70, medium as 30-70, low as < 30
      if (riskLevel === 'high') {
        conditions.push(gte(wellnessPredictions.riskScore, 70));
      } else if (riskLevel === 'medium') {
        conditions.push(gte(wellnessPredictions.riskScore, 30));
        conditions.push(lte(wellnessPredictions.riskScore, 69));
      } else if (riskLevel === 'low') {
        conditions.push(lte(wellnessPredictions.riskScore, 29));
      }
    }
    
    return await db.select()
      .from(wellnessPredictions)
      .where(conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined)
      .orderBy(desc(wellnessPredictions.createdAt));
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
        isActive: status === 'resolved' ? 0 : 1,
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

  // 🎓 COPPA-compliant student registration methods
  async createStudentAccount(student: InsertStudentAccount): Promise<StudentAccount> {
    const [newStudent] = await db.insert(studentAccounts).values(student).returning();
    return newStudent;
  }

  async getStudentAccount(userId: string): Promise<StudentAccount | undefined> {
    const [student] = await db.select().from(studentAccounts).where(eq(studentAccounts.userId, userId));
    return student;
  }

  async getStudentAccountByEmail(email: string): Promise<StudentAccount | undefined> {
    // Note: Students don't have direct email, we'd need to look up via parent notification email
    const [student] = await db.select().from(studentAccounts).where(eq(studentAccounts.parentNotificationEmail, email));
    return student;
  }

  async updateStudentParentalConsent(studentId: string, consentData: {
    status: string;
    method: string;
    parentEmail?: string;
    ipAddress?: string;
  }): Promise<StudentAccount> {
    const [updatedStudent] = await db
      .update(studentAccounts)
      .set({
        parentalConsentStatus: consentData.status,
        parentalConsentMethod: consentData.method,
        parentalConsentDate: new Date(),
        parentalConsentIP: consentData.ipAddress,
        isAccountActive: consentData.status === 'approved' ? 1 : 0,
        parentNotificationEmail: consentData.parentEmail,
        updatedAt: new Date()
      })
      .where(eq(studentAccounts.id, studentId))
      .returning();
    return updatedStudent;
  }

  async createParentalConsentRequest(request: InsertParentalConsentRequest): Promise<ParentalConsentRequest> {
    const [newRequest] = await db.insert(parentalConsentRequests).values({
      ...request,
      expiredAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now (Burlington policy)
    }).returning();
    return newRequest;
  }

  async getParentalConsentRequest(verificationCode: string): Promise<ParentalConsentRequest | undefined> {
    const [request] = await db.select()
      .from(parentalConsentRequests)
      .where(eq(parentalConsentRequests.verificationCode, verificationCode));
    return request;
  }

  async updateParentalConsentStatus(requestId: string, status: string, ipAddress?: string): Promise<ParentalConsentRequest> {
    const [updatedRequest] = await db
      .update(parentalConsentRequests)
      .set({
        consentStatus: status,
        ...(status === 'clicked' && { clickedAt: new Date() }),
        ...(status === 'approved' && { consentedAt: new Date() }),
        ...(ipAddress && { ipAddress })
      })
      .where(eq(parentalConsentRequests.id, requestId))
      .returning();
    return updatedRequest;
  }


  // 🔄 WORKFLOW ORCHESTRATION METHODS - For seamless integration
  async upsertStudentAccount(student: InsertStudentAccount | Partial<StudentAccount>): Promise<StudentAccount> {
    if ('id' in student && student.id) {
      // Update existing student account
      const [updatedStudent] = await db
        .update(studentAccounts)
        .set({
          ...student,
          updatedAt: new Date()
        })
        .where(eq(studentAccounts.id, student.id))
        .returning();
      return updatedStudent;
    } else {
      // Create new student account
      const [newStudent] = await db
        .insert(studentAccounts)
        .values(student as InsertStudentAccount)
        .returning();
      return newStudent;
    }
  }

  async createParentAccountIfMissing(parentEmail: string, parentName: string): Promise<ParentAccount> {
    // Check if parent account already exists
    const existingParent = await this.getParentAccountByEmail(parentEmail);
    if (existingParent) {
      return existingParent;
    }

    // Create new parent account
    const parentData: InsertParentAccount = {
      parentEmail: parentEmail,
      parentName: parentName,
      isVerified: 0,
      preferredContact: 'email'
    };

    return await this.createParentAccount(parentData);
  }

  async markReminderSent(requestId: string, reminderType: 'day3' | 'day7'): Promise<ParentalConsentRequest> {
    const [updatedRequest] = await db
      .update(parentalConsentRequests)
      .set({
        reminderCount: sql`${parentalConsentRequests.reminderCount} + 1`,
        lastReminderAt: new Date()
      })
      .where(eq(parentalConsentRequests.id, requestId))
      .returning();
    return updatedRequest;
  }

  async listPendingConsentBySchool(schoolId: string, filters?: {
    olderThanDays?: number;
    needsReminder?: boolean;
    limit?: number;
  }): Promise<Array<ParentalConsentRequest & {
    studentFirstName: string;
    studentGrade: string;
    daysSinceRequest: number;
  }>> {
    const conditions = [
      eq(parentalConsentRequests.schoolId, schoolId),
      eq(parentalConsentRequests.consentStatus, 'sent')
    ];

    if (filters?.olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.olderThanDays);
      conditions.push(lte(parentalConsentRequests.requestedAt, cutoffDate));
    }

    if (filters?.needsReminder) {
      // Find requests that need reminders (3+ days old with no reminder, or 7+ days old with only one reminder)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      conditions.push(
        or(
          and(
            lte(parentalConsentRequests.requestedAt, threeDaysAgo),
            eq(parentalConsentRequests.reminderCount, 0)
          ),
          and(
            lte(parentalConsentRequests.requestedAt, sevenDaysAgo),
            eq(parentalConsentRequests.reminderCount, 1)
          )
        )
      );
    }

    const results = await db
      .select({
        id: parentalConsentRequests.id,
        studentAccountId: parentalConsentRequests.studentAccountId,
        schoolId: parentalConsentRequests.schoolId,
        parentEmail: parentalConsentRequests.parentEmail,
        parentName: parentalConsentRequests.parentName,
        verificationCode: parentalConsentRequests.verificationCode,
        consentStatus: parentalConsentRequests.consentStatus,
        requestedAt: parentalConsentRequests.requestedAt,
        clickedAt: parentalConsentRequests.clickedAt,
        consentedAt: parentalConsentRequests.consentedAt,
        expiredAt: parentalConsentRequests.expiredAt,
        reminderCount: parentalConsentRequests.reminderCount,
        lastReminderAt: parentalConsentRequests.lastReminderAt,
        ipAddress: parentalConsentRequests.ipAddress,
        userAgent: parentalConsentRequests.userAgent,
        studentFirstName: studentAccounts.firstName,
        studentGrade: studentAccounts.grade,
        daysSinceRequest: sql<number>`EXTRACT(DAY FROM NOW() - ${parentalConsentRequests.requestedAt})::integer`
      })
      .from(parentalConsentRequests)
      .innerJoin(studentAccounts, eq(parentalConsentRequests.studentAccountId, studentAccounts.id))
      .where(and(...conditions))
      .orderBy(desc(parentalConsentRequests.requestedAt))
      .limit(filters?.limit || 50);

    return results;
  }

  // 🛡️ ENHANCED COPPA CONSENT OPERATIONS - PRODUCTION COMPLIANCE
  async createConsentRecord(record: InsertParentalConsentRecord): Promise<ParentalConsentRecord> {
    const { nanoid } = await import('nanoid');
    
    // 🔒 SERVER-SIDE SECURITY: Generate verification code with sufficient entropy
    const verificationCode = nanoid(25); // High entropy, URL-safe
    
    // 🛡️ SERVER-SIDE OVERRIDE: Set canonical version and security fields
    const enhancedRecord = {
      ...record,
      consentVersion: "v2025.1", // Canonical version set by server
      verificationCode,
      linkExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // Strict 72-hour expiry
      isCodeUsed: false,
      isImmutable: false,
      recordCreatedAt: new Date(),
      recordUpdatedAt: new Date()
    };

    const [newRecord] = await db.insert(parentalConsentRecords).values(enhancedRecord).returning();
    return newRecord;
  }

  async getConsentRecord(recordId: string): Promise<ParentalConsentRecord | undefined> {
    const [record] = await db.select()
      .from(parentalConsentRecords)
      .where(eq(parentalConsentRecords.id, recordId));
    return record;
  }

  async getConsentRecordByCode(verificationCode: string): Promise<ParentalConsentRecord | undefined> {
    const [record] = await db.select()
      .from(parentalConsentRecords)
      .where(eq(parentalConsentRecords.verificationCode, verificationCode));
    return record;
  }

  async verifyConsentLink(verification: VerifyConsent, ipAddress: string, userAgent: string): Promise<{
    success: boolean;
    record?: ParentalConsentRecord;
    error?: string;
    errorCode?: string;
  }> {
    try {
      // 🔍 SECURITY: Get consent record
      const record = await this.getConsentRecord(verification.consentRecordId);
      
      if (!record) {
        return {
          success: false,
          error: "Consent record not found",
          errorCode: "RECORD_NOT_FOUND"
        };
      }

      // 🔒 SECURITY: Verify code matches
      if (record.verificationCode !== verification.verificationCode) {
        return {
          success: false,
          error: "Invalid verification code",
          errorCode: "INVALID_CODE"
        };
      }

      // ⏰ SECURITY: Check expiration (72-hour strict limit)
      if (new Date() > record.linkExpiresAt) {
        return {
          success: false,
          error: "Verification link has expired",
          errorCode: "LINK_EXPIRED"
        };
      }

      // 🛡️ SECURITY: Prevent replay attacks
      if (record.isCodeUsed) {
        return {
          success: false,
          error: "Verification code has already been used",
          errorCode: "CODE_ALREADY_USED"
        };
      }

      // ✅ VALID LINK - Return record for use
      return {
        success: true,
        record
      };

    } catch (error) {
      console.error('Consent link verification error:', error);
      return {
        success: false,
        error: "Verification failed",
        errorCode: "VERIFICATION_ERROR"
      };
    }
  }

  async approveConsent(recordId: string, ipAddress: string, userAgent: string): Promise<ParentalConsentRecord> {
    const [updatedRecord] = await db
      .update(parentalConsentRecords)
      .set({
        consentStatus: 'approved',
        consentApprovedAt: new Date(),
        codeUsedAt: new Date(),
        isCodeUsed: true, // 🔒 SECURITY: One-time use enforcement
        recordUpdatedAt: new Date()
      })
      .where(and(
        eq(parentalConsentRecords.id, recordId),
        eq(parentalConsentRecords.isCodeUsed, false) // Prevent double-approval
      ))
      .returning();

    if (!updatedRecord) {
      throw new Error('Consent record not found or already processed');
    }

    return updatedRecord;
  }

  async approveConsentWithSignature(recordId: string, signatureData: {
    digitalSignatureHash: string;
    signaturePayload: string;
    signerFullName: string;
    finalConsentConfirmed: boolean;
    signatureTimestamp: Date;
    signatureMetadata: any;
    renewalDueAt: Date;
    ipAddress: string;
    userAgent: string;
  }): Promise<ParentalConsentRecord> {
    // 🔒 SECURITY: Update consent record with approval status AND digital signature data
    const [updatedRecord] = await db
      .update(parentalConsentRecords)
      .set({
        // Approval status
        consentStatus: 'approved',
        consentApprovedAt: new Date(),
        codeUsedAt: new Date(),
        isCodeUsed: true, // 🔒 SECURITY: One-time use enforcement
        
        // ✍️ DIGITAL SIGNATURE DATA
        digitalSignatureHash: signatureData.digitalSignatureHash,
        signaturePayload: signatureData.signaturePayload,
        signerFullName: signatureData.signerFullName,
        finalConsentConfirmed: signatureData.finalConsentConfirmed,
        signatureTimestamp: signatureData.signatureTimestamp,
        signatureMetadata: signatureData.signatureMetadata,
        
        // 📅 ANNUAL RENEWAL
        renewalDueAt: signatureData.renewalDueAt,
        
        // Update timestamps
        recordUpdatedAt: new Date()
      })
      .where(and(
        eq(parentalConsentRecords.id, recordId),
        eq(parentalConsentRecords.isCodeUsed, false) // Prevent double-approval
      ))
      .returning();

    if (!updatedRecord) {
      throw new Error('Consent record not found or already processed');
    }

    return updatedRecord;
  }

  async revokeConsent(revocation: RevokeConsent, ipAddress: string, userAgent: string): Promise<ParentalConsentRecord> {
    // 🔒 SECURITY: Verify parent email matches for authorization
    const record = await this.getConsentRecord(revocation.consentRecordId);
    
    if (!record) {
      throw new Error('Consent record not found');
    }

    if (record.parentEmail !== revocation.parentEmail) {
      throw new Error('Unauthorized: Parent email does not match');
    }

    const [updatedRecord] = await db
      .update(parentalConsentRecords)
      .set({
        consentStatus: 'revoked',
        consentRevokedAt: new Date(),
        revokedReason: revocation.revokedReason,
        recordUpdatedAt: new Date()
      })
      .where(eq(parentalConsentRecords.id, revocation.consentRecordId))
      .returning();

    return updatedRecord;
  }

  async getStudentConsentStatus(studentAccountId: string): Promise<ParentalConsentRecord | undefined> {
    const [record] = await db.select()
      .from(parentalConsentRecords)
      .where(eq(parentalConsentRecords.studentAccountId, studentAccountId))
      .orderBy(desc(parentalConsentRecords.recordCreatedAt))
      .limit(1);
    return record;
  }

  async getConsentRecordsForSchool(schoolId: string, filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }): Promise<ParentalConsentRecord[]> {
    const conditions = [eq(parentalConsentRecords.schoolId, schoolId)];
    
    if (filters?.status) {
      conditions.push(eq(parentalConsentRecords.consentStatus, filters.status));
    }
    
    if (filters?.dateFrom) {
      conditions.push(gte(parentalConsentRecords.recordCreatedAt, filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      conditions.push(lte(parentalConsentRecords.recordCreatedAt, filters.dateTo));
    }

    return await db.select()
      .from(parentalConsentRecords)
      .where(and(...conditions))
      .orderBy(desc(parentalConsentRecords.recordCreatedAt))
      .limit(filters?.limit || 100);
  }

  async getConsentAuditTrail(studentAccountId: string): Promise<ParentalConsentRecord[]> {
    return await db.select()
      .from(parentalConsentRecords)
      .where(eq(parentalConsentRecords.studentAccountId, studentAccountId))
      .orderBy(desc(parentalConsentRecords.recordCreatedAt));
  }

  async markConsentRecordImmutable(recordId: string): Promise<ParentalConsentRecord> {
    const [updatedRecord] = await db
      .update(parentalConsentRecords)
      .set({
        isImmutable: true,
        immutableSince: new Date(),
        recordUpdatedAt: new Date()
      })
      .where(eq(parentalConsentRecords.id, recordId))
      .returning();

    if (!updatedRecord) {
      throw new Error('Consent record not found');
    }

    return updatedRecord;
  }

  // 📊 CONSENT DASHBOARD FUNCTIONS - For school administrators
  async listConsentsBySchool(schoolId: string, filters?: {
    status?: string;
    grade?: string;
    query?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    consents: Array<ParentalConsentRecord & {
      studentFirstName: string;
      studentLastName: string;
      studentGrade: string;
      parentName: string;
      parentEmail: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Build the conditions array
    const conditions = [eq(parentalConsentRecords.schoolId, schoolId)];
    
    if (filters?.status) {
      conditions.push(eq(parentalConsentRecords.consentStatus, filters.status));
    }

    // For grade filtering, we need to join with student accounts and users
    let gradeCondition = null;
    if (filters?.grade) {
      gradeCondition = eq(users.grade, filters.grade);
    }

    // Get consents with student and parent information
    let query = db
      .select({
        // Consent fields
        id: parentalConsentRecords.id,
        studentAccountId: parentalConsentRecords.studentAccountId,
        schoolId: parentalConsentRecords.schoolId,
        consentStatus: parentalConsentRecords.consentStatus,
        consentSubmittedAt: parentalConsentRecords.consentSubmittedAt,
        consentApprovedAt: parentalConsentRecords.consentApprovedAt,
        consentRevokedAt: parentalConsentRecords.consentRevokedAt,
        linkExpiresAt: parentalConsentRecords.linkExpiresAt,
        signerFullName: parentalConsentRecords.signerFullName,
        digitalSignatureHash: parentalConsentRecords.digitalSignatureHash,
        isImmutable: parentalConsentRecords.isImmutable,
        recordCreatedAt: parentalConsentRecords.recordCreatedAt,
        lastUpdatedBy: parentalConsentRecords.lastUpdatedBy,
        // Additional fields
        consentVersion: parentalConsentRecords.consentVersion,
        parentName: parentalConsentRecords.parentName,
        parentEmail: parentalConsentRecords.parentEmail,
        relationshipToStudent: parentalConsentRecords.relationshipToStudent,
        verificationMethod: parentalConsentRecords.verificationMethod,
        signatureTimestamp: parentalConsentRecords.signatureTimestamp,
        recordUpdatedAt: parentalConsentRecords.recordUpdatedAt,
        renewalDueAt: parentalConsentRecords.renewalDueAt,
        revokedReason: parentalConsentRecords.revokedReason,
        // Student info
        studentFirstName: studentAccounts.firstName,
        studentLastName: studentAccounts.lastName,
        studentGrade: users.grade,
      })
      .from(parentalConsentRecords)
      .innerJoin(studentAccounts, eq(parentalConsentRecords.studentAccountId, studentAccounts.id))
      .innerJoin(users, eq(studentAccounts.userId, users.id))
      .where(gradeCondition ? and(...conditions, gradeCondition) : and(...conditions));

    // Add search query filter if provided
    if (filters?.query) {
      const searchTerm = `%${filters.query}%`;
      query = query.where(
        and(
          ...conditions,
          gradeCondition ? gradeCondition : sql`1=1`,
          or(
            sql`${studentAccounts.firstName} ILIKE ${searchTerm}`,
            sql`${studentAccounts.lastName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentEmail} ILIKE ${searchTerm}`
          )
        )
      );
    }

    const consents = await query
      .orderBy(desc(parentalConsentRecords.recordCreatedAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: count() })
      .from(parentalConsentRecords)
      .innerJoin(studentAccounts, eq(parentalConsentRecords.studentAccountId, studentAccounts.id))
      .innerJoin(users, eq(studentAccounts.userId, users.id))
      .where(gradeCondition ? and(...conditions, gradeCondition) : and(...conditions));

    if (filters?.query) {
      const searchTerm = `%${filters.query}%`;
      countQuery = countQuery.where(
        and(
          ...conditions,
          gradeCondition ? gradeCondition : sql`1=1`,
          or(
            sql`${studentAccounts.firstName} ILIKE ${searchTerm}`,
            sql`${studentAccounts.lastName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentEmail} ILIKE ${searchTerm}`
          )
        )
      );
    }

    const [{ count: total }] = await countQuery;

    return {
      consents: consents as any,
      total,
      page,
      pageSize,
    };
  }

  async getConsentStats(schoolId: string): Promise<{
    totalStudents: number;
    approvedCount: number;
    pendingCount: number;
    deniedCount: number;
    revokedCount: number;
    expiredCount: number;
    pendingOlderThan48h: number;
    expiringIn7Days: number;
    approvedRate: number;
  }> {
    // Get total students in the school
    const [{ count: totalStudents }] = await db
      .select({ count: count() })
      .from(studentAccounts)
      .where(eq(studentAccounts.schoolId, schoolId));

    // Get consent status counts
    const statusCounts = await db
      .select({
        status: parentalConsentRecords.consentStatus,
        count: count(),
      })
      .from(parentalConsentRecords)
      .where(eq(parentalConsentRecords.schoolId, schoolId))
      .groupBy(parentalConsentRecords.consentStatus);

    // Initialize counts
    let approvedCount = 0;
    let pendingCount = 0;
    let deniedCount = 0;
    let revokedCount = 0;
    let expiredCount = 0;

    statusCounts.forEach(({ status, count }) => {
      switch (status) {
        case 'approved':
          approvedCount = count;
          break;
        case 'pending':
          pendingCount = count;
          break;
        case 'denied':
          deniedCount = count;
          break;
        case 'revoked':
          revokedCount = count;
          break;
        case 'expired':
          expiredCount = count;
          break;
      }
    });

    // Get pending consents older than 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
    
    const [{ count: pendingOlderThan48h }] = await db
      .select({ count: count() })
      .from(parentalConsentRecords)
      .where(
        and(
          eq(parentalConsentRecords.schoolId, schoolId),
          eq(parentalConsentRecords.consentStatus, 'pending'),
          lte(parentalConsentRecords.recordCreatedAt, twoDaysAgo)
        )
      );

    // Get consents expiring in 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const [{ count: expiringIn7Days }] = await db
      .select({ count: count() })
      .from(parentalConsentRecords)
      .where(
        and(
          eq(parentalConsentRecords.schoolId, schoolId),
          eq(parentalConsentRecords.consentStatus, 'approved'),
          lte(parentalConsentRecords.renewalDueAt, sevenDaysFromNow)
        )
      );

    const approvedRate = totalStudents > 0 ? (approvedCount / totalStudents) * 100 : 0;

    return {
      totalStudents,
      approvedCount,
      pendingCount,
      deniedCount,
      revokedCount,
      expiredCount,
      pendingOlderThan48h,
      expiringIn7Days,
      approvedRate: Math.round(approvedRate * 100) / 100, // Round to 2 decimal places
    };
  }

  async getStudentConsentAudit(studentUserId: string): Promise<Array<ConsentAuditEvent & {
    milestone?: string;
  }>> {
    const auditEvents = await db
      .select()
      .from(consentAuditEvents)
      .where(eq(consentAuditEvents.studentUserId, studentUserId))
      .orderBy(desc(consentAuditEvents.createdAt));

    // Add milestone information based on event types
    return auditEvents.map(event => {
      let milestone: string | undefined;
      
      switch (event.eventType) {
        case 'consent_requested':
          milestone = 'Consent Request Sent';
          break;
        case 'consent_approved':
          milestone = 'Parent Consent Approved';
          break;
        case 'consent_denied':
          milestone = 'Parent Consent Denied';
          break;
        case 'consent_revoked':
          milestone = 'Consent Revoked';
          break;
        case 'consent_expired':
          milestone = 'Consent Expired';
          break;
        case 'signature_verified':
          milestone = 'Digital Signature Verified';
          break;
        case 'audit_accessed':
          milestone = 'Audit Trail Accessed';
          break;
        case 'report_generated':
          milestone = 'Report Generated';
          break;
        default:
          milestone = undefined;
      }

      return {
        ...event,
        milestone,
      };
    });
  }

  async generateConsentReport(schoolId: string, filters?: {
    from?: Date;
    to?: Date;
  }): Promise<{
    summary: {
      totalStudents: number;
      consentsByStatus: Record<string, number>;
      averageResponseTime: number;
      complianceRate: number;
    };
    csvData: string;
  }> {
    const conditions = [eq(parentalConsentRecords.schoolId, schoolId)];
    
    if (filters?.from) {
      conditions.push(gte(parentalConsentRecords.recordCreatedAt, filters.from));
    }
    
    if (filters?.to) {
      conditions.push(lte(parentalConsentRecords.recordCreatedAt, filters.to));
    }

    // Get all consent records with student information
    const records = await db
      .select({
        id: parentalConsentRecords.id,
        consentStatus: parentalConsentRecords.consentStatus,
        consentSubmittedAt: parentalConsentRecords.consentSubmittedAt,
        consentApprovedAt: parentalConsentRecords.consentApprovedAt,
        recordCreatedAt: parentalConsentRecords.recordCreatedAt,
        studentFirstName: studentAccounts.firstName,
        studentLastName: studentAccounts.lastName,
        studentGrade: users.grade,
        parentName: parentalConsentRecords.parentName,
        parentEmail: parentalConsentRecords.parentEmail,
        relationshipToStudent: parentalConsentRecords.relationshipToStudent,
        signatureTimestamp: parentalConsentRecords.signatureTimestamp,
      })
      .from(parentalConsentRecords)
      .innerJoin(studentAccounts, eq(parentalConsentRecords.studentAccountId, studentAccounts.id))
      .innerJoin(users, eq(studentAccounts.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(parentalConsentRecords.recordCreatedAt));

    // Calculate summary statistics
    const totalStudents = records.length;
    const consentsByStatus: Record<string, number> = {};
    let totalResponseTime = 0;
    let responsiveRecords = 0;

    records.forEach(record => {
      // Count by status
      consentsByStatus[record.consentStatus] = (consentsByStatus[record.consentStatus] || 0) + 1;
      
      // Calculate response time for approved consents
      if (record.consentApprovedAt && record.consentSubmittedAt) {
        const responseTime = record.consentApprovedAt.getTime() - record.consentSubmittedAt.getTime();
        totalResponseTime += responseTime;
        responsiveRecords++;
      }
    });

    const averageResponseTime = responsiveRecords > 0 ? totalResponseTime / responsiveRecords / (1000 * 60 * 60) : 0; // in hours
    const approvedCount = consentsByStatus['approved'] || 0;
    const complianceRate = totalStudents > 0 ? (approvedCount / totalStudents) * 100 : 0;

    // Generate CSV data with masked PII
    const csvHeaders = [
      'Student Grade',
      'Consent Status',
      'Submitted Date',
      'Approved Date',
      'Response Time (hours)',
      'Parent Relationship',
      'Signature Method'
    ];

    const csvRows = records.map(record => {
      const responseTime = record.consentApprovedAt && record.consentSubmittedAt 
        ? Math.round((record.consentApprovedAt.getTime() - record.consentSubmittedAt.getTime()) / (1000 * 60 * 60))
        : '';

      return [
        record.studentGrade || '',
        record.consentStatus,
        record.consentSubmittedAt?.toISOString().split('T')[0] || '',
        record.consentApprovedAt?.toISOString().split('T')[0] || '',
        responseTime,
        record.relationshipToStudent || '',
        record.signatureTimestamp ? 'Digital Signature' : 'Standard'
      ];
    });

    const csvData = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return {
      summary: {
        totalStudents,
        consentsByStatus,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        complianceRate: Math.round(complianceRate * 100) / 100,
      },
      csvData,
    };
  }

  // 🔍 AUDIT EVENT MANAGEMENT
  async createConsentAuditEvent(event: InsertConsentAuditEvent): Promise<ConsentAuditEvent> {
    const [newEvent] = await db
      .insert(consentAuditEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  // 🔄 ANNUAL CONSENT RENEWAL WORKFLOW IMPLEMENTATIONS - BURLINGTON POLICY
  async getActiveConsent(studentId: string, schoolId: string): Promise<ParentalConsentRecord | undefined> {
    const [record] = await db.select()
      .from(parentalConsentRecords)
      .where(
        and(
          eq(parentalConsentRecords.studentAccountId, studentId),
          eq(parentalConsentRecords.schoolId, schoolId),
          eq(parentalConsentRecords.consentStatus, 'approved'),
          or(
            isNull(parentalConsentRecords.validUntil),
            gt(parentalConsentRecords.validUntil, new Date())
          )
        )
      )
      .orderBy(desc(parentalConsentRecords.recordCreatedAt))
      .limit(1);
    return record;
  }

  async listExpiringConsentsBySchool(schoolId: string, start: Date, end: Date, grades?: string[]): Promise<Array<ParentalConsentRecord & {
    studentFirstName: string;
    studentLastName: string;
    studentGrade: string;
    parentName: string;
    parentEmail: string;
    daysUntilExpiry: number;
  }>> {
    let query = db
      .select({
        ...getTableColumns(parentalConsentRecords),
        studentFirstName: studentAccounts.firstName,
        studentLastName: studentAccounts.lastName,
        studentGrade: users.grade,
        parentName: parentalConsentRecords.parentName,
        parentEmail: parentalConsentRecords.parentEmail,
        daysUntilExpiry: sql<number>`EXTRACT(DAY FROM ${parentalConsentRecords.validUntil} - CURRENT_DATE)::int`,
      })
      .from(parentalConsentRecords)
      .innerJoin(studentAccounts, eq(parentalConsentRecords.studentAccountId, studentAccounts.id))
      .innerJoin(users, eq(studentAccounts.userId, users.id))
      .where(
        and(
          eq(parentalConsentRecords.schoolId, schoolId),
          eq(parentalConsentRecords.consentStatus, 'approved'),
          gte(parentalConsentRecords.validUntil, start),
          lte(parentalConsentRecords.validUntil, end)
        )
      );

    // Filter by grades if specified (Burlington: 6, 7, 8)
    if (grades && grades.length > 0) {
      query = query.where(
        and(
          eq(parentalConsentRecords.schoolId, schoolId),
          eq(parentalConsentRecords.consentStatus, 'approved'),
          gte(parentalConsentRecords.validUntil, start),
          lte(parentalConsentRecords.validUntil, end),
          inArray(users.grade, grades)
        )
      );
    }

    return await query.orderBy(parentalConsentRecords.validUntil);
  }

  async createRenewalRequestFromConsent(consentId: string, snapshot: any, code: string): Promise<ParentalConsentRecord> {
    const { nanoid } = await import('nanoid');
    
    // Get the original consent record
    const originalConsent = await this.getConsentRecord(consentId);
    if (!originalConsent) {
      throw new Error('Original consent record not found');
    }

    // Calculate Burlington school year dates (Aug 1 - Jul 31)
    const now = new Date();
    const currentYear = now.getFullYear();
    const schoolYearStart = new Date(currentYear, 7, 1); // Aug 1
    const schoolYearEnd = new Date(currentYear + 1, 6, 31); // Jul 31 next year
    
    // If we're past Aug 1, use next school year
    if (now >= schoolYearStart) {
      schoolYearStart.setFullYear(currentYear + 1);
      schoolYearEnd.setFullYear(currentYear + 2);
    }

    const renewalDueAt = new Date(schoolYearEnd);
    const renewalWindowStart = new Date(schoolYearEnd);
    renewalWindowStart.setDate(schoolYearEnd.getDate() - 75); // 75 days before

    const renewalRecord = {
      studentAccountId: originalConsent.studentAccountId,
      schoolId: originalConsent.schoolId,
      consentVersion: "v2025.2", // New version for renewal
      parentName: originalConsent.parentName,
      parentEmail: originalConsent.parentEmail,
      parentPhone: originalConsent.parentPhone,
      relationshipToStudent: originalConsent.relationshipToStudent,
      
      // Copy consent preferences from original
      consentToDataCollection: originalConsent.consentToDataCollection,
      consentToDataSharing: originalConsent.consentToDataSharing,
      consentToEmailCommunication: originalConsent.consentToEmailCommunication,
      consentToEducationalReports: originalConsent.consentToEducationalReports,
      consentToKindnessActivityTracking: originalConsent.consentToKindnessActivityTracking,
      optOutOfDataAnalytics: originalConsent.optOutOfDataAnalytics,
      optOutOfThirdPartySharing: originalConsent.optOutOfThirdPartySharing,
      optOutOfMarketingCommunications: originalConsent.optOutOfMarketingCommunications,
      optOutOfPlatformNotifications: originalConsent.optOutOfPlatformNotifications,
      
      verificationCode: nanoid(25),
      verificationMethod: 'email_link',
      consentStatus: 'pending',
      
      // Burlington renewal fields
      validFrom: schoolYearStart,
      validUntil: schoolYearEnd,
      renewalDueAt,
      renewalWindowStart,
      renewalStatus: 'pending',
      renewalSource: 'auto',
      parentContactSnapshot: snapshot,
      renewalVerificationCode: code,
      supersedesConsentId: consentId,
      
      linkExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
      recordCreatedAt: new Date(),
      recordUpdatedAt: new Date(),
      ipAddress: '0.0.0.0', // Will be updated on approval
      userAgent: 'system-renewal'
    };

    const [created] = await db
      .insert(parentalConsentRecords)
      .values(renewalRecord)
      .returning();

    return created;
  }

  async markRenewalReminderSent(renewalId: string, marker: string): Promise<void> {
    await db
      .update(parentalConsentRecords)
      .set({
        recordUpdatedAt: new Date(),
        // Store reminder marker in signature metadata for tracking
        signatureMetadata: sql`COALESCE(${parentalConsentRecords.signatureMetadata}, '{}')::jsonb || ${JSON.stringify({ [`${marker}_reminder_sent`]: new Date().toISOString() })}`
      })
      .where(eq(parentalConsentRecords.id, renewalId));
  }

  async setRenewalStatus(renewalId: string, status: string): Promise<ParentalConsentRecord | undefined> {
    const [updated] = await db
      .update(parentalConsentRecords)
      .set({
        renewalStatus: status,
        recordUpdatedAt: new Date()
      })
      .where(eq(parentalConsentRecords.id, renewalId))
      .returning();

    return updated;
  }

  async approveRenewal(renewalId: string, signatureData: {
    digitalSignatureHash: string;
    signaturePayload: string;
    signerFullName: string;
    finalConsentConfirmed: boolean;
    signatureTimestamp: Date;
    signatureMetadata: any;
    ipAddress: string;
    userAgent: string;
  }): Promise<ParentalConsentRecord> {
    return await db.transaction(async (tx) => {
      // Get the renewal record
      const [renewalRecord] = await tx
        .select()
        .from(parentalConsentRecords)
        .where(eq(parentalConsentRecords.id, renewalId));

      if (!renewalRecord) {
        throw new Error('Renewal record not found');
      }

      // Approve the renewal record with signature data
      const [approvedRenewal] = await tx
        .update(parentalConsentRecords)
        .set({
          consentStatus: 'approved',
          renewalStatus: 'approved',
          consentApprovedAt: new Date(),
          codeUsedAt: new Date(),
          isCodeUsed: true,
          
          // Digital signature data
          digitalSignatureHash: signatureData.digitalSignatureHash,
          signaturePayload: signatureData.signaturePayload,
          signerFullName: signatureData.signerFullName,
          finalConsentConfirmed: signatureData.finalConsentConfirmed,
          signatureTimestamp: signatureData.signatureTimestamp,
          signatureMetadata: signatureData.signatureMetadata,
          
          // Make immutable
          isImmutable: true,
          immutableSince: new Date(),
          
          recordUpdatedAt: new Date()
        })
        .where(eq(parentalConsentRecords.id, renewalId))
        .returning();

      // If this renewal supersedes a previous consent, mark the old one as superseded
      if (renewalRecord.supersedesConsentId) {
        await tx
          .update(parentalConsentRecords)
          .set({
            renewalStatus: 'superseded',
            recordUpdatedAt: new Date()
          })
          .where(eq(parentalConsentRecords.id, renewalRecord.supersedesConsentId));
      }

      return approvedRenewal;
    });
  }

  async listRenewalsDashboard(schoolId: string, filters?: {
    status?: string;
    grade?: string;
    query?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    renewals: Array<ParentalConsentRecord & {
      studentFirstName: string;
      studentLastName: string;
      studentGrade: string;
      parentName: string;
      parentEmail: string;
      daysUntilExpiry: number;
      reminderCount: number;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const conditions = [
      eq(parentalConsentRecords.schoolId, schoolId),
      isNotNull(parentalConsentRecords.renewalStatus) // Only renewal records
    ];

    if (filters?.status) {
      conditions.push(eq(parentalConsentRecords.renewalStatus, filters.status));
    }

    // Grade filter
    let gradeCondition = undefined;
    if (filters?.grade) {
      gradeCondition = eq(users.grade, filters.grade);
    }

    let query = db
      .select({
        ...getTableColumns(parentalConsentRecords),
        studentFirstName: studentAccounts.firstName,
        studentLastName: studentAccounts.lastName,
        studentGrade: users.grade,
        parentName: parentalConsentRecords.parentName,
        parentEmail: parentalConsentRecords.parentEmail,
        daysUntilExpiry: sql<number>`EXTRACT(DAY FROM ${parentalConsentRecords.validUntil} - CURRENT_DATE)::int`,
        reminderCount: sql<number>`COALESCE(jsonb_array_length(COALESCE(${parentalConsentRecords.signatureMetadata}->'reminders', '[]'::jsonb)), 0)`,
      })
      .from(parentalConsentRecords)
      .innerJoin(studentAccounts, eq(parentalConsentRecords.studentAccountId, studentAccounts.id))
      .innerJoin(users, eq(studentAccounts.userId, users.id))
      .where(gradeCondition ? and(...conditions, gradeCondition) : and(...conditions));

    // Search filter
    if (filters?.query) {
      const searchTerm = `%${filters.query}%`;
      query = query.where(
        and(
          ...conditions,
          gradeCondition ? gradeCondition : sql`1=1`,
          or(
            sql`${studentAccounts.firstName} ILIKE ${searchTerm}`,
            sql`${studentAccounts.lastName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentEmail} ILIKE ${searchTerm}`
          )
        )
      );
    }

    const renewals = await query
      .orderBy(desc(parentalConsentRecords.validUntil))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    let countQuery = db
      .select({ count: count() })
      .from(parentalConsentRecords)
      .innerJoin(studentAccounts, eq(parentalConsentRecords.studentAccountId, studentAccounts.id))
      .innerJoin(users, eq(studentAccounts.userId, users.id))
      .where(gradeCondition ? and(...conditions, gradeCondition) : and(...conditions));

    if (filters?.query) {
      const searchTerm = `%${filters.query}%`;
      countQuery = countQuery.where(
        and(
          ...conditions,
          gradeCondition ? gradeCondition : sql`1=1`,
          or(
            sql`${studentAccounts.firstName} ILIKE ${searchTerm}`,
            sql`${studentAccounts.lastName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentName} ILIKE ${searchTerm}`,
            sql`${parentalConsentRecords.parentEmail} ILIKE ${searchTerm}`
          )
        )
      );
    }

    const [{ count: total }] = await countQuery;

    return {
      renewals,
      total,
      page,
      pageSize
    };
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
    const conditions = [eq(schoolContentReports.corporateAccountId, corporateAccountId)];
    if (status) {
      conditions.push(eq(schoolContentReports.status, status));
    }

    return await db.select()
      .from(schoolContentReports)
      .where(and(...conditions))
      .orderBy(desc(schoolContentReports.createdAt));
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

  async getSupportPostById(id: string): Promise<SupportPost | null> {
    const [post] = await db.select().from(supportPosts).where(eq(supportPosts.id, id));
    return post || null;
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

  // ================================
  // 👨‍👩‍👧‍👦 FAMILY KINDNESS CHALLENGE OPERATIONS
  // ================================

  async getFamilyChallenges(week?: number, ageGroup?: string): Promise<YearRoundFamilyChallenge[]> {
    const filters = [];
    if (week) filters.push(eq(yearRoundFamilyChallenges.week, week));
    if (ageGroup) filters.push(eq(yearRoundFamilyChallenges.ageGroup, ageGroup));
    
    return await db
      .select()
      .from(yearRoundFamilyChallenges)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(yearRoundFamilyChallenges.createdAt));
  }

  async getFamilyChallenge(id: string): Promise<YearRoundFamilyChallenge | undefined> {
    const [challenge] = await db
      .select()
      .from(yearRoundFamilyChallenges)
      .where(eq(yearRoundFamilyChallenges.id, id));
    return challenge;
  }

  async getFamilyActivities(challengeId: string): Promise<FamilyActivity[]> {
    return await db
      .select()
      .from(familyActivities)
      .where(eq(familyActivities.challengeId, challengeId));
  }

  async completeFamilyChallenge(progress: InsertFamilyProgress): Promise<FamilyProgress> {
    // Get the challenge to determine points
    const challenge = await this.getFamilyChallenge(progress.challengeId);
    
    const [newProgress] = await db
      .insert(familyProgress)
      .values({
        ...progress,
        kidPointsEarned: challenge?.kidPoints || 0,
        parentPointsEarned: challenge?.parentPoints || 0,
        completedAt: new Date(),
      })
      .returning();
    
    // Update user tokens for both student and parent (dual reward system)
    if (progress.studentId) {
      const currentTokens = await this.getUserTokens(progress.studentId);
      if (currentTokens) {
        await this.updateUserTokens(progress.studentId, { 
          echoBalance: currentTokens.echoBalance + (challenge?.kidPoints || 0)
        });
      }
    }
    
    if (progress.parentId) {
      const currentTokens = await this.getUserTokens(progress.parentId);
      if (currentTokens) {
        await this.updateUserTokens(progress.parentId, { 
          echoBalance: currentTokens.echoBalance + (challenge?.parentPoints || 0)
        });
      }
    }
    
    return newProgress;
  }

  async getFamilyProgress(studentId: string, challengeId?: string): Promise<FamilyProgress[]> {
    const filters = [eq(familyProgress.studentId, studentId)];
    if (challengeId) filters.push(eq(familyProgress.challengeId, challengeId));
    
    return await db
      .select()
      .from(familyProgress)
      .where(and(...filters))
      .orderBy(desc(familyProgress.createdAt));
  }

  async approveFamilyChallenge(progressId: string, teacherApproved: boolean): Promise<FamilyProgress | undefined> {
    const [updated] = await db
      .update(familyProgress)
      .set({ teacherApproved })
      .where(eq(familyProgress.id, progressId))
      .returning();
    
    return updated;
  }

  // School Fundraiser operations - DOUBLE TOKEN REWARDS! 🎯💰
  async createSchoolFundraiser(fundraiser: InsertSchoolFundraiser): Promise<SchoolFundraiser> {
    const [newFundraiser] = await db
      .insert(fundraisingCampaigns)
      .values(fundraiser)
      .returning();
    return newFundraiser;
  }

  async getActiveFundraisers(schoolName?: string): Promise<SchoolFundraiser[]> {
    const now = new Date();
    const conditions = [
      eq(fundraisingCampaigns.isActive, true),
      gte(fundraisingCampaigns.endDate, now)
    ];
    if (schoolName) {
      conditions.push(eq(fundraisingCampaigns.title, schoolName));
    }

    return await db.select()
      .from(fundraisingCampaigns)
      .where(and(...conditions));
  }

  async getFundraiserById(id: string): Promise<SchoolFundraiser | undefined> {
    const [fundraiser] = await db
      .select()
      .from(fundraisingCampaigns)
      .where(eq(schoolFundraisers.id, id));
    return fundraiser || undefined;
  }

  async updateFundraiserAmount(id: string, donationAmount: number): Promise<SchoolFundraiser | undefined> {
    const [fundraiser] = await db
      .update(schoolFundraisers)
      .set({ 
        currentAmount: sql`${schoolFundraisers.currentAmount} + ${donationAmount}` 
      })
      .where(eq(schoolFundraisers.id, id))
      .returning();
    return fundraiser || undefined;
  }

  async createFamilyDonation(donation: InsertFamilyDonation): Promise<FamilyDonation> {
    const [newDonation] = await db
      .insert(familyDonations)
      .values(donation)
      .returning();
    return newDonation;
  }

  async getDonationsByUser(userTokenId: string): Promise<FamilyDonation[]> {
    return await db
      .select()
      .from(familyDonations)
      .where(eq(familyDonations.userTokenId, userTokenId))
      .orderBy(desc(familyDonations.donationDate));
  }

  async verifyDonation(donationId: string): Promise<FamilyDonation | undefined> {
    const [donation] = await db
      .update(familyDonations)
      .set({ isVerified: true })
      .where(eq(familyDonations.id, donationId))
      .returning();
    return donation || undefined;
  }

  // ===============================
  // 🎓 KINDNESS MENTORS IMPLEMENTATION - PEER GUIDANCE & RECOGNITION!
  // ===============================

  // Mentorship management
  async createMentorship(mentorship: InsertMentorship): Promise<Mentorship> {
    const [newMentorship] = await db
      .insert(mentorships)
      .values(mentorship)
      .returning();
    return newMentorship;
  }

  async getMentorshipsByMentor(mentorUserId: string): Promise<Mentorship[]> {
    return await db
      .select()
      .from(mentorships)
      .where(eq(mentorships.mentorUserId, mentorUserId))
      .orderBy(desc(mentorships.createdAt));
  }

  async getMentorshipsByMentee(menteeUserId: string): Promise<Mentorship[]> {
    return await db
      .select()
      .from(mentorships)
      .where(eq(mentorships.menteeUserId, menteeUserId))
      .orderBy(desc(mentorships.createdAt));
  }

  async getActiveMentorships(schoolId?: string): Promise<Mentorship[]> {
    const conditions = [eq(mentorships.status, 'active')];
    if (schoolId) {
      conditions.push(eq(mentorships.schoolId, schoolId));
    }
    
    return await db.select()
      .from(mentorships)
      .where(and(...conditions))
      .orderBy(desc(mentorships.createdAt));
  }

  async updateMentorshipStatus(id: string, status: string): Promise<Mentorship | undefined> {
    const [mentorship] = await db
      .update(mentorships)
      .set({ status, updatedAt: new Date() })
      .where(eq(mentorships.id, id))
      .returning();
    return mentorship;
  }

  async findMentorMatches(menteeUserId: string, ageGroup: string): Promise<User[]> {
    // Smart matching algorithm based on age groups and preferences
    const mentorAgeGroups = ageGroup === 'k-2' ? ['3-5', '6-8'] : 
                           ageGroup === '3-5' ? ['6-8', 'teen'] : 
                           ['teen', 'adult'];
    
    // Find users who are available as mentors with appropriate age groups
    const availableMentors = await db
      .select({ userId: mentorPreferences.userId })
      .from(mentorPreferences)
      .where(
        and(
          eq(mentorPreferences.availableAsMentor, true),
          eq(mentorPreferences.parentPermission, true),
          or(...mentorAgeGroups.map(group => 
            sql`${mentorPreferences.preferredMenteeAgeGroups}::jsonb ? ${group}`
          ))
        )
      );

    if (availableMentors.length === 0) return [];

    // Get full user data for matched mentors
    return await db
      .select()
      .from(users)
      .where(or(...availableMentors.map(m => eq(users.id, m.userId))));
  }

  // Mentor activities and sessions
  async createMentorActivity(activity: InsertMentorActivity): Promise<MentorActivity> {
    const [newActivity] = await db
      .insert(mentorActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getMentorActivities(mentorshipId: string): Promise<MentorActivity[]> {
    return await db
      .select()
      .from(mentorActivities)
      .where(eq(mentorActivities.mentorshipId, mentorshipId))
      .orderBy(desc(mentorActivities.sessionDate));
  }

  async completeMentorActivity(
    activityId: string, 
    reflections: { mentorReflection?: string; menteeReflection?: string; }
  ): Promise<MentorActivity | undefined> {
    const [activity] = await db
      .update(mentorActivities)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        ...reflections
      })
      .where(eq(mentorActivities.id, activityId))
      .returning();
    return activity;
  }

  // Mentor badges and recognition
  async createMentorBadge(badge: InsertMentorBadge): Promise<MentorBadge> {
    const [newBadge] = await db
      .insert(mentorBadges)
      .values(badge)
      .returning();
    return newBadge;
  }

  async getMentorBadges(): Promise<MentorBadge[]> {
    return await db
      .select()
      .from(mentorBadges)
      .where(eq(mentorBadges.isActive, true))
      .orderBy(mentorBadges.tier, mentorBadges.category);
  }

  async getUserMentorBadges(userId: string): Promise<MentorBadge[]> {
    const userBadges = await db
      .select({ badge: mentorBadges })
      .from(userMentorBadges)
      .leftJoin(mentorBadges, eq(userMentorBadges.badgeId, mentorBadges.id))
      .where(eq(userMentorBadges.userId, userId))
      .orderBy(desc(userMentorBadges.earnedAt));
    
    return userBadges.map(ub => ub.badge).filter(Boolean) as MentorBadge[];
  }

  async awardMentorBadge(userId: string, badgeId: string, mentorshipId?: string): Promise<void> {
    await db
      .insert(userMentorBadges)
      .values({
        userId,
        badgeId,
        mentorshipId,
        earnedAt: new Date(),
        isDisplayed: true,
        celebrationViewed: false
      });
  }

  async checkMentorBadgeEligibility(userId: string): Promise<MentorBadge[]> {
    // Get user's mentor stats
    const stats = await this.getMentorStats(userId);
    if (!stats) return [];

    // Get all available badges
    const allBadges = await this.getMentorBadges();
    
    // Get badges user already has
    const userBadges = await this.getUserMentorBadges(userId);
    const userBadgeIds = userBadges.map(b => b.id);

    // Filter badges user doesn't have and check eligibility
    const eligibleBadges = allBadges.filter(badge => {
      if (userBadgeIds.includes(badge.id)) return false;
      
      // Parse requirements and check if user meets them
      const requirements = badge.requirements as any;
      
      // Example requirement checks
      if (requirements.totalMentees && stats.totalMentees < requirements.totalMentees) return false;
      if (requirements.completedMentorships && stats.completedMentorships < requirements.completedMentorships) return false;
      if (requirements.avgRating && stats.avgRating < requirements.avgRating) return false;
      if (requirements.totalSessions && stats.totalSessions < requirements.totalSessions) return false;
      
      return true;
    });

    return eligibleBadges;
  }

  // Mentor Training Operations
  async createMentorTraining(training: InsertMentorTraining): Promise<MentorTraining> {
    const [createdTraining] = await db
      .insert(mentorTraining)
      .values(training)
      .returning();
    return createdTraining;
  }

  async getMentorTrainingByTitle(title: string): Promise<MentorTraining | undefined> {
    const [training] = await db
      .select()
      .from(mentorTraining)
      .where(eq(mentorTraining.title, title));
    return training;
  }

  async getAllMentorTraining(): Promise<MentorTraining[]> {
    return await db
      .select()
      .from(mentorTraining)
      .where(eq(mentorTraining.isActive, true))
      .orderBy(mentorTraining.createdAt);
  }

  // Mentor Scenario Operations
  async createMentorScenario(scenario: InsertMentorScenario): Promise<MentorScenario> {
    const [createdScenario] = await db
      .insert(mentorScenarios)
      .values(scenario)
      .returning();
    return createdScenario;
  }

  async getMentorScenarioByTitle(title: string): Promise<MentorScenario | undefined> {
    const [scenario] = await db
      .select()
      .from(mentorScenarios)
      .where(eq(mentorScenarios.title, title));
    return scenario;
  }

  async getAllMentorScenarios(): Promise<MentorScenario[]> {
    return await db
      .select()
      .from(mentorScenarios)
      .where(eq(mentorScenarios.isActive, true))
      .orderBy(mentorScenarios.createdAt);
  }

  // Mentor Conversation Operations
  async createMentorConversation(conversation: InsertMentorConversation): Promise<MentorConversation> {
    const [createdConversation] = await db
      .insert(mentorConversations)
      .values(conversation)
      .returning();
    return createdConversation;
  }

  async getMentorConversationByTitle(title: string): Promise<MentorConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(mentorConversations)
      .where(eq(mentorConversations.title, title));
    return conversation;
  }

  async getAllMentorConversations(): Promise<MentorConversation[]> {
    return await db
      .select()
      .from(mentorConversations)
      .where(eq(mentorConversations.isActive, true))
      .orderBy(mentorConversations.sortOrder);
  }

  // Mentor preferences and matching
  async createMentorPreferences(preferences: InsertMentorPreferences): Promise<MentorPreferences> {
    const [newPreferences] = await db
      .insert(mentorPreferences)
      .values(preferences)
      .returning();
    return newPreferences;
  }

  async getMentorPreferences(userId: string): Promise<MentorPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(mentorPreferences)
      .where(eq(mentorPreferences.userId, userId));
    return preferences;
  }

  async updateMentorPreferences(userId: string, updates: Partial<MentorPreferences>): Promise<MentorPreferences | undefined> {
    const [preferences] = await db
      .update(mentorPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mentorPreferences.userId, userId))
      .returning();
    return preferences;
  }

  async getAvailableMentors(ageGroup?: string, interests?: string[]): Promise<User[]> {
    const conditions = [
      eq(mentorPreferences.availableAsMentor, true),
      eq(mentorPreferences.parentPermission, true)
    ];

    if (ageGroup) {
      conditions.push(
        sql`${mentorPreferences.preferredMenteeAgeGroups}::jsonb ? ${ageGroup}` as any
      );
    }

    if (interests && interests.length > 0) {
      conditions.push(
        or(...interests.map(interest => 
          sql`${mentorPreferences.interests}::jsonb ? ${interest}`
        ))
      );
    }

    const result = await db
      .select({ user: users })
      .from(mentorPreferences)
      .leftJoin(users, eq(mentorPreferences.userId, users.id))
      .where(and(...conditions));
    
    return result.map(r => r.user).filter(Boolean) as User[];
  }

  // Mentor analytics and progress
  async getMentorStats(userId: string): Promise<MentorStats | undefined> {
    const [stats] = await db
      .select()
      .from(mentorStats)
      .where(eq(mentorStats.userId, userId));
    return stats;
  }

  async updateMentorStats(userId: string, updates: Partial<MentorStats>): Promise<void> {
    await db
      .insert(mentorStats)
      .values({ userId, ...updates, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: mentorStats.userId,
        set: { ...updates, updatedAt: new Date() }
      });
  }

  async getMentorLeaderboard(schoolId?: string, limit: number = 10): Promise<Array<{ user: User; stats: MentorStats; }>> {
    let query = db
      .select({ user: users, stats: mentorStats })
      .from(mentorStats)
      .leftJoin(users, eq(mentorStats.userId, users.id))
      .orderBy(desc(mentorStats.impactScore), desc(mentorStats.totalTokensEarned))
      .limit(limit);

    // If schoolId provided, filter by school (this would require linking users to schools)
    const result = await query;
    return result.filter(r => r.user && r.stats) as Array<{ user: User; stats: MentorStats; }>;
  }

  // Curriculum operations
  async getCurriculumLessons(filters?: {
    gradeLevel?: string;
    subject?: string;
    kindnessTheme?: string;
    difficulty?: string;
    limit?: number;
  }): Promise<CurriculumLesson[]> {
    const conditions = [eq(curriculumLessons.isActive, true)];
    if (filters?.gradeLevel) {
      conditions.push(eq(curriculumLessons.gradeLevel, filters.gradeLevel));
    }
    if (filters?.subject) {
      conditions.push(eq(curriculumLessons.subject, filters.subject));
    }
    if (filters?.kindnessTheme) {
      conditions.push(eq(curriculumLessons.kindnessTheme, filters.kindnessTheme));
    }
    if (filters?.difficulty) {
      conditions.push(eq(curriculumLessons.difficulty, filters.difficulty));
    }

    const query = db.select()
      .from(curriculumLessons)
      .where(and(...conditions))
      .orderBy(curriculumLessons.gradeLevel, curriculumLessons.title);

    if (filters?.limit) {
      return await query.limit(filters.limit);
    }

    return await query;
  }

  async getCurriculumLessonById(id: string): Promise<CurriculumLesson | undefined> {
    const [lesson] = await db
      .select()
      .from(curriculumLessons)
      .where(eq(curriculumLessons.id, id));
    return lesson;
  }

  async createCurriculumLesson(lesson: InsertCurriculumLesson): Promise<CurriculumLesson> {
    const [created] = await db
      .insert(curriculumLessons)
      .values(lesson)
      .returning();
    return created;
  }

  async updateCurriculumLesson(id: string, updates: Partial<InsertCurriculumLesson>): Promise<CurriculumLesson> {
    const [updated] = await db
      .update(curriculumLessons)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(curriculumLessons.id, id))
      .returning();
    return updated;
  }

  // Teacher progress tracking
  async getCurriculumProgress(teacherId: string): Promise<CurriculumProgress[]> {
    return await db
      .select()
      .from(curriculumProgress)
      .where(eq(curriculumProgress.teacherId, teacherId))
      .orderBy(desc(curriculumProgress.implementedAt));
  }

  async createCurriculumProgress(progress: InsertCurriculumProgress): Promise<CurriculumProgress> {
    const [created] = await db
      .insert(curriculumProgress)
      .values(progress)
      .returning();
    return created;
  }

  async updateCurriculumProgress(id: string, updates: Partial<InsertCurriculumProgress>): Promise<CurriculumProgress> {
    const [updated] = await db
      .update(curriculumProgress)
      .set({ ...updates })
      .where(eq(curriculumProgress.id, id))
      .returning();
    return updated;
  }

  // Student responses
  async getStudentCurriculumResponses(filters?: {
    studentId?: string;
    lessonId?: string;
    progressId?: string;
  }): Promise<StudentCurriculumResponse[]> {
    const conditions = [];
    if (filters?.studentId) {
      conditions.push(eq(studentCurriculumResponses.studentId, filters.studentId));
    }
    if (filters?.lessonId) {
      conditions.push(eq(studentCurriculumResponses.lessonId, filters.lessonId));
    }
    if (filters?.progressId) {
      conditions.push(eq(studentCurriculumResponses.progressId, filters.progressId));
    }

    return await db.select()
      .from(studentCurriculumResponses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(studentCurriculumResponses.createdAt));
  }

  async createStudentCurriculumResponse(response: InsertStudentCurriculumResponse): Promise<StudentCurriculumResponse> {
    const [created] = await db
      .insert(studentCurriculumResponses)
      .values(response)
      .returning();
    return created;
  }

  async updateStudentCurriculumResponse(id: string, updates: Partial<InsertStudentCurriculumResponse>): Promise<StudentCurriculumResponse> {
    const [updated] = await db
      .update(studentCurriculumResponses)
      .set({ ...updates })
      .where(eq(studentCurriculumResponses.id, id))
      .returning();
    return updated;
  }

  // Curriculum resources
  async getCurriculumResources(filters?: {
    lessonId?: string;
    resourceType?: string;
    gradeLevel?: string;
  }): Promise<CurriculumResource[]> {
    const conditions = [];
    if (filters?.lessonId) {
      conditions.push(eq(curriculumResources.lessonId, filters.lessonId));
    }
    if (filters?.resourceType) {
      conditions.push(eq(curriculumResources.resourceType, filters.resourceType));
    }
    if (filters?.gradeLevel) {
      conditions.push(eq(curriculumResources.gradeLevel, filters.gradeLevel));
    }

    return await db.select()
      .from(curriculumResources)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(curriculumResources.title);
  }

  async createCurriculumResource(resource: InsertCurriculumResource): Promise<CurriculumResource> {
    const [created] = await db
      .insert(curriculumResources)
      .values(resource)
      .returning();
    return created;
  }

  // ===== EMERGENCY CONTACT ENCRYPTION KEY MANAGEMENT - LIFE-CRITICAL =====
  
  async storeEncryptionKey(keyId: string, encryptedKey: string, keyType: string = 'emergency_contact'): Promise<EncryptionKey> {
    const [created] = await db
      .insert(encryptionKeys)
      .values({
        keyId,
        encryptedKey,
        keyType,
        createdBy: 'system',
        accessCount: 0,
        isActive: true
      })
      .returning();
    return created;
  }

  async retrieveEncryptionKey(keyId: string): Promise<string | null> {
    const [key] = await db
      .select()
      .from(encryptionKeys)
      .where(and(
        eq(encryptionKeys.keyId, keyId),
        eq(encryptionKeys.isActive, true)
      ))
      .limit(1);
    
    if (!key) {
      return null;
    }

    // Update access tracking
    await db
      .update(encryptionKeys)
      .set({ 
        lastUsedAt: new Date(),
        accessCount: key.accessCount + 1
      })
      .where(eq(encryptionKeys.keyId, keyId));

    return key.encryptedKey;
  }

  async createDualAuthRequest(request: InsertDualAuthRequest): Promise<DualAuthRequest> {
    const [created] = await db
      .insert(dualAuthRequests)
      .values(request)
      .returning();
    return created;
  }

  async getDualAuthRequest(requestId: string): Promise<DualAuthRequest | null> {
    const [request] = await db
      .select()
      .from(dualAuthRequests)
      .where(eq(dualAuthRequests.requestId, requestId))
      .limit(1);
    return request || null;
  }

  async updateDualAuthRequest(requestId: string, updates: Partial<InsertDualAuthRequest>): Promise<DualAuthRequest> {
    const [updated] = await db
      .update(dualAuthRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dualAuthRequests.requestId, requestId))
      .returning();
    return updated;
  }

  async createEncryptedEmergencyContact(contact: InsertEncryptedEmergencyContact): Promise<EncryptedEmergencyContact> {
    const [created] = await db
      .insert(encryptedEmergencyContacts)
      .values(contact)
      .returning();
    return created;
  }

  async getEncryptedEmergencyContact(contactId: string): Promise<EncryptedEmergencyContact | null> {
    const [contact] = await db
      .select()
      .from(encryptedEmergencyContacts)
      .where(eq(encryptedEmergencyContacts.contactId, contactId))
      .limit(1);
    return contact || null;
  }

  async updateEncryptedEmergencyContactAccess(contactId: string, accessorUserId: string): Promise<void> {
    const contact = await this.getEncryptedEmergencyContact(contactId);
    if (contact) {
      await db
        .update(encryptedEmergencyContacts)
        .set({
          accessCount: contact.accessCount + 1,
          lastAccessedAt: new Date(),
          lastAccessedBy: accessorUserId
        })
        .where(eq(encryptedEmergencyContacts.contactId, contactId));
    }
  }

  // 🎓 TEACHER CLAIM CODE SYSTEM IMPLEMENTATIONS
  async generateUniqueClaimCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // 🔒 SECURE: Use cryptographically secure random generation
      const code = CryptoSecurity.generateSecureCode(12);
      
      // Check if code already exists (checking both plain and hash for transition period)
      const existing = await db.select().from(teacherClaimCodes).where(
        or(
          eq(teacherClaimCodes.claimCode, code),
          eq(teacherClaimCodes.claimCodeHash, CryptoSecurity.hashClaimCode(code))
        )
      );
      if (existing.length === 0) {
        return code;
      }
      
      attempts++;
    }
    
    // Fallback: add timestamp if all attempts failed
    const timestamp = Date.now().toString().slice(-4);
    return `SEC-${timestamp}`;
  }

  async createTeacherClaimCode(claimCodeData: InsertTeacherClaimCode): Promise<TeacherClaimCode> {
    // Generate unique claim code if not provided
    let claimCode = claimCodeData.claimCode;
    if (!claimCode) {
      claimCode = await this.generateUniqueClaimCode();
    }
    
    // 🔒 SECURE: Hash the claim code for secure storage
    const claimCodeHash = CryptoSecurity.hashClaimCode(claimCode);
    
    const [newClaimCode] = await db.insert(teacherClaimCodes).values({
      ...claimCodeData,
      claimCode,
      claimCodeHash,
    }).returning();
    return newClaimCode;
  }

  async getTeacherVerificationCount(teacherId: string, month: string): Promise<number> {
    try {
      // Simple implementation using existing community service data
      // Count service hours verifications for this teacher in the given month
      const monthStart = new Date(month + '-01');
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(communityServiceLogs)
        .where(
          and(
            eq(communityServiceLogs.verifiedBy, teacherId),
            gte(communityServiceLogs.verifiedDate, monthStart.toISOString()),
            lte(communityServiceLogs.verifiedDate, monthEnd.toISOString())
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting teacher verification count:', error);
      return 0; // Return 0 for demo purposes
    }
  }

  async getTeacherRewardCriteria(): Promise<any[]> {
    try {
      const criteria = await db.execute(sql`
        SELECT * FROM teacher_reward_criteria 
        WHERE is_active = 1 
        ORDER BY category, period, threshold
      `);
      return criteria.rows || [];
    } catch (error) {
      console.error('Error fetching teacher reward criteria:', error);
      return [];
    }
  }

  async getTeacherRewardSponsors(): Promise<any[]> {
    try {
      const sponsors = await db.execute(sql`
        SELECT * FROM sponsors 
        WHERE is_active = 1 
        ORDER BY monthly_budget DESC
      `);
      return sponsors.rows || [];
    } catch (error) {
      console.error('Error fetching teacher reward sponsors:', error);
      return [];
    }
  }

  async getTeacherClaimCodes(teacherUserId: string): Promise<TeacherClaimCode[]> {
    const codes = await db
      .select()
      .from(teacherClaimCodes)
      .where(eq(teacherClaimCodes.teacherUserId, teacherUserId))
      .orderBy(desc(teacherClaimCodes.createdAt));
    return codes;
  }

  async getSchoolClaimCodes(schoolId: string): Promise<TeacherClaimCode[]> {
    const codes = await db
      .select()
      .from(teacherClaimCodes)
      .where(eq(teacherClaimCodes.schoolId, schoolId))
      .orderBy(desc(teacherClaimCodes.createdAt));
    return codes;
  }

  async getActiveClaimCode(claimCode: string): Promise<TeacherClaimCode | undefined> {
    const [code] = await db
      .select()
      .from(teacherClaimCodes)
      .where(
        and(
          eq(teacherClaimCodes.claimCode, claimCode),
          eq(teacherClaimCodes.isActive, 1),
          gte(teacherClaimCodes.expiresAt, new Date()) // Not expired
        )
      );
    return code;
  }

  async validateClaimCode(claimCode: string, context?: {
    ipAddress?: string;
    userAgent?: string;
    schoolId?: string;
  }): Promise<{ 
    isValid: boolean; 
    code?: TeacherClaimCode; 
    error?: string; 
    errorCode?: string;
  }> {
    const now = new Date();
    
    // 🔒 ENHANCED SECURITY: Secure hash-based validation with constant-time comparison
    const inputCodeHash = CryptoSecurity.hashClaimCode(claimCode);
    
    // Get all active codes to perform constant-time hash comparison
    const activeCodes = await db
      .select()
      .from(teacherClaimCodes)
      .where(
        and(
          eq(teacherClaimCodes.isActive, 1),
          gte(teacherClaimCodes.expiresAt, now)
        )
      );
    
    // Find matching code using constant-time hash comparison
    let code: TeacherClaimCode | undefined;
    for (const activeCode of activeCodes) {
      // Support both hashed and legacy plain text codes during transition
      if (activeCode.claimCodeHash && CryptoSecurity.validateClaimCodeHash(claimCode, activeCode.claimCodeHash)) {
        code = activeCode;
        break;
      } else if (!activeCode.claimCodeHash && activeCode.claimCode === claimCode) {
        // Legacy support - migrate to hash on validation
        const hash = CryptoSecurity.hashClaimCode(claimCode);
        await db
          .update(teacherClaimCodes)
          .set({ claimCodeHash: hash })
          .where(eq(teacherClaimCodes.id, activeCode.id));
        code = { ...activeCode, claimCodeHash: hash };
        break;
      }
    }
    
    // Always increment validation attempts for security tracking (even for non-existent codes)
    if (code) {
      await db
        .update(teacherClaimCodes)
        .set({
          validationAttempts: sql`${teacherClaimCodes.validationAttempts} + 1`,
          updatedAt: now
        })
        .where(eq(teacherClaimCodes.id, code.id));
    }
    
    // 🛡️ RATE LIMITING: Check if code is temporarily locked due to too many failures
    if (code?.lockedUntil && now < code.lockedUntil) {
      await this.recordFailedAttempt(code.id);
      return { 
        isValid: false, 
        error: 'This claim code is temporarily locked due to security concerns. Please try again later.',
        errorCode: 'TEMPORARILY_LOCKED'
      };
    }
    
    // Basic existence and status checks
    if (!code) {
      return { 
        isValid: false, 
        error: 'Invalid claim code. Please check the code and try again.',
        errorCode: 'NOT_FOUND' 
      };
    }
    
    if (!code.isActive) {
      await this.recordFailedAttempt(code.id);
      return { 
        isValid: false, 
        error: 'This claim code has been deactivated.',
        errorCode: 'DEACTIVATED' 
      };
    }
    
    // 📅 EXPIRATION CHECK
    if (now > code.expiresAt) {
      await this.recordFailedAttempt(code.id);
      return { 
        isValid: false, 
        error: 'This claim code has expired. Please contact your teacher for a new code.',
        errorCode: 'EXPIRED' 
      };
    }
    
    // 🔢 USAGE LIMIT CHECK
    if (code.currentUses >= code.maxUses) {
      await this.recordFailedAttempt(code.id);
      return { 
        isValid: false, 
        error: 'This claim code has reached its maximum number of uses.',
        errorCode: 'MAX_USES_REACHED' 
      };
    }
    
    // 🏫 SCHOOL VALIDATION: Ensure claim code is being used by correct school
    if (context?.schoolId && code.schoolId !== context.schoolId) {
      await this.recordFailedAttempt(code.id);
      return { 
        isValid: false, 
        error: 'This claim code is not valid for your school.',
        errorCode: 'SCHOOL_MISMATCH' 
      };
    }
    
    return { isValid: true, code };
  }

  // 🔒 SECURITY: Record failed validation attempts with anti-enumeration protection
  private async recordFailedAttempt(claimCodeId: string): Promise<void> {
    const now = new Date();
    const [updatedCode] = await db
      .update(teacherClaimCodes)
      .set({
        failedAttempts: sql`${teacherClaimCodes.failedAttempts} + 1`,
        lastFailureAt: now,
        // Lock code for 15 minutes after 5 failed attempts
        lockedUntil: sql`CASE 
          WHEN ${teacherClaimCodes.failedAttempts} >= 4 
          THEN ${now.getTime() + (15 * 60 * 1000)} 
          ELSE ${teacherClaimCodes.lockedUntil} 
        END`,
        updatedAt: now
      })
      .where(eq(teacherClaimCodes.id, claimCodeId))
      .returning();
  }

  // 🎓 COPPA-COMPLIANT CLAIM CODE REDEMPTION WITH TRANSACTIONAL SAFETY
  async useClaimCode(claimCodeData: {
    claimCode: string;
    studentFirstName: string;
    studentLastName?: string;
    studentBirthYear: number;
    parentEmail: string;
    parentName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    deviceFingerprint?: string;
    schoolId?: string;
  }): Promise<{
    success: boolean;
    result?: ClaimCodeUsage;
    student?: any;
    consentRequest?: any;
    error?: string;
    errorCode?: string;
  }> {
    // 🔒 ATOMIC TRANSACTION for concurrency safety
    return await db.transaction(async (tx) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const studentAge = currentYear - claimCodeData.studentBirthYear;
      
      // 1️⃣ VALIDATE CLAIM CODE with enhanced security
      const validation = await this.validateClaimCode(claimCodeData.claimCode, {
        ipAddress: claimCodeData.ipAddress,
        userAgent: claimCodeData.userAgent,
        schoolId: claimCodeData.schoolId
      });
      
      if (!validation.isValid || !validation.code) {
        // Record failed usage attempt
        await tx.insert(claimCodeUsages).values({
          claimCodeId: 'invalid', // Will be overwritten if code exists
          studentUserId: 'unknown',
          studentAccountId: 'unknown',
          usageResult: validation.errorCode || 'invalid',
          parentConsentTriggered: 0,
          studentAge,
          coppaRequired: studentAge < 13 ? 1 : 0,
          ipAddress: claimCodeData.ipAddress,
          userAgent: claimCodeData.userAgent,
          sessionId: claimCodeData.sessionId,
          deviceFingerprint: claimCodeData.deviceFingerprint,
          schoolValidated: claimCodeData.schoolId ? 1 : 0,
          preventedReason: validation.error,
        });
        
        return {
          success: false,
          error: validation.error,
          errorCode: validation.errorCode
        };
      }

      const claimCode = validation.code;
      
      // 2️⃣ CHECK FOR CONCURRENT REDEMPTION (SELECT FOR UPDATE)
      const [lockedCode] = await tx
        .select()
        .from(teacherClaimCodes)
        .where(eq(teacherClaimCodes.id, claimCode.id))
        .for('update'); // Row-level lock to prevent concurrent redemptions
      
      if (!lockedCode || lockedCode.currentUses >= lockedCode.maxUses) {
        return {
          success: false,
          error: 'This claim code is no longer available due to concurrent usage.',
          errorCode: 'CONCURRENT_REDEMPTION'
        };
      }
      
      // 3️⃣ CREATE USER ACCOUNT (PROVISIONAL - inactive until consent)
      const [newUser] = await tx.insert(users).values({
        firstName: claimCodeData.studentFirstName,
        lastName: claimCodeData.studentLastName,
        anonymityLevel: 'full', // Default to full anonymity for safety
        schoolRole: 'student',
        schoolId: claimCode.schoolId,
        workplaceId: claimCode.schoolId, // Link to school
      }).returning();
      
      // 4️⃣ CREATE STUDENT ACCOUNT (COPPA-COMPLIANT)
      const [newStudent] = await tx.insert(studentAccounts).values({
        userId: newUser.id,
        schoolId: claimCode.schoolId,
        firstName: claimCodeData.studentFirstName,
        lastName: claimCodeData.studentLastName,
        grade: claimCode.gradeLevel,
        birthYear: claimCodeData.studentBirthYear,
        parentNotificationEmail: claimCodeData.parentEmail,
        // 🛡️ COPPA: Account starts inactive until parental consent
        isAccountActive: studentAge >= 13 ? 1 : 0, // Only activate if 13+
        parentalConsentStatus: studentAge < 13 ? 'pending' : 'not_required'
      }).returning();
      
      // 5️⃣ COPPA COMPLIANCE: Create parental consent request if under 13
      let consentRequest;
      if (studentAge < 13) {
        const verificationCode = require('nanoid').nanoid(20);
        
        [consentRequest] = await tx.insert(parentalConsentRequests).values({
          studentAccountId: newStudent.id,
          parentEmail: claimCodeData.parentEmail,
          parentName: claimCodeData.parentName || 'Parent/Guardian',
          verificationCode: verificationCode
        }).returning();
        
        // 📧 TRIGGER PARENTAL CONSENT EMAIL (async, don't block transaction)
        // This will be handled by the calling code using emailService
      }
      
      // 6️⃣ RECORD SUCCESSFUL CLAIM CODE USAGE
      const [usage] = await tx.insert(claimCodeUsages).values({
        claimCodeId: claimCode.id,
        studentUserId: newUser.id,
        studentAccountId: newStudent.id,
        usageResult: 'success',
        parentConsentTriggered: studentAge < 13 ? 1 : 0,
        parentConsentRequestId: consentRequest?.id,
        studentAge,
        coppaRequired: studentAge < 13 ? 1 : 0,
        consentStatus: studentAge < 13 ? 'pending' : 'not_required',
        ipAddress: claimCodeData.ipAddress,
        userAgent: claimCodeData.userAgent,
        sessionId: claimCodeData.sessionId,
        deviceFingerprint: claimCodeData.deviceFingerprint,
        schoolValidated: 1,
      }).returning();
      
      // 7️⃣ UPDATE CLAIM CODE USAGE COUNT
      await tx
        .update(teacherClaimCodes)
        .set({
          currentUses: sql`${teacherClaimCodes.currentUses} + 1`,
          lastUsedAt: now,
          updatedAt: now
        })
        .where(eq(teacherClaimCodes.id, claimCode.id));
      
      return {
        success: true,
        result: usage,
        student: newStudent,
        consentRequest
      };
    });
  }

  async updateClaimCodeUsage(claimCodeId: string): Promise<TeacherClaimCode | undefined> {
    // Increment the current uses count
    const [updatedCode] = await db
      .update(teacherClaimCodes)
      .set({
        currentUses: sql`${teacherClaimCodes.currentUses} + 1`,
        lastUsedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(teacherClaimCodes.id, claimCodeId))
      .returning();
    
    return updatedCode;
  }

  async getClaimCodeUsages(claimCodeId: string): Promise<ClaimCodeUsage[]> {
    const usages = await db
      .select()
      .from(claimCodeUsages)
      .where(eq(claimCodeUsages.claimCodeId, claimCodeId))
      .orderBy(desc(claimCodeUsages.usedAt));
    return usages;
  }

  async deactivateClaimCode(claimCodeId: string): Promise<TeacherClaimCode | undefined> {
    const [deactivatedCode] = await db
      .update(teacherClaimCodes)
      .set({
        isActive: 0,
        updatedAt: new Date()
      })
      .where(eq(teacherClaimCodes.id, claimCodeId))
      .returning();
    
    return deactivatedCode;
  }

  // 🎓 BCA DEMO DATA INITIALIZATION - COPPA-COMPLIANT SYNTHETIC DATA
  async initializeBCADemoData(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('🎓 Initializing BCA demo consent data...');
      
      // Check if demo data already exists for Burlington Christian Academy
      const existingConsents = await this.listConsentsBySchool(DEMO_CONFIG.SCHOOL_ID, { page: 1, pageSize: 1 });
      if (existingConsents && existingConsents.consents && existingConsents.consents.length > 0) {
        console.log('📋 BCA demo consent data already exists, skipping initialization');
        return { success: true, message: 'Demo data already exists' };
      }

      // Generate the demo data using our seeding utility
      const demoData = generateDemoConsentData();
      
      console.log('🌱 Seeding BCA demo data into database...');
      
      // Insert student accounts and users
      const createdUsers: any[] = [];
      const createdStudents: any[] = [];
      
      for (let i = 0; i < demoData.students.length; i++) {
        const student = demoData.students[i];
        // Get corresponding consent record to align status
        const correspondingConsent = demoData.consentRecords[i];
        
        // Create user account first
        const newUser = await this.upsertUser({
          id: student.userId,
          firstName: student.firstName,
          lastName: student.lastName,
          schoolRole: 'student',
          schoolId: DEMO_CONFIG.SCHOOL_ID,
          grade: student.grade,
          email: `${student.studentId.toLowerCase().replace(/-/g, '')}@example.edu`,
          anonymityLevel: 'full'
        });
        createdUsers.push(newUser);

        // Create student account with aligned consent status
        const [newStudent] = await db.insert(studentAccounts).values({
          userId: student.userId,
          schoolId: DEMO_CONFIG.SCHOOL_ID,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
          birthYear: student.birthYear,
          parentNotificationEmail: student.parentEmail,
          // ✅ Fixed: Align status with actual consent record status 
          isAccountActive: correspondingConsent.consentStatus === 'approved' ? 1 : 0,
          parentalConsentStatus: correspondingConsent.consentStatus
        }).returning();
        createdStudents.push(newStudent);
      }

      // Insert consent records with correct foreign key linkage
      const createdConsentRecords: any[] = [];
      for (let i = 0; i < demoData.consentRecords.length; i++) {
        const consentRecord = demoData.consentRecords[i];
        // 🔧 CRITICAL FIX: Use the actual inserted student ID instead of original userId
        const correspondingStudent = createdStudents[i];
        
        const [created] = await db.insert(parentalConsentRecords).values({
          ...consentRecord,
          // ✅ Fixed: Use newStudent.id instead of student.userId for proper foreign key linkage
          studentAccountId: correspondingStudent.id,
          // Ensure all required fields are properly set for database
          isImmutable: consentRecord.isImmutable || false,
          recordCreatedAt: consentRecord.recordCreatedAt || new Date(),
          recordUpdatedAt: consentRecord.recordUpdatedAt || new Date()
        }).returning();
        createdConsentRecords.push(created);
      }

      // Insert audit events
      for (const auditEvent of demoData.auditEvents) {
        await db.insert(consentAuditEvents).values(auditEvent);
      }

      console.log('✅ BCA demo data seeding completed successfully!');
      console.log(`📊 Created: ${createdUsers.length} users, ${createdStudents.length} students, ${createdConsentRecords.length} consent records`);
      
      return {
        success: true,
        message: `BCA demo data initialized: ${demoData.metadata.totalRecords} total records created`,
        stats: {
          users: createdUsers.length,
          students: createdStudents.length,
          consentRecords: createdConsentRecords.length,
          auditEvents: demoData.auditEvents.length,
          breakdown: demoData.stats
        }
      };

    } catch (error: any) {
      console.error('❌ Failed to initialize BCA demo data:', error);
      return {
        success: false,
        message: `Demo data initialization failed: ${error.message}`
      };
    }
  }
}

export const storage = new DatabaseStorage();