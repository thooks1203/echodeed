import { db } from './db';
import { userBadges, badgeDefinitions, kindnessPosts, users } from '@shared/schema';
import { eq, sql, and, gte, lte, count } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════════════════════
// THE MCNEILL COLLECTION - Eastern Guilford Wildcat Badges
// Modern "level-up" gaming aesthetic with Blue/Gold Wildcat colors
// ═══════════════════════════════════════════════════════════════════════════════
const BADGE_DEFINITIONS = {
  originator: {
    id: 'originator',
    name: 'The Originator',
    description: 'You planted your first seed of kindness!',
    icon: '🌱',
    color: 'green-gold',
    category: 'achievement',
    tier: 'bronze'
  },
  weekly_warrior: {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'You shared 3+ acts of kindness in one week!',
    icon: '🛡️',
    color: 'silver-blue',
    category: 'achievement',
    tier: 'silver'
  },
  grade_hero: {
    id: 'grade_hero',
    name: 'Grade Hero',
    description: 'Your grade had the most kindness posts this month!',
    icon: '👑',
    color: 'gold',
    category: 'recognition',
    tier: 'gold'
  },
  echo_maker: {
    id: 'echo_maker',
    name: 'Echo Maker',
    description: 'Your kindness inspired 5+ echoes from peers!',
    icon: '💫',
    color: 'blue-cyan',
    category: 'achievement',
    tier: 'silver'
  },
  wildcat_legend: {
    id: 'wildcat_legend',
    name: 'Wildcat Legend',
    description: 'Reached 50 deeds or received Principal recognition!',
    icon: '🐾',
    color: 'diamond',
    category: 'legendary',
    tier: 'legendary'
  }
};

export class BadgeService {
  // Get all badges for a user
  async getUserBadges(userId: string) {
    try {
      const badges = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId))
        .orderBy(userBadges.awardedAt);
      return badges;
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  // Get all available badge definitions
  async getBadgeDefinitions() {
    try {
      const definitions = await db
        .select()
        .from(badgeDefinitions)
        .where(eq(badgeDefinitions.isActive, 1))
        .orderBy(badgeDefinitions.sortOrder);
      return definitions;
    } catch (error) {
      console.error('Error getting badge definitions:', error);
      return Object.values(BADGE_DEFINITIONS);
    }
  }

  // Check if user already has a badge
  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badgeId)
      ))
      .limit(1);
    return existing.length > 0;
  }

  // Award a badge to a user
  async awardBadge(userId: string, badgeId: string, metadata?: any): Promise<boolean> {
    try {
      // Check if already has badge
      if (await this.hasBadge(userId, badgeId)) {
        console.log(`User ${userId} already has badge ${badgeId}`);
        return false;
      }

      const badgeDef = BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS];
      if (!badgeDef) {
        console.error(`Unknown badge: ${badgeId}`);
        return false;
      }

      await db.insert(userBadges).values({
        userId,
        badgeId,
        badgeName: badgeDef.name,
        badgeDescription: badgeDef.description,
        badgeIcon: badgeDef.icon,
        badgeColor: badgeDef.color,
        metadata: metadata || null
      });

      console.log(`🏆 Badge awarded: ${badgeDef.name} to user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Check and award "The Originator" badge (first post)
  async checkOriginatorBadge(userId: string): Promise<boolean> {
    try {
      const postCount = await db
        .select({ count: count() })
        .from(kindnessPosts)
        .where(eq(kindnessPosts.userId, userId));
      
      // If this is their first post, award the badge
      if (postCount[0]?.count === 1) {
        return await this.awardBadge(userId, 'originator');
      }
      return false;
    } catch (error) {
      console.error('Error checking originator badge:', error);
      return false;
    }
  }

  // Check and award "Weekly Warrior" badge (3+ posts in a week)
  async checkWeeklyWarriorBadge(userId: string): Promise<boolean> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyPosts = await db
        .select({ count: count() })
        .from(kindnessPosts)
        .where(and(
          eq(kindnessPosts.userId, userId),
          gte(kindnessPosts.createdAt, oneWeekAgo)
        ));

      if (weeklyPosts[0]?.count >= 3) {
        return await this.awardBadge(userId, 'weekly_warrior', {
          weekOf: oneWeekAgo.toISOString()
        });
      }
      return false;
    } catch (error) {
      console.error('Error checking weekly warrior badge:', error);
      return false;
    }
  }

  // Check and award "Echo Maker" badge (post with 5+ echoes)
  async checkEchoMakerBadge(userId: string, postId?: string): Promise<boolean> {
    try {
      // Check if any of the user's posts have 5+ echoes
      const postsWithEchoes = await db
        .select({ id: kindnessPosts.id, echoes: kindnessPosts.echoesCount })
        .from(kindnessPosts)
        .where(and(
          eq(kindnessPosts.userId, userId),
          gte(kindnessPosts.echoesCount, 5)
        ))
        .limit(1);

      if (postsWithEchoes.length > 0) {
        return await this.awardBadge(userId, 'echo_maker', {
          postId: postsWithEchoes[0].id,
          echoes: postsWithEchoes[0].echoes
        });
      }
      return false;
    } catch (error) {
      console.error('Error checking echo maker badge:', error);
      return false;
    }
  }

  // Check and award "Wildcat Legend" badge (50+ total deeds)
  async checkWildcatLegendBadge(userId: string): Promise<boolean> {
    try {
      const postCount = await db
        .select({ count: count() })
        .from(kindnessPosts)
        .where(eq(kindnessPosts.userId, userId));

      if (postCount[0]?.count >= 50) {
        return await this.awardBadge(userId, 'wildcat_legend', {
          totalDeeds: postCount[0].count,
          milestone: '50_deeds'
        });
      }
      return false;
    } catch (error) {
      console.error('Error checking wildcat legend badge:', error);
      return false;
    }
  }

  // Award Wildcat Legend by Principal recognition
  async awardPrincipalRecognition(userId: string, principalName: string): Promise<boolean> {
    return await this.awardBadge(userId, 'wildcat_legend', {
      recognizedBy: principalName,
      milestone: 'principal_recognition',
      awardedAt: new Date().toISOString()
    });
  }

  // Check all badges for a user after a post
  async checkBadgesAfterPost(userId: string): Promise<string[]> {
    const awardedBadges: string[] = [];

    // Check Originator (first post)
    if (await this.checkOriginatorBadge(userId)) {
      awardedBadges.push('originator');
    }

    // Check Weekly Warrior (3+ posts in a week)
    if (await this.checkWeeklyWarriorBadge(userId)) {
      awardedBadges.push('weekly_warrior');
    }

    // Check Wildcat Legend (50+ total deeds)
    if (await this.checkWildcatLegendBadge(userId)) {
      awardedBadges.push('wildcat_legend');
    }

    return awardedBadges;
  }

  // Check Echo Maker after someone echoes a post
  async checkBadgesAfterEcho(postOwnerId: string): Promise<string[]> {
    const awardedBadges: string[] = [];

    if (await this.checkEchoMakerBadge(postOwnerId)) {
      awardedBadges.push('echo_maker');
    }

    return awardedBadges;
  }

  // Monthly job: Award Grade Hero badges
  async awardGradeHeroBadges(schoolId?: string): Promise<void> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get post counts by grade
      const gradeStats = await db
        .select({
          grade: users.grade,
          postCount: count()
        })
        .from(kindnessPosts)
        .innerJoin(users, eq(kindnessPosts.userId, users.id))
        .where(gte(kindnessPosts.createdAt, startOfMonth))
        .groupBy(users.grade)
        .orderBy(sql`count(*) DESC`)
        .limit(1);

      if (gradeStats.length > 0 && gradeStats[0].grade) {
        const topGrade = gradeStats[0].grade;
        console.log(`🏆 Top grade this month: ${topGrade} with ${gradeStats[0].postCount} posts`);

        // Get all users in that grade
        const gradeUsers = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.grade, topGrade));

        // Award badge to all users in top grade
        for (const user of gradeUsers) {
          await this.awardBadge(user.id, 'grade_hero', {
            grade: topGrade,
            month: startOfMonth.toISOString(),
            postCount: gradeStats[0].postCount
          });
        }

        console.log(`🎖️ Awarded Grade Hero to ${gradeUsers.length} students in grade ${topGrade}`);
      }
    } catch (error) {
      console.error('Error awarding grade hero badges:', error);
    }
  }
}

export const badgeService = new BadgeService();
