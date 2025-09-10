import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index, real, boolean, decimal } from "drizzle-orm/pg-core";
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
  // PREMIUM TIER SYSTEM
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free").notNull(), // free, basic, premium, enterprise
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("active").notNull(), // active, cancelled, suspended
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  // WORKPLACE-SPECIFIC FEATURES
  workplaceId: varchar("workplace_id"), // Links to corporate account if applicable
  anonymityLevel: varchar("anonymity_level", { length: 20 }).default("full").notNull(), // full, semi, public
  wellnessTrackingEnabled: integer("wellness_tracking_enabled").default(1).notNull(),
  burnoutAlertEnabled: integer("burnout_alert_enabled").default(0).notNull(), // Premium feature
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kindnessPosts = pgTable("kindness_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to authenticated user
  schoolId: varchar("school_id"), // Link to school for school-specific feeds
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

// ==========================================
// CURRICULUM INTEGRATION TABLES
// ==========================================

// Curriculum lesson plans and activities
export const curriculumLessons = pgTable("curriculum_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  gradeLevel: varchar("grade_level").notNull(), // K, 1, 2, 3, 4, 5, 6, 7, 8
  subject: varchar("subject").notNull(), // "Character Education", "Social Studies", "Language Arts"
  duration: integer("duration_minutes").notNull(), // 30, 45, 60 minutes
  kindnessTheme: varchar("kindness_theme").notNull(), // "Empathy", "Inclusion", "Helping Others"
  learningObjectives: text("learning_objectives").array().notNull(),
  materials: text("materials").array().notNull(),
  activities: text("activities").array().notNull(),
  reflectionQuestions: text("reflection_questions").array().notNull(),
  assessmentRubric: text("assessment_rubric"),
  extensionActivities: text("extension_activities").array(),
  crossCurricularConnections: text("cross_curricular_connections").array(),
  difficulty: varchar("difficulty").notNull().default("beginner"), // beginner, intermediate, advanced
  tags: text("tags").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teacher curriculum progress and implementation
export const curriculumProgress = pgTable("curriculum_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull(),
  lessonId: varchar("lesson_id").notNull().references(() => curriculumLessons.id),
  classId: varchar("class_id"), // Optional class identifier
  implementedAt: timestamp("implemented_at").notNull(),
  studentCount: integer("student_count").notNull(),
  engagementScore: integer("engagement_score"), // 1-10 teacher rating
  effectivenessScore: integer("effectiveness_score"), // 1-10 teacher rating
  teacherNotes: text("teacher_notes"),
  adaptations: text("adaptations"), // How teacher modified the lesson
  studentFeedback: text("student_feedback"),
  wouldRecommend: boolean("would_recommend"),
  completionStatus: varchar("completion_status").notNull().default("completed"), // planned, in_progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student individual responses to curriculum activities
export const studentCurriculumResponses = pgTable("student_curriculum_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  progressId: varchar("progress_id").notNull().references(() => curriculumProgress.id),
  lessonId: varchar("lesson_id").notNull().references(() => curriculumLessons.id),
  activityType: varchar("activity_type").notNull(), // "reflection", "role_play", "creative", "discussion"
  response: text("response"),
  kindnessAction: text("kindness_action"), // What kindness act did they commit to?
  completedAction: boolean("completed_action").default(false),
  actionReflection: text("action_reflection"),
  peerFeedback: text("peer_feedback"),
  teacherFeedback: text("teacher_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Curriculum resource library (videos, worksheets, etc.)
export const curriculumResources = pgTable("curriculum_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").references(() => curriculumLessons.id),
  title: varchar("title").notNull(),
  resourceType: varchar("resource_type").notNull(), // "video", "worksheet", "book", "website", "app"
  url: varchar("url"),
  description: text("description"),
  gradeLevel: varchar("grade_level"),
  isRequired: boolean("is_required").default(false),
  downloadCount: integer("download_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CurriculumLesson = typeof curriculumLessons.$inferSelect;
export type InsertCurriculumLesson = typeof curriculumLessons.$inferInsert;
export type CurriculumProgress = typeof curriculumProgress.$inferSelect;
export type InsertCurriculumProgress = typeof curriculumProgress.$inferInsert;
export type StudentCurriculumResponse = typeof studentCurriculumResponses.$inferSelect;
export type InsertStudentCurriculumResponse = typeof studentCurriculumResponses.$inferInsert;
export type CurriculumResource = typeof curriculumResources.$inferSelect;
export type InsertCurriculumResource = typeof curriculumResources.$inferInsert;

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
  // Corporate Sponsorship Fields
  sponsorCompany: varchar("sponsor_company", { length: 200 }), // Company sponsoring this reward
  sponsorLogo: text("sponsor_logo"), // Sponsor's logo URL
  sponsorshipType: varchar("sponsorship_type", { length: 50 }).default("full").notNull(), // full, partial, co-sponsor
  sponsorshipMessage: text("sponsorship_message"), // Custom message from sponsor
  monthlySponsorship: integer("monthly_sponsorship").default(0), // Monthly sponsorship revenue in cents
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

// SUPPORT CIRCLE FEATURE - Anonymous peer support for grades 6-8
export const supportPosts = pgTable("support_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional link to authenticated user
  content: text("content").notNull(), // The struggle/challenge being shared
  category: varchar("category", { length: 50 }).notNull(), // academic, social, family, emotional, physical, other
  schoolId: varchar("school_id"), // School identifier for filtering (Phase 1: text field)
  city: text("city"),
  state: text("state"), 
  country: text("country"),
  gradeLevel: varchar("grade_level", { length: 10 }), // "6", "7", "8" for age-appropriate filtering
  isAnonymous: integer("is_anonymous").default(1).notNull(), // Always anonymous for safety
  heartsCount: integer("hearts_count").default(0).notNull(), // Support reactions
  // Crisis Detection Fields
  isCrisis: integer("is_crisis").default(0).notNull(), // 1 = flagged as crisis
  crisisKeywords: jsonb("crisis_keywords"), // Array of detected crisis keywords
  crisisScore: integer("crisis_score").default(0), // 0-100 AI-determined crisis severity
  urgencyLevel: varchar("urgency_level", { length: 20 }).default("low").notNull(), // low, medium, high, critical
  flaggedAt: timestamp("flagged_at"), // When crisis was first detected
  // Professional Response Fields
  hasResponse: integer("has_response").default(0).notNull(), // 1 = professional has responded
  responseCount: integer("response_count").default(0).notNull(), // Number of professional responses
  lastResponseAt: timestamp("last_response_at"), // Most recent professional response
  assignedCounselorId: varchar("assigned_counselor_id"), // Counselor handling this case
  // Aggregation & Analytics
  viewCount: integer("view_count").default(0).notNull(), // How many times viewed
  reportCount: integer("report_count").default(0).notNull(), // Times reported as inappropriate
  isResolved: integer("is_resolved").default(0).notNull(), // 1 = student marked as resolved
  resolutionNote: text("resolution_note"), // Student's follow-up on how they're doing
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Professional responses to support posts
export const supportResponses = pgTable("support_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supportPostId: varchar("support_post_id").notNull().references(() => supportPosts.id),
  counselorId: varchar("counselor_id").notNull(), // Professional responder ID
  counselorName: varchar("counselor_name", { length: 100 }), // Display name (e.g., "Ms. Johnson, School Counselor")
  counselorCredentials: varchar("counselor_credentials", { length: 200 }), // "Licensed Professional Counselor"
  responseContent: text("response_content").notNull(), // The professional's supportive response
  responseType: varchar("response_type", { length: 50 }).default("support").notNull(), // support, resource, referral, follow_up
  includedResources: jsonb("included_resources"), // Array of helpful resources/links
  isPrivate: integer("is_private").default(0).notNull(), // 1 = private response (direct message style)
  heartsCount: integer("hearts_count").default(0).notNull(), // Student appreciation reactions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crisis escalation tracking
export const crisisEscalations = pgTable("crisis_escalations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supportPostId: varchar("support_post_id").notNull().references(() => supportPosts.id),
  escalatedBy: varchar("escalated_by").notNull(), // Counselor or admin who escalated
  escalationLevel: varchar("escalation_level", { length: 50 }).notNull(), // principal, parent, emergency, external
  escalationReason: text("escalation_reason").notNull(), // Why it was escalated
  actionsTaken: text("actions_taken"), // What steps were taken
  contactedParties: jsonb("contacted_parties"), // Who was contacted
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, resolved, transferred
  resolution: text("resolution"), // How the crisis was resolved
  escalatedAt: timestamp("escalated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// School-level support analytics for administrators
export const schoolSupportAnalytics = pgTable("school_support_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(), // School identifier
  analyticsDate: timestamp("analytics_date").notNull(), // Daily snapshot
  totalSupportPosts: integer("total_support_posts").default(0),
  activeCrises: integer("active_crises").default(0),
  resolvedSupportCases: integer("resolved_support_cases").default(0),
  topConcernCategory: varchar("top_concern_category", { length: 50 }), // Most common struggle category
  averageResponseTime: integer("average_response_time_hours").default(0), // Professional response time
  suggestedInterventions: jsonb("suggested_interventions"), // AI-suggested school-wide activities
  wellbeingScore: integer("wellbeing_score").default(75), // 0-100 overall school wellbeing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Licensed professional credentials (Phase 2 - keeping for structure)
export const licensedCounselors = pgTable("licensed_counselors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional link to user account
  displayName: varchar("display_name", { length: 100 }).notNull(), // "Ms. Johnson"
  credentials: varchar("credentials", { length: 200 }).notNull(), // "Licensed Professional Counselor"
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseState: varchar("license_state", { length: 50 }),
  specializations: jsonb("specializations"), // Array of specialization areas
  schoolsAuthorized: jsonb("schools_authorized"), // Which schools they can respond at
  isActive: integer("is_active").default(1).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(), // pending, verified, rejected
  verifiedBy: varchar("verified_by"), // Admin who verified credentials
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== DAILY WELLNESS CHECK-INS FOR GRADES 6-8 =====

// Daily wellness check-ins with mood tracking and proactive monitoring
export const wellnessCheckIns = pgTable("wellness_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  gradeLevel: varchar("grade_level").notNull(), // "6", "7", "8"
  studentId: varchar("student_id"), // Anonymous identifier, optional
  mood: varchar("mood").notNull(), // "great", "good", "okay", "struggling", "terrible"
  moodScore: integer("mood_score").notNull(), // 1-5 scale (5=great, 1=terrible)
  selectedEmoji: varchar("selected_emoji"), // 😄😊😐😔😢
  stressLevel: integer("stress_level"), // 1-5 scale (1=no stress, 5=very stressed)
  sleepQuality: integer("sleep_quality"), // 1-5 scale (1=terrible, 5=excellent)
  socialConnection: integer("social_connection"), // 1-5 scale (1=isolated, 5=very connected)
  academicPressure: integer("academic_pressure"), // 1-5 scale (1=none, 5=overwhelming)
  homeEnvironment: integer("home_environment"), // 1-5 scale (1=difficult, 5=supportive)
  notes: text("notes"), // Optional additional thoughts
  triggeredByNotification: integer("triggered_by_notification").default(1),
  notificationTime: timestamp("notification_time"),
  responseTime: timestamp("response_time").defaultNow(),
  completedAt: timestamp("completed_at").defaultNow(),
  checkInDate: timestamp("check_in_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Push notification subscriptions for daily wellness check-ins
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  gradeLevel: varchar("grade_level").notNull(), // "6", "7", "8"
  deviceId: varchar("device_id").notNull(), // Unique device identifier
  endpoint: text("endpoint").notNull(), // Web Push endpoint URL
  p256dh: text("p256dh").notNull(), // Public key for encryption
  auth: text("auth").notNull(), // Auth secret for encryption
  isActive: integer("is_active").default(1),
  preferredTime: varchar("preferred_time").default("09:00"), // "HH:MM" format
  timezone: varchar("timezone").default("America/New_York"),
  lastNotificationSent: timestamp("last_notification_sent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wellness trend analytics for school administrators
export const wellnessTrends = pgTable("wellness_trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  gradeLevel: varchar("grade_level").notNull(),
  analysisDate: timestamp("analysis_date").defaultNow(),
  totalCheckIns: integer("total_check_ins").default(0),
  averageMoodScore: decimal("average_mood_score", { precision: 3, scale: 2 }),
  averageStressLevel: decimal("average_stress_level", { precision: 3, scale: 2 }),
  criticalConcerns: integer("critical_concerns").default(0), // Mood score 1-2
  positiveReports: integer("positive_reports").default(0), // Mood score 4-5
  trendDirection: varchar("trend_direction"), // "improving", "declining", "stable"
  alertLevel: varchar("alert_level").default("normal"), // "normal", "watch", "concern", "critical"
  recommendations: jsonb("recommendations"), // Array of automated recommendations
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
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

// INDIVIDUAL SUBSCRIPTION PLANS (Revenue Diversification)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planName: varchar("plan_name", { length: 50 }).notNull(), // Free, Basic, Premium, Enterprise, Education
  planType: varchar("plan_type", { length: 20 }).default("individual").notNull(), // individual, corporate, education
  monthlyPrice: integer("monthly_price").default(0).notNull(), // Price in cents
  yearlyPrice: integer("yearly_price").default(0).notNull(), // Price in cents (usually discounted)
  features: jsonb("features").notNull(), // Array of features included
  limits: jsonb("limits").notNull(), // Usage limits (posts per month, etc.)
  isActive: integer("is_active").default(1).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// SCHOOL-SPECIFIC FEATURES
// Parent engagement system for schools
export const parentAccounts = pgTable("parent_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentEmail: varchar("parent_email", { length: 200 }).notNull().unique(),
  parentName: varchar("parent_name", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  preferredContact: varchar("preferred_contact", { length: 20 }).default("email").notNull(), // email, sms, both
  isVerified: integer("is_verified").default(0).notNull(),
  verificationCode: varchar("verification_code", { length: 10 }),
  consentGiven: integer("consent_given").default(0).notNull(), // COPPA compliance
  consentDate: timestamp("consent_date"),
  notificationsEnabled: integer("notifications_enabled").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Administrator accounts for school management
export const schoolAdministrators = pgTable("school_administrators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(), // principal, vice_principal, district_admin, superintendent
  schoolId: varchar("school_id"), // Link to corporate account representing school
  districtId: varchar("district_id").notNull(), // Link to district
  permissions: jsonb("permissions"), // JSON array of permission strings
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Google Classroom integration table
export const googleClassroomIntegrations = pgTable("google_classroom_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(), // Link to school
  teacherUserId: varchar("teacher_user_id").notNull().references(() => users.id),
  googleClassroomId: varchar("google_classroom_id").notNull(),
  courseName: varchar("course_name", { length: 255 }).notNull(),
  section: varchar("section", { length: 100 }),
  gradeLevel: varchar("grade_level", { length: 20 }),
  studentCount: integer("student_count").default(0),
  syncEnabled: integer("sync_enabled").default(1).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  accessToken: text("access_token"), // Encrypted Google access token
  refreshToken: text("refresh_token"), // Encrypted Google refresh token
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Link students to their parents (COPPA compliance)
// 🎓 COPPA-Compliant Student Accounts
export const studentAccounts = pgTable("student_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id), // Links to main users table
  schoolId: varchar("school_id").notNull(), // School restriction for safety
  // COPPA-compliant minimal data collection
  firstName: varchar("first_name", { length: 50 }).notNull(),
  grade: varchar("grade", { length: 5 }).notNull(), // K, 1, 2, 3, 4, 5, 6, 7, 8
  birthYear: integer("birth_year").notNull(), // For age verification, not birth date
  // Parental consent tracking
  parentalConsentStatus: varchar("parental_consent_status", { length: 20 }).default("pending").notNull(), // pending, approved, denied
  parentalConsentMethod: varchar("parental_consent_method", { length: 20 }), // email, phone, in_person
  parentalConsentDate: timestamp("parental_consent_date"),
  parentalConsentIP: varchar("parental_consent_ip"),
  consentVerificationCode: varchar("consent_verification_code"),
  // Privacy and safety
  isAccountActive: integer("is_account_active").default(0).notNull(), // Inactive until parental consent
  allowDirectMessages: integer("allow_direct_messages").default(0).notNull(), // Disabled by default
  allowPublicProfile: integer("allow_public_profile").default(0).notNull(), // Anonymous by default
  // Parent notification preferences  
  parentNotificationEmail: varchar("parent_notification_email"),
  parentNotificationPhone: varchar("parent_notification_phone"),
  // Account safety
  lastActiveAt: timestamp("last_active_at"),
  accountCreatedAt: timestamp("account_created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studentParentLinks = pgTable("student_parent_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentUserId: varchar("student_user_id").notNull().references(() => users.id),
  parentAccountId: varchar("parent_account_id").notNull().references(() => parentAccounts.id),
  relationshipType: varchar("relationship_type", { length: 20 }).default("parent").notNull(), // parent, guardian, caregiver
  isPrimary: integer("is_primary").default(0).notNull(), // Primary contact parent
  canViewActivity: integer("can_view_activity").default(1).notNull(),
  canReceiveReports: integer("can_receive_reports").default(1).notNull(),
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
});

// 📧 Parental Consent Tracking for COPPA Compliance
export const parentalConsentRequests = pgTable("parental_consent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentAccountId: varchar("student_account_id").notNull().references(() => studentAccounts.id),
  parentEmail: varchar("parent_email", { length: 200 }).notNull(),
  parentName: varchar("parent_name", { length: 100 }),
  verificationCode: varchar("verification_code", { length: 20 }).notNull(),
  consentStatus: varchar("consent_status", { length: 20 }).default("sent").notNull(), // sent, clicked, approved, denied, expired
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  clickedAt: timestamp("clicked_at"),
  consentedAt: timestamp("consented_at"),
  expiredAt: timestamp("expired_at"), // 72-hour expiration for security
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
});

// SEL (Social-Emotional Learning) standards alignment
export const selStandards = pgTable("sel_standards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  standardCode: varchar("standard_code", { length: 20 }).notNull().unique(), // SEL.1A, SEL.2B, etc.
  competencyArea: varchar("competency_area", { length: 50 }).notNull(), // self_awareness, self_management, social_awareness, relationship_skills, responsible_decision_making
  gradeLevel: varchar("grade_level", { length: 20 }).notNull(), // K-2, 3-5, 6-8, 9-12
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  kindnessCategories: jsonb("kindness_categories"), // Which kindness categories map to this standard
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track student progress on SEL standards
export const studentSelProgress = pgTable("student_sel_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentUserId: varchar("student_user_id").notNull().references(() => users.id),
  corporateAccountId: varchar("corporate_account_id").notNull(), // School/District ID
  selStandardId: varchar("sel_standard_id").notNull().references(() => selStandards.id),
  progressLevel: varchar("progress_level", { length: 20 }).default("beginning").notNull(), // beginning, developing, proficient, advanced
  evidenceCount: integer("evidence_count").default(0).notNull(), // Number of kindness posts supporting this standard
  lastActivityDate: timestamp("last_activity_date"),
  teacherNotes: text("teacher_notes"),
  isVisible: integer("is_visible").default(1).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Parent notifications and reports
export const parentNotifications = pgTable("parent_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentAccountId: varchar("parent_account_id").notNull().references(() => parentAccounts.id),
  studentUserId: varchar("student_user_id").notNull().references(() => users.id),
  notificationType: varchar("notification_type", { length: 30 }).notNull(), // weekly_report, achievement, milestone, concern
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  relatedData: jsonb("related_data"), // Achievement details, report data, etc.
  isRead: integer("is_read").default(0).notNull(),
  isSent: integer("is_sent").default(0).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// School safety and content monitoring (enhanced for schools)
export const schoolContentReports = pgTable("school_content_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(), // School ID
  postId: varchar("post_id").references(() => kindnessPosts.id),
  reporterUserId: varchar("reporter_user_id").references(() => users.id), // Who reported it
  reportType: varchar("report_type", { length: 30 }).notNull(), // inappropriate, bullying, concerning, urgent
  description: text("description"),
  moderatorNotes: text("moderator_notes"),
  actionTaken: varchar("action_taken", { length: 50 }), // removed, flagged, cleared, escalated
  priority: varchar("priority", { length: 20 }).default("normal").notNull(), // low, normal, high, urgent
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, reviewed, resolved
  reviewedBy: varchar("reviewed_by"), // Teacher/admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ANONYMOUS WORKPLACE SENTIMENT (No Personal Data)
export const workplaceSentimentData = pgTable("workplace_sentiment_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  department: varchar("department", { length: 100 }),
  teamSize: varchar("team_size", { length: 20 }), // small, medium, large
  sentimentScore: integer("sentiment_score").notNull(), // 0-100
  stressIndicators: jsonb("stress_indicators"), // Anonymous patterns detected
  positivityTrends: jsonb("positivity_trends"), // Upward/downward trends
  riskFactors: jsonb("risk_factors"), // Warning signs without personal data
  categoryBreakdown: jsonb("category_breakdown"), // Kindness categories by frequency
  isAnonymized: integer("is_anonymized").default(1).notNull(), // Always 1 for privacy
  dataDate: timestamp("data_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Individual Subscription Insert Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

// Individual Subscription Insert Schemas
export const insertWorkplaceSentimentDataSchema = createInsertSchema(workplaceSentimentData).omit({
  id: true,
  createdAt: true,
});

// School system insert schemas
export const insertParentAccountSchema = createInsertSchema(parentAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertStudentAccountSchema = createInsertSchema(studentAccounts).omit({
  id: true,
  accountCreatedAt: true,
  updatedAt: true,
  isAccountActive: true,
  parentalConsentStatus: true,
});

export const insertParentalConsentRequestSchema = createInsertSchema(parentalConsentRequests).omit({
  id: true,
  requestedAt: true,
  consentStatus: true,
});

export const insertStudentParentLinkSchema = createInsertSchema(studentParentLinks).omit({
  id: true,
  linkedAt: true,
});

export const insertSelStandardSchema = createInsertSchema(selStandards).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSelProgressSchema = createInsertSchema(studentSelProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertParentNotificationSchema = createInsertSchema(parentNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertSchoolContentReportSchema = createInsertSchema(schoolContentReports).omit({
  id: true,
  createdAt: true,
});

export const insertSchoolAdministratorSchema = createInsertSchema(schoolAdministrators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoogleClassroomIntegrationSchema = createInsertSchema(googleClassroomIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for the subscription and school systems
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type WorkplaceSentimentData = typeof workplaceSentimentData.$inferSelect;
export type InsertWorkplaceSentimentData = z.infer<typeof insertWorkplaceSentimentDataSchema>;

// School system types
export type ParentAccount = typeof parentAccounts.$inferSelect;
export type InsertParentAccount = z.infer<typeof insertParentAccountSchema>;
export type StudentAccount = typeof studentAccounts.$inferSelect;
export type InsertStudentAccount = z.infer<typeof insertStudentAccountSchema>;
export type ParentalConsentRequest = typeof parentalConsentRequests.$inferSelect;
export type InsertParentalConsentRequest = z.infer<typeof insertParentalConsentRequestSchema>;
export type StudentParentLink = typeof studentParentLinks.$inferSelect;
export type InsertStudentParentLink = z.infer<typeof insertStudentParentLinkSchema>;
export type SelStandard = typeof selStandards.$inferSelect;
export type InsertSelStandard = z.infer<typeof insertSelStandardSchema>;
export type StudentSelProgress = typeof studentSelProgress.$inferSelect;
export type InsertStudentSelProgress = z.infer<typeof insertStudentSelProgressSchema>;
export type ParentNotification = typeof parentNotifications.$inferSelect;
export type InsertParentNotification = z.infer<typeof insertParentNotificationSchema>;
export type SchoolContentReport = typeof schoolContentReports.$inferSelect;
export type InsertSchoolContentReport = z.infer<typeof insertSchoolContentReportSchema>;
export type SchoolAdministrator = typeof schoolAdministrators.$inferSelect;
export type InsertSchoolAdministrator = z.infer<typeof insertSchoolAdministratorSchema>;
export type GoogleClassroomIntegration = typeof googleClassroomIntegrations.$inferSelect;
export type InsertGoogleClassroomIntegration = z.infer<typeof insertGoogleClassroomIntegrationSchema>;

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

// 🔮 AI Kindness Prediction Engine
export const wellnessPredictions = pgTable("wellness_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  corporateAccountId: varchar("corporate_account_id"),
  predictionType: varchar("prediction_type").notNull(), // stress_risk, burnout_warning, team_tension, support_needed
  riskScore: integer("risk_score").notNull(), // 1-100, higher = more urgent
  confidence: integer("confidence").notNull(), // 1-100, how confident AI is
  reasoning: text("reasoning"), // Why AI made this prediction
  suggestedActions: jsonb("suggested_actions"), // What kindness actions to take
  triggerPatterns: jsonb("trigger_patterns"), // What patterns caused this prediction
  isActive: integer("is_active").default(1).notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  predictionFor: timestamp("prediction_for").notNull(), // When this event is predicted to occur
});

// 🌍 Real-time Global Wellness Heatmap
export const wellnessHeatmapData = pgTable("wellness_heatmap_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id"), // null for global data
  region: varchar("region"), // continent, country, or state
  city: varchar("city"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  moodScore: integer("mood_score").notNull(), // 1-100, anonymized mood
  kindnessActivity: integer("kindness_activity").notNull(), // Acts per hour
  stressLevel: integer("stress_level").notNull(), // 1-100, derived from activity patterns
  teamCollaboration: integer("team_collaboration").default(50), // 1-100
  positivityTrend: varchar("positivity_trend").default("stable"), // rising, falling, stable
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  anonymizedUserCount: integer("anonymized_user_count").default(1),
});

// 🎯 Smart Kindness Matching
export const kindnessOpportunities = pgTable("kindness_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdForUserId: varchar("created_for_user_id").references(() => users.id),
  opportunityType: varchar("opportunity_type").notNull(), // colleague_support, skill_sharing, mentor_moment, team_boost
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  suggestedAction: text("suggested_action"), // Specific action to take
  targetUserId: varchar("target_user_id"), // Who might benefit (anonymized)
  matchingScore: integer("matching_score").notNull(), // 1-100, how good this match is
  aiReasoning: text("ai_reasoning"), // Why AI suggested this
  estimatedImpact: integer("estimated_impact"), // 1-100, predicted wellness impact
  difficulty: varchar("difficulty").default("easy"), // easy, medium, hard
  timeRequired: integer("time_required_minutes"), // Estimated time
  tags: jsonb("tags"), // Skills, departments, interests involved
  isCompleted: integer("is_completed").default(0),
  completedAt: timestamp("completed_at"),
  impactRating: integer("impact_rating"), // 1-5 stars from participant
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // When this opportunity expires
});

// 📊 ESG Impact Integration
export const esgReports = pgTable("esg_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  reportPeriod: varchar("report_period").notNull(), // monthly, quarterly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  employeeWellnessScore: integer("employee_wellness_score"), // 1-100
  kindnessActivities: integer("kindness_activities"),
  stressReductionPercent: real("stress_reduction_percent"),
  engagementImprovement: real("engagement_improvement"),
  anonymousParticipation: real("anonymous_participation"),
  diversityInclusionScore: integer("diversity_inclusion_score"),
  mentalHealthSupport: integer("mental_health_support_instances"),
  communityImpactHours: real("community_impact_hours"),
  carbonFootprintReduced: real("carbon_footprint_reduced"), // From remote kindness activities
  sdgAlignment: jsonb("sdg_alignment"), // Which UN SDGs this supports
  complianceStandards: jsonb("compliance_standards"), // Which standards met
  reportData: jsonb("report_data"), // Full JSON report
  reportUrl: varchar("report_url"), // Generated PDF URL
  isPublished: integer("is_published").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 🏆 Kindness Impact Certificates  
export const kindnessCertificates = pgTable("kindness_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  certificateType: varchar("certificate_type").notNull(), // kindness_champion, wellness_advocate, culture_builder
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  criteriaMetadata: jsonb("criteria_metadata"), // What achievement unlocked this
  blockchainHash: varchar("blockchain_hash"), // Immutable proof of achievement
  blockchainNetwork: varchar("blockchain_network").default("polygon"), // Which blockchain
  nftTokenId: varchar("nft_token_id"), // Optional NFT representation
  shareableUrl: varchar("shareable_url"), // Public verification URL
  anonymousDisplayName: varchar("anonymous_display_name"), // For public sharing
  impactMetrics: jsonb("impact_metrics"), // Quantified impact data
  badgeImageUrl: varchar("badge_image_url"), // Generated certificate image
  isVerified: integer("is_verified").default(1),
  isPubliclyShareable: integer("is_publicly_shareable").default(1),
  linkedinShareCount: integer("linkedin_share_count").default(0),
  verificationClicks: integer("verification_clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  validUntil: timestamp("valid_until"), // Some certificates may expire
});

// ⏰ Time-Locked Wellness Messages
export const timeLockedMessages = pgTable("time_locked_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderUserId: varchar("sender_user_id").references(() => users.id),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  messageType: varchar("message_type").notNull(), // encouragement, milestone_celebration, anniversary_note, support_message
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  unlockCondition: varchar("unlock_condition").notNull(), // date, achievement, milestone, stress_detected
  unlockValue: varchar("unlock_value").notNull(), // Specific date/condition value
  unlockDate: timestamp("unlock_date"), // When message becomes available
  emotionalTone: varchar("emotional_tone"), // uplifting, supportive, celebratory, motivational
  attachedReward: integer("attached_reward").default(0), // $ECHO tokens to unlock with message
  isAnonymous: integer("is_anonymous").default(1),
  isUnlocked: integer("is_unlocked").default(0),
  unlockedAt: timestamp("unlocked_at"),
  wasRead: integer("was_read").default(0),
  readAt: timestamp("read_at"),
  recipientRating: integer("recipient_rating"), // 1-5 stars for message impact
  createdAt: timestamp("created_at").defaultNow().notNull(),
  scheduledFor: timestamp("scheduled_for"), // Future delivery date
});

// Advanced Features Insert Schemas (after table definitions)
export const insertWellnessPredictionSchema = createInsertSchema(wellnessPredictions).omit({
  id: true,
  createdAt: true,
});

export const insertWellnessHeatmapDataSchema = createInsertSchema(wellnessHeatmapData).omit({
  id: true,
  lastUpdated: true,
});

export const insertKindnessOpportunitySchema = createInsertSchema(kindnessOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertEsgReportSchema = createInsertSchema(esgReports).omit({
  id: true,
  createdAt: true,
});

export const insertKindnessCertificateSchema = createInsertSchema(kindnessCertificates).omit({
  id: true,
  createdAt: true,
});

export const insertTimeLockedMessageSchema = createInsertSchema(timeLockedMessages).omit({
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

// Advanced Features Types
export type WellnessPrediction = typeof wellnessPredictions.$inferSelect;
export type InsertWellnessPrediction = z.infer<typeof insertWellnessPredictionSchema>;
export type WellnessHeatmapData = typeof wellnessHeatmapData.$inferSelect;
export type InsertWellnessHeatmapData = z.infer<typeof insertWellnessHeatmapDataSchema>;
export type KindnessOpportunity = typeof kindnessOpportunities.$inferSelect;
export type InsertKindnessOpportunity = z.infer<typeof insertKindnessOpportunitySchema>;
export type EsgReport = typeof esgReports.$inferSelect;
export type InsertEsgReport = z.infer<typeof insertEsgReportSchema>;
export type KindnessCertificate = typeof kindnessCertificates.$inferSelect;
export type InsertKindnessCertificate = z.infer<typeof insertKindnessCertificateSchema>;
export type TimeLockedMessage = typeof timeLockedMessages.$inferSelect;
export type InsertTimeLockedMessage = z.infer<typeof insertTimeLockedMessageSchema>;
export type InsertBadgeReward = z.infer<typeof insertBadgeRewardSchema>;
export type WeeklyPrize = typeof weeklyPrizes.$inferSelect;
export type InsertWeeklyPrize = z.infer<typeof insertWeeklyPrizeSchema>;
export type PrizeWinner = typeof prizeWinners.$inferSelect;
export type InsertPrizeWinner = z.infer<typeof insertPrizeWinnerSchema>;

// PREMIUM SPONSOR ANALYTICS & TRACKING SYSTEM

// Sponsor analytics tracking
export const sponsorAnalytics = pgTable("sponsor_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorCompany: varchar("sponsor_company", { length: 200 }).notNull(),
  offerId: varchar("offer_id"), // Links to specific reward offer
  eventType: varchar("event_type", { length: 50 }).notNull(), // impression, click, redemption, conversion
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 100 }),
  location: text("location"), // User location for geographic analytics
  userAgent: text("user_agent"), // Device/browser info
  referrerUrl: text("referrer_url"), // Where they came from
  targetUrl: text("target_url"), // Sponsor website visited
  engagementDuration: integer("engagement_duration").default(0), // Time spent viewing
  conversionValue: integer("conversion_value").default(0), // Business value generated
  metadata: jsonb("metadata"), // Additional tracking data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced sponsor profiles with custom branding
export const sponsorProfiles = pgTable("sponsor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  logoUrl: text("logo_url"),
  logoAltText: varchar("logo_alt_text", { length: 100 }),
  websiteUrl: text("website_url").notNull(),
  primaryColor: varchar("primary_color", { length: 7 }).default("#3b82f6"), // Brand hex color
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#8b5cf6"),
  brandMessage: text("brand_message"), // Custom tagline
  description: text("description"), // Company description
  industry: varchar("industry", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }), // startup, small, medium, large, enterprise
  sponsorshipTier: varchar("sponsorship_tier", { length: 50 }).default("basic").notNull(), // basic, premium, enterprise
  monthlyBudget: integer("monthly_budget").default(2000).notNull(), // Monthly sponsorship budget in cents
  targetGeography: jsonb("target_geography"), // Countries, states, cities to target
  targetDemographics: jsonb("target_demographics"), // Age, interests, user types
  socialMediaLinks: jsonb("social_media_links"), // Twitter, LinkedIn, etc.
  contactEmail: varchar("contact_email", { length: 200 }),
  accountManagerName: varchar("account_manager_name", { length: 100 }),
  isActive: integer("is_active").default(1).notNull(),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sponsor impact reporting
export const sponsorImpactReports = pgTable("sponsor_impact_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorCompany: varchar("sponsor_company", { length: 200 }).notNull(),
  reportPeriodStart: timestamp("report_period_start").notNull(),
  reportPeriodEnd: timestamp("report_period_end").notNull(),
  totalImpressions: integer("total_impressions").default(0),
  totalClicks: integer("total_clicks").default(0),
  totalRedemptions: integer("total_redemptions").default(0),
  clickThroughRate: real("click_through_rate").default(0), // CTR percentage
  conversionRate: real("conversion_rate").default(0), // Redemption rate
  kindnessActsEnabled: integer("kindness_acts_enabled").default(0), // Acts sponsored enabled
  usersReached: integer("users_reached").default(0), // Unique users who saw sponsorship
  engagementScore: integer("engagement_score").default(0), // 0-100 engagement rating
  brandSentiment: integer("brand_sentiment").default(0), // 0-100 positive sentiment
  costPerEngagement: integer("cost_per_engagement").default(0), // Cost in cents
  roi: real("roi").default(0), // Return on investment percentage
  reportData: jsonb("report_data"), // Detailed analytics JSON
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// Sponsor campaign management
export const sponsorCampaigns = pgTable("sponsor_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorCompany: varchar("sponsor_company", { length: 200 }).notNull(),
  campaignName: varchar("campaign_name", { length: 200 }).notNull(),
  campaignType: varchar("campaign_type", { length: 50 }).default("reward_sponsorship").notNull(), // reward_sponsorship, challenge_sponsorship, branded_content
  targetAudience: jsonb("target_audience"), // Demographics, geography, interests
  campaignMessage: text("campaign_message"),
  specialOffers: jsonb("special_offers"), // Holiday promotions, limited time offers
  budget: integer("budget").notNull(), // Campaign budget in cents
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  priority: integer("priority").default(1), // 1-10 priority level
  successMetrics: jsonb("success_metrics"), // KPIs and goals
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter and communication tracking
export const sponsorCommunications = pgTable("sponsor_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorCompany: varchar("sponsor_company", { length: 200 }).notNull(),
  communicationType: varchar("communication_type", { length: 50 }).notNull(), // newsletter, social_media, push_notification, email
  subject: varchar("subject", { length: 200 }),
  content: text("content"),
  targetAudience: jsonb("target_audience"), // Who received the communication
  recipientCount: integer("recipient_count").default(0),
  openRate: real("open_rate").default(0), // Email open rate
  clickRate: real("click_rate").default(0), // Click-through rate
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Create insert schemas for new tables
// ========== REVOLUTIONARY FEATURES - INDUSTRY FIRST ==========

// REVOLUTIONARY #1: AI-Powered Anonymous Conflict Resolution Engine
export const conflictReports = pgTable('conflict_reports', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id"), // Anonymous - can be null
  conflictType: varchar("conflict_type", { length: 50 }).notNull(), // 'peer_conflict', 'exclusion', 'verbal_disagreement', 'physical_incident'
  conflictDescription: text("conflict_description").notNull(),
  involvedParties: text("involved_parties").notNull(), // Anonymized descriptions like "two students in grade 3"
  location: text("location").notNull(),
  severityLevel: varchar("severity_level", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'urgent'
  emotionalImpact: text("emotional_impact").notNull(), // AI-detected emotional state
  aiAnalysis: text("ai_analysis"), // AI conflict analysis and insights
  status: varchar("status", { length: 30 }).notNull().default('reported'), // 'reported', 'ai_processing', 'mediation_suggested', 'teacher_alerted', 'resolved'
  schoolId: varchar("school_id"),
  gradeLevel: varchar("grade_level", { length: 10 }),
  isAnonymous: integer("is_anonymous").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const conflictResolutions = pgTable('conflict_resolutions', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conflictReportId: varchar("conflict_report_id").notNull().references(() => conflictReports.id),
  resolutionType: varchar("resolution_type", { length: 30 }).notNull(), // 'ai_mediated', 'peer_mediation', 'teacher_intervention', 'self_resolved'
  resolutionSteps: text("resolution_steps").notNull(), // JSON array of suggested resolution steps
  aiMediationScript: text("ai_mediation_script"), // AI-generated mediation dialogue
  outcomeTracking: text("outcome_tracking"), // Follow-up check results
  effectivenessScore: integer("effectiveness_score"), // 1-10 based on follow-up
  teacherNotified: integer("teacher_notified").notNull().default(0),
  isSuccessful: integer("is_successful"),
  followUpScheduled: timestamp("follow_up_scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});

// REVOLUTIONARY #2: Predictive Bullying Prevention Analytics
export const bullyingPredictions = pgTable('bullying_predictions', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  gradeLevel: varchar("grade_level", { length: 10 }).notNull(),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(), // 'low', 'moderate', 'high', 'critical'
  predictionConfidence: integer("prediction_confidence").notNull(), // 0-100
  riskFactors: jsonb("risk_factors").notNull(), // JSON array of detected risk patterns
  socialDynamicsScore: integer("social_dynamics_score").notNull(), // Anonymized social health score
  interventionSuggestions: text("intervention_suggestions").notNull(), // AI-generated prevention strategies
  predictedTimeframe: varchar("predicted_timeframe", { length: 30 }).notNull(), // 'next_week', 'next_month', etc.
  teacherAlerted: integer("teacher_alerted").notNull().default(0),
  preventionActionsCount: integer("prevention_actions_count").notNull().default(0),
  actualIncidentOccurred: integer("actual_incident_occurred"), // For ML model improvement
  createdAt: timestamp("created_at").notNull().defaultNow(),
  validUntil: timestamp("valid_until").notNull()
});

// REVOLUTIONARY #3: Cross-School Anonymous Kindness Exchange
export const kindnessExchanges = pgTable('kindness_exchanges', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderSchoolId: varchar("sender_school_id").notNull(),
  recipientSchoolId: varchar("recipient_school_id").notNull(),
  senderGrade: varchar("sender_grade", { length: 10 }).notNull(),
  recipientGrade: varchar("recipient_grade", { length: 10 }).notNull(),
  kindnessMessage: text("kindness_message").notNull(),
  kindnessType: varchar("kindness_type", { length: 30 }).notNull(), // 'encouragement', 'support', 'celebration', 'sympathy'
  isMatched: integer("is_matched").notNull().default(0),
  matchingScore: integer("matching_score"), // AI-calculated compatibility
  deliveryStatus: varchar("delivery_status", { length: 20 }).notNull().default('pending'), // 'pending', 'delivered', 'acknowledged'
  impactRating: integer("impact_rating"), // 1-5 from recipient
  crossCulturalFlag: integer("cross_cultural_flag").notNull().default(0), // International exchanges
  distanceKm: integer("distance_km"), // Geographic distance for impact measurement
  languageFrom: varchar("language_from", { length: 20 }).notNull().default('English'),
  languageTo: varchar("language_to", { length: 20 }).notNull().default('English'),
  aiTranslated: integer("ai_translated").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  acknowledgedAt: timestamp("acknowledged_at")
});

export const insertSponsorAnalyticsSchema = createInsertSchema(sponsorAnalytics);
export const insertSponsorProfileSchema = createInsertSchema(sponsorProfiles);
export const insertSponsorImpactReportSchema = createInsertSchema(sponsorImpactReports);
export const insertSponsorCampaignSchema = createInsertSchema(sponsorCampaigns);
export const insertSponsorCommunicationSchema = createInsertSchema(sponsorCommunications);

// Revolutionary features insert schemas
export const insertConflictReportSchema = createInsertSchema(conflictReports);
export const insertConflictResolutionSchema = createInsertSchema(conflictResolutions);
export const insertBullyingPredictionSchema = createInsertSchema(bullyingPredictions);
export const insertKindnessExchangeSchema = createInsertSchema(kindnessExchanges);

// Type exports for new tables
export type SponsorAnalytics = typeof sponsorAnalytics.$inferSelect;
export type InsertSponsorAnalytics = z.infer<typeof insertSponsorAnalyticsSchema>;
export type SponsorProfile = typeof sponsorProfiles.$inferSelect;
export type InsertSponsorProfile = z.infer<typeof insertSponsorProfileSchema>;
export type SponsorImpactReport = typeof sponsorImpactReports.$inferSelect;
export type InsertSponsorImpactReport = z.infer<typeof insertSponsorImpactReportSchema>;
export type SponsorCampaign = typeof sponsorCampaigns.$inferSelect;
export type InsertSponsorCampaign = z.infer<typeof insertSponsorCampaignSchema>;
export type SponsorCommunication = typeof sponsorCommunications.$inferSelect;
export type InsertSponsorCommunication = z.infer<typeof insertSponsorCommunicationSchema>;

// Revolutionary features type exports - INDUSTRY FIRST
export type ConflictReport = typeof conflictReports.$inferSelect;
export type InsertConflictReport = z.infer<typeof insertConflictReportSchema>;
export type ConflictResolution = typeof conflictResolutions.$inferSelect;
export type InsertConflictResolution = z.infer<typeof insertConflictResolutionSchema>;
export type BullyingPrediction = typeof bullyingPredictions.$inferSelect;
export type InsertBullyingPrediction = z.infer<typeof insertBullyingPredictionSchema>;
export type KindnessExchange = typeof kindnessExchanges.$inferSelect;
export type InsertKindnessExchange = z.infer<typeof insertKindnessExchangeSchema>;

// Summer Engagement Program Tables
export const summerChallenges = pgTable("summer_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(), // Week 1-12 for summer
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // "kindness", "family", "creativity", "community"
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // "easy", "medium", "hard"
  points: integer("points").default(10),
  ageGroup: varchar("age_group", { length: 20 }).notNull(), // "k-2", "3-5", "6-8"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSummerProgress = pgTable("user_summer_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  challengeId: varchar("challenge_id").notNull().references(() => summerChallenges.id),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
  parentApproved: boolean("parent_approved").default(false),
  notes: text("notes"), // Student reflection on the activity
  createdAt: timestamp("created_at").defaultNow(),
});

export const summerActivities = pgTable("summer_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => summerChallenges.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  timeEstimate: integer("time_estimate_minutes").default(30), // in minutes
  materialsNeeded: text("materials_needed"), // comma-separated list
  instructions: text("instructions").notNull(),
  parentInvolvement: boolean("parent_involvement").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family Kindness Challenges - Year-round family engagement system  
export const yearRoundFamilyChallenges = pgTable("year_round_family_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(), // Week 1-52 for year-round
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  theme: varchar("theme", { length: 50 }).notNull(), // "family_gratitude", "community_helper", "kindness_coach", etc.
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // "easy", "medium", "hard"
  kidPoints: integer("kid_points").default(10), // Points for kids
  parentPoints: integer("parent_points").default(5), // Points for parents (dual reward system)
  ageGroup: varchar("age_group", { length: 20 }).notNull(), // "k-2", "3-5", "6-8", "family"
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family challenge participation tracking
export const familyProgress = pgTable("family_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => yearRoundFamilyChallenges.id),
  studentId: varchar("student_id").notNull(), // The child participant
  parentId: varchar("parent_id"), // Optional parent participant
  completedAt: timestamp("completed_at"),
  kidPointsEarned: integer("kid_points_earned").default(0),
  parentPointsEarned: integer("parent_points_earned").default(0),
  familyReflection: text("family_reflection"), // Family reflection on the activity
  photoSubmitted: boolean("photo_submitted").default(false),
  teacherApproved: boolean("teacher_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family challenge activities (detailed instructions)
export const familyActivities = pgTable("family_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => yearRoundFamilyChallenges.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  kidInstructions: text("kid_instructions").notNull(), // Instructions for the child
  parentInstructions: text("parent_instructions"), // Instructions for the parent
  timeEstimate: integer("time_estimate_minutes").default(30),
  materialsNeeded: text("materials_needed"),
  locationSuggestion: varchar("location_suggestion", { length: 100 }), // "home", "school", "community", "outdoors"
  discussionPrompts: text("discussion_prompts"), // Family discussion questions
  createdAt: timestamp("created_at").defaultNow(),
});

// School fundraising campaigns - DOUBLE TOKEN REWARDS FOR DONATIONS! 
export const schoolFundraisers = pgTable("school_fundraisers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolName: varchar("school_name").notNull(),
  campaignName: varchar("campaign_name").notNull(),
  description: text("description").notNull(),
  goalAmount: integer("goal_amount").notNull(), // in cents
  currentAmount: integer("current_amount").default(0), // in cents
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  tokenMultiplier: integer("token_multiplier").default(2), // 2x = double tokens!
  createdAt: timestamp("created_at").defaultNow(),
});

// Track family donations to school fundraisers
export const familyDonations = pgTable("family_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fundraiserId: varchar("fundraiser_id").notNull().references(() => schoolFundraisers.id),
  userTokenId: varchar("user_token_id").notNull().references(() => userTokens.id),
  donationAmount: integer("donation_amount").notNull(), // in cents
  kidTokensEarned: integer("kid_tokens_earned").notNull(),
  parentTokensEarned: integer("parent_tokens_earned").notNull(),
  isVerified: boolean("is_verified").default(false),
  donationDate: timestamp("donation_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const summerNotifications = pgTable("summer_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull(),
  studentId: varchar("student_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "activity_reminder", "progress_update", "weekly_summary"
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy family challenges (keeping for compatibility)
export const legacyFamilyChallenges = pgTable("family_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  estimatedTime: integer("estimated_time_minutes").default(60),
  parentChildActivity: boolean("parent_child_activity").default(true),
  pointsForFamily: integer("points_for_family").default(25),
  weekAvailable: integer("week_available"), // Which summer week this becomes available
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Summer Engagement insert schemas
export const insertSummerChallengeSchema = createInsertSchema(summerChallenges);
export const insertUserSummerProgressSchema = createInsertSchema(userSummerProgress);
export const insertSummerActivitySchema = createInsertSchema(summerActivities);
export const insertSummerNotificationSchema = createInsertSchema(summerNotifications);
export const insertFamilyChallengeSchema = createInsertSchema(legacyFamilyChallenges);

// New Family Kindness Challenge types
export const insertYearRoundFamilyChallengeSchema = createInsertSchema(yearRoundFamilyChallenges);
export const insertFamilyProgressSchema = createInsertSchema(familyProgress);
export const insertFamilyActivitySchema = createInsertSchema(familyActivities);

// School Fundraiser types - DOUBLE TOKEN REWARDS!
export const insertSchoolFundraiserSchema = createInsertSchema(schoolFundraisers)
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  });
export const insertFamilyDonationSchema = createInsertSchema(familyDonations);

// ===============================
// 🎓 KINDNESS MENTORS SYSTEM - PEER GUIDANCE & RECOGNITION! 
// ===============================

// Mentor-Mentee Relationships
export const mentorships = pgTable("mentorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorUserId: varchar("mentor_user_id").notNull().references(() => users.id),
  menteeUserId: varchar("mentee_user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id"), // For school-based mentoring programs
  mentorAgeGroup: varchar("mentor_age_group", { length: 20 }).notNull(), // 6-8, 9-12, teen, adult
  menteeAgeGroup: varchar("mentee_age_group", { length: 20 }).notNull(), // k-2, 3-5, 6-8
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, paused, completed, discontinued
  matchingReason: text("matching_reason"), // Why they were matched
  startDate: timestamp("start_date").defaultNow().notNull(),
  expectedEndDate: timestamp("expected_end_date"), // Mentoring program duration
  totalSessions: integer("total_sessions").default(0).notNull(),
  mentorRating: real("mentor_rating"), // 1-5 rating from mentee/parent
  menteeProgress: integer("mentee_progress").default(0).notNull(), // 0-100 kindness growth
  specialNotes: text("special_notes"), // Any special considerations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mentoring Session Activities
export const mentorActivities = pgTable("mentor_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorshipId: varchar("mentorship_id").notNull().references(() => mentorships.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // guidance, challenge_together, skill_share, reflection
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  mentorReflection: text("mentor_reflection"), // What the mentor learned
  menteeReflection: text("mentee_reflection"), // What the mentee learned
  kindnessActsCompleted: integer("kindness_acts_completed").default(0).notNull(),
  skillsShared: jsonb("skills_shared"), // Array of skills taught/learned
  mentorTokensEarned: integer("mentor_tokens_earned").default(0).notNull(),
  menteeTokensEarned: integer("mentee_tokens_earned").default(0).notNull(),
  parentApproval: boolean("parent_approval").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mentor Badge System
export const mentorBadges = pgTable("mentor_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  badgeName: varchar("badge_name", { length: 100 }).notNull(),
  badgeIcon: varchar("badge_icon", { length: 10 }).notNull(), // Emoji for badge
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // leadership, compassion, growth, impact, special
  tier: varchar("tier", { length: 20 }).default("bronze").notNull(), // bronze, silver, gold, platinum, legendary
  requirements: jsonb("requirements").notNull(), // Complex requirements object
  tokenReward: integer("token_reward").default(50).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  rarity: varchar("rarity", { length: 20 }).default("common").notNull(), // common, rare, epic, legendary
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User's Earned Mentor Badges
export const userMentorBadges = pgTable("user_mentor_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => mentorBadges.id),
  mentorshipId: varchar("mentorship_id").references(() => mentorships.id), // Which mentorship earned this
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  isDisplayed: boolean("is_displayed").default(true).notNull(), // Show on profile
  celebrationViewed: boolean("celebration_viewed").default(false).notNull(),
});

// Mentor Training & Certification
export const mentorTraining = pgTable("mentor_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  trainingType: varchar("training_type", { length: 50 }).notNull(), // orientation, skills, safety, advanced
  ageGroupFocus: varchar("age_group_focus", { length: 20 }).notNull(), // k-2, 3-5, 6-8, all
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  prerequisites: jsonb("prerequisites"), // Array of required training IDs
  content: jsonb("content").notNull(), // Training modules/activities
  completionCriteria: jsonb("completion_criteria").notNull(),
  certificateReward: integer("certificate_reward").default(25).notNull(), // Tokens for completion
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// User Training Progress
export const userMentorTraining = pgTable("user_mentor_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  trainingId: varchar("training_id").notNull().references(() => mentorTraining.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  currentModule: integer("current_module").default(1).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // Minutes
  passed: boolean("passed").default(false).notNull(),
  certificateIssued: boolean("certificate_issued").default(false).notNull(),
});

// Mentor Matching Preferences
export const mentorPreferences = pgTable("mentor_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  availableAsMentor: boolean("available_as_mentor").default(false).notNull(),
  seekingMentor: boolean("seeking_mentor").default(false).notNull(),
  preferredMenteeAgeGroups: jsonb("preferred_mentee_age_groups"), // Array of age groups
  interests: jsonb("interests"), // Array of interests/skills
  mentorStyle: varchar("mentor_style", { length: 50 }).default("encouraging").notNull(), // encouraging, structured, creative, patient
  availabilityDays: jsonb("availability_days"), // Array of days available
  maxMentees: integer("max_mentees").default(2).notNull(),
  experienceLevel: varchar("experience_level", { length: 20 }).default("beginner").notNull(),
  specialSkills: jsonb("special_skills"), // What they can teach
  communicationStyle: varchar("communication_style", { length: 20 }).default("friendly").notNull(),
  parentPermission: boolean("parent_permission").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mentor Training Scenarios - Practice Situations  
export const mentorScenarios = pgTable("mentor_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // connection, guidance, challenges
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  description: text("description").notNull(),
  scenario: text("scenario").notNull(), // full scenario description
  learningPoints: jsonb("learning_points").notNull(), // key learning outcomes
  suggestedApproaches: jsonb("suggested_approaches").notNull(), // recommended strategies
  extensionActivities: jsonb("extension_activities").notNull(), // follow-up activities
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sample Mentor Conversations - Training Examples
export const mentorConversations = pgTable("mentor_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  participants: jsonb("participants").notNull(), // array of participant descriptions
  conversationFlow: jsonb("conversation_flow").notNull(), // detailed conversation with notes
  learningPoints: jsonb("learning_points").notNull(), // key takeaways
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mentor Performance Analytics
export const mentorStats = pgTable("mentor_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  totalMentees: integer("total_mentees").default(0).notNull(),
  activeMentorships: integer("active_mentorships").default(0).notNull(),
  completedMentorships: integer("completed_mentorships").default(0).notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  avgMenteeGrowth: real("avg_mentee_growth").default(0).notNull(), // Average mentee progress
  avgRating: real("avg_rating").default(0).notNull(), // Average mentor rating
  totalKindnessActsGuided: integer("total_kindness_acts_guided").default(0).notNull(),
  totalTokensEarned: integer("total_tokens_earned").default(0).notNull(),
  badgesEarned: integer("badges_earned").default(0).notNull(),
  mentorLevel: integer("mentor_level").default(1).notNull(), // Gamification level
  nextLevelProgress: integer("next_level_progress").default(0).notNull(), // 0-100
  impactScore: integer("impact_score").default(0).notNull(), // Overall impact rating
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SchoolFundraiser = typeof schoolFundraisers.$inferSelect;
export type InsertSchoolFundraiser = typeof schoolFundraisers.$inferInsert;
export type FamilyDonation = typeof familyDonations.$inferSelect;
export type InsertFamilyDonation = typeof familyDonations.$inferInsert;

// Kindness Mentors types
export const insertMentorshipSchema = createInsertSchema(mentorships);
export const insertMentorActivitySchema = createInsertSchema(mentorActivities);
export const insertMentorBadgeSchema = createInsertSchema(mentorBadges);
export const insertMentorPreferencesSchema = createInsertSchema(mentorPreferences);

export type Mentorship = typeof mentorships.$inferSelect;
export type InsertMentorship = typeof mentorships.$inferInsert;
export type MentorActivity = typeof mentorActivities.$inferSelect;
export type InsertMentorActivity = typeof mentorActivities.$inferInsert;
export type MentorBadge = typeof mentorBadges.$inferSelect;
export type InsertMentorBadge = typeof mentorBadges.$inferInsert;
export type MentorPreferences = typeof mentorPreferences.$inferSelect;
export type InsertMentorPreferences = typeof mentorPreferences.$inferInsert;
export type MentorStats = typeof mentorStats.$inferSelect;
export type InsertMentorStats = typeof mentorStats.$inferInsert;
export type MentorTraining = typeof mentorTraining.$inferSelect;
export type InsertMentorTraining = typeof mentorTraining.$inferInsert;
export type MentorScenario = typeof mentorScenarios.$inferSelect;
export type InsertMentorScenario = typeof mentorScenarios.$inferInsert;
export type MentorConversation = typeof mentorConversations.$inferSelect;
export type InsertMentorConversation = typeof mentorConversations.$inferInsert;

export type YearRoundFamilyChallenge = typeof yearRoundFamilyChallenges.$inferSelect;
export type InsertYearRoundFamilyChallenge = typeof yearRoundFamilyChallenges.$inferInsert;
export type FamilyProgress = typeof familyProgress.$inferSelect;
export type InsertFamilyProgress = typeof familyProgress.$inferInsert;
export type FamilyActivity = typeof familyActivities.$inferSelect;
export type InsertFamilyActivity = typeof familyActivities.$inferInsert;

// Support Circle Feature Schema Exports
export const insertSupportPostSchema = createInsertSchema(supportPosts).omit({
  id: true,
  createdAt: true,
  heartsCount: true,
  isCrisis: true,
  flaggedAt: true,
  hasResponse: true,
  responseCount: true,
  lastResponseAt: true,
  viewCount: true,
  reportCount: true,
  isResolved: true,
  resolvedAt: true,
});

// Wellness check-in insert schemas for daily mood tracking
export const insertWellnessCheckInSchema = createInsertSchema(wellnessCheckIns).omit({
  id: true,
  triggeredByNotification: true,
  notificationTime: true,
  responseTime: true,
  completedAt: true,
  checkInDate: true,
  createdAt: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  isActive: true,
  lastNotificationSent: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportResponseSchema = createInsertSchema(supportResponses).omit({
  id: true,
  createdAt: true,
  heartsCount: true,
});

export const insertCrisisEscalationSchema = createInsertSchema(crisisEscalations).omit({
  id: true,
  escalatedAt: true,
  resolvedAt: true,
});

export const insertLicensedCounselorSchema = createInsertSchema(licensedCounselors).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

// Summer Engagement type exports
export type SummerChallenge = typeof summerChallenges.$inferSelect;
export type InsertSummerChallenge = z.infer<typeof insertSummerChallengeSchema>;
export type UserSummerProgress = typeof userSummerProgress.$inferSelect;
export type InsertUserSummerProgress = z.infer<typeof insertUserSummerProgressSchema>;
export type SummerActivity = typeof summerActivities.$inferSelect;
export type InsertSummerActivity = z.infer<typeof insertSummerActivitySchema>;
export type SummerNotification = typeof summerNotifications.$inferSelect;
export type InsertSummerNotification = z.infer<typeof insertSummerNotificationSchema>;
export type FamilyChallenge = typeof legacyFamilyChallenges.$inferSelect;
export type InsertFamilyChallenge = z.infer<typeof insertFamilyChallengeSchema>;

// Support Circle Feature Type Exports
export type InsertSupportPost = z.infer<typeof insertSupportPostSchema>;
export type SupportPost = typeof supportPosts.$inferSelect;
export type InsertSupportResponse = z.infer<typeof insertSupportResponseSchema>;
export type SupportResponse = typeof supportResponses.$inferSelect;
export type InsertCrisisEscalation = z.infer<typeof insertCrisisEscalationSchema>;
export type CrisisEscalation = typeof crisisEscalations.$inferSelect;
export type InsertLicensedCounselor = z.infer<typeof insertLicensedCounselorSchema>;
export type LicensedCounselor = typeof licensedCounselors.$inferSelect;
export type SchoolSupportAnalytics = typeof schoolSupportAnalytics.$inferSelect;

// Wellness check-in types for daily mood tracking
export type WellnessCheckIn = typeof wellnessCheckIns.$inferSelect;
export type InsertWellnessCheckIn = z.infer<typeof insertWellnessCheckInSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type WellnessTrend = typeof wellnessTrends.$inferSelect;

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
