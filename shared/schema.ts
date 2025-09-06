import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  referralCode: varchar("referral_code"),
  referredBy: varchar("referred_by"),
  totalReferrals: integer("total_referrals").default(0),
  referralEarnings: integer("referral_earnings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kindnessPosts = pgTable("kindness_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to authenticated user
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  location: text("location").notNull(),
  city: text("city"),
  state: text("state"), 
  country: text("country"),
  heartsCount: integer("hearts_count").default(0).notNull(),
  echoesCount: integer("echoes_count").default(0).notNull(),
  isAnonymous: integer("is_anonymous").default(1).notNull(), // 1 = anonymous, 0 = show user
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // AI Analysis Fields
  sentimentScore: integer("sentiment_score"), // 0-100
  impactScore: integer("impact_score"), // 0-100  
  emotionalUplift: integer("emotional_uplift"), // 0-100
  kindnessCategory: varchar("kindness_category", { length: 50 }),
  rippleEffect: integer("ripple_effect"), // 0-100
  wellnessContribution: integer("wellness_contribution"), // 0-100
  aiConfidence: integer("ai_confidence"), // 0-100
  aiTags: jsonb("ai_tags"), // string array of AI-generated tags
  analyzedAt: timestamp("analyzed_at"),
});

export const kindnessCounter = pgTable("kindness_counter", {
  id: varchar("id").primaryKey().default("global"),
  count: integer("count").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User token tracking - now linked to authenticated users
export const userTokens = pgTable("user_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id), // Link to authenticated user
  echoBalance: integer("echo_balance").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

// Brand challenges - sponsored kindness challenges
export const brandChallenges = pgTable("brand_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(), // The challenge description
  brandName: varchar("brand_name", { length: 100 }).notNull(),
  brandLogo: text("brand_logo"), // URL or emoji for brand representation
  category: varchar("category", { length: 50 }).notNull(),
  challengeType: varchar("challenge_type", { length: 50 }).default("standard").notNull(), // standard, seasonal, recurring, location, team
  difficulty: varchar("difficulty", { length: 20 }).default("beginner").notNull(), // beginner, intermediate, advanced
  seasonalTheme: varchar("seasonal_theme", { length: 50 }), // holiday, spring, summer, fall, winter, special-event
  targetLocation: varchar("target_location", { length: 100 }), // For location-based challenges
  recurringPeriod: varchar("recurring_period", { length: 20 }), // daily, weekly, monthly
  minParticipants: integer("min_participants").default(1), // For team challenges
  maxParticipants: integer("max_participants").default(1), // For team challenges
  echoReward: integer("echo_reward").default(10).notNull(), // Higher reward for brand challenges
  bonusReward: integer("bonus_reward").default(0), // Extra seasonal/team bonuses
  isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  isPriority: integer("is_priority").default(0).notNull(), // 1 = featured challenge
  completionCount: integer("completion_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Track challenge completions - now user-based
export const challengeCompletions = pgTable("challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Achievement badges system
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  badge: text("badge").notNull(), // Emoji or icon for the badge
  category: varchar("category", { length: 50 }).notNull(), // kindness, challenges, social, milestones
  tier: varchar("tier", { length: 20 }).default("bronze").notNull(), // bronze, silver, gold, diamond, legendary
  requirement: text("requirement").notNull(), // JSON string describing unlock condition
  echoReward: integer("echo_reward").default(0).notNull(), // Bonus tokens for unlocking
  isActive: integer("is_active").default(1).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(), // Display order
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievement unlocks - now user-based
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").default(0), // For progress-based achievements
});

// B2B SaaS Features - Corporate Accounts
export const corporateAccounts = pgTable("corporate_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  companyLogo: text("company_logo"), // URL to company logo
  domain: varchar("domain", { length: 100 }).notNull().unique(), // email domain for employee verification
  industry: varchar("industry", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }), // startup, small, medium, large, enterprise
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("basic").notNull(), // basic, pro, enterprise
  maxEmployees: integer("max_employees").default(50).notNull(),
  monthlyBudget: integer("monthly_budget").default(1000).notNull(), // $ECHO budget for challenges
  primaryColor: varchar("primary_color", { length: 7 }).default("#8B5CF6"), // Brand color
  contactEmail: varchar("contact_email", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 100 }),
  isActive: integer("is_active").default(1).notNull(),
  billingStatus: varchar("billing_status", { length: 50 }).default("trial").notNull(), // trial, active, suspended, cancelled
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Corporate teams/departments
export const corporateTeams = pgTable("corporate_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  teamName: varchar("team_name", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }), // HR, Engineering, Marketing, Sales, etc.
  teamLead: varchar("team_lead", { length: 100 }), // Team lead name
  teamLeadEmail: varchar("team_lead_email", { length: 200 }),
  targetSize: integer("target_size").default(10), // Target team size
  currentSize: integer("current_size").default(0), // Current enrolled employees
  monthlyKindnessGoal: integer("monthly_kindness_goal").default(20), // Team kindness goal
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Corporate employees (links users to corporate structure)
export const corporateEmployees = pgTable("corporate_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id), // Links to authenticated users
  corporateAccountId: varchar("corporate_account_id").notNull(),
  teamId: varchar("team_id"), // Optional team assignment
  employeeEmail: varchar("employee_email", { length: 200 }).notNull(),
  displayName: varchar("display_name", { length: 100 }), // Optional display name for leaderboards
  role: varchar("role", { length: 50 }).default("employee").notNull(), // employee, team_lead, hr_admin, corporate_admin
  department: varchar("department", { length: 100 }),
  startDate: timestamp("start_date").defaultNow().notNull(),
  isActive: integer("is_active").default(1).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

// Corporate-specific challenges
export const corporateChallenges = pgTable("corporate_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  challengeType: varchar("challenge_type", { length: 50 }).default("company_wide").notNull(), // company_wide, team_based, department, individual
  targetTeamIds: text("target_team_ids"), // JSON array of team IDs (for team-based challenges)
  echoReward: integer("echo_reward").default(15).notNull(), // Higher rewards for corporate challenges
  bonusReward: integer("bonus_reward").default(0),
  participationGoal: integer("participation_goal").default(10), // How many employees should participate
  currentParticipation: integer("current_participation").default(0),
  completionCount: integer("completion_count").default(0).notNull(),
  isActive: integer("is_active").default(1).notNull(),
  isInternal: integer("is_internal").default(1).notNull(), // 1 = internal only, 0 = public
  createdByEmployeeId: varchar("created_by_employee_id"), // Which employee created it
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Corporate analytics tracking
export const corporateAnalytics = pgTable("corporate_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  analyticsDate: timestamp("analytics_date").notNull(), // Daily snapshot
  activeEmployees: integer("active_employees").default(0), // Employees active that day
  totalKindnessPosts: integer("total_kindness_posts").default(0),
  totalChallengesCompleted: integer("total_challenges_completed").default(0),
  totalEchoTokensEarned: integer("total_echo_tokens_earned").default(0),
  averageEngagementScore: integer("average_engagement_score").default(0), // 0-100 scale
  topPerformingTeamId: varchar("top_performing_team_id"),
  topPerformingDepartment: varchar("top_performing_department"),
  wellnessImpactScore: integer("wellness_impact_score").default(0), // Calculated wellness metric
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKindnessPostSchema = createInsertSchema(kindnessPosts).omit({
  id: true,
  createdAt: true,
});

export const insertKindnessCounterSchema = createInsertSchema(kindnessCounter).omit({
  id: true,
  updatedAt: true,
});

export const insertUserTokensSchema = createInsertSchema(userTokens).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

// Replit Auth schemas - Required for authentication
export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertBrandChallengeSchema = createInsertSchema(brandChallenges).omit({
  id: true,
  createdAt: true,
  completionCount: true,
});

export const insertChallengeCompletionSchema = createInsertSchema(challengeCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

// Rewards & Partners System
export const rewardPartners = pgTable("reward_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerName: varchar("partner_name", { length: 200 }).notNull(),
  partnerLogo: text("partner_logo"), // URL to partner logo
  partnerType: varchar("partner_type", { length: 50 }).default("retail").notNull(), // retail, food, wellness, tech, travel
  websiteUrl: text("website_url"),
  description: text("description").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  isFeatured: integer("is_featured").default(0).notNull(),
  minRedemptionAmount: integer("min_redemption_amount").default(100).notNull(), // Minimum $ECHO to redeem
  maxRedemptionAmount: integer("max_redemption_amount").default(5000).notNull(), // Maximum $ECHO per redemption
  contactEmail: varchar("contact_email", { length: 200 }),
  apiEndpoint: text("api_endpoint"), // For automated discount code generation
  apiKey: text("api_key"), // Encrypted API key for partner integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewardOffers = pgTable("reward_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(),
  offerType: varchar("offer_type", { length: 50 }).default("discount").notNull(), // discount, freebie, cashback, experience
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  offerValue: varchar("offer_value", { length: 50 }).notNull(), // "20%", "$5", "Buy 1 Get 1"
  echoCost: integer("echo_cost").notNull(), // Cost in $ECHO tokens
  badgeRequirement: varchar("badge_requirement"), // Required achievement badge
  maxRedemptions: integer("max_redemptions").default(-1), // -1 = unlimited
  currentRedemptions: integer("current_redemptions").default(0),
  isActive: integer("is_active").default(1).notNull(),
  isFeatured: integer("is_featured").default(0).notNull(),
  requiresVerification: integer("requires_verification").default(0).notNull(), // 1 = requires kindness verification
  expiresAt: timestamp("expires_at"),
  termsAndConditions: text("terms_and_conditions"),
  imageUrl: text("image_url"), // Offer banner image
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewardRedemptions = pgTable("reward_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  echoSpent: integer("echo_spent").notNull(),
  redemptionCode: varchar("redemption_code", { length: 50 }), // Generated discount/promo code
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, active, used, expired, refunded
  verificationRequired: integer("verification_required").default(0).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }).default("none").notNull(), // none, pending, approved, rejected
  verificationData: jsonb("verification_data"), // Photo/proof of kindness act
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
  refundedAt: timestamp("refunded_at"),
});

export const kindnessVerifications = pgTable("kindness_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id"), // Optional - link to kindness post
  redemptionId: varchar("redemption_id"), // Link to reward redemption requiring verification
  verificationType: varchar("verification_type", { length: 50 }).default("photo").notNull(), // photo, video, witness, receipt
  verificationData: jsonb("verification_data").notNull(), // URLs, witness info, etc.
  description: text("description").notNull(), // User's description of the act
  location: text("location"),
  witnessName: varchar("witness_name", { length: 100 }),
  witnessContact: varchar("witness_contact", { length: 200 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by"), // Admin user ID
  reviewNotes: text("review_notes"),
  bonusEchoAwarded: integer("bonus_echo_awarded").default(0), // Extra tokens for verified acts
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const badgeRewards = pgTable("badge_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  badgeId: varchar("badge_id").notNull(), // Links to achievement ID
  rewardType: varchar("reward_type", { length: 50 }).default("echo_multiplier").notNull(), // echo_multiplier, exclusive_offers, priority_access
  rewardValue: varchar("reward_value", { length: 100 }).notNull(), // "2x", "exclusive_partner_access", "early_access"
  description: text("description").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weeklyPrizes = pgTable("weekly_prizes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prizeType: varchar("prize_type", { length: 50 }).default("grand_prize").notNull(), // grand_prize, category_winner, participation
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  prizeValue: varchar("prize_value", { length: 50 }), // "$500 Gift Card", "Apple Watch"
  eligibilityCriteria: text("eligibility_criteria").notNull(), // JSON criteria for winning
  maxWinners: integer("max_winners").default(1).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  weekEndDate: timestamp("week_end_date").notNull(),
  drawDate: timestamp("draw_date").notNull(),
  status: varchar("status", { length: 50 }).default("upcoming").notNull(), // upcoming, active, drawn, completed
  sponsorId: varchar("sponsor_id"), // Partner sponsor
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prizeWinners = pgTable("prize_winners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prizeId: varchar("prize_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  winningCriteria: text("winning_criteria"), // What they won for
  contactStatus: varchar("contact_status", { length: 50 }).default("pending").notNull(), // pending, contacted, claimed, delivered
  claimCode: varchar("claim_code", { length: 50 }), // Code to claim prize
  deliveryInfo: jsonb("delivery_info"), // Shipping address, etc.
  wonAt: timestamp("won_at").defaultNow().notNull(),
  contactedAt: timestamp("contacted_at"),
  claimedAt: timestamp("claimed_at"),
  deliveredAt: timestamp("delivered_at"),
});

// Marketing & Viral Growth System
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").references(() => users.id),
  refereeId: varchar("referee_id").references(() => users.id),
  referralCode: varchar("referral_code").notNull(),
  rewardAmount: integer("reward_amount").default(50),
  status: varchar("status").default("pending").notNull(), // pending, completed, paid
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shareableAchievements = pgTable("shareable_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  achievementType: varchar("achievement_type").notNull(), // milestone, badge, streak, company_stats
  title: varchar("title").notNull(),
  description: varchar("description").notNull(),
  imageUrl: varchar("image_url"),
  shareData: jsonb("share_data"), // Custom data for different share types
  shareCount: integer("share_count").default(0),
  clickCount: integer("click_count").default(0),
  conversionCount: integer("conversion_count").default(0),
  isPublic: integer("is_public").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companyLeaderboards = pgTable("company_leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  leaderboardType: varchar("leaderboard_type").notNull(), // kindness_count, echo_earnings, streak, wellness_score
  period: varchar("period").notNull(), // daily, weekly, monthly, all_time
  title: varchar("title").notNull(),
  description: text("description"),
  prizes: jsonb("prizes"), // Prize structure for winners
  isPublic: integer("is_public").default(0).notNull(), // 0 = internal only, 1 = public
  isActive: integer("is_active").default(1).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leaderboardId: varchar("leaderboard_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  rank: integer("rank"),
  metadata: jsonb("metadata"), // Additional stats for display
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignName: varchar("campaign_name").notNull(),
  campaignType: varchar("campaign_type").notNull(), // referral, social_share, leaderboard, viral_challenge
  targetAudience: varchar("target_audience"), // new_users, active_users, corporate_admins
  title: varchar("title").notNull(),
  description: text("description"),
  callToAction: varchar("call_to_action"),
  rewardStructure: jsonb("reward_structure"), // How rewards are calculated
  trackingData: jsonb("tracking_data"), // UTM codes, attribution
  isActive: integer("is_active").default(1).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketingAnalytics = pgTable("marketing_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analyticsDate: timestamp("analytics_date").notNull(),
  metric: varchar("metric").notNull(), // referrals_sent, shares_made, clicks_received, conversions
  source: varchar("source"), // referral, social, email, direct
  value: integer("value").notNull(),
  metadata: jsonb("metadata"), // Additional context
  corporateAccountId: varchar("corporate_account_id"), // Optional - for company-specific metrics
  campaignId: varchar("campaign_id"), // Optional - for campaign attribution
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// B2B SaaS Insert Schemas
export const insertCorporateAccountSchema = createInsertSchema(corporateAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateTeamSchema = createInsertSchema(corporateTeams).omit({
  id: true,
  createdAt: true,
});

export const insertCorporateEmployeeSchema = createInsertSchema(corporateEmployees).omit({
  id: true,
  enrolledAt: true,
});

export const insertCorporateChallengeSchema = createInsertSchema(corporateChallenges).omit({
  id: true,
  createdAt: true,
  completionCount: true,
  currentParticipation: true,
});

export const insertCorporateAnalyticsSchema = createInsertSchema(corporateAnalytics).omit({
  id: true,
  createdAt: true,
});

// Rewards System Insert Schemas
export const insertRewardPartnerSchema = createInsertSchema(rewardPartners).omit({
  id: true,
  createdAt: true,
});

export const insertRewardOfferSchema = createInsertSchema(rewardOffers).omit({
  id: true,
  createdAt: true,
  currentRedemptions: true,
});

export const insertRewardRedemptionSchema = createInsertSchema(rewardRedemptions).omit({
  id: true,
  redeemedAt: true,
});

export const insertKindnessVerificationSchema = createInsertSchema(kindnessVerifications).omit({
  id: true,
  submittedAt: true,
});

export const insertBadgeRewardSchema = createInsertSchema(badgeRewards).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyPrizeSchema = createInsertSchema(weeklyPrizes).omit({
  id: true,
  createdAt: true,
});

export const insertPrizeWinnerSchema = createInsertSchema(prizeWinners).omit({
  id: true,
  wonAt: true,
});

// Marketing System Insert Schemas
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertShareableAchievementSchema = createInsertSchema(shareableAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyLeaderboardSchema = createInsertSchema(companyLeaderboards).omit({
  id: true,
  createdAt: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  calculatedAt: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingAnalyticsSchema = createInsertSchema(marketingAnalytics).omit({
  id: true,
  createdAt: true,
});

export type InsertKindnessPost = z.infer<typeof insertKindnessPostSchema>;
export type KindnessPost = typeof kindnessPosts.$inferSelect;
export type KindnessCounter = typeof kindnessCounter.$inferSelect;
export type UserTokens = typeof userTokens.$inferSelect;
export type InsertUserTokens = z.infer<typeof insertUserTokensSchema>;
export type BrandChallenge = typeof brandChallenges.$inferSelect;
export type InsertBrandChallenge = z.infer<typeof insertBrandChallengeSchema>;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;
export type InsertChallengeCompletion = z.infer<typeof insertChallengeCompletionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// B2B SaaS Types
export type CorporateAccount = typeof corporateAccounts.$inferSelect;
export type InsertCorporateAccount = z.infer<typeof insertCorporateAccountSchema>;
export type CorporateTeam = typeof corporateTeams.$inferSelect;
export type InsertCorporateTeam = z.infer<typeof insertCorporateTeamSchema>;
export type CorporateEmployee = typeof corporateEmployees.$inferSelect;
export type InsertCorporateEmployee = z.infer<typeof insertCorporateEmployeeSchema>;
export type CorporateChallenge = typeof corporateChallenges.$inferSelect;
export type InsertCorporateChallenge = z.infer<typeof insertCorporateChallengeSchema>;
export type CorporateAnalytics = typeof corporateAnalytics.$inferSelect;
export type InsertCorporateAnalytics = z.infer<typeof insertCorporateAnalyticsSchema>;

// Rewards System Types
export type RewardPartner = typeof rewardPartners.$inferSelect;
export type InsertRewardPartner = z.infer<typeof insertRewardPartnerSchema>;
export type RewardOffer = typeof rewardOffers.$inferSelect;
export type InsertRewardOffer = z.infer<typeof insertRewardOfferSchema>;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = z.infer<typeof insertRewardRedemptionSchema>;
export type KindnessVerification = typeof kindnessVerifications.$inferSelect;
export type InsertKindnessVerification = z.infer<typeof insertKindnessVerificationSchema>;
export type BadgeReward = typeof badgeRewards.$inferSelect;

// Marketing & Viral Growth Types
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ShareableAchievement = typeof shareableAchievements.$inferSelect;
export type InsertShareableAchievement = z.infer<typeof insertShareableAchievementSchema>;
export type CompanyLeaderboard = typeof companyLeaderboards.$inferSelect;
export type InsertCompanyLeaderboard = z.infer<typeof insertCompanyLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingAnalytics = typeof marketingAnalytics.$inferSelect;
export type InsertMarketingAnalytics = z.infer<typeof insertMarketingAnalyticsSchema>;
export type InsertBadgeReward = z.infer<typeof insertBadgeRewardSchema>;
export type WeeklyPrize = typeof weeklyPrizes.$inferSelect;
export type InsertWeeklyPrize = z.infer<typeof insertWeeklyPrizeSchema>;
export type PrizeWinner = typeof prizeWinners.$inferSelect;
export type InsertPrizeWinner = z.infer<typeof insertPrizeWinnerSchema>;

// User relations for better query performance
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(kindnessPosts),
  tokens: many(userTokens),
  achievements: many(userAchievements),
  challengeCompletions: many(challengeCompletions),
}));

export const kindnessPostsRelations = relations(kindnessPosts, ({ one }) => ({
  user: one(users, {
    fields: [kindnessPosts.userId],
    references: [users.id],
  }),
}));
