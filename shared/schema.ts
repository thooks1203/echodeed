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
  // AMBASSADOR PROGRAM TRACKING
  isAmbassador: boolean("is_ambassador").default(false),
  ambassadorTier: varchar("ambassador_tier", { length: 20 }), // 'founding' or 'associate'
  ambassadorCode: varchar("ambassador_code"), // Unique code like "AMBASSADOR-SJ-2025"
  ambassadorGoal: integer("ambassador_goal").default(0), // Recruit goal (15 for founding, 5 for associate)
  ambassadorRewardEarned: boolean("ambassador_reward_earned").default(false), // True when they hit goal
  ambassadorCampaignId: varchar("ambassador_campaign_id"), // Which campaign they're part of
  // SCHOOL ROLE SYSTEM - FOR EDUCATIONAL INSTITUTIONS  
  schoolRole: varchar("school_role", { length: 20 }).default("student").notNull(), // student, teacher, counselor, admin
  schoolId: varchar("school_id"), // Links user to a specific school
  grade: varchar("grade", { length: 5 }), // For students: 6, 7, 8, etc.
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

// Student accounts - Extended student information for COPPA compliance
export const studentAccounts = pgTable("student_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // Links to main user record
  schoolId: varchar("school_id").notNull(), // Links to school
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  grade: varchar("grade", { length: 5 }).notNull(), // 6, 7, 8, 9, 10, 11, 12
  birthYear: integer("birth_year"), // For COPPA age calculation
  parentNotificationEmail: varchar("parent_notification_email"), // Parent contact email
  isAccountActive: integer("is_account_active").default(0).notNull(), // 1 = active, 0 = pending
  parentalConsentStatus: varchar("parental_consent_status", { length: 20 }).default("pending").notNull(), // pending, approved, denied, revoked
  parentalConsentMethod: varchar("parental_consent_method", { length: 50 }), // email, phone, in-person
  parentalConsentDate: timestamp("parental_consent_date"),
  parentalConsentIP: varchar("parental_consent_ip"),
});

export const kindnessPosts = pgTable("kindness_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to authenticated user
  schoolId: varchar("school_id"), // Link to school for school-specific feeds
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  // Multi-directional recognition: who is posting to whom
  postType: varchar("post_type", { length: 30 }).$type<'student_to_student' | 'staff_to_staff' | 'staff_to_student'>().default('student_to_student'),
  location: text("location").notNull(),
  city: text("city"),
  state: text("state"), 
  country: text("country"),
  emojis: text("emojis").array().default([]).notNull(), // Custom kindness emojis (max 3)
  heartsCount: integer("hearts_count").default(0).notNull(),
  echoesCount: integer("echoes_count").default(0).notNull(),
  isAnonymous: integer("is_anonymous").default(1).notNull(), // 1 = anonymous, 0 = show user
  mentionedTeacherId: varchar("mentioned_teacher_id").references(() => users.id), // Optional teacher appreciation tag
  teacherAppreciationMessage: text("teacher_appreciation_message"), // Personal message for the teacher
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

export type KindnessCounter = typeof kindnessCounter.$inferSelect;

// User token tracking - now linked to authenticated users
export const userTokens = pgTable("user_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id), // Link to authenticated user
  echoBalance: integer("echo_balance").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  streakDays: integer("streak_days").default(0).notNull(), // Consecutive days of kindness posting
  lastPostDate: timestamp("last_post_date"), // Last date user posted kindness
  longestStreak: integer("longest_streak").default(0).notNull(), // Record longest streak achieved
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
export const achievementBadges = pgTable("achievement_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // kindness, engagement, challenge, milestone, special
  icon: varchar("icon", { length: 50 }).notNull(), // Emoji or icon identifier
  tier: varchar("tier", { length: 20 }).default("bronze").notNull(), // bronze, silver, gold, platinum, diamond
  requirements: jsonb("requirements").notNull(), // Flexible JSON requirements
  echoReward: integer("echo_reward").default(5).notNull(),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievement tracking
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => achievementBadges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Heart reactions - track who hearted what posts
export const heartReactions = pgTable("heart_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => kindnessPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Echo reactions - track who echoed what posts
export const echoReactions = pgTable("echo_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => kindnessPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Support posts for community support and resource sharing
export const supportPosts = pgTable("support_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id"), // Link to school for school-specific support
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // mental-health, academic, social, physical, family, other
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // low, medium, high, urgent
  isAnonymous: integer("is_anonymous").default(1).notNull(), // 1 = anonymous, 0 = show user
  status: varchar("status", { length: 20 }).default("open").notNull(), // open, in-progress, resolved, closed
  helpfulCount: integer("helpful_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Support responses to help community members
export const supportResponses = pgTable("support_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => supportPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAnonymous: integer("is_anonymous").default(1).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track which responses users found helpful
export const helpfulReactions = pgTable("helpful_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  responseId: varchar("response_id").notNull().references(() => supportResponses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Badges & Achievements System (School-Spirit Features)
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id", { length: 50 }).notNull(), // 'originator', 'weekly_warrior', 'grade_hero', etc.
  badgeName: varchar("badge_name", { length: 100 }).notNull(), // Display name
  badgeDescription: text("badge_description"), // Description of achievement
  badgeIcon: varchar("badge_icon", { length: 50 }), // Emoji or icon reference
  badgeColor: varchar("badge_color", { length: 20 }), // Color theme for badge
  metadata: jsonb("metadata"), // Additional context (e.g., grade level, week, etc.)
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

// Badge definitions catalog (reference data)
export const badgeDefinitions = pgTable("badge_definitions", {
  id: varchar("id").primaryKey(), // e.g., 'originator', 'weekly_warrior'
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(), // Emoji
  color: varchar("color", { length: 20 }).notNull(), // Tailwind color class
  category: varchar("category", { length: 50 }).notNull(), // 'achievement', 'milestone', 'recognition'
  requirements: text("requirements"), // Human-readable requirements
  isActive: integer("is_active").default(1).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wellness check-ins for students
export const wellnessCheckins = pgTable("wellness_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id"), // Link to school
  moodScore: integer("mood_score").notNull(), // 1-5 scale
  stressLevel: integer("stress_level").notNull(), // 1-5 scale  
  energyLevel: integer("energy_level").notNull(), // 1-5 scale
  socialConnection: integer("social_connection").notNull(), // 1-5 scale
  notes: text("notes"), // Optional notes
  flaggedForReview: integer("flagged_for_review").default(0).notNull(), // 1 if needs attention
  reviewedBy: varchar("reviewed_by"), // Teacher/counselor who reviewed
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schools table for educational institution management
export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("United States"),
  zipCode: varchar("zip_code", { length: 10 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  emailDomain: varchar("email_domain", { length: 100 }), // For auto-assigning users to schools
  enrollmentCode: varchar("enrollment_code", { length: 50 }).unique(), // Unique code students use to verify their school
  schoolLevel: varchar("school_level", { length: 20 }).$type<'middle_school' | 'high_school'>().notNull().default('high_school'), // Determines platform experience: MS (grades 6-8) or HS (grades 9-12)
  studentCount: integer("student_count").default(0),
  teacherCount: integer("teacher_count").default(0),
  kindnessPostsCount: integer("kindness_posts_count").default(0),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free").notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("active").notNull(),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  isActive: integer("is_active").default(1).notNull(),
  // Social Media & External Links (School-Spirit Features)
  instagramUrl: varchar("instagram_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  logoUrl: varchar("logo_url", { length: 500 }), // School logo for branded sharing
  // Sign-up Incentive Program
  signupBonusTokens: integer("signup_bonus_tokens").default(0), // Tokens awarded to new registrations
  signupBonusCap: integer("signup_bonus_cap").default(0), // Max number of users who can receive bonus
  signupBonusUsed: integer("signup_bonus_used").default(0), // How many bonuses have been claimed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Principal's Corner blog posts for parent engagement
export const principalBlogPosts = pgTable("principal_blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id"), // Optional school reference
  authorId: varchar("author_id").notNull().references(() => users.id), // Principal/admin who wrote it
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"), // Short preview text
  category: varchar("category", { length: 50 }).notNull(), // character-education, kindness-tips, program-updates, parent-resources
  imageUrl: text("image_url"),
  isPublished: integer("is_published").default(1).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Parent Community Posts - Parents sharing thoughts with each other
export const parentCommunityPosts = pgTable("parent_community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id"), // Optional school reference
  authorId: varchar("author_id").notNull().references(() => users.id), // Parent who wrote it
  authorName: varchar("author_name", { length: 100 }).notNull(), // Display name for community
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // parenting-tips, support, celebrations, questions, resources
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  isApproved: integer("is_approved").default(1).notNull(), // Moderation flag
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reward partners for the token redemption system
export const rewardPartners = pgTable("reward_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerName: varchar("partner_name", { length: 100 }).notNull(),
  partnerLogo: text("partner_logo"),
  partnerType: varchar("partner_type", { length: 50 }).notNull(),
  websiteUrl: text("website_url"),
  description: text("description"),
  isActive: integer("is_active").default(1).notNull(),
  isFeatured: integer("is_featured").default(0).notNull(),
  minRedemptionAmount: integer("min_redemption_amount"),
  maxRedemptionAmount: integer("max_redemption_amount"),
  contactEmail: text("contact_email"),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  merchantPinHash: text("merchant_pin_hash"),
  allowsQrVerification: integer("allows_qr_verification").default(0),
  redemptionInstructions: text("redemption_instructions"),
  locations: jsonb("locations"),
});

// Reward offers from partners
export const rewardOffers = pgTable("reward_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => rewardPartners.id),
  offerType: varchar("offer_type", { length: 50 }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  offerValue: text("offer_value"),
  echoCost: integer("echo_cost").notNull(),
  badgeRequirement: varchar("badge_requirement", { length: 100 }),
  maxRedemptions: integer("max_redemptions"), // Optional limit
  currentRedemptions: integer("current_redemptions").default(0),
  isActive: integer("is_active").default(1).notNull(),
  isFeatured: integer("is_featured").default(0),
  requiresVerification: integer("requires_verification").default(0),
  expiresAt: timestamp("expires_at"),
  termsAndConditions: text("terms_and_conditions"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sponsorCompany: varchar("sponsor_company", { length: 200 }),
  sponsorLogo: text("sponsor_logo"),
  sponsorshipType: varchar("sponsorship_type", { length: 50 }),
  sponsorshipMessage: text("sponsorship_message"),
  monthlySponsorship: integer("monthly_sponsorship").default(0),
  ageGroup: varchar("age_group", { length: 20 }).default("all"), // "middle_school", "high_school", "all"
});

// Track reward redemptions
export const rewardRedemptions = pgTable("reward_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => rewardOffers.id),
  partnerId: varchar("partner_id"),
  echoSpent: integer("echo_spent").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, active, used, expired
  redemptionCode: varchar("redemption_code"), // Code provided to user
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  verificationRequired: integer("verification_required").default(0),
  verificationStatus: varchar("verification_status", { length: 20 }),
});

// Community service hours tracking for students
export const communityServiceLogs = pgTable("community_service_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id"), // Link to school
  serviceName: text("service_name").notNull(),
  organizationName: text("organization_name"),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  hoursLogged: decimal("hours_logged", { precision: 4, scale: 2 }).notNull(), // Allow decimal hours
  serviceDate: timestamp("service_date").notNull(),
  startTime: timestamp("start_time"), // x2vol compatibility: clock-in time
  endTime: timestamp("end_time"), // x2vol compatibility: clock-out time
  category: varchar("category", { length: 50 }).notNull(), // environmental, community, education, etc.
  serviceDescription: text("service_description").notNull(),
  studentReflection: text("student_reflection"), // Student reflection on the experience (x2vol required)
  verificationPhotoUrl: text("verification_photo_url"), // Uploaded verification letter photo
  verificationStatus: varchar("verification_status", { length: 20 }).default("pending").notNull(), // pending, verified, rejected
  verifiedBy: varchar("verified_by"), // Teacher/parent who verified
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
  tokensEarned: integer("tokens_earned").default(0),
  parentNotified: boolean("parent_notified").default(false),
  // v2.1: IPARD Model Integration (Investigation, Preparation, Action, Reflection, Demonstration)
  ipardPhase: varchar("ipard_phase", { length: 20 }).default("investigation").notNull(), // investigation, preparation, action, reflection, demonstration, complete
  approvalFormSubmitted: boolean("approval_form_submitted").default(false),
  approvalFormSubmittedAt: timestamp("approval_form_submitted_at"),
  reflectionQualityApproved: boolean("reflection_quality_approved").default(false),
  reflectionApprovedAt: timestamp("reflection_approved_at"),
  demonstrationCompleted: boolean("demonstration_completed").default(false),
  demonstrationUrl: text("demonstration_url"), // Photo/link of student sharing their experience
  demonstrationCompletedAt: timestamp("demonstration_completed_at"),
  ipardBonusTokensEarned: integer("ipard_bonus_tokens_earned").default(0), // Total bonus tokens from IPARD milestones
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community service verifications - tracking verification process
export const communityServiceVerifications = pgTable("service_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceLogId: varchar("service_log_id").notNull().references(() => communityServiceLogs.id),
  verifierType: varchar("verifier_type", { length: 20 }).notNull(), // parent, teacher, organization
  verifierId: varchar("verifier_id"), // User ID of verifier if applicable
  verificationMethod: varchar("verification_method", { length: 50 }).notNull(), // email, phone, in-person, document
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
  feedback: text("feedback"),
  requestedChanges: text("requested_changes"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  followUpRequired: integer("follow_up_required").default(0),
});

// v2.1: IPARD Phase Events - Audit trail for milestone completion
export const ipardPhaseEvents = pgTable("ipard_phase_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceLogId: varchar("service_log_id").notNull().references(() => communityServiceLogs.id),
  phase: varchar("phase", { length: 20 }).notNull(), // investigation, preparation, action, reflection, demonstration
  actorId: varchar("actor_id").references(() => users.id), // Teacher/admin who approved the phase
  notes: text("notes"),
  tokensAwarded: integer("tokens_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// v2.1: Reflection Skills - Normalized reference table for 21st Century Learning Skills
export const reflectionSkills = pgTable("reflection_skills", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // For grouping (e.g., "21st Century Skills")
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

// v2.1: Reflection Traits - Normalized reference table for Character Traits
export const reflectionTraits = pgTable("reflection_traits", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

// v2.1: Service Log Skills - Junction table linking service logs to skills developed
export const communityServiceLogSkills = pgTable("community_service_log_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceLogId: varchar("service_log_id").notNull().references(() => communityServiceLogs.id),
  skillId: varchar("skill_id").notNull().references(() => reflectionSkills.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// v2.1: Service Log Traits - Junction table linking service logs to character traits developed
export const communityServiceLogTraits = pgTable("community_service_log_traits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceLogId: varchar("service_log_id").notNull().references(() => communityServiceLogs.id),
  traitId: varchar("trait_id").notNull().references(() => reflectionTraits.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// v2.1: Token Transactions - Audit log for all token awards/spending
export const tokenTransactions = pgTable("token_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // ipard_bonus, service_verification, character_excellence, redemption
  amount: integer("amount").notNull(), // Positive for earning, negative for spending
  sourceId: varchar("source_id"), // Reference to service log, redemption, or award ID
  sourceType: varchar("source_type", { length: 50 }), // service_log, redemption, character_award
  description: text("description"),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  createdBy: varchar("created_by").references(() => users.id), // Teacher/admin who awarded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// v2.1: Admin Rewards - High-value non-token rewards managed by school leadership
export const adminRewards = pgTable("admin_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  rewardName: varchar("reward_name", { length: 200 }).notNull(),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // vip_parking, homework_pass, lunch_skip, principal_lunch, etc.
  description: text("description"),
  applicableLevel: varchar("applicable_level", { length: 20 }).$type<'middle_school' | 'high_school' | 'both'>().notNull().default('both'), // Which school level can use this reward
  quantityAvailable: integer("quantity_available").default(0).notNull(),
  quantityAllocated: integer("quantity_allocated").default(0).notNull(),
  tokenCost: integer("token_cost").default(0), // Some admin rewards may require tokens
  eligibilityRequirements: jsonb("eligibility_requirements"), // JSON of requirements (grade, GPA, etc.)
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// v2.1: Admin Reward Redemptions - Track allocation of high-value rewards
export const adminRewardRedemptions = pgTable("admin_reward_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rewardId: varchar("reward_id").notNull().references(() => adminRewards.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, fulfilled, revoked
  tokensSpent: integer("tokens_spent").default(0),
  approvedBy: varchar("approved_by").references(() => users.id), // Admin/principal who approved
  fulfilledBy: varchar("fulfilled_by").references(() => users.id), // Staff who fulfilled (e.g., parking pass issued)
  fulfilledAt: timestamp("fulfilled_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// v2.1: Character Excellence Awards - Manual teacher override for exceptional character (500+ tokens)
export const characterExcellenceAwards = pgTable("character_excellence_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  schoolId: varchar("school_id").notNull(),
  tokensAwarded: integer("tokens_awarded").notNull(), // Typically 500+
  reason: text("reason").notNull(), // Why the student received this award
  characterTrait: varchar("character_trait", { length: 100 }), // integrity, leadership, compassion, etc.
  witnessedBehavior: text("witnessed_behavior"), // Specific example of the character trait
  approvedBy: varchar("approved_by").references(() => users.id), // Admin approval if required
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

// Student service hours summary - MATCHES DEVELOPMENT DATABASE
export const studentServiceSummaries = pgTable("student_service_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id"), // Link to school
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).default("0").notNull(),
  verifiedHours: decimal("verified_hours", { precision: 10, scale: 2 }).default("0").notNull(),
  pendingHours: decimal("pending_hours", { precision: 10, scale: 2 }).default("0").notNull(),
  rejectedHours: decimal("rejected_hours", { precision: 10, scale: 2 }).default("0"),
  totalTokensEarned: integer("total_tokens_earned").default(0),
  totalServiceSessions: integer("total_service_sessions").default(0),
  annualGoalHours: integer("annual_goal_hours").default(30), // x2vol: typically 30 hours/year for high school
  currentSchoolYear: varchar("current_school_year", { length: 10 }), // e.g., "2024-2025"
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastServiceDate: timestamp("last_service_date"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// COPPA consent tracking for students under 13
export const coppaConsent = pgTable("coppa_consent", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  parentEmail: text("parent_email").notNull(),
  parentName: text("parent_name").notNull(),
  schoolId: varchar("school_id").notNull(),
  consentStatus: varchar("consent_status", { length: 20 }).default("pending").notNull(), // pending, granted, denied, expired
  consentDate: timestamp("consent_date"),
  expirationDate: timestamp("expiration_date"), // Annual renewal required
  digitalSignature: text("digital_signature"), // Parent's digital signature
  ipAddress: varchar("ip_address", { length: 45 }), // For audit trail
  userAgent: text("user_agent"), // For audit trail
  verificationToken: varchar("verification_token"), // For email verification
  lastReminderSent: timestamp("last_reminder_sent"),
  reminderCount: integer("reminder_count").default(0),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawalReason: text("withdrawal_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// COPPA consent requests - tracking consent workflow
export const coppaConsentRequests = pgTable("coppa_consent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  schoolId: varchar("school_id").notNull(),
  requestType: varchar("request_type", { length: 20 }).notNull(), // initial, renewal, update
  parentEmail: text("parent_email").notNull(),
  parentName: text("parent_name").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, sent, completed, failed, expired
  emailSentAt: timestamp("email_sent_at"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fundraising campaigns for schools
export const fundraisingCampaigns = pgTable("fundraising_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goalAmount: integer("goal_amount").notNull(), // Goal in cents
  currentAmount: integer("current_amount").default(0).notNull(), // Current raised in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // sports, arts, technology, general, etc.
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, paused, completed, cancelled
  donorCount: integer("donor_count").default(0).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Track fundraising donations
export const fundraisingDonations = pgTable("fundraising_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => fundraisingCampaigns.id),
  donorId: varchar("donor_id"), // Optional - for anonymous donations
  donorName: text("donor_name"), // Display name for donor
  donorEmail: text("donor_email"),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  isAnonymous: integer("is_anonymous").default(0).notNull(),
  message: text("message"), // Optional message from donor
  paymentMethod: varchar("payment_method", { length: 50 }), // stripe, paypal, etc.
  paymentId: text("payment_id"), // External payment ID
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, completed, failed, refunded
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscription plans for schools and users
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  planType: varchar("plan_type", { length: 20 }).notNull(),
  monthlyPrice: integer("monthly_price"), // Price in cents
  yearlyPrice: integer("yearly_price"), // Price in cents
  features: jsonb("features"), // JSON array of features
  limits: jsonb("limits"), // JSON object of limits
  isActive: integer("is_active").default(1).notNull(),
  sortOrder: integer("sort_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Surprise giveaway campaigns
export const surpriseGiveawayCampaigns = pgTable("surprise_giveaway_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // user_gift_card, school_fee_refund
  isActive: integer("is_active").default(1).notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly, quarterly
  maxWinnersPerPeriod: integer("max_winners_per_period").default(1),
  giftCardValue: integer("gift_card_value"), // For gift card campaigns
  partnerId: varchar("partner_id").references(() => rewardPartners.id), // For gift card campaigns
  refundPercentage: integer("refund_percentage"), // For school refund campaigns (0-100)
  minActivityScore: integer("min_activity_score").default(75),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Track surprise giveaway winners
export const surpriseGiveawayWinners = pgTable("surprise_giveaway_winners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => surpriseGiveawayCampaigns.id),
  winnerId: varchar("winner_id").notNull(), // User ID or School ID
  winnerType: varchar("winner_type", { length: 20 }).notNull(), // user, school
  activityScore: integer("activity_score").notNull(),
  prize: text("prize").notNull(), // Description of what they won
  prizeValue: integer("prize_value"), // Value in cents
  redemptionId: varchar("redemption_id"), // Link to reward redemption if applicable
  notifiedAt: timestamp("notified_at"),
  claimedAt: timestamp("claimed_at"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, claimed, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Summer Challenge Program for out-of-school engagement
export const summerChallenges = pgTable("summer_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(), // 1-12 for summer weeks
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // family, community, creativity, learning, outdoor
  difficulty: varchar("difficulty", { length: 20 }).default("medium").notNull(), // easy, medium, hard
  ageGroup: varchar("age_group", { length: 50 }).default("all").notNull(), // elementary, middle, high, all
  points: integer("points").default(15).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track summer challenge completions
export const summerChallengeCompletions = pgTable("summer_challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => summerChallenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  submissionText: text("submission_text"), // Student's description of completion
  photoUrls: text("photo_urls").array().default([]), // Optional photos
  parentVerified: integer("parent_verified").default(0).notNull(), // 1 if parent verified
  tokensAwarded: integer("tokens_awarded").default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Family Challenge Program for parent-child engagement
export const familyChallenges = pgTable("family_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekNumber: integer("week_number").notNull(), // School year week
  ageGroup: varchar("age_group", { length: 20 }).notNull(), // elementary, middle-high
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // bonding, service, learning, creativity, outdoor
  difficulty: varchar("difficulty", { length: 20 }).default("medium").notNull(),
  parentTokens: integer("parent_tokens").default(10).notNull(), // Tokens for parent
  studentTokens: integer("student_tokens").default(15).notNull(), // Tokens for student
  familyBonusTokens: integer("family_bonus_tokens").default(5).notNull(), // Extra family bonus
  isActive: integer("is_active").default(1).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track family challenge completions
export const familyChallengeCompletions = pgTable("family_challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => familyChallenges.id),
  studentId: varchar("student_id").notNull().references(() => users.id),
  parentId: varchar("parent_id"), // Optional if parent not registered
  parentEmail: text("parent_email"), // For unregistered parents
  familyReflection: text("family_reflection").notNull(), // Joint reflection
  photoUrls: text("photo_urls").array().default([]), // Family photos
  parentTokensAwarded: integer("parent_tokens_awarded").default(0),
  studentTokensAwarded: integer("student_tokens_awarded").default(0),
  familyBonusAwarded: integer("family_bonus_awarded").default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// School Year Kindness Curriculum for classroom integration
export const schoolYearChallenges = pgTable("school_year_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(), // 1-36 for school year
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme"),
  category: varchar("category", { length: 50 }),
  difficulty: varchar("difficulty", { length: 20 }),
  points: integer("points"),
  gradeLevel: varchar("grade_level", { length: 20 }).notNull(),
  timeEstimateMinutes: integer("time_estimate_minutes"),
  isActive: boolean("is_active").default(true).notNull(),
  seasonalFocus: text("seasonal_focus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track classroom engagement with school year challenges
export const schoolYearProgress = pgTable("school_year_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => schoolYearChallenges.id),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
  studentReflection: text("student_reflection"),
  photoEvidence: text("photo_evidence"),
  teacherApproved: integer("teacher_approved").default(0),
  teacherFeedback: text("teacher_feedback"),
  parentNotified: integer("parent_notified").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schoolYearChallengeEngagement = pgTable("school_year_challenge_engagement", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => schoolYearChallenges.id),
  userId: varchar("user_id").notNull().references(() => users.id), // Student
  teacherId: varchar("teacher_id").references(() => users.id), // Teacher facilitating
  classroomId: varchar("classroom_id"), // Classroom identifier
  participationLevel: varchar("participation_level", { length: 20 }).default("active").notNull(), // low, medium, active, leadership
  reflection: text("reflection"), // Student reflection
  teacherNotes: text("teacher_notes"), // Teacher observations
  tokenEarned: integer("token_earned").default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Mentor badge system for peer mentorship
export const mentorBadges = pgTable("mentor_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  badgeName: varchar("badge_name", { length: 100 }).notNull(),
  badgeIcon: varchar("badge_icon", { length: 50 }).notNull(), // Emoji or icon
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // connection, communication, guidance, leadership, etc.
  tier: varchar("tier", { length: 20 }).notNull(), // starter, bronze, silver, gold, special
  requirements: jsonb("requirements").notNull(), // What's needed to earn this badge
  tokenReward: integer("token_reward").default(25).notNull(),
  isActive: integer("is_active").default(1).notNull(),
  rarity: varchar("rarity", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track mentor badge awards
export const mentorBadgeAwards = pgTable("mentor_badge_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  badgeId: varchar("badge_id").notNull().references(() => mentorBadges.id),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  awardedBy: varchar("awarded_by"), // System or admin who awarded
  evidence: text("evidence"), // Why they earned it
  tokenAwarded: integer("token_awarded").default(0),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

// Mentor training modules for skill development
export const mentorTraining = pgTable("mentor_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  trainingType: varchar("training_type", { length: 50 }),
  ageGroupFocus: varchar("age_group_focus", { length: 50 }),
  durationMinutes: integer("duration_minutes"),
  isRequired: integer("is_required").default(0),
  prerequisites: text("prerequisites"),
  content: text("content").notNull(),
  completionCriteria: text("completion_criteria"),
  certificateReward: varchar("certificate_reward", { length: 100 }),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track mentor training progress
export const userMentorTraining = pgTable("user_mentor_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  trainingId: varchar("training_id").notNull().references(() => mentorTraining.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  progressPercentage: integer("progress_percentage").default(0),
  currentModule: varchar("current_module", { length: 100 }),
  timeSpent: integer("time_spent").default(0),
  passed: integer("passed").default(0),
  certificateIssued: integer("certificate_issued").default(0),
});

// Mentor practice scenarios for skill building
export const mentorScenarios = pgTable("mentor_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  scenario: text("scenario").notNull(), // The situation to respond to
  category: varchar("category", { length: 50 }).notNull(), // conflict, wellness, academic, social
  difficulty: varchar("difficulty", { length: 20 }).default("medium").notNull(),
  suggestedResponse: text("suggested_response"), // Example good response
  learningPoints: text("learning_points").array().default([]), // Key takeaways
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track mentor scenario responses
export const mentorScenarioResponses = pgTable("mentor_scenario_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull().references(() => mentorScenarios.id),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  response: text("response").notNull(), // Mentor's response to scenario
  feedback: text("feedback"), // System or peer feedback
  score: integer("score"), // 0-100 assessment score
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Sample mentor conversations for learning
export const mentorConversations = pgTable("mentor_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  conversation: jsonb("conversation").notNull(), // Array of messages showing good mentoring
  category: varchar("category", { length: 50 }).notNull(),
  ageGroup: varchar("age_group", { length: 20 }).notNull(), // middle, high
  learningObjectives: text("learning_objectives").array().default([]),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mentor certification tracking
export const mentorCertifications = pgTable("mentor_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  level: varchar("level", { length: 20 }).default("certified").notNull(), // certified, advanced, master
  certifiedAt: timestamp("certified_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration
  certifyingAdmin: varchar("certifying_admin").references(() => users.id),
  notes: text("notes"), // Admin notes about certification
});

// Mentorships - track mentor-mentee relationships
export const mentorships = pgTable("mentorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  menteeId: varchar("mentee_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, paused, completed, cancelled
  kindnessGoal: text("kindness_goal"), // Mentee's kindness goal
  progressNotes: text("progress_notes"), // General progress notes
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  nextSessionAt: timestamp("next_session_at"),
  totalSessions: integer("total_sessions").default(0),
  menteeSatisfaction: integer("mentee_satisfaction"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mentor activities - track sessions and interactions
export const mentorActivities = pgTable("mentor_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorshipId: varchar("mentorship_id").notNull().references(() => mentorships.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // check-in, planning, reflection, problem-solving
  description: text("description").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  mentorReflection: text("mentor_reflection"), // Mentor's notes
  menteeReflection: text("mentee_reflection"), // Mentee's notes
  kindnessActDiscussed: text("kindness_act_discussed"), // Kindness ideas discussed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mentor stats - aggregated statistics
export const mentorStats = pgTable("mentor_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().unique().references(() => users.id),
  totalMentees: integer("total_mentees").default(0).notNull(),
  activeMentorships: integer("active_mentorships").default(0).notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  totalKindnessActsGuided: integer("total_kindness_acts_guided").default(0).notNull(),
  totalTokensEarned: integer("total_tokens_earned").default(0).notNull(),
  badgesEarned: integer("badges_earned").default(0).notNull(),
  mentorLevel: integer("mentor_level").default(1).notNull(),
  nextLevelProgress: integer("next_level_progress").default(0).notNull(),
  impactScore: integer("impact_score").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GDPR and privacy compliance logging
export const privacyLogs = pgTable("privacy_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // data_export, data_deletion, consent_granted, consent_withdrawn
  details: jsonb("details"), // Additional context about the action
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Teacher reward system for educator engagement
export const teacherRewards = pgTable("teacher_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // service_hours_champion, wellness_guardian, community_builder
  criteria: varchar("criteria", { length: 100 }).notNull(), // Specific achievement
  sponsorId: varchar("sponsor_id"), // Link to sponsor if applicable
  rewardValue: integer("reward_value"), // Value in cents or tokens
  rewardDescription: text("reward_description").notNull(), // What they earned
  status: varchar("status", { length: 20 }).default("earned").notNull(), // earned, redeemed, expired
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
});

// Teacher reward criteria tracking
export const teacherRewardCriteria = pgTable("teacher_reward_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // service_hours, wellness, engagement, professional_dev
  threshold: integer("threshold").notNull(), // Number needed to qualify
  period: varchar("period", { length: 20 }).notNull(), // monthly, quarterly, semester, annual
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // coffee_carafe, restaurant_card, spa_day
  sponsorRequired: integer("sponsor_required").default(1).notNull(), // 1 if needs sponsor funding
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sponsor partnership management
export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  category: varchar("category", { length: 50 }).notNull(), // local_restaurant, coffee, retail, entertainment
  location: text("location"), // For local sponsors
  monthlyBudget: integer("monthly_budget"), // Budget in cents
  currentSpent: integer("current_spent").default(0), // Current month spending
  sponsorshipTier: varchar("sponsorship_tier", { length: 20 }).default("local").notNull(), // local, regional, national
  isActive: integer("is_active").default(1).notNull(),
  partnershipStartDate: timestamp("partnership_start_date").defaultNow(),
  partnershipEndDate: timestamp("partnership_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sponsor analytics tracking
export const sponsorAnalytics = pgTable("sponsor_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").notNull().references(() => sponsors.id),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  teacherRewardsProvided: integer("teacher_rewards_provided").default(0),
  studentRewardsProvided: integer("student_rewards_provided").default(0),
  totalSpent: integer("total_spent").default(0), // Amount in cents
  teacherEngagement: integer("teacher_engagement").default(0), // Number of teachers reached
  brandImpressions: integer("brand_impressions").default(0), // Number of times brand was seen
  communityImpact: integer("community_impact").default(0), // Kindness posts influenced
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Corporate accounts for workplace wellness
export const corporateAccounts = pgTable("corporate_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  companyLogo: text("company_logo"),
  domain: varchar("domain", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }),
  subscriptionTier: varchar("subscription_tier", { length: 50 }),
  maxEmployees: integer("max_employees"),
  monthlyBudget: integer("monthly_budget"),
  primaryColor: varchar("primary_color", { length: 7 }),
  contactEmail: varchar("contact_email", { length: 200 }),
  contactName: varchar("contact_name", { length: 200 }),
  enrollmentCode: varchar("enrollment_code", { length: 50 }).unique(),
  requiresEnrollmentCode: integer("requires_enrollment_code").default(1),
  communityCode: varchar("community_code", { length: 50 }),
  isActive: integer("is_active").default(1),
  billingStatus: varchar("billing_status", { length: 50 }),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const corporateEmployees = pgTable("corporate_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  department: varchar("department", { length: 100 }),
  role: varchar("role", { length: 100 }),
  isActive: integer("is_active").default(1),
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const corporateTeams = pgTable("corporate_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  teamName: varchar("team_name", { length: 200 }).notNull(),
  teamDescription: text("team_description"),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const corporateChallenges = pgTable("corporate_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const corporateAnalytics = pgTable("corporate_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateAccountId: varchar("corporate_account_id").notNull(),
  metricType: varchar("metric_type", { length: 100 }),
  metricValue: integer("metric_value"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parental consent records for COPPA compliance
export const parentalConsentRecords = pgTable("parental_consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentAccountId: varchar("student_account_id").notNull(),
  parentConsentRequestId: varchar("parent_consent_request_id"),
  schoolId: varchar("school_id").notNull(),
  consentVersion: varchar("consent_version", { length: 10 }),
  parentName: varchar("parent_name", { length: 200 }),
  parentEmail: varchar("parent_email", { length: 200 }),
  parentPhone: varchar("parent_phone", { length: 20 }),
  relationshipToStudent: varchar("relationship_to_student", { length: 50 }),
  consentStatus: varchar("consent_status", { length: 20 }).default("pending"),
  consentSubmittedAt: timestamp("consent_submitted_at"),
  consentApprovedAt: timestamp("consent_approved_at"),
  consentRevokedAt: timestamp("consent_revoked_at"),
  verificationMethod: varchar("verification_method", { length: 50 }),
  linkExpiresAt: timestamp("link_expires_at"),
  recordCreatedAt: timestamp("record_created_at").defaultNow(),
  recordUpdatedAt: timestamp("record_updated_at").defaultNow(),
  isImmutable: integer("is_immutable").default(0),
  digitalSignatureHash: varchar("digital_signature_hash", { length: 200 }),
  signerFullName: varchar("signer_full_name", { length: 200 }),
  signatureTimestamp: timestamp("signature_timestamp"),
  renewalDueAt: timestamp("renewal_due_at"),
  lastUpdatedBy: varchar("last_updated_by", { length: 200 }),
});

export const parentalConsentRequests = pgTable("parental_consent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentAccountId: varchar("student_account_id").notNull(),
  schoolId: varchar("school_id").notNull(),
  requestType: varchar("request_type", { length: 20 }),
  parentEmail: varchar("parent_email", { length: 200 }),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tokens: one(userTokens),
  posts: many(kindnessPosts),
  hearts: many(heartReactions),
  echoes: many(echoReactions),
  achievements: many(userAchievements),
  supportPosts: many(supportPosts),
  supportResponses: many(supportResponses),
  helpfulReactions: many(helpfulReactions),
  wellnessCheckins: many(wellnessCheckins),
  rewardRedemptions: many(rewardRedemptions),
  communityServiceLogs: many(communityServiceLogs),
  challengeCompletions: many(challengeCompletions),
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  posts: many(kindnessPosts),
  fundraisingCampaigns: many(fundraisingCampaigns),
}));

export const kindnessPostsRelations = relations(kindnessPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [kindnessPosts.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [kindnessPosts.schoolId],
    references: [schools.id],
  }),
  hearts: many(heartReactions),
  echoes: many(echoReactions),
}));

export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
}));

export const rewardPartnersRelations = relations(rewardPartners, ({ many }) => ({
  offers: many(rewardOffers),
}));

export const rewardOffersRelations = relations(rewardOffers, ({ one, many }) => ({
  partner: one(rewardPartners, {
    fields: [rewardOffers.partnerId],
    references: [rewardPartners.id],
  }),
  redemptions: many(rewardRedemptions),
}));

export const rewardRedemptionsRelations = relations(rewardRedemptions, ({ one }) => ({
  user: one(users, {
    fields: [rewardRedemptions.userId],
    references: [users.id],
  }),
  offer: one(rewardOffers, {
    fields: [rewardRedemptions.offerId],
    references: [rewardOffers.id],
  }),
}));

export const communityServiceLogsRelations = relations(communityServiceLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [communityServiceLogs.userId],
    references: [users.id],
  }),
  verifications: many(communityServiceVerifications),
}));

export const communityServiceVerificationsRelations = relations(communityServiceVerifications, ({ one }) => ({
  serviceLog: one(communityServiceLogs, {
    fields: [communityServiceVerifications.serviceLogId],
    references: [communityServiceLogs.id],
  }),
}));

export const fundraisingCampaignsRelations = relations(fundraisingCampaigns, ({ one, many }) => ({
  school: one(schools, {
    fields: [fundraisingCampaigns.schoolId],
    references: [schools.id],
  }),
  creator: one(users, {
    fields: [fundraisingCampaigns.createdBy],
    references: [users.id],
  }),
  donations: many(fundraisingDonations),
}));

export const fundraisingDonationsRelations = relations(fundraisingDonations, ({ one }) => ({
  campaign: one(fundraisingCampaigns, {
    fields: [fundraisingDonations.campaignId],
    references: [fundraisingCampaigns.id],
  }),
}));

export const surpriseGiveawayCampaignsRelations = relations(surpriseGiveawayCampaigns, ({ one, many }) => ({
  partner: one(rewardPartners, {
    fields: [surpriseGiveawayCampaigns.partnerId],
    references: [rewardPartners.id],
  }),
  winners: many(surpriseGiveawayWinners),
}));

export const surpriseGiveawayWinnersRelations = relations(surpriseGiveawayWinners, ({ one }) => ({
  campaign: one(surpriseGiveawayCampaigns, {
    fields: [surpriseGiveawayWinners.campaignId],
    references: [surpriseGiveawayCampaigns.id],
  }),
}));

export const teacherRewardsRelations = relations(teacherRewards, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherRewards.teacherId],
    references: [users.id],
  }),
  sponsor: one(sponsors, {
    fields: [teacherRewards.sponsorId],
    references: [sponsors.id],
  }),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  rewards: many(teacherRewards),
  analytics: many(sponsorAnalytics),
}));

export const sponsorAnalyticsRelations = relations(sponsorAnalytics, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [sponsorAnalytics.sponsorId],
    references: [sponsors.id],
  }),
}));

// Insert schemas for form validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKindnessPostSchema = createInsertSchema(kindnessPosts).omit({
  id: true,
  createdAt: true,
  heartsCount: true,
  echoesCount: true,
  sentimentScore: true,
  impactScore: true,
  emotionalUplift: true,
  kindnessCategory: true,
  rippleEffect: true,
  wellnessContribution: true,
  aiConfidence: true,
  aiTags: true,
  analyzedAt: true,
});

export const insertBrandChallengeSchema = createInsertSchema(brandChallenges).omit({
  id: true,
  createdAt: true,
  completionCount: true,
});

export const insertSupportPostSchema = createInsertSchema(supportPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
});

export const insertSupportResponseSchema = createInsertSchema(supportResponses).omit({
  id: true,
  createdAt: true,
  helpfulCount: true,
});

export const insertWellnessCheckinSchema = createInsertSchema(wellnessCheckins).omit({
  id: true,
  createdAt: true,
});

// Badge system insert schemas
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  awardedAt: true,
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitions).omit({
  createdAt: true,
});

export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  studentCount: true,
  teacherCount: true,
  kindnessPostsCount: true,
});

export const insertStudentAccountSchema = createInsertSchema(studentAccounts).omit({
  id: true,
});

export const insertRewardPartnerSchema = createInsertSchema(rewardPartners).omit({
  id: true,
  createdAt: true,
});

export const insertRewardOfferSchema = createInsertSchema(rewardOffers).omit({
  id: true,
  createdAt: true,
  currentRedemptions: true,
});

export const insertCommunityServiceLogSchema = createInsertSchema(communityServiceLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tokensEarned: true,
});

export const insertCommunityServiceVerificationSchema = createInsertSchema(communityServiceVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertStudentServiceSummarySchema = createInsertSchema(studentServiceSummaries).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertCoppaConsentSchema = createInsertSchema(coppaConsent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundraisingCampaignSchema = createInsertSchema(fundraisingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAmount: true,
  donorCount: true,
});

export const insertFundraisingDonationSchema = createInsertSchema(fundraisingDonations).omit({
  id: true,
  createdAt: true,
});

export const insertTeacherRewardSchema = createInsertSchema(teacherRewards).omit({
  id: true,
  earnedAt: true,
});

export const insertTeacherRewardCriteriaSchema = createInsertSchema(teacherRewardCriteria).omit({
  id: true,
  createdAt: true,
});

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentSpent: true,
});

export const insertSponsorAnalyticsSchema = createInsertSchema(sponsorAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertUserTokensSchema = createInsertSchema(userTokens).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type KindnessPost = typeof kindnessPosts.$inferSelect;
export type InsertKindnessPost = z.infer<typeof insertKindnessPostSchema>;

export type BrandChallenge = typeof brandChallenges.$inferSelect;
export type InsertBrandChallenge = z.infer<typeof insertBrandChallengeSchema>;

export type SupportPost = typeof supportPosts.$inferSelect;
export type InsertSupportPost = z.infer<typeof insertSupportPostSchema>;

export type SupportResponse = typeof supportResponses.$inferSelect;
export type InsertSupportResponse = z.infer<typeof insertSupportResponseSchema>;

export type WellnessCheckin = typeof wellnessCheckins.$inferSelect;
export type InsertWellnessCheckin = z.infer<typeof insertWellnessCheckinSchema>;

export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;

export type StudentAccount = typeof studentAccounts.$inferSelect;
export type InsertStudentAccount = z.infer<typeof insertStudentAccountSchema>;

export type RewardPartner = typeof rewardPartners.$inferSelect;
export type InsertRewardPartner = z.infer<typeof insertRewardPartnerSchema>;

export type RewardOffer = typeof rewardOffers.$inferSelect;
export type InsertRewardOffer = z.infer<typeof insertRewardOfferSchema>;

export type RewardRedemption = typeof rewardRedemptions.$inferSelect;

export type CommunityServiceLog = typeof communityServiceLogs.$inferSelect;
export type InsertCommunityServiceLog = z.infer<typeof insertCommunityServiceLogSchema>;

export type CommunityServiceVerification = typeof communityServiceVerifications.$inferSelect;
export type InsertCommunityServiceVerification = z.infer<typeof insertCommunityServiceVerificationSchema>;

export type StudentServiceSummary = typeof studentServiceSummaries.$inferSelect;
export type InsertStudentServiceSummary = z.infer<typeof insertStudentServiceSummarySchema>;

export type CoppaConsent = typeof coppaConsent.$inferSelect;
export type InsertCoppaConsent = z.infer<typeof insertCoppaConsentSchema>;

export type FundraisingCampaign = typeof fundraisingCampaigns.$inferSelect;
export type InsertFundraisingCampaign = z.infer<typeof insertFundraisingCampaignSchema>;

export type FundraisingDonation = typeof fundraisingDonations.$inferSelect;
export type InsertFundraisingDonation = z.infer<typeof insertFundraisingDonationSchema>;

export type TeacherReward = typeof teacherRewards.$inferSelect;
export type InsertTeacherReward = z.infer<typeof insertTeacherRewardSchema>;

export type TeacherRewardCriteria = typeof teacherRewardCriteria.$inferSelect;
export type InsertTeacherRewardCriteria = z.infer<typeof insertTeacherRewardCriteriaSchema>;

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;

export type SponsorAnalytics = typeof sponsorAnalytics.$inferSelect;
export type InsertSponsorAnalytics = z.infer<typeof insertSponsorAnalyticsSchema>;

export type UserTokens = typeof userTokens.$inferSelect;
export type InsertUserTokens = z.infer<typeof insertUserTokensSchema>;

export type SurpriseGiveawayCampaign = typeof surpriseGiveawayCampaigns.$inferSelect;
export type SurpriseGiveawayWinner = typeof surpriseGiveawayWinners.$inferSelect;

export type SummerChallenge = typeof summerChallenges.$inferSelect;
export type SummerChallengeCompletion = typeof summerChallengeCompletions.$inferSelect;

export type FamilyChallenge = typeof familyChallenges.$inferSelect;
export type FamilyChallengeCompletion = typeof familyChallengeCompletions.$inferSelect;

export type SchoolYearChallenge = typeof schoolYearChallenges.$inferSelect;
export type SchoolYearChallengeEngagement = typeof schoolYearChallengeEngagement.$inferSelect;

export type MentorBadge = typeof mentorBadges.$inferSelect;
export type MentorBadgeAward = typeof mentorBadgeAwards.$inferSelect;
export type MentorTraining = typeof mentorTraining.$inferSelect;
export type MentorScenario = typeof mentorScenarios.$inferSelect;
export type MentorScenarioResponse = typeof mentorScenarioResponses.$inferSelect;
export type MentorConversation = typeof mentorConversations.$inferSelect;
export type MentorCertification = typeof mentorCertifications.$inferSelect;

export type CorporateAccount = typeof corporateAccounts.$inferSelect;
export type InsertCorporateAccount = typeof corporateAccounts.$inferInsert;
export type CorporateEmployee = typeof corporateEmployees.$inferSelect;
export type InsertCorporateEmployee = typeof corporateEmployees.$inferInsert;
export type CorporateTeam = typeof corporateTeams.$inferSelect;
export type InsertCorporateTeam = typeof corporateTeams.$inferInsert;
export type CorporateChallenge = typeof corporateChallenges.$inferSelect;
export type InsertCorporateChallenge = typeof corporateChallenges.$inferInsert;
export type CorporateAnalytics = typeof corporateAnalytics.$inferSelect;
export type InsertCorporateAnalytics = typeof corporateAnalytics.$inferInsert;

export type ParentalConsentRecord = typeof parentalConsentRecords.$inferSelect;
export type InsertParentalConsentRecord = typeof parentalConsentRecords.$inferInsert;
export type ParentalConsentRequest = typeof parentalConsentRequests.$inferSelect;
export type InsertParentalConsentRequest = typeof parentalConsentRequests.$inferInsert;

// ============================================================================
// AI BEHAVIORAL MITIGATION & DOCUMENTATION SYSTEM (Strategic Pivot)
// ============================================================================

// Content Moderation Queue - Human-reviewed flagged content (NO automatic alerts)
export const contentModerationQueue = pgTable("content_moderation_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id"), // Reference to kindness_posts or support_posts
  postType: varchar("post_type", { length: 20 }).notNull(), // 'kindness' | 'support'
  content: text("content").notNull(),
  schoolId: varchar("school_id").notNull(),
  userId: varchar("user_id"), // Optional - may be anonymous
  
  // AI Classification (NOT crisis intervention - just categorization)
  moderationCategory: varchar("moderation_category", { length: 50 }).notNull(), // 'profanity', 'negative_sentiment', 'concerning_pattern', 'policy_violation'
  severityLevel: varchar("severity_level", { length: 20 }).notNull(), // 'low', 'medium', 'high' (NO 'critical' or 'crisis')
  detectedPatterns: jsonb("detected_patterns"), // Anonymized behavioral patterns
  aiConfidence: integer("ai_confidence"), // 0-100
  
  // Human Review Workflow
  reviewStatus: varchar("review_status", { length: 20 }).default("pending").notNull(), // pending, in_review, approved, blocked, escalated
  reviewedBy: varchar("reviewed_by"), // Teacher/admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken", { length: 50 }), // 'approved', 'blocked', 'edited', 'parent_notified', 'counselor_referred'
  
  flaggedAt: timestamp("flagged_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Behavioral Trend Analytics - Aggregate school-wide patterns (NO individual targeting)
export const behavioralTrendAnalytics = pgTable("behavioral_trend_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  
  // Time Period
  periodType: varchar("period_type", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Aggregate Metrics (NO individual student data)
  totalPosts: integer("total_posts").default(0).notNull(),
  flaggedContentCount: integer("flagged_content_count").default(0).notNull(),
  
  // Sentiment Aggregates
  avgPositivityScore: real("avg_positivity_score"), // 0-100 average across all posts
  negativeContentPercentage: real("negative_content_percentage"), // % of posts with negative sentiment
  sentimentTrend: varchar("sentiment_trend", { length: 20 }), // 'improving', 'declining', 'stable'
  
  // Pattern Detection (Aggregate only)
  topConcernCategories: jsonb("top_concern_categories"), // ['profanity', 'bullying_language', etc.] - aggregated
  emergingPatterns: jsonb("emerging_patterns"), // Detected behavioral patterns at school level
  
  // Comparison to Previous Period
  postCountChange: real("post_count_change"), // % change from previous period
  sentimentScoreChange: real("sentiment_score_change"), // Change in sentiment
  flaggedContentChange: real("flagged_content_change"), // Change in flagged content %
  
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// Climate Metrics - School-wide behavioral health monitoring (Aggregate only, NO predictions)
export const climateMetrics = pgTable("climate_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  
  // Time Context
  metricDate: timestamp("metric_date").notNull(),
  gradeLevel: varchar("grade_level", { length: 5 }), // Optional grade-level breakdown (still aggregate)
  
  // Overall Climate Indicators (School-wide)
  overallClimateScore: integer("overall_climate_score"), // 0-100 aggregate wellness
  participationRate: real("participation_rate"), // % of students posting
  positiveInteractionRate: real("positive_interaction_rate"), // % of posts with hearts/echoes
  
  // Behavioral Safety Indicators (Aggregate patterns, NO crisis detection)
  contentSafetyScore: integer("content_safety_score"), // 0-100 (higher = safer content)
  policyViolationRate: real("policy_violation_rate"), // % of posts requiring moderation
  concerningPatternCount: integer("concerning_pattern_count"), // Count of behavioral patterns (NOT individual crises)
  
  // Engagement Patterns
  avgDailyPosts: real("avg_daily_posts"),
  peakActivityHours: jsonb("peak_activity_hours"), // [14, 15, 16] - hours with most activity
  
  // Trend Indicators (Comparative analysis)
  weekOverWeekChange: real("week_over_week_change"), // % change in overall climate
  monthOverMonthChange: real("month_over_month_change"),
  
  // Recommended Actions (System-level, NOT individual interventions)
  recommendedFocus: jsonb("recommended_focus"), // ['increase_positive_content', 'review_policy_clarity', etc.]
  
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// =======================================
// KINDNESS CONNECT - Service Hour Opportunities
// =======================================

// Service Opportunities - Real local volunteer opportunities for students
export const serviceOpportunities = pgTable("service_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Organization Info
  organizationName: varchar("organization_name", { length: 200 }).notNull(),
  location: varchar("location", { length: 200 }).notNull(), // City/Area
  address: text("address"), // Full street address
  geoLat: real("geo_lat"), // For distance calculations
  geoLong: real("geo_long"),
  
  // Opportunity Details
  title: varchar("title", { length: 200 }).notNull(), // e.g., "Food Drive Volunteer"
  description: text("description").notNull(), // What students will do
  category: varchar("category", { length: 50 }).notNull(), // hunger_relief, animal_welfare, environment, literacy, etc.
  serviceType: varchar("service_type", { length: 100 }).notNull(), // e.g., "Food sorting and packing"
  studentRole: text("student_role").notNull(), // What the student does (e.g., "Sort donations, stock shelves")
  
  // Requirements & Logistics
  minAge: integer("min_age"), // Minimum age requirement (e.g., 16 for Habitat)
  maxParticipants: integer("max_participants"), // Capacity limit (optional)
  hoursOffered: real("hours_offered"), // Typical hours earned per session
  isRecurring: integer("is_recurring").default(0).notNull(), // 1 = recurring, 0 = one-time
  schedule: text("schedule"), // e.g., "Saturdays 9am-12pm" or "Flexible"
  deadline: timestamp("deadline"), // Sign-up deadline (optional)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Contact & Verification
  contactName: varchar("contact_name", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  verificationMethod: varchar("verification_method", { length: 50 }).default("photo").notNull(), // photo, supervisor_signature, both
  
  // School & Access
  schoolId: varchar("school_id"), // Specific school or null for county-wide
  radiusMiles: real("radius_miles").default(15), // Max distance from school
  
  // Status
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, paused, completed, cancelled
  featured: integer("featured").default(0).notNull(), // 1 = show at top of list
  
  // Tracking
  totalSignups: integer("total_signups").default(0).notNull(),
  totalCompleted: integer("total_completed").default(0).notNull(),
  totalHoursGenerated: real("total_hours_generated").default(0).notNull(),
  
  // Metadata
  createdBy: varchar("created_by").notNull(), // Teacher/admin user ID
  updatedBy: varchar("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Service Opportunity Signups - Track student interest and participation
export const serviceOpportunitySignups = pgTable("service_opportunity_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  opportunityId: varchar("opportunity_id").notNull().references(() => serviceOpportunities.id),
  studentUserId: varchar("student_user_id").notNull().references(() => users.id),
  
  // Signup Status
  status: varchar("status", { length: 20 }).default("interested").notNull(), // interested, confirmed, completed, cancelled
  signupNotes: text("signup_notes"), // Student can add notes/questions
  
  // Completion Tracking
  hoursCompleted: real("hours_completed"), // Actual hours completed
  completionDate: timestamp("completion_date"),
  serviceLogId: varchar("service_log_id").references(() => communityServiceLogs.id), // Link to verified hours
  
  // Admin Notes
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student Notification Preferences - Daily encouragement opt-in/opt-out
export const studentNotificationPreferences = pgTable("student_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  
  // Daily Encouragement Settings
  dailyEncouragementEnabled: integer("daily_encouragement_enabled").default(1).notNull(), // 1 = enabled, 0 = disabled
  notificationFrequency: varchar("notification_frequency", { length: 20 }).default("digest").notNull(), // digest, milestones, immediate, off
  preferredTime: varchar("preferred_time", { length: 5 }).default("07:30").notNull(), // HH:MM format (24-hour) - 07:30 or 15:30 for digest windows
  timezone: varchar("timezone", { length: 50 }).default("America/New_York").notNull(),
  
  // Delivery Methods
  pushNotificationsEnabled: integer("push_notifications_enabled").default(0).notNull(),
  emailNotificationsEnabled: integer("email_notifications_enabled").default(1).notNull(), // Email-first for FERPA compliance
  
  // Milestone Tracking (prevent duplicate notifications)
  lastTokenMilestoneNotified: integer("last_token_milestone_notified").default(0).notNull(), // Last milestone notified (0, 100, 500, 1000)
  lastStreakMilestoneNotified: integer("last_streak_milestone_notified").default(0).notNull(), // Last streak notified (0, 3, 7, 30)
  
  // Tracking
  lastNotificationSent: timestamp("last_notification_sent"),
  totalNotificationsSent: integer("total_notifications_sent").default(0).notNull(),
  totalNotificationsOpened: integer("total_notifications_opened").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student Notifications - History of sent notifications
export const studentNotifications = pgTable("student_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Notification Content
  type: varchar("type", { length: 50 }).notNull(), // service_approved, token_milestone, streak_achievement, reward_status, ipard_bonus, daily_encouragement
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  payload: jsonb("payload"), // Additional context data (serviceId, tokens, etc.)
  
  // Delivery Info
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, sent, failed, read
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull(), // email, push
  emailTo: varchar("email_to"),
  
  // Digest Batching
  digestBatchId: varchar("digest_batch_id"), // Groups notifications into digest emails
  isDigest: integer("is_digest").default(0).notNull(), // 1 if part of digest batch, 0 if immediate
  
  // Tracking
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student Notification Events Queue - Pending notifications to be processed
export const studentNotificationEvents = pgTable("student_notification_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Event Details
  eventType: varchar("event_type", { length: 50 }).notNull(), // service_approved, token_earned, streak_increased, reward_updated, ipard_completed
  priority: varchar("priority", { length: 20 }).default("normal").notNull(), // urgent, normal, low
  payload: jsonb("payload").notNull(), // Event-specific data
  
  // Processing Status
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, processed, failed
  processedAt: timestamp("processed_at"),
  notificationId: varchar("notification_id").references(() => studentNotifications.id), // Link to created notification
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student Goals - Personal goal-setting and progress tracking
export const studentGoals = pgTable("student_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id").notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // kindness_acts, service_hours, streak, helping_others, custom
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  targetValue: integer("target_value").notNull(), // Numeric target
  currentValue: integer("current_value").default(0).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // acts, hours, days, people
  startDate: timestamp("start_date").defaultNow().notNull(),
  targetDate: timestamp("target_date").notNull(),
  status: varchar("status", { length: 20 }).default("in_progress").notNull(), // in_progress, completed, abandoned
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// v2.0: School Inclusion Scores - Real-time school climate and belonging metric (0-100)
export const schoolInclusionScores = pgTable("school_inclusion_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  score: integer("score").notNull(), // 0-100 composite score
  componentBreakdown: jsonb("component_breakdown").notNull(), // { participation: 28, diversity: 12, sentiment: 18, serviceVelocity: 13, engagement: 14 }
  qualitativeBand: varchar("qualitative_band", { length: 20 }).notNull(), // needs_action, watch, healthy, thriving
  participationRate: decimal("participation_rate", { precision: 5, scale: 2 }), // % of active students posting
  kindnessDiversityScore: decimal("kindness_diversity_score", { precision: 5, scale: 2 }), // Entropy measure
  positiveClimateScore: decimal("positive_climate_score", { precision: 5, scale: 2 }), // Positive vs concerning posts
  serviceCompletionRate: decimal("service_completion_rate", { precision: 5, scale: 2 }), // Verified hours vs pace
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }), // Token redemptions + events
  activeStudentCount: integer("active_student_count").default(0),
  totalKindnessPosts: integer("total_kindness_posts").default(0),
  topInclusionActs: jsonb("top_inclusion_acts"), // Array of {category, count} for dashboard display
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  cacheExpiresAt: timestamp("cache_expires_at"), // 15-minute TTL for caching
});

// v2.0: School Inclusion Trend Daily - Historical snapshots for trend analysis
export const schoolInclusionTrendDaily = pgTable("school_inclusion_trend_daily", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  date: timestamp("date").notNull(), // Daily snapshot date
  score: integer("score").notNull(), // 0-100 score for that day
  componentBreakdown: jsonb("component_breakdown").notNull(),
  qualitativeBand: varchar("qualitative_band", { length: 20 }).notNull(),
  weekDelta: integer("week_delta"), // Change from 7 days ago
  monthDelta: integer("month_delta"), // Change from 30 days ago
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertContentModerationQueueSchema = createInsertSchema(contentModerationQueue).omit({ id: true, flaggedAt: true, createdAt: true });
export const insertBehavioralTrendAnalyticsSchema = createInsertSchema(behavioralTrendAnalytics).omit({ id: true, generatedAt: true });
export const insertClimateMetricsSchema = createInsertSchema(climateMetrics).omit({ id: true, calculatedAt: true });
export const insertServiceOpportunitySchema = createInsertSchema(serviceOpportunities).omit({ id: true, createdAt: true, updatedAt: true, totalSignups: true, totalCompleted: true, totalHoursGenerated: true });
export const insertServiceOpportunitySignupSchema = createInsertSchema(serviceOpportunitySignups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudentNotificationPreferencesSchema = createInsertSchema(studentNotificationPreferences).omit({ id: true, createdAt: true, updatedAt: true, lastNotificationSent: true, totalNotificationsSent: true, totalNotificationsOpened: true }).extend({
  notificationFrequency: z.enum(['digest', 'milestones', 'immediate', 'off']).default('digest'),
  preferredTime: z.string().regex(/^(07:30|15:30)$/),  // Only allow 7:30am or 3:30pm digest windows
  emailNotificationsEnabled: z.number().int().min(0).max(1),
  pushNotificationsEnabled: z.number().int().min(0).max(1),
});

export const insertStudentNotificationSchema = createInsertSchema(studentNotifications).omit({ id: true, createdAt: true, sentAt: true, readAt: true }).extend({
  type: z.enum(['service_approved', 'token_milestone', 'streak_achievement', 'reward_status', 'ipard_bonus', 'daily_encouragement']),
  status: z.enum(['pending', 'sent', 'failed', 'read']).default('pending'),
  deliveryMethod: z.enum(['email', 'push']),
  isDigest: z.number().int().min(0).max(1).default(0),
});

export const insertStudentNotificationEventSchema = createInsertSchema(studentNotificationEvents).omit({ id: true, createdAt: true, processedAt: true }).extend({
  eventType: z.enum(['service_approved', 'token_earned', 'streak_increased', 'reward_updated', 'ipard_completed']),
  priority: z.enum(['urgent', 'normal', 'low']).default('normal'),
  status: z.enum(['pending', 'processed', 'failed']).default('pending'),
});
export const insertStudentGoalSchema = createInsertSchema(studentGoals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrincipalBlogPostSchema = createInsertSchema(principalBlogPosts).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export const insertParentCommunityPostSchema = createInsertSchema(parentCommunityPosts).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true, commentsCount: true });
export const insertSchoolInclusionScoreSchema = createInsertSchema(schoolInclusionScores).omit({ id: true, computedAt: true });
export const insertSchoolInclusionTrendDailySchema = createInsertSchema(schoolInclusionTrendDaily).omit({ id: true, createdAt: true });

// v2.1 Insert Schemas
export const insertIpardPhaseEventSchema = createInsertSchema(ipardPhaseEvents).omit({ id: true, createdAt: true });
export const insertReflectionSkillSchema = createInsertSchema(reflectionSkills);
export const insertReflectionTraitSchema = createInsertSchema(reflectionTraits);
export const insertCommunityServiceLogSkillSchema = createInsertSchema(communityServiceLogSkills).omit({ id: true, createdAt: true });
export const insertCommunityServiceLogTraitSchema = createInsertSchema(communityServiceLogTraits).omit({ id: true, createdAt: true });
export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({ id: true, createdAt: true });
export const insertAdminRewardSchema = createInsertSchema(adminRewards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminRewardRedemptionSchema = createInsertSchema(adminRewardRedemptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCharacterExcellenceAwardSchema = createInsertSchema(characterExcellenceAwards).omit({ id: true, awardedAt: true });

// ============================================
// HEART-LINK & PULSE CHECK SYSTEM (v2.2)
// ============================================

// Pulse Check - Anonymous daily wellness rating
export const pulseChecks = pgTable("pulse_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Nullable for anonymous/demo users
  schoolId: varchar("school_id"),
  supportScore: integer("support_score").notNull(), // 1-5 scale: "How supported do you feel?"
  isAnonymous: integer("is_anonymous").default(1).notNull(),
  anonTrackingId: varchar("anon_tracking_id"), // For tracking demo/anonymous users without FK
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPulseCheckSchema = createInsertSchema(pulseChecks).omit({ id: true, createdAt: true });
export type PulseCheck = typeof pulseChecks.$inferSelect;
export type InsertPulseCheck = z.infer<typeof insertPulseCheckSchema>;

// Crisis alerts - Triggered when student shows consistent low scores
export const crisisAlerts = pgTable("crisis_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Nullable for anonymous/demo users
  schoolId: varchar("school_id"),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'low_pulse_threshold', 'manual_referral'
  triggerCount: integer("trigger_count").default(3).notNull(), // Number of low scores that triggered this
  isResolved: integer("is_resolved").default(0).notNull(),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  anonTrackingId: varchar("anon_tracking_id"), // For tracking demo/anonymous users without FK
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrisisAlertSchema = createInsertSchema(crisisAlerts).omit({ id: true, createdAt: true });
export type CrisisAlert = typeof crisisAlerts.$inferSelect;
export type InsertCrisisAlert = z.infer<typeof insertCrisisAlertSchema>;

// Type Exports
export type ContentModerationQueue = typeof contentModerationQueue.$inferSelect;
export type InsertContentModerationQueue = z.infer<typeof insertContentModerationQueueSchema>;
export type BehavioralTrendAnalytics = typeof behavioralTrendAnalytics.$inferSelect;
export type InsertBehavioralTrendAnalytics = z.infer<typeof insertBehavioralTrendAnalyticsSchema>;
export type ClimateMetrics = typeof climateMetrics.$inferSelect;
export type InsertClimateMetrics = z.infer<typeof insertClimateMetricsSchema>;
export type ServiceOpportunity = typeof serviceOpportunities.$inferSelect;
export type InsertServiceOpportunity = z.infer<typeof insertServiceOpportunitySchema>;
export type ServiceOpportunitySignup = typeof serviceOpportunitySignups.$inferSelect;
export type InsertServiceOpportunitySignup = z.infer<typeof insertServiceOpportunitySignupSchema>;
export type StudentNotificationPreferences = typeof studentNotificationPreferences.$inferSelect;
export type InsertStudentNotificationPreferences = z.infer<typeof insertStudentNotificationPreferencesSchema>;
export type StudentNotification = typeof studentNotifications.$inferSelect;
export type InsertStudentNotification = z.infer<typeof insertStudentNotificationSchema>;
export type StudentNotificationEvent = typeof studentNotificationEvents.$inferSelect;
export type InsertStudentNotificationEvent = z.infer<typeof insertStudentNotificationEventSchema>;
export type StudentGoal = typeof studentGoals.$inferSelect;
export type InsertStudentGoal = z.infer<typeof insertStudentGoalSchema>;
export type PrincipalBlogPost = typeof principalBlogPosts.$inferSelect;
export type InsertPrincipalBlogPost = z.infer<typeof insertPrincipalBlogPostSchema>;
export type ParentCommunityPost = typeof parentCommunityPosts.$inferSelect;
export type InsertParentCommunityPost = z.infer<typeof insertParentCommunityPostSchema>;
export type SchoolInclusionScore = typeof schoolInclusionScores.$inferSelect;
export type InsertSchoolInclusionScore = z.infer<typeof insertSchoolInclusionScoreSchema>;
export type SchoolInclusionTrendDaily = typeof schoolInclusionTrendDaily.$inferSelect;
export type InsertSchoolInclusionTrendDaily = z.infer<typeof insertSchoolInclusionTrendDailySchema>;

// v2.1 Type Exports
export type IpardPhaseEvent = typeof ipardPhaseEvents.$inferSelect;
export type InsertIpardPhaseEvent = z.infer<typeof insertIpardPhaseEventSchema>;
export type ReflectionSkill = typeof reflectionSkills.$inferSelect;
export type InsertReflectionSkill = z.infer<typeof insertReflectionSkillSchema>;
export type ReflectionTrait = typeof reflectionTraits.$inferSelect;
export type InsertReflectionTrait = z.infer<typeof insertReflectionTraitSchema>;
export type CommunityServiceLogSkill = typeof communityServiceLogSkills.$inferSelect;
export type InsertCommunityServiceLogSkill = z.infer<typeof insertCommunityServiceLogSkillSchema>;
export type CommunityServiceLogTrait = typeof communityServiceLogTraits.$inferSelect;
export type InsertCommunityServiceLogTrait = z.infer<typeof insertCommunityServiceLogTraitSchema>;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;
export type AdminReward = typeof adminRewards.$inferSelect;
export type InsertAdminReward = z.infer<typeof insertAdminRewardSchema>;
export type AdminRewardRedemption = typeof adminRewardRedemptions.$inferSelect;
export type InsertAdminRewardRedemption = z.infer<typeof insertAdminRewardRedemptionSchema>;
export type CharacterExcellenceAward = typeof characterExcellenceAwards.$inferSelect;
export type InsertCharacterExcellenceAward = z.infer<typeof insertCharacterExcellenceAwardSchema>;

// ============================================================================
// SPRING SPRINT 2026 - LEADERSHIP CERTIFICATE TRACK
// ============================================================================

// Leadership Track Progress - Separate from mentor training to avoid caching issues
export const leadershipTrackProgress = pgTable("leadership_track_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schoolId: varchar("school_id"),
  
  // Pillar 1: Core Leadership Training (5 modules)
  module1Complete: integer("module1_complete").default(0), // The Power of One
  module2Complete: integer("module2_complete").default(0), // Self-Awareness
  module3Complete: integer("module3_complete").default(0), // Effective Communication
  module4Complete: integer("module4_complete").default(0), // Team Leadership
  module5Complete: integer("module5_complete").default(0), // Community Impact
  trainingCompletedAt: timestamp("training_completed_at"),
  personalReflection: text("personal_reflection"), // 250-word reflection after completing modules
  
  // Pillar 2: Impact Quests (4 verified community service acts)
  verifiedQuestsCount: integer("verified_quests_count").default(0),
  hasMiddleSchoolMentoringQuest: integer("has_middle_school_mentoring_quest").default(0), // The Wildcat Rule
  questsCompletedAt: timestamp("quests_completed_at"),
  
  // Pillar 3: Leadership Portfolio Defense
  portfolioDefenseStatus: varchar("portfolio_defense_status", { length: 20 }).default("not_started"), // not_started, scheduled, completed
  portfolioDefenseApproved: integer("portfolio_defense_approved").default(0),
  portfolioDefenseApprovedBy: varchar("portfolio_defense_approved_by"),
  portfolioDefenseApprovedAt: timestamp("portfolio_defense_approved_at"),
  
  // Overall Progress
  overallProgress: integer("overall_progress").default(0), // 0-100
  isScholarshipFinalist: integer("is_scholarship_finalist").default(0),
  certificateIssuedAt: timestamp("certificate_issued_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leadership Quest Evidence - For image uploads and teacher verification
export const leadershipQuestEvidence = pgTable("leadership_quest_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  serviceLogId: varchar("service_log_id"), // Link to community_service_logs
  
  title: text("title").notNull(),
  description: text("description"),
  questType: varchar("quest_type", { length: 50 }).notNull(), // community_service, middle_school_mentoring, kindness_act
  
  // Evidence
  imageUrl: text("image_url"),
  hasTeacherVerification: integer("has_teacher_verification").default(0),
  verifiedByTeacher: varchar("verified_by_teacher"),
  verifiedAt: timestamp("verified_at"),
  
  // Status
  status: varchar("status", { length: 20 }).default("pending"), // pending, verified, rejected
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadershipTrackProgressSchema = createInsertSchema(leadershipTrackProgress).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeadershipQuestEvidenceSchema = createInsertSchema(leadershipQuestEvidence).omit({ id: true, createdAt: true });

export type LeadershipTrackProgress = typeof leadershipTrackProgress.$inferSelect;
export type InsertLeadershipTrackProgress = z.infer<typeof insertLeadershipTrackProgressSchema>;
export type LeadershipQuestEvidence = typeof leadershipQuestEvidence.$inferSelect;
export type InsertLeadershipQuestEvidence = z.infer<typeof insertLeadershipQuestEvidenceSchema>;