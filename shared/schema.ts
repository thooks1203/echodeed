import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const kindnessPosts = pgTable("kindness_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  location: text("location").notNull(),
  city: text("city"),
  state: text("state"), 
  country: text("country"),
  heartsCount: integer("hearts_count").default(0).notNull(),
  echoesCount: integer("echoes_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kindnessCounter = pgTable("kindness_counter", {
  id: varchar("id").primaryKey().default("global"),
  count: integer("count").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Anonymous user token tracking (no personal info, just session-based)
export const userTokens = pgTable("user_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().unique(), // Anonymous session ID
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

// Track challenge completions
export const challengeCompletions = pgTable("challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull(),
  sessionId: varchar("session_id").notNull(),
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

// User achievement unlocks
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
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

// Corporate employees (links sessionIds to corporate structure)
export const corporateEmployees = pgTable("corporate_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().unique(), // Links to existing userTokens
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
