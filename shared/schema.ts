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
